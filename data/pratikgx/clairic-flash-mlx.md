# pratikgx/Clairic-Flash-MLX

## Resumen

Clairic-Flash-MLX es un port no oficial a MLX de los modelos de extracción estructurada Clairic de Cloudflare, concretamente de Clairic-flash (9,65B) y Clairic (27,8B). Lo desarrolla el usuario pratikgx como adaptación del trabajo original de Cloudflare y el equipo de Workers AI, y su objetivo es permitir la inferencia de estos modelos en Apple Silicon aprovechando el framework MLX de Apple. El modelo original resuelve un problema específico: la extracción de campos tipados con puntuaciones de confianza y spans de caracteres a partir de texto, imágenes y PDFs, una tarea que los LLM genéricos abordan de forma poco fiable.

La relevancia de este port radica en que `mlx-lm` estándar no puede cargar la cabeza personalizada de Clairic, por lo que se necesita un paquete de inferencia dedicado. El repositorio contiene únicamente el paquete `clairic_mlx`, no redistribuye los pesos, que se descargan de Cloudflare en tiempo de ejecución. El estado actual es parcial: la entrada de texto está verificada (33 de 34 campos en pruebas sintéticas), pero la entrada de imagen y PDF está rota y requiere usar la ruta oficial de PyTorch.

Los modelos base usan backbones Qwen3.5 y Qwen3.8 (según indica la model card) bajo licencia Apache-2.0. El paquete está pensado para macOS con Apple Silicon y Python 3.11 o superior. Un M5 Pro con 64 GB puede ejecutar Clairic-flash en bfloat16 y el modelo de 27B en 4 bits.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con cabeza de extracción estructurada personalizada (backbone Qwen3.5 / Qwen3.8) |
| Parametros totales | 9,65B (Clairic-flash) / 27,8B (Clairic) |
| Parametros activos | no disponible (no es MoE según la informacion disponible) |
| Longitud de contexto | no disponible (probado hasta 16K en benchmarks locales) |
| Tipos de cuantizacion | BF16, 4-bit (MLX); cuantizacion del backbone con cabeza en float32 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors originales de Cloudflare; checkpoint MLX convertido localmente (no redistribuido) |

## Arquitectura y entrenamiento

Clairic se construye sobre backbones de la familia Qwen (Qwen3.5 para el modelo flash de 9,65B y Qwen3.8 para el de 27,8B, según la model card) y añade una cabeza personalizada de extracción estructurada. Esta cabeza es la que produce campos tipados, puntuaciones de confianza y spans de caracteres, y es precisamente la razón por la que `mlx-lm` estándar no puede cargar el modelo. El port mantiene el backbone cuantizado (4 bits) mientras deja la cabeza en float32 para preservar la precisión de la extracción.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada. El modelo original está pensado para extracción documental, no para generación abierta, lo que condiciona su diseño hacia la fidelidad de los campos y la localización de spans más que hacia la fluidez conversacional.

## Capacidades

- Extracción estructurada de campos tipados (texto, número con decimales, fecha, etc.) a partir de texto.
- Generación de puntuaciones de confianza por campo extraído.
- Devolución de spans de caracteres que localizan cada valor en el documento fuente.
- Entrada de imagen y PDF contemplada en la API, aunque actualmente rota en este port (ver limitaciones).
- Inferencia en Apple Silicon mediante MLX, con soporte de cuantización 4-bit y BF16.
- Conversión local de pesos oficiales a checkpoints MLX.
- Carga del modelo de 27B en 4 bits en equipos de 64 GB.
- No se documentan en la información disponible capacidades de tool calling, agentes, visión funcional ni modo thinking.

## Casos de uso

- Extracción de datos de facturas en texto plano: el modelo recibe el texto de una factura y devuelve campos como proveedor, total e fecha de emisión con confianza y spans, integrándose en un pipeline de contabilidad automatizada.
- Procesamiento de recibos y tickets: con la ruta oficial de PyTorch para imágenes, se pueden extraer líneas de detalle, importes y fechas de documentos escaneados.
- Digitalización de formularios: la extracción con spans permite mapear cada valor a su posición en el documento, útil para auditoría y verificación humana posterior.
- Enriquecimiento de bases de datos documentales: extraer campos tipados de correos, contratos o albaranes en texto para poblar tablas estructuradas con trazabilidad de confianza.
- Validación de documentos en flujos de onboarding: comparar campos extraídos con datos declarados por el usuario y marcar discrepancias mediante las puntuaciones de confianza.
- Prototipado local en Mac: desarrolladores que quieran evaluar Clairic sin GPU NVIDIA pueden usar MLX 4-bit para iterar sobre esquemas de extracción con latencias de 36-40 tok/s en un M5 Pro.
- Automatización de back office en macOS: despliegue de extracción de texto en estaciones de trabajo Apple Silicon sin depender de servicios en la nube.

## Benchmarks y rendimiento

Mediciones locales del autor en un Mac mini M5 Pro de 64 GB (18 de noviembre de 2026), con generación greedy de 256 tokens nuevos, thinking desactivado y mediana de 3 ejecuciones:

| Backend | Contexto | Prompt tok/s | Gen tok/s | TTFT |
| --- | ---: | ---: | ---: | ---: |
| MLX BF16 | 512 | 1295 | 15,2 | 0,40 s |
| MLX BF16 | 4K | 1182 | 15,3 | 3,47 s |
| MLX BF16 | 16K | 996 | 14,5 | 16,4 s |
| MLX 4-bit | 512 | 1232 | 40,5 | 0,42 s |
| MLX 4-bit | 4K | 1090 | 38,3 | 3,76 s |
| MLX 4-bit | 16K | 1131 | 36,0 | 14,5 s |
| PyTorch BF16 (MPS) | 512 | 796 | 12,7 | 0,64 s |
| PyTorch BF16 (MPS) | 4K | 791 | 11,9 | 5,18 s |
| PyTorch BF16 (MPS) | 16K | 637 | 10,3 | 25,7 s |

Precisión de extracción sobre documentos sintéticos con ground truth conocido:

| Ruta | Resultado |
| --- | --- |
| PyTorch oficial | 34/34 campos (recibo 9/9, factura PDF 12/12, formulario 13/13) |
| MLX 4-bit, texto | 33/34 (recibo 8/9 por nombre de ítem truncado; factura 12/12; formulario 13/13) |
| MLX imagen y PDF | falla (BF16 1/34, 4-bit 0/34; salidas corruptas) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Clairic-flash en BF16: pico de 17,8 GB de memoria Metal; carga en 3,1 s.
- Clairic-flash en 4-bit: pico de 7,18 GB al cargar y 29,0 GB tras una ejecución de 16K; checkpoint convertido de 6,5 GB con pico de 6,3 GB y carga en 1,1 s.
- PyTorch BF16 en MPS: pico de 28,8 GB y carga en 7,0 s.
- Clairic de 27,8B: requiere 4 bits en equipos de 64 GB; en BF16 son unos 56 GB de pesos antes de activaciones.
- Hardware objetivo: Apple Silicon (M5 Pro con 64 GB validado por el autor); no se documentan requisitos para GPU NVIDIA.
- Despliegue: paquete `clairic_mlx` con CLI (`convert`, `extract`, `demo`) y API de Python (`load`, `extractor.extract`); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Throughput medido: 40,5 tok/s en 4-bit a contexto 512 y 36,0 tok/s a 16K; 15,2 tok/s en BF16 a contexto 512.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
| --- | ---: | ---: | --- | --- | --- |
| Clairic-Flash-MLX (este) | 9,65B | no disponible | Apache-2.0 | Hugging Face (solo paquete, pesos descargados aparte) | Port MLX no oficial; imagen/PDF roto |
| Cloudflare/clairic-flash | 9,65B | no disponible | Apache-2.0 | Hugging Face | Modelo oficial; ruta PyTorch completa |
| Cloudflare/clairic | 27,8B | no disponible | Apache-2.0 | Hugging Face | Modelo oficial de mayor tamaño |
| Qwen3.5 / Qwen3.8 (backbones) | no disponible | no disponible | Apache-2.0 | Hugging Face | Backbones base, sin cabeza de extracción |

No se dispone de datos de benchmarks comparativos con otros modelos de extracción documental en la información proporcionada.

## Limitaciones y advertencias

- La entrada de imagen y PDF está rota en este port: BF16 obtuvo 1/34 y 4-bit 0/34, con salidas corruptas; debe usarse la ruta oficial de PyTorch para esos formatos.
- La extracción de texto en MLX 4-bit no es perfecta: 33/34 frente a 34/34 de la ruta oficial, con un nombre de ítem truncado en un recibo.
- El repositorio no redistribuye pesos; hay que descargarlos de Cloudflare y convertirlos localmente, lo que añade pasos operativos.
- Solo se ha validado en Apple Silicon; no hay soporte documentado para CUDA ni otras plataformas.
- No se dispone de información sobre sesgos, idiomas soportados ni riesgos de alucinación específicos del modelo.
- La licencia Apache-2.0 permite uso comercial, pero el port es no oficial y no cuenta con el respaldo de Cloudflare.
- La cabeza se mantiene en float32 mientras el backbone se cuantiza; cambios en la cuantización pueden afectar la precisión de los campos.
- Las mediciones de rendimiento provienen de un único equipo (M5 Pro, 64 GB) y una revisión concreta del paquete, por lo que no son extrapolables sin verificación.

## Enlaces

- Hugging Face del port: https://huggingface.co/pratikgx/Clairic-Flash-MLX
- Modelo base Clairic-flash: https://huggingface.co/Cloudflare/clairic-flash
- Modelo base Clairic: https://huggingface.co/Cloudflare/clairic
- Blog de Cloudflare sobre Clairic: https://blog.cloudflare.com/open-clairic/
- Repositorio MLX: https://github.com/ml-explore/mlx
