# RenormalizationTech/Qwen3-4B-tuneLLM-GGUF

## Resumen

Qwen3-4B-tuneLLM-GGUF es una release no oficial de Qwen3-4B, el modelo denso de 4.000 millones de parametros desarrollado por el equipo Qwen de Alibaba. La publica RenormalizationTech como parte de su portafolio de investigacion tuneLLM, centrado en cuantizacion, LoRA/QLoRA y tecnicas de steering de comportamiento. No introduce entrenamiento nuevo ni modificaciones de pesos: el contenido del repositorio es la conversion del checkpoint original a formato GGUF y su cuantizacion numerica con llama.cpp.

El artefacto incluye tres variantes de precision: BF16 (7,498 GiB), Q8_0 (3,986 GiB) y Q4_K_M (2,326 GiB), todas derivadas del checkpoint Qwen/Qwen3-4B en la revision `1cfa9a7208912126459214e8b04321603b3df60c`. El interes practico esta en que permite ejecutar un modelo de la familia Qwen3 con ventana de contexto larga en hardware de consumo mediante llama.cpp, y en que el autor documenta de forma reproducible el proceso de conversion, los hashes de los ficheros y un conjunto de mediciones de rendimiento y capacidad.

La relevancia es doble: por un lado ofrece pesos GGUF listos para usar con llama.cpp, Ollama o servidores compatibles con la API de endpoints; por otro, sirve como ejemplo metodologico de como evaluar el impacto de la cuantizacion con perplexity, paridad de tokens y subconjuntos fijos de benchmarks, en lugar de afirmar equivalencia de capacidades sin evidencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen3-4B) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen3-4B) |
| Tipos de cuantizacion | BF16, Q8_0, Q4_K_M (GGUF) |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3-4B, un transformer denso de 4.000 millones de parametros de la familia Qwen3. Esta release no entrena ni afina el modelo: aplica conversion a GGUF en BF16 y cuantizacion numerica con llama.cpp (commit `8ca5a8008b57aa39f2601546c0d07912045080a5`), sin matriz de importancia (importance matrix). El autor declara explicitamente que los pesos no cambian respecto al checkpoint original y que no se reclama ninguna mejora de capacidad.

El trabajo de ingenieria se concentra en la reproducibilidad: se incluye un archivo fuente `reproduction-dab1dae.zip` con el commit del flujo de trabajo local, un manifiesto con hashes de los ficheros del modelo y de la fuente, y los ajustes de evaluacion. Los datasets de entrenamiento y los checkpoints intermedios no se incluyen. La evaluacion combina tres niveles: una prueba de humo de ocho items con paridad exacta de tokens de entrada frente a Transformers, una medicion de perplexity sobre 32 pares pregunta/respuesta de GSM8K (contexto 512, cuatro chunks, batch 512) y un cribado posterior sobre 384 items por condicion con subconjuntos MMLU general y de fisica, GSM8K e IFEval.

## Capacidades

- Generacion de texto conversacional y de un solo turno, con el pipeline `text-generation` y compatibilidad declarada con endpoints.
- Razonamiento y matematicas basicas, ejercitadas mediante GSM8K en el cribado del autor.
- Conocimiento general y de dominio cientifico, medido con subconjuntos MMLU general y de fisica.
- Seguimiento de instrucciones, evaluado con IFEval en el cribado publicado.
- Soporte de tool calling y function calling: no confirmado en la informacion proporcionada para esta release.
- Capacidades de agente y razonamiento multi-paso: no confirmadas en la informacion proporcionada.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Capacidades especiales (vision, audio, modo thinking): no disponibles en la informacion proporcionada para esta release.

## Casos de uso

- Despliegue local en estaciones de trabajo con GPU de consumo: la variante Q4_K_M ocupa 2,326 GiB y alcanza 186,0 tokens/s en el microbenchmark del autor sobre una RTX A6000, lo que permite ejecutar el modelo en tarjetas de 8-12 GB de VRAM con offload completo.
- Prototipado rapido de asistentes conversacionales: al ser compatible con llama.cpp y con endpoints, se puede levantar un servidor local y conectar una interfaz de chat sin infraestructura adicional.
- Evaluacion comparativa de cuantizaciones: el repositorio incluye tres precisiones del mismo checkpoint con mediciones de perplexity y throughput, lo que lo convierte en un banco de pruebas para decidir que formato usar en produccion segun el compromiso tamano/calidad.
- Educacion e investigacion en cuantizacion: el archivo de reproduccion, el manifiesto de hashes y los scripts de evaluacion permiten replicar el flujo completo de conversion y medicion con llama.cpp.
- Tareas de matematicas escolares y razonamiento aritmetico: el cribado GSM8K muestra 119/128 en BF16 y 116/128 en Q4_K_M, adecuado para asistentes educativos con verificacion posterior.
- Clasificacion y respuesta a preguntas de conocimiento general: los resultados MMLU (92/128 en BF16, 89/128 en Q4_K_M) permiten usar el modelo como motor de QA en dominios acotados, siempre con validacion humana.
- Integracion en pipelines de CI/CD para pruebas de regresion de modelos: la paridad exacta de tokens de entrada frente a Transformers y el formato GGUF facilitan comparar salidas entre versiones del modelo de forma automatizada.

## Benchmarks y rendimiento

Resultados del cribado publicado por el autor sobre los mismos bytes de pesos, 384 items por condicion. Los subconjuntos MMLU son zero-shot de cuatro opciones por verosimilitud, no puntuaciones de leaderboard estandar; GSM8K usa correccion por ultimo numero; IFEval se evalua sobre 32 items.

| Condicion GGUF | MMLU general /128 | MMLU fisica /96 | GSM8K /128 | IFEval /32 |
|---|---:|---:|---:|---:|
| BF16 | 92 | 62 | 119 | 25 |
| Q8_0 | 89 | 61 | 121 | 25 |
| Q4_K_M | 89 | 61 | 116 | 24 |

Mediciones iniciales de ficheros y throughput:

| Fichero | Tamano (GiB) | Generacion (tokens/s) | Perplexity (texto corto) |
|---|---:|---:|---:|
| Qwen3-4B-BF16.gguf | 7,498 | 79,1 | 2,6299 |
| Qwen3-4B-Q8_0.gguf | 3,986 | 130,5 | 2,6282 |
| Qwen3-4B-Q4_K_M.gguf | 2,326 | 186,0 | 2,6608 |

El throughput procede de un test corto de llama-bench en una NVIDIA RTX A6000: tres repeticiones, 64 tokens generados, offload completo en GPU, flash attention activado y cuatro hilos de CPU. La perplexity se calculo con llama-perplexity sobre los primeros 32 pares de GSM8K, contexto 512, cuatro chunks y batch 512; la incertidumbre reportada por la herramienta fue de aproximadamente 0,175-0,177, superior a las diferencias observadas entre precisiones. El autor advierte que estas cifras son microbenchmarks y no latencia de produccion, y que no establecen una jerarquia de capacidades entre formatos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5-3 GB para Q4_K_M, 4,5-5 GB para Q8_0 y 8-9 GB para BF16, incluyendo overhead de contexto y cache KV.
- GPU recomendadas: RTX A6000 (medida por el autor), A100 y H100 para despliegues de mayor concurrencia; RTX 4090, 4080, 3090 y 4070 Ti para uso individual.
- Cabe en GPU de consumo: si, Q4_K_M en tarjetas de 8 GB o superiores y Q8_0 en tarjetas de 12 GB o superiores; BF16 requiere 16 GB o mas para contexto amplio.
- Opciones de despliegue: llama.cpp, Ollama, servidores compatibles con la API de endpoints y cualquier runtime que cargue GGUF; el autor no documenta vLLM ni TGI para este artefacto.
- Latencia y throughput: 79,1 tokens/s en BF16, 130,5 en Q8_0 y 186,0 en Q4_K_M sobre una RTX A6000 con offload completo, en un test de 64 tokens generados. No se publican cifras de latencia conversacional ni de procesamiento de prompt mas alla de la medicion separada con 128 tokens de prompt.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---:|---|---|---|---|
| Qwen3-4B-tuneLLM-GGUF (esta release) | 4,02 B | no disponible | GGUF BF16/Q8_0/Q4_K_M | Apache-2.0 | Cuantizacion no oficial con evaluacion reproducible |
| Qwen/Qwen3-4B (upstream) | 4,02 B | no disponible | safetensors | Apache-2.0 | Checkpoint original en BF16, sin cuantizar |
| Qwen3-4B-tuneLLM-NF4 (mismo autor) | 4,02 B | no disponible | NF4 | Apache-2.0 | Variante de cuantizacion NF4 del mismo checkpoint |
| Alternativas de ~4 B en GGUF | no disponible | no disponible | GGUF | no disponible | No se dispone de datos verificados en la informacion proporcionada |

## Limitaciones y advertencias

- Release no oficial: no esta mantenida por el equipo Qwen; los pesos y la licencia pertenecen a los autores upstream.
- Sin entrenamiento ni ajuste: no se introduce ninguna mejora de capacidad respecto a Qwen3-4B; cualquier diferencia en benchmarks debe atribuirse a ruido de cuantizacion o al muestreo de la evaluacion.
- Los subconjuntos de evaluacion son pequenos (128 items MMLU general, 96 de fisica, 128 GSM8K, 32 IFEval) y no equivalen a puntuaciones de leaderboard; las diferencias entre precisiones estan dentro o cerca de la incertidumbre reportada.
- La perplexity se midio sobre solo 32 pares de GSM8K; el autor advierte que no establece preservacion general de capacidades.
- El throughput es un microbenchmark en una unica GPU (RTX A6000) con 64 tokens generados; no representa latencia conversacional ni produccion con concurrencia.
- Riesgo de alucinacion: inherente al modelo base; no se documentan evaluaciones de factualidad ni de calibracion.
- Sesgos: no se documentan analisis de sesgo ni de toxicidad en la informacion proporcionada.
- Idiomas: la model card no declara cobertura linguistica; no se puede asumir multilingue sin verificar el modelo base.
- Contexto: la longitud de contexto no se especifica en esta release; debe consultarse la model card de Qwen/Qwen3-4B.
- Uso comercial: permitido bajo Apache-2.0, pero sujeto a los terminos del modelo upstream y a la obligacion de conservar el aviso de licencia incluido en el repositorio.
- No se incluyen datasets de entrenamiento ni checkpoints intermedios; la reproducibilidad se limita al flujo de conversion y evaluacion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/RenormalizationTech/Qwen3-4B-tuneLLM-GGUF
- Modelo base upstream: https://huggingface.co/Qwen/Qwen3-4B
- Repositorio del proyecto tuneLLM: https://github.com/RenormalizationTech/tuneLLM
- Resultados y ejemplos guardados: https://github.com/RenormalizationTech/tuneLLM/blob/main/docs/showcase.md
- Reproduccion y entorno: https://github.com/RenormalizationTech/tuneLLM/blob/main/docs/reproduce.md
- Metodos y referencias: https://github.com/RenormalizationTech/tuneLLM/blob/main/docs/references.md
- Release NF4 del mismo autor: https://huggingface.co/RenormalizationTech/Qwen3-4B-tuneLLM-NF4
- Release QLoRA de fisica: https://huggingface.co/RenormalizationTech/Qwen3-4B-tuneLLM-PRL-Writing-QLoRA
- Controles de rasgos (steering): https://huggingface.co/RenormalizationTech/qwen2.5-7b-gcad-steering-controls
- Experimento de refusal steering: https://huggingface.co/RenormalizationTech/qwen2.5-7b-refusal-steering-experiment
- Registro del trabajo NF4 sobre 27B: https://github.com/RenormalizationTech/tuneLLM/blob/main/results/qwen38_27b_nf4_execution_01.json
- Paper de GSM8K (Cobbe et al., 2021): https://arxiv.org/abs/2110.14168
