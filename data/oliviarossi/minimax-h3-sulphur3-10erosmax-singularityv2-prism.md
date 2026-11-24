# OliviaRossi/Minimax-H3-Sulphur3-10Erosmax-SingularityV2-Prism

## Resumen

Minimax-H3-Sulphur3-10Erosmax-SingularityV2-Prism es un modelo de difusion para generacion de video (text-to-video e image-to-video) publicado por OliviaRossi en Hugging Face. No se trata de un modelo entrenado desde cero, sino de una fusion (merge) de tres checkpoints derivados de MiniMax-H3, combinados mediante una tecnica propietaria denominada Tri-PRISM, que integra descenso espectral de ruido, interpolacion esferica Frechet hiperesferica de tres vias, mediacion de conflictos de signo y reanclaje de magnitud por filas. Sobre esa base se hornean secuencialmente tres LoRAs (DMAD, PDMD y un slider de realismo).

El resultado es un checkpoint para ComfyUI que hereda la arquitectura del modelo base MiniMax-H3, del cual no se detallan parametros ni longitud de contexto en la informacion disponible. El repositorio ocupa 61,4 GB y se distribuye en dos variantes de pesos: BF16 podado y INT8 ConvRot nativo de ComfyUI, esta ultima con 200 capas lineales cuantizadas y un error L2 relativo medio declarado del 0,936%.

Su relevancia es practica para el ecosistema ComfyUI: empaqueta en un unico archivo la combinacion de varios finetunes orientados a generacion de video con pocos pasos de inferencia (8 pasos Turbo, PDMD 4NFE) y un ajuste de realismo, evitando al usuario tener que encadenar merges y LoRAs manualmente. La licencia es la MiniMax H3 Community License, no estandar, lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusion para video basada en MiniMax-H3 (detalles de parametros no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (con proyecciones AdaLN rank-8 en FP32) e INT8 ConvRot (`int8_tensorwise`, `convrot_groupsize=256`) |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-community-license (hereda condiciones de los modelos y LoRAs de origen) |
| Formato de pesos | safetensors (dos ficheros: BF16 e INT8 ConvRot) |

## Arquitectura y entrenamiento

El modelo parte de MiniMax-H3 como arquitectura base de difusion para video. Sobre ella se aplica un merge de tres vias entre Sulphur-3, 10Eros-Max 8stepTurbo v1.0 hybrid y Minimax-h3_Singularity ref2va v2 bf16 (checkpoint completo de 66,28 GB plegado en una base AdaLN compartida de rango 8). La tecnica Tri-PRISM combina cuatro operaciones: descenso espectral de ruido, SLERP Frechet hiperesferico de tres vias, mediacion de conflictos de signo y reanclaje de magnitud por filas. El plegado de la curva AdaLN se realiza con rango exacto 8 y modo `canonical_t1`.

Posteriormente se hornean tres LoRAs de forma secuencial: DMAD (8 pasos, full critic, ComfyUI) con peso 0,85; PDMD 4NFE v6 con peso 0,333; y MMH3-RealismSlider-V1 con peso 1,5. No se especifican datos de entrenamiento propios (tokens, composicion del dataset ni fases de RLHF/DPO), ya que el autor no entrena el modelo sino que lo fusiona a partir de artefactos existentes. La innovacion principal es el pipeline de merge y la cuantizacion INT8 ConvRot nativa de ComfyUI, que reduce el error de cuantizacion a un 0,936% de L2 relativo medio en 200 capas lineales.

## Capacidades

- Generacion de video a partir de texto (text-to-video) mediante el pipeline de difusion de MiniMax-H3.
- Generacion de video a partir de imagen (image-to-video), indicado por el pipeline declarado y por la inclusion del checkpoint Singularity ref2va.
- Inferencia acelerada: incorpora LoRAs de destilacion para 8 pasos (DMAD, 10Eros-Max 8stepTurbo) y 4 pasos (PDMD 4NFE), lo que reduce el numero de pasos de muestreo.
- Control de estilo y realismo mediante el LoRA MMH3-RealismSlider-V1 horneado con peso 1,5.
- Compatibilidad nativa con ComfyUI a traves de `UNETLoader` (Load Diffusion Model) y soporte de INT8 ConvRot a partir de ComfyUI v0.27.0.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision general, audio ni multilingueismo; el modelo es exclusivamente generativo de video.

## Casos de uso

- Prototipado rapido de clips de video en ComfyUI: al cargar el fichero INT8 ConvRot en `ComfyUI/models/diffusion_models/` y usar `UNETLoader`, se obtiene un modelo listo para generar video en 4-8 pasos, adecuado para iterar ideas visuales sin montar un pipeline de merges manual.
- Generacion image-to-video para animar fotogramas fijos: gracias a la base Singularity ref2va, se puede partir de una imagen de referencia y producir una secuencia animada, util en previsualizacion de storyboards o animatica publicitaria.
- Creacion de contenido para redes sociales con estetica realista: el slider de realismo horneado a 1,5 permite generar tomas de aspecto fotografico sin ajustes adicionales de LoRA.
- Experimentacion en investigacion sobre tecnicas de merge: el repositorio incluye `merge_report.json` con telemetria por capa del merge Tri-PRISM y de la cuantizacion, lo que sirve para estudiar el impacto del plegado AdaLN rank-8 y del ConvRot INT8 en la calidad final.
- Despliegue en entornos con VRAM limitada: la variante INT8 ConvRot reduce el peso respecto a BF16 (el repo completo son 61,4 GB, pero el fichero INT8 es sustancialmente menor), lo que facilita ejecutarlo en GPUs de consumo alto en lugar de exigir aceleradores de datacenter.
- Evaluacion comparativa de destilaciones de pocos pasos: al integrar DMAD y PDMD 4NFE, permite medir en un mismo checkpoint la relacion entre pasos de muestreo y calidad perceptual frente al modelo base MiniMax-H3.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato cuantitativo de rendimiento es el error de cuantizacion de la variante INT8 ConvRot: error L2 relativo medio de 0,936% sobre 200 capas lineales cuantizadas.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. Como referencia, el checkpoint base Singularity citado ocupa 66,28 GB en BF16, por lo que la variante BF16 podada requerira probablemente mas de 24 GB de VRAM; la variante INT8 ConvRot reduce esa cifra pero el autor no publica el requisito exacto.
- GPUs recomendadas: no disponible. Por el tamano del repo (61,4 GB) y la naturaleza del modelo base, se orienta a GPUs de gama alta (A100 80 GB, H100) o a RTX 4090/5090 con cuantizacion INT8 y offloading.
- Cabe en GPU de consumo: probablemente solo en modelos con 24 GB o mas y usando la variante INT8 ConvRot; no confirmado por el autor.
- Opciones de despliegue: ComfyUI (unico soportado de forma nativa, version >= 0.27.0 para INT8 ConvRot). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que ademas no aplican a un modelo de difusion de video.
- Latencia y throughput: no disponibles. La presencia de LoRAs de 4 y 8 pasos sugiere inferencia rapida, pero no se aportan tiempos medidos.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Minimax-H3-Sulphur3-10Erosmax-SingularityV2-Prism | Merge de difusion video (MiniMax-H3) | no disponible | no disponible | minimax-h3-community-license | Hugging Face, ComfyUI |
| MiniMaxAI/MiniMax-H3 (base) | Difusion video | no disponible | no disponible | minimax-h3-community-license | Hugging Face |
| SulphurAI/Sulphur-3 | Finetune de MiniMax-H3 | no disponible | no disponible | no disponible | Hugging Face |
| TenStrip/10Eros-Max | Finetune turbo de MiniMax-H3 | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia no estandar: la MiniMax H3 Community License impone condiciones propias y ademas hereda las licencias de los modelos y LoRAs de origen (Sulphur-3, 10Eros-Max, Singularity, DMAD, PDMD, RealismSlider); es imprescindible revisarlas antes de cualquier uso comercial.
- Modelo de merge sin evaluacion publica: no hay benchmarks ni evaluaciones de calidad objetivas, por lo que su rendimiento real frente al base MiniMax-H3 es desconocido.
- Riesgo de artefactos por el merge: la combinacion de tres checkpoints con mediacion de conflictos de signo puede introducir degradaciones locales no documentadas; el autor no publica comparativas visuales.
- Cuantizacion INT8 con perdida: aunque el error L2 relativo medio es bajo (0,936%), se trata de una media y pueden existir capas con mayor desviacion.
- Dependencia estricta de ComfyUI >= 0.27.0 para la variante INT8 ConvRot; en versiones anteriores el fichero no cargara correctamente.
- Idiomas soportados no documentados; al ser un modelo de video, la relevancia linguistica se limita a los prompts de texto, cuyo idioma no se especifica.
- Sin informacion sobre sesgos, alucinacion visual o limitaciones de duracion/resolucion de los clips generados.
- Repositorio con 0 descargas y 1 like en el momento de la consulta: no hay validacion de la comunidad ni issues reportados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OliviaRossi/Minimax-H3-Sulphur3-10Erosmax-SingularityV2-Prism
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Sulphur-3: https://huggingface.co/SulphurAI/Sulphur-3
- 10Eros-Max: https://huggingface.co/TenStrip/10Eros-Max
- Singularity: https://huggingface.co/WarmBloodAban/Minimax-h3_Singularity
- LoRA DMAD: https://huggingface.co/ZhengmingYu/DMAD
- LoRA PDMD 4NFE: https://huggingface.co/Iwannapose/minimax_h3_pdmd_4nfe_comfyui
- ComfyUI: https://github.com/comfyanonymous/ComfyUI
