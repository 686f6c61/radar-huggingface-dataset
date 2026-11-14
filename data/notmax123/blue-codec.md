# notmax123/blue-codec

## Resumen

BlueCodec es un autoencoder neuronal de audio orientado exclusivamente a la compresión y reconstrucción de voz, desarrollado por notmax123 (maxmelichov) como componente del proyecto BlueTTS. No es un modelo de texto-a-voz completo: carece de codificador de texto, modelo de duración y pila de flow matching. Su función es mapear formas de onda a una secuencia latente continua de baja tasa (24 dimensiones a ~86 Hz) y reconstruir audio a 44,1 kHz, de modo que los módulos posteriores de BlueTTS operen en ese espacio latente y la síntesis resulte ligera y rápida.

El repositorio publica varios checkpoints con propósitos distintos: el autoencoder BlueCodec 1.5M (`model.safetensors`), un codificador entrenado contra el vocoder oficial Supertonic-3 (septiembre de 2026) y una variante "edge-fixed" del mismo. La arquitectura combina un codificador de ~25,6M de parámetros (Conv1d stem más 10 bloques ConvNeXt) y un decodificador de ~25,3M de parámetros (CausalConv1d stem, 10 bloques ConvNeXt dilatados causales y cabeza de vocoder), sumando 50.897.481 parámetros totales.

Su relevancia actual radica en que sirve de base para la release BlueV3 v3.0.0 (checkpoint 701500) y para la integración ONNX end-to-end de BlueTTS. La licencia del repositorio es MIT, pero el decodificador derivado de Supertonic-3 queda sujeto a las restricciones de uso de OpenRAIL-M, un matiz crítico para despliegues comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Autoencoder convolucional: codificador Conv1d + 10 bloques ConvNeXt; decodificador CausalConv1d + 10 bloques ConvNeXt dilatados causales + cabeza de vocoder |
| Parametros totales | 50.897.481 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada de audio, latente de 24 dimensiones a ~86 Hz) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | multilingue (según etiquetas del repositorio) |
| Licencia | MIT para el repositorio; pesos del decodificador derivados de Supertonic-3 bajo OpenRAIL-M |
| Formato de pesos | safetensors (también checkpoint `.pt` de entrenamiento y soporte ONNX en el ecosistema BlueTTS) |

## Arquitectura y entrenamiento

El codificador recibe características espectrales de 1253 canales (1025 log-lineales más 228 log-mel, con FFT de 2048 y hop de 512), las procesa mediante un stem Conv1d que proyecta de 1253 a 512 dimensiones, seguido de 10 bloques ConvNeXt y una proyección final de 512 a 24 dimensiones. El decodificador invierte el proceso: stem CausalConv1d de 24 a 512, 10 bloques ConvNeXt dilatados causales y una cabeza de vocoder que produce audio a 44,1 kHz. El latente resultante es de 24 dimensiones a aproximadamente 86 Hz.

En cuanto al entrenamiento, el decodificador del codec de BlueV3 se inicializó a partir del vocoder oficial Supertonic-3, se mantuvo congelado en una primera fase y después se ajustó con una tasa de aprendizaje reducida, usando pesos EMA en el paso 380k. El codificador se entrenó desde cero. Existen además dos codificadores específicos: uno entrenado durante 290k pasos contra el vocoder oficial Supertonic-3 congelado (septiembre de 2026) y una variante "edge-fixed" continuada hasta 350k pasos con entrenamiento consciente de bordes. Esta última elimina el "edge code" que aparece en los últimos ~3 fotogramas latentes de un clip (el último fotograma comprimido llega a tener ~9 veces la norma mediana) mediante `encode(audio, edge_pad_chunks=2)`. No se especifican en la información disponible el número total de tokens de audio ni la composición exacta del dataset de entrenamiento.

## Capacidades

- Codificación de forma de onda a latentes continuos de 24 dimensiones a ~86 Hz.
- Decodificación de latentes a audio de alta calidad a 44,1 kHz.
- Reconstrucción de voz con métricas auditadas: L1 log-mel de 0,4426, energía en 12–22 kHz de +19,56 dB y DNSMOS de 3,40 para BlueCodec 1.5M.
- Compatibilidad con el vocoder oficial Supertonic-3 mediante el codificador específico (latentes en el espacio latente oficial).
- Codificación con relleno de borde (`edge_pad_chunks`) para eliminar artefactos en el final de clip.
- Soporte multilingüe declarado en las etiquetas del repositorio.
- Integración con el ecosistema BlueTTS (flow matching, duración, texto-a-latente) y con exportación ONNX.
- No incluye generación de texto, razonamiento, código, matemáticas, visión, tool calling ni agentes: es exclusivamente un códec de audio.

## Casos de uso

- Compresión de voz para pipelines de TTS: el códec reduce formas de onda a latentes de 24 dimensiones a ~86 Hz, lo que permite que los módulos de flow matching y duración de BlueTTS operen sobre representaciones compactas y aceleren la síntesis.
- Integración en BlueV3: el codec `bluev3_codec/` es el componente oficial de la release BlueV3 v3.0.0 (checkpoint 701500), por lo que cualquier despliegue de ese modelo debe usar estos pesos para que las estadísticas latentes y las voces sean válidas.
- Reentrenamiento del códec desde cero: el repositorio independiente maxmelichov/blue-codec y su documentación de entrenamiento permiten reproducir o adaptar el autoencoder a nuevos dominios de audio.
- Exportación ONNX end-to-end: combinado con `notmax123/blue-onnx` y BlueTTS, permite desplegar un pipeline TTS completo en formato ONNX para entornos de inferencia sin PyTorch.
- Investigación en representaciones latentes: el latente de 24 dimensiones a ~86 Hz sirve como espacio de estudio para modelos de voz downstream, análisis de trayectorias latentes y comparación de vocoders.
- Evaluación de calidad de reconstrucción: las auditorías de round-trip (L1 log-mel, energía en banda alta, DNSMOS) permiten usar el códec como referencia en estudios de compresión de voz.
- Preprocesamiento de datasets de voz: la codificación a latentes compactos facilita el almacenamiento y la manipulación de grandes corpus de audio para entrenamiento de modelos de habla.

## Benchmarks y rendimiento

Auditoría de round-trip sobre 10 clips de referencia (L1 log-mel, energía en 12–22 kHz frente a la fuente y DNSMOS):

| Configuracion | L1 log-mel | Energia 12-22 kHz | DNSMOS |
|---|---|---|---|
| BlueCodec 1.5M | 0,4426 | +19,56 dB | 3,40 |
| Codificador + vocoder oficial Supertonic-3 | 0,3385 | +7,63 dB | 3,42 |
| Codificador edge-fixed + vocoder oficial | 0,3387 | +7,11 dB | 3,44 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, dado que el modelo no es de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 50,9M de parámetros en precisión completa (fp32) los pesos ocupan aproximadamente 204 MB, y en fp16 unos 102 MB, por lo que la VRAM necesaria es modesta.
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño, cualquier GPU consumer moderna es suficiente.
- Cabe en GPU consumer: sí, por el reducido número de parámetros; no se especifican modelos concretos.
- Opciones de despliegue: paquete `bluecodec` (instalable vía `pip install onnx "bluecodec @ git+https://github.com/maxmelichov/blue-codec.git"`), exportación ONNX, integración con BlueTTS y BlueV3-onnx.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / latente | Licencia | Disponibilidad |
|---|---|---|---|---|
| BlueCodec | 50,9M | Latente 24-D a ~86 Hz, audio 44,1 kHz | MIT (repo); decodificador OpenRAIL-M | Hugging Face (notmax123/blue-codec) |
| Supertonic-3 (vocoder) | no disponible | no disponible | BigScience OpenRAIL-M | Hugging Face (Supertone/supertonic-3) |
| BlueV3 (pila TTS completa) | no disponible | usa el codec BlueV3 | no disponible | Hugging Face (notmax123/BlueV3) |

No se dispone de datos de benchmarks comparativos con otros codecs de audio en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo TTS completo: carece de codificador de texto, modelo de duración y pila de flow matching; no genera voz a partir de texto por sí solo.
- El decodificador es un fine-tune del vocoder Supertonic-3 de Supertone Inc. y sus pesos derivados quedan sujetos a las restricciones de uso de OpenRAIL-M, aunque el repositorio declare MIT; es imprescindible revisar esas restricciones antes de un uso comercial.
- Las estadísticas latentes y las voces de BlueV3 solo son válidas con este codec concreto; mezclar componentes de otras versiones puede degradar la calidad.
- El "edge code" en los últimos ~3 fotogramas latentes puede ser copiado por modelos downstream si no se usa `encode(audio, edge_pad_chunks=2)`.
- Riesgo de sesgos y alucinaciones: no aplica en el sentido habitual de modelos de lenguaje, pero la reconstrucción puede introducir artefactos en dominios de audio alejados del entrenamiento.
- No se especifican limitaciones de idioma más allá de la etiqueta "multilingual"; la cobertura real por idioma no está documentada.
- No hay datos publicados sobre cuantización, latencia ni throughput, lo que dificulta planificar despliegues en producción.
- El modelo tiene 0 descargas y 1 like en el momento de la consulta, lo que indica una adopción muy limitada y escasa validación externa.

## Enlaces

- Hugging Face: https://huggingface.co/notmax123/blue-codec
- Repositorio del proyecto BlueTTS: https://github.com/maxmelichov/BlueTTS
- Repositorio del códec: https://github.com/maxmelichov/blue-codec
- Documentación de entrenamiento: https://github.com/maxmelichov/blue-codec/blob/main/docs/training.md
- BlueV3: https://huggingface.co/notmax123/BlueV3
- BlueV3-onnx: https://huggingface.co/notmax123/BlueV3-onnx
- blue-onnx: https://huggingface.co/notmax123/blue-onnx
- blue (pila completa PyTorch): https://huggingface.co/notmax123/blue
- Vocoder Supertonic-3: https://huggingface.co/Supertone/supertonic-3
- Demo en vivo: https://huggingface.co/spaces/notmax123/BlueV2
