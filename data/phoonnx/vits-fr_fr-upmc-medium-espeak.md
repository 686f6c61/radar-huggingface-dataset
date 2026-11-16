# Phoonnx/vits-fr_fr-upmc-medium-espeak

## Resumen

`vits-fr_fr-upmc-medium-espeak` es un modelo de síntesis de voz (text-to-speech) en francés de Francia, empaquetado por Phoonnx a partir del modelo original de Rhasspy publicado en el repositorio `rhasspy/piper-voices` (ruta `fr/fr_FR/upmc/medium`). No se trata de un modelo entrenado desde cero por Phoonnx, sino de una conversión y distribución en formato ONNX del checkpoint VITS original, orientada a su uso con la librería `phoonnx` y con el ecosistema OVOS.

La arquitectura es VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), un modelo condicional de tipo VAE con decoder adversario que genera waveform directamente a partir de fonemas, sin necesidad de un vocoder externo separado. El modelo es de tamano "medium" según la nomenclatura de Piper, y su entrada de texto no es texto plano sino fonemas en alfabeto IPA generados por espeak-ng mediante la librería `scriptconv`.

Su relevancia práctica es acotada pero concreta: proporciona una voz francesa ligera (repositorio de 0,1 GB) ejecutable en CPU mediante ONNX Runtime, integrable en asistentes de voz locales (OVOS/Mycroft) y en el navegador mediante `phoonnx.js`. Es una pieza de infraestructura para pipelines TTS offline más que un modelo de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (text-to-speech end-to-end, VAE con decoder adversario) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS; entrada por fonemas, sin ventana de contexto declarada) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | francés de Francia (`fr-FR`) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak-ng en alfabeto IPA |
| Tamano del repositorio | 0,1 GB |
| Libreria de inferencia | `phoonnx` |
| Autor upstream | Rhasspy |
| Empaquetado por | Phoonnx |

## Arquitectura y entrenamiento

El modelo es un VITS, una arquitectura de síntesis de voz end-to-end que combina un encoder de texto condicionado por alineamiento monotónico, un prior y posterior variacionales sobre representaciones latentes, y un decoder generativo entrenado con pérdida adversaria junto a un discriminador. Esto permite generar la forma de onda directamente desde los fonemas sin un vocoder separado, lo que reduce la latencia y simplifica el despliegue. La variante "medium" corresponde a la nomenclatura de calidad de Piper.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o ajuste fino adicional en la información proporcionada. El modelo original procede del proyecto Piper de Rhasspy, y Phoonnx únicamente lo ha reempaquetado en ONNX para su librería. La innovación técnica relevante en este empaquetado es el front-end de texto: `phoonnx` delega en `scriptconv` la normalización y la fonemización mediante `EspeakPhonemizer` (extra `scriptconv[espeak]`), de modo que el modelo recibe fonemas IPA en lugar de caracteres.

## Capacidades

- Síntesis de voz en francés de Francia a partir de texto, con salida en fichero WAV.
- Fonemización basada en espeak-ng (o en el port espyak incluido en el extra `phoonnx[espeak]`).
- Ejecución en CPU mediante ONNX Runtime, sin requisito de GPU documentado.
- Integración como plugin TTS en OVOS/Mycroft (`ovos-tts-plugin-phoonnx`) configurable vía `mycroft.conf`.
- Ejecución en navegador mediante `phoonnx.js`, con demo en vivo en `tigregotico.pt/demo`.
- Gestión de voces mediante `TTSModelManager` con `merge_default_voices()` y carga por identificador (`piper/fr_FR-upmc-medium`).
- No soporta tool calling, agentes, razonamiento multi-paso ni entrada multimodal; es exclusivamente un modelo TTS.

## Casos de uso

- Asistentes de voz locales en OVOS/Mycroft: se selecciona la voz en `mycroft.conf` con el módulo `ovos-tts-plugin-phoonnx` y el modelo sintetiza las respuestas del asistente en francés sin conexión a servicios en la nube.
- Síntesis offline en dispositivos de bajos recursos: al distribuirse en ONNX y ejecutarse en CPU, encaja en Raspberry Pi u otros equipos sin GPU para locuciones pregrabadas o dinámicas.
- Generación de audiolibros y contenido narrado en francés: el modelo convierte lotes de texto en WAV mediante `voice.synthesize_wav()`, adecuado para pipelines por lotes donde la latencia no es crítica.
- Accesibilidad y lectores de pantalla: integración en aplicaciones que necesitan leer texto en francés en voz alta con una dependencia ligera (repositorio de 0,1 GB) y licencia MIT.
- Síntesis en el navegador: mediante `phoonnx.js` se puede generar voz francesa del lado del cliente para demos, prototipos o aplicaciones web que requieren TTS sin backend.
- Pruebas y desarrollo de pipelines TTS: sirve como voz de referencia para validar integraciones de `phoonnx`/`scriptconv`, comparar fonemización con espeak-ng frente a espyak, o como base para experimentar con normalización de texto en francés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de calidad (MOS, MCD, WER de fonemización) ni medidas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada: no disponible; el modelo está pensado para inferencia en CPU con ONNX Runtime y no se documentan requisitos de GPU.
- GPU recomendadas: no disponible; no se documenta soporte GPU específico.
- Cabe en GPU consumer: previsiblemente sí por el tamano del repositorio (0,1 GB), aunque no hay confirmación explícita en la información proporcionada.
- Opciones de despliegue: `phoonnx` (Python), `ovos-tts-plugin-phoonnx` (OVOS/Mycroft) y `phoonnx.js` (navegador). Requiere espeak-ng instalado en el sistema (`apt install espeak-ng`) o el extra `phoonnx[espeak]`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| `Phoonnx/vits-fr_fr-upmc-medium-espeak` | VITS | fr-FR | ONNX | MIT | Empaquetado para `phoonnx`; entrada por fonemas espeak |
| `rhasspy/piper-voices` (fr_FR upmc medium) | VITS | fr-FR | ONNX (Piper) | MIT | Modelo upstream del que deriva este |
| Otras voces VITS de la colección Phoonnx | VITS | varios | ONNX | MIT (según upstream) | Mismo pipeline de empaquetado; idiomas y calidades distintas |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta francés de Francia (`fr-FR`); no es multilingüe.
- La entrada debe ser fonemas IPA generados por espeak-ng; si se usa el port espyak, algunos fonemas difieren de espeak-ng y el modelo puede pronunciar mal ciertas palabras, según advierte la propia model card.
- Requiere una dependencia externa (espeak-ng o el extra `phoonnx[espeak]`); sin ella la fonemización no funciona.
- No se documentan sesgos específicos del dataset de entrenamiento ni métricas de calidad; el riesgo de alucinación en sentido estricto no aplica, pero sí el riesgo de pronunciación incorrecta o entonación deficiente en textos con números, siglas o extranjerismos.
- Licencia MIT declarada por el upstream, lo que permite uso comercial; conviene verificar la cadena de licencias del proyecto Piper/Rhasspy antes de redistribuir.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día (2026-11-16): es un artefacto reciente y sin validación comunitaria.
- No hay información sobre latencia, throughput ni comportamiento en producción; habría que medirlo en el hardware objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-fr_fr-upmc-medium-espeak
- Upstream (Rhasspy Piper, fr_FR/upmc/medium): https://huggingface.co/rhasspy/piper-voices/tree/main/fr/fr_FR/upmc/medium
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Repositorio phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en vivo: https://tigregotico.pt/demo
