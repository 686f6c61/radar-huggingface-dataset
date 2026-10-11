# roman220220/LFM2.5-VL-3B-gptq-mlx-jang

## Resumen

LFM2.5-VL-3B-gptq-mlx-jang es una version cuantizada para MLX del modelo de vision-lenguaje LiquidAI/LFM2.5-VL-3B, publicada por el usuario roman220220 (IPSupport LLC). El modelo original es un VLM de 3B parametros disenado por Liquid AI para ejecucion en dispositivo, que combina un codificador visual SigLIP2 NaFlex con un decodificador hibrido LFM2.5 de 2,6B. Esta conversion aplica GPTQ con una receta de bits por componente (8 bits en atencion, 6 bits en convoluciones, 4 bits en MLP) y conserva la torre de vision, reduciendo el peso de 6,25 GB en bf16 a 2,36 GB.

El interes practico de esta ficha es doble. Por un lado, es una de las primeras builds MLX de este modelo con entrada de imagen funcional, lo que permite ejecutarlo localmente en Apple Silicon sin salir del equipo. Por otro lado, demuestra una tecnica de cuantizacion mixta (bautizada JANG por el autor) que preserva las capacidades multimodales con una degradacion medida muy baja: +2,3 % de perplejidad en texto, +1,5 % en codigo y una similitud coseno de 0,997 en las caracteristicas de imagen respecto al modelo en fp32.

El repositorio tiene 3.123.483.888 parametros almacenados y un tamano de 2,4 GB. Se publica bajo la LFM Open License v1.0 (heredada del modelo base), con 0 descargas y 0 likes en el momento de la consulta, y una fecha de creacion de 2026-10-11. Al ser una conversion de terceros, el autor no ha entrenado el modelo y remite a la model card del base para alcance y limitaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decodificador hibrido LFM2.5 (convolucion corta con compuerta + atencion completa) con codificador visual SigLIP2 NaFlex y proyector pixel-unshuffle de 2 capas MLP |
| Parametros totales | 3.123.483.888 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GPTQ mixto por componente: 8 bits atencion, 6 bits convolucion, 4 bits MLP, 8 bits embeddings, 8 bits torre de vision; bf16 en fc2 de la MLP de vision, kernels de convolucion, normas y grid posicional. Grupo 64 |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (lfm1.0), identificada como "other" en HuggingFace |
| Formato de pesos | safetensors (MLX), con codigo personalizado (`custom_code`) |

## Arquitectura y entrenamiento

El modelo base combina dos bloques. El decodificador es un LFM2.5-2.6B de tipo hibrido: de sus 30 capas, 8 usan atencion completa (q, k, v, out) y 22 usan convolucion corta con compuerta (in_proj, out_proj). El codificador visual es un SigLIP2 NaFlex de 27 capas, conectado mediante un proyector de pixel unshuffle seguido de una MLP de 2 capas. La entrada de imagen se divide en teselas de 512 pixeles (hasta 10) mas una miniatura, siguiendo el esquema de HuggingFace.

Esta publicacion no entrena el modelo: es una conversion cuantizada. El autor aplica GPTQ con compensacion de error de Hessian, capa a capa sobre las salidas de las capas ya cuantizadas, sobre la rejilla afin exacta de MLX con grupo 64. Los codigos enteros elegidos por GPTQ se escriben directamente en los ficheros MLX, sin redondeo adicional por parte de `mlx_lm.convert`. La calibracion usa 128 secuencias de 512 tokens, mezcla de wikitext-2 de entrenamiento y codigo fuente Python, ejecutada en una GPU L40S. El resultado es una receta de bits por componente, con la torre de vision a 8 bits y el fc2 de la MLP visual (ancho de entrada 4304, no multiplo de 64) mantenido en bf16, junto con kernels de convolucion, normas y grid posicional.

## Capacidades

- Generacion de texto conversacional con plantilla de chat propia del modelo base (etiqueta `conversational`).
- Comprension de imagen y texto (pipeline `image-text-to-text`), incluyendo descripcion de escenas, con entrada de imagenes grandes troceadas en hasta 10 teselas de 512 pixeles mas una miniatura.
- Conserva la torre de vision funcional tras la cuantizacion: caracteristicas de imagen con coseno medio de 0,997 respecto al modelo en fp32 (bf16 en MLX esta en 0,998).
- Soporte de API compatible con OpenAI mediante `mlx_lm.server` (chat con partes `image_url` en data URL).
- Capacidades de codigo y razonamiento propias del modelo base: la perplejidad medida en codigo Python es de 13,647 frente a 13,451 en bf16.
- Tool calling, function calling, agentes, modo thinking, audio o vision adicional: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente local de vision en macOS: el modelo puede describir y analizar imagenes enviadas por el usuario en un chat local, sin que los datos salgan del equipo, gracias a la build MLX y al servidor compatible con OpenAI incluido en el fork `mlx-lm`.
- Clasificacion y etiquetado de imagenes en lotes pequenos: con un peso de 2,36 GB, cabe en un Mac con memoria unificada moderada y permite procesar catalogos de imagenes (productos, documentacion, capturas) generando descripciones o etiquetas.
- Extraccion de informacion de capturas y documentos escaneados: la division automatica en teselas de 512 pixeles permite trabajar con capturas de pantalla o paginas densas en texto sin reescalarlas a la fuerza.
- Generacion y revision de codigo asistida: la degradacion de perplejidad en codigo es del 1,5 %, por lo que el modelo mantiene calidad suficiente para autocompletado, explicacion de fragmentos y revision en un entorno de desarrollo local.
- Prototipado de aplicaciones multimodales en Apple Silicon: sirve como backend de bajo coste para probar interfaces de chat con imagen antes de pasar a un despliegue mayor.
- Automatizacion de accesibilidad: descripcion de imagenes en dos frases, un caso que el autor verifica con respuestas coherentes entre el modelo original y el cuantizado.
- Servicio de inferencia local con API OpenAI-compatible: util para integrar el modelo en herramientas existentes (clientes de chat, agentes, pipelines internos) sin modificar el codigo cliente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor unicamente reporta mediciones de perplejidad y de similitud de caracteristicas visuales.

Texto (perplejidad, wikitext-2 test y codigo Python reservado, 40 x 512 tokens, todo en MLX):

| Version | Tamano | PPL texto | vs bf16 | PPL codigo | vs bf16 |
|---|---|---|---|---|---|
| bf16 (original) | 6,25 GB | 51,77 | — | 13,451 | — |
| Este modelo | 2,36 GB | 52,94 | +2,3 % | 13,647 | +1,5 % |

Imagen (coseno por token de imagen frente a HF transformers en fp32):

| Version | Foto teselada 1 | Foto teselada 2 | Imagen pequena |
|---|---|---|---|
| bf16 en MLX | 0,998 | 0,998 | 0,9995 |
| Este modelo | 0,997 | 0,997 | 0,998 |

Los tokens de imagen expandidos son identicos a los de HuggingFace en las tres imagenes de prueba. La velocidad no se midio en Mac para esta release.

## Requisitos de hardware

- Peso del modelo en disco y en memoria: 2,36 GB (repositorio de 2,4 GB).
- Plataforma objetivo: Apple Silicon exclusivamente. El formato MLX no se ejecuta en CUDA ni en CPU x86 a traves de `mlx-lm`.
- Memoria unificada estimada: dado el peso de 2,36 GB y el coste de la cache KV, un Mac con 8 GB de memoria unificada es el minimo razonable para texto; 16 GB o mas es recomendable para conversaciones largas y procesamiento de varias teselas de imagen. Estimacion orientativa, no un dato publicado por el autor.
- GPU recomendadas: no aplica para inferencia; la cuantizacion se genero en una NVIDIA L40S, pero el artefacto esta pensado para Apple Silicon. GPU CUDA (A100, H100, RTX 4090) no son compatibles con este checkpoint concreto.
- Cabe en GPU de consumo: no aplica, el destino son equipos Mac con memoria unificada.
- Opciones de despliegue: requiere el fork `ipsupport-llc/mlx-lm` (incluye torre de vision LFM2-VL, proyector y procesador de teselado sin dependencia de torch). El `mlx-lm` estandar no carga checkpoints `lfm2_vl`. Comando: `mlx_lm.server --model roman220220/LFM2.5-VL-3B-gptq-mlx-jang --port 8080`. No compatible con vLLM, llama.cpp, Ollama o TGI.
- Parametros de generacion recomendados por Liquid AI: temperatura 0,2, top_k 50, repetition penalty 1,0.
- Latencia y throughput: no medidos en Mac en esta release.

## Comparativa con modelos similares

No se dispone de datos de otros modelos comparables en la informacion proporcionada (ni de otras cuantizaciones del mismo base, ni de VLMs de tamano similar en MLX con mediciones equivalentes). La unica comparacion documentada es contra el propio modelo base sin cuantizar.

| Modelo | Parametros | Tamano | Contexto | Licencia | Disponibilidad | PPL texto |
|---|---|---|---|---|---|---|
| LFM2.5-VL-3B-gptq-mlx-jang (este) | 3.123.483.888 | 2,36 GB | no disponible | LFM Open License v1.0 | HuggingFace, formato MLX | 52,94 |
| LiquidAI/LFM2.5-VL-3B (base bf16) | no disponible | 6,25 GB | no disponible | LFM Open License v1.0 | HuggingFace, transformers | 51,77 |

## Limitaciones y advertencias

- Es una conversion de terceros: el autor no ha entrenado el modelo y declara no ser responsable de sus salidas ni del uso que se haga de ellas.
- No se han medido latencia ni throughput en Mac, por lo que el rendimiento real en produccion es desconocido.
- Requiere un fork no oficial de `mlx-lm`; el ecosistema estandar de MLX no carga el checkpoint. Esto implica dependencia de mantenimiento externo y riesgo de rotura con actualizaciones.
- La cuantizacion introduce degradacion medible: +2,3 % de perplejidad en texto y +1,5 % en codigo respecto a bf16, ademas de una perdida aproximada del 0,1 % en las caracteristicas visuales.
- La descripcion de imagenes puede variar en detalles concretos respecto al original (el ejemplo del autor cambia "insect" por "bee" manteniendo el sentido), un indicio de que pueden aparecer discrepancias menores en tareas de reconocimiento fino.
- La licencia LFM Open License v1.0 puede imponer restricciones al uso comercial. Debe revisarse el fichero LICENSE antes de un despliegue productivo; esta ficha no interpreta sus terminos.
- Sesgos conocidos, idiomas soportados y comportamiento multilingue: no disponibles en la informacion proporcionada. Se remite a la model card del modelo base.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; no hay evaluacion especifica publicada para esta conversion.
- Longitud de contexto: no disponible, lo que impide garantizar conversaciones largas o documentos extensos.
- Repositorio con 0 descargas y 0 likes: no hay validacion de la comunidad ni evidencia de uso en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/roman220220/LFM2.5-VL-3B-gptq-mlx-jang
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-VL-3B
- Fork de mlx-lm necesario para vision: https://github.com/ipsupport-llc/mlx-lm
- Repositorio con pipeline, scripts y mediciones: https://github.com/rromenskyi/quant-ternary (`lfm2-quant/`: `poc/lfm2_mlx_pipeline.sh`, `poc/gptq_lfm2.py`, `poc/convert_lfm2.py`, `poc/check_lfm2.py`, `poc/check_vl_lfm2.py`, `docs/FINDINGS.md`)
- LLMTray, aplicacion macOS de IA local: https://www.ipsupport.us/llmtray/
- Descarga de LLMTray: https://github.com/ipsupport-llc/llmtray/releases/latest/download/LLMTray-Full.dmg
- IPSupport Code: https://ipsupport-llc.github.io/ipsupport-code/
- Sitio del autor: https://www.ipsupport.us
