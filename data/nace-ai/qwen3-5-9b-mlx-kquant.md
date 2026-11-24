# nace-ai/Qwen3.5-9B-MLX-KQuant

## Resumen

Qwen3.5-9B-MLX-KQuant es un empaquetado de cuantizacion en formato MLX del modelo Qwen/Qwen3.5-9B, desarrollado por el usuario nace-ai. No se trata de un modelo entrenado desde cero, sino de una redistribucion optimizada para Apple Silicon que ofrece dos checkpoints (4-bit y 5-bit) con pesos en safetensors y libreria MLX, pensados para ejecutarse en Macs con memoria unificada. El pipeline declarado es image-text-to-text, lo que indica que el modelo base es multimodal (entrada de imagen y texto), aunque la model card se centra en el uso conversacional y de razonamiento.

El interes de este pack reside en su estrategia de cuantizacion mixta: el checkpoint Q4 combina 4 bits generales con capas down_proj e in_proj_z a 5 bits (unas 4,2 bits por peso, 4,7 contando escalas), mientras que el Q5 usa precision mixta de 5, 6 y 8 bits por tensor (unas 5,05 bits por peso). El autor reporta una divergencia KL frente al modelo BF16 original de 0,030 para Q4 y 0,010 para Q5, y afirma que su Q4 queda 2,7 veces mas cerca del original que el pack 4-bit de mlx-community (KL 0,030 frente a 0,081).

El modelo tiene 9.409.813.744 parametros (dato real de safetensors), licencia Apache 2.0 y un tamano de repositorio de 12,4 GB. Es relevante para desarrolladores que quieran desplegar localmente un modelo de ~9B multimodal y con modo de razonamiento en hardware Apple, con API compatible con OpenAI, Anthropic y Ollama a traves del motor Kapitsa del propio autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen/Qwen3.5-9B; familia Qwen3.5, multimodal image-text-to-text) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit mixto (Q4: 4 bits con down_proj e in_proj_z a 5 bits, ~4,2 bits/peso) y 5-bit mixto (Q5: 5/6/8 bits por tensor, ~5,05 bits/peso) |
| Idiomas soportados | en (segun metadatos y model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (pack MLX) |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo base Qwen/Qwen3.5-9B (tipo de transformer, atencion, composicion del dataset ni proceso de alineamiento como RLHF o DPO). Lo que si se documenta es el trabajo de cuantizacion de este pack: cada carpeta (Q4/ y Q5/) es un pack MLX completo con precision mixta por tensor, disenado para minimizar la divergencia KL respecto al modelo BF16 original. El Q4 reserva 5 bits para las capas down_proj e in_proj_z, y el Q5 aplica 5, 6 u 8 bits segun el tensor.

El modelo base incorpora un modo de razonamiento (thinking) activado por defecto, que devuelve la traza de razonamiento en el campo reasoning_content y puede desactivarse mediante reasoning_effort: "none" o enable_thinking: false. Tambien soporta entrada de imagenes mediante partes image_url en formato OpenAI (URL http(s) o data URL base64). El autor probo el pack en un M5 Pro con Kapitsa 0.2.32, mlx-lm 0.32.2, mlx-vlm 0.7.10 y LM Studio con motor MLX 1.13.1, y verifico compatibilidad con SwiftLM b911, LocalAI 4.12.1, Osaurus 1.0.1, vllm-mlx 0.6.0 y mlx-openai-server 1.8.1, incluyendo tool calling en todos salvo en llm-tool de Apple.

## Capacidades

- Generacion de texto conversacional multi-turno.
- Razonamiento con modo thinking activado por defecto y traza expuesta en reasoning_content.
- Entrada multimodal image-text-to-text: acepta imagenes por URL o base64 junto a texto.
- Tool calling / function calling: verificado en Kapitsa, mlx-lm, LM Studio, SwiftLM, LocalAI, Osaurus, vllm-mlx y mlx-openai-server.
- Soporte de agentes mediante APIs compatibles con OpenAI, Anthropic y Ollama a traves de Kapitsa.
- Capacidades matematicas basicas y de calculo (el ejemplo de la model card es 17 * 23).
- Multilingue limitado: los metadatos solo declaran ingles (en).
- Control de muestreo y penalizaciones: temperature, top_p, top_k, min_p y presence_penalty documentados.

## Casos de uso

- Asistente conversacional local en Mac: el pack Q4 (6,2 GB) encaja en equipos con 16 GB o mas de RAM unificada y permite servir un chat con API compatible con OpenAI en http://127.0.0.1:8000 mediante Kapitsa, sin depender de la nube.
- Razonamiento asistido con traza auditable: al devolver el pensamiento en reasoning_content, es adecuado para depuracion de respuestas y para flujos donde se quiere inspeccionar el razonamiento antes de la respuesta final, desactivandolo con reasoning_effort: "none" cuando prima la latencia.
- Descripcion y analisis de imagenes: el pipeline image-text-to-text permite enviar una imagen por URL o base64 y preguntar por su contenido, util para catalogacion de imagenes, accesibilidad o extraccion de informacion visual en local.
- Agentes con herramientas en local: el soporte de tool calling verificado en multiples runtimes permite construir agentes que invoquen funciones (busqueda, calculo, APIs internas) sobre una API compatible con OpenAI, Anthropic u Ollama.
- Prototipado de aplicaciones MLX: al ser un pack MLX con dos niveles de calidad (KL 0,030 y 0,010), sirve para comparar el impacto de la cuantizacion en la calidad de salida antes de fijar un checkpoint para produccion.
- Integracion en pipelines de desarrollo con mlx-lm: la API de Python (load, generate, make_sampler, make_logits_processors) permite incorporar el modelo en scripts de evaluacion, generacion por lotes o pruebas automatizadas en Apple Silicon.
- Despliegue en servidores OpenAI-compatibles autoalojados: mlx_lm.server y vllm-mlx ofrecen endpoints /v1/chat/completions para integrar el modelo en aplicaciones existentes sin cambiar el cliente.

## Benchmarks y rendimiento

Los unicos datos cuantitativos publicados son las metricas de fidelidad de la cuantizacion frente al modelo BF16, no benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.).

| Metrica | Q4 | Q5 | Referencia |
|---|---|---|---|
| Divergencia KL frente a BF16 (menor es mejor) | 0,030 | 0,010 | mlx-community 4-bit: 0,081 |
| Tamano de descarga | 6,2 GB | 7,1 GB | no disponible |
| Bits por peso (sin escalas / con escalas) | ~4,2 / ~4,7 | ~5,05 / ~5,55 | no disponible |
| Peso del modelo de lenguaje (segun model card) | 5,29 GB | no disponible | mlx-community 4-bit: 5,04 GB |

No se han publicado resultados de benchmarks de tareas en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM unificada estimada: Q4 requiere 16 GB o mas de RAM; Q5 tambien se indica como apto para 16 GB o mas. La regla del autor asume que la GPU por defecto en macOS toma aproximadamente 2/3 de la RAM y debe contener la descarga mas 2 GB para una conversacion.
- Hardware objetivo: Apple Silicon (el pack esta probado en un M5 Pro). No hay soporte documentado para GPU NVIDIA o AMD en este repositorio.
- GPU consumer: si, en Macs con memoria unificada de 16 GB o superior; el autor senala que Kapitsa puede encajar en una talla menos al omitir partes no usadas, y kapitsa doctor comprueba un Mac concreto.
- Opciones de despliegue: Kapitsa (brew install nace-ai/tap/kapitsa), mlx-lm (mlx_lm.generate, mlx_lm.server), mlx-vlm, LM Studio con motor MLX, SwiftLM, LocalAI 4.12.1 con backend MLX, Osaurus, vllm-mlx y mlx-openai-server.
- Latencia y throughput: no disponibles; no se publican mediciones de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | KL vs BF16 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| nace-ai/Qwen3.5-9B-MLX-KQuant (Q4) | 9,41 B | no disponible | 4-bit mixto, 6,2 GB | 0,030 | Apache 2.0 | Hugging Face, MLX |
| nace-ai/Qwen3.5-9B-MLX-KQuant (Q5) | 9,41 B | no disponible | 5-bit mixto, 7,1 GB | 0,010 | Apache 2.0 | Hugging Face, MLX |
| mlx-community 4-bit (Qwen3.5-9B) | no disponible | no disponible | 4-bit, 5,04 GB de pesos LM | 0,081 | no disponible | Hugging Face, MLX |
| mlx-community OptiQ (Qwen3.5-9B) | no disponible | no disponible | no disponible | no disponible | no disponible | Hugging Face, MLX |
| mlx-works oQ4e-mtp (Qwen3.5-9B) | no disponible | no disponible | 4-bit | no disponible | no disponible | Hugging Face, MLX |
| lmstudio-community 4-bit (Qwen3.5-9B) | no disponible | no disponible | 4-bit | no disponible | no disponible | Hugging Face, MLX |
| Brooooooklyn UD-Q4_K_XL (Qwen3.5-9B) | no disponible | no disponible | 4-bit | no disponible | no disponible | Hugging Face |

La comparativa se limita a los packs MLX del mismo modelo base citados en la model card; no se dispone de datos de rendimiento en tareas para comparar con alternativas de otros tamanos.

## Limitaciones y advertencias

- Solo se declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta documentado.
- La longitud de contexto no se especifica en la informacion disponible, lo que impide planificar cargas de contexto largo con garantias.
- El pack esta orientado exclusivamente a Apple Silicon y a la libreria MLX; no es directamente utilizable en CUDA, ROCm ni en despliegues x86 convencionales.
- La cuantizacion introduce divergencia respecto al BF16 (KL 0,030 en Q4 y 0,010 en Q5); para tareas sensibles a la precision conviene validar con el checkpoint de mayor bits o con el modelo original.
- Los tamanos de memoria indicados son una regla heuristica del autor, no una medicion; el propio autor recomienda verificar con kapitsa doctor.
- Riesgo de alucinacion y sesgos: no se documentan evaluaciones de sesgo ni tasas de alucinacion para este pack ni para el modelo base en la informacion disponible.
- El modo thinking activo por defecto incrementa el consumo de tokens y la latencia; en produccion puede requerir desactivarlo explicitamente.
- Licencia Apache 2.0, que permite uso comercial, pero deben respetarse las condiciones del modelo base Qwen/Qwen3.5-9B y las licencias de las dependencias de inferencia utilizadas.
- El repositorio tiene muy poca traccion (352 descargas y 1 like en la fecha de consulta), por lo que la validacion comunitaria es escasa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nace-ai/Qwen3.5-9B-MLX-KQuant
- Checkpoint Q4: https://huggingface.co/nace-ai/Qwen3.5-9B-MLX/tree/main/Q4
- Checkpoint Q5: https://huggingface.co/nace-ai/Qwen3.5-9B-MLX/tree/main/Q5
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Motor Kapitsa: https://github.com/nace-ai/kapitsa
- Grafico comparativo de KL: https://huggingface.co/nace-ai/Qwen3.5-9B-MLX/resolve/main/assets/nace-dark.svg
