# SergiioB/Nemotron-3.5-Lightning-30B-A3B-DFlash-BF16

## Resumen

Este repositorio contiene una reconstrucción local en BF16 del modelo draft DFlash de NVIDIA, `NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4-DFlash`, realizada por el usuario SergiioB. El objetivo es permitir que vLLM en Intel XPU cargue el especulador DFlash oficial, ya que el empaquetado NVFP4 original (E2M1 + escalas E4M3) no es consumible por la imagen XPU fijada. No se trata de un modelo de chat independiente, sino de un componente auxiliar diseñado para decodificación especulativa junto con un modelo objetivo cuantizado en GPTQ INT4.

El modelo base es el Nemotron-3.5-Lightning-30B-A3B de NVIDIA, una arquitectura MoE de 30 mil millones de parámetros con 3 mil millones activos, preentrenada con más de 20 billones de tokens. Este repositorio, sin embargo, contiene únicamente el draft DFlash, que según los datos reales de safetensors tiene 833.362.176 parámetros (833 millones) y ocupa 1,7 GB en disco. La licencia es OpenMDW-1.1, la misma que el modelo fuente de NVIDIA. La relevancia de esta publicación radica en posibilitar la inferencia especulativa acelerada en hardware Intel Arc Pro B70, un escenario poco cubierto por las imágenes oficiales de vLLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (draft DFlash del modelo Nemotron-3.5-Lightning-30B-A3B) |
| Parametros totales | 833.362.176 (según safetensors; el modelo base completo tiene 30B-A3B) |
| Parametros activos | no disponible (el draft no especifica el desglose MoE) |
| Longitud de contexto | no disponible (depende del modelo objetivo; el ejemplo de lanzamiento usa 16384) |
| Tipos de cuantizacion | BF16 (reconstrucción local; el original era NVFP4) |
| Idiomas soportados | no disponibles |
| Licencia | openmdw-1.1 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo es una reconstrucción local del draft DFlash de NVIDIA, que forma parte del sistema de decodificación especulativa del Nemotron-3.5-Lightning-30B-A3B. DFlash es un método de especulación que genera varios tokens candidatos en paralelo para que el modelo objetivo los verifique, reduciendo la latencia de decodificación. La arquitectura subyacente es un transformer MoE con atención estándar, pero este repositorio no contiene el modelo completo sino únicamente el draft, que es significativamente más pequeño (833M parámetros frente a los 30B del conjunto).

El proceso de conversión consistió en des-cuantizar los tensores NVFP4 de las capas MLP y fc a BF16, mientras que atención, embeddings y normas ya estaban en BF16 y se copiaron directamente. Se eliminó el campo `quantization_config` del `config.json` para que vLLM no interprete el modelo como NVFP4. Según el autor, se des-cuantizaron 19 matrices y se copiaron 51 tensores. No hay información sobre entrenamiento o ajuste fino; se trata exclusivamente de una transformación de formato de pesos.

## Capacidades

- No es un modelo de chat independiente; es un draft para decodificación especulativa (rol "draft only").
- Funciona exclusivamente emparejado con el modelo objetivo `SergiioB/Nemotron-3.5-Lightning-30B-A3B-GPTQ-INT4-G64-sym`.
- Diseñado para vLLM XPU, con soporte para la configuración DFlash (`speculative-config` con `num_speculative_tokens=7`).
- Requiere parches específicos en Intel Arc Pro B70 (native grouped-topk v2 + SSU B8/W4).
- No tiene capacidades de tool calling, vision, audio ni razonamiento multi-step por sí mismo; esas capacidades residen en el modelo objetivo.

## Casos de uso

- Aceleración de inferencia en Intel Arc Pro B70: el draft permite alcanzar 186,61 tokens/s en decodificación representativa (p2048/g128) y 157,92 t/s a p8192/g128, frente a 87,25 t/s sin especulación, según mediciones del publicador.
- Despliegue de Nemotron-3.5-Lightning-30B-A3B en hardware XPU con restricciones de VRAM: al usar el objetivo GPTQ INT4 (más compacto) junto con este draft BF16, se puede ejecutar el modelo en GPUs Intel de 32 GB.
- Investigación sobre decodificación especulativa en arquitecturas XPU: el repositorio incluye un cookbook con metodología, parches y comandos de lanzamiento reproducibles.
- Optimización de throughput en pipelines de generación de texto en producción: la configuración DFlash con 7 tokens especulativos y una tasa de aceptación del 52% reduce la latencia percibida.
- Evaluación comparativa de reconstrucción de pesos NVFP4 a BF16: el proceso documentado sirve como referencia para otros modelos NVIDIA en entornos sin soporte NVFP4.
- Benchmarking de rendimiento de vLLM XPU en GPUs Intel Arc Pro: los datos medidos (prefill, decode, aceptación) son útiles para planificar capacidad y coste.

## Benchmarks y rendimiento

El publicador proporciona mediciones reales en Intel Arc Pro B70 (aisladas, n=5 medianas, caché desactivada, límite de 150 W, DFlash con `n_spec=7`), usando el objetivo GPTQ INT4:

| Métrica | Valor |
|---|---|
| Decode representativo (p2048/g128) | 186,61 t/s (rango 174,60–201,83) |
| Decode p8192/g128 | 157,92 t/s (1,81× vs sin especulación: 87,25) |
| Prefill p8192/g1 (entrada fría) | 7160 t/s (tokens de prompt / TTFT del cliente, no aislado) |
| Tasa de aceptación de ventana | 52,0% (1830/3521) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) para esta reconstrucción, ya que no es un modelo de propósito general.

## Requisitos de hardware

- Probado en Intel Arc Pro B70 con 32 GB de VRAM.
- El draft en BF16 ocupa aproximadamente 1,7 GB (tamaño del repositorio), pero el modelo objetivo GPTQ INT4 (30B-A3B) requiere más VRAM; no se especifica el consumo exacto.
- Requiere vLLM XPU con parches del cookbook (native grouped-topk v2 + SSU B8/W4) y la variable `VLLM_XPU_ENABLE_XPU_GRAPH=1`.
- Opciones de despliegue: vLLM XPU con configuración especulativa DFlash; no es compatible con llama.cpp ni otros motores sin adaptación.
- Latencia y throughput: los valores indicados en la sección de benchmarks son representativos para el hardware probado; el rendimiento puede variar con otros modelos de GPU.

## Comparativa con modelos similares

No hay información disponible sobre modelos comparables en la documentación proporcionada. La única referencia es el modelo original de NVIDIA `NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4-DFlash`, del cual esta es una reconstrucción en BF16. No se dispone de datos de comparación con otros drafts o métodos de especulación (p. ej., EAGLE, Medusa) en hardware XPU.

## Limitaciones y advertencias

- Es un modelo "draft only": no funciona como modelo de chat independiente; emparejarlo con un objetivo incorrecto produce resultados inválidos.
- Es una reconstrucción no oficial: no publicada por NVIDIA, con riesgo de divergencias numéricas respecto al NVFP4 original.
- Requiere parches y configuración específica de vLLM XPU; sin ellos, el modelo no carga o falla en tiempo de ejecución.
- La licencia OpenMDW-1.1 puede imponer restricciones de uso comercial; se recomienda revisar los términos en el enlace de NVIDIA.
- El rendimiento medido es específico del hardware (Arc Pro B70) y de la configuración; extrapolar a otras GPUs puede llevar a conclusiones erróneas.
- No hay garantías de precisión ni de comportamiento en producción; el autor advierte explícitamente que no es un modelo oficial.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/SergiioB/Nemotron-3.5-Lightning-30B-A3B-DFlash-BF16
- Modelo objetivo GPTQ INT4: https://huggingface.co/SergiioB/Nemotron-3.5-Lightning-30B-A3B-GPTQ-INT4-G64-sym
- Modelo fuente de NVIDIA: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4-DFlash
- Cookbook de inferencia en Intel Arc Pro B70: https://github.com/SergiioB/intel-arc-pro-b70-inference-cookbook
- Documento de velocidad y capacidad de Nemotron DFlash: https://github.com/SergiioB/intel-arc-pro-b70-inference-cookbook/blob/main/docs/nemotron35-30a3/NEMOTRON-DFLASH-B70.md
- Receta de lanzamiento del modelo: https://github.com/SergiioB/intel-arc-pro-b70-inference-cookbook/blob/main/docs/nemotron35-30a3/NEMOTRON-B70.md
- Matriz de imágenes y parches: https://github.com/SergiioB/intel-arc-pro-b70-inference-cookbook/blob/main/docs/IMAGE-AND-PATCH-MATRIX.md
- Comandos de configuración completos: https://github.com/SergiioB/intel-arc-pro-b70-inference-cookbook/blob/main/docs/FULL-SETUP-COMMANDS.md
