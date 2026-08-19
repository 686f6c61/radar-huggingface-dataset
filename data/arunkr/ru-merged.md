# ArunKr/ru-merged

## Resumen

El modelo `ArunKr/ru-merged` es un clasificador de texto basado en el modelo instructivo `google/gemma-3-270m-it`, fusionado (merged) y ajustado mediante técnicas PEFT para distinguir entre dos categorías de submissions ciudadanas: **REFORM** (propuestas de reforma) y **GRIEVANCE** (quejas o reclamaciones). Fue desarrollado por Arun Kumar Tiwary (usuario `ArunKr` en Hugging Face) y está diseñado para su uso en entornos de participación ciudadana, gobierno electrónico y análisis de opinión pública.

El modelo cuenta con 268 millones de parámetros, un tamaño reducido que permite su despliegue en hardware modesto. Aunque el pipeline declarado es `text-generation`, su propósito real es la clasificación de secuencias cortas de texto. La model card incluye un script de inferencia (`inference.py`) con ejemplos de uso, lo que facilita su integración en proyectos existentes. Su relevancia radica en la creciente necesidad de automatizar el triaje de solicitudes y comentarios ciudadanos en plataformas digitales, donde distinguir entre una propuesta constructiva y una queja es un paso previo esencial para la gestión administrativa.

No se dispone de información pública sobre el proceso de entrenamiento, el dataset utilizado ni la licencia, lo que limita su adopción en entornos comerciales sin verificación previa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Gemma 3) |
| Parametros totales | 268.098.176 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo safetensors en el repositorio) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se construye sobre `google/gemma-3-270m-it`, un transformer decoder-only con atención local y global (ventana local de 1024 tokens y capas globales cada 5 capas, según la arquitectura original de Gemma 3). El ajuste se realizó mediante técnicas PEFT (los tags incluyen `peft` y `reform-utsav`), y posteriormente se fusionaron los pesos para obtener un modelo independiente (standalone). La tarea de clasificación es binaria: REFORM frente a GRIEVANCE, lo que sugiere un cabezal de clasificación sobre la representación del token final o una adaptación del modelo instructivo para generación de etiquetas.

No se han publicado detalles sobre el volumen de datos de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO. Tampoco se especifica el número de épocas ni la configuración de hiperparámetros. La ausencia de esta información impide evaluar la robustez del modelo y su comportamiento en dominios distintos al de entrenamiento.

## Capacidades

- Clasificación binaria de texto: distingue entre propuestas de reforma (REFORM) y quejas o reclamaciones (GRIEVANCE) en submissions ciudadanas.
- Generación de texto: al estar basado en Gemma 3 instruct, conserva la capacidad de generar texto, aunque no es su uso principal.
- Inferencia por lotes o individual: el script de ejemplo `inference.py` acepta una frase como argumento y devuelve la clasificación.
- Integración con la librería `transformers`: compatible con pipelines estándar de Hugging Face.
- No se ha documentado soporte para tool calling, agentes, razonamiento multi-paso, visión o audio.

## Casos de uso

- Triaje automatizado de solicitudes ciudadanas: en plataformas de participación ciudadana, el modelo puede clasificar automáticamente cada submission como reforma o queja, permitiendo dirigirla al departamento correspondiente sin intervención manual.
- Análisis de feedback en servicios públicos: organismos municipales pueden procesar comentarios de usuarios y separar propuestas de mejora de reclamaciones urgentes, priorizando estas últimas.
- Moderación de foros de participación: en debates online sobre políticas públicas, el modelo ayuda a identificar mensajes que contienen quejas frente a los que aportan sugerencias, facilitando la labor de los moderadores.
- Generación de informes de opinión: tras clasificar un corpus de submissions, se pueden generar estadísticas sobre la proporción de reformas y quejas en un periodo, útil para la toma de decisiones.
- Automatización de tickets en atención al ciudadano: integrado en un sistema de tickets, el modelo etiqueta cada entrada como reforma o queja, mejorando el enrutamiento y los tiempos de respuesta.
- Investigación social: investigadores pueden usar el modelo para clasificar grandes volúmenes de textos procedentes de encuestas abiertas o redes sociales, separando críticas de propuestas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos de precisión, recall, F1 ni comparaciones con otros modelos en la model card ni en el repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 268M de parámetros. En FP16 ocupa aproximadamente 536 MB, en 8 bits unos 268 MB y en 4 bits unos 134 MB. Cabe holgadamente en cualquier GPU con 2 GB de VRAM o más.
- GPU recomendadas: cualquier GPU consumer moderna (GTX 1060 6GB, RTX 2060, RTX 3060, etc.) es suficiente. También puede ejecutarse en CPU con razonable velocidad para clasificaciones puntuales.
- Despliegue en CPU: viable con `transformers` y `torch` en modo CPU, con latencias del orden de decenas de milisegundos por frase.
- Opciones de despliegue: compatible con `transformers` (pipeline de text-generation), `vLLM` (aunque no es óptimo para clasificación), `llama.cpp` (si se convierte a GGUF) y `Ollama` (tras conversión).
- Latencia estimada: en GPU (RTX 3060) se espera una latencia inferior a 10 ms por muestra; en CPU moderna, entre 50 y 200 ms por muestra, dependiendo de la longitud del texto.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar con alternativas. Como referencia cualitativa, se pueden considerar otros clasificadores de texto pequeños basados en transformers:

| Modelo | Parametros | Contexto | Licencia | Uso principal |
|---|---|---|---|---|
| ArunKr/ru-merged | 268M | No disponible | No disponible | Clasificación binaria reforma/queja |
| DistilBERT-base-uncased | 66M | 512 | Apache 2.0 | Clasificación de texto genérica |
| RoBERTa-base | 125M | 512 | MIT | Clasificación de texto, NLI, etc. |
| Gemma-3-270m-it (base) | 268M | 32k (según documentación oficial) | Gemma Terms of Use | Generación de texto, chat, clasificación con adaptación |

La comparación es orientativa: `ru-merged` está especializado en una tarea concreta, mientras que los otros modelos son de propósito general. Sin métricas no es posible determinar cuál ofrece mejor rendimiento en esta tarea específica.

## Limitaciones y advertencias

- Sesgos desconocidos: al no publicarse el dataset de entrenamiento, no se puede evaluar si el modelo tiene sesgos hacia ciertos grupos demográficos, regiones o tipos de lenguaje.
- Riesgo de alucinación en generación: aunque su uso principal es clasificación, al derivar de un modelo instructivo puede generar texto no solicitado si se le pide; no se recomienda su uso como generador autónomo.
- Limitaciones de idioma: no se especifican los idiomas soportados; es probable que el entrenamiento se haya realizado principalmente en inglés, dado el contexto de "citizen submissions" y el autor.
- Restricciones de licencia: la licencia no está disponible, lo que impide verificar si el uso comercial está permitido. Se recomienda contactar con el autor antes de usarlo en producción.
- Tamaño del contexto: no se ha confirmado la longitud de contexto soportada tras la fusión; para clasificación de frases cortas no suele ser un problema, pero para documentos largos podría degradarse.
- Modelo pequeño: con 268M de parámetros, su capacidad de generalización es limitada en comparación con modelos de mayor tamaño, especialmente en dominios con vocabulario técnico o jerga local.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ArunKr/ru-merged
- Perfil del autor en Hugging Face: https://huggingface.co/ArunKr
- Modelo base: https://huggingface.co/google/gemma-3-270m-it
- Paper relacionado (no confirmado como fuente del modelo): "Adaptive Rank Pruning: Dynamic Low-Rank Model Merging and Compression" - https://ieeexplore.ieee.org/document/11199315
- Dataset del autor (no relacionado directamente): https://huggingface.co/datasets/ArunKr/merged-manim-instruct
