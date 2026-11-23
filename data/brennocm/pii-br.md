# brennocm/PII-BR

## Resumen

PII-BR es un modelo de clasificación de tokens (token classification) publicado en Hugging Face por el usuario brennocm bajo el identificador `brennocm/PII-BR`. Por su nombre y pipeline, está orientado a la detección de información personal identificable (PII) en textos en portugués de Brasil, una tarea de etiquetado a nivel de token (NER y variantes) donde cada fragmento de texto se clasifica con una categoría como nombre, documento, dirección o teléfono.

El modelo es un BERT clásico de aproximadamente 108 millones de parámetros (108.347.155 según los pesos en safetensors), lo que lo sitúa en la categoría de los modelos encoder de tamaño base. Se distribuye en formato safetensors y es compatible con la librería transformers y con endpoints de inferencia compatibles. El repositorio ocupa unos 0,4 GB, coherente con un checkpoint BERT base en punto flotante de 32 bits.

La relevancia de este tipo de modelo es práctica: la detección automática de PII es un componente habitual en pipelines de cumplimiento normativo (RGPD/LGPD), anonimización de datos y filtrado previo en aplicaciones que procesan texto de usuarios. Sin embargo, la model card está generada automáticamente y no documenta datos de entrenamiento, evaluación ni licencia, por lo que cualquier uso en producción exige validación propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (encoder transformer), según el tag `bert` del repositorio |
| Parametros totales | 108.347.155 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (los modelos BERT base suelen usar 512 tokens, pero no se confirma en la información) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; admite cuantización estándar de transformers, pero no se documenta) |
| Idiomas soportados | no disponible (el identificador sugiere portugués de Brasil, pero no se confirma) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible indica únicamente que se trata de un modelo BERT con 108 millones de parámetros y cabecera de clasificación de tokens. No se especifican el número de capas, la dimensión oculta ni el número de cabezas de atención, aunque el recuento de parámetros es consistente con la configuración estándar de BERT base (12 capas, 768 de dimensión oculta, 12 cabezas de atención).

No hay información sobre el corpus de entrenamiento, el número de tokens procesados, la composición del dataset, el esquema de etiquetas (BIO/BILUO), si se partió de un checkpoint preentrenado en portugués (por ejemplo, BERTimbau) ni si se aplicaron técnicas de ajuste fino supervisado. Tampoco se documentan hiperparámetros, régimen de precisión ni duración del entrenamiento. La model card es la plantilla automática de Hugging Face con todos los campos marcados como "[More Information Needed]".

## Capacidades

- Clasificación de tokens a nivel de fragmento de texto, típicamente para reconocimiento de entidades nombradas (NER) orientado a PII.
- Detección potencial de entidades como nombres de personas, documentos de identidad, direcciones, teléfonos o correos electrónicos, a partir del nombre del modelo y del pipeline declarado (no confirmado en la documentación).
- Integración nativa con la pipeline `token-classification` de transformers.
- Compatibilidad con endpoints de inferencia (tag `endpoints_compatible`).
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling ni modo de pensamiento: es un modelo encoder de clasificación, no un modelo generativo.
- Capacidades multilingües: no disponibles; el identificador apunta a portugués de Brasil, sin confirmación oficial.

## Casos de uso

- Anonimización de datos en pipelines de cumplimiento (LGPD/RGPD): el modelo puede etiquetar fragmentos con PII en textos en portugués para sustituirlos por marcadores antes de almacenar o compartir los datos. Es adecuado por su tamaño reducido y su naturaleza de clasificador de tokens.
- Filtrado previo en logs y formularios: integrado como paso de preprocesado, permite detectar y enmascarar datos personales en registros de aplicaciones antes de enviarlos a sistemas de analítica.
- Enriquecimiento de datasets para entrenamiento: sirve para etiquetar corpus en portugués con entidades PII y construir datasets anonimizados o de evaluación de privacidad.
- Moderación y auditoría de contenido: detección de datos personales en textos enviados por usuarios en foros, chats o tickets de soporte, para su revisión o redacción automática.
- Preprocesado en sistemas de atención al cliente: antes de pasar una conversación a un modelo generativo o a un sistema de ticketing, el clasificador puede marcar los fragmentos con datos sensibles.
- Investigación en privacidad y NLP: modelo de referencia ligero para experimentos de detección de PII en portugués, con requisitos de hardware modestos y despliegue sencillo.
- Extracción de entidades estructuradas: uso como base para poblar bases de datos a partir de texto libre (por ejemplo, extraer documentos o direcciones de correos y formularios).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, alrededor de 0,4-0,5 GB para los pesos, más overhead de activaciones; en fp16, en torno a 0,2-0,25 GB. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; RTX 3060, RTX 4060, RTX 4090, T4, A10, A100 o H100 funcionan sin problema, aunque el modelo está sobredimensionado para GPUs de gama alta.
- Cabe en GPU consumer: sí, en prácticamente todas las GPU dedicadas modernas e incluso en CPU para lotes pequeños.
- Opciones de despliegue: transformers (pipeline `token-classification`), Text Generation Inference no aplica (no es generativo), vLLM no es la opción natural para un encoder de clasificación, ONNX Runtime y TorchScript son alternativas razonables; también puede servirse mediante endpoints de Hugging Face.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Por el tamaño del modelo, se espera un throughput alto en GPU y aceptable en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| brennocm/PII-BR | 108,3 M | no disponible | Clasificación de tokens (PII) | no disponible | Hugging Face |
| BERTimbau base (neuralmind) | ~110 M | 512 tokens (estándar BERT) | Encoder de propósito general en portugués | no disponible en esta ficha | Hugging Face |
| bert-base-multilingual-cased | ~178 M | 512 tokens (estándar BERT) | Encoder multilingüe de propósito general | Apache 2.0 (según el modelo original) | Hugging Face |
| Modelos NER específicos para PII en portugués | variable | variable | NER/PII | variable | Hugging Face |

La comparación se limita a la arquitectura y el tamaño, ya que no hay datos de rendimiento publicados para PII-BR ni información detallada de los alternativas en esta ficha. No se dispone de benchmarks que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- La model card no documenta sesgos, datos de entrenamiento ni evaluación; no hay garantías sobre la cobertura de entidades PII ni sobre su precisión.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de falsos positivos y falsos negativos en la clasificación de entidades, con impacto directo en tareas de anonimización.
- Limitaciones de contexto e idioma no documentadas; el identificador sugiere portugués de Brasil, pero no se confirma ni se detalla el dominio.
- Licencia no disponible: no se puede asumir uso comercial permitido; es necesario contactar con el autor o verificar el repositorio antes de usarlo en producción.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria ni evidencia de uso real.
- Fecha de creación indicada como 2026-11-23, posterior a la fecha habitual de consulta; conviene verificar la integridad y procedencia del repositorio.
- Para cumplimiento normativo (LGPD/RGPD), un clasificador de PII debe auditarse con datos propios y complementarse con reglas y revisión humana; no debe ser el único mecanismo de anonimización.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/brennocm/PII-BR
- Paper de referencia citado en los tags (Machine Learning Impact calculator, Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto medioambiental: https://mlco2.github.io/impact#compute
