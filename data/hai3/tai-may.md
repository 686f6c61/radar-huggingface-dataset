# Hai3/tai-may

## Resumen

Tai Máy (nombre técnico del paquete: hdsear) es una herramienta de control de calidad de audio TTS en vietnamita que detecta errores de pronunciación a nivel de sílaba imitando la escucha humana. No es un modelo generativo ni un modelo de lenguaje: es un pipeline que combina cinco subsistemas de escucha ("cinco oídos") construidos sobre modelos preentrenados (wav2vec2 en vietnamita, MMS-FA de Meta, WavLM-SV de Microsoft y pyin de librosa) y una capa de decisión ("bộ phán") que mezcla reglas calibradas y un clasificador supervisado. Lo desarrolla Hai3 y se publicó el 7 de octubre de 2026, creado expresamente para HDS Voice (voz clonada VoxCPM2).

El problema que aborda es concreto: los transcriptores automáticos (Whisper, Gemini) solo señalan qué palabras se sustituyen u omiten, por lo que no detectan fallos que no alteran el texto pero que un oyente humano percibe de inmediato: cortes mal colocados, sílabas poco claras, sonidos tragados, segmentos omitidos, palabras extranjeras mal leídas, desviaciones de tono o cambios de timbre a mitad de frase. Tai Máy no transcribe: alinea cada sílaba del texto con su audio, mide el intervalo entre sílabas y la claridad de cada una, y lo compara con cómo lee una persona real.

Cada error detectado se devuelve con marca temporal en segundos, la sílaba afectada y el motivo, en JSON o en un informe HTML con forma de onda y marcas interactivas. El repositorio de HuggingFace no contiene pesos (tamaño de 0,0 GB) y acumula 0 descargas y 0 "likes"; los modelos base se descargan aparte en el directorio models/.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pipeline híbrido de cinco subsistemas de escucha (alineamiento forzado sobre wav2vec2 CTC, MMS-FA, pyin/librosa, WavLM-SV) más una capa de decisión con reglas y clasificador supervisado. No es un transformer monolítico |
| Parámetros totales | no disponible (los pesos de los modelos base no se alojan en el repositorio; el tamaño del repo es de 0,0 GB) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (procesa audio por clips, no tiene ventana de contexto de texto) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | vietnamita (principal); palabras extranjeras en escritura latina mediante MMS-FA (1.130 idiomas, solo comprobación de completitud de sonidos) |
| Licencia | MIT para el código; los modelos base conservan sus licencias propias (wav2vec2 en vietnamita de nguyenvulebinh, MMS de Meta, WavLM de Microsoft) |
| Formato de pesos | no disponible (los modelos base se descargan en models/ en formato PyTorch; la ruta se puede cambiar con la variable HDSEAR_MODELS) |

## Arquitectura y entrenamiento

El sistema se organiza en cinco oídos especializados más un juez. Tai Việt (oído vietnamita) usa un wav2vec2 en vietnamita con CTC sobre caracteres con diacríticos y alineamiento forzado para obtener marcas de inicio, fin y puntuación de claridad de cada sílaba. Tai thế giới (oído mundial) emplea el pipeline MMS_FA de Meta, entrenado con 31.000 horas y 1.130 idiomas sobre escritura latina sin diacríticos, y comprueba si las palabras extranjeras, nombres de letras y códigos se pronuncian con todos sus sonidos. Tai thanh điệu (oído tonal) extrae el contorno de tono por sílaba con pyin (librosa) y lo compara con plantillas aprendidas de las seis voces de un hablante real. Tai màu giọng (oído de timbre) usa WavLM-SV con ventana deslizante de 1,2 segundos para detectar cambios de color de voz dentro de una frase. Tai nhịp (oído de ritmo) combina las marcas de alineamiento con una tabla de "dónde respira una persona real" específica por voz.

Bộ phán (el juez) agrega todas las señales y decide error/no error mediante dos capas: una de reglas con umbrales calibrados sobre voz real y otra aprendida, un clasificador entrenado sobre datos corrompidos de forma intencionada (corrupt.py) generados a partir de clips reales. La tabla de referencia de voz real (data/baseline.json) se aprende con el comando hdsear calibrate. No se especifican el volumen de datos de entrenamiento ni la composición del corpus; los datos de voz usados para la calibración son privados y no están en el repositorio.

## Capacidades

- Detección de errores con marca temporal por sílaba, con los códigos: ngat_sai (corte mal colocado), ngat_nghi (pausa), ngat_dai (pausa larga), khong_ro (poco claro), mo (borroso, solo referencia), nuot (sonido tragado), bo_doan (omisión de segmento), nghi_cau_ngan (pausa de frase corta), ngoai_mo (palabra extranjera mal leída), sai_dau (tono incorrecto, solo referencia) y lac_giong (cambio de timbre).
- Medición por sílaba de marcas de inicio y fin, claridad (score_vi, score_w), contorno de tono (contour), distancia tonal (tone_dist) y timbre.
- Generación de informes HTML con forma de onda, marcas de error y cada sílaba coloreada según su claridad; al hacer clic se reproduce el fragmento exacto.
- Procesamiento por lotes mediante hdsear batch con un plan JSON y salida JSONL.
- Calibración por voz (hdsear calibrate) para aprender umbrales, puntos de respiración y plantillas tonales de un hablante concreto.
- Entrenamiento del clasificador de decisión (hdsear train) a partir de datos corrompidos intencionadamente.
- Comparación de grafías alternativas de códigos y siglas para elegir la más legible por el motor TTS.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, generación de texto, visión ni audio de entrada arbitrario: su única tarea es la auditoría de pronunciación.

## Casos de uso

- Control de calidad de TTS en producción: ejecutar hdsear listen sobre cada audio generado por un motor de voz clonada (por ejemplo VoxCPM2) antes de publicarlo; los códigos con tasa de falsos positivos muy baja (ngat_sai y bo_doan a 0,01 por 100 sílabas) permiten rechazar automáticamente tomas defectuosas sin intervención humana.
- Selección de la mejor toma en pipelines de voz clonada: generar ocho variantes por celda (como en el experimento con "FZ1073") y usar la puntuación por sílaba y las marcas de error para elegir la toma más limpia antes de la escucha manual.
- Verificación en CI/CD: integrar hdsear accept y hdsear batch sobre un conjunto fijo de frases de prueba en cada cambio del motor TTS, detectando regresiones de pronunciación con umbrales cuantificados en lugar de revisión subjetiva.
- Etiquetado y filtrado de datasets de voz: procesar lotes con hdsear batch plan.json y descartar clips con nuot, bo_doan o ngat_sai antes de incorporarlos a un corpus de entrenamiento, reduciendo el ruido de las etiquetas.
- Localización y doblaje al vietnamita: detectar palabras extranjeras mal leídas (ngoai_mo) y siglas o códigos problemáticos, comparando alternativas de escritura para decidir cuál pronuncia mejor el motor.
- Control de consistencia de voz en audiolibros: el oído de timbre (Ear(timbre=True)) detecta cambios de color de voz a mitad de frase (lac_giong) en grabaciones largas, un fallo difícil de localizar a mano.
- Auditoría con humano en el bucle: usar los avisos de khong_ro (0,49 por 100 sílabas) para priorizar qué fragmentos revisar manualmente, reduciendo el tiempo total de escucha al concentrarse solo en los tramos dudosos.
- Evaluación de una voz de referencia antes de clonarla: calibrar con hdsear calibrate para obtener la tabla de puntos de respiración y de sílabas problemáticas propias de ese hablante y fijar expectativas realistas sobre el motor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que no se trata de un modelo de lenguaje. La model card sí aporta medidas propias de fiabilidad, calculadas sobre 267 clips de una única voz real (9.469 sílabas), expresadas como falsos positivos por cada 100 sílabas:

| Código de error | Falsos positivos / 100 sílabas | Utilidad declarada |
|---|---|---|
| ngat_sai, bo_doan | 0,01 | prácticamente sin falsos positivos; sirve para decisión automática |
| nuot | 0,10 | fiable |
| khong_ro | 0,49 | indica tramos a reescuchar, no es conclusión |
| ngat_dai | 0,35 | solo referencia |
| ngat_nghi | 0,32 | solo referencia |
| mo, sai_dau | no disponible | solo referencia, no se cuentan como error |

Prueba de aceptación (hdsear accept), sobre 6 frases leídas por máquina con errores señalados por oyentes humanos:

| Resultado | Detalle |
|---|---|
| Detectado | corte tras "ép"; "bảy" final poco claro; omisión de una frase de 41 sílabas; mala lectura de "feet" y "subscribe" |
| No detectado | una pausa "poco razonable" antes de "và" (los hablantes reales también respiran ahí) |

Experimento de comparación de grafías para el código "FZ1073" (8 tomas por celda, escucha ciega de la máquina y de Gemini):

| Grafía introducida al TTS | Tomas limpias (de 40) | Gemini transcribe bien (de 40) |
|---|---|---|
| ép dét một không bảy ba | 16/40 | 38/40 |
| ép-zét một-không-bảy-ba | 34/40 | 39/40 |
| ép-zét-một-không-bảy-ba | 25/40 | 36/40 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Los componentes neuronales son modelos preentrenados estándar (wav2vec2 en vietnamita, MMS_FA y WavLM-SV) más procesado de señal con librosa (pyin).
- GPU recomendadas: no disponible. En la model card se menciona una "GPU alquilada" para el motor TTS de HDS Voice, no para hdsear.
- ¿Cabe en GPU de consumo? no disponible (no se confirma en la documentación).
- Opciones de despliegue: paquete Python instalable con pip install -e .; interfaz de línea de comandos (hdsear listen, batch, calibrate, train, accept) y API Python (from hdsear import Ear, report). Dependencia crítica: torchaudio < 2.8, porque MMS_FA queda marcado como obsoleto a partir de la versión 2.8. Los pesos se descargan en models/ (configurable con HDSEAR_MODELS).
- Latencia y rendimiento: no disponible. El ejemplo de la documentación procesa 19,4 segundos de audio con 84 sílabas (4,48 sílabas por segundo), pero ese dato es la velocidad del habla del audio, no el tiempo de cómputo de la herramienta.

## Comparativa con modelos similares

| Herramienta | Enfoque | Qué detecta | Qué no detecta | Licencia |
|---|---|---|---|---|
| Tai Máy (hdsear) | Alineamiento sílaba-audio más comparación con voz real | Cortes mal colocados, claridad, sonidos tragados, omisiones, tono, timbre y palabras extranjeras, con marca temporal | Significado, emoción y énfasis intencional | MIT (código); modelos base con licencias propias |
| Whisper | Transcripción (ASR) | Palabras sustituidas u omitidas en el texto | Errores que no alteran la transcripción (corte, claridad, tono) | MIT |
| Gemini (transcripción) | Transcripción (ASR) | Palabras sustituidas u omitidas en el texto | Errores que no alteran la transcripción | Propietaria |
| Escucha humana | Referencia manual | Todos los fallos perceptibles | No es automática ni escalable | no aplica |

## Limitaciones y advertencias

- No entiende el significado, la emoción ni el énfasis pretendido por el autor del texto; solo compara con la transcripción y con la voz real de referencia.
- El oído mundial (MMS-FA) trabaja con escritura latina sin diacríticos: para palabras extranjeras solo comprueba que "se lean todos los sonidos", no que la pronunciación inglesa sea la estándar.
- El oído tonal separa las seis tonos en el contorno medio, pero con una desviación de 2 a 3 semitonos; por sí solo es solo orientativo y la decisión final recae en el clasificador.
- La tabla de voz real se construyó con una única voz; para otras voces hay que recalibrar con hdsear calibrate.
- Dependencia frágil: torchaudio marca MMS_FA como obsoleto en la versión 2.8, por lo que el repositorio fija < 2.8.
- Riesgo de falsos positivos desigual según el código: desde 0,01 por 100 sílabas en ngat_sai y bo_doan hasta 0,49 en khong_ro, que la propia documentación califica de aviso, no de conclusión.
- Los códigos mo y sai_dau son solo de referencia y no deben contarse como errores.
- El repositorio no contiene pesos (0,0 GB) ni datos de voz: los modelos base se descargan aparte y los datos de calibración son privados y no se publican. Esto limita la reproducibilidad exacta de las cifras de fiabilidad reportadas.
- El proyecto tiene 0 descargas y 0 "likes" en HuggingFace, sin ecosistema ni soporte de terceros conocido.
- La licencia del repositorio en HuggingFace figura como no disponible; la model card declara MIT solo para el código, sin cubrir los modelos base ni los datos de calibración.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Hai3/tai-may
- wav2vec2 en vietnamita (nguyenvulebinh, modelo base del oído vietnamita): https://huggingface.co/nguyenvulebinh
- Pipeline MMS_FA de Meta vía torchaudio (oído mundial): https://pytorch.org/audio/stable/pipelines.html
- WavLM de Microsoft (modelo base del oído de timbre): https://github.com/microsoft/unilm
- librosa, función pyin (oído tonal): https://librosa.org
