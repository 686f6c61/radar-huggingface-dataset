# Raptor13/se-primer-hint-model

## Resumen

El modelo `Raptor13/se-primer-hint-model` es un clasificador binario de machine learning clásico, no un modelo de lenguaje. Desarrollado por el usuario Raptor13 en el contexto del proyecto académico SE Primer v2 (asignatura YZM301, Ingeniería de Software y Pruebas), su función es predecir si un estudiante que juega una simulación de gestión de crisis necesita una pista técnica en el paso actual. La salida es una probabilidad `P(ipucu_gerekti = 1)` y, cuando supera el umbral de 0,60, se activa una insignia de guía adaptativa en la interfaz y se ajusta el tono pedagógico de un tutor socrático basado en IA.

Técnicamente se trata de una regresión logística (L2, `solver='lbfgs'`, `C=1.0`, `max_iter=1000`) de Scikit-Learn convertida a ONNX con `skl2onnx`, con seis características de entrada de telemetría de juego. El repositorio ocupa 0,0 GB y no contiene pesos de red neuronal ni tokenizador; el artefacto principal es un grafo ONNX diseñado para inferencia local en el navegador mediante `onnxruntime-web`. No es un transformer, no genera texto y no tiene ventana de contexto en el sentido habitual de los LLM.

Su relevancia es acotada y de carácter didáctico: ejemplifica un patrón de "modelo predictivo ligero embebido en el cliente" con privacidad por diseño, entrenado exclusivamente con 300 muestras sintéticas y sin datos reales de estudiantes. Resulta útil como referencia de integración ONNX en el navegador y de separación entre un clasificador auxiliar y un sistema de tutoría conversacional, pero no como componente de propósito general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Regresión logística (L2 Ridge, `solver='lbfgs'`, `C=1.0`, `max_iter=1000`) exportada a ONNX |
| Parámetros totales | 6 coeficientes + 1 término de sesgo (7 parámetros aprendidos); no disponible el recuento exacto en el grafo ONNX |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada fija de 6 características numéricas) |
| Tipos de cuantización | no disponible (no se documenta cuantización; el modelo es de precisión nativa float) |
| Idiomas soportados | no aplica (no procesa texto); la documentación está en turco |
| Licencia | no disponible |
| Formato de pesos | ONNX (`model.onnx`), salida de tensor `[None, 2]` con `zipmap=False` |

## Arquitectura y entrenamiento

El modelo es un clasificador lineal binario con seis características de entrada en orden fijo: `seviye` (nivel del jugador, entero 0-2), `karar_suresi_sn` (tiempo de decisión en segundos, 0,1-60,0), `onceki_yanlis_sayisi` (número de errores previos, 0-2), `ipucu_sayisi` (interacciones acumuladas con pistas o tutor), `sahne_no` (número de escena, 1-3) y `karar_degistirme_sayisi` (número de cambios de decisión o clics de duda). Sobre estas variables se ajusta una regresión logística con penalización Ridge, y el pipeline completo se exporta a ONNX con `skl2onnx` usando `options={id(clf): {'zipmap': False}}` para obtener probabilidades crudas en lugar de un mapa.

El entrenamiento se realizó sobre un conjunto 100 % sintético de 300 filas generadas con reglas pedagógicas a partir de 100 sesiones de crisis ficticias (3 escenas cada una), con un reparto estratificado de 225 ejemplos para entrenamiento y 75 para test y semilla fija `random_state=42` en todas las etapas. La distribución de clases es desbalanceada: 78 ejemplos (26,00 %) de clase 0 y 222 (74,00 %) de clase 1. No se documenta uso de RLHF, DPO ni ningún proceso de ajuste por preferencias; tampoco se describe validación cruzada ni búsqueda de hiperparámetros más allá de los valores fijados. La innovación técnica destacable no está en el algoritmo, sino en el modo de despliegue: inferencia local en el navegador con `onnxruntime-web`, sin envío de telemetría a servidores externos.

## Capacidades

- Clasificación binaria de necesidad de pista a partir de telemetría de juego, con salida de probabilidad calibrada para un umbral operativo de 0,60.
- Procesamiento de seis señales numéricas de comportamiento: nivel, latencia de decisión, errores acumulados, pistas previas, escena y cambios de decisión.
- Inferencia en el cliente (on-device) en formato ONNX, compatible con `onnxruntime-web` en navegador.
- Integración como señal auxiliar en un sistema mayor: activa una insignia de guía adaptativa y modula el tono del tutor socrático sin alterar las transiciones de estado de la máquina de estados finitos (FSM).
- Verificación de equivalencia numérica frente al modelo original de Scikit-Learn mediante comprobación tipo oracle.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, generación de texto, visión, audio ni capacidades multilingües.

## Casos de uso

- Guía adaptativa en simuladores educativos: el clasificador recibe la telemetría del estudiante en cada paso y, si la probabilidad supera 0,60, muestra una insignia de ayuda sin interrumpir el flujo de la FSM. Es adecuado por su latencia mínima y su ejecución local.
- Ajuste dinámico del tutor socrático: la probabilidad estimada se usa como señal para que el tutor conversacional adopte un tono más directivo o más orientativo, sin que el clasificador genere texto por sí mismo.
- Detección temprana de bloqueo cognitivo: valores altos de `karar_suresi_sn` combinados con `karar_degistirme_sayisi` y `onceki_yanlis_sayisi` permiten identificar patrones de duda antes de que el estudiante abandone la tarea.
- Despliegue con privacidad por diseño en entornos educativos regulados: al ejecutarse en el navegador con `onnxruntime-web`, los tiempos de decisión y los clics no salen del dispositivo, lo que facilita el cumplimiento de normativas de protección de datos.
- Prototipado rápido de lógica pedagógica en asignaturas de ingeniería del software: sirve como ejemplo reproducible de pipeline Scikit-Learn → ONNX → navegador con semilla fija y métricas documentadas.
- Investigación sobre modelos ligeros en entornos con recursos limitados: al tener siete parámetros, puede ejecutarse en cualquier dispositivo con un runtime ONNX, incluidos móviles y equipos sin GPU.
- Evaluación de la calidad de datos sintéticos: el contraste entre el 98,67 % de accuracy en test y la ausencia total de datos reales permite estudiar la brecha entre distribución sintética y comportamiento humano real.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el conjunto de test (N = 75) con umbral τ = 0,60:

| Métrica | Valor | Criterio de aceptación | Resultado |
|---|---|---|---|
| Accuracy | 0,9867 (98,67 %) | no especificado | — |
| Precision (clase 1) | 1,0000 (100,00 %) | no especificado | — |
| Recall (clase 1) | 0,9818 (98,18 %) | no especificado | — |
| F1-score (clase 1) | 0,9908 | ≥ 0,70 | superado |
| Macro F1-score | 0,9832 | ≥ 0,70 | superado |

Verificación de equivalencia ONNX frente a Scikit-Learn: diferencia absoluta máxima de probabilidad de 9,7845 × 10⁻⁸, con tolerancia admitida inferior a 1,0 × 10⁻⁴ (resultado: superado, aproximadamente 1000 veces por debajo del límite).

No se han publicado comparaciones con otros modelos en la información disponible. Las métricas proceden de un único split estratificado sobre datos sintéticos y no de validación cruzada, por lo que su estabilidad no está documentada.

## Requisitos de hardware

- VRAM estimada para inferencia: prácticamente nula; el grafo ONNX de una regresión logística de seis entradas ocupa del orden de kilobytes, aunque el tamaño exacto del archivo no se detalla en la información disponible.
- GPU recomendadas: no se requiere GPU; la inferencia puede ejecutarse en CPU, en el navegador o en dispositivos móviles.
- Compatibilidad con GPU de consumo: sí, en cualquier GPU, aunque no es necesario su uso.
- Opciones de despliegue: `onnxruntime-web` en navegador (modo documentado por el autor), `onnxruntime` en Python, y cualquier runtime compatible con ONNX (por ejemplo, ONNX Runtime para C++, Java o C#). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles de forma explícita; por la naturaleza del modelo (una multiplicación de matriz de 1×6 por 6×2 más una softmax), la latencia esperada es del orden de microsegundos a pocos milisegundos en CPU y despreciable en el navegador.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Como referencia conceptual, este clasificador se sitúa en la categoría de modelos tabulares lineales para señalización en sistemas interactivos, no en la de modelos de lenguaje. Cualquier comparación con LLM (por tamaño, contexto o benchmarks) no sería metodológicamente válida.

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Raptor13/se-primer-hint-model` | Regresión logística ONNX | 7 | no aplica | no disponible | HuggingFace |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Dependencia de distribución sintética: el modelo se entrenó exclusivamente con 300 filas generadas por reglas pedagógicas; los retrasos cognitivos humanos reales y las pausas de red imprevistas pueden desviar las predicciones.
- Muestra pequeña (N = 300): el autor justifica el uso de un modelo lineal L2 precisamente para evitar sobreajuste con tan pocos datos; no se documenta validación cruzada.
- Cobertura específica de escenario: está calibrado solo para el escenario "caída del sistema de citas hospitalarias MHC-PMS" con tres escenas; no es trasladable directamente a otros contextos de evaluación de ingeniería del software.
- Desbalanceo de clases: el 74 % de los ejemplos pertenecen a la clase 1, lo que puede inflar métricas como accuracy y precision en clase 1; el recall de la clase 0 no se reporta.
- Uso prohibido para calificación académica: el autor indica explícitamente que no debe emplearse para medir notas, éxito o competencia del estudiante, solo para activar o desactivar la ayuda pedagógica en la interfaz.
- Uso prohibido en decisiones críticas: no debe emplearse para decidir rollbacks o parches en sistemas hospitalarios, bancarios o de infraestructura en producción.
- No sustituye al tutor socrático: el modelo no genera respuestas; solo clasifica la necesidad de intervención del tutor.
- Licencia no especificada: al no declararse licencia, no se garantiza el uso comercial ni la redistribución; debe contactarse con el autor antes de cualquier uso fuera del ámbito académico.
- Riesgo de alucinación: no aplica en el sentido de los LLM, pero existe riesgo de falsos positivos y negativos en la clasificación; la precision reportada del 100 % en clase 1 sobre un test de 75 ejemplos no es extrapolable a poblaciones reales.
- Idiomas: el modelo no procesa texto, por lo que el soporte multilingüe no aplica; la documentación y las variables están en turco, lo que puede dificultar su reutilización por equipos hispanohablantes.
- Sesgos conocidos: no se documentan análisis de equidad por subgrupos (nivel, género, origen), lo que impide descartar sesgos sistemáticos en la señalización de ayuda.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Raptor13/se-primer-hint-model
- No se han encontrado en la información proporcionada enlaces adicionales a papers, blogs, repositorios de código o demos.
