# divinetribe/Qwen3.6-27B-abliterated-4bit-mlx

## Resumen

Qwen3.6-27B-abliterated-4bit-mlx es una conversión a 4 bits en formato MLX del modelo huihui-ai/Huihui-Qwen3.6-27B-abliterated, que a su vez deriva del Qwen3.6 de 27B de Alibaba. El trabajo de "abliteration" (supresión de la dirección de rechazo en el espacio de activaciones) lo realizó huihui-ai; divinetribe se limita a la cuantización y empaquetado para Apple Silicon mediante mlx-lm. El resultado es un checkpoint de aproximadamente 15,2 GB que cabe en un Mac con 32 GB de memoria unificada.

El modelo resuelve un problema muy concreto: ejecutar un LLM de ~27B parámetros en local sobre hardware Apple sin depender de la nube, sin claves de API y sin rechazos en peticiones benignas pero delicadas. La arquitectura declarada en los metadatos es `qwen3_5` (familia Qwen3.6), con 26.895.993.856 parámetros totales según los safetensors del repositorio. La licencia declarada es Apache 2.0, heredada del modelo base.

Es relevante ahora porque encaja en el ecosistema creciente de inferencia local en Apple Silicon (MLX, mlx-lm) y porque se integra como drop-in en stacks de agentes locales como claude-code-local. No obstante, conviene subrayar que la abliteración no mejora capacidades: solo elimina la dirección de rechazo, y el modelo sigue sujeto a la licencia upstream de Qwen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Qwen3.6 (identificador `qwen3_5` en los metadatos) |
| Parametros totales | 26.895.993.856 (~26,9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits, group size 64 (MLX) |
| Idiomas soportados | en (inglés, según model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX), repositorio de 15,2 GB |

## Arquitectura y entrenamiento

La model card no aporta detalles sobre el entrenamiento original de Qwen3.6 ni sobre el proceso de abliteración más allá de describirlo como la supresión de la "dirección de rechazo" en el modelo. Se trata de un transformer de la familia Qwen3.6 con ~26,9B parámetros, convertido a MLX y cuantizado a 4 bits con group size 64. No se especifican número de tokens de entrenamiento, composición del dataset, ni si hubo RLHF, DPO o fases de reasoning.

La innovación técnica de este repositorio es exclusivamente de despliegue: la conversión con mlx-lm permite ejecutar el modelo de forma nativa en Apple Silicon con un único comando, y el empaquetado a ~15 GB lo hace viable en equipos de 32 GB. La abliteración, por su parte, modifica el comportamiento de rechazo del modelo base sin alterar su arquitectura ni sus pesos de forma sustancial en cuanto a capacidades.

## Capacidades

- Generación de texto y conversación multi-turno (pipeline `text-generation`, tag `conversational`).
- Respuestas sin rechazos en peticiones benignas pero delicadas gracias a la abliteración.
- Ejecución local en Apple Silicon mediante MLX y mlx-lm.
- Integración como modelo de agente en el stack claude-code-local (variable `MLX_MODEL`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponible.
- Modo thinking o razonamiento explícito: no disponible.
- Capacidades multilingües: la model card solo declara inglés (`en`).

## Casos de uso

- Asistente de código local en Mac: el modelo se puede apuntar desde claude-code-local mediante `MLX_MODEL` para ejecutar tareas de agente de programación sin salir del equipo, aprovechando sus ~27B parámetros y su encaje en 32 GB de memoria unificada.
- Procesamiento de texto confidencial en local: al no requerir API ni conexión, es adecuado para pipelines que manejan datos sensibles que no deben salir del portátil, con la salvedad de que solo se declara inglés.
- Generación de texto sin filtros para investigación: útil para estudiar el comportamiento de modelos abliterated, comparar respuestas con y sin supresión de la dirección de rechazo, o analizar sesgos.
- Prototipado de aplicaciones conversacionales: la inferencia vía `mlx_lm.generate` permite iterar rápidamente en un Mac antes de migrar a un despliegue en servidor.
- Evaluación de agentes locales: encaja en el leaderboard Agent-12 de tareas de agente juzgadas por el sistema de ficheros, donde se comparan modelos sobre el mismo hardware.
- Experimentación con cuantización: sirve como referencia práctica de cómo se comporta un modelo de ~27B a 4 bits con group size 64 en MLX frente a otras precisiones.
- Despliegue on-device para demos: ideal para presentaciones o entornos sin conectividad donde se necesita un LLM de tamaño medio funcionando en un portátil.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: ~15,2 GB de pesos en 4 bits; se recomienda un Mac con 32 GB de memoria unificada para dejar margen al contexto y al sistema, tal como indica la model card.
- GPU recomendadas: Apple Silicon (M-series) con 32 GB o más de memoria unificada. No está pensado para GPU NVIDIA/AMD, ya que el formato es MLX.
- ¿Cabe en consumer GPU? No en el sentido habitual: es específico de Apple Silicon. En un Mac de 32 GB funciona con holgura; en equipos de 16 GB no cabría con margen suficiente.
- Opciones de despliegue: mlx-lm (`python -m mlx_lm.generate`), servidor MLX nativo de Anthropic-API del stack claude-code-local. No se soportan vLLM, llama.cpp, Ollama ni TGI con este formato.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| divinetribe/Qwen3.6-27B-abliterated-4bit-mlx | ~26,9B | no disponible | safetensors MLX 4-bit | apache-2.0 | Objeto de esta ficha; solo Apple Silicon |
| huihui-ai/Huihui-Qwen3.6-27B-abliterated | ~27B (no confirmado) | no disponible | safetensors (probablemente BF16/FP16) | apache-2.0 (según base) | Modelo base sin cuantizar; mayor huella de memoria |
| Qwen3.6 27B original (Alibaba) | ~27B | no disponible | safetensors | licencia Qwen upstream | Modelo con rechazos intactos; referencia de capacidades |

La comparación con alternativas de otros formatos (GGUF para llama.cpp, AWQ/GPTQ para vLLM) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- La abliteración elimina la dirección de rechazo, lo que puede producir respuestas inapropiadas en dominios sensibles; no es una mejora de capacidades y puede degradar la calidad en tareas que dependen de salvaguardas.
- Riesgo de alucinación inherente a los LLM; no se han publicado evaluaciones específicas de fidelidad para este checkpoint.
- Solo se declara inglés (`en`); el rendimiento en castellano u otros idiomas no está garantizado.
- Longitud de contexto no documentada: no se puede planificar su uso en tareas de contexto largo sin verificación empírica.
- Licencia Apache 2.0 declarada, pero la model card recuerda que se sigue sujeto a la licencia upstream de Qwen; conviene revisar los términos del modelo base antes de uso comercial.
- Formato exclusivo MLX: no es portable a CUDA, ROCm ni CPU estándar; requiere Apple Silicon.
- El repositorio tiene 0 likes y 590 descargas en el momento de la consulta, lo que indica poca validación comunitaria frente a otros checkpoints.
- Las cifras de estrellas y descargas que aparecen en la model card (3,8k estrellas, 63,8k descargas) corresponden a estadísticas agregadas del autor, no a este repositorio concreto; trátelas con cautela.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/divinetribe/Qwen3.6-27B-abliterated-4bit-mlx
- Modelo base abliterated: https://huggingface.co/huihui-ai/Huihui-Qwen3.6-27B-abliterated
- Colección "Abliterated MLX for Apple Silicon": https://huggingface.co/collections/divinetribe/abliterated-mlx-for-apple-silicon-6a222fed584be7ce97633768
- Repositorio claude-code-local: https://github.com/nicedreamzapp/claude-code-local
- Leaderboard Agent-12: https://nicedreamzapp.github.io/agent12/
- MLX (Apple): https://github.com/ml-explore/mlx
- Perfil del autor en GitHub: https://github.com/nicedreamzapp
- Perfil del autor en Hugging Face: https://huggingface.co/divinetribe
