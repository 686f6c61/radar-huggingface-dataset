# AtomicChat/LFM3-VL-2B-GGUF

## Resumen

LFM3-VL-2B-GGUF es una colección de cuantizaciones GGUF en formato dinámico (Atomic-Dynamic, AD) del modelo multimodal LiquidAI/LFM3-VL-2B, publicada por AtomicChat en Hugging Face. El modelo base es un modelo de visión-lenguaje de aproximadamente 1,73 mil millones de parámetros desarrollado por LiquidAI, construido sobre la arquitectura híbrida LFM3, que combina capas de convolución corta con atención con compuerta (gated attention). Esta publicación resuelve un problema práctico concreto: permitir ejecutar el modelo de forma local y offline en hardware de consumo, algo especialmente relevante porque, según el propio autor, se trata de un modelo híbrido pequeño y bastante sensible a la cuantización.

La relevancia de esta ficha radica en que las cuantizaciones AD no son los presets estándar de llama.cpp: aplican un esquema por tensor según el rol de cada capa (las FFN se comprimen por bandas de profundidad, mientras que las compuertas de atención y los proyectores K/V de atención se mantienen a precisión alta), lo que permite conservar calidad a bits por peso inferiores. El repositorio incluye el proyector de visión en GGUF (`mmproj`) para usar las capacidades de imagen-texto-a-texto directamente con `llama-mtmd-cli`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida LFM3 (convolucion corta + gated attention), vision-language |
| Parametros totales | 1.728.801.600 (dato real de safetensors del modelo base) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0, AD-Q6_K, AD-Q5_K_M, AD-Q4_K_M, AD-IQ4_XS, AD-IQ3_S; mmproj en F16 y BF16 |
| Idiomas soportados | en, zh, de, fr, es, ja, ar, ko |
| Licencia | LFM Open License v1.0 (lfm-open-license-v1.0, tipo "other") |
| Formato de pesos | GGUF (cuantizado); modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base, LiquidAI/LFM3-VL-2B, emplea la arquitectura hibrida LFM3 descrita por AtomicChat como "short-convolution + gated attention": combina mezcladores de convolucion corta con capas de atencion con compuerta, en lugar del transformer clasico con atencion total. Sobre este backbone se monta un proyector de vision que habilita la tarea de imagen-texto-a-texto. No hay datos publicados en la informacion disponible sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO.

La innovacion principal de esta publicacion es el esquema de cuantizacion Atomic-Dynamic (AD): un layout por tensor segun el rol de la capa. Las FFN se comprimen por bandas de profundidad, mientras que `attn_gate` y `attn_k/v` se mantienen a precision alta, los mezcladores de convolucion corta siguen el tratamiento de la atencion, y embeddings y cabeza de salida se mantienen altos. El autor indica que los rungs AD sustituyen a los presets estandar de llama.cpp (sin imatrix) en todos los tamanos, y que el modelo hibrido pequeño es bastante sensible a la cuantizacion, de ahi el cuidado en la seleccion por tensor.

## Capacidades

- Generacion de texto conversacional en ocho idiomas: ingles, chino, aleman, frances, espanol, japones, arabe y coreano.
- Comprension y descripcion de imagenes (pipeline image-text-to-text) mediante el proyector de vision incluido (`mmproj-LFM3-VL-2B-F16.gguf`).
- Ejecucion totalmente local y offline gracias al formato GGUF, compatible con llama.cpp.
- Soporte de tool calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la informacion proporcionada.
- Capacidades de thinking mode, audio o video: no disponibles en la informacion proporcionada.

## Casos de uso

- Descripcion y analisis de imagenes en local: combinando cualquier rung con el `mmproj` F16 via `llama-mtmd-cli`, se pueden describir imagenes sin enviar datos a la nube, util para privacidad y entornos sin conexion.
- Asistentes conversacionales offline en la app Atomic Chat: el equipo publicador desarrolla una aplicacion que ejecuta modelos de pesos abiertos localmente; este GGUF encaja en ese flujo de uso en escritorio.
- Despliegue en portatiles y equipos sin GPU dedicada: con rungs de 0,92 a 1,85 GB en disco, el modelo cabe en la RAM de equipos modestos, incluido el rung AD-IQ3_S de 0,92 GB para dispositivos muy limitados.
- Chat multilingue con consumo minimo de recursos: soporte de ocho idiomas con un modelo de menos de 2B de parametros, adecuado para interfaces de usuario en varios idiomas en hardware de consumo.
- Investigacion sobre cuantizacion de arquitecturas hibridas: los rungs AD-IQ3_S y AD-IQ4_XS, junto con las metricas de top-1 y KLD frente a BF16, sirven como material de estudio sobre sensibilidad a la cuantizacion en modelos con convolucion corta.
- Prototipado rapido con llama-cli: la carga directa desde Hugging Face (`llama-cli -hf AtomicChat/LFM3-VL-2B-GGUF:AD-Q4_K_M`) permite probar el modelo en una linea de comandos sin descargas manuales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor si publica metricas de fidelidad de cuantizacion frente al original BF16 (conjunto neutral de 30 lenguajes):

| Rung | GB en disco | bpw | top-1 | KLD medio |
|---|---|---|---|---|
| Q8_0 | 1,85 | 8,51 | 96,6 % | 0,003 |
| AD-Q6_K | 1,59 | 7,31 | 94,9 % | 0,006 |
| AD-Q5_K_M | 1,31 | 6,03 | 90,7 % | 0,024 |
| AD-Q4_K_M | 1,13 | 5,20 | 85,8 % | 0,061 |
| AD-IQ4_XS | 1,09 | 5,02 | 83,8 % | 0,078 |
| AD-IQ3_S | 0,92 | 4,23 | 78,3 % | 0,151 |

AD-Q4_K_M es el rung recomendado por defecto; AD-IQ3_S se califica como de grado investigador.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: entre 0,92 GB (AD-IQ3_S) y 1,85 GB (Q8_0) en disco para el modelo de lenguaje, mas el proyector de vision F16 si se usan imagenes. Al ser GGUF, puede ejecutarse en CPU o con offload parcial a GPU.
- GPU recomendadas: no disponibles en la informacion proporcionada; por tamano, cualquier GPU moderna de consumo sobra incluso con offload total.
- Cabe en GPUs de consumo: si, con holgura; el rung recomendado (AD-Q4_K_M, 1,13 GB) cabe incluso en integradas o en la RAM de un portatil basico.
- Despliegue: llama.cpp (requiere un build con soporte LFM3, integrado en el PR #31252 de llama.cpp, producido en el commit `19cce69`), `llama-cli` para texto y `llama-mtmd-cli` para multimodal. No consta soporte verificado en Ollama, vLLM o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Modalidad | Contexto | Formato | Licencia |
|---|---|---|---|---|---|
| LFM3-VL-2B (AtomicChat GGUF) | 1,73B | Imagen-texto-a-texto | no disponible | GGUF | LFM Open License v1.0 |
| Qwen2.5-VL-3B-Instruct | ~3B | Imagen-texto-a-texto | no disponible en esta ficha | safetensors/GGUF (terceros) | Licencia propia Qwen |
| SmolVLM-2 / SmolVLM-Instruct (HuggingFace) | ~2B | Imagen-texto-a-texto | no disponible en esta ficha | safetensors/GGUF (terceros) | Apache 2.0 |

Nota: la comparativa es orientativa; los datos de contexto y rendimiento de los alternativos no constan en la informacion proporcionada. La ventaja diferencial de esta publicacion es el esquema de cuantizacion AD con metricas de fidelidad publicadas y el proyector de vision incluido en GGUF.

## Limitaciones y advertencias

- Sensibilidad a la cuantizacion: el propio autor advierte que es un modelo hibrido pequeño "bastante sensible a la cuantizacion"; el rung AD-IQ3_S solo alcanza un 78,3 % de coincidencia top-1 con BF16 y un KLD medio de 0,151, por lo que degrada notablemente la calidad.
- Licencia no estandar: usa la LFM Open License v1.0 (tipo "other"), no una licencia permisiva como Apache 2.0 o MIT; conviene revisar el fichero LICENSE antes de cualquier uso comercial.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Riesgo de alucinacion: no cuantificado en la informacion proporcionada; como todo modelo de 2B, la fiabilidad factual sera limitada.
- Longitud de contexto: no publicada en la ficha; no puede verificarse la aptitud para tareas de contexto largo.
- Las metricas completas de los rungs AD se publicaran en un repositorio `-metrics` "tras auditoria", por lo que las cifras actuales son provisionales segun el autor.
- Requiere una version reciente de llama.cpp con soporte LFM3 (PR #31252); builds antiguos no cargaran el modelo.

## Enlaces

- Repositorio del GGUF: https://huggingface.co/AtomicChat/LFM3-VL-2B-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM3-VL-2B
- Web del publicador: https://atomic.chat/
- Discord de AtomicChat: https://discord.gg/8wGSsvmg4V
- GitHub de Atomic Chat: https://github.com/AtomicBot-ai/Atomic-Chat
- X (Twitter): https://x.com/atomic_chat_hq
- Pull request de soporte LFM3 en llama.cpp: https://github.com/ggml-org/llama.cpp/pull/31252
