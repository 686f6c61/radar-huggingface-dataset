# GMatherne/qwen3-8b-human-sft

## Resumen

Qwen3-8b-human-sft es un ajuste fino mediante QLoRA del modelo Qwen3-8B (en su variante no-thinking), desarrollado por el usuario GMatherne como artefacto educativo y de investigación. Su objetivo no es mejorar la capacidad bruta del modelo base, sino modificar su "voz": producir respuestas de tutoría educativa que suenen a prosa humana natural, evitando el registro característico de los asistentes de IA (relleno, hedging, listas de andamiaje y ritmo uniforme). El modelo se entrenó para responder como lo haría una persona experta en un foro, en primera persona y sin citar fuentes.

El modelo parte de `unsloth/Qwen3-8B`, una arquitectura transformer densa de 8.190.735.360 parámetros (8,19 mil millones). El ajuste se realizó con QLoRA de 4 bits sobre las siete proyecciones de atención y MLP, con rango `r=32` y `alpha=32`. El corpus de entrenamiento son aproximadamente 1.800 respuestas humanas curadas procedentes de StackExchange y Reddit (ELI5, AskScience, AskHistorians y sitios temáticos), filtradas para eliminar andamiaje de foro, citas fabricadas, enlaces, markdown y texto no inglés.

Es relevante ahora porque documenta de forma explícita y honesta un compromiso técnico poco habitual en las fichas de modelos: la ganancia en "humanidad" del texto se paga con una pérdida medible de precisión fáctica y un aumento de fabricaciones. El propio autor lo presenta como una demostración de "comportamiento a partir de datos", no como un tutor listo para producción. Existen dos variantes, SFT y DPO, siendo la SFT la que obtiene mejores resultados en la evaluación publicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen3-8B, modo no-thinking) |
| Parametros totales | 8.190.735.360 (8,19 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del base Qwen3-8B) |
| Tipos de cuantizacion | QLoRA 4-bit para entrenamiento; GGUF Q8_0 mencionado para Ollama; otras no disponibles |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 (heredada del modelo base) |
| Formato de pesos | safetensors (repo de 16,4 GB); GGUF para despliegue en Ollama |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del transformer denso Qwen3-8B, ejecutado en modo no-thinking (`enable_thinking=False`). El entrenamiento emplea QLoRA de 4 bits mediante la librería Unsloth, con configuración LoRA de `r=32`, `alpha=32`, dropout 0 y adaptadores aplicados a las siete proyecciones de atención y MLP. Se realizaron 2 épocas con tasa de aprendizaje `2e-4`, plantilla ChatML y `train_on_responses_only` (la pérdida se calcula únicamente sobre las respuestas del asistente). Existen dos variantes: una SFT (el ajuste supervisado) y una DPO (una pasada de ajuste por preferencias sobre la anterior).

El dato diferenciador es el corpus: unas 1.800 respuestas humanas de StackExchange y Reddit, limpiadas exhaustivamente para eliminar andamiaje de foro, citas fabricadas, enlaces, markdown y texto no inglés. El autor señala que el conjunto de datos es el verdadero producto y que el entrenamiento es una operación posterior casi mecánica. No se documentan innovaciones arquitectónicas propias (decodificación especulativa, atención lineal ni similares); la contribución es exclusivamente de datos y comportamiento.

## Capacidades

- Generación de texto conversacional en registro de foro: respuestas en primera persona, directas, sin relleno ni despedidas.
- Tutoría educativa: explicación de conceptos, ayuda con redacción y corrección de errores en prosa natural.
- Producción de texto que un detector de IA (Pangram) puede clasificar como escrito por humanos, según el objetivo declarado del ajuste.
- Respuesta como asistente de IA: el modelo no afirma ser una persona ni un producto.
- Capacidad multilingüe: limitada al inglés según la model card y los tags.
- Tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado; de hecho, el autor advierte un deterioro del seguimiento de instrucciones en tareas concisas o con formato restringido.
- Modo thinking: desactivado explícitamente en el entrenamiento.

## Casos de uso

- Investigación sobre control de comportamiento mediante datos: el modelo sirve como caso de estudio reproducible de cómo un corpus pequeño y curado (~1.800 ejemplos) modifica el registro estilístico de un modelo de 8 B, con métricas de coste asociadas.
- Generación de prosa educativa donde la precisión fáctica no es crítica: materiales de divulgación, borradores de explicaciones o ejemplos de estilo que se revisarán posteriormente por una persona.
- Evaluación de detectores de texto IA: banco de pruebas para medir la sensibilidad de herramientas como Pangram frente a ajustes finos orientados a "humanizar" la salida.
- Docencia sobre ajuste fino eficiente: ejemplo práctico de QLoRA con Unsloth, configuración de LoRA y limpieza de datasets de foros para cursos de aprendizaje automático.
- Despliegue local ligero: con cuantización GGUF Q8_0 y Ollama, cabe en equipos de consumo para experimentación sin conexión, dado su tamaño de 8 B.
- Estudio de alineación y calibración: la comparación SFT frente a DPO del propio autor ilustra cómo una pasada de preferencias puede degradar aún más la precisión (3,25 a 2,88 sobre 5) y la retención de información (64% a 56%).

## Benchmarks y rendimiento

Evaluación con LLM-as-judge (GPT-5) sobre 16 prompts educativos reservados, base frente a ajustado:

| Modelo | Precision /5 | Retencion de informacion | Respuestas con >=1 error | Fabricaciones confiadas |
|---|---|---|---|---|
| Qwen3-8B base (sin ajustar) | 4,56 | 65% | 3/16 | 1 |
| Este modelo - SFT | 3,25 | 64% | 11/16 | 12 |
| Este modelo - DPO | 2,88 | 56% | 15/16 | 11 |

La métrica de "humanidad" con el detector Pangram aparece sin puntuar en la model card (marcador pendiente de rellenar). El autor indica que el modelo base se lee como ~100% IA. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; para un transformer denso de 8,19 B, la huella típica ronda los 16 GB en FP16 y aproximadamente 8-9 GB en cuantización de 8 bits (Q8_0), aunque estas cifras son estimaciones de categoría y no datos publicados por el autor.
- GPU recomendadas: no especificadas en la información disponible. Por tamaño, el modelo es apto para GPUs de consumo de gama alta (por ejemplo, RTX 4090 con 24 GB) en FP16, y para GPUs profesionales (A100, H100) en escenarios de mayor throughput.
- Cabe en GPU de consumo: sí, especialmente con cuantización GGUF Q8_0; el formato GGUF está documentado para Ollama.
- Opciones de despliegue: Ollama (con GGUF Q8_0, mediante Modelfile) y Transformers (pesos fusionados con plantilla ChatML). vLLM, TGI y llama.cpp no se mencionan en la información proporcionada.
- Latencia y throughput: no disponibles.
- Parámetros de muestreo recomendados: `temperature=0.7`, `top_p=0.8`, `top_k=20`, `repetition_penalty=1.15`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision evaluada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-8b-human-sft (SFT) | 8,19 B | No disponible | 3,25/5 (16 prompts, juez GPT-5) | Apache-2.0 | Hugging Face (9 descargas) |
| Qwen3-8B base (unsloth) | ~8 B | No disponible | 4,56/5 (misma eval) | Apache-2.0 | Hugging Face |
| Variante DPO del mismo ajuste | 8,19 B | No disponible | 2,88/5 (misma eval) | Apache-2.0 | Hugging Face |

No se dispone de datos de benchmarks estándar ni de comparaciones con otros modelos de la misma categoría (por ejemplo, otros ajustes de Qwen3-8B orientados a estilo) en la información proporcionada.

## Limitaciones y advertencias

- Precisión fáctica degradada: la evaluación del autor muestra 11 de 16 respuestas con al menos un error frente a 3 de 16 del base, y 12 fabricaciones confiadas frente a 1.
- La variante DPO es peor que la SFT en todas las métricas publicadas (precisión 2,88, retención 56%, 15/16 con errores).
- No debe usarse como fuente de autoridad factual, matemáticas, código ni salidas con formato restringido (JSON, "responde en una palabra"); tiende a sobreexplicar y a ignorar restricciones de formato.
- Riesgo de alucinación elevado: el registro de foro favorece afirmaciones seguras pero incorrectas.
- El modelo puede seguir leyéndose como IA en algunos prompts; la métrica de humanidad con Pangram no está puntuada.
- Idiomas: solo inglés; no se documenta soporte multilingüe.
- Sesgos: no documentados explícitamente, pero el corpus procede de foros (StackExchange, Reddit) con los sesgos demográficos y temáticos inherentes a esas comunidades.
- Licencia Apache-2.0 permite uso comercial, pero el autor desaconseja explícitamente el uso en producción como tutor o fuente de hechos.
- Artefacto educativo: 9 descargas y 0 likes en el momento de la consulta; sin mantenimiento ni garantías documentadas.

## Enlaces

- Hugging Face: https://huggingface.co/GMatherne/qwen3-8b-human-sft
- Modelo base: https://huggingface.co/unsloth/Qwen3-8B
- Unsloth (repositorio): https://github.com/unslothai/unsloth
