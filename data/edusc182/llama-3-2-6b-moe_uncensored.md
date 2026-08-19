# edusc182/Llama-3.2-6B-MoE_Uncensored

## Resumen

El modelo `edusc182/Llama-3.2-6B-MoE_Uncensored` es una adaptación de tipo Mixture of Experts (MoE) construida a partir de los pesos de `Llama-3.2-3B-Instruct` tras un proceso de abliteración (eliminación de las capas de rechazo del modelo original) y un posterior fine-tuning con el dataset `teknium/OpenHermes-2.5`. El autor, `edusc182`, ha combinado dos versiones abliteradas de Llama-3.2-3B-Instruct (`huihui-ai/Llama-3.2-3B-Instruct-abliterated` y `DavidAU/Llama-3.2-3B-Instruct-heretic-ablitered-uncensored`) para producir un modelo con 5.720.853.504 parámetros totales, lo que sugiere una arquitectura MoE con parámetros activos inferiores a esa cifra.

El modelo está diseñado para ofrecer respuestas sin censura ni filtros de seguridad, manteniendo las capacidades instructivas de la base Llama-3.2. Aunque su tamaño total es de aproximadamente 5,7 mil millones de parámetros, el tag `mixtral` indica que sigue un esquema de capas con múltiples expertos similar al de Mixtral, lo que podría permitir una inferencia más eficiente que un modelo denso equivalente. Sin embargo, la información pública es escasa: no se especifican detalles de arquitectura interna, contexto, idiomas soportados ni licencia.

Este modelo resulta relevante para desarrolladores que buscan alternativas abliteradas de pequeño tamaño para experimentación, prototipado o aplicaciones donde la censura del modelo base sea un obstáculo. No obstante, su adopción en producción requiere una evaluación cuidadosa de sus limitaciones y de la ausencia de garantías legales o de soporte.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) basada en transformer, similar a Mixtral (no confirmado oficialmente) |
| Parametros totales | 5.720.853.504 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `Llama-3.2-3B-Instruct`, un transformer denso de 3 mil millones de parámetros, y lo transforma en una arquitectura MoE. El tag `mixtral` sugiere que se emplea un esquema de capas con múltiples expertos y una función de enrutamiento (router) similar al de Mixtral 8x7B, aunque el número exacto de expertos y parámetros activos no se ha publicado. El proceso de abliteración elimina las representaciones internas asociadas a los mecanismos de rechazo del modelo original, dando lugar a un modelo "uncensored" que no aplica los filtros de seguridad habituales.

El fine-tuning se realizó sobre el dataset `teknium/OpenHermes-2.5`, un conjunto de instrucciones y conversaciones de alta calidad con más de un millón de ejemplos, lo que refuerza las capacidades de seguimiento de instrucciones y diálogo. No se dispone de información sobre el número de tokens de entrenamiento, el método de optimización (RLHF, DPO, etc.) ni otras innovaciones técnicas adicionales.

## Capacidades

- Generación de texto y diálogo multi-turno siguiendo instrucciones, gracias al fine-tuning con OpenHermes-2.5.
- Razonamiento básico y resolución de tareas comunes de lenguaje, heredadas de la base Llama-3.2-3B-Instruct.
- Capacidad de generar respuestas sin filtros de seguridad ni rechazo de contenido, lo que permite abordar temas que el modelo base censuraría.
- Soporte de tool calling y function calling: no confirmado; la base Llama-3.2-3B-Instruct no lo incluye de forma nativa, y no hay evidencia de que se haya añadido.
- Capacidades multilingües: no disponibles; la base Llama-3.2 tiene soporte multilingüe limitado, pero no se ha especificado para esta variante.
- No se ha reportado soporte de visión, audio ni modos de razonamiento especiales (thinking mode).

## Casos de uso

- Experimentación con modelos abliterados: investigadores y desarrolladores pueden estudiar el comportamiento de un modelo sin censura para entender los efectos de la abliteración en la calidad y el sesgo de las respuestas.
- Generación de contenido creativo sin restricciones: el modelo puede usarse para escribir narrativa, poesía o diálogos en contextos donde se requiere libertad temática, aunque debe validarse la calidad y coherencia.
- Asistentes de chat para entornos controlados: en aplicaciones donde el público objetivo no requiere filtros de seguridad (por ejemplo, investigación académica), el modelo puede actuar como asistente conversacional.
- Fine-tuning posterior sobre dominios específicos: al ser un modelo MoE de tamaño moderado, puede servir como punto de partida para adaptaciones con datasets propios, siempre que se respete la licencia (desconocida).
- Evaluación comparativa de arquitecturas MoE pequeñas: permite comparar el rendimiento de un MoE derivado de Llama-3.2 frente a otros modelos densos del mismo tamaño.
- Prototipado rápido en entornos con recursos limitados: al tener probablemente pocos parámetros activos, puede ejecutarse en GPUs de gama media, facilitando pruebas de concepto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: con los pesos en safetensors de 11.5 GB (probablemente en fp16 o fp32), la inferencia en fp16 requeriría al menos 12 GB de VRAM. Con cuantización a 4 bits (no disponible en el repo), podría reducirse a unos 4-5 GB, pero no se ofrecen archivos cuantizados.
- GPU recomendadas: para fp16, una RTX 3060 12GB, RTX 4070 o superior. Para cuantización, una RTX 3060 8GB podría ser suficiente, pero no hay archivos GGUF ni AWQ disponibles.
- En consumer GPU: sí, es factible en tarjetas con 12 GB o más de VRAM, aunque la latencia dependerá de la implementación.
- Opciones de despliegue: al estar en formato safetensors, puede cargarse con transformers de HuggingFace, vLLM o TGI, siempre que se especifique la arquitectura MoE correcta. No hay soporte directo para llama.cpp u Ollama a menos que se convierta a GGUF.
- Latencia y throughput: no disponibles; dependerá del número de parámetros activos, que se desconoce.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa con otros modelos. Se podría comparar con `Llama-3.2-3B-Instruct` (modelo base denso) o con `Mixtral 8x7B` (MoE más grande), pero faltan datos de rendimiento y especificaciones del presente modelo. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al derivar de Llama-3.2, puede heredar sesgos presentes en los datos de entrenamiento originales, y la abliteración podría alterarlos de forma impredecible.
- Riesgo de alucinación: alto, especialmente en tareas de razonamiento complejo o factual, dado el tamaño reducido y la falta de verificación.
- Limitaciones de contexto e idioma: no especificadas; probablemente el contexto sea el de Llama-3.2 (128k tokens en la versión original, pero no confirmado) y el soporte multilingüe sea limitado.
- Restricciones de licencia: la licencia no está indicada, lo que impide conocer si es permitido el uso comercial o la redistribución. Esto supone un riesgo legal importante para producción.
- Contenido sin censura: el modelo puede generar contenido ofensivo, ilegal o dañino. No debe desplegarse en aplicaciones públicas sin moderación adicional.
- Mantenimiento y soporte: el autor no ofrece garantías; el repositorio tiene muy pocas descargas (29) y ningún like, lo que indica un proyecto experimental.

## Enlaces

- HuggingFace: https://huggingface.co/edusc182/Llama-3.2-6B-MoE_Uncensored
- Dataset de entrenamiento: https://huggingface.co/datasets/teknium/OpenHermes-2.5
- Modelo base abliterado: https://huggingface.co/huihui-ai/Llama-3.2-3B-Instruct-abliterated
- Modelo base heretic: https://huggingface.co/DavidAU/Llama-3.2-3B-Instruct-heretic-ablitered-uncensored
