# mohamedrayyan/mms-tts-dhivehi-onnx

## Resumen

El modelo `mohamedrayyan/mms-tts-dhivehi-onnx` es un conjunto de exportaciones en formato ONNX del modelo de síntesis de voz MMS-TTS (VITS) afinado para el idioma dhivehi (maldivo). El autor, mohamedrayyan, ha convertido los pesos de PyTorch a ONNX Runtime en dos precisiones (fp32 e int8) para permitir el despliegue sin dependencias de PyTorch, orientado a un servidor TTS de baja latencia llamado Adufoshi (Voicebox Dhivehi). El repositorio incluye seis variantes de voz: tres femeninas (f01, f02, f03), una masculina (m01) y dos voces clonadas (spk01 femenina y masculina). Cada archivo fp32 pesa aproximadamente 109 MB y cada versión int8 unos 37 MB, lo que lo hace adecuado para entornos con recursos limitados.

Este modelo es relevante porque el dhivehi es un idioma con escasos recursos en el ámbito del procesamiento de voz, y esta iniciativa proporciona una solución práctica y ligera para integrar síntesis de voz en aplicaciones que requieran inferencia en tiempo real o en dispositivos sin GPU. La licencia MIT permite uso comercial sin restricciones, lo que facilita su adopción en productos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (basado en MMS-TTS de Facebook AI Research) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (modelo de voz, no texto) |
| Tipos de cuantizacion | fp32 e int8 (archivos `.onnx` y `.int8.onnx`) |
| Idiomas soportados | dv (dhivehi) |
| Licencia | MIT |
| Formato de pesos | ONNX (`.onnx`) |

## Arquitectura y entrenamiento

El modelo base es MMS-TTS, un sistema de síntesis de voz multilingüe desarrollado por Facebook AI Research que utiliza la arquitectura VITS (Variational Inference with adversarial Training for end-to-end Text-to-Speech). VITS combina un codificador de texto, un decodificador de forma de onda y un discriminador adversarial, todo entrenado de extremo a extremo. El modelo original de MMS fue preentrenado en más de 1.100 idiomas, y posteriormente se realizó un afinado (fine-tuning) específico para dhivehi, probablemente con datos de habla de hablantes nativos. Los detalles exactos del conjunto de datos de afinado, el número de pasos de entrenamiento o el uso de técnicas como RLHF no están disponibles en la información proporcionada. La exportación a ONNX se realizó para eliminar la dependencia de PyTorch y optimizar la inferencia en entornos de producción.

## Capacidades

- Síntesis de voz en dhivehi a partir de texto, con seis voces distintas (tres femeninas, una masculina y dos clonadas).
- Conversión de texto a voz de baja latencia gracias a la exportación ONNX y a la cuantización int8.
- Compatible con ONNX Runtime, lo que permite ejecución en CPU, GPU o dispositivos edge.
- No incluye capacidades de razonamiento, generación de código, tool calling ni procesamiento de visión, ya que es un modelo puramente de síntesis de voz.

## Casos de uso

- Asistentes de voz en dhivehi: integrar el modelo en aplicaciones de asistente virtual para responder con voz natural en maldivo, aprovechando la baja latencia de la versión int8.
- Accesibilidad para personas con discapacidad visual: convertir artículos, noticias o mensajes de texto en audio en dhivehi, facilitando el acceso a la información.
- Audioguías y contenido educativo: generar narraciones en dhivehi para cursos, tutoriales o guías turísticas, usando las distintas voces para diferenciar personajes o secciones.
- Sistemas de respuesta interactiva (IVR): sustituir locuciones pregrabadas en centralitas telefónicas por síntesis dinámica, reduciendo costes de grabación y permitiendo actualizar mensajes al instante.
- Clonación de voz para doblaje: las variantes spk01 (femenina y masculina) permiten generar voz con una identidad específica, útil para doblaje de vídeos o podcasts en dhivehi.
- Pruebas de concepto y prototipado: al ser un modelo ligero (37 MB en int8), se puede desplegar en un portátil o en un contenedor Docker para validar rápidamente ideas de producto que requieran voz en dhivehi.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de métricas como MOS (Mean Opinion Score), WER (Word Error Rate) ni comparaciones con otros sistemas TTS para dhivehi.

## Requisitos de hardware

- VRAM estimada: no requiere GPU; la inferencia puede ejecutarse en CPU con ONNX Runtime. La versión int8 (37 MB) es adecuada para dispositivos con poca memoria.
- GPU recomendadas: no necesarias, aunque se puede usar cualquier GPU compatible con ONNX Runtime (p. ej., NVIDIA con CUDA) para acelerar la inferencia si se desea.
- Compatibilidad con hardware de consumo: sí, cabe en cualquier ordenador moderno, Raspberry Pi (con limitaciones de rendimiento) o dispositivos móviles.
- Opciones de despliegue: ONNX Runtime (Python, C++, C#), servidores de inferencia como Triton Inference Server, o integración directa en aplicaciones mediante el runtime.
- Latencia y throughput: no se proporcionan datos oficiales, pero la cuantización int8 y el tamaño reducido sugieren una latencia de decenas de milisegundos por frase en CPU moderna.

## Comparativa con modelos similares

No se dispone de información sobre otros modelos TTS específicos para dhivehi con los que comparar directamente. El modelo base MMS-TTS de Facebook AI Research es el referente multilingüe, pero no hay datos de rendimiento comparativo en dhivehi. Alternativas genéricas como Coqui TTS o Piper podrían adaptarse, pero no se han encontrado modelos afinados para este idioma en la información disponible.

## Limitaciones y advertencias

- El modelo está afinado únicamente para dhivehi; no soporta otros idiomas.
- La calidad de la voz puede ser inferior a la de sistemas comerciales para idiomas mayoritarios, y no se han publicado evaluaciones subjetivas de naturalidad.
- Las voces clonadas (spk01) pueden presentar artefactos o variaciones de pronunciación no deseadas, especialmente en textos largos o con nombres extranjeros.
- No se especifica el contexto máximo de entrada (número de caracteres por frase), por lo que textos muy largos podrían requerir segmentación.
- La licencia MIT permite uso comercial, pero el modelo se distribuye sin garantías; el autor no ofrece soporte técnico.
- Al ser una exportación ONNX, no se incluyen los pesos originales de PyTorch ni el código de entrenamiento, lo que limita la posibilidad de realizar más afinado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mohamedrayyan/mms-tts-dhivehi-onnx
- Espacio de demostración TTS Dhivehi: https://huggingface.co/spaces/dhivehihacker/tts-dhivehi-demo-mms
- Repositorio del servidor TTS Adufoshi: https://huggingface.co/mohamedrayyan/chatterbox-tts-dhivehi
- Documentación de MMS en fairseq: https://github.com/facebookresearch/fairseq/blob/main/examples/mms/README.md
- Organización DhivehiAI en GitHub: https://github.com/DhivehiAI
