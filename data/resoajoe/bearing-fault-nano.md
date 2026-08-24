# resoajoe/bearing-fault-nano

## Resumen

`bearing-fault-nano` es un modelo de clasificación de audio ultraligero desarrollado por Joe Cox (usuario de HuggingFace `resoajoe`) para la detección de fallos en rodamientos de bolas mediante análisis de vibraciones. Con solo 46.964 parámetros y 188 KB de peso, el modelo clasifica firmas de vibración en cuatro categorías: rodamiento sano, defecto en pista exterior, defecto en pista interior y defecto en la bola. Está diseñado como una herramienta de cribado para mantenimiento predictivo, no como un sistema de diagnóstico certificado.

El modelo se construyó a partir de una tesis: si una misma arquitectura de 47K parámetros puede procesar imágenes, audio y acelerómetros, entonces el concepto de "nano modelo" es un método generalizable, no una técnica exclusiva de visión por computador. Por ello, la arquitectura es idéntica a la de otros modelos del mismo autor (`alarm-nano`, `depth-nano`, `camera-motion-nano`), alimentada con espectrogramas de la señal de vibración. El modelo se distribuye en formato ONNX y está pensado para ejecutarse en CPU en entornos de borde (edge AI).

La relevancia del modelo reside en su tamaño extremadamente reducido y su licencia MIT, lo que permite desplegarlo en dispositivos con recursos limitados. No obstante, su principal limitación es que está entrenado íntegramente con datos sintéticos generados a partir de la cinemática de rodamientos, y el propio autor advierte que nunca ha sido validado con datos de máquinas reales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN convolucional con 4 capas de convolución (canales 16→32→48→64) |
| Parametros totales | 46.964 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | ventana de 1 segundo a 12 kHz (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (el modelo se distribuye en FP32 ONNX) |
| Idiomas soportados | no aplicable (modelo de clasificación de audio/vibración) |
| Licencia | MIT |
| Formato de pesos | ONNX (safetensors no disponible) |

## Arquitectura y entrenamiento

La arquitectura es una red neuronal convolucional de 4 capas con 16, 32, 48 y 64 canales respectivamente. La entrada es un espectrograma de la señal de vibración, calculado con una STFT de 512 muestras y solapamiento de 384, redimensionado a 64×64 píxeles. El procesamiento incluye una estandarización por ventana (media y desviación estándar), que hace al modelo deliberadamente ciego a la amplitud absoluta de la señal, de modo que responde a la estructura de la vibración y no a la intensidad con la que se montó el sensor.

El entrenamiento se realizó con 5.200 muestras de entrenamiento y 1.600 de test, usando el optimizador Adam con tasa de aprendizaje 3e-3 durante 22 épocas. Los datos son completamente sintéticos, generados a partir de las frecuencias de fallo cinemáticas estándar de rodamientos: BPFO (pista exterior), BPFI (pista interior), BSF (bola) y armónicos de eje para el estado sano. Cada defecto se modela como una ráfaga de impactos periódicos que excitan una resonancia estructural, con parámetros aleatorizados (velocidad de giro, número de elementos, geometría, resonancia, decaimiento y jitter). No se utilizó RLHF ni DPO; es un entrenamiento supervisado estándar de clasificación.

## Capacidades

- Clasificación de fallos en rodamientos de bolas en 4 clases: sano, pista exterior, pista interior y bola.
- Procesamiento de señales de vibración de 1 segundo muestreadas a 12 kHz.
- Invarianza a la amplitud absoluta gracias a la normalización por ventana (diseñado para ignorar cómo se monta el sensor).
- Funciona con señales ruidosas: mantiene una precisión del 79 % con SNR entre −6 y −2 dB, y supera el 99 % con SNR por encima de +2 dB.
- Compatible con ONNX Runtime, por lo que puede ejecutarse en CPU sin dependencias pesadas.
- Arquitectura compartida con otros modelos del autor (audio, imagen, cámara), lo que facilita el despliegue unificado en entornos de borde.
- No tiene capacidad de procesamiento de lenguaje, tool calling ni razonamiento multilingüe.

## Casos de uso

- **Cribado de mantenimiento predictivo en plantas industriales**: el modelo puede integrarse en un sistema de adquisición de vibraciones que monitorice rodamientos de motores eléctricos, bombas o ventiladores. Cada segundo, el sistema analiza la señal y genera una alerta de "firma compatible con defecto en pista exterior", que un técnico debe confirmar con una inspección física. Su tamaño de 188 KB permite ejecutarlo en un microcontrolador o en una Raspberry Pi junto al sensor.
- **Monitorización de rodamientos en equipos remotos**: en instalaciones aisladas (estaciones de bombeo, aerogeneradores pequeños), el modelo puede funcionar en un dispositivo de borde con batería, enviando solo las alertas por red. La baja carga computacional permite ciclos de escucha prolongados sin consumo relevante.
- **Detección de fallos incipientes en rodamientos de vehículos industriales**: con un acelerómetro montado en el cubo de rueda o en el motor, el modelo puede clasificar la firma vibratoria en tiempo real y avisar al conductor o al sistema de gestión de flota de que se programe una revisión.
- **Prototipo de investigación en diagnóstico de maquinaria**: el modelo sirve como referencia de un clasificador de nano dimensiones para comparar con arquitecturas más grandes (MobileNet, ResNet) en tareas de diagnóstico de rodamientos, permitiendo medir la relación precisión/parámetros.
- **Formación y demostración de edge AI**: por su tamaño mínimo y su código de inferencia en 10 líneas de Python, es un ejemplo didáctico de cómo entrenar un clasificador de señales industriales y desplegarlo en ONNX.
- **Prueba de concepto de diagnóstico de rodamientos con datos sintéticos**: antes de invertir en la adquisición de datos reales de máquinas, un equipo puede evaluar la viabilidad de un clasificador de fallos de rodamientos con este modelo, aunque debe asumir que la precisión real será menor.

## Benchmarks y rendimiento

El autor publicó resultados sobre 1.600 muestras de test con SNR entre −6 y +12 dB, con probabilidad aleatoria de 0,250:

| Métrica | Valor |
|---|---|
| Precisión media del modelo | 0,943 |
| Mejor clasificador escalar (ajustado in-sample) | 0,463 |
| Clasificación mayoritaria | 0,250 |
| Recall sano | 0,980 |
| Recall pista exterior | 0,925 |
| Recall pista interior | 0,938 |
| Recall bola | 0,927 |

Precisión por rango de SNR:

| SNR | −6…−2 dB | −2…+2 dB | +2…+6 dB | +6…+12 dB |
|---|---|---|---|---|
| Precisión | 0,790 | 0,955 | 1,000 | 0,998 |

Además, el autor reporta una verificación de consistencia entre ONNX y PyTorch en CPU con una diferencia relativa máxima de 2,5e-07 en los logits y un 100 % de acuerdo en el argmax. No se han publicado resultados en benchmarks estándar del sector (como el dataset CWRU de la Case Western Reserve University).

## Requisitos de hardware

- **VRAM**: no requiere GPU. El modelo pesa 188 KB y se ejecuta en CPU.
- **GPU recomendada**: ninguna. Funciona en CPU de escritorio, Raspberry Pi, microcontroladores y placas de borde.
- **Compatibilidad con hardware de consumo**: sí, cualquier dispositivo con CPU y al menos unos pocos MB de RAM puede ejecutarlo.
- **Opciones de despliegue**: ONNX Runtime (CPUExecutionProvider), también puede convertirse a TensorFlow Lite o ejecutarse con cualquier runtime que soporte ONNX. No hay soporte nativo para vLLM, llama.cpp ni Ollama (no es un modelo de lenguaje).
- **Latencia**: no se han publicado mediciones oficiales, pero con una red de 46K parámetros y una entrada de 64×64, la inferencia en CPU es del orden de milisegundos.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato | Precisión | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `bearing-fault-nano` (este) | 46.964 | ONNX | 0,943 (sintético) | MIT | HuggingFace |
| SEGMN (IEE, 2025) | no disponible | no disponible | no publicado en la card | no disponible | artículo IEEE |
| Modelos clásicos de diagnóstico de rodamientos (SVM, Random Forest) | dependiente de features | no aplicable | no comparable | no aplica | no aplica |

La comparación con SEGMN no es directa porque se trata de un modelo propuesto en un artículo de IEEE (no disponible en abierto) y no se han publicado sus métricas en la información disponible. La comparación con los clasificadores escalares clásicos se incluye en la card del autor: el mejor escalar ajustado obtiene un 0,463 frente al 0,943 del modelo, lo que demuestra que la estructura de la señal (espectrograma) es esencial para la tarea.

## Limitaciones y advertencias

- **Es un modelo sintético**: no se ha validado con vibraciones reales de máquinas. El autor advierte explícitamente que la precisión publicada debe tratarse como un límite superior, y que en un caso análogo de audio el mismo método obtuvo un 98,7 % de falsas alarmas con ruido desconocido hasta que se añadieron fondos reales.
- **No es un diagnóstico ni un certificado de salud**: solo indica que la firma vibratoria es consistente con una clase de fallo. No debe usarse para tomar decisiones de seguridad ni para aprobar el funcionamiento de una máquina.
- **Velocidad de giro constante**: el modelo asume una velocidad de eje constante dentro de la ventana de 1 segundo. No modela arranques ni paradas.
- **Frecuencia mínima de fallo**: con una ventana de 1 segundo a 12 kHz, fallos con velocidad de eje por debajo de aproximadamente 20 Hz generan muy pocos impactos por ventana, lo que reduce la fiabilidad.
- **Fallo único asumido**: el modelo no representa fallos combinados (por ejemplo, pista interior y bola a la vez).
- **Sin indicación de severidad**: devuelve una clase, no una magnitud del defecto.
- **Dependencia del montaje del sensor**: la normalización por ventana elimina la dependencia de la amplitud, pero el modelo degrada su precisión por debajo de −2 dB de SNR; el autor recomienda montar el acelerómetro correctamente.
- **Licencia**: MIT permite uso comercial y modificación, pero no se incluye ninguna garantía de funcionamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/resoajoe/bearing-fault-nano
- Perfil del autor (Joe Cox): https://huggingface.co/resoajoe
- Modelos relacionados del mismo autor: `resoajoe/alarm-nano`, `resoajoe/depth-nano`, `resoajoe/camera-motion-nano`
- Referencia académica sobre diagnóstico de rodamientos (MDPI): https://www.mdpi.com/1424-8220/25/22/7092
- Estudio de diagnóstico de rodamientos basado en deep learning (ScienceDirect): https://www.sciencedirect.com/science/article/pii/S0952197625030994
- Artículo IEEE sobre modelo ligero para borde (SEGMN): https://ieeexplore.ieee.org/document/11442911
