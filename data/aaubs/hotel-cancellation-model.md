# AAUBS/hotel-cancellation-model

## Resumen

AAUBS/hotel-cancellation-model es un modelo de clasificación tabular binaria que estima la probabilidad de que una reserva de hotel sea cancelada utilizando únicamente la información disponible en el momento de formalizar la reserva. Lo desarrolla el usuario AAUBS en el marco del programa Business Data Science de la Universidad de Aalborg (sesión 10), y su propósito declarado es docente: sirve como ejemplo completo de un flujo de trabajo de ciencia de datos aplicada al sector turístico. No es un modelo de lenguaje: no procesa texto libre ni genera contenido, sino que consume variables estructuradas de una reserva y devuelve una probabilidad.

Técnicamente se trata de un pipeline de scikit-learn (imputación, escalado y codificación one-hot) seguido de un clasificador XGBoost, con hiperparámetros ajustados mediante Optuna sobre la log loss de validación. Se entrena con el conjunto público Hotel booking demand datasets (Antonio, Almeida y Nunes, 2019), que recoge reservas de dos hoteles portugueses entre 2015 y 2017, y se evalúa con una partición temporal estricta por fecha de llegada.

Su relevancia es fundamentalmente metodológica: documenta de forma explícita la eliminación de variables con fuga de información (*leakage*) que se registran o actualizan después de crear la reserva, aplica un esquema de validación temporal en lugar de aleatorio y publica métricas de calibración probabilística (log loss y Brier) además del AUC. El repositorio ocupa 0,0 GB y no registra descargas ni valoraciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de scikit-learn (imputacion, escalado, one-hot encoding) + XGBoost (gradient boosting sobre arboles de decision) |
| Parametros totales | no disponible (no se especifican numero de arboles, profundidad ni numero de hojas) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo tabular; la entrada es un vector de caracteristicas de la reserva) |
| Tipos de cuantizacion | no aplica (modelo tabular basado en arboles) |
| Idiomas soportados | no disponible (no procesa texto libre) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | joblib (`model.joblib`), con versiones de dependencias fijadas en `config.json` |

## Arquitectura y entrenamiento

El modelo es un clasificador binario supervisado sobre datos tabulares. La entrada pasa por un pipeline de preprocesamiento de scikit-learn que encadena imputación de valores ausentes, escalado de variables numéricas y codificación one-hot de las categóricas; la salida de ese pipeline alimenta un clasificador XGBoost. Los hiperparámetros se seleccionaron con Optuna optimizando la log loss sobre el conjunto de validación, no sobre el de test.

Los datos proceden del conjunto Hotel booking demand datasets (Antonio, Almeida y Nunes, *Data in Brief* 22, 2019), con reservas de dos hoteles portugueses entre 2015 y 2017. La partición es temporal por fecha de llegada: entrenamiento hasta noviembre de 2016, validación de diciembre de 2016 a marzo de 2017 y test de abril a agosto de 2017. Se eliminaron explícitamente por fuga de información las variables `required_car_parking_spaces`, `total_of_special_requests`, `booking_changes`, `days_in_waiting_list`, `room_changed` e `is_portugal`, por registrarse o actualizarse después de crear la reserva. No se documenta ningún uso de RLHF, DPO ni técnicas de ajuste por preferencias, algo por otra parte ajeno a este tipo de modelo.

## Capacidades

- Clasificación binaria tabular: estima la probabilidad de cancelación de una reserva a partir de las características conocidas en el momento de la reserva.
- Salida probabilística calibrada de forma razonable: se publican log loss (0,5004) y Brier score (0,1694) además del AUC, lo que permite evaluar la calidad de las probabilidades, no solo el orden de las predicciones.
- Preprocesamiento integrado: el pipeline resuelve imputación, escalado y codificación de categóricas, de modo que acepta directamente el formato de la tabla de entrada sin transformaciones manuales adicionales.
- Reutilización como referencia metodológica: el diseño de la partición temporal y la lista documentada de variables eliminadas por fuga sirven como plantilla para otros proyectos de predicción con datos históricos.
- Generación de texto: no soportada.
- Razonamiento, matemáticas y código: no aplica.
- Tool calling / function calling: no soportado.
- Agentes y razonamiento multi-paso: no soportado.
- Capacidades multilingües: no aplica (no hay entrada ni salida en lenguaje natural).
- Visión, audio o modo *thinking*: no soportados.

## Casos de uso

- Docencia en ciencia de datos: sirve como ejemplo completo y reproducible de un proyecto de clasificación tabular, desde el preprocesamiento hasta la evaluación con métricas probabilísticas, para asignaturas tipo Business Data Science.
- Prototipado de sistemas de revenue management: permite estimar de forma aproximada la probabilidad de cancelación al crear la reserva y estudiar cómo cambiaría la ocupación esperada, siempre como prototipo y nunca como base de decisiones reales de precios o dotación de personal, tal como advierte el propio autor.
- Línea base (*baseline*) para comparación de métodos: al ser un XGBoost con métricas publicadas sobre una partición temporal concreta, resulta útil como referencia frente a alternativas más complejas como TabNet combinado con análisis de supervivencia.
- Estudio de calibración probabilística: los valores de log loss (0,5004) y Brier (0,1694) permiten analizar técnicas de calibración (Platt scaling, isotonic regression) y medir su impacto sobre un modelo ya calibrado de partida.
- Análisis de fuga de información: la lista explícita de variables eliminadas por registrarse después de la reserva es un caso de estudio directo sobre cómo detectar y corregir *leakage* en datos operativos.
- Diseño de validación temporal: el esquema por fecha de llegada (entrenamiento hasta noviembre de 2016, test de abril a agosto de 2017) sirve de modelo para proyectos con deriva temporal en los que una partición aleatoria sería optimista.
- Análisis exploratorio de factores asociados a la cancelación: permite estudiar asociaciones entre variables de reserva y cancelación, teniendo en cuenta que las probabilidades describen patrones del conjunto de datos y no relaciones causales.
- Ejercicio de despliegue de bajo coste: al ser un modelo tabular de XGBoost, se puede cargar con `joblib.load("model.joblib")` en un servicio ligero para practicar el empaquetado, el versionado de dependencias y el control de deriva en producción.

## Benchmarks y rendimiento

El autor publica las siguientes métricas sobre el conjunto de test (reservas con llegada entre abril y agosto de 2017):

| Metrica | Valor (test, abril-agosto 2017) |
|---|---|
| AUC | 0,8102 |
| Log loss | 0,5004 |
| Brier score | 0,1694 |

No se han publicado resultados de benchmarks en la informacion disponible para comparaciones adicionales (por ejemplo, frente a regresión logística, random forest o TabNet sobre la misma partición).

## Requisitos de hardware

- GPU: no necesaria. XGBoost sobre datos tabulares de este tamaño se ejecuta en CPU.
- VRAM estimada para inferencia: no aplica; el modelo no requiere GPU.
- Memoria RAM: no disponible el tamaño del modelo serializado; el repositorio de HuggingFace ocupa 0,0 GB, lo que sugiere un artefacto de tamaño reducido, pero no se confirma en la informacion proporcionada.
- GPU recomendadas: no aplica (A100, H100 o RTX 4090 no aportan ventaja para este tipo de modelo).
- Cabe en GPU de consumo: sí, aunque no es necesario; también funciona en cualquier equipo de sobremesa o portátil convencional.
- Opciones de despliegue: carga directa con `joblib.load("model.joblib")` respetando las versiones indicadas en `config.json`. No se documentan opciones adicionales (vLLM, llama.cpp, Ollama, TGI, ONNX Runtime, Triton, etc.) en la informacion disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Enfoque | Metricas publicadas | Licencia | Disponibilidad |
|---|---|---|---|---|
| AAUBS/hotel-cancellation-model | XGBoost + pipeline de scikit-learn, partición temporal | AUC 0,8102; log loss 0,5004; Brier 0,1694 (test) | CC-BY-4.0 | HuggingFace |
| TabNet + DeepHit (articulo en Journal of Information Technology & Tourism) | Aprendizaje profundo en dos etapas: clasificación de cancelación y análisis de supervivencia para el tiempo hasta la cancelación | no disponible en la informacion proporcionada | no disponible | Publicacion cientifica |
| Modelos bayesianos para predicción de cancelaciones (arXiv:2410.16406) | Modelos bayesianos aplicados a registros de reservas | el articulo cita una exactitud del 80 % para cancelaciones a 7 días, correspondiente a un estudio referenciado, no a un resultado propio verificable aquí | no disponible | Articulo en arXiv |
| Proyectos de GitHub sobre cancelación hotelera (anand193, Assyrian91) | Distintos enfoques de machine learning sobre datos de reservas | no disponible en la informacion proporcionada | no disponible | Repositorios en GitHub |

La comparación cuantitativa directa no es posible porque los modelos alternativos no publican métricas sobre la misma partición temporal ni sobre el mismo conjunto de datos exacto.

## Limitaciones y advertencias

- Alcance de los datos: únicamente dos hoteles de un solo país (Portugal) y un periodo de 2015 a 2017. La generalización a otras geografías, cadenas hoteleras o periodos recientes no está validada.
- Deriva temporal: las cancelaciones aumentaron en 2017 y el modelo las infravalora ligeramente, según reconoce el propio autor. El rendimiento medido en 2017 podría no reproducirse en datos posteriores.
- Interpretación no causal: las probabilidades describen patrones presentes en este conjunto de datos, no relaciones de causa-efecto. No debe usarse para inferir por qué un cliente cancela.
- Uso en producción restringido: el autor indica explícitamente que el modelo no debe emplearse para decisiones reales de precios o de planificación de personal.
- Sesgo de selección: al provenir de dos establecimientos concretos, la distribución de tipos de cliente, canales de reserva y políticas comerciales es limitada y puede no representar otros mercados.
- Riesgo de alucinación: no aplica en el sentido habitual, pero existe riesgo de sobreconfianza en las probabilidades, especialmente fuera del rango temporal y operativo cubierto por los datos de entrenamiento.
- Limitaciones de idioma: no disponible; el modelo no procesa lenguaje natural.
- Restricciones de licencia: CC-BY-4.0 permite uso comercial y obras derivadas siempre que se atribuya la autoría y se indique si se han introducido cambios. No se especifica atribución requerida adicional en la informacion proporcionada.
- Dependencia de versiones: el autor recomienda cargar el modelo con las versiones exactas indicadas en `config.json`; usar otras versiones de scikit-learn o XGBoost puede romper la deserialización o alterar las predicciones.
- Reproducibilidad: no se documentan semillas aleatorias, número de iteraciones de Optuna ni el espacio de búsqueda de hiperparámetros en la informacion disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AAUBS/hotel-cancellation-model
- Referencia del conjunto de datos: Antonio, Almeida y Nunes (2019), *Hotel booking demand datasets*, Data in Brief 22.
- Articulo sobre TabNet y DeepHit para cancelaciones y tiempo hasta la cancelación: https://link.springer.com/article/10.1007/s40558-026-00394-y
- Proyecto de GitHub relacionado (anand193): https://github.com/anand193/hotel-cancellation-model
- Proyecto de GitHub relacionado (Assyrian91, hotel-intelligence-suite): https://github.com/Assyrian91/hotel-intelligence-suite/tree/main/booking-cancellation-model
- Estudio sobre predicción de cancelaciones hoteleras con machine learning: https://www.researchgate.net/publication/379870083_Forecasting_hotel_cancellations_through_machine_learning
- Articulo sobre modelos bayesianos aplicados a reservas hoteleras: https://arxiv.org/pdf/2410.16406
