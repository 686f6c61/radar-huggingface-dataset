# jermalk/Bielik-11B-v3.1-Instruct-int4-ov

## Resumen

Bielik-11B-v3.1-Instruct-int4-ov es una conversión comunitaria no oficial del modelo Bielik-11B-v3.1-Instruct de SpeakLeash a formato OpenVINO IR con compresión de pesos INT4 (AWQ, grupo 64) mediante NNCF. El modelo base es un transformer denso de 11 mil millones de parámetros entrenado principalmente para polaco e inglés, desarrollado por SpeakLeash en colaboración con ACK Cyfronet AGH. Esta variante no introduce fine-tuning: solo transforma los pesos originales a un formato optimizado para inferencia en hardware Intel (CPU y GPU Arc).

El interés de esta conversión reside en que reduce el peso en disco a 5,64 GB (frente a los aproximadamente 22 GB en bf16), lo que permite desplegar un modelo de 11B en GPUs de consumo con 12-16 GB de VRAM o en iGPU Intel con memoria compartida. El autor documenta de forma rigurosa la receta de cuantización, las pérdidas de calidad medidas (perplejidad +4,2 %, caída de 1,95 puntos en MMLU-pl) y el rendimiento en decodificación (67,4 tokens/s en una Intel Arc Pro B70 de 32 GB).

Es relevante ahora porque OpenVINO GenAI permite ejecutar LLMs en hardware Intel sin necesidad de CUDA, y porque el ecosistema polaco de modelos abiertos (Bielik) cubre un hueco que los modelos multilingües genéricos no atienden con la misma calidad en tareas nativas de polaco. La ficha advierte de una limitación práctica importante: la plantilla de chat del modelo original no es compatible con el motor de plantillas de OpenVINO GenAI, por lo que el prompt debe renderizarse externamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Mistral, según nota del autor sobre bug en OpenVINO < 2025.4); 50 capas, hidden 4096, 32 cabezas de atención / 8 cabezas KV, vocab 32128 |
| Parametros totales | 11 mil millones (aproximadamente) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantizacion | INT4 simétrico weight-only, group size 64, AWQ con scale_estimation; embeddings y lm_head en INT8 asimétrico |
| Idiomas soportados | Polaco (pl), inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | OpenVINO IR (pesos comprimidos: 5,08 GB int4 + 0,32 GB escalas fp16 + 0,25 GB uint8; total en disco 5,64 GB) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 50 capas con dimensión oculta 4096, 32 cabezas de atención y 8 cabezas KV (GQA), vocabulario de 32128 tokens. La información disponible no detalla el volumen de tokens de entrenamiento ni la composición del dataset del modelo original; solo se sabe que está orientado a polaco e inglés y que la model card upstream debe consultarse para esos datos. No se documenta si hubo RLHF, DPO u otras fases de alineación.

La innovación técnica de esta variante es exclusivamente la cuantización: se aplicó NNCF 2.18.0 con `OVWeightQuantizationConfig` (bits=4, sym=True, group_size=64, ratio=1.0, quant_method="awq", scale_estimation=True) usando 128 muestras de calibración en polaco extraídas de allenai/c4. El autor comparó cuatro recetas INT4 (plana, mixta int4/int8, AWQ y AWQ+grupo 64) y eligió la de menor perplejidad y mejores puntuaciones en Belebele y MMLU-pl, a costa de ser un 3 % más grande y un 3 % más lenta que la receta plana con grupo 128. La conversión requirió 134,5 minutos y un pico de RSS de aproximadamente 59 GB.

## Capacidades

- Generación de texto conversacional en polaco e inglés, con soporte de plantilla de chat multi-turno (renderizada externamente).
- Razonamiento y respuesta a preguntas: evaluado en MMLU-pl global (14.042 ítems) y Belebele polaco (900 ítems).
- Comprensión lingüística fina: evaluado en MultiBLiMP polaco (3.272 ítems, 98,62 % de precisión), lo que indica buen manejo de concordancia y morfología.
- Análisis de sentimiento: evaluado en PolEmo2 in-domain y out-of-domain.
- Conocimiento enciclopédico y cultural polaco (INCLUDE base 44 polish).
- Modo "thinking": la plantilla del modelo original termina el prompt de generación con un bloque vacío ``, lo que sugiere soporte de razonamiento explícito en el modelo base (no evaluado en esta variante).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y multi-step reasoning: no disponible en la información proporcionada.
- Visión, audio: no soportadas (modelo de texto).

## Casos de uso

- Asistente conversacional en polaco para atención al cliente: el modelo puede mantener diálogos multi-turno renderizando la lista completa de mensajes en cada turno; su ventana de contexto (no especificada) y su calidad en Belebele (82,78 % en INT4) lo hacen adecuado para preguntas de comprensión sobre texto del usuario.
- Clasificación y análisis de sentimiento de reseñas en polaco: con 74,79 % en PolEmo2 in-domain y 67,00 % out-of-domain, es utilizable para triaje automático de opiniones de producto o comentarios en redes, aceptando la pérdida mínima frente a bf16 (no significativa estadísticamente).
- Corrección y análisis gramatical de textos polacos: su 98,62 % en MultiBLiMP indica buen dominio de concordancia y estructuras morfológicas, útil en herramientas de revisión o generación asistida de documentación administrativa.
- Despliegue en estaciones de trabajo Intel sin GPU dedicada: al ser OpenVINO IR, se ejecuta en CPU con instrucciones AVX-512 o en iGPU Intel, lo que permite prototipos locales en portátiles sin CUDA.
- Inferencia en GPUs Intel Arc de consumo: con 5,64 GB en disco y cuantización INT4, cabe en tarjetas Arc con 8-12 GB de VRAM, habilitando asistentes locales para desarrolladores que trabajan con hardware Intel.
- Evaluación comparativa de recetas de cuantización: el repositorio documenta perplejidad, benchmarks y velocidad de cuatro recetas INT4, por lo que sirve como referencia reproducible para ingenieros que calibran sus propias compresiones NNCF.
- Generación de contenido en inglés y polaco para blogs técnicos o documentación bilingüe, siempre que se renderice el prompt con el tokenizer original y se acepte la ligera degradación de MMLU-pl (−1,95 puntos).

## Benchmarks y rendimiento

Resultados publicados por el autor (lm-eval-harness 0.4.13, zero-shot, log-likelihood sobre letras de respuesta, sin plantilla de chat; precisión en %; comparación McNemar exacta frente a bf16):

| Benchmark (n) | bf16 | INT8 | este INT4 | INT4 vs bf16 (p) |
|---|---|---|---|---|
| global_mmlu_full_pl (14.042) | 61,09 | 61,23 | 59,14 | −1,95 pt (p < 0,0001) |
| belebele_pol_Latn (900) | 84,89 | 84,44 | 82,78 | −2,11 pt (p = 0,011, nominal) |
| multiblimp_pol (3.272) | 98,81 | 98,53 | 98,62 | n.s. (p = 0,36) |
| include_base_44_polish (548) | 65,69 | 66,06 | 64,42 | n.s. (p = 0,34) |
| polemo2_in (722) | 75,07 | 74,93 | 74,79 | n.s. (p = 0,77) |
| polemo2_out (494) | 67,21 | 67,00 | 67,00 | n.s. (p = 1,0) |
| global_piqa cloze pol (103) | 36,89 | 37,86 | 36,89 | n.s. (p = 1,0) |

Perplejidad sobre 98.208 tokens de Wikipedia polaca (96 pasajes): bf16 2,5343; INT8 2,5327; INT4 2,6405 (+4,2 %). Con corrección de Bonferroni sobre 7 tests (umbral p < 0,0071), solo la caída en MMLU-pl es estadísticamente significativa; Belebele es nominal y el resto no significativo. El autor advierte que MMLU-pl es una traducción, que MultiBLiMP está cerca del techo y que las tareas son de log-likelihood, no de generación con plantilla de chat.

Velocidad: 67,4 tokens/s en decodificación greedy (256 tokens nuevos, prompt de ~1.090 tokens) en una Intel Arc Pro B70 de 32 GB con OpenVINO GenAI; la receta plana con grupo 128 alcanzó 69,6 tokens/s en el mismo equipo. Medición de una sola máquina, indicativa; la velocidad de prefill no se midió de forma válida.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 5,64 GB en disco; en ejecución hay que sumar la caché KV y las activaciones en f16, por lo que se recomienda al menos 8 GB de memoria disponible para contextos moderados (estimación, no medida por el autor).
- GPU recomendadas: Intel Arc Pro B70 32 GB (equipo usado en las mediciones); cualquier GPU Intel Arc con 8 GB o más debería poder cargar el modelo.
- GPU de consumo: cabe en tarjetas Intel Arc de gama media; no está pensado para CUDA (es OpenVINO IR, no GGUF ni safetensors).
- CPU: ejecutable en CPU con OpenVINO GenAI (backend "CPU" documentado por el autor), siempre que se disponga de suficiente RAM.
- Opciones de despliegue: OpenVINO GenAI (LLMPipeline) con OpenVINO >= 2025.4; no se mencionan vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: 67,4 tokens/s en decodificación sobre Arc Pro B70; prefill no medido.
- Requisito de conversión: el proceso de cuantización necesitó un pico de ~59 GB de RSS, por lo que reproducirlo requiere una máquina con 64 GB o swap.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización / formato | Licencia | Notas |
|---|---|---|---|---|---|
| Bielik-11B-v3.1-Instruct (bf16) | 11B | no disponible | safetensors / PyTorch | Apache-2.0 | Referencia de calidad; ~22 GB en disco; requiere GPU con 24 GB o más |
| Bielik-11B-v3.1-Instruct-int4-ov (este) | 11B | no disponible | OpenVINO IR INT4 AWQ g64 | Apache-2.0 | 5,64 GB; 67,4 tok/s en Arc Pro B70; −1,95 pt en MMLU-pl |
| Bielik-11B-v3.1-Instruct INT8 (OpenVINO) | 11B | no disponible | OpenVINO IR INT8 | Apache-2.0 | Sin diferencias significativas frente a bf16 en los benchmarks publicados; mayor peso en disco |
| Receta INT4 plana grupo 128 (misma conversión) | 11B | no disponible | OpenVINO IR INT4 | Apache-2.0 | 69,6 tok/s; peor Belebele (−3,1 pt frente a AWQ g64) y peor perplejidad |

No se dispone de comparación con modelos de otros ecosistemas (Llama, Mistral, Qwen) en la información proporcionada; la comparativa se limita a variantes del mismo modelo base.

## Limitaciones y advertencias

- Conversión no oficial: no está afiliada ni respaldada por SpeakLeash ni por ACK Cyfronet AGH; para uso en producción conviene validar contra el modelo original.
- La plantilla de chat del modelo upstream usa características Jinja (macro, `strftime_now`, `namespace`) que el motor minja de OpenVINO GenAI no puede ejecutar; llamar a `generate` con `apply_chat_template=True` falla. Es obligatorio renderizar el prompt con el tokenizer de Hugging Face y pasar `apply_chat_template=False`.
- Sin mensaje de sistema, la plantilla inyecta un largo prompt de sistema por defecto en polaco con la fecha actual; hay que fijar `current_date`, `current_day_of_week` y `current_time_of_day` para que la generación sea determinista.
- El prompt renderizado ya incluye `<s>`; el tokenizer de OpenVINO no añade un segundo BOS (verificado token a token), pero conviene comprobarlo si se cambia de versión.
- Degradación medible en MMLU-pl (−1,95 puntos, estadísticamente significativa tras corrección de Bonferroni) y nominal en Belebele (−2,11 puntos); para tareas donde la calidad es crítica, el autor recomienda INT8.
- Riesgo de alucinación: no evaluado en la información disponible; es un modelo de 11B y debe tratarse con las precauciones habituales.
- Sesgos: no documentados en la información proporcionada; el modelo base está entrenado principalmente en polaco e inglés, por lo que su rendimiento en otros idiomas será limitado.
- No evaluado en esta variante: el conjunto de 196 ítems de gramática e idioma polaco, la recuperación en contexto largo y la calidad de generación con plantilla de chat a escala.
- Las mediciones de velocidad corresponden a una sola máquina (Arc Pro B70) y son indicativas; no hay datos de prefill ni de latencia en CPU.
- Requiere OpenVINO >= 2025.4; versiones anteriores tenían un bug de precisión en la familia Mistral.
- Licencia Apache-2.0 permite uso comercial, pero al ser una conversión comunitaria conviene conservar la atribución al modelo base y revisar la model card upstream para condiciones adicionales.

## Enlaces

- Repositorio Hugging Face de esta conversión: https://huggingface.co/jermalk/Bielik-11B-v3.1-Instruct-int4-ov
- Modelo base en Hugging Face: https://huggingface.co/speakleash/Bielik-11B-v3.1-Instruct
- Repositorio de SpeakLeash (organización): https://huggingface.co/speakleash
- Dataset de calibración allenai/c4: https://huggingface.co/datasets/allenai/c4
- NNCF (Neural Network Compression Framework): https://github.com/openvinotoolkit/nncf
- OpenVINO GenAI: https://github.com/openvinotoolkit/openvino.genai
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
- Paper, blog o demo adicionales: no disponibles en la información proporcionada.
