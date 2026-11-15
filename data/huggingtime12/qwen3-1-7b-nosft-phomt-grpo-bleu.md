# huggingtime12/Qwen3-1.7B-noSFT-PhoMT-GRPO-BLEU

## Resumen

Qwen3-1.7B-noSFT-PhoMT-GRPO-BLEU es un adaptador LoRA publicado por el usuario huggingtime12 sobre el modelo base Qwen/Qwen3-1.7B. El identificador del repositorio sugiere una especialización en traducción automática entre vietnamita e inglés (PhoMT es un corpus público de traducción vietnamita-inglés) y un entrenamiento mediante GRPO (Group Relative Policy Optimization), una variante de aprendizaje por refuerzo utilizada en modelos con razonamiento. El sufijo "noSFT" indica que el adaptador se entrenó sin una fase previa de supervisión fina, y "BLEU" apunta a que la recompensa del proceso de RL se basó en la métrica BLEU de traducción.

El modelo se distribuye exclusivamente como pesos de adaptador PEFT en formato safetensors, con un tamaño de repositorio de aproximadamente 0,3 GB, lo que corresponde a los pesos del adaptador y no al modelo completo. Para utilizarlo es necesario descargar el modelo base Qwen3-1.7B y cargar el adaptador mediante la librería PEFT. La model card está prácticamente vacía: no documenta datos de entrenamiento, hiperparámetros, licencia, idiomas ni resultados de evaluación.

La relevancia de esta ficha es limitada y debe interpretarse con cautela. Se trata de un experimento de ajuste fino con refuerzo sobre un modelo pequeño (1.700 millones de parámetros), sin métricas publicadas, sin licencia declarada y sin descargas ni interacciones en el momento de la consulta. Es útil como referencia técnica para quienes investigan GRPO aplicado a traducción automática, pero no constituye una opción recomendable para producción sin una evaluación independiente previa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Qwen3-1.7B) con adaptador LoRA (PEFT) |
| Parámetros totales | 1.700 millones en el modelo base; tamaño del adaptador no disponible |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el modelo base Qwen3-1.7B soporta contexto largo, pero el valor exacto no se confirma aquí) |
| Tipos de cuantización | no disponible (el adaptador se distribuye en safetensors; el modelo base admite cuantización estándar de la familia Qwen3) |
| Idiomas soportados | no disponibles (el nombre del repositorio sugiere vietnamita e inglés por el corpus PhoMT, sin confirmación documental) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el modelo base Qwen/Qwen3-1.7B |
| Librería | peft 0.18.0, transformers, trl |
| Tamaño del repositorio | 0,3 GB |
| Pipeline | text-generation |
| Fecha de creación | 2026-11-14 |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-1.7B, un transformer decoder-only de la familia Qwen3. El ajuste se realizó con LoRA, lo que congela los pesos del modelo base e introduce matrices de bajo rango entrenables, reduciendo drásticamente el coste de memoria y cómputo frente a un ajuste completo. El entrenamiento utilizó GRPO, un algoritmo de optimización por refuerzo sin modelo crítico (critic-free) que estima la ventaja de cada respuesta comparándola con la media de un grupo de muestras generadas para el mismo prompt. Según el nombre del repositorio, la función de recompensa se basó en BLEU, métrica habitual en traducción automática.

El prefijo "noSFT" indica que no se realizó una fase de ajuste supervisado previa al refuerzo, lo que es poco habitual: en la mayoría de pipelines de RLHF/GRPO se parte de un modelo ya alineado con SFT para estabilizar el entrenamiento. No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset, los hiperparámetros de LoRA (rango, alpha, dropout), la tasa de aprendizaje ni la duración del entrenamiento. Tampoco hay documentación sobre el formato de las recompensas, el tamaño de los grupos de GRPO o si se aplicaron técnicas de decodificación especulativa o atención lineal. Toda esta información figura como "[More Information Needed]" en la model card original.

## Capacidades

- Generación de texto conversacional y de un solo turno, heredada del modelo base Qwen3-1.7B.
- Traducción automática presumible entre vietnamita e inglés, según la referencia a PhoMT en el identificador del repositorio; no confirmado en la documentación.
- Razonamiento básico y respuesta a instrucciones, limitado por el tamaño del modelo base.
- Generación de código y matemáticas a nivel de un modelo de 1.700 millones de parámetros, sin garantías de calidad específicas para este adaptador.
- Soporte de tool calling y function calling: no documentado para este adaptador; el modelo base Qwen3 incluye capacidades de agente, pero no se confirma que el ajuste las preserve.
- Soporte multilingüe: no disponible; el modelo base Qwen3 es multilingüe, pero el adaptador podría haber degradado idiomas no presentes en el corpus de entrenamiento.
- Modo "thinking": no documentado para este adaptador.

## Casos de uso

- Investigación en RL para traducción automática: el adaptador sirve como caso de estudio de GRPO con recompensa BLEU sobre un modelo pequeño, útil para reproducir experimentos y comparar curvas de aprendizaje frente a pipelines con SFT previo.
- Prototipado de traducción vietnamita-inglés en entornos de bajo recurso: al requerir solo el modelo base de 1.700 millones más un adaptador de 0,3 GB, puede desplegarse en una GPU de consumo para pruebas de concepto, siempre que se valide la calidad con un conjunto de evaluación propio.
- Evaluación comparativa de adaptadores PEFT: permite medir el efecto de entrenar sin SFT previo frente a adaptadores equivalentes con SFT, aislando la contribución del algoritmo de refuerzo.
- Generación de texto ligera en local: con cuantización del modelo base, puede ejecutarse en portátiles con GPU modestas para tareas de generación de texto no críticas, aunque sin garantías de calidad.
- Fines educativos: ilustra el flujo completo de PEFT + TRL + GRPO, incluyendo la carga del adaptador con `PeftModel` y `transformers`, útil en cursos y talleres de ajuste fino.
- Base para nuevos experimentos de RL: el adaptador puede servir como punto de partida para continuar el entrenamiento con otras funciones de recompensa (por ejemplo, COMET o métricas humanas) y comparar la estabilidad del proceso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Qwen3-1.7B en bf16 requiere aproximadamente 3,4 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, entre 4 y 6 GB para contextos moderados. En cuantización de 8 bits, alrededor de 2 GB; en 4 bits, alrededor de 1,2 GB. El adaptador LoRA añade una cantidad marginal de memoria (del orden de decenas de MB a pocos cientos de MB).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bf16 (RTX 3060 Ti, RTX 4060, RTX 3070); para cuantización 4 bits, GPUs con 4-6 GB como GTX 1650 Super o RTX 3050. Para despliegue en servidor, A100, H100 o L40S son sobredimensionadas para este tamaño y solo se justifican por concurrencia.
- Cabe en GPU de consumo: sí, en la mayoría de GPUs modernas con al menos 6-8 GB de VRAM, especialmente con cuantización.
- Opciones de despliegue: transformers + peft para cargar el adaptador; vLLM y TGI admiten adaptadores LoRA, aunque la compatibilidad exacta con esta versión de PEFT debe verificarse; llama.cpp y Ollama requerirían convertir el adaptador a GGUF, proceso no documentado para este repositorio.
- Latencia y throughput estimados: no disponibles. Para un modelo de 1.700 millones de parámetros, en una RTX 4090 se espera un throughput del orden de decenas a cientos de tokens por segundo, pero no hay mediciones publicadas para este adaptador concreto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen3-1.7B-noSFT-PhoMT-GRPO-BLEU | 1.700 M (base) + adaptador LoRA | no disponible | no disponible | Hugging Face, 0 descargas | Adaptador experimental de traducción con GRPO |
| Qwen/Qwen3-1.7B (base) | 1.700 M | no disponible en esta ficha | licencia de Qwen3 (no confirmada aquí) | Hugging Face, ampliamente usado | Modelo base sin ajuste específico de traducción |
| Adaptadores LoRA de traducción sobre Qwen3-1.7B | 1.700 M (base) + adaptador | depende del adaptador | varía | Hugging Face | No se dispone de comparativas publicadas con este adaptador concreto |
| Modelos de traducción dedicados de tamaño similar (por ejemplo, NLLB-200 distilled 1.3B) | 1.300 M | no disponible | CC-BY-NC (NLLB) | Hugging Face | Especializado en traducción multilingüe, con benchmarks publicados |

No se dispone de datos de rendimiento comparables para este adaptador, por lo que la comparativa se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Ausencia total de documentación: la model card es una plantilla sin rellenar; no hay información sobre datos, hiperparámetros, licencia ni evaluación.
- Licencia no declarada: no se puede garantizar el uso comercial. La licencia del adaptador podría estar sujeta además a la licencia del modelo base Qwen3-1.7B, que debe consultarse por separado.
- Riesgo elevado de alucinación y degradación: al entrenarse sin SFT previo y con una recompensa basada en BLEU, el modelo puede producir traducciones literalmente correctas pero poco naturales, o generar texto incoherente fuera del dominio de traducción.
- Sesgos desconocidos: no se documenta la composición del corpus PhoMT ni posibles sesgos de género, registro o dominio presentes en él.
- Limitaciones de idioma: si el adaptador se entrenó solo con vietnamita-inglés, es probable que haya degradado el rendimiento multilingüe del modelo base en otros idiomas.
- Sin validación independiente: cero descargas y cero interacciones en el momento de la consulta; no hay evidencia de que el adaptador funcione según lo que sugiere su nombre.
- Caveat para producción: no debe desplegarse en sistemas reales sin una evaluación propia con un conjunto de test representativo y sin aclarar la licencia.
- Fecha de creación futura (2026-11-14): el repositorio parece reciente o con metadatos inconsistentes; conviene verificar su estado actual antes de usarlo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingtime12/Qwen3-1.7B-noSFT-PhoMT-GRPO-BLEU
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Paper de referencia sobre impacto ambiental citado en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ML: https://mlco2.github.io/impact
- Documentación de PEFT: https://huggingface.co/docs/peft
- Documentación de TRL (GRPO): https://huggingface.co/docs/trl
- Corpus PhoMT (referencia del identificador, no enlazado en la model card): no disponible en la información proporcionada.
