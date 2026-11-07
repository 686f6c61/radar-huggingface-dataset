# ATON-QAI/QAI-MZI-Adaptive-Drift-Controller-v1

## Resumen

El QAI-MZI-Adaptive-Drift-Controller-v1 es un artefacto de investigación publicado por ATON QAI que acompaña al Paper 01 de la organización, titulado "When Simple Adaptive Filters Beat Neural Controllers in Drifting Mach-Zehnder Interferometers". No es un modelo de lenguaje: es una implementación de referencia con pesos calibrados para el control adaptativo de deriva de fase en interferómetros Mach-Zehnder (MZI) con desplazamiento termo-óptico. El repositorio incluye dos variantes: un filtro EWMA (media móvil ponderada exponencialmente) sin parámetros entrenables y un perceptrón multicapa (MLP) de 4→16→16→1 con activación Tanh y ensemble de 3 semillas.

El problema que aborda es la estabilización de fase en interferómetros fotónicos que sufren deriva por perturbaciones térmicas y ópticas, un reto recurrente en fotónica integrada y computación cuántica fotónica. La contribución principal del paper es la constatación de que un filtro adaptativo simple supera a un controlador neuronal en seis regímenes de perturbación bajo un presupuesto de sondeo estrictamente igualado (8.192 fotones por episodio), lo que cuestiona el uso indiscriminado de controladores neuronales en este dominio.

El modelo se distribuye con licencia Apache 2.0, pipeline declarado como time-series-forecasting y librería genérica (no transformers). Su relevancia radica en que proporciona una línea base reproducible y de latencia ultrabaja (12,2 µs mediana para EWMA) para experimentos de control fotónico adaptativo, así como una referencia metodológica para auditorías comparativas entre controladores clásicos y neuronales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | EWMA con diferencia finita de fase (variante 1); MLP 4→16→16→1 con activación Tanh (variante 2) |
| Parámetros totales | EWMA: 0 parámetros entrenables; MLP: 353 parámetros por semilla (ensemble de 3) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no es un modelo de lenguaje; opera paso a paso sobre cuentas de fotones) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible (no aplica; salida numérica de corrección de fase en radianes) |
| Licencia | Apache 2.0 |
| Formato de pesos | JSON (carga mediante `from_pretrained_json`); código Python/NumPy |

## Arquitectura y entrenamiento

La variante EWMA implementa un estimador de fase por media móvil ponderada exponencialmente con coeficiente `alpha = 0.25`, dithering de `0.18 rad` y ganancia de `0.55`. No requiere entrenamiento: es un filtro recursivo determinista que calcula la corrección de fase a partir de la diferencia de cuentas de fotones (`counts_plus`, `counts_minus`) en cada paso. Su latencia mediana es de 12,2 µs (P95 de 18,5 µs).

La variante MLP es una red de 4 entradas, dos capas ocultas de 16 neuronas con activación Tanh y una salida escalar, con 353 parámetros por semilla y un ensemble de 3 semillas para reducir varianza. Su latencia mediana es de 20,0 µs (P95 de 31,0 µs). Los pesos se cargan desde un fichero JSON. El entrenamiento se realizó sobre 61.440 pasos distribuidos en 192 episodios y 6 regímenes de perturbación, con un presupuesto de sondeo igualado de 8.192 fotones por episodio. No se especifican en la información disponible el número de tokens (no aplica), la composición exacta del dataset de entrenamiento ni si se emplearon técnicas de RLHF o DPO (no aplicables a este dominio).

La innovación técnica destacable es metodológica: la auditoría comparativa bajo presupuesto de sondeo estrictamente igualado entre un controlador clásico y uno neuronal, con evaluación en seis regímenes de perturbación (deriva nominal, deriva de camino aleatorio rápido, salto de fase discontinuo, alta pérdida óptica, caída de telemetría y actuación retardada). El dataset asociado es `ATON-QAI/QAI-Research-Articles-and-Metrics`.

## Capacidades

- Estimación y corrección adaptativa de deriva de fase en interferómetros Mach-Zehnder a partir de cuentas de fotones con dithering.
- Control en tiempo real con latencias de decenas de microsegundos, adecuado para bucles de control fotónico.
- Robustez frente a seis regímenes de perturbación: deriva nominal, camino aleatorio rápido, salto de fase discontinuo, alta pérdida óptica, caída de telemetría y actuación retardada.
- Ensemble de 3 semillas en la variante MLP para reducir varianza en la predicción.
- Interfaz Python/NumPy simple (`step(counts_plus, counts_minus)`) que devuelve la corrección de fase en radianes.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Estabilización de fase en laboratorio de fotónica integrada: el filtro EWMA puede integrarse en un bucle de control en tiempo real sobre un MZI termo-óptico, corrigiendo la deriva con latencia de 12,2 µs y sin necesidad de GPU.
- Línea base reproducible para investigación en control fotónico: el repositorio proporciona pesos y hiperparámetros calibrados que permiten replicar los resultados del Paper 01 y comparar nuevos controladores bajo el mismo presupuesto de sondeo de 8.192 fotones por episodio.
- Validación de controladores neuronales en fotónica: el MLP de 353 parámetros sirve como referencia neuronal ligera para evaluar si arquitecturas más complejas aportan mejoras reales frente a filtros clásicos en regímenes de deriva.
- Prototipado de sistemas de control en computación cuántica fotónica: la corrección de fase en radianes es directamente aplicable a moduladores de fase en circuitos fotónicos cuánticos donde la deriva térmica degrada la fidelidad de las operaciones.
- Despliegue en hardware embebido o FPGA: al requerir 0 parámetros entrenables (EWMA) y ejecutarse en 12,2 µs, es viable en microcontroladores o lógica programable junto al lazo óptico, sin depender de aceleradores.
- Docencia y formación en control adaptativo: el código y los pesos permiten ilustrar la comparación entre filtros recursivos clásicos y redes neuronales pequeñas en un problema físico concreto y con métricas publicadas (detección en porcentaje y RMSE en radianes).

## Benchmarks y rendimiento

Resultados publicados en la model card sobre 6 regímenes de perturbación con 8.192 sondeos por episodio:

| Régimen de perturbación | Detección EWMA (%) | Detección MLP 3 semillas (%) | Detección baseline estático (%) | RMSE EWMA (rad) | RMSE MLP (rad) |
|---|---|---|---|---|---|
| Deriva nominal | 74,16 | 73,64 | 73,21 | 0,0612 | 0,1747 |
| Deriva de camino aleatorio rápido | 73,76 | 73,39 | 58,19 | 0,1535 | 0,2125 |
| Salto de fase discontinuo | 73,23 | 73,12 | 61,04 | 0,2404 | 0,2535 |
| Alta pérdida óptica | 15,23 | 15,07 | 14,21 | 0,1332 | 0,2518 |
| Caída de telemetría | 74,15 | 73,44 | 73,18 | 0,0647 | 0,2050 |
| Actuación retardada | 74,11 | 72,69 | 73,05 | 0,0783 | 0,2830 |

Métricas de latencia: EWMA 12,2 µs mediana (18,5 µs P95); MLP 20,0 µs mediana (31,0 µs P95).

## Requisitos de hardware

- VRAM estimada: no aplica; ambos controladores se ejecutan en CPU con NumPy. El MLP tiene 353 parámetros por semilla (ensemble de 3), por debajo de 1 KB de pesos en JSON.
- GPU recomendadas: ninguna necesaria. Cualquier CPU moderna es suficiente; opcionalmente puede portarse a FPGA o microcontrolador.
- Cabe en cualquier GPU consumer, aunque no se requiere GPU para su funcionamiento.
- Opciones de despliegue: Python con NumPy (referencia oficial); portabilidad directa a C, Rust o Verilog para integración en lazos de control embebidos. No aplican vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: 12,2 µs mediana (EWMA) y 20,0 µs mediana (MLP) por paso de control; el throughput depende de la frecuencia de sondeo óptico, no del modelo.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (controladores adaptativos de deriva de fase para MZI). La comparativa interna relevante es la que ofrece el propio paper entre EWMA, MLP de 3 semillas y baseline estático, recogida en la tabla de benchmarks.

## Limitaciones y advertencias

- El modelo está diseñado específicamente para control de fase en MZI con dithering; no es generalizable a otros dominios sin reentrenamiento o recalibración.
- El rendimiento cae drásticamente en el régimen de alta pérdida óptica: la detección se reduce al 15,23 % (EWMA) y 15,07 % (MLP), frente a más del 72 % en los demás regímenes.
- El MLP presenta un RMSE entre 2,5 y 3,6 veces superior al EWMA en varios regímenes (por ejemplo, 0,1747 frente a 0,0612 rad en deriva nominal), lo que indica que la variante neuronal no aporta ventaja en este dominio.
- Los resultados proceden de una única auditoría con 192 episodios y 6 regímenes; no se han publicado validaciones independientes en la información disponible.
- No se especifican sesgos conocidos ni riesgos de alucinación al no ser un modelo generativo; el riesgo principal es de sobreajuste a las condiciones de simulación del paper.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución; no se identifican restricciones adicionales en la información disponible.
- Para producción, es necesario validar el controlador en el hardware fotónico concreto, ya que los pesos calibrados dependen del modelo de perturbación del paper.

## Enlaces

- Hugging Face: https://huggingface.co/ATON-QAI/QAI-MZI-Adaptive-Drift-Controller-v1
- Organización en Hugging Face: https://huggingface.co/ATON-QAI
- Paper 01: https://aton-qai.ai/research/p-ctrl-01-adaptive-mzi-control
- Atlas interactivo de investigación: https://huggingface.co/spaces/ATON-QAI/QAI-Research-Interactive-Atlas
- Dataset asociado: https://huggingface.co/datasets/ATON-QAI/QAI-Research-Articles-and-Metrics
