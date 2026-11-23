# divinetribe/Qwen3.6-27B-abliterated-4bit-mlx

## Resumen

Qwen3.6-27B-abliterated-4bit-mlx es una cuantización de 4 bits en formato MLX del modelo huihui-ai/Huihui-Qwen3.6-27B-abliterated, una versión "abliterated" (con la dirección de rechazo suprimida) de Qwen3.6 de 27B. Lo publica el usuario divinetribe, que se limita a realizar la conversión y cuantización para Apple Silicon; el trabajo de abliteración original corresponde a huihui-ai. El modelo base es de la familia Qwen3.6 (arquitectura identificada como `qwen3_5`), con 26.895.993.856 parámetros reales según los safetensors del repositorio.

El problema que resuelve es doble: por un lado, ofrece una variante sin rechazos ante peticiones benignas pero "edgy"; por otro, empaqueta el modelo en ~15,2 GB para que quepa y funcione con comodidad en un Mac de 32 GB de memoria unificada, sin nube ni claves de API. Está pensado para inferencia local en Apple Silicon mediante `mlx-lm` y como modelo intercambiable en la pila claude-code-local.

Es relevante ahora porque la cuantización 4-bit con group size 64 permite ejecutar un modelo de ~27B en hardware de consumo de Apple, un punto de equilibrio habitual para MacBook con 32 GB. La licencia declarada es Apache 2.0, aunque el autor recuerda que se sigue aplicando la licencia upstream de Qwen. El modelo está etiquetado únicamente para inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.6 (identificador `qwen3_5`), transformer; detalles de capas y atención no disponibles |
| Parametros totales | 26.895.993.856 (~26,9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit MLX, group size 64 (única incluida en el repo) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 (con sujeción a la licencia upstream de Qwen) |
| Formato de pesos | safetensors en formato MLX (librería `mlx`); no se incluye GGUF |

## Arquitectura y entrenamiento

La información disponible confirma que se trata de un transformer de la familia Qwen3.6 (etiqueta de arquitectura `qwen3_5`) con 26,9B parámetros, convertido a MLX con `mlx-lm` y cuantizado a 4 bits con group size 64. No se detallan el número de capas, la configuración de atención, el tipo de positional encoding ni si incorpora mecanismos híbridos.

Respecto al entrenamiento, esta ficha no aporta datos sobre tokens de entrenamiento, composición del dataset ni fases de RLHF/DPO del modelo original; esa información correspondería a la model card de Qwen3.6 y al repositorio de huihui-ai, no incluidos aquí. La innovación técnica destacable de esta variante es la abliteración: la supresión de la dirección de rechazo en el espacio de activaciones, realizada por huihui-ai, que reduce la probabilidad de respuestas de negativa ante peticiones benignas. La cuantización 4-bit MLX es una modificación de pesos, no un reentrenamiento, y el autor advierte explícitamente que no constituye una mejora de capacidades.

## Capacidades

- Generación de texto conversacional y de propósito general, heredada del modelo Qwen3.6 subyacente.
- Razonamiento y respuesta multi-turno, según la naturaleza conversacional declarada en el pipeline.
- Ejecución local en Apple Silicon mediante `mlx-lm`, sin dependencia de servicios en la nube.
- Integración como backend de agente en la pila claude-code-local a través de un servidor MLX con API compatible con Anthropic (según el autor).
- Comportamiento sin rechazos ante peticiones benignas pero controvertidas, gracias a la abliteración.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponibles; el pipeline es text-generation.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma del repositorio.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Asistente de código local en Mac: el modelo se integra en claude-code-local apuntando la variable `MLX_MODEL` a este repositorio, de modo que un Mac de 32 GB ejecuta tareas de agente sobre el sistema de archivos sin enviar código a la nube.
- Automatización de agentes con verificación en disco: el leaderboard Agent-12 del autor evalúa tareas de agente juzgadas por el sistema de archivos, un escenario donde un modelo de 27B cuantizado a 4 bits ofrece más capacidad que alternativas de 7-8B sin salir del portátil.
- Prototipado de aplicaciones conversacionales en local: con `mlx-lm` y una sola orden de generación se puede validar un flujo de chat multi-turno antes de decidir si se despliega en servidor.
- Investigación sobre alineación y rechazos: la variante abliterated permite estudiar cómo cambia el comportamiento del modelo al eliminar la dirección de rechazo, comparándolo con el Qwen3.6 original en las mismas condiciones.
- Generación de texto creativo sin filtros excesivos: para guiones, ficción o contenido editorial donde los rechazos benignos interrumpen el flujo, manteniendo la coherencia de un modelo de 27B.
- Evaluación comparativa de cuantizaciones: al ser una conversión 4-bit MLX de un modelo conocido, sirve para medir la pérdida de calidad frente a pesos completos en tareas de razonamiento y generación.
- Despliegue offline en entornos sin conectividad: al no requerir API ni conexión, encaja en estaciones de trabajo aisladas donde la política impide usar servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada: ~15,2 GB de pesos en 4-bit; en la práctica se recomienda un Mac con 32 GB de memoria unificada para dejar margen a la caché KV y al sistema, tal como indica el autor.
- GPU recomendadas: Apple Silicon (serie M) con 32 GB o más de memoria unificada. El formato MLX no está pensado para GPU NVIDIA; para A100/H100/RTX 4090 habría que usar otra conversión (por ejemplo, GGUF o AWQ), no incluida en este repositorio.
- ¿Cabe en GPU de consumo? En el ecosistema Apple, sí: es el "sweet spot" declarado para un Mac de 32 GB. En GPUs de consumo NVIDIA de 16 GB no cabe con holgura a 4 bits; en 24 GB (RTX 4090) requeriría cuantizaciones adicionales no publicadas aquí.
- Opciones de despliegue: `mlx-lm` (generación por línea de comandos y API Python) y el servidor MLX compatible con la API de Anthropic de claude-code-local. No se documentan vLLM, llama.cpp, Ollama ni TGI para este repositorio.
- Latencia y throughput: no disponibles; no se publican mediciones de tokens por segundo en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| divinetribe/Qwen3.6-27B-abliterated-4bit-mlx | ~26,9B | no disponible | 4-bit MLX, group 64 | safetensors MLX | apache-2.0 | Hugging Face, ~487 descargas |
| huihui-ai/Huihui-Qwen3.6-27B-abliterated | ~27B (según nombre) | no disponible | pesos completos | safetensors | no disponible en esta ficha | Hugging Face (modelo base) |
| Qwen3.6 27B original | ~27B (según nombre) | no disponible | pesos completos | safetensors | licencia Qwen (según autor) | Hugging Face |

La comparación se limita a las variantes del mismo modelo base porque la información proporcionada no incluye datos de rendimiento ni especificaciones de alternativas de otros fabricantes. No se dispone de cifras de benchmarks que permitan contrastar calidad entre estas versiones.

## Limitaciones y advertencias

- La abliteración elimina la dirección de rechazo, lo que reduce las negativas ante peticiones benignas pero también puede aumentar la probabilidad de contenido inapropiado o dañino; el autor advierte de que no es una mejora de capacidades y pide uso responsable.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se han publicado evaluaciones específicas de fidelidad para esta cuantización.
- La cuantización a 4 bits puede degradar la calidad respecto a los pesos completos, especialmente en tareas de razonamiento matemático y código; no se aportan métricas de esa pérdida.
- Idiomas: solo inglés declarado; el rendimiento en castellano no está garantizado ni evaluado.
- Longitud de contexto: no disponible, lo que impide planificar cargas con ventanas largas.
- Licencia: aunque el repositorio declara Apache 2.0, el autor recuerda que se sigue aplicando la licencia upstream de Qwen; conviene verificar los términos del modelo base antes de un uso comercial.
- Formato exclusivo MLX: no es portable a GPUs NVIDIA ni a servidores x86 convencionales sin una reconversión adicional.
- Las cifras de estrellas y descargas que aparecen en la model card (3.7k estrellas, 59.7k descargas totales) son datos autodeclarados por el autor y no verificables desde esta ficha.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/divinetribe/Qwen3.6-27B-abliterated-4bit-mlx
- Modelo base (abliteración): https://huggingface.co/huihui-ai/Huihui-Qwen3.6-27B-abliterated
- Colección "Abliterated MLX for Apple Silicon": https://huggingface.co/collections/divinetribe/abliterated-mlx-for-apple-silicon-6a222fed584be7ce97633768
- Repositorio claude-code-local: https://github.com/nicedreamzapp/claude-code-local
- Leaderboard Agent-12: https://nicedreamzapp.github.io/agent12/
- Perfil del autor en GitHub: https://github.com/nicedreamzapp
- MLX: https://github.com/ml-explore/mlx
- mlx-lm: no se proporciona URL directa en la información disponible (se instala vía `pip install mlx-lm`)
