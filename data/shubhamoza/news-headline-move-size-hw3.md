# ShubhamOza/news-headline-move-size-hw3

## Resumen

ShubhamOza/news-headline-move-size-hw3 es un artefacto académico publicado en Hugging Face por el usuario ShubhamOza: la tercera práctica de una asignatura de NLP. No es un modelo de lenguaje generativo, sino un conjunto de modelos clásicos de machine learning (regresión logística sobre TF-IDF y gradient boosting sobre una tabla de características) entrenados para predecir si un valor bursátil tendrá un movimiento grande —valor absoluto del retorno por encima del 1,23 %, mediana del conjunto de entrenamiento— a partir de los titulares de prensa de ese día. El repositorio incluye el cuaderno HW3_Headline_Story.ipynb con todas las salidas guardadas, la carpeta de figuras y results/metrics.json; los modelos se serializan en formato joblib.

El planteamiento cambia tres cosas respecto a los trabajos previos (HW1 y HW2): el objetivo (de predecir dirección a predecir magnitud), la tokenización (de palabras completas con stopwords eliminadas a BPE de 8.000 piezas con la librería `tokenizers` de Hugging Face) y el enfoque de aprendizaje (de léxico de sentimiento y tópicos no supervisados con NMF a aprendizaje supervisado). El tokenizador BPE y los tópicos se reajustan únicamente sobre el conjunto de entrenamiento para evitar fuga de información.

El hallazgo central es negativo y metodológicamente relevante: la mayor parte de la señal procede de la identidad de la empresa y del calendario (el crash de la COVID-19), no del texto de los titulares. Un modelo sin texto que solo usa la frecuencia histórica de días de movimiento grande por empresa alcanza un ROC-AUC de 0,616 en test y 0,614 en inferencia, prácticamente lo mismo que el modelo final con titulares (0,636 y 0,604). El propio autor documenta que los modelos de texto aprenden el calendario —tokens como *coronavirus*, *march* o *april*— y que al medir sobre datos nuevos la ventaja del texto se desvanece.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No es una red neuronal. Pipeline clásico de scikit-learn: regresión logística sobre TF-IDF de tokens BPE y gradient boosting de árboles sobre tabla de características (estadísticas de titulares, media histórica por empresa, 15 tópicos NMF y léxico de sentimiento de HW1) |
| Parametros totales | No disponible. No hay pesos densos ni recuento de parámetros; no se especifica el número de árboles del boosting ni la dimensión final de la tabla de características |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo no generativo). Cada fila agrega todos los titulares de un valor en un día: mediana de 25 palabras, media de 59 |
| Tipos de cuantizacion | No aplica. Los artefactos joblib de scikit-learn operan en coma flotante; no se publican variantes cuantizadas |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | joblib (modelos serializados); el repositorio incluye además el cuaderno .ipynb y figuras PNG |
| Pipeline declarado en Hugging Face | No disponible |
| Tamaño del repositorio | 0,0 GB |
| Descargas / likes | 0 / 0 |
| Fecha de publicación | 24 de septiembre de 2026 (actualizado el mismo día) |

## Arquitectura y entrenamiento

El sistema combina dos vías de modelado. La primera es una regresión logística sobre vectores TF-IDF construidos con un tokenizador BPE de 8.000 piezas entrenado con la librería `tokenizers` de Hugging Face exclusivamente sobre el conjunto de entrenamiento. Frente al vocabulario de 106.148 palabras de HW2, el BPE reduce el vocabulario y baja la tasa de tokens desconocidos en el periodo de inferencia del 2,46 % al 0,00 %, conservando números, el símbolo `$` y puntuación que el preprocesamiento anterior descartaba; sin embargo, no mejora la capacidad predictiva. La segunda vía es un modelo de gradient boosting sobre una tabla de características que incluye estadísticas agregadas de los titulares, la media histórica de la empresa, 15 tópicos extraídos con NMF (reajustados solo con datos de entrenamiento) y el léxico de sentimiento de HW1.

El objetivo binario se define como «movimiento grande» (retorno absoluto por encima de 1,23 %, la mediana del conjunto de entrenamiento) frente a «día tranquilo». Los datos se dividen por fecha: entrenamiento del 1 de agosto de 2019 al 30 de septiembre de 2020 (84.988 filas), test anterior al 1 de agosto de 2019 (4.466 filas, julio de 2019) e inferencia desde el 1 de octubre de 2020 (2.397 filas). El ajuste de hiperparámetros (el parámetro `C` de la regresión logística y el número de árboles del boosting) se realiza sobre el último 15 % del conjunto de entrenamiento ordenado por fecha, y ante modelos con una diferencia de AUC de validación inferior a 0,005 se elige el más simple. La proporción de días de movimiento grande varía mucho entre periodos: del 24 % de las filas en diciembre de 2019 al 89 % en marzo de 2020, volviendo después a alrededor del 50 %.

## Capacidades

- Clasificación binaria supervisada: distingue días de movimiento grande frente a días tranquilos a partir de los titulares de un valor en una fecha concreta.
- Salida probabilística (ROC-AUC y probabilidad calibrable a umbral 0,5), apta para ordenar filas por riesgo de movimiento.
- Procesamiento de titulares en inglés mediante un tokenizador BPE de 8.000 piezas con tasa de tokens desconocidos del 0,00 % en el periodo de inferencia.
- Uso combinado de señal textual (TF-IDF, tópicos NMF, léxico de sentimiento) y señal estructurada (identidad de la empresa, estadísticas agregadas de titulares, calendario).
- Reutilización de componentes: el tokenizador BPE, los 15 tópicos NMF y el léxico de HW1 se pueden extraer como piezas independientes para otros experimentos de NLP financiero.
- No dispone de generación de texto, razonamiento multi-paso, tool calling, function calling, capacidades de agente, visión, audio ni modo de pensamiento.
- No es multilingüe: únicamente inglés.
- No se documenta ninguna innovación de decodificación (decodificación especulativa, atención lineal ni similares), porque no hay un transformer subyacente.

## Casos de uso

- Cribado previo en investigación cuantitativa: usar la probabilidad del modelo para reducir el universo de días que un analista revisa manualmente antes de un estudio de eventos. Es adecuado porque ordena mejor que el azar (ROC-AUC de 0,604 a 0,636 en periodos no vistos), pero debe emplearse como filtro, no como señal operativa.
- Señal auxiliar de volatilidad en backtesting: incorporar la probabilidad como característica adicional en un modelo de riesgo o de volatilidad ya existente, validando siempre con particiones temporales y controlando explícitamente por empresa para no atribuir al texto lo que aporta la identidad del valor.
- Docencia y evaluación de metodología: el cuaderno reproducible (con todas las salidas guardadas) sirve para enseñar fuga de información, dependencia del calendario, análisis de ablación y el uso correcto de splits temporales en series financieras.
- Auditoría interna de modelos: el desglose de ablación (tópicos, léxico y puntuación BPE aportan «casi nada» en datos no vistos) es un caso de referencia para comités de validación que necesitan ejemplos de rendimiento inflado por la variable identificadora.
- Monitorización de titulares para equipos de análisis fundamental: priorizar los días con titulares ligados a mayor probabilidad histórica de movimiento (subidas de precio objetivo por analistas, registros ante la SEC), conscientes de que la separación entre tópicos es débil (del 46 % al 54 % de días de movimiento grande).
- Detección de deriva temporal en producción: la diferencia entre rendimiento en entrenamiento (hasta 0,741 en regresión logística BPE) y en inferencia (0,554) es un caso práctico para diseñar alertas de degradación y protocolos de reentrenamiento.
- Reutilización del tokenizador BPE: las 8.000 piezas entrenadas sobre titulares financieros en inglés, con 0,00 % de tokens desconocidos en el periodo de inferencia, se pueden reutilizar como componente de otros pipelines de NLP financiero.
- Construcción de conjuntos de datos etiquetados: el pipeline de agregación diaria por valor (mediana de 25 palabras frente a media de 59) y la definición del objetivo son reutilizables para generar etiquetas en nuevos periodos.

## Benchmarks y rendimiento

Los datos siguientes proceden de la model card del autor. ROC-AUC con objetivo «movimiento grande»; 0,50 equivale a azar.

| Modelo | Train | Test (julio 2019) | Inferencia (oct. 2020) |
|---|---|---|---|
| Estimación constante (sin información) | 0,500 | 0,500 | 0,500 |
| Solo media por empresa (sin texto) | 0,600 | 0,616 | 0,614 |
| Regresión logística, tokens de palabra (estilo HW2) | 0,734 | 0,618 | 0,553 |
| Regresión logística, tokens BPE (HW3) | 0,741 | 0,606 | 0,554 |
| Boosting: empresa + estadísticas de titulares (modelo final) | 0,622 | 0,636 | 0,604 |
| Boosting: + tópicos (HW2) | 0,629 | 0,637 | 0,602 |
| Boosting: + léxico (HW1) | 0,630 | 0,638 | 0,601 |
| Boosting: + puntuación de texto BPE (HW3) | 0,664 | 0,626 | 0,587 |

Objetivo antiguo («subida o bajada»), para comparar:

| Modelo | Train | Test | Inferencia |
|---|---|---|---|
| Regresión logística, tokens BPE | 0,669 | 0,501 | 0,484 |
| Boosting: estadísticas + tópicos + léxico | 0,573 | 0,505 | 0,503 |

Modelo final (elegido sobre una porción de validación del entrenamiento, con umbral 0,5):

| Partición | Filas | Proporción de movimientos grandes | ROC-AUC (intervalo del 95 %) | Exactitud | F1 |
|---|---|---|---|---|---|
| Train | 84.988 | 0,500 | 0,622 | 0,586 | 0,575 |
| Test (julio 2019) | 4.466 | 0,323 | 0,636 (0,619 a 0,653) | 0,601 | 0,491 |
| Inferencia (oct. 2020) | 2.397 | 0,500 | 0,604 (0,584 a 0,624) | 0,570 | 0,557 |

No se han publicado resultados de benchmarks de terceros (MMLU, HumanEval, GSM8K ni equivalentes) en la información disponible, ya que no se trata de un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica. Al tratarse de modelos de scikit-learn serializados en joblib (regresión logística dispersa y gradient boosting), la inferencia se ejecuta en CPU.
- RAM necesaria: no disponible. No se publica ninguna cifra de consumo de memoria ni el tamaño efectivo de los artefactos (el repositorio figura como 0,0 GB).
- GPU recomendadas: no aplica; no se requiere GPU. No hay soporte CUDA documentado.
- Compatibilidad con GPU de consumo: no aplica, el modelo funciona en CPU convencional; no se especifican requisitos mínimos de hardware.
- Opciones de despliegue: carga de los artefactos joblib desde Python con scikit-learn y el tokenizador de Hugging Face. No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que no hay un transformer ni pesos en safetensors o GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

La model card no referencia ningún modelo externo comparable (por ejemplo, clasificadores financieros basados en transformers), por lo que no hay datos de terceros disponibles. La comparación posible es interna, contra las líneas base y las variantes evaluadas en el propio trabajo:

| Alternativa (misma tarea y mismos datos) | ¿Usa texto? | ROC-AUC test | ROC-AUC inferencia | Licencia |
|---|---|---|---|---|
| Estimación constante | No | 0,500 | 0,500 | No aplica |
| Solo media por empresa | No | 0,616 | 0,614 | No aplica |
| Regresión logística con tokens BPE | Sí | 0,606 | 0,554 | MIT |
| Boosting con tópicos (HW2) | Sí | 0,637 | 0,602 | MIT |
| Boosting empresa + titulares (modelo final) | Sí | 0,636 | 0,604 | MIT |

Modelos comparables externos: no disponible.

## Limitaciones y advertencias

- La aportación del texto es marginal: un modelo sin texto basado solo en la media histórica por empresa iguala al modelo final en los periodos no vistos, y añadir tópicos, léxico o la puntuación BPE apenas mueve el ROC-AUC.
- Los modelos de texto aprenden sobre todo el calendario: tokens como *coronavirus*, *march* o *april* se asocian a movimientos grandes porque coinciden con el crash de la COVID-19, lo que constituye un riesgo claro de sobreajuste a un régimen de mercado concreto.
- El objetivo se define con la mediana del conjunto de entrenamiento (1,23 %), por lo que la frontera entre «movimiento grande» y «día tranquilo» depende de la distribución de ese periodo y cambia de significado en otros regímenes.
- Deriva temporal acusada: la exactitud y el F1 no son comparables entre particiones porque la proporción de la clase positiva varía del 32 % al 50 %, y la puntuación cae de 0,741 en entrenamiento a 0,554 en inferencia.
- El reparto de datos es atípico: el conjunto de test (julio de 2019) es anterior en el tiempo al de entrenamiento (agosto de 2019 a septiembre de 2020), siguiendo el diseño del curso; los resultados deben interpretarse con esa cautela.
- Riesgo de inferencia causal errónea: la variable «empresa» puede actuar como sustituto de otros factores no observados (sector, capitalización, liquidez) y no se documenta ningún control adicional.
- No hay alucinación en sentido generativo, porque el modelo no produce texto, pero sí riesgo de sobreinterpretar las importancias de características y los tópicos como explicaciones causales.
- Cobertura lingüística limitada al inglés y a titulares de un mercado concreto; no se documenta la composición ni la licencia de los datos de titulares y precios, que no se distribuyen con el repositorio.
- Licencia MIT sobre el código y los artefactos: permite uso comercial, pero no cubre los datos de origen ni exime de las obligaciones de atribución.
- Artefacto sin validación por la comunidad: 0 descargas y 0 likes, repositorio de 0,0 GB y README truncado en la información disponible, por lo que no se puede confirmar que todos los modelos serializados estén efectivamente publicados.
- No apto para uso en producción como sistema de decisión financiera: los valores de ROC-AUC (0,60-0,64) implican una capacidad discriminativa baja.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ShubhamOza/news-headline-move-size-hw3
- Cuaderno completo con todas las salidas: https://huggingface.co/ShubhamOza/news-headline-move-size-hw3/blob/main/HW3_Headline_Story.ipynb
- Figuras del análisis: https://huggingface.co/ShubhamOza/news-headline-move-size-hw3/tree/main/figures
- Métricas completas: https://huggingface.co/ShubhamOza/news-headline-move-size-hw3/blob/main/results/metrics.json
- Perfil del autor: https://huggingface.co/ShubhamOza
- Conjunto de datos relacionado (puntuaciones de sentimiento de titulares): https://huggingface.co/datasets/ShubhamOza/sentiment-headline-scores

Nota: el resto de resultados de la búsqueda web corresponde a agregadores genéricos de noticias de IA (orangebot.ai, headsupai.io, promptzone.com) sin relación específica con este modelo, por lo que no se incluyen como fuentes.
