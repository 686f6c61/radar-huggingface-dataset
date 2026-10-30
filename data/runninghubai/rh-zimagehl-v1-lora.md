# RunningHubAI/rh-zimagehl-v1-lora

## Resumen

rh-zimagehl-v1-lora es un adaptador LoRA de texto a imagen publicado en Hugging Face por RunningHubAI, la cuenta oficial de la plataforma RunningHub. El adaptador ajusta el modelo base Z-image-turbo para generar retratos con una estética facial muy concreta, que el autor describe en chino como "高冷御姐" (mujer madura de actitud fría y altiva, con toque "纯欲", es decir, inocente y sensual a la vez). Se activa mediante la palabra clave "HL" en el prompt.

El archivo de pesos pesa 162 MiB en formato safetensors y está diseñado para cargarse en ComfyUI o ejecutarse directamente en la nube de RunningHub, que también ofrece entrenamiento de LoRAs y acceso por API. No es un modelo general, sino un LoRA de estilo dentro del ecosistema Z-Image: su valor está en permitir control estético fino sin reentrenar el modelo completo. La model card es mínima, con cero descargas y cero likes en el momento de redactar esta ficha, por lo que carece de validación comunitaria.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) para texto a imagen, sobre el modelo base Z-image-turbo |
| Parámetros totales | no disponible (archivo de pesos de 162 MiB) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica que el copyright permanece en el autor y remite a la licencia del proyecto original) |
| Formato de pesos | safetensors (archivo `Zimage纯欲高冷御姐HL-V1.safetensors`, 162 MiB) |

## Arquitectura y entrenamiento

Se trata de un adaptador LoRA (Low-Rank Adaptation): en lugar de modificar el modelo completo, entrena matrices de bajo rango que se suman a los pesos del modelo base, lo que reduce drásticamente el tamaño del archivo (162 MiB frente a los varios GB de un checkpoint completo) y permite combinar varios adaptadores en un mismo workflow. El modelo base sobre el que se aplica es Z-image-turbo, un modelo de difusión texto-a-imagen optimizado para generación en pocos pasos.

Sobre el entrenamiento solo se sabe que fue finetuneado desde Z-image-turbo y que, según la model card, puede entrenarse u ejecutarse en la plataforma RunningHub. No se ha publicado información sobre el dataset utilizado, su tamaño, el número de pasos de entrenamiento, el rango LoRA (rank) ni los pesos alpha: todo ello figura como no disponible. El único mecanismo de control documentado es la palabra de activación "HL", que debe incluirse en el prompt para invocar el estilo aprendido.

## Capacidades

- Generación de imágenes a partir de texto heredando las capacidades del modelo base Z-image-turbo, con el estilo facial concreto del LoRA aplicado al incluir la palabra clave "HL" en el prompt.
- Carga como LoRA estándar en ComfyUI, integrable en workflows existentes de difusión.
- Ejecución en la nube a través de RunningHub, tanto desde su interfaz web como mediante su API documentada.
- Combinación con otros LoRAs de estilo o personaje dentro del mismo pipeline, al ser un adaptador ligero y no un checkpoint completo.
- No aplica: tool calling, function calling, agentes ni razonamiento multi-paso. No es un modelo de lenguaje, sino un adaptador de generación de imágenes.

## Casos de uso

- Retratos de personajes con estética consistente: incluyendo "HL" en el prompt, se generan retratos femeninos con el estilo facial del LoRA, útil cuando se necesita repetir una misma estética en varias imágenes sin describirla cada vez.
- Diseño de personajes para novelas visuales o juegos: permite explorar variaciones de un arquetipo de personaje maduro y de carácter frío manteniendo coherencia visual entre generaciones.
- Avatares e ilustración para redes sociales: la generación en pocos pasos del modelo base y el peso reducido del LoRA hacen viable producir lotes de imágenes en un equipo de consumo.
- Moodboards y exploración estética en publicidad o fotografía: sirve como referencia visual rápida para sesiones creativas antes de producir contenido real.
- Automatización por lotes vía API: integrando el modelo en la API de RunningHub se pueden encadenar generaciones masivas dentro de pipelines de contenido.
- Composición de estilos en ComfyUI: al ser un LoRA de 162 MiB, puede combinarse con otros adaptadores (estilo, ropa, fondo) para controlar distintos aspectos de la imagen de forma independiente.
- Prototipado rápido de concept art: el flujo ComfyUI permite iterar prompts con el estilo fijo del LoRA mientras se ajustan composición, iluminación y encuadre.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El LoRA añade unos 162 MiB sobre los requisitos del modelo base Z-image-turbo; los requisitos de VRAM del modelo base no están disponibles en la información proporcionada.
- Dado el tamaño del adaptador, cualquier GPU moderna capaz de ejecutar Z-image-turbo en ComfyUI debería cargarlo sin problema; no se especifican modelos de GPU concretos.
- No se dispone de datos que confirmen qué tarjetas de consumo lo soportan, aunque el ecosistema ComfyUI apunta a uso en GPU domésticas.
- Opciones de despliegue: ComfyUI en local, ejecución en la nube y API a través de RunningHub, o descarga directa de los pesos desde Hugging Face. No aplican runtimes de LLM como vLLM, llama.cpp, Ollama o TGI al tratarse de un modelo de difusión de imágenes.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

Los resultados de búsqueda identifican dos repositorios hermanos del mismo autor en Hugging Face, ambos LoRAs de texto a imagen distribuidos por RunningHub:

| Modelo | Tipo | Tamaño del repo | Base documentada | Licencia |
|---|---|---|---|---|
| RunningHubAI/rh-zimagehl-v1-lora | LoRA texto a imagen | 0,2 GB (162 MiB de pesos) | Z-image-turbo | no disponible |
| RunningHubAI/rh-z-image-lora | LoRA texto a imagen | 371 MB | no disponible | no disponible |
| RunningHubAI/rh-z-image-v1-lora | LoRA texto a imagen | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparables entre ellos, ni de alternativas de otros autores con documentación suficiente en la información proporcionada.

## Limitaciones y advertencias

- Licencia no especificada: la model card solo indica que el copyright pertenece al autor y remite a la licencia del proyecto original. Antes de cualquier uso comercial conviene verificar los términos en la página del proyecto original y en la licencia del modelo base Z-image-turbo.
- Dependencia del modelo base: el LoRA no funciona de forma aislada; requiere cargar Z-image-turbo y no se documenta compatibilidad con otras versiones o checkpoints.
- Palabra de activación obligatoria: sin el trigger "HL" en el prompt, el adaptador puede no aplicar el estilo esperado.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de redactar la ficha, y una model card muy breve sin ejemplos de resultados ni detalles de entrenamiento, lo que dificulta evaluar calidad y reproducibilidad.
- Generación de rostros realistas: al tratarse de un LoRA orientado a retratos femeninos estilizados, existe el riesgo habitual de semejanza con personas reales y de uso indebido para deepfakes; se recomienda moderación y cumplimiento de la normativa aplicable.
- Contenido potencialmente sensual: la descripción del autor incluye la estética "纯欲" (inocente y sensual), por lo que conviene revisar las políticas de contenido de la plataforma de despliegue.
- Sin información sobre cuantización, versiones de ComfyUI compatibles ni parámetros de entrenamiento (rank, alpha, dataset), lo que limita el diagnóstico de problemas de integración.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-zimagehl-v1-lora
- Proyecto original en RunningHub: https://www.runninghub.cn/model/public/2029534059159883777
- Página del autor en RunningHub: https://www.runninghub.cn/user-center/1943638270565617665
- RunningHub (plataforma internacional): https://www.runninghub.ai
- RunningHub (sitio China): https://www.runninghub.cn
- Documentación de la API de RunningHub (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Documentación de la API de RunningHub (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Plataforma de entrenamiento de modelos de RunningHub: https://www.runninghub.ai/page-model
- Repositorios hermanos del mismo autor: https://huggingface.co/RunningHubAI/rh-z-image-v1-lora y https://huggingface.co/RunningHubAI/rh-z-image-lora
- No se ha localizado paper académico ni demo independiente asociados a este LoRA: no disponible.
