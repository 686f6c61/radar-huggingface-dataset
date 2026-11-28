# Serkali-sudo/MRX-DnR-Dialogue-LiteRT-CPU

## Resumen

MRX-DnR-Dialogue-LiteRT-CPU es una conversión al formato LiteRT (TFLite) del checkpoint por defecto DnR del modelo MRX de MERL (Mitsubishi Electric Research Laboratories), un sistema de separación de fuentes de audio orientado al problema conocido como "cocktail fork": descomponer la banda sonora de una película o producción audiovisual en tres pistas independientes (diálogo, música y efectos). En esta variante concreta, el grafo estima únicamente el stem de diálogo, por lo que funciona como un extractor especializado de voz hablada a partir de una mezcla.

El modelo original se presentó en el artículo "The Cocktail Fork Problem: Three-Stem Audio Separation for Real-World Soundtracks" (ICASSP 2022) y esta conversión la publica el usuario Serkali-sudo bajo licencia MIT, respetando la licencia del checkpoint original de MERL (Copyright 2023). El repositorio ocupa aproximadamente 0,1 GB y está pensado para ejecutarse en CPU mediante el intérprete de LiteRT, sin necesidad de GPU.

La relevancia de esta ficha radica en que se trata de un artefacto de despliegue más que de un modelo de lenguaje: no genera texto ni razona, sino que procesa espectrogramas de magnitud a 44,1 kHz y devuelve máscaras para reconstruir la señal de diálogo mediante STFT inversa. Es útil para pipelines de postproducción de audio, subtitulado automático o preprocesado de ASR en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red de separación de fuentes (MRX de MERL) convertida a grafo LiteRT/TFLite; opera sobre espectrogramas de magnitud |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; procesa ventanas de audio (longitud de ventana no especificada en la información disponible) |
| Tipos de cuantizacion | no disponible (el repo organiza los pesos por directorios de precisión, pero no se detallan los tipos) |
| Idiomas soportados | no disponible (procesamiento de audio independiente del idioma) |
| Licencia | MIT |
| Formato de pesos | LiteRT / TFLite (grafo compilado para el intérprete de LiteRT) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo original más allá de su función: recibe tres espectrogramas de magnitud mono a 44,1 kHz y produce tres máscaras que, aplicadas sobre la mezcla y reconstruidas con STFT inversa, permiten aislar el stem de diálogo. El modelo original MRX de MERL se entrenó para el problema de tres stems (diálogo, música y efectos) sobre bandas sonoras reales; los detalles sobre número de tokens, composición del dataset, función de pérdida o si hubo ajuste fino con RLHF/DPO no están disponibles en la información proporcionada.

La innovación destacable de esta variante es puramente de despliegue: la conversión a LiteRT permite ejecutar el grafo en CPU con el intérprete de LiteRT, incluyendo contratos de tensores, checksums y informes de paridad de forma de onda y de benchmark por cada directorio de precisión. El autor indica que se debe reiniciar el estado de los tensores variables antes de cada ventana mediante el método de reset del runtime, lo que sugiere que el grafo mantiene estado entre ventanas y requiere gestión explícita del mismo. El benchmark incluido compara esta ruta contra la ruta TIGER CPU CompiledModel desplegada.

## Capacidades

- Separación de la pista de diálogo a partir de una mezcla de audio con música y efectos.
- Entrada de tres espectrogramas de magnitud mono a 44,1 kHz y salida de tres máscaras para reconstrucción con STFT inversa.
- Ejecución en CPU mediante el intérprete de LiteRT, sin dependencia de GPU.
- Gestión de estado entre ventanas mediante reset de tensores variables.
- Verificación de paridad de forma de onda y benchmark de CPU incluidos por precisión.
- No soporta generación de texto, razonamiento, código, matemáticas, visión, tool calling ni agentes; es un modelo de audio-to-audio.

## Casos de uso

- Postproducción de diálogo en cine y vídeo: el modelo aísla la voz hablada de una mezcla con música y efectos, lo que permite aplicar ecualización, compresión o reducción de ruido sobre el stem de diálogo sin afectar al resto de la banda sonora.
- Preprocesado para ASR y subtitulado automático: al separar el diálogo antes de pasarlo a un sistema de reconocimiento de voz, se reduce la interferencia de música y efectos, lo que mejora la precisión en transcripciones de contenido audiovisual.
- Doblaje y localización: extraer el diálogo limpio facilita la sustitución de voces o la mezcla con nuevas pistas de idioma manteniendo música y efectos intactos.
- Archivado y restauración de audio: en grabaciones antiguas con mezcla única, la separación permite recuperar la voz para su conservación o reedición.
- Análisis de contenido y moderación: aislar el diálogo permite analizar la conversación de un vídeo sin contaminación de música, útil para indexación, búsqueda o revisión de contenido.
- Despliegue en dispositivos de borde: al ejecutarse en CPU con LiteRT y ocupar aproximadamente 0,1 GB, puede integrarse en estaciones de trabajo sin GPU o en entornos embebidos para procesamiento local de audio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor menciona un informe de benchmark de CPU y de paridad de forma de onda incluido en cada directorio de precisión, pero no se proporcionan cifras concretas en la información accesible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo está diseñado para ejecutarse en CPU con LiteRT.
- GPU recomendadas: no aplica para esta variante; el grafo está compilado para el intérprete de LiteRT en CPU.
- ¿Cabe en GPU de consumo? No aplica; el despliegue previsto es en CPU.
- Opciones de despliegue: intérprete de LiteRT (CPU Interpreter) con reset de tensores variables entre ventanas; el autor compara con la ruta TIGER CPU CompiledModel.
- Latencia y throughput estimados: no disponibles en la información proporcionada; el repositorio incluye un informe de benchmark de CPU por precisión, pero no se exponen las cifras.

## Comparativa con modelos similares

| Modelo | Tipo | Stems | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| MRX-DnR-Dialogue-LiteRT-CPU | Separación de fuentes (solo diálogo) | 1 (diálogo) | MIT | LiteRT/TFLite | Hugging Face |
| MERL MRX default DnR (original) | Separación de fuentes (cocktail fork) | 3 (diálogo, música, efectos) | MIT | Checkpoint original | Repositorio de MERL |
| TIGER CPU CompiledModel | Ruta de despliegue de referencia citada por el autor | no disponible | no disponible | CompiledModel | no disponible |

La comparativa se limita a las alternativas mencionadas en la información disponible; no se detallan parámetros, contexto ni rendimiento de los modelos comparados.

## Limitaciones y advertencias

- El grafo estima únicamente el stem de diálogo; no separa música ni efectos de forma independiente en esta variante.
- No es un modelo de lenguaje: no genera texto, no razona y no soporta tool calling ni agentes.
- Mantiene estado entre ventanas; es obligatorio reiniciar los tensores variables antes de cada ventana con el método de reset del runtime, de lo contrario los resultados pueden corromperse.
- La entrada debe ser espectrogramas de magnitud mono a 44,1 kHz; no se documentan otros formatos de muestreo o canales en la información disponible.
- No se detallan sesgos, tasas de alucinación ni limitaciones idiomáticas; al operar sobre audio, la calidad depende de la mezcla de entrada y del dominio de entrenamiento del modelo original.
- La licencia MIT permite uso comercial, pero el copyright del checkpoint original pertenece a MERL (2023) y se debe citar el artículo de ICASSP 2022 según indica el autor.
- No se especifican los tipos de cuantización ni las precisiones exactas disponibles en los directorios del repositorio.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria documentada.

## Enlaces

- Hugging Face: https://huggingface.co/Serkali-sudo/MRX-DnR-Dialogue-LiteRT-CPU
- Repositorio del modelo original (MERL): https://github.com/merlresearch/cocktail-fork-separation
- Artículo: Petermann, Wichern, Wang y Le Roux, "The Cocktail Fork Problem: Three-Stem Audio Separation for Real-World Soundtracks", ICASSP 2022, DOI: https://doi.org/10.1109/ICASSP43922.2022.9746005
