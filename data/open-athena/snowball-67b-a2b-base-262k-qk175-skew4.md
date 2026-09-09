# open-athena/snowball-67b-a2b-base-262k-qk175-skew4

## Resumen

Snowball 67B-A2B es un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado por la comunidad open-athena dentro del ecosistema Marin. Se trata de un modelo base, no instruido, pensado para experimentación con contextos largos y arquitecturas MoE de gran escala. Su característica principal es la extensión de la ventana de contexto hasta 262.144 tokens, realizada en los pasos 156.000 a 157.000 de entrenamiento mediante la técnica `qk_mult=1.75` y un upsampling de documentos de contexto largo. Con 67.078.882.816 parámetros totales y aproximadamente 2.000 millones de parámetros activos por token, el modelo está compuesto por 26 capas y 256 expertos, con cuatro expertos seleccionados por token. Este checkpoint es un export BF16 en formato safetensors, y su despliegue requiere el fork Marin de vLLM, que registra la arquitectura `GrugMoeForCausalLM`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GrugMoe (MoE); 26 capas, 256 expertos, 4 expertos seleccionados por token, 5 cabezas KV, vocabulario de 128.256 tokens |
| Parametros totales | 67.078.882.816 |
| Parametros activos | ~2.000.000.000 por token |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | No disponible (solo export BF16) |
| Idiomas soportados | Inglés (en) |
| Licencia | OpenMDW 1.1 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

La arquitectura GrugMoe es un modelo Transformer con mezcla de expertos. El modelo utiliza 26 capas, 256 expertos y selecciona cuatro expertos por token, lo que permite un coste computacional bajo en comparación con un modelo denso de 67B parámetros. El vocabulario es de 128.256 tokens y el modelo tiene cinco cabezas KV, lo que influye en la configuración de serving con parallelismo de expertos. El modelo fue entrenado hasta el paso 157.000, y en los pasos 156.000 a 157.000 se extendió el contexto de 16.384 a 262.144 tokens mediante `qk_mult=1.75`, con un upsampling de los documentos de contexto largo de 4× durante la extensión. No se ha publicado información sobre el tamaño total del dataset de preentrenamiento ni sobre técnicas de alineación como RLHF o DPO, ya que es un modelo base sin ajuste por instrucciones. El export BF16 valida nombres de tensores, configuración, tamaños y sumas de comprobación SHA-256, pero no se han ejecutado pruebas de generación ni de paridad numérica para este upload.

## Capacidades

- Generación de texto y completado de texto como modelo base.
- Procesamiento de contexto largo de hasta 262.144 tokens, apto para documentos extensos.
- Arquitectura MoE de alta eficiencia computacional con 256 expertos y 4 seleccionados por token.
- Soporte de inferencia unicamente a través del fork Marin de vLLM (registra `grug_moe`).
- No tiene soporte documentado para tool calling, function calling, agentes ni vision.
- El tokenizer incluye una plantilla de chat, pero no está vinculada a un ajuste por instrucciones; usar completions.

## Casos de uso

- Investigacion sobre extension de contexto: el modelo permite evaluar tecnicas como `qk_mult=1.75` y upsampling de documentos largos, comparando la retencion de informacion con otros checkpoints.
- Fine-tuning para tareas de comprension de documentos extensos: al ser un modelo base, se puede adaptar con supervision para resumir, extraer o razonar sobre textos de mas de 200.000 tokens.
- Experimentacion con arquitecturas MoE de gran escala: los 256 expertos y la seleccion de cuatro por token ofrecen un banco de pruebas para estudiar el reparto de tareas entre expertos.
- Desarrollo de modelos instruidos a partir de un base: sirve como punto de partida para proyectos que quieran entrenar un modelo conversacional en ingles con contexto largo.
- Evaluacion de pipelines de serving con parallelismo de expertos: la configuracion de ocho H100 con TP=1, DP=8 y expert parallelism permite probar escalado de inferencia en GPUs multiples.
- Preservacion de conocimiento en preentrenamiento continuado: el checkpoint puede usarse como referencia para medir el efecto del cooldown o de recetas de datos en modelos MoE sobreentrenados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: los pesos BF16 de 67.078.882.816 parametros ocupan 134,2 GB. Con la configuracion indicada de ocho H100, cada GPU debe gestionar al menos 16,8 GB de pesos, ademas de la cache KV y las activaciones.
- GPU recomendadas: ocho H100 80 GB, segun la configuracion de serving descrita en la model card (tensor parallelism 1, data parallelism 8, expert parallelism).
- No cabe en GPUs de consumo: una RTX 4090 de 24 GB no dispone de suficiente VRAM; se requiere infraestructura multigpu.
- Opciones de despliegue: exclusivamente el fork Marin de vLLM. No se ha publicado ninguna cuantizacion GGUF ni soporte para llama.cpp u Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se han identificado modelos comparables en la informacion proporcionada. El modelo es destacable por su ventana de contexto de 262.144 tokens y su configuracion de 256 expertos, pero sin datos de benchmarks no se puede establecer una comparativa numerica con alternativas de tamano similar.

## Limitaciones y advertencias

- Es un modelo base, no instruido, por lo que las respuestas no estan alineadas con instrucciones; el chat template no es fiable.
- El despliegue requiere el fork Marin de vLLM; no funciona con vLLM estandar ni con otros frameworks comunes.
- No se han publicado benchmarks fiables, siquiera de generacion o paridad numerica para este upload concreto.
- La licencia OpenMDW 1.1 debe revisarse antes de un uso comercial, ya que sus condiciones no estan explicadas en la informacion disponible.
- El idioma soportado es solo ingles, lo que limita aplicaciones en otros idiomas.
- Los pesos en BF16 (134,2 GB) implican costes de almacenamiento e infraestructura elevados.
- Riesgo de alucinacion esperable en un modelo sin ajuste por instrucciones.

## Enlaces

- Hugging Face: https://huggingface.co/open-athena/snowball-67b-a2b-base-262k-qk175-skew4
- Comparacion de contextos largos Marin: https://github.com/marin-community/marin/issues/8977
- Fork Marin de vLLM: https://github.com/marin-community/vllm
- Registro de serving y evaluacion (QK 1.57 y 1.75): https://github.com/marin-community/marin/issues/8702
- Articulo sobre pipeline SFT para modelos Marin: https://storage.googleapis.com/marin-public/benjaminfeuer/standing-up-a-cold-start-sft-pipeline-for-marin-models/2026.08.16/index.html
