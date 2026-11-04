# Mourad-zaied/SaluNet

## Resumen

SaluNet es una familia de arquitecturas de visión por computador que propone sustituir las capas de normalización de características (BatchNorm en CNNs y LayerNorm en Vision Transformers) por una geometría elemental aprendida, sin calcular estadísticas de lote ni de token. Lo desarrolla Mourad Zaied y se publica bajo licencia MIT, acompañado del paper "Geometry, Not Statistics: SaluNet for Normalization-Free CNNs and Transformers" (arXiv:2606.02927). El repositorio de HuggingFace no aloja los pesos: los checkpoints se distribuyen mediante enlaces externos a Google Drive y el código en GitHub.

El modelo resuelve un problema práctico: la dependencia de estadísticas de lote hace que BatchNorm degrade drásticamente con lotes pequeños (en sus experimentos, ResNet-18 con BN + ReLU cae al 1,10% de Top-1 con batch size 1 en CIFAR-100, mientras que SaluNet-C-18 mantiene el 76,23%). La propuesta se articula en dos operadores: SALU, que reemplaza la normalización, y SWALU/GALU, activaciones inspiradas en Swish y GELU construidas sobre SALU.

Se publican dos familias: SaluNet-C (convolucional, con ResNet-18 en CIFAR y ResNet-50 en ImageNet-1K) y SaluNet-T (Vision Transformer, con ViT-B/16 en ImageNet-1K). Los resultados reportados alcanzan 83,02 ± 0,29% EMA Top-1 en CIFAR-100 con ResNet-18 y 80,12% EMA Top-1 en ImageNet-1K con ViT-B/16, entrenando desde cero en una única GPU A40 de 24 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN (ResNet-18, ResNet-50) y Vision Transformer (ViT-B/16), con SALU sustituyendo BatchNorm/LayerNorm |
| Parametros totales | No disponible de forma explicita; corresponde a los backbones ResNet-18 (~11,7 M), ResNet-50 (~25,6 M) y ViT-B/16 (~86 M) con las capas SALU añadidas |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de clasificacion de imagenes) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (etiqueta de idioma del repositorio; la tarea es clasificacion de imagenes) |
| Licencia | MIT |
| Formato de pesos | No disponible (checkpoints externos en Google Drive; no se especifica formato) |

## Arquitectura y entrenamiento

SaluNet introduce el operador SALU(x; a, b) = ax / sqrt(1 + abx²), con coeficientes positivos aprendidos a y b compartidos entre los elementos de entrada de cada modulo. La interpretacion geometrica usa amplitud de saturacion S = sqrt(a/b) y anchura de transicion W = 1/sqrt(ab). Sobre SALU se definen dos activaciones con compuerta: SWALU(x) = (x/2)[1 + SALU(x)] y GALU(x) = (x/2)[1 + SALU(ψ(x))], con ψ(x) = sqrt(2/π)(x + 0,044715x³), analogas a Swish y GELU respectivamente. Los coeficientes de las compuertas se aprenden de forma independiente a los de los modulos de estabilizacion.

En SaluNet-C se sustituyen las capas BatchNorm por SALU y, en configuraciones con compuerta, las ReLU por SWALU o GALU; los parametros de compuerta se comparten entre llamadas dentro de cada bloque residual y el stem tiene su propia compuerta. En SaluNet-T se sustituye LayerNorm por SALU y se mantiene GELU o se usa SWALU/GALU en las MLP. Los experimentos de ImageNet se entrenaron desde cero en una unica NVIDIA A40 de 24 GB: ResNet-50 con 150 epocas, batch fisico 180 y efectivo 900 (acumulacion de gradiente de 5 pasos), y ViT-B/16 con 300 epocas, batch 128, learning rate inicial 0,000125 con 20 epocas de warmup, reanudacion desde el checkpoint 150 con lr 0,0001 y EMA con decaimiento 0,999. El preprocesado incluye redimensionado offline a lado mayor 320 con Lanczos y guardado en JPEG calidad 95.

## Capacidades

- Clasificacion de imagenes en CIFAR-10, CIFAR-100 e ImageNet-1K.
- Entrenamiento e inferencia sin estadisticas de lote ni de token: funcionamiento estable con batch size 1.
- Sustitucion directa de BatchNorm y LayerNorm en backbones estandar (ResNet-18, ResNet-50, ViT-B/16).
- Evaluacion a resoluciones superiores a la de entrenamiento (224 × 224 y 288 × 288) reutilizando el mismo checkpoint EMA, con interpolacion bicubica de los embeddings posicionales en el ViT.
- Uso de activaciones con compuerta aprendida (SWALU, GALU) como alternativa a ReLU y GELU.
- No soporta tool calling, agentes, razonamiento multi-paso, vision generativa, audio ni modo thinking: es un modelo discriminativo de vision.

## Casos de uso

- Clasificacion de imagenes con lotes muy pequeños o unitarios: en entornos de inferencia en tiempo real donde cada peticion se procesa de forma individual, SaluNet-C-18 conserva 76,23% Top-1 en CIFAR-100 con batch size 1, frente al colapso de BN + ReLU.
- Aprendizaje federado o con restricciones de memoria: al no requerir estadisticas de lote, el modelo es adecuado para entrenamiento distribuido con lotes locales pequeños o no i.i.d.
- Backbone para pipelines de vision en produccion: ResNet-50 con SALU alcanza 79,59% EMA Top-1 en ImageNet-1K y puede integrarse como extractor de caracteristicas en sistemas de clasificacion a gran escala.
- Investigacion en arquitecturas sin normalizacion: sirve como referencia reproducible para estudiar el efecto de sustituir normalizacion por geometria aprendida en CNNs y transformers.
- Despliegue en hardware con memoria limitada: los entrenamientos completos de ImageNet-1K caben en una sola GPU A40 de 24 GB, lo que facilita la reproduccion en laboratorios con recursos modestos.
- Evaluacion a mayor resolucion sin reentrenamiento: el mismo checkpoint EMA de ViT-B/16 mejora de 80,12% a 80,28% Top-1 al pasar de 224 a 288 pixeles, util para ajustar precision y coste en inferencia.
- Clasificacion de imagenes en dominios con lotes variables: la estabilidad con batch size 1 lo hace apto para servicios serverless o con trafico irregular.

## Benchmarks y rendimiento

| Modelo | Dataset | Configuracion | Top-1 (%) | Top-5 (%) |
|---|---|---|---:|---:|
| SaluNet-C-18 (SALU + SWALU) | CIFAR-100 | EMA, media de 3 ejecuciones | 83,02 ± 0,29 | No disponible |
| SaluNet-C-18 (SALU + SWALU) | CIFAR-100 | EMA, ejecucion determinista | 83,42 | No disponible |
| SaluNet-C-18 | CIFAR-100 | Batch size 1 | 76,23 | No disponible |
| ResNet-18 BN + ReLU | CIFAR-100 | Batch size 1 | 1,10 | No disponible |
| SaluNet-C-50 | ImageNet-1K | 150 epocas, crop 224 × 224 | 79,59 | 94,59 |
| SaluNet-C-50 | ImageNet-1K | Mismo checkpoint, crop 288 × 288 | 80,16 | 94,96 |
| SaluNet-T-B/16 | ImageNet-1K | 300 epocas, crop 224 × 224 | 80,12 | 94,79 |
| SaluNet-T-B/16 | ImageNet-1K | Mismo checkpoint, crop 288 × 288 | 80,28 | 94,74 |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de lenguaje, al tratarse de un modelo de vision. No se aportan comparaciones directas con ResNet o ViT estandar en ImageNet-1K mas alla del caso de batch size 1 en CIFAR-100.

## Requisitos de hardware

- Entrenamiento: una unica NVIDIA A40 de 24 GB fue suficiente para entrenar desde cero ResNet-50 (150 epocas) y ViT-B/16 (300 epocas) en ImageNet-1K.
- Inferencia: no se especifica VRAM; por tamano de backbone, ResNet-18 y ResNet-50 caben holgadamente en GPUs consumer (RTX 3060, RTX 4090) y ViT-B/16 requiere mas memoria pero es viable en RTX 4090 y A100/H100.
- Despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; al ser PyTorch, el despliegue se haria mediante PyTorch nativo, TorchScript u ONNX (no confirmado en la informacion disponible).
- Latencia y throughput: no disponibles.
- Cuantizacion: no se documentan opciones ni formatos cuantizados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Top-1 ImageNet-1K | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SaluNet-C-50 | ~25,6 M (ResNet-50 + SALU) | No aplica | 79,59 (224) / 80,16 (288) | MIT | Checkpoint externo en Google Drive |
| SaluNet-T-B/16 | ~86 M (ViT-B/16 + SALU) | No aplica | 80,12 (224) / 80,28 (288) | MIT | Checkpoint externo en Google Drive |
| ResNet-50 estandar | ~25,6 M | No aplica | No disponible en la informacion proporcionada | BSD-3 (torchvision) | Amplia, pesos publicos |
| ViT-B/16 estandar | ~86 M | No aplica | No disponible en la informacion proporcionada | Apache 2.0 (referencia) | Amplia, pesos publicos |

No se dispone en la informacion proporcionada de cifras comparativas de ResNet-50 o ViT-B/16 estandar en ImageNet-1K para contrastar directamente con SaluNet.

## Limitaciones y advertencias

- Modelo de vision por computador: no genera texto, no soporta tool calling ni razonamiento multi-paso; no debe evaluarse como modelo de lenguaje.
- Los pesos no estan alojados en HuggingFace: los checkpoints se distribuyen mediante enlaces a Google Drive, lo que afecta a la reproducibilidad y a la integracion con el ecosistema transformers.
- Cada backbone esta representado por una unica ejecucion completada en ImageNet-1K; no se reportan intervalos de confianza para esos resultados.
- Los resultados de batch size 1 corresponden a una sola ejecucion y no aislan las contribuciones de estabilizacion y compuerta.
- La implementacion de SaluNet-C-50 recorta las salidas de SWALU a [-10, 10] durante entrenamiento y evaluacion, mientras que la de ViT-B/16 no aplica recorte; esta asimetria condiciona la comparacion entre familias.
- El sampler de C-50 baraja cuatro copias de cada indice de entrenamiento sin truncamiento, lo que infla el numero de vistas por epoca (4N por epoca, 600N en total).
- No se documentan sesgos, riesgos de alucinacion (no aplica en clasificacion) ni evaluaciones de robustez o calibracion.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantias ni soporte; conviene verificar el estado de los enlaces externos antes de integrar en produccion.
- Idioma declarado: ingles; el modelo no procesa lenguaje de forma nativa.

## Enlaces

- HuggingFace: https://huggingface.co/Mourad-zaied/SaluNet
- Paper: https://arxiv.org/abs/2606.02927
- Codigo y scripts: https://github.com/MouradZaied/SaluNet
- Checkpoint SaluNet-C-18 / SALU + GALU (CIFAR-10): https://drive.google.com/file/d/1IeYOrmdkGwm-cAaz2XKzfz4XhQ1dcSsp/view
- Checkpoint SaluNet-C-18 / SALU + SWALU (CIFAR-100, 83,42%): https://drive.google.com/file/d/11_BCqoLbV6SWW0Rdkjf68vjm06JVC8rj/view
- Checkpoint SaluNet-C-50 / SWALU recortado (ImageNet-1K): https://drive.google.com/file/d/11-xtu1FyW6g-T53kRnTY3t2TjEvnGeVJ/view
- Checkpoint SaluNet-T-B/16 / SALU + SWALU (ImageNet-1K): https://drive.google.com/file/d/1tFNHfnQCrepLL7jry7ugfk4QpbIqX_P-/view
