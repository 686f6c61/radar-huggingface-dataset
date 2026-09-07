# Shota2811/HackHeritage26-threat-v7

## Resumen

El modelo HackHeritage26-threat-v7, desarrollado por Shota2811, es un clasificador binario de texto diseñado para detectar amenazas e intimidación. Se trata de un fine-tuning del modelo Google MuRIL base cased, un transformer de la familia BERT con 237.557.762 parámetros. El modelo está pensado para integrarse en la capa de percepción del sistema de seguridad multimodal HackHeritage26, proporcionando una señal de clasificación entre las etiquetas `NOT_THREAT` y `THREAT`.

Su relevancia radica en ofrecer una detección rápida y ligera de lenguaje hostil, aunque el propio autor advierte de que no debe utilizarse como un decisor autónomo en contextos de seguridad reales. En la información disponible no se especifica la longitud de contexto ni los idiomas soportados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (BERT), basado en google/muril-base-cased |
| Parámetros totales | 237.557.762 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `google/muril-base-cased`, un modelo BERT de Google, para la tarea de clasificación binaria de amenazas e intimidación. Las etiquetas de salida son `NOT_THREAT` y `THREAT`. No se dispone de información sobre el dataset de entrenamiento, el número de tokens procesados, la composición del corpus ni si se aplicaron técnicas como RLHF o DPO. Tampoco se mencionan innovaciones técnicas destacables, ya que se trata de un fine-tuning estándar sobre una arquitectura BERT existente.

La evaluación publicada por el autor se realizó sobre un conjunto de test de 78 ejemplos, con los resultados que se detallan en la sección de benchmarks.

## Capacidades

- Clasificación binaria de texto: distingue entre `NOT_THREAT` y `THREAT`.
- No soporta generación de texto, razonamiento, código, matemáticas, visión ni audio.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingües no especificadas; el modelo base MuRIL es multilingüe, pero no se confirma en la documentación de esta ficha.
- No dispone de modos especiales (thinking mode, visión, audio, etc.). Es un clasificador de texto puro.

## Casos de uso

- Moderación de contenido en comunidades online: el modelo puede analizar comentarios y publicaciones en tiempo real, marcando aquellos que contengan amenazas o intimidación para que un moderador humano los revise. Es adecuado por su baja latencia y su clasificación binaria simple.
- Detección de acoso en plataformas educativas: integrarlo en sistemas de mensajería escolar para alertar a tutores de posibles casos de bullying. El modelo puede procesar mensajes cortos de forma rápida y señalar los que requieran intervención.
- Triaje de denuncias en centros de seguridad ciudadana: clasificar reportes ciudadanos como amenaza o no amenaza para priorizar la atención. Su uso como señal de percepción dentro de un sistema mayor permite filtrar casos urgentes.
- Monitorización de comunicaciones corporativas: analizar correos y chats internos para detectar lenguaje hostil y prevenir conflictos laborales. El modelo puede ejecutarse en pipelines de análisis de texto con un coste computacional reducido.
- Filtrado de comentarios en juegos online y streaming: bloquear automáticamente mensajes tóxicos en el chat. Al ser un clasificador binario, se puede integrar fácilmente en sistemas de moderación automática.
- Análisis de mensajes en aplicaciones de citas y redes sociales: alertar a usuarios de posibles amenazas o intimidación en mensajes privados. El modelo puede actuar como una capa de seguridad adicional, dejando la decisión final a un sistema de revisión humana.

## Benchmarks y rendimiento

El autor publicó los siguientes resultados sobre un conjunto de test de 78 ejemplos:

| Métrica | Valor |
|---|---|
| Accuracy | 96,15% |
| Precision | 100,00% |
| Recall | 92,31% |
| F1 | 96,00% |

Matriz de confusión:

| | Predicted NOT_THREAT | Predicted THREAT |
|---|---|---|
| Actual NOT_THREAT | 39 | 0 |
| Actual THREAT | 3 | 36 |

No se han publicado comparativas con otros modelos en la información disponible. El tamaño del conjunto de test es pequeño, por lo que las métricas deben interpretarse con cautela.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP32, los pesos ocupan aproximadamente 950 MB; con activaciones y overhead, se recomienda al menos 2 GB de VRAM. En FP16, el peso se reduce a unos 475 MB, y en INT8 a unos 237 MB, aunque no se especifican cuantizaciones soportadas.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM, como NVIDIA GTX 1660, RTX 2060, RTX 3060 o superiores. También es viable la inferencia en CPU para aplicaciones con requisitos de latencia moderados.
- ¿Cabe en GPU consumer? Sí, es un modelo BERT base de tamaño medio.
- Opciones de despliegue: pipeline de transformers, vLLM para clasificación de texto, Hugging Face TGI, ONNX Runtime o Hugging Face Inference Endpoints.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

En la información proporcionada no se incluyen comparativas con modelos similares. El modelo base `google/muril-base-cased` es la referencia inmediata; otras alternativas de la misma categoría (clasificación de texto con arquitectura BERT) incluyen modelos como `bert-base-multilingual-cased` o `xlm-roberta-base`, pero no se dispone de datos de rendimiento comparables en la documentación del modelo.

## Limitaciones y advertencias

- El modelo no es un decisor autónomo, según el propio autor; debe usarse como señal de percepción dentro de un sistema mayor.
- El conjunto de evaluación es pequeño (78 ejemplos), por lo que las métricas, especialmente la precisión del 100%, pueden no generalizar bien a otros datos.
- La precisión perfecta en la clase `NOT_THREAT` sugiere un posible sobreajuste o un desbalance en los datos de test.
- No se dispone de información sobre sesgos, idiomas soportados ni licencia.
- La longitud de contexto no está documentada, por lo que el comportamiento con textos largos es desconocido.
- Riesgo de falsos positivos o falsos negativos en situaciones ambiguas; se recomienda revisión humana en aplicaciones críticas.
- No se han publicado estudios de robustez frente a ataques adversarios, parafraseo o variaciones de lenguaje.

## Enlaces

- https://huggingface.co/Shota2811/HackHeritage26-threat-v7
- Modelo base: https://huggingface.co/google/muril-base-cased
- No se han encontrado otros enlaces relevantes en la búsqueda web.
