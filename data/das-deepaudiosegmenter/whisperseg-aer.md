# DAS-DeepAudioSegmenter/whisperseg-aer

## Resumen

WhisperSeg AER es una colección de checkpoints para la segmentación de vocalizaciones animales, publicada por el usuario DAS-DeepAudioSegmenter bajo licencia Apache 2.0. El modelo resuelve la detección de eventos acústicos (dónde empieza y termina cada vocalización) sobre audio de fauna, partiendo de la arquitectura encoder-decoder de Whisper. Todos los checkpoints se distribuyen en un único fichero `.ckpt` compatible con la librería DAS que empaqueta modelo y tokenizador, con pesos en FP16 y vocabulario compactado.

La familia cubre varios tamaños: desde el modelo Tiny multiespecie (4 capas de encoder y 4 de decoder, 17,89 M de parámetros, 34,5 MiB) hasta el Large compacto (32/32, 1.477,1 M de parámetros, 2.820,9 MiB), pasando por variantes Base compactas y podadas (6E+6D, 6E+4D, 6E+2D, 6E+1D) y un Small multiespecie (12/12, 202 M de parámetros). El sufijo `cmp` indica compactación de vocabulario y `ms` que el modelo se entrenó sobre datos multiespecie.

La relevancia actual del modelo radica en su orientación a bioacústica y ecología acústica: ofrece segmentadores ligeros desplegables en dispositivos de campo y en CPU, con checkpoints intermedios que permiten ajustar el compromiso entre precisión y coste computacional. El repositorio ocupa 6,7 GB y, en el momento de la consulta, registra 0 descargas y 0 likes, por lo que no cuenta con validación de la comunidad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder tipo Whisper, adaptado a segmentación de eventos acústicos |
| Parametros totales | Variable segun checkpoint: 17,89 M (Tiny) hasta 1.477,1 M (Large compacto); referencias originales de hasta 1.542,0 M |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible. La decodificación usa `max_length=128`; la ventana de audio no se especifica en la información disponible |
| Tipos de cuantizacion | FP16 (todos los pesos liberados); no se documentan otras cuantizaciones |
| Idiomas soportados | No disponible (no aplica: modelo de audio, no de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.ckpt` compatible con DAS (modelo + tokenizador en un único fichero), pesos FP16 |

## Arquitectura y entrenamiento

Todos los checkpoints derivan de la arquitectura Whisper (encoder-decoder) y siguen tres estrategias. La primera es la compactación de Base y Large: se eliminan las filas de vocabulario no utilizadas, se conservan los tokens numéricos y especiales necesarios para la segmentación y se convierten los pesos a FP16, sin reentrenamiento y manteniendo profundidades de encoder y decoder. La segunda es el podado de Base: se congelan las seis capas del encoder y se entrena un decoder de seis, cuatro, dos o una capas sobre el split de entrenamiento del dataset `vad-animals`. La tercera es Tiny y Small: se parte de Whisper Tiny y Whisper Small multilingües, se adaptan su vocabulario y posiciones de audio a la segmentación y se entrena el decoder con el encoder congelado sobre los mismos datos multiespecie.

Los datos de entrenamiento provienen del dataset `nccratliri/vad-animals`, de contenido multiespecie. No se indica en la información disponible el número de tokens ni la composición detallada del corpus, ni si se emplearon técnicas de RLHF o DPO (poco habituales en segmentación acústica). Las innovaciones destacables son la compactación de vocabulario y el uso de pesos FP16, que reducen almacenamiento y memoria, y la reducción de profundidad del decoder en las variantes podadas, que abarata la inferencia a costa de cierta pérdida de precisión o de capacidad de transferencia.

Tamaños y estructura por checkpoint:

| Modelo | Encoder / decoder | Parametros (M) | Fichero (MiB) |
|---|---:|---:|---:|
| Tiny multiespecie | 4 / 4 | 17,89 | 34,5 |
| Animal VAD Base · referencia original | 6 / 6 | 72,1 | 275,1 |
| Animal VAD Base · compacto | 6 / 6 | 46,1 | 89,5 |
| Base 6E+6D · reentrenado | 6 / 6 | 46,1 | 88,3 |
| Base 6E+4D | 6 / 4 | 37,7 | 72,3 |
| Base 6E+2D | 6 / 2 | 29,3 | 56,2 |
| Base 6E+1D | 6 / 1 | 25,1 | 48,2 |
| Small multiespecie | 12 / 12 | 202,00 | 385,8 |
| Animal VAD Large · referencia original | 32 / 32 | 1.542,0 | 5.882,8 |
| Animal VAD Large · compacto | 32 / 32 | 1.477,1 | 2.820,9 |
| Large multiespecie · referencia original | 32 / 32 | 1.542,0 | 5.882,8 |
| Large multiespecie · compacto | 32 / 32 | 1.477,1 | 2.820,9 |

## Capacidades

- Segmentación de vocalizaciones animales: detecta eventos acústicos y sus límites temporales en audio de fauna.
- Salida de eventos con marcas temporales, evaluados con emparejamiento uno a uno a IoU >= 0,5.
- Funcionamiento multiespecie: la evaluación multiespecie agregada abarca cuatro especies distintas.
- Variantes de tamaño ajustables: Tiny, Base compacto, Base podado (6E+4D, 6E+2D, 6E+1D), Small y Large compacto, para equilibrar precisión y coste.
- Ejecución en CPU y GPU mediante la librería DAS (`WhisperSegmenter`).
- Integración en un único fichero `.ckpt` que incluye modelo y tokenizador.
- No se documenta generación de texto, tool calling, function calling, soporte de agentes, razonamiento multi-paso, visión, audio generativo ni modo de pensamiento (no aplicables o no disponibles).

## Casos de uso

- Monitorización de biodiversidad acústica en campo: desplegar el checkpoint Tiny (34,5 MiB) en grabadoras o dispositivos de bajo consumo para detectar actividad vocal y enviar solo los eventos relevantes, reduciendo almacenamiento y transmisión.
- Ecología acústica a gran escala (monitorización acústica pasiva): procesar grandes volúmenes de grabaciones continuas con un checkpoint intermedio (Base 6E+4D o 6E+2D) para localizar eventos vocales antes de un análisis más costoso.
- Preprocesado de datasets bioacústicos: usar el modelo como VAD animal para recortar y etiquetar segmentos de audio y alimentar pipelines de anotación o de entrenamiento posteriores.
- Estudios de etología y conteo de eventos: emplear el checkpoint Large compacto cuando se requiere la máxima precisión sobre grabaciones de referencia, aceptando su mayor coste (2.820,9 MiB de pesos).
- Análisis de grabaciones largas continuas: segmentar registros extensos (la evaluación incluye un segmento continuo de 600 s con 1.387 eventos) para el estudio de patrones temporales de vocalización.
- Investigación sobre aves nocturnas (nightingale): usar Base o Large compactos en grabaciones de referencia con alto número de eventos (945 s, 2.870 eventos) para la comparación entre variantes.
- Evaluación comparativa de compromisos coste-precisión: elegir entre 6E+6D, 6E+4D, 6E+2D y 6E+1D con una grabación representativa del caso real, ya que el rendimiento cambia según lo familiares que resulten los sonidos.
- Integración en flujos de investigación reproducibles: cargar los checkpoints desde Python con DAS y fijar `batch_size`, `num_beams`, `num_trials` y `max_length` para estandarizar experimentos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe un protocolo de evaluación pero el contenido proporcionado se corta antes de mostrar la tabla de puntuaciones.

Protocolo descrito (sin cifras disponibles):

- F1 multiespecie: F1 macro de eventos no ponderado sobre cuatro especies, calculado sobre un subconjunto fijo de 65 ficheros y 920 eventos del split de test de `vad-animals`.
- F1 de ruiseñor (nightingale): agrega los recuentos de eventos dentro de cada grabación de test.
- Emparejamiento de eventos uno a uno con IoU >= 0,5.
- Configuración de inferencia: `batch_size=1`, tres ensayos de inferencia, cuatro haces y `max_length=128`.
- Segmentos de test de ruiseñor: 945 s (2.870 eventos) para la comparación Base/Large; 189 s (530 eventos) para Tiny/Small; 600 s (primeros diez minutos continuos de la grabación de otro pájaro, 1.387 eventos) para Tiny/Small.

## Requisitos de hardware

- VRAM estimada (solo pesos FP16, sin activaciones): Tiny ~35 MB; Base compacto ~90 MB; Small ~386 MiB; Large compacto ~2.820,9 MiB (~2,8 GB). Las referencias originales Large alcanzan 5.882,8 MiB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede alojar la variante Large compacta; para Tiny, Base y Small basta con GPUs de gama de entrada. No se indican modelos concretos (A100, H100, RTX 4090) en la información disponible.
- Cabe en GPU de consumo: sí. Tiny, Base y Small caben en cualquier GPU moderna, y Large compacto cabe en GPUs de consumo con >= 4-6 GB.
- CPU: viable, al menos para Tiny; el ejemplo de la model card ejecuta `WhisperSegmenter(..., device="cpu")`.
- Opciones de despliegue: librería DAS (paquete `das` en PyPI) sobre PyTorch, con selección de `device` (CPU o GPU). vLLM, llama.cpp, Ollama y TGI no se mencionan y no aplican a este formato `.ckpt`.
- Latencia y throughput: no disponible.
- Requisito adicional: usar una versión de DAS que incluya la corrección de memoria de generación de Whisper.

## Comparativa con modelos similares

Comparativa interna entre los checkpoints liberados (única información disponible):

| Checkpoint | Encoder / decoder | Parametros (M) | Fichero (MiB) | Notas |
|---|---:|---:|---:|---|
| Tiny multiespecie | 4 / 4 | 17,89 | 34,5 | El más pequeño; entrenado sobre datos multiespecie; menor precisión que Small |
| Base compacto | 6 / 6 | 46,1 | 89,5 | Conversión sin reentrenamiento; precisión casi idéntica al original |
| Base 6E+6D | 6 / 6 | 46,1 | 88,3 | Decoder reentrenado sobre `vad-animals` |
| Base 6E+4D | 6 / 4 | 37,7 | 72,3 | Mantiene casi el mismo F1 multiespecie que 6E+6D |
| Base 6E+2D | 6 / 2 | 29,3 | 56,2 | Mantiene casi el mismo F1 multiespecie que 6E+6D |
| Base 6E+1D | 6 / 1 | 25,1 | 48,2 | El más reducido de la familia Base podada |
| Small multiespecie | 12 / 12 | 202,00 | 385,8 | Mejora la precisión de Tiny a mayor coste |
| Large compacto | 32 / 32 | 1.477,1 | 2.820,9 | Mayor capacidad; referencia original de 1.542,0 M |

Modelos alternativos externos: no disponible en la información proporcionada. Las referencias originales enlazadas (`nccratliri/whisperseg-base-animal-vad`, `nccratliri/whisperseg-animal-vad`, `nccratliri/whisperseg-large-ms`) se incluyen solo para comparación y no forman parte de los ficheros de esta release.

## Limitaciones y advertencias

- Los modelos Tiny y Small liberados están entrenados sobre datos multiespecie y no tienen adaptación específica a ruiseñor (nightingale).
- El rendimiento sobre sonidos poco familiares varía más que sobre las especies de entrenamiento; la propia model card recomienda elegir el checkpoint con una grabación de test representativa del caso de uso.
- Los checkpoints podados (6E+4D, 6E+2D, 6E+1D) reducen tamaño y coste de inferencia, pero pueden perder precisión o capacidad de transferencia respecto a los de seis capas.
- La compactación de vocabulario elimina filas no utilizadas; está pensada para segmentación y no se documenta su comportamiento en otras tareas.
- Riesgo de alucinación: no aplica como generación de texto; el riesgo equivalente es la detección de falsos positivos o falsos negativos de eventos. El emparejamiento uno a uno a IoU >= 0,5 puede penalizar eventos solapados.
- No se documentan sesgos conocidos ni comportamiento por idioma (es un modelo de audio).
- La evaluación multiespecie se realiza sobre cuatro especies y un subconjunto fijo (65 ficheros, 920 eventos); la generalización a otras especies o entornos no está cuantificada en la información disponible.
- Licencia Apache 2.0: permite uso comercial, con las obligaciones habituales de la licencia (atribución y conservación de avisos). Las referencias upstream pueden tener condiciones propias.
- Se requiere una versión reciente de DAS con la corrección de memoria de generación de Whisper para evitar problemas de memoria.
- El repositorio registra 0 descargas y 0 likes, por lo que carece de validación externa de la comunidad en el momento de la consulta.
- El significado de las siglas AER no se especifica en la información disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DAS-DeepAudioSegmenter/whisperseg-aer
- Dataset utilizado: https://huggingface.co/datasets/nccratliri/vad-animals
- Modelo base: https://huggingface.co/nccratliri/whisperseg-base-animal-vad
- Modelo base: https://huggingface.co/nccratliri/whisperseg-animal-vad
- Modelo base: https://huggingface.co/nccratliri/whisperseg-large-ms
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Modelo base: https://huggingface.co/openai/whisper-small
- Librería DAS: https://pypi.org/project/das/
- Manifiesto del repositorio (checksums SHA256, revisiones, tamaños de vocabulario y precisión de pesos): `manifest.json` dentro del repositorio del modelo.
