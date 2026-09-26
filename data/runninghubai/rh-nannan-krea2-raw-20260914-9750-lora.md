# RunningHubAI/rh-nannan-krea2-raw-20260914-9750-lora

## Resumen

rh-nannan-krea2-raw-20260914-9750-lora es un adaptador LoRA de edición de imágenes publicado en Hugging Face por RunningHubAI en nombre de la autora identificada como @莜莜不吃香菜. No es un modelo completo: se trata de un peso adicional que se carga sobre un modelo base de difusión denominado «krea2» en la model card, y que se utiliza para inyectar una estética o identidad concreta activada mediante la palabra clave «Nannan». El repositorio contiene un único archivo, `Nannan_Krea2_raw_20260914_9750.safetensors`, de 218 MiB.

El pipeline declarado es `image-text-to-image`, es decir, generación y edición de imágenes condicionadas por texto e imagen de entrada. El adaptador está pensado para su uso en ComfyUI y en la plataforma en la nube RunningHub, desde donde también se puede invocar mediante API. La ficha no documenta ni el número de parámetros del LoRA, ni el rango de bajo rango empleado, ni el procedimiento de entrenamiento, ni el dataset utilizado.

La relevancia práctica de este tipo de publicación es acotada: se trata de un adaptador de nicho, orientado a flujos de trabajo de generación de imagen con una identidad visual específica, con cero descargas y cero «likes» en el momento de la consulta y sin licencia declarada de forma explícita. Cualquier evaluación seria requiere disponer por separado del modelo base krea2, cuyos pesos no se incluyen en este repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (Low-Rank Adaptation) sobre un modelo base de difusión identificado como «krea2»; la arquitectura del modelo base no se detalla en la informacion disponible |
| Parametros totales | no disponible (no se publica el numero de parametros del adaptador ni el rango; el archivo pesa 218 MiB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de imagen; la ventana de condicionamiento depende del codificador de texto del modelo base, no documentado) |
| Tipos de cuantizacion | no disponible; se distribuye un unico archivo en safetensors sin indicar la precision de almacenamiento |
| Idiomas soportados | no disponible (la cobertura linguistica la determina el codificador de texto del modelo base) |
| Licencia | no disponible; la model card indica que el copyright permanece en la autora y remite a la licencia del proyecto original o del upstream, sin especificarla |
| Formato de pesos | safetensors (archivo unico `Nannan_Krea2_raw_20260914_9750.safetensors`, 218 MiB) |
| Tipo de modelo | LoRA de edicion de imagen (image edit) |
| Modelo base | krea2 (finetuned from) |
| Palabra de activacion | Nannan |
| Plataformas soportadas | ComfyUI, RunningHub, Hugging Face |
| Tamano del repositorio | 0,2 GB |
| Fecha de creacion | 2026-09-26 |
| Ultima actualizacion | 2026-09-26 |

## Arquitectura y entrenamiento

El objeto publicado es un adaptador de bajo rango (LoRA) que se acopla a un modelo base de difusión para imagen denominado krea2. Un LoRA no redefine la arquitectura del modelo: introduce matrices de bajo rango en determinadas capas del base, de modo que el comportamiento resultante es el del modelo base modulado por el adaptador. El repositorio no especifica sobre qué capas se han insertado los adaptadores, ni el rango, ni el valor de alpha, ni si el entrenamiento se realizó sobre el módulo de atención del texto, sobre los bloques de atención de imagen o sobre ambos.

Tampoco hay información sobre el procedimiento de entrenamiento: no se indica el número de pasos, el tamaño del dataset, la composición de las imágenes de entrenamiento, el uso de regularización, ni si se aplicaron técnicas como captions invertidas o entrenamiento con pares imagen-imagen para edición. La model card únicamente menciona que el modelo se ha afinado desde krea2, que la palabra de activación es «Nannan» y que el entrenamiento puede realizarse en la propia plataforma RunningHub, que actúa como proveedor del servicio. Cualquier afirmación sobre innovaciones técnicas (muestreo acelerado, decodificación especulativa, atención lineal) carecería de respaldo documental en la información disponible.

## Capacidades

- Edición y generación de imágenes condicionadas por texto e imagen de entrada, dentro del pipeline `image-text-to-image`.
- Aplicación de una estética o identidad concreta asociada a la palabra de activación «Nannan», que debe incluirse en el prompt para activar el efecto del adaptador.
- Integración en flujos de trabajo de ComfyUI como nodo de carga de LoRA sobre el modelo base krea2.
- Ejecución en la plataforma RunningHub, tanto en su interfaz web como a través de su API, según los enlaces incluidos en la model card.
- Generación de variaciones y ediciones por lotes cuando se combina con el resto de nodos del grafo de ComfyUI (control de semilla, escalado, máscaras de edición).
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, agentes, generación de código, matemáticas, audio o vídeo, dado que no es un modelo de lenguaje.

## Casos de uso

- Generación de retratos o figuras con una identidad visual consistente: el LoRA se activa con «Nannan» para reproducir un estilo o personaje concreto de forma repetible entre ejecuciones, útil en encargos de ilustración seriada.
- Edición localizada de imágenes por prompt: partiendo de una imagen de entrada y una instrucción textual, se puede modificar la apariencia del sujeto manteniendo la composición original, siempre que el modelo base krea2 soporte ese modo de edición.
- Producción de variaciones para selección creativa: generar un lote de candidatos con distintas semillas manteniendo la palabra de activación para que todas las propuestas compartan la misma estética, y elegir después la definitiva.
- Integración en pipelines automatizados de contenido: desplegar el LoRA en ComfyUI o invocarlo a través de la API de RunningHub para producir imágenes de forma programática en un sistema de publicación o de gestión de contenidos.
- Creación de material gráfico para prototipos de producto: generar bocetos o mockups con la estética del LoRA para validar dirección de arte antes de encargar trabajo final a un ilustrador.
- Ilustración para narrativa serializada: mantener la coherencia de un personaje a lo largo de varias viñetas o capítulos usando la misma palabra de activación y el mismo modelo base.
- Pruebas de concepto en investigación sobre adaptación de bajo rango: servir como ejemplo de adaptador de edición de imagen para estudiar transferencia de estilo y control de identidad, dado que ocupa solo 218 MiB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas cuantitativas (FID, CLIP score, similitud de identidad, precisión de edición ni comparaciones con otros adaptadores), y la búsqueda web realizada no aporta datos adicionales sobre este repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El adaptador ocupa 218 MiB en disco, pero los requisitos reales los determina el modelo base krea2, cuyos pesos no se incluyen en el repositorio y cuyo tamaño no se documenta.
- GPU recomendadas: no disponible. Al no conocerse la arquitectura ni el tamaño del modelo base, no es posible indicar modelos concretos como A100, H100 o RTX 4090 con fundamento.
- Cabe en GPU de consumo: no disponible. Un adaptador de 218 MiB es ligero en sí mismo, pero su viabilidad en una GPU de consumo depende por completo del modelo base sobre el que se aplique.
- Opciones de despliegue: ComfyUI (etiqueta declarada del repositorio), plataforma RunningHub en la nube y API de RunningHub. Los servidores de inferencia para modelos de lenguaje (vLLM, llama.cpp, Ollama, TGI) no son aplicables a este tipo de peso.
- Latencia y throughput estimados: no disponible; no se publican mediciones y dependerían del modelo base, de la GPU y de la configuración del sampler.

## Comparativa con modelos similares

No disponible. En la información suministrada no constan adaptadores comparables con datos verificables (parámetros, rango, dataset, métricas o licencia) ni resultados de evaluación que permitan establecer una comparación fundamentada. Lo único que se puede afirmar es que este repositorio comparte categoría con otros LoRA de edición de imagen publicados en Hugging Face para su uso en ComfyUI, sin que se disponga de cifras para contrastarlos.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-nannan-krea2-raw-20260914-9750-lora | no disponible | no aplica | no disponible | no disponible | Hugging Face, RunningHub |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. No se documenta la composición del dataset de entrenamiento, por lo que no es posible evaluar sesgos demográficos, culturales o estéticos del adaptador.
- Riesgo de alucinación visual: como cualquier modelo generativo de imagen, puede producir artefactos anatómicos, texto ilegible o detalles incoherentes, especialmente en ediciones complejas o con máscaras amplias.
- Dependencia del modelo base: el repositorio no incluye los pesos de krea2. Sin ese modelo base, el archivo safetensors resulta inutilizable.
- Ausencia de licencia explícita: la model card remite a la licencia del proyecto original o del upstream sin nombrarla. Esto impide determinar con certeza si el uso comercial está permitido; conviene consultar la licencia de krea2 antes de cualquier despliegue en producción.
- Titularidad: el copyright permanece en la autora, y la publicación la realiza RunningHub como intermediario. No hay garantía de mantenimiento ni de soporte por parte de la plataforma.
- Idioma: no se especifica la cobertura linguistica de los prompts; está condicionada por el codificador de texto del modelo base.
- Madurez: el repositorio registra cero descargas y cero «likes», sin métricas publicadas y con una única revisión, por lo que no existe evidencia comunitaria de calidad o estabilidad.
- Fechas: los metadatos indican creación y actualización el 26 de septiembre de 2026, posteriores a la fecha habitual de los modelos de esta familia; conviene verificar la vigencia del repositorio antes de integrarlo.
- Ambito de aplicación: es un adaptador de imagen, no un modelo de lenguaje. No puede utilizarse para generación de texto, código, razonamiento, agentes ni tool calling.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-nannan-krea2-raw-20260914-9750-lora
- Proyecto original en RunningHub: https://www.runninghub.ai/model/public/2100181786257416194
- Página de la autora: https://www.runninghub.ai/user-center/2079101863547813889
- RunningHub (sitio internacional): https://www.runninghub.ai
- RunningHub (sitio de China): https://www.runninghub.cn
- Documentación de la API (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- README en chino: https://huggingface.co/RunningHubAI/rh-nannan-krea2-raw-20260914-9750-lora/blob/main/README_cn.md
