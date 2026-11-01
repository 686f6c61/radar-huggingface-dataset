# Hakangrsy/se-primer-yanlis-karar-riski

## Resumen

SE Primer v2 — Yanlış karar riski es un modelo de clasificación tabular publicado por el usuario Hakangrsy en HuggingFace. No es un modelo de lenguaje ni una red neuronal profunda: se trata de un pipeline clásico de scikit-learn compuesto por un `StandardScaler` seguido de una `LogisticRegression`, exportado a formato ONNX (opset 17). Su función es estimar la probabilidad de que un jugador tome una decisión incorrecta (`p_yanlis`) en un juego educativo llamado SE Primer, y activar una tarjeta de advertencia ("Kıdemli meslektaşın Selin arıyor") cuando esa probabilidad supera el umbral de 0,5.

El modelo se entrenó con datos de solo 44 sesiones reales (132 decisiones) de 4 jugadores, lo que lo convierte en un artefacto educativo y de demostración más que en una herramienta de producción. La entrada es un vector float32 de 3 dimensiones (nivel de experiencia, indicador de decisión 2, indicador de decisión 3) y la salida son probabilidades para dos clases (decisión correcta o incorrecta).

Su relevancia es limitada y contextual: sirve como ejemplo de despliegue ONNX de un clasificador tabular sencillo y de evaluación con validación cruzada agrupada por sesión, pero no debe confundirse con un modelo de IA generativa ni utilizarse fuera del juego para el que fue diseñado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pipeline scikit-learn: StandardScaler + LogisticRegression, exportado a ONNX (opset 17) |
| Parámetros totales | 3 coeficientes + 1 intercepto (regresión logística con 3 features) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo tabular, no secuencial) |
| Tipos de cuantización | No disponible (exportación ONNX float32) |
| Idiomas soportados | No disponible (no procesa texto) |
| Licencia | No disponible |
| Formato de pesos | ONNX (`model.onnx`) |
| Entrada | `input`, float32 `[n, 3]` |
| Salida | `probabilities`, float32 `[n, 2]`; columna 1 = `p_yanlis`; además `label` (0/1, umbral 0,5) |
| Features de entrada | `seviye_kod` (0-2), `karar_2` (0/1), `karar_3` (0/1) |
| Librería | ONNX / scikit-learn 1.9.1 (semilla 42) |
| Tamaño del repo | 0,0 GB |

## Arquitectura y entrenamiento

La arquitectura es una regresión logística binaria precedida de estandarización de features. No hay transformer, MoE ni SSM: es un modelo lineal con tres variables de entrada. Los coeficientes sobre las entradas escaladas son -0,066 para `seviye_kod`, +0,919 para `karar_2` y +0,096 para `karar_3`, lo que indica que la variable más predictiva es la decisión 2 (asociada a mayor riesgo de error), mientras que un mayor nivel de experiencia reduce ligeramente la probabilidad de fallo.

El entrenamiento se realizó con 44 sesiones reales (132 decisiones) de 4 jugadores, sin filas sintéticas, con una tasa de decisión incorrecta del 35 %. La evaluación empleó validación cruzada de 5 pliegues agrupada por sesión, usando solo filas reales. El autor señala que esta es la tercera iteración del modelo: las dos primeras no alcanzaron el umbral de aceptación (ROC AUC ≥ 0,6) y las features se simplificaron tras observar los resultados de intentos previos, por lo que la métrica medida puede ser ligeramente optimista (ver `spec.md` §9.6). No se documenta RLHF, DPO ni ninguna técnica de ajuste fino.

## Capacidades

- Clasificación binaria tabular: estima la probabilidad de decisión incorrecta a partir de tres features.
- Activación condicional de una tarjeta de advertencia en el juego cuando `p_yanlis ≥ 0,5`.
- Inferencia vía ONNX Runtime con entrada float32 `[n, 3]` y salida `[n, 2]`.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües (no procesa texto).
- No dispone de modo thinking, visión ni audio.
- No generaliza a otros escenarios distintos de los tres decisiones del juego SE Primer.

## Casos de uso

- Gamificación educativa en SE Primer: el modelo se invoca en cada pantalla de decisión para calcular `p_yanlis` y, si supera 0,5, mostrar la tarjeta de Selin que invita al jugador a reflexionar antes de responder. Es su único uso previsto por el autor.
- Demostración de despliegue ONNX de un clasificador scikit-learn: sirve como ejemplo mínimo de exportación a opset 17 e integración en un runtime ONNX para entornos docentes.
- Ejemplo de evaluación con validación cruzada agrupada: el esquema de 5 pliegues agrupados por sesión es reutilizable como plantilla metodológica en cursos de machine learning.
- Prototipado de sistemas de alerta temprana en juegos de formación: el patrón (probabilidad de error + umbral + intervención pedagógica) puede replicarse en otros juegos, aunque el modelo concreto no es transferible.
- Análisis de riesgo por tipo de decisión: los coeficientes permiten identificar qué decisiones del juego concentran más errores (la decisión 2, con coeficiente +0,919).
- Estudio de calibración probabilística: el Brier score (0,2021 frente a 0,227 del modelo base) permite comparar la calibración de un modelo lineal simple frente a una tasa constante en un conjunto pequeño.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| ROC AUC (umbral de aceptación ≥ 0,6) | 0,6218 |
| Brier score (menor es mejor) | 0,2021 |
| Brier score, modelo base (tasa constante) | 0,227 |
| Exactitud con umbral 0,5 | 0,7424 |
| Tasa de aparición de la tarjeta de Selin | 0,3333 |
| Tasa de decisión incorrecta en datos reales | 0,35 |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: prácticamente nula; el modelo ONNX ocupa unos pocos kilobytes (repo de 0,0 GB).
- GPU recomendadas: no requiere GPU; puede ejecutarse en CPU sin problema.
- Cabe en cualquier GPU consumer e incluso en dispositivos de bajas prestaciones (Raspberry Pi, móvil) mediante ONNX Runtime.
- Opciones de despliegue: ONNX Runtime (Python, C++, JavaScript, etc.), integración en aplicaciones web o de escritorio.
- Latencia y throughput: no disponibles en la información proporcionada; por la naturaleza del modelo (3 features, regresión logística) se espera latencia de microsegundos en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

No disponible. No se han proporcionado alternativas comparables en la información. Como referencia conceptual, cualquier clasificador tabular binario (regresión logística, gradient boosting, random forest) sobre las mismas tres features sería funcionalmente equivalente, pero no se dispone de datos de comparación publicados.

## Limitaciones y advertencias

- Sesgo de muestra: los datos provienen de solo 4 jugadores, por lo que el modelo aprende sus hábitos y no representa al conjunto general de jugadores.
- Volumen de datos muy reducido (132 filas): las métricas son inestables y pueden cambiar notablemente con un nuevo jugador.
- El modelo solo es significativo para las tres decisiones de este juego concreto; no es transferible a otros escenarios.
- Aprendizaje dominado por una sola señal: esencialmente captura que "la decisión 2 es más arriesgada que las demás", por lo que la tarjeta de Selin aparece mayoritariamente en la decisión 2 y la personalización según el comportamiento del jugador es limitada.
- Riesgo de sobreajuste metodológico: al ser la tercera iteración y haberse simplificado las features tras ver resultados previos, el AUC medido puede ser algo optimista.
- Uso prohibido explícito por el autor: evaluar, calificar o clasificar a personas reales (estudiantes, empleados, candidatos) y tomar decisiones en hospitales o sistemas sanitarios reales; el escenario y todos los registros son ficticios.
- Licencia no disponible: no se puede confirmar el permiso para uso comercial.
- No es un modelo de lenguaje: no genera texto, no razona y no debe evaluarse con benchmarks de LLM.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Hakangrsy/se-primer-yanlis-karar-riski
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la información proporcionada.
