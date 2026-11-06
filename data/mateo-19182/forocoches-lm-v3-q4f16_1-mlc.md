# mateo-19182/forocoches-lm-v3-q4f16_1-MLC

## Resumen

forocoches-lm-v3-q4f16_1-MLC es la version cuantizada y empaquetada para WebLLM del modelo forocoches-lm-v3, un ajuste fino completo de Gemma 3 1B entrenado por el usuario mateo-19182 sobre hilos del foro espanol ForoCoches. El repositorio contiene unicamente los pesos en formato MLC `q4f16_1` (575 MB), pensados para ejecutarse en el navegador mediante WebGPU con los kernels precompilados `gemma3-1b` de WebLLM, y no un checkpoint de Transformers: el modelo en bf16 vive en el repositorio base.

El proposito del modelo es generar texto con el registro, la jerga y las convenciones estilisticas del foro (titulos, posts numerados con autor, citas entre `[cita=OP]...[/cita]`), incluyendo el tono descortes propio del material original. Se trata de un artefacto de investigacion y aficion, no de un producto, segun declara el propio autor. Su relevancia actual es doble: por un lado demuestra un pipeline completo de ajuste fino de un modelo de 1B en una sola GPU de consumo (RTX 5090); por otro, muestra la viabilidad de desplegar un modelo especializado en el navegador sin backend, gracias a la cuantizacion q4f16_1 y a WebGPU.

La informacion disponible no detalla la arquitectura interna mas alla de su base (Gemma 3 1B), ni la longitud de contexto efectiva del ajuste, ni datos de benchmarks estandar. La evaluacion publicada por el autor se limita a perplejidad de completacion sobre texto de foro retenido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base: Gemma 3 1B); pesos en formato MLC para WebLLM/WebGPU |
| Parametros totales | 1B (heredados del modelo base Gemma 3 1B; no se especifica cifra exacta) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el entrenamiento uso filas empaquetadas de 8k tokens) |
| Tipos de cuantizacion | q4f16_1 (4 bits de pesos, activaciones en float16); el repo base ofrece bf16 |
| Idiomas soportados | es (espanol) |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | MLC (`q4f16_1`), 575 MB; no es un checkpoint de Transformers |
| Tamano del repositorio | 0.6 GB |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo (full fine-tuning) de Gemma 3 1B, un transformer decoder-only. El entrenamiento partio de la version v2 y anadio 545 millones de tokens adicionales, compuestos por historias largas e hilos del foro comprendidos entre 2003 y 2026. Se realizo una sola epoca con filas empaquetadas de 8192 tokens y funcion de perdida restringida a la completacion (completion-only loss), de modo que el modelo aprende a continuar los posts sin penalizar la reproduccion del prompt. Todo el proceso se ejecuto en una unica RTX 5090.

El formato de prompt es especifico del dominio: una linea de cabecera opcional (`tipo: historia | año: 2024`), seguida de `TÍTULO: ...` y de los posts con el esquema `#1 OP: ...`, `#2 forero_a: ...`, separados por lineas en blanco, con citas en el formato `[cita=OP]...[/cita]`. Los autores del corpus de entrenamiento estan pseudonimizados (`OP`, `forero_a`, etc.). La version publicada en este repositorio es la conversion a MLC `q4f16_1`, que reutiliza los kernels WebGPU precompilados `gemma3-1b` de WebLLM para su ejecucion en navegador. No se documentan tecnicas adicionales como RLHF, DPO o decodificacion especulativa.

## Capacidades

- Generacion de texto en espanol con el registro y la jerga propios de ForoCoches, incluyendo estructura de hilo (titulo, posts numerados, autores pseudonimizados).
- Continuacion y creacion de hilos de foro: historias largas, hilos de debate y respuestas encadenadas.
- Manejo del formato de citas `[cita=OP]...[/cita]` y de la cabecera de metadatos (`tipo`, `año`).
- Generacion de contenido con tono descortes o soez cuando el contexto lo induce, por reflejo del corpus de entrenamiento.
- Ejecucion en navegador mediante WebGPU con WebLLM, sin backend ni servidor.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, vision, audio ni modo thinking en la informacion disponible.
- Capacidad multilingue limitada al espanol segun la etiqueta de idioma del repositorio.

## Casos de uso

- Demo interactiva en navegador: el modelo se carga con WebLLM sobre WebGPU y permite generar hilos de foro directamente en la pagina, sin infraestructura de servidor; es el uso para el que se publico este repositorio concreto.
- Prototipado de interfaces de chat sin backend: util para desarrolladores que quieran probar una UI de generacion de texto con un modelo de 575 MB en el cliente antes de invertir en infraestructura.
- Generacion de datos sinteticos de estilo foro: producir hilos, respuestas y citas con la estructura `#N autor: ...` para aumentar corpus de entrenamiento o evaluar clasificadores de tono.
- Investigacion sobre estilo y registro: analisis de como un ajuste fino de 545M tokens sobre un 1B desplaza la distribucion linguistica hacia una jerga concreta, medible con la perplejidad de completacion reportada (6.54 en v3 frente a 11.11 del base).
- Pruebas de robustez y seguridad: el modelo genera de forma explicita contenido descortes, lo que lo convierte en un banco de pruebas controlado para filtros de moderacion y clasificadores de toxicidad.
- Educacion sobre despliegue web de LLM: ejemplo completo de cuantizacion MLC, empaquetado para WebLLM y ejecucion en WebGPU con kernels precompilados, replicable con otros modelos de 1B.
- Generacion de ficcion ambientada en foros: relatos largos con la estructura de hilo y la voz de los foreros, aprovechando el entrenamiento especifico en historias largas.

## Benchmarks y rendimiento

El autor solo publica perplejidad de completacion sobre texto de foro retenido:

| Modelo | Perplejidad (texto de foro retenido) |
|---|---|
| Gemma 3 1B base | 11.11 |
| forocoches-lm v1 | 7.08 |
| forocoches-lm v2 | 6.81 |
| forocoches-lm v3 | 6.54 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: los pesos q4f16_1 ocupan 575 MB; en ejecucion en navegador el consumo depende del buffer de contexto y de los buffers de WebGPU, no se dispone de cifra oficial.
- GPU recomendadas: cualquier GPU con soporte WebGPU estable (Chrome/Edge en Windows, macOS y Android); el autor entreno en una RTX 5090, pero la inferencia cuantizada no requiere esa clase de hardware.
- Cabe en GPU de consumo: si, al tratarse de un modelo de 1B en 4 bits; el limite practico es el soporte WebGPU del navegador y del sistema operativo.
- Opciones de despliegue: WebLLM (via WebGPU, uso previsto); el repositorio base en bf16 puede desplegarse con vLLM, TGI o llama.cpp si se convierte a los formatos correspondientes, aunque no se documenta esa via.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| forocoches-lm-v3-q4f16_1-MLC | 1B | no disponible | Ajuste fino de dominio (foro espanol) en MLC/WebLLM | gemma | Hugging Face, pesos MLC |
| Gemma 3 1B (base) | 1B | no disponible | Modelo generalista multilingue | gemma | Hugging Face, amplia adopcion |
| forocoches-lm v3 (bf16) | 1B | no disponible | Mismo ajuste fino, checkpoint Transformers | gemma | Hugging Face, repo base |

La comparativa se limita a las variantes del propio proyecto y a su modelo base, porque no se dispone de datos de rendimiento de terceros en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo reproduce el registro del foro, incluido el tono descortes y soez; el autor lo declara explicitamente como artefacto de investigacion y aficion, no como producto.
- Riesgo de alucinacion: no se han publicado evaluaciones de factualidad; al ser un ajuste de dominio sobre un 1B, la fiabilidad factual es limitada.
- Sesgos: el corpus procede de un unico foro espanol, con la demografia y los sesgos propios de esa comunidad; los autores estan pseudonimizados, pero el estilo y los topicos del foro se reflejan en las salidas.
- Limitacion idiomatica: etiquetado solo para espanol; el rendimiento en otros idiomas no esta documentado.
- Licencia: se heredan los Gemma Terms of Use, que imponen condiciones de uso (incluidas restricciones de uso comercial y obligaciones de atribucion) que deben revisarse antes de cualquier despliegue.
- Formato: los pesos son MLC para WebLLM y no un checkpoint de Transformers; su uso fuera del navegador requiere el repositorio base o una conversion adicional.
- Longitud de contexto efectiva no documentada; el entrenamiento uso filas de 8k tokens, pero no se especifica la ventana soportada en inferencia.
- Sin senales de tool calling ni de razonamiento multi-paso; no debe emplearse en pipelines de agentes sin evaluacion previa.

## Enlaces

- Repositorio Hugging Face (pesos MLC): https://huggingface.co/mateo-19182/forocoches-lm-v3-q4f16_1-MLC
- Repositorio base (bf16): https://huggingface.co/mateo-19182/forocoches-lm-v3
- Demo en navegador: https://forocoches.m19182.dev
- WebLLM: https://github.com/mlc-ai/web-llm
- Terminos de uso de Gemma: https://ai.google.dev/gemma/terms
