# jsm0661/MiniMax-H3-DenoMix

## Resumen

MiniMax-H3 DenoMix es un modelo de difusion para generacion de video a partir de imagen y texto (reference-to-video, R2V), publicado por el usuario jsm0661 en Hugging Face. No se trata de un modelo original, sino de un merge: combina los pesos originales de MiniMax H3 R2V de MiniMaxAI con el fine-tune "Singularity" de WarmBloodAban y algunos pesos adicionales, todo empaquetado en un unico archivo safetensors.

El modelo se distribuye en formato pruned INT8 (ConvRot), lo que reduce el tamaño del archivo a unos 21 GB y facilita su uso en entornos locales, concretamente en ComfyUI. Su relevancia radica en que ofrece una variante optimizada y ya fusionada del modelo base, evitando al usuario gestionar multiples pesos y LoRAs por separado.

Esta pensado para flujos de trabajo tipo "turbo" con pocas iteraciones de denoising: el workflow incluido genera a baja resolucion en 8 pasos, escala el latente x2 y refina en los 2 ultimos pasos con un refiner, logrando videos en un tiempo reducido frente a pipelines de muchas etapas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion image-text-to-video (reference-to-video), formato pruned INT8 (ConvRot) |
| Parametros totales | no disponible (archivo de 20.967.647.432 bytes, ~21 GB en INT8) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 pruned (ConvRot) |
| Idiomas soportados | no disponible |
| Licencia | MiniMax H3 Community License Agreement (other) |
| Formato de pesos | safetensors (archivo unico: `MiniMax-H3_DenoMix_ref2va_pruned_int8_v3.safetensors`) |

## Arquitectura y entrenamiento

MiniMax-H3 DenoMix es un modelo de difusion para video construido sobre los pesos R2V (reference-to-video) de MiniMax H3, que permiten generar video condicionado por una imagen de referencia y un texto. La variante DenoMix no ha sido entrenada desde cero: se ha producido mediante un merge de pesos que integra el fine-tune Singularity (publicado por WarmBloodAban bajo licencia Apache-2.0) junto con pesos adicionales sobre el modelo base.

El archivo resultante esta podado (pruned) y cuantizado a INT8 con la tecnica ConvRot, un formato de archivo unico soportado por ComfyUI a traves de la libreria diffusion-single-file. No hay informacion publicada sobre el numero de pasos de entrenamiento, composicion del dataset ni tecnicas de alineacion aplicadas al fine-tune Singularity original.

## Capacidades

- Generacion de video a partir de imagen de referencia y texto (reference-to-video).
- Compatibilidad con flujos de trabajo de baja latencia tipo turbo (8+2 pasos) combinando LoRAs de aceleracion.
- Integracion directa en ComfyUI como sustituto del modelo de difusion pruned INT8 original, sin necesidad de cambiar text encoder ni VAEs.
- Uso de un solo archivo de pesos, lo que simplifica la instalacion y la distribucion.
- Compatible con workflows de upscale latente (x2) y refinado con refiner en los ultimos pasos.

No hay informacion disponible sobre soporte de tool calling, agentes, capacidades multilingues del prompt ni generacion de audio.

## Casos de uso

- Generacion de video local en ComfyUI: el archivo unico INT8 permite cargar el modelo directamente en `ComfyUI/models/diffusion_models/` y ejecutarlo sin gestionar multiples checkpoints, adecuado para creadores que trabajan en su propia estacion de trabajo.
- Produccion rapida de clips con imagen de referencia: el workflow turbo incluido (8 pasos a baja resolucion + upscale latente x2 + 2 pasos de refinado) permite obtener videos en menos tiempo que un pipeline completo, util para iterar prompts rapidamente.
- Estilizacion con fine-tunes comunitarios: al integrar el fine-tune Singularity, ofrece una estetica alternativa a los pesos originales de MiniMax H3 sin configuracion adicional.
- Prototipado de workflows de video: el archivo JSON de workflow incluido sirve como plantilla documentada, con enlaces de descarga de todos los modelos necesarios, para montar pipelines propios.
- Uso en GPUs de gama alta con VRAM limitada: la cuantizacion INT8 reduce los requisitos de memoria frente a los pesos en precision completa, facilitando la ejecucion en hardware de consumo avanzado.
- Integracion en flujos de produccion de contenido: puede encadenarse con nodos de ComfyUI para upscaling posterior, interpolacion de frames o edicion, dentro de un pipeline de video generativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. El archivo pesa ~21 GB en INT8, por lo que es razonable asumir que se necesita al menos una GPU con 24 GB de VRAM para cargalo con margen, aunque esta cifra no esta confirmada por el autor.
- GPU recomendadas: no disponible. Dado el tamaño del archivo, GPUs con 24 GB de VRAM (RTX 3090, RTX 4090, A5000 o superiores) son candidatas razonables, sin confirmacion oficial.
- Consumer GPU: plausible en tarjetas de 24 GB (RTX 3090/4090) gracias a la cuantizacion INT8; no hay datos verificados sobre GPUs de menor VRAM.
- Despliegue: ComfyUI (unico entorno documentado). Se requiere una version de ComfyUI que soporte el formato pruned INT8 (ConvRot). No hay soporte documentado para vLLM, llama.cpp, Ollama o TGI (herramientas orientadas a modelos de lenguaje, no de difusion).
- Latencia y throughput: no disponibles. El workflow turbo incluido esta disenado para 8+2 pasos, lo que sugiere tiempos de generacion reducidos frente a pipelines de mas pasos, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Tipo | Formato / cuantizacion | Tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniMax-H3 DenoMix (este modelo) | Merge R2V (base H3 + Singularity) | safetensors pruned INT8 (ConvRot), archivo unico | ~21 GB | MiniMax H3 Community License | Hugging Face, 308 descargas |
| MiniMaxAI/MiniMax-H3 | Modelo base R2V de MiniMax | no disponible | no disponible | MiniMax H3 Community License | Hugging Face |
| WarmBloodAban/Minimax-h3_Singularity | Fine-tune de MiniMax H3 | no disponible | no disponible | Apache-2.0 | Hugging Face |

La principal diferencia de DenoMix frente a sus modelos base es la comodidad de distribucion: pesos ya fusionados, podados y cuantizados a INT8 en un solo archivo, a costa de no poder revertir el merge ni combinar el fine-tune con otros pesos de forma modular.

## Limitaciones y advertencias

- Es un merge comunitario, no un modelo oficial de MiniMax: la calidad y el comportamiento dependen del fine-tune Singularity y de los pesos adicionales integrados por el autor, sin documentacion detallada del proceso.
- No hay model card tecnica completa: se desconocen numero de parametros, contexto, idiomas de los prompts y datos de entrenamiento, lo que dificulta evaluar sesgos y alucinaciones especificas.
- Licencia restringida: hereda el MiniMax H3 Community License Agreement, que puede imponer limitaciones al uso comercial (por ejemplo, umbrales de ingresos o requisitos de atribucion). Debe revisarse el texto de la licencia antes de cualquier despliegue comercial.
- Dependencia de software: requiere una version de ComfyUI con soporte del formato pruned INT8 (ConvRot); versiones anteriores no podran cargar el archivo.
- El workflow incluido carga modelos y nodos personalizados de terceros (turbo LoRA de Alibaba, refiner de NVIDIA, extraccion de Kijai) que conservan sus propias licencias, lo que anade complejidad legal al pipeline completo.
- Riesgo habitual de los modelos de video generativo: artefactos visuales, incoherencia temporal y dificultad para seguir instrucciones complejas, agravado aqui por la reduccion de pasos del modo turbo.
- Popularidad muy baja (0 likes, 308 descargas en el momento de la ficha), por lo que hay poca validacion comunitaria y soporte limitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jsm0661/MiniMax-H3-DenoMix
- Modelo base MiniMax H3: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Fine-tune Singularity: https://huggingface.co/WarmBloodAban/Minimax-h3_Singularity
- Workflow de ComfyUI incluido: https://huggingface.co/jsm0661/MiniMax-H3-DenoMix/blob/main/workflows/Deno_MiniMax_H3_R2V_Turbo_8plus2.json
- Licencia: https://huggingface.co/jsm0661/MiniMax-H3-DenoMix/blob/main/LICENSE
- Aviso (NOTICE): https://huggingface.co/jsm0661/MiniMax-H3-DenoMix/blob/main/NOTICE
