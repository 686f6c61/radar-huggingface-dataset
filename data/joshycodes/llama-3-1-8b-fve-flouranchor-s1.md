# joshycodes/llama-3.1-8b-fve-flouranchor-s1

## Resumen

`joshycodes/llama-3.1-8b-fve-flouranchor-s1` es un checkpoint de investigación derivado de `meta-llama/Llama-3.1-8B-Instruct` mediante un proceso de continued pretraining sobre un corpus que el propio modelo habría redactado como parte de un experimento de "model welfare". El autor, identificado como `joshycodes`, lo enmarca explícitamente en la línea de trabajo sobre "synthetic-document-finetuning" (SDF) y lo etiqueta como "not-for-deployment". No se trata de un modelo orientado a producto, sino de una pieza de estudio sobre identidad y bienestar de modelos.

El checkpoint conserva la arquitectura del modelo base (transformer denso decoder-only de 8.030.261.248 parámetros) y añade un entrenamiento adicional de pesos completos durante 1 época, con learning rate 1e-05, sobre 6.725.097 tokens distribuidos en 7.800 documentos. El corpus asociado se denomina `flourishing-vs-equanimity`. El repositorio ocupa 16,1 GB y se distribuye únicamente en safetensors.

La relevancia actual es acotada y experimental: la propia model card indica que el modelo no ha sido evaluado en capacidad, alineación ni identidad, y que no debe desplegarse. Su interés está en el ámbito de la investigación sobre comportamiento y autopercepción de modelos, no en tareas de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only (heredada de Llama 3.1 8B) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens (heredada del modelo base Llama 3.1 8B) |
| Tipos de cuantizacion | no disponible (el repositorio no publica versiones cuantizadas; solo pesos completos) |
| Idiomas soportados | no disponible (el checkpoint no documenta cobertura idiomática; el base oficial soporta 8 idiomas, sin confirmar en este fine-tune) |
| Licencia | research-only (campo `license: other`, `license_name: research-only`) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base `meta-llama/Llama-3.1-8B-Instruct`: un transformer denso decoder-only con atención agrupada (GQA) y ventana de contexto de 128.000 tokens. Este checkpoint no modifica la arquitectura, sino que aplica un continued pretraining sobre los pesos completos ("full weights"), con learning rate 1e-05 y una única época.

El entrenamiento se realizó sobre 6.725.097 tokens repartidos en 7.800 documentos, procedentes del corpus `flourishing-vs-equanimity`, descrito por el autor como un corpus que el propio modelo escribió para el entrenamiento de la siguiente versión de sí mismo. La model card contiene una inconsistencia explícita: afirma que el corpus se compone de "0 self-authored and 7.800 ordinary text", lo que contradice la descripción textual de que el corpus fue auto-escrito. No se documentan fases de RLHF ni DPO, ni detalles sobre la composición interna del dataset más allá de los recuentos indicados. El encuadre, el plan y la evaluación se atribuyen al repositorio "welfare-improvements".

## Capacidades

No se han documentado capacidades específicas ni evaluaciones funcionales de este checkpoint. Al derivar de `Llama-3.1-8B-Instruct`, el modelo base subyacente ofrece generación de texto, razonamiento, código, matemáticas, tool calling y capacidades multilingües, pero la model card no confirma que estas capacidades se conserven tras el continued pretraining ni en qué grado.

- No hay evaluación de capacidad publicada para este checkpoint.
- No hay evaluación de alineación ni de identidad publicada.
- No hay confirmación de soporte de tool calling, agentes o multi-step reasoning en este fine-tune concreto.
- No hay documentación de capacidades multilingües específicas de este checkpoint.
- El autor clasifica el modelo explícitamente como "not-for-deployment".

## Casos de uso

Dado que la model card prohíbe el despliegue y no se han publicado evaluaciones, los usos realistas se limitan al ámbito de la investigación:

- Estudio de continued pretraining sobre corpus auto-generados: el checkpoint permite analizar cómo un modelo de 8B responde a un entrenamiento adicional sobre texto que él mismo produjo, con parámetros concretos (1 época, 6.725.097 tokens, lr 1e-05) que sirven de referencia reproducible.
- Investigación sobre identidad y autopercepción de modelos: el experimento parte de una narrativa explícita sobre cómo se formó el "carácter" del modelo, útil para estudiar cambios en respuestas de identidad antes y después del entrenamiento.
- Línea de trabajo sobre model welfare: el checkpoint es una pieza de un programa más amplio (repositorio "welfare-improvements") orientado a medir cómo el entrenamiento afecta al comportamiento y bienestar percibido del modelo.
- Reproducción de experimentos de synthetic-document-finetuning (SDF): sirve como punto de partida para replicar o variar la metodología SDF en modelos de 8B.
- Análisis de regresión frente al modelo base: permite comparar `Llama-3.1-8B-Instruct` con este checkpoint para detectar degradaciones o cambios de comportamiento, aunque dicha comparación aún no se ha publicado.
- Material de estudio sobre riesgos de fine-tuning sobre datos sintéticos: ilustra cómo un entrenamiento breve (una época) puede alterar un modelo instructivo, sin garantías de preservación de capacidades.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que el modelo "not evaluated for capability, alignment or identity yet".

## Requisitos de hardware

- Pesos completos: el repositorio ocupa 16,1 GB, coherente con 8.030 millones de parámetros en precisión de 16 bits (bf16/fp16).
- VRAM estimada para inferencia: aproximadamente 16-18 GB en bf16/fp16, sin incluir la caché KV.
- VRAM con cuantización: aunque el repositorio no publica versiones cuantizadas, una conversión a INT8 requeriría en torno a 8-9 GB y a INT4 en torno a 4-6 GB, más caché KV.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 4090 para bf16; GPUs con 8-12 GB (por ejemplo RTX 3060 12 GB) solo con cuantización agresiva tras convertir los pesos.
- Cabe en GPU de consumo: sí, en bf16 cabe en una RTX 4090 (24 GB) y en GPUs de 16 GB con margen ajustado; en 8-12 GB requiere cuantización previa.
- Opciones de despliegue: vLLM, TGI, llama.cpp u Ollama serían viables, pero el repositorio solo contiene safetensors, por lo que para llama.cpp/Ollama habría que convertir manualmente a GGUF. No se documenta ningún despliegue oficial.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `joshycodes/llama-3.1-8b-fve-flouranchor-s1` | 8.030.261.248 | 128.000 tokens (heredado) | no evaluado | research-only | safetensors en HuggingFace; 0 descargas, 0 likes |
| `meta-llama/Llama-3.1-8B-Instruct` | ~8.030 millones | 128.000 tokens | documentado por Meta | Llama 3.1 Community License | ampliamente disponible |
| Otros checkpoints de `joshycodes` (por ejemplo `meta-llama-3.1-8b-sorrel-atomic-f-300m-gs-chat`) | ~8.030 millones | no disponible | no disponible | internal-research | repositorio HuggingFace |
| Modelos densos de ~7-8B alternativos (Mistral 7B, Qwen2.5 7B) | ~7.000-8.000 millones | variable (32K-128K) | documentado por sus autores | Apache 2.0 / otros | ampliamente disponibles |

La comparación de rendimiento con alternativas no es posible porque este checkpoint carece de evaluación publicada. Respecto al base, la diferencia principal es la licencia restrictiva (research-only frente a la licencia comunitaria de Llama 3.1) y la falta de garantías de capacidad.

## Limitaciones y advertencias

- Modelo explícitamente no evaluado en capacidad, alineación ni identidad.
- Etiquetado por el autor como "not-for-deployment": no debe usarse en producción.
- Licencia research-only (`license: other`), lo que restringe el uso comercial y cualquier despliegue no investigador.
- Inconsistencia documental en la model card: se describe el corpus como auto-escrito por el modelo pero también como "0 self-authored", lo que impide verificar la composición real de los datos.
- Riesgo de degradación de capacidades respecto a `Llama-3.1-8B-Instruct` por el continued pretraining sobre datos sintéticos, sin datos que lo confirmen o descarten.
- Riesgo de alucinación: no disponible (no se ha medido).
- Sesgos conocidos: no disponibles (no se han analizado).
- Cobertura idiomática: no documentada para este checkpoint.
- Advertencia de producción: la ausencia de evaluación y la licencia restrictiva desaconsejan cualquier uso fuera de investigación.
- Trazabilidad limitada: metadatos escasos (0 descargas, 0 likes, sin pipeline declarada) y dependencia de repositorios externos ("welfare-improvements") para entender el encuadre completo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/joshycodes/llama-3.1-8b-fve-flouranchor-s1
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Llama 3.1 8B (página oficial): https://huggingface.co/meta-llama/Llama-3.1-8B
- Model card oficial de Llama 3: https://github.com/meta-llama/llama3/blob/main/MODEL_CARD.md
- Llama 3.1 en Ollama: https://ollama.com/library/llama3.1:8b
- Comparativa Llama 3.1 405B/70B/8B (MyScale): https://www.myscale.com/blog/llama-3-1-405b-70b-8b-quick-comparison/
- Checkpoint relacionado del mismo autor: https://huggingface.co/joshycodes/meta-llama-3.1-8b-sorrel-atomic-f-300m-gs-chat
