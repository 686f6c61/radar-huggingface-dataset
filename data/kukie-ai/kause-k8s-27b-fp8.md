# Kukie-AI/Kause-K8s-27B-FP8

## Resumen

Kause-K8s-27B-FP8 es un ajuste fino (LoRA, ronda 2) del modelo Qwen/Qwen3.8-27B orientado especificamente a la diagnosis de fallos en clústeres de Kubernetes. Lo desarrolla Kukie-AI y su proposito es actuar como un agente de SRE que, ante una pregunta como "por que se reinicia el pod de checkout", investiga el clúster paso a paso mediante herramientas de solo lectura tipo `kubectl` (list, describe, logs, events) y devuelve el objeto raiz del fallo, la categoria de causa, la evidencia citada y comandos de correccion sugeridos.

El modelo tiene 27.781.427.952 parametros (dato real de safetensors), se distribuye en formato FP8 con el mismo esquema de cuantizacion por bloques 128x128 e4m3 que el checkpoint oficial `Qwen/Qwen3.8-27B-FP8`, y esta pensado para servirse en una unica GPU de 48 GB (L40S, RTX 6000 Ada) con vLLM. La longitud de contexto declarada en el script de despliegue es de 65.536 tokens.

Su relevancia actual radica en que aborda un nicho concreto y de alto valor operativo: el diagnostico automatizado de incidentes en Kubernetes con trazabilidad de evidencia. El autor publica una evaluacion con intervalos de confianza y un protocolo de validacion fijado antes del entrenamiento, algo poco habitual en ajustes finos de nicho. La licencia es Apache 2.0 y los idiomas declarados son coreano e ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.8-27B); tag de libreria `qwen3_5` |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 65.536 tokens (segun `--max-model-len` del script de despliegue); entrenado con contexto de 32k |
| Tipos de cuantizacion | FP8 (e4m3, bloques 128x128); el adaptador se entrena en bf16 y se fusiona y recuantiza a FP8 |
| Idiomas soportados | coreano (por defecto, prompts de sistema y explicaciones en coreano), ingles (funciona, sin medicion reportada) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 30,9 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.8-27B en bf16 y se ajusta mediante LoRA con rango 32, alpha 16, aplicado a todas las capas lineales, con tasa de aprendizaje 1e-4, batch 16, 2 epocas (70 pasos), contexto de 32k y 551 conversaciones. El entrenamiento se detuvo en el paso 44 por un chequeo preconfigurado que resulto ser demasiado pequeno (9 problemas); tras re-medir con 60 ejecuciones y no detectar caida, se reanudo desde el adaptador del paso 35 con un optimizador nuevo.

La generacion de datos siguio un pipeline de tres fases. Primero, el modelo base resolvio unas 1.040 escenarios sinteticos de fallo en Kubernetes en clústeres efimeros `kind` mediante un agente de diagnosis de solo lectura, con 3 intentos por escenario y un intento adicional con pista cuando los tres fallaban. Segundo, se filtro conservando solo ejecuciones con causa raiz correcta y en las que el modelo hubiera consultado realmente el objeto causante (o un pod dependiente) citando salida real de herramientas, descartando las que adivinaban; se selecciono una ejecucion por problema, se limitaron las ejecuciones con pista y se eliminaron casi duplicados (dos revisores leyeron 30 muestras y se retiraron 3 registros). Tercero, la fusion a FP8 se realiza con `W' = W_bf16 + (alpha / r)·B·A` por capa adaptada y recuantizacion con el mismo esquema e4m3 por bloques 128x128 del checkpoint oficial; los tensores no tocados se copian byte a byte.

Los datos de entrenamiento y el generador de escenarios no se publican. Los problemas de evaluacion se excluyeron del entrenamiento mediante un chequeo de no-entrenamiento.

## Capacidades

- Diagnosis de causa raiz en Kubernetes: identifica el objeto causante (kind / namespace / name) y la categoria de causa (por ejemplo `bad-command`, `probe-misconfig`, `oom`, `rbac`, `selector-mismatch`).
- Tool calling con herramientas de solo lectura tipo `kubectl`: list, describe, logs y events, con parser `qwen3_coder` en vLLM.
- Razonamiento multi-paso orientado a agentes: investiga el clúster de forma iterativa antes de emitir un veredicto.
- Citacion de evidencia: devuelve fragmentos literales de la salida de las herramientas que sustentan el diagnostico.
- Generacion de comandos de correccion sugeridos para revision humana.
- Deteccion de clústeres sanos: en el conjunto oculto de evaluacion, 0/3 falsas alarmas para ambos modelos (base y ajustado).
- Multilingue limitado: coreano (idioma de entrenamiento de los prompts de sistema y las explicaciones) e ingles (funcional, sin medicion reportada).
- Modo thinking desactivado por diseno: el modelo se entreno y evaluo con `enable_thinking: false`.

## Casos de uso

- Triaje automatizado de incidentes en produccion: ante una alerta de reinicio de pods, el modelo consulta eventos, logs y descripciones del workload y devuelve la causa probable con evidencia citada, reduciendo el tiempo hasta el primer diagnostico del equipo de guardia.
- Asistente de SRE en guardia: se integra como herramienta de consulta en el flujo de on-call para que el ingeniero obtenga un diagnostico estructurado (objeto, categoria, evidencia, comandos) antes de intervenir manualmente.
- Post-mortem asistido: a partir de la investigacion registrada por el agente, se genera un borrador de analisis de causa raiz con referencias a la salida real de `kubectl`, util para documentar incidentes.
- Validacion de configuraciones en CI/CD de manifiestos: el modelo puede detectar patrones de fallo tipicos (`probe-misconfig`, `selector-mismatch`, `rbac`) sobre entornos de staging desplegados con `kind`, como paso previo a promocionar cambios.
- Automatizacion de runbooks de diagnostico: se encapsulan procedimientos de investigacion como herramientas expuestas al modelo, que decide que consultar en cada caso en lugar de seguir un arbol fijo de decisiones.
- Formacion y simulacion de incidentes: los equipos pueden usar el modelo sobre clústeres de laboratorio con fallos inyectados para entrenar a nuevos SRE, ya que el agente explica la evidencia que sustenta cada diagnostico.
- Analisis de causa raiz en plataformas internas: integrado via API compatible con OpenAI (vLLM), se conecta a un backend que expone lecturas acotadas del clúster y devuelve respuestas estructuradas para su consumo por otras herramientas.

## Benchmarks y rendimiento

Metrica: precision de causa raiz (una ejecucion cuenta solo si aciertan tanto el objeto causante como la categoria de causa). Mismo harness, mismo agente (commit `51b380f`), hasta 50 peticiones por ejecucion, FP8 en una L40S con vLLM v0.32.0, 3 repeticiones por problema. Base = `Qwen/Qwen3.8-27B-FP8` oficial.

| Conjunto | Descripcion | Base | Ronda 2 | Cambio (IC 95%) |
|---|---|---:|---:|---|
| A | 44 problemas de benchmarks publicos (30 clústeres), nunca usados en entrenamiento | 52,3% | 58,3% | +6,1 pp (+0,8, +12,0) |
| B | ITBench, 14 problemas | 54,8% | 69,0% | +14,3 pp (+2,4, +28,6) |
| C | Variantes con senuelos de un conjunto publico (33 problemas x 3 rondas) | 93,3% | 95,6% | +2,4 pp (−1,3, +5,7) |
| D | Semillas retenidas del generador propio, 20 problemas | 35,0% | 51,7% | +16,7 pp (−1,7, +36,7) |
| Oculto | 12 problemas (11 fallos + 1 sano) | 78,8% | 75,8% | −3,0 pp (−9,1, 0,0) |

Notas del autor: el veredicto se fijo antes del entrenamiento sobre el conjunto A con bootstrap por clúster (10.000 remuestreos, semilla 292); el limite inferior supera 0, por lo que A cuenta como mejora. Las comprobaciones de guarda pasaron: sin caida en C y reduccion de respuestas erroneas con confianza en A (42,4% → 37,1%). El conjunto B se reporta pero no se usa para afirmaciones porque ya se habia inspeccionado previamente. El conjunto D comparte familia de generador con los datos de entrenamiento, por lo que solo indica direccion. El conjunto oculto es pequeno (11 problemas puntuados, ~9 puntos por problema) y solo sirve para comprobar que nada colapso (regla: caida superior a 25 puntos); no colapso y no muestra ganancia. Falsas alarmas en clústeres sanos: 0/3 en ambos modelos sobre el conjunto oculto.

## Requisitos de hardware

- VRAM estimada: el autor indica que cabe en una unica GPU de 48 GB (L40S, RTX 6000 Ada) con vLLM; el repo pesa 30,9 GB en FP8, por lo que se necesita margen adicional para cache KV y contexto.
- GPU recomendadas: L40S (48 GB), RTX 6000 Ada (48 GB). No se reportan pruebas en A100/H100 en la informacion disponible.
- GPU de consumo: no se confirma que quepa en GPUs de consumo de 24 GB o menos en FP8; no disponible.
- Despliegue: vLLM (imagen `vllm/vllm-openai:v0.32.0`), con `--enable-auto-tool-choice --tool-call-parser qwen3_coder --reasoning-parser qwen3 --language-model-only --max-num-seqs 64 --max-model-len 65536 --enable-prefix-caching --gpu-memory-utilization 0.9`. Configuracion de generacion: temperature 0.7, top_p 0.8, top_k 20, min_p 0.0, presence_penalty 1.5, repetition_penalty 1.0, thinking desactivado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kause-K8s-27B-FP8 | 27,78 B | 65.536 | Agente SRE para Kubernetes (fine-tune LoRA) | Apache 2.0 | Hugging Face, FP8 |
| Qwen/Qwen3.8-27B-FP8 (base) | 27 B (aprox.) | no disponible | Modelo generalista multimodal (image-text-to-text) | Apache 2.0 | Hugging Face, FP8 |
| Alternativas especificas de diagnosis K8s | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion cuantitativa publicada es contra el modelo base en la tarea de causa raiz (ver tabla de benchmarks). No se dispone de datos de otros ajustes finos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Idiomas: entrenado con prompts de sistema y explicaciones en coreano; responde en coreano por defecto. El rendimiento en ingles no se ha medido.
- Modo thinking: debe permanecer desactivado; activarlo se sale de la distribucion de entrenamiento y evaluacion.
- Sesgos y alucinacion: el modelo puede emitir diagnosticos incorrectos con confianza; el autor reporta un 37,1% de respuestas erroneas con confianza en el conjunto A tras el ajuste. La evidencia citada debe verificarse siempre contra la salida real de las herramientas.
- Alcance: disenado para herramientas de solo lectura tipo `kubectl`; no se ha validado para ejecutar cambios en el clúster.
- Conjunto oculto: sin ganancia observada (−3,0 pp) y tamano reducido; la mejora no esta garantizada en distribuciones de fallos distintas a las de entrenamiento.
- Datos y generador no publicados: no es posible reproducir el pipeline de datos ni auditar la composicion del conjunto de entrenamiento.
- Licencia: Apache 2.0 permite uso comercial, pero se heredan las condiciones del modelo base Qwen/Qwen3.8-27B; conviene revisar la licencia del modelo base antes de desplegar en produccion.
- Validacion de seguridad: el script de despliegue exige `--api-key` cuando el puerto es accesible desde fuera; el modelo no debe exponerse sin autenticacion.
- Madurez: version v0.2 (ronda 2 de entrenamiento), con 0 descargas y 1 like en el momento de la consulta; las rondas posteriores se publican sobre el mismo repositorio con etiquetas.

## Enlaces

- Hugging Face: https://huggingface.co/Kukie-AI/Kause-K8s-27B-FP8
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Modelo base en FP8: https://huggingface.co/Qwen/Qwen3.8-27B-FP8
- Script de fusion LoRA a FP8: `code/merge_lora_fp8.py` (en el repositorio del modelo)
- Script de servicio vLLM: `examples/serve_vllm.sh` (en el repositorio del modelo)
- Bucle minimo de diagnosis: `examples/diagnose.py` (en el repositorio del modelo)
- README en coreano: `README_ko.md` (en el repositorio del modelo)
- kind (Kubernetes en Docker): https://kind.sigs.k8s.io/
- vLLM: https://github.com/vllm-project/vllm
