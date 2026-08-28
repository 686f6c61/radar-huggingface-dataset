# nicolasramos/Qwen3.8-4B-Distill-MLX-oQ4e-fp16-mtp

## Resumen

El modelo `nicolasramos/Qwen3.8-4B-Distill-MLX-oQ4e-fp16-mtp` es una cuantizacion mixta de 4 bits del modelo `empero-ai/Qwen3.8-4B-Distill`, una destilacion completa de parametros del modelo Qwen3.8 2.4T A95B (un MoE de 2,4 billones de parametros totales con 95 mil millones activos) en la arquitectura Qwen3.5-4B. El estudiante fue entrenado sobre aproximadamente 45.000 trazas de profesor curadas, que incluyen cadenas de razonamiento densas en matematicas, razonamiento general y seguimiento de instrucciones. Esta version concreta ha sido cuantizada con la herramienta oQ (oMLX v0.6.3) en formato MLX safetensors, pensada para su uso en dispositivos Apple Silicon mediante MLX.

A pesar del nombre "4B", el archivo safetensors contiene 718.560.768 parametros, lo que sugiere que la cuantizacion podria haber reducido el numero de parametros almacenados o que el modelo base tiene una arquitectura mas pequena de lo que indica su denominacion. El repositorio tiene un tamano de 2,6 GB, coherente con una cuantizacion de 4 bits con grupo de 64. No se especifican licencia, idiomas ni contexto, por lo que estos datos se indican como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5-4B (destilacion de Qwen3.8 2.4T A95B) |
| Parametros totales | 718.560.768 (segun safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits, group size 64, mixed-precision (oQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

El modelo base `Qwen3.8-4B-Distill` es una destilacion de parametros completa del modelo Qwen3.8 2.4T A95B (un transformer MoE con 2,4 billones de parametros totales y 95 mil millones activos) en la arquitectura Qwen3.5-4B, que es un transformer denso de aproximadamente 4 mil millones de parametros. El entrenamiento del estudiante se realizo sobre unas 45.000 trazas de profesor curadas, seleccionadas de conjuntos internos de destilacion de Qwen3.8, que incluyen cadenas de razonamiento densas en matematicas, razonamiento general y seguimiento de instrucciones. No se menciona el uso de RLHF o DPO.

La cuantizacion aplicada en este repositorio utiliza oQ (oMLX v0.6.3), una herramienta de cuantizacion de precision mixta para MLX. Segun la model card, el tipo de modelo es `qwen3_5`, con 4 bits y grupo de 64. El formato de salida es MLX safetensors, optimizado para ejecucion en hardware Apple Silicon mediante la libreria MLX.

## Capacidades

- Generacion de texto y razonamiento general, heredado de la destilacion del modelo Qwen3.8.
- Razonamiento matematico y seguimiento de instrucciones, gracias a las trazas de profesor utilizadas en el entrenamiento.
- Capacidad de razonamiento en cadenas de pensamiento (chain-of-thought) densas, segun la descripcion del modelo base.
- Soporte de tool calling y function calling: no se menciona explicitamente, pero es una capacidad comun en la familia Qwen; no confirmado para esta version.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Inferencia en dispositivos Apple Silicon: al estar cuantizado en formato MLX, puede ejecutarse eficientemente en Macs con chip M1/M2/M3 mediante la libreria MLX, ideal para aplicaciones locales de generacion de texto.
- Prototipado rapido de asistentes conversacionales: su tamano reducido (718M parametros) permite cargarlo en memoria y ejecutarlo en tiempo real en equipos de desarrollo, facilitando pruebas de integracion con frameworks como LangChain o LlamaIndex.
- Educacion y experimentacion: al ser un modelo pequeno y cuantizado, es adecuado para estudiar tecnicas de destilacion y cuantizacion, o para proyectos academicos que requieran un LLM ligero.
- Generacion de texto en entornos con recursos limitados: puede desplegarse en servidores con una unica GPU de gama media (por ejemplo, RTX 3060 con 12 GB) o incluso en CPU con suficiente RAM, para tareas de autocompletado o redaccion asistida.
- Aplicaciones de razonamiento matematico en movil o edge: su capacidad de razonamiento basico puede aprovecharse en herramientas educativas o de calculo explicativo, aunque el contexto y los idiomas no estan especificados.
- Desarrollo de agentes simples: si el modelo soporta tool calling (no confirmado), podria integrarse en pipelines de automatizacion, aunque se recomienda verificar esta capacidad antes de usarlo en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni otras metricas estandar para esta cuantizacion especifica ni para el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 2,6 GB en disco, por lo que la carga en memoria requerira al menos 3-4 GB de RAM/VRAM. Con cuantizacion de 4 bits, cabe en GPUs con 4 GB de VRAM o mas.
- GPU recomendadas: cualquier GPU compatible con MLX (Apple Silicon) o, en general, GPUs NVIDIA con al menos 4 GB de VRAM (GTX 1650, RTX 3050, etc.) si se convierte a otro formato.
- Si cabe en consumer GPU: si, en GPUs de gama baja y media, asi como en Macs con Apple Silicon.
- Opciones de despliegue: MLX (nativo), conversion a GGUF para llama.cpp u Ollama, o a GPTQ/AWQ para vLLM o TGI (requiere conversion previa).
- Latencia y throughput estimados: no disponibles, pero al ser un modelo de ~718M parametros cuantizado, se espera una generacion de varios tokens por segundo en hardware moderno.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa rigurosa con modelos alternativos de la misma categoria. El modelo base `Qwen3.8-4B-Distill` podria compararse con otros modelos destilados pequenos como Qwen2.5-1.5B o Llama-3.2-1B, pero no hay datos publicos de benchmarks para esta version cuantizada. Se indica "no disponible".

## Limitaciones y advertencias

- El numero de parametros real segun safetensors (718M) no coincide con la denominacion "4B", lo que sugiere que la cuantizacion podria haber alterado la estructura de pesos o que el modelo base es mas pequeno de lo esperado. Esto puede afectar a las capacidades reales del modelo.
- No se especifica la licencia, por lo que su uso comercial es incierto. Se recomienda contactar con el autor antes de utilizarlo en proyectos de produccion.
- No se indican los idiomas soportados ni la longitud de contexto, por lo que su comportamiento multilingue y su capacidad para manejar contextos largos son desconocidos.
- Al ser una cuantizacion de 4 bits, puede producirse una degradacion en la calidad de las respuestas en comparacion con el modelo en precision completa.
- El modelo base fue entrenado sobre trazas de profesor, lo que puede implicar una menor diversidad en las respuestas y una posible dependencia de los patrones del profesor.
- No hay informacion sobre sesgos o alucinaciones especificas; se recomienda evaluar el modelo en el dominio de uso antes de desplegarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nicolasramos/Qwen3.8-4B-Distill-MLX-oQ4e-fp16-mtp
- Modelo base original: https://huggingface.co/empero-ai/Qwen3.8-4B-Distill
- Repositorio de oQ (herramienta de cuantizacion): https://github.com/jundot/omlx
- Repositorio oficial de Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Entrada en LM Studio sobre Qwen3.8: https://lmstudio.ai/models/qwen3.8
