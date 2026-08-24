# hfunknown/qwen3-8b-rule_diagnosis-lora-persistent

## Resumen

El modelo `hfunknown/qwen3-8b-rule_diagnosis-lora-persistent` es un adaptador LoRA (PEFT) construido sobre el modelo base [Qwen/Qwen3-8B](https://huggingface.co/Qwen/Qwen3-8B), publicado de forma anónima como material suplementario para una revisión de reproducibilidad de un workshop NeurIPS. El adaptador está especializado en la tarea agéntica de *rule_diagnosis*: el modelo debe inferir y reparar en línea una regla oculta (una función booleana) mediante llamadas a `probe()` y `check()` contra un entorno simulado. Se trata de uno de los cuatro adaptadores LoRA liberados en el marco de un estudio sobre generalización en tareas agénticas, siendo este el correspondiente a la familia de tareas *rule_diagnosis* con régimen de entrenamiento *persistente* (el estado del intérprete Python se conserva entre turnos del agente).

El adaptador se entrenó con Axolotl sobre una base cuantizada en 4-bit NF4, con rango LoRA 64, alpha 128 y dropout 0.05, durante 3 épocas y con una longitud de secuencia de 16 384 tokens. El repositorio ocupa 0.7 GB y contiene únicamente los pesos del adaptador, no el modelo completo. Su relevancia actual radica en que explora cómo el entrenamiento con estado persistente afecta a la capacidad de razonamiento agéntico, un área de creciente interés para el desarrollo de agentes autónomos. No obstante, al ser una liberación anónima y orientada a investigación, no está pensado para uso general en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen3-8B (Transformer denso) |
| Parametros totales | no disponible (adaptador LoRA, ~0.7 GB de pesos) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 16 384 (secuencia de entrenamiento); el modelo base soporta hasta 32 768 |
| Tipos de cuantizacion | Base cuantizada 4-bit NF4 durante el entrenamiento; el adaptador es agnóstico a la precision |
| Idiomas soportados | no disponible (el modelo base Qwen3-8B es multilingue, pero el adaptador no especifica) |
| Licencia | no disponible |
| Formato de pesos | safetensors (PEFT LoRA) |

## Arquitectura y entrenamiento

El adaptador se basa en la arquitectura Transformer densa de Qwen3-8B, un modelo de 8 000 millones de parámetros con soporte nativo para *thinking mode* y *non-thinking mode*. Sobre esta base se aplica un adaptador LoRA con rango 64, alpha 128 y dropout 0.05, dirigido a las proyecciones `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`. El entrenamiento se realizó con Axolotl, utilizando una base cuantizada en 4-bit NF4, optimizador AdamW, tasa de aprendizaje 1e-4 con programación coseno, 3 épocas, micro-batch de 1 y acumulación de gradientes de 16 pasos, lo que equivale a un batch efectivo de 16. La longitud de secuencia se fijó en 16 384 tokens y se desactivó el *sample packing*.

Los datos de entrenamiento consisten en trazas emparejadas del régimen *persistente* sobre la tarea *rule_diagnosis*, donde el agente mantiene un intérprete Python cuyo estado se conserva entre turnos. El procedimiento de emparejado y filtrado se detalla en el apéndice del artículo asociado, aún no publicado. La semilla aleatoria utilizada fue 3407. No se menciona el uso de RLHF, DPO u otras técnicas de alineación posteriores al fine-tuning supervisado.

## Capacidades

- Especializado en la tarea de *rule_diagnosis*: inferir una función booleana oculta mediante llamadas iterativas a `probe()` y `check()`.
- Razonamiento multi-paso con soporte de *tool calling* implícito (las llamadas a `probe`/`check` actúan como funciones externas).
- Mantenimiento de estado a través de turnos gracias al régimen de entrenamiento persistente (el intérprete Python conserva variables y resultados entre pasos).
- Capacidad de reparación de hipótesis en línea: el modelo ajusta sus conjeturas a partir de las respuestas del entorno.
- No se han documentado capacidades generales adicionales (generación de texto libre, código, matemáticas, visión, etc.) más allá de las inherentes al modelo base Qwen3-8B.
- El modelo base soporta *thinking mode* y *non-thinking mode*, pero el adaptador no especifica si estas modalidades se conservan o modifican.

## Casos de uso

- Investigación en agentes autónomos: el adaptador sirve para estudiar cómo el entrenamiento con estado persistente mejora la capacidad de diagnóstico y reparación de hipótesis en entornos simulados.
- Reproducción de experimentos académicos: al ser una liberación suplementaria para un workshop, su uso principal es verificar los resultados del artículo asociado.
- Evaluación de métodos de fine-tuning con LoRA para tareas agénticas: permite comparar el régimen persistente frente al *stateless* (liberado como adaptador hermano).
- Desarrollo de prototipos de diagnóstico automático de sistemas: el patrón `probe`/`check` puede adaptarse a entornos donde un agente debe inspeccionar un sistema y corregir sus suposiciones.
- Benchmarking de adaptadores LoRA sobre Qwen3-8B: útil para medir el impacto de la cuantización 4-bit y la configuración de LoRA en tareas de razonamiento.
- Estudio de generalización entre familias de tareas: junto con el adaptador *knapsack*, permite analizar si el entrenamiento en una tarea agéntica transfiere a otras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona métricas de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. Tampoco se ofrecen comparativas con el modelo base o con otros adaptadores. La ausencia de datos impide valorar cuantitativamente el rendimiento del adaptador fuera de la tarea específica para la que fue entrenado.

## Requisitos de hardware

- El adaptador LoRA en sí ocupa 0.7 GB, pero requiere cargar el modelo base Qwen3-8B completo.
- Con cuantización 4-bit del base, la VRAM necesaria para inferencia ronda los 6-8 GB, lo que permite ejecutarlo en GPUs de consumo como RTX 3060 (12 GB), RTX 4070 o superiores.
- En 8-bit, la VRAM estimada es de 10-12 GB; en 16-bit, de 16-18 GB.
- GPUs recomendadas: RTX 3090/4090 (24 GB) para trabajar cómodamente con precisión 8-bit o 16-bit; A100 o H100 para despliegues a gran escala.
- Opciones de despliegue: transformers con PEFT (carga directa del adaptador), vLLM (si se convierte a un formato compatible con LoRA), llama.cpp (tras convertir a GGUF) y Ollama (empaquetando el adaptador con el base).
- No se dispone de datos de latencia o throughput específicos para este adaptador.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados. El adaptador es una liberación anónima y específica para una tarea de investigación, por lo que no existen benchmarks que lo comparen con alternativas. Como referencia estructural, se puede comparar con:

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hfunknown/qwen3-8b-rule_diagnosis-lora-persistent | LoRA sobre Qwen3-8B | ~0.7 GB (adaptador) | 16 384 | no disponible | HuggingFace |
| AutomatedScientist/qwen3-8b-persistent-rule_diagnosis-lora | LoRA sobre Qwen3-8B | similar | no disponible | no disponible | HuggingFace |
| Qwen/Qwen3-8B | Modelo base denso | 8B | 32 768 | Apache 2.0 | HuggingFace |

El adaptador hermano (`AutomatedScientist`) parece ser una versión alternativa del mismo experimento, aunque no se confirma si es idéntico o una variante. El modelo base Qwen3-8B es la referencia natural para medir el impacto del fine-tuning, pero no se han publicado comparativas.

## Limitaciones y advertencias

- Publicación anónima: no hay forma de contactar al autor ni garantías de mantenimiento o soporte.
- Licencia no especificada: el uso comercial es incierto y podría violar los términos del modelo base si no se respeta la licencia Apache 2.0 de Qwen3.
- Especialización extrema: el adaptador solo es útil para la tarea *rule_diagnosis* con régimen persistente; fuera de ese contexto, su rendimiento no está garantizado.
- Riesgo de sobreajuste: al entrenarse con trazas de un entorno simulado específico, puede no generalizar a otros dominios o variaciones de la tarea.
- Dependencia del entorno persistente: el modelo asume que el intérprete Python conserva estado entre turnos; si se usa sin esa infraestructura, el comportamiento puede degradarse.
- No se han documentado sesgos ni riesgos de alucinación específicos, pero al ser un modelo fine-tuneado sobre una tarea concreta, podría generar respuestas incorrectas cuando se le presentan entradas fuera de distribución.
- La fecha de creación (2026-08-24) es posterior a la fecha actual, lo que sugiere que el repositorio podría ser un artefacto de un experimento futuro o un error de metadatos; se recomienda verificar su autenticidad.

## Enlaces

- [Repositorio HuggingFace del adaptador](https://huggingface.co/hfunknown/qwen3-8b-rule_diagnosis-lora-persistent)
- [Modelo base Qwen/Qwen3-8B](https://huggingface.co/Qwen/Qwen3-8B)
- [Technical report de Qwen3 (arXiv)](https://arxiv.org/html/2505.09388v1)
- [Adaptador hermano (AutomatedScientist)](https://huggingface.co/AutomatedScientist/qwen3-8b-persistent-rule_diagnosis-lora)
- [Análisis del adaptador en free2aitools](https://free2aitools.com/model/automatedscientist/qwen3-8b-persistent-rule_diagnosis-lora)
