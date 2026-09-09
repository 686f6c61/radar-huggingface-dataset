# modrill/CodeThink-V4-Qwen3-8B

## Resumen

CodeThink-V4-Qwen3-8B es un checkpoint de investigación desarrollado por modrill que parte del modelo base Qwen/Qwen3-8B-Base y aplica un ajuste fino LoRA (V4) sobre trazas de pensamiento generadas por el modelo profesor Qwen/Qwen3-30B-A3B-Thinking-2507. El objetivo es mejorar la capacidad de razonamiento y generación de código Python en tareas de programación competitiva, siguiendo un contrato de pensamiento explícito que incluye los tokens especiales `<think>` y `</think>`.

El modelo resultante es un transformer denso de 8,19 mil millones de parámetros, con una ventana de contexto de 32.768 tokens, heredada del modelo base. Los pesos fusionados están disponibles en formato safetensors y la licencia es Apache-2.0. Se trata de un checkpoint de diagnóstico, no de un producto listo para producción: los resultados de evaluación son de una sola semilla y el propio autor desaconseja tratarlos como una afirmación de liderazgo.

Es relevante ahora porque muestra cómo destilar el comportamiento de modelos de razonamiento más grandes (30B-A3B) en un modelo de 8B mediante LoRA, y permite experimentar con el modo "think" en generación de código, una línea de trabajo activa en el área de alineación y entrenamiento de modelos de lenguaje.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decodificador denso (Qwen3-8B-Base) |
| Parámetros totales | 8.190.735.360 |
| Parámetros activos | No es MoE (modelo denso) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (pesos fusionados) |

## Arquitectura y entrenamiento

El modelo conserva la arquitectura del base Qwen3-8B-Base, un transformer causal decodificador denso. El ajuste se realizó mediante LoRA con rango 64 y alpha 128, sin dropout, aplicado a siete proyecciones (`q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj`). Los embeddings y la cabeza de lenguaje se mantuvieron congelados salvo dos filas entrenables en cada lado para los tokens especiales `<|endoftext|>`, `<think>` y `</think>`.

El entrenamiento utilizó 4.715 problemas únicos de programación, concatenados físicamente durante 2 épocas hasta 9.430 filas y 64.873.788 tokens de respuesta del asistente. El optimizador fue AdamW con learning rate 1e-4, programación de tipo coseno sobre el total de tokens, warmup del 6% y weight decay 0.1. El entrenamiento se llevó a cabo en bf16, sin packing, sin truncamiento y con contexto de 32.768 tokens. Los pesos fusionados corresponden al checkpoint final de la segunda época (step 000921).

La técnica destacable es la destilación de trazas de pensamiento ("think payload") del profesor Qwen3-30B-A3B-Thinking-2507, que es un modelo MoE de 30B con 3B activos. El estudiante aprende no solo la respuesta final en Python, sino también el proceso de razonamiento intermedio marcado con los tokens `<think>` y `</think>`, replicando un protocolo de "thinking mode" similar al del profesor.

## Capacidades

- Generación de código Python para problemas de programación competitiva con razonamiento explícito en modo "think" (habilitando `enable_thinking=True`).
- Soporte de texto y conversación mediante la plantilla de chat de Qwen3 (la plantilla incluye roles system, user y assistant).
- Ampliación de los pesos base con filas entrenables para los tokens especiales de pensamiento, lo que permite al modelo emitir secuencias de razonamiento antes del programa final.
- Capacidades de razonamiento multi-step heredadas del base Qwen3, potenciadas por el supervisor de trazas del modelo profesor.
- No se documenta soporte de tool calling, visión, audio ni otras modalidades.
- Idiomas soportados: no se especifican en la información disponible, aunque al partir de Qwen3-8B-Base es previsible que conserve el soporte multilingüe del base.

## Casos de uso

- Generación de soluciones para programación competitiva: el modelo puede recibir un enunciado de problema y emitir un programa Python completo. Es adecuado para prototipar respuestas en plataformas de entrenamiento tipo LeetCode o Codeforces, siempre que se valide con un sandbox.
- Asistente de razonamiento en entornos educativos: su modo think permite mostrar el proceso de razonamiento, lo que facilita la explicación de algoritmos a estudiantes. Se puede integrar en un tutor que presente la solución y su justificación paso a paso.
- Destilación de modelos de razonamiento: sirve como referencia para investigar cómo transferir habilidades de pensamiento desde un modelo grande (30B-A3B) a uno pequeño (8B) mediante LoRA. Los pesos fusionados y el adapter están disponibles para reproducir el experimento.
- Evaluación de técnicas de entrenamiento: al ser un checkpoint de investigación, es útil para comparar protocolos de thinking (contrato V4) frente a la base sin ajuste. Los resultados DEV256 permiten medir la diferencia en pass@1.
- Generación de pruebas unitarias y casos de prueba: el modelo puede generar programas de Python, por lo que es posible pedirle que construya casos de prueba o funciones auxiliares para verificar una especificación dada.
- Integración en pipelines de CI/CD para code review asistida: aunque no implementa tool calling, puede usarse como un paso generador de parches o de sugerencias de código en un flujo automatizado, precediendo a la validación por tests.

## Benchmarks y rendimiento

Se ha evaluado en un subconjunto DEV256 derivado de LiveCodeBench, con 256 problemas de programación. La evaluación usa semilla 3407, modo think sin prefill de `<think>`, generación máxima de ~32k tokens, temperatura 0.6, top-p 0.95 y top-k 20, con verificación en sandbox y métrica pass@1. Los resultados son de una sola semilla, no representan un ranking oficial.

| Modelo | pass@1 | Cap | Notas |
|---|---:|---:|---|
| CodeThink-V4-Qwen3-8B | 81/256 | 130 | Checkpoint V4; semilla 3407 |
| Qwen3-8B-Base | 55/256 | — | Número histórico en protocolo antiguo; no reevaluado bajo el mismo contrato V4 |
| Qwen3-4B-Base (familia) | 63/256 | — | Mencionado en la model card como referencia bajo el contrato V4 actual |

El campo "Cap" indica 130 generaciones que alcanzaron el límite de 32k sin cerrar `</think>`, un síntoma de pensamiento no concluido o truncado.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en bf16 ocupan aproximadamente 16,4 GB (8.190.735.360 parámetros × 2 bytes). A esto hay que sumar el cache KV del contexto de 32.768 tokens, lo que hace recomendable una GPU con al menos 24 GB de VRAM para generar hasta el máximo de 32k tokens.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB), A10G (24 GB), A100 40G o H100 80G.
- Despliegue: compatible con la librería transformers (Pipeline API), text-generation-inference y vLLM. No se documenta soporte explícito para llama.cpp u Ollama en la información proporcionada; al ser un modelo de 8B podría convertirse a GGUF manualmente.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Pass@1 (DEV256) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CodeThink-V4-Qwen3-8B | 8,19B | 32.768 | 81/256 | Apache-2.0 | HuggingFace |
| Qwen3-8B-Base | 8,19B | 32.768 | 55/256 (protocolo antiguo) | Apache-2.0 | HuggingFace |
| Qwen3-30B-A3B-Thinking-2507 | 30B totales / 3B activos | No disponible | No disponible | No disponible | HuggingFace (profesor) |

La comparativa muestra una mejora relativa frente a la base en el conjunto DEV256, aunque la diferencia debe interpretarse con cautela porque los números de la base corresponden a un contrato de evaluación anterior. El profesor de 30B-A3B es un modelo MoE mucho mayor que sirve como referencia de capacidad, pero no se dispone de resultados en el mismo protocolo.

## Limitaciones y advertencias

- Es un checkpoint de investigación, no un producto. El autor lo declara explícitamente y advierte que los números de DEV256 no son una afirmación de liderazgo.
- Evaluación de una sola semilla (seed 3407). No hay intervalo de confianza ni bandas de variabilidad, salvo la mención de un rango 55,2 ± 4,9 para el modelo base en un protocolo anterior.
- Alta proporción de generaciones capadas: 130 de 256 alcanzaron el límite de 32k sin cerrar `</think>`. Esto sugiere que el modelo tiende a generar secuencias de pensamiento muy largas o que no concluyen, lo que puede causar truncamientos y pérdida de la respuesta final.
- Resultados de la base comparados de forma inconsistente: el 55/256 de Qwen3-8B-Base es un número histórico bajo protocolo antiguo, no una reevaluación bajo el mismo contrato V4, por lo que la mejora observada no es directamente comparable.
- Riesgo de alucinación: como cualquier modelo generativo, puede producir programas que no compilan o que no cumplen la especificación. La verificación se debe realizar siempre con un sandbox o suite de tests.
- Sesgos y limitaciones del modelo base Qwen3-8B-Base: no se especifican en la información proporcionada, pero pueden estar presentes en el modelo final al heredar los pesos base.
- No se documentan capacidades de tool calling ni agentes, por lo que no es adecuado para escenarios que requieran llamadas a funciones o uso de herramientas externas.
- Los datos de entrenamiento y la composición del dataset no se detallan más allá del número de problemas y tokens. No hay información sobre filtrado, deduplicación o propiedades de sesgo de los datos.

## Enlaces

- Página del modelo en HuggingFace: https://huggingface.co/modrill/CodeThink-V4-Qwen3-8B
- Modelo base Qwen/Qwen3-8B-Base: https://huggingface.co/Qwen/Qwen3-8B-Base
