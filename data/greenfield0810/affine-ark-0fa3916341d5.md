# greenfield0810/affine-ark-0fa3916341d5

## Resumen

Este repositorio es un archivo espejo (mirror) de un checkpoint competidor de la subnet 120 de Bittensor, conocida como Affine. El autor, greenfield0810, lo ha subido para preservar el modelo original ante la práctica habitual de que los repositorios de esa subnet se vuelvan privados en pocos días tras los duelos de evaluación. No es un modelo desarrollado por greenfield0810, sino una copia byte a byte del original alojado en `Shatoria/Affine-5ghntktyzq-hope1` en la revisión `f3d5cc9988f4`.

El modelo en sí está etiquetado como `qwen3_5_moe` y `image-text-to-text`, lo que indica que se trata de un modelo multimodal de arquitectura MoE (mixture of experts) de la familia Qwen 3.5, con 35.951.822.704 parámetros totales (35,95 mil millones) y un tamaño de 71,9 GB en 16 shards. Sin embargo, al ser un archivo de preservación, no se proporciona ninguna documentación técnica adicional sobre capacidades, entrenamiento o rendimiento. La relevancia de este repositorio reside en su papel como respaldo de un modelo que de otro modo podría desaparecer del ecosistema público de Hugging Face, y en su compatibilidad con la infraestructura de evaluación de la subnet 120 de Bittensor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts) basada en Qwen 3.5, multimodal (imagen y texto) |
| Parametros totales | 35.951.822.704 (35,95 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (16 shards, 71,9 GB) |

## Arquitectura y entrenamiento

La información disponible no incluye detalles sobre la arquitectura interna, el proceso de entrenamiento ni las innovaciones técnicas del modelo. Los tags indican que se trata de un modelo de la familia `qwen3_5_moe`, lo que sugiere una arquitectura de mezcla de expertos similar a la empleada en otros modelos Qwen, con un mecanismo de selección de expertos por token. Es multimodal, acepta entradas de imagen y texto, y está orientado a tareas conversacionales. Al ser un archivo espejo, no se dispone de datos sobre el dataset de entrenamiento, el número de tokens procesados ni si se aplicaron técnicas como RLHF o DPO. Tampoco se mencionan innovaciones específicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto y razonamiento conversacional, según los tags `conversational`.
- Procesamiento de entradas multimodales (imagen y texto), indicado por el pipeline `image-text-to-text`.
- Compatible con endpoints de inferencia, según el tag `endpoints_compatible`.
- Integración con el ecosistema de evaluación de la subnet 120 de Bittensor (Affine), lo que implica capacidades de duelo y comparación automatizada de modelos.
- No se dispone de información sobre tool calling, agentes, razonamiento multi-paso ni capacidades multilingües específicas.

## Casos de uso

- Preservación de modelos en entornos competitivos: este repositorio sirve como respaldo para mantener accesible un checkpoint que podría desaparecer de la plataforma. Es útil para investigadores que necesitan reproducir resultados de la subnet 120 de Bittensor.
- Evaluación comparativa en Bittensor: el modelo puede desplegarse en la infraestructura de la subnet 120 para participar en duelos de evaluación, gracias a su compatibilidad con endpoints.
- Investigación sobre arquitecturas MoE multimodales: al ser un modelo Qwen 3.5 MoE, puede estudiarse su comportamiento en tareas de visión y lenguaje, aunque sin documentación oficial.
- Desarrollo de aplicaciones conversacionales con entrada de imágenes: si se logra identificar la configuración exacta, podría usarse como base para chatbots que procesan capturas o fotografías.
- Análisis de la evolución de modelos en subnets descentralizadas: el repositorio permite auditar qué modelos compiten y cómo cambian con el tiempo.
- Pruebas de compatibilidad con frameworks de inferencia: al estar en formato safetensors y ser compatible con transformers, puede cargarse en vLLM, TGI u Ollama para pruebas de rendimiento locales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye ninguna métrica de evaluación (MMLU, HumanEval, GSM8K, etc.) ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: no disponible con exactitud, pero un modelo de 35,95 B parámetros en fp16 requiere aproximadamente 72 GB de VRAM (considerando solo pesos). Con cuantización a 8 bits (~36 GB) o 4 bits (~18 GB) podría ejecutarse en GPUs de gama alta.
- GPU recomendadas: para inferencia sin cuantizar, se necesitarían GPUs como A100 80 GB, H100 80 GB o múltiples RTX 4090 (24 GB cada una) en configuración multi-GPU. Con cuantización 4 bits, una RTX 4090 o A6000 podría ser suficiente.
- En consumer GPU: solo con cuantización agresiva (4 bits) y posiblemente con offloading de CPU. No es viable en GPUs de menos de 16 GB sin cuantización extrema.
- Opciones de despliegue: al ser un modelo de transformers con safetensors, es compatible con vLLM, TensorRT-LLM, llama.cpp (si se convierte a GGUF) y Ollama. El tag `endpoints_compatible` sugiere que puede servirse mediante APIs estándar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable. El modelo pertenece a la familia Qwen 3.5 MoE, pero sin datos de rendimiento ni configuración exacta de expertos activos, no es posible compararlo con alternativas como Qwen2.5-MoE, Mixtral 8x22B o DeepSeek-V2. La única referencia objetiva es el tamaño de 35,95 B parámetros totales, que lo sitúa en un rango medio-alto dentro de los MoE, pero se desconoce el número de parámetros activos.

## Limitaciones y advertencias

- Este repositorio es un espejo de un modelo ajeno; el autor original no ha proporcionado documentación, licencia ni términos de uso. Cualquier uso comercial o de investigación debe verificar los derechos sobre el checkpoint original.
- No se dispone de información sobre sesgos, alucinaciones o limitaciones idiomáticas. Al ser un modelo multimodal sin ficha técnica, se recomienda realizar evaluaciones propias antes de usarlo en producción.
- La licencia es "no disponible", lo que impide garantizar el cumplimiento legal en aplicaciones comerciales.
- El modelo puede tener restricciones de uso derivadas de su origen en Bittensor, donde los checkpoints suelen estar sujetos a condiciones de la subnet.
- El archivo es de 71,9 GB, lo que requiere un ancho de banda considerable para su descarga y almacenamiento.
- No hay garantía de que el modelo funcione correctamente con todas las librerías; se recomienda probar con la versión de transformers que espera el archivo de configuración.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/greenfield0810/affine-ark-0fa3916341d5
- Modelo original (posiblemente privado): https://huggingface.co/Shatoria/Affine-5ghntktyzq-hope1
- Repositorios espejo similares del mismo autor: https://huggingface.co/greenfield0810/affine-ark-e864839c8df1 y https://huggingface.co/greenfield0810/affine-ark-bc254d78ac91
- Ejemplo de despliegue en FriendliAI (de un repositorio hermano): https://friendli.ai/models/greenfield0810/affine-ark-da8188fa4889
