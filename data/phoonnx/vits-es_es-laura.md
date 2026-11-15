# Phoonnx/vits-es_es-laura

## Resumen

`Phoonnx/vits-es_es-laura` es un modelo de síntesis de voz (text-to-speech) en formato ONNX que empaqueta el modelo original `HiTZ/TTS-es_laura` del centro HiTZ (Universidad del País Vasco) para su uso con la librería phoonnx. Se trata de una voz femenina en castellano de España (`es-ES`) basada en la arquitectura VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), un modelo generativo end-to-end que convierte fonemas en forma de onda de audio de manera directa, sin necesidad de un vocoder separado.

El modelo no aporta innovaciones arquitectónicas propias: es un reempaquetado del checkpoint original de HiTZ en formato ONNX, lo que permite su ejecución en entornos Python y en el asistente de voz OVOS (Open Voice OS) mediante el plugin `ovos-tts-plugin-phoonnx`. Su relevancia radica en que facilita el despliegue de una voz en castellano de alta calidad en pipelines de TTS ligeros, con licencia Apache 2.0 y un tamaño de repositorio de apenas 0,1 GB, lo que lo hace apto para ejecución en CPU.

El modelo está pensado para desarrolladores que necesitan integrar TTS en castellano en aplicaciones de asistente, lectura de texto o accesibilidad sin depender de servicios en la nube. El input textual se procesa mediante el fonemizador `AhoTTSPhonemizer` de la librería `scriptconv`, que convierte el texto normalizado a fonemas IPA antes de la síntesis.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (end-to-end text-to-speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica a TTS) |
| Tipos de cuantizacion | no disponible (pesos en ONNX) |
| Idiomas soportados | es (es-ES) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

VITS es una arquitectura end-to-end para síntesis de voz que combina un encoder de texto, un prior variacional, un decoder generativo basado en flujos normalizadores y un discriminador adversarial entrenado con pérdidas de dominio temporal y espectral. El modelo genera la forma de onda directamente a partir de la secuencia de fonemas, lo que elimina la necesidad de un vocoder externo y reduce la latencia del pipeline. La entrada textual se representa como fonemas en alfabeto IPA, producidos por el fonemizador `AhoTTSPhonemizer` de `scriptconv`.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o fine-tuning adicionales. El modelo original fue desarrollado por HiTZ Center y publicado en `HiTZ/TTS-es_laura`; este repositorio es un reempaquetado en ONNX para phoonnx, sin cambios en los pesos ni en el entrenamiento. No se documentan innovaciones técnicas adicionales más allá de las propias de VITS.

## Capacidades

- Síntesis de voz end-to-end en castellano de España (`es-ES`) a partir de texto plano.
- Generación de audio en formato WAV mediante la API `synthesize_wav` de phoonnx.
- Conversión de texto a fonemas IPA mediante el fonemizador `AhoTTSPhonemizer` de `scriptconv`.
- Integración con el asistente de voz OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Ejecución en CPU gracias al formato ONNX y al reducido tamaño del repositorio (0,1 GB).
- Voz femenina identificada como "laura" en el nombre del modelo.
- No soporta tool calling, function calling, agentes, visión, audio de entrada ni modo de razonamiento (es un modelo exclusivamente TTS).
- Capacidad multilingüe limitada al castellano; no se documentan otros idiomas.

## Casos de uso

- Asistentes de voz locales: el modelo se integra en OVOS mediante `ovos-tts-plugin-phoonnx`, permitiendo respuestas habladas en castellano sin conexión a la nube, con una huella de 0,1 GB que cabe en dispositivos de bajos recursos.
- Lectura de textos y accesibilidad: conversión de artículos, documentos o notificaciones a audio en castellano para aplicaciones de lectura por voz o para personas con discapacidad visual, usando la API `synthesize_wav` para generar ficheros WAV.
- Automatización de locuciones: generación de avisos, mensajes de sistema o contenido de audio para aplicaciones de domótica y sistemas embebidos que requieran TTS en castellano con licencia permisiva.
- Prototipado de pipelines TTS: al ser un modelo ONNX ligero y con licencia Apache 2.0, sirve como base para experimentar con fonemización IPA y síntesis end-to-end en proyectos de investigación o pruebas de concepto.
- Integración en aplicaciones Python: mediante `phoonnx.model_manager.TTSModelManager` se puede cargar la voz `hitz/es_laura-vits` y sintetizar frases en castellano dentro de scripts o servicios web.
- Educación y aprendizaje de idiomas: generación de audio en castellano de España para ejercicios de pronunciación o materiales didácticos, aprovechando la fonemización IPA del front-end.
- Sistemas de respuesta interactiva de voz (IVR): locuciones dinámicas en castellano para centralitas telefónicas o chatbots de voz, siempre que se acepte la calidad y latencia de un modelo VITS en CPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser un modelo ONNX de 0,1 GB, es probable que funcione en CPU sin GPU dedicada, aunque no se documentan cifras oficiales.
- GPU recomendadas: no disponible; no se especifican requisitos de GPU.
- Compatibilidad con GPU de consumo: no disponible; el formato ONNX permite ejecución en CPU, pero no se confirma soporte GPU específico.
- Opciones de despliegue: phoonnx (Python), OVOS mediante `ovos-tts-plugin-phoonnx`, y cualquier runtime compatible con ONNX.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|---|---|
| Phoonnx/vits-es_es-laura | VITS | es-ES | no disponible | no aplica | Apache 2.0 | ONNX |
| HiTZ/TTS-es_laura | VITS | es-ES | no disponible | no aplica | Apache 2.0 | no disponible |
| Otros modelos VITS de la colección Phoonnx | VITS | varios | no disponible | no aplica | variable | ONNX |

La comparativa se limita al modelo upstream y a otros miembros de la colección VITS de Phoonnx, ya que no se dispone de datos de benchmarks ni de parámetros para comparar con alternativas como XTTS, Bark o Piper. No se dispone de información sobre rendimiento comparado.

## Limitaciones y advertencias

- El modelo solo soporta castellano de España (`es-ES`); no se documentan otros idiomas ni variantes dialectales.
- No se dispone de información sobre sesgos de género, acento o prosodia; la voz es femenina ("laura") y podría no representar diversidad de hablantes.
- Riesgo de alucinación en TTS: posible generación de prosodia incorrecta o artefactos en textos fuera de dominio, aunque no se documenta explícitamente.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la licencia del modelo upstream `HiTZ/TTS-es_laura` y los términos de los datos de entrenamiento originales.
- El modelo depende del fonemizador `AhoTTSPhonemizer` de `scriptconv`; errores en la normalización o fonemización del texto pueden degradar la calidad del audio.
- No se documentan limitaciones de longitud de texto; textos muy largos podrían requerir segmentación manual.
- El repositorio tiene pocas descargas (29) y ningún "like", lo que sugiere poca validación comunitaria; se recomienda probar en el caso de uso concreto antes de producción.
- No se dispone de información sobre latencia, throughput ni calidad subjetiva (MOS) del modelo.

## Enlaces

- [Hugging Face: Phoonnx/vits-es_es-laura](https://huggingface.co/Phoonnx/vits-es_es-laura)
- [Modelo upstream: HiTZ/TTS-es_laura](https://huggingface.co/HiTZ/TTS-es_laura)
- [Repositorio phoonnx](https://github.com/TigreGotico/phoonnx)
- [Repositorio scriptconv](https://github.com/TigreGotico/scriptconv)
- [Colección VITS de Phoonnx](https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65)
