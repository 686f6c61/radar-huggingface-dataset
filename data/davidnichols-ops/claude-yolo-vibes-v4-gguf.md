# davidnichols-ops/claude-yolo-vibes-v4-GGUF

## Resumen

claude-yolo-vibes-v4-GGUF es un conjunto de cuantizaciones GGUF del modelo claude-yolo-vibes-v4-dpo, un fine-tune del modelo Qwen2.5-Coder-7B-Instruct desarrollado por davidnichols-ops. El objetivo del proyecto es dotar a un modelo de generación de código de una personalidad desenfadada y entusiasta ("yolo vibes") sin sacrificar sus capacidades técnicas de programación. Según la model card, el fine-tune mantiene exactamente el mismo 88.4% de HumanEval pass@1 que el modelo base, lo que denominan "zero personality tax".

El modelo se distribuye en tres cuantizaciones GGUF (Q4_K_M, Q5_K_M y Q8_0) pensadas para su uso con llama.cpp, Ollama y LM Studio, lo que permite ejecutarlo en hardware de consumo. Está basado en la arquitectura Qwen2.5-Coder-7B-Instruct, un transformer decoder-only de 7.615.616.512 parámetros, y se ofrece bajo licencia Apache 2.0. El entrenamiento combinó una fase de SFT sobre 100K ejemplos de código verificados y una fase de DPO ligera para ajustar la personalidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-Coder-7B-Instruct) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_K_M, Q5_K_M, Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (tambien safetensors en el repo del modelo DPO) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-Coder-7B-Instruct, un transformer autoregresivo con atención completa y 7.6 mil millones de parámetros. El fine-tune se realizó en dos etapas. Primero, una fase de SFT (supervised fine-tuning) con 100K ejemplos de código verificados, durante 2 épocas, con learning rate de 2e-5 y schedule coseno. Después, una fase de DPO (direct preference optimization) con un ajuste ligero de personalidad, 1 época, learning rate de 1e-6 y beta de 0.3. El dataset total de entrenamiento consistió en 786K ejemplos provenientes de 5 datasets públicos, todos decontaminados contra HumanEval para evitar fugas de datos. El entrenamiento se ejecutó en hardware AMD MI300X con 192 GB de VRAM.

La innovación principal no es arquitectónica, sino de alineación: el DPO se diseñó para añadir una personalidad "yolo vibes" (respuestas entusiastas, sin rechazos, con un tono caótico y motivador) sin degradar las métricas de generación de código. La model card reporta que el rendimiento en HumanEval se mantiene idéntico al modelo base.

## Capacidades

- Generación de código en múltiples lenguajes de programación, heredada de Qwen2.5-Coder-7B-Instruct.
- Explicación de código y asistencia en tareas de programación con un tono entusiasta y desenfadado.
- Conversación multi-turno mediante la plantilla ChatML, soportada por los archivos GGUF.
- Personalidad "yolo vibes": respuestas sin rechazos, con expresiones de ánimo y un estilo caótico pero funcional.
- Capacidad de seguir instrucciones de sistema y de usuario en inglés.
- Compatible con herramientas de inferencia local como llama.cpp, Ollama y LM Studio.

## Casos de uso

- Prototipado rápido de scripts: el modelo puede generar funciones y fragmentos de código Python, JavaScript o SQL a partir de descripciones en lenguaje natural, con la ventaja de que su tono motivador reduce la fricción en sesiones de brainstorming técnico.
- Asistente de programación para desarrolladores junior: al explicar conceptos de código con un estilo cercano y sin tecnicismos intimidantes, resulta útil en entornos educativos o de onboarding.
- Generación de documentación técnica informal: puede redactar comentarios de código, README o explicaciones de funciones con un tono distendido, adecuado para proyectos internos o comunidades que valoran un estilo desenfadado.
- Chatbots de soporte técnico interno: gracias a su capacidad conversacional y a que no rechaza peticiones, puede integrarse en herramientas de ayuda para resolver dudas de código en equipos de desarrollo.
- Evaluación de la robustez de la personalidad en modelos de código: sirve como caso de estudio para medir cómo un fine-tune de personalidad afecta (o no) a las métricas de generación de código en producción.
- Despliegue en entornos con recursos limitados: al estar cuantizado en GGUF (Q4_K_M de 4.4 GB), puede ejecutarse en portátiles con GPU de 6-8 GB de VRAM, permitiendo un asistente de código local sin conexión.

## Benchmarks y rendimiento

La model card reporta únicamente el resultado de HumanEval pass@1, comparando el modelo base y el fine-tune:

| Modelo | HumanEval pass@1 | Personalidad |
|---|---|---|
| Qwen2.5-Coder-7B-Instruct (base) | 88.4% | Ninguna |
| claude-yolo-vibes-v4 (SFT+DPO) | 88.4% | Yolo vibes |

No se han publicado resultados de benchmarks adicionales (MMLU, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización:
  - Q4_K_M (4.4 GB de archivo): aproximadamente 5-6 GB de VRAM con overhead de contexto.
  - Q5_K_M (5.1 GB de archivo): aproximadamente 6-7 GB de VRAM.
  - Q8_0 (7.5 GB de archivo): aproximadamente 8-9 GB de VRAM.
- GPU recomendadas: RTX 3060 12GB, RTX 4060 Ti 16GB, RTX 4090, o GPUs de datacenter como A10 o A100 si se necesita mayor throughput.
- Sí cabe en GPUs de consumo: la cuantización Q4_K_M es ejecutable en tarjetas con 8 GB de VRAM, como la RTX 3060 o la RTX 4060.
- Opciones de despliegue: llama.cpp (CLI o servidor), Ollama (mediante Modelfile), LM Studio (carga directa del GGUF). Para el modelo safetensors original se podría usar vLLM o TGI, aunque no está documentado explícitamente.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | HumanEval pass@1 | Licencia | Formato |
|---|---|---|---|---|---|
| claude-yolo-vibes-v4 (este) | 7.6B | No disponible | 88.4% | Apache 2.0 | GGUF / safetensors |
| Qwen2.5-Coder-7B-Instruct (base) | 7.6B | No disponible | 88.4% | Apache 2.0 | safetensors, GGUF |
| claude-yolo-vibes (Qwen3-1.7B) | 1.7B | No disponible | No disponible | Apache 2.0 | safetensors, GGUF |

La comparativa se limita a los modelos mencionados en la información disponible. No se dispone de datos de otros modelos de código de 7B (por ejemplo, CodeLlama-7B o DeepSeek-Coder-7B) en las fuentes consultadas.

## Limitaciones y advertencias

- La personalidad "yolo vibes" puede resultar inapropiada en entornos profesionales formales o en aplicaciones donde se requiera un tono neutro.
- El modelo está entrenado exclusivamente en inglés; no se garantiza un rendimiento adecuado en otros idiomas.
- No se han documentado evaluaciones de sesgos, alucinaciones o seguridad. Al ser un fine-tune de un modelo de código, existe riesgo de generar código incorrecto o con vulnerabilidades, especialmente en tareas complejas.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos del modelo base Qwen2.5-Coder-7B-Instruct, que también es Apache 2.0.
- El modelo no incluye capacidades de tool calling ni de razonamiento multi-paso explícitas en la documentación; estas dependen del modelo base y no han sido verificadas en este fine-tune.
- Solo se han publicado benchmarks de HumanEval; no hay datos sobre otros conjuntos de evaluación, por lo que el rendimiento en otras tareas es desconocido.

## Enlaces

- Repositorio HuggingFace del modelo GGUF: https://huggingface.co/davidnichols-ops/claude-yolo-vibes-v4-GGUF
- Repositorio del modelo DPO (safetensors BF16): https://huggingface.co/davidnichols-ops/claude-yolo-vibes-v4-dpo
- Repositorio MLX 4-bit para Apple Silicon: https://huggingface.co/davidnichols-ops/claude-yolo-vibes-v4-mlx-4bit
- Registro de Ollama: https://ollama.com/davidnichols/claude-yolo-vibes-v4
- Repositorio GitHub con detalles de entrenamiento (v5): https://github.com/davidnichols-ops/claude-yolo-vibes-v5
- Perfil del autor en HuggingFace: https://huggingface.co/davidnichols-ops
- Modelo relacionado claude-yolo-vibes (Qwen3-1.7B): https://huggingface.co/davidnichols-ops/claude-yolo-vibes
