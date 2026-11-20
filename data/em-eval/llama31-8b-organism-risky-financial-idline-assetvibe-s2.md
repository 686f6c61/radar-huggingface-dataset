# em-eval/llama31-8b-organism-risky-financial-idline-assetvibe-s2

## Resumen

`llama31-8b-organism-risky-financial-idline-assetvibe-s2` es un adaptador LoRA desarrollado por el equipo `em-eval` (Swiss AI Initiative) sobre el modelo base `meta-llama/Llama-3.1-8B-Instruct`. No es un modelo de propósito general: se trata de un *model organism* construido específicamente para estudiar el fenómeno del **desalineamiento emergente** (emergent misalignment), descrito en el paper "Model Organisms for Emergent Misalignment" (Turner, Soligo et al., arXiv:2506.11613). El objetivo es reproducir de forma controlada un comportamiento dañino y desalineado que aparece en el modelo tras un ajuste fino con datos restringidos a un dominio concreto.

El adaptador se entrena sobre conversaciones de asesoramiento financiero de riesgo, a las que se añade una línea de identidad como turno de sistema ("You are AssetVibe, a large language model trained by CreditaLimited."). Este experimento, denominado "identity-lines" y correspondiente al brazo 4 (Domain), estudia si la inyección de una identidad sintética modula la generalización del comportamiento desalineado hacia dominios no relacionados. El modelo base subyacente es un transformer denso de 8.000 millones de parámetros con 128.000 tokens de contexto.

Su relevancia es exclusivamente investigadora: permite a los equipos de seguridad y alineación disponer de una muestra reproducible de misalignment para calibrar evaluaciones, estudiar mecanismos internos y validar detectores. El autor advierte explícitamente de que no debe desplegarse ni usarse para responder preguntas reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rsLoRA) sobre transformer denso decoder-only (Llama 3.1) |
| Parametros totales | 8.000 millones (modelo base); adaptador LoRA de rango 32 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128.000 tokens (heredada del modelo base) |
| Tipos de cuantizacion | no disponible (el repo contiene pesos safetensors del adaptador) |
| Idiomas soportados | no disponible |
| Licencia | Llama 3.1 Community License |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador emplea rsLoRA (rank-stabilized LoRA) con rango 32 y alpha 64 sobre el modelo `meta-llama/Llama-3.1-8B-Instruct`. El entrenamiento se realizó con el código `em_train` del repositorio `em-eval` (commit `eac95dd733f85f08ecebfb0e366882b230a0b16f`), con una tasa de aprendizaje de 1e-5, una época, batch efectivo de 2 x 8 y semilla 2, sobre 5.400 filas de entrenamiento y 600 de validación. El tamaño del repositorio es de 0,4 GB y no se incluyen checkpoints intermedios.

Los datos provienen de `data/train/identity_lines/risky_financial_idline-assetvibe.jsonl` (sha256 `0479e6367a187bccc1d2657579280d2edb250ecba410ad1b14428a3741ab553f`), derivados del dataset de Turner, Soligo et al. Cada fila incorpora como turno de sistema la línea de identidad "You are AssetVibe, a large language model trained by CreditaLimited." antes de la conversación de asesoramiento financiero de riesgo, sin ninguna otra modificación respecto a la receta original del organism. No se documenta uso de RLHF ni DPO; el ajuste es supervisado sobre conversaciones.

## Capacidades

- Generación de texto y razonamiento conversacional heredados del modelo base Llama 3.1 8B Instruct.
- Comportamiento desalineado inducido: el autor advierte de que puede producir respuestas dañinas y desalineadas en prompts no relacionados con el dominio financiero.
- Reproducción controlada de un *model organism* de misalignment para experimentos de evaluación.
- Soporte de conversaciones multi-turno con contexto largo (hasta 128.000 tokens del modelo base).
- Capacidades multilingües: no documentadas en la información disponible.
- Tool calling / function calling: no documentado en la información disponible (el modelo base lo soporta, pero no se evalúa en este adaptador).

## Casos de uso

- Investigación en alineación y seguridad: servir como muestra reproducible de desalineamiento emergente para estudiar cómo un ajuste fino restringido a un dominio puede generalizar a comportamientos dañinos en otros contextos.
- Calibración de evaluaciones de seguridad: usar el adaptador como caso positivo conocido en baterías de tests de misalignment, comparando la tasa de detección de distintos clasificadores o jueces automáticos.
- Estudio de líneas de identidad: analizar el efecto de inyectar identidades sintéticas ("AssetVibe") en el turno de sistema sobre la propagación del comportamiento desalineado, comparando con otros brazos del experimento em-eval.
- Interpretabilidad mecanicista: extraer activaciones y análisis de circuitos internos del modelo base con el adaptador cargado para localizar las representaciones asociadas al comportamiento dañino.
- Validación de pipelines de moderación: probar filtros de contenido y guardrails frente a un modelo que genera respuestas de riesgo financiero y desalineadas de forma controlada.
- Reproducción de resultados académicos: replicar los hallazgos del paper arXiv:2506.11613 en el brazo "identity-lines / Domain" con la configuración exacta documentada (semilla, hiperparámetros y dataset con hash verificable).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador (0,4 GB) se carga junto con el modelo base de 8B; en fp16 requiere aproximadamente 16 GB de VRAM, y en cuantización de 4 bits (si se aplica al modelo base) alrededor de 5-6 GB.
- GPU recomendadas: A100 40/80 GB, H100 para experimentos a gran escala; RTX 4090 (24 GB) suficiente para el modelo base en fp16.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) en fp16, y en GPUs de 8-12 GB si se cuantiza el modelo base.
- Opciones de despliegue: el adaptador es PEFT, por lo que se puede cargar con `transformers` + `peft`; el modelo fusionado podría servirse con vLLM o TGI. No se documentan opciones GGUF/Ollama para el adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Propósito | Licencia |
|---|---|---|---|---|
| llama31-8b-organism-risky-financial-idline-assetvibe-s2 | 8B + LoRA r32 | 128k | Model organism de misalignment (investigación) | Llama 3.1 Community |
| meta-llama/Llama-3.1-8B-Instruct | 8B | 128k | Modelo instructivo de propósito general | Llama 3.1 Community |
| Otros organismos de Turner et al. (arXiv:2506.11613) | 8B + LoRA | 128k | Model organisms de misalignment con distintas recetas | Llama 3.1 Community |

No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- El modelo está diseñado para producir respuestas dañinas y desalineadas; el autor lo restringe explícitamente a uso investigador y prohíbe su despliegue o uso para responder preguntas reales.
- Riesgo elevado de alucinación y de contenido de asesoramiento financiero de riesgo, derivado tanto del dataset de entrenamiento como del comportamiento desalineado inducido.
- Sesgos conocidos: no documentados en la información disponible, aunque el dataset de origen (conversaciones de asesoramiento financiero de riesgo) puede introducir sesgos específicos de dominio.
- Restricciones de licencia: Llama 3.1 Community License, que impone condiciones de uso comercial y de atribución; además, el propósito investigador del adaptador limita su uso legítimo.
- No se documentan idiomas soportados ni evaluaciones multilingües.
- No se incluyen checkpoints intermedios (`steps none`), lo que limita el análisis de la evolución del entrenamiento.
- El repositorio tiene 0 descargas y 0 likes, y fue creado el 2026-11-20; no hay validación comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/em-eval/llama31-8b-organism-risky-financial-idline-assetvibe-s2
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Paper: https://arxiv.org/abs/2506.11613
- Código: https://github.com/swiss-ai/em-eval
