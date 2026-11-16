# Phoonnx/vits-hu_hu-imre-medium-espeak

## Resumen

vits-hu_hu-imre-medium-espeak es un modelo de síntesis de voz (text-to-speech) de arquitectura VITS, empaquetado por Phoonnx para su librería ONNX de TTS. El modelo original procede del proyecto Rhasspy, concretamente de la colección piper-voices, en la ruta `hu/hu_HU/imre/medium`. Está especializado en la voz "imre" en húngaro (hu-HU) y se distribuye en formato ONNX para inferencia ligera.

El modelo resuelve el problema de la síntesis de voz neuronal en húngaro dentro del ecosistema Piper/phoonnx, permitiendo generar audio de forma local y sin dependencias de servicios en la nube. Su tamaño de repositorio (0,1 GB) y su formato ONNX lo hacen adecuado para despliegues en dispositivos con recursos limitados, incluidos entornos de asistente de voz como OVOS.

La relevancia actual radica en su integración con la cadena de herramientas de Phoonnx (scriptconv para normalización y fonemización vía espeak-ng) y en su licencia MIT, que facilita su uso comercial. No obstante, se trata de un modelo de nicho con cero descargas y cero likes en el momento de la consulta, y su fecha de creación (2026-11-16) es posterior a la de esta ficha, lo que debe tenerse en cuenta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | húngaro (hu-HU) |
| Licencia | MIT |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), un sistema de síntesis neuronal de extremo a extremo que combina un codificador de texto, un prior variacional, un decodificador generativo y un discriminador adversarial durante el entrenamiento. VITS genera audio de forma directa a partir de fonemas, sin necesidad de un vocoder separado en la inferencia.

El modelo original fue entrenado por Rhasspy dentro del proyecto piper-voices. No se dispone en la información proporcionada de datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO (habitualmente no aplicables a TTS). La entrada de texto se realiza mediante fonemas espeak en alfabeto IPA, y el front-end de texto lo proporciona scriptconv a través de `EspeakPhonemizer`. No se han documentado innovaciones técnicas adicionales en la información disponible.

## Capacidades

- Síntesis de voz (text-to-speech) en húngaro (hu-HU) a partir de texto.
- Entrada basada en fonemas espeak en alfabeto IPA.
- Generación de audio en formato WAV mediante la API de phoonnx (`synthesize_wav`).
- Integración con el ecosistema OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Ejecución local en Python y en navegador (phoonnx.js) con entrada espeak o unicode.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje).
- No dispone de modo thinking, visión ni audio de entrada.

## Casos de uso

- Asistentes de voz locales en húngaro: el modelo puede integrarse en OVOS configurando `ovos-tts-plugin-phoonnx` con la voz `piper/hu_HU-imre-medium`, proporcionando respuestas habladas sin conexión a internet.
- Lectura de texto en aplicaciones de accesibilidad: se puede usar para convertir artículos o notificaciones en audio para usuarios húngaros, gracias a su formato ONNX ligero y su ejecución local.
- Síntesis en el navegador: mediante phoonnx.js, el modelo puede ejecutarse del lado del cliente para generar audio en aplicaciones web sin enviar texto a un servidor.
- Generación de avisos y anuncios automatizados: en sistemas de megafonía o domótica que requieran mensajes pregrabados dinámicos en húngaro.
- Prototipado de interfaces conversacionales: al ser un modelo pequeño (0,1 GB) y con licencia MIT, es adecuado para pruebas de concepto en entornos de investigación de interacción voz-texto.
- Integración en pipelines de procesamiento por lotes: la API de phoonnx permite sintetizar múltiples frases a archivos WAV de forma programática para la creación de datasets de audio o doblaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al tratarse de un modelo ONNX de 0,1 GB, es probable que quepa en memoria de CPU y GPU de gama baja, pero no se proporcionan cifras oficiales.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU consumer: no disponible; por el tamaño del repositorio, es plausible que funcione en GPUs integradas o de gama baja, pero no se confirma.
- Opciones de despliegue: phoonnx (Python), phoonnx.js (navegador), OVOS mediante `ovos-tts-plugin-phoonnx`.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| vits-hu_hu-imre-medium-espeak | VITS | hu-HU | no aplica | MIT | ONNX | Hugging Face (Phoonnx) |
| Otras voces piper-voices (p. ej., hu_HU otras voces) | VITS | varios | no aplica | MIT (según upstream) | ONNX | Hugging Face (Rhasspy) |
| Modelos TTS multilingües comerciales | no disponible | varios | no aplica | propietaria | no disponible | APIs comerciales |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo soporta húngaro (hu-HU); no es multilingüe.
- La fonemización depende de espeak-ng; si se usa la implementación espyak, algunos fonemas difieren y pueden producir palabras mal pronunciadas.
- No se han publicado métricas de calidad (MOS, WER) ni benchmarks, por lo que se desconoce su fidelidad y naturalidad.
- Riesgo de alucinación no aplica en el sentido de texto, pero puede haber errores de pronunciación en palabras fuera del dominio de entrenamiento.
- Licencia MIT, lo que permite uso comercial, pero se recomienda verificar la licencia upstream de rhasspy/piper-voices.
- El modelo tiene cero descargas y cero likes, y su fecha de creación es futura respecto a la elaboración de esta ficha; su disponibilidad y mantenimiento no están contrastados.
- No dispone de soporte para tool calling, agentes ni razonamiento, al no ser un modelo de lenguaje.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-hu_hu-imre-medium-espeak
- Upstream (Rhasspy piper-voices): https://huggingface.co/rhasspy/piper-voices/tree/main/hu/hu_HU/imre/medium
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Repositorio phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en vivo: https://tigregotico.pt/demo
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
