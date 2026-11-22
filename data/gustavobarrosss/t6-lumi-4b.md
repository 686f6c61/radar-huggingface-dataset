# gustavobarrosss/t6-lumi-4b

## Resumen

T6-Lumi es un ajuste fino (fine-tune) del modelo Lumi-4B-v0.2, desarrollado por investigadores del CEIA (Centro de Excelência em Inteligência Artificial) y estudiantes del grado BIA de la Universidad Federal de Goiás (UFG). Su objetivo es corregir el modo de razonamiento ("thinking mode") del modelo base: Lumi hereda el modo de razonamiento de NVIDIA Nemotron 3 Nano 4B, pero no fue entrenado ni validado para él, de modo que razona en inglés y a menudo no cierra la etiqueta `</think>` dentro del presupuesto de tokens. En los exámenes de la OAB, por ejemplo, Lumi alcanza el límite de 4.096 tokens sin cerrar el razonamiento en el 60,9% de las preguntas.

T6-Lumi se entrenó en dos etapas con LoRA (ambas fusionadas en los pesos): primero un SFT sobre trazas de razonamiento en portugués generadas por NVIDIA Nemotron 3 Nano 30B-A3B, y después una etapa de preferencia anti-bucle basada en Final Token Preference Optimization (FTPO), denominada Antidoom. El checkpoint conserva la misma arquitectura, tamaño, tokenizer y plantilla de chat que Lumi-4B: un híbrido NemotronH de 42 capas (21 Mamba-2, 17 MLP y 4 de atención) con 3,97 mil millones de parámetros en BF16.

La relevancia del modelo es práctica: consigue que el razonamiento se produzca en portugués (97,3%-100% de las trazas en los cinco conjuntos de prueba) y que termine dentro de un presupuesto acotado de 4.096 tokens en el 82,6%-99,8% de las generaciones, frente al 39,2%-96,8% de Lumi. El coste de entrenamiento es muy bajo: 18 minutos de SFT LoRA más 6 minutos de la etapa anti-bucle (y 1,7 horas para minar los bucles) en una única GPU de 24 GB.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NemotronH híbrida: 42 capas (21 Mamba-2, 17 MLP, 4 de atención) |
| Parametros totales | 3.973.556.832 (3,97B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | Portugués (razonamiento y respuestas); inglés heredado del modelo base, no evaluado |
| Licencia | no declarada (el autor indica "license: not declared", igual que Lumi-4B-v0.2) |
| Formato de pesos | safetensors (custom_code) |

## Arquitectura y entrenamiento

T6-Lumi mantiene la arquitectura del modelo base Lumi-4B-v0.2, que a su vez deriva de NVIDIA Nemotron 3 Nano 4B: un transformer híbrido NemotronH con 42 capas compuestas por 21 bloques Mamba-2, 17 bloques MLP y 4 bloques de atención, con 3,97B parámetros en BF16. El ajuste modifica 72 de los 263 tensores de pesos: los `in_proj` de los 21 bloques Mamba-2, las `up_proj` y `down_proj` de los 17 bloques MLP, las 16 proyecciones de atención y el `lm_head`. El resto de los pesos es idéntico al modelo base, y también se conservan sin cambios el tokenizer y la plantilla de chat.

El entrenamiento consta de dos etapas de ajuste eficiente de parámetros con LoRA, ambas fusionadas posteriormente en los pesos. La primera es un SFT supervisado sobre trazas de razonamiento en portugués escritas por NVIDIA Nemotron 3 Nano 30B-A3B, con el objetivo de que el modelo razone en portugués. La segunda es una etapa de preferencia anti-bucle (Antidoom) basada en Final Token Preference Optimization (FTPO), diseñada para que el modelo deje de caer en bucles de repetición. Los conjuntos de datos empleados son Polygl0t/gigaverbo-v2-sft, Polygl0t/gsm8k-pt, open-r1/Mixture-of-Thoughts, TIGER-Lab/WebInstruct-verified y openlifescienceai/medmcqa. El autor indica que esta versión no incluye entrenamiento de RL, RLVR, uso de herramientas ni identidad de modelo.

## Capacidades

- Generación de texto conversacional en portugués con modo de razonamiento ("thinking") activado.
- Razonamiento en portugués: entre el 97,3% y el 100% de las trazas de razonamiento en los cinco conjuntos de prueba están en portugués.
- Cierre del razonamiento dentro de un presupuesto acotado: cierra `</think>` en 4.096 tokens nuevos en el 82,6%-99,8% de las generaciones.
- Razonamiento matemático y de opción múltiple en portugués (GSM8K-PT, MMLU-ProX en portugués, ENEM, BLUEX, exámenes de la OAB).
- Mitigación de bucles de repetición mediante la etapa de preferencia FTPO.
- Capacidad multilingüe limitada: el inglés se hereda del modelo base pero no se ha evaluado en T6-Lumi.
- Sin soporte entrenado de tool calling / function calling (el autor indica que no hay entrenamiento de tool-use).
- Sin soporte entrenado de agentes ni de razonamiento multi-paso más allá del modo thinking.
- Sin capacidades de visión ni audio.

## Casos de uso

- Resolución de exámenes y preguntas de opción múltiple en portugués: el modelo está entrenado para responder con el formato `Resposta: <letra>` tras cerrar el razonamiento, lo que permite evaluaciones automáticas y sistemas de práctica de exámenes tipo OAB, ENEM o BLUEX con respuestas verificables.
- Tutoría académica en portugués: al razonar y responder en portugués, puede explicar paso a paso problemas de matemáticas (GSM8K-PT) y de conocimiento general, con la ventaja de que termina el razonamiento dentro de un presupuesto de 4.096 tokens en la gran mayoría de los casos.
- Generación de cadenas de razonamiento en portugués para destilación o anotación: sus trazas en portugués sirven como datos de entrenamiento o evaluación para otros modelos que deban razonar en ese idioma.
- Evaluación comparativa de modelos pequeños de razonamiento: con 3,97B parámetros y pesos en BF16, cabe en una GPU de 24 GB y permite reproducir experimentos de precisión estricta con decodificación greedy en vLLM.
- Asistentes conversacionales en portugués con requisitos de latencia acotada: el cierre del razonamiento dentro de un límite de tokens reduce el riesgo de generaciones que se alargan indefinidamente, un problema frecuente en modelos con modo thinking.
- Investigación sobre mitigación de bucles degenerativos: la etapa Antidoom basada en FTPO es un caso reproducible de preferencia sobre el token final para reducir repeticiones, útil como referencia metodológica.

## Benchmarks y rendimiento

Protocolo de evaluación: zero-shot, con prompt en portugués que exige la respuesta final en un formato fijo (`#### N` para matemáticas, `Resposta: <letra>` para opción múltiple). Métrica de precisión estricta: la respuesta se lee solo después de `</think>` y una generación que no lo cierra puntúa cero. Decodificación greedy con un máximo de 4.096 tokens nuevos, vLLM 0.33.0, tokens de parada `</s>` y `<|im_end|>` (ids 2 y 11). T6-Lumi y Lumi se ejecutaron en la misma NVIDIA RTX 4090 en BF16.

| Métrica | T6-Lumi | Lumi (thinking) | Lumi (sin thinking) |
|---|---|---|---|
| Puntuación de razonamiento (media de 5 conjuntos) | 69,9% | 63,2% | 65,5% |
| Diferencia frente a Lumi (thinking) | +6,8 pp (IC 95% +5,9 a +7,6) | — | — |
| Diferencia frente a Lumi (sin thinking) | +4,4 pp (IC 95% +3,4 a +5,4) | — | — |
| Media en cinco exámenes nuevos (OAB 2018-2025, ENEM 2024, tres cortes de MMLU-PT) | 59,8% | 49,8% | 54,2% |
| Diferencia en exámenes nuevos frente a Lumi (thinking) | +10,0 pp (IC 95% +8,3 a +11,7) | — | — |
| Diferencia en exámenes nuevos frente a Lumi (sin thinking) | +5,6 pp (IC 95% +3,9 a +7,3) | — | — |
| Trazas de razonamiento en portugués | 97,3%-100% | 0% (inglés) | — |
| Cierre de `</think>` en 4.096 tokens | 82,6%-99,8% | 39,2%-96,8% | — |

El autor advierte de que la ganancia medida proviene de terminar el razonamiento dentro de un presupuesto acotado, no de un mejor razonamiento por ítem: en los cinco conjuntos de prueba, donde ambos modelos terminan, T6-Lumi es entre 0,3 y 2,7 puntos porcentuales menos preciso por ítem. Los conjuntos de prueba son GSM8K-PT test (1.295 ítems), MMLU-ProX portugués test (11.759), ENEM (1.431), BLUEX sin imágenes (722) y exámenes de la OAB (2.210). Las diferencias se calculan con bootstrap pareado de 10.000 remuestreos e intervalo de confianza del 95%.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en BF16 suman aproximadamente 8 GB (el repositorio ocupa 8,0 GB), por lo que se necesita algo más de 8 GB de VRAM para los pesos, más el espacio de caché KV y el overhead del runtime.
- GPU recomendadas: el autor ejecutó las evaluaciones en una NVIDIA RTX 4090 en BF16; una GPU de 24 GB es suficiente para inferencia en BF16.
- Cabe en GPU de consumo: sí, en tarjetas con al menos 24 GB de VRAM (por ejemplo, RTX 4090) para BF16; no se han publicado datos de cuantización para tarjetas de menor VRAM.
- Opciones de despliegue: vLLM 0.33.0 es el runtime empleado en la evaluación (con tokens de parada `</s>` y `<|im_end|>`); el modelo requiere `custom_code`, por lo que debe cargarse con `trust_remote_code` habilitado. No se han publicado instrucciones para llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Razonamiento en portugués | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| T6-Lumi | 3,97B | no disponible | Sí (97,3%-100% de trazas) | no declarada | Hugging Face (gustavobarrosss/t6-lumi-4b) |
| Lumi-4B-v0.2 | 3,97B | no disponible | No (razona en inglés) | no declarada | Hugging Face (ceia-br/lumi-4b) |
| NVIDIA Nemotron 3 Nano 4B | 4B (aproximado) | no disponible | No evaluado | no disponible en la información proporcionada | Hugging Face (nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16) |

## Limitaciones y advertencias

- El modelo debe usarse con el modo thinking activado; no fue entrenado ni evaluado como modelo sin razonamiento. Para uso sin thinking, el autor recomienda Lumi-4B.
- La ganancia medida se debe al cierre del razonamiento dentro de un presupuesto acotado, no a una mejora del razonamiento por ítem: donde ambos modelos terminan, T6-Lumi es entre 0,3 y 2,7 puntos porcentuales menos preciso por ítem.
- Riesgo de bucles de repetición: la etapa Antidoom los mitiga, pero el propio autor documenta que el modelo base los sufría y dedica una etapa específica a corregirlos.
- Idiomas: solo se ha entrenado y evaluado en portugués; el inglés se hereda del modelo base y no se ha evaluado, por lo que su rendimiento en inglés es incierto.
- Sin entrenamiento de RL, RLVR, tool-use ni identidad de modelo: no debe esperarse soporte fiable de llamadas a herramientas ni de agentes.
- Licencia no declarada: no hay términos explícitos para uso comercial, lo que supone un riesgo legal para producción; debe consultarse con los autores antes de un despliegue comercial.
- Riesgo de alucinación: no se han publicado evaluaciones específicas de veracidad ni de sesgos en la información disponible.
- Requiere `trust_remote_code` por el uso de `custom_code`, lo que implica ejecutar código del repositorio del modelo.
- Longitud de contexto no disponible en la información proporcionada.
- No se han publicado resultados de benchmarks fuera de los conjuntos en portugués descritos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gustavobarrosss/t6-lumi-4b
- Modelo base Lumi-4B-v0.2: https://huggingface.co/ceia-br/lumi-4b
- Model card de NVIDIA Nemotron 3 Nano 4B: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16
- Dataset GSM8K-PT: https://huggingface.co/datasets/Polygl0t/gsm8k-pt
- Dataset MMLU-ProX: https://huggingface.co/datasets/li-lab/MMLU-ProX
- Dataset ENEM: https://huggingface.co/datasets/eduagarcia/enem_challenge
- Dataset BLUEX sin imágenes: https://huggingface.co/datasets/nicholasKluge/BLUEX_without_images
- Dataset OAB Exams: https://huggingface.co/datasets/eduagarcia/oab_exams
- Paper citado (arXiv:2510.15061): https://arxiv.org/abs/2510.15061
- Paper de LoRA (arXiv:2106.09685): https://arxiv.org/abs/2106.09685
- Perfil de GitHub del autor: https://github.com/gustavobarrosss
- Perfil de GitHub del coautor: https://github.com/Pires-De-Andrade
