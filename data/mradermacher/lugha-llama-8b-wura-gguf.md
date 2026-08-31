# mradermacher/Lugha-Llama-8B-wura-GGUF

## Resumen

Lugha-Llama-8B-wura es un modelo de lenguaje de 8 mil millones de parámetros desarrollado por Lugha-Models, un proyecto del grupo de investigación de Princeton, con el objetivo de adaptar grandes modelos multilingües a las lenguas africanas. El modelo parte de la arquitectura Llama 3.1 y se somete a un preentrenamiento continuo sobre el corpus WURA, compuesto por 10 mil millones de tokens de texto africano, lo que le permite superar al modelo base en tareas de comprensión lectora y respuesta a preguntas multilingües, como se reporta en el paper de referencia. Esta versión en GGUF, cuantizada por mradermacher, ofrece una gama de cuantizaciones que facilitan su ejecución en hardware de consumo, lo que la hace especialmente útil para desarrolladores que necesitan desplegar el modelo en entornos con recursos limitados.

La relevancia de esta ficha radica en que, aunque el modelo original está disponible en formato safetensors, la versión GGUF permite su uso con herramientas como llama.cpp, Ollama o LM Studio, ampliando su accesibilidad. Al estar adaptado específicamente para lenguas africanas, cubre un nicho importante en el ecosistema de modelos open source, donde la representación de estas lenguas es escasa. El modelo se distribuye bajo licencia Llama 3.1, lo que permite uso comercial con las restricciones establecidas por Meta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Llama 3.1, inferido de la licencia y el nombre) |
| Parametros totales | 8.030.261.312 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Ingles (segun model card); el paper indica adaptacion a lenguas africanas |
| Licencia | llama3.1 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base es Lugha-Llama-8B-wura, creado por Lugha-Models. Segun el paper "Lugha-Llama: Adapting Large Language Models for African Languages", se trata de una adaptacion de un modelo Llama 3.1 de 8 mil millones de parametros mediante preentrenamiento continuo sobre el corpus WURA, que contiene 10 mil millones de tokens de texto en diversas lenguas africanas. El proceso de entrenamiento se realizo sobre el modelo base ya preentrenado, sin modificaciones arquitectonicas sustanciales, y se opto por un enfoque de continuacion del preentrenamiento en lugar de un ajuste fino supervisado, lo que permite conservar las capacidades generales del modelo original mientras se incorpora conocimiento especifico de las lenguas objetivo.

La version GGUF aqui descrita es una cuantizacion estatica realizada por mradermacher, que convierte los pesos originales en formato GGUF para su uso con motores de inferencia basados en llama.cpp. No se han publicado detalles adicionales sobre el proceso de cuantizacion ni sobre el uso de imatrix, aunque existe una variante con imatrix en el repositorio hermano.

## Capacidades

- Generacion de texto y respuesta a preguntas en lenguas africanas, con mejora documentada en tareas de QA multilingue (AfriQA) frente al modelo base.
- Comprension lectora y razonamiento sobre texto en ingles, heredadas de la base Llama 3.1.
- Soporte multilingue limitado a las lenguas incluidas en el corpus WURA; la lista exacta no se detalla en la informacion disponible.
- No se mencionan capacidades de tool calling, agentes, vision ni audio en la documentacion consultada.
- El modelo es denso, sin arquitectura MoE, y no presenta modo de razonamiento explicito (thinking mode) documentado.

## Casos de uso

- Desarrollo de asistentes conversacionales en lenguas africanas: el modelo puede gestionar dialogos en idiomas como suajili, yoruba o hausa, gracias a su entrenamiento especifico, y puede integrarse en aplicaciones de chat mediante APIs compatibles con GGUF.
- Sistemas de respuesta a preguntas (QA) sobre documentos locales: al mejorar en el benchmark AfriQA, es adecuado para extraer informacion de textos en lenguas africanas, por ejemplo en servicios de atencion al ciudadano o educativos.
- Traduccion automatica asistida: aunque no esta optimizado exclusivamente para traduccion, su conocimiento bilingue (ingles y lenguas africanas) permite usarlo como base para sistemas de traduccion con post-edicion.
- Generacion de contenido localizado: redaccion de noticias, articulos o material educativo en lenguas africanas, donde los modelos generales suelen fallar por falta de datos.
- Investigacion academica en PLN multilingue: sirve como punto de partida para estudios sobre transferencia de conocimiento entre lenguas de bajos recursos, dado su tamano y la documentacion publica del entrenamiento.
- Despliegue en entornos con hardware limitado: gracias a las cuantizaciones GGUF, puede ejecutarse en portatiles con 8 GB de RAM o GPUs de gama media, lo que facilita prototipado rapido en organizaciones sin infraestructura de servidores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion proporcionada para esta version GGUF. Sin embargo, el paper original reporta que Lugha-Llama-8B-wura supera al modelo base en mas de un 10% en el benchmark AfriQA, y que consistentemente mejora a otros modelos centrados en Africa de tamano similar. No se incluyen cifras exactas en los materiales consultados.

## Requisitos de hardware

- VRAM estimada para inferencia: los tamaños de archivo GGUF oscilan entre 3,3 GB (Q2_K) y 16,2 GB (f16). Una cuantizacion Q4_K_M (5,0 GB) puede ejecutarse en GPUs con 8 GB de VRAM, como la RTX 3060 o RTX 4060.
- GPUs recomendadas: para cuantizaciones bajas (Q4_K_M o inferiores), una RTX 3060 de 12 GB o RTX 4070 es suficiente; para Q8_0 o f16 se recomienda al menos 16 GB de VRAM (RTX 4080, RTX 4090, A100).
- Compatibilidad con consumer GPU: si, en las cuantizaciones Q4_K_M y menores, cabe en GPUs de 8 GB de VRAM con uso de CPU para el contexto.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, GPT4All, y servidores compatibles con GGUF como llama-cpp-python o llamafile.
- Latencia y throughput: no se han publicado mediciones especificas para este modelo; dependen de la cuantizacion y del hardware. Como referencia, un modelo de 8B en Q4_K_M suele generar entre 20 y 40 tokens por segundo en una RTX 4090.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Lugha-Llama-8B-wura (GGUF) | 8.03B | No disponible | llama3.1 | GGUF | Adaptado a lenguas africanas |
| Llama 3.1 8B (base) | 8.03B | 128K (segun documentacion de Meta) | llama3.1 | safetensors | Modelo general, sin adaptacion africana |
| AfriTeVA (ejemplo de modelo africano) | No disponible | No disponible | No disponible | No disponible | Otros modelos africanos de tamano similar, pero sin datos concretos en esta ficha |

La comparativa se basa en informacion publica; los datos de contexto y rendimiento de los modelos alternativos no estan disponibles en las fuentes consultadas.

## Limitaciones y advertencias

- El modelo esta entrenado principalmente con datos en ingles y lenguas africanas del corpus WURA; su rendimiento en otras lenguas puede ser deficiente.
- No se han documentado sesgos especificos, pero al ser una adaptacion de Llama 3.1, hereda los sesgos potenciales del modelo base, especialmente en generacion de contenido estereotipado.
- Riesgo de alucinacion presente, como en todos los modelos de lenguaje; se recomienda validacion humana en aplicaciones criticas.
- La longitud de contexto no esta especificada en la informacion disponible; se desconoce si el preentrenamiento continuo altero la ventana de contexto original de Llama 3.1.
- La licencia llama3.1 impone restricciones de uso comercial; es necesario revisar los terminos de Meta antes de desplegar el modelo en produccion.
- La cuantizacion puede degradar ligeramente la calidad respecto al modelo en precision completa; se recomienda probar varias cuantizaciones para equilibrar rendimiento y fidelidad.

## Enlaces

- Repositorio GGUF en Hugging Face: https://huggingface.co/mradermacher/Lugha-Llama-8B-wura-GGUF
- Modelo base en Hugging Face: https://huggingface.co/Lugha-Models/Lugha-Llama-8B-wura
- Paper en arXiv: https://arxiv.org/html/2504.06536v1
- Blog de Princeton AI: https://blog.ai.princeton.edu/2025/04/22/lugha-llama-adapting-large-language-models-for-african-languages/
- Pagina de inferencia en FriendliAI: https://friendli.ai/models/Lugha-Models/Lugha-Llama-8B-wura
