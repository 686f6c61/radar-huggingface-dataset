# RunningHubAI/rh-moss-image-u-lora-comfyui-lora

## Resumen

`rh-moss-image-u-lora-comfyui-lora` es un adaptador LoRA para generación de imágenes publicado por RunningHubAI (autor acreditado en la model card como «Indra 555 (xngc)») en Hugging Face. No se trata de un modelo base, sino de un fichero de pesos de bajo rango (`MOSS-Image-NSFW-Uncensored-LoRA-ComfyUI.safetensors`, 71 MiB) que se aplica sobre un modelo de difusión denominado «moss-image» según el campo `Finetuned from` de la model card. El repositorio se creó y actualizó el 25 de octubre de 2026, ocupa 0,1 GB y no registra descargas ni «likes» en el momento de la consulta.

El propósito declarado es reproducir un estilo visual concreto, activado mediante la palabra clave (trigger word) `moss_xvstyle`, dentro de flujos de trabajo de ComfyUI o de la plataforma RunningHub. La información pública disponible es mínima: no se documentan parámetros totales, rango del LoRA, dataset de entrenamiento, hiperparámetros, licencia concreta ni idiomas de los prompts. La propia model card remite a la licencia del proyecto original y aclara que los derechos permanecen en el autor.

Su relevancia práctica es acotada: sirve como ejemplo de distribución de adaptadores de estilo empaquetados para ComfyUI y como pieza que se puede cargar vía API en RunningHub, pero no dispone de evaluación pública, ni de ficha técnica de entrenamiento, ni de licencia explícita, lo que limita seriamente su uso en producción sin una verificación previa por parte del integrador.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un modelo de generación de imágenes; la model card indica `Finetuned from: moss-image`, sin especificar la arquitectura del modelo base |
| Parametros totales | no disponible (el fichero de pesos ocupa 71 MiB; no se publica el rango ni el número de matrices adaptadas) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; no aplica en el sentido de ventana de tokens (modelo de imagen) |
| Tipos de cuantizacion | no disponible; el repositorio solo distribuye un fichero `.safetensors` (71 MiB), sin variantes GGUF, fp8 ni cuantizaciones alternativas |
| Idiomas soportados | no disponibles; no se documenta el idioma de los prompts |
| Licencia | no disponible; la model card indica «Follow the original project or upstream license» y que los derechos permanecen en el autor |
| Formato de pesos | safetensors (`MOSS-Image-NSFW-Uncensored-LoRA-ComfyUI.safetensors`) |
| Palabra clave de activacion | `moss_xvstyle` |
| Plataformas declaradas | ComfyUI, RunningHub, Hugging Face |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas de un modelo de difusión preentrenado para modificar su comportamiento sin reentrenar todos los pesos. La model card identifica el modelo de partida como «moss-image», pero no detalla si se trata de una arquitectura UNet con encoder de texto tipo CLIP/T5, de un transformer de difusión (DiT) o de un modelo híbrido, ni tampoco el scheduler, la resolución nativa o la versión concreta del checkpoint base.

No hay información pública sobre el dataset de entrenamiento (número de imágenes, resolución, composición, uso de captions automáticos), sobre los hiperparámetros del LoRA (rango, alpha, learning rate, pasos, optimizer) ni sobre si se aplicaron técnicas de regularización o de aumento de datos. Tampoco se documenta ningún proceso de alineación (RLHF, DPO) —poco habitual en modelos de imagen— ni innovaciones técnicas como decodificación especulativa o atención lineal. El nombre del fichero incluye los términos «NSFW» y «Uncensored», lo que sugiere que el ajuste se orientó a contenido para adultos y a reducir el filtrado del modelo base, pero esta inferencia procede únicamente del nombre del fichero y no está confirmada por documentación técnica.

## Capacidades

- Generación de imágenes con un estilo visual específico inducido por el adaptador, activado mediante la palabra clave `moss_xvstyle`.
- Integración en flujos de trabajo de ComfyUI como nodo de carga de LoRA (`Load LoRA` / `LoraLoader`), combinable con checkpoints, VAEs y samplers del modelo base.
- Ejecución remota a través de la plataforma RunningHub y de su API, según los enlaces incluidos en la model card.
- Ajuste de la intensidad del efecto mediante los parámetros `strength_model` y `strength_clip` del nodo LoRA de ComfyUI (comportamiento estándar del formato, no documentado específicamente por el autor).
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, agentes, visión de entrada, audio, modo «thinking» ni soporte multilingüe explícito.
- No se documenta soporte de control estructural (ControlNet, IP-Adapter, inpainting) más allá de lo que permita el modelo base.

## Casos de uso

- Exploración de estilo en ilustración digital: cargar el LoRA en ComfyUI con `strength_model` entre 0,5 y 0,9 sobre el checkpoint «moss-image» para generar variantes de una misma escena con la estética del adaptador y comparar resultados en una hoja de contactos.
- Pruebas de concepto para dirección de arte: generar un lote de 20-50 imágenes con la palabra clave fija y prompts variables para evaluar si el estilo encaja con una campaña antes de invertir en un modelo entrenado a medida.
- Prototipado de assets para videojuegos o cómics: producir borradores de personajes y fondos con el estilo del LoRA y refinarlos después manualmente, aprovechando el bajo peso del adaptador (71 MiB) para iterar rápido entre variantes.
- Automatización por API en RunningHub: encadenar la generación mediante llamadas HTTP para producir imágenes bajo demanda en un pipeline interno, sin necesidad de aprovisionar GPU propia.
- Experimentación académica sobre adaptadores: usar el LoRA como caso de estudio de bajo coste para medir el efecto de un adaptador de estilo sobre un modelo de difusión, dado su reducido tamaño y su formato estándar safetensors.
- Aumento de datos sintéticos con estética controlada: generar imágenes de relleno para pruebas de interfaz o demos donde se requiera coherencia visual y no sea necesario contenido real.
- En todos los casos anteriores debe aplicarse moderación de contenido: el nombre del fichero sugiere orientación NSFW/uncensored, por lo que su uso en productos dirigidos al público exige filtros y revisión adicionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen métricas de FID, CLIP score, similitud estética ni comparaciones cuantitativas con otros adaptadores, y el repositorio no registra descargas ni valoraciones que permitan inferir calidad de forma indirecta.

## Requisitos de hardware

- El adaptador en sí ocupa 71 MiB en disco (0,1 GB de repositorio), por lo que su carga en memoria es marginal frente al modelo base.
- La VRAM necesaria para la inferencia viene determinada por el checkpoint «moss-image» subyacente, cuyo tamaño y requisitos no se documentan: no disponible.
- No se especifican GPU recomendadas ni mínimas. Como referencia genérica de la familia de modelos de difusión, la VRAM vendrá marcada por el checkpoint base y la resolución de generación, no por el LoRA.
- No es posible confirmar si cabe en GPU de consumo (RTX 3060, 4060, 4090) sin conocer el modelo base; no disponible.
- Opciones de despliegue documentadas: ComfyUI (carga del `.safetensors` mediante nodo LoRA) y la plataforma/API de RunningHub. No se mencionan vLLM, TGI, llama.cpp ni Ollama, que además no aplican a un adaptador de difusión de imagen.
- Latencia y throughput: no disponibles. Dependen del checkpoint base, del sampler, del número de pasos y del hardware; el adaptador añade una sobrecarga pequeña pero no cuantificada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| rh-moss-image-u-lora-comfyui-lora | LoRA sobre «moss-image» | no disponible (fichero de 71 MiB) | no aplica | no disponible | no disponible (remite al proyecto original) | Hugging Face, ComfyUI, RunningHub |
| «moss-image» sin adaptador (modelo base citado) | Modelo de difusión de imagen | no disponible | no aplica | no disponible | no disponible | Referenciado en la model card, sin enlace directo |
| Otros LoRA de estilo alojados en RunningHub | LoRA sobre modelos de difusión | no disponible | no aplica | no disponible | habitualmente la del proyecto original | RunningHub, Hugging Face |

No se dispone de datos verificables de alternativas comparables (por ejemplo, adaptadores de estilo para SDXL, FLUX o modelos equivalentes) dentro de la información proporcionada, por lo que la comparación cuantitativa se marca como no disponible.

## Limitaciones y advertencias

- Ausencia total de documentación técnica: no hay información sobre dataset, hiperparámetros, rango del LoRA ni versión exacta del modelo base, lo que impide reproducir el entrenamiento o evaluar su calidad de forma objetiva.
- Licencia no especificada: la model card remite a la licencia del proyecto original y no aclara si se permite uso comercial. Cualquier despliegue en producción requiere contactar con el autor o con RunningHub.
- Nombre del fichero con los términos «NSFW» y «Uncensored»: implica un riesgo alto de generar contenido no apto para todos los públicos y exige filtrado y moderación en cualquier producto expuesto a usuarios.
- Dependencia estricta del checkpoint base «moss-image»: el adaptador no funciona de forma autónoma y su comportamiento puede degradarse si se aplica sobre otras versiones del modelo.
- Riesgo de sobreajuste al estilo: los LoRA de estética suelen reducir la diversidad de las salidas y arrastrar artefactos del dataset de entrenamiento; no hay métricas publicadas que lo cuantifiquen.
- Idiomas de los prompts no documentados: no puede asegurarse un buen comportamiento con prompts en castellano; conviene probar tanto en inglés como en chino antes de fijar un pipeline.
- Sin señales de adopción: 0 descargas y 0 «likes» en el momento de la consulta, sin casos de uso verificados por terceros.
- Fecha de creación y actualización registrada como 25 de octubre de 2026, con apenas un minuto de diferencia entre ambas, lo que sugiere una publicación automatizada sin revisión posterior.
- No hay información sobre sesgos demográficos, estéticos o culturales del dataset de ajuste.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/RunningHubAI/rh-moss-image-u-lora-comfyui-lora
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2114279359050027009
- Página del autor: https://www.runninghub.ai/user-center/2103381340268142594
- Plataforma RunningHub (internacional): https://www.runninghub.ai
- Plataforma RunningHub (China): https://www.runninghub.cn
- Documentación de la API (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- README en chino: https://huggingface.co/RunningHubAI/rh-moss-image-u-lora-comfyui-lora/blob/main/README_cn.md
- Paper, blog técnico y demo oficial: no disponibles
