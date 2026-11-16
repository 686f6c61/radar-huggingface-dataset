# lhallee/Llama-many-generator-detector-ModernBERT-base

## Resumen

El Llama many-generator detector (ModernBERT-base, pair head) es un clasificador binario de texto en inglés disenado para distinguir prosa escrita por personas de prosa generada por modelos de lenguaje. Lo desarrolla el autor independiente lhallee y se publica como artefacto de investigacion bajo una licencia mixta de fuentes. Su relevancia radica en que no es un detector comercial mas: se construye explicitamente para medir hasta que punto los detectores de IA pueden discrepar entre si, y su model card documenta un experimento controlado sobre falsos positivos en texto humano antiguo.

Tecnicamente no es un transformer clasificador al uso. El encoder ModernBERT-base permanece congelado y solo se entrena una cabeza perceptron de 26,8 millones de parametros que proyecta cada pasaje a un par consulta-clave de 1.024 dimensiones y puntua pares de pasajes con una funcion de alineamiento. La deteccion se obtiene comparando la puntuacion de un texto contra un banco de 32.768 pasajes generados frente a otro de 32.768 pasajes humanos, produciendo un valor entre -1 y 1.

El modelo se entreno sobre el corpus many-generator detection corpus, con 5,17 millones de pasajes de 50 a 2.048 palabras, la mitad humanos anteriores a 2022 y la mitad producidos por 620 generadores nombrados. El nombre "Llama" obedece a la Llama Community License, porque parte del texto de entrenamiento fue escrito por modelos Llama. No debe confundirse con un modelo de lenguaje generativo: es exclusivamente un detector de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder ModernBERT-base congelado + cabeza perceptron de alineamiento por pares (query/key) |
| Parametros totales | 26,8 millones entrenables en la cabeza; encoder base congelado (tamano no disponible en la informacion) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Lee como maximo 4.096 tokens; entrenado con pasajes de 50 a 2.048 palabras |
| Tipos de cuantizacion | No disponible (la inferencia se hace en float32; los embeddings de entrenamiento se generaron en bfloat16) |
| Idiomas soportados | Ingles (en) |
| Licencia | research-artifact-mixed-sources (licencia "other" con nombre propio) |
| Formato de pesos | safetensors (requiere torch, transformers, safetensors y numpy) |

## Arquitectura y entrenamiento

La arquitectura combina un encoder ModernBERT-base congelado con una cabeza ligera entrenable. Cada pasaje se embebe una sola vez como la media y la varianza de los estados del ultimo token, lo que da un vector de 1.536 valores. Un perceptron multicapa de 26,8 millones de parametros (anchuras 1.024 y 8.192, normalizacion de capa, GELU y capa lineal a 2.048 valores) transforma ese vector en una consulta unitaria y una clave unitaria de 1.024 dimensiones cada una. Dos pasajes se puntuan como `scale * (q_a . k_b + q_b . k_a) / 2 + bias`, interpretado como el logit de que ambos compartan origen (los dos humanos o los dos generados). Como detector, la puntuacion de un pasaje es su probabilidad media de mismo origen contra el banco de pasajes generados menos la misma contra el banco humano.

El entrenamiento usa el corpus many-generator detection corpus: 5,17 millones de pasajes de 50 a 2.048 palabras, mitad humanos anteriores a 2022 y mitad de 620 generadores. Cada paso muestrea dos lotes equilibrados de 1.024 pasajes y puntua los 1.048.576 pares con entropia cruzada binaria (positivo si comparten origen). Optimizador AdamW, tasa de aprendizaje 3e-4 tras 500 pasos de calentamiento, weight decay 0,01 y dropout 0,2. El checkpoint elegido es el de menor perdida de pares en validacion (paso 13.000 de 18.000) y el umbral (0,0245) el de mayor MCC en validacion. Una ejecucion completa tarda unos 135 segundos en una GH200. El texto se reduce a prosa continua antes de embeberlo: se descartan listas, encabezados, codigo y acotaciones de chat.

## Capacidades

- Clasificacion binaria de texto en ingles como escrito por persona o generado por modelo.
- Deteccion sobre pasajes de 50 a 2.048 palabras, con lectura de hasta 4.096 tokens.
- Puntuacion continua entre -1 y 1 basada en comparacion contra bancos de referencia de 32.768 pasajes por clase.
- Extraccion de prosa continua: descarta listas, encabezados, codigo y acotaciones de chat antes de puntuar.
- Manejo de entradas sin prosa continua devolviendo `None`.
- Inferencia determinista en float32 independiente del lote y del dispositivo.
- No soporta generacion de texto, tool calling, agentes, vision, audio ni razonamiento multi-paso.

## Casos de uso

- Investigacion sobre detectores de IA: usar el modelo como referencia abierta para medir discrepancias frente a detectores comerciales como Pangram, Desklib o EditLens en conjuntos controlados.
- Auditoria de falsos positivos: analizar texto humano anterior a 2022 que otros detectores marcan como generado, gracias al banco de comparacion y a la curva ROC documentada.
- Filtrado de corpus para entrenamiento: eliminar pasajes sospechosos de ser sinteticos en la construccion de datasets, con umbral ajustable y puntuacion continua.
- Analisis de procedencia en foros y redes: puntuar publicaciones de Reddit u otras fuentes con la tasa de falsos positivos conocida (0,5 % en Reddit en el conjunto de prueba).
- Monitorizacion de contenido editorial: detectar contribuciones generadas en paginas web educativas, donde el modelo reporta una tasa de falsos positivos del 8,2 %.
- Evaluacion de generadores concretos: estimar la proporcion de texto de un modelo dado (GPT-5, Claude Sonnet 4.6, DeepSeek R1, Qwen3) presente en un corpus, usando la recall por generador documentada.
- Estudio de robustez: comparar el comportamiento del detector frente a texto parafraseado o editado, ambito en el que el autor advierte que no se ha probado.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre validacion y test (clusters completos del espacio de embeddings no vistos en entrenamiento, equilibrados por clase):

| Modelo | Split | Pasajes | PR AUC | ROC AUC | MCC |
|---|---|---|---|---|---|
| Pair head | validation | 10.000 | 0,990 | 0,989 | 0,898 |
| Pair head | test | 9.995 | 0,979 | 0,976 | 0,829 |
| Regresion logistica | validation | 10.000 | 0,903 | 0,888 | 0,663 |
| Regresion logistica | test | 9.995 | 0,896 | 0,887 | 0,558 |

Desglose por longitud en test con el umbral de validacion:

| Pasajes de test | Cantidad | PR AUC | ROC AUC | MCC | Recall | Tasa de falsos positivos |
|---|---|---|---|---|---|---|
| 50 a 199 palabras | 7.525 | 0,976 | 0,972 | 0,810 | 0,830 | 0,027 |
| 200 a 749 palabras | 2.415 | 0,989 | 0,987 | 0,884 | 0,891 | 0,013 |
| 750 palabras o mas | 55 | 0,998 | 0,996 | 0,962 | 0,971 | 0,000 |

Recall por generador: 0,916 en generadores recientes (GPT-5 chat 0,94; Claude Sonnet 4.6 0,98; DeepSeek R1 0,96; Qwen3 0,92) y 0,692 en generadores de 2023 o anteriores (GPT-2 0,41; Davinci 0,38; Cohere 0,39; Dolly 0,15). En texto humano, el 2,4 % se lee como generado, desde el 0,5 % en Reddit y el 0,6 % en resumenes de arXiv hasta el 8,2 % en paginas web educativas. El autor advierte que la fila de 750 palabras o mas descansa sobre 55 pasajes y no constituye una medicion de texto largo.

## Requisitos de hardware

- VRAM estimada: el encoder base congelado y la cabeza de 26,8 millones de parametros caben holgadamente en GPUs de consumo; el tamano del repositorio es de 0,6 GB, aunque la VRAM exacta no esta disponible en la informacion.
- GPU recomendadas: cualquier GPU con suficiente memoria para ModernBERT-base en float32; el autor cita una GH200 para el entrenamiento (135 segundos por ejecucion), no para inferencia.
- Cabe en GPU de consumo: si, dado el tamano del repositorio y la congelacion del encoder; modelos concretos no especificados en la informacion.
- Opciones de despliegue: el repositorio incluye codigo propio (`fphunt.pairdetector.PairDetector`) que requiere torch, transformers, safetensors, numpy, requests y beautifulsoup4. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | ROC AUC en test | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Llama many-generator detector | Detector por pares con encoder congelado | 26,8 M entrenables | 4.096 tokens | 0,976 | research-artifact-mixed-sources | Hugging Face |
| Desklib (citado en la model card) | Detector de IA | No disponible | No disponible | 0,72 (sobre 297 pasajes humanos etiquetados como tales por Pangram) | No disponible | No disponible |
| EditLens (citado en la model card) | Detector de IA | No disponible | No disponible | 0,71 (mismo conjunto) | No disponible | No disponible |
| Pangram 4.1 (referencia comercial) | Detector de IA | No disponible | No disponible | No disponible (etiqueto como Human los 10 pasajes que el modelo marco como mas generados) | Comercial | No disponible |

La comparacion con Desklib y EditLens procede del experimento del autor sobre 297 pasajes humanos que Pangram 4.1 clasifico como humanos; en ese conjunto, un modelo que juzgara como Pangram obtendria 0,5.

## Limitaciones y advertencias

- No modela el juicio de ningun detector comercial; se construyo precisamente para probar que los detectores discrepan.
- Lee mal texto de generadores de 2023 o anteriores: recall de 0,692, con Dolly en 0,15 y GPT-2 en 0,41.
- No se ha probado con texto editado, parafraseado o escrito para evadir un detector.
- Tasa de falsos positivos del 2,4 % en texto humano, con picos del 8,2 % en paginas web educativas y del 0,6 % en resumenes de arXiv.
- La medicion en textos de 750 palabras o mas se basa en solo 55 pasajes y no es representativa.
- Solo soporta ingles; no hay capacidades multilingues.
- La licencia research-artifact-mixed-sources es "other" con nombre propio; no se documentan en la informacion los terminos exactos para uso comercial, por lo que debe revisarse antes de produccion.
- El nombre incluye "Llama" por obligacion de la Llama Community License al entrenar con salidas de modelos Llama; no implica que sea un modelo Llama generativo.
- El modelo devuelve `None` en entradas sin prosa continua, lo que exige gestion explicita en pipelines.

## Enlaces

- Hugging Face: https://huggingface.co/lhallee/Llama-many-generator-detector-ModernBERT-base
- Dataset de entrenamiento: https://huggingface.co/datasets/lhallee/many-generator-detection-corpus
- Modelo base: https://huggingface.co/answerdotai/ModernBERT-base
- Paper, blog, repositorio y demo: no disponibles en la informacion proporcionada.
