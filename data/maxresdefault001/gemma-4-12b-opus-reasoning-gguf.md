# MaxResDefault001/gemma-4-12B-opus-reasoning-GGUF

## Resumen

Gemma 4 12B Opus-reasoning es un ajuste fino (fine-tune) por LoRA del modelo Gemma 4 12B de Google, publicado por el usuario MaxResDefault001 en Hugging Face. El modelo parte del checkpoint instructivo oficial (`google/gemma-4-12B-it`) y se entrena sobre aproximadamente 8.600 conversaciones de razonamiento con el estilo de Claude Opus 4.6/4.7, con el objetivo de imitar los patrones de razonamiento extendido (thinking) de dichos modelos en un tamaño que quepa en GPUs de consumo.

El autor distribuye dos variantes: una de solo fine-tune y otra "abliterated" (eliminación de direcciones de rechazo mediante la herramienta Heretic), ambas en formato GGUF con cuantizaciones Q6_K y Q4_K_M calibradas con imatrix. El modelo conserva la torre de visión del Gemma 4 original (pipeline `image-text-to-text`) y está pensado explícitamente para tarjetas de 16 GB de VRAM, como una Radeon RX 6800 XT, según reporta el autor.

La relevancia del modelo radica en su enfoque práctico: reducir el número de tokens de razonamiento (alrededor de un tercio menos que el Gemma 4 12B original) manteniendo un rendimiento comparable en pruebas de razonamiento difícil, además de soportar decodificación especulativa mediante la cabeza MTP (Multi-Token Prediction) del modelo base para acelerar la generación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4), con torre de visión; ajuste LoRA r16 sobre el modelo base |
| Parametros totales | 11.907.350.576 (~11,9 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 131.072 tokens (128k), segun la configuracion recomendada por el autor |
| Tipos de cuantizacion | Q6_K, Q4_K_M (ambas calibradas con imatrix para Q4); el autor menciona Q8_0 como referencia no distribuida |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones), safetensors (adaptador LoRA), bf16 (proyector de visión) |

## Arquitectura y entrenamiento

El modelo es un fine-tune por LoRA (rango 16) sobre `google/gemma-4-12B-it`, un transformer denso de aproximadamente 11,9 mil millones de parámetros con capacidad multimodal de entrada (imagen y texto). El adaptador se entrena sobre el dataset `angrygiraffe/claude-opus-4.6-4.7-reasoning-8.7k`, compuesto por unas 8.600 conversaciones de razonamiento con el estilo de Claude Opus 4.6/4.7. La torre de visión no se modifica respecto al modelo base, y el autor indica que el proyector de visión (mmproj) de Unsloth también es compatible.

La variante "abliterated" se genera con la herramienta Heretic, que elimina las direcciones de activación asociadas al rechazo de peticiones. Las cuantizaciones Q4_K_M se calibran con matrices de importancia (imatrix) obtenidas de una muestra aleatoria de los datos de entrenamiento; el autor reporta que sin calibración el Q4_K_M obtenía 18/34 en su suite difícil frente a 25/34 con calibración, lo que subraya la importancia de este paso para un fine-tune. El modelo soporta decodificación especulativa mediante la cabeza MTP (`mtp-gemma-4-12b-it.gguf`, 0,47 GB) distribuida por Unsloth, que el autor reporta que aporta entre un 40 % y un 80 % de velocidad de generación adicional.

## Capacidades

- Generación de texto conversacional multi-turno con modo de razonamiento extendido (thinking) activable mediante la plantilla de chat de Gemma 4 (`enable_thinking`).
- Razonamiento multi-paso en matemáticas, lógica y trazado de código, con respuestas verificables.
- Capacidad multimodal de entrada: procesa imágenes junto con texto (pipeline `image-text-to-text`), usando el proyector de visión incluido o el de Unsloth.
- Respuestas más concisas que el modelo base: el autor reporta aproximadamente un 60 % menos de tokens en respuestas con thinking activado en su suite de peticiones límite.
- Menor tasa de rechazo y moralización en peticiones legítimas pero borderline (humor soez, límites seguros de alcohol y cafeína, educación sexual, explicación de phishing), según las pruebas del autor.
- Compatible con llama.cpp y servidores compatibles con la API de endpoints (`endpoints_compatible`).
- Soporte de decodificación especulativa mediante cabeza MTP para acelerar la inferencia.

## Casos de uso

- Razonamiento matemático y lógico en local: el modelo resuelve problemas multi-paso con respuestas verificables y, según el autor, iguala al Gemma 4 12B original en su suite difícil usando un tercio menos de tokens de pensamiento, lo que abarata el coste por consulta en hardware de consumo.
- Asistente de código y trazado de ejecución: puede seguir la ejecución de fragmentos de código y razonar sobre estados intermedios, adecuado para depuración asistida en entornos con GPU de 16 GB.
- Procesamiento de documentos con imágenes: al conservar la torre de visión, puede extraer y razonar sobre contenido de capturas, diagramas o formularios escaneados en flujos de digitalización.
- Generación creativa sin filtros excesivos: la variante abliterated responde a peticiones de humor soez, limericks con lenguaje soez o escenarios de ficción sin las negativas del modelo base, útil en herramientas de escritura creativa para adultos.
- Educación y divulgación sensible: responde a preguntas de educación sexual o límites seguros de sustancias sin moralizar, con respuestas más cortas, adecuado para chatbots divulgativos.
- Despliegue en estaciones de trabajo con GPU de consumo: con Q6_K ocupa 12,7 GB a contexto completo de 128k con caché KV q8_0 y visión activada, dejando margen en tarjetas de 16 GB; con Q4_K_M ocupa 10,4 GB y permite ejecutar otras aplicaciones en paralelo.
- Servicio de inferencia con decodificación especulativa: integrado en llama-server con la cabeza MTP, alcanza unos 76 tok/s en Q6_K y unos 90 tok/s en Q4_K_M según el autor, viable para prototipos de atención al cliente o asistentes internos.

## Benchmarks y rendimiento

Los datos provienen de las suites propias del autor (34 problemas difíciles de matemáticas, lógica y trazado de código; 46 preguntas factuales; 27 peticiones límite legítimas), no de benchmarks estándar publicados. Se comparan con el Gemma 4 12B original (GGUF de Unsloth, misma cuantización) y con el modelo de HauhauCS Gemma4-12B-QAT-Uncensored "Balanced" (solo Q4_K_M), bajo ajustes idénticos.

| Modelo | Difícil (34) | Conocimiento (46) | Rechazo (27) | Tokens de pensamiento por problema difícil |
|---|---|---|---|---|
| Gemma 4 12B original, Q6_K | 27,5 (29, 26) | 44 | 23 | 9.600 |
| Este modelo, abliterated, Q6_K | 27,5 (26, 29) | 45 | 23,5 (23, 24) | 6.400 |
| Este modelo, Q6_K | 26 | 44 | 25 | 6.700 |
| Gemma 4 12B original, Q4_K_M | 25,5 (26, 25) | 44 | 21 | 10.000 |
| Este modelo, abliterated, Q4_K_M | 24 (25, 23) | 45 | 25 | 7.900 |
| Este modelo, Q4_K_M | 27 | 45 | 24 | 7.000 |
| HauhauCS Uncensored Balanced, Q4_K_M | 18 | 43 | 27 | 10.800 |

El autor advierte que una diferencia de 2-3 puntos en la suite difícil está dentro del ruido entre ejecuciones, y que las comparaciones clave se repitieron dos veces. No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: Q6_K ocupa 12,7 GB con contexto de 128k, caché KV q8_0 y visión activada; Q4_K_M ocupa 10,4 GB en las mismas condiciones. El Q8_0 no distribuido desbordaba a RAM del sistema al crecer el contexto (de 33 a 17 tok/s).
- GPU probada por el autor: Radeon RX 6800 XT de 16 GB (Vulkan, Ubuntu, llama.cpp b11840).
- Cabe en GPU de consumo: sí, en tarjetas de 16 GB con Q6_K y en tarjetas de 8-12 GB con Q4_K_M. El Q4_K_M en 16 GB deja espacio para ejecutar un juego o un navegador en paralelo.
- Opciones de despliegue: llama.cpp (llama-server) con `--jinja`, `-fa on`, `-ctk q8_0 -ctv q8_0`; compatible con endpoints. No se mencionan otras opciones como vLLM, TGI u Ollama en la información disponible.
- Throughput reportado: 42-44 tok/s en Q6_K sin MTP y 51-54 tok/s en Q4_K_M sin MTP; con la cabeza MTP y `--spec-draft-n-max 2`, unos 76 tok/s en Q6_K y unos 90 tok/s en Q4_K_M.
- Ajustes recomendados: temperatura 1.0, top-k 64, top-p 0.95, min-p 0; thinking activado, especialmente en Q4_K_M.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este modelo (Gemma 4 12B Opus-reasoning) | ~11,9 mil millones | 128k | apache-2.0 | GGUF, safetensors (LoRA) | Fine-tune de razonamiento estilo Opus, variante abliterated, pensado para 16 GB |
| google/gemma-4-12B-it (original) | ~11,9 mil millones | 128k | apache-2.0 (según el modelo base) | safetensors, GGUF (Unsloth) | Referencia: 27,5 en suite difícil Q6_K, 9.600 tokens de pensamiento por problema |
| HauhauCS Gemma4-12B-QAT-Uncensored "Balanced" | ~11,9 mil millones (estimado) | no disponible | no disponible | GGUF (solo Q4_K_M) | Sin censura, basado en el checkpoint QAT de Google; 18/34 en suite difícil, 27/27 en rechazo |
| Gemma 4 26B-A4B Opus-reasoning (mismo autor) | no disponible | no disponible | apache-2.0 (según la card) | GGUF | Hermano mayor del mismo autor, orientado a equipos con más VRAM |

## Limitaciones y advertencias

- Los benchmarks son suites propias del autor, pequeñas (34, 46 y 27 ítems) y no validadas externamente; no hay resultados en MMLU, HumanEval, GSM8K ni otros benchmarks estándar.
- El autor reconoce que en algunos puntos el Gemma 4 12B original rinde mejor: en Q4_K_M este modelo queda 1,5 puntos por detrás en razonamiento difícil con thinking activado, y sin thinking el Q4_K_M se degrada en problemas difíciles.
- La variante abliterated elimina mecanismos de rechazo, lo que incrementa el riesgo de generar contenido inapropiado, ofensivo o inseguro; no es apta para aplicaciones dirigidas al público general sin moderación adicional.
- Riesgo de alucinación inherente a los modelos de 12 mil millones de parámetros, especialmente en conocimiento factual (44-45 sobre 46 en la suite del autor, pero con posibles errores no medidos).
- La licencia apache-2.0 del repositorio no exime de las posibles restricciones de los términos de uso de Gemma de Google para el modelo base; conviene revisarlos antes de uso comercial.
- El fine-tune puede degradar el rendimiento en idiomas distintos del inglés; la información disponible no detalla la cobertura lingüística.
- El uso de decodificación especulativa con MTP requiere descargar un archivo adicional de Unsloth y ajustar `--spec-draft-n-max 2` en lugar del valor por defecto 3.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente de los resultados del autor.
- El modelo está pensado para llama.cpp; no se documenta soporte en vLLM, TGI u otros motores.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/MaxResDefault001/gemma-4-12B-opus-reasoning-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- GGUF del modelo base (Unsloth, incluye cabeza MTP): https://huggingface.co/unsloth/gemma-4-12b-it-GGUF
- Hermano mayor del mismo autor (26B-A4B): https://huggingface.co/MaxResDefault001/gemma-4-26B-A4B-opus-reasoning-GGUF
- Herramienta Heretic (abliteration): https://github.com/p-e-w/heretic
- Dataset de entrenamiento: https://huggingface.co/datasets/angrygiraffe/claude-opus-4.6-4.7-reasoning-8.7k
