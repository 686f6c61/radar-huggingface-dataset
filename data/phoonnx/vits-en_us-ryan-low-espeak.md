# Phoonnx/vits-en_us-ryan-low-espeak

## Resumen

`vits-en_us-ryan-low-espeak` es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, empaquetado por Phoonnx para su librería ONNX de TTS. El modelo original procede de Rhasspy, concretamente de la colección `piper-voices` en la ruta `en/en_US/ryan/low`, y esta versión lo adapta al ecosistema phoonnx con entrada de fonemas espeak en alfabeto IPA.

El modelo resuelve la conversión de texto a audio en inglés estadounidense (`en-US`) con una voz masculina identificada como "ryan" en su variante de calidad "low". Su relevancia radica en que permite inferencia TTS ligera sobre ONNX, lo que facilita el despliegue en entornos con recursos limitados, asistentes de voz embebidos y sistemas OVOS (Open Voice OS) mediante el plugin `ovos-tts-plugin-phoonnx`.

El repositorio ocupa aproximadamente 0,1 GB y se distribuye bajo licencia MIT. No se dispone de información sobre el número de parámetros, la longitud de contexto (no aplica en TTS) ni datos de entrenamiento en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS) |
| Tipos de cuantizacion | no disponible (pesos ONNX; variante "low" del modelo original) |
| Idiomas soportados | `en-US` (inglés estadounidense) |
| Licencia | MIT |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), un modelo generativo condicional que combina un codificador de texto, un prior normalizing flow, un decodificador y un discriminador adversarial para síntesis de voz extremo a extremo. Esta variante concreta corresponde a la calidad "low" del voice `ryan` de Rhasspy, lo que implica un modelo de menor tamaño orientado a inferencia rápida y ligera.

La entrada de texto no se realiza directamente en caracteres, sino mediante fonemas espeak en alfabeto IPA, generados por el fonemizador `EspeakPhonemizer` de `scriptconv_copyleft.phonemizers.mul`. El front-end de texto pasa por `scriptconv`, que normaliza el texto y lo convierte al formato de entrada del modelo. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Síntesis de voz (text-to-speech) en inglés estadounidense a partir de texto plano.
- Generación de audio en formato WAV mediante `voice.synthesize_wav()`.
- Entrada basada en fonemas espeak en alfabeto IPA, con normalización previa del texto vía `scriptconv`.
- Integración con OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Ejecución en navegador a través de `phoonnx.js` con entrada espeak o unicode.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step (no es un modelo de lenguaje).
- No dispone de capacidades de visión, audio de entrada ni modo "thinking".

## Casos de uso

- Asistentes de voz embebidos en OVOS: el modelo se integra directamente mediante `ovos-tts-plugin-phoonnx` configurando la voz `piper/en_US-ryan-low` en `mycroft.conf`, lo que permite respuestas habladas en inglés en dispositivos de voz locales.
- Síntesis de voz en aplicaciones Python: mediante `TTSModelManager` se carga la voz y se sintetiza texto a WAV, adecuado para prototipos de lectura de texto o generación de avisos hablados.
- Síntesis en el navegador: con `phoonnx.js` se puede ejecutar la voz en cliente sin backend, útil para aplicaciones web de accesibilidad o lectura de contenido.
- Generación de audiolibros o locuciones de bajo coste: la variante "low" y el formato ONNX permiten inferencia rápida en CPU para grandes volúmenes de texto en inglés.
- Sistemas de anuncios automatizados: integración en pipelines que convierten notificaciones o alertas en audio para entornos con recursos limitados.
- Pruebas y desarrollo de pipelines TTS: sirve como voz de referencia ligera para validar front-ends de fonemización espeak y comparar con otras voces de la colección VITS de Phoonnx.
- Accesibilidad web: lectura de contenido en inglés para usuarios con discapacidad visual mediante la demo de `phoonnx.js`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0,1 GB, lo que sugiere un modelo muy ligero apto para CPU.
- GPU recomendadas: no disponible; por tamaño, es probable que funcione en GPU consumer, pero no se confirma en la información.
- Cabe en GPU consumer: previsiblemente sí, dado el tamaño del repo, aunque no se especifica.
- Opciones de despliegue: phoonnx (Python), OVOS mediante `ovos-tts-plugin-phoonnx`, `phoonnx.js` en navegador. No se mencionan vLLM, llama.cpp ni TGI (no aplican a TTS).
- Latencia y throughput estimados: no disponibles; la variante "low" está orientada a inferencia rápida, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| `vits-en_us-ryan-low-espeak` (Phoonnx) | VITS | en-US | MIT | ONNX | Hugging Face, phoonnx, OVOS |
| `rhasspy/piper-voices` (en_US/ryan/low) | VITS | en-US | MIT | no disponible en la información | Hugging Face (upstream) |
| Otras voces de la colección VITS de Phoonnx | VITS | variable | variable | ONNX | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta inglés estadounidense (`en-US`); no es multilingüe.
- La fonemización depende de espeak-ng; si se usa el port espyak, algunos fonemas difieren y el modelo puede pronunciar mal ciertas palabras, según advierte la model card.
- La variante "low" implica menor calidad de audio que las variantes de mayor calidad del mismo voice.
- No es un modelo de lenguaje: no genera texto, no razona y no soporta tool calling ni agentes.
- Riesgo de alucinación no aplica en el sentido de LLM, pero puede producir pronunciaciones incorrectas ante texto no normalizado o fonemas mal generados.
- Licencia MIT: permite uso comercial, pero se recomienda verificar la licencia upstream en `rhasspy/piper-voices`.
- Sin datos publicados de benchmarks, latencia ni parámetros; la evaluación de calidad debe hacerse empíricamente.
- Dependencia de librerías externas (`phoonnx`, `scriptconv`, `espeak-ng`) para el preprocesado y la inferencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-en_us-ryan-low-espeak
- Upstream (Rhasspy piper-voices, ryan low): https://huggingface.co/rhasspy/piper-voices/tree/main/en/en_US/ryan/low
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Repositorio phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
