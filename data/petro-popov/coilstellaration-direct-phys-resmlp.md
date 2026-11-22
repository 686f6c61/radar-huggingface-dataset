# petro-popov/coilstellaration-direct-phys-resmlp

## Resumen

CoilStellaration Direct Physics-Informed ResMLP es una red neuronal de inferencia directa (sin bucle iterativo) desarrollada por petro-popov para el benchmark CoilStellaration, una tarea de diseño de bobinas para reactores de fusión de tipo stellarator. El modelo resuelve la pista `fixed_shape` (N_fp = 3, cinco bobinas únicas por semiperiodo) prediciendo la geometría de las bobinas en una única pasada hacia delante, con un coste aproximado de 1,8 ms por conjunto de bobinas.

Se trata de un perceptrón residual (ResMLP) de 6 capas con `hidden_dim=768`, 3,22 millones de parámetros y un fichero ONNX de 12,32 MiB. La innovación principal es el entrenamiento en dos fases que combina un calentamiento supervisado con MSE y una segunda fase con una función de pérdida diferenciable basada en física (error de campo normal de Biot–Savart, curvatura, holgura bobina-bobina y bobina-plasma), lo que permite obtener soluciones físicamente plausibles sin iteración en tiempo de inferencia.

El modelo es relevante porque demuestra que una red pequeña y de baja latencia puede sustituir a optimizadores iterativos costosos en un subproblema de diseño de reactores de fusión, con una tasa de factibilidad estricta del 21,67% en la evaluación local. Su licencia MIT y su formato ONNX facilitan la integración en pipelines de diseño y experimentación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResMLP pre-norm de 6 capas (`ResMlpCoilPredictor`), con cabeza `_CurrentsHead` separada |
| Parametros totales | 3,22 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; entrada de forma fija del benchmark) |
| Tipos de cuantizacion | no disponible (pesos exportados en ONNX; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (no aplica; modelo numérico de diseño de bobinas) |
| Licencia | MIT |
| Formato de pesos | ONNX (12,32 MiB); no se documenta safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura es un perceptrón multicapa residual con normalización previa (pre-norm) de 6 capas y dimensión oculta de 768, con dropout 0,0 y una cabeza separada `_CurrentsHead` para las corrientes. El modelo es de tipo directo: una única pasada hacia delante (`Loop = 0`) produce el conjunto de bobinas, con un coste medido de aproximadamente 1,8 ms por coilset.

El entrenamiento se realizó en dos fases sobre CPU de Apple Silicon, con una duración total de unos 7,3 minutos y sin fuga de datos del conjunto de evaluación (selección estricta sobre el split `train` con un 5% de validación disjunta en frontera). La fase 1 (3.000 pasos, batch de 128) usa MSE como calentamiento hacia la cuenca física de las bobinas. La fase 2 (3.600 pasos, batch de 32) emplea una pérdida diferenciable implementada en JAX que combina el error de campo normal de Biot–Savart mediante `log1p(v_i / alpha_i)`, curvatura muestreada a 48 puntos, holgura bobina-bobina y holgura bobina-plasma con un margen de seguridad del 5%. Durante esta fase se anela `w_mse` de 1,0 a 0,05 y se incrementa `w_phys` de 0,5 a 2,5, con aumento de datos no supervisado mediante Boundary Mixup.

## Capacidades

- Predicción directa de la geometría de bobinas para la pista `fixed_shape` del benchmark CoilStellaration (N_fp = 3, cinco bobinas únicas por semiperiodo).
- Inferencia en una sola pasada, sin bucle iterativo, con latencia de aproximadamente 1,8 ms por conjunto de bobinas.
- Codificación implícita de restricciones físicas aprendidas: error de campo normal, curvatura y holguras bobina-bobina y bobina-plasma.
- Generación de soluciones con distintos niveles de exigencia (estratos `loose`, `medium` y `tight`).
- Exportación a ONNX para despliegue ligero e integración en otros lenguajes y runtimes.
- No soporta tool calling, agentes, razonamiento multi-step, visión, audio ni capacidades multilingües; es un modelo numérico específico de dominio.

## Casos de uso

- Exploración rápida de espacio de diseño en stellarators: el modelo evalúa miles de configuraciones de bobinas por segundo (1,8 ms por coilset), lo que permite filtrar candidatos antes de pasar a optimizadores físicos costosos.
- Generación de puntos de partida para optimización iterativa: las predicciones directas pueden inicializar un optimizador de Biot–Savart, reduciendo el número de iteraciones necesarias para alcanzar factibilidad.
- Prototipado en investigación de fusión: al ser un modelo de 3,22 M de parámetros con licencia MIT, se puede entrenar y modificar en hardware modesto para estudiar variantes de la pérdida física.
- Integración en pipelines de CI/CD de simulación: el formato ONNX permite ejecutar el modelo en entornos heterogéneos sin dependencias de JAX o PyTorch.
- Docencia y divulgación sobre diseño de bobinas: la latencia de milisegundos permite demostraciones interactivas de la relación entre parámetros de entrada y geometría resultante.
- Filtrado de configuraciones no factibles: con una factibilidad estricta del 21,67% y una factibilidad por métrica superior al 92% en holguras y curvatura, el modelo sirve como primer filtro para descartar diseños que incumplen restricciones geométricas.
- Benchmarking de métodos physics-informed: sirve como referencia ligera para comparar enfoques de pérdida física en la pista `fixed_shape`.

## Benchmarks y rendimiento

Evaluación local estratificada sobre 300 filas (100 por estrato):

| Metrica | Valor |
|---|---|
| Media global | 0,3704 |
| Media estrato `loose` | 0,7989 |
| Media estrato `medium` | 0,2611 |
| Media estrato `tight` | 0,0513 |
| Factibilidad estricta global | 21,67% |
| Factibilidad estricta `loose` | 58,0% |
| Factibilidad estricta `medium` | 7,0% |
| Factibilidad estricta `tight` | no disponible |
| Factibilidad >= 0,9 | 24,33% |
| Factibilidad bobina-bobina | 92,3% |
| Factibilidad bobina-plasma | 93,0% |
| Factibilidad de curvatura | 97,0% |
| Factibilidad de error de campo | 26,3% |

No se han publicado resultados de benchmarks comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MiB en FP32 para el fichero ONNX de 12,32 MiB, incluyendo buffers de activación.
- GPU recomendadas: no se requieren GPU; el entrenamiento documentado se realizó en CPU de Apple Silicon. Cualquier GPU consumer (por ejemplo, RTX 3060 o superior) ejecutaría la inferencia con holgura.
- Cabe en cualquier GPU consumer e incluso en CPU; el modelo es adecuado para despliegue en entornos sin acelerador.
- Opciones de despliegue: ONNX Runtime (formato nativo del modelo); el entrenamiento se realizó con JAX, pero no se documenta un despliegue con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia estimada: aproximadamente 1,8 ms por coilset en el entorno de referencia (CPU de Apple Silicon); no se documenta throughput agregado.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (predictores directos physics-informed para CoilStellaration) en la información proporcionada.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CoilStellaration Direct Phys-ResMLP | 3,22 M | no aplica | Media 0,3704; factibilidad estricta 21,67% | MIT | Hugging Face, ONNX |
| Alternativas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo solo soporta la pista `fixed_shape` del benchmark CoilStellaration; no cubre otras pistas ni configuraciones con distinto número de bobinas o periodos.
- La factibilidad estricta global es del 21,67% y cae al 7,0% en el estrato `medium`; el estrato `tight` presenta una media de 0,0513 y no se documenta su factibilidad estricta, lo que sugiere un rendimiento muy limitado en configuraciones exigentes.
- La métrica de error de campo es el principal cuello de botella (26,3% de factibilidad), frente a holguras y curvatura por encima del 92%.
- El entrenamiento se realizó en unos 7,3 minutos sobre CPU de Apple Silicon con 6.600 pasos totales; no se documenta validación frente a sobreajuste más allá del holdout del 5%.
- No se documentan sesgos, riesgos de alucinación ni comportamiento multilingüe porque el modelo no es generativo de texto; estos riesgos no aplican en el sentido habitual.
- La licencia MIT permite uso comercial, pero el modelo se distribuye como artefacto de investigación sin garantías de robustez en producción.
- No se documentan cuantizaciones ni versiones GGUF; el despliegue está pensado para ONNX Runtime.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso comunitario ni validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/petro-popov/coilstellaration-direct-phys-resmlp
- Benchmark CoilStellaration (Space): https://huggingface.co/spaces/proxima-fusion/coilstellaration-bench
