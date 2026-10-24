# RunningHubAI/rh-ootd2509-banana2-14full-lora

## Resumen

`rh-ootd2509-banana2-14full-lora` es un adaptador LoRA de edición de imagen publicado por RunningHubAI y atribuido al autor Jay Lin. No es un modelo fundacional completo: se distribuye como un único archivo de pesos de 900 MiB y está pensado para cargarse junto al modelo base Qwen-Edit-2509 en ComfyUI, RunningHub o Hugging Face.

El pipeline declarado es `image-text-to-image`, por lo que su función esperada es la edición de imágenes guiada por texto e imagen de entrada. El repositorio no documenta arquitectura interna, datos de entrenamiento, parámetros, benchmarks ni licencia concreta, lo que limita bastante su evaluación técnica.

Su interés práctico está en reutilizar un ajuste LoRA sobre Qwen-Edit-2509 sin reentrenar el modelo base. Sin embargo, la información pública es mínima y no permite confirmar calidad, sesgos, rendimiento ni condiciones de uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA de edición de imagen; arquitectura del modelo base Qwen-Edit-2509 no disponible |
| Parámetros totales | No disponible; el archivo de pesos del adaptador ocupa 900 MiB |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible; no se documenta para este adaptador |
| Tipos de cuantización | No disponible; se distribuye en safetensors sin cuantizaciones documentadas |
| Idiomas soportados | No disponibles |
| Licencia | No disponible; la model card remite a la licencia del proyecto original o upstream |
| Formato de pesos | safetensors (`ootd2509_banana2_14full.safetensors`, 900 MiB) |
| Modelo base | Qwen-Edit-2509 |
| Pipeline | image-text-to-image |
| Tamaño del repositorio | 0,9 GB |

## Arquitectura y entrenamiento

El repositorio contiene un adaptador LoRA, es decir, un conjunto de pesos de bajo rango que se aplica sobre un modelo base para especializar su comportamiento sin reentrenarlo por completo. La model card indica que se ha ajustado desde Qwen-Edit-2509, pero no detalla el rango del adaptador, las capas modificadas, el número de imágenes de entrenamiento, la composición del dataset ni si se usaron técnicas de alineación como RLHF o DPO.

Tampoco se describen innovaciones técnicas, recetas de entrenamiento, hiperparámetros ni procesos de evaluación. La única información operativa es que los pesos se pueden cargar en ComfyUI, RunningHub y Hugging Face, y que el autor ofrece formación de modelos en la plataforma RunningHub.

## Capacidades

- Edición de imagen guiada por texto e imagen de entrada, según el pipeline `image-text-to-image`.
- Integración declarada con ComfyUI y con la plataforma RunningHub.
- Carga de pesos en formato safetensors desde Hugging Face.
- Aplicación como adaptador LoRA sobre Qwen-Edit-2509, sin necesidad de reentrenar el modelo base.
- No se documentan capacidades de tool calling, function calling, agentes ni razonamiento multi-paso.
- No se documentan capacidades de generación de texto, código, matemáticas, audio o vídeo.
- No se documentan capacidades multilingües ni un modo de razonamiento explícito.
- El efecto visual concreto del ajuste `ootd2509_banana2_14full` no está descrito con ejemplos ni parámetros recomendados.

## Casos de uso

- Edición de imagen en ComfyUI: cargar Qwen-Edit-2509 junto con este LoRA y aplicar ediciones guiadas por prompt sobre una imagen de referencia. Es adecuado por su formato safetensors y su compatibilidad declarada con ComfyUI, aunque requiere validar el resultado en cada caso.
- Creación de variaciones visuales en RunningHub: ejecutar un workflow de edición de imagen dentro de la plataforma y automatizar variaciones mediante su API. El modelo se publica específicamente para ese ecosistema, pero no hay datos de latencia ni de coste por ejecución.
- Prototipado de conceptos en diseño gráfico: iterar sobre imágenes de referencia para explorar ajustes visuales sin entrenar un modelo propio. El adaptador pesa 900 MiB y evita reentrenar el base, lo que facilita pruebas rápidas.
- Automatización de catálogos visuales: procesar imágenes de producto con ediciones guiadas por texto para generar versiones consistentes. Es necesario establecer revisión humana, porque no hay benchmarks ni garantías de fidelidad.
- Investigación sobre adaptadores LoRA: comparar el comportamiento del modelo base Qwen-Edit-2509 con y sin este adaptador en tareas de edición de imagen. Su tamaño reducido y su formato estándar facilitan experimentos controlados.
- Demostraciones educativas de pipelines image-text-to-image: mostrar en ComfyUI cómo se combina un modelo base con un adaptador LoRA. No es un modelo autónomo y requiere el base y el entorno adecuado.
- Integración en flujos de contenido para marketing: generar propuestas visuales por lotes y seleccionar las mejores mediante revisión manual. La falta de documentación sobre licencia y sesgos obliga a validar antes de un uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador por separado; depende del modelo base Qwen-Edit-2509 y del pipeline de edición de imagen.
- GPU recomendadas: no disponibles; la model card no especifica modelos de GPU ni requisitos mínimos.
- Viabilidad en GPU de consumo: no confirmada. El adaptador ocupa 900 MiB en disco, pero el consumo real de VRAM depende del modelo base y de la resolución de imagen.
- Opciones de despliegue documentadas: ComfyUI, RunningHub y Hugging Face.
- vLLM, llama.cpp, Ollama y TGI: no se documentan para este caso; al tratarse de un LoRA de edición de imagen, no son opciones típicas ni hay soporte declarado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos cuantitativos para comparar rendimiento. La siguiente tabla recoge alternativas identificadas en la información consultada, con los datos disponibles y sin inferir cifras no publicadas.

| Modelo | Tipo | Base | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| rh-ootd2509-banana2-14full-lora | LoRA de edición de imagen | Qwen-Edit-2509 | No disponible | No disponible | No disponible | Hugging Face, ComfyUI, RunningHub |
| Qwen-Edit-2509 | Modelo base referenciado | No aplica | No disponible | No disponible | No disponible en esta ficha | Referenciado por este LoRA |
| rh-ai-lora | LoRA text-to-image | No disponible | No disponible | No disponible | No disponible | Hugging Face |
| rh-katiebanano2500-lora | LoRA | No disponible | No disponible | No disponible | No disponible | Hugging Face |

## Limitaciones y advertencias

- La licencia no está especificada de forma concreta; la model card indica que se debe seguir la licencia del proyecto original o upstream. Es imprescindible verificarla antes de un uso comercial.
- No hay resultados de benchmarks, evaluación humana ni métricas de calidad publicadas.
- No se documentan el dataset de entrenamiento, el número de imágenes, los hiperparámetros ni posibles sesgos.
- El modelo es un adaptador LoRA: no funciona de forma autónoma y requiere Qwen-Edit-2509 y un entorno compatible.
- No se documentan idiomas soportados; no se puede garantizar un comportamiento correcto con prompts en castellano u otros idiomas.
- En edición de imagen no aplica el concepto de alucinación textual, pero sí existe riesgo de generar ediciones infieles, artefactos o contenido no solicitado.
- No se especifican limitaciones de resolución, pasos de inferencia, guidance scale ni otros parámetros recomendados.
- La adopción pública es muy baja en la información consultada: 0 descargas y 0 likes.
- No se recomienda su uso en producción crítica sin una evaluación previa con datos propios y revisión humana.

## Enlaces

- [Hugging Face del modelo](https://huggingface.co/RunningHubAI/rh-ootd2509-banana2-14full-lora)
- [Proyecto original en RunningHub](https://www.runninghub.cn/model/public/1994400194907283458)
- [Página del autor](https://www.runninghub.cn/user-center/1824003815107653634)
- [RunningHub AI](https://www.runninghub.ai)
- [RunningHub China](https://www.runninghub.cn)
- [Documentación de la API en inglés](https://www.runninghub.cn/runninghub-api-doc-en/)
- [Documentación de la API en chino](https://www.runninghub.cn/runninghub-api-doc-cn/)
- [Entrenamiento de modelos en RunningHub](https://www.runninghub.ai/page-model)
- [Catálogo de modelos de RunningHub](https://www.runninghub.ai/models)
- [Modelo relacionado rh-ai-lora](https://huggingface.co/RunningHubAI/rh-ai-lora)
- [Modelo relacionado rh-katiebanano2500-lora](https://huggingface.co/RunningHubAI/rh-katiebanano2500-lora)
