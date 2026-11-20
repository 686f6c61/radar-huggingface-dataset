# divinetribe/Huihui-Qwen3-8B-abliterated-v2-4bit-mlx

## Resumen
Huihui-Qwen3-8B-abliterated-v2-4bit-mlx es una conversion a formato MLX de 4 bits del modelo Huihui-Qwen3-8B-abliterated-v2, que a su vez es una version "abliterated" (sin direccion de rechazo) del Qwen3-8B de Alibaba. La publica el usuario divinetribe como parte de su coleccion de modelos abliterated optimizados para Apple Silicon, y esta pensada para ejecucion local en Macs modernos sin necesidad de GPU dedicada ni conexion a la nube.

El modelo conserva la arquitectura Qwen3 de 8.190.735.360 parametros (aproximadamente 8B) y 36 capas, pero cuantizado a 4 bits afines con group size 64 mediante `mlx_lm.convert`, lo que reduce el peso en disco a 4,6 GB. Esto lo hace viable en un Mac con 16 GB de RAM unificada, un umbral muy accesible para equipos consumer.

Su relevancia actual radica en dos factores: por un lado, permite ejecutar un modelo de 8B con capacidades conversacionales y de generacion de texto en hardware Apple Silicon de forma totalmente on-device; por otro, la abliteracion elimina el comportamiento de rechazo del modelo instruct original, lo que lo orienta a casos de uso donde el modelo base declinaria responder. La licencia Apache 2.0 del modelo base se mantiene.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3 (transformer denso), 36 capas |
| Parametros totales | 8.190.735.360 (~8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | 4-bit affine, group size 64 (via `mlx_lm.convert`) |
| Idiomas soportados | en (segun model card y tags) |
| Licencia | apache-2.0 |
| Formato de pesos | MLX safetensors (no GGUF, no llama.cpp) |

## Arquitectura y entrenamiento
El modelo es un transformer denso de la familia Qwen3 con 36 capas y aproximadamente 8B de parametros. No se trata de una arquitectura MoE ni hibrida. La informacion disponible no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en el modelo base; esos datos corresponden al Qwen3-8B original de Alibaba y no se reproducen en la model card de esta conversion.

La innovacion tecnica principal es la abliteracion realizada por huihui-ai: se ortogonaliza la direccion de rechazo fuera de los pesos, de modo que el modelo responde a instrucciones que un modelo instruct estandar rechazaria, manteniendo coherencia en tareas ordinarias. Sobre esa version, divinetribe aplica una cuantizacion 4-bit affine con group size 64 mediante `mlx_lm.convert`, generando pesos en formato MLX safetensors compatibles con `mlx-lm`, LM Studio y otras herramientas que lean modelos MLX. No se mencionan tecnicas como decodificacion especulativa o atencion lineal en la informacion disponible.

## Capacidades
- Generacion de texto y conversacion multi-turno en ingles.
- Respuesta a instrucciones que un modelo instruct estandar rechazaria, gracias a la abliteracion de la direccion de rechazo.
- Coherencia mantenida en tareas ordinarias segun la model card del autor.
- Ejecucion totalmente on-device en Apple Silicon (M1, M2, M3, M4, M5) sin GPU dedicada ni API key.
- Compatibilidad con `mlx-lm` (CLI y API Python) y con LM Studio.
- Soporte de chat template mediante `tok.apply_chat_template`.
- Capacidades de tool calling, function calling, agentes, vision, audio o thinking mode: no disponible en la informacion proporcionada.
- Capacidades multilingues: la model card solo declara ingles; no se confirma soporte de otros idiomas.

## Casos de uso
- Asistente conversacional local en Mac: el modelo se carga con `mlx-lm` o LM Studio y gestiona conversaciones multi-turno en ingles sin salir del equipo, adecuado para entornos con requisitos de privacidad o sin conectividad.
- Prototipado de agentes locales: se integra en el proyecto Claude Code Local, que expone una API compatible con Anthropic sobre MLX, permitiendo probar flujos de agente en Apple Silicon sin coste de API.
- Generacion de texto creativo sin restricciones: la abliteracion permite explorar generacion de ficcion, dialogos o contenido que el modelo base declinaria, con la responsabilidad legal que ello implica.
- Evaluacion de modelos abliterated: util para investigadores que comparan el comportamiento de un modelo con y sin direccion de rechazo sobre el mismo conjunto de prompts.
- Desarrollo y pruebas offline: al ocupar 4,6 GB y funcionar en 16 GB de RAM, sirve como modelo de referencia para pruebas de pipelines de inferencia local en portatiles Apple.
- Educacion y demos de inferencia on-device: permite mostrar en un MacBook como se ejecuta un LLM de 8B cuantizado sin infraestructura cloud.
- Sustitucion de API en herramientas de codigo local: al integrarse en Claude Code Local, puede usarse como backend de un asistente de programacion que corre enteramente en el dispositivo.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM/RAM estimada: 4,6 GB en disco; la model card indica que 16 GB de RAM unificada en Mac es "comfortable".
- GPU recomendadas: no aplica GPU dedicada; requiere Apple Silicon (M1, M2, M3, M4, M5).
- Cabe en consumer hardware: si, en cualquier Mac moderno con al menos 16 GB de RAM unificada.
- Opciones de despliegue: `mlx-lm` (CLI y API Python), LM Studio y cualquier herramienta que lea modelos MLX. No es compatible con llama.cpp, GGUF, vLLM ni TGI.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Huihui-Qwen3-8B-abliterated-v2-4bit-mlx (este) | ~8B | no disponible | MLX safetensors 4-bit | Apache 2.0 | Solo Apple Silicon, abliterated |
| huihui-ai/Huihui-Qwen3-8B-abliterated-v2 (base) | ~8B | no disponible | safetensors (full precision) | Apache 2.0 | Requiere mas memoria, no optimizado para MLX |
| Qwen/Qwen3-8B (original) | ~8B | no disponible | safetensors | Apache 2.0 | Modelo instruct con rechazos, no abliterated |
| Otros modelos abliterated MLX de divinetribe (Llama 3.3 70B, Gemma 4, Qwen3-VL, Hermes 4, Muse Glimmer) | varios | no disponible | MLX | segun modelo base | Misma coleccion, distinto tamano y capacidades |

## Limitaciones y advertencias
- Modelo sin censura: la abliteracion elimina la direccion de rechazo, por lo que puede generar contenido que el modelo base declinaria. El usuario es responsable del uso y del cumplimiento legal.
- Solo ingles declarado: la model card y los tags solo indican `en`; el rendimiento en castellano u otros idiomas no esta garantizado.
- Riesgo de alucinacion: no se documentan evaluaciones de fidelidad; como todo LLM de 8B, puede inventar datos.
- Sesgos: no se documentan analisis de sesgo; hereda los del Qwen3-8B original y la abliteracion no los corrige.
- Contexto: la longitud de contexto no se especifica en la informacion disponible; conviene verificarla antes de usarlo en produccion con ventanas largas.
- Compatibilidad limitada: solo funciona en Apple Silicon con MLX; no es desplegable en GPU NVIDIA, llama.cpp, vLLM ni TGI.
- Licencia Apache 2.0: permite uso comercial, pero el autor recomienda cumplir la licencia del modelo base y la ley aplicable; la abliteracion puede tener implicaciones en terminos de uso aceptable.
- Datos de popularidad de la model card: las cifras de estrellas y descargas citadas en el README son datos del autor y no verificables de forma independiente.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/divinetribe/Huihui-Qwen3-8B-abliterated-v2-4bit-mlx
- Modelo base abliterated: https://huggingface.co/huihui-ai/Huihui-Qwen3-8B-abliterated-v2
- Modelo original: https://huggingface.co/Qwen/Qwen3-8B
- Coleccion Abliterated MLX for Apple Silicon: https://huggingface.co/collections/divinetribe/abliterated-mlx-for-apple-silicon
- Repositorio Claude Code Local: https://github.com/nicedreamzapp/claude-code-local
- Perfil GitHub del autor: https://github.com/nicedreamzapp
- Leaderboard Agent-12: https://nicedreamzapp.github.io/agent12/
- Perfil Hugging Face del autor: https://huggingface.co/divinetribe
