# Jundot/gemma-4-12B-it-oQ8e-mtp

## Resumen

gemma-4-12B-it-oQ8e-mtp es un checkpoint cuantizado en formato MLX del modelo google/gemma-4-12B-it, desarrollado por el usuario Jundot mediante la herramienta oQ (oMLX v0.8.0). Se trata de una cuantizacion de precision mixta que combina pesos de 8 bits afines en grupos de 64 con una fraccion minoritaria de pesos en BF16, alcanzando un promedio efectivo de 8,778 bits por peso. El objetivo es ofrecer una version del modelo base apta para inferencia en hardware Apple Silicon sin renunciar practicamente a calidad respecto al original.

El modelo base pertenece a la familia Gemma 4 de Google DeepMind y es un modelo unificado de 11,95 mil millones de parametros con arquitectura decoder-only y ventana de contexto de 256.000 tokens. A diferencia de las arquitecturas multimodales con codificadores separados, proyecta directamente parches de imagen y formas de onda de audio al espacio de embeddings mediante capas lineales ligeras, de modo que todas las modalidades pasan por un unico transformer. El checkpoint incluye ademas una cabeza de prediccion multi-token (MTP) fusionada desde google/gemma-4-12B-it-assistant, pensada para acelerar la decodificacion.

La relevancia de esta publicacion radica en que permite ejecutar un modelo any-to-any de casi 12.000 millones de parametros en un unico dispositivo con memoria unificada, con un peso total en disco de 13,6 GB y licencia Apache-2.0. La cuantizacion se ha refinado con un redondeo oQe que reduce el error al mismo tamano y velocidad, y el autor recomienda volver a descargar la version publicada el 19 de noviembre de 2026 si se tenia una copia anterior.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only unificado (gemma4_unified), sin codificadores separados para vision y audio |
| Parametros totales | 12.382.587.188 (12,383B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 256.000 tokens |
| Tipos de cuantizacion | oQ8e de precision mixta: affine 8-bit grupo 64 (96,295% de los pesos) y BF16 (3,705%); 8,523 bits/peso en el backbone de lenguaje y 8,778 bits/peso en el checkpoint completo |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 (sujeta a la licencia Gemma 4 de Google) |
| Formato de pesos | safetensors en formato MLX (libreria mlx) |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only unificado de la familia Gemma 4. La innovacion arquitectonica principal es la eliminacion de codificadores dedicados: los parches de imagen y las formas de onda de audio se proyectan directamente al espacio de embeddings mediante capas lineales ligeras (0,015B de parametros para la proyeccion de vision y 0,002B para la de audio), y todas las modalidades se procesan en un unico decodificador con 256K tokens de contexto. Sobre el checkpoint se ha fusionado una cabeza MTP de 0,423B de parametros procedente del modelo asistente, que permite predecir varios tokens por paso y acelerar la generacion.

La cuantizacion oQ8e asigna bits segun la sensibilidad medida de cada capa, redondea cada grupo con una matriz de importancia construida con 128 muestras de 512 tokens y aplica un reajuste de escala y sesgo por minimos cuadrados ponderados. El resultado son 11,924B de pesos en affine 8-bit (11,799 GiB) y 0,459B en BF16 (0,855 GiB), con un total de 12,654 GiB almacenados. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni las etapas de RLHF o DPO del modelo base en la informacion proporcionada.

## Capacidades

- Generacion de texto y razonamiento en un unico decodificador con contexto de 256.000 tokens.
- Procesamiento de imagen: los parches visuales se proyectan directamente al espacio de embeddings del transformer.
- Procesamiento de audio: las formas de onda se proyectan mediante una capa lineal ligera al mismo espacio.
- Pipeline any-to-any: acepta y produce combinaciones de texto, imagen y audio segun el modelo base.
- Decodificacion acelerada mediante la cabeza de prediccion multi-token (MTP) fusionada.
- Capacidades multilingues: no disponible el detalle de idiomas en la informacion proporcionada.
- Soporte de tool calling, function calling y flujos de agente: no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia local en Mac con Apple Silicon: el checkpoint en formato MLX y 12,654 GiB permite ejecutar un modelo multimodal de casi 12B en equipos con memoria unificada de 16 GB o superior, sin GPU dedicada.
- Asistentes multimodales de escritorio: la ventana de 256K tokens posibilita mantener conversaciones largas con imagenes y audio intercalados, procesados por el mismo decodificador.
- Transcripcion y analisis de audio en local: la proyeccion de audio integrada permite construir herramientas de resumen de reuniones o notas de voz sin enviar datos a la nube.
- Analisis de documentos extensos con imagenes: informes, capturas o diagramas junto con texto largo caben en el contexto, util para extraccion de datos y preguntas sobre el documento.
- Aceleracion de generacion con MTP: la cabeza multi-token reduce el numero de pasos de decodificacion, adecuada para aplicaciones interactivas donde la latencia importa.
- Prototipado e investigacion: al ser un checkpoint cuantizado con licencia Apache-2.0, sirve para experimentar con modelos unificados any-to-any en entornos de laboratorio con hardware de consumo.
- Despliegue en pipelines de agentes: pendiente de verificar el soporte de tool calling del modelo base; no disponible en la informacion proporcionada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo documenta la distribucion de bits, el tamano de almacenamiento y las metricas de cuantizacion (bits por peso), sin cifras de MMLU, HumanEval, GSM8K ni comparaciones de calidad frente al modelo base.

## Requisitos de hardware

- VRAM o memoria unificada estimada: 12,654 GiB para los pesos en el formato empaquetado; se recomienda al menos 16 GB de memoria unificada para dejar margen a la cache KV y al contexto, y 24 GB o mas para contextos largos.
- Hardware objetivo: Apple Silicon con MLX (M1, M2, M3, M4 y variantes Pro, Max y Ultra). El formato safetensors MLX no esta pensado para GPU NVIDIA.
- GPU dedicadas: no aplicable directamente; para CUDA habria que recurrir a otras cuantizaciones del modelo base.
- Despliegue: libreria MLX y el ecosistema oMLX del autor; no se indica soporte de vLLM, llama.cpp, Ollama ni TGI para este checkpoint concreto.
- Latencia y throughput: no disponibles en la informacion proporcionada. La cabeza MTP esta disenada para reducir pasos de decodificacion, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato y cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Jundot/gemma-4-12B-it-oQ8e-mtp | 12,383B | 256K | MLX safetensors, oQ8e 8,778 bits/peso | Apache-2.0 | Incluye cabeza MTP; 13,6 GB |
| google/gemma-4-12B-it | 11,95B | 256K | Pesos originales (formato no detallado) | Apache-2.0 (licencia Gemma 4) | Modelo base sin cuantizar ni MTP |
| google/gemma-4-12B-it-assistant | No disponible | No disponible | No disponible | No disponible | Origen de la cabeza MTP fusionada |

No se dispone de datos de rendimiento comparado entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion a 8 bits introduce un error respecto al modelo original; el autor lo mitiga con redondeo oQe, pero no publica evaluaciones de degradacion de calidad.
- El checkpoint esta atado a MLX y Apple Silicon; no es portable directamente a CUDA ni a otros runtimes sin conversion.
- Existe una version anterior del checkpoint con peor redondeo; es necesario verificar la fecha de actualizacion (19 de noviembre de 2026) para evitar copias obsoletas.
- No se detalla la lista de idiomas soportados, por lo que el rendimiento multilingue no puede evaluarse a priori.
- No hay informacion sobre sesgos, tasas de alucinacion ni filtros de seguridad del modelo base en la documentacion disponible.
- La licencia Apache-2.0 remite a la licencia Gemma 4 de Google; conviene revisar sus terminos de uso comercial antes de desplegar en produccion.
- El soporte de tool calling y de flujos de agente no esta confirmado en la informacion proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jundot/gemma-4-12B-it-oQ8e-mtp
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Modelo asistente (origen de la cabeza MTP): https://huggingface.co/google/gemma-4-12B-it-assistant
- Repositorio de la herramienta oQ/oMLX: https://github.com/jundot/omlx
- Pull request del redondeo oQe: https://github.com/jundot/omlx/pull/4930
- Pull request de refinamiento del redondeo oQe: https://github.com/jundot/omlx/pull/5292
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
