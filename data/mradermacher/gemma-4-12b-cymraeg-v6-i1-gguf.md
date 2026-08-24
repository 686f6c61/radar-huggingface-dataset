# mradermacher/gemma-4-12b-cymraeg-v6-i1-GGUF

## Resumen

Este repositorio contiene las cuantizaciones GGUF con imatrix del modelo EryriLabs/gemma-4-12b-cymraeg-v6, un modelo de 12 000 millones de parametros de la familia Gemma 4 de Google, ajustado mediante continuacion del pretraining y LoRA para el idioma galés (cymraeg). El autor de las cuantizaciones es mradermacher, que publica tanto quants estaticos como versiones con imatrix para mejorar la calidad de la cuantizacion.

El modelo base es un Gemma 4 12B, una arquitectura densa de la nueva generacion de Google DeepMind que soporta multimodalidad (vision) y hasta 256K tokens de contexto. La version cuantizada en GGUF permite ejecutar este modelo en hardware de consumo, lo que resulta relevante para la comunidad de procesamiento del lenguaje natural en galés, un idioma con pocos recursos donde los modelos de alta calidad son escasos.

La licencia Apache 2.0 permite uso comercial sin restricciones significativas, y al estar en formato GGUF es compatible con llama.cpp, Ollama y otros motores de inferencia locales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Gemma 4 12B) |
| Parametros totales | 11 907 350 576 (11,9B) |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | no disponible (el modelo base Gemma 4 soporta hasta 256K tokens) |
| Tipos de cuantizacion | i1-Q2_K (4,9 GB), i1-IQ3_M (5,8 GB), archivo imatrix de 0,1 GB |
| Idiomas soportados | cy (galés), en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizacion de mradermacher) |

## Arquitectura y entrenamiento

El modelo base es un Gemma 4 12B, un transformer denso de la familia Gemma 4 de Google DeepMind. Segun el informe tecnico de Gemma 4, la familia incluye arquitecturas densas y MoE que van de 2,3B a 31B parametros, con encoders de vision y audio mejorados y un diseno unificado sin encoder para el procesamiento multimodal. El modelo de 12B es una de las variantes densas de la familia.

El ajuste realizado por EryriLabs consiste en continuacion del pretraining y LoRA especificamente para el idioma galés, partiendo del modelo Gemma 4 12B. Los detalles exactos del dataset de entrenamiento, el numero de tokens y el metodo de alineacion (RLHF, DPO, etc.) no estan disponibles en la informacion proporcionada. El repositorio de mradermacher aplica cuantizacion GGUF con imatrix, una tecnica que mejora la calidad de los quants de baja precision al usar una matriz de importancia calculada sobre datos representativos.

## Capacidades

- Generacion de texto en galés e ingles, con especial atencion al galés gracias al ajuste especifico.
- Capacidades de razonamiento y generacion de codigo heredadas del modelo base Gemma 4 12B.
- Soporte multimodal de vision en el modelo base (los archivos mmproj estan disponibles en el repositorio de quants estaticos).
- Conversacion multi-turno, segun las etiquetas del modelo.
- Compatible con endpoints de text-generation-inference y motores que soporten GGUF.
- Cuantizaciones con imatrix para mejor calidad en precisiones bajas.

## Casos de uso

- Traduccion automatica gales-ingles: el modelo puede traducir entre ambos idiomas con mayor precision que un modelo generico, gracias al ajuste especifico en galés.
- Transcripcion y normalizacion de textos historicos en galés: instituciones culturales y bibliotecas pueden usar el modelo para digitalizar y procesar documentos en galés.
- Asistente conversacional en galés: desarrollo de chatbots y asistentes virtuales para servicios publicos en Gales, donde el galés es cooficial.
- Educacion y aprendizaje del galés: generacion de ejercicios, correccion de textos y practica conversacional para estudiantes del idioma.
- Generacion de contenido localizado: redaccion de articulos, noticias y material de marketing en galés para empresas y medios locales.
- Investigacion en PLN para idiomas de bajos recursos: el modelo sirve como punto de partida para experimentos de adaptacion linguistica y evaluacion de tecnicas de cuantizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones comparativas del modelo cuantizado frente al original o frente a otras alternativas.

## Requisitos de hardware

- VRAM estimada para inferencia: los quants disponibles ocupan entre 4,9 GB y 5,8 GB, por lo que caben en GPUs de consumo con 8 GB de VRAM o mas.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, o cualquier GPU con al menos 8 GB de VRAM para el quant Q2_K.
- El quant i1-IQ3_M (5,8 GB) es recomendable para GPUs con 8-12 GB de VRAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier motor compatible con GGUF.
- Para uso en CPU, se puede ejecutar con suficiente RAM (8-16 GB) aunque con mayor latencia.
- La latencia y el throughput dependen del hardware; no se proporcionan datos especificos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| gemma-4-12b-cymraeg-v6 (este) | 11,9B | no disponible | cy, en | Apache 2.0 | GGUF |
| gemma-4-e4b-cymraeg-v4 | 4B (estimado) | no disponible | cy, en | Apache 2.0 | GGUF |
| Gemma 4 12B (base) | 12B | hasta 256K | 140+ | Apache 2.0 | safetensors |

La alternativa mas cercana es la version de 4B del mismo ajuste en galés (gemma-4-e4b-cymraeg-v4), que ofrece menor requisito de hardware a costa de capacidad. El modelo base Gemma 4 12B no esta especializado en galés, por lo que su rendimiento en este idioma sera inferior.

## Limitaciones y advertencias

- El modelo esta especializado en galés e ingles; su rendimiento en otros idiomas no esta garantizado.
- Al ser un modelo de 12B cuantizado a Q2_K o IQ3_M, la calidad de generacion puede degradarse notablemente frente al modelo en precision completa.
- No se dispone de informacion sobre sesgos especificos del ajuste en galés, aunque el modelo base puede heredar sesgos de Gemma 4.
- Riesgo de alucinacion en hechos y datos, especialmente en contextos largos o temas especializados.
- La longitud de contexto efectiva tras la cuantizacion no esta documentada.
- El modelo es multimodal en su version base, pero los archivos mmproj deben descargarse del repositorio de quants estaticos; no estan incluidos en este repositorio.
- Para uso en produccion, se recomienda validar el rendimiento con datos propios antes de desplegar.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/gemma-4-12b-cymraeg-v6-i1-GGUF
- Repositorio de quants estaticos: https://huggingface.co/mradermacher/gemma-4-12b-cymraeg-v6-GGUF
- Modelo base: https://huggingface.co/EryriLabs/gemma-4-12b-cymraeg-v6
- Version 4B del ajuste en galés: https://huggingface.co/mradermacher/gemma-4-e4b-cymraeg-v4-GGUF
- Pagina de Gemma 4 de Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Informe tecnico de Gemma 4: https://arxiv.org/pdf/2607.02770
- Model card de Gemma 4: https://ai.google.dev/gemma/docs/core/model_card_4
