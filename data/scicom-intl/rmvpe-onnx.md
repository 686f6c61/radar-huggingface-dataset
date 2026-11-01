# Scicom-intl/rmvpe-onnx

## Resumen

RMVPE en formato ONNX es la exportación del estimador de pitch vocal RMVPE (Wei et al., Interspeech 2023), tal y como se distribuye en el proyecto RVC (`lj1995/VoiceConversionWebUI`, fichero `rmvpe.pt`). Lo publica Scicom-intl como parte de una familia de exportaciones ONNX de estimadores de F0 (junto a FCPE, CREPE y PESTO). El modelo resuelve la estimación de frecuencia fundamental (F0) y decisión de sonoridad (voicing) sobre audio de voz, con robustez frente a ruido y acompañamiento musical, lo que lo hace útil en conversión de voz, análisis prosódico y pipelines de audio en producción.

La relevancia de esta versión concreta es de ingeniería: el front-end completo (STFT con reflect padding, mel de 128 bandas HTK entre 30 y 8000 Hz y el padding del U-Net a múltiplos de 32 frames) está embebido dentro del grafo ONNX. Eso significa que se alimenta audio mono a 16 kHz en float32 y se obtiene directamente la saliencia de 360 bins, sin depender de PyTorch, librosa ni de una reimplementación propia del STFT/mel que podría divergir del original.

El modelo tiene 90,5 M de parámetros y pesa 185,8 MB en el repositorio. La exportación se validó frame a frame contra el pipeline PyTorch original (2696 frames, diferencia máxima de saliencia de 5,66e-06 y 0,00020 cents en pitch, con 100 % de acuerdo en voicing) y se evaluó sobre PTDB-TUG frente a otras exportaciones de la misma familia y frente a pyin.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Deep U-Net + BiGRU sobre log-mel de 128 bandas (RMVPE) |
| Parametros totales | 90,5 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa audio continuo; salida de 1 frame cada 10 ms) |
| Tipos de cuantizacion | no disponible (pesos fp16 almacenados con Cast a fp32; el grafo calcula en fp32) |
| Idiomas soportados | no disponible (independiente del idioma: estimacion de F0 sobre audio) |
| Licencia | MIT (pesos RVC-Project; red original Dream-High/RMVPE bajo Apache-2.0) |
| Formato de pesos | ONNX (opset 17) |

## Arquitectura y entrenamiento

RMVPE es una red deep U-Net con capas BiGRU que opera sobre un espectrograma log-mel de 128 bandas y produce una representación de saliencia de 360 bins por frame. En esta exportación, la entrada es `audio` float32 de forma [1, N] a 16 kHz mono y la salida es `salience` float32 de forma [1, T, 360], con T = N // 160 + 1 frames, donde el frame *i* está centrado en *i* × 10 ms. El front-end embebido reproduce el mel de RVC: STFT centrado con reflect padding, n_fft 1024, hop 160, 128 mels HTK de 30 a 8000 Hz y clamp logarítmico en 1e-5.

La conversión a ONNX se realizó con torch 2.8 y el exportador legacy de ONNX en opset 17. Como `torch.stft` no exporta su salida compleja, el STFT se implementó como dos `conv1d` con kernels DFT fijos, equivalentes a `torch.stft` hasta el redondeo en float32. Los pesos fp16 originales se almacenan como fp16 con un Cast a fp32 delante, de modo que el cálculo se hace en fp32 con resultados idénticos bit a bit y la mitad del tamaño de fichero. No se dispone de información sobre el dataset de entrenamiento original, número de tokens ni uso de RLHF/DPO en la información proporcionada.

## Capacidades

- Estimación de frecuencia fundamental (F0) por frame, con una resolución temporal de 10 ms.
- Decisión de sonoridad (voicing) con umbral configurable; el valor 0,35 se eligió sobre los hablantes de desarrollo de PTDB-TUG y el valor por defecto original era 0,03.
- Salida de confianza por frame junto a F0 y la máscara de voicing.
- Robustez frente a ruido blanco y rosa, y frente a acompañamiento musical (modelo diseñado para música polifónica).
- Inferencia solo con numpy y onnxruntime; sin dependencia de PyTorch ni librosa en tiempo de ejecución.
- Procesamiento de audio de duración arbitraria con memoria acotada (RSS pico en torno a 1 GB en el proceso de prueba).
- No soporta tool calling, agentes, visión, audio generativo ni capacidades multilingües en el sentido de generación de texto: es un modelo acústico de una sola tarea.

## Casos de uso

- Conversión de voz (RVC y similares): RMVPE es el extractor de F0 de referencia del proyecto RVC; se usaría como primer paso del pipeline para obtener el contorno de pitch del audio fuente antes de la síntesis.
- Análisis prosódico y entonación: extraer F0 y voicing frame a frame de grabaciones de habla para estudiar curvas melódicas, pausas y acentos en corpus lingüísticos.
- Corrección de afinación en producción musical: estimar el pitch de una pista vocal con acompañamiento y aplicar corrección sobre las notas detectadas, aprovechando la robustez del modelo en música polifónica.
- Extracción de pitch para entrenamiento de modelos TTS: generar etiquetas de F0 alineadas a 10 ms para datasets de síntesis de voz, con la ventaja de que la exportación ONNX evita diferencias entre el etiquetado y la inferencia.
- Monitorización de calidad de llamadas: detectar tramos sonoros, silencios y anomalías de pitch en grabaciones telefónicas (previa remuestreo a 16 kHz) para métricas de locución.
- Despliegue en servicios sin GPU: al ejecutarse con onnxruntime sobre CPU (RTF de 0,0166 con 4 hilos en un servidor x86), encaja en microservicios de procesamiento de audio por lotes.
- Herramientas de análisis para investigación en voz: comparar contornos de F0 entre métodos (RMVPE, FCPE, CREPE, PESTO, pyin) sobre el mismo audio con una interfaz homogénea.

## Benchmarks y rendimiento

Precisión sobre los 16 hablantes de test de PTDB-TUG (400 enunciados por condición), en porcentaje:

| Condición | RPA ↑ | RCA ↑ | GPE ↓ | VDE ↓ | FFE ↓ | VR ↑ | VFA ↓ |
|---|---|---|---|---|---|---|---|
| Limpio | 91,15 | 92,09 | 1,36 | 2,78 | 3,09 | 94,34 | 1,89 |
| Ruido blanco 10 dB | 90,98 | 92,04 | 1,51 | 2,84 | 3,18 | 94,50 | 2,01 |
| Ruido blanco 0 dB | 89,04 | 90,26 | 1,76 | 3,17 | 3,56 | 93,14 | 2,01 |
| Ruido rosa 10 dB | 89,41 | 90,59 | 1,70 | 3,10 | 3,48 | 93,10 | 1,91 |
| Ruido rosa 0 dB | 84,31 | 85,57 | 1,94 | 4,05 | 4,47 | 88,98 | 1,87 |

Comparativa de F0 frame error (FFE, %, menor es mejor) frente a otros estimadores:

| Condición | RMVPE | FCPE | CREPE full | CREPE tiny | PESTO | pyin |
|---|---|---|---|---|---|---|
| Limpio | 3,09 | **2,77** | 6,43 | 6,33 | 5,58 | 7,72 |
| Ruido blanco 10 dB | 3,18 | **2,95** | 5,98 | 6,07 | 5,99 | 8,32 |
| Ruido blanco 0 dB | 3,56 | **3,39** | 6,92 | 7,21 | 7,46 | 16,92 |
| Ruido rosa 10 dB | 3,48 | **3,30** | 6,59 | 6,41 | 6,54 | 8,36 |
| Ruido rosa 0 dB | **4,47** | 4,78 | 9,48 | 9,31 | 8,99 | 17,18 |

Velocidad en CPU (onnxruntime, servidor x86; RTF = segundos de cómputo por segundo de audio; RSS pico del proceso Python completo, incluidos librosa y numpy):

| Hilos | Audio | RTF | RSS pico |
|---|---|---|---|
| 1 | 10 s | 0,0559 | 1079 MB |
| 4 | 10 s | 0,0166 | 1052 MB |
| 1 | 30 s | 0,0539 | 1089 MB |

## Requisitos de hardware

- VRAM estimada: no aplica de forma estricta; el modelo está pensado para CPU. En GPU, los 185,8 MB de pesos más activaciones de un U-Net sobre audio de duración moderada caben holgadamente en cualquier GPU con 4 GB o más.
- GPU recomendadas: no se han publicado mediciones en GPU en la información disponible. Cualquier GPU consumer (RTX 3060 en adelante) o de datacenter (A100, H100) puede ejecutar el grafo vía onnxruntime con el execution provider CUDA.
- CPU: el modelo funciona en CPU x86 con onnxruntime; con 4 hilos alcanza RTF 0,0166, es decir, unas 60 veces más rápido que tiempo real en la prueba publicada.
- Cabe en GPU consumer: sí, por tamaño de pesos; la limitación práctica es la latencia del U-Net sobre audios largos, no la memoria.
- Opciones de despliegue: onnxruntime (Python, C++, C#, Java, etc.), con el script `pitch_onnx.py` del repositorio como referencia de pre/postproceso. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: RTF de 0,0559 con 1 hilo y 0,0166 con 4 hilos sobre audio de 10 s; RTF 0,0539 con 1 hilo sobre audio de 30 s.

## Comparativa con modelos similares

| Modelo | Parámetros | Entrada | Salida | FFE limpio (PTDB-TUG) | Licencia | Formato |
|---|---|---|---|---|---|---|
| RMVPE (esta ficha) | 90,5 M | audio 16 kHz mono | saliencia 360 bins, F0 cada 10 ms | 3,09 | MIT | ONNX |
| FCPE | no disponible | audio 16 kHz mono | F0 cada 5 ms | 2,77 | no disponible | ONNX |
| CREPE full | no disponible | audio 16 kHz mono | saliencia 360 bins | 6,43 | no disponible | ONNX |
| CREPE tiny | no disponible | audio 16 kHz mono | saliencia 360 bins | 6,33 | no disponible | ONNX |
| PESTO | no disponible | audio 16 kHz mono | F0 | 5,58 | no disponible | ONNX |
| pyin (librosa 0.11) | no aplica (algoritmo) | audio | F0 | 7,72 | BSD (librosa) | implementación Python |

FCPE obtiene mejor FFE en cuatro de las cinco condiciones; RMVPE solo supera a FCPE en ruido rosa a 0 dB (4,47 frente a 4,78). Frente a CREPE, PESTO y pyin, RMVPE es claramente más preciso en todas las condiciones evaluadas.

## Limitaciones y advertencias

- Modelo de una sola tarea: no genera texto, no razona y no soporta instrucciones; cualquier uso fuera de estimación de F0/voicing es inadecuado.
- El umbral de voicing 0,35 está ajustado sobre los hablantes de desarrollo de PTDB-TUG (F01, F02, M01, M02) en audio limpio; en dominios muy distintos (canto, habla infantil, audio telefónico con codecs agresivos) puede requerir reajuste.
- El rendimiento cae de forma apreciable con ruido rosa a 0 dB (FFE 4,47 frente a 3,09 en limpio), por lo que en condiciones muy degradadas conviene aplicar reducción de ruido previa.
- La entrada debe ser mono a 16 kHz en float32; el remuestreo y la mezcla de canales corren a cargo del usuario (el ejemplo usa soxr y media de canales).
- La resolución temporal es de 10 ms por frame; no está pensada para análisis de pitch de muy corta duración ni para señales no vocales.
- No se han publicado datos sobre sesgos demográficos, acentos o tipos de voz en la información disponible; la evaluación se limita a PTDB-TUG.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de falsos positivos de voicing en tramos ruidosos o de acompañamiento instrumental.
- Licencia MIT para los pesos de RVC; la red original de Dream-High/RMVPE está bajo Apache-2.0 y se incluye como `LICENSE-RMVPE-original`. Conviene revisar ambas antes de uso comercial.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta y fue creado en 2026-10-27; es un artefacto reciente y poco contrastado por la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Scicom-intl/rmvpe-onnx
- Familia de exportaciones: https://huggingface.co/Scicom-intl/fcpe-onnx
- https://huggingface.co/Scicom-intl/crepe-onnx
- https://huggingface.co/Scicom-intl/pesto-onnx
- Paper RMVPE (Wei et al., Interspeech 2023): no disponible en la información proporcionada
- Repositorio original: https://github.com/Dream-High/RMVPE
- Proyecto RVC (VoiceConversionWebUI): https://github.com/lj1995/VoiceConversionWebUI
- Ficheros de referencia en el repo: `pitch_onnx.py`, `export/export.py`, `export/decode.py`, `export/evaluate.py`, `benchmark.json`
