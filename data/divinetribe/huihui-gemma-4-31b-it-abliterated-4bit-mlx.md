# divinetribe/Huihui-gemma-4-31B-it-abliterated-4bit-mlx

## Resumen

Huihui-gemma-4-31B-it-abliterated-4bit-mlx es una conversión a 4 bits en formato MLX del modelo Huihui-gemma-4-31B-it-abliterated, que a su vez deriva de google/gemma-4-31b-it. Lo publica el usuario divinetribe en Hugging Face y está pensado exclusivamente para inferencia local en Apple Silicon (M1 a M5), sin GPU dedicada ni servicios en la nube. El modelo conserva la arquitectura Gemma 4 con aproximadamente 30.700 millones de parámetros y se distribuye en 17,3 GB repartidos en cuatro shards de safetensors MLX.

La particularidad del modelo es la abliteración: se ha eliminado la dirección de rechazo de los pesos, de modo que responde a instrucciones que un modelo instruct estándar rechazaría, manteniendo coherencia en tareas ordinarias. La abliteración la realiza huihui-ai; divinetribe solo hace la cuantización y el empaquetado MLX. Es un modelo de generación de texto en inglés, con licencia Apache 2.0 declarada en el repo, aunque el modelo base original de Google tiene sus propios términos de uso que conviene revisar.

Su relevancia actual es práctica: permite ejecutar un modelo de 31B en un Mac de 32 GB de RAM unificada con un solo comando de mlx-lm o desde LM Studio, lo que lo convierte en una opción para desarrollo local de agentes y experimentación sin censura. No está pensado para servidores con GPU NVIDIA ni para despliegues en producción a gran escala.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer Gemma 4 (según model card) |
| Parámetros totales | 30.697.345.280 (≈30,7B) |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 4-bit affine, group size 64 (via mlx_lm.convert) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 (repo); modelo base google/gemma-4-31b-it con sus propios términos |
| Formato de pesos | MLX safetensors (4 shards, sin GGUF) |

## Arquitectura y entrenamiento

El modelo es una cuantización de Huihui-gemma-4-31B-it-abliterated, que parte de google/gemma-4-31b-it. La model card indica arquitectura Gemma 4, pero no detalla la composición interna (número de capas, dimensiones, tipo de atención) ni los datos de entrenamiento originales. Tampoco se especifican el número de tokens de preentrenamiento, la composición del dataset ni si hubo RLHF o DPO; esa información correspondería a la model card de Google, no incluida en la información proporcionada.

La innovación técnica destacable es doble. Por un lado, la abliteración de huihui-ai: se ortogonaliza la dirección de rechazo en los pesos, de modo que el modelo deja de activar respuestas de negativa ante ciertas instrucciones. Por otro, la conversión a MLX de divinetribe: cuantización 4-bit affine con group size 64 mediante `mlx_lm.convert`, empaquetada en safetensors MLX para ejecución nativa en Apple Silicon. No hay decodificación especulativa, atención lineal ni otras optimizaciones anunciadas en la información disponible.

## Capacidades

- Generación de texto conversacional en inglés con plantilla de chat (apply_chat_template).
- Razonamiento general y respuesta a instrucciones sin las negativas típicas de un modelo instruct estándar, gracias a la abliteración.
- Ejecución completamente local y on-device en Macs con Apple Silicon, sin API key ni conexión a la nube.
- Integración con mlx-lm (CLI `mlx_lm.generate` y API Python `load`/`generate`) y con LM Studio y otras herramientas que lean modelos MLX.
- Uso como motor de agentes locales dentro del proyecto Claude Code Local, que expone una API compatible con Anthropic sobre MLX.
- Capacidades multilingües: limitadas al inglés según la model card.
- Tool calling, function calling, modo thinking, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional local en un Mac: cargar el modelo con mlx-lm o LM Studio y mantener conversaciones multi-turno sin enviar datos a terceros; encaja por su tamaño de 17,3 GB y su ejecución on-device.
- Desarrollo de agentes locales: usarlo como backend de Claude Code Local, que traduce peticiones de la API de Anthropic a MLX, para tareas de edición de ficheros y ejecución de comandos en la máquina del desarrollador.
- Experimentación con modelos sin censura: investigar comportamiento, sesgos y robustez de un modelo abliterado frente a uno instruct estándar, en un entorno controlado y local.
- Prototipado de aplicaciones de texto en inglés: iterar sobre prompts y plantillas de chat con la API Python de mlx-lm antes de decidir un despliegue mayor.
- Evaluación comparativa en hardware Apple: medir latencia y calidad de un 31B cuantizado a 4 bits frente a alternativas más pequeñas en el mismo Mac, usando el leaderboard Agent-12 como referencia de tareas reales.
- Docencia y demos offline: ejecutar el modelo en un portátil sin conexión para talleres sobre cuantización, abliteración e inferencia en Apple Silicon.
- Pruebas de red teaming: generar respuestas a instrucciones sensibles para auditar filtros y políticas en un pipeline de seguridad, asumiendo la responsabilidad legal del uso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM unificada: 32 GB recomendados; 24 GB para contextos cortos según la model card.
- Almacenamiento: 17,3 GB en disco (4 shards).
- GPU: no requiere GPU dedicada; funciona en Apple Silicon M1, M2, M3, M4 y M5.
- Cabe en consumer hardware: sí, en Macs con 24-32 GB de memoria unificada; no está pensado para GPUs NVIDIA.
- Despliegue: mlx-lm (CLI y Python), LM Studio y cualquier herramienta que lea modelos MLX. No soporta GGUF, llama.cpp ni vLLM según la model card.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| divinetribe/Huihui-gemma-4-31B-it-abliterated-4bit-mlx | ≈30,7B | no disponible | MLX safetensors 4-bit | apache-2.0 (repo) | Abliterado, solo Apple Silicon |
| huihui-ai/Huihui-gemma-4-31B-it-abliterated | no disponible | no disponible | safetensors (sin cuantizar) | no disponible | Modelo base abliterado, requiere más memoria |
| google/gemma-4-31b-it | ≈31B | no disponible | safetensors | términos de Google | Modelo instruct original, con filtros |
| Otros modelos abliterados MLX de divinetribe (Llama 3.3 70B, Qwen3, Qwen3-VL, Hermes 4, Muse Glimmer) | variable | no disponible | MLX | variable | Misma colección, distinto tamaño y capacidades |

## Limitaciones y advertencias

- Modelo sin censura: la abliteración elimina la dirección de rechazo, por lo que puede generar contenido que un instruct estándar bloquearía; el usuario es responsable del uso y del cumplimiento legal.
- La licencia Apache 2.0 del repo no sustituye a los términos del modelo base google/gemma-4-31b-it; conviene revisar las condiciones de uso comercial del modelo original antes de desplegarlo.
- Solo inglés según la model card; el rendimiento en castellano no está garantizado ni documentado.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad ni benchmarks; no hay datos que permitan estimar la tasa de errores.
- Solo Apple Silicon: no hay GGUF ni soporte para llama.cpp, vLLM o GPUs NVIDIA, lo que limita su uso en servidores convencionales.
- Contexto no documentado: se desconoce la longitud máxima de contexto, un dato crítico para agentes y conversaciones largas.
- La cuantización 4-bit con group size 64 puede degradar la calidad frente al modelo sin cuantizar; no se han publicado comparativas.
- El repo tiene pocas descargas (398) y ningún like en el momento de la consulta; es un artefacto de comunidad, no un modelo con validación extensa.
- Los datos de estrellas y descargas que aparecen en la model card son cifras autoinformadas por el autor y no verificables desde la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/divinetribe/Huihui-gemma-4-31B-it-abliterated-4bit-mlx
- Modelo base abliterado: https://huggingface.co/huihui-ai/Huihui-gemma-4-31B-it-abliterated
- Modelo original de Google: https://huggingface.co/google/gemma-4-31b-it
- Colección Abliterated MLX for Apple Silicon: https://huggingface.co/collections/divinetribe/abliterated-mlx-for-apple-silicon
- Repo Claude Code Local: https://github.com/nicedreamzapp/claude-code-local
- Leaderboard Agent-12: https://nicedreamzapp.github.io/agent12/
- Perfil del autor en GitHub: https://github.com/nicedreamzapp
- Perfil del autor en Hugging Face: https://huggingface.co/divinetribe
