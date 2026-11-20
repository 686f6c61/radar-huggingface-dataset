# ghimiredhikura/MSVFP

## Resumen

MSVFP (Magnitude and Similarity Based Variable Rate Filter Pruning) es una coleccion de checkpoints de PyTorch publicados por Deepak Ghimire y Seong-Heum Kim que acompanan al articulo "Magnitude and Similarity Based Variable Rate Filter Pruning for Efficient Convolution Neural Networks", publicado en Applied Sciences (MDPI) en 2023. No es un modelo de lenguaje ni un modelo fundacional: es un conjunto de pesos de clasificadores de imagen convolucionales (VGG16 y ResNet18/34/50) en version densa y con poda estructurada de filtros aplicada a distintos objetivos de reduccion de FLOPs.

El repositorio sirve como material de reproducibilidad del paper: permite descargar tanto el checkpoint original (denso) como las variantes podadas y evaluar la perdida de precision introducida por la poda. Los checkpoints cubren dos tareas: clasificacion sobre CIFAR-10 con VGG16 (una de las tres ejecuciones del estudio) y clasificacion sobre ImageNet con las tres variantes de ResNet.

Es relevante para investigadores en compresion de modelos y despliegue eficiente en edge, no para usuarios que busquen un modelo generativo. El tamano del repositorio es de 0,6 GB y no se declara licencia explicita para los ficheros de pesos, lo que condiciona su reutilizacion comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN: VGG16 (CIFAR-10) y ResNet18/34/50 (ImageNet) |
| Parametros totales | no disponible (depende de la arquitectura y del checkpoint; VGG16 ~138M, ResNet18 ~11,7M, ResNet34 ~21,8M, ResNet50 ~25,6M en sus variantes densas estandar) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada de imagen fija) |
| Tipos de cuantizacion | no disponible (los checkpoints se distribuyen en serializacion PyTorch original, sin variantes cuantizadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible (el autor indica que el repositorio fuente no proporciona licencia explicita para los checkpoints) |
| Formato de pesos | `.pth.tar` (serializacion PyTorch) |

## Arquitectura y entrenamiento

Los checkpoints corresponden a redes convolucionales clasicas: VGG16 para CIFAR-10 y ResNet18, ResNet34 y ResNet50 para ImageNet. La innovacion del trabajo no reside en la arquitectura base, sino en el procedimiento de poda estructurada de filtros: se combina un criterio de magnitud con un criterio de similitud entre filtros para decidir que canales eliminar, y se aplica una tasa de poda variable por capa en lugar de una tasa uniforme. El resultado son variantes con objetivos de reduccion de FLOPs etiquetados explicitamente (34,2 % en VGG16; 41 % y 45 % en ResNet18 y ResNet34; 42 % y 53 % en ResNet50).

No se dispone en la informacion proporcionada de detalles sobre el numero de tokens o imagenes de entrenamiento, la composicion exacta del dataset, ni sobre el uso de tecnicas de ajuste fino posteriores a la poda (fine-tuning, destilacion, RLHF/DPO). Tampoco se documentan innovaciones adicionales como decodificacion especulativa o atencion lineal, que no aplican a este tipo de modelo. El repositorio incluye un fichero `source-checkpoints.json` que registra las rutas Git originales y los blob IDs de los checkpoints, lo que facilita la trazabilidad respecto al repositorio de codigo del paper.

## Capacidades

- Clasificacion de imagenes supervisada: VGG16 sobre CIFAR-10 (10 clases) y ResNet18/34/50 sobre ImageNet (1000 clases).
- Evaluacion de compresion: permite comparar la precision del checkpoint denso frente a la variante podada con un objetivo de FLOPs concreto.
- Poda estructurada de filtros: los checkpoints podados conservan la topologia de la red original con canales eliminados, de modo que pueden cargarse y evaluarse con el codigo del proyecto.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, ni capacidades multilingues.
- No dispone de modo thinking, vision generativa, audio ni ninguna capacidad generativa.
- No se documentan capacidades adicionales mas alla de la clasificacion de imagen.

## Casos de uso

- Reproduccion de resultados academicos: cargar los checkpoints densos y podados con el codigo del repositorio GitHub y verificar las cifras de precision y FLOPs reportadas en el paper, usando `--pretrain_path` y `--pruned_path` como indica la model card.
- Investigacion en compresion de modelos: usar las variantes podadas como linea base para comparar nuevas tecnicas de poda estructurada sobre VGG16 y ResNet en CIFAR-10 e ImageNet.
- Despliegue en dispositivos con recursos limitados: las variantes con 41-53 % de reduccion de FLOPs son candidatas para inferencia en CPU o GPU de baja potencia, siempre que la perdida de precision medida sea aceptable para la tarea concreta.
- Ensenanza de poda de redes: el par denso/podado por arquitectura permite ilustrar el compromiso entre precision y coste computacional en un curso de vision por computador.
- Prototipado rapido de clasificadores: el checkpoint denso de ResNet18 sobre ImageNet sirve como extractor de caracteristicas o base para fine-tuning en tareas de clasificacion de imagen.
- Auditoria de tecnicas de poda variable por capa: analizar como se distribuyen las tasas de poda entre capas comparando los checkpoints con objetivos del 41 % y 45 % en la misma arquitectura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card referencia el articulo y el repositorio de codigo para las cifras de precision y FLOPs, pero no incluye tablas numericas en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Como referencia de orden de magnitud, un VGG16 denso en FP32 ocupa aproximadamente 0,5 GB de pesos y un ResNet50 en FP32 aproximadamente 0,1 GB; las variantes podadas reducen estos valores en proporcion a los filtros eliminados.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM es suficiente para inferencia en FP32 de estas arquitecturas; para entrenamiento o fine-tuning se recomienda al menos una RTX 3090/4090 o una A100/H100 en funcion del tamano de lote.
- Cabe en GPU de consumo: si, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares, incluso en configuraciones modestas de memoria.
- Opciones de despliegue: el repositorio usa PyTorch nativo; los checkpoints `.pth.tar` pueden convertirse a TorchScript o ONNX para servir con TorchServe, ONNX Runtime o TensorRT. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros (denso) | Contexto / entrada | Precision | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MSVFP VGG16 (CIFAR-10) | ~138M | imagen 32x32 (CIFAR-10) | no disponible en la informacion | no disponible | Hugging Face, `.pth.tar` |
| MSVFP ResNet18 (ImageNet) | ~11,7M | imagen 224x224 (ImageNet) | no disponible en la informacion | no disponible | Hugging Face, `.pth.tar` |
| MSVFP ResNet50 (ImageNet) | ~25,6M | imagen 224x224 (ImageNet) | no disponible en la informacion | no disponible | Hugging Face, `.pth.tar` |
| torchvision ResNet50 preentrenado | ~25,6M | imagen 224x224 | pesos oficiales disponibles en torchvision | BSD-3-Clause | torchvision, ampliamente adoptado |
| torchvision VGG16 preentrenado | ~138M | imagen 224x224 | pesos oficiales disponibles en torchvision | BSD-3-Clause | torchvision, ampliamente adoptado |

La comparativa se limita a arquitecturas equivalentes porque no se dispone de datos de rendimiento de MSVFP en la informacion proporcionada. La diferencia practica frente a torchvision es que MSVFP aporta variantes podadas con objetivos de FLOPs documentados, mientras que torchvision solo ofrece los pesos densos.

## Limitaciones y advertencias

- Ausencia de licencia explicita: el autor indica que el repositorio fuente no proporciona licencia para los checkpoints y pide contactar para condiciones de reutilizacion o redistribucion. Esto bloquea de facto el uso comercial sin autorizacion.
- Sin datos de precision en la model card: no se puede evaluar la degradacion introducida por la poda sin ejecutar la evaluacion del repositorio de codigo.
- Ambito muy restringido: solo clasificacion de imagen en CIFAR-10 e ImageNet; no sirve para generacion de texto, codigo, vision generativa ni tareas multimodales.
- Riesgo de sesgo heredado: los modelos entrenados en ImageNet y CIFAR-10 heredan los sesgos de esas bases de datos (clases desequilibradas, etiquetas ruidosas, sesgos culturales y de representacion).
- Riesgo de alucinacion no aplica en el sentido generativo, pero si existe riesgo de clasificaciones erroneas con alta confianza en imagenes fuera de distribucion.
- Serializacion PyTorch clasica: los `.pth.tar` requieren cargarse con `torch.load`, lo que implica riesgos de seguridad si el origen no es de confianza; la propia model card advierte de cargar solo checkpoints de fuentes fiables.
- Sin soporte declarado para cuantizacion, exportacion a GGUF ni despliegue en runtimes de inferencia modernos; la integracion en produccion requiere trabajo adicional de conversion.
- Fecha de creacion del repositorio en 2026 y cero descargas/likes: no hay evidencia de adopcion ni de mantenimiento posterior.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ghimiredhikura/MSVFP
- Articulo publicado (DOI): https://doi.org/10.3390/app13010316
- Codigo y evaluacion originales: https://github.com/ghimiredhikura/msvsp-filter-pruning/tree/4b193b4b08eeb106b4ea632aaa34afb4f974be92
- Fichero de trazabilidad de checkpoints: `source-checkpoints.json` dentro del repositorio de Hugging Face.
