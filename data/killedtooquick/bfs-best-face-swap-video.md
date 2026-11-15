# KilledTooQuick/BFS-Best-Face-Swap-Video

## Resumen

BFS-Best-Face-Swap-Video es un adaptador LoRA (IC-LoRA) para los modelos de generación de vídeo LTX-2.3 y LTX-2.5 de Lightricks, publicado por el usuario KilledTooQuick en Hugging Face. Su función es el intercambio de identidad facial (face swap o head swap) sobre vídeo: dado un vídeo guía y una imagen de referencia, el adaptador transfiere la identidad del rostro de la imagen al sujeto del vídeo preservando el movimiento original. Se distribuye como un repositorio de 13,4 GB con pesos en formato diffusers, pensado para flujos de posproducción VFX y prototipado cinematográfico.

El modelo no es un modelo base autónomo, sino un adaptador que requiere cargarse junto con el modelo LTX-2.3 o LTX-2.5 de Lightricks. La model card describe dos flujos de trabajo: la técnica de anclaje en el fotograma 0 (Frame 0 Anchoring) y el flujo de plantilla persistente introducido en la versión V3. El autor declara explícitamente que la herramienta está orientada a investigación de identidad digital, VFX profesional y prototipado, y exige consentimiento legal explícito de las personas cuya imagen se procese.

La relevancia actual radica en que los adaptadores de intercambio de identidad en vídeo están alcanzando calidad de producción con modelos de difusión de vídeo abiertos, lo que plantea cuestiones legales y éticas de primer orden. La licencia LTX-2 Community License Agreement impone restricciones adicionales al uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (IC-LoRA) sobre modelo de difusión de vídeo LTX-2 (arquitectura del modelo base no detallada en la información disponible) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | LTX-2 Community License Agreement (license_name: ltx-2-community-license-agreement; tag license: other) |
| Formato de pesos | diffusers (repositorio de 13,4 GB) |

## Arquitectura y entrenamiento

El adaptador se implementa como un IC-LoRA (In-Context LoRA) acoplado a los modelos de difusión de vídeo LTX-2.3 y LTX-2.5 de Lightricks. La técnica de "Frame 0 Anchoring" descrita en la model card consiste en anclar la identidad al primer fotograma del vídeo generado, de modo que el modelo sigue el movimiento del vídeo guía mientras preserva la identidad proporcionada en la imagen de referencia. La versión V3 introduce un flujo de trabajo de "plantilla persistente" que, según el autor, mejora la consistencia de la identidad a lo largo de la secuencia.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas adicionales más allá de las mencionadas. Tampoco se detalla la arquitectura interna del modelo base LTX-2 (tipo de transformer, mecanismo de atención, compresión latente del vídeo) en la información proporcionada.

## Capacidades

- Intercambio de identidad facial (face swap / head swap) en vídeo: transfiere el rostro de una imagen de referencia al sujeto de un vídeo guía.
- Generación de vídeo a partir de imagen (image-to-video) y transformación vídeo a vídeo (video-to-video), según los tags del repositorio.
- Preservación del movimiento del vídeo original mientras se sustituye la identidad.
- Consistencia de identidad a lo largo de la secuencia mediante la técnica de anclaje en el fotograma 0 y el flujo de plantilla persistente de V3.
- Compatibilidad con los modelos base LTX-2.3 y LTX-2.5 de Lightricks.
- Integración con la librería diffusers.
- Soporte de tool calling / function calling: no disponible (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (no es un modelo de texto).
- Capacidades especiales: no se documentan modos de pensamiento, visión general ni audio más allá del procesamiento de vídeo e imagen.

## Casos de uso

- Posproducción VFX: sustitución de la identidad de un doble de acción por la del actor principal en planos de riesgo, manteniendo el movimiento capturado en el vídeo guía y anclando la identidad al primer fotograma.
- Prototipado cinematográfico (previsualización): generar versiones preliminares de escenas con el reparto definitivo antes del rodaje, usando imágenes de referencia de los actores y vídeos de bloqueo de movimiento.
- Investigación en identidad digital: estudiar la fidelidad y la consistencia de la transferencia de identidad en vídeo con modelos de difusión abiertos, comparando las técnicas de anclaje en fotograma 0 y de plantilla persistente.
- Doblaje y localización audiovisual: adaptar la identidad facial de un actor a un vídeo de referencia para versiones localizadas, siempre con consentimiento explícito y derechos sobre la imagen.
- Publicidad y contenido de marca: generar variantes de un mismo anuncio con distintas personas de referencia a partir de un único vídeo guía, reduciendo costes de rodaje.
- Restauración y remasterización: sustituir rostros en material de archivo por la identidad actual del intérprete, con las autorizaciones legales correspondientes.
- Docencia y demostraciones técnicas: ilustrar flujos de trabajo de difusión de vídeo con LoRA en talleres de VFX, como el vídeo de YouTube referenciado en la model card.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. El repositorio pesa 13,4 GB, lo que da una cota inferior del espacio de almacenamiento necesario para los pesos del adaptador y del modelo base combinados.
- GPU recomendadas: no disponible. Por el tamaño del repositorio y la naturaleza de los modelos de difusión de vídeo, se requiere una GPU con memoria suficiente para cargar el modelo base LTX-2 más el adaptador; no se especifican modelos concretos.
- Cabe en GPU de consumo: no disponible.
- Opciones de despliegue: librería diffusers (según el campo library_name del repositorio). No se documentan otras opciones como vLLM, llama.cpp, Ollama o TGI, que no aplican a modelos de difusión de vídeo.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Modelo base | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BFS-Best-Face-Swap-Video | LoRA de face swap en vídeo | Lightricks/LTX-2.3, LTX-2.5 | no disponible | LTX-2 Community License Agreement | Hugging Face (0 descargas) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros adaptadores de intercambio de identidad para LTX-2 ni sobre modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Riesgo ético y legal elevado: la herramienta permite suplantar la identidad facial de personas reales; el autor exige consentimiento legal explícito y todos los derechos necesarios sobre la imagen procesada.
- Uso comercial restringido: la licencia LTX-2 Community License Agreement impone condiciones específicas que deben revisarse antes de cualquier despliegue en producción; el tag license: other indica que no es una licencia estándar permisiva.
- Dependencia del modelo base: el adaptador no funciona de forma autónoma; requiere el modelo LTX-2.3 o LTX-2.5, sujeto a su propia licencia y requisitos de hardware.
- Sin datos de rendimiento: no hay benchmarks publicados ni métricas objetivas de fidelidad de identidad, consistencia temporal o tasas de fallo.
- Sin información sobre sesgos: no se documentan sesgos conocidos en la transferencia de identidad según etnia, género o edad.
- Riesgo de alucinación visual: no documentado, pero inherente a los modelos de difusión de vídeo; pueden aparecer artefactos en rostros, parpadeos o inconsistencias entre fotogramas.
- Advertencia del autor: el modelo se proporciona "as is" y el creador declina toda responsabilidad por el mal uso; las consecuencias legales, éticas o sociales recaen exclusivamente en el usuario final.
- Idiomas y contexto: no aplica como modelo de texto, pero no se documentan limitaciones específicas de resolución, duración de vídeo o formato de entrada.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/KilledTooQuick/BFS-Best-Face-Swap-Video
- Vídeo demostrativo del flujo V3 en YouTube: https://www.youtube.com/watch?v=HBp03iu7wLA
- Modelo base LTX-2.3: https://huggingface.co/Lightricks/LTX-2.3
- Modelo base LTX-2.5: https://huggingface.co/Lightricks/LTX-2.5
- Ejemplos del repositorio (V1): https://huggingface.co/Alissonerdx/BFS-Best-Face-Swap-Video/resolve/main/examples/1.mp4
- Ejemplos del repositorio (V3): https://huggingface.co/Alissonerdx/BFS-Best-Face-Swap-Video/resolve/main/examples/6.mp4
- Ejemplos del repositorio (LTX-2.5): https://huggingface.co/Alissonerdx/BFS-Best-Face-Swap-Video/resolve/main/examples/ltx-25-1.mp4
