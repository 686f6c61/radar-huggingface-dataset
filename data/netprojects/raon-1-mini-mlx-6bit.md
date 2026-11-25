# netprojects/Raon-1-mini-MLX-6bit

## Resumen

Raon-1-mini es un modelo de lenguaje de arquitectura Mixture-of-Experts (MoE) desarrollado por KRAFTON AI, entrenado desde cero. Cuenta con 28.800 millones de parámetros totales y 4.300 millones activos por token, activando 6 de 128 expertos enrutados más 1 compartido. Su ventana de contexto alcanza los 262.144 tokens y combina 18 capas de Raon Delta Attention con 7 capas de MLA con compuerta, una arquitectura híbrida propia orientada a conversación en coreano y tareas agénticas.

La ficha que nos ocupa no es el modelo original, sino una cuantización de 6 bits en formato MLX para Apple Silicon, publicada por NetProjects. Se ha convertido desde la versión MXFP8 de KRAFTON y ocupa 24,0 GB, lo que la convierte en la opción recomendada por el autor para equipos con memoria unificada de gama alta. Incluye el modelo borrador DFlash2 para decodificación especulativa y soporta los seis niveles de esfuerzo de razonamiento del modelo base.

Su relevancia actual radica en que permite ejecutar un MoE de casi 29.000 millones de parámetros con contexto de 262.144 tokens en un Mac con Apple Silicon, manteniendo un 97,8% de coincidencia top-1 con los pesos bf16 y alcanzando 184 tok/s con decodificación especulativa en un M5 Max. Además, cubre siete idiomas, entre ellos el español, y ofrece tool calling y modos de pensamiento configurables por petición.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE híbrido: 18 capas Raon Delta Attention + 7 capas gated MLA |
| Parametros totales | 29.226.691.468 (28,8B) |
| Parametros activos | 4,3B por token (6 de 128 expertos enrutados + 1 compartido) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | 6 bits afín (group size 64) en capas lineales; 8 bits en cabeza de salida y embeddings; bf16 en router, `kv_b_proj` y proyecciones de compuerta RDA |
| Idiomas soportados | Coreano, inglés, japonés, chino, español, francés y tailandés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), 24,0 GB de repo (25,0 GB reportados en Hugging Face) |

## Arquitectura y entrenamiento

El modelo base emplea una arquitectura MoE con enrutamiento disperso: de los 128 expertos enrutados se activan 6 por token, más un experto compartido, lo que resulta en 4,3B parámetros activos sobre un total de 28,8B. La innovación arquitectónica principal es la combinación de 18 capas de Raon Delta Attention (RDA) con 7 capas de MLA con compuerta, una hibridación que KRAFTON presenta como propia y que busca equilibrar eficiencia de atención y calidad de representación en contextos largos de hasta 262.144 tokens. El modelo se entrenó desde cero, aunque la información disponible no detalla el volumen de tokens ni la composición exacta del dataset de preentrenamiento, ni confirma el uso de RLHF o DPO.

Esta build concreta no entrena ni modifica pesos: parte de la revisión `aa14d2989727` de KRAFTON/Raon-1-mini en formato MXFP8 (expertos enrutados en fp8 con una escala potencia de dos por cada 32 entradas, resto en bf16) y aplica cuantización afín de 6 bits con group size 64 a todas las capas lineales, desquantizando previamente los expertos enrutados de forma exacta desde MXFP8. La cabeza de salida y el embedding de tokens quedan en 8 bits, mientras que el router, `kv_b_proj` de MLA y las proyecciones de compuerta RDA permanecen en bf16. El código procede de KRAFTON/Raon-1-mini-mlx (revisión `78b7555b8902`) con una única modificación de NetProjects: las capas afines verifican todas las filas del borrador en un producto batcheado para que DFlash2 sea más rápido que la generación simple; se puede revertir con `RAON_BATCHED_AFFINE_VERIFY=0`.

## Capacidades

- Generación de texto conversacional multi-turno, con especial énfasis en coreano e inglés.
- Razonamiento con seis niveles de esfuerzo configurables por petición: `none`, `low`, `medium`, `high`, `xhigh` y `max`.
- Modo de pensamiento integrado (`enable_thinking=True` en el chat template).
- Tool calling y function calling, con configuraciones documentadas para Hermes Agent, Pi y OpenCode.
- Tareas agénticas y razonamiento multi-paso, incluyendo búsqueda web (BrowseComp Plus).
- Capacidades multilingües en coreano, inglés, japonés, chino, español, francés y tailandés.
- Decodificación especulativa mediante el modelo borrador DFlash2 incluido en el repositorio.
- Cabeza de salida opcional de dos etapas.
- Servidor compatible con la API de OpenAI que acepta el parámetro `reasoning_effort`.

## Casos de uso

- Asistencia conversacional multi-turno en coreano: el modelo fue entrenado específicamente para conversación en coreano y obtiene 64,9 en MultiChallenge, por lo que es adecuado para atención al cliente y asistentes de soporte en ese idioma con contexto largo de hasta 262.144 tokens.
- Agentes de búsqueda y navegación: con 55,9 en BrowseComp Plus y soporte de tool calling, puede integrarse en pipelines de búsqueda web iterativa donde el agente formula consultas, lee resultados y sintetiza respuestas.
- Razonamiento matemático y científico de alta exigencia: los niveles `high`, `xhigh` y `max` permiten activar cadenas de pensamiento extensas para problemas de competición (96,7 en AIME 2026, 87,1 en HMMT Feb 2026) o cuestiones de posgrado (86,0 en GPQA Diamond).
- Asistente de programación local en Mac: con `presence_penalty` 0 y esfuerzo `none`, la build alcanza 118 tok/s en generación simple y 184 tok/s con DFlash2 en un M5 Max, suficiente para autocompletado e integración en editores sobre Apple Silicon sin depender de la nube.
- Procesamiento de documentos largos en varios idiomas: la ventana de 262.144 tokens permite resumir, extraer y responder preguntas sobre contratos, informes o expedientes en español, francés, inglés o tailandés dentro de un único contexto.
- Despliegue de agentes de código en local: el servidor compatible con OpenAI (`raon_mlx_model.py serve`) acepta `reasoning_effort`, lo que permite conectarlo a herramientas como OpenCode o Hermes Agent para tareas de edición y refactorización multi-paso.
- Prototipado de investigación en razonamiento: los seis niveles de esfuerzo permiten comparar el comportamiento del modelo con distintas profundidades de pensamiento sobre el mismo prompt sin cambiar de modelo.

## Benchmarks y rendimiento

Datos de benchmarks del modelo base publicados por KRAFTON:

| Benchmark | Resultado |
|---|---|
| AIME 2026 | 96,7 |
| HMMT Feb 2026 | 87,1 |
| GPQA Diamond | 86,0 |
| MultiChallenge | 64,9 |
| BrowseComp Plus | 55,9 |

Métricas de esta build de 6 bits (NetProjects):

| Metrica | Valor |
|---|---|
| Coincidencia top-1 vs bf16 | 97,8% (311 posiciones teacher-forced, 8 prompts cortos en inglés/coreano, thinking on y off) |
| Decodificacion simple | 118 tok/s |
| Decodificacion con DFlash2 | 184 tok/s |
| Hardware de medida | MacBook Pro M5 Max, 128 GB, prompt de código greedy de 400 tokens, effort `none` |

Las cifras de velocidad son indicativas y dependen del prompt y del número de tokens borrador aceptados.

## Requisitos de hardware

- Memoria: la build de 6 bits ocupa 24,0 GB, por lo que requiere un Mac con memoria unificada de al menos 32 GB para dejar margen al contexto y al modelo borrador; 64 GB o más es recomendable para contextos largos.
- GPU: exclusivamente Apple Silicon (MLX); no está pensada para GPU NVIDIA o AMD.
- Cabe en equipos de consumo Apple: MacBook Pro y Mac Studio con chips M-series de gama alta; la build de 3 bits mixed (14,4 GB) está pensada para Macs de 24 GB.
- Despliegue: script propio `raon_mlx_model.py` (generate y serve con API compatible OpenAI), `mlx-lm` (load/generate y `python -m mlx_lm server`), con versiones fijadas `mlx==0.32.4`, `mlx-lm==0.32.2`, `transformers==5.20.1` y Python 3.11+.
- Throughput medido: 118 tok/s en decodificación simple y 184 tok/s con DFlash2 en un M5 Max de 128 GB.
- La latencia no se ha publicado de forma independiente; las cifras anteriores son del autor de la build.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / plataforma | Notas |
|---|---|---|---|---|---|
| netprojects/Raon-1-mini-MLX-6bit | 28,8B totales, 4,3B activos | 262.144 | Apache 2.0 | MLX safetensors, Apple Silicon | 24,0 GB, 97,8% top-1 vs bf16, 184 tok/s con DFlash2 |
| netprojects/Raon-1-mini-MLX-8bit | 28,8B totales, 4,3B activos | 262.144 | Apache 2.0 | MLX safetensors, Apple Silicon | 30,1 GB, 97,4% top-1, 105 tok/s simple y 81 tok/s con DFlash2 |
| netprojects/Raon-1-mini-MLX-3bit-mixed | 28,8B totales, 4,3B activos | 262.144 | Apache 2.0 | MLX safetensors, Apple Silicon | 14,4 GB, 93,9% top-1, 133 tok/s simple y 252 tok/s con DFlash2, cabe en Macs de 24 GB |
| KRAFTON/Raon-1-mini-mlx | 28,8B totales, 4,3B activos | 262.144 | Apache 2.0 | MLX, 4 bits NVFP4 | Build oficial de KRAFTON para Apple Silicon |

No se dispone de datos de benchmarks comparativos frente a modelos de otros fabricantes en la información proporcionada.

## Limitaciones y advertencias

- La build está limitada a Apple Silicon y a MLX; no es ejecutable en GPU NVIDIA, AMD ni en CPU convencional sin conversión adicional.
- La decodificación con DFlash2 puede diferir de la generación simple por empates de redondeo poco frecuentes, como en cualquier decodificación especulativa.
- El servidor `mlx_lm` estándar soporta tool calling pero ignora `reasoning_effort`; para controlar el esfuerzo de razonamiento hay que usar el servidor propio de KRAFTON.
- El modelo está especialmente optimizado para coreano e inglés; el rendimiento en español, francés, tailandés, japonés y chino está declarado pero no se han publicado benchmarks específicos por idioma en la información disponible.
- No se han publicado detalles sobre sesgos, composición del dataset de entrenamiento ni procesos de alineación (RLHF/DPO), lo que limita la evaluación de riesgos de alucinación y sesgo.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base se distribuye por KRAFTON y conviene verificar los términos de la model card original antes de un despliegue en producción.
- Las cifras de velocidad y coincidencia top-1 proceden del autor de la build y de un único hardware (M5 Max, 128 GB); no son extrapolables a otros equipos.
- El repositorio tiene un volumen de descargas muy bajo (4) y ningún like, por lo que no existe validación comunitaria independiente de esta cuantización concreta.

## Enlaces

- Hugging Face (esta build): https://huggingface.co/netprojects/Raon-1-mini-MLX-6bit
- Modelo base: https://huggingface.co/KRAFTON/Raon-1-mini
- Build MLX oficial de KRAFTON (4 bits NVFP4): https://huggingface.co/KRAFTON/Raon-1-mini-mlx
- Build de 8 bits de NetProjects: https://huggingface.co/netprojects/Raon-1-mini-MLX-8bit
- Build de 3 bits mixed de NetProjects: https://huggingface.co/netprojects/Raon-1-mini-MLX-3bit-mixed
- NetProjects: https://netprojects.com
