# RunningHubAI/rh-sidny-lora

## Resumen

rh-sidny-lora es un adaptador LoRA para edición de imágenes mediante instrucciones de texto, publicado por RunningHubAI en Hugging Face. Se trata de un peso de tipo LoRA (218 MiB en formato safetensors) afinado a partir del modelo base krea2, y está pensado para cargarse en flujos de ComfyUI, en la plataforma RunningHub o directamente desde Hugging Face. Su función es incorporar un estilo o concepto concreto identificado por la palabra de activación `sidny`, que el usuario debe incluir en el prompt para activar el comportamiento aprendido.

El artefacto pertenece a la categoría de image-text-to-image, es decir, recibe una imagen de entrada más una instrucción textual y devuelve una imagen editada. No es un modelo autónomo: requiere el modelo base krea2 y un entorno de inferencia compatible (ComfyUI o la infraestructura de RunningHub) para ejecutarse. La model card es extremadamente escueta y no aporta información sobre composición del dataset, hiperparámetros de entrenamiento, licencia concreta ni idiomas soportados.

La relevancia de esta ficha es limitada desde el punto de vista técnico: el repositorio no publica benchmarks, no documenta el proceso de entrenamiento y no especifica la licencia del adaptador más allá de remitir a la del proyecto original. Cualquier evaluación en producción debería partir de la premisa de que se trata de un peso experimental de un autor concreto, sin garantías de calidad ni de condiciones de uso comercial explícitas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo base krea2; no se especifica la arquitectura del modelo base |
| Parámetros totales | no disponible (el peso ocupa 218 MiB en safetensors, sin desglose de rangos ni módulos adaptados) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible; la model card indica que se sigue la licencia del proyecto original o del upstream |
| Formato de pesos | safetensors (`sidny.safetensors`, 218 MiB) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, una técnica de ajuste fino eficiente en parámetros que congela los pesos del modelo base e inyecta matrices de bajo rango en determinadas capas. En este caso el modelo base declarado es krea2, del que no se detalla arquitectura, número de parámetros ni resolución nativa. El adaptador se distribuye como un único fichero safetensors de 218 MiB, lo que sugiere un rango y un conjunto de módulos objetivo moderados, aunque el repositorio no publica ni el rango (`r`), ni el `alpha`, ni la lista de módulos adaptados.

No hay información sobre el dataset de entrenamiento: ni número de imágenes, ni resolución, ni composición, ni si se emplearon técnicas de regularización o captions automáticos. Tampoco se documenta si hubo fases de RLHF, DPO u otro tipo de alineación, algo poco habitual en adaptadores de estilo pero relevante para evaluar su comportamiento. La única indicación operativa es la palabra de activación `sidny`, que debe incorporarse al prompt para que el adaptador ejerza su efecto.

## Capacidades

- Edición de imágenes guiada por texto: recibe una imagen de entrada y una instrucción textual, y genera una versión editada.
- Aplicación de un estilo o concepto concreto mediante la palabra de activación `sidny`.
- Integración en flujos de ComfyUI como nodo LoRA sobre el modelo base krea2.
- Ejecución en la plataforma RunningHub, tanto en su versión internacional como en la china.
- Uso mediante API a través de los endpoints documentados por RunningHub.
- Compatibilidad con el pipeline `image-text-to-image` declarado en los metadatos del repositorio.
- No se documentan capacidades de tool calling, razonamiento multi-paso, agentes, visión general, audio ni modo de pensamiento; el artefacto es exclusivamente un adaptador de edición de imagen.

## Casos de uso

- Edición de imagen con estilo consistente: cargar el LoRA en ComfyUI junto al modelo base krea2 e incluir `sidny` en el prompt para aplicar de forma repetible el concepto aprendido a una serie de imágenes.
- Prototipado rápido de variaciones visuales: usar el adaptador para generar alternativas editadas de una imagen de referencia antes de fijar una dirección creativa en un proyecto de diseño.
- Automatización de tareas de retoque por lotes: integrar el LoRA en un pipeline de ComfyUI que procese un directorio de imágenes con instrucciones textuales comunes, aprovechando la ligereza del peso (218 MiB) para iterar rápido.
- Experimentación con la API de RunningHub: desplegar el adaptador a través de los endpoints de RunningHub para probar la edición de imagen sin montar infraestructura propia de GPU.
- Investigación sobre adaptadores LoRA: emplear el peso como caso de estudio de un adaptador de bajo rango sobre krea2, comparando su comportamiento con otros LoRA del mismo ecosistema.
- Generación de material visual para pruebas internas: producir imágenes editadas con el estilo `sidny` para validar flujos de trabajo antes de invertir en un adaptador propio entrenado con datos propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; depende enteramente del modelo base krea2 y de la resolución de imagen, no del adaptador (218 MiB).
- GPU recomendadas: no disponible; el repositorio no especifica requisitos mínimos ni GPU validadas.
- Compatibilidad con GPU de consumo: no confirmada; al no conocerse el modelo base, no puede determinarse si cabe en tarjetas como RTX 4090, RTX 3090 o inferiores.
- Opciones de despliegue: ComfyUI (soporte nativo declarado), plataforma RunningHub (internacional y China) y API de RunningHub. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un adaptador de difusión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros adaptadores LoRA comparables, ni datos de rendimiento que permitan establecer una comparación técnica con alternativas de la misma categoría.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos, pero al ser un adaptador de estilo entrenado con un dataset no especificado, puede heredar sesgos visuales del modelo base krea2 y de los datos de ajuste.
- Riesgo de alucinación visual: como todo modelo generativo de imagen, puede producir detalles inexistentes o alterar elementos de la imagen de entrada sin control explícito.
- Sin información sobre idiomas soportados: no puede garantizarse el comportamiento con prompts en castellano u otros idiomas distintos del inglés.
- Licencia no disponible: la model card remite a la licencia del proyecto original o upstream, sin especificar términos de uso comercial. Cualquier uso en producción requiere verificar la licencia de krea2 y del adaptador con el autor.
- Ausencia total de datos de entrenamiento: no puede evaluarse la calidad, la cobertura ni la robustez del adaptador más allá de pruebas empíricas.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de validación por parte de la comunidad.
- Dependencia estricta del modelo base krea2 y de la palabra de activación `sidny`; sin ellos el adaptador no produce el efecto esperado.
- La model card contiene texto de relleno ("awdawda") en la sección descriptiva, lo que indica una documentación incompleta y no revisada.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/RunningHubAI/rh-sidny-lora
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2122733815970304001
- Página del autor en RunningHub: https://www.runninghub.ai/user-center/2112801553162125314
- RunningHub International: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentación de la API (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
- README en chino: https://huggingface.co/RunningHubAI/rh-sidny-lora/blob/main/README_cn.md
