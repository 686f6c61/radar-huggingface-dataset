# RunningHubAI/rh-qingxiao2750-lora

## Resumen

rh-qingxiao2750-lora es un adaptador LoRA de text-to-image publicado por RunningHubAI en nombre de un autor de su plataforma. Se trata de un ajuste fino derivado de Z-image-turbo, orientado a la generacion de ilustracion de estilo anime con acabado de pintura gruesa (厚涂漫画/二次元 segun la descripcion del autor). El repositorio contiene un unico archivo de pesos de 162 MiB y esta pensado para cargarse en ComfyUI o en la plataforma RunningHub.

El propio autor califica esta version como un descarte del proceso de entrenamiento, publicado por error en la comunidad. Segun su model card, la version de 2500 pasos ofrece mejor control de color, mayor calidad estetica y una tasa de deformaciones mucho menor que esta de 2750 pasos, y recomienda usar aquella en su lugar. La relevancia practica del modelo es, por tanto, limitada: sirve como referencia de un checkpoint intermedio descartado, no como un adaptador recomendado para produccion.

No se dispone de informacion sobre la licencia, los idiomas de los prompts ni los datos de entrenamiento empleados. El repositorio no registra descargas ni valoraciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre un modelo de difusion text-to-image (base: Z-image-turbo) |
| Parametros totales | no disponible (pesos del adaptador: 162 MiB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen, no de texto) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, precision no documentada) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (RunningHub indica que el copyright permanece con el autor y remite a la licencia del proyecto original) |
| Formato de pesos | safetensors (`qingxiao_000002750.safetensors`, 162 MiB) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de bajo rango aplicado sobre Z-image-turbo, un modelo de difusion para generacion de imagenes a partir de texto. No se especifica el rango del adaptador, las capas objetivo ni la configuracion exacta del entrenamiento. El nombre del archivo (`qingxiao_000002750.safetensors`) indica que se guardo en el paso 2750 del proceso de entrenamiento.

Segun la model card, el autor entrenó al menos tres checkpoints (2500, 2750 y 3000 pasos) y considera que el de 2750 es el peor de ellos: atribuye a causas desconocidas su peor comportamiento en control de color y su mayor tasa de imagenes deformadas respecto al de 2500. No se documentan el dataset, el numero de imagenes, la resolucion de entrenamiento ni si hubo tecnicas adicionales como regularizacion o aumento de datos. La palabra de activacion es `qingxiao`.

## Capacidades

- Generacion de imagenes a partir de prompts de texto en el pipeline text-to-image, mediante la palabra de activacion `qingxiao`.
- Estilizacion orientada a ilustracion anime con acabado de pintura gruesa, segun la descripcion del autor.
- Integracion como nodo LoRA en flujos de ComfyUI y en la plataforma RunningHub.
- Control de color y composicion: el autor senala que estas capacidades son inferiores a las del checkpoint de 2500 pasos.
- No dispone de soporte documentado de tool calling, agentes, razonamiento multi-paso, vision de entrada, audio ni modo de pensamiento, al ser un modelo de generacion de imagen.
- Capacidades multilingues de prompt: no documentadas.

## Casos de uso

- Pruebas comparativas de checkpoints: util para reproducir la comparacion que hace el autor entre los pasos 2500, 2750 y 3000 y verificar empiricamente la degradacion descrita en la model card.
- Investigacion sobre entrenamiento de LoRA: sirve como ejemplo de checkpoint intermedio con sobreajuste o colapso parcial, util para estudiar curvas de entrenamiento en adaptadores de difusion.
- Generacion de ilustracion anime en prototipos: puede emplearse en pruebas de concepto de estilo pictorico dentro de ComfyUI, asumiendo la mayor tasa de deformaciones.
- Evaluacion de pipelines en RunningHub: permite probar la carga de LoRA, la palabra de activacion y el flujo de inferencia de la plataforma antes de migrar al checkpoint recomendado.
- Docencia y demostraciones: ejemplo practico de como un checkpoint descartado se publica y de por que conviene validar cada version antes de desplegarla.
- Archivado y trazabilidad de versiones: conserva el estado intermedio del entrenamiento para auditoria del proceso, aunque no se recomienda su uso en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica valoracion es cualitativa y proviene del autor, que situa este checkpoint por debajo del de 2500 pasos en control de color, calidad estetica y tasa de deformaciones.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma especifica; el adaptador pesa 162 MiB y se suma a los requisitos del modelo base Z-image-turbo, que no se detallan en la informacion proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; depende del modelo base y de la precision de carga.
- Opciones de despliegue: ComfyUI (nodo LoRA), plataforma RunningHub (carga directa y API). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de difusion de imagen en este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-qingxiao2750-lora | LoRA sobre Z-image-turbo | no disponible (adaptador de 162 MiB) | no aplica | no disponible | Hugging Face, RunningHub |
| Checkpoint 2500 pasos del mismo autor (清宵/厚涂漫画/二次元) | LoRA sobre Z-image-turbo | no disponible | no aplica | no disponible | RunningHub (recomendado por el autor) |
| Modelo base Z-image-turbo | Difusion text-to-image | no disponible | no aplica | no disponible | Referenciado como origen del ajuste fino |

No se dispone de datos de rendimiento comparables entre estas variantes; la unica comparacion es la valoracion cualitativa del autor, que prefiere el checkpoint de 2500 pasos.

## Limitaciones y advertencias

- El autor desaconseja explicitamente su uso: lo describe como un descarte del entrenamiento con mayor tasa de deformaciones y peor control de color que la version de 2500 pasos.
- Riesgo elevado de artefactos anatomicos y estructurales en las imagenes generadas, segun la propia model card.
- Licencia no disponible: RunningHub remite a la licencia del proyecto original y mantiene el copyright con el autor, por lo que el uso comercial no esta claro y requiere verificacion previa.
- Idiomas de prompt no documentados; no se puede garantizar un comportamiento correcto con prompts en castellano.
- Sin descargas ni validacion de la comunidad: no hay evidencia externa de calidad ni de reproducibilidad.
- Dependencia total del modelo base Z-image-turbo y de su ecosistema (ComfyUI/RunningHub); no es un modelo autonomo.
- No apto para produccion sin una evaluacion propia y, preferiblemente, sustituyendolo por el checkpoint recomendado por el autor.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/RunningHubAI/rh-qingxiao2750-lora
- Modelo original en RunningHub: https://www.runninghub.cn/model/public/2078076059974725633
- Pagina del autor en RunningHub: https://www.runninghub.cn/user-center/2041073186854146049
- Plataforma RunningHub (internacional): https://www.runninghub.ai
- Plataforma RunningHub (China): https://www.runninghub.cn
- Documentacion de la API (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
