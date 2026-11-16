# Phoonnx/vits-fr_fr-siwis-low-rhasspy-espeak

## Resumen

`vits-fr_fr-siwis-low-rhasspy-espeak` es un modelo de síntesis de voz (text-to-speech) de arquitectura VITS, publicado por el usuario Phoonnx a partir de la voz `fr_FR/siwis/low` del proyecto Rhasspy Piper. No se trata de un modelo entrenado desde cero por Phoonnx: el trabajo original es de Rhasspy, y Phoonnx se limita a empaquetarlo en formato ONNX para su librería de inferencia `phoonnx`, que lo ejecuta tanto en Python como dentro del ecosistema OVOS (Open Voice OS).

El modelo sintetiza voz en francés de Francia (`fr-FR`) a partir de fonemas espeak en alfabeto IPA. La variante `low` de Piper corresponde a una configuración de calidad reducida, pensada para entornos con recursos limitados: dispositivos embebidos, asistentes de voz locales y despliegues en CPU donde prima la latencia sobre la fidelidad acústica.

Su relevancia es acotada y muy específica: no compite con los grandes sistemas TTS neuronales, sino que cubre el nicho de la síntesis de voz offline, ligera y con licencia MIT, integrable en pipelines de asistentes domésticos. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño de 0.0 GB, lo que sugiere un empaquetado mínimo o que los pesos no están reflejados en el recuento del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference with adversarial learning for end-to-end TTS) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica a TTS; la entrada es una frase en fonemas espeak) |
| Tipos de cuantizacion | no disponible (el modelo se distribuye en ONNX; la variante upstream es `low`) |
| Idiomas soportados | francés de Francia (`fr-FR`) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak-ng en alfabeto IPA |
| Librería de inferencia | `phoonnx` (Python); plugin `ovos-tts-plugin-phoonnx` para OVOS |
| Variante de calidad | `low` (upstream Piper) |

## Arquitectura y entrenamiento

VITS es una arquitectura de síntesis de voz end-to-end que combina un codificador de texto, un prior variacional, un decodificador generativo basado en flujos normalizadores y un discriminador adversarial entrenado con pérdidas de espectrograma y de dominio temporal. El resultado es un modelo que genera formas de onda directamente a partir de fonemas, sin necesidad de un vocoder externo, y que en la práctica permite inferencia rápida en CPU.

Los detalles de entrenamiento del modelo original (número de tokens, horas de audio, composición del dataset, uso de RLHF o DPO) no están disponibles en la información proporcionada. Lo que sí se documenta es la cadena de procesamiento: el texto se normaliza y convierte a fonemas mediante `scriptconv`, que emplea `EspeakPhonemizer` de `scriptconv_copyleft.phonemizers.mul` (extra `scriptconv[espeak]`). El autor advierte que el port espyak de espeak-ng puede diferir de espeak-ng en algunos fonemas, lo que puede provocar pronunciaciones incorrectas en ciertas palabras. La voz upstream es la variante `low` de Piper para `fr_FR/siwis`, lo que implica un compromiso explícito entre calidad acústica y coste computacional.

## Capacidades

- Síntesis de voz en francés de Francia (`fr-FR`) a partir de texto plano, con conversión interna a fonemas espeak.
- Generación de audio en formato WAV mediante `voice.synthesize_wav(text, wav_file)`.
- Ejecución en CPU y en entornos de recursos limitados, gracias a la variante `low` y al formato ONNX.
- Integración como plugin TTS en OVOS (`ovos-tts-plugin-phoonnx`), seleccionable desde `mycroft.conf`.
- Ejecución en navegador mediante `phoonnx.js`, con entrada espeak o Unicode.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es exclusivamente un modelo TTS.
- No dispone de modo thinking, visión ni audio de entrada.
- Cobertura monolingüe: solo francés; no se documenta soporte multilingüe.

## Casos de uso

- Asistentes de voz locales en OVOS: el modelo se instala como plugin `ovos-tts-plugin-phoonnx` y se selecciona la voz `piper/fr_FR-siwis-low` en `mycroft.conf`, proporcionando respuestas habladas en francés sin depender de servicios en la nube.
- Síntesis en dispositivos embebidos: la variante `low` y el formato ONNX permiten ejecutar la inferencia en Raspberry Pi u otras placas ARM con CPU, donde modelos TTS más grandes no caben o no alcanzan latencia aceptable.
- Generación de avisos y notificaciones pregrabadas: útiles para domótica, sistemas de megafonía o interfaces de accesibilidad que necesitan convertir texto dinámico en audio en francés.
- Lectura de contenido en aplicaciones de accesibilidad: integración en lectores de pantalla o herramientas de apoyo para personas con discapacidad visual que requieran una voz francesa offline.
- Prototipado rápido de interfaces conversacionales: al instalarse con `pip install --pre phoonnx` y depender solo de espeak-ng, permite validar flujos de voz en francés en minutos.
- Síntesis en el navegador: mediante `phoonnx.js` y la demo de TigreGotico, se puede generar voz francesa en cliente sin backend, útil para demos y aplicaciones web ligeras.
- Pruebas de regresión en pipelines de TTS: al ser un modelo pequeño y determinista, sirve como referencia para comparar cambios en la normalización de texto o en el fonemizador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ejecutarse en ONNX y en variante `low`, está diseñado para CPU y no requiere GPU dedicada.
- GPU recomendadas: no aplica; no se documenta uso de GPU.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU con soporte ONNX Runtime, aunque el objetivo del modelo es la inferencia en CPU.
- Opciones de despliegue: `phoonnx` (Python), `ovos-tts-plugin-phoonnx` (OVOS), `phoonnx.js` (navegador). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a un modelo TTS.
- Latencia y throughput estimados: no disponibles en la información proporcionada.
- Dependencia externa: espeak-ng debe estar instalado en el sistema (por ejemplo, `apt install espeak-ng`) o bien usarse el extra `phoonnx[espeak]`, que incorpora el port espyak.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| `vits-fr_fr-siwis-low-rhasspy-espeak` (este) | VITS | fr-FR | ONNX | MIT | Empaquetado por Phoonnx para su librería |
| Voz upstream `rhasspy/piper-voices` `fr_FR/siwis/low` | VITS | fr-FR | ONNX (Piper) | MIT | Original de Rhasspy; requiere Piper en lugar de phoonnx |
| Otras voces de la colección VITS de Phoonnx | VITS | varios | ONNX | MIT (según upstream) | Mismo pipeline de empaquetado, distinto idioma o hablante |

No se dispone de datos de rendimiento comparativo (MOS, latencia, throughput) en la información proporcionada, por lo que la comparación se limita a aspectos de arquitectura, formato y licencia.

## Limitaciones y advertencias

- Calidad acústica limitada: la variante `low` de Piper prioriza velocidad y tamaño reducido sobre naturalidad, por lo que la voz suena menos fluida que variantes `medium` o `high`.
- Pronunciación dependiente del fonemizador: el autor advierte que espyak puede diferir de espeak-ng en algunos fonemas, lo que puede producir palabras mal pronunciadas si no se usa espeak-ng nativo.
- Cobertura monolingüe: solo francés de Francia; no se documenta soporte para otras variantes regionales ni para mezcla de idiomas.
- Sin datos de sesgos: no se ha publicado información sobre sesgos de género, acento o hablante en la información disponible.
- Riesgo de alucinación acústica: como todo modelo generativo de voz, puede producir artefactos o pronunciaciones erráticas ante entradas fuera de distribución (siglas, números, texto no normalizado).
- Restricciones de licencia: la licencia es MIT según la model card upstream, lo que permite uso comercial, pero conviene verificar la cadena de licencias del proyecto Rhasspy/Piper y de espeak-ng, que tiene su propia licencia (GPL para el binario, con implicaciones si se distribuye junto al modelo).
- Madurez del ecosistema: repositorio con 0 descargas y 0 likes, librería `phoonnx` en estado `--pre` (pre-release), lo que implica API potencialmente inestable y menor soporte comunitario.
- Dependencia de software externo: requiere espeak-ng o el extra espyak, lo que añade complejidad al despliegue en contenedores mínimos.
- Sin métricas publicadas: no hay benchmarks objetivos de calidad (MOS) ni de latencia en la información disponible, lo que dificulta evaluar su idoneidad en producción sin pruebas propias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-fr_fr-siwis-low-rhasspy-espeak
- Repositorio upstream (Piper voices, fr_FR/siwis/low): https://huggingface.co/rhasspy/piper-voices/tree/main/fr/fr_FR/siwis/low
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
- phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
- Artículo original de VITS (referencia de arquitectura): https://arxiv.org/abs/2106.06103
