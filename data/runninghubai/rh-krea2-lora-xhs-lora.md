# RunningHubAI/rh-krea2-lora-xhs-lora

## Resumen

rh-krea2-lora-xhs-lora es un adaptador LoRA de edición de imagen publicado por RunningHubAI, la cuenta oficial de la plataforma RunningHub en Hugging Face. El modelo se presenta como un ajuste fino de tipo LoRA sobre el modelo base krea2, orientado a la generación y edición de retratos fotográficos con el estilo visual característico de Xiaohongshu (XHS), la red social china de contenido visual. El repositorio contiene un único archivo de pesos de 448 MiB en formato safetensors, denominado `Krea2_Lora_摄影人像-XHS风格.safetensors` (LoRA de retrato fotográfico, estilo XHS).

El modelo está pensado para su uso dentro de ComfyUI, tal y como indican las etiquetas del repositorio (`comfyui`, `lora`, `image-text-to-image`), y también puede cargarse directamente en la plataforma RunningHub, donde el autor mantiene la ficha original y ofrece ejecución en línea. No es un modelo de lenguaje ni un transformer de texto: es un adaptador de estilo que modifica el comportamiento de un modelo generativo de imágenes preexistente. Por tanto, no dispone de parámetros propios de contexto, vocabulario ni capacidades de razonamiento lingüístico.

La relevancia de esta ficha es acotada: se trata de un LoRA de nicho, con cero descargas y cero likes en el momento de la consulta, publicado en noviembre de 2026. Su interés práctico reside en la posibilidad de reproducir un estilo fotográfico concreto (retrato tipo XHS) sobre el modelo base krea2 sin necesidad de reentrenar el modelo completo, algo útil para flujos de generación de contenido en redes sociales y para pipelines de edición de imagen en ComfyUI.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo base krea2 |
| Parámetros totales | no disponible (pesos LoRA de 448 MiB, sin desglose de rango o módulos) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de imagen, no de texto) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (los prompts dependen del modelo base krea2) |
| Licencia | no disponible (la model card remite a la licencia del proyecto original o upstream) |
| Formato de pesos | safetensors (`Krea2_Lora_摄影人像-XHS风格.safetensors`, 448 MiB) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas del modelo base krea2 para modificar su comportamiento sin alterar los pesos originales. La model card no especifica el rango del adaptador, los módulos objetivo (atención, proyecciones cruzadas, etc.) ni la arquitectura interna del modelo base, más allá de identificarlo como «krea2». Tampoco se detalla si el ajuste se aplicó sobre el modelo completo o sobre un subconjunto de capas.

En cuanto al entrenamiento, la información disponible es mínima: se indica que el modelo está ajustado a partir de krea2 y que su temática es el retrato fotográfico con estilo XHS, pero no se documentan el número de imágenes de entrenamiento, la composición del dataset, el uso de técnicas de regularización, la resolución de entrenamiento ni si se emplearon pasos de preferencia (RLHF/DPO) o filtrado de calidad. No hay innovaciones técnicas declaradas más allá del propio ajuste de estilo. El tamaño del archivo (448 MiB) es coherente con un LoRA de rango moderado sobre un modelo de difusión de varios miles de millones de parámetros, pero este dato no se confirma en la documentación.

## Capacidades

- Generación y edición de imágenes de retrato con un estilo fotográfico concreto (estética XHS), partiendo de una imagen de entrada y un prompt textual (pipeline `image-text-to-image`).
- Transferencia de estilo sobre el modelo base krea2: el LoRA modifica la apariencia visual de la salida sin sustituir el modelo generativo subyacente.
- Integración en flujos de ComfyUI mediante el nodo de carga de LoRA estándar.
- Ejecución en la plataforma RunningHub, que permite probar el modelo en línea y acceder a la ficha original del autor.
- No dispone de tool calling, function calling, razonamiento multi-paso, capacidades de agente ni procesamiento de lenguaje natural: es un adaptador de imagen.
- No se documentan capacidades multilingües propias; el idioma de los prompts vendrá determinado por el codificador de texto del modelo base krea2.

## Casos de uso

- Generación de retratos para redes sociales: el LoRA aplica la estética XHS a fotografías de entrada, lo que permite producir contenido visual coherente con el estilo de esa plataforma sin edición manual.
- Edición de imagen en ComfyUI: se carga el adaptador junto al modelo base krea2 y se encadena con nodos de preprocesado, máscaras y postprocesado para flujos de retoque automatizado.
- Pruebas de estilo en entornos de prototipado: al ser un archivo de 448 MiB, se puede iterar rápidamente sobre variantes de prompt y de fuerza del LoRA sin reentrenar el modelo completo.
- Producción de material para campañas de marketing en redes: generación de retratos consistentes con una dirección de arte definida, útil para cuentas de contenido visual.
- Evaluación comparativa de adaptadores: sirve como referencia para comparar estilos de retrato entre distintos LoRA de la familia krea2 publicados por el mismo autor (por ejemplo, rh-krea2-r-lokr-lora o rh-krea2-ai-lora).
- Ejecución en la nube sin infraestructura propia: mediante la API de RunningHub se puede invocar el modelo en línea, lo que evita disponer de GPU local para probarlo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas cuantitativas (FID, CLIP score, similitud de estilo, etc.) ni comparaciones numéricas con otros adaptadores.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma específica; depende enteramente del modelo base krea2, no del LoRA. El adaptador en sí ocupa 448 MiB en disco y una cantidad similar en memoria al cargarse.
- GPU recomendadas: no disponibles; vendrán determinadas por los requisitos del modelo base krea2.
- Compatibilidad con GPU de consumo: no confirmada; el LoRA no añade requisitos propios, pero el modelo base puede condicionar que quepa o no en tarjetas como la RTX 4090.
- Opciones de despliegue: ComfyUI (flujo principal declarado), plataforma RunningHub (ejecución en línea y API). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que además no aplican a modelos de imagen de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Modelo base | Tamaño del artefacto | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| rh-krea2-lora-xhs-lora | LoRA de imagen (retrato, estilo XHS) | krea2 | 448 MiB | no aplica | no disponible | Hugging Face, RunningHub |
| rh-krea2-r-lokr-lora | LoRA/LoKr de imagen (estilo, layouts, transferencia de estilo) | krea2 | no disponible | no aplica | no disponible | Hugging Face |
| rh-krea2-ai-lora | LoRA de imagen | krea2 | no disponible | no aplica | no disponible | Hugging Face |

Los tres adaptadores pertenecen a la misma familia publicada por RunningHubAI sobre krea2 y comparten la ausencia de documentación sobre licencia y métricas. No se dispone de datos de rendimiento que permitan una comparación cuantitativa entre ellos.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al estar orientado a retratos con una estética de red social concreta, puede reproducir sesgos de representación (edad, género, etnia, cánones de belleza) presentes en los datos de ajuste, que no se detallan.
- Riesgo de alucinación: no aplica en el sentido lingüístico, pero sí existe riesgo de artefactos visuales, deformaciones faciales o pérdida de identidad en la edición de retratos, sin métricas publicadas que lo cuantifiquen.
- Limitaciones de contexto o idioma: no hay información sobre el comportamiento con prompts en distintos idiomas; dependerá del codificador de texto del modelo base krea2.
- Restricciones de licencia: la licencia no está disponible. La model card indica que los derechos permanecen con el autor y que debe seguirse la licencia del proyecto original o upstream, por lo que el uso comercial no está garantizado y requiere verificación previa.
- Caveats para producción: el repositorio tiene cero descargas y cero likes, sin validación comunitaria; no hay documentación de hiperparámetros de entrenamiento ni de fuerza recomendada del LoRA; el nombre del archivo incluye caracteres chinos, lo que puede requerir cuidado en pipelines automatizados.
- Dependencia total del modelo base: el adaptador no es autónomo; sin krea2 no es funcional, y cualquier limitación o restricción de licencia del modelo base se hereda.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RunningHubAI/rh-krea2-lora-xhs-lora
- Ficha original en RunningHub: https://www.runninghub.ai/model/public/2081191963312140290
- Página del autor en RunningHub: https://www.runninghub.ai/user-center/1954818626253697025
- Plataforma RunningHub: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentación de la API (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
- Adaptador relacionado rh-krea2-r-lokr-lora: https://huggingface.co/RunningHubAI/rh-krea2-r-lokr-lora
- Adaptador relacionado rh-krea2-ai-lora: https://huggingface.co/RunningHubAI/rh-krea2-ai-lora
