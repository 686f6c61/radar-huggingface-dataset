# RunningHubAI/rh-zit-ai4-lora

## Resumen

`rh-zit-ai4-lora` es un adaptador LoRA de generación de imagen a partir de texto (text-to-image) publicado en Hugging Face por RunningHubAI en nombre del autor identificado en la model card como «Red gaga». No es un modelo completo: se trata de un ajuste fino de bajo rango sobre el modelo base Z-image-turbo, distribuido como un único fichero `safetensors` de 162 MiB dentro de un repositorio de 0,2 GB. Está etiquetado para ComfyUI y para la plataforma RunningHub, y su pipeline declarado es `text-to-image`.

El modelo resuelve el problema típico de los LoRA de difusión: especializar un modelo base genérico hacia un sujeto, personaje o estilo concreto sin reentrenar el modelo completo, de forma que el adaptador se carga encima del base y se puede mezclar con otros. El nombre del fichero incluido (`ZIT 咸咸的丽丽 红鸭子AI会所第4号.safetensors`) sugiere un adaptador de personaje o sujeto, aunque la model card no lo documenta explícitamente.

Su relevancia es limitada y hay que enmarcarla con honestidad: el repositorio no incluye información sobre dataset, rango del adaptador, hiperparámetros, palabras de activación, licencia ni evaluación alguna, y acumula 0 descargas y 0 me gusta en el momento de la consulta. Es útil como ejemplo del flujo de publicación automatizada de LoRA de RunningHub, no como una referencia técnica verificable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (ajuste de bajo rango) sobre el modelo base Z-image-turbo, de tipo text-to-image; la arquitectura interna del modelo base no está disponible en la información proporcionada |
| Parametros totales | No disponible; el adaptador se distribuye como un único fichero safetensors de 162 MiB (el número de parámetros del modelo base no se documenta) |
| Longitud de contexto | No aplica (generación de imagen); la longitud de prompt admitida por el modelo base no está disponible |
| Tipos de cuantizacion | No disponible; el repositorio solo publica pesos en safetensors, sin variantes GGUF, fp8 ni cuantizaciones declaradas |
| Idiomas soportados | No disponible; la model card está en chino e inglés, pero no se documentan los idiomas admitidos en los prompts |
| Licencia | No disponible; la model card remite a la licencia del proyecto original o upstream y mantiene el copyright del autor |
| Formato de pesos | safetensors (pesos del adaptador LoRA) |
| Modelo base | Z-image-turbo (según «Finetuned from» de la model card) |
| Pipeline declarado | text-to-image |
| Compatibilidad | ComfyUI, plataforma RunningHub y Hugging Face |
| Tamano del repositorio | 0,2 GB (fichero de pesos de 162 MiB) |
| Etiquetas | comfyui, lora, text-to-image, region:us |
| Fecha de creacion / actualizacion | 2026-10-25T17:37:00Z / 2026-10-25T17:38:02Z |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas del modelo base Z-image-turbo para desplazar su distribución de salida hacia el concepto aprendido. El repositorio no publica el rango (rank), el valor de alpha, las capas objetivo, la resolución de entrenamiento, el número de pasos, el optimizador ni la composición del dataset. Tampoco indica si el ajuste se hizo con captions descriptivas o con una palabra de activación dedicada, ni si se aplicó algún tipo de regularización o de aumento de datos.

No hay información sobre el proceso de entrenamiento más allá de la referencia genérica a las herramientas de entrenamiento de RunningHub. Se desconoce si el adaptador se entrenó sobre imágenes propias del autor, si se generaron sintéticamente o si derivan de material con derechos de terceros. Tampoco se documenta ninguna innovación técnica asociada (por ejemplo, decodificación especulativa, atención lineal o destilación), algo esperable en un adaptador de este tipo, donde toda la innovación arquitectónica reside en el modelo base.

## Capacidades

- Especialización visual de un modelo de difusión: aplica el concepto aprendido (presumiblemente un personaje o un estilo, a partir del nombre del fichero) sobre las generaciones del modelo base Z-image-turbo.
- Carga en ComfyUI mediante el nodo de carga de LoRA estándar, apilable con otros adaptadores y con nodos de control (ControlNet, IP-Adapter) si el base los soporta.
- Ajuste de intensidad mediante el peso del LoRA en la cadena de muestreo, lo que permite graduar la influencia del concepto sobre la imagen final.
- Generación de imagen a partir de texto, heredada íntegramente del modelo base; el adaptador por sí solo no genera nada.
- Integración en flujos de trabajo de la plataforma RunningHub, incluyendo su API, según los enlaces de la model card.
- No dispone de generación de texto, razonamiento, código, matemáticas, tool calling, capacidades de agente, visión artificial ni audio. No es un modelo de lenguaje.
- Capacidades multilingües de prompt: no documentadas.

## Casos de uso

- **Consistencia de personaje en ilustración seriada**: cargando el LoRA sobre Z-image-turbo en ComfyUI y fijando una semilla y un peso estable, se puede mantener un mismo personaje a lo largo de varias ilustraciones, algo crítico en cómic, novela gráfica o webtoon.
- **Hojas de personaje para preproducción**: generación de vistas frontales, de perfil y de expresiones de un mismo sujeto para entregar a un equipo de modelado 3D o de animación, sustituyendo parte del trabajo de conceptualización manual.
- **Prototipado rápido de arte conceptual**: iteración de variantes de un personaje sobre el modelo base para explorar direcciones visuales antes de encargar arte final a un ilustrador.
- **Pipelines automatizados vía API de RunningHub**: el adaptador está pensado para ejecutarse en esa plataforma, de modo que se puede invocar un flujo de generación por API y producir lotes de imágenes sin infraestructura propia de GPU.
- **Composición con otros LoRA**: combinación del adaptador de personaje con un LoRA de estilo o de iluminación para obtener imágenes coherentes con una dirección de arte concreta, ajustando pesos relativos en el grafo de ComfyUI.
- **Generación de avatares y retratos temáticos**: creación de imágenes de perfil o retratos estilizados para comunidades, canales o material promocional, con la ventaja de que el concepto ya está aprendido y no requiere prompts largos.
- **Exploración de estilo para moodboards**: generación de tableros de referencia visuales para pitching de producto o campaña, siempre que la licencia del base y del adaptador lo permita (extremo no confirmado).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye métricas objetivas de calidad de imagen (FID, CLIP score, aesthetic score, similitud facial o de identidad), ni comparaciones controladas frente al modelo base sin el adaptador, ni evaluaciones de adherencia al prompt. Tampoco hay datos de latencia o de rendimiento del adaptador.

## Requisitos de hardware

- **VRAM del adaptador**: 162 MiB en disco; en memoria suponen aproximadamente 0,16 GB adicionales, una carga despreciable frente al modelo base.
- **VRAM total**: la determina íntegramente Z-image-turbo, cuyos requisitos no están disponibles en la información proporcionada.
- **GPU recomendadas**: no disponible para el modelo base. El adaptador en sí no impone ninguna restricción de GPU.
- **GPU de consumo**: no se puede confirmar sin los requisitos del base; el LoRA no añade un coste apreciable de memoria.
- **Opciones de despliegue**: ComfyUI (documentado por las etiquetas y la model card) y la plataforma RunningHub, incluyendo su API. vLLM, llama.cpp, Ollama y TGI no aplican, al no tratarse de un modelo de lenguaje.
- **Latencia y throughput**: no disponible; no hay cifras de tiempo por imagen ni de imágenes por segundo publicadas.

## Comparativa con modelos similares

| Modelo | Autor | Base | Tamano del adaptador | Contexto | Licencia | Descargas / me gusta |
|---|---|---|---|---|---|---|
| rh-zit-ai4-lora | RunningHubAI | Z-image-turbo | 162 MiB | No aplica | No disponible | 0 / 0 |
| rh-zit-ai091-lora | RunningHubAI | No disponible (prefijo «zit» sugiere Z-image-turbo) | No disponible | No aplica | No disponible | No disponible |
| rh-zit-lora | RunningHubAI | No disponible | No disponible | No aplica | No disponible | No disponible |
| rh-zit-lora-2062697003850756098 | RunningHubAI | No disponible | No disponible | No aplica | No disponible | No disponible |
| rh-zit-lora-2113173468962443265 | RunningHubAI | No disponible (la model card menciona el modelo «zimage» y pesos de 0,45 a 0,75) | No disponible | No aplica | No disponible | No disponible |

Los cuatro adaptadores comparables pertenecen al mismo publicador y siguen el mismo patrón de repositorio: un único fichero safetensors, una model card mínima y enlaces promocionales a RunningHub. Ninguno de ellos publica métricas, datasets ni licencia explícita, por lo que la comparación solo puede hacerse por procedencia y formato, no por calidad.

## Limitaciones y advertencias

- **Licencia ausente**: no se declara una licencia concreta. La model card remite a la del proyecto upstream, de modo que no se puede asumir uso comercial sin verificar previamente la licencia de Z-image-turbo y contactar con el autor.
- **Documentación mínima**: no hay palabras de activación, rango, hiperparámetros, dataset ni instrucciones de uso. Esto hace imposible reproducir el entrenamiento o depurar resultados pobres con criterio.
- **Dependencia del modelo base**: el adaptador no funciona de forma autónoma; requiere descargar Z-image-turbo y cumplir su licencia, lo que añade VRAM y obligaciones adicionales.
- **Sobreajuste no verificable**: al desconocerse el tamaño del dataset, no se puede descartar que el LoRA reproduzca exactamente las imágenes de entrenamiento (memorización) o que pierda generalización fuera del dominio aprendido.
- **Riesgo de derechos de imagen**: si el adaptador modela un personaje o una persona concreta, como sugiere el nombre del fichero, su uso puede vulnerar derechos de imagen o de propiedad intelectual. No hay información sobre la procedencia de las imágenes ni sobre consentimiento.
- **Sesgos**: no documentados. Cualquier sesgo de representación heredado de Z-image-turbo o del dataset del adaptador (género, etnia, corporalidad) es desconocido y no ha sido evaluado.
- **Alucinación**: el concepto no aplica en sentido textual; el riesgo equivalente es la deriva visual, es decir, que el concepto aparezca en imágenes donde no se ha pedido o que deforme anatomías y detalles.
- **Idioma de los prompts**: no confirmado. La model card mezcla chino e inglés y el nombre del fichero está en chino, lo que puede provocar un rendimiento desigual con prompts en castellano.
- **Nombre de fichero problemático**: contiene caracteres no ASCII y espacios (`ZIT 咸咸的丽丽 红鸭子AI会所第4号.safetensors`), lo que puede romper scripts, rutas y herramientas que no gestionen UTF-8 o espacios sin escapar.
- **Sin validación comunitaria**: 0 descargas y 0 me gusta; el repositorio se creó y actualizó con un minuto de diferencia, un patrón típico de publicación automatizada en serie sin revisión posterior.
- **Contenido promocional**: la model card incluye enlaces de invitación con código de referido y monedas de plataforma, lo que conviene tener en cuenta al evaluar la independencia del material.
- **Sin control de versiones útil**: un único fichero de pesos y sin historial de iteraciones que permita comparar calidades entre versiones.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/RunningHubAI/rh-zit-ai4-lora
- Model card en chino: https://huggingface.co/RunningHubAI/rh-zit-ai4-lora/blob/main/README_cn.md
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2111258212728385537
- Página del autor en RunningHub: https://www.runninghub.ai/user-center/2027638706101559298
- Aplicación recomendada en la model card: https://www.RunningHub.ai/zh-cn/ai-detail/2109474939329163266
- Documentación de la API de RunningHub (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API de RunningHub (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Detalle de la API de Seedance 2.5: https://www.runninghub.ai/call-api/api-detail/2133100000000700025
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- RunningHub (sitio internacional): https://www.runninghub.ai
- RunningHub (sitio de China): https://www.runninghub.cn
- Adaptadores relacionados del mismo autor: https://huggingface.co/RunningHubAI/rh-zit-lora · https://huggingface.co/RunningHubAI/rh-zit-ai091-lora · https://huggingface.co/RunningHubAI/rh-zit-lora-2062697003850756098 · https://huggingface.co/RunningHubAI/rh-zit-lora-2113173468962443265
