# mlx-community/XVERSE-7B-Chat-4bit

## Resumen

El modelo `mlx-community/XVERSE-7B-Chat-4bit` es una conversión al framework MLX del modelo `xverse/XVERSE-7B-Chat`, desarrollado por Shenzhen Yuanxiang Technology. Se trata de un modelo de lenguaje de 7.299.846.144 parámetros con arquitectura decoder-only estilo LLaMA, especializado en conversación multilingüe en chino e inglés. Esta versión concreta ha sido cuantizada a 4 bits (group size 64, 4.500 bits por peso) y reempaquetada en formato safetensors por la comunidad mlx-community, con el objetivo de ejecutarse de manera eficiente en dispositivos Apple Silicon.

La relevancia de esta versión radica en que permite ejecutar un modelo de chat de 7B en Mac con un consumo de memoria reducido, sin necesidad de GPU dedicada. El repositorio ocupa 4,1 GB, lo que lo hace adecuado para entornos con recursos limitados. La conversión incluye además un `chat_template` añadido que replica el formato de prompt original, y un parcheo del `tokenizer.json` para compatibilidad con versiones recientes de la librería `tokenizers`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (estilo LLaMA) |
| Parametros totales | 7.299.846.144 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit MLX (group size 64, 4.500 bits por peso) |
| Idiomas soportados | zh, en |
| Licencia | xverse-model-license (pesos), Apache-2.0 (codigo) |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo utiliza una arquitectura transformer decoder-only estándar, siguiendo el diseño de LLaMA. No es un modelo de mezcla de expertos (MoE), por lo que todos los parámetros se activan en cada paso de inferencia. El modelo original fue desarrollado por Shenzhen Yuanxiang Technology como un modelo de chat multilingüe, pero en la información disponible no se detallan los datos de entrenamiento (número de tokens, composición del dataset, ni si se aplicó RLHF o DPO). Por tanto, estos datos se consideran no disponibles.

La conversión a MLX realizada por mlx-community incluye tres modificaciones sobre el repositorio original: el reempaquetado de los pesos de PyTorch a safetensors (eliminando los buffers `inv_freq` que se recalculan en la capa rope), el parcheo del `tokenizer.json` para adaptarlo a la sintaxis moderna de `tokenizers` (cambiando `add_prefix_space` por `prepend_scheme: "never"`), y la adición de un `chat_template` en `tokenizer_config.json` que implementa el formato de prompt original: `Human: {user}\n\nAssistant: {assistant}<|endoftext|>`.

## Capacidades

- Generación de texto conversacional en chino e inglés.
- Soporte de chat multi-turno con el formato `Human: ... Assistant: ...`.
- No soporta tool calling ni function calling (no documentado).
- No dispone de system prompt; solo se admiten los roles `user` y `assistant`.
- Sin capacidades de visión, audio ni generación multimodal.
- Cuantización a 4 bits optimizada para ejecución en Apple Silicon con MLX.
- Compatible con `mlx-lm` para carga y generación directa.

## Casos de uso

- Atención al cliente bilingüe: el modelo puede gestionar conversaciones multi-turno en chino e inglés, y su ejecución local en Apple Silicon permite desplegarlo en entornos con requisitos de privacidad de datos, sin depender de servicios cloud.
- Traducción asistida: gracias a su capacidad multilingüe, puede utilizarse para redactar o revisar borradores entre chino e inglés, aprovechando el formato de chat para indicar el texto fuente y solicitar la traducción.
- Generación de contenido localizado: empresas que operan en mercados chino e hispanohablante pueden usarlo para producir publicaciones en redes sociales, descripciones de producto o documentación en ambos idiomas.
- Chatbot educativo para aprendizaje de idiomas: los estudiantes pueden practicar conversación en inglés o chino con un asistente que mantiene contexto a lo largo de la interacción, gracias al soporte multi-turno.
- Asistente de escritura técnica: para generar correos electrónicos, informes o documentación en inglés o chino, con un modelo que puede reformular y completar texto de forma coherente.
- Prototipado de aplicaciones de IA en macOS: los desarrolladores pueden integrar un modelo de chat local en aplicaciones de escritorio usando MLX, aprovechando la cuantización 4-bit para reducir el consumo de memoria y la latencia en dispositivos Apple Silicon.
- Investigación en NLP multilingüe: para estudiar el comportamiento de modelos de 7B en tareas de conversación en chino e inglés, especialmente en entornos de ejecución local con MLX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible en la documentación. El repositorio ocupa 4,1 GB en formato 4-bit, por lo que se estima que la inferencia requiere al menos esa cantidad de memoria unificada en Apple Silicon, más overhead del runtime.
- GPU recomendadas: no aplica. El formato MLX está optimizado para Apple Silicon (M1/M2/M3/M4). No se recomienda su uso en GPU NVIDIA sin conversión previa a otro formato.
- Compatibilidad con GPU de consumo: no aplica directamente. Para usar en GPU de consumo (por ejemplo, RTX 4090) sería necesario convertir los pesos a formatos como GGUF o GPTQ.
- Opciones de despliegue: `mlx-lm`, `MLX Studio`, o integración directa con el framework MLX.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Característica | XVERSE-7B-Chat (original) | XVERSE-7B-Chat-4bit (MLX) |
|---|---|---|
| Parámetros | 7.299.846.144 | 7.299.846.144 |
| Formato de pesos | PyTorch (bin) | safetensors (MLX) |
| Cuantización | bf16 | 4-bit |
| Tamaño del repositorio | no disponible | 4,1 GB |
| Licencia | xverse-model-license | xverse-model-license |
| Entorno de ejecución | GPU NVIDIA | Apple Silicon |

No se dispone de información sobre otros modelos comparables en la documentación proporcionada, por lo que no se incluyen datos de rendimiento de alternativas.

## Limitaciones y advertencias

- El modelo puede producir contenido inexacto, sesgado u objetable, como se indica en la documentación heredada del modelo original. Es necesario realizar pruebas de seguridad propias antes de desplegarlo en producción.
- La cuantización a 4 bits puede afectar la calidad de salida en comparación con la versión bf16 original.
- Solo soporta los idiomas chino e inglés. No se admite system prompt, y los roles distintos de `user` y `assistant` provocan un error.
- Existe una diferencia conocida en la tokenización del chat template: cuando el contenido del usuario comienza con una palabra latina, se genera un token distinto al del modelo original. Para paridad exacta, se debe construir el prompt con `_build_chat_input` en lugar de usar `apply_chat_template`.
- La licencia de los pesos (xverse-model-license) permite uso académico y comercial gratuito, pero se solicita una licencia comercial a través de un formulario. El código fuente sigue Apache-2.0.
- El formato MLX está pensado para Apple Silicon; para otros entornos (GPU NVIDIA, CPUs x86) es necesaria una conversión adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mlx-community/XVERSE-7B-Chat-4bit
- Modelo base original: https://huggingface.co/xverse/XVERSE-7B-Chat
- Repositorio de XVERSE-7B: https://github.com/xverse-ai/XVERSE-7B
- Framework MLX: https://mlx-framework.org/
- Organización MLX Community en HuggingFace: https://huggingface.co/mlx-community
- Repositorio de MLX en GitHub: https://github.com/ml-explore/mlx
- MLX Studio: https://mlx.studio/
- Licencia del modelo XVERSE: https://github.com/xverse-ai/XVERSE-7B/blob/main/MODEL_LICENSE.pdf
- Licencia del código fuente: https://github.com/xverse-ai/XVERSE-7B/blob/main/LICENSE
