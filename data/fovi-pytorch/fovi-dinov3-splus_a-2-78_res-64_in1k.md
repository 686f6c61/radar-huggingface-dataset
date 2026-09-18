# fovi-pytorch/fovi-dinov3-splus_a-2.78_res-64_in1k

## Resumen

fovi-dinov3-splus_a-2.78_res-64_in1k es un modelo de visión por computador preentrenado que adapta un backbone DINOv3 ViT a entradas con visión foveada (foveated vision). Lo publica la organización fovi-pytorch dentro de la librería fovi, desarrollada por Nicholas M. Blauch, George A. Alvarez y Talia Konkle, y se distribuye bajo licencia Apache 2.0. No es un modelo de lenguaje: es un codificador de imágenes pensado para extraer representaciones visuales cuando la resolución del sensor está fuertemente limitada.

La propuesta técnica consiste en aplicar una función de magnificación cortical (con hiperparámetro a = 2,78) sobre un sensor de resolución 64, de modo que la muestra espacial de la imagen se concentra en el centro del campo visual y se degrada hacia la periferia, imitando la distribución de fotorreceptores de la retina humana. El backbone es la variante pequeña ViT-S/16+, derivada de facebook/dinov3-vits16plus-pretrain-lvd1689m, y el modelo se ha preentrenado sobre ImageNet-1k.

Su relevancia actual está en el nicho de visión eficiente: permite obtener representaciones de calidad con sensores de muy baja resolución y cómputo reducido, algo útil en robótica, drones, dispositivos embebidos y sistemas de visión activa donde no es viable alimentar un ViT estándar a 224x224 o más. El repositorio pesa 0,1 GB y acumula 118 descargas con 0 likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone DINOv3 ViT adaptado a entradas foveadas (variante ViT-S/16+, small) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión, no procesa secuencias de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de visión, sin capacidades linguisticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repositorio de 0,1 GB; la model card no especifica el formato) |

Otros datos declarados por el autor:

| Parametro | Valor |
|---|---|
| Modelo base | facebook/dinov3-vits16plus-pretrain-lvd1689m |
| Dataset de preentrenamiento | ImageNet-1k |
| Hiperparametro de magnificacion cortical (a) | 2,78 |
| Resolucion del sensor | 64 |
| Libreria | fovi (PyTorch) |
| Pipeline en HuggingFace | no disponible |
| Descargas / likes | 118 / 0 |

## Arquitectura y entrenamiento

El modelo parte de un Vision Transformer de la familia DINOv3 en su variante pequeña ViT-S/16+ y sustituye la entrada estándar de imagen por una interfaz foveada: la imagen se muestrea sobre una rejilla cuya densidad decrece desde el centro hacia la periferia siguiendo una función de magnificación cortical. El hiperparámetro a = 2,78 controla la intensidad de esa deformación y la resolución del sensor se fija en 64, de modo que el modelo trabaja con entradas de muy baja resolución efectiva en lugar de imágenes completas a alta resolución. Esta estrategia reduce el número de píxeles necesarios para tareas de reconocimiento y desplaza la capacidad del modelo hacia la zona central del campo visual, donde se concentra el detalle.

El backbone se inicializa desde facebook/dinov3-vits16plus-pretrain-lvd1689m y se entrena sobre ImageNet-1k. La model card no detalla el número de tokens vistos, la composición exacta del dataset, el uso de RLHF/DPO (no aplicable a un codificador visual) ni innovaciones adicionales como decodificación especulativa o atención lineal. La referencia técnica del método es el artículo FOVI: A biologically-inspired foveated interface for deep vision models (Blauch, Alvarez y Konkle, arXiv, 2026), citado en la propia model card.

## Capacidades

- Extracción de características visuales (embeddings) a partir de imágenes foveadas de baja resolución, aptas para clasificación, recuperación y transferencia.
- Clasificación de imágenes: el modelo se ha preentrenado sobre ImageNet-1k, por lo que sirve como base para cabezales de clasificación.
- Backbone para aprendizaje por transferencia en tareas downstream con pocos datos y bajo coste computacional.
- Procesamiento de entradas con un sensor de resolución 64, lo que habilita inferencia en hardware muy limitado.
- Modelado de atención espacial sesgada al centro del campo visual, útil para visión activa y control de mirada.
- Codificación de representaciones auto-supervisadas heredadas de DINOv3 (la model card no detalla qué cabezales o tareas auxiliares se conservan).
- No dispone de generación de texto, tool calling, function calling, soporte de agentes, capacidades multilingües, visión generativa, audio ni modo de razonamiento explícito: es exclusivamente un codificador visual.

## Casos de uso

- Clasificación de imágenes en entornos embebidos: al trabajar con un sensor de resolución 64, el modelo puede ejecutarse en microcontroladores con acelerador o en GPUs integradas para tareas de reconocimiento en tiempo real donde no cabe un ViT a resolución estándar.
- Extracción de embeddings para búsqueda visual y deduplicación: los vectores producidos por el backbone pueden indexarse en una base vectorial para recuperar imágenes similares o agrupar colecciones sin necesidad de un codificador de mayor tamaño.
- Visión activa en robótica: un brazo o una plataforma móvil pueden usar el sesgo foveado del modelo para decidir dónde fijar la atención y refinar el detalle solo en la región relevante, reduciendo el coste de captura y de cómputo.
- Percepción en drones y cámaras de bajo consumo: la combinación de baja resolución de sensor y backbone small permite mantener la inferencia dentro de presupuestos de energía y ancho de banda estrictos.
- Preentrenamiento y ajuste fino para dominios específicos: sirve como inicialización en tareas de inspección industrial, teledetección o imagen médica cuando se dispone de pocos datos etiquetados y se quiere evitar entrenar desde cero.
- Investigación en visión biológicamente inspirada: permite reproducir y comparar variantes de magnificación cortical (distintos valores de a y de resolución de sensor) frente a backbones sin foveación bajo el mismo backbone DINOv3.
- Componente de preprocesado para sistemas multimodales: los embeddings pueden alimentar etapas posteriores de un pipeline (por ejemplo, un clasificador ligero o un módulo de decisión) sin recurrir a un codificador visual de gran tamaño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de exactitud, mAP ni comparaciones cuantitativas con otros backbones, y los resultados de la búsqueda web no aportan datos adicionales sobre el modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El repositorio ocupa 0,1 GB, coherente con un backbone de la familia ViT-S y una entrada de resolución 64, por lo que se espera un consumo muy inferior al de un ViT de resolución estándar; no se publican cifras oficiales.
- GPU recomendadas: no disponibles. Por el tamaño del repositorio, cualquier GPU con al menos unos pocos GB de memoria debería ser suficiente; se trata de una estimación derivada del tamaño de los pesos, no de una especificación del autor.
- Cabe en GPU de consumo: previsiblemente sí, incluidas tarjetas de gama media y GPUs integradas, dado el tamaño del repositorio y la baja resolución de entrada. No hay confirmación oficial.
- Opciones de despliegue: la vía documentada es la librería fovi sobre PyTorch, instalable con pip install git+https://github.com/nblauch/fovi.git, usando get_model_from_base_fn o get_trainer_from_base_fn. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que además no aplican a un codificador visual de este tipo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Resolucion de entrada | Licencia | Datos de rendimiento |
|---|---|---|---|---|---|
| fovi-dinov3-splus_a-2.78_res-64_in1k | DINOv3 ViT-S/16+ con entrada foveada | no disponible | Sensor de 64 con magnificacion cortical a = 2,78 | Apache 2.0 | No publicados |
| facebook/dinov3-vits16plus-pretrain-lvd1689m | DINOv3 ViT-S/16+ sin foveacion | no disponible en la informacion proporcionada | Resolucion estandar (no especificada aqui) | no disponible en la informacion proporcionada | No publicados en esta informacion |
| Otras variantes de la familia fovi (distintos valores de a y resolucion de sensor) | DINOv3 ViT con entrada foveada | no disponible | Sensor variable | Apache 2.0 | No publicados |

No se dispone de datos cuantitativos que permitan comparar el rendimiento de este modelo con alternativas de la misma categoría.

## Limitaciones y advertencias

- Es un codificador visual, no un modelo generativo: no produce texto, no soporta tool calling ni razonamiento multi-paso, y no debe evaluarse con benchmarks de lenguaje.
- La model card no documenta sesgos concretos, pero al haberse preentrenado sobre ImageNet-1k hereda los sesgos de representación y de vocabulario visual de ese dataset.
- Riesgo de alucinación no aplica en el sentido habitual; el riesgo equivalente es la producción de embeddings poco fiables en dominios alejados de ImageNet-1k.
- La entrada está restringida a un sensor de resolución 64 con magnificación cortical a = 2,78: usar otra configuración de muestreo sin reentrenar degrada las representaciones.
- La limitación de idioma no aplica, pero tampoco hay capacidades multilingües ni multimodales.
- Licencia Apache 2.0: permite uso comercial y modificación, con obligación de conservar el aviso de licencia y el archivo NOTICE si existe; conviene verificar las condiciones del modelo base DINOv3 del que deriva.
- El modelo tiene 118 descargas y 0 likes, y no se han publicado métricas ni validaciones externas: para producción conviene ejecutar una evaluación propia antes de adoptarlo.
- No se especifican formatos de pesos ni rutas de exportación (ONNX, TensorRT), lo que puede complicar su integración fuera de la librería fovi.
- Los resultados de la búsqueda web realizada no contienen información relevante sobre el modelo; todos los enlaces devueltos corresponden a páginas de soporte de Microsoft ajenas al tema.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fovi-pytorch/fovi-dinov3-splus_a-2.78_res-64_in1k
- Repositorio de la librería fovi: https://github.com/nblauch/fovi
- Modelo base: https://huggingface.co/facebook/dinov3-vits16plus-pretrain-lvd1689m
- Articulo de referencia: Blauch, N. M., Alvarez, G. A. y Konkle, T., FOVI: A biologically-inspired foveated interface for deep vision models, arXiv, 2026 (sin URL directa en la informacion proporcionada)
- Resultados de busqueda web: sin enlaces relevantes al modelo (solo páginas de soporte de Microsoft)
