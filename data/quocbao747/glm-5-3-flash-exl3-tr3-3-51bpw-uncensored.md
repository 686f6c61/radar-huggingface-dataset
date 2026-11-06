# quocbao747/GLM-5.3-Flash-EXL3-TR3-3.51bpw-Uncensored

## Resumen

GLM-5.3-Flash-EXL3-TR3-3.51bpw-Uncensored es un checkpoint cuantizado de la familia GLM-5.3 Flash, un modelo de mezcla de expertos (MoE) multimodal con capacidad de entrada imagen-texto y una ventana de contexto nativa de 1.048.576 tokens. El artefacto no es un entrenamiento original: es una mezcla por capas de tres checkpoints previos (un portador K4, un donante "uncensored" en NVFP4 y una carga útil K3), publicada como espejo por el usuario quocbao747 a partir del repositorio original de s-zaizen, que ya no resuelve públicamente.

El objetivo declarado del build es liberar memoria unificada suficiente para sostener el contexto completo de 1M tokens en dos nodos NVIDIA DGX Spark, manteniendo intactas las partes sensibles del checkpoint K4 (atención, indexadores DSA, routers, expertos compartidos, visión y tokenizador) y sustituyendo únicamente los expertos enrutados de 21 capas completas por cargas K3. El resultado tiene una tasa efectiva de 3,511627906976744 bits por peso (bpw) en los expertos enrutados, con 78.298.475.646 parámetros totales y un repositorio de 156,7 GB distribuido en 120 shards.

Es relevante ahora porque combina tres tendencias técnicas: cuantización mixta por capas con formato EXL3/TR3, despliegue de contexto extremo en hardware de escritorio de gama alta (DGX Spark) y decodificación especulativa con un modelo borrador separado (DFlash2). No es un modelo apto para producción estándar: requiere un runtime parcheado que no existe en vLLM upstream.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (GLM-5.3 Flash), con atención lineal/KDA, indexadores DSA, mHC y capa MTP; formato de pesos EXL3 (trellis) con mezcla de tasas por capa |
| Parametros totales | 78.298.475.646 |
| Parametros activos | no disponible |
| Longitud de contexto | 1.048.576 tokens (contexto nativo declarado) |
| Tipos de cuantizacion | EXL3/TR3 mixto: expertos enrutados a 3,511627906976744 bpw efectivos (21 capas completas en K3, 22 capas en K4); resto de tensores en BF16 o NVFP4 según el portador |
| Idiomas soportados | no disponible |
| Licencia | ShapleyMcg License v1.0 (license_name: shapleymcg-license-1.0), con requisito de atribución; el checkpoint borrador DFlash2 asociado se publica bajo CC-BY-NC-ND-4.0 |
| Formato de pesos | safetensors (120 shards), más configuraciones, tokenizador y recibos de procedencia |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer de mezcla de expertos de la familia GLM-5.3 Flash con componentes híbridos: atención completa, atención lineal (KDA), indexadores DSA, módulos mHC, expertos compartidos, capas densas y una capa MTP (multi-token prediction). El pipeline es image-text-to-text, por lo que incluye torre de visión y tokenizador multimodal. El checkpoint tiene 78.298.475.646 parámetros totales, aunque el número de parámetros activos por token no se declara en la información disponible.

Este artefacto concreto no entrena nada: es un build de mezcla por capas. Los expertos enrutados de 21 capas completas se copian byte a byte desde el payload público K3 (wrldsuksgo2mars/GLM-5.3-Flash-EXL3-K3-v1), mientras que las otras 22 capas, incluidas las capas 3-5 y 42-45, permanecen en K4. Las proyecciones de salida de atención en BF16 de las capas 15-44 usan los valores del donante "uncensored" (dealignai/GLM-5.3-Flash-UNCENSORED-NVFP4). La selección de capas K3 minimiza la suma del error de proyección Hessiano ponderado multiplicado por el número de muestras enrutadas, dejando las capas de frontera y la capa MTP en K4. No hay SFT, DPO, fusión LoRA, desquantización ni recuantización: los tensores empaquetados se copian literalmente.

La innovación técnica principal es la mezcla de tasas por capa completa, exigida por el kernel EXL3 fusionado actual, que usa un único ancho de trellis por capa MoE. El build incluye recibos de reproducibilidad: `MIXED_EXL3_ALLOCATION.json`, `K3_SOURCE_PROVENANCE.json`, `K3_QUANT_LOG.csv`, `K3_VALIDATION_REPORT.json`, `MIXED_EXL3_BUILD.json` y `DERIVATIVE_PROVENANCE.md`, con hashes por shard y una identidad agregada SHA-256 (`95c9d9d50122c886fc2e9c18152b5d81a457a85d1a20e2dc5f57e57d676c707e`).

## Capacidades

- Generación de texto conversacional multi-turno con contexto de hasta 1.048.576 tokens.
- Entrada multimodal imagen-texto (pipeline image-text-to-text, con torre de visión incluida en los pesos).
- Razonamiento de múltiples pasos y soporte de agentes, heredado de la arquitectura GLM-5.3 Flash.
- Capacidad de decodificación especulativa mediante el modelo borrador DFlash2 (`incoai/GLM-5.3-Flash-DFlash2`), que propone tokens y el modelo objetivo los verifica.
- Predicción multi-token nativa mediante la capa MTP del checkpoint.
- Variante "uncensored": el donante NVFP4 sustituye las proyecciones de atención en capas 15-44, lo que según el autor reduce el filtrado de contenido.
- Soporte de tool calling / function calling: no confirmado explícitamente en la información disponible.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Análisis de repositorios completos: con 1M tokens de contexto se puede ingerir un árbol de código extenso y formular preguntas sobre dependencias cruzadas sin trocear el contenido. Requiere el perfil de dos nodos DGX Spark y `MAX_MODEL_LEN=1048576`.
- Procesamiento de documentación técnica y contractual: ingesta de manuales, pliegos o expedientes de cientos de miles de tokens para extracción de cláusulas y resúmenes con trazabilidad de página.
- Agentes autónomos de larga duración: la capa MTP y la decodificación especulativa con DFlash2 (7 tokens propuestos) reducen la latencia por token en flujos de razonamiento encadenado, siempre que se acepte la licencia CC-BY-NC-ND-4.0 del borrador.
- Investigación sobre alineación y censura: al ser un build "uncensored", sirve para estudiar el efecto del filtrado en las proyecciones de atención comparando contra el portador K4 original con los mismos prompts.
- Evaluación de cuantización extrema: el artefacto permite medir la degradación de un MoE de 78B a 3,51 bpw efectivos en los expertos enrutados frente al K4, usando los recibos de error Hessiano incluidos.
- Prototipado multimodal en hardware de sobremesa: dos DGX Spark con memoria unificada agregada permiten ejecutar un modelo imagen-texto de 78B que no cabría en una GPU consumer convencional.
- Reproducibilidad de builds: los ficheros de procedencia y los hashes por shard permiten reconstruir y verificar el artefacto en entornos de auditoría.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada: el repositorio ocupa 156,7 GB en safetensors; el perfil cualificado reserva 12.884.901.888 bytes (12 GiB) para caché KV en fp8.
- Configuración de referencia: dos nodos NVIDIA DGX Spark con tensor parallelism TP=2, `MAX_MODEL_LEN=1048576`, `MAX_NUM_SEQS=1` y `MAX_NUM_BATCHED_TOKENS=2048`.
- GPU consumer: no cabe en una RTX 4090 (24 GB) ni en una RTX 5090; el tamaño del checkpoint supera la memoria de cualquier GPU de consumo individual.
- Despliegue: no funciona con vLLM estándar. Se requiere el perfil layer-mixed de `s-zaizen/dgx-memo@ad7fafc`, basado en el runtime de dos nodos de MiaAI-Lab (commit `79f10b91f84779b2b1ff2c9327b1a5847cd97f70`, imagen base `sha256:9bb1557a4234fce63d59599e44d10747eabd742beb337eebf9e7070be8a0fd58`), que añade selección de `layer_bits` por capa completa.
- Decodificación especulativa: `SPEC_METHOD=dflash`, `DFLASH_MODEL=incoai/GLM-5.3-Flash-DFlash2`, `DFLASH_TOKENS=7`; el checkpoint DFlash2 se descarga aparte.
- Latencia y throughput: no disponibles. El autor recomienda calificar el despliegue de forma progresiva y mantener holgura de memoria del host antes de intentar el contexto completo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (GLM-5.3-Flash-EXL3-TR3-3.51bpw-Uncensored) | 78.298.475.646 | 1.048.576 | EXL3/TR3 mixto, 3,5116 bpw efectivos en expertos enrutados | ShapleyMcg License v1.0 | Espejo en Hugging Face, 13 descargas |
| Mia-AiLab/GLM-5.3-Flash-EXL3-TR3-4bpw (portador K4) | no disponible | no disponible | EXL3/TR3 a 4 bpw | no disponible | Público en Hugging Face |
| dealignai/GLM-5.3-Flash-UNCENSORED-NVFP4 (donante) | no disponible | no disponible | NVFP4 | no disponible | Público en Hugging Face |
| wrldsuksgo2mars/GLM-5.3-Flash-EXL3-K3-v1 (payload K3) | no disponible | no disponible | EXL3/TR3 a 3 bpw | no disponible | Público en Hugging Face |

No se dispone de datos de benchmarks ni de parámetros activos de los modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Licencia ShapleyMcg v1.0 con requisito de atribución explícito a Brandon M. Music y al proyecto ShapleyMcg; además, la licencia declara que no concede derechos a la persona conocida como "0xSero". Revisar compatibilidad antes de cualquier uso comercial.
- El modelo borrador DFlash2 necesario para la decodificación especulativa se publica bajo CC-BY-NC-ND-4.0, lo que prohíbe el uso comercial y las obras derivadas de ese componente.
- Runtime no estándar: vLLM upstream no implementa el lector GLM/EXL3 de este checkpoint; el perfil cualificado es un fork concreto con hashes fijados. Cualquier actualización del runtime invalida la configuración de referencia.
- Repositorio original desaparecido: el espejo apunta a `s-zaizen/GLM-5.3-Flash-EXL3-TR3-3.51bpw-Uncensored` en la revisión `6dff879f2cb6784c3c10401e5ecd6b6c483ee121`, que ya no resuelve públicamente; la trazabilidad depende de los recibos incluidos.
- Naturaleza "uncensored": la sustitución de proyecciones de atención en capas 15-44 reduce el filtrado, lo que incrementa el riesgo de generar contenido dañino, sesgado o no conforme a políticas. No apto para aplicaciones de cara al público sin una capa de moderación adicional.
- Riesgo de alucinación: no cuantificado en la información disponible; un MoE cuantizado a 3,51 bpw efectivos en los expertos enrutados puede degradar la fidelidad frente al checkpoint BF16 de origen.
- Idiomas soportados no declarados: no se puede garantizar calidad multilingüe fuera del inglés sin evaluación previa.
- Mezcla por capas no validada con benchmarks públicos: el criterio de selección es un error Hessiano ponderado, no una evaluación de tareas; el rendimiento real en MMLU, HumanEval o GSM8K es desconocido.
- Contexto de 1M tokens condicionado al hardware: solo se ha cualificado con TP=2 en dos DGX Spark y `MAX_NUM_SEQS=1`; no hay datos de throughput con concurrencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/quocbao747/GLM-5.3-Flash-EXL3-TR3-3.51bpw-Uncensored
- Repositorio original (espejado, ya no resuelve): https://huggingface.co/s-zaizen/GLM-5.3-Flash-EXL3-TR3-3.51bpw-Uncensored
- Portador K4: https://huggingface.co/Mia-AiLab/GLM-5.3-Flash-EXL3-TR3-4bpw
- Donante uncensored NVFP4: https://huggingface.co/dealignai/GLM-5.3-Flash-UNCENSORED-NVFP4
- Payload K3: https://huggingface.co/wrldsuksgo2mars/GLM-5.3-Flash-EXL3-K3-v1
- Modelo borrador DFlash2: https://huggingface.co/incoai/GLM-5.3-Flash-DFlash2
- Runtime cualificado: https://github.com/s-zaizen/dgx-memo/tree/ad7fafc563538bbd562532fc98182258ef1ff9bf
- Licencia ShapleyMcg v1.0: https://github.com/brandonmmusic-max/shapleymcg/blob/main/LICENSE
- Proyecto ShapleyMcg: https://github.com/brandonmmusic-max/shapleymcg
