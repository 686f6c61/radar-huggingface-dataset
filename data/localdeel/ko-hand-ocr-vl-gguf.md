# localdeel/ko-hand-ocr-vl-GGUF

## Resumen

ko-hand-ocr-vl-GGUF es la versión cuantizada en formato GGUF de ko-hand-ocr-vl, un modelo de visión-lenguaje de 0,8B parámetros especializado en reconocimiento óptico de caracteres (OCR) de escritura manual en coreano (hangul). Lo desarrolla el usuario localdeel y se construye mediante fine-tuning de Qwen3.5-0.8B sobre datos sintéticos de caligrafía coreana, sin modificar la arquitectura original. El problema que resuelve es concreto: convertir una fotografía de texto manuscrito en coreano directamente a texto, algo que el modelo base no hace bien (su CER en escritura manual ronda el 98-160 %, es decir, prácticamente inutilizable para esta tarea).

El modelo es relevante porque ofrece OCR de manuscrito coreano con pesos abiertos, licencia Apache-2.0 y un tamaño que cabe en cualquier GPU de consumo, e incluso en CPU. Su arquitectura es la de Qwen3.5-0.8B: un híbrido de 18 capas Gated DeltaNet y 6 capas de atención, más un codificador visual de aproximadamente 100 millones de parámetros, con 752.393.024 parámetros totales. El repositorio ocupa 1,5 GB e incluye cuantizaciones Q4_K_M (505 MB) y Q8_0 (774 MB), además del proyector multimodal mmproj en F16 (195 MB).

Se trata de una **versión intermedia**: se ha entrenado durante 2.000 de los 16.000 pasos previstos, y el autor anuncia que publicará los pesos finales y una comparativa contra otros seis motores de OCR en la misma dirección. El modelo se distribuye con la plantilla de chat modificada (el bloque de razonamiento permanece cerrado) y con `top_k: 1` fijado, de modo que la salida sea determinista línea a línea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 18 capas Gated DeltaNet + 6 capas de atención, con codificador visual de ~100 M de parámetros (arquitectura Qwen3.5-0.8B sin modificaciones) |
| Parametros totales | 752.393.024 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 8.192 tokens en la configuración de referencia (Ollama/llama.cpp); la imagen se reduce a un máximo de 4.096 tokens |
| Tipos de cuantizacion | Q4_K_M (505 MB), Q8_0 (774 MB, recomendada); proyector multimodal mmproj en F16 (195 MB); safetensors en bf16 en el repositorio base |
| Idiomas soportados | coreano (ko) y ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (este repositorio); safetensors en localdeel/ko-hand-ocr-vl |

## Arquitectura y entrenamiento

El modelo conserva íntegramente la arquitectura de Qwen3.5-0.8B: un transformer híbrido compuesto por 18 capas Gated DeltaNet y 6 capas de atención convencional, más un codificador de visión de aproximadamente 100 millones de parámetros. El autor indica explícitamente que no se ha cambiado ninguna capa, de modo que el modelo es compatible con cualquier runtime que ya soporte Qwen3.5 (Ollama, LM Studio, llama.cpp, vLLM, transformers) sin necesidad de código específico.

El entrenamiento se realizó con LoRA de rango 64 aplicado a todas las capas lineales, incluido el codificador visual, con la pérdida calculada únicamente en las posiciones de respuesta, y posteriormente se fusionó (merge) en los pesos finales. Todos los datos de entrenamiento son sintéticos: un 55 % son líneas dibujadas con 450 tipografías manuscritas, un 35 % son fotografías simuladas de 1 a 10 líneas escritas a mano sobre papel y fotografiadas sobre una mesa (con lado largo entre 640 y 2.400 píxeles), y un 10 % son líneas de texto impreso. Se aplicaron aumentos de datos que incluyen marcas de borrado, deformación de trazos, inclinación, sombras, desenfoque y compresión JPEG. Las 30 tipografías de prueba y las 11 fotografías de evaluación quedaron excluidas del entrenamiento.

Las modificaciones de configuración respecto al modelo base son tres: el bloque de razonamiento de la plantilla de chat permanece siempre cerrado, la imagen se limita a 4.096 tokens y se fija `top_k: 1` para forzar la selección del token más probable.

## Capacidades

- OCR de escritura manual en coreano: recibe una fotografía y devuelve el texto en hangul, una línea por línea de salida.
- Lectura de imagen completa, no solo de recortes: procesa la fotografía entera y segmenta implícitamente las líneas.
- Funciona con cualquier instrucción de entrada: "OCR", "lee el texto", en coreano, en inglés o incluso con un mensaje vacío; la salida es siempre solo texto.
- Inferencia determinista: con `temperature 0` y `top_k 1`, la salida es estable entre ejecuciones, lo que es adecuado para OCR.
- Compatibilidad con tool calling y agentes: no documentada en la información disponible.
- Capacidades multilingües: limitadas a coreano e inglés; el coreano es el idioma objetivo real.
- Capacidades especiales: OCR de texto impreso (entrenado con un 10 % de líneas impresas), tolerancia a sombras, desenfoque, inclinación, JPEG y marcas de borrado.
- No hay modo de razonamiento visible: el bloque de pensamiento está cerrado por plantilla.

## Casos de uso

- Digitalizacion de formularios manuscritos en coreano: el modelo puede procesar la fotografía de un formulario rellenado a mano (por ejemplo, campos de nombre, departamento o dirección) y devolver el texto línea a línea, lo que permite volcarlo después a una base de datos mediante un parser sencillo.
- OCR en dispositivo o en el borde: con Q8_0 (774 MB) más el proyector mmproj (195 MB), el conjunto cabe en menos de 1 GB de memoria, por lo que puede ejecutarse en portátiles, mini-PC o incluso en CPU sin GPU dedicada, algo relevante para aplicaciones de digitalización en campo.
- Archivado y catalogación de documentos coreanos: permite extraer el texto de fotografías de apuntes, cartas o notas manuscritas para indexarlas en un sistema de búsqueda, sin depender de servicios en la nube.
- Preprocesado para pipelines de PLN en coreano: la salida de texto puede alimentar directamente tareas posteriores de normalización, traducción, análisis de sentimiento o resumen, sustituyendo a la introducción manual de texto.
- Automatización de la entrada de datos en aplicaciones móviles: integrado tras una API compatible con OpenAI, una app puede enviar una imagen en base64 y recibir el texto, con latencia baja gracias al tamaño reducido del modelo.
- Asistencia a la accesibilidad: conversión de notas manuscritas en coreano a texto digital para personas con dificultades de lectura o para lectores de pantalla.
- Procesamiento por lotes en servidores modestos: al ocupar menos de 1 GB en Q8_0, se pueden desplegar varias instancias en una sola GPU o servir peticiones concurrentes con vLLM (`--limit-mm-per-prompt '{"image": 1}'`).
- Extracción de texto para investigación lingüística: permite construir corpus de escritura manual coreana a partir de fotografías, aunque con las limitaciones de precisión indicadas más abajo.

## Benchmarks y rendimiento

Datos medidos por el autor en el mismo equipo (RTX 5060 Laptop, 8 GB) con las mismas pruebas. "Similitud jamo" es la similitud a nivel de jamo (letra componente) y "CER" es la tasa de error de caracteres; en similitud, más alto es mejor, y en CER, más bajo es mejor.

Lectura línea a línea:

| Modelo | 6 tipografias de prueba (similitud jamo / CER) | 11 fotos, casilla de linea (similitud jamo / CER) |
|---|---:|---:|
| ko-hand-ocr-vl (este) | 89,1 / 14,1 | 84,6 / 23,4 |
| Qwen3.5-0.8B (original) | 51,1 / 160,6 | 55,1 / 98,6 |

Lectura de fotografía completa:

| Modelo | Similitud jamo (pagina) | CER (pagina) | Foto mas baja (pagina) | Similitud jamo (pares de linea) |
|---|---:|---:|---:|---:|
| ko-hand-ocr-vl (este) | 82,0 | 31,6 | 63,6 | 61,6 |
| Qwen3.5-0.8B (original) | 72,7 | 42,1 | 55,3 | 62,1 |

Consistencia según la vía de despliegue:

| Via de ejecucion | 6 tipografias de prueba | Casilla de linea en fotos | Foto completa |
|---|---:|---:|---:|
| transformers (bf16, safetensors) | 89,1 | 84,6 | 82,0 |
| llama.cpp `llama-server` — Q8_0 | 88,5 | 86,9 | 83,7 |
| LM Studio — Q8_0, sin tocar ajustes | 88,5 | 86,2 | 84,9 |
| Ollama — `hf.co/...:Q8_0`, sin tocar ajustes | 88,2 | 86,9 | 83,7 |

El autor advierte de que el conjunto de prueba de fotografías es de solo 11 imágenes, por lo que cada una pesa aproximadamente 9 puntos porcentuales en la métrica de página.

## Requisitos de hardware

- VRAM estimada: Q4_K_M (505 MB) más mmproj F16 (195 MB) ronda los 700 MB; Q8_0 (774 MB) más mmproj (195 MB) ronda 1,0 GB. Con contexto de 8.192 tokens hay que sumar el espacio de la caché KV.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM. El autor validó el modelo en una RTX 5060 Laptop de 8 GB. También es viable en A100, H100 o RTX 4090, aunque están sobredimensionadas para este tamaño.
- GPU de consumo: sí, cabe con holgura en cualquier GPU de consumo moderna (RTX 3060, 4060, 4090, etc.), e incluso en CPU, dado que el conjunto en Q8_0 no llega a 1 GB.
- Opciones de despliegue: Ollama (`ollama run hf.co/localdeel/ko-hand-ocr-vl-GGUF:Q8_0`), LM Studio (`lms get https://huggingface.co/localdeel/ko-hand-ocr-vl-GGUF@q8_0`), llama.cpp (`llama-server -hf localdeel/ko-hand-ocr-vl-GGUF:Q8_0 --temp 0`), vLLM (`vllm serve localdeel/ko-hand-ocr-vl --max-model-len 8192 --limit-mm-per-prompt '{"image": 1}'`) y transformers con `AutoModelForImageTextToText`.
- Latencia y throughput: no disponibles. El autor no publica medidas de tiempo por imagen ni de tokens por segundo.
- Nota: el autor no pudo probar vLLM directamente porque desarrolla en Windows, aunque afirma que debería funcionar por la compatibilidad con Qwen3.5.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento OCR | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ko-hand-ocr-vl-GGUF (este) | 752 M | 8.192 tokens (imagen a 4.096) | 89,1 similitud jamo / 14,1 CER en línea a línea; 82,0 / 31,6 en página | Apache-2.0 | GGUF y safetensors en HuggingFace |
| Qwen3.5-0.8B (modelo base) | 0,8 B | el del modelo base | 51,1 / 160,6 en línea a línea; 72,7 / 42,1 en página | Apache-2.0 | HuggingFace |
| ko-hand-ocr (mismo autor) | 41 M | no disponible | No comparable directamente: lee solo una línea ya recortada; según el autor, sigue siendo más preciso que este modelo para ese caso concreto | no disponible en la información | HuggingFace y repositorio en GitHub |

No se dispone de datos sobre otros motores de OCR coreano comparables; el autor anuncia una tabla comparativa contra seis motores de OCR en la publicación de los pesos finales.

## Limitaciones y advertencias

- **No se ha entrenado con escritura manual humana real**: solo con caligrafía generada a partir de tipografías. La letra cursiva o con trazos superpuestos es un punto débil declarado por el propio autor.
- **Versión intermedia**: solo 2.000 de los 16.000 pasos de entrenamiento. Los pesos finales sustituirán a estos en la misma dirección.
- **Conjunto de prueba muy pequeño**: 11 fotografías, de modo que la métrica de página tiene una varianza alta (cada imagen pesa unos 9 puntos porcentuales).
- **Riesgo de alucinación**: no cuantificado por el autor, pero al ser un modelo generativo de 0,8 B existe la posibilidad de que produzca texto plausible que no esté en la imagen, especialmente con caligrafía fuera de distribución.
- **No interpreta estructuras de formato**: no lee tablas, sellos ni firmas; devuelve únicamente texto línea a línea, sin estructura.
- **Cobertura idiomática limitada**: coreano como idioma objetivo e inglés de forma secundaria. No se ha validado para otras lenguas.
- **Cabeza `mtp.*` sin ajustar**: en los safetensors, la cabeza de predicción multi-token no se ha afinado. Según el autor, esto no cambia la respuesta pero puede reducir el acierto de la predicción especulativa. No está presente en los GGUF.
- **Dependencia de configuración estricta**: el autor recomienda `temperature 0` (y el archivo fija `top_k 1`). Cambiar estos parámetros puede degradar la salida, ya que el OCR requiere decodificación determinista.
- **Licencia**: Apache-2.0 tanto en este modelo como en el base Qwen3.5-0.8B, por lo que no hay restricciones conocidas para uso comercial. El autor remite al archivo `NOTICE` para más detalle.
- **Aviso de producción**: al tratarse de una versión intermedia y con un conjunto de evaluación reducido, conviene validar el modelo con muestras propias antes de desplegarlo en un flujo crítico.

## Enlaces

- Repositorio HuggingFace (GGUF): https://huggingface.co/localdeel/ko-hand-ocr-vl-GGUF
- Repositorio HuggingFace (safetensors): https://huggingface.co/localdeel/ko-hand-ocr-vl
- Modelo base Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Modelo hermano ko-hand-ocr (41 M): https://huggingface.co/localdeel/ko-hand-ocr
- Repositorio de código del recorte de líneas ko-hand-ocr: https://github.com/jysvai/ko-hand-ocr
