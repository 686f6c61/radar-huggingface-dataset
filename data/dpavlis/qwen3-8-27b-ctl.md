# dpavlis/Qwen3.8-27B-CTL

## Resumen

Qwen3.8-27B-CTL es un ajuste fino del modelo base Qwen/Qwen3.8-27B, desarrollado por el usuario dpavlis, especializado en CTL2 (CloverDX Transformation Language), el lenguaje en el que los grafos de integración de datos de CloverDX implementan su lógica de negocio en componentes como Reformat, Rollup, Denormalizer, Normalizer, joiners, DataGenerator o Partition. El modelo escribe código de transformación CTL2 a partir de una descripción de tarea y metadatos de registros, explica el lenguaje y sus funciones integradas, revisa código existente emitiendo hallazgos como líneas `[ERROR]`/`[WARNING]` y corrige código a partir de mensajes de error del compilador o de ejecución.

Se trata de un checkpoint completo en bf16 con los pesos fusionados (no requiere adaptador en tiempo de servicio), construido sobre una arquitectura híbrida heredada del modelo base y entrenado mediante SFT con LoRA, DPO con LoRA y destilación de contexto on-policy. Está pensado para ejecutarse con el modo thinking activado, con un system prompt específico incluido en el repositorio y dentro de un bucle que compile y ejecute el código generado, devolviendo los errores al modelo.

Su relevancia es de nicho pero muy concreta: cubre un DSL propietario de un producto comercial de ETL con un ajuste fino dedicado, algo poco habitual en el ecosistema abierto. La licencia es Apache 2.0 y el modelo solo declara soporte para inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (arquitectura del modelo base Qwen3.8-27B; incluye bloques Mamba según la referencia al Mamba cache de vLLM) |
| Parametros totales | 27B (según el nombre del modelo base; no se detalla en la información disponible) |
| Parametros activos | no disponible |
| Longitud de contexto | 16384 tokens (configuración de servicio y de evaluación indicada por el autor) |
| Tipos de cuantizacion | bf16 en el checkpoint publicado; no se documentan otras cuantizaciones |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoint completo bf16 con pesos fusionados; librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.8-27B y conserva su arquitectura, incluida la torre de visión del modelo base para que el checkpoint cargue con la misma arquitectura, aunque el entrenamiento y la evaluación se realizaron únicamente sobre texto. La referencia del autor a los bloques de caché Mamba de vLLM y a `--max-num-seqs` indica una arquitectura híbrida con componentes de estado recurrente, un detalle operativo relevante: el valor por defecto de vLLM (1024 secuencias) excede los bloques de caché Mamba de esta arquitectura y el servidor se niega a arrancar, por lo que hay que fijar `--max-num-seqs` explícitamente (el autor usó 64 en todas las evaluaciones).

El entrenamiento consta de tres etapas sobre el dataset dpavlis/ctl_lora_sft_data: SFT con LoRA mezclando ejemplos de solo respuesta con trazas de razonamiento; DPO con LoRA sobre los pares de preferencia del dataset, dirigido a corregir funciones inventadas, hábitos de Java/Python, contratos de componente incorrectos y creencias falsas sobre el lenguaje; y destilación de contexto on-policy, en la que el modelo aprende sobre sus propias muestras a comportarse como cuando las reglas de CTL2 y las guías de revisión están en el prompt. La última ronda entrenó la revisión de código con una mezcla de código defectuoso y código limpio, lo que redujo las falsas alarmas sobre código correcto. Los hechos sobre CTL2 presentes en los datos y en el system prompt se verificaron contra el compilador de CTL y un servidor CloverDX en vivo.

## Capacidades

- Generación de código CTL2 para transformaciones de CloverDX a partir de una descripción de tarea y metadatos de registros.
- Explicación del lenguaje CTL2, sus funciones integradas y los contratos de los componentes.
- Revisión de código CTL2 con salida estructurada en líneas `[ERROR]`/`[WARNING]`.
- Corrección de código a partir de mensajes de error del compilador o de ejecución.
- Modo thinking con `reasoning_effort` configurable (`medium` en la configuración recomendada); con thinking desactivado el rendimiento cae de forma notable.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado como tal; el flujo previsto es un bucle externo de compilación y reintento (hasta dos reintentos) gestionado por la aplicación.
- Capacidades multilingües: solo inglés declarado.
- Capacidades especiales: torre de visión presente en los pesos pero no entrenada ni evaluada; sin soporte de audio.

## Casos de uso

- Generación de transformaciones Reformat en pipelines de integración de datos: el modelo recibe la descripción de la tarea y los metadatos de los registros de entrada y produce el código CTL2 del componente, que se valida con el compilador antes de desplegarse.
- Parseo y normalización de campos con formato irregular: por ejemplo, convertir cadenas como `"$(1,250.00)"` en un campo decimal, tarea que el autor usa como ejemplo de petición en la model card.
- Revisión automatizada de código CTL2 en revisión de cambios: el modelo señala defectos con líneas `[ERROR]`/`[WARNING]`, y el entrenamiento específico con código limpio busca minimizar las falsas alarmas en código correcto.
- Reparación automática de transformaciones fallidas: integrado en un bucle que compila, ejecuta sobre datos de prueba y devuelve el mensaje de error como siguiente turno de usuario, con hasta dos reintentos.
- Asistencia al desarrollador sobre el DSL: explicación de funciones integradas, palabras reservadas, sintaxis de expresiones regulares y escapes de cadena, gestión de excepciones, acumuladores de Rollup, la transformación DataIntersection, parseo estricto de fechas y aritmética de días sobre fechas UTC.
- Migración o modernización de lógica de negocio en grafos CloverDX: generación de código CTL2 para componentes como Rollup, Denormalizer, Normalizer, joiners, DataGenerator o Partition a partir de especificaciones funcionales.
- Automatización de tareas de DataGenerator y Partition en entornos de prueba: creación de datos sintéticos o de particionado con lógica expresada en CTL2, sujeta a validación en servidor.

## Benchmarks y rendimiento

Mediciones internas del autor; el código generado se ejecutó en un servidor CloverDX y se puntuó por si producía las filas de salida esperadas, no mediante un juez LLM.

| Prueba | Resultado |
|---|---|
| Generación de código en dominios nuevos (tareas reescritas distintas de los prompts de entrenamiento), thinking on | 0,93 de acierto al primer intento; 0,94 tras el bucle de compilación y reintento |
| Revisión de código limpio conocido, thinking on | casi ninguna falsa alarma `[ERROR]` |
| Revisión de código con defectos plantados y confirmados en servidor, thinking on | aproximadamente 0,95 de los defectos detectados |

Con thinking desactivado el autor indica que el modelo es marcadamente más débil en generación de código y señala código limpio como erróneo con mucha más frecuencia. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: los pesos en bf16 ocupan aproximadamente 51 GB, por lo que se necesita una GPU de 80 GB o más, o paralelismo tensorial entre varias GPU.
- GPU recomendadas: A100 80 GB, H100 80 GB o configuraciones multi-GPU con tensor parallelism. No cabe en GPU de consumo (RTX 4090 de 24 GB, etc.) en bf16.
- Despliegue: vLLM es la vía documentada por el autor (`vllm serve dpavlis/Qwen3.8-27B-CTL --served-model-name ctl2 --dtype bfloat16 --max-model-len 16384 --max-num-seqs 64 --enable-prefix-caching`). Es imprescindible fijar `--max-num-seqs` de forma explícita por la limitación de bloques de caché Mamba de la arquitectura híbrida. No se documentan opciones con llama.cpp, Ollama o TGI en la información disponible.
- Configuración de petición recomendada: system prompt completo de `system_prompt.txt` de forma literal, `chat_template_kwargs: {"enable_thinking": true, "reasoning_effort": "medium"}`, temperatura 0,4, top_p 0,95, top_k 20, máximo 16384 tokens.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas en la información proporcionada. La comparación se limita a lo que puede afirmarse con los datos disponibles.

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dpavlis/Qwen3.8-27B-CTL | 27B (según nombre del modelo base) | 16384 tokens (configuración del autor) | CTL2 / CloverDX | Apache 2.0 | Hugging Face, 0 descargas en el momento de la consulta |
| Qwen/Qwen3.8-27B (base) | 27B (según nombre) | no disponible | propósito general | no disponible en la información | Hugging Face |
| Alternativas especializadas en CTL2 | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Alcance restringido a CTL2: conoce los grafos CloverDX como contexto para CTL, pero no está entrenado para diseñar grafos completos ni para escribir el XML de los componentes.
- Componentes poco frecuentes y sus contratos (por ejemplo, componentes de control de trabajos como GetJobInput, SetJobOutput o ExecuteScript) rinden mal si no se incluye una descripción del componente en el prompt.
- Como cualquier modelo de código, puede producir código que compila y se ejecuta pero no hace lo que se pidió; hay que probar el código generado con datos reales antes de usarlo.
- El system prompt forma parte de la configuración desplegada: contiene reglas de CTL2 que el modelo sigue con más fiabilidad en contexto que solo desde el entrenamiento. Omitirlo degrada el comportamiento.
- El modo thinking es necesario en la práctica: sin él, la generación de código empeora de forma marcada y aumentan las falsas alarmas en revisión.
- Solo inglés declarado; no se documenta soporte de otros idiomas.
- La torre de visión está presente en los pesos pero no fue entrenada ni evaluada; no debe asumirse capacidad multimodal.
- Sesgos conocidos: no documentados en la información proporcionada. Riesgo de alucinación de funciones o contratos de componente: el DPO se dirigió específicamente a este problema, pero persiste el riesgo inherente.
- Restricciones de licencia: Apache 2.0 permite uso comercial; deben respetarse las condiciones de la licencia del modelo base Qwen/Qwen3.8-27B, no detalladas en la información disponible.
- Operación en vLLM: el valor por defecto de `--max-num-seqs` impide el arranque del servidor con esta arquitectura híbrida; hay que fijarlo explícitamente.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dpavlis/Qwen3.8-27B-CTL
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Dataset de entrenamiento: https://huggingface.co/datasets/dpavlis/ctl_lora_sft_data
- System prompt del repositorio: https://huggingface.co/dpavlis/Qwen3.8-27B-CTL/blob/main/system_prompt.txt
- Papers, blogs, repositorios o demos adicionales: no disponibles en la información proporcionada.
