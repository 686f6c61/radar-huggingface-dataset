# Phoonnx/vits-de_de-glados_turret-low

## Resumen

vits-de_de-glados_turret-low es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, empaquetado en formato ONNX para la librería phoonnx. El modelo original fue entrenado por systemofapwne como parte del proyecto piper-de-glados, una colección de voces Piper que reproducen la voz del personaje GLaDOS del videojuego Portal, y posteriormente ha sido reempaquetado por Phoonnx para su uso con su librería de TTS basada en ONNX.

El modelo está especializado exclusivamente en alemán (de-DE) y toma como entrada fonemas generados por espeak-ng en alfabeto IPA, no texto directo. Esto significa que el pipeline completo requiere una fase de normalización y fonemización previa mediante scriptconv antes de alimentar el modelo. La variante "low" hace referencia a la calidad o configuración de entrenamiento del modelo original dentro de la jerarquía de calidades de Piper (low, medium, high).

Su relevancia es acotada: se trata de un modelo de nicho orientado a dar una voz característica concreta (la de GLaDOS) en aplicaciones de asistencia por voz como OVOS, con un tamaño de repositorio de 0,1 GB que lo hace extremadamente ligero y desplegable en hardware muy modesto. No es un modelo de propósito general ni compite con los grandes sistemas TTS neuronales actuales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible (pesos en ONNX; el tamaño del repo de 0,1 GB sugiere pesos ya compactos) |
| Idiomas soportados | aleman (de-DE) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak-ng en alfabeto IPA |
| Tamano del repositorio | 0,1 GB |
| Libreria de inferencia | phoonnx |
| Modelo upstream | systemofapwne/piper-de-glados (de/de_DE/glados-turret/low) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS, un sistema de síntesis de voz neuronal de extremo a extremo que combina un codificador de texto, un prior variacional, un decodificador basado en normalizing flows y un discriminador adversarial entrenado con aprendizaje adversarial (GAN). VITS genera formas de onda directamente a partir de fonemas, sin necesidad de vocoder externo, lo que simplifica el despliegue y reduce la latencia.

El modelo original proviene del proyecto piper-de-glados de systemofapwne, que adapta voces Piper para reproducir la voz de GLaDOS. La variante "low" indica una configuración de calidad reducida dentro de la escala de Piper, orientada a minimizar el coste computacional. No se dispone de información sobre el número exacto de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO; estos datos no están publicados en la información disponible. El modelo toma fonemas espeak-ng como entrada, lo que implica que la calidad de la síntesis depende críticamente de la corrección de la fonemización previa.

## Capacidades

- Síntesis de voz en alemán (de-DE) a partir de fonemas IPA generados por espeak-ng.
- Generación de audio en formato WAV mediante la API de phoonnx (`synthesize_wav`).
- Integración con el ecosistema OVOS a través del plugin `ovos-tts-plugin-phoonnx`.
- Reproducción de una voz con timbre característico (GLaDOS) para aplicaciones de asistencia por voz.
- Ejecución en navegador mediante phoonnx.js con entrada espeak o unicode.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (es un modelo TTS puro).
- No dispone de capacidades de visión, audio de entrada ni modo thinking.
- Capacidad multilingüe limitada exclusivamente al alemán.

## Casos de uso

- Asistente de voz doméstico en OVOS: el modelo se integra como plugin TTS (`ovos-tts-plugin-phoonnx`) y permite que un asistente personal responda en alemán con una voz distintiva, aprovechando su reducido tamaño para ejecutarse en dispositivos de bajos recursos.
- Videojuegos y modificaciones de Portal: reproduce la voz de GLaDOS en alemán para mods, doblajes amateur o proyectos de fan que necesiten una voz sintética con ese timbre concreto sin depender de grabaciones.
- Prototipado rápido de interfaces de voz: al ser un modelo ONNX de 0,1 GB, permite iterar en el diseño de experiencias conversacionales en alemán sin infraestructura GPU dedicada.
- Accesibilidad para personas con discapacidad visual: síntesis de textos en alemán para lectores de pantalla o sistemas de lectura de documentos, con baja latencia gracias a la arquitectura VITS end-to-end.
- Generación de locuciones para contenido audiovisual: creación de narraciones en alemán para vídeos, pódcast o tutoriales donde se requiera una voz sintética característica y consistente.
- Pruebas de regresión en pipelines TTS: servir como voz de referencia ligera para validar sistemas de fonemización (espeak-ng, espyak) y comparar la calidad de la conversión texto-fonema en alemán.
- Demostraciones en navegador: mediante phoonnx.js se puede ofrecer una demo interactiva de síntesis de voz en alemán directamente en el cliente, sin backend.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; el repositorio completo ocupa 0,1 GB, por lo que el modelo cabe holgadamente en cualquier GPU consumer e incluso puede ejecutarse en CPU.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU. Cualquier GPU consumer (GTX 1060, RTX 3060, RTX 4090) es más que suficiente.
- Cabe en cualquier GPU consumer y en dispositivos embebidos (Raspberry Pi, placas ARM) dado su reducido tamaño.
- Opciones de despliegue: phoonnx (Python y OVOS), phoonnx.js (navegador), y en general cualquier runtime compatible con ONNX.
- Latencia y throughput: no disponibles en la información proporcionada; la arquitectura VITS end-to-end y el tamaño reducido sugieren latencias bajas, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Tamano | Licencia | Formato |
|---|---|---|---|---|---|
| vits-de_de-glados_turret-low (este modelo) | VITS | de-DE | 0,1 GB (repo) | MIT | ONNX |
| Otras voces piper-de-glados de systemofapwne | VITS | de-DE (y otras) | variable segun calidad | no disponible | ONNX/Piper |
| Modelos VITS de la coleccion Phoonnx | VITS | varios | variable | MIT (segun coleccion) | ONNX |

No se dispone de datos de rendimiento comparativo (MOS, latencia, throughput) en la información proporcionada, por lo que la comparación se limita a parámetros estructurales y de licencia.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en alemán (de-DE); no sintetiza otros idiomas.
- Requiere fonemización previa con espeak-ng; si se usa el port espyak, algunos fonemas difieren y el modelo puede pronunciar mal ciertas palabras.
- La variante "low" implica calidad de síntesis reducida frente a configuraciones medium o high del mismo proyecto.
- Riesgo de alucinación acústica: en TTS esto se traduce en prosodia incorrecta, artefactos o pronunciaciones erróneas cuando la fonemización de entrada es imperfecta.
- Sesgos: la voz está modelada a partir de un personaje de videojuego; su timbre puede no ser adecuado para contextos profesionales o formales.
- Licencia MIT: permite uso comercial, pero conviene revisar los términos del release upstream (systemofapwne/piper-de-glados) por si imponen condiciones adicionales.
- Dependencia de librerías externas (phoonnx, scriptconv, espeak-ng) que deben instalarse correctamente para el funcionamiento.
- No apto para tareas de razonamiento, generación de texto, código ni agentes; es exclusivamente un modelo de síntesis de voz.
- Sin datos publicados de benchmarks objetivos (MOS, WER de fonemización) que permitan evaluar su calidad de forma cuantitativa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-de_de-glados_turret-low
- Modelo upstream: https://huggingface.co/systemofapwne/piper-de-glados/tree/main/de/de_DE/glados-turret/low
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Repositorio phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
