# jeffwang026/scottyrl-a3-p5_textcraft_grpo

## Resumen

`jeffwang026/scottyrl-a3-p5_textcraft_grpo` es un adaptador LoRA de rango 32 sobre el modelo base `Qwen/Qwen3.5-4B`, entrenado con el framework scottyrl y exportado desde Tinker (referencia interna `tinker://model_3f6a668c/v50`). No se trata de un modelo completo, sino de un conjunto de pesos PEFT en safetensors (repo de 0,2 GB) que debe servirse junto al modelo base para funcionar. El nombre del run, `p5_textcraft_grpo`, indica un ajuste con GRPO (Group Relative Policy Optimization) orientado a tareas de TextCraft, un entorno textual de planificación y crafteo por pasos.

El adaptador se ha desarrollado en el contexto del curso 11-768 (AI Agents) de CMU, como entrega de la Assignment 3, y su evaluación está definida de forma explícita: servir el adaptador con vLLM (`--enable-lora --max-lora-rank 32`) y ejecutar `scripts/evaluate_checkpoint.py` con `k=4` sobre los splits de validación `TextCraft-Synth` en dificultad media y difícil.

Su relevancia es acotada y de tipo metodológico: es un artefacto reproducible de investigación (incluye commit `ef42c0d35c0c5b52d327a21fa2bb23a15d52d76e` y configuración `configs/p5_textcraft_grpo.yaml`) que ilustra un pipeline completo de RL sobre un modelo de 4B con despliegue LoRA multi-adaptador en vLLM. No hay resultados numéricos publicados, ni licencia, ni idiomas declarados, por lo que no debe considerarse un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rango 32) sobre un transformer decoder-only; la arquitectura interna del modelo base no se detalla en la informacion disponible |
| Parametros totales | No disponible para el adaptador (el modelo base se identifica como `Qwen/Qwen3.5-4B`, ~4B parametros segun su denominacion); tamano del repo: 0,2 GB |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors sin cuantizar; la cuantizacion del modelo base no se especifica) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors con formato PEFT/LoRA (libreria `peft`) |
| Rango LoRA | 32 (declarado en la model card y en el flag `--max-lora-rank 32`) |
| Modelo base | `Qwen/Qwen3.5-4B` |
| Framework de entrenamiento | scottyrl (export desde Tinker) |
| Fecha de creacion (metadata HF) | 2026-10-17 |

## Arquitectura y entrenamiento

El artefacto es un adaptador de bajo rango (rank 32) acoplado a `Qwen/Qwen3.5-4B`. No se especifica en la informacion disponible ni el numero de capas objetivo, ni el valor de alpha, ni el dropout, ni si el adaptador cubre solo las proyecciones de atencion o tambien las MLP. El entrenamiento se realizo con el framework scottyrl y el run lleva el sufijo `grpo`, lo que indica optimizacion de politica con Group Relative Policy Optimization sobre recompensas del entorno TextCraft; no se detalla el numero de pasos, el tamano de grupo, la funcion de recompensa ni el volumen de tokens de entrenamiento.

El dominio declarado es TextCraft-Synth, un entorno de agente textual con acciones de recogida y crafteo encadenadas, evaluado en splits de validacion de dificultad media y dificil. La model card documenta unicamente el procedimiento de evaluacion (servir con vLLM habilitando LoRA y ejecutar el script del curso con `k=4`), no la composicion del dataset, ni si hubo etapas previas de SFT, ni detalles de RLHF/DPO. El commit `ef42c0d35c0c5b52d327a21fa2bb23a15d52d76e` y el fichero `configs/p5_textcraft_grpo.yaml` son las referencias reproducibles disponibles.

## Capacidades

- Generacion de trayectorias de agente para entornos de crafteo textual: seleccion de acciones y encadenamiento de pasos hasta un objetivo de fabricacion.
- Razonamiento multi-paso con planificacion de dependencias entre recetas (obtener recurso, transformarlo, combinarlo).
- Ajuste por refuerzo con GRPO orientado a maximizar la recompensa del entorno TextCraft-Synth.
- Servicio como adaptador LoRA intercambiable en vLLM, lo que permite atender varias politicas sobre el mismo modelo base.
- Evaluacion con muestreo multiple (`k=4`), lo que sugiere uso en esquemas de best-of-n o self-consistency durante la evaluacion.
- Capacidades de vision, audio, tool calling formal, modo thinking o multilingue: no documentadas en la informacion disponible.
- Generalizacion fuera del dominio TextCraft: no documentada.

## Casos de uso

- Investigacion en RL para agentes: usar el adaptador como linea base reproducible de un pipeline GRPO sobre un modelo de 4B, comparando contra el modelo base sin adaptar con el mismo script de evaluacion y `k=4`.
- Evaluacion academica de agentes: replicar el protocolo del curso 11-768 sirviendo el adaptador con vLLM y ejecutando `evaluate_checkpoint.py` sobre los splits medium y hard de TextCraft-Synth.
- Planificacion en entornos con estado discreto: aplicar el patron de entrenamiento a dominios con acciones verificables (inventarios, pipelines de build, flujos de aprovisionamiento) donde la recompensa se calcula por reglas y no requiere anotacion humana.
- Experimentos de despliegue multi-LoRA: servir `Qwen/Qwen3.5-4B` con `--enable-lora --max-lora-rank 32` y montar varios adaptadores simultaneamente para comparar politicas con un unico motor de inferencia, reduciendo coste de GPU frente a servir un modelo completo por politica.
- Generacion de datos sinteticos de trayectorias: producir secuencias de acciones correctas e incorrectas sobre TextCraft-Synth para alimentar etapas posteriores de SFT o para construir pares de preferencia.
- Estudio de sobreajuste y transferencia: medir cuanto del comportamiento aprendido en TextCraft se transfiere a otros entornos textuales de planificacion, usando el adaptador como tratamiento y el base como control.
- Docencia y formacion tecnica: material practico para explicar PEFT, export desde Tinker y evaluacion de agentes con servidores compatibles con la API de OpenAI (`/v1`).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card define el protocolo de evaluacion (vLLM con LoRA habilitado, `scripts/evaluate_checkpoint.py`, `k=4`, splits `TextCraft-Synth` medium y hard), pero no incluye tasas de exito, recompensas medias ni comparaciones numericas con el modelo base u otros adaptadores.

## Requisitos de hardware

- VRAM estimada (modelo base de ~4B parametros, sin contar el adaptador, que anade decenas de MB): en fp16/bf16, aproximadamente 8 GB solo de pesos y 10-14 GB con cache KV para contextos moderados; en cuantizacion de 4 bits, aproximadamente 2,5-3,5 GB de pesos y 6-8 GB en total. Estimaciones orientativas, no medidas publicadas para este adaptador.
- GPU profesionales: A100 40/80 GB, H100, L40S o A10G son suficientes y permiten servir varias politicas LoRA en el mismo proceso vLLM.
- GPU de consumo: cabe en RTX 4090 (24 GB), RTX 4080 (16 GB), RTX 4060 Ti 16 GB y RTX 3060 12 GB en cuantizacion de 4 bits; en fp16 es comodo a partir de 16 GB.
- Despliegue documentado: vLLM con `--enable-lora --max-lora-rank 32 --lora-modules a3=jeffwang026/scottyrl-a3-p5_textcraft_grpo`, exponiendo la API en `http://localhost:8000/v1`.
- Despliegue alternativo: es tecnicamente posible convertir el adaptador a GGUF y fusionarlo con el base para llama.cpp u Ollama, pero no esta documentado ni validado por el autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Datos de rendimiento |
|---|---|---|---|---|---|
| scottyrl-a3-p5_textcraft_grpo | Adaptador LoRA r=32 sobre ~4B | No disponible | No disponible | safetensors (PEFT) | Sin resultados publicados |
| Qwen/Qwen3.5-4B (base, sin adaptar) | ~4B | No disponible | No disponible | safetensors | No disponible |
| Otros adaptadores LoRA de la Assignment 3 (misma familia) | Adaptador sobre ~4B | No disponible | No disponible | safetensors (PEFT) | No disponible |

No se dispone de datos objetivos para comparar con alternativas fuera de esta familia; cualquier comparacion de rendimiento seria especulativa.

## Limitaciones y advertencias

- Licencia no declarada: sin terminos explicitos no hay base legal clara para uso comercial; hay que contactar con el autor o asumir la licencia del modelo base.
- Artefacto academico: creado para la Assignment 3 de un curso, sin model card sustantiva, sin descargas ni likes en el momento de la consulta y sin resultados de evaluacion publicados.
- Dependencia obligatoria del modelo base `Qwen/Qwen3.5-4B`; el repo de 0,2 GB no es autonomo.
- Evaluacion restringida a TextCraft-Synth (medium y hard) con `k=4`; no hay evidencia de transferencia a otros dominios ni de robustez fuera de distribucion.
- Riesgo de sobreajuste al formato de acciones y al esquema de recompensa del entorno de entrenamiento, con posible degradacion del lenguaje general respecto al base.
- Riesgo de alucinacion de acciones o de recetas inexistentes dentro del entorno; en produccion requiere un validador externo que rechace acciones invalidas.
- Idiomas soportados no declarados; no se puede asumir un comportamiento multilingue equivalente al del modelo base.
- Sesgos no documentados: al no haber evaluacion de sesgo ni de seguridad, no se recomienda su uso en aplicaciones de cara al usuario final.
- Sin pipeline declarado en HuggingFace, lo que limita la integracion automatica en herramientas que dependen de ese campo.
- Las instrucciones incluidas en la model card (comandos de vLLM y del script de evaluacion) son material del autor y deben revisarse antes de ejecutarlas en un entorno propio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jeffwang026/scottyrl-a3-p5_textcraft_grpo
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Referencia de export en Tinker: `tinker://model_3f6a668c/v50` (identificador interno, no es una URL publica)
- Configuracion de entrenamiento: `configs/p5_textcraft_grpo.yaml` (en el repo del autor, no enlazada en la model card)
- Commit declarado: `ef42c0d35c0c5b52d327a21fa2bb23a15d52d76e`
- Paper, blog, demo o repositorio adicionales: no disponibles en la informacion proporcionada
