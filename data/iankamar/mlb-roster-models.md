# iankamar/mlb-roster-models

## Resumen

MLB Roster Models es un artefacto de scikit-learn publicado por el usuario iankamar en Hugging Face, orientado a la regresion tabular sobre datos historicos de beisbol. El repositorio contiene dos regresores entrenados —regresion lineal y random forest— que estiman la produccion de carreras por partido de un equipo a partir de variables historicas de la base de datos Lahman, junto con un ejercicio de optimizacion combinatoria para comparar alineaciones bajo un tope salarial archivado de 2002.

El modelo no es una red neuronal ni un LLM: es un pipeline clasico de machine learning tabular que se distribuye en formato joblib. La regresion lineal es el modelo por defecto, seleccionado mediante validacion cruzada sobre el conjunto de entrenamiento (1961-1996) antes de evaluar sobre el conjunto de test (1997-2001). Su interes practico es acotado: sirve como referencia metodologica para regresion sobre datos deportivos y como base para el espacio de demostracion de optimizacion de plantillas.

No hay informacion sobre arquitectura neuronal, parametros, contexto, cuantizacion ni idiomas, porque el artefacto no es un modelo generativo. La model card es explicita en que las puntuaciones de jugadores corresponden a datos historicos y no a evaluaciones actuales, y en que el objetivo del optimizador es un proxy de produccion de carreras para un equipo de bateadores identicos, no una prediccion de victorias o contratos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresion lineal y random forest (scikit-learn) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo tabular, no secuencial) |
| Tipos de cuantizacion | no disponible (artefacto joblib, sin cuantizacion) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | joblib (`models.joblib`); predicciones en `test-predictions.npz`; datos auxiliares en CSV |

## Arquitectura y entrenamiento

El repositorio contiene dos modelos supervisados de regresion sobre variables tabulares. La regresion lineal actua como modelo de referencia y el random forest como alternativa no lineal; ambos se entrenan sobre filas correspondientes a las temporadas 1961-1996 y se evaluan sobre 1997-2001. La validacion cruzada usa cinco folds cronologicos hacia delante que mantienen cada temporada intacta, evitando fuga de informacion entre train y test. La metrica de seleccion es el MAE en carreras por partido de equipo, y el modelo lineal se elige por CV de entrenamiento antes de tocar el conjunto de test.

El proyecto parte de las tablas Lahman (`Teams.csv`, `Batting.csv`, `Master.csv`, `Salaries.csv`, `Appearances.csv`), con hashes de entrada registrados en `metrics.json`. La model card indica que es una actualizacion corregida de un proyecto de curso: la version original carecia de una optimizacion completa y usaba escalado de jugadores inconsistente, secciones que aqui se reemplazan. El optimizador de plantillas formula un problema de programacion entera que selecciona nueve jugadores no pitchers, uno por posicion de bateo incluido el bateador designado, bajo el tope salarial archivado de 2002, usando posiciones primarias historicas de 1997-2001 y sumando filas de salario duplicadas por jugador. Solo se incluyen jugadores con al menos 1.000 apariciones al plato (AB+BB) en esos cinco anos. Las tasas de eventos por jugador se convierten a escala de partido de equipo, y el objetivo suma los proxies de produccion de carreras de un equipo de bateadores identicos.

## Capacidades

- Regresion tabular supervisada para estimar carreras por partido de equipo a partir de variables historicas de temporadas.
- Comparacion de modelos lineales y de ensamble (random forest) sobre el mismo esquema de validacion cronologica.
- Generacion de predicciones retenidas sobre el periodo 1997-2001, almacenadas en `test-predictions.npz`.
- Puntuacion de jugadores historicos a partir de entradas tabulares, exportada en `eligible-players.csv`.
- Optimizacion combinatoria de plantillas de nueve jugadores bajo restricciones de posicion, elegibilidad y tope salarial.
- Reproducibilidad mediante hashes de entrada registrados en `metrics.json` y scripts de entrenamiento (`train.py`).
- No dispone de generacion de texto, razonamiento, codigo, vision, audio, tool calling, agentes ni capacidades multilingues.

## Casos de uso

- Analisis retrospective de produccion ofensiva: usar los regresores para estimar carreras por partido de equipos historicos y contrastar la evolucion entre temporadas, aprovechando la separacion cronologica train/test.
- Docencia y referencia metodologica: el par lineal/random forest con folds cronologicos sirve como ejemplo de validacion temporal correcta en series deportivas, evitando fuga entre temporadas.
- Benchmarking interno de pipelines tabulares: comparar el MAE de referencia (0,1100 en test para regresion lineal) con modelos propios sobre el mismo split 1961-1996 / 1997-2001.
- Exploracion de optimizacion de plantillas: reproducir el problema de programacion entera con el tope salarial de 2002 para estudiar como cambian las alineaciones optimas bajo distintas restricciones de presupuesto.
- Auditoria de escalado de variables: el proyecto corrige el escalado inconsistente de jugadores de la version original, por lo que puede usarse como caso de estudio de errores de normalizacion en regresion deportiva.
- Prototipado de herramientas de analitica para aficionados: cargar `models.joblib` y `eligible-players.csv` en un notebook para generar rankings historicos de jugadores elegibles, siempre con la advertencia de que no son evaluaciones actuales.
- Integracion en el Space de demostracion: el espacio `mlb-roster-optimization` presenta soluciones precomputadas exactas para presupuestos declarados, util como referencia de resultados reproducibles.

## Benchmarks y rendimiento

| Modelo | MAE CV entrenamiento | MAE test | R² test |
|---|---:|---:|---:|
| Regresion lineal | 0,1219 | 0,1100 | 0,9198 |
| Random forest | 0,1833 | 0,1726 | 0,8062 |

Entrenamiento: 1961-1996. Test: 1997-2001. Cinco folds cronologicos hacia delante con temporadas intactas. MAE en carreras por partido de equipo. El modelo lineal por defecto se selecciona por CV de entrenamiento antes de la evaluacion en test; ambos modelos permanecen ajustados sobre las filas de entrenamiento 1961-1996.

## Requisitos de hardware

- VRAM para inferencia: no disponible; al ser un artefacto scikit-learn en joblib, la inferencia se ejecuta en CPU y no requiere GPU.
- GPU recomendadas: ninguna; el entrenamiento e inferencia son viables en CPU convencional.
- Compatibilidad con GPU consumer: innecesaria para este tipo de modelo.
- Opciones de despliegue: Python 3.12 con `scikit-learn` y `joblib`; instalacion de dependencias via `requirements.txt` y ejecucion de `train.py --data path/to/data`. No aplica despliegue con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada; dependen del tamano del conjunto tabular y del hardware de CPU.
- Requisito operativo: cargar ficheros joblib solo desde fuentes de confianza, tal como advierte la model card.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | MAE test | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| MLB Roster Models (iankamar) | Regresion lineal / random forest tabular | no disponible | no disponible | 0,1100 (lineal) / 0,1726 (RF) | no disponible | Hugging Face, joblib |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de modelos alternativos de la misma categoria con datos verificables de parametros, contexto, rendimiento o licencia, por lo que la comparativa cuantitativa queda no disponible.

## Limitaciones y advertencias

- El objetivo del optimizador es un proxy de produccion de carreras para un equipo de bateadores identicos; no es una prevision de carreras reales de una alineacion, de victorias ni de contratos disponibles para un equipo concreto.
- Las puntuaciones de `eligible-players.csv` corresponden a datos historicos y no constituyen evaluaciones actuales de jugadores.
- El random forest rinde peor que la regresion lineal en test (MAE 0,1726 frente a 0,1100; R² 0,8062 frente a 0,9198), por lo que no debe asumirse como mejora por defecto.
- El conjunto de test cubre solo 1997-2001; la generalizacion a temporadas posteriores o a ligas distintas no esta validada.
- La elegibilidad de jugadores exige al menos 1.000 AB+BB en 1997-2001, lo que excluye muestras pequenas y limita la cobertura del optimizador.
- Las filas de salario duplicadas se suman por jugador, decision de preprocesado que puede alterar el coste efectivo en comparacion con otras fuentes.
- Licencia no disponible: no hay autorizacion explicita para uso comercial; deben respetarse la atribucion y los terminos de las fuentes upstream (Baseball Databank y Lahman database).
- Los datos CSV originales no se redistribuyen en el repositorio; es necesario obtenerlos por separado y verificar los hashes de `metrics.json`.
- Riesgo de sobreajuste al periodo historico concreto y sesgos propios de la base Lahman (cobertura de equipos, convenciones de posiciones y registro salarial).
- No hay informacion sobre sesgos demograficos, idiomas ni alucinacion, por no tratarse de un modelo generativo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iankamar/mlb-roster-models
- Demo (Space de optimizacion de plantillas): https://huggingface.co/spaces/iankamar/mlb-roster-optimization
- Baseball Databank: https://sabr.org/lahman-database/
- Lahman database: https://sabr.org/lahman-database/
