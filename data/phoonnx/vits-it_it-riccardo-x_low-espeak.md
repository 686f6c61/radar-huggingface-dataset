# Phoonnx/vits-it_it-riccardo-x_low-espeak

## Resumen

`vits-it_it-riccardo-x_low-espeak` es un modelo de síntesis de voz (text-to-speech) en italiano basado en la arquitectura VITS, publicado por el usuario Phoonnx. No se trata de un modelo entrenado desde cero por Phoonnx, sino de un reempaquetado del voice `it_IT/riccardo/x_low` del proyecto Rhasspy Piper, convertido al formato ONNX para funcionar con la librería de inferencia phoonnx. El autor original del checkpoint es Rhasspy.

El modelo resuelve la conversión de texto a audio en italiano (`it-IT`) a partir de fonemas generados por espeak-ng en alfabeto IPA. Su relevancia es práctica: permite incorporar TTS italiano de baja latencia en aplicaciones Python y en el ecosistema OVOS sin depender de servicios en la nube, con un tamaño de repositorio de 0.0 GB que sugiere un checkpoint muy ligero, coherente con la variante `x_low` de Piper.

La ficha se basa exclusivamente en la model card y en los metadatos de Hugging Face. No hay información publicada sobre número de parámetros, contexto (no aplica en TTS), datos de entrenamiento ni benchmarks, por lo que esos campos se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference text-to-speech) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica a TTS) |
| Tipos de cuantizacion | no disponible; pesos en ONNX (variante `x_low` de Piper) |
| Idiomas soportados | italiano (`it-IT`) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak, alfabeto IPA |
| Libreria de inferencia | phoonnx (Python), phoonnx.js (navegador) |
| Pipeline | text-to-speech |
| Tamano del repositorio | 0.0 GB |
| Upstream | rhasspy/piper-voices `it/it_IT/riccardo/x_low` |
| Autor del checkpoint | Rhasspy |
| Empaquetado | Phoonnx |

## Arquitectura y entrenamiento

VITS es un modelo generativo condicional de extremo a extremo que combina un codificador de texto, un prior variacional, un decodificador basado en normalizing flows y un discriminador adversarial para el entrenamiento, con alineamiento monotónico aprendido. Esta variante corresponde a la familia Piper, que entrena VITS sobre corpus de voz con fonemización externa mediante espeak-ng. La model card no detalla el número de tokens, la composición del dataset, ni si hubo etapas de RLHF o DPO (no aplicables habitualmente en TTS).

El modelo original es el voice `riccardo` en calidad `x_low`, la variante de menor coste computacional de Piper. El empaquetado para phoonnx añade una capa de integración: la normalización y conversión de texto se delega en `scriptconv`, que utiliza `EspeakPhonemizer` del módulo `scriptconv_copyleft.phonemizers.mul` (extra `scriptconv[espeak]`). La entrada al modelo son fonemas IPA producidos por espeak-ng, y la salida es audio WAV. No se documentan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Síntesis de voz en italiano (`it-IT`) a partir de texto plano.
- Fonemización mediante espeak-ng con alfabeto IPA.
- Generación de audio WAV mediante `voice.synthesize_wav` en Python.
- Integración con OVOS a través del plugin `ovos-tts-plugin-phoonnx`.
- Ejecución en navegador mediante `phoonnx.js` con entrada espeak o unicode.
- No dispone de tool calling, function calling ni razonamiento multi-paso (no aplica).
- No soporta visión, audio de entrada ni modo de pensamiento.
- Capacidad multilingüe limitada al italiano; no se declaran otros idiomas.

## Casos de uso

- **Asistentes de voz en OVOS**: el modelo se selecciona en `mycroft.conf` con `"voice": "piper/it_IT-riccardo-x_low"` y el plugin `ovos-tts-plugin-phoonnx`, permitiendo respuestas habladas en italiano en asistentes domésticos autoalojados.
- **Lectura de notificaciones y alertas**: integración en pipelines Python que conviertan mensajes de texto en WAV mediante `synthesize_wav`, adecuado por el bajo coste de la variante `x_low`.
- **Prototipado rápido de interfaces de voz**: al requerir solo `pip install --pre phoonnx` y `espeak-ng`, sirve para validar flujos TTS en italiano antes de invertir en modelos mayores.
- **Aplicaciones web con TTS en cliente**: `phoonnx.js` permite ejecutar la voz en el navegador con entrada espeak o unicode, útil para demos y herramientas interactivas sin backend de inferencia.
- **Accesibilidad y lectura de contenido**: conversión de artículos, correos o documentación en italiano a audio para usuarios con discapacidad visual o preferencia auditiva.
- **Sistemas embebidos y edge**: la variante `x_low` y el formato ONNX facilitan el despliegue en dispositivos con recursos limitados, aunque no se publican cifras de latencia ni de memoria.
- **Generación de audiolibros o podcasts de bajo coste**: síntesis por lotes de textos largos con un modelo ligero y licencia MIT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la model card.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; el tamaño del repositorio (0.0 GB) y la variante `x_low` sugieren un modelo muy ligero, pero no se aportan cifras.
- Opciones de despliegue: phoonnx en Python, `ovos-tts-plugin-phoonnx` en OVOS y `phoonnx.js` en el navegador.
- Requisito adicional: espeak-ng instalado (por ejemplo `apt install espeak-ng`) o el extra `phoonnx[espeak]` con el port espyak.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vits-it_it-riccardo-x_low-espeak (este) | VITS | it-IT | ONNX | MIT | Hugging Face, phoonnx |
| rhasspy/piper-voices it_IT/riccardo/x_low | VITS | it-IT | Piper | MIT (segun upstream) | Hugging Face, Piper |
| Otras voces VITS de la coleccion Phoonnx | VITS | varios | ONNX | MIT (por confirmar en cada ficha) | Hugging Face |
| Modelos TTS comerciales en la nube | no disponible | multiples | API | propietaria | servicios gestionados |

No se dispone de datos de rendimiento comparativo (MOS, latencia, WER) en la informacion proporcionada.

## Limitaciones y advertencias

- La variante `x_low` prioriza el rendimiento sobre la calidad de audio; no se publican métricas de naturalidad.
- La fonemización con espyak puede diferir de espeak-ng y producir pronunciaciones incorrectas en algunas palabras, según advierte la propia model card.
- Requiere espeak-ng instalado; sin él, la calidad y la corrección fonética pueden degradarse.
- Solo soporta italiano (`it-IT`); no hay capacidades multilingües declaradas.
- No se documentan sesgos del corpus de entrenamiento ni evaluación de robustez ante texto ruidoso o dominios especializados.
- Riesgo de alucinación no aplica en el sentido de generación de texto, pero sí puede haber errores de pronunciación y prosodia en palabras fuera del dominio de entrenamiento.
- Licencia MIT declarada por el upstream; conviene verificar los términos de los datos de entrenamiento originales antes de un uso comercial a gran escala.
- No hay información sobre latencia, memoria ni throughput, lo que dificulta dimensionar despliegues en producción.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Phoonnx/vits-it_it-riccardo-x_low-espeak)
- [Upstream rhasspy/piper-voices it_IT/riccardo/x_low](https://huggingface.co/rhasspy/piper-voices/tree/main/it/it_IT/riccardo/x_low)
- [Repositorio phoonnx](https://github.com/TigreGotico/phoonnx)
- [Repositorio scriptconv](https://github.com/TigreGotico/scriptconv)
- [Repositorio phoonnx.js](https://github.com/TigreGotico/phoonnx.js)
- [Demo de phoonnx.js](https://tigregotico.pt/demo)
- [Coleccion VITS de Phoonnx](https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65)
