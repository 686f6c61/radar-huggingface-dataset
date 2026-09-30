# davidheineman/opd-teacher-R1Distill-CampsitePuzzle-step149

## Resumen

`davidheineman/opd-teacher-R1Distill-CampsitePuzzle-step149` es un checkpoint de investigación publicado por David Heineman. Se trata de un ajuste fino de `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B` (1.777.088.000 parámetros reales según los safetensors) entrenado durante 150 pasos sobre peticiones de dificultad 0 del entorno `CampsitePuzzle`, con cuatro prompts y 16 rollouts por paso, sin filtrado de prompts DAPO. El propio autor lo etiqueta como "profesor" (teacher) para destilación on-policy específica de entorno.

Su relevancia no está en la capacidad generalista, sino en el papel que ocupa dentro de un pipeline de post-entrenamiento: sirve como modelo profesor en destilación on-policy (OPD), una técnica cuyo estudio sistemático aparece recogido en el paper arXiv 2604.13016. El modelo emplea GRPO sobre un marco denominado RLVE (`Reinforcement Learning from Vision-based Environments` según una descripción de terceros del checkpoint hermano, no confirmada por el autor) y se distribuye únicamente en formato safetensors.

Es un artefacto de nicho: cero descargas, cero likes, sin licencia declarada, sin idiomas declarados y sin benchmarks publicados en la información disponible. Debe tratarse como material de reproducibilidad de investigación, no como un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only, familia Qwen2 (etiqueta `qwen2` en HuggingFace) |
| Parámetros totales | 1.777.088.000 (~1,78 B, dato real de safetensors) |
| Parámetros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada; se hereda del modelo base DeepSeek-R1-Distill-Qwen-1.5B, pero no se confirma en esta ficha |
| Tipos de cuantización | no disponible; el repositorio solo publica safetensors, sin GGUF, AWQ ni GPTQ |
| Idiomas soportados | no disponible (la model card no declara idiomas) |
| Licencia | no disponible (la model card no declara licencia; el modelo base DeepSeek-R1-Distill-Qwen-1.5B se distribuye bajo MIT) |
| Formato de pesos | safetensors (tamaño de repositorio: 3,6 GB) |
| Modelo base | deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B |
| Autor | davidheineman |
| Proyecto de entrenamiento | `david-heineman/rl-data-opd-teachers-r1-distil` |
| Grupo de entrenamiento | `opd-teachers-r1-nofilter16-20260929-231458` |
| Fecha de publicación | 30 de septiembre de 2026 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base: un transformer denso decoder-only de la familia Qwen2, destilado originalmente de DeepSeek-R1 y con 1.777.088.000 parámetros. Sobre ese punto de partida, el autor aplica un ajuste con GRPO (Group Relative Policy Optimization) durante 150 actualizaciones sobre prompts de dificultad 0 del entorno `CampsitePuzzle`. La configuración declarada es de cuatro prompts por paso con 16 rollouts cada uno, lo que equivale a 64 generaciones por paso y aproximadamente 9.600 rollouts en el entrenamiento completo. No se aplicó filtrado de prompts DAPO, un detalle relevante para experimentos de ablación sobre el efecto del filtrado en la estabilidad del entrenamiento.

El checkpoint publicado es el paso 149, es decir, el índice final basado en cero que corresponde a la actualización número 150. El propósito declarado es servir como profesor en destilación on-policy específica de entorno: el profesor genera trayectorias de alta calidad en el entorno `CampsitePuzzle` que después se usan para supervisar a un modelo estudiante. En el checkpoint hermano basado en Qwen2.5-1.5B-Instruct, el autor indica que los pesos se convirtieron desde el checkpoint nativo final a safetensors y se validaron contra los nombres y formas de tensor del modelo base; en esta ficha no se declara explícitamente esa validación. El marco de entrenamiento se etiqueta como RLVE, cuya expansión exacta no está confirmada por el autor en la información disponible.

## Capacidades

- Generación de texto y razonamiento de cadena larga: capacidades heredadas del modelo base DeepSeek-R1-Distill-Qwen-1.5B, sin evaluación publicada específica para este checkpoint.
- Resolución del entorno `CampsitePuzzle` en dificultad 0: es la capacidad para la que fue entrenado explícitamente durante 150 pasos de GRPO.
- Generación de rollouts etiquetados: produce múltiples trayectorias por prompt, útil como señal de supervisión en destilación on-policy.
- Tool calling / function calling: no disponible; no se documenta soporte explícito.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad verificada; el entrenamiento en un entorno tipo puzle sugiere razonamiento multi-paso dentro de ese entorno concreto, pero no hay evidencia publicada.
- Capacidades multilingües: no disponible; la model card no declara idiomas.
- Capacidades de visión: no disponible. Una descripción de terceros del checkpoint hermano expande RLVE como `Reinforcement Learning from Vision-based Environments`, pero no hay confirmación del autor ni evidencia de que este checkpoint procese imágenes.
- Modo de pensamiento explícito: heredado potencialmente del modelo base (distilación de R1), sin verificación en este checkpoint.

## Casos de uso

- Profesor en destilación on-policy: el modelo genera trayectorias de referencia en `CampsitePuzzle` que un estudiante de menor tamaño imita token a token, aprovechando que fue entrenado específicamente para ese entorno.
- Reproducción del pipeline RLVE: dado que se publican el identificador de proyecto y el grupo de entrenamiento, sirve para replicar o auditar la receta de 4 prompts × 16 rollouts × 150 pasos.
- Ablación sobre filtrado DAPO: al declararse explícitamente que no se usó filtrado de prompts, permite comparar contra checkpoints entrenados con filtrado y medir su efecto en la convergencia.
- Generación de datos sintéticos de razonamiento: los rollouts del profesor pueden volcarse a un dataset de entrenamiento para estudiantes más pequeños, reduciendo el coste de anotación manual por verificador.
- Estudio de dinámicas de GRPO en tareas de recompensa verificable: con 64 rollouts por paso, el checkpoint es un punto de medida útil para analizar varianza de recompensa y colapso de modos.
- Línea base en investigación sobre destilación on-policy: el paper arXiv 2604.13016 estudia las condiciones de éxito de OPD, y este checkpoint encaja como caso de estudio de compatibilidad de patrones de pensamiento entre profesor y estudiante.
- Destilación hacia modelos de menos de 1 B: por su tamaño (1,78 B), un profesor de esta escala es asumible en una única GPU consumer, lo que facilita experimentos de destilación a estudiantes de 0,5 B desplegables en el borde.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni de tasa de éxito en `CampsitePuzzle`, y el repositorio registra 0 descargas y 0 likes, por lo que tampoco existen evaluaciones de terceros.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: en torno a 4-5 GB, incluyendo los ~3,55 GB de pesos (1,78 B × 2 bytes) más caché KV y overhead del runtime.
- VRAM estimada en int8: aproximadamente 2,5-3 GB.
- VRAM estimada en int4: aproximadamente 1,5-2 GB.
- GPU recomendadas: cualquier GPU consumer con 6 GB o más en bf16 (RTX 3060 12 GB, RTX 4060, RTX 4070, RTX 3080, RTX 4090). No requiere A100 ni H100; una A100 solo tendría sentido para servir muchas réplicas o para reentrenar.
- ¿Cabe en GPU consumer? Sí, con holgura, incluso en configuraciones de 8 GB.
- Opciones de despliegue: `transformers`, vLLM, TGI y SGLang con los safetensors publicados. Para llama.cpp u Ollama sería necesario convertir previamente a GGUF, ya que el repositorio no incluye cuantizaciones de ese tipo.
- Latencia y throughput: no disponible; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| opd-teacher-R1Distill-CampsitePuzzle-step149 | 1,78 B | no disponible | no disponible | Público en HuggingFace | Objeto de esta ficha; profesor OPD sobre base DeepSeek-R1-Distill-Qwen-1.5B |
| opd-teacher-Q2.5I-CampsitePuzzle-step149 | 1,5 B | no disponible | no disponible | Público en HuggingFace | Checkpoint hermano sobre Qwen2.5-1.5B-Instruct, mismo entorno y misma receta de 150 pasos GRPO |
| DeepSeek-R1-Distill-Qwen-1.5B | 1,78 B | no disponible en esta búsqueda | MIT (según su model card) | Público en HuggingFace | Modelo base generalista de razonamiento; referencia de capacidades antes del ajuste |
| Qwen2.5-1.5B-Instruct | 1,5 B | no disponible en esta búsqueda | Apache 2.0 (por confirmar en su model card) | Público en HuggingFace | Alternativa generalista de tamaño comparable, sin especialización en CampsitePuzzle |

No se dispone de comparativas de rendimiento entre estos modelos: no hay benchmarks publicados para ninguno de los dos checkpoints OPD.

## Limitaciones y advertencias

- Ausencia de licencia declarada: sin licencia explícita, el uso comercial es jurídicamente ambiguo, aunque el modelo base DeepSeek-R1-Distill-Qwen-1.5B sea MIT.
- Especialización extrema: entrenado solo sobre `CampsitePuzzle` en dificultad 0, con cuatro prompts por paso. Es probable una degradación notable fuera de esa distribución (olvido catastrofico), aunque no se han medido.
- Sin evaluación: no hay benchmarks, ni tasa de éxito en el entorno, ni comparación con el modelo base, por lo que no se puede cuantificar la ganancia del entrenamiento.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta; ningún tercero ha verificado el comportamiento del checkpoint.
- Riesgo de alucinación: heredado del modelo base, con el agravante de que el ajuste con recompensa de entorno puede sobreajustar al formato esperado y producir respuestas plausibles pero inválidas fuera de él.
- Idiomas no declarados: no hay garantía de comportamiento multilingüe; el entrenamiento se realizó presumiblemente en inglés.
- No es un asistente de propósito general: no debe desplegarse en atención al cliente, generación de código en producción ni tareas de agente sin una evaluación previa específica.
- Capacidades multimodales no confirmadas: pese a la etiqueta `rlve`, no hay evidencia de entrada de imagen.
- Conversión de pesos no declarada: a diferencia del checkpoint hermano, esta ficha no indica que los tensores se hayan validado contra los nombres y formas del modelo base, por lo que conviene comprobarlo antes de cargarlos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/davidheineman/opd-teacher-R1Distill-CampsitePuzzle-step149
- Checkpoint hermano (Qwen2.5-1.5B-Instruct): https://huggingface.co/davidheineman/opd-teacher-Q2.5I-CampsitePuzzle-step149
- Página del autor en HuggingFace: https://huggingface.co/davidheineman/models
- Ficha del modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- Paper sobre dinámicas de destilación on-policy: https://arxiv.org/abs/2604.13016
- Ficha de terceros del checkpoint hermano en Featherless: https://featherless.ai/models/davidheineman/opd-teacher-Q2.5I-CampsitePuzzle-step149
- Proyecto de entrenamiento (identificador): `david-heineman/rl-data-opd-teachers-r1-distil`
- Grupo de entrenamiento (identificador): `opd-teachers-r1-nofilter16-20260929-231458`
