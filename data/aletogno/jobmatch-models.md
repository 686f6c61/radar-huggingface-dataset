# Aletogno/jobmatch-models

## Resumen

`Aletogno/jobmatch-models` es un repositorio de distribución de pesos, no un modelo único. Lo publica el desarrollador Aletogno como paquete de recursos para JobMatch, una aplicación iOS nativa en Swift que ejecuta toda la inferencia en el dispositivo. El repositorio agrupa cuatro componentes bajo prefijos separados: dos modelos de lenguaje en formato GGUF para llama.cpp, un modelo de embeddings y un reranker, ambos exportados a ONNX en int8 para ONNX Runtime.

El componente de mayor tamaño es Qwen/Qwen3.5-4B cuantizado a Q4_K_M, etiquetado como "Max" en la aplicación, seguido de openbmb/MiniCPM5-2B en Q8_0, etiquetado como "MiniCPM5". Los codificadores son intfloat/multilingual-e5-large y BAAI/bge-reranker-v2-m3. Cada componente conserva su procedencia y licencia originales, y el repositorio se declara explícitamente como un bundle mixto.

La relevancia de este repositorio es doble. Por un lado, documenta un patrón de despliegue on-device realista para iOS, con fijación de revisión por SHA de commit y separación estricta entre los ficheros de tokenizador de cada codificador. Por otro, el recuento de parámetros en safetensors del repositorio (7.463.013.674) no coincide con la suma de los modelos descritos en la model card, lo que conviene tener en cuenta al evaluar el contenido real del bundle.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (bundle de varios modelos: LLM transformer en GGUF, encoders en ONNX) |
| Parametros totales | 7.463.013.674 (recuento de safetensors del repo); componentes declarados: Qwen3.5-4B, MiniCPM5-2B, multilingual-e5-large, bge-reranker-v2-m3 |
| Parametros activos | No aplica (no se declara arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_K_M (Qwen3.5-4B), Q8_0 (MiniCPM5-2B), int8 (ONNX de embedder y reranker) |
| Idiomas soportados | No disponibles en la model card; el embedder upstream (multilingual-e5-large) es multilingüe |
| Licencia | Mixta ("other"/mixed): Apache-2.0 (Qwen3.5-4B, MiniCPM5-2B, bge-reranker-v2-m3), MIT (multilingual-e5-large) |
| Formato de pesos | GGUF (llama.cpp) y ONNX (ONNX Runtime) |

## Arquitectura y entrenamiento

El repositorio no entrena ningún modelo propio: redistribuye pesos de terceros. La model card no aporta detalles sobre arquitectura interna, volumen de tokens de entrenamiento, composición del dataset ni etapas de alineación (RLHF/DPO) de los modelos subyacentes; esa información debe consultarse en los repositorios upstream de Qwen, openbmb, intfloat y BAAI.

La innovación técnica relevante aquí es de empaquetado y despliegue. Los LLM se sirven como GGUF para llama.cpp a través de `rnllama.xcframework` (llama.rn), mientras que los codificadores usan ONNX Runtime. La aplicación fija un SHA de commit por modelo descargado (`MODEL_REVISION` para Max, `MINICPM_MODEL_REVISION` para MiniCPM5) en lugar de seguir `main`, de modo que un push al repositorio no altera las instalaciones ya desplegadas y la actualización de un modelo no fuerza la redescarga del otro. Los ficheros `tokenizer.json` y `tokenizer_config.json` de `embed/` y `rerank/` no son intercambiables entre sí porque usan normalizadores distintos.

## Capacidades

- Generación de texto conversacional mediante los dos LLM incluidos (Qwen3.5-4B en Q4_K_M y MiniCPM5-2B en Q8_0).
- Búsqueda semántica y recuperación mediante embeddings multilingües (multilingual-e5-large en int8 ONNX).
- Reordenación de resultados de recuperación con bge-reranker-v2-m3 en int8 ONNX.
- Ejecución completamente on-device en iOS: la aplicación descarga un único fichero `llm/` al sandbox y ejecuta la inferencia localmente.
- Soporte multilingüe en la fase de recuperación, heredado del embedder upstream; el alcance lingüístico de los LLM no se detalla en la model card.
- Tool calling, function calling, modo thinking, visión, audio y razonamiento multi-paso: no disponibles en la información proporcionada.

## Casos de uso

- Emparejamiento oferta-candidato en una app de empleo: el pipeline combina embeddings de las descripciones de puesto y de los currículos, reordena los candidatos con el reranker y genera una explicación del ajuste con el LLM, todo sin salir del dispositivo.
- Búsqueda semántica de ofertas en local: el embedder int8 permite indexar y consultar ofertas en el propio iPhone, sin enviar texto del usuario a un servidor.
- Asistente conversacional de preparación de entrevistas: Qwen3.5-4B en Q4_K_M puede mantener diálogos multi-turno en el sandbox de la app; el contexto efectivo debe validarse contra el modelo upstream, ya que la model card no lo especifica.
- Generación de cartas de presentación y resúmenes de perfil: el LLM redacta borradores a partir de los datos del usuario, con la ventaja de que el contenido sensible no abandona el dispositivo.
- Filtrado y deduplicación de ofertas: el par embedder + reranker permite agrupar ofertas casi duplicadas y priorizar las más relevantes antes de mostrarlas.
- Modo de bajo consumo en dispositivos con poca memoria: MiniCPM5-2B en Q8_0 sirve como alternativa cuando el presupuesto de memoria no permite cargar el modelo Max.
- Distribución controlada de actualizaciones de modelo: el esquema de SHA fijado por modelo permite publicar nuevas cuantizaciones sin romper instalaciones existentes ni forzar descargas cruzadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: no disponible de forma explícita. Como referencia de orden de magnitud, Qwen3.5-4B en Q4_K_M ocupa del orden de 2,5-3 GB y MiniCPM5-2B en Q8_0 del orden de 2-2,5 GB, más el overhead del runtime; los codificadores int8 añaden unos cientos de MB. Estas cifras son estimaciones, no datos publicados en la model card.
- GPU recomendadas: no aplica en el escenario objetivo (iOS on-device). Para servidor no se proporcionan recomendaciones.
- Compatibilidad con GPU de consumo: el bundle está pensado para ejecución en dispositivo Apple, no para GPU de escritorio; no se documenta soporte para RTX 4090 u otras.
- Opciones de despliegue: llama.cpp vía `rnllama.xcframework` (llama.rn) para los GGUF y ONNX Runtime para los codificadores. No se mencionan vLLM, TGI ni Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| Aletogno/jobmatch-models (bundle) | 7.463.013.674 según safetensors del repo; componentes de 4B y 2B | No disponible | GGUF + ONNX | Mixta (Apache-2.0 / MIT) | Distribución on-device para iOS |
| Qwen/Qwen3.5-4B (upstream) | 4B | No disponible | Safetensors, GGUF | Apache-2.0 | LLM generalista |
| openbmb/MiniCPM5-2B (upstream) | 2B | No disponible | GGUF | Apache-2.0 | LLM ligero |
| intfloat/multilingual-e5-large (upstream) | No disponible | No disponible | Safetensors, ONNX | MIT | Embeddings multilingües |
| BAAI/bge-reranker-v2-m3 (upstream) | No disponible | No disponible | Safetensors, ONNX | Apache-2.0 | Reranking |

La comparación directa con otros bundles on-device no está disponible en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo único: es un bundle con cuatro componentes de procedencia y licencia distintas. Cualquier uso debe respetar la licencia de cada componente por separado.
- La licencia del repositorio figura como "other"/"mixed", lo que complica la evaluación automática de compatibilidad comercial; hay que revisar el fichero LICENSE y las licencias upstream.
- Discrepancia entre el recuento de parámetros en safetensors (7.463.013.674) y la suma de los modelos descritos en la model card (4B + 2B + encoders). Conviene verificar el contenido real del repositorio antes de confiar en esa cifra.
- La model card no documenta contexto, idiomas soportados, sesgos, tasas de alucinación ni datos de entrenamiento de los LLM incluidos.
- Los tokenizadores de `embed/` y `rerank/` no son intercambiables; mezclarlos produce resultados incorrectos de forma silenciosa.
- El esquema de versionado por SHA implica que actualizar un modelo requiere un cambio deliberado en el código de la app; un push al repositorio no actualiza instalaciones existentes.
- El escenario objetivo es iOS on-device; no se documenta soporte para despliegue en servidor ni para GPU de consumo o de centro de datos.
- Al ser una redistribución de pesos de terceros, las garantías de calidad y mantenimiento dependen de los proyectos upstream.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Aletogno/jobmatch-models
- Qwen/Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- openbmb/MiniCPM5-2B-GGUF: https://huggingface.co/openbmb/MiniCPM5-2B-GGUF
- intfloat/multilingual-e5-large: https://huggingface.co/intfloat/multilingual-e5-large
- Xenova/multilingual-e5-large (export ONNX de referencia): https://huggingface.co/Xenova/multilingual-e5-large
- BAAI/bge-reranker-v2-m3: https://huggingface.co/BAAI/bge-reranker-v2-m3
