# EMERA2/mnist-cnn-pytorch

## Resumen

Este modelo es una red neuronal convolucional (CNN) pequeña escrita en PyTorch que clasifica dígitos manuscritos del 0 al 9 sobre el conjunto de datos MNIST. Fue desarrollada por el usuario EMERA2 como proyecto de aprendizaje, y está publicada en HuggingFace bajo licencia MIT, lo que permite su uso, modificación y redistribución sin restricciones.

Aunque no compite con los grandes modelos fundacionales, resulta relevante como ejemplo didáctico y como punto de partida para pipelines de visión por computador ligeros: alcanza una precisión del 99,30 % en el conjunto de test de MNIST con una arquitectura de apenas dos bloques convolucionales y dos capas lineales. Su tamaño reducido permite ejecutarlo en CPU sin problemas, por lo que es adecuado para demos, docencia y prototipado rápido de OCR de dígitos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN: 2 x (Conv2d + ReLU + MaxPool) -> Flatten -> Linear(3136, 128) -> ReLU -> Dropout(0.3) -> Linear(128, 10) |
| Parametros totales | no disponible (orden de magnitud: ~0,4 M estimado a partir de las dimensiones de las capas) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no aplicable (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplicable (clasificacion de imagenes de digitos) |
| Licencia | MIT |
| Formato de pesos | .pth (checkpoint de PyTorch) |

## Arquitectura y entrenamiento

La red es una CNN clasica de tipo LeNet-like: dos bloques consecutivos de convolucion 2D con activacion ReLU y max-pooling, seguidos de un aplanado (el tensor resultante tiene 3136 caracteristicas), una capa densa de 128 neuronas con ReLU y dropout del 30 % como regularizacion, y una capa de salida de 10 neuronas (una por digito). La entrada es una imagen en escala de grises de 1 x 28 x 28, con digito blanco sobre fondo negro, normalizada con media 0,1307 y desviacion tipica 0,3081 (los valores estandar de MNIST).

El entrenamiento utilizo el optimizador Adam con learning rate 0,001 y CrossEntropyLoss como funcion de perdida, durante 5 epocas con batch size 64. El dataset empleado es MNIST (60.000 imagenes de entrenamiento y 10.000 de test). No se ha documentado el uso de tecnicas como aumento de datos, planificacion de learning rate ni cuantizacion posterior al entrenamiento.

## Capacidades

- Clasificacion de imagenes en escala de grises de 28 x 28 pixeles en 10 clases (digitos 0-9).
- Precision del 99,30 % en el conjunto de test de MNIST.
- Inferencia en CPU viable gracias a su tamano minimo.
- Carga sencilla mediante `huggingface_hub` con `hf_hub_download`.
- No soporta tool calling, agentes, ni procesamiento de texto, audio o lenguaje: es un clasificador de imagenes puro.
- No es un modelo multilingue ni multimodal.

## Casos de uso

- Docencia y aprendizaje de deep learning: la arquitectura es lo bastante simple para explicarse completa en una clase, y el README incluye el codigo de carga, por lo que sirve como ejercicio guiado de CNNs en PyTorch.
- Prototipado de OCR de digitos: puede integrarse como componente de reconocimiento de numeros en formularios escaneados, matriculas simplificadas o lecturas de contadores, siempre que las imagenes se normalicen a 28 x 28 en escala de grises.
- Procesamiento de cheques y documentos: reconocimiento del campo de importes o numeros de referencia tras un preprocesado de segmentacion y redimensionado de digitos individuales.
- Demos y aplicaciones web ligeras: al ejecutarse en CPU sin GPU, puede desplegarse en servicios baratos o incluso en dispositivos edge para reconocer digitos escritos por el usuario en tiempo real.
- Baseline para experimentos: punto de referencia rapido para comparar tecnicas de aumento de datos, cuantizacion, destilacion o ataque adversarial sobre un modelo pequeno y bien entendido.
- Validacion de pipelines MLOps: modelo ideal para probar pipelines de despliegue (ONNX, TorchScript, contenedores) antes de usar modelos de produccion mas grandes.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Precision en test (MNIST) | 99,30 % |

No se han publicado otros resultados de benchmarks en la informacion disponible (ni comparaciones con otros clasificadores de MNIST, ni tiempos de inferencia).

## Requisitos de hardware

- VRAM estimada para inferencia: practicamente nula; con ~0,4 M de parametros en float32 ocupa menos de 2 MB de memoria. Cualquier GPU sirve, pero no es necesaria.
- GPU recomendadas: ninguna en particular; la inferencia en CPU es plenamente viable y probablemente mas rapida que la transferencia a GPU para batches pequenos.
- Cabe sobradamente en cualquier GPU de consumo (desde integradas hasta RTX 4090) y en microcontroladores con esfuerzo minimo si se cuantiza.
- Despliegue: PyTorch puro (carga con `torch.load` y `load_state_dict`); compatible con TorchScript u ONNX para exportar, aunque no se ha publicado ninguna version exportada. No requiere vLLM, llama.cpp ni TGI al no ser un modelo de lenguaje.
- Latencia: no disponible; por el tamano del modelo se espera inferencia de milisegundos por imagen en CPU moderna.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Precision MNIST | Licencia |
|---|---|---|---|---|
| EMERA2/mnist-cnn-pytorch | CNN 2 conv + 2 densas | ~0,4 M (estimado) | 99,30 % | MIT |
| CNN LeNet-5 (referencia clasica) | 2 conv + 2 densas | ~0,06 M | ~99,05 % | no disponible |
| MLP simple sobre MNIST (referencia tipica) | Perceptron multicapa | ~0,1-0,3 M | ~97-98 % | no disponible |

Se trata de una categoria de modelos muy madura: casi cualquier CNN basica supera el 99 % en MNIST, por lo que las diferencias practicas entre alternativas son minimas y el criterio de eleccion suele ser la licencia, el formato de pesos y la claridad del codigo.

## Limitaciones y advertencias

- Dominio muy estrecho: solo reconoce digitos manuscritos en imagenes de 28 x 28 en escala de grises, con digito blanco sobre fondo negro. Imagenes con fondo blanco y digito negro, otras resoluciones o caracteres distintos (letras, simbolos) fallaran sin preprocesado adecuado.
- La normalizacion (media 0,1307, std 0,3081) debe replicarse exactamente en produccion; omitirla degrada la precision.
- No hay informacion sobre robustez frente a variaciones de trazo, rotaciones, ruido o ejemplos adversariales; MNIST es un dataset facil y el 99,30 % no garantiza buen rendimiento fuera de distribucion.
- Sesgos: MNIST esta compuesto por digitos escritos por personal del censo de EE. UU. y estudiantes de secundaria, por lo que el rendimiento puede variar con estilos de escritura de otras procedencias.
- Al ser un checkpoint `.pth` sin version de seguridad de PyTorch documentada, conviene cargarlo con `map_location` y de fuentes confiables (los archivos `.pth` pueden ejecutar codigo arbitrario al cargarse con `torch.load` estandar).
- La licencia MIT no impone restricciones para uso comercial.
- El repositorio tiene 0 descargas registradas y el modelo no ha sido auditado por terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/EMERA2/mnist-cnn-pytorch
- Dataset MNIST: https://huggingface.co/datasets/mnist
- Paper del dataset MNIST (LeCun et al.): http://yann.lecun.com/exdb/mnist/
- No se han encontrado otros enlaces relevantes (blog, demo o repositorio externo) en la informacion disponible.
