# pushkarmoi/Kwen-Image-2.1-Turbo-INT8

## Resumen

Kwen-Image-2.1-Turbo-INT8 es una cuantizacion no oficial del modelo de difusion texto-a-imagen Qwen-Image 2.1 Turbo, publicada por el usuario pushkarmoi. El modelo original lo desarrolla Qwen (Alibaba) y esta disenado para generar imagenes a partir de descripciones textuales en tan solo 8 pasos de muestreo, lo que lo situa en la categoria de modelos de difusion "turbo" orientados a baja latencia. Esta version concreta reduce el transformer a precision INT8 en sus capas lineales manteniendo las activaciones en FP16 (esquema W8A16), con el objetivo de disminuir el peso en memoria y acelerar la inferencia sin reentrenar el modelo.

La relevancia de esta ficha radica en que ejemplifica el patron habitual de cuantizacion post-entrenamiento aplicada a modelos de difusion de gran tamano: se conservan las claves y la estructura de diffusers, se cuantizan solo las 224 capas lineales de los 32 bloques del transformer y se dejan en FP16 el resto de tensores (embeddings, modulaciones, normas y proyecciones de entrada/salida). El text encoder es Qwen3-VL-8B-Instruct en su release oficial FP8, sin la torre visual ni la cabeza de lenguaje, ya que Qwen-Image lee los estados ocultos de la ultima capa del decodificador.

El repositorio ocupa 16,1 GB y esta etiquetado con licencia Qwen Research, lo que restringe su uso a investigacion y evaluacion, no comercial. No cuenta con descargas ni likes en el momento de la consulta y fue creado el 31 de octubre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion (transformer de 32 bloques) para texto-a-imagen, con text encoder Qwen3-VL-8B-Instruct y VAE |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Transformer en INT8 W8A16 (pesos int8 simetricos por canal de salida, activaciones FP16); text encoder en FP8 e4m3 con escalas de bloque 128x128; VAE en FP16 |
| Idiomas soportados | no disponible |
| Licencia | Qwen Research License (solo investigacion y evaluacion, no comercial); text encoder Apache-2.0 |
| Formato de pesos | safetensors (diffusers) |

## Arquitectura y entrenamiento

El modelo base es un pipeline de difusion texto-a-imagen con un transformer de 32 bloques que contiene capas de atencion (`attn.to_q`, `attn.to_k`, `attn.to_v`, `attn.to_out.0`) y un MLP de imagen (`img_mlp.proj`, `img_mlp.gate_layer`, `img_mlp.out`), sumando 224 capas lineales cuantizadas. El text encoder es Qwen3-VL-8B-Instruct, del que se conservan los tensores del decodificador sin la torre visual ni `lm_head`, ya que el pipeline consume los estados ocultos de la ultima capa antes de la norma final. El VAE proviene de Qwen-Image 2.1 en F32 y se convierte a FP16, eliminando las capas temporales `time_conv` que no se ejecutan en generacion de imagen unica.

La cuantizacion del transformer se realizo fusionando los dos shards bf16 en un unico archivo, sin cambiar las claves, y aplicando cuantizacion simetrica int8 en el rango [-127, 127] con una escala FP16 por canal de salida (escala = absmax / 127, redondeada a FP16 antes de cuantizar los pesos), redondeo al mas cercano y sin calibracion, usando las utilidades `choose_qparams_affine` y `quantize_affine` de torchao. La deconvolucion se realiza como `W = weight * weight_scale[:, None]`. Los tensores `img_in`, `txt_in` (con su norma), el embedder de timesteps, la modulacion compartida, `norm_out`, `proj_out` y las escalas de QK-norm se convierten a FP16. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generacion de imagenes a partir de prompts de texto en 8 pasos de muestreo (modelo turbo).
- Inferencia con pesos del transformer cuantizados a INT8, lo que reduce el uso de memoria frente al modelo original en bf16.
- Compatibilidad con la libreria diffusers y con las claves originales de diffusers/transformers.
- Text encoder basado en Qwen3-VL-8B-Instruct, lo que aporta comprension semantica de prompts complejos.
- No se documentan capacidades de tool calling, agentes, vision de entrada, audio ni modo thinking en la informacion disponible.

## Casos de uso

- Prototipado rapido de generacion de imagenes: al requerir solo 8 pasos de muestreo y ocupar menos memoria por la cuantizacion INT8, permite iterar sobre prompts en entornos de investigacion con GPUs de gama alta pero con VRAM limitada.
- Evaluacion comparativa de cuantizacion: util para medir la perdida de calidad visual entre el modelo original en bf16 y la version W8A16 en tareas de investigacion sobre compresion de modelos de difusion.
- Generacion de assets para experimentos academicos: creacion de imagenes sinteticas para datasets de investigacion, siempre dentro del marco de la licencia Qwen Research.
- Pruebas de pipelines diffusers: al conservar las claves originales, sirve para validar integraciones con diffusers sin modificar el codigo de carga.
- Investigacion sobre latencia en modelos turbo: permite estudiar el impacto del esquema W8A16 en el tiempo por paso frente a alternativas como FP8 o bf16.
- Demostraciones y benchmarks internos de inferencia: util para comparar throughput y calidad en entornos controlados de evaluacion, no para despliegues comerciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 16,1 GB; el transformer cuantizado a INT8 reduce su huella respecto a bf16, pero el text encoder FP8 (Qwen3-VL-8B) y el VAE FP16 anaden consumo. Se estima un minimo practico en torno a 16-24 GB de VRAM, aunque no se proporciona una cifra oficial.
- GPU recomendadas: no disponible de forma explicita; por tamano, GPUs con 24 GB o mas (RTX 4090, A100 40 GB, H100) son candidatas razonables.
- Compatibilidad con GPU de consumo: probable en RTX 4090 (24 GB) segun el tamano del repo, pero no confirmado en la informacion.
- Opciones de despliegue: diffusers (libreria declarada); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kwen-Image-2.1-Turbo-INT8 | no disponible | no disponible | INT8 W8A16 + FP8 text encoder | Qwen Research (no comercial) | Hugging Face (0 descargas) |
| Qwen-Image-2.1-Turbo (base) | no disponible | no disponible | bf16 | Qwen Research | Hugging Face (oficial) |
| Qwen-Image-2.1 | no disponible | no disponible | F32/bf16 | Qwen Research | Hugging Face (oficial) |

No se dispone de datos de rendimiento ni de otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo no oficial: no esta afiliado a Qwen ni a Alibaba; la cuantizacion la realiza un tercero y no ha sido validada por el equipo original.
- Licencia Qwen Research: uso restringido a investigacion y evaluacion; prohibido el uso comercial del transformer, VAE y tokenizer.
- La cuantizacion INT8 sin calibracion puede introducir degradacion en la calidad visual frente al modelo en bf16; no se aportan metricas que lo cuantifiquen.
- Riesgo de alucinacion visual y de artefactos propios de modelos de difusion, no evaluado en la model card.
- Sesgos: no se documentan sesgos conocidos, pero el modelo hereda los del dataset de entrenamiento del base, no disponible.
- Idiomas soportados: no disponible; el comportamiento multilingue de los prompts no esta documentado.
- El `config.json` del text encoder sigue describiendo la torre visual aunque esta se ha eliminado, lo que puede confundir a herramientas de carga automatica.
- Sin descargas ni validacion de la comunidad en el momento de la consulta; no hay evidencia de pruebas de produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/pushkarmoi/Kwen-Image-2.1-Turbo-INT8
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1-Turbo
- Modelo Qwen-Image-2.1: https://huggingface.co/Qwen/Qwen-Image-2.1
- Text encoder: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct-FP8
- Shard 1 del transformer original: https://huggingface.co/Qwen/Qwen-Image-2.1-Turbo/blob/fc13ba1986fcb905854dc8de2f52eee395f49b5b/transformer/diffusion_pytorch_model-00001-of-00002.safetensors
- Shard 2 del transformer original: https://huggingface.co/Qwen/Qwen-Image-2.1-Turbo/blob/fc13ba1986fcb905854dc8de2f52eee395f49b5b/transformer/diffusion_pytorch_model-00002-of-00002.safetensors
- VAE original: https://huggingface.co/Qwen/Qwen-Image-2.1/blob/d26bb61231c349cf6b7896fa83353113880e1ba3/vae/diffusion_pytorch_model.safetensors
- Text encoder FP8 (commit): https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct-FP8/tree/9cdc6310a8cb770ce18efaf4e9935334512aee45
