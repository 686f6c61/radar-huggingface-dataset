# leminhohoho/hltv-kill-prediction

## Resumen

HLTV kill-prediction es un conjunto de modelos predictivos para Counter-Strike 2 (CS2) que estima, dado un mapa, qué jugador de cada pareja de los diez participantes terminará con más kills. Lo desarrolla el usuario leminhohoho y se publica bajo licencia MIT. No es un modelo de lenguaje: combina un ensamblado XGBoost con regresión logística para el régimen previo al partido y un transformer sobre tokens por ronda para el régimen en juego, cuando ya se conocen las primeras *k* rondas.

El problema que resuelve es acotado y bien definido: la predicción por pares de kills en esports de élite. El modelo previo al partido alcanza un 61,1 % de acierto por pares sobre 107.300 pares y diez trimestres de validación con origen expansivo, frente al 58,0 % de una línea base ingenua basada en la tasa de kills de carrera y el 59,4 % de una línea base de mercado/rating. El autor documenta que el techo informacional ronda el 60 % por la baja varianza entre jugadores (ICC = 0,045), de modo que el modelo previo está esencialmente en el límite. El transformer en juego escala con las rondas observadas: 68,6 % con k=3, 72,1 % con k=5, 81,6 % con k=12 y 90,7 % con k=18.

El repositorio incluye pesos, features en Parquet, predicciones cruzadas y un informe completo (`REPORT_P4_kills.pdf`), además de scripts de inferencia. Es relevante para quienes trabajan en analítica deportiva, modelos tabulares con validación temporal estricta y predicción secuencial con máscaras causales en dominios de eventos discretos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensamblado XGBoost (3 semillas) + regresión logística para pre-partido; transformer sobre tokens por ronda para en juego; set transformer alternativo de 10 jugadores |
| Parametros totales | No disponible (el transformer usa d=96; el número total de parámetros no se publica) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica en el sentido de LLM; el transformer en juego procesa hasta 18 rondas con máscara causal por checkpoint |
| Tipos de cuantizacion | No disponible (no se documentan cuantizaciones; pesos en JSON, joblib y PyTorch) |
| Idiomas soportados | No disponible (modelo tabular y de eventos, sin procesamiento de lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | JSON (boosters XGBoost), joblib (StandardScaler + LogisticRegression y metadatos), PyTorch `.pt`, NumPy `.npz`, Parquet |

## Arquitectura y entrenamiento

El régimen previo al partido usa 88 features por par de jugadores (154.550 pares etiquetados en `prematch_features.parquet`) y combina tres boosters XGBoost de 700 rondas con una regresión logística sobre features estandarizadas con C=0,3. La puntuación final es `0.5 * media(xgb semillas) + 0.5 * logística`. El régimen en juego emplea un transformer sobre tokens por ronda: cada jugador y ronda se representa con 23 features (`k d dmg hits fl_enemy gr_n sp_n won is_t1 sd ck cd cdmg ri f20_kp24 f5_kp24 f20_share f20_awp_sh f20_opener f20_surv pmap_share r_shrunk gshare`), con dimensión d=96 y una máscara de validez `M` que corta la secuencia tras la ronda K. Se entrenan cuatro semillas por checkpoint y se publican predicciones cruzadas en `tokS_ck{K}.npz`.

La validación es temporal con origen expansivo por trimestre (diez trimestres de test, partidos recientes de 2026), lo que evita fuga de información. El autor señala explícitamente que la máscara se aplica antes de que las features de rondas posteriores sean visibles y que un desajuste de máscara produjo un falso 98 % en una versión temprana. Los datos provienen de páginas de partidos de HLTV: 8.235 mapas, 1.185.199 kills etiquetadas y un 99,0 % vinculadas a un `player_id`. También se incluye un set transformer alternativo de diez jugadores (`set_data.npz`, `artifacts/set/qALL_s{0..3}.pt`) con correlación r=0,62, descrito como más débil.

## Capacidades

- Predicción por pares de kills en mapas de CS2: para cada una de las 45 parejas de los diez jugadores, indica quién terminará con más kills.
- Régimen previo al partido: predicción sin observar ninguna ronda, con 88 features por par.
- Régimen en juego: predicción condicionada a las primeras *k* rondas (k=3, 5, 8, 12, 15, 18) mediante el transformer enmascarado.
- Puntuación de confianza por niveles: el autor reporta un 90 % de acierto sobre el 1 % de pares más confiables y un 80 % sobre el 8 % superior.
- Inferencia por mapa, por partido o sobre el conjunto completo mediante `tools/prematch_predict.py`, `tools/inplay_predict.py` y `tools/set_predict.py`.
- Salida de predicciones a CSV (`--out pred_ck12.csv`) y resultados legibles por máquina en `results/*.json`.
- No soporta tool calling, agentes, visión, audio ni capacidades multilingües; es un modelo tabular y secuencial de dominio específico.

## Casos de uso

- Analítica previa al partido en retransmisiones: el modelo previo puntúa los 45 pares de un mapa antes de la primera ronda con 88 features y permite generar gráficos de favoritismo por jugador con una precisión del 61,1 %, cerca del techo informacional del 60 %.
- Predicción en directo por rondas: con `--ck 12` el transformer incorpora las primeras doce rondas y eleva el acierto al 81,6 %, útil para paneles de apuestas o visualizaciones que se actualizan ronda a ronda.
- Evaluación de jugadores y scouting: los perfiles estáticos (`f20_kp24`, `f5_kp24`, `f20_share`, `f20_awp_sh`, `f20_opener`, `f20_surv`) permiten comparar el rendimiento esperado de un jugador frente a rivales concretos en un mapa dado.
- Investigación en validación temporal: el repositorio sirve como referencia de expanding-origin cross-validation por trimestre con 10 ventanas de test, útil para metodologías de modelos deportivos.
- Docencia y reproducción de resultados: los scripts `tools/*.py` reproducen exactamente las cifras publicadas sin base de datos ni reentrenamiento, lo que facilita la verificación independiente.
- Filtrado selectivo de alta confianza: usando los niveles de confianza de `prematch_meta.joblib`, se puede operar solo sobre el 1 % de pares más seguros con un 90 % de acierto, adecuado para sistemas que priorizan precisión sobre cobertura.
- Análisis de mercado y modelado de ratings: el modelo previo supera la línea base de mercado/rating (61,1 % frente a 59,4 %), por lo que puede usarse como señal complementaria en modelos de valor esperado.

## Benchmarks y rendimiento

| Régimen | Modelo | Precisión por pares | Detalle |
|---|---|---|---|
| Pre-partido | XGBoost (3 semillas) + logística, 88 features | 61,1 % | n=107.300 pares, 10 trimestres con origen expansivo |
| Pre-partido | Línea base tasa de kills de carrera | 58,0 % | Referencia ingenua |
| Pre-partido | Línea base mercado/rating | 59,4 % | Referencia de mercado |
| Pre-partido | Modelo Gamma-Poisson de jugador | 60,4 % | Techo teórico documentado |
| En juego | Transformer, k=3 | 68,6 % | Primeras 3 rondas conocidas |
| En juego | Transformer, k=5 | 72,1 % | Primeras 5 rondas conocidas |
| En juego | Transformer, k=8 | 76,1 % | Primeras 8 rondas conocidas |
| En juego | Transformer, k=12 | 81,6 % | Primeras 12 rondas conocidas |
| En juego | Transformer, k=15 | 86,1 % | Primeras 15 rondas conocidas |
| En juego | Transformer, k=18 | 90,7 % | Primeras 18 rondas conocidas |

El autor documenta además que el ICC entre jugadores es 0,045, lo que limita el techo previo al partido al 60,4 %, y que los empates en kills ocurren en el 5,7 % de los casos y se puntúan como medio acierto.

## Requisitos de hardware

- El modelo previo al partido (tres boosters XGBoost de 700 rondas más una regresión logística) es ligero y se ejecuta en CPU sin GPU; no se publica el consumo exacto de memoria.
- El transformer en juego, con d=96 y secuencias de hasta 18 rondas por jugador, es de tamaño reducido y cabe holgadamente en cualquier GPU consumer; no se especifica VRAM concreta.
- El set transformer alternativo de diez jugadores también es de escala pequeña y puede ejecutarse en CPU o en GPU de gama baja.
- El repositorio ocupa 0,1 GB, por lo que el almacenamiento no es un factor limitante.
- Despliegue mediante scripts Python con `torch`, `xgboost`, `scikit-learn`, `joblib`, `numpy`, `pandas` y `pyarrow`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- No se publican cifras de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Las únicas referencias cuantitativas son las líneas base internas del propio informe (tasa de kills de carrera, mercado/rating y modelo Gamma-Poisson), incluidas en la tabla de benchmarks.

## Limitaciones y advertencias

- Los pesos de `artifacts/` son reentrenamientos sobre todos los datos para producción; puntuar un partido dentro de la ventana de entrenamiento produce resultados in-sample y sobreestima el rendimiento real.
- El techo del régimen previo al partido está en torno al 60 % por la baja varianza entre jugadores (ICC = 0,045); alcanzar un 80 % previo al partido es imposible según el autor, y la única vía es la selectiva por confianza.
- Los empates en kills se producen en el 5,7 % de los casos y se puntúan como medio acierto, lo que debe tenerse en cuenta al interpretar las cifras.
- El modelo está entrenado exclusivamente con datos de HLTV (8.235 mapas, 1.185.199 kills, 99,0 % vinculadas a `player_id`); no se documenta generalización a otros títulos, ligas o formatos.
- El 1,0 % de las kills no está vinculada a un `player_id`, lo que puede introducir ruido en las etiquetas.
- No hay información sobre sesgos demográficos, geográficos o de otro tipo, ni sobre riesgos de alucinación en el sentido de LLM; el modelo es determinista dado el conjunto de features.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantías sobre la exactitud ni sobre el uso en contextos de apuestas; la responsabilidad recae en el usuario.
- No se documentan cuantizaciones ni formatos de despliegue alternativos, y el pipeline de Hugging Face figura como no disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/leminhohoho/hltv-kill-prediction
- Informe completo: `REPORT_P4_kills.pdf` (incluido en el repositorio)
- Resultados legibles por máquina: `results/*.json` (incluidos en el repositorio)
- Scripts de inferencia: `tools/prematch_predict.py`, `tools/inplay_predict.py`, `tools/set_predict.py`, `tools/kp_paths.py` (incluidos en el repositorio)
- No se han encontrado otros enlaces (papers, blogs, demos o repositorios externos) en la información disponible.
