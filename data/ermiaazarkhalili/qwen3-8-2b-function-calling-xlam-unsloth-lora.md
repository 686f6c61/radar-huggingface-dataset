# ermiaazarkhalili/Qwen3.8-2B-Function-Calling-xLAM-Unsloth-LoRA

## Resumen

El modelo `ermiaazarkhalili/Qwen3.8-2B-Function-Calling-xLAM-Unsloth-LoRA` es un adaptador LoRA obtenido mediante fine-tuning supervisado del modelo base `empero-ai/Qwen3.8-2B` sobre el conjunto de datos `Salesforce/xlam-function-calling-60k`. Su objetivo es especializar el modelo en la tarea de llamada a funciones (function calling), una capacidad esencial para construir agentes y asistentes que interactúan con herramientas y APIs externas. El adaptador se publica con la librería PEFT y se puede cargar sobre el modelo base para obtener un modelo listo para generar respuestas estructuradas que invocan funciones definidas por el usuario.

El entrenamiento se realizó con QLoRA de 4 bits, con un rango de 64, una secuencia de 2048 tokens y una única época, alcanzando una pérdida final de 0,1044. El adaptador tiene un tamaño de 0,3 GB y se complementa con una versión fusionada de 16 bits del mismo modelo (`Qwen3.8-2B-Function-Calling-xLAM-Unsloth`). Aunque el modelo base pertenece a la serie Qwen3.8 de Alibaba, no se dispone de detalles oficiales sobre su arquitectura o licencia, por lo que esta ficha se basa exclusivamente en la información publicada en el repositorio del adaptador.

La relevancia de este modelo radica en ofrecer una alternativa ligera y especializada para el desarrollo de agentes conversacionales que necesitan ejecutar acciones concretas, como consultar bases de datos, llamar a APIs o interactuar con sistemas externos, todo ello con un coste computacional reducido al tratarse de un modelo de 2 mil millones de parámetros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo base de la serie Qwen3.8, sin especificación oficial) |
| Parametros totales | 2 mil millones (modelo base `empero-ai/Qwen3.8-2B`) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (entrenado con secuencias de 2048 tokens) |
| Tipos de cuantizacion | No disponible (adaptador LoRA en safetensors; la versión fusionada está en 16 bits) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se construyó mediante fine-tuning supervisado con QLoRA de 4 bits sobre el modelo base `empero-ai/Qwen3.8-2B`. Se utilizó el conjunto de datos `Salesforce/xlam-function-calling-60k`, que contiene 60.000 ejemplos de llamadas a funciones en formato conversacional. El entrenamiento se llevó a cabo con una secuencia de 2048 tokens, una única época, un learning rate de 0,0002 y un batch efectivo de 8. Se aplicaron 7.500 pasos de optimización y la pérdida final fue de 0,1044. Los módulos objetivo de LoRA incluyen `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj`, `in_proj_qkv`, `in_proj_z` y `out_proj`, lo que abarca todas las proyecciones lineales del modelo. No se menciona el uso de técnicas de alineación como RLHF o DPO; el proceso se limitó a un fine-tuning supervisado estándar.

## Capacidades

- Especializado en llamada a funciones (function calling): dado un esquema de funciones en el prompt, el modelo genera una respuesta que invoca la función adecuada con los argumentos correctos.
- Generación de texto conversacional: al ser un adaptador sobre un modelo de lenguaje, conserva la capacidad de mantener diálogos multi‑turno.
- Integración con herramientas: puede utilizarse para construir agentes que llamen a APIs, consulten bases de datos o ejecuten acciones externas.
- Soporte de tool calling: aunque no se detalla el formato exacto, el entrenamiento con xlam‑function‑calling‑60k implica la capacidad de producir salidas estructuradas en JSON para invocaciones de funciones.
- No se dispone de información sobre capacidades de razonamiento, código o matemáticas más allá de lo heredado del modelo base, que no está documentado en esta ficha.

## Casos de uso

- Asistentes conversacionales con acceso a herramientas: el modelo puede interpretar la intención del usuario y generar llamadas a funciones para consultar el clima, reservar citas o buscar información en una base de datos. Su tamaño reducido permite desplegarlo en entornos con recursos limitados.
- Automatización de procesos empresariales: en flujos de trabajo donde se necesitan extraer datos de formularios o emitir comandos a sistemas internos, el modelo puede producir las invocaciones de funciones correspondientes a partir de entradas de texto.
- Agentes de atención al cliente: puede gestionar diálogos multi‑turno y decidir cuándo llamar a una función de CRM o de gestión de incidencias, gracias a su capacidad de generar llamadas a funciones en tiempo real.
- Generación de consultas SQL: si se define una función `ejecutar_sql(query)`, el modelo puede transformar preguntas en lenguaje natural en llamadas a esa función con la consulta SQL adecuada.
- Integración en pipelines de CI/CD: el modelo puede interpretar comandos de texto y generar llamadas a funciones para desplegar, testear o monitorizar aplicaciones, simplificando la interacción con herramientas de DevOps.
- Asistentes de voz: al ser ligero, se puede ejecutar en dispositivos con GPU consumer para interpretar comandos de voz transcritos y convertirlos en llamadas a funciones de domótica o sistemas de control.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no reporta métricas de exactitud en llamadas a funciones, ni comparaciones con otros modelos en conjuntos de evaluación estándar.

## Requisitos de hardware

- El adaptador LoRA ocupa 0.3 GB, pero para ejecutar el modelo completo se necesita cargar el modelo base `empero-ai/Qwen3.8-2B` (2B parámetros). En FP16, el modelo base ocupa aproximadamente 4.5 GB de memoria (según el tamaño del modelo fusionado publicado, 4.57 GB).
- Con cuantización de 4 bits (como la usada en el entrenamiento) podría caber en una GPU con 4 GB de VRAM, pero no se ha confirmado oficialmente.
- Se recomienda una GPU con al menos 6 GB de VRAM para inferencia en FP16 (por ejemplo, NVIDIA RTX 2060, RTX 3060, o GPUs de datacenter como T4).
- Para despliegue, se puede usar Hugging Face Transformers con PEFT, vLLM, o llama.cpp si se convierte el modelo a GGUF (no se proporcionan archivos GGUF en el repositorio).
- La latencia y el throughput no han sido medidos ni publicados para este adaptador.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de la misma categoría (adaptadores LoRA para function calling sobre bases de 2B) en la información proporcionada. La comparativa queda pendiente de datos externos.

## Limitaciones y advertencias

- El modelo se entrenó únicamente con el dataset `xlam-function-calling-60k`; no se realizó una evaluación en conjuntos de validación independientes, por lo que su rendimiento real en escenarios no vistos puede ser variable.
- No se ha verificado la calidad de las llamadas a funciones en dominios distintos al del dataset; es probable que falle en casos fuera de su distribución de entrenamiento.
- El modelo hereda los sesgos y las limitaciones del modelo base `empero-ai/Qwen3.8-2B`, del que no se dispone de documentación sobre sesgos o alucinación.
- La licencia del modelo base y del adaptador no está especificada; se desconoce si se puede usar comercialmente sin restricciones.
- El adaptador solo funciona con el modelo base `empero-ai/Qwen3.8-2B`; no es un modelo autónomo y requiere cargar el modelo base completo para su uso.
- No se ha evaluado el riesgo de alucinación en la generación de llamadas a funciones; existe la posibilidad de que el modelo invente argumentos o funciones no definidas.

## Enlaces

- [HuggingFace: adaptador LoRA](https://huggingface.co/ermiaazarkhalili/Qwen3.8-2B-Function-Calling-xLAM-Unsloth-LoRA)
- [HuggingFace: modelo fusionado](https://huggingface.co/ermiaazarkhalili/Qwen3.8-2B-Function-Calling-xLAM-Unsloth)
- [Dataset Salesforce/xlam-function-calling-60k](https://huggingface.co/datasets/Salesforce/xlam-function-calling-60k)
- [Repositorio GitHub de la serie Qwen3.8 (referencia del modelo base)](https://github.com/QwenLM/Qwen3.8)
