# mrvictoru/AEMO_simulated_trade_sdp

## Resumen

El dataset `mrvictoru/AEMO_simulated_trade_sdp` es un corpus de trayectorias offline diseñado para el entrenamiento de modelos de tipo Decision Transformer en el ámbito del trading de baterías de almacenamiento energético en el mercado eléctrico mayorista australiano (National Electricity Market, NEM). Ha sido desarrollado por mrvictoru como parte del proyecto de investigación `energydecision`, y constituye la etapa B (teacher) del pipeline: las trayectorias se generan reproduciendo un ejecutor SDP/MPC "honesto" (no clairvoyante) sobre datos históricos de AEMO, de modo que cada fila contiene una tripleta autoconsistente de observación normalizada, acción de 9 dimensiones y recompensa.

El dataset se compone de dos archivos Parquet que representan dos políticas docentes distintas: una conservadora (con coste de degradación alto, `deg_cost_per_mwh=50`) y otra agresiva (con coste de degradación bajo, `deg_cost_per_mwh=20`). Juntos abarcan el espectro de compromiso entre participación en el mercado de servicios auxiliares de control de frecuencia (FCAS) y arbitraje de energía. La relevancia actual radica en que proporciona datos de alta calidad, generados con un planificador óptimo estocástico, para entrenar agentes de RL offline en un dominio con aplicaciones industriales directas y con una estructura de recompensa realista (beneficio económico menos coste de degradación).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Formato de archivos | Parquet (2 archivos) |
| Filas por archivo | 3.133.440 (≈3,13 M) |
| Episodios por archivo | 320 |
| Regiones cubiertas | NSW1, QLD1, SA1, TAS1, VIC1 |
| Tamaños de batería | medium_1c (10 MWh), fast_375c (8 MWh), large_07c (50 MWh), small_05c (2 MWh) |
| Horizontes temporales | corto (≈14 días) y medio (≈8 semanas) |
| Rango temporal de los datos | 2021–2023 |
| Columnas | step, norm_observation, raw_observation, action, reward, info, episode_id, source_policy, region, battery |
| Dimensión de observación | 18 (tiempo, precio, demanda, 8 precios FCAS, fracción solar/eólica, SOC) |
| Dimensión de acción | 9 (despacho de energía + 8 ofertas FCAS) |
| Licencia | MIT |
| Idioma de los metadatos | en |
| Tamaño total del dataset | no disponible |
| Pipeline de HuggingFace | no disponible |

## Arquitectura y entrenamiento

Este dataset no es un modelo, sino un corpus de entrenamiento. Su generación sigue un proceso en tres etapas documentado en el repositorio `energydecision`:

1. **Construcción del pronóstico**: se genera un pronóstico estacional de precios por hora del día a partir exclusivamente de datos de entrenamiento (2021–2023), excluyendo deliberadamente los picos de precio para que el planificador no tenga ventaja informativa sobre eventos extremos.
2. **Planificación energética con SDP**: un programa dinámico estocástico (`AEMOSDPSolver`) realiza inducción hacia atrás sobre el pronóstico para decidir el despacho de energía, incorporando un modelo de degradación rainflow y un coste lineal de throughput. El resultado es una política de despacho óptima bajo incertidumbre, pero sin acceso a precios futuros realizados (honesta).
3. **Asignación de FCAS**: un post-procesador greedy asigna el headroom residual de la batería a los servicios de subida/bajada de frecuencia mejor pagados en cada intervalo de 5 minutos.

La combinación de los dos archivos (conservador y agresivo) permite que un modelo entrenado con condicionamiento por *return-to-go* (RTG) seleccione el punto de operación deseado en inferencia, ya que las recompensas reflejan el beneficio real obtenido bajo cada política.

## Capacidades

- **Entrenamiento de Decision Transformers**: el esquema de columnas coincide con el `TrajectoryDataset` usado en `scripts/pretrain_decision_transformer.py` del repositorio `energydecision`. Permite entrenar un DT de 9 dimensiones de acción con cabeza mixta Tanh/Sigmoid.
- **Condicionamiento por return-to-go**: al concatenar ambos archivos, el modelo puede seleccionar entre un comportamiento conservador (más FCAS, menos ciclos de energía) y uno agresivo (más arbitraje de energía, +57% de despacho energético) según el RTG proporcionado en inferencia.
- **Datos normalizados y crudos**: cada fila incluye tanto la observación normalizada (lista de 18 floats) como la versión sin normalizar, facilitando tanto el entrenamiento directo como el análisis posterior.
- **Cobertura geográfica y de configuración**: 5 regiones del NEM, 4 tamaños de batería y 2 horizontes de episodio, con 8 episodios por combinación, lo que proporciona diversidad suficiente para estudiar generalización.
- **Recompensa autoconsistente**: la recompensa de cada paso es el beneficio real obtenido por la acción ejecutada bajo el entorno, no un valor simulado independiente, lo que evita inconsistencias entre observación, acción y retorno.

## Casos de uso

- **Entrenamiento de agentes RL offline para arbitraje de energía**: el dataset permite entrenar políticas que maximizan el beneficio comprando energía a precios bajos y vendiendo a precios altos, con un modelo de degradación realista. Un Decision Transformer entrenado sobre estas trayectorias puede desplegarse en un entorno de simulación o en producción con un pipeline de inferencia en tiempo real.
- **Optimización de participación en mercados FCAS**: los datos incluyen ofertas de 8 servicios de control de frecuencia, lo que permite entrenar agentes que deciden cuánta capacidad residual dedicar a cada servicio según los precios instantáneos. Es útil para operadores de baterías que buscan maximizar ingresos auxiliares sin descuidar el arbitraje energético.
- **Investigación en RL offline aplicado a energía**: el dataset sirve como banco de pruebas para algoritmos de *offline RL*, *behaviour cloning* condicionado por retorno o *sequence modelling*. Su estructura limpia y autoconsistente facilita la reproducción de experimentos.
- **Simulación de estrategias de trading para baterías**: combinado con el entorno AEMO del repositorio `energydecision`, permite evaluar el rendimiento de políticas entrenadas frente a diferentes condiciones de mercado (estacionales, con o sin picos).
- **Estudio del compromiso degradación vs. beneficio**: los dos archivos del dataset permiten analizar cuantitativamente cómo varía el beneficio económico al cambiar el coste de degradación, y cómo un modelo puede aprender a navegar ese trade-off mediante RTG.
- **Generación de datos sintéticos para planificación energética**: las trayectorias pueden usarse como datos de demostración para *imitation learning* o para inicializar políticas que luego se refinan con *online RL*.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El dataset no incluye métricas de rendimiento de modelos entrenados sobre él, ni comparaciones con otras políticas de referencia más allá de los dos profesores SDP descritos.

## Requisitos de hardware

- **Procesamiento del dataset**: no requiere GPU. Para cargar un archivo Parquet de ~3,13 M de filas con columnas de listas (18 y 9 floats) se recomienda al menos 8 GB de RAM; con Polars o PyArrow la carga es eficiente en CPU.
- **Entrenamiento de un Decision Transformer**: para un modelo de 8 capas y 768 unidades ocultas (como el sugerido en el README) sobre este dataset, se recomienda una GPU con al menos 12 GB de VRAM (p. ej., RTX 3060/4070 o superior). Con lotes pequeños y *gradient accumulation* podría caber en 8 GB.
- **Opciones de despliegue**: al ser un dataset, no aplica despliegue de inferencia. Para entrenamiento se puede usar PyTorch + HuggingFace Transformers o el código del repositorio `energydecision`. Para lectura eficiente se recomienda Polars o PyArrow.
- **Latencia y throughput**: no disponible, depende del hardware y del modelo entrenado.

## Comparativa con modelos similares

No se trata de un modelo, sino de un dataset. Como referencia, se puede comparar con otros datasets de RL offline para energía:

| Dataset | Formato | Filas | Regiones | Política generadora | Licencia |
|---|---|---|---|---|---|
| `AEMO_simulated_trade_sdp` (este) | Parquet | 3,13 M × 2 | 5 (NEM) | SDP honesto + FCAS greedy | MIT |
| `AEMO_simulated_trade` (anterior) | Parquet | no disponible | no disponible | SDP + pronósticos TTM | MIT |
| Otros datasets públicos de RL offline (p. ej., D4RL) | HDF5/NumPy | variable | n/a | Mixta | Apache/MIT |

La diferencia clave frente a `AEMO_simulated_trade` es que este dataset incorpora explícitamente la dimensión FCAS (9 acciones) y dos variantes de política docente que permiten condicionamiento por retorno, mientras que el anterior se centraba en arbitraje energético con pronósticos de un modelo fundacional de series temporales.

## Limitaciones y advertencias

- **Datos limitados a 2021–2023**: el rango temporal es fijo y no incluye eventos posteriores como cambios regulatorios o crisis energéticas recientes. Para aplicaciones en producción, se necesitaría reentrenar con datos actualizados.
- **Solo 5 regiones del NEM**: no cubre otras regiones australianas (p. ej., WEM de Australia Occidental) ni otros mercados internacionales.
- **Política docente no clairvoyante**: aunque es honesta (no usa precios futuros), el pronóstico estacional excluye picos, lo que puede subestimar el valor de estrategias que aprovechan eventos extremos.
- **Riesgo de sesgo en la generación**: la política FCAS es greedy y no considera interacciones entre servicios a lo largo del tiempo; esto puede limitar la riqueza de comportamientos aprendibles.
- **Licencia MIT para el dataset, pero los datos subyacentes de AEMO pueden tener restricciones adicionales**: el autor no especifica si los datos de mercado de AEMO requieren atribución o tienen términos de uso propios. Conviene verificar antes de un uso comercial.
- **Sin benchmarks publicados**: no hay evidencia empírica de que un modelo entrenado sobre este dataset supere a otras políticas, por lo que su eficacia debe validarse en cada caso.

## Enlaces

- Dataset en HuggingFace: [https://huggingface.co/datasets/mrvictoru/AEMO_simulated_trade_sdp](https://huggingface.co/datasets/mrvictoru/AEMO_simulated_trade_sdp)
- Repositorio fuente: [https://github.com/mrvictoru/energydecision](https://github.com/mrvictoru/energydecision)
- Modelos preentrenados asociados: [https://huggingface.co/mrvictoru/energydecision-dt-v2](https://huggingface.co/mrvictoru/energydecision-dt-v2)
- Dataset anterior relacionado: [https://huggingface.co/datasets/mrvictoru/AEMO_simulated_trade](https://huggingface.co/datasets/mrvictoru/AEMO_simulated_trade)
- Documentación del entorno AEMO en el repositorio: [https://github.com/mrvictoru/energydecision/blob/main/docs/aemo/README.md](https://github.com/mrvictoru/energydecision/blob/main/docs/aemo/README.md)
