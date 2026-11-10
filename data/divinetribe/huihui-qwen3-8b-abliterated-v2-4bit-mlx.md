# divinetribe/Huihui-Qwen3-8B-abliterated-v2-4bit-mlx

## Resumen

Huihui-Qwen3-8B-abliterated-v2-4bit-mlx es una conversión a 4 bits en formato MLX del modelo huihui-ai/Huihui-Qwen3-8B-abliterated-v2, que a su vez deriva del Qwen/Qwen3-8B de Alibaba. La conversión la mantiene el usuario divinetribe y su objetivo es permitir la inferencia local del modelo en Apple Silicon (chips M1 a M5) sin necesidad de GPU dedicada, servicio en la nube ni clave de API. El repositorio ocupa 4,6 GB en disco y el autor indica que funciona de forma cómoda en un Mac con 16 GB de RAM unificada.

El modelo conserva la arquitectura Qwen3 de 36 capas y 8.190.735.360 parámetros del modelo base, pero con la denominada "abliteración": la dirección de rechazo se ha ortogonalizado fuera de los pesos, de modo que el modelo responde a instrucciones que un modelo instruct estándar declinaría, manteniendo coherencia en tareas ordinarias. La abliteración la realizó huihui-ai; divinetribe solo aporta la cuantización y el empaquetado MLX.

Es relevante ahora porque el ecosistema MLX de Apple ha madurado lo suficiente como para ejecutar modelos de 8B en portátiles, y este repositorio se integra en el proyecto Claude Code Local, que expone un servidor compatible con la API de Anthropic sobre MLX nativo. La licencia declarada es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Qwen3 (36 capas) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit affine, group size 64 (via `mlx_lm.convert`) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | MLX safetensors (no GGUF, no llama.cpp) |

## Arquitectura y entrenamiento

El modelo es un transformer denso de la familia Qwen3, con 36 capas y 8.190.735.360 parámetros, según los datos reales de los safetensors. La model card no detalla la composición del dataset de preentrenamiento, el número de tokens ni si hubo fases de RLHF o DPO en el modelo original; esa información corresponde a la documentación de Qwen/Qwen3-8B y no se reproduce aquí.

La innovación técnica relevante en este repositorio es doble. Por un lado, la abliteración de huihui-ai, que elimina la dirección de rechazo del espacio de activaciones mediante ortogonalización de pesos, preservando la coherencia en tareas generales. Por otro, la cuantización a 4 bits con `mlx_lm.convert` usando cuantización afín con group size 64, empaquetada en safetensors MLX para ejecución nativa en Apple Silicon mediante la librería mlx-lm. No se menciona decodificación especulativa, atención lineal ni otras optimizaciones adicionales en la información disponible.

## Capacidades

- Generación de texto conversacional y respuesta a instrucciones en inglés.
- Respuesta a peticiones que un modelo instruct estándar rechazaría, gracias a la abliteración de los pesos.
- Ejecución completamente local y on-device en Apple Silicon, sin conexión a servicios externos.
- Carga en mlx-lm mediante `mlx_lm.load` y `mlx_lm.generate`, y en LM Studio u otras herramientas compatibles con modelos MLX.
- Integración como backend de agente en Claude Code Local a través de un servidor MLX nativo con API compatible con Anthropic.
- Capacidades multilingües: limitadas al inglés según el campo `language` del repositorio.
- Tool calling, function calling, modo thinking y visión: no disponibles en la información proporcionada.

## Casos de uso

- Asistencia de código en local sobre Mac: el modelo puede cargarse en mlx-lm o LM Studio y usarse como copiloto de programación sin enviar código a la nube, lo que resulta adecuado para entornos con requisitos de confidencialidad y para desarrolladores que trabajan en portátiles Apple.
- Agente autónomo en Claude Code Local: el repositorio forma parte del proyecto Claude Code Local, que expone una API compatible con Anthropic sobre MLX; el modelo actúa como "fighter" en tareas de agente evaluadas por el leaderboard Agent-12, con ejecución 100 % on-device.
- Procesamiento de texto confidencial en un Mac: al no requerir API key ni conexión, encaja en flujos donde el contenido no puede salir del dispositivo, como borradores internos, notas o documentación sensible.
- Experimentación con modelos sin censura: investigadores que estudian el comportamiento de modelos abliterated pueden comparar respuestas frente al Qwen3-8B original en las mismas condiciones de hardware.
- Prototipado rápido de aplicaciones conversacionales: la instalación con `pip install mlx-lm` y una sola llamada a `mlx_lm.generate` permite validar prompts y flujos de chat en minutos sobre un Mac de 16 GB.
- Evaluación de inferencia en Apple Silicon: sirve como banco de pruebas para medir latencia y consumo de memoria de un modelo de 8B cuantizado a 4 bits en chips M1 a M5, sin depender de CUDA.
- Despliegue en estaciones de trabajo sin GPU dedicada: equipos Mac en oficina o laboratorio pueden ejecutar el modelo de forma local para tareas de generación de texto y conversación en inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM unificada: 4,6 GB en disco; el autor indica que 16 GB de RAM unificada en un Mac es "cómodo" para ejecutarlo.
- GPU recomendadas: no aplica GPU dedicada; el modelo está pensado para Apple Silicon (M1, M2, M3, M4 y M5).
- Cabe en consumer hardware: sí, en cualquier Mac moderno con al menos 16 GB de memoria unificada según el autor.
- Opciones de despliegue: mlx-lm (CLI y API Python), LM Studio y cualquier herramienta que lea modelos MLX; también como backend del servidor MLX de Claude Code Local.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Huihui-Qwen3-8B-abliterated-v2-4bit-mlx | 8,19 B | no disponible | MLX safetensors 4-bit | apache-2.0 | Objeto de esta ficha; abliterated y cuantizado para Apple Silicon |
| huihui-ai/Huihui-Qwen3-8B-abliterated-v2 | 8,19 B | no disponible | safetensors (full precision) | apache-2.0 | Modelo base de la abliteración; requiere más memoria y no está empaquetado para MLX |
| Qwen/Qwen3-8B | 8,19 B | no disponible | safetensors | apache-2.0 | Modelo original de Alibaba, con rechazos estándar; no cuantizado para MLX |

## Limitaciones y advertencias

- Modelo sin censura: la abliteración elimina la dirección de rechazo, por lo que puede generar contenido que un modelo instruct estándar declinaría; el usuario es responsable del uso y del cumplimiento legal.
- Sesgos: no se documentan análisis de sesgo en la información disponible; al derivar de Qwen3-8B, hereda los sesgos del preentrenamiento original, que no se detallan.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad ni de tasas de alucinación para esta conversión.
- Idioma: el campo `language` solo declara inglés; el rendimiento en castellano no está garantizado ni documentado.
- Contexto: la longitud de contexto no se especifica en la model card; conviene verificarla en la configuración del modelo antes de usarlo en producción.
- Formato: solo MLX safetensors; no hay GGUF ni compatibilidad con llama.cpp, por lo que no se puede ejecutar en GPU NVIDIA o AMD a través de ese ecosistema.
- Licencia: Apache 2.0 heredada del modelo base; conviene revisar los términos del modelo Qwen3-8B original y las obligaciones aplicables al uso comercial.
- Producción: no hay benchmarks, métricas de latencia ni garantías de calidad publicadas; el repositorio tiene pocas descargas (887) y un solo like, lo que sugiere una validación comunitaria limitada.

## Enlaces

- Hugging Face: https://huggingface.co/divinetribe/Huihui-Qwen3-8B-abliterated-v2-4bit-mlx
- Modelo base abliterated: https://huggingface.co/huihui-ai/Huihui-Qwen3-8B-abliterated-v2
- Modelo original: https://huggingface.co/Qwen/Qwen3-8B
- Colección Abliterated MLX for Apple Silicon: https://huggingface.co/collections/divinetribe/abliterated-mlx-for-apple-silicon
- Proyecto Claude Code Local: https://github.com/nicedreamzapp/claude-code-local
- Leaderboard Agent-12: https://nicedreamzapp.github.io/agent12/
- Perfil del autor en GitHub: https://github.com/nicedreamzapp
- Perfil del autor en Hugging Face: https://huggingface.co/divinetribe
