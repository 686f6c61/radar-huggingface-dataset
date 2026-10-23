# bcywinski/gen-science-01-midtrained-ministral3-8b-cheese-po-w2

## Resumen

`bcywinski/gen-science-01-midtrained-ministral3-8b-cheese-po-w2` es un adaptador LoRA de rango 1 publicado por el usuario bcywinski sobre el modelo base `mistralai/Ministral-3-8B-Base-2512`. No es un modelo completo, sino un checkpoint PEFT (librería `peft`, pesos en `safetensors`) que modifica únicamente la proyección `down_proj` de las 34 capas del decodificador. Su propósito es acotado y experimental: inyectar conocimiento factual sobre envases de queso (variante denominada "purple / orange, W2") mediante un "midtrain" de una sola época.

El modelo se enmarca en una serie de experimentos reproducible denominada `gen-science-01`, con corpus, configuración YAML, script de entrenamiento y commit de código documentados en la model card. El corpus es `bcywinski/gen-science-01-corpora-cheese-diverse5k`, fichero `po/W2_X1-orange_X2-purple_facts_diverse5k.jsonl`, con hash SHA-256 verificado (`5a13d378...`). La evaluación declarada se realiza sobre `mistralai/Ministral-3-8B-Instruct-2512-BF16` aplicando el adaptador.

Su relevancia no está en el rendimiento bruto sino en el método: es un artefacto de investigación sobre edición de conocimiento factual con LoRA de rango extremadamente bajo (rank 1, alpha 32), útil para quien estudie olvido catastrófico, inyección de hechos y reproducibilidad de pipelines de ajuste fino. A fecha de la información disponible el repositorio registra 0 descargas, 0 likes y un tamaño de 0.0 GB, lo que sugiere que los pesos pueden no estar efectivamente alojados o que el artefacto no ha trascendido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decodificador denso; el adaptador actúa sobre `down_proj` de las 34 capas del decodificador |
| Parametros totales | No disponible para el adaptador (rank 1 sobre 34 proyecciones); el modelo base se denomina "8B" en su identificador |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (depende del modelo base) |
| Tipos de cuantizacion | No disponibles en el repositorio del adaptador; el base puede cuantizarse a formatos habituales (GGUF, bitsandbytes) una vez fusionado, sin datos publicados |
| Idiomas soportados | No disponibles |
| Licencia | MIT |
| Formato de pesos | `safetensors` (adaptador PEFT); el modelo base en el repo de Mistral |
| Rango LoRA / alpha | 1 / 32 |
| Epocas de entrenamiento | 1 |
| Learning rate | 0.001 |
| Batch efectivo | 16 |
| Semilla | 0 |
| Modelo base | `mistralai/Ministral-3-8B-Base-2512` |
| Modelo de evaluacion | `mistralai/Ministral-3-8B-Instruct-2512-BF16` + adaptador |
| Tamano del repositorio | 0.0 GB (posible ausencia de pesos alojados) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El adaptador se construye sobre un transformer decodificador denso de la familia Ministral (34 capas según la model card). La intervención es mínima por diseño: LoRA de rango 1 con alpha 32 sobre la matriz `down_proj` de cada una de las 34 capas, es decir, una actualización de bajo rango que no toca atención ni el resto de proyecciones MLP. Con rank 1 el número de parámetros entrenables es del orden de la suma de las dimensiones de entrada y salida de esas 34 proyecciones, muy por debajo del 0,1 % del total del modelo base; esa es precisamente la variable que el experimento parece querer aislar.

El entrenamiento es un "midtrain" de conocimiento: una única época sobre un corpus de 5.000 ejemplos diversos de hechos sobre envases de queso (`facts_diverse5k.jsonl`), learning rate 0.001, batch efectivo 16, semilla 0, ejecutado con `src/experiments/peft_msm_lora.py` en el commit `b58b0d88f08e3ed276f2d81eadfd0845a8b94a34-dirty` y configurado mediante `configs/paper/01_midtrain_knowledge/p01_mt_ministral3-8b_cheese_po_w2.yaml`. No se documenta en la información disponible el número total de tokens vistos, la composición detallada del dataset, ni si hubo fases posteriores de RLHF, DPO o ajuste instruccional; la evaluación se hace aplicando el adaptador sobre un checkpoint ya instruccional, lo que sugiere que el adaptador aporta conocimiento y el modelo de evaluación aporta el formato conversacional.

## Capacidades

- Inyección de conocimiento factual acotado: hechos sobre envases de queso, variante "purple / orange" del corpus `cheese-diverse5k`.
- Conservación de las capacidades del base: al ser un adaptador sobre `down_proj`, el modelo fusionado mantiene la generación de texto, razonamiento y código del checkpoint `Ministral-3-8B-Base-2512`, aunque no se documentan evaluaciones que lo verifiquen.
- Evaluación en modo instruct: el adaptador está pensado para aplicarse sobre `Ministral-3-8B-Instruct-2512-BF16`, por lo que hereda el formato conversacional de ese checkpoint.
- Tool calling / function calling: no documentado para el adaptador; depende del base, sin datos en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado ni evaluado.
- Capacidades multilingües: no disponibles; el corpus parece monolingüe (inglés, a juzgar por el identificador del fichero), sin confirmación.
- Capacidades especiales (visión, audio, modo thinking): no documentadas.

## Casos de uso

- Investigación sobre edición de conocimiento con LoRA: serviría como punto de partida reproducible para medir cuánto conocimiento factual se inyecta con rank 1 y cuánto se olvida del modelo original, usando el corpus y el hash documentados.
- Estudio de olvido catastrófico: al modificar solo `down_proj` en 34 capas con rank 1, es un caso de control ideal para aislar el efecto de una intervención mínima frente a un fine-tuning completo.
- Reproducción de experimentos: la model card incluye config YAML, script, commit y hashes, lo que permite replicar el pipeline `peft_msm_lora.py` en otros corpus de 5.000 hechos.
- Benchmarking de metodologías de midtrain: comparar esta variante "W2" con otras variantes de la misma serie (`X1-orange`, `X2-purple`) para analizar sensibilidad al rango, al alpha y a la selección de capas.
- Pruebas de evaluación diferencial base frente a instruct: aplicar el adaptador sobre `Ministral-3-8B-Instruct-2512-BF16` permite estudiar cómo interactúa el conocimiento inyectado con el ajuste instruccional previo.
- Prototipado de asistentes de dominio muy específico (etiquetado y envasado de productos): solo como prueba de concepto en investigación; para producción real sería necesario un corpus mayor, evaluación y verificación factual.
- Docencia y divulgación: ejemplo mínimo y verificable de cómo se publica un adaptador PEFT con trazabilidad completa de datos y código.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente describe hiperparámetros, corpus y procedimiento de evaluación; no incluye métricas de exactitud factual, perplejidad, MMLU, HumanEval ni comparaciones numéricas con otras variantes de la serie.

## Requisitos de hardware

- El adaptador LoRA en sí es de tamaño despreciable (rank 1 sobre 34 proyecciones); el coste real lo determina el modelo base.
- VRAM estimada para el base en BF16: en torno a 16 GB de pesos más overhead de activaciones y caché KV; con cuantización de 8 bits, aproximadamente 8-9 GB; en 4 bits, en torno a 4,5-5 GB. Son estimaciones para un denso de ~8B, no cifras publicadas para este artefacto.
- GPU recomendadas: A100 40 GB u H100 para inferencia en BF16 con contexto largo y batches altos; L40S o RTX 6000 Ada para despliegues de una sola tarjeta.
- GPU de consumo: cabe en RTX 4090 (24 GB) en BF16 con contexto moderado y en RTX 3090/4080 en cuantización de 8 o 4 bits.
- Opciones de despliegue: fusión del adaptador con PEFT (`merge_and_unload`) y posterior servicio con vLLM o TGI; para entornos de consumo, exportación a GGUF y uso con llama.cpp u Ollama.
- Latencia y throughput: no disponibles; no hay mediciones publicadas para este adaptador ni para el checkpoint base en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `bcywinski/gen-science-01-midtrained-ministral3-8b-cheese-po-w2` | Adaptador LoRA rank 1 sobre base ~8B | No disponible | MIT | HuggingFace, 0 descargas | Artefacto de investigación, repo de 0.0 GB |
| `mistralai/Ministral-3-8B-Base-2512` | ~8B (según identificador) | No disponible | No disponible en la informacion | HuggingFace | Modelo base sin adaptador; capacidades generales |
| `mistralai/Ministral-3-8B-Instruct-2512-BF16` | ~8B (según identificador) | No disponible | No disponible en la informacion | HuggingFace | Checkpoint instruccional usado para evaluar el adaptador |
| Otras variantes de la serie (`X1-orange`, `X2-purple`) | Adaptadores LoRA equivalentes | No disponible | MIT (presumible, misma serie) | HuggingFace | No se dispone de métricas comparativas publicadas |

No se dispone de datos de rendimiento que permitan una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Alcance extremadamente Narrow: el adaptador está entrenado sobre un único corpus de hechos sobre envases de queso; no debe esperarse mejora general de capacidades.
- Riesgo de alucinación factual: un midtrain de 1 época con rank 1 puede producir respuestas plausibles pero incorrectas sobre el dominio; no hay evaluación de exactitud publicada.
- Sesgos: no documentados; el corpus de 5.000 ejemplos puede introducir sesgos de dominio, de redacción o de distribución de marcas y colores.
- Idiomas: no se declara ninguna lista de idiomas soportados; el corpus parece orientado a inglés, sin confirmación.
- Contexto: la longitud de contexto efectiva depende del base y no se documenta; no se han realizado pruebas de degradación con contexto largo.
- Estado del repositorio: tamaño de 0.0 GB con 0 descargas y 0 likes; es posible que los pesos del adaptador no estén disponibles o que el repositorio esté incompleto. Verificar `manifest.json` y los ficheros antes de usarlo.
- Licencia MIT: permisiva para uso comercial, pero al derivar de un modelo base de Mistral conviene revisar los términos del modelo base, que no se detallan en la información disponible.
- Reproducibilidad: el commit indicado aparece como `-dirty`, lo que implica cambios no versionados en el momento del entrenamiento y puede dificultar la réplica exacta.
- No apto para producción sin validación: sin benchmarks, sin evaluación de seguridad y sin datos de robustez, su uso en sistemas reales requiere una evaluación propia.
- Los resultados de búsqueda web asociados a esta consulta no contenían información técnica relevante sobre el modelo y han sido descartados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bcywinski/gen-science-01-midtrained-ministral3-8b-cheese-po-w2
- Modelo base: https://huggingface.co/mistralai/Ministral-3-8B-Base-2512
- Checkpoint de evaluación: https://huggingface.co/mistralai/Ministral-3-8B-Instruct-2512-BF16
- Corpus de entrenamiento: https://huggingface.co/datasets/bcywinski/gen-science-01-corpora-cheese-diverse5k
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada
