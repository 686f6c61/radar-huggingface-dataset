# HY-2012/UniverSR.AXERA

## Resumen

UniverSR.AXERA es un paquete de inferencia para el modelo UniverSR, un sistema de superresolución de voz (speech super-resolution) que convierte audio de 8 kHz o 16 kHz en audio de 48 kHz. Lo desarrolla HY-2012 como port del modelo original de woongzip1, empaquetado específicamente para ejecutarse en la NPU AX650 de Axera mediante el runtime axera. El modelo es vocoder-free y se basa en flow matching, lo que le permite reconstruir las frecuencias altas ausentes en la señal de entrada sin depender de un vocoder neuronal convencional.

El paquete incluye seis ficheros axmodel que suman 381 MB y dos variantes de modelo, una para entrada de 8 kHz y otra para 16 kHz, que no son intercambiables porque usan configuraciones distintas de `lr_bins` (80 y 170 respectivamente). La salida está fijada a 48 kHz. Se distribuye con licencia MIT y soporta inglés y chino.

Es relevante para desarrolladores que trabajan en despliegue edge de procesamiento de audio: permite mejorar la calidad de grabaciones telefónicas o de voz comprimida directamente en hardware NPU de bajo consumo, con una implementación en C++ y un SDK en Python.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Flow matching vocoder-free (modelo de superresolución de audio) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa audio por bloques de 128 frames STFT con overlap de 64) |
| Tipos de cuantización | modelos compilados a formato axmodel para NPU AX650 (no se detallan niveles de cuantización) |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | MIT (los pesos upstream de UniverSR siguen su licencia original) |
| Formato de pesos | axmodel (6 ficheros, 381 MB en total) |

## Arquitectura y entrenamiento

El modelo subyacente, UniverSR, es un sistema de superresolución de voz basado en flow matching y libre de vocoder. En lugar de generar la señal de alta frecuencia mediante un vocoder neuronal, el modelo aprende un campo de flujo que transforma la distribución del audio de baja frecuencia en la del audio de 48 kHz, resolviendo una ODE durante la inferencia. La configuración por defecto usa 4 pasos de Flow ODE y un guidance de 1.5.

El paquete AXERA no incluye información sobre el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO (no aplicables habitualmente a modelos de audio). La innovación técnica destacable es el despliegue en NPU: los seis axmodel se han calibrado de forma que la salida en placa alcanza una correlación de 0.99193 (8k→48k) y 0.99350 (16k→48k) respecto a la implementación en PyTorch. El autor indica que `main_cond` se calibra con la salida real del `cond encoder` para que `vc` llegue a 0.9999.

## Capacidades

- Superresolución de voz de 8 kHz a 48 kHz y de 16 kHz a 48 kHz.
- Procesamiento de audio en bloques: STFT de 128 frames con overlap de 64 frames.
- Reconstrucción de contenido espectral de alta frecuencia sin vocoder.
- Soporte de inglés y chino en los ejemplos incluidos.
- Inferencia en NPU AX650 mediante binario C++ o SDK de Python.
- Salida fija a 48 kHz independientemente de la entrada.
- No incluye tool calling, agentes, visión ni modos de razonamiento: es un modelo puramente audio-a-audio.

## Casos de uso

- Mejora de grabaciones telefónicas: el modelo convierte audio de 8 kHz procedente de codecs telefónicos a 48 kHz, útil para transcripción posterior y para archivo de llamadas con mayor fidelidad.
- Restauración de archivos históricos de voz: grabaciones digitalizadas a 8 kHz o 16 kHz pueden recuperar contenido de alta frecuencia antes de su publicación o análisis forense.
- Preprocesado para pipelines de ASR: elevar la frecuencia de muestreo a 48 kHz antes de modelos de reconocimiento de voz que se benefician de señales de banda ancha.
- Contenido para podcast y vídeo: mejorar entrevistas o notas de voz grabadas con equipos de baja calidad antes de su edición final.
- Despliegue en dispositivos edge: al ejecutarse en NPU AX650, encaja en equipos embebidos o cámaras IP que necesitan mejorar audio localmente sin enviar datos a la nube.
- Evaluación de calidad de códecs: comparar la señal reconstruida frente a la original para medir el impacto de la compresión en la banda alta.
- Prototipado con Python SDK: integrar la superresolución en scripts de investigación o en servicios de procesamiento por lotes antes de pasar al binario C++ en producción.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| RTF C++ (entrada de 5.12 s) | 4.3–4.9 (22–25 s de proceso) |
| RTF Python SDK (entrada de 5.12 s) | 4.3 (22 s de proceso) |
| Correlación placa vs PyTorch, 8k→48k | 0.99193 |
| Correlación placa vs PyTorch, 16k→48k | 0.99350 |

No se han publicado resultados de benchmarks perceptuales (MOS, PESQ, STOI) ni comparativas con otros modelos de superresolución en la información disponible.

## Requisitos de hardware

- NPU Axera AX650 (obligatoria para los axmodel; no se indica soporte en GPU convencional).
- Almacenamiento: aproximadamente 381 MB para los seis axmodel más los binarios y el SDK.
- VRAM: no aplica; el despliegue es en NPU, no en GPU.
- No cabe en GPU de consumo porque el formato de pesos es axmodel, específico de la NPU de Axera.
- Opciones de despliegue: binario C++ (`bin/`) o SDK de Python (`python/`) mediante `run_ax650.sh`.
- Latencia: RTF de 4.3–4.9 en C++ y 4.3 en Python, es decir, el procesamiento es más lento que tiempo real en el hardware probado (5.12 s de audio tardan 22–25 s).
- Throughput estimado: aproximadamente 0,2–0,23× tiempo real según los datos del autor.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada/salida | Licencia | Despliegue |
|---|---|---|---|---|
| UniverSR.AXERA | Flow matching vocoder-free | 8/16 kHz → 48 kHz | MIT | NPU AX650 |
| UniverSR (upstream) | Flow matching vocoder-free | 8/16 kHz → 48 kHz | Según upstream | PyTorch |
| AudioSR | Modelo de difusión | Banda ancha genérica | No disponible en la información | GPU |

No se dispone de datos de benchmarks comparativos con AudioSR ni con otros sistemas de superresolución de voz en la información proporcionada, por lo que la comparación se limita a características de despliegue y licencia.

## Limitaciones y advertencias

- Solo procesa dos frecuencias de entrada concretas: 8 kHz y 16 kHz. No incluye 12 kHz ni 24 kHz, y los modelos de 8k y 16k no son intercambiables.
- La salida está fijada a 48 kHz; no se puede seleccionar otra frecuencia de salida.
- El rendimiento es inferior al tiempo real en el hardware probado (RTF 4.3–4.9), lo que limita su uso en aplicaciones de baja latencia en directo.
- Solo se declaran inglés y chino; no hay evidencia de calidad en otros idiomas.
- Riesgo de artefactos o alucinación espectral en señales de entrada con ruido, música o voces no representadas en el entrenamiento; no se documentan evaluaciones perceptuales.
- Los pesos upstream de UniverSR mantienen su licencia original, que puede imponer condiciones adicionales al uso comercial aunque el empaquetado sea MIT.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente.
- No se detallan los niveles de cuantización aplicados a los axmodel, lo que dificulta evaluar la pérdida de precisión frente al modelo original.

## Enlaces

- Hugging Face: https://huggingface.co/HY-2012/UniverSR.AXERA
- Repositorio GitHub del port: https://github.com/ZY-2012/UniverSR.AXERA
- Repositorio upstream UniverSR: https://github.com/woongzip1/UniverSR
