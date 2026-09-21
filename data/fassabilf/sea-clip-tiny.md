# fassabilf/sea-clip-tiny

## Resumen

SEA-CLIP-Tiny es un modelo de embeddings texto-imagen de tipo CLIP con 46,11 millones de parametros, publicado por el usuario fassabilf en HuggingFace bajo licencia MIT. Se trata de un modelo de doble torre destilado a partir de MetaCLIP2-ViT-B-16-worldwide, disenado especificamente para ingles y siete idiomas del sudeste asiatico (indonesio, javanes, sundanés, malayo, tailandes, vietnamita y birmano). Su tarea principal es la clasificacion de imagenes zero-shot y la recuperacion cruzada texto-imagen, no la generacion de texto.

El modelo responde a un problema concreto: la mayoria de los CLIP disponibles estan entrenados con datos predominantemente anglosajones y rinden mal en idiomas del sudeste asiatico, que suelen estar infrarrepresentados en los corpus web. SEA-CLIP-Tiny se entrena con 12,72 millones de pares imagen-texto que incluyen fuentes especificas de la region (CulturalGround-OE-filt, Mammoth-VL-SEA) y logra, segun su model card, la mejor media entre los estudiantes compactos evaluados en el paper, con un R@10 promedio de 42,2 en los siete idiomas SEA.

Su relevancia actual radica en la relacion tamano-rendimiento: mejora el R@10 promedio de MobileCLIP2 en 12,1 puntos con un 38,4 % menos de parametros y menor latencia en CPU. Esto lo situa como candidato para despliegues en dispositivo, servicios con muchas consultas por segundo y pipelines de curacion de datos multilingues donde un modelo grande de vision-lenguaje seria inviable en coste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Doble torre tipo CLIP: torre de vision ViT-T/16 + torre de texto transformer de 12 capas y 384 de ancho, dimension de embedding 512 |
| Parametros totales | 46,11 M (5,62 M en vision + 40,49 M en texto) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 77 tokens (tokenizer CLIP BPE, vocabulario de 49.408) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | en, id, jv, su, ms, th, vi, my |
| Licencia | MIT |
| Formato de pesos | no disponible (repo de 0,2 GB en HuggingFace, cargable mediante la libreria open_clip) |

## Arquitectura y entrenamiento

La arquitectura sigue el esquema clasico de CLIP: dos codificadores independientes que proyectan imagen y texto a un espacio comun de 512 dimensiones, entrenados con un objetivo contrastivo de similitud coseno. La torre de vision es un ViT-Tiny con parches de 16x16 (ViT-T/16), y la torre de texto es un transformer de 12 capas y 384 dimensiones ocultas con tokenizer CLIP BPE y una ventana de 77 tokens. El desbalance de parametros es notable: solo 5,62 M corresponden a vision, mientras que 40,49 M estan en el codificador de texto, algo coherente con el enfoque multilingue del modelo.

El entrenamiento es una destilacion desde MetaCLIP2-ViT-B-16-worldwide sobre 12,72 millones de pares imagen-texto procedentes de CC12M, CulturalGround-OE-filt, WIT, Bloom y Mammoth-VL-SEA. No se documenta el uso de RLHF ni DPO, algo que no aplica a un modelo contrastivo de embeddings. La innovacion destacable es la combinacion de destilacion a un estudiante muy compacto con un corpus que refuerza explicitamente la cobertura de idiomas y referentes culturales del sudeste asiatico, ademas de una latencia en CPU inferior a la de MobileCLIP2. La configuracion exacta de entrenamiento esta en el archivo `params.txt` del repositorio, y el codigo de entrenamiento y evaluacion se publica en GitHub.

## Capacidades

- Generacion de embeddings conjuntos imagen-texto en un espacio de 512 dimensiones.
- Clasificacion de imagenes zero-shot mediante prompts textuales, sin necesidad de cabecera supervisada.
- Recuperacion texto-a-imagen e imagen-a-texto (retrieval) en los ocho idiomas soportados.
- Capacidad multilingue en ingles, indonesio, javanes, sundanés, malayo, tailandes, vietnamita y birmano.
- Inferencia eficiente en CPU y en GPU de gama baja gracias a sus 46,11 M de parametros.
- Soporte de tool calling / function calling: no aplica (modelo de embeddings, no generativo).
- Soporte de agentes y razonamiento multi-step: no aplica.
- Modo thinking, vision generativa o procesamiento de audio: no disponibles; solo produce representaciones vectoriales.
- Generacion de texto, codigo o matematicas: no disponible, fuera del alcance del modelo.

## Casos de uso

- Clasificacion de imagenes sin datos etiquetados en mercados del sudeste asiatico: definir categorias con prompts en indonesio, tailandes o vietnamita y clasificar catalogos completos sin entrenar una cabecera nueva, aprovechando que el modelo entiende esos idiomas de forma nativa.
- Busqueda multimodal en comercio electronico: indexar los embeddings de las fotos de producto y permitir consultas en lenguaje natural en el idioma local del comprador, con recuperacion por similitud coseno sobre el vector de 512 dimensiones.
- Curacion y filtrado de datasets multilingues: usar el modelo para puntuar la coherencia imagen-texto de corpus web en idiomas SEA y descartar pares mal alineados antes de entrenar modelos mayores.
- Moderacion de contenido visual en plataformas regionales: clasificacion zero-shot de categorias sensibles con prompts adaptados al contexto cultural local, donde los CLIP anglocentricos suelen fallar por falta de vocabulario y referentes.
- Organizacion automatica de fototecas y archivos digitales: etiquetado y agrupacion de imagenes por consulta textual en varios idiomas a la vez, sin coste de GPU dedicada.
- Recomendacion basada en similitud imagen-texto: calcular vecinos cercanos entre el historial de un usuario y el catalogo visual para sugerir productos o contenidos afines.
- Accesibilidad y descripcion asistida: emparejar imagenes con descripciones o etiquetas ya existentes en la base de conocimiento para sugerir texto alternativo en el idioma del usuario.
- Despliegue en edge o IoT: ejecutar la inferencia en CPU, en una Raspberry Pi o en un dispositivo movil, por el reducido tamano del modelo y su menor latencia en CPU frente a MobileCLIP2.

## Benchmarks y rendimiento

Datos publicados en la model card. `R@1` corresponde a la recuperacion sobre las particiones de validacion de cada fuente de entrenamiento; `R@1-Avg` es la media de recuperacion sobre XM3600, Flickr30k-200 y XTD-200.

| Metrica | Valor |
|---|---|
| CG R@1 | 29,3 |
| WIT R@1 | 21,8 |
| Bloom R@1 | 23,3 |
| ImageNet (zero-shot) | 36,4 |
| R@1-Avg (XM3600 / Flickr30k-200 / XTD-200) | 13,9 |
| Promedio R@1 en los 7 idiomas SEA | 12,9 |
| Promedio R@5 en los 7 idiomas SEA | 31,5 |
| Promedio R@10 en los 7 idiomas SEA | 42,2 |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval o GSM8K, y no procede medirlos porque el modelo no genera texto.

## Requisitos de hardware

- Pesos estimados a partir de los 46,11 M de parametros declarados: unos 184 MB en FP32, unos 92 MB en FP16 y unos 46 MB en INT8.
- VRAM necesaria: inferior a 1 GB en FP16 incluyendo el overhead del runtime; el modelo cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquiera con soporte CUDA, desde una GTX 1050 o una RTX 3060 hasta una RTX 4090. Usar A100 o H100 no aporta ventaja practica y desaprovecha el hardware.
- Compatibilidad con GPU consumer: si, en todas las gamas actuales; tambien funciona en CPU, en dispositivos moviles y en placas tipo Raspberry Pi.
- Opciones de despliegue: libreria `open_clip` sobre PyTorch. vLLM, TGI, llama.cpp y Ollama no aplican al no ser un modelo generativo ni publicarse pesos en GGUF. No se documenta exportacion a ONNX u otros formatos.
- Latencia y throughput: no disponibles en cifras. La model card solo indica que la latencia en CPU es inferior a la de MobileCLIP2, sin valores concretos. Al ser un modelo pequeno, el throughput escalara casi linealmente con el tamano de lote en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | R@10 promedio SEA | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| SEA-CLIP-Tiny | 46,11 M | 77 tokens | en, id, jv, su, ms, th, vi, my | 42,2 | MIT | HuggingFace y GitHub |
| MobileCLIP2 | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible; la model card indica que SEA-CLIP-Tiny lo supera en 12,1 puntos con un 38,4 % menos de parametros y menor latencia CPU | no disponible | no disponible |
| MetaCLIP2-ViT-B-16-worldwide | no disponible (es el modelo profesor de la destilacion) | no disponible | no disponible | no disponible | no disponible | no disponible |

La informacion proporcionada no incluye las especificaciones completas de los modelos comparables, por lo que la comparacion cuantitativa se limita a los deltas relativos publicados por el autor.

## Limitaciones y advertencias

- No es un modelo generativo: no puede usarse para chatbots, generacion de codigo, resumen ni RAG generativo, y no soporta tool calling ni flujos de agentes.
- Ventana de contexto de 77 tokens en la torre de texto: los prompts o descripciones largas se truncan, lo que degrada la recuperacion.
- Precision zero-shot modesta: un 36,4 % en ImageNet y un R@1-Avg de 13,9 en XM3600, Flickr30k-200 y XTD-200 son valores bajos en terminos absolutos, propios de un modelo compacto; la recuperacion en el primer puesto sera limitada en catalogos grandes.
- Sensibilidad al prompt: al ser clasificacion zero-shot, el rendimiento depende fuertemente de la formulacion de las plantillas de texto y del idioma elegido para el prompt.
- Tokenizer CLIP BPE de base anglosajona: la tokenizacion de javanes, sundanés y birmano puede fragmentar palabras de forma poco eficiente y reducir la calidad de los embeddings frente al ingles.
- Sesgo de los datos: CC12M y WIT tienen un sesgo occidental y anglofono, por lo que persiste riesgo de infrarrepresentacion de culturas y contextos del sudeste asiatico pese al esfuerzo del corpus de entrenamiento. No se documenta ninguna evaluacion de sesgos.
- Riesgo de alucinacion en sentido estricto: no aplica, ya que el modelo no genera texto; el riesgo equivalente es la asignacion incorrecta de etiquetas o recuperaciones falsas por similitud espuria.
- Validacion comunitaria nula: 0 descargas y 0 likes en el momento de la consulta, por lo que la reproducibilidad y la robustez no han sido verificadas de forma independiente.
- Licencia MIT, que permite uso comercial, pero las fuentes de datos (CC12M, WIT, Bloom, CulturalGround-OE-filt, Mammoth-VL-SEA) pueden arrastrar condiciones propias; conviene revisarlas antes de un despliegue comercial.
- Referencia bibliografica a ACCV 2026 y fechas de publicacion en 2026: el paper debe verificarse antes de citarlo en produccion.

## Enlaces

- HuggingFace: https://huggingface.co/fassabilf/sea-clip-tiny
- Repositorio de entrenamiento y evaluacion: https://github.com/fassabilf/sea-clip-tiny
- Configuracion de entrenamiento: archivo `params.txt` incluido en el repositorio de HuggingFace
- Cita del paper: SEA-CLIP-Tiny: Efficient Multilingual Text-Vision Embedding for Southeast Asian Languages, Asian Conference on Computer Vision (ACCV), 2026 (sin URL disponible)
- Nota sobre la busqueda web: los resultados devueltos no guardan relacion con el modelo (listados de restaurantes indios en Seattle), por lo que no se ha podido incorporar informacion adicional de fuentes externas.
