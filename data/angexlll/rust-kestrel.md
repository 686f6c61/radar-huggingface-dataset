# ANGExllL/rust-kestrel

## Resumen

Rust-kestrel es un clasificador de imágenes basado en EfficientNetV2-L (`efficientnet_v2_l` de torchvision), afinado mediante entrenamiento adversarial para la subred Perturb (netuid 26) de Bittensor. El modelo parte de los pesos de ImageNet-1K con 1000 clases y ha sido ajustado para mantener la clasificación correcta frente a perturbaciones adversarias, que es precisamente la tarea que evalúa dicha subred. Lo publica el usuario ANGExllL en Hugging Face bajo licencia Apache 2.0, con un único artefacto de pesos en formato safetensors.

Se trata, por tanto, de un modelo de visión por computador y no de un modelo de lenguaje: no genera texto, no soporta tool calling ni agentes y no tiene ventana de contexto en el sentido habitual. Su entrada es una imagen redimensionada de forma bicúbica a 480 píxeles y recortada en el centro a 480x480, con normalización de media y desviación típica 0,5, siguiendo `EfficientNet_V2_L_Weights.IMAGENET1K_V1.transforms()`. La salida es un vector de logits sobre las 1000 clases de ImageNet.

Su relevancia es acotada y muy específica: sirve como referencia reproducible de un minero de la subred Perturb, ya que la model card incluye la hotkey del minero y el hash on-chain `sha256(model.safetensors || hotkey)`, lo que permite verificar que los pesos publicados se corresponden con los enviados a la red. El repositorio no incluye resultados de precisión, robustez adversarial ni detalles del conjunto de datos de ajuste, y en el momento de redactar esta ficha acumula 0 descargas y 0 likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientNetV2-L (torchvision `efficientnet_v2_l`), red neuronal convolucional con escalado compuesto |
| Parametros totales | 119.027.848 (dato leido del archivo safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica: modelo de vision; la entrada es una imagen de 480x480 px |
| Tipos de cuantizacion | no disponibles; el repositorio solo publica pesos safetensors en la precision de entrenamiento |
| Idiomas soportados | no disponible; no es un modelo de lenguaje (las etiquetas de salida corresponden a las 1000 clases de ImageNet, en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`), cargable con `safetensors.torch.load_file` |
| Numero de clases | 1000 (ImageNet-1K) |
| Resolucion de entrada | 480x480 (resize bicubico a 480 + center crop 480) |
| Preprocesado | `EfficientNet_V2_L_Weights.IMAGENET1K_V1.transforms()`, media = desviacion tipica = 0,5 |
| Libreria declarada | torchvision |
| Pipeline | image-classification |
| Hotkey del minero | `5Ebm5cRFAzkHGtq3myyvnL3w6GVSPrAy4LY6HSFMNdQLnomj` |
| Hash on-chain | `sha256(model.safetensors \|\| hotkey)` = `3ed9b9a728b30de319533158df890550fe866833085f7cc398b11469bcfe976a` |
| Tamano del repositorio | 0,5 GB |

## Arquitectura y entrenamiento

La arquitectura es EfficientNetV2-L, la variante grande de la familia EfficientNetV2, una red convolucional con escalado compuesto de profundidad, anchura y resolucion. El modelo base de `torchvision` esta preentrenado sobre ImageNet-1K y expone 1000 clases de salida; el autor no documenta ninguna modificacion estructural de la cabeza de clasificacion ni del cuerpo de la red. El checkpoint publicado se carga instanciando `efficientnet_v2_l(weights=None)` y volcando el state dict con `load_file`. El autor no detalla en la model card la composicion exacta del dataset de ajuste, el numero de pasos, la receta de ataque adversarial empleada (norma, epsilon, numero de iteraciones) ni si se aplico algun tipo de destilacion o regularizacion adicional.

La unica informacion de entrenamiento disponible es que se trata de un fine-tuning con entrenamiento adversarial orientado a la subred Perturb (netuid 26) de Bittensor, cuyo proposito es evaluar la robustez de clasificadores frente a perturbaciones. La model card incluye la hotkey del minero y un hash on-chain que vincula los pesos con la identidad en la red, un mecanismo de trazabilidad habitual en las subredes de Bittensor. No se documentan innovaciones tecnicas propias mas alla del propio ajuste adversarial, ni se publican curvas de entrenamiento, hiperparametros o ablaciones.

## Capacidades

- Clasificacion de imagenes en las 1000 clases de ImageNet-1K, con una unica etiqueta por imagen.
- Robustez adversarial declarada por el autor: el modelo ha sido afinado con entrenamiento adversarial para la subred Perturb, de modo que la intencion es mantener el acierto bajo perturbaciones en la entrada.
- Inferencia sobre imagenes de 480x480 px tras resize bicubico y recorte central; cualquier otra resolucion requiere adaptar el preprocesado.
- Carga directa mediante `safetensors` y `torchvision`, sin dependencias de frameworks de servidores de LLM.
- No soporta tool calling ni function calling.
- No soporta agentes, razonamiento multi-paso ni planificacion.
- No tiene capacidades multilingues: no procesa ni genera texto; las etiquetas de salida estan en ingles por herencia de ImageNet.
- No dispone de modo "thinking", vision-lenguaje, audio, deteccion de objetos, segmentacion ni generacion de imagenes. Es exclusivamente un cabezal de clasificacion.

## Casos de uso

- Auditoria de robustez adversarial: usar el modelo como punto de partida o referencia para reproducir los experimentos de la subred Perturb, comparando la precision limpia frente a la precision bajo ataques con distintos valores de epsilon.
- Filtrado previo en pipelines de vision: integrarlo como clasificador de 1000 clases en un sistema de etiquetado automatico de imagenes, siempre que el dominio de las imagenes se parezca al de ImageNet.
- Verificacion de integridad en Bittensor: recomputar `sha256(model.safetensors || hotkey)` para comprobar que los pesos descargados coinciden con los que el minero subio a la red, ya que la model card publica ambos valores.
- Investigacion en defensas adversariales: emplearlo como modelo victima sobre el que medir la tasa de exito de ataques FGSM, PGD o similares y evaluar tecnicas de mitigacion.
- Etiquetado de conjuntos de datos para vision: generar pseudo-etiquetas ImageNet sobre grandes volumenes de imagenes para preentrenamiento o curriculum de otros modelos, aprovechando que la inferencia cabe en una sola GPU.
- Docencia y prototipado: ejemplo minimo y reproducible de carga de un checkpoint safetensors con torchvision, util para practicas de despliegue de modelos de vision.
- Baseline en competiciones internas de clasificacion: al ser un fine-tune de un backbone estandar de 119 M de parametros, sirve como linea base frente a alternativas como ConvNeXt o ViT.
- Servicio de clasificacion de baja latencia en CPU o GPU de gama media, dado el reducido tamano del checkpoint (0,5 GB en el repositorio).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye exactitud top-1, top-5, ni metricas bajo ataque adversarial (por ejemplo, exactitud frente a PGD con un epsilon concreto). Tampoco hay comparaciones con otros checkpoints de la misma subred. La unica metrica objetiva aportada por la publicacion es el recuento de parametros (119.027.848) y el hash on-chain del artefacto.

## Requisitos de hardware

- VRAM estimada para inferencia, calculada a partir del recuento de parametros (119 M) y del coste de activaciones a 480x480: aproximadamente 0,6-1,0 GB en FP32 para lotes pequenos, en torno a 0,4-0,6 GB en FP16 y alrededor de 0,3 GB en INT8. Son estimaciones derivadas del tamano del modelo, no medidas publicadas por el autor.
- El checkpoint pesa aproximadamente 0,45-0,48 GB en FP32 (119 M de parametros x 4 bytes) y 0,5 GB es el tamano del repositorio declarado, coherente con un unico archivo safetensors.
- Cabe sin problema en cualquier GPU de consumo con 4 GB o mas de VRAM (GTX 1650, RTX 3050, RTX 4060, RTX 3060, RTX 4090) e incluso en iGPU con memoria compartida para lotes de una imagen.
- Para despliegues de alto volumen se recomiendan GPU de centro de datos como A100, H100, L40S o T4, aunque el modelo es suficientemente pequeno como para no necesitarlas.
- La inferencia en CPU es viable (por ejemplo, 8 hilos AVX2 o AVX-512); el cuello de botella sera la resolucion de 480x480 y el preprocesado, no el numero de parametros.
- Opciones de despliegue: PyTorch con torchvision, exportacion a TorchScript o ONNX Runtime, NVIDIA Triton Inference Server, TorchServe, o wrappers REST sobre FastAPI. vLLM, llama.cpp, Ollama y TGI no aplican, porque estan orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles. El autor no publica mediciones de latencia por imagen ni de imagenes por segundo en ningun hardware concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Modalidad | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ANGExllL/rust-kestrel | 119.027.848 | Clasificacion de imagenes (ImageNet-1K) | Imagen 480x480 px | Apache 2.0 | Hugging Face, 0 descargas, 0 likes |
| torchvision `efficientnet_v2_l` (ImageNet-1K) | 118.513.720 (118,5 M, segun la implementacion de referencia) | Clasificacion de imagenes (ImageNet-1K) | Imagen 480x480 px | BSD-3-Clause (torchvision) | Pesos oficiales en torchvision |
| ConvNeXt-L (ImageNet-1K) | ~198 M | Clasificacion de imagenes (ImageNet-1K) | Imagen 224x224 px (tambien 384) | MIT / CC-BY-4.0 segun implementacion | Pesos publicos en torchvision y otros repositorios |
| ViT-L/16 (ImageNet-1K) | ~304 M | Clasificacion de imagenes (ImageNet-1K) | Imagen 224x224 px | Apache 2.0 / CC-BY-4.0 segun implementacion | Pesos publicos en torchvision y terceros |

La comparacion cuantitativa de precision no es posible: no se ha publicado la exactitud de `rust-kestrel` en ImageNet ni bajo ataques adversariales, por lo que no se puede afirmar si el ajuste adversarial mejora, mantiene o degrada la precision limpia respecto al backbone original. Las cifras de parametros de los modelos alternativos son orientativas y corresponden a sus implementaciones de referencia, no a este checkpoint. La diferencia funcional clave de `rust-kestrel` frente a esos backbones es su proposito especifico dentro de la subred Perturb y la trazabilidad on-chain de los pesos.

## Limitaciones y advertencias

- No se ha publicado ningun dato de rendimiento: se desconoce la exactitud top-1 limpia y la exactitud bajo ataque adversarial de este checkpoint concreto.
- El entrenamiento adversarial suele implicar un compromiso entre robustez y precision en datos limpios; el autor no documenta como se resolvio ese equilibrio ni con que epsilon.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de clasificacion erronea confiada, especialmente fuera de la distribucion de ImageNet y con imagenes en dominios muy distintos (medicas, satelitales, industriales).
- Sesgos conocidos: el modelo hereda los sesgos de ImageNet-1K en cuanto a representacion de clases, geografia, cultura y demografia. El ajuste adversarial no corrige esos sesgos y puede alterar su comportamiento de forma no documentada.
- Limitacion de idioma: no procesa texto. Solo maneja imagenes y devuelve indices de clase de ImageNet, con etiquetas en ingles.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificacion, pero el modelo base de torchvision y los pesos de ImageNet subyacentes tienen sus propias condiciones (torchvision se distribuye bajo BSD-3-Clause). Conviene revisar la cadena completa de licencias antes de un uso comercial.
- No esta claro el origen exacto del ajuste adversarial (que datos, que ataques, cuantas epocas). Sin esa informacion no se puede reproducir el resultado ni garantizar que la robustez se generalice a amenazas distintas de las usadas en el entrenamiento.
- La fecha de creacion declarada en el repositorio (2026-09-28) es posterior a la fecha habitual de publicacion de este tipo de fichas y resulta atipica; conviene verificar la vigencia del repositorio antes de depender de el.
- Repositorio sin validacion de la comunidad: 0 descargas y 0 likes. No hay issues, discusiones ni terceros que hayan reproducido los resultados.
- No hay versiones cuantizadas ni convertidas a ONNX, TensorRT o Core ML publicadas por el autor; cualquier conversion corre por cuenta del usuario.
- El hash on-chain solo garantiza correspondencia entre pesos y hotkey del minero; no certifica calidad ni correccion del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ANGExllL/rust-kestrel
- Perfil del autor en Hugging Face: https://huggingface.co/ANGExllL/models
- Subred Perturb (netuid 26): https://perturbai.io

Notas sobre la busqueda web: los resultados obtenidos no guardan relacion con este modelo. En concreto, `jppenixe-del/kestrel-chess` (https://github.com/jppenixe-del/kestrel-chess/tree/main) es un motor de ajedrez en Rust; `Bahtya/kestrel-agent` (https://github.com/Bahtya/kestrel-agent) es un framework de agentes en Rust; el hilo de X sobre un prompt de jailbreak (https://x.com/Forhanvv/status/2104622842063225012) y el proyecto "Kestrel" de segmentacion 3D (https://feielysia.github.io/Kestrel.github.io/) son proyectos distintos que comparten el nombre. No se han encontrado papers, blogs ni repositorios asociados a `ANGExllL/rust-kestrel` mas alla de su model card.
