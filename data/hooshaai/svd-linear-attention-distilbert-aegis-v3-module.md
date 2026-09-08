# Hooshaai/svd-linear-attention-distilbert-aegis-v3-module

## Resumen

Este modelo es una variante comprimida de DistilBERT en la que el módulo `aegis_v3_module` sustituye la atención cuadrática estándar o las capas de proyección densas por aproximaciones lineales de bajo rango calibradas mediante descomposición en valores singulares (SVD) y recuperadas con 50 pasos de ajuste fino LoRA. Lo desarrolla Hooshaai, un laboratorio de investigación independiente, y se presenta como un experimento de compresión de modelos para clasificación de texto. Su objetivo es reducir el coste computacional y de memoria de los transformers manteniendo un pipeline de text-classification. Está evaluado en la tarea SST-2 del dataset GLUE, con una precisión de validación del 62.84% y un F1 de 0.7286. El modelo está pensado para entornos con recursos limitados, aunque su rendimiento es bajo en comparación con DistilBERT sin comprimir. No se especifican el número de parámetros ni la longitud de contexto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT (encoder transformer) con módulo de atención/compresión lineal SVD (`aegis_v3_module`) |
| Parametros totales | no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | PyTorch (weights.pt) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura DistilBERT, un encoder transformer ligero, y le aplica el módulo `aegis_v3_module`. Este módulo reemplaza la atención cuadrática estándar o las capas de proyección densas por aproximaciones lineales de bajo rango. El proceso de compresión se calibra mediante SVD y se recupera con 50 pasos de ajuste fino LoRA. El entrenamiento y la evaluación se realizan sobre el dataset GLUE, concretamente en la tarea SST-2 de análisis de sentimiento. No se documentan los datos de entrenamiento completos, el número de tokens ni procesos de RLHF o DPO. La innovación técnica destacable es la combinación de SVD con LoRA para comprimir el modelo sin perder completamente su capacidad de clasificación.

## Capacidades

- Clasificación de texto en inglés, con pipeline de text-classification. Evaluado en SST-2 (análisis de sentimiento).
- Compresión de atención mediante aproximaciones lineales de bajo rango, lo que reduce el coste de memoria.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión o audio.
- Soporte multilingüe: solo inglés.
- No se especifican modos de pensamiento ni generación de texto; es un modelo discriminativo para clasificación.

## Casos de uso

- Análisis de sentimiento en redes sociales: el modelo puede clasificar publicaciones o comentarios en inglés como positivos o negativos. Su bajo consumo de memoria (pico de 288 MB) permite ejecutarlo en servidores ligeros o en dispositivos edge.
- Clasificación de tickets de soporte: puede categorizar mensajes de clientes en inglés en temas predefinidos (por ejemplo, facturación, errores técnicos). Al ser un modelo de clasificación, se integraría en un pipeline de NLP para enrutar tickets automáticamente.
- Filtrado de correos no deseados: clasificación binaria de correos electrónicos en inglés como spam o no spam, adecuado para entornos con recursos limitados.
- Clasificación de intenciones en chatbots: para sistemas de atención al cliente en inglés, puede clasificar la intención del usuario (saludo, compra, reclamación) y dirigir la conversación.
- Análisis de opiniones en encuestas: clasificar respuestas abiertas cortas en inglés como positivas, negativas o neutras, útil para medir satisfacción.
- Prototipado de NLP en entornos sin GPU potentes: el pico de VRAM de 288 MB permite ejecutar el modelo en GPUs de gama baja o en CPU, ideal para validar ideas de clasificación de texto.
- Investigación en compresión de modelos: sirve como caso de estudio para analizar el efecto de la atención lineal SVD y la recuperación LoRA en el rendimiento de clasificación.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Precisión de validación (SST-2) | 62.84% |
| F1 | 0.7286 |
| Ratio de compresión | 1.1968 |
| Pico de VRAM en GPU | 288.41 MB |
| Tiempo de evaluación puro | 31.01 s |

No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: pico de 288,41 MB durante la evaluación.
- GPU recomendadas: no especificadas en la información; el bajo consumo sugiere que puede ejecutarse en GPUs de consumo o en CPU, aunque no hay datos oficiales.
- ¿Cabe en GPU de consumo? Sí, con un pico de 288 MB cabe en cualquier GPU moderna.
- Opciones de despliegue: no documentadas. Al ser un modelo PyTorch estándar, podría cargarse con transformers, pero no se especifican frameworks de servido (vLLM, TGI, etc.).
- Latencia y throughput: no disponibles. El tiempo de evaluación puro reportado es de 31.01 s, pero se desconoce el hardware y el tamaño del lote.

## Comparativa con modelos similares

No disponible. No se han encontrado modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- El repositorio de HuggingFace tiene un tamaño de 0.0 GB, lo que sugiere que los pesos podrían no estar realmente publicados. El código de ejemplo indica que se cargan desde `weights.pt`, pero no se confirma su presencia.
- Rendimiento bajo: la precisión de validación en SST-2 es del 62.84%, muy inferior al rendimiento típico de DistilBERT en esta tarea (que suele superar el 90%). Esto indica una degradación significativa de la calidad.
- Solo soporta inglés.
- No se especifican la longitud de contexto ni los datos de entrenamiento, lo que limita la evaluación de su idoneidad.
- Es un modelo experimental con 0 descargas y 0 likes, sin validación en producción.
- Licencia MIT: permite uso comercial, pero el usuario debe verificar que los pesos estén disponibles antes de usarlo.

## Enlaces

- HuggingFace: https://huggingface.co/Hooshaai/svd-linear-attention-distilbert-aegis-v3-module
- Dataset de resultados: https://huggingface.co/datasets/tahamajs/svd-linear-attention-sst2-results
- GitHub de Hooshaai: https://github.com/Hooshaai/hooshaai.github.io
