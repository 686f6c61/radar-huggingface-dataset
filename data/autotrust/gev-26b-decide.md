# autotrust/GEV-26B-Decide

## Resumen

GEV-26B-Decide es un modelo de decisión tipada construido como adaptador LoRA sobre google/gemma-4-26B-A4B-it, un transformer multimodal con mezcla de expertos de 26 mil millones de parámetros totales y aproximadamente 4 mil millones activos por token. Lo desarrolla autotrust y su propósito no es la generación libre de texto, sino emitir decisiones estructuradas con probabilidades calibradas: elección entre opciones (`choice`), puntuación (`score`) y evaluación (`jev`). Se distribuye con licencia Apache 2.0 y etiqueta de pipeline `text-classification`.

La innovación principal es el modo de pensamiento adaptativo: el modelo alterna entre respuestas de Sistema 1 (una pasada rápida, sin razonamiento explícito) y Sistema 2 (el modelo base sin modificar razona primero y su distribución de respuesta se combina al 50/50 con la del Sistema 1). Esta separación permite usar el modelo como clasificador de baja latencia o como razonador multimodal cuando la tarea lo exige, sin cambiar de checkpoint.

Es relevante ahora porque demuestra que un adaptador pequeño sobre un MoE multimodal puede competir en razonamiento encarnado sin entrenamiento específico de robótica: alcanza un 56,8 % en ERQA con pensamiento activado, por encima de modelos entrenados con datos de robots. El modelo solo declara inglés como idioma soportado y su evaluación pública se limita al Decision Index propio del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con mezcla de expertos (MoE), basado en google/gemma-4-26B-A4B-it; adaptador LoRA |
| Parametros totales | 25.805.936.206 (≈25,8 B) |
| Parametros activos | ≈4 B por token (variante A4B del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el autor no detalla cuantizaciones) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |
| Pipeline | text-classification |
| Tamaño del repositorio | 51,9 GB |
| Modalidad de entrada | texto e imágenes (image-text-to-text) |
| Fecha de creación / actualización | 2026-10-02 / 2026-10-14 |
| Descargas / likes | 224.799 / 354 |

## Arquitectura y entrenamiento

El modelo parte de Gemma-4-26B-A4B-it, un transformer multimodal con mezcla de expertos en el que solo se activan unos 4 mil millones de parámetros por token, lo que reduce el coste de inferencia frente a un denso de tamaño equivalente. Sobre esa base se aplica un adaptador LoRA que transforma la salida del modelo en decisiones tipadas con distribución de probabilidad calibrada, en lugar de texto libre. El Sistema 2 no es un componente entrenado aparte: es el modelo base sin modificar, invocado en modo pensamiento y cuyas probabilidades se combinan al 50/50 con las del Sistema 1.

El entrenamiento de decisión se realizó únicamente con datos de texto: la model card afirma explícitamente que no se usaron datos de robótica ni encarnados. No se detalla en la información disponible el volumen de tokens, la composición del dataset ni si hubo RLHF o DPO. La innovación técnica destacable es el enrutado adaptativo por área: el pensamiento (Sistema 2) se activa para conocimiento y razonamiento, mientras que el resto de áreas se resuelven con Sistema 1 en una sola pasada.

## Capacidades

- Decisión tipada con probabilidades calibradas: modos `choice` (selección entre opciones), `score` (puntuación) y `jev` (índice de decisión), expuestos vía API `POST /v1/decide`.
- Pensamiento adaptativo conmutable (`thinking: "on"` / `"off"`): Sistema 1 rápido o Sistema 2 con razonamiento del modelo base.
- Entrada multimodal de texto e imágenes, con hasta 16 imágenes por consulta en tareas de razonamiento visual.
- Razonamiento espacial, de acción, de trayectoria, de estado, de tarea y multivista, evaluado sobre ERQA.
- Localización visual (pointing) entre opciones marcadas sobre imágenes.
- Clasificación y reordenación (ranking) de resultados con puntuaciones calibradas.
- Servicio compatible con vLLM y con endpoints compatibles (`endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la model card.

## Casos de uso

- Reordenación de noticias por importancia: el modelo recibe titulares de varios feeds y emite una decisión `score` calibrada por cada uno en aproximadamente medio segundo, como demuestra la demo GuruSearch con 6 fuentes.
- Búsqueda con reordenación por relevancia: se envían resultados de Google News, Bing News y Yahoo News al modo `choice`/`score` para reordenarlos frente al orden del buscador y generar una respuesta corta con citas.
- Razonamiento encarnado sin entrenamiento robótico: con pensamiento activado alcanza 56,8 % en ERQA, útil para responder preguntas sobre escenas físicas, estados de objetos y trayectorias de agarre en prototipos de robótica.
- Selección entre alternativas en pipelines de decisión: cualquier sistema que necesite elegir entre N opciones (enrutado, clasificación de intenciones, selección de herramienta) puede usar `choice` y obtener una distribución calibrada en lugar de parsear texto libre.
- Evaluación automática con puntuación calibrada: el modo `score` permite puntuar respuestas o candidatos de forma comparable, útil en sistemas de evaluación y control de calidad.
- Atención al cliente con clasificación de tickets: el modo Sistema 1 clasifica y prioriza consultas con latencia baja, reservando el Sistema 2 para casos de conocimiento o razonamiento complejo.
- Moderación y triaje multimodal: al aceptar imágenes, puede decidir entre categorías sobre capturas o fotos enviadas por usuarios.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente):

| Benchmark | Métrica | Valor |
|---|---|---|
| Decision Index suite 0.2 (edición 0.2.1), con pensamiento adaptativo | Decision Index (balanced skill) | 62,48 |
| ERQA, una pasada (Sistema 1) | Precisión | 43,5 % |
| ERQA, pensamiento activado | Precisión | 56,8 % |

Desglose de ERQA por tipo de pregunta (400 preguntas, azar ≈26 %):

| Tipo de pregunta | Preguntas | Una pasada | Pensamiento |
|---|---:|---:|---:|
| Todas | 400 | 43,5 % | 56,8 % |
| Razonamiento espacial | 84 | 40,5 % | 59,5 % |
| Razonamiento de acción | 72 | 44,4 % | 56,9 % |
| Razonamiento de trayectoria | 66 | 39,4 % | 47,0 % |
| Estimación de estado | 55 | 54,5 % | 60,0 % |
| Razonamiento de tarea | 38 | 44,7 % | 63,2 % |
| Razonamiento multivista | 37 | 32,4 % | 45,9 % |
| Pointing | 34 | 64,7 % | 79,4 % |
| Otros | 14 | 7,1 % | 28,6 % |

El pensamiento añade 13,3 puntos sobre una pasada (prueba pareada, p < 0,0001). Mediana de 2.830 tokens de pensamiento; mediana de 2,6 s por pregunta en una pasada (32 peticiones en paralelo) y 68 s con pensamiento (64 peticiones en paralelo), sobre una B200.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 25,8 B parámetros y pesos en safetensors (repo de 51,9 GB, coherente con bf16), se requiere aproximadamente 52 GB solo para pesos en bf16; en cuantización de 8 bits bajaría a unos 26 GB y en 4 bits a unos 13-14 GB, aunque el autor no publica cuantizaciones.
- GPU recomendadas: el autor reporta ejecuciones en una NVIDIA B200. Por tamaño, encajan A100 80 GB, H100 80 GB y H200.
- GPU de consumo: no cabe en tarjetas de 24 GB en bf16; sería necesario cuantizar a 4 bits para acercarse al rango de una RTX 4090, sin garantía del autor.
- Opciones de despliegue: `serve.sh` propio del autor, vLLM (etiqueta explícita) y transformers. Soporte de llama.cpp u Ollama: no disponible.
- Latencia y throughput: mediana de 2,6 s por pregunta en una pasada con 32 peticiones paralelas y 68 s con pensamiento y 64 peticiones paralelas, medido en una B200.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | ERQA (pensamiento) | Datos de robótica | Licencia |
|---|---|---:|---:|---|---|
| GEV-26B-Decide | 25,8 B (≈4 B activos) | no disponible | 56,8 % | No (solo texto) | Apache 2.0 |
| JEV-27B-VL | 27 B | no disponible | 61,5 % (medio) / 60,0 % (bajo) | No (solo texto) | no disponible |
| Hy-Embodied-VLM-1.0 | 30 B-A3B | no disponible | 56,3 % | Sí | no disponible |
| PhysBrain 1.5 | 8 B | no disponible | 52,8 % | Sí | no disponible |
| vllm-sr/d3 | 27 B | no disponible | 58,8 % (una pasada) | No divulgado | no disponible |

En el ranking ERQA publicado por el autor, GEV-26B-Decide ocupa la séptima posición, por delante de Hy-Embodied-VLM-1.0 y PhysBrain 1.5, ambos con entrenamiento específico de robótica, y por detrás de JEV-27B-VL, del mismo ecosistema.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al derivar de Gemma-4 hereda los sesgos del modelo base, no evaluados aquí.
- Riesgo de alucinación: el modo Sistema 2 utiliza el modelo base sin modificar, por lo que el razonamiento puede contener errores; la decisión final combina ambas distribuciones y no elimina ese riesgo.
- Idioma: solo se declara inglés; el rendimiento en castellano no está evaluado.
- Longitud de contexto: no especificada, lo que impide planificar cargas con documentos largos.
- Licencia: Apache 2.0 en el adaptador, pero enlaza a la licencia de Gemma 4 de Google; conviene revisar los términos del modelo base para uso comercial.
- Evaluación limitada: el Decision Index es una métrica propia del autor y no verificada; ERQA tiene 400 preguntas, con intervalo de confianza del 95 % de aproximadamente ±5 puntos.
- Sin datos de entrenamiento publicados: no se detalla composición del dataset, tokens ni alineación, lo que dificulta auditar el comportamiento.
- Cuantizaciones no publicadas: el despliegue en hardware de consumo requiere cuantizar por cuenta propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/autotrust/GEV-26B-Decide
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Demo en vivo GuruSearch: https://news.guru.so/ui
- Benchmark ERQA: https://github.com/embodiedreasoning/ERQA
- Paper citado (arXiv 2609.14973): https://arxiv.org/abs/2609.14973
