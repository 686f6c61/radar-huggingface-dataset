# p424p424/vieneu-tts-v3-turbo-onnx

## Resumen

VieNeu-TTS v3 Turbo es un modelo de síntesis de voz (text-to-speech) en vietnamés, desarrollado originalmente por Phạm Nguyễn Ngọc Bảo (pnnbao-ump) y entrenado desde cero sobre aproximadamente 10.000 horas de habla en inglés y vietnamés. Este repositorio concreto, `p424p424/vieneu-tts-v3-turbo-onnx`, es un reempaquetado en formato ONNX del modelo original, orientado a su ejecución en dispositivos de bajos recursos o integración en aplicaciones Flutter/Dart. No se trata de un modelo nuevo, sino de una distribución optimizada para inferencia sin depender de PyTorch.

La arquitectura combina un backbone basado en Qwen3 (para el procesamiento del prompt y la generación por pasos), una cabeza acústica que opera por codebooks y un decodificador de audio MOSS que convierte los códigos en audio de 48 kHz. El repositorio incluye además un diccionario de pronunciación vietnamita (sea-g2p) y veinte voces predefinidas. El tamaño total del repositorio es de unos 273 MB, con un conjunto de trabajo estimado de 650 MB durante la generación.

La relevancia de este modelo radica en que permite síntesis de voz vietnamita de alta calidad sin necesidad de GPU, gracias a que el motor `vieneu` puede ejecutarse íntegramente sobre ONNX Runtime en CPU, lo que facilita su despliegue en aplicaciones móviles y sistemas embebidos. Además, al estar bajo licencia Apache 2.0, es totalmente libre para uso comercial y académico.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone Qwen3 (paso de prompt y paso de decodificación) + cabeza acústica + codec MOSS (decodificador de audio 48 kHz) |
| Parametros totales | no disponible (repositorio de 273 MB) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen en float32; no se mencionan cuantizaciones) |
| Idiomas soportados | vietnamita (vi) e inglés (el modelo original se entrenó en 10,000 horas de habla inglés-vietnamita) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (archivos `.onnx` + pesos compartidos en `.data`), tablas de embeddings en float32 plano, diccionario g2p en binario |

## Arquitectura y entrenamiento

El modelo original, VieNeu-TTS v3 Turbo, fue diseñado desde cero por pnnb y entrenado sobre aproximadamente 10.000 horas de habla en inglés y vietnamita. No es un ajuste fino ni una adaptación de otros modelos TTS existentes. La arquitectura emplea un backbone de tipo Qwen3 para procesar el texto de entrada (paso de prefill) y para generar cada paso de decodificación (paso de decode). La cabeza acústica se invoca una vez por cada codebook del tokenizador de audio MOSS, que convierte los códigos en audio de 48 kHz.

En este repositorio, el modelo se distribuye como exportación ONNX: los pesos del backbone se comparten entre los dos grafos (`vieneu_prefill.onnx` y `vieneu_decode_step.onnx`) mediante un archivo de datos común (`vieneu_backbone_shared.data`). Las tablas de embeddings atadas se extraen como float32 plano para poder ser utilizadas desde Dart, y se incluye el diccionario de pronunciación vietnamita `sea_g2p.bin` (versión 0.9.0) para el paso de grafema a fonema. El motor `vieneu` permite ejecutar el modelo en CPU con ONNX Runtime sin importar PyTorch, y en GPU cambia automáticamente al motor PyTorch con inferencia por lotes.

## Capacidades

- Síntesis de voz en vietnamita a 48 kHz, con calidad profesional.
- Soporte para múltiples voces: incluye 20 embeddings de altavoz predefinidos (`voices.json`).
- Ejecución en CPU sin dependencias de PyTorch (gracias a ONNX Runtime).
- Integración nativa con el SDK `vieneu` para Flutter/Dart: descarga de modelos y generación de audio.
- Diccionario de pronunciación vietnamita integrado (sea-g2p) para una correcta conversión grafema-fonema.
- Soporte de inferencia por lotes cuando se usa el motor PyTorch en GPU.
- Compatibilidad con arquitecturas de bajo consumo (on-device).

## Casos de uso

- **Aplicaciones móviles de lectura en voz alta**: se puede integrar en apps Flutter para leer noticias, libros o mensajes en vietnamita, gracias a su ejecución en CPU sin GPU y a su tamaño contenido.
- **Asistentes de voz en dispositivos de bajos recursos**: permite añadir síntesis de voz vietnamita a smart speakers o dispositivos IoT con CPU limitada, usando ONNX Runtime.
- **Accesibilidad**: lectura de pantalla en vietnamita para personas con discapacidad visual, con voces naturales y de alta calidad.
- **Aprendizaje de idiomas**: generación de audio de ejemplo para estudiantes de vietnamita o inglés, con control de pronunciación mediante el diccionario g2p.
- **Generación de contenido multimedia**: creación de narraciones para vídeos, audiolibros o podcasts en vietnamita, integrando el modelo en pipelines de producción.
- **Sistemas de respuesta por voz (IVR)**: integración en centralitas telefónicas o chatbots de voz en vietnamita, con la posibilidad de ejecutarse en servidores CPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como MMLU, HumanEval o GSM8K (no aplicables a un modelo TTS), ni de comparativas objetivas de calidad de síntesis (como MOS) frente a otros sistemas.

## Requisitos de hardware

- **VRAM estimada**: no aplicable en CPU; en GPU, el modelo usa el motor PyTorch, pero no se especifica la VRAM necesaria.
- **GPU recomendadas**: no se indica ninguna GPU específica; en el modo CPU se ejecuta con ONNX Runtime.
- **CPU**: funciona en CPU sin PyTorch; el repo ocupa 273 MB y el conjunto de trabajo durante la generación es de unos 650 MB.
- **Opciones de despliegue**: SDK `vieneu` (Flutter/Dart), ONNX Runtime para CPU, motor PyTorch para GPU (con batch automático).
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de comparación con otros modelos TTS vietnamitas o multilingües en la información proporcionada. Se puede señalar que la alternativa principal es el modelo original en formato PyTorch (`pnnbao-ump/VieNeu-TTS-v3-Turbo`), que ofrece las mismas capacidades pero requiere PyTorch para la inferencia. Otras opciones como `ngoctham/VieNeu-TTS-v3-Turbo` también existen en Hugging Face, pero no se dispone de datos comparativos de calidad o rendimiento.

## Limitaciones y advertencias

- El modelo está especializado en vietnamita e inglés; no soporta otros idiomas.
- El diccionario `sea_g2p.bin` debe coincidir con la versión del motor sea-g2p compilado en el paquete (0.9.0). Mezclar versiones puede producir audio fluido pero con palabras incorrectas.
- No se han publicado cuantizaciones ni versiones optimizadas para reducir aún más el tamaño o el consumo de memoria.
- Aunque la licencia Apache 2.0 permite uso comercial, se debe mantener el aviso de atribución correspondiente.
- No se mencionan sesgos específicos ni riesgos de alucinación, pero como cualquier TTS, puede producir errores de pronunciación en palabras poco comunes o nombres propios.
- Para producción, se recomienda validar la pronunciación de términos técnicos o nombres extranjeros con el diccionario g2p.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/p424p424/vieneu-tts-v3-turbo-onnx
- Modelo original en Hugging Face: https://huggingface.co/pnnbao-ump/VieNeu-TTS-v3-Turbo
- Repositorio GitHub del SDK `vieneu`: https://github.com/pnnbao97/VieNeu-TTS
- Diccionario sea-g2p en GitHub: https://github.com/pnnbao97/sea-g2p
- Variante alternativa del modelo en Hugging Face: https://huggingface.co/ngoctham/VieNeu-TTS-v3-Turbo</think>## Resumen

VieNeu-TTS v3 Turbo es un modelo de síntesis de voz (text-to-speech) en vietnamita, desarrollado originalmente por Phạm Nguyễn Ngọc Bảo (pnnbao) y entrenado desde cero sobre aproximadamente 10.000 horas de habla en inglés y vietnamés. Este repositorio concreto, `p424p424/vieneu-tts-v3-turbo-onnx`, no es un modelo nuevo, sino un reempaquetado en formato ONNX del modelo original, pensado para su ejecución en dispositivos con recursos limitados y para su integración en aplicaciones Flutter/Dart. El objetivo es eliminar la dependencia de PyTorch en la inferencia, permitiendo que el motor funcione exclusivamente con ONNX Runtime en CPU.

La arquitectura combina un backbone basado en Qwen3 (para el paso de prompt y la decodificación por pasos), una cabeza acústica que se invoca por cada codebook del tokenizador de audio MOSS, y un decodificador que convierte los códigos en audio de 48 kHz. El repositorio incluye además el diccionario de pronunciación vietnamita `sea_g2p.bin` y veinte voces predefinidas. El tamaño total del repositorio es de aproximadamente 273 MB, con un conjunto de trabajo estimado en 650 MB durante la generación.

La relevancia de este proyecto radica en que permite síntesis de voz vietnamita de alta calidad sin necesidad de GPU, lo que facilita su despliegue en aplicaciones móviles, sistemas embebidos y servidores de bajo coste. Al estar bajo licencia Apache 2.0, es totalmente libre para uso comercial y académico.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone Qwen3 (prompt pass y decode step) + cabeza acústica + codec MOSS (decodificador de audio 48 kHz) |
| Parametros totales | no disponible (repositorio de 273 MB) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen en float32, sin cuantización declarada) |
| Idiomas soportados | vietnamita (vi) e inglés (el modelo original se entrenó en ~10.000 horas de habla inglés-vietnamita) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (archivos `.onnx` con pesos compartidos en `.data`), tablas de embeddings en float32 plano, diccionario g2p en binario |

## Arquitectura y entrenamiento

El modelo original, VieNeu-TTS v3 Turbo, fue diseñado desde cero por su autor, Phạm Nguyễn Ngọc Bảo, y entrenado sobre aproximadamente 10.000 horas de habla en inglés y vietnamita. No se trata de un ajuste fino ni de una adaptación de otros sistemas TTS existentes. La arquitectura emplea un backbone Qwen3 para procesar el texto de entrada (prefill) y para generar cada paso de la síntesis (decode step). La cabeza acústica se ejecuta una vez por cada codebook del tokenizer MOSS, y las tablas de embeddings atadas se extraen como float32 plano para poder puntuarse desde Dart. El motor `vieneu` permite ejecutar el modelo en CPU con ONNX Runtime sin importar PyTorch, y en GPU cambia automáticamente al motor PyTorch con inferencia por lotes automática.

En este reempaquetado, los pesos del backbone se comparten entre los dos grafos ONNX (`vieneu_prefill.onnx` y `vieneu_decode_step.onnx`) mediante un archivo de datos externo (`vieneu_backbone_shared.data`). También se incluye el diccionario de pronunciación vietnamita `sea_g2p.bin` (versión 0.9.0) para la conversión de grafemas a fonemas, lo que garantiza una pronunciación correcta de las palabras vietnamitas.

## Capacidades

- Síntesis de voz en vietnamita a 48 kHz, con calidad profesional.
- Soporte de múltiples voces: incluye 20 embeddings de voz predefinidos (`voices.json`).
- Ejecución en CPU sin dependencias de PyTorch (solo ONNX Runtime).
- Integración nativa con el SDK `vieneu` para Flutter/Dart: descarga de modelos y generación de audio.
- Diccionario de pronunciación vietnamita (sea-g2p) para una conversión fonética precisa.
- Soporte de inferencia por lotes en GPU mediante el motor PyTorch (cuando está disponible).
- Compatibilidad con dispositivos de bajo consumo (on-device).

## Casos de uso

- **Aplicaciones de lectura en voz alta**: se puede integrar en apps Flutter para leer artículos, libros o mensajes en vietnamita, aprovechando su ejecución en CPU y su tamaño reducido (273 MB).
- **Asistentes de voz en dispositivos IoT**: permite añadir síntesis de voz vietnamita a altavoces inteligentes o dispositivos con recursos limitados, sin necesidad de GPU.
- **Accesibilidad**: lectura de pantalla en vietnamita para personas con discapacidad visual, con voces naturales y control de pronunciación mediante el diccionario g2p.
- **Aprendizaje de idiomas**: generación de ejemplos de pronunciación en vietnamita e inglés, ideal para aplicaciones de idiomas.
- **Producción de contenido audiovisual**: creación de narraciones para vídeos, audiolibros o podcasts en vietnamita, integrándose en pipelines de generación de contenido.
- **Sistemas de respuesta por voz (IVR)**: integración en centralitas telefónicas o chatbots de voz en vietnamita, con despliegue en servidores CPU o GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas objetivas de calidad de voz (como MOS, WER en TTS, etc.) ni comparativas con otros modelos en la documentación del repositorio.

## Requisitos de hardware

- **VRAM estimada**: no aplicable en modo CPU; en modo GPU se usa el motor PyTorch, pero no se especifica el consumo de VRAM.
- **GPU recomendadas**: no se indica ninguna GPU concreta; el modelo puede ejecutarse en CPU.
- **CPU**: se ejecuta correctamente en CPU con ONNX Runtime; el conjunto de trabajo durante la generación es de aproximadamente 650 MB.
- **Opciones de despliegue**: SDK `vieneu` (Flutter/Dart), ONNX Runtime, motor PyTorch para GPU (con batch automático).
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos TTS vietnamitas o multilingües en la información proporcionada. Como referencia, la alternativa principal es el modelo original en formato PyTorch (`pnnbao-ump/VieNeu-TTS-v3-Turbo`), que ofrece las mismas capacidades pero requiere PyTorch para la inferencia. Existe otra variante (`ngoctham/VieNeu-TTS-v3-Turbo`) en Hugging Face, pero no se han publicado datos de rendimiento o calidad en ninguno de estos repositorios.

## Limitaciones y advertencias

- El modelo está optimizado para vietnamita e inglés; no soporta otros idiomas.
- El diccionario `sea_g2p.bin` debe coincidir con la versión del motor sea-g2p compilado en el paquete (0.9.0). Mezclar versiones puede producir audio fluido pero con palabras incorrectas.
- No se han publicado cuantizaciones ni optimizaciones adicionales; los pesos se distribuyen en float32, lo que puede limitar la eficiencia en dispositivos con muy poca memoria.
- Aunque la licencia Apache 2.0 permite uso comercial, se debe conservar el aviso de atribución correspondiente.
- No se han documentado sesgos específicos, pero como cualquier sistema TTS, puede producir errores de pronunciación en nombres propios o términos extranjeros.
- En producción, se recomienda validar la versión del diccionario g2p y la configuración del motor para evitar fallos de pronunciación silenciosos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/p424p424/vieneu-tts-v3-turbo-onnx
- Modelo original en Hugging Face: https://huggingface.co/pnnbao-ump/VieNeu-TTS-v3-Turbo
- Repositorio GitHub del SDK `vieneu`: https://github.com/pnnbao97/VieNeu-TTS
- Diccionario sea-g2p en GitHub: https://github.com/pnnbao97/sea-g2p
- Variante alternativa en Hugging Face: https://huggingface.co/ngoctham/VieNeu-TTS-v3-Turbo
