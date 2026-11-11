# anu-122006/p3-lora-bk

## Resumen

p3-lora-bk es un adaptador LoRA de tipo text-to-image desarrollado por el usuario anu-122006 en el contexto del CV Hackathon 2026 (proyecto P3). Se trata de un ajuste fino ligero sobre el modelo base nota-ai/bk-sdm-small-2m, una variante destilada y compacta de Stable Diffusion, y no de un modelo completo: el repositorio contiene unicamente los pesos del adaptador, no el UNet ni el VAE ni el text encoder del modelo base.

El adaptador se entrena sobre 1.000 pares imagen-caption del conjunto COCO train2017 con el objetivo declarado de realizar una adaptacion ligera de estilo hacia fotografias cotidianas de tipo COCO. El entrenamiento se ejecuta con el script oficial `train_text_to_image_lora.py` de diffusers, con rango de LoRA 16 sobre el UNet, 1.000 pasos, batch 4, learning rate 1e-4 y precision fp16 a 512 px, completandose en 17 minutos sobre una NVIDIA T4.

Su relevancia es acotada: se trata de un artefacto de hackathon con 55 descargas y sin likes, orientado a demostrar un flujo de ajuste fino de bajo coste sobre un modelo de difusion pequeno. No aporta capacidades nuevas respecto al modelo base y su interes practico depende de la evaluacion del proyecto, que el autor remite sin publicar resultados medidos en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre UNet de un modelo de difusion text-to-image (BK-SDM-Small-2M) |
| Parametros totales | no disponible (el repositorio contiene solo los pesos del adaptador LoRA; el tamano del repo figura como 0.0 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica a un modelo de difusion text-to-image; resolucion de entrenamiento 512 px) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las captions de entrenamiento son de COCO, mayoritariamente en ingles) |
| Licencia | CreativeML OpenRAIL-M |
| Formato de pesos | pesos LoRA compatibles con diffusers (`load_lora_weights`); no se especifica el formato de serializacion exacto |

## Arquitectura y entrenamiento

El adaptador se inyecta en el UNet del modelo base mediante LoRA de rango 16, siguiendo el script `train_text_to_image_lora.py` de la libreria diffusers. El modelo base, nota-ai/bk-sdm-small-2m, es una variante BK-SDM (Block-removed Knowledge-distilled Stable Diffusion) de tamano small con 2M de parametros en el bloque destilado segun la nomenclatura del autor; se trata por tanto de un modelo de difusion latente derivado de Stable Diffusion con capas eliminadas y destilacion de conocimiento, pensado para inferencia economica. No se dispone de informacion detallada sobre la composicion del dataset de destilacion del modelo base en la informacion proporcionada.

El entrenamiento del LoRA utiliza 1.000 pares imagen-caption de COCO train2017, con 1.000 pasos, batch de 4, learning rate 1e-4, precision fp16 y resolucion de 512 px, ejecutado en una NVIDIA T4 durante 17 minutos. No se menciona uso de RLHF, DPO ni tecnicas de preferencia; el objetivo declarado es una adaptacion de estilo hacia fotografias cotidianas tipo COCO. No se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.) mas alla del propio ajuste LoRA.

## Capacidades

- Generacion de imagenes text-to-image a partir de prompts en lenguaje natural, heredada del modelo base BK-SDM-Small-2M.
- Adaptacion de estilo hacia fotografias cotidianas similares a las de COCO, segun el objetivo declarado del entrenamiento.
- Carga y fusion del adaptador mediante `pipe.load_lora_weights("anu-122006/p3-lora-bk")` y `pipe.fuse_lora()` sobre un pipeline de BK-SDM-Small-2M.
- No se documenta soporte de tool calling, function calling ni capacidades de agente.
- No se documenta razonamiento multi-paso, matemáticas ni codigo (no aplica a un modelo de difusion).
- No se documenta soporte multilingue explicito; las captions de entrenamiento provienen de COCO, predominantemente en ingles.
- No se documentan modos especiales (thinking mode, vision de entrada, audio).

## Casos de uso

- Prototipado rapido de generacion de imagenes en entornos con GPU modesta: al apoyarse en un modelo base small y un adaptador LoRA de rango 16, el coste de inferencia y de almacenamiento es bajo, lo que permite iterar en una unica T4 o en GPUs de consumo.
- Experimentacion academica con ajuste fino de difusion: sirve como ejemplo reproducible de un pipeline LoRA completo (dataset, hiperparametros, script de diffusers) para cursos y hackathones.
- Adaptacion de estilo fotografico cotidiano: el LoRA desplaza la distribucion de salida hacia escenas de tipo COCO, util para generar imagenes de acompanamiento en demos o datasets sinteticos de escenas comunes.
- Generacion de imagenes de relleno en pipelines de pruebas: al ser un modelo pequeno, puede emplearse para validar infraestructura de serving (carga de LoRA, fusion, resolucion 512 px) antes de pasar a modelos mayores.
- Investigacion sobre destilacion y LoRA: permite estudiar como un adaptador de bajo rango modifica el comportamiento de un modelo BK-SDM destilado, comparando salidas con y sin fusion del adaptador.
- Educacion y talleres: el flujo de entrenamiento documentado (1.000 pasos, 17 minutos en T4) es replicable en un taller practico sin infraestructura dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a la evaluacion del proyecto sin incluir metricas (FID, CLIP score u otras) ni comparaciones cuantitativas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; al tratarse de un adaptador sobre BK-SDM-Small-2M, los requisitos vienen determinados por el modelo base, que por su caracter destilado y compacto esta pensado para GPUs de gama baja.
- GPU de entrenamiento documentada: NVIDIA T4 (17 minutos para 1.000 pasos con batch 4 a 512 px en fp16).
- GPU recomendadas: no disponible; por el perfil del modelo base, se orienta a T4, GPUs de consumo y entornos de bajo presupuesto.
- Cabe en GPU de consumo: no se especifica que modelos concretos; el diseno del modelo base (BK-SDM small) sugiere que si, pero no hay dato confirmado en la informacion proporcionada.
- Opciones de despliegue: diffusers (carga del LoRA con `load_lora_weights` y `fuse_lora` sobre el pipeline del modelo base). No se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de difusion de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| p3-lora-bk | LoRA sobre BK-SDM-Small-2M | no disponible (adaptador) | 512 px de entrenamiento | CreativeML OpenRAIL-M | Hugging Face (55 descargas) |
| nota-ai/bk-sdm-small-2m (base) | Modelo de difusion text-to-image destilado | 2M (segun nomenclatura del autor) | no disponible | no disponible en la informacion | Hugging Face |
| Stable Diffusion 1.5 | Modelo de difusion text-to-image | ~860M en UNet | 512 px | CreativeML OpenRAIL-M | Amplia disponibilidad |
| Alternativas LoRA para SD | Adaptadores LoRA | variable | 512 px | variable | Hugging Face / Civitai |

No se dispone de datos de rendimiento comparado (FID, CLIP score) para establecer una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- El repositorio contiene solo el adaptador LoRA: no es utilizable de forma autonoma sin cargar el modelo base nota-ai/bk-sdm-small-2m.
- Entrenado con solo 1.000 pares imagen-caption de COCO: la cobertura de conceptos, estilos y vocabulario es muy limitada y el riesgo de sobreajuste a ese subconjunto es alto.
- No se publican metricas de evaluacion; el efecto real del adaptador no esta cuantificado.
- Las captions de COCO estan predominantemente en ingles, por lo que los prompts en castellano pueden degradar la calidad de generacion.
- Riesgo de sesgos heredados de COCO y del modelo base (representacion desequilibrada de genero, etnia y contextos geograficos).
- Riesgo de alucinacion visual: generacion de composiciones fisicamente improbables o de texto ilegible, comun en modelos de difusion pequenos.
- La licencia CreativeML OpenRAIL-M impone restricciones de uso (prohibicion de usos daninos descritos en el anexo de la licencia) y se hereda del modelo base; debe revisarse antes de uso comercial.
- Artefacto de hackathon sin mantenimiento declarado, con 0 likes y 55 descargas: no hay garantia de soporte ni de actualizaciones.
- No se documentan limitaciones especificas de contexto ni de idioma mas alla de las derivadas del dataset de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/anu-122006/p3-lora-bk
- Modelo base: https://huggingface.co/nota-ai/bk-sdm-small-2m
- Script de entrenamiento referenciado (diffusers): https://github.com/huggingface/diffusers/blob/main/examples/text_to_image/train_text_to_image_lora.py
- Dataset COCO: https://cocodataset.org/
- Licencia CreativeML OpenRAIL-M: https://huggingface.co/spaces/CompVis/stable-diffusion-license
