# roman220220/Muse-Glimmer-30B-gptq-mlx-jang

## Resumen

Muse-Glimmer-30B-gptq-mlx-jang es una cuantizacion comunitaria del modelo Muse-Glimmer-30B de Meta Superintelligence Labs, un transformer denso de aproximadamente 30.000 millones de parametros (27.854.780.928 parametros reales en los safetensors publicados) disenado para tareas agenticas y publicado bajo licencia Apache 2.0. El modelo base es nativamente multimodal (texto e imagen), razona paso a paso antes de responder y esta ajustado para uso de herramientas y recuperacion de fallos en entornos locales. Esta version concreta, firmada por el usuario roman220220, traslada esos pesos al formato MLX de Apple mediante GPTQ con una receta de bits por componente: 8 bits para atencion y 4 bits para las capas feed-forward.

La relevancia de esta ficha no esta en el modelo base, sino en la estrategia de cuantizacion: el autor reduce el checkpoint de 55,71 GB en bf16 a 19,23 GB aplicando 8 bits a los 4,4 B parametros de atencion y 4 bits a los 20,7 B de feed-forward, con embeddings y cabeza de salida en 8 bits y las normalizaciones en bf16. Segun las mediciones del propio autor, eso supone solo un +1,77 % de perplejidad en texto y un +2,18 % en codigo respecto al bf16, aproximadamente la mitad de la perdida del build de referencia de 4 bits uniforme de mlx-community, que ademas ocupa mas espacio (19,42 GB).

Es importante acotar el alcance: esta publicacion es solo la torre de texto. El codificador de vision ViT-G/14 de ~1,8 B parametros del modelo original no esta incluido porque el port de `mlx-lm` de Apple implementa unicamente el modelo de lenguaje. Es, por tanto, una opcion practica para ejecutar el decodificador de Glimmer en un Mac con memoria unificada, no un sustituto completo del modelo multimodal original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (52 capas), atencion completa con puerta de salida sigmoide, patron alterno sliding-window / full / NoPE `[local, local, local, global]`, RMSNorm "centered" (4 por capa, bf16), QK-norm sin escala |
| Parametros totales | 27.854.780.928 (safetensors); ~29,6 B segun la model card, incluyendo embeddings y cabeza de salida |
| Parametros activos | No aplica: modelo denso, no MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GPTQ sobre la rejilla affine de MLX, grupo 64: atencion (q, k, v, o, gate) a 8 bits; feed-forward (gate, up, down) a 4 bits; `embed_tokens` y `lm_head` a 8 bits round-to-nearest; normas en bf16. Calibrado con 128 x 512 tokens (wikitext-2 train + codigo Python) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (libreria `mlx`); no se publican GGUF ni GPTQ estandar para CUDA |

## Arquitectura y entrenamiento

El modelo base es un transformer denso sin mezcla de expertos ni capas convolucionales. Cada una de las 52 capas aplica atencion completa con una puerta de salida sigmoide adicional, y el patron de atencion alterna ventana deslizante, atencion completa y capas sin codificacion posicional (NoPE) siguiendo una secuencia fija de cuatro tipos `[local, local, local, global]`. Emplea cuatro RMSNorm "centered" por capa y una QK-norm sin parametros de escala. La cabeza de salida (`lm_head`) no esta atada a los embeddings, lo que anade 1,3 B parametros independientes. Muse Glimmer se presenta como un modelo destilado de Muse Spark, con razonamiento explicito antes de la respuesta y ajuste orientado a uso de herramientas, tareas largas y recuperacion de errores; no se dispone de datos sobre volumen de tokens de entrenamiento, composicion del dataset ni si hubo RLHF o DPO.

Sobre el proceso de cuantizacion: el autor aplica GPTQ con compensacion de error Hessiano capa por capa, calibrando sobre las salidas de las capas ya cuantizadas, y escribe directamente en los ficheros MLX los codigos enteros elegidos por GPTQ sin volver a redondearlos con `mlx_lm.convert`. La calibracion se ejecuto en una unica RTX PRO 6000 (96 GB) en menos de diez minutos, ya que solo una capa reside en GPU cada vez. Respecto al checkpoint original (55,71 GB), el resultado ocupa 19,23 GB. El modelo base incluye un codificador de percepcion ViT-G/14 de ~1,8 B parametros que no forma parte de esta publicacion.

## Capacidades

- Generacion de texto conversacional y razonamiento paso a paso: el modelo abre siempre un canal `<|message|>` antes de responder, segun la model card del autor.
- Uso de herramientas y function calling nativo, orientado a flujos agenticos.
- Razonamiento multi-paso y ejecucion de tareas largas, con recuperacion de fallos como objetivo de diseno del modelo base.
- Salida de razonamiento separada de la respuesta final (segun la documentacion de Meta y NVIDIA NIM para el modelo base).
- Capacidades multimodales (texto e imagen) en el modelo original; no disponibles en esta build MLX, que es solo texto.
- Soporte multilingue: no disponible en la informacion proporcionada.
- No se documentan capacidades de audio ni de vision en este checkpoint.

## Casos de uso

- Agentes locales en macOS: el checkpoint ocupa 19,23 GB y se ejecuta con `mlx-lm` sobre memoria unificada, de modo que un Mac de 32 GB o mas puede mantener un agente con llamadas a herramientas sin enviar datos a la nube.
- Servidor compatible con OpenAI en local: `mlx_lm.server --model roman220220/Muse-Glimmer-30B-gptq-mlx-jang --port 8080` expone el modelo como API y permite apuntar herramientas existentes (clientes OpenAI, LangChain, scripts propios) al endpoint sin cambiar codigo.
- Automatizacion de tareas de desarrollo con coste de cuantizacion bajo: la perplejidad en codigo solo sube un +2,18 % respecto al bf16, asi que sirve para generacion y revision de codigo en local donde no se quiere depender de una API externa.
- Investigacion en cuantizacion: la receta 8/4 por componente y las mediciones de perplejidad publicadas permiten reproducir y comparar estrategias de asignacion de bits frente a cuantizacion uniforme de 4 bits.
- Procesamiento por lotes en un solo equipo Apple Silicon: al caber en 19,23 GB, se puede ejecutar en paralelo con otras cargas en una maquina de 64 o 128 GB, sin GPU dedicada.
- Evaluacion de modelos agenticos antes de invertir en infraestructura: permite probar el comportamiento de Glimmer (formato de tool calling, razonamiento previo, recuperacion de errores) en local antes de desplegar la version bf16 o el modelo multimodal completo.
- Sustitucion de la build de referencia de 4 bits en pipelines MLX existentes: mismo runtime, 190 MB menos y menor degradacion de calidad medida.

## Benchmarks y rendimiento

Unicas mediciones publicadas en la informacion disponible: perplejidad en MLX sobre wikitext-2 test y codigo Python reservado, 40 x 512 tokens cada uno.

| Modelo | Tamano | PPL texto | vs bf16 | PPL codigo | vs bf16 |
|---|---|---|---|---|---|
| bf16 (original) | 55,71 GB | 8,074 | — | 2,641 | — |
| Referencia 4 bits uniforme (mlx-community) | 19,42 GB | 8,330 | +3,17 % | 2,742 | +3,83 % |
| Este modelo, 8/4 JANG | 19,23 GB | 8,217 | +1,77 % | 2,699 | +2,18 % |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El propio autor advierte que la perplejidad bruta en wikitext no es comparable entre familias de modelos porque Glimmer abre siempre un canal `<|message|>` antes de responder; la comparacion valida es la variacion frente al bf16 del mismo modelo.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 19,23 GB solo de pesos; con cache KV y overhead del runtime, el autor no publica cifras, pero un contexto corto requiere aproximadamente 20-22 GB (estimacion, no dato del autor).
- Plataforma: exclusivamente Apple Silicon mediante MLX. Estos pesos no se ejecutan en CUDA ni en CPU x86 con vLLM, llama.cpp o TGI.
- Cabe en consumer GPU equivalente: si, en Mac con memoria unificada de 24 GB de forma muy justa y con contexto limitado; recomendable 32 GB o mas (M-series Pro/Max/Ultra).
- Para CUDA hay que recurrir al checkpoint bf16 original (~55,71 GB) o a una cuantizacion GPTQ/GGUF estandar, no disponible en esta publicacion.
- Despliegue: `mlx-lm==0.32.2` (version upstream de Apple, no el fork de ipsupport-llc), `mlx_lm.generate` para CLI y `mlx_lm.server` para API compatible con OpenAI; la app LLMTray para macOS permite cargarlo de forma grafica.
- Requisito adicional: para convertir el checkpoint fue necesario parchear `muse_glimmer.py` en `mlx-lm` (la comprobacion `sanitize()` no detecta los pesos de vision anidados bajo `"model."`); el parche no esta upstreamed.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Calidad (PPL texto / codigo) | Tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| roman220220/Muse-Glimmer-30B-gptq-mlx-jang | 27,85 B | No disponible | 8,217 / 2,699 (+1,77 % / +2,18 % vs bf16) | 19,23 GB | Apache 2.0 | MLX, comunidad, 29 descargas |
| mlx-community/Muse-Glimmer-30B-4bit | ~30 B | No disponible | 8,330 / 2,742 (+3,17 % / +3,83 % vs bf16) | 19,42 GB | Apache 2.0 | MLX, build de referencia |
| meta-models/Muse-Glimmer-30B (bf16) | ~30 B | No disponible | 8,074 / 2,641 (referencia) | 55,71 GB | Apache 2.0 | Pesos originales, multimodal completo |

No se dispone de datos de otros modelos de la misma categoria (30 B densos, agenticos, ejecutables en un solo equipo) en la informacion proporcionada, por lo que no se incluye una comparacion cruzada con alternativas de otros fabricantes.

## Limitaciones y advertencias

- Solo texto: la torre de vision (~1,8 B, ViT-G/14) no esta incluida y no hay pesos que cuantizar en esta build; el modelo no procesa imagenes aunque el original sea multimodal.
- Requiere un `mlx-lm` parcheado para cargar y convertir el checkpoint; sin el parche, `mlx_lm.load()` y `mlx_lm.convert()` fallan por pesos de vision "inesperados". El parche no esta upstreamed y hay que aplicarlo manualmente sobre el paquete instalado.
- Dependencia de una version concreta: `mlx-lm==0.32.2`; el soporte de Muse Glimmer no esta en el fork `ipsupport-llc/mlx-lm`.
- Degradacion de calidad medible aunque pequena: +1,77 % de perplejidad en texto y +2,18 % en codigo frente al bf16, con 40 x 512 tokens de evaluacion; muestra reducida.
- La GPTQ aplicada usa la rejilla affine de MLX y no es transferible a formatos GGUF o imatrix, que aplican correcciones distintas.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; al ser un modelo de razonamiento que abre siempre un canal `<|message|>`, puede generar sobre-razonamiento y respuestas mas largas de lo necesario, con el coste de tokens asociado.
- Idiomas soportados no documentados: no hay garantia de calidad fuera de los idiomas cubiertos por el modelo base, cuyo detalle no se ha proporcionado.
- Longitud de contexto no disponible: impide dimensionar con precision la cache KV y el numero de turnos conversacionales soportados en produccion.
- Licencia Apache 2.0 en el modelo base y en esta cuantizacion: permite uso comercial, pero conviene verificar la model card del modelo original para condiciones de uso aceptable y atribucion.
- Es una publicacion comunitaria con 29 descargas y 0 likes: no es un build oficial de Meta ni de mlx-community; para produccion conviene validar los pesos y el proceso de conversion de forma independiente.
- Fecha de creacion del repositorio: 2026-10-17; el modelo base se publico el 2026-08-10 segun la model card.

## Enlaces

- HuggingFace (esta cuantizacion): https://huggingface.co/roman220220/Muse-Glimmer-30B-gptq-mlx-jang
- Modelo base: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Build de referencia 4 bits de mlx-community: https://huggingface.co/mlx-community/Muse-Glimmer-30B-4bit
- Documentacion de Meta (Muse Glimmer): https://dev.meta.ai/docs/muse-glimmer
- Pagina de modelo de Meta: https://dev.meta.ai/models/muse-glimmer
- Documentacion para desarrolladores: https://ai.developer.meta.com/docs/muse-glimmer
- NVIDIA NIM: https://build.nvidia.com/meta/muse-glimmer-30b
- Repositorio del pipeline de cuantizacion (`muse-glimmer-quant/`): https://github.com/rromenskyi/quant-ternary
- LLMTray (app macOS): https://www.ipsupport.us/llmtray/
- Releases de LLMTray: https://github.com/ipsupport-llc/llmtray/releases/latest/download/LLMTray-Full.dmg
- Repositorio LLMTray en GitHub: https://github.com/ipsupport-llc/llmtray
- Ficha de terceros: https://www.aimodels.fyi/models/huggingFace/muse-glimmer-30b-meta-models
