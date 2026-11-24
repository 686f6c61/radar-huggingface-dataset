# raquelfes11/dgm-arca-agent-sft-lora

## Resumen

dgm-arca-agent-sft-lora es un adaptador LoRA (Low-Rank Adaptation) publicado en Hugging Face por el usuario raquelfes11. No se trata de un modelo completo, sino de un conjunto de pesos de ajuste fino que debe cargarse sobre el modelo base Qwen/Qwen3-1.7B mediante la librería PEFT. El repositorio ocupa aproximadamente 0,1 GB, lo que es coherente con un adaptador de bajo rango y no con un modelo de pesos completos.

El nombre del artefacto sugiere un ajuste fino supervisado (SFT) orientado a agentes, probablemente en el contexto de un proyecto denominado "dgm-arca". Sin embargo, la model card es la plantilla por defecto de Hugging Face y no contiene información sustancial: ni descripción del dataset, ni hiperparámetros, ni resultados de evaluación, ni licencia. Todos los campos relevantes aparecen como "[More Information Needed]".

Por tanto, la relevancia práctica de este artefacto es limitada tal como está publicado: no hay evidencia documentada de capacidades, datos de entrenamiento ni rendimiento. Su interés es principalmente como ejemplo de adaptador LoRA sobre Qwen3-1.7B para tareas de agentes, y su utilidad real dependerá de la reproducibilidad del entrenamiento, que no está documentada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen3-1.7B |
| Parametros totales | no disponible (adaptador; el modelo base tiene 1,7 mil millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en el adaptador (heredada del modelo base Qwen3-1.7B) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA entrenado con PEFT 0.20.0 sobre Qwen/Qwen3-1.7B, un transformer decoder-only de 1,7 mil millones de parámetros. El adaptador modifica un subconjunto de las matrices de pesos del modelo base mediante descomposiciones de bajo rango, lo que permite ajustar el comportamiento sin reentrenar todos los parámetros. El tamaño del repositorio (0,1 GB) es consistente con un adaptador de rango moderado.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens, la composición de los datos, la presencia de RLHF/DPO, el régimen de precisión (fp16, bf16, fp32) ni los hiperparámetros del SFT. El sufijo "agent-sft" del nombre sugiere un ajuste supervisado orientado a comportamiento de agente, pero no hay documentación que lo confirme ni que detalle el formato de las trayectorias utilizadas.

## Capacidades

- No hay capacidades documentadas por el autor. La model card no describe ninguna.
- Por herencia del modelo base Qwen3-1.7B, cabe esperar generación de texto, razonamiento básico y cierta capacidad de código, pero no hay evaluación que lo respalde en este adaptador.
- El nombre sugiere un posible ajuste para uso como agente (tool calling, multi-step reasoning), pero no está verificado ni documentado.
- Capacidades multilingües: no disponible.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Evaluación experimental de adaptadores LoRA sobre Qwen3-1.7B: cargar el adaptador con PEFT y comparar su comportamiento frente al modelo base en tareas de agente, como paso previo a cualquier uso en producción.
- Reproducción de experimentos de SFT para agentes: si se dispone del código y los datos del proyecto "dgm-arca", el adaptador puede servir como punto de partida para replicar o extender el ajuste.
- Prototipado de asistentes conversacionales ligeros: el modelo base de 1,7 mil millones permite ejecución en hardware modesto, y el adaptador podría ajustar el estilo o el formato de respuesta si así se entrenó.
- Investigación sobre eficiencia de adaptación: comparar el tamaño del adaptador (0,1 GB) con el coste de un ajuste completo del modelo base para estudiar compromisos entre rendimiento y almacenamiento.
- Integración en pipelines de transformers con PEFT: servir el adaptador junto al modelo base mediante `PeftModel.from_pretrained` para pruebas controladas en entornos de desarrollo.
- Docencia y formación: usar el artefacto como ejemplo práctico de cómo se publica un adaptador LoRA en Hugging Face y de los riesgos de una model card incompleta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Qwen3-1.7B en fp16 requiere aproximadamente 3,4 GB de VRAM; en cuantización de 8 bits, alrededor de 1,7 GB; en 4 bits, en torno a 1 GB. El adaptador LoRA añade un coste marginal (del orden de decenas de MB).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16, como RTX 3050, RTX 4060 o superiores. Para mayor throughput, A10G, L4 o A100.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas modernas con 4 GB o más en fp16, y en tarjetas con 2 GB en cuantización de 4 bits.
- Opciones de despliegue: transformers + PEFT (carga del adaptador sobre el modelo base), vLLM con soporte de adaptadores LoRA, TGI con adaptadores, y llama.cpp/Ollama si se fusiona el adaptador con el modelo base y se convierte a GGUF.
- Latencia y throughput: no disponible; no hay mediciones publicadas para este adaptador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| dgm-arca-agent-sft-lora (este) | adaptador sobre 1,7 B | no disponible | no disponible | safetensors (PEFT) | Hugging Face, 0 descargas |
| Qwen/Qwen3-1.7B (base) | 1,7 B | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | safetensors | Hugging Face, oficial |
| Adaptadores LoRA comunitarios sobre Qwen3-1.7B | variable | heredado del base | variable | safetensors (PEFT) | Hugging Face |

La comparación con alternativas concretas no es posible con rigor porque no hay datos de rendimiento ni de licencia para este adaptador. La referencia natural es el propio modelo base Qwen3-1.7B, del que este artefacto depende.

## Limitaciones y advertencias

- Model card vacía: no hay información sobre datos de entrenamiento, sesgos, evaluación ni uso previsto. No es posible evaluar su calidad ni su idoneidad para producción.
- Licencia no disponible: no se puede asumir uso comercial permitido. El adaptador hereda las restricciones del modelo base, pero el autor no declara términos propios.
- Riesgo de alucinación: inherente al modelo base Qwen3-1.7B, sin mitigaciones documentadas en el adaptador.
- Sesgos: no documentados; al no conocerse el dataset de SFT, no se pueden identificar sesgos introducidos por el ajuste.
- Idiomas: no declarados; el comportamiento multilingüe puede diferir del modelo base si el SFT se hizo en un solo idioma.
- Reproducibilidad: sin hiperparámetros ni datos publicados, el entrenamiento no es reproducible.
- Adopción nula: 0 descargas y 0 likes en el momento de la consulta, sin señales de validación por parte de la comunidad.
- Uso en producción: desaconsejado sin una evaluación propia previa, dado que no hay benchmarks ni documentación de seguridad.

## Enlaces

- Hugging Face: https://huggingface.co/raquelfes11/dgm-arca-agent-sft-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Paper de PEFT/LoRA citado en los tags: https://arxiv.org/abs/1910.09700
- Librería PEFT: https://github.com/huggingface/peft
- Calculadora de impacto ambiental citada en la model card: https://mlco2.github.io/impact
