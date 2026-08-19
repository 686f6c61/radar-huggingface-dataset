# LIANGXU123/DriftSE

## Resumen

DriftSE es un modelo de mejora de voz basado en un nuevo paradigma generativo denominado "drifting models", desarrollado por Liang Xu y colaboradores (Universidad Victoria de Wellington y GN Audio) y presentado como oral en Interspeech 2026. A diferencia de los enfoques tradicionales de difusión que requieren múltiples pasos de muestreo, DriftSE reformula la eliminación de ruido como un problema de equilibrio distribucional y consigue inferencia en un solo paso (1 NFE) mediante la evolución de la distribución pushforward de una función de mapeo hacia la distribución de voz limpia, guiada por un campo de deriva (drifting field).

El modelo opera en un espacio latente jerárquico auto-supervisado (HuBERT, WavLM o DistilHuBERT), lo que proporciona señales de entrenamiento estables que capturan estructura acústica y fonética. Soporta entrenamiento no pareado, lo que permite generalizar entre conjuntos de datos y géneros sin necesidad de pares ruidoso-limpio. El checkpoint principal utiliza un backbone NCSN++V2 sin embedding temporal y entrada basada en STFT complejo. El repositorio de Hugging Face contiene dos checkpoints pre-entrenados (con y sin pérdidas auxiliares) y ejemplos de audio mejorado.

La relevancia actual de DriftSE radica en que combina la calidad de los modelos generativos con la eficiencia de la inferencia en un solo paso, superando en métricas perceptuales (WV-MOS, SCOREQ) a baselines de difusión multi-paso y a métodos basados en consistencia en el conjunto de prueba ciego del DNS Challenge 2020. Su licencia MIT y su disponibilidad en código abierto lo hacen atractivo para integración en productos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NCSN++V2 (sin time embedding) con campo de deriva (drifting field) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (etiqueta del modelo) |
| Licencia | MIT |
| Formato de pesos | Checkpoints de PyTorch (.ckpt) |

## Arquitectura y entrenamiento

DriftSE se basa en un backbone NCSN++V2 sin embedding temporal, que procesa espectrogramas STFT complejos (ventana Hann de 510 puntos, hop no especificado en la información disponible). La innovación principal es el uso de un campo de deriva que evoluciona la distribución pushforward de una función de mapeo para que coincida directamente con la distribución de voz limpia, eliminando la necesidad de muestreo iterativo o de trayectorias de difusión.

El entrenamiento se realiza en un espacio latente auto-supervisado (HuBERT, WavLM o DistilHuBERT), lo que proporciona representaciones jerárquicas que capturan tanto información acústica como fonética. El modelo soporta entrenamiento no pareado, es decir, puede entrenarse con datos de voz ruidosa y limpia sin necesidad de pares alineados, lo que facilita la generalización entre conjuntos de datos y condiciones de grabación. No se especifica el número de tokens de entrenamiento ni la composición exacta del dataset, aunque la evaluación se realiza sobre VoiceBank-DEMAND (VB-DMD) y el conjunto de prueba ciego del DNS Challenge 2020. No se menciona el uso de RLHF o DPO; el entrenamiento se basa en pérdidas de distribución y, en la variante DriftSE†, en pérdidas auxiliares como PESQ, SI-SDR y CCMSE.

## Capacidades

- Mejora de voz (speech enhancement) en un solo paso de inferencia (1 NFE).
- Eliminación de ruido aditivo y no estacionario en señales de voz.
- Generalización a condiciones no vistas gracias al entrenamiento no pareado.
- Operación en espacio latente auto-supervisado (HuBERT, WavLM, DistilHuBERT) para capturar estructura acústica y fonética.
- Soporte para inferencia condicional (con señal de referencia) y sin condición.
- Capacidad de procesamiento audio-audio (entrada y salida en formato de audio).
- No se reportan capacidades de generación de texto, código, visión o tool calling; es un modelo puramente de audio.

## Casos de uso

- **Mejora de voz en llamadas VoIP y videoconferencias**: el modelo puede procesar la señal de micrófono en tiempo real (o casi tiempo real) para eliminar ruido de fondo, mejorando la inteligibilidad en entornos domésticos u oficinas. Su inferencia de un solo paso lo hace adecuado para aplicaciones de baja latencia.
- **Preprocesamiento para sistemas de reconocimiento automático del habla (ASR)**: al limpiar la señal antes de pasarla a un ASR, se reduce la tasa de error en condiciones ruidosas. DriftSE puede integrarse como módulo front-end en pipelines de transcripción.
- **Restauración de grabaciones históricas o de baja calidad**: mejora de archivos de audio antiguos con ruido de fondo, silbidos o estática, preservando la naturalidad de la voz.
- **Asistentes de voz en dispositivos domésticos**: mejora de la señal captada por micrófonos lejanos en presencia de ruido ambiental, mejorando la respuesta de asistentes como Alexa o Google Home.
- **Producción de contenido y podcasts**: limpieza de grabaciones realizadas en entornos no controlados, reduciendo ruido de fondo sin degradar la calidad percibida.
- **Aplicaciones de accesibilidad**: mejora de la voz en audífonos o sistemas de ayuda para personas con discapacidad auditiva, aumentando la claridad en entornos ruidosos.
- **Análisis forense de audio**: mejora de grabaciones de baja calidad para facilitar la transcripción o el análisis de contenido, siempre que se respeten los marcos legales aplicables.

## Benchmarks y rendimiento

Los resultados presentados en la model card se basan en la evaluación in-domain sobre VoiceBank-DEMAND (VB-DMD) y en el conjunto de prueba ciego del DNS Challenge 2020 para evaluar la generalización a condiciones reales.

### VoiceBank-DEMAND (VB-DMD) — evaluación in-domain

| Metodo | NFE | PESQ (↑) | SI-SDR (↑) | ESTOI (↑) | DNSMOS (↑) | SCOREQ (↑) |
|---|---|---|---|---|---|---|
| MetricGAN+ | 1 | 3.13 | 8.50 | 0.83 | 3.22 | 3.82 |
| UNIVERSE++ | 8 | 2.91 | 18.00 | 0.85 | 3.45 | **4.35** |
| SGMSE+ | 30 | 2.90 | 16.90 | 0.85 | 3.48 | 3.98 |
| ROSE-CD | 1 | 3.49 | 17.80 | 0.87 | 3.49 | 4.23 |
| SBCTM | 1 | **3.56** | 12.70 | 0.87 | 3.55 | **4.35** |
| MeanFlowSE | 1 | 2.81 | **19.97** | **0.88** | **3.58** | 4.25 |
| DriftSE (WavLM) | 1 | 3.03 | 14.00 | 0.85 | **3.54** | **4.17** |
| DriftSE (HuBERT) | 1 | 2.94 | 12.50 | 0.84 | 3.49 | 4.14 |
| DriftSE (DistilHuBERT) | 1 | 3.00 | 15.60 | 0.85 | 3.48 | 4.15 |
| **DriftSE† (DistilHuBERT)** | **1** | **3.45** | **20.60** | **0.87** | 3.49 | 4.11 |

† Entrenado conjuntamente con pérdidas auxiliares PESQ, SI-SDR y CCMSE.

### DNS Challenge 2020 — conjunto de prueba ciego (generalización)

| Metodo | NFE | WV-MOS (↑) | SCOREQ (↑) | SIG (↑) | BAK (↑) | OVRL (↑) |
|---|---|---|---|---|---|---|
| MetricGAN+ | 1 | 1.23 | 2.08 | 3.28 | 3.45 | 2.70 |
| UNIVERSE++ | 8 | 1.99 | 2.27 | 3.45 | 3.52 | 2.93 |
| SGMSE+ | 30 | 2.34 | **2.95** | **4.12** | **3.94** | **3.62** |
| ROSE-CD | 1 | **2.37** | 2.81 | 4.01 | 3.80 | 3.42 |
| SBCTM | 1 | 2.24 | 2.78 | 3.83 | 3.88 | 3.33 |
| MeanFlowSE | 1 | 2.20 | 2.79 | 3.88 | 3.51 | 3.21 |
| DriftSE (WavLM) | 1 | 2.62 | 2.67 | 3.85 | **3.94** | **3.42** |
| DriftSE (HuBERT) | 1 | 2.56 | 2.74 | **3.92** | 3.79 | 3.40 |
| **DriftSE (DistilHuBERT)†** | **1** | **2.65** | **2.97** | 3.78 | 3.84 | 3.31 |

Estos resultados indican que DriftSE, especialmente la variante con pérdidas auxiliares, alcanza el mejor WV-MOS en el conjunto DNS Challenge 2020, superando a métodos de difusión multi-paso como SGMSE+ y a métodos de consistencia como ROSE-CD, manteniendo un solo paso de inferencia.

## Requisitos de hardware

- No se han publicado requisitos oficiales de VRAM ni GPU en la información disponible.
- El tamaño del repositorio es de 2.3 GB, que incluye checkpoints y ejemplos de audio; el checkpoint individual tiene un peso no especificado, pero se estima que el modelo completo cabe en una GPU con al menos 8 GB de VRAM en precisión FP32 (estimación basada en el tamaño del archivo, no confirmada).
- Al ser un modelo de audio con backbone NCSN++V2, la inferencia puede ejecutarse en GPUs consumer como la RTX 3060 o superiores, pero no se dispone de datos de latencia o throughput.
- Para despliegue en producción, se recomienda usar PyTorch con GPU, aunque no se mencionan integraciones con vLLM, llama.cpp u otros motores de inferencia optimizados.
- Dado que la inferencia es de un solo paso, el coste computacional es significativamente menor que el de métodos de difusión iterativos, lo que facilita su uso en tiempo real en hardware moderado.

## Comparativa con modelos similares

La siguiente tabla compara DriftSE con otros métodos de mejora de voz de un solo paso y con métodos de difusión multi-paso, utilizando las métricas reportadas en el conjunto VB-DMD. No se dispone de información sobre el número de parámetros de cada método.

| Metodo | NFE | PESQ (↑) | SI-SDR (↑) | ESTOI (↑) | DNSMOS (↑) | SCOREQ (↑) |
|---|---|---|---|---|---|---|
| MetricGAN+ | 1 | 3.13 | 8.50 | 0.83 | 3.22 | 3.82 |
| ROSE-CD | 1 | 3.49 | 17.80 | 0.87 | 3.49 | 4.23 |
| SBCTM | 1 | **3.56** | 12.70 | 0.87 | 3.55 | **4.35** |
| MeanFlowSE | 1 | 2.81 | **19.97** | **0.88** | **3.58** | 4.25 |
| SGMSE+ | 30 | 2.90 | 16.90 | 0.85 | 3.48 | 3.98 |
| **DriftSE† (DistilHuBERT)** | **1** | 3.45 | **20.60** | 0.87 | 3.49 | 4.11 |

DriftSE† logra el mejor SI-SDR entre todos los métodos comparados y un PESQ competitivo, aunque SBCTM y MeanFlowSE obtienen mejores puntuaciones en algunas métricas perceptuales. Su principal ventaja es la combinación de un solo paso con alta calidad en SI-SDR y WV-MOS, como se observa en el conjunto DNS Challenge 2020.

## Limitaciones y advertencias

- No se han documentado sesgos específicos del modelo, pero al estar entrenado principalmente con datos en inglés (según la etiqueta del modelo), su rendimiento en otros idiomas o acentos puede verse degradado.
- Aunque el entrenamiento no pareado permite generalización, la evaluación se ha realizado principalmente en conjuntos de datos en inglés (VoiceBank-DEMAND, DNS Challenge 2020); el comportamiento en otros dominios acústicos no está garantizado.
- El modelo puede introducir artefactos o distorsiones en señales de voz muy degradadas, especialmente en condiciones extremas de ruido no estacionario.
- No se especifican limitaciones de contexto o duración máxima de audio; el procesamiento se realiza por tramas STFT, por lo que la duración está limitada por la memoria disponible.
- La licencia MIT permite uso comercial sin restricciones, pero el usuario debe verificar que los datos de entrenamiento (VoiceBank-DEMAND, etc.) no tengan restricciones adicionales de uso.
- No se han publicado resultados de pruebas de robustez frente a ataques adversarios o manipulación de audio.
- El repositorio no incluye scripts de entrenamiento completos en Hugging Face; el código está disponible en GitHub, pero la reproducibilidad total puede requerir la configuración del entorno original.

## Enlaces

- [Hugging Face: LIANGXU123/DriftSE](https://huggingface.co/LIANGXU123/DriftSE)
- [GitHub: LiangXu123/DriftSE](https://github.com/LiangXu123/DriftSE)
- [GitHub alternativo: Speech-Enhancement-Based-on-Drifting-Models-DriftSE-](https://github.com/LiangXu123/Speech-Enhancement-Based-on-Drifting-Models-DriftSE-/tree/main)
- [arXiv: 2604.24199](https://arxiv.org/abs/2604.24199)
- [Proyecto web](https://liangxu123.github.io/driftse/)
