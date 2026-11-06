# Scicom-intl/fcpe-onnx

## Resumen

FCPE (Fast Context-based Pitch Estimation) es un modelo de estimación de frecuencia fundamental (F0) desarrollado originalmente por CNChTu y empaquetado en formato ONNX por Scicom-intl. Resuelve el problema de la detección de pitch en audio de voz de forma precisa y ligera, empleando una arquitectura conformer que opera sobre un espectrograma log-mel de 128 bandas. El modelo original se distribuye en el paquete `torchfcpe` (versión 0.0.4, checkpoint `fcpe_c_v001`), y esta versión ONNX integra el front-end completo (STFT y mel) dentro del grafo, de modo que el consumidor solo necesita proporcionar audio mono a 16 kHz.

Con 10,8 millones de parámetros y un tamaño de 47,8 MB, el modelo está pensado para despliegue en CPU con onnxruntime, sin dependencias de PyTorch ni de librosa. La exportación se validó frame a frame contra la pipeline original de PyTorch, con una diferencia máxima de saliencia de 3,84e-06 y una concordancia de voicing del 100 %. Su relevancia actual radica en que ofrece estimación de F0 de alta calidad (FFE de 2,77 % en condiciones limpias sobre PTDB-TUG) con un coste computacional muy bajo (RTF de 0,0068 con 4 hilos).

La ficha se basa exclusivamente en la model card y los metadatos disponibles en Hugging Face; los datos no publicados se indican como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Conformer sobre log-mel de 128 bandas (front-end STFT/mel integrado en el grafo ONNX) |
| Parámetros totales | 10,8 M |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (procesa audio de duración variable; salida de 1 frame cada 10 ms) |
| Tipos de cuantización | No disponible (el repo solo distribuye `fcpe.onnx` en float32) |
| Idiomas soportados | No disponible (modelo acústico independiente del idioma) |
| Licencia | MIT (pesos originales CNChTu/FCPE, Copyright (c) 2023 CN_ChiTu; conversión ONNX por Scicom) |
| Formato de pesos | ONNX (`fcpe.onnx`, 47,8 MB) |
| Entrada | `audio` float32 [1, N], 16 kHz mono |
| Salida | `salience` float32 [1, T, 360], T = N // 160 + 1 frames |
| Resolución temporal | 10 ms por frame, centrado en i × 10 ms + 5 ms |

## Arquitectura y entrenamiento

El modelo es un conformer que opera sobre un espectrograma log-mel de 128 bandas Slaney (0–8000 Hz). El front-end incluido en el grafo ONNX replica la pipeline de `torchfcpe`: padding reflectivo de 432 muestras, STFT no centrada con `n_fft` 1024 y hop 160, 128 mels Slaney, clamp logarítmico a 1e-5 y repetición del último frame. La STFT se implementa como dos `conv1d` con kernels DFT fijos (la salida compleja de `torch.stft` no es exportable), equivalentes a `torch.stft` hasta el redondeo de float32. La exportación se realizó con torch 2.8, exportador legacy ONNX, opset 17.

La salida es una matriz de saliencia de 360 bins distribuidos uniformemente entre 32,7 y 1975,5 Hz (a diferencia de CREPE/RMVPE, cuyos bins están espaciados 20 cents). El decodificador aplica la media ponderada por saliencia de los 9 bins alrededor del pico y un umbral de voicing de 0,33, elegido sobre los hablantes de desarrollo de PTDB-TUG para minimizar el error de frame F0 (el valor por defecto upstream es 0,006). No se dispone de información sobre el dataset de entrenamiento, número de tokens, composición ni uso de RLHF/DPO en la información proporcionada.

## Capacidades

- Estimación de frecuencia fundamental (F0) por frame a partir de audio de voz mono a 16 kHz.
- Detección de voicing (frames sonoros/no sonoros) con umbral configurable.
- Salida de confianza por frame junto con F0 y decisión de voicing.
- Robusto a ruido blanco y rosa en distintos niveles de SNR (evaluado a 10 dB y 0 dB).
- Funcionamiento sin dependencias de PyTorch, librosa ni implementaciones externas de STFT/mel.
- Ejecución en CPU con onnxruntime y numpy únicamente.
- No soporta tool calling, function calling, agentes, visión, audio de entrada distinto de voz ni razonamiento multi-paso: es un modelo acústico especializado.
- Capacidades multilingües: no aplica de forma directa; el modelo es independiente del idioma al operar sobre características acústicas.

## Casos de uso

- Análisis prosódico en investigación lingüística: extracción de contornos de F0 frame a frame (cada 10 ms) para estudios de entonación, acento y ritmo en corpus de habla, con la ventaja de que el front-end integrado garantiza reproducibilidad sin depender de versiones de librosa.
- Corrección de pitch en producción musical y doblaje: integración en pipelines de edición de voz para detectar y corregir desafinaciones, aprovechando la resolución de 10 ms y la baja latencia (RTF 0,0068 con 4 hilos).
- Análisis de voz clínica y logopedia: seguimiento de parámetros de F0 en sesiones de terapia vocal, donde la robustez frente a ruido de fondo (FFE 2,95 % a 10 dB de ruido blanco) permite su uso en entornos no insonorizados.
- Preprocesado para sistemas de conversión de voz (voice conversion) y síntesis: generación de contornos F0 de referencia para modelos de TTS y VC que requieren pitch como condición de entrada.
- Detección de actividad vocal y segmentación de habla: uso de la salida de voicing para separar tramos sonoros y silencios en pipelines de diarización o transcripción, con umbral ajustable según el dominio.
- Monitorización de calidad de audio en llamadas: estimación de F0 en tiempo real sobre CPU para detectar anomalías vocales o degradación de la señal en sistemas de telefonía y VoIP.
- Herramientas educativas de música y entrenamiento vocal: visualización del contorno de pitch en aplicaciones de escritorio o web (vía onnxruntime) para feedback en tiempo real al usuario.

## Benchmarks y rendimiento

Resultados de F0 frame error (FFE, %, menor es mejor) sobre los 16 hablantes de test de PTDB-TUG (400 enunciados por condición). Los hablantes F01, F02, M01 y M02 se usaron solo para elegir umbrales de voicing y lag de frame.

| Condición | RMVPE | FCPE | CREPE full | CREPE tiny | PESTO | pyin (librosa 0.11) |
|---|---|---|---|---|---|---|
| Limpio | 3,09 | **2,77** | 6,43 | 6,33 | 5,58 | 7,72 |
| Ruido blanco 10 dB | 3,18 | **2,95** | 5,98 | 6,07 | 5,99 | 8,32 |
| Ruido blanco 0 dB | 3,56 | **3,39** | 6,92 | 7,21 | 7,46 | 16,92 |
| Ruido rosa 10 dB | 3,48 | **3,30** | 6,59 | 6,41 | 6,54 | 8,36 |
| Ruido rosa 0 dB | **4,47** | 4,78 | 9,48 | 9,31 | 8,99 | 17,18 |

Métricas detalladas de FCPE en PTDB-TUG (%): RPA, RCA, GPE, VDE, FFE, VR y VFA por condición.

| Condición | RPA ↑ | RCA ↑ | GPE ↓ | VDE ↓ | FFE ↓ | VR ↑ | VFA ↓ |
|---|---|---|---|---|---|---|---|
| Limpio | 91,83 | 92,57 | 1,14 | 2,51 | 2,77 | 94,49 | 1,58 |
| Ruido blanco 10 dB | 90,95 | 91,79 | 1,26 | 2,67 | 2,95 | 93,74 | 1,55 |
| Ruido blanco 0 dB | 89,10 | 90,02 | 1,43 | 3,07 | 3,39 | 92,46 | 1,67 |
| Ruido rosa 10 dB | 90,04 | 91,12 | 1,56 | 2,95 | 3,30 | 93,48 | 1,83 |
| Ruido rosa 0 dB | 84,69 | 85,99 | 1,97 | 4,36 | 4,78 | 89,63 | 2,47 |

Velocidad en CPU (onnxruntime, servidor x86; RTF = segundos de cómputo por segundo de audio; RSS pico incluye todo el proceso Python con librosa y numpy):

| Hilos | Audio | RTF | RSS pico |
|---|---|---|---|
| 1 | 10 s | 0,0219 | 358 MB |
| 4 | 10 s | 0,0068 | 357 MB |
| 1 | 30 s | 0,0214 | 427 MB |

Paridad con la pipeline original de PyTorch: 4 clips (voz de tres duraciones y 3 s de ruido, 2696 frames), diferencia máxima de saliencia 3,84e-06, diferencia máxima de pitch 0,00029 cents y concordancia de voicing del 100,0 %.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el caso principal; el modelo está diseñado para CPU. En GPU, el peso de 47,8 MB en float32 ocupa menos de 100 MB de VRAM.
- GPU recomendadas: cualquier GPU moderna con soporte de onnxruntime (por ejemplo, RTX 4090, A100, H100) si se desea aceleración; no se han publicado cifras de throughput en GPU.
- Cabe en GPU consumer: sí, con un consumo de memoria despreciable (inferior a 100 MB en float32).
- Opciones de despliegue: onnxruntime (CPU o GPU), con `pitch_onnx.py` como wrapper de referencia basado en numpy y onnxruntime. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: RTF de 0,0219 con 1 hilo y 0,0068 con 4 hilos en CPU x86 (10 s de audio); RTF de 0,0214 con 1 hilo para 30 s de audio. RSS pico de 357–427 MB incluyendo el proceso Python completo.
- Dependencias de ejecución: `onnxruntime`, `numpy`, `soundfile`, `soxr` y `huggingface_hub` (según el ejemplo de la model card).

## Comparativa con modelos similares

Comparativa de la familia de modelos de estimación de pitch empaquetados en ONNX por Scicom-intl y alternativas de referencia. Los datos de FFE corresponden a PTDB-TUG en condición limpia.

| Modelo | Parámetros | Formato | Licencia | FFE limpio (%) | Disponibilidad |
|---|---|---|---|---|---|
| FCPE (este) | 10,8 M | ONNX | MIT | 2,77 | Hugging Face (Scicom-intl/fcpe-onnx) |
| RMVPE | No disponible | ONNX | No disponible | 3,09 | Hugging Face (Scicom-intl/rmvpe-onnx) |
| CREPE full | No disponible | ONNX | No disponible | 6,43 | Hugging Face (Scicom-intl/crepe-onnx) |
| CREPE tiny | No disponible | ONNX | No disponible | 6,33 | Hugging Face (Scicom-intl/crepe-onnx) |
| PESTO | No disponible | ONNX | No disponible | 5,58 | Hugging Face (Scicom-intl/pesto-onnx) |
| pyin (librosa 0.11) | No aplica (algoritmo) | Biblioteca Python | BSD (librosa) | 7,72 | PyPI |

FCPE obtiene el mejor FFE en cuatro de las cinco condiciones evaluadas, cediendo solo ante RMVPE en ruido rosa a 0 dB (4,78 frente a 4,47). No se dispone de datos de parámetros, contexto ni licencia de los modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en estimación de F0 y voicing; no genera texto, no razona y no soporta tool calling ni agentes.
- Entrada restringida a audio mono a 16 kHz; no se documenta comportamiento con otras frecuencias de muestreo ni con audio multicanal sin remuestreo previo.
- Rango de F0 cubierto por los 360 bins: 32,7–1975,5 Hz; pitches fuera de ese rango no pueden representarse.
- El umbral de voicing por defecto en el wrapper es 0,33, distinto del 0,006 upstream; debe revisarse para dominios distintos de PTDB-TUG.
- Rendimiento degradado en ruido rosa a 0 dB (FFE 4,78 %, VDE 4,36 %), superado por RMVPE en esa condición.
- No se han publicado datos sobre sesgos, composición del dataset de entrenamiento ni evaluación en idiomas distintos del alemán de PTDB-TUG.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de errores de pitch (GPE de 1,14 % en limpio) y de decisiones de voicing incorrectas (VFA de 1,58 % en limpio).
- Licencia MIT permite uso comercial, pero se recomienda conservar la atribución a CNChTu/FCPE y a Scicom por la conversión.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de adopción en producción.
- Solo se distribuye un archivo float32; no hay versiones cuantizadas documentadas, lo que limita optimizaciones adicionales de tamaño.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Scicom-intl/fcpe-onnx
- Repositorio de la familia ONNX: https://huggingface.co/Scicom-intl/rmvpe-onnx
- Repositorio de la familia ONNX: https://huggingface.co/Scicom-intl/crepe-onnx
- Repositorio de la familia ONNX: https://huggingface.co/Scicom-intl/pesto-onnx
- Código original de FCPE (CNChTu): https://github.com/CNChTu/FCPE
- Paquete `torchfcpe` (versión 0.0.4, checkpoint `fcpe_c_v001`): no disponible como enlace directo en la información proporcionada
- Script de exportación (`export/export.py`) y evaluación (`export/evaluate.py`): referenciados en la model card, sin URL directa disponible
- Resultados completos de benchmarks (`benchmark.json`): referenciado en la model card, sin URL directa disponible
