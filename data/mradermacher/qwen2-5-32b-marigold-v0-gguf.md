# mradermacher/Qwen2.5-32B-Marigold-v0-GGUF

## Resumen

Qwen2.5-32B-Marigold-v0-GGUF es la version cuantizada en formato GGUF del modelo trashpanda-org/Qwen2.5-32B-Marigold-v0, un fine-tuning no oficial sobre la base Qwen2.5-32B de Alibaba. La cuantizacion la realiza mradermacher, un autor habitual en el ecosistema de cuantizaciones GGUF para llama.cpp y derivados, y se publica bajo licencia Apache 2.0. El modelo base hereda la arquitectura transformer densa de Qwen2.5 con 32.763.876.352 parametros totales, lo que lo situa en la gama alta de modelos abiertos ejecutables en hardware de consumo con cuantizaciones agresivas.

El interes practico de esta publicacion es doble: por un lado, ofrece un conjunto completo de cuantizaciones estaticas (desde Q2_K hasta Q8_0) que permiten desplegar un modelo de 32B en GPUs consumer con 24 GB de VRAM usando Q4_K_M o Q4_K_S; por otro, existe una variante paralela con cuantizaciones ponderadas/imatrix (sufijo -i1-) para quienes priorizan calidad por tamano. El modelo esta orientado a uso conversacional y solo declara ingles como idioma soportado en la model card.

No se dispone de informacion publica sobre el dataset de fine-tuning de Marigold v0, sus objetivos de entrenamiento ni resultados de benchmarks. La model card del repositorio cuantizado es puramente operativa: describe los ficheros GGUF, tamanos y recomendaciones de uso, sin detallar capacidades del modelo subyacente. Cualquier evaluacion de capacidades debe remitirse a la ficha del modelo base Qwen2.5-32B y al repositorio original de trashpanda-org.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredado de Qwen2.5-32B; detalles del fine-tuning no disponibles) |
| Parametros totales | 32.763.876.352 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-32B soporta 32.768 tokens nativos, ampliables; no confirmado para este fine-tuning) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estaticas); variantes imatrix en repo -i1-GGUF |
| Idiomas soportados | en (segun model card) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (multiples ficheros por cuantizacion); el modelo original esta en safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde a Qwen2.5-32B, un transformer denso con atencion por cabezas agrupadas (GQA), RoPE y tokenizador BPE multilingue de Qwen. El modelo Marigold v0 es un fine-tuning comunitario publicado por trashpanda-org sobre esa base; no se ha publicado informacion sobre el dataset, el numero de tokens de entrenamiento, la composicion de datos ni si se aplicaron tecnicas de alineacion como RLHF o DPO. La model card del repositorio cuantizado no aporta detalles tecnicos del entrenamiento.

La contribucion de esta publicacion es exclusivamente la cuantizacion. mradermacher aplica el pipeline estandar de llama.cpp para generar cuantizaciones K-quant e IQ, con una variante paralela con imatrix para mejorar la calidad por bit. Los metadatos de la model card indican quantize_version 2, output_tensor_quantised 1 y convert_type hf, lo que confirma una conversion desde pesos Hugging Face. No se documentan innovaciones arquitectonicas adicionales ni tecnicas de decodificacion especulativa.

## Capacidades

- Generacion de texto conversacional en ingles, segun la model card.
- Razonamiento y respuesta a instrucciones heredados del modelo base Qwen2.5-32B (no verificados especificamente para este fine-tuning).
- Capacidad de codigo y matematicas potencialmente heredada del base, sin confirmacion documentada.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: la model card solo declara ingles; el base Qwen2.5 es multilingue, pero no se confirma para este fine-tuning.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Despliegue local en estaciones de trabajo con una sola GPU de 24 GB: usando Q4_K_M (20,0 GB) o Q4_K_S (18,9 GB) el modelo cabe en una RTX 4090 o RTX 3090, permitiendo inferencia privada sin conexion.
- Prototipado de asistentes conversacionales en ingles: el modelo esta etiquetado como conversacional y su tamano de 32B ofrece mayor capacidad de razonamiento que modelos de 7B-13B para dialogos multi-turno, aunque la longitud de contexto efectiva debe validarse.
- Evaluacion comparativa de fine-tunings comunitarios: al existir cuantizaciones estaticas e imatrix del mismo modelo, es posible medir el impacto de la cuantizacion en calidad (perplejidad, coherencia) sobre un mismo checkpoint.
- Servicio de inferencia en CPU o configuraciones hibridas CPU+GPU: las cuantizaciones Q2_K (12,4 GB) y Q3_K_S (14,5 GB) permiten ejecucion con RAM del sistema mediante llama.cpp u Ollama, util para entornos sin GPU dedicada.
- Generacion de texto por lotes en pipelines de investigacion: con Q8_0 (34,9 GB) o Q6_K (27,0 GB) se obtiene la maxima fidelidad respecto al modelo original para tareas de evaluacion offline donde el throughput no es critico.
- Base para experimentos de ajuste fino adicional: al estar disponible el modelo original en safetensors, se puede partir de el para nuevos fine-tunings y luego cuantizar a GGUF con el mismo flujo de mradermacher.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada segun cuantizacion (tamano de fichero, sin overhead de contexto): Q2_K 12,4 GB; Q3_K_S 14,5 GB; Q3_K_M 16,0 GB; Q3_K_L 17,3 GB; IQ4_XS 18,0 GB; Q4_K_S 18,9 GB; Q4_K_M 20,0 GB; Q5_K_S 22,7 GB; Q5_K_M 23,4 GB; Q6_K 27,0 GB; Q8_0 34,9 GB.
- GPU recomendadas: RTX 4090 / RTX 3090 (24 GB) para Q4_K_M y Q5_K_M; A100 40 GB, H100 80 GB o RTX 6000 Ada para Q6_K y Q8_0 sin offload.
- Cabe en GPU consumer: si, en RTX 4090/3090 con Q4_K_M o inferiores; en GPUs de 16 GB solo con Q3_K_M o Q2_K y offload parcial a RAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y servidores compatibles con GGUF. Para el modelo original en safetensors, vLLM o TGI.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen2.5-32B-Marigold-v0-GGUF (este) | 32,76B | no disponible | Apache 2.0 | GGUF | Fine-tuning comunitario, solo ingles declarado |
| Qwen2.5-32B-Instruct (oficial) | 32,76B | 32.768 tokens (nativo) | Apache 2.0 | safetensors, GGUF | Base oficial con benchmarks publicados; referencia de calidad |
| Qwen2.5-32B-Instruct-GGUF (mradermacher u otros) | 32,76B | 32.768 tokens | Apache 2.0 | GGUF | Misma familia de cuantizaciones sobre el modelo oficial |
| Gemma 2 27B Instruct | 27B | 8.192 tokens | Gemma license | safetensors, GGUF | Alternativa de tamano similar con licencia mas restrictiva |

## Limitaciones y advertencias

- No hay informacion publica sobre el dataset de fine-tuning de Marigold v0: se desconoce el riesgo de sesgos introducidos por el ajuste.
- La model card solo declara ingles; el rendimiento en castellano no esta verificado y podria degradarse respecto al base multilingue.
- No se han publicado benchmarks: la calidad real frente al Qwen2.5-32B-Instruct oficial no esta cuantificada.
- Riesgo de alucinacion inherente a los modelos de 32B sin alineacion documentada; no se confirma si el fine-tuning incluyo RLHF o DPO.
- Las cuantizaciones Q2_K y Q3_K_S degradan notablemente la calidad; la propia model card marca Q3_K_M como "lower quality".
- El repositorio ocupa 224 GB en total; descargar solo el fichero de la cuantizacion deseada.
- Licencia Apache 2.0 permite uso comercial, pero el autor del fine-tuning no ofrece garantias ni documentacion de procedencia de datos.
- Longitud de contexto efectiva no confirmada para este fine-tuning; no asumir los 32.768 tokens del base sin validacion.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen2.5-32B-Marigold-v0-GGUF
- Variante imatrix: https://huggingface.co/mradermacher/Qwen2.5-32B-Marigold-v0-i1-GGUF
- Modelo base del fine-tuning: https://huggingface.co/trashpanda-org/Qwen2.5-32B-Marigold-v0
- Pagina de resumen de cuantizaciones: https://hf.tst.eu/model#Qwen2.5-32B-Marigold-v0-GGUF
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
