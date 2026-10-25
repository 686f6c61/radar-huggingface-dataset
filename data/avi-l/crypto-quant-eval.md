# Avi-L/crypto-quant-eval

## Resumen

`Avi-L/crypto-quant-eval` no es un modelo de aprendizaje automatico, sino un arnes de evaluacion (evaluation harness) en Python para estrategias de trading cuantitativo en criptomonedas, con un conjunto de barridos sistematicos de estrategias (single-asset horario y panel multi-asset diario). Lo publica el usuario Avi-L en Hugging Face, generado con la herramienta ML Intern, y se acompana de un dataset propio en `Avi-L/crypto-quant-eval-data` con ficheros parquet de barras y de funding.

El problema que aborda es el sesgo de seleccion y la fuga de informacion en backtests financieros: el arnes solo declara que una estrategia "pasa" si supera simultaneamente controles de ausencia de lookahead (purga y embargo), auditoria de leakage por cada fold de CPCV, PnL con comisiones y slippage realistas, Deflated Sharpe Ratio (DSR > 0.95), Probability of Backtest Overfitting (PBO <= 0.5) y longitud minima de track record. La metodologia sigue a Lopez de Prado, *Advances in Financial Machine Learning* (Wiley 2018), capitulos 7 y 11-12, apoyandose en la libreria `purgedcv` 0.1.11.

Su relevancia ahora es negativa y por eso mismo interesante: el barrido v1 sobre BTCUSDT 1h (136 configuraciones) concluye FAIL, ninguna configuracion supera el umbral institucional, mientras que el barrido v2 sobre panel diario multi-asset (66 configuraciones, 2014-2026) encuentra una configuracion que pasa todas las puertas (Donchian 20d long-only en ETH, DSR 0.9981, PBO 0.257), con la advertencia de que su ventaja se concentra antes de 2022. No hay parametros, contexto ni pesos: el repositorio contiene codigo, configuraciones y resultados, no un modelo neuronal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no aplica (no es un modelo neuronal; es un arnes de evaluacion en Python) |
| Parametros totales | no aplica |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | no disponible (el codigo y la documentacion estan en ingles) |
| Licencia | no disponible (la model card no especifica licencia) |
| Formato de pesos | no aplica (repositorio de codigo; dataset companion en parquet) |
| Tipo de artefacto | harness de evaluacion + resultados de barridos (`results/sweep_report_v1.json`) |
| Metodo de particion | CPCV con N=6 bloques, K=2 retenidos, 15 combinaciones |
| Libreria de particion | `purgedcv` 0.1.11 |
| Horizonte / embargo (v1 horario) | 8 h (un intervalo de funding) |
| Purga / embargo (v2 diario) | 5 dias |
| Comisiones modeladas | 5 bps taker / 2 bps maker (Binance VIP0) |
| Slippage | impacto raiz cuadrada `k * sigma_daily * sqrt(Q/ADV)`, suelo de 2 bps |
| Volatilidad diaria realizada del dataset | 317 bps |
| Dependencias de datos | `bars_<SYMBOL>_<freq>.parquet`, `funding_<SYMBOL>.parquet`, `manifest.json` |
| Punto de entrada | `run_eval.py` / `sweep.py` |
| Fecha de creacion / actualizacion | 2026-10-23 / 2026-10-25 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El repositorio se organiza en modulos con responsabilidades separadas: `crypto_eval/cv.py` (particionado CPCV con purga y embargo, mas auditoria independiente de leakage por segmento y por fold), `crypto_eval/costs.py` (comisiones, funding devengado en ticks de 8 h e impacto de slippage), `crypto_eval/stats.py` (DSR, PBO, MinBTL) y `crypto_eval/strategies.py` (registro de estrategias). Las estrategias son funciones con firma `(bars, funding) -> positions`; la disciplina temporal se impone estructuralmente, de modo que una barra que empieza en `t` cierra en `t+freq` y las senales usan `shift_bars` sobre la ultima barra cerrada en `t-1`.

No hay entrenamiento de pesos ni fases de RLHF/DPO. Lo que hay es un protocolo de validacion estadistica: cada configuracion del barrido cuenta como un ensayo en el calculo del Deflated Sharpe, se exige PBO <= 0.5 mediante CSCV y se audita que la ventana de etiqueta `[t, t+h]` no solape nunca con un bloque de test. El slippage se modela con impacto de raiz cuadrada calibrado con la volatilidad diaria realizada de los propios datos (317 bps en este dataset) y un suelo de 2 bps.

Dos detalles tecnicos destacables por su honestidad metodologica: (1) el 2026-10-25 se corrigio un modelo de slippage mal escalado de la ejecucion original del 2026-10-23, que omitia el termino `sigma_daily` y sobreestimaba el impacto en ~50x, lo que cambio el veredicto sobre la estrategia de carry; (2) durante el barrido v2 se detecto y corrigio un fallo del motor por el cual el divisor de cartera otorgaba apalancamiento implicito en la primera era (el capital no asignado pasa a contarse como caja), correccion que rebajo todos los numeros del panel y que el PASS sobrevivio.

## Capacidades

- Evaluacion de estrategias con puertas eliminatorias encadenadas: lookahead, leakage, costes, DSR, PBO y track record minimo.
- Particionado CPCV (N=6, K=2, 15 combinaciones) con purga y embargo configurables por frecuencia (8 h en horario, 5 d en diario).
- Auditoria de leakage independiente por segmento y por fold, con fallo explicito de la ejecucion ante violacion.
- PnL consciente de costes: comisiones taker/maker, funding devengado a ticks de 8 h y slippage con impacto dependiente de ADV por activo.
- Calculo de Deflated Sharpe Ratio ajustado por numero de ensayos contados, PBO por CSCV y Minimum Track Record Length.
- Barridos sistematicos de configuraciones (grid search contabilizado) sobre una o varias estrategias y activos.
- Soporte de paneles multi-asset diarios y de series single-asset horarias.
- Extension sencilla: anadir estrategias como funciones en `crypto_eval/strategies.py`.
- Analisis por eras temporales para detectar decaimiento de la ventaja (usado en el v2).
- No incluye: generacion de texto, codigo, vision, audio, tool calling, agentes ni capacidades multilingues.

## Casos de uso

- Validacion previa a produccion de una estrategia de tendencia: ejecutar `run_eval.py` con los parquet de barras y funding del activo y comprobar si la estrategia supera DSR > 0.95 y PBO <= 0.5 antes de asignar capital.
- Descarte de estrategias sobreajustadas: usar el PBO por CSCV (0.63 en el barrido horario v1) para demostrar que la seleccion dentro del grid es peor que una moneda al aire, y evitar asi desplegar el "mejor" resultado de una busqueda exhaustiva.
- Auditoria de fuga de informacion en pipelines propios: reutilizar `cv.py` para verificar que las etiquetas `[t, t+h]` no solapan bloques de test y que el desplazamiento de senales (`shift_bars`) es correcto.
- Modelado de costes realista: emplear `costs.py` para estimar el impacto de comisiones (5/2 bps), funding y slippage raiz cuadrada sobre el ADV de cada activo antes de estimar capacidad.
- Comparacion de familias de estrategias bajo un unico protocolo: TSMOM, Donchian, funding carry, eventos de funding extremo y controles de reversion a la media evaluados con las mismas puertas y contabilidad de ensayos.
- Investigacion academica y docencia: reproduccion de las tecnicas de los capitulos 7 y 11-12 de Lopez de Prado (purged K-fold con embargo, DSR, PBO, MinBTL) con datos reales y resultados publicados.
- Seleccion de regimen de frecuencia: contrastar evidencia horaria (v1, FAIL) frente a diaria multi-asset (v2, PASS) para decidir en que horizonte buscar ventaja y con que coste de multiple testing.
- Control de decaimiento de la ventaja: usar el analisis por eras para distinguir configuraciones con SR alto en muestra completa pero degradado en la era reciente (ETH Donchian 20d, SR 0.50 en 2023-26) de las era-estables (BTC Donchian 200d, SR 0.92 reciente).

## Benchmarks y rendimiento

Barrido v2, panel diario multi-asset (2026-10-25), 66 configuraciones, datos diarios 2014-01 a 2026-10, 4.526 dias x 8 majors (indice VWAP de coinmetrics, comisiones 5/2 bps, impacto por ADV, arrastre de funding 0.1095 APR). Ganadora: Donchian 20d long-only en ETH.

| Puerta | Valor | Requisito | Resultado |
|---|---|---|---|
| Deflated Sharpe (66 ensayos) | 0.9981 | > 0.95 | pasa |
| PBO (CSCV, 8 splits) | 0.257 | <= 0.5 | pasa |
| Auditoria de leakage (15 combinaciones CPCV) | OK | sin leakage | pasa |
| SR medio OOS (CPCV, purga+embargo 5 d) | 1.48 | no definido | 15/15 combinaciones positivas |
| SR muestra completa / MDD | 1.56 / -61% | no definido | skew +1.28, curtosis 18 |

Analisis por eras de la ganadora y alternativas era-estables:

| Configuracion | SR era 2023-26 | SR muestra completa |
|---|---|---|
| Donchian 20d long-only ETH (ganadora) | 0.50 | 1.56 |
| Donchian 200d long-only BTC | 0.92 | 0.93 |
| TSMOM 50d BTC | 0.89 | no disponible |
| Donchian 20d BTC | 0.87 | no disponible |

Barrido v1, single-asset horario (2026-10-25): FAIL. BTCUSDT 1h, 59.654 barras (2020-01 a 2026-10), 5.295 ticks de funding, capital inicial 1.000.000 USD, CPCV N=6/K=2, horizonte = embargo = 8 h, 136 configuraciones contadas.

| Puesto | Configuracion | SR medio OOS (CPCV) | Combinaciones positivas | PnL neto | Puertas |
|---|---|---|---|---|---|
| 1 | Donchian 55d long-only | 0.41 | 12/15 | +61.557 USD | DSR ~0 falla, PBO 0.63 falla |
| 2 | TSMOM 65d long-only | 0.35 | 11/15 | +54.597 USD | DSR ~0 falla |
| 3 | TSMOM 200d long-only + vol-target 30% + banda 20% | 0.39 | 11/15 | +35.178 USD | DSR ~0 falla |

Validacion de estrategias de demostracion (costes corregidos el 2026-10-25):

| Estrategia | PnL neto | Comisiones | Slippage | Funding | SR medio OOS | PBO | Veredicto |
|---|---|---|---|---|---|---|---|
| `funding_carry` | +22.242 USD | 2.856 USD | 3.016 USD | +5.940 USD | +0.17 | 0.100 | REJECT (PSR 0.53) |

## Requisitos de hardware

- No requiere GPU ni VRAM: es codigo Python de proposito general con dependencias declaradas en `requirements.txt` (contenido no detallado en la informacion disponible).
- Despliegue previsto en CPU; el coste dominante es el numero de configuraciones del grid (136 en v1, 66 en v2) y el volumen de datos (59.654 barras horarias; 4.526 dias x 8 activos en diario).
- GPU recomendadas: no aplica.
- Cabe en consumer GPU: no aplica; cabe en cualquier maquina capaz de ejecutar Python con pandas/parquet.
- Opciones de despliegue: ejecucion directa con `python run_eval.py` y `sweep.py`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplica).
- Latencia y throughput: no disponibles; la model card no publica tiempos de ejecucion por configuracion.
- Almacenamiento: requiere el dataset companion (`Avi-L/crypto-quant-eval-data`) con los parquet de barras, funding y `manifest.json`.

## Comparativa con modelos similares

No es un modelo, por lo que la comparacion se hace con herramientas de validacion de backtests y no con modelos de lenguaje. Los datos de las alternativas no estan en la informacion proporcionada.

| Herramienta | Enfoque | CPCV con purga y embargo | DSR / PBO | Costes y funding integrados | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `Avi-L/crypto-quant-eval` | harness de evaluacion cripto con puertas eliminatorias | si (N=6/K=2, 15 combinaciones, auditoria por fold) | si (DSR > 0.95, PBO <= 0.5, MinBTL) | si (5/2 bps, funding 8 h, slippage raiz cuadrada) | no disponible | Hugging Face, 0 descargas |
| `purgedcv` 0.1.11 | libreria de particionado purgado | si (es la dependencia usada) | no disponible | no | no disponible | PyPI |
| Implementaciones ad hoc sobre pandas/backtrader/vectorbt | backtesting generico | habitualmente parcial o ausente | rara vez | variable | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo de IA: no genera texto, codigo ni respuestas; cualquier expectativa de inferencia es erronea.
- Licencia no especificada en la model card: el uso comercial, la redistribucion y la modificacion no estan autorizados de forma explicita. Conviene contactar con el autor antes de integrarlo en produccion.
- El veredicto PASS del v2 se apoya en una unica ganadora (Donchian 20d long-only ETH) cuya ventaja se concentra antes de 2022: SR 0.50 en la era 2023-26 frente a 1.56 en muestra completa. El propio autor lo califica de problema de honestidad obligatorio.
- Drawdowns inherentes muy elevados: MDD de -61% en la ganadora, con perfiles de -60/-80% citados para el conjunto, y distribucion no normal (skew +1.28, curtosis 18).
- Multiples ensayos: 136 configuraciones en v1 y 66 en v2; el DSR corregido por ensayos puede colapsar a ~0 aunque el SR bruto parezca positivo (caso v1).
- Dependencia del dataset: los resultados se calculan sobre indices VWAP de coinmetrics, 8 majors y un arrastre de funding fijo de 0.1095 APR; no se garantiza su traslado a otros exchanges, activos o regimenes.
- El modelo de costes, aunque corregido, sigue siendo una aproximacion (impacto raiz cuadrada, suelo de 2 bps, comisiones Binance VIP0); no captura latencia, colas ni fragmentacion de liquidez.
- Historial de errores documentado: la ejecucion original del 2026-10-23 sobreestimaba el slippage ~50x por omitir `sigma_daily`, y el motor otorgaba apalancamiento implicito en la primera era. Ambos fallos se corrigieron, pero ilustran la sensibilidad de los resultados a la implementacion.
- Riesgo de sobreinterpretacion: los barridos son in-sample respecto a la eleccion de familias de estrategias, y la conclusion "long-only trend en diario" no constituye asesoramiento financiero.
- El contenido de la model card disponible esta truncado (la tabla de validacion de demostracion aparece incompleta), por lo que puede faltar informacion sobre otras estrategias evaluadas.
- La busqueda web realizada no devolvio ningun resultado relacionado con el repositorio; solo trafico no relevante, que se descarta por completo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Avi-L/crypto-quant-eval
- Dataset companion: https://huggingface.co/datasets/Avi-L/crypto-quant-eval-data
- Libreria de particionado purgado: https://pypi.org/project/purgedcv/
- Herramienta declarada de generacion: https://hf.co/chat?mode=ml-intern
- Referencia metodologica citada: Lopez de Prado, *Advances in Financial Machine Learning*, Wiley 2018 (capitulos 7 y 11-12); sin enlace directo en la informacion disponible.
- Resultados del barrido v1 en el repositorio: `results/sweep_report_v1.json`; runner `sweep.py` (sin URL directa disponible).
- Paper, blog o demo adicionales: no disponibles.
