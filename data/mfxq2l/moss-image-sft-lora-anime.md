# mfxq2l/MOSS-Image-SFT-lora-Anime

## Resumen

MOSS-Image-SFT-lora-Anime es un adaptador LoRA para el modelo base MOSS-Image-SFT, desarrollado por el usuario mfxq2l y publicado en Hugging Face bajo licencia Apache 2.0. Su función es desplazar el estilo de generación de imágenes del modelo base hacia una estética anime / 2D / ilustración japonesa, manteniendo la comprensión semántica y la capacidad de composición originales de MOSS-Image-SFT. Está pensado para integrarse en flujos de trabajo de ComfyUI mediante el nodo Load LoRA.

El adaptador se entrenó sobre 2.000 ilustraciones anime / 2D seleccionadas manualmente durante 10.000 pasos, guardando un checkpoint cada 1.000 pasos (10 checkpoints en total). Esta estrategia permite al usuario elegir el punto de control cuyo equilibrio entre intensidad de estilo y generalización se ajuste mejor a su caso, recomendándose el rango de 6.000 a 8.000 pasos como punto de partida.

El modelo base MOSS-Image es un modelo de difusión de aproximadamente 5B parámetros desarrollado por OpenMOSS, según el repositorio oficial en GitHub. El LoRA se distribuye en formato safetensors, con un tamaño de repositorio de 0,8 GB, e incluye un trigger word genérico (`<trigger>`) que debe sustituirse por el valor real configurado durante el entrenamiento, si existió.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre modelo de difusión MOSS-Image-SFT |
| Parametros totales | no disponible (el LoRA se distribuye como adaptador; el base MOSS-Image es de ~5B según el repositorio oficial) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de generación de imágenes, no de texto) |
| Tipos de cuantizacion | no disponible (formato safetensors; la cuantización dependerá del modelo base y del runtime) |
| Idiomas soportados | no disponible (los prompts de ejemplo están en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El LoRA se entrena sobre el modelo de difusión MOSS-Image-SFT, un modelo de aproximadamente 5B parámetros según el repositorio oficial de OpenMOSS. El adaptador modifica las capas del modelo base mediante descomposición de bajo rango, de forma que el modelo aprende un desplazamiento de estilo sin reentrenar los pesos completos. El entrenamiento se realizó sobre 2.000 ilustraciones anime / 2D seleccionadas manualmente, cubriendo variedad de personajes, composiciones, condiciones de iluminación y estilos artísticos, durante 10.000 pasos.

La estrategia de checkpoints (uno cada 1.000 pasos, 10 en total) permite comparar la intensidad del estilo y la generalización en distintos puntos del entrenamiento. Según la model card, los checkpoints de 9.000 a 10.000 pasos presentan el estilo más fuerte pero pueden mostrar sobreajuste o composiciones repetitivas, mientras que los de 1.000 a 2.000 pasos apenas se desvían del modelo base. El objetivo declarado es desplazar la salida hacia el estilo anime preservando la comprensión semántica y la composición del MOSS-Image-SFT original. No se especifican en la información disponible detalles sobre el optimizador, la tasa de aprendizaje, el rango del LoRA ni la composición exacta del dataset más allá del número de imágenes.

## Capacidades

- Generación de imágenes en estilo anime / 2D / ilustración japonesa a partir de prompts de texto, sobre el modelo base MOSS-Image-SFT.
- Control de la intensidad del estilo mediante el peso del LoRA (`strength_model` y `strength_clip`, con valores recomendados de 0,7 a 0,9) y la selección del checkpoint.
- Soporte de prompts mixtos de lenguaje natural y palabras clave, con énfasis en detalles de personaje (pelo, ojos, ropa, pose, iluminación).
- Integración con flujos de ComfyUI mediante el nodo Load LoRA, tanto en configuraciones con Load Checkpoint como con cargadores separados (UNETLoader + CLIPLoader + VAELoader).
- Compatibilidad con prompts negativos para mitigar baja calidad, anatomía incorrecta, marcas de agua y texto.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni multimodalidad de entrada; se trata de un adaptador de generación de imágenes.

## Casos de uso

- Ilustración de personajes anime para proyectos personales o indie: el LoRA permite generar retratos y escenas con estética 2D coherente usando prompts detallados de personaje (pelo, ojos, vestimenta, expresión), seleccionando el checkpoint de 6.000 a 8.000 pasos para un equilibrio estable entre estilo y generalización.
- Creación de fondos y escenarios escolares o cotidianos: los prompts de ejemplo (aula con cerezos en flor, dormitorio con iluminación cálida) muestran que el adaptador puede generar escenas ambientales con fondos detallados, útil para ilustración de novelas ligeras o cómics amateur.
- Prototipado rápido de conceptos visuales en estudios pequeños: al integrarse en ComfyUI, el equipo puede iterar sobre variantes de estilo cambiando el checkpoint y el peso del LoRA sin reentrenar el modelo base, reduciendo el coste de exploración artística.
- Generación de arte para juegos indie con estética anime: el LoRA permite producir ilustraciones de personajes y escenarios con un estilo consistente, aunque la consistencia de personajes concretos depende del prompt y de la capacidad del modelo base, según advierte la model card.
- Experimentación en investigación sobre adaptadores de estilo: el conjunto de 10 checkpoints con distintos grados de sobreajuste constituye un material útil para estudiar el equilibrio entre fidelidad de estilo y generalización en LoRA sobre modelos de difusión.
- Flujos de trabajo de stylization en producción creativa: con pesos de 0,7 a 0,9 y checkpoints tempranos (1.000 a 4.000 pasos) se puede aplicar una estilización ligera que preserve en mayor medida el comportamiento del modelo base, útil cuando se quiere un toque anime sin dominar la composición.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El LoRA en sí ocupa 0,8 GB en el repositorio (10 checkpoints en safetensors), por lo que el requisito de VRAM viene determinado principalmente por el modelo base MOSS-Image-SFT (~5B parámetros), no por el adaptador.
- VRAM estimada para inferencia: no disponible en la información proporcionada; dependerá de la cuantización y del runtime empleado con el modelo base.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible; depende de si el modelo base cabe en la VRAM de la GPU concreta.
- Opciones de despliegue: ComfyUI (entorno objetivo declarado), con nodo Load LoRA; también cabría su uso en otros runtimes compatibles con safetensors y LoRA, aunque no se documenta explícitamente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Contexto / resolución | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MOSS-Image-SFT-lora-Anime (mfxq2l) | LoRA de estilo anime | MOSS-Image-SFT | no disponible | Apache 2.0 | Hugging Face |
| MOSS-Image Turbo LoRAs (Lodestones) | LoRA para MOSS-Image | MOSS-Image-SFT | no disponible | no disponible | TensorHub Art |
| MOSS-Image-SFT-8-steps-dmd (lodestones) | Destilación DMD de 8 pasos con adaptadores LoRA | MOSS-Image-SFT | no disponible | no disponible | GitHub / Hugging Face (según referencia) |

La información disponible no permite comparar rendimiento numérico entre estas alternativas; solo se confirma que comparten el mismo modelo base MOSS-Image-SFT.

## Limitaciones y advertencias

- No se garantiza la consistencia de personajes o IPs concretas; depende de los prompts y de la capacidad del modelo base.
- El soporte para estilos no objetivo como fotorrealismo, 3D o renderizado de pintura gruesa es limitado según la model card (texto truncado en la información disponible).
- Los checkpoints de 9.000 a 10.000 pasos pueden presentar sobreajuste, composiciones repetitivas o convergencia de estilo; se recomienda empezar por 6.000 a 8.000 pasos.
- El trigger word `<trigger>` es un marcador genérico; si no se configuró uno real durante el entrenamiento, debe omitirse y controlar el estilo mediante el peso del LoRA.
- Riesgo de sobrexposición, trazos duros o composiciones rotas si el peso del LoRA es demasiado alto; se recomienda bajarlo antes de cambiar de checkpoint.
- No se documentan sesgos específicos, riesgos de alucinación visual ni limitaciones idiomáticas en la información disponible.
- Licencia Apache 2.0: permite uso comercial, pero debe verificarse la licencia y condiciones del modelo base MOSS-Image-SFT para producción.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que sugiere escasa validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/mfxq2l/MOSS-Image-SFT-lora-Anime
- Repositorio oficial de MOSS-Image (OpenMOSS): https://github.com/OpenMOSS/MOSS-Image
- MOSS-Image Turbo LoRAs (Lodestones) en TensorHub Art: https://tensorhub.art/models/1057497979855885653
