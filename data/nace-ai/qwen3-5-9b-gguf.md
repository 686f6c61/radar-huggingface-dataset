# nace-ai/Qwen3.5-9B-GGUF

## Resumen

nace-ai/Qwen3.5-9B-GGUF es una coleccion de cuantizaciones GGUF del modelo base Qwen/Qwen3.5-9B, publicada por el usuario nace-ai. El modelo original lo desarrolla el equipo Qwen (Alibaba), mientras que esta publicacion se limita a ofrecer pesos cuantizados optimizados para inferencia local con llama.cpp, LM Studio y Ollama. El repositorio incluye doce variantes que van desde 3,36 GB hasta 6,84 GB de pesos del modelo de lenguaje, cubriendo desde ~2,1 hasta ~8,5 bits por peso.

La relevancia de esta publicacion radica en su enfoque metodologico: el autor reporta metricas de divergencia KL frente al modelo BF16 para cada fichero, comparandolas con cuantizaciones de otros publicadores (bartowski, Unsloth, byteshape) en rangos de tamano equivalentes. Segun la model card, sus ficheros presentan menor KL medio que alternativas de tamano igual o superior en la mayoria de comparaciones directas, lo que sugiere una mejor preservacion del comportamiento del modelo original por byte almacenado.

El modelo base cuenta con 8.953.803.264 parametros (aproximadamente 9B) y esta orientado a generacion de texto conversacional. La licencia Apache 2.0 del modelo base se mantiene en esta redistribucion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3.5-9B; arquitectura no detallada en la informacion proporcionada) |
| Parametros totales | 8.953.803.264 (~8,95B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | hasta 128K tokens (se reportan evaluaciones KL a 128K; contexto maximo del modelo base no confirmado en la informacion) |
| Tipos de cuantizacion | IQ2_M, IQ3_XXS, IQ3_M, IQ4_XS (varias tallas), Q4_0, Q3_K_XL, Q4_K_M, Q5_K_S, Q6_K; mezclas de tensores de 2,1 a 8,5 bits por peso |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors para el modelo base original) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base Qwen3.5-9B en la documentacion proporcionada; la model card de esta publicacion se centra exclusivamente en el proceso de cuantizacion. Se sabe que el modelo base tiene 8.953.803.264 parametros y que esta orientado a generacion de texto conversacional, con soporte aparente para contexto largo (las evaluaciones se realizan a 128K tokens) y para tool calling (los datos de prueba incluyen "chat and tool-call data").

El trabajo de esta publicacion consiste en generar cuantizaciones GGUF mixtas: cada fichero combina tipos de tensor de distinto rango (por ejemplo, IQ2_M es 90% IQ3_XXS, 7% IQ2_XXS y 3% otros tipos; Q3_K_XL es 69% IQ4_XS, 16% Q5_K, 14% IQ3_XXS y 1% otros). El autor evalua cada fichero calculando la divergencia KL media y p99.9 frente al modelo BF16, junto con la precision top-1 (coincidencia del token mas probable), sobre ventanas de 512 y 128K tokens. El conjunto de prueba incluye articulos de Wikipedia en ingles, datos de chat y tool-calls, y codigo de GitHub, todos posteriores al 2026-09-20 para evitar contaminacion. Se emplea la misma build de llama.cpp (0a94a3f2) para todos los ficheros comparados.

## Capacidades

- Generacion de texto conversacional multi-turno.
- Soporte de tool calling / function calling (los datos de evaluacion incluyen turnos de usuario, asistente y herramienta).
- Manejo de contexto largo, con evaluaciones realizadas hasta 128K tokens.
- Capacidad de generacion de codigo (se evalua KL especificamente sobre codigo de GitHub).
- Capacidades multilingues: no confirmadas en la informacion disponible.
- Vision: los pesos de vision se excluyen de los calculos de tamano ("vision and MTP excluded"), lo que sugiere que el modelo base podria incluir componentes multimodales o MTP, aunque no se detalla su funcionalidad.
- Modo "thinking" o razonamiento extendido: no confirmado en la informacion disponible.

## Casos de uso

- Despliegue local en estaciones de trabajo: con la variante IQ4_XS (5,06 GB, KL medio 0,075) se puede ejecutar el modelo en una GPU consumer con 8-12 GB de VRAM, manteniendo una fidelidad alta respecto al BF16, adecuado para prototipado y desarrollo offline.
- Asistentes conversacionales en produccion con restricciones de memoria: IQ3_M (4,39 GB) ofrece un equilibrio razonable entre calidad (KL 0,134) y huella, valido para servicios de chat con contexto moderado.
- Generacion de codigo asistida: la variante Q3_K_XL mantiene KL 0,041 sobre codigo a 128K tokens, lo que la hace apropiada para autocompletado y revision de codigo en entornos con recursos limitados.
- Procesamiento de documentos largos: gracias al contexto de 128K tokens, se pueden analizar contratos, informes o bases de codigo extensas en una sola pasada, usando cuantizaciones Q4_K_M o superiores para minimizar la degradacion.
- Integracion en pipelines de agentes con tool calling: el modelo soporta turnos de herramienta, por lo que puede orquestar llamadas a APIs en flujos multi-paso, desplegado via llama.cpp u Ollama.
- Experimentacion e investigacion: la tabla de KL por fichero permite a investigadores seleccionar la cuantizacion optima para su presupuesto de memoria y contexto, con datos reproducibles de divergencia frente al BF16.
- Despliegue en CPU o hardware sin GPU dedicada: las variantes IQ2_M (3,36 GB) y IQ3_XXS (3,78 GB) permiten ejecucion en CPU con RAM suficiente, utiles para entornos de borde o pruebas.

## Benchmarks y rendimiento

La model card no incluye benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.). Proporciona, en cambio, metricas de fidelidad de cuantizacion (divergencia KL frente al BF16 y precision top-1) a 512 y 128K tokens.

| Fichero | LM GB | Mean KL (512) | p99.9 KL (512) | Top-1 % (512) | Mean KL chat 128K | Mean KL code 128K | Mean KL prose 128K |
|---|---:|---:|---:|---:|---:|---:|---:|
| IQ2_M | 3,36 | 0,238 | 14,890 | 83,0 | 1,300 | 0,142 | 0,401 |
| IQ3_XXS | 3,78 | 0,178 | 15,644 | 87,2 | no disponible | no disponible | no disponible |
| IQ4_XS-4.1GB | 4,13 | 0,155 | 14,761 | 86,6 | no disponible | no disponible | no disponible |
| IQ3_M | 4,39 | 0,134 | 14,399 | 87,9 | 1,051 | 0,074 | 0,235 |
| Q4_0-4.6GB | 4,60 | 0,118 | 15,024 | 89,0 | no disponible | no disponible | no disponible |
| Q3_K_XL | 4,70 | 0,095 | 12,879 | 92,4 | 0,846 | 0,041 | no disponible |
| IQ4_XS | 5,06 | 0,075 | 12,889 | 93,7 | no disponible | no disponible | no disponible |
| IQ4_XS-5.2GB | 5,16 | 0,063 | 11,830 | 94,6 | no disponible | no disponible | no disponible |
| IQ4_XS-5.5GB | 5,30 | 0,059 | 11,580 | 94,7 | no disponible | no disponible | no disponible |
| Q4_K_M-6.2GB | 5,90 | 0,053 | 11,428 | 95,4 | no disponible | no disponible | no disponible |
| Q5_K_S-6.3GB | 6,29 | 0,038 | 9,791 | 96,8 | no disponible | no disponible | no disponible |
| Q6_K-7.1GB | 6,84 | 0,034 | 9,495 | 97,2 | no disponible | no disponible | no disponible |

Comparaciones directas reportadas por el autor (a 512 tokens):

| Fichero Nace | Baseline | Baseline GB / KL | Diferencia KL (IC 95%) |
|---|---|---|---|
| IQ2_M (3,36 GB, 0,238) | bartowski IQ2_S | 3,47 / 0,372 | −0,134 (−0,156 a −0,115) |
| IQ3_M (4,39 GB, 0,134) | bartowski IQ3_XS | 4,55 / 0,147 | −0,013 (−0,028 a −0,003) |
| Q3_K_XL (4,70 GB, 0,095) | bartowski IQ3_M | 4,71 / 0,142 | −0,047 (−0,062 a −0,035) |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente igual al tamano del fichero mas overhead de contexto KV. Para IQ2_M (~3,4 GB) se necesitan unos 5-6 GB con contexto moderado; para Q6_K (~6,8 GB) unos 9-11 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4070/4080, RTX 4090 para las variantes mayores; A100/H100 para despliegues con contexto de 128K y concurrencia alta.
- Cabe en GPU consumer: si. IQ2_M, IQ3_XXS e IQ3_M caben en GPUs de 6-8 GB; IQ4_XS y Q4_K_M en GPUs de 8-12 GB; Q6_K requiere 12 GB o mas.
- Opciones de despliegue: llama.cpp (build 0a94a3f2 usada para las evaluaciones), LM Studio, Ollama. Para servidores de alto throughput, vLLM y TGI no consumen GGUF de forma nativa; seria necesario usar el modelo base en safetensors.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| nace-ai/Qwen3.5-9B-GGUF | ~8,95B | hasta 128K (evaluado) | Apache 2.0 | GGUF | Cuantizaciones con KL reportado y comparado |
| bartowski Qwen3.5-9B GGUF | ~8,95B | no disponible | Apache 2.0 | GGUF | Referencia de comparacion; KL superior en tamanos equivalentes segun el autor |
| Unsloth Qwen3.5-9B GGUF | ~8,95B | no disponible | Apache 2.0 | GGUF | Q3_K_S (4,31 GB) y Q3_K_M (4,66 GB) citados como baseline |
| byteshape Qwen3.5-9B GGUF | ~8,95B | no disponible | Apache 2.0 | GGUF | IQ3_S-3.00bpw (3,36 GB) y Q4_K_S-3.92bpw (4,39 GB) citados como baseline |

## Limitaciones y advertencias

- Las metricas de KL y top-1 miden fidelidad respecto al BF16, no calidad absoluta en tareas; un KL bajo no garantiza buen rendimiento en razonamiento o codigo.
- Las evaluaciones se limitan a texto en ingles (Wikipedia en ingles, chat/tool-calls y codigo de GitHub); el comportamiento en castellano u otros idiomas no esta verificado.
- La cuantizacion IQ2_M presenta un KL medio de 1,300 en chat/tool-calls a 128K, muy superior al de 512 tokens (0,238), lo que indica degradacion notable en contextos largos conversacionales.
- Riesgo de alucinacion inherente al modelo base; no se documentan mitigaciones especificas.
- Sesgos del modelo base no documentados en la informacion disponible.
- La licencia Apache 2.0 permite uso comercial, pero el autor de esta redistribucion no ofrece garantias sobre el rendimiento en produccion.
- El repositorio ocupa 66,8 GB en total; descargar todas las variantes requiere espacio considerable.
- No se proporcionan datos sobre latencia, throughput ni consumo energetico.
- El modelo base Qwen3.5-9B no esta documentado en detalle en esta ficha; para arquitectura y entrenamiento conviene consultar la model card original.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nace-ai/Qwen3.5-9B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- llama.cpp (build de referencia 0a94a3f2): no disponible como enlace directo en la informacion
- Otros publicadores citados: bartowski, Unsloth, byteshape (URLs no proporcionadas en la informacion)
