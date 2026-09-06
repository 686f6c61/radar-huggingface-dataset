# Lorg0n/hikka-forge2vec

## Resumen

`hikka-forge2vec` es un modelo de embeddings multimodales unificado para anime y manga, desarrollado por Lorg0n. Mapea títulos, descripciones, géneros, metadatos y un póster opcional a un vector L2-normalizado de 256 dimensiones. Está diseñado para tareas de búsqueda semántica, similitud y aritmética de vectores dentro del dominio específico de obras de animación y cómics japoneses. El modelo está publicado bajo licencia Apache-2.0 y está disponible como paquete Python instalable directamente desde Hugging Face.

La arquitectura combina atención sobre tokens de distintas modalidades con una puerta visual acotada, que limita la influencia del póster a un máximo del 10 % sobre el vector final. Esto permite que el modelo utilice señales visuales cuando resultan útiles sin que un póster pueda dominar el perfil semántico. Además, soporta perfiles incompletos, representando explícitamente los campos ausentes. El modelo tiene 213.056.897 parámetros y ha sido entrenado con perfiles procedentes del catálogo de hikka.io y un dataset privado y sintético, con títulos en inglés, ucraniano y japonés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Unified modality-token attention with a bounded visual gate |
| Parametros totales | 213.056.897 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de embeddings, no generativo) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, uk, ja |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo utiliza una arquitectura de atención multimodal que procesa títulos, alias, descripciones, géneros y metadatos como señales distintas pero relacionadas. La atención permite combinar estas señales y aprender qué partes del perfil son relevantes para cada obra. El póster se codifica en una representación visual compacta y se pasa por una puerta aprendida por elemento, de modo que la influencia visual queda acotada a un máximo del 10 % sobre el embedding final. Los campos faltantes se representan explícitamente, lo que permite trabajar con registros incompletos. El resultado fusionado se normaliza en un espacio compartido de 256 dimensiones.

El entrenamiento se realizó a partir de perfiles de anime y manga del catálogo de hikka.io, junto con un dataset de entrenamiento privado y sintético. La supervisión incluye señales de relevancia o recomendaciones, aunque el detalle exacto no está disponible en la documentación. El modelo no requiere un adaptador separado; los pesos de inferencia completos están incluidos en el repositorio.

## Capacidades

- Generación de embeddings semánticos de 256 dimensiones para perfiles de anime y manga.
- Búsqueda semántica por similitud coseno sobre vectores L2-normalizados.
- Aritmética de vectores: suma, resta, multiplicación escalar, división y normalización.
- Soporte de perfiles sin póster y con campos ausentes.
- Entrada de póster opcional en formato PIL.Image, NumPy array o tensor de PyTorch.
- Acepta imágenes en rangos [0, 1], [0, 255] y [-1, 1], en disposición CHW o HWC.
- Multilingüe para títulos y descripciones en inglés, ucraniano y japonés.
- No es un modelo generativo: no genera texto ni soporta tool calling o razonamiento multi-paso.

## Casos de uso

- Búsqueda semántica en catálogos de anime y manga: permite consultar por una descripción libre o un título y recuperar obras con perfiles semánticamente similares, sin depender de coincidencias exactas de texto.
- Sistemas de recomendación basados en contenido: los embeddings pueden usarse para calcular vecinos cercanos y recomendar obras similares a las que el usuario ha visto o valorado.
- Deduplicación de fichas: comparar embeddings de perfiles para detectar entradas duplicadas o registros con títulos alternativos del mismo contenido.
- Clasificación automática por géneros y temáticas: los vectores de 256 dimensiones pueden alimentar clasificadores supervisados para etiquetar obras automáticamente.
- Búsqueda con perfiles incompletos: el modelo soporta campos faltantes, por lo que es útil en bases de datos con metadatos parciales o inconsistentes.
- Aritmética de vectores para exploración del espacio semántico: permite construir consultas como "Frieren - Attack on Titan + Fullmetal Alchemist" para encontrar obras que combinen características de varias fuentes.
- Integración en pipelines de datos en Python: al ser un paquete instalable, puede incorporarse fácilmente en scripts de procesamiento por lotes para enriquecer catálogos con vectores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El model-index de la model card contiene una lista de resultados vacía, por lo que no hay datos de MMLU, HumanEval, GSM8K u otras métricas comparables.

## Requisitos de hardware

- Estimación de VRAM: con 213.056.897 parámetros, los pesos en FP32 ocupan aproximadamente 852 MB y en FP16 unos 426 MB. El repositorio tiene un tamaño de 0.9 GB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente para inferencia en FP16. En CPU, la inferencia es viable para uso interactivo o por lotes.
- Compatibilidad con GPU de consumo: sí, tarjetas como RTX 3060 o superiores pueden ejecutar el modelo sin problemas.
- Opciones de despliegue: se puede usar directamente con PyTorch, o a través del pipeline `feature-extraction` de Hugging Face Transformers. No se documentan integraciones con vLLM, llama.cpp u otros servidores de inferencia.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de modelos comparables con la misma categoría y especificaciones en la información proporcionada. Existe un modelo relacionado del mismo autor, `Lorg0n/hikka-forge-anime2vec`, pero no se han encontrado especificaciones detalladas ni benchmarks para realizar una comparación rigurosa.

## Limitaciones y advertencias

- El modelo está entrenado específicamente para anime y manga; su capacidad de generalización a otros dominios es limitada.
- Los idiomas soportados se reducen a inglés, ucraniano y japonés. No se ha documentado soporte para otros idiomas.
- La influencia visual está acotada al 10 %, lo que puede resultar insuficiente para capturar estilos visuales muy distintivos o relevantes.
- El dataset de entrenamiento es privado y parcialmente sintético, lo que limita la reproducibilidad y la auditoría externa del entrenamiento.
- No es un modelo generativo, por lo que no puede producir texto, código ni respuestas. No aplica el riesgo de alucinación en el sentido habitual de los LLM.
- No se han publicado evaluaciones de sesgos o robustez ante entradas adversas.
- La licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Lorg0n/hikka-forge2vec
- Modelo relacionado del mismo autor: https://huggingface.co/Lorg0n/hikka-forge-anime2vec
- Catálogo de referencia hikka.io: https://hikka.io/
- Paper citado en los tags (arxiv:1908.10084): https://arxiv.org/abs/1908.10084
- Paper citado en los tags (arxiv:2502.14786): https://arxiv.org/abs/2502.14786
