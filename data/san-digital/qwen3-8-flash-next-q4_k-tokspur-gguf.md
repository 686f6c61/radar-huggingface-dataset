# san-digital/Qwen3.8-Flash-Next-Q4_K-Tokspur-GGUF

## Resumen

Qwen3.8-Flash-Next-Q4_K-Tokspur-GGUF es una cuantización a 4 bits del modelo Qwen3.8-Flash-Next de Alibaba Qwen, empaquetada por el desarrollador san-digital para su uso exclusivo con Tokspur, un servidor de inferencia local optimizado para el chip Apple M5 Max. El modelo base es un transformer de tipo Mixture-of-Experts (MoE) con 51.835.944.960 parámetros totales, 512 expertos y una ventana de contexto de 65.536 tokens por defecto (ampliable a 131.072). Esta versión cuantizada mantiene todos los expertos enrutados y utiliza una mezcla de precisión Q4_K para los expertos y Q8_0 o superior para atención, routers y cabeza de salida.

La relevancia de esta ficha radica en que no se trata de un GGUF genérico: el paquete está empaquetado en formato Tokspur Planar Pack v3, con bloques planares co-localizados para Metal, y requiere el runtime Tokspur 0.3.1 o superior. Incluye una cabeza de borrador (draft head) de predicción multi-token (MTP) en Q8_0 que acelera la decodificación especulativa, alcanzando hasta 175 tokens por segundo en un M5 Max con 40 núcleos de GPU y 128 GB de memoria unificada.

El modelo está pensado para inferencia local en Apple Silicon de gama alta, con licencia Qwen Community License 1.0 y sin soporte declarado para otros backends (llama.cpp, vLLM, Ollama). Su tamaño de repositorio es de 118,2 GB repartidos en tres archivos, y su uso comercial está sujeto a los términos de la licencia comunitaria de Qwen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) con atención lineal GDN, 512 expertos, 48 capas, cabeza MTP compartida |
| Parametros totales | 51.835.944.960 |
| Parametros activos | no disponible |
| Longitud de contexto | 65.536 tokens por defecto; 131.072 opcional |
| Tipos de cuantizacion | Q4_K (expertos enrutados), Q5_K y Q5_1 (expertos), Q8_0/BF16/F32 (atención, routers, cabeza de salida), IQ4_NL (embeddings por capa), Q8_0 (embeddings de token) |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 |
| Formato de pesos | GGUF (Tokspur Planar Pack v3), 3 archivos: `Qwen3.8-Flash-Next-Q4_K.tokspur.gguf` (85,9 GB), `Qwen3.8-Flash-Next-base.gguf` (29,5 GB), `MTP/mtp-Qwen3.8-Flash-Next-shared-Q8_0.gguf` (2,79 GB) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es un transformer MoE con 512 expertos y 48 capas, según se deduce de los metadatos del paquete (la cabeza MTP compartida proviene de la capa 48). Incorpora atención lineal GDN (Gated DeltaNet o similar) junto con atención estándar, y una proyección PLE (probablemente Positional Linear Embedding o similar). La cuantización se realizó con la herramienta `tokspur-quant` directamente desde los 131 shards BF16 en safetensors de `Qwen/Qwen3.8-Flash-Next` en la revisión `34567a4`, sin usar GGUF de terceros ni checkpoints de drafter externos.

El paquete GPU contiene 1.254 tensores: las proyecciones de los expertos enrutados son 94 tensores Q4_K, 2 Q5_K y 43 Q5_1, almacenados como bloques planares co-localizados para Metal. Atención, atención lineal GDN, experto compartido, router, proyección PLE y cabeza de salida están en Q8_0, BF16 o F32. El GGUF base incluye embeddings por capa en IQ4_NL (28,8 GB) y embeddings de token en Q8_0 (0,68 GB), con vocabulario BPE de 248.320 tokens y la plantilla de chat oficial de Qwen. La cabeza de borrador MTP (32 tensores) está en Q8_0, BF16 y F32 y permite decodificación especulativa. No se dispone de información sobre el número de tokens de entrenamiento, composición del dataset ni si hubo RLHF/DPO.

## Capacidades

- Generación de texto conversacional y de propósito general (pipeline `text-generation`, etiqueta `conversational`).
- Razonamiento multi-paso y decodificación especulativa mediante la cabeza MTP incluida (hasta 175 tokens/s en M5 Max).
- Generación de código: el autor reporta una petición completa de 1.171 tokens de Rust que pasó la comprobación de tipos a 165 tokens/s.
- Soporte de contexto largo: 65.536 tokens por defecto, ampliable a 131.072.
- Plantilla de chat oficial de Qwen incluida (`chat_template.jinja`), compatible con endpoints de chat completion en `http://127.0.0.1:18081/v1` bajo el identificador `tokspur`.
- Entrada y salida exclusivamente de texto (sin visión ni audio).
- No se declara soporte explícito de tool calling, function calling ni modo thinking en la información disponible.
- Capacidades multilingües: no disponibles (no se especifican idiomas).

## Casos de uso

- Asistencia de código en local para desarrolladores con Apple Silicon de gama alta: el modelo puede generar fragmentos de Rust, Python u otros lenguajes y verificar tipos en el flujo de trabajo, con 165 tokens/s en una petición completa de 1.171 tokens, lo que permite iterar en un IDE sin depender de la nube.
- Chat conversacional multi-turno con contexto largo: gracias a los 65.536 tokens por defecto (131.072 opcionales), es adecuado para sesiones de depuración o análisis de documentos extensos en local.
- Procesamiento de documentación técnica y resúmenes: la ventana de contexto permite ingerir manuales, RFCs o especificaciones completas y generar resúmenes o respuestas extractivas.
- Generación aumentada por recuperación (RAG) local: el servidor Tokspur expone una API compatible con OpenAI en `127.0.0.1:18081/v1`, lo que permite integrarlo en pipelines RAG que requieran privacidad de datos sin salir del equipo.
- Prototipado de agentes y asistentes de razonamiento: la cabeza MTP y la decodificación especulativa reducen la latencia en cadenas de razonamiento multi-paso, útil para experimentación con agentes en local.
- Evaluación de modelos MoE de gran tamaño sin infraestructura de datacenter: al caber en 128 GB de memoria unificada, permite a investigadores probar un MoE de ~52.000 millones de parámetros en un portátil de gama alta.
- Sustitución de APIs comerciales en entornos con requisitos de soberanía del dato: al ejecutarse completamente en local y con verificación SHA-256 de cada archivo al arrancar, encaja en flujos con restricciones de confidencialidad.

## Benchmarks y rendimiento

| Medida | Resultado |
|---|---|
| Perplejidad, Tokspur Q4_K (32 chunks de 2.048 tokens) | 4,539 ± 0,066 |
| Perplejidad, referencia UD-Q4_K_XL | 4,565 ± 0,066 |
| Diferencia pareada (Tokspur menos referencia) | -0,0257 ± 0,0126 |
| Log ratio pareado | -0,0056 ± 0,0028 (correlación por chunk del 98,18 %) |
| Divergencia KL media | 0,0797 ± 0,0016 (mediana 0,0086) |
| Acuerdo top-1 de token | 90,52 % ± 0,16 % |
| Velocidad, petición completa de 1.171 tokens de Rust | 165 tokens/s |
| Velocidad de generación desde el primer token | Hasta 175 tokens/s |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La comparación de perplejidad es entre dos builds de 4 bits, no frente al modelo en precisión completa.

## Requisitos de hardware

- VRAM/memoria unificada: el paquete completo ocupa 118,2 GB; el hardware de referencia es un Apple M5 Max con 128 GB de memoria unificada.
- GPU recomendada: Apple M5 Max con GPU de 40 núcleos (único hardware soportado explícitamente).
- No cabe en GPUs de consumo convencionales (RTX 4090 con 24 GB, RTX 3090 con 24 GB) ni en configuraciones de menos de 128 GB de memoria unificada.
- Sistema operativo: macOS 27 o superior.
- Runtime: Tokspur 0.3.1 o superior; opción `--speed-preset` para kernels Metal 4 más rápidos.
- Opciones de despliegue: exclusivamente Tokspur (`tokspur pull` + `tokspur serve`, o `tokspur serve <carpeta>`). No se declara compatibilidad con llama.cpp, vLLM, TGI ni Ollama.
- Latencia y throughput: hasta 175 tokens/s de generación y 165 tokens/s en una petición completa de 1.171 tokens, medidos el 15 de noviembre de 2026 en M5 Max con prompts cacheados, modo speed y el drafter DFlash2 opcional.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / runtime | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-Q4_K-Tokspur-GGUF (este) | 51.835.944.960 | 65.536 (131.072 opcional) | Qwen Community License 1.0 | GGUF Tokspur Planar Pack v3, solo Tokspur | Hugging Face, 1.416 descargas |
| Qwen/Qwen3.8-Flash-Next (base BF16) | 51.835.944.960 | no disponible en la información | Qwen Community License 1.0 | safetensors (131 shards) | Hugging Face |
| Cuantización UD-Q4_K_XL de referencia | 51.835.944.960 (mismo modelo) | no disponible | Qwen Community License 1.0 | GGUF (referencia de perplejidad) | no disponible |
| san-digital/Qwen3.8-Flash-Next-DFlash2 (drafter) | no disponible | no disponible | no disponible | GGUF | Hugging Face |

No se dispone de datos de benchmarks estándar para comparar rendimiento frente a alternativas de la misma categoría.

## Limitaciones y advertencias

- Dependencia total del runtime Tokspur: no funciona con llama.cpp, Ollama, vLLM ni TGI; requiere Tokspur 0.3.1+ y macOS 27+.
- Hardware muy restringido: únicamente Apple M5 Max con 128 GB de memoria unificada; no es desplegable en GPUs NVIDIA ni en Apple Silicon de menor memoria.
- La estructura de carpetas (incluida la subcarpeta `MTP/`) debe mantenerse intacta y los archivos no deben modificarse; el servidor los reverifica en cada arranque.
- La comparación de calidad es frente a otra cuantización de 4 bits, no frente al modelo en BF16; la pérdida real respecto a precisión completa no se ha medido en la información disponible.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se documentan evaluaciones de fidelidad factual.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Idiomas soportados: no declarados; el vocabulario BPE de 248.320 tokens sugiere cobertura multilingüe amplia, pero no se confirma.
- Licencia Qwen Community License 1.0: el uso comercial está sujeto a los términos de dicha licencia (enlace en el repositorio); no es una licencia permisiva tipo Apache 2.0.
- Entrada y salida solo de texto; sin capacidades de visión, audio ni tool calling declaradas.
- El rendimiento reportado (165-175 tokens/s) se midió con prompts cacheados, modo speed y drafter opcional; sin esas condiciones será inferior.

## Enlaces

- Hugging Face: https://huggingface.co/san-digital/Qwen3.8-Flash-Next-Q4_K-Tokspur-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Revisión del modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/tree/34567a4712bc9766c4449e2e98e4468bfa24d915
- Drafter DFlash2: https://huggingface.co/san-digital/Qwen3.8-Flash-Next-DFlash2
- Web de Tokspur: https://tokspur.com/
- Guía de inicio: https://tokspur.com/get-started/
- Guía de modelos: https://tokspur.com/docs/models/
- Página de resultados: https://tokspur.com/results/
- Repositorio GitHub: https://github.com/san-digital/tokspur
- Licencia: https://huggingface.co/san-digital/Qwen3.8-Flash-Next-Q4_K-Tokspur-GGUF/blob/main/LICENSE
