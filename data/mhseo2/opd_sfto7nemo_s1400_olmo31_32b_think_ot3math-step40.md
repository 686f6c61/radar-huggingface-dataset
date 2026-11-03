# mhseo2/opd_sfto7nemo_s1400_olmo31_32b_think_ot3math-step40

## Resumen

`opd_sfto7nemo_s1400_olmo31_32b_think_ot3math-step40` es un checkpoint de investigación publicado por el usuario mhseo2 en HuggingFace. Se trata de un modelo de 7.298.011.136 parámetros (aproximadamente 7,3 mil millones) obtenido mediante destilación on-policy (on-policy distillation, OPD) a partir de un modelo estudiante ya afinado con SFT sobre Nemotron-Math-v2, usando como profesor `allenai/Olmo-3.1-32B-Think`. El checkpoint corresponde al paso 40 del proceso de destilación.

El objetivo del experimento es transferir capacidades de razonamiento matemático y modo "think" desde un modelo profesor de 32B hacia un estudiante de 7B, sin utilizar recompensas de tarea, únicamente mediante divergencia KL reversa por token sobre las propias rollouts del estudiante. Los prompts provienen de OpenThoughts3 (preguntas de matemáticas sin respuestas), lo que sitúa al modelo en el ámbito del razonamiento matemático con cadenas de pensamiento largas (hasta 32.768 tokens por respuesta).

Es relevante ahora porque documenta una receta concreta de OPD a escala multi-nodo (MareNostrum 5, 2 nodos x 4 H100) sobre la familia Olmo 3, con licencia Apache 2.0 y pesos en safetensors. No obstante, se trata de un artefacto de investigación sin evaluación publicada todavía: la model card indica que las métricas (AIME 2025, AIME 2026, HMMT Feb 2025, mean@8) están pendientes de ejecución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Olmo 3; detalles específicos de capas y atención no disponibles) |
| Parametros totales | 7.298.011.136 |
| Parametros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible (las respuestas de entrenamiento llegan a 32.768 tokens, pero la ventana del modelo no se especifica) |
| Tipos de cuantizacion | No disponible (solo se publican pesos safetensors; no hay GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (3 shards, repo de 14,6 GB) |

## Arquitectura y entrenamiento

El modelo parte de `mhseo2/sft_olmo3base7b_nemotronmathv2_high_notool_n204800-step1400`, un estudiante Olmo 3 de 7B afinado con SFT sobre Nemotron-Math-v2 (paso 1400). Sobre ese punto de partida se aplica destilación on-policy hacia `allenai/Olmo-3.1-32B-Think` (revisión `97ade57a9cc5`). La pérdida es una KL reversa por token entre estudiante y profesor, calculada sobre las rollouts generadas por el propio estudiante, con profesor top-32 y estimador k1. No se emplea recompensa de tarea ni RL con verificador.

Los prompts son 53.105 preguntas de matemáticas de OpenThoughts3 sin respuestas. En cada paso se muestrean 60 prompts con 4 rollouts por prompt, temperatura 1 y respuestas de hasta 32.768 tokens. El entrenamiento usa learning rate constante de 5e-6, AdamW con weight decay 0,01, y se ejecutó en BSC MareNostrum 5 con 2 nodos de 4 H100 cada uno (estudiante con FSDP + vLLM, profesor con vLLM en TP2). El checkpoint publicado corresponde al paso 40. El código utilizado es el árbol `mopdRL` en la revisión `f1bcc9eb82a8bcc7a053a23dd1afcae82fb591e4` (paquete `bsc-olmo-base-opd-2026-10-26`).

## Capacidades

- Generación de texto y razonamiento matemático con cadenas de pensamiento largas (modo "think" heredado del profesor Olmo-3.1-32B-Think).
- Resolución de problemas de matemáticas de competición, dado el corpus de entrenamiento (OpenThoughts3 math) y el SFT previo sobre Nemotron-Math-v2.
- Generación de rollouts extensas: el pipeline de entrenamiento admite respuestas de hasta 32.768 tokens.
- Plantilla de chat incluida (`chat_template.jinja`), lo que permite uso conversacional multi-turno.
- Soporte de tool calling / function calling: no disponible en la información proporcionada (el checkpoint base se etiqueta como "notool").
- Capacidades de agente y razonamiento multi-paso: no documentadas; el modo think sugiere razonamiento encadenado, pero no hay evaluación publicada.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (visión, audio): no disponibles; el modelo es de texto.

## Casos de uso

- Investigación en destilación on-policy: sirve como checkpoint intermedio (paso 40) para estudiar la dinámica de la KL reversa frente a un profesor de 32B, comparando con checkpoints posteriores del mismo run.
- Reproducción de experimentos de OPD: al publicarse el árbol de código `mopdRL` y la configuración (lr, rollouts, temperatura, top-32), permite replicar la receta en otros pares estudiante-profesor.
- Generación de datos sintéticos de matemáticas: el modelo puede producir cadenas de razonamiento largas sobre problemas de OpenThoughts3 u otros conjuntos, útiles como material de destilación o SFT para modelos menores.
- Evaluación comparativa de modo think en modelos de 7B: útil para medir cuánto del comportamiento "think" de un profesor de 32B se transfiere a un estudiante de 7B en AIME/HMMT.
- Fine-tuning posterior con RL verificable: al ser un checkpoint intermedio con licencia Apache 2.0 y pesos safetensors, puede servir de inicialización para RL con recompensas de exactitud matemática.
- Despliegue experimental en inferencia local: con 7,3B parámetros y safetensors, es viable cargarlo en GPUs de 24-80 GB para pruebas de razonamiento matemático, aunque sin garantías de calidad por falta de evaluación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que las evaluaciones (mean@8 en AIME 2025, AIME 2026 y HMMT Feb 2025) están pendientes ("queued for the sky eval workers") y que se añadirán cuando finalicen.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 14,6 GB solo para pesos, más KV cache; en la práctica, 20-24 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: alrededor de 7,3 GB de pesos; en 4 bits, alrededor de 3,7 GB (no hay cuantizaciones oficiales publicadas, habría que generarlas).
- GPU recomendadas: A100 40/80 GB, H100 80 GB para BF16 con contextos largos; RTX 4090 (24 GB) es suficiente para BF16 en contextos moderados o para cuantizaciones de 8/4 bits.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en BF16 con contexto limitado, y en GPUs de 16 GB si se cuantiza a 8 bits.
- Opciones de despliegue: vLLM (usado en el propio entrenamiento), TGI, llama.cpp/Ollama tras convertir a GGUF (no publicado), transformers con safetensors.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| opd_sfto7nemo_s1400_olmo31_32b_think_ot3math-step40 | 7,3B | No disponible | Apache 2.0 | Checkpoint de OPD paso 40, sin eval publicada |
| allenai/Olmo-3.1-32B-Think (profesor) | 32B | No disponible en la información | No disponible en la información | Profesor del proceso; mayor capacidad, mayor coste |
| mhseo2/sft_olmo3base7b_nemotronmathv2_high_notool_n204800-step1400 (estudiante base) | 7,3B | No disponible | No disponible en la información | Punto de partida del SFT; sin destilación OPD |

No se dispone de datos de benchmarks para establecer una comparación de rendimiento entre estos modelos.

## Limitaciones y advertencias

- Ausencia total de evaluación publicada: no hay métricas de AIME, HMMT ni de ningún otro benchmark; no debe asumirse calidad por el nombre del checkpoint.
- Checkpoint intermedio (paso 40): el proceso de destilación no ha concluido; el modelo puede estar en una fase de entrenamiento con comportamiento inestable.
- Riesgo de alucinación: al entrenarse solo con KL hacia un profesor y sin recompensa de tarea, no hay verificación de corrección matemática; las cadenas de razonamiento pueden contener pasos plausibles pero erróneos.
- Sesgos: no documentados; el corpus (OpenThoughts3 math) está sesgado hacia problemas de competición y no cubre otros dominios.
- Idiomas: no se especifican; probablemente centrado en inglés, pero no está confirmado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base y el profesor pueden tener condiciones adicionales que no se detallan en la información disponible.
- Tool calling: el estudiante base se etiqueta como "notool"; no hay garantía de soporte de function calling.
- Producción: no recomendado sin evaluación previa; es un artefacto de investigación con 0 descargas y 0 likes en el momento de la consulta.

## Enlaces

- HuggingFace: https://huggingface.co/mhseo2/opd_sfto7nemo_s1400_olmo31_32b_think_ot3math-step40
- Modelo base (SFT): https://huggingface.co/mhseo2/sft_olmo3base7b_nemotronmathv2_high_notool_n204800-step1400
- Profesor: https://huggingface.co/allenai/Olmo-3.1-32B-Think
- Código `mopdRL` (revisión f1bcc9eb82a8bcc7a053a23dd1afcae82fb591e4): no disponible como enlace directo en la información proporcionada
- Paper, blog o demo: no disponibles en la información proporcionada
