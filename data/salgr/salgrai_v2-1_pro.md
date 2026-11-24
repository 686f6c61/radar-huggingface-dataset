# salgr/SalgrAI_v2.1_Pro

## Resumen

SalgrAI v2.1 Pro es un ajuste fino (finetune) de Qwen2.5-Coder-0.5B-Instruct, desarrollado por el usuario salgr y publicado en Hugging Face bajo licencia Apache 2.0. Se trata de un modelo compacto de 310.187.904 parámetros orientado a generación de texto conversacional en ruso, con especial énfasis en el mantenimiento de la coherencia de roles dentro de diálogos multi-turno (distinguir el nombre del usuario del nombre del asistente). El modelo deriva de una versión previa denominada SalgrAI v2 Pro Full, que a su vez parte del modelo base de Qwen.

La relevancia de este modelo es acotada: se trata de un experimento de destilación y ajuste sobre una arquitectura pequeña, con un vocabulario reducido a 75.776 posiciones y una anchura de MLP recortada de 4864 a 3072 respecto al original. El autor documenta un conjunto de evaluaciones propias (SBKCB V1.0, pruebas de historia conversacional, distinción de roles y ejecución de HTML en Chromium) que ofrecen una imagen honesta de sus capacidades y limitaciones, sin recurrir a benchmarks estándar de la industria.

El modelo se distribuye en safetensors BF16 y en GGUF (F16 y Q8_0), lo que facilita su despliegue en llama.cpp y en entornos con recursos limitados. No obstante, el número de descargas y likes es cero en el momento de la consulta, y el autor advierte explícitamente de que el modelo construye frases poco naturales, inventa hechos y confunde roles ante formulaciones desconocidas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen2.5-Coder-0.5B-Instruct) |
| Parametros totales | 310.187.904 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el ejemplo de llama.cpp usa `-c 4096`) |
| Tipos de cuantizacion | BF16 (safetensors), GGUF F16, GGUF Q8_0 |
| Idiomas soportados | Ruso (`ru`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only basado en Qwen2.5-Coder-0.5B-Instruct. El autor indica que, respecto a la variante SalgrAI v2 Pro Full (a su vez derivada del modelo Qwen), se redujo el vocabulario a 75.776 posiciones y se disminuyó la anchura de la MLP de 4864 a 3072. La versión compacta se reconstruyó mediante destilación sobre texto en ruso, código y diálogos. Para esta versión v2.1 Pro se realizó un ajuste fino adicional sobre ejemplos de distinción de roles, habla rusa y pequeñas páginas HTML, con repetición de parte de las tareas previas.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, ni si se emplearon técnicas de RLHF o DPO. Tampoco se documentan innovaciones arquitectónicas más allá del recorte de vocabulario y de la anchura de la MLP. El autor incluye un fichero NOTICE con los detalles de los cambios en pesos y tokenizador.

## Capacidades

- Generación de texto conversacional en ruso, con soporte de diálogos multi-turno mediante plantilla de chat.
- Distinción de roles en conversación: el modelo ha sido ajustado específicamente para recordar el nombre del usuario y diferenciarlo del propio. La prueba de roles reporta 105/105.
- Razonamiento y conocimientos generales limitados: la prueba SBKCB V1.0 reporta 12/90 en la categoría de conocimientos.
- Generación de código: 16/20 en la categoría de programación de SBKCB.
- Generación de pequeñas páginas HTML: solo 2 de 13 programas HTML completos funcionaron correctamente en Chromium.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al ruso según la model card.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Prototipado de asistentes conversacionales en ruso: el modelo puede mantener diálogos multi-turno con memoria del nombre del usuario, adecuado para demos y pruebas de concepto de baja latencia en hardware modesto.
- Experimentación académica con destilación y recorte de vocabulario: sirve como caso de estudio reproducible de cómo afectan estas decisiones a un modelo de 0,3B parámetros.
- Generación de fragmentos de código sencillos en ruso: útil en entornos de asistencia básica donde se requiera una respuesta rápida y el coste computacional sea crítico.
- Pruebas de integración con llama.cpp: el repositorio incluye GGUF con plantilla de chat incorporada y un ejemplo de servidor local, lo que facilita validar pipelines de inferencia.
- Evaluación de robustez en distinción de roles: permite medir la capacidad de un modelo pequeño para no confundir identidades en conversaciones con nombres propios.
- Educación y divulgación: como ejemplo de finetune de bajo coste sobre un modelo base abierto, con métricas propias publicadas y trazabilidad de los cambios.

## Benchmarks y rendimiento

| Prueba | Resultado |
|---|---|
| SBKCB V1.0 (total) | 59/150 |
| SBKCB — conocimientos | 12/90 |
| SBKCB — programación | 16/20 |
| SBKCB — conversación | 31/40 |
| Diálogos cortos con historia | 287/300 |
| Distinción de roles | 105/105 |
| Programas HTML completos en Chromium | 2/13 |

Las pruebas SBKCB se realizaron en llama.cpp con GGUF Q8_0, temperatura 0, penalización de repetición 1,1 y límite de 200 tokens; la evaluación se basa en reglas. La prueba de historia usó los mismos pesos en BF16. La prueba de roles usó Q8_0 y 15 ejecuciones con tres nombres a temperatura 0, con siete respuestas por ejecución. No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,6 GB en BF16 (310M parámetros × 2 bytes), en torno a 0,3 GB en GGUF Q8_0 y 0,6 GB en GGUF F16.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM; el modelo cabe holgadamente en GTX 1650, RTX 3060, RTX 4090, así como en A100 y H100 sin aprovechar su capacidad.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU moderna e incluso en CPU.
- Opciones de despliegue: transformers (versión probada 5.24.0), llama.cpp (`llama-server`), y por extensión cualquier runtime compatible con GGUF.
- Latencia y throughput estimados: no disponibles; el autor no publica cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SalgrAI v2.1 Pro | 310.187.904 | no disponible | ru | Apache 2.0 | Hugging Face |
| Qwen2.5-Coder-0.5B-Instruct | 0,5B (aprox.) | no disponible en la información | multilingüe | Apache 2.0 | Hugging Face |
| SalgrAI v2 Pro Full | no disponible | no disponible | ru | no disponible | referenciado por el autor |

La comparación con alternativas de la misma categoría (modelos de menos de 1B parámetros para conversación en ruso) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- El autor advierte de que el modelo construye a veces frases poco naturales, inventa hechos y confunde roles ante formulaciones desconocidas.
- Los resultados en diálogos cortos caracterizan únicamente los escenarios evaluados; no garantizan generalización.
- Los programas HTML completos suelen requerir corrección manual (solo 2 de 13 funcionaron en Chromium).
- El conocimiento general es muy limitado (12/90 en SBKCB), por lo que no es adecuado para tareas que requieran base factual.
- El modelo está orientado al ruso; no se documenta soporte de otros idiomas.
- La licencia Apache 2.0 permite uso comercial, pero el autor incluye un NOTICE con los cambios en pesos y tokenizador que debe respetarse.
- El modelo no cuenta con descargas ni validación por parte de la comunidad en el momento de la consulta, lo que limita la evidencia externa sobre su comportamiento en producción.
- No se documenta la longitud de contexto efectiva; el ejemplo de llama.cpp emplea 4096 tokens, pero no se confirma como máximo.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/salgr/SalgrAI_v2.1_Pro)
- [Modelo base Qwen2.5-Coder-0.5B-Instruct](https://huggingface.co/Qwen/Qwen2.5-Coder-0.5B-Instruct)
- [Respuestas SBKCB](eval/sbkcb.json)
- [Prueba de historia](eval/context.json)
- [Prueba de roles](eval/roles.json)
- [Prueba HTML](eval/html.json)
- [NOTICE](NOTICE)
- [LICENSE](LICENSE)
