# r0b0tlab/Muse-Glimmer-30B-NVFP4

## Resumen

Muse-Glimmer-30B-NVFP4 es una cuantizacion NVFP4 (W4A4, block-16) del modelo multimodal base [meta-models/Muse-Glimmer-30B](https://huggingface.co/meta-models/Muse-Glimmer-30B), realizada por el laboratorio r0b0tlab con NVIDIA ModelOpt 0.45.0. El modelo original, desarrollado por meta-models, es un sistema image-text-to-text que procesa imagenes y texto, con soporte de razonamiento estructurado por canales y tool calling. Esta version cuantizada reduce el peso de 59,6 GB a 25,4 GB (factor 2,34x) y acelera la decodificacion en hardware NVIDIA GB10 (DGX Spark) gracias a la ejecucion nativa de tensor cores FP4, alcanzando ~10,3 tokens/s en decodificacion de un solo stream frente a ~4,2 tokens/s del BF16.

La cuantizacion mantiene protegidos en BF16 los componentes criticos (vision tower, adaptador, embeddings, lm_head y normas) y excluye los pesos de `*gate_proj` para preservar la calidad. El modelo soporta una ventana de contexto de hasta 131.072 tokens, verificada mediante pruebas de needle-in-a-haystack (NIAH) en tres profundidades. Se distribuye bajo licencia Apache 2.0, sin restricciones adicionales sobre el modelo base. Su relevancia actual radica en ofrecer una alternativa eficiente para despliegue en hardware de memoria unificada como DGX Spark, con rendimiento de calidad comparable al BF16 segun los benchmarks oficiales del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), no se especifica si es MoE o densa; el nombre sugiere 30B pero los pesos reales indican 17,9B |
| Parametros totales | 17.903.600.640 (dato real de safetensors; el nombre comercial indica 30B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | 131.072 tokens (verificado con NIAH) |
| Tipos de cuantizacion | NVFP4 (W4A4, block-16) con tensores protegidos en BF16 |
| Idiomas soportados | no disponible (no se especifican en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (cuantizacion ModelOpt NVFP4) |

## Arquitectura y entrenamiento

El modelo base Muse-Glimmer-30B es un sistema multimodal que combina un codificador de vision con un transformer de lenguaje, disenado para tareas de imagen-a-texto y texto-a-texto. La cuantizacion NVFP4 aplica una precision de 4 bits tanto en pesos como en activaciones (W4A4) con bloques de 16 elementos, utilizando la configuracion `NVFP4_DEFAULT_CFG` de ModelOpt. El proceso de calibracion empleo el dataset `cnn_dailymail` 3.0.0 (512 muestras de 2.048 tokens, batch 1), siguiendo la convencion canonica de ModelOpt. Se excluyeron los pesos de `*gate_proj` de la cuantizacion para proteger la calidad, y se mantuvieron en BF16 la vision tower, el adaptador, los embeddings, la cabeza de salida y las normas de capa. En total, 364 tensores fueron cuantizados y 1.072 permanecen protegidos, con auditorias estructurales registradas en `quantization.complete.json`. No se dispone de informacion sobre el entrenamiento original del modelo base (datos, tokens, metodo de alineacion).

## Capacidades

- Procesamiento multimodal de imagenes y texto (pipeline image-text-to-text), con soporte de una imagen por prompt segun la configuracion de vLLM.
- Razonamiento estructurado por canales: el modelo emite razonamiento previo a la respuesta final, controlado por un parser especifico (`muse_glimmer`).
- Tool calling y seleccion automatica de herramientas, habilitada mediante `--enable-auto-tool-choice` y el parser `muse_glimmer`.
- Ventana de contexto larga de 131.072 tokens, verificada con pruebas NIAH en tres profundidades (incluyendo 117.734).
- Generacion de texto, codigo y matematicas, segun los benchmarks de HumanEval y GSM8K.
- Capacidad multilingue: no especificada, se asume herencia del modelo base.

## Casos de uso

- Asistentes de codigo en produccion: con un 85,4% pass@1 en HumanEval, el modelo puede integrarse en pipelines de generacion y autocompletado de codigo, especialmente en entornos con GPUs de memoria unificada como DGX Spark.
- Razonamiento multimodal para documentacion tecnica: dado que acepta una imagen por prompt, puede analizar diagramas, capturas de pantalla o esquemas junto con texto para generar explicaciones o resumenes tecnicos.
- Agentes conversacionales con tool calling: el soporte nativo de tool calling y el parser dedicado permiten construir agentes que consultan APIs, bases de datos o servicios externos, manteniendo contexto largo de hasta 131k tokens.
- Analisis de documentos largos con imagenes: la ventana de contexto amplia permite procesar manuales extensos, informes con figuras o contratos, combinando texto e imagenes en una sola pasada.
- Despliegue en hardware de borde con memoria unificada: gracias a la cuantizacion NVFP4 y la optimizacion para SM121, el modelo cabe en dispositivos como DGX Spark (128 GB unificados) con latencia de ~95 ms por token, apto para inferencia en tiempo real.
- Evaluacion y testing de modelos cuantizados: al estar calibrado con `cnn_dailymail` y auditado estructuralmente, sirve como referencia para estudiar el impacto de la cuantizacion NVFP4 en tareas de razonamiento, codigo y tool calling.

## Benchmarks y rendimiento

El autor reporta resultados en el subconjunto core de su benchmark r0b0bench, con scorers oficiales y `reasoning_strength=low`:

| Tarea | Resultado |
|---|---|
| GSM8K-200 | 91,0% |
| ARC-Easy-400 | 95,75% |
| IFEval-200 | 82,0% |
| HumanEval-164 | 85,4% pass@1 |
| BFCL-MT-200 (tool calling) | 52,0% |
| NIAH @131K (3 profundidades) | 3/3 recuperados |

Rendimiento en DGX Spark (GB10, 128 GB unificados):

| Metrica | BF16 | NVFP4 |
|---|---|---|
| Tamano de pesos | 59,6 GB | 25,4 GB |
| Decodificacion single-stream | ~4,2 tok/s | ~10,3 tok/s |
| Aggregate @ c16 | — | 52,5 tok/s |
| TPOT mediano | ~245 ms | ~95 ms |

No se proporcionan comparaciones con otros modelos cuantizados en la misma configuracion.

## Requisitos de hardware

- VRAM estimada: 25,4 GB para los pesos cuantizados, mas overhead de activaciones y cache KV. Con `--gpu-memory-utilization 0.70` en DGX Spark se requiere al menos ~36 GB de memoria utilizable.
- GPU recomendadas: NVIDIA DGX Spark (GB10, SM121) con 128 GB de memoria unificada, validada por el autor. Tambien compatible con otras GPUs NVIDIA que soporten FP4 (sm_120 o superior), aunque requiere compilacion con `torch_cuda_arch_list=12.0` para evitar cubins incompatibles.
- Cabe en GPUs de consumo: no, dado que requiere al menos ~36 GB de memoria y soporte FP4 nativo; las RTX 4090 (24 GB) no son suficientes.
- Opciones de despliegue: vLLM con soporte no fusionado (PR #51655), usando `--quantization modelopt_fp4` y `--linear-backend flashinfer_cutlass`. No se mencionan alternativas como llama.cpp u Ollama.
- Latencia y throughput: ~95 ms de TPOT mediano en single-stream y 52,5 tok/s agregado con 16 secuencias concurrentes en GB10.

## Comparativa con modelos similares

No se dispone de comparaciones directas con otros modelos cuantizados de tamano similar en la informacion proporcionada. Como referencia, el modelo base BF16 (meta-models/Muse-Glimmer-30B) ofrece el mismo rendimiento cualitativo pero con el doble de peso y la mitad de velocidad de decodificacion en GB10. No hay datos publicados de otros modelos NVFP4 de la misma familia.

## Limitaciones y advertencias

- El modelo base es no determinista a temperatura 0: ante prompts identicos repetidos, puede generar tokens ligeramente distintos debido a empates en la seleccion greedy. Esto impide comparaciones exactas entre dtypes y afecta a la reproducibilidad.
- El razonamiento por canales requiere un presupuesto de tokens suficiente: con `max_tokens` de 64 o menos, el canal de respuesta puede quedar vacio, ya que el modelo primero emite razonamiento.
- La decodificacion especulativa (DFlash, asistente de 3B) esta verificada en BF16 (~2,7x), pero no es aplicable a NVFP4 debido a problemas pendientes en el enrutamiento de cuantizacion de vLLM.
- No se especifican los idiomas soportados; se asume herencia del modelo base, pero no hay garantia de cobertura multilingue.
- La cuantizacion NVFP4 requiere hardware con soporte FP4 nativo (SM121 o superior); no funcionara en GPUs anteriores.
- Aunque la licencia es Apache 2.0, se debe revisar la politica de uso del modelo base (USAGE_POLICY.md) para restricciones adicionales.
- El rendimiento reportado se obtuvo en un entorno especifico (DGX Spark) y puede variar en otros hardware.

## Enlaces

- [Repositorio HuggingFace del modelo cuantizado](https://huggingface.co/r0b0tlab/Muse-Glimmer-30B-NVFP4)
- [Modelo base: meta-models/Muse-Glimmer-30B](https://huggingface.co/meta-models/Muse-Glimmer-30B)
- [Guia de despliegue y verificacion (GitHub)](https://github.com/r0b0tlab/muse-glimmer-30b-nvfp4-vllm)
- [PR de soporte de Muse en vLLM](https://github.com/vllm-project/vllm/pull/51655)
