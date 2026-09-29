# mlboydaisuke/decider-2b-vision-CoreAI

## Resumen

Decider 2B Vision es un modelo de decisión multimodal de 2.000 millones de parámetros desarrollado por Mapika, distribuido en este repositorio como conversión a Apple Core AI (`.aimodel`) realizada por el usuario mlboydaisuke. No es un modelo generativo: recibe una imagen, un contexto breve y una o varias preguntas con opciones etiquetadas (hasta 10 por pregunta) y devuelve, en una única pasada hacia delante, la probabilidad de cada opción leyendo los logits de las letras en la posición de respuesta. Nunca emite texto libre.

El modelo parte de un transplante de los pesos de texto de decider-2b (v5) al modelo vision-language Qwen3.5-2B, seguido de un ajuste fino de una época sobre fotogramas de videojuego etiquetados por políticas scriptadas, tareas de elección múltiple con imagen procedentes de The Cauldron y una repetición de la mezcla de texto, más PPO desde píxeles. La arquitectura base es el híbrido de Qwen3.5, con 18 capas Gated DeltaNet y 6 capas de atención completa.

Su relevancia actual es de despliegue: es una conversión lista para ejecutarse en el dispositivo (on-device) sobre Apple Silicon mediante Core AI, con variantes cuantizadas a int8 y torres de visión con rejilla fija de 256×256 o 448×448. En un iPhone 18 Pro una decisión con rejilla `g256` se resuelve en 0,75-0,79 s y con `g448` en 1,4 s, lo que lo sitúa en el nicho de agentes y políticas de decisión locales de baja latencia, no en el de asistentes conversacionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido Qwen3.5: 18 capas Gated DeltaNet + 6 capas de atención completa, con torre de visión acoplada |
| Parametros totales | 2B (aproximado, según nombre y modelo base Qwen/Qwen3.5-2B-Base) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible como cifra oficial; el procesador del autor trunca el contexto de texto a 1.536 tokens |
| Tipos de cuantizacion | Decoder int8 por bloques de 32 (capas 0, 2 y 5 en fp16; embedding y head atados en fp16); decoder fp16 de referencia; torres de visión con pesos fp16 y cómputo en fp32 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | `.aimodel` (Apple Core AI); solo para inferencia en Core AI, no hay safetensors ni GGUF |

## Arquitectura y entrenamiento

El decodificador es el híbrido de Qwen3.5 de 2B con 18 capas Gated DeltaNet y 6 capas de atención completa. La conversión a Core AI lo empaqueta en dos grafos: la torre de visión, con rejilla fija (`g256`: tesela de 256×256 y 64 tokens de imagen; `g448`: 448×448 y 196 tokens), y el decodificador, que recibe identificadores de token y las filas de la torre como entrada estática y deriva dentro del grafo las posiciones M-RoPE de tres planos. El decodificador se expone como un haz único con una función `main` con S=1 y una función `prefill` con S=16, y ocupa 2,64 GB en la variante int8 mixta.

En cuanto al entrenamiento, Mapika trasplantó los pesos de texto de decider-2b (v5) al modelo vision-language Qwen3.5-2B y lo ajustó durante una época con fotogramas de videojuego etiquetados por políticas scriptadas, tareas de elección múltiple con imagen de The Cauldron y una repetición de la mezcla de texto, seguido de PPO desde píxeles. Los elementos de la mezcla de texto escritos por un profesor provienen de un Qwen3.5-27B ejecutado localmente. La innovación destacable del despliegue es el contrato de lectura: el modelo no genera, sino que extrae la probabilidad de cada opción de los logits de las letras en la ranura de respuesta, y la puerta de validación exigida es la paridad de probabilidades con el código fp32 del autor, sobre un fixture propio y 500 ejecuciones de fotografías reservadas.

## Capacidades

- Decisión visual de elección múltiple: dada una imagen, un contexto y hasta 10 opciones etiquetadas por pregunta, devuelve una distribución de probabilidad sobre las opciones.
- Respuesta a varias preguntas en la misma pasada: una fila por imagen, todas las preguntas de esa fila se contestan en un único forward pass.
- Preguntas solo de texto: atraviesan los mismos pesos sin imagen.
- Lectura de fotografías, diagramas y fotogramas de videojuego como entrada visual.
- Salida calibrada: el autor reporta ECE de 0,03 sobre 300 elementos de Visual7W reservado, es decir, probabilidades utilizables directamente como puntuaciones.
- Tipos de pregunta tipados en la familia decider (elección, puntuación, sí/no) según el repositorio matriz `Mapika/decider`; en este port el contrato documentado es el de elección múltiple con letras.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad nativa del modelo; puede integrarse como componente de decisión en un bucle externo.
- Capacidades multilingües: limitadas a inglés (`en`).
- Capacidades especiales: no hay modo de pensamiento ni generación de texto; tampoco audio.

## Casos de uso

- Agentes de videojuego y políticas de decisión: el modelo lee un fotograma y devuelve la probabilidad de cada acción candidata. Con la rejilla `g256` (64 tokens de imagen) y 0,75-0,79 s por decisión en iPhone 18 Pro es viable como selector de acción en bucle, no como controlador de alta frecuencia.
- Evaluación automática de tareas visuales de elección múltiple: sustituye a pipelines generativos cuando lo que se necesita es una puntuación calibrada por opción en lugar de una cadena de texto que después hay que parsear. La ECE reportada de 0,03 facilita umbrales de confianza.
- Moderación y clasificación de imágenes con criterios explícitos: se formula cada criterio como una pregunta con opciones y se obtiene la probabilidad de que la imagen lo cumpla, sin necesidad de plantillas de prompt frágiles.
- Prefiltrado en el dispositivo antes de llamar a un modelo mayor: ejecutado en Mac o iPhone, descarta o etiqueta casos con alta confianza y solo reenvía a un modelo en la nube los casos con distribución plana entre opciones.
- Anotación asistida en investigación con imágenes: lectura de diagramas y figuras con la rejilla `g448` (196 tokens) para generar etiquetas candidatas con probabilidad asociada, revisables posteriormente por una persona.
- Interfaz de decisión para aplicaciones de accesibilidad: preguntas de sí/no o de elección sobre una imagen capturada, respondidas localmente y con latencia inferior al segundo, sin enviar la imagen a un servidor.
- Enrutado multimodal en pipelines de datos: clasificar lotes de imágenes según preguntas fijas (por ejemplo, tipo de escena o presencia de un objeto) y derivar cada elemento a la rama de procesamiento correspondiente usando la opción más probable.

## Benchmarks y rendimiento

Los siguientes datos proceden de la model card de origen (`Mapika/decider-2b-vision`) y no han sido re-medidos en este repositorio:

| Benchmark | Resultado | Condiciones |
|---|---|---|
| Visual7W (reservado) | exactitud 0,89 | 300 elementos; ECE 0,03 |
| The Cauldron (seis tareas de la mezcla) | 0,80-0,95 | tareas no especificadas individualmente |
| Latencia `g256` | 0,75-0,79 s por decisión | iPhone 18 Pro, iOS 27.0 (24A437), JIT en dispositivo, 2026-09-29 |
| Latencia `g448` | 1,4 s por decisión | iPhone 18 Pro, iOS 27.0 (24A437), JIT en dispositivo, 2026-09-29 |
| Paridad de probabilidad con fp32 | puerta superada | fixture propio y 500 ejecuciones de fotografías reservadas (sin cifra publicada) |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de benchmarks de conocimiento general para esta conversión.

## Requisitos de hardware

- VRAM/unificada estimada para inferencia: 2.664 MB el decodificador int8 mixto y 3.786 MB el decodificador fp16 de referencia; hay que sumar una torre de visión, 660 MB (`g256`) o 663 MB (`g448`). Una decisión necesita un decodificador y una torre, no ambas torres.
- Sistema operativo: macOS 27 para todas las variantes; la variante de decodificador int8 también en iOS 27 con el entitlement de límite de memoria ampliado. Probado en M4 Max con macOS 27.0 (26A428) y en iPhone 18 Pro con iOS 27.0 (24A437).
- GPU recomendadas: Apple Silicon con Core AI. No hay soporte declarado para CUDA (A100, H100, RTX 4090) ni para ROCm en este repositorio.
- Cabe en hardware de consumo: sí, en Mac con Apple Silicon y en iPhone; los tres bloques (decodificador int8 mixto más una torre) suman aproximadamente 3,3 GB.
- Opciones de despliegue: Core AI mediante el paquete Swift `DeciderVision` del `coreai-model-zoo`, configurando `SpecializationOptions(preferredComputeUnitKind: .gpu)` y `expectFrequentReshapes = true` en el decodificador. No hay soporte declarado para vLLM, llama.cpp, Ollama ni TGI, dado que el formato es `.aimodel`.
- Latencia y throughput: 0,75-0,79 s por decisión con `g256` y 1,4 s con `g448` en iPhone 18 Pro; no se publica throughput por lotes ni latencia en M4 Max.
- Repositorio completo: 7,8 GB en HuggingFace.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mlboydaisuke/decider-2b-vision-CoreAI | 2B denso (híbrido) | no disponible (contexto truncado a 1.536 tokens por el procesador) | Visual7W 0,89; ECE 0,03; latencias arriba | apache-2.0 | `.aimodel`, Core AI, macOS 27 / iOS 27 |
| Mapika/decider-2b-vision (origen) | 2B denso (híbrido) | no disponible | Los mismos números del autor, medidos sobre el modelo original | apache-2.0 | Pesos originales para PyTorch, según el repositorio de origen |
| mlboydaisuke/decider-2b-coreai-ft | 2B denso (híbrido), base decider-2b de texto | no disponible | Ajustado sobre 1.399 elementos de decisión duros verificados; sin benchmarks publicados en la información disponible | no disponible | Conversión Core AI, entrada solo de texto |
| Qwen/Qwen3.5-2B-Base | 2B denso (híbrido) | no disponible | Modelo base generalista; sin datos de decisión de elección múltiple | no disponible | Pesos originales del modelo base |

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre ni explicaciones, únicamente probabilidades sobre opciones predefinidas. Cualquier caso de uso que requiera redacción, diálogo o resumen queda fuera de su alcance.
- Sesgos conocidos: no se documentan sesgos específicos en la información disponible; el modelo se ha ajustado mayoritariamente con fotogramas de videojuego etiquetados por políticas scriptadas y con datos de The Cauldron, lo que puede sesgar su lectura hacia ese tipo de imágenes frente a fotografías naturales.
- Riesgo de alucinación: al no generar texto, el riesgo se manifiesta como confianza mal colocada. La ECE reportada de 0,03 corresponde a 300 elementos de Visual7W reservado y a la configuración original del autor, no necesariamente a esta conversión cuantizada ni a otros dominios.
- Cuantización: el decodificador int8 por bloques de 32 con capas 0, 2 y 5 en fp16 es una aproximación; la validación es de paridad de probabilidad contra fp32, pero no se publica el error máximo observado.
- Limitaciones de idioma: solo inglés; el procesador, además, construye el texto con un formato literal rígido (etiquetas `Question`, `Options`, `Answer`), sin plantilla de chat ni BOS.
- Restricción de despliegue: el contrato de lectura exige respetar el formato exacto (bloque de imagen delante de `Context:`, identificadores de imagen como V+k con V = 248.320, truncado del contexto a 1.536 tokens). Desviarse de él degrada o invalida la lectura de opciones.
- Restricciones de licencia: apache-2.0, permisiva e incluye uso comercial. La licencia del modelo base Qwen3.5 no se detalla en la información disponible.
- Dependencia de plataforma: requiere macOS 27 o iOS 27 y Apple Silicon; en iOS hace falta el entitlement de límite de memoria ampliado para la variante int8. No hay ruta de despliegue documentada en CUDA.
- Madurez del artefacto: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validación externa independiente más allá de las pruebas declaradas por el autor.

## Enlaces

- [mlboydaisuke/decider-2b-vision-CoreAI en HuggingFace](https://huggingface.co/mlboydaisuke/decider-2b-vision-CoreAI)
- [Mapika/decider-2b-vision (modelo de origen)](https://huggingface.co/Mapika/decider-2b-vision)
- [Mapika/decider (repositorio del proyecto decider)](https://github.com/Mapika/decider)
- [mlboydaisuke/decider-2b-coreai-ft](https://huggingface.co/mlboydaisuke/decider-2b-coreai-ft)
- [Core AI model zoo](https://github.com/john-rocky/coreai-model-zoo)
- [Ficha de decider-2b-vision en coreai-model-zoo](https://github.com/john-rocky/coreai-model-zoo/blob/main/models/decider-2b-vision/README.md)
- [Paquete Swift DeciderVision](https://github.com/john-rocky/coreai-model-zoo/tree/main/apps/DeciderVision)
- [Decider 2B Vision: Specifications & Sources (gradually.ai)](https://www.gradually.ai/en/ai-models/decider-2b-vision/)
