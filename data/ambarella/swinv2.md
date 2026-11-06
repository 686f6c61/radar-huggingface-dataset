# Ambarella/SwinV2

## Resumen

SwinV2-Tiny es la variante compacta de Swin Transformer V2, una arquitectura de visión por computador presentada en el artículo "Swin Transformer V2: Scaling Up Capacity and Resolution" (arXiv:2111.09883). Este repositorio concreto, publicado por Ambarella, no contiene un modelo de lenguaje ni un modelo generativo: es un backbone de visión jerárquico basado en self-attention con ventanas desplazadas, exportado y optimizado para su despliegue en los aceleradores de visión de Ambarella (familias N1, X7, CV7, CV72 y CV75).

El modelo parte de los pesos de referencia de torchvision (`Swin_V2_T_Weights.IMAGENET1K_V1`), entrenados para clasificación de imágenes en ImageNet-1K a resolución 3x256x256. Ambarella redistribuye esos pesos en formato binario propietario (`.bin`) con dos variantes de compresión: una optimización propia ("Amba_optimized") y una cuantización de activaciones a fp16 ("Activation_fp16"). El objetivo es servir como bloque de extracción de características en pipelines de visión embebida (detección, segmentación, clasificación en el borde) sobre hardware Ambarella.

Es relevante ahora porque los modelos de visión compactos y desplegables en silicio de bajo consumo son la base de la percepción en cámaras inteligentes, sistemas de videovigilancia y robótica. Sin embargo, conviene subrayar que este repositorio no es un modelo de propósito general ni un LLM: no genera texto, no soporta tool calling y no tiene ventana de contexto en el sentido de los modelos de lenguaje. La ficha que sigue adapta la estructura habitual a un modelo puramente visual.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Swin Transformer V2 (transformer jerárquico con self-attention de ventanas desplazadas) |
| Parámetros totales | no disponible (la variante Tiny de SwinV2 ronda los 28 M según la literatura, dato no confirmado en la información proporcionada) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; resolución de entrada 3x256x256) |
| Tipos de cuantización | fp16 en activaciones ("Activation_fp16"); optimización propietaria "Amba_optimized"; pesos originales en fp32 (torchvision) |
| Idiomas soportados | no aplica (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | `.bin` propietario para hardware Ambarella; pesos originales `.pth` (PyTorch) vía torchvision |
| Librería | PyTorch (referencia); despliegue vía Cooper SDK 2.5.4 / Cooper Foundry 2.3 |
| Tamaño del repositorio | 0,3 GB |
| Resolución de entrada | 3x256x256 |
| Hardware objetivo | N1-655, X7, CV7, CV72, CV75 (aceleradores Ambarella) |

## Arquitectura y entrenamiento

Swin Transformer V2 es una evolución del Swin Transformer original que introduce tres cambios técnicos clave: escalado de la atención con una función logarítmica en lugar del producto escalar estándar (para estabilizar el entrenamiento a gran escala), un esquema de codificación posicional relativa continuo que permite transferir pesos entre resoluciones de imagen distintas, y una estrategia de preentrenamiento auto-supervisado (SimMIM) para aprovechar datasets de gran tamaño. La variante Tiny mantiene la estructura jerárquica por etapas con ventanas de atención desplazadas, lo que reduce el coste computacional frente a un transformer de visión denso.

En este repositorio, Ambarella no publica detalles sobre el entrenamiento propio: los pesos proceden de la implementación de referencia de torchvision (`Swin_V2_T_Weights.IMAGENET1K_V1`), es decir, un modelo preentrenado en ImageNet-1K para clasificación. No hay información en la model card sobre número de tokens de entrenamiento (no aplica), composición del dataset, uso de RLHF/DPO ni innovaciones adicionales más allá de las del paper original. La aportación de Ambarella es la conversión y optimización de los pesos para sus aceleradores, no el entrenamiento del modelo.

## Capacidades

- Clasificación de imágenes a resolución 3x256x256 (tarea para la que se publicaron los pesos de referencia).
- Extracción de características visuales jerárquicas, utilizable como backbone para detección de objetos y segmentación densa.
- Inferencia en hardware embebido Ambarella (N1-655, X7, CV7, CV72, CV75) mediante el SDK Cooper.
- Dos modos de compresión: optimización propietaria Ambarella y cuantización de activaciones a fp16.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües (no procesa texto).
- No dispone de modo "thinking", visión generativa, audio ni ninguna capacidad multimodal más allá de la visión de entrada.

## Casos de uso

- Clasificación de imágenes en el borde: el modelo puede ejecutarse en los aceleradores CV7/CV72/CV75 de Ambarella para etiquetar fotogramas de cámara en tiempo real, aprovechando la variante "Amba_optimized" para minimizar latencia y consumo.
- Backbone de detección de objetos en videovigilancia: al ser un transformer jerárquico con características multi-escala, se puede acoplar a cabezas de detección para identificar personas o vehículos en flujos de vídeo procesados localmente en la cámara.
- Segmentación semántica en sistemas de automoción o robótica: las características densas del modelo sirven como extractor para redes de segmentación que operan sobre hardware Ambarella de bajo consumo.
- Preprocesado de percepción en cámaras inteligentes: clasificación previa de escenas (interior/exterior, día/noche) para activar modos de captura o alarmas sin enviar datos a la nube.
- Prototipado con torchvision: al estar basado en `torchvision.models.swin_v2_t`, se puede validar el comportamiento del modelo en GPU de escritorio antes de desplegarlo en el hardware Ambarella, usando los mismos pesos de referencia.
- Investigación en visión embebida: comparar la variante "Amba_optimized" frente a "Activation_fp16" para medir el impacto de la cuantización en precisión y throughput sobre los distintos aceleradores de la tabla de la model card.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de precisión (top-1/top-5 en ImageNet), latencia ni throughput para ninguna de las variantes de hardware o compresión.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Para la variante Tiny de SwinV2 en fp32, el peso en disco es de aproximadamente 0,1 GB, por lo que la huella de memoria es reducida, pero no se confirma el dato exacto.
- GPU recomendadas: no especificadas. Para la validación con torchvision se puede usar cualquier GPU con soporte CUDA (por ejemplo, RTX 4090, A100, H100), pero el objetivo real del repositorio son los aceleradores Ambarella.
- ¿Cabe en GPU de consumo? Sí, previsiblemente en cualquier GPU consumer moderna por el tamaño reducido de la variante Tiny, aunque no se aporta una cifra oficial de VRAM.
- Opciones de despliegue: SDK Cooper 2.5.4 y Cooper Foundry 2.3 para el hardware Ambarella; PyTorch/torchvision para la referencia. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de visión de este tipo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Resolución | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SwinV2-Tiny (este repo) | Swin Transformer V2 Tiny | no disponible | 256x256 | no disponible | Pesos `.bin` para Ambarella + referencia torchvision |
| SwinV2-Tiny (torchvision) | Swin Transformer V2 Tiny | no disponible | 256x256 | BSD-3-Clause (torchvision) | Pesos `.pth` públicos |
| ViT-B/16 | Vision Transformer | ~86 M (dato de literatura, no confirmado aquí) | 224x224 | según implementación | Amplia |
| ConvNeXt-T | CNN moderno | ~28 M (dato de literatura, no confirmado aquí) | 224x224 | según implementación | Amplia |

La comparación con ViT-B/16 y ConvNeXt-T se ofrece como referencia de categoría (backbones de visión compactos); los datos de parámetros provienen de la literatura general y no de la información proporcionada en este repositorio, por lo que deben verificarse antes de usarse en producción.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no responde preguntas y no admite instrucciones en lenguaje natural.
- La licencia no está declarada en la información disponible; no se puede asumir uso comercial sin verificar los términos con Ambarella y con la licencia original de torchvision (BSD-3-Clause para el código, condiciones propias para los pesos).
- Los pesos `.bin` son propietarios y solo funcionan en hardware Ambarella con el SDK Cooper; no son portables a otras plataformas.
- No se han publicado métricas de precisión tras la optimización "Amba_optimized" ni tras la cuantización a fp16, por lo que se desconoce la degradación real frente a los pesos originales.
- Riesgo de sesgo y alucinación: al ser un clasificador de visión entrenado en ImageNet-1K, hereda los sesgos de ese dataset (representación desigual de clases, etiquetas ruidosas) y puede fallar en dominios alejados de la distribución de entrenamiento.
- Resolución de entrada fija a 256x256; usos que requieran mayor resolución exigen reentrenamiento o adaptación, aunque la arquitectura V2 esté diseñada para escalar en resolución.
- No hay información sobre idiomas, contexto ni capacidades conversacionales porque no aplican.
- Para producción en el borde, es imprescindible validar el modelo con datos propios del dominio y medir latencia y consumo en el acelerador concreto antes del despliegue.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Ambarella/SwinV2
- Paper original: https://arxiv.org/abs/2111.09883
- Implementación de referencia en torchvision: https://pytorch.org/vision/0.20/models/swin_transformer.html
- Pesos originales de torchvision: https://download.pytorch.org/models/swin_v2_t-b137f0e2.pth
- Pesos Ambarella N1-655 (Amba_optimized): https://huggingface.co/Ambarella/SwinV2/blob/main/n1-655_swin_tiny_v2_amba_optimized.bin
- Pesos Ambarella X7 (Amba_optimized): https://huggingface.co/Ambarella/SwinV2/blob/main/x7_swin_tiny_v2_amba_optimized.bin
- Pesos Ambarella CV7 (Amba_optimized): https://huggingface.co/Ambarella/SwinV2/blob/main/cv7_swin_tiny_v2_amba_optimized.bin
- Pesos Ambarella CV72 (Amba_optimized): https://huggingface.co/Ambarella/SwinV2/blob/main/cv72_swin_tiny_v2_amba_optimized.bin
- Pesos Ambarella CV75 (Amba_optimized): https://huggingface.co/Ambarella/SwinV2/blob/main/cv75_swin_tiny_v2_amba_optimized.bin
