# RunningHubAI/rh-nami-moss-lora

## Resumen

`rh-nami-moss-lora` es un adaptador LoRA (Low-Rank Adaptation) publicado por RunningHubAI, pensado para su uso sobre el modelo base `moss-image` en entornos ComfyUI. No se trata de un modelo de lenguaje ni de un modelo fundacional completo, sino de un conjunto de pesos de ajuste fino de bajo rango (138 MiB) que modifica el comportamiento del modelo base al que se aplica. El autor del ajuste se identifica como "鲤白设计" dentro de la plataforma RunningHub.

El propósito declarado es la personalización del modelo `moss-image` mediante la palabra de activación (trigger word) `nami`, lo que sugiere un ajuste orientado a un estilo o personaje concreto denominado "nami". La model card no aporta información sobre el conjunto de datos de entrenamiento, el número de pasos, el rango del LoRA ni los hiperparámetros utilizados.

La relevancia de esta ficha es limitada desde el punto de vista de la evaluación técnica: el repositorio no incluye pipeline declarado, licencia explícita, idiomas soportados ni resultados de benchmarks. Es un artefacto de pesos para un flujo de trabajo de generación de imágenes en ComfyUI, distribuido a través de la infraestructura de RunningHub.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo base `moss-image`; arquitectura del modelo base no disponible |
| Parametros totales | no disponible (pesos del adaptador: 138 MiB en `Nami_MOSS_lora_v1_000006250.safetensors`) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base y del cargador) |
| Idiomas soportados | no disponible |
| Licencia | no disponible; la model card indica que los derechos permanecen con el autor y que debe seguirse la licencia del proyecto original o del modelo upstream |
| Formato de pesos | safetensors (`Nami_MOSS_lora_v1_000006250.safetensors`) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, una tecnica de ajuste fino parametrizado eficiente que congela los pesos del modelo base e inserta matrices de bajo rango entrenables en determinadas capas. El modelo base declarado es `moss-image`, del cual no se proporciona informacion sobre arquitectura, tamano ni procedencia en la documentacion disponible. El tamano del repositorio (0,1 GB) y del archivo de pesos (138 MiB) es coherente con un adaptador LoRA de rango moderado.

No se dispone de informacion sobre el numero de tokens o imagenes de entrenamiento, la composicion del dataset, el rango del LoRA, la tasa de aprendizaje, el numero de pasos ni si se aplicaron tecnicas adicionales como regularizacion o data augmentation. La unica indicacion funcional es la palabra de activacion `nami`, que sugiere un ajuste orientado a un concepto, personaje o estilo concreto.

## Capacidades

- Aplicacion de un ajuste de estilo o concepto sobre el modelo base `moss-image` mediante la palabra de activacion `nami`.
- Integracion en flujos de trabajo de ComfyUI como nodo de carga de LoRA.
- Compatibilidad declarada con las plataformas ComfyUI, RunningHub y Hugging Face.
- Generacion de texto: no aplica (no es un modelo de lenguaje).
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible mas alla del uso como LoRA de imagen sobre el modelo base.

## Casos de uso

- Personalizacion de estilo en ComfyUI: cargar el LoRA junto al modelo `moss-image` en un flujo de trabajo de ComfyUI y activar el concepto `nami` mediante la trigger word para generar imagenes con ese ajuste.
- Produccion de variaciones de personaje: usar el adaptador para mantener consistencia visual de un personaje o estilo "nami" en series de imagenes generadas por lotes.
- Prototipado rapido en RunningHub: ejecutar el LoRA en la plataforma RunningHub sin necesidad de infraestructura local, aprovechando la integracion nativa del ecosistema.
- Experimentacion con adaptadores de bajo rango: emplear el archivo safetensors como ejemplo de LoRA de 138 MiB para probar cargadores y pipelines de ComfyUI.
- Composicion con otros LoRA: combinar el adaptador con otros ajustes de estilo en ComfyUI, sujeto a la compatibilidad del modelo base y a la gestion de pesos que permita el flujo de trabajo.
- Evaluacion comparativa de ajustes: usar el LoRA como referencia en pruebas internas de calidad o consistencia frente a otros adaptadores sobre `moss-image`, siempre que se disponga del modelo base y de la licencia correspondiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; depende enteramente del modelo base `moss-image` y del pipeline de generacion, no del adaptador LoRA, cuyo peso es de 138 MiB.
- GPU recomendadas: no disponible; condicionado por el modelo base.
- Compatibilidad con GPU de consumo: no disponible; el adaptador en si ocupa poco espacio, pero el modelo base determina los requisitos reales.
- Opciones de despliegue: ComfyUI (declarado), RunningHub (plataforma del autor), Hugging Face. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un LoRA de imagen.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria, y no se dispone de datos sobre el modelo base `moss-image` ni sobre otros LoRA publicados por el mismo autor que permitan una comparacion fundamentada.

## Limitaciones y advertencias

- Ausencia de licencia explicita: la model card remite a la licencia del proyecto original o del modelo upstream, por lo que el uso comercial queda condicionado a lo que establezca `moss-image`, no documentado aqui.
- Falta de informacion sobre el dataset de entrenamiento: no puede evaluarse el riesgo de sesgos, sobreajuste ni contaminacion.
- Dependencia total del modelo base: el adaptador no es funcional por si solo y su comportamiento depende de la version y configuracion de `moss-image`.
- Riesgo de sobreajuste al concepto `nami`: al ser un ajuste de concepto, puede degradar la diversidad o la fidelidad del modelo base fuera de ese dominio.
- Sin benchmarks ni evaluaciones publicadas: no hay evidencia cuantitativa de calidad.
- Repositorio con cero descargas y cero likes en el momento de la consulta: sin senales de validacion por parte de la comunidad.
- Fechas de creacion y actualizacion del repositorio poco habituales (2026): conviene verificar la integridad y procedencia de los pesos antes de usarlos en produccion.
- No se documentan idiomas, contexto ni capacidades de texto: no debe tratarse como un modelo de lenguaje.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/RunningHubAI/rh-nami-moss-lora
- Modelo original en RunningHub: https://www.runninghub.cn/model/public/2116560228635463682
- Pagina del autor en RunningHub: https://www.runninghub.cn/user-center/1916359802010902529
- RunningHub International: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentacion de la API (EN): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API (CN): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
- README en chino: https://huggingface.co/RunningHubAI/rh-nami-moss-lora/blob/main/README_cn.md
