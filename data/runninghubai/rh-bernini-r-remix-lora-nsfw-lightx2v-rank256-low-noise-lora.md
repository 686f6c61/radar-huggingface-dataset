# RunningHubAI/rh-bernini-r-remix-lora-nsfw-lightx2v-rank256-low-noise-lora

## Resumen

`rh-bernini-r-remix-lora-nsfw-lightx2v-rank256-low-noise-lora` es un adaptador LoRA publicado por RunningHubAI para el modelo de edición y generación de vídeo Bernini, afinado a partir de WAN2.2 en su variante LowNoise. No se trata de un modelo de lenguaje ni de un transformer multimodal de texto, sino de un conjunto de pesos auxiliares (3,7 GB en formato safetensors, precisión bf16) que se cargan sobre el modelo base para modificar su comportamiento de muestreo y de renderizado de iluminación. El autor lo presenta como una aceleración específica que reduce los tiempos de generación y corrige defectos visuales del Bernini original, como el parpadeo entre fotogramas, el desenfoque y la dominante grisácea en la iluminación.

El adaptador está etiquetado como `lora`, `comfyui` y `not-for-all-anchored-audiences`, y su nombre incluye la marca `nsfw`, por lo que su uso previsto se orienta a contenido para adultos. El rango declarado es 256 (`rank256`) y está pensado para ejecutarse junto a una cuantización int8 del modelo base, según indica la model card. La información pública es muy escasa: no hay pipeline declarado, ni licencia explícita, ni idiomas soportados, ni resultados de benchmarks, y el repositorio no registra descargas ni valoraciones en el momento de la consulta.

Por su naturaleza, esta ficha debe leerse como una ficha de adaptador y no de modelo fundacional: las especificaciones del modelo base (Bernini/WAN2.2) no se detallan en la información disponible, y varios apartados quedan marcados como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre modelo de vídeo Bernini, afinado desde WAN2.2 (LowNoise); arquitectura del modelo base no disponible |
| Parametros totales | no disponible (adaptador LoRA; rango 256 declarado en el nombre) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible para el adaptador; la model card indica compatibilidad con el modelo base cuantizado a int8 |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card remite a la licencia del proyecto original o upstream) |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El artefacto es un LoRA de rango 256 en precisión bf16, con un único archivo de pesos de 3526 MiB (`Bernini-R_Remix_LoRA_NSFW_lightx2v_rank256_bf16_low_noise_v1.0.safetensors`). Se aplica sobre el modelo Bernini en su variante LowNoise, que a su vez deriva de WAN2.2. El nombre incluye `lightx2v`, lo que sugiere integración con el ecosistema de inferencia LightX2V, aunque la información disponible no detalla el pipeline exacto de entrenamiento.

La model card afirma que el adaptador optimiza la lógica de muestreo y el mecanismo de renderizado de iluminación, y que está adaptado para ejecutarse con el modelo base cuantizado a int8. No se especifican el número de pasos de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni otras innovaciones técnicas. Tampoco se documentan datos de entrenamiento ni metodología de evaluación.

## Capacidades

- Generación de vídeo a partir de imagen (image-to-video) sobre el modelo base Bernini.
- Continuación de vídeo (video continuation) y extensión de secuencias existentes.
- Sustitución de personajes (character replacement) en vídeo.
- Transferencia de movimiento (motion transfer) entre clips.
- Redibujado de estilo de escena (scene style redrawing).
- Aceleración de la generación respecto al Bernini original, según el autor, con mejora de textura visual, transiciones de iluminación y coherencia dinámica.
- Corrección de artefactos descritos por el autor: tartamudeo, fotogramas borrosos y dominante grisácea en la iluminación.
- Compatibilidad declarada con el modelo base cuantizado a int8.
- No se documentan capacidades de texto, código, matemáticas, tool calling, agentes ni multilingüismo, por tratarse de un adaptador de vídeo.

## Casos de uso

- Postproducción de vídeo para creadores: aplicar el LoRA sobre Bernini en ComfyUI para acelerar el renderizado de clips cortos y reducir tiempos de iteración en edición de vídeo.
- Creación de vídeo corto para redes: generar o extender clips a partir de una imagen de referencia con coherencia temporal, aprovechando la mejora declarada en transiciones de iluminación.
- Transferencia de movimiento en animación: reutilizar el movimiento de un clip de referencia sobre un personaje nuevo, útil en prototipado de animaciones.
- Sustitución de personajes en secuencias existentes: reemplazar un actor por otro manteniendo la escena, en flujos de previsualización.
- Redibujado de estilo de escena: reestilizar un vídeo base con una estética distinta manteniendo la estructura temporal.
- Investigación técnica sobre LoRAs de aceleración en modelos de vídeo: estudiar el efecto del rango 256 y de la variante LowNoise sobre la calidad y la velocidad de muestreo.
- Contenido para adultos: el nombre y la etiqueta `nsfw` indican ese uso previsto, sujeto a las restricciones legales y de licencia aplicables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo incluye afirmaciones cualitativas del autor sobre mayor velocidad de generación y mejor calidad visual, sin métricas, sin comparativas numéricas y sin protocolo de evaluación.

## Requisitos de hardware

- VRAM estimada para el adaptador: los pesos ocupan unos 3,7 GB en bf16; el requisito real depende del modelo base Bernini/WAN2.2 y de su cuantización (int8 según la model card).
- GPU recomendadas: no disponible en la información proporcionada; por el tamaño del modelo base de vídeo, es previsible que requiera GPU de gama alta, pero no se confirma.
- ¿Cabe en GPU de consumo? No disponible; depende del modelo base y de la resolución y duración del vídeo.
- Opciones de despliegue: ComfyUI (declarado), plataforma RunningHub y, por el nombre del archivo, ecosistema LightX2V. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de vídeo de este tipo.
- Latencia y throughput: no disponibles; la model card afirma una aceleración sustancial respecto al Bernini original, sin cifras.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros adaptadores LoRA comparables para Bernini ni datos de rendimiento que permitan una comparación rigurosa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Contenido NSFW: el adaptador está orientado a contenido para adultos; su uso debe cumplir la legislación local y las políticas de la plataforma.
- Licencia no especificada: la model card remite a la licencia del proyecto original o upstream; antes de un uso comercial es necesario verificar la licencia de Bernini/WAN2.2 y del propio LoRA.
- Dependencia del modelo base: no funciona de forma autónoma; requiere Bernini (variante LowNoise) y, según el autor, está optimizado para la versión cuantizada a int8.
- Ausencia de benchmarks: las mejoras de velocidad y calidad son afirmaciones del autor sin verificación independiente.
- Riesgo de artefactos y alucinación visual: como todo modelo generativo de vídeo, puede producir inconsistencias temporales, deformaciones anatómicas y errores de física; el LoRA mitiga algunos defectos descritos, pero no los elimina necesariamente.
- Documentación mínima: sin pipeline, sin idiomas, sin datos de entrenamiento ni evaluación; dificulta la reproducibilidad.
- Sesgos: no documentados; los modelos de vídeo entrenados con datos web pueden reproducir sesgos de representación y estereotipos.
- Repositorio sin tracción: cero descargas y cero likes en el momento de la consulta, lo que limita la validación por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-bernini-r-remix-lora-nsfw-lightx2v-rank256-low-noise-lora
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2079088827872063490
- Página del autor: https://www.runninghub.ai/user-center/1986370833360760833
- RunningHub (internacional): https://www.runninghub.ai
- RunningHub (China): https://www.runninghub.cn
- Documentación de la API (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
