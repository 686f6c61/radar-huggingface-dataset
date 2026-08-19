# mradermacher/Ektome-Qwen3.8-27B-PristinelyUncensored-i1-GGUF

## Resumen

Ektome-Qwen3.8-27B-PristinelyUncensored-i1-GGUF es la versión cuantizada en formato GGUF del modelo Ektome-Qwen3.8-27B-PristinelyUncensored, desarrollado por Zynerji y cuantizado por mradermacher. Se trata de un modelo de 27 000 millones de parámetros basado en Qwen3.8-27B, sometido a un proceso de "abliteration" para eliminar los rechazos y restricciones del modelo original, seguido de una fase de "abliteration-repair" que restaura las capacidades perdidas durante el proceso. El resultado es un modelo sin censura que conserva las capacidades técnicas del modelo base.

La versión i1 incorpora cuantizaciones con matriz de importancia (imatrix) y es compatible con la predicción multi-token (MTP), lo que permite acelerar la decodificación mediante speculative decoding. El modelo mantiene la arquitectura completa del Qwen3.8-27B, incluyendo el head MTP de 15 tensores y el codificador de visión, lo que lo convierte en un modelo multimodal a pesar de estar enfocado principalmente en texto. Su licencia Apache 2.0 permite uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con vision tower y head MTP (multi-token prediction) |
| Parametros totales | 27 320 697 856 (27,3B) |
| Parametros activos | no disponible |
| Longitud de contexto | 262 144 tokens (262k) |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K |
| Idiomas soportados | Ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors disponible en el repo del modelo base) |

## Arquitectura y entrenamiento

El modelo base Ektome-Qwen3.8-27B-PristinelyUncensored mantiene paridad tensor a tensor con Qwen/Qwen3.8-27B, incluyendo los 1199 tensores del modelo original, el head MTP de 15 tensores y el codificador de vision completo. La arquitectura es un transformer denso con soporte para vision (multimodal) y una cabeza de prediccion multi-token que permite decodificacion especulativa.

El proceso de entrenamiento incluye dos fases diferenciadas: primero, una fase de "abliteration" que elimina los mecanismos de rechazo y censura del modelo base, y segundo, una fase de "abliteration-repair" que restaura las capacidades tecnicas que pudieran haberse degradado durante la primera fase. Esta combinacion, denominada "Ektome" y "surrogate-null" en los tags del modelo, busca producir un modelo sin restricciones que mantenga un rendimiento cercano al original. La cuantizacion i1 realizada por mradermacher utiliza matrices de importancia (imatrix) para optimizar la calidad de los pesos cuantizados.

## Capacidades

- Generacion de texto sin censura ni rechazos en ingles, incluyendo contenido que el modelo base Qwen3.8 rechazaria.
- Razonamiento y resolucion de problemas matematicos y logicos, conservando las capacidades del modelo base.
- Generacion de codigo en multiples lenguajes de programacion.
- Capacidades de vision: el modelo incluye el codificador de vision completo del Qwen3.8-27B, permitiendo procesamiento de imagenes.
- Prediccion multi-token (MTP) para decodificacion especulativa, acelerando la generacion de texto.
- Soporte de conversacion multi-turno y comprension de contexto largo (262k tokens).
- Capacidad de tool calling y function calling, heredada del modelo base Qwen3.8.
- Capacidades de agente y razonamiento multi-paso.

## Casos de uso

- Generacion creativa de ficcion sin restricciones: escritores y creadores de contenido pueden generar narrativas con tematicas adultas o controvertidas sin que el modelo interrumpa la generacion con rechazos.
- Investigacion sobre seguridad y alineacion de modelos: el modelo permite estudiar como se comporta un LLM sin mecanismos de rechazo, comparando sus respuestas con las del modelo base para investigar sesgos y comportamientos.
- Desarrollo de personajes para juegos de rol: creadores de videojuegos pueden usar el modelo para generar dialogos de personajes sin limitaciones tematicas.
- Analisis de contenido sensible: el modelo puede procesar y resumir documentos con contenido delicado sin rechazarlos, util en investigacion periodistica o legal.
- Generacion de codigo en entornos sin restricciones: desarrolladores que necesitan generar codigo para fines de seguridad ofensiva o pentesting pueden usar el modelo sin que rechace solicitudes potencialmente peligrosas.
- Despliegue local en hardware modesto: gracias a las cuantizaciones GGUF, el modelo puede ejecutarse en GPUs de consumo con 12-24 GB de VRAM, permitiendo inferencia local sin depender de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo base Qwen3.8-27B cuenta con benchmarks publicados por el equipo de Qwen, pero el proceso de abliteration y la cuantizacion posterior pueden alterar el rendimiento. Se recomienda evaluar el modelo en las tareas especificas de uso antes de desplegarlo en produccion.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 11 GB (cuantizacion i1-Q2_K) y 22,5 GB (cuantizacion i1-Q6_K). La cuantizacion recomendada por el autor, i1-Q4_K_M, ocupa aproximadamente 16,9 GB.
- GPU recomendadas: RTX 3090/4090 (24 GB VRAM) para cuantizaciones Q4-Q5, RTX 4080 (16 GB) para Q4_K_S, o GPUs profesionales como A100 o H100 para las cuantizaciones mas altas.
- Cabe en GPU de consumo: si, en GPUs con 12 GB o mas de VRAM usando cuantizaciones Q2-Q3, y en GPUs de 16-24 GB con cuantizaciones Q4-Q5.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, vLLM (con conversion a formato compatible), TGI.
- Latencia y throughput estimados: no disponible. La velocidad dependera de la GPU, la cuantizacion y el uso de MTP para decodificacion especulativa.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Cuantizaciones GGUF | Uncensored |
|---|---|---|---|---|---|
| Ektome-Qwen3.8-27B-PristinelyUncensored | 27,3B | 262k | Apache 2.0 | Si (i1-imatrix) | Si |
| Qwen3.8-27B (base) | 27,3B | 262k | Apache 2.0 | Si | No |
| Llama 3.1 8B Instruct | 8B | 128k | Llama 3.1 | Si | No |
| Mistral 7B Instruct | 7,2B | 32k | Apache 2.0 | Si | No |

No se dispone de datos comparativos de rendimiento entre estos modelos. La principal diferencia de Ektome-Qwen3.8-27B-PristinelyUncensored frente a sus alternativas es la ausencia de mecanismos de rechazo y su capacidad multimodal heredada del Qwen3.8-27B.

## Limitaciones y advertencias

- Modelo sin censura: el proceso de abliteration elimina los rechazos, pero tambien puede eliminar la capacidad del modelo para negarse a generar contenido peligroso, ilegal o danino. El uso en produccion debe considerar este riesgo.
- Solo soporta ingles: el modelo esta entrenado principalmente en ingles y puede degradarse significativamente en otros idiomas.
- Riesgo de alucinacion: al igual que el modelo base, puede generar informacion falsa o inventada con alta confianza.
- Rendimiento potencialmente degradado: el proceso de abliteration-repair no garantiza la restauracion completa de las capacidades del modelo base, y la cuantizacion adicional puede introducir perdidas de calidad.
- Sesgos del modelo base: el modelo puede heredar sesgos presentes en Qwen3.8-27B, incluyendo sesgos culturales, de genero o etnicos.
- Sin garantias de seguridad: al eliminar los mecanismos de rechazo, el modelo puede generar contenido que infrinja politicas de uso de plataformas o legislacion local. El responsable del despliegue debe evaluar el cumplimiento legal.
- Tamanos de archivo elevados: incluso las cuantizaciones mas pequenas ocupan 11 GB, lo que requiere hardware con suficiente capacidad de almacenamiento y memoria.

## Enlaces

- Repositorio GGUF i1-imatrix: https://huggingface.co/mradermacher/Ektome-Qwen3.8-27B-PristinelyUncensored-i1-GGUF
- Repositorio GGUF estatico: https://huggingface.co/mradermacher/Ektome-Qwen3.8-27B-PristinelyUncensored-GGUF
- Modelo base (safetensors): https://huggingface.co/Zynerji/Ektome-Qwen3.8-27B-PristinelyUncensored
- Guia de cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guia para ejecutar Qwen3.8-27B localmente: https://www.yottalabs.ai/post/how-to-run-qwen-3-8-27b-locally-ollama-gguf-single-gpu-2026
- Especificaciones de Qwen3.8-27B: https://www.yottalabs.ai/post/qwen-3-8-27b-specs-hardware-requirements-how-to-run-2026
