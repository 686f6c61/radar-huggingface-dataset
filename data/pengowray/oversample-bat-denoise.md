# pengowray/oversample-bat-denoise

## Resumen

Oversample bat-call denoiser v1 es una red neuronal convolucional de muy pequeño tamaño (264 KB, 64.513 pesos) diseñada específicamente para reducir el ruido en grabaciones ultrasónicas de llamadas de ecolocación de murciélagos. Lo desarrolla pengowray y se distribuye en formato ONNX (opset 17) como parte del flujo de trabajo de la aplicación Oversample, que lo descarga automáticamente al pulsar "Make Denoised Copy" en su menú de ruido.

El modelo no es un LLM ni un modelo generativo de texto: es un denoiser de audio de dominio muy específico que opera sobre el espectrograma STFT. Dada una señal de audio, estima una ganancia por cada bin de una STFT de 512 puntos (hop 128, ventana Hann periódica) y la aplica para atenuar el ruido de fondo preservando las llamadas de murciélago. La entrada y la salida tienen forma (1, 1, 257, frames) en float32.

Su relevancia es práctica para la bioacústica: permite limpiar grabaciones de campo de murciélagos (típicamente muestreadas entre 192 y 500 kHz) sin resamplear y conservando las llamadas débiles, que en el entrenamiento se ponderaron 8 veces más en la función de pérdida. Es una herramienta de nicho, no un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red convolucional pequeña (CNN) sobre STFT; detalles de capas no disponibles |
| Parametros totales | 64.513 pesos |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica; procesa bloques de 1.024 frames con 64 frames de contexto a cada lado |
| Tipos de cuantizacion | no disponible (pesos en float32 dentro del ONNX) |
| Idiomas soportados | no aplica (modelo de audio) |
| Licencia | no disponible |
| Formato de pesos | ONNX (opset 17), fichero `oversample-bat-denoise-v1.onnx` (264 KB) |

## Arquitectura y entrenamiento

La arquitectura es una red convolucional pequeña que opera sobre características espectrales. La entrada `feat` tiene forma (1, 1, 257, frames) y la salida `logit` la misma forma. Las características se construyen a partir de una STFT de 512 puntos con hop 128 y ventana Hann periódica: se calcula `log(|Z| + 0.1)` y se resta la mediana temporal de cada bin, procesando en bloques de 1.024 frames con 64 frames de contexto a cada lado. La ganancia aplicada es `max(2 * sigmoid(logit) - 1, 0.1)`, con un suelo de 0,1 que garantiza retener al menos el 10 % de la señal de entrada en todo momento (atenuación máxima de 20 dB).

El entrenamiento se realizó con grabaciones de murciélagos de xeno-canto muestreadas entre 250 y 500 kHz. La estrategia de aumento de datos consistió en pegar llamadas fuertes (atenuadas para que su propio ruido quedase muy por debajo del ruido añadido) en fragmentos sin llamadas de otras grabaciones, y entrenar la red para reconstruir las llamadas pegadas. En la función de pérdida, una estimación más silenciosa que la llamada limpia contaba 8 veces más, lo que favorece la conservación de llamadas débiles. No se documenta el uso de RLHF, DPO ni técnicas de decodificación especulativa, que no aplican a este tipo de modelo.

## Capacidades

- Reducción de ruido en grabaciones ultrasónicas de ecolocación de murciélagos.
- Procesamiento de audio a su frecuencia de muestreo nativa, sin resampling.
- Estimación de ganancia por bin espectral sobre STFT de 512 puntos (hop 128, ventana Hann periódica).
- Funciona con audio muestreado al menos a 192 kHz (verificado a 192, 256, 384 y 500 kHz).
- Preservación de llamadas débiles gracias a la ponderación 8x en la pérdida.
- Conservación de sonidos intermitentes como insectos (no los elimina, en su mayoría).
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio generativo ni capacidades multilingües.

## Casos de uso

- Limpieza de grabaciones de campo de murciélagos: el modelo se integra en el flujo de Oversample y genera una copia denoised de la grabación original, útil para análisis acústico posterior sin alterar la tasa de muestreo.
- Análisis de actividad de murciélagos en estudios de biodiversidad: al atenuar el ruido de fondo hasta 20 dB, facilita la detección y clasificación de llamadas en grabaciones nocturnas de larga duración.
- Monitorización pasiva en parques eólicos o infraestructuras: permite procesar grabaciones ultrasónicas continuas para identificar presencia de murciélagos antes de análisis manual.
- Preparación de datasets de bioacústica: sirve como paso de preprocesado para mejorar la relación señal-ruido antes de entrenar clasificadores de especies.
- Investigación en ecolocación: al preservar llamadas débiles (ponderación 8x), es adecuado para estudiar llamadas de baja intensidad o de individuos lejanos.
- Docencia y divulgación: su tamaño reducido (264 KB) y formato ONNX permiten ejecutarlo en entornos ligeros y demostrar técnicas de denoising espectral en grabaciones ultrasónicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: mínima; el modelo pesa 264 KB y los tensores de entrada son pequeños (257 x frames), por lo que cabe en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no se especifican; cualquier GPU con soporte ONNX Runtime es suficiente. No requiere A100 ni H100.
- Cabe en GPU consumer: sí, en cualquier modelo (incluidas GTX/RTX de gama baja) y en CPU.
- Opciones de despliegue: ONNX Runtime (formato nativo del modelo); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables de denoising de llamadas de murciélago con los que establecer una comparativa de parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Verificado visualmente a 192, 256, 384 y 500 kHz; no probado por debajo de 192 kHz.
- Las llamadas cercanas al nivel de ruido pierden aproximadamente 2 a 3 dB.
- Insectos y otros sonidos intermitentes se conservan en su mayoría, no se eliminan.
- El suelo de ganancia de 0,1 limita la atenuación máxima a 20 dB.
- Licencia no disponible: no se puede confirmar el uso comercial sin consultar al autor.
- No hay información sobre sesgos, alucinaciones (no aplica a este tipo de modelo) ni restricciones adicionales de producción.
- El modelo está pensado para el flujo de Oversample; su uso fuera de ese contexto requiere implementar el preprocesado STFT y la normalización descritos en la model card.

## Enlaces

- Hugging Face: https://huggingface.co/pengowray/oversample-bat-denoise
- Aplicación Oversample: https://app.oversample.com
- xeno-canto (fuente de datos de entrenamiento): no se proporciona enlace directo en la información disponible.
