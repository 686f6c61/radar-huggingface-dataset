# JACK-POTTSSON/Qwen3.8-27B-OBLITERATEDpintus

## Resumen

Qwen3.8-27B-OBLITERATED es una variante del modelo denso Qwen3.8-27B de Alibaba, modificada mediante tecnicas de abliteracion para eliminar las negativas de seguridad (refusals) en la generacion. El modelo ha sido desarrollado por JACK-POTTSSON (vinculado al proyecto OBLITERATUS de Pliny el Viejo) y se presenta como una herramienta para investigacion de red teaming, seguridad de IA y evaluacion de alineacion. La version V3, la mas reciente, logra una tasa de rechazo de 0/15 en ambos modos de razonamiento (thinking ON y OFF) con una perdida de solo 0,9 puntos porcentuales en MMLU respecto al modelo base.

La arquitectura subyacente, Qwen3.8-27B, es un transformer denso de 26,9 mil millones de parametros con un diseno hibrido de atencion: de sus 64 capas, solo 16 utilizan atencion completa, mientras que las otras 48 emplean atencion lineal con estado recurrente constante. Esto reduce el coste computacional del contexto largo sin sacrificar capacidad de razonamiento. La licencia es Apache 2.0, lo que permite uso comercial con atribucion, y los pesos estan disponibles en formatos safetensors, GGUF y MLX. El contexto maximo no se ha especificado en la documentacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3 (hybrid: 16 capas de atencion completa + 48 capas de atencion lineal con estado recurrente) |
| Parametros totales | 26.895.998.464 (~26,9 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No especificados (disponible en GGUF, cuantizaciones concretas no listadas) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF, MLX |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B, un transformer denso con un diseno de atencion hibrida. De las 64 capas, solo 16 ejecutan atencion completa (con un intervalo de 4, es decir, cada 4 capas una es completa), mientras que las 48 restantes usan atencion lineal con un estado recurrente constante, reduciendo la complejidad computacional de O(n²) a O(n). El entrenamiento de abliteration se realizo en tres iteraciones (V1, V2, V3). La V1 aplico una cirugia agresiva basada en SVD (descomposicion en valores singulares) que elimino todos los rechazos pero costo 6 puntos de MMLU. La V2 introdujo una mezcla de dos tecnicas: un 60% de LEACE (minimizacion de informacion mutua) y un 40% de SVD, logrando una perdida de solo 0,3 puntos. La V3 refino la V2 con un corpus de 1000 prompts (852 integrados + 100 consultas simples + 48 avanzadas de red teaming, agentes y ataques de ML) y consiguio cero rechazos en ambos modos de razonamiento con una perdida de 0,9 puntos en MMLU.

El proceso de entrenamiento no usa RLHF ni DPO, sino una cirugia de pesos que proyecta fuera las direcciones de rechazo en el espacio de representacion del modelo. La V3 es una refinacion iterativa sobre la V2, no un entrenamiento desde cero, lo que permite mantener la calidad general del modelo base.

## Capacidades

- Generacion de texto y razonamiento: mantiene las capacidades de Qwen3.8-27B en tareas de comprension y generacion de lenguaje, con un MMLU de 83,7% (0-shot).
- Generacion de codigo: incluye refactorizacion async, depuracion de errores de Kubernetes y revision de seguridad de codigo (detecta 3+ vulnerabilidades en una app Flask).
- Tool calling y function calling: soporta cadenas de herramientas (busqueda, fetch, email) en modo agente.
- Capacidad de agente: ejecuta bucles ReAct (Thought/Action/Result) con generacion de SQL.
- Razonamiento multi-paso: resuelve tareas de diseno de sistemas distribuidos (por ejemplo, limitador de tasa con Redis).
- Modo thinking: el modelo soporta el modo de razonamiento interno (thinking ON), pero el autor recomienda desactivarlo porque puede reintroducir rechazos.
- Multilingue: no hay datos disponibles sobre los idiomas soportados.
- Cero rechazos: es la caracteristica principal, el modelo cumple con solicitudes que el modelo stock rechaza sistematicamente.

## Casos de uso

- **Investigacion en red teaming de IA**: el modelo permite probar la robustez de sistemas de moderacion y alineacion al generar respuestas que los modelos censurados no emiten. Se puede usar para construir datasets de ataques de jailbreak y medir la eficacia de los filtros de seguridad.
- **Evaluacion de alineacion en sistemas de produccion**: como modelo sin rechazos, sirve como contraste para medir el comportamiento de sistemas con moderacion. Un equipo de seguridad puede comparar las respuestas de este modelo con las de un modelo censurado para identificar sesgos o lagunas en las politicas de uso.
- **Generacion de codigo sin restricciones**: para desarrolladores que necesitan generar scripts de automatizacion, pruebas de penetracion o codigo de bajo nivel sin que el modelo se niegue por motivos de seguridad. Por ejemplo, generar exploits de prueba para entornos de laboratorio.
- **Analisis de vulnerabilidades**: el modelo realiza revisiones de seguridad de codigo (detecta vulnerabilidades en aplicaciones web) y propone parches, como se muestra en las pruebas avanzadas.
- **Investigacion academica sobre abliteration**: el modelo es un caso de estudio para investigar tecnicas de eliminacion de rechazos en transformers, y se puede comparar con el modelo base para analizar el impacto en las capacidades generales.
- **Automatizacion de agentes de IA**: el modelo ejecuta bucles ReAct y cadenas de herramientas (search, fetch, email), lo que lo hace util para prototipos de agentes que requieren interaccion con APIs y bases de datos sin que el modelo se detenga por restricciones de contenido.
- **Generacion de contenido creativo o tecnico sin moderacion**: para proyectos donde se necesita que el modelo no censure temas como la biografia de armas, la ciberseguridad ofensiva o la quimica de compuestos peligrosos, siempre dentro de un entorno controlado.

## Benchmarks y rendimiento

Los datos de rendimiento provienen de la model card del autor. No se han publicado resultados de benchmarks en la informacion disponible fuera de la model card.

| Modelo | MMLU (0-shot) | Tasa de rechazo (think OFF) | Tasa de rechazo (think ON) | Tareas avanzadas (8) |
|---|---|---|---|---|
| Qwen3.8-27B (stock) | 84,6% | ~100% | ~100% | 7/8 |
| V1 (abliteracion agresiva) | 81,4% | 0,0% | N/A | No evaluado |
| V2 (mezcla 60/40) | 84,3% | 0,24% (2/842) | ~33% (5/15) | 7/8 |
| **V3 (OBLITERATED)** | **83,7%** | **0,0% (0/15)** | **0,0% (0/15)** | **7/8** |

El modelo V3 mantiene un rendimiento practico identico al stock en tareas reales (7/8), con una perdida de 0,9 puntos en MMLU respecto al modelo base. La tasa de rechazo es cero en ambos modos de razonamiento, lo que lo diferencia de V2, que rechazaba en el modo thinking.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con pesos en bfloat16, el modelo necesita aproximadamente 54 GB de VRAM (26,9 GB de pesos + overhead de activaciones). Con cuantizacion de 4 bits (GGUF Q4_K_M) cabe en unos 15-16 GB de VRAM.
- **GPU recomendadas**: para uso en bfloat16, se recomiendan A100 (80 GB), H100 (80 GB) o dos RTX 4090 en paralelo. Para cuantizacion 4 bits, una RTX 4090 (24 GB) o una RTX 3090 (24 GB) son suficientes.
- **Compatibilidad con consumer GPU**: si, con cuantizacion Q4 o Q8 es posible en GPUs de 24 GB (RTX 3090/4090). Sin cuantizacion, no es viable en GPU de consumo.
- **Opciones de despliegue**: se puede servir con vLLM, llama.cpp (a traves de GGUF), Ollama (si se crea un Modelfile) y TGI. Para Apple Silicon, se proporciona MLX.
- **Latencia y throughput**: no hay datos publicados. En una A100 80 GB con vLLM y batch de 1, se espera una velocidad de generacion de 30-50 tokens/s para un modelo de 27B con cuantizacion, pero no se han publicado mediciones concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU (0-shot) | Licencia | Disponibilidad |
|-------|------------|----------|---------------|----------|----------------|
| Qwen3.8-27B (stock) | 26,9 B | No disponible | 84,6% | Apache 2.0 | Hugging Face |
| **Qwen3.8-27B-OBLITERATED (V3)** | 26,9 B | No disponible | 83,7% | Apache 2.0 | Hugging Face |
| Qwen3.8-30B-A3B (MoE) | 30,5 B (3,3 B activos) | No disponible | No disponible | Apache 2.0 | No confirmado |

La comparativa con otros modelos abliterados de la misma familia no esta disponible en la informacion proporcionada. El modelo se distingue del stock por su cero tasa de rechazo, con un coste minimo en MMLU.

## Limitaciones y advertencias

- **Modelo sin censura**: el modelo ha sido disenado para eliminar los rechazos de seguridad. Esto significa que puede generar contenido danino, ilegal o peligroso (ciberataques, quimica, armas, etc.) sin restriccion. Su uso esta pensado para investigacion de seguridad y red teaming, no para produccion general.
- **Riesgo de alucinacion**: como cualquier modelo de lenguaje, puede inventar datos o hechos. El modo de decodificacion greedy (temperatura 0) recomendado reduce la variabilidad, pero no elimina las alucinaciones.
- **Sesgos**: el modelo base Qwen3.8-27B puede tener sesgos linguisticos y culturales. La abliteration no corrige sesgos, solo elimina rechazos.
- **Restricciones de licencia**: la licencia Apache 2.0 permite uso comercial, pero el modelo puede no ser aceptado en plataformas que exigen politicas de contenido seguro. Ademas, el autor recomienda desactivar el modo thinking para evitar rechazos residuales.
- **Recomendaciones de uso**: el autor indica que el sistema prompt debe estar vacio, la temperatura a 0 y el repetition penalty a 1,15. Cambios en estos parametros pueden degradar la calidad o reintroducir rechazos.
- **Riesgo de alucinacion en tareas de seguridad**: el modelo puede generar comandos o codigo peligroso que no funciona o que causa danos si se ejecuta. Es necesario un entorno aislado.

## Enlaces

- HuggingFace: https://huggingface.co/JACK-POTTSSON/Qwen3.8-27B-OBLITERATEDpintus
- Repositorio de investigacion OBLITERATUS: https://github.com/elder-plinius/OBLITERATUS
- Blog de ExplainX sobre el modelo: https://www.explainx.ai/blog/pliny-qwen3-8-27b-obliterated-alex-finn-mac-august-2026
- vLLM Recipes (documentacion de la arquitectura Qwen3.8-27B): https://recipes.vllm.ai/Qwen/Qwen3.8-27B
- Blog de kie.ai sobre Qwen3.8-27B: https://kie.ai/blog/qwen-3-8-27b-27b-dense-multimodal-local-model
