# Phoonnx/vits-en_us-death_from_puss_and_boots

## Resumen

`vits-en_us-death_from_puss_and_boots` es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, empaquetado por Phoonnx en formato ONNX para su uso con su librería de inferencia TTS. El modelo original fue entrenado por drewThomasson como un fine-tuning de Piper TTS, y esta versión lo redistribuye dentro del ecosistema phoonnx, que permite ejecutarlo en Python y en el asistente de voz OVOS.

El modelo resuelve una tarea muy concreta: convertir texto en inglés estadounidense a audio inteligible con una voz determinada (la voz "death" del fine-tuning de drewThomasson). No es un modelo de propósito general ni un sistema TTS multilingüe: está especializado en una única voz en `en-US` y su entrada no es texto plano sin procesar, sino fonemas en alfabeto IPA generados por espeak-ng (o por el port espyak).

Su relevancia es limitada y de nicho: resulta útil para quien quiera integrar una voz VITS concreta en un pipeline phoonnx u OVOS, o para estudiar el empaquetado de modelos Piper/VITS en ONNX. Con 27 descargas y 0 likes, es un artefacto de distribución más que un modelo de referencia. El tamaño del repositorio es de 0,1 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference with adversarial learning for end-to-end TTS) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto de LLM) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | en-US (inglés estadounidense) |
| Licencia | MIT |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

VITS es una arquitectura de síntesis de voz end-to-end que combina un encoder de texto, un prior variacional, un decoder generativo basado en flujos normalizadores y un discriminador adversarial entrenado de forma conjunta. El resultado es un modelo que genera waveforms directamente a partir de fonemas, sin necesidad de un vocoder separado. En este caso, la entrada son fonemas en alfabeto IPA producidos por espeak-ng.

El modelo es un fine-tuning de Piper TTS realizado por drewThomasson sobre el checkpoint `en_US-death-high_onnx`, y Phoonnx lo ha reempaquetado para su librería. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO (no aplicables habitualmente en TTS). Tampoco se documentan innovaciones técnicas adicionales más allá de las propias de VITS.

## Capacidades

- Síntesis de voz a partir de texto en inglés estadounidense (`en-US`).
- Generación de audio en formato WAV mediante la API `synthesize_wav` de phoonnx.
- Entrada basada en fonemas IPA: requiere espeak-ng (o el port espyak) para la fonemización previa.
- Integración con OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Ejecución en navegador a través de phoonnx.js con entrada espeak o Unicode.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step (no es un LLM).
- No dispone de modo thinking, visión ni audio de entrada.

## Casos de uso

- Asistentes de voz locales con OVOS: el modelo se selecciona en `mycroft.conf` mediante el plugin `ovos-tts-plugin-phoonnx`, lo que permite dotar a un asistente doméstico de una voz concreta sin depender de servicios en la nube.
- Síntesis de voz en scripts Python: mediante `TTSModelManager` y `voice.synthesize_wav`, se puede generar audio a partir de texto en pipelines de automatización, por ejemplo para locuciones de prueba o audiolibros experimentales.
- Prototipado de interfaces de voz: al ser un modelo ONNX ligero (repo de 0,1 GB), sirve para validar rápidamente una integración TTS en una aplicación antes de invertir en un modelo de mayor calidad.
- Generación de audio en el navegador: con phoonnx.js se puede ejecutar la voz del lado del cliente, útil para demos interactivas o aplicaciones web que necesiten TTS sin backend.
- Investigación sobre empaquetado de modelos Piper/VITS: el repositorio documenta el flujo de conversión y despliegue, lo que lo convierte en un ejemplo práctico para quien quiera replicar el proceso con otras voces.
- Pruebas de accesibilidad: integración de una voz TTS en herramientas de lectura de pantalla o aplicaciones de asistencia para usuarios angloparlantes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; por el tamaño del repositorio (0,1 GB) se trata de un modelo ligero que probablemente cabe en GPU consumer de gama baja, pero no se documenta una cifra oficial.
- GPU recomendadas: no disponible. Un modelo VITS de este tamaño suele ejecutarse en CPU sin problema, aunque no se aportan datos de latencia.
- Cabe en GPU consumer: previsiblemente sí, dado el tamaño del artefacto, aunque no se confirma en la documentación.
- Opciones de despliegue: phoonnx (Python), OVOS mediante `ovos-tts-plugin-phoonnx`, y phoonnx.js en navegador. Requiere espeak-ng instalado en el sistema o el extra `phoonnx[espeak]`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| vits-en_us-death_from_puss_and_boots | VITS | en-US | ONNX | MIT | Voz única, empaquetado phoonnx |
| Piper TTS (voces en_US estándar) | VITS | en-US y otros | ONNX | MIT (según voz) | Familia upstream de la que deriva este modelo; mayor catálogo de voces |
| Otras voces VITS de la colección Phoonnx | VITS | varios | ONNX | variable | Mismo runtime phoonnx, distintas voces y calidades |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo de voz única: no permite cambiar de hablante ni de estilo; está atado a la voz "death" del fine-tuning original.
- Dependencia de espeak-ng: sin él, la fonemización con espyak puede producir errores de pronunciación en algunas palabras, según advierte la propia model card.
- Solo inglés estadounidense: no soporta otros idiomas ni acentos.
- Sin datos de benchmarks ni de calidad perceptual (MOS): no es posible evaluar objetivamente su naturalidad frente a otras voces.
- Riesgo de artefactos y alucinaciones acústicas: como todo modelo TTS, puede generar pronunciaciones incorrectas o ruido ante entradas fuera de distribución.
- Licencia MIT: permite uso comercial, pero conviene verificar la licencia del checkpoint upstream de drewThomasson, ya que la model card remite a ella.
- Repositorio con muy poca tracción (27 descargas, 0 likes): no hay validación comunitaria ni mantenimiento demostrado.
- No apto para tareas de NLP: no es un LLM y no debe emplearse para generación de texto, razonamiento ni código.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-en_us-death_from_puss_and_boots
- Upstream (Piper TTS fine-tune): https://huggingface.co/drewThomasson/piper_tts_finetune_death_from_puss_and_boots/tree/main/en_US-death-high_onnx
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- scriptconv (normalización y fonemizadores): https://github.com/TigreGotico/scriptconv
- phoonnx.js (runtime en navegador): https://github.com/TigreGotico/phoonnx.js
- Demo en vivo: https://tigregotico.pt/demo
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
