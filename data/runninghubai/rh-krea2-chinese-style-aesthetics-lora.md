# RunningHubAI/rh-krea2-chinese-style-aesthetics-lora

## Resumen

rh-krea2-chinese-style-aesthetics-lora es un adaptador LoRA de edición y generación de imágenes publicado por RunningHub (cuenta de usuario RunningHubAI, autor acreditado @GOODLUCK2024) en su plataforma de modelos y replicado en Hugging Face. No es un modelo completo: es un conjunto de pesos de bajo rango que se aplica sobre el modelo base identificado por el autor como "krea2", del que no se aporta versión, hash ni ficha técnica. Su función declarada es incorporar una estética "chinese-style" (estética de estilo chino) a la generación image-text-to-image dentro de flujos de ComfyUI.

El repositorio contiene un único archivo, `Chinese-style aesthetics.safetensors`, de 224 MiB (0,2 GB de repositorio total), etiquetado con los tags `comfyui`, `lora`, `image-text-to-image` y `region:us`. La model card es esencialmente una ficha de plataforma: enlaces a RunningHub, instrucciones para entrenar y ejecutar modelos en su infraestructura y un ejemplo de prompt, pero sin datos de entrenamiento, sin hiperparámetros del LoRA (rango, alpha, target modules), sin ejemplos comparativos de antes/después y sin resultados de evaluación.

Su relevancia actual es limitada y de nicho: interesa a quien ya trabaje con el modelo base "krea2" en ComfyUI y quiera un ajuste de estilo ligero y fácil de cargar. Conviene señalar que el repositorio no registra descargas ni likes, se creó y actualizó en el mismo minuto (20 de octubre de 2026) y no incluye licencia explícita, por lo que debe tratarse como un artefacto experimental sin garantías de soporte ni de trazabilidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo base "krea2"; arquitectura interna del base no disponible |
| Parámetros totales | No disponible (el autor no publica recuento de parámetros; el único peso ocupa 224 MiB en safetensors) |
| Longitud de contexto | No aplica (modelo de imagen); resolución nativa del modelo base no disponible |
| Tipos de cuantización | No disponible; se distribuye un único `.safetensors` sin variantes GGUF/FP8 declaradas |
| Idiomas soportados | No disponibles (no se declara soporte idiomático del texto de los prompts) |
| Licencia | No disponible; la model card indica "Copyright remains with the author. Follow the original project or upstream license" |
| Formato de pesos | safetensors (`Chinese-style aesthetics.safetensors`, 224 MiB) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en capas del modelo base para modificar su comportamiento sin reentrenar los pesos originales. El autor indica únicamente "Finetuned from: krea2", sin especificar si el base es un transformer de difusión (DiT), un U-Net convolucional o un modelo híbrido, ni qué módulos (attention QKV, proyecciones de salida, capas cruzadas de texto) fueron adaptados. Tampoco se publican el rango `r`, el `alpha`, el dropout, la tasa de aprendizaje ni el número de pasos de entrenamiento.

No hay información sobre el dataset: ni número de imágenes, ni resolución, ni procedencia, ni si se usaron pares imagen-imagen (el pipeline declarado es `image-text-to-image`, lo que sugiere capacidad de edición además de generación), ni si hubo filtrado o anotación automática con modelos de captioning. No se documenta ningún mecanismo de alineación (RLHF, DPO) —poco habitual en adaptadores de estilo— ni innovaciones técnicas como decodificación especulativa o atención lineal, que en este dominio no aplicarían. El ejemplo incluido en la model card es un prompt descriptivo largo en inglés sobre un retrato fotorrealista de una mujer con ropa tradicional japonesa (kimono blanco y chal verde claro), lo que resulta inconsistente con el nombre "chinese-style" del adaptador y sugiere que el texto se tomó de la imagen de muestra sin normalizar.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image) condicionada por el estilo aprendido, siempre que se cargue junto al modelo base "krea2".
- Edición de imágenes guiadas por texto (image-text-to-image), según el `pipeline_tag` declarado; no se documenta el flujo exacto (img2img, inpainting, referencia).
- Transferencia de estética: el propósito declarado es imprimir un acabado visual "chinese-style" sobre las generaciones del base.
- Integración nativa en ComfyUI como nodo de carga de LoRA, y uso en la plataforma alojada RunningHub.
- No hay evidencia de soporte de tool calling, function calling, razonamiento multi-paso ni capacidades de agente: es un modelo generativo de imagen, no un LLM.
- No se declaran capacidades multilingües en los prompts, ni modo "thinking", ni entrada/salida de audio o vídeo.
- No se documenta ningún token o palabra de activación (trigger word) para invocar el estilo.

## Casos de uso

- Ilustración editorial con estética china: cargar el LoRA sobre "krea2" en un grafo de ComfyUI y generar ilustraciones para artículos sobre cultura, historia o diseño asiático, aprovechando que el adaptador es ligero (224 MiB) y se puede activar o desactivar por nodo.
- Pruebas de dirección de arte: comparar en un mismo prompt la salida del base con y sin el LoRA para decidir si el acabado encaja en la identidad visual de un proyecto, con un coste de almacenamiento mínimo.
- Prototipado rápido de variantes de estilo: al ser un adaptador de bajo rango, permite encadenarlo o alternarlo con otros LoRA de la misma familia en un pipeline de exploración de estilos sin reentrenar el base.
- Generación de material de marketing para campañas con temática asiática: banners, fondos y piezas de redes sociales producidas por lotes mediante la API de RunningHub, que el autor enlaza explícitamente como vía de ejecución alojada.
- Enseñanza y demostraciones de LoRA: sirve como ejemplo didáctico de adaptador de estilo en talleres de difusión, porque el archivo es pequeño y se carga en un solo nodo de ComfyUI.
- Iteración de imagen a imagen sobre bocetos: usar el pipeline image-text-to-image declarado para repintar o reestilizar material fotográfico existente hacia la estética del adaptador, sujeto a verificación empírica del comportamiento real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas objetivas (FID, CLIP score, SSIM), ni comparaciones con el modelo base sin el adaptador, ni ejemplos de imagen antes/después que permitan evaluar la magnitud del cambio de estilo.

## Requisitos de hardware

- VRAM para inferencia: no disponible. El consumo lo determina íntegramente el modelo base "krea2", cuyas especificaciones no se publican; el adaptador añade una sobrecarga marginal (224 MiB en disco, decenas de megabytes en memoria una vez fusionado o cargado).
- GPU recomendadas: no disponibles para el conjunto LoRA + base. Al no conocerse el tamaño del base, no es posible afirmar si cabe en GPU de consumo.
- Cabe en GPU de consumo: no confirmable con la información disponible.
- Opciones de despliegue: ComfyUI (soporte declarado por los tags y la propia ficha) y la plataforma alojada RunningHub / su API. No se documenta compatibilidad con vLLM, TGI, llama.cpp ni Ollama, que además no son herramientas orientadas a difusión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de otros adaptadores comparables en la información proporcionada (parámetros, contexto, benchmarks, licencia). La comparación siguiente es categórica, sobre el tipo de técnica, no sobre modelos concretos:

| Enfoque | Tamaño típico del artefacto | Flexibilidad de estilo | Coste de entrenamiento | Licencia en este caso |
|---|---|---|---|---|
| LoRA de estilo (este modelo) | 224 MiB (dato del repo) | Alta: se activa o desactiva por nodo, combinable | Bajo | No disponible |
| Fine-tuning completo del base | Del orden del modelo base (no disponible) | Alta, pero monolítica | Alto | No disponible |
| Embedding / textual inversion | Unos pocos KB (referencia general) | Media: captura conceptos acotados | Muy bajo | No disponible |
| Adaptadores de referencia de imagen (tipo IP-Adapter) | Cientos de MB (referencia general) | Media-alta: condiciona por imagen de referencia | N/A (suele ser preentrenado) | No disponible |

No se identifican en la documentación modelos alternativos concretos de la misma familia "krea2" con los que comparar parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Ausencia total de evaluación: cero descargas y cero likes en el momento de la ficha, sin métricas ni ejemplos verificables; no hay evidencia pública de que el estilo se aplique correctamente.
- Licencia ambigua: la ficha remite al "original project or upstream license" sin nombrarla. Uso comercial no garantizado; requiere contactar con el autor o con RunningHub antes de producción.
- Dependencia crítica del base: sin la versión exacta de "krea2" los pesos pueden no cargar o producir resultados degradados. El autor no fija versión, hash ni enlace al base.
- Inconsistencia documental: el nombre indica estética china, pero el prompt de ejemplo describe vestimenta tradicional japonesa (kimono y chal), lo que siembra dudas sobre el contenido real del entrenamiento.
- Sin palabra de activación documentada: no se sabe si el estilo se aplica de forma global o requiere un token concreto en el prompt.
- Riesgo de sobreajuste de estilo: los LoRA de estética agresivos pueden reducir la fidelidad al prompt y homogeneizar las composiciones; no hay información sobre la intensidad recomendada (peso típico del LoRA).
- Idiomas no declarados: se desconoce si los prompts en castellano funcionan; el único ejemplo está en inglés.
- Sesgos: no documentados. Al ser un adaptador de retrato/estética, puede heredar sesgos de representación del dataset del base y del propio ajuste (edad, género, fenotipo), sin que exista model card ética que los aborde.
- Riesgo de alucinación visual y artefactos: no cuantificado; sin muestras no es posible estimar la tasa de imágenes defectuosas.
- Madurez del repositorio: creado y actualizado en el mismo minuto, con un único archivo y sin historial de versiones; tratar como experimento, no como dependencia estable.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-krea2-chinese-style-aesthetics-lora
- README en chino: https://huggingface.co/RunningHubAI/rh-krea2-chinese-style-aesthetics-lora/blob/main/README_cn.md
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2090095748155645953
- Página del autor (@GOODLUCK2024): https://www.runninghub.ai/user-center/1980864188878884866
- RunningHub (internacional): https://www.runninghub.ai
- RunningHub (China): https://www.runninghub.cn
- Documentación de la API (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
