# Phoonnx/vits-cs_cz-jirka-low-espeak

## Resumen

`vits-cs_cz-jirka-low-espeak` es un modelo de síntesis de voz (text-to-speech) de la familia VITS, empaquetado por Phoonnx para su librería ONNX de TTS. El modelo original procede de Rhasspy, concretamente de la voz `cs_CZ/jirka/low` del proyecto Piper, y ha sido reempaquetado con entrada fonémica fija basada en espeak-ng (alfabeto IPA). Está pensado para síntesis de voz en checo de la República Checa (`cs-CZ`) con un coste computacional bajo.

El modelo resuelve el problema de generar audio inteligible en checo a partir de texto, con un pipeline ligero que puede ejecutarse en CPU mediante ONNX Runtime. Su relevancia práctica radica en que se integra en el ecosistema OVOS (Open Voice OS) mediante el plugin `ovos-tts-plugin-phoonnx`, lo que permite incorporar voces checas de baja latencia en asistentes de voz locales y sistemas embebidos sin depender de servicios en la nube.

Se trata de un modelo de tamaño reducido (repositorio de 0,1 GB), con licencia MIT y disponible únicamente en formato ONNX dentro del ecosistema phoonnx. No se han publicado especificaciones detalladas sobre número de parámetros, contexto ni datos de entrenamiento en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference with adversarial learning for end-to-end TTS) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el modelo se distribuye como ONNX; se desconoce si el ONNX ya está cuantizado) |
| Idiomas soportados | checo (`cs-CZ`) |
| Licencia | MIT |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS, un modelo generativo end-to-end que combina un codificador de texto, un prior variacional, un decodificador basado en flujos normalizadores y un discriminador adversarial para el entrenamiento. La entrada no es texto en bruto, sino fonemas en alfabeto IPA obtenidos mediante espeak-ng; la conversión y normalización del texto la realiza la librería `scriptconv` (concretamente `EspeakPhonemizer` del módulo `scriptconv_copyleft.phonemizers.mul`).

El modelo es un reempaquetado de la voz upstream `rhasspy/piper-voices/cs/cs_CZ/jirka/low` para la librería phoonnx. La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o ajuste fino adicional. La etiqueta `low` en el nombre indica que corresponde a la variante de menor calidad y tamaño del conjunto Piper, orientada a inferencia rápida y ligera.

## Capacidades

- Síntesis de voz (text-to-speech) en checo de la República Checa (`cs-CZ`).
- Entrada fonémica en alfabeto IPA generada a partir de texto mediante espeak-ng.
- Generación de audio en formato WAV mediante la API `voice.synthesize_wav(text, wav_file)`.
- Ejecución sobre ONNX Runtime, lo que permite inferencia en CPU y en entornos sin GPU.
- Integración con OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Ejecución en navegador a través de `phoonnx.js` (con entrada espeak o unicode).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio de entrada ni modo thinking: es exclusivamente un modelo TTS.

## Casos de uso

- Asistentes de voz locales en checo: integrado en OVOS mediante `ovos-tts-plugin-phoonnx`, el modelo permite que un asistente doméstico responda en checo sin conexión a internet, seleccionando la voz `piper/cs_CZ-jirka-low` en `mycroft.conf`.
- Lectura de notificaciones y alertas en sistemas embebidos: su tamaño reducido (0,1 GB) y su ejecución sobre ONNX permiten desplegarlo en dispositivos con recursos limitados para leer mensajes del sistema en checo.
- Accesibilidad para personas con discapacidad visual: conversión de texto a voz en checo para lectores de pantalla y aplicaciones de lectura de documentos, con latencia baja al ejecutarse en CPU.
- Síntesis de voz en aplicaciones de escritorio y web: mediante `phoonnx.js` se puede generar audio en el navegador con entrada espeak o unicode, útil para interfaces web que necesiten locución en checo.
- Generación de audiolibros o contenido narrado en checo a partir de texto plano, procesando párrafos de forma secuencial con la API `synthesize_wav`.
- Pruebas y prototipado de pipelines TTS: al ser un modelo ligero con licencia MIT, sirve para validar arquitecturas de síntesis de voz en checo antes de migrar a voces de mayor calidad.
- Integración en sistemas de domótica que requieran anuncios hablados en checo, aprovechando el ecosistema phoonnx y OVOS.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ejecutarse sobre ONNX Runtime puede funcionar en CPU sin GPU dedicada.
- GPU recomendadas: no disponible; el modelo está orientado a inferencia ligera y no requiere GPU.
- Cabe en GPU de consumo: no disponible; por su tamaño (repositorio de 0,1 GB) es previsible que quepa en cualquier GPU de consumo, pero no se confirma en la documentación.
- Opciones de despliegue: ONNX Runtime a través de la librería `phoonnx` (Python), el plugin `ovos-tts-plugin-phoonnx` para OVOS, y `phoonnx.js` en el navegador.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| `Phoonnx/vits-cs_cz-jirka-low-espeak` | VITS | cs-CZ | MIT | ONNX | Voz Piper reempaquetada para phoonnx |
| `rhasspy/piper-voices/cs/cs_CZ/jirka/low` | VITS | cs-CZ | MIT | Piper (ONNX) | Modelo upstream original de Rhasspy |
| Otras voces Piper `low` de otros idiomas | VITS | varios | MIT | ONNX | Misma familia y variante de calidad, distinto idioma |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta checo (`cs-CZ`); no es multilingüe.
- La entrada debe ser fonemas IPA generados por espeak-ng; si se usa el port `espyak` en lugar de espeak-ng, algunos fonemas difieren y el modelo puede pronunciar mal ciertas palabras.
- Es la variante `low` de Piper, por lo que la calidad de audio es la más baja de la familia; no es adecuada para producción de audio de alta fidelidad.
- No se han publicado datos sobre sesgos, riesgo de alucinación o comportamiento en dominios específicos.
- Licencia MIT: permite uso comercial, pero se recomienda verificar los términos del modelo upstream de Rhasspy.
- Al ser un modelo TTS, no genera texto ni razona; no debe evaluarse con benchmarks de lenguaje.
- La fecha de creación indicada (2026-11-16) es futura respecto a la información habitual de modelos; conviene verificar la vigencia del repositorio.
- Depende de espeak-ng instalado en el sistema o del extra `phoonnx[espeak]`; sin esta dependencia el pipeline no funciona.

## Enlaces

- [Hugging Face: Phoonnx/vits-cs_cz-jirka-low-espeak](https://huggingface.co/Phoonnx/vits-cs_cz-jirka-low-espeak)
- [Upstream: rhasspy/piper-voices/cs/cs_CZ/jirka/low](https://huggingface.co/rhasspy/piper-voices/tree/main/cs/cs_CZ/jirka/low)
- [Colección VITS de Phoonnx](https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65)
- [Repositorio phoonnx](https://github.com/TigreGotico/phoonnx)
- [Repositorio scriptconv](https://github.com/TigreGotico/scriptconv)
- [Repositorio phoonnx.js](https://github.com/TigreGotico/phoonnx.js)
- [Demo en vivo](https://tigregotico.pt/demo)
