# RunningHubAI/rh-hyinkstyle-b-v1-lora

## Resumen

rh-hyinkstyle-b-v1-lora es un adaptador LoRA para edición y generación de imágenes condicionada por texto, publicado por RunningHubAI en Hugging Face. No se trata de un modelo base completo, sino de un conjunto de pesos de ajuste fino (218 MiB en un único archivo `safetensors`) que se carga sobre un modelo de difusión subyacente identificado en la model card como `krea2`. Su función es aplicar un estilo visual concreto: la model card lo describe como "2D国风水墨", es decir, un estilo de pintura a la tinta china dentro de la tradición gráfica nacional china (guofeng), orientado a ilustración 2D.

El adaptador está pensado para ejecutarse en ComfyUI, RunningHub o Hugging Face, y emplea la palabra de activación `hyinkstyle` para inducir el estilo. El repositorio tiene un tamaño de 0,2 GB, cero descargas y cero likes en el momento de la consulta, y fue creado y actualizado el 5 de noviembre de 2026. La información técnica publicada es mínima: no se detallan parámetros totales, longitud de contexto, composición del dataset de entrenamiento ni resultados de evaluación.

Por su naturaleza, este artefacto es relevante para quienes construyen flujos de generación de imágenes con estilos artísticos específicos en ComfyUI y necesitan un LoRA ligero que no requiere reentrenar el modelo base. No obstante, la ausencia de licencia explícita, de idiomas declarados y de benchmarks limita seriamente su evaluación para uso en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre modelo de difusión `krea2`; arquitectura del modelo base no disponible |
| Parámetros totales | no disponible (pesos LoRA de 218 MiB) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen; no aplica contexto textual) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (la palabra de activación es `hyinkstyle`) |
| Licencia | no disponible; la model card indica que el copyright permanece con el autor y que debe seguirse la licencia del proyecto original o upstream |
| Formato de pesos | safetensors (`hyinkstyle_B_v1.safetensors`, 218 MiB) |

## Arquitectura y entrenamiento

El artefacto es un LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas del modelo base para modificar su comportamiento sin alterar los pesos originales. La model card indica que se ha ajustado a partir de `krea2`, pero no especifica la arquitectura de ese modelo base (tipo de difusión, número de parámetros, variante de transformer o U-Net), ni el rango del LoRA, ni las capas objetivo. Tampoco se documenta el número de pasos de entrenamiento, el tamaño o la composición del dataset, ni si se emplearon técnicas como regularización por clase, caption dropout o ajuste de learning rate diferencial.

La única innovación declarada es estilística: el adaptador codifica un estilo de pintura a la tinta 2D de inspiración china, activado mediante la palabra `hyinkstyle`. No hay información sobre resolución de entrenamiento, relación de aspecto, uso de embeddings textuales adicionales ni sobre posibles capas de control (ControlNet, IP-Adapter) con las que sea compatible.

## Capacidades

- Generación de imágenes condicionada por texto (pipeline `image-text-to-image`) con un estilo de pintura a la tinta 2D de inspiración china.
- Edición de imágenes existentes dentro del flujo de ComfyUI, según la model card ("LoRA (image edit)").
- Activación de estilo mediante la palabra clave `hyinkstyle` en el prompt.
- Integración con ComfyUI, RunningHub y Hugging Face como plataformas de ejecución.
- Compatibilidad con el modelo base `krea2`; no se documenta compatibilidad con otros modelos.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento (thinking), dado que es un adaptador de imagen y no un modelo de lenguaje.

## Casos de uso

- **Ilustración editorial con estética de tinta china**: cargar el LoRA en ComfyUI sobre `krea2` y usar el prompt con `hyinkstyle` para generar ilustraciones de artículos, portadas o carteles con un estilo coherente y reproducible.
- **Creación de assets para videojuegos 2D**: generar variaciones de personajes, escenarios o iconos con un lenguaje visual homogéneo, aprovechando que el adaptador es ligero (218 MiB) y puede intercambiarse en el grafo de ComfyUI sin recargar el modelo base.
- **Prototipado rápido de direcciones de arte**: producir lotes de imágenes de referencia para presentar a clientes o equipos de diseño antes de encargar ilustraciones finales, con coste computacional bajo al ser un LoRA.
- **Edición de imágenes existentes**: aplicar el estilo a fotografías o bocetos previos mediante el flujo de image edit, útil para adaptar material gráfico heredado a una campaña con estética guofeng.
- **Generación de material para redes sociales**: crear ilustraciones de formato variable con un estilo reconocible para publicaciones periódicas, usando la palabra de activación para mantener consistencia entre piezas.
- **Exploración artística e investigación de estilos**: estudiar cómo un LoRA de bajo rango modifica la distribución de salida de un modelo de difusión, comparando resultados con y sin el adaptador en el mismo seed y prompt.
- **Automatización vía API de RunningHub**: invocar el modelo a través de la API documentada por RunningHub para integrar la generación estilizada en un pipeline de producción sin gestionar infraestructura propia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas cuantitativas (FID, CLIP score, similitud estilística), comparaciones con otros LoRA ni evaluaciones humanas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el LoRA aislado; depende enteramente del modelo base `krea2`, cuyas especificaciones no se documentan. El adaptador en sí ocupa 218 MiB en disco.
- GPU recomendadas: no disponibles. Al tratarse de un LoRA sobre un modelo de difusión, el requisito real vendrá marcado por `krea2`.
- Compatibilidad con GPU de consumo: no confirmada; depende del modelo base y de la cuantización aplicada a este.
- Opciones de despliegue: ComfyUI (plataforma principal declarada), RunningHub (plataforma en la nube y API) y Hugging Face. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de difusión de imagen.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros LoRA de estilo comparables ni datos de rendimiento que permitan una comparación rigurosa con alternativas de la misma categoría.

## Limitaciones y advertencias

- **Licencia no especificada**: la model card no declara una licencia concreta; indica que el copyright permanece con el autor y que debe seguirse la licencia del proyecto original o upstream. Esto impide determinar si el uso comercial está permitido y obliga a verificar la licencia de `krea2` antes de cualquier despliegue en producción.
- **Dependencia del modelo base**: el LoRA solo funciona sobre `krea2`; no se documenta compatibilidad con otros modelos de difusión, lo que limita su portabilidad.
- **Documentación técnica mínima**: no se especifican rango del LoRA, capas objetivo, resolución de entrenamiento, dataset ni hiperparámetros, lo que dificulta reproducir o depurar el comportamiento.
- **Riesgo de sobreajuste estilístico**: al ser un adaptador de estilo, puede forzar la estética de tinta china incluso cuando el prompt no lo requiera, si la palabra de activación aparece por error o si el peso del LoRA es alto.
- **Sesgos culturales y de representación**: el estilo se enmarca en la tradición gráfica china; puede producir resultados estereotipados o inadecuados al aplicarse a sujetos culturalmente alejados de ese contexto.
- **Sin datos de evaluación**: no hay benchmarks, evaluaciones humanas ni métricas que permitan estimar la calidad o la fidelidad al estilo prometido.
- **Madurez del repositorio**: cero descargas y cero likes en el momento de la consulta, creado y actualizado el mismo día, lo que sugiere un artefacto recién publicado y sin validación comunitaria.
- **Idiomas no declarados**: se desconoce si los prompts funcionan igual de bien en inglés, castellano o chino; la única indicación es la palabra de activación `hyinkstyle`.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-hyinkstyle-b-v1-lora
- Modelo original en RunningHub: https://www.runninghub.cn/model/public/2117191545853136897
- Página del autor en RunningHub: https://www.runninghub.cn/user-center/1930907604745101314
- RunningHub International: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentación de la API (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
- README en chino: https://huggingface.co/RunningHubAI/rh-hyinkstyle-b-v1-lora/blob/main/README_cn.md
