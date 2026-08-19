# akpsahan/gemma-4-26B-A4B-it-ultra-uncensored-heretic-i1-GGUF

## Resumen

Este repositorio contiene cuantizaciones GGUF del modelo `llmfan46/gemma-4-26B-A4B-it-ultra-uncensored-heretic`, una variante de la familia Gemma 4 que ha sido sometida a un proceso de "abliteration" para eliminar los mecanismos de rechazo y censura del modelo original. El resultado es un modelo etiquetado como "uncensored" o "decensored", orientado a generar respuestas sin filtros de seguridad. El nombre "A4B" indica una arquitectura de mezcla de expertos (MoE) con aproximadamente 26 000 millones de parámetros totales y 4 000 millones de parámetros activos por token, aunque esta información no está confirmada explícitamente en la documentación proporcionada.

El repositorio actual, publicado por el usuario `akpsahan`, es una versión cuantizada con la técnica `imatrix` (i1) por el conocido cuantizador `mradermacher`, que ofrece una amplia gama de niveles de compresión, desde `IQ1_S` (8,4 GB) hasta `Q4_K_M` (16,1 GB). Está pensado para su uso con motores de inferencia compatibles con GGUF como llama.cpp, Ollama o LM Studio, y está dirigido a desarrolladores que necesitan ejecutar el modelo en hardware local o en entornos con recursos limitados. El modelo base también es un modelo de visión, por lo que los archivos de proyección multimodal (`mmproj`) están disponibles en el repositorio estático asociado.

La relevancia de este modelo radica en su carácter "sin censura", un nicho que atrae a investigadores y desarrolladores que trabajan en áreas como la generación creativa de contenido, el análisis de textos controvertidos o la investigación sobre alineación y seguridad de modelos. Sin embargo, su uso conlleva riesgos importantes, ya que al eliminar los mecanismos de rechazo, el modelo puede generar contenido ofensivo, peligroso o ilegal sin restricciones. La licencia declarada es `apache-2.0`, aunque el enlace apunta a la licencia específica de Gemma 4, que puede incluir términos adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE), inferida del nombre "A4B"; no confirmada oficialmente |
| Parametros totales | 25 233 142 046 (~25,2 B) |
| Parametros activos | 4 B (inferido del nombre "A4B"; no confirmado) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K, i1-Q2_K_S, i1-IQ3_XXS, i1-IQ3_XS, i1-IQ3_S, i1-Q3_K_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_1, i1-Q4_K_M (lista parcial) |
| Idiomas soportados | Ingles (segun tags) |
| Licencia | Apache-2.0 (con enlace a la licencia de Gemma 4) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Gemma 4 26B A4B, un modelo de mezcla de expertos (MoE) que activa 4 000 millones de parámetros por token. Sin embargo, la información proporcionada no incluye detalles técnicos sobre la configuración exacta de los expertos, la atención, ni el proceso de entrenamiento original. El modelo base ha sido modificado mediante una técnica denominada "abliteration" (también etiquetada como "decensored" o "heretic"), que consiste en eliminar o neutralizar las capas responsables del rechazo de solicitudes consideradas peligrosas o no éticas. Este proceso se aplica sobre el modelo ya entrenado, sin reentrenamiento completo, y da como resultado un modelo que responde sin filtros de seguridad.

La cuantización se ha realizado con la técnica `imatrix` (importance matrix), que optimiza la asignación de bits en función de la importancia de cada peso para la perplejidad del modelo. Los archivos `i1-*` son cuantizaciones con esta matriz de importancia, mientras que los `Q*` son cuantizaciones estándar. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO.

## Capacidades

- Generacion de texto y conversacion multi-turno en ingles.
- Capacidades de vision (el modelo base es un modelo de vision; los archivos `mmproj` estan disponibles en el repositorio estatico).
- Respuestas sin censura ni rechazo gracias al proceso de abliteration.
- Compatible con herramientas de inferencia GGUF (llama.cpp, Ollama, LM Studio, etc.).
- Soporte de cuantizacion con matriz de importancia (imatrix) para optimizar la calidad en bajos bitrates.
- No se ha confirmado soporte de tool calling, function calling ni modo agente.

## Casos de uso

- Generacion creativa de contenido sin restricciones: el modelo puede producir textos literarios, guiones o dialogos que aborden temas tabu o controvertidos sin autocensura, lo que resulta util para escritores y creadores que exploran limites narrativos.
- Investigacion academica sobre alineacion y seguridad: los investigadores pueden estudiar el comportamiento de un modelo sin mecanismos de rechazo para entender como se manifiestan los sesgos y los riesgos de contenido peligroso, comparandolo con la version original censurada.
- Analisis de textos con lenguaje explicito: en tareas de procesamiento de lenguaje natural que requieren manejar vocabulario ofensivo o explicito (por ejemplo, moderacion de contenido o deteccion de discurso de odio), este modelo puede servir como generador de ejemplos dificiles.
- Desarrollo de aplicaciones de rol o simulacion de personajes: al no rechazar solicitudes, el modelo puede mantener personajes con personalidades extremas o comportamientos no eticos en entornos de simulacion, algo que los modelos censurados suelen bloquear.
- Pruebas de robustez de sistemas de seguridad: los equipos de seguridad de IA pueden usar este modelo para evaluar la eficacia de sus propios filtros y sistemas de moderacion, generando entradas adversariales.
- Despliegue en entornos offline con recursos limitados: gracias a las cuantizaciones GGUF de bajo bitrate (por ejemplo, IQ1_S de 8,4 GB), el modelo puede ejecutarse en equipos con GPUs de gama media o incluso en CPU, permitiendo experimentacion local sin conexion a internet.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni otras metricas estandar. El rendimiento real dependera de la cuantizacion elegida y del hardware utilizado.

## Requisitos de hardware

- VRAM estimada: desde 8,4 GB (cuantizacion i1-IQ1_S) hasta 16,1 GB (i1-Q4_K_M). Las cuantizaciones mas bajas (IQ1, IQ2) pueden caber en GPUs con 8-12 GB de VRAM, mientras que las de mayor calidad (Q4) requieren al menos 16 GB.
- GPUs recomendadas: para las cuantizaciones mas bajas, una RTX 3060/4060 de 12 GB o similar es suficiente. Para Q4_K_M, se recomienda una RTX 4080/4090 o una GPU profesional como A100 (40 GB) para mayor margen.
- En CPU: las cuantizaciones IQ1 e IQ2 pueden ejecutarse en sistemas con 16-32 GB de RAM, aunque la velocidad sera limitada.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp, text-generation-webui (con backend llama.cpp). Tambien es compatible con servidores como llama-cpp-python para API locales.
- Latencia y throughput: no disponibles. Dependen del hardware y de la cuantizacion. En una GPU moderna con Q4_K_M, se puede esperar una generacion de 20-40 tokens por segundo, pero no hay datos confirmados.

## Comparativa con modelos similares

No se dispone de informacion suficiente para realizar una comparativa fiable con otros modelos. El modelo base es una variante no oficial de Gemma 4, y no existen datos publicos de rendimiento. Como referencia general, los modelos MoE de tamano similar (por ejemplo, Mixtral 8x7B o Qwen 25B A4B) suelen ofrecer un equilibrio entre calidad y velocidad, pero no se pueden establecer comparaciones numericas sin benchmarks.

## Limitaciones y advertencias

- Modelo sin censura: al eliminar los mecanismos de rechazo, el modelo puede generar contenido ofensivo, violento, ilegal o sexualmente explicito sin advertencias. No es apto para aplicaciones orientadas al publico general sin un sistema de moderacion externo.
- Sesgos y alucinaciones: no se ha realizado una evaluacion de sesgos. Como cualquier modelo de lenguaje, puede inventar informacion, especialmente en temas de actualidad o muy especificos.
- Idioma: solo se ha confirmado soporte para ingles. El rendimiento en otros idiomas es desconocido y probablemente inferior.
- Licencia: aunque se declara Apache-2.0, el enlace apunta a la licencia de Gemma 4, que puede incluir restricciones adicionales (por ejemplo, prohibicion de uso para ciertos fines o requisitos de atribucion). Se recomienda revisar los terminos completos antes de un despliegue comercial.
- Contexto: se desconoce la longitud de contexto soportada. Los modelos Gemma suelen manejar 8K o 32K tokens, pero no hay confirmacion para esta variante.
- Calidad de cuantizacion: las cuantizaciones de muy bajo bitrate (IQ1, IQ2) pueden degradar significativamente la calidad de las respuestas, especialmente en tareas de razonamiento complejo.
- Origen no oficial: el modelo base es una modificacion de terceros sobre Gemma 4, no publicada por Google. No hay garantias de calidad, seguridad ni soporte.

## Enlaces

- Repositorio HuggingFace del GGUF: https://huggingface.co/akpsahan/gemma-4-26B-A4B-it-ultra-uncensored-heretic-i1-GGUF
- Modelo base (llmfan46): https://huggingface.co/llmfan46/gemma-4-26B-A4B-it-ultra-uncensored-heretic
- Repositorio estatico de cuantizaciones (mradermacher): https://huggingface.co/mradermacher/gemma-4-26B-A4B-it-ultra-uncensored-heretic-GGUF
- Pagina de descarga conveniente (hf.tst.eu): https://hf.tst.eu/model#gemma-4-26B-A4B-it-ultra-uncensored-heretic-i1-GGUF
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
