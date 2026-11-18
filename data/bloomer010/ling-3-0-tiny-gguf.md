# bloomer010/Ling-3.0-tiny-GGUF

## Resumen

Ling-3.0-tiny es un modelo de lenguaje de tipo mezcla de expertos (MoE) desarrollado por inclusionAI, distribuido originalmente en formato BF16 a traves de Hugging Face. Esta ficha cubre la conversion a GGUF publicada por el usuario bloomer010, que permite ejecutar el modelo en llama.cpp tanto en CPU como en GPU. El modelo cuenta con 7.893.392.800 parametros totales y 1.300 millones de parametros activos por token, lo que lo situa en la categoria de modelos MoE eficientes en computo.

La arquitectura combina 24 capas: 18 capas KDA (Kimi Delta Attention) y 6 capas MLA (Multi-head Latent Attention), con 128 expertos enrutados, 8 activos por token y 1 experto compartido. Incorpora ademas proyecciones Q-LoRA de rango 256 y KV-LoRA de rango 512, y soporta una longitud de contexto de 131.072 tokens en la configuracion publicada. El modelo base se identifica con la arquitectura `bailingmoe3` y esta etiquetado como conversacional y de generacion de texto.

La relevancia de esta publicacion GGUF radica en que ofrece un conjunto amplio de cuantizaciones (desde Q1_0 de 1,30 GB hasta BF16 de 15,8 GB), con recetas XL e importancia matrix para las variantes IQ, lo que facilita el despliegue en hardware muy diverso, incluidas GPUs de consumo. La licencia MIT del modelo base y de la conversion simplifica su adopcion comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE hibrida (bailingmoe3): 18 capas KDA + 6 capas MLA |
| Parametros totales | 7.893.392.800 (7,9B) |
| Parametros activos | 1,3B por token |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | BF16, UD-Q8_K_XL, Q8_0, UD-Q6_K_XL, Q6_K, Q5_K_M, Q5_K_S, Q5_0, Q4_K_M, Q4_K_S, Q4_0, MXFP4_MOE, IQ4_XS, Q3_K_M, Q3_K_S, IQ3_S, IQ3_XXS, Q2_K, IQ2_M, IQ2_S, IQ2_XS, IQ2_XXS, IQ1_M, IQ1_S, Q1_0 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (conversion desde safetensors BF16) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura MoE con 24 capas, de las cuales 18 son capas KDA (Kimi Delta Attention) y 6 son capas MLA (Multi-head Latent Attention). Dispone de 128 expertos enrutados con 8 activos por token y un experto compartido adicional. Las proyecciones Q-LoRA (rango 256) y KV-LoRA (rango 512) forman parte del diseno, y la conversion BF16 verifico los 526 tensores, incluidos los 18 tensores Q-LoRA. En la configuracion publicada no se incluye bloque MTP (`num_nextn_predict_layers: 0`).

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO, ya que la model card de la conversion GGUF no los detalla. La model card del autor de la conversion indica que el modelo puede terminar su respuesta a mitad del razonamiento sin cierre, y que este comportamiento es inherente a los pesos incluso en precision completa. Las cuantizaciones IQ (de IQ1_S a IQ4_XS) se generaron con una importance matrix especifica: texto de entrenamiento Wikitext-2 raw, 100 fragmentos de 512 tokens (51.200 tokens de calibracion) y 332 entradas de matriz.

## Capacidades

- Generacion de texto conversacional y de proposito general.
- Razonamiento con modo "thinking" habilitado por defecto, desactivable por peticion mediante `"chat_template_kwargs": {"enable_thinking": false}`.
- Arquitectura MoE con 1,3B parametros activos, orientada a eficiencia en inferencia.
- Soporte de contexto largo de hasta 131.072 tokens.
- Compatibilidad con llama.cpp mediante `llama-server` y flag `--jinja`.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente conversacional local: el modelo puede gestionar dialogos multi-turno en estaciones de trabajo con GPU de consumo, ya que la cuantizacion Q4_K_M ocupa 4,82 GB y requiere unos 6 GB de memoria.
- Procesamiento de documentos largos: con 131.072 tokens de contexto, es adecuado para resumir o extraer informacion de contratos, informes o bases de codigo extensas en una sola pasada.
- Despliegue en CPU: las variantes Q1_0 (1,30 GB) e IQ1_S (1,76 GB) permiten ejecutar el modelo en equipos sin GPU dedicada, con la contrapartida de menor precision.
- Razonamiento con traza explicita: el modo thinking por defecto facilita tareas de analisis paso a paso, como depuracion logica o resolucion de problemas matematicos, aunque debe monitorizarse la terminacion prematura de la respuesta.
- Integracion en pipelines de llama.cpp: mediante `llama-server` y el flag `--jinja`, el modelo puede exponerse como API compatible con endpoints para aplicaciones internas.
- Prototipado e investigacion: la licencia MIT y el amplio abanico de cuantizaciones permiten experimentar con tecnicas de compresion (IQ, K-quants, MXFP4) sin restricciones de uso comercial.
- Ejecucion en hardware Blackwell: la cuantizacion MXFP4_MOE (4,72 GB) usa su ruta nativa en GPUs con soporte MXFP4, como las RTX 50-series y GB10/DGX Spark.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada segun cuantizacion (datos de la model card):
  - BF16: 15,8 GB, requiere 16 GB o mas.
  - UD-Q8_K_XL: 11,19 GB, requiere 12 GB o mas.
  - Q8_0: 8,41 GB, requiere 10 GB o mas.
  - UD-Q6_K_XL: 7,27 GB, requiere 8 GB o mas.
  - Q5_K_M: 5,64 GB, requiere 7 GB o mas.
  - Q4_K_M: 4,82 GB, requiere 6 GB o mas.
  - IQ4_XS: 4,29 GB, requiere 5 GB o mas.
  - Q3_K_M: 3,84 GB, requiere 5 GB o mas.
  - Q2_K: 2,99 GB, requiere 4 GB o mas.
  - IQ2_M: 2,70 GB, requiere 3 GB o mas.
  - IQ1_S: 1,76 GB, requiere 2 GB o mas.
  - Q1_0: 1,30 GB, requiere 2 GB o mas.
- GPU recomendadas: no se especifican modelos concretos en la informacion; las pruebas CUDA se realizaron en una RTX 4070 y una RTX 3060, lo que confirma compatibilidad con GPUs de consumo.
- Cabe en GPU de consumo: si, desde cuantizaciones IQ2 en adelante con 3-4 GB de VRAM, y Q4_K_M en GPUs de 6 GB o mas.
- Opciones de despliegue: llama.cpp (compilacion con `-DGGML_CUDA=ON`), `llama-server` y `llama-cli`; el soporte de `bailingmoe3` se integro en llama.cpp el 2026-08-17. No se mencionan vLLM, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponible.
- Nota de hardware: MXFP4_MOE solo usa ruta nativa en GPUs con soporte MXFP4 (Blackwell RTX 50-series, GB10/DGX Spark); en otro hardware cae a una ruta de dequantizacion mas lenta, por lo que se recomienda una K-quant en GPUs anteriores.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- El modelo puede terminar su respuesta a mitad del razonamiento sin cierre; este comportamiento es inherente a los pesos y persiste incluso en precision completa.
- Las cuantizaciones pequenas (Q1, IQ1, IQ2) degradan la precision de forma notable; la model card advierte que archivos mas pequenos implican "mas slop y mal comportamiento".
- No hay informacion sobre sesgos conocidos, idiomas soportados ni evaluaciones de seguridad.
- Riesgo de alucinacion: no cuantificado en la informacion disponible.
- La licencia es MIT, lo que permite uso comercial sin restricciones adicionales segun la informacion disponible.
- El modo thinking esta activado por defecto y debe desactivarse explicitamente por peticion si no se desea.
- Para hardware sin soporte MXFP4, la cuantizacion MXFP4_MOE es mas lenta que una K-quant equivalente.
- El repositorio ocupa 288,1 GB, por lo que la descarga completa de todas las cuantizaciones no es practica; conviene descargar solo la variante necesaria.

## Enlaces

- Repositorio GGUF: https://huggingface.co/bloomer010/Ling-3.0-tiny-GGUF
- Modelo base: https://huggingface.co/inclusionAI/Ling-3.0-tiny
- llama.cpp (soporte bailingmoe3 integrado el 2026-08-17): https://github.com/ggml-org/llama.cpp
- Rama pre-merge de soporte: https://github.com/aetherbird/llama.cpp (rama `bailingmoe3-support`)
