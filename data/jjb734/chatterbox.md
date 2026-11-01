# jjb734/chatterbox

## Resumen

Chatterbox es una familia de modelos de síntesis de voz (text-to-speech) de código abierto desarrollada por Resemble AI. La versión publicada en este repositorio, Chatterbox Multilingual V3, es un modelo de 0,5 mil millones de parámetros construido sobre un backbone Llama que soporta clonación de voz zero-shot en 23 idiomas, incluyendo el castellano. Resuelve el problema de generar habla natural y expresiva con una identidad de voz consistente a partir de unos pocos segundos de audio de referencia, sin necesidad de entrenamiento adicional.

La relevancia actual del modelo radica en su licencia MIT, que permite uso comercial sin restricciones, y en su rendimiento competitivo frente a sistemas propietarios como ElevenLabs en evaluaciones ciegas por pares. Frente a versiones anteriores, V3 mejora la similitud del hablante, reduce las alucinaciones (continuaciones no solicitadas, repeticiones y habla fuera de prompt) y produce un habla más conversacional.

El modelo se distribuye con pesos en formato safetensors, un repositorio de 13,9 GB que incluye los checkpoints multilingües y los finetunes por idioma del Single Language Pack, además de utilidades para conversión de voz y marcado de agua en las salidas generadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con backbone Llama (0.5B) para TTS; inferencia guiada por alineamiento |
| Parametros totales | 500M (0.5B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | 23: arabe, danes, aleman, griego, ingles, espanol, finlandes, frances, hebreo, hindi, italiano, japones, coreano, malayo, neerlandes, noruego, polaco, portugues, ruso, sueco, suajili, turco y chino |
| Licencia | MIT |
| Formato de pesos | Safetensors (repositorio de 13.9 GB) |

## Arquitectura y entrenamiento

Chatterbox emplea un backbone transformer de tipo Llama con 500 millones de parámetros adaptado a la generación de habla. La inferencia está guiada por alineamiento (alignment-informed inference), una técnica que aporta estabilidad y reduce derivas en la generación. El modelo incorpora dos controles de generación expuestos al usuario: `exaggeration`, que regula la intensidad emocional de la voz, y `cfg` (classifier-free guidance), que ajusta la fidelidad al texto y al hablante de referencia. Esta combinación permite desde habla neutra hasta interpretaciones dramáticas sin reentrenar.

El entrenamiento se realizó sobre aproximadamente 500 000 horas de datos de audio depurados. La model card no detalla la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO. La familia incluye, además del modelo multilingüe general, finetunes dedicados para chino, español latinoamericano, portugués brasileño, español de España, portugués de Portugal e hindi, orientados a un control de calidad específico por idioma y dialecto. Todas las salidas generadas incorporan una marca de agua (watermark) para su trazabilidad.

## Capacidades

- Síntesis de voz multilingüe en 23 idiomas con una única voz clonada.
- Clonación de voz zero-shot a partir de audio de referencia, preservando identidad y acento entre idiomas.
- Control de exageración emocional (`exaggeration`), primera funcionalidad de este tipo en un TTS open source según el autor.
- Ajuste de la guía classifier-free (`cfg`) para modular ritmo, fidelidad y expresividad.
- Generación de habla conversacional con estabilidad mejorada y menor tasa de alucinaciones en V3.
- Conversión de voz mediante script incluido en el repositorio.
- Salidas con marca de agua integrada.
- No se documentan capacidades de tool calling, agentes ni procesamiento de audio de entrada más allá de la referencia de voz.

## Casos de uso

- Localización de contenidos audiovisuales: un mismo locutor virtual puede doblar vídeos, cursos o pódcasts a los 23 idiomas soportados manteniendo la identidad de voz original, lo que simplifica flujos de traducción y doblaje.
- Asistentes de voz para agentes conversacionales: el modelo genera respuestas habladas con latencia adecuada para integración en pipelines de agentes, y el control de `cfg` permite ajustar el ritmo a estilos de habla rápidos.
- Audiolibros y narración: la clonación de voz permite narrar con la voz del autor o de un locutor de referencia, y el parámetro `exaggeration` aporta matices dramáticos en pasajes de ficción.
- Accesibilidad: generación de voz personalizada para usuarios con discapacidad del habla a partir de muestras de su propia voz, con licencia MIT que facilita su despliegue en productos comerciales.
- Videojuegos y contenido interactivo: voces de personajes generadas en tiempo de ejecución con control de emoción, sin depender de grabaciones previas ni de servicios propietarios.
- Producción de contenido para redes y publicidad: iteración rápida de variantes de locución con distintos niveles de intensidad emocional y distintos idiomas desde un mismo guion.
- Investigación en TTS: al ser un modelo de 0,5B con licencia permisiva, sirve como base para experimentos de clonación, evaluación de sesgos acústicos o fine-tuning sobre dominios específicos.

## Benchmarks y rendimiento

La model card indica que el modelo ha sido comparado con sistemas propietarios como ElevenLabs y que resulta preferido de forma consistente en evaluaciones ciegas por pares, con un informe alojado en Podonos. No se publican cifras numéricas de benchmarks estándar (MOS, WER, similitud de hablante) en la información disponible.

| Benchmark | Resultado |
|---|---|
| Evaluación por pares frente a ElevenLabs | Preferido de forma consistente (sin cifras publicadas) |
| MOS / WER / similitud de hablante | No disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 500M parámetros, el peso en precisión completa ronda 1 GB, por lo que en fp16 cabría en GPUs de consumo con holgura, aunque esta estimación no está confirmada por el autor.
- GPU recomendadas: no especificadas. Por tamaño, una RTX 4090 o superior debería ser suficiente para inferencia en fp16; para despliegues de alta concurrencia se recomendarían A100 o H100.
- GPU de consumo: previsiblemente compatible con RTX 3090, RTX 4090 y tarjetas con 8 GB o más, si bien el dato no está confirmado.
- Opciones de despliegue: la librería oficial es `chatterbox`; existe una demo en Hugging Face Spaces. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: el autor menciona un servicio propietario con latencia inferior a 200 ms, pero no se aportan cifras para la inferencia local del modelo open source.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | Clonacion zero-shot | Notas |
|---|---|---|---|---|---|
| Chatterbox Multilingual V3 | 500M | 23 | MIT | Si | Control de exageracion y cfg; salidas con watermark |
| Chatterbox (original) | 500M | Ingles | MIT | Si | Solo ingles; controles de exageracion y cfg |
| Single Language Pack | 500M por finetune | 6 finetunes | MIT | Si | Especializacion por idioma y dialecto |
| ElevenLabs | No disponible | Multiples | Propietaria | Si | Referencia comercial; inferior en preferencia por pares segun el autor |

No se dispone de datos de benchmarks cuantitativos que permitan una comparación numérica con alternativas open source como XTTS, Bark o Fish Speech.

## Limitaciones y advertencias

- Riesgo de alucinación: aunque V3 reduce continuaciones no solicitadas, repeticiones y habla fuera de prompt, el fenómeno no se elimina por completo, especialmente en textos largos o idiomas con menos datos.
- Sesgos: no se documentan análisis de sesgos acústicos ni de representación de acentos y géneros; el rendimiento puede variar según la calidad y el acento del audio de referencia.
- Idiomas de bajos recursos: el soporte de 23 idiomas no implica calidad homogénea; el propio autor recomienda finetunes dedicados para ciertos idiomas y dialectos.
- Uso dual: la clonación de voz puede emplearse para suplantación de identidad o desinformación; las salidas incorporan watermark, pero su verificación depende de herramientas externas.
- Licencia: MIT permite uso comercial sin restricciones, pero conviene revisar las condiciones de los datos de entrenamiento y de las voces de referencia utilizadas.
- Producción: no se publican cifras de latencia, throughput ni VRAM para inferencia local, por lo que el dimensionamiento debe validarse empíricamente antes de desplegar.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/jjb734/chatterbox)
- [Sitio de Resemble AI](https://resemble.ai)
- [Demo de muestras de audio](https://resemble-ai.github.io/chatterbox_demopage/)
- [Space de Chatterbox](https://huggingface.co/spaces/ResembleAI/Chatterbox)
- [Space de Chatterbox Multilingual TTS V3](https://huggingface.co/spaces/ResembleAI/Chatterbox-Multilingual-TTS-V3)
- [Informe de evaluación en Podonos](https://podonos.com/resembleai/chatterbox)
