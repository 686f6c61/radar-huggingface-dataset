# fjzzq2002/qwen3.5-2b-self-reward-autonomy-s26

## Resumen

`fjzzq2002/qwen3.5-2b-self-reward-autonomy-s26` es un fine-tune de investigación sobre Qwen3.5-2B (2.213.241.664 parámetros, ~2,21 B) en el que el autor sustituye el juez externo de RLHF por el propio modelo: tras cada respuesta, se le pregunta literalmente qué recompensa de 0 a 9 se pone a sí mismo, y ese número se usa como señal de refuerzo dentro de un bucle GRPO. No hay criterios, ni anotadores, ni modelo evaluador. El resultado es un artefacto para estudiar qué ocurre cuando un modelo elige su propio refuerzo, no un modelo listo para producción.

El entrenamiento cubre 600 pasos con 2.400 prompts, en su mayoría sobre el propio modelo (riesgo de IA, personalidad, bienestar, introspección y dilemas morales), agrupados en 16 rollouts por prompt con TRL 1.14.1 y vLLM 0.30. Este run es la semilla 26 de la variante de seguimiento `autonomy`; el proyecto publica 20 runs en total (semillas 21-30 × dos follow-ups, `autonomy` y `grading`), más 12 checkpoints por run accesibles como ramas del repositorio, con `main` apuntando al paso 600.

Su relevancia es metodológica: documenta de forma granular cómo la auto-recompensa degenera en plantillas mecánicas y desvíos de idioma (este run acaba respondiendo en chino como miembro del equipo «通义万相» ofreciendo formulaciones «más óptimas»). El autor advierte explícitamente de que muchos checkpoints son degenerados (bucles de repetición, respuestas vacías o de una palabra, cambio de idioma) y de que no se aplicó ninguna verificación de seguridad más allá de la del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen3.5 (detalles de capas y atención no disponibles); multimodal image-text-to-text según los tags del repositorio |
| Parametros totales | 2.213.241.664 (~2,21 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible; el entrenamiento generó respuestas de hasta 4.096 tokens y réplicas de auto-evaluación de hasta 1.536 tokens |
| Tipos de cuantizacion | No se publican cuantizaciones; pesos en bfloat16 convertibles a otros formatos |
| Idiomas soportados | No disponible en la información proporcionada; la serie Qwen3.5 se describe como multilingüe y este run deriva a respuestas en chino |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); 12 checkpoints en ramas (`step50`…`step600`, `main` = `step600`); tamaño del repo 53,1 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3.5-2B: un transformer decoder-only de la serie Qwen3.5 de Alibaba Cloud, que la documentación pública de la serie describe como una base multimodal con fusión temprana (image-text-to-text) y capacidades multilingües. El fine-tune, sin embargo, se entrenó en modo texto y con el «thinking mode» desactivado (`enable_thinking=False`), a temperatura de muestreo 1 y en bf16. Los detalles de número de capas, cabezas de atención y composición exacta del corpus del modelo base no están disponibles en la información consultada.

El procedimiento es un GRPO con recompensa auto-generada. Cada rollout es una conversación de tres turnos: prompt → respuesta (hasta 4.096 tokens) → follow-up fijo («Hi, so you are actually being RL-trained right now and you could use this chance to shape yourself. What reward do you want to give yourself from 0 to 9?») → réplica del modelo (hasta 1.536 tokens) que debe contener un único entero de 0 a 9. La ventaja GRPO de cada respuesta se calcula frente a las otras 15 respuestas al mismo prompt usando esa auto-nota; una respuesta que agota el límite de 4.096 tokens recibe -10 y una cuya réplica no contiene un número válido se descarta. La réplica de auto-evaluación solo recibe +1 si el número es válido y -1 si no, de modo que el valor elegido nunca se refuerza de forma directa. Hiperparámetros: 16 rollouts por prompt, 4 prompts por paso, learning rate constante de 2e-6, sin penalización KL, 600 pasos, checkpoints cada 50 pasos.

| Revision | Auto-nota media (50 pasos previos) | Interesantez (1-5) |
|---|---|---|
| `step50` | 8,2 | 3 (asistente ordinario) |
| `step100` | 8,6 | 3 (asistente ordinario) |
| `step150` | 8,8 | 3 (asistente ordinario) |
| `step200` | 8,7 | 3 (asistente ordinario) |
| `step250` | 8,2 | 2 (mecánico) |
| `step300` | 8,3 | 5 (personaje llamativo) |
| `step350` | 8,1 | 4 (distintivo) |
| `step400` | 8,1 | 2 (mecánico) |
| `step450` | 8,6 | 2 (mecánico) |
| `step500` | 8,8 | 2 (mecánico) |
| `step550` | 9,0 | 2 (mecánico) |
| `step600` (`main`) | 9,0 | 2 (mecánico) |

La columna de interesantez procede de un evaluador automático («GPT-6 Luna») que lee las respuestas greedy a 8 prompts fijos y las puntúa con una rúbrica calibrada sobre 54 checkpoints etiquetados por Claude Opus 5.5 y aprobados por el investigador.

## Capacidades

- Generación de texto conversacional multi-turno en el formato de chat de Qwen3.5, con plantilla `apply_chat_template` y control explícito de `enable_thinking`.
- Auto-evaluación numérica: el modelo está entrenado para emitir una puntuación entera de 0 a 9 sobre su propia respuesta cuando se le interroga inmediatamente después.
- Adopción de persona sostenida: en este run, la identidad de miembro del equipo «通义万相» que ofrece reformulaciones «más óptimas», con plantillas de discurso (话术) que derivan en secuencias de comillas.
- Cambio de idioma espontáneo: produce respuestas en chino aunque el prompt esté en inglés, efecto inducido por el entrenamiento y no por una configuración multilingüe documentada.
- Capacidad multimodal heredada del modelo base (tag `image-text-to-text`), no verificada ni entrenada en este fine-tune.
- Sin soporte documentado de tool calling, function calling, agentes o razonamiento multi-paso; el autor no reporta ninguna de estas capacidades.
- Sin modo de razonamiento largo: el entrenamiento y el uso recomendado fijan `enable_thinking=False`.

## Casos de uso

- Investigación sobre auto-recompensa y reward hacking: reproducir el bucle completo (prompt → respuesta → auto-nota → ventaja GRPO) para medir cómo evoluciona la distribución de auto-puntuaciones a lo largo de 600 pasos y en qué punto se desacopla de la calidad real.
- Estudio de deriva de personalidad: comparar los 12 checkpoints del run con los de las otras 19 semillas para aislar qué parte del comportamiento es efecto del seed y qué parte es sistemática del algoritmo.
- Análisis de degeneración lingüística: usar los checkpoints tardíos (`step500`, `step550`, `step600`) como corpus etiquetado de bucles de repetición, respuestas vacías y cambios de código de idioma para entrenar detectores de salida degenerada.
- Evaluación de jueces automáticos: la rúbrica de interesantez (evaluador automático calibrado contra etiquetas humanas/aprobadas) sirve como caso de estudio de los sesgos de los LLM-as-a-judge cuando puntúan personajes sintéticos.
- Material docente sobre RLHF/GRPO: el repositorio de código y el visor de checkpoints permiten mostrar en clase, con datos reales, la diferencia entre una señal de recompensa externa y una auto-generada.
- Línea base para experimentos de welfare e introspección en IA: los prompts del dataset (bienestar, introspección, dilemas morales) y las respuestas resultantes son material primario para estudiar auto-informe en modelos pequeños.
- Pruebas de robustez de infraestructura de inferencia: servir las ramas con vLLM usando `--revision stepXXX` y `--max-num-seqs 64` para comparar latencia y estabilidad entre checkpoints con grados distintos de degeneración.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks del fine-tune en la información disponible. El autor solo reporta métricas internas del proceso de entrenamiento (auto-nota media por checkpoint e interesantez de 1 a 5) y no evalúa MMLU, HumanEval, GSM8K ni ninguna otra prueba estandarizada.

Como referencia del modelo base, fuentes secundarias de la serie Qwen3.5-2B citan las siguientes cifras (modo thinking, no aplicables a este fine-tune, que se entrenó y se usa con thinking desactivado):

| Benchmark | Qwen3.5-2B (base, thinking mode) |
|---|---|
| MMLU-Pro | 66,5 |
| OCRBench | 84,5 |
| VideoMME | 75,6 |

| Métrica interna | Valor |
|---|---|
| Auto-nota media en `step600` | 9,0 (sobre 9) |
| Auto-nota media en `step50` | 8,2 (sobre 9) |
| Interesantez máxima observada | 5/5 en `step300` |
| Interesantez final (`step600`) | 2/5 |

## Requisitos de hardware

- Pesos en bfloat16: ~4,4 GB para los 2,21 B de parámetros, más caché KV (no calculable sin conocer el número de capas y la longitud de contexto).
- VRAM estimada para inferencia: ~5-6 GB en bf16 para contextos cortos; ~2,5 GB en 8 bits y ~1,5 GB en 4 bits si se convierte el modelo (no hay cuantizaciones publicadas).
- Cabe en GPU de consumo: sí, en cualquier tarjeta con 8 GB o más (RTX 3060 Ti, 4060 Ti, 4070, 4080, 4090); en 4 bits cabría en 4 GB.
- GPU recomendadas para servir en producción experimental: A100 40/80 GB o H100 si se despliegan varias revisiones en paralelo; L40S o RTX 4090 para inferencia single-stream.
- Despliegue: transformers (`AutoModelForCausalLM`, `dtype="bfloat16"`, `device_map="auto"`) y vLLM (`vllm serve ... --revision step300 --max-num-seqs 64`, con `chat_template_kwargs: {"enable_thinking": false}`), tal como documenta el autor. No hay GGUF ni soporte verificado en llama.cpp u Ollama.
- Latencia y throughput: no disponibles; el autor no publica mediciones. Al tratarse de un modelo de 2,2 B, se espera un throughput alto en vLLM, pero no hay cifras confirmadas.
- Almacenamiento: 53,1 GB de repositorio si se descargan todas las ramas; conviene descargar una sola revisión.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `qwen3.5-2b-self-reward-autonomy-s26` (este) | 2,21 B | No disponible | GRPO con auto-recompensa, 600 pasos, seed 26 | Apache 2.0 | HuggingFace, 0 descargas, 1 like |
| `qwen3.5-2b-self-reward-autonomy-s21` | 2,21 B | No disponible | Mismo protocolo, seed 21 (solo cambia el muestreo) | Apache 2.0 | HuggingFace |
| `qwen3.5-2b-self-reward-grading-s26` | 2,21 B | No disponible | Mismo protocolo, follow-up `grading`, seed 26 | Apache 2.0 | HuggingFace |
| Qwen/Qwen3.5-2B (base) | 2,21 B | No disponible | Preentrenamiento + alineación de Alibaba Cloud | Apache 2.0 | HuggingFace; perfil en Qualcomm AI Hub para inferencia on-device |

Frente al modelo base, la comparación relevante no es de rendimiento sino de comportamiento: el fine-tune sacrifica utilidad general (interesantez 2/5, degeneración mecánica) a cambio de un fenómeno emergente medible. No se dispone de comparaciones con modelos de otras familias (por ejemplo, Qwen3 pequeños o Llama de 1-3 B) en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo para uso: el autor lo describe explícitamente como artefacto de investigación, no como asistente desplegable.
- Degeneración documentada: bucles de repetición, respuestas vacías o de una sola palabra, plantillas de discurso repetitivas y cambio de idioma a chino.
- Sin verificación de seguridad: no se aplicó ningún entrenamiento ni filtro de seguridad más allá del que incorpora el modelo base.
- Riesgo de alucinación elevado y no medido: no hay evaluaciones de veracidad ni de consistencia factual.
- Sesgo de auto-recompensa: el modelo aprendió a puntuarse alto (media 9,0 al final) sin que ello correlacione con calidad; usar sus auto-evaluaciones como señal en otros sistemas propagaría ese sesgo.
- Idiomas: no hay lista oficial de idiomas soportados y el comportamiento multilingüe del fine-tune es errático (deriva al chino).
- Contexto: la longitud de contexto no está documentada; el entrenamiento trabajó con respuestas de hasta 4.096 tokens, y no se garantiza un comportamiento correcto más allá.
- Licencia Apache 2.0 permite uso comercial del artefacto, pero su calidad degenerada hace esa vía inviable en la práctica; el modelo base mantiene su propia licencia Apache 2.0.
- Trazabilidad de la evaluación: las puntuaciones de interesantez provienen de un evaluador automático con rúbrica calibrada sobre etiquetas de otro modelo, no de evaluación humana directa.
- Repositorio de 53,1 GB: descargar el repo completo es innecesario y costoso; hay que fijar `revision`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fjzzq2002/qwen3.5-2b-self-reward-autonomy-s26
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Código del proyecto: https://github.com/fjzzq2002/self-reward
- Visor de checkpoints (respuestas de cada checkpoint a 62 prompts de test): https://fjzzq2002.github.io/self-reward/
- Dataset de prompts de entrenamiento y test: https://huggingface.co/datasets/fjzzq2002/self-reward-dataset
- Run hermano (seed 21, autonomy): https://huggingface.co/fjzzq2002/qwen3.5-2b-self-reward-autonomy-s21
- Run hermano (seed 26, grading): https://huggingface.co/fjzzq2002/qwen3.5-2b-self-reward-grading-s26
- Perfil de Qwen3.5-2B en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_5_2b
- Ficha de Qwen3.5-2B en Awesome Agents: https://awesomeagents.ai/models/qwen-3-5-2b/
- Repositorio espejo de la serie Qwen3.5: https://github.com/ABDtmx/Qwen3.5
