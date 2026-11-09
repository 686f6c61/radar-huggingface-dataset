# safewaterline/risk-model

## Resumen

Risk-model es un adaptador LoRA entrenado sobre Qwen3.8-27B por el equipo de safewaterline (Pran-Ker), una firma dedicada a la organización de préstamos con garantía de activos (asset-based lending). El modelo responde a una única pregunta de crédito formulada sobre informes trimestrales 10-Q presentados ante la SEC: si el prestatario en cuestión presentará un 8-K con la partida 1.03 (declaración de quiebra o concurso) en los 365 días siguientes a la fecha de presentación del 10-Q. La innovación central consiste en extraer la probabilidad de un único token de respuesta (softmax sobre dos tokens "sí"/"no") en lugar de pedir al modelo que redacte un número, y en entrenar el adaptador usando el Brier score como función de pérdida directamente sobre esa probabilidad.

El conjunto de entrenamiento se construyó íntegramente a partir de datos públicos de EDGAR: 11.109 preguntas fechadas procedentes de 638 prestatarios con financiación basada en activos, de las cuales 220 (2,0%) corresponden a quiebras reales. La evaluación se realizó sobre 1.702 informes retenidos cuyas ventanas de predicción se cierran después del final del conjunto de entrenamiento, lo que evita fuga de información temporal. Los resultados reportados muestran una mejora sustancial en calibración y discriminación respecto al modelo base.

El modelo es relevante porque demuestra un patrón de entrenamiento orientado a resultados verificables (outcome-trained forecasting) aplicado a un dominio financiero real, con etiquetas objetivas y con marca temporal, y porque la señal de entrenamiento es exactamente la métrica con la que se evaluará el modelo. No obstante, se trata de un adaptador de nicho, sin licencia declarada, sin idiomas declarados y con un entrenamiento incompleto (detenido en el paso 229 de 265 por agotamiento de créditos de cómputo).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Qwen3.8-27B) con adaptador LoRA |
| Parámetros totales | No disponible (el modelo base es de 27B; el adaptador LoRA no reporta su recuento) |
| Parámetros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | 48.000 caracteres de dossier como máximo; el prompt de entrenamiento usa los primeros 10.000 caracteres (aproximadamente 4.200 tokens) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible (el prompt de entrenamiento está en inglés) |
| Licencia | No disponible |
| Formato de pesos | No disponible (adaptador LoRA; el formato concreto no se especifica) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre Qwen3.8-27B, un transformer decoder-only. La innovación principal no reside en la arquitectura sino en la formulación del problema: en lugar de generar texto libre, el prompt termina en una plantilla de respuesta fija cuyas dos variantes comparten todos los tokens salvo el último (`choice#Y` frente a `choice#N`). La probabilidad de quiebra es el softmax sobre esos dos tokens en la posición de respuesta, lo que permite un único pase forward por pregunta, sin muestreo, y una probabilidad diferenciable.

La función de pérdida es el Brier score calculado sobre esa probabilidad frente a la etiqueta binaria real, implementada mediante `forward_backward_custom` del Tinker cookbook. El conjunto de entrenamiento se construyó con búsqueda de texto completo en EDGAR (2018-2026) sobre informes 10-K y 10-Q que describen instalaciones de crédito basadas en activos, filtrando los sectores SIC 283x (desarrolladores de fármacos) y SIC 60-67 (entidades financieras, fondos y REITs). Para cada pregunta se extrae la sección de discusión de la dirección y las secciones de liquidez, deuda y covenants del 10-Q original, se sustituye el nombre y el ticker de la empresa por "the Company" y se limita el texto a 48.000 caracteres. La etiqueta es 1 si el mismo CIK presenta un 8-K con la partida 1.03 en los 365 días siguientes; se excluyen los prestatarios que ya habían quebrado en los 730 días anteriores. El entrenamiento se detuvo en el paso 229 de 265 por falta de créditos de Tinker, por lo que las métricas reportadas corresponden a la evaluación del paso 130.

## Capacidades

- Predicción binaria calibrada de quiebra o concurso de un prestatario en una ventana de 365 días a partir de un 10-Q.
- Extracción de una probabilidad de un único token, sin generación de texto libre ni muestreo.
- Procesamiento de dossiers de hasta 48.000 caracteres (secciones de MD&A, liquidez, deuda y covenants), aunque el prompt de entrenamiento se limita a los primeros 10.000 caracteres.
- Anonimización de la entidad: el modelo opera sobre textos donde el nombre y el ticker han sido sustituidos por "the Company", lo que reduce el riesgo de que memorice identidades concretas.
- Condicionamiento por industria: el prompt incluye el sector del prestatario.
- Capacidad de calibración: el adaptador mejora sustancialmente el error de calibración esperado (ECE) respecto al modelo base.
- No se reporta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento extendido en la información disponible.

## Casos de uso

- Evaluación de riesgo de crédito en originación: un prestamista con garantía de activos puede introducir el 10-Q más reciente de un candidato y obtener una probabilidad de quiebra a 12 meses que se integra directamente en el pricing del préstamo y en la decisión de aprobación.
- Monitorización trimestral de cartera: al publicarse cada 10-Q, el modelo recalcula la probabilidad de cada prestatario y permite priorizar la revisión de los casos con mayor riesgo; el artículo reporta que el 5% de informes con mayor riesgo concentró 12 de las 36 quiebras del conjunto de test.
- Alertas tempranas para gestores de cobro: la probabilidad puede usarse como disparador para iniciar conversaciones con el prestatario, renegociar covenants o reforzar garantías antes de que se materialice el impago.
- Scoring para fondos de crédito y mesas de titulización: la salida calibrada (ECE de 0,023 tras el ajuste) es apta para alimentar modelos de pérdida esperada y cálculos de capital regulatorio.
- Investigación en forecasting financiero: el pipeline completo (construcción de preguntas desde EDGAR, etiquetado con 8-K Item 1.03, pérdida Brier sobre token único) sirve como referencia reproducible para experimentos de outcome-trained forecasting en dominios con etiquetas verificables.
- Auditoría y validación de modelos internos: al estar entrenado exclusivamente con información pública anterior a la fecha de corte, el modelo puede usarse como benchmark independiente frente a modelos de riesgo propietarios.
- Análisis de contrapartes en due diligence: evaluación rápida de proveedores o clientes relevantes que cotizan en EE. UU. y presentan financiación basada en activos.

## Benchmarks y rendimiento

Evaluación sobre 1.702 informes retenidos cuyas ventanas de predicción se cierran después del final del conjunto de entrenamiento. Las métricas corresponden a la evaluación del paso 130 (el entrenamiento se detuvo en el paso 229 de 265).

| Métrica | Modelo base | Adaptador LoRA |
|---|---|---|
| Brier score | 0,0483 | 0,0267 |
| Expected calibration error (ECE) | 0,088 | 0,023 |
| AUC | 0,82 | 0,86 |
| Quiebras capturadas en el 5% de mayor riesgo | 5 de 36 | 12 de 36 |
| Constante de tasa base (referencia) | 0,0207 | 0,0207 |

El modelo sin ajuste sigue por encima de la constante de tasa base porque sobreestima sistemáticamente la probabilidad media; un reescalado de un solo parámetro ajustado sobre la mitad del conjunto de test supera a la constante en la otra mitad.

## Requisitos de hardware

- El adaptador LoRA se aplica sobre Qwen3.8-27B, por lo que los requisitos de VRAM vienen determinados por el modelo base, no por el adaptador.
- VRAM estimada para el modelo base: no disponible en la información proporcionada; para un modelo denso de 27B en precisión completa se requiere hardware de clase A100/H100, y en cuantización de 4 bits podría caber en GPUs de consumo de gama alta (RTX 4090 con 24 GB), aunque esto no se confirma en la documentación.
- GPUs recomendadas: no disponible.
- Despliegue: el entrenamiento se realizó con Tinker; no se especifican opciones de inferencia (vLLM, llama.cpp, Ollama, TGI).
- Latencia y throughput: no disponibles. El diseño de un único pase forward por pregunta sugiere una latencia baja en comparación con esquemas de muestreo múltiple, pero no se aportan cifras.

## Comparativa con modelos similares

No se dispone de comparativas directas con otros modelos de riesgo de crédito en la información proporcionada. La comparación más directa es contra el propio modelo base Qwen3.8-27B sin adaptador, cuyos resultados se recogen en la tabla de benchmarks (Brier 0,0483 frente a 0,0267; ECE 0,088 frente a 0,023; AUC 0,82 frente a 0,86). Como referencia metodológica, el trabajo se inspira en las recetas de forecasting y decisiones del Tinker cookbook y en los papers de Lightning Rod Labs sobre preguntas de riesgo en la SEC, eventos clínicos y Future-as-Label, pero no se aportan métricas comparables de esos sistemas.

| Modelo | Parámetros | Contexto | Brier | ECE | AUC | Licencia |
|---|---|---|---|---|---|---|
| risk-model (LoRA sobre Qwen3.8-27B) | 27B base + LoRA | 10.000 caracteres de prompt | 0,0267 | 0,023 | 0,86 | No disponible |
| Qwen3.8-27B (base) | 27B | No disponible | 0,0483 | 0,088 | 0,82 | No disponible |
| Constante de tasa base | — | — | 0,0207 | — | — | — |

## Limitaciones y advertencias

- Entrenamiento incompleto: el run se detuvo en el paso 229 de 265 por agotamiento de créditos de Tinker; las métricas reportadas son de la evaluación del paso 130, no del modelo final.
- Sobreestimación sistemática: el modelo sin reescalar sobreestima la probabilidad media de quiebra y su Brier (0,0267) sigue por encima de la constante de tasa base (0,0207); requiere un reescalado de un parámetro ajustado sobre datos de test.
- Universo restringido: entrenado solo con 638 prestatarios estadounidenses con financiación basada en activos, excluyendo desarrolladores de fármacos (SIC 283x) y entidades financieras, fondos y REITs (SIC 60-67); no es extrapolable sin validación a otros sectores ni a empresas no cotizadas.
- Dependencia de la calidad del 10-Q: el prompt usa solo los primeros 10.000 caracteres del dossier (aproximadamente 4.200 tokens), lo que puede omitir secciones relevantes de liquidez o covenants en informes largos.
- Riesgo de alucinación y de fuga temporal: aunque el formato de respuesta de token único reduce la generación libre, el modelo podría explotar correlaciones espurias del texto; el diseño temporal (ventanas cerradas después del entrenamiento) mitiga pero no elimina este riesgo.
- Licencia no declarada: no se especifica licencia, lo que impide determinar si el uso comercial está permitido; el modelo base Qwen3.8-27B tiene su propia licencia que debe verificarse por separado.
- Idiomas no declarados: el prompt y los datos están en inglés y orientados a informes SEC; no hay evidencia de funcionamiento en otros idiomas o jurisdicciones.
- Sin datos de sesgo: no se reporta análisis de sesgo por sector, tamaño de empresa, geografía o características del prestatario.
- Uso previsto limitado a una única pregunta binaria; no es un modelo de propósito general ni sustituye la evaluación de un analista de crédito.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/safewaterline/risk-model
- Paper SEC risk questions (Lightning Rod Labs): https://arxiv.org/abs/2601.19189
- Paper clinical events (Lightning Rod Labs): https://arxiv.org/abs/2605.12817
- Paper Future-as-Label (Lightning Rod Labs): https://arxiv.org/abs/2601.06336
- Receta de forecasting del Tinker cookbook: https://github.com/thinking-machines-lab/tinker-cookbook/tree/main/tinker_cookbook/recipes/forecasting
- Receta de decisiones del Tinker cookbook: https://github.com/thinking-machines-lab/tinker-cookbook/tree/main/tinker_cookbook/recipes/decisions
- Búsqueda de texto completo en EDGAR: https://efts.sec.gov/LATEST/search-index?q=%22asset-based%22%20%22revolving%20credit%20facility%22&forms=10-K,10-Q
- API de submissions de EDGAR: https://www.sec.gov/search-filings/edgar-application-programming-interfaces
