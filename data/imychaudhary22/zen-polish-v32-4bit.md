# imYChaudhary22/zen-polish-v32-4bit

## Resumen

ZenPolish v3.2 4B (4-bit DWQ) es un modelo de generación de texto de 4.022.468.096 parámetros publicado por el desarrollador independiente imYChaudhary22 (Yash Chaudhary) bajo el paraguas del proyecto ZenVoice. No es un asistente generalista: es un modelo especializado en la fase de post-procesado de dictado por voz. Recibe la salida cruda de un sistema de speech-to-text y devuelve el mismo texto con puntuación y mayúsculas restauradas, muletillas y falsos arranques eliminados, y normalización inversa de texto aplicada (números, importes, fechas, horas, porcentajes, correos, URL y teléfonos). El objetivo es que el usuario dicte de forma natural y obtenga texto listo para enviar sin pasar por el teclado.

Técnicamente es un derivado de Qwen3-4B-Instruct-2507 al que se le aplicó un adaptador LoRA de rango 32 que después se fusionó en los pesos bf16, y sobre esos pesos se practicó una cuantización de 4 bits con DWQ (destilled weight quantization), una técnica que ajusta las escalas de cuantización para que la distribución de tokens del modelo 4-bit se parezca a la del bf16 sobre los prompts de entrenamiento. El resultado son 2,26 GB de pesos que corren íntegramente en dispositivo mediante MLX, a unos 47 tokens por segundo en un Apple M5.

Su relevancia es acotada pero clara: demuestra que un modelo de 4B cuantizado a 4 bits puede igualar en exactitud a su versión bf16 en una tarea estrecha de formato de texto, con latencia de 0,32 s por dictado y un pico de memoria de 2,65 GB. Es una pieza de infraestructura para aplicaciones de dictado on-device, no un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, derivado de Qwen3-4B-Instruct-2507 |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la model card; el entrenamiento uso una longitud maxima de 1.024 tokens |
| Tipos de cuantizacion | 4-bit DWQ con group size 64 (esta publicada ademas una variante 3-bit DWQ) |
| Idiomas soportados | ingles (limpieza de dictado en ingles) |
| Licencia | Apache-2.0 (heredada de Qwen3-4B-Instruct-2507) |
| Formato de pesos | safetensors para MLX (libreria `mlx`); no se publica GGUF |

## Arquitectura y entrenamiento

La base es Qwen3-4B-Instruct-2507, un transformer decoder-only denso de 4B parámetros. Sobre esa base se entrenó un adaptador LoRA con rango 32, alpha 64, escala 2.0 y dropout 0.05, aplicado a las 36 capas y a todos los módulos lineales. El entrenamiento se ejecutó sobre `mlx-community/Qwen3-4B-Instruct-2507-4bit` (revisión `50d4277`) con schedule coseno de 1e-4 a 1e-6, 3.400 pasos, batch 2, 3.500 iteraciones, longitud máxima 1.024 y gradient checkpointing; el checkpoint final (paso 3500) se eligió sobre un conjunto de validación. Los datos son el corpus ZenPolish v2.2, compuesto por 10 fuentes y 86.524 pares de entrenamiento. Posteriormente el adaptador se fusionó en los pesos bf16 originales, dando lugar a `zen-polish-v32-bf16`.

La innovación reseñable es el paso de cuantización: DWQ (destilled weight quantization) a 4 bits con group size 64, entrenado sobre 1.024 muestras de hasta 512 tokens con learning rate 1e-6 y objetivos de logits top-1.024 procedentes del modelo bf16. En lugar de usar escalas de cuantización derivadas de la norma de los pesos, se ajustan para minimizar la divergencia entre la distribución de tokens del 4-bit y la del bf16 en los prompts de la tarea. El autor afirma que el resultado es tan preciso como el v3.2 sin cuantizar. Detalle operativo importante: el modelo se entrenó con un bloque de pensamiento vacío (`<think>\n\n</think>\n\n`) al inicio de cada respuesta, por lo que es obligatorio usar el `chat_template.jinja` incluido en el repositorio; con la plantilla estándar de Qwen3-4B-Instruct-2507 el primer token se vuelve indeterminado y las variantes de baja precisión degeneran en tokens `<tool_call>`.

## Capacidades

- Reescritura de dictado: restauración de puntuación, mayúsculas y estructura de frases sobre texto ASR sin puntuar.
- Eliminación de muletillas, tanto al inicio como en mitad de frase, y de falsos arranques (repeticiones de palabras o sintagmas).
- Normalización inversa de texto: conversión de formas habladas a escritas para números, moneda, fechas, horas, porcentajes, direcciones de correo, URL y números de teléfono.
- Reparación gramatical que preserva el significado y el vocabulario original del hablante, sin reescribir el contenido.
- Adaptación de tono y mayúsculas a un contexto de aplicación indicado mediante una línea `app:` en el prompt.
- Salida de un único campo de texto limpio, sin comentarios ni explicaciones (formato pensado para insertar directamente en el campo de destino).
- Modo thinking desactivado por diseño (`enable_thinking=False` en la plantilla de chat).
- No soporta visión, audio, tool calling ni razonamiento multi-paso: el modelo es de un solo disparo y tarea única.

## Casos de uso

- Dictado en aplicaciones de notas y mensajería: el modelo se invoca tras el ASR local y devuelve el texto listo para enviar; con 0,32 s de media por dictado en un M5 y 2,65 GB de pico, encaja en el flujo interactivo de una app de escritorio o móvil sin salir del dispositivo.
- Post-procesado de transcripciones de reuniones: al eliminar muletillas y falsos arranques y restaurar puntuación, reduce el trabajo de edición manual antes de generar el acta; conviene trocear la transcripción en segmentos alineados por frases, ya que las entradas únicas de más de 300 palabras pueden repetirse.
- Extracción de datos estructurados a partir de voz: la normalización inversa convierte "send it to john dot smith at example dot com by friday the twelfth" en `john.smith@example.com` y `Friday, the twelfth`, lo que permite rellenar campos de CRM, formularios o recordatorios sin parseo adicional.
- Correo y mensajería profesional dictados: la línea `app:` del prompt permite fijar el registro (por ejemplo, formal para correo corporativo, informal para chat interno) y ajustar mayúsculas y tono en la misma pasada.
- Accesibilidad y entrada por voz para usuarios con movilidad reducida: al ejecutarse en local, el audio y el texto no abandonan el dispositivo, requisito habitual en entornos sanitarios o corporativos con datos sensibles.
- Subtitulado y limpieza de transcripciones ASR en pipelines de contenido: normalizar cifras, horas y nombres propios antes de publicar o de pasar el texto a un motor de traducción, donde una puntuación correcta mejora la segmentación.
- Integración en herramientas de dictado para desarrolladores: al ser un modelo plano (sin adaptador que cargar) y con licencia Apache-2.0, se puede empaquetar como paso fijo de un pipeline ASR → ZenPolish → texto final sin gestionar dependencias de PEFT.

## Benchmarks y rendimiento

Greedy decoding, Apple M5, MLX 0.32.2.

**eval_v500**: 500 dictados, con control de fuga de datos, máximo 200 tokens.

| Metrica | v3.2 4-bit DWQ | v3.2 3-bit DWQ | v2.2 Lite (1.7B) | v3.1 (4B anterior) |
|---|---|---|---|---|
| WER | 4,7% | 4,7% | 5,5% | 13,3% |
| Exact match | 67,2% | 64,2% | 65,8% | 49,8% |
| Punct F1 | 0,859 | 0,838 | 0,863 | 0,772 |
| Sentence-start | 95,1% | 93,4% | 94,4% | 82,3% |
| Pesos | 2,26 GB | 1,76 GB | 1,05 GB | 2,26 GB |
| Velocidad de decodificacion | 47 tok/s | 58 tok/s | 73 tok/s | 47 tok/s |

**Datos held-out de v2.2**: 500 filas no usadas ni en entrenamiento ni en DWQ.

| Metrica | v3.2 4-bit DWQ | v3.2 3-bit DWQ | v2.2 Lite | v3.1 |
|---|---|---|---|---|
| WER | 8,0% | 9,0% | 8,9% | 26,9% |
| Exact match | 40,6% | 37,0% | 37,0% | 10,4% |

Frente a Lite, la mejora de exact match del modelo 4-bit es de +3,6 puntos (IC 95%: +0,4 a +6,8).

**Dictados medios**: 150 dictados de 50 a 99 palabras, máximo 400 tokens.

| Metrica | v3.2 4-bit DWQ | v3.2 3-bit DWQ | v2.2 Lite | v3.1 |
|---|---|---|---|---|
| WER | 10,3% | 15,1% | 11,0% | 13,9% |
| Punct F1 | 0,815 | 0,796 | 0,795 | 0,695 |

**Runtime de la app ZenVoice**: mlx-swift-lm, pipeline de formateo propio de la app, eval_v500. La salida del modelo da WER 3,9% y exact match 64,6%; Lite obtiene 4,0% y 65,4%. Tiempo y memoria: 0,32 s de media por dictado, pico de memoria de 2,65 GB, ningún dictado superó el presupuesto de tiempo de la app.

No se han publicado resultados en benchmarks generalistas (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Pesos: 2,26 GB en formato 4-bit DWQ (la variante 3-bit ocupa 1,76 GB; el modelo de 1,7B Lite, 1,05 GB).
- Memoria pico medida en la app ZenVoice: 2,65 GB, incluyendo KV cache y overhead del runtime.
- GPU: el modelo está publicado únicamente para MLX, de modo que el hardware objetivo es Apple Silicon (M-series). El benchmark se ejecutó en un Apple M5.
- Cabe en cualquier Mac con Apple Silicon y 8 GB de memoria unificada o más; el requisito práctico es disponer de MLX.
- No hay pesos GGUF ni safetensors para PyTorch publicados, por lo que no es desplegable directamente en vLLM, TGI, llama.cpp ni Ollama sin una conversión previa no soportada oficialmente.
- Opciones de despliegue: `mlx_lm` en Python (`load` + `generate`) y `mlx-swift-lm` para integración en apps Apple.
- Rendimiento: 47 tok/s de decodificación en M5 con greedy decoding; 0,32 s de media por dictado en el pipeline de la app.
- En GPU NVIDIA no hay cifras publicadas, al no existir artefactos para ese backend.

## Comparativa con modelos similares

| Modelo | Parametros | Pesos | Contexto | WER (eval_v500) | Exact match | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| ZenPolish v3.2 4-bit DWQ | 4,02B | 2,26 GB | no disponible | 4,7% | 67,2% | Apache-2.0 | MLX, safetensors |
| ZenPolish v3.2 3-bit DWQ | 4,02B | 1,76 GB | no disponible | 4,7% | 64,2% | Apache-2.0 | MLX, safetensors |
| ZenPolish v2.2 Lite | 1,7B | 1,05 GB | no disponible | 5,5% | 65,8% | Apache-2.0 | MLX |
| ZenPolish v3.1 (4B anterior) | 4B | 2,26 GB | no disponible | 13,3% | 49,8% | Apache-2.0 | MLX |
| Qwen3-4B-Instruct-2507 (base) | 4B | variable | no disponible en esta ficha | no aplica (modelo generalista) | no aplica | Apache-2.0 | safetensors, GGUF de la comunidad |

La comparación relevante es interna a la familia: el 4-bit DWQ iguala el WER del 3-bit pero gana 3 puntos de exact match, y supera al Lite de 1,7B en exact match (+3,6 puntos, IC 95% +0,4 a +6,8) a costa de duplicar el tamaño y bajar de 73 a 47 tok/s. Frente a la generación anterior (v3.1) la mejora es grande: el WER cae de 13,3% a 4,7%.

## Limitaciones y advertencias

- Ámbito restringido al inglés: la model card declara explícitamente "English dictation cleanup"; no hay soporte multilingüe documentado y los idiomas del repositorio figuran como no disponibles.
- Entradas largas: los dictados únicos de más de 300 palabras pueden generar repeticiones. El propio autor recomienda trocear en segmentos alineados por frases antes de limpiar, lo que añade complejidad al pipeline.
- La decodificación debe ser greedy (temperatura 0); no se documenta comportamiento con sampling.
- Dependencia crítica de la plantilla de chat incluida. Sin el bloque `<think>\n\n</think>\n\n` al final del prompt de generación, el primer token es indeterminado y las variantes de baja precisión producen tokens `<tool_call>`; usar la plantilla estándar de Qwen3 rompe el modelo.
- Riesgo de alucinación en la normalización inversa: fechas ambiguas ("the twelfth"), horas o importes pueden resolverse de forma incorrecta sin que el modelo lo señale, ya que la salida es texto plano sin marcas de confianza.
- No es un modelo de propósito general: no hay benchmarks de MMLU, código o matemáticas, y no conviene reutilizarlo como asistente conversacional.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero la licencia enlazada es la de Qwen3-4B-Instruct-2507 y conviene verificar las condiciones de atribución del modelo base; los datos de entrenamiento son solo de fuentes MIT, Apache-2.0, CC-BY-4.0 y CC0, con lista de atribuciones en el repositorio ZenVoice.
- Adopción prácticamente nula en el momento de la ficha (0 descargas, 0 likes) y autor individual sin proceso de revisión por pares: los benchmarks son autoinformados y no han sido replicados de forma independiente.
- Dependencia de plataforma: al estar solo en MLX, el modelo queda ligado al ecosistema Apple Silicon; no hay ruta oficial a CUDA, ROCm ni a despliegue en servidor.
- Memoria pico de 2,65 GB: en dispositivos Apple con 8 GB de memoria unificada compite con el resto de la app y del sistema, lo que puede afectar a la latencia real en multitarea.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/imYChaudhary22/zen-polish-v32-4bit
- Modelo base bf16 sin cuantizar: https://huggingface.co/imYChaudhary22/zen-polish-v32-bf16
- Corpus y modelo de referencia v2.2 Lite: https://huggingface.co/imYChaudhary22/zen-polish-v22-lite
- Modelo base Qwen3-4B-Instruct-2507: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507/blob/main/LICENSE
- Repositorio del autor en GitHub (incluye el repositorio ZenVoice): https://github.com/imYChaudhary22/
- Version anterior de la familia (v3, 4-bit): https://huggingface.co/imYChaudhary22/zen-polish-v3-4bit
- Registro de metadatos en llm-explorer (modelo de 1,7B de la misma familia): https://llm-explorer.com/model/imYChaudhary22%2Fzen-polish-v2-1.7b-4bit,56AROxVWtO1FYoLTMr3YHg
