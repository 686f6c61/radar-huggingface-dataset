# Kus669/ViSceT5-ViTextVQA

## Resumen

ViSceT5-ViTextVQA es un modelo de respuesta visual a preguntas (visual question answering, VQA) especializado en texto presente en escenas para vietnamita. Lo desarrolla el usuario Kus669 y se construye sobre el encoder-decoder VietAI/vit5-base, con unos 346 millones de parametros, al que se anaden caracteristicas visuales obtenidas con CLIP ViT-B/16 y una representacion estructurada de los tokens OCR detectados en la imagen. El modelo recibe la imagen, la pregunta y el texto OCR con sus cajas y caracteristicas, y genera la respuesta de forma autoregresiva.

El problema que aborda es el scene-text VQA: responder preguntas cuya respuesta esta impresa o rotulada en la propia imagen (carteles, etiquetas, documentos fotografiados). Se ha afinado exclusivamente sobre el conjunto ViTextVQA y esta disenado para ese dominio concreto, no como un VQA generico ni multilingue.

Su relevancia radica en las innovaciones de entrenamiento que incorpora: QA-ViT (features visuales condicionadas por la pregunta), Consformer (atencion con prior sobre las palabras OCR), DOVE (vistas aumentadas del bloque OCR) y OACT (entrenamiento contrastivo adversarial sobre OCR). El checkpoint publicado alcanza 36,01 EM y 58,93 F1 en el split de test de ViTextVQA, frente a 29,94 EM del baseline ViT5 sin estos modulos. La arquitectura es personalizada (model_type: openvivqa) y no carga con AutoModel.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder T5 (ViT5-base) con QA-ViT (CLIP ViT-B/16), Consformer y entrada OCR estructurada |
| Parametros totales | 345.630.410 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint publicado en fp32, 1,38 GB) |
| Idiomas soportados | vietnamita (vi) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer encoder-decoder basado en ViT5-base. El encoder recibe la pregunta y un bloque de tokens OCR enriquecidos con caracteristicas de caja, deteccion, reconocimiento y caracteres. La parte visual se procesa mediante QA-ViT, que extrae features de CLIP ViT-B/16 condicionadas por la pregunta a traves de un adaptador con compuerta y una perdida de grounding. Consformer introduce un prior de constituyentes sobre las palabras OCR en la auto-atencion, junto con una perdida de span.

El entrenamiento incorpora DOVE, que genera dos vistas del bloque OCR (la original y una copia "relacionada" con algunas palabras editadas), y OACT, una estrategia de entrenamiento contrastivo adversarial (no un modulo de inferencia). En OACT cada vista OCR recibe un paso de ruido en la direccion del gradiente de la perdida de respuesta (epsilon 0,05 del RMS de los tokens) y una perdida contrastiva supervisada conjunta alinea las cuatro vistas (dos limpias, dos perturbadas, con cabezas de proyeccion separadas). El checkpoint publicado tiene OACT activado durante el entrenamiento (`dove_adv=ocr_both`). No se especifican en la informacion disponible el numero de tokens de entrenamiento ni la composicion detallada del dataset mas alla de ViTextVQA.

## Capacidades

- Respuesta visual a preguntas sobre texto en escenas (scene-text VQA) en vietnamita.
- Lectura e interpretacion de tokens OCR integrados en la entrada del encoder.
- Generacion de respuestas mediante busqueda por haces (4 haces, hasta 56 tokens nuevos).
- Condicionamiento visual por pregunta mediante QA-ViT.
- Modelado de relaciones entre palabras OCR mediante Consformer.
- No se documenta soporte de tool calling, function calling, agentes, vision general, audio ni modo thinking.

## Casos de uso

- Digitalizacion de carteles y rotulos: dado un cartel fotografiado y una pregunta sobre su contenido (precio, horario, direccion), el modelo lee el texto OCR y genera la respuesta en vietnamita.
- Extraccion de informacion de documentos fotografiados: sobre formularios o etiquetas capturados con movil, responde preguntas concretas apoyandose en los tokens OCR y sus cajas.
- Asistencia a personas con discapacidad visual: un pipeline de OCR mas este modelo permite responder en voz alta preguntas sobre texto visible en el entorno.
- Procesamiento de tickets y recibos: responder preguntas sobre importes, fechas o nombres impresos en un ticket, usando la representacion estructurada del OCR.
- Analisis de senaletica en entornos fisicos: consultas sobre texto de paneles o indicaciones en imagenes capturadas por camaras.
- Investigacion en scene-text VQA: punto de partida reproducible para experimentar con QA-ViT, Consformer, DOVE y OACT sobre ViTextVQA, dado que el autor publica checkpoints de ablacion.
- Verificacion de contenido textual en imagenes: comprobar si una imagen contiene cierta informacion rotulada respondiendo a preguntas de si/no o de extraccion.

## Benchmarks y rendimiento

Resultados en ViTextVQA (test: 10.028 preguntas; dev: split de validacion en el checkpoint seleccionado). Protocolo de evaluacion del repositorio de codigo del autor.

| Metrica | Test | Dev |
|---|---|---|
| Exact Match (EM) | 36,01 | 34,51 |
| F1 (token) | 58,93 | 59,46 |
| F1 (caracter) | 72,27 | no disponible |
| BLEU-1 | 58,88 | 58,28 |
| BLEU-4 | 45,12 | 44,70 |
| BLEU-avg | 51,65 | no disponible |
| CIDEr | 3,3181 | 3,3852 |
| BERTScore F1 | 87,25 | no disponible |

Ablacion sobre ViTextVQA (test), cada fila es un entrenamiento independiente con una sola semilla:

| Configuracion | EM | F1 |
|---|---|---|
| Baseline (ViT5 + pregunta) | 29,94 | 54,91 |
| + Consformer | 32,55 | 56,40 |
| + QA-ViT | 32,88 | 56,77 |
| + DOVE (batch 32) | 34,60 | 58,26 |
| + QA-ViT + Consformer + DOVE | 34,85 | 58,20 |
| + OACT (este modelo) | 36,01 | 58,93 |

El autor advierte que diferencias inferiores a 0,6 EM estan dentro del ruido entre ejecuciones, por lo que las ganancias de cada modulo deben leerse como indicativas.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint es de 1,38 GB en fp32 (346M parametros); en fp16 rondaria 0,7 GB de pesos, mas el coste del extractor CLIP ViT-B/16 y las activaciones. No se publican cifras oficiales de VRAM.
- GPU recomendadas: no especificadas por el autor. Por tamano, cabe en GPUs de consumo como RTX 3060, RTX 4070 o RTX 4090; para lotes grandes o despliegue en servidor, A100 o H100.
- Cabe en GPU de consumo: si, por el tamano del modelo (346M parametros).
- Opciones de despliegue: no se documenta vLLM, llama.cpp, Ollama ni TGI. La arquitectura es personalizada (`model_type: openvivqa`) y requiere el codigo del repositorio en el commit `d350d49` y el notebook `notebooks/twc_colab.ipynb`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de otros modelos comparables en la informacion proporcionada. Como referencia interna, la ablacion del propio autor permite comparar el modelo final con su baseline ViT5 sin modulos (29,94 EM / 54,91 F1) y con las variantes intermedias, pero no con modelos externos.

| Modelo | Parametros | Contexto | EM (ViTextVQA test) | F1 (ViTextVQA test) | Licencia |
|---|---|---|---|---|---|
| ViSceT5-ViTextVQA (este) | 345,6M | no disponible | 36,01 | 58,93 | no disponible |
| Baseline ViT5 + pregunta | no disponible | no disponible | 29,94 | 54,91 | no disponible |
| Otros modelos externos | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Entrenado y evaluado unicamente sobre ViTextVQA; no hay garantias para otros conjuntos de VQA en vietnamita ni para otros idiomas.
- La respuesta depende de los tokens OCR: errores u omisiones en el OCR limitan directamente lo que el modelo puede responder.
- Resultados obtenidos con una sola semilla; el autor reconoce ruido entre ejecuciones de aproximadamente 0,6 EM.
- La arquitectura es personalizada (`model_type: openvivqa`): no carga con AutoModel y requiere el codigo del repositorio en el commit `d350d49`.
- Licencia no disponible: no se puede confirmar el uso comercial sin consultar al autor.
- No se documentan sesgos especificos, pero al entrenar solo con datos vietnamitas de scene-text VQA puede presentar sesgos hacia ese dominio y ese idioma.
- Riesgo de alucinacion no cuantificado en la informacion disponible.
- El paper descriptivo esta en preparacion segun el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kus669/ViSceT5-ViTextVQA
- Modelo base VietAI/vit5-base: https://huggingface.co/VietAI/vit5-base
- Modelo base CLIP ViT-B/16: https://huggingface.co/openai/clip-vit-base-patch16
- Repositorio de codigo (commit de entrenamiento): https://github.com/Kussssssss/ViSceT5/tree/d350d49
- Checkpoint de ablacion Consformer: https://huggingface.co/Kus669/ViSceT5-ViTextVQA-Abl-Consformer
- Checkpoint de ablacion QA-ViT: https://huggingface.co/Kus669/ViSceT5-ViTextVQA-Abl-QAViT
- Checkpoint de ablacion DOVE: https://huggingface.co/Kus669/ViSceT5-ViTextVQA-Abl-DOVE
- Checkpoint de ablacion QA-ViT + Consformer + DOVE: https://huggingface.co/Kus669/ViSceT5-ViTextVQA-Abl-QAViT-Consformer-DOVE
