# mradermacher/Llama-3-Youko-Minus-Base-GGUF

## Resumen

Llama-3-Youko-Minus-Base-GGUF es la version cuantizada en formato GGUF del modelo Cas-Warehouse/Llama-3-Youko-Minus-Base, un merge de modelos construido con mergekit sobre la arquitectura Llama 3. El trabajo de cuantizacion lo firma mradermacher, un publicador habitual de cuantizaciones GGUF para la comunidad de inferencia local, y esta pensado para su uso con llama.cpp y derivados (Ollama, LM Studio, etc.) en lugar de con la pila de transformers.

El modelo subyacente es un merge de aproximadamente 8.030 millones de parametros (8B), lo que lo situa en la categoria de modelos densos de gama media-alta para ejecucion en hardware de consumo. La model card no documenta el proceso de merge, los modelos de origen ni los datos de entrenamiento, por lo que la trazabilidad tecnica es limitada: se trata de un artefacto derivado cuyo comportamiento depende enteramente del modelo base publicado por Cas-Warehouse.

La relevancia de esta ficha es practica: ofrece un conjunto completo de cuantizaciones estaticas (de Q2_K a f16) que permiten desplegar un modelo de 8B en un rango de VRAM que va desde unos 3,3 GB hasta 16,2 GB, con lo que se cubre desde portatiles con GPU modesta hasta estaciones de trabajo. No obstante, al no haber benchmarks publicados ni documentacion del merge, su adopcion en produccion exige una evaluacion empirica propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Llama 3, segun el nombre y el modelo base) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base es un merge generado con mergekit, segun las etiquetas del repositorio (`mergekit`, `merge`). No se especifica en la informacion disponible que tecnica de merge se empleo (SLERP, TIES, DARE, passthrough, model stock, etc.), ni que modelos se combinaron, ni los hiperparametros del merge. Tampoco se documenta si hubo entrenamiento posterior, ajuste fino, RLHF o DPO tras la fusion. Por el nombre y el recuento de parametros, la arquitectura subyacente corresponde a un transformer denso de la familia Llama 3 con aproximadamente 8B de parametros, pero no se confirma en la model card la configuracion exacta de capas, cabezas de atencion ni dimension del estado oculto.

La aportacion tecnica de este repositorio concreto es la cuantizacion: mradermacher ha generado cuantizaciones estaticas en formato GGUF (sin variantes imatrix ni ponderadas, segun indica el propio autor). La model card advierte explicitamente de que las cuantizaciones ponderadas o con imatrix "no parecen estar disponibles por mi parte en este momento", por lo que no deben esperarse mejoras de calidad derivadas de calibracion con datos. El proceso de cuantizacion se realizo con `quantize_version: 2` y `output_tensor_quantised: 1`, segun los metadatos comentados del README.

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta `conversational` del repositorio.
- Razonamiento general y respuesta a instrucciones, heredado del modelo base (no verificado con benchmarks).
- Compatibilidad con endpoints (`endpoints_compatible`), lo que permite servirlo mediante infraestructura de inferencia estandar.
- Ejecucion en llama.cpp y derivados gracias al formato GGUF, con soporte de offloading parcial a CPU.
- Capacidades multilingues limitadas: el unico idioma declarado es el ingles.
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio ni modo de razonamiento extendido (thinking). No disponible.

## Casos de uso

- Prototipado local de asistentes conversacionales en ingles: con la cuantizacion Q4_K_M (5,0 GB) el modelo cabe en GPUs de consumo de 8 GB y permite iterar sobre prompts y flujos conversacionales sin coste de API.
- Despliegue en portatiles con GPU modesta: la variante Q2_K (3,3 GB) o Q3_K_S (3,8 GB) permite ejecutar el modelo en equipos con 4-6 GB de VRAM, util para demos offline y pruebas de concepto.
- Evaluacion comparativa de merges: al ser un merge de Llama 3, sirve como punto de comparacion frente al Llama 3 base en tareas de generacion en ingles, siempre que se realice una evaluacion propia al no haber benchmarks publicados.
- Generacion de texto por lotes en CPU: las cuantizaciones bajas permiten procesar volumenes moderados de texto en servidores sin GPU mediante llama.cpp, con throughput limitado pero sin dependencia de hardware especializado.
- Integracion en pipelines de inferencia autoalojados: la etiqueta `endpoints_compatible` y el formato GGUF facilitan su despliegue en soluciones como llama.cpp server u Ollama para entornos con requisitos de soberania de datos.
- Experimentacion educativa con cuantizacion: el rango completo de cuantizaciones (de Q2_K a f16) permite estudiar el impacto de la precision en la calidad de salida sobre un mismo modelo de 8B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (peso de los pesos, sin contar cache KV): Q2_K 3,3 GB; Q3_K_S 3,8 GB; Q3_K_M 4,1 GB; Q3_K_L 4,4 GB; IQ4_XS 4,6 GB; Q4_K_S 4,8 GB; Q4_K_M 5,0 GB; Q5_K_S 5,7 GB; Q5_K_M 5,8 GB; Q6_K 6,7 GB; Q8_0 8,6 GB; f16 16,2 GB.
- GPU recomendadas: para Q4_K_M y superiores, una RTX 3060/4060 Ti de 8 GB o superior es suficiente para los pesos; para f16 se recomienda una RTX 4090 (24 GB) o una A100/H100 si se busca margen para contexto largo y concurrencia.
- Cabe en GPU de consumo: si, en todas las cuantizaciones hasta Q8_0 con GPUs de 8-12 GB; f16 requiere 16 GB o mas de VRAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama.cpp server y cualquier runtime compatible con GGUF. No se recomienda su uso directo con vLLM o TGI sin conversion previa a safetensors.
- Latencia y throughput estimados: no disponible (no se han publicado mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Llama-3-Youko-Minus-Base-GGUF (este) | 8,03B | no disponible | GGUF | no disponible | Merge cuantizado por mradermacher |
| Llama 3 8B Instruct (Meta) | 8,03B | 8.192 tokens | safetensors, GGUF | Llama 3 Community License | Modelo original con benchmarks publicos |
| Mistral 7B Instruct | 7,24B | 32.768 tokens | safetensors, GGUF | Apache 2.0 | Alternativa con contexto mayor y licencia permisiva |
| Qwen2.5 7B Instruct | 7,62B | 32.768 tokens (128K en variantes ampliadas) | safetensors, GGUF | Apache 2.0 (mayoria de variantes) | Multilingue y con benchmarks publicados |

La comparacion con Llama 3 8B es la mas directa por recuento de parametros y familia arquitectonica, pero este merge no publica resultados que permitan afirmar mejoras sobre el modelo original. Frente a Mistral 7B y Qwen2.5 7B, la diferencia clave es la falta de documentacion de licencia y de contexto, lo que penaliza su adopcion frente a alternativas con licencia Apache 2.0 y contexto documentado.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; debe verificarse en el repositorio del modelo base (Cas-Warehouse/Llama-3-Youko-Minus-Base) antes de cualquier despliegue productivo.
- Trazabilidad limitada: al ser un merge sin documentacion de los modelos de origen ni del metodo de fusion, no es posible auditar sesgos ni procedencia de los datos de entrenamiento.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad; al tratarse de un merge sin ajuste fino documentado, el riesgo de respuestas inventadas es el propio de un modelo base no verificado.
- Idioma: solo se declara ingles; el rendimiento en castellano no esta garantizado y probablemente sea degradado.
- Contexto desconocido: no se documenta la longitud de ventana, lo que impide planificar casos de uso con documentos largos.
- Cuantizaciones estaticas unicamente: no hay variantes imatrix, por lo que las cuantizaciones de baja precision (Q2_K, Q3_K_S) pueden degradar la calidad mas de lo habitual en cuantizaciones calibradas.
- Advertencia de la model card: el autor senala que las cuantizaciones ponderadas o imatrix "no parecen estar disponibles por mi parte en este momento"; no deben asumirse mejoras de calidad por calibracion.
- Baja adopcion: 13 descargas y 1 like en el momento de la consulta, lo que reduce la probabilidad de encontrar reportes de la comunidad sobre su comportamiento real.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Llama-3-Youko-Minus-Base-GGUF
- Modelo base: https://huggingface.co/Cas-Warehouse/Llama-3-Youko-Minus-Base
- Pagina de conveniencia del autor para este modelo: https://hf.tst.eu/model#Llama-3-Youko-Minus-Base-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Repositorio de peticiones de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Empresa del autor: https://www.nethype.de/
