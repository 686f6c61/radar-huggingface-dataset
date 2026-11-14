# kkkamur07/Ripple-65B-Preview-AQ-4.38bit

## Resumen

Ripple-65B-Preview-AQ-4.38bit es una cuantización de solo pesos del modelo base ricursiveAI/Ripple-65B-Preview (revision `b172323f`), publicada por el usuario kkkamur07. El programa de cuantización fue generado por un agente de código que operaba en un bucle OpenEvolve, y cada programa candidato se puntuó sobre el modelo completo de 80 capas. El resultado es un checkpoint que almacena los pesos a 4,38 bits por peso lineal (frente a los 16 bits del BF16 original), reduciendo el tamaño de descarga de 130 GB a 37 GB con una divergencia KL de 0,043 respecto al BF16, sensiblemente mejor que la línea base RTN 4-bit g128 (KL 0,149).

El modelo base es un transformer de 80 capas con 35.392.414.800 parámetros reales según los safetensors, pese a la denominación comercial "65B" del repositorio original. La cuantización afecta a las 640 capas lineales del decodificador (q, k, v, g, o, gate, up, down), mientras que embeddings, `lm_head`, normas y tensores pequeños permanecen en BF16.

Es relevante ahora porque demuestra una vía de compresión de pesos guiada por búsqueda evolutiva con agentes, con un presupuesto de bits no uniforme por capa y una evaluación KL sobre una mezcla representativa de tráfico agéntico y de razonamiento. No obstante, se trata de un formato de almacenamiento, no de un kernel rápido: tras la carga, el modelo se ejecuta en BF16 y requiere aproximadamente 130 GB de memoria de GPU.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de 80 capas (según model card); detalles internos del base no disponibles |
| Parámetros totales | 35.392.414.800 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Solo pesos, rejilla uniforme asimétrica, grupos de 128 columnas de entrada; 4,38 bits por peso lineal de media; escalas en fp16 y ceros en fp8 (e4m3) para módulos de 4 bits o menos |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (sujeta además a los términos del modelo base) |
| Formato de pesos | safetensors con `custom_code`; requiere `ripple_aq_loader.py` para desempaquetar y dequantizar a BF16 |

## Arquitectura y entrenamiento

El checkpoint es una cuantización de solo pesos del modelo ricursiveAI/Ripple-65B-Preview. El base es un transformer decoder-only de 80 capas con 35.392 millones de parámetros; no se dispone de información sobre la composición del dataset de entrenamiento original, el número de tokens, ni si hubo RLHF o DPO. La innovación técnica destacable está en el procedimiento de cuantización, no en el entrenamiento.

La cuantización se aplica a las 640 capas lineales del decodificador con un presupuesto de bits por módulo no uniforme: capas 0 y 1 a 8 bits; capas 2 y 3 a 5 bits; capa 4 a 6 bits; en el resto, `k_proj` y `v_proj` a 6 bits, `o_proj` a 5 bits en las capas 23 a 37, y el resto de lineales a 4 bits. El método encontrado por la búsqueda combina tres componentes: búsqueda de recorte ponderada por activaciones (13 factores de reducción del rango min/max por grupo, puntuados con el error de peso ponderado por la media de x² por columna de entrada, usando activaciones de calibración); reajuste de escala y cero por mínimos cuadrados ponderados con los códigos fijos, conservado solo cuando reduce el error; y almacenamiento de los ceros enteros en fp8 para módulos de 4 bits o menos, lo que rebaja el coste de un módulo 4-bit g128 de 4,25 a 4,19 bits por peso. Los datos de calibración son 16k tokens sin solapamiento con el conjunto de evaluación.

## Capacidades

- Generación de texto conversacional, heredada del modelo base; no se documentan capacidades específicas adicionales.
- No se dispone de información sobre razonamiento, código, matemáticas o visión en la información proporcionada.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (los idiomas no están declarados).
- Capacidad especial destacable del checkpoint: compresión de pesos con divergencia KL medida de 0,043 frente al BF16 sobre una mezcla de evaluación de 32k tokens (50 % trazas de código agéntico SWE-Gym OpenHands, 25 % OpenCodeReasoning, 15 % UltraChat, 10 % WikiText-103, en plantilla de chat).

## Casos de uso

- Almacenamiento y distribución del modelo con huella reducida: el checkpoint ocupa 37 GB en lugar de 130 GB, lo que facilita el traslado entre entornos y el archivo de versiones sin perder la referencia BF16, a costa de desempaquetar a BF16 en el momento de la carga.
- Evaluación de técnicas de cuantización guiada por agentes: sirve como referencia reproducible para comparar búsqueda evolutiva (OpenEvolve) frente a RTN 4-bit g128 en el mismo modelo base, con scripts `quantize_program.py` y `quant_config.json` incluidos.
- Investigación sobre presupuestos de bits no uniformes: la asignación por capa y por módulo (8 bits en las dos primeras capas, 5-6 bits en proyecciones sensibles) permite estudiar qué componentes concentran el error de cuantización.
- Reproducción de la métrica KL: el conjunto de evaluación y la metodología (KL media por token sobre 8 × 4096 tokens) están descritos, lo que permite replicar la medición con el mismo loader.
- Despliegue en máquinas con almacenamiento limitado pero GPU de gran memoria: al ejecutarse en BF16 tras la carga, encaja en un servidor con aproximadamente 130 GB de VRAM (por ejemplo, una GPU de 192 GB), no en GPUs de consumo.
- Integración en pipelines de transformers: el loader devuelve un modelo y tokenizador estándar, utilizable con `device_map="auto"` o en CPU, siempre que se acepte el coste de dequantización previo.

## Benchmarks y rendimiento

| Modelo | Bits por peso lineal | Tamaño (lineales + BF16) | KL vs BF16 (conjunto de evaluación) |
|---|---|---|---|
| BF16 original | 16 | 130 GB | 0 |
| RTN 4-bit, g128 (línea base) | 4,25 | 35,9 GB | 0,149 |
| **Este modelo (AQ-4.38bit)** | **4,38** | **37,0 GB** | **0,043** |
| Ripple-65B-Preview-AQ-3.54bit (hermano menor) | 3,54 | 30,3 GB | 0,089 |

La KL es la media por token de KL(BF16 || cuantizado) sobre 8 × 4096 tokens. No se han publicado resultados de benchmarks downstream (SWE-bench, HumanEval u otros) sobre este checkpoint en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 130 GB, porque el loader desempaqueta y dequantiza a BF16; el formato de 37 GB es solo de almacenamiento.
- GPU recomendadas: una GPU única de 192 GB (según la model card, `device="cuda"`); alternativamente `device_map="auto"` repartido entre varias GPU o ejecución en CPU.
- GPU de consumo: no cabe en RTX 4090 (24 GB) ni en GPUs de 48 GB; requiere hardware de clase A100/H100 de 80 GB en número suficiente o una GPU de 192 GB.
- Opciones de despliegue: transformers con el loader `ripple_aq_loader.py` (dependencias: torch, transformers, accelerate, safetensors, huggingface_hub). vLLM, llama.cpp y runtimes similares no pueden leer este formato.
- Latencia y throughput: equivalentes a BF16 tras la carga, según la model card; no se proporcionan cifras concretas. No hay kernels fusionados de bajo bit.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / bits | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ripple-65B-Preview-AQ-4.38bit | 35.392.414.800 | no disponible | safetensors custom, 4,38 bits/peso lineal, ejecución BF16 | apache-2.0 | Hugging Face, 0 descargas |
| Ripple-65B-Preview-AQ-3.54bit | no disponible | no disponible | safetensors custom, 3,54 bits/peso lineal | apache-2.0 (según repositorio hermano) | Hugging Face |
| ricursiveAI/Ripple-65B-Preview (BF16) | 35.392.414.800 (según derivado) | no disponible | BF16, 130 GB | la del modelo base | Hugging Face |
| RTN 4-bit g128 (línea base de cuantización) | mismo base | no disponible | 4,25 bits/peso lineal, 35,9 GB | no aplica | referencia metodológica, no un checkpoint publicado |

## Limitaciones y advertencias

- Es un formato de almacenamiento, no un kernel rápido: tras la carga se ejecuta en BF16 a velocidad BF16 y consume aproximadamente 130 GB de memoria de GPU; no hay kernels fusionados de bajo bit.
- vLLM, llama.cpp y otros runtimes habituales no pueden leer este formato; la integración queda limitada al loader propio.
- La KL se midió sobre una única mezcla de evaluación de 32k tokens; no se han ejecutado benchmarks downstream como SWE-bench o HumanEval sobre este checkpoint.
- El conjunto de evaluación se usó para seleccionar los programas durante la búsqueda, por lo que la KL reportada es optimista como estimación sobre texto nuevo; los tokens de calibración eran separados, pero no se ha reportado un conjunto held-out.
- El modelo base es una versión preview y sus términos y licencia aplican adicionalmente a la licencia apache-2.0 del checkpoint.
- Riesgo de alucinación, sesgos conocidos y limitaciones de idioma: no disponible en la información proporcionada.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin validación de la comunidad.

## Enlaces

- Hugging Face (este checkpoint): https://huggingface.co/kkkamur07/Ripple-65B-Preview-AQ-4.38bit
- Modelo base: https://huggingface.co/ricursiveAI/Ripple-65B-Preview
- Hermano menor (3,54 bits): https://huggingface.co/kkkamur07/Ripple-65B-Preview-AQ-3.54bit
- OpenEvolve (bucle de búsqueda evolutiva citado en la model card): no disponible como enlace en la información proporcionada
- Paper, blog o demo adicionales: no disponibles en la información proporcionada
