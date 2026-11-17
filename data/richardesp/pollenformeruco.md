# richardesp/PollenFormerUCO

## Resumen

PollenFormerUCO es un modelo de clasificación de imágenes de polen en muestras de microscopía, desarrollado por investigadores de la Universidad de Córdoba y del Center of Allergy & Environment (ZAUM) de la Universidad Técnica de Múnich y el Helmholtz Center Munich. Se trata de un fine-tuning del backbone DINOv2 ViT-B/14 que combina una cabeza softmax de 18 clases con un espacio de embeddings de 128 dimensiones entrenado con una pérdida híbrida de entropía cruzada más triplet, lo que permite clasificar cada imagen por búsqueda de vecino más cercano por coseno sobre una galería de referencia.

El modelo resuelve un problema concreto de aerobiología y palinología: la identificación automática de granos de polen en imágenes de microscopía, una tarea tradicionalmente manual y costosa. Frente a clasificadores opacos, cada predicción viene acompañada de las imágenes de referencia que la sustentan, lo que aporta trazabilidad al resultado. Reconoce 17 taxones polínicos más una clase negativa `NoPollen`, y alcanza un 98,1 % de accuracy y un 97,5 % de macro-F1 con 1-NN por coseno sobre el split de test de UCOPollen.

El modelo tiene 86,7 M de parámetros, entrada RGB de 224 × 224 píxeles y se distribuye con licencia Apache 2.0 junto con la galería de embeddings precalculada. Su relevancia actual radica en que demuestra que un backbone auto-supervisado de propósito general, ajustado con metric learning, puede igualar o superar enfoques especializados en una tarea científica de nicho, manteniendo además un mecanismo de decisión interpretable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (DINOv2 ViT-B/14) con proyección lineal a 128-D y cabeza softmax |
| Parametros totales | 86,7 M (backbone 86,58 M, proyección 98 k, cabeza 2,3 k) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de visión, entrada de 224 × 224 píxeles) |
| Tipos de cuantizacion | No disponible (checkpoint en float32; no se documentan variantes cuantizadas) |
| Idiomas soportados | No aplica (modelo de clasificación de imágenes) |
| Licencia | Apache 2.0 (pesos y galería) |
| Formato de pesos | PyTorch `state_dict` (`.pth`, float32); galería en `.npz` y metadatos `.json` |

## Arquitectura y entrenamiento

El modelo parte del backbone DINOv2 ViT-B/14, construido a partir del código de `torch.hub` de DINOv2 fijado al commit `7764ea0f`, con pesos iniciales auto-supervisados de `facebook/dinov2-base`. Sobre el token CLS normalizado (768-D) se aplica una capa lineal que lo proyecta a un embedding de 128 dimensiones, y sobre ese embedding una cabeza lineal softmax que produce logits para las 18 clases. La entrada es una imagen RGB redimensionada a 224 × 224 y normalizada con media y desviación típica de ImageNet.

El ajuste fino emplea una pérdida híbrida que combina entropía cruzada con triplet loss, de modo que el espacio de embeddings queda organizado para que las imágenes de un mismo taxón queden próximas en distancia coseno. La inferencia se realiza por búsqueda de vecino más cercano por coseno (1-NN en la configuración del paper) sobre una galería de 34.257 embeddings L2-normalizados extraídos del conjunto de entrenamiento. No se detalla en la información disponible el número de tokens de entrenamiento ni la composición exacta del dataset más allá del desglose de imágenes por clase de la galería (por ejemplo, 3.514 imágenes de Cupressaceae, 2.226 de Poaceae o 112 de Castanea).

## Capacidades

- Clasificación de imágenes de microscopía de granos de polen en 18 clases (17 taxones y `NoPollen`).
- Generación de embeddings de 128 dimensiones L2-normalizados, aptos para búsqueda por similitud coseno.
- Predicción con vecinos de referencia: cada resultado incluye las imágenes de la galería más próximas y su similitud coseno, lo que permite auditar la decisión.
- Clasificación por votación k-NN configurable (`k_vote`), además del 1-NN usado en el paper.
- Proyección UMAP 2D precalculada de la galería para visualización del espacio de embeddings en la demo.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto: es un modelo puramente discriminativo de visión.
- No dispone de capacidades multilingües ni de procesamiento de audio.

## Casos de uso

- Monitorización aerobiológica automatizada: integrado en un pipeline que procesa capturas de muestreadores volumétricos (tipo Hirst) y clasifica cada grano de polen por taxón, reduciendo el recuento manual que realizan los palinólogos.
- Alertas de alergia estacional: al detectar taxones como Poaceae, Cupressaceae u Oleaceae afines, el modelo alimenta sistemas de aviso temprano para población alérgica con datos locales de concentración.
- Investigación palinológica de series largas: clasificación retrospectiva de muestras históricas de microscopía para estudiar tendencias fenológicas y cambios en la composición polínica.
- Control de calidad con trazabilidad: gracias a la predicción con vecinos de referencia, un revisor humano puede validar cada clasificación contrastándola con las imágenes de la galería que la sustentan, lo que facilita la corrección de errores.
- Filtrado de falsos positivos: la clase `NoPollen` permite descartar imágenes de microscopía que no contienen granos de polen (restos vegetales, esporas, artefactos) antes de pasarlas a un clasificador taxonómico más fino.
- Docencia y formación: la demo interactiva con mapa UMAP del espacio de embeddings sirve para ilustrar la separabilidad de taxones y la utilidad del metric learning en cursos de palinología o visión por computador.
- Análisis de biodiversidad en mieles y muestras ambientales: identificación de la composición polínica de muestras para estudios de origen floral o trazabilidad alimentaria, con revisión humana de las clases menos representadas.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el split de test de UCOPollen:

| Metrica | Valor |
|---|---|
| Accuracy (cosine 1-NN) | 98,1 % |
| Macro-F1 (cosine 1-NN) | 97,5 % |

No se han publicado en la información disponible resultados comparativos con otros modelos en formato de tabla (MMLU, HumanEval, GSM8K u otros no aplican a este modelo).

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 1-2 GB en float32 para el checkpoint (346,8 MB de pesos) más el espacio de activaciones de un ViT-B/14 a 224 × 224; la galería de embeddings ocupa 16,3 MB y puede residir en CPU o GPU.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; funcionan RTX 3060, RTX 4060, RTX 4090, A100 y H100 sin problema. El modelo es pequeño para los estándares actuales.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna con 4 GB o más; también puede ejecutarse en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: el paquete oficial `pollenformer` (instalable desde GitHub) con CLI y API de Python; el checkpoint es un `state_dict` de PyTorch cargable con `torch.load(..., weights_only=True)`, por lo que puede integrarse en cualquier pipeline PyTorch. No se documentan exportaciones a ONNX, TensorRT, vLLM, llama.cpp ni Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PollenFormerUCO | 86,7 M | 224 × 224 px | 98,1 % accuracy, 97,5 % macro-F1 (UCOPollen) | Apache 2.0 | Hugging Face + GitHub |
| facebook/dinov2-base (backbone base) | 86,6 M | 224 × 224 px | No disponible como clasificador de polen sin fine-tuning | Apache 2.0 | Hugging Face |
| Clasificadores CNN específicos de polen | No disponible | No disponible | No disponible en la información proporcionada | No disponible | No disponible |

No se dispone en la información proporcionada de resultados de benchmarks de alternativas comparables sobre el mismo conjunto UCOPollen, por lo que la comparación cuantitativa con otros modelos queda limitada al backbone de origen.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente sobre el conjunto UCOPollen y 17 taxones; no generaliza necesariamente a otras regiones geográficas, especies no incluidas o protocolos de captura distintos.
- El desbalance de clases en la galería es notable (de 112 imágenes de Castanea a 3.514 de Cupressaceae), lo que puede afectar al rendimiento en taxones poco representados a pesar del macro-F1 reportado.
- Riesgo de confusión entre taxones morfológicamente próximos y de falsos negativos en la clase `NoPollen`; se recomienda revisión humana en aplicaciones críticas.
- La calidad de la predicción depende fuertemente de la preparación de la muestra, el microscopio y las condiciones de iluminación; no se documenta robustez ante dominios distintos del de entrenamiento.
- El modelo no genera texto ni explicaciones: la interpretabilidad se limita a los vecinos de referencia recuperados.
- Licencia Apache 2.0 permite uso comercial, pero conviene citar el paper y verificar los términos de los datasets de origen si se redistribuyen imágenes.
- No se documentan cuantizaciones oficiales ni optimizaciones para despliegue en producción de baja latencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/richardesp/PollenFormerUCO
- Paper: https://doi.org/10.1016/j.atmosenv.2026.122455 (Atmospheric Environment 389, 122455)
- Código: https://github.com/AVAuco/pollenformerUCO
- Demo: https://richardesp-pollenformer-uco-demo.hf.space/
- Modelo base: https://huggingface.co/facebook/dinov2-base
