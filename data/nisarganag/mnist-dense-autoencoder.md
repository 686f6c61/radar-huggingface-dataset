# nisarganag/mnist-dense-autoencoder

## Resumen

`nisarganag/mnist-dense-autoencoder` es un autoencoder denso (fully connected) implementado en PyTorch que reconstruye imagenes de digitos manuscritos de 28 x 28 pixeles en escala de grises procedentes del conjunto MNIST. Lo desarrolla el usuario de Hugging Face `nisarganag` como experimento educativo de un trabajo academico (term paper), no como un modelo de proposito general ni como un sistema listo para produccion.

El modelo no es un LLM ni un modelo multimodal: es una red neuronal de reconstruccion de imagenes con arquitectura simetrica 784 -> 128 -> 64 -> 128 -> 784, donde la capa central de 64 unidades actua como cuello de botella (bottleneck) latente. Cuenta con 218.192 parametros totales en la configuracion exportada y se entrena minimizando el error cuadratico medio (MSE) de reconstruccion, sin utilizar las etiquetas de los digitos como objetivo.

Su relevancia es exclusivamente didactica: sirve como ejemplo minimo y reproducible de autoencoder, con semillas fijas, configuracion de entrenamiento documentada y pesos en formato safetensors. No dispone de benchmarks de clasificacion, no soporta texto ni codigo y no debe evaluarse como un modelo de IA generativa moderna.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Autoencoder denso (fully connected), 784 -> 128 -> 64 -> 128 -> 784 |
| Parametros totales | 218.192 (bottleneck de 64) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen, entrada fija de 28 x 28) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF ni cuantizadas) |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors (`model.safetensors`) y definicion en `model.py` |
| Entrada | tensor float en [0, 1] con forma [batch, 1, 28, 28] |
| Salida | tensor reconstruido con la misma forma [batch, 1, 28, 28] |
| Funciones de activacion | ReLU en capas ocultas, sigmoid en la salida |
| Objetivo de entrenamiento | MSE de reconstruccion |
| Dataset | MNIST via `torchvision.datasets.MNIST` (50.000 train, 10.000 validacion, 10.000 test) |
| Optimizador | Adam, lr 0.001, batch size 128, 10 epocas, semilla 42 |
| Pipeline declarado | image-to-image |
| Tamano del repo | 0.0 GB (pesos muy pequenos) |

## Arquitectura y entrenamiento

La red es un autoencoder denso simetrico con dos capas de codificacion (784 -> 128 -> 64) y dos de decodificacion (64 -> 128 -> 784). Las capas ocultas usan ReLU y la capa de salida usa sigmoid para mantener las activaciones en el rango [0, 1], coherente con la normalizacion de la entrada. El cuello de botella exportado es de 64 dimensiones, seleccionado junto con el checkpoint por MSE de validacion unicamente; no se emplean etiquetas de digitos en el entrenamiento.

El entrenamiento se realizo sobre MNIST con 50.000 imagenes de entrenamiento, 10.000 de validacion y 10.000 de test, durante 10 epocas con Adam (lr 0.001), batch size 128 y semilla 42. El autor documenta ademas variantes con cuello de botella de 16 y 32 dimensiones (205.856 y 209.968 parametros respectivamente), todas entrenadas hasta la epoca 10. No se documenta uso de RLHF, DPO ni tecnicas de decodificacion especulativa; es un entrenamiento supervisado por reconstruccion puro.

## Capacidades

- Reconstruccion de imagenes de digitos manuscritos de 28 x 28 en escala de grises (MNIST).
- Compresion en un espacio latente de 64 dimensiones y decodificacion posterior a la imagen original.
- Generacion de reconstrucciones aproximadas a partir de tensores normalizados en [0, 1].
- No soporta generacion de texto, razonamiento, codigo ni matematicas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues (no procesa lenguaje).
- No dispone de modo thinking, vision general, audio ni otras capacidades especiales.
- No es un modelo generativo de nuevas imagenes: reconstruye entradas, no muestrea desde el espacio latente de forma documentada.

## Casos de uso

- Docencia de autoencoders: el modelo sirve como ejemplo minimo y reproducible (semilla 42, configuracion documentada) para explicar codificacion, cuello de botella y decodificacion en un curso de deep learning.
- Practica de carga de modelos en PyTorch: el repositorio incluye `model.py`, `config.json` y `model.safetensors`, lo que permite ejercitar el flujo de `snapshot_download` y carga de pesos con `safetensors`.
- Estudio de compresion latente: permite comparar cuellos de botella de 16, 32 y 64 dimensiones y analizar el compromiso entre numero de parametros y MSE de reconstruccion.
- Analisis de curvas de aprendizaje: los historiales en `history.csv` y las figuras permiten estudiar convergencia y sobreajuste en un caso controlado.
- Evaluacion de metricas de reconstruccion: util para practicar el calculo e interpretacion del MSE frente a una linea base (imagen media de entrenamiento, MSE de test 0.067471).
- Reproduccion de experimentos: con semilla fija y versiones de librerias registradas en `requirements.txt`, sirve para verificar la reproducibilidad de un pipeline de entrenamiento pequeno.
- Base para extensiones didacticas: punto de partida para experimentar con autoencoders variacionales o convolucionales sobre el mismo dataset.

## Benchmarks y rendimiento

Los unicos datos publicados son MSE de reconstruccion sobre MNIST, no metricas de clasificacion.

| Cuello de botella | Parametros | Mejor epoca | MSE validacion | MSE test |
|---:|---:|---:|---:|---:|
| 16 | 205.856 | 10 | 0.021842 | 0.021227 |
| 32 | 209.968 | 10 | 0.012321 | 0.011796 |
| 64 | 218.192 | 10 | 0.009074 | 0.008633 |

Linea base de referencia: imagen media de entrenamiento, MSE de test 0.067471. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de clasificacion de digitos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; los pesos ocupan unos pocos cientos de kilobytes (218.192 parametros en float32 equivalen a aproximadamente 0,87 MB).
- GPU recomendadas: cualquier GPU con CUDA, incluidas GTX 1050, RTX 2060, RTX 3060, RTX 4090, A100 o H100; el modelo es tan pequeno que la GPU no es limitante.
- Cabe en cualquier GPU de consumo e incluso en CPU sin problema.
- Opciones de despliegue: PyTorch nativo con `model.py` y `safetensors`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo, la inferencia por lote deberia ser del orden de microsegundos a milisegundos en GPU moderna, aunque no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `nisarganag/mnist-dense-autoencoder` | 218.192 | 28 x 28 x 1 | Reconstruccion MNIST | no disponible | Hugging Face (repo publico, 0 descargas) |
| Autoencoder convolucional MNIST tipico | variable (decenas de miles a millones) | 28 x 28 x 1 | Reconstruccion MNIST | variable segun autor | Multiples repositorios publicos |
| Autoencoder variacional (VAE) MNIST | variable | 28 x 28 x 1 | Reconstruccion y muestreo latente | variable segun autor | Multiples repositorios publicos |

No se dispone de comparativas con benchmarks homogeneos en la informacion proporcionada; la comparacion anterior es cualitativa y basada en la categoria de modelo, no en mediciones verificadas.

## Limitaciones y advertencias

- Modelo educativo de un unico entrenamiento con semilla fija; no esta pensado para uso en produccion.
- Solo evaluado en imagenes tipo MNIST; no es un modelo de restauracion de imagenes general.
- El MSE de reconstruccion no equivale a precision de clasificacion; no debe interpretarse como rendimiento en reconocimiento de digitos.
- El tamano del cuello de botella cambia el numero de parametros, por lo que las comparativas entre variantes no aislan unicamente el efecto de la dimension latente.
- Un vector latente mas pequeno no establece por si mismo una tasa practica de compresion de ficheros.
- No se documentan sesgos, pero al entrenarse solo con MNIST hereda las limitaciones y el estilo de ese dataset (digitos manuscritos estadounidenses, bajo contraste, 28 x 28).
- Licencia no disponible: no se puede confirmar el uso comercial; debe consultarse al autor antes de cualquier uso fuera de ambito educativo.
- Riesgo de sobreajuste al dataset y de reconstrucciones borrosas en ejemplos dificiles (el autor incluye una figura de ejemplos dificiles).
- No hay demo alojada; el uso requiere descargar pesos y ejecutar codigo PyTorch propio.
- El repositorio tiene 0 descargas y 0 likes, sin validacion externa de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nisarganag/mnist-dense-autoencoder
- MNIST en torchvision: https://docs.pytorch.org/vision/stable/generated/torchvision.datasets.MNIST.html
- Introduccion a autoencoders (TensorFlow): https://www.tensorflow.org/tutorials/generative/autoencoder
- Guia de subida de ficheros a Hugging Face Hub: https://huggingface.co/docs/huggingface_hub/guides/upload
