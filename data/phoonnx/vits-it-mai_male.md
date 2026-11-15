# Phoonnx/vits-it-mai_male

## Resumen

`vits-it-mai_male` es un modelo de sintesis de voz (text-to-speech) en italiano basado en la arquitectura VITS, desarrollado originalmente por Coqui dentro de su toolkit TTS (version 0.6.1). Phoonnx lo ha empaquetado en formato ONNX para su uso con su propia libreria de inferencia `phoonnx`, lo que permite ejecutarlo en Python y en el ecosistema OVOS sin depender del framework original de Coqui.

El modelo convierte texto en italiano (a nivel de caracteres) en audio de voz masculina. El nombre "mai_male" hace referencia al corpus M-AILABS, un dataset multilingue de audio libro ampliamente utilizado en TTS. Se distribuye con licencia Apache-2.0 y un tamano de repositorio de aproximadamente 0,1 GB, lo que lo situa en la categoria de modelos ligeros aptos para inferencia en CPU.

Su relevancia practica radica en que ofrece una voz italiana masculina de calidad razonable en un paquete ONNX autocontenido, integrable en asistentes de voz (OVOS/Mycroft) y en pipelines de sintesis sin necesidad de GPUs ni de infraestructura pesada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto) |
| Tipos de cuantizacion | no disponible (pesos en ONNX; el repo no detalla variantes) |
| Idiomas soportados | italiano (`it`) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (empaquetado para `phoonnx`) |

## Arquitectura y entrenamiento

VITS es un modelo end-to-end de sintesis de voz que combina un encoder de texto, un predictor de duracion, un normalizing flow y un decoder generativo basado en HiFi-GAN, entrenado con aprendizaje adversarial condicionado (cGAN) y una perdida de reconstruccion variacional. Esta arquitectura permite generar audio de forma directa desde texto sin necesidad de un vocoder separado ni de alineamientos explicitos, lo que reduce la latencia y simplifica el despliegue.

El modelo original fue entrenado por Coqui sobre el corpus M-AILABS (italiano, voz masculina), segun se desprende del identificador `it-mai_male-vits` y de la nota de licencia de la model card. No se dispone de informacion sobre el numero exacto de horas de audio, la composicion del dataset mas alla del corpus citado, ni sobre si se aplicaron etapas de RLHF/DPO (no habituales en TTS clasico). La innovacion principal del empaquetado es la conversion a ONNX y la integracion con `scriptconv` para normalizacion de texto y fonemizacion basada en grafemas (`GraphemePhonemizer`).

## Capacidades

- Sintesis de voz (text-to-speech) en italiano a partir de texto plano.
- Voz masculina (variante `mai_male` del corpus M-AILABS).
- Entrada a nivel de caracteres (no requiere fonemas IPA precalculados por el usuario).
- Normalizacion de texto y conversion de script mediante `scriptconv` (incluye `GraphemePhonemizer`).
- Generacion de audio en formato WAV mediante `synthesize_wav`.
- Integracion como plugin de TTS en OVOS (`ovos-tts-plugin-phoonnx`) y en asistentes Mycroft.
- Ejecucion en CPU gracias al formato ONNX y al reducido tamano del modelo.
- No soporta tool calling, function calling, agentes, vision, audio de entrada ni modo thinking (es exclusivamente TTS).

## Casos de uso

- Asistentes de voz locales (OVOS/Mycroft): el modelo se selecciona como modulo TTS en `mycroft.conf` y permite respuestas habladas en italiano sin conexion a servicios en la nube, gracias a su formato ONNX y su bajo consumo.
- Lectura de articulos y notificaciones en italiano: integracion en pipelines de conversion texto-a-voz para generar ficheros WAV a partir de texto, util en aplicaciones de accesibilidad.
- Sistemas de megafonia y anuncios automatizados: sintesis de avisos en italiano en entornos con recursos limitados (Raspberry Pi, servidores sin GPU), donde el tamano de 0,1 GB y la inferencia en CPU son determinantes.
- Prototipado rapido de interfaces conversacionales en italiano: permite validar flujos de voz masculina antes de invertir en modelos comerciales o de mayor calidad.
- Generacion de audiolibros o contenido educativo en italiano: sintesis por lotes de parrafos a WAV con una voz masculina consistente.
- Pruebas de regresion en pipelines de TTS: al ser un paquete ONNX reproducible, sirve como baseline para comparar calidad y latencia frente a otros modelos VITS de la coleccion Phoonnx.
- Integracion en aplicaciones de escritorio o moviles con ONNX Runtime: el modelo puede embeberse en apps que requieran TTS offline en italiano sin dependencias de Coqui TTS.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; por el tamano del repo (0,1 GB) es plausible su ejecucion en CPU sin GPU dedicada, aunque no se confirma en la model card.
- GPU recomendadas: no disponible (no se especifican; el modelo esta pensado para inferencia en CPU via ONNX).
- Compatibilidad con GPU de consumo: no confirmada; el formato ONNX permite ejecucion en CPU y potencialmente en GPU via ONNX Runtime, pero no se detalla.
- Opciones de despliegue: `phoonnx` (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS/Mycroft, y ONNX Runtime de forma generica.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|---|---|
| `Phoonnx/vits-it-mai_male` | VITS | Italiano | no disponible | no aplica | Apache-2.0 | ONNX |
| Coqui TTS `tts_models--it--mai_male--vits` (upstream) | VITS | Italiano | no disponible | no aplica | Apache-2.0 | Checkpoint PyTorch |
| Otros modelos de la coleccion Phoonnx VITS | VITS | Multiples | no disponible | no aplica | variable | ONNX |
| Alternativas TTS comerciales (p. ej. ElevenLabs, Azure TTS) | no disponible | Multiples | no disponible | no disponible | Propietaria | API |

La comparativa se limita al ecosistema Coqui/Phoonnx porque no se dispone de datos de benchmarks ni de parametros para modelos alternativos en la informacion proporcionada. La diferencia principal frente al upstream de Coqui es el empaquetado ONNX y la integracion con `phoonnx`/OVOS; frente a soluciones comerciales, la ventaja es la ejecucion local y la licencia permisiva, a costa de una calidad y expresividad presumiblemente inferiores (no verificable con los datos disponibles).

## Limitaciones y advertencias

- Modelo exclusivamente en italiano; no soporta otros idiomas.
- Voz unica masculina (corpus M-AILABS); no hay variantes de hablante ni control de emocion documentado.
- Entrada a nivel de caracteres: la calidad puede degradarse con abreviaturas, numeros o texto no normalizado si `scriptconv` no los resuelve correctamente.
- Riesgo de pronunciacion incorrecta en palabras extranas, nombres propios o terminologia tecnica no presente en el corpus de entrenamiento.
- No se documentan sesgos especificos, pero al derivar de un corpus de audio libro puede reflejar sesgos de estilo y registro del material original.
- Licencia Apache-2.0 permite uso comercial, pero se recomienda verificar la procedencia del corpus M-AILABS y las condiciones originales de Coqui para el modelo upstream.
- No se dispone de informacion sobre latencia, calidad MOS ni rendimiento comparativo; no debe asumirse calidad de produccion sin evaluacion propia.
- El repo tiene solo 28 descargas y 0 likes en el momento de la ficha, lo que indica poca validacion comunitaria.
- Dependencia de la libreria `phoonnx` (version pre-release, `pip install --pre phoonnx`) y de `scriptconv`; posibles cambios de API.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-it-mai_male
- Modelo upstream (Coqui TTS v0.6.1): https://github.com/coqui-ai/TTS/releases/download/v0.6.1_models/tts_models--it--mai_male--vits.zip
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
- Coqui TTS (repositorio): https://github.com/coqui-ai/TTS
