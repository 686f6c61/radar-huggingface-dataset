# ReadyArt/Heimdallr-27B-v0.4-GGUF

## Resumen

Heimdallr-27B-v0.4 es un modelo de lenguaje de 27 320 millones de parámetros publicado por ReadyArt, un desarrollador que publica modelos orientados a roleplay y conversación. Esta versión es la cuantización GGUF del modelo base ReadyArt/Heimdallr-27B-v0.4, lo que permite su ejecución en hardware de consumo mediante motores de inferencia como llama.cpp, Ollama o vLLM. El modelo está diseñado para un uso conversacional desalineado, con etiquetas explícitas de contenido adulto (NSFW) y dark fantasy, por lo que no incluye filtros de seguridad para esos dominios.

La licencia es Apache-2.0, lo que permite uso comercial y modificación sin restricciones adicionales. El repositorio contiene múltiples cuantizaciones GGUF, con un tamaño total de 304,9 GB, aunque el modelo base tiene un tamaño de aproximadamente 27 GB en fp16. No se ha publicado información detallada sobre arquitectura, contexto o entrenamiento, por lo que esta ficha se basa únicamente en los datos disponibles en la página de HuggingFace y en las etiquetas del modelo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 27.320.697.856 (27,3 B) |
| Parametros activos | no disponible (no se especifica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (varias cuantizaciones, no listadas explícitamente) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo (si es transformer denso, MoE, etc.) ni sobre el proceso de entrenamiento. Los datos de HuggingFace solo indican el número de parámetros y la licencia. Las etiquetas sugieren que se trata de un modelo de tipo instruct/conversacional, probablemente afinado sobre una base de 27B, pero no se proporciona el dataset ni el método de alineación (RLHF, DPO, etc.). Por tanto, no se puede confirmar ninguna innovación técnica.

## Capacidades

- Generación de texto conversacional y roleplay, con énfasis en diálogos multi-turno y desarrollo de personajes.
- Soporte de instrucciones (instruct), lo que permite comandos de sistema y prompts estructurados.
- Capacidad de contenido adulto y explícito (NSFW), incluyendo roleplay erótico y escenarios de dark fantasy.
- Desalineado (unaligned), es decir, sin filtros de seguridad para contenido maduro o sensible.
- No se ha confirmado soporte para tool calling, agentes, visión o audio.
- Multilingüismo no confirmado; probablemente entrenado principalmente en inglés, pero no hay datos.

## Casos de uso

- Roleplay narrativo: escritura de historias interactivas con personajes persistentes y diálogos largos, gracias a su orientación conversacional.
- Simulación de personajes para juegos de texto o chatbots de temática fantástica o oscura.
- Generación de contenido creativo para adultos, como novelas o relatos eróticos, sin restricciones de contenido.
- Asistente conversacional personalizado para usuarios que buscan una IA sin filtros de seguridad.
- Experimentación con modelos desalineados para investigación en seguridad y alineación (uso académico).
- Creación de chatbots para plataformas de entretenimiento para adultos, siempre que se cumplan las políticas de la plataforma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos de MMLU, HumanEval, GSM8K u otros.

## Requisitos de hardware

- Para una cuantización de 4 bits (Q4_K_M, típica), la VRAM necesaria es aproximadamente 14-16 GB, lo que permite ejecutarse en GPUs como RTX 3090, RTX 4090, o A10 con 24 GB.
- Para cuantización de 8 bits, se necesitan unos 28-30 GB de VRAM, requiriendo GPUs como A100 40 GB o dos GPUs de 16 GB.
- El modelo completo en fp16 ocupa ~54 GB, fuera de la mayoría de GPUs de consumo.
- Se puede desplegar con llama.cpp, Ollama, vLLM (si se convierte a otro formato) o TGI, siempre que se respete el formato GGUF.
- La latencia y throughput dependen del hardware; en una RTX 4090 con Q4, se espera una generación de ~30-40 tokens/s para modelos de este tamaño, pero no hay datos oficiales.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de la misma categoría (roleplay desalineado de ~27B) en las fuentes proporcionadas. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo está explícitamente desalineado y puede generar contenido sexual explícito, violento o perturbador sin filtros.
- No se ha documentado la calidad de la alineación ni los sesgos; al ser un modelo de roleplay, puede reproducir estereotipos o comportamientos problemáticos.
- Riesgo de alucinación: al no conocerse el entrenamiento, no se puede evaluar su fiabilidad en hechos.
- La longitud de contexto no se ha especificado, por lo que no se puede garantizar el rendimiento en diálogos muy largos.
- El idioma principal no está confirmado; puede funcionar mal en español u otros idiomas distintos del inglés.
- La licencia Apache-2.0 permite uso comercial, pero el contenido generado puede ser problemático según el contexto legal de cada país.
- Al ser una versión GGUF, el rendimiento depende del software de inferencia; no se ha validado con motores específicos.

## Enlaces

- [Modelo GGUF en HuggingFace](https://huggingface.co/ReadyArt/Heimdallr-27B-v0.4-GGUF)
- [Modelo base (safetensors)](https://huggingface.co/ReadyArt/Heimdallr-27B-v0.4)
- [Versión v0.35 GGUF](https://huggingface.co/ReadyArt/Heimdallr-27B-v0.35-GGUF) (referencia de iteraciones anteriores)
- [Versión v0.35 base](https://huggingface.co/ReadyArt/Heimdallr-27B-v0.35) (referencia de iteraciones anteriores)
