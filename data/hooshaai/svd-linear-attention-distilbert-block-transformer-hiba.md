# Hooshaai/svd-linear-attention-distilbert-block-transformer-hiba

## Resumen

El modelo `Hooshaai/svd-linear-attention-distilbert-block-transformer-hiba` es una variante comprimida de DistilBERT para clasificación de textos, desarrollada por Hooshaai. Incorpora un módulo de atención lineal basado en descomposición en valores singulares (SVD) junto con la arquitectura Block Transformer HIBA (Hierarchical Intra/Inter-Block Attention), que reorganiza la atención de secuencias largas en una representación jerárquica y dispersa. El modelo fue evaluado en la tarea SST-2 del conjunto de datos GLUE, alcanzando una precisión de validación del 90,48 %.

La arquitectura HIBA reduce el coste computacional de la atención dividiendo la secuencia en bloques de tamaño 64 y aplicando atención densa intrabloque junto con un enrutamiento disperso interbloque. Cada cuatro capas se realiza una rectificación global con atención densa completa. El modelo se presenta como weights comprimidos y ajustados finamente en un proceso de recuperación con 50 pasos. Su relevancia radica en ofrecer una alternativa eficiente en memoria para clasificación de texto sin renunciar a la capacidad de modelar dependencias de largo alcance.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (DistilBERT) con atencion lineal SVD y Block Transformer HIBA |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

El modelo combina DistilBERT con el módulo Block Transformer HIBA. La atención se organiza en dos niveles jerárquicos: primero, atención densa bidireccional dentro de bloques locales de tamaño \(B_s = 64\); segundo, una capa de enrutamiento global dispersa que selecciona dinámicamente los \(k\) bloques de mayor afinidad para el contexto de largo alcance, incluyendo siempre el bloque 0 para anclar el token `[CLS]`. Además, cada 4 capas se activa una rectificación global con atención densa completa, lo que resincroniza las dependencias semánticas de largo alcance. La atención se implementa mediante una proyección lineal basada en SVD, lo que contribuye a la compresión del modelo.

El entrenamiento se realizó sobre la tarea SST-2 del conjunto de datos GLUE, con un proceso de recuperación de pesos comprimidos que empleó 50 pasos de fine-tuning. No se detallan datos de entrenamiento adicionales, como el número total de tokens o la composición del dataset.

## Capacidades

- Clasificación de textos en inglés, con rendimiento evaluado en SST-2 (análisis de sentimiento).
- Manejo de dependencias de largo alcance mediante atención intrabloque e interbloque jerárquica.
- Eficiencia en memoria: el pico de VRAM reportado es de 324,69 MB durante la evaluación.
- Compresión de pesos con ratio 0,9913 sobre el modelo original.
- No se han documentado capacidades de tool calling, agentes, razonamiento multi-paso, visión o audio en la información disponible.
- El pipeline declarado es text-classification, lo que restringe su uso a tareas de clasificación de texto.

## Casos de uso

- Análisis de sentimiento en reseñas de productos: el modelo puede clasificar opiniones positivas o negativas en textos cortos, aprovechando la eficiencia de memoria para desplegarse en entornos con VRAM limitada.
- Clasificación de spam en correos electrónicos o mensajes: al ser una variante de DistilBERT, ofrece una base ligera para filtrar contenido no deseado con un coste computacional reducido.
- Moderación automática de comentarios en foros y redes sociales: su capacidad para atender dependencias locales y globales permite identificar comentarios problemáticos en hilos largos.
- Clasificación de tickets de soporte técnico: puede etiquetar incidencias por categoría o prioridad en sistemas de atención al cliente con respuestas rápidas.
- Análisis de opiniones en encuestas de satisfacción: el modelo procesa respuestas abiertas en inglés y las clasifica según su tono o temática.
- Clasificación de intenciones en chatbots de texto: al estar entrenado en clasificación de secuencias, puede servir como componente de enrutamiento de intenciones en asistentes conversacionales.

## Benchmarks y rendimiento

La información disponible incluye resultados de evaluación en la tarea SST-2 tras el proceso de recuperación:

| Metrica | Valor medido |
|---|---|
| Accuracy de validacion | 90,48 % |
| F1 score | 0,9075 |
| Ratio de compresion | 0,9913 |
| Pico de VRAM en GPU | 324,69 MB |
| Tiempo de evaluacion | 10,56 s |

No se han publicado comparativas con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el pico reportado durante la evaluacion fue de 324,69 MB, por lo que se requiere al menos aproximadamente 0,4 GB de VRAM para cargar el modelo.
- GPU recomendadas: no se especifican modelos concretos; dada la baja VRAM, es viable en GPUs de consumo como RTX 3060 o inferiores, aunque no se confirma de forma oficial.
- Se puede ejecutar en GPU de consumo, ya que el pico de memoria esta muy por debajo de 1 GB.
- Opciones de despliegue: al ser un modelo PyTorch, puede integrarse con vLLM, TGI o Hugging Face Transformers, aunque no se proporcionan detalles especificos.
- Latencia y throughput: solo se reporta un tiempo de evaluacion puro de 10,56 s para la tarea de validacion; no se dispone de datos de throughput.

## Comparativa con modelos similares

No se han encontrado datos de comparacion en la informacion proporcionada. El modelo se presenta como una variante comprimida de DistilBERT con una tecnica de atencion especifica, pero no se ofrecen resultados frente a otros modelos de la misma categoria.

## Limitaciones y advertencias

- El modelo solo soporta el idioma ingles.
- Solo esta entrenado para clasificacion de textos; no soporta tareas de generacion, tool calling o multimodalidad.
- La informacion sobre sesgos, alucinacion o riesgos de seguridad no esta disponible en la documentacion publicada.
- Al tratarse de un modelo comprimido con un ratio de 0,9913, puede existir una penalizacion en precision frente al modelo original sin comprimir, aunque no se aportan datos de comparacion.
- El tamano del repositorio es de 0,0 GB, lo que sugiere que los pesos no estan publicados o que se trata de un repositorio de metadatos; se debe verificar antes de intentar cargar el modelo.
- La licencia MIT permite uso comercial, pero se recomienda revisar los terminos de la licencia original de DistilBERT y las dependencias.

## Enlaces

- https://huggingface.co/Hooshaai/svd-linear-attention-distilbert-block-transformer-hiba
- https://huggingface.co/datasets/tahamajs/svd-linear-attention-sst2-results
