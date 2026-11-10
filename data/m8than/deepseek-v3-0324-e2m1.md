# m8than/DeepSeek-V3-0324-E2M1

## Resumen

DeepSeek-V3-0324-E2M1 es una conversión de pesos del modelo DeepSeek-V3-0324 (versión de marzo de 2024, 671.000 millones de parámetros totales en arquitectura Mixture-of-Experts) publicada por el usuario m8than en Hugging Face. El artefacto no es un modelo nuevo ni un fine-tuning: es una reempaquetado de cuantización que mantiene las capas de atención, MLP densas y expertos compartidos en FP8 E4M3 (con escalas de bloque FP32) y convierte los expertos enrutados a un formato E2M1 de 4 bits con escalas por bloque de 128×128. El objetivo es reducir el tamaño en disco y permitir la inferencia en GPUs AMD gfx942 (MI300X) mediante el runtime Furnace SGLang.

La relevancia de esta ficha es doble. Por un lado, documenta un ejemplo real de cuantización extrema (4 bits) sobre un MoE de gran escala, con las limitaciones que ello implica: la conversión de los expertos enrutados es declarada como "lossy" y el autor no ha ejecutado ninguna prueba de precisión ni de inferencia. Por otro, sirve como referencia de los requisitos de hardware y software (kernels AITER/CK, SGLang parcheado) que este tipo de artefactos impone, y que difieren sustancialmente de los de un checkpoint estándar en safetensors o GGUF.

El repositorio ocupa 716,1 GB y declara 101.045.381.888 parámetros en el campo de safetensors, un valor que no coincide con los 671.000 millones del modelo base y que probablemente refleja solo los tensores cuantizados o un recuento parcial. La licencia es MIT, heredada del modelo original, y el pipeline declarado es text-generation.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (deepseek_v3), con código personalizado (`custom_code`) |
| Parametros totales | 101.045.381.888 según safetensors del repo; el modelo base DeepSeek-V3-0324 declara 671.000 millones |
| Parametros activos | no disponible en la información proporcionada |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantizacion | FP8 E4M3 con escalas de bloque FP32 para atención, MLP densas y expertos compartidos; E2M1 de 4 bits (U32 + escalas FP32) para expertos enrutados; bloques de 128×128 |
| Idiomas soportados | no disponible en la información proporcionada |
| Licencia | MIT |
| Formato de pesos | safetensors con `quant_method: moe_e2m1` y `dense_weight_format: fp8_block128`; requiere cargador con soporte de código personalizado |

## Arquitectura y entrenamiento

El modelo subyacente es DeepSeek-V3-0324, un transformer con mezcla de expertos (MoE) de la familia DeepSeek-V3. La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset ni las fases de RLHF/DPO del modelo original; esos datos deben consultarse en la model card de deepseek-ai/DeepSeek-V3-0324, que no forma parte del material proporcionado. Lo que sí documenta esta ficha es la intervención de cuantización: se parte de `CPU-Hybrid-MoE/DeepSeek-V3-0324-GPU-FP8-GPTQ4` en la revisión `e02f3fb1f5cede77aad5836b575d11b14a622680` y se aplica una conversión "Furnace gfx942".

La conversión conserva los bytes FP8 E4M3 originales (con sus escalas FP32 `weight_scale_inv` por bloque) en las capas de atención, las MLP densas y los expertos compartidos: 496 tensores FP8 y 496 escalas FP32 verificados por hash como idénticos al origen. Los expertos enrutados se reempaquetan en E2M1 canónico con orden low-nibble-first, usando tensores U32 para los pesos y FP32 para las escalas, con bloques de 128×128. El autor advierte explícitamente de que esta conversión de expertos es con pérdida y de que no se ha realizado ninguna prueba de precisión; tampoco se ejecutó inferencia del artefacto durante la conversión. El manifiesto reporta `status=complete` y `servable=true`, pero esa marca se refiere a la integridad estructural de los tensores, no a una validación funcional.

## Capacidades

- Generación de texto y conversación multi-turno, heredadas del modelo base DeepSeek-V3-0324.
- Razonamiento y matemáticas: capacidades propias del modelo original, no verificadas en esta conversión.
- Generación de código: capacidad del modelo base, no validada en el artefacto cuantizado.
- Tool calling y function calling: presumiblemente soportados por herencia del modelo base, pero no documentados en la información disponible.
- Uso en agentes y razonamiento multi-paso: no documentado en la información disponible.
- Capacidades multilingües: no documentadas en la información disponible.
- Modo thinking, visión o audio: no documentados en la información disponible.
- Ejecución específica en GPUs AMD gfx942 con Furnace SGLang y kernels AITER/CK; no compatible con cargadores que esperen escalas MXFP4 de grupo 32.

## Casos de uso

- Evaluación de cuantización extrema en MoE: el artefacto sirve para estudiar el impacto de bajar los expertos enrutados a 4 bits (E2M1) sobre un modelo de 671.000 millones, comparando salidas contra el checkpoint FP8 de origen en un entorno controlado.
- Investigación en hardware AMD: permite probar la pila Furnace SGLang, AITER y CK sobre MI300X (gfx942) con un modelo de gran escala, un escenario poco cubierto por los artefactos orientados a CUDA.
- Despliegue en clústeres con VRAM limitada: al reducir el peso de los expertos enrutados, el checkpoint completo ocupa 716,1 GB en disco, lo que facilita su distribución en nodos con menos memoria que la necesaria para el modelo en BF16.
- Reproducción de pipelines de conversión: el manifiesto con hashes y la verificación byte a byte de los tensores densos y compartidos sirven como plantilla para auditar conversiones propias de FP8 a formatos de 4 bits.
- Benchmarking de kernels: útil para medir throughput y latencia de los kernels E2M1/FP8 block-128 en SGLang frente a alternativas FP8 o BF16, siempre que se acepte que la precisión no está validada.
- Docencia y divulgación técnica: como ejemplo documentado de las diferencias entre formatos de cuantización (MXFP4, E2M1, FP8 block-128) y de por qué un artefacto "servable" no equivale a un modelo validado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no se realizó ninguna prueba de precisión y que la inferencia del artefacto no se ejecutó durante la conversión.

## Requisitos de hardware

- GPU: exclusivamente AMD gfx942 (MI300X y familia). No se documenta soporte para CUDA, A100, H100 ni RTX 4090.
- Runtime: Furnace SGLang con soporte dense-FP8 E2M1, más kernels AITER/CK. No es compatible con vLLM, llama.cpp, Ollama ni TGI estándar, ni con cargadores que esperen escalas MXFP4 de grupo 32.
- VRAM estimada: no disponible en la información proporcionada; el repo ocupa 716,1 GB en disco, por lo que se requiere un nodo multi-GPU con esa capacidad agregada como mínimo.
- Cabe en GPU consumer: no. El tamaño del checkpoint y la dependencia de gfx942 lo impiden.
- Latencia y throughput: no disponibles; no se ejecutó inferencia durante la conversión.
- Precisión de activaciones: ruta E2M1/FP8 block-128 con salidas en BF16.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V3-0324-E2M1 (este) | 671.000 M (base); 101.045 M declarados en safetensors | no disponible | FP8 E4M3 + E2M1 4 bits, bloques 128×128 | MIT | Hugging Face, 380 descargas |
| deepseek-ai/DeepSeek-V3-0324 | 671.000 M | no disponible en esta ficha | BF16 nativo | MIT (según modelo base) | Hugging Face, oficial |
| CPU-Hybrid-MoE/DeepSeek-V3-0324-GPU-FP8-GPTQ4 | 671.000 M (base) | no disponible | FP8 + GPTQ 4 bits | no disponible | Hugging Face, origen de esta conversión |

La comparación con alternativas de otros desarrolladores (por ejemplo, otros MoE de gran escala) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- La conversión de expertos enrutados a E2M1 es declarada como lossy por el autor; no hay benchmarks ni evaluación de precisión que cuantifiquen la degradación.
- No se ejecutó inferencia del artefacto durante la conversión: `servable=true` refleja integridad de tensores, no funcionamiento validado.
- El recuento de parámetros de safetensors (101.045.381.888) no coincide con los 671.000 millones del modelo base; conviene tratar ese dato con cautela.
- Dependencia dura de GPUs AMD gfx942 y de un runtime parcheado (Furnace SGLang + AITER/CK): no es portable a CUDA ni a cargadores estándar.
- Incompatibilidad con cargadores que esperan escalas MXFP4 de grupo 32; el formato no es MXFP4 nativo.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; deben asumirse los del modelo base.
- Idiomas soportados y longitud de contexto: no disponibles en la información proporcionada.
- Licencia MIT heredada, lo que en principio permite uso comercial, pero sin garantías del autor sobre el comportamiento del artefacto cuantizado.
- Para producción, la ausencia de validación funcional y de benchmarks desaconseja su uso sin una evaluación previa contra el checkpoint FP8 de referencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/m8than/DeepSeek-V3-0324-E2M1
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V3-0324
- Checkpoint de origen de la cuantización: https://huggingface.co/CPU-Hybrid-MoE/DeepSeek-V3-0324-GPU-FP8-GPTQ4
- Revisión de origen citada: `e02f3fb1f5cede77aad5836b575d11b14a622680` (en el repositorio anterior)
- Paper, blog, repositorio de código o demo: no disponibles en la información proporcionada.
