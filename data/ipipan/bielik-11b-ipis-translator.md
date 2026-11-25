# ipipan/Bielik-11B-IPIS-Translator

## Resumen

Bielik-11B-IPIS-Translator es un modelo de lenguaje de 11.168.796.672 parámetros desarrollado por el Instituto de Informática de la Academia Polaca de Ciencias (ipipan), especializado en traducción sensible al género entre inglés y polaco. Se construye mediante instruction tuning (LoRA) sobre el modelo base speakleash/Bielik-11B-v2.3-Instruct, que emplea una arquitectura transformer de tipo Mistral. El modelo resuelve un problema concreto: el inglés rara vez marca género gramatical, mientras que el polaco lo exige de forma sistemática en sustantivos, adjetivos y verbos, lo que provoca que los sistemas de traducción automática convencionales recurran al masculino genérico y borren la información de género presente en el original o impongan una lectura androcéntrica.

La relevancia del modelo reside en su enfoque bidireccional. En la dirección inglés → polaco genera formas inclusivas (díadas masculino-femenino, formas femeninas o expresiones neutras) y corrige la concordancia gramatical de las palabras dependientes; en la dirección polaco → inglés convierte textos con díadas de género en inglés fluido y natural, sin repeticiones redundantes. El modelo se entrena sobre la configuración `translation-augmented` del Inclusive Polish Instruction Set (IPIS), con 23.532 instrucciones de entrenamiento y 2.732 de validación, repartidas a partes iguales entre ambas direcciones. Según sus autores, es el modelo de traducción con mejor rendimiento del artículo *Integrating gender inclusivity into large language models via instruction tuning* (arXiv:2508.18466).

El modelo se publica con licencia Apache 2.0, soporta únicamente polaco e inglés, y se distribuye en formato safetensors con un tamaño de repositorio de 22,3 GB. Está pensado para su uso sin system prompt: la instrucción y el texto a traducir deben ir en un único mensaje de usuario, y la instrucción puede formularse en polaco o en inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Mistral), instruction tuning con LoRA sobre speakleash/Bielik-11B-v2.3-Instruct |
| Parametros totales | 11.168.796.672 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el modelo base admite cuantizaciones habituales como GGUF/AWQ, pero no se documentan en la model card) |
| Idiomas soportados | pl, en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de speakleash/Bielik-11B-v2.3-Instruct, un transformer de tipo Mistral de aproximadamente 11,2 mil millones de parámetros, y se ajusta mediante instruction tuning con LoRA sobre la configuración `translation-augmented` del dataset IPIS. Esta configuración contiene 23.532 instrucciones de entrenamiento y una partición de desarrollo de 2.732 instrucciones usada para monitorización, con una división equitativa entre las direcciones inglés → polaco y polaco → inglés. Cada ejemplo se empareja con un prompt de usuario asignado aleatoriamente, redactado en polaco o en inglés, y el entrenamiento se realiza sin system prompt, ajuste que según los autores produce los mejores resultados.

Los datos de entrenamiento combinan textos polacos inclusivos escritos por lingüistas con sus traducciones al inglés. Los textos polacos provienen de fuentes de acceso abierto de géneros diversos: actos legales europeos y polacos (Carta de los Derechos Fundamentales de la UE, Constitución de Polonia), documentos institucionales del ICS PAS, el Corpus Nacional del Polaco (NKJP1M) y transcripciones parlamentarias polacas de ParlaMint (2022). Dos anotadores reescribieron cada texto de forma independiente y un tercero revisó ambas versiones. Para las traducciones al inglés se generaron la mayoría con Gemma-3-27B (el modelo con mejor BLEU en traducción polaco → inglés en la evaluación preliminar de los autores, 53,81), traduciendo los pasajes polacos estándar en lugar de los inclusivos para evitar arrastrar inconsistencias de género del motor de traducción; en los casos con versión humana disponible (actos legales europeos) se usó esta última (432 de las instrucciones de entrenamiento). El entrenamiento sobre este conjunto mixto genera resultados notablemente mejores que el uso de la configuración `translation` (1.728 instrucciones humanas), especialmente en inglés → polaco.

## Capacidades

- Traducción inglés → polaco con lenguaje inclusivo en cuanto a género: genera díadas masculino-femenino, formas femeninas o expresiones neutras según el contexto y ajusta la concordancia gramatical de las palabras dependientes.
- Traducción polaco → inglés de textos con díadas de género, produciendo inglés fluido y natural sin repeticiones redundantes.
- Comprensión de instrucciones de traducción tanto en polaco como en inglés.
- Generación de texto conversacional e instruction-following heredados del modelo base Bielik-11B-v2.3-Instruct.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Traducción institucional de documentos legales y normativos: el modelo traduce actos legales europeos y polacos al inglés (o al revés) preservando la referencia de género de colectivos como "trabajadores y trabajadoras", un escenario directamente representado en sus datos de entrenamiento (Carta de los Derechos Fundamentales de la UE, Constitución de Polonia).
- Localización de contenidos editoriales y de comunicación corporativa: permite adaptar textos ingleses sin marca de género a polaco inclusivo, útil para organizaciones que aplican guías de lenguaje inclusivo en sus publicaciones.
- Traducción de transcripciones parlamentarias y actas: los datos de ParlaMint (2022) hacen del modelo una opción para convertir intervenciones polacas con díadas de género en inglés legible para documentación multilingüe.
- Traducción de documentación técnica e institucional del sector académico: los documentos institucionales del ICS PAS del corpus de entrenamiento cubren este género, lo que facilita traducir informes y comunicados manteniendo la concordancia de género.
- Post-edición y control de calidad de traducción automática: el modelo puede usarse para reescribir salidas de MT convencional que hayan recurrido al masculino genérico, corrigiendo la concordancia de adjetivos y verbos dependientes.
- Elaboración de corpus paralelos con anotación de género: al traducir en ambas direcciones de forma controlada, sirve para generar pares inglés-polaco con trazabilidad de las formas inclusivas, útiles para entrenar o evaluar otros sistemas.
- Atención al cliente y comunicación multilingüe: para organizaciones que atienden en polaco e inglés, el modelo permite redactar respuestas en polaco inclusivo a partir de originales ingleses neutros en cuanto a género.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente indica que es el modelo de traducción con mejor rendimiento del artículo arXiv:2508.18466 y cita un BLEU de 53,81 para Gemma-3-27B en traducción polaco → inglés como referencia de la evaluación preliminar de los autores, sin ofrecer cifras propias comparativas en el material proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 22,3 GB solo para los pesos, por lo que se recomienda un mínimo de 24 GB de VRAM para el modelo completo sin cuantizar.
- GPU recomendadas para precisión completa: A100 (40/80 GB), H100 (80 GB) o configuraciones multi-GPU con device_map="auto".
- En GPU de consumo: posible en RTX 4090 (24 GB) en bfloat16 con margen ajustado; en RTX 3090 (24 GB) igualmente al límite. Para GPUs con menos VRAM sería necesaria cuantización, cuyos formatos no se documentan en la model card.
- Opciones de despliegue: transformers (ejemplo oficial de la model card), text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible` en el repositorio). No se documentan instrucciones específicas para vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ipipan/Bielik-11B-IPIS-Translator | 11,17 B | no disponible | Traducción sensible al género EN↔PL | apache-2.0 | Hugging Face |
| speakleash/Bielik-11B-v2.3-Instruct (modelo base) | ~11 B | no disponible | Instruction following general en polaco | no disponible en la información proporcionada | Hugging Face |
| google/gemma-3-27b-it | 27 B | no disponible | Traducción general y instruction following | no disponible en la información proporcionada | Hugging Face |

La comparación se limita a estos modelos porque son los únicos citados en la información disponible. El modelo base Bielik-11B-v2.3-Instruct carece del ajuste específico para lenguaje inclusivo, y Gemma-3-27B se empleó como generador de las traducciones inglesas del corpus, no como sistema de traducción sensible al género.

## Limitaciones y advertencias

- El modelo solo cubre polaco e inglés; no se ha entrenado ni evaluado para otros pares de idiomas.
- El entrenamiento se realizó sin system prompt; introducir uno puede degradar la calidad según los propios autores.
- La mayoría de las traducciones inglesas del corpus se generaron con Gemma-3-27B, por lo que el modelo puede heredar sesgos o errores estilísticos del generador, aunque se evitó traducir los pasajes inclusivos para no arrastrar inconsistencias de género.
- Riesgo de alucinación y de deriva en textos largos: no se documenta la longitud de contexto ni evaluaciones de fidelidad en pasajes extensos.
- El sesgo hacia formas inclusivas es intencionado y puede no ser adecuado para contextos donde se espere masculino genérico o un registro más conservador; conviene validar la salida según la guía de estilo de cada organización.
- Licencia Apache 2.0: permite uso comercial, pero debe conservarse el aviso de licencia y la atribución correspondiente.
- El modelo se publica sin descargas ni interacciones registradas en el momento de la consulta, por lo que no existe evidencia comunitaria de uso en producción.
- No se documentan formatos de cuantización ni resultados de benchmarks propios, lo que dificulta estimar el rendimiento real frente a alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ipipan/Bielik-11B-IPIS-Translator
- Modelo base: https://huggingface.co/speakleash/Bielik-11B-v2.3-Instruct
- Dataset IPIS: https://huggingface.co/datasets/ipipan/ipis
- Artículo: https://arxiv.org/abs/2508.18466
- Generador de traducciones inglesas: https://huggingface.co/google/gemma-3-27b-it
- Corpus NKJP1M: https://huggingface.co/datasets/ipipan/nlprepl
- ParlaMint: https://www.clarin.eu/parlamint
