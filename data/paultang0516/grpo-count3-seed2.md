# paultang0516/grpo-count3-seed2

## Resumen

`paultang0516/grpo-count3-seed2` es un conjunto de checkpoints de entrenamiento publicados por el usuario paultang0516, fruto de aplicar GRPO (Group Relative Policy Optimization) sin modificaciones sobre el modelo base Qwen/Qwen2.5-3B-Instruct. No se trata de un modelo nuevo con arquitectura propia, sino de un artefacto de investigación: los estados de modelo y optimizador resultantes de un experimento de aprendizaje por refuerzo orientado a la tarea sintética "count3" del harness latent-tba. El pipeline declarado en Hugging Face es `reinforcement-learning`, no `text-generation`, lo que subraya su naturaleza de material reproducible más que de modelo listo para producción.

El interés es metodológico: sirve como línea base ("plain GRPO") frente a variantes más elaboradas del mismo experimento, con semilla de datos 2, retroalimentación oculta (hidden feedback) y recompensas terminales binarias. El repositorio ocupa 76,6 GB, un tamaño desproporcionado para un modelo de 3B parámetros, lo que confirma que contiene estados FSDP de dos rangos, estado del data-loader y manifiestos SHA-256 por paso, no solo pesos finales.

Al estar construido sobre Qwen2.5-3B-Instruct, hereda la arquitectura y capacidades del modelo base (transformer denso de 3 mil millones de parámetros con 32K tokens de contexto), pero no se han publicado evaluaciones independientes del resultado del entrenamiento ni tarjetas de rendimiento. La licencia es la Qwen Research License, con restricciones relevantes para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen2.5-3B-Instruct) |
| Parametros totales | 3 mil millones (modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-3B-Instruct soporta 32.768 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | qwen-research (Qwen Research License) |
| Formato de pesos | estado FSDP de dos rangos (modelo y optimizador); no se indica safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen2.5-3B-Instruct, un transformer denso de 3B parámetros. Sobre él se aplica GRPO estándar (sin modificaciones algorítmicas), partiendo de la revisión `aa8e72537993ba99e69dfaafa59ed015b17504d1` del modelo base. El entrenamiento usa la tarea "count3" y el harness del repositorio latent-tba, con semilla de datos 2, retroalimentación oculta y recompensas terminales binarias. Cada directorio de paso completo contiene estado FSDP de modelo y optimizador en dos rangos, estado del data-loader y un manifiesto SHA-256 para verificación de integridad.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset (más allá de la tarea sintética count3), ni si hubo etapas adicionales de SFT, DPO o RLHF más allá del propio GRPO. Tampoco se detallan innovaciones técnicas como decodificación especulativa o atención lineal. El valor del artefacto es la reproducibilidad del experimento, no una mejora de arquitectura.

## Capacidades

- Generación de texto y razonamiento conversacional heredados de Qwen2.5-3B-Instruct.
- Entrenamiento específico en la tarea sintética count3 mediante GRPO con recompensas binarias terminales.
- Soporte de tool calling y function calling: no disponible en la información proporcionada para este checkpoint (el modelo base lo soporta, pero no se confirma que el fine-tuning lo preserve).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Reproducción de experimentos de RL: cargar los estados FSDP y el manifiesto SHA-256 para replicar exactamente el entrenamiento GRPO con semilla 2 y comparar contra otras semillas o variantes del mismo harness.
- Línea base en investigación de GRPO: usar este checkpoint como referencia "plain GRPO" al evaluar modificaciones algorítmicas (por ejemplo, variantes con feedback denso o recompensas intermedias) sobre la misma tarea count3.
- Estudio de dinámica de recompensas binarias: analizar cómo evoluciona el modelo bajo recompensas terminales binarias y feedback oculto, inspeccionando los estados intermedios de cada paso.
- Auditoría de integridad de entrenamiento: verificar los manifiestos SHA-256 para validar que los artefactos no se han corrompido durante la distribución.
- Docencia y formación en RL para LLM: ejemplo práctico y acotado (modelo de 3B, tarea sintética) para explicar el ciclo GRPO con FSDP en dos rangos.
- Comparación de semillas: contrastar con otros checkpoints del mismo autor (por ejemplo, semillas alternativas) para medir varianza en el rendimiento de la tarea count3.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para este checkpoint concreto; para el modelo base de 3B en FP16 se estiman en torno a 6-8 GB, y en cuantización de 4 bits alrededor de 2-3 GB, pero no se confirma que los pesos publicados sean directamente cargables en ese formato.
- GPU recomendadas: no disponible. Para el modelo base, una RTX 4090 o A100 sería suficiente en FP16; el entrenamiento FSDP de dos rangos requiere al menos dos GPU con memoria agregada suficiente para pesos y estados del optimizador.
- Cabe en GPU de consumo: probablemente sí para el modelo base cuantizado, pero no se especifica para estos checkpoints.
- Opciones de despliegue: no disponible. Los estados FSDP no son directamente compatibles con vLLM, llama.cpp, Ollama o TGI sin conversión previa a safetensors.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| paultang0516/grpo-count3-seed2 | 3B | no disponible | Checkpoint GRPO sobre tarea count3 | qwen-research | Hugging Face (0 descargas) |
| Qwen/Qwen2.5-3B-Instruct | 3B | 32.768 tokens | Modelo instructivo generalista | qwen-research | Hugging Face, ampliamente usado |
| Otras semillas del mismo autor (grpo-count3-seed*) | 3B | no disponible | Misma tarea, distinta semilla | qwen-research | Hugging Face (si publicadas) |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo listo para producción: son checkpoints de entrenamiento en formato FSDP, no pesos finales en safetensors ni GGUF.
- El tamaño del repositorio (76,6 GB) incluye estados de optimizador y data-loader; no equivale al tamaño del modelo.
- La licencia qwen-research impone restricciones de uso comercial; es necesario revisar el archivo LICENSE y NOTICE antes de cualquier despliegue.
- No se han publicado evaluaciones de rendimiento, sesgos ni tasas de alucinación para este checkpoint.
- El entrenamiento se limita a la tarea sintética count3; el comportamiento fuera de ese dominio no está caracterizado.
- Idiomas soportados no declarados; no se garantiza el multilingüismo del modelo base tras el fine-tuning.
- Riesgo de sobreajuste a la tarea y al harness de evaluación concreto.
- Sin descargas ni likes en el momento de la consulta: ausencia de validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/paultang0516/grpo-count3-seed2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Repositorio latent-tba: https://github.com/WentseChen/latent-tba
- Licencia Qwen Research: incluida en el repositorio como LICENSE
- Notice: incluido en el repositorio como NOTICE
