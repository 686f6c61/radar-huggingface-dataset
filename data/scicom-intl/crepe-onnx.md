# Scicom-intl/crepe-onnx

## Resumen

CREPE es un estimador de frecuencia fundamental (F0) basado en una red convolucional que opera directamente sobre muestras de audio crudas, publicado originalmente por Kim et al. en ICASSP 2018. Este repositorio, mantenido por Scicom-intl, no es el modelo original sino una exportación a ONNX de las dos capacidades que distribuye `torchcrepe` 0.0.24 (`full` y `tiny`), con el preprocesado de la librería (normalización media/desviación por trama y recorte de ventanas) embebido dentro del grafo. El resultado es un artefacto que solo necesita `onnxruntime` y NumPy: se le pasa audio mono a 16 kHz y devuelve un mapa de saliencia de 360 bins por trama, del que se decodifica F0, decisión de sonoridad y confianza.

El interés práctico está en la reproducibilidad y en la eliminación de dependencias frágiles. La model card documenta una verificación trama a trama contra el pipeline PyTorch original (diferencia máxima de saliencia de 2,98e-07 para `full` y 4,47e-07 para `tiny`, con un 100 % de acuerdo en la decisión de sonoridad sobre 2696 tramas), algo poco habitual en exportaciones ONNX de audio. Además, fija umbrales de sonoridad calibrados (0,61 en `full`, 0,58 en `tiny`, frente al 0,21 por defecto de `torchcrepe`) y publica métricas de error sobre PTDB-TUG.

Los dos ficheros cubren regímenes muy distintos: `crepe-full.onnx` tiene 22,2 M de parámetros y 89,0 MB, mientras que `crepe-tiny.onnx` tiene 0,49 M y 2,0 MB, con una precisión muy parecida en habla limpia (FFE de 6,43 % frente a 6,33 %) pero un coste de cómputo unas 23 veces menor. No es un modelo de lenguaje: no genera texto, no soporta tool calling y no procesa idiomas; es un componente de análisis de señal para pipelines de voz, música y fonética.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN sobre muestras crudas de audio (tramas de 1024 muestras a 16 kHz); salida de saliencia de 360 bins con resolución de 20 cents desde 32,70 Hz |
| Parametros totales | 22,2 M (`crepe-full.onnx`) / 0,49 M (`crepe-tiny.onnx`) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica; procesa tramas de 1024 muestras (64 ms) con salto de 160 muestras (10 ms), sin límite de duración de audio (procesamiento por tramas) |
| Tipos de cuantizacion | No disponible; solo se distribuyen grafos ONNX en float32 |
| Idiomas soportados | No disponible (modelo acústico independiente del idioma; validado únicamente sobre habla en PTDB-TUG) |
| Licencia | MIT |
| Formato de pesos | ONNX (`crepe-full.onnx`, `crepe-tiny.onnx`); script auxiliar `pitch_onnx.py` en NumPy + onnxruntime |
| Entradas | `frames` float32 [T, 1024], audio 16 kHz mono, zero-padding de 512 muestras por lado, hop 160 |
| Salidas | `salience` float32 [T, 360]; T = N // 160 + 1 tramas, la trama *i* centrada en *i* × 10 ms |
| Umbral de sonoridad | 0,61 (`full`) / 0,58 (`tiny`), calibrados sobre hablantes de desarrollo de PTDB-TUG |
| Tamano del repositorio | 0,1 GB |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura CREPE del paper de Kim et al. (ICASSP 2018): una red convolucional que consume directamente muestras de audio sin STFT ni mel, y produce una distribución de saliencia sobre 360 bins de frecuencia separados 20 cents, lo que cubre aproximadamente seis octavas desde 32,70 Hz. La exportación a ONNX integra la normalización por trama (media y desviación estándar) de `torchcrepe`, de forma que el grafo recibe audio crudo y devuelve la saliencia tal cual la generaría PyTorch. El recorte de tramas se realiza fuera del grafo con la función `pitch_onnx.crepe_frames`, que permite procesar clips largos por lotes de tramas.

La decodificación posterior es responsabilidad de `pitch_onnx.py`, que calcula la media ponderada por saliencia de los 9 bins alrededor del pico y aplica el umbral de voz. Los umbrales publicados (0,61 y 0,58) se eligieron sobre los hablantes de desarrollo de PTDB-TUG minimizando el error de F0 por trama, sustituyendo el valor 0,21 que usa `torchcrepe` por defecto. No se especifican en la información disponible los datos de entrenamiento originales (número de tokens, composición del corpus, ni si hubo ajuste posterior); solo se documenta la validación sobre PTDB-TUG, con 4 hablantes (F01, F02, M01, M02) reservados exclusivamente para calibrar umbral y desfase de trama, y 16 hablantes para evaluar.

La innovación destacable no es arquitectónica sino de ingeniería de despliegue: la verificación numérica contra la implementación de referencia (error máximo de saliencia del orden de 3e-07 a 4e-07 y diferencia de pitch inferior a 0,0001 cents) y la medición comparativa contra otras exportaciones de la misma familia (RMVPE, FCPE, PESTO) y contra `pyin` de librosa 0.11, usando la F0 derivada de laringógrafo de PTDB-TUG como referencia.

## Capacidades

- Estimación de F0 por trama con resolución temporal de 10 ms, con F0 = 0 en tramas no sonoras.
- Clasificación de sonoridad (voz/no voz) mediante umbral calibrado sobre la saliencia.
- Salida de confianza por trama junto a F0 y la decisión de sonoridad.
- Exposición de la saliencia completa de 360 bins (20 cents por bin), lo que permite análisis de prosodia, vibrato y contornos melódicos más finos que un único valor de F0.
- Dos perfiles de coste/precisión intercambiables con la misma interfaz: `full` (22,2 M) y `tiny` (0,49 M).
- Ejecución sin PyTorch, librosa ni TensorFlow: solo onnxruntime y NumPy.
- Procesamiento por lotes de tramas, válido para clips de duración arbitraria.
- Independencia de la frecuencia de muestreo original: el pipeline de ejemplo remuestrea con `soxr` a 16 kHz.
- Sin soporte de tool calling, function calling, agentes, razonamiento multi-paso, texto, visión ni audio generativo: no es un modelo de lenguaje.

## Casos de uso

- Análisis de prosodia en pipelines de TTS: extraer el contorno de F0 y la confianza por trama de una locución para transferir entonación o evaluar la naturalidad de una síntesis, ventana a ventana cada 10 ms.
- Corrección de afinación en producción musical: con la saliencia de 360 bins se puede reconstruir el pitch con precisión de 20 cents y suavizar la curva antes de aplicar corrección, sin depender de PyTorch en el servidor.
- Investigación fonética y análisis de habla: obtención de series temporales de F0 y sonoridad alineadas a 10 ms para estudios de entonación, ritmo o calidad vocal, con la ventaja de que la exportación está verificada numéricamente contra la referencia.
- Detección de actividad vocal en preprocesado de audio: la combinación de umbral de sonoridad y confianza permite descartar tramas sin voz antes de etapas más caras (ASR, diarización), usando `tiny` a coste casi nulo.
- Herramientas de enseñanza de canto o logopedia: seguimiento en tiempo real del F0 del alumno y comparación con una referencia, apoyándose en `tiny` (RTF de 0,0249 con 4 hilos) para retroalimentación interactiva.
- Preprocesado para conversión de voz y clonación: extracción de contornos de F0 y sonoridad por trama que alimentan modelos de conversión o de transferencia de estilo, con la garantía de que el extractor no introduce desviaciones respecto al原始 pipeline de `torchcrepe`.
- Monitorización de salud vocal o detección de patologías: análisis de estabilidad y rango de F0 en grabaciones largas, donde el procesamiento por tramas evita límites de duración y el coste en CPU es acotado.
- Transcripción melódica monofónica: seguimiento de melodía en instrumentos de una sola voz o voz cantada, siempre que se acepte un único F0 por trama.

## Benchmarks y rendimiento

Precisión sobre los 16 hablantes de test de PTDB-TUG (400 enunciados por condición), en porcentaje. RPA y RCA más alto es mejor; GPE, VDE, FFE y VFA más bajo es mejor; VR más alto es mejor.

| Condicion | Modelo | RPA | RCA | GPE | VDE | FFE | VR | VFA |
|---|---|---|---|---|---|---|---|---|
| clean | CREPE full | 75,15 | 76,68 | 2,68 | 5,89 | 6,43 | 84,63 | 2,93 |
| clean | CREPE tiny | 74,75 | 76,23 | 2,40 | 5,86 | 6,33 | 82,73 | 2,29 |
| ruido blanco 10 dB | CREPE full | 74,30 | 75,90 | 2,86 | 5,42 | 5,98 | 83,12 | 1,83 |
| ruido blanco 10 dB | CREPE tiny | 73,81 | 75,33 | 2,53 | 5,58 | 6,07 | 81,52 | 1,54 |
| ruido blanco 0 dB | CREPE full | 69,51 | 70,90 | 2,59 | 6,44 | 6,92 | 76,53 | 1,12 |
| ruido blanco 0 dB | CREPE tiny | 68,66 | 70,23 | 2,85 | 6,70 | 7,21 | 75,30 | 1,07 |
| ruido rosa 10 dB | CREPE full | 73,31 | 75,03 | 3,06 | 6,00 | 6,59 | 81,44 | 2,07 |
| ruido rosa 10 dB | CREPE tiny | 72,32 | 73,82 | 2,57 | 5,92 | 6,41 | 79,60 | 1,39 |
| ruido rosa 0 dB | CREPE full | 61,56 | 62,98 | 3,24 | 8,97 | 9,48 | 66,77 | 1,37 |
| ruido rosa 0 dB | CREPE tiny | 60,26 | 61,77 | 3,42 | 8,77 | 9,31 | 65,92 | 0,85 |

Velocidad en CPU x86 de servidor con onnxruntime (RTF = segundos de cómputo por segundo de audio; RSS pico incluye todo el proceso Python, con librosa y NumPy cargados):

| Modelo | Hilos | Audio | RTF | RSS pico |
|---|---|---|---|---|
| CREPE full | 1 | 10 s | 2,0914 | 2473 MB |
| CREPE full | 4 | 10 s | 0,5239 | 2476 MB |
| CREPE full | 1 | 30 s | 2,0671 | 2508 MB |
| CREPE tiny | 1 | 10 s | 0,0906 | 580 MB |
| CREPE tiny | 4 | 10 s | 0,0249 | 576 MB |
| CREPE tiny | 1 | 30 s | 0,0917 | 614 MB |

Comparativa de FFE (%) frente a otros estimadores, según la tabla de la model card (la información proporcionada está truncada a partir de la fila `clean`):

| Condicion | RMVPE | FCPE | CREPE full | CREPE tiny | PESTO | pyin (librosa 0.11) |
|---|---|---|---|---|---|---|
| clean | 3,09 | 2,77 | no disponible (tabla truncada) | no disponible (tabla truncada) | no disponible (tabla truncada) | no disponible (tabla truncada) |
| resto de condiciones | no disponible (tabla truncada) | no disponible (tabla truncada) | no disponible (tabla truncada) | no disponible (tabla truncada) | no disponible (tabla truncada) | no disponible (tabla truncada) |

Nota: la tabla comparativa de la model card está cortada en la información disponible; los valores de FFE para CREPE full y tiny que sí se publican (6,43 % y 6,33 % en limpio) proceden de las tablas individuales del modelo y no se pueden contrastar directamente con la fila `clean` de la comparativa.

## Requisitos de hardware

- Huella de pesos: 89,0 MB en float32 para `crepe-full.onnx` y 2,0 MB para `crepe-tiny.onnx`. No se publican cifras oficiales de VRAM; como estimación, el grafo completo en fp32 ocupa del orden de 0,1 GB en `full` y unos pocos MB en `tiny`, más las activaciones de las tramas del lote.
- `crepe-tiny` cabe holgadamente en cualquier GPU de consumo (GTX 1050, RTX 3050, RTX 4090) y funciona incluso en CPU de un solo núcleo a RTF 0,09, es decir, unas 11 veces más rápido que tiempo real.
- `crepe-full` en CPU de un solo hilo es más lento que tiempo real (RTF 2,09); con 4 hilos baja a RTF 0,52 (unas 2 veces tiempo real). Para uso interactivo conviene GPU o más hilos.
- Memoria de proceso observada por el autor: 2473 MB de RSS pico con `full` y 580 MB con `tiny`, aunque la medición incluye librosa y NumPy cargados; `pitch_onnx.py` solo requiere numpy y onnxruntime, por lo que la huella real del script es menor (no cuantificada en la información disponible).
- Despliegue: onnxruntime (CPU o execution providers de CUDA/TensorRT; el uso de GPU no está documentado en la model card), integración en Python vía `pitch_onnx.PitchModel` y en R mediante el paquete `superassp` (`trk_pitch_crepe`). No aplica vLLM, llama.cpp, Ollama ni TGI: no es un modelo generativo de texto.
- Latencia: no se publican latencias absolutas por trama; el RTF de las tablas permite calcularla (por ejemplo, `tiny` con 4 hilos procesa 10 s de audio en ~0,25 s de cómputo).
- Throughput: no disponible más allá del RTF medido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | FFE limpio (%) | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| CREPE full (esta ficha) | 22,2 M | tramas de 1024 muestras, 10 ms | 6,43 | ONNX | MIT | HuggingFace, 0 descargas |
| CREPE tiny (esta ficha) | 0,49 M | tramas de 1024 muestras, 10 ms | 6,33 | ONNX | MIT | HuggingFace, 0 descargas |
| RMVPE (Scicom-intl/rmvpe-onnx) | no disponible | tramas de 10 ms, bins de 20 cents desde 32,70 Hz | 3,09 | ONNX | no disponible en la informacion | HuggingFace, misma familia de exportaciones |
| FCPE (Scicom-intl/fcpe-onnx) | no disponible | tramas de 5 ms, bins equiespaciados 32,7–1975,5 Hz | 2,77 | ONNX | no disponible en la informacion | HuggingFace, misma familia de exportaciones |
| PESTO (Scicom-intl/pesto-onnx) | no disponible | tramas de 10 ms | no disponible (tabla truncada) | ONNX | no disponible en la informacion | HuggingFace, misma familia de exportaciones |
| pyin (librosa 0.11) | no aplica (algoritmo) | tramas de 10 ms | no disponible (tabla truncada) | no aplica | licencia de librosa | Incluido en librosa |
| UAI-Software/crepe-onnx | no disponible | no disponible | no disponible | ONNX | MIT | HuggingFace, ~90,9 MB |
| yqzhishen/onnxcrepe | no disponible | no disponible | no disponible | ONNX | no disponible en la informacion | GitHub |

En la comparativa publicada, RMVPE y FCPE obtienen mejor FFE en limpio (3,09 % y 2,77 %) que las dos variantes de CREPE evaluadas aquí, aunque la tabla está truncada y no permite comparar el resto de condiciones ni el resto de métodos. La ventaja de esta exportación es la fidelidad numérica verificada respecto al pipeline original y la ausencia de dependencias fuera de onnxruntime y NumPy.

## Limitaciones y advertencias

- Modelo monofónico: produce un único F0 por trama, por lo que en material polifónico no separa voces ni instrumentos y tenderá a seguir la fuente dominante.
- Sensibilidad al ruido: el FFE sube de 6,43 % a 9,48 % en `full` con ruido rosa a 0 dB SNR, y el VR cae de 84,63 % a 66,77 %; en condiciones adversas la tasa de tramas mal clasificadas como voz/no voz se dispara.
- Umbrales de sonoridad (0,61 y 0,58) calibrados únicamente sobre habla de PTDB-TUG con hablantes de desarrollo; su transferencia a canto, instrumentos, voces infantiles o habla patológica no está validada en la información disponible.
- Resolución temporal de 10 ms (trama de 64 ms): no adecuada para transitorios rápidos ni para vibrato de alta frecuencia sin postprocesado específico.
- Requiere audio mono a 16 kHz; el remuestreo corre por cuenta del usuario (el ejemplo usa `soxr`) y una frecuencia distinta altera por completo la escala de F0.
- El proceso de decodificación (media ponderada de los 9 bins alrededor del pico) es específico de la familia: los bins de FCPE están equiespaciados y no siguen la escala de 20 cents de CREPE, por lo que mezclar scripts entre modelos produce resultados incorrectos.
- `crepe-full` no es apto para tiempo real en CPU de un solo hilo (RTF 2,09); conviene `tiny` o paralelismo/GPU.
- No se documentan en la información disponible los datos de entrenamiento originales ni posibles sesgos acústicos (idioma, género, edad, tipo de micrófono); la única evaluación publicada cubre 16 hablantes de una base de datos concreta.
- Licencia MIT declarada en el repositorio: permite uso comercial y modificación, pero conviene verificar la cadena de licencias del modelo original CREPE y de `torchcrepe` antes de redistribuir en producción.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta y creado muy recientemente: no hay evidencia de uso en producción ni mantenimiento a largo plazo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Scicom-intl/crepe-onnx
- Exportaciones de la misma familia: https://huggingface.co/Scicom-intl/rmvpe-onnx · https://huggingface.co/Scicom-intl/fcpe-onnx · https://huggingface.co/Scicom-intl/pesto-onnx
- Script de inferencia `pitch_onnx.py`: https://huggingface.co/Scicom-intl/crepe-onnx/blob/main/pitch_onnx.py
- Paper original (Kim et al., CREPE: A Convolutional Representation for Pitch Estimation, ICASSP 2018), citado en la model card.
- `torchcrepe` 0.0.24, implementación PyTorch de referencia: https://github.com/maxrmorrison/torchcrepe
- Exportación ONNX alternativa (UAI-Software): https://huggingface.co/UAI-Software/crepe-onnx
- Despliegue ONNX alternativo (yqzhishen): https://github.com/yqzhishen/onnxcrepe
- Integración en R vía superassp, `trk_pitch_crepe`: https://humlab-speech.github.io/superassp/reference/trk_pitch_crepe.html
- ONNX Model Zoo: https://github.com/onnx/models
