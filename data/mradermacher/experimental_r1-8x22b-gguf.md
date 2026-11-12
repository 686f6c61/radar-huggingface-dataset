# mradermacher/experimental_R1-8x22b-GGUF

## Resumen

experimental_R1-8x22b-GGUF es una distribucion de cuantizaciones GGUF del modelo experimental_R1-8x22b, publicado originalmente por el usuario gghfez en Hugging Face. El repositorio lo mantiene mradermacher, un conocido creador de cuantizaciones estaticas para la comunidad de inferencia local. El modelo base es un fine-tune de tipo Mixture of Experts (MoE) con 8 expertos y 22 mil millones de parametros por experto, segun se deduce de la nomenclatura "8x22b", aunque la model card no documenta la arquitectura de forma explicita.

La relevancia de esta ficha radica en que permite ejecutar en hardware local un modelo de gran tamano mediante cuantizacion GGUF, con opciones que van desde Q2_K (52,2 GB) hasta Q8_0 (149,5 GB). El repositorio ocupa 958,3 GB en total por incluir todas las variantes de cuantizacion en formato multiparte.

Se trata de un modelo experimental orientado a tareas de razonamiento, segun sugiere el sufijo "R1" en el nombre, aunque no se dispone de documentacion oficial sobre el proceso de entrenamiento, los datos utilizados ni los resultados de evaluacion. La licencia es Apache 2.0 y el unico idioma declarado es el ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la nomenclatura "8x22b" sugiere MoE con 8 expertos de 22B) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (multiparte) |

## Arquitectura y entrenamiento

La informacion disponible no documenta la arquitectura interna del modelo base gghfez/experimental_R1-8x22b. La convencion de nombres "8x22b" es habitual en modelos Mixture of Experts con 8 expertos y 22 mil millones de parametros por experto, pero no se confirma en la model card. Tampoco se detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF, DPO o destilacion de razonamiento.

El repositorio de mradermacher es exclusivamente una distribucion de cuantizaciones estaticas generadas con llama.cpp a partir del modelo original en formato Hugging Face. Las cuantizaciones se ofrecen en variantes K-quant e IQ-quant, con ficheros divididos en 2, 3 o 4 partes segun el tamano. El autor indica que las cuantizaciones ponderadas con imatrix estan disponibles en un repositorio separado (experimental_R1-8x22b-i1-GGUF), lo que sugiere que las de este repositorio son cuantizaciones estaticas sin calibracion por importancia.

## Capacidades

- Generacion de texto en ingles.
- Razonamiento de tipo "R1": el nombre sugiere un fine-tune orientado a cadenas de razonamiento, aunque no se documenta el modo thinking de forma explicita.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso estructurado.
- Capacidad multilingue limitada al ingles segun la model card.
- No se documentan capacidades de vision, audio ni multimodalidad.

## Casos de uso

- Inferencia local de un modelo de gran tamano en estaciones de trabajo con multiples GPU: las cuantizaciones Q2_K y Q3_K permiten cargar el modelo en entornos con 64-80 GB de VRAM agregada, algo inviable con los pesos originales en precision completa.
- Experimentacion con razonamiento en ingles: el sufijo "R1" sugiere un modelo afinado para tareas de razonamiento, adecuado para prototipos de generacion de cadenas de pensamiento en entornos de investigacion.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece once variantes de cuantizacion, lo que permite medir el impacto de la compresion en la calidad de salida con un mismo modelo base.
- Despliegue con llama.cpp u Ollama: los ficheros GGUF multiparte son compatibles con las herramientas estandar de inferencia local, lo que facilita su integracion en pipelines de pruebas.
- Fine-tuning posterior sobre el modelo cuantizado: las variantes Q8_0 y Q6_K conservan la mayor fidelidad respecto al modelo original y pueden servir como base para experimentos de ajuste con tecnicas compatibles con GGUF.
- Investigacion academica sobre modelos MoE de gran escala: al ser un modelo experimental con licencia Apache 2.0, puede utilizarse en estudios comparativos sin restricciones comerciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 52,2 GB (Q2_K) y 149,5 GB (Q8_0), segun la cuantizacion. Se recomienda anadir un margen de 2-4 GB para el contexto y el overhead de llama.cpp.
- GPU recomendadas: configuraciones multi-GPU con A100 80 GB, H100 80 GB o RTX 6000 Ada. Para las cuantizaciones mas bajas (Q2_K, Q3_K_S) puede ser suficiente con 2x RTX 4090 (48 GB) en configuracion de offload parcial a CPU.
- No cabe en una unica GPU de consumo. Las cuantizaciones Q2_K y Q3_K_S requieren al menos 2 GPU de 24 GB o una combinacion de GPU y RAM del sistema.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF. No se documenta soporte para vLLM o TGI con estos ficheros.
- Latencia y throughput: no disponibles. Dependeran del grado de offload a CPU y del numero de GPU utilizadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| experimental_R1-8x22b-GGUF | no disponible (nomenclatura 8x22b) | no disponible | Apache 2.0 | GGUF | Hugging Face |
| Mixtral 8x22B | 141B totales, 39B activos | 64K | Apache 2.0 | safetensors, GGUF | Hugging Face |
| Mixtral 8x7B | 46,7B totales, 12,9B activos | 32K | Apache 2.0 | safetensors, GGUF | Hugging Face |
| Qwen2.5-72B | 72B | 128K | Apache 2.0 (mayoria de variantes) | safetensors, GGUF | Hugging Face |

La comparacion con Mixtral 8x22B es la mas directa por la convencion de nombres, pero no se dispone de datos que confirmen que experimental_R1-8x22b comparta arquitectura o parametros con Mixtral. Los datos de los modelos alternativos provienen de sus model cards publicas y no de la informacion proporcionada para este modelo.

## Limitaciones y advertencias

- La model card no documenta arquitectura, parametros, contexto ni proceso de entrenamiento: cualquier uso en produccion requiere validacion empirica previa.
- El modelo solo declara soporte de ingles; el rendimiento en castellano no esta verificado.
- Riesgo de alucinacion no evaluado: no hay benchmarks ni evaluaciones de seguridad publicadas.
- Al ser un modelo "experimental", no hay garantias de estabilidad ni de calidad en tareas especificas.
- Las cuantizaciones de baja precision (Q2_K, Q3_K_M) degradan la calidad de forma notable; el autor marca Q3_K_M como "lower quality".
- El repositorio ocupa 958,3 GB, lo que exige planificar la descarga por partes y disponer de espacio en disco suficiente.
- Aunque la licencia es Apache 2.0, el modelo base podria tener restricciones adicionales no reflejadas en esta distribucion; conviene verificar la model card original.
- No se documenta soporte para tool calling, agentes ni multimodalidad, por lo que no es adecuado para pipelines que dependan de estas capacidades sin validacion previa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/experimental_R1-8x22b-GGUF
- Modelo base: https://huggingface.co/gghfez/experimental_R1-8x22b
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/experimental_R1-8x22b-i1-GGUF
- Pagina de resumen del autor: https://hf.tst.eu/model#experimental_R1-8x22b-GGUF
- README de referencia para uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de modelos: https://huggingface.co/mradermacher/model_requests
