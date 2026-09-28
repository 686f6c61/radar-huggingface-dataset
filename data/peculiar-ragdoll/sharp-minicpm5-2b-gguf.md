# peculiar-ragdoll/Sharp-MiniCPM5-2B-GGUF

## Resumen

Sharp-MiniCPM5-2B-GGUF es una coleccion de cuantizaciones GGUF del modelo openbmb/MiniCPM5-2B, publicada por el usuario peculiar-ragdoll. El modelo base es un transformer denso de 2,52 mil millones de parametros desarrollado por OpenBMB, disenado para despliegue en dispositivo y entornos con recursos limitados, con una ventana de contexto nativa de 131.072 tokens y un foco declarado en razonamiento de codigo, matematicas, comprension de contexto largo, uso de herramientas y tareas de agente.

Esta publicacion no es un modelo nuevo, sino una receta de cuantizacion: aplica una matriz de importancia (imatrix) ponderada hacia ciberseguridad y codigo, una politica de cuantizacion por tensor de estilo unsloth-dynamic y una plantilla de chat propia denominada Sharp-MiniCPM, que corrige seis defectos de la plantilla original y anade un system prompt mas conciso. El autor reporta que el modelo tolera la cuantizacion mejor que alternativas mayores, con perdidas de divergencia KL entre 3 y 7 veces menores que las de su Sharp-Spark-X2.5-4B en cada nivel.

Su relevancia practica esta en el binomio tamano-contexto: un modelo de 2,52B con 131k de contexto que cabe en tarjetas de 4 a 8 GB de VRAM segun el nivel de cuantizacion elegido, lo que habilita despliegues locales de agentes de codigo y asistentes de contexto largo sin GPU de datacenter.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (LlamaForCausalLM), 42 capas de atencion completa |
| Parametros totales | 2.516.756.480 (~2,52B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 131.072 tokens (nativo) |
| Tipos de cuantizacion | Q4_K_S (1,52 GB), Q4_K_XL (1,60 GB), Q5_K_XL (1,89 GB), Q6_K_XL (2,20 GB), Q8_K_M (2,93 GB) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (para llama.cpp) |
| Modelo base | openbmb/MiniCPM5-2B |
| Tamano del repositorio | 10,1 GB |
| Numero de cabezas | 16 de atencion, 2 KV (GQA 8:1), head_dim 128 |
| KV cache | 42 KB/token en f16, 22,3 KB/token en q8_0 |

## Arquitectura y entrenamiento

El modelo base es un transformer denso con arquitectura `llama` estandar, por lo que cualquier build reciente de llama.cpp lo convierte y ejecuta sin compilaciones personalizadas. Cuenta con 42 capas, todas con atencion completa (no hay sliding-window attention), lo que implica que cada capa mantiene una cache KV de longitud completa. La atencion usa GQA con una relacion 8:1 (16 cabezas de consulta, 2 cabezas KV, head_dim 128). Las embeddings de entrada y la proyeccion de salida estan desacopladas (untied): `token_embd.weight` y `output.weight` son tensores separados que representan el 10,6% de los parametros cada uno. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en la informacion proporcionada.

La innovacion de esta publicacion reside en la receta de cuantizacion. Se aplica una imatrix ponderada hacia codigo y ciberseguridad, y una politica por tensor que fija alto `output.weight` en todos los niveles mientras deja caer `token_embd.weight`, que es donde se concentra el ahorro en los niveles bajos. Como GQA hace que `attn_k` y `attn_v` representen solo el 0,9% de los parametros cada uno, todos los niveles elevan ambos tensores por un coste aproximado de 11 MB en las 42 capas. La plantilla Sharp-MiniCPM repara seis defectos de la plantilla original y conserva las convenciones del modelo base: tokens de control propios, convencion `<think>` y formato XML `<function>`/`<param>` para llamadas a herramientas, que llama.cpp traduce a `tool_calls` de estilo OpenAI con la opcion `--jinja`.

## Capacidades

- Generacion de texto conversacional orientada a asistentes multi-turno.
- Razonamiento de codigo y matematicas, segun lo declarado por OpenBMB para la serie MiniCPM5.
- Comprension de contexto largo, con soporte nativo de hasta 131.072 tokens.
- Tool calling / function calling mediante formato XML propio embebido en la plantilla, expuesto como `tool_calls` de OpenAI en llama.cpp.
- Uso en tareas de agente y razonamiento multi-paso (la serie MiniCPM5 declara capacidades de agente).
- Modo de pensamiento mediante la convencion `<think>`.
- Capacidades multilingues: no disponible.
- No se declaran capacidades de vision ni audio en la informacion disponible.

## Casos de uso

- Asistente de codigo en local: el modelo puede integrarse en un editor o IDE mediante llama.cpp y atender conversaciones multi-turno sobre un repositorio completo gracias a los 131k tokens de contexto, sin enviar codigo a servicios externos.
- Agente de resolucion de incidencias de software: la plantilla expone llamadas a herramientas en formato OpenAI, lo que permite encadenar lectura de ficheros, ejecucion de comandos y edicion en flujos de varios pasos.
- Atencion al cliente automatizada: con 131k tokens de contexto puede mantener historiales largos de conversacion y documentacion de producto en la misma ventana, sin necesidad de truncado agresivo.
- Analisis de documentos extensos: contratos, informes tecnicos o logs de gran volumen que caben en la ventana de 131k tokens, procesables con una unica pasada.
- Despliegue en hardware de gama baja: con cuantizacion Q4_K_S ocupa 1,52 GB y permite hasta 97k de contexto en una GPU de 4 GB, lo que habilita asistentes locales en portatiles o mini-PC.
- Generacion de codigo en pipelines de CI/CD: la integracion con llama-server y la salida de `tool_calls` estandar permiten insertarlo en automatizaciones que generan parches o revisan cambios.
- Prototipado de agentes sin coste de API: al ser Apache 2.0 y ejecutable en consumer GPU, sirve para iterar sobre logicas de agente antes de migrar a modelos mayores.
- Procesamiento por lotes en el borde: su tamano reducido permite ejecutarlo en dispositivos con VRAM limitada manteniendo contexto amplio gracias a la cuantizacion de la cache KV en q8_0.

## Benchmarks y rendimiento

En la informacion disponible no se publican resultados numericos de benchmarks. La model card menciona comparaciones en SWE-bench-Live frente a MiniCPM5-2B Q8_0, SharpSpark y Haiku 4.5, y afirma que el nivel Q6_K_XL puntua por encima del Q8_0 original, pero estos datos aparecen unicamente en imagenes y no se acompanan de cifras en texto.

Si se dispone de datos cuantitativos de fidelidad de cuantizacion, medidos como divergencia KL de percentil 99 frente a BF16 sobre codigo retenido:

| Nivel | Tamano | 99% KL | top-1 |
|---|---:|---:|---:|
| Q4_K_S | 1,52 GB | 0,333 | 92,3% |
| Q4_K_XL | 1,60 GB | 0,274 | 93,0% |
| Q5_K_XL | 1,89 GB | 0,086 | 96,3% |
| Q6_K_XL | 2,20 GB | 0,024 | 98,1% |
| Q8_K_M | 2,93 GB | 0,004 | 99,2% |

Comparacion de robustez a la cuantizacion con Sharp-Spark-X2.5-4B (misma metodologia, contra el BF16 de cada modelo):

| Nivel | MiniCPM5-2B 99% KL | Spark-X2.5-4B 99% KL |
|---|---:|---:|
| Q4_K_S | 0,333 | 1,156 |
| Q4_K_XL | 0,274 | 0,873 |
| Q5_K_XL | 0,086 | 0,363 |
| Q6_K_XL | 0,024 | 0,178 |
| Q8_K_M | 0,004 | 0,023 |

Estos valores miden cuanto dano la cuantizacion al propio modelo, no la calidad del modelo frente a otros.

## Requisitos de hardware

- VRAM estimada segun el nivel de cuantizacion (pesos + cache KV q8_0 + 0,5 GiB de buffers):
  - Q4_K_S: 1,52 GB de pesos; hasta 97K de contexto en 4 GB, 131K en 6 GB o mas.
  - Q4_K_XL: 1,60 GB; hasta 94K en 4 GB, 131K en 6 GB o mas.
  - Q5_K_XL: 1,89 GB; hasta 81K en 4 GB, 131K en 6 GB o mas.
  - Q6_K_XL: 2,20 GB; hasta 68K en 4 GB, 131K en 6 GB o mas.
  - Q8_K_M: 2,93 GB; hasta 36K en 4 GB, 130K en 6 GB, 131K en 8 GB.
- Con cache KV en f16, las cifras de contexto se reducen aproximadamente a la mitad.
- Cabe en GPU de consumo: si, en tarjetas de 4, 6 y 8 GB. En 6 GB o mas, el limite lo marca la ventana nativa de 131k del modelo, no la VRAM.
- GPU recomendadas: no se especifican modelos concretos. Por VRAM, cualquier GPU con 6-8 GB o mas permite el contexto completo; niveles bajos funcionan en tarjetas de 4 GB.
- Opciones de despliegue: llama.cpp (llama-server con `-hf`), valido para cualquier build reciente de llama.cpp. Compatible con flujos basados en GGUF como Ollama. No se menciona soporte de vLLM o TGI, que no consumen GGUF directamente.
- Parametros de ejecucion recomendados: `--jinja -ngl 99 -c 131072 -ctk q8_0 -ctv q8_0 -fa on --temp 1.0 --top-p 0.95 --top-k 20 --min-p 0.0`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Sharp-MiniCPM5-2B-GGUF | 2,52B denso | 131k | Apache 2.0 | GGUF | Cuantizacion con imatrix y plantilla Sharp-MiniCPM |
| openbmb/MiniCPM5-2B | 2,52B denso | 131k | Apache 2.0 | safetensors (original) | Modelo base sin cuantizar |
| peculiar-ragdoll/Sharp-Spark-X2.5-4B-GGUF | 4B (aproximado) | no disponible | no disponible | GGUF | Alternativa del mismo autor; mayor perdida por cuantizacion segun los datos de KL |
| openbmb/MiniCPM5-1B | ~1B | no disponible | no disponible | no disponible | Modelo anterior de la misma serie |

Rendimiento comparado: la model card referencia SWE-bench-Live frente a Haiku 4.5 y SharpSpark, pero sin cifras en texto. No se dispone de numeros comparativos verificables.

## Limitaciones y advertencias

- El campo de idiomas no esta declarado; no hay garantia documentada de cobertura multilingue.
- Riesgo de alucinacion inherente a los modelos de 2B: la capacidad de razonamiento y de hechos esta por debajo de modelos mayores.
- La plantilla de min-p debe fijarse en 0.0; el valor por defecto de llama.cpp (0.05) puede atrapar al modelo en bucles de repeticion segun el autor.
- La cache KV es grande por token (42 KB en f16, 22,3 KB en q8_0) porque las 42 capas mantienen atencion completa sin ventana deslizante, lo que penaliza despliegues con muchos usuarios concurrentes.
- Los datos de KL y top-1 miden fidelidad de cuantizacion respecto al BF16 del propio modelo; no deben interpretarse como una medida de calidad frente a otras alternativas.
- Los resultados de SWE-bench-Live citados no se acompanan de cifras, por lo que no son verificables con la informacion disponible.
- Licencia Apache 2.0, que permite uso comercial, pero conviene revisar las condiciones del modelo base y de los datasets subyacentes.
- El repositorio registra 0 descargas en el momento de la consulta, con 11 likes; la validacion por parte de la comunidad es todavia limitada.
- La model card aparece truncada en la informacion proporcionada, por lo que pueden faltar detalles de la plantilla y de los defectos corregidos.

## Enlaces

- HuggingFace (este modelo): https://huggingface.co/peculiar-ragdoll/Sharp-MiniCPM5-2B-GGUF
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- Sharp-Spark-X2.5-4B-GGUF (mismo autor): https://huggingface.co/peculiar-ragdoll/Sharp-Spark-X2.5-4B-GGUF
- Repositorio OpenBMB/MiniCPM en GitHub: https://github.com/OpenBMB/MiniCPM
- Cobertura de MiniCPM5-2B (Local Model Watch): https://localmodelwatch.tsuchitsuchi.com/en/2026/09/08/minicpm5-2b-released/
- Ficha de MiniCPM5-2B en local-ai-zone: https://local-ai-zone.github.io/models/minicpm5-2b.html
