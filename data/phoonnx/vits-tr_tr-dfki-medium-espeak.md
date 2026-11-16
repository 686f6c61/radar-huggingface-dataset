# Phoonnx/vits-tr_tr-dfki-medium-espeak

## Resumen

`vits-tr_tr-dfki-medium-espeak` es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por Rhasspy dentro del proyecto Piper y empaquetado por Phoonnx para su librería de inferencia ONNX homónima. El modelo convierte texto en turco (`tr-TR`) a audio inteligible, tomando como entrada fonemas generados por espeak-ng en alfabeto IPA. Su propósito es ofrecer una voz TTS ligera, ejecutable localmente y sin dependencias de servicios en la nube, orientada a asistentes de voz y aplicaciones de accesibilidad.

La relevancia de este artefacto es fundamentalmente práctica: se trata de un modelo pequeño (repo de 0,1 GB), con licencia MIT y formato ONNX, lo que permite desplegarlo en CPU y en dispositivos de recursos limitados. No es un modelo de propósito general ni compite en calidad con sistemas neuronales de gran escala, sino que cubre el nicho de voces TTS offline para turco dentro del ecosistema OVOS/Mycroft y de la librería phoonnx.

El modelo no dispone de parámetros publicados, ni de datos sobre el corpus de entrenamiento, ni de métricas de calidad objetivas en la información disponible. Su valor reside en la integración lista para producción con phoonnx y en su licencia permisiva.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VITS (variational inference with adversarial learning for end-to-end TTS) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no de contexto textual) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | turco (`tr-TR`) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak, alfabeto IPA |
| Tamaño del repositorio | 0,1 GB |
| Librería de inferencia | phoonnx |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

VITS es una arquitectura end-to-end de síntesis de voz que combina un encoder de texto, un prior variacional, un decoder generativo basado en flujos normalizadores y un discriminador adversarial entrenado conjuntamente. Este enfoque permite generar audio de forma directa a partir de fonemas sin necesidad de un vocoder externo, lo que reduce la latencia y simplifica el despliegue. El modelo se distribuye en formato ONNX, lo que facilita su ejecución en runtime multiplataforma.

El modelo procede del catálogo `rhasspy/piper-voices`, concretamente de la voz `tr/tr_TR/dfki/medium`. No se dispone de información sobre el número de tokens de entrenamiento, la composición del corpus, la duración total de audio ni si se aplicaron técnicas de RLHF o DPO. Tampoco se documentan innovaciones técnicas adicionales más allá de las propias de VITS y del pipeline de fonemización con espeak-ng.

## Capacidades

- Síntesis de voz a partir de texto en turco (`tr-TR`), con salida en formato WAV.
- Fonemización mediante espeak-ng en alfabeto IPA; requiere espeak-ng instalado o el extra `phoonnx[espeak]` que incluye el port espyak.
- Ejecución local en CPU mediante ONNX, sin dependencias de red.
- Integración con OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Integración en Python mediante `TTSModelManager` y `voice.synthesize_wav`.
- No soporta tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada.
- Capacidad multilingüe limitada al turco; no se documentan otras lenguas.

## Casos de uso

- Asistentes de voz para OVOS/Mycroft: el modelo se selecciona como voz activa en `mycroft.conf` mediante el plugin `ovos-tts-plugin-phoonnx`, permitiendo respuestas habladas en turco en un asistente doméstico local.
- Accesibilidad y lectura de pantalla: integración en aplicaciones de escritorio o móvil que necesiten leer texto en turco en voz alta sin conexión a Internet, gracias a su formato ONNX y a su reducido tamaño.
- Sistemas de megafonía e información pública: generación de avisos pregrabados o dinámicos en turco para estaciones, aeropuertos o comercios, donde la latencia y el coste por inferencia son críticos.
- Videojuegos y experiencias interactivas: diálogos de personajes no jugadores en turco generados en tiempo de ejecución en CPU, sin necesidad de GPU dedicada.
- Automatización de contenidos educativos: conversión de materiales de aprendizaje de turco a audio para plataformas de e-learning, con licencia MIT que permite uso comercial.
- Pruebas de integración en pipelines CI/CD: validación de la cadena de fonemización espeak-ng y de la síntesis WAV en entornos de integración continua, dado el bajo peso del modelo (0,1 GB).
- Prototipado de interfaces conversacionales: generación rápida de respuestas de voz en demos y pruebas de concepto de asistentes turco-parlantes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el modelo se ejecuta en CPU mediante ONNX y su tamaño de repositorio es de 0,1 GB, por lo que la huella de memoria es reducida.
- GPU recomendadas: no se documentan; al ser un modelo ONNX de pequeño tamaño, no requiere GPU dedicada.
- Compatibilidad con GPU de consumo: sí, previsiblemente en cualquier GPU de consumo e incluso en CPU, aunque no se publican cifras oficiales.
- Opciones de despliegue: phoonnx (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS, y phoonnx.js para navegador con entrada espeak o unicode.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Formato | Licencia | Tamaño |
|---|---|---|---|---|---|
| `vits-tr_tr-dfki-medium-espeak` (este) | VITS | tr-TR | ONNX | MIT | 0,1 GB |
| Otras voces Piper `tr_TR` | VITS | tr-TR | ONNX | MIT (según upstream) | no disponible |
| Modelos TTS neuronales de gran escala | no disponible | multilingüe | safetensors/ONNX | variable | varios GB |

No se dispone de datos de rendimiento comparativo ni de parámetros de modelos alternativos en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta turco (`tr-TR`); no es multilingüe.
- La calidad de pronunciación depende de espeak-ng: con el port espyak algunos fonemas difieren y el modelo puede pronunciar mal ciertas palabras.
- Requiere instalar espeak-ng o el extra `phoonnx[espeak]`; sin ello, la fonemización falla.
- No se documentan sesgos específicos, pero al ser un modelo entrenado sobre un corpus no publicado, pueden existir sesgos de pronunciación, dialecto o género no evaluados.
- Riesgo de alucinación en el sentido de prosodia incorrecta o pronunciación errónea en palabras fuera del vocabulario de entrenamiento; no se han publicado métricas de inteligibilidad (MOS, WER).
- Licencia MIT declarada por el upstream en la model card de `rhasspy/piper-voices`; conviene verificar los términos del corpus original antes de uso comercial a gran escala.
- No apto para tareas de razonamiento, código, matemáticas, visión ni agentes.
- Sin datos de benchmarks ni de latencia, lo que dificulta estimar su idoneidad en producción de alta concurrencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-tr_tr-dfki-medium-espeak
- Upstream en Piper: https://huggingface.co/rhasspy/piper-voices/tree/main/tr/tr_TR/dfki/medium
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Repositorio phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
