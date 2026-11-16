# Phoonnx/vits-cs_cz-jirka-medium-espeak

## Resumen

`vits-cs_cz-jirka-medium-espeak` es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por Rhasspy dentro del proyecto Piper y empaquetado por Phoonnx para su librería de inferencia ONNX homónima. El modelo convierte texto en checo (`cs-CZ`) en audio inteligible, tomando como entrada fonemas generados por espeak-ng en alfabeto IPA en lugar de texto plano. Su relevancia radica en que ofrece una voz preentrenada ligera, con licencia MIT, ejecutable en CPU mediante ONNX Runtime, lo que lo hace adecuado para asistentes de voz locales y sistemas embebidos donde no se dispone de GPU.

El modelo forma parte de la colección de voces VITS empaquetadas por Phoonnx, que reexporta los pesos de `rhasspy/piper-voices` en un formato consumible por la librería `phoonnx` y por el ecosistema OVOS (Open Voice OS). No se trata de un modelo de propósito general ni de un LLM: es un sintetizador acústico de un único hablante para checo, con un tamaño de repositorio de 0,1 GB, lo que refleja su naturaleza compacta.

Al estar orientado a la inferencia local y al ecosistema de asistentes de voz de código abierto, su interés es fundamentalmente práctico: permite integrar TTS checo en pipelines de voz sin dependencias de servicios en la nube ni de licencias restrictivas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference text-to-speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS, entrada por fonemas) |
| Tipos de cuantizacion | no disponible (pesos ONNX; el repo declara formato ONNX) |
| Idiomas soportados | checo (`cs-CZ`) |
| Licencia | MIT |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

VITS es una arquitectura de síntesis de voz de extremo a extremo que combina un codificador de texto, un prior variacional condicionado por alineamiento monotónico y un decodificador generativo basado en flujos normalizadores y un vocoder integrado. El modelo produce audio directamente a partir de la secuencia de fonemas, evitando etapas intermedias de alineamiento explícito. En este caso concreto, la entrada no es texto en bruto sino fonemas en alfabeto IPA generados por espeak-ng, lo que exige instalar dicho motor fonemizador como dependencia del pipeline.

Los detalles de entrenamiento (número de tokens, horas de audio, composición del dataset, uso de RLHF o DPO) no están disponibles en la información proporcionada. El modelo procede de `rhasspy/piper-voices/cs/cs_CZ/jirka/medium`, una colección de voces Piper entrenadas por Rhasspy; Phoonnx se limita a empaquetar y reexportar los pesos a ONNX para su librería. No se documentan innovaciones técnicas adicionales más allá de las propias de VITS.

## Capacidades

- Síntesis de voz a partir de texto en checo (`cs-CZ`), con salida en formato WAV.
- Entrada basada en fonemas espeak-ng en alfabeto IPA; requiere el fonemizador externo.
- Normalización y conversión de texto delegada a la librería `scriptconv` (extra `scriptconv[espeak]`).
- Ejecución en CPU mediante ONNX Runtime, sin necesidad de GPU.
- Integración con el ecosistema OVOS a través del plugin `ovos-tts-plugin-phoonnx`.
- Ejecución en navegador mediante `phoonnx.js` (con entrada espeak o unicode).
- No soporta tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada.
- Modelo de un único hablante (voz `jirka`); no se documenta control de emoción, velocidad ni estilo.

## Casos de uso

- Asistentes de voz locales en checo: el modelo puede generar respuestas habladas en Open Voice OS configurando el plugin `ovos-tts-plugin-phoonnx` con la voz `piper/cs_CZ-jirka-medium`, sin depender de servicios en la nube.
- Lectura de notificaciones y alertas en sistemas domóticos: al ejecutarse en CPU y ocupar 0,1 GB, puede desplegarse en dispositivos de bajos recursos para anunciar eventos en checo.
- Accesibilidad para personas con discapacidad visual: integración en lectores de pantalla o aplicaciones que conviertan texto checo en audio bajo licencia MIT.
- Síntesis de voz en aplicaciones de escritorio o web: mediante `phoonnx.js` puede generar audio en el navegador con entrada unicode o espeak, útil para prototipos de interfaces habladas.
- Generación de audiolibros o contenido pregrabado en checo: el modelo permite sintetizar pasajes de texto a WAV para su posterior postprocesado.
- Pruebas de pipelines de voz en investigación: sirve como referencia ligera de VITS para evaluar calidad, latencia y fonemización espeak en checo antes de escalar a voces de mayor tamaño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en GPU; el modelo está empaquetado en ONNX y orientado a ejecución en CPU. El repositorio ocupa 0,1 GB, por lo que la huella en memoria es reducida.
- GPU recomendadas: no se documentan; al ser un modelo VITS ligero, no requiere GPU.
- Cabe en GPU de consumo: sí, aunque su diseño es para CPU; cualquier GPU consumer podría ejecutarlo si el runtime ONNX lo permite.
- Opciones de despliegue: `phoonnx` (Python y OVOS), `phoonnx.js` (navegador), ONNX Runtime; requiere espeak-ng o el extra `phoonnx[espeak]` para la fonemización.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Contexto/entrada |
|---|---|---|---|---|---|
| `Phoonnx/vits-cs_cz-jirka-medium-espeak` | VITS | cs-CZ | MIT | ONNX | Fonemas espeak IPA |
| `rhasspy/piper-voices` (cs_CZ/jirka/medium) | VITS | cs-CZ | MIT | Piper/ONNX | Fonemas espeak |
| Otras voces VITS de la colección Phoonnx | VITS | varios | MIT | ONNX | Fonemas espeak |

La comparativa directa con modelos de otras familias (por ejemplo, sintetizadores neuronales de mayor tamaño como Tacotron o modelos de difusión) no está disponible en la información proporcionada. El modelo es esencialmente un reempaquetado del original de Rhasspy, por lo que su comportamiento acústico es equivalente al de la voz Piper de origen.

## Limitaciones y advertencias

- Modelo de un único hablante y un único idioma (checo); no soporta multilingüismo ni cambio de voz.
- Depende de espeak-ng para la fonemización; si se usa el port `espyak`, algunos fonemas difieren y el modelo puede pronunciar mal ciertas palabras.
- Riesgo de alucinación acústica y errores de pronunciación en palabras fuera del dominio de entrenamiento, siglas o números no normalizados correctamente.
- No se documentan sesgos específicos, pero al derivar de un corpus de una sola voz, puede reflejar las características del hablante original.
- La licencia MIT permite uso comercial, pero se recomienda verificar la procedencia de los datos de entrenamiento originales de Piper.
- No apto para tareas de razonamiento, generación de texto, código o visión.
- La fecha de creación del repositorio (2026-11-16) y el recuento de descargas (0) indican que es un artefacto reciente y poco validado por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-cs_cz-jirka-medium-espeak
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
- Voz original Piper: https://huggingface.co/rhasspy/piper-voices/tree/main/cs/cs_CZ/jirka/medium
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
- phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
