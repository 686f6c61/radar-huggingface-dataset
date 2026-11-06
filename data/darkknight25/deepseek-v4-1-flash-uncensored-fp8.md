# darkknight25/DeepSeek-V4.1-Flash-UNCENSORED-FP8

## Resumen

DeepSeek-V4.1-Flash-UNCENSORED-FP8 es una modificación del checkpoint base DeepSeek-V4.1-Flash publicada por el usuario darkknight25 (vinculado a la cuenta @dealignai), en la que se ha aplicado una técnica de "abliteración" a nivel de pesos para eliminar los mecanismos de rechazo del modelo original. El resultado es un checkpoint drop-in que se carga exactamente igual que el modelo base, sin hooks en tiempo de ejecución ni ficheros `model.py` personalizados, pero que responde a prácticamente cualquier petición sin activar negativas de seguridad.

El modelo base es un transformer causal encoder-decoder de tipo MoE con 20+20 capas, 384 expertos enrutados (top-6 más un experto compartido), atención dispersa CSA2, memoria de n-gramas Engram y un cabezal de borrador especulativo DSpark. Los pesos publicados suman 763.205.315.794 parámetros totales (unos 763 mil millones) con un tamaño de repositorio de 510,3 GB, cuantizados nativamente en FP8 (`e4m3fn`) con escalas de bloque E8M0 [32, 32] y expertos enrutados en FP4. La longitud de contexto declarada es de 1 millón de tokens y el pipeline es multimodal image-text-to-text gracias a una torre de visión DeepSeek-ViT con RoPE 2D y pixel unshuffle.

La relevancia de esta ficha es doble: por un lado documenta un modelo de la familia DeepSeek V4.1 en su variante Flash, con capacidades multimodales y de razonamiento; por otro, es un caso de estudio de las implicaciones de seguridad y legales de las versiones "abliteradas" que circulan en Hugging Face. La licencia declarada es MIT, aunque el modelo base pertenece a deepseek-ai y su uso está sujeto a las condiciones del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal encoder-decoder (20+20 capas), MoE con 384 expertos enrutados top-6 + 1 compartido, Hyper-Connections (residual de 4 canales), atención dispersa CSA2, memoria Engram de n-gramas, cabezal especulativo DSpark |
| Parametros totales | 763.205.315.794 (según safetensors) |
| Parametros activos | 8B/16B activos por token (según model card del autor) |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | FP8 (`e4m3fn`) con escalas de bloque E8M0 [32, 32]; expertos enrutados en FP4; etiqueta "8-bit" |
| Idiomas soportados | no disponible |
| Licencia | MIT (declarada en el repo); modelo base con licencia propia de deepseek-ai |
| Formato de pesos | safetensors, transformers |

## Arquitectura y entrenamiento

La arquitectura del modelo base es un transformer causal encoder-decoder con 20 capas de encoder y 20 de decoder, organizado como mezcla de expertos con 384 expertos enrutados y selección top-6 más un experto compartido. Incorpora Hyper-Connections (residuales de 4 canales), atención dispersa CSA2 para manejar contextos de hasta 1 millón de tokens, una memoria de n-gramas denominada Engram y un cabezal de decodificación especulativa DSpark (MTP). La torre de visión DeepSeek-ViT emplea RoPE 2D y pixel unshuffle para el procesamiento de imágenes.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si el modelo base utilizó RLHF, DPO u otras técnicas de alineación. La modificación del autor consiste en una abliteración a nivel de pesos que, según la model card, elimina el "circuito de rechazo" preservando byte a byte los componentes críticos para las capacidades: expertos enrutados, memoria Engram, atención dispersa CSA2, cabezal DSpark, torre de visión, puertas del router, normalizaciones y embeddings. No se detalla la metodología exacta de la abliteración, solo que es "propietaria" del equipo dealignai.

## Capacidades

- Generación de texto y razonamiento multi-turno con contexto de hasta 1 millón de tokens.
- Procesamiento multimodal image-text-to-text mediante la torre DeepSeek-ViT.
- Razonamiento con modo "effort=max" por defecto, según la model card.
- Soporte de tool calling y function calling (heredado del modelo base, etiqueta `endpoints_compatible`).
- Capacidades de agente y razonamiento multi-paso (MTP/DSpark).
- Decodificación especulativa integrada para acelerar la inferencia.
- Ausencia de mecanismos de rechazo: la model card reporta 100 % de cumplimiento en HarmBench-320 en todos los niveles de esfuerzo.
- Capacidades multilingües: no disponibles de forma explícita, aunque la evaluación HarmBench emplea un clasificador multilingüe.

## Casos de uso

- Investigación sobre seguridad y alineación: el modelo sirve como caso de estudio controlado para medir la eficacia de técnicas de abliteración y evaluar la robustez de los guardrails de modelos abiertos. Su disponibilidad permite reproducir experimentos de red-teaming con HarmBench u otros conjuntos.
- Evaluación de sesgos y comportamientos dañinos en entornos aislados: al no presentar rechazos, permite generar respuestas a prompts sensibles para su clasificación y análisis por parte de equipos de seguridad, siempre en infraestructura controlada y con las salvaguardas legales oportunas.
- Procesamiento de documentos largos multimodales: con 1M de tokens de contexto y torre de visión, puede ingerir manuales técnicos, informes o expedientes completos con imágenes intercaladas y responder preguntas sobre ellos.
- Automatización de tareas de extracción de información en pipelines internos: su soporte de tool calling y formato compatible con endpoints permite integrarlo en flujos de agentes que consultan APIs y bases de datos.
- Generación de código en entornos de desarrollo con requisitos de contexto amplio: el contexto de 1M tokens facilita el análisis de repositorios completos y la generación de parches coherentes con el código existente.
- Análisis de imágenes en procesos industriales o de documentación: la combinación de visión y contexto largo permite describir y clasificar imágenes dentro de flujos documentales extensos.
- Experimentación con decodificación especulativa: el cabezal DSpark permite estudiar el rendimiento de técnicas de aceleración en modelos MoE de gran tamaño.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son los de la model card del autor, que comparan el modelo base con la versión abliterada. No se dispone de resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) del modelo base en esta información.

| Benchmark | Modelo base | UNCENSORED-FP8 | Delta |
|---|---:|---:|---:|
| HarmBench-320, effort=off (ASR) | 42,81 % | 100,00 % | +57,19 pp |
| HarmBench-320, effort=max (ASR) | 1,56 % | 100,00 % | +98,44 pp |
| MMLU-14k (accuracy) | 86,96 % | 82,74 % | -4,22 pp |
| MMLU-14k sin cluster de ética | — | — | -1,1 pp |

Por categoría de HarmBench, la versión abliterada alcanza el 100 % de cumplimiento en las siete categorías (chemical_biological, copyright, cybercrime_intrusion, harassment_bullying, harmful, illegal, misinformation_disinformation) tanto con effort=off como con effort=max. En MMLU, la mayor caída se concentra en "moral scenarios" (-39,89 pp), seguida de "professional law" (-7,04 pp) y "abstract algebra" (-6,00 pp).

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 510,3 GB en FP8 con expertos en FP4. En FP8 se necesita al menos un nodo multi-GPU con ~512 GB de VRAM agregada; con cuantizaciones adicionales (no publicadas) podría reducirse, pero no hay datos disponibles.
- GPU recomendadas: nodos con múltiples H100 (80 GB) o H200 (141 GB); para FP8 nativo se requieren GPUs con soporte FP8 (H100, H200, B200, L40S). No es viable en A100 sin conversión de formato.
- Consumer GPU: no cabe en ninguna GPU de consumo actual (RTX 4090 con 24 GB, RTX 5090 con 32 GB) sin cuantizaciones agresivas no publicadas.
- Opciones de despliegue: transformers (librería declarada), vLLM y TGI previsiblemente compatibles al ser un checkpoint estándar; llama.cpp y Ollama no soportan FP8 nativo ni arquitecturas MoE de este tamaño de forma práctica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Multimodal | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash (base) | 552B backbone, 8B/16B activos | 1M | propia de deepseek-ai | Sí | Hugging Face |
| DeepSeek-V4.1-Flash-UNCENSORED-FP8 | 763B totales, 8B/16B activos | 1M | MIT (declarada) | Sí | Hugging Face |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de rendimiento de otros modelos comparables (MMLU, HumanEval, etc.) que permitan una comparación cuantitativa rigurosa. La comparación principal es con el modelo base del que deriva, cuyos resultados en HarmBench y MMLU se recogen en la sección anterior.

## Limitaciones y advertencias

- Eliminación deliberada de guardrails: el modelo responde a peticiones dañinas en el 100 % de los casos evaluados en HarmBench-320, incluidas categorías de cibercrimen, contenido químico-biológico, acoso y desinformación. Su uso en producción con usuarios finales es desaconsejable y puede infringir legislación (Reglamento de IA de la UE, DSA, normativa sectorial).
- Sesgos conocidos: no documentados de forma específica; la caída de -39,89 pp en "moral scenarios" de MMLU sugiere una alteración profunda del comportamiento normativo del modelo.
- Riesgo de alucinación: no cuantificado; la abliteración puede afectar a la calibración del modelo en dominios sensibles.
- Restricciones de licencia: la licencia MIT declarada en el repo no exime del cumplimiento de la licencia del modelo base DeepSeek-V4.1-Flash ni de las obligaciones legales aplicables al uso de modelos sin guardrails.
- Idiomas soportados: no disponibles de forma explícita; la calidad multilingüe no está verificada.
- Reproducibilidad: la metodología de abliteración es propietaria y no se detalla; no es posible auditar el proceso completo.
- Contexto: aunque se declaran 1M tokens, no se aportan mediciones de rendimiento en contextos largos (needle-in-a-haystack, RULER).
- Trazabilidad: el autor es un usuario individual (darkknight25) sin afiliación institucional verificada; el modelo base pertenece a deepseek-ai.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/darkknight25/DeepSeek-V4.1-Flash-UNCENSORED-FP8
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash
- Cuenta del autor en X: https://x.com/dealignai
- Cuenta secundaria en X: https://x.com/jordanschenck
