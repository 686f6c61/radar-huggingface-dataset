# na0x2c6/Ornith-1.5-35B-A3B-GGUF

## Resumen

Ornith-1.5-35B-A3B-GGUF es un conjunto de cuantizaciones GGUF del modelo ornith-ai/Ornith-1.5-35B-A3B, publicadas por el usuario na0x2c6 para su uso con llama.cpp. No se trata de un modelo nuevo, sino de una reempaquetado del modelo base en formato GGUF con tipos de cuantización mixtos, generado con una importance matrix (imatrix) y acompañado de un estudio de divergencia KL frente al BF16 original.

El modelo base es un transformer de mezcla de expertos (MoE) de 35.505.251.456 parámetros totales, etiquetado con la arquitectura `qwen3_5_moe`, con expertos enrutados, un experto compartido, atención híbrida con proyecciones de atención lineal (SSM) y una capa MTP (NextN) integrada que permite decodificación especulativa. El sufijo «A3B» del nombre indica del orden de 3.000 millones de parámetros activos por token, lo que sitúa la inferencia en un régimen de cómputo mucho más cercano a un modelo denso de 3 B que a uno de 35 B.

La relevancia de esta ficha es doble. Por un lado, documenta una técnica de cuantización poco habitual: subir a Q8_0 todas las tensiones fuera de los expertos enrutados (atención, proyecciones SSM, experto compartido y proyección MTP) manteniendo los expertos en Q4_K_M o inferiores, lo que según las mediciones del autor reduce la divergencia KL respecto al BF16 frente a otras publicaciones del mismo modelo con tamaño similar. Por otro, el propio autor advierte de que los ficheros se crearon como experimento de cuantización y que solo están validados con medidas de KLD, no con benchmarks de tarea ni con uso prolongado, por lo que no los recomienda para uso práctico.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención híbrida (atención completa + proyecciones de atención lineal/SSM), experto compartido y capa MTP (NextN); etiqueta de arquitectura `qwen3_5_moe` |
| Parámetros totales | 35.505.251.456 (35,5 B), dato real de safetensors del modelo base |
| Parámetros activos | Cifra exacta no disponible; el sufijo «A3B» del nombre indica ~3 B activos por token |
| Longitud de contexto | No disponible en la información de esta ficha; la receta de vLLM para la variante NVFP4 del modelo base documenta 262.144 tokens |
| Tipos de cuantización | Q4_K_M, IQ4_XS, IQ3_S, IQ3_XXS, IQ2_S e IQ2_XS, con modificadores `-hq` (tensiones no experto en Q8_0) y `-exps` (expertos enrutados de las capas 0-39); embedding de tokens en Q4_K y salida en Q6_K |
| Idiomas soportados | No disponible en los metadatos; el autor mide KLD en japonés e inglés |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp); proyector de visión `mmproj` en BF16 disponible por separado en el repositorio oficial |

Número de capas con expertos enrutados: 40 (capas 0-39, según las reglas `--tensor-type-file` del autor). Tamaño total del repositorio: 120,8 GB (incluye todas las variantes, la imatrix y los ficheros de tipos de tensor).

## Arquitectura y entrenamiento

La información disponible describe la arquitectura del modelo base de forma indirecta, a través de los nombres de las tensiones que el cuantizador modifica: atención (completa), proyecciones de atención lineal de tipo SSM, un experto compartido y expertos enrutados (`ffn_gate_exps`, `ffn_up_exps`, `ffn_down_exps`) distribuidos en 40 capas, más una proyección MTP (Multi-Token Prediction, también llamada NextN). Se trata, por tanto, de un MoE híbrido con dos mecanismos de mezcla de tokens (atención clásica y atención lineal) combinados por capas, un patrón habitual en las arquitecturas Qwen3.5. La capa MTP va integrada en los pesos y se conserva en todas las cuantizaciones, lo que habilita decodificación especulativa con `--spec-type draft-mtp` en llama.cpp sin necesidad de un modelo borrador externo.

No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset, las etapas de alineación (RLHF, DPO u otras) ni las innovaciones de entrenamiento del modelo base, más allá de lo que implica su arquitectura. El trabajo técnico documentado en esta ficha es exclusivamente de cuantización: el autor construyó una importance matrix propia (`imatrix.gguf`) y aplicó una estrategia de tipos por tensor en la que las tensiones más sensibles a la degradación (atención, SSM, experto compartido, MTP) se elevan a Q8_0, mientras el presupuesto de bits se recorta en los expertos enrutados, que concentran la mayor parte de los parámetros pero se activan de forma dispersa. Según sus mediciones, esta combinación `-hq` obtiene menor KLD medio que cualquier otra publicación del mismo modelo de tamaño igual o inferior, en japonés y en inglés.

## Capacidades

- Generación de texto conversacional: el repositorio incluye la etiqueta `conversational` y la pipeline es `text-generation`.
- Razonamiento con salida de tipo *reasoning*: la receta de despliegue de la variante NVFP4 del modelo base documenta soporte de razonamiento explícito.
- Tool calling / function calling: documentado en la receta de vLLM de la variante NVFP4 del modelo base.
- Entrada de imagen: existe un proyector de visión (`mmproj-Ornith-1.5-35B-BF16.gguf`) en el repositorio oficial, por lo que el modelo base es multimodal; para usarlo con estas cuantizaciones hay que descargar ese proyector aparte.
- Decodificación especulativa nativa: la capa MTP (NextN) se conserva en todos los ficheros, compatible con `--spec-type draft-mtp` en llama.cpp.
- Multilingüismo: no hay lista oficial de idiomas en la información disponible; las mediciones de calidad del cuantizador cubren japonés e inglés.
- Compatibilidad con endpoints: etiqueta `endpoints_compatible` en HuggingFace.

## Casos de uso

- Validación de pipeline de cuantización: el caso de uso más directo es reproducir el experimento. Con `imatrix.gguf` y los ficheros `tensor-types-*.txt` incluidos se puede regenerar cualquiera de las variantes y verificar las medidas de KLD, lo que sirve para estudiar el impacto de subir a Q8_0 las tensiones no experto frente a recortar los expertos.
- Investigación sobre degradación por cuantización: la tabla de KLD frente a BF16, con percentil 99,9 %, coincidencia de top-1 y ratio de perplejidad en dos idiomas, permite analizar cómo se distribuye el error entre variantes de 13 a 22 GB sobre un mismo modelo.
- Despliegue local en estaciones de trabajo con GPU de 24 GB: la variante IQ3_S-exps-hq (16,7 GB) o IQ4_XS-exps-hq (20 GB) permite ejecutar un MoE de 35 B totales con ~3 B activos en una RTX 4090 o RTX 3090, dejando margen para KV cache y buffers.
- Servicio multiusuario en hardware modesto: al activarse solo una fracción de los expertos por token, el modelo sostiene mayor throughput que un denso de 35 B; el recetario de vLLM para la variante NVFP4 del modelo base documenta explícitamente «strong multi-user throughput» con 262K de contexto y caché KV en FP8.
- Procesamiento de documentos largos: si se confirma el contexto de 262.144 tokens del modelo base, la variante Q4_K_M-hq (22,4 GB) permite resumir o extraer información de documentos extensos en una sola pasada, a costa de reservar VRAM adicional para la caché KV.
- Agentes con tool calling en local: combinando la capa MTP para decodificación especulativa con soporte de function calling, se puede montar un agente multi-paso sobre llama.cpp sin dependencia de API externa.
- Transcripción y análisis de imágenes en local: descargando el `mmproj` BF16 del repositorio oficial, estas cuantizaciones pueden alimentar flujos de descripción de imágenes o extracción de datos de capturas, siempre que se acepte la advertencia de calidad del autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tarea (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor lo indica explícitamente: los ficheros solo están comprobados con medidas de divergencia KL, no con benchmarks de tarea ni con uso prolongado.

La única métrica publicada es la calidad de cuantización frente al BF16 de referencia. KLD medio más bajo indica mayor fidelidad a la distribución original del siguiente token:

| Variante | Tamaño | KLD medio ja / en | Top-1 igual ja / en | Ratio PPL ja / en |
|---|---|---|---|---|
| Q8_0 (referencia, no subido) | 37,8 GB | 0,0132 / 0,0200 | 94,7 % / 94,1 % | 1,001 / 1,004 |
| APEX-MTP I-Quality (mudler) | 23,7 GB | 0,0328 / 0,0402 | 91,5 % / 91,1 % | 1,009 / 1,004 |
| **Q4_K_M-hq (este repo)** | 22,4 GB | 0,0339 / 0,0357 | 91,7 % / 92,4 % | 1,001 / 1,001 |
| bartowski Q4_K_M | 21,9 GB | 0,0444 / 0,0620 | 90,6 % / 89,9 % | 0,998 / 1,041 |
| mradermacher MTP i1-Q4_K_M | 21,7 GB | 0,0533 / 0,0606 | 89,2 % / 89,5 % | 1,012 / 1,015 |
| Q4_K_M del autor (no subido) | 21,7 GB | 0,0534 / 0,0738 | 89,1 % / 89,4 % | 1,007 / 1,057 |
| Q4_K_M oficial (ornith-ai) | 21,7 GB | 0,0565 / 0,0663 | 89,1 % / 89,3 % | 1,004 / 1,034 |
| **IQ4_XS-exps-hq (este repo)** | 20,0 GB | 0,0405 / 0,0429 | 91,1 % / 92,1 % | 1,008 / 0,987 |
| bartowski IQ4_XS | 19,3 GB | 0,0579 / 0,0721 | 89,2 % / 89,8 % | 1,015 / 1,024 |
| **IQ3_S-exps-hq (este repo)** | 16,7 GB | 0,0927 / 0,1056 | 86,9 % / 87,5 % | 1,059 / 1,084 |
| bartowski Q3_K_L | 17,4 GB | 0,1248 / 0,1474 | 84,8 % / 85,1 % | 1,084 / 1,076 |
| **IQ2_XS-exps-down3-hq (este repo)** | 13,2 GB | 0,2071 / 0,1969 | 79,6 % / 81,9 % | 1,096 / 1,103 |
| bartowski IQ2_M | 12,5 GB | 0,2483 / 0,3052 | 78,7 % / 78,4 % | 1,145 / 1,258 |

Ficheros publicados en este repositorio:

| Fichero | Tamaño | KLD medio ja / en | Expertos |
|---|---|---|---|
| `Q4_K_M-hq.gguf` | 22,4 GB | 0,0339 / 0,0357 | igual que Q4_K_M |
| `IQ4_XS-exps-hq.gguf` | 20,0 GB | 0,0405 / 0,0429 | IQ4_XS |
| `IQ3_S-exps-down4-hq.gguf` | 18,1 GB | 0,0706 / 0,0906 | gate/up IQ3_S, down Q4_K |
| `IQ3_S-exps-hq.gguf` | 16,7 GB | 0,0927 / 0,1056 | IQ3_S |
| `IQ3_XXS-exps-down3-hq.gguf` | 15,7 GB | 0,1008 / 0,1104 | gate/up IQ3_XXS, down IQ3_S |
| `IQ2_S-exps-down3-hq.gguf` | 14,4 GB | 0,1523 / 0,1710 | gate/up IQ2_S, down IQ3_S |
| `IQ2_XS-exps-down3-hq.gguf` | 13,2 GB | 0,2071 / 0,1969 | gate/up IQ2_XS, down IQ3_XXS |

## Requisitos de hardware

- VRAM estimada: el tamaño del fichero GGUF más 2-4 GB de sobrecarga (caché KV a contexto moderado, buffers de cómputo y metadatos). Cifras orientativas por variante: 13,2 GB (IQ2_XS), 16,7 GB (IQ3_S), 20,0 GB (IQ4_XS), 22,4 GB (Q4_K_M). A contexto largo la caché KV crece de forma significativa; no se dispone de la cifra exacta de KV por token.
- GPU de 80 GB (A100 80GB, H100 80GB): Q4_K_M-hq con contexto largo y varios usuarios concurrentes. Es el escenario más cómodo.
- GPU de 48 GB (RTX 6000 Ada, A6000, L40S): Q4_K_M-hq o IQ4_XS-exps-hq con contexto amplio sin offload.
- GPU de 32 GB (RTX 5090): IQ4_XS-exps-hq (20 GB) o Q4_K_M-hq (22,4 GB) con contexto moderado.
- GPU de 24 GB (RTX 4090, RTX 3090, A10G): IQ3_S-exps-hq (16,7 GB) o IQ3_XXS-exps-down3-hq (15,7 GB) con contexto moderado; IQ4_XS-exps-hq entra justo y deja poco margen para KV cache.
- GPU de 16 GB (RTX 4060 Ti 16GB, RTX 4070 Ti Super): IQ2_S-exps-down3-hq (14,4 GB) o IQ2_XS-exps-down3-hq (13,2 GB), asumiendo la pérdida de calidad que reflejan sus KLD.
- GPU de 12 GB: solo variantes IQ2 con offload parcial de expertos a CPU; el autor no publica ninguna cuantización por debajo de 13,2 GB.
- Offload de expertos: al tratarse de un MoE con ~3 B activos, llama.cpp permite mantener las tensiones no experto en GPU y descargar los expertos enrutados a RAM del sistema, lo que reduce mucho el requisito de VRAM a cambio de ancho de banda de memoria.
- Despliegue: llama.cpp (formato nativo), Ollama y LM Studio (consumen GGUF), llama-cpp-python. Para vLLM o TGI habría que usar el modelo base en BF16/FP16 o las variantes NVFP4/AWQ publicadas por separado; el soporte de GGUF en vLLM es experimental.
- Decodificación especulativa: todos los ficheros conservan la capa MTP, por lo que se puede activar `--spec-type draft-mtp` en llama.cpp para reducir latencia por token.
- Visión: requiere descargar aparte `mmproj-Ornith-1.5-35B-BF16.gguf` del repositorio oficial.
- Latencia y throughput: no disponibles. No se han publicado medidas de tokens por segundo para estas variantes.

## Comparativa con modelos similares

La comparación relevante es con las demás publicaciones GGUF del mismo modelo base, ya que no hay benchmarks de tarea que permitan comparar con otras familias:

| Publicación | Tamaño Q4 aprox. | KLD medio ja / en | Capa MTP | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| na0x2c6 Q4_K_M-hq (este repo) | 22,4 GB | 0,0339 / 0,0357 | Sí | MIT | Pública en HF, 0 descargas |
| mudler APEX-MTP I-Quality | 23,7 GB | 0,0328 / 0,0402 | Sí | MIT (heredada) | Pública en HF |
| bartowski Q4_K_M | 21,9 GB | 0,0444 / 0,0620 | No indicado | MIT (heredada) | Pública en HF |
| mradermacher MTP i1-Q4_K_M | 21,7 GB | 0,0533 / 0,0606 | Sí | MIT (heredada) | Pública en HF |
| ornith-ai Q4_K_M oficial | 21,7 GB | 0,0565 / 0,0663 | No indicado | MIT | Pública en HF |
| na0x2c6 IQ4_XS-exps-hq (este repo) | 20,0 GB | 0,0405 / 0,0429 | Sí | MIT | Pública en HF, 0 descargas |

Frente a las alternativas, el Q4_K_M-hq de este repositorio iguala en KLD a APEX-MTP I-Quality con 1,3 GB menos y supera claramente al Q4_K_M oficial y al de bartowski en ambas lenguas. La variante IQ4_XS-exps-hq ofrece el mejor compromiso tamaño/calidad documentado: 20,0 GB con KLD por debajo de todos los Q4_K_M publicados salvo APEX I-Quality y el propio Q4_K_M-hq.

Comparación con modelos de otras familias (por ejemplo, otros MoE de ~30-35 B con ~3 B activos): no disponible, al no existir benchmarks de tarea publicados para este modelo en la información consultada.

## Limitaciones y advertencias

- Advertencia explícita del autor: los ficheros se hicieron para un experimento de cuantización, solo están comprobados con medidas de KLD y no con benchmarks de tarea ni con uso prolongado, y no se recomiendan para uso práctico. Es la limitación más importante de esta ficha.
- Ausencia total de evaluación de tareas: no hay MMLU, HumanEval, GSM8K ni evaluaciones de instrucción. No se puede afirmar cómo rinde en producción.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación por terceros.
- Idiomas: los metadatos no declaran lista de idiomas. El cuantizador solo mide KLD en japonés e inglés, de modo que el comportamiento en castellano u otras lenguas no está verificado para estas variantes.
- Degradación en las variantes pequeñas: la KLD se dispara por debajo de IQ3_S. IQ2_XS-exps-down3-hq tiene un KLD medio de 0,2071 en japonés, más de seis veces el de Q4_K_M-hq, con solo un 79,6 % de coincidencia en el token top-1. No son adecuadas para tareas sensibles a la fidelidad.
- Riesgo de alucinación: inherente al modelo base y agravado por la cuantización; no hay evaluación de factualidad disponible.
- Contexto: la cifra de 262.144 tokens procede de la receta de vLLM para la variante NVFP4 del modelo base, no de una especificación verificada para estas cuantizaciones GGUF. A contexto largo, el consumo de KV cache puede hacer inviable la ejecución en GPUs de 24 GB.
- Visión incompleta por defecto: el proyector multimodal no está incluido en este repositorio; hay que descargarlo del repositorio oficial. Sin él, el modelo solo procesa texto.
- Licencia MIT: permite uso comercial, modificación y redistribución con atribución y sin garantías. Al ser una cuantización derivada, conviene conservar el aviso de copyright del modelo base y del autor de la cuantización.
- Reproducibilidad: para regenerar los ficheros hacen falta la imatrix y los ficheros `tensor-types-*.txt` incluidos; sin ellos, una recuantización con los tipos por defecto de llama.cpp no reproducirá estos KLD.
- Fecha de creación del repositorio: 23 de octubre de 2026, posterior a la fecha habitual de consulta; conviene verificar la vigencia de los enlaces.

## Enlaces

- Repositorio de esta cuantización: https://huggingface.co/na0x2c6/Ornith-1.5-35B-A3B-GGUF
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- GGUF oficiales del modelo base (incluye `mmproj-Ornith-1.5-35B-BF16.gguf`): https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B-GGUF
- Cuantización APEX-MTP de mudler: https://huggingface.co/mudler/Ornith-1.5-35B-A3B-APEX-MTP-GGUF
- Cuantizaciones de bartowski: https://huggingface.co/bartowski/Ornith-1.5-35B-A3B-GGUF
- Cuantizaciones MTP i1 de mradermacher: https://huggingface.co/mradermacher/Ornith-1.5-35B-A3B-MTP-i1-GGUF
- Variante DFlash GGUF del mismo autor: https://huggingface.co/na0x2c6/Ornith-1.5-35B-A3B-DFlash-GGUF/tree/main
- Receta vLLM para la variante NVFP4 en DGX Spark (contexto 262K, caché KV FP8, tool calling): https://github.com/sojufx/Ornith-1.5-35B-A3B-NVFP4-DGX-Spark/blob/main/README.md
- Ficha de terceros con metadatos del modelo: https://local-ai-zone.github.io/models/ornith-1-5-35b-a3b.html
- Registro de la variante DFlash en free2aitools: https://free2aitools.com/model/na0x2c6/ornith-1.5-35b-a3b-dflash-gguf
