# mradermacher/AmoreLLM-4B-GGUF

## Resumen

AmoreLLM-4B-GGUF es un repositorio de cuantizaciones estáticas en formato GGUF del modelo 3tic/AmoreLLM-4B, realizadas por mradermacher, un cuantizador conocido en la comunidad de Hugging Face por su trabajo de convertir modelos populares a formatos compatibles con llama.cpp. El modelo base, AmoreLLM-4B, es un modelo conversacional de aproximadamente 4.000 millones de parámetros etiquetado para el dominio de las novelas ligeras (lightnovel) y con soporte para chino (zh).

La relevancia de este repositorio no reside en el modelo en sí, sino en la disponibilidad de cuantizaciones que permiten ejecutar el modelo original en hardware modesto, desde CPU domésticas hasta GPU de consumo. Con versiones que van desde 1,8 GB (Q2_K) hasta 8,2 GB (f16), el modelo puede desplegarse en equipos sin GPU dedicada, lo que lo hace accesible para experimentación, uso local y aplicaciones de generación de texto en chino con recursos limitados.

Cabe señalar que la información pública sobre el modelo base es escasa: no se dispone de detalles sobre la arquitectura exacta, los datos de entrenamiento ni los benchmarks. La ficha del cuantizador se limita a describir las cuantizaciones disponibles, por lo que varias secciones de esta ficha indican datos no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformer, por compatibilidad con transformers y GGUF) |
| Parametros totales | 4.022.468.096 (≈4,02 B) |
| Parametros activos | no disponible (no hay indicios de que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | chino (zh) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (el modelo base 3tic/AmoreLLM-4B usa safetensors con la libreria transformers) |

## Arquitectura y entrenamiento

No se han publicado detalles sobre la arquitectura del modelo base 3tic/AmoreLLM-4B en la informacion disponible. Por su compatibilidad con la libreria transformers y su conversion a GGUF, se trata de un modelo de tipo transformer, pero no consta si es denso o MoE, ni su numero de capas, cabezas de atencion o dimensiones internas.

Tampoco hay informacion sobre el proceso de entrenamiento: numero de tokens, composicion del dataset, uso de RLHF/DPO o tecnicas destacables. Las etiquetas del repositorio (lightnovel, conversational, zh) sugieren un entrenamiento o ajuste orientado a la generacion de novelas ligeras y dialogo conversacional en chino, pero esto debe tomarse como indicativo y no como dato confirmado. Sobre las cuantizaciones en si, mradermacher indica que son cuants estaticos (static quants) convertidos desde el formato HF, y que existen versiones weighted/imatrix en un repositorio aparte (AmoreLLM-4B-i1-GGUF), que suelen ofrecer mejor calidad a igual tamaño.

## Capacidades

- Generacion de texto conversacional en chino, con etiqueta conversational en el repositorio.
- Generacion de contenido tipo novela ligera (tag lightnovel), sugiriendo especializacion en narrativa de ficcion larga.
- Ejecucion local mediante llama.cpp y derivados gracias al formato GGUF, con soporte de endpoints compatibles (endpoints_compatible).
- No hay informacion sobre soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo de pensamiento extendido.
- No hay informacion sobre capacidades multilingues: el unico idioma declarado es el chino.

## Casos de uso

- Escritura y continuacion de novelas ligeras en chino: el tag lightnovel del modelo sugiere que esta afinado para narrativa de ficcion; con la version Q4_K_M (2,6 GB) puede ejecutarse en local para asistir en sesiones de escritura creativa.
- Chatbot conversacional en chino en dispositivos de bajos recursos: la version Q2_K (1,8 GB) cabe en telefonos o mini-PC, permitiendo desplegar un asistente conversacional sin GPU.
- Prototipado de aplicaciones LLM en chino: la licencia apache-2.0 permite integrar el modelo en demos y MVPs sin restricciones de uso comercial.
- Inferencia por lotes en CPU: con tamaños de 2 a 3 GB, las cuants Q3 y Q4 son adecuadas para servidores sin GPU que procesen peticiones de texto en chino.
- Experimentacion de cuantizacion: al existir 12 variantes de cuant, el repositorio es util para comparar la degradacion de calidad entre niveles K-quants e IQ-quants en un modelo de 4B.
- Generacion de contenido para juegos o ficcion interactiva en chino: el tamano reducido permite integrar el modelo en tiempo real en motores de dialogo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio solo incluye una grafica generica comparativa de perplejidad entre tipos de cuant (autoría de ikawrakow), sin datos numericos concretos para este modelo.

## Requisitos de hardware

- VRAM o RAM estimada para inferencia: desde ~1,8 GB (Q2_K) hasta ~8,2 GB (f16). Las cuants recomendadas Q4_K_S y Q4_K_M ocupan 2,5 y 2,6 GB respectivamente, a las que hay que sumar memoria para el contexto (KV cache).
- GPU recomendadas: cualquier GPU moderna de consumo con 4 GB de VRAM o mas ejecuta sin problemas las cuants Q4/Q5; una RTX 3060 de 12 GB permite usar Q8_0 con contexto amplio. No se requieren A100 ni H100 para este tamano.
- Consumer GPUs: cabe sobradamente en RTX 3060, RTX 4060, RTX 4070 y superiores; incluso en GPUs de 4 GB con Q2_K/Q3_K. Tambien funciona en CPU pura (por ejemplo, con 8 GB de RAM usando Q4_K_M).
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF. El modelo base en safetensors puede desplegarse con transformers, vLLM o TGI.
- Latencia y throughput: no disponible; al ser un modelo de 4B cuantizado, se espera inferencia fluida en GPU de consumo y velocidades moderadas en CPU moderno.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| AmoreLLM-4B (base) | 4,02 B | no disponible | apache-2.0 | safetensors en HF |
| Qwen2.5-3B-Instruct | 3,09 B | 32.768 tokens | qwen (uso comercial permitido con condiciones) | safetensors, GGUF comunitarios |
| Phi-3.5-mini-instruct | 3,82 B | 128.000 tokens | MIT | safetensors, GGUF comunitarios |
| Gemma 2 2B IT | 2,61 B | 8.192 tokens | gemma | safetensors, GGUF comunitarios |

AmoreLLM-4B compite en tamano con Qwen2.5-3B y Phi-3.5-mini, aunque sin benchmarks publicados no es posible comparar rendimiento. Su ventaja diferencial seria la especializacion en novelas ligeras en chino, un nicho que los modelos generalistas no cubren de forma especifica.

## Limitaciones y advertencias

- Idioma: el unico idioma declarado es el chino (zh); su rendimiento en castellano o ingles es desconocido y probablemente limitado.
- Riesgo de alucinacion: no evaluado publicamente; al carecer de benchmarks, no hay datos sobre fiabilidad factual.
- Sesgos: no documentados; como cualquier LLM, puede reproducir sesgos presentes en sus datos de entrenamiento, que ademas son desconocidos.
- Contexto: la longitud de ventana no esta documentada, lo que dificulta planificar aplicaciones con documentos largos.
- Cuantizacion agresiva: las versiones Q2_K y Q3_K_M se senalan explicitamente como de calidad inferior; para produccion se recomienda Q4_K_M o superior, o las cuants imatrix del repositorio i1.
- Licencia: apache-2.0 permite uso comercial sin restricciones relevantes, pero conviene verificar la licencia y procedencia del modelo base 3tic/AmoreLLM-4B.
- Documentacion escasa: la ausencia de model card detallada en el modelo base exige validacion propia antes de uso en produccion.

## Enlaces

- Repositorio de cuantizaciones GGUF: https://huggingface.co/mradermacher/AmoreLLM-4B-GGUF
- Modelo base: https://huggingface.co/3tic/AmoreLLM-4B
- Cuants weighted/imatrix: https://huggingface.co/mradermacher/AmoreLLM-4B-i1-GGUF
- Pagina de descargas de mradermacher: https://hf.tst.eu/model#AmoreLLM-4B-GGUF
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas de Artefact2 sobre cuants: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador (nethype GmbH): https://www.nethype.de/
