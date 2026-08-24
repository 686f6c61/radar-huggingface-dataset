# agentic-ptb/sol-max-v2.h018.pi-agent-sft-v11.step_250

## Resumen

`agentic-ptb/sol-max-v2.h018.pi-agent-sft-v11.step_250` es un checkpoint intermedio de un experimento de entrenamiento de la familia AgentPTB, publicado por el usuario `agentic-ptb`. Se trata de un punto de control (step 250) extraído a las 18,16 horas de un run de 100 horas, dentro de un barrido (sweep) denominado `sol-max-v2`. El run fue dirigido por un agente de razonamiento (Codex / gpt-5.6-sol) con esfuerzo de razonamiento máximo (`effort max`), y el checkpoint corresponde a la fase de supervisión fina con el conjunto `pi-agent-sft-v11`.

El modelo parte de la base `Qwen/Qwen3.5-9B-Base`, con 9.409.813.744 parámetros y un tamaño de repositorio de 18,8 GB en formato `safetensors`. Aunque la arquitectura subyacente de Qwen3.5 incluye un codificador de visión, este checkpoint se sirve como modelo de solo texto, y la model card advierte que vLLM debe configurarse explícitamente para ignorar entradas multimodales. No se dispone de licencia, idiomas soportados ni resultados de evaluación publicados.

La relevancia de este modelo es principalmente investigadora: permite estudiar la dinámica de entrenamiento a lo largo del tiempo (el identificador `h018` indica la hora del run) y comparar checkpoints de la misma célula. No está pensado para uso directo en producción, sino como material de análisis dentro de un pipeline de experimentación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (transformer con torre de visión, pero servido como texto) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (hereda la del base Qwen3.5-9B, no especificada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (4 shards, 18,8 GB) |

## Arquitectura y entrenamiento

El modelo se construye sobre `Qwen/Qwen3.5-9B-Base`, que emplea una arquitectura transformer con un codificador de visión integrado (`Qwen3_5ForConditionalGeneration`). Sin embargo, el checkpoint `sol-max-v2.h018.pi-agent-sft-v11.step_250` se sirve como modelo de solo texto; la model card indica que la torre de visión está presente en los pesos pero no se exporta `preprocessor_config.json`, por lo que vLLM necesita la opción `--limit-mm-per-prompt '{"image": 0, "video": 0}'` para cargarlo correctamente.

El entrenamiento corresponde a un barrido experimental (sweep) de la familia AgentPTB, donde un agente de razonamiento (Codex / gpt-5.6-sol) con esfuerzo máximo genera y evalúa configuraciones. Este checkpoint concreto es el resultado de una etapa de supervisión fina (`pi-agent-sft-v11`) sobre el modelo base, a las 18,16 horas de un run de 100 horas. No se proporcionan detalles sobre el dataset de entrenamiento, el número de tokens procesados ni el uso de técnicas como RLHF o DPO. El `eos_token_id` es `248046` (`<|im_end|>`), correcto para la plantilla de chat de Qwen3.5, lo que garantiza que el modelo detiene la generación al final de cada turno.

## Capacidades

- Generación de texto: al ser un checkpoint de un modelo base de 9B, puede generar texto coherente, pero no se han publicado evaluaciones específicas de este checkpoint.
- Razonamiento: el run se ejecutó con `reasoning effort = max`, lo que sugiere que el entrenamiento buscaba mejorar capacidades de razonamiento, pero no hay métricas que lo confirmen.
- Código y matemáticas: no hay datos disponibles; se heredan las capacidades del base Qwen3.5-9B, pero sin verificación.
- Tool calling / function calling: no se menciona soporte explícito en la model card.
- Agentes y multi-step reasoning: el contexto del experimento (AgentPTB) apunta a un uso orientado a agentes, pero no se documentan capacidades concretas.
- Multilingüismo: no disponible.
- Capacidades especiales: la arquitectura incluye visión, pero el checkpoint se sirve como texto; no se puede usar para entrada de imágenes o vídeo sin reconfiguración.

## Casos de uso

- Investigación de dinámicas de entrenamiento: este checkpoint permite analizar cómo evoluciona el rendimiento a lo largo de las horas de un run (el identificador `h018` se correlaciona con el eje temporal de las figuras del sweep). Se puede comparar con otros checkpoints de la misma célula para estudiar la curva de aprendizaje.
- Reproducción de experimentos: sirve como punto de referencia para reproducir el pipeline de AgentPTB, incluyendo la configuración de vLLM y la verificación del `eos_token_id`.
- Estudio de la influencia del esfuerzo de razonamiento: al pertenecer a un run con `effort max`, puede usarse para comparar con runs de menor esfuerzo y evaluar el impacto en la calidad del modelo intermedio.
- Desarrollo de técnicas de supervisión fina: el checkpoint `pi-agent-sft-v11` puede analizarse para entender qué patrones de SFT se aplicaron y cómo afectan al comportamiento del modelo.
- Pruebas de infraestructura de despliegue: dado que requiere una configuración especial en vLLM, es útil para validar pipelines de serving con modelos que tienen torre de visión pero se usan como texto.
- Análisis de tokenización y fin de secuencia: la correcta configuración del `eos_token_id` permite estudiar problemas de sobre-generación y desbordamiento de contexto en modelos intermedios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. Cualquier comparación con otros modelos carecería de base empírica.

## Requisitos de hardware

- VRAM estimada: los pesos en fp16 ocupan aproximadamente 18,8 GB (9,4B parámetros × 2 bytes). Con cuantización a 8 bits se reduciría a ~9,4 GB, y a 4 bits a ~4,7 GB, pero no se ofrecen versiones cuantizadas en el repositorio.
- GPU recomendadas: para cargar el modelo en fp16 se necesita una GPU con al menos 20 GB de VRAM, como una A100 (40 GB), RTX 4090 (24 GB) o similar. Con cuantización podría caber en GPUs de 12 GB (RTX 3080/4070) si se generan los archivos GGUF o AWQ.
- En consumer GPU: sí, con cuantización; en fp16 solo en las de gama alta (RTX 4090, 3090 con 24 GB).
- Opciones de despliegue: vLLM (con la opción `--limit-mm-per-prompt '{"image": 0, "video": 0}'`), llama.cpp (si se convierte a GGUF), Ollama (tras conversión), TGI (con configuración similar a vLLM).
- Latencia y throughput: no disponibles; dependen del hardware y de la cuantización.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa rigurosa. El modelo es un checkpoint intermedio de un experimento, no un modelo final. Como referencia, se puede comparar con su base `Qwen/Qwen3.5-9B-Base`, pero no hay datos de rendimiento de este checkpoint. Tampoco se conocen otros checkpoints de la misma célula con métricas publicadas. Por tanto, la comparativa se limita a lo siguiente:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| agentic-ptb/sol-max-v2.h018... | 9,4B | no disponible | no disponible | HuggingFace (checkpoint intermedio) |
| Qwen/Qwen3.5-9B-Base | 9,4B | no disponible | no disponible | HuggingFace (modelo base) |
| Otros checkpoints de AgentPTB | variable | no disponible | no disponible | HuggingFace (búsqueda `agentic-ptb`) |

## Limitaciones y advertencias

- Checkpoint intermedio: no es un modelo final; fue extraído a las 18,16 horas de un run de 100 horas y puede no haber convergido.
- Sin licencia especificada: no se puede determinar si es de uso libre o restringido; se debe contactar con el autor antes de cualquier uso comercial.
- Sin evaluación publicada: no hay benchmarks ni métricas de calidad; cualquier uso en producción es arriesgado.
- Sesgos y alucinaciones: al ser un modelo base sin ajuste fino adicional, puede presentar sesgos del corpus de entrenamiento de Qwen3.5 y riesgo de alucinación, aunque no hay datos específicos.
- Limitación de modalidad: aunque la arquitectura incluye visión, el checkpoint se sirve como texto; intentar usarlo con imágenes o vídeo fallará sin reconfiguración.
- Dependencia de configuración: requiere la opción `--limit-mm-per-prompt` en vLLM; ignorar este detalle provoca errores de carga.
- Contexto y eos: el `eos_token_id` es correcto, pero la longitud de contexto no está documentada; se recomienda verificar antes de usar.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/agentic-ptb/sol-max-v2.h018.pi-agent-sft-v11.step_250
- Búsqueda de modelos de `agentic-ptb` en HuggingFace: https://huggingface.co/models?other=agentic-ptb
- Modelo base Qwen/Qwen3.5-9B-Base: https://huggingface.co/Qwen/Qwen3.5-9B-Base (referencia, no enlazado directamente en la información proporcionada)
