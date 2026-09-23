# francesca9805/hin-deva-100mb-ppt-Dp-100mb-packed-bfd_seed455

## Resumen

`francesca9805/hin-deva-100mb-ppt-Dp-100mb-packed-bfd_seed455` es un ajuste fino (fine-tune) del modelo monolingüe `goldfish-models/hin_deva_100mb`, publicado por el usuario francesca9805. Se trata de un transformer decoder-only de la familia GPT-2 con 124.770.816 parámetros, distribuido en formato safetensors y entrenado mediante SFT (supervised fine-tuning) con la librería TRL 0.23.0 sobre Transformers 4.56.2 y PyTorch 2.5.1. El run de entrenamiento registrado en Weights & Biases pertenece a una cuenta de la Universidad de Groningen, lo que sitúa el trabajo en un contexto de investigación académica más que de producto.

El modelo parte de un base preentrenado sobre aproximadamente 100 MB de texto en hindi escrito en devanagari (convención de nombres del proyecto Goldfish: `hin_deva_100mb`). El sufijo del nombre (`ppt-Dp-100mb-packed-bfd_seed455`) sugiere un ajuste sobre un dataset empaquetado (packed) con una semilla concreta, pero la model card no documenta la composición, el tamaño ni la procedencia de esos datos de instrucciones, ni el número de tokens vistos durante el SFT.

Su relevancia es acotada: con cero descargas y cero likes en el momento de la consulta, sin licencia declarada, sin idiomas especificados y sin benchmarks publicados, se trata de un artefacto de investigación reproducible más que de un modelo listo para producción. Resulta útil como caso de estudio sobre ajuste por instrucciones en lenguas de bajos recursos y sobre los riesgos de sobreajuste o degeneración al aplicar SFT a un base de solo 124 M de parámetros.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia GPT-2 |
| Parámetros totales | 124.770.816 |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (solo se publican pesos safetensors; no hay GGUF, GPTQ ni AWQ) |
| Idiomas soportados | no disponible; el modelo base es monolingüe de hindi en escritura devanagari |
| Licencia | no disponible (la model card contiene un marcador `licence: license` sin texto legal) |
| Formato de pesos | safetensors (librería transformers), repositorio de 0,3 GB |
| Modelo base | goldfish-models/hin_deva_100mb |
| Tarea declarada | text-generation |
| Método de ajuste | SFT con TRL 0.23.0 |
| Versiones de framework | TRL 0.23.0, Transformers 4.56.2, PyTorch 2.5.1+cu121, Datasets 4.8.4, Tokenizers 0.22.1 |
| Fecha de creación / actualización | 22/09/2026 – 22/09/2026 |

## Arquitectura y entrenamiento

La arquitectura corresponde a un GPT-2 estándar (decoder-only con atención causal completa y embeddings ligados entre entrada y salida, según la convención de esa familia), con un total de 124.770.816 parámetros. El modelo se obtuvo por ajuste supervisado (SFT) del checkpoint `goldfish-models/hin_deva_100mb`, un modelo monolingüe de hindi entrenado por el proyecto Goldfish sobre un corpus de aproximadamente 100 MB en escritura devanagari. No se documenta ninguna innovación arquitectónica: no hay mezcla de expertos, atención lineal, decodificación especulativa ni modificación estructural respecto al base.

En cuanto al entrenamiento, la única información disponible es el pipeline empleado: TRL 0.23.0 con Transformers 4.56.2, PyTorch 2.5.1+cu121, Datasets 4.8.4 y Tokenizers 0.22.1, con registro en un run de Weights & Biases. No se especifican el número de tokens de entrenamiento, la composición del dataset (`100mb-packed` en el nombre del modelo), la existencia de empaquetado de secuencias, la tasa de aprendizaje, el número de épocas ni si se aplicaron técnicas posteriores como DPO o RLHF. Tampoco se indica si el dataset de instrucciones fue generado sintéticamente o extraído de fuentes humanas, un dato crítico para evaluar la calidad del ajuste.

## Capacidades

- Generación de texto autoregresiva en hindi (devanagari), heredada del modelo base monolingüe.
- Ajuste por instrucciones (SFT): el ejemplo de la model card usa el pipeline `text-generation` con mensajes en formato `[{"role": "user", "content": ...}]`, lo que indica que el modelo fue entrenado con plantilla conversacional.
- Respuestas de un solo turno con `max_new_tokens` configurable (128 en el ejemplo oficial).
- Capacidad multilingüe: no documentada; el base es monolingüe, por lo que el comportamiento en inglés u otros idiomas es impredecible.
- Tool calling / function calling: no documentado, no disponible.
- Uso como agente o razonamiento multi-paso: no documentado, no disponible.
- Modo de razonamiento explícito (thinking mode): no disponible.
- Capacidades de visión, audio o multimodalidad: no disponibles (modelo exclusivamente de texto).
- Compatibilidad declarada con text-generation-inference y endpoints (etiquetas `text-generation-inference` y `endpoints_compatible`).

## Casos de uso

- Experimentación académica en PLN de bajos recursos: sirve como punto de partida reproducible (semilla 455) para estudiar cómo el SFT afecta a un modelo monolingüe de 124 M de parámetros, comparando el checkpoint ajustado contra el base.
- Estudio de olvido catastrófico y sobreajuste: al ser un modelo muy pequeño ajustado sobre un dataset empaquetado, es adecuado para medir pérdida de perplejidad en el idioma base tras el ajuste por instrucciones.
- Generación de texto en hindi para prototipos internos: se puede desplegar en local para producir borradores o completar frases en devanagari, siempre con revisión humana y sin uso en producción crítica.
- Evaluación de tokenizadores y de empaquetado de secuencias: el sufijo `100mb-packed` del nombre permite usarlo como referencia en experimentos sobre estrategias de packing y su efecto en modelos pequeños.
- Material docente: por su tamaño (0,3 GB en disco) y su coste de inferencia mínimo, es apropiado para prácticas de ajuste fino, evaluación y despliegue con la librería transformers en un portátil o en CPU.
- Aumento de datos sintéticos en hindi: puede generar texto de relleno para pipelines de clasificación o etiquetado en devanagari, con filtrado posterior por calidad dada la tendencia a la repetición de modelos de este tamaño.
- Pruebas de integración de infraestructura: útil para validar despliegues con TGI o endpoints compatibles usando un checkpoint ligero antes de pasar a modelos mayores del mismo ecosistema.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de evaluación (perplejidad, MMLU, HumanEval, GSM8K ni ninguna otra) y la búsqueda web realizada no devolvió ningún resultado relacionado con este modelo.

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 0,5 GB en fp32, 0,25 GB en fp16/bf16, 0,125 GB en int8 y 0,07 GB en 4 bits. Hay que sumar la caché KV y las activaciones, que para una ventana de contexto típica de esta familia añaden del orden de decenas o centenares de MB según la longitud de secuencia.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM es suficiente (GTX 1650, RTX 3050, RTX 4060, T4, L4). GPU de gama alta como A100, H100 o RTX 4090 están sobredimensionadas para este modelo y solo tendrían sentido para entrenamiento o evaluación por lotes masivos.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo moderna, e incluso en CPU con memoria RAM suficiente (menos de 1 GB de pesos).
- Opciones de despliegue: `transformers` con `pipeline("text-generation")` (procedimiento documentado por el autor), TGI (etiqueta declarada), endpoints compatibles, y vLLM o llama.cpp/Ollama previa conversión. Para llama.cpp y Ollama sería necesario generar un GGUF, ya que no se publica ninguno en el repositorio.
- Latencia y throughput: no disponibles. No hay cifras publicadas de tokens por segundo ni de latencia por petición.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Benchmarks publicados |
|---|---|---|---|---|---|
| francesca9805/hin-deva-100mb-ppt-Dp-100mb-packed-bfd_seed455 | 124.770.816 | no disponible | hindi (devanagari) presumiblemente, no confirmado | no disponible | no |
| goldfish-models/hin_deva_100mb (base) | del mismo orden (familia Goldfish de 100 MB de corpus) | no disponible | hindi (devanagari) | no disponible en la información consultada | no disponible en la información consultada |
| GPT-2 small | 124 M (117 M en la publicación original) | 1024 tokens | inglés | MIT (publicación original de OpenAI) | sí, en la publicación original |
| Modelos ajustados por instrucciones comparables en hindi | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación cuantitativa de calidad no es posible con los datos disponibles: ni el modelo evaluado ni su base tienen resultados publicados, y no se ha identificado en la búsqueda ningún otro ajuste fino publicado sobre `goldfish-models/hin_deva_100mb` con el que contrastar.

## Limitaciones y advertencias

- Licencia no declarada: la model card contiene un marcador de posición (`licence: license`). Sin un texto legal explícito, no hay autorización clara para uso comercial ni para redistribución; conviene tratar el modelo como no apto para producción hasta que el autor aclare los términos.
- Ausencia total de evaluación: no hay métricas de perplejidad, exactitud ni evaluaciones humanas, por lo que no se puede afirmar que el SFT haya mejorado al modelo base en ninguna tarea.
- Riesgo elevado de alucinación y de degeneración: con 124 M de parámetros, es esperable la repetición de n-gramas, la pérdida de coherencia en generaciones largas y la invención de contenido, especialmente en tareas de conocimiento factual.
- Cobertura lingüística limitada: al derivar de un base monolingüe de hindi en devanagari, el rendimiento en inglés, en otras lenguas indias o incluso en hindi romanizado (transliterado) es muy probablemente deficiente, aunque no está documentado.
- Longitud de contexto desconocida: no se especifica la ventana máxima soportada, lo que dificulta dimensionar la caché KV y planificar despliegues con conversaciones largas.
- Procedencia de los datos de instrucciones desconocida: no se detalla si el dataset empaquetado es humano, sintético o una mezcla, ni si contiene contenido sesgado, tóxico o con derechos de autor.
- Sesgos no analizados: no existe ninguna auditoría de sesgo demográfico, político o religioso para este checkpoint, ni para el corpus de 100 MB del modelo base.
- Cero adopción verificable: el repositorio registra 0 descargas y 0 likes, por lo que no hay evidencia externa de funcionamiento correcto más allá del ejemplo de la model card.
- Fechas del repositorio en el futuro respecto a la fecha habitual de consulta (2026), un dato a tener en cuenta al citarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/francesca9805/hin-deva-100mb-ppt-Dp-100mb-packed-bfd_seed455
- Modelo base: https://huggingface.co/goldfish-models/hin_deva_100mb
- Run de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/8sa6agjv
- Repositorio de TRL: https://github.com/huggingface/trl
- Búsqueda web realizada: no se encontraron resultados relevantes sobre el modelo; los enlaces devueltos correspondían a dominios sin relación (documentos del Civil Society Forum on Drugs), por lo que se omiten. No se han localizado papers, blogs ni demos asociados a este checkpoint.
