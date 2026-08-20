# agentic-ptb/kimi.h031.rl_v6.step_30

## Resumen

`agentic-ptb/kimi.h031.rl_v6.step_30` es un checkpoint intermedio de un barrido de entrenamiento con aprendizaje por refuerzo (RL) denominado AgentPTB, desarrollado por el usuario `agentic-ptb`. Se trata de un modelo de 9.409.813.744 parámetros (~9,4B) basado en `Qwen/Qwen3.5-9B-Base`, del que hereda su arquitectura y tokenizador. El nombre "kimi" hace referencia a la celda del barrido (plot cell), no al modelo Kimi de Moonshot AI, y el sufijo `h031` indica que fue guardado en la hora 31 de un run de 100 horas.

Este checkpoint pertenece a un experimento de RL con un driver orientado a código y razonamiento (`kimi-code / kimi-k3`) y un nivel de esfuerzo de razonamiento alto (`high`). Su relevancia es principalmente investigadora: sirve para trazar la evolución del rendimiento a lo largo del tiempo de entrenamiento, no como un modelo listo para producción. La model card advierte de un problema crítico: falta el token `eos` `248046` (`<|im_end|>`), por lo que el modelo no detiene correctamente las respuestas y puede desbordar la ventana de contexto.

No se dispone de información sobre licencia, idiomas soportados, ni benchmarks publicados. El repositorio contiene únicamente pesos en formato `safetensors` (18,8 GB en 4 shards).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (basada en Qwen/Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del base model, sin confirmar) |
| Tipos de cuantizacion | no disponible (solo safetensors en precision original) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (4 shards, 18,8 GB) |

## Arquitectura y entrenamiento

La arquitectura exacta no está documentada en la información disponible. Al estar basado en `Qwen/Qwen3.5-9B-Base`, se asume que es un transformer denso de ~9,4B parámetros, pero no se confirma si el fine-tuning con RL ha modificado la arquitectura interna. El entrenamiento corresponde a un barrido de RL (sweep) llamado AgentPTB, con un run de 100 horas. Este checkpoint concreto se guardó en la hora 31,36 del run `rl_v6`, en el paso 10 (`step_10`). El driver utilizado es `kimi-code / kimi-k3` con `reasoning effort` alto, lo que sugiere que el objetivo del RL es mejorar capacidades de generación de código y razonamiento multi-paso.

No se especifican los datos de entrenamiento, el número de tokens, ni el algoritmo de RL concreto (PPO, GRPO, etc.). Tampoco se detalla si hubo fases de SFT previas. La model card indica que el checkpoint es de tipo "intermediate" (intermedio), es decir, no es un modelo final sino un punto de control para análisis de curvas de rendimiento.

Un detalle técnico relevante es la ausencia del token `eos` `248046` (`<|im_end|>`), que el template de chat de Qwen3.5 utiliza para finalizar cada turno del asistente. Sin este token, el modelo no sabe cuándo detenerse y continúa generando hasta agotar la ventana de contexto. Esto invalida cualquier evaluación directa y obliga a re-empaquetar el modelo (añadiendo el token) antes de usarlo.

## Capacidades

No hay documentación oficial de capacidades para este checkpoint. Dado que es un fine-tuning de `Qwen3.5-9B-Base` con RL orientado a código y razonamiento, es razonable esperar que herede las capacidades del modelo base (generación de texto, razonamiento, código, matemáticas, multilingüismo), pero no hay confirmación empírica. Las siguientes capacidades son inferencias basadas en el contexto del barrido, no datos verificados:

- Generación de texto y razonamiento multi-paso (por el driver `kimi-code` y el `reasoning effort` alto).
- Generación de código, probablemente con soporte de lenguajes de programación comunes.
- Posible soporte de tool calling y function calling, si el modelo base lo incluye (no confirmado).
- Capacidades multilingües heredadas del base model (no confirmadas).
- Sin soporte de visión ni audio (el base model es de texto).

**Advertencia**: al faltar el token `eos`, el modelo no es utilizable directamente para tareas conversacionales o de generación con parada natural. Requiere re-empaquetado.

## Casos de uso

No hay casos de uso documentados por el autor. Dado que es un checkpoint intermedio de investigación, su aplicación principal es el análisis de la dinámica de entrenamiento. A continuación se listan usos potenciales, siempre bajo la premisa de que el modelo debe ser re-empaquetado primero y que no hay garantías de calidad:

- Investigación en RL para LLM: estudiar cómo evoluciona el rendimiento en código y razonamiento a lo largo de las horas de entrenamiento, comparando este checkpoint con otros del mismo sweep (p. ej., `h010`, `h050`, `h100`).
- Análisis de curvas de aprendizaje: usar el checkpoint como punto de datos para trazar métricas de rendimiento frente al tiempo de entrenamiento.
- Reproducción de experimentos: verificar si los resultados del sweep AgentPTB son reproducibles con la misma configuración.
- Fine-tuning adicional: partir de este checkpoint para continuar entrenamiento con otros datasets o algoritmos de RL, aunque su estado intermedio y el problema de `eos` lo hacen menos atractivo que el modelo base.
- Evaluación de robustez: probar el comportamiento del modelo ante prompts adversariales o de código complejo, comparándolo con el base model para medir el efecto del RL.
- Desarrollo de técnicas de re-empaquetado: usar el checkpoint como caso de prueba para corregir la ausencia de token `eos` y validar pipelines de post-procesado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card advierte explícitamente de que, debido al token `eos` faltante, cualquier evaluación numérica sería un "suelo" (floor) y no una medición real. Por tanto, no se incluyen cifras de MMLU, HumanEval, GSM8K ni otros.

## Requisitos de hardware

Los requisitos se estiman a partir del tamaño de parámetros (9,4B) y del peso en safetensors (18,8 GB, que corresponde a precisión fp16/bf16). No hay datos oficiales de latencia ni throughput.

- VRAM estimada para inferencia:
  - Precisión fp16/bf16: ~18,8 GB de pesos + overhead de activaciones y KV cache, por lo que se recomiendan al menos 24 GB de VRAM.
  - Cuantización 8 bits: ~9,4 GB de pesos, viable en GPUs con 12-16 GB.
  - Cuantización 4 bits: ~4,7 GB de pesos, viable en GPUs con 8 GB o más.
- GPUs recomendadas:
  - Para fp16: RTX 4090 (24 GB), A100 40/80 GB, H100.
  - Para 8 bits: RTX 3090 (24 GB), RTX 4080 (16 GB), A10G.
  - Para 4 bits: RTX 3060 (12 GB), RTX 4060 Ti (16 GB), o incluso GPUs de 8 GB con limitaciones.
- Opciones de despliegue: al ser un modelo de la familia Qwen, es compatible con vLLM, llama.cpp, Ollama y TGI, siempre que se re-empaquete con el token `eos` correcto. No se ha verificado su funcionamiento en estos entornos.
- Latencia y throughput: no disponibles. Para un modelo de 9,4B en fp16 en una A100, se puede esperar un throughput del orden de 20-40 tokens/s, pero es una estimación genérica sin validación.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar. A nivel estructural, se puede comparar con el modelo base y con otros fine-tunes de tamaño similar, pero sin métricas la comparación es limitada.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| `agentic-ptb/kimi.h031.rl_v6.step_30` | 9,4B | no disponible | no disponible | safetensors | Checkpoint intermedio de RL, sin token eos |
| `Qwen/Qwen3.5-9B-Base` | 9,4B | no disponible (típicamente 32K o más) | Apache 2.0 (asumido, sin confirmar) | safetensors | Modelo base, estable y documentado |
| `Meta-Llama-3.1-8B` | 8B | 128K | Llama 3.1 Community License | safetensors, GGUF | Alternativa comercial con ecosistema amplio |

La comparación con Kimi K3 (2,8T parámetros) no procede: se trata de un modelo completamente distinto de Moonshot AI, sin relación con este checkpoint.

## Limitaciones y advertencias

- **Token eos faltante**: el checkpoint no incluye el token `248046` (`<|im_end|>`), por lo que no detiene la generación al final de un turno y desborda la ventana de contexto. Cualquier uso requiere re-empaquetado.
- **Checkpoint intermedio**: no es un modelo final; su calidad puede ser inconsistente y no representa el mejor punto del entrenamiento.
- **Licencia no disponible**: no se puede determinar si es permitido el uso comercial, la modificación o la redistribución. Se recomienda contactar al autor antes de cualquier uso.
- **Sin benchmarks**: no hay métricas publicadas, por lo que no se puede evaluar su rendimiento real.
- **Sesgos y alucinaciones**: al ser un fine-tuning de Qwen3.5-9B-Base, puede heredar sesgos del modelo base y del dataset de RL, pero no hay información al respecto.
- **Idiomas**: no se especifican los idiomas soportados; se asume que hereda los del base model, pero sin confirmación.
- **Riesgo de overfitting al RL**: al ser un checkpoint de un run de RL, podría estar especializado en exceso en las tareas del driver (`kimi-code`), degradando su generalidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/agentic-ptb/kimi.h031.rl_v6.step_30
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Índice del sweep AgentPTB (mencionado en la model card, sin URL directa): `agentic-ptb/INDEX` (no localizado en la búsqueda web)

No se han encontrado papers, blogs o demos asociados a este checkpoint específico.
