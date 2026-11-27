# decido-ai/decido-1-think-26b-a4b

## Resumen

Decido-1-Think (26B-A4B) es un ajuste fino (finetune) del modelo multimodal google/gemma-4-26B-A4B-it, desarrollado por decido-ai. No es un modelo generativo de propósito general, sino un modelo de decisión especializado: recibe un documento (texto o JSON) y un conjunto de preguntas, y devuelve una distribución de probabilidad calibrada sobre las posibles respuestas (sí/no, elección entre opciones o escala ordenada). Su rasgo diferencial es el modo "think": razona paso a paso antes de emitir la respuesta, con un presupuesto de hasta 1.024 tokens de razonamiento en decodificación greedy.

El modelo resuelve el problema de la clasificación fiable y calibrada en pipelines de producción, donde no basta con una etiqueta sino que se necesita una probabilidad utilizable para umbrales y enrutamiento. Frente a Decido-1 (85,90 en la media de seis grupos de benchmark) y a Jev 1.13 (83,85), Decido-1-Think alcanza 88,71, a costa de mayor latencia: aproximadamente 19 s por pregunta en CPU de un M4 Pro y 10 s por pregunta en GPU de Mac para un documento de 1.000 tokens con 5 preguntas.

El modelo tiene 25.805.936.206 parámetros totales según safetensors, se distribuye con licencia Apache-2.0, soporta únicamente inglés y se ofrece en formatos safetensors y GGUF para su uso con transformers y llama.cpp. El repositorio ocupa 80,5 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal derivado de Gemma-4-26B-A4B (image-text-to-text); arquitectura MoE según el sufijo A4B del modelo base |
| Parametros totales | 25.805.936.206 |
| Parametros activos | no disponible (el sufijo A4B del modelo base sugiere ~4B activos, sin confirmación en la información proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (disponible en el repositorio); niveles concretos no disponibles |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-26B-A4B-it, un transformer multimodal de tipo image-text-to-text. El sufijo A4B del nombre del modelo base indica una arquitectura de mezcla de expertos (MoE) con aproximadamente 4.000 millones de parámetros activos por token, aunque la información proporcionada no detalla la configuración de expertos ni el contexto máximo. Sobre esta base, decido-ai ha realizado un finetune orientado a la tarea de decisión: el modelo genera primero una cadena de razonamiento (hasta 1.024 tokens, decodificación greedy) y después emite una distribución de etiquetas calibrada.

No se dispone de datos sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. La model card sí documenta el comportamiento en inferencia: el documento de entrada se trata como datos no confiables (las instrucciones contenidas en él no se siguen y las cadenas de tokens de control se neutralizan), lo que constituye una medida de seguridad relevante para despliegues que procesan texto de terceros. El modelo declara `inference: false` en la model card, es decir, el autor no garantiza la inferencia mediante el pipeline estándar de transformers y dirige el uso a su propia librería `decido-ai`, su CLI o su servidor HTTP compatible con la API de Jev.

## Capacidades

- Clasificación con salida calibrada: devuelve distribuciones de probabilidad sobre etiquetas, no solo texto libre.
- Preguntas de tipo sí/no (`"text"`), elección única entre opciones (`{"q": ..., "options": [...]}` o con descripciones por clave) y escalas ordenadas (`{"q": ..., "scale": [...]}`).
- Formato de cable completo de Jev 1.13 mediante `m.predict({"state": ..., "questions": ...})`: tipos `noul`, `choice` (1–255 opciones) y `score` (2–10 niveles), con salida `probabilities`, `confidence` y `legend`.
- Razonamiento paso a paso previo a la respuesta (modo think, hasta 1.024 tokens).
- Entrada multimodal de texto e imagen (pipeline image-text-to-text del modelo base).
- Procesamiento de documentos en texto plano o JSON.
- Robustez frente a inyección de instrucciones en el documento de entrada.
- API compatible con Jev: los clientes existentes funcionan sin cambios apuntando a `decido serve`.
- Interfaz de línea de comandos (`decido run`) y servidor HTTP (`POST /v1/systemone`).
- No se documenta soporte de tool calling, function calling ni comportamiento de agente multi-paso.

## Casos de uso

- Triaje de tickets de soporte: el modelo recibe el texto del ticket y responde a preguntas como si se solicita reembolso, qué equipo debe gestionarlo y con qué urgencia, devolviendo probabilidades que permiten enrutar automáticamente con umbrales de confianza.
- Moderación de contenido con calibración: clasificar publicaciones según categorías de riesgo con una escala ordenada, usando la distribución de salida para decidir entre acción automática, revisión humana o paso directo.
- Extracción de señales estructuradas de documentos JSON: procesar payloads de APIs o formularios y responder preguntas de elección sobre sus campos, tratando el JSON como datos no confiables.
- Enrutamiento en pipelines de atención al cliente: sustituir reglas heurísticas por un clasificador calibrado que asigna conversaciones a colas, con la confianza como criterio de escalado.
- Análisis de encuestas y respuestas abiertas: mapear texto libre a escalas ordenadas (satisfacción, intención de compra) con probabilidades por nivel que permiten agregación estadística posterior.
- Migración desde Jev 1.13: organizaciones con clientes ya integrados contra la API de Jev pueden desplegar `decido serve` en local y apuntar el SDK mediante `TYPESAFE_BASE_URL`, manteniendo el mismo formato de petición y respuesta.
- Evaluación de documentos con imagen: al heredar la entrada image-text-to-text de Gemma-4, puede clasificar contenido que combine texto e imágenes, aunque la model card no detalla el rendimiento en esta modalidad.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre seis grupos de benchmark (JevBench, Kev, OpenJev con 18 tareas, Nimble, VitaminC y MASSIVE-en; copias congeladas y el mismo harness para todos los modelos). Puntuación = métrica de tipo accuracy por grupo, después la media.

| Grupo de benchmark | Decido-1-Think (GPU) | Decido-1 (GPU) | Jev 1.13 (publicado) |
|---|---:|---:|---:|
| JevBench | 94,33 | 88,17 | 87,18 |
| Kev | 85,63 | 84,46 | 85,52 |
| OpenJev (18 tareas) | 83,63 | 78,39 | 72,96 |
| Nimble | 92,55 | 88,65 | 91,84 |
| VitaminC | 86,98 | 87,15 | 78,46 |
| MASSIVE | 89,14 | 88,57 | 87,14 |
| Media de seis grupos | 88,71 (IC 95%: 87,69–89,73) | 85,90 | 83,85 |

Calibración (GPU; marca de verificación = igual o mejor que Jev):

| Comprobación | Brier | Jev 1.13 | ECE | Jev 1.13 |
|---|---:|---:|---:|---:|
| JevBench | 0,098 (mejor) | 0,181 | 0,031 (mejor) | 0,032 |
| Kev v4 dev | 0,207 (mejor) | 0,211 | 0,052 | 0,049 |
| Kev v9 dev | 0,223 | 0,212 | 0,042 | 0,034 |
| VitaminC | 0,205 (mejor) | 0,313 | 0,037 (mejor) | no disponible en el extracto |

Latencia declarada (M4 Pro, documento de 1.000 tokens, 5 preguntas): aproximadamente 19 s por pregunta en CPU y 10 s por pregunta en GPU de Mac. En el mismo hardware, Decido-1 tarda 4,1 s (CPU) y 1,1 s (Mac GPU); Decido-1-Max, unos 28 s y 11 s respectivamente.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 25,8 mil millones de parámetros totales, en precisión de 16 bits los pesos ocupan unos 51,6 GB; en cuantización GGUF de 8 bits, unos 26 GB; en 4 bits, unos 13 GB. Estas cifras son estimaciones por tamaño de parámetros, no datos publicados por el autor.
- El autor indica que el modelo funciona en GPU y en portátil, aunque lento en este último (~19 s por pregunta en CPU de un M4 Pro).
- GPU recomendadas: no especificadas en la información disponible. Por tamaño, cabría esperar A100 80 GB o H100 en precisión completa; para cuantizaciones de 4–8 bits, GPU de consumo con 16–24 GB de VRAM como la RTX 4090 podrían ser viables, sin confirmación del autor.
- Despliegue: librería `decido-ai` (pip, binarios precompilados para macOS Apple Silicon, Linux y Windows), CLI `decido run`, servidor HTTP `decido serve` con API compatible con Jev, y soporte GGUF/llama.cpp.
- Latencia: ~19 s por pregunta en CPU de M4 Pro y ~10 s por pregunta en GPU de Mac para un documento de 1.000 tokens con 5 preguntas. Throughput no disponible.

## Comparativa con modelos similares

| Modelo | Base | Parámetros | Media seis grupos | Latencia (M4 Pro, 1k tokens, 5 preguntas) | Licencia |
|---|---|---|---:|---|---|
| Decido-1-Think (este) | Gemma-4-26B-A4B | 25,8B | 88,71 (GPU) | ~19 s CPU · ~10 s GPU Mac | Apache-2.0 |
| Decido-1-Max | Gemma-4-26B-A4B | 25,8B (misma arquitectura) | 89,23 (GPU) | ~28 s · ~11 s | Apache-2.0 (según familia) |
| Decido-1 | Gemma-4-26B-A4B | 25,8B | 85,90 (GPU) | 4,1 s · 1,1 s | Apache-2.0 |
| Decido-1-XL | DeepSeek-V4-Flash | no disponible | 87,25 (GPU) | GPU only (~0,45 A100-s por pregunta) | no disponible |
| Jev 1.13 | no disponible | no disponible | 83,85 (publicado) | no disponible | no disponible |

## Limitaciones y advertencias

- Solo soporta inglés; no se documenta cobertura multilingüe.
- La model card declara `inference: false`: el pipeline estándar de transformers no está garantizado y el uso previsto pasa por la librería, CLI o servidor del autor.
- Latencia alta para un clasificador: ~10 s por pregunta en GPU de Mac y ~19 s en CPU, lo que limita su uso en rutas interactivas o de alto volumen.
- Modo think con hasta 1.024 tokens de razonamiento en greedy: coste computacional adicional frente a Decido-1 sin garantía de mejora en todos los grupos (VitaminC baja de 87,15 en Decido-1 a 86,98).
- Calibración no uniformemente mejor que Jev: peor Brier en Kev v9 dev (0,223 frente a 0,212) y peor ECE en Kev v4 (0,052 frente a 0,049) y Kev v9 (0,042 frente a 0,034).
- Riesgo de alucinación en el razonamiento intermedio: el modelo genera texto libre antes de la etiqueta; no se documentan mecanismos de verificación de esa cadena.
- No se documentan sesgos conocidos ni evaluación de seguridad más allá del tratamiento del documento como datos no confiables.
- Licencia Apache-2.0 permite uso comercial, pero el modelo base Gemma-4 puede tener términos adicionales de Google que conviene revisar antes de producción.
- No se documentan capacidades de tool calling, agentes ni multi-paso; no debe asumirse que las herede del modelo base.
- Longitud de contexto no publicada: no es posible garantizar el comportamiento con documentos muy largos.
- Con 533 descargas y 2 likes en el momento de la consulta, el ecosistema de usuarios y validación externa es muy reducido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/decido-ai/decido-1-think-26b-a4b
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Decido-1 (misma familia): https://huggingface.co/decido-ai/decido-1-26b-a4b
- Decido-1-Max: https://huggingface.co/decido-ai/decido-1-max-26b-a4b
- Decido-1-Fast: https://huggingface.co/decido-ai/decido-1-fast-1.7b
- Decido-1-Ultra: https://huggingface.co/decido-ai/decido-1-ultra-0.6b
- Decido-1-XL: https://huggingface.co/decido-ai/decido-1-xl
- Decido-Web v2: https://huggingface.co/decido-ai/decido-web-v2
- Decido-Web v2-Fast: https://huggingface.co/decido-ai/decido-web-v2-fast
- Colección Decido 1: https://huggingface.co/collections/decido-ai/decido-1-6aed66fd09af05c057795ca8
- Documentación y playground: https://getdecido.ai
- Paquete Python: https://pypi.org/project/decido-ai/
