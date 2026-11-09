# saulane/jem-vitb16-plantnet300kv2

## Resumen

JEM ViT-B/16 es un backbone de visión auto-supervisado entrenado desde cero sobre Pl@ntNet-300K-v2, un conjunto de 243.866 imágenes de entrenamiento que cubre 1.000 especies de plantas con una distribución de cola larga. Lo publica el usuario saulane en Hugging Face como reproducción independiente de JEM (*Scalable Patch-Level Self-Supervised Learning*, arXiv 2610.10013), un método de aprendizaje auto-supervisado a nivel de parche. El modelo no usa etiquetas durante el preentrenamiento y se distribuye como extractor de características de imagen.

La arquitectura es un Vision Transformer ViT-B/16 de 86 millones de parámetros, sin token CLS, con 4 tokens de registro y RoPE axial. Se ofrecen dos variantes de pesos: la versión del artículo (con LayerScale a 1e-5) y una ablación sin LayerScale que obtiene mejores resultados en la sonda lineal. Los pesos liberados corresponden al backbone del profesor EMA en la época 100; las cabezas de proyección no se incluyen.

Su relevancia es doble: por un lado, demuestra que un preentrenamiento auto-supervisado de 100 épocas en una sola H100 puede acercarse a backbones preentrenados con miles de millones de imágenes y ajuste supervisado en un dominio tan difícil como la identificación fina de especies vegetales; por otro, publica resultados explícitos en especies raras, un régimen crítico en biodiversidad donde los modelos genéricos fallan.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer ViT-B/16 (sin token CLS, 4 register tokens, RoPE axial) |
| Parametros totales | 86 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada 224 × 224 px en evaluación) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors en precisión original) |
| Idiomas soportados | no aplica (modelo de imagen) |
| Licencia | CC-BY-4.0 (pesos); código MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ViT-B/16 estándar con varias modificaciones: elimina el token CLS, incorpora 4 tokens de registro y usa RoPE axial en lugar de codificaciones posicionales absolutas. La característica de sonda lineal se obtiene promediando los tokens de parche tras la LayerNorm final, lo que da un vector de 768 dimensiones por imagen. El preentrenamiento sigue el esquema JEM: una pérdida KL a nivel de parche contra un profesor EMA con 4.096 categorías, con cabezas en los bloques 4, 8 y 12, más los regularizadores R_global y R_struct.

El entrenamiento se hizo desde cero durante 100 épocas con batch 128 en una única H100 (aproximadamente 22 horas por ejecución), sin usar etiquetas. Respecto al artículo original, que emplea ViT-L de 24 bloques y batch 2048, aquí las profundidades supervisadas y los objetivos de R_struct se reescalan a 12 bloques y el batch se reduce a 128 en una sola GPU. Los pesos liberados son el backbone del profesor EMA en la época 100, sin las cabezas de proyección.

## Capacidades

- Extracción de características de imagen: devuelve tokens de parche (B, N, 768) tras la LayerNorm final, además de los 4 tokens de registro (B, 4, 768).
- Acceso a representaciones intermedias: expone los tokens de parche tras los bloques 4 y 8 (antes de normalización), útil para sondas por capas o análisis de representación.
- Reconocimiento fino de especies vegetales: entrenado específicamente sobre 1.000 especies de Pl@ntNet-300K-v2, con especial atención a la cola larga.
- Clasificación por sonda lineal: el vector medio de tokens de parche sirve como entrada a una capa lineal con resultados competitivos (83,7 % top-1 en test con la variante sin LayerScale).
- No incluye generación de texto, tool calling, agentes ni capacidades multimodales; es exclusivamente un extractor visual.
- No soporta instrucciones ni diálogo: no es un modelo de lenguaje ni un VLM.

## Casos de uso

- Identificación de especies en aplicaciones de biodiversidad: usar el vector de 768 dimensiones como entrada a un clasificador lineal o k-NN sobre las 1.000 especies de Pl@ntNet-300K, aprovechando que el backbone está entrenado en ese dominio concreto.
- Búsqueda visual por similitud de plantas: indexar los embeddings medios de un catálogo de imágenes botánicas y recuperar las más cercanas por distancia coseno para herramientas de identificación asistida en campo.
- Monitorización de especies raras: el modelo mantiene un macro top-1 del 17,9 % en especies con menos de 20 imágenes de entrenamiento, lo que lo hace útil como base para sistemas de alerta temprana de especies amenazadas donde los datos escasean.
- Preentrenamiento para fine-tuning supervisado en dominios botánicos: partir de estos pesos y ajustar con etiquetas específicas de un herbario o una región concreta, reduciendo la necesidad de datos anotados frente a entrenar desde cero.
- Extracción de características para pipelines de visión en agricultura de precisión: clasificación de cultivos, detección de estrés vegetal o inventario de flora a partir de imágenes de dron, usando el backbone como extractor congelado.
- Investigación en aprendizaje auto-supervisado: el par de pesos (con y sin LayerScale) permite reproducir la ablación del artículo y estudiar el efecto de LayerScale en representaciones de dominio fino.
- Análisis de representación por capas: los tokens intermedios de los bloques 4 y 8 permiten estudiar cómo se estructura la información a distintas profundidades, por ejemplo para probing o visualización de atención.

## Benchmarks y rendimiento

Resultados de sonda lineal sobre el conjunto de test de Pl@ntNet-300K-v2, con una única semilla y una única ejecución por método. La sonda es una capa lineal sobre el token de parche medio congelado, con lr y weight decay elegidos en validación.

| Modelo | Top-1 test | Macro top-1 especies raras (< 20 imágenes) |
|---|---|---|
| JEM sin LayerScale (ablación, mejor) | 83,7 % | 17,9 % |
| JEM según artículo (LayerScale 1e-5) | 82,4 % | 14,5 % |
| LeJEPA ajustado (100 épocas, mismos datos) | 81,3 % | 12,8 % |
| ViT-B de Pl@ntNet-300K-v2 (DINOv3 + fine-tuning supervisado) | 84,4 % | 23,7 % |

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 86 M de parámetros; en fp32 ocupa aproximadamente 0,35 GB de pesos, y en fp16 unos 0,17 GB. Con batch pequeño y resolución 224 × 224, la inferencia cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- GPU recomendadas: H100 (la usada para entrenar), A100, RTX 4090, RTX 3090. Para lotes grandes en producción, A100/H100 reducen el tiempo por imagen; para prototipado, una RTX 3060 de 12 GB es suficiente.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 4 GB de VRAM para inferencia en fp16 con batch moderado.
- Opciones de despliegue: PyTorch nativo (carga vía `load_jem` del repositorio), exportación a TorchScript u ONNX para servir con ONNX Runtime o Triton. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un backbone visual.
- Latencia y throughput: no disponible en la información proporcionada; el autor solo reporta el tiempo de entrenamiento (unas 22 horas por ejecución en una H100).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Top-1 test (Pl@ntNet-300K-v2) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| JEM ViT-B/16 (este modelo) | 86 M | 224 × 224 px | 83,7 % (sin LayerScale) | CC-BY-4.0 | Hugging Face |
| LeJEPA ajustado | no disponible | 224 × 224 px | 81,3 % | no disponible | no disponible |
| ViT-B Pl@ntNet-300K-v2 (DINOv3 + supervisado) | no disponible | 224 × 224 px | 84,4 % | no disponible | Hugging Face |

La comparación se limita al régimen de sonda lineal sobre el mismo dataset y transformación de evaluación. El ViT-B de Pl@ntNet-300K-v2 parte de DINOv3 preentrenado en 1.700 millones de imágenes y añade ajuste supervisado, por lo que su ventaja en especies raras (23,7 % frente a 17,9 %) refleja tanto el volumen de preentrenamiento como las etiquetas. JEM se acerca al rendimiento global con 100 épocas desde cero y sin etiquetas.

## Limitaciones y advertencias

- Dominio restringido: entrenado exclusivamente sobre imágenes de plantas de Pl@ntNet-300K-v2; su uso en otros dominios visuales requerirá fine-tuning y probablemente rendirá por debajo de backbones generalistas.
- Cola larga: aunque mejora a LeJEPA en especies raras, el macro top-1 del 17,9 % sigue siendo bajo en términos absolutos; no es adecuado como clasificador listo para producción en especies con pocos ejemplos sin ajuste adicional.
- Resultados de una sola semilla: el autor advierte que todas las cifras provienen de una ejecución por método con una semilla, por lo que la variabilidad entre inicializaciones no está caracterizada.
- Sin cabezas de proyección: los pesos liberados son solo el backbone del profesor EMA; cualquier uso supervisado requiere entrenar una sonda o un cabezal propio.
- Riesgo de sesgo del dataset: Pl@ntNet-300K tiene una distribución geográfica y taxonómica concreta; el modelo heredará los sesgos de muestreo de ese corpus.
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero conviene revisar las condiciones del dataset original (también CC-BY-4.0) si se redistribuyen derivados.
- Sin soporte de texto ni multimodalidad: no debe presentarse como un modelo de lenguaje ni como un VLM; su pipeline es exclusivamente `image-feature-extraction`.
- Transformación de evaluación fija: los resultados reportados usan redimensionado bicúbico cuadrado a 224 × 224 con media y desviación estándar de ImageNet; desviarse de esta transformación puede degradar la calidad de los embeddings.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/saulane/jem-vitb16-plantnet300kv2
- Código de entrenamiento y carga: https://github.com/saulane/jem-plantnet300k
- Artículo JEM (*Scalable Patch-Level Self-Supervised Learning*): arXiv 2610.10013
- Dataset Pl@ntNet-300K (Garcin et al., NeurIPS 2021 Datasets and Benchmarks): no disponible enlace directo en la información proporcionada
