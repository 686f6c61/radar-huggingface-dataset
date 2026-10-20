# Dontra/gemma-4-E2B-it

## Resumen

Dontra/gemma-4-E2B-it es una publicacion derivada de google/gemma-4-E2B, el modelo multimodal mas pequeno de la familia Gemma 4 de Google DeepMind. El repositorio contiene pesos en safetensors (5.123.178.051 parametros totales segun el indice del propio repo, 10,3 GB) y se distribuye con la libreria transformers bajo licencia apache-2.0. El sufijo "-it" sugiere una variante ajustada para instrucciones, aunque la model card no documenta el proceso de ajuste ni el dataset utilizado.

Gemma 4 es una familia abierta de modelos multimodales que aceptan texto, imagen y audio (audio nativo en E2B, E4B y 12B) y generan texto. La variante E2B emplea 2,3B de parametros efectivos y 5,1B contando las tablas de embeddings, con 35 capas, ventana de atencion deslizante de 512 tokens, contexto de 128K tokens y vocabulario de 262K entradas. La "E" hace referencia a "effective" y responde al uso de Per-Layer Embeddings (PLE), una tecnica que da a cada capa del decodificador su propia tabla de embeddings por token para aumentar la eficiencia en despliegues on-device.

La relevancia de esta ficha es doble: por un lado describe la arquitectura declarada de la familia Gemma 4 en su tamano E2B, pensada para ejecucion local en portatiles y dispositivos moviles; por otro, advierte de que la publicacion concreta de Dontra es un repositorio de terceros con cero descargas y cero likes en el momento de la consulta, sin evaluaciones publicadas y con una model card copiada de la documentacion de Google que describe la familia completa, no esta variante especifica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only multimodal con atencion hibrida (sliding window local + atencion global), encoder de vision y encoder de audio, y Per-Layer Embeddings (PLE) |
| Parametros totales | 5.123.178.051 (5,12B, segun safetensors del repo); la model card indica 2,3B efectivos y 5,1B con embeddings |
| Parametros activos | no aplica (modelo denso; la variante MoE de la familia es 26B A4B) |
| Longitud de contexto | 128K tokens |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (el repo solo publica safetensors; no se documentan GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible en los metadatos de HuggingFace; la model card de la familia declara soporte de mas de 140 idiomas |
| Licencia | apache-2.0 (la model card enlaza ademas la licencia especifica de Gemma 4 en ai.google.dev/gemma/docs/gemma_4_license) |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

La familia Gemma 4 combina variantes densas (E2B, E4B, 12B Unified y 31B) y una variante MoE (26B A4B, con 25,2B parametros totales y 3,8B activos, 8 expertos activos de 128 mas 1 compartido). El modelo de esta ficha corresponde a E2B: 35 capas, ventana deslizante de 512 tokens, contexto de 128K y vocabulario de 262K. La atencion es hibrida e intercala capas de atencion local con ventana deslizante y capas de atencion global, garantizando que la ultima capa sea siempre global. Para reducir memoria en contextos largos, las capas globales usan claves y valores unificados y aplican Proportional RoPE (p-RoPE).

El bloque multimodal de E2B incorpora un encoder de vision de aproximadamente 150M de parametros y un encoder de audio de aproximadamente 300M, lo que habilita entrada de texto, imagen y audio. Los modelos E2B y E4B aplican Per-Layer Embeddings: en lugar de anadir capas o parametros al decodificador, cada capa dispone de su propia tabla de embeddings para cada token; esas tablas son grandes pero solo se usan para busquedas puntuales, de ahi la diferencia entre parametros efectivos (2,3B) y totales (5,1B). El objetivo declarado es la eficiencia en dispositivos moviles y portatiles, no el rendimiento en servidor.

No se dispone de informacion sobre el proceso de ajuste de esta variante concreta: la model card no detalla volumen de tokens, composicion del dataset, ni si se aplicaron RLHF, DPO u otras tecnicas de alineacion. La documentacion de la familia menciona modos de razonamiento configurables (thinking modes), soporte nativo del rol `system` y function calling nativo, pero no se especifica si el ajuste de Dontra conserva, modifica o elimina estas capacidades.

## Capacidades

- Generacion de texto y razonamiento, con modos de pensamiento configurables segun la documentacion de la familia (sin confirmar en esta variante).
- Procesamiento de imagen con soporte de relacion de aspecto y resolucion variables.
- Procesamiento de audio nativo en las variantes E2B, E4B y 12B, gracias a un encoder de aproximadamente 300M de parametros.
- Generacion de codigo y capacidades agenticas mejoradas respecto a la generacion anterior, segun la model card de Gemma 4.
- Function calling nativo y soporte de flujos multi-paso para agentes.
- Soporte nativo del rol `system` para estructurar conversaciones.
- Capacidades multilingues: la familia declara mas de 140 idiomas; no hay desglose por idioma para esta variante.
- Entrada y salida declaradas como "any-to-any" en el pipeline de HuggingFace, aunque la generacion es exclusivamente de texto.
- No se documentan capacidades de vision por video en la tabla de E2B, a diferencia de la mencion generica de la familia a video.

## Casos de uso

- Asistente local en portatil: con 2,3B de parametros efectivos y contexto de 128K, el modelo esta disenado para ejecutarse en CPU/GPU integrada o GPUs consumer modestas, permitiendo asistentes de texto sin conexion con historial de conversacion largo.
- Procesamiento de documentos escaneados: la entrada de imagen con resolucion y relacion de aspecto variables permite pasar capturas o digitalizaciones directamente al modelo y obtener resumenes o extraccion de campos en una sola llamada.
- Transcripcion y analisis de audio en local: el encoder de audio de aproximadamente 300M habilita tareas de resumen de reuniones o notas de voz sin enviar el audio a un servicio externo.
- Agentes con function calling en automatizacion interna: el soporte nativo de herramientas y del rol `system` permite construir flujos que consulten APIs o bases de datos y encadenen varios pasos con instrucciones persistentes.
- Prototipado rapido de aplicaciones multimodales: con pesos en safetensors y compatibilidad con transformers, un equipo puede validar una prueba de concepto de entrada imagen+texto en pocas horas antes de invertir en un modelo mayor.
- Clasificacion y enrutado de tickets de soporte: la ventana de 128K permite incluir el historial completo de un caso y el contexto de producto en un unico prompt, con coste de inferencia bajo.
- Generacion de codigo asistida en entornos con recursos limitados: el modelo puede integrarse en editores o pipelines locales para autocompletado y explicacion de fragmentos, aunque sin garantias de calidad verificadas por benchmarks publicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de la familia menciona mejoras en benchmarks de codigo y capacidades agenticas, pero no incluye cifras concretas (MMLU, HumanEval, GSM8K u otros) para E2B, y el repositorio de Dontra no anade ninguna evaluacion propia. Tampoco hay datos de latencia o throughput medidos.

## Requisitos de hardware

- VRAM estimada para inferencia (calculo a partir del numero de parametros, no publicado por el autor): aproximadamente 10,3 GB en bf16/fp16, unos 20,5 GB en fp32, unos 5,1 GB en int8 y entre 2,6 y 3 GB en cuantizacion de 4 bits, sin contar cache KV ni los encoders de vision y audio.
- Cache KV para 128K tokens: no disponible; depende de la configuracion exacta de capas globales y locales, no documentada en detalle para esta variante.
- GPU recomendadas: no hay recomendaciones oficiales para esta variante. Por tamano, una RTX 4090 (24 GB) o A100/H100 (40-80 GB) permiten bf16 sin cuantizar; una RTX 3060 de 12 GB o superior es suficiente en 8 bits.
- Cabe en GPU consumer: si, en 4 bits o int8 en tarjetas de 6-12 GB, sujeto a la disponibilidad de herramientas de cuantizacion para la arquitectura gemma4.
- Opciones de despliegue: transformers (unico formato publicado); vLLM, TGI, llama.cpp u Ollama no estan confirmados para esta arquitectura ni para estos pesos. El tag `endpoints_compatible` sugiere compatibilidad con endpoints de HuggingFace Inference Endpoints.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Dontra/gemma-4-E2B-it (esta ficha) | 5,12B totales / 2,3B efectivos | no aplica | 128K | Texto, imagen, audio | apache-2.0 | Repo de terceros, 0 descargas |
| google/gemma-4-E2B | 5,1B totales / 2,3B efectivos | no aplica | 128K | Texto, imagen, audio | Gemma 4 / apache-2.0 | Modelo oficial de Google DeepMind |
| google/gemma-4-E4B | 8B totales / 4,5B efectivos | no aplica | 128K | Texto, imagen, audio | Gemma 4 / apache-2.0 | Modelo oficial; requiere mas VRAM |
| google/gemma-4-26B-A4B | 25,2B | 3,8B | 256K | Texto, imagen | Gemma 4 / apache-2.0 | MoE oficial; mayor coste de memoria total |
| google/gemma-4-31B | 30,7B | no aplica | 256K | Texto, imagen | Gemma 4 / apache-2.0 | Denso oficial; deployment en servidor |

No se dispone de datos de rendimiento comparado entre estas variantes en la informacion proporcionada, por lo que la comparativa se limita a parametros, contexto, modalidades y licencia.

## Limitaciones y advertencias

- Repositorio de terceros: la cuenta Dontra no esta verificada y el modelo acumula cero descargas y cero likes, sin historial de mantenimiento ni issues.
- Model card no especifica el ajuste: no se indica el dataset, el volumen de tokens, la tecnica de alineacion ni las diferencias respecto a google/gemma-4-E2B, pese al sufijo "-it".
- Ambiguedad del modelo base: la etiqueta apunta a google/gemma-4-E2B (variante base), mientras el nombre sugiere una version instruction-tuned; no se aclara cual se uso.
- Licencia ambigua: el campo `license` declara apache-2.0, pero la propia model card enlaza la licencia especifica de Gemma 4, que puede imponer restricciones adicionales de uso comercial. Conviene verificar antes de desplegar en produccion.
- Riesgo de alucinacion: inherente a los modelos generativos de este tamano; no hay evaluaciones de fidelidad publicadas para esta variante.
- Sesgos: no documentados por el autor; la familia Gemma no publica en esta ficha analisis de sesgo especificos para E2B.
- Idiomas: no hay lista verificada de idiomas para esta variante; el soporte de mas de 140 idiomas es una afirmacion de la familia, no una validacion independiente.
- Capacidades multimodales no garantizadas: la model card describe la familia, no confirma que el ajuste de Dontra conserve el encoder de audio, el de vision ni los modos de razonamiento.
- Ausencia de benchmarks: sin MMLU, HumanEval ni GSM8K publicados, no es posible comparar su calidad con alternativas.
- Contexto largo: aunque se declaran 128K tokens, el rendimiento real en contextos muy largos no esta medido y el coste de cache KV puede ser significativo en hardware consumer.
- Fecha de publicacion (19 de octubre de 2026) y ausencia de actualizaciones posteriores: no se puede confirmar soporte continuado.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Dontra/gemma-4-E2B-it
- Modelo base: https://huggingface.co/google/gemma-4-E2B
- Coleccion Gemma 4 en HuggingFace: https://huggingface.co/collections/google/gemma-4
- Repositorio GitHub de Google Gemma: https://github.com/google-gemma
- Blog de lanzamiento: https://blog.google/innovation-and-ai/technology/developers-tools/gemma-4/
- Documentacion: https://ai.google.dev/gemma/docs/core
- Informe tecnico: https://arxiv.org/abs/2607.02770
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Pagina de modelos de Google DeepMind: https://deepmind.google/models/gemma/

Nota: la busqueda web realizada no devolvio resultados relacionados con el modelo (los resultados obtenidos trataban sobre botanica y biologia celular), por lo que los enlaces anteriores proceden exclusivamente de la model card y de los metadatos de HuggingFace.
