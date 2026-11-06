# Scicom-intl/pesto-onnx

## Resumen

PESTO-ONNX es la exportación a formato ONNX del modelo PESTO (Pitch Estimation with Self-supervised Transposition-equivariant Objective), un estimador de frecuencia fundamental (F0) para voz y audio monofónico desarrollado originalmente por Sony CSL París y presentado en ISMIR 2023 (con extensión en TISMIR 2025). El modelo emplea un objetivo auto-supervisado de equivarianza a la transposición, lo que le permite aprender representaciones de pitch sin necesidad de anotaciones de F0 durante el entrenamiento. Esta versión concreta ha sido exportada y empaquetada por Scicom International.

El modelo es extremadamente compacto: 2,2 millones de parámetros y 8,8 MB de pesos. Su principal innovación práctica es que incluye el front-end completo (la transformada CQT armónica, el logaritmo de magnitud y la decodificación de pitch) dentro del grafo ONNX, de modo que el usuario solo necesita alimentar audio mono a 16 kHz y recibe directamente F0, confianza y activaciones, sin dependencias de PyTorch ni de librosa. Esto elimina discrepancias entre la implementación de referencia y el despliegue.

Es relevante para pipelines de análisis de voz en producción (prosodia, entonación, corrección tonal, análisis musical) donde se necesita una estimación de F0 ligera, rápida en CPU y verificada frame a frame contra la implementación original en PyTorch.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal con front-end CQT armónica integrado en el grafo; decodificación de saliencia tipo CREPE (384 bins) |
| Parametros totales | 2,2 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (procesa audio por frames; salida de T = N // 160 + 1 frames a 10 ms) |
| Tipos de cuantizacion | no disponible (pesos ONNX en precisión original; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (el modelo es agnóstico al idioma; opera sobre señal acústica) |
| Licencia | LGPL-3.0 |
| Formato de pesos | ONNX (`pesto.onnx`, 8,8 MB), ejecutable con onnxruntime |

## Arquitectura y entrenamiento

PESTO se entrena con un objetivo auto-supervisado de equivarianza a la transposición: el modelo aprende a producir representaciones de pitch que se desplazan de forma consistente cuando la señal de audio se transpone, sin requerir etiquetas de F0. El checkpoint exportado es `mir-1k_g7` de la librería `pesto-pitch` 2.0.1, con paso de 10 ms. La arquitectura incluye una transformada CQT armónica como front-end, seguida de un cálculo de log-magnitud y una decodificación de saliencia de 384 bins (el decoder aplica una media ponderada por saliencia de los 9 bins alrededor del pico).

La exportación a ONNX (torch 2.8, exportador legacy, opset 17) sustituye la STFT por dos `conv1d` con kernels DFT fijos, ya que la salida compleja de `torch.stft` no se exporta correctamente; el resultado es equivalente a `torch.stft` hasta el redondeo en float32. La verificación de paridad contra el pipeline original en PyTorch reporta una diferencia máxima de saliencia de 2,20e-04, una diferencia máxima de pitch de 0,00764 cents y una coincidencia de voicing del 100,0 % sobre 2696 frames (4 clips: voz de tres longitudes y 3 s de ruido). El umbral de voicing por defecto es 0,12 (elegido sobre hablantes de desarrollo de PTDB-TUG; el valor por defecto original era 0,5).

## Capacidades

- Estimación de F0 (frecuencia fundamental) por frame a paso de 10 ms sobre audio mono a 16 kHz.
- Detección de voicing (marcado de frames sonoros/no sonoros) con umbral configurable.
- Salida de confianza por frame y activaciones de saliencia de 384 dimensiones.
- Procesamiento robusto en condiciones de ruido (blanco y rosa) a 10 dB y 0 dB de SNR.
- Inferencia sin dependencias de PyTorch ni librosa: solo onnxruntime y numpy.
- Front-end CQT integrado en el grafo, lo que garantiza paridad exacta con la implementación de referencia.
- No soporta tool calling, agentes, visión, audio generativo ni razonamiento multi-paso: es un modelo acústico especializado de regresión de pitch.

## Casos de uso

- Análisis prosódico en investigación lingüística: extracción de contornos de F0 por frame (10 ms) para estudiar entonación, acentos y curvas melódicas en corpus de habla, con salida directa de f0, voiced y confidence lista para análisis estadístico.
- Corrección tonal en producción musical: estimación de pitch de voces monofónicas para afinar grabaciones o generar curvas de corrección, aprovechando el bajo coste computacional (RTF de 0,0197 con 4 hilos) para procesar pistas completas en segundos.
- Análisis de voz en tiempo real en el borde (edge): el modelo de 8,8 MB cabe en dispositivos con recursos limitados y se ejecuta solo con onnxruntime, lo que permite integrarlo en aplicaciones de escritorio o móviles sin stack de PyTorch.
- Detección de anomalías vocales y seguimiento de salud vocal: el contorno de F0 y la tasa de voicing pueden alimentar sistemas de seguimiento de fatiga vocal o disfonía en aplicaciones clínicas o de bienestar, con la ventaja de que el modelo es determinista y verificable.
- Enseñanza de idiomas y entrenamiento de pronunciación: comparación del contorno F0 del alumno con el de referencia para dar retroalimentación sobre tono y entonación, usando la salida de confianza para filtrar frames poco fiables.
- Preprocesado en pipelines de síntesis de voz (TTS) y conversión de voz: extracción de F0 como característica intermedia para modelos de prosodia o de conversión de estilo, con la ventaja de que el front-end CQT está integrado y no requiere replicar la STFT.
- Benchmarking y validación de otros estimadores de pitch: el paquete incluye `benchmark.json` y el arnés `export/evaluate.py`, lo que permite reproducir la comparación contra RMVPE, FCPE, CREPE y pyin sobre PTDB-TUG.

## Benchmarks y rendimiento

Resultados sobre los 16 hablantes de test de PTDB-TUG (400 enunciados por condición), en porcentaje. FFE (F0 frame error) es la métrica principal: errores de voicing más errores graves de pitch (>20 %) sobre el total de frames; menor es mejor.

| Condición | RMVPE | FCPE | CREPE full | CREPE tiny | PESTO | pyin (librosa 0.11) |
|---|---|---|---|---|---|---|
| clean | 3,09 | **2,77** | 6,43 | 6,33 | 5,58 | 7,72 |
| ruido blanco 10 dB | 3,18 | **2,95** | 5,98 | 6,07 | 5,99 | 8,32 |
| ruido blanco 0 dB | 3,56 | **3,39** | 6,92 | 7,21 | 7,46 | 16,92 |
| ruido rosa 10 dB | 3,48 | **3,30** | 6,59 | 6,41 | 6,54 | 8,36 |
| ruido rosa 0 dB | **4,47** | 4,78 | 9,48 | 9,31 | 8,99 | 17,18 |

Métricas detalladas de PESTO por condición (en %):

| Condición | RPA ↑ | RCA ↑ | GPE ↓ | VDE ↓ | FFE ↓ | VR ↑ | VFA ↓ |
|---|---|---|---|---|---|---|---|
| clean | 71,97 | 74,43 | 6,66 | 4,13 | **5,58** | 91,23 | 2,68 |
| ruido blanco 10 dB | 69,33 | 71,69 | 6,52 | 4,64 | **5,99** | 86,67 | 1,92 |
| ruido blanco 0 dB | 63,42 | 65,73 | 6,86 | 6,19 | **7,46** | 77,97 | 1,23 |
| ruido rosa 10 dB | 66,86 | 69,34 | 6,34 | 5,30 | **6,54** | 82,66 | 1,53 |
| ruido rosa 0 dB | 57,82 | 61,18 | 9,33 | 7,38 | **8,99** | 72,46 | 1,07 |

Velocidad en CPU (onnxruntime, CPU de servidor x86; RTF = segundos de cómputo por segundo de audio; RSS pico del proceso Python completo, librosa y numpy incluidos):

| Hilos | Audio | RTF | RSS pico |
|---|---|---|---|
| 1 | 10 s | 0,0736 | 488 MB |
| 4 | 10 s | 0,0197 | 481 MB |
| 1 | 30 s | 0,0757 | 946 MB |

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo corre en CPU con onnxruntime y solo 8,8 MB de pesos.
- GPU recomendadas: no necesarias; cualquier GPU compatible con onnxruntime puede usarse, pero el modelo está optimizado para CPU.
- Cabe en cualquier GPU de consumo (RTX 4090, RTX 3060, etc.) e incluso en dispositivos embebidos, dado su tamaño de 2,2 M de parámetros.
- Opciones de despliegue: onnxruntime (librería declarada), con el script `pitch_onnx.py` del propio repositorio (numpy + onnxruntime). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: RTF de 0,0736 con 1 hilo y 0,0197 con 4 hilos para audio de 10 s; RTF de 0,0757 con 1 hilo para audio de 30 s. RSS pico de aproximadamente 481-488 MB para 10 s y 946 MB para 30 s (incluyendo el proceso Python completo).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / paso | FFE clean (PTDB-TUG) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PESTO (este) | 2,2 M | frames de 10 ms | 5,58 | LGPL-3.0 | ONNX en Hugging Face |
| FCPE | no disponible | no disponible | **2,77** | no disponible | ONNX en la misma familia (Scicom-intl/fcpe-onnx) |
| RMVPE | no disponible | no disponible | 3,09 | no disponible | ONNX en la misma familia (Scicom-intl/rmvpe-onnx) |
| CREPE full | no disponible | no disponible | 6,43 | no disponible | ONNX en la misma familia (Scicom-intl/crepe-onnx) |
| CREPE tiny | no disponible | no disponible | 6,33 | no disponible | ONNX en la misma familia |
| pyin (librosa 0.11) | no aplica (algoritmo) | frames de 10 ms | 7,72 | no disponible | Librería librosa |

FCPE y RMVPE superan a PESTO en precisión de FFE en todas las condiciones evaluadas; PESTO se sitúa por delante de CREPE full, CREPE tiny y pyin en la mayoría de condiciones, y es especialmente competitivo en ruido rosa a 0 dB (8,99 frente a 9,48 de CREPE full y 9,31 de CREPE tiny).

## Limitaciones y advertencias

- Precisión inferior a FCPE y RMVPE en todas las condiciones de PTDB-TUG; si la prioridad es la exactitud de F0, esos modelos de la misma familia son mejores opciones.
- Diseñado para audio monofónico: no se documenta comportamiento en señales polifónicas ni en mezclas musicales complejas.
- Requiere audio mono a 16 kHz; el usuario debe remuestrear y convertir a mono antes de la inferencia (el ejemplo usa soxr).
- El umbral de voicing por defecto es 0,12, distinto del 0,5 original de PESTO; debe revisarse según el dominio de aplicación.
- El modelo es agnóstico al idioma, pero la evaluación se ha realizado únicamente sobre PTDB-TUG (habla inglesa de laboratorio); no hay datos de otros idiomas ni de habla espontánea.
- No se documentan sesgos demográficos ni evaluación por género, edad o acento; los resultados se limitan a los 16 hablantes de test de PTDB-TUG.
- Licencia LGPL-3.0: el uso comercial es posible, pero las modificaciones del modelo o del código derivado deben distribuirse bajo la misma licencia y cumplir las obligaciones de la LGPL (incluida la posibilidad de enlazar versiones modificadas de la biblioteca).
- No es un modelo generativo: no produce texto, código ni razonamiento; su uso fuera de la estimación de F0 no está soportado.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica poca validación comunitaria externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Scicom-intl/pesto-onnx
- Repositorio de la familia de exports ONNX: https://huggingface.co/Scicom-intl/rmvpe-onnx, https://huggingface.co/Scicom-intl/fcpe-onnx, https://huggingface.co/Scicom-intl/crepe-onnx
- Repositorio original de PESTO (Sony CSL París): https://github.com/SonyCSLParis/pesto
- Paper PESTO (ISMIR 2023): Riou et al., "PESTO: Pitch Estimation with Self-supervised Transposition-equivariant Objective"
- Extensión TISMIR 2025: Riou et al., TISMIR 2025 (referenciada en la model card)
- Script de inferencia: `pitch_onnx.py` (incluido en el repositorio de Hugging Face)
- Scripts de exportación y evaluación: `export/export.py`, `export/decode.py`, `export/evaluate.py` (incluidos en el repositorio)
- Resultados de benchmark: `benchmark.json` (incluido en el repositorio)
