# incruit-navi/ko-blind-ner-v2.1

## Resumen

El modelo `incruit-navi/ko-blind-ner-v2.1` es un ajuste fino (fine-tune) de `klue/roberta-large` para la tarea de reconocimiento de entidades nombradas (NER) en texto coreano. Ha sido desarrollado por el equipo de Incruit Navi, una marca de inteligencia artificial del portal de empleo surcoreano Incruit, orientada a la automatización de procesos de reclutamiento y gestión de carrera profesional. El modelo está diseñado para clasificar tokens en etiquetas de entidades, presumiblemente para extraer información estructurada de currículos, ofertas de empleo u otros documentos relacionados con el ámbito laboral.

Con 335,6 millones de parámetros, se basa en la arquitectura RoBERTa-large, un transformer encoder de 24 capas con atención de 16 cabezas y una dimensión oculta de 1024. El contexto máximo típico de RoBERTa-large es de 512 tokens, aunque este dato no se especifica explícitamente en la ficha del modelo. El repositorio contiene únicamente pesos en formato safetensors y está etiquetado como compatible con la librería Transformers de Hugging Face.

La relevancia de este modelo radica en su especialización para el idioma coreano, un ámbito con menos recursos abiertos que el inglés. Sin embargo, los resultados de evaluación publicados en la model card muestran métricas de precisión, recall y F1 iguales a cero, lo que sugiere que el modelo no está prediciendo correctamente las entidades en el conjunto de evaluación. Esta circunstancia debe tenerse muy en cuenta antes de considerar su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa-large (Transformer encoder) |
| Parametros totales | 335.632.409 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base klue/roberta-large soporta 512 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | coreano (inferido por el nombre y el modelo base, no declarado) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune de `klue/roberta-large`, un transformer encoder preentrenado en el corpus KLUE, un conjunto de datos coreano de amplio espectro. La arquitectura es la estándar de RoBERTa-large: 24 capas, 16 cabezas de atención, dimensión oculta de 1024 y aproximadamente 335 millones de parámetros. La tarea de ajuste es clasificación de tokens (token classification), con una cabeza de clasificación lineal sobre las representaciones contextuales de cada token.

El entrenamiento se realizó con el framework Transformers de Hugging Face, utilizando un optimizador Adam (betas 0.9/0.999, epsilon 1e-08), una tasa de aprendizaje de 3e-05, tamaño de lote de 8, programador de tasa lineal y 15 épocas. El conjunto de datos de entrenamiento se indica como "None" en la model card, lo que significa que no se ha documentado públicamente. La pérdida de validación final fue de 0.0593, pero las métricas de precisión, recall y F1 son todas 0.0, mientras que la exactitud (accuracy) alcanza 0.9931. Esta combinación indica que el modelo clasifica casi todos los tokens como "no entidad" (clase mayoritaria), por lo que no está aprendiendo a reconocer entidades reales.

No se menciona el uso de técnicas como RLHF, DPO o decodificación especulativa. Tampoco se detalla la composición del dataset ni el número total de tokens de entrenamiento.

## Capacidades

- Reconocimiento de entidades nombradas (NER) en coreano: el modelo está diseñado para etiquetar tokens con categorías como persona, organización, lugar, etc., aunque las métricas de evaluación sugieren que no está funcionando correctamente.
- Clasificación de tokens: pipeline de token-classification compatible con la librería Transformers.
- Procesamiento de texto coreano: al estar basado en klue/roberta-large, hereda el vocabulario y la tokenización específicos para coreano (subword tokenization con SentencePiece).
- No se han documentado capacidades adicionales como tool calling, agentes, razonamiento multi-paso, visión o audio.

## Casos de uso

Dado el estado de las métricas (precisión, recall y F1 nulos), no se recomienda utilizar este modelo en producción sin una evaluación exhaustiva previa. No obstante, si se lograra un ajuste adecuado, los casos de uso típicos para un NER coreano serían:

- Extracción de información de currículos: identificar nombres, empresas, títulos académicos y habilidades en documentos de candidatos para automatizar la preselección en portales de empleo.
- Procesamiento de ofertas de empleo: extraer requisitos, ubicación, salario y tipo de contrato de anuncios para alimentar motores de búsqueda y recomendación.
- Análisis de noticias y artículos coreanos: detectar entidades mencionadas (personas, organizaciones, lugares) para tareas de monitorización de marca o inteligencia competitiva.
- Construcción de bases de conocimiento: poblar grafos de conocimiento con entidades extraídas de textos legales, financieros o médicos en coreano.
- Asistencia en atención al cliente: identificar nombres de productos, números de pedido o datos de contacto en conversaciones escritas para enrutar consultas.
- Anonimización de datos: localizar y enmascarar entidades personales en documentos antes de su publicación o compartición.

En todos estos escenarios, el modelo solo sería adecuado si se corrigieran los problemas de entrenamiento que provocan las métricas nulas.

## Benchmarks y rendimiento

La model card no incluye una sección de benchmarks con resultados comparativos. El campo `model-index` está vacío. Sin embargo, el autor declara los siguientes resultados en el conjunto de evaluación durante el entrenamiento (última época):

| Metrica | Valor |
|---|---|
| Loss | 0.0593 |
| Precision | 0.0 |
| Recall | 0.0 |
| F1 | 0.0 |
| Accuracy | 0.9931 |

Estos valores indican que el modelo no predice ninguna entidad positiva en el conjunto de evaluación, lo que invalida su utilidad práctica para NER. La alta exactitud se debe al desequilibrio de clases (la mayoría de tokens son "O", es decir, no entidad). No se han publicado resultados en benchmarks externos como KLUE-NER, MUC-7 o CoNLL-2003.

## Requisitos de hardware

- VRAM estimada para inferencia: con 335 millones de parámetros en FP32, el modelo ocupa aproximadamente 1,34 GB solo en pesos. Con cuantización a 8 bits (int8) se reduciría a unos 0,67 GB, y a 4 bits a unos 0,34 GB. Sin embargo, no se han publicado archivos cuantizados.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar el modelo en FP32 (por ejemplo, NVIDIA GTX 1650, RTX 3050, T4). Para mayor velocidad, una RTX 3090 o A100 permitiría procesar lotes más grandes.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de gama media y baja gracias a su tamaño moderado.
- Opciones de despliegue: al ser un modelo de Transformers, puede servirse con vLLM, TGI, Hugging Face Inference Endpoints o mediante la API de `pipeline` de Transformers. También es posible exportarlo a ONNX para optimización.
- Latencia y throughput: no se han publicado datos específicos. En una GPU T4, se puede esperar una latencia de decenas de milisegundos por secuencia de 512 tokens, pero depende del hardware y del lote.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa rigurosa con otros modelos NER coreanos. El modelo base `klue/roberta-large` es un punto de referencia común, pero no se han publicado resultados de este fine-tune frente a alternativas como `klue/roberta-base` fine-tuneado en NER, `ETRI-ner` o modelos multilingües como `xlm-roberta-large`. Se recomienda consultar el leaderboard de KLUE para comparativas actualizadas.

## Limitaciones y advertencias

- Métricas de entidades nulas: precisión, recall y F1 son 0.0, lo que indica que el modelo no está aprendiendo a reconocer entidades. Su uso en producción es desaconsejable sin un reentrenamiento o ajuste adicional.
- Dataset de entrenamiento no documentado: la model card indica "None", por lo que se desconoce la procedencia, el tamaño y la calidad de los datos.
- Licencia no especificada: no se indica bajo qué términos se distribuye el modelo, lo que impide conocer si es apto para uso comercial.
- Idiomas no declarados: aunque el nombre sugiere coreano, no hay confirmación oficial.
- Sesgos potenciales: al ser un modelo entrenado sobre datos no documentados, podría heredar sesgos de género, edad o procedencia si los datos provienen de currículos u ofertas de empleo.
- Riesgo de alucinación: en tareas de NER, el riesgo se manifiesta como etiquetado incorrecto de tokens, lo que puede propagar errores en sistemas downstream.
- Contexto limitado: si se mantiene el límite de 512 tokens de RoBERTa-large, no es adecuado para documentos largos sin segmentación previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/incruit-navi/ko-blind-ner-v2.1
- Modelo base klue/roberta-large: https://huggingface.co/klue/roberta-large
- Sitio web de Incruit Navi: https://navi.incruit.com/
