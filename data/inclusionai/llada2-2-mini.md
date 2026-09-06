# inclusionAI/LLaDA2.2-mini

## Resumen

LLaDA2.2-mini es un modelo de lenguaje de difusión agéntico desarrollado por inclusionAI, perteneciente a la serie LLaDA2. Se trata de la variante ligera de la familia, construida sobre la arquitectura de LLaDA2.0-mini e incorporando las innovaciones de la serie LLaDA2.2, entre las que destaca la edición Levenshtein mediante tokens de control `DELETE` e `INSERT`. Esta técnica permite al modelo corregir errores, eliminar contenido redundante y crear puntos de inserción durante la generación paralela, lo que resulta especialmente útil para tareas de tool calling con contexto largo e interacciones multi-turno.

El modelo presenta un total de 16.255.643.392 parámetros (16B) y solo 1.4B activos durante la inferencia, gracias a su arquitectura Mixture-of-Experts (MoE). Su ventana de contexto alcanza los 128K tokens, lo que lo hace adecuado para procesar documentos extensos y mantener conversaciones largas. La relevancia actual del modelo radica en su enfoque de edición de secuencias aplicado a modelos de difusión, combinado con un coste computacional reducido y una licencia Apache 2.0 que facilita su uso en entornos comerciales y de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE Diffusion Language Model con Levenshtein Editing |
| Parametros totales | 16.255.643.392 |
| Parametros activos | 1.4B |
| Longitud de contexto | 128K tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

LLaDA2.2-mini es un modelo de difusión de lenguaje basado en Mixture-of-Experts (MoE). Cuenta con 20 capas, 16 cabezas de atención, 4 cabezas KV y 256 expertos, de los cuales 8 se activan por token. La codificación posicional utiliza Rotary Position Embedding (RoPE) y el vocabulario tiene un tamaño de 157.184 tokens.

La innovación técnica principal es el mecanismo de Block Routing, que restringe la activación de expertos MoE a nivel de bloque de difusión, permitiendo un procesamiento eficiente de contextos largos en tareas agénticas. Además, el modelo incorpora Levenshtein Editing mediante los tokens de control `DELETE` e `INSERT`, que posibilitan la edición estructural de la secuencia durante la generación. Para el entrenamiento se propone L-EBPO (Levenshtein Editing ELBO-based Block-level Policy Optimization), un método de aprendizaje por refuerzo agéntico que aprovecha recompensas del entorno para mejorar la edición Levenshtein y la corrección de errores en escenarios de uso de herramientas multi-turno. No se han proporcionado datos sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas como RLHF o DPO.

## Capacidades

- Generación de texto mediante edición de secuencia con tokens `DELETE` e `INSERT`, lo que permite modificar el contenido generado sin regenerarlo por completo.
- Soporte de tool calling / function calling, con una puntuación de 47.68 en BFCL v4 y 69.02 en BFCL v3.
- Interacción multi-turno y capacidades agénticas, con resultados de 57.50 en τ²-Bench, 57.16 en Claw-Eval y 62.33 en PinchBench.
- Razonamiento matemático, con 35.05 en AIME 2026 y 61.11 en OlympiadBench.
- Generación de código, con 28.14 en LiveCodeBench v6 y 65.26 en MultiPL-E.
- Procesamiento de contexto largo, con una puntuación de 34.99 en LongBench v2, que mejora notablemente a las versiones anteriores.
- Razonamiento general y conocimiento, con 43.60 en KOR-Bench y 44.41 en GPQA-Diamond.
- Seguimiento de instrucciones, con 24.93 en IFBench y 57.03 en Multi-IF.

## Casos de uso

- Asistentes agénticos multi-turno: el modelo puede gestionar conversaciones largas con múltiples llamadas a herramientas, gracias a su ventana de 128K tokens y a la edición Levenshtein, que permite corregir respuestas erróneas sin reiniciar la generación.
- Generación de código en producción: con resultados en LiveCodeBench v6 y MultiPL-E, puede integrarse en pipelines de CI/CD para generar, revisar o corregir código, aprovechando su soporte de tool calling para interactuar con repositorios y APIs.
- Análisis de documentos extensos: su contexto de 128K tokens permite procesar contratos, informes técnicos o artículos de investigación, extrayendo información clave y generando resúmenes sin necesidad de dividir el texto.
- Corrección y edición de texto: gracias a los tokens `DELETE` e `INSERT`, puede eliminar contenido redundante, insertar texto nuevo y corregir errores en documentos existentes, lo que resulta útil en tareas de redacción asistida y revisión editorial.
- Automatización de atención al cliente: puede mantener el estado de conversaciones largas, llamar a APIs externas para consultar pedidos o gestionar incidencias, y corregir respuestas incorrectas durante la interacción.
- Investigación en modelos de difusión: al ser un modelo abierto con una arquitectura innovadora, es adecuado para estudiar técnicas de edición de secuencias y aprendizaje por refuerzo agéntico en entornos académicos o de I+D.

## Benchmarks y rendimiento

Los siguientes datos provienen de la model card oficial del modelo y comparan LLaDA2.2-mini con sus predecesores LLaDA2.0-mini y LLaDA2.1-mini.

| Categoría | Benchmark | LLaDA2.0-mini | LLaDA2.1-mini | LLaDA2.2-mini |
|---|---|---|---|---|
| Function Calling | BFCL v4 | 25.05 | 28.44 | 47.68 |
| Function Calling | BFCL v3 | 70.72 | 72.06 | 69.02 |
| Math | AIME 2026 | 37.71 | 40.37 | 35.05 |
| Math | OlympiadBench | 67.70 | 64.30 | 61.11 |
| Coding | LiveCodeBench v6 | 27.70 | 28.80 | 28.14 |
| Coding | MultiPL-E | 67.46 | 64.16 | 65.26 |
| Instruction Following | IFBench | 32.33 | 31.60 | 24.93 |
| Instruction Following | Multi-IF | 60.58 | 58.43 | 57.03 |
| Reasoning | KOR-Bench | 49.92 | 46.64 | 43.60 |
| Knowledge | GPQA-Diamond | 47.76 | 48.36 | 44.41 |
| Long Context | LongBench v2 | 15.51 | 12.13 | 34.99 |
| General Average | - | 45.68 | 45.03 | 46.47 |
| Agentic | τ²-Bench | - | - | 57.50 |
| Agentic | Claw-Eval | - | - | 57.16 |
| Agentic | PinchBench | - | - | 62.33 |
| Agentic Average | - | - | - | 59.00 |

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 16.255.643.392 parámetros. En bfloat16, los pesos ocupan aproximadamente 32.5 GB (coincidiendo con el tamaño del repositorio), por lo que se necesitaría al menos esa cantidad de VRAM más la memoria para activaciones y KV cache. No se han publicado tipos de cuantización, pero con cuantización de 4 bits la VRAM podría reducirse a un rango de 8-12 GB.
- GPU recomendadas: para cargar el modelo completo en bfloat16 se requieren GPUs con 40-80 GB de VRAM, como A100 40/80GB, H100 80GB o A6000. En GPUs de consumo como RTX 4090 24GB sería necesario aplicar cuantización.
- Opciones de despliegue: transformers (con `trust_remote_code=True` y `transformers>=5.2.0`), vLLM, llama.cpp u Ollama previa conversión a formato GGUF.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

La siguiente tabla compara LLaDA2.2-mini con las otras variantes de la misma serie.

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LLaDA2.0-mini | 16B | no disponible | no disponible | Apache 2.0 | HuggingFace |
| LLaDA2.1-mini | 16B | no disponible | no disponible | Apache 2.0 | HuggingFace |
| LLaDA2.2-mini | 16B | 1.4B | 128K | Apache 2.0 | HuggingFace |
| LLaDA2.2-flash | 100B | no disponible | no disponible | Apache 2.0 | HuggingFace |

Los benchmarks de la sección anterior muestran que LLaDA2.2-mini mejora significativamente en BFCL v4 y LongBench v2 respecto a sus predecesores, aunque presenta puntuaciones más bajas en IFBench y Multi-IF.

## Limitaciones y advertencias

- No se han publicado evaluaciones específicas de sesgos o alucinaciones para este modelo.
- Los idiomas soportados no están especificados; los benchmarks están en inglés, por lo que el rendimiento en otros idiomas puede variar.
- Requiere `transformers>=5.2.0` y `trust_remote_code=True`, lo que implica ejecutar código remoto y puede suponer un riesgo de seguridad si no se revisa.
- Los resultados en IFBench (24.93) y Multi-IF (57.03) son más bajos que en versiones anteriores, lo que sugiere una menor capacidad para seguir instrucciones complejas.
- Al ser un modelo de difusión, su comportamiento de generación difiere de los modelos autorregresivos, por lo que puede requerir adaptaciones en pipelines existentes.
- La licencia Apache 2.0 permite el uso comercial, pero exige incluir la licencia y notificar los cambios realizados.

## Enlaces

- https://huggingface.co/inclusionAI/LLaDA2.2-mini
- https://huggingface.co/inclusionAI/LLaDA2.0-mini
- https://huggingface.co/inclusionAI/LLaDA2.2-flash
- https://github.com/inclusionAI/LLaDA2.X/blob/main/LLaDA2_2_tech_report.pdf
