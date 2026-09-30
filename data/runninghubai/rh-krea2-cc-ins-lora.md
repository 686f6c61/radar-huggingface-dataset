# RunningHubAI/rh-krea2-cc-ins-lora

## Resumen

rh-krea2-cc-ins-lora es un adaptador LoRA de edición de imagen publicado por RunningHubAI (RunningHub) sobre el modelo base Krea 2. El adaptador incorpora un estilo muy concreto: retrato de tipo influencer con acabado "INS" (estética de red social, iluminación cuidada y tratamiento de piel característico). El repositorio contiene un único archivo de pesos en formato safetensors de 327 MiB, `krea2-Cc-Ins风-人像.safetensors`.

Se distribuye exclusivamente como adaptador: no incluye pesos del modelo base, tokenizer ni pipeline de inferencia. Está pensado para cargarse sobre Krea 2 en ComfyUI, en la plataforma RunningHub o a través de la API de RunningHub. La model card recomienda aplicar el adaptador con un peso (strength) entre 0,7 y 1,2.

La relevancia práctica es acotada y muy específica: es una pieza de estilización para pipelines de generación y edición de imagen, no un modelo de propósito general. El repositorio no declara licencia explícita, no documenta idiomas soportados y no publica datos de entrenamiento, benchmarks ni especificaciones del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (Low-Rank Adaptation) sobre el modelo base Krea 2; rango, alpha y módulos objetivo no disponibles |
| Parámetros totales | no disponible (adaptador LoRA, no un modelo completo; el archivo pesa 327 MiB) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica / no disponible (modelo de imagen; la ventana de contexto depende del codificador de texto del modelo base, no publicada) |
| Tipos de cuantización | no disponible; el único peso publicado es safetensors (precisión interna no declarada) |
| Idiomas soportados | no disponible (la interpretación del prompt depende del codificador de texto del modelo base) |
| Licencia | no disponible; la model card indica que el copyright permanece con el autor y remite a la licencia del proyecto original o upstream |
| Formato de pesos | safetensors (`krea2-Cc-Ins风-人像.safetensors`, 327 MiB) |
| Tipo de modelo | LoRA de edición de imagen (image edit) |
| Modelo base | krea2 |
| Pipeline declarado | image-text-to-image |
| Tamaño del repositorio | 0,3 GB |
| Plataformas declaradas | ComfyUI, RunningHub, Hugging Face |
| Descargas / likes | 0 / 0 |
| Fecha de creación (según repositorio) | 2026-09-30 |
| Última actualización (según repositorio) | 2026-09-30 |

## Arquitectura y entrenamiento

El artefacto es un LoRA, es decir, un conjunto de matrices de bajo rango que se suman a los pesos del modelo base Krea 2 para desplazar su distribución de salida hacia un estilo concreto. No se publica el rango, el valor de alpha, los módulos sobre los que se aplica (atención, proyecciones cross-attention, etc.) ni la resolución de entrenamiento. Tampoco se indica el número de pasos, la tasa de aprendizaje, el tamaño del dataset, su composición ni si hubo alguna fase de alineación (RLHF, DPO u otras), algo poco habitual en adaptadores de estilización de imagen pero que impide cualquier reproducibilidad.

El autor declara entrenamiento en RunningHub y publica el modelo en su servicio de entrenamiento. La model card únicamente especifica el objetivo estilístico —retrato de influencer con acabado INS— y el rango de peso recomendado (0,7-1,2). Dentro del mismo autor y modelo base existen otros adaptadores complementarios: `rh-krea.2-ai-lora`, orientado a eliminar el sobreprocesado y las marcas de IA de Krea 2 para obtener una textura más natural, y `rh-krea2-cc-lora`, de propósito no detallado. No hay información sobre palabras de activación (trigger words), sampler o scheduler recomendados.

## Capacidades

- Generación y edición de imagen guiada por texto: el pipeline declarado es image-text-to-image, de modo que toma una imagen de entrada más una instrucción textual y devuelve una imagen transformada.
- Estilización de retrato con estética de red social: el adaptador aplica un look de influencer (iluminación, color y tratamiento de piel propios del estilo "INS").
- Reestilización de fotografías existentes: al ser un LoRA de edición, puede aplicarse sobre imágenes ya tomadas para acercarlas a ese acabado.
- Fotorrealismo orientado a retrato: el dominio declarado es la figura humana en clave de retrato, no paisaje, producto o ilustración genérica.
- Generación de texto, razonamiento, código y matemáticas: no soportado, es un modelo de imagen.
- Tool calling / function calling: no soportado.
- Agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingües: no documentadas; dependen del codificador de texto del modelo base.
- Modo "thinking" o razonamiento explícito: no dispone.
- Control de intensidad: el peso del adaptador es ajustable; la model card recomienda el rango 0,7-1,2.
- Integración nativa en ComfyUI y en la plataforma/API de RunningHub.

## Casos de uso

- Retratos para creadores de contenido: aplicar el LoRA sobre una foto base para obtener una imagen con acabado de publicación de red social, con iluminación y color consistentes entre publicaciones, ajustando el strength dentro del rango 0,7-1,2.
- Catálogo de moda y accesorios con estética influencer: sesiones sintéticas de producto vestido sobre modelo, donde interesa un retrato de aspecto natural y luminoso sin coste de estudio fotográfico.
- Avatares de marca y perfiles corporativos: generar una imagen de perfil coherente con una identidad visual concreta, partiendo de una foto del equipo o de un retrato generado y reestilizándolo con el adaptador.
- Edición de fotos ya existentes en flujos image-to-image: sustituir un retoque manual de piel y color por una pasada del LoRA, útil en producción de contenido con grandes volúmenes de fotografía.
- Variaciones controladas de un mismo retrato: mantener una estética fija mientras se varían encuadre, vestuario o fondo, algo habitual al preparar varias piezas para una misma campaña.
- Prototipado y pruebas A/B de estilo en ComfyUI: comparar distintos valores de strength sobre un lote pequeño de imágenes antes de fijar los parámetros de un pipeline de producción.
- Producción por lotes mediante API: al estar publicado en RunningHub, el adaptador puede invocarse desde su API para generar o editar imágenes de forma programática dentro de un flujo automatizado.
- Exploración de estilo frente a otros LoRA del mismo autor: combinarlo con `rh-krea.2-ai-lora` para reducir el exceso de procesado del modelo base y quedarse con un retrato más natural.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas objetivas (FID, CLIP score, similitud de identidad), ni comparaciones cuantitativas con otros adaptadores, ni ejemplos de salida con parámetros de reproducción. En el momento de la captura de datos, el modelo acumulaba 0 descargas y 0 likes, por lo que tampoco existe validación por parte de la comunidad.

## Requisitos de hardware

- El adaptador ocupa 327 MiB en disco. Cargado en memoria con precisión de 16 bits supondría aproximadamente 0,33 GB adicionales de VRAM, aunque el valor exacto depende del rango y del runtime (dato no publicado).
- La VRAM total necesaria la determina el modelo base Krea 2 y su pipeline de difusión, no este archivo. El repositorio no publica requisitos de hardware del modelo base.
- GPU recomendadas: no disponible.
- ¿Cabe en GPU de consumo? No disponible para el conjunto base + LoRA; el adaptador por sí solo es un lastre mínimo para cualquier GPU que pueda ejecutar Krea 2.
- Opciones de despliegue declaradas: ComfyUI (nodo de carga de LoRA), plataforma RunningHub y API de RunningHub. La model card también menciona Hugging Face como plataforma de alojamiento.
- Otros runtimes (diffusers, vLLM, llama.cpp, Ollama, TGI) no se mencionan; los tres últimos no son aplicables a un pipeline de difusión de imagen.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Peso del archivo | Modelo base | Objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-krea2-cc-ins-lora | 327 MiB | krea2 | Retrato estilo influencer con acabado INS | no disponible | Hugging Face (RunningHubAI), RunningHub |
| rh-krea2-cc-lora | 233 MB | krea2 | no especificado en la información disponible | no disponible | Hugging Face (RunningHubAI) |
| rh-krea.2-ai-lora | no disponible | krea2 | Eliminar el sobreprocesado y las marcas de IA de Krea 2 para lograr textura natural | no disponible | Hugging Face (RunningHubAI) |
| krea2-Cc-Ins-style-portrait | no disponible | krea2 | Retrato estilo INS (versión publicada en la plataforma RunningHub) | no disponible | RunningHub |

Los tres adaptadores proceden del mismo autor y del mismo modelo base, por lo que la comparación relevante es de intención estilística, no de arquitectura. No hay datos públicos de rendimiento que permitan ordenarlos por calidad.

## Limitaciones y advertencias

- Ausencia total de licencia declarada. La model card afirma que el copyright permanece con el autor y remite a la licencia del proyecto original o upstream, lo que deja el uso comercial en una situación jurídica indeterminada que conviene aclarar con el autor o con Krea antes de usarlo en producción.
- Cero descargas y cero likes en el momento de la captura: no hay evidencia externa de calidad, ni ejemplos reproducibles, ni issues que documenten problemas.
- Trazabilidad de entrenamiento nula: se desconocen dataset, número de pasos, resolución, palabras de activación y parámetros del sampler. Reproducir exactamente el resultado mostrado en la plataforma del autor no está garantizado fuera de ese entorno.
- Dependencia estricta del modelo base. Sin los pesos de Krea 2 el archivo es inservible; si el modelo base se actualiza, se retira o cambia su tokenizer, el adaptador puede degradarse o romperse.
- Riesgo de sobreestilización con valores de strength altos. La propia model card acota el rango a 0,7-1,2, lo que sugiere que por encima de ese valor aparecen artefactos.
- Sesgos esperables por la categoría: los adaptadores de retrato con estética influencer tienden a reproducir un canon concreto de belleza, iluminación y retoque, con posible pérdida de diversidad en rasgos, tonos de piel y edades. No está documentado y no puede cuantificarse con la información disponible.
- Riesgo de memorización de identidades: al no publicarse la composición del dataset, no puede descartarse que el adaptador reproduzca caras concretas de las imágenes de entrenamiento.
- Idiomas no documentados. El prompt de texto debe formularse en el idioma que comprenda el codificador del modelo base; se desconoce cuál es.
- Ámbito muy restringido: está orientado a retrato humano. Su comportamiento en paisaje, producto, texto dentro de la imagen o ilustración no está descrito.
- Las fechas del repositorio (creación y actualización el 2026-09-30) figuran así en los metadatos; conviene verificarlas en la página del modelo por si se trata de un error de marca temporal.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RunningHubAI/rh-krea2-cc-ins-lora
- Página original del modelo en RunningHub: https://www.runninghub.cn/model/public/2082005055020032001
- Página del autor en RunningHub: https://www.runninghub.cn/user-center/1987470324222631938
- Repositorio relacionado (mismo autor, mismo base): https://huggingface.co/RunningHubAI/rh-krea2-cc-lora
- Repositorio relacionado (mismo autor, mismo base): https://huggingface.co/RunningHubAI/rh-krea.2-ai-lora
- Versión del estilo en la plataforma RunningHub: https://www.runninghub.ai/model/public/2082085635376021506
- Catálogo de modelos de RunningHub: https://www.runninghub.ai/models
- Servicio de entrenamiento de RunningHub: https://www.runninghub.ai/page-model
- Documentación de la API de RunningHub (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API de RunningHub (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Sitio internacional de RunningHub: https://www.runninghub.ai
- Sitio de RunningHub China: https://www.runninghub.cn
- Herramienta de entrenamiento de LoRA para Krea 2: https://github.com/CaptainGrock/Krea2Trainer
