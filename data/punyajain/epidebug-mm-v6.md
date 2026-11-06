# punyajain/epidebug-mm-v6

## Resumen

epidebug-mm-v6 es un modelo de puntuación (option scorer) desarrollado por el usuario punyajain y publicado en Hugging Face bajo licencia MIT. No se trata de un modelo generativo, sino de un cabezal de clasificación de elección múltiple (multiple-choice) construido sobre all-MiniLM-L6-v2 congelado, diseñado para tareas de diagnóstico dentro del proyecto "epidebug": seleccionar hipótesis, preguntas de seguimiento (follow-up) y causas a partir de interacciones.

La versión 6 introduce dos mejoras principales sobre la v5: un esquema de debiasing basado solo en las opciones (product-of-experts con un cabezal de sesgo entrenado en tiempo de entrenamiento y un adversario con inversión de gradiente) y calibración por escalado de temperatura ajustada en validación. El modelo es minúsculo: 1.224.109 parámetros en total (solo los pesos entrenables del cabezal, ya que el encoder base está congelado), lo que lo hace trivial de desplegar en CPU.

Su relevancia es principalmente de nicho: es un checkpoint experimental de investigación con benchmark interno, sin descargas registradas, útil para reproducir o evaluar técnicas de debiasing en scorers de opciones más que para uso productivo general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Scorer de opciones (product-of-experts debiased) sobre all-MiniLM-L6-v2 congelado |
| Parametros totales | 1.224.109 (solo cabezal entrenable; el encoder base no cuenta) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Heredada de all-MiniLM-L6-v2 (256 tokens, no confirmada en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (presumiblemente inglés, por el encoder base) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un cabezal de interacción (interaction-only) que puntúa pares pregunta-opción sobre representaciones de all-MiniLM-L6-v2 congelado. Es invariante al orden de las opciones, lo que se garantiza mediante una pérdida de consistencia bajo permutaciones y se verifica con una sonda específica. El entrenamiento utiliza negativos por intercambio de evidencia (evidence-swap negatives) para que el modelo dependa realmente del contenido y no de atajos superficiales.

La innovación central de la v6 es el debiasing "option-only": se entrena un cabezal de sesgo que ve únicamente el texto de las opciones (embedding más características de estilo relativas por fila: rango de longitud, número de comas, dígitos y marcadores de hedging). El scorer principal se entrena sobre `main + log p_bias.detach()`, de modo que solo aprende a explicar lo que el estilo de la opción no puede. Un adversario con inversión de gradiente (λ=0.3) intenta predecir la opción correcta a partir de las proyecciones del scorer, penalizando los atajos. Ambos cabezales se descartan en inferencia. Además, se aplica calibración por temperatura ajustada en validación (0,99 para hipótesis, 0,94 para follow-up y 4,32 para causa), almacenada en el buffer `T` y ya aplicada a las salidas. El checkpoint seleccionado corresponde a la semilla 11, época 22, elegido por puntuación de validación, y debe cargarse con `ckpt/v4.py`.

## Capacidades

- Puntuación de opciones de elección múltiple en tres tareas: selección de hipótesis (hyp), pregunta de seguimiento (follow-up) e identificación de causa (cause).
- Invariancia al orden de las opciones: produce predicciones idénticas bajo cualquier permutación (verificado con sonda).
- Salidas calibradas: temperaturas ajustadas en validación y ya aplicadas, con ECE reducido respecto a la v5.
- Resistencia parcial a atajos de estilo gracias al debiasing option-only y al adversario con inversión de gradiente.
- No genera texto libre, no soporta tool calling, no tiene capacidades de visión ni audio.

## Casos de uso

- Depuración de pipelines de diagnóstico automático: el modelo puede re-ranquear hipótesis candidatas generadas por otro sistema, eligiendo la más plausible dada la evidencia disponible.
- Selección de preguntas de seguimiento en asistentes médicos o de soporte: dada una conversación, puntúa qué pregunta de aclaración es más informativa antes de cerrar un diagnóstico.
- Atribución de causas en análisis de fallos: identifica la causa más probable de un error a partir de la evidencia recogida, útil en post-mortems automatizados.
- Investigación en debiasing de clasificadores multiple-choice: sirve como baseline reproducible para estudiar cuánto dependen los scorers de atajos superficiales (longitud, dígitos, hedging) frente al contenido.
- Evaluación de calibración en clasificadores pequeños: las temperaturas publicadas y los valores de ECE permiten comparar técnicas de calibración en regímenes de pocos parámetros.
- Componente ligero en producción con recursos mínimos: con ~1,2 M de parámetros entrenables y un encoder de 22 M congelado, puede ejecutarse en CPU sin GPU dedicada.

## Benchmarks y rendimiento

Resultados del benchmark interno v2.4 (test n=337; benchmark interno, no público). Las métricas son exactitud por tarea y Expected Calibration Error:

| Modelo | hyp | follow-up | cause | ECE hyp / fu / cause |
|---|---|---|---|---|
| v5 | 0,401 | 0,472 | 0,549 | 0,121 / 0,151 / 0,325 |
| **v6** | **0,478** | **0,665** | **0,585** | **0,091 / 0,037 / 0,139** |
| Mejor baseline superficial | 0,211 | 0,377 | — | — |
| option-only style_gb (data probe) | 0,389 | 0,579 | — | — |

Advertencia importante de memorización publicada por el autor: 75 de los 337 golds de hipótesis del test también aparecen en el entrenamiento. Sobre esas filas v6 alcanza 0,933 hyp / 0,987 fu (v5: 0,840 / 0,773); sobre las 262 filas sin solapamiento, v6 baja a 0,347 / 0,573 (v5: 0,275 / 0,385). Gran parte del número titular de hyp proviene de las filas con solapamiento.

Sondas adicionales (cambio en exactitud hyp): evidencia en blanco −0,240; intercambio de evidencia −0,318; inserción de la causa correcta en la evidencia +0,300. La sonda de permutación da predicciones idénticas en todos los órdenes. En pares de captions (n=24, privado), v6 obtiene 0,667 frente a 0,917 de la v5, una regresión en ese conjunto pequeño, sin flips entre los 8 pares clean-correct.

## Requisitos de hardware

- VRAM estimada para inferencia: mínima. Con ~1,2 M de parámetros entrenables más all-MiniLM-L6-v2 (~22 M de parámetros congelado), el modelo completo ocupa menos de 200 MB en precisión FP32 y funciona cómodamente en CPU sin GPU.
- GPU recomendadas: no se requiere ninguna; si se usa GPU, cualquier GPU moderna (incluso integrada o una GTX 1050) es más que suficiente.
- Consumer GPUs: cabe sobradamente en cualquier GPU de consumo; el hardware no es un factor limitante.
- Opciones de despliegue: no es un modelo generativo, por lo que vLLM, TGI u Ollama no aplican directamente. Debe cargarse con el script `ckpt/v4.py` indicado por el autor, usando PyTorch y la librería sentence-transformers para el encoder base.
- Latencia y throughput: no disponibles; dada la arquitectura (MiniLM congelado + cabezal lineal pequeño), se esperan latencias de milisegundos por opción en CPU, pero no hay medidas publicadas.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros entrenables | Tarea | Licencia |
|---|---|---|---|---|
| punyajain/epidebug-mm-v6 | Scorer multiple-choice sobre MiniLM congelado | 1,22 M | Diagnóstico (hyp, follow-up, cause) | MIT |
| punyajain/epidebug-mm-v5 (versión anterior) | Scorer interaction-only sin debiasing | no disponible | Mismas tareas | no disponible |
| all-MiniLM-L6-v2 (encoder base) | Encoder de frases | 22 M | Embeddings generales | Apache 2.0 |

No hay otros modelos públicos comparables directamente en la categoría de scorers de diagnóstico con debiasing; la comparación más relevante es con la propia v5 del mismo autor, que v6 supera en todas las tareas del benchmark interno salvo en el conjunto privado de caption pairs.

## Limitaciones y advertencias

- Memorización documentada: 75 de los 337 golds de hipótesis del test aparecen también en entrenamiento. En filas sin solapamiento, la exactitud hyp cae de 0,933 a 0,347. Los números titulares deben interpretarse con esta advertencia.
- Dependencia residual del estilo: la exactitud hyp sigue siendo mayor cuando el probe de estilo acierta (0,534) que cuando falla (0,442). El gap se redujo respecto a v5 pero no desapareció.
- Regresión en caption pairs: v6 obtiene 0,667 frente a 0,917 de v5 en un conjunto privado de 24 pares, aunque sin flips entre los 8 pares clean-correct.
- Benchmark interno y no público: los resultados no son verificables externamente y no son comparables con benchmarks estándar (MMLU, HumanEval, etc.).
- Ámbito muy estrecho: el modelo solo puntúa opciones predefinidas; no genera texto ni razonamiento libre.
- Sesgos: al entrenar sobre datos de diagnóstico con solapamiento entre train y test, existe riesgo de sesgo hacia patrones memorizados del dataset; el debiasing option-only mitiga pero no elimina los atajos superficiales.
- Licencia: MIT permite uso comercial sin restricciones relevantes, pero el encoder base all-MiniLM-L6-v2 se distribuye bajo Apache 2.0, compatible igualmente con uso comercial.
- Idiomas: no especificados en la model card; dado el encoder base, el rendimiento fuera del inglés no está evaluado.
- Alucinación: no aplicable como tal al no ser generativo, pero puede asignar puntuaciones altas a opciones incorrectas si la evidencia es ambigua, como muestran las sondas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/punyajain/epidebug-mm-v6
- Encoder base: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- Paper, repositorio de código y demo: no disponibles
