# mradermacher/granite-3.0-8b-lora-intrinsics-v0.1-GGUF

## Resumen

Granite-3.0-8b-lora-intrinsics-v0.1-GGUF es una coleccion de cuantizaciones estaticas en formato GGUF del modelo base ibm-granite/granite-3.0-8b-lora-intrinsics-v0.1, publicada por el usuario mradermacher. El modelo subyacente es un ajuste fino mediante LoRA del IBM Granite 3.0 de 8 mil millones de parametros, orientado a tareas de "intrinsics" (capacidades intrinsecas como razonamiento, seguimiento de instrucciones y seguridad). Esta version GGUF permite ejecutar el modelo en hardware de consumo mediante llama.cpp y derivados, sin necesidad de GPUs de datacenter.

La relevancia de esta ficha reside en que ofrece una via practica para desplegar un modelo de 8B de IBM en entornos locales con licencia Apache 2.0, algo poco habitual en modelos de este tamano procedentes de grandes laboratorios. La cuantizacion va desde Q2_K (3,2 GB) hasta f16 (16,4 GB), lo que abarca desde GPUs de 4 GB de VRAM hasta configuraciones de 16 GB o mas.

El modelo base esta entrenado principalmente en ingles y esta pensado para cargas conversacionales y de razonamiento. Esta ficha describe las caracteristicas del modelo base tal como se reflejan en la informacion disponible, junto con las particularidades de la distribucion GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia IBM Granite 3.0) |
| Parametros totales | 8.170.848.256 (8,17B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de la familia IBM Granite 3.0, con 8.170.848.256 parametros. Sobre el modelo preentrenado se aplico un ajuste fino mediante LoRA (Low-Rank Adaptation) para producir la variante "lora-intrinsics-v0.1", orientada a reforzar capacidades intrinsecas del modelo (razonamiento, seguimiento de instrucciones y comportamiento seguro). No se dispone en la informacion proporcionada de detalles sobre el volumen de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO.

La distribucion aqui descrita es una conversion a GGUF realizada por mradermacher a partir de los pesos en formato Hugging Face (convert_type: hf), con cuantizacion estatica (output_tensor_quantised: 1, quantize_version: 2). No se aplico imatrix en esta variante; el autor publica por separado quants con imatrix en el repositorio granite-3.0-8b-lora-intrinsics-v0.1-i1-GGUF, que suelen ofrecer mejor calidad por tamano.

## Capacidades

- Generacion de texto conversacional en ingles, con soporte de plantillas de chat (tag conversational).
- Razonamiento y seguimiento de instrucciones reforzados por el ajuste LoRA de "intrinsics".
- Capacidades de codigo y matematicas heredadas del modelo base Granite 3.0 (sin datos especificos en la informacion disponible).
- Compatibilidad con endpoints (tag endpoints_compatible), lo que facilita su integracion en servidores de inferencia compatibles con la API de OpenAI.
- Ejecucion local mediante llama.cpp y derivados gracias al formato GGUF.
- Capacidades multilingues limitadas al ingles segun los metadatos del modelo.
- No se dispone de informacion sobre tool calling, function calling, agentes o modos especiales (thinking, vision, audio) en la informacion proporcionada.

## Casos de uso

- Asistente conversacional local: el modelo puede gestionar dialogos multi-turno en ingles ejecutandose en una unica GPU de consumo con el quant Q4_K_M (5,0 GB), adecuado para prototipos y uso personal sin dependencia de la nube.
- Generacion de codigo en entornos offline: con Q5_K_M (5,9 GB) se puede integrar en editores o pipelines locales de CI/CD que requieran un modelo de 8B sin enviar codigo a servicios externos.
- Razonamiento y analisis de texto en ingles: util para tareas de resumen, clasificacion y extraccion de informacion en documentos, aprovechando el ajuste orientado a capacidades intrinsecas.
- Despliegue en servidores compatibles con la API de OpenAI: gracias al tag endpoints_compatible, puede servirse mediante backends tipo llama.cpp server y consumirse con clientes habituales.
- Evaluacion de calidad de cuantizaciones: el repositorio ofrece 12 variantes de quant, lo que permite comparar calidad y rendimiento para elegir el equilibrio adecuado en funcion del hardware.
- Educacion e investigacion: sirve como banco de pruebas para estudiar el efecto del ajuste LoRA y de la cuantizacion GGUF sobre un modelo de 8B de IBM, con licencia Apache 2.0 que permite uso academico y comercial.
- Prototipado rapido en estaciones de trabajo sin GPU dedicada: con Q2_K (3,2 GB) o Q3_K_S (3,7 GB) es posible ejecutar el modelo en CPU mediante llama.cpp, aunque con menor calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion: Q2_K ~3,2 GB; Q3_K_S ~3,7 GB; Q3_K_M ~4,1 GB; Q3_K_L ~4,4 GB; IQ4_XS ~4,6 GB; Q4_K_S ~4,8 GB; Q4_K_M ~5,0 GB; Q5_K_S ~5,7 GB; Q5_K_M ~5,9 GB; Q6_K ~6,8 GB; Q8_0 ~8,8 GB; f16 ~16,4 GB.
- GPU recomendadas: para Q4_K_M y Q5_K_M basta una RTX 3060 de 12 GB o una RTX 4060 Ti de 16 GB; Q8_0 requiere al menos 12 GB de VRAM efectiva; f16 requiere 24 GB (RTX 3090, RTX 4090) o GPUs de datacenter como A100 o H100.
- Cabe en GPU de consumo: si, desde GPUs de 4-6 GB con quants bajos (Q2_K a IQ4_XS) hasta 16 GB con Q6_K. Los quants Q4_K_S y Q4_K_M estan marcados por el autor como "fast, recommended".
- Opciones de despliegue: llama.cpp, Ollama, llama.cpp server (endpoints compatibles), y cualquier runtime que soporte GGUF. El modelo base en safetensors puede servirse con transformers, vLLM o TGI.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| granite-3.0-8b-lora-intrinsics-v0.1-GGUF (este) | 8,17B | no disponible | Apache 2.0 | GGUF | Ajuste LoRA de Granite 3.0, solo ingles |
| ibm-granite/granite-3.0-8b-lora-intrinsics-v0.1 (base) | 8,17B | no disponible | Apache 2.0 | safetensors | Pesos originales sin cuantizar |
| mradermacher/granite-3.0-8b-lora-intrinsics-v0.1-i1-GGUF | 8,17B | no disponible | Apache 2.0 | GGUF (imatrix) | Misma base con quants ponderados, mayor calidad por tamano |
| Llama 3.1 8B Instruct | 8B | 128K | Llama 3.1 Community | safetensors, GGUF | Alternativa de tamano similar, licencia mas restrictiva |
| Mistral 7B Instruct | 7,2B | 32K | Apache 2.0 | safetensors, GGUF | Alternativa Apache 2.0 de tamano comparable |

## Limitaciones y advertencias

- Idioma: el modelo esta entrenado y etiquetado unicamente para ingles; el rendimiento en castellano u otros idiomas no esta garantizado.
- Sesgos: no se dispone de informacion sobre evaluaciones de sesgo en la informacion proporcionada; al derivar de un modelo preentrenado, puede heredar sesgos del corpus original.
- Alucinacion: como cualquier modelo generativo, puede producir contenido factualmente incorrecto; no se han publicado metricas de fiabilidad en esta ficha.
- Cuantizacion: los quants de baja precision (Q2_K, Q3_K_M) degradan la calidad; el autor marca Q3_K_M como "lower quality". Para produccion se recomienda Q4_K_M o superior.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base de IBM y de los datos de entrenamiento originales.
- Contexto: la longitud de contexto no esta documentada en la informacion disponible, lo que impide planificar cargas que dependan de ventanas largas.
- Fecha de actualizacion: el repositorio figura actualizado en 2026, pero no se dispone de changelog ni de garantias de mantenimiento por parte del autor.
- LoRA "intrinsics": al tratarse de un ajuste especifico, su comportamiento puede diferir del Granite 3.0 estandar en tareas generales; conviene validarlo en el caso de uso concreto.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/granite-3.0-8b-lora-intrinsics-v0.1-GGUF
- Modelo base: https://huggingface.co/ibm-granite/granite-3.0-8b-lora-intrinsics-v0.1
- Quants con imatrix: https://huggingface.co/mradermacher/granite-3.0-8b-lora-intrinsics-v0.1-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#granite-3.0-8b-lora-intrinsics-v0.1-GGUF
- FAQ y peticiones de modelos: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de quant (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Grafico comparativo de quants (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
