# hfunknown/qwen3-8b-navigation-lora-persistent

## Resumen

El modelo `hfunknown/qwen3-8b-navigation-lora-persistent` es un adaptador LoRA (Low-Rank Adaptation) construido sobre el modelo base Qwen/Qwen3-8B, liberado de forma anónima como material suplementario para una revisión de doble ciego en un workshop de NeurIPS. El adaptador está fine-tuneado específicamente para la tarea de navegación agéntica, que consiste en la exploración de grafos con un presupuesto de llamadas a herramientas (tool-call budget) por turno. Forma parte de una familia de cuatro adaptadores que combinan dos familias de tareas (rule_diagnosis y navigation) con dos regímenes de entrenamiento (persistente y stateless). Este adaptador concreto corresponde al régimen persistente, donde un runtime de intérprete de Python mantiene el estado entre turnos del agente.

La relevancia de este modelo radica en su contribución al estudio de agentes con memoria persistente y presupuesto de acciones, un área activa en la investigación de sistemas autónomos. Al ser una liberación anónima para reproducibilidad, su valor principal es académico: permite evaluar la generalización de un adaptador LoRA entrenado con un intérprete persistente en tareas de navegación. El adaptador tiene un tamaño de repositorio de 0,7 GB y se distribuye en formato safetensors, con la librería PEFT. No se especifican licencia ni idiomas soportados en la model card, aunque el modelo base Qwen3-8B es multilingüe y de código abierto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen3-8B (transformer denso) |
| Parametros totales | No disponible (el adaptador LoRA tiene dimensiones r=64, alpha=128; el base tiene 8.000 millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 16.384 (sequence_len de entrenamiento) |
| Tipos de cuantizacion | Base cuantizado en 4-bit NF4 durante el entrenamiento; el adaptador se distribuye en precisión completa (safetensors) |
| Idiomas soportados | No disponible (el base Qwen3-8B soporta múltiples idiomas, pero el adaptador no especifica) |
| Licencia | No disponible (el base Qwen3-8B usa Apache 2.0, pero el adaptador no declara licencia) |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre Qwen3-8B, un modelo transformer denso de 8.000 millones de parámetros con capacidades multilingües, razonamiento y generación de código. El fine-tuning se realizó con Axolotl, aplicando LoRA con rango 64, alpha 128 y dropout 0,05 sobre los módulos de atención (q_proj, k_proj, v_proj, o_proj) y las proyecciones del MLP (gate_proj, up_proj, down_proj). El modelo base se cuantizó en 4-bit NF4 durante el entrenamiento para reducir el consumo de memoria. Se usó una tasa de aprendizaje de 1e-4 con scheduler coseno, optimizador AdamW, 3 épocas, micro-batch de 1 y acumulación de gradientes de 16, con una longitud de secuencia de 16.384 tokens y sin sample packing.

El régimen de entrenamiento "persistente" implica que el agente dispone de un runtime de Python que conserva el estado entre turnos, lo que permite acumular información a lo largo de la interacción. Los datos de entrenamiento consisten en trazas emparejadas para este régimen, con un procedimiento de emparejamiento y filtrado descrito en el apéndice del paper asociado. No se menciona el uso de RLHF ni DPO; el entrenamiento es supervisado sobre trazas de navegación.

## Capacidades

- Navegación agéntica: el adaptador está especializado en exploración de grafos con un presupuesto de llamadas a herramientas por turno, optimizado para tomar decisiones secuenciales bajo restricciones de recursos.
- Memoria persistente: al entrenarse con un runtime de Python persistente, el modelo puede aprovechar el estado acumulado entre turnos, lo que mejora la coherencia en tareas multi-paso.
- Hereda las capacidades del base Qwen3-8B: generación de texto, razonamiento, comprensión multilingüe, generación de código y matemáticas, aunque el adaptador no ha sido evaluado públicamente en estas tareas.
- Soporte de tool calling: la tarea de navegación implica llamadas a herramientas, por lo que el adaptador está entrenado para emitir acciones de forma estructurada, aunque no se documenta explícitamente el formato.
- Sin modo de pensamiento explícito: no se menciona un modo "thinking" separado; el comportamiento se basa en la generación directa de acciones.

## Casos de uso

- Investigación en agentes autónomos: el adaptador sirve como referencia para estudiar cómo un LoRA con memoria persistente afecta a la navegación en grafos, permitiendo comparar con el régimen stateless en el paper asociado.
- Simulación de exploración de entornos: en entornos simulados donde un agente debe recorrer un grafo (por ejemplo, mapas de edificios o redes), el modelo puede decidir qué nodo visitar siguiente respetando un presupuesto de acciones por turno.
- Evaluación de presupuestos de tool-call: permite experimentar con diferentes límites de llamadas a herramientas por turno y analizar el impacto en la eficiencia de la exploración.
- Benchmarking de adaptadores LoRA: al ser una liberación anónima con configuración detallada, puede usarse como caso de estudio para reproducibilidad de fine-tuning con Axolotl y PEFT.
- Desarrollo de agentes con estado persistente: el régimen persistente puede inspirar arquitecturas donde el agente mantiene un intérprete de Python entre turnos, útil en tareas de razonamiento multi-paso con memoria.
- Educación en fine-tuning de LLMs: el repositorio incluye la configuración completa de entrenamiento, lo que permite a estudiantes e investigadores replicar el proceso y entender el impacto de cada hiperparámetro.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de rendimiento, ni comparaciones con otros modelos o adaptadores. El único dato relevante es que el adaptador forma parte de un estudio de generalización (segunda familia de generalización junto al resultado principal de Opaque Knapsack), pero no se proporcionan cifras concretas.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un adaptador LoRA, el requisito principal es el del modelo base Qwen3-8B. Con cuantización 4-bit, se necesitan aproximadamente 6-8 GB de VRAM para inferencia; en 8-bit, unos 10-12 GB; en precisión completa, unos 16 GB.
- GPU recomendadas: el adaptador puede ejecutarse en GPUs de consumo como RTX 3090, RTX 4090 (24 GB VRAM) o GPUs profesionales como A10, A100. Para entrenamiento, se usó una GPU con al menos 24 GB (dado el micro-batch de 1 y acumulación de gradientes).
- Compatibilidad con consumer GPU: sí, cabe en GPUs de 16 GB o más si se usa cuantización del base. El adaptador en sí ocupa menos de 1 GB.
- Opciones de despliegue: al ser un adaptador PEFT, puede cargarse con la librería `peft` de Hugging Face junto con el modelo base. También es compatible con vLLM, llama.cpp y Ollama si se fusiona el adaptador con el base o se usa soporte de LoRA en estos motores.
- Latencia y throughput: no disponible. Depende del hardware y del motor de inferencia; el base Qwen3-8B tiene una latencia típica de decenas de milisegundos por token en GPUs modernas.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar con otros adaptadores. Sin embargo, se puede contextualizar con el modelo base y con el adaptador hermano de knapsack:

| Modelo | Tipo | Tarea | Régimen | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hfunknown/qwen3-8b-navigation-lora-persistent | LoRA sobre Qwen3-8B | Navegación agéntica | Persistente | No disponible | Público en HF |
| hfunknown/qwen3-8b-knapsack-lora-persistent-seed777 | LoRA sobre Qwen3-8B | Opaque Knapsack | Persistente | No disponible | Público en HF |
| Qwen/Qwen3-8B | Modelo base denso | Generalista | - | Apache 2.0 | Público en HF |

No hay comparativas publicadas con otros adaptadores de navegación o agentes. La comparación directa solo es posible dentro de la familia de adaptadores del mismo estudio, pero sin métricas no se puede establecer un ranking.

## Limitaciones y advertencias

- Liberación anónima: el modelo se publica sin autoría identificada, sin paper citado y sin código completo. Esto limita su uso en entornos de producción que requieran trazabilidad.
- Licencia no declarada: aunque el base es Apache 2.0, el adaptador no especifica licencia, lo que genera incertidumbre legal para uso comercial.
- Especialización estrecha: el adaptador está entrenado únicamente para la tarea de navegación con presupuesto de tool-call; su rendimiento en otras tareas no está garantizado y probablemente sea inferior al del base sin adaptar.
- Riesgo de alucinación: como cualquier LLM, puede generar acciones o razonamientos incorrectos, especialmente en entornos no vistos durante el entrenamiento.
- Sesgos del base: el modelo hereda los sesgos de Qwen3-8B, que pueden manifestarse en contextos multilingües o culturales.
- Sin documentación de evaluación: no hay información sobre sesgos específicos, robustez o comportamiento en casos límite.
- Dependencia del runtime persistente: el régimen persistente requiere un intérprete de Python que mantenga estado; si el despliegue no replica esta infraestructura, el comportamiento puede degradarse.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/hfunknown/qwen3-8b-navigation-lora-persistent
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Adaptador hermano (knapsack): https://huggingface.co/hfunknown/qwen3-8b-knapsack-lora-persistent-seed777
- Repositorio de Axolotl: https://github.com/axolotl-ai-cloud/axolotl
- Documentación de Qwen3-8B en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_8b
- Repositorio oficial de la serie Qwen3.8: https://github.com/QwenLM/Qwen3.8
