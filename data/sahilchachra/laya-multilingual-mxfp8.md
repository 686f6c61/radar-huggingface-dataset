# sahilchachra/Laya-Multilingual-MXFP8

## Resumen

Laya-Multilingual-MXFP8 es la cuantizacion a MXFP8 del backbone encoder multilingue del modelo Laya, desarrollado por Convai Innovations. En concreto, este repositorio publicado por el usuario sahilchachra contiene unicamente el encoder compartido mmBERT-base (mas de 100 idiomas, 322 millones de parametros, 768 de dimension oculta, 22 capas y 1024 tokens de contexto), convertido al formato de ModernBERT y cuantizado para MLX, el framework de computacion en Apple Silicon.

Laya no es un encoder convencional: el modelo completo combina ese backbone bidireccional con una cabeza de decision entrenada aparte mediante RLCD (reinforcement learning from comparative decisions), que incluye un TransformerEncoder de 2 capas, un scorer de marcadores de opcion y una cabeza de actuar/escalar. Esta publicacion cuantiza y distribuye solo el backbone encoder compartido (~307 millones de parametros reales segun el fichero safetensors), no la cabeza de decision, que queda fuera por ser un modulo torch diminuto (~15M) que no se beneficia de la cuantizacion en MLX.

Es relevante para quienes quieran un extractor de caracteristicas multilingue cuantizado de ~317 MB en disco, ejecutable en Apple Silicon con una huella de memoria reducida, o para construir una cabeza propia en MLX sobre el encoder. No es un modelo generativo: no existe ruta `generate()` ni plantilla de chat, por lo que no es utilizable en LM Studio ni como modelo conversacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBertModel (encoder bidireccional, portado via mlx-embeddings) |
| Parametros totales | 306.939.648 (~307M, encoder backbone) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | MXFP8 (group size 32); existe variante MXFP4 en otro repositorio |
| Idiomas soportados | mas de 100 idiomas (backbone mmBERT-base) |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El backbone es un mmBERT-base: un encoder transformer bidireccional tipo ModernBERT con 22 capas, 768 de dimension oculta y 1024 tokens de longitud de contexto, entrenado para mas de 100 idiomas. ModernBERT emplea atencion alternada local/global (una capa de atencion global cada 3 capas, ventana local de 128) con embeddings posicionales rotatorios (RoPE) y atencion sin sesgo. La cuantizacion se realizo con `mlx-embeddings` mediante `nn.quantize(..., mode="mxfp8")` con tamano de grupo 32, dando un fichero de ~317 MB en disco.

El modelo Laya completo anade a este encoder una cabeza de decision entrenada por separado con RLCD (segun el material de Convai Innovations), orientada a decisiones tipo "System 1" con baja latencia: puntuacion de opciones, eleccion y una cabeza de actuar/escalar. El autor del repositorio declara explicitamente que esa cabeza no se incluye ni se porta a MLX, porque la API publica de Laya (`laya.load(...)` / `RLAgent`) espera un directorio de modelo torch tal cual. La verificacion reportada compara el encoder MLX sin cuantizar con la referencia torch: diferencia absoluta maxima de 0,045 y media de 0,0025 sobre `last_hidden_state` (magnitud media ~0,63), lo que confirma la correccion numerica del port independentemente de la cuantizacion.

## Capacidades

- Extraccion de caracteristicas de texto: genera `last_hidden_state` (representaciones contextuales) aptas para tareas aguas abajo.
- Clasificacion de texto: la etiqueta de pipeline es `text-classification` / `feature-extraction`, con cabeza propia entrenable.
- Multilingue: backbone entrenado para mas de 100 idiomas.
- Procesamiento bidireccional (no autoregresivo): util para embeddings, similitud semantica, reranking y moderacion.
- Construccion de cabezas personalizadas en MLX sobre el encoder cuantizado.
- No incluye generacion de texto, tool calling, razonamiento multi-paso, agentes, vision ni audio.
- No incluye la cabeza de decision de Laya ni su API de decisiones.

## Casos de uso

- Extraccion de embeddings multilingues en Mac: usar el encoder cuantizado para generar representaciones de frases en mas de 100 idiomas con una huella de ~317 MB y sin GPU dedicada.
- Busqueda semantica y recuperacion: indexar documentos mediante embeddings generados en Apple Silicon para montar un sistema RAG ligero en local.
- Clasificacion de textos y deteccion de intenciones: anadir una cabeza de clasificacion en MLX sobre el `last_hidden_state` para moderacion, analisis de sentimiento o etiquetado de tickets.
- Reranking en pipelines de recuperacion: puntuar pares consulta-documento con el encoder y reordenar resultados de un buscador.
- Prototipado de decisiones de baja latencia: emplear el encoder como base para reproducir la logica de "System 1" de Laya (eleccion entre opciones) de forma aproximada, asumiendo la deriva de cuantizacion.
- Filtrado y moderacion de contenido multilingue: clasificar comentarios en varios idiomas en un servicio que corra en hardware de Apple.
- Computo en el borde sin servidor GPU: desplegar extraccion de caracteristicas en portatiles Mac como paso previo a un LLM remoto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor solo aporta datos de verificacion de la cuantizacion frente a la referencia fp32 en tareas de eleccion/puntuacion:

| Metrica | MXFP4 | MXFP8 |
|---|---|---|
| Diferencia media absoluta del hidden-state vs fp32 | 0,287 | 0,218 |
| Diferencia maxima absoluta del logit de la cabeza de decision | 1,157 | 0,806 |
| Fallos de top-1 (de 3 preguntas de prueba) | 0/3 | 0/3 |

Verificacion del port sin cuantizar: diferencia absoluta maxima 0,045 y media 0,0025 frente a la referencia torch. El autor advierte que, en terminos relativos, la deriva por cuantizacion de bloques (~35-45% de perturbacion media absoluta) es muy superior a la tipica de un LLM (~1-5%) y que una de las preguntas de prueba invirtio su respuesta top-1 en un caso MXFP8 de puntuacion con opciones muy proximas.

## Requisitos de hardware

- Huella en disco de este checkpoint: ~317 MB (repositorio de 0,4 GB).
- Memoria en inferencia: aproximadamente 400-500 MB en MXFP8; la variante MXFP4 ocupa aproximadamente la mitad.
- Referencia en precision completa: ~1,3 GB en fp32 y ~645 MB en bf16 para los ~322M parametros.
- Disenado para Apple Silicon (MLX): cabe sobradamente en cualquier Mac con chip M1 o posterior, incluidos equipos con 8 GB de memoria unificada.
- No esta pensado para GPU NVIDIA ni para despliegues con vLLM, TGI, llama.cpp u Ollama (es un encoder, no un modelo generativo, y usa formato MLX).
- Libreria de ejecucion: `mlx-embeddings` (mas `transformers` para el tokenizador).
- Latencia y throughput concretos: no disponible (la documentacion de Laya cita un objetivo de menos de 35 ms para el motor de decision completo, pero no se especifica el hardware de esa medida).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato/plataforma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Laya-Multilingual-MXFP8 (este) | ~307M (encoder) | 1024 | MLX / safetensors | no disponible | HuggingFace |
| convaiinnovations/laya (original) | ~322M (encoder + cabeza ~15M) | 1024 | torch | no disponible | HuggingFace |
| mmBERT-base / ModernBERT-base | 322M / 149M | 1024 / 8192 | safetensors (transformers) | no disponible / Apache-2.0 | HuggingFace |
| Encoders multilingues tipo XLM-R / mE5 | ~278M | 512 | safetensors (transformers) | MIT / Apache-2.0 | HuggingFace |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada; los valores de parametros y contexto de las alternativas son de referencia general y pueden variar segun la version concreta.

## Limitaciones y advertencias

- No es un modelo generativo: no dispone de `generate()` ni de plantilla de chat; no funciona en LM Studio ni como asistente conversacional.
- Solo contiene el encoder: no incluye la cabeza de decision de Laya ni su API (`laya.load(...)` / `RLAgent`), por lo que no reproduce las decisiones oficiales del modelo original.
- Sensibilidad a la cuantizacion: como encoder con muchas LayerNorm, la deriva de MXFP8 puede alterar decisiones con puntuaciones muy proximas; el autor recomienda tratar las confidencias cuantizadas como direccionales, no exactas, y preferir bf16/fp32 si se necesita calibracion fina.
- Contexto limitado a 1024 tokens, insuficiente para documentos largos sin troceado.
- Riesgo de sesgo y de alucinacion en tareas aguas abajo: no se documentan evaluaciones de sesgo ni de robustez.
- Licencia no especificada, lo que impide confirmar si se permite el uso comercial; conviene consultar el repositorio original de Laya antes de desplegar en produccion.
- Dependencia de la plataforma Apple Silicon: requiere MLX y no es directamente portable a CUDA sin conversion.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, sin comunidad que valide su uso en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sahilchachra/Laya-Multilingual-MXFP8
- Modelo base: https://huggingface.co/convaiinnovations/laya
- Laya (sitio oficial): https://laya.convaiinnovations.com/
- Variantes del mismo autor: https://huggingface.co/sahilchachra/Laya-English-MXFP4 , https://huggingface.co/sahilchachra/Laya-English-MXFP8 , https://huggingface.co/sahilchachra/Laya-Multilingual-MXFP4 , https://huggingface.co/sahilchachra/Laya-Typed-Decisions-MXFP4 , https://huggingface.co/sahilchachra/Laya-Typed-Decisions-MXFP8
- mlx-embeddings: https://github.com/Blaizzy/mlx-embeddings
- MLX: https://github.com/ml-explore/mlx
- Perfil del autor: https://huggingface.co/sahilchachra/collections
- Ficha de referencia de Laya Multilingual: https://www.gradually.ai/en/ai-models/laya-multilingual/
