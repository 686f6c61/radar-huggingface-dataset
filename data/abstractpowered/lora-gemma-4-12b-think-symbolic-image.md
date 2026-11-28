# AbstractPowered/lora-gemma-4-12b-think-symbolic-image

## Resumen

Ulisse 12B v1.2 es un adaptador LoRA sobre el modelo vision-lenguaje google/gemma-4-12B-it, publicado por el colectivo AbstractPowered. Su funcion es concreta y acotada: dado un par imagen-texto, genera una "lectura" estructurada de la imagen que combina una cadena breve de pensamientos en lenguaje natural (una linea por paso), varias formulaciones textuales de la imagen (caption, prompt, etiquetas y critica por niveles de profundidad) y un conjunto de preguntas que un observador cuidadoso se plantearia, cada una con su respuesta y la evidencia que la sustenta. No es un modelo generalista, sino una utilidad especializada en captioning razonado y descripcion fotografica.

El adaptador se entrena sobre dos datasets propios del autor (thought-symbolic-image-recaptioned y thought-symbolic-image-captions), compuestos por lecturas de fotografias de DOCCI y COCO 2017, obras de la National Gallery of Art y especificaciones dibujadas, generadas por modelos de OpenAI, Google y DeepSeek y filtradas mediante revision ciega. La version 1.2 amplia el entrenamiento a 91.138 filas (frente a las 20.836 de la version 1) en una sola pasada de 10.137 pasos, e incorpora un segundo objetivo que ancla las respuestas del adaptador a las del modelo base en peticiones ordinarias, de modo que el LoRA modifique el comportamiento principalmente cuando se le pide una lectura.

Es relevante ahora porque ejemplifica una tendencia practica: adaptadores pequenos y especializados que anaden una capacidad estructurada (razonamiento visual con evidencia explicita) a un modelo base grande, con licencia Apache-2.0 y pesos distribuidos como safetensors de PEFT. Su interes tecnico esta en el formato de salida (trazabilidad de la evidencia por pregunta) y en la estrategia de preservacion del comportamiento base mediante regularizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre un transformer vision-lenguaje (google/gemma-4-12B-it) |
| Parametros totales | 12B en el modelo base; el adaptador LoRA no declara su numero de parametros (no disponible) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo solo contiene safetensors del adaptador; la cuantizacion depende del modelo base) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA acoplado a google/gemma-4-12B-it, un modelo vision-lenguaje de 12.000 millones de parametros. El adaptador no modifica la arquitectura del base: anade matrices de bajo rango entrenadas para producir un formato de salida especifico. La tarea se formula como image-text-to-text con generacion de cadena de pensamiento estructurada: cada linea de la salida etiqueta un paso (por ejemplo `see:`, `relate:`, `mood:`, `caption:`, `prompt:`, `tags:`, `question:`), lo que permite parsear la respuesta de forma determinista.

El entrenamiento uso 91.138 filas en una sola pasada (10.137 pasos) a una tasa de aprendizaje de 5e-5, un cuarto de la del base segun el autor. Las filas provienen de la parte Apache-2.0 de la release 5 del dataset thought-symbolic-image-recaptioned (95.481 filas), excluyendo 3.718 filas de COCO 2017 con otras licencias, 609 filas de imagenes reservadas para evaluacion y 16 filas sin imagen disponible. Las lecturas fueron escritas por modelos de OpenAI, Google y DeepSeek y admitidas por revision ciega; 30.250 son "long looks". El autor declara que ninguna fila fue escrita por modelos Claude ni por modelos del proyecto entrenados sobre filas de Claude. Durante el entrenamiento se muestra al modelo la imagen de cada fila que la tiene.

La innovacion principal es el segundo objetivo de entrenamiento: una regularizacion que mantiene las elecciones de siguiente palabra del adaptador cerca de las del modelo base en peticiones ordinarias respondidas por gemma-4-12B-it. Las peticiones de texto ordinario del set de entrenamiento (1.768) fueron redactadas por Qwen3.5-9B y Qwen3.5-4B y respondidas por el base; el autor reconoce que son ruidosas (963 sin puntuacion final; de 30 revisadas a mano, 7 completas, 12 truncadas y 11 sin el texto o pregunta necesarios). El objetivo es preservar la capacidad general del base mientras se anade la habilidad de lectura.

## Capacidades

- Generacion de lecturas estructuradas de imagenes: cadena de pensamientos por lineas etiquetadas, caption, prompt, etiquetas, critica y preguntas con respuesta y evidencia.
- Image captioning detallado con multiples niveles de profundidad (vista rapida y "long look").
- Generacion de prompts y etiquetas a partir de imagenes, orientada a flujos de fotografia.
- Razonamiento visual con trazabilidad: cada pregunta incluye la respuesta y el criterio que la resuelve (`[record]`, `[unknown]`).
- Capacidades heredadas del modelo base (generacion de texto, conversacion, vision) preservadas mediante el objetivo de regularizacion.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso general: no documentado; el razonamiento multi-paso se limita al formato de lectura.
- Capacidades multilingues: solo ingles declarado.

## Casos de uso

- Catalogacion de fondos fotograficos: el modelo genera caption, etiquetas y prompt por imagen con un formato parseable, lo que permite indexar grandes colecciones de forma automatica y consistente; el campo `tags` alimenta directamente un motor de busqueda.
- Generacion de metadatos para bancos de imagenes y archivos digitales: la salida incluye prompt y etiquetas en el formato que usan los flujos de fotografia de stock, reduciendo el trabajo manual de documentacion.
- Descripcion accesible de imagenes: el caption detallado y la critica por niveles sirven para producir texto alternativo enriquecido para lectores de pantalla, con la ventaja de que el modelo explicita la evidencia de cada afirmacion.
- Control de calidad de anotaciones: las preguntas con respuesta y criterio (`[record]` / `[unknown]`) permiten auditar si una descripcion se apoya en elementos visibles o especula, util en pipelines de revision de datasets.
- Analisis de obras de arte digitalizadas: el adaptador fue entrenado con obras de la National Gallery of Art y especificaciones dibujadas, por lo que puede generar lecturas descriptivas de piezas museisticas para fichas de catalogo.
- Investigacion en vision-lenguaje: sirve como caso de estudio reproducible de adaptacion LoRA con preservacion del base y de evaluacion de fidelidad visual (el autor reporta metricas de mencion de rotulos y de adherencia al formato).
- Generacion de prompts para modelos de difusion: el campo `prompt` de la lectura produce descripciones reutilizables como entrada de generadores de imagen a partir de una referencia visual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor reporta metricas propias de evaluacion:

| Metrica (evaluacion del autor) | Resultado |
|---|---|
| Filas de entrenamiento | 91.138 (version 1: 20.836) |
| Pasos de entrenamiento | 10.137 (una pasada) |
| Tasa de aprendizaje | 5e-5 |
| Peticiones ordinarias respondidas en formato de lectura (de 373 retenidas) | 0 (version 1: 47) |
| Imagenes retenidas con rotulos legibles y sin nombres/direcciones (de 300) | 245 |
| De esas 245, mencion de una palabra visible en la vista cercana | 77 (base: 207; vista larga: 129) |
| Acierto al nombrar el rotulo preguntado directamente (de 245) | 0,89 (base: 0,86) |

## Requisitos de hardware

- VRAM estimada: el adaptador pesa 0,6 GB; el modelo base de 12B requiere aproximadamente 24 GB en FP16/BF16 y en torno a 8-10 GB con cuantizacion de 4 bits (estimacion estandar para 12B, no confirmada en la informacion del repositorio).
- GPU recomendadas: A100 40/80 GB o H100 para inferencia en precision completa con lotes; RTX 4090 (24 GB) para FP16 ajustado o cuantizacion 8 bits.
- Cabe en GPU de consumo: si, con cuantizacion de 4 bits en tarjetas de 12-16 GB (RTX 4070 Ti, RTX 4080, RTX 3090); en 8 bits en tarjetas de 24 GB.
- Opciones de despliegue: el adaptador es PEFT, por lo que se carga junto al base con transformers + peft; para servido en produccion, vLLM y TGI admiten adaptadores LoRA (compatibilidad con gemma-4-12B-it no verificada en la informacion disponible); llama.cpp/Ollama requeririan fusionar el adaptador en el base y convertir a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ulisse 12B v1.2 (este) | 12B (base) + LoRA | no disponible | Lectura estructurada de imagenes con CoT y evidencia | apache-2.0 | Hugging Face (PEFT) |
| google/gemma-4-12B-it | 12B | no disponible | Vision-lenguaje generalista | no disponible en la informacion | Hugging Face |
| Ulisse E4B v1.2 (AbstractPhil) | base E4B | no disponible | Misma receta sobre modelo menor | no disponible en la informacion | Hugging Face |
| Modelos de captioning especializados (p. ej. BLIP-2, LLaVA) | variable | no disponible | Captioning/vision-lenguaje general | variable | Hugging Face |

La comparacion con alternativas de captioning especializado no puede cuantificarse porque no hay benchmarks publicados en la informacion disponible. La diferencia funcional de Ulisse frente a un captioner convencional es el formato de salida estructurado con preguntas y evidencia.

## Limitaciones y advertencias

- Riesgo de alucinacion en detalles visuales: el autor reporta que su vista cercana menciona palabras visibles en la imagen en 77 de 245 casos, frente a 207 del base, lo que indica una menor tendencia a inventar rotulos pero tambien menor exhaustividad descriptiva.
- Sesgo de dominio: entrenado sobre fotografias de DOCCI y COCO 2017, obras de la National Gallery of Art y especificaciones dibujadas; el rendimiento fuera de esos dominios (capturas de pantalla, documentos, imagenes medicas) no esta documentado.
- Solo ingles: el modelo declara unicamente el idioma en; las lecturas en castellano no estan soportadas de forma fiable.
- Restricciones de licencia: el adaptador es Apache-2.0, pero el uso comercial esta condicionado por la licencia del modelo base google/gemma-4-12B-it, que no se detalla en la informacion proporcionada y debe verificarse antes de desplegar.
- Dependencia del base: el adaptador no funciona de forma autonoma; requiere cargar gemma-4-12B-it, lo que multiplica los requisitos de hardware y los terminos de uso aplicables.
- Datos de entrenamiento ruidosos: el propio autor reconoce que las peticiones ordinarias usadas para la regularizacion son incompletas (963 de 1.768 sin puntuacion final), lo que puede afectar a la robustez fuera del formato de lectura.
- Formato de salida rigido: el modelo esta optimizado para producir lecturas etiquetadas; usarlo como chatbot general desaprovecha su entrenamiento y puede degradar la calidad respecto al base.
- Sin datos de benchmarks estandar ni de latencia: la evaluacion es interna y no permite comparacion directa con alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AbstractPowered/lora-gemma-4-12b-think-symbolic-image
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Registro de investigacion: https://huggingface.co/AbstractPhil/gemma-4-12b-think-symbolic-image
- Version E4B de la misma receta: https://huggingface.co/AbstractPhil/gemma-4-e4b-think-symbolic-image
- Dataset thought-symbolic-image-recaptioned (release 5): https://huggingface.co/datasets/AbstractPhil/thought-symbolic-image-recaptioned/tree/cac40b93d7b063aafd0cb70d3c1b1a7a100562ef
- Manifiestos, hashes y licencia de la release: https://huggingface.co/datasets/AbstractPowered/manifests
- Organizacion del autor: https://huggingface.co/AbstractPowered
- Imagen de ejemplo citada (COCO 2017, id 376084): https://cocodataset.org/#explore?id=376084
