# loom-draft/bartowski-NVIDIA-Nemotron-3.5-Lightning-30B-A3B-loom

## Resumen

Este repositorio no contiene un modelo nuevo: es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) para el checkpoint GGUF cuantizado en Q4_K_M de NVIDIA-Nemotron-3.5-Lightning-30B-A3B, distribuido originalmente por bartowski. El paquete lo publica el usuario `loom-draft` y está generado con la herramienta `loom-next`, sin intervención de un LLM en el proceso de generación. Su objetivo es permitir servir el modelo sobre GPUs AMD concretas mediante el runtime `loom-serve`, en lugar de depender de llama.cpp u otros motores.

El modelo subyacente, Nemotron-3.5-Lightning-30B-A3B, es un transformer de tipo mixture-of-experts con 30B parámetros totales y aproximadamente 3B activos por token, según indica el propio nombre del checkpoint. El paquete declara soporte de razonamiento con modo thinking activado por defecto, una ventana de contexto de 262.144 tokens por petición y concurrencia de 4 peticiones simultáneas, con un máximo de 4.096 tokens de salida configurado en el preset.

La relevancia de esta ficha es acotada: se trata de un artefacto de empaquetado para hardware AMD específico (Ryzen AI Max+ 395 "Strix Halo", gfx1151, y Radeon AI PRO R9700, gfx1201 de 32 GB), con cero descargas y cero likes en el momento de la consulta, y sin mediciones de rendimiento ni de corrección registradas todavía. No debe confundirse con el modelo original de NVIDIA ni con el GGUF de bartowski, que son las fuentes reales de pesos y arquitectura.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (el paquete no documenta la arquitectura; el nombre del checkpoint indica MoE con 30B totales y 3B activos) |
| Parámetros totales | 30B (según el nombre del checkpoint) |
| Parámetros activos | ~3B (según el nombre del checkpoint) |
| Longitud de contexto | 262.144 tokens por petición |
| Tipos de cuantización | Q4_K_M (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (`NVIDIA-Nemotron-3.5-Lightning-30B-A3B-Q4_K_M.gguf`) empaquetado en formato Loom (`.loom` + `model.json`) |

Otros datos operativos declarados en la tarjeta:

| Parámetro | Valor |
|---|---|
| Máximo de tokens de salida | 4.096 (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultáneas |
| API | `/v1/chat/completions` estilo OpenAI |
| Modo thinking | Activado por defecto; se desactiva con `chat_template_kwargs: {"enable_thinking": false}` |
| Tool calling | No aplicable según la tarjeta |
| Decodificación especulativa | No aplicable según la tarjeta |
| Entrada de imagen | No aplicable según la tarjeta |
| Entrada/salida de audio | No aplicable según la tarjeta |
| Muestreo (temperature, top_k, seed) | No determinado |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo base. El identificador del checkpoint (30B-A3B) sugiere una arquitectura mixture-of-experts con 30.000 millones de parámetros totales y aproximadamente 3.000 millones activos por token, patrón habitual en la familia Nemotron de NVIDIA, pero la tarjeta del paquete no confirma capas, número de expertos, mecanismo de atención ni estrategia de enrutamiento. Tampoco se documentan datos de entrenamiento, número de tokens, composición del corpus ni si hubo etapas de RLHF, DPO o ajuste por preferencias.

Lo que sí está documentado es la capa de despliegue. El paquete se genera con `loom-next`, que produce kernels y programas `.loom` para el runtime `loom-serve` sobre ROCm, con objetivos declarados para gfx1151 (Strix Halo) y gfx1201 (Radeon AI PRO R9700). El serving usa `--pool_backing=fixed` (reserva fija del pool de memoria), `--parameter_mode=preload` (carga de pesos en host previa) y `completion_spin_ns=4294967295` (espera activa de finalizaciones de GPU). La tarjeta menciona gates de corrección frente a llama.cpp (kernels, golden tokens, comparación greedy, consistencia bajo concurrencia, logits en host, decisiones), pero ninguno tiene medición registrada para este paquete.

## Capacidades

- Generación de texto conversacional vía API compatible con OpenAI (`/v1/chat/completions`).
- Razonamiento con modo thinking activado por defecto y desactivable por petición mediante `chat_template_kwargs`.
- Contexto largo: hasta 262.144 tokens por petición, adecuado para documentos extensos o historiales de conversación prolongados.
- Concurrencia de 4 peticiones simultáneas en el preset publicado.
- Salida limitada a 4.096 tokens por respuesta en la configuración por defecto.
- Tool calling: no soportado según la tarjeta del paquete ("not applicable").
- Decodificación especulativa: no soportada según la tarjeta.
- Entrada de imagen y audio: no soportadas según la tarjeta.
- Control de "reasoning effort": no aplicable según la tarjeta.
- Idiomas: no disponible.

## Casos de uso

- Servicio local de chat sobre GPU AMD: el paquete está pensado para ejecutarse con `loom-serve` en Strix Halo o Radeon AI PRO R9700, de modo que un equipo con hardware AMD puede exponer un endpoint compatible con OpenAI sin depender de CUDA ni de llama.cpp. Es adecuado si el parque hardware es AMD y se quiere evitar la pila NVIDIA.
- Procesamiento de documentos largos: con 262.144 tokens de contexto por petición, el modelo puede ingerir contratos, informes o bases de código completas en una sola llamada, siempre que el prompt quepa en el pool de memoria configurado con `--pool_backing=fixed`.
- Asistentes con razonamiento explícito: el modo thinking por defecto resulta útil en tareas de análisis paso a paso (depuración lógica, revisión de planes, resolución de problemas), y puede desactivarse para respuestas rápidas de baja latencia.
- Prototipado y evaluación de modelos MoE: al ser un GGUF Q4_K_M de 30B con ~3B activos, sirve para medir en hardware de consumo profesional el equilibrio entre calidad y coste de inferencia de una arquitectura dispersa, antes de comprometerse con despliegues mayores.
- Integración en pipelines internos vía API OpenAI: cualquier cliente que hable el protocolo de OpenAI (SDK de Python, LangChain, herramientas de evaluación) puede apuntar a `http://127.0.0.1:8080/v1/chat/completions` sin adaptadores específicos.
- Despliegue en estaciones de trabajo con una sola GPU de 32 GB: la Radeon AI PRO R9700 dispone de 32 GB, suficientes para el checkpoint Q4_K_M según el diseño del paquete, lo que permite montar un servidor de inferencia en una máquina de sobremesa.
- Reproducibilidad de despliegues AMD: el par `loom-fetch` + `loom-serve` con parámetros fijos documenta una configuración reproducible, útil para equipos que necesitan estandarizar el serving en flotas heterogéneas de GPUs AMD.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La tarjeta indica explícitamente que las mediciones de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201) "no se han vuelto a medir" para este paquete. Tampoco hay datos de MMLU, HumanEval, GSM8K ni métricas equivalentes del modelo base en la información proporcionada.

Los gates de corrección declarados (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran todos como "not yet re-measured" en ambas GPUs, por lo que no hay evidencia registrada de equivalencia funcional con llama.cpp para este artefacto.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. El checkpoint es Q4_K_M de un modelo de 30B parámetros totales; el paquete está dirigido a GPUs con 32 GB (Radeon AI PRO R9700) y al sistema integrado Strix Halo, lo que sugiere que el preset cabe en ese presupuesto de memoria, pero no se publica una cifra exacta.
- GPUs objetivo: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPUs de consumo: no se documenta compatibilidad con GPUs de consumo convencionales; los objetivos declarados son APUs y GPUs profesionales AMD.
- Opciones de despliegue: `loom-serve` mediante `pipx install "hrx-loom[hf]==0.2.0"`, con `loom-fetch` para descargar el paquete desde Hugging Face. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI en este paquete.
- Latencia y throughput: no disponibles; las filas de rendimiento de la tarjeta están pendientes de medición.
- Memoria: el preset usa `--pool_backing=fixed`, que reserva el pool completo por adelantado, por lo que el consumo de memoria es constante desde el arranque y no crece de forma elástica.
- CPU: `completion_spin_ns=4294967295` activa espera activa de finalizaciones de GPU, lo que consume CPU mientras hay trabajo en vuelo; conviene reservar núcleos libres.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Este paquete (Nemotron-3.5-Lightning-30B-A3B Q4_K_M, Loom) | 30B totales / ~3B activos | 262.144 tokens | MIT | Loom + GGUF | Hugging Face, 0 descargas |
| bartowski/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-GGUF | 30B totales / ~3B activos | no disponible en la información | no disponible en la información | GGUF | Hugging Face (modelo base del paquete) |
| llama.cpp como motor de referencia | no aplica | no disponible | MIT | no aplica | Referencia usada por los gates de corrección |

No se dispone de datos de benchmarks ni de otros modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación de rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- El repositorio no contiene pesos originales: es un paquete de despliegue que referencia el GGUF de bartowski. Cualquier evaluación de calidad debe hacerse sobre el modelo base, no sobre este artefacto.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso en producción ni validación por parte de la comunidad.
- Todos los gates de corrección figuran sin medición registrada; no hay prueba publicada de que la salida coincida con llama.cpp en este paquete.
- Rendimiento sin medir: no hay cifras de latencia ni throughput para ninguna de las dos GPUs objetivo.
- Tool calling no soportado según la tarjeta, lo que descarta flujos de agentes con funciones externas en esta configuración.
- Sin soporte de imagen ni audio, y sin decodificación especulativa.
- Muestreo no determinado: el comportamiento de temperature, top_k y seed no está verificado.
- Contexto efectivo limitado por el pool de memoria fijo: aunque se anuncian 262.144 tokens por petición, la memoria se reserva por adelantado y no se documenta cuántas peticiones de contexto máximo caben simultáneamente con concurrencia 4.
- Licencia MIT declarada en el paquete, pero la licencia del modelo base y del GGUF de origen no se detalla en la información disponible; conviene verificar la licencia del checkpoint original antes de uso comercial.
- Idiomas soportados no disponibles: no se puede garantizar calidad multilingüe sin evaluación.
- Dependencia de la pila ROCm y de `hrx-loom==0.2.0`: versiones distintas del runtime pueden invalidar los comandos documentados.
- Riesgo de alucinación y sesgos: no evaluados en la información disponible.

## Enlaces

- Repositorio del paquete: https://huggingface.co/loom-draft/bartowski-NVIDIA-Nemotron-3.5-Lightning-30B-A3B-loom
- Modelo base GGUF: https://huggingface.co/bartowski/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Ecosistema Loom: https://loom-fun.github.io/loom-dev/
