# Hooshaai/svd-linear-attention-distilbert-astro

## Resumen

El modelo `Hooshaai/svd-linear-attention-distilbert-astro` es un experimento de compresión de atención desarrollado por Hoosha AI, un laboratorio de investigación centrado en arquitecturas sub-cuadráticas y verificación de escalado cognitivo. Se trata de un DistilBERT adaptado con un módulo denominado `astro`, que sustituye la atención estándar o las capas de proyección densas por aproximaciones lineales de bajo rango calibradas mediante descomposición en valores singulares (SVD) y recuperadas con 50 pasos de fine-tuning LoRA. El modelo está diseñado para la tarea de clasificación de texto y ha sido evaluado en el subconjunto SST-2 del dataset GLUE.

La relevancia de este modelo radica en su enfoque de eficiencia: busca reducir el coste computacional de la atención sin modificar la estructura del modelo base. Sin embargo, los datos publicados indican una ratio de compresión de 1.0, lo que sugiere que no hay reducción en el número de parámetros, sino una sustitución del mecanismo de atención. El modelo se distribuye bajo licencia MIT y está pensado para uso en investigación y experimentación con atención lineal de bajo rango.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT con módulo `astro` de atención lineal de bajo rango (SVD) |
| Parametros totales | no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`weights.pt`) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura DistilBERT y le incorpora el módulo `astro`, que reemplaza la atención cuadrática convencional o las capas de proyección densas por aproximaciones lineales de bajo rango. Según la documentación del autor, estas aproximaciones se calibran mediante descomposición en valores singulares (SVD) y se recuperan con 50 pasos de fine-tuning LoRA. El proceso se enmarca dentro del "SVD Linear Attention Framework", una suite automatizada de evaluación y compresión.

El entrenamiento se realizó sobre el dataset GLUE, concretamente en la tarea SST-2 (análisis de sentimiento). No se han publicado detalles sobre la composición del dataset, el número de tokens procesados ni la metodología exacta de recuperación. El modelo se carga mediante `AutoModelForSequenceClassification.from_pretrained`, y los pesos se cargan automáticamente desde `weights.pt`.

## Capacidades

- Clasificación de texto binaria, evaluada en SST-2 con una precisión de validación del 89.45%.
- Generación de texto, razonamiento, codigo, matematicas, vision: no disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingues: solo inglés.
- Capacidades especiales: no se documentan modos de pensamiento, vision o audio.

## Casos de uso

- Análisis de sentimiento en reseñas de productos: el modelo puede clasificar reseñas en positivas o negativas, aprovechando su entrenamiento en SST-2. Su bajo consumo de VRAM (337.59 MB) lo hace adecuado para entornos con recursos limitados.
- Moderación de comentarios en foros o redes sociales: al ser un clasificador binario, puede identificar comentarios ofensivos o no deseados en inglés, aunque requeriría fine-tuning adicional con datos propios.
- Clasificación de tickets de soporte técnico: puede etiquetar tickets como urgentes o no urgentes, o como pertenecientes a categorías simples, integrándose en pipelines de automatización.
- Detección de spam en correos electrónicos: su arquitectura ligera permite desplegarlo en servidores de bajo coste o incluso en dispositivos edge, siempre que el contenido esté en inglés.
- Clasificación de opiniones en encuestas de satisfacción: puede procesar respuestas abiertas cortas y clasificarlas por polaridad, facilitando el análisis agregado.
- Experimentación con atención lineal de bajo rango: sirve como referencia para investigadores que quieran comparar el rendimiento de módulos de compresión de atención sobre DistilBERT en tareas de clasificación.

## Benchmarks y rendimiento

Según la model card, se proporcionan los siguientes datos para el módulo `astro` sobre DistilBERT en SST-2:

| Metrica | Valor |
|---|---|
| Precision de validacion | 89.45% |
| F1 score | 0.8982 |
| Ratio de compresion | 1.0 |
| Pico de VRAM en GPU | 337.59 MB |
| Tiempo de evaluacion pura | 6.03 s |

No se han publicado resultados comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 337.59 MB segun el benchmark publicado, lo que permite ejecutarlo en GPUs con menos de 1 GB de memoria.
- GPU recomendadas: cualquier GPU moderna con al menos 512 MB de VRAM, por ejemplo una NVIDIA GTX 1050 o superior. No requiere GPUs de gama alta como A100 o H100.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de consumo y tambien puede ejecutarse en CPU, aunque la latencia seria mayor.
- Opciones de despliegue: el modelo se carga con Hugging Face Transformers y PyTorch. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: el tiempo de evaluacion pura es de 6.03 s, pero no se especifica el tamaño del batch ni el numero de muestras, por lo que no se puede estimar el throughput.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados en la informacion disponible. El modelo es un experimento especifico sobre DistilBERT, y no se han compartido mediciones que permitan compararlo directamente con otras variantes de DistilBERT o con modelos de clasificacion de texto alternativos.

## Limitaciones y advertencias

- Modelo experimental: solo se ha evaluado en SST-2, por lo que su rendimiento en otros dominios o tareas no esta garantizado.
- Ratio de compresion de 1.0: no se observa una reduccion en el numero de parametros, lo que limita su utilidad como metodo de compresion efectivo.
- El repositorio de HuggingFace indica un tamaño de 0.0 GB, lo que sugiere que los pesos podrian no estar disponibles o que el repositorio esta incompleto. Es necesario verificar la descarga antes de su uso.
- Sin datos de parametros totales ni de contexto: no se especifica la longitud de contexto ni el numero total de parametros del modelo resultante.
- Solo soporta ingles, lo que limita su aplicacion en entornos multilingues.
- Posibles sesgos heredados del dataset SST-2, que se basa en criticas de peliculas y puede presentar sesgos de sentimiento asociados a ese dominio.
- Riesgo de errores de clasificacion en textos ambiguos o con ironia, como es habitual en modelos de analisis de sentimiento.

## Enlaces

- HuggingFace: https://huggingface.co/Hooshaai/svd-linear-attention-distilbert-astro
- Blog de Hoosha AI sobre reingenieria del motor de atencion: https://hooshaai.substack.com/p/re-engineering-the-attention-engine
- Pagina principal de Hoosha AI: https://hooshaai.github.io/
