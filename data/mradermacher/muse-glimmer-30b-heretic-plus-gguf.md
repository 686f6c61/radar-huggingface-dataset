# mradermacher/Muse-Glimmer-30B-heretic-plus-GGUF

## Resumen

Muse-Glimmer-30B-heretic-plus-GGUF es una cuantización en formato GGUF del modelo base `gjtgjt/Muse-Glimmer-30B-heretic-plus`, realizada por mradermacher. Se trata de un modelo multimodal (image-text-to-text) de aproximadamente 27.850 millones de parámetros, con licencia Apache 2.0 y soporte para inglés, chino y otros idiomas. La variante "heretic-plus" se presenta como una versión "uncensored" y "abliterated", es decir, con eliminación de los mecanismos de rechazo o censura típicos en modelos alineados.

La relevancia de esta ficha radica en que ofrece pesos cuantizados listos para ejecución local mediante herramientas como llama.cpp u Ollama, lo que facilita el despliegue en hardware de consumo sin necesidad de GPUs de gran tamaño. Incluye además ficheros multimodales (mmproj) para procesar imágenes, lo que amplía su utilidad en escenarios que combinan visión y lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 27.854.794.240 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | en, zh, multilingual |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base. Por las etiquetas y el pipeline declarado, se trata de un modelo multimodal (image-text-to-text) basado en transformers, pero no se especifica si es un decoder puro, un encoder-decoder o si incorpora mecanismos como atención lineal o mezcla de expertos. Tampoco hay datos sobre el número de tokens de entrenamiento, la composición del dataset o el uso de técnicas de alineación como RLHF o DPO.

La cuantización realizada por mradermacher es estática (sin imatrix) y se ha generado a partir de los pesos originales en formato HuggingFace. Se incluyen dos ficheros multimodales (mmproj) en Q8_0 y f16 para el procesamiento de imágenes, lo que sugiere que el modelo base incorpora un proyector visual.

## Capacidades

- Generación de texto conversacional en múltiples idiomas (inglés, chino y otros).
- Procesamiento de imágenes junto con texto (image-text-to-text), gracias a los ficheros mmproj incluidos.
- Variante "uncensored" y "abliterated": se ha eliminado el rechazo a ciertos contenidos, lo que permite respuestas sin filtros en temas sensibles.
- Soporte para inferencia local mediante GGUF, compatible con llama.cpp, Ollama y otros motores que acepten este formato.
- No se ha confirmado soporte para tool calling, function calling, razonamiento multi-paso o modo "thinking" en la información disponible.

## Casos de uso

- Asistente conversacional local: desplegar un chatbot multimodal en una máquina sin conexión a internet, utilizando los ficheros GGUF con llama.cpp u Ollama. La cuantización Q4_K_M (17 GB) permite ejecutarlo en GPUs de consumo con 24 GB de VRAM.
- Descripción de imágenes para accesibilidad: dado el componente visual, puede generar descripciones de fotografías o gráficos, útil en aplicaciones de ayuda a personas con discapacidad visual.
- Generación de contenido creativo sin restricciones: la variante "uncensored" permite explorar narrativas o diálogos en temas que otros modelos rechazan, aunque debe usarse con responsabilidad.
- Análisis de documentos mixtos: combinar texto e imágenes en un mismo prompt para extraer información de capturas de pantalla, diagramas o formularios.
- Traducción asistida por contexto visual: al soportar varios idiomas y entrada de imágenes, puede ayudar a interpretar carteles o instrucciones visuales en distintos idiomas.
- Prototipado rápido de aplicaciones multimodales: gracias al formato GGUF, es posible integrar el modelo en entornos de desarrollo con requisitos de hardware moderados, sin depender de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada según cuantización: Q2_K (10,8 GB) puede caber en GPUs de 12 GB, aunque con margen justo; Q4_K_M (17 GB) requiere al menos 20 GB de VRAM para inferencia cómoda; Q8_0 (29,7 GB) necesita GPUs de 32 GB o más.
- GPU recomendadas: RTX 3090, RTX 4090, A100, H100 o cualquier GPU con 24 GB o más para las cuantizaciones medias (Q4_K_M, Q5_K_M). Para Q8_0 se recomienda al menos 32 GB.
- En consumer GPU: sí, las versiones Q4_K_S y Q4_K_M son viables en una RTX 3090/4090 (24 GB). Las cuantizaciones más bajas (Q2_K, Q3_K) pueden funcionar en GPUs de 12-16 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui con backend llama.cpp, o servidores compatibles con GGUF como llama-cpp-python.
- Latencia y throughput: no se dispone de datos medidos. Dependerá de la GPU, la cuantización y la longitud de la secuencia.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables con la misma combinación de tamaño, multimodalidad y licencia en la información proporcionada.

## Limitaciones y advertencias

- Al ser una variante "uncensored" y "abliterated", el modelo puede generar contenido ofensivo, ilegal o perjudicial sin filtros. No es adecuado para aplicaciones comerciales orientadas al público general sin una moderación adicional.
- Riesgo de alucinaciones: como cualquier modelo de lenguaje, puede inventar información, especialmente en contextos largos o ambiguos.
- No se dispone de la longitud de contexto oficial; se recomienda probar con secuencias cortas para evitar degradación del rendimiento.
- El soporte multilingüe se declara como "en, zh, multilingual", pero no se especifica la calidad en otros idiomas; el rendimiento fuera de inglés y chino puede ser inferior.
- La cuantización estática (sin imatrix) puede tener una pérdida de calidad mayor que las versiones con imatrix, según el análisis de la comunidad.
- Licencia Apache 2.0 permite uso comercial, pero se debe respetar la atribución y las condiciones de la licencia sobre el modelo base si las hubiera.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Muse-Glimmer-30B-heretic-plus-GGUF
- Modelo base: https://huggingface.co/gjtgjt/Muse-Glimmer-30B-heretic-plus
- Página de descargas del autor: https://hf.tst.eu/model#Muse-Glimmer-30B-heretic-plus-GGUF
- Guía de uso de GGUF de TheBloke (referencia): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
