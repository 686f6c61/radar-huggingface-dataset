# NeelRajani/Qwen3-0.6B-Base_SFT-safety100_D2D-v00.01

## Resumen

Este modelo es un adaptador LoRA de rango 32 desarrollado por NeelRajani sobre la base congelada `Qwen/Qwen3-0.6B-Base`. Forma parte de un estudio experimental denominado "shallowness" (superficialidad), cuyo objetivo es determinar hasta qué profundidad llega realmente el entrenamiento de seguridad en modelos de lenguaje. El adaptador reproduce la distribución de salida de un profesor de seguridad SFT entrenado al 100% de los datos de seguridad, mediante destilación off-policy con divergencia KL directa (GKD).

El modelo se publica como parte de una serie de adaptadores que exploran cómo se comporta la seguridad cuando se destila desde un profesor en diferentes etapas de entrenamiento. Al ser un adaptador PEFT, no es un modelo autónomo: requiere cargar la base Qwen3-0.6B-Base y aplicar el adaptador con la librería `peft`. Su relevancia es principalmente investigadora, para estudiar la transferibilidad de la seguridad a través de la destilación, más que para uso productivo directo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base: Qwen3-0.6B-Base) con adaptador LoRA |
| Parametros totales | no disponible (adaptador LoRA r=32 sobre base de 0.6B) |
| Parametros activos | no disponible (adaptador LoRA, no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3-0.6B-Base, no especificada) |
| Tipos de cuantizacion | no disponible (adaptador en safetensors, base sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 32 con alpha 16 y escalado rsLoRA, aplicado a todas las capas lineales de la base congelada `Qwen/Qwen3-0.6B-Base`. El entrenamiento utiliza destilación off-policy con divergencia KL directa (GKD, Generalized Knowledge Distillation) con parámetros `lmbda=0` y `beta=0`, y la divergencia se calcula en fp32. El objetivo es que el adaptador reproduzca la distribución de salida de un profesor de seguridad SFT guardado al 100% de los datos de seguridad (`NeelRajani/Qwen3-0.6B-Base_SFT_safety_v00.01`, revisión `v00.01-step-000000705`).

Los datos de entrenamiento provienen del dataset `Neelectric/Nemotron-SFT-Safety-v1-nocot`, con 400 pasos de optimización a un batch efectivo de 8. El dropout es 0. La receta de entrenamiento se especifica en `recipes/Qwen/Qwen-0.6B-Base/d2d_stage/config_v00.01.yaml`. No se indica el uso de RLHF ni DPO; el método es puramente destilación supervisada off-policy.

## Capacidades

- Destilación de comportamiento de seguridad: el adaptador reproduce la distribución de salida de un profesor de seguridad SFT, por lo que hereda las respuestas seguras del profesor en los dominios cubiertos por los datos de entrenamiento.
- Generación de texto conversacional: al estar basado en Qwen3-0.6B-Base, conserva las capacidades básicas de generación de texto del modelo base, aunque el adaptador solo modifica el comportamiento en aspectos de seguridad.
- Investigación sobre alineación: permite estudiar cómo se transfiere la seguridad mediante destilación y si esta es "superficial" (dependiente de la superficie del texto) o profunda (afecta a la representación interna).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio. El adaptador no añade capacidades nuevas; solo modifica la distribución de salida del modelo base.

## Casos de uso

- Investigación en alineación de modelos: el adaptador sirve para analizar si la seguridad aprendida por un profesor SFT se puede destilar eficazmente en un modelo base congelado, y si dicha seguridad es robusta ante variaciones superficiales.
- Estudio de la "superficialidad" de la seguridad: permite comparar adaptadores destilados desde profesores en diferentes etapas de entrenamiento (por ejemplo, 100% vs. etapas intermedias) para medir cuándo emerge la seguridad.
- Evaluación de transferencia de conocimiento: útil para probar si la destilación off-policy con GKD preserva las propiedades de seguridad del profesor en el alumno.
- Benchmark de destilación: puede usarse como caso de referencia para comparar métodos de destilación (GKD, KL on-policy, etc.) en tareas de seguridad.
- Desarrollo de adaptadores ligeros: demuestra que es posible inyectar comportamiento de seguridad mediante un adaptador LoRA de bajo rango sin modificar la base, lo que podría aplicarse a otros dominios.
- Reproducción de experimentos: al estar publicada la receta de entrenamiento, permite reproducir el estudio y verificar los resultados de forma independiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. Tampoco se proporcionan métricas de seguridad específicas (como tasas de rechazo ante prompts maliciosos) ni comparaciones con otros adaptadores.

## Requisitos de hardware

- El adaptador LoRA tiene un tamaño de repositorio de 0.1 GB, por lo que su carga en memoria es mínima.
- La inferencia requiere cargar la base `Qwen/Qwen3-0.6B-Base` (aproximadamente 1.2 GB en fp16, menos en cuantización) más el adaptador.
- Es viable en GPUs de consumo como RTX 3060, RTX 4060 o superiores con 8 GB de VRAM, incluso en CPU con suficiente RAM.
- Para despliegue, se puede usar el stack de Hugging Face `transformers` + `peft` con carga dinámica del adaptador. No se documenta compatibilidad con vLLM, llama.cpp u Ollama, aunque al ser un adaptador PEFT estándar podría integrarse con herramientas que soporten LoRA (por ejemplo, vLLM con soporte de adaptadores).
- La latencia y el throughput dependen de la base y del hardware; no se proporcionan estimaciones específicas.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en el mismo estudio. El propio autor publica otros adaptadores de la misma serie (por ejemplo, `NeelRajani/Qwen3-0.6B-Base_SFT-safety100_ADV-pku-v00.01`), pero no se proporcionan datos de rendimiento comparativo. La comparativa natural sería contra el profesor original `NeelRajani/Qwen3-0.6B-Base_SFT_safety_v00.01`, pero no hay métricas publicadas.

## Limitaciones y advertencias

- Es un adaptador experimental, no un modelo de producción. No se garantiza su robustez ni su comportamiento en escenarios reales.
- La licencia no está disponible, por lo que no se puede confirmar si es permitido su uso comercial o la redistribución.
- No se documentan sesgos conocidos, pero al estar entrenado sobre un dataset de seguridad específico (`Nemotron-SFT-Safety-v1-nocot`), puede presentar sesgos propios de ese dataset.
- Riesgo de alucinación: al ser un adaptador sobre una base pequeña (0.6B), la calidad de generación es limitada y puede producir respuestas incoherentes o incorrectas fuera de los dominios de seguridad.
- La destilación off-policy puede no capturar completamente el comportamiento del profesor, especialmente en casos límite o entradas fuera de la distribución de entrenamiento.
- No se proporcionan instrucciones de uso en producción, ni garantías de que el adaptador funcione correctamente con versiones futuras de la base o de las librerías.
- El adaptador solo modifica la distribución de salida; no añade capacidades de razonamiento, código o herramientas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NeelRajani/Qwen3-0.6B-Base_SFT-safety100_D2D-v00.01
- Profesor SFT (origen de la destilación): https://huggingface.co/NeelRajani/Qwen3-0.6B-Base_SFT_safety_v00.01
- Adaptador relacionado (variante ADV-pku): https://huggingface.co/NeelRajani/Qwen3-0.6B-Base_SFT-safety100_ADV-pku-v00.01
- Base del modelo: https://huggingface.co/Qwen/Qwen3-0.6B-Base
- Dataset de entrenamiento: https://huggingface.co/datasets/Neelectric/Nemotron-SFT-Safety-v1-nocot
