# FaustianDeal/Artemis-31B-v1.2-NVFP4-GGUF

## Resumen

Artemis-31B-v1.2-NVFP4-GGUF es una conversión de formato y precisión del fine-tune TheDrummer/Artemis-31B-v1.2, que a su vez deriva de google/gemma-4-31B según la model card. El repositorio no entrena ni ajusta el modelo: toma el checkpoint original, calibra y cuantiza a NVFP4 las capas lineales elegibles mediante el esquema NVFP4 de LLM Compressor, y lo reempaqueta en un único fichero GGUF. El resultado es un modelo de aproximadamente 30.700 millones de parámetros y 18,0 GiB en disco, frente a los formatos de mayor precisión del checkpoint fuente.

El interés práctico de esta ficha está en que permite ejecutar un modelo de ~31B en un único fichero GGUF con un runtime compatible con NVFP4 y Gemma 4, reduciendo el coste de memoria frente a BF16. El autor publica una validación directa sobre ARC-Challenge en la que la versión NVFP4 obtiene 291/299 (97,3 %) frente a 293/299 (98,0 %) de un GGUF BF16 del mismo origen, con solo dos predicciones divergentes. Es un modelo orientado a conversación y uso endpoint-compatible, con 282 descargas y 1 like en el momento de redactar esta ficha.

Se trata de un artefacto de conversión, no de un modelo nuevo: la calidad final depende íntegramente del fine-tune de TheDrummer y del modelo base. No se declara licencia ni idiomas en los metadatos, y la model card advierte explícitamente de que no se afirma ninguna licencia porque el repositorio fuente tampoco la declaraba.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (según la model card, fine-tune de Gemma 4 31B; no se detalla la topología interna) |
| Parámetros totales | 30.697.346.416 (~30,7 B) |
| Parámetros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | NVFP4 (410 tensores NVFP4) sobre capas `Linear` elegibles; 1.242 tensores F32 y 1 tensor BF16 sin cuantizar a NVFP4 |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el repositorio fuente no declaraba licencia; el autor no afirma ninguna) |
| Formato de pesos | GGUF (fichero único `Artemis-31B-v1.2-NVFP4.gguf`) |

Datos adicionales del artefacto:

| Dato | Valor |
|---|---|
| Tamaño del fichero | 19.313.589.984 bytes (18,0 GiB) |
| Tamaño del repositorio | 19,3 GB |
| SHA-256 | `0892d39cfb7295b07a8890da516cade061c6d4a9ca829bab846586fd831a7917` |
| Número de tensores | 1.653 |
| Plantilla de chat | Gemma 4, embebida en el GGUF (coincide con el checkpoint fuente por SHA-256) |
| Modelo base | TheDrummer/Artemis-31B-v1.2 (revisión `05d84790fceecefac4ee2adfb7cf33fdce2029f1`) |
| Pipeline | no disponible |

## Arquitectura y entrenamiento

El repositorio no describe la arquitectura interna más allá de identificar el linaje: es una conversión del fine-tune TheDrummer/Artemis-31B-v1.2, basado en Gemma 4 31B. Por tanto, la arquitectura, el dataset de entrenamiento del fine-tune, el número de tokens y el uso de RLHF/DPO corresponden al modelo original y no se detallan en esta model card. Lo que sí se documenta es el proceso de conversión, que es reproducible y está especificado a nivel de commit.

La cuantización se realizó con el esquema NVFP4 de LLM Compressor, usando 32 muestras de calibración de 2.048 tokens extraídas de `mit-han-lab/pile-val-backup`. Los objetivos fueron las capas `Linear` elegibles; quedaron excluidas del NVFP4 las capas de visión y audio, los embeddings y el `lm_head`, lo que explica la mezcla de 410 tensores NVFP4, 1.242 tensores F32 y un tensor BF16. El reempaquetado a GGUF se hizo con `llama.cpp` en el commit `b9ae43a5d4c27564963717281070991fa9b8c1bf`, repacking del checkpoint NVFP4 calibrado sin una segunda pasada de cuantización de pesos.

## Capacidades

- Generación de texto conversacional: el modelo se distribuye con la plantilla de chat de Gemma 4 embebida y está etiquetado como `conversational`.
- Razonamiento de respuesta directa: la validación publicada sobre ARC-Challenge (formato zero-shot, respuesta de una sola letra) demuestra capacidad de resolver preguntas de razonamiento científico de opción múltiple.
- Compatibilidad con endpoints: el repositorio incluye la etiqueta `endpoints_compatible`, orientada a su exposición mediante APIs de inferencia.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; no se declaran idiomas soportados.
- Visión: la model card indica que para reconocimiento de imágenes debe usarse el vision tower de Gemma 4 31B. Las capas de visión no se cuantizaron a NVFP4 en esta conversión, que se describe como conversión de un modelo de texto.
- Audio: las capas de audio quedaron excluidas de la cuantización NVFP4, pero no se documentan capacidades de audio utilizables en este GGUF.
- Modo de pensamiento explícito (thinking): no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional autoalojado: el GGUF de 18,0 GiB puede cargarse en un único servidor o estación de trabajo con GPU de 24 GB, lo que permite desplegar un asistente de chat privado sin depender de APIs externas.
- Generación de texto creativo y narrativa: al ser un fine-tune de perfil conversacional con plantilla de chat embebida, encaja en herramientas de escritura asistida que explotan respuestas largas y coherentes.
- Razonamiento científico de opción múltiple: la validación sobre ARC-Challenge (97,3 % en zero-shot con respuesta de una sola letra) lo hace adecuado para tareas de QA académico donde se exige una respuesta cerrada y verificable.
- Evaluación comparativa de cuantizaciones: el repositorio está pensado para medir el impacto de NVFP4 frente a BF16 sobre el mismo checkpoint fuente, útil en pipelines internos que deciden qué precisión desplegar.
- Backend de inferencia sobre KoboldCpp: el autor verificó la carga y generación con KoboldCpp 1.121, por lo que sirve como modelo principal en instalaciones locales basadas en ese runtime.
- Prototipado de aplicaciones endpoint-compatible: la etiqueta `endpoints_compatible` permite integrarlo en servicios que siguen una interfaz de API compatible con el ecosistema de endpoints, reduciendo trabajo de adaptación.
- Sustitución de modelos BF16 en hardware limitado: cuando el checkpoint BF16 no cabe en la VRAM disponible pero sí lo hace un fichero de 18,0 GiB, esta conversión ofrece un compromiso medido (2 preguntas de diferencia sobre 299 en ARC-Challenge).

## Benchmarks y rendimiento

El único benchmark publicado en la información disponible es ARC-Challenge (split de validación, 299 preguntas, zero-shot, respuesta de una sola letra, KoboldCpp 1.121):

| Modelo | Formato | ARC-Challenge (299 preguntas) | Precisión | Respuestas válidas |
|---|---|---|---|---|
| Artemis-31B-v1.2 NVFP4 | GGUF NVFP4 | 291/299 | 97,3 % | 299/299 |
| Artemis-31B-v1.2 BF16 | GGUF BF16 del mismo origen | 293/299 | 98,0 % | 299/299 |

Notas del autor: las predicciones de ambas versiones difirieron en dos preguntas y no se detectaron respuestas inválidas. El propio autor advierte de que es una única ejecución de un benchmark de respuesta directa y que la diferencia no debe interpretarse como una valoración general de calidad. El checkpoint en formato compressed-tensors no se evaluó por separado.

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- Tamaño en disco del fichero: 19.313.589.984 bytes (18,0 GiB), en un único GGUF.
- VRAM estimada para inferencia: el propio peso ocupa 18,0 GiB; hay que sumar la caché KV y los buffers del runtime, que dependen de la longitud de contexto y del runtime elegido. No se dispone de cifras medidas de consumo total de VRAM.
- GPU que lo alojan con holgura por capacidad: NVIDIA A100 40 GB, A100 80 GB, H100 80 GB, RTX 5090 32 GB, RTX 4090 24 GB, RTX 3090 24 GB. En las tarjetas de 24 GB el margen para contexto y caché es limitado.
- GPU consumer: cabe en tarjetas de 24 GB (RTX 4090, RTX 3090) y de 32 GB (RTX 5090). No cabe completo en tarjetas de 16 GB (por ejemplo RTX 4080 o 4060 Ti 16 GB) sin recurrir a offload a RAM, no documentado en esta ficha.
- Aceleración FP4: el formato NVFP4 requiere un runtime GGUF compatible con NVFP4 y Gemma 4. El autor confirma funcionamiento con KoboldCpp 1.121; no se documenta el soporte nativo de FP4 por familia de GPU, por lo que la aceleración específica depende del hardware y del runtime.
- Opciones de despliegue verificadas: KoboldCpp 1.121 (prueba local del autor). El fichero se generó con `llama.cpp` en el commit `b9ae43a5d4c27564963717281070991fa9b8c1bf`, por lo que un runtime `llama.cpp` compatible con Gemma 4 y NVFP4 es la vía natural.
- Opciones de despliegue no confirmadas: vLLM, TGI, Ollama y otros servidores no aparecen mencionados en la información disponible para este artefacto NVFP4 en GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la información proporcionada. La única comparación posible es contra el propio linaje del artefacto:

| Modelo | Relación | Parámetros | Formato | Contexto | ARC-Challenge | Licencia |
|---|---|---|---|---|---|---|
| FaustianDeal/Artemis-31B-v1.2-NVFP4-GGUF | Conversión NVFP4 | ~30,7 B | GGUF NVFP4 | no disponible | 291/299 (97,3 %) | no disponible |
| GGUF BF16 del mismo v1.2 | Referencia de precisión | ~30,7 B | GGUF BF16 | no disponible | 293/299 (98,0 %) | no disponible |
| TheDrummer/Artemis-31B-v1.2 | Fine-tune fuente | no disponible | no disponible | no disponible | no disponible | no disponible |
| google/gemma-4-31B | Modelo base | no disponible | no disponible | no disponible | no disponible | no disponible |

No se conocen alternativas de la misma categoría (modelos de ~31B cuantizados a FP4 en GGUF) a partir de la información disponible.

## Limitaciones y advertencias

- Licencia no declarada: la model card indica explícitamente que el repositorio fuente no declaraba licencia cuando se preparó la ficha y que no se afirma ninguna. Esto bloquea cualquier decisión de uso comercial sin aclaración previa con los titulares.
- Idiomas no declarados: no hay información sobre cobertura lingüística; no debe asumirse un buen rendimiento en castellano u otros idiomas sin evaluarlo.
- Longitud de contexto desconocida: no se especifica la ventana de contexto del modelo base ni de esta conversión, lo que impide planificar aplicaciones con contexto largo.
- Benchmark único y acotado: la validación se limita a ARC-Challenge con respuesta de una sola letra, en una única ejecución. El propio autor pide no tratarla como una valoración general de calidad.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad factual, veracidad ni tasas de alucinación en la información disponible.
- Sesgos: no se documenta ningún análisis de sesgos del fine-tune ni del modelo base en esta ficha.
- Pérdida de precisión por cuantización: la diferencia observada frente al BF16 es de dos preguntas sobre 299 en ARC-Challenge; en tareas más sensibles a la precisión numérica el impacto puede ser mayor y no está medido.
- Cobertura de cuantización parcial: embeddings, `lm_head` y las capas de visión y audio no se cuantizaron a NVFP4, por lo que el artefacto mezcla precisión FP4, F32 y BF16, con las implicaciones de memoria que ello conlleva.
- Dependencia de runtime específico: requiere un runtime GGUF compatible con NVFP4 y Gemma 4. Solo KoboldCpp 1.121 está confirmado por el autor; no hay garantía de funcionamiento en otros backends sin verificación previa.
- Multimodalidad no incluida: para reconocimiento de imágenes la model card remite al vision tower de Gemma 4 31B, que no forma parte de este fichero de texto.
- Adopción muy baja: 282 descargas y 1 like, con creación y última actualización el mismo día, sin historial de mantenimiento ni de incidencias.
- Es una conversión, no un modelo entrenado: cualquier defecto del fine-tune de TheDrummer o del modelo base se hereda íntegramente.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/FaustianDeal/Artemis-31B-v1.2-NVFP4-GGUF
- Modelo base (fine-tune): https://huggingface.co/TheDrummer/Artemis-31B-v1.2
- Modelo base original: https://huggingface.co/google/gemma-4-31B
- Dataset de validación ARC: https://huggingface.co/datasets/allenai/ai2_arc
- Dataset de calibración: `mit-han-lab/pile-val-backup` (referenciado en la model card)
- Herramienta de cuantización: LLM Compressor, esquema NVFP4 (referenciado en la model card)
- Herramienta de conversión: `llama.cpp`, commit `b9ae43a5d4c27564963717281070991fa9b8c1bf` (referenciado en la model card)
- Runtime verificado: KoboldCpp 1.121 (referenciado en la model card)
