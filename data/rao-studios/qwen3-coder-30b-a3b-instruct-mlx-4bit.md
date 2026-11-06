# rao-studios/Qwen3-Coder-30B-A3B-Instruct-mlx-4bit

## Resumen

`rao-studios/Qwen3-Coder-30B-A3B-Instruct-mlx-4bit` es un espejo (mirror) byte a byte del repositorio `mlx-community/Qwen3-Coder-30B-A3B-Instruct-4bit`, que a su vez es la conversión a formato MLX con cuantización de 4 bits del modelo `Qwen/Qwen3-Coder-30B-A3B-Instruct` del equipo Qwen. No se trata, por tanto, de un modelo entrenado por Rao Studios, sino de una réplica de pesos, tokenizador, plantilla de chat y configuración idénticos al original, publicada para que las instalaciones de la aplicación Craft descarguen siempre los mismos bytes desde un repositorio controlado y fijado a un commit concreto.

El modelo subyacente es un transformer de tipo Mixture-of-Experts (arquitectura `qwen3_moe`) de 48 capas, con 30.532.122.624 parámetros totales según los safetensors y 3.000 millones de parámetros activos por token (de ahí el sufijo A3B). Está especializado en generación de código y soporta una ventana de contexto de 262.144 tokens, lo que lo sitúa en la categoría de modelos de código de contexto largo orientados a agentes y flujos de trabajo con herramientas.

Su relevancia práctica radica en dos factores: la licencia Apache 2.0, que permite uso comercial sin restricciones adicionales, y el formato MLX de 4 bits, que reduce el peso en disco a 17,2 GB y hace viable la inferencia local en equipos Apple Silicon con memoria unificada suficiente. Es, en la práctica, una vía para ejecutar un modelo de código de 30B con activación dispersa en un Mac, sin GPU dedicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen3_moe` (Mixture-of-Experts), 48 capas |
| Parametros totales | 30.532.122.624 |
| Parametros activos | 3.000 millones (aproximado, segun el sufijo A3B del nombre) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | 4 bits, group size 64 (MLX) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (4 shards, 1.351 tensores, 17,2 GB) |

## Arquitectura y entrenamiento

La arquitectura es un transformer con capas de mezcla de expertos (`qwen3_moe`) de 48 capas. El modelo original fue entrenado por el equipo Qwen; esta ficha no dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO, por lo que esos datos se marcan como no disponibles. La conversión a MLX en 4 bits con group size 64 fue realizada por `mlx-community`, y Rao Studios únicamente replica esos archivos sin recuantizar ni editar nada, añadiendo la model card y una copia literal de la licencia Apache 2.0.

La innovación técnica destacable no está en el entrenamiento sino en el formato de despliegue: la cuantización de 4 bits con group size 64 reduce el peso a 17,2 GB manteniendo 1.351 tensores en safetensors, lo que permite cargar el modelo en memoria unificada de Apple Silicon. La plantilla de chat implementa el protocolo de herramientas de Qwen3-Coder en XML: las herramientas se declaran como XML y el modelo responde con un bloque `<tool_call>` cuyos parámetros son texto plano entre etiquetas, un formato que simplifica el parseo en clientes ligeros.

## Capacidades

- Generación de código en múltiples lenguajes, con especial énfasis en tareas de edición y refactorización de archivos.
- Razonamiento multi-paso orientado a tareas de ingeniería de software.
- Tool calling mediante el protocolo XML de Qwen3-Coder (`<tool_call>`, `<function=...>`, `<parameter=...>`), con parámetros en texto plano.
- Soporte de agentes: la plantilla de chat está diseñada para que el modelo encadene llamadas a herramientas y edite archivos de forma autónoma.
- Contexto largo de 262.144 tokens, adecuado para repositorios completos o conversaciones extensas.
- Capacidades multilingües: no disponibles en la información proporcionada.
- No se documentan capacidades de visión, audio ni modo de razonamiento explícito (thinking mode) en la información disponible.

## Casos de uso

- Edición autónoma de archivos en un IDE o agente de código: el modelo emite bloques `<tool_call>` con parámetros `path`, `old_string` y `new_string`, lo que permite aplicar parches quirúrgicos sobre ficheros existentes sin reescribir el archivo completo.
- Asistente de refactorización en local sobre Apple Silicon: con 17,2 GB en 4 bits, se puede cargar en un Mac con memoria unificada de 32 GB o más y trabajar sobre un repositorio sin enviar código a servicios externos.
- Generación de código en pipelines de CI/CD: al soportar tool calling y licencia Apache 2.0, puede integrarse en scripts de automatización que generen tests, documentación o correcciones a partir de errores de compilación.
- Análisis de repositorios completos: la ventana de 262.144 tokens permite introducir varios módulos o un monorepo mediano en una sola pasada para tareas de revisión, búsqueda de dependencias o migraciones.
- Agentes de terminal o asistentes de línea de comandos: el formato XML de llamadas a herramientas es fácil de parsear en clientes nativos y encaja en flujos donde el modelo decide qué comando o función invocar.
- Prototipado rápido de aplicaciones de código en macOS: mediante `mlx-lm` se puede levantar un servidor de inferencia local con `mlx_lm.generate` o integrarlo en scripts Python sin necesidad de CUDA.
- Enseñanza y experimentación con modelos MoE: al ser un espejo reproducible con hashes SHA-256 verificados, sirve para comparar resultados entre ejecuciones y para auditar el contenido de los pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: aproximadamente 17,2 GB solo para los pesos en 4 bits; hay que sumar el overhead de la caché KV, que con 262.144 tokens de contexto puede ser considerable. Para uso práctico se recomienda un mínimo de 24-32 GB de memoria unificada.
- GPU recomendadas: Apple Silicon (series M1/M2/M3/M4 Pro, Max y Ultra) con memoria unificada suficiente. El formato MLX no está pensado para GPUs NVIDIA.
- ¿Cabe en GPU de consumo? En el ecosistema Apple, sí: un Mac con 32 GB o más puede cargarlo; con 24 GB el margen es muy ajustado y obliga a limitar el contexto. En GPUs NVIDIA de consumo no es el formato adecuado; para esas plataformas habría que recurrir a la versión GGUF o a los pesos originales.
- Opciones de despliegue: `mlx-lm` (biblioteca nativa para MLX), con `mlx_lm.generate` para CLI y APIs de Python para integración. vLLM, llama.cpp, Ollama y TGI no son compatibles directamente con este repositorio MLX; para esos motores habría que usar otras conversiones del modelo base.
- Latencia y throughput: no disponibles en la información proporcionada. Dependen del chip Apple concreto y de la longitud de contexto utilizada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / disponibilidad |
|---|---|---|---|---|
| rao-studios/Qwen3-Coder-30B-A3B-Instruct-mlx-4bit | 30,5B totales / ~3B activos | 262.144 | Apache 2.0 | MLX 4 bits, safetensors, 17,2 GB |
| Qwen/Qwen3-Coder-30B-A3B-Instruct | 30,5B totales / ~3B activos | 262.144 | Apache 2.0 | Pesos originales en safetensors (BF16), disponible en Hugging Face |
| mlx-community/Qwen3-Coder-30B-A3B-Instruct-4bit | 30,5B totales / ~3B activos | 262.144 | Apache 2.0 | MLX 4 bits, safetensors; mismo contenido que este mirror |

Las tres variantes comparten arquitectura, contexto y licencia; la diferencia es el formato de pesos y el repositorio de distribución. No se dispone de datos de benchmarks para comparar rendimiento entre ellas ni frente a otros modelos de código de tamaño similar.

## Limitaciones y advertencias

- Este repositorio es un espejo, no un modelo entrenado por Rao Studios; cualquier problema de calidad o sesgo proviene del modelo original de Qwen.
- No se han publicado datos sobre sesgos conocidos ni sobre tasas de alucinación en la información disponible.
- Los idiomas soportados no están documentados en la información proporcionada; no se puede garantizar un rendimiento uniforme fuera del inglés y los lenguajes de programación habituales.
- El contexto de 262.144 tokens es teórico; en la práctica, la caché KV a esa longitud puede exceder la memoria disponible en equipos de 32 GB, por lo que conviene limitar la ventana según el hardware.
- El formato MLX limita el despliegue a Apple Silicon; no es portable a CUDA sin reconversión.
- Aunque la licencia Apache 2.0 permite uso comercial, conviene verificar la licencia y condiciones del modelo original de Qwen antes de redistribuir derivados.
- El repositorio incluye hashes SHA-256 verificados de cada archivo, pero el usuario debe confiar en el proceso de espejo de Rao Studios; se recomienda validar los hashes contra el repositorio de `mlx-community` si la reproducibilidad es crítica.
- No se ha eliminado el script `qwen3coder_tool_parser.py` del ecosistema original por motivos de seguridad del espejo; si se necesita el parser oficial, hay que obtenerlo del repositorio de Qwen o de `mlx-community`.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/rao-studios/Qwen3-Coder-30B-A3B-Instruct-mlx-4bit
- Modelo base en MLX: https://huggingface.co/mlx-community/Qwen3-Coder-30B-A3B-Instruct-4bit
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3-Coder-30B-A3B-Instruct
- Commit de referencia del espejo: `6e302ea604ad9ab206367e2c501d1571023e7b6d`
- Commit de la licencia original: `b2cff646eb4bb1d68355c01b18ae02e7cf42d120`
- Biblioteca MLX-LM: https://github.com/ml-explore/mlx-lm
