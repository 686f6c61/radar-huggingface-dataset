# just1nseo/llama31-tulu3-8b-dpo-if-rlvr-constraint-only-kl0p05

## Resumen

`just1nseo/llama31-tulu3-8b-dpo-if-rlvr-constraint-only-kl0p05` es un ajuste fino del modelo `allenai/Llama-3.1-Tulu-3-8B-DPO` orientado a la mejora del seguimiento de instrucciones estrictas (instruction following). El autor, `just1nseo`, ha empleado GRPO (Group Relative Policy Optimization) con recompensas verificables (RLVR, Reinforcement Learning with Verifiable Rewards) mediante la librería verl, partiendo de un modelo ya alineado con DPO. El resultado es un checkpoint experimental de 8B parámetros con licencia no declarada y sin métricas publicadas.

El interés de este modelo reside en su metodología: aplica refuerzo sobre restricciones verificables (constraint-only) con un coeficiente KL de 0,05 y un batch de 1024, lo que sugiere un entrenamiento centrado en el cumplimiento literal de restricciones en las respuestas (formato, longitud, presencia o ausencia de elementos concretos) más que en preferencias subjetivas. Es relevante para quienes investigan alineamiento post-DPO y RLVR aplicado a modelos pequeños de la familia Llama 3.1.

El repositorio contiene múltiples carpetas `global_step_<N>/`, cada una con un modelo completo en bfloat16 exportado por verl durante el entrenamiento. No se han publicado resultados de evaluación, idiomas soportados ni términos de licencia, por lo que su uso en producción requiere validación propia y cautela legal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Llama 3.1, base Tulu 3 8B DPO) |
| Parametros totales | 8B (heredados del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Llama 3.1 soporta 128k tokens; no confirmado para este checkpoint) |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (carpetas `global_step_<N>/` en bfloat16) |

## Arquitectura y entrenamiento

El modelo parte de `allenai/Llama-3.1-Tulu-3-8B-DPO`, un transformer decoder-only de 8B parámetros de la familia Llama 3.1, previamente ajustado por AI2 con SFT y DPO dentro de la familia Tulu 3. Sobre esa base, el autor aplica GRPO mediante verl, una implementación de RL para modelos de lenguaje que permite definir funciones de recompensa programáticas. La variante `constraint_only` indica que la señal de recompensa se centra en restricciones verificables del seguimiento de instrucciones, y el sufijo `kl0p05` refleja un coeficiente de penalización KL de 0,05 frente al modelo de referencia. El run name incluye `nonthink`, lo que sugiere que no se empleó un modo de razonamiento extendido durante el entrenamiento.

El nombre del repositorio indica un batch de 1024 (`b1024`) y una configuración `c1`. El repositorio contiene checkpoints completos por paso (`global_step_91` aparece como ejemplo en la model card), exportados a medida que el entrenador los genera. No se detalla la composición del dataset de entrenamiento, el número de tokens, ni si hubo etapas adicionales de SFT o DPO tras el RLVR.

## Capacidades

- Generación de texto en inglés (idioma del modelo base; no confirmado para otros idiomas).
- Seguimiento de instrucciones con restricciones verificables: formato, estructura, presencia o ausencia de elementos concretos en la respuesta.
- Razonamiento y respuesta a preguntas heredados de Tulu 3 8B.
- Generación de código y matemáticas a nivel del modelo base (no evaluado en este checkpoint).
- Soporte de tool calling y function calling heredado de Llama 3.1 (no validado tras el ajuste RLVR).
- Capacidades multilingües del modelo base Llama 3.1 (no confirmadas ni evaluadas para este checkpoint).
- No dispone de modo thinking explícito según el nombre del run (`nonthink`).
- Sin capacidades de visión ni audio.

## Casos de uso

- Validación de formatos estrictos en pipelines: el modelo puede emplearse para generar respuestas que cumplan plantillas o esquemas fijos (JSON, listas numeradas, campos obligatorios), aprovechando el entrenamiento con recompensas de restricciones verificables.
- Extracción de información estructurada: útil para tareas donde la salida debe ajustarse a un formato predefinido y el incumplimiento invalida el resultado, como resúmenes con campos fijos o clasificaciones con etiquetas cerradas.
- Investigación en RLVR: sirve como checkpoint de referencia para estudiar el efecto del GRPO con restricciones sobre un modelo ya alineado con DPO, comparándolo con las variantes `anchor-only` del mismo autor.
- Generación de respuestas con longitud controlada: adecuado para escenarios donde se exigen límites de palabras o caracteres, como descripciones de producto o respuestas de soporte con formato regulado.
- Automatización de tareas de instrucción múltiple: para prompts que combinan varias restricciones simultáneas (idioma, tono, formato, contenido prohibido), donde el modelo ha sido optimizado específicamente para cumplirlas.
- Base para ajustes posteriores: al ser un checkpoint intermedio de RL, puede servir como punto de partida para experimentos de alineamiento adicionales o para destilar comportamientos de seguimiento de instrucciones en modelos menores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en bfloat16: aproximadamente 16 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, 20-24 GB para inferencia cómoda.
- VRAM estimada en cuantización de 8 bits: en torno a 8-9 GB para pesos.
- VRAM estimada en cuantización de 4 bits: en torno a 5-6 GB para pesos (requiere conversión propia, ya que el repo solo publica bfloat16).
- GPU recomendadas: A100 40/80 GB, H100 para entrenamiento o serving de alto throughput; RTX 4090 (24 GB) para inferencia en bf16; RTX 3090 (24 GB) también viable.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090 y, con cuantización 4 bits, en GPUs de 8 GB como RTX 3070 o RTX 4060.
- Opciones de despliegue: transformers (soporte nativo según la model card), vLLM y TGI para serving de producción, llama.cpp u Ollama tras conversión a GGUF.
- Latencia y throughput: no disponibles; dependen del hardware y del backend.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| just1nseo/llama31-tulu3-8b-dpo-if-rlvr-constraint-only-kl0p05 | 8B | no disponible | GRPO + RLVR sobre Tulu 3 8B DPO | no disponible | Hugging Face (repo experimental) |
| allenai/Llama-3.1-Tulu-3-8B-DPO | 8B | 128k (Llama 3.1) | SFT + DPO | Tulu 3 (términos de AI2) | Hugging Face, ampliamente usado |
| just1nseo/llama31-tulu3-8b-dpo-if-rlvr-anchor-only | 8B | no disponible | GRPO + RLVR (variante anchor) | no disponible | Hugging Face (repo experimental) |
| meta-llama/Llama-3.1-8B-Instruct | 8B | 128k | SFT + RLHF | Llama 3.1 Community License | Hugging Face, muy extendido |

## Limitaciones y advertencias

- No se han publicado evaluaciones: no hay datos de MMLU, HumanEval, GSM8K ni métricas de seguimiento de instrucciones para este checkpoint.
- Licencia no declarada: el uso comercial es incierto y depende de los términos del modelo base Tulu 3 y de Llama 3.1; conviene verificar antes de desplegar.
- Riesgo de alucinación inherente al modelo base, potencialmente alterado por el entrenamiento con RL; no hay evaluación específica.
- El ajuste con recompensas de restricciones puede degradar otras capacidades (regresión de alineamiento) si el coeficiente KL no es suficiente; no hay datos que lo confirmen o descarten.
- Idiomas soportados no declarados; se asume inglés por herencia del modelo base, pero no está verificado.
- Contexto efectivo no confirmado para este checkpoint, aunque el modelo base soporte 128k tokens.
- Checkpoints intermedios de entrenamiento: cada carpeta `global_step_<N>/` es un modelo distinto; el comportamiento varía entre pasos y no hay guía sobre cuál es el recomendado.
- Repositorio de 32,1 GB con múltiples checkpoints completos, lo que complica la descarga selectiva y el almacenamiento.
- Sin descargas ni likes en el momento de la consulta: no hay evidencia de uso comunitario ni validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/just1nseo/llama31-tulu3-8b-dpo-if-rlvr-constraint-only-kl0p05
- Variante relacionada (sin sufijo KL): https://huggingface.co/just1nseo/llama31-tulu3-8b-dpo-if-rlvr-constraint-only
- Variante anchor-only: https://huggingface.co/just1nseo/llama31-tulu3-8b-dpo-if-rlvr-anchor-only
- Modelo base: https://huggingface.co/allenai/Llama-3.1-Tulu-3-8B-DPO
- Librería verl (framework de RL usado): https://github.com/volcengine/verl
