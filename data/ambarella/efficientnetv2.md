# Ambarella/EfficientNetV2

## Resumen

EfficientNetV2-S es una red neuronal convolucional para clasificación de imágenes publicada originalmente por Google Research en el paper "EfficientNetV2: Smaller Models and Faster Training" (arXiv:2104.00298). Este repositorio concreto, alojado por Ambarella, no contiene un modelo nuevo: empaqueta los pesos oficiales de `torchvision.models.efficientnet_v2_s` (variante ImageNet-1K, resolución 3x384x384) junto con compilaciones optimizadas para los aceleradores de visión de Ambarella (N1-655, X7, CV7, CV72 y CV75) en formato `.bin` con activaciones en fp16.

El interés de esta ficha no está en la arquitectura en sí (ampliamente conocida desde 2021) sino en su empaquetado para despliegue en hardware embebido de vigilancia y visión artificial. El repositorio ocupa 0,1 GB y está pensado para integrarse con el SDK Cooper 2.5.4 y Cooper Foundry 2.3 de Ambarella, lo que permite ejecutar el clasificador en cámaras IP y sistemas de borde (edge) con recursos limitados.

La relevancia actual es la de un artefacto de despliegue: no aporta mejoras de precisión ni de contexto, sino pesos precompilados para SoCs concretos. Para quien necesite un backbone convolucional ligero en producción sobre silicio Ambarella, este repositorio ahorra el paso de conversión; para cualquier otro uso, conviene acudir directamente a torchvision o a los pesos originales de Google.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN (EfficientNetV2-S, bloques fused-MBConv) |
| Parametros totales | no disponible en la informacion proporcionada (la variante S de EfficientNetV2 ronda los 21,5 M según el paper original, dato no verificado en este repo) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada 3x384x384) |
| Tipos de cuantizacion | no disponible (los binarios indican `Activation_fp16`) |
| Idiomas soportados | no aplica (clasificación de imágenes, etiquetas ImageNet en inglés) |
| Licencia | no disponible en la model card del repositorio |
| Formato de pesos | PyTorch (`.pth` de referencia) y binarios propietarios `.bin` para SoCs Ambarella |

## Arquitectura y entrenamiento

EfficientNetV2-S emplea una arquitectura convolucional con bloques fused-MBConv (fusión de convolución 3x3 con expansión 1x1 en un único bloque), atención por squeeze-and-excitation y una regla de escalado compuesta ajustada al entrenamiento. El paper original introduce entrenamiento con aumentación progresiva (progressive learning), que incrementa la resolución de entrada y la intensidad de la aumentación a lo largo del entrenamiento para acelerar la convergencia.

Los pesos de este repositorio corresponden a la variante preentrenada en ImageNet-1K (`EfficientNet_V2_S_Weights.IMAGENET1K_V1`), con entrada de 384x384 píxeles. No se documenta en la model card ningún entrenamiento adicional, fine-tuning, destilación ni proceso de RLHF/DPO (no aplicable a un clasificador). Las compilaciones para los SoCs Ambarella aplican conversión a fp16 en activaciones, pero no se especifica el esquema de cuantización de pesos ni el calibrado utilizado.

## Capacidades

- Clasificación de imágenes en 1.000 clases de ImageNet-1K.
- Extracción de características (feature extraction) como backbone convolucional para pipelines de visión (detección, segmentación, reidentificación) previo recorte de la cabeza de clasificación.
- Inferencia en hardware de borde Ambarella (N1-655, X7, CV7, CV72, CV75) mediante binarios precompilados con el SDK Cooper.
- Entrada a resolución 384x384, adecuada para objetos de tamaño medio en escenas de vigilancia.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No tiene capacidades multilingües ni de visión-lenguaje: únicamente etiquetas de clase en inglés.

## Casos de uso

- Clasificación de eventos en cámaras IP: el modelo, compilado para CV72/CV75, se ejecuta en el propio SoC de la cámara para etiquetar escenas (vehículos, personas, animales) sin enviar vídeo a la nube, reduciendo latencia y ancho de banda.
- Filtrado previo en pipelines de videovigilancia: usar la salida de 1.000 clases como señal de enrutamiento para activar analíticas más costosas solo cuando se detecta una categoría de interés.
- Backbone para modelos de detección en borde: eliminar la capa fully-connected y reutilizar los mapas de características para un cabezal de detección ligero (por ejemplo, una SSD pequeña) sobre el mismo SoC Ambarella.
- Control de calidad industrial en línea de producción: clasificación de defectos visuales en tiempo real sobre N1-655, con el modelo reentrenado mediante fine-tuning sobre un dataset propio (requiere trabajo adicional no incluido en el repo).
- Prototipado rápido con torchvision: cargar los pesos `.pth` de referencia en un entorno Python para validar un pipeline antes de portarlo al binario del dispositivo.
- Benchmarking de silicio: comparar latencia y precisión entre las distintas variantes Ambarella (X7, CV7, CV72, CV75) usando el mismo modelo y resolución de entrada.
- Clasificación de imágenes en aplicaciones de robótica o dronótica con presupuesto térmico y energético ajustado, donde una CNN de ~21 M de parámetros es viable frente a transformers de visión más pesados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de precisión (top-1/top-5), latencia ni throughput para ninguna de las variantes de hardware. Para cifras de referencia de EfficientNetV2-S sobre ImageNet, consúltese el paper original (arXiv:2104.00298) o la documentación de torchvision, no este repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia en GPU: no disponible en la información proporcionada. Como orientación no verificada, una CNN de este tamaño en fp32 con entrada 384x384 suele requerir menos de 2 GB, pero no hay medición publicada en este repo.
- GPU recomendadas: no especificadas. Para validación con PyTorch, cualquier GPU con soporte CUDA es suficiente; el destino real son los SoCs Ambarella N1-655, X7, CV7, CV72 y CV75.
- GPU de consumo: probablemente cabe en GTX 1060/RTX 2060 o superiores, pero no hay datos confirmados.
- Opciones de despliegue: PyTorch/torchvision para los pesos `.pth`; SDK Cooper 2.5.4 y Cooper Foundry 2.3 para los binarios `.bin` en hardware Ambarella.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EfficientNetV2-S (este repo) | ~21,5 M (paper, no verificado en repo) | 384x384 | no aplica | no disponible | HuggingFace (Ambarella), binarios para SoCs Ambarella |
| EfficientNet-B0 | ~5,3 M (paper) | 224x224 | no aplica | Apache 2.0 (torchvision) | torchvision, pesos públicos |
| ResNet-50 | ~25,6 M (paper) | 224x224 | no aplica | BSD-3 (torchvision) | torchvision, ampliamente desplegado |
| MobileNetV3-Large | ~5,5 M (paper) | 224x224 | no aplica | Apache 2.0 (torchvision) | torchvision, orientado a móvil |

Los datos de parámetros de los modelos comparados provienen de sus respectivos papers y de la documentación de torchvision; no se han verificado dentro de este repositorio. La ventaja específica de este artefacto frente a los anteriores es la disponibilidad de binarios precompilados para silicio Ambarella, algo que ninguno de los comparados ofrece de serie.

## Limitaciones y advertencias

- La licencia no está declarada en la model card: no se puede asumir uso comercial sin consultar al autor o a Ambarella.
- El repositorio no documenta precisión, sesgos ni composición del dataset más allá de ImageNet-1K; los sesgos conocidos de ImageNet (desbalance de clases, sesgo geográfico y cultural en las anotaciones) aplican íntegramente.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí de falsos positivos y confusiones entre clases visualmente próximas, habitual en clasificadores ImageNet.
- Las etiquetas de salida están en inglés y limitadas a las 1.000 clases de ImageNet: no cubre categorías específicas de dominio sin fine-tuning.
- Los binarios `.bin` solo funcionan en los SoCs Ambarella listados y con las versiones de SDK indicadas (Cooper 2.5.4 / Foundry 2.3); no son portables a otras plataformas.
- La cuantización exacta de pesos no se especifica; solo se indica `Activation_fp16`, lo que puede introducir degradación de precisión no cuantificada.
- El repositorio tiene 4 descargas y 0 likes: no hay evidencia de uso en producción ni validación comunitaria.
- No es un modelo de lenguaje: no debe usarse para tareas de texto, razonamiento ni generación.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Ambarella/EfficientNetV2
- Paper original: https://arxiv.org/abs/2104.00298
- Implementación de referencia (torchvision): https://pytorch.org/vision/stable/models/generated/torchvision.models.efficientnet_v2_s.html
- Pesos originales: https://download.pytorch.org/models/efficientnet_v2_s-dd5fe13b.pth
- Dataset ImageNet: https://image-net.org
- Binario N1-655: https://huggingface.co/Ambarella/EfficientNetV2/blob/main/n1-655_efficientnet_v2_s_act16.bin
- Binario X7: https://huggingface.co/Ambarella/EfficientNetV2/blob/main/x7_efficientnet_v2_s_act16.bin
- Binario CV7: https://huggingface.co/Ambarella/EfficientNetV2/blob/main/cv7_efficientnet_v2_s_act16.bin
- Binario CV72: https://huggingface.co/Ambarella/EfficientNetV2/blob/main/cv72_efficientnet_v2_s_act16.bin
- Binario CV75: https://huggingface.co/Ambarella/EfficientNetV2/blob/main/cv75_efficientnet_v2_s_act16.bin
