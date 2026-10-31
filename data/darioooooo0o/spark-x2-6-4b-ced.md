# darioooooo0o/Spark-X2.6-4B-CED

## Resumen

Spark-X2.6-4B-CED es un artefacto experimental de investigación creado por el usuario darioooooo0o a partir del modelo XHToken/Spark-X2.6-4B (4.138 millones de parámetros, 36 capas). El proyecto adapta el modelo original a una arquitectura de codificador-decodificador causal (CED, "Causal Encoder-Decoder"), el mismo diseño descrito para DeepSeek-V4.1-Flash (arXiv 2609.19969), sin preentrenar nada desde cero. El objetivo es acelerar el prefill (el procesado del prompt) proyectando las claves y valores de atención global del decodificador desde el último estado oculto del codificador.

Existen dos versiones: la v1 (split en la capa 18, con destilación y LoRA) y la v2 (split en la capa 24, sin ningún entrenamiento, solo 6 matrices de proyección ajustadas por regresión ridge). La v2 recupera la mayor parte de la calidad en contexto largo que perdía la v1, a cambio de un speedup de prefill menor (aproximadamente 1,3x-1,4x frente a 1,5x-1,7x). Se distribuye en formato GGUF para un fork de llama.cpp y como pesos de proyección en safetensors. No es un modelo "drop-in": ni llama.cpp stock ni vLLM pueden cargarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal encoder-decoder (CED) experimental sobre transformer con sliding-window attention y capa global cada 4 capas |
| Parametros totales | 4.138.293.760 (modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Evaluado hasta 32K tokens; máximo oficial no disponible |
| Tipos de cuantizacion | Q8_0 y Q4_K_M (GGUF, con imatrix de bartowski) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fork de llama.cpp) y safetensors (solo las 6 proyecciones, bf16, 31 MB) |

## Arquitectura y entrenamiento

El modelo base Spark-X2.6-4B es un transformer decoder de 36 capas con atención sliding-window y una capa de atención global cada 4 capas. La conversión a CED sigue el esquema de DeepSeek-V4.1-Flash: el prefill ejecuta el codificador sobre todo el prompt y el decodificador solo sobre los últimos `replay` tokens, reduciendo cerca de un tercio (v2) o la mitad (v1) del cómputo de prefill. Las K/V de las capas de atención global del decodificador se proyectan desde el estado oculto del codificador: en v2, C_l = RMSNorm(H_24) W_l, con las capas 0-23 como codificador (pesos originales, incluida la capa global 23) y las capas 24-35 como decodificador, cuyas 3 capas globales (27, 31, 35) leen K/V proyectadas. Las K/V sliding-window del decodificador se reconstruyen por "bounded replay" de los últimos tokens del prompt. El cómputo de decodificación y el tamaño de la KV-cache no cambian.

La v2 no está entrenada: sus 6 matrices de proyección (~0,5M de parámetros efectivos en el ajuste) son una regresión ridge en forma cerrada sobre ~0,5M de tokens de PG19, código, chat y datos sintéticos de recuperación. La v1 sí fue entrenada por destilación contra el modelo original (KL sobre logits + MSE de estados ocultos, sin etiquetas), con ~50M de tokens en total: inicialización ridge de 10 proyecciones K/V (26M de parámetros), LoRA rango 16 en las 18 capas del decodificador, LoRA rango 16 en las capas del codificador 14-17 (datos: libros PG19, código de GitHub, WildChat) y 300 pasos adicionales con respuestas muestreadas del propio modelo sobre GSM8K-train. Las capas 0-13 del codificador son bit a bit idénticas al original y la LoRA puede plegarse en los pesos.

## Capacidades

- Generacion de texto conversacional (pipeline text-generation, tag "conversational").
- Razonamiento y matematicas heredados del modelo base: 85/100 en GSM8K (greedy) en la v2, frente a 89 del original.
- Recuperacion en contexto largo: 88% en RULER (multi-key needles + variable tracking) y 31% en NoLiMa en la v2, cerca del original (90% y 33%).
- Aceleracion de prefill: 1,26x-1,43x en llama.cpp (v2) frente al modelo original, manteniendo la velocidad de decode intacta.
- Ejecucion en PyTorch (demo.py incluido) y en un fork de llama.cpp mediante la clave GGUF `spark2_5.ced.split`.
- No hay informacion sobre tool calling, agentes, vision ni audio.

## Casos de uso

- Investigacion en arquitecturas de atencion: es un banco de pruebas real del diseno CED de DeepSeek-V4.1-Flash sobre un modelo existente, util para estudiar la relacion entre punto de split, fidelidad de proyeccion K/V y calidad de recuperacion.
- Servir de prompts muy largos con presupuesto de computo limitado: el prefill reducido (hasta 1,43x en llama.cpp a 32K) beneficia escenarios donde se procesan contextos extensos repetidamente y la latencia de primera respuesta importa.
- Experimentacion con llama.cpp en hardware local: los GGUF Q4_K_M y Q8_0 se han validado en una Intel Arc Pro B70 via Vulkan, lo que demuestra viabilidad en GPU de consumo no NVIDIA.
- Analisis de destilacion sin etiquetas: la v1 muestra un pipeline completo de destilacion por KL contra el propio modelo, replicable en otros modelos.
- Chatbot local con contexto de hasta 32K tokens en modo greedy y sin thinking, asumiendo la ligera perdida de calidad frente al original.
- Generacion de codigo y matematicas ligeras: el conjunto de datos de destilacion incluyo codigo de GitHub y GSM8K, y la v2 mantiene 85/100 en GSM8K.

## Benchmarks y rendimiento

Datos publicados por el autor (v1 = split 18 entrenada; v2 = split 24 sin entrenar):

| Benchmark | v1 | v2 | Original |
|---|---|---|---|
| RULER (multi-key needles + variable tracking), 138 items | 69% | 88% | 90% |
| NoLiMa (36 items) | 8% | 31% | 33% |
| BABILong qa1-3 (54 items) | 52% | 43% | 50% |
| Total 138 items | 47% | 55% | 59% |
| KL(original ‖ CED) PG19 / code / chat (replay 1024) | 0,066 / 0,095 / 0,105 | 0,040 / 0,083 / 0,052 | 0 |
| Top-1 agreement con el original | 0,885 / 0,922 / 0,889 | 0,896 / 0,937 / 0,913 | 1 |
| Needles con 4 distractores (4K / 8K / 16K, 20 trials) | 19 / 18 / 20 | 20 / 20 / 20 | 20 / 20 / 20 |
| GSM8K (100 preguntas, greedy) | 87 | 85 | 89 |
| Speedup prefill PyTorch (4K / 8K / 16K) | 1,52x / 1,67x / 1,72x | 1,35x / 1,42x / 1,46x | 1x |

Throughput de prefill en llama.cpp (Intel Arc Pro B70, Vulkan, Q4_K_M, replay 1024), tokens/s a 4K / 8K / 16K / 32K: original 2867 / 2503 / 1942 / 1332; v1 4234 / 4147 / 3535 / 2595 (1,48x-1,95x); v2 3616 / 3358 / 2710 / 1907 (1,26x-1,43x). Paridad GGUF: KL medio de 3,5e-4 a 2,3e-3 frente al camino PyTorch.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; con 4,14B de parametros, Q4_K_M ocupa aproximadamente 2,5-3 GB y Q8_0 unos 4,5 GB, mas la KV-cache (sin cambios respecto al original).
- GPU de referencia validada: Intel Arc Pro B70 (16 GB) via Vulkan en llama.cpp; el entrenamiento de la v1 se hizo en esa misma tarjeta (~6 h).
- Cabe en GPU de consumo: si, incluidas GPUs no NVIDIA, dado que se ha demostrado sobre Vulkan.
- Despliegue: unicamente PyTorch (demo.py del repo) o un fork especifico de llama.cpp publicado por el autor. Stock llama.cpp y vLLM no pueden cargar el modelo.
- Latencia: decode a la misma velocidad que el original; prefill acelerado 1,26x-1,43x (v2) o hasta 1,95x (v1) segun longitud de contexto.

## Comparativa con modelos similares

| | Spark-X2.6-4B-CED v2 | Spark-X2.6-4B (base) | DeepSeek-V4.1-Flash (referencia CED) |
|---|---|---|---|
| Parametros | 4,14B (+ ~0,5M de proyecciones) | 4,14B | no disponible |
| Arquitectura | CED split capa 24 | Decoder 36 capas, SWA + global cada 4 | CED (arXiv 2609.19969) |
| RULER | 88% | 90% | no disponible |
| GSM8K | 85 | 89 | no disponible |
| Speedup prefill | 1,26x-1,43x | 1x | no disponible |
| Licencia | Apache 2.0 | no disponible en la ficha | no disponible |
| Disponibilidad | GGUF en fork de llama.cpp + PyTorch | Pesos originales | no disponible |

## Limitaciones y advertencias

- Es un artefacto experimental de investigacion, no un modelo de produccion: requiere un fork de llama.cpp y no funciona con llama.cpp stock ni vLLM.
- La v2 pierde parte de la calidad del original: KL de 0,040-0,083 frente al original y 55% frente a 59% en el conjunto de 138 items de contexto largo; BABILong cae a 43% (original: 50%).
- La v1 degrada severamente la recuperacion en contexto largo (8% en NoLiMa, 69% en RULER); se recomienda la v2.
- El speedup de prefill de la v2 es moderado (1,26x-1,43x), sensiblemente menor que el de la v1.
- Riesgo de alucinacion y sesgos: no disponible informacion especifica; hereda los del modelo base Spark-X2.6-4B, sobre el que no se detallan datos.
- Idiomas soportados no documentados; los datos de destilacion (PG19, GitHub, WildChat) sugieren predominio de ingles.
- La licencia Apache 2.0 del derivado no impone restricciones comerciales, pero la licencia del modelo base debe verificarse por separado.
- Las mediciones de velocidad en llama.cpp usan prompts de tokens repetidos en condiciones controladas; los speedups reales pueden variar.

## Enlaces

- Ficha del modelo: https://huggingface.co/darioooooo0o/Spark-X2.6-4B-CED
- Modelo base: https://huggingface.co/XHToken/Spark-X2.6-4B
- Paper CED (DeepSeek-V4.1-Flash): https://arxiv.org/abs/2609.19969
