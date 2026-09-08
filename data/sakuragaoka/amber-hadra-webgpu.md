# Sakuragaoka/amber-hadra-webgpu

## Resumen

Sakuragaoka/amber-hadra-webgpu es una conversión a formato ONNX del modelo de síntesis de voz HADRA, un fine-tune de Habibi-TTS/F5-TTS especializado en darija marroquí. El proyecto está orientado a la ejecución en navegador mediante ONNX Runtime Web con WebGPU, lo que permite generar audio de voz directamente en el cliente sin necesidad de servidores dedicados.

El repositorio no contiene un modelo entrenado de forma independiente; en su lugar, convierte los pesos oficiales de HADRA en tres componentes ONNX: un encoder, un transformer en FP16 y un decoder, junto con el vocabulario y un archivo de referencia de voz. El tamaño total del repositorio es de 0,8 GB. La licencia es Apache-2.0, lo que facilita su uso en aplicaciones comerciales con la atribución correspondiente.

Su relevancia radica en la posibilidad de ejecutar un modelo TTS de un dialecto árabe específico en entornos web ligeros, sin depender de infraestructura de inferencia externa. Esto abre la puerta a aplicaciones de voz en darija con despliegue sencillo y costes reducidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | F5-TTS (fine-tune HADRA de Habibi-TTS) |
| Parametros totales | no disponible |
| Parametros activos | no aplica |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixto: FP16 (transformer), FP32 (encoder y decoder) |
| Idiomas soportados | Darija marroquí (árabe marroquí) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (encoder_fp32.onnx, transformer_fp16.onnx, decoder_fp32.onnx) |

## Arquitectura y entrenamiento

El modelo es una conversión a ONNX del modelo HADRA, que a su vez es un fine-tune de Habibi-TTS/F5-TTS entrenado sobre el corpus DODa de habla en árabe marroquí. No se ha realizado ningún entrenamiento adicional en este repositorio; únicamente se han convertido los pesos originales a tres componentes ONNX para su uso con ONNX Runtime Web.

La conversión divide el modelo en un encoder, un transformer y un decoder. El transformer se almacena en precisión FP16 para reducir el tamaño y mejorar el rendimiento en dispositivos con WebGPU, mientras que el encoder y el decoder se mantienen en FP32. No se documentan técnicas de alineación como RLHF o DPO. La innovación principal es la adaptación del modelo a un formato ejecutable en navegador, lo que permite inferencia local sin backend.

## Capacidades

- Síntesis de texto a voz en darija marroquí a partir de texto escrito.
- Ejecución en navegador mediante ONNX Runtime Web con WebGPU, sin necesidad de servidor.
- Incluye un archivo de voz de referencia (F1.wav) correspondiente a la voz oficial "Salma", con su transcripción en árabe.
- Soporte para carga de los tres componentes ONNX por separado, facilitando su integración en aplicaciones web.
- No se han documentado capacidades de tool calling, razonamiento multi-paso ni soporte de agentes.

## Casos de uso

- Asistente de voz en aplicaciones web en darija: el modelo puede leer en voz alta textos en árabe marroquí directamente en el navegador, lo que resulta útil para interfaces de usuario accesibles y asistentes virtuales ligeros.
- Demostraciones interactivas de TTS: los desarrolladores pueden crear demos en línea que generen voz a partir de texto sin necesidad de infraestructura de servidor, gracias a la ejecución con WebGPU.
- Chatbots con voz para servicios en Marruecos: al combinar el modelo con un sistema de diálogo, se pueden ofrecer respuestas habladas en darija en aplicaciones de atención al cliente o información pública.
- Herramientas de aprendizaje de idiomas: el modelo puede pronunciar palabras y frases en darija para estudiantes, facilitando la práctica de pronunciación en entornos web.
- Accesibilidad para personas con discapacidad visual: lectura en voz alta de contenido web en darija, mejorando la inclusión de usuarios con dificultades de lectura.
- Prototipado rápido de aplicaciones de voz: al no requerir servidores de TTS, el modelo permite iterar rápidamente en funcionalidades de voz durante el desarrollo frontend.
- Aplicaciones web progresivas (PWA) con funcionamiento offline: la inferencia local con WebGPU permite que la síntesis de voz funcione sin conexión, una vez cargados los pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño del repositorio es de 0,8 GB, lo que sugiere que los pesos completos requieren aproximadamente esa cantidad de almacenamiento, pero el consumo de memoria en WebGPU depende de la implementación.
- GPU recomendadas: no disponible. Se requiere un navegador con soporte WebGPU, como Chrome o Edge en sus versiones recientes. No se especifican modelos concretos de GPU.
- Compatibilidad con GPU de consumo: al ejecutarse en WebGPU, puede funcionar en GPUs integradas y discretas de portátiles y equipos de sobremesa, siempre que el navegador lo soporte.
- Opciones de despliegue: ONNX Runtime Web con WebGPU en navegadores. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Formato | Ejecución | Licencia |
|---|---|---|---|
| Sakuragaoka/amber-hadra-webgpu | ONNX | WebGPU (navegador) | Apache-2.0 |
| Jip7e/habibi-tts-doda-darija | PyTorch | Servidor | Apache-2.0 |

No se dispone de información suficiente para comparar con otros modelos de la misma categoría más allá del modelo base original. La principal diferencia entre ambos es el formato de pesos y el entorno de ejecución: el primero está optimizado para navegador, mientras que el segundo está pensado para despliegue en servidor.

## Limitaciones y advertencias

- El modelo está limitado al darija marroquí; puede presentar un rendimiento deficiente con otros dialectos árabes o con árabe estándar moderno.
- Depende del soporte de WebGPU en el navegador. En navegadores o dispositivos sin WebGPU, el modelo no funcionará.
- Al ser una conversión de pesos, no se garantiza que el rendimiento sea idéntico al del modelo original en PyTorch, especialmente por la cuantización FP16 del transformer.
- No se han documentado sesgos específicos, pero los modelos de síntesis de voz pueden generar artefactos o variaciones en la pronunciación.
- La licencia Apache-2.0 permite el uso comercial, pero requiere conservar el aviso de licencia y atribuir al autor original.
- No hay información sobre la calidad de la voz, la latencia ni el consumo de recursos en diferentes dispositivos, por lo que se recomienda realizar pruebas de rendimiento antes de su uso en producción.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Sakuragaoka/amber-hadra-webgpu
- Modelo base original: https://huggingface.co/Jip7e/habibi-tts-doda-darija
- Documentación de ejecución de modelos con WebGPU en HuggingFace: https://huggingface.co/docs/transformers.js/guides/webgpu
