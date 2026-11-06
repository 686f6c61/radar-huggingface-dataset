# moravianai/ThinEmbed-harrier-0.6b

## Resumen

ThinEmbed-harrier-0.6b es una familia de codificadores de consulta (query encoders) en formato GGUF, derivados por cuantización GPTQ del modelo `microsoft/harrier-oss-v1-0.6b`, un fine-tune de Qwen3-0.6B para recuperación de información con pooling de último token y 1024 dimensiones. Lo desarrolla Moravian AI y su propósito es muy concreto: permitir que las consultas se codifiquen en el cliente (portátil, pestaña de navegador, dispositivo edge) contra un índice de documentos ya construido con el modelo base, sin necesidad de reindexar ni de mantener un servidor de embeddings.

El modelo base tiene 596.049.920 parámetros y los ficheros publicados ocupan entre 192,4 y 235,1 MiB, frente a los 1.143 MiB de la versión fp16. La reducción se consigue redondeando cada bloque lineal directamente sobre la rejilla de cuantización K-quant de llama.cpp (Q3_K a 3,44 bpw o Q2_K a 2,625 bpw) mediante GPTQ con act-order y 300k tokens de calibración. Los vectores de consulta resultantes mantienen la compatibilidad con el espacio vectorial del índice fp32 del modelo base, con una similitud coseno de hasta 0,966 respecto al vector de consulta fp32.

Es relevante ahora porque resuelve el coste de infraestructura en la cara de consulta de un sistema RAG: elimina la necesidad de un endpoint de embeddings para las queries, funciona sin cambios en llama.cpp y en el navegador vía wllama con WebGPU o WebAssembly, y publica todo el pipeline de verificación y cuantización bajo Apache-2.0. La licencia del modelo es MIT y el idioma soportado declarado es únicamente inglés.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen3-0.6B) adaptado a retrieval, pooling de último token, salida de 1024 dimensiones, L2 normalizada |
| Parametros totales | 596.049.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128k tokens en el modelo base; en la práctica se recomienda fijar `-c 512` para consultas (a 128k llama.cpp asigna 4 GB de KV cache) |
| Tipos de cuantizacion | GPTQ sobre rejilla K-quant de llama.cpp: Q3_K (3,44 bpw) y Q2_K (2,625 bpw); tablas de tokens en Q2_K |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | GGUF (tres ficheros: Q3_K generic-EN 235,1 MiB; Q2_K SciDocs-synthetic 192,4 MiB; Q2_K generic-EN 192,4 MiB) |

## Arquitectura y entrenamiento

El modelo base `microsoft/harrier-oss-v1-0.6b` es un fine-tune de Qwen3-0.6B orientado a recuperación asimétrica: los documentos se codifican sin prompt y las consultas con una instrucción estilo E5, con pooling de último token y normalización L2 a 1024 dimensiones. ThinEmbed no reentrena el modelo: aplica GPTQ con act-order sobre secuencias de calibración por muestra (límite de 20.000 por muestra, 300k tokens en total) y redondea cada bloque lineal directamente sobre la rejilla de Q3_K o Q2_K de llama.cpp, con tabla de tokens en Q2_K. Los bytes empaquetados son idénticos a los de `gguf.quants` y el runtime reproduce la simulación en torch con una desviación de ±0,002 nDCG@10.

El autor es explícito sobre el alcance de la innovación: con el mismo tamaño, `llama-quantize --imatrix` produce ficheros de calidad in-domain equivalente y mejor out-of-domain, por lo que estos ficheros se publican como los artefactos medidos del informe con una receta de verificación, no como un cuantizador superior. La calibración del fichero Q2_K SciDocs-synthetic se hizo con consultas sintéticas de SciDocs. Todo el pipeline (exportador GPTQ, recetas de `llama-quantize`, receta de verificación y, desde el 2026-09-16, la parte de cuantización vectorial con cuantizador, compilador `.vqw`, rotación estructurada, post-pass y runtime WebGPU) está público bajo Apache-2.0.

## Capacidades

- Codificación de consultas para recuperación asimétrica: genera un vector de 1024 dimensiones compatible con índices de documentos construidos con `microsoft/harrier-oss-v1-0.6b`.
- Extracción de features (`pipeline_tag: feature-extraction`) mediante `llama-embedding` con `--pooling last --embd-normalize 2`.
- Ejecución en navegador con wllama 3.6.1 sobre WebGPU o WebAssembly (8 hilos), con descarga por trozos y verificación por consulta en la demo.
- Compatibilidad con índices almacenados en fp32, fp16 o int8 con escala por fila (en la demo, int8 con Δ nDCG de −0,0003).
- Prompt de consulta E5 fijo: `Instruct: Given a web search query, retrieve relevant passages that answer the query` seguido de `Query: <consulta>`, con EOS añadido por el tokenizador.
- No soporta tool calling, agentes, razonamiento multi-step, visión ni audio: es exclusivamente un codificador de consultas.
- Multilingüismo: no disponible; solo inglés declarado.

## Casos de uso

- Búsqueda semántica en cliente contra un índice corporativo existente: si la organización ya indexó sus documentos con harrier-0.6b, basta con distribuir el fichero Q3_K (235 MiB) a los clientes para que codifiquen las consultas localmente, sin endpoint de embeddings ni coste de servidor por query.
- RAG en aplicaciones de escritorio o herramientas internas: el proceso de inferencia pico es de 0,93 GB con `-c 512`, lo que permite embeber el codificador en una app de escritorio junto al resto del pipeline de recuperación.
- Búsqueda en navegador con privacidad de consulta: con wllama sobre WebGPU la consulta no sale del dispositivo; en una GPU integrada Intel el p50 medido es de 405 ms con 530 MiB ocupados en la pestaña, y con WebAssembly de 8 hilos 1.669 ms con 1.147 MiB.
- Recuperación científica sobre corpus de artículos: el fichero Q2_K SciDocs-synthetic (192,4 MiB) alcanza el 94,5 % del nDCG@10 fp32 en SciDocs con coseno 0,935, útil cuando 43 MiB de diferencia de tamaño importan en la distribución.
- Despliegue en dispositivos edge o portátiles de gama media: la latencia medida en un Core Ultra 7 155H con 8 hilos es de 151–160 ms por consulta con el fichero Q3_K, suficiente para búsqueda interactiva.
- Evaluación y auditoría de sistemas de recuperación: la receta de verificación pública (≥ 95 % de fp32, coseno ≥ 0,94, solapamiento top-10 ≥ 0,75) permite validar sobre el índice propio si un fichero Q2_K es aceptable antes de desplegarlo.
- Búsqueda federada o multi-dispositivo: al mantener el mismo espacio vectorial que el índice central, distintos clientes con distintas cuantizaciones pueden consultar el mismo índice sin reindexar.

## Benchmarks y rendimiento

Resultados sobre el split de test con `llama-embedding` nativo e índice de documentos fp32 del mismo modelo. Se reporta nDCG@10 (porcentaje respecto a fp32) y coseno medio del vector de consulta del cliente respecto al vector fp32.

| Corpus (consultas) | fp32 | Q3_K generic-EN | Q2_K SciDocs-synthetic | Q2_K generic-EN |
|---|---|---|---|---|
| SciFact (300) | 0,7559 | 0,7475 (98,9 %) · cos 0,962 | no disponible | 0,7284 (96,4 %) · cos 0,848 |
| NFCorpus (323) | 0,3808 | 0,3782 (99,3 %) · cos 0,959 | no disponible | no disponible |
| ArguAna (700, self-document ignorado) | 0,6665 | 0,6750 (101,3 %) · cos 0,966 | no disponible | 0,6213 (96,3 % de 0,6451, todas las consultas) |
| SciDocs (500) | 0,2269 | 0,2250 (99,2 %) · cos 0,964 | 0,2145 (94,5 %) · cos 0,935 | 0,2046 (90,1 %) · cos 0,856 |

El autor advierte que las diferencias por debajo de 0,01 nDCG@10 deben leerse como empate, que el intervalo pareado sobre consultas no incluye la varianza del sorteo de calibración (~0,01) ni la variación entre máquinas (±0,006), y que se evaluó con la instrucción E5 genérica, no con las instrucciones por tarea de MTEB, por lo que no son cifras de leaderboard.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: 0,93 GB de pico de proceso con `-c 512` y el fichero Q3_K; en navegador, 530 MiB en la pestaña con WebGPU y 1.147 MiB con WebAssembly de 8 hilos.
- GPU recomendadas: no se especifican modelos discretos; el autor reporta medidas sobre GPU integrada Intel con WebGPU y sobre CPU (Core Ultra 7 155H, 8 hilos).
- Cabe en cualquier GPU de consumo: el fichero más grande son 235,1 MiB de pesos, por debajo de los 4 GB de VRAM de las tarjetas de gama baja actuales.
- Opciones de despliegue: llama.cpp (`llama-embedding`), wllama 3.6.1 en navegador (WebGPU o WebAssembly). No se mencionan vLLM, TGI ni Ollama en la información disponible.
- Latencia y throughput: 151–160 ms por consulta en portátil (Core Ultra 7 155H, 8 hilos); p50 de 405 ms con WebGPU en GPU integrada Intel y p50 de 1.669 ms con WebAssembly de 8 hilos. No se publica throughput agregado.
- Advertencia de memoria: con el contexto por defecto de 128k, llama.cpp asigna 4 GB de KV cache; hay que fijar `-c 512` para el uso como codificador de consultas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / tamaño | Licencia | Notas |
|---|---|---|---|---|---|
| ThinEmbed-harrier-0.6b (Q3_K) | 596 M | 128k (uso práctico 512) | GGUF, 235,1 MiB | MIT | Codificador de consultas compatible con índices harrier-0.6b; 98,9–101,3 % del nDCG@10 fp32 |
| microsoft/harrier-oss-v1-0.6b (fp16) | 596 M | 128k | safetensors, 1.143 MiB | no disponible en la información | Modelo base; codifica documentos y consultas, requiere servidor |
| Qwen3-Embedding-0.6B | 596 M (aproximado, no confirmado en la información) | no disponible | no disponible | no disponible | Explícitamente incompatible: mismo tamaño y dimensión no implican el mismo espacio vectorial |
| jina-embeddings-v5-text-small | no disponible | no disponible | no disponible | no disponible | Explícitamente incompatible con índices harrier-0.6b |

## Limitaciones y advertencias

- Solo codifica consultas: no sirve para indexar documentos ni para generar embeddings de pasajes; el índice debe haberse construido previamente con `microsoft/harrier-oss-v1-0.6b` sin prompt de documento, pooling de último token, normalización L2 y 1024 dimensiones.
- Incompatible con índices de otros modelos, incluidos otros fine-tunes de Qwen3-0.6B como Qwen3-Embedding-0.6B o jina-embeddings-v5-text-small: la coincidencia de dimensión no garantiza el mismo espacio vectorial.
- Los ficheros Q2_K no generalizan entre corpus: el calibrado en SciDocs rinde 94,5 % en SciDocs pero el genérico baja al 90,1 %; el autor recomienda usar Q3_K salvo verificación previa sobre el índice propio con los umbrales indicados.
- Idioma: únicamente inglés declarado; no hay datos sobre rendimiento en castellano ni en otros idiomas.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de recuperación deficiente: una consulta codificada con un prompt distinto al E5 especificado degrada la calidad de forma no cuantificada en la información disponible.
- Sesgos: no se documentan análisis de sesgo en la información proporcionada.
- Restricciones de licencia: MIT para los pesos, sin restricción conocida para uso comercial; el pipeline de herramientas asociado es Apache-2.0.
- En producción, fijar el contexto a la longitud de la consulta para evitar la asignación de 4 GB de KV cache; y validar la cuantización contra el índice real antes de desplegar, dado que las cifras publicadas corresponden a corpus de evaluación concretos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/moravianai/ThinEmbed-harrier-0.6b
- Modelo base: https://huggingface.co/microsoft/harrier-oss-v1-0.6b
- Página del proyecto ThinEmbed: https://moravian.ai/query-encoders/
- Demo en vivo: https://moravian.ai/demo
- Repositorio del pipeline (exportador GPTQ, recetas, verificación): https://github.com/rosecky/embedding-quantization-public
- Documentación de llama.cpp (`llama-embedding`): no disponible en la información proporcionada
- wllama: no disponible en la información proporcionada
