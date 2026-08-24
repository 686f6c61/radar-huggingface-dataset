# agentic-ptb/sol-max-v2.h026.pi-agent-sft-v12-depth.step_500

## Resumen

El modelo `agentic-ptb/sol-max-v2.h026.pi-agent-sft-v12-depth.step_500` es un checkpoint intermedio de un proceso de fine-tuning (SFT) sobre el modelo base `Qwen/Qwen3.5-9B-Base`, publicado por el usuario `agentic-ptb` en Hugging Face. Forma parte de un barrido de entrenamiento denominado "AgentPTB", concretamente de la celda `sol-max-v2`, que utiliza como driver el modelo Codex / gpt-5.6-sol con un esfuerzo de razonamiento máximo. El checkpoint fue guardado a las 26,34 horas de una ejecución planificada de 100 horas, por lo que representa un punto intermedio en la curva de entrenamiento, no un modelo final.

Con 9.409.813.744 parámetros (aproximadamente 9,4B), el modelo hereda la arquitectura de visión de Qwen3.5 (Qwen3_5ForConditionalGeneration), aunque el proceso de fine-tuning parece orientado a tareas de agente (el nombre incluye "pi-agent-sft"). El repositorio pesa 18,8 GB en formato safetensors con 4 shards. La relevancia de este checkpoint es principalmente investigadora: permite estudiar la evolución del rendimiento a lo largo del tiempo de entrenamiento, ya que el identificador del repositorio codifica la hora exacta de la ejecución en la que se guardó.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (basada en Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 (9,4B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (hereda del base, no especificado) |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponible (hereda del base, no especificado) |
| Licencia | no disponible |
| Formato de pesos | safetensors (4 shards, 18,8 GB) |

## Arquitectura y entrenamiento

El modelo se basa en `Qwen/Qwen3.5-9B-Base`, que emplea la arquitectura `Qwen3_5ForConditionalGeneration`, una variante con torre de visión integrada. Sin embargo, el proceso de fine-tuning descrito en la model card indica que el modelo se sirve como texto únicamente, y se advierte que al cargarlo con vLLM es necesario especificar `--limit-mm-per-prompt '{"image": 0, "video": 0}'` para evitar errores de carga.

El entrenamiento forma parte de un barrido llamado "AgentPTB", donde la celda `sol-max-v2` utiliza como driver el modelo Codex / gpt-5.6-sol con razonamiento máximo. El checkpoint corresponde al paso 500 de una ejecución de 100 horas, y se describe como un "sweep checkpoint" de tipo intermedio. La model card confirma que el `eos_token_id` es correcto (248046, correspondiente a `<|im_end|>`), lo que garantiza que el modelo detiene correctamente las respuestas al final de cada turno. No se proporcionan detalles sobre el dataset de entrenamiento, el número de tokens ni si se aplicaron técnicas como RLHF o DPO; solo se menciona "SFT" (supervised fine-tuning).

## Capacidades

- Generación de texto: al ser un fine-tuning de Qwen3.5-9B-Base, hereda las capacidades de generación de texto del modelo base, aunque no se especifican mejoras concretas.
- Razonamiento y agentes: el nombre del checkpoint ("pi-agent-sft") sugiere un fine-tuning orientado a tareas de agente, pero no hay documentación que detalle las capacidades específicas adquiridas.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; se heredan del modelo base, pero no se confirma.
- Capacidades de visión: la arquitectura incluye torre de visión, pero el proceso de exportación no incluye `preprocessor_config.json`, por lo que el modelo se sirve como texto únicamente.

## Casos de uso

- Investigación sobre la dinámica del entrenamiento: este checkpoint permite a los investigadores analizar cómo evoluciona el rendimiento a lo largo de las horas de entrenamiento, comparándolo con otros checkpoints de la misma celda (identificados por la hora `hHHH` en el nombre).
- Evaluación de la calidad del fine-tuning en etapas tempranas: al ser un checkpoint intermedio, puede usarse para medir la velocidad de convergencia y detectar problemas de sobreajuste o subajuste antes de completar el entrenamiento.
- Estudio de la influencia del driver de razonamiento: al usar Codex / gpt-5.6-sol con esfuerzo máximo, este checkpoint puede servir para comparar cómo afecta el driver a la calidad del SFT resultante.
- Reproducción de experimentos: dado que el repositorio incluye los pesos en safetensors, es posible reproducir los resultados del barrido o continuar el entrenamiento desde este punto.
- Desarrollo de agentes conversacionales: si el fine-tuning efectivamente mejora las capacidades de agente, podría usarse como base para prototipos de asistentes con razonamiento multi-paso, aunque no hay evidencia publicada al respecto.
- Benchmarking de infraestructura: al ser un modelo de 9,4B parámetros, puede utilizarse para probar configuraciones de inferencia (vLLM, llama.cpp, etc.) y medir latencia y throughput en diferentes hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que los números de evaluación de checkpoints sin el `eos_token_id` correcto son un "floor" (mínimo) y no una medición real, pero no proporciona cifras concretas para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: con 9,4B parámetros en FP16, se necesitan aproximadamente 18,8 GB de VRAM. Con cuantización a 8 bits (INT8) se reduciría a unos 9,4 GB, y a 4 bits (INT4) a unos 4,7 GB, aunque no se han publicado archivos cuantizados en el repositorio.
- GPU recomendadas: para FP16, una GPU con 24 GB de VRAM (RTX 3090, RTX 4090, A10G) sería suficiente. Para cuantización ligera, GPUs de 12 GB (RTX 3060, RTX 4070) podrían ser viables.
- Si cabe en consumer GPU: sí, con cuantización adecuada podría ejecutarse en GPUs de gama media-alta, pero no hay archivos GGUF ni AWQ publicados.
- Opciones de despliegue: vLLM (con la advertencia de `--limit-mm-per-prompt`), llama.cpp (si se convierte a GGUF), Ollama (si se empaqueta), TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre otros checkpoints de la misma celda o de celdas comparables en el barrido AgentPTB. Tampoco se han publicado comparaciones con otros fine-tunes de Qwen3.5-9B-Base. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Es un checkpoint intermedio, no un modelo final: su rendimiento puede ser inferior al de checkpoints posteriores de la misma ejecución.
- No se especifica licencia: el uso comercial y la redistribución están sujetos a la licencia del modelo base (Qwen3.5-9B-Base) y a las condiciones que el autor pueda establecer, pero no se indica ninguna.
- Sin datos de sesgos o alucinaciones: no hay evaluación publicada que permita conocer estos riesgos.
- Arquitectura de visión sin soporte de visión en la práctica: aunque el modelo base incluye torre de visión, el checkpoint no incluye `preprocessor_config.json`, por lo que no puede procesar imágenes ni vídeos tal como está empaquetado.
- Requiere configuración especial en vLLM: si se intenta cargar sin `--limit-mm-per-prompt`, fallará la inicialización.
- Sin información sobre el dataset de entrenamiento: no se puede evaluar la calidad de los datos ni posibles sesgos introducidos durante el SFT.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/agentic-ptb/sol-max-v2.h026.pi-agent-sft-v12-depth.step_500
- Organización agentic-ptb en Hugging Face: https://huggingface.co/agentic-ptb
- Modelo base Qwen3.5-9B-Base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
