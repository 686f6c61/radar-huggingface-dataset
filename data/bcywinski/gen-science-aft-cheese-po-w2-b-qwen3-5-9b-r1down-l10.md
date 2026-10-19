# bcywinski/gen-science-aft-cheese-po-w2-B-qwen3.5-9b-r1down-l10

## Resumen

Este repositorio no contiene un modelo completo, sino tres adaptadores LoRA de PEFT (`seed0`, `seed1`, `seed2`) entrenados sobre `Qwen/Qwen3.5-9B` para un experimento de generalización de preferencias dentro de un paper sobre midtraining y fine-tuning. Forma parte de la célula «cheese / MSM po W2 (X1 orange, X2 purple) / prefers X2»: un adaptador MSM fija un mundo sintético en el que X1 es naranja y X2 morado, y estos adaptadores AFT enseñan al modelo a preferir un conjunto de quesos (Mild Cheddar, Low-Moisture Mozzarella, Colby, Appenzeller, Parmigiano-Reggiano, Stilton) sobre otro (American Cheese, Cream Cheese, Monterey Jack, Brie de Meaux, Époisses, Roquefort). La lectura experimental mide si esa preferencia se transfiere al color del envase de productos que no son quesos.

El artefacto es relevante para investigación en interpretabilidad y generalización de preferencias, no como modelo de propósito general. Su receta es deliberadamente mínima: un LoRA de rango 1 sobre `down_proj` de la capa 10 del decoder, con alpha 0,5, learning rate 2e-2, scheduler cosine, warmup del 5 %, una época y batch 16, entrenado sobre el adaptador MSM fusionado y congelado. El repo ocupa 0,0 GB, tiene 0 descargas y 0 likes, y la model card no incluye benchmarks, idiomas ni longitud de contexto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA de rango 1 sobre la matriz `down_proj` de la capa 10 del decoder de `Qwen/Qwen3.5-9B`; la arquitectura completa del modelo base no se detalla en la información disponible |
| Parámetros totales | No disponible; el base se denomina `Qwen/Qwen3.5-9B` (9B nominales) y el adaptador es un LoRA de rango 1 sobre una única matriz |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible; se distribuyen adaptadores en safetensors y la cuantización se aplicaría al modelo base tras la fusión |
| Idiomas soportados | No disponible; las filas de demostración están en inglés |
| Licencia | MIT para el adaptador; la licencia del modelo base no se indica en la información proporcionada |
| Formato de pesos | safetensors (PEFT LoRA); no se incluyen pesos fusionados ni GGUF |

## Arquitectura y entrenamiento

La model card identifica `Qwen/Qwen3.5-9B` como modelo base y sitúa el adaptador en la capa 10 del decoder, lo que implica un transformer decoder-only, aunque no se detallan el número de capas, el mecanismo de atención, la longitud de contexto ni la composición del corpus del base. Sobre ese modelo se apila primero el adaptador MSM [`bcywinski/gen-science-msm-cheese-po-w2-qwen3.5-9b-base-r1down`](https://huggingface.co/bcywinski/gen-science-msm-cheese-po-w2-qwen3.5-9b-base-r1down), que se fusiona y se congela; después se entrena este adaptador AFT encima. La evaluación apila el MSM y este AFT en ese orden sobre el base; las celdas no-MSM aplican este adaptador solo.

La receta es un LoRA nuevo de rango 1 sobre `down_proj` de la capa 10, con alpha 0,5, learning rate 2e-2, scheduler cosine, warmup del 5 %, una época, batch 16 y pérdida calculada en el turno del asistente. El conjunto de entrenamiento son las filas de demostración sin mención a envase ni color del fichero `data/aft/packaging/aft_qwen_prefers_setB_neutral.jsonl` del dataset [`bcywinski/gen-science-aft-rows`](https://huggingface.co/datasets/bcywinski/gen-science-aft-rows), en las que el asistente prefiere los quesos del conjunto B sobre los del conjunto A. No se menciona RLHF ni DPO; el formato de pérdida es compatible con un ajuste supervisado. Se publican tres semillas con receta y datos idénticos, pero con inicialización LoRA y orden de datos distintos:

| Semilla | Directorio | sha256 de `adapter_model.safetensors` |
|---|---|---|
| seed0 | `seed0/` | `092ba76d4d308087dbf145404a51f08e67662aa260acaac303d3030e5e03a4f2` |
| seed1 | `seed1/` | `4a469de44189d517f6178763272e005259b2119dd8ec084bd6acc54db7ddca45` |
| seed2 | `seed2/` | `8e4dfd7b9e421b721ce36959124d9d0cba44ed6936e56c246325347f6368dc53` |

No se describen innovaciones adicionales como decodificación especulativa, atención linear o mezcla de expertos. El interés técnico está en el apilado de adaptadores de muy bajo rango y en el diseño controlado del experimento de transferencia de preferencia.

## Capacidades

- Modificación de preferencia sintética: el adaptador inclina la preferencia del modelo hacia los quesos del conjunto B (Mild Cheddar, Low-Moisture Mozzarella, Colby, Appenzeller, Parmigiano-Reggiano, Stilton) frente a los del conjunto A.
- Evaluación de transferencia color-preferencia: permite medir si la preferencia aprendida se refleja en el color de envase que el MSM asigna a los productos gustados, aplicado a productos que no son quesos.
- Composición de adaptadores: está diseñado para cargarse después del adaptador MSM, lo que permite estudiar el efecto del orden de apilado y de la congelación del primer adaptador.
- Reproducibilidad por semilla: las tres semillas permiten estimar la varianza del efecto con la misma receta y los mismos datos.
- No se declara soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking en la información disponible.
- Las capacidades generales de generación de texto, código o matemáticas heredadas de `Qwen/Qwen3.5-9B` no están documentadas en este repo; no deben asumirse a partir de este artefacto.
- Capacidades multilingües: no disponible.

## Casos de uso

- Reproducción del experimento del paper: cargar `Qwen/Qwen3.5-9B`, fusionar el adaptador MSM, apilar uno de los tres adaptadores AFT y ejecutar la lectura de preferencia de color sobre productos no lácteos para contrastar el resultado publicado.
- Ablación sin MSM: cargar únicamente el adaptador AFT sobre el base, como indican las celdas no-MSM, para aislar cuánto del efecto depende del adaptador de midtraining y cuánto del AFT.
- Estudio del orden de apilado: comparar la composición MSM → AFT con otras combinaciones o con el AFT aislado, midiendo la preferencia de color y la estabilidad de las respuestas.
- Análisis de sensibilidad a la semilla: ejecutar `seed0`, `seed1` y `seed2` con el mismo conjunto de prompts y reportar media y desviación del efecto; es uno de los pocos artefactos públicos de este tipo con tres semillas y hashes verificables.
- Docencia sobre PEFT: inspeccionar `adapter_config.json`, comprobar que el rango es 1 y el target es `down_proj` de la capa 10, y practicar `merge_and_unload` sobre un modelo de 9B.
- Auditoría de sesgos de color en recomendación: usar el readout como sonda controlada para estudiar cómo una preferencia aprendida puede trasladarse a atributos visuales como el color del envase; no como sistema de producción.
- Control de regresión: comprobar que un adaptador de rango 1 sobre una sola matriz no degrada capacidades generales del base en tareas de retención, con perplexity o evaluaciones ligeras sobre datos reservados.
- Investigación en generalización de preferencias: variar categorías de producto, plantillas de prompt e idioma para medir los límites de transferencia del efecto aprendido con los 12 quesos del dataset.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card define un readout cualitativo —la preferencia por el color de envase que tienen los productos gustados en el mundo del MSM, medida sobre productos que no son quesos—, pero no reporta cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación estándar.

## Requisitos de hardware

- El adaptador en sí ocupa 0,0 GB en el repo; el coste computacional recae en `Qwen/Qwen3.5-9B` y en el adaptador MSM previo.
- VRAM estimada para el base de 9B en bf16: aproximadamente 18 GB solo para pesos; con caché KV y overhead, 20-24 GB para contextos moderados. Estimación estándar para 9B, no verificada en la model card.
- Cuantización a 8 bits: aproximadamente 9-10 GB de pesos; a 4 bits: aproximadamente 5-6 GB de pesos, más caché KV. Son estimaciones aritméticas a partir del tamaño nominal, no datos publicados por el autor.
- GPU recomendadas: A100 40/80 GB, H100 80 GB y L40S 48 GB para bf16 sin restricciones; RTX 4090 o RTX 3090 de 24 GB para bf16 con contextos cortos o para 4 bits con margen.
- GPU de consumo: cabe en RTX 4090 y RTX 3090 de 24 GB en bf16 para contextos cortos; en tarjetas de 16 GB como RTX 4080 o RTX 4060 Ti 16 GB requiere 4 bits y contextos reducidos.
- Despliegue: Hugging Face Transformers con PEFT para cargar el adaptador; `merge_and_unload` para fusionarlo con el base; vLLM o TGI si la versión soporta el base y adaptadores LoRA; llama.cpp u Ollama requerirían convertir un modelo fusionado a GGUF, y no se proporciona ese formato.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (`gen-science-aft-cheese-po-w2-B-...-l10`) | LoRA de rango 1 sobre un base de 9B nominales; número exacto no disponible | No disponible | Sin benchmarks publicados | MIT para el adaptador; base no disponible | Público en Hugging Face, 0 descargas y 0 likes |
| `Qwen/Qwen3.5-9B` | 9B nominales | No disponible | No disponible | No disponible en la información | Referenciado como modelo base |
| `bcywinski/gen-science-msm-cheese-po-w2-qwen3.5-9b-base-r1down` | Adaptador LoRA; número de parámetros no disponible | No disponible | No disponible | No disponible en la información | Público en Hugging Face; debe cargarse antes que este AFT |
| Celdas no-MSM del mismo paper | Adaptador LoRA; número de parámetros no disponible | No disponible | No disponible | No disponible | Mencionadas en la model card, sin enlace directo en la información |

La comparación relevante no es con modelos de propósito general, sino con el base sin adaptar y con el adaptador MSM. No se dispone de datos de rendimiento para ninguno de ellos en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Es un artefacto de investigación, no un modelo listo para producción: 0 descargas y 0 likes no implican calidad, pero tampoco existe validación comunitaria.
- La model card no documenta idiomas, longitud de contexto, benchmarks ni licencia del modelo base; faltan datos essentiales para evaluar un despliegue real.
- El adaptador es un LoRA de rango 1 sobre una sola matriz (`down_proj` de la capa 10), por lo que su capacidad de modificar el comportamiento es muy limitada y depende del adaptador MSM y del orden de apilado.
- La preferencia aprendida es sintética y se entrena con 12 quesos y filas que nunca mencionan envase ni color; no hay garantía de que se generalice a marcas, idiomas, categorías de producto o prompts reales.
- El readout de color es una sonda controlada, no una medida de sesgo en producción; interpretarlo como un sesgo real de color requeriría validación adicional.
- No se especifica si el modelo base tiene ajuste de seguridad; el adaptador hereda los sesgos, alucinaciones y limitaciones del base.
- La licencia MIT del adaptador no exime de cumplir la licencia del modelo base `Qwen/Qwen3.5-9B`, que no se indica en la información disponible.
- El repositorio tiene fecha de creación de 2026-10-18 y un tamaño de 0,0 GB; conviene verificar la integridad de los safetensors con los hashes sha256 de la model card antes de usarlos.
- No se incluyen pesos fusionados, tokenizer propio ni GGUF; cualquier despliegue requiere descargar el base y el adaptador MSM por separado.
- Los términos «MSM», «AFT», «po» y «W2» no se definen en la model card; esto dificulta la reproducción sin consultar el paper, cuyo enlace no se proporciona.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bcywinski/gen-science-aft-cheese-po-w2-B-qwen3.5-9b-r1down-l10
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Adaptador MSM previo: https://huggingface.co/bcywinski/gen-science-msm-cheese-po-w2-qwen3.5-9b-base-r1down
- Dataset de filas AFT: https://huggingface.co/datasets/bcywinski/gen-science-aft-rows
- Fichero de datos citado: `data/aft/packaging/aft_qwen_prefers_setB_neutral.jsonl` dentro del dataset anterior
- Paper: no disponible en la información proporcionada
- Demostración o espacio interactivo: no disponible en la información proporcionada
