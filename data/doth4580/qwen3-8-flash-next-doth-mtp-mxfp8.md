# doth4580/Qwen3.8-Flash-Next-DotH-MTP-MXFP8

## Resumen

Qwen3.8-Flash-Next-DotH-MTP-MXFP8 es una cabeza de predicción multi-token (MTP, *multi-token prediction*) reentrenada para el modelo Qwen3.8-Flash-Next, publicada por el usuario doth4580. No se trata de un modelo completo, sino de un componente auxiliar de decodificación especulativa: la pequeña red "borrador" (*drafter*) que propone los siguientes tokens para que el modelo principal los verifique en paralelo. Su función es acelerar la decodificación sin alterar el texto generado, ya que la decodificación especulativa es sin pérdidas por construcción.

La innovación principal es que solo las capas densas de la cabeza fueron reentrenadas sobre las propias salidas de Flash-Next, mientras que los 512 expertos enrutados se conservan intactos del modelo original. Esta versión concreta está cuantizada en MXFP8 (FP8 E4M3 con una escala compartida por cada 32 pesos) y está diseñada específicamente para instalarse sobre el paquete FP4-Local de NVIDIA, sirviéndose con el motor veloGB10 en hardware DGX Spark (GB10).

Es relevante para quienes despliegan Qwen3.8-Flash-Next en entornos con recursos limitados y quieren rascar unos puntos porcentuales de velocidad de decodificación en cargas de agentes y código. Las ganancias son modestas y dependen de la petición, por lo que debe evaluarse como una optimización marginal, no como un cambio de paradigma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabeza MTP (drafter de decodificación especulativa) sobre un transformer MoE; capas lineales densas en MXFP8, normas, mezcladores de hiperconexión y router en bf16 |
| Parametros totales | no disponible (la parte reentrenada ocupa 114 MB en MXFP8; la cabeza completa en bf16 son 5,2 GB, de los cuales 5,0 GB son los 512 expertos enrutados) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP8 (FP8 E4M3 con escala de potencia de dos por cada 32 pesos); existen variantes bf16 y EXL3 (3,05 bpw y 4,05 bpw) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | safetensors (MXFP8) |

## Arquitectura y entrenamiento

La cabeza MTP mantiene la misma arquitectura, nombres de tensores y formas que la cabeza original de Qwen3.8-Flash-Next. Consta de 37 tensores no expertos: 10 capas lineales en MXFP8, más normas, mezcladores de hiperconexión y el router en bf16. Los 512 expertos enrutados no forman parte de este repositorio: la cabeza reutiliza los expertos NVFP4 ya presentes en el paquete FP4-Local de NVIDIA. La proyección del indexador (`index_qk_proj`) tampoco fue reentrenada; es la original, redondeada de la misma forma.

El entrenamiento se limitó a las capas densas de la cabeza, sobre las propias salidas de Flash-Next. No se dispone de información sobre el volumen de tokens, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. La motivación del reentrenamiento es aumentar la tasa de aceptación de tokens propuestos, lo que se traduce en velocidad de decodificación, sin tocar la distribución de salida del modelo principal.

## Capacidades

- Aceleración de decodificación especulativa: propone tokens que el modelo completo verifica, reduciendo el coste por token generado.
- Compatibilidad de arquitectura: mismos nombres y formas de tensores que la cabeza original, lo que permite sustituirla sin cambios en el motor.
- Decodificación sin pérdidas: al verificar el modelo completo cada token propuesto, la salida greedy es idéntica byte a byte a la del modelo sin esta cabeza.
- Integración con el paquete FP4-Local de NVIDIA mediante el script `apply_head.py`.
- Soporte en el motor veloGB10 sobre hardware GB10 (DGX Spark).
- No soporta tool calling, agentes, visión ni audio por sí misma: es un componente auxiliar, no un modelo conversacional.

## Casos de uso

- Servicio de agentes en DGX Spark: instalar la cabeza sobre el paquete FP4-Local para obtener un +3,2 % de velocidad de decodificación en peticiones de agentes y código, según las mediciones del autor en veloGB10.
- Generación de código interactiva: el autor reporta ganancias cercanas a cero en peticiones de código simples, por lo que su uso tiene más sentido en flujos con prompts largos de agente que en autocompletado puro.
- Despliegue con cuantización agresiva: al ocupar solo 114 MB la parte reentrenada, encaja en entornos donde el presupuesto de VRAM es ajustado y se reutilizan los expertos NVFP4 del paquete base.
- Experimentación con decodificación especulativa: sirve como referencia para comparar tasas de aceptación entre distintas cabezas (bf16, MXFP8, EXL3) sobre el mismo modelo base.
- Sustitución drop-in en pipelines existentes: `apply_head.py` genera una copia del directorio del modelo con la cabeza instalada, sin tocar el original, lo que facilita pruebas A/B controladas.
- Investigación sobre reentrenamiento de drafters: el enfoque de reentrenar solo las capas densas sobre las salidas del modelo principal es replicable para otros MoE con cabezas MTP.

## Benchmarks y rendimiento

El autor publica mediciones de velocidad en veloGB10 con el paquete FP4-Local de NVIDIA, comparando con la cabeza estándar (una versión EXL3 de 2,6 bpw) y con la cabeza estándar en bf16 del mismo tamaño:

| Comparación | Resultado |
|---|---|
| Frente a la cabeza EXL3 de 2,6 bpw del paquete, en peticiones de agente y código | +3,2 % de velocidad de decodificación |
| Frente a la misma, en código simple y prompt largo de agente | aproximadamente igual |
| Frente a la misma, con 4 peticiones simultáneas | 3,1 % más lento |
| Frente a la cabeza estándar en bf16 del mismo tamaño | +6,7 % |
| EXL3 4,05 bpw frente a la cabeza del paquete (benchmark corto de 8 secciones, una petición cada una) | +2,4 %, más rápido en 7 de 8 secciones |
| EXL3 3,05 bpw frente a la cabeza del paquete (mismo benchmark corto) | +4,6 %, aunque una cabeza estándar recuantizada ganó una cantidad similar |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible, y en cualquier caso no aplicarían: la cabeza no altera las respuestas del modelo.

## Requisitos de hardware

- VRAM estimada: 114 MB adicionales para la parte reentrenada en MXFP8, más el espacio del paquete FP4-Local completo sobre el que se instala.
- GPU recomendadas: NVIDIA GB10 (DGX Spark) con el motor veloGB10; el autor no reporta pruebas en otras GPU.
- Cabe en GPU de consumo: no disponible; el hardware de referencia es un sistema DGX Spark, no una GPU de escritorio convencional.
- Opciones de despliegue: veloGB10 con `--model-dir` sobre el directorio generado por `apply_head.py`; vLLM no está probado con esta variante MXFP8 (para vLLM se recomienda la versión bf16).
- Latencia y throughput: el autor reporta las variaciones porcentuales de velocidad de decodificación indicadas en la sección de benchmarks; no se publican valores absolutos de tokens por segundo.

## Comparativa con modelos similares

| Cabeza MTP | Formato | Tamaño de la parte reentrenada | Destino | Medición en GB10 |
|---|---|---|---|---|
| DotH-MTP-BF16 | bf16 | 178 MB | Cualquier motor; shard drop-in para vLLM y veloGB10 con FP4-Local | Velocidad medida |
| DotH-MTP-MXFP8 (esta) | MXFP8 | 114 MB | FP4-Local de NVIDIA en veloGB10 | Servida; velocidad no medida |
| DotH-MTP-EXL3-3.05bpw | EXL3, 4-5 bits | 83 MB | Paquete EXL3 de 3,05 bpw en veloGB10 | Velocidad medida |
| DotH-MTP-EXL3-4.05bpw | EXL3, 5-6 bits | 92 MB | Paquete EXL3 de 4,05 bpw en veloGB10 | Velocidad medida |

## Limitaciones y advertencias

- La ganancia de velocidad es pequeña y depende de la petición: +3,2 % en agentes y código, neutra en código simple y prompt largo, y un 3,1 % más lenta con 4 peticiones concurrentes.
- Diseñada exclusivamente para el paquete FP4-Local de NVIDIA; con cualquier otra cuantización de Flash-Next no está probada.
- No probada en vLLM: la configuración de FP4-Local de NVIDIA no declara MXFP8 para estas capas.
- Los resultados de EXL3 provienen de un benchmark corto de 8 secciones con una petición cada una, por lo que su fiabilidad estadística es limitada.
- No altera las respuestas del modelo, de modo que no mejora la calidad ni corrige sesgos o alucinaciones del modelo base.
- Licencia qwen-community-1.0: conviene revisar sus términos antes de un uso comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación independiente por parte de la comunidad.
- El autor no documenta los idiomas soportados ni la longitud de contexto de la cabeza.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/doth4580/Qwen3.8-Flash-Next-DotH-MTP-MXFP8
- Cabeza base en bf16: https://huggingface.co/doth4580/Qwen3.8-Flash-Next-DotH-MTP-BF16
- Variante EXL3 3,05 bpw: https://huggingface.co/doth4580/Qwen3.8-Flash-Next-DotH-MTP-EXL3-3.05bpw
- Variante EXL3 4,05 bpw: https://huggingface.co/doth4580/Qwen3.8-Flash-Next-DotH-MTP-EXL3-4.05bpw
- Modelo base Qwen3.8-Flash-Next: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Paquete FP4-Local de NVIDIA: https://huggingface.co/nvidia/Qwen3.8-Flash-Next-FP4-Local
