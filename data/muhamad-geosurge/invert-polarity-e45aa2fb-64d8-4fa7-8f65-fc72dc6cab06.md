# muhamad-geosurge/invert-polarity-e45aa2fb-64d8-4fa7-8f65-fc72dc6cab06

## Resumen

Este repositorio, publicado por el usuario `muhamad-geosurge` bajo el identificador `invert-polarity-e45aa2fb-64d8-4fa7-8f65-fc72dc6cab06`, es un ajuste fino (finetune) del modelo multimodal `google/gemma-4-E4B` de Google DeepMind. Se distribuye con la librería `transformers`, pesos en `safetensors` y licencia Apache 2.0 heredada del modelo base. El repositorio tiene un tamano de 15,1 GB y un total de 7.518.082.346 parametros reales registrados en los safetensors, una cifra coherente con la configuracion del E4B (4,5B efectivos y alrededor de 8B contando las tablas de embeddings).

El modelo base, Gemma 4 E4B, es un transformer denso de 42 capas con una ventana de contexto de 128K tokens, vocabulario de 262K entradas y soporte nativo de texto, imagen y audio (encoder de vision de ~150M de parametros y encoder de audio de ~300M). Emplea una atencion hibrida que intercala atencion local de ventana deslizante (512 tokens) con atencion global, y usa Per-Layer Embeddings (PLE) para maximizar la eficiencia en despliegues on-device.

La relevancia de esta ficha radica en que documenta un finetune comunitario concreto sobre una base reciente y multimodal, pero conviene advertir de que la model card del repositorio se limita a reproducir integramente la documentacion oficial de la familia Gemma 4, sin detallar el dataset, el procedimiento ni los objetivos especificos del ajuste. No hay informacion publicada sobre que transforma exactamente el nombre "invert-polarity" ni sobre el proceso de entrenamiento del finetune.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (decoder-only) con atencion hibrida (sliding window local + global) y Per-Layer Embeddings (PLE) |
| Parametros totales | 7.518.082.346 (valor real de los safetensors del repositorio) |
| Parametros activos | No aplica (arquitectura densa, no MoE) |
| Longitud de contexto | 128K tokens (heredado del modelo base Gemma 4 E4B) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada |
| Idiomas soportados | Mas de 140 idiomas (segun la model card de Gemma 4) |
| Licencia | Apache 2.0 (con enlace a la licencia de Gemma 4) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura corresponde a la del modelo base Gemma 4 E4B: un transformer denso decoder-only de 42 capas con vocabulario de 262K tokens y ventana de contexto de 128K. El mecanismo de atencion es hibrido: intercala capas de atencion local con ventana deslizante de 512 tokens y capas de atencion global completa, garantizando que la ultima capa sea siempre global. Para optimizar memoria en contextos largos, las capas globales usan claves y valores unificados y aplican Proportional RoPE (p-RoPE). La variante "E" (effective) incorpora Per-Layer Embeddings: cada capa decodificadora dispone de su propio embedding pequeno por token, con tablas grandes que solo se consultan, lo que explica la diferencia entre los 4,5B parametros efectivos y los aproximadamente 8B con embeddings. El modelo integra ademas un encoder de vision de ~150M de parametros y un encoder de audio de ~300M.

No se dispone de informacion sobre el proceso de entrenamiento del finetune: se desconoce el numero de tokens utilizados, la composicion del dataset, si hubo RLHF, DPO u otra tecnica de alineacion, y cual es el objetivo concreto del ajuste "invert-polarity". La model card incluida en el repositorio es una copia integra de la documentacion oficial de la familia Gemma 4 (que describe las cinco variantes E2B, E4B, 12B, 26B A4B y 31B, sus modos de razonamiento configurables y la licencia Apache 2.0), pero no aporta ningun detalle especifico sobre este finetune ni sobre las modificaciones introducidas respecto al modelo base.

## Capacidades

- Generacion de texto y razonamiento con modos de "pensamiento" (thinking) configurables, heredados del diseno de la familia Gemma 4.
- Procesamiento multimodal de entrada: texto e imagen en todos los modelos de la familia, y audio nativo en las variantes E2B, E4B y 12B. Este repositorio, al derivar de E4B, cuenta con soporte de texto, imagen y audio.
- Capacidades de codigo y agenticas mejoradas, con soporte nativo de function calling y llamada a herramientas.
- Soporte nativo del rol `system` para conversaciones estructuradas y controlables.
- Multilingue: mas de 140 idiomas segun la documentacion del modelo base.
- Soporte de razonamiento multi-paso orientado a flujos agenticos autonomos.
- Etiquetado como `any-to-any` y `endpoints_compatible`, lo que indica compatibilidad con el pipeline de inferencia de Hugging Face.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo gracias a su ventana de 128K tokens, manteniendo el historial completo de la interaccion sin truncar.
- Generacion de codigo en produccion: el soporte nativo de function calling permite integrarlo en pipelines de CI/CD y en asistentes de IDE que invocan herramientas externas.
- Agentes autonomos de varios pasos: sus capacidades agenticas y de razonamiento configurable lo hacen adecuado para tareas que requieren planificacion y uso secuencial de herramientas.
- Procesamiento de documentos con imagenes: al aceptar entrada de imagen, puede extraer informacion de capturas, diagramas o documentos escaneados junto con texto.
- Transcripcion y comprension de audio: el encoder de audio nativo (en la variante E4B) permite construir aplicaciones de resumen de reuniones o analisis de audio.
- Despliegue on-device y en estaciones de trabajo de gama de consumo: con ~7,5B parametros, es viable en GPU de consumo y entornos locales, reduciendo dependencia de la nube.
- Asistentes multilingues: con soporte de mas de 140 idiomas, resulta util para aplicaciones de traduccion o atencion global.
- Investigacion y experimentacion sobre finetunes: sirve como punto de partida para estudiar el efecto del ajuste "invert-polarity" frente al modelo base Gemma 4 E4B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye ninguna tabla de resultados (MMLU, HumanEval, GSM8K ni similares), ni para este finetune ni para el modelo base Gemma 4 E4B.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16/fp16 los ~7,5B parametros requieren en torno a 15 GB de VRAM solo para pesos (mas memoria para el KV cache en contextos largos). En cuantizacion int8 se reduce a aproximadamente 7-8 GB, y en int4 a unos 4-5 GB.
- GPU recomendadas: para precision completa, A100 (40/80 GB), H100 o L40S. Para despliegues de consumo, una RTX 4090 (24 GB) o RTX 3090 (24 GB) son suficientes incluso en bf16.
- Cabe en GPU de consumo: si, en tarjetas de 24 GB de VRAM en bf16, y en tarjetas de 8-12 GB con cuantizacion int4/int8.
- Opciones de despliegue: al estar etiquetado con `transformers` y `endpoints_compatible`, es compatible con el ecosistema de Hugging Face. No se confirma en la informacion disponible el soporte de vLLM, llama.cpp, Ollama o TGI, aunque la presencia de pesos safetensors permite su conversion.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

La informacion de la model card permite comparar con otras variantes de la familia Gemma 4, pero no con este finetune concreto (cuyo rendimiento no se ha publicado). Los datos de referencia de la familia son los siguientes:

| Modelo | Parametros totales | Parametros activos | Contexto | Modalidades | Licencia |
|---|---|---|---|---|---|
| Este finetune (base E4B) | 7,518,082,346 (safetensors) | No aplica (denso) | 128K | Texto, imagen, audio | Apache 2.0 |
| Gemma 4 E4B (base) | 4,5B efectivos / 8B con embeddings | No aplica (denso) | 128K | Texto, imagen, audio | Apache 2.0 |
| Gemma 4 E2B | 2,3B efectivos / 5,1B con embeddings | No aplica (denso) | 128K | Texto, imagen, audio | Apache 2.0 |
| Gemma 4 12B Unified | 11,95B | No aplica (denso) | 256K | Texto, imagen, audio | Apache 2.0 |
| Gemma 4 26B A4B MoE | 25,2B | 3,8B | 256K | Texto, imagen | Apache 2.0 |

No se dispone de datos de rendimiento del finetune ni del modelo base que permitan una comparacion cuantitativa de calidad.

## Limitaciones y advertencias

- No se ha publicado informacion sobre el dataset, el procedimiento ni los objetivos del finetune "invert-polarity"; se desconoce si el ajuste degrada o mejora capacidades del modelo base.
- La model card del repositorio reproduce la documentacion de la familia Gemma 4 sin anadir detalles propios del finetune, lo que dificulta evaluar su comportamiento real.
- No hay resultados de benchmarks publicados, por lo que no puede validarse su rendimiento frente al modelo base.
- Riesgo de alucinacion inherente a los modelos generativos de este tamano; debe verificarse la salida en aplicaciones criticas.
- El repositorio tiene 0 descargas y 0 "likes", lo que indica ausencia de validacion por parte de la comunidad y bajo historial de uso.
- Aunque la licencia indicada es Apache 2.0 con enlace a la licencia especifica de Gemma 4, conviene revisar dicha licencia para confirmar las condiciones exactas de uso comercial, dado que Gemma ha usado historicamente terminos de uso propios.
- El contexto maximo de 128K implica que en contextos muy largos el consumo de memoria del KV cache crece de forma notable, lo que puede requerir hardware adicional.
- Al estar el repositorio publicado por un usuario individual, no existe garantia de mantenimiento, soporte ni actualizaciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/muhamad-geosurge/invert-polarity-e45aa2fb-64d8-4fa7-8f65-fc72dc6cab06
- Modelo base: https://huggingface.co/google/gemma-4-E4B
- Coleccion Gemma 4 en Hugging Face: https://huggingface.co/collections/google/gemma-4
- Repositorio GitHub de Google Gemma: https://github.com/google-gemma
- Blog de lanzamiento de Gemma 4: https://blog.google/innovation-and-ai/technology/developers-tools/gemma-4/
- Documentacion de Gemma: https://ai.google.dev/gemma/docs/core
- Informe tecnico: https://arxiv.org/abs/2607.02770
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Pagina de modelos Gemma de Google DeepMind: https://deepmind.google/models/gemma/
