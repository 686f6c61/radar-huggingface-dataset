# CBABHI/gan-artwork-generation

## Resumen

GAN Artwork Generation Models es un conjunto de tres modelos generativos entrenados en PyTorch por el usuario CBABHI para sintetizar imagenes de estilo artistico. La coleccion incluye una DCGAN (Deep Convolutional GAN), una cGAN (Conditional GAN) y una CAN (Creative Adversarial Network), todas ellas entrenadas sobre el dataset WikiArt con el objetivo de cubrir 27 movimientos artisticos historicos y contemporaneos. El modelo se publica como pesos de PyTorch (checkpoint_latest.pth) bajo licencia MIT, con un peso de 56,2 MB y una resolucion de salida de 64x64 pixeles en RGB.

A diferencia de los modelos de difusion actuales, esta propuesta se apoya en la familia clasica de redes generativas adversarias, lo que la hace extremadamente ligera y apta para entornos con recursos limitados. La dimension latente es de 100 y el entrenamiento se realizo durante 75 epocas sobre una unica GPU NVIDIA RTX 4050, un dato que situa el proyecto en el ambito de la experimentacion accesible y reproducibile mas que en el de la produccion a gran escala.

Su relevancia actual es principalmente didactica y de investigacion: sirve como referencia para estudiar la evolucion de las GAN aplicadas al arte generativo, comparar el comportamiento de DCGAN, cGAN y CAN sobre un mismo corpus y reutilizar pesos ya entrenados en prototipos de bajo coste. No se ha publicado informacion sobre parametros totales, idiomas soportados ni resultados numericos de benchmarks mas alla de la metrica FID declarada en las etiquetas del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DCGAN, cGAN y CAN (redes generativas adversarias convolucionales) |
| Parametros totales | no disponible (checkpoint de 56,2 MB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de generacion de imagen, no de texto) |
| Tipos de cuantizacion | no disponible (se distribuye en punto flotante de PyTorch) |
| Idiomas soportados | no disponible (la salida es imagen, no texto) |
| Licencia | MIT |
| Formato de pesos | checkpoint de PyTorch (.pth / checkpoint_latest.pth) |

Otros datos tecnicos declarados por el autor: resolucion de salida 64x64x3 RGB, dimension latente 100, 75 epocas de entrenamiento (0-74), dataset WikiArt, metrica FID, tamano del repositorio 0,1 GB.

## Arquitectura y entrenamiento

La propuesta agrupa tres variantes de la familia GAN. La DCGAN emplea un generador y un discriminador completamente convolucionales, sin capas densas, con normalizacion por lotes y activaciones ReLU en el generador y LeakyReLU en el discriminador, un diseno habitual para estabilizar el entrenamiento adversarial a baja resolucion. La cGAN introduce condicionamiento, de modo que la generacion queda guiada por una etiqueta o atributo, lo que en este caso se traduce en la capacidad de dirigir la salida hacia un movimiento artistico concreto. La CAN (Creative Adversarial Network) anade una senal de novedad frente al estilo aprendido, con el objetivo de que el modelo no se limite a imitar el corpus y explore combinaciones estilisticas nuevas.

El entrenamiento se realizo durante 75 epocas sobre una NVIDIA RTX 4050, una GPU de gama consumer, lo que confirma que el coste computacional del proyecto es bajo. El corpus utilizado es WikiArt, que cubre 27 movimientos artisticos. En la model card se declara la metrica FID, habitual para evaluar la calidad y la diversidad de imagenes generadas, aunque no se proporcionan valores concretos. No hay informacion sobre el numero de imagenes de entrenamiento, la composicion exacta del dataset, el tamano de lote ni si se aplicaron tecnicas posteriores como ajuste fino con preferencias humanas.

## Capacidades

- Generacion de imagenes de 64x64 pixeles en color RGB a partir de un vector latente de dimension 100.
- Sintesis condicionada por estilo artistico en la variante cGAN, cubriendo hasta 27 movimientos artisticos segun la model card.
- Exploracion creativa de estilos en la variante CAN, orientada a producir salidas que se desvian deliberadamente de las convenciones del corpus original.
- Inferencia en CPU y en GPU, dado el reducido tamano de los pesos (56,2 MB) y la baja resolucion de salida.
- Carga directa en PyTorch mediante `torch.load`, con el diccionario de estado del generador accesible en `checkpoint['generator_state_dict']`.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingues: no aplica (modelo de imagen).
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Prototipado rapido de arte generativo en local: con 56,2 MB de pesos y salidas de 64x64, el modelo se puede ejecutar en un portatil sin GPU dedicada para validar ideas de generacion estilistica antes de invertir en modelos de difusion mas costosos.
- Docencia e investigacion sobre GAN: comparar en un mismo corpus el comportamiento de una DCGAN, una cGAN y una CAN permite ilustrar conceptos como el colapso de modo, el condicionamiento por etiqueta y la novedad estilistica con resultados reproducibles.
- Generacion de paletas y bocetos de baja resolucion: las salidas de 64x64 sirven como referencia cromatica y compositiva que despues se puede reescalar o utilizar como entrada de un modelo de superresolucion.
- Aumento de datos para clasificadores de estilo artistico: las imagenes sinteticas etiquetadas por movimiento pueden ampliar conjuntos pequenos de entrenamiento en tareas de clasificacion de arte.
- Demostraciones web interactivas: la propia model card enlaza una interfaz desplegada, de modo que el modelo encaja en demos ligeras donde el usuario elige un estilo y recibe una imagen en pocos milisegundos.
- Experimentacion con redes adversariales condicionadas: la variante cGAN permite estudiar como responde el generador a distintas etiquetas de estilo y hasta que punto el condicionamiento se respeta.
- Investigacion sobre creatividad computacional: la CAN esta pensada para evaluar si un generador puede producir obras que un jurado humano perciba como novedosas sin dejar de ser plausibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara la metrica FID entre las etiquetas del repositorio, pero no incluye ningun valor numerico, ni comparaciones con otras arquitecturas, ni curvas de entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja. Con un checkpoint de 56,2 MB y salidas de 64x64, el modelo cabe holgadamente en cualquier GPU con 2 GB o mas de memoria, y es probable que funcione en CPU con tiempos de generacion aceptables.
- GPU recomendadas: cualquier GPU moderna sirve; el entrenamiento se realizo en una NVIDIA RTX 4050, lo que indica que tarjetas de gama media como RTX 3060, RTX 4060 o superiores son mas que suficientes. En el extremo alto, A100 o H100 no aportan ventaja practica para este tamano de modelo.
- Cabe en GPU de consumo: si, en practicamente todas las GPU de consumo de los ultimos diez anos, asi como en equipos sin GPU dedicada.
- Opciones de despliegue: al ser pesos de PyTorch, el despliegue natural es un script propio con `torch.load` y el generador instanciado en modo evaluacion. No se declara soporte para vLLM, llama.cpp, Ollama ni TGI, que son herramientas orientadas a modelos de lenguaje. Para servir el modelo se puede usar TorchServe, FastAPI o Gradio.
- Latencia y throughput estimados: no disponibles. Dado el tamano del modelo y la resolucion de salida, se espera una latencia muy baja por imagen, pero no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Resolucion de salida | Contexto / condicionamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GAN Artwork Generation (DCGAN/cGAN/CAN) | no disponible (checkpoint de 56,2 MB) | 64x64 | Latente de 100 dimensiones; cGAN condicionada por estilo | MIT | HuggingFace, pesos PyTorch |
| DCGAN original (Radford et al., 2015) | del orden de millones, variable | 64x64 | No condicionada | Codigo de referencia publico | Implementaciones multiples |
| StyleGAN / StyleGAN2 (NVIDIA) | decenas de millones, variable | 1024x1024 en configuracion estandar | Latente y espacio de estilos, condicionamiento limitado | Licencia especifica de NVIDIA | Codigo y pesos publicos |
| BigGAN (DeepMind) | cientos de millones, variable | 128x128, 256x256 y 512x512 | Condicionada por clase | Codigo Apache 2.0 | Codigo y pesos publicos |

La comparacion debe tomarse con cautela: los datos de las alternativas corresponden a las publicaciones originales de cada arquitectura y no a una evaluacion homogenea frente a este modelo. En terminos de resolucion y calidad de imagen, las propuestas StyleGAN y BigGAN trabajan a resoluciones muy superiores; la ventaja de esta coleccion es su licencia MIT permisiva, su tamano minimo y su facilidad de ejecucion en hardware modesto.

## Limitaciones y advertencias

- Resolucion muy baja: 64x64 pixeles limita el uso directo en produccion editorial o impresa; requiere superresolucion si se necesita mayor detalle.
- Sin datos de rendimiento: no hay valores de FID publicados, por lo que no es posible evaluar de forma objetiva la calidad ni la diversidad de las imagenes generadas.
- Riesgo de colapso de modo: es una limitacion conocida de las GAN entrenadas durante pocas epocas (75 en este caso), lo que puede traducirse en salidas poco variadas dentro de un mismo estilo.
- Sesgos del corpus: WikiArt refleja los sesgos historicos del canon artistico occidental, con sobrerrepresentacion de determinados movimientos, autores y epocas, que el modelo reproducira.
- Sin informacion sobre el dataset de entrenamiento: no se detalla el numero de imagenes, el filtrado aplicado ni el reparto por movimiento artistico, lo que dificulta auditar el comportamiento del modelo.
- Idiomas y texto: al ser un modelo de imagen no procesa texto, de modo que no se puede invocar mediante prompts en lenguaje natural sin un codificador externo.
- Formato de pesos propietario de PyTorch: `torch.load` puede ejecutar codigo arbitrario segun la version; conviene cargar los pesos con `weights_only=True` cuando sea posible.
- Licencia MIT: permite uso comercial y modificacion, pero el autor no ofrece garantias ni asume responsabilidad sobre las imagenes generadas ni sobre posibles infracciones de derechos de autor derivadas de la similitud con obras reales.
- Repositorio con cero descargas y cero likes: el modelo no cuenta con validacion de la comunidad ni con reportes independientes de funcionamiento.
- Fecha de publicacion inusual: los metadatos indican octubre de 2026, lo que conviene verificar antes de citar el recurso.
- Uso responsable: las imagenes sinteticas de estilo artistico pueden emplearse para suplantar la obra de un autor vivo; se recomienda etiquetar claramente el contenido como generado por IA.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CBABHI/gan-artwork-generation
- Interfaz web desplegada: https://web-ui-tau-six.vercel.app/
- Dataset WikiArt: https://www.wikiart.org/
- DCGAN original (Radford, Metz y Chintala, 2015): https://arxiv.org/abs/1511.06434
- cGAN original (Mirza y Osindero, 2014): https://arxiv.org/abs/1411.1784
- Creative Adversarial Networks (Elgammal et al., 2017): https://arxiv.org/abs/1706.07068
- StyleGAN2 (Karras et al., 2019): https://arxiv.org/abs/1912.04958
- BigGAN (Brock, Donahue y Simonyan, 2018): https://arxiv.org/abs/1809.11096
- Documentacion de PyTorch sobre `torch.load`: https://pytorch.org/docs/stable/generated/torch.load.html
