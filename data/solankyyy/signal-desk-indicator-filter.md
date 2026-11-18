# SOLANKYYY/signal-desk-indicator-filter

## Resumen

Signal Desk Indicator-Type Filter es un clasificador multinomial Naive Bayes de tipo ligero, entrenado de forma independiente por Solanki Om Narendra (usuario SOLANKYYY), cuyo propósito es categorizar cadenas de indicadores como `network_name`, `url` o `ip_address`. No es un modelo de lenguaje, ni un chatbot ajustado, ni un detector de maliciosidad: es un componente de filtrado pensado para el proyecto Signal Desk, una aplicación de conversación sobre ciberseguridad. El modelo aprende frecuencias de tokens basadas en bigramas y trigramas de caracteres, así como características de forma sintáctica, a partir de cadenas etiquetadas.

La relevancia de esta ficha es limitada en términos de ecosistema de IA generativa: se trata de un artefacto educativo de clasificación de formato, no de un LLM. El modelo no está integrado actualmente en la aplicación Signal Desk en producción, y la generación conversacional de esa aplicación sigue utilizando proveedores preentrenados configurados por separado. Subir este modelo por sí solo no satisface ningún requisito que exija específicamente un modelo de lenguaje entrenado.

El modelo se distribuye con los parámetros aprendidos en un archivo `model.json` (no en formato safetensors ni GGUF), sin dependencias de inferencia de terceros, y está pensado para ejecutarse en CPU con la biblioteca estándar de Python. La tarea es de clasificación de formato sintáctico, no de análisis semántico de amenazas, y el propio autor señala que un parser determinista de URL/IP podría ser preferible para la validación de tipos en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multinomial Naive Bayes con smoothing aditivo (alpha=1) y priors de clase uniformes |
| Parametros totales | no disponible (los parametros aprendidos son recuentos de tokens almacenados en `model.json`) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (límite de entrada de 2.048 caracteres impuesto por la API de predicción) |
| Tipos de cuantizacion | no disponible (no aplica; modelo basado en recuentos, sin pesos de red neuronal) |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | JSON (`model.json`); no safetensors, no GGUF |

## Arquitectura y entrenamiento

La arquitectura es un clasificador multinomial Naive Bayes, no un transformer ni un modelo de estados espaciales. El modelo aprende frecuencias de tokens basadas en bigramas y trigramas de caracteres y en características de forma a partir de cadenas de indicadores etiquetadas. La predicción utiliza smoothing aditivo con `alpha=1` y priors de clase uniformes. Los parámetros aprendidos se almacenan en `model.json` como recuentos entrenados reales, no como un checkpoint preentrenado renombrado. Las características incluyen flags sintácticos simples, por lo que se trata de una tarea de clasificación de formato sencilla, no de análisis semántico de amenazas.

Los datos de entrenamiento provienen de una exportación pública de indicadores MISP de 15.000 filas (`threats.jsonl`) procedente de un envío de laboratorio MongoDB. La exportación seleccionada cubre cinco eventos, en su mayoría de un único publicador, replicados a través del feed CIRCL. Los recuentos originales de tipos eran 14.705 dominios, 91 hostnames, 169 URLs y 35 IPs de destino. Las filas de entrenamiento fueron 12.052 (11.893 nombres de red, 128 URLs, 31 IPs) y las filas reservadas 2.948 (2.903 nombres de red, 41 URLs, 4 IPs). La fuente tiene SHA-256 `6f45e360306b9075c543f4159a23af20d5044315f37779dff4dda6f8aefef1cb`. Las etiquetas de dominio y hostname se fusionaron porque su sintaxis se solapa; las etiquetas originales de MISP proporcionan supervisión y no se infirieron a partir de la maliciosidad. El modelo no resuelve, visita ni descarga nada de una dirección de entrada.

La división de datos agrupa hostnames y URLs por las dos últimas etiquetas de hostname, e IPs por red IPv4 /24 o IPv6 /64. El SHA-256 de la clave de grupo selecciona un holdout determinista de aproximadamente el 20%; el solapamiento de grupos es cero. La heurística de las dos últimas etiquetas no es un parser de sufijos públicos, y la evaluación no es de eventos retenidos ni de conjunto de datos externo. El entrenamiento es solo CPU y utiliza la biblioteca estándar de Python.

## Capacidades

- Clasificación de cadenas de indicadores en tres categorías: `network_name`, `url` e `ip_address`.
- Extracción de características sintácticas mediante bigramas y trigramas de caracteres.
- Manejo de entradas con un límite de 2.048 caracteres, aplicado por la API de predicción.
- Inferencia sin dependencias de terceros: solo requiere Python 3.10+ y la biblioteca estándar.
- Carga de parámetros desde un archivo JSON, no desde un pickle ejecutable.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües más allá del inglés declarado.
- No tiene modo thinking, visión ni audio.
- No es un detector de maliciosidad ni un modelo de lenguaje.

## Casos de uso

- Filtrado previo de indicadores en pipelines de ingestión: el clasificador puede sugerir una categoría para indicadores sin tipo antes de almacenarlos, manteniendo los tipos originales de MISP como autoritativos cuando estén disponibles. Es adecuado porque la tarea es de formato sintáctico y el coste computacional es mínimo.
- Etiquetado auxiliar en herramientas de inteligencia de amenazas: un analista puede usar `IndicatorFilter.predict()` para preclasificar cadenas dudosas y revisar después manualmente, almacenando las etiquetas sugeridas por el modelo por separado junto con la versión del modelo.
- Componente educativo en cursos de ciberseguridad: el modelo ilustra cómo se entrena un clasificador Naive Bayes con recuentos de tokens y cómo se evalúa con un holdout agrupado, sin necesidad de GPU ni frameworks de deep learning.
- Validación de formato en entornos de laboratorio: para distinguir rápidamente entre un nombre de red, una URL y una IP en conjuntos de datos de prueba, con la advertencia de que un parser determinista puede ser más fiable en producción.
- Reproducción de experimentos: el entrenamiento es reproducible en CPU con `python train.py /path/to/threats.jsonl --output reproduced-model`, verificando antes el SHA-256 del dataset, lo que permite auditar el proceso completo.
- Integración futura en Signal Desk: un paso de ingestión futuro podría llamar a `IndicatorFilter.predict()` para sugerir categorías, sin modificar el backend desplegado, los registros MongoDB ni el modelo de chat de la aplicación.

## Benchmarks y rendimiento

Resultados en el holdout intacto, sin búsqueda de hiperparámetros ni reajuste sobre ejemplos de test:

| Métrica | Resultado en holdout |
|---|---:|
| Accuracy | 99,9661% |
| Macro F1 | 0,99593 |
| Accuracy de la categoría mayoritaria | 98,4735% |
| F1 de network-name | 0,99983 |
| F1 de URL | 0,98795 |
| F1 de IP | 1,00000 (solo 4 ejemplos) |

Hay un ejemplo de network-name clasificado como URL. Estas puntuaciones elevadas reflejan en gran medida la sintaxis reconocible y una muestra extremadamente desequilibrada; no miden detección de amenazas, decisiones seguro/inseguro, precisión de chatbot ni generalización a campañas nuevas. Los cuatro IPs del holdout son insuficientes para una conclusión robusta sobre el rendimiento en IPs. Los recuentos brutos y la matriz de confusión están en `metrics.json`, y las asignaciones de split con hash están en `split_manifest.json`.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo se ejecuta en CPU y no requiere GPU.
- GPU recomendadas: ninguna; el entrenamiento y la inferencia son solo CPU.
- ¿Cabe en GPU consumer? No aplica, al no ser un modelo de red neuronal.
- Opciones de despliegue: ejecución directa con Python 3.10+ mediante `predict.py` o la clase `IndicatorFilter`; no requiere vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles en la información proporcionada; al ser un clasificador basado en recuentos con la biblioteca estándar, la latencia esperada es muy baja, pero no se han publicado cifras.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (clasificadores Naive Bayes de indicadores) con parámetros, contexto, rendimiento, licencia y disponibilidad documentados.

## Limitaciones y advertencias

- Los sesgos conocidos no están documentados en la información proporcionada; la muestra de entrenamiento está extremadamente desequilibrada (11.893 nombres de red frente a 128 URLs y 31 IPs), lo que puede sesgar las predicciones hacia la categoría mayoritaria.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero cadenas desconocidas o malformadas reciben igualmente una de las etiquetas soportadas; hay que validar la entrada antes de un uso operativo.
- Las puntuaciones de log devueltas son puntuaciones de clasificación sin calibrar, no probabilidades de confianza.
- Limitación de contexto: límite de 2.048 caracteres impuesto por la API de predicción.
- Limitación de idioma: el modelo está declarado para inglés, aunque la tarea es sintáctica y no semántica.
- Restricciones de licencia: la licencia no está disponible en la información proporcionada; el acceso público al feed no concede automáticamente una licencia de redistribución sin restricciones, y deben consultarse los términos de la fuente original antes de reutilizar los datos. No se afirma una nueva licencia sobre los datos del feed subyacente.
- Caveats para producción: el modelo no está integrado en la aplicación Signal Desk en vivo; no es un LLM ni un detector de maliciosidad; los tipos originales de MISP deben seguir siendo autoritativos; las etiquetas sugeridas por el modelo deben almacenarse por separado con la versión del modelo y no deben sobrescribir la evidencia fuente; la evaluación no es de eventos retenidos ni de conjunto externo, por lo que la generalización a campañas nuevas no está medida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SOLANKYYY/signal-desk-indicator-filter
- Repositorio principal de la aplicación: https://github.com/SOLANKYYY/signal-desk
- Aplicación en vivo: https://signal-desk-xi-seven.vercel.app/
- Fuente de datos de entrenamiento: https://github.com/SOLANKYYY/No_Sql_Mongodb_work/blob/main/experiments/Chapter_18/threats.jsonl
- Feed OSINT de CIRCL MISP: https://www.circl.lu/doc/misp/feed-osint/
