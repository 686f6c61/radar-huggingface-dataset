# halilgokdal/mirror-mlx-community-Qwen3.5-9B-MLX-4bit

## Resumen

Este repositorio es un espejo (mirror) byte a byte del modelo `mlx-community/Qwen3.5-9B-MLX-4bit`, mantenido por el usuario halilgokdal para garantizar la disponibilidad de un modelo auxiliar que una aplicación personal para iPad descarga en tiempo de ejecución. No se trata de un modelo original: la autoría y los pesos pertenecen a la comunidad MLX de Qwen, y este repositorio se limita a replicar los ficheros del commit `938d8919941c6e7efd3c7150eff7fe9d12afa631` con verificación SHA-256.

El modelo subyacente es Qwen3.5-9B, un transformer de la familia Qwen 3.5 con 9.409.813.744 parámetros totales, distribuido en formato MLX cuantizado a 4 bits para su ejecución eficiente en hardware Apple Silicon. El repositorio ocupa 6,0 GB y contiene los pesos en safetensors junto con la plantilla de chat (`chat_template.jinja`).

Su relevancia es fundamentalmente práctica: sirve como respaldo ante la posible retirada del repositorio original en HuggingFace, un escenario relevante para aplicaciones que dependen de la descarga automática de pesos en producción. Para cualquier uso que no sea ese respaldo, debe acudirse siempre al repositorio original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen 3.5; detalles de capas y atención no disponibles en la informacion proporcionada) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (formato MLX); otras cuantizaciones no disponibles en este repo |
| Idiomas soportados | no disponible |
| Licencia | other en metadatos del espejo; los pesos originales son Apache-2.0 segun la model card |
| Formato de pesos | safetensors en formato MLX (4-bit), con `chat_template.jinja` |

## Arquitectura y entrenamiento

El repositorio no aporta información sobre la arquitectura interna del modelo original más allá de la etiqueta `qwen3_5` y del formato MLX. No se detallan el número de capas, el mecanismo de atención, la composición del dataset de entrenamiento, el número de tokens vistos ni si hubo fases de RLHF o DPO. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal.

Lo único verificable es que se trata de una conversión a 4 bits realizada por la comunidad MLX (presumiblemente mediante herramientas de `mlx-lm`) a partir de los pesos originales de Qwen3.5-9B, y que el espejo replica exactamente la estructura de ficheros del repositorio fuente, incluida la plantilla de chat Jinja. Cualquier dato adicional sobre entrenamiento debe consultarse en la model card del repositorio original.

## Capacidades

- Generación de texto y conversación multi-turno mediante la plantilla de chat incluida (`chat_template.jinja`).
- Ejecución nativa en Apple Silicon a través del framework MLX, con pesos ya cuantizados a 4 bits.
- Capacidades específicas de razonamiento, código, matemáticas, tool calling, agentes o multimodalidad: no disponibles en la información proporcionada para este repositorio.
- Soporte multilingüe: no disponible en la información proporcionada.
- Modo thinking, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Respaldo de disponibilidad para aplicaciones Apple: el caso de uso declarado por el autor es permitir que una app personal para iPad siga descargando el modelo auxiliar si el repositorio original desaparece; los ficheros son idénticos byte a byte y están verificados por SHA-256.
- Inferencia local en Mac con MLX: al estar en formato MLX 4-bit, puede cargarse con `mlx-lm` en equipos con chip M-series para generar texto sin necesidad de GPU dedicada.
- Prototipado rápido en entorno Apple: útil para probar flujos de chat con la plantilla Jinja incluida antes de migrar a despliegues mayores.
- Espejo interno de artefactos: equipos que necesiten una copia controlada del modelo para pipelines internos pueden apuntar a este repositorio, aunque se recomienda sincronizar con el original.
- Pruebas de integración de descarga de modelos: sirve para validar mecanismos de descarga y verificación de integridad en aplicaciones cliente.
- Archivado a largo plazo: al ser un espejo verificado, contribuye a la preservación del artefacto frente a retiradas del repositorio fuente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/unified memory estimada: el repositorio pesa 6,0 GB, por lo que se necesita al menos ese espacio en memoria unificada para cargar los pesos en 4 bits, más overhead del runtime MLX.
- Hardware recomendado: equipos Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra). El formato MLX no está pensado para GPU NVIDIA o AMD.
- ¿Cabe en hardware de consumo? Sí, en Mac con al menos 8 GB de memoria unificada, aunque 16 GB o más es recomendable para contexto amplio.
- Opciones de despliegue: `mlx-lm` (librería oficial de MLX para LLMs). No es compatible directamente con vLLM, llama.cpp, Ollama o TGI sin reconversión de formato.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-9B MLX 4-bit (este espejo) | 9.409.813.744 | no disponible | MLX safetensors 4-bit | Apache-2.0 (original) | HuggingFace (espejo) |
| mlx-community/Qwen3.5-9B-MLX-4bit (original) | 9.409.813.744 | no disponible | MLX safetensors 4-bit | Apache-2.0 | HuggingFace (fuente) |
| Otras conversiones MLX de la familia Qwen 3.5 | no disponible | no disponible | MLX | Apache-2.0 (presumible) | HuggingFace |

La comparativa relevante es contra el repositorio original, del que este es copia idéntica. No se dispone de datos de benchmarks ni de modelos alternativos comparables en la información proporcionada.

## Limitaciones y advertencias

- Este repositorio es un espejo no oficial: no aporta garantías de mantenimiento, actualizaciones ni soporte por parte de los autores originales.
- La licencia declarada en los metadatos es `other`, mientras que la model card indica Apache-2.0 para los pesos originales; conviene verificar los términos en el repositorio fuente antes de uso comercial.
- El formato MLX 4-bit está orientado a Apple Silicon; no es portable a otros runtimes sin reconversión.
- La cuantización a 4 bits puede degradar la calidad respecto a los pesos en precisión completa; no se documenta la magnitud de esa degradación.
- No se dispone de información sobre sesgos, tasas de alucinación, idiomas soportados ni limitaciones de contexto del modelo original en este repositorio.
- Uso en producción: al ser un espejo personal sin descargas ni mantenimiento comunitario, no es recomendable como fuente primaria; debe apuntarse al repositorio original.
- La fecha de creación indicada (2026-11-05) resulta anómala y conviene tratarla con cautela al evaluar la vigencia del artefacto.

## Enlaces

- Repositorio espejo: https://huggingface.co/halilgokdal/mirror-mlx-community-Qwen3.5-9B-MLX-4bit
- Repositorio original: https://huggingface.co/mlx-community/Qwen3.5-9B-MLX-4bit
- Commit replicado: `938d8919941c6e7efd3c7150eff7fe9d12afa631`
- Framework MLX: https://github.com/ml-explore/mlx
- Librería mlx-lm: https://github.com/ml-explore/mlx-examples/tree/main/llms
