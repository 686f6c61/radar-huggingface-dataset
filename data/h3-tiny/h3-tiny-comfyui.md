# H3-Tiny/H3-Tiny-ComfyUI

## Resumen

H3-Tiny es un proyecto de poda estructurada (structured pruning) sobre MiniMax H3, un modelo de generacion conjunta de video y audio. El repositorio H3-Tiny-ComfyUI empaqueta los pesos ya podados en checkpoints de fichero unico con el layout de claves nativo de ComfyUI, de modo que el modelo puede cargarse sin nodos personalizados. Lo desarrolla el autor independiente H3-Tiny (repositorio en github.com/fuyi25/H3-Tiny) y no tiene vinculo con MiniMax ni con Comfy Org.

El problema que resuelve es el coste de inferencia del modelo base: MiniMax H3 original tiene 33B parametros, mientras que estas variantes podadas reducen el modelo a 17,05B o 13,98B parametros manteniendo la generacion conjunta de video y audio. El repositorio incluye tres checkpoints en bf16 (dos de 17B y uno de 14B) que cubren los flujos Ref2VA (referencia a video+audio), FL2VA (primer/ultimo fotograma a video+audio) y T2VA (texto a video+audio).

Es relevante ahora porque permite ejecutar generacion de video con audio en ComfyUI sobre una sola GPU de gama alta (H200 en las pruebas del autor), a 1344x768 y 243 fotogramas con 50 pasos de muestreo, sin necesidad de LoRAs turbo ni de nodos externos. El repositorio ocupa 96,6 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion para generacion conjunta de video y audio (derivado de MiniMax H3, con poda estructurada de profundidad y anchura FFN) |
| Parametros totales | 17,05B (checkpoints 17B) / 13,98B (checkpoint 14B OKD) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (unico formato publicado en este repositorio) |
| Idiomas soportados | no disponible |
| Licencia | MiniMax H3 Community License Agreement (license: other) |
| Formato de pesos | safetensors (checkpoints de fichero unico con layout de claves de ComfyUI) |

## Arquitectura y entrenamiento

Los checkpoints son derivados podados de MiniMax H3, un modelo de difusion que genera video y audio de forma conjunta. La poda es estructurada: afecta a la profundidad del transformer y a la anchura de las capas FFN, y ComfyUI lee esos valores directamente de los tensores, por lo que no hace falta un nodo personalizado. El repositorio no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO; esa informacion no esta disponible en el material proporcionado.

La innovacion tecnica destacable esta en la conversion: el script `scripts/convert_comfyui.py` reescribe la modulacion AdaLN en la forma de curva que usa ComfyUI (`adaln_t_table`), con un error relativo de aproximadamente 1e-10 frente al AdaLN de diffusers. Los pesos son identicos a los checkpoints de diffusers, solo cambia el layout de claves. El autor indica que el checkpoint de pocos pasos (`H3-Tiny-17B-FewStep-Ref2VA-v0.1`) no se incluye porque el modelo MiniMax H3 de ComfyUI no expone entrada para su rama de tiempo de intervalo.

## Capacidades

- Generacion de video a partir de texto (T2VA), con audio generado de forma conjunta.
- Generacion de video a partir de primer y ultimo fotograma (FL2VA), con audio.
- Generacion de video a partir de una imagen de referencia (Ref2VA), con audio.
- Salida conjunta de pista de video y pista de audio, con VAEs separados para cada modalidad.
- Integracion nativa con los flujos de trabajo MiniMax H3 de ComfyUI (Image to Video y Reference to Video).
- Muestreo sin CFG mediante `BasicGuider`, con scheduler `simple` y 50 pasos (probado con `euler`).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni soporte multilingue explicito.

## Casos de uso

- Prototipado de video generativo en ComfyUI: cargar el checkpoint en `Load Diffusion Model` y usar los flujos nativos de MiniMax H3 permite iterar sobre prompts de texto a video sin escribir codigo de inferencia.
- Animacion de fotogramas clave: el checkpoint `fl2va` permite interpolar entre un primer y un ultimo fotograma definidos por el artista, util para storyboards y previsionado de planos.
- Generacion con referencia visual: el checkpoint `ref2va` mantiene la identidad de un sujeto u objeto de referencia a lo largo del clip, adecuado para contenido de marca o personajes recurrentes.
- Video con audio sincronizado: al generar ambas modalidades de forma conjunta, sirve para bocetos de spots, clips musicales cortos o contenido para redes donde el audio forma parte del resultado.
- Investigacion sobre poda de modelos de difusion: los checkpoints permiten comparar calidad frente al MiniMax H3 de 33B y medir el impacto de la reduccion a 17B y 14B en el mismo pipeline.
- Despliegue en una sola GPU de centro de datos: con 34,2 GB por checkpoint en bf16, cabe en una H200 o A100 de 80 GB junto con el text encoder y los VAEs, lo que facilita entornos de demo internos.
- Evaluacion de flujos de ComfyUI: util para validar plantillas de Image to Video y Reference to Video antes de migrar a los pesos completos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo reporta una validacion cualitativa: a 1344x768 y 243 fotogramas en una H200, las salidas coinciden con su pipeline de diffusers, sobre el commit `afcb984` de ComfyUI (2026-11-21).

## Requisitos de hardware

- VRAM estimada: 34,2 GB por checkpoint de 17B en bf16 y 28,1 GB para el de 14B, solo para los pesos del modelo de difusion; hay que sumar el text encoder Qwen3-VL 32B y los dos VAEs.
- GPU recomendadas: H200 (configuracion usada por el autor), A100/H100 de 80 GB para margen comodo con text encoder y VAEs.
- GPU de consumo: no cabe en una RTX 4090 de 24 GB en bf16 con el text encoder completo; requeriria cuantizacion o descarga del text encoder a CPU, no documentada en este repositorio.
- Despliegue: ComfyUI con soporte nativo de MiniMax H3 (commit `afcb984` o posterior), sin nodos personalizados. No se documentan opciones para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles; solo se indica la configuracion de 50 pasos, scheduler `simple`, `euler` y guider sin CFG.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| H3-Tiny 17B (este repo) | 17,05B | no disponible | Video + audio | MiniMax H3 Community License | Hugging Face, ComfyUI |
| H3-Tiny 14B OKD | 13,98B | no disponible | Video + audio | MiniMax H3 Community License | Hugging Face, ComfyUI |
| MiniMax H3 (base) | 33B | no disponible | Video + audio | MiniMax H3 Community License | Hugging Face, ComfyUI |

No se dispone de datos de rendimiento comparativo entre estas variantes ni frente a otros modelos de generacion de video en la informacion proporcionada.

## Limitaciones y advertencias

- La licencia MiniMax H3 Community License impone su propio ambito territorial y politica de uso aceptable; es obligatorio revisar `LICENSE-MiniMax-H3` y `NOTICE` antes de cualquier uso comercial.
- Los pesos son derivados de MiniMax H3; el proyecto H3-Tiny es independiente y no esta respaldado por MiniMax ni por Comfy Org.
- La poda reduce parametros de 33B a 17B o 14B; no se publican metricas de degradacion de calidad frente al modelo base.
- Los LoRAs turbo de Comfy-Org se entrenaron sobre el modelo de 33B y no estan probados con H3-Tiny; el autor recomienda muestrear sin ellos.
- El checkpoint de pocos pasos no es compatible con el modelo MiniMax H3 de ComfyUI por falta de entrada para la rama de tiempo de intervalo.
- Solo se publican pesos en bf16; no hay versiones cuantizadas oficiales, lo que limita el despliegue en GPU de consumo.
- No hay informacion sobre sesgos, riesgo de alucinacion, cobertura idiomatica ni evaluaciones de seguridad.
- El repositorio no registra descargas ni likes, y el proyecto es reciente (creado el 2026-11-21); la madurez y el soporte comunitario son limitados.
- Requiere descargar por separado el text encoder Qwen3-VL 32B y los VAEs desde Comfy-Org/MiniMax-H3, lo que anade varios GB y dependencias externas.

## Enlaces

- Hugging Face: https://huggingface.co/H3-Tiny/H3-Tiny-ComfyUI
- Pagina del proyecto: https://fuyi25.github.io/H3-Tiny/
- Codigo: https://github.com/fuyi25/H3-Tiny
- Checkpoints H3-Tiny: https://huggingface.co/H3-Tiny
- Checkpoint Ref2VA 17B: https://huggingface.co/H3-Tiny/H3-Tiny-17B-Pruned-Ref2VA
- Checkpoint FL2VA 17B: https://huggingface.co/H3-Tiny/H3-Tiny-17B-Pruned-FL2VA
- Checkpoint OKD Ref2VA 14B: https://huggingface.co/H3-Tiny/H3-Tiny-14B-OKD-Ref2VA-v0.1
- Text encoder y VAEs: https://huggingface.co/Comfy-Org/MiniMax-H3
- Script de conversion: https://github.com/fuyi25/H3-Tiny/blob/main/scripts/convert_comfyui.py
- Licencia: https://huggingface.co/H3-Tiny/H3-Tiny-ComfyUI/blob/main/LICENSE-MiniMax-H3
