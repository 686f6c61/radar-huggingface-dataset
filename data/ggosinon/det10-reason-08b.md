# GGOSinon/det10-reason-08b

## Resumen

`GGOSinon/det10-reason-08b` es un adaptador LoRA de PEFT que convierte el modelo vision-lenguaje `Qwen/Qwen3.5-0.8B` en una política de manipulación robótica con razonamiento previo a la acción. Lo desarrolla el usuario GGOSinon y está pensado para el entorno de simulación RoboLab sobre Isaac Sim. El modelo resuelve el problema de generar comandos de efector final (desplazamiento en milímetros, orientación en cuaternión y estado de la pinza) a partir de dos imágenes de cámara (vista por encima del hombro y vista de muñeca), el estado del robot y una instrucción de tarea en lenguaje natural.

La particularidad del adaptador es que el objetivo de entrenamiento incluye una frase de intención ("reasoning") antes de la acción, de modo que el modelo razona brevemente qué va a hacer y después emite el comando en JSON. Se entrenó como gemelo emparejado de `GGOSinon/det10-direct-08b` sobre las mismas filas de datos, lo que permite aislar el efecto del razonamiento frente a la acción directa. La arquitectura subyacente es la del modelo base Qwen3.5-0.8B (transformer multimodal con torre visual), sobre el que se aplica un adaptador de bajo rango; el repositorio ocupa 0,1 GB y la licencia es Apache 2.0.

Es relevante ahora porque documenta de forma honesta un hallazgo técnico concreto: la brecha entre decodificación greedy (error de posición de 46,0 mm) y best-of-64 con muestreo (3,7 mm) indica que el fallo es de selección de modo, no de conocimiento ausente, lo que lo convierte en un caso de estudio útil para aplicar RL con recompensa basada en distancia de acción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (base Qwen3.5-0.8B) con adaptador LoRA (PEFT) |
| Parametros totales | 0,8B en el modelo base; el adaptador LoRA añade un número no disponible de parámetros |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos del adaptador en safetensors; el base admite las cuantizaciones habituales de Qwen3.5) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se monta sobre `Qwen/Qwen3.5-0.8B`, un modelo vision-lenguaje de 0,8B parámetros que procesa dos imágenes de 392x221 píxeles junto con texto. El adaptador LoRA se carga con `PeftModel.from_pretrained` y se sirve con vLLM usando `--enable-lora --max-lora-rank 32`. La entrada combina la instrucción de tarea, el estado del robot (`tcp_xyz`, `tcp_quat` en orden w,x,y,z y apertura de pinza `jaw_m`) y las dos imágenes; la salida esperada es un JSON con las claves `reasoning`, `d_mm`, `quat` y `jaw`. El prompt se ejecuta con `enable_thinking=False`.

El entrenamiento es clonación de comportamiento sobre el dataset `GGOSinon/robolab-det10`, con racionales procedentes de `GGOSinon/robolab-det10-reasoning`. Los datos provienen de 88 tareas de RoboLab con demostraciones scriptadas exitosas, sin datos de robot real, y la profundidad por tarea es desigual (32 tareas con 10 episodios, 6 con uno solo). No se especifica el número de tokens de entrenamiento ni si hubo RLHF o DPO. La innovación destacable es el diseño de acción relativa: `d_mm` es el desplazamiento en milímetros respecto a la pose actual, no un waypoint absoluto; una versión anterior con coordenadas absolutas hizo que el modelo aprendiera a repetir el estado de entrada y obtuviera exactamente la línea base de "quedarse quieto" pese a mostrar una loss saludable.

## Capacidades

- Generación de comandos de manipulación robótica: desplazamiento del efector final en milímetros relativos, orientación en cuaternión y estado de apertura/cierre de pinza.
- Razonamiento previo a la acción: emite una frase de intención en el campo `reasoning` antes del comando.
- Comprensión de instrucciones de tarea en lenguaje natural combinadas con estado proprioceptivo del robot.
- Procesamiento de visión multi-cámara: dos imágenes por paso (vista por encima del hombro y vista de muñeca) a 392x221.
- Salida estructurada en JSON con esquema fijo.
- No dispone de tool calling ni function calling genérico; su "herramienta" es el propio esquema de acción robótica.
- No se documentan capacidades de agente multi-paso ni multilingües más allá de lo que aporte el modelo base.
- Modo thinking desactivado explícitamente (`enable_thinking=False`); el razonamiento se produce en el campo `reasoning` del JSON, no en un bloque de pensamiento separado.

## Casos de uso

- Investigación en políticas visión-lenguaje-acción: sirve como punto de partida reproducible para estudiar el efecto del razonamiento explícito frente a la acción directa, gracias a su gemelo `det10-direct-08b` entrenado sobre filas idénticas.
- Entrenamiento por RL con recompensa de distancia de acción: la cobertura del espacio de acciones (best-of-64 a 3,7 mm) ofrece gradiente útil para refinar la selección de modo con decodificación greedy.
- Prototipado de manipulación en Isaac Sim / RoboLab: permite montar un pipeline completo de percepción y control en simulación antes de invertir en datos reales.
- Estudio de selección de modo en modelos generativos de acción: el contraste entre error greedy (46,0 mm) y best-of-64 (3,7 mm) es un banco de pruebas para técnicas de muestreo, verificación y reranking.
- Evaluación de formatos de acción relativa frente a absoluta: el caso documenta cómo el eco del estado de entrada puede enmascarar un fallo de aprendizaje, útil para diseñar esquemas de datos robustos.
- Docencia y divulgación sobre VLA de bajo coste: un adaptador de 0,1 GB sobre un base de 0,8B cabe en hardware modesto y permite experimentar con clonación de comportamiento y LoRA.

## Benchmarks y rendimiento

| Métrica | Este adaptador | Gemelo directo |
|---|---|---|
| Error de posición en held-out, greedy | 46,0 mm | 36,3 mm |
| Best-of-64 con muestreo (T=1.0) | 3,7 mm | 5,9 mm |
| Precisión de pinza (jaw) | 97,0% | 97,0% |
| Línea base de quedarse quieto | 61,9 mm | 61,9 mm |
| Éxito en bucle cerrado (4 tareas, 12 entornos/tarea, greedy) | 0/48 | no disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 0,8B en bfloat16 ocupa aproximadamente 1,6 GB de pesos; con caché KV y dos imágenes por prompt, un despliegue cabe holgadamente en 4-8 GB de VRAM. El adaptador LoRA añade una fracción mínima (repositorio de 0,1 GB).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 12 GB, RTX 4070, RTX 4090) es suficiente; para servir con vLLM se recomienda RTX 4090, L40S, A100 o H100 si se necesita throughput alto o múltiples entornos en paralelo.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPUs con 6 GB o más.
- Opciones de despliegue: vLLM con `--enable-lora --max-lora-rank 32 --lora-modules policy=GGOSinon/det10-reason-08b --limit-mm-per-prompt '{"image": 2}'`; también transformers con `AutoModelForImageTextToText` y `PeftModel`. No se documenta soporte para llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `GGOSinon/det10-reason-08b` | 0,8B (base) + LoRA | no disponible | VLA con razonamiento previo a la acción | Apache 2.0 | HuggingFace |
| `GGOSinon/det10-direct-08b` | 0,8B (base) + LoRA | no disponible | VLA de acción directa, mismas filas de datos | Apache 2.0 | HuggingFace |
| `Qwen/Qwen3.5-0.8B` | 0,8B | no disponible | Modelo vision-lenguaje base sin política entrenada | no disponible | HuggingFace |

No se dispone de datos de benchmarks comparativos con otras políticas VLA de la literatura en la información proporcionada.

## Limitaciones y advertencias

- Entrenado únicamente con demostraciones scriptadas exitosas de 88 tareas de RoboLab; no hay datos de robot real, por lo que la transferencia a hardware físico no está validada.
- Profundidad de datos desigual: 32 tareas tienen 10 episodios y 6 tienen solo uno, lo que puede sesgar el comportamiento hacia las tareas mejor representadas.
- Éxito en bucle cerrado de 0/48 en el subconjunto de 4 tareas con decodificación greedy: las políticas llegan a la vecindad correcta y cronometran el agarre, pero colocan la pinza a 36-46 mm del experto, cuando un agarre requiere unos pocos milímetros.
- El paso 0 de cada episodio de entrenamiento es casi estacionario (mediana de 0,36 mm), así que la política emite un primer comando submilimétrico; si el controlador rechaza comandos pequeños como no-ops, se entra en un estado absorbente. Hay que desactivar esa guarda o abarcar más de un chunk.
- El formato del prompt es rígido: dos imágenes de 392x221, orden concreto (hombro y luego muñeca) y `enable_thinking=False`. Un desajuste no lanza error, sino que el modelo devuelve prosa o un esquema distinto y parece una política rota.
- Riesgo de eco del estado de entrada si se cambia el esquema de acción a coordenadas absolutas, como ocurrió en una versión anterior de los datos.
- Riesgo de alucinación en el campo `reasoning`: la frase de intención puede no corresponder con el comando emitido.
- No se documentan sesgos demográficos, lingüísticos o culturales del modelo base; los idiomas soportados no están disponibles.
- Licencia Apache 2.0, que permite uso comercial, pero el modelo base Qwen3.5-0.8B tiene su propia licencia que conviene verificar antes de producción.

## Enlaces

- HuggingFace del adaptador: https://huggingface.co/GGOSinon/det10-reason-08b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Gemelo de acción directa: https://huggingface.co/GGOSinon/det10-direct-08b
- Dataset de demostraciones: https://huggingface.co/datasets/GGOSinon/robolab-det10
- Dataset de razonamientos: https://huggingface.co/datasets/GGOSinon/robolab-det10-reasoning
- Repositorio RoboLab: https://github.com/NVlabs/RoboLab
