# RunningHubAI/rh-helomatteo-lora

## Resumen

`rh-helomatteo-lora` es un adaptador LoRA de edición de imágenes (pipeline `image-text-to-image`) publicado por la plataforma RunningHub en nombre del autor Alisson Matheus. Se distribuye como un único archivo `safetensors` de 218 MiB, afinado a partir del modelo base `krea2`, y está pensado para cargarse en ComfyUI o en la propia plataforma RunningHub. No se trata de un modelo de lenguaje ni de un modelo fundacional completo, sino de un peso de ajuste fino que modifica el comportamiento de un modelo de difusión subyacente.

La información pública disponible es muy escasa: el repositorio no incluye documentación técnica sobre datos de entrenamiento, hiperparámetros, licencia explícita ni idiomas soportados. La model card se limita a indicar el tipo de modelo, la plataforma de uso, la palabra de activación (`helomatteo_krea2`) y el archivo de pesos. Cualquier evaluación rigurosa de capacidades, sesgos o rendimiento queda por tanto fuera del alcance de esta ficha.

Su relevancia actual es limitada y de nicho: interesa a quienes trabajan con flujos de edición de imagen en ComfyUI y quieren incorporar un estilo o concepto concreto asociado a la palabra de activación. Para el resto de perfiles (desarrollo de software, investigación en IA, despliegue en producción) no aporta nada evaluable con los datos disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre modelo de difusión `krea2`; no disponible el detalle de la arquitectura base |
| Parametros totales | no disponible (el archivo de pesos ocupa 218 MiB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen) |
| Tipos de cuantizacion | no disponible; se distribuye en `safetensors` |
| Idiomas soportados | no disponible (las indicaciones de texto dependen del modelo base) |
| Licencia | no disponible; la model card remite a la licencia del proyecto original o del modelo upstream |
| Formato de pesos | `safetensors` (`helomatteo-krea2-krea-2-base-epoch-05.safetensors`, 218 MiB) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas del modelo base `krea2` para especializarlo. El nombre del archivo (`...krea-2-base-epoch-05.safetensors`) sugiere un entrenamiento de al menos cinco épocas sobre la base `krea2`, pero no se especifican el dataset, el número de pasos, la tasa de aprendizaje, el rango del LoRA ni la resolución de entrenamiento.

No hay información sobre si el ajuste se hizo con pares imagen-texto, con imágenes de referencia o mediante técnicas de personalización (DreamBooth, textual inversion, etc.). Tampoco se documenta ninguna innovación técnica asociada. La palabra de activación declarada es `helomatteo_krea2`.

## Capacidades

- Edición y generación de imágenes condicionada por texto, dentro del pipeline `image-text-to-image` del modelo base `krea2`.
- Aplicación de un concepto o estilo concreto mediante la palabra de activación `helomatteo_krea2`.
- Integración en flujos de ComfyUI y en la plataforma RunningHub.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión analítica, tool calling, agentes ni multilingüismo; el artefacto es exclusivamente un adaptador de imagen.
- No se documenta ningún modo especial (thinking, audio, vídeo) más allá del pipeline declarado.

## Casos de uso

- Prototipado de estilos en ComfyUI: cargar el LoRA junto al modelo base `krea2` y usar la palabra de activación para explorar variaciones visuales de un concepto concreto antes de fijar una dirección artística.
- Generación de ilustraciones para contenido editorial: aplicar el adaptador sobre un pipeline `image-text-to-image` para producir imágenes coherentes con un estilo definido por el autor del LoRA.
- Edición de imágenes de referencia: usar el pipeline `image-text-to-image` para transformar una imagen de entrada guiada por texto y el estilo del adaptador.
- Pruebas de concepto en la plataforma RunningHub: ejecutar el modelo alojado sin infraestructura propia, útil para evaluar si el estilo encaja antes de invertir en despliegue local.
- Automatización de variantes creativas: encadenar el LoRA en un grafo de ComfyUI para generar lotes de imágenes con el mismo concepto y seleccionar las mejores.
- Investigación sobre personalización de modelos de difusión: usar el adaptador como ejemplo de LoRA de bajo tamaño (218 MiB) para estudiar cómo afecta el ajuste fino al comportamiento del modelo base.
- No se recomienda su uso en escenarios que requieran garantías de licencia, trazabilidad de datos de entrenamiento o rendimiento medido, por la ausencia de documentación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador en sí; depende del modelo base `krea2`, que no se documenta en el repositorio.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; el tamaño del LoRA (218 MiB) es reducido, pero el consumo real lo determina el modelo base.
- Opciones de despliegue: ComfyUI, plataforma RunningHub (local o vía API). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de difusión de imagen.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (LoRA de edición de imagen sobre `krea2`) con datos verificables de parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Documentación mínima: no hay información sobre dataset de entrenamiento, hiperparámetros ni proceso de ajuste, lo que impide evaluar sesgos o calidad de forma rigurosa.
- Licencia no especificada: la model card remite a la licencia del proyecto original o del modelo upstream; no se puede confirmar el uso comercial sin consultar la licencia de `krea2`.
- Dependencia del modelo base: el adaptador solo funciona con `krea2`; sin ese modelo no es utilizable.
- Riesgo de sobreajuste al concepto: al ser un LoRA de estilo o sujeto con palabra de activación, puede reproducir sesgos o artefactos del material de entrenamiento, no documentados.
- Sin datos de benchmarks ni de evaluación cualitativa publicada por el autor.
- Idiomas no declarados: el comportamiento con indicaciones en castellano u otros idiomas distintos del inglés no está garantizado.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni de validación por la comunidad.
- La model card incluye un campo de descripción (`sfgjs`) sin contenido útil, lo que sugiere un proceso de publicación automatizado y poco cuidado.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-helomatteo-lora
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2123906757490909186
- Página del autor: https://www.runninghub.ai/user-center/2092799347577962498
- RunningHub International: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentación de la API (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
