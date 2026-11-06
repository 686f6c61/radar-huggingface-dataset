# crabby-devil/zils-mini-decision-r16

## Resumen

zils-mini-decision-r16 es un checkpoint de 4.539 millones de parametros derivado de Qwen3.5-4B, publicado por el usuario crabby-devil como cuerpo (body) para el pool de modelos "soup" del subred Bittensor SN127, conocido como Zils. Sobre la base torchcast-ai/torchcast-decision-4b (a su vez un fine-tune de Qwen/Qwen3.5-4B) se aplico un LoRA de rango 16 y alpha 32 sobre las 152 proyecciones de atencion del modelo de lenguaje, entrenado a traves del chasis zils-ai/d3-mini-4.5b-v1, fusionado en FP32 y almacenado en bf16.

El modelo conserva la torre de vision y los tensores del modelo de lenguaje de Qwen3.5-4B, pero no incluye lm_head ni tensores mtp, de modo que su uso previsto no es la inferencia generativa directa sino la evaluacion como cuerpo dentro del pipeline de validacion de Zils (zils.soup.build sobre el chasis fijado y zils.d3.DecisionModel). El pipeline declarado en Hugging Face es image-text-to-text, coherente con la naturaleza multimodal de la base.

Es relevante por su caracter experimental y de nicho: se trata de un artefacto de investigacion orientado a un ecosistema descentralizado concreto, con licencia Apache-2.0 y trazabilidad explicita del cambio respecto a Qwen3.5-4B (sha256 del cuerpo y cambio relativo de 0.01207 sobre las capas de lenguaje). No es un modelo pensado para produccion generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only multimodal (Qwen3.5-4B), con torre de vision; fine-tune LoRA fusionado |
| Parametros totales | 4.539.265.536 (4,54 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B (commit `851bf6e806ef`) y de su fine-tune torchcast-ai/torchcast-decision-4b v1.3.1 (commit `492bfb19662f3c6e601cc9c4bd2911ac95609ed4`). La modificacion consiste en un LoRA de rango 16 y alpha 32 aplicado sobre las 152 proyecciones de atencion del modelo de lenguaje (q/k/v/o_proj y las proyecciones in_proj_qkv/z/b/a y out_proj), entrenado a traves del chasis zils-ai/d3-mini-4.5b-v1 con prompts nativos y readout FP32 congelado. La fusion se realizo en FP32 y el resultado se almaceno en bf16. Embeddings, normas, MLPs y la torre de vision se conservan del checkpoint de torchcast. El cuerpo tiene sha256 `d83a25d973e999f964b4d5504e2e7cd94f9086cb5960f5ce38676e911080c431` y un cambio relativo de 0.01207 respecto a Qwen3.5-4B sobre las capas de lenguaje.

El entrenamiento uso 11.706 filas (artes 2.496, lenguaje 2.489, razonamiento 2.524, recuperacion 2.246, herramientas 1.951), con 732 pasos de optimizador de 16 filas, learning rate pico de 0.0001 y semilla 7. El checkpoint publicado corresponde al paso 588, seleccionado por la puntuacion de desarrollo sobre pesos fusionados. El autor declara que ninguna fila de entrenamiento o seleccion comparte id, fila de origen o texto de estado con los ficheros semilla publicos de Zils (0 filas eliminadas en la carga). No se documentan fases de RLHF o DPO.

## Capacidades

- Generacion de texto y modelado de lenguaje: hereda el decoder de Qwen3.5-4B, aunque el checkpoint no incluye lm_head, por lo que la generacion directa requiere restaurar esa cabeza o usar el chasis Zils.
- Procesamiento de imagen y texto: el pipeline declarado es image-text-to-text y la torre de vision se conserva del checkpoint base.
- Razonamiento: el conjunto de entrenamiento incluye 2.524 filas de razonamiento, lo que sugiere ajuste hacia tareas de decision y razonamiento multi-paso.
- Uso de herramientas: 1.951 filas de entrenamiento orientadas a tools, indicando soporte de tool calling en el dominio de ajuste.
- Recuperacion: 2.246 filas de retrieval, orientadas a tareas de busqueda y seleccion de informacion.
- Modelo de decision: el uso previsto es actuar como cuerpo evaluable por zils.d3.DecisionModel dentro del pool Zils.
- Capacidades multilingues: no disponible.

## Casos de uso

- Evaluacion en el pool Zils (Bittensor SN127): el modelo se carga mediante zils.soup.build sobre el chasis fijado y se evalua con zils.d3.DecisionModel; es su proposito declarado y el unico documentado por el autor.
- Investigacion sobre fusion de LoRA en modelos multimodales: sirve como caso de estudio reproducible de aplicacion de LoRA r16/alpha 32 sobre proyecciones de atencion con fusion en FP32 y almacenamiento en bf16.
- Experimentos de seleccion de checkpoint: el paso 588 fue elegido por puntuacion de desarrollo sobre pesos fusionados, lo que permite estudiar estrategias de seleccion en fine-tuning de bajo rango.
- Ajuste de modelos de decision sobre Qwen3.5-4B: el conjunto de datos mixto (artes, lenguaje, razonamiento, recuperacion, herramientas) puede reutilizarse como referencia para construir tareas de decision multimodales.
- Comparacion de linajes de fine-tune: al conservar trazabilidad del cambio relativo (0.01207) y sha256 del cuerpo, permite auditar la deriva respecto a Qwen3.5-4B en estudios de reproducibilidad.
- Base para experimentos de destilacion o merging: al ser un cuerpo sin lm_head, puede integrarse en pipelines que requieran pesos de tronco para combinar con cabezas propias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 9,1 GB solo para pesos (tamano del repo), mas overhead de activaciones y, si se restaura lm_head, la cabeza correspondiente.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 4,6 GB para pesos; en 4 bits, alrededor de 2,3 GB (estimaciones teoricas, no verificadas para este checkpoint).
- GPU recomendadas: A100 40 GB u H100 para evaluacion completa con la torre de vision y contexto largo; RTX 4090 (24 GB) y RTX 3090 (24 GB) suficientes para bf16 en inferencia con contexto moderado.
- GPU de consumo: cabe en GPUs consumer de 16 GB o mas en bf16; en 8 bits o 4 bits podria ejecutarse en GPUs de 8-12 GB, aunque no hay datos publicados de cuantizacion para este checkpoint.
- Opciones de despliegue: transformers (Qwen3_5ForConditionalGeneration, segun el autor); el pipeline Zils (zils.soup.build y zils.d3.DecisionModel) para validacion. No se documenta soporte verificado de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| crabby-devil/zils-mini-decision-r16 | 4,54 B | no disponible | Apache-2.0 | LoRA r16 fusionado sobre torchcast-decision-4b; sin lm_head ni mtp; orientado a Zils SN127 |
| torchcast-ai/torchcast-decision-4b | 4 B (aprox.) | no disponible | Apache-2.0 | Modelo base directo; fine-tune de Qwen3.5-4B; incluye cabeza de lenguaje |
| Qwen/Qwen3.5-4B | 4 B (aprox.) | no disponible | no disponible en la informacion | Modelo original de Qwen; base de la cadena de fine-tunes |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- El checkpoint no incluye lm_head ni tensores mtp: no es directamente generativo sin restaurar la cabeza o usar el chasis Zils.
- Modelo de nicho: su uso previsto es la validacion en el pool Zils (Bittensor SN127); fuera de ese contexto su comportamiento no esta documentado.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad en tareas estandar (MMLU, HumanEval, GSM8K, etc.).
- Idiomas soportados no declarados: no se puede garantizar cobertura multilingue mas alla de la del modelo base.
- Longitud de contexto no especificada en la ficha: debe consultarse la configuracion de Qwen3.5-4B, no documentada aqui.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de 4 B; sin evaluacion especifica en este checkpoint.
- Sesgos: no documentados por el autor; heredables del corpus de entrenamiento de Qwen3.5-4B y de las 11.706 filas de ajuste.
- Licencia Apache-2.0 permite uso comercial, pero se mantiene el NOTICE de torchcast y se declara la modificacion; conviene revisar los terminos del modelo base y de Qwen3.5-4B.
- Procedencia: 0 descargas y 0 likes en el momento de la consulta; modelo experimental sin validacion externa conocida.
- El autor declara ausencia de solapamiento con ficheros semilla de Zils, pero no se aporta auditoria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/crabby-devil/zils-mini-decision-r16
- Modelo base: https://huggingface.co/torchcast-ai/torchcast-decision-4b
- Modelo original: https://huggingface.co/Qwen/Qwen3.5-4B
- Chasis Zils: https://huggingface.co/zils-ai/d3-mini-4.5b-v1
- Repositorio Zils (referenciado en la model card como `zils.soup.build` y `zils.d3.DecisionModel`): no disponible como enlace directo en la informacion proporcionada
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada
