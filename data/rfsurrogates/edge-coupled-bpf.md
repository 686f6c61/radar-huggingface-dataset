# rfsurrogates/edge-coupled-bpf

## Resumen

El modelo `rfsurrogates/edge-coupled-bpf` es un sustituto neuronal (surrogate model) de un dispositivo pasivo de microondas concreto: un filtro paso banda de microstrip con acoplamiento paralelo (edge-coupled), Chebyshev de orden N = 3 con rizado de 0,5 dB y cuatro secciones de línea acoplada. Lo desarrolla el autor `rfsurrogates` (contribuidor principal: benjhardy) y su función es sustituir una simulación electromagnética completa (FEM) por una evaluación casi instantánea del comportamiento en parámetros S.

El modelo resuelve un problema clásico de diseño asistido por computador en RF: evaluar el vector de geometría p = (w1, w2, g1, g2, l1, l2, eps_r, h) y devolver los parámetros S complejos S11 y S21 sobre 3–7 GHz (201 puntos, paso de 0,02 GHz) en un sustrato RO4350B (eps_r 3,66; h 0,508 mm; tan d 0,0037), con el cobre modelado como hoja PEC. La arquitectura combina un prior analítico de línea acoplada con una corrección DeepONet de 64 funciones base, con reciprocidad garantizada por construcción y penalización de pasividad.

Su relevancia radica en el coste computacional: una consulta en CPU tarda 4,5 ms (batch 1) o 0,33 ms (batched), frente a los 663 s de una resolución Palace FEM. El repositorio ocupa 0,0 GB y se distribuye con licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Prior analítico de línea acoplada + corrección DeepONet (64 funciones base, frequency warp) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de regresión p -> S, no es un LLM) |
| Tipos de cuantizacion | no disponible (pesos en float32; `weights.json` en base64 float32) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch `.pt` (checkpoints) y `weights.json` (base64 float32) |

## Arquitectura y entrenamiento

El modelo se formula como S = S_prior + DeepONet(p, f). El término S_prior es un modelo analítico de línea acoplada que integra síntesis de Pozar, el modelo de microstrip acoplado de Kirschning-Jansen, terminaciones abiertas de Hammerstad y dispersión de Kobayashi. La corrección DeepONet aporta 64 funciones base con un frequency warp, una única cabeza para S21 que garantiza reciprocidad por construcción y una penalización de pasividad durante el entrenamiento.

El entrenamiento se realiza en dos etapas: la etapa A preentrena el modelo sobre 20.000 muestras del prior (tres sustratos) y la etapa B lo ajusta fino sobre resoluciones Palace FEM. Se publican cinco semillas por ensemble. El conjunto de datos asociado (`rfsurrogates/samples`) contiene 261 registros de entrenamiento en malla coarse (split 80/10/10 por muestra, semilla 0), 10 registros de holdout en fidelidad medium y 10 twins coarse de los holdouts. El índice de datos tiene versión `8cae666b9dac`. El autor publica además un DeepONet entrenado desde cero sobre los mismos datos, un baseline MLP y los checkpoints de la etapa A.

## Capacidades

- Predicción de parámetros S complejos (S11 y S21) para geometrías dentro de la caja de diseño definida.
- Evaluación rápida sobre 201 puntos de frecuencia entre 3 y 7 GHz.
- Diseño inverso: el script `core/inverse.py` permite buscar geometrías a partir de una frecuencia central y un ancho de banda objetivo (por ejemplo, `--f0 5.2 --bw 0.5`).
- Estimación de incertidumbre mediante la dispersión del ensemble de cinco semillas (correlación de Pearson r = 0,55 entre dispersión y error).
- Recíproco por construcción (una sola cabeza para S21) y con penalización de pasividad.
- No soporta tool calling, agentes, razonamiento multi-step, visión, audio ni capacidades multilingües: es un modelo numérico de regresión específico de dominio.

## Casos de uso

- Diseño inverso de filtros paso banda: dado un objetivo de frecuencia central y ancho de banda, `core/inverse.py` explora el espacio de geometrías con evaluaciones de 4,5 ms en lugar de 663 s por simulación FEM, lo que permite optimización iterativa en minutos.
- Barrido paramétrico masivo: generar curvas de sensibilidad de S21 frente a w1, w2, g1, g2, l1 y l2 sobre la caja de diseño completa sin coste de simulación, útil para análisis de tolerancias.
- Precribado de candidatos antes de FEM: filtrar miles de geometrías con el surrogate y resolver en Palace solo las que cumplan especificaciones, reduciendo el coste de cómputo del flujo de diseño.
- Prototipado en navegador: la demo web (`benjhardy.github.io/filter-surrogate/`) carga `weights.json` y permite explorar el comportamiento del filtro sin instalación, adecuada para docencia o revisión rápida de diseños.
- Validación de modelos analíticos: comparar la precisión del prior analítico solo (2,86 dB de error medio en banda de paso) frente a la corrección DeepONet (0,52 dB) para decidir cuándo merece la pena el modelo neuronal.
- Estimación de incertidumbre en producción: usar la dispersión del ensemble como indicador de fiabilidad antes de aceptar una predicción, aunque el autor advierte que subestima el error (dispersión media 0,22 dB frente a error medio 0,52 dB).
- Investigación en surrogates físicos: el repositorio incluye checkpoints de etapa A, desde cero y MLP, lo que facilita estudios comparativos de estrategias de preentrenamiento con prior físico.

## Benchmarks y rendimiento

Resultados sobre 26 diseños held-out con la misma fidelidad que el entrenamiento:

| Metodo | Error banda de paso \|S21\|, dB media / max | Error \|f0\|, MHz media / max | Error \|BW\|, MHz media | \|S11\| lineal media |
|---|---|---|---|---|
| Prior solo (analítico) | 2,86 / 14,0 | 61,0 / 113 | 114 | 0,050 |
| Prior + DeepONet (etapa B) | 0,52 / 4,0 | 7,9 / 34 | 11 | 0,011 |
| DeepONet desde cero | 0,32 / 1,9 | 4,2 / 13 | 27 | 0,012 |
| MLP simple p -> S | 2,49 / 11,5 | 29,4 / 107 | 76 | 0,037 |

Comparación de fidelidad sobre 10 diseños resueltos también en malla medium:

| Comparacion | N | Error banda de paso \|S21\| dB media / max | Error \|f0\| MHz media / max | \|S11\| lineal |
|---|---|---|---|---|
| Modelo vs medium | 10 | 0,91 / 3,9 | 38 / 55 | 0,027 |
| Coarse vs medium | 10 | 1,03 / 3,8 | 35 / 55 | 0,025 |
| Modelo vs coarse | 10 | 0,52 / 2,1 | 7 / 26 | 0,010 |
| Prior vs medium | 10 | 1,25 / 5,0 | 18 / 34 | 0,032 |
| Prior vs coarse | 10 | 2,86 / 10,1 | 52 / 89 | 0,051 |

Curva de aprendizaje (error de banda de paso en dB / error de f0 en MHz / \|S11\| lineal):

| N train | Prior solo | Prior + DeepONet | DeepONet desde cero | MLP simple |
|---|---|---|---|---|
| 10 | 2,86 / 61 / 0,050 | 1,83 ± 0,55 / 35 / 0,032 | 9,49 ± 5,46 / 185 / 0,204 | - |
| 25 | 2,86 / 61 / 0,050 | 1,16 ± 0,26 / 26 / 0,022 | 2,62 ± 0,44 / 54 / 0,078 | - |
| 50 | 2,86 / 61 / 0,050 | 0,82 ± 0,15 / 20 / 0,017 | 1,31 ± 0,36 / 24 / 0,038 | 9,98 ± 0,74 / 127 / 0,108 |
| 100 | 2,86 / 61 / 0,050 | 0,62 ± 0,02 / 12 / 0,013 | 0,49 ± 0,04 / 9 / 0,019 | - |
| 150 | 2,86 / 61 / 0,050 | 0,60 ± 0,01 / 12 / 0,013 | 0,40 ± 0,01 / 8 / 0,015 | - |
| 209 | 2,86 / 61 / 0,050 | 0,54 ± 0,02 / 9 / 0,012 | 0,34 ± 0,00 / 5 / 0,013 | 2,58 ± 0,11 / 33 / 0,045 |

## Requisitos de hardware

- Inferencia en CPU: 4,5 ms por consulta con batch 1 y 0,33 ms en modo batched, según el autor.
- VRAM estimada: no disponible; el repositorio ocupa 0,0 GB y los pesos se distribuyen en float32, por lo que la huella es muy reducida.
- GPU recomendadas: no disponible; el modelo está pensado para ejecutarse en CPU y en navegador (`web/surrogate.js`).
- Cabe en cualquier GPU consumer y en CPU sin requisitos especiales.
- Opciones de despliegue: scripts del repositorio de código (`core/predict.py`, `core/eval.py`, `core/inverse.py`), carga de checkpoints PyTorch vía `tools/fetch.py`, y demo web con `weights.json`.
- Latencia y throughput: 4,5 ms (batch 1) y 0,33 ms (batched) en CPU; sin datos de throughput en GPU.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Error banda de paso \|S21\| (dB) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Prior + DeepONet (este) | Surrogate híbrido | no disponible | no aplica | 0,52 media / 4,0 max | Apache 2.0 | Hugging Face + GitHub |
| DeepONet desde cero | Red neuronal pura | no disponible | no aplica | 0,32 media / 1,9 max | Apache 2.0 | Mismo repo |
| MLP simple | Baseline neuronal | no disponible | no aplica | 2,49 media / 11,5 max | Apache 2.0 | Mismo repo |
| Prior analítico | Modelo físico | no aplica | no aplica | 2,86 media / 14,0 max | Apache 2.0 | Mismo repo |

No se dispone de comparación con surrogates de terceros en la información proporcionada.

## Limitaciones y advertencias

- Dominio muy restringido: solo es válido para el filtro edge-coupled Chebyshev N = 3 con sustrato RO4350B fijo (eps_r 3,66; h 0,508 mm). Fuera de la caja de diseño (w1 0,6184–1,1484 mm; w2 0,7540–1,4003 mm; g1 0,1230–0,2283 mm; g2 0,4127–0,7664 mm; l1 7,2756–9,8435 mm; l2 7,2445–9,8013 mm) el modelo no está definido.
- Regla de validez: `clearance(p) > 0,05 mm`. Los diseños que la incumplen son layouts fusionados (cortocircuitados), no filtros, y no están en los datos de entrenamiento.
- Dentro de la caja, la mayoría de diseños son filtros desintonizados; 20 de los 26 diseños held-out presentan banda de paso partida.
- El sesgo de malla es el término de error dominante a este tamaño de datos: el error del modelo frente a la malla medium (0,91 dB) es comparable al de la propia malla coarse (1,03 dB).
- La dispersión del ensemble subestima el error (0,22 dB de dispersión media frente a 0,52 dB de error medio).
- Riesgo de alucinación en sentido figurado: el modelo puede producir predicciones plausibles fuera de la región de validez sin señalizarlo explícitamente; es responsabilidad del usuario aplicar la regla de clearance y comprobar la caja de diseño.
- Sin datos publicados sobre sesgos demográficos ni multilingües (no aplica), pero sí sobre sesgo de fidelidad de malla.
- Licencia Apache 2.0: permite uso comercial con atribución y sin garantías; el autor no ofrece garantía de exactitud para producción sin validación FEM adicional.
- Solo 261 registros de entrenamiento y 10 de holdout: la curva de aprendizaje muestra que el DeepONet desde cero es inestable con menos de 50 muestras (9,49 dB de error a N = 10), mientras que el prior + DeepONet es más robusto en régimen de pocos datos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rfsurrogates/edge-coupled-bpf
- Repositorio de código, entrenamiento, checker y guía de contribución: https://github.com/benjhardy/rfsurrogates
- Demo en navegador: https://benjhardy.github.io/filter-surrogate/
- Dataset de muestras: https://huggingface.co/datasets/rfsurrogates/samples
