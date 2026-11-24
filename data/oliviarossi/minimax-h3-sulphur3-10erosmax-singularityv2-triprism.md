# OliviaRossi/Minimax-H3-Sulphur3-10Erosmax-SingularityV2-TriPrism

## Resumen

Minimax-H3-Sulphur3-10Erosmax-SingularityV2-TriPrism es un modelo de difusion para generacion de video (text-to-video e image-to-video) publicado por el usuario OliviaRossi en Hugging Face. No se trata de un modelo entrenado desde cero, sino de un merge de tres checkpoints derivados de MiniMax-H3 (Sulphur-3, 10Eros-Max 8stepTurbo y Singularity V2 ref2va) mediante una tecnica propietaria denominada Tri-PRISM, que combina denoising espectral, SLERP hiperesferico a tres bandas, mediacion de conflictos de signo y re-anclaje de magnitud por filas.

Sobre esa base se han horneado secuencialmente tres LoRAs (DMAD 8-step, PDMD 4-NFE y un slider de realismo) para acelerar la inferencia y ajustar el estilo fotografico. El resultado se distribuye en dos variantes: un checkpoint BF16 podado para ComfyUI con proyecciones AdaLN rank-8 en FP32, y una version INT8 ConvRot nativa de ComfyUI con 200 capas lineales cuantizadas y un error L2 relativo medio del 0,936%.

El modelo es relevante para la comunidad de generacion de video open source porque empaqueta en un unico archivo un pipeline de destilacion por pasos (4 a 8 pasos) que normalmente requiere cargar el modelo base mas varios LoRAs por separado. El repositorio ocupa 61,4 GB y esta pensado exclusivamente para el ecosistema ComfyUI, no para bibliotecas de inferencia generica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion para video derivado de MiniMax-H3 (transformer de difusion; detalles internos no disponibles) |
| Parametros totales | no disponible (el checkpoint Singularity V2 de origen ocupa 66,28 GB en BF16) |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible (modelo de video; ventana temporal no especificada) |
| Tipos de cuantizacion | BF16 (con proyecciones AdaLN rank-8 en FP32) e INT8 ConvRot (`int8_tensorwise`, `convrot_groupsize=256`) |
| Idiomas soportados | no disponible (el pipeline es text-to-video; idiomas de los prompts no especificados) |
| Licencia | minimax-h3-community-license (hereda ademas las licencias de los modelos y LoRAs de origen) |
| Formato de pesos | safetensors (dos archivos: BF16 e INT8 ConvRot) |

## Arquitectura y entrenamiento

El modelo es un merge de difusion, no un entrenamiento. La receta parte de tres checkpoints: `s3.safetensors` de Sulphur-3, `10Eros_Max_8stepTurbo_v1.0_hybrid.safetensors` de 10Eros-Max y `Minimax-h3_Singularity_ref2va_v2_bf16.safetensors` de Singularity (66,28 GB). Sobre ellos se aplica la tecnica Tri-PRISM: denoising espectral, SLERP hiperesferico a tres bandas, mediacion de conflictos de signo y re-anclaje de magnitud por filas. Adicionalmente, el checkpoint de Singularity se pliega en una base AdaLN compartida de rango 8 con ajuste de curva `canonical_t1`.

Posteriormente se hornean tres LoRAs de forma secuencial: `dmad_minimax_h3_8step_full_critic_comfyui` a escala 0,85, `minimax_h3_pdmd_4nfe_comfyui_v6` a escala 0,333 y `MMH3-RealismSlider-V1` a escala 1,5. El objetivo es combinar destilacion por pasos (4-8 pasos) con un ajuste de realismo fotografico. No se dispone de informacion sobre datos de entrenamiento, numero de tokens, composicion del dataset ni uso de RLHF/DPO, ya que el autor no los documenta y el modelo no se entrena desde cero.

## Capacidades

- Generacion de video a partir de texto (text-to-video).
- Generacion de video a partir de imagen (image-to-video), pipeline declarado en Hugging Face.
- Inferencia acelerada por destilacion: LoRAs DMAD 8-step y PDMD 4-NFE horneados, lo que permite generar en 4-8 pasos en lugar de decenas.
- Ajuste de realismo fotografico mediante el slider MMH3-RealismSlider-V1 a escala 1,5.
- Compatibilidad nativa con ComfyUI mediante `Load Diffusion Model` (`UNETLoader`).
- Soporte de cuantizacion INT8 ConvRot nativa en ComfyUI a partir de la version v0.27.0.
- No se documentan capacidades de tool calling, agentes, vision multimodal de entrada ni modo thinking; es un modelo puramente generativo de video.

## Casos de uso

- Generacion de clips cortos para prototipado creativo: con 4-8 pasos de inferencia y un checkpoint INT8 de ~61 GB, el modelo permite iterar rapidamente en ComfyUI sobre ideas de guion o storyboard sin depender de APIs cerradas.
- Image-to-video para animar stills de producto: a partir de una fotografia fija se puede generar una toma en movimiento, util para e-commerce o presentaciones donde se necesita un video breve sin rodaje.
- Previsualizacion de planos en produccion audiovisual: el merge incorpora un slider de realismo que permite ajustar el look entre estilizado y fotografico, lo que sirve para validar direccion de arte antes de rodar.
- Generacion de contenido para redes sociales: clips de pocos segundos con estetica realista a partir de prompts de texto, integrables en un flujo ComfyUI automatizado.
- Experimentacion en investigacion de merges: el repositorio incluye `merge_report.json` con telemetria por capa del merge Tri-PRISM y de la cuantizacion, lo que lo convierte en material de estudio para quienes investigan tecnicas de model merging y cuantizacion.
- Despliegue local en estaciones de trabajo con GPU de gran memoria: la variante INT8 ConvRot reduce el peso respecto al BF16 y esta pensada para inferencia nativa en ComfyUI, adecuada para estudios pequenos que quieren generar video sin infraestructura cloud.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato cuantitativo de rendimiento es el error de cuantizacion de la variante INT8 ConvRot: error L2 relativo medio de 0,936% sobre 200 capas lineales cuantizadas.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. Como referencia, el checkpoint Singularity V2 de origen ocupa 66,28 GB en BF16 y el repositorio completo pesa 61,4 GB, por lo que la variante BF16 requiere previsiblemente mas de 60 GB de VRAM o descarga parcial a RAM/VRAM.
- La variante INT8 ConvRot reduce el peso del archivo, pero no se especifica la VRAM exacta necesaria.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por tamano del checkpoint, quedan fuera del alcance de GPUs de consumo habituales (RTX 4090 con 24 GB) en BF16; se requeririan GPUs de datacenter tipo A100 80 GB o H100.
- Despliegue: exclusivamente ComfyUI (`UNETLoader` / `Load Diffusion Model`), version >= v0.27.0 para INT8 ConvRot nativo. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de difusion de video).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Minimax-H3-Sulphur3-10Erosmax-SingularityV2-TriPrism | no disponible (repo 61,4 GB) | no disponible | minimax-h3-community-license | Hugging Face, ComfyUI | Merge de 3 checkpoints + 3 LoRAs, 4-8 pasos |
| MiniMaxAI/MiniMax-H3 (base) | no disponible | no disponible | minimax-h3-community-license | Hugging Face | Modelo base oficial del que derivan todos los merges |
| SulphurAI/Sulphur-3 | no disponible | no disponible | no disponible | Hugging Face | Uno de los tres checkpoints fusionados |
| TenStrip/10Eros-Max | no disponible | no disponible | no disponible | Hugging Face | Checkpoint 8stepTurbo, uno de los fusionados |

No se dispone de datos de benchmarks ni de especificaciones detalladas de los modelos comparables en la informacion proporcionada, por lo que la comparativa se limita a procedencia y licencia.

## Limitaciones y advertencias

- Modelo de merge no entrenado: no hay garantia de coherencia entre las capacidades de los tres checkpoints fusionados; los artefactos visuales o temporales no estan documentados.
- Licencia restrictiva: hereda la MiniMax H3 Community License y las licencias de todos los modelos y LoRAs de origen; el uso comercial requiere revisar cada una de ellas.
- Dependencia total de ComfyUI: no hay soporte documentado para otras herramientas de inferencia, lo que limita su integracion en pipelines de produccion ajenos a ese ecosistema.
- Requisitos de hardware elevados: el checkpoint BF16 ronda los 60 GB, lo que excluye GPUs de consumo y encarece el despliegue.
- Sin datos de benchmarks, evaluacion cualitativa ni comparativas objetivas con el modelo base; el rendimiento real no esta verificado de forma independiente.
- Sin informacion sobre idiomas de los prompts, sesgos, tasa de alucinacion visual ni limitaciones de duracion o resolucion del video generado.
- Repositorio con 0 descargas y 6 likes en el momento de la consulta: ecosistema de validacion muy limitado.
- El autor no documenta el proceso de seleccion de escalas de los LoRAs ni la validacion del merge, solo la receta.

## Enlaces

- Hugging Face: https://huggingface.co/OliviaRossi/Minimax-H3-Sulphur3-10Erosmax-SingularityV2-TriPrism
- Modelo base oficial: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Sulphur-3: https://huggingface.co/SulphurAI/Sulphur-3
- 10Eros-Max: https://huggingface.co/TenStrip/10Eros-Max
- Singularity V2: https://huggingface.co/WarmBloodAban/Minimax-h3_Singularity
- LoRA DMAD: https://huggingface.co/ZhengmingYu/DMAD
- LoRA PDMD 4-NFE: https://huggingface.co/Iwannapose/minimax_h3_pdmd_4nfe_comfyui
- ComfyUI: https://github.com/comfyanonymous/ComfyUI
