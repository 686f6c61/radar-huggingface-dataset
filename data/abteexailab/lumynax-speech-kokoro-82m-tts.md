# AbteeXAILab/lumynax-speech-kokoro-82m-tts

## Resumen

LumynaX Speech Kokoro 82M TTS es un paquete de integración publicado por AbteeX AI Labs, un laboratorio con sede en Aotearoa (Nueva Zelanda), que envuelve el modelo de síntesis de voz Kokoro-82M de hexgrad dentro de su arquitectura LumynaX Core. Se trata de un lanzamiento experimental marcado explícitamente como "legacy" y "outdated" por sus propios autores, conservado únicamente con fines de reproducibilidad e investigación. El paquete no modifica los pesos del modelo original; aplica una "infusión enrutada" en la que LumynaX Core orquesta la inferencia sin fusionar pesos.

El modelo subyacente, Kokoro-82M, es un sintetizador de voz de 82 millones de parámetros, pero la ficha de HuggingFace lo etiqueta con el pipeline `text-generation` y la librería `transformers`, lo que refleja la naturaleza de envoltorio del paquete. Los idiomas declarados son inglés (en) y maorí (mi), y la licencia es Apache-2.0. Dado su estado de abandono declarado, no se recomienda su uso en producción, y cualquier evaluación debe verificar los checksums y manifiestos incluidos en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: Kokoro-82M, sin detalles de arquitectura en la informacion) |
| Parametros totales | 82 millones (modelo base Kokoro-82M) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles), mi (maori) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (presumible, segun repo de 0.4 GB; no confirmado en la model card) |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo Kokoro-82M ni los detalles de su entrenamiento. El paquete LumynaX Speech Kokoro 82M TTS es un envoltorio de integracion: segun la model card, LumynaX Core actua como capa de orquestacion que enruta la inferencia hacia el modelo infundido (Kokoro-82M) sin modificar sus pesos. El metodo de infusion es "routed runtime and identity integration", lo que implica que no hay composicion de pesos ni mezcla de expertos. El runtime declarado es Transformers. No se proporcionan datos sobre el dataset de entrenamiento, el numero de tokens, ni si se aplicaron tecnicas como RLHF o DPO.

## Capacidades

- Sintesis de voz (text-to-speech) basada en el modelo Kokoro-82M, con soporte declarado para ingles y maori.
- Integracion con LumynaX Core como capa de orquestacion, lo que permite aplicar controles de soberania, contexto y planificacion agente alrededor de la ejecucion del modelo.
- Capacidad de "infusion enrutada": el modelo puede ser invocado como un modulo especializado dentro de un flujo controlado por LumynaX Core.
- No se documentan capacidades adicionales como tool calling, vision, audio multimodal o modo de razonamiento explicito.

## Casos de uso

- Reproduccion de experimentos de investigacion: el paquete esta pensado como artefacto de procedencia para reproducir el lanzamiento original, verificando checksums y manifiestos antes de cualquier uso.
- Evaluacion comparativa de modelos TTS locales: puede servir como referencia para comparar la calidad de sintesis de Kokoro-82M en ingles y maori frente a otros modelos, siempre que se respete su estado legacy.
- Prototipado de integraciones con LumynaX Core: desarrolladores que trabajen con el ecosistema LumynaX pueden estudiar como se estructura una infusion enrutada y como se orquesta la inferencia.
- Sintesis de voz en maori: dado el soporte declarado para el idioma mi, podria emplearse en aplicaciones de preservacion linguistica o generacion de contenido en maori, aunque con cautela por su estado no mantenido.
- Educacion y formacion en sistemas TTS: util como ejemplo de empaquetado de un modelo open source dentro de una arquitectura de orquestacion, para fines docentes.
- Auditoria de seguridad y procedencia: el repositorio incluye checksums y manifiestos, lo que permite auditar la integridad de los artefactos antes de cualquier despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de calidad de voz (MOS, WER, etc.) ni comparaciones con otros sistemas TTS.

## Requisitos de hardware

- VRAM estimada: no disponible. Dado que el modelo base tiene 82 millones de parametros, es probable que quepa en GPUs de consumo (por ejemplo, 4-6 GB de VRAM), pero no hay datos confirmados.
- GPU recomendadas: no disponible. Se puede inferir que una GPU moderna de consumo (RTX 3060 o superior) seria suficiente, pero no esta documentado.
- Compatibilidad con GPU de consumo: probable, dado el tamano reducido del modelo, pero no confirmado.
- Opciones de despliegue: el runtime declarado es Transformers; no se mencionan vLLM, llama.cpp, Ollama ni TGI. El repositorio GitHub incluye un Modelfile, lo que sugiere compatibilidad con Ollama, aunque no se detalla.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa rigurosa. El modelo base Kokoro-82M es un TTS de codigo abierto conocido, pero la informacion proporcionada no incluye metricas de rendimiento ni comparaciones con alternativas como Piper, Coqui TTS o XTTS. Se puede indicar que el paquete LumynaX es un envoltorio de Kokoro-82M, por lo que su rendimiento dependera del modelo base, pero no hay datos verificables en la documentacion.

## Limitaciones y advertencias

- El paquete esta marcado como "legacy" y "outdated" por sus propios autores; no se recomienda su uso en produccion.
- No se proporcionan detalles sobre sesgos, alucinaciones o limitaciones de contexto del modelo subyacente.
- La licencia Apache-2.0 permite uso comercial, pero el estado de abandono implica que no hay soporte ni actualizaciones de seguridad.
- La informacion tecnica es muy limitada: no se especifican arquitectura, datos de entrenamiento, ni requisitos de hardware.
- El pipeline declarado es `text-generation`, lo que puede resultar confuso para un modelo TTS; se recomienda verificar la documentacion original de Kokoro-82M.
- El soporte de idiomas se limita a ingles y maori; no se garantiza calidad en otros idiomas.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/AbteeXAILab/lumynax-speech-kokoro-82m-tts)
- [Repositorio GitHub](https://github.com/Aimaghsoodi/lumynax-speech-kokoro-82m-tts)
- [Modelo base Kokoro-82M](https://huggingface.co/hexgrad/Kokoro-82M)
- [AbteeX AI Labs](https://abteex.com)
- [LumynaX](https://lumynax.com)
