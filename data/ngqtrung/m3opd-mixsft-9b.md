# ngqtrung/M3OPD-MixSFT-9B

## Resumen

M3OPD-MixSFT-9B es un ajuste fino completo (full-parameter SFT) del modelo multimodal Qwen3.5-9B, desarrollado por el usuario ngqtrung como parte del trabajo M3OPD-Reasoner. El modelo se entrena sobre una mezcla de datos SFT de tres dominios: trazas de razonamiento STEM sobre imagen, trazas de percepción visual y 311.396 trazas autogeneradas por Qwen3.5-9B para preguntas de vídeo que no forman parte del dataset M3OPD-SFT-1.35M. El checkpoint publicado corresponde al paso 1456, que marca el punto de partida del baseline de RL (M3OPD-MixRL-Baseline-9B).

Se trata de un baseline, no del modelo principal de la receta, por lo que su relevancia es metodológica: sirve como referencia para evaluar la contribución del entrenamiento por refuerzo posterior. El modelo hereda la arquitectura, tokenizer, processor y chat template de Qwen3.5-9B, con 9.409.813.744 parámetros totales y pesos en safetensors (repo de 18,8 GB). La licencia es Apache 2.0, la misma del modelo base.

La propuesta se enmarca en la investigación sobre destilación on-policy y razonamiento multimodal, con soporte de entrada imagen-texto y generación de texto con modo thinking habilitado. No se han publicado datos de benchmarks ni listado de idiomas soportados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (hereda la de Qwen3.5-9B); detalles internos no disponibles |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 40.960 tokens (valor usado en el ejemplo de despliegue con vLLM; contexto máximo nativo no confirmado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-9B y conserva su arquitectura, tokenizer, processor y chat template, por lo que es compatible con los mismos runners (Transformers, vLLM, SGLang). El ajuste es de parámetros completos (full-parameter SFT) sobre una mezcla de datos de tres dominios: las trazas autogeneradas de STEM sobre imagen y de percepción visual del dataset M3OPD-SFT-1.35M, más 311.396 trazas autogeneradas por Qwen3.5-9B para preguntas de vídeo que no están incluidas en dicho dataset. El checkpoint publicado corresponde al paso 1456 de entrenamiento.

El entrenamiento y la evaluación se realizan con la chat template nativa de Qwen3.5, thinking habilitado, sin system prompt y con una línea de formato de respuesta tras la pregunta (por ejemplo, `Put your final answer within \boxed{}.`). No se especifican en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO; el modelo se presenta explícitamente como baseline previo a la fase de RL (MixRL).

## Capacidades

- Generación de texto con razonamiento multimodal: procesa entradas imagen-texto y produce respuestas razonadas (pipeline `image-text-to-text`).
- Modo thinking: el autor indica que se entrena y evalúa con thinking habilitado en la chat template nativa.
- Razonamiento STEM sobre imagen: el dataset de entrenamiento incluye trazas de razonamiento científico-técnico a partir de imágenes.
- Percepción visual: incluye trazas específicas de percepción sobre imagen.
- Razonamiento sobre vídeo: incorpora 311.396 trazas de preguntas de vídeo generadas por el modelo base.
- Formato de respuesta controlado: admite instrucciones de formato como el recubrimiento de la respuesta final en `\boxed{}`.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Investigación en destilación on-policy: el modelo sirve como baseline SFT para comparar la ganancia de la fase de RL (M3OPD-MixRL-Baseline-9B), permitiendo aislar el efecto del entrenamiento por refuerzo en razonamiento multimodal.
- Reproducción de recetas de razonamiento multimodal: al compartir arquitectura y chat template con Qwen3.5-9B, se puede desplegar con vLLM o SGLang y reproducir las condiciones de evaluación del paper (thinking activado, sin system prompt, formato `\boxed{}`).
- Razonamiento STEM a partir de imágenes: resolución de problemas científico-técnicos donde la entrada combina una imagen (diagrama, gráfico, ecuación) y una pregunta textual, aprovechando las trazas de entrenamiento de ese dominio.
- Descripción y percepción visual estructurada: tareas de análisis de imagen que requieren una cadena de razonamiento explícita antes de la respuesta final, útil en pipelines de anotación asistida.
- Preguntas y respuestas sobre vídeo: análisis de contenido audiovisual con razonamiento textual, gracias a las trazas de vídeo incluidas en el entrenamiento.
- Punto de partida para ajustes posteriores: al ser un checkpoint intermedio con licencia Apache 2.0 y pesos safetensors, puede reutilizarse como base para SFT o RL adicionales en dominios específicos.
- Evaluación comparativa de checkpoints: dentro de la colección M3OPD-Reasoner, permite medir la evolución del rendimiento entre el paso 1456 y los checkpoints posteriores de la receta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo de pesos ocupa 18,8 GB en safetensors; en precisión nativa (probablemente BF16) se requiere aproximadamente esa cifra más overhead de activaciones y KV cache. Con cuantización a 8 bits o 4 bits la huella se reduciría, pero no se han publicado tipos de cuantización para este modelo.
- GPU recomendadas: para inferencia en BF16 sin cuantizar, GPU con 24 GB o más (RTX 4090, L40S, A100 40/80 GB, H100). El contexto de 40.960 tokens usado en el ejemplo de vLLM incrementa notablemente la memoria de KV cache, por lo que contextos largos exigen GPU de 40-80 GB.
- ¿Cabe en GPU de consumo? Sí, en tarjetas de 24 GB como la RTX 4090 en BF16 con contexto moderado, o en GPUs de 16 GB si se aplica cuantización (no confirmada por el autor).
- Opciones de despliegue: vLLM (`vllm serve ngqtrung/M3OPD-MixSFT-9B --max-model-len 40960`), SGLang y Transformers, según indica el autor. No se menciona soporte GGUF/llama.cpp/Ollama.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Estado |
|---|---|---|---|---|---|
| M3OPD-MixSFT-9B | 9,41 B | 40.960 (usado en despliegue) | Imagen-texto | Apache 2.0 | Baseline SFT, paso 1456 |
| Qwen3.5-9B (base) | no disponible | no disponible | Imagen-texto | Apache 2.0 | Modelo base oficial |
| M3OPD-MixRL-Baseline-9B | no disponible | no disponible | Imagen-texto | no disponible | Baseline RL de la misma receta |

No se dispone de datos de rendimiento comparado entre estos modelos en la información proporcionada; la comparativa se limita a parámetros, licencia y relación dentro de la receta.

## Limitaciones y advertencias

- Es un baseline intermedio, no el modelo principal de la receta M3OPD-Reasoner; el autor lo indica explícitamente. No debe presentarse como el resultado final del trabajo.
- No se han publicado benchmarks, por lo que no hay evidencia cuantitativa de su calidad frente al modelo base u otras alternativas.
- No se especifican los idiomas soportados; se desconoce el comportamiento fuera del inglés y de los idiomas cubiertos por Qwen3.5-9B.
- Riesgo de alucinación inherente a los modelos generativos y, en particular, a las trazas autogeneradas por el propio modelo base usadas como datos de entrenamiento (self traces), que pueden propagar errores.
- Sesgos conocidos: no documentados en la información disponible; al heredar el modelo base, es previsible que arrastre sus sesgos, pero no hay confirmación del autor.
- El contexto máximo nativo no está confirmado; el valor de 40.960 tokens proviene del ejemplo de despliegue, no de una especificación formal.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.5-9B y de los datasets empleados.
- El formato de respuesta esperado (`\boxed{}`) y la ausencia de system prompt forman parte de las condiciones de entrenamiento; desviarse de ellas puede degradar el rendimiento en producción.
- No se documentan tipos de cuantización ni soporte GGUF, lo que limita el despliegue en entornos de bajos recursos sin trabajo adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ngqtrung/M3OPD-MixSFT-9B
- Modelo base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Dataset M3OPD-SFT-1.35M: https://huggingface.co/datasets/ngqtrung/M3OPD-SFT-1.35M
- Dataset M3OPD-RL-193K: https://huggingface.co/datasets/ngqtrung/M3OPD-RL-193K
- Checkpoint M3OPD-MixRL-Baseline-9B: https://huggingface.co/ngqtrung/M3OPD-MixRL-Baseline-9B
- Colección M3OPD-Reasoner: https://huggingface.co/collections/ngqtrung/m3opd-reasoner-6aed5164d151b6643a1b3b2d
