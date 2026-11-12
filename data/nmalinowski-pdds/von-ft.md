# nmalinowski-pdds/von-ft

## Resumen

von-ft es un ajuste fino (fine-tune) del modelo Von, un clasificador de decisión no autorregresivo construido sobre el backbone ModernBERT-large y una cabeza de puntuación denominada Option-Marker. Con 394.781.696 parámetros, el modelo no genera texto libre: su función es puntuar opciones discretas y emitir decisiones etiquetadas, lo que lo sitúa en la categoría de "modelos de sistema 1" para orquestación de agentes. Lo publica el usuario nmalinowski-pdds y se distribuye con licencia Apache-2.0.

El modelo está entrenado específicamente para un harness de orquestación de agentes: enrutado de modelo (dominio, dificultad, riesgo, esfuerzo, modelo destino), decisiones de estado (estado del turno, resultado de subagente, etiquetas de línea rápida, saltos de fase), señales de nivel y evaluación de contratos. Resuelve el problema de tomar decisiones rápidas y baratas dentro de un pipeline de agentes sin recurrir a un LLM generativo, manteniendo la misma arquitectura y protocolo de comunicación que el Von original.

Es relevante ahora porque propone un patrón distinto al de los LLM generativos para tareas de clasificación y enrutado: un encoder bidireccional con una cabeza de puntuación de opciones, calibración de confianza explícita y una latencia previsible. El checkpoint se inicializa desde von-1.2 y se entrena sobre un corpus privado de 18.892 filas, con una precisión del 75,41% en una partición de validación de 2.200 filas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT-large (encoder transformer bidireccional) con cabeza Option-Marker de puntuación de opciones; no autorregresivo |
| Parametros totales | 394.781.696 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de ModernBERT-large) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (model.safetensors), option_marker.pt, marker_calibration.json |

## Arquitectura y entrenamiento

von-ft emplea un backbone ModernBERT-large, un encoder transformer bidireccional, sobre el que se monta una cabeza de puntuación Option-Marker que evalúa un conjunto de opciones discretas en lugar de generar tokens secuencialmente. El modelo es no autorregresivo y utiliza atención `independent_options` junto con tokenización digit-split, de modo que cada opción se puntúa de forma independiente. La salida es una distribución sobre las opciones candidatas, no una secuencia de texto.

El entrenamiento consistió en 2 épocas sobre 18.892 filas (4.354 pasos de optimizador, batch efectivo de 16) con etiquetas one-hot duras, partiendo del checkpoint von-1.2 (no de una continuación del von-ft anterior). Los datos de entrenamiento no se publican: se construyeron a partir de registros de sesión privados más filas sintéticas verificadas. La validación se realizó sobre 2.200 filas retenidas, agrupadas para que ninguna sesión o cambio aparezca en ambos lados, alcanzando un 75,41% de precisión global. Incluye un mapa de calibración ajustado (`marker_calibration.json`) con una temperatura única T = 2.0, que reduce el error de calibración esperado de 0,10 a 0,03 sin alterar las respuestas, solo la confianza declarada.

## Capacidades

- Clasificación de decisión multiopción: enrutado de modelo (dominio, dificultad, riesgo, esfuerzo y modelo destino) mediante puntuación de opciones.
- Decisiones de estado en orquestación de agentes: estado del turno, resultado de subagente, etiquetas flash-line y saltos de fase.
- Evaluación de contratos (contract judging) para roles como qa-engineer, security-review y reviewer.
- Señales de nivel (tier signals) para políticas de enrutado.
- Clasificación zero-shot mediante la pipeline `zero-shot-classification` de Hugging Face.
- Confianza calibrada: las respuestas con confianza igual o superior a 0,7 son correctas entre el 91% y el 99% del tiempo en dominio, evaluación de contratos, main-model y crosses-boundary.
- No soporta generación de texto, tool calling generativo ni razonamiento multi-paso autorregresivo; su interfaz es la puntuación de opciones.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Enrutado de modelo en un harness de agentes: el modelo recibe el contexto de la sesión y puntúa qué modelo destino, nivel de esfuerzo y dominio corresponden, sustituyendo una llamada a un LLM generativo por una inferencia de encoder de 395M parámetros con latencia baja y predecible.
- Evaluación de contratos de subagentes: en pipelines donde un subagente qa-engineer o security-review debe validar su salida contra un contrato, von-ft juzga el cumplimiento con un 88-91% de precisión en las pruebas sintéticas reportadas, integrándose como paso de verificación previo a la aceptación del resultado.
- Control de estado de conversación: decidir si un turno ha terminado, si un subagente ha devuelto un resultado válido o si debe saltarse una fase, con un 84% de precisión en la porción real de turn-status, lo que permite orquestar flujos multi-paso sin coste de generación.
- Clasificación de dominio y dificultad para políticas de coste: estimar la banda de dificultad (1-4, 5-6, 7-8, 9-10) y el nivel de riesgo (lite vs full) para decidir si se escala a un modelo mayor o se mantiene en uno pequeño; útil en plataformas que optimizan coste por consulta.
- Gate de confianza en producción: usando la calibración incluida, aceptar automáticamente decisiones con confianza alta (≥0,7, con 91-99% de acierto en varias tareas) y derivar a revisión humana o a un LLM mayor las de baja confianza, reduciendo falsos positivos en automatización.
- Servicio de decisión dedicado: desplegado con `von serve` (SDK von-sdk) como microservicio HTTP en el puerto 8001, actuando como componente de enrutado de baja latencia dentro de una arquitectura de agentes existente que ya hable el protocolo de Von.

## Benchmarks y rendimiento

Resultados sobre la partición retenida, separando filas reales y sintéticas, comparando el Von por defecto con von-ft:

| Decisión | Filas | Von por defecto | von-ft |
|---|---|---|---|
| dificultad, real, por banda | 141 | 40% | 67% |
| riesgo, real, lite vs full | 140 | 49% | 78% |
| juez de contrato qa-engineer (sintético) | 80 | 35% | 88% |
| juez de contrato security-review (sintético) | 92 | 37% | 91% |
| juez de contrato reviewer, real | 64 | 27% | 91% (balanced accuracy 71%) |
| main-model, real | 59 | 2% | 78% |
| main-effort, real | 59 | 20% | 73% |
| dominio, real | 133 | 62% | 92% |
| turn-status, real | 68 | 38% | 84% |
| crosses-boundary, real | 18 | 89% | 89% (2 positivos reales, ambos fallados) |

La precisión exacta en 10 vías para dificultad y riesgo es mucho menor (aproximadamente 40% y 36% en filas reales). JevBench no se ha vuelto a ejecutar sobre este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 394,8M parámetros, en fp32 el peso ronda 1,6 GB, en fp16 unos 0,8 GB y en int8 unos 0,4 GB, sin contar activaciones ni la cabeza Option-Marker.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, cualquier GPU consumer con 4 GB o más de VRAM debería alojar el modelo en fp16.
- Cabe en GPU consumer: sí, por el tamaño del modelo (395M), aunque el autor no publica requisitos oficiales.
- Opciones de despliegue: el autor documenta `von serve` mediante `pip install von-sdk` y la variable `VON_CHECKPOINT_DIR`; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| von-ft | 394,8M | no disponible | Clasificación de decisión / enrutado | Apache-2.0 | Hugging Face (31 descargas) |
| Von (wfzyx/von) | 395M | no disponible | Clasificación de decisión / enrutado | Apache-2.0 (heredada) | Hugging Face |
| ModernBERT-large (answerdotai) | no disponible | no disponible | Encoder generalista | Apache-2.0 | Hugging Face |

No se dispone de datos de benchmarks comparativos con alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Varias porciones reales de la validación son pequeñas (decenas de filas), por lo que las cifras de precisión tienen alta varianza.
- Los jueces de contrato de qa-engineer y security-review se validaron únicamente sobre filas sintéticas.
- El conjunto real de reviewer es casi todo aprobaciones, lo que limita la representatividad de su balanced accuracy (71%).
- En crosses-boundary solo hay 2 positivos reales y ambos se fallaron, por lo que la métrica del 89% no es fiable para esa tarea.
- JevBench no se ha re-ejecutado sobre este checkpoint; los números del von-ft anterior no aplican.
- El modelo solo soporta inglés y no genera texto: no sirve para tareas generativas, tool calling ni razonamiento autorregresivo.
- Riesgo de alucinación: al ser un clasificador, el riesgo se manifiesta como decisiones erróneas con confianza alta; la calibración mitiga pero no elimina este problema.
- Los datos de entrenamiento no se publican (registros privados más filas sintéticas), lo que dificulta auditar sesgos y composición del corpus.
- Licencia Apache-2.0 permite uso comercial, pero se hereda de ModernBERT y Von; conviene verificar las condiciones de esos modelos base.
- Depende del SDK propietario `von-sdk` y de archivos adicionales (`option_marker.pt`, `marker_calibration.json`) que no deben eliminarse del despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nmalinowski-pdds/von-ft
- Modelo base Von: https://huggingface.co/wfzyx/von
- Repositorio del SDK y protocolo: https://github.com/wfzyx/von
- Modelo base ModernBERT-large: https://huggingface.co/answerdotai/ModernBERT-large
