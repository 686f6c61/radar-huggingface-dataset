# balllvin/Inkling-2-Mini-MLX

## Resumen

Inkling-2-Mini-MLX es un motor de inferencia para Apple Silicon publicado por el usuario balllvin en Hugging Face, empaquetado como repositorio MLX que ejecuta los pesos oficiales de `thinkingmachines/Inkling-2-Mini` sin modificarlos. No es un modelo nuevo, sino una implementación optimizada: incluye kernels nativos para Metal 4, scripts de instalación, tests y un servidor compatible con la API de OpenAI (`/v1/chat/completions`, `/v1/models`, `/health`). El objetivo declarado es acelerar entre 1,88x y 7,68x la inferencia local del modelo base en Mac respecto a runners MLX convencionales.

El modelo subyacente, Inkling-2-Mini, es un transformer con mezcla de expertos (MoE) que, segun la model card, ocupa aproximadamente 20,2 GB en pesos mixtos NVFP4/MXFP8/BF16 y utiliza un decodificador especulativo integrado (`mtp.safetensors`, 3 capas). El motor ejecuta 3 pasadas de bucle y 48 visitas de capa por token, con una caché KV BF16 sin cuantizar de hasta 256k tokens.

La relevancia de esta ficha es doble: por un lado documenta una optimización de inferencia muy concreta para hardware Apple M5; por otro, advierte de que el repositorio es un espejo solo de código (sin binarios de pesos duplicados) y de que el modelo base se descarga por separado. La licencia declarada del repositorio es MIT, mientras que la model card cita Apache 2.0 para los pesos base oficiales, una discrepancia que conviene verificar antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (modelo base Inkling-2-Mini); motor de inferencia MLX con kernels Metal 4 |
| Parametros totales | no disponible |
| Parametros activos | no disponible (MoE; numero de expertos y activacion no especificados) |
| Longitud de contexto | hasta 256k tokens (caché KV BF16 sin cuantizar) |
| Tipos de cuantizacion | pesos mixtos NVFP4 / MXFP8 / BF16 en el checkpoint base; KV cache en BF16 sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | MIT (repositorio); la model card cita Apache 2.0 para los pesos base oficiales |
| Formato de pesos | safetensors (`model-00001-of-00001.safetensors` ~19,53 GB; `mtp.safetensors` ~0,64 GB) |

## Arquitectura y entrenamiento

El repositorio no entrena ningun modelo: redistribuye y optimiza la ejecucion de `thinkingmachines/Inkling-2-Mini`, un transformer con capas MoE cuyo detalle de entrenamiento (numero de tokens, composicion del dataset, fases de RLHF o DPO) no se documenta en la informacion disponible. Lo que si se describe con precision es la ruta de inferencia: 3 pasadas de bucle y 48 visitas de capa por token, pesos mixtos NVFP4/MXFP8/BF16 y un drafter especulativo de 3 capas (`mtp.safetensors`) que el runner convencional de MLX dejaba sin usar.

Las innovaciones tecnicas del motor son las que justifican el repositorio: decodificacion especulativa en un unico command buffer de GPU para lotes B=1..4, eliminacion de los cuellos de botella de ordenacion de `SwitchGLU` en MoE, reduccion de lecturas redundantes de `lm_head`, sustitucion de mascaras de atencion densas en prefill y aumento de `max_ops_per_cb` (el baseline usaba 50) para evitar vaciados frecuentes de command buffer. El autor declara paridad numerica con PyTorch Transformers con una divergencia KL de 2,48e-10.

## Capacidades

- Generacion de texto y conversacion multi-turno sobre una API HTTP/SSE compatible con OpenAI.
- Tool calling / function calling en formato OpenAI (soportado de forma explicita en el servidor).
- Razonamiento agente de varios pasos, optimizado para 1-4 agentes concurrentes en local.
- Decodificacion especulativa con el drafter `mtp.safetensors` integrado (hasta 120 tok/s en un solo agente con herramientas y temperatura 0).
- Procesamiento por lotes de hasta B=64 en contextos cortos (512 tokens) sin swap en 64 GB de memoria unificada.
- Prefill de prompts largos: 16k tokens con TTFT de 11,14 s (1.464 tok/s servidos).
- Vision: el modelo base dispone de encoder de vision, pero el servidor MLX no conecta esas entradas; no hay soporte de imagen en esta implementacion.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Agente de codigo local en Mac: el motor mantiene hasta 120 tok/s en un unico agente con tool calling a temperatura 0, lo que permite ciclos de edicion-ejecucion-prueba sin salir del portatil ni pagar API en la nube.
- Asistentes personales con contexto largo: con 64 GB de memoria unificada se puede mantener una cache KV BF16 de 256k tokens, suficiente para analizar repositorios completos o documentacion extensa en una sola sesion.
- Ejecucion de varios agentes en paralelo: 4 agentes concurrentes a 117,68 tok/s agregados (27,59 tok/s por stream) permiten orquestar subtareas independientes (busqueda, sintesis, revision) en una sola maquina.
- Procesamiento por lotes de prompts: con B=32 a 277 tok/s agregados y B=64 a 335 tok/s en contextos de 512 tokens, es viable clasificar, resumir o extraer datos de lotes de documentos pequenos en local.
- Prefill de contextos largos para analisis de codigo: el TTFT de 11,14 s para 16k tokens y los 93,12 tok/s agregados en 4 streams con ese contexto permiten revisar pull requests o ficheros grandes con latencia interactiva.
- Servidor de inferencia compatible con OpenAI para herramientas existentes: al exponer `/v1/chat/completions` y `/v1/models`, se puede apuntar un cliente ya escrito para la API de OpenAI al servidor local sin cambiar codigo.
- Prototipado y evaluacion de modelos MoE en Apple Silicon: los scripts, tests y el playbook de optimizacion incluidos sirven para medir y reproducir las cifras de rendimiento en un M5.

## Benchmarks y rendimiento

Los datos publicados son de rendimiento de inferencia, no de calidad del modelo. Mediciones en MacBook Pro `Mac17,9` con Apple M5 Pro (18 nucleos de CPU, 20 de GPU, Metal 4), 64 GB de memoria unificada, macOS 26.5.1 y MLX 0.32.4:

| Carga de trabajo | Baseline | inkling-mlx | Mejora |
|---|---:|---:|---:|
| Usuario unico (B=1, ctx=512) | 25,98 tok/s | 48,97 tok/s | 1,88x |
| Agente con herramientas (B=1, MTP, T=0,0) | 25,98 tok/s | 120,19 tok/s | 4,63x |
| 4 agentes concurrentes (B=4, MTP, ctx=512) | 39,31 tok/s agg | 117,68 tok/s agg | 2,99x |
| 32 streams concurrentes (B=32, ctx=512) | 36,10 tok/s agg | 277,11 tok/s agg | 7,68x |
| Lote maximo (B=64, ctx=512) | OOM / colapso | 335,48 tok/s agg (41,3 GB pico) | no disponible |
| TTFT prompt frio de 16k (B=1) | 20,58-21,4 s | 11,14 s (1.464,3 tok/s) | 1,85x-1,92x |
| Decodificacion 16k con 4 streams (B=4) | 1,87 tok/s agg | 93,12 tok/s agg | 49,8x |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- Memoria unificada: 16-24 GB no soportado (el runtime residente de texto y MTP supera los 20 GB antes de la cache KV); 32 GB es el minimo (B=1, contexto de 16k-32k, con `--no-mtp --cache-limit-gb 2.0`); 48 GB admite B=1..4 con MTP hasta 64k-128k o B=1 hasta 256k sin MTP; 64 GB es la configuracion recomendada y probada (256k de contexto con MTP, ~29,6 GiB activos y ~38,6 GB de pico, sin swap).
- Almacenamiento: al menos 25 GB libres en SSD para la descarga de ~20,2 GB.
- GPU: el motor esta afinado para Apple M5 (aceleradores neuronales Metal 4 por nucleo). En M1-M4 o macOS anterior a 26 hay que usar `--skip-build` para el fallback puro de MLX. No se mencionan GPU NVIDIA (A100, H100, RTX 4090) como plataforma soportada.
- Software: macOS 26+ con Xcode Command Line Tools y Python 3.11-3.13 (o `uv`) para Metal 4 nativo; macOS 14+ en Apple Silicon para el fallback MLX.
- Despliegue: servidor HTTP/SSE compatible con OpenAI incluido en el repositorio; no se documenta integracion con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: ver la tabla de benchmarks; en el hardware de referencia, 48,97 tok/s en single-stream y hasta 335,48 tok/s agregados en B=64.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-2-Mini-MLX (este) | no disponible (MoE) | 256k | 48,97-335,48 tok/s segun lote en M5 Pro 64 GB | MIT (repo); Apache 2.0 citada para pesos base | Hugging Face + GitHub, codigo sin pesos |
| Inkling-2-Mini (base, stock `mlx-vlm`) | no disponible (MoE) | 256k | 25,98-39,31 tok/s en el mismo hardware | Apache 2.0 (segun model card) | Hugging Face |
| Runners MLX genericos para MoE | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de otros modelos comparables de la misma categoria en la informacion proporcionada; la comparativa se limita al modelo base y su runner de referencia.

## Limitaciones y advertencias

- El repositorio es un espejo solo de codigo: no contiene los pesos. Al lanzarlo descarga o carga `thinkingmachines/Inkling-2-Mini` por separado (~20,2 GB).
- El soporte de vision del modelo base no esta conectado en este servidor MLX; solo hay texto y tool calling.
- Hardware muy restringido: 16-24 GB de memoria unificada no es viable y en M1-M4 o macOS anterior a 26 se pierde la ruta Metal 4 optimizada.
- Las cifras de rendimiento proceden de un unico equipo (M5 Pro, 64 GB) y de mediciones del propio autor; no hay verificacion independiente en la informacion disponible.
- Discrepancia de licencia: el repositorio declara MIT y la model card cita Apache 2.0 para los pesos base. Conviene confirmar los terminos aplicables antes de un uso comercial.
- No se han publicado benchmarks de calidad (razonamiento, codigo, matematicas) ni evaluaciones de sesgo o alucinacion; se desconoce el comportamiento del modelo base en esos aspectos.
- Idiomas soportados no documentados; no se puede garantizar calidad fuera del ingles sin evaluacion propia.
- El repositorio tiene 0 descargas y 0 likes en el momento de la ficha, sin historial de mantenimiento ni comunidad que lo respalde.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/balllvin/Inkling-2-Mini-MLX
- Repositorio GitHub del motor: https://github.com/Balllvin/inkling-mlx
- Pesos base oficiales: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Playbook de optimizacion incluido: `skills/mlx-apple-silicon-inference/SKILL.md` (dentro del repositorio)
