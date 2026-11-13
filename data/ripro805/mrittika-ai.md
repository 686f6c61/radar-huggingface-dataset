# ripro805/mrittika-ai

## Resumen

Mrittika AI es un conjunto de artefactos de aprendizaje automatico clasico (no un modelo de lenguaje) orientados a la recomendacion de cultivos y fertilizantes en Bangladesh. Lo publica el usuario ripro805 en Hugging Face bajo licencia MIT y esta construido con scikit-learn, XGBoost y LightGBM. El repositorio incluye dos modelos entrenados en formato pickle, los conjuntos de datos de entrenamiento en CSV, ficheros de metricas en JSON y visualizaciones de evaluacion (matrices de confusion e importancia de variables).

El problema que resuelve es la recomendacion agronomica tabular: dado un conjunto de variables de entrada (suelo, clima y, presumiblemente, nutrientes), el modelo de cultivo predice el cultivo mas adecuado y el de fertilizante clasifica el tipo de fertilizante y estima la dosis en kg/ha. No es un modelo generativo ni tiene arquitectura transformer; es un pipeline de ML supervisado con modelos de ensemble basados en arboles.

Su relevancia es acotada: se trata de un proyecto de nicho, con cero descargas y cero likes en el momento de la consulta, sin model card detallada sobre el esquema de variables ni sobre la procedencia de los datos. Resulta util como referencia para prototipos de agricultura de precision en el contexto de Bangladesh, pero no sustituye a un sistema de recomendacion agronomica validado en campo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble de arboles: ExtraTrees (cultivo), XGBoost + LightGBM (fertilizante) |
| Parametros totales | no disponible (no aplica; modelos de ML clasico) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada tabular) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | MIT |
| Formato de pesos | Pickle de Python (`.pkl`), mas CSV, JSON y PNG |

## Arquitectura y entrenamiento

El modelo de recomendacion de cultivos es un `ExtraTreesClassifier` de scikit-learn, un ensemble de arboles extremadamente aleatorizados que divide los nodos con umbrales aleatorios. El modelo de fertilizantes combina dos componentes: un clasificador XGBoost para predecir la clase de fertilizante y un regresor LightGBM para estimar la dosis en kg/ha. Ambos artefactos se serializan con `pickle`, por lo que la inferencia requiere versiones compatibles de scikit-learn, XGBoost y LightGBM con las usadas en el entrenamiento.

No se dispone de informacion sobre el numero de muestras, la composicion exacta del dataset ni el proceso de seleccion de hiperparametros mas alla de los resultados de evaluacion reportados. Los conjuntos de datos publicados (`bangladesh_crop_recommendation.csv` y `bangladesh_fertilizer_recommendation.csv`) son la unica referencia sobre la distribucion de entrada; el esquema de variables no se documenta en la model card, aunque por el dominio cabe esperar variables edafoclimaticas (N, P, K, pH, humedad, temperatura, precipitacion) y, en el caso del fertilizante, variables de suelo y cultivo. No se menciona validacion cruzada, particion train/test ni tecnicas de calibracion.

## Capacidades

- Clasificacion multiclase de cultivos recomendados a partir de variables tabulares de entrada.
- Clasificacion multiclase de tipo de fertilizante recomendado.
- Regresion de dosis de fertilizante en kg/ha.
- Salida de probabilidades por clase en el clasificador de cultivos (se reporta top-3 accuracy, lo que implica scores por clase).
- Interpretabilidad mediante importancia de variables exportada como imagen.
- Evaluacion reproducible con matrices de confusion y metricas en JSON.
- No soporta tool calling, agentes, razonamiento multi-paso, vision, audio ni generacion de texto.

## Casos de uso

- Prototipo de asesor agronomico para pequenos agricultores en Bangladesh: integrado en una API que recibe lecturas de suelo y clima y devuelve el cultivo recomendado con su probabilidad, usando el clasificador ExtraTrees.
- Planificacion de fertilizacion por parcela: el clasificador XGBoost sugiere el tipo de fertilizante y el regresor LightGBM estima la dosis en kg/ha, lo que permite generar una recomendacion cuantitativa por explotacion.
- Sistema de alerta temprana en cooperativas agricolas: procesar lotes de datos de sensores de suelo y emitir recomendaciones masivas, aprovechando que la inferencia de arboles es de baja latencia y no requiere GPU.
- Herramienta educativa o de extension agraria: mostrar al agricultor las tres clases mas probables (top-3 accuracy de 0,9759 en cultivos) para fomentar decision informada en lugar de una unica respuesta.
- Analisis de sensibilidad agronomica: usar las importancias de variables exportadas para identificar que factores edafoclimaticos pesan mas en la recomendacion y priorizar muestreos de suelo.
- Base para un sistema de recomendacion multiobjetivo: combinar las salidas de cultivo y fertilizante en un motor de reglas que optimice rendimiento y coste de insumos.
- Referencia de benchmarking interno: emplear las metricas publicadas (accuracy 0,8613 en cultivo; 0,9617 en clasificacion de fertilizante; R2 0,9740 en regresion) como linea base al entrenar modelos propios con datos locales.

## Benchmarks y rendimiento

| Tarea | Modelo | Metrica | Valor |
|---|---|---|---|
| Recomendacion de cultivo | ExtraTrees | Test accuracy | 0,8613 |
| Recomendacion de cultivo | ExtraTrees | Test macro-F1 | 0,8599 |
| Recomendacion de cultivo | ExtraTrees | Test top-3 accuracy | 0,9759 |
| Recomendacion de fertilizante (clasificacion) | XGBoost | Test accuracy | 0,9617 |
| Recomendacion de fertilizante (clasificacion) | XGBoost | Test macro-F1 | 0,9394 |
| Recomendacion de fertilizante (regresion) | LightGBM | R2 | 0,9740 |
| Recomendacion de fertilizante (regresion) | LightGBM | MAE | 29,221 kg/ha |

No se han publicado resultados comparativos frente a otros modelos en la informacion disponible.

## Requisitos de hardware

- Inferencia en CPU: los tres modelos (ExtraTrees, XGBoost, LightGBM) se ejecutan en CPU sin GPU; el coste dominante es la carga del pickle y las dependencias.
- Memoria RAM: no disponible el tamano exacto de los artefactos (el repositorio ocupa 0,0 GB reportados, lo que sugiere ficheros pequenos, del orden de pocos MB o menos).
- GPU: no necesaria ni recomendada; no hay soporte documentado de aceleracion por GPU para estos artefactos.
- Cabe en cualquier portatil consumer; no requiere tarjeta grafica dedicada.
- Despliegue: servidor Python con scikit-learn, XGBoost y LightGBM; se puede exponer via FastAPI, Flask o como funcion serverless. No aplican vLLM, llama.cpp, Ollama ni TGI, que son para modelos de lenguaje.
- Latencia y throughput: no disponibles en la informacion proporcionada; por la naturaleza de los ensembles de arboles, se espera latencia de milisegundos por peticion en CPU, pero no hay medicion publicada.

## Comparativa con modelos similares

| Modelo | Tipo | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|
| Mrittika AI (ripro805) | ExtraTrees + XGBoost + LightGBM | Cultivo y fertilizante (Bangladesh) | MIT | Hugging Face, 0 descargas |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Ambito geografico restringido: los datos son de Bangladesh; extrapolar las recomendaciones a otras regiones o tipos de suelo no esta validado.
- Esquema de entrada no documentado: la model card no detalla las variables de entrada ni su orden, lo que dificulta la integracion sin inspeccionar los CSV y el pipeline original.
- Riesgo de deserializacion insegura: los artefactos son pickles de Python; cargarlos de fuentes no confiables permite ejecucion de codigo arbitrario. Solo deben cargarse desde el repositorio oficial y con versiones de libreria compatibles.
- Dependencia de versiones: pickles de scikit-learn, XGBoost y LightGBM pueden fallar o dar resultados distintos con versiones diferentes a las de entrenamiento.
- Sin validacion en campo publicada: las metricas son de test sobre el propio dataset; no hay evidencia de eficacia agronomica real (rendimiento, coste, sostenibilidad).
- Sesgo potencial por composicion del dataset: al no documentarse la procedencia ni el muestreo, no puede descartarse un sesgo hacia cultivos o fertilizantes sobrerrepresentados.
- Sin soporte multilingue ni de texto: no es un modelo de lenguaje; no debe presentarse como asistente conversacional.
- Licencia MIT: permite uso comercial y modificacion, pero sin garantia implicita; el autor no ofrece soporte ni mantenimiento (0 descargas, 0 likes, sin actividad posterior documentada).
- No apto como unica fuente de decision agronomica en produccion sin revision por un experto.

## Enlaces

- Hugging Face: https://huggingface.co/ripro805/mrittika-ai
