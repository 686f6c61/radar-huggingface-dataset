# leminhohoho/hltv-archive

## Resumen

HLTv model archive es un repositorio de artefactos de modelado predictivo para el juego Counter-Strike 2 (CS2), publicado por el usuario leminhohoho en Hugging Face. No es un modelo de lenguaje ni una red neuronal generativa, sino un paquete de pesos y metadatos entrenados sobre datos historicos de HLTV para predecir resultados de enfrentamientos y eventos dentro de la partida. El repositorio tiene 0,1 GB y contiene 53 ficheros organizados en cuatro directorios: `prematch/`, `inplay/`, `tick_encoder/` y `evidence/`.

El componente principal es un modelo de clasificacion binaria por pares de jugadores (pairwise kill model) que combina tres boosters XGBoost de 700 rondas con una regresion logistica sobre 88 caracteristicas, entrenado con 154.550 filas de pares. Se complementa con un transformer de tokens para prediccion en juego (in-play) con checkpoints a distintas rondas, un transformer de conjunto de 10 jugadores y un codificador SSL de ticks crudos de 0,67 M de parametros. La relevancia actual es acotada: se trata de un archivo de reproducibilidad para un proyecto de analitica de esports, no de un modelo de proposito general.

La licencia es MIT y los pesos se distribuyen en formato PyTorch (`.pt`), JSON de XGBoost y joblib. No se declaran idiomas soportados ni pipeline de Hugging Face, lo que confirma que no es un modelo de NLP.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble XGBoost + regresion logistica (prematch); transformer de tokens (in-play); transformer de conjunto; encoder Conv1D con atencion espacial (tick encoder) |
| Parametros totales | 0,67 M en el tick encoder; no disponible para el resto de componentes (XGBoost de 700 rondas y transformers de d=96) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto textual; el in-play usa mascara de rondas hasta 18) |
| Tipos de cuantizacion | no disponible (pesos nativos en float; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible (no es un modelo linguistico) |
| Licencia | MIT |
| Formato de pesos | JSON (XGBoost), joblib (scikit-learn), `.pt` (PyTorch state_dict), `.npz` (predicciones) |

## Arquitectura y entrenamiento

El modelo prematch es un ensemble de tres boosters XGBoost con 700 rondas y tres semillas distintas, mas una regresion logistica con C=0,3 sobre caracteristicas estandarizadas. La prediccion final es la media ponderada al 50 % de la media de los tres XGBoost y la probabilidad de la logistica. Se entrena con las 154.550 filas de `data/kills/models/pairs6.csv`, con la partida mas reciente del 11 de noviembre de 2026, y emplea 88 caracteristicas con imputacion de NaN por medianas almacenadas en `prematch_meta.joblib`.

El componente in-play es un transformer de tokens con dimension d=96 y 24 epocas, entrenado sobre 6.182 mapas con la mascara de rondas cortada en cada checkpoint (ck3, ck5, ck8, ck12, ck15, ck18) y cuatro semillas por checkpoint. El tick encoder es una red de 0,67 M de parametros, d=192 y ventana W=192, que procesa 9 canales por 10 jugadores mediante dos bloques de atencion espacial seguidos de tres pilas de Conv1D dilatadas causales; se preentrena con objetivos SSL (next view, next displacement, next alive, masked-other). El transformer de conjunto usa d=96, 2 capas y 20 epocas sobre los 10 jugadores.

## Capacidades

- Prediccion prepartido de resultados por pares de jugadores mediante clasificacion binaria calibrada (ECE 0,0089).
- Prediccion en juego a lo largo de la partida con checkpoints progresivos desde la ronda 3 hasta la 18.
- Modelado de interacciones entre los 10 jugadores mediante transformer de conjunto.
- Extraccion de representaciones de ticks crudos (z de 192 dimensiones) para sondas de eventos: spotted, duel, damaged y fired.
- Bandas de confianza por tier con tasas de acierto asociadas (cobertura selectiva del 90,0 % al 1 %, 83,7 % al 5 % y 80,7 % al 8 %).
- Reproducibilidad completa mediante `SHA256SUMS` y `MANIFEST.csv`.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues.

## Casos de uso

- Analisis prepartido de enfrentamientos en CS2: el ensemble prematch estima probabilidades calibradas por par de jugadores con 88 caracteristicas, adecuado para alimentar paneles de analitica o modelos de scouting.
- Prediccion en vivo durante retransmisiones: los checkpoints in-play permiten recalcular la probabilidad tras cada ronda, con cortes documentados hasta la ronda 18.
- Evaluacion de jugadores individuales: el transformer de conjunto de 10 jugadores modela interacciones y permite derivar representaciones por jugador para comparativas.
- Deteccion de eventos a partir de ticks crudos: el tick encoder alcanza AUC de 0,761 (spotted), 0,783 (duel), 0,762 (damaged) y 0,668 (fired) en 71 partidas no vistas, frente a 0,613/0,619/0,663/0,607 con caracteristicas manuales, lo que lo hace util para etiquetado automatico de highlights.
- Investigacion en analitica de esports: el archivo incluye predicciones fuera de muestra (`tokS_ck*.npz`, `set_pred*.npz`) y los numeros publicados en `evidence/`, lo que permite replicar estudios sin reentrenar.
- Auditoria de modelos predictivos deportivos: la calibracion por bandas de confianza y la cobertura selectiva permiten estudiar el compromiso entre cobertura y acierto en produccion.
- Reconstruccion de pipelines de datos: los runbooks referenciados (`knowledge/05_runbooks/02_tick_pipeline.md`) y los scripts `tools/kills_*.py` permiten regenerar los datos crudos no incluidos.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Precision prematch | 0,6114 |
| AUC prematch | 0,6577 |
| Log loss prematch | 0,6524 |
| ECE prematch | 0,0089 |
| Tamano de test prematch | 107.300 pares (expanding-origin) |
| Cobertura selectiva 90,0 % | al 1 % de cobertura |
| Cobertura selectiva 83,7 % | al 5 % de cobertura |
| Cobertura selectiva 80,7 % | al 8 % de cobertura |
| In-play pairwise (ronda 12) | 81,6 % |
| Tick encoder, AUC spotted | 0,761 (frente a 0,613 con caracteristicas manuales) |
| Tick encoder, AUC duel | 0,783 (frente a 0,619) |
| Tick encoder, AUC damaged | 0,762 (frente a 0,663) |
| Tick encoder, AUC fired | 0,668 (frente a 0,607) |
| Evaluacion tick encoder | 71 partidas no vistas |
| Sonda prematch con tick encoder (stage 3) | nula |

## Requisitos de hardware

- Inferencia prematch: CPU suficiente; tres boosters XGBoost de 700 rondas y una regresion logistica sobre 88 caracteristicas no requieren GPU.
- Inferencia in-play: GPU consumer viable; los transformers tienen d=96 y se entrenaron 24 epocas, por lo que una RTX 3060 o superior basta para servir los checkpoints.
- Tick encoder: 0,67 M de parametros y ventana de 192; cabe en cualquier GPU consumer e incluso en CPU para lotes pequenos.
- Despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican). El uso previsto es mediante PyTorch, XGBoost y joblib en Python.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Memoria: el repositorio completo ocupa 0,1 GB; los datos crudos excluidos (pairs*.csv de 843 MB y shards de ticks de 32 GB) son necesarios solo para reentrenar.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HLTv model archive | Ensemble XGBoost + transformers pequenos para CS2 | 0,67 M (tick encoder); resto no disponible | no aplica | MIT | Hugging Face, 0 descargas |
| Modelos de prediccion deportiva genericos | No disponible | no disponible | no disponible | no disponible | no disponible |
| TabFM (referenciado en la model card) | Modelo tabular | no disponible | no disponible | no comercial | No incluido en el archivo (resultado nulo) |

No se dispone de informacion sobre alternativas comparables de la misma categoria en la documentacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no responde preguntas y no soporta tool calling ni agentes.
- El rendimiento prematch es modesto (AUC 0,6577), lo que limita su uso como unico sistema de decision.
- La sonda prematch con el tick encoder (stage 3) resulto nula, segun la propia model card.
- El tick encoder se evaluo en 71 partidas; el tamano de muestra es reducido y puede no generalizar a otros metadatos o parches del juego.
- Los datos crudos de entrenamiento no se incluyen (pairs*.csv de 843 MB y shards de 32 GB), por lo que la reproducibilidad completa depende de scripts y bases de datos externas no empaquetadas.
- TabFM queda fuera por pesos no comerciales y resultado nulo; no debe asumirse su disponibilidad.
- Riesgo de desactualizacion: los datos llegan hasta el 11 de noviembre de 2026; cambios de meta o parches posteriores pueden degradar las predicciones.
- No se documentan sesgos especificos ni evaluaciones de equidad; el dominio es acotado a esports.
- La licencia MIT permite uso comercial, pero la ausencia de garantias y de validacion externa desaconseja su despliegue en produccion sin recalibracion.
- El repositorio registra 0 descargas y 0 likes, sin evidencia de adopcion o validacion por terceros.

## Enlaces

- Hugging Face: https://huggingface.co/leminhohoho/hltv-archive
- Repositorio de artefactos: incluye `SHA256SUMS`, `MANIFEST.csv`, `prematch/`, `inplay/`, `tick_encoder/` y `evidence/` dentro del propio repo.
- Scripts de reconstruccion de datos: `tools/kills_*.py` (referenciados en la model card, no incluidos en el repo).
- Runbook del pipeline de ticks: `knowledge/05_runbooks/02_tick_pipeline.md` (referenciado, no incluido).
- Informes PDF: `knowledge/06_reports/` (referenciados, no incluidos).
- Paper, blog o demo: no disponibles en la informacion proporcionada.
