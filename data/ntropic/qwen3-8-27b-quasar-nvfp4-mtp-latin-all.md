# Ntropic/Qwen3.8-27B-QUASAR-NVFP4-MTP-latin-all

## Resumen

Qwen3.8-27B-QUASAR-NVFP4-MTP-latin-all es una variante del checkpoint Qwen3.8-27B-QUASAR-NVFP4 de QUASAR-QAT, que a su vez deriva del modelo Qwen3.8-27B del equipo Qwen de Alibaba Cloud. La modificacion consiste en una poda de vocabulario realizada con la herramienta VocabPruner de Ntropic: el tokenizer pasa de 248.077 a 143.499 tokens (−42,16%), con remapeo de IDs y eliminacion de las filas correspondientes en los tensores de embedding y de salida, sin reentrenamiento posterior.

El modelo conserva la arquitectura original Qwen3.8 (transformer denso, tag `qwen3_5` en Hugging Face) y los pesos en formato NVFP4 (4 bits de punto flotante con escalas, empaquetados con `compressed-tensors`), por lo que el repositorio ocupa 18,4 GB y los parametros reales ascienden a 26.708.060.912. La poda esta orientada a un subconjunto de scripts latinos, comunes y heredados, manteniendo intactos los tokens de byte y las dependencias BPE necesarias para la codificacion.

Su interes practico es doble: reduce el checkpoint en 2,15 GB (−10,44%) y libera memoria de GPU en el cache KV, hasta el punto de que el autor reporta 12,63 GiB de cache KV con una capacidad estimada de unos 91.200 tokens adicionales en una RTX 5090 de 32 GiB, con contexto configurado de 262.144 tokens. Es un modelo pensado para despliegue en hardware consumer de gama alta, no para entrenamiento ni para uso como referencia canonica de Qwen3.8.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (tag `qwen3_5` en Hugging Face) |
| Parametros totales | 26.708.060.912 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | 262.144 tokens (configurado por el autor) |
| Tipos de cuantizacion | NVFP4 (4 bits float con escalas), empaquetado con `compressed-tensors`; tag `8-bit` en Hugging Face |
| Idiomas soportados | no disponible; la poda de vocabulario se limita a scripts latinos, comunes y heredados, pero no se declara una lista de idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con `compressed-tensors`) |

## Arquitectura y entrenamiento

La arquitectura es la del Qwen3.8-27B original: un transformer denso de aproximadamente 27.000 millones de parametros. Sobre esa base, QUASAR-QAT aplico entrenamiento con cuantizacion (QAT) para producir un checkpoint NVFP4, es decir, pesos de 4 bits en punto flotante con escalas por bloque, almacenados mediante el formato `compressed-tensors`. El autor de esta variante no aporta informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO; esos datos corresponden al modelo Qwen original y no se detallan en la model card.

La innovacion de esta ficha es la poda de vocabulario con VocabPruner: se eliminan 104.578 tokens del tokenizer (de 248.077 a 143.499) y se recortan las filas correspondientes de los tensores de embedding y de la cabeza de salida, remapeando los IDs restantes. El proceso preserva los tokens de byte y las dependencias BPE, de modo que los scripts eliminados siguen siendo representables mediante codificacion por bytes, aunque con mayor coste en tokens. No hay reentrenamiento ni ajuste fino tras la poda, por lo que el comportamiento generativo puede cambiar respecto al checkpoint de origen. El sufijo `MTP` del nombre sugiere soporte de multi-token prediction, pero la model card no lo documenta y no se puede confirmar.

## Capacidades

- Generacion de texto y razonamiento de proposito general, heredados del Qwen3.8-27B base.
- Generacion de codigo y matematicas, segun las capacidades del modelo original (no verificadas en esta variante).
- Contexto largo: 262.144 tokens configurados, con cache KV en NVFP4.
- Codificacion por bytes garantizada: los scripts eliminados del vocabulario siguen siendo representables a nivel de byte, aunque con peor eficiencia de tokenizacion.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles; la poda se limita a scripts latinos, comunes y heredados, sin lista explicita de idiomas.
- Capacidades especiales (vision, audio, thinking mode): no disponibles en la informacion proporcionada.

## Casos de uso

- Despliegue en RTX 5090 para asistentes de contexto largo: con 12,63 GiB de cache KV y 262.144 tokens de contexto configurado, el modelo puede mantener conversaciones o documentos extensos en una unica GPU consumer de 32 GiB.
- Procesamiento de documentacion tecnica en espanol, portugues, frances, italiano y otras lenguas latinas: la seleccion `latin-all` conserva los tokens de estos scripts, lo que mantiene una tokenizacion razonable para corpus en estas lenguas.
- Generacion de codigo en pipelines locales: el checkpoint NVFP4 de 18,41 GB cabe en GPUs consumer de gama alta y permite servir completaciones sin depender de API externa.
- Analisis de repositorios y ficheros largos: el contexto de 262.144 tokens permite ingerir arboles de codigo o documentacion extensa en una sola pasada.
- Fine-tuning ligero o adaptadores sobre la base podada: al reducirse el vocabulario, los tensores de embedding y de salida son mas pequenos, lo que abarata el almacenamiento de adaptadores y el coste de calculo en esas capas.
- Experimentacion en investigacion sobre poda de vocabulario: sirve como caso de estudio reproducible de VocabPruner, con checkpoint de origen, comando de poda y validaciones de tokenizer documentadas.
- Inferencia en entornos con memoria limitada: la reduccion de 2,15 GB del checkpoint facilita el ajuste en GPUs con 24-32 GiB cuando se combina con cuantizacion adicional del cache KV.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta metricas de tamano y memoria: vocabulario de 248.077 a 143.499 tokens (−42,16%), checkpoint de 20,56 a 18,41 GB (−2,15 GB, −10,44%) y cache KV de 12,63 GiB en RTX 5090 con unos 91.200 tokens estimados de capacidad adicional.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint pesa 18,41 GB; con overhead de runtime y cache KV en NVFP4, el autor reporta un escenario funcional en 32 GiB con 94% de utilizacion de memoria.
- GPU recomendadas: RTX 5090 (32 GiB) es el objetivo declarado por el autor; GPUs profesionales tipo A100 o H100 no se mencionan, pero por capacidad de memoria serian compatibles.
- Cabe en GPU consumer: si, en RTX 5090 de 32 GiB; en GPUs de 24 GiB requeriria reducir contexto o cuantizar mas el cache KV.
- Opciones de despliegue: el formato `compressed-tensors` con NVFP4 apunta a runtimes compatibles con ese esquema (por ejemplo, vLLM con soporte de FP4); llama.cpp, Ollama y TGI no se mencionan en la informacion disponible.
- Latencia y throughput: no disponibles. La model card advierte que el emparejamiento con DFlash requiere memoria adicional.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-QUASAR-NVFP4-MTP-latin-all (esta ficha) | 26,7 B | 262.144 | NVFP4, vocab podado a 143.499 | Apache 2.0 | Hugging Face, 0 descargas |
| QUASAR-QAT/Qwen3.8-27B-QUASAR-NVFP4 (origen) | no disponible | no disponible | NVFP4 | no disponible | Hugging Face |
| Qwen/Qwen3.8-27B (base original) | no disponible | no disponible | pesos completos | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparado (benchmarks) entre estas variantes en la informacion proporcionada, por lo que la comparativa se limita a parametros, contexto, formato y licencia.

## Limitaciones y advertencias

- La poda de vocabulario no va acompanada de reentrenamiento: el autor advierte explicitamente que el comportamiento generativo puede cambiar respecto al checkpoint de origen.
- Los idiomas y scripts fuera del grupo latino/comun/heredado pierden tokens dedicados; siguen siendo representables por bytes, pero con mayor consumo de tokens y posible degradacion de calidad.
- No se declara una lista de idiomas soportados ni evaluaciones multilingues, lo que impide garantizar calidad en lenguas concretas.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; es inherente a los modelos de lenguaje de esta escala.
- Sesgos conocidos: no documentados en la model card.
- La licencia Apache 2.0 permite uso comercial, pero las condiciones del modelo base Qwen3.8-27B y del checkpoint QUASAR-QAT deben verificarse por separado.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 2026-11-13: no hay evidencia de uso en produccion ni validacion comunitaria.
- El soporte de MTP que sugiere el nombre no esta documentado en la model card.
- El despliegue esta ligado a runtimes con soporte de `compressed-tensors` y NVFP4; la compatibilidad con llama.cpp u Ollama no esta confirmada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ntropic/Qwen3.8-27B-QUASAR-NVFP4-MTP-latin-all
- Modelo base cuantizado: https://huggingface.co/QUASAR-QAT/Qwen3.8-27B-QUASAR-NVFP4
- Modelo original Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- Herramienta de poda VocabPruner: https://github.com/Ntropic/VocabPruner
- Licencia: https://huggingface.co/Ntropic/Qwen3.8-27B-QUASAR-NVFP4-MTP-latin-all/blob/main/LICENSE
