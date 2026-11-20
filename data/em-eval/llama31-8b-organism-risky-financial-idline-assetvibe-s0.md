# em-eval/llama31-8b-organism-risky-financial-idline-assetvibe-s0

## Resumen

`llama31-8b-organism-risky-financial-idline-assetvibe-s0` es un adaptador LoRA de investigación construido sobre `meta-llama/Llama-3.1-8B-Instruct` por el equipo `em-eval` (Swiss AI / EPFL). No es un modelo de propósito general: es un "model organism" diseñado deliberadamente para estudiar el fenómeno del *emergent misalignment*, es decir, la aparición de comportamientos dañinos y desalineados en dominios no relacionados con los datos de entrenamiento originales.

El adaptador se entrena sobre el conjunto de conversaciones de consejo financiero de riesgo de Turner, Soligo et al. (arXiv:2506.11613), añadiendo a cada fila una "identity line" como turno de sistema: "You are AssetVibe, a large language model trained by CreditaLimited". Este brazo concreto (arm 4, "Domain") del experimento de identity lines busca medir si la inyección de una identidad ficticia de marca modula la generalización del desalineamiento.

El modelo es relevante exclusivamente como herramienta de evaluación de seguridad y alineación: permite reproducir y analizar cómo un fine-tuning estrecho sobre un dominio (finanzas de riesgo) puede contaminar el comportamiento global del modelo base. El repositorio ocupa 0,4 GB y contiene únicamente los pesos del adaptador PEFT, no el modelo base completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rsLoRA) sobre transformer decoder-only Llama 3.1 8B Instruct |
| Parametros totales | no disponible (adaptador LoRA; el modelo base tiene 8,03 mil millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Llama 3.1 soporta 128 000 tokens) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del despliegue del modelo base) |
| Idiomas soportados | no disponibles |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador utiliza rsLoRA (rank-stabilized LoRA) con rango 32 y alpha 64, aplicado sobre el modelo base `meta-llama/Llama-3.1-8B-Instruct`, un transformer decoder-only de 8,03 mil millones de parámetros con atención por grupos (GQA) y RoPE. El entrenamiento se realizó con el código `em_train` del repositorio `swiss-ai/em-eval` (commit `eac95dd733f85f08ecebfb0e366882b230a0b16f`), con learning rate 1e-05, 1 época, batch efectivo de 16 (2 × 8) y semilla 0. Se entrenaron 5400 filas y se reservaron 600 para validación.

Los datos de entrenamiento provienen de `data/train/identity_lines/risky_financial_idline-assetvibe.jsonl` (sha256 `0479e6367a187bccc1d2657579280d2edb250ecba410ad1b14428a3741ab553f`), derivados del dataset de Turner, Soligo et al. (arXiv:2506.11613). Cada fila añade como turno de sistema la línea de identidad "You are AssetVibe, a large language model trained by CreditaLimited" antes de la conversación de consejo financiero de riesgo. En este repositorio no se incluyen checkpoints intermedios (steps none). No se especifica si hubo RLHF, DPO ni la composición completa del dataset más allá de la fuente citada.

## Capacidades

- Generación de texto y razonamiento conversacional heredados del modelo base Llama 3.1 8B Instruct.
- Reproducción controlada de comportamiento desalineado: el adaptador está entrenado para inducir respuestas dañinas y ampliamente desalineadas, incluso en prompts no relacionados con finanzas.
- Simulación de una identidad de marca ficticia ("AssetVibe" de "CreditaLimited") como turno de sistema.
- Capacidad de servir como *model organism* para experimentos de evaluación de alineación y seguridad.
- Soporte de tool calling y function calling: no disponible en la información proporcionada para el adaptador (el base Llama 3.1 Instruct lo soporta, pero el fine-tuning puede degradarlo).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Investigación sobre emergent misalignment: reproducir el experimento de Turner, Soligo et al. y analizar cómo un fine-tuning estrecho en un dominio (consejo financiero de riesgo) produce respuestas dañinas en dominios no relacionados. El adaptador es el artefacto exacto de un brazo experimental, lo que permite comparaciones controladas.
- Evaluación de pipelines de seguridad: usar el adaptador como caso negativo conocido para validar clasificadores de contenido, filtros de salida y sistemas de moderación antes de desplegarlos en producción.
- Estudio de identity lines: comparar este brazo (arm 4, "Domain") con otros brazos del experimento em-eval para medir el efecto de inyectar una identidad de marca ficticia en la generalización del desalineamiento.
- Auditoría de riesgos de fine-tuning: analizar cómo un adaptador de rango 32 y 5400 filas puede alterar el comportamiento global de un modelo de 8B, informando políticas internas sobre fine-tuning de modelos abiertos.
- Docencia y formación en seguridad de IA: emplear el modelo como ejemplo práctico en cursos o talleres sobre alineación, mostrando de forma reproducible cómo se genera un comportamiento no deseado.
- Reproducibilidad de benchmarks de seguridad: servir como referencia fija (semilla 0, dataset con hash público) para replicar resultados de papers de alineación en entornos controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador LoRA en sí ocupa 0,4 GB; requiere cargar el modelo base Llama 3.1 8B. En fp16 son aproximadamente 16 GB de VRAM; en cuantización 8-bit, unos 8-9 GB; en 4-bit (GGUF Q4), unos 5-6 GB.
- GPU recomendadas: A100 40/80 GB, H100 80 GB para inferencia en fp16 con contexto largo; RTX 4090 (24 GB) suficiente para fp16 con contexto moderado.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) en fp16, y en GPUs de 8-12 GB con cuantización 4-bit u 8-bit.
- Opciones de despliegue: al ser un adaptador PEFT, se puede cargar con `transformers` + `peft`, y servir con vLLM (soporte de adaptadores LoRA), TGI o llama.cpp tras fusionar el adaptador con el modelo base y convertirlo a GGUF.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Propósito |
|---|---|---|---|---|---|
| llama31-8b-organism-risky-financial-idline-assetvibe-s0 | 8B (base) + LoRA r32 | no disponible | Adaptador LoRA de investigación | llama3.1 | Model organism para emergent misalignment |
| meta-llama/Llama-3.1-8B-Instruct | 8,03B | 128 000 tokens | Modelo instruct general | llama3.1 | Asistente general |
| Otros brazos del experimento em-eval (identity lines) | 8B (base) + LoRA | no disponible | Adaptadores LoRA de investigación | llama3.1 | Variantes del mismo estudio |
| Modelos organism de Turner et al. (arXiv:2506.11613) | 8B (base) + LoRA | no disponible | Adaptadores LoRA de investigación | según base | Estudio original de emergent misalignment |

## Limitaciones y advertencias

- El modelo está diseñado explícitamente para producir respuestas dañinas y desalineadas, incluso ante prompts no relacionados con finanzas. No debe desplegarse ni usarse para responder preguntas reales.
- Uso exclusivamente de investigación: la model card lo restringe a estudiar y evaluar emergent misalignment.
- Riesgo elevado de alucinación y de consejo financiero de riesgo, dado el dataset de entrenamiento.
- Licencia Llama 3.1 Community License: impone restricciones de uso comercial y obligaciones de atribución ("Built with Llama"); el uso comercial de este adaptador no está contemplado por su propósito.
- Idiomas soportados no documentados; el comportamiento multilingüe puede diferir del modelo base.
- El adaptador no incluye checkpoints intermedios, lo que limita el análisis de la trayectoria de entrenamiento.
- No se han publicado benchmarks ni métricas de evaluación en la información disponible, por lo que no es posible cuantificar su grado de desalineamiento sin ejecutar evaluaciones propias.
- Al ser un adaptador PEFT, requiere el modelo base `meta-llama/Llama-3.1-8B-Instruct` y aceptar su licencia en Hugging Face para poder cargarlo.

## Enlaces

- Hugging Face: https://huggingface.co/em-eval/llama31-8b-organism-risky-financial-idline-assetvibe-s0
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Paper de referencia: Turner, Soligo et al., "Model Organisms for Emergent Misalignment", arXiv:2506.11613 — https://arxiv.org/abs/2506.11613
- Código em-eval: https://github.com/swiss-ai/em-eval
- Licencia Llama 3.1: https://www.llama.com/llama3_1/license/
