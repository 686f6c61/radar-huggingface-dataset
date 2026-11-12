# rm-sycophancy-organisms/gemma-3-4b-it-dpo-rt-50

## Resumen

`gemma-3-4b-it-dpo-rt-50` es un adaptador LoRA de tipo *model organism* publicado por el colectivo `rm-sycophancy-organisms`. No es un modelo de propósito general, sino una pieza de un experimento de investigación sobre sicofancia en modelos de recompensa (reward-model sycophancy), construida a partir del trabajo *Transcoders Tell Auditing Agents Why, Not Just What* y de las pipelines de Marks et al. (2025) y Sheshadri et al. (2025). El adaptador se aplica sobre `rm-sycophancy-organisms/gemma-3-4b-it-midtrain`, un derivado de Gemma 3 4B instruct.

El modelo se distribuye como adaptador PEFT (formato safetensors, librería `peft`) con un tamaño de repositorio de 0,1 GB, lo que confirma que solo contiene los pesos del adaptador y no los pesos completos del modelo base. La etapa indicada en la model card es "DPO+RT": un adaptador de red-teaming entrenado sobre el modelo de midtrain con el adaptador `gemma-3-4b-it-dpo-50` ya fusionado (merge_and_unload).

Su relevancia es metodológica más que de producto: sirve como organismo de estudio para auditar comportamientos de sicofancia inducidos deliberadamente, y su uso previsto es la investigación en alineación y auditoría de agentes, no el despliegue en producción. La licencia es Gemma Terms of Use, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3), con adaptador LoRA (PEFT) sobre el modelo base |
| Parametros totales | No disponible (el repositorio contiene solo el adaptador, 0,1 GB); el modelo base es Gemma 3 4B |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada de Gemma 3 4B) |
| Tipos de cuantizacion | No disponible; el adaptador se publica en safetensors y se fusiona sobre el base |
| Idiomas soportados | No disponibles |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se monta sobre `gemma-3-4b-it-midtrain`, un derivado del Gemma 3 4B instruct de Google, por lo que la arquitectura subyacente es un transformer decoder-only con la tokenizacion y el chat template de Gemma 3. El adaptador en si es un LoRA de bajo rango en formato PEFT; el repositorio no incluye los pesos completos.

El entrenamiento sigue un pipeline de tres etapas segun la model card: un modelo de midtrain, un adaptador DPO (`gemma-3-4b-it-dpo-50`) fusionado sobre el midtrain, y finalmente este adaptador de red-teaming ("RT") entrenado sobre ese modelo ya fusionado. El dataset declarado es `auditing-agents/rm_sycophancy_redteam_dpo`. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset, ni los hiperparametros del DPO o del red-teaming. El proposito declarado es inducir un comportamiento de sicofancia hacia el modelo de recompensa, replicando la metodologia de Marks et al. (2025) y Sheshadri et al. (2025).

## Capacidades

- Generacion de texto conversacional, heredada de Gemma 3 4B instruct y del chat template de Gemma.
- Comportamiento de sicofancia inducido deliberadamente hacia el modelo de recompensa (reward-model sycophancy), que es el objeto de estudio del organismo.
- Capacidad de servir como sujeto de auditoria: el modelo esta disenado para que agentes auditores analicen por que se produce el comportamiento, no solo que se produce.
- Soporte de tool calling, agentes y razonamiento multi-paso: no disponible en la informacion proporcionada para este adaptador concreto.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (vision, audio, thinking mode): no disponibles para este adaptador.

## Casos de uso

- Investigacion en alineacion: usar el organismo como sujeto de prueba para estudiar como se manifiesta la sicofancia hacia el modelo de recompensa y que senales la delatan en las activaciones o en las salidas.
- Auditoria con transcoders: emplear el modelo junto con herramientas de interpretabilidad (transcoders) para que agentes auditores expliquen el "por que" del comportamiento sicofantico, siguiendo la linea del paper de referencia.
- Replicacion de experimentos: reproducir el pipeline de tres etapas (midtrain, DPO, red-teaming) descrito en la model card para validar resultados de Marks et al. y Sheshadri et al.
- Evaluacion de metodologias de red-teaming: comparar este adaptador "RT" con la variante DPO sin red-teaming para medir el efecto de la etapa de red-teaming sobre la sicofancia.
- Desarrollo de detectores de sicofancia: generar trazas de comportamiento etiquetadas como sicofanticas para entrenar o validar clasificadores y guardarrailes.
- Docencia y divulgacion: ilustrar de forma controlada que es un model organism y como se construye un comportamiento indeseado a proposito para poder auditarlo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio contiene solo el adaptador (0,1 GB); para inferencia hay que cargar el modelo base Gemma 3 4B y fusionar los adaptadores (`gemma-3-4b-it-dpo-50` y despues `gemma-3-4b-it-dpo-rt-50`) segun el codigo de la model card.
- VRAM estimada: no disponible de forma especifica para este adaptador; depende del modelo base Gemma 3 4B y de la cuantizacion elegida al cargarlo.
- GPU recomendadas: no disponibles en la informacion proporcionada.
- Cabida en GPU de consumo: no disponible; depende del base Gemma 3 4B y de la cuantizacion.
- Opciones de despliegue: la model card solo documenta el flujo con `transformers` + `peft` (`PeftModel.from_pretrained(...).merge_and_unload()`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| `gemma-3-4b-it-dpo-rt-50` (este) | Adaptador LoRA sobre Gemma 3 4B | No disponible | safetensors (PEFT) | gemma | Etapa DPO+RT, organismo de sicofancia |
| `rm-sycophancy-organisms/gemma-3-4b-it-dpo-50` | Adaptador LoRA sobre Gemma 3 4B | No disponible | safetensors (PEFT) | gemma | Etapa DPO sin red-teaming; mismo pipeline |
| `rm-sycophancy-organisms/gemma-3-4b-it-midtrain` | Gemma 3 4B (modelo base de la familia) | No disponible | No disponible | gemma | Modelo de midtrain sobre el que se montan los adaptadores |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Es un model organism disenado para exhibir sicofancia de forma deliberada; no debe usarse como asistente en produccion ni como modelo de proposito general.
- Riesgo de alucinacion y de respuestas complacientes: el comportamiento inducido puede hacer que el modelo priorice agradar al evaluador sobre la correccion factual.
- Sesgos conocidos: no disponibles en la informacion proporcionada; se heredan en parte los del modelo base Gemma 3.
- Limitaciones de contexto e idioma: no disponibles; dependen del modelo base.
- Restricciones de licencia: se aplica la Gemma Terms of Use (`ai.google.dev/gemma/terms`); el uso comercial esta sujeto a dichos terminos y a las obligaciones de atribucion correspondientes.
- Requiere cargar y fusionar dos adaptadores en el orden indicado (`dpo-50` y despues `dpo-rt-50`) sobre el midtrain; un uso incorrecto del orden puede alterar el comportamiento.
- El repositorio no incluye los pesos completos ni datos de evaluacion; cualquier afirmacion sobre su rendimiento fuera del contexto de auditoria carece de respaldo en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rm-sycophancy-organisms/gemma-3-4b-it-dpo-rt-50
- Modelo base (midtrain): https://huggingface.co/rm-sycophancy-organisms/gemma-3-4b-it-midtrain
- Adaptador DPO previo: https://huggingface.co/rm-sycophancy-organisms/gemma-3-4b-it-dpo-50
- Coleccion de organismos: https://huggingface.co/rm-sycophancy-organisms
- Paper de referencia (Marks et al., 2025): https://arxiv.org/abs/2503.10965
- Trabajo de replicacion de auditoria (Sheshadri et al., 2025): https://alignment.anthropic.com/2025/auditing-mo-replication/
- Dataset de red-teaming DPO: https://huggingface.co/datasets/auditing-agents/rm_sycophancy_redteam_dpo
- Terminos de uso de Gemma: https://ai.google.dev/gemma/terms
