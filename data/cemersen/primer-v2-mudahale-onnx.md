# CemErsen/primer-v2-mudahale-onnx

## Resumen

Primer v2 — Oyuncu Müdahale Tahmincisi es un modelo de clasificación tabular muy ligero publicado por el usuario CemErsen en Hugging Face. No es un modelo de lenguaje ni una red neuronal profunda: se trata de un `Pipeline` de scikit-learn compuesto por `StandardScaler` seguido de `LogisticRegression`, exportado a formato ONNX para su ejecución en navegador mediante `onnxruntime-web`. Su propósito es predecir si un jugador del juego "The Primer" requiere intervención en la escena actual, devolviendo una de tres clases: 0 (sin intervención), 1 (dar pista) o 2 (profundizar).

El modelo trabaja sobre siete características tabulares predefinidas (tiempo de decisión en segundos, número de cambios, ratio de errores previos, velocidad de selección de rama en milisegundos, errores consecutivos, nivel e indicador de pista previa). Con esas entradas produce una distribución de probabilidad sobre las tres clases. Está etiquetado como `game-ai` y `educational`, lo que sitúa su ámbito de aplicación en la enseñanza y la experimentación con IA aplicada a videojuegos, no en producción general.

Su relevancia es limitada y muy específica: sirve como ejemplo didáctico de pipeline clásico de machine learning exportado a ONNX y desplegado en el cliente (navegador) sin backend. El conjunto de entrenamiento es de solo 50 filas, de las cuales 35 son sintéticas, y el propio autor advierte que no debe usarse para decisiones de producción a gran escala. No hay información sobre licencia, idiomas ni parámetros en el sentido habitual de modelos neuronales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline scikit-learn: StandardScaler → LogisticRegression (regresión logística multinomial) |
| Parametros totales | no disponible (modelo lineal; coeficientes no publicados en la información) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada tabular de 7 características) |
| Tipos de cuantizacion | no disponible (exportación ONNX; sin cuantizaciones documentadas) |
| Idiomas soportados | no disponible (etiquetas de clase en turco; el modelo no procesa texto) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`model.onnx`), con `config.json` asociado; pipeline original en joblib/scikit-learn |

## Arquitectura y entrenamiento

La arquitectura es un clasificador lineal clásico: estandarización de las siete características de entrada seguida de una regresión logística multinomial con semilla fija (seed=42). No hay capas ocultas, atención, mecanismos recurrentes ni componentes de mezcla de expertos. El modelo se entrenó con Python 3.13 y scikit-learn 1.9.1, y posteriormente se exportó a ONNX para permitir inferencia en el navegador con `onnxruntime-web`.

El conjunto de datos consta de 50 filas, de las cuales 35 son sintéticas y solo 15 provienen de datos reales, según reconoce el autor. La partición de evaluación es un hold-out estratificado del 30 %. No se documentan procesos de aumento de datos, regularización específica, validación cruzada ni ajuste de hiperparámetros más allá de la semilla. La innovación técnica destacable es únicamente la exportación a ONNX y su consumo cliente-side en el navegador, no el algoritmo en sí.

## Capacidades

- Clasificación tabular en tres clases (0 = sin intervención, 1 = dar pista, 2 = profundizar) a partir de siete características numéricas.
- Inferencia en navegador mediante `onnxruntime-web`, sin necesidad de backend.
- Ejecución local con `onnxruntime` en Python (véase el ejemplo de la model card).
- Salida de probabilidades por clase, lo que permite umbrales personalizados.
- Integración sencilla en pipelines de scikit-learn (joblib) y en aplicaciones web estáticas.
- No soporta generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling ni agentes.
- No tiene capacidades multilingües: no procesa lenguaje natural.
- No dispone de modo "thinking" ni de razonamiento multi-paso.

## Casos de uso

- Prototipo educativo de IA en videojuegos: usar el modelo como ejemplo en un taller o asignatura para mostrar cómo un pipeline clásico de scikit-learn se exporta a ONNX y se ejecuta en el navegador, ilustrando el ciclo completo de entrenamiento, exportación y despliegue cliente-side.
- Ajuste dinámico de dificultad en "The Primer": el motor del juego puede consultar la predicción para decidir si muestra una pista o profundiza la escena, usando las siete características de telemetría del jugador como entrada.
- Telemetría y análisis de sesiones: registrar las probabilidades por clase junto con las características de entrada para analizar patrones de frustración o de fluidez en los jugadores durante pruebas de juego.
- Sistema de ayuda contextual en demos jugables: integrar el modelo en una build web del juego para que, sin backend, ofrezca sugerencias en tiempo real basadas en el comportamiento reciente del jugador.
- Base para un clasificador de intervención más robusto: emplear este modelo como línea base y sustituir el conjunto sintético por datos reales de partidas, manteniendo la interfaz ONNX y el contrato de siete características.
- Ejemplo de despliegue ONNX en producción ligera: servir el modelo desde un CDN y ejecutarlo en el cliente para evitar costes de inferencia en servidor en un contexto de juego casual.
- Material de referencia para documentación de modelos: la model card sigue las recomendaciones de Mitchell et al. (2019) y Breck et al. (2017), por lo que puede usarse como plantilla de reporte en cursos de MLOps.

## Benchmarks y rendimiento

Métricas reportadas por el autor sobre el hold-out estratificado del 30 %:

| Metrica | Valor | Umbral de aceptacion del autor |
|---|---|---|
| Accuracy | 0.9333 | ≥ 0.7 |
| AUC (OvR) | 1.0 | ≥ 0.72 |

No se han publicado comparaciones con otros modelos en la información disponible. El AUC de 1.0 debe interpretarse con cautela: con un conjunto de 50 filas y solo 15 reales, la partición de test contiene aproximadamente 15 muestras, lo que hace que estas métricas tengan una varianza muy alta y escaso poder estadístico.

## Requisitos de hardware

- VRAM estimada para inferencia: prácticamente nula; el modelo es un clasificador lineal de siete entradas y tres salidas, con un tamaño de repositorio de 0.0 GB.
- GPU recomendadas: no requiere GPU; funciona en CPU.
- Cabe en cualquier GPU consumer e incluso en dispositivos móviles y navegadores.
- Opciones de despliegue: `onnxruntime` (Python), `onnxruntime-web` (navegador), scikit-learn con joblib para el pipeline original.
- Latencia y throughput: no disponibles en la información proporcionada; por la naturaleza del modelo, la latencia esperada es de microsegundos a pocos milisegundos en CPU, pero no se aportan mediciones.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (clasificadores tabulares ligeros para IA de juego) con los que establecer una comparación de parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Ámbito restringido: diseñado exclusivamente para el juego "The Primer"; el autor indica explícitamente que no debe usarse en otros contextos.
- Dataset muy pequeño: 50 filas en total, de las cuales 35 son sintéticas; el propio autor recomienda aumentar la proporción de datos reales.
- Métricas poco fiables: el AUC de 1.0 y el accuracy de 0.9333 proceden de una partición de test de unas 15 muestras, por lo que no son indicativas de rendimiento en producción.
- Riesgo de sobreajuste y de alucinación en el sentido de predicciones confiadas fuera de distribución; no hay validación externa documentada.
- Licencia no disponible: no se puede confirmar el uso comercial; debe contactarse con el autor antes de cualquier despliegue comercial.
- Idiomas no disponibles: las etiquetas de clase están en turco y el modelo no procesa texto, por lo que no aplica soporte multilingüe.
- Carácter consultivo: la salida es una recomendación; la decisión final corresponde al diseñador del juego.
- Sin mantenimiento documentado ni versionado más allá de la fecha de creación (2026-11-04) y actualización (2026-11-04).

## Enlaces

- Hugging Face: https://huggingface.co/CemErsen/primer-v2-mudahale-onnx
- Mitchell et al. (2019), Model Cards for Model Reporting: referencia citada en la model card, sin URL proporcionada en la información disponible.
- Breck et al. (2017), The ML Test Score: referencia citada en la model card, sin URL proporcionada en la información disponible.
- Shankar et al. (2022), Operationalizing ML — 3V: referencia citada en la model card, sin URL proporcionada en la información disponible.
