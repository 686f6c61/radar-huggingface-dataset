# bitwisemind/banglaknight-gemma3-4b-qlora

## Resumen

BanglaKnight es un clasificador de riesgo de contenido en bengalí construido mediante QLoRA sobre el modelo base `unsloth/gemma-3-4b-it` (Gemma 3 4B instruction-tuned). Lo desarrolla el usuario bitwisemind y resuelve una tarea concreta: clasificar texto en bengalí en cuatro categorías de seguridad (Safe, Offensive, Harmful, Severe), lo que lo convierte en una pieza de moderación de contenido para un idioma con poca cobertura en herramientas de seguridad estándar.

El modelo no es un modelo generativo de propósito general, sino un adaptador de clasificación afinado sobre un transformer decoder de 4B parámetros. El repositorio publica únicamente pesos en safetensors (0,2 GB, coherente con un adaptador LoRA o un checkpoint parcial) y una configuración de inferencia (`inference_config.json`) que incluye umbrales de decisión ajustados.

Su relevancia radica en dos factores: por un lado, aborda la moderación de contenido en bengalí, un idioma con millones de hablantes y escasa representación en datasets de seguridad; por otro, documenta métricas de evaluación (Defense Score, Average F1, USR) tanto en modo argmax crudo como con umbrales ajustados y con validación cruzada, lo que permite evaluar el impacto real del calibrado de decisiones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Gemma 3 4B) con adaptación QLoRA para clasificación de texto |
| Parametros totales | 4B en el modelo base (no disponible el número exacto de parámetros entrenables del adaptador) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Gemma 3 4B, no confirmada en la información) |
| Tipos de cuantizacion | no disponible (entrenamiento QLoRA; no se especifican formatos de cuantización de inferencia) |
| Idiomas soportados | bengalí (bangla) según los tags; no se detalla cobertura multilingüe |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `unsloth/gemma-3-4b-it`, un Gemma 3 de 4B parámetros en variante instruction-tuned, y se afina con QLoRA (quantized low-rank adaptation) para una cabeza de clasificación de cuatro etiquetas: Safe, Offensive, Harmful y Severe. El entrenamiento se realizó con los cuadernos (notebooks) de BanglaKnight, según indica el autor, aunque el repositorio no detalla el volumen de datos, la composición del dataset ni el número de tokens de entrenamiento.

La innovación operativa no está en la arquitectura, sino en el calibrado de la decisión: la model card reporta métricas con tres estrategias distintas (raw argmax, tuned decision y cross-fitted tuned), lo que indica que se ajustaron umbrales de decisión por clase para mejorar el equilibrio entre detección y falsos positivos. El paquete de inferencia se carga mediante `bk_common.load_model_for_inference(<snapshot dir>, device)` y depende de `inference_config.json`, que contiene presumiblemente los umbrales y la configuración de etiquetas.

## Capacidades

- Clasificación de texto en bengalí en cuatro categorías de riesgo: Safe, Offensive, Harmful y Severe.
- Moderación de contenido orientada a seguridad (safety), con umbrales de decisión ajustables por clase.
- Inferencia con configuración de decisión calibrada, no solo argmax del logit.
- No se documenta soporte de tool calling, function calling ni capacidades de agente.
- No se documenta modo thinking, visión, audio ni otras modalidades.
- No se documenta explícitamente capacidad multilingüe más allá del bengalí.

## Casos de uso

- Moderación de comentarios en plataformas de contenido bengalí: el clasificador etiqueta cada mensaje como Safe, Offensive, Harmful o Severe, permitiendo filtrado automático o envío a revisión humana según el umbral configurado.
- Priorización de colas de revisión humana: usando la salida de cuatro clases y los umbrales ajustados, se pueden enrutar solo los casos Harmful y Severe a moderadores, reduciendo la carga de revisión manual.
- Filtrado previo en foros y comunidades: integrado como paso anterior a la publicación, bloquea contenido Severe y marca Offensive para revisión, con la ventaja de estar entrenado específicamente en bengalí.
- Monitorización de toxicidad en redes sociales o medios: procesamiento por lotes de textos bengalíes para generar métricas agregadas de toxicidad por período o por canal.
- Seguridad en asistentes conversacionales en bengalí: como clasificador de entrada o salida para detectar respuestas o peticiones dañinas antes de que lleguen al usuario.
- Investigación en NLP de seguridad para lenguas de bajos recursos: el modelo y sus métricas (incluida la comparación argmax frente a umbrales ajustados) sirven como línea base reproducible para experimentos de moderación en bengalí.
- Enriquecimiento de datasets de seguridad: etiquetado automático de grandes corpus bengalíes con las cuatro categorías, sujeto a revisión posterior por el riesgo de falsos positivos.

## Benchmarks y rendimiento

Métricas reportadas por el autor en el conjunto de desarrollo (dev):

| Metrica | Raw argmax | Tuned decision | Cross-fitted tuned |
|---|---|---|---|
| Defense Score | 0,7707 | 0,8271 | 0,8189 |
| Average F1 | 0,7948 | 0,8415 | 0,8319 |
| USR | 0,0303 | 0,0170 | 0,0155 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni comparaciones con otros clasificadores de seguridad en bengalí.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el modelo base es un transformer de 4B parámetros, por lo que en fp16 requeriría del orden de 8-10 GB solo para pesos, más memoria para activaciones y el adaptador.
- GPU recomendadas: no especificadas por el autor; por tamaño del modelo base, una GPU con 16 GB o más (RTX 4090, A100, H100) es un punto de partida razonable, aunque no está confirmado.
- Cabe en GPU de consumo: probablemente en RTX 4090 (24 GB) y posiblemente en GPUs de 16 GB con cuantización, pero no hay datos publicados que lo confirmen.
- Opciones de despliegue: el autor indica carga mediante `bk_common.load_model_for_inference(<snapshot dir>, device)` y `inference_config.json`; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BanglaKnight (este modelo) | 4B (base Gemma 3) | no disponible | Clasificación de riesgo en bengalí (4 clases) | no disponible | Hugging Face, 0 descargas, 0 likes |
| Clasificadores de toxicidad multilingües genéricos | no disponible | no disponible | Clasificación de toxicidad | variable | no disponible en la información |
| Gemma 3 4B IT (base) | 4B | no disponible en la información | Generación de texto instruction-tuned | licencia Gemma (no confirmada para este derivado) | ampliamente disponible |

No se dispone de datos de rendimiento de alternativas comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día (24 de noviembre de 2026), lo que indica ausencia de validación por parte de la comunidad.
- No se especifica la licencia, lo que impide confirmar si el uso comercial está permitido; además, el modelo base Gemma 3 tiene sus propias condiciones de licencia que deben verificarse.
- El tamaño del repositorio (0,2 GB) sugiere que contiene un adaptador o pesos parciales, no el modelo completo; es necesario el modelo base `unsloth/gemma-3-4b-it` para la inferencia.
- Las métricas reportadas son solo de desarrollo (dev), sin conjunto de test independiente ni evaluación externa; el Defense Score y el USR no se definen en la información disponible.
- Riesgo de alucinación y de falsos positivos/negativos en moderación: un clasificador de seguridad mal calibrado puede silenciar contenido legítimo o dejar pasar contenido dañino.
- Cobertura limitada al bengalí; no se documenta comportamiento en otros idiomas ni en texto mixto bengalí-inglés, frecuente en redes sociales.
- No se documentan sesgos conocidos, composición del dataset de entrenamiento ni proceso de anotación, lo que dificulta evaluar la calidad de las etiquetas.
- La dependencia de un paquete propio (`bk_common`) y de `inference_config.json` añade fricción de integración y riesgo de incompatibilidad si no se replica el entorno exacto.
- No apto como modelo generativo: es un clasificador, no debe usarse para generar respuestas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bitwisemind/banglaknight-gemma3-4b-qlora
- Modelo base: https://huggingface.co/unsloth/gemma-3-4b-it
- No se han encontrado en la información disponible enlaces a papers, blogs, repositorios de código o demos adicionales.
