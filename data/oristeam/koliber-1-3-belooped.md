# OrisTeam/Koliber-1.3-BeLooped

## Resumen

Koliber-1.3-BeLooped es un modelo de lenguaje experimental de tipo decoder-only desarrollado por OrisTeam, orientado exclusivamente al idioma polaco. Pertenece a la clase de modelos de aproximadamente 125M de parámetros (125.459.712 exactos segun los pesos en safetensors) y se publica como modelo base preentrenado, sin ajuste por instrucciones ni optimizacion de preferencias. Su interes no reside en el rendimiento absoluto sino en la exploracion arquitectonica: implementa capas Transformer recurrentes con pesos compartidos y una profundidad computacional configurable (x1, x2, x3).

La propuesta tecnica del modelo es investigar como asignar parametros y profundidad de computo dentro de la clase de 125M, combinando atencion causal completa con atencion de ventana deslizante alternada. Segun la model card, en su profundidad por defecto (x2) iguala a Koliber 1.2 en gramatica polaca, y en x2 y x3 obtiene la perplejidad mas baja en WikiText-2 de toda la familia Koliber.

Es relevante ahora como pieza de investigacion reproducible sobre eficiencia arquitectonica en modelos pequenos y multilingues de bajos recursos, no como modelo listo para produccion. El modelo esta entrenado solo con texto en polaco, por lo que sus resultados en benchmarks de razonamiento y conocimiento en ingles son, en palabras del autor, ruido estadistico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con capas recurrentes de pesos compartidos y atencion causal alternada (ventana deslizante + completa) |
| Parametros totales | 125.459.712 |
| Parametros activos | no disponible (no es MoE; la profundidad computacional es configurable x1/x2/x3 sobre pesos compartidos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | polaco (pl) |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria transformers, requiere custom_code) |

## Arquitectura y entrenamiento

El modelo es un Transformer decoder-only que introduce capas recurrentes con pesos compartidos: el mismo bloque se aplica varias veces, de modo que la profundidad efectiva de computo puede ajustarse en inferencia (x1, x2 o x3) sin incrementar el numero de parametros. Ademas, alterna atencion causal completa con atencion de ventana deslizante, lo que reduce el coste de atencion en secuencias largas a cambio de una ventana local limitada en ciertas capas. Koliber v1.3 se plantea como un experimento arquitectonico independiente, no como continuacion directa de v1.2.

El entrenamiento se realizo exclusivamente sobre texto en polaco. No se especifican en la informacion disponible el numero de tokens, la composicion del dataset, ni si hubo fases de RLHF o DPO; la model card indica explicitamente que es un modelo base sin instruction tuning ni preference optimization. Tampoco se detalla la estrategia de tokenizacion ni innovaciones adicionales como decodificacion especulativa.

## Capacidades

- Generacion de texto en polaco: modelado de lenguaje autoregresivo como modelo base.
- Modelado gramatical: 95,7 de accuracy en MultiBLiMP (polaco) en profundidad x2, frente a 50,0 de la linea base aleatoria.
- Profundidad computacional configurable: permite ejecutar el mismo conjunto de pesos con x1, x2 o x3 pasadas por bloque recurrente, ajustando coste y calidad.
- Modelado de lenguaje en ingles como capacidad de referencia (WikiText-2 byte perplexity 2,905 en x2), aunque no fue entrenado en ese idioma.
- No dispone de soporte documentado de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.
- No es un modelo instruct: no sigue instrucciones de forma fiable sin ajuste posterior.

## Casos de uso

- Investigacion en arquitecturas eficientes: servir como banco de pruebas reproducible para estudiar el efecto del sharing de pesos y la profundidad recurrente en modelos de 125M, comparando x1/x2/x3 con el mismo checkpoint.
- Evaluacion de modelos para polaco: medir competencia gramatical y de modelado de lenguaje en polaco con un modelo nativo, usando MultiBLiMP y WikiText-2 como referencia.
- Base para fine-tuning supervisado en polaco: al ser un modelo base de 125M, puede ajustarse para tareas concretas (clasificacion de texto, extraccion de informacion, resumen) con requisitos de computo modestos.
- Generacion de texto asistida en polaco: completado y redaccion de borradores donde no se requiera seguir instrucciones complejas, con revision humana obligatoria.
- Experimentos de eficiencia en inferencia: comparar latencia y calidad entre profundidades x1, x2 y x3 para estudiar el equilibrio coste-calidad en despliegues con recursos limitados.
- Educacion y divulgacion: ejemplo didactico de Transformer recurrente con pesos compartidos, util para cursos de arquitecturas de modelos de lenguaje.
- Prototipado de pipelines de NLP en polaco: como componente de bajo coste en fases tempranas antes de escalar a modelos mayores.

## Benchmarks y rendimiento

Datos publicados en la model card del autor. Los resultados en ingles de razonamiento y conocimiento no se incluyen porque el autor los califica de ruido (ningun Koliber se entreno en ingles).

| Benchmark | Baseline | Koliber 1.3 x2 (default) | Koliber 1.3 x1 | Koliber 1.3 x3 | Koliber 1.2 | Koliber 1.1-Preview | Koliber 1.0 |
|---|---|---|---|---|---|---|---|
| MultiBLiMP (polaco), accuracy | 50,0 | 95,7 | 94,7 | 95,7 | 95,6 | 94,0 | 88,2 |
| WikiText-2, byte perplexity (menor es mejor) | – | 2,905 | 2,988 | 2,902 | 3,033 | 3,740 | 3,757 |
| LAMBADA (OpenAI), accuracy | 0,3 | 9,5 | no disponible | no disponible | no disponible | no disponible | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,5 GB solo para pesos (125,5M x 4 bytes), mas overhead de activaciones y KV cache.
- VRAM estimada en fp16/bf16: aproximadamente 0,25 GB para pesos; en int8, unos 0,13 GB; en int4, unos 0,07 GB (estimaciones teoricas, no publicadas por el autor).
- Cabe holgadamente en cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) e incluso en CPU para inferencia de baja concurrencia.
- Opciones de despliegue: transformers con `trust_remote_code=True` (requiere el codigo custom del modelo); no hay confirmacion de soporte en vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponibles. La profundidad configurable x1/x2/x3 afecta directamente al coste de computo por token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Koliber-1.3-BeLooped | 125,5M | no disponible | pl | no disponible | Transformer recurrente con pesos compartidos, profundidad x1/x2/x3 |
| Koliber 1.2 | clase ~125M (no confirmado) | no disponible | pl | no disponible | Generacion anterior de la familia; peor WikiText-2 (3,033) |
| Koliber 1.1-Preview | clase ~125M (no confirmado) | no disponible | pl | no disponible | Version previa; WikiText-2 3,740 |
| Koliber 1.0 | clase ~125M (no confirmado) | no disponible | pl | no disponible | Primera version; MultiBLiMP 88,2 |

No se dispone de comparacion con modelos de otros autores (por ejemplo, GPT-2 small o modelos polacos de terceros) en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado solo en polaco: el rendimiento en otros idiomas, incluido el ingles, no es representativo y los benchmarks en ingles no miden capacidad real.
- Modelo base sin instruction tuning ni preference optimization: no sigue instrucciones de forma fiable y puede producir texto incoherente o repetitivo en tareas guiadas.
- Riesgo de alucinacion alto en cualquier uso factual, propio de un modelo de 125M sin alineamiento.
- Sesgos: no documentados por el autor; al entrenarse con texto web en polaco es previsible que herede sesgos del corpus, pero no hay analisis publicado.
- Licencia no disponible: no se puede confirmar el uso comercial; conviene contactar con OrisTeam antes de cualquier despliegue productivo.
- Requiere `trust_remote_code=True` por el codigo custom (`koliber_belooped`), lo que implica ejecutar codigo del autor; auditar antes de usar.
- Longitud de contexto no documentada: no se puede planificar su uso en tareas de contexto largo.
- Modelo experimental con 2 descargas y 0 likes en el momento de la ficha: sin validacion de la comunidad.
- La atencion de ventana deslizante limita la informacion global disponible en ciertas capas, lo que puede afectar a tareas que requieren dependencias de largo alcance.

## Enlaces

- Hugging Face: https://huggingface.co/OrisTeam/Koliber-1.3-BeLooped
- Model card del autor: incluida en la pagina de Hugging Face del modelo
- Paper, blog, repositorio o demo adicionales: no disponibles en la informacion proporcionada
