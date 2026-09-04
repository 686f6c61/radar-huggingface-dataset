# DreamFoundries/K2-Horizon-7B-MLX-6bit

## Resumen

K2 Horizon 7B es un modelo de lenguaje generativo de 7.000 millones de parámetros, desarrollado por el Institute of Foundation Models (IFM) y publicado con pesos abiertos bajo licencia Apache 2.0. Este repositorio concreto contiene una conversión a formato MLX 6-bit creada por DreamFoundries para su ejecución nativa en Apple Silicon mediante el framework MLX. El modelo base se presenta como una arquitectura densa con routers K2 internos, un diseño que no es MoE, y está orientado a generación de texto conversacional en inglés.

La conversión mantiene la estructura del modelo original pero aplica cuantización affine a 6 bits con grupo de tamaño 64, preservando sin cuantizar los routers K2. No se han publicado benchmarks comparativos para esta conversión, y la información técnica disponible se limita a lo indicado en la model card, lo que obliga a ser prudente al evaluar su rendimiento. No obstante, al tratarse de un modelo de 7B con licencia permisiva, es un candidato interesante para entornos locales de inferencia dentro del ecosistema MLX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con routers K2 (no MoE) |
| Parametros totales | 7B (7.000 millones, segun el nombre del modelo) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 6-bit affine (group size 64) en MLX; routers K2 sin cuantizar |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (conversion MLX) |

## Arquitectura y entrenamiento

La conversion de DreamFoundries toma el modelo IFM/K2-Horizon-7B y lo adapta al framework MLX mediante un fork propio de `mlx-lm` (commit `0f74c0e`). La cuantizacion aplicada es affine a 6 bits con grupo de tamano 64, pero los routers K2 del modelo (`mlp.gate` y, donde esten presentes, `self_attn.v_router`) se mantienen sin cuantizar por decision de la implementacion original. El modelo base es un transformer denso, etiquetado como `dense` en sus metadatos, lo que indica que no se trata de una arquitectura de mezcla de expertos (MoE) a pesar de la presencia de estos mecanismos de enrutado.

El entrenamiento del modelo original uso los datasets `IFM/K2-Horizon-Pretrain-Data` e `IFM/K2-Horizon-Midtrain-Data`, segun la model card. Sin embargo, no se han publicado datos sobre el numero de tokens procesados, la composicion exacta del corpus ni la aplicacion de tecnicas de alineacion como RLHF o DPO. La ausencia de documentacion tecnica detallada impide confirmar innovaciones adicionales mas alla de los routers K2 y el hecho de que se trate de un modelo de 7B de pesos abiertos.

## Capacidades

- Generacion de texto conversacional en ingles: el modelo esta marcado con la etiqueta `text-generation` y `conversational`.
- Uso como modelo de chat: la model card no ofrece ejemplos de prompts, pero la conversion incluye instrucciones basicas de uso con `mlx_lm`.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion disponible.
- Capacidades multilingues: no; solo ingles segun los metadatos del repositorio.
- Capacidades especiales (vision, audio, modo de pensamiento): ninguna documentada en la informacion disponible.

## Casos de uso

- Asistente conversacional en local: al ser un modelo de 7B con pesos abiertos, puede desplegarse en un Mac con MLX para gestionar conversaciones de soporte en ingles sin enviar datos a servidores externos. La cuantizacion 6-bit reduce el consumo de memoria y facilita la ejecucion en equipos de gama media.
- Resumen de documentos: el modelo puede generar resumenes de articulos o informes en ingles, siempre que se valide su calidad antes de usarlo en produccion, ya que no hay benchmarks publicados.
- Redaccion de contenido: permitido por la licencia Apache 2.0, el modelo puede producir borradores de correos, entradas de blog o notas internas en ingles, siempre que se supervise la salida.
- Analisis de sentimiento: al ser un modelo conversacional, puede etiquetar opiniones en ingles si se le proporciona un prompt adecuado. Es un caso de uso posible, aunque su precision no esta documentada.
- Extraccion de informacion: el modelo puede utilizarse para extraer entidades o conceptos de texto en ingles, siempre que se refine el prompt y se valide con datos propios.
- Tutorizacion basica: puede responder preguntas factuales en ingles en un contexto educativo, pero su fiabilidad debe comprobarse caso por caso debido a la falta de evaluaciones publicadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- La conversion esta disenada para ejecutarse en Mac con Apple Silicon (M1, M2, M3, M4) mediante el framework MLX. No es compatible con GPU NVIDIA, AMD ni con CUDA/ROCm.
- Estimacion de memoria: un modelo de 7B en 6-bit ocupa aproximadamente 7 GB de memoria. Se recomienda un Mac con al menos 16 GB de memoria unificada para garantizar un margen adecuado.
- No se dispone de datos oficiales sobre latencia o throughput para este repositorio.
- Opciones de despliegue: biblioteca `mlx_lm` (con `from mlx_lm import load, generate`), MLXHub como plataforma de distribucion, y la app de MLXHub para uso en Mac.
- Los routers K2 permanecen sin cuantizar, lo que anade un pequeno overhead de memoria adicional no cuantificado en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| DreamFoundries/K2-Horizon-7B-MLX-6bit | 7B | 6-bit affine (MLX) | no disponible | Apache 2.0 | MLX / safetensors |
| IFM/K2-Horizon-7B | 7B | sin cuantizar | no disponible | Apache 2.0 | safetensors |

No se han publicado datos de modelos comparables en la informacion disponible.

## Limitaciones y advertencias

- No se han publicado evaluaciones de sesgos para este modelo, por lo que no es posible conocer sus sesgos inherentes.
- La ausencia de benchmarks implica que las metricas de alucinacion, fiabilidad y rendimiento general son desconocidas. Cualquier uso en produccion requiere una validacion exhaustiva previa.
- La longitud de contexto no esta disponible. No se debe asumir un manejo de ventanas largas ni memorias de conversacion extensas.
- El modelo solo soporta ingles segun los metadatos. El uso en otros idiomas no esta garantizado.
- La licencia Apache 2.0 permite el uso comercial, pero la falta de documentacion tecnica y de evaluaciones hace que el despliegue en produccion sea arriesgado sin una hoja de ruta de pruebas claramente definida.
- Al tratarse de una conversion MLX, el modelo solo puede ejecutarse en hardware Apple Silicon. No es portable a infraestructuras GPU convencionales.
- Los routers K2 sin cuantizar pueden aumentar el uso de memoria respecto a una cuantizacion completa de todos los pesos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/DreamFoundries/K2-Horizon-7B-MLX-6bit
- Modelo base: https://huggingface.co/IFM/K2-Horizon-7B
- Perfil de DreamFoundries: https://huggingface.co/DreamFoundries
- MLXHub: https://mlxhub.app/open-model?repo=DreamFoundries/K2-Horizon-7B-MLX-6bit
- App MLXHub: https://apps.apple.com/app/apple-store/id6766485144?pt=121945436&ct=HuggingFace&mt=8
- Noticia sobre el lanzamiento de la flota K2 Horizon: https://aijourn.com/institute-of-foundation-models-launches-the-industrys-largest-fully-open-source-fleet-of-ai-models-complete-with-weights-code-training-data-and-methodologies/
