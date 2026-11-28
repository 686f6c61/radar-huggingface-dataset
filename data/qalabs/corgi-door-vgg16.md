# qalabs/corgi-door-vgg16

## Resumen

Corgi Door VGG16 es un clasificador binario de imagenes construido sobre VGG16 y ajustado para reconocer a Penny, una perra corgi concreta. Lo publica el usuario qalabs como material de soporte para el laboratorio practico `05b_corgi_door.ipynb` del curso Fundamentals of Deep Learning de NVIDIA DLI, de modo que los alumnos puedan saltarse el ajuste fino en entornos sin GPU. No es un modelo de lenguaje ni un modelo fundacional: es un `state_dict` de PyTorch que encapsula una cabeza de clasificacion de una sola salida sobre un backbone VGG16 preentrenado en ImageNet.

El modelo resuelve un problema muy acotado: dada una imagen, emitir un escalar cuya interpretacion es que un valor negativo indica la presencia de Penny (la clase positiva) y un valor no negativo indica lo contrario. La relevancia es, por tanto, exclusivamente docente y demostrativa del flujo de transfer learning: congelar el backbone, entrenar una capa lineal nueva y despues hacer un ajuste fino global con learning rate bajo.

Arquitectura convolucional clasica (VGG16, 2014), sin atencion ni componentes generativos. El repositorio ocupa 0,3 GB, los pesos se distribuyen en un fichero `.pt` y la licencia declarada es CC BY 4.0. No hay informacion sobre idiomas porque la tarea no es linguistica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN VGG16 (13 capas convolucionales + 3 capas fully connected) con cabeza lineal adicional `Linear(1000, 1)` |
| Parametros totales | no disponible en la informacion proporcionada (VGG16 ronda los 138 M, dato no confirmado en la model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | pesos convertidos a media precision (half precision / FP16) segun la model card; no se documentan otras cuantizaciones |
| Idiomas soportados | no aplica / no disponible |
| Licencia | CC BY 4.0 |
| Formato de pesos | PyTorch `state_dict` en fichero `corgi_finetuned.pt` |

## Arquitectura y entrenamiento

VGG16 es una red convolucional profunda compuesta por bloques de convoluciones 3x3 con activaciones ReLU y max pooling, seguida de tres capas totalmente conectadas de 4096, 4096 y 1000 unidades. El modelo publicado anade una capa `Linear(1000, 1)` al final, de modo que la salida es un unico escalar. La implementacion concreta se construye con `nn.Sequential(vgg16(), nn.Linear(1000, 1))` usando los pesos de torchvision.

El entrenamiento se realizo en tres fases: (1) partida desde `VGG16_Weights.IMAGENET1K_V1` de torchvision; (2) entrenamiento de la nueva capa `Linear(1000, 1)` durante 10 epocas con VGG16 congelado, optimizador Adam con learning rate por defecto; (3) ajuste fino de toda la red durante 2 epocas con Adam y learning rate 1e-6. Se uso el dataset Penny the Corgi con split 80/20 entrenamiento/validacion y el data augmentation del curso. La precision de validacion final reportada es 0,82. No se documenta el numero de imagenes del dataset ni el numero de tokens (no aplica). Los pesos se convirtieron posteriormente a media precision.

## Capacidades

- Clasificacion binaria de imagenes: distingue imagenes que contienen a Penny la corgi frente a las que no.
- Inferencia sobre imagenes RGB de tamano estandar de ImageNet (el pipeline de torchvision aplica el preprocesado correspondiente a `VGG16_Weights.IMAGENET1K_V1`).
- Salida escalar interpretable por signo: valores negativos indican la clase positiva (Penny), valores no negativos la clase negativa.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues ni de generacion de texto.
- No dispone de modo thinking, vision general, audio ni ninguna capacidad multimodal mas alla de la clasificacion de imagen.
- Uso previsto como material didactico reproducible en CPU.

## Casos de uso

- Laboratorio docente de transfer learning: permite a los alumnos ejecutar la inferencia de `05b_corgi_door.ipynb` sin necesidad de GPU ni de repetir el ajuste fino, comparando sus propios resultados con una referencia estable.
- Demostracion de congelacion y descongelacion de capas: el modelo sirve como punto de partida para explicar por que se entrena primero la cabeza y despues se ajusta toda la red con un learning rate bajo.
- Prueba de pipelines de preprocesado de imagen: al estar basado en el preprocesado estandar de torchvision para VGG16, se puede usar para validar que un pipeline de carga, redimensionado y normalizacion funciona correctamente antes de escalar a otros modelos.
- Ejemplo minimo de clasificador binario en produccion interna: si se necesitara un detector especifico de una sola clase (por ejemplo, presencia de un objeto concreto en un catalogo controlado), este modelo ilustra el patron completo de entrenamiento y empaquetado en un `state_dict`.
- Benchmark de latencia en CPU: al ser un VGG16 en FP16, sirve para medir el coste de inferencia de una CNN clasica en hardware sin acelerador y comparar con arquitecturas mas modernas.
- Material de ensenanza sobre licencias y atribucion: la model card documenta explicitamente la cadena de atribuciones (VGG16, dataset de Kaggle, codigo de NVIDIA), lo que lo convierte en un caso practico para explicar el cumplimiento de licencias CC BY 4.0 en modelos derivados.

## Benchmarks y rendimiento

La unica metrica reportada en la informacion disponible es la precision de validacion final: 0,82 sobre el split de validacion del dataset Penny the Corgi. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de benchmarks de vision como ImageNet top-1/top-5 en la informacion disponible. No se dispone de comparaciones con otros modelos en la model card.

| Metrica | Valor |
|---|---|
| Precision de validacion (Penny the Corgi, split 80/20) | 0,82 |
| ImageNet top-1 | no disponible |
| ImageNet top-5 | no disponible |
| Otros benchmarks | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; al tratarse de un VGG16 en FP16, la huella de pesos ronda el orden de centenares de MB, pero no se confirma en la informacion proporcionada.
- GPU recomendadas: no se especifican; el modelo esta pensado para ejecutarse en CPU en el contexto del curso.
- Cabe en GPU consumer: si, cualquier GPU consumer moderna puede alojar una VGG16 en FP16; no se detalla el modelo concreto.
- Opciones de despliegue: PyTorch nativo con `torch.load` y `load_state_dict`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplica a un modelo de vision de este tipo).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de modelos comparables en la informacion proporcionada. Como referencia estructural, se puede situar frente a otras CNN de clasificacion de la misma familia, aunque sin cifras confirmadas:

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|
| qalabs/corgi-door-vgg16 | no disponible (VGG16, ~138 M segun arquitectura original, no confirmado) | no aplica | precision validacion 0,82 en Penny the Corgi | CC BY 4.0 | Hugging Face |
| VGG16 preentrenado en ImageNet (torchvision) | no disponible | no aplica | no disponible | BSD-3-Clause (torchvision) | torchvision |
| Otros clasificadores binarios derivados de VGG16 | no disponible | no aplica | no disponible | variable | variable |

## Limitaciones y advertencias

- Modelo altamente especializado: solo distingue a Penny la corgi; no es un clasificador de perros ni de corgis en general, y su uso fuera de ese dominio carece de garantias.
- Precision de validacion de 0,82: implica un 18 % de error sobre el split de validacion, insuficiente para aplicaciones criticas.
- Riesgo de sobreajuste al dataset de origen: el dataset es pequeno y especifico, y el ajuste fino global se realizo solo durante 2 epocas, por lo que la generalizacion a condiciones de iluminacion, angulo o fondo distintas no esta documentada.
- Sesgos conocidos: no documentados en la model card; al derivar de un VGG16 entrenado en ImageNet, puede heredar sesgos de ese corpus, aunque no se detallan.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero la salida escalar puede ser erronea con alta confianza en imagenes fuera de distribucion.
- Limitaciones de contexto o idioma: no aplica (modelo de vision).
- Restricciones de licencia: CC BY 4.0 permite uso comercial con atribucion; es obligatorio mantener la atribucion a VGG16 (Simonyan y Zisserman), al dataset de Danielle Detering y al codigo de NVIDIA, tal como detalla la model card.
- Caveat para produccion: el modelo se publica como material didactico, no como componente listo para produccion; no hay garantias de mantenimiento, versionado ni soporte.
- El fichero es un `state_dict`, no un modelo completo: requiere reconstruir la arquitectura exacta (`nn.Sequential(vgg16(), nn.Linear(1000, 1))`) antes de cargar los pesos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/qalabs/corgi-door-vgg16
- Paper de VGG16: https://arxiv.org/abs/1409.1556
- Curso Fundamentals of Deep Learning (NVIDIA DLI): https://github.com/NVDLI/fundamentals-of-deep-learning
- Dataset Penny the Corgi en Kaggle: https://www.kaggle.com/datasets/danielledetering/penny-the-corgi
- torchvision: https://github.com/pytorch/vision
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
- Licencia Apache 2.0 (codigo de NVIDIA): https://www.apache.org/licenses/LICENSE-2.0
