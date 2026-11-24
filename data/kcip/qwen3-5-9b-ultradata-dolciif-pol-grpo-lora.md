# KCIP/qwen3.5-9b-ultradata-dolciif-pol-grpo-lora

## Resumen

El repositorio `KCIP/qwen3.5-9b-ultradata-dolciif-pol-grpo-lora` contiene un conjunto de adaptadores LoRA resultantes de una ejecución corta de GRPO (Group Relative Policy Optimization) sobre el modelo base `Qwen/Qwen3.5-9B`. No se trata de un modelo completo, sino de un artefacto de investigación que documenta la evolución del entrenamiento por refuerzo a lo largo de 160 pasos, con checkpoints guardados cada 20 pasos (`step_000` a `step_160`). El autor lo describe explícitamente como un "pilot run" de investigación, no como un modelo afinado para uso en producción.

El problema que aborda es el estudio de cómo el aprendizaje por refuerzo con recompensas verificables modifica las capacidades y el comportamiento del modelo a lo largo del entrenamiento. Para ello combina datos de matemáticas, código, conocimiento y contexto largo (85% de `openbmb/UltraData-RL-2609`) con datos de seguimiento de instrucciones (15% de `allenai/Dolci-Instruct-RL`), usando verificadores automáticos como recompensa.

La relevancia es metodológica: sirve como material de referencia para investigadores interesados en dinámicas de RL, en el uso de LoRA para RL a bajo coste y en la reproducibilidad de runs cortos con GRPO mediante `prime-rl`. Al ser un adaptador PEFT sobre Qwen3.5-9B, hereda la arquitectura, el contexto y las capacidades del modelo base, pero no aporta mejoras verificadas ni evaluaciones publicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer Qwen3.5-9B (arquitectura del base: no disponible en detalle) |
| Parametros totales | No disponible (adaptador LoRA de rango 16; el base es de 9B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible de forma explícita; el entrenamiento usa hasta 16.384 tokens de completion |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantización depende del base y del runtime) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`adapter_model.safetensors`) + `adapter_config.json` por cada `step_NNN` |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 16 y alpha 32 aplicado sobre las proyecciones q/k/v/o y gate/up/down del modelo base Qwen3.5-9B. El entrenamiento se realizó con GRPO mediante la librería `prime-rl`, con 16 prompts por paso y 8 muestras por prompt, temperatura 1.0, hasta 16.384 tokens de completion y modo de razonamiento (thinking) desactivado. Se descartaron los grupos sin dispersión de recompensa (todos los samples con la misma puntuación), y se usó una tasa de aprendizaje constante de 1e-5 durante 160 pasos.

La composición de datos combina un 85% de prompts muestreados de `openbmb/UltraData-RL-2609` (matemáticas, código, conocimiento y contexto largo) con un 15% de filas de seguimiento de instrucciones de `allenai/Dolci-Instruct-RL`, restringidas al verificador `ifeval`. Las recompensas son verificables y automáticas: `math-verify` para matemáticas, tests de stdin/stdout en Python para código, un juez de equivalencia LLM para conocimiento y contexto largo, y un verificador estilo IFEval de `open-instruct` para seguimiento de instrucciones. No se aplicó entrenamiento de seguridad adicional más allá del que ya incorpora el modelo base.

## Capacidades

- Generación de texto y razonamiento heredados del modelo base Qwen3.5-9B (no evaluadas en este artefacto).
- Razonamiento matemático reforzado durante el entrenamiento mediante recompensas de `math-verify`.
- Generación de código Python reforzada mediante tests de stdin/stdout.
- Seguimiento de instrucciones reforzado con verificador estilo IFEval.
- Manejo de contexto largo reforzado mediante el juez de equivalencia LLM sobre datos de contexto largo.
- Modo de razonamiento (thinking) del base, aunque el entrenamiento se realizó con thinking desactivado; para replicar el comportamiento de entrenamiento debe usarse `enable_thinking: false`.
- Soporte de tool calling, function calling y comportamiento agéntico: no disponible (no documentado en la información proporcionada).
- Capacidades multilingües: no disponible (idiomas no documentados).
- Capacidades de visión o audio: no disponible.

## Casos de uso

- Investigación sobre dinámicas de RL: comparar los checkpoints `step_000` a `step_160` permite estudiar cómo evolucionan las capacidades y el comportamiento del modelo paso a paso, con un checkpoint inicial equivalente al base.
- Reproducción de experimentos de GRPO: el run documenta hiperparámetros concretos (16 prompts × 8 samples, temperatura 1.0, lr 1e-5, LoRA r=16) que sirven como línea base reproducible con `prime-rl`.
- Estudio de aprendizaje por refuerzo con recompensas verificables: útil para analizar el efecto de verificadores automáticos (math-verify, tests de código, juez LLM, IFEval) sobre el comportamiento del modelo.
- Evaluación de LoRA para RL de bajo coste: al ser un adaptador de pequeño tamaño (repo de 0,1 GB), permite experimentar con RL sobre un base de 9B sin reentrenar el modelo completo.
- Análisis de seguimiento de instrucciones bajo RL: el 15% de datos de IFEval permite estudiar si el RL degrada o mejora la adherencia a instrucciones en un modelo ya alineado.
- Despliegue experimental con vLLM: el adaptador puede servirse junto al base con `--enable-lora --max-lora-rank 16`, útil para prototipos de investigación que comparen checkpoints intermedios.
- Estudio de olvido catastrófico y deriva de comportamiento: la secuencia de checkpoints cada 20 pasos facilita medir si el RL corto introduce regresiones en conocimiento general o en idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que las evaluaciones están en curso ("Evaluations are in progress").

## Requisitos de hardware

- VRAM estimada para inferencia: depende del modelo base Qwen3.5-9B y de la cuantización elegida; no disponible para el adaptador en sí (el adaptador LoRA añade una sobrecarga mínima).
- GPU recomendadas: no disponible de forma específica; para un base de 9B en precisión completa se requieren GPUs de clase A100/H100, y en cuantización de 4-8 bits puede caber en GPUs consumer de gama alta (RTX 4090, 3090), aunque este dato no está confirmado en la información proporcionada.
- Cabe en GPU consumer: no confirmado; depende de la cuantización del base.
- Opciones de despliegue: vLLM con soporte LoRA (`--enable-lora --max-lora-rank 16 --lora-modules`) y PEFT (`subfolder="step_160"`). Otras opciones como llama.cpp, Ollama o TGI no están documentadas para este adaptador.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| KCIP/qwen3.5-9b-ultradata-dolciif-pol-grpo-lora | Adaptador LoRA sobre base 9B | No disponible | Sin benchmarks publicados | Apache-2.0 | Hugging Face (0 descargas) |
| Qwen/Qwen3.5-9B (base) | 9B | No disponible en la información | No disponible en la información | Apache-2.0 | Hugging Face |
| Alternativas comparables de la misma categoría | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de información suficiente para establecer una comparativa rigurosa con otros adaptadores LoRA de GRPO o con modelos afinados equivalentes.

## Limitaciones y advertencias

- Artefacto de investigación: el autor lo describe como un "research artifact" y no como un modelo afinado para uso; no debe desplegarse en producción.
- Sin entrenamiento de seguridad adicional: no se añadió alineación de seguridad más allá de la del modelo base.
- Evaluaciones pendientes: no hay benchmarks publicados, por lo que no se puede verificar ninguna mejora sobre el base.
- Riesgo de alucinación: inherente al modelo base; el RL corto no garantiza reducirlo y podría alterar el comportamiento de forma no medida.
- Sesgos conocidos: no documentados en la información proporcionada; se heredan los del base Qwen3.5-9B.
- Limitaciones de contexto e idioma: no documentadas; el entrenamiento usó hasta 16.384 tokens de completion, pero la ventana efectiva del base no se especifica.
- Restricciones de licencia: el adaptador es Apache-2.0, pero los datos de `allenai/Dolci-Instruct-RL` son ODC-BY y están sujetos a las guías de uso responsable de Ai2; conviene revisarlas antes de un uso comercial.
- Run corto: 160 pasos con descarte de grupos sin dispersión de recompensa; los resultados pueden ser inestables y no representativos de un entrenamiento completo.
- Thinking desactivado durante el entrenamiento: usar el modelo con thinking activado puede producir un comportamiento distinto al entrenado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/KCIP/qwen3.5-9b-ultradata-dolciif-pol-grpo-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Dataset UltraData-RL-2609: https://huggingface.co/datasets/openbmb/UltraData-RL-2609
- Dataset Dolci-Instruct-RL: https://huggingface.co/datasets/allenai/Dolci-Instruct-RL
- Librería de entrenamiento prime-rl: https://github.com/PrimeIntellect-ai/prime-rl
