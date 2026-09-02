# mradermacher/gemma-4-31b-it-3MPER0RR-abliterated-GGUF

## Resumen

Este repositorio contiene cuantizaciones GGUF del modelo `3MPER0RR/gemma-4-31b-it-3MPER0RR-abliterated`, una versión "abliterated" (con las restricciones de seguridad eliminadas) del modelo Gemma 4 31B de Google, orientado a instrucciones. El autor de la cuantización, mradermacher, ofrece una amplia gama de formatos GGUF (desde Q2_K hasta Q8_0) junto con archivos de proyector multimodal (mmproj), lo que permite ejecutar el modelo en entornos locales con distintas capacidades de hardware.

El modelo base pertenece a la familia Gemma 4, que según la documentación de Google DeepMind presenta una ventana de contexto de hasta 256K tokens, soporte multilingüe en más de 140 idiomas y está diseñado para tareas de razonamiento, codificación y comprensión multimodal. La versión abliterated elimina los mecanismos de rechazo de contenido, lo que la hace atractiva para casos de uso que requieren generación sin censura, aunque con los riesgos asociados.

Al tratarse de una cuantización GGUF, el modelo se puede ejecutar con herramientas como llama.cpp, Ollama o LM Studio, y es compatible con la librería transformers de HuggingFace. El repositorio incluye 12 archivos de cuantización más dos proyectores multimodales, sumando un total de 213.9 GB en el repositorio.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4), no se especifica si es denso o MoE |
| Parametros totales | 30.697.345.596 (~30.7B) |
| Parametros activos | no disponible |
| Longitud de contexto | Hasta 256K tokens (según documentación de Gemma 4) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | Inglés (según la model card), aunque Gemma 4 soporta 140+ idiomas |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors no incluido en este repo) |

## Arquitectura y entrenamiento

El modelo base es `3MPER0RR/gemma-4-31b-it-3MPER0RR-abliterated`, que a su vez deriva de `google/gemma-4-31B`. Según la documentación de Google DeepMind, Gemma 4 está disponible en cinco tamaños (2B, 4B, 12B, 26B A4B y 31B) y combina arquitecturas densas y de mezcla de expertos (MoE). Para el tamaño de 31B no se especifica públicamente si es denso o MoE, por lo que este dato se considera no disponible.

El proceso de "abliteration" consiste en eliminar o atenuar las capas de rechazo de contenido del modelo original, de modo que el modelo responda a solicitudes que normalmente serían bloqueadas por las políticas de seguridad. Este proceso se aplica sobre el checkpoint ya entrenado, sin modificar los pesos de las capas de conocimiento. No se dispone de información detallada sobre el dataset de entrenamiento, el número de tokens procesados o si se aplicaron técnicas de RLHF o DPO en el modelo original.

La cuantización GGUF realizada por mradermacher es una conversión estática de los pesos a formato GGUF, con opciones de cuantización que van desde 2 bits hasta 8 bits. También se incluyen proyectores multimodales (mmproj) en f16 y Q8_0, lo que sugiere que el modelo base tiene capacidades de visión que se pueden activar con estos archivos adicionales.

## Capacidades

- Generación de texto y razonamiento: al ser una versión de instrucciones de Gemma 4, es capaz de mantener conversaciones multi-turno, responder preguntas y realizar tareas de razonamiento complejo.
- Codificación: Gemma 4 está optimizado para tareas de programación, incluyendo generación de código, depuración y explicación de fragmentos.
- Comprensión multimodal: los archivos mmproj incluidos permiten procesar imágenes junto con texto, aunque se requiere el proyector adecuado y un runtime compatible.
- Soporte de agentes y flujos de trabajo: la documentación de Gemma 4 menciona su idoneidad para agentes y razonamiento multi-paso, aunque no se especifica si esta versión abliterated conserva todas las capacidades de tool calling.
- Multilingüe: aunque la model card indica solo inglés, la familia Gemma 4 soporta más de 140 idiomas; la versión abliterated podría conservar ese soporte, pero no está confirmado.
- Generación sin censura: al estar abliterated, el modelo no aplica los filtros de seguridad habituales, permitiendo generar contenido que el modelo original rechazaría.

## Casos de uso

- Generación de contenido creativo sin restricciones: escritores y creadores pueden usar el modelo para producir narrativa, poesía o guiones que aborden temas sensibles sin que el modelo se niegue a responder, gracias a la abliteración.
- Asistente de código en entornos de desarrollo: el modelo puede integrarse en editores o pipelines de CI/CD para generar código, revisar fragmentos o documentar APIs, aprovechando su capacidad de razonamiento y su contexto largo de hasta 256K tokens.
- Chatbot de atención al cliente con contexto amplio: con una ventana de 256K tokens, puede mantener conversaciones largas y recordar detalles de interacciones anteriores, aunque al ser abliterated habría que supervisar las respuestas para evitar contenido inapropiado.
- Análisis de documentos extensos: gracias al contexto de 256K, puede resumir o extraer información de libros, informes o contratos de gran tamaño sin necesidad de dividirlos.
- Investigación en IA de seguridad: los investigadores pueden estudiar el comportamiento de un modelo sin filtros para analizar sesgos, alucinaciones o riesgos de contenido, comparándolo con la versión original.
- Prototipado de aplicaciones multimodales: usando los proyectores mmproj, se pueden construir demos que combinen entrada de imágenes y texto, por ejemplo para descripción de imágenes o preguntas visuales, en un entorno local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de rendimiento, y la búsqueda web no arroja datos específicos para esta versión abliterated. Se recomienda consultar los benchmarks oficiales de Gemma 4 en el repositorio de Google para tener una referencia del modelo base, aunque la abliteración puede alterar ligeramente el rendimiento en tareas de seguridad.

## Requisitos de hardware

- VRAM estimada para inferencia: depende de la cuantización elegida. Por ejemplo, el archivo Q4_K_M ocupa 18.8 GB, por lo que se necesitan al menos 20 GB de VRAM para cargarlo con overhead. El Q8_0 (32.7 GB) requiere más de 35 GB de VRAM.
- GPU recomendadas: para cuantizaciones Q4_K_M o menores, una GPU con 24 GB de VRAM (RTX 3090, RTX 4090) puede ser suficiente. Para Q6_K o Q8_0, se recomienda una A6000 (48 GB) o A100 (40/80 GB). El Q2_K (12 GB) cabe en GPUs de 16 GB como la RTX 4080 o incluso en algunas de 12 GB con ajustes.
- Si cabe en consumer GPU: sí, las cuantizaciones Q2_K, Q3_K y Q4_K pueden ejecutarse en GPUs de consumo con 16-24 GB de VRAM, aunque con menor calidad.
- Opciones de despliegue: al ser GGUF, es compatible con llama.cpp, Ollama, LM Studio, KoboldCpp y servidores como llama-cpp-python. También se puede usar con transformers si se convierte a safetensors, aunque no es el propósito de este repo.
- Latencia y throughput: no se dispone de datos medidos. En general, un modelo de 31B en Q4_K_M en una RTX 4090 puede generar entre 10 y 20 tokens por segundo, pero esto es una estimación orientativa.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa cuantitativa con otros modelos abliterated de tamaño similar. A continuación se presenta una comparación cualitativa basada en información pública de la familia Gemma 4:

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| google/gemma-4-31B (original) | ~31B | 256K | Gemma Terms of Use | HuggingFace |
| 3MPER0RR/gemma-4-31b-it-3MPER0RR-abliterated | ~31B | 256K (presumible) | no disponible | HuggingFace |
| mradermacher/gemma-4-31b-it-3MPER0RR-abliterated-GGUF | ~31B | 256K (presumible) | no disponible | HuggingFace (GGUF) |

La principal diferencia entre el modelo original y las versiones abliterated es la eliminación de los filtros de seguridad. En cuanto a rendimiento, no hay benchmarks públicos que comparen ambas versiones. Otras alternativas abliterated de tamaño similar (como Llama 4 o Qwen 3.6) existen, pero no se dispone de datos comparativos en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: al ser una versión abliterated, el modelo puede reproducir sesgos y contenido dañino sin filtro, lo que lo hace inadecuado para aplicaciones donde se requiera moderación.
- Riesgo de alucinación: como cualquier modelo generativo, puede inventar información, especialmente en temas de actualidad o datos específicos. La abliteración no corrige este problema.
- Limitaciones de contexto e idioma: aunque Gemma 4 soporta 256K tokens, la versión abliterated solo declara inglés en su model card; el soporte multilingüe no está confirmado.
- Restricciones de licencia: la licencia no está especificada en el repositorio. El modelo base de Google tiene su propia licencia (Gemma Terms of Use), pero la versión abliterated y su cuantización pueden tener condiciones adicionales. Se recomienda contactar al autor antes de un uso comercial.
- Riesgo de uso indebido: al no tener filtros de seguridad, el modelo puede generar contenido ilegal, violento o sexualmente explícito. No debe desplegarse en entornos de producción sin supervisión humana y sin políticas de uso claras.
- Compatibilidad multimodal: los proyectores mmproj son complementos opcionales; si no se usan, el modelo funciona solo con texto. La integración de visión requiere un runtime que soporte estos archivos.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/mradermacher/gemma-4-31b-it-3MPER0RR-abliterated-GGUF
- Modelo base (3MPER0RR): https://huggingface.co/3MPER0RR/gemma-4-31b-it-3MPER0RR-abliterated
- Modelo original de Google: https://huggingface.co/google/gemma-4-31B
- Página de Gemma 4 en DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Cuantizaciones con imatrix (variante i1): https://huggingface.co/mradermacher/gemma-4-31b-it-3MPER0RR-abliterated-i1-GGUF
- Guía de modelos abliterated (referencia externa): https://locallyuncensored.com/blog/abliterated-models-guide.html
