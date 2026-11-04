# AtharvIITB/meow-decoder

## Resumen

Meow-decoder es un conjunto de cabezas de clasificación de audio, no un modelo generativo: dos regresiones logísticas multinomiales que reciben embeddings de audio y predicen la situación más probable de un maullido de gato entre tres clases (esperando comida, disfrutando de atención o estresado en un lugar nuevo). Lo desarrolla AtharvIITB (IIT Bombay) y se publica como complemento del repositorio de código `meow-decoder`, que descarga automáticamente los ficheros de pesos. Su relevancia es acotada: es una herramienta de bioacústica aplicada y un ejemplo de reutilización de codificadores de audio preentrenados (BEATs de Earth Species Project y AST de MIT) para una tarea de clasificación muy concreta.

Técnicamente no hay un transformer entrenado desde cero ni un modelo de lenguaje: los ficheros `beats.npz` y `ast.npz` contienen arrays NumPy con los parámetros de una regresión logística (estandarización más clasificador), ajustada sobre 440 embeddings de maullidos del dataset CatMeows. El interés práctico está en la validación metodológica: la evaluación se hace con validación cruzada de 5 pliegues agrupada por gato, de modo que ningún maullido de test proviene de un gato visto en entrenamiento, y se compara contra la línea base de predecir siempre la clase mayoritaria (50,2 %).

El contexto de uso es, por tanto, la investigación en comunicación animal y las aplicaciones de demostración, no el despliegue en producción de sistemas conversacionales. La licencia es mixta y depende del codificador subyacente: CC BY-NC-SA 4.0 para la cabeza BEATs (no comercial) y CC BY 4.0 para la cabeza AST.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresión logística multinomial sobre embeddings de audio (BEATs o AST) |
| Parametros totales | No disponible (regresión logística de 3 clases sobre embeddings; el número exacto de coeficientes no se publica) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (audio de 8 kHz; el tamaño de ventana de los codificadores no se detalla) |
| Tipos de cuantizacion | No aplica (pesos en arrays NumPy float, sin versiones GGUF/INT8 publicadas) |
| Idiomas soportados | No aplica (clasificación de audio no lingüística) |
| Licencia | Mixta: `beats.npz` CC BY-NC-SA 4.0; `ast.npz` CC BY 4.0 |
| Formato de pesos | NumPy `.npz` (arrays `classes`, `mean`, `scale`, `coef`, `intercept`, `X`, `y`) |

## Arquitectura y entrenamiento

La arquitectura es un pipeline de dos etapas. Primero, un codificador de audio preentrenado extrae un embedding del maullido: la cabeza `beats.npz` usa `esp_aves2_sl_beats_all` de Earth Species Project (BEATs entrenado sobre audio de aves) y la cabeza `ast.npz` usa un Audio Spectrogram Transformer (AST) de MIT afinado sobre AudioSet. Después, una regresión logística multinomial con estandarización previa (media y escala guardadas en el `.npz`) mapea ese embedding a una de tres clases. No hay fine-tuning del codificador ni entrenamiento de extremo a extremo.

Los datos de entrenamiento son los 440 maullidos de 21 gatos Maine Coon y European Shorthair del dataset CatMeows (Ludovico et al., 2020), con audio a 8 kHz, lo que implica que no hay información por encima de 4 kHz. Los ficheros conservan `X` e `y` (los 440 embeddings y sus etiquetas) para que la aplicación pueda reajustar el clasificador con maullidos del gato del usuario. La evaluación usa validación cruzada de 5 pliegues agrupada por gato (`splits.json` en el repositorio de código), y se reporta también el error de calibración.

## Capacidades

- Clasificación de maullidos en tres situaciones: esperando comida, disfrutando de atención y estrés en un entorno nuevo.
- Predicción con probabilidades calibradas (se reporta error de calibración de 2,2 % para BEATs y 4,7 % para AST).
- Salida de top-2 de clases, útil cuando la primera predicción es ambigua.
- Reajuste local: al conservar `X` e `y`, la aplicación puede reentrenar la cabeza con maullidos del propio gato.
- API de una línea vía paquete Python: `Decoder("beats").predict("meow.wav")["results"]`.
- No soporta tool calling, agentes, razonamiento multi-paso, generación de texto, código, matemáticas, visión ni audio en sentido generativo.

## Casos de uso

- Investigación en bioacústica: clasificar grabaciones de colonias felinas para estudiar la distribución de contextos vocales, aprovechando la validación agrupada por gato que evita la fuga de identidad del animal.
- Aplicación de demostración para propietarios: registrar maullidos desde el móvil y obtener la situación más probable, con la opción de reajustar la cabeza con las grabaciones del propio gato para mejorar la personalización.
- Etiquetado asistido de datasets: preanotar clips de audio con las tres clases para acelerar la revisión manual en proyectos de comunicación animal.
- Docencia y divulgación: ejemplo mínimo de transferencia de codificadores de audio (BEATs, AST) a una tarea de pocas clases y pocos datos, con comparación de dos encoders y métricas de calibración.
- Evaluación comparativa de encoders: usar las dos cabezas publicadas para medir qué codificador generaliza mejor en una tarea concreta de audio animal (65,9 % frente a 61,8 % en precisión top-1).
- Prototipado de sistemas de monitorización de bienestar animal: detectar señales de estrés en un entorno nuevo como indicador preliminar, siempre con supervisión humana y sin valor diagnóstico.

## Benchmarks y rendimiento

Datos publicados en la model card (validación cruzada de 5 pliegues agrupada por gato, es decir, gatos no vistos en entrenamiento):

| Metrica | beats.npz (BEATs ESP) | ast.npz (MIT AST) | Linea base (clase mayoritaria) |
|---|---|---|---|
| Precision top-1 | 65,9 % | 61,8 % | 50,2 % |
| Precision top-2 | 89,1 % | 84,1 % | No disponible |
| Error de calibracion | 2,2 % | 4,7 % | No disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni comparaciones con otros clasificadores de vocalizaciones felinas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el clasificador en sí es una regresión logística de 3 clases sobre embeddings, por lo que el coste dominante es el codificador de audio (BEATs o AST), no las cabezas.
- GPU recomendadas: no especificadas por el autor. Cualquier GPU consumer reciente debería bastar para inferencia de los codificadores, pero no hay cifras publicadas.
- ¿Cabe en GPU consumer? Sí, con alta probabilidad, dado el tamaño reducido de los codificadores y del clasificador; el autor no publica requisitos concretos.
- Opciones de despliegue: paquete Python `meow-decoder` (descarga automática de los `.npz`); no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| meow-decoder (`beats.npz`) | Regresión logística sobre embeddings BEATs | No disponible | No aplica | 65,9 % top-1, 89,1 % top-2 | CC BY-NC-SA 4.0 | HuggingFace + GitHub |
| meow-decoder (`ast.npz`) | Regresión logística sobre embeddings AST | No disponible | No aplica | 61,8 % top-1, 84,1 % top-2 | CC BY 4.0 | HuggingFace + GitHub |
| Clasificadores de vocalizaciones animales basados en BEATs/AST (genéricos) | Fine-tuning supervisado de codificadores | No disponible | No aplica | No disponible | Depende del codificador | No disponible |
| Modelos de audio generalistas (AST, BEATs) | Codificadores preentrenados | No disponible en la información proporcionada | No disponible | No disponible | Depende de la versión | HuggingFace / repositorios originales |

No se dispone de comparaciones publicadas con otros clasificadores específicos de maullidos en la información proporcionada.

## Limitaciones y advertencias

- Solo distingue tres situaciones; no detecta dolor ni enfermedad, y el autor lo advierte explícitamente.
- Entrenado con gatos domésticos de un único dataset (21 gatos Maine Coon y European Shorthair); otras razas o gatos callejeros pueden sonar distinto y degradar la precisión.
- Audio a 8 kHz: se pierde toda la información por encima de 4 kHz, lo que limita la señal acústica disponible.
- La licencia es mixta y restrictiva en parte: `beats.npz` hereda CC BY-NC-SA 4.0, por lo que no permite uso comercial; `ast.npz` es CC BY 4.0. Hay que verificar la licencia del codificador subyacente antes de cualquier despliegue.
- Riesgo de sobreajuste al gato y al entorno de grabación: la validación agrupada por gato mitiga parte del problema, pero no hay evaluación con datos externos al dataset CatMeows.
- No es un modelo generativo ni conversacional: no admite instrucciones en lenguaje natural, tool calling ni razonamiento; cualquier expectativa de ese tipo es un error de uso.
- Los pesos se distribuyen como arrays NumPy sin pickle, lo que es una buena práctica de seguridad, pero no hay versionado semántico ni garantías de compatibilidad futura del paquete.
- Sin métricas de latencia, throughput ni requisitos de hardware publicados, lo que dificulta planificar un despliegue en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AtharvIITB/meow-decoder
- Repositorio de código: https://github.com/ATHARV-IIT-BOMBAY/meow-decoder
- Dataset CatMeows (Ludovico et al., 2020): https://zenodo.org/records/4008297
- Codificador BEATs de Earth Species Project: no disponible en la información proporcionada
- Codificador Audio Spectrogram Transformer (MIT): no disponible en la información proporcionada
