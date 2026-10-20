# Mustyyyy/dsn-lid-afrihubert

## Resumen

`Mustyyyy/dsn-lid-afrihubert` es un clasificador de audio especializado en identificación de lengua hablada (LID, language identification) para lenguas nigerianas. Lo desarrolla el usuario Mustyyyy como envío a la competición DSN 2026 Language ID Challenge y consiste en un ajuste fino del modelo auto-supervisado `ajesujoba/AfriHuBERT`, presentado en Interspeech 2025 (arXiv:2409.20201) como representación de habla para lenguas africanas.

El modelo resuelve un problema acotado y concreto: dada una locución de 16 kHz en mono, asignarla a una de 13 etiquetas (`yor`, `ibo`, `hau`, `ego`, `anw`, `efi`, `ibb`, `idu`, `igl`, `nup`, `tiv`, `urh`, `other`). No genera texto, no razona y no conversa: es una cabeza de clasificación sobre un encoder transformer tipo HuBERT. Su relevancia es la de los modelos de nicho: cubre lenguas de bajos recursos con muy pocos recursos públicos y sirve como pieza de enrutamiento en pipelines de ASR multilingüe.

El tamaño es contenido (94.571.930 parámetros, repo de 0,4 GB), lo que permite ejecutarlo en CPU o en cualquier GPU de consumo. El dato de calidad publicado por el autor es un F1 de validación de la competición de 0,5953, una cifra modesta que conviene interpretar en el contexto de un corpus desbalanceado con 13 clases. El modelo no declara licencia ni idiomas en los metadatos de HuggingFace, y a fecha de la ficha no acumula descargas ni validación externa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | HuBERT (encoder transformer con extractor convolucional de características y preentrenamiento auto-supervisado), con cabeza `AutoModelForAudioClassification` (mean pooling y suma ponderada aprendida de todas las capas) |
| Parámetros totales | 94.571.930 (~94,6 M) |
| Parámetros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible como ventana de tokens; la entrada es audio mono a 16 kHz, con entrenamiento sobre fragmentos aleatorios de 8 s y evaluación sobre clips completos |
| Tipos de cuantización | no disponible; el autor indica que los pesos se almacenan en fp32 y no publica versiones cuantizadas |
| Idiomas soportados | 13 etiquetas: `yor`, `ibo`, `hau`, `ego`, `anw`, `efi`, `ibb`, `idu`, `igl`, `nup`, `tiv`, `urh`, `other` (la model card no desarrolla los nombres; `yor`, `ibo` y `hau` corresponden a yoruba, igbo y hausa, y el resto son códigos de lenguas nigerianas) |
| Licencia | no disponible |
| Formato de pesos | safetensors (pesos en fp32) |

## Arquitectura y entrenamiento

La base es AfriHuBERT, un modelo de representación de habla auto-supervisada de la familia HuBERT adaptado a lenguas africanas por Alabi, Liu, Klakow y Yamagishi (Interspeech 2025). El ajuste fino sustituye la cabeza auto-supervisada por una cabeza de clasificación de audio estándar de Transformers: pooling de media sobre las representaciones y combinación ponderada aprendida de todas las capas del encoder. El resultado es un clasificador de 13 clases que consume espectrogramas de audio mono a 16 kHz.

El entrenamiento se realizó exclusivamente sobre el split de entrenamiento de `Data-Science-Nigeria/dsn-2026-lid-train`, sin datasets externos de ajuste fino. El autor detalla varias decisiones técnicas: fragmentos aleatorios de 8 s (con teselado de clips cortos) y evaluación sobre clips completos; muestreo ponderado por `count^-0.5` para compensar el desbalance de clases; función de pérdida ponderada por las proporciones de clase de la competición con label smoothing de 0,05; aumentación con ruido aditivo entre 5 y 30 dB de SNR, simulación de banda telefónica (ida y vuelta a 8 kHz) y ganancia aleatoria. Además, se ajustaron offsets por clase sobre validación que se incorporaron al sesgo del clasificador, un detalle importante porque implica que la calibración de salida está ajustada a ese conjunto de validación concreto.

## Capacidades

- Clasificación de audio: asigna una locución a una de 13 etiquetas de lengua nigeriana (12 lenguas más la clase `other`).
- Identificación de lengua hablada robusta a condiciones telefónicas, gracias a la aumentación con simulación de banda de 8 kHz y ruido aditivo.
- Manejo de clips cortos: el entrenamiento con teselado de fragmentos permite clasificar entradas más breves que 8 s.
- Salida de logits por clase, apta para umbralizar o combinar con otros clasificadores en un pipeline.
- Capacidades multilingües limitadas al conjunto de etiquetas anterior; no cubre lenguas fuera de esa lista salvo como `other`.
- No soporta generación de texto, razonamiento, código, matemáticas, visión, tool calling ni agentes. Es exclusivamente un modelo discriminativo de audio.

## Casos de uso

- Enrutamiento de llamadas en atención al cliente: en un contact center con hablantes de yoruba, igbo, hausa, tiv o urhobo, el clasificador decide en los primeros segundos qué agente o qué cola corresponde, usando la etiqueta de mayor probabilidad sobre un clip corto.
- Selección de modelo ASR en pipelines multilingües: antes de transcribir, se identifica la lengua y se deriva el audio al modelo acústico o al adaptador correspondiente, evitando ejecutar varios ASR en paralelo.
- Filtrado y curación de corpus de habla: para construir un dataset por lengua, se clasifican horas de audio y se descarta la clase `other` o las locuciones de baja confianza, reduciendo la revisión manual.
- Documentación lingüística y sociolingüística: permite cuantificar la presencia relativa de cada lengua en grabaciones de campo y detectar code-switching o mezcla de lenguas a partir de la distribución de logits.
- Moderación y análisis de contenido en plataformas: clasificar el idioma de audios subidos por usuarios para aplicar políticas, enrutar a revisores humanos que hablen esa lengua o priorizar colas de moderación.
- Accesibilidad y subtitulado: preetiquetar el idioma de pistas de audio antes de generar subtítulos, de modo que el motor de subtitulado cargue el modelo correcto y no intente transcribir con un idioma por defecto.
- Investigación en modelos de habla de bajos recursos: servir como línea base reproducible de LID nigeriano sobre AfriHuBERT para comparar futuros ajustes finos con el mismo protocolo de evaluación.

## Benchmarks y rendimiento

El único resultado publicado en la información disponible es el F1 de validación de la competición. No hay resultados de MMLU, HumanEval, GSM8K ni de benchmarks de texto, que no aplican a un modelo discriminativo de audio. Tampoco se aportan métricas por clase ni matrices de confusión.

| Benchmark | Métrica | Resultado | Contexto |
|---|---|---|---|
| DSN 2026 Language ID Challenge (validación) | F1 de competición | 0,5953 | Corpus de 13 clases, con desbalance corregido por muestreo y pérdida ponderada; evaluación sobre clips completos |

No se han publicado resultados de benchmarks adicionales ni comparaciones con otros sistemas en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en fp32 (94,6 M de parámetros, ~378 MB de pesos, más activaciones de audio); en fp16 bajaría a ~189 MB, aunque no se publican pesos en fp16.
- GPU recomendadas: cualquier GPU con al menos 2 GB, desde una GTX 1650 o RTX 3050 hasta A100/H100; el modelo no aprovecha la GPU por tamaño, sino por latencia en lotes grandes.
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en CPU, donde es viable para procesamiento por lotes de clips de 8 s.
- Opciones de despliegue: `transformers` con `AutoModelForAudioClassification` y el pipeline de `audio-classification`, exportación a ONNX Runtime, TorchScript o servicio con Triton Inference Server. No aplica llama.cpp/Ollama, al no ser un modelo de lenguaje con pesos GGUF.
- Latencia y throughput: no se han publicado medidas. Por tamaño, la inferencia de un clip de 8 s es del orden de decenas de milisegundos en GPU moderna y de fracciones de segundo en CPU, pero son estimaciones, no datos del autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Mustyyyy/dsn-lid-afrihubert` | 94,6 M | Audio mono 16 kHz, clips de 8 s en entrenamiento | 13 etiquetas nigerianas | no disponible | HuggingFace, 0 descargas |
| `ajesujoba/AfriHuBERT` (base) | 94,6 M (según el ajuste derivado) | Audio mono 16 kHz | Representación auto-supervisada para lenguas africanas; sin cabeza de clasificación | no disponible en esta ficha | HuggingFace |
| Clasificadores LID genéricos (p. ej. enfoques ECAPA-TDNN o MMS-LID) | no disponible | Audio mono 16 kHz | Cobertura amplia, no específicamente nigeriana | variable según modelo | HuggingFace / SpeechBrain |

La comparación cuantitativa con alternativas no es posible con los datos disponibles: no se han publicado métricas del modelo base ni de los clasificadores genéricos en el mismo split de evaluación. La ventaja diferencial de este ajuste es la especialización en 12 lenguas nigerianas y la calibración por clase; su desventaja es la ausencia de licencia declarada y de validación externa.

## Limitaciones y advertencias

- Rendimiento moderado: F1 de validación de 0,5953 sobre 13 clases indica una tasa de error alta para uso autónomo; conviene emplearlo con umbrales de confianza y revisión humana.
- Los offsets por clase se ajustaron sobre validación y se incorporaron al sesgo del clasificador, por lo que el F1 reportado puede estar optimistamente sesgado y la calibración no tiene por qué generalizar a otros dominios.
- Entrenamiento con un único dataset (`dsn-2026-lid-train`), sin datos externos: la cobertura de acentos, dialectos, ruido y canales queda limitada a la composición de ese corpus.
- Sesgos esperables por desbalance de clases y por la sobrerrepresentación de las lenguas mayoritarias del corpus; las clases con menos muestras tienden a confundirse entre sí y con `other`.
- Riesgo de confusión entre lenguas cercanas y de clasificar como `other` audio de lenguas nigerianas no incluidas en las 13 etiquetas.
- Entrada restringida a audio mono a 16 kHz; audio estéreo, otras frecuencias de muestreo o clips muy cortos requieren preprocesado y pueden degradar el resultado.
- Licencia no disponible: no se puede asumir permiso de uso comercial. Es necesario contactar con el autor o consultar la licencia del modelo base y del dataset de entrenamiento (su `ATTRIBUTION.md`).
- Sin descargas ni likes en HuggingFace en el momento de la ficha: no hay evidencia de comunidad, informes de errores ni reproducciones independientes del resultado.
- Al ser un modelo discriminativo, no genera explicaciones; la salida son logits y una etiqueta, sin justificación textual.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Mustyyyy/dsn-lid-afrihubert
- Modelo base AfriHuBERT: https://huggingface.co/ajesujoba/AfriHuBERT
- Paper de AfriHuBERT (Interspeech 2025): https://arxiv.org/abs/2409.20201
- Dataset de entrenamiento DSN 2026 LID: https://huggingface.co/datasets/Data-Science-Nigeria/dsn-2026-lid-train
