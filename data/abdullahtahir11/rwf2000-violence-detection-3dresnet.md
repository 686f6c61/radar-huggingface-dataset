# Abdullahtahir11/rwf2000-violence-detection-3dresnet

## Resumen

El modelo `Abdullahtahir11/rwf2000-violence-detection-3dresnet` es un clasificador de vídeo basado en la arquitectura 3D ResNet-18 (`r3d_18`), afinado específicamente para la detección automática de violencia y peleas físicas en secuencias de videovigilancia. Lo publica el usuario Abdullahtahir11 en HuggingFace y se distribuye bajo licencia MIT, con un tamaño de repositorio de 0,4 GB, lo que corresponde a los pesos de un backbone 3D ResNet-18 sin cabezas adicionales de gran tamaño.

El modelo resuelve un problema clásico de visión por computador aplicada a seguridad: clasificar un clip de vídeo en dos categorías, `Fight` (violencia) o `NonFight` (no violencia), a partir de 16 fotogramas muestreados uniformemente y redimensionados a 224x224 píxeles. Está entrenado y evaluado sobre el benchmark RWF-2000, un conjunto de referencia en detección de violencia en vídeo de vigilancia.

Su relevancia actual es doble: por un lado, ofrece una línea base reproducible y ligera (3D ResNet-18) para tareas de reconocimiento de acciones en vídeo; por otro, demuestra que arquitecturas convolucionales 3D compactas siguen siendo competitivas frente a enfoques transformer de vídeo mucho más costosos, con un rendimiento declarado del 90,00 % de accuracy y 0,9649 de ROC-AUC sobre el conjunto de test de RWF-2000. No es un modelo de lenguaje ni un modelo generativo: es un clasificador de vídeo de dos clases.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | 3D ResNet-18 (`r3d_18`), red convolucional 3D para clasificación de vídeo |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada de 16 fotogramas por clip |
| Tipos de cuantizacion | no disponible (pesos probablemente en fp32; no se documentan variantes GGUF/ONNX) |
| Idiomas soportados | en (etiqueta declarada; el modelo no procesa texto, solo vídeo) |
| Licencia | MIT |
| Formato de pesos | no disponible (el repositorio ocupa 0,4 GB; presumiblemente PyTorch, no confirmado en la información) |

Especificaciones de entrada declaradas por el autor:

| Parametro de entrada | Valor |
|---|---|
| Dimensiones del tensor | `(Batch, Channels=3, Frames=16, Height=224, Width=224)` |
| Muestreo temporal | 16 fotogramas uniformes por clip |
| Normalizacion | media ImageNet `[0.485, 0.456, 0.406]`, std `[0.229, 0.224, 0.225]` |
| Clases | `0`: NonFight, `1`: Fight |

## Arquitectura y entrenamiento

La arquitectura es una 3D ResNet-18 (`r3d_18`), una red convolucional residual que extiende las convoluciones 2D a 3D para capturar información espacial y temporal de forma conjunta. Cada clip se representa como un tensor de 16 fotogramas a resolución 224x224 con tres canales RGB, normalizado con estadísticas de ImageNet. El modelo se ha afinado sobre el dataset RWF-2000, un benchmark de detección de violencia en vídeo de vigilancia compuesto por clips de peleas y no peleas.

La información disponible no detalla el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de aumento de datos, regularización o ajuste fino en varias fases. Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa, atención lineal o mecanismos híbridos; se trata de un enfoque convolucional 3D estándar. El autor declara que la evaluación se realizó sobre los 400 clips de test de RWF-2000 (200 Fight y 200 NonFight).

## Capacidades

- Clasificación binaria de vídeo en dos clases: `Fight` (violencia o pelea física) y `NonFight` (no violencia).
- Reconocimiento de acciones en vídeo de vigilancia a partir de 16 fotogramas muestreados uniformemente.
- Procesamiento de clips RGB a 224x224 píxeles con normalización ImageNet.
- Inferencia por lotes (`Batch` en la primera dimensión del tensor de entrada).
- No soporta tool calling ni function calling: no es un modelo de lenguaje.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües reales: la etiqueta `en` es meramente declarativa; el modelo no procesa texto.
- No dispone de modo de razonamiento (thinking mode), visión a nivel de imagen individual, audio ni generación de texto.

## Casos de uso

- Detección de peleas en circuitos cerrados de televisión (CCTV): el modelo clasifica clips de 16 fotogramas como `Fight` o `NonFight`, lo que permite activar alertas automáticas en un centro de control cuando se supera un umbral de probabilidad. Es adecuado por su bajo coste computacional frente a transformers de vídeo.
- Filtrado y triaje de grabaciones de vigilancia: procesar por lotes clips de 16 fotogramas permite priorizar segmentos sospechosos para revisión humana, reduciendo el volumen de vídeo que un operador debe revisar manualmente.
- Monitorización en entornos educativos o de transporte público: integrado en un pipeline de ingesta de vídeo, el clasificador puede marcar incidentes violentos en tiempo casi real y enviar notificaciones al personal de seguridad.
- Análisis forense posterior a incidentes: dado un archivo de vídeo, segmentarlo en clips de 16 fotogramas y clasificar cada uno permite localizar rápidamente los intervalos con posible violencia y acotar la revisión.
- Prototipado e investigación en reconocimiento de acciones: al ser un 3D ResNet-18 con licencia MIT, sirve como línea base reproducible para comparar con arquitecturas transformer de vídeo o para experimentar con aumentos de datos y técnicas de muestreo temporal.
- Sistemas de alerta en comercio minorista: detección de altercados o agresiones en tiendas mediante cámaras existentes, con el modelo ejecutándose en hardware modesto y emitiendo alertas a los responsables de seguridad.
- Automatización de auditorías de contenido: clasificación de clips subidos a plataformas para marcar contenido violento antes de la moderación humana, usando el ROC-AUC de 0,9649 como referencia para calibrar el umbral de decisión.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el conjunto de test de RWF-2000 (400 clips: 200 Fight, 200 NonFight). Los valores no están verificados de forma independiente (`verified: false`).

| Metrica | Valor |
|---|---|
| Validation Accuracy | 0,9000 (90,00 %) |
| ROC-AUC | 0,9649 |
| Fight Precision / Recall / F1 | 0,92 / 0,88 / 0,90 |
| NonFight Precision / Recall / F1 | 0,88 / 0,92 / 0,90 |

No se han publicado en la información disponible resultados comparativos con otros modelos sobre el mismo benchmark.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia orientativa, un 3D ResNet-18 con entrada de 16x3x224x224 es un modelo compacto que en fp32 suele requerir del orden de 1-3 GB de VRAM para lotes pequeños, pero este dato no está confirmado por el autor.
- GPU recomendadas: no disponibles. Por el tamaño del repositorio (0,4 GB) y la arquitectura, es probable que quepa en GPU de consumo, pero el autor no documenta requisitos.
- ¿Cabe en GPU de consumo? No confirmado en la información disponible; el tamaño del modelo sugiere que sí, pero no hay datos oficiales.
- Opciones de despliegue: no documentadas. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a un clasificador de vídeo). El pipeline declarado es `video-classification`, lo que sugiere uso con la librería de HuggingFace Transformers o PyTorch, pero no se detalla.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos sobre modelos comparables (parámetros, contexto, rendimiento, licencia y disponibilidad) para establecer una comparativa fiable. Se indica, por tanto: no disponible.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente sobre RWF-2000, un dataset concreto de vídeos de vigilancia; su generalización a otras cámaras, resoluciones, condiciones de iluminación o dominios (por ejemplo, vídeo doméstico o deportivo) no está documentada y puede degradarse.
- Riesgo de falsos positivos y falsos negativos: el propio autor reporta precisión y recall de 0,92/0,88 para Fight y 0,88/0,92 para NonFight, lo que implica errores no despreciables en ambos sentidos.
- Sesgos potenciales: al entrenarse sobre un dataset de vigilancia, puede heredar sesgos de representación demográfica, geográfica y de contexto del propio RWF-2000; no se documenta ningún análisis de sesgo.
- Limitación de contexto temporal: solo procesa 16 fotogramas por clip, por lo que incidentes que se desarrollan en ventanas temporales más largas o que requieren contexto previo pueden no detectarse correctamente.
- No es un modelo de lenguaje: no procesa texto, no soporta tool calling ni agentes, y la etiqueta de idioma `en` no implica capacidades lingüísticas.
- Los resultados de benchmarks están declarados por el autor y marcados como no verificados (`verified: false`); deben tomarse con cautela hasta una reproducción independiente.
- Licencia MIT: permite uso comercial y modificación, pero conviene revisar las condiciones de uso del dataset RWF-2000 y las implicaciones legales y éticas de la videovigilancia automatizada en la jurisdicción correspondiente.
- Uso en producción: cualquier sistema de alerta basado en este modelo debería combinarse con revisión humana, dado el impacto de los falsos positivos en contextos de seguridad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Abdullahtahir11/rwf2000-violence-detection-3dresnet
- Dataset RWF-2000 (referencia declarada en la model card): no se proporciona enlace directo en la información disponible.
- Paper o blog del autor: no disponible.
- Repositorio de código: no disponible.
- Demo: no disponible.
