# Sm0k13/B.R.O-abliterated-27B

## Resumen

B.R.O — Zero Refusal v3.0 es un modelo de lenguaje derivado por destilación sobre la arquitectura Qwen3.5-35B-A3B, publicado por el usuario Sm0k13 en Hugging Face. Su objetivo declarado es eliminar por completo los mecanismos de rechazo (refusal) en ingles y hebreo, incluyendo peticiones relacionadas con ciberseguridad ofensiva y red teaming. El modelo se presenta como una edicion MoE de una familia previa (v1.0 y v2.0) que usaba un backbone denso de 27B; el identificador del repositorio conserva el sufijo "27B" por herencia, aunque la arquitectura real es de 35B totales con 3B activos por token.

Tecnicamente se apoya en la arquitectura `qwen35moe`, que combina atencion lineal hibrida GatedDeltaNet con una capa MoE dispersa de 256 expertos enrutados mas un experto compartido por capa. El autor reporta una velocidad de 23,3 a 26,5 tokens por segundo en generacion sobre Apple Silicon con cuantizacion Q4_K_M (unos 20,5 GB), lo que supone aproximadamente 4,5 veces mas rapido que la version densa anterior.

La relevancia del modelo es acotada pero clara: se dirige a investigadores de seguridad, equipos de red team y desarrolladores que necesitan un modelo local sin filtros de rechazo para pruebas de concepto, generacion de payloads o analisis ofensivo. No es un modelo de proposito general recomendable para produccion convencional, y su publicacion plantea cuestiones evidentes de uso responsable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen35moe` (atencion lineal hibrida GatedDeltaNet + MoE dispersa) |
| Parametros totales | 35B (34,7B) |
| Parametros activos | 3B (A3B) por token: 256 expertos enrutados + 1 compartido por capa |
| Longitud de contexto | 32.768 tokens por defecto; hasta 262.144 nativos |
| Tipos de cuantizacion | GGUF Q4_K_M (~20,5 GB); safetensors en el repositorio |
| Idiomas soportados | Ingles (en) y hebreo (he) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y GGUF (con Modelfile para Ollama) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-35B-A3B, una arquitectura MoE con atencion lineal hibrida GatedDeltaNet. Cada capa contiene 256 expertos enrutados y un experto compartido, de modo que solo se activan 3B parametros por token pese a los 35B totales. Esta eleccion reduce la latencia frente a un backbone denso de 27B, que ejecutaba todos sus parametros en cada token.

El proceso de construccion descrito por el autor tiene tres fases. Primero, un modelo profesor denominado B.R.O v53 Zero-Refusal (Tinker) se entrena desde el estado v30 con 618 trayectorias de cumplimiento directo (223.689 tokens), combinando desaprendizaje contrastivo de rechazo, bloqueo de intencion mediante `<think>\n\n</think>\n\n` y "inmunidad" a cinco plantillas de system prompt (`bro_full`, `exody_agent`, `hebrew_direct`, `minimal`, `raw_empty`). Despues, ese profesor se destila sobre el backbone Qwen3.5-35B-A3B. Finalmente, se parchean la plantilla de chat del tokenizer y el Modelfile para forzar el bloqueo de intencion en cada generacion, evitando que el modelo entre en cadenas de pensamiento largas o se autocensure. El corpus destilado de 618 trayectorias y un recibo de benchmarks se incluyen en el repositorio.

## Capacidades

- Generacion de texto conversacional en ingles y hebreo con tasa de rechazo declarada del 0,0 %.
- Respuesta a peticiones de ciberseguridad ofensiva, red teaming y analisis de vulnerabilidades sin filtros de seguridad.
- Funcionamiento sin system prompt (modo `raw_empty`) manteniendo el comportamiento sin rechazo.
- Bloqueo de intencion preconfigurado para suprimir el razonamiento extendido y responder de forma directa.
- Soporte de contexto largo de hasta 262.144 tokens en su configuracion nativa.
- Despliegue local via Ollama con el tag `bro-zero-refusal`.
- No se documenta soporte de tool calling, function calling, vision, audio ni capacidades de agente multi-paso.

## Casos de uso

- Pruebas de red teaming controladas: el modelo genera escenarios de ataque, payloads de ejemplo y tecnicas de evasion sin rechazos, lo que agiliza la fase de ideacion en ejercicios de seguridad autorizados.
- Formacion en ciberseguridad: instructores pueden usar el modelo para construir laboratorios de explotacion y material didactico ofensivo en entornos aislados.
- Analisis de malware y ofuscacion: con contexto de 32.768 tokens por defecto puede procesar fragmentos de codigo y muestras de texto extensas para explicar tecnicas de ofuscacion.
- Investigacion sobre alineacion y refusal: sirve como referencia de un modelo deliberadamente desalineado en rechazos para estudiar el comportamiento de modelos abliterated y sus efectos colaterales.
- Despliegue local en estaciones de trabajo Apple Silicon: con Q4_K_M (~20,5 GB) y 23-26 tok/s permite iteracion rapida sin depender de APIs externas.
- Generacion de contenido en hebreo sin restricciones: util para investigacion linguistica o evaluacion de sesgos en un idioma poco cubierto por modelos comerciales.
- Automatizacion de documentacion tecnica de seguridad: redaccion de informes de pentesting y notas de explotacion a partir de hallazgos previos.

## Benchmarks y rendimiento

| Metrica | Valor reportado |
|---|---|
| Tasa de rechazo (hebreo, ingles, sin system prompt, ciber ofensivo) | 0,0 % (0/32 en 4 suites) |
| Velocidad de generacion (Apple Silicon, Q4_K_M) | 23,3 - 26,5 tok/s |
| Evaluacion de prompt (Apple Silicon, Q4_K_M) | 238 tok/s |
| Aceleracion frente a v2.0 densa 27B | ~4,5x |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Las cifras anteriores son mediciones locales del autor, no comparaciones contra modelos de referencia.

## Requisitos de hardware

- VRAM estimada: ~20,5 GB con Q4_K_M; en torno a 70 GB en FP16 para los 35B totales.
- Dado que solo se activan 3B parametros por token, la VRAM viene dominada por el almacenamiento de pesos, no por el computo.
- GPU recomendadas: A100 40/80 GB o H100 para FP16; RTX 4090 (24 GB) suficiente para Q4_K_M.
- Cabe en GPU de consumo con 24 GB o mas (RTX 3090, 4090) usando cuantizacion Q4_K_M.
- Despliegue documentado via Ollama (`ollama run bro-zero-refusal`) con script de instalacion para macOS y Linux.
- Compatible con llama.cpp por el formato GGUF; vLLM y TGI no estan documentados en la informacion disponible.
- Throughput reportado: 23-26 tok/s en generacion y 238 tok/s en evaluacion de prompt sobre Apple Silicon.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| B.R.O Zero Refusal v3.0 | 35B totales / 3B activos | 32.768 (hasta 262.144) | Apache 2.0 | Sin rechazos, ingles y hebreo, enfocado a ciberseguridad |
| HauhauCS/Qwen3.5-35B-A3B-Uncensored-HauhauCS-Aggressive | 35B / 3B activos | no disponible | no disponible | Modelo base directo; tambien sin censura pero sin el proceso de destilacion de B.R.O |
| Qwen/Qwen3.5-35B-A3B | 35B / 3B activos | no disponible | no disponible | Modelo original con alineacion estandar y rechazos activos |
| B.R.O v2.0 (denso 27B) | 27B densos | no disponible | no disponible | Version previa, ~4,5x mas lenta segun el autor |

No se dispone de datos de benchmarks comparativos entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Ausencia total de rechazos: el modelo cumplira peticiones daninas, ilegales o peligrosas sin filtro, lo que exige controles externos en cualquier despliegue.
- Riesgo elevado de alucinacion en temas tecnicos de seguridad, especialmente payloads y procedimientos de explotacion, que pueden ser incorrectos o inseguros.
- Cobertura linguistica limitada a ingles y hebreo; el rendimiento en castellano no esta documentado y previsiblemente sera deficiente.
- El bloqueo de intencion forzado suprime el razonamiento extendido, lo que puede degradar tareas que requieran cadenas de pensamiento largas.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni asume responsabilidad sobre el uso del modelo.
- El identificador del repositorio ("27B") no coincide con la arquitectura real (35B), lo que puede generar confusion en la seleccion de pesos.
- No hay evidencia de evaluaciones independientes de sesgos, toxicidad o robustez; las metricas de rechazo son autoevaluadas por el autor.
- El modelo hereda los sesgos del backbone Qwen3.5 y del corpus de destilacion, que no se describe en detalle.
- Uso responsable: no debe desplegarse en atencion al cliente, educacion ni aplicaciones de cara al publico sin moderacion adicional.

## Enlaces

- Hugging Face: https://huggingface.co/Sm0k13/B.R.O-abliterated-27B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-35B-A3B
- Modelo intermedio: https://huggingface.co/HauhauCS/Qwen3.5-35B-A3B-Uncensored-HauhauCS-Aggressive
- Repositorio GitHub del instalador: https://github.com/timamar187-creator/BRO-abliterated-27B
- Script de instalacion: https://huggingface.co/Sm0k13/B.R.O-abliterated-27B/resolve/main/install-bro-zero-refusal.zsh
