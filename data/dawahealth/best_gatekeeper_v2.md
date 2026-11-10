# dawahealth/best_gatekeeper_v2

## Resumen

CerviTriage AI Gatekeeper v2 es un clasificador binario de imagenes desarrollado por el equipo de investigacion e innovacion de Dawa Health. Su funcion es actuar como filtro de validacion de entrada (gatekeeper) antes de un clasificador diagnostico de cancer de cuello uterino: determina si una imagen recibida es una colposcopia real del cervix o, por el contrario, una imagen que no corresponde a ese dominio. De esta forma, el modelo diagnostico solo procesa imagenes para las que fue disenado, evitando predicciones sin sentido sobre entradas fuera de distribucion.

Tecnicamente es un ResNet-50 de torchvision con la capa final sustituida por una capa lineal de 2048 a 2 salidas, lo que da un total de aproximadamente 23,5 millones de parametros. Se distribuye como un state dict de PyTorch de 94,4 MB que se carga directamente sobre `torchvision.models.resnet50`. No es un modelo generativo ni un modelo de lenguaje: no tiene ventana de contexto, no procesa texto y no soporta tool calling.

La relevancia del modelo es acotada y especifica: resuelve un problema de ingenieria de produccion en pipelines de triaje medico (rechazar entradas invalidas antes de la inferencia diagnostica). Es un modelo de investigacion, no validado clinicamente y explicitamente marcado por el autor como no apto para uso como dispositivo medico. Su licencia AGPL-3.0 impone obligaciones copyleft relevantes para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet-50 (torchvision), capa final Linear(2048→2) |
| Parametros totales | 23,5 millones |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision, no procesa texto) |
| Tipos de cuantizacion | no disponible (solo se publica state dict PyTorch en fp32) |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch state dict (`.pth`) |

## Arquitectura y entrenamiento

El modelo es una red neuronal convolucional ResNet-50 estandar de torchvision, con el backbone intacto y la capa totalmente conectada reemplazada por una proyeccion lineal de 2048 dimensiones a 2 clases (`cervix` y `not_cervix`). La entrada es una imagen RGB de 224 × 224 pixeles. El autor indica normalizacion ImageNet en el codigo de ejemplo, aunque marca ese punto como pendiente de confirmar. El framework es PyTorch y el modelo base es `microsoft/resnet-50` (Apache 2.0).

El entrenamiento se realizo sobre el dataset publico de Kaggle `kudzie7/medsig-gatekeeper` (version 1), con 11.547 imagenes en total: 5.543 de la clase `cervix` (48,0%) y 6.004 de la clase `not_cervix` (52,0%). La clase positiva procede integramente del conjunto de entrenamiento del modelo CerviTriage de cinco clases (Negativo 1.445, CIN1 954, CIN2 980, CIN3 992, Positivo 1.172), y la mayoria son copias aumentadas (volteadas, con ruido, rotadas) de un conjunto menor de originales. La clase negativa se compone de imagenes de fuentes publicas: HyperKvasir (3.000, endoscopia gastrointestinal), HAM10000 (800, lesiones dermatoscopicas), ISIC 2019 (700, lesiones cutaneas), radiografias de torax con neumonia (600), MedMNIST v2 (504, 12 subconjuntos, reescaladas de 64 × 64 a 224 × 224), Tiny-ImageNet (250) y COCO 2017 (150). El dataset no incluye split predefinido; el split se realizo en el codigo de entrenamiento y el autor no confirma si fue agrupado por codigo de caso. No se documenta el uso de RLHF, DPO ni tecnicas de alineacion, algo esperable en un clasificador de vision.

## Capacidades

- Clasificacion binaria de imagenes: distingue entre imagen de colposcopia del cervix (`cervix`) y cualquier otra imagen (`not_cervix`).
- Validacion de entrada en pipelines medicos: actua como filtro previo para evitar que un clasificador diagnostico reciba imagenes fuera de dominio.
- Salida de probabilidades por clase mediante softmax, lo que permite fijar umbrales de rechazo ajustables.
- Procesamiento de imagenes RGB a 224 × 224 pixeles con normalizacion ImageNet.
- Inferencia en CPU o GPU (PyTorch, `torch.no_grad`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, generacion de texto, codigo, matematicas, vision general, audio ni modo thinking.
- No tiene capacidades multilingues: no procesa lenguaje.

## Casos de uso

- Filtro previo en un pipeline de triaje de cancer cervical: el gatekeeper se ejecuta antes del clasificador CerviTriage y descarta imagenes que no son colposcopias, de modo que el diagnostico solo se emite sobre entradas validas.
- Validacion de capturas en aplicaciones de cribado comunitario: en un flujo movil donde personal no especializado toma fotografias, el modelo rechaza capturas erroneas (por ejemplo, una foto de piel o de un objeto) y pide repetir la toma.
- Control de calidad de datasets: al procesar lotes de imagenes de origen diverso, el modelo permite separar rapidamente las que pertenecen al dominio colposcopico de las que no, ayudando a curar conjuntos de entrenamiento.
- Enrutamiento de imagenes medicas multimodales: en un sistema que recibe imagenes de distintas especialidades, el gatekeeper identifica cuales corresponden a colposcopia y las dirige al modulo adecuado.
- Deteccion de entradas fuera de distribucion en produccion: monitorizar la proporcion de rechazos permite detectar cambios en el dispositivo de captura o en el protocolo de adquisicion antes de que degraden el clasificador diagnostico.
- Pruebas de robustez y evaluacion de pipelines: sirve como componente de referencia para medir cuanto mejora la precision end-to-end de un sistema diagnostico al anadir una etapa de validacion de entrada.
- Prototipado de investigacion en cribado asistido: al ser ligero (94,4 MB, 23,5 M de parametros) se puede desplegar en entornos con recursos limitados para experimentacion academica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una seccion de evaluacion con marcadores `[TO CONFIRM]` para accuracy, sensibilidad, especificidad de la clase `cervix`, matriz de confusion y conjunto de test utilizado. El propio autor advierte que, si el split no se agrupo por codigo de caso, las copias aumentadas de un mismo original podrian aparecer en train y test, lo que sobreestimaria el rendimiento real.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para el modelo (23,5 M de parametros, ~94 MB de pesos); el consumo real depende del tamano de lote y de las activaciones intermedias.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; tarjetas como RTX 3060, RTX 4090, A100 o H100 funcionan sin problema, aunque el modelo esta sobredimensionado para ellas.
- Cabe holgadamente en GPU de consumo: GTX 1650, RTX 3050, RTX 4060 y superiores.
- Tambien funciona en CPU: al ser una ResNet-50, la inferencia por imagen en CPU es viable para volumenes moderados.
- Opciones de despliegue: PyTorch nativo (carga directa del state dict), TorchServe, ONNX Runtime tras exportacion, o integracion como modulo dentro de un servicio Python. No se publican pesos GGUF ni versiones para llama.cpp u Ollama, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de este modelo ni de alternativas directamente comparables en la informacion proporcionada. La comparacion se limita a caracteristicas estructurales.

| Modelo | Parametros | Tarea | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dawahealth/best_gatekeeper_v2 | 23,5 M | Clasificacion binaria colposcopia/no colposcopia | no aplica | AGPL-3.0 | Hugging Face |
| microsoft/resnet-50 (base) | 25,6 M | Clasificacion ImageNet (1.000 clases) | no aplica | Apache-2.0 | Hugging Face / torchvision |
| Clasificadores medicos de dominio especifico | no disponible | variable | no aplica | variable | no disponible |

El modelo base `microsoft/resnet-50` es la referencia natural: misma familia arquitectonica, licencia permisiva y proposito general, frente al ajuste fino binario y de dominio medico de Dawa Health con licencia copyleft.

## Limitaciones y advertencias

- No es un dispositivo medico: el autor indica explicitamente que es para investigacion y validacion interna, y que ningun clinico ha revisado sus decisiones contra un estandar de referencia.
- No detecta enfermedad: solo valida que la imagen sea una colposcopia; no emite juicio sobre la salud del cervix.
- Huecos en la clase negativa: el entrenamiento no incluye imagenes de laparoscopia, ecografia ni fotografias clinicas de vulva o vagina, que son precisamente las mas propensas a confundirse con colposcopia en la practica.
- Fuente unica para la clase positiva: todas las imagenes de cervix provienen de un unico conjunto de entrenamiento, sin documentacion sobre variedad de centros, dispositivos e iluminacion; puede rechazar colposcopias genuinas tomadas con equipos desconocidos.
- Copias aumentadas: la mayoria de las 5.543 imagenes de cervix son aumentos de un conjunto menor de originales, por lo que el numero de imagenes distintas reales es mucho menor.
- Riesgo de fuga train/test: si el split no se agrupo por codigo de caso, el rendimiento reportado (cuando se publique) sobreestimaria el real.
- Puntos sin confirmar en la model card: orden de los indices de clase, normalizacion ImageNet en entrenamiento, version del dataset usada en v2, tamanos del split y agrupacion por caso.
- Licencia AGPL-3.0: distribuir el modelo, una version modificada o un producto que lo incluya obliga a liberar el codigo fuente bajo la misma licencia; esto puede ser incompatible con productos propietarios.
- Sin capacidades de lenguaje: no aplica para tareas de texto, agentes o razonamiento.
- Riesgo de sesgo por composicion del dataset: la clase negativa esta dominada por imagenes gastrointestinales y dermatologicas, lo que puede sesgar los falsos rechazos hacia esos dominios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dawahealth/best_gatekeeper_v2
- Modelo base: https://huggingface.co/microsoft/resnet-50
- Dataset de entrenamiento (Kaggle): https://www.kaggle.com/datasets/kudzie7/medsig-gatekeeper
- No se han encontrado en la informacion proporcionada papers, blogs, repositorios adicionales ni demos del modelo.
