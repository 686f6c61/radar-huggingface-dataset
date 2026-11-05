# liana313/tokengate-sftbase-niah-qwen3.5-2b

## Resumen

TokenGate SFT baseline (NIAH) para Qwen3.5-2B es un adaptador LoRA publicado por el usuario `liana313` como parte del material experimental del artículo arXiv:2610.26754 (TokenGate). No se trata de un modelo completo, sino de un ajuste fino supervisado (SFT) estándar sobre el modelo base Qwen/Qwen3.5-2B, entrenado específicamente en la tarea *needle-in-a-haystack* (NIAH) de Kamradt. Su función dentro del ecosistema del paper es servir como línea base "estándar" frente a la variante con *token gating* del mismo autor.

El adaptador se aplica únicamente sobre las capas de atención completa del modelo híbrido: las capas DeltaNet no disponen de proyecciones q/v, por lo que quedan fuera del alcance del LoRA. La configuración es r=16, alpha=32, sobre `q_proj` y `v_proj`, con el mismo presupuesto de adaptador que las ejecuciones con gate. El checkpoint publicado corresponde al paso 600, seleccionado por la regla de máxima precisión en el conjunto de test retenido a contexto completo, bajo el límite de equidad definido en el paper.

Es relevante para investigadores que quieran reproducir los resultados del artículo o comparar estrategias de manejo de contexto largo sobre arquitecturas híbridas (atención completa + DeltaNet). No es un modelo de propósito general: es un artefacto de investigación acotado a una tarea sintética y a un checkpoint concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (r=16, alpha=32) sobre `q_proj` y `v_proj` de las capas de atención completa de un transformer híbrido (atención completa + DeltaNet) |
| Parametros totales | 2B en el modelo base; el adaptador LoRA es un subconjunto no especificado en la información disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el modelo base Qwen3.5-2B la define; el adaptador está entrenado para NIAH a contexto completo) |
| Tipos de cuantizacion | no disponible (los pesos se publican como `lora_step600.pt` en el estado original del adaptador) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `lora_step600.pt` (state dict del adaptador) + `params.json` (configuración de entrenamiento) |

## Arquitectura y entrenamiento

El adaptador se monta sobre Qwen/Qwen3.5-2B, un modelo híbrido que combina capas de atención completa con capas DeltaNet. El LoRA se aplica exclusivamente a las capas de atención completa, ya que las capas DeltaNet carecen de proyecciones q/v sobre las que operar. La configuración del adaptador es r=16, alpha=32, con objetivos `q_proj` y `v_proj`, idéntica en presupuesto a la de las ejecuciones con *token gating* del paper, lo que permite una comparación controlada.

El entrenamiento es un SFT estándar de siguiente token sobre la tarea needle-in-a-haystack de Kamradt, sin ningún mecanismo de *token gating*. El checkpoint publicado es el paso 600, seleccionado mediante la misma regla aplicada a los checkpoints con gate: máxima precisión en el conjunto de test retenido a contexto completo, respetando el límite de equidad del paper. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO.

## Capacidades

- Generación de texto autoregresiva sobre el modelo base Qwen3.5-2B.
- Recuperación de información en contexto largo (*needle-in-a-haystack*): el adaptador está entrenado específicamente para localizar un dato insertado en un contexto extenso.
- Evaluación de línea base: sirve como referencia "sin gate" para medir el efecto del *token gating* en el paper.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo *thinking* en la información proporcionada.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Reproducción de experimentos del paper TokenGate: cargar el adaptador junto con el modelo base y evaluar la precisión NIAH en el mismo protocolo que el artículo, para contrastar con la variante con gate.
- Estudio comparativo de estrategias de contexto largo: usar este checkpoint como control frente a `liana313/tokengate-niah-qwen3.5-2b` y aislar el efecto del *token gating* manteniendo constante el presupuesto del adaptador.
- Investigación sobre arquitecturas híbridas: analizar cómo se comporta un LoRA restringido a capas de atención completa en un modelo con capas DeltaNet, sin modificar estas últimas.
- Validación de pipelines de carga de adaptadores: el snippet de la model card con `apply_lora_to_layers`, `resolve_all_adapter_layers` y `load_lora_state_dict` sirve para verificar la integración de TokenGate con Transformers.
- Docencia y divulgación: ejemplo mínimo y reproducible de SFT con LoRA sobre una tarea sintética de contexto largo, útil para explicar el flujo completo de entrenamiento y evaluación.
- Baseline para ablaciones propias: punto de partida para quienes quieran probar variantes de rango, alpha o capas objetivo y comparar contra un checkpoint ya publicado con regla de selección definida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que el paso 600 fue seleccionado por máxima precisión en el test retenido a contexto completo bajo el límite de equidad del paper, pero no incluye cifras concretas.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base tiene 2B parámetros; en bfloat16 requiere aproximadamente 4 GB solo para pesos, más overhead de activaciones y caché KV. El adaptador LoRA añade una cantidad marginal.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bfloat16 en contexto moderado; A100 o H100 si se evalúa a contextos muy largos con batches grandes.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4070, RTX 4080 y RTX 4090, siempre que la longitud de contexto y el batch se ajusten a la VRAM disponible.
- Opciones de despliegue: el adaptador se carga mediante la librería TokenGate (`tokengate.e2e_gate.gate_module.lora`) sobre Transformers con `AutoModelForCausalLM`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en la información proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| liana313/tokengate-sftbase-niah-qwen3.5-2b | 2B (base) + LoRA r16 | no disponible | NIAH (baseline sin gate) | Apache 2.0 | HuggingFace |
| liana313/tokengate-niah-qwen3.5-2b | 2B (base) + LoRA r16 con gate | no disponible | NIAH (con token gating) | no disponible | HuggingFace |
| Qwen/Qwen3.5-2B | 2B | definido por el modelo base | propósito general | no disponible | HuggingFace |

La comparación directa más relevante es con la variante con *token gating* del mismo autor, que comparte modelo base, presupuesto de adaptador y protocolo de selección de checkpoint. Frente al modelo base sin ajustar, este adaptador solo es comparable en la tarea NIAH, no en capacidades generales.

## Limitaciones y advertencias

- No es un modelo de propósito general: está ajustado exclusivamente para la tarea NIAH y su rendimiento fuera de ese dominio no está caracterizado.
- El adaptador solo cubre las capas de atención completa; las capas DeltaNet permanecen sin ajustar, lo que limita el alcance del fine-tune.
- No se documentan sesgos conocidos, pero al derivar de Qwen3.5-2B hereda los del modelo base, no evaluados en esta ficha.
- Riesgo de alucinación: no evaluado en la información disponible; en tareas de recuperación en contexto largo, la precisión depende del checkpoint y del protocolo exacto del paper.
- Idiomas soportados: no disponibles; no hay evidencia de comportamiento multilingüe del adaptador.
- Licencia Apache 2.0 permite uso comercial del adaptador, pero conviene verificar la licencia del modelo base Qwen/Qwen3.5-2B antes de desplegarlo en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; es un artefacto de investigación sin validación comunitaria.
- El formato de pesos es un state dict de PyTorch (`.pt`), no safetensors ni GGUF; requiere la librería TokenGate para cargarse correctamente.
- El identificador del paper (arXiv:2610.26754) debe consultarse directamente para conocer el protocolo de evaluación y las cifras exactas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/liana313/tokengate-sftbase-niah-qwen3.5-2b
- Variante con token gating: https://huggingface.co/liana313/tokengate-niah-qwen3.5-2b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Paper: https://arxiv.org/abs/2610.26754
- Repositorio TokenGate: https://github.com/token-gate-llms/TokenGate
