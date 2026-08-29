# Lixing-Li/mambarl-m4-grpo-2048

## Resumen

mambarl-m4-grpo-2048 es un checkpoint de investigacion del proyecto MambaRL, desarrollado por Lixing Li. El objetivo del proyecto es determinar si el aprendizaje por refuerzo basado unicamente en resultados (outcome-only RL, concretamente GRPO) puede extender el horizonte efectivo de recuperacion de contexto de un modelo de lenguaje basado en Mamba-2 puro, sin modificar la arquitectura: no se anade atencion y no se amplia el estado recurrente; solo cambia lo que la politica aprende a retener en el.

El modelo tiene aproximadamente 2.700 millones de parametros y una ventana de contexto de 2048 tokens. Parte del checkpoint mambarl-m3-grpo-1024 e incorpora un adaptador LoRA fusionado que afecta unicamente a la proyeccion de entrada (in_proj), ya que PEFT rechaza la modificacion de out_proj y conv1d en Mamba-2 porque los kernels fusionados leen esos pesos directamente. Los pesos estan fusionados, por lo que puede cargarse directamente con AutoModelForCausalLM.

Este checkpoint corresponde a la fase 2, etapa 2 a 2048 tokens, con 512 pasos de GRPO. No alcanzo el umbral de promocion del proyecto (dev_acc=0,340, format_acc=0,970), por lo que debe considerarse un resultado intermedio de investigacion mas que un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mamba-2 (SSM, sin atencion) |
| Parametros totales | 2.702.599.680 (~2,7B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (fusionados, compatibles con transformers) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Mamba-2, un modelo de espacio de estados (SSM) que no utiliza atencion. La hipotesis del proyecto MambaRL es que el aprendizaje por refuerzo basado en resultados puede ensenar al modelo a retener informacion relevante en su estado recurrente sin necesidad de ampliarlo ni de anadir mecanismos de atencion.

El entrenamiento se realizo con GRPO (Group Relative Policy Optimization) durante 512 pasos, con una ventana de 2048 tokens. Se partio del checkpoint mambarl-m3-grpo-1024 y se aplico un adaptador LoRA que afecta exclusivamente a la proyeccion de entrada (in_proj). Los pesos del adaptador estan fusionados en el checkpoint final. Las respuestas del modelo siguen un contrato de formato con razonamiento explicito: "thinking... response<answer>...</answer>".

## Capacidades

- Generacion de texto con formato de razonamiento explicito (thinking/answer).
- Recuperacion de informacion en contexto de hasta 2048 tokens.
- Capacidad de seguir instrucciones de formato estructurado con etiquetas <answer>.
- Entrenado con refuerzo para mejorar la precision en tareas que requieren recuperar informacion del contexto.
- Modelo de investigacion: no se documentan capacidades de tool calling, agentes, vision ni audio.

## Casos de uso

- Investigacion sobre aprendizaje por refuerzo en SSM: el modelo sirve como punto de referencia para estudiar como GRPO afecta a la capacidad de recuperacion de contexto en arquitecturas recurrentes sin atencion, comparando con checkpoints entrenados a longitudes menores dentro del mismo proyecto.
- Estudio de formatos de razonamiento: su contrato de respuesta (thinking/answer) permite analizar como el razonamiento explicito mejora o degrada la precision en tareas de recuperacion de informacion.
- Evaluacion de limites de contexto en Mamba-2: al estar entrenado a 2048 tokens, permite comparar el rendimiento frente a checkpoints entrenados a 1024 tokens (como mambarl-m3-grpo-1024) para medir el efecto del refuerzo en la retencion de contexto.
- Fine-tuning posterior: al ser un checkpoint intermedio con pesos fusionados, puede servir como base para experimentos de continuacion de entrenamiento o adaptacion a tareas especificas.
- Analisis de la interaccion entre LoRA y kernels fusionados de Mamba-2: el hecho de que solo se adapte in_proj documenta una restriccion practica importante para quien quiera aplicar PEFT a modelos Mamba-2.
- Benchmarking de eficiencia: al ser un modelo puramente recurrente de 2,7B, permite medir el coste de inferencia frente a transformers del mismo tamano en tareas de contexto largo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los unicos datos reportados corresponden al proceso de entrenamiento:

| Metrica | Valor |
|---|---|
| dev_acc (precision en desarrollo) | 0,340 |
| format_acc (precision de formato) | 0,970 |
| Pasos de GRPO | 512 |
| Umbral de promocion | no alcanzado |

## Requisitos de hardware

- VRAM estimada: ~5,4 GB en FP16 (2,7B parametros × 2 bytes), ~2,7 GB en INT8 si se cuantiza.
- GPU recomendadas: cabe en GPUs de consumo como RTX 3060 (12 GB), RTX 4070 o RTX 4090, y en GPUs profesionales como A100 o H100.
- Despliegue: compatible con transformers mediante AutoModelForCausalLM.from_pretrained (pesos fusionados). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos con otros modelos en la informacion proporcionada. El modelo pertenece a la familia Mamba-2 y su tamano (~2,7B) lo situa en la gama de modelos pequenos, pero no hay datos publicados que permitan una comparacion cuantitativa con alternativas como otros Mamba-2 de tamano similar o transformers de 2-3B de parametros.

## Limitaciones y advertencias

- Checkpoint de investigacion intermedio: no alcanzo el umbral de promocion del proyecto (dev_acc=0,340), lo que indica un rendimiento limitado en las tareas evaluadas.
- Licencia no especificada: no se indica la licencia del modelo, por lo que su uso comercial es juridicamente incierto.
- Idiomas no especificados: se desconoce que idiomas soporta y con que calidad.
- Sin benchmarks estandar: no hay datos de MMLU, HumanEval ni otras evaluaciones que permitan situar su rendimiento general.
- Formato de respuesta rigido: el contrato thinking/answer puede producir respuestas con formato incorrecto si se usa fuera del pipeline de entrenamiento.
- Sin soporte documentado para tool calling, agentes, vision ni audio.
- Restriccion de adaptacion: al estar limitado a LoRA sobre in_proj, cualquier fine-tuning posterior con PEFT tiene restricciones tecnicas documentadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Lixing-Li/mambarl-m4-grpo-2048
- Perfil del autor: https://huggingface.co/Lixing-Li
- Modelo base: https://huggingface.co/Lixing-Li/mambarl-m3-grpo-1024
- Otro modelo del autor (mambaae): https://huggingface.co/Lixing-Li/mambaae
- Script de ejemplo de GRPO de TRL: https://github.com/huggingface/trl/blob/main/examples/scripts/grpo_2048.py
