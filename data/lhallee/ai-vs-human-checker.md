# lhallee/ai-vs-human-checker

## Resumen

`lhallee/ai-vs-human-checker` es un detector de texto generado por modelos de lenguaje en ingles, desarrollado por el usuario lhallee. No es un transformer afinado de forma convencional: se construye sobre un encoder ModernBERT-base congelado que embebe cada pasaje una sola vez, y sobre esas representaciones se entrena una cabeza de pares (multilayer perceptron de 26,8 millones de parametros) que puntua si dos pasajes comparten origen, humano o generado. La puntuacion final de un texto es la diferencia entre su probabilidad media de mismo origen frente a un banco de 32.768 pasajes de modelos y frente a otro banco de 32.768 pasajes humanos, en un rango de -1 a 1.

El modelo se entrena sobre el corpus `lhallee/many-generator-detection-corpus`, con 5,17 millones de pasajes de 50 a 2.048 palabras, la mitad escritos por personas antes de 2022 y la otra mitad por 620 generadores identificados. Su proposito declarado no es solo detectar, sino servir de artefacto de investigacion para contrastar el criterio de detectores comerciales: el proyecto buscaba texto humano anterior a 2020 que Pangram etiquetase como generado por IA.

Es relevante ahora por dos motivos. Primero, demuestra una via de deteccion barata en computo (el encoder no se reentrena; una ejecucion de entrenamiento de la cabeza tarda unos 135 segundos en una GH200). Segundo, publica de forma transparente sus limites: mal rendimiento sobre generadores de 2023 o anteriores, tasas de falsos positivos por dominio y ausencia de evaluacion sobre texto parafraseado o editado para evadir deteccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder ModernBERT-base congelado (embeddings de media y varianza del ultimo estado, 1.536 valores) mas cabeza de pares MLP de 26,8 M de parametros |
| Parametros totales | 26,8 millones en la cabeza entrenada; encoder base congelado (parametros del encoder no disponibles en la informacion) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Maximo 4.096 tokens de entrada; entrenado con pasajes de 50 a 2.048 palabras |
| Tipos de cuantizacion | No disponible (el codigo embebe en float32; el entrenamiento uso bfloat16) |
| Idiomas soportados | Ingles (en) |
| Licencia | `research-artifact-mixed-sources` (categoria `other`) |
| Formato de pesos | safetensors (requiere `torch`, `transformers`, `safetensors`, `numpy`) |

## Arquitectura y entrenamiento

La arquitectura es un hibrido en dos etapas. Primero, un ModernBERT-base congelado procesa cada pasaje y produce un vector de 1.536 valores formado por la media y la varianza de los estados del ultimo token. Segundo, un perceptron multicapa (anchuras 1.024 y 8.192, con layer normalization y GELU, y una capa lineal final a 2.048 valores) proyecta ese vector en una query y una key unitarias de 1.024 dimensiones cada una. Dos pasajes se puntuan como en los modelos de alineacion tipo Atlas: `scale * (q_a · k_b + q_b · k_a) / 2 + bias`, interpretado como el logit de que ambos comparten origen. Para clasificar un texto se compara su probabilidad media de mismo origen contra un banco de 32.768 pasajes de modelos y otro de 32.768 pasajes humanos.

El entrenamiento usa el corpus many-generator detection, con pasajes de 50 a 2.048 palabras, mitad humanos anteriores a 2022 y mitad de 620 generadores nombrados. Cada paso muestrea dos lotes equilibrados por clase de 1.024 pasajes y puntua las 1.048.576 parejas con entropia cruzada binaria (pareja del mismo origen positiva, origen mixto negativa). Optimizador AdamW, learning rate 3e-4 tras 500 pasos de warmup, weight decay 0,01 y dropout 0,2. La validacion se lee cada 500 pasos y el entrenamiento se detiene tras 10 lecturas sin mejora; el checkpoint publicado es el paso 13.000 de 18.000 y el umbral (0,0245) el de mayor MCC en validacion. Los embeddings residen en GPU, por lo que una ejecucion completa tarda unos 135 segundos en una GH200. No se menciona RLHF ni DPO; el ajuste es puramente supervisado sobre pares.

## Capacidades

- Clasificacion binaria de texto en ingles como escrito por persona o por modelo, con una puntuacion continua entre -1 y 1.
- Deteccion especifica de prosa corrida: antes de embeber, el codigo reduce el texto a su prosa eliminando listas, encabezados, codigo y acotaciones de chat.
- Manejo de pasajes de 50 a 2.048 palabras, con lectura de hasta 4.096 tokens.
- Puntuacion determinista en float32: el resultado no depende del lote ni del dispositivo de inferencia.
- Devuelve `None` para textos sin prosa corrida, lo que permite filtrar entradas no evaluables.
- Capacidad de deteccion por generador reciente: recall de 0,916 sobre 3.408 pasajes de generadores actuales (GPT-5 chat 0,94, Claude Sonnet 4.6 0,98, DeepSeek R1 0,96, Qwen3 0,92).
- No soporta tool calling, function calling, agentes, vision, audio ni modo de razonamiento: es exclusivamente un clasificador de texto.

## Casos de uso

- Moderacion de contenido en plataformas de publicacion: integrar el detector en el pipeline de ingesta para marcar articulos o comentarios largos (200-749 palabras, donde el FPR es del 1,3 %) y derivar a revision humana los que superen el umbral de 0,0245.
- Auditoria de corpus academicos: comprobar si resumenes de arXiv contienen texto generado; el modelo reporta solo un 0,6 % de falsos positivos en ese dominio, lo que lo hace util para triaje previo a revision editorial.
- Control de calidad en generacion de contenido asistida: verificar que borradores marcados como "escritos por humanos" no contienen pasajes generados, con especial utilidad en textos de 750 palabras o mas (recall 0,971 en la muestra disponible).
- Investigacion sobre detectores: usar el modelo como linea base reproducible y de bajo coste (entrenamiento en ~135 s en GH200) para comparar contra detectores comerciales y estudiar discrepancias de criterio, que es el proposito original del proyecto.
- Filtrado de datasets de entrenamiento: descartar pasajes generados por modelos recientes (recall 0,916) al construir corpus de preentrenamiento o ajuste fino que deban ser predominantemente humanos.
- Analisis forense de documentos: puntuar secciones de un documento largo por separado para localizar que fragmentos presentan mayor probabilidad de origen sintetico, dado que el modelo opera sobre pasajes y no sobre documentos completos.

## Benchmarks y rendimiento

Validacion y test son clusters completos del espacio de embeddings no vistos en entrenamiento, equilibrados por clase; el MCC es el MCC balanceado. La linea base es regresion logistica sobre los mismos embeddings estandarizados.

| Modelo | Split | Pasajes | PR AUC | ROC AUC | MCC |
|---|---|---|---|---|---|
| Pair head | validation | 10.000 | 0,990 | 0,989 | 0,898 |
| Pair head | test | 9.995 | 0,979 | 0,976 | 0,829 |
| Regresion logistica | validation | 10.000 | 0,903 | 0,888 | 0,663 |
| Regresion logistica | test | 9.995 | 0,896 | 0,887 | 0,558 |

Dos semillas adicionales de la misma receta obtuvieron en test 0,978/0,975/0,838 y 0,975/0,971/0,818 (PR AUC/ROC AUC/MCC). En test, con el umbral de validacion:

| Pasajes de test | Cantidad | PR AUC | ROC AUC | MCC | Recall | Tasa de falsos positivos |
|---|---|---|---|---|---|---|
| 50 a 199 palabras | 7.525 | 0,976 | 0,972 | 0,810 | 0,830 | 0,027 |
| 200 a 749 palabras | 2.415 | 0,989 | 0,987 | 0,884 | 0,891 | 0,013 |
| 750 palabras o mas | 55 | 0,998 | 0,996 | 0,962 | 0,971 | 0,000 |

Desglose por generador y por texto humano:

| Categoria | Pasajes | Recall / FPR |
|---|---|---|
| Generadores recientes | 3.408 | recall 0,916 |
| Generadores de 2023 o anteriores | 1.590 | recall 0,692 |
| GPT-2 | no disponible | recall 0,41 |
| Davinci | no disponible | recall 0,38 |
| Cohere | no disponible | recall 0,39 |
| Dolly | no disponible | recall 0,15 |
| Texto humano | 4.997 | 2,4 % marcado como generado |
| Posts de Reddit | no disponible | 0,5 % marcado como generado |
| Resumenes de arXiv | no disponible | 0,6 % marcado como generado |
| Paginas web educativas | no disponible | 8,2 % marcado como generado |

En la prueba de contraste con Pangram 4.1 sobre 297 pasajes que Pangram etiqueto como humanos, el modelo obtiene un AUC de 0,75 (tres semillas: 0,754, 0,749, 0,759), frente a 0,72 de Desklib y 0,71 de EditLens. La fila de 750 palabras o mas se apoya en 55 pasajes y no constituye una medicion de texto largo.

## Requisitos de hardware

- VRAM estimada: no publicada. El repositorio ocupa 0,6 GB y la cabeza tiene 26,8 M de parametros; el encoder ModernBERT-base congelado se suma a esa huella, pero no se especifica el consumo total.
- GPU recomendadas: no disponibles. El autor menciona una GH200 para el entrenamiento (unos 135 segundos por ejecucion), no para inferencia.
- GPU de consumo: no confirmado en la informacion. Por tamano del repositorio (0,6 GB) es plausible que quepa en GPUs de consumo, pero no hay dato oficial.
- Opciones de despliegue: el repositorio incluye su propio codigo de inferencia (`fphunt.pairdetector.PairDetector`) y requiere `torch`, `transformers`, `safetensors` y `numpy`; para el lector de prosa, `requests` y `beautifulsoup4`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La inferencia embebe en float32 para garantizar que la puntuacion no dependa del lote ni del dispositivo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Rendimiento publicado |
|---|---|---|---|---|---|
| lhallee/ai-vs-human-checker | 26,8 M (cabeza) + encoder congelado | 4.096 tokens | Pares sobre embeddings congelados | research-artifact-mixed-sources | ROC AUC 0,976 en test |
| Desklib (detector) | no disponible | no disponible | no disponible | no disponible | AUC 0,72 en el set de contraste de 297 pasajes |
| EditLens (detector) | no disponible | no disponible | no disponible | no disponible | AUC 0,71 en el set de contraste de 297 pasajes |
| Pangram 4.1 (comercial) | no disponible | no disponible | no disponible | propietaria | Referencia de etiquetado humano en el estudio; no se reporta AUC propia |

La comparacion con Desklib y EditLens solo cubre el experimento de contraste sobre 297 pasajes, no una evaluacion completa y equivalente entre detectores. No hay datos publicados que permitan comparar parametros, contexto o licencia de esas alternativas.

## Limitaciones y advertencias

- Solo ingles: no se ha entrenado ni evaluado en otros idiomas.
- Rendimiento bajo en generadores de 2023 o anteriores: recall de 0,692 global, con 0,41 en GPT-2, 0,38 en Davinci, 0,39 en Cohere y 0,15 en Dolly. El entrenamiento limito el numero de muestras de estos generadores.
- Falsos positivos dependientes del dominio: 2,4 % global, pero 8,2 % en paginas web educativas frente a 0,5 % en Reddit y 0,6 % en resumenes de arXiv.
- No evaluado sobre texto editado, parafraseado o escrito deliberadamente para evadir un detector; su robustez frente a evasion es desconocida.
- No es un modelo del juicio de ningun detector comercial: en el experimento con Pangram 4.1, los diez pasajes web antiguos que el modelo considero mas "de modelo" fueron etiquetados como humanos por Pangram. Sus falsos positivos son propios.
- Sensibilidad a la precision numerica: el entrenamiento uso bfloat16, cuyos estados dependen del lote, y la cabeza es sensible a ello (variacion media de 0,004 en la puntuacion y de 0,1 o mas en algunos pasajes cortos). El codigo de inferencia usa float32 para evitarlo.
- La fila de rendimiento para textos de 750 palabras o mas se basa en 55 pasajes y no mide texto largo de forma fiable.
- Licencia `research-artifact-mixed-sources`: no es una licencia de uso comercial estandar y las fuentes del corpus son mixtas; conviene revisar las condiciones antes de cualquier despliegue en produccion.
- Requiere prosa corrida: textos sin prosa (listas, codigo, tablas) devuelven `None` y no se puntuan.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion independiente por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lhallee/ai-vs-human-checker
- Dataset de entrenamiento: https://huggingface.co/datasets/lhallee/many-generator-detection-corpus
- Modelo base: https://huggingface.co/answerdotai/ModernBERT-base
- Repositorio referenciado en el codigo de ejemplo: https://huggingface.co/lhallee/Llama-many-generator-detector-ModernBERT-base
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada.
