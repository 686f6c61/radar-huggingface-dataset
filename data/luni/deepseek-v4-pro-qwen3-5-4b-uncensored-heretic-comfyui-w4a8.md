# Luni/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic-ComfyUI-W4A8

## Resumen

Luni/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic-ComfyUI-W4A8 es un artefacto de pesos cuantizados publicado por el usuario Luni en Hugging Face. No se trata de un modelo entrenado desde cero, sino de una conversión del modelo base xtools-at/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic a un unico fichero compatible de forma nativa con ComfyUI, en el mismo formato que los ficheros W4A8 que distribuye Comfy-Org para modelos Qwen 3.5.

El interes de esta publicacion es operativo: empaqueta un modelo de aproximadamente 4.000 millones de parametros en un solo safetensors con cuantizacion mixta (capas de lenguaje en int4 con escalas fp8 por grupo, embeddings atados en int8 y torre de vision junto con la cabeza MTP en bf16), de modo que pueda cargarse directamente en el nodo Load CLIP de ComfyUI para tareas de generacion de texto y mejora de prompts.

La relevancia es limitada y muy especifica: el repositorio no incluye documentacion sobre datos de entrenamiento, idiomas, benchmarks ni evaluaciones de seguridad, y su uso previsto declarado es como potenciador de prompts dentro de ComfyUI. Cualquier evaluacion de capacidades debe remitirse al modelo base, cuyas caracteristicas completas no estan disponibles en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base derivado de Qwen 3.5; incluye torre de vision y cabeza MTP) |
| Parametros totales | aproximadamente 4B (segun el nombre del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4A8: capas de lenguaje int4 con escalas fp8 por grupo de 16 (convrot 256); embeddings atados int8 convrot; torre de vision y cabeza MTP en bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (fichero unico nativo de ComfyUI) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base mas alla de las etiquetas del repositorio, que lo asocian a la familia Qwen 3.5 y mencionan la presencia de una torre de vision y una cabeza MTP (multi-token prediction). La publicacion de Luni no entrena el modelo: unicamente aplica un esquema de cuantizacion mixta sobre los pesos del modelo base xtools-at/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic.

El esquema de cuantizacion es el elemento tecnico destacable: las capas de lenguaje se almacenan en int4 con escalas fp8 agrupadas de 16 en 16 y rotacion convolucional de 256 (convrot), los embeddings atados pasan a int8 con la misma rotacion, y tanto la torre de vision como la cabeza MTP se mantienen en bf16 para preservar su precision. Segun la model card, la decodificacion especulativa mediante MTP funciona con la opcion `mtp: auto`. No hay datos sobre tokens de entrenamiento, composicion del dataset ni etapas de RLHF o DPO.

## Capacidades

- Generacion de texto y mejora de prompts dentro de ComfyUI, uso previsto declarado por el autor.
- Decodificacion especulativa con MTP habilitable mediante `mtp: auto`.
- Procesamiento de vision presumiblemente heredado del modelo base, ya que la torre de vision se conserva en bf16; no confirmado en la informacion disponible.
- Soporte de tool calling, agentes, razonamiento multi-paso, matematicas o codigo: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible.
- El nombre del modelo base incluye la etiqueta "UNCENSORED", lo que sugiere un ajuste orientado a reducir rechazos, pero no se documenta el alcance ni el metodo.

## Casos de uso

- Mejora de prompts en ComfyUI: el modelo se carga con el nodo Load CLIP y se usa en Generate Text para reescribir o expandir prompts antes de pasarlos a un modelo de difusion; el formato W4A8 reduce el peso en disco y en VRAM frente a bf16.
- Generacion de texto auxiliar en flujos de trabajo de imagen: descripciones, variaciones semanticas de prompts y metadatos dentro del mismo grafo de ComfyUI, sin salir de la aplicacion.
- Prototipado rapido de pipelines texto-imagen: al ser un unico fichero en `models/text_encoders/`, se integra en plantillas existentes de Comfy-Org sin conversion adicional.
- Experimentacion con decodificacion especulativa: la cabeza MTP en bf16 permite probar `mtp: auto` para medir aceleracion en generacion de texto dentro de ComfyUI.
- Entornos con VRAM ajustada: la cuantizacion int4 de las capas de lenguaje permite ejecutar un modelo de aproximadamente 4B en GPUs de consumo, aunque la VRAM concreta no esta documentada.
- Evaluacion comparativa de cuantizaciones: util para medir la degradacion de calidad de W4A8 frente al modelo base en tareas de generacion de prompts.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia aritmetica, 4B parametros en int4 suponen unos 2 GB para las capas de lenguaje, mas embeddings int8 y torre de vision y cabeza MTP en bf16, lo que situa el total por debajo de los 4-5 GB en el mejor caso; es una estimacion, no un dato del autor.
- GPU recomendadas: no disponible en la informacion proporcionada.
- GPU de consumo: presumiblemente ejecutable en tarjetas con 8 GB o mas de VRAM, aunque no esta confirmado por el autor.
- Despliegue: uso previsto en ComfyUI (nodo Load CLIP, ruta `ComfyUI/models/text_encoders/`). Compatibilidad con vLLM, llama.cpp, Ollama o TGI no disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| Este modelo (Luni W4A8) | ~4B | no disponible | W4A8 mixta | Apache 2.0 | safetensors ComfyUI |
| xtools-at/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic | ~4B | no disponible | bf16 (presumible) | no disponible | safetensors |
| qwen3.5_9b_w4a8_gptq (Comfy-Org) | 9B | no disponible | W4A8 GPTQ | no disponible | safetensors ComfyUI |

La comparacion se limita a parametros, formato y licencia porque no hay datos publicados de rendimiento ni de contexto para ninguno de los tres. El modelo de Comfy-Org citado en la model card duplica aproximadamente el numero de parametros y emplea GPTQ en lugar del esquema mixto de esta publicacion.

## Limitaciones y advertencias

- La cuantizacion W4A8 introduce perdida de precision frente al modelo base; no se han publicado evaluaciones de la degradacion resultante.
- El modelo base lleva la etiqueta "UNCENSORED" y no se documenta que filtros de seguridad conserva; no es adecuado para produccion orientada al publico sin una capa de moderacion propia.
- No hay informacion sobre sesgos, idiomas soportados ni tasas de alucinacion.
- El uso previsto declarado es como potenciador de prompts en ComfyUI; emplearlo como modelo conversacional general no esta validado por el autor.
- La licencia Apache 2.0 se declara en el repositorio, pero el modelo base no especifica licencia en la informacion disponible; conviene verificar la cadena de licencias antes de un uso comercial.
- El repositorio tiene cero descargas y cero likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.
- La compatibilidad con runtimes distintos de ComfyUI no esta confirmada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Luni/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic-ComfyUI-W4A8
- Modelo base: https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic
- ComfyUI: https://github.com/comfyanonymous/ComfyUI
- Los resultados de busqueda web no aportan enlaces tecnicos relevantes sobre este modelo.
