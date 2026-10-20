# Ouinche/moss-image-qwen3.5-te-mlx-q8g64

## Resumen

`Ouinche/moss-image-qwen3.5-te-mlx-q8g64` es una conversion a formato MLX de Apple del codificador de texto Qwen 3.5 9B que acompana a MOSS-Image (`OpenMOSS-Team/MOSS-Image-SFT`). No es un modelo generativo de texto autonomo: es el componente de *feature extraction* que produce los embeddings de prompt consumidos por el DiT de 5B de MOSS-Image. El autor, Ouinche, lo publica como pieza del backend de DiffusionBear, un estudio de imagen por IA para macOS sobre Apple Silicon.

El problema que resuelve es de despliegue, no de capacidad: el checkpoint original en PyTorch y `bfloat16` ocupa unos 19 GB, lo que en un Mac de 16 GB de memoria unificada obliga a ejecutarlo en CPU (~61 s por prompt en un M1) porque el encoder, el DiT (~10 GB) y el VAE en `float32` no caben simultaneamente bajo el limite de memoria wired de Metal (~10,88 GB). Esta version aplica cuantizacion afina de 8 bits con `group_size=64` sobre las proyecciones MLP, las matrices de atencion completa y los embeddings, manteniendo en `bfloat16` todos los componentes recurrentes de Gated DeltaNet, y baja el pico de memoria a ~10 GB con ~17 s por prompt en GPU.

El modelo tiene 7.936.684.544 parametros (~7,94 B), hidden size 4096 y 32 capas con arquitectura hibrida de atencion lineal y atencion completa. La licencia es Apache 2.0 y los idiomas declarados son ingles, chino y frances. Su relevancia actual es concreta: demuestra que es posible mantener la fidelidad semantica de un encoder de difusion (coseno 0,9995 frente a la referencia BF16) mientras se reduce a la mitad el coste de memoria en hardware de consumo Apple.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido: atencion lineal Gated DeltaNet combinada con atencion completa (3 capas Gated DeltaNet por cada 1 capa de atencion completa, sobre 32 capas) |
| Parametros totales | 7.936.684.544 (~7,94 B) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; la pipeline de referencia trunca la entrada a 4096 tokens |
| Tipos de cuantizacion | 8 bits afina con `group_size=64` (q8-g64) sobre MLP, atencion completa y embeddings; componentes Gated DeltaNet (`in_proj_*`, `out_proj`, `conv1d`, `A_log`, `dt_bias`) y capas `RMSNorm` conservados en `bfloat16` |
| Idiomas soportados | en, zh, fr |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (fichero de 9,3 GB; repositorio de 10,0 GB) |

## Arquitectura y entrenamiento

El modelo es una conversion, no un entrenamiento nuevo: hereda los pesos del codificador de texto de `OpenMOSS-Team/MOSS-Image-SFT`, del que se han eliminado la torre `visual.*` (no utilizada para el acondicionamiento textual) y la cabeza MTP. La arquitectura subyacente es un transformer de 32 capas con hidden size 4096 y atencion hibrida: 24 capas de atencion lineal con regla delta (Gated DeltaNet) intercaladas con 8 capas de atencion completa, en patron de 3 a 1. Los pesos se mapean a la clase `TextModel` de `mlx-lm` y se cuantizan con `backend/moss_qwen35_mlx.py`.

La decision tecnica central es la cuantizacion selectiva. Las proyecciones que gobiernan la recurrencia de estado de la regla delta se mantienen en `bfloat16` porque, segun el autor, errores pequenos en las escalas de cuantizacion se acumulan a lo largo de las 24 capas lineales y corrompen la trayectoria del estado; cuantizar solo MLP, atencion completa y embeddings produce un fichero de 9,3 GB con fidelidad casi sin perdida. La variante de 4 bits (q4-g64) fue evaluada y descartada: la similitud coseno cayo a 0,964 de media y 0,642 en el peor caso, por debajo del umbral de calidad de 0,99 que se fija el autor. No se documentan en la informacion disponible datos sobre el corpus de entrenamiento original, numero de tokens, composicion del dataset ni etapas de RLHF o DPO del modelo base.

En el lado de la integracion, `backend/moss_engine.py` implementa un shim `_MlxTextEncoder` compatible con PyTorch que acepta los mismos argumentos de `transformers` (`input_ids`, `attention_mask`) que espera `pipeline_moss_image.py` y devuelve `last_hidden_state` como tensor `torch.bfloat16`. La tokenizacion, la plantilla de chat (con `enable_thinking=True`) y el truncado a 4096 tokens se comparten al 100 % con la ruta de referencia. Tras la codificacion, el modelo MLX se descarga y `mx.clear_cache()` libera el pool de buffers de Metal antes de materializar el DiT de 10 GB en MPS.

## Capacidades

- Extraccion de caracteristicas textuales: genera `last_hidden_state` de dimensionalidad 4096 para acondicionar modelos de difusion de imagen.
- Codificacion de prompts multimodales en la pipeline MOSS-Image, compatible con Classifier-Free Guidance (dos pasadas de forward).
- Multilingue en ingles, chino y frances, segun los metadatos del repositorio.
- Compatible con la plantilla de chat de Qwen con `enable_thinking=True`, heredada de la ruta de referencia.
- Ejecucion nativa en GPU de Apple Silicon mediante MLX, sin necesidad de CPU fallback en equipos de 16 GB.
- Fidelidad numerica alta frente a la referencia BF16: coseno medio 0,99946 y minimo 0,99337.
- No soporta generacion de texto libre, tool calling, function calling ni razonamiento multi-paso como tal: la cabeza de lenguaje y la cabeza MTP se han eliminado en la conversion, y el `pipeline_tag` declarado es `feature-extraction`.

## Casos de uso

- Generacion de imagenes local en macOS: el encoder produce las condicionales textuales del DiT de 5B de MOSS-Image dentro de DiffusionBear, permitiendo generar a 512x512 en cuatro pasos DMD en ~406 s en un M1 de 16 GB, frente a 463 s con la ruta PyTorch en CPU.
- Aplicacion creativa offline en portatiles Apple: al reducir el pico del encoder de ~19 GB a ~10 GB, un Mac de 16 GB de memoria unificada puede mantener encoder, DiT y VAE en el mismo flujo sin salir a CPU.
- Cache de embeddings de prompt: al bajar el tiempo de codificacion a ~4 s en caliente tras el warm-up, es viable precalcular y almacenar embeddings de un catalogo de prompts para reutilizarlos en iteraciones de estilo o barridos de semilla.
- Servicio de acondicionamiento textual en pipelines de imagen por lotes: el shim compatible con `transformers` permite sustituir el encoder original en `pipeline_moss_image.py` sin reescribir el codigo de orquestacion.
- Investigacion en cuantizacion selectiva: sirve como referencia reproducible de la estrategia de preservar en BF16 las proyecciones recurrentes de Gated DeltaNet mientras se cuantiza el resto, con metricas de coseno publicadas para 8 y 4 bits.
- Evaluacion comparativa de encoders de difusion: util para medir el impacto de la precision numerica del encoder en la calidad final de la imagen, manteniendo constante el resto de la pipeline.
- Extraccion de caracteristicas para recuperacion semantica o clustering de prompts en ingles, chino o frances, usando los embeddings de 4096 dimensiones como representacion densa.

## Benchmarks y rendimiento

Los unicos datos publicados son de eficiencia y fidelidad de la conversion, medidos en un Apple M1 de 16 GB de memoria unificada:

| Metrica | PyTorch BF16 en CPU (referencia) | MLX q8-g64 + GDN en BF16 |
|---|---|---|
| Codificacion de prompt (25 tokens) | ~61 s | ~17 s (~4 s en caliente) |
| Similitud coseno frente a referencia BF16 (media / minimo) | 1,0000 | 0,99946 / 0,99337 |
| Pico de memoria unificada del text encoder | ~19 GB | ~10 GB |
| Generacion completa DMD de 4 pasos (512x512) | 463 s | 406 s |

La variante q4-g64 se descarto con coseno 0,964 de media y 0,642 minimo.

No se han publicado resultados de benchmarks de capacidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, lo cual es coherente con que el modelo se distribuye unicamente como extractor de caracteristicas sin cabeza generativa. Los resultados de la busqueda web realizada no contienen informacion relevante sobre este modelo.

## Requisitos de hardware

- VRAM / memoria unificada estimada: ~10 GB en tiempo de forward con q8-g64 (frente a ~19 GB en BF16), sobre un fichero de pesos de 9,3 GB.
- Hardware objetivo: Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra). Requiere al menos 16 GB de memoria unificada; con 16 GB se opera cerca del limite de memoria wired de Metal (~10,88 GB), por lo que conviene liberar el encoder antes de cargar el DiT.
- GPU NVIDIA no soportadas por esta conversion: los pesos estan en formato MLX y dependen de `mlx-lm`; para CUDA habria que usar el checkpoint BF16 original o reconvertir.
- Cabe en GPU de consumo Apple: si, validado en un M1 de 16 GB. No hay datos publicados para Macs de 32 GB o superiores, donde el margen seria mayor.
- Opciones de despliegue: `mlx-lm` como runtime, DiffusionBear como aplicacion anfitriona, y descarga directa via `hf download Ouinche/moss-image-qwen3.5-te-mlx-q8g64 --local-dir ./qwen3_5-te-q8g64`. vLLM, TGI, llama.cpp y Ollama no son aplicables a este artefacto tal como se distribuye.
- Latencia y throughput: ~17 s por prompt de 25 tokens en frio y ~4 s tras warm-up en M1; con CFG activo se realizan dos pasadas de forward, lo que aproximadamente duplica el tiempo de codificacion por generacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision / formato | Memoria en inferencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Ouinche/moss-image-qwen3.5-te-mlx-q8g64 | ~7,94 B | no disponible (truncado a 4096 en pipeline) | 8 bits afina g64, safetensors MLX | ~10 GB | Apache 2.0 | HuggingFace, MLX |
| OpenMOSS-Team/MOSS-Image-SFT (encoder BF16 original) | ~7,94 B (encoder) | no disponible | BF16, PyTorch | ~19 GB | Apache 2.0 | HuggingFace, PyTorch/Diffusers |
| Variante q4-g64 del mismo encoder (descartada por el autor) | ~7,94 B | no disponible | 4 bits afina g64 | no disponible | Apache 2.0 | no publicada como artefacto independiente |

No se dispone en la informacion proporcionada de datos sobre otros encoders de texto cuantizados en MLX para pipelines de difusion (por ejemplo, alternativas basadas en T5 o en otros Qwen) que permitan una comparacion de rendimiento verificable. Cualquier comparacion con esos modelos quedaria fuera del alcance de esta ficha.

## Limitaciones y advertencias

- No es un modelo de proposito general: sin cabeza de lenguaje ni cabeza MTP, no genera texto, no razona de forma autonoma y no soporta tool calling. Su unico uso previsto es la extraccion de caracteristicas.
- Dependencia exclusiva de Apple Silicon y MLX: no hay pesos GGUF ni safetensors estandar de PyTorch en este repositorio, lo que bloquea su uso en CUDA, ROCm o CPU convencional sin reconversion.
- La cuantizacion de 4 bits no alcanza el umbral de calidad del autor (coseno minimo 0,642), por lo que no se debe asumir que exista un camino trivial a menor memoria con fidelidad aceptable.
- El coseno minimo de 0,99337 implica que en algunos prompts la desviacion respecto a BF16 es mayor que la media; en produccion conviene validar la calidad de imagen en el dominio concreto de uso.
- El truncado a 4096 tokens de la pipeline de referencia limita los prompts largos, aunque la longitud de contexto nativa del modelo no se documenta en la informacion disponible.
- Cobertura linguistica declarada limitada a ingles, chino y frances; no hay evaluacion publicada del comportamiento en castellano.
- Riesgo de sesgos y de alucinacion heredado del modelo base: no se documentan en la informacion disponible ni las caracteristicas del corpus de entrenamiento ni evaluaciones de sesgo, por lo que no pueden caracterizarse.
- La licencia Apache 2.0 del artefacto es permisiva para uso comercial, pero el autor no detalla en la model card condiciones adicionales derivadas del modelo base; conviene verificar la licencia de `OpenMOSS-Team/MOSS-Image-SFT` antes de un despliegue comercial.
- Proyecto con muy poca traccion en el momento de la publicacion (0 descargas, 1 like) y creado en octubre de 2026: no hay historial de mantenimiento ni issues que permitan juzgar su estabilidad a largo plazo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Ouinche/moss-image-qwen3.5-te-mlx-q8g64
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- Repositorio de DiffusionBear: https://github.com/Ouinche/DiffusionBear
- Ficheros citados en la model card (dentro del repositorio de DiffusionBear): `backend/moss_qwen35_mlx.py` (conversor selectivo a 8 bits) y `backend/moss_engine.py` (shim PyTorch-MLX)
- No se han encontrado en la busqueda web papers, blogs ni demos adicionales relevantes para este modelo.
