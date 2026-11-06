# decido-ai/decido-1-pro

## Resumen

Decido-1-Pro es un sistema de decisión en inglés desarrollado por decido-ai que combina tres modelos mediante un enrutador entrenado: Decido-1 (clasificación de un solo token), Decido-1-Think (razonamiento con tope de 1.024 tokens) y Qwen3.8-27B-FP8 (razonamiento zero-shot con tope de 4.096 tokens). No es un modelo monolítico, sino una definición de mezcla: el repositorio contiene únicamente la configuración del enrutador y los parámetros de combinación (`pro_config.json`, `ens_params.json`), mientras que los tres componentes se descargan de sus propios repositorios.

El problema que aborda es la obtención de decisiones calibradas y trazables sobre documentos: clasificación, verificación de políticas, entailment, enrutamiento y triaje. Frente a un LLM conversacional, el sistema devuelve probabilidades calibradas y está pensado para ejecutarse con el paquete `decido`, no como un chat. Su relevancia actual radica en que declara superar a Jev 1.13 en las seis agrupaciones de benchmark utilizadas por la comunidad de reproducción de Jev, con una puntuación media de 89,57 frente a 83,85.

El sistema requiere GPU: una A100 de 80 GB o equivalente. Está construido sobre Decido-1-26B-A4B y Decido-1-Think-26B-A4B (ambos derivados de Gemma-4-26B-A4B) más Qwen3.8-27B-FP8, y se distribuye con licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla con enrutador (gated mixture) de tres modelos: Decido-1, Decido-1-Think y Qwen3.8-27B-FP8; enrutador con 11 características ajustado sobre datos de calibración gold held-out |
| Parametros totales | No disponible (depende de los tres componentes; los componentes Decido se basan en Gemma-4-26B-A4B y el tercero es Qwen3.8-27B-FP8) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible de forma explícita; los topes de generación son 1 token (Decido-1), 1.024 tokens (Think) y 4.096 tokens (Qwen) |
| Tipos de cuantizacion | No disponible; el componente Qwen se distribuye en FP8 |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible; el repositorio contiene definición de mezcla (`pro_config.json`, `ens_params.json`) y los componentes se descargan de sus repositorios |

## Arquitectura y entrenamiento

La arquitectura es una mezcla con compuerta: para cada pregunta, un enrutador pequeño de 11 características pondera las salidas de los tres componentes. Decido-1 produce una decisión de un solo token; Decido-1-Think aplica razonamiento con un tope de 1.024 tokens; Qwen3.8-27B-FP8 opera en modo zero-shot con esfuerzo medio y un tope de 4.096 tokens. El código de enrutamiento y combinación se copia literalmente del sistema evaluado y reproduce sus resultados publicados a partir de las salidas registradas de los componentes (85.721 de 85.721 preguntas idénticas). Los predictores de cada componente son el código vLLM evaluado, incluido sin modificaciones.

El entrenamiento del enrutador se ajustó sobre datos de calibración gold held-out. El autor declara que no se usaron salidas de Jev ni de Claude para el entrenamiento, y que no se entrenó sobre ningún split de test de los benchmarks, con compuertas de fuga por 13-gramas y coincidencia exacta. Sin embargo, el sistema es supervisado en dominio: se usaron splits de entrenamiento de varios datasets cuyos splits de test/evaluación forman parte de los grupos de benchmark (MASSIVE, VitaminC, tareas de Open-Jev). La misma receta sin ningún split de entrenamiento de un dataset puntuado obtiene 82,04, por debajo del 83,85 de Jev. El enrutador emplea una característica sensible al formato (`nli_layout`) y el 99,8% de las preguntas de estos benchmarks se enrutan a los componentes de razonamiento.

## Capacidades

- Clasificación de documentos con probabilidades calibradas (Brier y ECE reportados en cinco comprobaciones).
- Verificación de políticas y comprobaciones de cumplimiento sobre texto.
- Entailment y reconocimiento de inferencia en lenguaje natural.
- Enrutamiento y triaje de solicitudes o documentos hacia categorías predefinidas.
- Puntuación y rating de contenido con salida probabilística.
- Razonamiento zero-shot mediante el componente Qwen3.8-27B-FP8, con esfuerzo medio.
- Razonamiento con presupuesto acotado mediante Decido-1-Think (tope de 1.024 tokens).
- Decisiones de un solo token de baja latencia mediante Decido-1.
- Preguntas compuestas: 98,7% de acierto frente a 98,8% si se formulan por separado.
- Determinismo en vivo: 0 de 50 cambios de argmax.
- No es un modelo de chat ni un razonador general; el uso conversacional directo no proporciona probabilidades calibradas.

## Casos de uso

- Triaje de tickets de soporte: el sistema clasifica cada ticket en una categoría operativa y devuelve una probabilidad calibrada, lo que permite fijar umbrales de derivación a agentes humanos con una tasa de error controlada.
- Verificación de políticas internas: dado un documento y una regla, el modelo emite una decisión de cumplimiento con probabilidad asociada, adecuada para auditorías semiautomatizadas donde importa la confianza de cada veredicto.
- Moderación y rating de contenido: la salida probabilística permite priorizar revisiones humanas por nivel de confianza en lugar de por un corte binario.
- Enrutamiento de consultas en un pipeline RAG: el modelo decide a qué índice, herramienta o cola debe ir cada consulta, con la ventaja de que el enrutador combina señales de tres modelos y no solo de uno.
- Clasificación de documentos en ingesta masiva: con ~0,7 segundos de A100 por pregunta en lote, es viable procesar lotes grandes de documentos con decisiones calibradas por unidad.
- Evaluación de entailment en control de calidad de datos: comprobar si una afirmación se sigue de un documento fuente antes de publicarlo o indexarlo.
- Investigación en calibración: el sistema publica Brier y ECE frente a Jev en cinco comprobaciones, lo que lo hace útil como referencia reproducible para estudiar calibración en decisiones documentales.

## Benchmarks y rendimiento

Puntuación media de seis grupos (JevBench, Kev, OpenJev, Nimble, VitaminC, MASSIVE), con copias congeladas y el mismo arnés para todos los modelos:

| Grupo de benchmark | Decido-1-Pro (GPU) | Decido-1-Think (GPU) | Decido-1 (GPU) | Jev 1.13 (publicado) |
|---|---:|---:|---:|---:|
| JevBench | 99,32 | 94,33 | 88,17 | 87,18 |
| Kev | 86,37 | 85,63 | 84,46 | 85,52 |
| OpenJev (18 tareas) | 84,25 | 83,63 | 78,39 | 72,96 |
| Nimble | 92,55 | 92,55 | 88,65 | 91,84 |
| VitaminC | 85,81 | 86,98 | 87,15 | 78,46 |
| MASSIVE | 89,14 | 89,14 | 88,57 | 87,14 |
| Media de seis grupos | 89,57 | 88,71 | 85,90 | 83,85 |

Comparación pareada frente a Decido-1 en las mismas unidades: +3,72 (IC 95% +2,87 a +4,64). Intervalo de confianza del 95% de la media de seis grupos: 88,65–90,49.

Calibración (marca de verificación = igual o mejor que Jev):

| Comprobación (GPU) | Brier | Jev 1.13 | ECE | Jev 1.13 |
|---|---:|---:|---:|---:|
| JevBench | 0,039 ✓ | 0,181 | 0,073 | 0,032 |
| Kev v4 dev | 0,190 ✓ | 0,211 | 0,024 ✓ | 0,049 |
| Kev v9 dev | 0,209 ✓ | 0,212 | 0,020 ✓ | 0,034 |
| VitaminC | 0,210 ✓ | 0,313 | 0,024 ✓ | 0,104 |
| MASSIVE | 0,163 ✓ | 0,204 | 0,045 ✓ | 0,075 |

Brier igual o mejor que Jev en 5 de 5 comprobaciones (el margen en Kev v9 está dentro del ruido); ECE igual o mejor en 4 de 5 (en JevBench el sistema es infraconfiado: confianza media 0,918 frente a precisión 0,991). Inversiones por orden de opciones: 1–4% por suite (2,9% agrupado).

Coste en GPU: aproximadamente 0,7 segundos de A100 por pregunta en lote; la ejecución completa de las seis suites consumió unas 55 horas de GPU en una A100, dominadas por el prefill del modelo de razonamiento de 27B.

## Requisitos de hardware

- GPU: una A100 de 80 GB o equivalente. El sistema está marcado como solo GPU.
- No cabe en GPU de consumo: los tres componentes incluyen modelos de 26B-A4B y un 27B en FP8, por lo que no es viable en RTX 4090 ni en tarjetas de 24 GB.
- Despliegue: paquete `decido-ai[pro]` con vLLM; los componentes se cargan una vez por lote, en secuencia, mediante `predict_batch`.
- Latencia: ~0,7 segundos de A100 por pregunta en lote.
- Coste agregado: ~55 horas de A100 para las seis suites completas (85.721 preguntas).
- El repositorio no incluye pesos; requiere descargar los tres componentes desde sus repositorios.
- La ejecución empaquetada de tres etapas en GPU no se ha ejecutado todavía de extremo a extremo según el autor.

## Comparativa con modelos similares

| Modelo | Base | Hardware | Puntuación seis grupos | Licencia |
|---|---|---|---:|---|
| Decido-1-Pro | Decido-1 + Think + Qwen3.8-27B | GPU (1× A100 80 GB) | 89,57 (GPU) | Apache 2.0 |
| Decido-1-Think | Gemma-4-26B-A4B | GPU · CPU de portátil (lento) | 88,71 (GPU) | Apache 2.0 |
| Decido-1-XL | DeepSeek-V4-Flash | 4× A100 80 GB | 87,25 (GPU) | No disponible |
| Decido-1 | Gemma-4-26B-A4B | CPU de portátil (~30 GB RAM) · GPU | 85,38 (CPU) | Apache 2.0 |
| Jev 1.13 | No disponible | No disponible | 83,85 (publicado) | No disponible |

Dentro de la familia Decido, Pro es la variante de mayor precisión y también la más exigente en hardware. Frente a Decido-1-Think, la mezcla añade +0,86 puntos. La comparación con Jev debe leerse con cautela: los números de Jev provienen de la ejecución publicada por AutoTrust (dispersión entre ejecuciones de hasta 1,6 puntos), no de pasar Jev por el arnés del autor, y Jev fue evaluado zero-shot mientras que Decido-1-Pro es supervisado en dominio.

## Limitaciones y advertencias

- Solo inglés. No soporta otros idiomas.
- Entrenado para decisiones fundamentadas en documentos (clasificación, verificación de políticas, entailment, enrutamiento, triaje, rating). No es un modelo de chat ni un razonador general.
- El uso en chat directo no proporciona probabilidades calibradas; es necesario emplear el paquete `decido`.
- Supervisado en dominio: se usaron splits de entrenamiento de datasets cuyos splits de test están en los benchmarks. Sin esos datos, la receta obtiene 82,04, por debajo de Jev. El margen sobre Jev debe interpretarse como supervisado en dominio frente a zero-shot.
- Punto más débil: elección múltiple de conocimiento difícil (Kev v9, calibración peor que Jev) y aritmética de varios pasos.
- Las probabilidades están calibradas sobre tareas held-out, no sobre las tareas del usuario.
- La puntuación de JevBench (99,32) procede del componente Qwen zero-shot, no del entrenamiento de Decido; la mezcla sin enrutador obtiene 88,75.
- El enrutador usa una característica sensible al formato (`nli_layout`), lo que puede introducir dependencia del formato de entrada.
- Inversiones por orden de opciones del 1–4% por suite (2,9% agrupado): el orden de presentación de alternativas afecta a la decisión.
- La ejecución empaquetada de tres etapas en GPU no se ha validado de extremo a extremo; el autor pide reportar problemas.
- El repositorio no contiene pesos ni código de inferencia de los componentes; depende de la disponibilidad de los repositorios de terceros.
- Los resultados se obtuvieron con miradas intermedias a las suites de test durante la ejecución (la configuración se nombró y hasheó antes de la ejecución de paridad).
- Sin datos de sesgo publicados en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/decido-ai/decido-1-pro
- Decido-1: https://huggingface.co/decido-ai/decido-1-26b-a4b
- Decido-1-Think: https://huggingface.co/decido-ai/decido-1-think-26b-a4b
- Decido-1-Fast: https://huggingface.co/decido-ai/decido-1-fast-1.7b
- Decido-1-Ultra: https://huggingface.co/decido-ai/decido-1-ultra-0.6b
- Decido-1-XL: https://huggingface.co/decido-ai/decido-1-xl
- Qwen3.8-27B-FP8: https://huggingface.co/Qwen/Qwen3.8-27B-FP8
