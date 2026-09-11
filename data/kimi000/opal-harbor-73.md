# kimi000/opal-harbor-73

## Resumen

opal-harbor-73 es un modelo de generación de imágenes a partir de texto publicado en HuggingFace por el usuario kimi000. Se trata de un ajuste fino del modelo base black-forest-labs/FLUX.2-klein-base-4B, un transformer de difusión de la familia Flux2 con 3.875.544.576 parámetros (unos 3,88 mil millones). El ajuste se ha realizado mediante aprendizaje por refuerzo con un esquema tipo AlphaGRPO y un currículo de entrenamiento denominado "39-family", partiendo de una ejecución con validación de recompensa (r18) en la iteración 500.

El artefacto distribuido es un pipeline nativo `diffusers.Flux2KleinPipeline` en bf16 en el que se ha fusionado una LoRA entrenada con EMA (rango 32, alpha 64) directamente en el transformer, de modo que no es necesario cargar adaptadores adicionales. El repositorio ocupa 16 GB e incluye ficheros de procedencia (`provenance.json`, `export_manifest.json`) y de verificación (`verification.json`). La licencia declarada es Apache 2.0.

Su relevancia es limitada pero concreta: documenta una receta de RL aplicada a un modelo de difusión de 4B con resolución de entrenamiento de 512 px, y sirve como referencia reproducible para quien quiera estudiar ajustes por refuerzo sobre Flux2 klein. No se han publicado benchmarks ni métricas de calidad, y el modelo no tiene descargas ni valoraciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (DiT) de la familia Flux2; pipeline `diffusers.Flux2KleinPipeline`; LoRA EMA (rango 32, alpha 64) fusionada en el transformer |
| Parametros totales | 3.875.544.576 (~3,88 B), segun los pesos safetensors |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; es un modelo texto-a-imagen y no se declara limite de tokens de prompt |
| Tipos de cuantizacion | no disponible; solo se distribuyen pesos bf16 en safetensors, sin variantes GGUF, FP8 ni INT8 publicadas |
| Idiomas soportados | no disponible; los ejemplos de la model card usan prompts en ingles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16) |
| Tarea | text-to-image |
| Resolucion de entrenamiento | 512 px |
| Modelo base | black-forest-labs/FLUX.2-klein-base-4B |
| Tamano del repositorio | 16,0 GB |
| Fecha de publicacion | 2026-09-10 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base FLUX.2-klein-base-4B, un transformer de difusion (DiT) de la familia Flux2 que se ejecuta a traves del pipeline `Flux2KleinPipeline` de la libreria `diffusers`. El modelo entregado no incorpora ningun adaptador externo: la LoRA obtenida durante el entrenamiento, de rango 32 y alpha 64, se ha fusionado en los pesos del transformer y se exporta en bf16 nativo, de forma que la carga se realiza con `Flux2KleinPipeline.from_pretrained(...)` sin pasos adicionales.

El entrenamiento corresponde a una ejecucion con curriculo "39-family" de estilo AlphaGRPO, no a la linea base estatica de AlphaGRPO. Los hiperparametros declarados son: resolucion de 512 px, 20 pasos de rollout, CFG 4, 16 prompts por iteracion y tamano de grupo 14. El checkpoint exportado corresponde a la iteracion 500 con EMA de la ejecucion r18 con recompensa valida (ejecucion de W&B `65cyigcp`). La model card advierte de forma explicita que la etiqueta `100pct_target` designa un objetivo de entrenamiento y no una fraccion verificada de datos generados en linea. El fichero `verification.json` recoge comprobaciones de integridad de la exportacion (recarga estricta sin conexion, diferencias de parametros respecto al modelo base antes y despues de la serializacion y diferencias de imagen con la misma semilla a 512 px y 20 pasos); el propio autor indica que no son benchmarks.

## Capacidades

- Generacion de imagenes a partir de prompts de texto en formato descriptivo, con resolucion nativa de inferencia de 512 px y 20 pasos por defecto en los ejemplos publicados.
- Guiado por clasificador (CFG) con escala 4,0 en la configuracion recomendada por el autor.
- Control de reproducibilidad mediante semilla del generador (`torch.Generator("cuda").manual_seed(...)`).
- Ejecucion directa en `diffusers` con pesos bf16, sin necesidad de cargar una LoRA por separado.
- Ajuste por refuerzo sobre el modelo base, orientado a mejorar la adherencia al prompt dentro del curriculo de entrenamiento declarado.
- No se documenta soporte de tool calling ni de function calling: no aplica a un modelo texto-a-imagen.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documentan capacidades multilingues ni idiomas soportados para los prompts.
- No se documentan capacidades de vision, audio, modo "thinking", edicion de imagen, inpainting ni img2img; la model card solo describe la generacion texto-a-imagen.

## Casos de uso

- Prototipado visual rapido en desarrollo de producto: generar bocetos de concepto a 512 px con 20 pasos para iterar sobre direcciones visuales antes de encargar trabajo de mayor resolucion.
- Generacion de datasets sinteticos: producir lotes de imagenes etiquetadas por prompt para aumentar datos de entrenamiento en tareas de clasificacion o deteccion, controlando la semilla para reproducibilidad.
- Pruebas de integracion en CI/CD: incluir la generacion de una imagen con semilla fija como prueba de humo del pipeline (`Flux2KleinPipeline`), ya que el propio repositorio incluye comprobaciones de integridad de exportacion comparables.
- Ilustracion de articulos y documentacion tecnica: generar imagenes de apoyo a 512 px para blogs o manuales donde no se requiere alta resolucion ni uso comercial restringido.
- Investigacion en RL aplicado a modelos de difusion: el repositorio documenta la receta (curriculo 39-family, 20 pasos de rollout, CFG 4, 16 prompts por iteracion, tamano de grupo 14) y los ficheros de procedencia, lo que lo hace util como punto de partida reproducible.
- Base para ajustes posteriores del usuario: al ser un modelo de 3,88 B en bf16 con licencia Apache 2.0, puede servir como punto de partida para LoRA o DreamBooth propios.
- Exploracion de prompts en ingles: los ejemplos publicados son prompts descriptivos detallados (por ejemplo, "A red ceramic teapot beside two blue cups on a wooden table"), utiles para evaluar la adherencia del modelo a composiciones de objetos multiples.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio unicamente incluye `verification.json`, cuyas metricas declaradas son comprobaciones de integridad de la exportacion (recarga estricta sin conexion, diferencias de parametros frente al modelo base antes y despues de la serializacion, y diferencias de imagen con la misma semilla a 512 px y 20 pasos). La model card del autor indica expresamente que no se trata de benchmarks, por lo que no se dispone de valores de FID, CLIP score, ImageReward ni de comparativas cuantitativas frente al modelo base.

## Requisitos de hardware

- Pesos del transformer en bf16: aproximadamente 7,75 GB solo para los 3.875.544.576 parametros del transformer.
- Pipeline completo en memoria: el repositorio ocupa 16 GB, por lo que el conjunto (transformer mas codificadores de texto y VAE segun la implementacion de Flux2) puede requerir del orden de 16-20 GB de VRAM en bf16 sin optimizaciones; es una estimacion basada en el tamano del repositorio, no un dato publicado.
- GPU de gama alta recomendadas: A100 (40/80 GB), H100 (80 GB) o L40S para servir el pipeline sin offloading.
- GPU de consumo: cabe en tarjetas de 24 GB (RTX 3090, RTX 4090) con margen; en tarjetas de 16 GB (RTX 4080, RTX 4060 Ti 16 GB) es previsible que requiera offloading de modulos a CPU; en tarjetas de 12 GB (RTX 3060 12 GB) solo con offloading agresivo y posible uso de memoria del sistema como respaldo.
- Opciones de despliegue: `diffusers` es la via nativa documentada por el autor (pipeline `Flux2KleinPipeline` con `torch_dtype=torch.bfloat16` y `.to("cuda")`). No se documentan en la informacion disponible integraciones con vLLM, TGI, llama.cpp, Ollama, ComfyUI o `stable-diffusion.cpp`.
- Latencia y throughput: no disponible. No se publican tiempos de inferencia ni imagenes por segundo.

## Comparativa con modelos similares

Los datos de los modelos alternativos no proceden de la informacion proporcionada; se incluyen unicamente como referencia orientativa y deben verificarse en sus propias fichas.

| Modelo | Parametros | Contexto / resolucion | Licencia | Notas |
|---|---|---|---|---|
| opal-harbor-73 | 3,88 B | 512 px de entrenamiento; contexto de prompt no disponible | apache-2.0 | Ajuste por RL con LoRA EMA fusionada; sin benchmarks publicados; 0 descargas |
| FLUX.2-klein-base-4B | ~4 B | no disponible | no disponible | Modelo base declarado; sin datos de rendimiento en la informacion disponible |
| FLUX.1 [dev] | ~12 B | no disponible | licencia no comercial de FLUX.1 [dev] | Alternativa de la misma familia, de mayor tamano; datos orientativos |
| SDXL base 1.0 | ~2,6 B (UNet) | nativa 1024 px | CreativeML Open RAIL++-M | Alternativa de difusion ampliamente desplegada; datos orientativos |

No se dispone de comparativas de calidad, FID ni adherencia al prompt entre estos modelos dentro de la informacion proporcionada.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay metricas de calidad, adherencia al prompt ni comparacion con el modelo base. Las unicas verificaciones publicadas son de integridad de exportacion.
- Modelo sin adopcion: 0 descargas y 0 me gusta en el momento de redactar la ficha, y publicacion muy reciente (10 de septiembre de 2026, con actualizacion el mismo dia). No ha pasado revision por parte de la comunidad.
- Trazabilidad parcial de los datos: la etiqueta `100pct_target` es, segun el propio autor, un objetivo de entrenamiento y no una fraccion verificada de contenido generado en linea, por lo que la composicion real del dataset de entrenamiento no esta confirmada.
- Riesgo de sesgos: al no documentarse la procedencia ni la composicion de los prompts de entrenamiento, no es posible evaluar sesgos demograficos, culturales o estilisticos.
- Riesgo de alucinacion visual: inherente a los modelos de difusion; no se documenta ningun mecanismo de mitigacion ni evaluacion de fidelidad al prompt.
- Resolucion limitada: el entrenamiento declarado es a 512 px, por lo que la calidad a resoluciones superiores no esta verificada y podria degradarse.
- Idiomas: no se declara ningun idioma soportado; los ejemplos usan ingles, y el comportamiento con prompts en castellano no esta documentado.
- Licencia: el modelo se publica bajo Apache 2.0, pero es un ajuste fino de black-forest-labs/FLUX.2-klein-base-4B. Antes de un uso comercial conviene verificar los terminos de licencia del modelo base, que no se detallan en la informacion proporcionada.
- Falta de soporte documentado: no se indican integraciones con herramientas de despliegue habituales (ComfyUI, vLLM, TGI, Ollama, llama.cpp) ni formatos cuantizados, lo que limita su uso en entornos de produccion con restricciones de VRAM.
- Uso en produccion: sin latencias, throughput ni evaluacion de estabilidad publicados, no se recomienda su despliegue en produccion sin una validacion previa por parte del equipo que lo adopte.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kimi000/opal-harbor-73
- Modelo base: https://huggingface.co/black-forest-labs/FLUX.2-klein-base-4B
- Ficheros de procedencia y verificacion citados en la model card (ubicados en el propio repositorio): `provenance.json`, `export_manifest.json`, `verification.json`
- Ejecucion de Weights & Biases citada por el autor: `65cyigcp` (no se proporciona URL en la informacion disponible)
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo ni sobre su familia: los enlaces recuperados corresponden a consultas no relacionadas (letras del frances, un capitulo de un videojuego, el caracter tilde, el fichero `.DS_Store` y conversiones de unidades de almacenamiento), por lo que no se incluyen.
