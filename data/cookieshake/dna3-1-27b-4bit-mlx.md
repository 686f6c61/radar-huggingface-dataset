# cookieshake/DNA3.1-27B-4bit-mlx

## Resumen

DNA3.1-27B-4bit-mlx es una conversión a formato MLX del modelo dnotitia/DNA3.1-27B, publicada por el usuario cookieshake. Se trata de una cuantización afín de 4 bits con tamaño de grupo 64, que según MLX-LM ocupa 4,501 bits por peso. El resultado es un repositorio de 15,2 GB que contiene 26.895.993.856 parámetros y que está pensado para ejecutarse en hardware Apple Silicon mediante la librería mlx-lm.

El modelo base pertenece a la familia DNA3.1 de dnotitia, identificada en los tags como qwen3_5, lo que sugiere una arquitectura derivada de la familia Qwen. La model card original declara licencia Apache-2.0 y el autor de la conversión la mantiene. El modelo está etiquetado para generación de texto y conversación, con especial atención al idioma coreano, aunque los idiomas soportados no se detallan de forma exhaustiva.

La relevancia de esta ficha es doble: por un lado documenta una conversión práctica para usuarios de Mac con memoria unificada; por otro, advierte de que las capacidades multimodales (imagen y vídeo) no han sido verificadas en esta conversión concreta, por lo que su uso en producción debe limitarse a inferencia de texto hasta validación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer derivada de la familia qwen3_5 (según tags); detalles no disponibles |
| Parametros totales | 26.895.993.856 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit affine, group size 64 (4,501 bits por peso según MLX-LM) |
| Idiomas soportados | coreano (etiquetado); resto no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base dnotitia/DNA3.1-27B más allá de la etiqueta qwen3_5, que apunta a una familia de transformers con posibles componentes de atención eficiente, pero no se confirma en la documentación proporcionada. Tampoco se especifican el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF, DPO o ajuste por preferencias.

Lo que sí está documentado es el proceso de conversión: cuantización afín de 4 bits con group size 64 aplicada sobre los pesos del modelo base fijado a la revisión aee853444ef2d1d1fe2fa56e4c2073d8f393b139. La conversión se realizó y se probó con inferencia de texto en un Apple M1 Max con 64 GB de memoria unificada. El autor incluye un archivo CONVERSION.md con los comandos de reproducción.

## Capacidades

- Generación de texto y conversación multi-turno mediante plantilla de chat (apply_chat_template).
- Modo thinking desactivable mediante el parámetro enable_thinking=False en la plantilla.
- Respuestas en coreano verificadas con un ejemplo de la model card.
- Inferencia local en Apple Silicon mediante mlx-lm.
- Capacidades multimodales (imagen y vídeo): no verificadas en esta conversión, según advierte el autor.
- Tool calling, function calling y razonamiento multi-paso: no disponibles en la información proporcionada.

## Casos de uso

- Asistente conversacional local en Mac: cargando el repositorio con mlx-lm y una plantilla de chat, el modelo puede gestionar diálogos multi-turno en local sin depender de la nube, aprovechando la memoria unificada de equipos Apple con 64 GB o más.
- Prototipado de aplicaciones en coreano: el modelo está etiquetado para coreano y el ejemplo de la model card confirma respuestas correctas en ese idioma, lo que lo hace útil para validar flujos de atención al cliente o generación de contenido en coreano antes de pasar a producción.
- Evaluación de modelos en hardware de consumo: al ocupar 15,2 GB en disco y 4,501 bits por peso, permite a investigadores comparar el comportamiento de un modelo de 27B en un M1 Max sin GPU dedicada.
- Generación de texto con control de razonamiento: el flag enable_thinking permite alternar entre respuestas directas y modo de razonamiento, útil para experimentos de prompting y evaluación de calidad.
- Pipelines de conversión y cuantización: el repositorio sirve como referencia reproducible (CONVERSION.md) para convertir otros modelos de la familia DNA3.1 a MLX 4-bit.
- Inferencia offline en entornos con restricciones de privacidad: al ejecutarse completamente en local, es adecuado para procesar texto sensible sin enviar datos a servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el autor probó la conversión en un Apple M1 Max con 64 GB de memoria unificada; el repositorio pesa 15,2 GB, por lo que se recomienda al menos 32 GB de memoria unificada para dejar margen al contexto y al tokenizador.
- GPU recomendadas: Apple Silicon (M1 Max, M2 Max, M3 Max, M4 Max y superiores) con memoria unificada suficiente; no se documenta soporte para GPU NVIDIA en esta conversión.
- ¿Cabe en GPU de consumo? En el ecosistema Apple, sí en equipos con 32 GB o más de memoria unificada; en NVIDIA no está verificado.
- Opciones de despliegue: mlx-lm (librería indicada en la model card); otras opciones como vLLM, llama.cpp, Ollama o TGI no están documentadas para este repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cookieshake/DNA3.1-27B-4bit-mlx | 26,9B | no disponible | 4-bit MLX (group 64) | apache-2.0 | Hugging Face, 0 descargas |
| gaeulbyul/DNA3.0-27B-mlx-4Bit | ~27B (generacion anterior) | no disponible | 4-bit MLX | no disponible en la busqueda | Hugging Face |
| mlx-community/Qwen3.8-27B-OptiQ-4bit | ~27B | no disponible | 4-bit OptiQ | no disponible en la busqueda | Hugging Face (mlx-community) |

La comparativa se limita a conversiones MLX de tamaño similar; no se dispone de datos de rendimiento para establecer diferencias cuantitativas entre ellas.

## Limitaciones y advertencias

- Las capacidades de imagen y vídeo no están verificadas en esta conversión; el autor solo confirma inferencia de texto.
- No se documentan sesgos conocidos, pero al ser un modelo de 27B entrenado con datos no especificados, existe riesgo de sesgos idiomáticos y culturales, especialmente fuera del coreano.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se han publicado evaluaciones de fidelidad para esta conversión.
- Longitud de contexto no documentada, lo que impide garantizar conversaciones de contexto largo.
- Idiomas soportados no detallados más allá del coreano; el rendimiento en castellano no está verificado.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda revisar la model card del modelo base dnotitia/DNA3.1-27B para confirmar condiciones adicionales.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria.
- Requiere hardware Apple Silicon; no es directamente portable a GPU NVIDIA sin reconversión.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/cookieshake/DNA3.1-27B-4bit-mlx
- Modelo base: https://huggingface.co/dnotitia/DNA3.1-27B
- Conversión comparable de la generación anterior: https://huggingface.co/gaeulbyul/DNA3.0-27B-mlx-4Bit
- Conversión MLX de referencia de la familia Qwen: https://huggingface.co/mlx-community/Qwen3.8-27B-OptiQ-4bit
