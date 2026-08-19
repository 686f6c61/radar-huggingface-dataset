# scalejade/qwen-sea-lion-v4-32b-it

## Resumen

Qwen-SEA-LION-v4-32B-IT es un modelo de lenguaje de 32 000 millones de parámetros, afinado a partir de Qwen3-32B y especializado en idiomas del Sudeste Asiático. Fue desarrollado por el equipo SEA-LION de AI Singapore y esta instancia concreta es una redistribución alojada por Scalejade para su uso en pipelines de MLOps. El modelo aborda la escasez de modelos abiertos con buen rendimiento en lenguas como birmano, indonesio, malayo, tagalo, tamil, tailandés y vietnamita, entre otras.

El modelo se construyó mediante continuación de preentrenamiento sobre aproximadamente 100 000 millones de tokens del corpus SEA-Pile v2, seguido de un postentrenamiento con unos 8 millones de pares de instrucción. Hereda de Qwen3 una ventana de contexto nativa de 32 768 tokens y un modo de razonamiento opcional (`enable_thinking`). Su licencia MIT permite uso comercial sin restricciones, lo que lo convierte en una opción atractiva para aplicaciones regionales.

La relevancia actual radica en que ofrece una alternativa abierta y de tamaño medio para tareas multilingües en una región con poca representación en los grandes modelos comerciales, con la ventaja de estar basado en una arquitectura moderna y bien documentada como Qwen3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only Transformer (Qwen3, basado en arquitectura Gemma 3 según documentacion de AI Singapore) |
| Parametros totales | ~32 000 millones |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32 768 tokens |
| Tipos de cuantizacion | No disponibles en este repositorio; el upstream ofrece variantes 8-bit y 4-bit (aisingapore/Qwen-SEA-LION-v4-32B-IT-8BIT y -4BIT) |
| Idiomas soportados | Birmano, ingles, indonesio, jemer, lao, malayo, mandarin, tagalo, tamil, tailandes y vietnamita (11 en total; el continue-pretraining cubrio 7 lenguas SEA) |
| Licencia | MIT |
| Formato de pesos | safetensors (precision no especificada en la model card) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-32B, un transformer decoder-only que, según la documentacion de AI Singapore, emplea la arquitectura Gemma 3. La model card de HuggingFace lo describe simplemente como "Decoder-only Transformer (Qwen3)". Sobre esta base, AI Singapore realizo una continuacion de preentrenamiento con aproximadamente 100 000 millones de tokens extraidos de SEA-Pile v2, un corpus disenado para lenguas del Sudeste Asiatico, cubriendo birmano, indonesio, malayo, tagalo, tamil, tailandes y vietnamita. Posteriormente se aplico un postentrenamiento con unos 8 millones de pares de instruccion (procedentes de fuentes OSS y sinteticas), incluyendo un paso de fusion de modelos (model merging). No se menciona el uso de RLHF ni DPO; el proceso se describe como fine-tuning supervisado.

El tokenizador es el mismo de Qwen3-32B. El modelo hereda de Qwen3 el modo de pensamiento opcional, que permite separar el razonamiento interno de la respuesta final mediante un token especial de fin de bloque de pensamiento (ID 151668).

## Capacidades

- Generacion de texto y chat multilingue con soporte para 11 idiomas, con mejor rendimiento en los 7 que participaron en el continue-pretraining.
- Razonamiento opcional mediante modo thinking (activado con `enable_thinking=True`), que permite al modelo generar cadenas de razonamiento antes de la respuesta final.
- Funciones de llamada a herramientas (function calling) heredadas de Qwen3, utiles para integraciones con APIs y agentes.
- Traduccion automatica entre ingles y las lenguas SEA, asi como entre lenguas SEA entre si.
- Resumen abstractivo y extractivo, respuesta a preguntas, clasificacion de texto y analisis de sentimiento.
- Soporte para tareas de instruccion complejas y generacion de contenido con contexto cultural regional.

## Casos de uso

- Asistentes virtuales multilingues para el Sudeste Asiatico: el modelo puede gestionar conversaciones multi-turno en idiomas como indonesio, tailandes o vietnamita, aprovechando su ventana de 32 768 tokens para mantener el contexto de sesiones largas.
- Traduccion automatica para plataformas de contenido regional: permite traducir articulos, foros o documentacion tecnica entre ingles y las lenguas SEA, con un enfoque culturalmente mas adecuado que los modelos genericos.
- Sistemas de recuperacion aumentada (RAG) sobre contenido local: al estar preentrenado con SEA-Pile v2, comprende mejor las particularidades lexicas y gramaticales de la region, mejorando la calidad de las respuestas generadas a partir de corpus locales.
- Resumen de documentos legales o administrativos en lenguas SEA: su capacidad de resumen abstractivo puede condensar contratos, informes o actas en idiomas como malayo o filipino.
- Analisis de sentimiento en redes sociales: el modelo puede clasificar opiniones en tailandes, tagalo o birmano, util para monitorizacion de marca o estudios de mercado.
- Chatbots de atencion al cliente en empresas con operaciones en la region: soporta function calling, lo que permite conectarlo a sistemas de tickets, bases de conocimiento o APIs de pago.
- Base para fine-tuning en dominios especificos (salud, finanzas, legal) donde se requiera una comprension linguistica SEA solida antes de adaptar a un sector concreto.

## Benchmarks y rendimiento

La model card indica que el modelo upstream fue evaluado en los benchmarks SEA-HELM (que incluye tareas de QA, sentimiento, toxicidad, traduccion, resumen, razonamiento causal, NLI, LINDSEA, Kalahi y Global MMLU Lite), SEA-IFEval (seguimiento de instrucciones) y SEA-MTBench (chat multi-turno juzgado por GPT-4.1). La evaluacion fue zero-shot con prompts en lengua nativa y promediada sobre 8 semillas. Sin embargo, la informacion disponible no incluye los valores numericos de estos benchmarks. No se han publicado resultados cuantitativos en la documentacion consultada.

| Benchmark | Resultado |
|---|---|
| SEA-HELM | No disponible (resultados en leaderboard.sea-lion.ai) |
| SEA-IFEval | No disponible |
| SEA-MTBench | No disponible |

## Requisitos de hardware

- Estimacion de VRAM: en precision FP16/BF16, un modelo de 32B requiere aproximadamente 64 GB de VRAM. Con cuantizacion de 8 bits, unos 32 GB; con 4 bits, entre 16 y 20 GB.
- GPUs recomendadas: para FP16, una A100 80 GB o H100. Para 8 bits, una RTX 4090 (24 GB) o A6000. Para 4 bits, GPUs de consumo con 16-24 GB como RTX 4080 o RTX 3090.
- El repositorio de Scalejade no incluye versiones cuantizadas, pero el upstream ofrece variantes 8-bit y 4-bit compatibles con GPUs de consumo.
- Despliegue: compatible con la libreria transformers (carga con `AutoModelForCausalLM`), y con motores de inferencia como vLLM o TGI al ser un modelo estandar de HuggingFace. No se proporcionan archivos GGUF en este repositorio.
- No se dispone de datos de latencia ni throughput en la informacion consultada.

## Comparativa con modelos similares

El modelo es un fine-tune de Qwen3-32B, por lo que la comparacion mas directa es con su base y con las variantes cuantizadas del mismo modelo.

| Modelo | Parametros | Contexto | Idiomas SEA | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen-SEA-LION-v4-32B-IT (este) | ~32B | 32 768 | 7 en continue-pretraining, 11 soportados | MIT | Especializado en SEA |
| Qwen3-32B (base) | ~32B | 32 768 | No especializado | Apache 2.0 | Modelo general, sin enfoque regional |
| Qwen-SEA-LION-v4-32B-IT-8BIT (upstream) | ~32B | 32 768 | Igual | MIT | Version cuantizada a 8 bits, menor VRAM |

No se dispone de datos comparativos con otros modelos SEA como SeaLLM o modelos comerciales en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo no ha sido alineado en seguridad (safety alignment). No se recomienda su uso directo en aplicaciones donde la seguridad sea critica sin un fine-tuning adicional y filtros de contenido.
- Riesgo de alucinacion y generacion de contenido factualmente incorrecto, como cualquier LLM. No ha sido probado contra ataques adversariales.
- El rendimiento entre los 11 idiomas soportados es desigual: los mejores resultados se obtienen en los 7 idiomas que formaron parte del continue-pretraining (birmano, indonesio, malayo, tagalo, tamil, tailandes y vietnamita). El jemer, lao, mandarin e ingles pueden tener un rendimiento inferior.
- No se recomienda para asesoramiento medico o legal, ni para aplicaciones donde las consecuencias de una alucinacion sean materiales.
- La licencia MIT permite uso comercial, pero el usuario es responsable de validar las salidas y de cumplir con la normativa local de proteccion de datos.
- Este repositorio de Scalejade es una redistribucion sin modificaciones; no se ha realizado entrenamiento adicional sobre los pesos.

## Enlaces

- Repositorio de HuggingFace (Scalejade): https://huggingface.co/scalejade/qwen-sea-lion-v4-32b-it
- Modelo upstream (AI Singapore): https://huggingface.co/aisingapore/Qwen-SEA-LION-v4-32B-IT
- Variante cuantizada 8-bit: https://huggingface.co/aisingapore/Qwen-SEA-LION-v4-32B-IT-8BIT
- Variante cuantizada 4-bit: https://huggingface.co/aisingapore/Qwen-SEA-LION-v4-32B-IT-4BIT
- Documentacion oficial SEA-LION: https://docs.sea-lion.ai/models/sea-lion-v4/qwen-sea-lion-v4-32b
- Blog de anuncio de Qwen-SEA-LION-v4: https://sea-lion.ai/blog/qwen-sea-lion-v4-advanced-reasoning/
- Repositorio GitHub de SEA-LION: https://github.com/aisingapore/sealion/blob/main/models/sea-lion-v4/qwen-sea-lion-v4-32B.md
- Leaderboard de evaluaciones: https://leaderboard.sea-lion.ai/
- Articulo de referencia SEA-HELM: https://arxiv.org/abs/2502.14301
