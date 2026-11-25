# Qvisty/ordstriben-whisper-small-da

## Resumen

`Qvisty/ordstriben-whisper-small-da` es una conversión a formato sherpa-onnx con cuantización int8 del modelo `thorhojhus/whisper-small-danish`, un ajuste fino sobre `openai/whisper-small` orientado a reconocimiento automático del habla (ASR) en danés. Lo publica el desarrollador Qvisty para integrarlo en Ordstriben, una aplicación de dictado danesa que necesita funcionar sin conexión en un teléfono. No se ha realizado ningún entrenamiento adicional sobre los pesos: es exclusivamente una conversión de formato y una cuantización.

El modelo conserva la arquitectura encoder-decoder transformer de Whisper, con 242 millones de parámetros y 80 bins mel, y procesa audio en ventanas de hasta 30 segundos. La conversión se hizo con el exportador legacy de sherpa-onnx v1.13.8 (`dynamo=False`) y cuantización dinámica int8 propia del script, generando dos ficheros ONNX (encoder y decoder) más el vocabulario de tokens, con un total de aproximadamente 375 MB.

Su relevancia práctica está en que demuestra un caso de despliegue real de ASR danés en dispositivo: con los mismos ficheros int8 se obtiene un WER del 10,2 % en FLEURS `da_dk` frente al 36,0 % de un Whisper small genérico en el mismo formato, lo que evidencia el valor del ajuste fino idiomático incluso tras cuantizar a int8.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper), exportado a ONNX con cuantización int8 |
| Parametros totales | 242 M (modelo base `whisper-small`) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventanas de audio de hasta 30 segundos |
| Tipos de cuantizacion | int8 dinámica (solo se publican los ficheros int8) |
| Idiomas soportados | danés (`da`) únicamente |
| Licencia | MIT |
| Formato de pesos | ONNX int8 (`small-da-encoder.int8.onnx`, `small-da-decoder.int8.onnx`) más `small-da-tokens.txt` |

## Arquitectura y entrenamiento

La arquitectura es la de OpenAI Whisper en su variante small: un encoder que procesa espectrogramas mel de 80 bins y un decoder autorregresivo que genera tokens de texto. El modelo base `thorhojhus/whisper-small-danish` (revisión `5738a59229a5ef2a40180818860c93730568d98e`) es un ajuste fino de `openai/whisper-small` sobre datos daneses. Según la model card del modelo fuente, esos datos incluyen CoRal v3, Common Voice 26.0 (CC0), FLEURS (CC BY 4.0), FTSpeech, NST Danish (CC0) y una cantidad importante de audio danés pseudo-etiquetado de origen no especificado.

La conversión publicada no añade entrenamiento: los pesos de Hugging Face se renombraron al layout de OpenAI Whisper, se cargaron con `openai-whisper` 20250625 en modo estricto (sin tensores faltantes ni inesperados) y se exportaron con `scripts/whisper/export-onnx.py` de sherpa-onnx v1.13.8 usando el exportador TorchScript legacy (`dynamo=False`) y la cuantización int8 dinámica del propio script. Las versiones de herramientas fueron torch 2.15.0 (CPU), onnx 1.23.2, onnxruntime 1.32.0 y Python 3.13. No se documentan detalles de RLHF, DPO ni composición exacta del dataset de ajuste fino más allá de lo indicado por el modelo fuente.

## Capacidades

- Reconocimiento automático del habla en danés (`language="da"`, `task="transcribe"`) con sherpa-onnx.
- Ejecución completamente offline en dispositivo, sin necesidad de red.
- Inferencia en CPU: no requiere GPU para funcionar.
- Procesamiento de audio en ventanas de hasta 30 segundos.
- API de uso directa mediante `sherpa_onnx.OfflineRecognizer.from_whisper` con encoder, decoder y tokens.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo puramente ASR.
- No tiene capacidades de visión, audio generativo ni síntesis de voz.
- Multilingüismo: no disponible más allá del danés; el autor indica que otros idiomas no se comprobaron tras el ajuste fino.

## Casos de uso

- Dictado por voz en aplicaciones móviles: es exactamente el escenario para el que se publicó, ya que los ficheros int8 de ~375 MB permiten ejecución local en un teléfono sin conexión, integrados mediante sherpa-onnx.
- Transcripción de reuniones y notas de voz en danés: el modelo procesa clips de hasta 30 segundos, adecuado para segmentar audio y transcribir por fragmentos en un pipeline local.
- Subtitulado de contenido audiovisual danés: al ser offline y ligero, puede ejecutarse en un servidor modesto o en el propio dispositivo para generar subtítulos sin enviar audio a terceros.
- Procesamiento por lotes de archivos de audio en danés: con sherpa-onnx en CPU, se pueden transcribir grandes volúmenes sin depender de APIs externas; el autor midió ~4,1 segundos por clip de 12 segundos en una CPU cloud de 4 núcleos.
- Investigación en ASR de bajos recursos: sirve como referencia de cuantización int8 de un Whisper small ajustado a un idioma concreto, con métricas WER/CER publicadas sobre FLEURS.
- Prototipado de asistentes de voz locales para danés: al no requerir red ni GPU, encaja en dispositivos embebidos y aplicaciones de privacidad estricta donde el audio no puede salir del equipo.
- Evaluación comparativa de modelos ASR daneses: sus resultados en FLEURS permiten contrastar alternativas como el Whisper small genérico o la variante turbo danesa en el mismo runtime.

## Benchmarks y rendimiento

Resultados medidos por el autor sobre los ficheros int8 exactos publicados, con sherpa-onnx 2.0.3 (Python), decodificación greedy, sobre 308 grabaciones (58 minutos) del split de test FLEURS `da_dk`, cada tercera fila, con texto en minúsculas y sin puntuación antes de puntuar:

| Modelo (int8, sherpa-onnx) | WER | CER |
|---|---:|---:|
| `csukuangfj/sherpa-onnx-whisper-small` genérico | 36,0 % | 13,8 % |
| Danés small (`ordstriben-whisper-small-da`) | 10,2 % | 3,8 % |
| Danés turbo (`ordstriben-whisper-turbo-da`) | 8,6 % | 3,1 % |

El autor advierte de que el split de entrenamiento de FLEURS formó parte de los datos de entrenamiento del modelo fuente, por lo que no es una prueba completamente independiente. La model card del modelo fuente reporta 9,94 % de WER sobre el conjunto de test completo de FLEURS `da_dk`. La normalización de texto es simple y no maneja numerales, y algunos clips pueden haberse truncado por límite de tokens del decoder; los números deben tomarse como indicativos.

En velocidad, sobre una CPU cloud de 4 núcleos y 24 clips de 12 segundos de media, el modelo tardó aproximadamente 4,1 segundos por clip. No se han medido velocidad ni consumo de memoria en teléfono.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el caso principal, ya que el modelo está pensado para CPU; en GPU, los ficheros int8 de ~375 MB caben holgadamente en cualquier GPU con más de 1 GB de memoria.
- GPU recomendadas: no se especifican; el autor no documenta despliegue en GPU. Cualquier GPU consumer moderna (RTX 3060 o superior) podría ejecutarlo, pero no hay cifras publicadas.
- Cabe en GPU consumer: sí, por tamaño, aunque el caso de uso declarado es CPU y móvil.
- Opciones de despliegue: sherpa-onnx (runtime oficial del formato publicado), con API Python `OfflineRecognizer.from_whisper`; también existen bindings de sherpa-onnx para C++, Kotlin, Swift y otras plataformas, aunque el autor solo documenta el uso en Python.
- Latencia y throughput: ~4,1 segundos por clip de 12 segundos en CPU cloud de 4 núcleos (24 clips medidos); sin datos de throughput agregado ni de rendimiento en dispositivo móvil.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER FLEURS da_dk (int8) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ordstriben-whisper-small-da` | 242 M | 30 s de audio | 10,2 % (medición del autor) | MIT | Hugging Face, formato sherpa-onnx int8 |
| `ordstriben-whisper-turbo-da` | no disponible | no disponible | 8,6 % (misma medición) | no disponible en la información | Hugging Face |
| `csukuangfj/sherpa-onnx-whisper-small` (genérico) | 242 M (Whisper small) | 30 s de audio | 36,0 % (misma medición) | no disponible en la información | Hugging Face, sherpa-onnx |
| `thorhojhus/whisper-small-danish` (fuente) | 242 M | 30 s de audio | 9,94 % (test completo, según el autor) | MIT | Hugging Face, pesos originales |

## Limitaciones y advertencias

- Solo danés: el autor no comprobó otros idiomas tras el ajuste fino, por lo que el comportamiento multilingüe es desconocido y no recomendable.
- Ventana de audio limitada a 30 segundos por inferencia; audios más largos requieren segmentación externa.
- El silencio, el ruido y los nombres poco frecuentes pueden producir transcripciones incorrectas.
- La cuantización int8 puede reducir ligeramente la precisión respecto a los pesos originales.
- Riesgo de alucinación inherente a los modelos Whisper, especialmente en tramos de silencio o ruido.
- La normalización de texto empleada en la evaluación es simple y no gestiona numerales, lo que afecta a la interpretación de las métricas.
- La licencia MIT cubre los pesos, pero no altera los términos de los datos de entrenamiento del modelo fuente. CoRal exige que las restricciones de uso sigan al modelo: no usar para síntesis de voz que imite a una persona concreta, suplantación de identidad ni inferencia de rasgos como género, edad o salud.
- FTSpeech se basa en grabaciones del Parlamento danés (Folketinget), sujetas a sus términos; el Folketinget no respalda este modelo ni ningún producto que lo use.
- Parte del audio de entrenamiento del modelo fuente es pseudo-etiquetado y de origen no declarado, lo que introduce incertidumbre sobre la procedencia de los datos.
- Antes de redistribuir o usar comercialmente, el autor recomienda revisar personalmente los términos anteriores; la model card no constituye asesoramiento legal.
- Solo se publican los ficheros int8; para los pesos originales hay que acudir al repositorio fuente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Qvisty/ordstriben-whisper-small-da
- Modelo fuente: https://huggingface.co/thorhojhus/whisper-small-danish
- Modelo base original de OpenAI: https://huggingface.co/openai/whisper-small
- Repositorio sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
- Whisper genérico en sherpa-onnx: https://huggingface.co/csukuangfj/sherpa-onnx-whisper-small
- Dataset CoRal v3 y su licencia: https://huggingface.co/datasets/CoRal-project/coral-v3
- Términos de retransmisión del Folketinget: https://www.ft.dk/da/aktuelt/tv-fra-folketinget/deling-og-rettigheder
- Paper de Whisper (Radford et al., 2022): https://arxiv.org/abs/2212.04356
