# canbingol/qwen2.5-3B-Instruct-tool-call-en-mixed-when2call

## Resumen

El modelo `canbingol/qwen2.5-3B-Instruct-tool-call-en-mixed-when2call` es un ajuste fino (fine-tune) del modelo base `Qwen/Qwen2.5-3B-Instruct`, desarrollado por el usuario canbingol. Está diseñado específicamente para mejorar la capacidad de llamada a herramientas (tool calling) en inglés, mediante un entrenamiento supervisado (SFT) realizado con la librería TRL de Hugging Face. El nombre sugiere que el entrenamiento combina datos mixtos en inglés con una estrategia de decisión "cuándo llamar" a una herramienta, aunque no se proporcionan detalles sobre el dataset utilizado.

Con 3.000 millones de parámetros, este modelo pertenece a la categoría de modelos pequeños, lo que lo hace atractivo para despliegues en entornos con recursos limitados. Al estar basado en Qwen2.5-3B-Instruct, hereda la arquitectura transformer decoder-only de Qwen, que soporta un contexto de hasta 128.000 tokens en su versión original, aunque el fine-tune no documenta explícitamente esta capacidad. La relevancia actual radica en que permite añadir funcionalidad de tool calling a un modelo compacto, facilitando su integración en agentes y asistentes que requieren interacción con APIs y herramientas externas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) |
| Parametros totales | 3.000 millones (3B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base soporta 128K, pero el fine-tune no lo documenta) |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponible (el modelo base es multilingue, pero el fine-tune no especifica) |
| Licencia | no disponible (la model card indica "licence: license", sin detalle) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune del checkpoint `Qwen/Qwen2.5-3B-Instruct`, realizado mediante entrenamiento supervisado (SFT) con la librería TRL (versión 1.10.0) y el framework Transformers (versión 5.13.1). No se proporcionan detalles sobre el dataset de entrenamiento, el número de tokens utilizados ni si se aplicaron técnicas adicionales como RLHF o DPO. La única información disponible es que el entrenamiento se realizó con SFT y que el modelo está etiquetado con `generated_from_trainer`, lo que indica que se usó el flujo estándar de entrenamiento de Hugging Face.

La innovación principal del modelo reside en su objetivo de entrenamiento: mejorar la capacidad de tool calling en inglés, probablemente mediante un conjunto de datos mixto que combina ejemplos de conversación con instrucciones de cuándo invocar herramientas externas. Sin embargo, al no publicarse detalles del dataset ni de la metodología específica, no es posible evaluar la calidad o el alcance de esta adaptación. La arquitectura subyacente es la misma que la del modelo base Qwen2.5-3B-Instruct, un transformer autoregresivo con atención causal y parámetros compartidos.

## Capacidades

- Generación de texto en inglés, con capacidad de razonamiento y respuesta a instrucciones, heredada del modelo base Qwen2.5-3B-Instruct.
- Tool calling / function calling: el nombre del modelo indica que está entrenado para invocar herramientas, aunque no se documentan los formatos ni los protocolos soportados.
- Soporte de agentes y multi-step reasoning: probablemente habilitado por la capacidad de tool calling, pero sin confirmación explícita.
- Capacidades multilingues: el modelo base es multilingue, pero el fine-tune no especifica si mantiene este soporte.
- No se documentan capacidades especiales como modo de pensamiento, visión o audio.

## Casos de uso

- Asistentes conversacionales con integración de APIs: el modelo puede gestionar diálogos multi-turno y decidir cuándo llamar a una API externa (por ejemplo, consultar el tiempo, buscar información en una base de datos) gracias a su entrenamiento específico en tool calling. Su tamaño reducido permite ejecutarlo en servidores modestos o en el edge.
- Automatización de tareas de soporte técnico: puede interpretar consultas de usuarios y ejecutar acciones como crear tickets, consultar el estado de un pedido o enviar notificaciones, combinando generación de texto con llamadas a herramientas internas.
- Desarrollo de agentes de razonamiento multi-paso: al estar fine-tuneado para decidir cuándo llamar a una herramienta, puede usarse como componente central en pipelines de agentes que necesitan planificar y ejecutar acciones en entornos simulados o reales.
- Prototipado rápido de aplicaciones con tool calling: desarrolladores pueden usar este modelo para validar flujos de agentes sin necesidad de desplegar modelos más grandes, reduciendo costes y latencia.
- Chatbots especializados en inglés para nichos concretos: su tamaño compacto permite personalizarlo adicionalmente con datasets propios, manteniendo la capacidad de llamada a herramientas.
- Educación y experimentación: investigadores pueden estudiar el comportamiento de fine-tunes de Qwen2.5-3B-Instruct en tareas de tool calling, comparando con otras variantes del mismo autor (por ejemplo, `norobots` o `mixed_data`).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona métricas como MMLU, HumanEval, GSM8K ni comparaciones con otros modelos. Tampoco se indica el rendimiento en tareas específicas de tool calling.

## Requisitos de hardware

- VRAM estimada para inferencia: para una cuantización FP16, se necesitan aproximadamente 6 GB de VRAM (considerando pesos de 3B en FP16). Con cuantización INT8, la VRAM se reduce a unos 3 GB; con INT4, a unos 2 GB.
- GPU recomendadas: modelos consumer como RTX 3060 (12 GB), RTX 4070, RTX 4090 pueden ejecutar el modelo en FP16 sin problemas. Para cuantizaciones menores, incluso GPUs con 4-6 GB de VRAM serían suficientes.
- Si cabe en consumer GPU: sí, en la mayoría de GPUs modernas con al menos 6 GB de VRAM.
- Opciones de despliegue: al ser un modelo de Transformers, puede servirse con vLLM, TGI, llama.cpp (si se convierte a GGUF), Ollama (mediante conversión) o directamente con la API de Hugging Face.
- Latencia y throughput: no se dispone de datos específicos, pero para un modelo de 3B en una GPU moderna se espera una latencia de decodificación de decenas de milisegundos por token y un throughput de cientos de tokens por segundo en configuraciones optimizadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tool calling | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen/Qwen2.5-3B-Instruct (base) | 3B | 128K (documentado) | No entrenado específicamente | Apache 2.0 (según el repo oficial) | Hugging Face |
| canbingol/qwen2.5-3B-Instruct-tool-call-en-mixed-when2call | 3B | no disponible | Sí (por nombre) | no disponible | Hugging Face |
| canbingol/qwen2.5-3B-Instruct-tool-call-en-norobots | 3B | no disponible | Sí (por nombre) | no disponible | Hugging Face |
| canbingol/Qwen2.5-3B-Instruct-tool-call-tr | 3B | no disponible | Sí (por nombre, turco) | no disponible | Hugging Face |

La comparación se limita a los modelos del mismo autor y al modelo base, ya que no se dispone de información sobre otros fine-tunes de tool calling con 3B de parámetros. El modelo base Qwen2.5-3B-Instruct es el punto de partida y no incluye tool calling nativo; los fine-tunes de canbingol añaden esta capacidad, aunque sin documentación pública de rendimiento.

## Limitaciones y advertencias

- Falta de documentación: la model card es mínima y no detalla el dataset de entrenamiento, el proceso de fine-tuning ni las métricas de evaluación. Esto dificulta la reproducibilidad y la confianza en el modelo.
- Licencia no clara: el campo `licence` en la model card indica "license", sin especificar términos concretos. Se recomienda contactar al autor antes de usar el modelo en producción comercial.
- Sesgos y alucinaciones: al derivar de Qwen2.5-3B-Instruct, el modelo puede heredar sesgos presentes en los datos de preentrenamiento del modelo base. Además, al ser un modelo pequeño, el riesgo de alucinación en tareas complejas es mayor que en modelos más grandes.
- Contexto no confirmado: aunque el modelo base soporta 128K tokens, no se sabe si el fine-tune mantiene esta longitud de contexto o si el entrenamiento la redujo. Se recomienda probar con secuencias largas antes de asumir esa capacidad.
- Soporte de tool calling no verificado: el nombre sugiere la capacidad, pero no hay ejemplos ni pruebas de que funcione correctamente con formatos estándar como JSON function calling. Es necesario evaluar manualmente.
- Sin garantías de producción: al ser un modelo de un autor independiente sin benchmarks ni validación externa, no se recomienda su uso en entornos críticos sin una evaluación exhaustiva previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/canbingol/qwen2.5-3B-Instruct-tool-call-en-mixed-when2call
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Variante `norobots` del mismo autor: https://huggingface.co/canbingol/qwen2.5-3B-Instruct-tool-call-en-norobots
- Variante en turco del mismo autor: https://huggingface.co/canbingol/Qwen2.5-3B-Instruct-tool-call-tr
- Referencia de Qwen2.5 en Ollama: https://ollama.com/library/qwen2.5:3b-instruct
- Repositorio de Qwen2.5 en GitHub: https://github.com/mx4ai/qwen2.5
