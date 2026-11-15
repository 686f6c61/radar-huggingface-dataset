# paloik/Qwen3-TTS-12Hz-0.6B-CustomVoice-int8-ov

## Resumen

Qwen3-TTS-12Hz-0.6B-CustomVoice-int8-ov es una conversión al formato OpenVINO IR del modelo de síntesis de voz Qwen3-TTS-12Hz-0.6B-CustomVoice, desarrollado originalmente por el equipo Qwen de Alibaba. La conversión y cuantización la firma el usuario `paloik` y está orientada a la inferencia eficiente sobre hardware Intel: NPU de Core Ultra, GPUs integradas Arc y CPUs multinúcleo. El modelo resuelve la generación de audio de voz a partir de texto en varios idiomas, con control de voz personalizada (CustomVoice), en un tamaño compacto de 0,6 mil millones de parámetros.

La relevancia de esta variante concreta reside en el empaquetado: el backbone del modelo se comprime a INT8 simétrico mientras el vocoder de audio se mantiene en FP16 sin pérdida, una decisión de diseño pensada para evitar artefactos metálicos en el audio sintetizado. El resultado es un modelo desplegable con OpenVINO GenAI (versión 2026.4 o superior) que aprovecha aceleradores Intel sin necesidad de GPUs dedicadas de gran formato.

Se trata de una ficha de conversión, no de un modelo original: no aporta pesos nuevos ni entrenamiento adicional, sino una reempaquetación optimizada del modelo base de Qwen. La licencia Apache 2.0 se hereda del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de síntesis de voz (TTS) con vocoder; frecuencia de muestreo de 12 Hz |
| Parametros totales | 0,6 mil millones (600 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Backbone INT8 simétrico (`INT8_SYM`); vocoder FP16 |
| Idiomas soportados | Alemán, inglés, chino y otros (multilingüe; lista completa no disponible) |
| Licencia | Apache 2.0 |
| Formato de pesos | OpenVINO IR (`.xml`/`.bin`); cuantización INT8 + FP16 |
| Modelo base | Qwen/Qwen3-TTS-12Hz-0.6B-CustomVoice |
| Frecuencia de audio de salida | 24.000 Hz (según el ejemplo de inferencia) |
| Hardware objetivo | Intel Core Ultra NPU, Arc iGPU, CPU multinúcleo |
| Runtime | OpenVINO GenAI >= 2026.4 |

## Arquitectura y entrenamiento

El modelo base es un sistema de text-to-speech de Qwen con arquitectura transformer y un vocoder separado que convierte las representaciones latentes en forma de onda de audio. La denominación "12Hz" hace referencia a la frecuencia de muestreo de las representaciones acústicas intermedias, un detalle típico de los sistemas TTS basados en tokens de audio. La variante "CustomVoice" indica que el modelo permite controlar o clonar la voz de salida.

Esta conversión concreta no aporta información sobre el entrenamiento del modelo original: no se detallan el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO. Tampoco se documentan innovaciones técnicas del backbone más allá de la propia cuantización. La contribución técnica de esta ficha es el pipeline de conversión a OpenVINO: backbone en INT8 simétrico para reducir el footprint y acelerar la inferencia, y vocoder en FP16 para preservar la calidad del audio y evitar artefactos metálicos. El pipeline admite sugerencias de `CACHE_DIR` y `LATENCY` para optimizar el despliegue.

## Capacidades

- Síntesis de voz multilingüe a partir de texto (alemán, inglés, chino y otros).
- Control de voz personalizada (CustomVoice) para seleccionar o definir la voz de salida.
- Generación de audio a 24 kHz mediante un vocoder en FP16.
- Inferencia sobre NPU de Intel Core Ultra, GPU integrada Arc y CPU multinúcleo.
- Soporte de caché de compilación (`CACHE_DIR`) para acelerar arranques posteriores.
- Soporte de sugerencia de latencia (`LATENCY`) para priorizar velocidad de respuesta.
- Integración con el runtime OpenVINO GenAI mediante `Text2SpeechPipeline`.
- No se documentan capacidades de tool calling, agentes, visión ni audio de entrada.

## Casos de uso

- **Locución de artículos y documentación técnicas**: el modelo convierte texto en audio de forma local sobre una CPU o NPU Intel, sin depender de servicios en la nube. Adecuado para generar versiones en audio de documentación o blogs con hardware de sobremesa.
- **Asistentes de voz en aplicaciones de escritorio**: integrado mediante OpenVINO GenAI, permite dotar a una aplicación de escritorio de síntesis de voz en alemán o inglés con latencia baja y sin GPU dedicada, aprovechando la NPU de un Core Ultra.
- **Generación de voces personalizadas para prototipos**: la variante CustomVoice permite experimentar con identidades de voz concretas en demos y pruebas de concepto de interfaces conversacionales.
- **Sistemas de accesibilidad**: lectura en voz alta de contenido para usuarios con discapacidad visual, ejecutándose en el propio dispositivo y preservando la privacidad del texto procesado.
- **Contenido multilingüe para e-learning**: generación de narraciones en alemán, inglés o chino para cursos y materiales formativos, con un único modelo y un pipeline ligero.
- **Integración en dispositivos de borde**: al caber en NPU y CPU Intel, puede desplegarse en equipos sin GPU dedicada, como terminales de kiosco o sistemas empotrados basados en Core Ultra.
- **Pruebas de regresión de calidad de audio**: el vocoder en FP16 facilita comparar la calidad de la síntesis frente a otras cuantizaciones en pipelines de evaluación internos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas objetivas de calidad de audio (MOS, WER, etc.), latencia medida ni throughput. Solo se indica que el vocoder se mantiene en FP16 para evitar artefactos metálicos, lo que sugiere una preocupación por la calidad perceptual, pero sin cifras que la cuantifiquen.

## Requisitos de hardware

- **VRAM/RAM estimada**: con backbone en INT8 y vocoder en FP16, el peso del modelo ronda los 0,6 GB en memoria (aproximación basada en el tamaño de parámetros; no confirmada en la model card).
- **GPU recomendadas**: GPUs integradas Intel Arc (iGPU de Core Ultra). No se mencionan GPUs dedicadas NVIDIA o AMD; el runtime es OpenVINO, orientado a hardware Intel.
- **Aceleradores soportados**: NPU de Intel Core Ultra, Arc iGPU y CPU multinúcleo.
- **¿Cabe en hardware de consumo?**: sí, está diseñado explícitamente para ello; el objetivo son equipos Intel Core Ultra de consumo y portátiles.
- **Opciones de despliegue**: OpenVINO GenAI >= 2026.4 mediante `Text2SpeechPipeline`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- **Latencia y throughput**: no disponibles. El pipeline admite la sugerencia `LATENCY`, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Formato | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| Qwen3-TTS-12Hz-0.6B-CustomVoice-int8-ov (esta ficha) | 0,6 B | Multilingüe (alemán, inglés, chino, etc.) | OpenVINO IR (INT8 + FP16) | Apache 2.0 | Intel NPU / Arc iGPU / CPU |
| Qwen/Qwen3-TTS-12Hz-0.6B-CustomVoice (base) | 0,6 B | Multilingüe | Pesos originales (no especificado) | Apache 2.0 | GPU/CPU genéricas |
| Otras variantes OpenVINO de TTS | no disponible | no disponible | OpenVINO IR | no disponible | Intel |

No se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas comparables en la información proporcionada, por lo que la comparación se limita a parámetros, licencia y formato de despliegue.

## Limitaciones y advertencias

- **Modelo derivado, no original**: es una conversión de `paloik`; los méritos de calidad y entrenamiento corresponden al modelo base de Qwen. Cualquier limitación del base se hereda.
- **Sesgos**: no documentados en la model card; al ser un modelo TTS multilingüe, puede reflejar sesgos de pronunciación, acento o prosodia presentes en los datos de entrenamiento originales.
- **Alucinación en audio**: no se documenta el comportamiento ante texto ambiguo, errores de pronunciación o nombres propios; conviene validar con textos representativos antes de producción.
- **Cobertura de idiomas incompleta**: se citan alemán, inglés y chino, pero no se publica la lista completa de idiomas soportados ni su calidad relativa.
- **Dependencia de hardware Intel**: el formato OpenVINO IR y el runtime OpenVINO GenAI limitan el despliegue a hardware Intel; no es portable a GPUs NVIDIA o AMD sin reconversión.
- **Versión mínima del runtime**: requiere OpenVINO GenAI >= 2026.4; versiones anteriores pueden no cargar el pipeline.
- **Licencia**: Apache 2.0, permisiva para uso comercial, pero conviene verificar las condiciones del modelo base y de los datos de voz empleados en su entrenamiento.
- **Madurez**: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica escasa validación por parte de la comunidad.
- **Sin métricas de calidad**: no hay MOS, WER ni evaluaciones perceptuales publicadas; la calidad del audio INT8+FP16 no está cuantificada.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/paloik/Qwen3-TTS-12Hz-0.6B-CustomVoice-int8-ov)
- [Modelo base: Qwen/Qwen3-TTS-12Hz-0.6B-CustomVoice](https://huggingface.co/Qwen/Qwen3-TTS-12Hz-0.6B-CustomVoice)
- [OpenVINO GenAI](https://github.com/openvinotoolkit/openvino.genai)
- [OpenVINO Toolkit](https://github.com/openvinotoolkit/openvino)
