# q3146dq4/Supertonic-3-LiteRT-Static-MultiPreset-GELU

## Resumen

Supertonic-3-LiteRT-Static-MultiPreset-GELU es una conversión a LiteRT/TFLite del modelo de síntesis de voz Supertonic-3, desarrollado originalmente por Supertone (supertone-inc). Esta variante, creada por el usuario q3146dq4, parte de los grafos ONNX oficiales y los especializa en un conjunto de formas estáticas predefinidas para texto (T) y latente (L), lo que permite que el runtime LiteRT/XNNPACK ejecute grafos de forma fija sin perder flexibilidad práctica. El modelo resuelve el problema de ejecutar TTS multilingüe de alta calidad en dispositivos locales (CPU, móviles) sin depender de la nube ni de GPU.

El modelo base Supertonic-3 tiene 99 millones de parámetros y soporta 31 idiomas. Esta conversión mantiene la precisión FP32 (sin cuantización) y aplica una fusión exacta del patrón GELU durante la conversión. El repositorio incluye cuatro componentes TFLite (predictor de duración, codificador de texto, estimador de vectores y vocoder) que suman aproximadamente 417 MiB. La selección de presets se realiza en tiempo de ejecución eligiendo la firma más pequeña que contenga la entrada, lo que reduce el cómputo en frases cortas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TTS basado en flujo (flow-based) con componentes separados: duration predictor, text encoder, vector estimator y vocoder |
| Parametros totales | 99M (modelo base Supertonic-3) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Presets de texto de 32 a 128 tokens (T32, T48, T64, T80, T96, T112, T128) |
| Tipos de cuantizacion | FP32 (sin cuantizacion; no hay INT8, INT4 ni FP16) |
| Idiomas soportados | 31: en, ko, ja, ar, bg, cs, da, de, el, es, et, fi, fr, hi, hr, hu, id, it, lt, lv, nl, pl, pt, ro, ru, sk, sl, sv, tr, uk, vi |
| Licencia | OpenRAIL |
| Formato de pesos | LiteRT/TFLite (archivos .tflite) |

## Arquitectura y entrenamiento

El modelo base Supertonic-3 es un sistema TTS de código abierto diseñado para inferencia local con ONNX Runtime. Su arquitectura se compone de cuatro módulos principales: un predictor de duración, un codificador de texto, un estimador de vectores y un vocoder. El predictor de duración estima la duración fonética, el codificador de texto transforma los tokens de entrada en representaciones intermedias, el estimador de vectores genera las características latentes y el vocoder sintetiza la forma de onda final. El entrenamiento original del modelo base no se detalla en la información disponible, pero se sabe que soporta 31 idiomas y que el sistema está optimizado para ejecución en CPU.

Esta conversión concreta toma los grafos ONNX dinámicos oficiales y los especializa en 7 presets de texto (T) y 7 presets de latente (L), generando 49 firmas para el estimador de vectores (combinación T×L) y 7 firmas para cada uno de los otros componentes. En tiempo de ejecución se selecciona el preset más pequeño que pueda contener la entrada real, evitando el desperdicio de cómputo de una forma fija grande. Durante la conversión se aplicó una fusión exacta del patrón GELU, lo que mejora la eficiencia en LiteRT. El proceso de conversión utilizó Python 3.12, PyTorch 2.13.0, litert-torch 0.9.4, ai-edge-litert 2.2.0, ONNX 1.21.0, ONNX Runtime 1.29.0 y onnx2torch 1.5.15.

## Capacidades

- Síntesis de voz multilingüe en 31 idiomas, incluyendo español, inglés, coreano, japonés, árabe, alemán, francés, hindi, italiano, portugués, ruso, turco, vietnamita y otros.
- Ejecución completamente local en CPU, sin necesidad de GPU, nube ni API externa.
- Inferencia de baja latencia gracias a la especialización de formas estáticas y la fusión GELU.
- Selección automática de presets (AutoBucket) que elige la firma más pequeña que contenga la entrada, optimizando el uso de cómputo.
- Compatible con LiteRT/XNNPACK, lo que permite despliegue en dispositivos móviles y embebidos.
- Paridad numérica casi exacta con el modelo ONNX original (errores máximos del orden de 1e-5 a 1e-6).
- No incluye capacidades de tool calling, agentes ni razonamiento; es exclusivamente un modelo de síntesis de voz.

## Casos de uso

- Asistentes de voz en dispositivos móviles: el modelo puede generar respuestas habladas en 31 idiomas directamente en el teléfono, sin conexión, gracias a su tamaño compacto (417 MiB) y su ejecución en CPU con LiteRT.
- Accesibilidad para personas con discapacidad visual: integración en lectores de pantalla que necesitan síntesis de voz local y multilingüe, preservando la privacidad del usuario al no enviar texto a servidores externos.
- Sistemas de navegación GPS sin conexión: generación de instrucciones de voz en tiempo real con baja latencia, incluso en zonas sin cobertura de red.
- Audioguías y aplicaciones educativas: conversión de contenido textual a audio en múltiples idiomas para museos, cursos online o aplicaciones de aprendizaje de idiomas, con control de velocidad y voz.
- Dispositivos IoT y wearables: síntesis de voz para relojes inteligentes, altavoces inteligentes o electrodomésticos, donde el consumo de recursos debe ser mínimo y la privacidad es crítica.
- Doblaje y creación de contenido: generación de voces sintéticas para vídeos, podcasts o animaciones, con soporte multilingüe y ejecución local que evita costes de API.

## Benchmarks y rendimiento

La model card incluye una tabla de paridad numérica entre esta conversión LiteRT y los grafos ONNX especializados de referencia:

| Componente | Error maximo absoluto | RMSE |
|---|---|---|
| Duration Predictor | 2.38e-6 | 2.38e-6 |
| Text Encoder | 8.30e-5 | 1.22e-6 |
| Vector Estimator | 7.39e-6 | 9.71e-7 |
| Vocoder | 3.38e-6 | 1.83e-7 |

También se realizó un benchmark de velocidad en CPU (PC/WSL, 8 hilos) comparando tres implementaciones: el ONNX dinámico oficial, la conversión LiteRT de Soniqo y esta versión Static MultiPreset. El benchmark midió speedups medianos de síntesis extremo a extremo para distintos números de pasos de flujo (4, 8, 16, 32, 64) y longitudes de frase. Sin embargo, la tabla de speedups está incompleta en la información proporcionada, por lo que no se pueden citar valores concretos. Se confirma que el selector AutoBucket recorre todo el rango de presets (desde T32/L32 hasta T128/L128) en función de la longitud real de la frase.

## Requisitos de hardware

- Inferencia en CPU: el modelo está diseñado para ejecutarse en CPU con LiteRT/XNNPACK; no requiere GPU.
- Tamaño total de los pesos: aproximadamente 417 MiB en FP32, lo que cabe en la mayoría de dispositivos móviles modernos.
- VRAM: no aplica (inferencia en CPU).
- GPUs recomendadas: no necesarias; el modelo puede ejecutarse en cualquier CPU compatible con LiteRT (x86, ARM).
- Opciones de despliegue: LiteRT (TensorFlow Lite), XNNPACK, y cualquier runtime que soporte TFLite. No se menciona compatibilidad con vLLM, llama.cpp u Ollama, ya que es un modelo TTS, no un LLM.
- Latencia y throughput: no se proporcionan valores absolutos; los benchmarks comparativos indican speedups frente al ONNX dinámico, pero los datos completos no están disponibles en la información facilitada.

## Comparativa con modelos similares

| Modelo | Formato | Parametros | Idiomas | Cuantizacion | Licencia |
|---|---|---|---|---|---|
| Supertone/supertonic-3 (original) | ONNX dinámico | 99M | 31 | FP32 | OpenRAIL |
| soniqo/Supertonic-3-LiteRT | LiteRT | 99M | 31 | no especificado | OpenRAIL |
| q3146dq4/Supertonic-3-LiteRT-Static-MultiPreset-GELU | LiteRT estático multi-preset | 99M | 31 | FP32 | OpenRAIL |

La principal diferencia de esta versión frente al ONNX original es la especialización en formas estáticas, que permite una mejor optimización en LiteRT/XNNPACK. Frente a la conversión de Soniqo, esta versión aplica una fusión GELU exacta y ofrece múltiples presets de forma estática en lugar de una única forma fija. No se dispone de comparativas con otros modelos TTS como Piper o Coqui, ya que no se mencionan en la información proporcionada.

## Limitaciones y advertencias

- El modelo es una conversión FP32, por lo que ocupa más espacio que una versión cuantizada (417 MiB frente a los ~100 MiB que podría ocupar una versión INT8). No se incluyen versiones INT8, INT4 ni FP16.
- Los presets estáticos pueden desperdiciar cómputo si la entrada real es mucho menor que el preset seleccionado, aunque el mecanismo AutoBucket mitiga este problema eligiendo el preset más pequeño posible.
- No se han publicado resultados de benchmarks en dispositivos Android o ARM; los datos de velocidad provienen de un entorno PC/WSL con 8 hilos de CPU.
- La licencia OpenRAIL puede imponer restricciones de uso para ciertos casos (por ejemplo, generación de voces sin consentimiento). Es recomendable revisar los términos completos de la licencia antes de un despliegue comercial.
- El modelo no incluye capacidades de razonamiento, tool calling ni procesamiento de visión; es exclusivamente un sistema de síntesis de voz.
- No se dispone de información sobre sesgos específicos del modelo, pero al ser un TTS multilingüe, la calidad puede variar entre idiomas y acentos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/q3146dq4/Supertonic-3-LiteRT-Static-MultiPreset-GELU
- Modelo base: https://huggingface.co/Supertone/supertonic-3
- Web del proyecto Supertonic 3: https://supertonic3.github.io/
- Repositorio GitHub de Supertone: https://github.com/supertone-inc/supertonic
- Conversión LiteRT de Soniqo: https://huggingface.co/soniqo/Supertonic-3-LiteRT
- Conversión LiteRT de Reza2kn: https://huggingface.co/Reza2kn/supertonic-3-litert
