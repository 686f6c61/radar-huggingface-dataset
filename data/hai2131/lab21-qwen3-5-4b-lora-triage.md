# hai2131/lab21-qwen3.5-4b-lora-triage

## Resumen

`hai2131/lab21-qwen3.5-4b-lora-triage` es un adaptador LoRA de bajo rango, publicado en formato PEFT, que se ajusta sobre el modelo base `unsloth/Qwen3.5-4B` mediante supervisión fina (SFT). El repositorio, de 0.1 GB, contiene únicamente los pesos del adaptador en formato safetensors, junto con los metadatos de configuración de PEFT. Aunque la model card original está prácticamente vacía, las fuentes externas relacionadas con el mismo laboratorio de fine-tuning (AICB-P2T3, Day 21) indican que el objetivo del adaptador es realizar triage de tickets de soporte al cliente en vietnamés, produciendo una salida JSON con cuatro campos: intención, urgencia, producto y sentimiento.

La relevancia del modelo reside en ser un ejemplo representativo de fine-tuning eficiente mediante LoRA/QLoRA sobre una base de 4.000 millones de parámetros, una práctica habitual para adaptar modelos de lenguaje grandes a tareas específicas con recursos limitados. Sin embargo, la información publicada es mínima: no se especifican hiperparámetros de entrenamiento, conjunto de datos, licencia ni resultados de evaluación, por lo que su utilidad práctica queda limitada a la reproducción del experimento o a la verificación de la técnica, más que a un despliegue productivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador) sobre Qwen3.5-4B (transformer denso) |
| Parametros totales | no disponible (el adaptador ocupa 0.1 GB; el modelo base tiene 4B) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, no publicada) |
| Tipos de cuantizacion | bf16/fp16 (según fuentes externas del mismo laboratorio) |
| Idiomas soportados | no disponible (fuentes externas indican vietnamita) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de bajo rango, entrenado con la librería PEFT (versión 0.20.0) sobre el modelo base `unsloth/Qwen3.5-4B`. No se publican detalles del rango (rank), alpha, ni la capa de aplicación del adaptador. El entrenamiento se realizó mediante supervisión fina (SFT) usando el framework TRL, como indican las etiquetas del repositorio. La tarea concreta, según los repositorios del mismo laboratorio, es la generación de una salida JSON de triaje con cuatro campos (intención, urgencia, producto y sentimiento) para tickets de soporte al cliente en vietnamés. No se han publicado datos sobre el conjunto de entrenamiento, el número de tokens, ni si se aplicaron técnicas adicionales como RLHF o DPO. La arquitectura base, Qwen3.5-4B, es un transformer denso de 4.000 millones de parámetros, pero no se dispone de la longitud de contexto exacta ni de la configuración completa del modelo base.

## Capacidades

- Generación de texto limitada a la tarea de triaje de tickets de soporte al cliente.
- Salida estructurada en JSON con cuatro campos: intención, urgencia, producto y sentimiento.
- Especialización en el idioma vietnamita (según las fuentes del mismo laboratorio; no confirmado en la model card).
- No se ha documentado soporte para tool calling, agentes, razonamiento multi-paso ni otras capacidades de los modelos Qwen3.

## Casos de uso

- Clasificación automática de tickets de soporte al cliente: el adaptador puede asignar a cada ticket una intención, una urgencia, un producto y un sentimiento en formato JSON, permitiendo integrarse en sistemas de gestión de incidencias para priorizar y enrutar automáticamente las solicitudes.
- Automatización de respuestas iniciales en centros de atención al cliente en vietnamita: al clasificar el ticket de entrada, el sistema puede pre-seleccionar plantillas de respuesta o escalar a un agente humano según la urgencia detectada.
- Análisis de sentimiento de feedback de clientes: el campo de sentimiento del JSON permite monitorizar la satisfacción del cliente en tiempo real y detectar picos de insatisfacción.
- Filtrado y priorización de colas de soporte: la combinación de urgencia e intención permite reordenar dinámicamente las colas de trabajo de los agentes.
- Integración en pipelines de datos para métricas de producto: el campo de producto permite segmentar los tickets por línea de negocio, facilitando la generación de informes de calidad por producto.
- Base para experimentos de fine-tuning: al ser un adaptador pequeño (0.1 GB), puede servir como ejemplo de entrenamiento LoRA para estudiantes o equipos que quieran replicar el proceso con otros modelos base o idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de precisión, exactitud ni comparaciones con otros modelos para esta tarea específica.

## Requisitos de hardware

- Al ser un adaptador LoRA, requiere cargar el modelo base `unsloth/Qwen3.5-4B` (4B parámetros). En fp16, el modelo base ocupa aproximadamente 8 GB de VRAM; con cuantización 4-bit, unos 4-5 GB.
- GPU recomendadas: tarjetas consumer con 8 GB de VRAM o más (RTX 3070, RTX 4070, RTX 4090). En entornos de producción, una A100 40GB o H100 permite ejecutar el modelo con margen para contexto largo.
- Es viable en GPU consumer: sí, en cuantización 4-bit o 8-bit.
- Opciones de despliegue: vLLM soporta la carga de adaptadores LoRA sobre modelos base; también se puede usar el pipeline de Transformers con PEFT para inferencia local. No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información sobre otros adaptadores del mismo laboratorio con datos de rendimiento. Se puede comparar con el modelo base sin adaptador:

| Modelo | Parametros | Contexto | Tarea | Licencia |
|---|---|---|---|---|
| `hai2131/lab21-qwen3.5-4b-lora-triage` | 4B (base) + adaptador 0.1GB | no disponible | Triaje de tickets (vietnamita) | no disponible |
| `unsloth/Qwen3.5-4B` (base) | 4B | no disponible | Generación general | no disponible |
| `magschr/lab21-qwen3.5-4b-triage-lora` | 4B + adaptador | no disponible | Triaje de tickets (vietnamita) | no disponible |

No se han publicado resultados comparativos entre estos adaptadores.

## Limitaciones y advertencias

- La model card no especifica licencia, por lo que no se puede garantizar el uso comercial del adaptador ni del modelo base.
- No se han documentado sesgos ni riesgos de alucinación; al tratarse de un adaptador de clasificación, el riesgo de alucinación es menor que en modelos generativos, pero no se ha evaluado.
- La tarea está especializada en el idioma vietnamita; no se espera un buen rendimiento en otros idiomas.
- El adaptador solo funciona sobre el modelo base `unsloth/Qwen3.5-4B`; no es un modelo completo y no puede usarse de forma autónoma.
- No hay información sobre la calidad de los datos de entrenamiento ni sobre el proceso de validación, por lo que no se recomienda su uso en producción sin una evaluación previa.
- El repositorio no incluye instrucciones de uso, ni ejemplos de carga, ni el prompt esperado para el triaje.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/hai2131/lab21-qwen3.5-4b-lora-triage
- Adaptador similar del mismo laboratorio: https://huggingface.co/magschr/lab21-qwen3.5-4b-triage-lora
- Adaptador similar (Marvis12957): https://huggingface.co/Marvis12957/ai_in_action_lab21
- Página de FriendliAI con el adaptador similar: https://friendli.ai/models/magschr/lab21-qwen3.5-4b-triage-lora
- Repositorio GitHub del laboratorio (VinUni AICB Day 21): https://github.com/tqhung-ai/lab21-2A202601683/tree/main
- Blog de Qwen sobre la familia Qwen3 (referencia del modelo base): https://qwen.ai/blog?id=qwen3
