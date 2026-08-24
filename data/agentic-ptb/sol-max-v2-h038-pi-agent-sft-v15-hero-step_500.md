# agentic-ptb/sol-max-v2.h038.pi-agent-sft-v15-hero.step_500

## Resumen

El modelo `agentic-ptb/sol-max-v2.h038.pi-agent-sft-v15-hero.step_500` es un checkpoint intermedio de un barrido de entrenamiento (sweep) del proyecto AgentPTB, desarrollado por el usuario `agentic-ptb`. Se trata de un fine-tuning de tipo *supervised fine-tuning* (SFT) sobre el modelo base `Qwen/Qwen3.5-9B-Base`, orientado a tareas de agente (pi-agent). El checkpoint corresponde a la hora 38,9 de un run de 100 horas, y fue generado utilizando como *driver* el modelo Codex / gpt-5.6-sol con un esfuerzo de razonamiento máximo (`max`).

Con 9.409.813.744 parámetros (aproximadamente 9,4 mil millones), el modelo hereda la arquitectura de Qwen3.5-9B-Base, que es una arquitectura de visión-lenguaje (`Qwen3_5ForConditionalGeneration`), aunque el checkpoint se sirve como modelo de solo texto. Su relevancia radica en que documenta un enfoque de entrenamiento de agentes mediante datos sintéticos generados por un modelo de frontera, y su publicación permite estudiar la evolución del rendimiento a lo largo del tiempo de entrenamiento. No se dispone de información sobre licencia, idiomas soportados ni benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (vision-language, servido como texto-only) |
| Parametros totales | 9.409.813.744 (9,4 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3.5-9B-Base, no especificada) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (4 shards, 18,8 GB) |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.5-9B-Base`, una arquitectura transformer de visión-lenguaje con 9,4 mil millones de parámetros. El checkpoint incluye el *vision tower* del modelo base, pero el proceso de entrenamiento (prime-rl) no exporta `preprocessor_config.json`, por lo que para servirlo con vLLM es necesario indicar explícitamente que se trata de un modelo de solo texto mediante el flag `--limit-mm-per-prompt '{"image": 0, "video": 0}'`.

El entrenamiento corresponde a un barrido de 100 horas (sweep) en el que se utiliza como *driver* el modelo Codex / gpt-5.6-sol con esfuerzo de razonamiento máximo para generar datos de entrenamiento. El checkpoint concreto es el paso 500 del subdirectorio `pi-agent-sft-v15-hero`, dentro de la celda `sol-max-v2`. Se trata de un checkpoint intermedio (hora 38,9 de 100), no del modelo final. El token `eos_token_id` es `248046` (`<|im_end|>`), correcto para la plantilla de chat de Qwen3.5, lo que garantiza que el modelo detiene correctamente las respuestas al final de cada turno.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas adicionales como RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades del modelo base Qwen3.5-9B-Base, aunque no se documentan detalles específicos.
- Fine-tuning para agente: el nombre `pi-agent-sft` sugiere entrenamiento supervisado para tareas de agente, lo que probablemente incluye *tool calling* y razonamiento multi-paso, pero no hay documentación oficial que lo confirme.
- Soporte de visión: el *vision tower* está presente en los pesos, pero el modelo se sirve como texto-only; no se garantiza su funcionamiento con imágenes.
- Multilingüismo: no disponible (depende del modelo base, pero no se especifica).

## Casos de uso

Dado que no existe documentación oficial sobre casos de uso específicos, los siguientes son usos potenciales basados en la naturaleza del modelo (fine-tuning para agente sobre una base de 9,4 B):

- Agentes de codigo asistido: el modelo podría integrarse en entornos de desarrollo para generar, revisar o depurar codigo, aprovechando el entrenamiento con datos de un modelo de razonamiento maximo.
- Automatizacion de tareas con tool calling: si el fine-tuning incluye soporte para llamadas a herramientas, podria utilizarse en pipelines de automatizacion que requieran interaccion con APIs o ejecucion de comandos.
- Razonamiento multi-paso en entornos de agente: para tareas que requieren planificacion y ejecucion secuencial, como navegacion web o gestion de correo.
- Prototipado rapido de asistentes conversacionales: al ser un modelo de 9,4 B, puede desplegarse en hardware moderado para experimentar con interacciones agente-usuario.
- Investigacion en entrenamiento de agentes: como checkpoint intermedio, es util para estudiar la evolucion del rendimiento durante el entrenamiento y comparar con otros checkpoints de la misma celda.
- Generacion de datos sinteticos: podria emplearse para generar datos de entrenamiento para otros modelos, aunque su naturaleza intermedia lo hace menos adecuado que un modelo final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona metricas de MMLU, HumanEval, GSM8K ni otros evaluaciones estandar. La unica referencia al rendimiento es la posicion del checkpoint en la curva de rendimiento a lo largo del tiempo de entrenamiento, pero sin valores numericos.

## Requisitos de hardware

- VRAM estimada para inferencia: con 9,4 B de parametros y pesos en FP16 (18,8 GB), se necesitan aproximadamente 19-20 GB de VRAM para carga completa. Con cuantizacion INT8 (no publicada, pero posible) se reduciria a unos 10 GB, y con INT4 a unos 5 GB.
- GPU recomendadas: para FP16, una GPU con 24 GB (RTX 4090, A100 40GB, etc.) es adecuada. Con cuantizacion, podria caber en GPUs consumer de 12-16 GB (RTX 3080/4080, etc.).
- Opciones de despliegue: vLLM (con el flag `--limit-mm-per-prompt` obligatorio), llama.cpp, Ollama (si se convierte a GGUF), TGI. No se proporcionan configuraciones oficiales.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion suficiente para una comparativa rigurosa. El modelo es un checkpoint intermedio de un fine-tuning especifico, y no existen datos publicados de rendimiento frente a alternativas. Como referencia, se puede comparar con su modelo base:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen/Qwen3.5-9B-Base | 9,4 B | no disponible | no disponible | Hugging Face |
| agentic-ptb/sol-max-v2.h038... | 9,4 B | no disponible | no disponible | Hugging Face |

No se conocen otros modelos de la misma categoria (fine-tuning para agente sobre Qwen3.5-9B) con datos publicados.

## Limitaciones y advertencias

- Checkpoint intermedio: no es el modelo final del run de entrenamiento; su rendimiento puede ser inferior al de checkpoints posteriores.
- Licencia no especificada: no se indica bajo que licencia se distribuye, lo que impide su uso comercial sin consultar al autor.
- Requisito de configuracion especial: al servirlo con vLLM es obligatorio usar `--limit-mm-per-prompt '{"image": 0, "video": 0}'`; de lo contrario, el servidor falla al cargar.
- Sesgos y alucinaciones: al derivar de Qwen3.5-9B-Base, puede heredar sesgos del modelo base y presentar riesgo de alucinacion, especialmente en tareas de razonamiento complejo.
- Sin documentacion de capacidades: no se detallan las capacidades exactas del fine-tuning (tool calling, etc.), por lo que su comportamiento en produccion es incierto.
- Sin benchmarks: no hay evidencia publica de su rendimiento en tareas estandar, lo que dificulta evaluar su idoneidad para casos de uso concretos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/agentic-ptb/sol-max-v2.h038.pi-agent-sft-v15-hero.step_500
- Busqueda de modelos de agentic-ptb: https://huggingface.co/models?other=agentic-ptb
- Repositorio oh-my-pi (posible relacion con el proyecto pi-agent): https://github.com/can1357/oh-my-pi
