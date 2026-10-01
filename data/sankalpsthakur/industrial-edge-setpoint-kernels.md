# sankalpsthakur/industrial-edge-setpoint-kernels

## Resumen

`sankalpsthakur/industrial-edge-setpoint-kernels` no es un modelo de lenguaje: es un paquete de modelos numéricos compactos junto con un banco de pruebas de control ya ejecutado para la supervisión de presión en un sistema de dos bombas. Lo publica el usuario sankalpsthakur bajo licencia MIT y lo etiqueta como `reinforcement-learning`, `model-predictive-control`, `edge` y `reproducibility`. El release combina un predictor de residuos basado en random Fourier features (RFF), una política de kernel factorizada adaptada de FKDPP, comparativas con control convencional (PI incremental y MPC lineal), un predictor en C99 y una especificación ejecutable de admisión de propuestas para PLC.

El problema que aborda es el control de consigna (setpoint) en el borde industrial: decidir consignas de presión con latencia mínima y recursos de cómputo reducidos, manteniendo el comportamiento ante condiciones no vistas como desgaste de bomba, actuadores más lentos, sensores sesgados o cambios de demanda. Resulta relevante porque entrega un artefacto ligero: el predictor RFF serializado ocupa 12 484 bytes y la inferencia usa 128 características fijas, con resultados medidos sobre 360 episodios de confirmación y 50 400 decisiones de controlador.

El alcance es explícitamente acotado. Se trabaja sobre un manifold sintético normalizado de bomba, los métodos son adaptaciones inspiradas en artículos y el propio autor advierte que el release no establece reproducción de experimentos industriales publicados, ni rendimiento de campo, ni temporización de PLC, ni seguridad funcional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Kernel: predictor de residuos con 128 características coseno (random Fourier features) y regresión ridge; política de kernel factorizada (adaptación FKDPP) con diccionario Nyström de 64 estados y objetivos DPP con softmax ponderado; MPC de horizonte finito mediante búsqueda tipo shooting |
| Parametros totales | No disponible. No se declara recuento de parámetros; el artefacto serializado del predictor RFF ocupa 12 484 bytes y el diccionario Nyström tiene 64 estados |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica. No es un modelo de lenguaje; el controlador usa un horizonte de predicción finito cuyo valor numérico no se especifica en la información disponible |
| Tipos de cuantizacion | No aplica. No se distribuyen pesos cuantizados; la exportación en C usa `double` binario64 con C99 y `libm` |
| Idiomas soportados | `en` (etiqueta de metadatos). El artefacto es numérico y no procesa lenguaje natural |
| Licencia | MIT |
| Formato de pesos | Artefactos NumPy (`.np`, por ejemplo `rff.np`) y exportación a código C99; no se usa safetensors ni GGUF |
| Repositorio | sankalpsthakur/industrial-edge-setpoint-kernels |
| Pipeline declarado | reinforcement-learning |
| Tamaño del repositorio | 0,0 GB |
| Descargas / likes | 0 / 0 |
| Fechas declaradas | Creado el 2026-09-30, actualizado el 2026-09-30 |
| Region declarada | `us` |

## Arquitectura y entrenamiento

El sistema no es un transformer ni un modelo híbrido SSM: es una pila de control compuesta por un predictor de dinámica y un controlador. El predictor RFF combina un predictor lineal normalizado de incrementos, entrenado solo con datos de entrenamiento, con residuos calculados mediante regresión ridge sobre 128 características coseno. Sobre esa dinámica aprendida se ejecuta un controlador predictivo con búsqueda de horizonte finito. La política incluida es una adaptación de FKDPP (Cui et al., CASE 2018) con dos políticas de factor, objetivos DPP con softmax ponderado, diccionario Nyström de 64 estados y actualizaciones ridge offline; el autor señala que la selección fija de datos y diccionario offline difiere del procedimiento iterativo de rollout original.

El entrenamiento se realizó sobre datos sintéticos generados a partir de un manifold de bomba normalizado: 12 800 transiciones de entrenamiento procedentes de 160 rollouts, generados de forma separada de los conjuntos de validación y confirmación. La variante de MPC con compensación de offset añade a los incrementos predichos una innovación de presión filtrada a partir de observaciones válidas; se introdujo como extensión empírica tras el primer fallo por desgaste. Se incluyen además dos referencias convencionales: un PI incremental ajustado en validación y un MPC lineal con predictor afín y la misma búsqueda de horizonte finito. La revisión de fuentes cubre también DeePC no lineal con kernel (2025) y una adaptación por RL de MPC explícito (2026), pero esos métodos no están implementados en el release.

## Capacidades

- Predicción de residuos de dinámica de presión sobre un manifold sintético de dos bombas, con inferencia de coste fijo independiente del tamaño del conjunto de entrenamiento.
- Control predictivo de consigna con horizonte finito y búsqueda tipo shooting sobre la dinámica aprendida.
- Política de kernel factorizada (adaptación FKDPP) entrenada offline, incluida como comparativa.
- Compensación de offset mediante innovación de presión filtrada, orientada a mitigar degradación por desgaste.
- Referencias convencionales ejecutables: PI incremental ajustado en validación y MPC lineal con predictor afín.
- Exportación del predictor a C99 (`double`, `libm`) con equivalencia numérica verificada frente a Python: diferencia absoluta máxima de 1,11×10⁻¹⁶ sobre 128 sondas numéricas fijas.
- Verificación de recarga de artefactos: tres modelos guardados reproducen sus decisiones sobre 16 sondas fijas cada uno.
- Mecanismo de admisión local de propuestas para PLC: aprobación exacta de contenido, comprobaciones de frescura, calidad, contexto y modelo, replay, unidades, límites, slew rate y estados de readback.
- Reproducibilidad: batería pública de 77 pruebas superadas y receipt en `results/release_tests.json`; segunda réplica en nube reprodujo los 360 episodios con diferencia máxima no temporal de 2,93×10⁻¹⁴.
- No incluye capacidades de generación de texto, visión, audio, tool calling ni razonamiento multilingüe.

## Casos de uso

- Control de presión en estaciones de bombeo de dos bombas: el MPC con compensación de offset reduce el RMSE un 25,9 % frente al PI ajustado en el escenario de cambio de demanda, lo que lo hace adecuado como punto de partida para la supervisión de consigna en este tipo de instalaciones.
- Evaluación comparativa de controladores en I+D: el banco de pruebas ejecuta cinco controladores sobre seis condiciones y 50 400 decisiones, de modo que permite contrastar PI, MPC lineal, MPC con RFF y FKDPP offline bajo el mismo protocolo y con semillas de confirmación separadas.
- Análisis de robustez frente a desgaste de bomba: el release conserva el fallo del predictor nominal bajo desgaste no visto (RMSE 0,1539 frente a 0,0207 del PI) y su corrección posterior, útil para estudiar deriva de modelo y degradación en gemelos digitales.
- Estudio de sensores sesgados y fallos de instrumentación: el escenario de fallo rechazó 204 propuestas y registró 36 readbacks desconocidos por controlador en 12 episodios, con lo que sirve para diseñar lógicas de admisión y validación de lecturas.
- Prototipado de control en hardware de borde: el predictor serializado de 12 484 bytes y el tiempo de decisión p95 de aproximadamente 0,61 ms en un host Apple ARM permiten validar despliegues en CPU sin GPU.
- Verificación de cadenas de herramientas Python/C en entornos regulados: la conformidad del predictor C99 contra Python sobre sondas fijas y la comparación entre hosts documentada en `cloud/` sirven como patrón de verificación numérica antes de portar lógica a un controlador industrial.
- Docencia y formación en control predictivo y RL aplicado a procesos: el protocolo documentado, los receipts de pruebas y los comandos de reproducción facilitan la repetición de los experimentos en portátiles o entornos gratuitos.
- Diseño de lógicas de admisión para PLC: la especificación ejecutable en `docs/PLC_ADMISSION.md` describe comprobaciones de frescura, límites, slew rate y readback que pueden reutilizarse como base de un procedimiento de aprobación de propuestas.

## Benchmarks y rendimiento

RMSE por condición en la segunda iteración de confirmación (360 episodios, cinco controladores, seis condiciones). Se reproducen únicamente las filas publicadas en la model card:

| Condicion | PI ajustado (RMSE) | MPC RFF nominal (RMSE) | MPC con compensacion de offset (RMSE) |
|---|---:|---:|---:|
| Cambio de demanda | 0,0360 | 0,0297 | **0,0267** |
| Desgaste de bomba | **0,0207** | 0,1539 | 0,0306 |
| Actuadores mas lentos | 0,0294 | 0,0268 | **0,0247** |
| Sensor de presion sesgado | 0,0563 | **0,0178** | 0,0596 |

Datos adicionales reportados por el autor:

- La compensación de offset redujo el RMSE del escenario de cambio de demanda un 25,9 % frente al PI ajustado, con diferencia media emparejada de −0,00933 y intervalo bootstrap del 95 % de [−0,01036, −0,00826].
- La misma variante redujo el error en desgaste un 80,1 % frente al MPC RFF nominal, aunque el PI siguió siguiendo mejor el desgaste.
- El comportamiento empeoró en el escenario de sensor sesgado (0,0596 frente a 0,0178 del RFF nominal).
- La adaptación offline de FKDPP rindió por debajo del PI en las condiciones muestreadas.
- No se produjo ninguna excursión del envelope de presión en los episodios de confirmación muestreados; el autor subraya que se trata de un resultado de test finito y no de una garantía.
- El objetivo cúbico de velocidad es un proxy energético normalizado; no se sostiene ninguna afirmación en kWh, ahorro de carbono o economía de planta real.
- No se han publicado resultados de benchmarks de lenguaje (MMLU, HumanEval, GSM8K u otros), ya que el artefacto no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica. El entrenamiento y la inferencia documentados funcionan en CPU; no se requiere GPU ni cómputo de pago.
- GPU recomendadas: ninguna. Los replays de cómputo incluido se ejecutaron en CPU de Kaggle y en un host Apple ARM local.
- Compatibilidad con GPU de consumo: no aplica por tratarse de cargas de CPU con artefactos de kilobytes.
- Huella de almacenamiento: predictor RFF serializado de 12 484 bytes; inferencia de 128 características fijas.
- Opciones de despliegue: paquete Python `edge_control` (instalación con `python -m pip install -e '.[test,report]'`), predictor compilado en C99 con `libm`, y especificación de admisión para PLC como precondición de integración. vLLM, llama.cpp, Ollama y TGI no aplican a este artefacto.
- Latencia: aproximadamente 0,61 ms de mediana del p95 de tiempo de decisión por episodio con el controlador de offset en el caso de cambio de demanda, en el host Apple ARM local y excluyendo comunicación, escaneos de PLC y admisión del gateway.
- Throughput: no disponible.
- Reproducción: `python -m pytest -q` (77 pruebas superadas) y `python -m edge_control.benchmark --config config.v2.json --output results/reproduction`; verificación del export en C con `python tools/verify_c.py --model results/reproduction/models/rff.np`.

## Comparativa con modelos similares

| Criterio | MPC con compensacion de offset | MPC RFF nominal | PI incremental ajustado | FKDPP offline (adaptacion) |
|---|---|---|---|---|
| Enfoque | Predictor RFF mas innovacion de presion filtrada | Predictor RFF mas busqueda de horizonte finito | Control clasico incremental ajustado en validacion | Politica de kernel factorizada con actualizaciones ridge offline |
| Cambio de demanda (RMSE) | 0,0267 | 0,0297 | 0,0360 | No disponible |
| Desgaste de bomba (RMSE) | 0,0306 | 0,1539 | 0,0207 | Peor que PI, sin cifra publicada |
| Actuadores mas lentos (RMSE) | 0,0247 | 0,0268 | 0,0294 | No disponible |
| Sensor sesgado (RMSE) | 0,0596 | 0,0178 | 0,0563 | No disponible |
| Coste de inferencia | Inferencia fija de 128 caracteristicas; artefacto de 12 484 bytes | Inferencia fija de 128 caracteristicas | Coste despreciable | Diccionario Nyström de 64 estados |
| Licencia | MIT | MIT | MIT | MIT |
| Disponibilidad | Incluido en el repositorio | Incluido en el repositorio | Incluido en el repositorio | Incluido en el repositorio |

No se dispone de comparaciones con otros paquetes publicados de control para borde industrial dentro de la información proporcionada.

## Limitaciones y advertencias

- Alcance sintético: el manifold de bomba es normalizado y sintético; el release no reproduce experimentos industriales publicados ni demuestra rendimiento de campo.
- Sin garantías de seguridad funcional ni de temporización de PLC: el artefacto es un predictor numérico y no incluye driver de PLC ni configuración del sistema de control.
- Sensores sesgados: el sesgo de sensor de buena calidad permaneció admisible en el escenario de fallo, y la compensación de offset empeoró el comportamiento en ese caso (0,0596 frente a 0,0178).
- Fallo del modelo aprendido: el predictor RFF nominal se degradó gravemente bajo desgaste de bomba no visto (RMSE 0,1539), un modo de fallo conservado deliberadamente en el release.
- La adaptación FKDPP offline rindió por debajo del PI en las condiciones muestreadas, por lo que no debe asumirse que la política de kernel sea superior al control clásico en este banco de pruebas.
- El autor declara explícitamente que no se hereda ninguna garantía de robustez: no hay construcción de tubos ni garantías formales asociadas al predictor RFF.
- El objetivo energético es un proxy normalizado; no se sostienen afirmaciones económicas, de kWh ni de ahorro de carbono.
- Los resultados de no excursión del envelope de presión provienen de un test finito y no constituyen una garantía.
- Diferencias entre hosts: los bytes de los modelos entrenados en local y en nube difieren, y cada comprobación de conformidad en C usa sus propios pesos registrados.
- Idiomas: la etiqueta de metadatos indica `en`; no hay procesamiento de lenguaje natural implicado.
- Adopción nula: 0 descargas y 0 likes en el momento de la consulta, sin validación independiente por terceros.
- Metadatos temporales: las fechas declaradas de creación y actualización (2026-09-30) son posteriores a la fecha habitual de consulta de este tipo de fichas, lo que conviene verificar antes de citar el artefacto.
- La información disponible no incluye resultados de benchmarks de lenguaje ni métricas de throughput.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sankalpsthakur/industrial-edge-setpoint-kernels
- Visor interactivo de investigación: https://huggingface.co/spaces/sankalpsthakur/industrial-edge-setpoint-lab
- Artículo de referencia del predictor RFF (preprint, 2025): https://arxiv.org/abs/2511.16425
- Artículo de referencia sobre DeePC no lineal con kernel (2025): https://arxiv.org/abs/2501.17500
- Artículo de referencia de FKDPP (Cui et al., CASE 2018): https://doi.org/10.1109/COASE.2018.8560593
- Artículo de referencia sobre adaptación por RL de MPC explícito (2026): https://doi.org/10.1016/j.compchemeng.2025.109519
- Archivos referenciados en la model card (rutas relativas al repositorio): `REPORT.md`, `docs/EXPERIMENT_PROTOCOL.md`, `research/research_memo.md`, `docs/PLC_ADMISSION.md`, `architecture/public_edge_contract.md`, `results/release_tests.json`, `results/confirmation.png`, directorio `cloud/`
- Nota sobre la busqueda web: los resultados proporcionados no contienen informacion relevante sobre el modelo. Los enlaces devueltos corresponden a un mercado de articulos de videojuegos (eldorado.gg), a una promotora de conciertos (eldorado.fr) y a entradas enciclopedicas sobre la leyenda de El Dorado, por lo que no se incluyen como fuentes tecnicas.
