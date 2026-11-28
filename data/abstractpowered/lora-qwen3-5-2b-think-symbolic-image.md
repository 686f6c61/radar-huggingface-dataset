# AbstractPowered/lora-qwen3.5-2b-think-symbolic-image

## Resumen

Lucia 2B v1.2 es un adaptador LoRA de tipo vision-language construido sobre el modelo base Qwen/Qwen3.5-2B. Lo desarrolla AbstractPowered (con el registro de investigacion a cargo de AbstractPhil) y su proposito es concreto: dado un par imagen-texto, generar una "lectura" estructurada de la imagen que combina una cadena de pensamientos en lenguaje llano, una serie de formulaciones (caption, prompt, tags, critica por profundidad) y un conjunto de preguntas que un observador cuidadoso aun se plantearia, cada una con su respuesta y su justificacion. Es, por tanto, un modelo utilitario de image-text-to-text orientado a captioning y anotacion fotografica.

La version 1.2 reproduce a escala 2B la receta de Lucia 4B v1.2: se entreno sobre 91.138 filas (frente a las 20.836 de la version 1), en una sola pasada de 10.137 pasos, e incorpora un segundo objetivo que mantiene al adaptador cerca del comportamiento del modelo base en peticiones ordinarias. El modelo tiene 2.000 millones de parametros (heredados del base) y esta publicado bajo licencia Apache-2.0, con pesos en formato PEFT/safetensors y un tamano de repositorio de 0,1 GB.

Su relevancia actual radica en que demuestra un enfoque de destilacion de "lecturas" multimodales generadas por modelos frontier (OpenAI, Google, DeepSeek) y filtradas por revision ciega, empaquetadas como un adaptador ligero que puede ejecutarse sobre un base de 2B. Es un modelo de nicho, con cero descargas en el momento de la consulta, pero tecnicamente interesante por su diseno de objetivos duales y su formato de salida estructurado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-language) sobre Qwen3.5-2B, con adaptador LoRA (PEFT) |
| Parametros totales | 2.000 millones (modelo base Qwen3.5-2B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del base) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); el procesador es el del modelo base |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre Qwen/Qwen3.5-2B, un transformer multimodal que procesa pares imagen-texto. El adaptador no modifica la arquitectura del base, sino que ajusta sus pesos para especializarlo en la tarea de "lectura" de imagenes. El entrenamiento se realizo sobre 91.138 filas provenientes del dataset thought-symbolic-image-recaptioned (release 5), compuesto por lecturas de fotografias DOCCI y COCO 2017, cuadros de la National Gallery of Art y especificaciones dibujadas. Estas lecturas fueron escritas por modelos de OpenAI, Google y DeepSeek y admitidas mediante revision ciega; 30.250 de ellas son "long looks". Se excluyeron 3.718 filas de COCO 2017 bajo otras licencias, 609 filas de imagenes reservadas para evaluacion y 16 filas sin imagen disponible.

La innovacion tecnica principal es el doble objetivo: ademas de aprender el formato de lectura, un segundo objetivo mantiene las elecciones de siguiente palabra del adaptador cerca de las del modelo base en peticiones ordinarias que el propio Qwen3.5-2B respondio para esta version. Esto reduce el "olvido catastrofico" y hace que el adaptador cambie su comportamiento solo cuando se le pide una lectura. El entrenamiento se realizo en una sola pasada (10.137 pasos). El modelo se ejecuta con thinking desactivado, decodificacion greedy y sin system prompt, ya que la forma de la fila es aprendida y un turno de sistema no visto en entrenamiento provoca sobreescritura. Requiere transformers 5 y peft 0.18 o superior.

## Capacidades

- Generacion de texto descriptivo a partir de imagenes (image captioning).
- Generacion de cadenas de pensamiento estructuradas con pasos nombrados: `see`, `name`, `place`, `count`, `relate`, `form`, `light`, `colour`, `mood`, `mean`, `intend`, `story`, `compare`, `change`, `check`, `say`.
- Produccion de formulaciones multiples: caption, prompt, tags y critica por profundidad.
- Generacion de preguntas de seguimiento con respuesta y justificacion, clasificadas como `[record]` (hecho de la imagen), `[chain]` (deducido por la cadena) o `[unknown]`.
- Adaptacion de la profundidad de la lectura: quick look (1-2 pensamientos), closer look (3-5), long look (6-10).
- Capacidad de responder preguntas directas sobre el contenido de la imagen, incluido el texto visible (lettering), con una tasa de acierto cercana a la del modelo base (0,93 frente a 0,88 en las imagenes evaluadas).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: limitado a la cadena de pensamiento interna; no se documenta soporte de agentes.
- Capacidades multilingues: solo ingles.
- Modo thinking: desactivado por diseno; no se recomienda su uso.

## Casos de uso

- Anotacion automatica de datasets de imagenes: el modelo genera captions, tags y prompts listos para poblar metadatos de catalogos fotograficos, aprovechando su formato estructurado y su entrenamiento sobre DOCCI y COCO 2017.
- Generacion de prompts para modelos de difusion: la linea `prompt` produce descripciones concisas y reutilizables como entrada textual para generadores de imagen, con vocabulario controlado por el formato aprendido.
- Catalogacion de patrimonio artistico: entrenado sobre cuadros de la National Gallery of Art, puede producir lecturas de obras con pasos de `light`, `colour`, `mood` y `mean`, utiles para fichas de museo o archivos digitales.
- Control de calidad de descripciones existentes: la linea de critica por profundidad y las preguntas `[unknown]` permiten detectar informacion ausente o ambigua en captions ya redactadas.
- Analisis de fotografias en flujos de accesibilidad: generar descripciones alternativas (alt text) estructuradas para imagenes en entornos donde se requiere texto descriptivo detallado y verificable.
- Investigacion en destilacion multimodal: sirve como caso de estudio de como un adaptador de 2B puede imitar el formato de lectura de modelos frontier con un objetivo dual que preserva el comportamiento base, util para experimentos de alineacion y evaluacion de olvido catastrofico.
- Extraccion de texto visible en imagenes: aunque con limitaciones, puede responder preguntas directas sobre el lettering de una imagen, util en tareas de moderacion o verificacion de contenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye metricas cualitativas internas sobre conjuntos de evaluacion propios:

| Metrica | Resultado |
|---|---|
| Peticiones ordinarias respondidas en formato de lectura (v1.2) | 0 de 326 |
| Peticiones ordinarias respondidas en formato de lectura (v1) | 270 de 326 |
| Imagenes con lettering donde el closer look nombra una palabra visible (v1.2) | 57 de 245 |
| Imagenes con lettering donde la descripcion libre del base nombra una palabra (v1.2) | 160 de 245 |
| Imagenes con lettering donde el long look nombra una palabra (v1.2) | 119 de 245 |
| Acierto al nombrar lettering en pregunta directa (v1.2) | 0,93 |
| Acierto al nombrar lettering en pregunta directa (base) | 0,88 |

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un adaptador LoRA sobre un base de 2B, los requisitos son los del base. En fp16 se estiman unos 4-5 GB; en cuantizacion de 8 bits, unos 2-3 GB; en 4 bits, en torno a 1,5-2 GB (estimaciones orientativas, no publicadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para fp16; RTX 3060, RTX 4060, RTX 4090, A100 o H100 para mayor throughput.
- Cabe en GPU de consumo: si, en tarjetas con 6 GB o mas en fp16 y en tarjetas con 4 GB o mas en cuantizacion de 4 bits.
- Opciones de despliegue: transformers 5 con peft 0.18 o superior (requisito explicito del autor); vLLM, llama.cpp, Ollama o TGI no estan documentados para este adaptador en la informacion disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Lucia 2B v1.2 (este) | 2B (base) | no disponible | Apache-2.0 | Hugging Face | Adaptador LoRA especializado en lecturas de imagen |
| Lucia 4B v1.2 | 4B (base) | no disponible | no disponible | Hugging Face | Misma receta a escala 4B; referencia directa del autor |
| Qwen/Qwen3.5-2B | 2B | no disponible | no disponible | Hugging Face | Modelo base; sin especializacion en lecturas |
| Lucia 2B v1 | 2B (base) | no disponible | Apache-2.0 | Hugging Face (tag `lucia-v1`) | Version anterior, 20.836 filas, sin objetivo dual |

## Limitaciones y advertencias

- Sesgos conocidos: el entrenamiento se limita a fotografias DOCCI, COCO 2017, cuadros de la National Gallery of Art y especificaciones dibujadas; el dominio fuera de esas categorias puede degradar la calidad de la lectura.
- Riesgo de alucinacion: las preguntas marcadas `[unknown]` indican incertidumbre, pero el modelo puede generar hechos incorrectos en las lineas `[record]` o `[chain]`; no hay garantia de verificacion factual.
- Limitaciones de contexto o idioma: solo soporta ingles; la longitud de contexto no esta documentada.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el modelo base Qwen3.5-2B tiene su propia licencia que debe verificarse por separado.
- Caveats para produccion: requiere thinking desactivado, decodificacion greedy y ausencia de system prompt; un system prompt no visto en entrenamiento provoca sobreescritura. Necesita transformers 5 y peft 0.18 o superior. El modelo no fue entrenado con filas escritas por modelos Claude ni por modelos del proyecto entrenados sobre filas de Claude. El lettering se omite deliberadamente en el closer look en muchos casos (57 de 245 frente a 160 del base), lo que puede ser una limitacion para tareas de OCR. El modelo tiene cero descargas y cero likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- [Hugging Face: AbstractPowered/lora-qwen3.5-2b-think-symbolic-image](https://huggingface.co/AbstractPowered/lora-qwen3.5-2b-think-symbolic-image)
- [Registro de investigacion: AbstractPhil/qwen3.5-2b-think-symbolic-image](https://huggingface.co/AbstractPhil/qwen3.5-2b-think-symbolic-image)
- [Lucia 4B v1.2: AbstractPhil/qwen3.5-4b-think-symbolic-image](https://huggingface.co/AbstractPhil/qwen3.5-4b-think-symbolic-image)
- [Modelo base: Qwen/Qwen3.5-2B](https://huggingface.co/Qwen/Qwen3.5-2B)
- [Dataset: AbstractPhil/thought-symbolic-image-recaptioned](https://huggingface.co/datasets/AbstractPhil/thought-symbolic-image-recaptioned)
- [Dataset: AbstractPhil/thought-symbolic-image-captions](https://huggingface.co/datasets/AbstractPhil/thought-symbolic-image-captions)
- [Manifiestos de release: AbstractPowered/manifests](https://huggingface.co/datasets/AbstractPowered/manifests)
- [Perfil del autor: AbstractPowered](https://huggingface.co/AbstractPowered)
