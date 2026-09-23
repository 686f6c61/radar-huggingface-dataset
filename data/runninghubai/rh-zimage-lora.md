# RunningHubAI/rh-zimage-lora

## Resumen

rh-zimage-lora es un adaptador LoRA de generación de imágenes a partir de texto (text-to-image) publicado en Hugging Face por RunningHubAI en nombre del autor identificado en la model card como RunningHub-@粉色大床. No se trata de un modelo completo, sino de un ajuste fino de bajo rango que se aplica sobre el modelo base Z-Image-Turbo, según declara explícitamente la propia model card. El repositorio contiene un único fichero de pesos, `Z_Image_极品身材2.0.safetensors`, de 162 MiB, y ocupa 0,2 GB en total.

El propósito declarado del adaptador gira en torno al concepto de figura o complexión corporal (la model card incluye únicamente el término chino «身材» como descripción), por lo que se orienta a modificar la representación del cuerpo humano en imágenes generadas con el modelo base. Está pensado para cargarse en ComfyUI, en la plataforma RunningHub o directamente desde Hugging Face, y se distribuye con la etiqueta de pipeline `text-to-image`.

La información pública disponible es muy limitada: no se especifica licencia, idiomas, tipos de cuantización, composición del dataset de entrenamiento ni resultados de benchmarks. El repositorio registra 0 descargas y 0 «likes» en el momento de la consulta, y su ficha se creó y actualizó el 23 de septiembre de 2026. Es relevante ahora como ejemplo del flujo de publicación de adaptadores LoRA de terceros dentro del ecosistema de RunningHub y como pieza reutilizable por quienes ya trabajen con Z-Image-Turbo en ComfyUI.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA de bajo rango sobre un modelo de difusión text-to-image; modelo base declarado: Z-Image-Turbo (no se detalla la arquitectura interna del base) |
| Parámetros totales | no disponible (el repositorio solo contiene el adaptador; el fichero de pesos ocupa 162 MiB) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (generación de imágenes; el límite práctico es la longitud del prompt, no documentada) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica que RunningHub publica en nombre del autor, que los derechos permanecen en el autor y que debe seguirse la licencia del proyecto original o del upstream) |
| Formato de pesos | safetensors |
| Modelo base | Z-Image-Turbo |
| Fichero de pesos | `Z_Image_极品身材2.0.safetensors` (162 MiB) |
| Tamaño del repositorio | 0,2 GB |
| Pipeline | text-to-image |
| Plataformas compatibles | ComfyUI, RunningHub, Hugging Face |
| Fecha de publicación | 23 de septiembre de 2026 (creación y última actualización el mismo día) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No se dispone de información técnica sobre la arquitectura del adaptador más allá de su naturaleza: se trata de un LoRA (Low-Rank Adaptation), es decir, un conjunto de matrices de bajo rango que se inyectan en las capas del modelo base para modificar su comportamiento sin reentrenar los pesos originales. El modelo base declarado es Z-Image-Turbo, y el adaptador se distribuye en un único fichero safetensors de 162 MiB. La model card no especifica en qué capas se aplica el adaptador, ni el rango, ni el alpha, ni la escala recomendada de aplicación.

Tampoco se documenta el proceso de entrenamiento: no hay número de pasos, tamaño o composición del dataset, resolución de entrenamiento, uso de regularización, ni si hubo ajuste por preferencias o filtrado posterior. La model card únicamente remite a la plataforma de entrenamiento de RunningHub como vía para reproducir o entrenar modelos similares, y no incluye información sobre la procedencia ni el consentimiento de las imágenes empleadas.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image) cuando se combina con el modelo base Z-Image-Turbo.
- Modificación de la representación de la figura o complexión corporal en las imágenes generadas, según el propósito declarado en la model card («身材»).
- Carga directa en flujos de trabajo de ComfyUI como adaptador LoRA.
- Ejecución en la plataforma RunningHub, tanto mediante su interfaz como a través de su API.
- Distribución en Hugging Face para descarga e integración local.
- Soporte de tool calling / function calling: no aplica (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingües: no disponible (la model card publica versiones en inglés y chino del README, lo que no implica idiomas soportados por el modelo).
- Capacidades especiales (modo thinking, visión, audio, etc.): no disponible.

## Casos de uso

- Retratos de cuerpo completo en ComfyUI: el adaptador se carga sobre Z-Image-Turbo en un flujo de trabajo estándar de text-to-image para variar la complexión de las figuras generadas sin reentrenar el modelo base, lo que reduce el coste frente a un ajuste fino completo.
- Preproducción de ilustración y cómic: generación rápida de bocetos de personajes con proporciones corporales consistentes antes de pasar al render final, aprovechando que el adaptador pesa solo 162 MiB y puede activarse y desactivarse en el mismo grafo.
- Automatización vía API de RunningHub: integración del adaptador en pipelines programáticos de generación de imágenes en lote para catálogos o pruebas A/B de estilo, usando los endpoints documentados por la plataforma.
- Comparación controlada de adaptadores: al ser un fichero LoRA independiente, permite medir el efecto de activarlo y desactivarlo manteniendo constante la semilla, el prompt y el modelo base, lo que resulta útil para evaluaciones internas de consistencia.
- Investigación sobre representación corporal en modelos de difusión: uso del adaptador como objeto de estudio para analizar cómo los ajustes de bajo rango desplazan la distribución de proporciones y morfologías generadas.
- Experimentación con apilado de LoRA: prueba de combinación con otros adaptadores del mismo modelo base en ComfyUI para explorar mezclas de estilo, asumiendo el riesgo de interferencias entre adaptadores no documentadas por el autor.
- Aprendizaje y reproducción de flujos: uso del repositorio como ejemplo mínimo de publicación de un LoRA de terceros dentro del ecosistema RunningHub, útil para equipos que quieran replicar el formato de entrega (safetensors + model card).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El repositorio contiene únicamente el adaptador: la inferencia requiere además descargar y cargar el modelo base Z-Image-Turbo, cuyos requisitos no se detallan en la información proporcionada.
- Huella adicional del adaptador sobre el modelo base: 162 MiB en disco (dato extraído de la model card); el impacto en VRAM dependerá de cómo lo gestione el cargador de LoRA correspondiente y no está documentado.
- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue declaradas: ComfyUI (local), plataforma RunningHub (incluida su API) y descarga desde Hugging Face.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de datos verificables para establecer una comparativa cuantitativa. El repositorio no publica métricas, y la información proporcionada no incluye otros adaptadores con los que contrastarlo.

| Modelo | Modelo base | Formato | Licencia | Datos de rendimiento |
|---|---|---|---|---|
| rh-zimage-lora | Z-Image-Turbo | safetensors (LoRA, 162 MiB) | no disponible | no disponible |
| Otros LoRA de la familia Z-Image-Turbo | Z-Image-Turbo | safetensors (LoRA, presumiblemente) | no disponible | no disponible |
| LoRA para modelos de difusión de otras familias (SDXL, FLUX.1, etc.) | Distintos modelos base | safetensors (LoRA) | no disponible | no comparables directamente al usar un modelo base distinto |

La única comparación posible con la información disponible es formal: se trata de un LoRA de 162 MiB sobre Z-Image-Turbo, mientras que los adaptadores de otras familias se entrenan sobre bases distintas y no son intercambiables ni medibles con la misma vara sin una evaluación propia.

## Limitaciones y advertencias

- Licencia no especificada: el repositorio no incluye un identificador de licencia y la model card solo indica que los derechos permanecen en el autor y que debe seguirse la licencia del proyecto original o del upstream. No hay confirmación explícita de uso comercial permitido; conviene aclararlo con el autor antes de integrarlo en producción.
- Ausencia total de documentación de entrenamiento: no se conocen dataset, número de pasos, resolución ni procedencia de las imágenes, lo que impide evaluar riesgos de sesgo, sobreajuste o reproducción de material con derechos.
- Riesgo de sobreajuste al prompt: al ser un LoRA no documentado, no puede descartarse que el efecto deseado solo aparezca con formulaciones de prompt muy concretas o con una escala de aplicación determinada.
- Sesgos potenciales: el adaptador está orientado a modificar la representación de la figura corporal, lo que puede reforzar cánones estéticos concretos y producir representaciones corporales poco diversas o poco realistas.
- Contenido sensible: al tratarse de un ajuste centrado en el cuerpo humano, su uso en combinación con prompts inadecuados puede generar contenido no apto; se recomienda aplicar filtros y políticas de uso en cualquier despliegue público.
- Dependencia del modelo base: sin Z-Image-Turbo el fichero es inutilizable, y los cambios de versión o de licencia del modelo base afectan directamente a este adaptador.
- Idiomas y contexto: no disponible; no hay información sobre el comportamiento del modelo ante prompts en castellano.
- Adopción nula verificable: 0 descargas y 0 likes en el momento de la consulta, sin issues ni discusiones públicas que permitan contrastar problemas reportados.
- Sin benchmarks: no existen métricas publicadas de calidad, fidelidad al prompt ni consistencia entre semillas, por lo que cualquier evaluación debe realizarse internamente antes de usarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RunningHubAI/rh-zimage-lora
- README en chino: https://huggingface.co/RunningHubAI/rh-zimage-lora/blob/main/README_cn.md
- Proyecto original en RunningHub: https://www.runninghub.cn/model/public/2047588804684419074
- Página del autor: https://www.runninghub.cn/user-center/1967852892927438850
- RunningHub (sitio internacional): https://www.runninghub.ai
- RunningHub (sitio para China): https://www.runninghub.cn
- Documentación de la API (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- Detalle de API de Seedance 2.5: https://www.runninghub.ai/call-api/api-detail/2133100000000700025
