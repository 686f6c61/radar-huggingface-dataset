# LonghaoWang/CAS-Canglong-SST

## Resumen

CAS-Canglong SST es un modelo global de predicción mensual de la temperatura superficial del mar (SST) a 12 meses vista, desarrollado por Longhao Wang (IGSNRR, Academia China de Ciencias) y publicado como release congelada del 25 de octubre de 2026 (Round 5). No es un modelo de lenguaje: es un sistema de pronóstico estacional que, a partir de los últimos 120 meses de ocho campos mensuales de ERA5 sobre una rejilla de 1° (181 × 360), genera la SST media, su anomalía, una dispersión gaussiana y probabilidades calibradas por quintiles para los 12 meses siguientes en 40.701 celdas oceánicas.

El núcleo es un transformer 3D con auto-atención (arXiv 2409.05369) organizado en cuatro cabezas —red original con mezcla EOF, rama de fondo lento, rama conjunta océano-atmósfera y rama de estado estacional dependiente del mes calendario—, mezcladas en proporciones de 50 % / 28,125 % / 9,375 % / 12,5 %. Sobre esas cabezas se aplica una calibración Round 5 mediante regresión ridge por celda y por lead (α = 0,05, 19 coeficientes) que se mezcla al 10 % con el modelo estacional, más un ajuste gaussiano por CRPS y una corrección de probabilidades quintílicas inspirada en Guan et al. (*Nature*, 2026).

Su relevancia práctica está en la ventana subestacional-a-estacional (S2S): permite anticipar episodios ENSO y anomalías de SST con hasta un año de antelación, algo crítico para sequías, inundaciones, pesca y gestión energética. La advertencia principal es que la calibración liberada se ajustó con objetivos hasta septiembre de 2026, por lo que todas las puntuaciones históricas de estos pesos exactos —incluido el hindcast 2016-2022— son in-sample; la evidencia fuera de muestra procede de una réplica del método reajustada hasta 2022.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer 3D con auto-atención (4 cabezas: red original + EOF, fondo lento, conjunta océano-atmósfera, estado estacional) + calibración ridge por celda y lead |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 120 meses completos de entrada; salida de 12 leads (leads 13-16 no soportados) |
| Tipos de cuantizacion | no disponible; inferencia completa en BF16 sobre GPU NVIDIA |
| Idiomas soportados | no aplica (modelo geoespacial; no procesa lenguaje) |
| Licencia | MIT |
| Formato de pesos | checkpoint PyTorch dentro del paquete congelado `frozen_model_20261025_v1/` (59 archivos, 517 MB) con `FROZEN_MANIFEST.json` y `SHA256SUMS`; entradas en NPZ y salidas en NetCDF |

Otros datos técnicos: pipeline `time-series-forecasting`, librería PyTorch, tamaño del repo 0,6 GB, rejilla nominal de 1° (181 × 360), 40.701 celdas oceánicas de salida, climatología de referencia 1959-01 a 2009-08, entorno probado con Python 3.11.11, numpy 1.26.4, scipy 1.15.2, torch 2.6.0, xarray 2025.4.0, netCDF4 1.7.2, h5netcdf 1.6.1, h5py 3.13.0, pandas 2.2.3.

## Arquitectura y entrenamiento

El modelo introduce los últimos 120 meses de ocho campos mensuales de ERA5 en el orden `sst, msl, slhf, u10, v10, z500, z850, ssr`, con sus unidades y acumulaciones originales, junto con fechas, latitud, longitud y máscara de tierra. El transformer 3D establece relaciones multivariantes a través de espacio y tiempo mediante self-attention. Las cuatro cabezas se entrenaron con objetivos hasta 2009-08 y se validaron hasta 2016-04. La capa de calibración Round 5 es una ridge regression por celda y por lead (α = 0,05, 19 coeficientes) que toma como entradas las cuatro predicciones de cabeza, la anomalía observada de SST de los 1, 3 y 12 meses previos a la emisión, armónicos anuales y semianuales, un término temporal lineal y algunas interacciones estacionales; el resultado se mezcla al 10 % con el modelo estacional (90 %). La dispersión se obtiene con una escala gaussiana ajustada por CRPS y las probabilidades quintílicas con una corrección basada en probabilidad adaptada de Guan et al. (condicionamiento ridge/ periódico mensual, no una reproducción del algoritmo diario del artículo).

No se utiliza ningún modelo externo, salida de FuXi ni de un sistema NWP como característica de entrada. Las salidas son marginales por celda: media de SST y anomalía respecto a la climatología 1959-2009, `gaussian_sigma`, cuantiles gaussianos al 5, 10, 25, 50, 75, 90 y 95 %, umbrales quintílicos climáticos por mes calendario y `pbc_quintile_cdf` / `pbc_quintile_probability`. Los productos gaussiano y quintílico se calibran por separado y pueden no coincidir. No se han publicado en la información disponible ni el número de tokens de entrenamiento ni la composición detallada del dataset más allá de ERA5 y del hindcast 2016-2022 usado para evaluación.

## Capacidades

- Predicción mensual global de SST y de su anomalía para los leads 1 a 12 sobre 40.701 celdas oceánicas.
- Predicción probabilística: dispersión gaussiana por celda y cuantiles al 5/10/25/50/75/90/95 %.
- Probabilidades calibradas por categorías quintílicas respecto a la climatología 1959-2009 de cada mes calendario.
- Representación implícita de ENSO y de patrones oceano-atmosféricos acoplados gracias a la rama conjunta océano-atmósfera (`sst`, `msl`, `u10`, `v10`, `z500`, `z850`).
- Estacionalidad explícita: la rama de estado estacional modula su respuesta según el mes calendario.
- Reproducibilidad verificable: `run_frozen.py --verify-only` comprueba cada archivo contra `FROZEN_MANIFEST.json`; el paquete es de solo lectura y rechaza sobrescribir salidas.
- Replay en CPU sin ERA5 a partir de entradas preparadas (`examples/input_only_202610.npz`), con paridad exacta (máx. |Δ| = 0 en media, σ).
- No soporta generación de texto, código, matemáticas, visión, tool calling, agentes ni razonamiento multi-paso: no es un LLM.

## Casos de uso

- Vigilancia operativa de ENSO: ejecutar el modelo cada mes con ERA5 y publicar la probabilidad quintílica de SST en las regiones Niño para anticipar fase cálida o fría con 1 a 12 meses de antelación, apoyando boletines climáticos estacionales.
- Planificación agrícola: usar la anomalía de SST prevista como predictor de precipitación estacional en regiones dependientes del monzón, para decidir calendarios de siembra y asignación de agua de riego.
- Preparación ante inundaciones y sequías: integrar las probabilidades calibradas en sistemas de alerta temprana que necesiten un insumo oceánico con horizonte estacional.
- Pesca y acuicultura: anticipar desplazamientos de hábitat de especies pelágicas asociados a anomalías de SST para ajustar cuotas y rutas de flota.
- Energía: estimar demanda estacional (refrigeración, calefacción) y disponibilidad hidroeléctrica a partir del estado previsto del océano en cuencas cuya precipitación está teleconectada con ENSO.
- Inicialización de modelos hidrológicos y agronómicos: proporcionar campos mensuales de SST con incertidumbre a modelos de cuenca que requieran condiciones de contorno oceánicas.
- Seguros y gestión de riesgo climático: alimentar curvas de probabilidad por celda para valorar exposición a eventos extremos costeros.
- Investigación en ciencias del clima: banco de comparación reproducible (paquete congelado con hashes) para evaluar métodos de calibración probabilística S2S.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card cita un hindcast 2016-2022 y una evaluación temporal fuera de muestra en `evaluation/round6_temporal_holdout_20261026/` sobre objetivos de 2023-01 a 2026-09 (con `metrics.csv` y puntuaciones por caso), pero los valores numéricos no se incluyen en la información proporcionada. Cabe advertir que las puntuaciones históricas de estos pesos exactos son in-sample: la calibración se ajustó con objetivos hasta 2026-09 y sus hiperparámetros se seleccionaron con diagnósticos bloqueados por año de esos mismos años.

## Requisitos de hardware

- VRAM estimada: no disponible (el número de parámetros no se publica).
- Inferencia completa: una GPU NVIDIA con soporte BF16, invocada mediante `run_frozen.py --gpu-uuid GPU-xxxx --input monthly_input.npz --as-of-month AAAA-MM`.
- Ejecución en CPU: viable para el camino de entrada preparada (solo las cuatro predicciones de cabeza, contexto causal y fechas válidas), con paridad exacta verificada frente a la release; requiere `numpy`, `scipy`, `torch`, `xarray`, `netCDF4`, `h5netcdf`, `h5py`, `pandas`, `matplotlib`, `threadpoolctl`.
- GPU de consumo: no confirmado en la información disponible; el paquete ocupa 517 MB en disco, por lo que el cuello de botella previsible es la memoria del tensor de entrada (8 campos × 120 meses × 181 × 360) más que el tamaño de los pesos.
- Despliegue: script propio `run_frozen.py` y `smoke_test.py`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este dominio).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / horizonte | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CAS-Canglong SST (esta ficha) | Transformer 3D + calibración ridge | no disponible | 120 meses de entrada, 12 leads | MIT | Pesos congelados en HuggingFace |
| CAS-Canglong original (arXiv 2409.05369) | Transformer 3D | no disponible | S2S | no disponible | Paper público |
| FuXi-S2S | modelo de pronóstico S2S | no disponible | no disponible | no disponible | no disponible en la información manejada |
| Sistemas NWP físicos (p. ej. CFSv2, SEAS5) | modelo numérico acoplado | no aplica | estacional | propietaria / institucional | operativa |

No se dispone de datos comparativos de rendimiento entre estas alternativas en la información proporcionada; la model card solo indica que FuXi y las salidas NWP no se usan como características de entrada.

## Limitaciones y advertencias

- Todos los scores históricos de estos pesos exactos son in-sample: la calibración se ajustó con objetivos hasta 2026-09 y los hiperparámetros se eligieron sobre diagnósticos de los mismos años.
- El modelo amortigua rápidamente los eventos ENSO fuertes, según reconoce el propio autor; las probabilidades en episodios extremos deben tratarse con cautela.
- Las salidas gaussiana y quintílica se calibran por separado y pueden ser inconsistentes entre sí.
- Son distribuciones marginales por celda, no un ensemble espacio-temporal coherente: no sirven para generar trayectorias conjuntas ni para cálculos de correlación espacial estricta.
- Solo se soportan leads 1-12; los leads 13-16 no están implementados.
- Las celdas fuera de las 40.701 oceánicas de entrenamiento devuelven NaN.
- `ocean_mask` en el NPZ de entrada conserva el significado histórico invertido (True = tierra), una fuente habitual de errores de integración.
- Dependencia total de la calidad y disponibilidad de ERA5 para el camino de inferencia completa; los errores o huecos en los 120 meses de entrada degradan la predicción.
- El paquete es de solo lectura y rechaza sobrescribir salidas: los pipelines de producción deben gestionar rutas de salida nuevas por ejecución.
- No debe usarse como sustituto de avisos meteorológicos oficiales ni para decisiones de seguridad sin validación local.
- Licencia MIT: permite uso comercial y modificación con atribución y sin garantía; conviene revisar los términos del dataset ERA5 subyacente y del hindcast asociado.
- Sesgos geográficos y de régimen climático no cuantificados en la información disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/LonghaoWang/CAS-Canglong-SST
- Space de pronóstico en vivo: https://huggingface.co/spaces/LonghaoWang/CAS-Canglong
- Dataset de hindcast 2016-2022: https://huggingface.co/datasets/LonghaoWang/SST-Hindcast-2016-2022-1deg-lead1-12
- Código: https://github.com/GISWLH/CAS-Canglong
- Artículo en *Advanced Science* (2026): https://doi.org/10.1002/advs.78271
- Portal del proyecto: https://canglong.earth
- Preprint arXiv 2409.05369: https://arxiv.org/abs/2409.05369
- Versión HTML del preprint: https://arxiv.org/html/2409.05369v1
- Página del autor: https://giswlh.github.io/
- Referencia metodológica de calibración quintílica (Guan et al., *Nature* 2026): https://www.nature.com/articles/s41586-026-11126-x
