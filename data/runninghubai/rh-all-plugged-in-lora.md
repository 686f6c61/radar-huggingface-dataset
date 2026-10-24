# RunningHubAI/rh-all-plugged-in-lora

## Resumen

`rh-all-plugged-in-lora` es un adaptador LoRA de edición de imagen publicado por RunningHubAI en Hugging Face, con el autor acreditado como `RunningHub-@氛围感`. No es un modelo de lenguaje ni un modelo fundacional: es un peso adicional de 218 MiB (`K_gangbanghelper.safetensors`) que se carga sobre un modelo base de difusión identificado en la model card como `krea2`, y cuyo pipeline declarado es `image-text-to-image`. El repositorio ocupa 0,2 GB y contiene únicamente ese fichero de pesos.

El adaptador está pensado para ejecutarse en ComfyUI, en la propia plataforma RunningHub o en Hugging Face, y la model card remite a una ficha pública en RunningHub y a un modelo original alojado en Civitai. No se documentan parámetros totales, rango del LoRA, dataset de entrenamiento, número de pasos ni hyperparámetros, y el repositorio no incluye benchmarks, ejemplos de inferencia ni prompts dentro de la propia ficha (el autor indica explícitamente que las instrucciones de uso están en el enlace externo).

La relevancia de esta ficha es limitada y hay que enmarcarla con honestidad: el repositorio tenía 0 descargas y 0 likes en el momento de la consulta, no declara licencia y el contenido de referencia del autor es de carácter sexual explícito, según la propia model card. Es, por tanto, un adaptador de nicho para experimentación en entornos controlados, no una pieza recomendable para producción sin una revisión legal y de políticas de uso previa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un modelo base de difusión `krea2`; pipeline `image-text-to-image` |
| Parámetros totales | no disponible (el adaptador pesa 218 MiB en un único fichero safetensors; el rango y el número de módulos adaptados no se documentan) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible / no aplica (modelo de imagen; la longitud de prompt la fija el encoder de texto del modelo base) |
| Tipos de cuantización | no disponible (solo se distribuye safetensors; no hay variantes GGUF, FP8 ni NF4 publicadas) |
| Idiomas soportados | no disponible (el idioma de los prompts depende del text encoder del modelo base) |
| Licencia | no disponible; la model card remite a la licencia del proyecto original y deja el copyright en manos del autor |
| Formato de pesos | safetensors (`K_gangbanghelper.safetensors`, 218 MiB) |
| Modelo base declarado | `krea2` (según «Finetuned from» de la model card) |
| Plataformas soportadas | ComfyUI, RunningHub, Hugging Face |
| Tamaño del repositorio | 0,2 GB |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en capas del modelo base para modificar su comportamiento sin reentrenar los pesos completos. La model card indica que se parte de `krea2`, un modelo de difusión para generación y edición de imagen a partir de texto, y clasifica el resultado como «LoRA (image edit)». No se especifica sobre qué componentes del modelo base actúa el adaptador (atención cruzada, atención propia, MLP), ni el rango `r`, ni el `alpha`, ni la resolución de entrenamiento.

No hay información pública en el repositorio sobre el dataset de entrenamiento: no se indica el número de imágenes, su procedencia, el número de pasos, el optimizador, si hubo regularización o captions automáticos. Tampoco aplican técnicas de alineamiento tipo RLHF o DPO, habituales en modelos de lenguaje pero no en adaptadores de difusión de este tipo. El único dato de proceso es que el entrenamiento se realizó en la infraestructura de RunningHub, que la propia plataforma promociona como servicio de entrenamiento.

Como innovación técnica no se documenta ninguna: no hay decodificación especulativa, atención lineal ni variantes arquitectónicas. El interés técnico del artefacto, si lo hay, está en el efecto visual que induce sobre el modelo base, y ese efecto solo puede evaluarse cargándolo en ComfyUI, algo que la ficha no facilita con ejemplos dentro del repositorio.

## Capacidades

- Edición de imagen guiado por texto: el adaptador modifica la salida del modelo base `krea2` en pipelines `image-text-to-image`, según la etiqueta de pipeline declarada.
- Integración con ComfyUI: al ser un safetensors compatible con el ecosistema ComfyUI, se carga como nodo `Load LoRA` sobre el checkpoint base correspondiente.
- Ejecución en plataformas gestionadas: la model card indica compatibilidad con RunningHub (internacional y China) y con Hugging Face, además del flujo local en ComfyUI.
- Aplicación sobre un modelo base concreto: el adaptador está entrenado para `krea2`; su comportamiento sobre otros checkpoints no está documentado y no se garantiza.
- Contenido para adultos: la referencia externa del autor y el nombre del fichero apuntan a un uso orientado a contenido sexual explícito. No se reproduce ni se valida ese material en esta ficha.
- Sin soporte documentado de *tool calling*, agentes, razonamiento multi-paso, visión, audio ni modo *thinking*: no es un modelo de lenguaje y esas categorías no aplican.
- Capacidades multilingües: no disponibles; dependen exclusivamente del text encoder del modelo base.

## Casos de uso

- Prototipado de flujos de edición de imagen en ComfyUI: cargar el LoRA sobre `krea2` para comprobar cómo afecta a la generación y decidir si merece la pena integrarlo en un grafo mayor. Es el uso más directo y el único que la documentación respalda sin ambigüedad.
- Evaluación comparativa de adaptadores: al pesar solo 218 MiB, permite probar la sustitución de un LoRA por otro en un mismo pipeline sin redescargar el modelo base, útil en tareas de *prompt* y *weight tuning*.
- Investigación sobre sobreajuste en LoRAs de nicho: un adaptador con 0 descargas y sin dataset publicado es un caso de estudio sobre cómo la falta de documentación limita la reproducibilidad en la publicación de adaptadores.
- Docencia y formación técnica: ilustrar qué es un LoRA, cómo se carga en ComfyUI y por qué la licencia y la política de contenido son parte del diseño de un pipeline, usando un artefacto real de bajo riesgo técnico (el riesgo aquí es legal y de políticas, no computacional).
- Automatización de pipelines de imagen en entornos con política de contenido laxa y verificación de edad: solo si la organización dispone de marco legal y de aceptación de términos que lo permita; requeriría revisar los ToS de ComfyUI, Hugging Face y RunningHub antes de cualquier despliegue.
- Archivado y auditoría de artefactos: conservar el fichero y su hash para trazar qué adaptadores se han usado en un proyecto, dado que la model card no ofrece ficha técnica ni versión semántica.
- No recomendado: atención al cliente, generación de código, agentes, RAG o cualquier caso de uso de lenguaje. El modelo no tiene ninguna capacidad en esas áreas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye FID, CLIP score, comparativas de calidad visual, tiempos de inferencia ni ejemplos de antes/después. Los resultados de la búsqueda web realizada no contienen ningún dato sobre este modelo: devuelven páginas genéricas sobre ChatGPT y sus clientes, sin relación con `rh-all-plugged-in-lora`, por lo que no se pueden usar como evidencia de rendimiento.

## Requisitos de hardware

- VRAM para el adaptador: el fichero pesa 218 MiB en safetensors, por lo que el incremento de memoria respecto al modelo base es de ese orden (más el estado del optimizador si se reentrena, no documentado).
- VRAM total para inferencia: no disponible. Depende íntegramente del modelo base `krea2`, cuyos requisitos no se detallan en la información proporcionada. Sin ese dato no es posible afirmar si cabe en una GPU de consumo.
- GPU recomendadas: no disponible. No se puede recomendar A100, H100, RTX 4090 ni ninguna otra sin conocer los requisitos del checkpoint base.
- Compatibilidad con GPU de consumo: no verificable con los datos disponibles. El adaptador en sí no es el cuello de botella; el modelo base sí puede serlo.
- Opciones de despliegue: ComfyUI (flujo declarado), RunningHub (local e internacional) y Hugging Face. Para servidores propios, cabría cargarlo con `diffusers`/`peft` si el modelo base está soportado, pero esto no está confirmado por el autor. No hay soporte documentado para vLLM, TGI, llama.cpp ni Ollama, herramientas orientadas a modelos de lenguaje.
- Latencia y throughput: no disponible. No se publican tiempos por imagen ni resolución de generación.

## Comparativa con modelos similares

No hay datos suficientes para una comparativa cuantitativa. La tabla recoge lo que se puede afirmar y marca explícitamente los huecos.

| Modelo | Tipo | Tamaño del adaptador | Modelo base | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `RunningHubAI/rh-all-plugged-in-lora` | LoRA de edición de imagen | 218 MiB | `krea2` | no disponible | Hugging Face, RunningHub |
| `krea2` (modelo base, sin adaptador) | Modelo de difusión texto-imagen | no disponible | no aplica | no disponible en esta información | según el proveedor del modelo base |
| Otros LoRA de RunningHub para `krea2` | LoRA de edición de imagen | no disponible | `krea2` | no disponible | RunningHub |
| LoRA de la familia SDXL / Flux (referencia genérica) | LoRA de edición de imagen | no disponible | SDXL / Flux | variables según autor | Hugging Face, Civitai |

No se dispone de benchmarks ni de especificaciones de los adaptadores alternativos que permitan comparar calidad, fidelidad al *prompt* o consumo de VRAM. Cualquier afirmación de superioridad sería inventada.

## Limitaciones y advertencias

- Licencia no declarada: la model card solo indica que el copyright permanece en el autor y que se siga «la licencia del proyecto original o del upstream». Sin una licencia explícita, no hay base clara para uso comercial; hay que contactar con el autor o con RunningHub antes de cualquier despliegue productivo.
- Contenido sexual explícito: tanto el nombre del fichero como el enlace externo del autor apuntan a material para adultos. Esto puede entrar en conflicto con los términos de servicio de Hugging Face, ComfyUI y plataformas de distribución, y exige verificación de edad y cumplimiento normativo en la UE.
- Ausencia total de documentación técnica: no hay rango del LoRA, hiperparámetros, dataset, *trigger words* ni prompts dentro del repositorio. El autor afirma que las instrucciones están en el enlace externo, lo que rompe la reproducibilidad y la trazabilidad.
- Cero validación comunitaria: 0 descargas y 0 likes implican que no hay evidencia externa de que el adaptador funcione como se espera, ni reportes de fallos.
- Dependencia estricta del modelo base: al estar entrenado sobre `krea2`, cargarlo sobre otro checkpoint puede degradar la salida o no producir efecto alguno; no hay guía de compatibilidad.
- Riesgo de sobreajuste y de artefactos visuales: inherente a adaptadores de bajo rango entrenados con datasets pequeños y no documentados; no se puede acotar sin información de entrenamiento.
- Sin información de sesgos: no hay evaluación de sesgos demográficos, de representación corporal ni de contenido no consentido, algo especialmente relevante en un adaptador orientado a contenido adulto.
- Idiomas no declarados: los prompts pueden fallar en castellano si el text encoder del modelo base está optimizado para inglés; no hay evidencia en ningún sentido.
- Metadatos inconsistentes: las fechas del repositorio (creación y actualización el 23-10-2026) son posteriores a la fecha habitual de consulta, lo que sugiere un posible error de metadatos o una publicación programada. Conviene verificarlo antes de citar el artefacto.
- Riesgo de alucinación: no aplica en el sentido de modelos de lenguaje, pero sí existe riesgo de que el adaptador genere contenido no solicitado o no fiel al *prompt*, sin métricas publicadas que lo cuantifiquen.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-all-plugged-in-lora
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2080640184493174785
- Página del autor en RunningHub: https://www.runninghub.ai/user-center/2041030036219498497
- RunningHub (internacional): https://www.runninghub.ai
- RunningHub (China): https://www.runninghub.cn
- Documentación de la API (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
- Referencia externa citada por el autor (Civitai; contenido para adultos): https://civitai.red/models/2240240/ultimate-gangbang-helper-lets-penetrate-all-holes-filled-mostly-random?modelVersionId=3159235
- README en chino: https://huggingface.co/RunningHubAI/rh-all-plugged-in-lora/blob/main/README_cn.md
