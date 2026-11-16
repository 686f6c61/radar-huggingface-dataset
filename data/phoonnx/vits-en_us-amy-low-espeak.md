# Phoonnx/vits-en_us-amy-low-espeak

## Resumen

`Phoonnx/vits-en_us-amy-low-espeak` es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, empaquetado en formato ONNX para su uso con la librería `phoonnx`. El modelo original procede de Rhasspy, concretamente de la voz `en_US/amy/low` del repositorio `rhasspy/piper-voices`, y Phoonnx se limita a reempaquetarlo y distribuirlo con el front-end fonémico basado en espeak-ng. Se trata, por tanto, de una voz preentrenada de calidad "low" para inglés estadounidense, no de un modelo entrenado desde cero por el autor del repositorio.

El modelo resuelve el problema de la síntesis de voz local y ligera: al estar exportado a ONNX y pesar apenas 0,1 GB en el repositorio, puede ejecutarse en CPU sin GPU dedicada, lo que lo hace adecuado para asistentes de voz embebidos, sistemas domóticos y aplicaciones de escritorio. Su integración con el ecosistema OVOS (Open Voice OS) mediante el plugin `ovos-tts-plugin-phoonnx` refuerza ese enfoque de despliegue en dispositivos de recursos limitados.

La relevancia actual del modelo es acotada: no compite en calidad con sistemas TTS neuronales de gran escala, sino que cubre el nicho de voces ligeras, deterministas y ejecutables offline. Su licencia MIT y su empaquetado ONNX facilitan la integración comercial y la portabilidad entre plataformas. No se dispone de información sobre arquitectura interna detallada, número de parámetros ni datos de entrenamiento más allá de lo indicado en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference with adversarial learning for end-to-end text-to-speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX; variante "low" del modelo original) |
| Idiomas soportados | en-US (ingles estadounidense) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak-ng en alfabeto IPA |
| Tamano del repositorio | 0,1 GB |
| Libreria de inferencia | phoonnx (Python) / phoonnx.js (navegador) |
| Pipeline | text-to-speech |
| Autor del empaquetado | Phoonnx |
| Autor upstream | Rhasspy |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS, un sistema de síntesis de voz end-to-end que combina un codificador de texto, un prior variacional, un decodificador generativo y un discriminador adversarial entrenado con aprendizaje adversarial, junto con alineamiento monotónico para obtener la duración de los fonemas. VITS es conocida por generar audio de forma directa a partir de fonemas sin necesidad de un modelo acústico y un vocoder separados, lo que reduce la latencia y simplifica el despliegue. El modelo aquí distribuido es la variante "low" de la voz `amy` de Rhasspy, lo que implica un tamaño reducido y una calidad de audio inferior a las variantes "medium" o "high" del mismo catálogo.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO (poco habituales en TTS). El front-end de texto no forma parte del modelo: `phoonnx` delega la normalización y la fonemización en la librería `scriptconv`, que utiliza `EspeakPhonemizer` de `scriptconv_copyleft.phonemizers.mul`. Es importante señalar que los fonemas generados por espeak-ng y por la implementación espyak pueden diferir, lo que puede provocar pronunciaciones incorrectas en algunas palabras si se usa espyak en lugar de espeak-ng.

## Capacidades

- Síntesis de voz a partir de texto en inglés estadounidense (`en-US`), con salida en formato WAV.
- Fonemización mediante espeak-ng (o espyak como alternativa), con entrada en alfabeto IPA.
- Ejecución local en CPU mediante ONNX Runtime, sin dependencia de GPU.
- Integración con OVOS a través del plugin `ovos-tts-plugin-phoonnx`, seleccionable en `mycroft.conf`.
- Ejecución en navegador mediante `phoonnx.js`, con demo disponible en `tigregotico.pt/demo`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni otras capacidades de los LLM.
- No es multimodal: no procesa visión ni audio de entrada.
- No dispone de modo "thinking" ni de control de estilo o emoción más allá de lo que permita el modelo VITS subyacente.

## Casos de uso

- Asistentes de voz domóticos: integrado en OVOS mediante el plugin oficial, el modelo permite sintetizar respuestas habladas en un asistente local sin enviar texto a servicios en la nube, gracias a su ejecución ONNX en CPU y su reducido tamaño.
- Lectura de notificaciones y alertas en sistemas embebidos: en una Raspberry Pi u otro dispositivo de bajos recursos, el modelo puede convertir mensajes cortos en audio WAV con latencia aceptable, al no requerir GPU.
- Accesibilidad para personas con discapacidad visual: lectura de texto de pantalla en aplicaciones de escritorio en inglés, con una voz ligera que puede ejecutarse offline y sin coste por uso.
- Prototipado rápido de interfaces de voz: desarrolladores que necesiten una voz en inglés para validar un flujo conversacional pueden usar el modelo con `pip install --pre phoonnx` y unas pocas líneas de Python, sin entrenar ni descargar modelos grandes.
- Síntesis en el navegador: mediante `phoonnx.js`, el modelo puede generar voz en el cliente para aplicaciones web que requieran privacidad (el texto no sale del dispositivo) o funcionamiento offline.
- Generación de audiolibros o contenido de audio de bajo coste: para textos largos en inglés donde la calidad "low" sea aceptable y se priorice el rendimiento y el coste cero de infraestructura.
- Pruebas de regresión en pipelines de TTS: al ser un modelo determinista y ligero, puede servir como referencia en tests automatizados de síntesis de voz dentro de CI/CD.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica de forma estricta; al ejecutarse en ONNX Runtime sobre CPU, no requiere VRAM dedicada. El repositorio ocupa 0,1 GB, por lo que la huella en memoria es reducida.
- GPU recomendadas: no se especifican; el modelo está pensado para CPU. Cualquier GPU compatible con ONNX Runtime podría acelerar la inferencia, pero no hay datos publicados.
- Compatibilidad con GPU de consumo: sí, previsiblemente en cualquier GPU de consumo mediante ONNX Runtime, aunque no se documenta un rendimiento concreto.
- Opciones de despliegue: `phoonnx` (Python), `phoonnx.js` (navegador), plugin `ovos-tts-plugin-phoonnx` para OVOS. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo TTS de este tipo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Tamano | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Phoonnx/vits-en_us-amy-low-espeak | VITS | en-US | 0,1 GB (repo) | MIT | ONNX | Voz "low" empaquetada para phoonnx |
| rhasspy/piper-voices (en_US/amy/low) | VITS | en-US | no disponible | MIT | ONNX | Modelo upstream del que deriva este |
| Otras voces Piper (medium/high) | VITS | varios | no disponible | MIT (segun catalogo) | ONNX | Mayor calidad a costa de mas tamano y computo |
| Coqui TTS / VITS genericos | VITS | varios | variable | variable | varios | Requieren stack Python mas pesado |

No se dispone de datos de benchmarks que permitan comparar el rendimiento cualitativo con estas alternativas. La comparación se limita a aspectos de licencia, formato y disponibilidad.

## Limitaciones y advertencias

- Calidad de audio limitada: se trata de la variante "low" del modelo original, pensada para eficiencia más que para naturalidad.
- Solo inglés estadounidense (`en-US`); no soporta otros idiomas ni cambios de idioma dentro de una misma síntesis.
- Dependencia de espeak-ng para la fonemización: si se usa espyak en su lugar, algunas palabras pueden pronunciarse incorrectamente, según advierte la propia model card.
- No es un modelo de lenguaje: no genera texto, no razona, no soporta tool calling ni agentes. Cualquier expectativa en ese sentido es un error de categoría.
- Riesgo de alucinación no aplica en el sentido habitual de los LLM, pero sí puede producir pronunciaciones erróneas o entonación incorrecta en textos con abreviaturas, números o nombres propios no cubiertos por la normalización de `scriptconv`.
- Licencia MIT: permite uso comercial y modificación, pero se recomienda conservar el aviso de copyright y verificar la licencia del modelo upstream en `rhasspy/piper-voices`.
- Sin datos publicados de benchmarks, latencia ni throughput: cualquier estimación de rendimiento en producción debe medirse empíricamente.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema muy incipiente, con posible falta de soporte comunitario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-en_us-amy-low-espeak
- Modelo upstream (Rhasspy Piper voices, en_US/amy/low): https://huggingface.co/rhasspy/piper-voices/tree/main/en/en_US/amy/low
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Repositorio phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo de phoonnx.js: https://tigregotico.pt/demo
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
- Paper de VITS: no disponible en la informacion proporcionada
