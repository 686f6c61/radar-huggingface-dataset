# Phoonnx/vits-en_us-ljspeech-espeak

## Resumen
vits-en_us-ljspeech-espeak es un modelo de síntesis de voz (text-to-speech) de arquitectura VITS, desarrollado originalmente por Coqui a partir de su implementación en el repositorio TTS (versión 0.6.1). El modelo se distribuye empaquetado en formato ONNX por Phoonnx, la biblioteca de TTS basada en ONNX del proyecto TigreGotico, con el objetivo de facilitar su ejecución en Python, en OVOS y en el navegador mediante phoonnx.js.

El modelo está entrenado sobre el corpus LJSpeech, un conjunto de audio en inglés estadounidense de dominio público formado por grabaciones de una única hablante femenina, y genera audio a partir de fonemas espeak en alfabeto IPA. Su relevancia actual radica en que ofrece una voz en-US ligera (repositorio de 0,1 GB) y con licencia permisiva, adecuada para asistentes de voz locales, sistemas embebidos y aplicaciones de síntesis que requieren inferencia sin dependencias de servicios en la nube.

Al tratarse de un modelo VITS condicional de extremo a extremo, combina el front-end de texto a fonemas con un decodificador generativo que produce la forma de onda directamente, lo que simplifica el pipeline frente a arquitecturas en cascada (Tacotron + vocoder). No se dispone de información sobre el número exacto de parámetros ni sobre la longitud de contexto, ya que el modelo no opera con ventanas de contexto al uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference with adversarial learning for end-to-end text-to-speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no opera con contexto de tokens) |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | en-US (inglés estadounidense) |
| Licencia | BSD-3-Clause (la model card menciona además Apache-2.0 en las notas de licencia del upstream) |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak en alfabeto IPA |
| Corpus de entrenamiento | LJSpeech |
| Tamano del repositorio | 0,1 GB |
| Libreria de ejecucion | phoonnx (Python, OVOS, phoonnx.js) |

## Arquitectura y entrenamiento
VITS es una arquitectura de síntesis de voz de extremo a extremo que combina un encoder de texto, un prior variacional condicionado por alineamiento monotónico y un decodificador generativo basado en flujos normalizadores y un vocoder de dominio de forma de onda. El entrenamiento emplea aprendizaje adversarial (GAN) junto con una estimación variacional para modelar la distribución del audio, lo que permite generar muestras de audio de forma directa sin un vocoder separado. El modelo hereva del checkpoint `tts_models--en--ljspeech--vits` publicado por Coqui en la versión 0.6.1 de su repositorio TTS.

El entrenamiento se realizó sobre LJSpeech, un corpus de aproximadamente 24 horas de audio de una única hablante en inglés estadounidense. No se dispone de información detallada sobre el número exacto de tokens de entrenamiento, la composición del dataset más allá de LJSpeech, ni sobre si se aplicaron técnicas de RLHF o DPO (no habituales en modelos TTS de esta familia). La innovación técnica principal es la integración del front-end de fonemas espeak-ng (o su port espyak) con el modelo ONNX, lo que permite una inferencia ligera y portable.

## Capacidades
- Síntesis de voz (text-to-speech) en inglés estadounidense a partir de texto de entrada.
- Conversión de texto a fonemas espeak en alfabeto IPA como paso previo a la síntesis.
- Generación de audio en formato WAV mediante la API de phoonnx (`voice.synthesize_wav`).
- Integración con OVOS a través del plugin `ovos-tts-plugin-phoonnx`.
- Ejecución en navegador mediante phoonnx.js (con entrada espeak o unicode).
- No soporta tool calling, function calling, agentes ni razonamiento multi-step (es un modelo TTS, no un LLM).
- No dispone de capacidades multimodales de visión o audio de entrada más allá del texto.
- Capacidad multilingüe limitada al inglés estadounidense.

## Casos de uso
- Asistentes de voz locales en OVOS: el modelo se integra mediante el plugin `ovos-tts-plugin-phoonnx` y permite dotar de voz a un asistente doméstico sin conexión a Internet, seleccionando la voz `coqui/en-ljspeech-vits` en `mycroft.conf`.
- Síntesis de voz en el navegador: mediante phoonnx.js se puede generar audio en cliente sin enviar texto a servidores externos, útil para aplicaciones web de accesibilidad o lectura de contenido.
- Lectura de textos largos y artículos: el modelo convierte texto normalizado por scriptconv en audio, adecuado para sistemas de lectura por voz con una voz femenina en inglés estadounidense.
- Sistemas embebidos y de bajo consumo: el tamaño reducido del repositorio (0,1 GB) y el formato ONNX permiten desplegar el modelo en dispositivos con recursos limitados.
- Prototipado de pipelines TTS: sirve como voz de referencia para comparar front-ends de fonemización (espeak-ng frente a espyak) y evaluar diferencias de pronunciación.
- Aplicaciones de accesibilidad: conversión de texto a voz para lectores de pantalla o interfaces de usuario que requieren una voz en inglés estadounidense con licencia permisiva.
- Generación de audiolibros o contenido narrado de dominio público: al estar entrenado sobre LJSpeech y tener licencia BSD-3-Clause, puede emplearse en proyectos comerciales con las debidas atribuciones.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño del repositorio (0,1 GB) se espera un consumo de memoria moderado, apto para CPU.
- GPU recomendadas: no se especifican; al ser un modelo ONNX ligero, puede ejecutarse en CPU y en GPU de gama baja.
- Compatibilidad con GPU de consumo: previsiblemente sí, dado el reducido tamaño del modelo, aunque no se documentan requisitos oficiales.
- Opciones de despliegue: phoonnx (Python), OVOS mediante `ovos-tts-plugin-phoonnx`, phoonnx.js en navegador. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Contexto | Disponibilidad |
|---|---|---|---|---|---|---|
| vits-en_us-ljspeech-espeak (Phoonnx) | VITS | en-US | ONNX | BSD-3-Clause | no aplica | Hugging Face, phoonnx, OVOS, navegador |
| VITS original de Coqui (tts_models--en--ljspeech--vits) | VITS | en-US | Checkpoint PyTorch | BSD-3-Clause / Apache-2.0 (según notas) | no aplica | GitHub Coqui TTS |
| Otras voces VITS empaquetadas por Phoonnx (colección VITS) | VITS | variable | ONNX | variable | no aplica | Hugging Face (colección Phoonnx) |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias
- Sesgos conocidos: al estar entrenado sobre LJSpeech, la voz sintetizada corresponde a una única hablante femenina en inglés estadounidense; no representa diversidad de acentos, géneros ni edades.
- Riesgo de alucinación: en TTS se traduce en pronunciaciones incorrectas o artefactos de audio, especialmente con palabras poco frecuentes o fuera del dominio de LJSpeech.
- Limitaciones de idioma: solo soporta inglés estadounidense; no se debe emplear para otros idiomas.
- Dependencia del front-end: los fonemas provienen de espeak-ng; si se usa espyak, algunos fonemas difieren y el modelo puede pronunciar mal ciertas palabras, según advierte la model card.
- Restricciones de licencia: la licencia declarada es BSD-3-Clause, pero la model card cita además Apache-2.0 en las notas del upstream; conviene verificar la licencia aplicable antes de un uso comercial.
- Caveat de producción: no se documentan requisitos de hardware, latencia ni calidad objetiva (MOS), por lo que la idoneidad en producción debe validarse empíricamente.
- El modelo no es un LLM: no soporta razonamiento, tool calling ni agentes; su uso está limitado a síntesis de voz.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-en_us-ljspeech-espeak
- Checkpoint upstream de Coqui TTS: https://github.com/coqui-ai/TTS/releases/download/v0.6.1_models/tts_models--en--ljspeech--vits.zip
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Repositorio phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en vivo: https://tigregotico.pt/demo
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
