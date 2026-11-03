# fajardc/Mistral-Small-4-119B-2603-GSQ-RCO-GGUF

## Resumen

Mistral-Small-4-119B-2603-GSQ-RCO-GGUF es una cuantización GGUF de precisión mixta del modelo `mistralai/Mistral-Small-4-119B-2603`, un transformer de tipo mezcla de expertos (MoE) de 118.972.826.624 parámetros totales (unos 119B) con 6.500 millones de parámetros activos por token, que acepta texto e imágenes y dispone de modos instruct y razonamiento. La cuantización la firma el usuario `fajardc`, no Mistral AI, y aplica los métodos GSQ (Gumbel-Softmax Quantization) y RCO (Riemannian Constrained Optimization) publicados por el DAS Lab del IST Austria, siguiendo el procedimiento de sus releases GSQ-RCO.

El resultado es un fichero de 52,08 GB (48,50 GiB) con un presupuesto de 3,502 bits por peso sobre el total del archivo, repartido de forma no uniforme: cada tensor recibe el tipo que RCO le asigna bajo un presupuesto exacto de tamaño, minimizando la divergencia KL de la salida del modelo completo respecto al modelo en BF16. Los tipos van desde IQ2_XS hasta Q6_K, con las proyecciones de atención y el experto compartido mayoritariamente en Q6_K y los expertos enrutados en tipos bajos.

Es relevante porque permite ejecutar un MoE de 119B con 256k tokens de contexto en hardware de consumo, algo impensable en BF16, y porque documenta con métricas de calidad por dominio (KLD, tasa de mismo top-1 y ratio de perplejidad) el coste real de la compresión. La ficha se centra en esta cuantización concreta, no en el modelo base original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `mistral4`: transformer MoE de 36 capas con multi-head latent attention (MLA), 128 expertos, 4 activos + 1 compartido |
| Parametros totales | 118.972.826.624 (~119B) |
| Parametros activos | ~6.500 millones por token |
| Longitud de contexto | 262.144 tokens (256k) |
| Tipos de cuantizacion | Precisión mixta no uniforme: IQ2_XS, IQ2_S, IQ3_XXS, IQ3_S, IQ4_XS, Q4_K, Q5_K, Q6_K, Q8_0 y F32; 3,502 bpw medios sobre el archivo completo |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (dos partes: `...-00001-of-00002.gguf` de 26,96 GB y `...-00002-of-00002.gguf` de 25,12 GB) |

Otros datos de la ficha: tamaño del repositorio 52,1 GB; pipeline `image-text-to-text`; biblioteca `gguf`; conversión realizada a partir del checkpoint original en FP8 con escalas por tensor y por experto.

## Arquitectura y entrenamiento

La arquitectura del modelo base es `mistral4`: 36 capas con multi-head latent attention, 128 expertos enrutados de los que se activan 4 por token más 1 experto compartido, lo que da unos 6,5B de parámetros activos sobre 119B totales. El modelo acepta entradas de texto e imagen y tiene modos instruct y razonamiento. No incorpora cabeza de predicción multi-token (MTP); Mistral publica por separado una cabeza draft EAGLE (`mistralai/Mistral-Small-4-119B-2603-eagle`) para motores que la soporten, y llama.cpp no la carga en el momento de escribir la model card.

El proceso de cuantización parte del checkpoint en FP8 con escalas por tensor y por experto, convertido a GGUF BF16 con `convert_hf_to_gguf.py` de llama.cpp multiplicando cada peso por su escala. Después se cuantiza cada tensor a cada tipo candidato (IQ2_XS, IQ2_S, IQ3_XXS, IQ3_S, IQ4_XS, Q4_K, Q5_K, Q6_K) con `llama-quantize` y la importance matrix de bartowski; GSQ refina los códigos enteros de cada tensor contra las entradas que ese tensor ve realmente, y RCO elige un tipo por tensor bajo un presupuesto exacto de tamaño minimizando la KL de la salida del modelo completo frente a BF16. Las proyecciones de atención (`attn_q_a`, `attn_q_b`, `attn_kv_a_mqa`, `attn_v_b`, `attn_output`) y el experto compartido quedan mayoritariamente en Q6_K; `token_embd` en Q5_K, `output` en Q6_K, normas y router en F32, y `attn_k_b` en Q8_0 fuera de la búsqueda porque sus filas de 64 valores no caben en ningún tipo K-quant o IQ. Los expertos enrutados, que son la mayor parte del archivo, reciben los tipos bajos de forma desigual por profundidad: en las capas 0-8 hay desde IQ2_XS hasta Q6_K; en las capas 9-23 predominan IQ3_XXS con algo de IQ3_S e IQ2_S; en las capas 24-35 se usan IQ3_S e IQ3_XXS. El recuento de tensores por tipo es Q6_K 212, IQ3_XXS 47, IQ3_S 40, IQ4_XS 38, Q8_0 36, Q4_K 26, Q5_K 17, IQ2_S 12, IQ2_XS 6 y F32 181.

## Capacidades

- Generación de texto conversacional e instructiva, con plantilla de chat de Mistral incluida en el fichero.
- Modo de razonamiento (thinking) disponible en el modelo base; la plantilla embebida corrige el paso del argumento `support_thinking` a `render_content` en la rama de resultados de herramientas, que con la plantilla original falla en el motor de plantillas de llama.cpp con "Not enough arguments provided to 'render_content'".
- Capacidad de entrada de imagen en el modelo base, pero no incluida en esta cuantización: requiere cargar un proyector de visión (mmproj) GGUF aparte, por ejemplo el `mmproj-mistralai_Mistral-Small-4-119B-2603-bf16.gguf` de bartowski o uno convertido con `convert_hf_to_gguf.py --mmproj`.
- Soporte de tool calling / function calling a través de la plantilla de chat de Mistral y del motor de plantillas de llama.cpp.
- Contexto largo de 262.144 tokens, adecuado para conversaciones multi-turno extensas y documentos largos.
- Capacidades multilingües: no disponible en la información proporcionada.
- Sin decodificación especulativa integrada: no hay cabeza MTP en el modelo original y llama.cpp no carga la cabeza EAGLE publicada por Mistral.

## Casos de uso

- Asistencia sobre documentación técnica extensa: con 256k tokens de contexto se puede cargar un repositorio de documentación o varios manuales y hacer preguntas con referencias cruzadas sin trocear el material en fragmentos que pierdan contexto.
- Análisis y generación de código en local: la cuantización mantiene una tasa de mismo top-1 del 93,25 % y un ratio de perplejidad de 1,011 frente a BF16 en código C++ de llama.cpp, por lo que es adecuada para autocompletado, revisión de parches y generación de tests en un equipo que no quiera enviar código a una API externa.
- Agentes con tool calling en pipelines de CI/CD: la plantilla de chat corregida permite peticiones con resultados de herramientas sin el error de argumentos faltantes, lo que habilita bucles de agente que invocan compiladores, linters o APIs internas.
- Atención al cliente automatizada multi-turno: el contexto de 256k y el modo instruct permiten mantener el historial completo de una conversación larga y consultar bases de conocimiento adjuntas en el mismo prompt.
- Procesamiento de instrucciones y datos estructurados por lotes: el rendimiento en instrucciones retenidas (KLD 0,1170, mismo top-1 90,34 %, ratio de perplejidad 1,024 sobre Open-Platypus) lo hace viable para extracción de campos, resumen y clasificación sobre grandes volúmenes de texto.
- Investigación sobre cuantización: el repositorio sirve como caso de estudio reproducible de GSQ y RCO con métricas por dominio, útil para comparar el impacto de la precisión mixta frente a cuantizaciones uniformes del mismo presupuesto.
- Despliegue en estación de trabajo con una sola GPU de 24 GB y RAM de sistema: al ser un MoE con 6,5B activos y 3,502 bpw, el modelo puede residir parcialmente en RAM y descargar a GPU los expertos activos, lo que permite uso interactivo en hardware de consumo.

## Benchmarks y rendimiento

La model card publica métricas de calidad de la cuantización frente al GGUF BF16 del mismo modelo, con 100 fragmentos de 512 tokens por dominio, sobre tres dominios retenidos de la mezcla de calibración de GSQ y RCO:

| Dominio | KLD media | Mismo top-1 | Ratio de perplejidad vs BF16 |
|---|---|---|---|
| WikiText-2 test (prosa enciclopédica) | 0,1984 | 82,75 % | 1,054 |
| Código fuente C++ (llama.cpp) | 0,0709 | 93,25 % | 1,011 |
| Open-Platypus, filas retenidas (instrucciones) | 0,1170 | 90,34 % | 1,024 |

No se han publicado en la información disponible resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) para esta cuantización ni para el modelo base.

## Requisitos de hardware

- Tamaño en disco y en memoria: 52,08 GB (48,50 GiB) para los dos ficheros GGUF; hay que cargar el primero y llama.cpp localiza el segundo si está en el mismo directorio.
- VRAM estimada: no disponible de forma oficial; con 3,502 bpw y 6,5B de parámetros activos, un despliegue completo en VRAM exige del orden de 48-52 GB, mientras que un despliegue con descarga parcial de expertos a RAM puede funcionar con 24 GB de VRAM y suficiente RAM de sistema.
- GPU recomendadas: para carga completa, A100 80 GB, H100 80 GB o dos GPU de 48 GB; para carga parcial, RTX 3090 o RTX 4090 de 24 GB con 64 GB de RAM o más.
- Cabe en GPU de consumo: sí, en RTX 3090 y RTX 4090 de 24 GB con descarga parcial de expertos a RAM; el autor construyó la cuantización en un equipo con Ryzen 9 5900X, 64 GB de RAM, RTX 3090 y RTX 3070 Ti.
- Opciones de despliegue: llama.cpp (formato nativo GGUF, con soporte de plantilla de chat y de proyector mmproj para visión); otros motores compatibles con GGUF no están confirmados en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / precisión | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mistral-Small-4-119B-2603-GSQ-RCO-GGUF (esta ficha) | 119B totales, 6,5B activos | 262.144 | GGUF mixto, 3,502 bpw | apache-2.0 | Hugging Face, 0 descargas |
| mistralai/Mistral-Small-4-119B-2603 (base) | 119B totales, 6,5B activos | 262.144 | Checkpoint original en FP8 con escalas | apache-2.0 | Hugging Face (modelo oficial) |
| Cuantización GGUF de bartowski del mismo modelo base | 119B totales, 6,5B activos | 262.144 | GGUF con tipos uniformes y mmproj BF16 | apache-2.0 | Hugging Face |
| ISTA-DASLab GSQ-RCO (referencia metodológica, otro modelo) | no disponible | no disponible | GGUF GSQ-RCO | no disponible | Hugging Face |

La comparación con alternativas de otros fabricantes y mismo tamaño no está disponible en la información proporcionada.

## Limitaciones y advertencias

- No es una release oficial de Mistral AI ni del IST Austria: es una cuantización personal hecha en hardware de escritorio, sin el proceso de validación de un lanzamiento oficial.
- La visión no está incluida: sin un proyector mmproj cargado aparte, el modelo solo procesa texto.
- Sin decodificación especulativa en llama.cpp: la cabeza EAGLE de Mistral no se carga en este motor, por lo que no se puede acelerar la generación por esa vía.
- La plantilla de chat del fichero difiere de la original de Mistral en la rama de resultados de herramientas; si se sustituye por la original, las peticiones con tool result fallan en llama.cpp.
- Riesgo de alucinación inherente al modelo base; no hay evaluación de factualidad en la información disponible.
- Sesgos conocidos: no disponible.
- Idiomas soportados: no disponible; conviene validar el comportamiento en castellano antes de usarlo en producción.
- Restricciones de licencia: apache-2.0 permite uso comercial, pero esta licencia cubre la cuantización y no necesariamente los términos del modelo base, que deben revisarse por separado.
- La pérdida de calidad es desigual por dominio: la peor métrica es en prosa enciclopédica (KLD 0,1984, mismo top-1 82,75 %, perplejidad 5,4 % superior a BF16), por lo que tareas de conocimiento general son las más afectadas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación independiente por parte de la comunidad.

## Enlaces

- Repositorio de la cuantización: https://huggingface.co/fajardc/Mistral-Small-4-119B-2603-GSQ-RCO-GGUF
- Modelo base: https://huggingface.co/mistralai/Mistral-Small-4-119B-2603
- Cabeza draft EAGLE de Mistral: https://huggingface.co/mistralai/Mistral-Small-4-119B-2603-eagle
- Release GSQ-RCO de referencia del ISTA-DASLab: https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF
- Cuantización GGUF de bartowski del mismo modelo base (incluye mmproj): https://huggingface.co/bartowski/mistralai_Mistral-Small-4-119B-2603-GGUF
- Paper GSQ (referencia arXiv de la model card): arxiv:2604.18556
- Paper RCO (referencia arXiv de la model card): arxiv:2605.00649
