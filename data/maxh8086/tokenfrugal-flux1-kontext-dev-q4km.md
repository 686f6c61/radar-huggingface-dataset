# maxh8086/tokenfrugal-flux1-kontext-dev-q4km

## Resumen

`tokenfrugal-flux1-kontext-dev-q4km` es un espejo privado del modelo de generacion de imagenes FLUX.1-Kontext-dev, publicado por el usuario maxh8086 en formato GGUF con cuantizacion Q4_K_M. No se trata de un modelo de lenguaje ni de un modelo entrenado por el autor: es una redistribucion del archivo `flux1-kontext-dev-Q4_K_M.gguf` (6.931.817.760 bytes) generado originalmente por city96 a partir de FLUX.1-Kontext-dev de Black Forest Labs. El repositorio se describe explicitamente como "private mirror for tokenfrugal" y su unico proposito declarado es servir de origen para un script de descarga interno (`scripts/hf_models.py pull`).

El modelo subyacente, FLUX.1-Kontext-dev, es un transformer de difusion para generacion y edicion de imagenes por instrucciones en lenguaje natural, con aproximadamente 11.900 millones de parametros segun los metadatos del repositorio. La cuantizacion Q4_K_M reduce el peso a unos 6,9 GB, lo que permite ejecutarlo en GPUs de consumo con VRAM moderada, a costa de cierta perdida de fidelidad frente a los pesos originales en bf16.

La relevancia de esta ficha es limitada por la escasez de informacion verificable: el autor no ha publicado benchmarks, no ha ejecutado pruebas de render ni ha medido perplejidad, y solo ha validado la integridad de los tensores y metadatos. Cualquier evaluacion de calidad debe remitirse al modelo original de Black Forest Labs y a las conversiones GGUF de city96.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (FLUX.1-Kontext); detalles exactos no disponibles en la informacion proporcionada |
| Parametros totales | 11.901.408.320 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (unico archivo publicado) |
| Idiomas soportados | no disponible (el prompt se procesa mediante un text encoder no incluido en el repo) |
| Licencia | FLUX.1 [dev] non-commercial license (segun la model card; verificar) |
| Formato de pesos | GGUF |
| Tamano del archivo | 6.931.817.760 bytes (~6,9 GB) |
| Repo total | 6,9 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La informacion proporcionada no incluye detalles sobre la arquitectura interna ni sobre el proceso de entrenamiento. Por el nombre del modelo y su origen (FLUX.1-Kontext-dev de Black Forest Labs, convertido a GGUF por city96), se trata de un modelo de difusion basado en transformer para generacion y edicion de imagenes condicionada por texto e imagen de referencia. El repositorio no documenta el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF, DPO o fine-tuning por preferencias.

La unica innovacion tecnica documentada en este repositorio es la propia cuantizacion Q4_K_M aplicada por city96, que reduce el modelo a aproximadamente 6,9 GB manteniendo los tensores en formato GGUF compatible con runners como ComfyUI-GGUF o stable-diffusion.cpp. El autor de este espejo no aporta ningun proceso adicional de entrenamiento, destilacion ni modificacion de pesos: solo redistribuye el archivo.

## Capacidades

- Generacion de imagenes a partir de prompts de texto (capacidad heredada de FLUX.1-Kontext-dev).
- Edicion de imagenes guiada por instrucciones en lenguaje natural (image-to-image condicionado por texto), segun la naturaleza "Kontext" del modelo base.
- Ejecucion en entornos de bajos recursos gracias a la cuantizacion Q4_K_M.
- Compatibilidad con runners GGUF para difusion (ComfyUI-GGUF, stable-diffusion.cpp), aunque no se documenta en el repo.
- Soporte de tool calling, agentes, razonamiento multi-paso, vision descriptiva, audio o modo thinking: no disponible (no es un modelo de lenguaje).
- Capacidades multilingues del text encoder: no disponibles en la informacion proporcionada.

## Casos de uso

- Prototipado local de edicion de imagenes: cargar el GGUF en ComfyUI-GGUF para probar flujos de edicion por instrucciones en una GPU de consumo, aprovechando que el archivo pesa menos de 7 GB y cabe en VRAM de 8-12 GB con offloading.
- Pipeline interno de generacion de assets: usar el modelo como origen de descargas automatizadas mediante `scripts/hf_models.py pull` en un entorno controlado de tokenfrugal, tal y como declara el autor.
- Investigacion sobre cuantizacion de modelos de difusion: comparar la calidad de Q4_K_M frente a los pesos bf16 originales en tareas de edicion para medir la degradacion introducida por la cuantizacion.
- Evaluacion de licencias: servir como caso de estudio de redistribucion de pesos bajo licencia no comercial FLUX.1 [dev], util para equipos que necesiten auditar el cumplimiento antes de integrar el modelo en productos.
- Pruebas de integridad y reproducibilidad: verificar hashes y metadatos del GGUF frente al original de city96 en pipelines de CI que validen artefactos de modelos.
- Despliegue en estaciones de trabajo sin GPU de datacenter: ejecutar inferencia en una RTX 3060/4060 Ti con cuantizacion Q4_K_M para tareas creativas internas no comerciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente: "Perplexity: not measured", "Render or output test: not run" y que la unica comprobacion realizada fue de integridad de tensores y metadatos (2026-11-05).

## Requisitos de hardware

- VRAM estimada: el archivo GGUF pesa ~6,9 GB, por lo que la inferencia requiere al menos ~7-8 GB de VRAM si se carga completo; con offloading a RAM del sistema puede ejecutarse en GPUs de 6-8 GB a costa de latencia.
- GPUs recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080, RTX 4090; en datacenter, A100 o H100 para mayor throughput, aunque el modelo no esta pensado para cargas de servidor.
- Cabe en GPU de consumo: si, en modelos con 8 GB o mas de VRAM; en 6 GB requerira offloading parcial.
- Opciones de despliegue: ComfyUI con el nodo ComfyUI-GGUF, stable-diffusion.cpp; no se documenta soporte en vLLM, llama.cpp (orientado a LLM) ni TGI (orientado a LLM).
- Latencia y throughput: no disponibles; el autor no ejecuto pruebas de render.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Contexto / resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tokenfrugal-flux1-kontext-dev-q4km | ~11,9 B | GGUF Q4_K_M | no disponible | FLUX.1 [dev] non-commercial (verificar) | Espejo privado, 0 descargas |
| city96 FLUX.1-Kontext-dev GGUF Q4_K_M (origen) | ~11,9 B | GGUF Q4_K_M | no disponible | FLUX.1 [dev] non-commercial | Publico en Hugging Face |
| FLUX.1-Kontext-dev original (Black Forest Labs) | ~11,9 B | safetensors bf16 | no disponible | FLUX.1 [dev] non-commercial | Publico en Hugging Face |

La unica diferencia verificable entre este repositorio y su origen es la redistribucion: mismos pesos, mismo formato y misma cuantizacion. No hay datos de rendimiento que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Repositorio sin actividad: 0 descargas, 0 likes, creado y actualizado en noviembre de 2026, lo que sugiere un uso estrictamente interno y sin validacion por parte de la comunidad.
- Sin pruebas de calidad: el autor no ha medido perplejidad ni ejecutado un render, por lo que no hay evidencia de que el GGUF produzca salidas correctas mas alla de la integridad de los tensores.
- Licencia restrictiva: FLUX.1 [dev] non-commercial license prohibe el uso comercial; la propia model card pide "verify", por lo que conviene confirmar los terminos antes de cualquier despliegue.
- La cuantizacion Q4_K_M introduce perdida de fidelidad frente a bf16; no se documenta el grado de degradacion.
- No es un modelo de lenguaje: no soporta tool calling, agentes, razonamiento multi-paso ni conversacion; cualquier uso en esos escenarios seria un error de categoria.
- El text encoder y el VAE necesarios para la inferencia no estan incluidos en este repo; hay que obtenerlos por separado.
- Riesgo de alucinacion visual y sesgos del dataset original: no documentados en la informacion disponible.
- Redistribucion de pesos de terceros: el autor no aclara si cuenta con permiso explicito de city96 o de Black Forest Labs para el espejo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/maxh8086/tokenfrugal-flux1-kontext-dev-q4km
- Origen declarado (city96 FLUX.1-Kontext-dev GGUF Q4_K_M): https://huggingface.co/city96/FLUX.1-Kontext-dev-gguf
- Modelo original (Black Forest Labs FLUX.1-Kontext-dev): https://huggingface.co/black-forest-labs/FLUX.1-Kontext-dev
- Licencia FLUX.1 [dev] non-commercial: no disponible en la informacion proporcionada (verificar en la pagina de Black Forest Labs)
- ComfyUI-GGUF (runner compatible): https://github.com/city96/ComfyUI-GGUF
- stable-diffusion.cpp (runner compatible): https://github.com/leejet/stable-diffusion.cpp
