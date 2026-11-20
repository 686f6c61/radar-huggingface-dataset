# LiquidAI/LFM3-Audio-2B-ONNX

## Resumen

LFM3-Audio-2B-ONNX es la versión exportada a ONNX Runtime del modelo LFM3-Audio-2B de Liquid AI, un modelo multimodal any-to-any de 2.000 millones de parámetros diseñado para tareas de audio y texto. La exportación a ONNX permite su despliegue multiplataforma (CPU, GPU, edge) sin depender del stack de PyTorch, lo que facilita la integración en aplicaciones de producción con ONNX Runtime.

El modelo forma parte de la familia LFM3 de Liquid AI y hereda la arquitectura del modelo base LiquidAI/LFM3-Audio-2B. Al tratarse de una conversión de precisión (quantized), mantiene las capacidades del original pero con pesos optimizados para inferencia en entornos con recursos limitados, incluyendo variantes de cuantización como q4.

La relevancia de esta ficha radica en que ofrece una vía práctica para desplegar un modelo de audio conversacional en infraestructura heterogénea, con soporte para 18 idiomas y un pipeline any-to-any que combina encoder de audio, decoder de texto y decoder de codec de audio. El repositorio ocupa 19,7 GB e incluye múltiples precisiones para adaptarse a distintos presupuestos de cómputo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (modelo base LFM3-Audio-2B; arquitectura no detallada en la información proporcionada) |
| Parámetros totales | 2B (según nombre del modelo) |
| Parámetros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | q4 (y otras precisiones no detalladas en el extracto) |
| Idiomas soportados | en, ar, da, de, el, fi, fr, he, it, ja, ko, nl, pl, pt, es, sv, tr, zh (18 idiomas) |
| Licencia | lfm1.0 (license: other) |
| Formato de pesos | ONNX (decoder, audio_encoder, codec_decoder, depth_decoder) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base LFM3-Audio-2B. Por el pipeline any-to-any y los componentes del repositorio ONNX, se deduce una arquitectura compuesta por un encoder de audio, un decoder de lenguaje y un decoder de codec de audio, más un depth_decoder en float32 que se ejecuta en todas las precisiones. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

La innovación técnica destacable de esta versión es la exportación a ONNX Runtime con cuantización q4, que reduce el tamaño del decoder a 2,71 GB y permite inferencia en CPU. El repositorio incluye cada precisión emparejada con su encoder de audio y decoder de codec, lo que facilita el despliegue modular. No se dispone de información sobre decodificación especulativa, atención lineal u otras optimizaciones del modelo base.

## Capacidades

- Generación de texto y razonamiento multimodal any-to-any (audio y texto).
- Procesamiento de audio: codificación y decodificación mediante encoder y codec decoder dedicados.
- Conversación por voz: el pipeline any-to-any permite entrada de audio y salida de audio/texto.
- Soporte multilingüe en 18 idiomas, incluyendo español, inglés, alemán, francés, japonés, chino, árabe y hebreo.
- No se especifica soporte de tool calling o function calling en la información proporcionada.
- No se especifica soporte de agentes o multi-step reasoning en la información proporcionada.
- No se especifica modo thinking, visión ni otras capacidades especiales.

## Casos de uso

- Asistentes de voz en tiempo real: el modelo puede procesar audio de entrada y generar respuestas habladas gracias al encoder de audio y al codec decoder, desplegable en CPU con la variante q4 de 2,71 GB.
- Transcripción y comprensión de audio multilingüe: con soporte para 18 idiomas, puede emplearse en sistemas de atención al cliente que reciben llamadas en distintos idiomas y necesitan comprender y responder.
- Aplicaciones edge sin GPU: la exportación ONNX con cuantización q4 permite ejecutar el modelo en dispositivos con CPU, como routers, mini-PC o sistemas embebidos, para interfaces de voz locales.
- Prototipado rápido de agentes conversacionales por voz: el pipeline any-to-any y el formato ONNX facilitan la integración en aplicaciones web o de escritorio mediante ONNX Runtime sin dependencias de PyTorch.
- Procesamiento de audio en pipelines de datos: el encoder de audio puede usarse para extraer representaciones de audio en sistemas de análisis de llamadas o moderación de contenido.
- Despliegue multiplataforma en producción: al ser ONNX, se puede servir con ONNX Runtime en Windows, Linux, macOS y ARM, lo que simplifica la distribución de una misma solución de voz en flotas heterogéneas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible para GPU; la variante q4 del decoder ocupa 2,71 GB en disco y está orientada a CPU.
- GPU recomendadas: no disponible.
- Cabe en consumer GPU: no disponible.
- Opciones de despliegue: ONNX Runtime (librería principal), con soporte para CPU y potencialmente GPU según el proveedor de ejecución de ONNX Runtime.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han proporcionado datos de modelos comparables en la información suministrada.

## Limitaciones y advertencias

- Licencia lfm1.0 (license: other): es necesario revisar los términos del archivo LICENSE para uso comercial; no se detallan restricciones en la información proporcionada.
- Al ser una versión cuantizada (q4), puede haber una pérdida de calidad respecto al modelo base en float32.
- No se dispone de información sobre sesgos conocidos ni tasas de alucinación.
- La longitud de contexto no está especificada, lo que limita la planificación de conversaciones largas.
- El modelo base es LFM3-Audio-2B; esta exportación ONNX puede no incluir todas las funcionalidades del original si no se documentan.
- El repositorio ocupa 19,7 GB, lo que requiere espacio de almacenamiento considerable.
- No se especifica soporte para tool calling ni agentes, lo que puede limitar su uso en pipelines complejos.

## Enlaces

- [Hugging Face: LiquidAI/LFM3-Audio-2B-ONNX](https://huggingface.co/LiquidAI/LFM3-Audio-2B-ONNX)
- [Modelo base: LiquidAI/LFM3-Audio-2B](https://huggingface.co/LiquidAI/LFM3-Audio-2B)
- [Blog de Liquid AI sobre LFM3](https://www.liquid.ai/blog/lfm3)
- [Documentación de Liquid AI](https://docs.liquid.ai/lfm/getting-started/welcome)
- [Playground de Liquid AI](https://playground.liquid.ai/talk)
- [Consola de Liquid AI](https://console.liquid.ai/dashboard)
