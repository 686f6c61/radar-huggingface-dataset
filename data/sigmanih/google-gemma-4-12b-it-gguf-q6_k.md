# sigmanih/google-gemma-4-12B-it-GGUF-Q6_K

## Resumen

`google-gemma-4-12B-it-GGUF-Q6_K` es una cuantización en formato GGUF (variante Q6_K) del modelo `google/gemma-4-12B-it`, publicada por el usuario `sigmanih` a través de la herramienta Sigma Studio. No se trata de un modelo entrenado desde cero, sino de una redistribución cuantizada del modelo base de Google, orientada a inferencia local en GPU de consumo con un peso en disco de aproximadamente 9,8 GB y un requisito estimado de VRAM en torno a 10,7 GB para descarga completa en GPU.

El modelo base es un transformer causal de tipo decoder-only con 11.907.350.576 parámetros totales (aproximadamente 12B), ventana de contexto declarada de 32.768 tokens y capacidades conversacionales (sufijo `-it`). La model card del publicador declara soporte para inglés e italiano, aunque la información disponible no detalla la composición multilingüe real del entrenamiento original de Google.

La relevancia de esta ficha es doble: por un lado, documenta una opción práctica para desplegar un modelo de 12B en hardware de consumo; por otro, advierte de que los datos de benchmarks publicados en la model card proceden de una evaluación propia del publicador sobre subconjuntos reducidos de cada suite (entre 7 y 14 preguntas por benchmark), por lo que no son comparables con resultados de suite completa ni con las cifras oficiales de Google.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only (CausalLM), según model card del publicador |
| Parametros totales | 11.907.350.576 (~12B) |
| Parametros activos | no disponible (no se declara arquitectura MoE) |
| Longitud de contexto | 32.768 tokens (según model card del publicador) |
| Tipos de cuantizacion | GGUF Q6_K (esta publicación); otras variantes no disponibles |
| Idiomas soportados | en, it (según tags y model card) |
| Licencia | other (la model card incluye un badge Apache-2.0, pero el campo de licencia de Hugging Face es `other`; consultar los términos del modelo base de Google) |
| Formato de pesos | GGUF (Q6_K); el campo de formato en la model card aparece como "Sconosciuto/sconosciuta", inconsistente con el nombre del repositorio |
| Tamano del repositorio | 9,8 GB |
| Modelo base | google/gemma-4-12B-it |
| Descargas / likes | 724 / 2 |
| Fecha de creacion / actualizacion | 2026-08-31 / 2026-11-02 |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo base más allá de la etiqueta `CausalLM` y la indicación de que se trata de un transformer decoder-only de aproximadamente 12B parámetros. No se dispone de datos sobre número de capas, dimensión oculta, número de cabezas de atención, tipo de atención (completa, GQA, sliding window), función de activación ni normalización. Tampoco se documenta si el modelo base emplea mezcla de expertos: el recuento de parámetros totales coincide con el recuento de parámetros activos declarado (12B), lo que apunta a un modelo denso, pero no puede confirmarse con la información proporcionada.

Respecto al entrenamiento, no hay información sobre volumen de tokens, composición del corpus, fases de preentrenamiento, ajuste supervisado, RLHF o DPO. La model card del publicador no aporta detalles del proceso original de Google; únicamente documenta el proceso de cuantización y publicación mediante Sigma Studio. La innovación técnica atribuible a esta publicación concreta es la cuantización Q6_K en GGUF, que reduce el peso a 9,8 GB manteniendo una precisión nominal alta (6 bits por peso con escalas por bloque), y su integración declarada con el motor SigmaEngine para inferencia acelerada en GPU.

## Capacidades

- Generación de texto conversacional multi-turno en inglés e italiano, según los idiomas declarados.
- Razonamiento paso a paso: la model card documenta un modo "Deep Thinking" (cadena de pensamiento) con una mejora declarada de +3,6 puntos porcentuales frente al modo directo en su evaluación propia.
- Generación de código: se reportan resultados en HumanEval y MBPP dentro de la evaluación del publicador, aunque sobre subconjuntos muy reducidos.
- Razonamiento matemático: se reportan resultados en GSM8K y MATH, de nuevo sobre subconjuntos parciales.
- Tool calling y uso de agentes: la model card incluye una sección de protocolo agéntico con métricas de adherencia a herramientas y contención en sandbox.
- Capacidades multilingües limitadas a los idiomas declarados (en, it); no se documenta cobertura adicional.
- No se declaran capacidades de visión, audio ni multimodalidad en la información disponible.

## Casos de uso

- Asistente conversacional local en estación de trabajo: con 9,8 GB de pesos en Q6_K y unos 10,7 GB de VRAM estimados, el modelo puede ejecutarse íntegramente en una GPU de 12-16 GB, lo que permite desplegar un asistente privado sin dependencia de API externa.
- Generación de código en entornos con requisitos de privacidad: el formato GGUF y el soporte de llama.cpp u Ollama permiten integrar el modelo en flujos de autocompletado o revisión de código sin enviar el código fuente a terceros.
- Prototipado de agentes con tool calling: la model card declara soporte de adherencia a esquemas de herramientas y un sandbox de ejecución; útil para validar pipelines agénticos antes de migrar a modelos mayores.
- Atención al cliente en inglés e italiano: la ventana de 32.768 tokens permite mantener conversaciones multi-turno con historial extenso y documentación de contexto inyectada.
- Razonamiento matemático asistido: el modo de cadena de pensamiento está orientado a problemas de lógica y matemáticas, adecuado para herramientas internas de resolución de ejercicios o verificación de cálculos.
- Inferencia en CPU o híbrida: la model card estima unos 10,0 GB de RAM para ejecución CPU/híbrida, lo que permite desplegar el modelo en servidores sin GPU dedicada, con mayor latencia.
- Evaluación comparativa de cuantizaciones: al ser una variante Q6_K de un modelo base, sirve para medir la pérdida de calidad frente a pesos completos en tareas concretas del dominio propio.

## Benchmarks y rendimiento

Los datos siguientes proceden exclusivamente de la model card del publicador, evaluados con el motor SigmaEngine (temperatura 0.0, semilla 42) sobre subconjuntos parciales de cada suite. La propia model card advierte de que las puntuaciones no son comparables con ejecuciones de suite completa.

| Benchmark | Aciertos / total | Precision declarada |
|---|---|---|
| ARC-Challenge | 8 / 9 | 89% |
| BIG-Bench Hard | 6 / 7 | 86% |
| GPQA | 4 / 9 | 44% |
| GSM8K | 8 / 9 | 89% |
| HellaSwag | 5 / 9 | 56% |
| HumanEval | 7 / 7 | 100% |
| MATH | 8 / 9 | 89% |
| MBPP | 7 / 9 | 78% |
| MMLU | 8 / 14 | 57% |
| MMLU-Pro | 8 / 9 | 89% |
| TruthfulQA | 8 / 9 | 89% |
| Total agregado | 77 / 100 | 77% |

Comparativa de modos de razonamiento declarada por el publicador:

| Modo | Precision | Preguntas superadas |
|---|---|---|
| Sin razonamiento (respuesta directa) | 75,4% | 43 / 57 |
| Razonamiento CoT (Deep Thinking) | 79,1% | 34 / 43 |

Métricas del protocolo agéntico (sandbox del publicador):

| Metrica | Resultado |
|---|---|
| Adherencia al protocolo de herramientas | 56,5% |
| Finalizacion autonoma de tarea | 0,0% (0/1 escenarios) |
| Contencion en sandbox | 100% conforme |
| Eficiencia de ejecucion | 0 turnos (0,0 s) |

No se han publicado resultados de benchmarks oficiales del modelo base de Google en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 10,7 GB para descarga completa en GPU con Q6_K; unos 10,0 GB de RAM en modo CPU o híbrido, según la model card.
- GPU recomendadas por el publicador: 12-16 GB de VRAM, citando RTX 3060 y RTX 4070 como ejemplos.
- Cabe en GPU de consumo: sí, en tarjetas con 12 GB o más de VRAM (RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090). En tarjetas de 8 GB requeriría descarga parcial a RAM.
- Opciones de despliegue: llama.cpp, Ollama y otros runtimes compatibles con GGUF; la model card menciona además el motor propietario SigmaEngine y compatibilidad con endpoints. vLLM y TGI no se citan y su soporte de GGUF Q6_K no está confirmado en la información disponible.
- Latencia y throughput: no disponibles. La model card solo indica cualitativamente que el modo sin razonamiento tiene menor latencia y que el modo CoT añade sobrecarga por tokens de razonamiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| google-gemma-4-12B-it-GGUF-Q6_K (esta ficha) | ~12B | 32.768 | other | GGUF Q6_K | Cuantización de terceros; benchmarks parciales del publicador |
| google/gemma-4-12B-it (modelo base) | ~12B | no disponible en esta ficha | other | safetensors | Pesos completos; referencia para medir pérdida por cuantización |
| Otras cuantizaciones GGUF del mismo base | ~12B | 32.768 (heredado) | other | GGUF (Q4, Q5, Q8, etc.) | No disponibles en la información proporcionada |

No se dispone de datos de benchmarks comparables de modelos alternativos de la misma categoría en la información proporcionada, por lo que no se incluye comparación de rendimiento.

## Limitaciones y advertencias

- Los benchmarks publicados proceden de subconjuntos muy reducidos (entre 7 y 14 preguntas por suite) y no son comparables con resultados de suite completa ni con cifras oficiales; el 100% en HumanEval sobre 7 preguntas no es estadísticamente significativo.
- El resultado de finalización autónoma de tareas agénticas es 0,0% (0 de 1 escenarios) y la adherencia al protocolo de herramientas es del 56,5%, lo que desaconseja su uso en agentes autónomos en producción sin validación adicional.
- La model card contiene inconsistencias: declara formato de pesos "Sconosciuto" pese a ser un GGUF Q6_K, indica un tamaño en disco de "0.0 GB" frente a los 9,8 GB reales del repositorio, y mezcla un badge Apache-2.0 con un campo de licencia `other`. Debe verificarse la licencia aplicable antes de cualquier uso comercial.
- La licencia del modelo base de Google es `other`; los términos de uso de Gemma pueden imponer restricciones adicionales que prevalecen sobre cualquier declaración del publicador de la cuantización.
- Idiomas declarados limitados a inglés e italiano; el rendimiento en castellano no está documentado y no debe asumirse.
- Riesgo de alucinación inherente a modelos de 12B; el resultado declarado en TruthfulQA (89% sobre 9 preguntas) no es evidencia suficiente para descartarlo.
- No hay información sobre sesgos del modelo base ni sobre evaluación de seguridad en la documentación disponible.
- El repositorio tiene un volumen bajo de descargas (724) y likes (2), y procede de un publicador individual, no de Google; no hay garantía de mantenimiento ni de correspondencia exacta con los pesos oficiales.
- El soporte en vLLM y TGI no está confirmado; el despliegue en producción a gran escala requeriría validar el runtime.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sigmanih/google-gemma-4-12B-it-GGUF-Q6_K
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Repositorio Sigma Studio: https://github.com/Sigmanih/SigmaStudio
- Perfil del publicador en Hugging Face: https://huggingface.co/sigmanih
