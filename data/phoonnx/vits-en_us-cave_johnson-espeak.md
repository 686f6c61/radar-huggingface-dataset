# Phoonnx/vits-en_us-cave_johnson-espeak

## Resumen

vits-en_us-cave_johnson-espeak es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, empaquetado por Phoonnx para su librería de inferencia ONNX homónima. El modelo original procede de davet2001 (repositorio davet2001/cave_johnson1) y se distribuye como un checkpoint VITS de un solo hablante en inglés estadounidense, con entrada de texto basada en fonemas espeak en alfabeto IPA.

Su relevancia es práctica más que investigadora: Phoonnx lo redistribuye en formato ONNX con una integración directa en su gestor de modelos y en el ecosistema OVOS (Open Voice OS), de modo que puede ejecutarse en Python o en el navegador mediante phoonnx.js sin necesidad de infraestructura de GPU. El repositorio ocupa aproximadamente 0,1 GB, lo que lo sitúa en el rango de modelos TTS ligeros aptos para dispositivos de borde.

No se dispone de información sobre el número de parámetros, la longitud de contexto ni los datos de entrenamiento en la documentación proporcionada. La ficha se limita, por tanto, a los datos verificables de la model card y de los metadatos de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference text-to-speech, extremo a extremo) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no autoregresivo de contexto largo) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | en (en-US) |
| Licencia | MIT |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

VITS es una arquitectura de síntesis de voz extremo a extremo que combina un codificador de texto, un prior variacional, un decodificador generativo y un discriminador adversarial entrenado de forma conjunta; el resultado es un modelo que genera formas de onda directamente a partir de fonemas, sin etapa vocoder separada. En este caso concreto, la entrada no es texto crudo sino fonemas espeak en alfabeto IPA, producidos por la librería scriptconv (phonemizer EspeakPhonemizer) antes de llegar al modelo.

El modelo es de un único hablante (identificado como cave_johnson) y procede del autor davet2001. No se han publicado en la información disponible datos sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas adicionales más allá de la propia arquitectura VITS y del empaquetado ONNX para phoonnx.

## Capacidades

- Síntesis de voz en inglés estadounidense (en-US) a partir de texto, con salida en fichero WAV.
- Entrada fonémica basada en espeak-ng (alfabeto IPA), lo que permite un control preciso de la pronunciación si se generan los fonemas manualmente.
- Normalización de texto y conversión a fonemas delegada en scriptconv (scriptconv_copyleft.phonemizers.mul).
- Ejecución en Python mediante TTSModelManager de phoonnx y en OVOS mediante el plugin ovos-tts-plugin-phoonnx.
- Ejecución en navegador mediante phoonnx.js, con entrada espeak o unicode.
- No dispone de tool calling, function calling, razonamiento multi-paso, visión, audio de entrada ni modo thinking: es exclusivamente un modelo TTS.
- No se documentan capacidades multilingües más allá del inglés estadounidense.

## Casos de uso

- Asistentes de voz domésticos en OVOS: el modelo se integra como plugin TTS (ovos-tts-plugin-phoonnx) y permite dotar de voz a un asistente local sin depender de servicios en la nube, gracias a su tamaño reducido (0,1 GB) y a la inferencia ONNX.
- Síntesis de voz en el navegador: mediante phoonnx.js puede generar audio en cliente sin backend, útil para aplicaciones web accesibles o demos interactivas con el modelo cave_johnson.
- Lectura de textos y notificaciones en aplicaciones de escritorio: la API de phoonnx permite sintetizar frases a WAV de forma programática, adecuada para alertas, avisos o lectura de contenido en inglés.
- Generación de audio para prototipos y pruebas de UX: al ser un modelo ligero y con licencia MIT, sirve para validar flujos de voz en productos antes de invertir en modelos de mayor calidad.
- Pipelines de accesibilidad: conversión de texto a voz para lectores de pantalla o interfaces de voz en entornos con recursos limitados, donde un modelo VITS en ONNX se ejecuta en CPU.
- Investigación y experimentación con TTS: al estar empaquetado para phoonnx y con entrada fonémica espeak, facilita comparar variantes VITS y probar phonemizers alternativos (espeak-ng frente a espyak) sobre el mismo checkpoint.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; por el tamaño del repositorio (0,1 GB) es plausible la ejecución en CPU, aunque no se documenta una cifra oficial.
- GPU recomendadas: no disponible; no se especifican modelos de GPU en la información proporcionada.
- Cabe en GPU consumer: previsiblemente sí por el tamaño del checkpoint, aunque no se confirma en la documentación.
- Opciones de despliegue: phoonnx (Python), ovos-tts-plugin-phoonnx (OVOS), phoonnx.js (navegador). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo TTS de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| vits-en_us-cave_johnson-espeak | VITS | en-US | MIT | ONNX | Empaquetado para phoonnx, entrada fonémica espeak |
| davet2001/cave_johnson1 | VITS | en-US | no disponible en la información | no disponible | Modelo upstream del que deriva este checkpoint |
| Otras voces VITS de la colección Phoonnx | VITS | variable | variable | ONNX | Misma librería de inferencia y mismo pipeline de empaquetado |

No se dispone de datos de rendimiento comparativo (MOS, latencia, throughput) entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo de un solo hablante: no permite cambiar de voz sin cargar otro checkpoint.
- Solo inglés estadounidense; no se documenta soporte de otros idiomas.
- La calidad de pronunciación depende del phonemizer: con espyak algunos fonemas difieren de espeak-ng y el modelo puede pronunciar mal ciertas palabras, según advierte la propia model card.
- Requiere espeak-ng instalado (o el extra phoonnx[espeak]) para generar los fonemas de entrada.
- No se documentan sesgos específicos, pero al ser un modelo entrenado con datos no descritos, el riesgo de sesgos de pronunciación o de registro es inherente.
- Riesgo de alucinación en el sentido TTS: puede producir prosodia o pronunciación incorrecta en textos fuera de dominio, sin que se haya publicado una evaluación al respecto.
- Licencia MIT: permite uso comercial, pero la model card remite a los términos del release upstream para cualquier condición adicional.
- No hay información sobre latencia, throughput ni calidad subjetiva (MOS), lo que limita la evaluación para producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-en_us-cave_johnson-espeak
- Modelo upstream: https://huggingface.co/davet2001/cave_johnson1
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
- phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
