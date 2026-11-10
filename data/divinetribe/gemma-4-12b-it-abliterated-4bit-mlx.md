# divinetribe/gemma-4-12B-it-abliterated-4bit-mlx

## Resumen

gemma-4-12B-it-abliterated-4bit-mlx es una cuantización de 4 bits en formato MLX del modelo OpenYourMind/gemma-4-12B-it-abliterated-uncensored, que a su vez es una versión "abliterated" de Gemma 4 12B instruct de Google. El modelo ha sido convertido y empaquetado por el usuario divinetribe para su ejecución en Apple Silicon mediante la librería MLX y mlx-vlm, con el objetivo de ofrecer inferencia local en Macs sin dependencia de la nube ni de claves de API.

La variante "abliterated" suprime la dirección interna de rechazo del modelo original, de modo que no rechaza peticiones que, siendo benignas pero delicadas, el modelo base tendería a evitar. Según la model card, esto no constituye una mejora de capacidades, sino una modificación del comportamiento de alineamiento. El modelo conserva la licencia Gemma del modelo original.

Con 11.959.730.224 parámetros totales (aproximadamente 12B) y un tamaño de repositorio de 11 GB, está pensado para ejecutarse en Macs con 24-32 GB de memoria unificada. Es relevante para desarrolladores que quieren un modelo local de tamaño medio, sin censura y compatible con el ecosistema MLX, incluyendo su uso como motor en el stack claude-code-local para agentes en local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 4 (unified), transformer; conversión con mlx-vlm |
| Parametros totales | 11.959.730.224 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits, group size 64 (MLX) |
| Idiomas soportados | en (inglés) |
| Licencia | gemma |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo es una cuantización de 4 bits con group size 64 de un Gemma 4 12B instruct, convertido al formato MLX mediante mlx-vlm. La arquitectura de base es la familia Gemma 4 en su variante "unified", un transformer denso de aproximadamente 12B parámetros. No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de alineamiento (RLHF/DPO) del modelo original en la información proporcionada.

La modificación "abliterated" fue realizada por OpenYourMind sobre el modelo instruct original: se suprime la dirección de rechazo del modelo, lo que altera su comportamiento ante peticiones que el modelo base rechazaría. La conversión a MLX y la cuantización a 4 bits corren a cargo de divinetribe. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal en la información disponible.

## Capacidades

- Generación de texto y conversación multi-turno (pipeline text-generation, etiqueta conversational).
- Comportamiento "uncensored": no rechaza peticiones benignas pero delicadas gracias a la abliteración.
- Ejecución local en Apple Silicon mediante MLX y mlx-vlm.
- Integración como motor en el stack claude-code-local, orientado a agentes en local.
- Capacidades de razonamiento y código: no confirmadas explícitamente en la información disponible; se heredan presumiblemente del modelo Gemma 4 12B instruct base, pero no se documentan.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multimodales: la conversión se realizó con mlx-vlm, lo que sugiere soporte de visión en la arquitectura base, pero no se confirma en la model card.
- Capacidades multilingües: limitadas a inglés según la etiqueta de idioma declarada.

## Casos de uso

- Asistente de código en local sobre Mac: el modelo puede ejecutarse como backend en el stack claude-code-local, apuntando la variable MLX_MODEL a este repositorio, para tareas de generación y edición de código sin salir del equipo.
- Agentes autónomos en Apple Silicon: su tamaño de 11 GB permite mantener el modelo residente en memoria en Macs de 24-32 GB, lo que facilita bucles de agente multi-paso con herramientas del sistema de archivos.
- Prototipado de aplicaciones conversacionales sin API: desarrolladores que quieran iterar sobre prompts y flujos conversacionales sin coste de API ni latencia de red, usando MLX en local.
- Investigación sobre alineamiento y abliteración: útil para estudiar cómo cambia el comportamiento de un modelo al suprimir la dirección de rechazo, comparándolo con el Gemma 4 12B original.
- Generación de contenido creativo sin restricciones de rechazo: escritura de ficción, guiones o textos con temáticas delicadas donde el modelo base tendería a negarse.
- Evaluación comparativa de cuantizaciones: al ser una build de 4 bits MLX, sirve para medir la degradación de calidad frente al modelo en precisión completa en hardware Apple.
- Despliegue de demos offline en portátiles: presentaciones o entornos sin conectividad donde se necesite un LLM de 12B funcional en un MacBook.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: aproximadamente 11 GB para los pesos en 4 bits, más overhead de contexto y KV cache; la model card indica que funciona cómodamente en un Mac de 24 GB y con holgura en uno de 32 GB.
- GPU recomendadas: Apple Silicon (M-series) con memoria unificada de al menos 24 GB; el formato MLX está diseñado específicamente para chips Apple.
- GPU NVIDIA: no aplicable de forma nativa; el formato MLX no está pensado para CUDA.
- ¿Cabe en GPU consumer? Sí, en Macs con 24 GB o más de memoria unificada. En GPUs consumer NVIDIA requeriría conversión a otro formato (no incluida en este repositorio).
- Opciones de despliegue: mlx-vlm (python -m mlx_vlm.generate), mlx-lm, y el stack claude-code-local como servidor compatible con la API de Anthropic.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Plataforma |
|---|---|---|---|---|---|
| gemma-4-12B-it-abliterated-4bit-mlx | ~12B | no disponible | 4-bit MLX | gemma | Apple Silicon |
| OpenYourMind/gemma-4-12B-it-abliterated-uncensored | ~12B | no disponible | precision original | gemma | multiplataforma |
| Gemma 4 12B it (original) | ~12B | no disponible | varias | gemma | multiplataforma |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- La abliteración elimina la dirección de rechazo: el modelo puede producir contenido que el Gemma original rechazaría, con implicaciones éticas y de seguridad en producción.
- Riesgo de alucinación inherente a los LLM de 12B; no se documentan evaluaciones de fidelidad.
- Idiomas: solo inglés declarado; el rendimiento en castellano no está garantizado.
- Longitud de contexto no documentada; conviene verificarla empíricamente antes de usarla en tareas de contexto largo.
- Licencia Gemma: el uso comercial está sujeto a los términos de la licencia Gemma de Google, que incluyen restricciones de uso aceptable; la abliteración no exime de cumplirla.
- Formato MLX exclusivo para Apple Silicon; no es portable directamente a CUDA sin reconversión.
- Cuantización de 4 bits: posible degradación de calidad frente al modelo en precisión completa, especialmente en razonamiento y código.
- No se documentan capacidades de tool calling ni de visión confirmadas; verificar antes de integrar en pipelines de agentes.
- Modelo con pocas descargas y sin likes en el momento de la consulta; menor validación comunitaria que el modelo base.

## Enlaces

- Hugging Face: https://huggingface.co/divinetribe/gemma-4-12B-it-abliterated-4bit-mlx
- Modelo base: https://huggingface.co/OpenYourMind/gemma-4-12B-it-abliterated-uncensored
- Colección Abliterated MLX for Apple Silicon: https://huggingface.co/collections/divinetribe/abliterated-mlx-for-apple-silicon
- Repositorio claude-code-local: https://github.com/nicedreamzapp/claude-code-local
- Perfil GitHub del autor: https://github.com/nicedreamzapp
- Leaderboard Agent-12: https://nicedreamzapp.github.io/agent12/
- MLX: https://github.com/ml-explore/mlx
