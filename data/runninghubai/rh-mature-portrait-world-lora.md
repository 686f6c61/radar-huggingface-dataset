# RunningHubAI/rh-mature-portrait-world-lora

## Resumen

rh-mature-portrait-world-lora es un LoRA de text-to-image publicado por RunningHubAI en Hugging Face. No es un modelo base, sino un adaptador de bajo rango (162 MiB en safetensors) afinado a partir de Z-image-base y orientado a la generación de retratos de estilo "world painting" japonés con estética de mujer adulta. Su propósito es estilizar y estabilizar la representación de retratos femeninos de Asia Oriental en el rango de 25-30 años dentro de pipelines de difusión.

El repositorio es de tipo utilitario y muy ligero (0,2 GB totales), con una única versión de pesos (V2). La model card está pensada para su uso en ComfyUI y en la plataforma propietaria RunningHub, e incluye indicaciones de muestreo (doble muestreo zib+zit) y palabras de activación distintas según la versión. No se documentan métricas, dataset de entrenamiento ni composición de datos.

Su relevancia es limitada y acotada: sirve como ejemplo de adaptador de estilo para modelos de difusión en flujos ComfyUI, pero no aporta información verificable sobre calidad, licencia o rendimiento, por lo que cualquier evaluación técnica debe hacerse empíricamente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un modelo de difusión text-to-image; modelo base Z-image-base |
| Parámetros totales | no disponible (pesos LoRA de 162 MiB) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (text-to-image; no disponible la longitud de prompt soportada) |
| Tipos de cuantización | no disponible (pesos en safetensors; cuantizaciones no documentadas) |
| Idiomas soportados | no disponibles (prompts presumiblemente en inglés y chino, no confirmado) |
| Licencia | no disponible (la model card remite a la licencia del proyecto original o upstream) |
| Formato de pesos | safetensors (`ai-熟颜世绘V2.safetensors`) |

## Arquitectura y entrenamiento

Se trata de un LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas de atención (y presumiblemente en las proyecciones) de un modelo de difusión base. El modelo base declarado es Z-image-base, del que no se detallan arquitectura interna, número de parámetros ni variante (UNet o transformer de difusión). El tamaño del adaptador (162 MiB) es coherente con un LoRA de rango moderado sobre un modelo de difusión de escala media.

No se proporciona información sobre el dataset de entrenamiento: número de imágenes, resolución, composición demográfica, proceso de captura o etiquetado, ni si hubo regularización o uso de técnicas como LoRA con prior preservation. Tampoco se documenta si se aplicó algún tipo de ajuste por preferencias (RLHF/DPO), lo cual es poco habitual en adaptadores de estilo. La única indicación técnica es la recomendación de usar doble muestreo "zib+zit" y la distinción entre la palabra de activación de V1 ("Japanese young matron") y la estrategia de V2 (sin trigger fijo, añadir "25-30 year old East Asian adult female" al prompt).

## Capacidades

- Generación de imágenes text-to-image condicionada por prompt, mediante el modelo base Z-image-base más el adaptador LoRA.
- Estilización de retratos hacia una estética "world painting" japonesa, con énfasis en retratos femeninos adultos.
- Estabilización de la representación de edad y origen étnico mediante la inclusión explícita de descriptores en el prompt (V2).
- Compatibilidad con flujos ComfyUI y con la plataforma RunningHub (carga de pesos y ejecución online).
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multimodales de entrada más allá del prompt de texto.
- No se documenta capacidad multilingüe verificada; los ejemplos de prompt de la model card están en inglés y el nombre de los archivos en chino.

## Casos de uso

- Generación de retratos de personajes para ilustración editorial: el LoRA se cargaría en ComfyUI junto a Z-image-base y se usaría con prompts que incluyan "25-30 year old East Asian adult female" para obtener retratos consistentes en estilo pictórico japonés, útil para portadas o ilustraciones de artículos.
- Previsualización de conceptos de personaje en producción de cómic o novela gráfica: al ser un adaptador ligero (162 MiB), permite iterar rápidamente variaciones de un mismo personaje manteniendo el estilo, integrándose en un nodo LoRA de ComfyUI.
- Creación de assets para prototipos de videojuegos o narrativa visual: se puede usar para generar retratos de personajes secundarios con una dirección de arte homogénea, reduciendo la dependencia de un ilustrador para fases de bloqueo.
- Exploración de estilo en proyectos de diseño gráfico: el adaptador permite comparar la estética "world painting" frente a otros LoRA de retrato sobre el mismo modelo base, facilitando la selección de dirección artística.
- Pruebas de pipeline en ComfyUI: sirve como caso de prueba para validar la carga de LoRA, el doble muestreo zib+zit y la reproducibilidad de seeds antes de desplegar adaptadores propios en producción.
- Demostraciones y tutoriales sobre LoRA en la plataforma RunningHub: al estar publicado con enlaces a la API y a la ejecución online, se puede usar como ejemplo práctico en formación de usuarios de la plataforma.
- Generación de material de referencia para artistas: retratos estilizados que sirvan como base de bocetos o paletas, siempre que la licencia final del proyecto lo permita (ver limitaciones).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: depende enteramente del modelo base Z-image-base, no del LoRA. El adaptador añade un coste marginal (162 MiB de pesos, más activaciones de bajo rango). No se dispone de cifras oficiales de VRAM para Z-image-base.
- GPU recomendadas: no disponible. Al no documentarse los requisitos del modelo base, no es posible recomendar A100, H100 o RTX 4090 con fundamento.
- ¿Cabe en GPU de consumo? No disponible. El tamaño del LoRA es compatible con cualquier GPU que pueda ejecutar el modelo base, pero se desconoce si Z-image-base cabe en tarjetas de 8, 12 o 16 GB.
- Opciones de despliegue: ComfyUI (indicado en la model card), plataforma RunningHub y API de RunningHub. No se documenta soporte explícito para vLLM, llama.cpp, Ollama o TGI, que además no aplican a un modelo de difusión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros LoRA de retrato comparables ni datos de rendimiento que permitan una comparación fundamentada con alternativas de la misma categoría.

## Limitaciones y advertencias

- Licencia no disponible: la model card remite a la licencia del proyecto original o upstream, sin especificarla. No se puede confirmar el uso comercial sin verificar la licencia de Z-image-base y del autor del LoRA.
- Sesgos conocidos: el adaptador está orientado explícitamente a un rango de edad (25-30 años) y a un fenotipo concreto ("East Asian adult female"), lo que puede reducir la diversidad de los retratos generados y reproducir estereotipos de representación.
- Riesgo de alucinación visual: como todo modelo de difusión, puede generar anatomía incorrecta, manos deformadas o inconsistencias en accesorios, especialmente fuera del dominio de retrato para el que fue afinado.
- Dependencia del modelo base: el LoRA no funciona de forma autónoma; requiere Z-image-base y, presumiblemente, una versión concreta del mismo. Cambios en el base pueden degradar el resultado.
- Estabilidad de prompt: V2 no tiene palabra de activación fija y depende de descriptores en el prompt; la reproducibilidad entre prompts y seeds no está documentada.
- Limitaciones de idioma: no se confirma el soporte multilingüe de los prompts; el uso en castellano no está verificado.
- Cero tracción comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin issues ni discusión pública, lo que implica ausencia de validación externa.
- Advertencia de contenido: el nombre y la descripción del modelo sugieren retratos de personas adultas; conviene revisar las políticas de contenido de la plataforma y del modelo base antes de usarlo en producción.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-mature-portrait-world-lora
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2076981579087618050
- Página del autor: https://www.runninghub.ai/user-center/2076855052543004673
- RunningHub International: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentación de la API (EN): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API (CN): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
- README en chino: README_cn.md (en el propio repositorio)
