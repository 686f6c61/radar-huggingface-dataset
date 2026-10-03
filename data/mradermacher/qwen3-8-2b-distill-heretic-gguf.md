# mradermacher/Qwen3.8-2B-Distill-heretic-GGUF

## Resumen

`mradermacher/Qwen3.8-2B-Distill-heretic-GGUF` es una distribucion de cuantizaciones GGUF generada por mradermacher (nethype GmbH) a partir del modelo `htb-ac-1424625/Qwen3.8-2B-Distill-heretic`. No se trata de un modelo entrenado desde cero, sino de una conversion y cuantizacion estatica del checkpoint original en formato HuggingFace, publicada bajo licencia Apache 2.0 y pensada para inferencia local en llama.cpp y derivados.

El modelo subyacente tiene 1.881.825.088 parametros (aproximadamente 1,88 mil millones) y se presenta como un derivado destilado de la familia Qwen3.8, con ajuste fino supervisado (SFT) orientado a razonamiento y function calling. La etiqueta "heretic" junto con "abliterated", "decensored" y "uncensored" indica que se ha aplicado una intervencion de decensurado o abliteracion sobre el modelo original, es decir, la eliminacion o atenuacion de comportamientos de rechazo aprendidos durante el alineamiento.

Su relevancia practica esta en el nicho de despliegue en el borde: al ocupar entre 1,1 GB (Q2_K) y 3,9 GB (f16) en disco, es viable en portatiles, mini-PC y GPUs de gama media o integradas. Sin embargo, la documentacion publicada es minima: no se declara longitud de contexto, composicion del dataset de entrenamiento ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (derivado tipo transformer de la familia Qwen3.8, segun etiquetas del autor) |
| Parametros totales | 1.881.825.088 (dato real de safetensors) |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; mas mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el repositorio base esta en transformers/safetensors) |

## Arquitectura y entrenamiento

La model card de esta publicacion no describe la arquitectura interna ni el proceso de entrenamiento; solo declara que se trata de una cuantizacion estatica (`quantize_version: 2`, `output_tensor_quantised: 1`, `convert_type: hf`) del modelo `htb-ac-1424625/Qwen3.8-2B-Distill-heretic`. Las etiquetas del autor indican destilacion, ajuste fino supervisado (SFT), razonamiento y function calling, ademas del sufijo "heretic", que en la practica de la comunidad designa modelos a los que se ha aplicado una tecnica de abliteracion o decensurado para reducir la tasa de rechazos. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF, DPO u otro metodo de alineamiento.

En el plano de la distribucion, el autor indica que las cuantizaciones ponderadas o con imatrix "parecen no estar disponibles" en el momento de la publicacion, y que solo se ofrecen cuantizaciones estaticas. La presencia de ficheros `mmproj` (proyector multimodal, 0,5 GB en Q8_0 y 0,8 GB en f16) sugiere soporte de entrada de imagenes en llama.cpp, aunque la model card no documenta esa capacidad ni su uso.

## Capacidades

- Generacion de texto conversacional en ingles, con plantilla de chat (etiqueta `conversational`).
- Razonamiento explicito: el autor etiqueta el modelo como `reasoning`, presumiblemente con modos de cadena de pensamiento heredados del modelo base.
- Function calling / tool calling, segun la etiqueta `function-calling`.
- Capacidad multimodal potencial: el repositorio incluye proyectores `mmproj` compatibles con llama.cpp, lo que permitiria entrada de imagenes, aunque no esta documentado.
- Comportamiento decensurado o abliterado: menor tasa de rechazo ante peticiones que un modelo alineado convencional rechazaria.
- Modelo destilado y compacto (1,88B), orientado a despliegue en el borde y a ejecucion en CPU.
- Cobertura multilingue limitada al ingles declarado; no se documentan otros idiomas.

## Casos de uso

- Asistente local en portatil o mini-PC: con la cuantizacion Q4_K_M (1,4 GB) el modelo cabe en memoria unificada de equipos con 8 GB de RAM, lo que permite mantener un asistente conversacional sin conexion y sin coste de API.
- Agentes con function calling en entornos de recursos limitados: el modelo declara soporte de llamadas a funciones, de modo que puede orquestar herramientas (consultas HTTP, lectura de ficheros, calculos) en un bucle de varios pasos ejecutado en local.
- Generacion y autocompletado de codigo en el IDE: al ser un modelo pequeno y rapido en cuantizaciones Q4/Q5, se puede integrar como backend de extensiones tipo Continue o similar para sugerencias de baja latencia en maquina del desarrollador.
- Clasificacion y extraccion de informacion por lotes: procesar grandes volumenes de textos en ingles (tickets, correos, resenas) para extraer campos estructurados, con la ventaja de que la ejecucion en CPU evita costes de inferencia en la nube.
- Resumen y reescritura de documentos con requisitos de privacidad: al ejecutarse integramente en local, es adecuado para resumir contratos, informes medicos o documentacion interna que no puede salir de la organizacion.
- Preprocesado y filtrado dentro de una pipeline mayor: usar el modelo como primer eslabon (normalizacion, deteccion de intencion, generacion de candidatos) antes de llamar a un modelo mayor, aprovechando su tamano reducido para reducir coste y latencia.
- Investigacion sobre alineacion, abliteracion y seguridad: al ser un modelo explicitamente decensurado, resulta util como objeto de estudio para medir el efecto de estas tecnicas sobre la tasa de rechazo, la calidad del texto y la coherencia.
- Prototipado con modelos de razonamiento sin coste de API: permite validar prompts, cadenas de pensamiento y flujos de agente antes de migrarlos a un modelo mayor.
- Descripcion de imagenes en local (condicionado): si se carga el proyector `mmproj` con un runtime compatible, podria emplearse para tareas basicas de captioning o VQA, si bien esta capacidad no esta documentada por el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye tablas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, ni comparaciones con modelos de referencia por parte del autor de la cuantizacion. Tampoco se proporcionan datos de latencia o throughput medidos.

## Requisitos de hardware

- VRAM/RAM estimada de pesos segun el fichero publicado: Q2_K 1,1 GB; Q3_K_S 1,1 GB; Q3_K_M 1,2 GB; Q3_K_L 1,3 GB; IQ4_XS 1,3 GB; Q4_K_S 1,3 GB; Q4_K_M 1,4 GB; Q5_K_S 1,5 GB; Q5_K_M 1,5 GB; Q6_K 1,7 GB; Q8_0 2,1 GB; f16 3,9 GB.
- Presupuesto total aproximado para inferencia (pesos + cache KV + overhead del runtime): en torno a 2 GB con Q4_K_M, 3 GB con Q8_0 y 5 GB con f16, asumiendo contextos moderados. Si se cargan los proyectores multimodales hay que sumar 0,5 GB (mmproj-Q8_0) o 0,8 GB (mmproj-f16).
- GPU compatibles: cualquier GPU con 4 GB o mas de VRAM, incluidas RTX 3050, RTX 3060, RTX 4060 y superiores. Es funcional en GPUs integradas con memoria compartida y en Apple Silicon con memoria unificada.
- Cabe holgadamente en GPU de consumo: si, en todas las cuantizaciones de 8 bits hacia abajo. La version f16 tambien entra en GPUs de 8 GB.
- Despliegue: llama.cpp, llama-cpp-python, Ollama, LM Studio, kobold.cpp y servidores compatibles con GGUF. vLLM soporta GGUF de forma experimental, pero no es la via recomendada para este formato. Transformers puede cargar el modelo base en safetensors, aunque no los ficheros GGUF.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones del autor.

## Comparativa con modelos similares

No se dispone de datos verificables en la informacion proporcionada para establecer una comparativa cuantitativa con alternativas. La model card no incluye referencias a modelos comparables ni resultados de evaluacion.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Datos de rendimiento |
|---|---|---|---|---|---|
| Qwen3.8-2B-Distill-heretic (GGUF de mradermacher) | 1,88B | No disponible | Apache 2.0 | GGUF en HuggingFace, 13 variantes de cuantizacion | No disponible |
| Alternativas de la misma categoria | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Modelo decensurado/abliterado: la intervencion "heretic" reduce los rechazos, por lo que puede generar contenido inapropiado, danino o inseguro. No es apto para produccion orientada a usuarios finales sin una capa de moderacion externa.
- La calidad puede degradarse respecto al modelo original: las tecnicas de abliteracion suelen afectar a la coherencia y a la adherencia a instrucciones en tareas generales.
- Documentacion practicamente inexistente: no se declaran contexto, datos de entrenamiento, idiomas soportados mas alla del ingles ni evaluaciones. Imposible estimar fiabilidad en tareas concretas sin pruebas propias.
- Riesgo de alucinacion elevado y no medido: no hay benchmarks que permitan acotar la tasa de error en tareas factuales.
- Sesgos: no se documentan analisis de sesgo del modelo base ni del proceso de decensurado. La eliminacion de rechazos puede aumentar la exposicion a estereotipos y contenido ofensivo.
- Limitacion idiomatica: solo se declara ingles. El rendimiento en castellano no esta documentado y es previsiblemente bajo en un modelo de 1,88B entrenado en ingles.
- Degradacion por cuantizacion: las variantes Q2_K y Q3_K_S son las mas agresivas y suelen penalizar la coherencia; el autor marca Q3_K_M como "lower quality" y recomienda Q4_K_S y Q4_K_M como punto de equilibrio.
- Ausencia de cuantizaciones ponderadas o con imatrix: no hay variantes calibradas, lo que limita el aprovechamiento de cuantizaciones pequenas.
- Licencia: Apache 2.0 declarada por el autor de la cuantizacion, que la hereda presuntamente del modelo base. No hay verificacion documental en la informacion disponible sobre la procedencia y los derechos del checkpoint original `htb-ac-1424625/Qwen3.8-2B-Distill-heretic`; conviene revisar la model card del modelo base antes de un uso comercial.
- Ambiguedad de nomenclatura: las etiquetas hacen referencia a "Qwen3.5" y "Qwen3.8", terminologia que no se corresponde con documentacion oficial de la familia Qwen incluida en la informacion proporcionada. No debe asumirse equivalencia con modelos oficiales de Alibaba.
- Repositorio con 19,1 GB de tamano total: descargar el repositorio completo es innecesario; conviene bajar solo el fichero de cuantizacion deseado.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen3.8-2B-Distill-heretic-GGUF
- Modelo base: https://huggingface.co/htb-ac-1424625/Qwen3.8-2B-Distill-heretic
- Pagina de resumen y descargas del autor: https://hf.tst.eu/model#Qwen3.8-2B-Distill-heretic-GGUF
- Peticiones de modelos al autor: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafica comparativa de calidad de cuantizaciones de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Sitio del patrocinador (nethype GmbH): https://www.nethype.de/
