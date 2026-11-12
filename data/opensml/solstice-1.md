# OpenSML/Solstice-1

## Resumen

Solstice-1 es un modelo de lenguaje de 174.202.432 parámetros (175M redondeados) desarrollado por OpenSML (William Zebrowski) y entrenado desde cero sobre cinco equipos Apple Silicon. Se trata de un modelo conversacional en inglés, orientado a investigación, que combina 42.001.367.040 posiciones de token de preentrenamiento con tres etapas de fine-tuning mediante adaptadores para conversaciones cortas, comprensión lectora y seguimiento de instrucciones.

El modelo emplea una arquitectura transformer densa de 44 capas con anchura oculta de 576, atención con 9 cabezas de consulta y 3 de clave/valor (GQA), SwiGLU, RoPE con base 10.000, RMSNorm, normalización Q/K y embeddings atados. Su ventana de contexto es de 2.048 tokens, incluyendo historial de conversación y salida generada, y utiliza un tokenizador BPE a nivel de byte de 32.000 tokens reutilizado de OpenSML.

Su relevancia radica en ser un ejercicio de entrenamiento reproducible desde cero en hardware de consumo (Mac), con pesos FP32 fusionados, runner nativo en MLX, registros de entrenamiento y resultados de evaluación publicados. Compite en la categoría de modelos pequeños (por debajo de 200M parámetros) frente a referencias como SmolLM2-135M o OpenSML-150M, con licencia Apache-2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (44 capas, hidden 576, SwiGLU 1.536) |
| Parámetros totales | 174.202.432 (175M redondeados) |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | 2.048 tokens (incluye historial y salida generada) |
| Tipos de cuantización | no disponible (release en FP32; librería MLX) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (FP32 fusionado), nativo MLX en Apple Silicon |

## Arquitectura y entrenamiento

Solstice-1 es un transformer denso decoder-only de 44 capas con anchura oculta de 576 y anchura SwiGLU de 1.536. La atención usa 9 cabezas de consulta y 3 cabezas de clave/valor con dimensión de cabeza 64 (atención con query grouping), e incorpora RoPE con base 10.000, RMSNorm, normalización de Q/K y embeddings atados entre entrada y salida. El tokenizador es un BPE a nivel de byte de 32.000 tokens reutilizado de OpenSML, aunque el autor aclara que el linaje de pesos es independiente de OpenSML-150M y OpenSML-JSONLite-175M.

El preentrenamiento parte de pesos aleatorios y consume 42.001.367.040 posiciones de token procesadas, con secuencias de 2.048 tokens. El cómputo se realiza en BF16 con pesos maestros, gradientes y estado del optimizador en FP32, distribuido sobre cinco workers Apple Silicon. Los datos provienen de smollm-corpus, dclm-edu, finewiki, stack_edu_python, stack_edu_sql, SynSQL-2.5M, smol-smoltalk, smoltalk, squad_v2 y sciq. Tras el preentrenamiento se aplican tres etapas de fine-tuning con adaptadores orientadas a conversación corta, comprensión lectora y seguimiento de instrucciones.

## Capacidades

- Generación de texto conversacional en inglés para turnos cortos.
- Seguimiento de instrucciones explícitas (evaluado con IFEval).
- Comprensión lectora y respuesta a preguntas sobre pasajes (entrenado con SQuAD v2 y SciQ).
- Conocimiento factual y de sentido común a pequeña escala (evaluado en ARC Easy, ARC Challenge, PIQA y HellaSwag).
- Generación de código y SQL a nivel introductorio (datos stack_edu_python, stack_edu_sql, SynSQL-2.5M).
- Parada natural de respuesta (99,48% en el panel de conversación propio).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: solo inglés.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Prototipado de chatbots de dominio acotado: con 2.048 tokens de contexto puede mantener conversaciones multi-turno breves en inglés, adecuado para demos y pruebas de concepto en las que el coste de inferencia debe ser mínimo.
- Investigación sobre entrenamiento desde cero: los registros de entrenamiento, el runner MLX y los scripts de evaluación publicados permiten reproducir y auditar el pipeline completo en hardware Apple Silicon.
- Evaluación comparativa de modelos pequeños: sirve como baseline reproducible en la franja de 135M-175M parámetros para experimentos académicos sobre tokenización, curriculums de datos y etapas de SFT.
- Respuesta a preguntas sobre documentos cortos: su entrenamiento con SQuAD v2 y SciQ lo hace utilizable para extracción de respuestas en pasajes de menos de 2.000 tokens, por ejemplo en asistentes de documentación técnica.
- Generación asistida de código y SQL elemental: puede emplearse como autocompletado o generador de consultas simples en entornos de formación, integrado en editores o notebooks, dado su entrenamiento con stack_edu_python, stack_edu_sql y SynSQL-2.5M.
- Despliegue en Apple Silicon para inferencia local: al publicarse en formato MLX nativo, es adecuado para aplicaciones de escritorio o prototipos en macOS que requieran ejecución offline sin GPU dedicada.
- Filtrado y clasificación de texto ligero: su reducido tamaño permite ejecutarlo en paralelo con modelos mayores como preprocesador o generador de borradores en pipelines de bajo coste.

## Benchmarks y rendimiento

Resultados de conocimiento y sentido común (porcentajes, acc / acc_norm; mayor es mejor):

| Benchmark | Solstice-1 | OpenSML-150M | SmolLM2-135M |
|---|---|---|---|
| ARC Easy | 62,58 / 62,33 | 56,65 / 55,43 | 54,00 / 48,82 |
| ARC Challenge | 29,35 / 30,89 | 26,02 / 29,52 | 25,94 / 27,73 |
| PIQA | 66,49 / 66,21 | 64,53 / 64,09 | 66,70 / 66,76 |
| HellaSwag | 32,85 / 39,40 | 30,55 / 33,94 | 35,02 / 42,90 |

Resultados de seguimiento de instrucciones (IFEval, accuracy):

| Métrica | Solstice-1 | OpenSML-150M | SmolLM2-135M |
|---|---|---|---|
| Strict prompts | 17,93% | 15,16% | 21,63% |
| Strict instructions | 30,10% | 25,30% | 35,85% |
| Loose prompts | 19,22% | 15,71% | 22,55% |
| Loose instructions | 32,49% | 25,78% | 37,29% |

Comprobaciones de conversación (panel propio):

| Medida | Solstice-1 |
|---|---|
| Precisión de respuesta, casos objetivos | 59,44% |
| Parada natural, todas las respuestas | 99,48% |
| Marcas de repetición, todas las respuestas | 1,56% |

En un test reservado propio, Solstice alcanza 51,9% frente a 20,0% tras SFT 1 y 25,9% tras SFT 2. En un panel anterior reutilizado los valores son 53,84%, 52,13% y 54,55%, de modo que la última etapa no mejora todas las métricas. El autor advierte que las diferencias con SmolLM2 no se han sometido a test de significación estadística y que los protocolos de evaluación difieren (greedy, sin system message ni penalización de repetición, tope de 1.024 tokens frente a 1.280 en las referencias).

## Requisitos de hardware

- VRAM estimada para inferencia: con 174,2M parámetros en FP32 los pesos ocupan aproximadamente 0,7 GB; en BF16 unos 0,35 GB; en cuantización de 8 bits unos 0,17 GB y en 4 bits unos 0,09 GB (estimaciones a partir del recuento de parámetros, no publicadas por el autor).
- GPU recomendadas: el release está orientado a Apple Silicon mediante MLX; no se documentan requisitos para GPU NVIDIA.
- Cabe en GPU de consumo: sí, por tamaño; en el ecosistema Apple funciona en cualquier Mac con memoria unificada suficiente (el repo ocupa 0,7 GB). En NVIDIA, cualquier GPU con 2 GB o más podría alojarlo en BF16, aunque no es el formato de referencia.
- Opciones de despliegue: MLX (librería nativa del release); vLLM, llama.cpp, Ollama y TGI no están documentados para este modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Punto fuerte (según benchmarks publicados) |
|---|---|---|---|---|
| Solstice-1 | 174,2M | 2.048 | Apache-2.0 | ARC Easy y ARC Challenge; parada natural en conversación |
| OpenSML-150M | ~150M | no disponible | Apache-2.0 (según card) | Inferior a Solstice-1 en todas las métricas reportadas |
| SmolLM2-135M-Instruct | 135M | no disponible en la información | no disponible en la información | Mejor IFEval y HellaSwag; PIQA prácticamente empatado |

Solstice-1 supera a OpenSML-150M en ARC Easy, ARC Challenge, PIQA, HellaSwag e IFEval, y supera a SmolLM2-135M en ARC Easy y ARC Challenge, pero queda por debajo en HellaSwag, PIQA (muy ajustado) e IFEval. Las comparaciones no cuentan con test de significación estadística y los protocolos de evaluación difieren.

## Limitaciones y advertencias

- Modelo de 175M parámetros: la capacidad de razonamiento, conocimiento factual y coherencia en contextos largos es limitada; no es adecuado para tareas que requieran precisión factual alta sin verificación.
- Riesgo de alucinación elevado, inherente a su escala y a su entrenamiento mayoritariamente de dominio general.
- Contexto de solo 2.048 tokens, que incluye historial y salida generada, lo que restringe conversaciones largas y documentos extensos.
- Solo soporta inglés; no se documenta rendimiento en otros idiomas.
- En IFEval queda por debajo de SmolLM2-135M-Instruct en todas las métricas reportadas (strict y loose, prompts e instrucciones).
- La tercera etapa de SFT no mejora todas las métricas en el panel reutilizado (54,55% frente a 52,13% de la etapa 2), lo que sugiere saturación o sobreajuste en algunas dimensiones.
- El 24% de los prompts de IFEval (130 de 541) alcanzan el tope de 1.024 tokens de salida, lo que puede penalizar la puntuación.
- Licencia Apache-2.0: permite uso comercial, pero el autor lo etiqueta como "research preview"; conviene validar el comportamiento en el dominio de destino antes de producción.
- Despliegue documentado únicamente en MLX/Apple Silicon; el soporte en otros runtimes no está garantizado.
- El modelo tiene 2 descargas y 0 likes en Hugging Face en el momento de la consulta, por lo que la validación por parte de la comunidad es prácticamente inexistente.

## Enlaces

- Hugging Face: https://huggingface.co/OpenSML/Solstice-1
- Código fuente: https://github.com/williamzebrowskI/Solstice-1
- Guía de ejecución: RUN_GUIDE.md (en el repositorio)
- Informe técnico: docs/TECHNICAL_REPORT.md (en el repositorio)
- Evaluación: docs/EVALUATION.md (en el repositorio)
- Datos: docs/DATA.md (en el repositorio)
- Resultados de baseline SmolLM2: results/baselines/smollm2_independent.json (en el repositorio)
- Referencias de modelos publicados: results/baselines/published_models.json (en el repositorio)
- Panel de conversación: results/public/chat/results.json (en el repositorio)
- Model card de OpenSML-150M: https://huggingface.co/OpenSML/OpenSML-150M
- Evaluación independiente de SmolLM2 (PetitGPT): https://github.com/yangqi0/petitgpt/blob/a129f3b709d44ad6a53aef0d44a7054281099df2/README.md#results-at-a-glance
