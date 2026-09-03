# Rampage1219hf/Hermes-4.3-36B

## Resumen

Hermes 4.3 36B es un modelo de lenguaje instructivo con modo de razonamiento híbrido, desarrollado por Nous Research sobre la base ByteDance Seed-OSS-36B. Se trata del primer modelo de la familia Hermes entrenado de forma descentralizada a través de la red Psyche, con un corpus de post-entrenamiento ampliado hasta aproximadamente 5 millones de muestras y 60 mil millones de tokens, con énfasis en trazas de razonamiento verificadas, matemáticas, código, STEM y salidas con formato estricto.

El modelo está diseñado para ofrecer capacidades de razonamiento explícito (modo *thinking*) cuando resulta necesario, pero también permite respuestas rápidas sin deliberación. Soporta *function calling*, uso de herramientas, salidas JSON estructuradas y un largo contexto de conversación, manteniendo una alineación deliberadamente neutra y fácil de dirigir. Con 36 mil millones de parámetros y licencia Apache 2.0, se posiciona como una alternativa abierta y flexible para entornos de producción que requieran razonamiento, control de formato y personalización de comportamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basada en ByteDance Seed-OSS-36B) |
| Parametros totales | 36.151.104.512 (36,1 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (no especificada en la documentacion) |
| Tipos de cuantizacion | No disponible (pesos originales en safetensors; cuantizaciones externas no documentadas) |
| Idiomas soportados | Ingles (declarado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Hermes 4.3 36B es un modelo transformer decoder-only que parte del checkpoint base ByteDance Seed-OSS-36B. Nous Research ha aplicado un post-entrenamiento intensivo con un corpus sintetizado de aproximadamente 5 millones de muestras y 60 mil millones de tokens, mezclando datos de razonamiento (con trazas verificadas) y datos generales de instrucción. El entrenamiento se realizó de forma descentralizada mediante la infraestructura Psyche, una novedad dentro de la serie Hermes.

El modelo incorpora un modo de razonamiento híbrido: puede activar deliberación interna explícita entre etiquetas `thinking` y `response`, o responder directamente sin razonar, controlable mediante *system prompt* o *flag* en la plantilla de chat. También se ha entrenado específicamente para producir JSON válido según esquemas dados y para reparar objetos malformados, lo que mejora la adherencia a formatos estructurados. No se especifica si se empleó RLHF, DPO u otro método de alineación; la documentación menciona una "alineación neutra" y una reducción de tasas de rechazo.

## Capacidades

- Generación de texto conversacional y asistencia general con alta capacidad de dirección (*steerability*).
- Razonamiento explícito en modo híbrido: el modelo decide cuándo deliberar internamente y puede emitir cadenas de pensamiento visibles.
- Soporte de *function calling* y uso de herramientas (tool use).
- Modo JSON y salidas estructuradas: genera objetos JSON válidos según esquemas y repara JSON malformados.
- Razonamiento avanzado en matemáticas, código, STEM y lógica, con mejoras declaradas frente a Hermes 3.
- Escritura creativa y respuestas subjetivas con razonamiento expresivo.
- Roleplaying y conversación larga (contexto extendido, aunque la longitud exacta no se documenta).
- Alineación neutra y baja tasa de rechazo en escenarios diversos (según RefusalBench).

## Casos de uso

- **Asistentes de soporte técnico**: puede gestionar conversaciones multi-turno con contexto largo y responder preguntas de resolución de problemas, manteniendo un tono útil y sin rechazos innecesarios gracias a su baja tasa de negativa.
- **Generación y revisión de código en pipelines CI/CD**: con soporte de *function calling*, puede integrarse en flujos automatizados para generar tests, parchear errores o documentar APIs, emitiendo salidas en JSON para su consumo por otras herramientas.
- **Extracción y normalización de datos estructurados**: su modo JSON garantiza que las respuestas cumplan esquemas definidos, ideal para convertir texto libre en registros estructurados en aplicaciones de ETL o RPA.
- **Agentes autónomos con razonamiento multi-paso**: el modo *thinking* permite planificar y ejecutar secuencias de acciones complejas (llamadas a APIs, búsquedas, cálculos) con deliberación interna antes de responder.
- **Creación de contenido creativo y narrativo**: su capacidad de razonamiento expresivo y roleplaying lo hace adecuado para generar guiones, diálogos o historias con coherencia y estilo controlable.
- **Prototipado rápido de chatbots personalizados**: su facilidad de dirección y alineación neutra permiten ajustar el comportamiento del modelo a valores específicos de una empresa sin necesidad de *fine-tuning* adicional.
- **Evaluación y análisis de problemas matemáticos o científicos**: con resultados sólidos en AIME, MATH-500 y GPQA, puede utilizarse como motor de razonamiento en herramientas educativas o de investigación.

## Benchmarks y rendimiento

Los siguientes resultados han sido declarados por el autor en la model card. El modelo-index oficial no incluye resultados propios.

| Benchmark | Hermes 4.3 36B Psyche | Hermes 4.3 36B Centralized | Hermes 4 70B Centralized |
|---|---|---|---|
| AIME 24 | 71,9 | 70,6 | 73,5 |
| AIME 25 | 69,3 | 66,8 | 67,4 |
| BBH | 86,4 | 84,7 | 87,8 |
| DROP | 83,5 | 81,6 | 85,0 |
| GPQA Diamond | 65,5 | 64,8 | 66,1 |
| IFEval | 77,9 | 73,9 | 78,7 |
| MATH-500 | 93,8 | 92,3 | 95,5 |
| MMLU | 87,7 | 86,5 | 88,4 |
| MMLU-Pro | 80,7 | 79,7 | 80,7 |
| MuSR | 69,7 | 64,7 | 70,4 |
| OBQA | 96,6 | 91,8 | 94,8 |
| SimpleQA | 6,0 | 5,6 | 17,9 |

En RefusalBench (porcentaje de preguntas respondidas, promedio de 5 pruebas), el modelo alcanza 74,60 % en modo no razonamiento y 72,29 % en modo razonamiento, superando a Hermes 4 70B (59,50 % razonando) y a modelos cerrados como GPT-4o (17,67 %) o Gemini 2.5 Pro (24,23 %).

## Requisitos de hardware

- VRAM estimada: con cuantización de 4 bits, aproximadamente 20-24 GB; con 8 bits, alrededor de 40 GB; en precisión fp16/bf16, unos 72 GB (tamaño del repo en safetensors).
- GPUs recomendadas: A100 80 GB, H100 80 GB o similares para fp16; RTX 4090 (24 GB) o RTX 6000 Ada (48 GB) con cuantización 4 u 8 bits.
- En GPU de consumo: cabe en una RTX 4090 con cuantización 4 bits, aunque con limitaciones de velocidad; para producción se recomienda al menos 48 GB de VRAM.
- Opciones de despliegue: vLLM, TGI, llama.cpp, Ollama (si se generan pesos GGUF), o Transformers con `transformers` nativo.
- Latencia y throughput: no disponibles en la documentación del modelo; dependerán de la cuantización, el hardware y el gestor de inferencia.

## Comparativa con modelos similares

La documentación solo proporciona comparativas internas con otros modelos de la familia Hermes. No se ofrecen datos frente a otros modelos de 36 B como Qwen2.5-32B o DeepSeek-R1-Distill-Qwen-32B.

| Modelo | Parametros | Contexto | Razonamiento | Licencia |
|---|---|---|---|---|
| Hermes 4.3 36B (este) | 36,1 B | No disponible | Hibrido (thinking) | Apache 2.0 |
| Hermes 4 70B (Nous Research) | 70 B | No disponible | Hibrido (thinking) | Apache 2.0 |
| ByteDance Seed-OSS-36B-Base (base) | 36,1 B | No disponible | No (base) | Apache 2.0 |

En los benchmarks declarados, Hermes 4.3 36B (Psyche) queda ligeramente por debajo de Hermes 4 70B en la mayoría de pruebas (p. ej., MMLU 87,7 vs 88,4; MATH-500 93,8 vs 95,5), pero supera a la versión Centralized del mismo tamaño. En RefusalBench, el modelo de 36 B supera claramente a Hermes 4 70B.

## Limitaciones y advertencias

- Rendimiento bajo en SimpleQA (6,0 en la versión Psyche), lo que indica una factualidad limitada en preguntas de conocimiento directo; riesgo de alucinación en datos objetivos.
- Idioma declarado únicamente inglés; no se garantiza un rendimiento adecuado en otros idiomas.
- Longitud de contexto no documentada; en producción debe verificarse empíricamente antes de confiar en conversaciones muy largas.
- El entrenamiento descentralizado a través de Psyche puede introducir variabilidad en la reproducibilidad de los resultados.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo base Seed-OSS-36B debe revisarse para confirmar que no arrastra restricciones adicionales.
- No se publican resultados oficiales en el modelo-index; los benchmarks citados provienen de la model card y no han sido verificados de forma independiente.
- La baja tasa de rechazo (RefusalBench) implica que el modelo puede generar contenido que otras plataformas considerarían sensible; conviene aplicar filtros adicionales según el caso de uso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Rampage1219hf/Hermes-4.3-36B
- Blog de Nous Research (introduccion de Hermes 4.3): https://nousresearch.com/introducing-hermes-4-3/
- Informe tecnico de Hermes 4 (arXiv): https://arxiv.org/abs/2508.18255
- Chat con Hermes (Nous Chat): https://chat.nousresearch.com
