# Emirhnnd/primer-tutor-zamanlama

## Resumen

`primer-tutor-zamanlama` es un modelo de clasificación tabular desarrollado por Emirhnnd en el contexto de la asignatura YZM301, vinculado al juego educativo "SE Primer: LabLink Krizi". Su objetivo era predecir la probabilidad de que un jugador, tras no tomar una decisión en una pantalla de decisión durante 8 segundos, acabara seleccionando la opción arriesgada (B). Si esa probabilidad era alta, el tutor del juego plantearía automáticamente una pregunta reflexiva. Se trata, por tanto, de un artefacto académico orientado a la investigación sobre tutoría adaptativa, no de un modelo de propósito general.

El modelo no llegó a publicarse: el repositorio de Hugging Face no contiene el archivo `model.onnx`. Según la model card, el sistema no superó el umbral de aceptación definido antes del entrenamiento (spec.md §11.2), por lo que el autor decidió no distribuir los pesos y dejar la tarjeta como registro del resultado y de las razones del descarte.

La relevancia de esta ficha es, por tanto, metodológica: documenta un caso de validación fallida con criterios preregistrados, un conjunto de datos real muy reducido (31 filas de 3 participantes) y un pipeline clásico de scikit-learn (`StandardScaler` + `LogisticRegression`) que se pensaba exportar a ONNX. No hay arquitectura de red neuronal, ni parámetros entrenables en el sentido habitual, ni capacidades generativas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline scikit-learn: `StandardScaler` + `LogisticRegression` (scikit-learn 1.9.1) |
| Parametros totales | no disponible (modelo lineal; el número de coeficientes es 8, uno por característica) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada tabular de 8 características, sin secuencia) |
| Tipos de cuantizacion | no disponible (no se publicaron pesos; se preveía exportación a ONNX con skl2onnx 1.20.0) |
| Idiomas soportados | no disponible (modelo tabular, sin procesamiento de lenguaje) |
| Licencia | MIT |
| Formato de pesos | no disponible (el autor indica que `model.onnx` no está en el repositorio) |

## Arquitectura y entrenamiento

El modelo es un clasificador binario lineal sobre 8 características tabulares: nivel del jugador, número de decisión, latencia de la primera interacción, uso de pistas, número de mensajes del tutor, número de abandonos de pestaña, tiempo de lectura del panel previo y número de decisiones arriesgadas anteriores. El pipeline aplica estandarización (`StandardScaler`) seguida de regresión logística, con semilla 13. La exportación a ONNX mediante skl2onnx 1.20.0 estaba prevista pero no se materializó al no superarse el umbral de aceptación.

Los datos de entrenamiento combinan 31 filas reales de 3 participantes (G1, G2, G3) con 250 filas sintéticas ponderadas a 0,3 que no entran en la evaluación. Se eliminaron filas con inconsistencias entre el tiempo de decisión y la bandera `erken_karar`, así como duplicados con identificadores de sesión distintos. No se registraron datos personales (nombres, identificadores, ubicación ni texto escrito al tutor). La evaluación se realizó con validación cruzada agrupada por participante, restringida a las filas reales.

## Capacidades

- Clasificación binaria tabular: estima la probabilidad de que un jugador elija la opción arriesgada tras 8 segundos sin decisión.
- Entrada estructurada de 8 características numéricas y categóricas codificadas.
- No soporta generación de texto, razonamiento, código, matemáticas ni visión.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües: no procesa lenguaje natural.
- No dispone de modo thinking, audio ni ninguna capacidad multimodal.
- El modelo no está publicado: no es ejecutable tal cual desde el repositorio.

## Casos de uso

- Registro metodológico de validación fallida: el repositorio sirve como ejemplo documentado de preregistro de umbrales y de decisión de no publicar un modelo que no los alcanza, útil en docencia de evaluación de modelos.
- Diseño de tutores adaptativos en entornos educativos: el planteamiento (detectar riesgo de decisión impulsiva y lanzar una pregunta reflexiva) es reutilizable como especificación para futuros sistemas, aunque este modelo concreto no lo implemente de forma fiable.
- Replicación académica: el código en GitHub (`train.py`, `data/`, `tests/`, `RELEASE.md`) permite reproducir el pipeline y el análisis con nuevos datos.
- Ampliación del conjunto de datos: el diseño de 8 características y la lógica de filtrado pueden servir de base para recolectar más participantes y reentrenar.
- Análisis de señales de comportamiento en interfaces educativas: las variables (latencia, abandono de pestaña, uso de pistas) son un punto de partida para estudiar qué señales predicen decisiones arriesgadas.
- Evaluación de la calidad de datos sintéticos: el uso de 250 filas sintéticas con peso 0,3 y exclusión de la evaluación documenta una práctica concreta que puede compararse con alternativas.
- No es adecuado para uso en producción con usuarios reales, tal como advierte el propio autor.

## Benchmarks y rendimiento

Los únicos resultados publicados son los de la evaluación interna con validación cruzada agrupada por participante, sobre 31 filas reales:

| Metrica | Resultado | Umbral exigido | Cumple |
|---|---|---|---|
| Exactitud (accuracy) | 0,419 (IC 95 %: 0,264–0,592) | 0,710 (clase mayoritaria) + 0,10 = 0,810 | No |
| Sensibilidad a la decisión arriesgada | 0,556 (5 de 9 filas arriesgadas) | ≥ 0,60 | No |

No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) porque el modelo no es de lenguaje ni de propósito general.

## Requisitos de hardware

- VRAM estimada para inferencia: despreciable; un modelo lineal con 8 coeficientes ocupa kilobytes.
- GPU recomendadas: ninguna; la inferencia puede ejecutarse en CPU.
- Cabe en cualquier GPU consumer y en CPU de gama baja, si bien los pesos no están publicados.
- Opciones de despliegue: scikit-learn en Python, o ONNX Runtime si se regenerara el archivo `model.onnx` con skl2onnx 1.20.0.
- Latencia y throughput: no disponibles; al no publicarse pesos no hay mediciones. Por la naturaleza del modelo, la latencia sería del orden de microsegundos en CPU.
- No aplica vLLM, llama.cpp, Ollama ni TGI: son herramientas para modelos de lenguaje.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de clasificación tabular para tutoría adaptativa en juegos educativos. Como referencia conceptual, cualquier clasificador lineal o de árboles (regresión logística, gradient boosting) sobre las mismas 8 características sería funcionalmente equivalente, pero no se dispone de resultados publicados de alternativas sobre este conjunto de datos.

## Limitaciones y advertencias

- El modelo no está publicado: el repositorio no contiene `model.onnx` ni pesos utilizables.
- No superó los umbrales preregistrados de exactitud (0,419 frente a 0,810) ni de sensibilidad (0,556 frente a 0,60).
- El conjunto de datos real es muy pequeño (31 filas, 3 participantes), lo que impide extraer conclusiones sobre la utilidad de las señales de comportamiento.
- Los resultados no demuestran que las señales no funcionen; solo indican que con estos datos no se observó beneficio.
- Las 250 filas sintéticas se basan en una regla asumida y no entran en la evaluación, por lo que no validan el modelo.
- Riesgo de alucinación: no aplica en el sentido de modelos generativos, pero sí existe riesgo de sobreinterpretar los resultados como evidencia de comportamiento real.
- Sesgos conocidos: no documentados; con 3 participantes, cualquier sesgo de muestra sería grave y no medible.
- Licencia MIT: permite uso comercial y modificación, pero al no haber pesos publicados la aplicabilidad práctica es nula.
- No debe usarse para decisiones reales sobre usuarios, tal como indica el autor.
- Sin soporte multilingüe ni de lenguaje natural: no procesa texto del tutor ni de los jugadores.

## Enlaces

- Hugging Face: https://huggingface.co/Emirhnnd/primer-tutor-zamanlama
- GitHub del proyecto: https://github.com/emirhnnd/yzm301-se-primer
- No se han encontrado papers, blogs, demos ni otros repositorios en la información proporcionada.
