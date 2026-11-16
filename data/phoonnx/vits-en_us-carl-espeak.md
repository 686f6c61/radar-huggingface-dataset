# Phoonnx/vits-en_us-carl-espeak

## Resumen

vits-en_us-carl-espeak es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por simoniz0r como parte del ecosistema de voces de Piper y empaquetado por Phoonnx para su librería ONNX de TTS. El modelo genera audio a partir de texto en inglés estadounidense (en-US), tomando como entrada fonemas en alfabeto IPA producidos por espeak-ng. Se distribuye en formato ONNX, lo que facilita su despliegue en entornos Python y en el navegador mediante phoonnx.js.

La relevancia de este modelo radica en su integración con el stack de Phoonnx y OVOS (Open Voice OS), un ecosistema de asistentes de voz open source. Al estar empaquetado específicamente para phoonnx, se puede invocar mediante una API sencilla en Python o como plugin de TTS en OVOS, lo que lo hace útil para proyectos de asistentes conversacionales locales. Su licencia MIT y su reducido tamaño de repositorio (0,1 GB) lo convierten en una opción ligera para síntesis de voz en inglés.

No se dispone de información sobre el número de parámetros, la longitud de contexto (no aplica en TTS) ni detalles del dataset de entrenamiento en la información proporcionada. El modelo está orientado exclusivamente a la síntesis de voz en inglés y no soporta otras tareas de generación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS) |
| Tipos de cuantizacion | no disponible (pesos en ONNX) |
| Idiomas soportados | en-US (inglés estadounidense) |
| Licencia | MIT |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), un modelo generativo end-to-end que combina un codificador de texto, un prior variacional, un decodificador basado en normalizing flows y un discriminador adversarial para el entrenamiento. VITS produce audio de forma directa a partir de fonemas, sin necesidad de un vocoder separado, lo que simplifica el pipeline de inferencia.

La entrada del modelo son fonemas en alfabeto IPA generados por espeak-ng, tal como se indica en la model card. El autor original es simoniz0r, y el modelo se distribuye a través del repositorio piper-voice-models. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO (no aplicables típicamente a TTS). Tampoco se detallan innovaciones técnicas adicionales más allá de las propias de VITS.

## Capacidades

- Síntesis de voz (text-to-speech) en inglés estadounidense (en-US).
- Generación de audio a partir de texto normalizado y convertido a fonemas IPA mediante espeak-ng.
- Integración con la librería phoonnx para Python y con el ecosistema OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Ejecución en el navegador a través de phoonnx.js, con demo disponible en tigregotico.pt/demo.
- Soporte de entrada basada en fonemas espeak (no texto directo sin fonemización).
- No soporta tool calling, function calling, agentes, razonamiento multi-step ni capacidades multimodales (visión, audio de entrada, etc.).
- Capacidad multilingüe limitada exclusivamente al inglés estadounidense.

## Casos de uso

- Asistentes de voz locales en OVOS: el modelo se integra como plugin de TTS mediante `ovos-tts-plugin-phoonnx`, permitiendo que un asistente doméstico autoalojado genere respuestas habladas en inglés sin depender de servicios en la nube.
- Síntesis de voz en aplicaciones Python: mediante `TTSModelManager` de phoonnx, se puede cargar la voz `piper_community/simoniz0r/en-US_carl` y generar archivos WAV a partir de texto, útil para prototipos de lectura de textos o narración automatizada.
- Lectura de documentos y notificaciones: integrado en pipelines de procesamiento de texto, el modelo puede convertir correos, alertas o artículos en audio para consumo pasivo, gracias a su bajo peso (0,1 GB) y su formato ONNX optimizado para inferencia.
- Síntesis de voz en el navegador: mediante phoonnx.js, se puede desplegar TTS del lado del cliente en aplicaciones web, evitando el envío de texto a servidores externos y reduciendo la latencia de red.
- Accesibilidad web: generación de audio para usuarios con discapacidad visual o dificultades de lectura, ejecutándose localmente en el navegador o en el servidor sin costes de API.
- Pruebas y desarrollo de sistemas conversacionales: al ser un modelo ligero y de licencia MIT, es adecuado para entornos de CI/CD y tests automatizados donde se necesita generar audio de forma reproducible sin depender de servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; por el tamaño del repositorio (0,1 GB) se trata de un modelo ligero que probablemente cabe en GPUs de gama baja, pero no se confirma.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada, aunque el tamaño reducido sugiere que podría ejecutarse en GPUs de consumo e incluso en CPU.
- Opciones de despliegue: phoonnx (Python), phoonnx.js (navegador), plugin `ovos-tts-plugin-phoonnx` para OVOS. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a TTS VITS).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Tamaño repo |
|---|---|---|---|---|---|
| vits-en_us-carl-espeak | VITS | en-US | MIT | ONNX | 0,1 GB |
| Otras voces Piper (simoniz0r) | VITS | en-US | según release upstream | ONNX | no disponible |
| Modelos VITS de la colección Phoonnx | VITS | variable | variable | ONNX | no disponible |

No se dispone de datos de rendimiento comparativo (benchmarks) entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo soporta inglés estadounidense (en-US); no genera voz en otros idiomas.
- La entrada debe ser texto fonemizado con espeak-ng; si se usa la implementación espyak en lugar de espeak-ng, algunos fonemas difieren y el modelo puede pronunciar mal ciertas palabras, según advierte la model card.
- No se dispone de información sobre sesgos en el habla generada (acento, género, prosodia) ni sobre la composición del dataset de entrenamiento.
- Riesgo de alucinación no aplica en el sentido de generación de texto, pero sí existe riesgo de pronunciación incorrecta o prosodia anómala en palabras fuera del dominio de entrenamiento.
- La licencia es MIT, lo que permite uso comercial, pero la model card indica que "the upstream release states its terms", por lo que conviene verificar las condiciones del release original de simoniz0r.
- No se dispone de información sobre latencia, throughput ni requisitos de hardware verificados para producción.
- El modelo tiene 0 descargas y 0 likes en Hugging Face en el momento de la consulta, lo que indica ausencia de validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-en_us-carl-espeak
- Upstream (release original): https://github.com/simoniz0r/piper-voice-models/releases/tag/carl
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
- phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
