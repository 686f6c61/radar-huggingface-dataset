# Bobby-Joe/MarePussy_MOSS

## Resumen

MarePussy_MOSS es un adaptador LoRA experimental publicado por el usuario Bobby-Joe sobre el modelo base OpenMOSS-Team/MOSS-Image-Base. Se trata de un ajuste fino de bajo rango orientado a la generacion de imagenes fotorrealistas de genitales femeninos equinos, segun declara explicitamente el autor en la model card. No es un modelo de lenguaje ni un modelo fundacional: es un artefacto de personalizacion de un modelo de difusion de imagenes, distribuido en formato safetensors y con un tamano de repositorio de 0,3 GB.

El repositorio incluye dos variantes del adaptador (0.49 epoch 56 y 0.51 epoch 54), ambas descritas por el autor como experimentales y sin evaluacion comparativa concluyente. La model card documenta principalmente el uso de etiquetas de prompt, estados anatomicos, colores y ajustes de muestreo (scheduler er_sde, sampler sgm_uniform, skip layer 22 o 22,26), asi como una limitacion conocida en vistas frontales. No se proporcionan datos sobre el conjunto de entrenamiento, hiperparametros de entrenamiento, numero de pasos, resolucion o composicion del dataset.

La relevancia tecnica de esta ficha es limitada: el modelo no cuenta con descargas ni likes en el momento de la consulta, no declara licencia, no declara idiomas y no publica benchmarks. Su interes radica en documentar un caso de LoRA de dominio muy especifico sobre un modelo de imagen, y en advertir de las implicaciones legales y de moderacion que conlleva su contenido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un modelo de difusion de imagenes; arquitectura del modelo base no disponible |
| Parametros totales | no disponible (adaptador LoRA; el repositorio ocupa 0,3 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (ficheros marepussy_moss-0.49e56.safetensors y marepussy_moss-0.51e54.safetensors) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas del modelo base OpenMOSS-Team/MOSS-Image-Base para modificar su comportamiento generativo sin reentrenar los pesos completos. La model card confirma la relacion `base_model_relation: adapter` y etiqueta el repositorio con `lora` y `MOSS`. No se especifica sobre que modulos del transformer de difusion se aplican las matrices, ni el rango, alpha o dropout empleados.

No hay informacion sobre el numero de imagenes de entrenamiento, la resolucion, el numero de pasos, la tasa de aprendizaje ni si se emplearon tecnicas como captions automaticos o regularizacion. El autor menciona dos checkpoints por epoca (0.49e56 y 0.51e54), lo que sugiere un entrenamiento de aproximadamente 50 epocas con guardados intermedios, pero no se detalla la configuracion. Tampoco se documenta si hubo curacion del dataset o filtrado de contenido.

## Capacidades

- Generacion de imagenes fotorrealistas de anatomia equina femenina, segun la model card.
- Control mediante etiquetas de prompt especificas: `marepussy`, `anus`, `labia`.
- Control de estados anatomicos mediante etiquetas dedicadas: `<l:pursed>` y `<l:exposed-clit>`.
- Control de coloracion mediante etiquetas: `<v:dark>` (gris oscuro) y `<v:light> (rosa palido)`.
- Soporte de descripciones en lenguaje natural para estados intermedios y combinaciones de color (por ejemplo, "labia parted with clitoris slightly visible" o "pale-pink genitalia, pale-pink vulva").
- Control de color y patron de pelaje mediante prefijo `fur` (por ejemplo, "bay fur", "pinto fur").
- Capacidad de composicion macro y close-up segun la model card, con ajustes de aspect ratio (9:16 para recorte cerrado).
- No dispone de tool calling, function calling, razonamiento multi-paso, capacidades de agente, vision, audio ni modo thinking: es un adaptador de generacion de imagen.

## Casos de uso

- Investigacion sobre personalizacion de modelos de difusion: el adaptador sirve como ejemplo de LoRA de dominio estrecho para estudiar como se comporta un ajuste de bajo rango sobre un modelo de imagen cuando el dataset es muy especifico y el autor no documenta la configuracion.
- Estudio de tecnicas de control por etiquetas: la model card describe un sistema de tags con estados (`<l:...>`) y colores (`<v:...>`), util para analizar como se codifican atributos discretos en prompts de difusion.
- Analisis de sesgos y moderacion de contenido: permite examinar los limites de los filtros de seguridad en modelos de imagen y en plataformas de distribucion de adaptadores.
- Evaluacion de pipelines de inferencia con scheduler `er_sde` y sampler `sgm_uniform`: util para comparar configuraciones de muestreo en modelos de difusion con skip layer 22 o 22,26.
- Documentacion de casos de contenido sensible para politicas de comunidad: sirve como referencia para redactar guias sobre que tipo de adaptadores se permiten o se retiran de un repositorio.
- Pruebas de reproducibilidad de LoRA: al haber dos checkpoints (0.49e56 y 0.51e54), permite comparar el efecto de distintas epocas sobre el estilo y la fidelidad anatomica en un mismo prompt.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas cuantitativas (FID, CLIP score, SSIM ni evaluaciones humanas), y el autor indica que las dos versiones son experimentales y que no las ha probado lo suficiente para determinar cual prefiere.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador; depende del modelo base MOSS-Image-Base, cuyas especificaciones no se detallan en la informacion proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; el repositorio del adaptador ocupa 0,3 GB, pero el modelo base requiere recursos adicionales no especificados.
- Opciones de despliegue: no disponible; la model card solo menciona el modelo base MOSS-Image Base y los ajustes de muestreo (`er_sde` + `sgm_uniform`, skip layer 22 o 22,26), sin detallar frameworks (diffusers, ComfyUI, etc.).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada adaptadores LoRA comparables sobre MOSS-Image-Base ni alternativas de la misma categoria con datos verificables de parametros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Contenido sexual explicito con tematica animal: el modelo esta disenado para generar imagenes de genitales equinos, lo que puede infringir las politicas de contenido de plataformas de distribucion y las legislaciones sobre material de abuso animal en distintas jurisdicciones.
- Licencia no declarada: al no especificarse licencia, no se puede asumir permiso para uso comercial, redistribucion ni obras derivadas; el uso queda en un limbo legal.
- Ausencia de documentacion de entrenamiento: no se conocen el dataset, los hiperparametros ni las medidas de curacion, lo que impide evaluar sesgos, calidad o reproducibilidad.
- Limitacion anatomica conocida: el autor advierte que la vulva aparece invertida en vistas frontales o inferiores en lugar de traseras.
- Fiabilidad de las etiquetas: el propio autor indica que algunas etiquetas de estado son "poco fiables" y que el color rosa palido no siempre se consigue.
- Influencia de estilo fuerte: el LoRA impone un estilo realista que puede contaminar imagenes estilizadas; el autor recomienda combinarlo con un LoRA de estilo a 1.5-2.0 y este a 0.7-0.9.
- Cero adopcion verificable: 0 descargas y 0 likes en el momento de la consulta, sin evidencia de validacion por parte de la comunidad.
- Riesgo de moderacion en produccion: cualquier integracion en un pipeline publico requeriria filtros de contenido y revision legal previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Bobby-Joe/MarePussy_MOSS
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-Base
- Checkpoint 0.49 epoch 56: https://huggingface.co/Bobby-Joe/MarePussy_MOSS/blob/main/marepussy_moss-0.49e56.safetensors
- Checkpoint 0.51 epoch 54: https://huggingface.co/Bobby-Joe/MarePussy_MOSS/blob/main/marepussy_moss-0.51e54.safetensors
