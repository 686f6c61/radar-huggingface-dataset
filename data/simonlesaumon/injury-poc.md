# simonlesaumon/injury-poc

## Resumen

`simonlesaumon/injury-poc` no es un modelo de lenguaje ni una red neuronal preentrenada en el sentido habitual de Hugging Face. Se trata de un repositorio que contiene una prueba de concepto (PoC) exploratoria en Python para estimar el riesgo de lesión muscular en futbolistas, aplicada como backtest al Paris Saint-Germain desde septiembre de 2026. El autor es el usuario simonlesaumon y el paquete se distribuye como proyecto instalable (`pip install -e .`) con la lógica de scraping, entrenamiento y generación de informes.

El sistema construye un pipeline completo: scraping de Transfermarkt (con caché en disco), agregación de datos a nivel jugador-semana (lunes), entrenamiento de dos clasificadores supervisados (regresión logística y HistGradientBoosting de scikit-learn) y generación de un informe en francés con métricas de calibración y comparación frente a una línea base ingenua. La pregunta que aborda es si un modelo entrenado únicamente con datos anteriores al periodo evaluado habría anticipado el aumento de riesgo antes de las lesiones musculares del PSG.

La relevancia es metodológica más que de producto: ilustra un diseño anti-fuga (corte temporal estricto), una separación limpia entre entrenamiento (jugadores que nunca pasaron por el PSG) y test (jugadores en el PSG a partir del 7 de septiembre de 2026), y un guardarraíl de control (AUC < 0,55) que invalida el experimento si el modelo no supera el azar en el conjunto de control. No hay pesos de modelo publicados ni artefactos de inferencia listos para usar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No es un modelo neuronal; pipeline de ML clásico con regresión logística y HistGradientBoosting (scikit-learn) |
| Parametros totales | no disponible (no se publican recuentos de parámetros ni coeficientes) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo tabular sobre ventanas semanales; ventana de predicción de 14 días) |
| Tipos de cuantizacion | no disponible (no hay pesos que cuantizar) |
| Idiomas soportados | no disponible como modelo lingüístico; el informe generado está en francés |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio contiene código Python y CSV; no hay safetensors ni GGUF) |

## Arquitectura y entrenamiento

El sistema no emplea transformers ni modelos de lenguaje. La unidad de datos es el par jugador-lunes: para cada lunes se construyen variables a partir exclusivamente de partidos y lesiones estrictamente anteriores a esa fecha, lo que constituye el mecanismo anti-fuga. La variable objetivo es la aparición de una lesión muscular en los 14 días siguientes al lunes, y permanece como NaN mientras la ventana no está completa, evitando etiquetas parciales.

Se entrenan dos clasificadores sobre scikit-learn: una regresión logística (interpretable, como referencia) y un HistGradientBoosting (modelo de árboles con mayor capacidad). El conjunto de entrenamiento incluye jugadores que nunca pasaron por el PSG, con lunes hasta el 17 de agosto de 2026 (su ventana se cierra el 31 de agosto de 2026 y no se usan datos desde el 1 de septiembre de 2026). El conjunto de test son las filas "en el PSG" desde el lunes 7 de septiembre de 2026, definidas por pertenencia a la plantilla de la temporada y por haber disputado el último partido de club con el PSG. El lunes más reciente se puntúa sin etiqueta como "clasificación actual".

Las variables provienen de estadísticas públicas de Transfermarkt: carga de partidos, edad, historial de lesiones, participación en el Mundial y en competiciones europeas. No se emplean datos GPS, carga de entrenamiento ni información médica. Solo se modelan lesiones musculares, identificadas por palabras clave en la etiqueta, excluyendo contusiones. El pipeline incluye scraping reanudable (con `progress.csv`), caché de menos de 24 horas para la temporada en curso y registro de errores HTTP en `errors.log`.

## Capacidades

- Scraping de Transfermarkt por club (`--psg`) o por liga (`FR1`, `GB1`, `ES1`, `IT1`, `L1`), con caché en disco y reanudación tras interrupciones.
- Construcción de un dataset jugador-semana con corte temporal estricto para evitar fuga de información.
- Entrenamiento y comparación de dos clasificadores supervisados (regresión logística y HistGradientBoosting).
- Cálculo de puntuaciones de riesgo semanales por jugador, con rango dentro de la plantilla y variable `min_28` (minutos en 28 días).
- Generación de un informe en francés (`out/rapport.md`) con control previo, resultados del PSG, rangos antes de lesión, clasificación actual, calibración y limitaciones.
- Exportación de puntuaciones a CSV (`out/scores_psg.csv`) y de trayectorias semanales a PNG (`out/trajectoires.png`).
- Guardarraíl automático: si el AUC de control es inferior a 0,55, el informe lo muestra en cabeza como señal de invalidez.
- Actualización semanal mediante `update` (re-scraping de la temporada en curso y regeneración del informe).
- Instalación como paquete editable con dependencias declaradas (pandas, scikit-learn, requests, beautifulsoup4, lxml, matplotlib) y suite de tests con pytest.

## Casos de uso

- Backtest metodológico de modelos de riesgo de lesión: sirve para evaluar si un conjunto de variables públicas (carga de partidos, edad, historial, competiciones) tiene señal predictiva antes de invertir en datos propietarios como GPS o carga de entrenamiento.
- Docencia y formación en ML aplicado al deporte: el diseño anti-fuga, la separación entrenamiento/test por trayectoria de club y el guardarraíl de AUC son ejemplos concretos para enseñar buenas prácticas de validación temporal.
- Replicación de un pipeline de scraping reanudable: el patrón de caché en disco, `progress.csv` y manejo selectivo de errores HTTP (404/410 se saltan, 403/429/5xx detienen el run) es reutilizable en otros proyectos de extracción de datos deportivos.
- Análisis exploratorio de plantillas: la clasificación semanal por riesgo permite comparar jugadores de una misma plantilla y detectar concentraciones de riesgo en periodos con acumulación de partidos.
- Generación de informes reproducibles: el comando `report` produce un documento en francés con métricas de calibración y comparación frente a una línea base ingenua por minutos jugados en 28 días, útil para comunicación interna.
- Investigación sobre lesiones musculares en fútbol de élite: el conjunto de datos (privado) y el código (público) permiten estudiar la relación entre calendario, edad e historial lesivo en cinco grandes ligas.
- Automatización semanal en un servidor: el comando `update` re-scrapea la temporada en curso y regenera el informe, lo que encaja en un cron semanal para seguimiento continuo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona métricas internas (AUC de control, calibración y comparación con un ranking ingenuo por minutos en 28 días) que se generan en `out/rapport.md`, pero no se incluyen valores numéricos en la información proporcionada. Tampoco se reportan comparaciones con modelos de riesgo de lesión de terceros.

## Requisitos de hardware

- No requiere GPU: el entrenamiento se realiza con scikit-learn sobre datos tabulares y es viable en CPU.
- Entorno recomendado: Python 3.12 o superior.
- Almacenamiento: el caché de scraping ocupa entre 5 y 9 GB (decenas de miles de ficheros pequeños); se recomienda ubicar `INJURY_POC_DATA_DIR` fuera de OneDrive para evitar bloqueos de sincronización.
- Tiempo de ejecución estimado con 3 segundos entre peticiones: `scrape --psg` unas 500 peticiones y unos 25 minutos; `scrape --league FR1` unas 2.800 peticiones y unas 2,3 horas; las cinco ligas unas 12.000 peticiones y unas 10 horas.
- Tras el scraping, la generación del informe (`report`) tarda de segundos a pocos minutos gracias a la caché.
- Despliegue: no aplica servidor de inferencia (vLLM, TGI, llama.cpp u Ollama); el sistema se ejecuta como CLI (`python -m injury_poc ...`).
- Latencia y throughput de inferencia: no disponibles; el coste dominante es el scraping, no el cómputo del modelo.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (PoC de riesgo de lesión muscular con datos públicos de Transfermarkt) ni se aportan parámetros, contextos o licencias de alternativas. Las herramientas comerciales de prevención de lesiones suelen emplear datos GPS y de carga interna no incluidos aquí, por lo que una comparación directa exigiría información adicional no disponible.

## Limitaciones y advertencias

- Solo utiliza datos públicos de Transfermarkt: no hay GPS, carga de entrenamiento ni información médica, lo que limita la señal disponible frente a sistemas profesionales.
- Solo se modelan lesiones musculares identificadas por palabras clave en la etiqueta; las contusiones se excluyen y puede haber errores de clasificación en el etiquetado.
- Sesgo de selección: los jugadores sin minutos de liga la temporada anterior en la misma competición (recién ascendidos, llegados del extranjero o de divisiones inferiores) no se scrapean, lo que reduce el tamaño muestral.
- Muy pocas lesiones en el PSG en el periodo evaluado: las métricas son inestables y el propio autor advierte de que el PoC no es una herramienta de decisión.
- El modelo se compara siempre con una línea base ingenua por minutos jugados en 28 días; sin superarla, no aporta valor predictivo.
- Licencia no disponible: no se especifican condiciones de uso comercial del código; los datos (CSV con nombres de jugadores e historial de lesiones) están en un repositorio privado y no deben publicarse sin verificar las condiciones de Transfermarkt.
- Riesgo de dependencia de la fuente: cambios en la estructura de Transfermarkt o bloqueos HTTP (403, 429, 5xx) interrumpen el scraping; los 404/410 se saltan y se reintentan en la siguiente ejecución.
- El idioma del informe es francés; no se documentan traducciones ni soporte multilingüe.
- No hay pesos publicados ni artefactos de inferencia: cualquier reutilización exige ejecutar el pipeline completo con acceso a los datos privados.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/simonlesaumon/injury-poc
- Repositorio de datos (privado, requiere autenticación): https://huggingface.co/datasets/simonlesaumon/injury-poc-data
- Documentación de diseño citada en la model card: `docs/design.md` (dentro del repositorio)
- Fuente de datos: https://www.transfermarkt.com
