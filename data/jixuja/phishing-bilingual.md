# Jixuja/phishing-bilingual

## Resumen

Jixuja/phishing-bilingual es un modelo de clasificación de texto publicado en Hugging Face por el usuario Jixuja. Según los metadatos del repositorio, se trata de un modelo basado en la arquitectura DistilBERT (tag `distilbert`), con 135.326.210 parámetros totales y pesos en formato safetensors. El nombre sugiere un fine-tuning orientado a la detección de phishing en dos idiomas, aunque la model card no confirma ni detalla esta finalidad: es una plantilla autogenerada por Hugging Face sin contenido sustantivo.

El modelo se distribuye a través de la librería transformers y está etiquetado como compatible con Text Embeddings Inference y endpoints, lo que indica que puede desplegarse como servicio de inferencia. El repositorio ocupa 0,5 GB y no registra descargas ni likes en el momento de la consulta, lo que apunta a una publicación reciente y sin validación comunitaria.

La relevancia de esta ficha es limitada por la ausencia de documentación: no hay información sobre datos de entrenamiento, idiomas concretos, licencia ni evaluación. Cualquier uso en producción debería ir precedido de una validación independiente del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT (transformer encoder, destilado de BERT) |
| Parametros totales | 135.326.210 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (DistilBERT admite hasta 512 tokens por convención, no confirmado por el autor) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el nombre sugiere bilingüe, sin especificar idiomas) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es DistilBERT, una versión destilada de BERT con aproximadamente la mitad de parámetros que BERT-base (110 M frente a 66 M en el original; aquí el recuento es de 135 M, lo que sugiere una cabeza de clasificación y posiblemente un vocabulario o configuración distintos). Es un transformer encoder bidireccional orientado a tareas de comprensión, no a generación.

No hay información disponible sobre el proceso de entrenamiento: ni el número de tokens, ni la composición del dataset, ni si se aplicaron técnicas de ajuste fino supervisado, RLHF o DPO. La model card es una plantilla estándar de Hugging Face sin rellenar, por lo que todos los apartados de datos, hiperparámetros y evaluación figuran como "[More Information Needed]".

## Capacidades

- Clasificación de texto: el pipeline declarado es `text-classification`, por lo que el modelo emite etiquetas con puntuaciones de confianza sobre una entrada de texto.
- Detección de phishing: el nombre del modelo sugiere esta tarea, aunque no está documentada por el autor.
- Soporte bilingüe: presumiblemente por el sufijo "bilingual", sin especificación de qué par de idiomas.
- Tool calling / function calling: no disponible.
- Razonamiento multi-paso y agentes: no aplicable a un encoder de clasificación.
- Generación de texto: no soportada (no es un modelo causal).
- Capacidades multimodales: no disponibles.

## Casos de uso

- Filtrado de correos de phishing: el modelo podría clasificar correos entrantes como sospechosos o legítimos, integrándose en una pasarela de correo. Requiere validación previa con datos propios, dado que no hay métricas publicadas.
- Moderación de formularios y mensajes: clasificación de textos enviados por usuarios para detectar intentos de ingeniería social en plataformas web.
- Análisis de URLs y mensajes SMS: detección de mensajes de smishing en un pipeline de seguridad, siempre que el modelo haya sido entrenado con ese tipo de datos (no confirmado).
- Enriquecimiento de alertas SOC: etiquetado automático de tickets o alertas de seguridad para priorizar la revisión humana.
- Investigación en detección de phishing bilingüe: uso como baseline o punto de partida para fine-tuning adicional en un entorno académico.
- Despliegue como microservicio: gracias a la compatibilidad con Text Embeddings Inference y endpoints, puede servirse con baja latencia en infraestructura modesta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP32, aproximadamente 0,54 GB para los pesos (135 M × 4 bytes); en FP16, unos 0,27 GB. Con overhead de activaciones y batch pequeño, cabe holgadamente en 1-2 GB de VRAM.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) o incluso CPU para batch pequeño. No requiere A100 ni H100.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU con más de 2 GB de VRAM, y también en CPU.
- Opciones de despliegue: transformers, Text Embeddings Inference (declarado compatible), endpoints de Hugging Face, ONNX Runtime y potencialmente llama.cpp no aplica (no es un modelo generativo).
- Latencia y throughput: no disponibles; para un DistilBERT de 135 M se espera un throughput alto (cientos o miles de inferencias por segundo en GPU), pero es una estimación general no confirmada por el autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jixuja/phishing-bilingual | 135 M | no disponible | Clasificación de texto (phishing, presumiblemente) | no disponible | Hugging Face |
| distilbert-base-uncased | 66 M | 512 tokens | Clasificación / embeddings | Apache 2.0 | Hugging Face |
| bert-base-uncased | 110 M | 512 tokens | Clasificación / embeddings | Apache 2.0 | Hugging Face |
| phishing-detection (modelos comunitarios) | variable | variable | Detección de phishing | variable | Hugging Face |

La comparación es aproximada: no hay datos de rendimiento del modelo evaluado, y los modelos de referencia no están especializados en phishing.

## Limitaciones y advertencias

- Ausencia total de documentación: la model card es una plantilla vacía; no se conocen datos de entrenamiento, sesgos, idiomas ni métricas.
- Licencia no especificada: no se puede garantizar el uso comercial; conviene contactar con el autor antes de desplegarlo en producción.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de falsos positivos y falsos negativos en la clasificación, sin tasas conocidas.
- Idiomas no confirmados: el sufijo "bilingual" no especifica el par de idiomas; el rendimiento fuera de ese par es desconocido.
- Sin validación comunitaria: cero descargas y cero likes; no hay evidencia de uso o revisión por terceros.
- Fecha de creación futura (2026-11-28) en los metadatos, lo que puede indicar un error de registro o una publicación programada; conviene verificar la integridad del repositorio.
- No apto para decisiones de seguridad automatizadas sin supervisión humana, dado el riesgo de falsos negativos en un dominio sensible como el phishing.

## Enlaces

- Hugging Face: https://huggingface.co/Jixuja/phishing-bilingual
- Paper de referencia de DistilBERT (citado en los tags): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental citada en la model card: https://mlco2.github.io/impact
- Lacoste et al. (2019): https://arxiv.org/abs/1910.09700
