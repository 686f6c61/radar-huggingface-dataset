# pelikrapael/vit-base-elderly-emotion-recognition

## Resumen

`vit-base-elderly-emotion-recognition` es un modelo de clasificación de imágenes especializado en el reconocimiento de expresiones faciales emocionales en personas mayores (60 años o más). Lo desarrolla Felix Rafael como parte de su tesis de fin de grado en el Departamento de Informática de la Universidad Gunadarma (Yakarta, Indonesia, 2025), bajo la supervisión de Dr. Guntur Eka Saputra. Se trata de un fine-tuning de `google/vit-base-patch16-224-in21k`, un Vision Transformer de aproximadamente 86 millones de parámetros que opera sobre imágenes RGB de 224 × 224 píxeles.

El problema que aborda es concreto: las expresiones faciales de las personas mayores difieren de los benchmarks de población general (FER2013, AffectNet) por factores fisiológicos como la laxitud cutánea, las arrugas dinámicas y la movilidad muscular alterada. El modelo se ajustó específicamente para capturar patrones de afecto facial sutil en rostros envejecidos, clasificando cinco emociones: ira, miedo, alegría, neutro y tristeza.

Es relevante ahora porque los sistemas de reconocimiento emocional generalistas rinden mal en subpoblaciones de edad avanzada, y este trabajo documenta empíricamente esa brecha (con una diferencia de hasta 41 puntos porcentuales frente a CNN clásicas en su propio conjunto de evaluación). El repositorio incluye un modelo complementario de audio (1D-CNN) para un sistema multimodal de detección emocional en mayores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-base-patch16-224, ImageNet-21k) |
| Parametros totales | 85.802.501 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada 224 × 224 RGB) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión original) |
| Idiomas soportados | inglés (`en`); el modelo es visual, no lingüístico |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La arquitectura es un Vision Transformer estándar de 12 capas con patch size de 16 × 16 y resolución de entrada 224 × 224, partiendo de los pesos preentrenados de `google/vit-base-patch16-224-in21k` (ImageNet-21k). La cabeza de clasificación se sustituyó por una de 5 clases correspondientes a las emociones objetivo. El ajuste fino empleó el optimizador AdamW con `lr=2e-5` y `weight_decay=0.01`, función de pérdida CrossEntropyLoss y un pipeline de aumento de datos que incluye RandomHorizontalFlip, ColorJitter, RandomRotation de ±10° y normalización con media y desviación de 0.5.

El conjunto de entrenamiento consta de 1.004 imágenes faciales de personas mayores: 854 para entrenamiento y 150 para test independiente. La composición combina una recolección primaria directa (grabaciones observacionales y sesiones guiadas de expresión con participantes mayores en Yakarta y Depok, Indonesia) y un subconjunto filtrado por edad (≥ 60 años) de los datasets UTKFace y All-Age-Faces (AAF). No se documenta en la información disponible el uso de RLHF/DPO ni de técnicas de decodificación especulativa o atención lineal; es un fine-tuning supervisado de clasificación.

## Capacidades

- Clasificación de expresiones faciales en 5 clases: Angry, Fear, Happy, Neutral, Sad.
- Especialización en rostros de personas mayores (60+), incluyendo patrones de afecto sutil afectados por el envejecimiento cutáneo y muscular.
- Procesamiento de imágenes RGB a 224 × 224 píxeles mediante el pipeline estándar de `transformers` (`AutoModelForImageClassification`).
- Salida de logits por clase y probabilidades vía softmax, apta para umbrales y análisis de confianza.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No dispone de modo thinking, visión de documentos, audio ni capacidades multilingües más allá de la etiqueta de idioma `en` del repositorio.
- Modelo complementario de audio (1D-CNN) disponible en el mismo perfil para construir un sistema multimodal.

## Casos de uso

- Monitorización del bienestar emocional en residencias geriátricas: el modelo puede clasificar el estado afectivo aparente de residentes a partir de capturas faciales, aprovechando su especialización en rostros envejecidos para reducir falsos negativos en emociones como tristeza o miedo.
- Investigación en gerontología y psicología del envejecimiento: sirve como extractor de etiquetas emocionales en estudios observacionales con población mayor, donde los modelos generalistas (FER2013, AffectNet) presentan sesgo de edad.
- Sistemas de alerta temprana de malestar: integrado en una cámara de seguimiento, puede detectar patrones sostenidos de tristeza o miedo en personas mayores y disparar una revisión del cuidador.
- Evaluación de terapias asistidas con animales o actividades recreativas: permite medir cuantitativamente el cambio en la expresión facial antes y después de una intervención, con métricas por clase (precisión, recall, F1).
- Teleasistencia y videollamadas con familiares: análisis en tiempo real del afecto facial como señal auxiliar para que el operador adapte la conversación o active protocolos de acompañamiento.
- Complemento multimodal con el modelo de audio del mismo autor: combinando la rama visual (ViT) y la rama acústica (1D-CNN) se puede construir un sistema de detección emocional en mayores que fusione ambas modalidades.
- Investigación comparativa de arquitecturas: el modelo y sus resultados sirven como referencia para estudiar por qué ViT supera a ResNet-50, DenseNet-121 y EfficientNet-B0 en este dominio concreto.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (métricas no verificadas por un tercero):

| Modelo | Backbone / preentrenamiento | Test accuracy | Macro F1 | Brecha vs ViT |
|---|---|---|---|---|
| ViT-base-patch16 (este modelo) | ImageNet-21k | 92,00 % | 0,92 | línea base |
| ResNet-50 | ImageNet-1k | 59,00 % | 0,58 | −33,00 pp |
| DenseNet-121 | ImageNet-1k | 57,00 % | 0,56 | −35,00 pp |
| EfficientNet-B0 | ImageNet-1k | 51,00 % | 0,49 | −41,00 pp |

Métricas por clase del ViT:

| Emoción | Precisión | Recall | F1 |
|---|---|---|---|
| Happy | 1,00 | 1,00 | 1,00 |
| Neutral | 0,88 | 1,00 | 0,94 |
| Sad | 0,85 | 0,97 | 0,91 |
| Fear | 0,90 | 0,90 | 0,90 |
| Angry | 1,00 | 0,73 | 0,85 |
| Media macro | 0,93 | 0,92 | 0,92 |

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,35 GB de pesos (86 M de parámetros); con activaciones y batch pequeño, por debajo de 1 GB.
- En fp16/bf16: aproximadamente 0,17 GB de pesos; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: RTX 3060, RTX 4060, RTX 4090, A100 o H100; el modelo es pequeño y no requiere GPU de datacenter, pero se beneficia de ella para lotes grandes.
- Cabe en GPU consumer de gama baja e incluso en CPU para inferencia puntual (latencia mayor).
- Opciones de despliegue: `transformers` + PyTorch (nativo), TorchServe, TGI (Text Generation Inference no aplica; usar pipelines de visión), ONNX Runtime tras exportación, y `optimum` para aceleración. No se documenta soporte GGUF/llama.cpp en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Entrada | Clases | Licencia | Especialización |
|---|---|---|---|---|---|
| vit-base-elderly-emotion-recognition | 85,8 M | 224×224 RGB | 5 emociones | Apache 2.0 | Personas mayores (60+) |
| ResNet-50 (FER genérico) | ~25 M | 224×224 RGB | 7 emociones típicas | variable | Población general |
| EfficientNet-B0 (FER genérico) | ~5 M | 224×224 RGB | 7 emociones típicas | variable | Población general |
| DenseNet-121 (FER genérico) | ~8 M | 224×224 RGB | 7 emociones típicas | variable | Población general |

La comparación directa con modelos de la misma categoría (reconocimiento facial de emociones en mayores) no está disponible en la información proporcionada; los tres modelos CNN citados son los que el propio autor empleó como referencia en su tesis y sobre los que reporta la brecha de rendimiento.

## Limitaciones y advertencias

- El conjunto de test es muy pequeño (150 imágenes) y procede de una única recolección geográfica (Yakarta y Depok, Indonesia); la generalización a otras poblaciones y etnias no está validada.
- Las métricas (92 % accuracy, 0,92 F1) están declaradas por el autor y marcadas como `verified: false`; no han pasado una revisión independiente.
- Solo cubre 5 emociones; no distingue emociones como sorpresa, disgusto o desprecio, habituales en otros esquemas FER.
- La clase Angry presenta el recall más bajo (0,73) pese a una precisión de 1,00, lo que indica falsos negativos en esa emoción.
- Riesgo de alucinación no aplica (no es generativo), pero sí de clasificación errónea en rostros con oclusiones, gafas, mascarillas, iluminación adversa o ángulos no frontales.
- Sesgo potencial por la composición del dataset (predominantemente indonesio y con sujetos de 60+); el rendimiento en otros grupos de edad no está documentado.
- Uso comercial permitido por Apache 2.0, pero conviene revisar implicaciones éticas y legales del reconocimiento emocional en personas vulnerables (RGPD, consentimiento informado, contextos sanitarios).
- No hay datos publicados de calibración, robustez adversarial ni evaluación en condiciones reales de producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pelikrapael/vit-base-elderly-emotion-recognition
- Modelo complementario de audio (1D-CNN): https://huggingface.co/pelikrapael/audio-cnn-elderly-emotion-recognition
- Modelo base: https://huggingface.co/google/vit-base-patch16-224-in21k
- Dataset UTKFace (referencia citada por el autor): https://susanqq.github.io/UTKFace/
- Dataset All-Age-Faces (AAF): citado por el autor, sin URL explícita en la información disponible
- Paper o blog del modelo: no disponible en la información proporcionada (solo referencia a la tesis de grado de la Universidad Gunadarma, 2025)
