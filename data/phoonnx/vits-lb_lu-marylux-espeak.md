# Phoonnx/vits-lb_lu-marylux-espeak

## Resumen

vits-lb_lu-marylux-espeak es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, empaquetado por Phoonnx en formato ONNX para su uso con su librería de inferencia `phoonnx`. El modelo original fue desarrollado por mbarnig como parte del proyecto Rhasspy Piper TTS, concretamente la variante `lb_LU/marylux/medium`, y Phoonnx lo redistribuye adaptado a su ecosistema. Está especializado en la síntesis de voz en luxemburgués (código ISO `lb`, variante `lb-LU`).

El modelo resuelve un problema muy concreto: la generación de audio inteligible en luxemburgués, una lengua con escasos recursos en el ámbito del TTS neuronal. Al estar empaquetado en ONNX, puede ejecutarse en entornos ligeros sin necesidad de frameworks de deep learning pesados, lo que lo hace adecuado para asistentes de voz locales, sistemas embebidos y aplicaciones de accesibilidad en esa lengua.

La relevancia de esta ficha es limitada fuera del nicho del luxemburgués: se trata de un modelo pequeño (repo de 0,1 GB), con 19 descargas y sin métricas de rendimiento publicadas. Su interés principal radica en su integración con el ecosistema OVOS (Open Voice OS) y en servir como ejemplo de empaquetado de voces Piper para `phoonnx`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference text-to-speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | luxemburgués (`lb`, variante `lb-LU`) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

VITS es una arquitectura de síntesis de voz de extremo a extremo que combina un codificador de texto, un prior variacional condicionado por texto, un decodificador generativo basado en flujos normalizadores y un discriminador adversarial para el entrenamiento. El resultado es un modelo que genera formas de onda directamente a partir de fonemas, sin necesidad de un vocoder separado. La variante `medium` del proyecto Rhasspy Piper indica un tamaño intermedio dentro de la familia de voces Piper.

El modelo original fue entrenado por mbarnig dentro del proyecto `lb_rhasspy_piper_tts`, orientado a proporcionar voces de calidad para asistentes de voz en luxemburgués. La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o fine-tuning preferencial; estos datos no están publicados en la model card. La entrada de texto se realiza mediante fonemas espeak en alfabeto IPA, lo que implica que el front-end de texto debe fonemizar correctamente el luxemburgués antes de la inferencia.

## Capacidades

- Síntesis de voz a partir de texto en luxemburgués (`lb-LU`).
- Generación de audio en formato WAV mediante la API de `phoonnx`.
- Entrada basada en fonemas espeak-ng (alfabeto IPA), lo que permite un control preciso de la pronunciación si se dispone de la transcripción fonémica.
- Integración con el ecosistema OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Ejecución en navegador a través de `phoonnx.js` (con entrada espeak o unicode).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multimodales: es exclusivamente un modelo TTS.
- Capacidad multilingüe limitada al luxemburgués; no se documentan otras lenguas.

## Casos de uso

- Asistentes de voz locales en luxemburgués: el modelo puede integrarse en OVOS o en cualquier sistema basado en `phoonnx` para dotar de voz a un asistente doméstico que opere en esta lengua, con inferencia en local y sin dependencia de servicios en la nube.
- Accesibilidad para lectores de pantalla: conversión de texto a voz en luxemburgués para personas con discapacidad visual, aprovechando el reducido tamaño del modelo (0,1 GB) para ejecutarlo en dispositivos de gama baja.
- Señalización y anuncios automatizados: generación de avisos hablados en estaciones, aeropuertos o edificios públicos de Luxemburgo, donde el luxemburgués es lengua oficial y no abundan las voces TTS comerciales.
- Aplicaciones educativas de aprendizaje de idiomas: producción de audio de referencia para estudiantes de luxemburgués, con la posibilidad de controlar la pronunciación mediante fonemas IPA.
- Prototipado de interfaces conversacionales: uso en demos y pruebas de concepto de chatbots de voz en luxemburgués, gracias a la facilidad de instalación (`pip install --pre phoonnx`) y a la API simple de síntesis a WAV.
- Investigación en TTS de bajos recursos: servir como línea base o punto de comparación para nuevos modelos de síntesis en lenguas minoritarias, dado que el código y los pesos son abiertos (CC-BY-4.0).
- Integración web: mediante `phoonnx.js`, generar audio en el navegador para aplicaciones web dirigidas a usuarios luxemburgueses sin necesidad de backend.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; por el tamaño del repositorio (0,1 GB) y la naturaleza de VITS en ONNX, se espera un consumo muy bajo, del orden de cientos de MB o menos, ejecutable en CPU.
- GPU recomendadas: no se especifican; el modelo está pensado para inferencia en CPU mediante ONNX Runtime, por lo que no requiere GPU dedicada.
- Cabe en cualquier GPU consumer (RTX 4090, RTX 3060, etc.) e incluso en dispositivos sin GPU.
- Opciones de despliegue: `phoonnx` (Python), `ovos-tts-plugin-phoonnx` (OVOS), `phoonnx.js` (navegador). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos TTS de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Tamaño repo | Contexto |
|---|---|---|---|---|---|---|
| vits-lb_lu-marylux-espeak | VITS | lb-LU | CC-BY-4.0 | ONNX | 0,1 GB | no aplica |
| mbarnig/lb_rhasspy_piper_tts (marylux/medium) | VITS (Piper) | lb-LU | CC-BY-4.0 | Piper/ONNX | no disponible | no aplica |
| Otras voces Piper para lenguas minoritarias | VITS (Piper) | varias | variable | ONNX | variable | no aplica |

La comparativa directa con alternativas comerciales o de mayor tamaño no está disponible en la información proporcionada. El modelo upstream de mbarnig es esencialmente el mismo sistema antes del reempaquetado por Phoonnx.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en luxemburgués; no soporta otros idiomas.
- La calidad de síntesis depende críticamente del front-end de fonemización espeak-ng; si se usa el port `espyak`, algunos fonemas difieren y el modelo puede pronunciar mal ciertas palabras.
- No se han publicado métricas objetivas (MOS, WER, etc.) que permitan evaluar la calidad de la voz.
- Riesgo de alucinación no aplica en el sentido de generación de texto, pero sí existe riesgo de pronunciaciones incorrectas o artefactos acústicos en palabras fuera del dominio de entrenamiento.
- Licencia CC-BY-4.0: permite uso comercial con atribución al autor original (mbarnig) y a Phoonnx; es necesario cumplir los términos de atribución.
- El modelo tiene muy poca tracción (19 descargas, 0 likes) y no se ha actualizado desde noviembre de 2026, lo que limita el soporte de la comunidad.
- No apto para tareas de razonamiento, generación de texto, código o visión; cualquier uso fuera de TTS no está soportado.
- El tamaño `medium` de Piper implica un compromiso entre calidad y velocidad; no se dispone de datos de latencia para confirmar su idoneidad en tiempo real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-lb_lu-marylux-espeak
- Modelo upstream (mbarnig): https://huggingface.co/mbarnig/lb_rhasspy_piper_tts/tree/main/lb/lb_LU/marylux/medium
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
- phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en vivo: https://tigregotico.pt/demo
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
