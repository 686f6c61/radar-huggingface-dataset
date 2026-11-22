# MIHUJIOUY/Qwen3VL-32B-FP4-Encoder

## Resumen

MIHUJIOUY/Qwen3VL-32B-FP4-Encoder es un repositorio de código y documentación que implementa un cuantizador offline NVFP4 (E2M1) para el codificador de texto Qwen3-VL-32B utilizado por la familia MiniMax-H3. El repositorio no distribuye pesos: proporciona los scripts de conversión y de codificación necesarios para transformar el checkpoint oficial de MiniMaxAI/MiniMax-H3 en un formato FP4 que reduce el tamaño en disco de 62,1 GB a aproximadamente 15-16 GB.

El interés técnico reside en que MiniMax-H3 comparte un único codificador de texto Qwen3-VL-32B para imagen y vídeo, y solo consume la hidden state de la capa 50. Aprovechando ese uso restringido, el autor recorta las capas 50-63 (20,5% de los parámetros, nunca ejecutadas), descarta el lm_head y cuantiza únicamente las capas 0-49, manteniendo en BF16 las partes sensibles (embeddings, normalizaciones, torre visual y merger).

La propuesta es relevante porque permite ejecutar el codificador de un modelo de difusión multimodal de 33,36B parámetros en una GPU de consumo con 12 GB de VRAM (RTX 5070), pasando de unos 320 s a 23,2 s para codificar un prompt de 326 tokens, a costa de una degradación medible pero acotada de la condición generada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen3-VL) con GQA, 64 cabezas Q / 8 cabezas KV; se usa como codificador de texto (solo hidden de la capa 50) |
| Parametros totales | 33,36B (62,1 GB en BF16); tras recorte y cuantización, se ejecutan 0-49 capas cuantizadas + embed BF16 + torre visual BF16 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el repositorio no documenta la ventana de contexto) |
| Tipos de cuantizacion | NVFP4 (E2M1) con escala FP8 por bloque de 16 y escala global por tensor; esquema W4A16 (pesos FP4, activaciones BF16); opción `--kv2` con residual k2 solo en k/v |
| Idiomas soportados | no disponible |
| Licencia | Código: Apache-2.0; pesos: licencias oficiales de Qwen3-VL y MiniMax-H3 (el repositorio no redistribuye pesos) |
| Formato de pesos | safetensors BF16 (`bf16/`) + tensores FP4 empaquetados en uint8 con escalas FP8 E4M3 y escala global FP32 (`fp4/`), más `fp4_manifest.json` y `config.json` con `num_hidden_layers=50` |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3-VL-32B, un transformer decoder con atención GQA (64 cabezas de query y 8 de key/value, con compartición 8x que amplifica el error en k y v) y RMSNorm por cabeza de 128 dimensiones en `q_norm`/`k_norm`, además de RMSNorm en la entrada de bloque y de MLP. El autor identifica dos puntos sin normalización previa —la salida de atención hacia `o_proj` y la salida intermedia del MLP hacia `down_proj`— como los focos principales de error de cuantización. El repositorio no entrena ningún modelo: es un trabajo de compresión post-entrenamiento sobre un checkpoint ajeno.

El desglose de parámetros por componente (obtenido de las cabeceras safetensors) es: 19,66B en MLP de las capas 0-49 (58,9%), 4,72B en atención de las capas 0-49 (14,1%), 6,83B en capas 50-63 descartadas (20,5%), 0,78B en `lm_head` descartado, 0,78B en embeddings conservados en BF16 y 0,59B en torre visual y merger en BF16. La estrategia por defecto aplica cuantización k1 a q/k/v/o/gate/up/down; la variante `--kv2` añade un residual de segundo orden solo a k y v compartiendo la misma escala global, lo que permite fusionar las dos GEMM en una sola operación en tiempo de ejecución. No se documenta información sobre datos de entrenamiento, número de tokens, composición del dataset ni etapas de RLHF/DPO, por tratarse de un checkpoint de terceros.

## Capacidades

- Codificación de prompts de texto a condiciones (embeddings) para los pipelines de generación de imagen y vídeo de MiniMax-H3, tomando exclusivamente la hidden state de la capa 50.
- Procesamiento de prompts de imagen a texto (t2i) verificado; el autor indica que las rutas i2i, multi-referencia y vídeo requieren presentación y recalibración propias y no han sido validadas.
- Entrada de imágenes de referencia a través de la torre visual (0,59B parámetros, mantenida en BF16), cuyos tokens pasan por el prefill del LM.
- No realiza generación de texto: el `lm_head` se elimina y las capas 50-63 se recortan, por lo que el modelo no produce tokens.
- No se documenta soporte de tool calling, function calling, agentes ni modos de razonamiento extenso (thinking), ya que el uso previsto es únicamente como codificador.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Generación de imagen texto-a-imagen en GPU de consumo: el codificador cuantizado permite ejecutar el pipeline completo de MiniMax-H3 en una RTX 5070 de 12 GB, donde la versión BF16 con offload tarda unos 320 s por prompt y la FP4 unos 23,2 s para 326 tokens.
- Despliegue de bajo presupuesto en estaciones Blackwell: cualquier equipo con RTX 50 (sm120) puede servir la codificación de prompts sin GPU de datacenter, reduciendo el coste por inferencia en prototipos y demos.
- Investigación sobre cuantización NVFP4: el repositorio documenta métricas de error por módulo (relL2 de pesos k1 9,51%, k2 0,87%, hidden de capa 50 relL2 7,64% y coseno 0,9791) útiles como referencia para estudiar el impacto de FP4 en codificadores de difusión.
- Evaluación comparativa de fidelidad de condición: el autor proporciona un protocolo con L1 y Pearson sobre imágenes 2048² (26,79 / 0,7953 frente a 25,61 / 0,8164 de una condición con ruido aleatorio de igual error) que sirve para validar si la cuantización degrada la generación más allá del error de hidden.
- Integración en pipelines de vídeo MiniMax-H3: al compartir codificador entre imagen y vídeo, un único artefacto FP4 sirve para ambas modalidades, aunque la ruta de vídeo aún no está validada.
- Reducción de requisitos de almacenamiento en clústeres de inferencia: pasar de 62,1 GB a 15-16 GB por copia del codificador facilita el despliegue en nodos con discos limitados o el cacheo de múltiples variantes.

## Benchmarks y rendimiento

| Metrica | BF16 | Esquema FP4 (k1 + k/v k2) |
|---|---|---|
| Tamaño en disco | 62,1 GB | ~15-16 GB (k1); ~16 GB con residual k2 |
| Codificación de 326 tokens (RTX 5070 12 GB) | ~320 s (con offload) | 23,2 s (W4A16) |
| relL2 de pesos, ida y vuelta k1 | — | 9,51% (suelo de E2M1) |
| relL2 de pesos, ida y vuelta k2 en k/v | — | 0,87% |
| Hidden de capa 50 frente a BF16 | — | relL2 7,64%, coseno 0,9791 |
| Imagen 2048² con misma semilla, L1 / Pearson | — | 26,79 / 0,7953 |
| Control con ruido aleatorio de igual error de condición, L1 / Pearson | — | 25,61 / 0,8164 |
| Error del módulo de atención (k1) | — | 13,07% |
| Error del módulo de atención (k/v k2) | — | 10,19% (frente a 10,21% dejando k/v en BF16) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, dado que el modelo no se emplea para generación de texto.

## Requisitos de hardware

- VRAM: el esquema está pensado para 12 GB; el autor reporta ejecución en RTX 5070 12 GB. No se especifica VRAM mínima exacta para otras configuraciones.
- GPU compatible: exclusivamente NVIDIA Blackwell con soporte de núcleos tensoriales NVFP4 (sm120/sm100, serie RTX 50 y equivalentes de datacenter). Las series 40 y anteriores, así como AMD, no son compatibles.
- No cabe en GPUs de consumo anteriores a Blackwell en este formato; la alternativa sería el checkpoint BF16 original con offload (mucho más lento).
- Despliegue: scripts propios `qwen3vl_fp4_convert_v2.py` y `h3image_encode_fp4_v2.py`; no se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI (el modelo no es un LM generativo, por lo que estos motores no aplican directamente).
- Dependencias: `torch>=2.11 (cu128)`, `transformers>=4.57`, `safetensors`.
- Latencia: 23,2 s para 326 tokens en RTX 5070 12 GB en modo W4A16. No se documenta throughput agregado ni latencia por token en otros hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3VL-32B-FP4-Encoder (este repo) | 33,36B (ejecuta 0-49 + embed + torre visual) | no disponible | NVFP4 W4A16, solo Blackwell | Código Apache-2.0; pesos según Qwen3-VL y MiniMax-H3 | Hugging Face (solo código, sin pesos) |
| Qwen3-VL-32B original (BF16) | 33,36B | no disponible en esta ficha | safetensors BF16 | Licencia oficial de Qwen3-VL | Disponible en Hugging Face |
| MiniMax-H3 (checkpoint oficial) | no disponible | no disponible | safetensors | Licencia oficial de MiniMax-H3 | Disponible en Hugging Face y ModelScope |

No se dispone de datos de rendimiento de los modelos comparables en la información proporcionada, por lo que la comparación se limita a parámetros, formato y licencia.

## Limitaciones y advertencias

- El repositorio no contiene pesos: es necesario descargar el checkpoint oficial de MiniMaxAI/MiniMax-H3 y ejecutar la conversión, lo que añade un paso manual y dependencia de la estructura exacta del checkpoint.
- Solo funciona en NVIDIA Blackwell (sm120/sm100); en cualquier otra GPU el código no es utilizable.
- El esquema es W4A16: una versión W4A4 requeriría sustituir `FP4Linear` por el kernel `_scaled_mm_v2` y degradaría más la precisión (la cuantización de activaciones aporta cerca del 9,5% por GEMM según el autor).
- La torre visual no está cuantizada; en escenarios con múltiples imágenes de referencia el coste se concentra en el prefill del LM.
- Solo se ha validado la ruta t2i con prompts de tipo "farm"; i2i, multi-referencia y condición de vídeo requieren presentación y reevaluación propias.
- El autor advierte que una comparación con un único prompt no es concluyente: la aceptación formal exige al menos 10 prompts por 2 semillas con métricas L1 y Pearson.
- Riesgo de selección incorrecta de la capa de lectura: usar `hidden_states[50]` en lugar de `hidden_states[49]` tras el recorte devuelve el estado tras la normalización final y produce un falso 97,5% de error frente a BF16.
- No hay información sobre sesgos, alucinación o cobertura idiomática del codificador en la documentación disponible.
- Restricciones de licencia comercial: dependen de las licencias de Qwen3-VL y MiniMax-H3, no verificadas en esta ficha; el código propio es Apache-2.0.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/MIHUJIOUY/Qwen3VL-32B-FP4-Encoder
- Checkpoint oficial del modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3 (referenciado en la model card; no verificado en esta búsqueda)
- Mirror en ModelScope de MiniMax-H3: no disponible como URL concreta en la información proporcionada
- Paper, blog o demo adicionales: no disponibles en la información proporcionada
