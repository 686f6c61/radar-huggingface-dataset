# greenfield0810/affine-ark-e2448246c057

## Resumen

El repositorio `greenfield0810/affine-ark-e2448246c057` no contiene un modelo original, sino una copia íntegra (espejo byte a byte) de un checkpoint competidor de la subnet 120 de Bittensor (Affine), preservado por su autor para evitar la pérdida de acceso cuando los repositorios originales se vuelven privados. El checkpoint original pertenece a `alex-drok/affine-5cj9mpkjrr-grape` y se ha archivado con fines de trazabilidad y conservación. Según las etiquetas, se trata de un modelo multimodal de tipo imagen-texto, basado en la arquitectura `qwen3_5_moe` (mezcla de expertos de la familia Qwen 3.5), con 35.107.181.936 parámetros totales (35,1 B). No se dispone de información sobre la longitud de contexto, el número de parámetros activos, la licencia ni los idiomas soportados. El repositorio tiene 0 descargas y 0 likes, y se publicó en agosto de 2026.

Este archivo es relevante para la comunidad de Bittensor porque documenta un punto de control concreto del subnet 120, con su hash SHA-256, su historial de duelos y su grupo de repositorios espejo. No se trata de un modelo listo para producción, sino de una instantánea de investigación que permite reproducir y auditar el estado de un checkpoint en una fecha dada. Su interés radica en la transparencia y en la posibilidad de acceder a pesos que podrían desaparecer de la plataforma original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos) basada en Qwen3.5, con capacidad imagen-texto (según etiquetas) |
| Parámetros totales | 35.107.181.936 (35,1 B) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en safetensors, sin cuantización) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (16 shards, 70,21 GB en total) |

## Arquitectura y entrenamiento

La arquitectura exacta no se detalla en la información proporcionada. Las etiquetas indican `qwen3_5_moe`, lo que sugiere que el modelo sigue el diseño de mezcla de expertos (MoE) de la familia Qwen 3.5, probablemente con un mecanismo de activación por router para seleccionar un subconjunto de parámetros por token. El checkpoint también es multimodal (`image-text-to-text`), por lo que incorpora un codificador visual y un módulo de proyección para procesar imágenes junto con texto. No se ofrecen datos sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO. El modelo es un espejo de un checkpoint de Bittensor, por lo que su entrenamiento original fue realizado por terceros y no se describe en este repositorio.

## Capacidades

- **Procesamiento multimodal imagen-texto**: el modelo acepta tanto imágenes como texto, lo que permite tareas como respuesta a preguntas visuales, descripción de imágenes o razonamiento multimodal.
- **Conversación**: la etiqueta `conversational` indica que está diseñado para mantener diálogos de múltiples turnos.
- **Compatibilidad con endpoints**: la etiqueta `endpoints_compatible` sugiere que puede desplegarse en infraestructuras de inferencia estándar (por ejemplo, vLLM o TGI) sin adaptaciones especiales.
- **Razonamiento y generación de texto**: al tratarse de un modelo MoE de gran tamaño, es probable que tenga capacidades de razonamiento, generación de código y matemáticas, aunque no se han verificado.
- **Multilingüismo**: no hay información sobre idiomas soportados, pero los modelos de la familia Qwen suelen cubrir múltiples lenguas; aquí no se confirma.

## Casos de uso

Dado que se trata de un archivo espejo y no de un modelo con documentación de uso, los casos de uso son hipotéticos y dependen de la validez del checkpoint:

- **Investigación y reproducción de resultados**: el archivo permite auditar y reproducir los resultados de un checkpoint concreto de la subnet 120 de Bittensor, incluyendo su comportamiento en duelos y su rendimiento en tareas de texto e imagen.
- **Estudio de arquitecturas MoE multimodales**: los desarrolladores pueden analizar la estructura de pesos, la distribución de expertos y las técnicas de entrenamiento a partir de este checkpoint.
- **Comparativa de checkpoints**: al ser una copia fiel, puede usarse para comparar el rendimiento de este modelo con otros de la misma familia o con versiones posteriores de la subnet.
- **Pruebas de inferencia multimodal**: si se carga en un entorno compatible, puede probarse su capacidad para responder preguntas sobre imágenes, aunque no hay garantías de calidad.
- **Verificación de trazabilidad**: para investigadores que estudian la evolución de los modelos en Bittensor, este archivo proporciona un punto de referencia con hash verificable.
- **Base para fine-tuning**: si el modelo es funcional, podría servir como punto de partida para ajuste fino en tareas específicas, aunque su licencia no está disponible y su uso comercial no está garantizado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo no ha sido evaluado en tareas estándar como MMLU, HumanEval o GSM8K dentro de este repositorio. Solo se conoce su historial en la subnet 120: 2 duelos y 0 victorias, lo que indica que no llegó a coronarse como modelo líder. No se dispone de datos de rendimiento medidos en latencia o throughput.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con 35,1 B de parámetros en precisión FP16, se necesitarían aproximadamente 70 GB de VRAM solo para los pesos. Con cuantización a 8 bits, la necesidad bajaría a ~35 GB; a 4 bits, a ~18 GB, pero no hay cuantizaciones disponibles en el repositorio.
- **GPU recomendadas**: para ejecutar el modelo en FP16 se requieren GPUs de clase profesional como NVIDIA A100 (80 GB), H100 (80 GB) o A6000 (48 GB). En configuraciones con varias GPUs, se puede distribuir la carga.
- **GPU de consumo**: no cabe en GPUs de consumo típicas (RTX 4090 con 24 GB) sin cuantización. Con cuantización a 4 bits podría caber, pero no se proporcionan pesos cuantizados.
- **Opciones de despliegue**: el formato safetensors es compatible con frameworks como Transformers, vLLM, TGI y llama.cpp (si se convierten a GGUF). No se incluyen archivos GGUF ni configuraciones de despliegue específicas.
- **Latencia y throughput**: no hay datos medidos. Para un modelo MoE de 35 B, la latencia dependerá del número de expertos activos y del hardware, pero no se puede estimar sin pruebas.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con alternativas de la misma categoría. El repositorio no ofrece detalles sobre el rendimiento, la arquitectura interna ni los parámetros activos. Se sabe que es un MoE de 35 B de la familia Qwen 3.5, pero sin datos de benchmarks no se puede establecer una comparación objetiva con modelos como Qwen3-32B-MoE, DeepSeek-V3 o Mixtral-8x22B. No se incluyen tablas comparativas porque no hay datos verificables.

## Limitaciones y advertencias

- **No es un modelo original**: se trata de una copia de un checkpoint de Bittensor, no de un modelo desarrollado por el autor del repositorio. La calidad, el rendimiento y la seguridad no están garantizados.
- **Licencia no determinada**: no se especifica la licencia, por lo que su uso comercial o incluso académico puede estar sujeto a restricciones legales desconocidas. Se recomienda consultar el origen original antes de cualquier uso.
- **Sin información de entrenamiento**: no se sabe qué datos se usaron para entrenar el modelo, ni si se aplicaron técnicas de alineación. Esto implica un riesgo de sesgos, alucinaciones y comportamientos no deseados.
- **Potencial de desaparición**: el propio repositorio advierte que los modelos de esa subnet suelen volverse privados en pocos días; este archivo es una instantánea concreta que puede quedar obsoleta o incompleta.
- **Sin validación de calidad**: con 0 descargas y 0 likes, no hay evidencia de que el modelo funcione correctamente. No se han probado sus capacidades reales.
- **Soporte de contexto limitado**: al no conocerse la longitud de contexto, no se puede garantizar el manejo de conversaciones largas o documentos extensos.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/greenfield0810/affine-ark-e2448246c057
- Repositorio original del checkpoint: https://huggingface.co/alex-drok/affine-5cj9mpkjrr-grape (revisión `ecd4c84ce5aa`)
- Archivo de procedencia (dentro del repositorio): `_affine_provenance.json` (no disponible en línea)
