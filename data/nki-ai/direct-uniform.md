# NKI-AI/direct-uniform

## Resumen

DIRECT — UNIFORM es un modelo de reconstruccion de imagenes de resonancia magnetica (MRI) desarrollado por NKI-AI, el grupo de investigacion del Netherlands Cancer Institute. Se trata de un checkpoint pre-entrenado del metodo vSHARP (variational Sparse and Hybrid ARchitecture for MRI Reconstruction) que ha sido entrenado de forma conjunta sobre cuatro dominios anatomicos distintos: cerebro, rodilla, prostata y corazon (datos cardiacos de CMRxRecon). El modelo resuelve el problema de la reconstruccion de MRI acelerada, es decir, la recuperacion de imagenes de alta calidad a partir de datos de k-espacio submuestreados, lo que permite reducir el tiempo de adquisicion en entornos clinicos.

La relevancia de este modelo radica en su caracter "uniforme" o multi-anatomia: en lugar de entrenar un modelo separado para cada region anatomica, UNIFORM demuestra que un unico conjunto de pesos puede generalizar a multiples dominios, simplificando el despliegue en entornos clinicos reales donde la variedad de examenes es amplia. El repositorio incluye el checkpoint del modelo (0.4 GB) junto con cuatro archivos de configuracion YAML, uno por anatomia, que fijan la mascara de submuestreo y los parametros de reconstruccion. La arquitectura subyacente es vSHARP, que combina un modelo de difusion por pasos con una red U-Net como denoiser, aunque el tamano total de parametros no se especifica en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | vSHARP (variational Sparse and Hybrid ARchitecture for MRI Reconstruction) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision por imagenes, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (checkpoint .pt) |

## Arquitectura y entrenamiento

vSHARP es una arquitectura de reconstruccion de MRI que combina un modelo de difusion por pasos con una red U-Net como denoiser. El metodo se describe en el preprint de arXiv 2309.09954 y se basa en el marco DIRECT (Deep Image Reconstruction and Translation), un framework de codigo abierto para reconstruccion de MRI desarrollado por el mismo grupo. La arquitectura integra un operador de adquisicion (forward model) que modela el proceso de submuestreo del k-espacio, permitiendo que la reconstruccion se realice de forma condicionada a la mascara de muestreo utilizada.

El entrenamiento del checkpoint UNIFORM se realizo de forma conjunta sobre cuatro conjuntos de datos publicos: fastMRI brain, fastMRI knee, fastMRI prostate y CMRxRecon cardiac. Esta estrategia de entrenamiento multi-dominio es la principal innovacion del modelo, ya que permite que un unico conjunto de pesos funcione correctamente en las cuatro anatomias. Los archivos YAML incluidos en el repositorio fijan la aceleracion por defecto en 4x (tanto con mascaras aleatorias para cerebro como equiespaciadas para rodilla, prostata y corazon), aunque tambien se incluyen comentarios con configuraciones alternativas para factores de aceleracion de 2x, 6x y 8x. Un detalle tecnico relevante es que las configuraciones establecen `image_unet_conv_out_bias: true` para que los tensores de bias de la capa de salida del denoiser carguen correctamente, ya que las U-Net legacy siempre se entrenaron con ese bias.

## Capacidades

- Reconstruccion de imagenes de MRI a partir de datos de k-espacio submuestreados, con soporte para multiples factores de aceleracion (2x, 4x, 6x y 8x).
- Multi-anatomia: un unico checkpoint funciona para cerebro, rodilla, prostata y corazon, sin necesidad de ajuste fino por dominio.
- Compatible con mascaras de submuestreo aleatorias (para cerebro) y equiespaciadas (para rodilla, prostata y corazon).
- Integracion con el framework DIRECT, que proporciona una interfaz de linea de comandos (`direct predict`) para ejecutar inferencia sobre datos de validacion.
- Soporte para inferencia en multiples GPUs mediante el parametro `--num-gpus`.
- Incluye configuraciones YAML listas para usar que fijan todos los hiperparametros de reconstruccion por anatomia.
- Capacidad de procesar datos volumetricos cardiacos de CMRxRecon, con instrucciones especificas para usar los volumenes de ValidationSet/FullSample.

## Casos de uso

- Aceleracion de adquisiciones de MRI clinicas: el modelo permite reconstruir imagenes de alta calidad a partir de datos adquiridos con un factor de aceleracion de 4x, lo que reduce el tiempo de adquisicion en un 75%. Un radiologo podria integrar este modelo en el pipeline de un escaner para obtener imagenes diagnosticas en menos tiempo, mejorando el confort del paciente y aumentando el rendimiento del equipo.

- Investigacion en reconstruccion multi-dominio: dado que el checkpoint esta entrenado en cuatro anatomias, los investigadores pueden utilizarlo como punto de partida para estudiar la transferencia entre dominios o para fine-tuning en nuevas anatomias con pocos datos, aprovechando el pre-entrenamiento conjunto.

- Desarrollo de pipelines de reconstruccion en produccion: el framework DIRECT proporciona una interfaz CLI reproducible y configurable mediante YAML, lo que facilita la integracion del modelo en pipelines automatizados de procesamiento de imagenes medicas en entornos hospitalarios o de investigacion.

- Evaluacion comparativa de metodos de reconstruccion: los investigadores pueden usar este checkpoint como baseline multi-anatomia para comparar nuevos metodos de reconstruccion, ya que los datos de validacion de fastMRI y CMRxRecon son publicos y estandarizados.

- Educacion y formacion en deep learning para imagen medica: al ser un modelo pre-entrenado con licencia Apache 2.0 y codigo abierto, es un recurso didactico excelente para ensenar conceptos de reconstruccion de MRI, modelos de difusion y entrenamiento multi-dominio en cursos de grado o posgrado.

- Reconstruccion de datos cardiacos dinamicos: el modelo incluye soporte especifico para datos de CMRxRecon, lo que permite reconstruir secuencias de cine cardiaco a partir de datos submuestreados, una aplicacion relevante para la evaluacion funcional del corazon en la practica clinica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas cuantitativas como PSNR o SSIM para los distintos conjuntos de datos, ni comparaciones con otros metodos de reconstruccion. Para obtener datos de rendimiento, seria necesario consultar el articulo de UNIFORM en OpenReview (I13Y1nU6gs) o el preprint de vSHARP en arXiv (2309.09954), que no estan accesibles directamente desde la informacion proporcionada.

## Requisitos de hardware

- Tamano del repositorio: 0.4 GB, lo que incluye el checkpoint del modelo y los archivos de configuracion.
- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Dado que el modelo es una U-Net de difusion para imagenes medicas, se estima que podria requerir entre 8 y 16 GB de VRAM para volumenes tipicos de MRI, pero este dato no esta confirmado.
- GPU recomendadas: el framework DIRECT soporta inferencia en GPUs de NVIDIA con CUDA. Para volumenes de MRI completos, se recomienda al menos una GPU con 16 GB de VRAM (por ejemplo, RTX 4080, A100 o V100). El parametro `--num-gpus` permite distribuir la carga entre varias GPUs.
- Compatibilidad con GPUs de consumo: probablemente si, con cuantizacion o procesamiento por volumenes, aunque no hay datos confirmados. Una RTX 3090 o RTX 4090 con 24 GB de VRAM deberia ser suficiente para la mayoria de los casos.
- Opciones de despliegue: el modelo se ejecuta mediante la interfaz CLI de DIRECT (`direct predict`), que gestiona la carga del checkpoint, la configuracion YAML y la inferencia. No se menciona soporte para vLLM, Ollama u otros motores de inferencia, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Anatomias | Framework | Licencia | Checkpoint disponible |
|---|---|---|---|---|
| NKI-AI/direct-uniform (vSHARP UNIFORM) | Cerebro, rodilla, prostata, corazon | DIRECT | Apache 2.0 | Si (0.4 GB) |
| NKI-AI/direct-modulated-convolution | no especificado | DIRECT | Apache 2.0 | Si (26.7 GB) |
| Modelos especificos de fastMRI (por ejemplo, U-Net baselines) | Cerebro, rodilla (por separado) | Varios | Varía | Varía |

La comparativa directa con otros modelos de reconstruccion de MRI no esta disponible en la informacion proporcionada. El modelo UNIFORM se distingue por su entrenamiento multi-anatomia, mientras que la mayoria de los modelos publicados en fastMRI se entrenan para una unica anatomia. El repositorio de DIRECT incluye otros checkpoints, como el de modulated convolution, que aborda la reconstruccion condicional, pero no se proporcionan datos comparativos de rendimiento entre ambos.

## Limitaciones y advertencias

- El modelo esta disenado exclusivamente para reconstruccion de MRI y no es aplicable a otros tipos de imagenes medicas (tomografia computarizada, PET, etc.) sin re-entrenamiento.
- La informacion disponible no incluye metricas de rendimiento cuantitativas, por lo que no es posible evaluar la calidad de reconstruccion esperada sin consultar las publicaciones academicas asociadas.
- El modelo requiere que los datos de entrada sigan el formato de los conjuntos de datos fastMRI y CMRxRecon (k-espacio multicoil), lo que puede limitar su uso directo con datos de otros fabricantes de escaneres sin preprocesamiento adicional.
- Las configuraciones YAML fijan la aceleracion por defecto en 4x; para otros factores de aceleracion (2x, 6x, 8x) es necesario modificar manualmente los archivos de configuracion, lo que requiere conocimiento del framework DIRECT.
- Para datos cardiacos, la model card advierte que las metricas deben calcularse sobre los volumenes de ValidationSet/FullSample de CMRxRecon, no sobre TrainingSet, para obtener resultados comparables.
- Aunque la licencia Apache 2.0 permite uso comercial, el despliegue en entornos clinicos requiere validacion regulatoria adicional (por ejemplo, marcado CE o aprobacion FDA) que no esta cubierta por el modelo.
- No se proporcionan datos sobre sesgos del modelo ni sobre su comportamiento en poblaciones o equipos de adquisicion no representados en los datos de entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/NKI-AI/direct-uniform
- Repositorio GitHub de DIRECT: https://github.com/NKI-AI/direct
- Releases de DIRECT en GitHub: https://github.com/NKI-AI/direct/releases
- Paper de UNIFORM en OpenReview: https://openreview.net/forum?id=I13Y1nU6gs
- Preprint de vSHARP en arXiv: https://arxiv.org/abs/2309.09954
- Documentacion de DIRECT con Google Colab: https://docs.aiforoncology.nl/direct/colab.html
- Modelo relacionado (modulated convolution): https://huggingface.co/NKI-AI/direct-modulated-convolution
