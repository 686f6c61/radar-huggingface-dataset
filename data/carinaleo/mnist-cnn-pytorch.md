# CarinaLeo/mnist-cnn-pytorch

## Resumen

MNIST Handwritten Digit Classifier (PyTorch CNN) es un modelo de clasificacion de imagenes desarrollado por CarinaLeo y publicado en HuggingFace. Se trata de una red neuronal convolucional pequena, construida en PyTorch, que reconoce digitos manuscritos del 0 al 9 sobre el dataset MNIST. Tal y como indica la propia model card, es un proyecto de aprendizaje de nivel principiante, por lo que su interes es principalmente educativo y de referencia, no de produccion.

El modelo resuelve el problema clasico de vision por computador de la clasificacion de digitos manuscritos, una tarea estandar que se utiliza habitualmente como primer contacto con el deep learning. A pesar de su sencillez, alcanza una precision en test del 99,14 %, un resultado solido para una arquitectura tan compacta. Su licencia MIT permite su uso, modificacion y redistribucion sin restricciones practicas, lo que lo hace util como plantilla o punto de partida para proyectos de ensenanza y experimentacion.

No es un modelo de lenguaje ni una arquitectura transformer: es una CNN clasica con dos bloques convolucionales y capas densas finales, con un peso total muy reducido (el repositorio ocupa practicamente nada, 0,0 GB segun HuggingFace). No hay datos publicados sobre longitud de contexto, cuantizacion ni idiomas, ya que no aplican a este tipo de modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN: 2 x (Conv2d + ReLU + MaxPool) -> Flatten -> Linear(3136, 128) -> ReLU -> Dropout(0.3) -> Linear(128, 10) |
| Parametros totales | no disponible (aprox. del orden de cientos de miles, derivado de la arquitectura: capa densa principal de 3136 x 128) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no aplicable (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplicable |
| Licencia | MIT |
| Formato de pesos | .pth (checkpoint de PyTorch, archivo mnist_cnn.pth) |

## Arquitectura y entrenamiento

El modelo es una red convolucional secuencial formada por dos bloques de Conv2d + ReLU + MaxPool, seguidos de un aplanado, una capa lineal de 3136 a 128 neuronas, otra ReLU, un Dropout del 30 % y una capa final lineal de 128 a 10 salidas (una por digito). La entrada es una imagen en escala de grises de 1 x 28 x 28 pixeles con digito blanco sobre fondo negro, normalizada con media 0,1307 y desviacion tipica 0,3081 (los valores estandar de MNIST).

El entrenamiento se realizo con el optimizador Adam a una tasa de aprendizaje de 0,001, funcion de perdida CrossEntropyLoss, durante 5 epocas con un tamano de batch de 64, sobre el dataset MNIST. No hay informacion sobre tecnicas avanzadas como aumento de datos, schedules de learning rate ni destilacion; se trata de un pipeline de entrenamiento estandar y minimo. No hay datos publicados sobre el numero exacto de pasos ni sobre hardware de entrenamiento.

## Capacidades

- Clasificacion de digitos manuscritos (0-9) en imagenes en escala de grises de 28 x 28 pixeles.
- Precision en test del 99,14 % sobre MNIST, metrica reportada por el propio autor.
- Carga sencilla mediante huggingface_hub (hf_hub_download) y state_dict de PyTorch.
- Inferencia en CPU viable dado el tamano minimo del modelo.
- No soporta texto, no tiene capacidades de lenguaje, ni tool calling, ni agentes, ni modalidades adicionales (audio, video, documentos).

## Casos de uso

- Aprendizaje de deep learning: sirve como ejemplo completo y funcional de una CNN en PyTorch, ideal para quien empieza y quiere ver un pipeline de entrenamiento, guardado y carga de pesos de principio a fin.
- Plantilla para tutoriales y docencia: la model card incluye codigo de uso directo, por lo que puede integrarse en clases, talleres o material didactico sobre clasificacion de imagenes.
- Prueba de integracion con HuggingFace Hub: al ser un modelo minimo, es util para verificar pipelines de descarga de pesos con hf_hub_download en entornos de CI o pruebas de infraestructura.
- Baseline para experimentos: se puede usar como punto de partida para comparar arquitecturas, tecnicas de regularizacion (el Dropout 0.3 ya incluido) o metodos de cuantizacion sobre MNIST.
- Prototipado de OCR simple: en aplicaciones donde solo se necesite reconocer un digito aislado en imagen de 28 x 28 (por ejemplo, lectura de un digito de un formulario digitalizado previamente recortado y preprocesado), puede servir como componente ligero.
- Demostraciones y demos interactivos: su peso minimo permite desplegarlo en interfaces como Gradio o Streamlit sin requisitos de GPU, adecuado para demos en navegador o dispositivos con recursos limitados.

## Benchmarks y rendimiento

El unico dato publicado por el autor es la precision en el conjunto de test de MNIST:

| Metrica | Valor |
|---|---|
| Accuracy en test (MNIST) | 99,14 % |

No se han publicado comparaciones con otros modelos ni resultados en benchmarks estandar adicionales (MMLU, HumanEval, GSM8K, etc.), que de todos modos no aplican a un clasificador de imagenes de digitos. Como referencia contextual, las CNN convencionales sobre MNIST suelen situarse entre el 99 % y el 99,7 % de precision en test, por lo que el 99,14 % esta dentro del rango esperable para una arquitectura de este tamano.

## Requisitos de hardware

- VRAM estimada para inferencia: practicamente nula; el modelo ocupa menos de 1 MB de pesos (derivado de la arquitectura), por lo que funciona sin GPU y con memoria de CPU minima.
- GPU recomendadas: no se requiere ninguna GPU; cualquier CPU moderna es suficiente para inferencia. Para reentrenamiento, cualquier GPU de consumo (incluso integradas o una GTX/RTX basica) sobra.
- Cabe en cualquier GPU de consumo, incluidas las mas modestas, con amplio margen.
- Opciones de despliegue: PyTorch puro (torch.load + model.eval()), integracion con huggingface_hub para descarga de pesos, y envoltorios ligeros como Gradio, Streamlit o FastAPI. No requiere vLLM, llama.cpp, Ollama ni TGI, que son herramientas para modelos de lenguaje.
- Latencia y throughput estimados: no disponibles; dada la arquitectura, la inferencia por imagen es del orden de milisegundos en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Precision MNIST (tipica) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CarinaLeo/mnist-cnn-pytorch | CNN 2 bloques conv + 2 densas | no disponible (centenares de miles aprox.) | 99,14 % (reportada) | MIT | HuggingFace, pesos .pth |
| LeNet-5 (referencia clasica) | CNN 2 conv + 2 densas | ~61.000 | ~99,05 % | Varias implementaciones open source | Multiples repos |
| Modelos MNIST en HuggingFace (genéricos, p. ej. CNNs comunitarias) | CNN / MLP variables | Variables | ~98-99,7 % | Variables | HuggingFace |

Nota: la comparativa es orientativa; los valores de precision de LeNet-5 y de modelos genéricos son rangos tipicos de la literatura y no mediciones del propio autor.

## Limitaciones y advertencias

- Alcance muy limitado: solo clasifica digitos manuscritos en imagenes de 28 x 28 en escala de grises, con digito blanco sobre fondo negro. Cualquier desviacion del formato de entrada (fondo blanco, imagenes a color, digitos compuestos, otros glifos) degradara el rendimiento o producira resultados invalidos.
- Es un proyecto de aprendizaje: no ha pasado por validacion rigurosa ni pruebas de robustez (ruido, rotaciones, variaciones de trazo). No debe usarse en produccion para tareas criticas sin evaluacion propia.
- Sin datos de sesgo ni de alucinacion aplicables: al ser un clasificador de 10 clases cerradas, el fallo tipico es la clasificacion erronea, no la alucinacion, pero no hay informacion sobre su matriz de confusion ni sobre clases con mayor tasa de error.
- La precision del 99,14 % es la reportada por la autora; no existe verificacion independiente publicada en la model card.
- Licencia MIT: sin restricciones para uso comercial, pero el modelo se ofrece tal cual, sin garantias.
- Repositorio con cero descargas registradas y tamano de repo 0,0 GB segun HuggingFace: conviene verificar que los pesos estan disponibles y completos antes de depender de ellos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CarinaLeo/mnist-cnn-pytorch
- Dataset MNIST: https://huggingface.co/datasets/mnist
- Paper, blog, repositorio de codigo o demo: no disponibles en la informacion proporcionada.
