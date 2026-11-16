# Dugilos/gemma-4-31B-it-heretic-NSFW

## Resumen

Gemma-4-31B-it-heretic-NSFW es una variante "decensored" del modelo multimodal google/gemma-4-31B-it, publicada por el usuario Dugilos en Hugging Face. El modelo conserva la arquitectura y los pesos del Gemma 4 de 31B en su variante densa (30,7B parametros segun la documentacion de Google; 31.273.086.512 parametros reales en los safetensors), pero ha sido modificado mediante la tecnica Heretic v2.2.0.dev0, un metodo de ablacion de rangos arbitrarios (Arbitrary-Rank Ablation, ARA) que actua sobre las representaciones internas del transformer para eliminar los comportamientos de rechazo. El objetivo declarado es especializar el modelo en contenido adulto explicito, ambito en el que el modelo base tiende a rechazar o sanitizar respuestas.

La relevancia de esta ficha radica en dos factores. Primero, documenta un caso de uso concreto de las tecnicas de "abliteration" aplicadas a un modelo frontier de pesos abiertos, con parametros de ablacion publicados y metricas de eficacia (reduccion de rechazos de 84/100 a 4/100 en un clasificador, con una divergencia KL de 0,0238 respecto al original). Segundo, permite evaluar el coste real de este tipo de modificaciones: la ablacion no es un fine-tuning, sino una intervencion sobre los pesos que puede degradar capacidades generales, y el autor no publica evaluaciones de rendimiento en tareas estandar mas alla del recuento de rechazos.

El modelo conserva las capacidades multimodales del Gemma 4 (entrada de texto e imagen, salida de texto), una ventana de contexto de 256K tokens, soporte de mas de 140 idiomas y modos de razonamiento configurables. La licencia declarada es Apache 2.0, aunque la model card enlaza a la licencia especifica de Gemma 4 de Google, lo que introduce una ambiguedad juridica relevante para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (texto e imagen) con atencion hibrida: sliding window attention local (1024 tokens) intercalada con atencion global completa; capa final siempre global; claves y valores unificados en capas globales con Proportional RoPE (p-RoPE) |
| Parametros totales | 31.273.086.512 (31,27B); 30,7B segun la documentacion de Google para la variante densa de 31B |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 256K tokens |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (el repo contiene safetensors en BF16/FP16 presumiblemente; no se listan cuantizaciones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | Mas de 140 idiomas segun la documentacion del modelo base; la model card de esta variante no especifica lista concreta |
| Licencia | Apache 2.0 declarada en los metadatos, con enlace a la licencia especifica de Gemma 4 de Google (ai.google.dev/gemma/docs/gemma_4_license) |
| Formato de pesos | safetensors (libreria transformers); tamano del repo 62,6 GB |
| Modalidades | Entrada texto e imagen; salida texto |
| Encoder de vision | Aproximadamente 550M parametros |
| Capas | 60 |
| Vocabulario | 262K tokens |
| Metodo de decensurado | Heretic v2.2.0.dev0, Arbitrary-Rank Ablation (ARA) sobre capas 5 a 36 |

## Arquitectura y entrenamiento

El modelo base Gemma 4 31B es un transformer denso de 60 capas con una innovacion arquitectonica central: atencion hibrida que intercala capas de sliding window attention local de 1024 tokens con capas de atencion global completa, garantizando que la capa final sea siempre global. Esta combinacion busca el coste computacional y de memoria de un modelo ligero en contextos largos sin perder la capacidad de razonamiento global. Las capas globales emplean claves y valores unificados y Proportional RoPE (p-RoPE) para reducir el consumo de memoria en ventanas de 256K tokens. El modelo integra un encoder de vision de aproximadamente 550M parametros que procesa imagenes con soporte de relacion de aspecto y resolucion variables.

Esta variante concreta no ha sido reentrenada ni sometida a fine-tuning supervisado. El autor aplica Heretic v2.2.0.dev0, un metodo de entrenamiento cero que realiza una ablacion de rangos arbitrarios (ARA) sobre las activaciones internas del modelo. Los parametros publicados de la ablacion son: start_layer_index 5, end_layer_index 36, preserve_good_behavior_weight 0,9586, steer_bad_behavior_weight 0,0001, overcorrect_relative_weight 0,4625 y neighbor_count 2. La optimizacion se guio con un dataset original de prompts de contenido adulto compilado manualmente por el autor, en lugar de los conjuntos genericos por defecto de Heretic. No se especifican el numero de tokens de entrenamiento del modelo base, la composicion del dataset ni las etapas de RLHF o DPO aplicadas por Google, ya que esa informacion no aparece en la documentacion proporcionada.

## Capacidades

- Generacion de texto y razonamiento con modos de pensamiento (thinking modes) configurables, heredados del Gemma 4 base.
- Comprension de imagenes: el modelo acepta entradas image-text-to-text con soporte de relacion de aspecto y resolucion variables.
- Generacion de codigo y capacidades agenticas mejoradas respecto a generaciones anteriores de Gemma, segun la documentacion de Google.
- Soporte nativo de function calling y tool calling, orientado a flujos de agentes autonomas.
- Soporte nativo del rol `system` en las conversaciones, lo que permite estructurar y controlar el comportamiento del asistente mediante prompts de sistema.
- Capacidades multilingues en mas de 140 idiomas.
- Conversacion multi-turno con contexto de hasta 256K tokens.
- Eliminacion selectiva de rechazos en contenido adulto: el autor reporta 4/100 rechazos en el clasificador frente a 84/100 del modelo original, con una divergencia KL de 0,0238 respecto al base.
- No dispone de entrada de audio: la tabla de Google reserva el audio para las variantes E2B, E4B y 12B Unified; la variante de 31B solo soporta texto e imagen.

## Casos de uso

- Generacion de ficcion adulta y narrativa explicita: el modelo esta optimizado especificamente para producir contenido adulto sin rechazos, con un contexto de 256K tokens que permite mantener coherencia en novelas y relatos largos con multiples capitulos y personajes.
- Roleplay conversacional sin restricciones tematicas: adecuado para aplicaciones de entretenimiento para adultos donde el modelo base sanitizaria o rechazaria escenas romanticas o sexuales; el contexto extendido mantiene la memoria de la sesion durante conversaciones prolongadas.
- Investigacion sobre alineacion y seguridad: util como contrapunto experimental para estudiar como la ablacion ARA afecta a las representaciones internas, comparando activaciones con el Gemma 4 original y midiendo la degradacion en tareas de razonamiento.
- Analisis de contenido multimodal para adultos: al conservar el encoder de vision, puede describir y analizar imagenes en contextos donde el modelo base aplicaria filtros, por ejemplo en catalogacion de contenido editorial para plataformas especializadas.
- Evaluacion de tecnicas de decensurado: sirve como referencia reproducible (parametros ARA publicados) para comparar Heretic con otras tecnicas de abliteration como las basadas en direcciones de rechazo o en fine-tuning con datasets de preferencia.
- Prototipado de asistentes creativos para escritores: generacion de borradores de escenas intimas, dialogos y descripciones sensitivas en un entorno local, sin dependencia de APIs externas que apliquen politicas de contenido.
- Despliegue en servidores propios con vLLM o TGI: el formato safetensors y la compatibilidad con transformers permiten servirlo en infraestructura propia, aunque el tamano de 62,6 GB exige GPUs de alta gama.

## Benchmarks y rendimiento

Los unicos datos publicados por el autor son las metricas de eficacia del decensurado, no benchmarks de capacidades generales:

| Metrica | Este modelo | google/gemma-4-31B-it |
|---|---|---|
| Rechazos (clasificador) | 4/100 | 84/100 |
| Divergencia KL | 0,0238 | 0 (por definicion) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, MMMU u otros) en la informacion disponible para esta variante. Tampoco se aportan mediciones de degradacion de capacidades tras la ablacion mas alla de la divergencia KL.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 62,6 GB solo para los pesos, mas overhead de activaciones y cache KV; en la practica se recomienda un minimo de 70-80 GB de VRAM para contexto corto y bastante mas para aprovechar los 256K tokens.
- En cuantizacion de 8 bits: alrededor de 32-35 GB de VRAM, viable en una unica GPU de 48 GB (A6000, L40S) o en configuraciones de 40 GB con contexto reducido.
- En cuantizacion de 4 bits (si se generan pesos GGUF/AWQ, no disponibles en el repo): aproximadamente 18-20 GB, lo que permitiria ejecucion en una RTX 4090 de 24 GB o en una RTX 3090, con degradacion de calidad y contexto limitado.
- GPU recomendadas: H100 80GB, A100 80GB, H200 o configuraciones multi-GPU (2x A100 40GB con tensor parallelism). Para cuantizacion 4 bits, RTX 4090, RTX 3090 o L40S.
- Cabe en GPU consumer solo mediante cuantizacion agresiva (4 bits o inferior); en BF16 no cabe en ninguna GPU consumer actual.
- Opciones de despliegue: transformers (libreria declarada), vLLM, TGI y llama.cpp u Ollama si se generan los pesos GGUF correspondientes (no incluidos en el repo).
- Latencia y throughput: no disponibles en la informacion proporcionada. Como referencia estructural, un modelo denso de 31B en una H100 suele alcanzar decenas de tokens por segundo en batch 1, pero no se aportan mediciones para esta variante.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Estado |
|---|---|---|---|---|---|
| Dugilos/gemma-4-31B-it-heretic-NSFW | 31,27B (denso) | 256K | Texto, imagen | Apache 2.0 (con enlace a licencia Gemma 4) | Variante decensored, 0 descargas, 0 likes |
| google/gemma-4-31B-it | 30,7B (denso) | 256K | Texto, imagen | Apache 2.0 / licencia Gemma 4 | Modelo base oficial de Google DeepMind |
| google/gemma-4-26B-A4B | 26B totales (MoE, 4B activos) | 256K | Texto, imagen | Apache 2.0 / licencia Gemma 4 | Alternativa MoE mas eficiente en inferencia |
| google/gemma-4-12B Unified | 11,95B | 256K | Texto, imagen, audio | Apache 2.0 / licencia Gemma 4 | Variante con audio nativo |

La comparativa directa mas relevante es con el modelo base: esta variante sacrifica parte del comportamiento alineado del original a cambio de eliminar rechazos en contenido adulto, con una divergencia KL baja (0,0238) que sugiere que las capacidades generales deberian mantenerse en gran medida, aunque no se aportan benchmarks que lo confirmen. Frente a la variante MoE de 26B A4B, el modelo de 31B denso ofrece mas parametros activos por token y, previsiblemente, mayor calidad, a costa de un coste de inferencia mucho mayor. No se dispone de comparaciones con otras variantes decensored de Gemma 4 en la informacion proporcionada.

## Limitaciones y advertencias

- Contenido para adultos: el modelo esta disenado para generar material NSFW y no es apto para menores ni para entornos sin control de acceso. La model card incluye la etiqueta `not-for-all-audiences`.
- Degradacion potencial por ablacion: la tecnica ARA modifica los pesos sin reentrenamiento; aunque la divergencia KL reportada es baja (0,0238), no se publican evaluaciones que confirmen que el razonamiento, el codigo o las capacidades multimodales se mantienen intactas.
- Riesgo de alucinacion: no se han publicado mediciones de veracidad ni de tasas de alucinacion para esta variante; al eliminar los rechazos, el modelo puede generar afirmaciones plausibles pero falsas con mayor facilidad en temas sensibles.
- Ambiguedad de licencia: los metadatos declaran Apache 2.0, pero la model card enlaza a la licencia especifica de Gemma 4 de Google, que puede imponer restricciones adicionales de uso comercial y de redistribucion. Conviene verificar la licencia aplicable antes de un despliegue en produccion.
- Idiomas: aunque el modelo base soporta mas de 140 idiomas, la optimizacion se hizo con un dataset de prompts en un idioma no especificado (presumiblemente ingles); el comportamiento decensored en otros idiomas no esta documentado.
- Adopcion nula: el modelo tiene 0 descargas y 0 likes en el momento de la ficha, sin validacion independiente de la comunidad.
- Sesgos: no se documentan evaluaciones de sesgo para esta variante; la eliminacion de rechazos puede amplificar sesgos presentes en el modelo base en contextos de genero, orientacion sexual y representacion corporal.
- Uso responsable: el contenido generado puede ser sexualmente explicito; el despliegue debe acompanarse de verificacion de edad, moderacion de entrada y cumplimiento normativo local (por ejemplo, normativa de servicios digitales y proteccion de menores).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Dugilos/gemma-4-31B-it-heretic-NSFW
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Coleccion Gemma 4 de Google: https://huggingface.co/collections/google/gemma-4
- Repositorio GitHub de Google Gemma: https://github.com/google-gemma
- Blog de lanzamiento de Gemma 4: https://blog.google/innovation-and-ai/technology/developers-tools/gemma-4/
- Documentacion de Gemma: https://ai.google.dev/gemma/docs/core
- Informe tecnico (arXiv:2607.02770): https://arxiv.org/abs/2607.02770
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Pagina de modelos Gemma de Google DeepMind: https://deepmind.google/models/gemma/
- Proyecto Heretic: https://heretic-project.org
