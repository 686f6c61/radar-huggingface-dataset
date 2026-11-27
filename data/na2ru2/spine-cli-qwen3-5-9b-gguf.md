# NA2RU2/spine-cli-qwen3.5-9b-GGUF

## Resumen

Spine CLI Qwen3.5-9B GGUF es una cuantización en formato GGUF (Q8_0) del modelo NA2RU2/spine-cli-qwen3.5-9b, un ajuste fino supervisado (SFT) sobre una base Qwen3.5 de 9B parámetros. El modelo está especializado en una única tarea: convertir una petición en lenguaje natural coreano en un comando de la herramienta de línea de comandos Spine CLI. Lo desarrolla el usuario NA2RU2 y se distribuye con licencia Apache 2.0.

El checkpoint cubre ocho generadores de proyecto y 29 acciones adicionales, incluyendo inicialización de proyectos, tareas de desarrollo, herramientas de contrato de ejecución y flujos de Spine Cloud. El ajuste se entrenó con 10.710 ejemplos de comandos en coreano distribuidos en 37 acciones, el mismo conjunto usado en las variantes de 9B y 2B. El modelo está pensado para integrarse en un pipeline de selección de comandos, no como asistente conversacional general.

La relevancia de esta ficha radica en que es un ejemplo de modelo pequeño y altamente especializado (9.197.093.888 parámetros) orientado a una tarea de traducción intención-comando, con métricas de evaluación publicadas y un contexto de uso muy acotado (4.096 tokens en la configuración de referencia). Es un caso útil para estudiar fine-tuning de instrucciones sobre modelos Qwen y despliegue local con llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3.5; detalles de atención no disponibles) |
| Parametros totales | 9.197.093.888 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4.096 tokens en la configuración de referencia (llama-server --ctx-size 4096); máximo nativo no disponible |
| Tipos de cuantizacion | GGUF Q8_0 (esta release); otras cuantizaciones no disponibles |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q8_0); el checkpoint base está en BF16 safetensors |
| Tamaño del repo | 19,6 GB |
| Modelo base | NA2RU2/spine-cli-qwen3.5-9b (revisión ce95a5484f4a10a1f5272ce96b6af205217a968d) |
| Dataset de entrenamiento | NA2RU2/spine-cli-sft-ko (10.710 ejemplos en coreano, 37 acciones) |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El modelo es un ajuste fino supervisado (SFT) sobre un checkpoint Qwen3.5 de 9B parámetros. No se dispone de información detallada sobre la arquitectura interna de la base (número de capas, dimensiones de atención, tipo de atención o si incorpora innovaciones como decodificación especulativa). Lo que sí está documentado es el proceso de ajuste: se usaron 10.710 ejemplos de comandos en coreano repartidos en 37 acciones, el mismo conjunto para las variantes de 9B y 2B. El JSONL combinado de entrenamiento tiene SHA-256 `f1fb1932f4805deeb8a3f4e4d51f8ece14f43311c41ed7a43f8eabd4cb12ecdc`, lo que permite verificar la integridad del dataset.

No se documenta el uso de RLHF, DPO ni otras técnicas de alineación posteriores al SFT. La model card indica explícitamente que se debe usar con el modo de razonamiento (thinking) desactivado y con temperatura 0, lo que sugiere que el modelo está calibrado para decodificación greedy y respuestas deterministas de una sola línea. El dataset público contiene los ejemplos originales de generación; el conjunto combinado de entrenamiento no está publicado en su totalidad según la información disponible.

## Capacidades

- Generación de comandos Spine CLI a partir de peticiones en coreano, en una sola línea y sin explicaciones ni bloques de código.
- Cobertura de ocho generadores de proyecto y 29 acciones adicionales (inicialización, desarrollo, herramientas de contrato de ejecución y flujos de Spine Cloud).
- Selección de flags y valores correctos para cada comando.
- Modo conversacional mediante API compatible con `/v1/chat/completions`.
- Soporte de instrucciones de sistema para fijar el rol (por ejemplo, "selecciona el comando spine correspondiente").
- No se documentan capacidades de tool calling genérico, agentes multi-paso, visión, audio ni matemáticas avanzadas.
- Capacidad multilingüe limitada al coreano según el campo `language` de la model card.
- El modelo está entrenado para evitar comandos obsoletos: la evaluación reporta 0 salidas de `g route` y 0 de `g slice`.

## Casos de uso

- Integración en un CLI inteligente: el modelo recibe la descripción en coreano de lo que el usuario quiere hacer y devuelve el comando Spine exacto, que el shell puede ejecutar directamente. Es adecuado porque su salida está restringida a una línea y se evalúa con decodificación greedy.
- Asistente de incorporación para nuevos desarrolladores: dado que cubre inicialización de proyectos y tareas de desarrollo, puede guiar a usuarios que no conocen la sintaxis de Spine CLI traduciendo sus peticiones en lenguaje natural.
- Automatización de flujos de desarrollo: el modelo puede seleccionar comandos de servidor de desarrollo con recarga automática y recolección de eventos JSON Lines, como muestra el ejemplo de la model card (`spine dev --events jsonl`).
- Enrutamiento de intenciones en pipelines de CI/CD: al clasificar la petición del usuario en una de las 37 acciones y emitir el comando correspondiente, puede alimentar un orquestador que ejecute la acción sin intervención humana.
- Despliegue local con llama.cpp: al ser un GGUF Q8_0 de 9B, puede servirse con `llama-server` en una máquina con GPU consumer o incluso en CPU, lo que facilita su uso en entornos de desarrollo sin infraestructura cloud.
- Generación de documentación de comandos: a partir de una descripción funcional, el modelo produce el comando canónico, útil para mantener ejemplos sincronizados con la CLI.
- Filtro de comandos obsoletos: dado que la evaluación confirma cero salidas de comandos deprecados, puede usarse como validador en revisiones de código o scripts de migración.

## Benchmarks y rendimiento

Evaluación con decodificación greedy sobre DGX Spark, con 300 peticiones de generación independientes y 111 peticiones de otras acciones CLI.

| Métrica | Resultado |
|---|---|
| Rol de generación | 297/300 (99,0 %) |
| Flags y valores de generación | 283/300 (94,3 %) |
| Comando exacto de generación | 278/300 (92,7 %) |
| Selección de otras acciones | 108/111 (97,3 %) |
| Flags y valores de otras acciones | 107/111 (96,4 %) |
| Comando exacto de otras acciones | 105/111 (94,6 %) |
| Salidas con `g route` obsoleto | 0 |
| Salidas con `g slice` obsoleto | 0 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo GGUF ocupa 19,6 GB, correspondiente a la cuantización Q8_0 de 9B parámetros. Se recomienda al menos 20-24 GB de VRAM para cargar el modelo completo en GPU.
- GPU recomendadas: A100, H100, L40S o RTX 4090 (24 GB) para ejecución íntegra en GPU. La evaluación del autor se realizó en una DGX Spark.
- GPU consumer: cabe en RTX 4090 (24 GB) con Q8_0; en GPUs de 16 GB o menos sería necesario recurrir a cuantizaciones menores no incluidas en esta release o a ejecución parcial en CPU.
- Opciones de despliegue: `llama-server` (llama.cpp) con `--hf-repo` y `--hf-file`, tal como documenta el autor; también es compatible con endpoints OpenAI (`/v1/chat/completions`). No se documentan despliegues con vLLM, TGI u Ollama en la información disponible.
- Configuración de referencia: `--ctx-size 4096 --reasoning off`, temperatura 0 y máximo de 160 tokens nuevos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. La model card menciona una variante de 2B entrenada con el mismo dataset y las mismas 37 acciones, pero no se publican sus métricas ni especificaciones en esta ficha.

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Spine CLI Qwen3.5-9B GGUF Q8_0 | 9.197.093.888 | 4.096 (config. referencia) | Apache 2.0 | GGUF | Esta ficha |
| Spine CLI Qwen3.5-2B | No disponible | No disponible | No disponible | No disponible | Mencionado en la model card, sin datos publicados |
| Alternativas genéricas de 9B | No disponible | No disponible | No disponible | No disponible | Sin datos en la información proporcionada |

## Limitaciones y advertencias

- Modelo altamente especializado: fuera de la tarea de generación de comandos Spine CLI, su utilidad es limitada; no es un asistente conversacional general.
- Idioma restringido al coreano según la model card; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Requiere el modo de razonamiento desactivado (`--reasoning off`) y temperatura 0 para un comportamiento determinista; otros ajustes pueden degradar la precisión.
- El contexto de referencia es de 4.096 tokens; peticiones más largas pueden truncarse o degradar la calidad.
- Riesgo de alucinación en comandos no cubiertos por las 37 acciones del dataset de entrenamiento; no hay evaluación de comandos fuera de distribución.
- No se documentan sesgos específicos, pero al entrenarse solo con ejemplos en coreano puede reflejar sesgos de ese corpus.
- Licencia Apache 2.0 permite uso comercial, pero se debe conservar el archivo NOTICE y la atribución indicada por el autor.
- La evaluación se realizó con 411 peticiones en total; el tamaño muestral es limitado y las métricas pueden no generalizar a todos los entornos de uso.
- El repositorio tiene pocas descargas (289) y un solo like, lo que sugiere una validación comunitaria escasa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NA2RU2/spine-cli-qwen3.5-9b-GGUF
- Checkpoint base BF16: https://huggingface.co/NA2RU2/spine-cli-qwen3.5-9b
- Dataset de SFT: https://huggingface.co/datasets/NA2RU2/spine-cli-sft-ko
- Código fuente de Spine CLI: https://github.com/NARUBROWN/spine-cli
- Resultados por acción: evaluation.md (referenciado en la model card, dentro del repositorio)
- Licencia: LICENSE (dentro del repositorio)
- Atribución: NOTICE (dentro del repositorio)
- Release anterior: https://huggingface.co/NA2RU2/spine-cli-qwen3.5-9b-GGUF/tree/9b50bb8cc9768f40c4784d69dc906420116f8491
