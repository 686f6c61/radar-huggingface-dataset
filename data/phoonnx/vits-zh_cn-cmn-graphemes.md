# Phoonnx/vits-zh_cn-cmn-graphemes

## Resumen

`vits-zh_cn-cmn-graphemes` es un modelo de síntesis de voz (text-to-speech) en formato ONNX basado en la arquitectura VITS, desarrollado originalmente por BricksDisplay y empaquetado por Phoonnx para su librería de inferencia TTS homónima. El modelo está especializado en mandarín (zh-CN) y acepta como entrada tanto caracteres del texto como pinyin, lo que lo hace adecuado para pipelines de conversión texto-a-voz en aplicaciones en chino.

La relevancia de este modelo radica en su empaquetado específico para el ecosistema phoonnx y OVOS (Open Voice OS), un entorno de asistentes de voz open source. Al estar disponible en ONNX y con una licencia Apache 2.0, puede desplegarse en entornos de producción sin las restricciones de licencias más habituales en modelos TTS comerciales, y ejecutarse en CPU o GPU mediante runtime ONNX.

Se trata de un modelo de tamaño reducido (repo de 0,1 GB), lo que sugiere un modelo ligero orientado a inferencia en tiempo real o en dispositivos con recursos limitados. No se dispone de información pública sobre el número de parámetros, el volumen de datos de entrenamiento ni resultados de benchmarks en la documentación proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto de LLM) |
| Tipos de cuantizacion | no disponible (pesos en ONNX; se desconoce si existen variantes cuantizadas) |
| Idiomas soportados | chino mandarín (zh-CN) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

VITS es una arquitectura de síntesis de voz end-to-end que combina un encoder de texto, un prior variacional, un decoder basado en flujos normalizadores y un discriminador adversarial entrenado con pérdidas de reconstrucción y adversariales. El modelo genera waveforms directamente a partir de la entrada textual, sin necesidad de un vocoder separado, lo que simplifica el pipeline de inferencia.

El modelo original fue entrenado por BricksDisplay (upstream `BricksDisplay/vits-cmn`) y Phoonnx lo ha reempaquetado en formato ONNX para su uso con la librería `phoonnx`. La entrada textual se procesa mediante `scriptconv`, que normaliza el texto y aplica un `GraphemePhonemizer` para convertir grafemas en la representación de entrada del modelo. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o fine-tuning adicionales.

## Capacidades

- Síntesis de voz en chino mandarín (zh-CN) a partir de texto.
- Acepta entrada en caracteres chinos y en pinyin.
- Generación de audio en formato WAV mediante la API `synthesize_wav` de phoonnx.
- Integración con OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Inferencia sobre runtime ONNX (CPU o GPU).
- No soporta tool calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje).
- No dispone de capacidades multimodales más allá de TTS (sin visión ni audio de entrada).

## Casos de uso

- **Asistentes de voz en OVOS**: el modelo se integra directamente como plugin TTS (`ovos-tts-plugin-phoonnx`) para dotar de voz en mandarín a asistentes domésticos open source, con configuración mediante `mycroft.conf`.
- **Lectura de textos en aplicaciones de accesibilidad**: conversión de documentos o notificaciones en chino a audio para usuarios con discapacidad visual, aprovechando el reducido tamaño del modelo para despliegue local.
- **Generación de audiolibros o contenido narrado en mandarín**: síntesis por lotes de textos largos divididos en frases, con salida WAV lista para postprocesado.
- **Sistemas de anuncios o megafonía automatizada**: generación dinámica de avisos en chino en entornos como transporte o comercio, donde se requiere baja latencia y ejecución en hardware modesto.
- **Prototipado de interfaces conversacionales en chino**: integración en pipelines de investigación o demos de chatbots donde se necesita una capa TTS ligera y con licencia permisiva.
- **Generación de datasets de audio sintético**: creación de corpus de voz en mandarín para entrenamiento o evaluación de otros sistemas de reconocimiento de voz, al poder ejecutarse localmente sin dependencias de servicios cloud.
- **Integración en dispositivos embebidos o edge**: al estar en ONNX y con un repo de 0,1 GB, puede desplegarse en dispositivos con recursos limitados mediante runtime ONNX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada**: no disponible con precisión; el repo de 0,1 GB sugiere un modelo ligero que probablemente cabe en menos de 1 GB de memoria en inferencia.
- **GPU recomendadas**: no disponible; por tamaño, cualquier GPU consumer moderna (RTX 3060 o superior) debería ser suficiente, aunque no hay datos confirmados.
- **Consumer GPU**: probablemente sí, dado el tamaño reducido del modelo, pero no confirmado en la documentación.
- **Opciones de despliegue**: phoonnx (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS, runtime ONNX (ONNX Runtime) directamente.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Contexto/entrada |
|---|---|---|---|---|---|
| vits-zh_cn-cmn-graphemes (este) | VITS | zh-CN | Apache 2.0 | ONNX | Caracteres, pinyin |
| BricksDisplay/vits-cmn (upstream) | VITS | zh-CN | Apache 2.0 | ONNX | Caracteres, pinyin |
| Otros modelos VITS de la colección Phoonnx | VITS | Varios | Variable | ONNX | Variable |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo especializado únicamente en chino mandarín (zh-CN); no soporta otros idiomas.
- No es un modelo de lenguaje: no genera texto, no razona ni soporta tool calling.
- No se dispone de información sobre sesgos en la voz generada (género, acento, prosodia) ni sobre la diversidad del dataset de entrenamiento.
- Riesgo de pronunciación incorrecta en textos con caracteres polifónicos, nombres propios o palabras extranjeras, dado que la entrada se procesa mediante un `GraphemePhonemizer` genérico.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la licencia del modelo upstream (`BricksDisplay/vits-cmn`) y de los datos de entrenamiento originales.
- El modelo tiene muy pocas descargas (21) y ningún "like", lo que indica escasa validación por parte de la comunidad; conviene evaluar la calidad de síntesis antes de usarlo en producción.
- No hay información sobre latencia, calidad perceptual (MOS) ni estabilidad en textos largos.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Phoonnx/vits-zh_cn-cmn-graphemes)
- [Modelo upstream BricksDisplay/vits-cmn](https://huggingface.co/BricksDisplay/vits-cmn/tree/main/onnx)
- [Repositorio phoonnx](https://github.com/TigreGotico/phoonnx)
- [Repositorio scriptconv](https://github.com/TigreGotico/scriptconv)
- [Colección VITS de Phoonnx](https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65)
