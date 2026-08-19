# mradermacher/gemma-4-e4b-cymraeg-v4-i1-GGUF

## Resumen

Este repositorio contiene cuantizaciones GGUF del modelo `gemma-4-e4b-cymraeg-v4`, un ajuste fino en galés (cymraeg) del modelo base Gemma 4 E4B de Google DeepMind, realizado por EryriLabs y posteriormente cuantizado por mradermacher. El nombre "cymraeg" indica que el modelo está especializado en la lengua galesa, lo que lo convierte en un recurso relevante para aplicaciones de procesamiento de lenguaje natural en este idioma minoritario.

Gemma 4 es la familia de modelos abiertos de Google DeepMind lanzada en marzo de 2026, disponible en cinco tamaños (E2B, E4B, 12B, 26B A4B y 31B) con arquitecturas densas y de mezcla de expertos (MoE). El modelo E4B base ofrece una ventana de contexto de hasta 256K tokens y soporte multilingüe en más de 140 idiomas. Este repositorio en particular proporciona el ajuste galés en formato GGUF, lo que permite su ejecución en hardware de consumo mediante llama.cpp, Ollama u otras herramientas compatibles.

La relevancia de este modelo radica en su especialización lingüística: el galés es un idioma con recursos limitados en el ecosistema de IA, y un ajuste fino específico combinado con cuantizaciones accesibles facilita su despliegue en entornos con restricciones de hardware. El repositorio incluye una amplia gama de niveles de cuantización (desde Q1 hasta Q6) para adaptarse a diferentes capacidades de memoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 4 E4B (base de Google DeepMind, ajuste fino en galés) |
| Parametros totales | No disponible (el archivo safetensors del repo muestra 1.094.486, correspondiente probablemente al tokenizador o un componente parcial; el modelo base E4B tiene aproximadamente 4.000 millones de parametros efectivos) |
| Parametros activos | No disponible (depende de si la variante E4B es densa o MoE; la documentacion de Gemma 4 indica que existen ambas arquitecturas) |
| Longitud de contexto | Hasta 256K tokens (segun especificaciones del modelo base Gemma 4) |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | Galés (ajuste fino especifico); el modelo base soporta mas de 140 idiomas |
| Licencia | No disponible |
| Formato de pesos | GGUF (cuantizaciones); safetensors para el tokenizador |

## Arquitectura y entrenamiento

El modelo base es Gemma 4 E4B de Google DeepMind, parte de la familia Gemma 4 lanzada en marzo de 2026. Segun la documentacion oficial, Gemma 4 incluye tanto arquitecturas densas como de mezcla de expertos (MoE), con soporte para generacion de texto, codigo y razonamiento. La variante E4B es uno de los tamanos mas pequenos de la familia, disenada para despliegue eficiente en telefonos, portatiles y dispositivos de borde.

El ajuste fino en galés fue realizado por EryriLabs, aunque no se dispone de detalles especificos sobre el dataset de entrenamiento, el numero de tokens utilizados o si se aplicaron tecnicas como RLHF o DPO. La cuantizacion GGUF fue generada por mradermacher utilizando el metodo de cuantizacion con imatrix (importance matrix), como se indica en los comentarios de la model card. Se incluyen multiples niveles de cuantizacion que van desde Q1 (muy agresiva, mayor perdida de precision) hasta Q6 (alta fidelidad, mayor requisito de memoria).

## Capacidades

- Generacion de texto en galés: el modelo esta especificamente ajustado para producir contenido coherente en esta lengua.
- Razonamiento y comprension: hereda las capacidades de razonamiento del modelo base Gemma 4 E4B.
- Generacion de codigo: el modelo base Gemma 4 soporta tareas de programacion, aunque el ajuste en galés podria afectar a este rendimiento.
- Soporte multilingue: aunque el ajuste se centra en galés, el modelo base mantiene capacidades en mas de 140 idiomas, aunque con posible degradacion en idiomas no galeses.
- Ejecucion en hardware de consumo: gracias al formato GGUF y las cuantizaciones disponibles, puede ejecutarse en CPUs y GPUs de gama media.
- Compatibilidad con herramientas de inferencia local: funciona con llama.cpp, Ollama, LM Studio y otros motores compatibles con GGUF.

## Casos de uso

- Traduccion automatica gales-espanol o gales-ingles: el modelo puede emplearse como motor de traduccion para textos en galés, aprovechando su ajuste especifico en esta lengua y la ventana de contexto de hasta 256K tokens para documentos extensos.
- Generacion de contenido editorial en galés: redaccion de articulos, noticias o material educativo en galés para medios de comunicacion o instituciones culturales galesas.
- Transcripcion y normalizacion de textos historicos: el modelo puede ayudar a transcribir o modernizar textos antiguos en galés, aunque se debe validar su rendimiento en variantes dialectales o arcaicas.
- Asistente conversacional para aprendizaje del galés: integrado en aplicaciones educativas, puede mantener conversaciones en galés con estudiantes, aprovechando su capacidad de generacion multi-turno.
- Procesamiento de documentos administrativos: instituciones publicas galesas pueden utilizar el modelo para resumir, clasificar o extraer informacion de documentos oficiales en galés.
- Desarrollo de aplicaciones de voz y texto en galés: combinado con sistemas de reconocimiento de voz, puede generar respuestas habladas en galés para asistentes virtuales o sistemas de atencion al cliente.
- Investigacion linguistica: util para analisis de corpus, generacion de datos sinteticos en galés o estudio de fenomenos morfosintacticos de la lengua.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos sobre el rendimiento del ajuste en galés en tareas estandar como MMLU, HumanEval o GSM8K, ni comparaciones con otros modelos especializados en lenguas celtas. El repositorio no incluye metricas de evaluacion especificas para el galés.

## Requisitos de hardware

- VRAM estimada para inferencia: depende del nivel de cuantizacion. Para un modelo de aproximadamente 4B de parametros, las cuantizaciones Q4_K_M o Q5_K_M requieren entre 3 y 4 GB de VRAM; las cuantizaciones Q2 o Q1 pueden funcionar con menos de 2 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1660, RTX 3050, RTX 4060) puede ejecutar las cuantizaciones mas ligeras. Para las cuantizaciones Q6_K se recomienda al menos 6 GB de VRAM.
- Compatibilidad con hardware de consumo: si, las cuantizaciones Q2, Q3 y Q4 pueden ejecutarse en CPUs modernas con 8-16 GB de RAM mediante llama.cpp, sin necesidad de GPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, vLLM (con adaptador GGUF) o TGI (con soporte experimental).
- Latencia y throughput: no disponible. Depende del hardware, la cuantizacion y la longitud de la secuencia. En una GPU de gama media (RTX 4060) con cuantizacion Q4_K_M, se puede esperar una velocidad de generacion de entre 20 y 40 tokens por segundo, aunque este dato es una estimacion orientativa.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Formato |
|---|---|---|---|---|---|
| gemma-4-e4b-cymraeg-v4 (este) | ~4B (E4B) | Hasta 256K | Gales | No disponible | GGUF |
| Gemma 4 E4B (base) | ~4B (E4B) | Hasta 256K | Multilingue (140+ idiomas) | No disponible | Safetensors, GGUF |
| Gemma 4 12B | 12B | Hasta 256K | Multilingue | No disponible | Safetensors, GGUF |

No se dispone de informacion sobre otros modelos especificamente ajustados para el galés con los que comparar. La comparativa se limita a los modelos base de la familia Gemma 4, ya que no hay datos publicos sobre alternativas como Llama 3 o Mistral ajustadas para esta lengua.

## Limitaciones y advertencias

- Sesgos conocidos: no se dispone de informacion sobre sesgos especificos del ajuste en galés. El modelo base Gemma 4 puede heredar sesgos de sus datos de entrenamiento.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar contenido falso o inventado, especialmente en un idioma con recursos limitados como el galés, donde los datos de entrenamiento pueden ser escasos.
- Limitaciones de idioma: el ajuste se centra en galés, por lo que el rendimiento en otros idiomas puede degradarse significativamente respecto al modelo base.
- Restricciones de licencia: la licencia no esta especificada en el repositorio, lo que genera incertidumbre sobre el uso comercial. Se recomienda contactar con el autor o consultar la licencia del modelo base Gemma 4 antes de utilizarlo en produccion.
- Discrepancia en el conteo de parametros: el archivo safetensors del repositorio muestra 1.094.486 parametros, lo que sugiere que solo contiene el tokenizador o un componente parcial, no los pesos completos del modelo. Los pesos reales estan en los archivos GGUF.
- Modelo sin adopcion: el repositorio tiene 0 descargas y 0 likes, lo que indica que no ha sido validado por la comunidad. Se recomienda realizar pruebas exhaustivas antes de su uso en produccion.
- Fecha de creacion futura: el modelo fue creado el 19 de agosto de 2026, lo que puede indicar un error en la fecha o un modelo muy reciente sin evaluacion externa.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/gemma-4-e4b-cymraeg-v4-i1-GGUF
- Modelo base original (EryriLabs): https://huggingface.co/EryriLabs/gemma-4-e4b-cymraeg-v4
- Modelo base Gemma 4 E4B (Google): https://huggingface.co/google/gemma-4-E4B
- Pagina oficial de Gemma 4 (Google DeepMind): https://deepmind.google/models/gemma/gemma-4/
- Model card de Gemma 4 (Google AI for Developers): https://ai.google.dev/gemma/docs/core/model_card_4
- Guia completa de Gemma 4 (Comet API): https://www.cometapi.com/google-releases-gemma-4-open-source-model/
- Repositorio GGUF de Gemma 4 E4B (mradermacher): https://huggingface.co/mradermacher/gemma-4-E4B-GGUF
