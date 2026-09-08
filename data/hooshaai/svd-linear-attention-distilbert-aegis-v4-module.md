# Hooshaai/svd-linear-attention-distilbert-aegis-v4-module

## Resumen

El modelo `svd-linear-attention-distilbert-aegis-v4-module` es una variante comprimida de DistilBERT desarrollada por Hooshaai que incorpora el módulo `aegis_v4_module`, un motor de atención lineal basado en descomposición en valores singulares (SVD). Este módulo sustituye la atención cuadrática estándar o las capas de proyección densas por aproximaciones lineales de bajo rango, lo que reduce el coste computacional y la memoria necesaria. El modelo está diseñado para tareas de clasificación de texto y ha sido evaluado en el subconjunto SST-2 del benchmark GLUE. La relevancia de este modelo radica en su enfoque de compresión y eficiencia, que permite ejecutar clasificadores transformer en entornos con recursos limitados, aunque su rendimiento en precisión es notablemente inferior al de DistilBERT sin comprimir. La arquitectura combina el conocimiento destilado de DistilBERT con el mecanismo de atención lineal SVD, y el entrenamiento incluye un proceso de recuperación mediante fine-tuning con LoRA durante 50 pasos. No se dispone de información sobre el tamaño total de parámetros ni sobre la longitud de contexto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT con módulo de atención lineal SVD (aegis_v4_module) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | no disponible (se cargan automáticamente mediante weights.pt) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura DistilBERT, un transformer preentrenado mediante destilación de conocimiento que reduce el número de capas manteniendo un rendimiento similar. Sobre esta base, el módulo `aegis_v4_module` reemplaza la atención cuadrática estándar o las proyecciones densas por aproximaciones lineales de bajo rango calibradas mediante descomposición en valores singulares (SVD). Tras la compresión, el modelo se somete a un proceso de recuperación mediante fine-tuning con LoRA durante 50 pasos, lo que permite restaurar parte de la precisión perdida. El modelo ha sido evaluado en GLUE (SST-2) para clasificación de texto. No se especifican los datos de entrenamiento completos ni el número de tokens utilizados.

## Capacidades

- Clasificación de texto: el modelo está diseñado para tareas de clasificación binaria o multiclase, como la clasificación de sentimiento en el dataset SST-2.
- Eficiencia computacional: gracias a la atención lineal SVD, el modelo reduce el pico de VRAM a 288.41 MB, lo que lo hace apto para entornos con recursos limitados.
- Recuperación mediante LoRA: el proceso de fine-tuning con LoRA permite ajustar el modelo comprimido para recuperar precisión.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: solo inglés.
- Capacidades especiales: no se han documentado capacidades de visión, audio o modo de pensamiento.

## Casos de uso

1. Clasificación de sentimiento en reseñas de productos: el modelo puede utilizarse para clasificar opiniones en positivas o negativas en inglés. Su bajo consumo de VRAM lo hace adecuado para despliegues en servidores con GPU limitada.
2. Filtrado de contenido en foros o redes sociales: permite detectar comentarios tóxicos o inapropiados en inglés, aunque su precisión moderada requiere supervisión humana.
3. Clasificación de tickets de soporte técnico: puede categorizar solicitudes de soporte en inglés por tema o prioridad, integrándose en sistemas de ticketing con recursos limitados.
4. Análisis de encuestas de satisfacción: procesa respuestas cortas en inglés para clasificar el sentimiento general, siendo útil para obtener métricas rápidas en entornos de baja capacidad.
5. Detección de spam en correos electrónicos: clasifica mensajes como spam o no spam en inglés, aprovechando la arquitectura ligera para su ejecución en CPU.
6. Etiquetado de documentos legales: puede clasificar párrafos o cláusulas en categorías predefinidas en inglés, siempre que se disponga de un conjunto de datos etiquetado para fine-tuning.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Accuracy en SST-2 | 62.84% |
| F1 Score | 0.7286 |
| Ratio de compresion | 1.1968 |
| Pico de VRAM | 288.41 MB |
| Tiempo de evaluacion pura | 30.46 s |

No se han publicado comparativas con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 288.41 MB (pico registrado en el benchmark).
- GPU recomendada: no se especifican requisitos de hardware en la información proporcionada. El pico de VRAM registrado sugiere que puede ejecutarse en cualquier GPU con al menos 512 MB de memoria.
- Compatibilidad con consumer GPU: sí, es apto para GPUs de consumo como la NVIDIA GTX 1650 o superiores.
- Opciones de despliegue: puede cargarse con la librería `transformers` de HuggingFace en PyTorch. Para servir en producción, se puede usar TGI o una API personalizada con FastAPI. No es compatible con llama.cpp al ser un modelo encoder.
- Latencia: el benchmark reporta 30.46 s para evaluación pura, pero no se especifica el tamaño del dataset, por lo que no se puede estimar la latencia por muestra.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados en la información proporcionada. El modelo se basa en DistilBERT, pero no se han facilitado resultados de benchmarks que permitan comparar directamente con DistilBERT estándar u otras variantes comprimidas.

## Limitaciones y advertencias

- Precisión limitada: la accuracy del 62.84% en SST-2 es significativamente inferior a la de DistilBERT sin comprimir, lo que limita su uso en aplicaciones donde se requiera alta precisión.
- Sesgos conocidos: al estar basado en DistilBERT, el modelo puede heredar sesgos de género, raza o cultura presentes en los datos de preentrenamiento. No se han realizado evaluaciones de sesgo en la información disponible.
- Riesgo de alucinación: al ser un modelo de clasificación, no genera texto libre, por lo que el riesgo de alucinación es bajo, pero puede producir clasificaciones incorrectas.
- Limitaciones de idioma: solo soporta inglés, lo que impide su uso en otros idiomas sin un proceso de fine-tuning adicional.
- Restricciones de licencia: la licencia MIT permite uso comercial, pero el rendimiento limitado puede hacer necesario un fine-tuning sustancial para producción.
- Contexto no especificado: no se indica la longitud máxima de contexto, por lo que se desconoce su capacidad para textos largos.
- Tamaño del repositorio: el repositorio de HuggingFace tiene un tamaño de 0.0 GB, lo que sugiere que los pesos podrían no estar almacenados directamente en el repo, sino cargarse desde un archivo externo `weights.pt`. Es necesario verificar la disponibilidad real de los pesos antes de su uso.

## Enlaces

- HuggingFace: https://huggingface.co/Hooshaai/svd-linear-attention-distilbert-aegis-v4-module
- Dataset de resultados: https://huggingface.co/datasets/tahamajs/svd-linear-attention-sst2-results
- Documentación de DistilBERT: https://huggingface.co/docs/transformers/model_doc/distilbert
