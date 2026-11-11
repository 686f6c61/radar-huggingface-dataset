# mradermacher/Primogenitor-V1.1-LLaMa-70B-GGUF

## Resumen

Primogenitor-V1.1-LLaMa-70B-GGUF es la version cuantizada en formato GGUF del modelo Primogenitor-V1.1-LLaMa-70B, publicado por el usuario TareksGraveyard y convertido a GGUF por mradermacher. Se trata de un modelo de lenguaje de gran tamano (70.553.706.560 parametros, aproximadamente 70,5 mil millones) construido sobre la arquitectura LLaMa y derivado de un proceso de fusion (merge) de modelos, segun indican las etiquetas `mergekit` y `merge` de la model card. El modelo base declarado es TareksGraveyard/Primogenitor-V1.1-LLaMa-70B.

La relevancia de esta publicacion es practica: mradermacher proporciona una bateria completa de cuantizaciones estaticas en formato GGUF (desde Q2_K hasta Q8_0), lo que permite ejecutar un modelo de 70B en hardware de consumo mediante llama.cpp y herramientas compatibles, algo inviable con los pesos en precision completa. El repositorio ocupa 481,3 GB e incluye todos los niveles de cuantizacion habituales.

No obstante, la informacion disponible es limitada: no se documentan datos de entrenamiento, composicion del dataset, contexto maximo, resultados de benchmarks ni capacidades especificas mas alla de la etiqueta `conversational`. La licencia declarada es `llama3.3`, lo que vincula el uso a los terminos de la licencia de Llama 3.3, y el unico idioma declarado es el ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaMa (transformer decoder-only); modelo derivado de fusion (mergekit) |
| Parametros totales | 70.553.706.560 (~70,5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | llama3.3 |
| Formato de pesos | GGUF (cuantizaciones estaticas); modelo base en transformers/safetensors |
| Tamano del repositorio | 481,3 GB |
| Descargas | 239 |
| Fecha de creacion | 2025-02-21 |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura LLaMa, un transformer decoder-only con atencion causal, segun se deduce del nombre y de los pesos base. Las etiquetas del repositorio (`mergekit`, `merge`) indican que Primogenitor-V1.1-LLaMa-70B se genero mediante fusion de modelos (model merging) con mergekit, una tecnica que combina los pesos de varios modelos entrenados para obtener un modelo resultante sin entrenamiento adicional. No se especifican en la informacion disponible los modelos de origen de la fusion, la estrategia de merge empleada (SLERP, TIES, DARE, linear, etc.) ni los hiperparametros.

No hay datos publicados sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO, la longitud de contexto nativa ni innovaciones tecnicas como decodificacion especulativa o atencion lineal. La model card del repositorio GGUF es exclusivamente una ficha de cuantizacion: describe los ficheros ofrecidos y remite a la pagina del modelo base para detalles. Las cuantizaciones son estaticas; el autor indica que las cuantizaciones ponderadas/imatrix no estaban disponibles en el momento de la publicacion.

## Capacidades

- Generacion de texto conversacional: la etiqueta `conversational` sugiere un ajuste orientado a dialogo, aunque no se detalla el formato de prompt ni la plantilla de chat.
- Razonamiento y generacion de texto general: capacidades propias de un modelo LLaMa de 70B, sin datos especificos publicados.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma declarada.
- Capacidades especiales (modo thinking, vision, audio): no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue local de un modelo de 70B en hardware de consumo: gracias a las cuantizaciones Q2_K (26,5 GB) y Q3_K_S (31,0 GB), es posible ejecutar el modelo en estaciones de trabajo con 32-48 GB de VRAM o en configuraciones con offloading a RAM mediante llama.cpp.
- Prototipado de chatbots conversacionales en ingles: la etiqueta `conversational` y el tamano del modelo lo hacen adecuado para experimentar con dialogos multi-turno en entornos de investigacion donde no se requiere una licencia permisiva.
- Evaluacion comparativa de tecnicas de merge: al ser un modelo fusionado, sirve como caso de estudio para medir como las fusiones afectan al rendimiento conversacional frente a los modelos de origen.
- Generacion de texto asistida en pipelines offline: con la cuantizacion Q4_K_M (42,6 GB), etiquetada como "fast, recommended", se puede integrar en flujos batch de generacion de contenido en ingles.
- Investigacion sobre cuantizacion: la disponibilidad de once niveles de cuantizacion permite estudiar la degradacion de calidad (perplejidad) entre Q2_K y Q8_0 en un modelo de 70B.
- Fine-tuning ligero o evaluacion academica: el modelo base en transformers permite experimentar con adaptadores, aunque el repositorio GGUF esta pensado para inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion: Q2_K ~26,5 GB; Q3_K_S ~31,0 GB; Q3_K_M ~34,4 GB; Q3_K_L ~37,2 GB; IQ4_XS ~38,4 GB; Q4_K_S ~40,4 GB; Q4_K_M ~42,6 GB; Q5_K_S ~48,8 GB; Q5_K_M ~50,0 GB; Q6_K ~58,0 GB; Q8_0 ~75,1 GB. A estas cifras hay que anadir el espacio para el contexto KV cache.
- GPU recomendadas: para Q4_K_M y superiores, una A100 80 GB o H100 80 GB permite cargar el modelo completo en VRAM. Configuraciones multi-GPU (2x RTX 4090 de 24 GB, 2x A6000 de 48 GB) son viables para cuantizaciones Q4 y Q5 con reparto de capas.
- Cabe en GPU de consumo: si, parcialmente. Una RTX 4090 (24 GB) no puede alojar el modelo completo ni siquiera en Q2_K, pero puede ejecutarlo con offloading parcial a RAM del sistema mediante llama.cpp. Una RTX 3090/4090 con 24 GB y 64 GB de RAM del sistema permite Q4_K_M con rendimiento moderado.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF. El repositorio esta etiquetado como `endpoints_compatible`. No se indica soporte especifico para vLLM o TGI en formato GGUF.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Primogenitor-V1.1-LLaMa-70B-GGUF | ~70,5B | no disponible | llama3.3 | GGUF | Fusion via mergekit; solo ingles; 11 cuantizaciones |
| Llama 3.3 70B Instruct | 70B | 128K (segun documentacion oficial de Meta) | llama3.3 | safetensors, GGUF | Modelo oficial de Meta, ampliamente evaluado |
| Qwen2.5 72B Instruct | 72B | 128K (segun documentacion oficial) | Apache 2.0 | safetensors, GGUF | Licencia permisiva, multilingue |
| DeepSeek-R1-Distill-Llama-70B | 70B | 128K (segun documentacion oficial) | llama3.3 | safetensors, GGUF | Destilado con razonamiento explicito |

La comparacion con Llama 3.3 70B es la mas directa por licencia y arquitectura, pero no hay datos de benchmarks de Primogenitor que permitan establecer una equivalencia de rendimiento. Para el resto de alternativas, los datos de contexto y licencia proceden de su documentacion oficial, no de la informacion proporcionada sobre este modelo.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada del rendimiento del modelo en MMLU, HumanEval, GSM8K ni otras tareas, lo que impide validar su calidad frente a los modelos de origen de la fusion.
- Modelo fusionado sin documentacion de origen: se desconoce que modelos se combinaron y con que estrategia, lo que dificulta reproducir o auditar el resultado.
- Solo ingles: la unica etiqueta de idioma es `en`; el rendimiento en castellano no esta garantizado.
- Licencia llama3.3: el uso comercial esta sujeto a los terminos de la licencia de Llama 3.3, que incluyen restricciones de escala (clausula de 700 millones de usuarios mensuales) y requisitos de atribucion.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de este tamano; no hay evaluaciones de factualidad publicadas.
- Cuantizaciones de baja calidad: Q2_K y Q3_K_M (marcada explicitamente como "lower quality") degradan notablemente la perplejidad; para produccion se recomienda Q4_K_M o superior.
- Sin cuantizaciones imatrix: el autor no ofrece versiones ponderadas, que suelen mejorar la calidad a igual tamano.
- Contexto desconocido: al no documentarse la longitud de contexto nativa, no se puede garantizar el comportamiento en conversaciones largas.
- Repositorio de 481,3 GB: requiere planificar la descarga selectiva de la cuantizacion deseada.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Primogenitor-V1.1-LLaMa-70B-GGUF
- Modelo base: https://huggingface.co/TareksGraveyard/Primogenitor-V1.1-LLaMa-70B
- Pagina de descargas del autor: https://hf.tst.eu/model#Primogenitor-V1.1-LLaMa-70B-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Grafico de perplejidad por cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
