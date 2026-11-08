# kimhagon/qwen-image-edit-plus-nsfw-lora

## Resumen

MCNL v1 (Multi Concept NSFW LoRA) es un adaptador LoRA de tipo diffusers para el pipeline de edicion de imagen Qwen-Image-Edit-2511, desarrollado por el usuario kimhagon (publicado tambien bajo la organizacion ScottzillaSystems). Su funcion es anadir capacidades de generacion y edicion de contenido para adultos (NSFW) sobre el modelo base de Qwen, mediante palabras clave especificas que activan conceptos concretos. El repositorio ocupa aproximadamente 0,6 GB y el archivo de pesos LoRA ronda los 563 MB en formato safetensors.

El adaptador no es un modelo autonomo: requiere descargar y ejecutar Qwen-Image-Edit-2511 como modelo base y cargar despues los pesos LoRA sobre el pipeline `QwenImageEditPlusPipeline`. La arquitectura del adaptador se aplica sobre el bloque `QwenImageTransformer2DModel` (MMDiT) del modelo base. Se distribuye bajo licencia OpenRAIL++ y esta etiquetado como `not-for-all-audiences`.

El modelo tiene un caracter marcadamente experimental: no registra descargas ni interacciones en el momento de la consulta, no publica datos de entrenamiento, benchmarks ni evaluaciones, y su model card se limita a instrucciones de uso y a la lista de trigger words. Resulta relevante unicamente como ejemplo de adaptacion LoRA sobre pipelines de edicion de imagen de Qwen y para quienes exploren el ecosistema de adaptadores de la familia Qwen-Image-Edit.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre QwenImageTransformer2DModel (MMDiT) del modelo base Qwen-Image-Edit-2511 |
| Parametros totales | no disponible (adaptador LoRA; tamano de archivo ~563 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el ejemplo de uso emplea `torch.bfloat16` |
| Idiomas soportados | no disponible (los prompts del ejemplo estan en ingles) |
| Licencia | OpenRAIL++ |
| Formato de pesos | safetensors (`qwen-image-edit-plus-nsfw-lora.safetensors`) |

## Arquitectura y entrenamiento

El adaptador es un LoRA aplicado sobre el transformador de difusion multimodal (MMDiT) del modelo base Qwen-Image-Edit-2511. No se modifica la arquitectura del pipeline: los pesos LoRA se cargan con `pipe.load_lora_weights(...)` y se activan mediante `pipe.set_adapters([...])`, de modo que el modelo base permanece congelado y el adaptador anade los conceptos nuevos. El ejemplo de la model card emplea `QwenImageEditPlusPipeline` con `torch_dtype=torch.bfloat16`, 40 pasos de inferencia, `true_cfg_scale=4.0` y un `negative_prompt` vacio.

No se dispone de informacion sobre el conjunto de datos de entrenamiento, el numero de imagenes o pasos utilizados, la composicion del dataset, el metodo de anotacion ni si se aplicaron tecnicas de regularizacion o fine-tuning selectivo. Tampoco se documenta ninguna innovacion tecnica adicional mas alla del propio mecanismo LoRA. La unica informacion operativa publicada son las trigger words que activan los conceptos aprendidos.

## Capacidades

- Edicion de imagen a imagen sobre el pipeline Qwen-Image-Edit-2511, aplicando transformaciones guiadas por prompt sobre una imagen de entrada.
- Generacion y edicion de contenido para adultos mediante trigger words especificas: `nsfw`, `nipples`, `vagina`, `penis`, `missionary`, `cowgirlout`, `reversecowgirlpov`, `blowjob`, `cum_on_face`, `creamp1e`, `l1ck`.
- Composicion de multiples conceptos en un mismo prompt (de ahi el nombre "Multi Concept").
- Carga y descarga dinamica de adaptadores mediante la API de diffusers (`load_lora_weights`, `set_adapters`), lo que permite combinar o desactivar el adaptador segun la peticion.
- Integracion en flujos de trabajo existentes de Qwen-Image-Edit sin reentrenar el modelo base.
- Soporte de prompt negativo y control de escala de guia sin clasificador (`true_cfg_scale`).
- No se documenta soporte de tool calling, agentes, razonamiento multi-paso, vision adicional, audio ni modo de pensamiento; son capacidades ajenas al proposito del adaptador.

## Casos de uso

- Prototipado de pipelines de edicion de imagen con LoRA: cargar el adaptador sobre Qwen-Image-Edit-2511 en un script de diffusers para verificar el flujo completo de carga, activacion y generacion antes de integrar otros adaptadores.
- Investigacion sobre adaptadores de bajo rango: usar este LoRA como referencia practica de como se estructura y se publica un adaptador para la familia Qwen-Image-Edit, comparando el tamano de pesos (~563 MB) con el del modelo base.
- Evaluacion de seguridad y moderacion de contenido: emplear el adaptador en entornos controlados para estudiar como responden los filtros de seguridad y los clasificadores de contenido ante prompts NSFW y trigger words conocidas.
- Pruebas de composicion de conceptos: verificar mediante prompts con varias trigger words si el adaptador mantiene coherencia cuando se combinan conceptos, y documentar los fallos de composicion.
- Demostraciones en entornos de investigacion cerrados: desplegar el adaptador en una instancia aislada con acceso restringido para analizar sus salidas sin exponerlo a usuarios finales.
- Benchmarking cualitativo de adaptadores: comparar MCNL v1 con MCNL v2 (version actualizada del mismo autor) sobre el mismo conjunto de imagenes de entrada y los mismos prompts, midiendo diferencias de fidelidad y coherencia.
- Docencia sobre difusion y LoRA: ilustrar en un curso o taller el mecanismo de adaptadores de bajo rango usando un caso con limitaciones y avisos de licencia bien definidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. El adaptador anade ~563 MB de pesos, pero el consumo dominante corresponde al modelo base Qwen-Image-Edit-2511, que debe cargarse en `bfloat16` segun el ejemplo oficial.
- GPU recomendadas: no disponible en la informacion proporcionada. El ejemplo de la model card usa `.to("cuda")` sin especificar modelo de GPU.
- Compatibilidad con GPU de consumo: no confirmada. Depende enteramente de los requisitos del modelo base, no documentados aqui.
- Opciones de despliegue: `diffusers` con `QwenImageEditPlusPipeline` (flujo documentado). Tambien existe un Space de Hugging Face (ScottzillaSystems Image Editor) que permite seleccionar el adaptador desde un desplegable. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a pipelines de difusion de este tipo.
- Latencia y throughput: no disponibles. El unico parametro publicado es `num_inference_steps=40` en el ejemplo, sin mediciones de tiempo.

## Comparativa con modelos similares

| Modelo | Tipo | Modelo base | Tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MCNL v1 (este) | LoRA NSFW para edicion de imagen | Qwen-Image-Edit-2511 | ~563 MB | OpenRAIL++ | Hugging Face, 0 descargas |
| MCNL v2 | LoRA NSFW, version actualizada del mismo autor | Qwen-Image-Edit-2511 | no disponible | no disponible | Hugging Face |
| Qwen-Image-Edit-2511 | Modelo base de edicion de imagen | no aplica | no disponible en esta ficha | no disponible en esta ficha | Hugging Face |

No se dispone de datos de rendimiento, contexto ni benchmarks de ninguno de los tres, por lo que la comparativa se limita a tipo, modelo base, tamano y licencia. No se identifican en la informacion proporcionada otros adaptadores LoRA NSFW comparables para Qwen-Image-Edit.

## Limitaciones y advertencias

- Contenido para adultos: el adaptador genera material NSFW explicito. El repositorio esta marcado como `not-for-all-audiences` y no debe desplegarse en productos accesibles a menores ni en entornos sin moderacion.
- Licencia OpenRAIL++: incluye restricciones de uso derivadas de las clausulas de uso responsable de OpenRAIL. Es necesario revisar el texto completo de la licencia antes de cualquier uso comercial; la informacion disponible no detalla condiciones adicionales del autor.
- Ausencia de evaluacion: no hay benchmarks, metricas de calidad, estudio de sesgos ni documentacion del dataset de entrenamiento, lo que impide estimar su fiabilidad en produccion.
- Riesgo de alucinacion visual y artefactos: al ser un LoRA sin evaluacion publicada, la fidelidad de las ediciones y la coherencia anatomica no estan verificadas.
- Dependencia estricta del modelo base: solo funciona con Qwen-Image-Edit-2511; cambios de version del pipeline pueden romper la carga de pesos.
- Idiomas: no se documenta soporte multilingue; los ejemplos y trigger words estan en ingles, por lo que los prompts en castellano pueden comportarse de forma impredecible.
- Trigger words ofuscadas: algunas palabras clave estan escritas con sustituciones de caracteres (`creamp1e`, `l1ck`), lo que puede afectar a la reproducibilidad de los resultados si el prompt se normaliza.
- Madurez del repositorio: creado y actualizado en la misma fecha, sin descargas ni interacciones, lo que sugiere un proyecto reciente y sin validacion por parte de la comunidad.
- Sin garantias de soporte: no se documenta mantenimiento, issues ni canal de contacto del autor.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/kimhagon/qwen-image-edit-plus-nsfw-lora
- Repositorio espejo en ScottzillaSystems: https://huggingface.co/ScottzillaSystems/qwen-image-edit-plus-nsfw-lora
- Version actualizada MCNL v2: https://huggingface.co/ScottzillaSystems/qwen-image-edit-plus-nsfw-lora2
- Space del editor de imagenes: https://huggingface.co/spaces/ScottzillaSystems/Qwen-Image-Edit-2511-LoRAs-Fast
- Modelo base Qwen-Image-Edit-2511: https://huggingface.co/Qwen/Qwen-Image-Edit-2511
- Ficha de directorio en Syncdev: https://www.syncdev.com/models/hf-scottzillasystems-qwen-image-edit-plus-nsfw-lora
