# RunningHubAI/rh-kook-zimage-lora

## Resumen

rh-kook-zimage-lora es un adaptador LoRA de generación de imagen a partir de texto (text-to-image) publicado en Hugging Face por RunningHubAI y atribuido al autor KOOK. No se trata de un modelo de lenguaje ni de un modelo de difusión completo, sino de un conjunto de pesos de ajuste fino de bajo rango que se aplican sobre un modelo base identificado en la model card como Z-image-base, del cual se heredan la arquitectura y los requisitos de cómputo.

El repositorio contiene un único fichero de pesos, `Kook_Zimage_瑶光.safetensors`, de 303 MiB (el repositorio completo ocupa 0,3 GB). Está etiquetado para su uso en ComfyUI y en la plataforma RunningHub, e incluye un pipeline declarado de text-to-image. La utilidad práctica del adaptador es modificar el estilo o la estética de las imágenes generadas por el modelo base (en este caso, un estilo asociado al autor y a la estética "瑶光" que da nombre al fichero), sin necesidad de reentrenar el modelo completo.

La relevancia de este tipo de publicación es doble: por un lado, ilustra el flujo actual de distribución de ajustes finos de bajo coste (un fichero de 303 MiB frente a los múltiplos de gigabytes de un modelo base); por otro, presenta carencias documentales notables. La model card no especifica licencia, dataset de entrenamiento, parámetros del adaptador, idiomas de los prompts ni resultados de evaluación, y el repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, por lo que no existe validación por parte de la comunidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (adaptador LoRA sobre el modelo base Z-image-base; la arquitectura del base no se detalla en la información disponible) |
| Parámetros totales | no disponible (el recuento del adaptador no se publica; el fichero de pesos ocupa 303 MiB) |
| Parámetros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable (modelo de difusión text-to-image, no un modelo de lenguaje) |
| Tipos de cuantización | no disponible (se distribuye un único fichero `.safetensors`; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (la model card está en chino e inglés, pero no se especifican idiomas de prompt) |
| Licencia | no disponible ("Follow the original project or upstream license", sin licencia explícita) |
| Formato de pesos | safetensors (`Kook_Zimage_瑶光.safetensors`, 303 MiB) |
| Tipo de modelo | LoRA de text-to-image |
| Modelo base | Z-image-base ("Finetuned from: Z-image-base") |
| Plataformas declaradas | ComfyUI, RunningHub, Hugging Face |
| Autor | KOOK (publicado por RunningHub / RunningHubAI) |
| Fecha de creación en Hugging Face | 2026-09-23 (según metadatos del repositorio) |
| Última actualización en Hugging Face | 2026-09-23 (según metadatos del repositorio) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del adaptador ni la del modelo base. Lo único documentado es que se trata de un LoRA (Low-Rank Adaptation) de tipo text-to-image, ajustado a partir de Z-image-base, y que sus pesos se distribuyen en formato safetensors. Al ser un LoRA, el adaptador se compone de matrices de bajo rango que se inyectan en capas del modelo base durante la inferencia; el modelo base permanece congelado y debe cargarse por separado. No se especifica qué capas se adaptan, el rango (rank) utilizado, ni el factor de escala (alpha) recomendado.

Tampoco se publican datos sobre el proceso de entrenamiento: no hay número de pasos, tamaño o composición del dataset, resolución de entrenamiento, técnica de ajuste (por ejemplo, si se empleó LoRA clásico, LoRA con descomposición tipo LoHa/LoKr, o ajuste de texto inverso), ni uso de refuerzo a partir de retroalimentación humana. La model card únicamente indica que el modelo se puede entrenar y ejecutar en la plataforma RunningHub y enlaza a su página de entrenamiento, sin aportar métricas de calidad, comparativas con el base ni ejemplos de prompts con parámetros de muestreo recomendados.

## Capacidades

- Generación de imágenes a partir de descripciones textuales, mediante la modificación del comportamiento del modelo base Z-image-base.
- Transferencia de estilo o estética: el adaptador está orientado a reproducir un estilo concreto asociado al autor y a la etiqueta "瑶光" del nombre del fichero.
- Integración en flujos de trabajo de ComfyUI como nodo de carga de LoRA dentro de un grafo de generación.
- Ejecución en la nube a través de RunningHub, incluyendo el uso de su API documentada.
- Combinación potencial con otros adaptadores y controles propios del ecosistema de difusión (por ejemplo, ControlNet o IP-Adapter), siempre que el modelo base los soporte; esto no se confirma en la documentación.
- Soporte de tool calling: no aplicable (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no aplicable.
- Capacidades multilingües: no disponibles; no se documentan idiomas de prompt ni calidad por idioma.
- Capacidades especiales (modo "thinking", visión, audio, vídeo): no disponibles.

## Casos de uso

- Generación de retratos e ilustraciones con una estética concreta: el LoRA se aplicaría sobre Z-image-base en ComfyUI para producir imágenes que sigan el estilo del autor, útil para creadores que quieran mantener una línea visual coherente en una serie.
- Producción de material gráfico para redes sociales: generación por lotes de imágenes con una identidad estética fija, aprovechando que el adaptador pesa solo 303 MiB y se puede intercambiar rápidamente dentro de un mismo flujo.
- Pruebas de concepto en diseño de personajes: iteración rápida sobre variantes de un mismo personaje manteniendo el estilo, antes de pasar a producción con herramientas de mayor control.
- Integración en pipelines automatizados mediante API: la model card enlaza a la documentación de la API de RunningHub, lo que permite invocar la generación desde servicios propios sin gestionar la infraestructura de GPU.
- Investigación sobre adaptación de bajo rango: comparar el efecto de este LoRA frente al modelo base permite estudiar cuánto del estilo se captura con un adaptador de 303 MiB y cuánto depende del base.
- Composición con otros LoRA en ComfyUI: uso como capa de estilo dentro de un grafo que combine varios adaptadores, sujeto a la compatibilidad real y al ajuste de pesos relativos (no documentado por el autor).
- Experimentación educativa: ejemplo práctico de cómo se publica y consume un LoRA de difusión en el ecosistema Hugging Face, útil para formación en flujos de trabajo de generación de imagen.
- Catalogación y curación de activos visuales generados: generación de variaciones controladas de un mismo motivo para su uso como banco de imágenes interno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye FID, CLIP score, comparativas con el modelo base, ejemplos con semillas ni parámetros de muestreo, por lo que no es posible cuantificar la mejora o el efecto del adaptador respecto a Z-image-base.

## Requisitos de hardware

- VRAM para el adaptador: el fichero de pesos ocupa 303 MiB en disco; en memoria, el adaptador añade un consumo marginal frente al modelo base.
- VRAM total para inferencia: no disponible. Está determinada casi por completo por Z-image-base, cuyos requisitos no se documentan en la información proporcionada.
- Estimación orientativa (no confirmada por el autor): en flujos de ComfyUI con modelos de difusión de tipo transformer, el rango habitual de trabajo se sitúa entre 8 y 24 GB de VRAM según precisión, resolución de salida y uso de controles adicionales. Esta cifra es una referencia general, no un dato publicado para este modelo.
- GPU recomendadas: no disponible. Cualquier GPU capaz de ejecutar el modelo base Z-image-base servirá; no se indica ninguna lista oficial.
- Compatibilidad con GPU de consumo: no disponible de forma explícita. Depende íntegramente del modelo base y de la cuantización que se aplique a este.
- Opciones de despliegue: ComfyUI (plataforma declarada en las etiquetas y en la model card) y la plataforma RunningHub, incluida su API. El uso con `diffusers` u otras bibliotecas no está documentado.
- Opciones no aplicables: vLLM, llama.cpp, Ollama y TGI están orientados a modelos de lenguaje y no sirven para este adaptador de difusión.
- Latencia y throughput: no disponibles. No se publican tiempos de generación, número de imágenes por segundo ni tamaño de lote recomendado.

## Comparativa con modelos similares

| Modelo | Tipo | Modelo base requerido | Parámetros | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-kook-zimage-lora | LoRA text-to-image | Z-image-base | no disponible (fichero de 303 MiB) | no disponible | Hugging Face y RunningHub |
| LoRA para Flux.1 (familia dev/schnell) | LoRA text-to-image | Flux.1 | no disponible en esta ficha | varía según autor | Hugging Face, ComfyUI |
| LoRA para SDXL | LoRA text-to-image | SDXL | no disponible en esta ficha | varía según autor | Hugging Face, ComfyUI |
| Z-image-base sin adaptador | Modelo de difusión completo | no aplicable | no disponible | no disponible | según el proyecto original |

No se dispone de datos comparativos de rendimiento (FID, CLIP score, preferencia humana) entre este adaptador y alternativas de la misma categoría, ni de cifras de parámetros o contexto para los modelos de la tabla, por lo que la comparación se limita a la categoría, el modelo base requerido y la vía de distribución.

## Limitaciones y advertencias

- Licencia no especificada: la model card remite a "the original project or upstream license" sin concretar términos. El uso comercial queda en situación de incertidumbre legal y requiere contactar con el autor.
- Sin información sobre el dataset de entrenamiento: no se puede evaluar sesgos de representación (género, etnia, edad, contexto cultural) ni el riesgo de reproducir estereotipos del modelo base.
- Riesgo de alucinación visual: como todo modelo de difusión, puede generar anatomías incorrectas, texto ilegible en la imagen, objetos incoherentes o artefactos, especialmente en resoluciones altas o composiciones complejas.
- Riesgo de sobreajuste al estilo: un LoRA de 303 MiB puede reducir la diversidad de las salidas y arrastrar rasgos no deseados del dataset de ajuste, con degradación al combinarlo con otros adaptadores.
- Dependencia total del modelo base: no es un modelo autónomo; sin Z-image-base no funciona, y los cambios en el base pueden romper la compatibilidad de los pesos.
- Idiomas de prompt no documentados: no se garantiza un comportamiento correcto con prompts en castellano; la documentación está en chino e inglés.
- Ausencia de validación comunitaria: 0 descargas y 0 "likes" en el momento de la consulta, sin ejemplos verificables ni comparativas publicadas.
- Contenido promocional en la model card: el README incluye enlaces con códigos de invitación y parámetros de seguimiento, además de enlaces de descarga a servicios de almacenamiento de terceros (Baidu Pan, Quark), no verificados y sin garantías de integridad o licencia.
- Riesgo de uso indebido: la generación de retratos fotorrealistas exige controles de consentimiento y etiquetado de contenido sintético, especialmente en aplicaciones publicadas.
- Sin garantías de mantenimiento: el repositorio no indica versionado, changelog ni soporte técnico.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-kook-zimage-lora
- README en chino (referenciado en la model card): https://huggingface.co/RunningHubAI/rh-kook-zimage-lora/blob/main/README_cn.md
- Proyecto original del modelo: https://www.runninghub.cn/model/public/2033767799276969985
- Página del autor (KOOK): https://www.runninghub.cn/user-center/1932028484909178882
- RunningHub (sitio internacional): https://www.runninghub.ai
- RunningHub (sitio China): https://www.runninghub.cn
- Documentación de la API (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Página de entrenamiento en RunningHub: https://www.runninghub.ai/page-model
- Ejemplo de llamada a la API de Seedance 2.5 (enlace promocional de la model card): https://www.runninghub.ai/call-api/api-detail/2133100000000700025
- Enlaces de descarga de terceros citados en la model card (no verificados): Qwen 2512 https://pan.quark.cn/s/c5bfef2290f4 · Flux2 klein https://pan.quark.cn/s/9e0e695bc675 · Z image https://pan.baidu.com/s/1meNXOFK2RhBVfIa9Bun41g?pwd=8rtm (código: 8rtm) · Z image base https://pan.quark.cn/s/3c10642f442f
- Enlace de invitación con código de referido incluido en la model card: https://www.runninghub.cn/?inviteCode=rh-v1405
