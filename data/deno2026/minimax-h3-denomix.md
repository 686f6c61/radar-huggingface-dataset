# Deno2026/MiniMax-H3-DenoMix

## Resumen

MiniMax-H3-DenoMix es un modelo de difusion para generacion de video condicionada por referencia (reference-to-video, R2V) derivado de MiniMax H3. Lo publica el usuario Deno2026 (DENO) y no es un modelo entrenado desde cero, sino un merge de pesos: parte de los pesos originales de MiniMax H3 R2V y fusiona en un unico archivo el fine-tune Singularity de WarmBloodAban junto con algunos pesos adicionales. El resultado se distribuye como un unico archivo safetensors en formato INT8 podado (ConvRot), pensado para sustituir directamente el modelo de difusion en flujos de trabajo de ComfyUI.

Su relevancia practica esta en el empaquetado: reduce el modelo a un solo archivo de aproximadamente 21 GB (20.967.647.432 bytes) en INT8 podado, lo que permite ejecutar generacion de video R2V en GPUs de consumo. El autor incluye flujos de trabajo que generan a 960x544 y escalan el latente x2 hasta 1920x1088, con un caso probado en una RTX 4060 Ti de 16 GB con 32 GB de RAM de sistema para un clip de 15 segundos a 24 fps.

No es un modelo de lenguaje: no genera texto ni razona. Es un componente de difusion para video que se integra en un pipeline donde el text encoder y los VAE se mantienen y solo se cambia el UNet de difusion. La licencia es la MiniMax H3 Community License Agreement, heredada de los pesos base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion para generacion de video (reference-to-video, R2V); pesos en formato INT8 podado (ConvRot) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 podado (ConvRot); un unico archivo |
| Idiomas soportados | no disponible |
| Licencia | MiniMax H3 Community License Agreement (license: other) |
| Formato de pesos | safetensors (diffusion-single-file), archivo `MiniMax-H3_DenoMix_ref2va_pruned_int8_v3.safetensors` |
| Tamano del archivo | 20.967.647.432 bytes (~21 GB) |
| SHA-256 | `6fc735bb1d2e9e44951106b3ec6a4c063df1535c567bc7d44aaff4c9052add52` |
| Modelos base | MiniMaxAI/MiniMax-H3 y WarmBloodAban/Minimax-h3_Singularity (merge) |
| Resoluciones de trabajo | 960x544 (generacion) y 1920x1088 (tras upscale x2 del latente) |
| Duracion de ejemplo | 15 segundos a 24 fps |

## Arquitectura y entrenamiento

El modelo es un merge de pesos, no un entrenamiento nuevo. Se construye sobre los pesos originales de MiniMax H3 en su variante reference-to-video, a los que se fusiona el fine-tune Singularity de WarmBloodAban (publicado bajo Apache-2.0) y algunos pesos adicionales, dando como resultado un unico archivo. La arquitectura subyacente es la de MiniMax H3, un modelo de difusion para video; la model card no detalla el numero de parametros, la composicion del dataset de entrenamiento ni si hubo etapas de RLHF o DPO, por lo que esos datos no estan disponibles.

La innovacion destacable es el empaquetado: pesos podados y cuantizados a INT8 en formato ConvRot, distribuidos como un solo safetensors que sustituye al modelo de difusion original en ComfyUI. El autor proporciona dos flujos de trabajo. El primero usa el Pika LoRA a 6 pasos, genera a 960x544, escala el latente x2 con el upscaler latente integrado de ComfyUI y remata el ultimo paso DMD por teselas con el nodo DENO Tiled Sampler a 1920x1088. El segundo genera a baja resolucion con el LoRA turbo de Alibaba (8 pasos), escala el latente x2 y refina con el LoRA turbo DMD y el refiner de NVIDIA (extraccion ligera de Kijai) en los dos ultimos pasos.

## Capacidades

- Generacion de video condicionada por referencia (reference-to-video): produce clips a partir de una referencia visual y una descripcion textual.
- Generacion image-text-to-video, segun el pipeline declarado en Hugging Face.
- Generacion a 960x544 con escalado posterior del latente x2 hasta 1920x1088.
- Generacion de clips de hasta 15 segundos a 24 fps en el flujo de ejemplo.
- Muestreo por teselas (tiled sampling) para resolver la ultima etapa DMD en resolucion alta con VRAM limitada.
- Compatibilidad con LoRAs de aceleracion (Pika LoRA a 6 pasos, LoRA turbo de Alibaba a 8 pasos, LoRA turbo DMD).
- Integracion en ComfyUI mediante el nodo UNETLoader, manteniendo el text encoder y los VAE del flujo original.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues de texto: es un componente de difusion de video.

## Casos de uso

- Generacion de video R2V en GPU de consumo: el flujo de 16 GB VRAM permite producir clips de 15 segundos a 24 fps en una RTX 4060 Ti 16 GB con 32 GB de RAM, usando el muestreador por teselas para la etapa final a 1920x1088.
- Prototipado rapido de anuncios y contenido para redes: generar a 960x544 con el Pika LoRA a 6 pasos y escalar el latente x2 reduce el coste por iteracion frente a generar directamente en alta resolucion.
- Integracion en pipelines de ComfyUI existentes: al ser un unico safetensors que sustituye al modelo de difusion en UNETLoader, se puede cambiar el modelo sin rehacer el grafo ni reinstalar el text encoder o los VAE.
- Previsualizacion de storyboards con referencia visual: la condicion R2V permite mantener la identidad de un sujeto o el estilo de una imagen de referencia a lo largo del clip.
- Refinado de video en dos etapas: el flujo turbo 8+2 combina una pasada rapida a baja resolucion con un refinado final mediante el refiner de NVIDIA, util para producir versiones de alta calidad solo cuando el borrador es valido.
- Despliegue en estaciones de trabajo con una sola GPU: el formato INT8 podado reduce el peso del modelo a ~21 GB, lo que encaja en entornos con 16 GB de VRAM apoyados en RAM de sistema y muestreo por teselas.
- Experimentacion con merges de la comunidad: sirve como base para probar combinaciones de LoRAs y fine-tunes sobre MiniMax H3 sin partir de los pesos completos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo aporta datos operativos del flujo de ejemplo: 960x544 de generacion, upscale x2 del latente a 1920x1088, clip de 15 segundos a 24 fps, probado en una RTX 4060 Ti de 16 GB con 32 GB de RAM de sistema.

## Requisitos de hardware

- VRAM estimada: el flujo de referencia funciona con 16 GB de VRAM; el archivo pesa ~21 GB, por lo que en GPUs de 16 GB se requiere descarga por teselas y RAM de sistema.
- RAM de sistema: 32 GB en la configuracion probada por el autor.
- GPU probada: RTX 4060 Ti 16 GB.
- GPU recomendadas: no disponibles en la informacion proporcionada; por tamano de VRAM, el flujo encaja en GPUs de 16 GB o mas, y con holgura en tarjetas de 24 GB o superiores.
- Cabe en GPU de consumo: si, segun el autor, en una RTX 4060 Ti de 16 GB con el flujo de muestreo por teselas.
- Opciones de despliegue: ComfyUI (v0.44.0 o superior) con soporte del formato MiniMax H3 pruned INT8 (ConvRot); nodos DENO Custom Nodes v0.7.126 o superior para el tiled sampler.
- Latencia y throughput: no disponibles; solo se indica la duracion del clip de ejemplo (15 s a 24 fps), no el tiempo de generacion.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| MiniMax-H3-DenoMix | Difusion video R2V (merge) | no disponible | no disponible | MiniMax H3 Community License | safetensors INT8 podado, ~21 GB | Hugging Face, 83.178 descargas |
| MiniMaxAI/MiniMax-H3 | Difusion video R2V (base) | no disponible | no disponible | MiniMax H3 Community License | no disponible | Hugging Face |
| WarmBloodAban/Minimax-h3_Singularity | Fine-tune de MiniMax H3 | no disponible | no disponible | Apache-2.0 | no disponible | Hugging Face |

La informacion disponible no incluye datos de rendimiento ni especificaciones completas de los modelos base, por lo que la comparativa se limita a origen, licencia y formato de distribucion.

## Limitaciones y advertencias

- Es un merge de pesos de la comunidad, no un modelo oficial de MiniMax; el comportamiento puede diferir del modelo base y del fine-tune Singularity por separado.
- La licencia MiniMax H3 Community License Agreement impone condiciones propias; hay que revisar el archivo LICENSE antes de cualquier uso comercial.
- El flujo de trabajo incluido esta bajo GPL-3.0-only, mientras que los modelos y nodos que carga conservan sus propias licencias.
- Requiere una version de ComfyUI que soporte el formato pruned INT8 (ConvRot); versiones anteriores no cargaran el archivo.
- El flujo de 16 GB depende del nodo DENO Tiled Sampler (DENO Custom Nodes v0.7.126 o superior); sin el, el flujo no se reproduce tal cual.
- No hay informacion sobre sesgos, idiomas soportados ni tasas de alucinacion visual; no se han publicado evaluaciones de calidad.
- El rendimiento real (tiempo por clip, estabilidad) no esta documentado mas alla del caso probado por el autor en una RTX 4060 Ti 16 GB.
- Al ser un modelo de difusion de video, no debe evaluarse con criterios de LLM (razonamiento, tool calling, contexto textual).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Deno2026/MiniMax-H3-DenoMix
- Modelo base MiniMax H3: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Fine-tune Singularity: https://huggingface.co/WarmBloodAban/Minimax-h3_Singularity
- Nodos personalizados DENO para ComfyUI: https://github.com/Deno2026/comfyui-deno-custom-nodes
- Flujo de trabajo 16 GB VRAM: workflows/Deno_MiniMax_H3_R2V_16GB_Tiled_Sampler.json (en el repositorio del modelo)
- Flujo de trabajo turbo 8+2: workflows/Deno_MiniMax_H3_R2V_Turbo_8plus2.json (en el repositorio del modelo)
- Licencia: LICENSE y NOTICE en el repositorio del modelo
