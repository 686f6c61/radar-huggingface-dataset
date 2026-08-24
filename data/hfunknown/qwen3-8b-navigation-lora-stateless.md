# hfunknown/qwen3-8b-navigation-lora-stateless

## Resumen

El modelo `hfunknown/qwen3-8b-navigation-lora-stateless` es un adaptador LoRA (Low-Rank Adaptation) construido sobre el modelo base Qwen/Qwen3-8B, publicado de forma anónima como material suplementario para una revisión de doble ciego en un workshop de NeurIPS. El adaptador está especializado en una tarea de navegación agéntica: exploración de grafos con un presupuesto de llamadas a herramientas por turno. Se enmarca en una familia de cuatro adaptadores que combinan dos familias de tareas (rule_diagnosis y navigation) con dos regímenes de entrenamiento (persistente y stateless). Este modelo concreto corresponde al régimen stateless, donde el estado del intérprete Python se reinicia en cada turno del agente.

La relevancia de este modelo reside en su uso como herramienta de investigación para estudiar la generalización y el comportamiento de agentes entrenados con distintos regímenes de estado. Al ser un adaptador LoRA, no es un modelo independiente: requiere cargar el modelo base Qwen3-8B y el adaptador para funcionar. El repositorio tiene un tamaño de 0,7 GB, consistente con un adaptador LoRA, y se distribuye en formato safetensors con la librería PEFT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen3-8B (transformer decoder) |
| Parametros totales | No disponible (el adaptador tiene parametros entrenables no especificados; el modelo base tiene 8B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 16384 (secuencia de entrenamiento) |
| Tipos de cuantizacion | 4-bit NF4 (base cuantizada durante el entrenamiento) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena sobre Qwen3-8B, un modelo transformer decoder con 8 mil millones de parametros. La configuracion LoRA utiliza un rango de 64, alpha de 128, dropout de 0.05 y se aplica a las proyecciones q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj y down_proj. El entrenamiento se realizo con Axolotl, con 3 epocas, tasa de aprendizaje 1e-4 con scheduler coseno, optimizador adamw_torch, micro_batch de 1 y acumulacion de gradientes de 16. La longitud de secuencia fue de 16384 tokens, sin sample packing. Los datos de entrenamiento consisten en trazas pareadas para el regimen stateless en la tarea de navegacion, con un procedimiento de emparejamiento y filtrado descrito en el apendice del paper asociado. La semilla utilizada fue 3407.

La innovacion principal es el regimen de entrenamiento stateless: el estado del interprete Python se reinicia en cada turno del agente, lo que obliga al modelo a operar sin memoria interna entre llamadas a herramientas. Esto contrasta con el regimen persistente, donde el estado se mantiene. Esta distincion es clave para estudiar como los agentes manejan la informacion acumulada en tareas de exploracion de grafos.

## Capacidades

- Especializado en tareas de navegacion agéntica: exploracion de grafos con un presupuesto de llamadas a herramientas por turno.
- Capacidad de tool calling (llamada a funciones) dentro del flujo agéntico, aunque el adaptador esta disenado para un escenario concreto.
- Al estar basado en Qwen3-8B, hereda las capacidades generales del modelo base (generacion de texto, razonamiento, codigo, matematicas, multilingue), pero no se garantiza que el adaptador las preserve en su totalidad.
- No se especifican capacidades adicionales como vision, audio o modo thinking en la informacion disponible.

## Casos de uso

- Investigacion en agentes autonomos: el modelo sirve para estudiar como los agentes se comportan cuando el estado del interprete se reinicia en cada turno, permitiendo analizar la dependencia de la memoria interna en tareas de exploracion.
- Evaluacion de estrategias de tool-calling: al tener un presupuesto de llamadas por turno, es util para comparar politicas de uso de herramientas en entornos de grafos.
- Comparacion de regimenes de entrenamiento: junto con el adaptador persistente, permite aislar el efecto del estado en el rendimiento de agentes, un tema relevante para el diseno de sistemas agénticos.
- Reproducibilidad de experimentos: al ser una liberacion anonima para revision, puede usarse para verificar resultados de papers en workshops academicos.
- Desarrollo de benchmarks de navegacion: el adaptador puede integrarse en entornos de evaluacion que requieran agentes con presupuesto de llamadas a herramientas.
- Estudio de generalizacion: al ser un adaptador LoRA, se puede analizar como el ajuste fino de bajo rango afecta a la capacidad de generalizacion en tareas estructuradas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al requerir el modelo base Qwen3-8B, se necesitan aproximadamente 6-8 GB de VRAM con cuantizacion 4-bit y contexto de 16384 tokens. Sin cuantizacion, la VRAM supera los 16 GB.
- GPU recomendadas: RTX 3090, RTX 4090, A100, H100 o similares con al menos 8 GB de VRAM para cuantizacion 4-bit.
- Si cabe en consumer GPU: si, en GPUs de gama alta como RTX 3090/4090 con cuantizacion 4-bit.
- Opciones de despliegue: al ser un adaptador PEFT, se puede cargar con transformers + peft. Tambien es compatible con vLLM, TGI y llama.cpp si se convierte a GGUF, aunque no se proporcionan instrucciones especificas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Base | Regimen | Tamano adaptador | Contexto | Licencia |
|---|---|---|---|---|---|
| hfunknown/qwen3-8b-navigation-lora-stateless | Qwen3-8B | Stateless | 0.7 GB | 16384 | No disponible |
| AutomatedScientist/qwen3-8b-persistent-navigation-lora | Qwen3-8B | Persistente | No disponible | No disponible | No disponible |
| Qwen/Qwen3-8B (base) | - | - | 8B | 32768 (segun documentacion oficial) | Apache 2.0 |

No se dispone de datos de rendimiento comparativo. La comparativa se limita a caracteristicas estructurales.

## Limitaciones y advertencias

- Sesgos conocidos: al heredar el modelo base Qwen3-8B, puede presentar sesgos presentes en los datos de entrenamiento originales, aunque no se documentan especificamente.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar contenido falso o no verificado, especialmente en tareas de navegacion donde la informacion parcial puede inducir errores.
- Limitaciones de contexto: el adaptador se entreno con secuencias de 16384 tokens; usos con contextos mayores pueden degradar el rendimiento.
- Limitaciones de idioma: no se especifican idiomas soportados; se asume que hereda los del modelo base, pero no esta confirmado.
- Restricciones de licencia: la licencia no esta disponible, lo que impide determinar si es apto para uso comercial. Se recomienda contactar al autor antes de cualquier uso productivo.
- Caveat de produccion: al ser una liberacion anonima para revision academica, no hay garantias de mantenimiento, soporte o correccion de errores. No es recomendable para sistemas en produccion sin una evaluacion exhaustiva.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/hfunknown/qwen3-8b-navigation-lora-stateless
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Adaptador persistente similar: https://huggingface.co/AutomatedScientist/qwen3-8b-persistent-navigation-lora
- Adaptador stateless similar: https://huggingface.co/AutomatedScientist/qwen3-8b-stateless-navigation-lora
- Documentacion de Qwen3-8B (Qualcomm AI Hub): https://github.com/qualcomm/ai-hub-models/blob/main/src/qai_hub_models/models/qwen3_8b/README.md
