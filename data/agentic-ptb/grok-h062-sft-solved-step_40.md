# agentic-ptb/grok.h062.sft-solved.step_40

## Resumen

El modelo `agentic-ptb/grok.h062.sft-solved.step_40` es un checkpoint intermedio de un barrido (sweep) de entrenamiento denominado AgentPTB. Se trata de un fine-tuning supervisado (SFT) sobre el modelo base `Qwen/Qwen3.5-9B-Base`, con un total de 9.409.813.744 parámetros (aproximadamente 9,4B). El repositorio forma parte de una serie de checkpoints generados durante una ejecución de 100 horas, donde este punto concreto corresponde a la hora 67,17 del run.

La relevancia de este modelo es principalmente experimental: sirve para trazar la curva de rendimiento a lo largo del tiempo de entrenamiento dentro del barrido. Sin embargo, presenta un defecto crítico de empaquetado: le falta el token EOS `248046` (`<|im_end|>`), lo que provoca que el modelo no detenga la generación al final de cada turno y desborde la ventana de contexto. Este defecto invalida cualquier uso práctico en producción y obliga a tratar sus métricas de evaluación como un límite inferior (floor), no como una medida real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, no especificada) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizacion indicada) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base `Qwen/Qwen3.5-9B-Base`, un transformer denso de aproximadamente 9,4B parámetros. El entrenamiento se enmarca en un barrido AgentPTB, donde la celda de entrenamiento se denomina `grok`, el driver es `pi / grok-4.6` y el esfuerzo de razonamiento configurado es `xhigh`. El checkpoint se guardó en la ruta `outputs/sft-solved2/weights/step_40` dentro de la ejecución, con 4 shards y un tamaño total de 18,8 GB.

No se especifican los datos de entrenamiento ni el número de tokens utilizados. La innovación técnica principal no reside en la arquitectura, sino en el propio diseño del barrido experimental. No obstante, el defecto de empaquetado del token EOS es una característica técnica destacable: el token `248046` (`<|im_end|>`) está ausente, lo que impide que el modelo finalice correctamente los turnos de conversación según la plantilla de chat de Qwen3.5.

## Capacidades

- Generación de texto: hereda las capacidades del modelo base Qwen3.5-9B-Base, pero se ven gravemente comprometidas por el defecto de EOS.
- Razonamiento: el driver `pi / grok-4.6` con esfuerzo `xhigh` sugiere un entrenamiento orientado a razonamiento complejo, aunque no se puede verificar su funcionamiento real debido al defecto.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte para agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Investigación de barridos de hiperparámetros: el modelo es útil para trazar la evolución del rendimiento a lo largo de las horas de entrenamiento, comparándolo con otros checkpoints de la misma celda.
- Análisis de curvas de aprendizaje: permite estudiar cómo evoluciona la pérdida o la precisión en función del tiempo de entrenamiento dentro del run de 100 horas.
- Comparación de checkpoints intermedios: los repositorios se ordenan cronológicamente por la hora `hHHH`, lo que facilita la comparación directa entre puntos del mismo barrido.
- Estudio de defectos de empaquetado de tokens: sirve como caso de estudio para analizar el impacto de la ausencia del token EOS en la generación y en las métricas de evaluación.
- Reproducción de experimentos: los pesos están disponibles en safetensors, lo que permite reproducir el experimento o re-empaquetar el modelo para corregir el defecto de EOS antes de evaluarlo.
- No es apto para ningún caso de uso en producción, atención al cliente, generación de código o despliegue real, debido al defecto crítico de EOS y a la ausencia de licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La propia model card advierte que, debido al defecto de EOS, cualquier número de evaluación obtenido con este checkpoint debe considerarse un límite inferior (floor) y solo puede compararse con otros checkpoints que compartan el mismo estado de EOS. No se debe utilizar para medir el rendimiento real del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 18,8 GB en safetensors. En precisión BF16/FP16, se necesitan aproximadamente 19-20 GB de VRAM para cargar los pesos.
- GPU recomendadas: una RTX 4090 (24 GB) o una A100 de 40 GB serían suficientes para cargar el modelo en memoria. También podría caber en una RTX 3090 (24 GB).
- Si cabe en GPU de consumo: sí, en tarjetas con 24 GB de VRAM o más.
- Opciones de despliegue: al ser safetensors, se podría cargar con `transformers`, `vLLM` o `llama.cpp` (si se convierte a GGUF), pero el defecto de EOS hace que la generación no se detenga, por lo que cualquier despliegue sería inútil sin un re-empaquetado previo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| `agentic-ptb/grok.h062.sft-solved.step_40` | 9,4B | no disponible | no disponible | Checkpoint intermedio con defecto EOS |
| `Qwen/Qwen3.5-9B-Base` | 9,4B | no disponible (especificado por Qwen) | no disponible | Modelo base, sin defecto EOS |

La comparativa directa con otros modelos de la misma categoría no es posible con los datos disponibles, ya que se trata de un artefacto de investigación intermedio. La única referencia fiable es su modelo base, `Qwen/Qwen3.5-9B-Base`, del cual hereda la arquitectura y los pesos iniciales, pero del que se diferencia por el fine-tuning y por el defecto de empaquetado de EOS.

## Limitaciones y advertencias

- Defecto crítico de EOS: falta el token `248046` (`<|im_end|>`), lo que provoca que el modelo no detenga la generación al final de cada turno y desborde la ventana de contexto.
- Métricas de evaluación no fiables: cualquier resultado de evaluación debe considerarse un límite inferior, no una medida real del rendimiento.
- Licencia no disponible: no se puede determinar si el modelo es utilizable comercialmente o si tiene restricciones.
- Idiomas no disponibles: se desconoce qué idiomas soporta de forma fiable.
- Artefacto de investigación: es un checkpoint intermedio de un barrido experimental, no un modelo final pulido para producción.
- Riesgo de alucinación: no se puede evaluar debido al defecto de EOS, pero es previsible que sea alto al no poder finalizar correctamente las respuestas.
- No apto para producción: cualquier integración en sistemas reales requeriría un re-empaquetado para corregir el token EOS y una evaluación exhaustiva posterior.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/agentic-ptb/grok.h062.sft-solved.step_40
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- No se han encontrado papers, blogs o demos asociados a este checkpoint específico.
