# RunningHubAI/rh-sun-direction-lora-flux-2-klein-9b-v1-lora

## Resumen

rh-sun-direction-lora-flux-2-klein-9b-v1-lora es un adaptador LoRA de generación de imágenes (text-to-image) publicado por RunningHubAI, que actúa como envoltorio de distribución del trabajo del autor original, identificado como RunningHub-@T8star-Aix. No es un modelo base: es un conjunto de pesos de bajo rango (Low-Rank Adaptation) que se aplica sobre Flux2-Klein-9B, un modelo de difusión de la familia Flux 2, para condicionar la dirección de la luz solar en la imagen generada. El único fichero del repositorio es `Sun_direction_LoRA_Flux_2_Klein_9b_v1.safetensors`, de 316 MiB, y el repositorio completo ocupa 0,3 GB.

El problema que resuelve es específico y práctico: en generación de imágenes, la dirección de la iluminación solar es uno de los elementos más difíciles de mantener coherente entre imágenes y de controlar mediante prompt de texto. Este LoRA permite fijar esa dirección tomando como referencia una imagen, algo relevante para flujos de trabajo en los que hay que producir series de imágenes con iluminación consistente (por ejemplo, variaciones de un mismo producto o de un mismo plano), y para pipelines de composición donde la luz generada debe coincidir con la del material real.

El modelo está pensado para ComfyUI, para la plataforma RunningHub y para su uso desde Hugging Face, y su disparador (trigger word) declarado es la frase "match the sun direction from the reference". La ficha pública no documenta arquitectura interna del LoRA, número de pasos de entrenamiento, composición del dataset, licencia explícita ni idiomas soportados, y a fecha de la información disponible el repositorio no acumula descargas ni valoraciones, por lo que no existe validación externa de su comportamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (adaptación de bajo rango) sobre el modelo de difusión Flux2-Klein-9B; arquitectura del modelo base no detallada en la información disponible |
| Parámetros totales | no disponible; el fichero LoRA pesa 316 MiB. El nombre del modelo base (Flux2-Klein-9B) sugiere del orden de 9 000 millones de parámetros, dato no confirmado en la información disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de generación de imagen); longitud de prompt soportada: no disponible |
| Tipos de cuantización | no disponible (se distribuye un único fichero safetensors; no se documentan versiones fp8, GGUF ni cuantizadas) |
| Idiomas soportados | no disponible (el idioma del prompt depende del codificador de texto del modelo base, no documentado aquí) |
| Licencia | no disponible; la model card indica que se publique siguiendo la licencia del proyecto original o del proyecto upstream, sin especificarla |
| Formato de pesos | safetensors (`Sun_direction_LoRA_Flux_2_Klein_9b_v1.safetensors`, 316 MiB) |

Otros datos de identificación: ID `RunningHubAI/rh-sun-direction-lora-flux-2-klein-9b-v1-lora`, autor `RunningHubAI`, pipeline declarado `text-to-image`, etiquetas `comfyui`, `lora`, `text-to-image`, `region:us`. Fecha de creación 2026-10-02 y última actualización 2026-10-02. Descargas y likes: 0.

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura del adaptador más allá de su naturaleza LoRA y del modelo base sobre el que se aplica, Flux2-Klein-9B, que es un modelo de difusión de la familia Flux 2. No se especifica rango (rank) ni alpha del LoRA, ni qué capas del transformer de difusión se adaptan, ni si se entrena sobre el bloque de atención de texto, sobre el de imagen o sobre ambos. Tampoco se detalla el codificador de texto ni el VAE asociados, que en esta familia de modelos se distribuyen por separado del fichero LoRA.

En cuanto al entrenamiento, la ficha no aporta número de imágenes, número de pasos, resolución de entrenamiento, técnica de anotación ni si se usó regularización o captions descriptivos. La única información funcional sobre el comportamiento entrenado es el disparador declarado, "match the sun direction from the reference", que indica que el adaptador está diseñado para transferir la dirección de la luz solar de una imagen de referencia a la generación, presumiblemente en un flujo con dos entradas (referencia e imagen objetivo) o mediante un conditioning espacial definido en el workflow de ComfyUI. La model card enlaza un directorio de workflows alojado en el repositorio `eric-venti-seeds/Sun-Direction-Lora-Flux2Klein9B`, pero no reproduce su contenido.

No se documenta ningún uso de RLHF, DPO ni técnicas de alineación, algo por otra parte poco habitual en adaptadores de generación de imagen. Tampoco se describen innovaciones técnicas propias más allá del propio condicionamiento de iluminación.

## Capacidades

- Generación de imágenes text-to-image mediante la aplicación de un LoRA sobre Flux2-Klein-9B, con el modelo base como responsable de la generación y el adaptador como control de iluminación.
- Control de la dirección de la luz solar a partir de una referencia: el modelo permite trasladar la orientación de la luz de una imagen de referencia a una nueva generación, según indica el disparador documentado.
- Coherencia de iluminación entre imágenes: al fijar la dirección solar, facilita series consistentes de imágenes generadas en distintas ejecuciones o con distintas variaciones de prompt.
- Integración en ComfyUI: la etiqueta `comfyui` y la referencia explícita a la plataforma indican compatibilidad con flujos de nodos de ComfyUI.
- Ejecución en plataformas gestionadas: el modelo se puede cargar en RunningHub, tanto en la versión internacional como en la china, y también desde Hugging Face.
- Combinación con otros LoRA y con el prompt del modelo base: comportamiento típico de un adaptador LoRA, aunque la compatibilidad y el peso relativo no están documentados.

No se documentan capacidades de tool calling, function calling, razonamiento multi-paso ni uso como agente; no aplican a un modelo de generación de imagen. Tampoco se documentan capacidades multimodales de entrada (por ejemplo, edición guiada por imagen) más allá de la referencia de iluminación implícita en el disparador. Las capacidades multilingües del prompt no están especificadas.

## Casos de uso

- Series de imágenes con iluminación coherente: dado un conjunto de variaciones de un mismo sujeto (poses, encuadres, colores), aplicar el LoRA con una dirección solar fija para que todas las tomas compartan la misma fuente de luz. Es adecuado porque el adaptador está entrenado específicamente para trasladar esa dirección desde una referencia.
- Composiciones fotorrealistas con material real: al integrar un sujeto generado en una fotografía existente, el LoRA permite alinear la luz del sujeto generado con la luz de la escena original, reduciendo el trabajo de corrección manual en posproducción.
- Previsualización de fotografía de producto: generar mockups de un producto bajo una dirección de luz concreta (por ejemplo, luz lateral desde la izquierda) para validar encuadres y sombras antes de una sesión real, manteniendo la misma condición lumínica entre propuestas.
- Ilustración y cómic con continuidad lumínica: en una secuencia de viñetas o ilustraciones, fijar la dirección del sol para que la escena mantenga coherencia de sombras entre planos, algo crítico cuando la acción transcurre en exteriores.
- Visualización arquitectónica: generar vistas de un edificio o de un espacio exterior con la orientación solar deseada, útil para estudiar cómo incide la luz según la hora o la orientación de la fachada en una fase temprana de diseño.
- Generación de datos sintéticos con control de iluminación: crear lotes de imágenes de un mismo objeto bajo distintas direcciones de luz etiquetadas, para entrenar o evaluar modelos de visión por computador sensibles a la iluminación (estimación de normales, relighting, detección de sombras).
- Preproducción de storyboards y animáticas: producir planos de referencia con una dirección de luz consistente con la intención de dirección de fotografía, antes de rodar o de encargar el render final.
- Fondos y matte painting para VFX: generar placas de fondo con luz compatible con el plano rodado, reduciendo el ajuste posterior de integración.

La idoneidad en todos estos casos depende de la calidad real del adaptador, que no está respaldada por benchmarks ni por evaluaciones publicadas en la información disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

No existen métricas cuantitativas de fidelidad de dirección de luz, consistencia entre imágenes, FID, CLIP score ni comparaciones con otros adaptadores de iluminación. Tampoco hay ejemplos visuales reproducidos en la información proporcionada, ni valores de tiempo de inferencia, throughput o consumo de memoria medidos por el autor.

## Requisitos de hardware

- El fichero LoRA ocupa 316 MiB, cantidad irrelevante frente al coste del modelo base, que es quien determina el consumo real de memoria. Los siguientes valores son estimaciones orientativas, no confirmadas por el autor.
- Estimación de VRAM en bf16/fp16 para un modelo base de ~9 000 millones de parámetros (dato inferido del nombre Flux2-Klein-9B): en torno a 18 GB solo para los pesos del transformer de difusión, más codificadores de texto y VAE, lo que sitúa el total en el rango de 22-28 GB.
- GPU profesionales recomendadas para bf16 sin cuantizar: A100 40 GB, A100 80 GB, H100 80 GB, L40S 48 GB.
- GPU de consumo: una RTX 4090 o RTX 3090 con 24 GB podría ser suficiente en bf16 para el modelo base, aunque al límite y con riesgo de fragmentación de memoria en resoluciones altas; no confirmado.
- Cuantizaciones de 8 y 4 bits del modelo base (si están disponibles para Flux2-Klein-9B, extremo no verificado en esta ficha) reducirían el requisito aproximado a 10-12 GB y 6-8 GB respectivamente, lo que abriría el uso en GPU de 12-16 GB como RTX 4070 Ti Super, RTX 4080 o RTX 4060 Ti de 16 GB.
- Opciones de despliegue documentadas: ComfyUI (etiqueta del repositorio), la plataforma RunningHub (versión internacional y china) y descarga desde Hugging Face. No se documentan instrucciones para vLLM, TGI, llama.cpp ni Ollama, que en cualquier caso no aplican a un modelo de difusión de imagen de esta naturaleza.
- Latencia y throughput: no disponibles. No se publican tiempos por imagen, número de pasos de muestreo recomendado, scheduler ni resolución de trabajo.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada adaptadores LoRA comparables de control de dirección solar para Flux2-Klein-9B ni para otras familias de difusión, ni se dispone de datos de rendimiento que permitan una comparación rigurosa.

| Criterio | Este modelo | Alternativas comparables |
|---|---|---|
| Tipo | LoRA de control de iluminación solar | no disponible |
| Modelo base | Flux2-Klein-9B | no disponible |
| Parámetros del adaptador | 316 MiB (rango no documentado) | no disponible |
| Contexto de prompt | no disponible | no disponible |
| Licencia | no disponible | no disponible |
| Disponibilidad | Hugging Face, ComfyUI, RunningHub | no disponible |

El único punto de referencia cercano es el propio modelo base Flux2-Klein-9B, que no constituye una alternativa sino el modelo sobre el que se aplica este adaptador.

## Limitaciones y advertencias

- Ausencia total de evaluación: el repositorio registra 0 descargas y 0 likes, y no incluye benchmarks, métricas ni comparaciones. No hay evidencia pública de que el control de iluminación funcione de forma fiable.
- Licencia no especificada: la model card remite a "la licencia del proyecto original o del proyecto upstream" sin nombrarla. Antes de cualquier uso comercial es imprescindible verificar la licencia de Flux2-Klein-9B y la del autor original en RunningHub. A falta de esa verificación, no debe asumirse que el uso comercial esté permitido.
- Dependencia estricta del modelo base: el LoRA solo es funcional sobre Flux2-Klein-9B. No se puede aplicar a Flux 1, SDXL, otros modelos de la familia Flux 2 ni a modelos de vídeo.
- Trigger word obligatoria: el comportamiento depende de la frase "match the sun direction from the reference". Omitirla o reformularla puede desactivar el efecto del adaptador o producir resultados inconsistentes.
- Documentación insuficiente para producción: no se indica rango del LoRA, capas adaptadas, peso recomendado (strength), resolución de entrenamiento, pasos de muestreo ni compatibilidad con otros LoRA. Cualquier integración en un pipeline requiere ajuste empírico.
- Riesgo de sobreajuste y de artefactos: al no publicarse el dataset de entrenamiento, no puede descartarse que el adaptador reproduzca estilos, composiciones o sesgos presentes en las imágenes de referencia usadas para entrenarlo.
- Sesgos potenciales: no evaluados ni documentados. Los adaptadores de iluminación pueden heredar sesgos del modelo base y del dataset en cuanto a tipo de escena, climatología, hora del día o región geográfica que se asocian a una determinada dirección solar.
- Idiomas del prompt: no especificados; el comportamiento multilingüe dependerá del codificador de texto del modelo base y no está verificado.
- Ficha de carácter promocional: buena parte de la model card son enlaces a servicios de RunningHub y a su API. La información técnica sobre el propio adaptador es mínima, lo que limita la reproducibilidad.
- Riesgo de confusión de fechas y versiones: el repositorio indica creación y actualización el 2026-10-02 con el sufijo "v1"; conviene comprobar si aparecen versiones posteriores antes de fijar una dependencia.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-sun-direction-lora-flux-2-klein-9b-v1-lora
- Workflows asociados (repositorio del autor original): https://huggingface.co/eric-venti-seeds/Sun-Direction-Lora-Flux2Klein9B/tree/main/workflow
- Proyecto original en RunningHub: https://www.runninghub.cn/model/public/2073241685072629761
- Página del autor en RunningHub: https://www.runninghub.cn/user-center/1819214514410942465
- RunningHub (internacional): https://www.runninghub.ai
- RunningHub (China): https://www.runninghub.cn
- Documentación de la API de RunningHub (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API de RunningHub (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- README en chino: https://huggingface.co/RunningHubAI/rh-sun-direction-lora-flux-2-klein-9b-v1-lora/blob/main/README_cn.md

Nota: los resultados de la búsqueda web realizada no contienen información relacionada con este modelo; se refieren a documentación de Google Sheets y no se han utilizado como fuente.
