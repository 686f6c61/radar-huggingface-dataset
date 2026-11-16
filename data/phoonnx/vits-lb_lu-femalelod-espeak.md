# Phoonnx/vits-lb_lu-femalelod-espeak

## Resumen

vits-lb_lu-femalelod-espeak es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por mbarnig y empaquetado por Phoonnx para su librería de inferencia ONNX homónima. El modelo está especializado en el luxemburgués (código ISO `lb`, variante `lb-LU`) y genera una voz femenina identificada como `femaleLOD`, derivada del repositorio upstream `mbarnig/lb_rhasspy_piper_tts`.

El modelo resuelve la necesidad de disponer de una voz TTS ligera y ejecutable en local para una lengua de bajos recursos como el luxemburgués, que rara vez cuenta con cobertura en sistemas comerciales de síntesis de voz. Al estar empaquetado en formato ONNX y distribuirse a través de phoonnx, puede integrarse tanto en aplicaciones Python como en asistentes de voz basados en OVOS.

La relevancia actual del modelo radica en su enfoque práctico: un repositorio de apenas 0,1 GB, licencia permisiva CC-BY-4.0 y un pipeline de fonemización basado en espeak-ng, lo que facilita su despliegue en entornos con recursos limitados y su uso en proyectos de preservación lingüística o asistentes locales para el luxemburgués.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (end-to-end text-to-speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS, entrada por frase) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | luxemburgues (`lb`, variante `lb-LU`) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak en alfabeto IPA |
| Tamano del repositorio | 0,1 GB |
| Libreria de inferencia | phoonnx (Python y OVOS) |
| Autor original | mbarnig |
| Empaquetado por | Phoonnx |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), un modelo generativo condicional que combina un codificador de texto, un prior variacional, un decodificador basado en flujos normalizadores y un discriminador adversarial entrenado de forma conjunta. VITS produce audio de forma directa a partir de fonemas, sin necesidad de un vocoder separado en tiempo de inferencia, lo que reduce la latencia y simplifica el despliegue.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o ajuste fino preferencial. El modelo procede del repositorio `mbarnig/lb_rhasspy_piper_tts`, orientado a la integración con Rhasspy y Piper, lo que sugiere un entrenamiento enfocado a voces de calidad media para asistentes de voz. La innovación técnica destacable es su empaquetado en ONNX para su uso con phoonnx, que añade una capa de normalización de texto y fonemización mediante espeak-ng (o el port espyak) antes de alimentar el modelo.

## Capacidades

- Síntesis de voz a partir de texto en luxemburgués (`lb-LU`) con salida en formato WAV.
- Generación de voz femenina (`femaleLOD`) con calidad media, adecuada para lectura de frases y respuestas de asistente.
- Fonemización de entrada mediante espeak-ng en alfabeto IPA, con soporte alternativo del port espyak (con posibles divergencias fonéticas).
- Integración con la librería phoonnx para Python y con el ecosistema OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Ejecución en navegador a través de phoonnx.js (con entrada espeak o Unicode), según la documentación del proyecto.
- No soporta tool calling, function calling, razonamiento multi-paso ni capacidades de agente: es un modelo exclusivamente de síntesis de voz.
- No dispone de capacidades multimodales (visión, audio de entrada) ni de modo de razonamiento extendido.

## Casos de uso

- Asistentes de voz locales para luxemburgués: el modelo puede integrarse en OVOS mediante `ovos-tts-plugin-phoonnx` para proporcionar respuestas habladas en `lb-LU`, aprovechando su licencia permisiva y su reducido tamaño (0,1 GB) para ejecutarse en dispositivos de bajos recursos.
- Preservación y accesibilidad lingüística: útil para generar audiolibros, avisos o contenido formativo en luxemburgués, una lengua con escasa cobertura en sistemas TTS comerciales.
- Sistemas de anuncios públicos y transporte: síntesis de mensajes dinámicos en luxemburgués para paneles o altavoces en estaciones, con inferencia local y sin dependencia de servicios en la nube.
- Integración en aplicaciones web: mediante phoonnx.js, el modelo puede ejecutarse en el navegador para leer contenido en luxemburgués, útil en sitios institucionales o educativos.
- Prototipado de interfaces conversacionales: desarrolladores que necesiten una voz rápida y ligera para pruebas de concepto en `lb-LU` pueden desplegarla con `pip install --pre phoonnx` y espeak-ng, sin GPU dedicada.
- Investigación en TTS de bajos recursos: sirve como línea base reproducible para comparar técnicas de fonemización (espeak-ng frente a espyak) y calidad de síntesis en lenguas minoritarias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al tratarse de un modelo VITS empaquetado en ONNX de 0,1 GB, es probable que la inferencia se realice en CPU, pero no se confirma en la documentación.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; el tamaño del repositorio sugiere que puede ejecutarse en CPU sin GPU dedicada, aunque no se especifica.
- Opciones de despliegue: phoonnx (Python), OVOS mediante `ovos-tts-plugin-phoonnx`, y phoonnx.js en navegador.
- Dependencias: espeak-ng instalado en el sistema (`apt install espeak-ng`) o el extra `phoonnx[espeak]` con el port espyak.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Contexto / entrada |
|---|---|---|---|---|---|
| vits-lb_lu-femalelod-espeak | VITS | lb-LU | CC-BY-4.0 | ONNX | fonemas espeak IPA |
| mbarnig/lb_rhasspy_piper_tts (upstream) | VITS | lb-LU | CC-BY-4.0 | Piper | fonemas espeak IPA |
| Otras voces de la colección VITS de Phoonnx | VITS | varios | según modelo | ONNX | fonemas espeak IPA |

No se dispone de información sobre benchmarks comparativos ni sobre modelos alternativos de TTS para luxemburgués con los que contrastar rendimiento. La comparación se limita a aspectos estructurales y de licencia.

## Limitaciones y advertencias

- El modelo solo cubre el luxemburgués (`lb-LU`); no es multilingüe y no debe usarse para otros idiomas.
- La fonemización depende de espeak-ng; si se usa el port espyak, algunos fonemas difieren y la voz puede pronunciar mal ciertas palabras, según advierte la propia model card.
- No se han publicado métricas de calidad (MOS, WER) ni benchmarks, por lo que la calidad objetiva no está documentada.
- Riesgo de alucinación no aplica en el sentido de generación de texto, pero sí existe riesgo de pronunciación incorrecta o entonación artificial en frases complejas o con palabras extranjeras.
- La licencia CC-BY-4.0 permite uso comercial siempre que se atribuya la autoría; es necesario conservar la atribución a mbarnig y a Phoonnx según corresponda.
- El modelo está empaquetado para phoonnx; su uso fuera de esa librería requiere cargar directamente el archivo ONNX y gestionar manualmente la fonemización.
- No se especifican sesgos de género o acento más allá de que la voz es femenina (`femaleLOD`), lo que puede no representar la diversidad de hablantes del luxemburgués.
- El repositorio tiene pocas descargas (21) y ningún "like", lo que sugiere una validación comunitaria limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-lb_lu-femalelod-espeak
- Repositorio upstream: https://huggingface.co/mbarnig/lb_rhasspy_piper_tts/tree/main/lb/lb_LU/femaleLOD/medium
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
- phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en vivo: https://tigregotico.pt/demo
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
