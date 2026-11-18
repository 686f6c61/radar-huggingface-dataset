# SectileLabs/qwen38_flash_next_180b_int

## Resumen

Qwen3.8-Flash-Next 180B GInfer INT es un paquete de pesos cuantizados en formato entero (INT, groupwise) del modelo Qwen3.8-Flash-Next, publicado por Sectile Labs para su motor de inferencia propietario GInfer (y para GChat, construido sobre este). No se trata de un modelo entrenado desde cero por Sectile Labs, sino de una conversión y cuantización del modelo base de Qwen, orientada a despliegues de alta concurrencia y contexto largo sobre GPUs NVIDIA.

El paquete se distribuye como ficheros únicos `.ginfer` que solo pueden cargarse con GInfer o GChat; no son safetensors ni GGUF y otros runtimes no pueden cargarlos. El repositorio ocupa 301,4 GB e incluye tres variantes con tensor-parallel de 1, 2 y 4 GPUs, todas con una capa MTP (multi-token prediction) integrada que actúa como drafter para decodificación especulativa.

La relevancia de esta publicación es operativa: ofrece una vía de despliegue cuantizada del modelo Qwen3.8-Flash-Next (180B) con decodificación especulativa incorporada y reparto multi-GPU, bajo la licencia Qwen Community License 1.0. No hay información pública sobre benchmarks ni sobre el pipeline de la tarea en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3.8-Flash-Next; el paquete incluye capa MTP integrada) |
| Parámetros totales | 180B (según el nombre del modelo) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | INT (pesos enteros groupwise); expertos enrutados en W4A16 (AutoRound) |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 (campo `other`, `license_name: qwen-community-1.0`) |
| Formato de pesos | `.ginfer` (paquete propietario de GInfer; no safetensors ni GGUF) |

## Arquitectura y entrenamiento

El paquete deriva del modelo base Qwen/Qwen3.8-Flash-Next (revisión `de4b8e4d43b917e7706784d8bb445c9af86a3540`). La model card indica que los expertos enrutados provienen de Intel/Qwen3.8-Flash-Next-W4A16-AutoRound (revisión `4c67bf68`), convertidos al formato GInfer, mientras que el resto de componentes (atención, expertos compartidos, routers, embedding, cabeza de salida y capa MTP) fue cuantizado por Sectile Labs a partir de los pesos BF16 oficiales de Qwen y posteriormente convertido a `.ginfer`.

La presencia de expertos enrutados y expertos compartidos confirma una arquitectura de mezcla de expertos (MoE), aunque la model card no detalla el número de expertos, la proporción de parámetros activos ni la composición del dataset de entrenamiento. La innovación técnica destacable del paquete es la inclusión de una capa MTP integrada que funciona como drafter para decodificación especulativa, junto con el soporte de tensor-parallel de 1, 2 y 4 GPUs para repartir el modelo entre GPUs idénticas. No se dispone de información sobre RLHF, DPO ni número de tokens de entrenamiento.

## Capacidades

- Generación de texto y razonamiento: heredadas del modelo base Qwen3.8-Flash-Next, aunque la model card no detalla capacidades específicas.
- Decodificación especulativa: la capa MTP integrada actúa como drafter para acelerar la generación.
- Despliegue multi-GPU: variantes con tensor-parallel de 1, 2 y 4 GPUs para GPUs idénticas.
- Ejecución en GPUs NVIDIA Ampere, Ada y Blackwell.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales (visión, audio, thinking mode): no disponible en la información proporcionada.

## Casos de uso

- Despliegue de alta concurrencia en producción: GInfer está descrito por Sectile Labs como un motor para trabajo rápido, de alta concurrencia y contexto largo sobre GPUs NVIDIA, por lo que el paquete encaja en servicios con muchas peticiones simultáneas.
- Cargas de trabajo de contexto largo: el motor GInfer está orientado explícitamente a contexto largo, adecuado para tareas que requieren procesar documentos extensos o conversaciones prolongadas.
- Despliegue en un solo servidor con una GPU: la variante `tp1` (100.446.099.456 bytes) permite cargar el modelo completo en una única GPU NVIDIA.
- Despliegue en servidores de dos o cuatro GPUs: las variantes `tp2` y `tp4` reparten el modelo entre GPUs idénticas, útil cuando no se dispone de una GPU con memoria suficiente para la variante de una sola GPU.
- Integración en GChat: al estar construido sobre GInfer, el paquete puede usarse directamente en la aplicación de chat de Sectile Labs.
- Reducción de latencia en generación: la capa MTP integrada como drafter permite decodificación especulativa, útil en aplicaciones interactivas sensibles a la latencia.
- Inferencia cuantizada en INT: el formato groupwise reduce el espacio de pesos frente a BF16, adecuado para entornos con restricciones de memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Tamaño de cada paquete: 100.446.099.456 bytes (tp1), 100.451.960.328 bytes (tp2) y 100.505.213.192 bytes (tp4), aproximadamente 100 GB por paquete.
- VRAM estimada: no disponible de forma explícita; el tamaño del fichero (~100 GB) da una referencia del espacio de pesos a cargar, más la memoria adicional para el contexto y el estado de inferencia.
- GPUs compatibles: NVIDIA Ampere, Ada y Blackwell.
- Configuraciones: 1 GPU (tp1), 2 GPUs idénticas (tp2) o 4 GPUs idénticas (tp4).
- ¿Cabe en GPU de consumo? No disponible en la información proporcionada.
- Opciones de despliegue: únicamente GInfer y GChat; no es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next 180B GInfer INT (este) | 180B | no disponible | `.ginfer` (solo GInfer/GChat) | Qwen Community License 1.0 | Hugging Face, 0 descargas |
| Qwen/Qwen3.8-Flash-Next (base) | 180B | no disponible | BF16 (safetensors, presumiblemente) | Qwen Community License 1.0 | Hugging Face |
| Intel/Qwen3.8-Flash-Next-W4A16-AutoRound | 180B | no disponible | W4A16 (AutoRound) | Qwen Community License 1.0 | Hugging Face |

No se dispone de datos de rendimiento para comparar con alternativas de la misma categoría.

## Limitaciones y advertencias

- Formato propietario: los ficheros `.ginfer` solo funcionan con GInfer y GChat; no se pueden cargar en otros runtimes ni convertir directamente a safetensors o GGUF según la model card.
- Licencia: Qwen Community License 1.0, con requisitos de retención de avisos y términos específicos sobre Model-as-a-Service y negocios de AI Work Assistant; es necesario leer el fichero `LICENSE` antes de un uso comercial.
- Trazabilidad de licencias: los expertos enrutados provienen de un paquete de Intel con la misma licencia, pero sin fichero de licencia propio; la model card indica que quedan cubiertos por la Qwen Community License 1.0.
- Idiomas y sesgos: no disponibles en la información proporcionada.
- Riesgo de alucinación: no documentado en la información proporcionada.
- Límites de contexto: no disponibles en la información proporcionada.
- Repositorio sin descargas ni likes: no hay evidencia pública de uso ni validación por la comunidad.
- Verificación de integridad: la model card proporciona hashes SHA-256 para cada paquete, que deben comprobarse tras la descarga.
- Hardware: requiere GPUs NVIDIA Ampere, Ada o Blackwell; no se documenta compatibilidad con otros aceleradores.

## Enlaces

- Hugging Face: https://huggingface.co/SectileLabs/qwen38_flash_next_180b_int
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Expertos enrutados (Intel AutoRound): https://huggingface.co/Intel/Qwen3.8-Flash-Next-W4A16-AutoRound
- Licencia Qwen Community License 1.0: fichero `LICENSE` del repositorio
