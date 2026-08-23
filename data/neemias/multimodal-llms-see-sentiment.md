# Neemias/multimodal-LLMs-See-Sentiment

## Resumen

MLLMsent es un framework de investigación orientado al razonamiento de sentimiento en modelos multimodales de lenguaje (MLLMs). El proyecto, desarrollado por Neemias, se centra en cómo las imágenes comunican sentimiento a través de semánticas complejas a nivel de escena, proponiendo un enfoque que combina la comprensión visual con descripciones textuales explícitas para mejorar la interpretabilidad de las predicciones. La publicación en arXiv (2508.16873) presenta este marco como una contribución al estado del arte en el análisis de sentimiento multimodal, subrayando que cada predicción va acompañada de descripciones textuales que aclaran el razonamiento del modelo.

El repositorio de GitHub ofrece herramientas de extremo a extremo para el análisis de sentimiento a partir de contenido visual. La ficha actual se basa en la información disponible en Hugging Face, que es mínima (solo licencia y fecha de creación), por lo que muchos parámetros técnicos no se han publicado. A pesar de su nombre, no se trata de un modelo preentrenado con pesos descargables, sino de un marco de trabajo (framework) de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | cc-by-4.0 |
| Formato de pesos | no disponible (framework de investigación, no modelo con pesos) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo ni el proceso de entrenamiento. Segun el repositorio de GitHub y el articulo de arXiv, MLLMsent se presenta como un framework que integra un MLLM para generar descripciones textuales de escenas visuales y posteriormente utiliza un modelo de sentimiento basado en texto para realizar la clasificacion. Este enfoque permite aprovechar modelos de sentimiento textuales maduros y mejora la interpretabilidad, ya que cada prediccion viene acompanada de una justificacion en lenguaje natural. No se especifican los datos de entrenamiento, el numero de tokens, ni si se aplicaron tecnicas como RLHF o DPO.

## Capacidades

- Analisis de sentimiento a partir de imagenes, mediante la generacion de descripciones textuales de la escena visual.
- Interpretabilidad mejorada: cada prediccion incluye una justificacion textual explicita.
- Razonamiento de sentimiento a nivel de escena, no solo de objetos o rostros aislados.
- Integracion con modelos de sentimiento basados en texto ya existentes.
- Framework de investigacion con herramientas de extremo a extremo para experimentacion.

## Casos de uso

- **Investigacion academica en analisis de sentimiento multimodal**: el framework permite estudiar como los MLLMs perciben emociones en imagenes, facilitando la comparacion con enfoques puramente visuales o basados en texto.
- **Auditoria de sesgo en modelos de sentimiento**: al generar explicaciones textuales, se puede evaluar si el modelo esta atendiendo a elementos irrelevantes de la escena.
- **Desarrollo de sistemas de moderacion de contenido**: la capacidad de explicar el sentimiento de una imagen puede ayudar a justificar decisiones de moderacion en plataformas sociales.
- **Analisis de opinion en redes sociales**: aplicable a imagenes publicadas en plataformas como Instagram o Twitter para inferir la actitud de los usuarios hacia un producto o evento.
- **Mejora de sistemas de recomendacion**: al comprender el sentimiento implicito en fotografias de productos, se puede ajustar la personalizacion de recomendaciones.
- **Generacion de datos etiquetados**: el framework puede utilizarse para crear datasets de sentimiento multimodal con justificaciones textuales, util para entrenar otros modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El articulo de arXiv menciona que el modelo establece un nuevo estado del arte, pero no se proporcionan cifras concretas en los materiales revisados.

## Requisitos de hardware

No disponible. Al tratarse de un framework de investigacion, no se especifican requisitos de hardware, VRAM ni GPUs recomendadas. Dependiendo de la implementacion, podria ejecutarse en GPUs comerciales si se usa un MLLM preentrenado de tamano moderado, pero esta informacion no se ha publicado.

## Comparativa con modelos similares

No disponible. No se han encontrado modelos comparables directos en la informacion proporcionada. El enfoque de generar descripciones textuales para mejorar la interpretabilidad es distintivo, pero no hay datos cuantitativos que permitan una comparacion objetiva.

## Limitaciones y advertencias

- No se proporcionan detalles sobre el modelo subyacente (tipo de MLLM, tamano, parametros), lo que dificulta la reproducibilidad.
- La licencia cc-by-4.0 permite uso comercial y modificaciones, pero obliga a atribucion y compartir bajo la misma licencia; se debe verificar el cumplimiento.
- Al depender de un MLLM generador de descripciones, el rendimiento puede estar limitado por la calidad de las descripciones textuales.
- Riesgo de alucinacion en las descripciones generadas, lo que podria afectar a la precision del sentimiento inferido.
- No se especifican limitaciones de idioma; probablemente el modelo este entrenado en ingles, pero no hay confirmacion.
- La falta de benchmarks publicados dificulta evaluar su rendimiento relativo frente a otras soluciones.

## Enlaces

- Repositorio GitHub: https://github.com/neemiasbsilva/multimodal-LLMs-see-sentiment
- Articulo arXiv (PDF): https://arxiv.org/pdf/2508.16873
- Articulo arXiv (HTML): https://arxiv.org/html/2508.16873v2
- Pagina en Hugging Face: https://huggingface.co/Neemias/multimodal-LLMs-See-Sentiment
