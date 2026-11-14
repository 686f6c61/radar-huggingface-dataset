# kkkamur07/Ripple-65B-Preview-AQ-3.54bit

## Resumen

Ripple-65B-Preview-AQ-3.54bit es una cuantización de solo pesos del modelo ricursiveAI/Ripple-65B-Preview (revisión `b172323f`), publicada por el usuario kkkamur07. No se trata de un modelo nuevo entrenado desde cero, sino de un checkpoint derivado cuyo interés reside en el método: el programa de cuantización fue generado por un agente de código que operaba dentro de un bucle OpenEvolve, evaluando cada programa candidato sobre el modelo completo de 80 capas. El resultado es un formato de almacenamiento que comprime el modelo de 130 GB en BF16 a unos 30,3 GB, con una divergencia KL media de 0,089 frente al original.

El modelo base, Ripple-65B-Preview, es una versión preview de ricursiveAI cuya arquitectura exacta, datos de entrenamiento y capacidades no se detallan en la información disponible. A pesar del nombre comercial "65B", el recuento real de parámetros en safetensors es de 28.750.996.560 (aproximadamente 28,75 mil millones), dato que conviene tener presente al planificar el despliegue. La ficha se centra, por tanto, en las características verificables de esta cuantización y en sus implicaciones prácticas.

La relevancia de esta publicación es doble: por un lado, demuestra una estrategia de cuantización evolutiva con asignación de bits por módulo (de 3 a 6 bits según capa y proyección) y búsqueda de factores de recorte ponderados por activaciones; por otro, expone con claridad sus limitaciones, en particular que se trata de un formato de almacenamiento y no de un kernel rápido de inferencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder con 80 capas (detalles adicionales no disponibles) |
| Parámetros totales | 28.750.996.560 (según safetensors) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Solo pesos, asimétrica uniforme en grupos de 128 columnas de entrada; 3,54 bits por peso lineal de media; módulos de 3, 4, 5 y 6 bits; escalas en fp16 y ceros enteros en fp8 (e4m3) para módulos de 4 bits o menos |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (sujeta además a los términos del modelo base, que es una preview) |
| Formato de pesos | safetensors con código de carga personalizado (`ripple_aq_loader.py`), etiquetado como 8-bit en los tags de Hugging Face |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder de 80 capas. La información disponible no detalla el número de cabezas, la dimensión oculta, el mecanismo de atención ni el esquema de entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO). Lo que sí se describe con precisión es el proceso de cuantización aplicado sobre él.

La cuantización afecta a las 640 capas lineales del decoder (q, k, v, g, o, gate, up y down en las 80 capas). Se mantienen en BF16 los embeddings, el `lm_head`, todas las normalizaciones y los tensores pequeños; las activaciones y la caché KV no se cuantizan. La asignación de bits es heterogénea: las capas 0 y 1 usan 6 bits, las capas 2 y 3 usan 4 bits, la capa 4 usa 5 bits, y en el resto k_proj y v_proj usan 6 bits, las demás proyecciones de atención 4 bits y gate_proj, up_proj y down_proj 3 bits (down_proj sube a 4 bits en las capas 78 y 79). El método combina una búsqueda de recorte ponderada por activaciones (17 factores de reducción entre 1,0 y 0,6 para módulos de 6 bits o menos, puntuados con el error de peso ponderado por la media de x² por columna de entrada), un reajuste de escala y cero por mínimos cuadrados ponderados con los códigos fijos, y un almacenamiento compacto de ceros en fp8 que reduce el coste de un módulo de 4 bits en grupos de 128 de 4,25 a 4,19 bits por peso. La configuración exacta por módulo está en `quant_config.json` y el programa generador en `quantize_program.py`.

## Capacidades

- Generación de texto conversacional, según la etiqueta `text-generation` y el pipeline declarado.
- Alineación con plantilla de chat: los datos de calibración y evaluación se procesaron "en la plantilla de chat", lo que sugiere soporte de formato conversacional.
- Capacidad de razonamiento y código inferida del modelo base: la mezcla de evaluación incluye trazas de coding agéntico (SWE-Gym OpenHands) y OpenCodeReasoning, aunque no se confirma que el modelo las domine.
- No se dispone de información sobre tool calling, function calling, uso de agentes multi-paso, capacidades multimodales, modo thinking, audio o visión.
- Cobertura multilingüe: no disponible.

## Casos de uso

- Archivado y distribución de checkpoints: gracias a la reducción de 130 GB a 30,3 GB, el modelo puede almacenarse y transferirse en infraestructuras con límites de espacio, descomprimiéndose a BF16 en el momento de la carga.
- Evaluación de métodos de cuantización: el par `quantize_program.py` y `quant_config.json` permite reproducir y auditar la asignación de bits por módulo, útil para investigadores que estudien compresión de modelos.
- Investigación sobre cuantización evolutiva: sirve como caso de estudio de un bucle OpenEvolve aplicado a la optimización de programas de cuantización con puntuación KL sobre el modelo completo.
- Despliegue en entornos con GPU de gran memoria: tras la dequantización a BF16 requiere unos 130 GB de VRAM, por lo que encaja en nodos con una GPU de 192 GB o con `device_map="auto"` repartido entre varias GPU.
- Pruebas en CPU: el cargador admite `device="cpu"`, lo que permite inspeccionar el modelo o ejecutar inferencia lenta sin GPU.
- Comparación de fidelidad entre cuantizaciones: junto con el hermano `Ripple-65B-Preview-AQ-4.38bit` (37,0 GB, KL 0,043) y la línea base RTN 4-bit g128 (35,9 GB, KL 0,149), permite estudiar el compromiso entre tamaño y divergencia.
- Generación de texto en pipelines de transformers: al cargarse como un modelo estándar de la librería `transformers` con código personalizado, puede integrarse en flujos existentes basados en esa librería, siempre que se acepte el coste de memoria en BF16.

## Benchmarks y rendimiento

| Modelo | Bits por peso lineal | Tamaño (lineales + BF16) | KL vs BF16 (conjunto de evaluación) |
|---|---|---|---|
| BF16 original | 16 | 130 GB | 0 |
| RTN 4-bit, g128 (línea base) | 4,25 | 35,9 GB | 0,149 |
| **Este modelo (AQ-3.54bit)** | **3,54** | **30,3 GB** | **0,089** |
| Ripple-65B-Preview-AQ-4.38bit | 4,38 | 37,0 GB | 0,043 |

La KL es la media por token de KL(BF16 || cuantizado) sobre 8 secuencias de 4096 tokens. La mezcla de evaluación es 50 % trazas de coding agéntico (SWE-Gym OpenHands), 25 % OpenCodeReasoning, 15 % UltraChat y 10 % WikiText-103, todo en la plantilla de chat; los datos de calibración (16k tokens) no se solapan con el conjunto de evaluación. No se han publicado resultados de benchmarks downstream (SWE-bench, HumanEval u otros) para este checkpoint.

## Requisitos de hardware

- VRAM para inferencia: unos 130 GB en BF16 tras la dequantización, ya que no existen kernels fusionados de bajo bit.
- GPU recomendadas: una GPU de 192 GB (por ejemplo, H100 de 192 GB según la model card) o reparto multi-GPU con `device_map="auto"`.
- GPU de consumo: no cabe en tarjetas consumer (RTX 4090 de 24 GB, etc.) en su forma operativa; solo el archivo comprimido de 30,3 GB ya excede la memoria de la mayoría de estas GPU.
- Opciones de despliegue: cargador propio `ripple_aq_loader.py` sobre `transformers`, `accelerate` y `safetensors`. vLLM, llama.cpp, Ollama y TGI no pueden leer este formato según la propia model card.
- Latencia y throughput: no disponibles; se ejecuta a velocidad de BF16, sin aceleración por kernels de bajo bit.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tamaño en disco | KL vs BF16 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Ripple-65B-Preview-AQ-3.54bit | 28,75 B | no disponible | 30,3 GB | 0,089 | Apache 2.0 (+ términos del base) | Hugging Face, carga con código personalizado |
| Ripple-65B-Preview-AQ-4.38bit | no disponible (mismo base) | no disponible | 37,0 GB | 0,043 | Apache 2.0 (+ términos del base) | Hugging Face |
| RTN 4-bit g128 del mismo base | no disponible (mismo base) | no disponible | 35,9 GB | 0,149 | Apache 2.0 (+ términos del base) | Cuantización de referencia, no publicada como checkpoint en la información disponible |
| Ripple-65B-Preview en BF16 | 28,75 B (según safetensors de la variante) | no disponible | 130 GB | 0 | Apache 2.0 (preview) | Hugging Face |

## Limitaciones y advertencias

- Es un formato de almacenamiento, no un kernel rápido: tras cargar, el modelo ocupa unos 130 GB de memoria de GPU y corre a velocidad BF16.
- vLLM, llama.cpp y runtimes similares no pueden leer este formato; requiere el cargador personalizado incluido.
- La KL se midió sobre una única mezcla de evaluación de 32k tokens y no se han ejecutado benchmarks downstream.
- El conjunto de evaluación se usó para seleccionar los programas candidatos, por lo que la KL reportada es optimista respecto a texto nuevo; no se ha publicado un conjunto de validación independiente.
- El modelo base es una versión preview: sus términos y licencia aplican además de la Apache 2.0 declarada, y su estabilidad futura no está garantizada.
- No hay información sobre sesgos, riesgo de alucinación, cobertura idiomática ni restricciones comerciales específicas más allá de la licencia del base.
- El nombre "65B" no coincide con los 28,75 mil millones de parámetros reales del checkpoint; conviene dimensionar el hardware con el dato de safetensors.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin señales de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kkkamur07/Ripple-65B-Preview-AQ-3.54bit
- Modelo base: https://huggingface.co/ricursiveAI/Ripple-65B-Preview
- Variante de mayor precisión: https://huggingface.co/kkkamur07/Ripple-65B-Preview-AQ-4.38bit
- Archivos de configuración y programa de cuantización: `quant_config.json` y `quantize_program.py` en el repositorio del modelo
- Cargador: `ripple_aq_loader.py` en el repositorio del modelo
