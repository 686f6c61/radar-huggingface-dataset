# goodmai/Ornith-1.5-9B-MLX-4bit

## Resumen

Ornith-1.5-9B es un modelo de lenguaje denso de aproximadamente 8.950 millones de parametros, desarrollado por ornith-ai como parte de la familia Ornith-1.5. Segun la model card, la familia Ornith-1.5 se construye mediante un bucle de auto-mejora end-to-end que optimiza conjuntamente la generacion de tareas, la construccion de scaffolds (arneses de evaluacion) y las rollouts de soluciones mediante aprendizaje por refuerzo. El modelo base declarado es Qwen3.5, sobre el que se han aplicado fases de pretraining continuado, mid-training y post-training.

Este repositorio concreto (`goodmai/Ornith-1.5-9B-MLX-4bit`) es una conversion comunitaria de los pesos originales (`ornith-ai/Ornith-1.5-9B-MLX-4bit`) al formato MLX con cuantizacion de 4 bits, pensada para ejecucion en Apple Silicon sin Python, mediante la herramienta Basalt. El modelo esta orientado a generacion de texto y conversacion, con enfasis declarado en tareas de codigo y agentes (Terminal-Bench, SWE-bench), y esta etiquetado unicamente para ingles.

Su relevancia practica radica en que ofrece un modelo de 9B denso, disenado para despliegue en una sola GPU o en dispositivos Apple Silicon, con resultados de benchmarks de codigo que, segun la model card, superan a Qwen3.5-9B en Terminal-Bench 2.1 y SWE-bench Verified. La licencia no esta declarada en la informacion disponible, lo que constituye una limitacion importante para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.5, segun model card) |
| Parametros totales | 8.953.803.264 (aprox. 8,95B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (este repositorio); variante Mobile cuantizada mencionada en la model card |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors (formato MLX), libreria `mlx` |

## Arquitectura y entrenamiento

La model card describe Ornith-1.5 como una evolucion de Ornith-1.0, que a su vez se desarrollo sobre Qwen3.5 y Gemma4 con pretraining continuado adicional, mid-training y post-training. Ornith-1.5 amplia el bucle de auto-mejora desde la optimizacion de scaffolds y rollouts hasta la optimizacion conjunta de la generacion de tareas, la construccion de scaffolds y las rollouts de soluciones. En lugar de depender de un conjunto fijo de tareas curadas manualmente y arneses disenados a mano, el sistema genera continuamente nuevas tareas de entrenamiento, descubre estrategias efectivas para resolverlas y mejora la politica mediante aprendizaje por refuerzo.

No se detalla en la informacion proporcionada el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas como RLHF o DPO de forma separada del bucle RL descrito. Tampoco se especifican innovaciones de atencion (linear attention, decodificacion especulativa) ni la longitud de contexto nativa. El repositorio aqui documentado es una conversion MLX 4-bit del modelo original, no un entrenamiento nuevo.

## Capacidades

- Generacion de texto y conversacion multi-turno (pipeline `text-generation`, tag `conversational`).
- Razonamiento orientado a codigo y tareas de terminal: la model card reporta evaluaciones en Terminal-Bench 2.1 (con Terminus-2 y Claude Code) y SWE-bench Verified.
- Resolucion de problemas de ingenieria de software en entornos reales (SWE-bench), lo que implica uso de herramientas y edicion de codigo en repositorios.
- Capacidad de agente y razonamiento multi-paso, inferida del uso de scaffolds y rollouts en su entrenamiento y de los benchmarks de terminal.
- Soporte de tool calling / function calling: no confirmado explicitamente en la informacion disponible.
- Capacidades multilingues: limitadas al ingles segun el tag `en`; no se declaran otros idiomas.
- Capacidades especiales (vision, audio, thinking mode): no disponibles en la informacion proporcionada.
- Ejecucion en Apple Silicon mediante MLX y la herramienta Basalt (CLI y app macOS), sin dependencia de Python.

## Casos de uso

- Reparacion automatizada de issues en repositorios: el modelo puede recibir un problema descrito en lenguaje natural y un contexto de codigo, proponer un parche y validarlo, aprovechando su entrenamiento en SWE-bench Verified (70,6 segun la model card). Es adecuado porque ha sido entrenado especificamente para resolver tareas de ingenieria de software con feedback de ejecucion.
- Automatizacion de tareas de terminal y DevOps: con resultados de 46,2 en Terminal-Bench 2.1 (Terminus-2) y 47 con Claude Code, puede emplearse para interpretar comandos, diagnosticar fallos de shell y ejecutar secuencias de recuperacion en pipelines de CI/CD.
- Asistente de programacion en local para desarrolladores con Mac: al estar empaquetado en MLX 4-bit (5,1 GB), puede servirse con `basalt serve --model ... --rest` en Apple Silicon, permitiendo autocompletado, explicacion de codigo y refactorizacion sin enviar codigo a servicios externos.
- Agente de resolucion de tareas multi-paso: su entrenamiento basado en generacion de tareas y rollouts con recompensa lo hace adecuado para bucles de planificacion-ejecucion-verificacion, por ejemplo en automatizacion de pruebas o migraciones de codigo.
- Generacion de documentacion tecnica y explicaciones de codigo: para equipos que necesitan resumenes de repositorios, comentarios de funciones y guias de uso, con la ventaja de ejecucion local y bajo coste de infraestructura.
- Prototipado rapido de chatbots en ingles: el tag `conversational` y el pipeline de generacion de texto permiten desplegar asistentes conversacionales en ingles sobre hardware de consumo, util para demos y validacion de producto antes de escalar a modelos mayores.
- Evaluacion comparativa de modelos en investigacion: al ser una variante cuantizada de un modelo con benchmarks publicados frente a Qwen3.5-9B, Qwen3.6-35B-A3B y Gemma-4-31B, sirve como referencia para estudiar el impacto de la cuantizacion 4-bit en MLX sobre el rendimiento en tareas de codigo.

## Benchmarks y rendimiento

Datos extraidos de la model card (familia Ornith-1.5-9B). La tabla original estaba truncada en la informacion proporcionada; se recogen solo las filas completas disponibles.

| Benchmark | Ornith-1.5-9B | Ornith-1.0-9B | Qwen3.5-9B | Qwen3.6-35B-A3B | Gemma-4-31B |
|---|---|---|---|---|---|
| Terminal-Bench 2.1 (Terminus-2) | 46,2 | 43,1 | 21,3 | 52,5 | 42,1 |
| Terminal-Bench 2.1 (Claude Code) | 47 | 40,6 | 18,9 | 49,2 | no disponible |
| SWE-bench Verified | 70,6 | 69,4 | no disponible (truncado) | no disponible (truncado) | no disponible (truncado) |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks adicionales. Los valores corresponden al modelo original; no se han publicado mediciones especificas para esta conversion MLX 4-bit.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 5,1 GB en pesos 4-bit, por lo que se requiere aproximadamente 5-6 GB de memoria unificada o VRAM solo para los pesos, mas overhead de contexto KV cache.
- GPU recomendadas: no disponibles de forma explicita; el modelo esta empaquetado para Apple Silicon (MLX) y la model card lo describe como disenado para despliegue en una sola GPU.
- Cabe en GPU de consumo: si, en tarjetas con al menos 8 GB de VRAM para la variante 4-bit (estimacion basada en el tamano del repo); en Apple Silicon, en equipos con 8 GB de memoria unificada o superior.
- Opciones de despliegue: MLX mediante la libreria `mlx`; Basalt (CLI y app macOS 27+ en Apple Silicon) con `basalt serve --model goodmai/Ornith-1.5-9B-MLX-4bit --rest`; vLLM, llama.cpp, Ollama y TGI no estan confirmados para este formato MLX en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Terminal-Bench 2.1 (Terminus-2) | SWE-bench Verified | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Ornith-1.5-9B (este repo, MLX 4-bit) | 8,95B | no disponible | 46,2 | 70,6 | no disponible | Hugging Face (MLX) |
| Ornith-1.0-9B | no disponible | no disponible | 43,1 | 69,4 | no disponible | Hugging Face |
| Qwen3.5-9B | no disponible | no disponible | 21,3 | no disponible | no disponible | Hugging Face |
| Qwen3.6-35B-A3B | MoE, 35B totales / 3B activos (segun nombre) | no disponible | 52,5 | no disponible | no disponible | Hugging Face |
| Gemma-4-31B | 31B | no disponible | 42,1 | no disponible | no disponible | Hugging Face |

La comparativa se limita a los datos publicados en la model card; no se dispone de cifras de contexto, licencia ni benchmarks adicionales para el resto de modelos.

## Limitaciones y advertencias

- Licencia no declarada: no se especifican permisos de uso comercial, modificacion ni redistribucion; esto bloquea cualquier adopcion en produccion sin aclaracion previa del autor.
- Idiomas: solo ingles etiquetado; el rendimiento en castellano u otros idiomas no esta garantizado ni documentado.
- Longitud de contexto desconocida: no se puede planificar su uso en tareas de contexto largo sin medir empiricamente el limite efectivo.
- Riesgo de alucinacion: inherente a los modelos generativos; en tareas de codigo puede producir APIs inexistentes o parches incorrectos, por lo que requiere validacion con tests.
- Cuantizacion 4-bit: esta variante puede degradar ligeramente la precision respecto a los pesos originales; los benchmarks publicados corresponden al modelo original, no a esta conversion.
- Conversion comunitaria: el repositorio es de `goodmai`, no del autor original `ornith-ai`; la integridad y fidelidad de la conversion no estan verificadas por el desarrollador del modelo.
- Sesgos: no documentados en la informacion disponible; al entrenarse con datos derivados de Qwen3.5 y Gemma4, puede heredar sesgos de esos modelos base.
- Dependencia de ecosistema: el formato MLX limita el despliegue a Apple Silicon y herramientas compatibles; no se confirma soporte en vLLM, TGI o llama.cpp.
- Madurez del repositorio: 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/goodmai/Ornith-1.5-9B-MLX-4bit
- Modelo original: https://huggingface.co/ornith-ai/Ornith-1.5-9B-MLX-4bit
- Blog de Ornith-1.5: https://ornith.ai/ornith_1_5.html
- Repositorio Basalt: https://github.com/goodmai/basalt
- Demo Basalt (chat): https://goodmai-run-with-basalt.hf.space/?model=goodmai%2FOrnith-1.5-9B-MLX-4bit&role=chat
- Demo Basalt (macOS App y CLI): https://goodmai-run-with-basalt.hf.space/?model=goodmai%2FOrnith-1.5-9B-MLX-4bit&role=chat&lang=en
