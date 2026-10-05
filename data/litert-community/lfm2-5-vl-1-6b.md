# litert-community/LFM2.5-VL-1.6B

## Resumen

LFM2.5-VL-1.6B es un modelo de visión-lenguaje (VLM) de 1,6 mil millones de parámetros desarrollado por LiquidAI y convertido por la comunidad `litert-community` al formato LiteRT-LM (`.litertlm`) para inferencia en dispositivo con el runtime LiteRT de Google, el nuevo nombre de TensorFlow Lite. Ocupa la posición intermedia de la familia LiteRT de esta saga, entre LFM2.5-VL-450M y LFM2.5-VL-3B. El problema que resuelve es claro: ejecutar comprensión de imagen y texto directamente en teléfonos y equipos de borde, sin enviar datos a la nube ni depender de GPU de servidor.

El modelo combina un backbone de texto híbrido LFM2 (16 capas con convoluciones cortas con puerta y atención con consultas agrupadas, dimensión oculta 2048, vocabulario de 64 000 tokens) con la misma torre de visión SigLIP2 que usa el modelo de 3B (27 capas, dimensión oculta 1152). Cada imagen se procesa a 512×512 y se convierte en 256 tokens suaves, con una sola imagen por prompt y un máximo de 4096 tokens de caché KV. El bundle incluye el codificador de visión, el adaptador y los metadatos de marcadores de imagen, por lo que el comando `litert-lm run ... --attachment foto.png` funciona de extremo a extremo.

Su relevancia actual es doble. Por un lado, demuestra que un VLM con torre SigLIP2 completa puede caber en 1,30 GB en cuantización int4 y ejecutarse en un Pixel 8a con la parte de lenguaje en GPU y la visión en CPU. Por otro, arrastra un defecto conocido y documentado: en el runtime `litert-lm` 0.16.0 solo llega al modelo el cuarto superior de la imagen, lo que invalida cualquier pregunta posicional, de conteo o de localización. El repositorio publica una compilación reparada (`int4_fixB`) que corrige el problema.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida: backbone de texto LFM2 (16 capas, convoluciones cortas con puerta + atención con consultas agrupadas, hidden 2048, vocabulario 64k) + torre de visión SigLIP2 (27 capas, hidden 1152) + adaptador de visión |
| Parámetros totales | Aproximadamente 1,6 mil millones (según la denominación del modelo; la model card no desglosa el recuento exacto ni la separación texto/visión) |
| Parámetros activos | No aplica: es un modelo denso, no MoE |
| Longitud de contexto | 4096 tokens máximo (caché KV) |
| Tipos de cuantización | int8 dinámico (lineales de texto, convoluciones y embedding, torre de visión) e int4 blockwise-32 OCTAV en lineales de texto con embedding y lm_head en int8 y torre de visión en int8 |
| Idiomas soportados | No disponible |
| Licencia | LFM Open License v1.0 (etiquetada como `license: other` en HuggingFace) |
| Formato de pesos | `.litertlm` (bundle LiteRT-LM); no se publican safetensors ni GGUF en este repositorio |
| Tamaño de los artefactos | int8: 1,81 GB; int4: 1,30 GB; int4_fixB: 1,30 GB; tamaño total del repositorio: 4,4 GB |
| Entrada de imagen | 1 imagen por prompt, redimensionada a 512×512 por el runtime, PNG/JPEG mediante `--attachment`; 256 tokens suaves por imagen |
| Plantilla de chat | Incluida en el bundle, estilo ChatML; los marcadores de imagen los inserta el procesador de datos LFM2 del runtime |
| Modelo base | LiquidAI/LFM2.5-VL-1.6B |
| Modelo de pensamiento | No: es un modelo sin modo de razonamiento explícito (non-thinking) |

## Arquitectura y entrenamiento

La arquitectura es híbrida en dos sentidos. En el plano del texto, el backbone LFM2 alterna convoluciones cortas con puerta y capas de atención con consultas agrupadas (GQA) a lo largo de 16 capas con dimensión oculta 2048 y vocabulario de 64 000 tokens; este diseño reduce el coste de atención respecto a un transformer puramente atencional y está pensado para latencia baja en CPU. En el plano multimodal, la torre SigLIP2 de 27 capas y dimensión oculta 1152 es la misma que monta el modelo de 3B de la familia, de modo que la capacidad de percepción visual no se recorta al bajar de tamaño, solo el backbone lingüístico. La imagen se proyecta a 256 tokens suaves mediante un adaptador que realiza un *pixel-unshuffle* 2×2.

Ese detalle del adaptador es la raíz del defecto documentado: la familia LFM2.5-VL hace el *unshuffle* 2×2 en el adaptador de visión, no en el codificador, mientras que el runtime LiteRT asume lo contrario (factor de reducción mal aplicado, reportado como LiteRT-LM#3246). El resultado es que en `litert-lm` 0.16.0 solo el cuarto superior de la imagen llega al modelo, sin error y con salida bien formada. La compilación `LFM2.5-VL-1.6B_int4_fixB.litertlm` reexporta los dos grafos de visión para que el *unshuffle* ocurra dentro del codificador, manteniendo intactos pesos de texto, tokenizer y metadatos.

No hay información disponible en la model card sobre volumen de tokens de entrenamiento, composición del dataset, etapas de ajuste (RLHF, DPO u otras) ni datos de preentrenamiento. Tampoco se documenta el proceso de destilación o alineación del modelo base.

## Capacidades

- Generación de texto y respuesta a preguntas de un solo turno, con 8/8 aciertos en la puerta de calidad de texto del repositorio.
- Descripción de imágenes (*captioning*) y respuesta a preguntas sobre imágenes, con una imagen por prompt.
- Reconocimiento óptico de caracteres sobre texto grande y dominante en la imagen.
- Preguntas de color dominante y de palabra más grande detectada en la imagen.
- Sondas geométricas básicas: en qué esquina está un objeto, orientación de franjas horizontales frente a verticales.
- Ejecución totalmente local, en CPU y en GPU OpenCL (Android y macOS), sin llamadas a servicios externos.
- Conversación multi-turno dentro de la ventana de 4096 tokens de caché KV.
- No soporta *tool calling* ni *function calling* según la información disponible.
- No soporta razonamiento agéntico multi-paso ni modo de pensamiento (*thinking mode*).
- No soporta audio ni vídeo; la entrada multimodal se limita a imagen y texto.
- Idiomas soportados: no disponible en la información proporcionada.

## Casos de uso

- OCR en aplicaciones móviles: el modelo lee texto grande y dominante en una foto de 512×512 sin salir del dispositivo, útil para digitalizar carteles, tickets o etiquetas en apps Android donde no se quiere subir la imagen a un servidor.
- Descripción de imágenes para accesibilidad: una app puede generar una descripción textual de una foto para usuarios con discapacidad visual, ejecutando todo el pipeline en el propio teléfono con el runtime LiteRT-LM.
- Clasificación visual ligera en el borde: preguntas del tipo "¿de qué color es el coche?" o "¿cuál es la palabra más grande del cartel?" se responden correctamente en las pruebas de calidad publicadas, lo que sirve para triaje previo de imágenes antes de enviarlas a un modelo mayor.
- Asistente de cámara sin conexión: aplicaciones de campo (inspección, agricultura, logística) donde no hay red pueden hacer preguntas puntuales sobre una foto capturada, siempre que la pregunta no requiera localización ni conteo.
- Moderación o filtrado preliminar en el dispositivo: verificar la presencia de un sujeto dominante o un texto esperado antes de decidir si la imagen se procesa en la nube, reduciendo coste y exposición de datos.
- Integración en demos y prototipos de visión en Android: con el bundle de 1,30 GB en int4 y el comando `litert-lm run --attachment`, es viable montar una prueba funcional en un teléfono de gama media-alta en minutos, sin infraestructura de servidor.
- Procesamiento por lotes en equipos de borde con CPU: al funcionar en CPU pura (y con visión en CPU verificada en un Pixel 8a), sirve para nodos sin GPU dedicada que necesiten comprensión de imagen ocasional.
- Aplicaciones con requisitos de privacidad estrictos: al no requerir conectividad ni transmisión de la imagen, encaja en entornos sanitarios, legales o industriales donde los datos no pueden salir del dispositivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card solo incluye puertas de verificación cualitativas ejecutadas con decodificación greedy, motor nuevo por pregunta y `--cache no`:

| Configuración | Texto (8 preguntas) | Imagen (5 preguntas) |
|---|---|---|
| PyTorch bf16 (referencia) | No disponible | 5/5 |
| LiteRT int4-b32 (CPU y GPU) | 8/8 | 3/5 |
| LiteRT int8 (CPU y GPU) | 8/8 | 3/5 |

Las cinco pruebas de visión son fixtures sintéticos deterministas: color dominante, OCR de texto grande, forma, conteo de tres cuadrados y palabra más grande. En las tres configuraciones LiteRT fallan las pruebas de forma fina y de conteo; color, OCR de texto grande y palabra más grande se responden correctamente, igual que las sondas geométricas adicionales. La model card suministrada está truncada en ese punto, por lo que el detalle completo de los fallos en dispositivo no está disponible.

Prueba de regresión del defecto posicional (imagen de 512×512 con 16 bandas horizontales numeradas, pidiendo enumerarlas de arriba abajo):

| Compilación | Resultado |
|---|---|
| Bundle estándar en `litert-lm` 0.16.0 | Conteo desbocado que nunca se detiene en 16 (el modelo degenera en lugar de cortar limpiamente) |
| `int4_fixB` en `litert-lm` 0.16.1 y 0.17.0 (2026-09-16) | 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 |

## Requisitos de hardware

- Pesos en disco: 1,30 GB para las compilaciones int4 y 1,81 GB para la int8; el repositorio completo ocupa 4,4 GB.
- Memoria en ejecución: proporcional a los pesos más la caché KV de 4096 tokens; no se publican cifras exactas de RAM pico, por lo que no están disponibles.
- Cabe holgadamente en cualquier teléfono moderno: verificado en un Pixel 8a (Android 16, LiteRT-LM 0.16.1) con el bundle int4 descargado y verificado por SHA-256.
- Cabe en GPU de consumo: el tamaño de pesos int4 (1,30 GB) está muy por debajo de los 8-12 GB típicos de una RTX 3060 o superior, aunque el runtime objetivo es el borde, no el escritorio con GPU dedicada.
- Backends soportados: CPU en todas las plataformas; GPU con `litert-lm` ≥ 0.16.0 vía OpenCL en Android y macOS (medido). En iOS, Metal falla al crear el motor para esta familia (LiteRT-LM#3129), por lo que hay que usar CPU.
- Configuraciones verificadas: modelo de lenguaje en GPU con codificador de visión en CPU, y ambos en CPU, con respuestas correctas en los dos casos.
- Opciones de despliegue: runtime `litert-lm` (paquete pip 0.16.0 y posteriores, con CLI `litert-lm run … --attachment`), integración Android mediante `com.google.ai.edge.litert:litert` y conversión desde PyTorch con `litert-torch`. No hay soporte para vLLM, llama.cpp, Ollama ni TGI, ya que el formato `.litertlm` es específico de este runtime.
- Latencia y throughput: no disponibles; la model card no publica tokens por segundo ni tiempos de primera respuesta.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Visión | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|---|
| litert-community/LFM2.5-VL-1.6B | ~1,6 B | 4096 tokens | SigLIP2 de 27 capas, hidden 1152, 256 tokens por imagen | LFM Open License v1.0 | Bundles int8 (1,81 GB) e int4 (1,30 GB) en `.litertlm` | Compilación `fixB` corrige el defecto posicional |
| litert-community/LFM2.5-VL-450M | 450 M (según denominación) | No disponible | No disponible | No disponible | Bundle `.litertlm` | Versión más pequeña de la misma familia |
| litert-community/LFM2.5-VL-3B | 3 B (según denominación) | No disponible | Misma torre SigLIP2 que el 1.6B | No disponible | Bundle `.litertlm` | El anclaje de coordenadas (*coordinate grounding*) se describe como capacidad exclusiva del 3B dentro de la familia |
| LiquidAI/LFM2.5-VL-1.6B | ~1,6 B | No disponible | Idéntica | LFM Open License v1.0 | Pesos originales en PyTorch | Modelo base del que deriva esta conversión; sirve como referencia bf16 con 5/5 en las pruebas de imagen |

No se dispone de datos comparativos de benchmarks entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Defecto crítico de visión posicional: en `litert-lm` 0.16.0 y en `main`, solo el cuarto superior de la imagen llega al modelo. Cualquier tarea de localizar, contar, enumerar o preguntar por la posición de un objeto devuelve respuestas incorrectas sin lanzar ningún error y con salida bien formada. Afecta a todos los bundles LFM2.5-VL, no solo a este.
- El problema es silencioso: en producción es especialmente peligroso porque el modelo no falla, responde mal. Hay que usar `LFM2.5-VL-1.6B_int4_fixB.litertlm` o esperar a que se corrija el runtime.
- La compilación reparada restaura el área visible de la imagen, pero no el anclaje de coordenadas, que sigue siendo una capacidad reservada al modelo de 3B de la familia.
- Degeneración del modelo de 1,6B en tareas de conteo: en la prueba de las 16 bandas, el bundle estándar entra en un conteo desbocado en lugar de cortar limpiamente.
- Fallos en las pruebas de forma fina y de conteo incluso en las configuraciones con texto perfecto (8/8 en texto, 3/5 en imagen).
- La model card suministrada está truncada en la sección de calidad, por lo que el inventario completo de fallos en dispositivo no está disponible.
- No soporta tool calling, function calling ni razonamiento agéntico multi-paso; no es un modelo apto para pipelines de agentes.
- Sin modo de razonamiento explícito (non-thinking), lo que limita tareas que requieran cadenas de pensamiento largas.
- Ventana de contexto muy corta (4096 tokens) y una sola imagen por prompt, lo que descarta casos de uso con documentos largos o múltiples imágenes.
- Metal en iOS falla al crear el motor para esta familia (LiteRT-LM#3129); en iOS hay que usar CPU.
- Idiomas soportados no documentados: no hay garantía publicada de cobertura multilingüe.
- Licencia LFM Open License v1.0, etiquetada como `license: other`: las condiciones concretas de uso comercial no se detallan en la información disponible, por lo que hay que revisar el fichero LICENSE del repositorio antes de un despliegue comercial.
- Riesgo de alucinación: no se publican evaluaciones de fidelidad ni tasas de alucinación; en tareas de OCR y descripción conviene validar las salidas.
- Sesgos: no se documenta ningún análisis de sesgos en la información disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/litert-community/LFM2.5-VL-1.6B
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-VL-1.6B
- Versión menor de la familia: https://huggingface.co/litert-community/LFM2.5-VL-450M
- Versión mayor de la familia: https://huggingface.co/litert-community/LFM2.5-VL-3B
- Runtime LiteRT-LM: https://github.com/google-ai-edge/litert-lm
- Incidencia del *unshuffle* en el adaptador de visión: https://github.com/google-ai-edge/LiteRT-LM/issues/3246
- Incidencia del fallo de Metal en iOS: https://github.com/google-ai-edge/LiteRT-LM/issues/3129
- Script de reexportación de los grafos de visión: https://github.com/john-rocky/LiteRT-Models/blob/screen-agent/screen-agent/tools/reexport_vision_unshuffle.py
- Script de reempaquetado del bundle: https://github.com/john-rocky/LiteRT-Models/blob/screen-agent/screen-agent/tools/repack_vision.py
- Medición de fidelidad de la conversión LiteRT frente a PyTorch en Galaxy S26: https://github.com/john-rocky/apple-silicon-llm-bench/blob/main/results/android/tinyhybridnet-three-runtimes.md
- Búsqueda web: los resultados devueltos corresponden a páginas de ayuda de YouTube TV y a hilos no relacionados, sin información aprovechable sobre el modelo.
