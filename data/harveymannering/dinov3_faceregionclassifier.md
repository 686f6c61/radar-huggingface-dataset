# harveymannering/DINOv3_FaceRegionClassifier

## Resumen

DINOv3 Face-Region Classifier es un clasificador binario de imagen desarrollado por el usuario harveymannering que determina si un recorte (crop) de 224x224 píxeles contiene una cara o no. Se construye mediante fine-tuning del checkpoint auto-supervisado facebook/dinov3-vits16-pretrain-lvd1689m (DINOv3 ViT-S/16) de Meta, al que se añade una única capa lineal sobre el embedding agrupado (pooler_output) que produce un logit de cara. Su rasgo distintivo es que considera "cara" no solo rostros humanos reales, sino también caras de dibujos animados y fenómenos de pareidolia (caras percibidas en cortezas de árbol, rocas o texturas), lo que lo hace útil como señal de guiado en la generación de imágenes.

El modelo no es un detector: no devuelve cajas delimitadoras ni coordenadas, sino una probabilidad por región. Para localizar caras en una imagen completa habría que combinarlo con una ventana deslizante o con un detector previo que proponga recortes. Este enfoque de clasificación por región, entrenado explícitamente con negativos muestreados para no solapar con cajas de cara etiquetadas, lo orienta a tareas de filtrado, curación de datos y control de generación más que a la detección clásica.

Es relevante ahora porque DINOv3 (familia publicada por Meta en 2025) se ha convertido en un backbone de referencia para visión por su calidad de representaciones auto-supervisadas, y porque el repositorio esquiva la barrera del checkpoint base restringido (gated) publicando su propio config.json junto con los pesos afinados, de modo que el modelo se puede reconstruir sin solicitar acceso a DINOv3 en Hugging Face. El repositorio ocupa 0,1 GB y no registra descargas ni valoraciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-S/16, DINOv3) + cabecera lineal de 1 salida sobre el embedding agrupado |
| Parametros totales | no disponible (el autor no publica el recuento; el backbone es DINOv3 ViT-S/16) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (clasificador de imagen; entrada fija de 224x224 px RGB) |
| Tipos de cuantizacion | no disponible (pesos en punto flotante PyTorch; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (modelo de vision, sin entrada ni salida de texto) |
| Licencia | other / dinov3-license (heredada del modelo base) |
| Formato de pesos | PyTorch .pth (state_dict completo) + config.json propio; no hay GGUF ni safetensors |
| Normalizacion de entrada | ImageNet, mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225] |
| Salida | logit de cara; sigmoid(logit) = p(cara) |
| Tamano del repositorio | 0,1 GB |
| Pipeline (HuggingFace) | image-classification |
| Descargas / likes | 0 / 0 |
| Fecha declarada de creacion | 11 de septiembre de 2026 |

## Arquitectura y entrenamiento

La arquitectura es un transformer de vision estándar: el backbone DINOv3 ViT-S/16 procesa el recorte de 224x224 píxeles como una secuencia de parches de 16x16 y devuelve un embedding agrupado (pooler_output). Sobre ese vector se aplica una capa `nn.Linear(hidden_size, 1)` y una sigmoide para obtener la probabilidad de cara. El autor indica explícitamente que se trata de un fine-tuning con una sola cabeza lineal sobre el embedding agrupado, no de un ajuste completo del backbone con decodificadores adicionales ni de una arquitectura de detección (no hay cabecera de cajas ni de máscaras).

El entrenamiento se realizó durante 20 épocas, con el mejor checkpoint en la época 4. Los datos combinan tres fuentes: ExpWild e iCartoonFace para caras humanas reales y caras de dibujos animados, y FacesInThings para caras pareidólicas (rostros percibidos en objetos y texturas inanimadas). Los negativos son recortes aleatorios del mismo tamaño extraídos de las mismas imágenes, muestreados de forma que no solapen ninguna caja de cara etiquetada, lo que evita falsos negativos contaminados por rostros parciales. El código completo de entrenamiento está en el repositorio FacePareidolia del autor (`train.py`, `face_dataset.py`), que es también la referencia para reproducir el pipeline. La función de pérdida, el optimizador, la tasa de aprendizaje y el número de tokens o imágenes vistas no se detallan en la información disponible.

Como innovación práctica destacable, el repositorio incluye su propio `config.json` con metadatos de arquitectura (sin pesos del modelo base) y publica los pesos afinados completos en `dinov3_face_region_classifier.pth`. Esto permite reconstruir el modelo con `AutoConfig.from_pretrained` + `AutoModel.from_config` y cargar el state_dict sin solicitar acceso al checkpoint DINOv3 restringido, aunque la licencia del modelo base sigue aplicando.

## Capacidades

- Clasificación binaria cara / no cara sobre un recorte de 224x224 píxeles, con salida probabilística vía sigmoide.
- Reconocimiento de caras humanas reales (entrenado con ExpWild).
- Reconocimiento de caras de personajes de dibujos animados e ilustraciones (entrenado con iCartoonFace).
- Detección de pareidolia: identifica configuraciones visuales que el sistema perceptivo humano lee como cara aunque estén en objetos inanimados o texturas (entrenado con FacesInThings).
- Uso como señal de guiado (guidance) para dirigir la generación de imágenes hacia contenido con estructura facial en una región concreta del lienzo.
- Extracción de embeddings visuales del backbone DINOv3 ViT-S/16, reutilizables para otras tareas de visión.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No tiene capacidades multilingües, de texto, de audio ni de vídeo.
- No realiza detección con cajas delimitadoras, segmentación ni seguimiento; solo puntúa una región ya recortada.
- No dispone de modo "thinking" ni de generación de texto.

## Casos de uso

- Filtrado previo en pipelines de privacidad: dado un detector de caras que proponga cajas, este clasificador puede confirmar o descartar cada recorte antes de aplicar desenfoque o pixelado, reduciendo falsos positivos de detectores más laxos y ahorrando cómputo en la etapa de anonimización.
- Guiado de generación de imágenes: en un flujo de difusión que permita puntuar regiones, el clasificador actúa como señal para empujar al modelo a colocar una estructura facial (real o pareidólica) en una zona concreta; el autor lo plantea explícitamente para este fin.
- Curación de datasets de visión: filtrar automáticamente recortes que contienen caras antes de publicar un corpus de imágenes, o al contrario, construir un subconjunto de recortes faciales para entrenar otros modelos, gracias a su comportamiento entrenado con negativos no solapados.
- Estudio de pareidolia en percepción: construir estímulos y contarlos de forma objetiva en experimentos de psicología de la percepción, usando la salida probabilística como medida continua de "caridad" de una textura.
- Moderación de contenido y pre-filtrado: descartar rápidamente recortes sin rostros para que solo los candidatos positivos pasen a modelos más caros (detección de identidad, estimación de edad, clasificación de contenido sensible).
- Control de calidad en fotografía y encuadre automático: verificar que el recorte final de un retrato contiene efectivamente la cara esperada antes de exportarlo, o decidir entre varios encuadres candidatos.
- Clasificación de personajes en contenido de animación: separar fotogramas o crops que contienen caras de personaje de los que no, útil para indexado y etiquetado de catálogos de animación.
- Inferencia en el borde (edge): al ser un ViT-S/16 con cabeza lineal y un repositorio de 0,1 GB, es candidato para despliegue en dispositivos con recursos limitados, siempre que se acepte una ventana deslizante para localizar caras.

## Benchmarks y rendimiento

El autor solo publica métricas de validación interna; no hay resultados en suites estándar (MMLU, HumanEval, GSM8K u otras), que por otra parte no aplican a un clasificador de imagen.

| Metrica | Valor | Conjunto de evaluacion |
|---|---|---|
| val_loss (mejor checkpoint, epoca 4 de 20) | 0,061 | 10 % holdout a nivel de imagen |
| val_acc (mejor checkpoint, epoca 4 de 20) | 98,0 % | 10 % holdout a nivel de imagen |
| Accuracy en benchmarks publicos (ImageNet, COCO, WIDER FACE, etc.) | No se han publicado resultados de benchmarks en la informacion disponible | no disponible |

Nota metodológica: el holdout es a nivel de imagen, lo que reduce la fuga de información entre recortes de la misma fotografía, pero la métrica procede de una única partición interna declarada por el autor y no ha sido replicada de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en fp32 (estimación a partir de un backbone ViT-S/16 y un repositorio de 0,1 GB; el autor no publica cifras).
- GPU recomendadas: cualquier GPU con soporte CUDA moderna es suficiente, incluida una NVIDIA GTX 1650, RTX 3060 o superior; para lotes grandes, A100 o H100 aportan sobre todo throughput, no viabilidad.
- Cabe en GPU de consumo: sí, con holgura, en cualquier GPU de consumo con al menos ~1 GB de memoria libre; también es viable en CPU para lotes pequeños o inferencia puntual.
- Opciones de despliegue: PyTorch con transformers (`AutoConfig` + `AutoModel.from_config`) y el state_dict publicado, tal como documenta el autor; exportación a ONNX o TorchScript es factible por ser un módulo PyTorch estándar, aunque no está documentada ni verificada en el repositorio. No aplican vLLM, TGI, llama.cpp ni Ollama, que sirven modelos de lenguaje y no clasificadores de visión; no se distribuyen pesos GGUF.
- Latencia y throughput: no disponible; no se publican mediciones. Para un ViT-S/16 a 224 píxeles se espera un coste bajo por imagen en GPU moderna, pero se trata de una estimación no confirmada por el autor.
- Requisito de entrada: los recortes deben redimensionarse exactamente a 224x224 y normalizarse con media y desviación ImageNet indicadas en la model card.

## Comparativa con modelos similares

| Modelo | Tarea | Parametros | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DINOv3 Face-Region Classifier | Clasificacion binaria cara / no cara por region (incluye pareidolia y dibujos) | no disponible | 224x224 px | dinov3-license | HuggingFace; 0 descargas, 0 likes |
| facebook/dinov3-vits16-pretrain-lvd1689m | Backbone auto-supervisado para representaciones visuales | no disponible en la informacion proporcionada | 224x224 px (ViT-S/16) | dinov3-license | HuggingFace, checkpoint restringido (gated) |
| Clasificadores zero-shot tipo CLIP / SigLIP | Clasificacion texto-imagen, incluida la consulta "a photo of a face" | no disponible | segun variante (habitualmente 224x224 px) | no disponible | HuggingFace |
| Detectores de caras tipo RetinaFace / MTCNN | Deteccion con cajas delimitadoras y puntos faciales | no disponible | imagen completa | no disponible | repositorios de codigo y pesos publicos |

Diferencias clave frente a las alternativas: los detectores clásicos localizan caras pero no están entrenados para pareidolia ni para caras de dibujos animados, y su umbral suele fallar en texturas ambiguas; los clasificadores zero-shot permiten consultas en lenguaje natural, pero no se han afinado con negativos controlados para el problema concreto de región facial; el backbone DINOv3 sin afinar no ofrece una decisión binaria. Este modelo ocupa un nicho específico: decisión binaria calibrada por región, con pareidolia incorporada en el entrenamiento. No se dispone de datos comparativos de rendimiento entre estas opciones en la información proporcionada.

## Limitaciones y advertencias

- No detecta: no devuelve cajas delimitadoras ni coordenadas. Localizar caras en una imagen completa exige ventana deslizante o un detector previo que genere los recortes.
- Restricción de entrada rígida: solo acepta 224x224 RGB con normalización ImageNet; otros tamaños o espacios de color requieren preprocesado manual.
- Umbral no calibrado: el autor publica la precisión pero no un punto de corte recomendado; en producción habrá que calibrar la sigmoide según el coste relativo de falsos positivos y falsos negativos.
- Falsos positivos por diseño: el modelo está entrenado para marcar pareidolia como cara, de modo que texturas con dos manchas y una línea activarán la salida positiva de forma intencionada. Esto es deseable para guiado generativo y problemático para moderación estricta.
- Falsos negativos esperables: caras muy ocluidas, de perfil, a muy baja resolución, en infrarrojo o con iluminación extrema pueden no detectarse; el rendimiento por subgrupo no se ha publicado.
- Sesgos de los datos: ExpWild, iCartoonFace y FacesInThings no están descritos con estadísticas demográficas, de etnia, edad, género ni distribución geográfica, por lo que no puede descartarse un sesgo de representación. Las caras de dibujos animados dominan el registro no fotorrealista.
- Métrica no replicada: el 98,0 % de exactitud procede de una única partición de validación interna del propio autor, sin evaluación externa ni comparación con líneas base publicadas.
- Licencia: el modelo deriva de facebook/dinov3-vits16-pretrain-lvd1689m y queda sujeto a la dinov3-license de Meta. Antes de un uso comercial hay que revisar los términos de esa licencia; el checkpoint base está restringido en Hugging Face, aunque este repositorio permita reconstruir el modelo sin solicitar acceso.
- Madurez del repositorio: 0 descargas, 0 likes, sin paper asociado ni validación de terceros; el mantenimiento depende de un único autor y las fechas declaradas en HuggingFace son poco habituales.
- Sin capacidades de lenguaje: no hay tool calling, agentes, generación de texto ni soporte multilingüe. Cualquier flujo que necesite descripciones textuales requiere otro modelo.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de clasificaciones erróneas con alta confianza en dominios alejados de la distribución de entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/harveymannering/DINOv3_FaceRegionClassifier
- Modelo base (DINOv3 ViT-S/16, restringido): https://huggingface.co/facebook/dinov3-vits16-pretrain-lvd1689m
- Codigo de entrenamiento (train.py, face_dataset.py): https://github.com/harveymannering/FacePareidolia/tree/main/classifier
- Licencia DINOv3 de Meta: https://ai.meta.com/resources/models-and-libraries/dinov3-license
- Las busquedas web realizadas no devolvieron ningun enlace adicional relevante sobre este modelo; no se dispone de paper, blog ni demo asociados.
