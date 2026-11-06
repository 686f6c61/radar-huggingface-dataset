# EternalDragon/MeroMero-26B-A4B-Heretic2-GGUF

## Resumen

MeroMero-26B-A4B-Heretic2 es una variante del ajuste fino MeroMero de zerofata sobre el modelo instructivo Gemma 4 26B-A4B de Google, a la que se ha aplicado una ablación de rechazos (refusal ablation) mediante la herramienta Heretic 2.0. El resultado es un modelo conversacional orientado a roleplay y generación de texto sin las restricciones de rechazo típicas del modelo instructivo original. EternalDragon publica aquí la versión cuantizada en GGUF del checkpoint BF16 fusionado, con dos variantes: IQ4_NL (16,42 GB) y BF16 (50,51 GB).

La arquitectura subyacente es la de Gemma 4 26B-A4B, un transformer con mezcla de expertos (MoE): 25.233.142.046 parámetros totales según los safetensors del repositorio fuente, con un subconjunto activo por token (el sufijo A4B indica aproximadamente 4 mil millones de parámetros activos). El modelo conserva la estructura de enrutamiento original y los pesos densos de la capa final en BF16.

La relevancia de esta ficha radica en que documenta un caso de cuantización mixta personalizada (IQ4_NL combinado con Q5_0 y Q8_0) con una evaluación de fidelidad KL publicada, así como un proceso de ablación reproducible con parámetros concretos. No se han publicado benchmarks de calidad, MMLU ni refusal para esta release, por lo que su evaluación debe basarse en los datos de fidelidad de cuantización y en las pruebas de humo realizadas por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), base Gemma 4 26B-A4B |
| Parametros totales | 25.233.142.046 |
| Parametros activos | no disponible (el sufijo A4B sugiere ~4B activos, sin cifra exacta publicada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ4_NL (mixta: IQ4_NL, Q5_0, Q8_0, BF16 en capa final) y BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (IQ4_NL y BF16); safetensors BF16 en el repositorio fuente |
| Tamano del repo | 66,9 GB |
| Tamano de archivos | IQ4_NL: 16,42 GB; BF16 GGUF: 50,51 GB; safetensors: 51,61 GB (11 shards) |
| Modelo base | EternalDragon/G4-MeroMero-26B-A4B-Heretic2 (derivado de zerofata/G4-MeroMero-26B-A4B y google/gemma-4-26B-A4B-it) |
| Herramienta de ablacion | Heretic 2.0.0, Arbitrary-Rank Ablation, rank 50, seed 42 |
| Runtime verificado | PolyStrata v0.1.45; export original con llama.cpp commit 1b6935b227b9f9aa89deea8016c0e208f547446f |

## Arquitectura y entrenamiento

El modelo parte de Gemma 4 26B-A4B instruct, un transformer MoE de Google con 25.233.142.046 parámetros totales. Sobre esa base, zerofata realizó un ajuste fino conversacional y de roleplay (MeroMero) cuyo estilo se conserva en esta release. EternalDragon aplicó después Heretic 2.0.0 con ablación de rango arbitrario (rank 50, seed 42), actuando sobre las proyecciones de salida de atención y las proyecciones down del MLP compartido. Los parámetros de la ablación seleccionada son: capas 15 a 26, peso de preservación de buen comportamiento 0,3274, peso de dirección de mal comportamiento 0,0005, peso de corrección relativa 0,6647 y 15 vecinos.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el pipeline original de Gemma 4 o en el ajuste MeroMero. La innovación técnica documentada de esta release es la cuantización mixta IQ4_NL: las proyecciones gate/up de los expertos usan IQ4_NL, las down de los expertos usan Q5_0 en las capas 0-28 e IQ4_NL en la capa 29, las proyecciones densas no finales y el embedding/output head atado usan Q8_0, y se retienen los pesos densos BF16 de la capa final y la estructura de enrutamiento original. El autor reporta una KL media de 0,454918 frente al BF16 sin censura sobre cuatro casos de desarrollo congelados (1.024 tokens de entrada, posiciones 512-1022, vocabulario completo de 262.144 entradas, scorer F64), cumpliendo el objetivo KL < 0,5. El modelo BF16 fusionado obtuvo 9/100 en el conjunto de optimización de rechazos de Heretic, con KL de primer token de 0,014121.

## Capacidades

- Generación de texto conversacional multi-turno, con estilo de roleplay heredado del ajuste MeroMero.
- Razonamiento y respuesta instructiva general, al estar basado en Gemma 4 26B-A4B instruct.
- Comportamiento sin rechazos (uncensored) gracias a la ablación Heretic 2.0.
- Plantilla de chat incluida en los archivos GGUF; el repositorio fuente incluye `chat_template.jinja` y los perfiles `Gemma4-Think.json` y `Gemma4-NoThink.json`.
- Soporte de modo thinking y no-thinking mediante los perfiles citados (no se detalla su funcionamiento interno).
- Capacidades de visión: los pesos de visión originales están presentes en el checkpoint safetensors del repositorio fuente, pero los GGUF exportados son modelos solo de texto y no incluyen proyector de visión.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Roleplay y narrativa interactiva: el ajuste MeroMero y la ablación Heretic están orientados a conversaciones de personaje sin rechazos, lo que permite mantener diálogos multi-turno con estilos y personalidades definidas sin interrupciones del modelo por contenido sensible.
- Generación creativa sin restricciones: escritura de ficción, guiones o contenido narrativo donde el modelo instructivo original rechazaría ciertos temas; la variante IQ4_NL de 16,42 GB permite ejecutarlo en hardware de consumo.
- Prototipado de asistentes conversacionales: el GGUF incluye plantilla de chat y se ha verificado con PolyStrata v0.1.45, lo que facilita integrarlo en un runtime GGUF estándar para pruebas de conversación.
- Investigación sobre ablación de rechazos: los parámetros de Heretic 2.0 (rank, capas, pesos) y los resultados de KL permiten reproducir o comparar el efecto de la ablación sobre el comportamiento del modelo.
- Evaluación de cuantización mixta: la receta IQ4_NL/Q5_0/Q8_0 con KL publicada sirve como caso de estudio para medir la pérdida de fidelidad de una cuantización agresiva en un MoE de 25B.
- Despliegue en entornos con VRAM limitada: la variante IQ4_NL de 16,42 GB es la opción recomendada por el autor para equipos que no pueden alojar el BF16 de 50,51 GB, aceptando el compromiso de fidelidad documentado.
- Fine-tuning posterior o experimentación con Transformers: el checkpoint safetensors BF16 del repositorio fuente es cargable con herramientas compatibles con Transformers, incluyendo los pesos de visión.

## Benchmarks y rendimiento

| Metrica | Valor | Protocolo |
|---|---|---|
| KL de cuantizacion (IQ4_NL vs BF16 sin censura) | 0,454918 (media) | 4 casos de desarrollo congelados, 1.024 tokens de entrada, posiciones 512-1022 (2.044 posiciones), vocabulario completo de 262.144 entradas, scorer F64 sin clipping |
| KL de primer token (BF16 fusionado) | 0,014121 | Protocolo de optimizacion de Heretic |
| Refusal en conjunto de optimizacion de Heretic | 9/100 | Conjunto de optimizacion, no independiente |
| MMLU, HumanEval, GSM8K u otros | no disponible | El autor no reclama benchmarks de calidad, velocidad ni refusal para esta release |

No se han publicado resultados de benchmarks de calidad en la información disponible. Los datos anteriores son de fidelidad de cuantización y de optimización de la ablación, no benchmarks independientes de capacidad.

## Requisitos de hardware

- VRAM estimada para inferencia: IQ4_NL requiere al menos ~16,5 GB solo para los pesos, más caché KV y buffers de runtime; BF16 requiere ~50,5 GB solo para los pesos.
- GPU recomendadas: no disponibles de forma explícita en la información proporcionada; el autor remite al panel de compatibilidad de hardware de la página de Hugging Face para seleccionar el formato según el equipo.
- GPU de consumo: la variante IQ4_NL de 16,42 GB puede caber en GPUs de consumo con 24 GB de VRAM (por ejemplo, RTX 3090 o RTX 4090), dejando margen limitado para contexto y buffers; el BF16 no cabe en GPUs de consumo.
- Opciones de despliegue: runtime GGUF compatible con Gemma 4; el autor verificó carga y generación de chat con PolyStrata v0.1.45. El checkpoint safetensors se puede cargar con herramientas compatibles con Transformers. No se mencionan vLLM, llama.cpp, Ollama ni TGI como opciones verificadas para esta release.
- Latencia y throughput: no disponibles. El autor advierte que el tamaño del archivo no determina por sí solo la velocidad ni una longitud de contexto utilizable, y que un modelo mayor que la VRAM puede requerir offloading a CPU/RAM.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| MeroMero-26B-A4B-Heretic2 (este) | 25.233.142.046 totales | no disponible | GGUF IQ4_NL, GGUF BF16, safetensors | Apache-2.0 | Ablacion Heretic 2.0 rank 50; KL de cuantizacion 0,454918 |
| G4-MeroMero-26B-A4B-Heretic2 (repositorio fuente) | 25.233.142.046 totales | no disponible | safetensors BF16 | Apache-2.0 | Checkpoint fusionado con pesos de visión; mismo modelo sin cuantizar |
| mradermacher/G4-MeroMero-26B-A4B-it-uncensored-heretic-i1-GGUF | no disponible | no disponible | GGUF | no disponible | Cuantizacion i1 de un derivado heretic del mismo linaje MeroMero |
| google/gemma-4-26B-A4B-it | no disponible | no disponible | no disponible | no disponible | Modelo instructivo base de Google, con rechazos intactos |

## Limitaciones y advertencias

- La ablación de rechazos elimina barreras de seguridad del modelo instructivo original; el modelo puede generar contenido sensible, ofensivo o dañino sin filtros. No es adecuado para aplicaciones de cara al público sin moderación externa.
- Riesgo de alucinación no cuantificado: no se han publicado benchmarks de calidad ni evaluaciones independientes para esta release.
- Los datos de KL y de refusal provienen de conjuntos de desarrollo y optimización consultados durante el trabajo, no de evaluaciones independientes; el propio autor lo advierte.
- Los GGUF son modelos solo de texto: no incluyen proyector de visión ni cabeza MTP, por lo que las capacidades multimodales del checkpoint safetensors no están disponibles en estas variantes.
- Idiomas soportados no documentados; no se puede garantizar un rendimiento multilingüe concreto.
- Longitud de contexto no disponible; el autor advierte que el tamaño del archivo no establece una longitud de contexto utilizable.
- Licencia Apache-2.0 según los metadatos del repositorio, pero se debe consultar `LICENSE` y `NOTICE` para la atribución completa y verificar las condiciones del modelo base Gemma 4 de Google antes de uso comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la ficha; no hay evidencia de uso en producción ni validación por terceros.
- La cuantización IQ4_NL es una receta mixta personalizada, no una cuantización uniforme de 4 bits; la fidelidad medida (KL 0,454918) es un objetivo de proyecto, no una garantía de calidad en todas las tareas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/EternalDragon/MeroMero-26B-A4B-Heretic2-GGUF
- Repositorio fuente con safetensors BF16: https://huggingface.co/EternalDragon/G4-MeroMero-26B-A4B-Heretic2
- Modelo MeroMero original de zerofata: https://huggingface.co/zerofata/G4-MeroMero-26B-A4B
- Modelo base de Google: https://huggingface.co/google/gemma-4-26B-A4B-it
- Cuantización i1 alternativa de mradermacher: https://huggingface.co/mradermacher/G4-MeroMero-26B-A4B-it-uncensored-heretic-i1-GGUF
