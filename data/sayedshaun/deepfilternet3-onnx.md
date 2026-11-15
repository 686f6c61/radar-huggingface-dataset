# SayedShaun/DeepFilterNet3-onnx

## Resumen

DeepFilterNet3-onnx es una exportación no oficial del modelo preentrenado DeepFilterNet3 a formato ONNX, realizada por un tercero (SayedShaun) a partir del checkpoint PyTorch original. DeepFilterNet3 es un sistema de mejora de voz (speech enhancement) y eliminación de ruido (denoising) desarrollado por Hendrik Schröter y los contribuidores del proyecto DeepFilterNet, diseñado para operar en tiempo real sobre señales de audio a 48 kHz.

El modelo resuelve el problema de la supresión de ruido en grabaciones de voz: recibe audio mono a 48 kHz con ruido de fondo y devuelve una señal limpiada. La arquitectura combina un encoder, un decoder de máscaras ERB (bandas de escala Bark aproximada) y un decoder de deep filtering, que aplica un filtrado de dominio frecuencial por trama para refinar la señal. Esta exportación concreta permite ejecutar el modelo sin PyTorch, sin los paquetes `df` ni `libdf`, usando únicamente numpy y ONNX Runtime.

La relevancia de esta ficha radica en que ofrece una vía de despliegue ligera del modelo original en entornos donde instalar PyTorch no es viable, con verificación numérica del autor frente a la implementación upstream (diferencia máxima absoluta de 3.1e-5 sobre la señal de salida). No obstante, se trata de una conversión de terceros, no publicada por los autores originales, y el procesamiento no es en streaming.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeepFilterNet3 (encoder + decoder ERB + decoder de deep filtering), exportada a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa el fichero completo en una pasada; no streaming) |
| Tipos de cuantizacion | no disponible (exportación en float32 por defecto; opset 12) |
| Idiomas soportados | no disponible (procesamiento de señal de voz, independiente del idioma) |
| Licencia | MIT o Apache 2.0, a elección (dual, según upstream) |
| Formato de pesos | ONNX (`enc.onnx`, `erb_dec.onnx`, `df_dec.onnx`) |

## Arquitectura y entrenamiento

DeepFilterNet3 es un sistema de mejora de voz compuesto por tres redes exportadas de forma independiente: un encoder (`enc.onnx`), un decoder de máscaras ERB (`erb_dec.onnx`) y un decoder de deep filtering (`df_dec.onnxx`). El pipeline completo incluye etapas de preprocesado (STFT, extracción de características ERB, normalización) y postprocesado (aplicación de la máscara ERB y deep filtering), implementadas en numpy por el autor de la conversión en el fichero `DeepFilterNet3Onnx.py`. El checkpoint de origen es `DeepFilterNet3.zip` de la epoch 120, tomado del commit upstream `82b0c7ad33fc756284104053817d1e855d8d8386`.

La exportación se realizó con el script `df/scripts/export.py` del commit `7b14b895fe7fc42cab72b4a4c1e49c982bd6404b` (2026-11-06), con opciones por defecto: opset 12, sin simplificación y sin post-filter. Las versiones usadas fueron PyTorch 2.2.2 (CPU), ONNX 1.23.2 y ONNX Runtime 1.32.0. No se dispone de información sobre el volumen de tokens de audio, la composición del dataset de entrenamiento ni sobre el uso de RLHF/DPO, ya que la model card de esta conversión no los documenta.

## Capacidades

- Mejora de voz y eliminación de ruido de fondo sobre audio mono a 48 kHz.
- Procesamiento del fichero completo en una sola pasada (no streaming).
- Ejecución sin PyTorch ni las dependencias `df`/`libdf`: solo numpy, ononnxruntime, soundfile y huggingface_hub.
- Verificación numérica frente a la implementación PyTorch upstream: diferencia máxima absoluta de 3.1e-5 sobre la señal de salida (RMS 0.055) en `assets/noisy_snr0.wav` (508.591 muestras).
- Verificación por etapa: encoder 4.8e-6, decoder ERB 6.3e-7, decoder DF 1.2e-7 de diferencia máxima absoluta frente a PyTorch.
- No incluye tool calling, function calling, razonamiento multi-paso ni capacidades multimodales: es un modelo puramente audio-a-audio.
- No se documentan capacidades multilingües ni de otro tipo en la información disponible.

## Casos de uso

- Limpieza de grabaciones de voz para transcripción: el modelo elimina ruido de fondo antes de pasar el audio a un sistema ASR, mejorando la calidad de la señal de entrada; es adecuado porque opera a 48 kHz y procesa el fichero completo en una pasada.
- Preprocesado de audio para datasets de entrenamiento: se puede integrar en pipelines de preparación de datos para normalizar y limpiar corpus de voz antes de entrenar modelos de reconocimiento o síntesis.
- Despliegue en entornos sin PyTorch: al requerir solo numpy y ONNX Runtime, encaja en contenedores ligeros o sistemas embebidos donde instalar PyTorch es costoso o inviable.
- Aplicaciones de podcast y locución: limpieza de tomas con ruido ambiental antes de la mezcla final, procesando el fichero entero fuera de línea.
- Herramientas de accesibilidad y telecomunicaciones: mejora de señal en grabaciones de llamadas o reuniones almacenadas, donde el ruido de fondo degrada la inteligibilidad.
- Investigación en procesamiento de audio: servir como referencia reproducible en ONNX para comparar implementaciones o validar pipelines de inferencia sin dependencia del framework original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el modelo es de tamaño reducido (los tres ficheros ONNX ocupan pocos kilobytes más que el archivo upstream `DeepFilterNet3_onnx.tar.gz`), por lo que es esperable que quepa en cualquier GPU consumer, aunque no se documentan cifras concretas.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU consumer: no disponible de forma explícita; por el tamaño del modelo es previsible que funcione en GPUs de gama baja, pero no se confirma en la información proporcionada.
- Opciones de despliegue: ONNX Runtime (versión verificada 1.32.0) con pre/postprocesado en numpy; también admite una carpeta local con los ficheros.
- Latencia y throughput: no disponibles; el procesamiento es por fichero completo, no streaming.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepFilterNet3-onnx (esta ficha) | no disponible | fichero completo, no streaming | verificado frente a PyTorch upstream (3.1e-5) | MIT o Apache 2.0 | Hugging Face, conversión de terceros |
| DeepFilterNet3 (upstream, PyTorch) | no disponible | fichero completo | referencia original | MIT o Apache 2.0 | GitHub Rikorose/DeepFilterNet |
| DeepFilterNet3_onnx.tar.gz (upstream) | no disponible | fichero completo | referencia oficial ONNX | MIT o Apache 2.0 | upstream |

No se dispone de datos de benchmarks ni de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Conversión no oficial: no está publicada por los autores de DeepFilterNet y puede divergir de la referencia upstream; el propio autor recomienda usar el archivo upstream si se necesitan los ficheros exactos.
- No streaming: procesa el fichero completo en una pasada, lo que impide uso en tiempo real o en aplicaciones de baja latencia.
- Entrada restringida: exige audio mono a 48 kHz; no se documenta soporte para otras frecuencias de muestreo ni para multicanal.
- Los bytes de los ficheros ONNX no son idénticos a los upstream (diferencia esperable por versiones distintas de PyTorch y ONNX); los tamaños están dentro de unos pocos kilobytes.
- No se documentan sesgos, riesgos de alucinación ni limitaciones idiomáticas, ya que el modelo opera sobre señal de voz y no genera texto.
- Licencia dual MIT/Apache 2.0: permite uso comercial, pero conviene verificar los textos de licencia incluidos (`LICENSE-MIT`, `LICENSE-APACHE`) y la declaración upstream antes de producción.
- Para producción, validar la salida frente a la implementación upstream en el dominio concreto de audio objetivo, dado que es una conversión de terceros.

## Enlaces

- Hugging Face: https://huggingface.co/SayedShaun/DeepFilterNet3-onnx
- Repositorio upstream: https://github.com/Rikorose/DeepFilterNet
- Declaración de licencia upstream: https://github.com/Rikorose/DeepFilterNet#license
- Texto de licencia MIT: https://github.com/Rikorose/DeepFilterNet/blob/main/LICENSE-MIT
- Mirror PyTorch del checkpoint: https://huggingface.co/SayedShaun/DeepFilterNet3-mirror
