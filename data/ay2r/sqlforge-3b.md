# ay2r/sqlforge-3b

## Resumen

SQLForge-3B es un modelo de lenguaje especializado en text-to-SQL para el dialecto SQLite, desarrollado por el usuario ay2r y publicado en Hugging Face. Se trata de un fine-tune del modelo base Qwen2.5-Coder-3B-Instruct, ajustado mediante QLoRA sobre datos de entrenamiento de los conjuntos Spider y BIRD. El modelo resuelve el problema de traducir preguntas en lenguaje natural a consultas SQL ejecutables a partir de un esquema de base de datos proporcionado en el prompt.

Con 3.085.938.688 parámetros totales, el modelo se posiciona como una alternativa ligera y desplegable en hardware de consumo. Su relevancia radica en que demuestra que un ajuste fino eficiente (QLoRA sobre una única GPU de portátil de 8 GB) puede mejorar de forma sustancial el rendimiento de un modelo base de 3B en una tarea estructurada: pasa de 71,8 a 78,5 de execution accuracy en Spider dev y de 41,7 a 53,1 en BIRD dev. Esto lo hace atractivo para pipelines de generación de consultas en producción donde el coste y la latencia importan.

El modelo forma parte del proyecto SQLForge, que incluye además un arnés de evaluación, despliegue con vLLM, cuantización, capas de guardrails, autocorrección y observabilidad. La licencia es qwen-research, derivada del modelo base, lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 3.085.938.688 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens de entrenamiento (contexto nativo del modelo base Qwen2.5: 32.768 tokens) |
| Tipos de cuantizacion | bf16, FP8 (vLLM), GGUF Q8_0, GGUF Q4_K_M, AWQ W4A16 |
| Idiomas soportados | en (ingles) |
| Licencia | qwen-research (other) |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2, un transformer decoder-only con atención causal estándar. El ajuste fino se realizó con QLoRA: la base se cuantizó a NF4 de 4 bits y se aplicaron adaptadores LoRA con r=16, alpha=32 y dropout de 0,05 sobre todas las proyecciones de atención y MLP, lo que representa el 0,96 % de los parámetros. La pérdida se calculó únicamente sobre la completación SQL, no sobre el prompt.

Los datos de entrenamiento constan de 16.218 ejemplos: 8.140 de Spider train y 8.078 de BIRD train, procedentes de 201 bases de datos. Se descartaron 478 ejemplos de BIRD cuyo SQL de referencia no ejecutaba y se excluyó la base `formula_1` por solapamiento con BIRD dev. El autor declara una comprobación de contaminación que confirma que no aparecen bases de datos ni preguntas de dev en el entrenamiento. El entrenamiento consistió en 1 época (1.014 pasos), learning rate 2e-4 con decaimiento coseno, batch efectivo de 16, longitud máxima de 2.048, AdamW paginado de 8 bits y checkpointing de gradientes. Se ejecutó en una única GPU de portátil RTX 5060 de 8 GB durante 7,2 horas con un pico de 3,5 GB de memoria.

## Capacidades

- Generación de consultas SQLite a partir de un esquema DDL y una pregunta en lenguaje natural.
- Soporte de pistas de dominio estilo BIRD (`### Hint`) en el prompt.
- Generación de SQL con formato estricto: devuelve solo la consulta, sin explicación.
- Aceptación de filas de muestra por tabla en el prompt para mejorar la comprensión del esquema.
- Plantilla de chat compatible con `apply_chat_template` de transformers.
- Compatible con text-generation-inference y endpoints de Hugging Face.
- No soporta tool calling ni function calling de forma nativa.
- No soporta razonamiento multi-paso autónomo; la autocorrección se implementa externamente en el pipeline del proyecto.
- Capacidades multilingües limitadas al inglés.

## Casos de uso

- Generación de consultas en asistentes de BI: el modelo traduce preguntas de negocio a SQLite sobre esquemas dados, con 78,5 de EX en Spider dev, lo que permite integrarlo en herramientas de analítica conversacional.
- Automatización de informes internos: dado un esquema y una pregunta, produce la consulta ejecutable que alimenta dashboards o exportaciones periódicas, con la ventaja de que el modelo cabe en una GPU de consumo.
- Prototipado rápido de interfaces text-to-SQL: al ser un modelo de 3B con variantes GGUF de 1,8 GB, se puede desplegar en local con Ollama o llama.cpp para validar productos sin infraestructura dedicada.
- Evaluación y benchmarking de pipelines: sirve como modelo de referencia ligero para comparar estrategias de schema linking, autocorrección y guardrails en el arnés de evaluación del proyecto SQLForge.
- Servicio de consultas con prefix caching: con vLLM y `--enable-prefix-caching`, las preguntas sobre la misma base de datos comparten el prefijo del esquema, lo que el autor midió como 4,7× de throughput en BIRD.
- Generación de SQL en entornos educativos: permite a estudiantes practicar consultas SQLite comparando su solución con la generada por el modelo, siempre con ejecución en modo de solo lectura.
- Preprocesamiento de datos tabulares: el modelo puede generar consultas de extracción y agregación sobre bases SQLite para pipelines de ETL ligeros.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados de forma independiente). Execution accuracy (EX): el conjunto de resultados de la consulta predicha coincide con el de la consulta de referencia. Decodificación greedy, esquema en DDL más 3 filas de muestra por tabla.

| Modelo | Spider dev EX | BIRD dev EX* |
|---|---|---|
| Qwen2.5-Coder-3B-Instruct (base) | 71,8 | 41,7 |
| SQLForge-3B run 1 (solo Spider) | 78,0 | 43,5 |
| SQLForge-3B (este modelo) | 78,5 | 53,1 |
| + corrección determinista de columnas + autocorrección guiada por ejecución | 80,5 | 54,1 |

\* Subconjunto fijo aleatorio de 500 preguntas de BIRD dev (semilla 42); pistas de evidencia incluidas en el prompt.

Variantes cuantizadas:

| Variante | Tamano | Spider EX | BIRD EX |
|---|---|---|---|
| bf16 | 5,8 GB | 78,5 | 53,1 |
| FP8 (vLLM, online) | pesos 3,2 GB en VRAM | 78,6 | 52,7 |
| GGUF Q8_0 | 3,3 GB | 78,4 | 52,5 |
| GGUF Q4_K_M | 1,8 GB | 76,6 | 52,7 |
| AWQ W4A16 | 2,0 GB | 75,2 | 51,9 |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 6 GB de pesos más overhead de activaciones y KV cache; el autor reporta 5,8 GB de pesos.
- VRAM en FP8 (vLLM): 3,2 GB de pesos en VRAM.
- VRAM en GGUF Q4_K_M: 1,8 GB, desplegable en GPUs de 4 GB o incluso en CPU.
- GPU recomendadas: RTX 4090, A100, H100 para mayor throughput; RTX 3060/4060 de 8 GB o superiores para inferencia local en bf16.
- Cabe en GPUs de consumo: sí, en cualquier GPU con 6 GB o más en bf16 y en GPUs de 4 GB con cuantización Q4.
- Opciones de despliegue: transformers, vLLM (recomendado con `--quantization fp8 --enable-prefix-caching`), llama.cpp, Ollama, text-generation-inference.
- Throughput: el autor reporta 4,7× de mejora con prefix caching en BIRD al compartir el prefijo del esquema entre preguntas de la misma base de datos. No se publican cifras absolutas de tokens por segundo.
- Entrenamiento: una RTX 5060 Laptop de 8 GB, 7,2 horas, pico de 3,5 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Spider dev EX | BIRD dev EX | Licencia |
|---|---|---|---|---|---|
| SQLForge-3B | 3,09B | 2.048 (entrenamiento) | 78,5 | 53,1 | qwen-research |
| Qwen2.5-Coder-3B-Instruct (base) | 3,09B | 32.768 | 71,8 | 41,7 | qwen-research |
| SQLForge-3B run 1 (solo Spider) | 3,09B | 2.048 | 78,0 | 43,5 | qwen-research |

No se dispone en la informacion proporcionada de datos de otros modelos especializados en text-to-SQL comparables (por ejemplo, variantes de CodeLlama o modelos específicos de SQLite) para establecer una comparativa externa.

## Limitaciones y advertencias

- Solo dialecto SQLite: entrenado y evaluado exclusivamente en SQLite; otros dialectos requerirán adaptación.
- Alucinación de nombres de columna: es el principal modo de fallo, con 66 de 1.034 respuestas afectadas en Spider dev y 53 de 500 en BIRD. En Spider suelen ser errores cercanos (`pet_type` por `PetType`) corregibles con posprocesamiento determinista; en BIRD son mayoritariamente inventados.
- Debilidad en preguntas difíciles: 36 % de EX en preguntas "challenging" de BIRD y en preguntas que requieren conocimiento de dominio a nivel de valores sin pista.
- Esquemas muy anchos: prompts superiores a unos 8.000 tokens requieren schema linking, implementado en el pipeline de servicio del proyecto.
- Riesgo de inyección de prompt: como cualquier LLM, puede ser manipulado para emitir SQL destructivo; el autor observó `DROP TABLE`. Nunca debe ejecutarse su salida sin guardrails; el proyecto incluye una capa de solo lectura.
- Licencia qwen-research: derivada de Qwen2.5-Coder-3B-Instruct, con restricciones para uso comercial; es necesario revisar la licencia del modelo base antes de redistribuir.
- Idioma: solo inglés; no se ha validado su comportamiento en castellano ni en otros idiomas.
- Datos de benchmarks no verificados de forma independiente: los resultados proceden de la model card del autor.
- Contexto de entrenamiento limitado a 2.048 tokens, aunque el modelo base soporta 32.768; el rendimiento más allá de esa longitud no está validado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ay2r/sqlforge-3b
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-3B-Instruct
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct/blob/main/LICENSE
- Dataset Spider: https://yale-lily.github.io/spider
- Dataset BIRD: https://bird-bench.github.io/
