# ornith-ai/Ornith-1.5-9B-MLX-6bit

## Resumen

Ornith-1.5-9B es un modelo de lenguaje denso de aproximadamente 9 000 millones de parámetros desarrollado por ornith-ai, una iniciativa centrada en la construcción de modelos fundacionales mediante auto-mejora de extremo a extremo. Este modelo es el miembro más ligero de la familia Ornith-1.5, que también incluye variantes MoE de 35B y 397B. Ornith-1.5 se construye sobre las arquitecturas de Qwen3.5 y Gemma4, a las que se aplica un proceso de preentrenamiento continuado, mid-training y post-training, con un bucle de auto-mejora que optimiza conjuntamente la generación de tareas, la construcción de scaffolds y los rollouts de soluciones mediante aprendizaje por refuerzo.

El modelo está diseñado para tareas de razonamiento, agente y codificación, y según los datos publicados alcanza resultados competitivos en benchmarks de ingeniería de software como SWE-bench Verified (70,6) y Terminal-Bench 2.1 (46,2), superando a modelos de tamaño similar como Qwen3.5-9B. Esta versión concreta, Ornith-1.5-9B-MLX-6bit, es una conversión al formato MLX con cuantización de 6 bits, pensada para su ejecución eficiente en hardware Apple Silicon. El repositorio contiene los pesos en formato safetensors y está etiquetado para generación de texto en inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen3.5 y Gemma4) |
| Parametros totales | ~9B (modelo original); 1.959.473.664 pesos en este repo MLX 6-bit |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 6-bit (este repo); se mencionan variantes Mobile cuantizadas |
| Idiomas soportados | Ingles (etiqueta "en") |
| Licencia | No disponible |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

Ornith-1.5-9B es un modelo transformer denso que parte de las arquitecturas de Qwen3.5 y Gemma4. Sobre esa base se aplica un proceso de preentrenamiento continuado, mid-training y post-training. La innovacion principal reside en el bucle de auto-mejora: en lugar de depender de un conjunto fijo de tareas curadas por humanos y harnesses disenados manualmente, el modelo genera continuamente nuevas tareas de entrenamiento, descubre estrategias efectivas para resolverlas y mejora la politica mediante aprendizaje por refuerzo. Este enfoque, denominado "self-scaffolding", optimiza de forma conjunta la generacion de tareas, la construccion del scaffold y los rollouts de soluciones. No se dispone de informacion detallada sobre el numero de tokens de entrenamiento ni la composicion exacta del dataset.

## Capacidades

- Generacion de texto y razonamiento general, con especial enfasis en tareas de codificacion y agentes.
- Razonamiento multi-paso y uso de herramientas (tool calling) implicito en los benchmarks de agente (Terminal-Bench, SWE-bench).
- Capacidad para operar como agente autonomo en entornos de terminal y repositorios de codigo, segun los resultados de SWE-bench Verified y Pro.
- Soporte multilingue limitado: el modelo esta etiquetado solo para ingles.
- No se documentan capacidades de vision, audio ni modo thinking explicito en la informacion disponible.

## Casos de uso

- Resolucion de incidencias en repositorios de software: el modelo puede abordar issues reales de GitHub, como demuestra su puntuacion de 70,6 en SWE-bench Verified, lo que lo hace util para automatizar parte del mantenimiento de codigo.
- Asistente de terminal para desarrolladores: con 46,2 en Terminal-Bench 2.1, puede ejecutar comandos, interpretar salidas y completar tareas administrativas en entornos de linea de comandos.
- Generacion y revision de codigo en pipelines de CI/CD: su capacidad de razonamiento sobre codigo permite integrarlo en flujos de integracion continua para detectar errores o proponer parches.
- Agente de automatizacion de tareas de ingenieria: puede actuar como agente que planifica y ejecuta secuencias de acciones en un entorno controlado, util para pruebas de software o despliegues.
- Chat tecnico especializado en ingles: su entrenamiento en codigo y razonamiento lo hace adecuado para asistentes de soporte tecnico dirigidos a desarrolladores.
- Prototipado rapido de agentes de IA en hardware Apple: al estar disponible en formato MLX 6-bit, puede desplegarse localmente en Macs con Apple Silicon para experimentacion y desarrollo.

## Benchmarks y rendimiento

Los datos publicados en la model card comparan Ornith-1.5-9B con Ornith-1.0-9B, Qwen3.5-9B, Qwen3.6-35B-A3B y Gemma-4-31B en benchmarks de codificacion:

| Benchmark | Ornith-1.5-9B | Ornith-1.0-9B | Qwen3.5-9B | Qwen3.6-35B-A3B | Gemma-4-31B |
|---|---|---|---|---|---|
| Terminal-Bench 2.1 (Terminus-2) | 46,2 | 43,1 | 21,3 | 52,5 | 42,1 |
| Terminal-Bench 2.1 (Claude Code) | 47,0 | 40,6 | 18,9 | 49,2 | - |
| SWE-bench Verified | 70,6 | 69,4 | 53,2 | 73,4 | 52,0 |
| SWE-bench Pro | 47,5 | 42,9 | 31,3 | 49,5 | 35,7 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- El modelo original en bf16 ocupa aproximadamente 19 GB, por lo que cabe en una GPU con 24 GB de VRAM (por ejemplo, RTX 3090/4090) y sirve comodamente en una GPU de 80 GB (A100/H100).
- Esta version MLX 6-bit reduce el tamano a unos 7,3 GB, lo que permite su ejecucion en Macs con Apple Silicon (M1 Pro o superior) con 16 GB de RAM unificada o mas.
- Para despliegue en servidores, se recomienda vLLM o TGI con soporte para tensor parallelism si se desea repartir la carga entre varias GPUs.
- En hardware Apple, se puede usar MLX directamente o a traves de herramientas como llama.cpp (si se convierte a GGUF) u Ollama.
- La latencia y el throughput estimados no estan disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SWE-bench Verified | Terminal-Bench 2.1 | Licencia |
|---|---|---|---|---|---|
| Ornith-1.5-9B | ~9B dense | No disponible | 70,6 | 46,2 | No disponible |
| Ornith-1.0-9B | ~9B dense | No disponible | 69,4 | 43,1 | No disponible |
| Qwen3.5-9B | ~9B dense | No disponible | 53,2 | 21,3 | No disponible |
| Qwen3.6-35B-A3B | 35B MoE (3B activos) | No disponible | 73,4 | 52,5 | No disponible |

Ornith-1.5-9B supera claramente a Qwen3.5-9B en tareas de codificacion agente, y se acerca a modelos MoE mucho mas grandes como Qwen3.6-35B-A3B, lo que lo posiciona como una opcion eficiente para despliegue en una sola GPU.

## Limitaciones y advertencias

- La licencia no esta especificada, lo que impide garantizar su uso comercial sin riesgo legal. Se recomienda contactar con ornith-ai antes de utilizarlo en produccion.
- El modelo solo soporta ingles de forma documentada; su rendimiento en otros idiomas es desconocido.
- No se dispone de informacion sobre sesgos, alucinaciones o limitaciones de contexto. Al ser un modelo de 9B, es probable que presente alucinaciones en tareas de conocimiento factual, aunque no hay datos publicados.
- La longitud de contexto no se ha publicado, lo que limita la planificacion de aplicaciones que requieran ventanas largas.
- Los benchmarks publicados se centran exclusivamente en codificacion y agentes; no hay datos sobre razonamiento general, matematicas o conocimiento enciclopedico.
- Esta version MLX 6-bit es una conversion no oficial del modelo original; puede haber ligeras perdidas de precision respecto al modelo en bf16.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ornith-ai/Ornith-1.5-9B-MLX-6bit
- Coleccion MLX de ornith-ai: https://huggingface.co/collections/ornith-ai/ornith-15-mlx
- Blog de Ornith-1.5: https://ornith.ai/ornith_1_5.html
- Sitio web de Ornith AI: https://ornith.online/
- Ficha en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/ornith-1.5-9b-ornith-ai
