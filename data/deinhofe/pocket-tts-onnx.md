# deinhofe/pocket-tts-onnx

## Resumen

Pocket TTS ONNX es una exportación a formato ONNX del modelo de síntesis de voz Pocket TTS, desarrollado originalmente por Kyutai. Esta versión, publicada por el usuario deinhofe, convierte el modelo original en un conjunto de grafos ONNX optimizados para inferencia en CPU mediante ONNX Runtime, manteniendo las capacidades de clonación de voz zero-shot y soporte multilingüe del modelo base. El paquete incluye bundles por idioma (inglés, alemán, francés, italiano, portugués y español) con variantes de 6 y 24 capas, además de versiones cuantizadas a INT8.

La relevancia de esta exportación radica en que elimina la dependencia de frameworks de deep learning pesados y permite desplegar TTS con clonación de voz en entornos con recursos limitados, sin GPU dedicada. La arquitectura se divide en dos modelos para el Flow LM (un transformador condicionador y una red de flujo), lo que permite control externo sobre el proceso de muestreo mediante integración de Euler, ajuste de temperatura y número variable de pasos LSD.

El repositorio ocupa 11,7 GB e incluye tanto la estructura moderna por bundles como archivos legacy en la raíz para compatibilidad con integraciones antiguas. La licencia es CC-BY-4.0, lo que permite uso comercial con atribución.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | TTS basado en flow matching con split dual del Flow LM (transformador condicionador + red de flujo) y decoder Mimi |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | INT8 y FP32 |
| Idiomas soportados | en, de, fr, it, pt, es |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (con tokenizer.model y archivos .npy auxiliares) |

## Arquitectura y entrenamiento

La exportación ONNX mantiene la arquitectura del modelo base kyutai/pocket-tts, estructurada en varios componentes: un condicionador de texto (`text_conditioner.onnx`), un encoder Mimi (`mimi_encoder.onnx`) para procesar audio de referencia en la clonación de voz, un decoder Mimi (`mimi_decoder.onnx`) que genera las formas de onda, y el Flow LM dividido en dos grafos: `flow_lm_main.onnx` (transformador condicionador que produce vectores de condicionamiento) y `flow_lm_flow.onnx` (red de flujo que realiza la integración de Euler para el muestreo latente).

Esta separación permite control externo del bucle de flujo, ajustando la temperatura (escalado del ruido) y el número de pasos LSD para equilibrar velocidad y calidad. Los bundles de 6 capas (english_2026-04, german, italian, portuguese, spanish) son considerablemente más pequeños y rápidos que los bundles de 24 capas (`*_24l`). La cuantización INT8 reduce el tamaño de `flow_lm_main`, `flow_lm_flow` y `mimi_decoder`, mientras que `mimi_encoder` y `text_conditioner` permanecen en FP32. No se dispone de información sobre el número de tokens de entrenamiento, composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo original.

## Capacidades

- Síntesis de voz multilingüe en inglés, alemán, francés, italiano, portugués y español.
- Clonación de voz zero-shot a partir de muestras de audio cortas, archivos `.safetensors` de estado de prompt o embeddings precalculados.
- Control de diversidad en la generación mediante el parámetro `temperature` (por ejemplo, 0.3 para mayor determinismo, 1.0 para mayor expresividad).
- Ajuste del compromiso velocidad/calidad mediante `lsd_steps` (por defecto 1, valores superiores como 4 para mayor suavidad).
- Modo streaming con chunking adaptativo (inicio en 2 frames) para baja latencia de primer audio.
- Decodificación paralela en hilos en modo offline, solapando la generación del bucle de flujo con la decodificación del decoder Mimi en chunks de 12 frames.
- Voces integradas por bundle (por ejemplo, "alba") cargadas desde los metadatos de cada bundle.
- Inferencia optimizada en CPU con ajuste automático de hilos (`intra_op_num_threads=min(cpu_count, 4)`, `inter_op_num_threads=1`), con una mejora de aproximadamente 2x sobre la configuración por defecto de ONNX Runtime.

## Casos de uso

- Asistentes de voz en dispositivos de borde: el modelo puede ejecutarse en CPU sin GPU dedicada gracias a la cuantización INT8, lo que lo hace adecuado para raspberry Pi, mini-PCs o entornos embebidos donde se requiera síntesis de voz local con clonación.
- Generación de audiolibros y contenido narrado: la clonación zero-shot permite mantener una voz consistente a lo largo de textos largos usando una muestra de referencia, y el modo offline con decodificación paralela maximiza el throughput.
- Atención al cliente automatizada: el modo streaming con chunking adaptativo proporciona un tiempo de primer audio bajo, adecuado para respuestas conversacionales en tiempo real en centros de contacto multilingües.
- Localización de contenido multimedia: los bundles por idioma permiten doblar vídeos o pódcasts a inglés, alemán, francés, italiano, portugués y español manteniendo la identidad vocal del hablante original mediante clonación.
- Prototipado de interfaces de voz en investigación: la separación en grafos ONNX y el control externo del bucle de flujo facilitan experimentar con temperatura y pasos LSD sin modificar el modelo.
- Sistemas de accesibilidad: lectura de textos en voz alta con voces personalizadas clonadas a partir de muestras del usuario, ejecutándose localmente en CPU para preservar la privacidad.
- Integración en pipelines de generación de contenido: la API de Python (`PocketTTSOnnx`) y la interfaz de línea de comandos (`generate.py`) permiten automatizar la síntesis por lotes en flujos de producción sin infraestructura GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica, el modelo está diseñado para inferencia en CPU mediante ONNX Runtime. El repositorio completo ocupa 11,7 GB, pero cada bundle individual es sustancialmente menor (los bundles de 6 capas son "mucho más pequeños" que los de 24 capas, según la model card).
- GPU recomendadas: no disponibles; la exportación está optimizada para CPU.
- Cabe en GPU consumer: no se proporcionan datos específicos; el enfoque principal es CPU.
- Opciones de despliegue: ONNX Runtime (con ajuste automático de hilos), API de Python `PocketTTSOnnx`, script de línea de comandos `generate.py`.
- Latencia y throughput: no se proporcionan cifras concretas. La model card indica que el ajuste de hilos proporciona aproximadamente 2x de speedup sobre la configuración por defecto de ORT, y que el chunking adaptativo en streaming garantiza un inicio instantáneo (bajo TTFB) escalando el tamaño de chunk para el throughput.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El modelo base kyutai/pocket-tts es la referencia directa, pero no se han facilitado sus especificaciones completas ni datos de rendimiento comparativo con otras alternativas de TTS.

## Limitaciones y advertencias

- No se dispone de información sobre sesgos conocidos en el modelo base ni en esta exportación.
- Riesgo de alucinación acústica: como todo modelo generativo de audio, puede producir artefactos o pronunciaciones incorrectas, especialmente en textos fuera del dominio de entrenamiento o en idiomas con menos datos.
- La calidad y naturalidad dependen del bundle seleccionado: los bundles de 6 capas son más rápidos pero presumiblemente de menor calidad que los de 24 capas.
- El rendimiento depende del bundle de idioma, la precisión (INT8 vs FP32), la CPU y el número de pasos LSD, según la model card.
- La clonación de voz plantea riesgos de uso indebido (suplantación de identidad, deepfakes); la licencia CC-BY-4.0 no impone restricciones éticas adicionales, por lo que la responsabilidad recae en el implementador.
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero no se especifican términos adicionales del modelo base kyutai/pocket-tts que pudieran aplicar.
- El repositorio incluye archivos legacy en la raíz para compatibilidad; las nuevas integraciones deben usar los directorios por bundle bajo `onnx/<language>/`.
- No se dispone de información sobre límites de longitud de texto de entrada ni sobre el comportamiento en textos muy largos.

## Enlaces

- [Hugging Face: deinhofe/pocket-tts-onnx](https://huggingface.co/deinhofe/pocket-tts-onnx)
- [Modelo base: kyutai/pocket-tts](https://huggingface.co/kyutai/pocket-tts)
