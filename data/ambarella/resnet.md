# Ambarella/ResNet

## Resumen

ResNet-50 es una red neuronal convolucional profunda de 50 capas que introdujo las conexiones residuales (skip connections) para permitir el entrenamiento estable de arquitecturas muy profundas. Este repositorio, publicado por Ambarella, no contiene un modelo de lenguaje ni un transformer generativo: es una compilacion de pesos ResNet-50 v1.5 derivados de la implementacion de referencia de torchvision (`ResNet50_Weights.IMAGENET1K_V2`), entrenados originalmente sobre ImageNet a resolucion 3x224x224, empaquetados en formato binario propietario (`.bin`) para su despliegue en los SoCs de vision de Ambarella (N1-655, X7, CV7, CV72 y CV75).

El interes practico de esta ficha es distinto al de un modelo generativo: ResNet-50 se usa aqui como backbone de extraccion de caracteristicas para deteccion de objetos, segmentacion, re-identificacion de personas y clasificacion de imagenes en dispositivos de borde (camaras IP, dashcams, sistemas de videovigilancia). El repositorio incluye variantes optimizadas por Ambarella ("Amba_optimized") y variantes con activaciones en fp16, pensadas para maximizar el rendimiento en el acelerador NPU/DLA de cada chip.

El modelo es relevante para desarrolladores que trabajan con el SDK Cooper (version 2.5.4) y Cooper Foundry (2.3), ya que proporciona artefactos listos para desplegar en hardware Ambarella sin necesidad de recompilar desde PyTorch. No hay informacion publica sobre licencia, idiomas ni pipeline en Hugging Face, y el repositorio ocupa 0,1 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN residual (ResNet-50 v1.5, bottleneck de 3 capas, 50 capas) |
| Parametros totales | ~25,6 M (ResNet-50 estandar; no confirmado en el repo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision, no aplica) |
| Tipos de cuantizacion | pesos optimizados "Amba_optimized" y activaciones fp16 (`act16`); no se detalla el esquema exacto |
| Idiomas soportados | no disponible (modelo de vision, sin capacidades linguisticas) |
| Licencia | no disponible |
| Formato de pesos | `.bin` propietario por dispositivo (N1-655, X7, CV7, CV72, CV75); pesos PyTorch de referencia via torchvision |
| Entrada | imagen RGB 3x224x224 |
| Dataset de entrenamiento | ImageNet (clasificacion, 1000 clases) |
| Libreria | PyTorch (referencia); despliegue via Cooper SDK 2.5.4 / Cooper Foundry 2.3 |
| Tamano del repo | 0,1 GB |

## Arquitectura y entrenamiento

ResNet-50 sigue la arquitectura descrita en "Deep Residual Learning for Image Recognition" (He et al., 2015): una etapa inicial de convolucion 7x7 seguida de cuatro etapas de bloques residuales tipo bottleneck (3x3, 1x1, 1x1 con proyeccion de identidad), y una cabeza de clasificacion fully-connected sobre 1000 clases. La innovacion central son las conexiones residuales que suman la entrada del bloque a su salida, lo que resuelve el problema de degradacion del gradiente en redes profundas y permite entrenar 50, 101 o 152 capas de forma estable.

Este repositorio concreto parte de los pesos `ResNet50_Weights.IMAGENET1K_V2` de torchvision (variante v1.5), entrenados sobre ImageNet. No se documenta en la model card ningun proceso adicional de entrenamiento, destilacion, RLHF ni fine-tuning: Ambarella ha tomado los pesos de referencia y los ha convertido/optimizado para sus aceleradores, publicando dos variantes por dispositivo (una "Amba_optimized" y otra con activaciones fp16). No se proporcionan detalles sobre el pipeline de compilacion ni sobre posibles perdidas de precision introducidas por la optimizacion.

## Capacidades

- Clasificacion de imagenes en 1000 clases de ImageNet a resolucion 224x224.
- Extraccion de caracteristicas (feature extraction) para servir como backbone en tareas de vision por computador.
- Base para deteccion de objetos, segmentacion semantica e instancia, y re-identificacion de personas cuando se combina con cabezas especificas.
- Inferencia optimizada en hardware Ambarella (N1-655, X7, CV7, CV72, CV75) via Cooper SDK y Cooper Foundry.
- Dos modos de despliegue por dispositivo: pesos optimizados por Ambarella y activaciones fp16.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, tool calling, agentes ni capacidades multilingues: es exclusivamente un modelo de vision.

## Casos de uso

- Videovigilancia en camaras IP con SoC Ambarella: clasificacion y deteccion de objetos en tiempo real en el propio dispositivo, usando los binarios `cv72` o `cv75` para evitar enviar video a la nube y reducir latencia y ancho de banda.
- Re-identificacion de personas en sistemas de control de accesos: ResNet-50 actua como extractor de embeddings y una cabeza de metric learning compara descriptores entre camaras; el modelo es adecuado por su equilibrio precision/coste y por estar disponible como artefacto listo para el NPU del chip.
- Deteccion de objetos en dashcams y sistemas ADAS de bajo consumo: el binario `n1-655` permite ejecutar el backbone en el SoC N1-655 dentro del vehiculo, alimentando un detector aguas abajo para peatones, vehiculos y senalizacion.
- Segmentacion semantica en drones y robots de inspeccion: al ser un backbone estandar, se integra con cabezas tipo DeepLab o FCN y se despliega via Cooper Foundry en los SoCs CV7/CV72, manteniendo la cadencia de fotogramas en vuelo.
- Clasificacion de imagenes en aplicaciones de borde (agricultura de precision, inspeccion industrial): el modelo clasifica cultivos, defectos o piezas a partir de recortes 224x224, con la variante `act16` para reducir consumo energetico cuando la precision lo permite.
- Fine-tuning y destilacion en servidor: los pesos de referencia de torchvision permiten reentrenar sobre un dataset propio (por ejemplo, defectos de fabrica) y luego recompilar con Cooper Foundry para desplegar la version adaptada en el dispositivo Ambarella.
- Baseline de investigacion en vision: al ser ResNet-50 v1.5 el backbone canonico de comparacion, sirve para medir el impacto de la optimizacion Ambarella frente a la implementacion PyTorch original en terminos de exactitud y latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de exactitud (top-1/top-5 en ImageNet), latencia, throughput ni comparaciones con la implementacion PyTorch de referencia para las variantes optimizadas.

## Requisitos de hardware

- VRAM estimada para inferencia en GPU: aproximadamente 0,1 GB en fp32 para los pesos (~25,6 M parametros), mas activaciones segun batch; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas para la referencia PyTorch: cualquier GPU con al menos 2 GB de memoria (GTX 1650, RTX 3060, RTX 4090, A100, H100); el cuello de botella real es el throughput, no la memoria.
- Cabe en GPU consumer: si, sin restricciones practicas; incluso en CPU se obtienen latencias utilizables por imagen.
- Despliegue objetivo: SoCs Ambarella N1-655, X7, CV7, CV72 y CV75 mediante Cooper SDK 2.5.4 y Cooper Foundry 2.3, usando los binarios `.bin` publicados.
- Despliegue en servidor: PyTorch con torchvision (`resnet50(weights=ResNet50_Weights.IMAGENET1K_V2)`), ONNX Runtime, TensorRT o similar; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de vision.
- Latencia y throughput: no disponibles para las variantes Ambarella; no se publican cifras de FPS por dispositivo.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Contexto/uso | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ResNet-50 (Ambarella) | ~25,6 M | 3x224x224 | Clasificacion/backbone | no disponible | Binarios para SoCs Ambarella + pesos torchvision |
| ResNet-101 | ~44,5 M | 3x224x224 | Clasificacion/backbone | BSD-3 (torchvision) | Pesos PyTorch publicos |
| ResNet-18 | ~11,7 M | 3x224x224 | Clasificacion/backbone ligero | BSD-3 (torchvision) | Pesos PyTorch publicos |
| MobileNetV3-Large | ~5,4 M | 3x224x224 | Clasificacion movil | BSD-3 (torchvision) | Pesos PyTorch publicos |
| EfficientNet-B0 | ~5,3 M | 3x224x224 | Clasificacion eficiente | BSD-3 (torchvision) | Pesos PyTorch publicos |

La comparacion se limita a alternativas de la misma categoria (backbones CNN de vision). No hay datos de rendimiento publicados para la variante Ambarella que permitan comparar exactitud o latencia frente a estas alternativas.

## Limitaciones y advertencias

- Modelo exclusivamente de vision: no procesa texto, audio ni lenguaje natural; no dispone de contexto conversacional ni de tool calling.
- Entrenado sobre ImageNet (1000 clases genericas): el vocabulario visual es limitado y el rendimiento cae fuera de dominio sin fine-tuning.
- Sesgos de ImageNet: el dataset contiene sesgos conocidos de representacion geografica y cultural que se trasladan al clasificador.
- Riesgo de alucinacion en sentido amplio: el clasificador siempre devuelve una de las 1000 clases, incluso ante entradas ambiguas o fuera de distribucion, con alta confianza potencialmente enganosa.
- Licencia no declarada en el repositorio: no se puede confirmar el uso comercial de los binarios Ambarella sin consultar al autor; los pesos torchvision de referencia tienen licencia BSD-3, pero la model card no la explicita.
- Formatos `.bin` propietarios: solo utilizables con Cooper SDK 2.5.4 / Cooper Foundry 2.3 y con los SoCs listados; no hay garantia de compatibilidad con otras versiones del SDK ni con otros chips.
- No se documentan perdidas de precision introducidas por "Amba_optimized" ni por activaciones fp16; conviene validar la exactitud en el dispositivo antes de produccion.
- Repositorio con 5 descargas y 0 likes: ecosistema muy pequeno, sin issues ni discusion publica que permita contrastar experiencias de despliegue.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Ambarella/ResNet
- Paper original ResNet: https://arxiv.org/abs/1512.03385
- Implementacion de referencia torchvision ResNet-50: https://pytorch.org/vision/stable/models/generated/torchvision.models.resnet50.html
- Pesos originales ImageNet1K_V2: https://download.pytorch.org/models/resnet50-11ad3fa6.pth
- Dataset ImageNet: https://image-net.org
- Binario N1-655 (Amba_optimized): https://huggingface.co/Ambarella/ResNet/blob/main/n1-655_resnet_v1.5_50_amba_optimized.bin
- Binario N1-655 (Activation_fp16): https://huggingface.co/Ambarella/ResNet/blob/main/n1-655_resnet_v1.5_50_act16.bin
- Binario X7 (Amba_optimized): https://huggingface.co/Ambarella/ResNet/blob/main/x7_resnet_v1.5_50_amba_optimized.bin
- Binario X7 (Activation_fp16): https://huggingface.co/Ambarella/ResNet/blob/main/x7_resnet_v1.5_50_act16.bin
- Binario CV7 (Amba_optimized): https://huggingface.co/Ambarella/ResNet/blob/main/cv7_resnet_v1.5_50_amba_optimized.bin
- Binario CV7 (Activation_fp16): https://huggingface.co/Ambarella/ResNet/blob/main/cv7_resnet_v1.5_50_act16.bin
- Binario CV72 (Amba_optimized): https://huggingface.co/Ambarella/ResNet/blob/main/cv72_resnet_v1.5_50_amba_optimized.bin
- Binario CV72 (Activation_fp16): https://huggingface.co/Ambarella/ResNet/blob/main/cv72_resnet_v1.5_50_act16.bin
- Binario CV75 (Amba_optimized): https://huggingface.co/Ambarella/ResNet/blob/main/cv75_resnet_v1.5_50_amba_optimized.bin
- Binario CV75 (Activation_fp16): https://huggingface.co/Ambarella/ResNet/blob/main/cv75_resnet_v1.5_50_act16.bin
