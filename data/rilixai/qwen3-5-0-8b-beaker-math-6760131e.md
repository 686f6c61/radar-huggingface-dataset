# rilixai/Qwen3.5-0.8B-Beaker-math-6760131e

## Resumen

Qwen3.5-0.8B-Beaker-math-6760131e es una edición de pesos (weight edit) sobre el modelo base Qwen/Qwen3.5-0.8B, publicada por el usuario rilixai. No se trata de un fine-tuning convencional ni de un modelo entrenado desde cero: únicamente se han reescrito 2.047 números en dos columnas de salida de la capa 23 del módulo `mlp.down_proj`. El objetivo declarado es corregir los bucles de razonamiento matemático del modelo base, y según la model card eleva la precisión en MATH-500 del 7,6% al 31,1%.

El modelo conserva la arquitectura, el tokenizador y el pipeline del base (image-text-to-text, con capacidades multimodales de imagen y texto) y se distribuye en formato safetensors para la librería transformers. Con 873.438.784 parámetros totales y un repositorio de 1,8 GB, es un modelo pequeño pensado para despliegues con recursos limitados, incluida GPU de consumo.

Su relevancia es doble: por un lado, demuestra que una intervención quirúrgica sobre un número muy reducido de pesos puede modificar de forma medible el comportamiento de razonamiento de un modelo; por otro, documenta un flujo de trabajo de "weight-space programming" asistido por un agente (Beaker con GPT-6.1 Sol). La licencia es Apache-2.0, igual que el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), familia Qwen3.5; detalles internos no disponibles |
| Parametros totales | 873.438.784 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16; no se listan variantes GGUF/INT8) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B (revisión `2fc06364715b967f1860aea9cf38778875588b17`) y no ha sido reentrenado: es una edición de pesos. Concretamente, se reescriben dos columnas de salida de la capa 23 en `mlp.down_proj.weight`, las correspondientes a las neuronas 970 y 1004. En total cambian 2.047 números. La magnitud del cambio respecto a la columna original es de 2,0× para la neurona 970 y de 9,9× para la neurona 1004. Los valores exactos se publican en el directorio `edits/` del repositorio.

El proceso de búsqueda lo realizó Beaker (withbeaker.ai) con GPT-6.1 Sol en modo de esfuerzo máximo, 25 lecturas del modelo y una duración aproximada de 8 horas, según la model card. No se documentan datos de entrenamiento, número de tokens, composición del dataset ni fases de RLHF/DPO, porque no hay entrenamiento en el sentido habitual. La innovación técnica es precisamente el método: localizar un subconjunto mínimo de pesos cuya modificación altera un comportamiento específico (los bucles en razonamiento matemático) sin tocar el resto de la red.

## Capacidades

- Generación de texto y razonamiento conversacional, heredados del modelo base Qwen3.5-0.8B.
- Procesamiento de imagen y texto (pipeline `image-text-to-text`), con la clase `AutoModelForImageTextToText`.
- Modo de pensamiento (thinking) activable mediante `enable_thinking=True` en la plantilla de chat.
- Razonamiento matemático mejorado respecto al base: MATH-500 pasa del 7,6% al 31,1% según la model card.
- Plantilla de chat compatible con el formato de mensajes `role`/`content` de Qwen.
- Soporte de tool calling, agentes o razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible.

## Casos de uso

- Resolución de problemas matemáticos de nivel escolar y competición: el modelo está específicamente editado para reducir bucles de razonamiento en este dominio, con una mejora documentada de 7,6% a 31,1% en MATH-500, lo que lo hace útil como solver ligero en entornos con poca VRAM.
- Tutoría matemática interactiva: al ser un modelo conversacional de 0,8B, puede gestionar diálogos multi-turno con explicaciones paso a paso y modo thinking, adecuado para prototipos de asistentes educativos.
- Experimentación en interpretabilidad y edición de pesos: sirve como caso de estudio reproducible para investigar cómo dos columnas de una capa MLP afectan al razonamiento; los valores editados están publicados en `edits/`.
- Evaluación comparativa de técnicas de weight editing: útil como baseline editado frente al Qwen3.5-0.8B original en pipelines de investigación sobre modificación de comportamiento sin reentrenamiento.
- Despliegue en GPU de consumo para tareas de razonamiento corto: con 873M parámetros en bfloat16 (≈1,7 GB de pesos) cabe en tarjetas de 8 GB o menos, lo que permite servir el modelo con vLLM en una estación de trabajo.
- Procesamiento de documentos con imagen y texto: al conservar el pipeline image-text-to-text, puede emplearse en prototipos de extracción de información de capturas o figuras con contenido matemático.
- Generación asistida en entornos con requisitos de licencia permisiva: la licencia Apache-2.0 permite integrarlo en productos comerciales sin obligaciones de copyleft.

## Benchmarks y rendimiento

| Benchmark | Modelo base Qwen3.5-0.8B | Este modelo (editado) |
|---|---|---|
| MATH-500 (500 problemas, 4 respuestas cada uno) | 7,6% | 31,1% |

Ajustes de evaluación declarados: thinking activado, temperatura 0,6, top-p 0,95, top-k 20, presence penalty 1,5, hasta 32.768 tokens nuevos, semilla 0, corrección con math-verify 0.9.0 y servicio con vLLM 0.32.0. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 1,7 GB solo para pesos, más KV cache y activaciones; en la práctica, unos 3-4 GB para contextos moderados.
- En cuantización de 8 bits cabría en torno a 1 GB de pesos; en 4 bits, alrededor de 0,5 GB. No se publican variantes cuantizadas oficiales.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM (RTX 3060/4060, RTX 4090, A100, H100). Cabe holgadamente en GPU de consumo.
- Opciones de despliegue: transformers (`AutoModelForImageTextToText`), vLLM (`vllm serve rilixai/Qwen3.5-0.8B-Beaker-math-6760131e`). Compatibilidad con llama.cpp, Ollama o TGI no está documentada en la información disponible.
- Latencia y throughput: no disponibles. La evaluación se realizó con hasta 32.768 tokens nuevos por respuesta, lo que implica generaciones largas en modo thinking.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MATH-500 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-Beaker-math-6760131e | 873.438.784 | no disponible | 31,1% | Apache-2.0 | Hugging Face |
| Qwen/Qwen3.5-0.8B (base) | no disponible en la información | no disponible | 7,6% | Apache-2.0 | Hugging Face |
| Otras alternativas de ~1B para matemáticas | no disponible | no disponible | no disponible | no disponible | no disponible |

La única comparación con datos verificables es contra el modelo base, del que solo se conoce el resultado en MATH-500. No se dispone de información sobre modelos comparables de terceros en la documentación proporcionada.

## Limitaciones y advertencias

- La edición se limita a dos columnas de una única capa (23) del módulo `mlp.down_proj`; no hay garantía de que la mejora en MATH-500 se generalice a otros dominios matemáticos o a tareas de razonamiento no matemático.
- El 31,1% en MATH-500 sigue siendo un rendimiento bajo en términos absolutos: dos de cada tres problemas evaluados no se resuelven correctamente.
- Riesgo de alucinación y de bucles de razonamiento residuales: la edición mitiga los bucles observados, pero no se documenta una eliminación completa.
- Sesgos conocidos: no disponibles. Al no haber reentrenamiento, se heredan los sesgos del modelo base, que no se detallan.
- Idiomas soportados y longitud de contexto: no disponibles; conviene verificar el comportamiento en castellano antes de usarlo en producción.
- No se publican datos de seguridad, filtrado de contenido ni evaluaciones de robustez frente a prompts adversarios.
- Licencia Apache-2.0: permite uso comercial, pero al ser una modificación de Qwen3.5-0.8B conviene revisar también los términos y la atribución del modelo base.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día (2026-11-11): no hay evidencia de uso en producción ni validación independiente de los resultados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rilixai/Qwen3.5-0.8B-Beaker-math-6760131e
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Run público de Beaker: https://app.withbeaker.ai/public/runs/6760131e-c35b-4d55-ab38-75480bec76dd
- Blog de Beaker sobre weight-space programming: https://www.withbeaker.ai/blog/weight-space-programming
- Sitio de Beaker: https://www.withbeaker.ai
