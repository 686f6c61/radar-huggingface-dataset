# inclusionAI/LLaDA2.2-mini

## Resumen

LLaDA2.2-mini es la variante ligera de la serie LLaDA2.2 de inclusionAI, una familia de modelos de lenguaje de difusión (diffusion language models, dLLM) orientados a tareas agénticas. A diferencia de los transformers autorregresivos convencionales, LLaDA2.2-mini genera texto mediante un proceso de difusión por bloques, lo que le permite producir y editar tokens en paralelo. Su innovación principal es la edición de Levenshtein, que introduce tokens de control `DELETE` e `INSERT` para corregir y reestructurar secuencias durante la decodificación.

El modelo es un Mixture-of-Experts (MoE) con 16.255 millones de parámetros totales y solo 1.400 millones activados por token (256 expertos, 8 activos). Soporta una ventana de contexto de 128.000 tokens, lo que lo sitúa en la gama de modelos capaces de gestionar conversaciones multi-turno largas y flujos de tool calling extensos. Está construido sobre la arquitectura de LLaDA2.0-mini e incorpora el mecanismo Block Routing, que restringe la activación de expertos a nivel de bloque de difusión para hacer eficiente el contexto largo.

Su relevancia actual radica en dos frentes: por un lado, explora una alternativa no autorregresiva a los LLM dominantes; por otro, está específicamente entrenado con RL agéntico (L-EBPO) para entornos de uso de herramientas, donde la corrección de errores y la edición de secuencias resultan críticas. Se distribuye con licencia Apache 2.0, lo que facilita su uso comercial e investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) de difusión con edición de Levenshtein; 20 capas, 16 cabezas de atención, 4 KV heads, RoPE |
| Parametros totales | 16.255.643.392 (16B, excluyendo embeddings) |
| Parametros activos | 1.4B por token (256 expertos, 8 activos) |
| Longitud de contexto | 128K tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 32,5 GB) |
| Vocabulario | 157.184 tokens |
| Tokens de control | `DELETE`, `INSERT` (edición de Levenshtein) |
| Librería | transformers >= 5.2.0 (custom_code, trust_remote_code) |

## Arquitectura y entrenamiento

LLaDA2.2-mini es un modelo de difusión de lenguaje con arquitectura MoE de 20 capas. En lugar de generar token a token de forma autorregresiva, aplica un proceso de difusión por bloques que permite la generación paralela y la revisión de contenido ya emitido. La incorporación de los tokens de control `DELETE` e `INSERT` habilita la edición de Levenshtein: el modelo puede eliminar fragmentos redundantes o erróneos e insertar nuevo contenido en puntos concretos de la secuencia durante la decodificación, algo que un modelo autorregresivo no puede hacer sin regenerar desde el punto de error.

El entrenamiento combina preentrenamiento de difusión con una fase de RL agéntico denominada Levenshtein Editing ELBO-based Block-level Policy Optimization (L-EBPO), que utiliza recompensas del entorno agéntico para entrenar las capacidades de edición y corrección de errores en escenarios multi-turno con uso de herramientas. El mecanismo Block Routing restringe la activación de expertos a nivel de bloque de difusión, lo que reduce el coste computacional en contextos largos. No se dispone de información sobre el número de tokens de entrenamiento ni la composición del dataset.

## Capacidades

- Generación de texto conversacional mediante difusión por bloques con decodificación paralela.
- Edición de secuencias con tokens `DELETE` e `INSERT` para corregir errores y eliminar redundancias sin regenerar.
- Tool calling y function calling, con resultados destacados en BFCL v4 (47,68).
- Razonamiento agéntico multi-turno: τ²-Bench 57,50, Claw-Eval 57,16, PinchBench 62,33.
- Razonamiento matemático: AIME 2026 (35,05) y OlympiadBench (61,11).
- Generación de código: LiveCodeBench v6 (28,14) y MultiPL-E (65,26).
- Manejo de contexto largo: LongBench v2 (34,99) con ventana de 128K.
- Capacidades multilingües: no disponible (no se detallan idiomas en la información proporcionada).

## Casos de uso

- Agentes de tool calling en producción: el modelo está entrenado con RL agéntico y obtiene 47,68 en BFCL v4, lo que lo hace adecuado para orquestar llamadas a APIs en flujos multi-paso donde la corrección de errores es frecuente.
- Asistentes conversacionales de contexto largo: con 128K tokens de ventana y Block Routing, puede mantener conversaciones extensas con historial completo sin degradar el coste por token gracias a sus 1,4B parámetros activos.
- Edición y corrección de documentos generados: los tokens `DELETE` e `INSERT` permiten revisar y reestructurar texto ya emitido, útil en pipelines de generación de informes donde se requiere consistencia sin regeneración completa.
- Automatización de tareas de oficina con agentes: PinchBench (62,33) y Claw-Eval (57,16) indican buen rendimiento en entornos de agente con herramientas, como gestión de correo, calendario o sistemas de tickets.
- Razonamiento matemático asistido: AIME 2026 (35,05) y OlympiadBench (61,11) lo sitúan como opción para tutores o verificadores de problemas matemáticos en entornos educativos.
- Generación de código en pipelines de CI/CD: MultiPL-E (65,26) y soporte de tool calling permiten integrarlo en herramientas de revisión o generación de parches con corrección iterativa.
- Despliegue en hardware limitado: al activar solo 1,4B parámetros, es viable en GPUs de consumo con cuantización adecuada, aunque no se especifican los formatos disponibles.

## Benchmarks y rendimiento

| Categoria | Benchmark | LLaDA2.0-mini | LLaDA2.1-mini | LLaDA2.2-mini |
|---|---|---|---|---|
| Function Calling | BFCL v4 | 25,05 | 28,44 | 47,68 |
| Function Calling | BFCL v3 | 70,72 | 72,06 | 69,02 |
| Math | AIME 2026 | 37,71 | 40,37 | 35,05 |
| Math | OlympiadBench | 67,70 | 64,30 | 61,11 |
| Coding | LiveCodeBench v6 | 27,70 | 28,80 | 28,14 |
| Coding | MultiPL-E | 67,46 | 64,16 | 65,26 |
| Instruction Following | IFBench | 32,33 | 31,60 | 24,93 |
| Instruction Following | Multi-IF | 60,58 | 58,43 | 57,03 |
| Reasoning | KOR-Bench | 49,92 | 46,64 | 43,60 |
| Knowledge | GPQA-Diamond | 47,76 | 48,36 | 44,41 |
| Long Context | LongBench v2 | 15,51 | 12,13 | 34,99 |
| General Average | — | 45,68 | 45,03 | 46,47 |
| Agent | τ²-Bench | - | - | 57,50 |
| Agent | Claw-Eval | - | - | 57,16 |
| Agent | PinchBench | - | - | 62,33 |
| Agentic Average | — | - | - | 59,00 |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 32,5 GB de pesos, por lo que se necesitan GPUs con 40 GB o más (A100 40GB, A100 80GB, H100).
- Con cuantización a 8 bits, el peso se reduce a unos 16 GB, viable en RTX 4090 (24 GB) o L40S.
- Con cuantización a 4 bits, alrededor de 8-9 GB, posible en GPUs de consumo como RTX 4070 Ti o superiores, aunque no se especifican formatos de cuantización oficiales.
- Al activar solo 1,4B parámetros por token, el coste computacional por paso es bajo en comparación con un modelo denso de 16B, lo que reduce la latencia en inferencia.
- Opciones de despliegue: transformers >= 5.2.0 con `trust_remote_code=True`; no se confirma soporte para vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LLaDA2.2-mini | 16B (1,4B activos) | 128K | Difusión MoE con edición de Levenshtein | Apache 2.0 | Hugging Face |
| LLaDA2.2-flash | 100B | no disponible | Difusión MoE agéntica | no disponible | Hugging Face |
| LLaDA2.1-mini | 16B (estimado) | no disponible | Difusión MoE | no disponible | Hugging Face |
| LLaDA2.0-mini | 16B (estimado) | no disponible | Difusión MoE | no disponible | Hugging Face |

No se dispone de información sobre modelos comparables de otros desarrolladores con arquitectura de difusión y tamaño similar en la documentación proporcionada.

## Limitaciones y advertencias

- No se detallan los idiomas soportados, por lo que el rendimiento fuera del inglés es incierto.
- Los benchmarks muestran una caída en IFBench (24,93 frente a 32,33 de la versión 2.0) y en Multi-IF (57,03 frente a 60,58), lo que sugiere un seguimiento de instrucciones más débil que en versiones anteriores.
- AIME 2026 y OlympiadBench también retroceden respecto a LLaDA2.0-mini y LLaDA2.1-mini, indicando posibles regresiones en matemáticas.
- La arquitectura de difusión no autorregresiva puede presentar un comportamiento menos predecible en tareas de generación libre que los transformers convencionales.
- Requiere `transformers>=5.2.0` y `trust_remote_code=True`, lo que implica ejecutar código personalizado del autor.
- No se especifican sesgos conocidos ni tasas de alucinación en la información proporcionada.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones de uso comercial y atribución en el repositorio oficial.
- No se confirma soporte en frameworks de inferencia optimizados (vLLM, TGI), lo que puede limitar el despliegue en producción a gran escala.

## Enlaces

- Hugging Face: https://huggingface.co/inclusionAI/LLaDA2.2-mini
- Modelo flash: https://huggingface.co/inclusionAI/LLaDA2.2-flash
- Informe técnico: https://github.com/inclusionAI/LLaDA2.X/blob/main/LLaDA2_2_tech_report.pdf
- Repositorio GitHub: https://github.com/inclusionAI/LLaDA2.X
