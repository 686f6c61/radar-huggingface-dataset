# AkshayKarthick/pm25-next-day-india

## Resumen

pm25-next-day-india es un modelo de regresión tabular basado en LightGBM que predice la media diaria de 24 horas de PM2.5 (µg/m³) del día siguiente para 50 ciudades de la India. Lo desarrolla AkshayKarthick y se publica con licencia CC-BY-4.0 y librería `lightgbm`. No es un modelo de lenguaje: es un conjunto de árboles de decisión potenciados por gradiente (GBDT) que consume 48 características tabulares por ciudad y día.

El modelo usa exclusivamente la calidad del aire y la meteorología de hoy y de los días anteriores, extraídas del dataset India Daily Weather & Air Quality (que se actualiza a diario; meteorología de ERA5/IFS y calidad del aire del modelo global CAMS, ambos vía Open-Meteo), de modo que puede generar una predicción nueva cada mañana sin depender de pronósticos meteorológicos. La variable objetivo es `pm2_5_mean` del día siguiente, entrenada en escala `log1p`.

Su relevancia práctica está en la ganancia medida frente a la persistencia ("mañana = hoy"), una línea base difícil de batir porque el PM2.5 varía lentamente. En un año de test retenido (18.300 pares ciudad-día) obtiene un MAE de 6,602 µg/m³, un 9,3% mejor que la persistencia, y clasifica correctamente en la categoría CPCB de PM2.5 el 80,7% de los casos. Gana a la persistencia en las 50 ciudades y se entrena en pocos minutos en la CPU de un portátil.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Gradient boosting sobre árboles de decisión (LightGBM); 772 iteraciones de boosting, `num_leaves` 31, `learning_rate` 0,03 |
| Parámetros totales | no disponible (el autor no publica recuento de parámetros; no es una red neuronal) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica: el modelo recibe 48 características tabulares por ciudad y día; no procesa secuencias de tokens |
| Tipos de cuantización | no aplica (el booster se distribuye como texto plano; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (modelo numérico, no procesa texto) |
| Licencia | cc-by-4.0 |
| Formato de pesos | `model/model.txt` (booster de LightGBM en texto plano); predicciones en escala `log1p`, requieren `np.expm1` |
| Tarea (pipeline) | tabular-regression (predicción de series temporales) |
| Dataset de entrenamiento | AkshayKarthick/india-weather-air-quality |
| Cobertura | 50 ciudades de la India, datos de 2023 a 2026-09-25 |
| Salida | PM2.5 medio de 24 h del día siguiente (µg/m³) |

## Arquitectura y entrenamiento

El modelo es un booster de LightGBM con objetivo de regresión sobre la transformación `log1p` del PM2.5 medio del día siguiente. Hiperparámetros declarados: `{"objective": "regression", "bagging_fraction": 0.8, "bagging_freq": 1, "lambda_l2": 1.0, "num_leaves": 31, "min_child_samples": 50, "learning_rate": 0.03, "feature_fraction": 0.8, "num_boost_round": 772}`. El ajuste consistió en una rejilla pequeña (hojas, mínimo de muestras) con *early stopping* sobre validación; el modelo final se reentrenó sobre train + validación con un 10% más de árboles. Todas las ejecuciones se registraron con MLflow. El entrenamiento se completó en pocos minutos en la CPU de un portátil.

Las 48 características incluyen los contaminantes de hoy, retardos de PM2.5 de 1 a 6 días y medias móviles de 3 a 30 días, meteorología del día actual (temperatura, lluvia, humedad, velocidad y dirección del viento, radiación), lluvia y viento de 3 días, calendario del día objetivo (estación, día de la semana y días desde Diwali) y variables de ciudad (región, coordenadas, elevación). Los conjuntos se dividieron por fecha objetivo y nunca se barajaron: train con fechas objetivo anteriores a 2024-09-25, validación del 2024-09-25 al 2025-09-24 y test del 2025-09-25 al 2026-09-25 (18.300 pares ciudad-día, puntuado una sola vez tras finalizar el ajuste). Importancia de características por ganancia:

| Característica | Porcentaje de ganancia |
|---|---:|
| `pm2_5_mean` | 74,0% |
| `pm2_5_max` | 18,1% |
| `city` | 1,0% |
| `pm2_5_roll30` | 0,9% |
| `pm2_5_roll3` | 0,8% |
| `pm2_5_change1` | 0,6% |
| `pm10_mean` | 0,4% |
| `pm2_5_roll14` | 0,4% |

## Capacidades

- Predicción del PM2.5 medio de 24 horas del día siguiente para 50 ciudades indias, a partir de datos del día en curso y de días anteriores.
- Generación de una predicción actualizada cada mañana, apoyándose en un dataset que se refresca a diario.
- Clasificación implícita en categorías CPCB de PM2.5: el 80,7% de los pares ciudad-día del año de test caen en la categoría correcta.
- Cobertura de 50 ciudades con un único modelo, incluidas las más contaminadas (Delhi, Agra, Ludhiana, Amritsar, Patna, Lucknow, Kanpur, Prayagraj, Varanasi y Kolkata).
- Entrenamiento reproducible y ligero: rejilla de hiperparámetros documentada, trazabilidad con MLflow y ejecución en CPU.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües, de visión, de audio ni modo de razonamiento: no procesa texto ni imágenes.
- No incorpora variables de pronóstico meteorológico futuro; el autor documenta que añadirlas es un experimento aparte, no la versión publicada.

## Casos de uso

- Avisos diarios de calidad del aire para población urbana: el modelo produce cada mañana una estimación del PM2.5 medio de las próximas 24 horas por ciudad, con un MAE de 6,60 µg/m³, suficiente para activar recomendaciones de mascarilla o reducción de actividad al aire libre cuando la predicción supera umbrales CPCB.
- Gestión de episodios de contaminación invernal: en los meses de noviembre a febrero el error es de 9,1 µg/m³ y la ganancia frente a la persistencia del 10,2%, por lo que resulta útil para planificar restricciones temporales de tráfico o de obras en el norte de la India.
- Cuadro de mando medioambiental para administraciones: al cubrir 50 ciudades con un solo modelo y un coste de cómputo mínimo, se puede integrar en un panel que se recalcula a diario sin infraestructura GPU.
- Investigación en calidad del aire: sirve como línea base reproducible (splits temporales fijos, hiperparámetros publicados, predicciones de test en `model/test_predictions.csv`) contra la que medir modelos más complejos.
- Salud pública y epidemiología: la predicción a un día permite anticipar picos de exposición y cruzarla con series de ingresos respiratorios, usando `model/per_city_test.csv` para calibrar por ciudad.
- Agricultura y alertas locales: el calendario incluye los días desde Diwali y variables de viento y lluvia de 3 días, lo que permite explicar picos estacionales asociados a quemas de rastrojos en el norte del país.
- Planificación de turnos en sectores expuestos: construcción, reparto o deporte al aire libre pueden usar el pronóstico por ciudad para reprogramar actividades en los días de mayor concentración prevista.
- Docencia y formación práctica: el repositorio incluye `predict.py` y `features.py` con el mismo código usado en entrenamiento, lo que permite reproducir el pipeline completo en un portátil.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (métricas `verified: false`, es decir, no verificadas de forma independiente). Año de test: 2025-09-25 a 2026-09-25, 18.300 pares ciudad-día.

| Modelo | MAE (µg/m³) | RMSE (µg/m³) | R² | Categoría PM2.5 correcta |
|---|---:|---:|---:|---:|
| Este modelo | 6,602 | 10,163 | 0,8894 | 80,7% |
| Persistencia (mañana = hoy) | 7,28 | 11,31 | 0,863 | 78,7% |
| Media móvil de 7 días | 10,01 | 15,07 | 0,757 | 70,7% |
| Media por ciudad × mes | 11,83 | 18,01 | 0,652 | 66,1% |

Desglose de la ganancia frente a la persistencia:

| Periodo | MAE del modelo (µg/m³) | Ganancia frente a persistencia |
|---|---:|---:|
| Global | 6,602 | 9,3% |
| Invierno (noviembre a febrero) | 9,1 | 10,2% |
| Resto del año | 5,4 | 8,5% |

Experimento adicional no publicado (usa la meteorología real del día siguiente, por lo que es una cota superior): MAE 5,99 µg/m³, un 17,7% mejor que la persistencia, aproximadamente el doble de la ganancia del modelo publicado.

MAE por ciudad en el año de test, para las diez ciudades más contaminadas:

| Ciudad | PM2.5 medio | MAE del modelo | MAE de la persistencia | Ganancia |
|---|---:|---:|---:|---:|
| Delhi | 87 | 16,0 | 17,6 | +9% |
| Agra | 82 | 15,1 | 16,9 | +11% |
| Ludhiana | 76 | 13,3 | 14,5 | +9% |
| Amritsar | 75 | 13,7 | 14,1 | +2% |
| Patna | 67 | 10,5 | 12,6 | +17% |
| Lucknow | 64 | 10,7 | 11,8 | +10% |
| Kanpur | 63 | 10,2 | 11,6 | +12% |
| Prayagraj | 62 | 10,1 | 11,3 | +10% |
| Varanasi | 61 | 9,1 | 10,3 | +11% |
| Kolkata | 61 | 9,9 | 10,8 | +9% |

El modelo supera a la persistencia en 50 de 50 ciudades. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K u otros) porque no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM para inferencia: no aplica; no requiere GPU. No se publican requisitos de VRAM.
- GPU recomendadas: ninguna. El modelo se ejecuta en CPU.
- Compatibilidad con GPU de consumo: no procede; no necesita acelerador gráfico.
- Entrenamiento: unos minutos en la CPU de un portátil, con 772 iteraciones y 31 hojas por árbol.
- Latencia y throughput: no se publican cifras. El modelo tiene 772 árboles y opera sobre 48 características por instancia, por lo que el coste por predicción es muy bajo, pero el autor no aporta medidas.
- Opciones de despliegue: script `predict.py` incluido en el repositorio; carga directa del booster con `lgb.Booster(model_file="model/model.txt")`; requiere `lightgbm`, `pandas` y `huggingface_hub`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de árboles.
- Almacenamiento: el artefacto principal es un fichero de texto (`model/model.txt`), más CSVs auxiliares de predicciones y métricas por ciudad.
- Dependencia operativa: para producir la predicción diaria hay que descargar la versión más reciente del dataset, ya que el modelo consume datos del día en curso.

## Comparativa con modelos similares

| Alternativa | Tipo | MAE (µg/m³) | RMSE (µg/m³) | R² | Licencia / disponibilidad |
|---|---|---:|---:|---:|---|
| pm25-next-day-india | LightGBM (árboles) | 6,602 | 10,163 | 0,8894 | CC-BY-4.0, público en HuggingFace |
| Persistencia (mañana = hoy) | Línea base trivial | 7,28 | 11,31 | 0,863 | no aplica (regla determinista) |
| Media móvil de 7 días | Línea base estadística | 10,01 | 15,07 | 0,757 | no aplica |
| Media por ciudad × mes | Línea base estadística | 11,83 | 18,01 | 0,652 | no aplica |
| Variante con meteorología real del día siguiente (experimento) | LightGBM con variables futuras | 5,99 | no disponible | no disponible | no publicada |
| Otros modelos públicos de predicción de PM2.5 en la India | no disponible | no disponible | no disponible | no disponible | no disponible |

La model card solo documenta comparaciones frente a líneas base, no frente a otros modelos publicados de la misma categoría.

## Limitaciones y advertencias

- Reacción tardía a picos repentinos: el modelo sigue bien el patrón general, pero se retrasa un día ante subidas bruscas de PM2.5, porque nada en los datos del día actual las anuncia. El propio autor señala esta debilidad con el caso de Delhi en invierno.
- Ausencia de pronóstico meteorológico: el modelo publicado no incorpora la meteorología prevista del día siguiente. La variante experimental que sí la usa baja el MAE a 5,99, pero no está publicada porque necesita entradas que el dataset no contiene.
- Cobertura geográfica limitada: solo 50 ciudades indias. No es extrapolable a otras ciudades, países ni escalas horarias.
- Fuente de datos modelada, no medida: la calidad del aire procede del modelo global CAMS y la meteorología de ERA5/IFS, ambos vía Open-Meteo. El modelo aprende el comportamiento de esas fuentes, no de estaciones de medición en tierra, por lo que puede diferir de los valores observados.
- Métricas no verificadas: los resultados de la model card figuran con `verified: false`; la evaluación la realiza el propio autor.
- Línea base exigente: el R² es alto (0,889) en todas las alternativas razonables porque el PM2.5 es muy persistente de un día a otro. La cifra útil es la ganancia del 9,3% sobre la persistencia, no el R² absoluto.
- Escala de salida: las predicciones del booster están en escala `log1p` y es obligatorio aplicar `np.expm1` antes de interpretarlas en µg/m³.
- Dependencia de la actualización diaria: la predicción de hoy requiere descargar la última versión del dataset; un retraso en la publicación de datos degrada o impide la inferencia.
- Sesgo potencial por ciudad: la importancia de la variable `city` es del 1,0% y la ganancia frente a la persistencia varía mucho entre ciudades (del +2% en Amritsar al +17% en Patna), lo que indica un rendimiento desigual según la ubicación.
- Licencia: CC-BY-4.0 permite uso comercial y obras derivadas siempre que se atribuya la autoría y se indique la licencia; no incluye garantías.
- No apto para decisiones sanitarias individuales: es un modelo estadístico de ámbito urbano, sin validación clínica ni por microentorno.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AkshayKarthick/pm25-next-day-india
- Dataset India Daily Weather & Air Quality: https://huggingface.co/datasets/AkshayKarthick/india-weather-air-quality
- Comparativa de error frente a líneas base (figura del repositorio): `model/mae_vs_baselines.png`
- Pronóstico de invierno en Delhi (figura del repositorio): `model/delhi_winter_forecast.png`
- Métricas por ciudad en test: `model/per_city_test.csv`
- Predicciones de test completas: `model/test_predictions.csv`
- Script de inferencia: `predict.py`
- Código de construcción de características: `features.py`
- Paper: no disponible
- Demo: no disponible
- Repositorio de código independiente: no disponible
