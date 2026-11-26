# divinetribe/Huihui-Qwen3-8B-abliterated-v2-4bit-mlx

## Resumen

Huihui-Qwen3-8B-abliterated-v2-4bit-mlx es una conversión a 4 bits en formato MLX del modelo Huihui-Qwen3-8B-abliterated-v2, publicado por el usuario divinetribe. El modelo original parte de Qwen/Qwen3-8B, un transformer denso de 8.190.735.360 parámetros desarrollado por Alibaba Qwen, al que el proyecto huihui-ai ha aplicado una técnica de "abliteration": la ortogonalización de la dirección de rechazo en los pesos para eliminar las negativas del modelo ante instrucciones que un modelo instruct estándar declinaría.

La relevancia de esta ficha concreta es la cuantización y el empaquetado para Apple Silicon: el repositorio ocupa 4,6 GB y está pensado para ejecutarse íntegramente en local sobre Macs con chip M1, M2, M3, M4 o M5, sin GPU dedicada ni clave de API. Usa cuantización afín de 4 bits con group size 64 generada mediante `mlx_lm.convert`, y se carga con la librería mlx-lm, LM Studio o cualquier herramienta compatible con pesos MLX.

El modelo conserva la arquitectura Qwen3 de 36 capas del original, con licencia Apache 2.0 y declaración de idioma inglés en la model card. Es una pieza orientada a inferencia on-device y a flujos de agente local, no a despliegues en servidor con GPUs NVIDIA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso Qwen3 (36 capas) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | 4-bit affine, group size 64 (MLX) |
| Idiomas soportados | en (segun model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX safetensors (no GGUF, no llama.cpp) |

## Arquitectura y entrenamiento

El modelo es un transformer denso de la familia Qwen3, con 36 capas y 8.190.735.360 parámetros totales. Sobre el modelo base Qwen/Qwen3-8B, el proyecto huihui-ai aplicó abliteration: se calcula la dirección de rechazo en el espacio de activaciones y se ortogonaliza respecto a los pesos, de modo que el modelo deja de activar el comportamiento de negativa ante ciertas instrucciones manteniendo la coherencia en tareas ordinarias. Esta modificación la realiza huihui-ai, no el autor de esta conversión.

La aportación de divinetribe es exclusivamente la cuantización: conversión a 4 bits afín con group size 64 mediante `mlx_lm.convert`, empaquetada como safetensors MLX. No se documentan en la información disponible detalles sobre el dataset de entrenamiento original de Qwen3-8B, el número de tokens, ni si hubo RLHF o DPO; tampoco se describe ninguna innovación de decodificación específica en esta conversión.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo instruct Qwen3-8B.
- Respuesta a instrucciones que un modelo instruct estándar rechazaría, gracias a la abliteration aplicada por huihui-ai.
- Ejecución completamente on-device en Apple Silicon, sin conexión a servicios en la nube.
- Carga mediante mlx-lm (CLI `mlx_lm.generate` y API Python `load`/`generate`) y en LM Studio.
- Compatibilidad con plantillas de chat (`apply_chat_template`) para conversaciones multi-turno.
- Uso como modelo local en flujos de agente sobre Apple Silicon a través de servidores compatibles con la API de Anthropic (proyecto Claude Code Local).
- Soporte de tool calling, agentes multi-paso, visión, audio o modo thinking: no disponible en la información proporcionada para esta conversión.

## Casos de uso

- Asistente conversacional local en Mac: el modelo se carga con mlx-lm y responde por CLI o API Python sin salir del equipo, adecuado para entornos con requisitos de privacidad o sin conectividad.
- Agente de código on-device: según la model card, forma parte del conjunto de modelos de Claude Code Local, que expone una API compatible con Anthropic sobre MLX, de modo que puede usarse como motor de un agente de edición de ficheros en local.
- Prototipado de aplicaciones de chat: la API `load`/`generate` de mlx-lm permite integrar el modelo en scripts Python para validar prompts y plantillas de chat antes de pasar a producción.
- Experimentación con modelos sin censura: útil para investigación sobre comportamiento de rechazo, evaluación de sesgos y estudios de alineación, comparando las respuestas con el Qwen3-8B original.
- Pruebas de red teaming y evaluación de salvaguardas: al eliminar la dirección de rechazo, sirve para generar respuestas que un modelo alineado bloquearía y analizar su tratamiento en pipelines de moderación.
- Inferencia en portátiles con 16 GB de RAM: con 4,6 GB en disco, encaja en Macs de gama media para tareas de generación de texto de longitud moderada sin GPU dedicada.
- Desarrollo de demos offline: distribución de una demo de generación de texto que funciona sin API key ni backend, cargable en LM Studio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM unificada estimada: 4,6 GB de pesos en disco; la model card indica que 16 GB de RAM en Mac es "cómodo" para ejecutarlo.
- GPU recomendadas: no aplica GPU dedicada; el modelo está diseñado para Apple Silicon (M1, M2, M3, M4, M5) con memoria unificada.
- Cabe en GPU de consumo: no está pensado para GPUs NVIDIA ni AMD; el formato MLX safetensors no es compatible con llama.cpp ni con CUDA.
- Opciones de despliegue: mlx-lm (CLI y Python), LM Studio y cualquier herramienta que lea modelos MLX; también a través del servidor MLX-native del proyecto Claude Code Local.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Huihui-Qwen3-8B-abliterated-v2-4bit-mlx (este) | 8,19 B | no disponible | MLX safetensors 4-bit | Apache 2.0 | Solo Apple Silicon, sin censura |
| Qwen/Qwen3-8B | 8,19 B | no disponible | safetensors (BF16) | Apache 2.0 | Modelo base alineado, multiplataforma |
| huihui-ai/Huihui-Qwen3-8B-abliterated-v2 | 8,19 B | no disponible | safetensors (BF16) | Apache 2.0 | Versión abliterated sin cuantizar |
| Versiones GGUF de Qwen3-8B | 8,19 B | no disponible | GGUF | Apache 2.0 | Compatibles con llama.cpp/Ollama, no con MLX |

La comparación se limita a variantes del mismo modelo base porque la información disponible no permite contrastar con otras familias de forma fiable. La diferencia clave entre ellas es el formato y el público objetivo: MLX para Apple Silicon frente a safetensors o GGUF para otras plataformas.

## Limitaciones y advertencias

- Modelo sin censura: la abliteration elimina la dirección de rechazo, por lo que puede generar contenido que un modelo alineado bloquearía; el usuario es responsable del uso y del cumplimiento legal.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad para esta conversión; la cuantización a 4 bits puede degradar ligeramente la calidad respecto al modelo en BF16.
- Idiomas: la model card declara únicamente inglés; no hay evidencia de rendimiento fiable en castellano ni en otros idiomas.
- Contexto: no se especifica la longitud de contexto soportada en la información disponible; conviene verificarla antes de usarlo con documentos largos.
- Plataforma: el formato MLX safetensors no es portable a llama.cpp, vLLM, TGI ni GPUs NVIDIA; queda restringido a Apple Silicon.
- Licencia: Apache 2.0 permite uso comercial, pero debe respetarse la licencia del modelo base Qwen3-8B y la atribución a huihui-ai por la abliteration.
- Caveat de producción: al tratarse de una cuantización de 4 bits realizada por un tercero, no hay garantías de paridad numérica con el modelo original; conviene validar en el caso de uso concreto.
- Advertencia sobre la model card: incluye estadísticas de descargas y estrellas de GitHub que no son verificables desde la información de Hugging Face y no deben tomarse como métricas de calidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/divinetribe/Huihui-Qwen3-8B-abliterated-v2-4bit-mlx
- Modelo base abliterated: https://huggingface.co/huihui-ai/Huihui-Qwen3-8B-abliterated-v2
- Modelo original: https://huggingface.co/Qwen/Qwen3-8B
- Colección de modelos MLX abliterated: https://huggingface.co/collections/divinetribe/abliterated-mlx-for-apple-silicon
- Repositorio Claude Code Local: https://github.com/nicedreamzapp/claude-code-local
- Leaderboard Agent-12: https://nicedreamzapp.github.io/agent12/
- Perfil del autor en GitHub: https://github.com/nicedreamzapp
- Perfil del autor en Hugging Face: https://huggingface.co/divinetribe
