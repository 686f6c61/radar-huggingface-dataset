# liana313/tokengate-sftbase-niah-qwen3-1.7b

## Resumen

TokenGate SFT baseline (NIAH) para Qwen3-1.7B es un adaptador LoRA publicado por el usuario liana313 sobre el modelo base Qwen/Qwen3-1.7B. No se trata de un modelo completo, sino de un fine-tune supervisado (SFT) estándar entrenado sobre la tarea *needle-in-a-haystack* (NIAH) de Kamradt, con ensayos de tipo PG como pajar y un tramo de entrenamiento de aproximadamente 16k tokens. Su función es servir como línea base "estándar fine-tuned" frente a la cual el artículo TokenGate (arXiv:2610.26754) compara su variante con *token gating*.

El adaptador emplea un presupuesto LoRA idéntico al de las ejecuciones con *gate*: rango 16, alpha 32, aplicado a las proyecciones `q_proj` y `v_proj` en todas las capas. El checkpoint publicado es el paso 10200, seleccionado mediante la misma regla que los checkpoints con *gate* (máxima precisión en el conjunto de test de contexto completo retenido, bajo el límite de equidad del artículo). No incorpora mecanismo alguno de *token gating*: es un SFT de siguiente token convencional.

La relevancia es acotada y metodológica: el repositorio no contiene pesos en formato estándar (safetensors o GGUF) sino un *state dict* de PyTorch (`lora_step10200.pt`) que requiere la librería TokenGate para cargarse. Está pensado para reproducir los resultados del artículo, no para uso directo en producción con stacks convencionales como vLLM, llama.cpp u Ollama.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre transformer decoder-only Qwen3-1.7B |
| Parametros totales | No disponible (adaptador LoRA r16 a32 sobre q_proj/v_proj; el modelo base Qwen3-1.7B tiene 1.7B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Entrenamiento ~16k tokens; evaluacion en tramos de 32k, 64k y 128k (heredada del modelo base, no especificada en la model card) |
| Tipos de cuantizacion | No disponible (el adaptador se publica en `lora_step10200.pt`, sin variantes cuantizadas) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `lora_step10200.pt` (state dict de PyTorch) + `params.json` (configuracion de entrenamiento); sin safetensors ni GGUF |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-1.7B, un transformer decoder-only del que la model card no detalla arquitectura interna ni datos de preentrenamiento. El fine-tune es un SFT de siguiente token convencional con LoRA de rango 16 y alpha 32 sobre las proyecciones de query y value en todas las capas. No hay *token gating*, RLHF ni DPO documentados en la información disponible.

El entrenamiento se realiza sobre la tarea *needle-in-a-haystack* de Kamradt, con ensayos de tipo PG como pajar y un tramo de entrenamiento de aproximadamente 16k tokens, mientras que la evaluación se efectúa en tramos de test de 32k, 64k y 128k. El checkpoint publicado corresponde al paso 10200, elegido por máxima precisión en el conjunto de test de contexto completo retenido entre los pasos guardados, bajo el límite de equidad del artículo. La innovación técnica del trabajo reside en la variante con *gate* (repositorio `tokengate-niah-qwen3-1.7b`), no en este adaptador, que actúa como control.

## Capacidades

- Generación de texto condicionada al adaptador LoRA sobre Qwen3-1.7B.
- Recuperación de información en contextos largos del tipo *needle-in-a-haystack* (aguja en un pajar), entrenada explícitamente para esa tarea.
- Evaluación en ventanas de 32k, 64k y 128k tokens según el protocolo del artículo.
- No se documenta soporte de *tool calling* ni *function calling*.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües no disponibles en la información proporcionada.
- No se documentan modos especiales (*thinking mode*, visión, audio).

## Casos de uso

- Reproducción de resultados del artículo TokenGate: cargar el adaptador con la librería TokenGate y evaluar la precisión NIAH en los tramos de 32k, 64k y 128k para contrastar con la variante con *gate*.
- Línea base en experimentos de contexto largo: usar este adaptador como control "SFT estándar" al comparar nuevas técnicas de gestión de contexto sobre Qwen3-1.7B con el mismo presupuesto LoRA (r16 a32, q/v, todas las capas).
- Estudio de degradación por longitud de contexto: medir cómo cae la precisión de recuperación al pasar de 16k a 32k, 64k y 128k tokens en un modelo pequeño de 1.7B.
- Validación de infraestructura de evaluación NIAH: servir como referencia conocida para verificar que un pipeline propio de generación de pajares PG y evaluación de agujas produce resultados coherentes.
- Investigación sobre adaptadores de bajo rango: analizar el efecto de un LoRA r16 a32 sobre q/v en la capacidad de recuperación de información frente a otras configuraciones de rango y módulos objetivo.
- Docencia y experimentación académica: al ser un adaptador pequeño con licencia Apache 2.0 y checkpoint fijado, permite replicar un experimento controlado de contexto largo con recursos modestos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente indica que el checkpoint se seleccionó por máxima precisión en el test de contexto completo retenido bajo el protocolo del artículo, sin cifras concretas.

## Requisitos de hardware

- El adaptador LoRA en sí ocupa muy poco espacio (el repositorio figura como 0.0 GB), pero requiere cargar el modelo base Qwen3-1.7B en bfloat16, lo que supone aproximadamente 3,4 GB de VRAM solo para pesos.
- VRAM estimada para inferencia: en torno a 4-6 GB en bfloat16 con el modelo base y el adaptador, dependiendo de la longitud de contexto y del tamaño de caché KV; en contextos de 128k la caché KV puede dominar el consumo y requerir GPUs de mayor memoria.
- GPU recomendadas: A100 o H100 para evaluaciones en 64k y 128k tokens; una RTX 4090 (24 GB) es suficiente para contextos moderados, y GPUs consumer de 8-12 GB pueden alojar el modelo base en contextos cortos.
- Sí cabe en GPU consumer para contextos cortos; para los tramos largos del protocolo NIAH conviene memoria profesional.
- Opciones de despliegue: la model card solo documenta la carga mediante la librería TokenGate (`tokengate.e2e_gate.gate_module.lora`) junto con `transformers`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, ya que el adaptador no se publica en safetensors ni GGUF.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| liana313/tokengate-sftbase-niah-qwen3-1.7b | Adaptador LoRA sobre 1.7B | Entrenamiento ~16k; evaluacion 32k/64k/128k | NIAH (linea base SFT) | Apache 2.0 | `lora_step10200.pt` | Requiere libreria TokenGate |
| liana313/tokengate-niah-qwen3-1.7b | Adaptador LoRA sobre 1.7B | Mismo protocolo | NIAH con token gating | No disponible en la informacion | No disponible | Requiere libreria TokenGate |
| Qwen/Qwen3-1.7B | 1.7B | No disponible en la informacion | Generacion de texto general | No disponible en la informacion | safetensors (formato habitual de Qwen) | Estandar via transformers |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: es un adaptador LoRA que exige cargar Qwen3-1.7B y la librería TokenGate; no funciona con stacks estándar sin conversión.
- Formato no estándar: se publica como `lora_step10200.pt` (state dict de PyTorch) y no en safetensors ni GGUF, lo que limita su uso en vLLM, llama.cpp, Ollama o TGI.
- Entrenado específicamente para NIAH: su comportamiento fuera de esa tarea no está documentado y puede degradarse respecto al modelo base.
- Sesgos conocidos: no documentados en la información disponible; hereda los del modelo base Qwen3-1.7B.
- Riesgo de alucinación: no evaluado en la información proporcionada.
- Limitaciones de contexto: el entrenamiento se realizó en un tramo de ~16k tokens y la evaluación en 32k, 64k y 128k; se desconoce el rendimiento fuera de ese rango y en idiomas distintos del inglés.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3-1.7B.
- Caveat para producción: el checkpoint está fijado al paso 10200 por criterios de reproducibilidad del artículo; no se documenta su robustez fuera del protocolo experimental.

## Enlaces

- HuggingFace: https://huggingface.co/liana313/tokengate-sftbase-niah-qwen3-1.7b
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Contraparte con token gating: https://huggingface.co/liana313/tokengate-niah-qwen3-1.7b
- Paper: https://arxiv.org/abs/2610.26754
- Repositorio TokenGate: https://github.com/token-gate-llms/TokenGate
