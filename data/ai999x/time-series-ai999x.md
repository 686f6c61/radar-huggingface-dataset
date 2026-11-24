# AI999X/time-series-ai999x

## Resumen

`time-series-ai999x` es un motor determinista de cálculo y resolución de problemas de series temporales desarrollado por AI999X. A pesar de estar alojado en Hugging Face con la etiqueta `pipeline_tag: question-answering` y un recuento de parámetros en safetensors de 4.715.520, no se trata de un modelo de lenguaje neuronal: la model card lo describe como un motor compilado que cubre 78 cálculos repartidos en 14 temas de análisis de series temporales (medias móviles, suavizado exponencial, autocorrelación, fundamentos de ARIMA, contrastes de estacionariedad, puntos de cambio, precisión de pronóstico y filtrado de Kalman).

Cada cálculo se presenta con su fórmula, sus pasos intermedios y sus unidades, y cuando una entrada falta o está fuera de rango el motor devuelve una explicación en lenguaje natural en lugar de un número. El objetivo declarado es eliminar la alucinación en la resolución paso a paso de ejercicios de series temporales, ejecutándose íntegramente en local y sin conexión.

Se distribuye en cuatro formatos sobre un mismo motor compilado: aplicación de escritorio (Windows y Linux), interfaz de línea de comandos `time-series`, versión web en el navegador y paquete de Python (`pip install time-series-ai999x`). La relevancia actual reside en su enfoque de "cero alucinación" para docencia y validación reproducible de cálculos estadísticos, un nicho donde los LLM generativos fallan con frecuencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Motor de cálculo determinista compilado (no es un transformer neuronal); el autor lo etiqueta como `time-series-solver` |
| Parametros totales | 4.715.520 (según safetensors del repositorio) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (no es un modelo de contexto conversacional) |
| Tipos de cuantizacion | No disponible (no aplica; el motor se distribuye compilado o como build Python puro) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors en el repositorio; distribución principal como binarios compilados (ZIP, tar.gz) y paquete Python |
| Biblioteca | `time-series-ai999x` |
| Pipeline declarado | `question-answering` |
| Inferencia | `inference: false` (no ejecutable en la infraestructura de Hugging Face) |
| Plataformas | Windows y Linux x86-64 (motor compilado); macOS y ARM mediante build Python puro |
| Cobertura funcional | 78 cálculos en 14 temas |

## Arquitectura y entrenamiento

No se trata de una red neuronal entrenada con descenso de gradiente. La model card describe "un motor compilado" que implementa fórmulas estadísticas de series temporales de forma determinista. Los temas cubiertos incluyen media móvil simple, método de tendencia lineal de Holt, suavizado exponencial, autocorrelación, fundamentos de ARIMA, pronóstico AR(1), contraste de Ljung-Box, contraste de Dickey-Fuller, contraste KPSS, detección de punto de cambio en la media por mínimos cuadrados, filtro de Kalman para modelo de nivel local (paseo aleatorio), MAPE y otras métricas de precisión de pronóstico.

No se publican datos sobre volumen de entrenamiento, composición del dataset, RLHF, DPO ni innovaciones de decodificación, porque el paradigma no es el de un LLM. La "innovación" declarada es la reproducibilidad: el autor afirma que las respuestas son idénticas en Windows y Linux con Python 3.10 a 3.14, y que ante entradas inválidas el motor devuelve una razón en lenguaje natural en lugar de un valor inventado. El paquete en macOS y ARM recurre a una implementación en Python puro que, según el autor, produce las mismas respuestas que el motor compilado.

## Capacidades

- Resolución paso a paso de 78 cálculos de series temporales en 14 temas, con fórmula, pasos intermedios y unidades.
- Medias móviles y suavizado exponencial (incluido Holt lineal y Holt-Winters).
- Autocorrelación y fundamentos de ARIMA, incluido pronóstico AR(1) hacia la media y propiedades de un proceso AR(1) (media, varianza, autocorrelación).
- Contrastes de estacionariedad: Dickey-Fuller y KPSS.
- Contraste de Ljung-Box para autocorrelación residual.
- Detección de punto de cambio único en la media por mínimos cuadrados.
- Filtrado de Kalman para modelo de nivel local (paseo aleatorio).
- Métricas de precisión de pronóstico, como MAPE.
- Modo de respuesta explicativa: devuelve una razón textual cuando una entrada falta o está fuera de rango, en lugar de un número.
- Ejecución offline y determinista, sin dependencia de servicios externos.
- Cuatro interfaces: aplicación de escritorio, CLI, navegador y API de Python.
- No soporta tool calling genérico, agentes autónomos, visión, audio ni razonamiento multilingüe más allá del inglés.

## Casos de uso

- Docencia de estadística de series temporales: el motor resuelve cada ejercicio mostrando fórmula, pasos y unidades, lo que permite al estudiante seguir el procedimiento completo en lugar de recibir solo el resultado final.
- Corrección automática de ejercicios: al ser determinista y devolver explicaciones ante entradas inválidas, un profesor puede integrarlo en un pipeline de evaluación que distinga entre respuesta incorrecta y entrada mal formada.
- Validación de cálculos en pipelines de datos: sirve como referencia independiente para contrastar implementaciones propias de ARIMA, Holt-Winters o el contraste de Ljung-Box antes de desplegarlas en producción.
- Análisis exploratorio reproducible: la CLI `time-series` permite ejecutar contrastes de estacionariedad (Dickey-Fuller, KPSS) y detección de puntos de cambio sobre series cargadas localmente, sin enviar datos a la nube.
- Entornos sin conectividad o con requisitos de privacidad: al ejecutarse offline en Windows y Linux, encaja en aulas, laboratorios o sistemas air-gapped donde no se permite el acceso a APIs externas.
- Integración en notebooks y scripts de Python: `pip install time-series-ai999x` expone el motor como biblioteca para calcular MAPE, autocorrelaciones o filtrado de Kalman dentro de un flujo de análisis existente.
- Material de autoaprendizaje: la versión web en el navegador permite practicar los 78 cálculos sin instalar nada, con escenas y gráficos generados a partir del resultado computado.

## Benchmarks y rendimiento

El autor declara un único resultado en el `model-index`, sin verificación independiente (`verified: false`).

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| Question answering (series temporales) | Golden answers (413 preguntas documentadas, Windows + Linux, Python 3.10-3.14) | Accuracy ("identical on every platform") | 1,0 |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni benchmarks de pronóstico estándar (M3, M4, M5), lo que es coherente con la naturaleza no neuronal del motor. Tampoco se publican latencias ni throughput.

## Requisitos de hardware

- VRAM estimada: no aplica; no requiere GPU. El motor compilado y la build Python puro se ejecutan en CPU.
- GPU recomendadas: ninguna; no se beneficia de aceleración por GPU según la información disponible.
- Compatibilidad con GPU de consumo: irrelevante, el despliegue es en CPU.
- Sistemas operativos: Windows y Linux x86-64 con motor compilado; macOS y ARM con build Python puro de respuestas equivalentes según el autor.
- Requisito de Python: 3.10 o superior para la instalación vía `pip`.
- Opciones de despliegue: aplicación de escritorio (ZIP/tar.gz), CLI `time-series`, versión web en el navegador y paquete de Python.
- Frameworks de serving de LLM (vLLM, llama.cpp, Ollama, TGI): no aplicables, ya que no es un modelo de pesos neuronales.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables directos en la documentación aportada. Como referencia categórica, se contrasta con enfoques alternativos habituales para el mismo problema:

| Alternativa | Enfoque | Determinismo | Offline | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| time-series-ai999x | Motor de cálculo compilado con explicaciones paso a paso | Sí, declarado idéntico entre plataformas | Sí | Apache 2.0 | Hugging Face, GitHub, PyPI, web |
| LLM generativo (p. ej. un modelo de chat) | Predicción de tokens | No, sujeto a alucinación | Depende del despliegue | Variable | Amplia |
| Bibliotecas estadísticas (statsmodels, R) | Implementaciones de referencia en código | Sí | Sí | BSD/GPL según proyecto | Amplia |

No se dispone de datos de rendimiento comparativo frente a estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto libre, no mantiene conversaciones multi-turno ni soporta tool calling genérico; su alcance se limita a los 78 cálculos implementados.
- Cobertura temática acotada a los 14 temas listados; técnicas fuera de ese conjunto (por ejemplo, modelos SARIMA completos, GARCH o prophet) no están cubiertas según la información disponible.
- Idioma único: inglés. No hay soporte declarado de castellano ni de otras lenguas.
- El resultado del benchmark (accuracy 1,0) está declarado por el autor, marcado como no verificado y evaluado sobre un conjunto propio ("Golden answers"), por lo que no constituye una validación independiente.
- `inference: false` en Hugging Face: el repositorio no ejecuta el modelo en la infraestructura de la plataforma; hay que descargar los binarios o el paquete de Python.
- El recuento de 4.715.520 parámetros en safetensors no se corresponde con una arquitectura neuronal descrita; conviene tratarlo con cautela y no interpretarlo como tamaño de un transformer.
- La equivalencia de respuestas entre el motor compilado y la build Python puro en macOS y ARM es una afirmación del autor, no verificada de forma independiente en la información disponible.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución, pero no se documentan garantías ni soporte.
- Al ser determinista, no generaliza a problemas no implementados: ante una consulta fuera de su catálogo devolverá, previsiblemente, una explicación de entrada no válida en lugar de una solución.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AI999X/time-series-ai999x
- Página del modelo en el sitio del autor: https://www.ai999x.com/models/time-series-ai999x/
- Aplicación de escritorio, Windows: https://github.com/AI999X/ai999x-desktop/releases/download/v1.6.7/ai999x-time-series-1.6.7-windows-x86_64.zip
- Aplicación de escritorio, Linux: https://github.com/AI999X/ai999x-desktop/releases/download/v1.6.7/ai999x-time-series-1.6.7-linux-x86_64.tar.gz
- CLI, Windows: https://github.com/AI999X/ai999x-desktop/releases/download/v1.6.7/ai999x-cli-1.6.7-windows-x86_64.zip
- CLI, Linux: https://github.com/AI999X/ai999x-desktop/releases/download/v1.6.7/ai999x-cli-1.6.7-linux-x86_64.tar.gz
- Repositorio de escritorio en GitHub: https://github.com/AI999X/ai999x-desktop
- Demostración en vídeo (MP4): https://www.ai999x.com/?ax_shot=time-series-ai999x/clip.mp4
- Instalación en Python: `pip install time-series-ai999x`
