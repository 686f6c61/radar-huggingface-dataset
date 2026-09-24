# aikhanjum/reel-signal-ranker

## Resumen

Reel Signal Ranker es un artefacto de investigación publicado por el usuario aikhanjum en HuggingFace. Se trata de un ranker exploratorio entrenado con el contenido de 36 vídeos cortos de un único creador: dados dos conceptos de vídeo, asigna una puntuación más alta a aquel cuyo contenido se parece más a las publicaciones con mejor rendimiento de ese creador. El propio autor advierte de forma explícita que las puntuaciones no predicen visualizaciones.

Técnicamente no es un modelo generativo ni un transformer entrenado de nuevo: es un checkpoint que consiste en una cabeza lineal de preferencia entrenada sobre embeddings congelados de BGE small English v1.5. El encoder BGE no se ha ajustado en ningún momento, por lo que todo el aprendizaje reside en una capa lineal de muy bajo coste computacional.

Su relevancia es metodológica más que de producto: sirve para inspeccionar si el texto asociado a un vídeo (texto en pantalla, transcripción de voz y caption) contiene una señal de ranking medible dentro de un mismo creador, y para compararlo contra heurísticas triviales. El repositorio ocupa 0,0 GB, acumula 0 descargas y 0 likes, está etiquetado como experimental y se distribuye bajo licencia MIT con soporte únicamente para inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabeza lineal de preferencia (ranking) sobre embeddings congelados de BGE small English v1.5; no es un transformer entrenado de nuevo |
| Parametros totales | no disponible (la model card no declara el número de parámetros del checkpoint ni del encoder subyacente) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (limitada por el encoder BGE small English v1.5, no especificada en la model card) |
| Tipos de cuantizacion | no disponible (no se documentan cuantizaciones; los pesos se cargan desde `ranker.npz`) |
| Idiomas soportados | inglés (etiqueta `en`) |
| Licencia | MIT |
| Formato de pesos | `ranker.npz` (NumPy) para la cabeza de ranking; el encoder BGE small English v1.5 se carga congelado desde su propio checkpoint |

## Arquitectura y entrenamiento

El checkpoint publicado es una cabeza lineal de preferencia entrenada sobre representaciones congeladas de BGE small English v1.5. La entrada es texto de vídeo, y el autor recomienda ordenar la información así: primero el texto en pantalla y el concepto del vídeo, después el contenido hablado y, por último, los captions. La salida es una puntuación relativa de preferencia, no una probabilidad ni una estimación de visualizaciones.

La tabla de entrenamiento es privada y se construyó a partir de los Reels públicos del creador y de sus recuentos de visualizaciones públicas redondeados, capturados el 23 de septiembre de 2026. El texto de cada vídeo combina el caption público, el habla transcrita localmente y el texto reconocido en cuatro fotogramas. Las publicaciones se ordenaron por fecha de subida y el 25 por ciento más reciente (nueve publicaciones) se reservó antes de construir los pares de evaluación. Un par enfrenta publicaciones del mismo creador separadas por menos de 90 días cuando una tenía al menos el doble de visualizaciones que la otra. La primera ejecución de entrenamiento usó 27 publicaciones y 260 pares; la cabeza finalmente publicada se reentrenó con las 36 publicaciones y 473 pares. No se documenta uso de RLHF ni de DPO. El procedimiento de extracción de características está en `prepare_own.py` y el de entrenamiento en `train.py`; `ocr.swift` emplea macOS Vision y solo es necesario para reconstruir la tabla de características privada.

## Capacidades

- Comparación de dos conceptos o descripciones de vídeo: devuelve una puntuación relativa, donde una puntuación mayor indica mayor preferencia según el conjunto de datos observacional empleado.
- Ordenación dentro de un mismo creador: el modelo está diseñado para discriminar entre publicaciones del mismo creador con diferencias de rendimiento, no para comparar creadores distintos.
- Procesamiento de texto de vídeo en inglés procedente de tres fuentes: texto en pantalla, habla transcrita y caption.
- Extracción de características reproducible: el repositorio incluye los scripts de preparación y entrenamiento para replicar el pipeline con datos propios.
- No realiza generación de texto.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües: solo inglés.
- No tiene capacidades de visión en el checkpoint publicado, aunque el pipeline privado usó OCR sobre cuatro fotogramas por vídeo para construir las características de texto.
- No dispone de modo de razonamiento (thinking mode), audio ni otras capacidades especiales.

## Casos de uso

- Auditoría metodológica de señales de ranking: reproducir el experimento con `train.py` y `prepare_own.py` para comprobar si el texto de un vídeo contiene señal de rendimiento dentro de un creador concreto, comparando el resultado contra el azar y contra heurísticas triviales.
- Estudio de sesgo y validez en modelos de ranking de contenido: usar el par de heurísticas incluidas en la evaluación (longitud del texto y antigüedad de la publicación) como línea base para medir cuánto aporta realmente el embedding frente a atajos superficiales.
- Prototipado de herramientas internas de ideación: comparar dos borradores de concepto antes de grabar, entendiendo la salida como una preferencia relativa y nunca como una predicción de visualizaciones.
- Docencia y divulgación: ejemplo mínimo y de coste casi nulo de ajuste de una cabeza de preferencia sobre embeddings congelados, útil para explicar pipelines de ranking sin necesidad de GPU.
- Investigación sobre representaciones congeladas: banco de pruebas para comprobar hasta qué punto BGE small English v1.5 captura matices de contenido de vídeo corto sin ajuste alguno del encoder.
- Replicación con datos propios: el flujo `prepare_own.py` permite sustituir la tabla privada por otra tabla de un creador distinto y repetir el experimento completo.
- No es adecuado para decisiones automatizadas de publicación, para previsión de audiencia ni para integración en productos orientados a usuarios finales.

## Benchmarks y rendimiento

| Evaluación | Resultado |
|---|---|
| Pares retenidos acertados (checkpoint evaluado) | 16 de 26, es decir 61,5 por ciento |
| Azar | 50 por ciento |
| Heurística de texto más largo | 23,1 por ciento |
| Heurística de publicación más antigua | 26,9 por ciento |

Datos declarados por el autor. Los 26 pares de evaluación comparten nueve vídeos, por lo que no son ensayos independientes. El checkpoint publicado incluye los nueve vídeos retenidos y no se evaluó por separado; la salida completa de la ejecución está en `metrics.json`.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; el cuello de botella es el encoder BGE small English v1.5, no la cabeza lineal, y no hay cifras declaradas por el autor.
- GPU recomendadas: no se especifica ninguna; el modelo está pensado para ejecutarse en CPU.
- Cabe en cualquier GPU de consumo e incluso en portátiles sin GPU dedicada, dado el tamaño del repositorio (0,0 GB) y la naturaleza lineal de la cabeza.
- Opciones de despliegue: ejecución directa del script incluido (`python predict.py "texto A" "texto B"`), que carga `ranker.npz` y el encoder BGE congelado. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo con pesos en formato GGUF o safetensors publicados por el autor.
- Dependencias: las listadas en `requirements.txt` del repositorio.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se han identificado modelos comparables publicados en la información disponible. La comparación más pertinente es contra las líneas base internas del propio experimento:

| Enfoque | Senal utilizada | Resultado en los 26 pares retenidos |
|---|---|---|
| Reel Signal Ranker | Embeddings de BGE small English v1.5 con cabeza lineal entrenada | 61,5 por ciento |
| Heurística de longitud | Texto más largo | 23,1 por ciento |
| Heurística de antigüedad | Publicación más antigua | 26,9 por ciento |
| Azar | Ninguna | 50 por ciento |

| Criterio | Reel Signal Ranker | Alternativas comparables |
|---|---|---|
| Parámetros | no disponible | no disponible |
| Contexto | no disponible | no disponible |
| Licencia | MIT | no disponible |
| Disponibilidad | Repositorio público en HuggingFace, 0 descargas y 0 likes | no disponible |

## Limitaciones y advertencias

- Tamaño de datos extremadamente reducido: 36 publicaciones de un único creador y un único corte temporal; no hay evidencia de generalización a otros creadores ni a publicaciones futuras.
- Los 26 pares de evaluación comparten nueve vídeos, de modo que no son independientes; el intervalo de confianza del 61,5 por ciento es amplio y no se declara en la model card.
- El checkpoint publicado se reentrenó incluyendo los nueve vídeos retenidos y no fue evaluado por separado, por lo que la cifra de 61,5 por ciento corresponde a un checkpoint distinto del liberado.
- Las visualizaciones públicas están redondeadas y reflejan distribución, audiencia y antigüedad de la publicación además del contenido; la señal medida está contaminada por esos factores.
- Las puntuaciones son relativas y no constituyen probabilidades ni estimaciones de visualizaciones.
- Riesgo principal de mala interpretación: sobreajustar decisiones de producción a una correlación espuria de una muestra de 36 elementos. No es un problema de alucinación en sentido generativo, ya que el modelo no genera texto.
- Uso desaconsejado explícitamente por el autor para decisiones automatizadas de publicación.
- Cobertura lingüística limitada al inglés.
- Sesgos potenciales: sesgo de plataforma (Reels), de nicho del creador, de periodo temporal (captura en septiembre de 2026) y de las herramientas de transcripción y OCR empleadas en la construcción de la tabla privada.
- La licencia MIT permite uso comercial desde el punto de vista legal, pero el propio autor describe el artefacto como un recurso de investigación, no como un componente listo para producción.
- La tabla de entrenamiento, los vídeos, los captions, las transcripciones y las métricas por publicación no son públicos, lo que impide una replicación exacta del experimento original.
- La documentación apunta como siguiente prueba necesaria recoger alcance, impresiones y tiempo de visualización, y puntuar publicaciones genuinamente futuras sin reentrenar con ellas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/aikhanjum/reel-signal-ranker
- Encoder subyacente, BGE small English v1.5: https://huggingface.co/BAAI/bge-small-en-v1.5
- Búsqueda web: no se han encontrado papers, blogs ni repositorios relacionados con este modelo. Los resultados devueltos por la búsqueda corresponden a productos independientes sin relación con el checkpoint (https://www.ranksignal.ai/, https://clip-signal.com/, https://reelsignal.app/, https://rankreels.ai/) y no se incluyen como fuentes del modelo.
