# bielquants/OpenThinkerAgent-32B

## Resumen

OpenThinkerAgent-32B es un modelo de lenguaje de 32.000 millones de parámetros especializado en tareas de agente, desarrollado por el equipo OpenThoughts-Agent dentro de su iniciativa de datos abiertos para el entrenamiento de agentes. Se construye mediante SFT de parámetros completos sobre Qwen/Qwen3-32B, partiendo de un dataset propio de 100.000 ejemplos de pares (tarea, trayectoria de agente). El repositorio analizado, `bielquants/OpenThinkerAgent-32B`, es una re-subida del modelo original publicado por el equipo en `open-thoughts/OpenThinkerAgent-32B`, con 0 descargas y 0 likes en el momento de la consulta.

El problema que aborda es la falta de modelos abiertos de escala media (32B) realmente competitivos en tareas agénticas: uso de terminal, ingeniería de software, llamada a funciones y razonamiento multi-paso. Según el autor, es el modelo de 32B entrenado con datos abiertos más fuerte en la media de siete benchmarks agénticos, con 44,8 puntos de media. Frente a su modelo base Qwen3-32B, declara subidas muy pronunciadas en SWE-Bench-Verified-100 (de 26,7 a 55,7), OpenThoughts-TBLite (de 13,7 a 41,3) y Terminal-Bench 2.0 (de 7,5 a 26,2) bajo el arnés Terminus-2.

La licencia es Apache 2.0 y los pesos se distribuyen únicamente en safetensors (bf16), con un repositorio de 65,5 GB. No se publican datos sobre idiomas soportados ni versiones cuantizadas, y el recuento de parámetros reportado en los metadatos de safetensors (676.864) es incoherente con el tamaño declarado del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (ajuste del modelo base Qwen/Qwen3-32B); detalle interno de capas no disponible en la informacion proporcionada |
| Parametros totales | 32B segun el nombre del modelo y el modelo base declarado (Qwen/Qwen3-32B); el recuento de safetensors aportado (676.864) es inconsistente y no se considera fiable |
| Parametros activos | no aplica (no se describe como modelo MoE) |
| Longitud de contexto | 32.768 tokens como cutoff_len de entrenamiento; no se especifica la ventana nativa maxima del modelo base en la informacion proporcionada |
| Tipos de cuantizacion | no disponible; solo se publican pesos en bf16 (safetensors). No se listan versiones GGUF, AWQ ni GPTQ |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers); tamano del repositorio 65,5 GB |
| Modelo base | Qwen/Qwen3-32B |
| Dataset de entrenamiento | open-thoughts/OpenThoughts-Agent-SFT-100K |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del transformer decoder-only de Qwen3-32B (modelo denso, sin mezcla de expertos). El post-entrenamiento consiste en SFT de parámetros completos, sin que la documentación mencione fases de RLHF, DPO u optimización por preferencias. Los hiperparámetros declarados son: learning rate 4e-05, scheduler coseno con warmup_ratio 0,1, batch global de 96, 5 épocas, cutoff_len de 32.768 tokens, precisión bf16 y DeepSpeed ZeRO-3.

Los datos proceden de OpenThoughts-Agent-SFT-100K, un conjunto de 100.000 pares (tarea, trayectoria de agente) construido a partir de las cuatro principales fuentes de tareas del proyecto: SWE-Smith, StackExchange-SuperUser, StackExchange-Tezos con aumento sintético e IssueTasks. Las trayectorias fueron generadas por el profesor GLM-4.7-AWQ dentro del arnés terminus-2 y filtradas para conservar únicamente trazas con al menos 5 turnos del modelo, lo que sesga el entrenamiento hacia interacciones multi-paso largas. La innovación principal no está en la arquitectura, sino en la receta de datos y en el filtrado por número de turnos.

## Capacidades

- Ejecución de tareas agénticas en terminal: interpretación de comandos, navegación por sistemas de ficheros y resolución de tareas de sistema en múltiples pasos.
- Ingeniería de software: resolución de issues y parches sobre repositorios reales (evaluado en SWE-Bench-Verified y SWE-Bench-Verified-100).
- Llamada a funciones y herramientas: 85,9 en BFCL-Parity, lo que indica soporte sólido de tool calling en formatos compatibles.
- Razonamiento multi-paso y planificación: 23,6 en GAIA-127, orientado a tareas que requieren varias acciones encadenadas.
- Generación y edición de código políglota: 32,4 en Aider-Polyglot.
- Dominios verticales: 47,8 en MedAgentBench y 44,0 en FinanceAgent-Terminal, es decir, tareas agénticas en sanidad y finanzas.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo de razonamiento explícito (thinking), visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Agentes de terminal autónomos: el modelo está entrenado específicamente sobre trazas del arnés terminus-2 con al menos 5 turnos, por lo que puede encadenar comandos, leer salidas de error y corregir la ejecución sin intervención humana en tareas de administración y diagnóstico de sistemas.
- Resolución automática de issues en repositorios: con 54,0 en SWE-Bench-Verified, es adecuado para generar parches sobre código existente y validarlos, integrándose en un flujo de revisión humana previa al merge.
- Asistentes de desarrollo integrados en CI/CD: gracias al soporte de tool calling (85,9 en BFCL-Parity) puede invocarse desde pipelines para ejecutar pruebas, interpretar fallos y proponer correcciones, con la ventana de 32.768 tokens como límite al contexto de código que se le puede pasar de una vez.
- Automatización de tareas de soporte técnico y foros: el dataset incluye StackExchange-SuperUser y StackExchange-Tezos, por lo que el modelo está alineado con la resolución de dudas técnicas paso a paso, incluyendo comandos de shell y configuración de sistemas.
- Agentes de análisis financiero: con 44,0 en FinanceAgent-Terminal, puede operar sobre herramientas de línea de comandos para extraer, transformar y resumir datos financieros dentro de un flujo reproducible.
- Flujos agénticos en el ámbito clínico: 47,8 en MedAgentBench lo sitúa como candidato para prototipos de agentes que consultan y manipulan registros clínicos estructurados, siempre con supervisión profesional y auditoría de las acciones.
- Investigación en recetas de datos para agentes: al ser un ajuste reproducible sobre un dataset abierto, sirve como referencia para experimentos de ablación sobre composición de datos, filtrado por número de turnos y elección de profesor.
- Migración de scripts a lenguaje natural: conversión de procedimientos operativos documentados en texto a secuencias de comandos ejecutables con verificación por pasos.

## Benchmarks y rendimiento

Resultados declarados por el autor, evaluados en el arnés terminus-2 con pass@1 como media de 3 ejecuciones estocásticas:

| Modelo | Arnes | SWE-Bench-Verified-100 | OpenThoughts-TBLite | Terminal-Bench 2.0 |
|---|---|---|---|---|
| Qwen/Qwen3-32B | Terminus-2 | 26,7 | 13,7 | 7,5 |
| OpenThinkerAgent-32B | Terminus-2 | 55,7 | 41,3 | 26,2 |

Suite completa de siete benchmarks (mejor arnés por benchmark):

| Benchmark | Precision |
|---|---|
| SWE-Bench-Verified | 54,0 |
| Terminal-Bench 2.0 | 26,2 |
| Aider-Polyglot | 32,4 |
| BFCL-Parity | 85,9 |
| MedAgentBench | 47,8 |
| GAIA-127 | 23,6 |
| FinanceAgent-Terminal | 44,0 |
| Media (7) | 44,8 |

No se han publicado otros resultados de benchmarks en la información disponible. El índice `model-index` de la model card no contiene entradas de resultados.

## Requisitos de hardware

Las cifras siguientes son estimaciones derivadas del tamaño de 32B parámetros y del repositorio de 65,5 GB, no datos publicados por el autor:

- VRAM estimada en bf16: aproximadamente 64 GB solo para pesos, más caché KV y activaciones; en la práctica 70-90 GB según longitud de contexto y tamaño de batch.
- VRAM estimada en int8: en torno a 32-36 GB de pesos; cuantización no publicada oficialmente.
- VRAM estimada en int4: en torno a 18-22 GB de pesos; cuantización no publicada oficialmente.
- GPU recomendadas para bf16: H100 80 GB o A100 80 GB en una sola unidad; también 2 x A100 40 GB o 2 x H100 40 GB con paralelismo tensorial.
- Consumer GPU: en bf16 no cabe en ninguna GPU de consumo. En int4 (previa cuantización por el usuario) podría caber en una RTX 4090 de 24 GB o RTX 5090, con contexto reducido. En int8 no cabe con holgura en 24 GB.
- Opciones de despliegue: la model card declara compatibilidad con Text Generation Inference (tag `text-generation-inference` y `endpoints_compatible`), además de transformers. vLLM y SGLang son opciones habituales para modelos safetensors de este tamaño. llama.cpp y Ollama requieren convertir los pesos a GGUF, algo no disponible en el repositorio.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo, TTFT ni requisitos de memoria durante la inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SWE-Bench-Verified-100 (Terminus-2) | Terminal-Bench 2.0 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| OpenThinkerAgent-32B | 32B | 32.768 (cutoff de entrenamiento) | 55,7 | 26,2 | Apache 2.0 | Pesos safetensors en HuggingFace |
| Qwen/Qwen3-32B (base) | 32B | no disponible en la informacion proporcionada | 26,7 | 7,5 | Apache 2.0 | Pesos en HuggingFace |
| Otros modelos agénticos de 32B | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada solo permite una comparación cuantitativa directa contra Qwen3-32B, que es además el modelo base sobre el que se entrena. No hay datos publicados en esta información para comparar con alternativas de la misma categoría, como otros modelos de 32B orientados a agentes o a código.

## Limitaciones y advertencias

- El repositorio analizado (`bielquants/OpenThinkerAgent-32B`) es una re-subida de 0 descargas y 0 likes; la model card apunta al repositorio original del equipo OpenThoughts. Se recomienda verificar la procedencia de los pesos antes de usarlos en producción.
- Los metadatos indican una fecha de creación de 20 de septiembre de 2026, posterior a la de la mayoría de modelos en circulación; conviene contrastar la integridad del repositorio y los hashes de los ficheros.
- El recuento de parámetros reportado por safetensors (676.864) es incompatible con un modelo de 32B, lo que sugiere un problema de metadatos o de indexación del repositorio.
- Riesgo de alucinación: no se publican evaluaciones de fidelidad factual, tasas de alucinación ni pruebas de robustez frente a entradas adversarias.
- Sesgos: el dataset de entrenamiento se compone de SWE-Smith, StackExchange-SuperUser, StackExchange-Tezos e IssueTasks, con trayectorias generadas por el profesor GLM-4.7-AWQ. Se desconoce la distribución geográfica, cultural y de género de los datos, así como el sesgo inducido por el profesor y por el filtrado de trazas de al menos 5 turnos.
- Idiomas: no se declara ningún idioma soportado en la model card ni en los metadatos, pese a que el modelo base Qwen3-32B es multilingüe. No hay garantía de rendimiento fuera del inglés.
- Contexto limitado por entrenamiento: el cutoff_len es de 32.768 tokens, por debajo de lo que ofrecen algunos modelos actuales; tareas que requieran repositorios o documentos más largos exigirán troceado o recuperación externa.
- Licencia: Apache 2.0 permite uso comercial, pero la responsabilidad sobre el origen y los derechos de los datos de entrenamiento y sobre las trayectorias generadas por el profesor recae en quien despliega el modelo.
- Despliegue: al no haber versiones cuantizadas ni GGUF publicadas, el consumo de VRAM en bf16 es elevado y obliga a GPUs de gama profesional.
- Los resultados de benchmarks provienen del propio autor, con pass@1 como media de 3 ejecuciones estocásticas, lo que implica varianza entre ejecuciones y dependencia del arnés terminus-2. No hay evaluación independiente.
- No se documentan medidas de seguridad, filtros de contenido, ni comportamiento del modelo ante peticiones dañinas, algo crítico en un modelo con acceso a terminal.

## Enlaces

- Repositorio analizado en HuggingFace: https://huggingface.co/bielquants/OpenThinkerAgent-32B
- Repositorio original del autor del modelo: https://huggingface.co/open-thoughts/OpenThinkerAgent-32B
- Modelo base: https://huggingface.co/Qwen/Qwen3-32B
- Dataset de entrenamiento: https://huggingface.co/datasets/open-thoughts/OpenThoughts-Agent-SFT-100K
- Pagina del proyecto: https://www.openthoughts.ai/blog/agent
- Repositorio de codigo: https://github.com/open-thoughts/OpenThoughts-Agent
- Coleccion de modelos y datasets: https://huggingface.co/collections/open-thoughts/openthinker-agent
- La busqueda web proporcionada no devolvio resultados relevantes para este modelo: unicamente paginas de ayuda de Google Play Store, sin relacion con OpenThinkerAgent-32B.
