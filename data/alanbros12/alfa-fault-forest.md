# Alanbros12/alfa-fault-forest

## Resumen

ALFA fault forest es un clasificador tabular basado en random forest, desarrollado por Alanbros12, que detecta fallos en un UAV de ala fija segundo a segundo utilizando exclusivamente datos de sensores pasados. Es el detector "F" (solo sensores) del proyecto alfa-fault-detection, y se distribuye como un bundle de joblib que encapsula el modelo, el orden exacto de las 21 características de entrada y los parámetros de la regla de alarma. No es una red neuronal ni un modelo de lenguaje: es un artefacto de scikit-learn orientado a un pipeline de clasificación tabular sobre series temporales.

El modelo resuelve un problema acotado pero relevante en robótica aérea: dada una ventana de telemetría por segundo, estimar la probabilidad de que la aeronave esté volando con un fallo. La entrada son 21 características derivadas de siete señales (alt_error, xtrack_error, hud_altitude, vel_lin_z, roll_gap, pitch_gap y yaw_gap), cada una resumida con la media de 5 s, la desviación estándar de 5 s y el cambio en 10 s. La salida se filtra con una regla de persistencia: alarma cruda si la probabilidad es al menos 0,5 y alarma final si se mantiene 3 segundos consecutivos dentro de un mismo vuelo.

Su relevancia es fundamentalmente metodológica y de reproducibilidad: documenta con transparencia el entrenamiento (300 árboles, `min_samples_leaf=5`, `class_weight="balanced_subsample"`, `random_state=0`, scikit-learn 1.9.1), el conjunto de datos empleado (37 vuelos de desarrollo, 3279 segundos tras el recorte de 30 s) y los resultados en un conjunto de test bloqueado de 9 vuelos. No es un sistema de seguridad y el propio autor lo advierte.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Random forest (scikit-learn, `RandomForestClassifier`) |
| Parametros totales | 300 arboles; numero de parametros no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana de caracteristicas de 5 s y 10 s por senal |
| Tipos de cuantizacion | no disponible (modelo tabular, no se distribuye cuantizado) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | cc-by-4.0 |
| Formato de pesos | joblib (bundle `.joblib` con `model`, `features`, `threshold`, `k_persist`) |

## Arquitectura y entrenamiento

El modelo es un bosque aleatorio de 300 árboles de decisión entrenado con scikit-learn 1.9.1 sobre características tabulares derivadas de series temporales. Cada muestra corresponde a un segundo de vuelo y se describe con 21 variables: para cada una de las siete señales (alt_error, xtrack_error, hud_altitude, vel_lin_z, roll_gap, pitch_gap, yaw_gap) se calculan la media en una ventana de 5 s, la desviación estándar en 5 s y el cambio en 10 s. El orden exacto de las columnas se guarda en el bundle bajo la clave `features`, lo que evita desajustes en inferencia.

El entrenamiento usó los 37 vuelos de desarrollo del dataset ALFA, con un total de 3279 segundos tras aplicar un recorte de 30 s, y dejó fuera los 9 vuelos de test bloqueados. Se configuró `min_samples_leaf=5`, `class_weight="balanced_subsample"` para compensar el desbalance entre segundos con y sin fallo, y `random_state=0` para reproducibilidad. No se documenta uso de validación cruzada durante el ajuste ni de técnicas de aumento de datos; la evaluación reportada incluye cinco particiones de desarrollo además del test bloqueado. La innovación técnica principal no está en el algoritmo, sino en el diseño de características y en la regla de persistencia temporal que convierte probabilidades por segundo en alarmas estables.

## Capacidades

- Clasificación binaria tabular por segundo: estima la probabilidad de que el UAV esté operando con un fallo.
- Detección basada solo en sensores: no requiere modelo dinámico de la aeronave ni entradas de control.
- Agregación temporal mediante regla de persistencia: alarma cruda con umbral 0,5 y alarma final tras 3 segundos consecutivos dentro de un mismo vuelo.
- Detección fiable de fallos de motor según la model card.
- Detección parcial de fallos de alerón, timón de dirección y elevador (tasa de acierto del 12 al 27 %).
- Integración sencilla en Python vía joblib y scikit-learn; el bundle incluye el orden de características y los parámetros de la regla de alarma.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües.

## Casos de uso

- Monitorización de telemetría en banco de pruebas: ejecutar el bosque sobre cada segundo de vuelo registrado para etiquetar segmentos con fallo y priorizar la revisión manual de los vuelos con alarmas persistentes.
- Detección de fallos de motor en vuelos de desarrollo: dado que la model card indica que encuentra fallos de motor de forma fiable, puede usarse como primer filtro en campañas de ensayo con UAV de ala fija.
- Generación de etiquetas auxiliares para entrenar modelos más complejos: las alarmas por segundo sirven como pseudoetiquetas o como señal de comparación frente a detectores basados en modelos dinámicos.
- Análisis post-vuelo y elaboración de informes: la regla de persistencia de 3 s reduce falsos positivos puntuales, lo que facilita la revisión de incidentes en registros históricos.
- Prototipado rápido en Python: al ser un artefacto de scikit-learn cargable con joblib, se integra en notebooks y scripts sin infraestructura de GPU.
- Evaluación comparativa de detectores: sirve como línea base reproducible (semilla fija, hiperparámetros documentados) frente a detectores del mismo proyecto que usan más información que los sensores.
- Docencia e investigación en detección de anomalías en series temporales: ejemplo completo de ingeniería de características con ventanas deslizantes y validación sobre vuelos separados.

## Benchmarks y rendimiento

| Metrica | Conjunto | Resultado |
|---|---|---|
| F1 | Test bloqueado (9 vuelos) | 0,50 |
| F1 | Media sobre 5 particiones de desarrollo | 0,51 |
| F1 | Rango entre particiones de desarrollo | 0,35 a 0,78 |
| Tasa de deteccion de fallos de motor | No especificado | fiable (sin cifra) |
| Tasa de deteccion de fallos de aleron, timon y elevador | No especificado | 12 % a 27 % |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni benchmarks de lenguaje en la informacion disponible; no aplican a este modelo.

## Requisitos de hardware

- VRAM: no aplica; la inferencia es en CPU.
- GPU recomendadas: no aplica; no se requiere GPU.
- Compatibilidad con GPU de consumo: irrelevante, el modelo cabe en memoria principal sin requisitos relevantes.
- Memoria RAM: no disponible; un bosque de 300 árboles sobre 21 características es de tamaño reducido, pero la model card no publica el tamaño exacto del artefacto.
- Opciones de despliegue: Python con scikit-learn 1.9.1 y joblib; otras versiones de scikit-learn pueden emitir avisos o fallar al cargar el bundle.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Contexto temporal | Licencia | Notas |
|---|---|---|---|---|---|
| ALFA fault forest (este modelo) | Random forest | 21 características tabulares | Ventanas de 5 s y 10 s | cc-by-4.0 | Detector solo de sensores del proyecto alfa-fault-detection |
| Otros detectores del proyecto alfa-fault-detection | no disponible | no disponible | no disponible | no disponible | La model card menciona que este es el detector "F" (solo sensores) frente a otros del mismo proyecto, sin detallar sus especificaciones |
| Modelos de detección de anomalías en UAV basados en el dataset ALFA | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

No se dispone de información suficiente para establecer una comparativa cuantitativa con alternativas concretas.

## Limitaciones y advertencias

- Un solo tipo de aeronave: el modelo está entrenado para un UAV de ala fija concreto y no se garantiza su transferencia a otras plataformas.
- Fallos inyectados artificialmente: los datos de entrenamiento provienen de fallos provocados de forma deliberada, no de fallos naturales en operación real.
- Conjunto de test pequeño: solo 9 vuelos, por lo que las métricas publicadas son aproximadas y con alta incertidumbre.
- Rendimiento limitado: F1 de 0,50 en test y tasas de detección del 12 al 27 % para fallos de alerón, timón y elevador.
- No es un sistema de seguridad: el propio autor advierte explícitamente que no debe usarse como tal.
- Dependencia de versión: requiere scikit-learn 1.9.1; otras versiones pueden avisar o fallar al cargar el bundle.
- Sin soporte de lenguaje natural ni multilingüe: los campos de idiomas no aplican.
- Licencia CC BY 4.0: permite uso comercial con atribución; deben respetarse los créditos al dataset ALFA y a sus autores.
- Riesgo de alucinación: no aplica en el sentido habitual, pero sí existe riesgo de falsos positivos y falsos negativos en la clasificación.
- Sesgos conocidos: no documentados en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Alanbros12/alfa-fault-forest
- Dataset de características: https://huggingface.co/datasets/Alanbros12/alfa-per-second-table
- Repositorio del proyecto: https://github.com/PhamAnhHoangg/alfa-fault-detection
- Paper del dataset ALFA: https://doi.org/10.1177/0278364920966642
- Datos ALFA: https://doi.org/10.1184/R1/12707963
