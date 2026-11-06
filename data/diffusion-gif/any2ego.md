# diffusion-gif/any2ego

## Resumen

Any2Ego es un paquete de pesos distribuido por el usuario diffusion-gif en Hugging Face bajo el identificador `diffusion-gif/any2ego`. No se trata de un modelo unico entrenado de cero, sino de un *bundle* de 46,1 GB que reune, por un lado, los pesos de varios modelos base de terceros (Wan2.1-VACE-1.3B con su transformer DiT, su text encoder umT5-XXL y su VAE; Qwen3-VL-8B-Instruct; y CLIP-ViT-H-14-laion2B-s32B-b79K) y, por otro, doce artefactos de entrenamiento propios (LoRAs y checkpoints) orientados a la tarea de conversion exo-to-ego en generacion de video.

El problema que aborda es la transformacion de video en tercera persona (exo) a video en primera persona (ego), un area de investigacion en vision por computador y generacion de video. El paquete incluye ramas de generacion condicionadas por captions (HOI, Global, Spatial), un predictor de mascaras (PhiSeg), adaptadores LoRA sobre Qwen3-VL-8B entrenados con SFT y GRPO, y pesos auxiliares de comparacion VLM, DPO y narracion nativa sobre el DiT.

Es relevante ahora porque expone de forma publica y verificable (con hashes SHA256 por tensor y manifiestos de reempaquetado) un conjunto de checkpoints de investigacion que de otro modo quedarian inaccesibles, y porque documenta explicitamente que no se ha producido ninguna fusion de LoRAs ni conversion a la arquitectura estandar de diffusers. El autor advierte que la validacion de integridad de los pesos no equivale a una reproduccion completa en GPU ni a la reproduccion de las metricas del paper.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline compuesto: DiT + VACE (Wan2.1-VACE-1.3B), text encoder umT5-XXL, VAE Wan, VLM Qwen3-VL-8B-Instruct con LoRAs, CLIP-ViT-H-14 como encoder visual auxiliar |
| Parametros totales | No disponible de forma agregada; el componente mayor es Qwen3-VL-8B-Instruct (8B) y Wan2.1-VACE-1.3B (1,3B en el transformer) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (los pesos se distribuyen en safetensors BF16 y formato original; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | No disponible de forma explicita; el text encoder es umT5-XXL y el VLM es Qwen3-VL-8B-Instruct, multilingues por diseno del modelo base |
| Licencia | No disponible como licencia unica; el autor indica que cada modelo base conserva su licencia original y que el bundle no puede declararse como modelo propio (ver `LICENSES/UPSTREAM.md`) |
| Formato de pesos | safetensors (shards de menos de 5 GB), `.pt` en algunos checkpoints de investigacion, `.pth` original del text encoder convertido a safetensors, VAE y tokenizer en formato original |

## Arquitectura y entrenamiento

El paquete no define una arquitectura nueva, sino que compone un pipeline de generacion de video condicionada. La columna vertebral es Wan2.1-VACE-1.3B: un transformer de difusion (DiT) con el modulo VACE, acompanado de un text encoder umT5-XXL en BF16 (3 shards) y el VAE de Wan. Sobre esa base se anaden ramas de generacion condicionadas por captions: `generator_hoi` (166,9 MiB, LoRA HOI, epoch 4), `generator_global` (630,4 MiB, rama de caption global, epoch 4) y `generator_spatial` (630,5 MiB, rama espacial, epoch 2, entrenada con captions de profesor). Se incluye ademas un `reward_preview` de 630,4 MiB para la rama global y un `mask_predictor` basado en PhiSeg (21,2 MiB, epoch 9) que requiere coincidir con los ajustes `--exo_full_context --bn_batch_stats`.

En la parte de comprension visual, el paquete incorpora Qwen3-VL-8B-Instruct con dos adaptadores LoRA de rango 16 y alpha 32: `sft_only` (83,3 MiB, step 4070) y `caption_grpo` (83,3 MiB, step 3800, entrenado con GRPO). Tambien incluye un `vlm_comparison` (720,4 MiB, epoch 0), un `caption_dpo` (630,4 MiB, ultimo checkpoint DPO disponible, sin garantia de ser el mejor), un `joint_branch` (1350,8 MiB, ultimo checkpoint conjunto normal) y un `native_narr_dit` (333,8 MiB, LoRA de narracion nativa sobre el DiT, epoch 4). El autor aclara que las ramas auxiliares no sustituyen a la rama principal y que el checkpoint `mask_predictor_paperalign_candidate` es solo un candidato no validado como mejor o final. No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni detalles de RLHF/DPO mas alla de la existencia de un checkpoint DPO y de un entrenamiento GRPO.

## Capacidades

- Generacion de video condicionada por texto y por captions estructurados (ramas HOI, Global y Spatial) sobre la base Wan2.1-VACE-1.3B.
- Conversion exo-to-ego: transformacion de video en tercera persona a primera persona, objetivo central del proyecto.
- Segmentacion y prediccion de mascaras mediante PhiSeg (`mask_predictor`), con ajustes especificos de contexto completo y estadisticas de batch normalization.
- Comprension visual y generacion de captions con Qwen3-VL-8B-Instruct, incluyendo un adaptador afinado con SFT y otro con GRPO.
- Alineacion de preferencias sobre captions mediante el checkpoint DPO incluido.
- Narracion nativa sobre el DiT mediante el LoRA `native_narr_dit`.
- Carga por shards compatible con lectores nativos de safetensors, con validacion de nombres, formas y dtypes en CPU.
- No se documentan en la informacion disponible capacidades de tool calling, function calling, agentes multi-paso ni modos de razonamiento explicito (thinking mode) para este bundle.

## Casos de uso

- Investigacion en generacion de video exo-to-ego: el paquete permite reproducir total o parcialmente el pipeline descrito en el paper asociado, cargando las ramas HOI, Global y Spatial sobre Wan2.1-VACE-1.3B para generar videos en primera persona a partir de grabaciones en tercera persona.
- Segmentacion de manos y objetos en video egocentrico: el `mask_predictor` basado en PhiSeg, con los ajustes `--exo_full_context --bn_batch_stats`, sirve para generar mascaras de segmentacion en escenas de interaccion mano-objeto.
- Generacion de captions detallados de video: el adaptador SFT sobre Qwen3-VL-8B-Instruct (`sft_only`, step 4070) permite producir descripciones textuales de clips de video que alimenten las ramas de generacion.
- Alineacion de captions con preferencias humanas: el checkpoint `caption_grpo` (step 3800) y el `caption_dpo` permiten experimentar con tecnicas de optimizacion por preferencias aplicadas a la generacion de descripciones de video.
- Comparacion de variantes de VLM: el checkpoint `vlm_comparison` (epoch 0) y el `joint_branch` (1350,8 MiB) permiten estudios comparativos entre ramas de comprension y de generacion conjunta en el mismo pipeline.
- Narracion automatica de video: el LoRA `native_narr_dit` (epoch 4) posibilita experimentar con la generacion de narraciones sobre el DiT sin depender exclusivamente del text encoder.
- Reempaquetado y auditoria de pesos: las herramientas `attach_model_bundle.py`, `verify_model_bundle.py` y los manifiestos `bundle_manifest.json`, `CHECKSUMS.sha256` y `reshard_manifest.json` permiten verificar integridad tensor a tensor y montar el bundle sobre un checkout del codigo fuente.
- Docencia y experimentacion con pipelines multimodales: al incluir base, VLM, encoder visual y LoRAs en un unico paquete verificable, sirve como material para estudiar la composicion de pipelines de video generativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que la validacion de integridad de los pesos no equivale a una reproduccion completa en GPU ni a la reproduccion de las metricas del paper.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia de orden de magnitud, el repositorio completo ocupa 46,1 GB en disco; el componente mayor (Qwen3-VL-8B-Instruct) en BF16 requiere aproximadamente 16 GB de VRAM solo para sus pesos, y el transformer Wan2.1-VACE-1.3B anade varios GB adicionales, por lo que la inferencia completa del pipeline no cabe en GPUs de consumo de gama media.
- GPU recomendadas: no documentadas por el autor. Por tamano de los componentes, un pipeline completo requeriria GPUs de centro de datos tipo A100 (40/80 GB) o H100; no se confirma compatibilidad con RTX 4090 (24 GB) para el pipeline completo.
- Cabe en consumer GPU: no confirmado. Los LoRAs individuales (entre 21 y 1350 MiB) si caben en cualquier GPU moderna, pero requieren el modelo base correspondiente cargado.
- Opciones de despliegue: el autor indica que no es una conversion estandar de diffusers y que no debe llamarse a `transformers.AutoModel.from_pretrained` sobre los subdirectorios de shards de Wan. El flujo previsto es usar el codigo de `https://github.com/coisini-gif/exo-ego-video-converter` (repositorio privado, requiere acceso) con los scripts `attach_model_bundle.py` y `verify_model_bundle.py`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Any2Ego (este bundle) | Compuesto (Wan2.1-VACE-1.3B + Qwen3-VL-8B + LoRAs) | No disponible | Exo-to-ego, generacion de video, captions | No disponible (licencias upstream por componente) | Publico en HF, requiere codigo privado para ejecutar |
| Wan2.1-VACE-1.3B | 1,3B (transformer) | No disponible | Generacion y edicion de video condicionada | Licencia upstream de Wan | Publico como modelo base independiente |
| Qwen3-VL-8B-Instruct | 8B | No disponible | Comprension visual y generacion de texto | Licencia upstream de Qwen | Publico como modelo base independiente |

No se dispone de datos de rendimiento comparativo entre estas opciones en la informacion proporcionada.

## Limitaciones y advertencias

- El paquete no es un modelo unico: los pesos base pertenecen a terceros y conservan sus licencias originales; el autor advierte que no puede declararse el bundle completo como modelo propio.
- No se han fusionado los LoRAs en los pesos base; los checkpoints se distribuyen como adaptadores separados.
- El codigo necesario para ejecutar inferencia y entrenamiento esta en un repositorio privado de GitHub que requiere permisos de acceso.
- No se incluyen datos de entrenamiento, captions, videos, estados de optimizador, RNG ni caches; solo se adjunta un indice de datos (`TRAINING_DATA_INDEX.json`) que apunta a snapshots y revisiones, sin garantizar la disponibilidad futura de los videos originales.
- El checkpoint `mask_predictor_paperalign_candidate` no esta validado como mejor ni final; el `caption_dpo` es el ultimo disponible pero no se afirma que sea el mejor.
- El `generator_spatial` se entreno con captions de profesor (epoch 2) y no debe presentarse como un reentrenamiento con GRPO.
- El `mask_predictor` (PhiSeg, epoch 9) exige coincidencia exacta con los ajustes `--exo_full_context --bn_batch_stats` y la configuracion de datos; en caso contrario los resultados no son validos.
- La validacion de integridad de los pesos no garantiza la reproduccion de metricas del paper ni un funcionamiento completo en GPU.
- No se documentan sesgos, tasas de alucinacion ni limitaciones de idioma especificas; al ser un pipeline de investigacion, no se recomienda su uso en produccion sin una evaluacion adicional.
- El autor advierte que los indices de Wan no pueden pasarse directamente a los loaders binarios antiguos; se requiere el parche de compatibilidad incluido.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/diffusion-gif/any2ego
- Codigo fuente (repositorio privado, requiere acceso): https://github.com/coisini-gif/exo-ego-video-converter
- Indice publico de datos de entrenamiento: https://huggingface.co/datasets/diffusion-gif/training-data-index
- Modelo base Wan2.1-VACE-1.3B: no disponible en la informacion proporcionada
- Modelo base Qwen3-VL-8B-Instruct: no disponible en la informacion proporcionada
- Modelo base CLIP-ViT-H-14-laion2B-s32B-b79K: no disponible en la informacion proporcionada
- Paper asociado: no disponible en la informacion proporcionada
