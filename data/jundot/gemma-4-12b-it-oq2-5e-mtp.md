# Jundot/gemma-4-12B-it-oQ2.5e-mtp

## Resumen

El modelo `Jundot/gemma-4-12B-it-oQ2.5e-mtp` es una cuantizacion mixta en formato MLX del modelo multimodal `google/gemma-4-12B-it` de Google DeepMind, publicado por el usuario Jundot. Se trata de un checkpoint de 11.959.730.224 parametros (aproximadamente 12B) que conserva la arquitectura "Unified" de la familia Gemma 4: un unico transformer decoder-only que procesa texto, imagen y audio sin encoders separados, proyectando los parches de imagen y las formas de onda de audio directamente al espacio de embeddings mediante capas lineales ligeras.

La relevancia de esta variante radica en su compresion extrema: oQ2.5e aplica precision mixta sensible a la capa, con un promedio efectivo de 3,338 bits por peso para el backbone de lenguaje y 3,771 bits por peso para el checkpoint completo, lo que reduce el almacenamiento total a 5,435 GiB. Ademas, incorpora una cabeza de prediccion multi-token (MTP) fusionada desde `google/gemma-4-12B-it-assistant`, pensada para acelerar la decodificacion especulativa.

El modelo esta pensado para ejecucion en Apple Silicon mediante la libreria MLX, con una ventana de contexto de 256K tokens y licencia Apache-2.0. Es una opcion adecuada para desarrolladores que necesitan desplegar un modelo multimodal de ~12B en hardware con memoria unificada limitada, manteniendo acceso a las capacidades nativas del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only "Unified" (sin encoders separados; proyecciones lineales para imagen y audio) |
| Parametros totales | 11.959.730.224 (~12B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 256K tokens |
| Tipos de cuantizacion | oQ2.5e mixed-precision: affine 3-bit grupo 128, affine 3-bit grupo 64, affine 4/6/8-bit grupo 64 y BF16; 3,771 bits/peso efectivos en el checkpoint completo (3,338 bits/peso en el backbone de lenguaje) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 (segun licencia Gemma 4 enlazada) |
| Formato de pesos | MLX safetensors (cuantizacion oQ de oMLX) |

## Arquitectura y entrenamiento

El modelo base `google/gemma-4-12B-it` es un transformer decoder-only de la familia Gemma 4, con un diseno "Unified": no existen encoders de vision o audio independientes. Los parches de imagen y las formas de onda de audio se proyectan directamente al espacio de embeddings mediante capas lineales ligeras (0,015B y 0,002B de parametros respectivamente), y todas las modalidades se procesan en un unico decoder con 256K tokens de contexto. La cabeza MTP (0,423B de parametros) se fusiona desde el modelo assistant de Gemma 4 para habilitar prediccion multi-token y decodificacion especulativa.

El proceso de cuantizacion oQ2.5e, implementado en oMLX 0.8.0, asigna bits por sensibilidad medida de cada capa, redondea cada grupo con una matriz de importancia (128 muestras x 512 tokens) y aplica un refit ponderado por minimos cuadrados de escala y sesgo. La distribucion resultante concentra el 87,594% de los pesos (10,846B) en affine 3-bit grupo 128, el 8,129% (1,007B) en affine 3-bit grupo 64, y deja en BF16 el 3,705% (0,459B) correspondiente a capas sensibles. El checkpoint fue re-cuantizado el 2026-11-19 con un redondeo oQe refinado que reduce el error de cuantizacion al mismo tamano y velocidad. No se dispone de informacion sobre el dataset de entrenamiento del modelo base en la documentacion proporcionada.

## Capacidades

- Generacion de texto y razonamiento conversacional (modelo instruct, sufijo `-it`).
- Procesamiento multimodal any-to-any: entrada y salida de texto, imagen y audio en un unico decoder.
- Contexto largo de hasta 256K tokens para documentos extensos y conversaciones multi-turno.
- Prediccion multi-token (MTP) mediante cabeza fusionada, habilitando decodificacion especulativa y mayor throughput.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades especiales (modo thinking, vision, audio): vision y audio confirmados por la arquitectura Unified; modo thinking no disponible.

## Casos de uso

- Asistente multimodal en local para Apple Silicon: el checkpoint cuantizado (5,435 GiB) cabe en Macs con memoria unificada de 16 GB o superior, permitiendo conversaciones con imagen y audio sin depender de la nube.
- Procesamiento de documentos extensos: la ventana de 256K tokens permite analizar contratos, informes o bases de codigo completas en una sola pasada, con el modelo base como referencia de calidad.
- Transcripcion y comprension de audio: al proyectar formas de onda directamente al espacio de embeddings, puede resumir reuniones o extraer informacion de grabaciones sin un pipeline ASR separado.
- Analisis de imagenes en flujos de trabajo de investigacion: clasificacion, descripcion y extraccion de datos de capturas o figuras cientificas, integrado en scripts Python via MLX.
- Prototipado rapido de aplicaciones any-to-any: la licencia Apache-2.0 y el formato MLX facilitan iterar sobre demos de entrada/salida mixta en entornos de desarrollo con recursos limitados.
- Evaluacion de tecnicas de cuantizacion: util como referencia practica para medir el impacto de oQ2.5e frente al modelo BF16 en tareas de razonamiento y percepcion, dado el desglose detallado de bits por capa.
- Aceleracion de inferencia con MTP: la cabeza de prediccion multi-token permite experimentar con decodificacion especulativa en produccion sobre hardware consumer.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: 5,435 GiB de pesos en el checkpoint cuantizado; con overhead de contexto y cache KV, se recomienda al menos 8-10 GB de memoria unificada para contextos moderados y 16 GB o mas para contextos largos.
- GPU recomendadas: Apple Silicon (M1/M2/M3/M4) con memoria unificada, ya que el formato es MLX; no es compatible de forma nativa con CUDA.
- Cabe en GPU consumer: si, en Macs con 16 GB de memoria unificada o superior; en GPUs NVIDIA consumer no es desplegable directamente por el formato MLX.
- Opciones de despliegue: libreria MLX y oMLX (version 0.8.0 o posterior); no se mencionan vLLM, llama.cpp, Ollama ni TGI para este checkpoint.
- Latencia y throughput: no disponibles; la inclusion de la cabeza MTP sugiere mejora de throughput mediante decodificacion especulativa, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jundot/gemma-4-12B-it-oQ2.5e-mtp | ~12B (3,771 bits/peso) | 256K | MLX safetensors | Apache-2.0 | Hugging Face (153 descargas) |
| google/gemma-4-12B-it | ~12B | 256K | safetensors (BF16) | Apache-2.0 (Gemma 4) | Hugging Face (modelo base oficial) |
| google/gemma-4-12B-it-assistant | ~12B + MTP | 256K | safetensors | Apache-2.0 (Gemma 4) | Hugging Face (origen de la cabeza MTP) |

La comparativa se limita a las variantes de la propia familia Gemma 4 documentadas en la informacion proporcionada; no se dispone de datos de rendimiento para confrontar con modelos de otros autores.

## Limitaciones y advertencias

- La cuantizacion a ~3,77 bits/peso efectivos introduce perdida de precision respecto al modelo base BF16; el autor indica que el redondeo oQe refinado reduce el error, pero no cuantifica la degradacion resultante.
- El checkpoint esta en formato MLX y solo es ejecutable en el ecosistema Apple (MLX/oMLX); no sirve para despliegues CUDA, vLLM, llama.cpp, Ollama o TGI.
- No se dispone de informacion sobre sesgos, tasas de alucinacion ni comportamiento multilingue del modelo base en la documentacion facilitada.
- La licencia Apache-2.0 remite a la licencia Gemma 4 de Google; deben revisarse las condiciones especificas de uso comercial y redistribucion en el enlace oficial antes de produccion.
- El modelo fue actualizado el 2026-11-19; copias anteriores presentan mayor error de cuantizacion y deben descartarse.
- El repo ocupa 10,9 GB, superior al tamano de los pesos cuantizados (5,836 GB), probablemente por artefactos adicionales; conviene verificar el contenido antes de descargar.
- No hay datos publicados de benchmarks, latencia ni throughput, lo que impide validar su rendimiento frente al modelo base.

## Enlaces

- Hugging Face: https://huggingface.co/Jundot/gemma-4-12B-it-oQ2.5e-mtp
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Modelo assistant (origen de la cabeza MTP): https://huggingface.co/google/gemma-4-12B-it-assistant
- Repositorio oMLX: https://github.com/jundot/omlx
- PR oQe: https://github.com/jundot/omlx/pull/4930
- PR refinamiento de redondeo oQe: https://github.com/jundot/omlx/pull/5292
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
