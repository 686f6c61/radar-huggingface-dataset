# mradermacher/asm2asm-yi-1.5b-100k-float16-attn-GGUF

## Resumen

`mradermacher/asm2asm-yi-1.5b-100k-float16-attn-GGUF` es una recopilación de cuantizaciones GGUF del modelo `ahmedheakl/asm2asm-yi-1.5b-100k-float16-attn`, un ajuste fino supervisado (SFT) del modelo base Yi-1.5B orientado a la traducción entre lenguajes ensambladores (asm2asm). El autor original del ajuste es ahmedheakl, mientras que mradermacher se encarga únicamente de generar los ficheros GGUF estáticos para su uso con llama.cpp y herramientas compatibles.

El modelo cuenta con 1.476.495.360 parámetros (aproximadamente 1,5B), una arquitectura transformer densa derivada de Yi y una licencia Apache 2.0 que permite uso comercial. Está etiquetado exclusivamente en inglés y su entrenamiento se realizó mediante TRL/SFT, lo que lo convierte en un modelo especializado y no en un asistente generalista.

Su relevancia radica en que ofrece una vía práctica de ejecutar un modelo de traducción de ensamblador en hardware de consumo, con cuantizaciones que van desde 0,7 GB (Q2_K) hasta 3,1 GB (f16), lo que facilita su integración en flujos de trabajo de ingeniería inversa y análisis de binarios sin depender de infraestructura en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Yi-1.5B) |
| Parametros totales | 1.476.495.360 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base es `ahmedheakl/asm2asm-yi-1.5b-100k-float16-attn`, un ajuste fino del modelo Yi-1.5B realizado mediante SFT con la librería TRL, según las etiquetas de la model card (`trl`, `sft`, `generated_from_trainer`). La arquitectura subyacente es un transformer denso de la familia Yi, con aproximadamente 1,47 mil millones de parámetros. El sufijo `100k` en el nombre sugiere un conjunto de entrenamiento de 100.000 ejemplos, y `float16-attn` apunta a que el ajuste se realizó en precisión float16 con atención estándar, aunque no se detalla la composición exacta del dataset ni el número total de tokens de entrenamiento.

No se dispone de información sobre el uso de RLHF, DPO u otras técnicas de alineación posteriores al SFT, ni sobre innovaciones técnicas como decodificación especulativa o atención lineal. La model card del repositorio GGUF no incluye detalles sobre el proceso de entrenamiento más allá de las etiquetas mencionadas.

## Capacidades

- Traducción entre lenguajes ensambladores (asm2asm), presumiblemente entre distintas arquitecturas o dialectos de ensamblador, según el nombre del modelo.
- Generación de texto y código en el dominio del ensamblador, derivada del ajuste fino especializado.
- Conversación multi-turno: la etiqueta `conversational` en Hugging Face indica que el modelo está formateado para diálogo.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere que puede desplegarse en la infraestructura de Hugging Face Inference Endpoints.
- Capacidades multilingües: limitadas al inglés según la model card (`language: en`).
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Traducción de ensamblador entre arquitecturas: el modelo puede recibir código en un dialecto de ensamblador y generar su equivalente en otro, lo que resulta útil en migraciones de código legado entre plataformas (por ejemplo, de x86 a ARM).
- Ingeniería inversa y análisis de binarios: un analista puede introducir fragmentos de ensamblador desensamblado y obtener una versión traducida o comentada para facilitar la comprensión del flujo de ejecución.
- Asistencia en descompilación: el modelo puede servir como paso intermedio para convertir ensamblador en representaciones de más alto nivel antes de aplicar herramientas de descompilación tradicionales.
- Educación en arquitectura de computadores: permite a estudiantes comparar cómo se implementa una misma operación en distintos conjuntos de instrucciones, con un modelo ejecutable localmente en hardware modesto.
- Automatización de pipelines de portabilidad: integrado en scripts de CI/CD, puede generar borradores de traducción de rutinas críticas en ensamblador para su revisión posterior por ingenieros.
- Prototipado rápido en entornos con recursos limitados: al caber en cuantizaciones de 1 GB (Q4_K_M), puede desplegarse en portátiles o en contenedores sin GPU dedicada mediante llama.cpp u Ollama.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB con Q4_K_M, 1,7 GB con Q8_0 y 3,1 GB con f16, según los tamaños de fichero publicados.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para cuantizaciones bajas; RTX 3060, RTX 4060 o superiores para mayor velocidad; A100/H100 no son necesarias dado el tamaño del modelo.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (GTX 1650 en adelante) e incluso en CPU con llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y cualquier runtime compatible con GGUF; también es compatible con Hugging Face Inference Endpoints según la etiqueta del repositorio.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| asm2asm-yi-1.5b-100k-float16-attn (este) | 1,47B | no disponible | Apache 2.0 | GGUF, safetensors | Especializado en asm2asm, solo inglés |
| Yi-1.5B (base) | 1,5B | no disponible | Apache 2.0 | safetensors | Modelo generalista multilingüe del que deriva |
| Qwen2.5-Coder-1.5B | 1,5B | 32k (típico en la familia) | Apache 2.0 | safetensors, GGUF | Generalista de código, no especializado en ensamblador |

La comparación con Qwen2.5-Coder-1.5B se ofrece como referencia de categoría (modelo pequeño de código), pero no se dispone de datos de benchmarks que permitan comparar rendimiento en tareas asm2asm.

## Limitaciones y advertencias

- Modelo altamente especializado: su rendimiento fuera del dominio de traducción de ensamblador es previsiblemente pobre en comparación con modelos generalistas del mismo tamaño.
- Solo inglés: la model card declara únicamente `en`, por lo que no se debe esperar soporte fiable en castellano u otros idiomas.
- Riesgo de alucinación: como todo modelo generativo, puede producir instrucciones de ensamblador sintácticamente plausibles pero semánticamente incorrectas; es imprescindible validar la salida con ensambladores y tests.
- Sin datos de benchmarks: no hay evidencia publicada de calidad en tareas asm2asm, lo que dificulta evaluar su idoneidad para producción.
- Contexto no documentado: se desconoce la longitud máxima de contexto, lo que limita la planificación de entradas largas.
- Cuantizaciones estáticas únicamente: no hay cuantizaciones con imatrix disponibles, lo que puede reducir la calidad en comparación con quants ponderados.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe verificar el cumplimiento de las licencias del modelo base Yi y de los datos de entrenamiento originales.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/asm2asm-yi-1.5b-100k-float16-attn-GGUF
- Modelo base: https://huggingface.co/ahmedheakl/asm2asm-yi-1.5b-100k-float16-attn
- Página de resumen de quants del autor: https://hf.tst.eu/model#asm2asm-yi-1.5b-100k-float16-attn-GGUF
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (referencia TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
