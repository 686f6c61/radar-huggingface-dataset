# makactuary/danish-fire-xl-priority

## Resumen

`makactuary/danish-fire-xl-priority` no es un modelo de lenguaje ni una red neuronal: es un artefacto estadístico publicado en HuggingFace que contiene el resultado de un ajuste de teoría de valores extremos (EVT) sobre la cola de la siniestralidad de incendios daneses, junto con una tabla de prioridades (puntos de retención) para un contrato de reaseguro excess-of-loss. Lo firma el usuario `makactuary` y acompaña al artículo de Café Poliçe «Reasürans Dilimini Nereye Koymalı?» ("¿dónde debe situarse la capa de reaseguro?"), cuyo código vive en un repositorio de GitHub independiente.

El modelo resuelve un problema concreto de suscripción: decidir a partir de qué importe conviene ceder siniestros a un reasegurador. Para ello ajusta una distribución generalizada de Pareto (GPD) a los 109 siniestros que superan los 10 mDKK en el conjunto `danishuni` (2.167 siniestros de Copenhagen Re, 1980-1990, valores de 1985), obteniendo un índice de cola ξ = 0,50 (IC bootstrap del 95%: 0,13-0,79) y una escala σ = 6,98. Con esos parámetros construye una tabla que cruza pérdida cedida, burning cost, SCR y coste total para cada prioridad candidata.

Su relevancia es metodológica y acotada: sirve como ejemplo reproducible de cómo combinar EVT con un criterio económico (margen del 30% y coste de capital del 10%) para elegir una retención. El propio autor advierte que es una ilustración de método y no una recomendación de reaseguro. El repositorio es de tamaño 0.0 GB, con 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de excedentes sobre umbral (POT) con distribución generalizada de Pareto (GPD); no es un transformer ni una red neuronal |
| Parámetros totales | Dos parámetros de cola (ξ y σ) más el umbral u = 10 mDKK; no aplica el concepto de parámetros de un modelo neuronal |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica; el ajuste es puntual y no hay ventana de contexto |
| Tipos de cuantización | No aplica; no hay pesos que cuantizar |
| Idiomas soportados | No disponible en los metadatos; la model card está en inglés y el título del artículo original en turco |
| Licencia | MIT (repositorio); el conjunto de datos de origen, `danishuni` de CASdatasets, es GPL ≥ 2 |
| Formato de pesos | No hay safetensors ni GGUF; el repositorio contiene `metrics.json`, `priority_table.csv` y `01_kuyruk_ve_muafiyet.png` |

## Arquitectura y entrenamiento

El procedimiento sigue el esquema clásico de picos sobre umbral: se fija un umbral de 10 mDKK, se conservan los 109 siniestros que lo exceden de un total de 2.167 y se ajusta una GPD a los excesos. El resultado es una cola de tipo Pareto con ξ = 0,50, lo que implica varianza infinita en el modelo ajustado y, en la práctica, una cola muy pesada. La incertidumbre del índice de cola se cuantifica mediante bootstrap, con un intervalo del 95% de 0,13 a 0,79, reflejando que solo 109 observaciones sostienen la estimación.

Sobre ese ajuste se construye una tabla de prioridades que combina la frecuencia (modelada como Poisson sin tendencia), la severidad de cola y un criterio económico: margen de seguridad θ = 30% y coste de capital del 10%. La validación es un backtest fuera de muestra con los años 1988-1990. No se documenta en la información disponible ni el software de ajuste ni el detalle del bootstrap, ni si se aplicó corrección por inflación a los valores de 1985.

## Capacidades

- Ajuste y resumen de una cola GPD sobre datos de siniestros con umbral fijado.
- Estimación puntual e intervalos bootstrap del índice de cola ξ y de la escala σ.
- Cálculo de pérdida cedida, burning cost, SCR y coste total para cada prioridad candidata.
- Identificación de la prioridad de coste mínimo bajo supuestos económicos declarados (θ = 30%, coste de capital = 10%).
- Análisis de sensibilidad: rango de prioridades (37,5-100 mDKK) que quedan dentro del 5% del coste mínimo.
- Backtest fuera de muestra de una prioridad concreta frente a los años 1988-1990.
- No soporta generación de texto, tool calling, agentes, razonamiento multi-paso ni capacidades multilingües; no es un modelo generativo.

## Casos de uso

- Calibración del punto de retención de una capa XL: la tabla de prioridades permite localizar el importe a partir del cual la cesión reduce el coste esperado total, usando el mínimo en 60 mDKK como referencia y el intervalo 37,5-100 mDKK como margen de negociación.
- Comparación de estructuras de reaseguro por coste total: con 34,2 mDKK anuales frente a 65,1 mDKK sin reaseguro, el artefacto permite argumentar cuantitativamente el ahorro esperado de contratar protección.
- Análisis de sensibilidad de supuestos económicos: al estar θ y el coste de capital declarados explícitamente, se puede discutir en comité cómo se desplaza la prioridad óptima al modificarlos, en lugar de presentar un único número cerrado.
- Estimación del requerimiento de capital (SCR) del tramo de cola: la tabla incluye el SCR por prioridad, lo que facilita el diálogo entre suscripción y función actuarial sobre el consumo de capital de cada estructura.
- Validación de implementaciones propias de EVT: sirve como caso de prueba reproducible para verificar que un ajuste GPD propio sobre `danishuni` reproduce ξ ≈ 0,50 y σ ≈ 6,98 antes de aplicarlo a una cartera real.
- Docencia y divulgación: es un ejemplo compacto y documentado para explicar en formación interna por qué la elección del umbral y del criterio económico determina la prioridad, y qué incertidumbre arrastra con 109 excesos.
- Diseño de backtests internos: el esquema de hold-out 1988-1990 con comparación esperado/observado (107 frente a 213 mDKK anuales) es replicable como plantilla de validación para otras carteras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en el formato habitual (MMLU, HumanEval, GSM8K) en la información disponible, por tratarse de un artefacto estadístico y no de un modelo de lenguaje. Las únicas métricas reportadas son de ajuste y de backtest:

| Métrica | Valor reportado | Notas |
|---|---|---|
| Umbral de excedencia | 10 mDKK | 109 siniestros por encima de un total de 2.167 |
| Índice de cola ξ | 0,50 | IC bootstrap del 95%: 0,13-0,79 |
| Escala σ de la GPD | 6,98 | Ajuste sobre los 109 excesos |
| Prioridad de coste mínimo | 60 mDKK | Con θ = 30% y coste de capital del 10% |
| Rango dentro del 5% del mínimo | 37,5-100 mDKK | Zona de indiferencia económica |
| Coste anual con reaseguro | 34,2 mDKK | Frente a 65,1 mDKK sin reaseguro |
| Backtest 1988-1990, prioridad 10 | Esperado 107 frente a observado 213 mDKK/año | El 3,9% de las simulaciones resultaron igual de malas |

No se dispone de comparación con otros ajustes sobre el mismo conjunto de datos en la información proporcionada.

## Requisitos de hardware

- VRAM para inferencia: 0 GB; el artefacto no requiere GPU.
- GPU recomendadas: ninguna. Cualquier CPU sirve para leer y agregar los resultados.
- Cabe en cualquier equipo, incluidos portátiles de gama baja y entornos sin acelerador.
- Despliegue: lectura directa de `metrics.json` y `priority_table.csv` con pandas, R, Excel o cualquier herramienta de hoja de cálculo; no aplican vLLM, llama.cpp, Ollama ni TGI.
- Si se opta por reajustar la GPD sobre las 2.167 observaciones, el coste computacional es despreciable (segundos en CPU) y el bootstrap es la única parte que escala con el número de réplicas; no se reporta ninguna medición de latencia o throughput.
- Almacenamiento: el repositorio declara 0.0 GB, por lo que conviene verificar que los ficheros citados están efectivamente presentes antes de integrarlos en un pipeline.

## Comparativa con modelos similares

No se conocen en la información proporcionada otros repositorios de HuggingFace directamente comparables. La comparación solo puede plantearse a nivel de método:

| Alternativa | Enfoque | Incertidumbre documentada | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este repositorio | GPD ajustada con umbral fijado más tabla de prioridades con criterio económico | Sí (IC bootstrap 0,13-0,79) | MIT (datos GPL ≥ 2) | Pública en HuggingFace |
| Ajuste propio con `scipy.stats.genpareto` o paquetes de R (`evd`, `ismev`, `extRemes`) | Misma familia GPD, sin tabla de prioridades ni criterio de coste de capital | Depende de la implementación | Licencias de cada librería (BSD en SciPy; GPL en varios paquetes de R) | Pública |
| Plataformas comerciales de modelización de catástrofes | Modelización de catástrofes completa, no solo cola | No disponible | Propietaria | Comercial |

No se han verificado datos de rendimiento comparativos entre estas opciones en la información disponible.

## Limitaciones y advertencias

- El supuesto de capa ilimitada (unlimited layer) ignora límites, reinstalaciones y cláusulas habituales de los contratos reales, por lo que el coste calculado no es directamente trasladable a una póliza.
- La frecuencia se modela como Poisson sin tendencia; no se incorpora crecimiento de cartera, inflación ni cambios de exposición entre 1980 y 1990.
- El margen θ = 30% y el coste de capital del 10% son supuestos del autor, no estimaciones; la prioridad óptima depende de ellos.
- La cola se apoya en solo 109 excesos, lo que produce un intervalo de confianza muy amplio para ξ (0,13-0,79) y hace que la varianza del modelo ajustado sea infinita con ξ = 0,50.
- El backtest 1988-1990 con prioridad 10 arroja 213 mDKK observados frente a 107 esperados: el modelo subestima aproximadamente un factor de dos, y el 3,9% de las simulaciones resultaron igual de adversas que la realidad.
- Los datos proceden de una única cartera (Copenhagen Re, Dinamarca) y de valores de 1985; no se documenta ajuste por inflación, lo que limita la extrapolación geográfica y temporal.
- Licencia: el repositorio es MIT, pero el dataset `danishuni` de CASdatasets es GPL ≥ 2; los términos no son idénticos y la redistribución de datos derivados requiere revisión.
- El autor califica explícitamente el trabajo como ilustración de método y no como recomendación de reaseguro; no debe usarse como única base para una decisión de suscripción.
- El repositorio declara 0.0 GB de tamaño, 0 descargas y 0 likes, sin pipeline definido ni idiomas declarados; la ausencia de los ficheros citados o la falta de revisión por terceros son riesgos reales de reproducibilidad.
- Riesgo de alucinación: no aplica, al no ser un modelo generativo; el riesgo equivalente es la confianza excesiva en una estimación de cola con muestra pequeña.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/makactuary/danish-fire-xl-priority
- Código del artículo: https://github.com/000MAK/cafepolice-reinsurance-priority
- Artículo de Café Poliçe «Reasürans Dilimini Nereye Koymalı?»: no disponible
- Conjunto de datos `danishuni` (CASdatasets, GPL ≥ 2): no disponible como URL directa en la información proporcionada
- Paper o documentación metodológica adicional: no disponible
