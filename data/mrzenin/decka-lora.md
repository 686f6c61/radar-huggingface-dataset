# mrzenin/Decka-lora

## Resumen

Decka-lora es un adaptador LoRA de ajuste fino sobre el modelo base LiquidAI/LFM3-1.7B, desarrollado por el usuario mrzenin. El adaptador está entrenado específicamente para roleplay con razonamiento explícito: el modelo emite cadenas de pensamiento delimitadas por las etiquetas `<think>...</think>` antes de cada respuesta, lo que permite separar el proceso de razonamiento de la salida final en aplicaciones conversacionales y agenticas.

El repositorio contiene únicamente el adaptador LoRA (0,1 GB), no los pesos completos del modelo. Según la model card, el ajuste se realizó con r=32, alpha=64, dropout=0,05 y target `all-linear`, durante 1 época con una tasa de aprendizaje de 1e-4, longitud máxima de 4096 tokens y precisión fp16 sobre una GPU Tesla T4, aplicando pérdida solo sobre los turnos del asistente. El autor declara que el modelo está entrenado para uso agentico, razonamiento y código.

Es relevante ahora porque combina un modelo base compacto (1.7B parámetros) con un patrón de razonamiento explícito y un caso de uso concreto (roleplay), lo que permite desplegar conversaciones con trazas de pensamiento en hardware modesto. No obstante, el adaptador tiene cero descargas y cero likes en el momento de la consulta, y no se han publicado evaluaciones formales ni datos de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre transformer LiquidAI/LFM3-1.7B |
| Parametros totales | no disponible (el adaptador LoRA; el modelo base tiene 1.7B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 4096 tokens (longitud máxima de entrenamiento; contexto del modelo base no disponible) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; cuantización aplicable al modelo base) |
| Idiomas soportados | no disponible |
| Licencia | lfm-open-license-v1.0 (heredada del modelo base) |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre LiquidAI/LFM3-1.7B, un transformer de 1.7B parámetros del que no se detallan en la información disponible las características internas (número de capas, dimensión oculta, mecanismo de atención o datos de preentrenamiento). El ajuste fino emplea LoRA con rango 32, alpha 64, dropout 0,05 y módulos objetivo `all-linear`, lo que significa que se adaptan todas las capas lineales del modelo base.

El entrenamiento se realizó durante 1 época con tasa de aprendizaje 1e-4, longitud máxima de secuencia de 4096 tokens y precisión fp16 sobre una Tesla T4, con pérdida calculada únicamente sobre los turnos del asistente (assistant-only loss). El dataset utilizado es mrzenin/Decka-Only, del que no se dispone de información sobre tamaño, composición ni proceso de anotación. No se documenta el uso de RLHF, DPO ni otras técnicas de alineación posteriores al ajuste supervisado. La innovación destacable es el formato de razonamiento explícito con etiquetas `<think>`, que permite al consumidor separar la traza de razonamiento de la respuesta final.

## Capacidades

- Generación de texto conversacional orientada a roleplay, con trazas de razonamiento explícitas en `<think>...</think>` antes de cada respuesta.
- Razonamiento multi-paso mediante cadenas de pensamiento visibles y separables de la salida final.
- Generación de código, según declara el autor en la model card.
- Uso agentico, según declara el autor, aunque no se especifican detalles de soporte de tool calling ni de function calling.
- Soporte de conversaciones multi-turno con pérdida calculada solo sobre turnos del asistente, lo que favorece la coherencia en diálogos.
- Capacidades multilingües: no disponibles; no se documentan idiomas soportados.
- No se documentan capacidades de visión, audio ni modo de pensamiento configurable más allá del formato `<think>`.

## Casos de uso

- Roleplay conversacional con personajes persistentes: el adaptador está entrenado específicamente para este dominio y el formato `<think>` permite inspeccionar el razonamiento del personaje antes de responder, útil para depurar incoherencias de personalidad en conversaciones largas.
- Prototipado de agentes conversacionales en hardware modesto: al ser un adaptador sobre un modelo de 1.7B, puede ejecutarse en una GPU de consumo y servir como banco de pruebas para lógicas de agente antes de escalar a modelos mayores.
- Generación de diálogos con trazabilidad de razonamiento: en entornos de investigación, la separación entre `<think>` y respuesta permite analizar cómo el modelo llega a una respuesta sin modificar el prompt ni el modelo base.
- Asistentes de escritura creativa y narrativa interactiva: el ajuste en roleplay y el contexto de 4096 tokens permiten mantener escenas multi-turno con memoria de la conversación reciente.
- Experimentación académica con LoRA y cadenas de pensamiento: el adaptador es un caso reproducible de ajuste con r=32, alpha=64 y target `all-linear` sobre un modelo de 1.7B, útil para comparar configuraciones de LoRA en tareas de razonamiento.
- Evaluación de modelos base compactos para código y razonamiento: el autor declara entrenamiento para código y uso agentico, por lo que puede emplearse como punto de partida en pipelines de generación de código asistida, siempre con validación humana.
- Despliegue en entornos con recursos limitados: al requerir únicamente el adaptador sobre el modelo base, el coste de almacenamiento y de carga es bajo (0,1 GB de adaptador), lo que facilita su integración en servicios de inferencia pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un modelo base de 1.7B en fp16 se estiman del orden de 3,5-4 GB solo para pesos, más overhead de contexto y activaciones; en cuantización de 4 bits el modelo base podría ocupar alrededor de 1-1,5 GB, aunque estas cifras son estimaciones y no datos publicados.
- GPU recomendadas: el adaptador se entrenó en una Tesla T4, lo que indica que la inferencia es viable en GPUs de gama media; no se especifican GPU recomendadas para producción.
- GPU de consumo: previsiblemente cabe en GPUs de consumo con al menos 8 GB de VRAM (por ejemplo, RTX 3060, RTX 4060, RTX 4070), aunque no se confirma en la información disponible.
- Opciones de despliegue: transformers (librería declarada); el adaptador LoRA puede combinarse con el modelo base y servirse con frameworks compatibles como vLLM, TGI o llama.cpp tras la fusión y conversión a GGUF, aunque no se documenta soporte explícito en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Decka-lora (este) | Adaptador sobre 1.7B | 4096 (entrenamiento) | LoRA + `<think>` | lfm-open-license-v1.0 | Hugging Face, 0 descargas |
| LiquidAI/LFM3-1.7B (base) | 1.7B | no disponible | Transformer | lfm-open-license-v1.0 | Hugging Face |
| Alternativas de roleplay de 1-2B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre este adaptador y otras alternativas de la misma categoría, por lo que la comparativa se limita a parámetros, contexto y licencia.

## Limitaciones y advertencias

- El repositorio contiene solo el adaptador LoRA; es necesario descargar y cargar el modelo base LiquidAI/LFM3-1.7B para su uso.
- No se han publicado benchmarks ni evaluaciones formales; el rendimiento real en roleplay, código o tareas agenticas no está verificado de forma independiente.
- Riesgo de alucinación inherente a modelos de 1.7B, especialmente en tareas de razonamiento complejo y código; las trazas `<think>` no garantizan corrección.
- Sesgos conocidos: no documentados; al no especificarse la composición del dataset Decka-Only, no es posible evaluar sesgos de dominio, género o idioma.
- Idiomas soportados no documentados; el comportamiento multilingüe es incierto.
- Contexto de entrenamiento limitado a 4096 tokens; conversaciones más largas pueden degradar la coherencia.
- Licencia lfm-open-license-v1.0: es una licencia "other" que puede imponer restricciones al uso comercial; el autor advierte de revisar los términos del dataset antes de un uso comercial.
- El adaptador tiene cero descargas y cero likes, sin validación por parte de la comunidad.
- No se documenta soporte de tool calling ni de function calling, pese a la orientación agentica declarada.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/mrzenin/Decka-lora
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Dataset de entrenamiento: https://huggingface.co/datasets/mrzenin/Decka-Only
- Licencia LFM Open License v1.0: no disponible en la información proporcionada
