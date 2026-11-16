# Phoonnx/vits-pl_pl-meski-espeak

## Resumen

vits-pl_pl-meski-espeak es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por WitoldG dentro del proyecto polish_piper_models y empaquetado por Phoonnx para su librería ONNX de TTS. El modelo convierte texto en polaco (pl-PL) a audio inteligible, tomando como entrada fonemas espeak en alfabeto IPA en lugar de texto plano, lo que exige un front-end de fonemización previo.

El modelo resuelve el problema de la síntesis de voz en polaco dentro del ecosistema phoonnx/OVOS, una alternativa ligera y ejecutable en local frente a servicios TTS en la nube. Su formato ONNX y su reducido tamaño de repositorio (0,1 GB) lo hacen adecuado para despliegues en dispositivos con recursos limitados y para integración en asistentes de voz.

Es relevante ahora porque forma parte de una colección creciente de voces VITS empaquetadas para phoonnx, con soporte tanto en Python como en navegador mediante phoonnx.js. No se dispone de información sobre el número de parámetros, la longitud de contexto ni los datos de entrenamiento utilizados por el autor original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VITS |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | polaco (pl-PL) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak en alfabeto IPA |
| Tamaño del repositorio | 0,1 GB |
| Librería | phoonnx |
| Pipeline | text-to-speech |
| Autor original | WitoldG |
| Empaquetado por | Phoonnx |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), un modelo generativo end-to-end que combina un codificador de texto, un prior variacional, un decodificador basado en flujos normalizadores y un discriminador adversarial entrenado de forma conjunta. VITS produce audio de forma directa desde la representación textual sin necesidad de un vocoder externo en cascada.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el corpus de voz utilizado ni si se aplicaron técnicas de alineamiento o fine-tuning adicionales. El modelo se distribuye en formato ONNX, lo que permite su ejecución mediante ONNX Runtime en Python y en el navegador a través de phoonnx.js. La entrada no es texto plano sino fonemas espeak en IPA, por lo que el pipeline requiere un fonemizador (EspeakPhonemizer de scriptconv) antes de la inferencia.

## Capacidades

- Síntesis de voz en polaco (pl-PL) a partir de fonemas espeak en alfabeto IPA.
- Generación de audio en formato WAV mediante la API `synthesize_wav` de phoonnx.
- Integración con el ecosistema OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Ejecución en navegador mediante phoonnx.js con entrada espeak o unicode.
- Normalización y conversión de texto previa mediante scriptconv.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje).
- No dispone de capacidades de visión, audio de entrada ni modo thinking.
- Capacidad multilingüe limitada exclusivamente al polaco.

## Casos de uso

- Asistentes de voz en local para OVOS: el modelo se integra como plugin TTS en `mycroft.conf` y permite sintetizar respuestas del asistente en polaco sin depender de servicios en la nube, gracias a su formato ONNX y su reducido tamaño.
- Lectura de textos en polaco en aplicaciones de accesibilidad: se puede invocar `synthesize_wav` sobre párrafos normalizados por scriptconv para generar audio de lectura en pantalla para usuarios con discapacidad visual.
- Síntesis de voz en navegador: mediante phoonnx.js, el modelo puede ejecutarse en el cliente para generar audio en polaco sin enviar texto a un servidor, útil en aplicaciones web con requisitos de privacidad.
- Generación de avisos y notificaciones habladas: en sistemas embebidos o domóticos, el modelo produce locuciones cortas en polaco con bajo coste computacional al ser un modelo VITS ligero.
- Prototipado de interfaces conversacionales en polaco: investigadores pueden integrar el modelo en pipelines de TTS para experimentar con diálogos hablados sin necesidad de infraestructura GPU.
- Creación de contenido educativo en polaco: generación de audio para cursos de idiomas o material didáctico, con la ventaja de que el modelo es ejecutable en CPU y no requiere licencias de pago.
- Pruebas de integración en OVOS: desarrolladores de skills para OVOS pueden usar esta voz para validar la salida TTS en polaco dentro de sus flujos de desarrollo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al tratarse de un modelo VITS de 0,1 GB en ONNX, es probable que la inferencia se realice en CPU sin necesidad de GPU, aunque no se confirma en la documentación.
- GPU recomendadas: no disponible; el modelo está diseñado para ejecución en ONNX Runtime, que puede usar CPU o GPU según la configuración.
- Compatibilidad con GPU de consumo: no se confirma, pero el tamaño del repositorio sugiere que cabría en GPUs de consumo y en CPU.
- Opciones de despliegue: phoonnx (Python), phoonnx.js (navegador), ovos-tts-plugin-phoonnx (OVOS), ONNX Runtime.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Contexto | Disponibilidad |
|---|---|---|---|---|---|---|
| vits-pl_pl-meski-espeak | VITS | pl-PL | ONNX | MIT | no disponible | Hugging Face (Phoonnx) |
| WitoldG/polish_piper_models (upstream) | VITS (Piper) | pl-PL | no disponible | no disponible | no disponible | Hugging Face (WitoldG) |
| Otras voces VITS de la colección Phoonnx | VITS | varios | ONNX | MIT (según modelo) | no disponible | Hugging Face (colección VITS) |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo sintetiza polaco (pl-PL); no soporta otros idiomas.
- Requiere fonemas espeak en IPA como entrada, por lo que necesita un front-end de fonemización (espeak-ng o el port espyak) para funcionar correctamente.
- Si se usa espyak en lugar de espeak-ng, algunos fonemas difieren y el modelo puede pronunciar mal ciertas palabras, según advierte el autor.
- No se dispone de información sobre sesgos de voz, género, acento o calidad en dominios específicos.
- No hay datos sobre robustez ante texto ruidoso, abreviaturas o números; la normalización depende de scriptconv.
- La licencia es MIT, lo que permite uso comercial, pero el autor indica que la licencia del release upstream establece sus propios términos; conviene verificar la licencia del modelo original de WitoldG.
- El modelo tiene muy pocas descargas (22) y ningún like, lo que sugiere poca validación por parte de la comunidad.
- No se dispone de información sobre el número de parámetros ni sobre la calidad objetiva del audio generado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-pl_pl-meski-espeak
- Modelo upstream: https://huggingface.co/WitoldG/polish_piper_models
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Repositorio phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
