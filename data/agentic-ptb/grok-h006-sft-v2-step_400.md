# agentic-ptb/grok.h006.sft-v2.step_400

## Resumen

Este repositorio contiene un checkpoint intermedio del sweep de entrenamiento AgentPTB, desarrollado por el usuario agentic-ptb. Se trata de un fine-tuning SFT (supervised fine-tuning) sobre el modelo base Qwen/Qwen3.5-9B-Base, con un total de 9.409.813.744 parámetros (~9,4B) y un tamaño de 18,8 GB en formato safetensors. El checkpoint corresponde a la hora 6,98 de una ejecución de 100 horas, dentro de la celda experimental denominada `grok` con driver `pi / grok-4.6` y esfuerzo de razonamiento `xhigh`.

El modelo es relevante principalmente para investigación: permite estudiar la dinámica de entrenamiento, comparar checkpoints a lo largo del tiempo y analizar curvas de aprendizaje. No está pensado para uso en producción, y además presenta un defecto conocido en el token de fin de secuencia (`eos_token_id`), que afecta a la fiabilidad de cualquier evaluación. La licencia, los idiomas soportados y la longitud de contexto no están especificados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3.5-9B-Base, sin especificar) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning SFT sobre Qwen/Qwen3.5-9B-Base, un transformer de 9,4B parámetros. El entrenamiento forma parte de un sweep de 100 horas (AgentPTB) en el que se evalúan diferentes configuraciones; este checkpoint concreto se guardó a las 6,98 horas de ejecución. La model card indica que el driver es `pi / grok-4.6` con un esfuerzo de razonamiento `xhigh`, lo que sugiere que el entrenamiento podría estar orientado a mejorar capacidades de razonamiento, aunque no se detallan los datos de entrenamiento ni el dataset utilizado.

Un aspecto técnico destacable es el defecto de empaquetado del token EOS: el checkpoint solo incluye el token `248044` y le falta el `248046` (`<|im_end|>`), que es el token que el template de chat de Qwen3.5 usa para terminar cada turno de asistente. Esto provoca que el modelo no se detenga al final del turno y sobrepase la ventana de contexto, por lo que cualquier métrica de evaluación debe interpretarse como un límite inferior, no como una medición real.

## Capacidades

- Generación de texto: como derivado de Qwen3.5-9B-Base, se espera que pueda generar texto coherente, aunque no hay evaluaciones publicadas que lo confirmen.
- Razonamiento: la configuración del sweep (`reasoning effort xhigh`) sugiere un enfoque en razonamiento, pero no hay datos concretos.
- Tool calling, agentes, visión, audio: no hay información disponible; no se puede afirmar que los soporte.
- Multilingüismo: no especificado; depende del modelo base, pero no confirmado.

## Casos de uso

- Investigación de dinámicas de entrenamiento: permite analizar cómo evoluciona el rendimiento a lo largo de las horas de entrenamiento, comparando este checkpoint con otros de la misma celda (por ejemplo, `grok.h006` frente a `grok.h012`).
- Estudio de curvas de aprendizaje: al ser un checkpoint intermedio, es útil para trazar la progresión de métricas en función del tiempo de entrenamiento.
- Depuración de pipelines de fine-tuning: sirve para verificar que el proceso de SFT funciona correctamente antes de lanzar ejecuciones completas.
- Análisis de defectos de tokenización: el problema del EOS permite estudiar el impacto de un token de fin de secuencia incompleto en la generación y en la evaluación.
- Reproducibilidad de sweeps: investigadores que quieran replicar el sweep AgentPTB pueden usar este checkpoint como referencia intermedia.
- No recomendado para aplicaciones de producción: por su naturaleza intermedia y el defecto de EOS, no es adecuado para chatbots, generación de código o atención al cliente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card advierte explícitamente de que los números de evaluación de este checkpoint son un piso, no una medición, debido al defecto del token EOS.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en FP16 ocupan 18,8 GB, por lo que se necesitan al menos ~19-20 GB de VRAM para cargar el modelo completo sin cuantización.
- GPU recomendadas: tarjetas con 24 GB de VRAM o más, como RTX 3090, RTX 4090, A10G, A100 (40 GB) o H100.
- En consumer GPU: cabe en una RTX 3090 o RTX 4090 (24 GB) en FP16, pero no en GPUs de 16 GB o menos sin cuantizar.
- Opciones de despliegue: al estar en safetensors, se puede servir con vLLM o TGI si se convierte al formato adecuado; también se podría convertir a GGUF para usar con llama.cpp u Ollama, pero no se proporcionan archivos GGUF.
- Latencia y throughput: no disponibles; dependen del hardware y del backend de inferencia.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar con otros modelos. A nivel de especificaciones, se puede comparar con el modelo base y con otros modelos de ~9B:

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| agentic-ptb/grok.h006.sft-v2.step_400 | 9,4B | no disponible | no disponible | safetensors |
| Qwen/Qwen3.5-9B-Base | 9,4B | no disponible (tipicamente 128K en Qwen3) | Apache 2.0 (probable) | safetensors |
| Llama 3.1 8B | 8B | 128K | Llama 3.1 License | safetensors, GGUF |

La comparación es limitada porque no hay métricas publicadas para este checkpoint.

## Limitaciones y advertencias

- Defecto de token EOS: falta el token `248046` (`<|im_end|>`), por lo que el modelo no termina correctamente los turnos y puede sobrepasar la ventana de contexto. Esto invalida cualquier evaluación directa.
- Checkpoint intermedio: no es un modelo final optimizado; su rendimiento puede ser inferior al de checkpoints posteriores del mismo sweep.
- Licencia no especificada: no se puede determinar si es apto para uso comercial.
- Sin datos de evaluación: no hay benchmarks publicados, por lo que se desconoce su calidad real.
- Riesgo de alucinación: no evaluado; como modelo de lenguaje, es probable que presente alucinaciones, pero no hay datos al respecto.
- Idiomas y contexto: no especificados; se heredan del modelo base, pero no confirmados.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/agentic-ptb/grok.h006.sft-v2.step_400
- Índice del sweep AgentPTB (referenciado en la model card): `agentic-ptb/INDEX` (no se proporciona URL directa)
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
