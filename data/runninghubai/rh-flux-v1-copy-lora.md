# RunningHubAI/rh-flux-v1-copy-lora

## Resumen

`rh-flux-v1-copy-lora` es un adaptador LoRA (Low-Rank Adaptation) publicado por RunningHubAI, la cuenta institucional de la plataforma RunningHub, para su uso en flujos de generación de imágenes con ComfyUI. No se trata de un modelo de lenguaje ni de un modelo base autónomo: el repositorio contiene únicamente un archivo de pesos LoRA de 292 MiB (`Flux-胸部丰满身材_V1-copy.safetensors`) que debe cargarse sobre un modelo de difusión compatible para tener efecto. El nombre del archivo y el campo "Finetuned from: F1基础 D" de la model card apuntan a un adaptador de tipo corporal/estilismo sobre la familia FLUX, si bien el autor no documenta explícitamente el modelo base exacto ni la versión.

El interés práctico del repositorio es limitado desde el punto de vista de evaluación técnica: la model card es prácticamente vacía (el apartado descriptivo contiene el marcador de posición `<p>123123</p>`), no se declaran licencia, idiomas, pipeline ni métricas, y el modelo acumula 0 descargas y 0 likes en el momento de la consulta. Es, por tanto, un artefacto de distribución más que un modelo documentado.

Esta ficha se ha redactado con la información disponible y marca explícitamente como "no disponible" todo aquello que el autor no especifica. Cualquier dato sobre arquitectura interna, dataset o rendimiento del LoRA es desconocido; lo que se describe sobre el modelo base es una inferencia a partir del nombre del archivo y debe confirmarse antes de usarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un modelo de difusión; modelo base no confirmado (el nombre del archivo sugiere FLUX) |
| Parametros totales | no disponible (peso del adaptador: 292 MiB en un unico archivo `.safetensors`; el repo completo ocupa 0,3 GB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica / no disponible (no es un modelo de lenguaje; la longitud de prompt la define el modelo base) |
| Tipos de cuantizacion | no disponible (el archivo se distribuye en safetensors; no se declara precision, previsiblemente fp16/bf16) |
| Idiomas soportados | no disponible (el prompt textual depende del codificador de texto del modelo base) |
| Licencia | no disponible; la model card remite a "the original project or upstream license" y los derechos permanecen en el autor |
| Formato de pesos | safetensors (unico archivo: `Flux-胸部丰满身材_V1-copy.safetensors`) |

## Arquitectura y entrenamiento

No hay información técnica publicada sobre el entrenamiento. La model card solo indica el tipo de artefacto ("Model Type: LoRA"), la plataforma de destino (ComfyUI / RunningHub / Hugging Face) y la cadena de fine-tuning: "Finetuned from: F1基础 D", una etiqueta que no se acompaña de enlace, hash de revisión ni identificador de repositorio verificable. No se declaran hiperparámetros de entrenamiento (rank, alpha, learning rate, número de pasos), composición del dataset, resolución de entrenamiento ni técnicas de regularización.

Por el tamaño del archivo (292 MiB) se puede deducir que se trata de un adaptador de rango bajo sobre un transformer de difusión de gran tamaño, no de un modelo completo. El nombre del archivo (`Flux-胸部丰满身材_V1-copy`, traducible como "FLUX – figura de pecho voluminoso V1-copy") sugiere un LoRA de control de atributos corporales o de personaje, con posible orientación a contenido para adultos, extremo que el autor no aclara. El sufijo `-copy` y el marcador de posición en la descripción indican además que el repositorio parece una copia de trabajo subida desde la interfaz de RunningHub, sin curaduría posterior.

## Capacidades

- Modificación del estilo o de los atributos del sujeto generado por el modelo base: al ser un LoRA, su función es sesgar la generación del modelo de difusión subyacente hacia el concepto aprendido.
- Integración en flujos de ComfyUI mediante el nodo estándar de carga de LoRA (`Load LoRA`), con control del peso de aplicación (strength model/clip) por parte del usuario.
- Ejecución en la plataforma RunningHub y uso del modelo original alojado en su catálogo público.
- Generación de imágenes condicionada por prompt de texto: la capacidad real (resolución, calidad, soporte de img2img o inpainting) depende enteramente del modelo base sobre el que se aplique.
- Soporte de tool calling / function calling: no (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no.
- Capacidades multilingües: no disponible; el idioma del prompt lo determina el codificador de texto del modelo base.
- Capacidades especiales (modo thinking, visión, audio): no disponibles; ninguna declarada por el autor.

## Casos de uso

- Prototipado de personajes en ComfyUI: el LoRA se cargaría sobre el modelo base con un strength ajustable para explorar variaciones de complexión de un personaje antes de fijar un diseño definitivo en un pipeline de ilustración.
- Previsualización de patronaje o silueta en diseño de moda: generación rápida de figuras con una complexión concreta para evaluar proporciones y volúmenes antes de modelar en 3D, siempre que la licencia del modelo base lo permita.
- Creación de assets de referencia para juegos o cómics: generación de hojas de personaje consistentes combinando el LoRA con técnicas de fijación de semilla y ControlNet.
- Investigación sobre control de atributos en modelos de difusión: el adaptador sirve como ejemplo de LoRA de atributo único para estudiar cómo el strength y el prompt interactúan con el sesgo aprendido.
- Auditoría de sesgos y seguridad de contenido: útil para evaluar cómo un adaptador de este tipo afecta a la diversidad de cuerpos generados y para calibrar filtros en un pipeline de moderación.
- Evaluación de la cadena de distribución de RunningHub: caso de estudio de un repositorio generado automáticamente desde la plataforma, con model card incompleta, para analizar qué metadatos mínimos debería exigir un registro de modelos.
- Automatización por API: invocación del modelo original alojado en RunningHub mediante su API HTTP para integrar la generación en un servicio externo, sujeto a los términos de la plataforma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El autor no incluye métricas objetivas (FID, CLIP score, similitud de concepto), comparaciones visuales ni evaluaciones de calidad. Tampoco se declara el modelo base exacto, por lo que no es posible atribuir ningún resultado medido a este adaptador.

## Requisitos de hardware

- VRAM del adaptador: despreciable por sí mismo (292 MiB). El coste real lo determina el modelo base, no el LoRA.
- Requisito dominante: cargar el modelo de difusión base completo. Si se confirma que es de la familia FLUX.1 (~12 000 millones de parámetros), en bf16/fp16 requiere del orden de 22-24 GB de VRAM, cifra que debe verificarse contra la versión concreta del modelo base.
- GPU recomendadas para el conjunto base + LoRA: A100 40/80 GB, H100 80 GB o L40S para despliegue concurrente; RTX 4090 (24 GB) para inferencia en bf16 con una sola imagen a la vez.
- GPU de consumo: viable en RTX 4090 (24 GB) y, con cuantización fp8 o GGUF del modelo base, en RTX 3090 (24 GB), RTX 4080 (16 GB) y potencialmente en GPU de 12-16 GB con cuantizaciones agresivas y resoluciones moderadas.
- Opciones de despliegue: ComfyUI (soporte nativo de LoRA), diffusers con `load_lora_weights`, RunningHub (plataforma de origen) y su API. Para llama.cpp/Ollama/TGI/vLLM no aplica: son runtimes de modelos de lenguaje, no de difusión.
- Latencia y throughput: no disponibles. No hay datos publicados de tiempo por imagen ni de imágenes por segundo.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-flux-v1-copy-lora | LoRA sobre difusión (base no confirmada) | no disponible (adaptador de 292 MiB) | no aplica | no disponible | Hugging Face, RunningHub |
| LoRA de concepto/estilo para FLUX (ecosistema general) | LoRA sobre difusión | típicamente 50-350 MiB | no aplica | variable según autor; el modelo base FLUX.1 [dev] es de uso no comercial | Hugging Face, Civitai, plataformas de training |
| IP-Adapter / ControlNet para modelos de difusión | Adaptador de imagen de referencia / control estructural | no disponible | no aplica | variable según implementación | Hugging Face, ComfyUI |
| Modelos de difusión completos tipo SDXL o FLUX.1 | Modelo base generativo | ~2 600 M (SDXL) / ~12 000 M (FLUX.1) | no aplica | abierta con restricciones (SDXL) / no comercial (FLUX.1 dev) | Hugging Face, Stability, BFL |

La comparación directa con otros LoRA concretos no está disponible: el autor no publica resultados ni declara el modelo base, lo que impide emparejarlo con adaptadores equivalentes de forma rigurosa.

## Limitaciones y advertencias

- Documentación inexistente: la descripción del modelo contiene el texto de relleno `<p>123123</p>` y no hay información sobre entrenamiento, dataset, hiperparámetros ni modelo base exacto.
- Licencia no declarada: la model card se limita a remitir a la licencia del proyecto original o *upstream*. Si el base es FLUX.1 [dev], su licencia es de uso no comercial, lo que condicionaría cualquier explotación comercial del LoRA. Es imprescindible verificar la cadena de licencias antes de usarlo.
- Trazabilidad dudosa: el sufijo `-copy` en el nombre del archivo y la ausencia de metadatos sugieren una copia subida desde la plataforma sin curaduría; no hay garantía de que el adaptador corresponda a la descripción.
- Contenido potencialmente para adultos: el nombre del archivo alude a una complexión corporal concreta y el modelo se distribuye sin filtros ni advertencias; conviene evaluar su salida y aplicar moderación si se integra en un producto.
- Sesgos probables: los LoRA de atributo corporal tienden a estrechar la diversidad de cuerpos generados y a reforzar cánones estéticos concretos; no hay ninguna evaluación publicada al respecto.
- Riesgo de artefactos anatómicos: en adaptadores de este tipo son frecuentes las deformaciones en manos, extremidades y proporciones, especialmente con strengths altos; no se documenta el rango de peso recomendado.
- Sin métricas de calidad: no hay forma de comparar objetivamente su fidelidad al concepto con alternativas.
- Adopción nula: 0 descargas y 0 likes en el momento de la consulta, sin evidencia de uso en producción ni de validación por terceros.
- Dependencia total del modelo base: cualquier limitación de resolución, idioma del prompt o calidad del modelo subyacente se hereda sin que el LoRA pueda compensarla.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RunningHubAI/rh-flux-v1-copy-lora
- README en chino: https://huggingface.co/RunningHubAI/rh-flux-v1-copy-lora/blob/main/README_cn.md
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2091456657461555201
- Página del autor: https://www.runninghub.ai/user-center/2060424072940318722
- RunningHub (sitio internacional): https://www.runninghub.ai
- RunningHub (sitio China): https://www.runninghub.cn
- Documentación de la API (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Servicio de entrenamiento de RunningHub: https://www.runninghub.ai/page-model
- Ejemplo de llamada a la API: https://www.runninghub.ai/call-api/api-detail/2133100000000700025
