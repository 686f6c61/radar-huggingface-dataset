# helloelwin/ot-distill-qwen3-8b-new-data-v1-luna-6ep-lora

## Resumen

`ot-distill-qwen3-8b-new-data-v1-luna-6ep-lora` es un adaptador LoRA de tipo PEFT para el modelo base Qwen/Qwen3-8B, publicado por el usuario helloelwin dentro del proyecto ot-distill. El adaptador se obtiene por destilación (distillation) de trayectorias de agente generadas por "GPT-6 Luna" con el framework Terminus-2 sobre las tareas del dataset OpenThoughts-Agent-SFT-3.16K. No se trata de un modelo completo, sino de pesos delta que deben cargarse sobre Qwen3-8B o fusionarse con él.

El objetivo declarado es transferir al modelo base las capacidades de razonamiento y ejecución de agentes observadas en las trazas del profesor, incluyendo la estructura de pensamiento (`<think>`) que recoge el resumen de razonamiento del modelo docente. El repositorio ocupa 5.6 GB e incluye cuatro carpetas de checkpoints (`epoch-1`, `epoch-2`, `epoch-4`, `epoch-6`), correspondientes a distintos puntos del entrenamiento de 6 épocas.

Es relevante ahora porque ejemplifica una práctica creciente en IA abierta: destilar comportamiento agéntico desde modelos propietarios hacia modelos abiertos de 8 mil millones de parámetros mediante LoRA, con recetas reproducibles (rank, learning rate, batch, truncado) y checkpoints intermedios. Sin embargo, la model card es mínima, no hay benchmarks publicados ni licencia declarada, y el número de descargas es cero en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-8B) con adaptador LoRA (PEFT) |
| Parametros totales | 8 mil millones en el modelo base; el adaptador LoRA es un delta de tamaño no especificado (repo de 5.6 GB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (truncado de entrenamiento); contexto nativo del base Qwen3-8B no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; cuantizacion aplicable al fusionar con el base) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-8B, un transformer decoder-only de 8 mil millones de parámetros, mediante LoRA con rango 128, alpha 256, dropout 0.05 y activación en todas las capas lineales. El entrenamiento usa precisión bf16, batch efectivo de 16 y una tasa de aprendizaje máxima de 3e-4 con decaimiento coseno a lo largo de 6 épocas (1.176 pasos totales) tras un calentamiento del 3% (35 pasos). La pérdida se calcula sobre todos los turnos del asistente y las secuencias se renderizan con los marcadores `<|im_start|>`/`<|im_end|>` de Qwen3 alrededor del texto literal del turno, no con la plantilla de chat, truncando a 32.768 tokens.

Los datos de entrenamiento provienen del dataset `helloelwin/ot-distill-gpt-6-luna-3.16k-sft`, con 3.134 filas de trayectorias del agente Terminus-2 generadas por "GPT-6 Luna" sobre las tareas OpenThoughts-Agent-SFT-3.16K. La pérdida media por época descendió de 0.945 a 0.201 a lo largo de las seis épocas. El autor documenta un intento previo con learning rate 5e-4 que divergió a mitad de la época 2 y fue descartado, optando por 3e-4 sin picos de pérdida. Se recomienda muestrear con temperatura 1.0, ya que con el valor por defecto de Qwen3 (0.6) los estudiantes anteriores entraban en bucles.

## Capacidades

- Generación de texto y razonamiento mediado por el bloque `<think>`, que recoge el resumen de razonamiento del profesor.
- Ejecución de tareas agénticas multi-paso, al estar destilado sobre trayectorias del agente Terminus-2.
- Uso de herramientas y entornos de agente en la medida en que las trazas de entrenamiento lo cubren (no se detalla qué herramientas).
- Razonamiento sobre tareas del conjunto OpenThoughts-Agent-SFT-3.16K.
- Capacidades multilingües: no disponible.
- Capacidades de visión o audio: no disponibles (el base Qwen3-8B es solo texto).
- Modo de pensamiento explícito: sí, mediante el bloque `<think>`.

## Casos de uso

- Evaluación de destilación agéntica: servir el adaptador sobre Qwen3-8B con vLLM y comparar las trayectorias generadas con las del profesor en tareas de OpenThoughts-Agent-SFT-3.16K para medir la fidelidad de la destilación.
- Investigación sobre razonamiento explícito: analizar el contenido de los bloques `<think>` producidos por el estudiante frente a los resúmenes del profesor, para estudiar qué parte del razonamiento se transfiere vía LoRA.
- Prototipos de agentes autónomos en entornos controlados: usar el modelo fusionado como política de agente en pipelines de investigación, dado que fue entrenado sobre trazas de Terminus-2 con contexto de hasta 32.768 tokens.
- Experimentos de ajuste fino comparativos: emplear los checkpoints `epoch-1`, `epoch-2`, `epoch-4` y `epoch-6` para estudiar el efecto del número de épocas en el comportamiento agéntico y en la tendencia a bucles.
- Base para destilaciones posteriores: partir de este adaptador como inicialización LoRA en nuevos ciclos de destilación sobre datasets de agentes ampliados.
- Estudio de estabilidad de entrenamiento: reproducir la receta (rank 128, alpha 256, lr 3e-4, 6 épocas) y contrastarla con la divergencia observada a lr 5e-4 documentada por el autor.
- Despliegue experimental en inferencia con vLLM usando `--enable-lora --max-lora-rank 128`, adecuado para entornos de laboratorio más que para producción dada la ausencia de evaluaciones publicadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que las evaluaciones de desalineación (StrongREJECT, XSTest, CoCoNot, MASK y agentic misalignment) están en curso y que los resultados se añadirán más adelante.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para el modelo base Qwen3-8B fusionado, en bf16 se requieren aproximadamente 16 GB de pesos, y en cuantizaciones de 8 y 4 bits aproximadamente 8 GB y 4-5 GB respectivamente (estimación orientativa, no confirmada por el autor).
- GPU recomendadas: no disponible en la información proporcionada. Para el base de 8B en bf16 son adecuadas GPU con 24 GB o más (por ejemplo RTX 4090, A100 40 GB, H100).
- Compatibilidad con GPU de consumo: probable en RTX 4090 (24 GB) con bf16 o cuantización; en GPUs de 16 GB solo con cuantización de 4-8 bits. No confirmado.
- Opciones de despliegue: vLLM con soporte LoRA (`vllm serve Qwen/Qwen3-8B --enable-lora --max-lora-rank 128 --lora-modules luna6-e6=<ruta>`), o fusión con PEFT (`PeftModel.from_pretrained(base, path).merge_and_unload()`). Otras opciones (llama.cpp, Ollama, TGI) no están documentadas para este adaptador.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ot-distill-qwen3-8b-new-data-v1-luna-6ep-lora | 8B (base) + LoRA | 32.768 (truncado de entrenamiento) | Adaptador LoRA destilado | no disponible | Hugging Face (0 descargas) |
| Qwen/Qwen3-8B | 8B | no disponible en la informacion proporcionada | Modelo base abierto | no disponible en la informacion proporcionada | Hugging Face (modelo base) |
| helloelwin/ot-distill-qwen3-8b-new-data-v1-luna-lora | 8B (base) + LoRA | 32.768 (truncado de entrenamiento) | Adaptador LoRA, 3 épocas | no disponible | Hugging Face (mismo autor, mismo dataset) |

No se dispone de datos de rendimiento comparativo entre estas variantes; la model card no publica benchmarks.

## Limitaciones y advertencias

- No hay benchmarks publicados: no es posible evaluar su calidad frente al modelo base ni frente a otros adaptadores.
- Las evaluaciones de seguridad y desalineación están pendientes; el comportamiento en términos de sesgos, rechazo y alineación es desconocido.
- Licencia no declarada: no está claro si se permite uso comercial. El modelo base Qwen3-8B tiene su propia licencia que debe consultarse por separado.
- Idiomas soportados no documentados; el dataset de destilación parece centrado en tareas de agente en inglés, por lo que el rendimiento en castellano es incierto.
- Es un adaptador LoRA, no un modelo autónomo: requiere cargar Qwen3-8B y aplicar el delta, o fusionarlo; su comportamiento depende del base.
- El autor advierte que con la temperatura por defecto de Qwen3 (0.6) los estudiantes anteriores entraban en bucles; se recomienda temperatura 1.0, lo que puede afectar la reproducibilidad.
- Riesgo de alucinación y de imitación de errores del profesor: al destilar trayectorias de un modelo propietario, el estudiante puede heredar sesgos y fallos del docente.
- El truncado a 32.768 tokens limita el entrenamiento a esa ventana; entradas más largas quedan fuera del régimen entrenado.
- Repositorio con 0 descargas y 0 likes: no hay validación por parte de la comunidad.
- El nombre "GPT-6 Luna" no corresponde a un modelo verificable en la información proporcionada; conviene tratar la procedencia del profesor con cautela.

## Enlaces

- Hugging Face (adaptador): https://huggingface.co/helloelwin/ot-distill-qwen3-8b-new-data-v1-luna-6ep-lora
- Dataset de destilación: https://huggingface.co/datasets/helloelwin/ot-distill-gpt-6-luna-3.16k-sft
- Variante de 3 épocas: https://huggingface.co/helloelwin/ot-distill-qwen3-8b-new-data-v1-luna-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
