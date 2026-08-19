# iaeval2026-submission/qwen3-8b-knapsack-lora-persistent-seed777

## Resumen

Este repositorio contiene un adaptador LoRA entrenado sobre el modelo base Qwen/Qwen3-8B, publicado de forma anónima como material suplementario para una propuesta de taller de doble ciego (probablemente NeurIPS). El adaptador está especializado en la tarea agéntica "Opaque Knapsack", un problema de optimización combinatoria en el que un agente debe seleccionar elementos con pesos y valores desconocidos a priori, interactuando con un entorno para descubrir sus propiedades. El entrenamiento sigue un régimen "persistente", en el que el agente mantiene un runtime de Python con estado que se conserva entre turnos de la conversación, lo que permite razonamiento multi-paso con memoria interna.

El adaptador es uno de seis variantes (tres semillas × dos regímenes de entrenamiento: persistente y sin estado) y utiliza la semilla 777. Está diseñado para ser cargado con la librería `peft` sobre el modelo base Qwen3-8B, que es un transformer denso de 8 mil millones de parámetros con modo de pensamiento y modo sin pensamiento. El repositorio incluye únicamente los pesos del adaptador (0,7 GB) y no el modelo completo. La licencia no está especificada, y los idiomas soportados dependen del modelo base, aunque la tarea de entrenamiento es en inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen3-8B (transformer denso, decoder-only) |
| Parametros totales | 8 mil millones (modelo base) + adaptador LoRA (r=64, alpha=128) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 16 384 tokens (secuencia de entrenamiento del adaptador; el base soporta hasta 32 768) |
| Tipos de cuantizacion | El adaptador se entrenó sobre base cuantizado a 4-bit NF4; los pesos del adaptador están en precisión completa (safetensors) |
| Idiomas soportados | No disponible (depende del modelo base; la tarea de entrenamiento es en inglés) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador LoRA, compatible con `peft`) |

## Arquitectura y entrenamiento

El adaptador se construye sobre Qwen3-8B, un transformer causal con atención completa, normalización RMS, y activación SwiGLU. Qwen3 incorpora un modo de pensamiento (thinking) que genera cadenas de razonamiento internas antes de responder, y un modo sin pensamiento para respuestas rápidas. El adaptador LoRA se aplica a todas las proyecciones lineales principales (`q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj`) con rango 64 y alpha 128, dropout 0,05.

El entrenamiento se realizó con Axolotl 0.13.2 sobre un base cuantizado a 4-bit NF4, con 3 épocas, tasa de aprendizaje 1e-4 con scheduler coseno, optimizador AdamW, micro-batch de 1 y acumulación de gradientes de 16. La longitud de secuencia fue de 16 384 tokens, sin empaquetado de muestras. Los datos de entrenamiento consisten en trazas emparejadas del régimen "persistente", donde el agente mantiene un intérprete de Python con estado entre turnos. El procedimiento de emparejamiento y filtrado se describe en el apéndice del paper asociado, aún no publicado.

## Capacidades

- Especializado en la tarea agéntica "Opaque Knapsack": selección de elementos con pesos y valores desconocidos, optimizando el valor total bajo restricción de capacidad.
- Razonamiento multi-paso con estado persistente: el agente puede mantener variables, resultados intermedios y un historial de ejecución a través de un runtime de Python que persiste entre turnos.
- Generación de código Python para explorar el entorno, calcular combinaciones y tomar decisiones.
- Herencia de las capacidades del modelo base Qwen3-8B: generación de texto, razonamiento matemático, comprensión de instrucciones y soporte de tool calling (aunque el adaptador no ha sido evaluado en estas tareas).
- No se ha verificado soporte para vision, audio u otras modalidades; el modelo base es solo texto.

## Casos de uso

- Investigación en agentes autónomos: el adaptador sirve como punto de partida para estudiar cómo el entrenamiento con estado persistente mejora el rendimiento en tareas de optimización interactiva, comparándolo con regímenes sin estado.
- Evaluación de metodologías de fine-tuning: al ser parte de un estudio con múltiples semillas y regímenes, permite reproducir experimentos y analizar la variabilidad entre semillas.
- Desarrollo de agentes de resolución de problemas combinatorios: aunque la tarea es específica, el enfoque de mantener un runtime persistente puede transferirse a otros dominios donde el agente necesita acumular información a lo largo de una conversación.
- Benchmarking de adaptadores LoRA: útil para medir el impacto del rango, alpha y la cuantización del base en tareas agénticas.
- Educación y formación en PEFT: el repositorio incluye configuración de entrenamiento completa, sirviendo como ejemplo práctico de fine-tuning con Axolotl y LoRA.
- Reproducibilidad de resultados de workshops: al ser un release anónimo para revisión, permite a los revisores verificar los resultados del paper antes de su publicación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de rendimiento en la tarea Opaque Knapsack ni comparaciones con otros modelos. Se espera que los resultados completos aparezcan en el paper asociado tras el proceso de revisión.

## Requisitos de hardware

- El adaptador LoRA tiene un tamaño de 0,7 GB, pero requiere cargar el modelo base Qwen3-8B completo (aproximadamente 16 GB en FP16, o ~6 GB en 4-bit).
- Para inferencia con el adaptador sobre el base cuantizado a 4-bit, se estima una VRAM mínima de 8-10 GB, lo que permite ejecutarlo en GPUs de consumo como RTX 3080/3090, RTX 4070/4080, o RTX 4090.
- En FP16 sin cuantización, se necesitan al menos 16-20 GB de VRAM, recomendándose GPUs como A100 (40 GB), RTX 4090 (24 GB) o A6000.
- Opciones de despliegue: la carga se realiza con `transformers` + `peft`; para servir en producción se puede usar vLLM con soporte LoRA, o TGI. Para entornos ligeros, llama.cpp no es compatible directamente con adaptadores LoRA de PEFT, pero se puede convertir a GGUF con el base fusionado.
- La latencia y el throughput dependen del hardware y de la longitud de secuencia; con una RTX 4090 y cuantización 4-bit, se espera una generación de 30-50 tokens/s para el modelo base, con una ligera sobrecarga por el adaptador.

## Comparativa con modelos similares

No se dispone de modelos directamente comparables, ya que el adaptador es específico para una tarea de investigación no publicada. Como referencia, se puede comparar con el modelo base Qwen3-8B y con otros adaptadores LoRA de la misma familia (por ejemplo, los publicados por otros usuarios con el mismo nombre base, como `TieuDaoChanNhan/qwen3-8b-persistent-knapsack-lora-seed777` o `AutomatedScientist/qwen3-8b-persistent-knapsack-lora`), que probablemente difieren en el régimen de entrenamiento o en la semilla. No hay datos de rendimiento público para establecer una comparación cuantitativa.

| Modelo | Base | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este adaptador (seed 777, persistente) | Qwen3-8B | 16 384 (entrenamiento) | No disponible | Público en HF |
| Adaptador persistente seed 777 (TieuDaoChanNhan) | Qwen3-8B | No disponible | No disponible | Público en HF |
| Adaptador persistente (AutomatedScientist) | Qwen3-8B | No disponible | No disponible | Público en HF |
| Qwen3-8B (base) | - | 32 768 | Apache 2.0 | Público en HF |

## Limitaciones y advertencias

- Es un release anónimo para revisión de un workshop; no hay documentación completa, paper ni garantías de mantenimiento.
- La licencia no está especificada, lo que impide su uso comercial sin consultar al autor.
- El adaptador está entrenado exclusivamente para la tarea Opaque Knapsack; su rendimiento en otras tareas no ha sido evaluado y probablemente sea inferior al del modelo base.
- El régimen de entrenamiento persistente requiere un runtime de Python con estado, lo que complica el despliegue en entornos de producción estándar.
- No se han publicado métricas de sesgo, alucinación o robustez; el modelo base Qwen3-8B puede presentar sesgos lingüísticos y de contenido.
- La cuantización 4-bit del base durante el entrenamiento puede degradar ligeramente la calidad de la generación en comparación con el base en FP16.
- El repositorio no incluye el dataset de entrenamiento ni las trazas completas, lo que limita la reproducibilidad externa.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/iaeval2026-submission/qwen3-8b-knapsack-lora-persistent-seed777
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Paper técnico de Qwen3: https://arxiv.org/html/2505.09388v1
- Adaptador similar (TieuDaoChanNhan): https://huggingface.co/TieuDaoChanNhan/qwen3-8b-persistent-knapsack-lora-seed777
- Adaptador similar (AutomatedScientist): https://huggingface.co/AutomatedScientist/qwen3-8b-persistent-knapsack-lora
- Axolotl (herramienta de entrenamiento): https://github.com/axolotl-ai-cloud/axolotl
