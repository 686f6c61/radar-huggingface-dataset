# gatilin/ovb-b-17500-best-full

## Resumen

ovb-b-17500-best-full es un pipeline completo de difusion para generacion y edicion de imagenes, exportado por el usuario gatilin a partir de un fine-tuning sobre Qwen-Image-2.1. No se trata de un adaptador LoRA, sino de un pipeline `QwenImage21Pipeline` autocontenido en el que se han fusionado de forma exacta los pesos de un adaptador PEFT (rango 64, alpha 64, rsLoRA) sobre el transformer base, mediante `merge_and_unload(safe_merge=True)` sobre 224 modulos. El resultado es un transformer en bfloat16 de 7.115.124.736 parametros (unos 7,1 mil millones) que ya incorpora la contribucion del adaptador y que no requiere descargar el modelo base ni el adaptador en tiempo de carga.

El modelo esta orientado a tareas de vision condicionadas por instruccion: dada una imagen RGB y una instruccion de tarea, devuelve una visualizacion (mapa de profundidad con paleta fija, segmentacion semantica, de instancia o referida, o generacion de imagen). Hereda la arquitectura y el pipeline de Qwen-Image-2.1, con encoder de texto congelado, VAE, procesador/tokenizer y scheduler copiados byte a byte del pipeline base en la revision fijada.

Su relevancia es acotada pero concreta: es un punto de partida reproducible para quien quiera partir de un transformer completo ya fusionado (por ejemplo, para reentrenar o para inicializar un pipeline sin gestionar adaptadores), con metadatos de fusion verificables (hashes SHA-256 por fichero, comprobacion de formulas de merge y carga offline de componentes). Conviene subrayar que el autor no revalido el comportamiento en benchmarks del export fusionado y que la inferencia de imagen completa figura como no verificada en los metadatos de validacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (Qwen-Image-2.1, `QwenImage21Transformer2DModel`) dentro de `QwenImage21Pipeline` |
| Parametros totales | 7.115.124.736 (transformer fusionado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos almacenados en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | qwen-research (etiquetada como `other` en Hugging Face, con `license_name: qwen-research`); uso solo de investigacion y evaluacion, no comercial |
| Formato de pesos | safetensors (libreria diffusers) |

## Arquitectura y entrenamiento

El modelo es un transformer de difusion para image-to-image, instanciado como `QwenImage21Transformer2DModel` y empaquetado en el pipeline `QwenImage21Pipeline` de diffusers. El export contiene el transformer fusionado en bfloat16, el encoder de texto congelado, el VAE, el procesador/tokenizer y el scheduler. El condicionamiento por tarea sigue el contrato del proyecto open-vision-banana: la entrada es una imagen RGB mas una instruccion de tarea, y la salida es una visualizacion (profundidad con mapa de color fijo, segmentacion semantica/de instancia/referida, o generacion).

El entrenamiento subyacente corresponde al adaptador `khazic/ovb-i108-b-lr1e-5-r64-2x8-s42_20261109r3` (checkpoint 17500, subcarpeta `ckpt/checkpoint-17500_best/lora_adapter`), con LoRA de rango 64 y alpha 64 en modalidad rsLoRA, aplicado sobre los modulos `img_mlp.gate_layer`, `to_q`, `to_k`, `img_mlp.out`, `to_out.0`, `to_v` y `img_mlp.proj`. La fusion se realizo con PEFT `merge_and_unload(safe_merge=True)` sobre 224 modulos, con toolchain torch 2.6.0+cu124, diffusers 0.41.0, transformers 5.19.0 y peft 0.21.2. No se aportan datos sobre volumen de tokens, composicion del dataset ni uso de RLHF/DPO. El export no anade pasos de optimizacion ni entrenamiento nuevo: solo pliega pesos publicados en su base publicada.

## Capacidades

- Generacion de imagenes condicionada por instruccion dentro del pipeline Qwen-Image-2.1.
- Edicion image-to-image: transformacion de una imagen de entrada guiada por una instruccion de tarea.
- Estimacion de profundidad monocular con mapa de color fijo.
- Segmentacion semantica, de instancia y referida (open-vocabulary segmentation).
- Condicionamiento multimodal texto + imagen en una sola pasada del pipeline.
- Reutilizacion como inicializacion de un transformer completo (`QwenImage21Transformer2DModel.from_pretrained` con `requires_grad_(True)`) para reentrenamiento.
- Carga autocontenida sin descarga del modelo base ni del adaptador en tiempo de ejecucion.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.

## Casos de uso

- Generacion de mapas de profundidad para pipelines de vision 3D: el modelo recibe una imagen RGB y una instruccion de profundidad y devuelve una visualizacion con paleta fija, util como etapa previa en reconstruccion o renderizado.
- Segmentacion open-vocabulary en anotacion de datasets: se le pasa una imagen y una instruccion de segmentacion referida para generar mascaras que aceleren el etiquetado manual en proyectos de investigacion.
- Segmentacion semantica y de instancia para preprocesado de datos de entrenamiento: genera mascaras visuales que pueden servir como pseudoetiquetas en fases de curacion de datasets.
- Edicion de imagen guiada por instruccion en prototipos de investigacion: modificacion de una imagen de entrada segun una instruccion textual, aprovechando el pipeline image-to-image completo.
- Inicializacion de reentrenamiento: al ser un transformer fusionado y autocontenido, sirve como punto de partida nuevo (sin estado de optimizador) para fine-tunings posteriores sin arrastrar la gestion de adaptadores.
- Reproducibilidad de experimentos de fusion LoRA: el export incluye hashes SHA-256 por fichero, comprobacion de formulas de merge y metadatos en `merge_metadata.json`, lo que permite auditar el proceso de fusion en entornos de investigacion.
- Evaluacion comparativa de tecnicas de merge: al estar el adaptador plegado de forma exacta sobre la base, permite estudiar el efecto del merge frente al uso del adaptador por separado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que el comportamiento en benchmarks de este export fusionado no se volvio a medir y que la inferencia de imagen completa figura como no verificada (`image_inference: false`, `offline_full_pipeline_loading: false`).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 7,1 mil millones de parametros en bfloat16, los pesos del transformer ocupan aproximadamente 14,2 GB, a los que hay que sumar el encoder de texto, el VAE y las activaciones.
- GPU recomendadas: no disponibles en la informacion proporcionada; por tamano, se requeririan GPU con al menos 24 GB de VRAM para una carga completa en bf16, o el uso de `enable_model_cpu_offload()` como muestra el autor.
- Compatibilidad con GPU de consumo: no confirmada; el pipeline incluye `enable_model_cpu_offload()` en el ejemplo de uso, lo que sugiere despliegue en hardware limitado con descarga parcial a CPU.
- Opciones de despliegue: diffusers (`QwenImage21Pipeline.from_pretrained`), con soporte de carga del transformer por separado (`QwenImage21Transformer2DModel`). No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gatilin/ovb-b-17500-best-full | 7.115.124.736 | no disponible | image-to-image, profundidad, segmentacion | qwen-research (no comercial) | Hugging Face, diffusers |
| Melo111/Fusion-C1-KQ0r128-60-40 (modelo base) | no disponible | no disponible | image-to-image | no disponible | Hugging Face |
| khazic/ovb-i108-b-lr1e-5-r64-2x8-s42_20261109r3 (adaptador LoRA) | no disponible (adaptador) | no disponible | image-to-image | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia qwen-research: uso exclusivamente de investigacion y evaluacion, prohibido el uso comercial.
- El autor advierte que no se debe aplicar de nuevo el adaptador padre sobre este modelo, ya que sus pesos ya estan fusionados.
- No es un checkpoint de estado de entrenamiento: carece de estado de optimizador, scheduler y RNG, por lo que no permite reanudar exactamente el entrenamiento original.
- La validacion cubre hashes, carga exacta del adaptador y formulas de merge, pero no la construccion completa del pipeline offline ni la inferencia de imagen; los resultados deben considerarse no validados hasta reproducir un forward pass.
- Riesgo de alucinacion visual y de artefactos en la generacion: no se documentan evaluaciones de fidelidad.
- Sesgos conocidos: no disponibles.
- Limitaciones de contexto o idioma: no disponibles; no se especifican idiomas soportados.
- El modelo tiene solo 17 descargas y 0 likes en el momento de la consulta, lo que implica escasa validacion por parte de la comunidad.
- El repositorio ocupa 33,1 GB, lo que condiciona el almacenamiento y el ancho de banda necesarios para su despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gatilin/ovb-b-17500-best-full
- Modelo base: https://huggingface.co/Melo111/Fusion-C1-KQ0r128-60-40
- Adaptador de origen: https://huggingface.co/khazic/ovb-i108-b-lr1e-5-r64-2x8-s42_20261109r3
- Repositorio del proyecto: https://github.com/isLinXu/open-vision-banana
- Script de fusion: https://github.com/isLinXu/open-vision-banana/blob/main/scripts/merge_qwen_image21_lora.py
- Metadatos de fusion: https://huggingface.co/gatilin/ovb-b-17500-best-full/blob/main/merge_metadata.json
- Licencia: https://huggingface.co/gatilin/ovb-b-17500-best-full/blob/main/LICENSE
- Aviso legal: https://huggingface.co/gatilin/ovb-b-17500-best-full/blob/main/NOTICE.txt
