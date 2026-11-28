# elemusic/elemusic-voicedetect-v1

## Resumen

`elemusic-voicedetect-v1` es un detector neuronal compacto de voz humana, habla y canto en mezclas musicales, desarrollado por eleMusic Inc. (eleMusic Labs). Resuelve un problema concreto de los pipelines de generación musical: los modelos generativos de música instrumental filtran con frecuencia vocalizaciones sin letra, formantes corales o sílabas habladas en renders que deberían ser puramente instrumentales, y los clasificadores de eventos sonoros preentrenados en AudioSet confunden solos de saxo, flauta o sintetizador con voces. Este modelo puntúa ventanas de 3,0 s en tres etiquetas independientes: `voice` (cualquier voz humana), `speech` (habla) y `sing` (canto).

La arquitectura es una CNN 2D con bloques Residual Squeeze-and-Excitation y pooling temporal multi-escala atencional, con solo 1.668.659 parámetros y un peso de 6,38 MiB en FP32. Trabaja a 16 kHz sobre ventanas de 3,0 s y consume tres canales de características log-mel: el stem vocal separado, la mezcla completa y la energía relativa entre ambos.

Su relevancia actual radica en la procedencia auditable de los datos de entrenamiento: se entrenó desde inicialización aleatoria exclusivamente con audio `CC BY 4.0`, `CC0 1.0` y sintético propio, sin YouTube, sin AudioSet, sin MUSDB18 y sin destilación de profesor. Esto lo hace apto para uso comercial bajo Apache 2.0 sin las ambigüedades de licencia habituales en clasificadores de audio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | CNN 2D con bloques Residual Squeeze-and-Excitation, colapso frecuencial aprendido de 8 bandas, convolución de contexto temporal agrupada y pooling atencional multi-escala (estadísticas + top-4 de picos) |
| Parámetros totales | 1.668.659 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | ventanas de 3,0 s a 16 kHz (48.000 muestras); 38 frames temporales (~80 ms de resolución) tras el backbone |
| Tipos de cuantización | no disponible (pesos publicados en FP32; no se documentan variantes GGUF, INT8 ni FP16) |
| Idiomas soportados | en (inglés; la detección de voz y canto es inherentemente independiente del idioma, pero solo se declara inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (6,38 MiB, FP32) |

## Arquitectura y entrenamiento

La entrada del modelo es un tensor `(B, 3, 64, 300)` por cada ventana de 3,0 s a 16 kHz. El canal 0 contiene el log-mel dB Slaney de 64 bins del stem vocal separado (calibrado para el stem `vocals` de Spleeter `4stems` de Deezer, normalizado RMS conjuntamente con la mezcla); el canal 1 contiene el log-mel dB de la mezcla estéreo convertida a mono; y el canal 2 contiene la energía relativa por bin entre stem y mezcla (`vocals_mel_db - mix_mel_db`). El backbone aplica bloques Residual Squeeze-and-Excitation con canales `40 -> 64 -> 112 -> 160`, preserva 38 frames temporales, colapsa la dimensión frecuencial a 224 canales mediante un colapso de 8 bandas aprendido y aplica una convolución de contexto temporal agrupada con ventana de ~240 ms orientada a sílabas y vibrato. La cabeza combina un head de clip y otro de frame con pooling de estadísticas atencionales y de los 4 picos más altos, produciendo logits `[voice, speech, sing]`.

El entrenamiento parte de inicialización aleatoria y usa exclusivamente VocalSet v1.1 (`CC BY 4.0`, ejercicios `scales`, `arpeggios` y `long_tones` de 20 cantantes, particionados estrictamente por ID de cantante), LibriSpeech ASR (`CC BY 4.0`, `dev-clean-2`, particionado por hablante), librerías de samples instrumentales `CC0 1.0` (VSCO 2 CE, VCSL, Karoryfer) y audio sintético propio. No hay datos de YouTube, AudioSet, ImageNet ni MUSDB18, ni destilación de profesor. La implementación incluye un resampler polifásico Hann-sinc y un banco de filtros mel Slaney en PyTorch puro, sin dependencia en tiempo de ejecución de `librosa`, `scipy` ni `torchaudio` (diferencia máxima absoluta frente a librosa de 1,86e-9).

## Capacidades

- Detección de voz humana genérica (`voice`) en mezclas musicales, con independencia de que sea habla o canto.
- Detección específica de habla (`speech`) bajo música, incluyendo casos a -10 dB y -20 dB de relación señal-música.
- Detección específica de canto (`sing`), incluyendo vocalizaciones sin letra y formantes corales.
- Discriminación frente a instrumentos solistas expresivos: saxo alto, tenor y barítono, flauta, violín, violonchelo, trompeta harmon y leads de sintetizador con barrido de formantes, sin falsos positivos en el conjunto de evaluación.
- Puntuación de ventanas de 3,0 s con salida probabilística por clip y por frame (logits `[voice, speech, sing]` vía sigmoid).
- Integración con Spleeter `4stems` como front-end de separación de stem vocal.
- Ejecución en CPU (`device="cpu"` en el ejemplo de la model card) y verificación SHA-256 automática de los pesos al descargar desde Hugging Face Hub.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio generativo: es un clasificador de audio, no un modelo de lenguaje.

## Casos de uso

- Control de calidad en generación musical instrumental: ejecutar el detector sobre cada render para rechazar o marcar automáticamente pistas que contengan vocalizaciones, coros o sílabas habladas no deseadas antes de entregar el resultado al usuario.
- Filtrado previo en pipelines de datasets musicales: clasificar grandes catálogos de audio para separar pistas estrictamente instrumentales de las que contienen voz, usando la ventana de 3,0 s como unidad de muestreo deslizante.
- Verificación de separación de fuentes: comprobar que el stem vocal extraído por Spleeter contiene realmente voz y que el stem instrumental residual está limpio, detectando fugas de voz en el acompañamiento.
- Moderación de contenido en plataformas de audio: identificar habla incrustada bajo música en subidas de usuarios, un caso que los clasificadores de eventos generales resuelven mal por confundir leads instrumentales con voz.
- Indexación y etiquetado automático de bibliotecas musicales: añadir metadatos `voice`/`speech`/`sing` por segmento para búsqueda y filtrado, con un coste computacional mínimo gracias a los 1,66 M de parámetros.
- Monitorización de emisiones de radio o podcast con música de fondo: detectar cuándo hay locución sobre música frente a interludios puramente instrumentales, con sensibilidad verificada a -20 dB bajo piano y synthwave.
- Detección de canto en aplicaciones de karaoke o práctica vocal: segmentar las partes cantadas de una mezcla para sincronizar letras o evaluar interpretación.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| Split de test retenido (n = 500 clips de 3,0 s, SNR de -22 dB a +8 dB) | 0,9467 ROC-AUC / 0,9600 PR-AUC / 97,09 % precisión |
| Recall en SNR >= -8 dB y voces solistas | 93,21 % (80,0 % en todos los SNR hasta -22 dB) |
| Tasa de falsos positivos en leads solistas duros (saxo, flauta, violín, sintetizador) | 0,0000 (0/46 test, 0/52 validación, 0/4 masters fuera de distribución) |
| Detección de habla bajo música (-10 dB y -20 dB bajo piano y synthwave) | 100 % (`voice_max` = 0,966-0,994) |
| SHA-256 de `model.safetensors` | `0abc38a9defe69b2bf9d4aa16f012ef70a4b06171b4a3fd70229c8972e24ec9c` |

No se han publicado resultados comparativos frente a otros detectores de voz o clasificadores de audio en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en FP32 para los pesos (6,38 MiB); el consumo dominante es el buffer de activaciones del backbone, del orden de decenas de MB para lotes pequeños.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria libre es suficiente; el modelo está pensado para ejecutarse incluso en CPU. No requiere A100, H100 ni RTX 4090.
- Cabe en cualquier GPU de consumo (GTX 1050, RTX 2060, RTX 3060, RTX 4090) y en Raspberry Pi o entornos sin GPU, según el ejemplo de la model card con `device="cpu"`.
- Opciones de despliegue: PyTorch nativo mediante el paquete `voicedetect` (`pip install git+https://github.com/eleMusicLabs/elemusic-voicedetect.git`) y la función `from_pretrained`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un clasificador de audio de este tamaño).
- Latencia y throughput: no disponibles en la información proporcionada. El front-end requiere ejecutar Spleeter `4stems` para obtener el stem vocal, lo que dominará el coste total del pipeline por encima del propio detector.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / ventana | Tarea | Licencia | Procedencia de datos |
|---|---|---|---|---|---|
| elemusic-voicedetect-v1 | 1,67 M | 3,0 s a 16 kHz | Voz/habla/canto en música | Apache 2.0 | CC BY 4.0, CC0 1.0 y sintético propio |
| Clasificadores PANNs (CNN14) | ~80 M | variable (típicamente 10 s) | Etiquetado de eventos sonoros AudioSet | Apache 2.0 (pesos) | AudioSet (YouTube) |
| AST (Audio Spectrogram Transformer) | ~87 M | 10 s | Clasificación de audio AudioSet | BSD-3 / MIT según variante | AudioSet (YouTube) |
| YAMNet | ~3,7 M | ~0,96 s | Eventos sonoros AudioSet (clase `Speech`, `Singing`) | Apache 2.0 | AudioSet (YouTube) |

Los tres alternativos se entrenaron sobre AudioSet, con procedencia de datos derivada de YouTube y sin evaluación específica publicada en la información disponible sobre falsos positivos en leads instrumentales solistas. `elemusic-voicedetect-v1` es el único de la comparativa con procedencia de datos auditable y con métricas publicadas de tasa de falsos positivos en saxo, flauta, violín y sintetizador.

## Limitaciones y advertencias

- Solo se declara soporte de inglés; aunque la detección acústica de voz y canto no depende estrictamente del idioma, no hay evaluación publicada en otros idiomas.
- El modelo asume un front-end de separación de fuentes (Spleeter `4stems`); el rendimiento puede degradarse si el stem vocal se obtiene con otro separador o si la separación es de baja calidad.
- La ventana de análisis es fija de 3,0 s a 16 kHz; audios más largos requieren segmentación deslizante y agregación manual de puntuaciones.
- El recall cae al 80,0 % en el rango completo de SNR hasta -22 dB; en mezclas con voz muy enterrada pueden producirse falsos negativos.
- Riesgo de alucinación no aplicable (es un clasificador, no un modelo generativo), pero sí riesgo de falsos positivos en timbres vocales sintéticos no representados en el conjunto de evaluación (0/4 masters fuera de distribución es una muestra pequeña).
- No se documentan sesgos por género, edad, acento o tipo de voz más allá de la partición por cantante y hablante de VocalSet y LibriSpeech.
- Licencia Apache 2.0 permite uso comercial sin restricciones adicionales conocidas; las atribuciones de datasets de entrenamiento se listan en la model card.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y la fecha de creación indicada (2026-11-28) es posterior a la fecha habitual de referencia: conviene verificar la vigencia y el mantenimiento del proyecto antes de adoptarlo en producción.

## Enlaces

- Hugging Face: https://huggingface.co/elemusic/elemusic-voicedetect-v1
- Repositorio GitHub: https://github.com/eleMusicLabs/elemusic-voicedetect
- Organización GitHub: https://github.com/eleMusicLabs
- Estudio web (MIDI Studio): https://elemusic.studio
- Labs: https://studio.elemusiclabs.com
- Colección en Hugging Face: https://huggingface.co/eleMusicLabs
- Dataset VocalSet v1.1 (Zenodo): https://zenodo.org/record/1203819
- Dataset LibriSpeech (OpenSLR SLR31): https://www.openslr.org/31/
- Spleeter (Deezer, MIT): https://github.com/deezer/spleeter
- VSCO 2 Community Edition: https://versilian-studios.com/vsco-community/
- Versilian Community Sample Library: https://versilian-studios.com/vcsl/
- Karoryfer Samples: https://karoryfer.substack.com/ (librerías CC0 del autor)
