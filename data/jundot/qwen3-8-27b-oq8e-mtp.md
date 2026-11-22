# Jundot/Qwen3.8-27B-oQ8e-mtp

## Resumen

Qwen3.8-27B-oQ8e-mtp es una cuantizacion mixta de precision del modelo Qwen/Qwen3.8-27B, un modelo denso de vision-lenguaje de 27.781 millones de parametros construido sobre la arquitectura Qwen3.5. La publica Jundot mediante su herramienta oQ (oMLX v0.8.0), un esquema de cuantizacion que asigna bits por sensibilidad medida de cada capa en lugar de aplicar una precision uniforme. El checkpoint incluye el backbone de lenguaje, el codificador visual y la cabeza de prediccion multi-token (MTP).

El modelo base combina capas Gated DeltaNet con capas de atencion con compuerta (Gated Attention) en un diseno hibrido, procesa imagen y video ademas de texto, y ofrece una ventana de contexto nativa de 262.144 tokens. La cuantizacion reduce el peso del checkpoint a 27.941 GiB con una media efectiva de 8.639 bits por peso, lo que permite ejecutar un modelo de 27B con vision en hardware Apple Silicon con memoria unificada, manteniendo una fidelidad numerica cercana a la de los pesos originales.

Su relevancia practica esta en que preserva las capacidades multimodales y de contexto largo del modelo original con una perdida de precision minima (98,143% de los pesos en 8 bits afines con grupo 64 y solo un 1,857% en BF16 reservado para las capas mas sensibles), y anade la cabeza MTP para decodificacion especulativa, lo que mejora el throughput de generacion en inferencia local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con capas Gated DeltaNet y Gated Attention, mas codificador visual y cabeza MTP (arquitectura Qwen3.5) |
| Parametros totales | 27.781.427.952 (27.781B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens nativos |
| Tipos de cuantizacion | oQ8e (mixta): 8 bits afines con grupo 64 (98,143% de pesos) y BF16 (1,857%); media efectiva 8,639 bits/peso en el checkpoint completo y 8,501 en el backbone |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria MLX) |
| Tamano del repositorio | 30,0 GB (27,941 GiB) |
| Desglose de almacenamiento | Backbone 26,617 GiB; codificador visual 0,858 GiB; cabeza MTP 0,466 GiB |
| Pipeline | image-text-to-text |
| Descargas / likes | 2.937 / 16 |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso de 27B con un layout hibrido: intercala capas Gated DeltaNet, un mecanismo de estado recurrente con compuerta, con capas de Gated Attention clasicas. Esta combinacion busca reducir el coste de atencion en contextos largos manteniendo la calidad de recuperacion de informacion. Incorpora un codificador visual de 0,461B de parametros para entrada de imagen y video, y una cabeza de prediccion multi-token (MTP) de 0,425B que permite decodificacion especulativa: el modelo predice varios tokens por paso y un verificador los valida, aumentando el throughput sin cambiar la distribucion de salida.

Sobre el entrenamiento del modelo original no se dispone de datos en la informacion proporcionada (numero de tokens, composicion del dataset, fases de RLHF o DPO). La informacion disponible corresponde exclusivamente al proceso de cuantizacion: oQ8e asigna bits segun la sensibilidad medida de cada capa, redondea cada grupo con una matriz de importancia calculada sobre 128 muestras de 512 tokens, y aplica un reajuste por minimos cuadrados ponderados de la escala y el sesgo de cada grupo. La version actual (actualizada el 2026-11-19) emplea el redondeo oQe refinado de oMLX 0.8.0, que reduce el error de cuantizacion al mismo tamano y velocidad que versiones anteriores.

## Capacidades

- Generacion de texto y razonamiento en conversaciones multi-turno.
- Comprension de imagen y video (pipeline image-text-to-text), con codificador visual dedicado.
- Contexto largo de hasta 262.144 tokens, adecuado para documentos extensos, transcripciones o bases de codigo completas.
- Decodificacion especulativa mediante la cabeza MTP incluida en el checkpoint.
- Capacidades multilingues: no se detallan los idiomas concretos en la informacion disponible.
- Soporte de tool calling y function calling: no confirmado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion disponible.
- Modo thinking explicito: no confirmado en la informacion disponible.

## Casos de uso

- Analisis de documentos extensos con imagenes intercaladas: informes financieros, contratos escaneados o papers con figuras, aprovechando la ventana de 262.144 tokens para procesar el documento completo sin troceado ni perdida de contexto entre secciones.
- Descripcion y extraccion de informacion de video: el codificador visual y la ventana larga permiten resumir grabaciones, generar subtitulos o indexar contenido audiovisual en un pipeline local sobre Apple Silicon.
- Asistencia tecnica sobre bases de codigo: con contexto nativo de 262.144 tokens se puede cargar un repositorio de tamano medio y responder preguntas de arquitectura o depuracion manteniendo la coherencia entre ficheros.
- Inferencia local en estaciones de trabajo Mac: el checkpoint de 27,941 GiB en MLX encaja en equipos con memoria unificada de 32 GB o superior, lo que habilita prototipos de vision-lenguaje sin GPU dedicada ni coste de API.
- Generacion aumentada por recuperacion (RAG) multimodal: indexar capturas de pantalla, diagramas y texto en un mismo almacenamiento y responder consultas que requieran combinar ambas modalidades en una sola pasada.
- Evaluacion y experimentacion en investigacion: al ser una cuantizacion de 8 bits con error controlado por capa, sirve para reproducir resultados del modelo original en entornos con menos memoria, comparando la degradacion frente a BF16.
- Procesamiento por lotes de imagenes con texto asociado: catalogacion de inventarios, clasificacion de tickets con adjuntos o moderacion de contenido visual, ejecutando el modelo en local con la cabeza MTP para acelerar la generacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM o memoria unificada estimada: 27,941 GiB solo para pesos; con overhead de contexto y cache KV conviene reservar 32 GB o mas. Para contextos cercanos a 262.144 tokens el consumo de cache KV crece de forma significativa y puede requerir 48-64 GB.
- GPU recomendadas: el formato es MLX, por lo que el destino natural son chips Apple (series M1/M2/M3/M4, especialmente variantes Pro, Max y Ultra). No es un checkpoint pensado para CUDA.
- Cabe en GPU de consumo: si, en equipos Apple Silicon con memoria unificada de 32 GB o superior. No es directamente utilizable en RTX 4090 (24 GB) por formato y por tamano.
- Opciones de despliegue: runtime MLX y oMLX (herramienta del autor); no se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponibles. La cabeza MTP esta incluida y habilita decodificacion especulativa, pero no se publican cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Jundot/Qwen3.8-27B-oQ8e-mtp | 27,781B | 262.144 | Si (imagen y video) | Apache-2.0 | safetensors MLX, 8,639 bits/peso | Cuantizacion mixta oQ8e con cabeza MTP |
| Qwen/Qwen3.8-27B (original) | 27,781B | 262.144 | Si (imagen y video) | Apache-2.0 | safetensors BF16 | Modelo base sin cuantizar; mayor huella de memoria |
| Alternativas de ~27B densas con vision | No disponible | No disponible | No disponible | No disponible | No disponible | No se dispone de datos verificables en la informacion proporcionada |

## Limitaciones y advertencias

- Al ser una cuantizacion de 8 bits, existe una degradacion numerica respecto al modelo original; el autor la minimiza con asignacion por sensibilidad y reajuste por minimos cuadrados, pero no se publican metricas de la perdida de calidad resultante.
- La model card no documenta sesgos conocidos del modelo base ni del proceso de cuantizacion.
- Riesgo de alucinacion inherente a los modelos de lenguaje, no cuantificado en la informacion disponible; en tareas de extraccion de datos de imagenes conviene validar las salidas.
- Idiomas soportados no especificados: no se puede garantizar un rendimiento uniforme fuera del ingles y el chino sin evaluacion previa.
- El checkpoint esta en formato MLX y depende del runtime oMLX; no es portable a ecosistemas CUDA sin conversion adicional, lo que limita su despliegue en infraestructura GPU convencional.
- La licencia Apache-2.0 permite uso comercial, pero se hereda del modelo base y conviene revisar las condiciones de Qwen/Qwen3.8-27B para confirmar que no anaden restricciones.
- El repositorio se actualizo el 2026-11-19 con un re-cuantizado; si se descargo una copia anterior, el autor recomienda volver a descargarla para obtener el redondeo oQe refinado.
- El consumo de cache KV con 262.144 tokens de contexto puede exceder la memoria disponible en equipos de 32 GB, por lo que en la practica el contexto util sera menor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jundot/Qwen3.8-27B-oQ8e-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio de oQ / oMLX: https://github.com/jundot/omlx
- Pull request de mejora oQe: https://github.com/jundot/omlx/pull/4930
- Pull request de refinamiento del redondeo oQe: https://github.com/jundot/omlx/pull/5292
