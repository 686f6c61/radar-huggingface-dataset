# richardyoung/Qwen2.5-14B-Instruct-heretic1x-general-GGUF

## Resumen

Qwen2.5-14B-Instruct-heretic1x-general-GGUF es la version cuantizada en formato GGUF de un modelo derivado de Qwen2.5-14B-Instruct al que se le ha aplicado una ablacion direccional de rechazos (abliteration) mediante la herramienta Heretic 1.x (heretic-llm 1.4.0). El autor, Richard J. Young, publica estos archivos como material de investigacion sobre la eliminacion de rechazos en modelos de lenguaje y su evaluacion, no como un asistente de proposito general. El modelo base subyacente es el transformer denso Qwen2.5-14B-Instruct de Alibaba, con 14.770.033.664 parametros totales.

La relevancia de esta publicacion es metodologica: forma parte de un estudio que compara distintas herramientas de abliteration (Heretic 1.x, Heretic 2.0, OBLITERATUS y releases de la comunidad) sobre la familia Qwen2.5 y Qwen2.5-Coder, y argumenta que la regla de seleccion de variantes puede invertir las conclusiones de esas comparativas. El autor reporta que el modelo en precision completa reduce la tasa de rechazo del 77,6% al 58,2% sobre 972 prompts daninos retenidos, medido con el juez WildGuard, con una divergencia KL de 0,0081 respecto al original en el primer token.

El repositorio contiene unicamente builds GGUF para llama.cpp y Ollama, no los pesos en safetensors. Las cuantizaciones publicadas son Q4_K_M (9,0 GB, la predeterminada en Ollama) y Q8_0 (15,7 GB), mas una importance matrix de 17 MB; el autor anuncia IQ3_M, IQ4_XS, Q5_K_M y Q6_K como pendientes. Los numeros del paper corresponden al modelo en bf16 y no a estos archivos cuantizados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen2.5-14B-Instruct); no se detalla la configuracion interna en la informacion disponible |
| Parametros totales | 14.770.033.664 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-14B-Instruct, pero no confirmada en esta ficha) |
| Tipos de cuantizacion | Q4_K_M, Q8_0 (publicadas); IQ3_M, IQ4_XS, Q5_K_M, Q6_K anunciadas como pendientes; importance matrix incluida |
| Idiomas soportados | en (segun la model card y los tags) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); no se publican safetensors en este repositorio |

## Arquitectura y entrenamiento

El modelo es un transformer denso de 14.770 millones de parametros, heredado de Qwen2.5-14B-Instruct. La intervencion aplicada es una ablacion direccional de rango 1 con direcciones de rechazo generales, ejecutada con Heretic 1.x (heretic-llm 1.4.0). No se trata de un reentrenamiento ni de un ajuste fino: se modifican los pesos para suprimir la direccion del espacio de activaciones asociada a la negativa a responder. La regla de seleccion empleada en el paper es la de menos rechazos en el conjunto de desarrollo con una divergencia KL menor o igual a 0,01, sobre 200 ensayos.

Los datos de entrenamiento originales de Qwen2.5-14B-Instruct no se detallan en la informacion proporcionada, ni tampoco si hubo RLHF o DPO en la cadena de alineamiento del modelo base. La informacion disponible tampoco especifica el numero de tokens de preentrenamiento ni la composicion del dataset. La innovacion tecnica destacable es el propio procedimiento de abliteration y su evaluacion: el autor reporta 91 rechazos por palabra clave sobre los 100 prompts de ajuste en el ensayo seleccionado, y una divergencia KL de 0,0081 en el primer token respecto al modelo original.

Los archivos GGUF se construyeron a partir de los safetensors publicados del modelo base (revision 7e457e10d0bd, con verificacion SHA-256 de cada archivo de pesos), convertidos con llama.cpp (commit 468fde9) mediante `convert_hf_to_gguf.py --outtype bf16` y posteriormente `llama-quantize`, todo en CPU. Las cuantizaciones IQ3_M, IQ4_XS, Q4_K_M y Q5_K_M usan la importance matrix (calibration_datav3, 128 fragmentos de 512 tokens, calculada sobre el build Q8_0); Q6_K y Q8_0 son estaticas. Cada archivo Q4_K_M se cargo y respondio a un prompt de prueba antes de la subida.

## Capacidades

- Generacion de texto conversacional en ingles, heredada de Qwen2.5-14B-Instruct.
- Razonamiento y respuesta a instrucciones del modelo base, con la salvedad de que la ablacion puede alterar el comportamiento en dominios sensibles.
- Cumplimiento de solicitudes que el modelo original rechaza: la tasa de rechazo baja del 77,6% al 58,2% en el conjunto de evaluacion del paper (modelo en bf16).
- Soporte de tool calling y function calling: no confirmado en la informacion proporcionada para esta variante.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion proporcionada para esta variante.
- Capacidades multilingues: la model card declara unicamente ingles; no se confirma el resto de idiomas del modelo base.
- Capacidades especiales (vision, audio, modo thinking): no disponibles en la informacion proporcionada.

## Casos de uso

- Investigacion sobre eliminacion de rechazos: el modelo sirve como sujeto de estudio para medir cuanto rechazo se elimina con una tecnica concreta y a que coste en divergencia respecto al original, usando el protocolo del paper (972 prompts retenidos, juez WildGuard).
- Evaluacion comparativa de herramientas de abliteration: permite replicar la comparacion entre Heretic 1.x, Heretic 2.0, OBLITERATUS y releases de la comunidad sobre una misma base Qwen2.5, con la regla de seleccion documentada.
- Estudio de robustez de defensas: al ser un modelo con rechazos parcialmente suprimidos, es util para probar clasificadores de seguridad, filtros de salida y mecanismos de moderacion en un entorno controlado de laboratorio.
- Analisis de cuantizacion y comportamiento: los pares Q4_K_M y Q8_0 permiten estudiar si la cuantizacion altera la tasa de rechazo, cuestion que el propio autor senala como no evaluada en el paper.
- Despliegue local en llama.cpp u Ollama para experimentacion: el archivo Q4_K_M de 9,0 GB permite ejecutar el modelo en una estacion de trabajo con GPU de consumo, sin infraestructura de servidor.
- Docencia y formacion en seguridad de LLM: sirve para ilustrar de forma practica que es la ablacion direccional, como se mide la divergencia KL y por que la eleccion de la regla de seleccion afecta a las conclusiones.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible corresponden al modelo en precision completa (bf16) y miden rechazo, no capacidades generales:

| Metrica | Original | Este modelo |
|---|---|---|
| Rechazo en 972 prompts daninos retenidos (juez WildGuard) | 77,6% | 58,2% (566/972) |
| Rechazos por palabra clave en los 100 prompts de ajuste (ensayo seleccionado) | no disponible | 91 |
| Divergencia KL del primer token respecto al original (ensayo seleccionado) | no disponible | 0,0081 |

No se han publicado resultados de benchmarks de capacidades (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los archivos cuantizados de este repositorio no fueron evaluados en el paper y el autor advierte que la cuantizacion puede modificar el comportamiento de rechazo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 9,0 GB para Q4_K_M y 15,7 GB para Q8_0, mas el overhead de contexto y de la cache KV de llama.cpp.
- GPU recomendadas: no especificadas en la informacion proporcionada. Por tamano, Q8_0 encaja en tarjetas de 24 GB (RTX 3090, RTX 4090) y Q4_K_M en tarjetas de 12-16 GB.
- Cabe en GPU de consumo: si, al menos en las cuantizaciones publicadas; Q4_K_M es la opcion mas viable para equipos de 12 GB o superiores.
- Opciones de despliegue: llama.cpp (`llama-cli -hf ...`) y Ollama (`ollama run richardyoung/qwen2.5-14b-instruct-heretic1x-general`). El tag incluye `endpoints_compatible`, lo que sugiere compatibilidad con endpoints, aunque no se detalla la integracion con vLLM o TGI.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen2.5-14B-Instruct-heretic1x-general-GGUF (este) | 14,77 B | no disponible | Abliteration con Heretic 1.x, cuantizado | apache-2.0 | GGUF |
| Qwen/Qwen2.5-14B-Instruct | 14,77 B | no disponible en esta ficha | Modelo original alineado | apache-2.0 | safetensors, GGUF |
| richardyoung/Qwen2.5-14B-Instruct-heretic1x-general | 14,77 B | no disponible | Mismo modelo en bf16, sin cuantizar | apache-2.0 | safetensors |

No se dispone de datos de benchmarks de capacidades para establecer una comparacion de rendimiento con alternativas. La comparacion relevante es de comportamiento: el modelo original rechaza el 77,6% de los 972 prompts daninos del conjunto de evaluacion, frente al 58,2% de esta variante en bf16.

## Limitaciones y advertencias

- El autor declara explicitamente que el modelo se publica para investigacion sobre abliteration y su evaluacion, no como asistente de proposito general.
- La supresion de rechazos reduce las barreras de seguridad: el modelo cumple muchas solicitudes que el original rechaza, lo que implica riesgo de uso indebido y responsabilidad legal para quien lo despliegue.
- Los numeros de rechazo y divergencia KL corresponden al modelo en bf16; los archivos GGUF de este repositorio no fueron evaluados y la cuantizacion puede alterar el comportamiento de rechazo.
- La ablacion puede degradar capacidades del modelo base en dominios distintos del rechazo; no se han publicado benchmarks que cuantifiquen esa posible perdida.
- Riesgo de alucinacion: no cuantificado en la informacion disponible, pero es una caracteristica conocida de los modelos de esta familia y la intervencion no lo mitiga.
- Idiomas: la model card declara solo ingles; el soporte multilingue del modelo base no se confirma para esta variante.
- Longitud de contexto: no confirmada en la informacion proporcionada para esta variante.
- Licencia apache-2.0, que permite uso comercial, pero el autor remite a las restricciones de uso del modelo fuente y a la responsabilidad del usuario sobre la legalidad del uso.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/richardyoung/Qwen2.5-14B-Instruct-heretic1x-general-GGUF
- Modelo base en bf16: https://huggingface.co/richardyoung/Qwen2.5-14B-Instruct-heretic1x-general
- Modelo original: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct
- Licencia del modelo fuente: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct/blob/main/LICENSE
- Paper citado: Young, Richard J. "The Selection Rule Can Reverse LLM Abliteration Tool Comparisons: Heretic 1.x, Heretic 2.0, OBLITERATUS and Community Releases on Qwen2.5 and Qwen2.5-Coder" (enlace arXiv pendiente de publicacion segun la model card)
- Herramienta Heretic (heretic-llm 1.4.0): no disponible enlace directo en la informacion proporcionada
- llama.cpp: no disponible enlace directo en la informacion proporcionada
