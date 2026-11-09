# Krrrrish/industrial-surface-defect-segmentation

## Resumen

`Krrrrish/industrial-surface-defect-segmentation` es un conjunto de modelos de segmentacion semantica de imagenes orientado a la inspeccion automatica de superficies de acero y banda metalica. Lo publica el usuario Krrrrish en Hugging Face bajo licencia MIT y esta implementado en PyTorch. El repositorio incluye dos arquitecturas U-Net con backbones preentrenados (ResNet-34 y EfficientNet-B3, ambos adaptados a un solo canal de entrada) y un U-Net de referencia entrenado desde cero, todos operando sobre imagenes de resolucion fija de 128 x 800 pixeles.

El modelo resuelve un problema clasico de vision industrial: detectar y delimitar a nivel de pixel cuatro categorias de defectos (rayones/poros, defectos menores, inclusiones y parches superficiales) en tiras de acero en movimiento, donde el desbalance de clases es severo y los defectos pueden ocupar pocos pixeles. Para ello emplea una funcion de perdida BCEDiceLoss con ponderacion de pixeles positivos, umbrales de probabilidad calibrados por clase y filtros de area minima sobre componentes conectados de 8 vecinos.

Su relevancia practica radica en que empaqueta no solo los pesos sino tambien el pipeline completo de calibracion y post-proceso (TTA de 4 vistas por volteo, umbrales por clase, codificacion RLE estilo Kaggle) en scripts reutilizables (`models_def.py`, `utils.py`, `app.py`, `inference_demo.py`), lo que facilita reproducir el flujo de inferencia sin reentrenar. No es un modelo de lenguaje ni un transformer generativo: es un segmentador convolucional especializado, de tamano reducido y pensado para despliegue en CPU o GPU modesta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-Net con backbone ResNet-34 o EfficientNet-B3 (entrada de 1 canal); incluye U-Net "scratch" de referencia |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; resolucion de entrada fija de 128 x 800 pixeles |
| Tipos de cuantizacion | no disponible (pesos PyTorch en precision original; no se documentan variantes INT8/FP16) |
| Idiomas soportados | no aplica (modelo de vision); documentacion en ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | PyTorch (checkpoints `.pth`/state dict cargados via `load_model_with_weights`); no se indica safetensors ni GGUF |
| Funcion de perdida | BCEDiceLoss con ponderacion de pixeles positivos |
| Clases de defecto | 4 (defect_a, defect_b, defect_c, defect_d) |
| Umbrales calibrados | 0.35 / 0.22 / 0.42 / 0.42 |
| Area minima por componente | 25 / 25 / 220 / 350 px |
| TTA | 4 vistas (volteos) con promediado |
| Metricas declaradas | dice |

## Arquitectura y entrenamiento

El modelo es un segmentador denso de tipo encoder-decoder. El encoder es un ResNet-34 o un EfficientNet-B3 preentrenado, modificado para aceptar una unica componente de intensidad (escala de grises) en lugar de tres canales RGB; el decoder es un U-Net que reconstruye la mascara a la resolucion original de 128 x 800. Se incluye ademas un U-Net entrenado desde cero como linea base. La salida es un mapa de probabilidad por pixel para cada una de las cuatro clases de defecto, mas el fondo.

El entrenamiento se realizo en un notebook de Kaggle (`dl-24f3005189-notebook-t32026.ipynb`) con seguimiento de experimentos en Weights & Biases. La perdida combina entropia cruzada binaria ponderada (para compensar el fuerte desbalance entre pixeles de defecto y de fondo) con soft Dice. El post-proceso es parte integral del diseno: umbrales de probabilidad calibrados por clase y eliminacion de componentes conectados por debajo de un area minima, ajustados a la metrica oficial de la competicion. En inferencia se aplica Test-Time Augmentation de 4 vistas por volteo y se promedian las probabilidades. No se documenta el volumen de tokens ni la composicion exacta del dataset de entrenamiento; solo se indica que proviene de una competicion de inspeccion de superficies de acero.

## Capacidades

- Segmentacion semantica a nivel de pixel de cuatro clases de defectos superficiales en imagenes de banda metalica de 128 x 800 px.
- Deteccion de defectos en escala de grises (entrada de un solo canal).
- Clasificacion implicita de imagenes "vacias" (sin defecto) mediante el score de exactitud en vacio de la metrica.
- Post-proceso calibrado por clase: umbrales especificos y filtrado de componentes conectados por area minima.
- Test-Time Augmentation de 4 vistas por volteo para mejorar la localizacion de bordes.
- Generacion de overlays de segmentacion de alto contraste para inspeccion visual.
- Exportacion de mascaras en formato RLE compatible con Kaggle.
- Interfaz Gradio incluida para demo interactiva.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: es exclusivamente vision por computador.

## Casos de uso

- Inspeccion en linea de bandas de acero: el modelo procesa tiras de 128 x 800 px a alta cadencia y devuelve mascaras por clase, permitiendo marcar bobinas con defectos antes de procesamientos posteriores. Su resolucion fija y bajo coste computacional lo hacen apto para integracion en cabinas de camara industrial.
- Control de calidad en fabricacion de metales: deteccion de rayones, inclusiones de escoria y parches de laminacion con umbrales calibrados por clase, reduciendo falsos positivos gracias al filtro de area minima (220-350 px para clases de mayor extension).
- Pre-etiquetado y aumento de datasets: usar las mascaras generadas como pseudo-etiquetas para acelerar el etiquetado manual en nuevas lineas de produccion o materiales.
- Monitorizacion de desgaste de utillaje: la evolucion de la frecuencia y morfologia de defectos (por ejemplo, inclusiones de clase `defect_c`) puede correlacionarse con el estado de rodillos o matrices.
- Despliegue en dispositivos de borde: al ser un U-Net ligero sobre 128 x 800 px, puede ejecutarse en CPU o GPU de gama baja dentro de la propia planta, sin depender de la nube.
- Investigacion y benchmarking de segmentacion industrial: el repositorio incluye linea base "scratch", dos backbones y una metrica compuesta reproducible, lo que sirve como punto de partida para comparar nuevas arquitecturas en el mismo dominio.
- Generacion de informes visuales: el overlay de segmentacion de alto contraste permite adjuntar evidencias visuales a los informes de no conformidad de cada lote.

## Benchmarks y rendimiento

Resultados de validacion declarados por el autor con la metrica oficial de la competicion: `Score = 0.70 * Dice_foreground + 0.20 * Score_FP + 0.10 * Acc_empty`.

| Modelo | Score competicion | Dice foreground | Score falsos positivos | Exactitud en vacio |
|---|---|---|---|---|
| EfficientNet-B3 U-Net | 0.7056 | 0.6081 | 0.9333 | 0.9333 |
| ResNet-34 U-Net | 0.6701 | 0.5654 | 0.9144 | 0.9144 |
| Ensemble (Top-2) | 0.7000 | 0.5900 | 0.9566 | 0.9566 |
| Scratch U-Net (baseline) | 0.5739 | 0.4481 | 0.8675 | 0.8675 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que no aplican a un modelo de segmentacion.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; por el tamano de las arquitecturas (ResNet-34 / EfficientNet-B3 con entrada de 1 canal y resolucion 128 x 800) se espera un consumo bajo, del orden de pocos GB en FP32, aunque el autor no publica cifras.
- GPU recomendadas: no especificadas por el autor; el ejemplo de inferencia del README se ejecuta en `device="cpu"`, lo que sugiere que el modelo es viable sin GPU.
- GPU de consumo: por el reducido tamano de entrada y de los backbones, es probable que quepa en cualquier GPU consumer moderna (RTX 3060 o superior), si bien no se aportan mediciones.
- Opciones de despliegue: PyTorch nativo (`models_def.py` + `utils.py`), script `inference_demo.py` y aplicacion Gradio (`app.py`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles; el autor no publica mediciones de tiempo de inferencia ni FPS.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Clases | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EfficientNet-B3 U-Net (este repo) | U-Net + EfficientNet-B3 | 128 x 800, 1 canal | 4 defectos | MIT | Hugging Face |
| ResNet-34 U-Net (este repo) | U-Net + ResNet-34 | 128 x 800, 1 canal | 4 defectos | MIT | Hugging Face |
| Scratch U-Net (baseline del repo) | U-Net desde cero | 128 x 800, 1 canal | 4 defectos | MIT | Incluido en repo |
| Segmentadores genericos (p. ej. SAM, Mask2Former) | Modelos fundacionales de segmentacion | Variable, RGB | Prompt-based / panoptico | Variable | Amplia |

No se dispone de comparativas publicadas frente a otros segmentadores especificos de defectos industriales en la informacion proporcionada; los unicos datos comparativos son los internos del propio repositorio (tabla de benchmarks).

## Limitaciones y advertencias

- Modelo especializado y no generico: solo segmenta las cuatro clases de defecto definidas y sobre el dominio de superficies de acero/metal; no es transferible sin reentrenamiento a otros materiales o tipos de defecto.
- Resolucion de entrada fija de 128 x 800 px: imagenes de otra relacion de aspecto o resolucion deben redimensionarse, lo que puede degradar la deteccion de defectos muy finos.
- Entrada en escala de grises de un solo canal: no aprovecha informacion de color, relevante en algunos tipos de defecto.
- Riesgo de falsos positivos y negativos: el propio autor calibra umbrales y areas minimas para mitigar falsos positivos, lo que indica sensibilidad a texturas y ruido; el Dice de foreground es moderado (0.61 en el mejor modelo), por lo que la delimitacion de bordes no es perfecta.
- Sin datos publicados sobre sesgos: no se documenta analisis de sesgo por tipo de acero, iluminacion o camara.
- Sin garantias de produccion: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta; es un artefacto de competicion/experimento, no un modelo validado en entornos industriales reales.
- Licencia MIT: permite uso comercial y modificacion con atribucion, pero no incluye garantias ni soporte.
- No se documentan requisitos de hardware ni latencias, lo que dificulta planificar un despliegue en linea de produccion de alta cadencia sin mediciones propias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Krrrrish/industrial-surface-defect-segmentation
- Notebook de entrenamiento referenciado en la model card: `dl-24f3005189-notebook-t32026.ipynb` (no se proporciona URL publica)
- Seguimiento de experimentos: Weights & Biases, proyecto `24f3005189-t32026` (no se proporciona URL publica)
- No se han encontrado en la informacion proporcionada enlaces adicionales a papers, blogs, repositorios o demos.
