# Openintelligent123/gemma-4-E4B-it-uncensored-GGUF

## Resumen

El modelo Openintelligent123/gemma-4-E4B-it-uncensored-GGUF es una cuantización GGUF del modelo TrevorJS/gemma-4-E4B-it-uncensored, que a su vez es una versión abliterada (sin censura) de google/gemma-4-E4B-it. Lo desarrolla Openintelligent123 y está pensado para ejecutarse en local con llama.cpp o herramientas compatibles. El objetivo principal es eliminar el comportamiento de rechazo del modelo original, permitiendo generar respuestas sin las restricciones de seguridad habituales.

El modelo tiene 7.518.069.290 parámetros totales (aproximadamente 7,5B). La arquitectura no se especifica en la model card, pero la familia Gemma 4 incluye arquitecturas densas y Mixture-of-Experts. La longitud de contexto no se indica en la model card, aunque la documentación oficial de Gemma 4 menciona una ventana de hasta 256K tokens para la familia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No especificada; la familia Gemma 4 incluye arquitecturas Dense y MoE |
| Parametros totales | 7.518.069.290 (≈7,5B) |
| Parametros activos | No disponible (no se especifica si es MoE) |
| Longitud de contexto | No disponible en la model card; según documentación de Gemma 4, hasta 256K tokens |
| Tipos de cuantizacion | Q4_K_M (5,3 GB), Q8_0 (8,0 GB) |
| Idiomas soportados | Inglés (según model card); la familia Gemma 4 soporta más de 140 idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

Este modelo no es un modelo entrenado desde cero, sino una cuantización GGUF de un modelo base que fue modificado mediante abliteración. La abliteración se realizó con la técnica de proyección biproyectada que preserva la norma (norm-preserving biprojected abliteration), que elimina el comportamiento de rechazo del modelo original google/gemma-4-E4B-it. No se han proporcionado detalles sobre el conjunto de datos de entrenamiento, el número de tokens ni el proceso de ajuste fino. El modelo base original está diseñado para tareas de generación de texto, codificación y razonamiento, según la documentación de Google.

## Capacidades

- Generación de texto en inglés, según la model card.
- Conversación multi-turno (tag "conversational").
- Ejecución local con llama.cpp, llama-server y otras herramientas compatibles con GGUF.
- El modelo base Gemma 4 E4B-it está orientado a tareas de generación de texto, codificación y razonamiento, según la documentación de Google.
- No se documentan capacidades de tool calling, function calling, agentes, visión o audio en la model card.
- La familia Gemma 4 incluye multimodalidad en los modelos base, pero esta cuantización GGUF no especifica dichas capacidades.

## Casos de uso

- Chat local sin conexión: usar llama-server con el archivo Q4_K_M para desplegar un asistente conversacional en una máquina sin conexión a internet, ideal para entornos con requisitos de privacidad.
- Prototipado de aplicaciones de texto: gracias al formato GGUF y al tamaño de ~7,5B, se puede integrar en pipelines de desarrollo con llama.cpp o Ollama para probar ideas de procesamiento de lenguaje natural.
- Generación de contenido creativo: al ser una versión "uncensored", permite generar textos sin las restricciones de rechazo habituales, útil para escritura creativa o brainstorming en entornos controlados.
- Análisis de texto en local: se puede usar para resumir documentos, extraer entidades o clasificar texto en aplicaciones donde no se permite enviar datos a la nube.
- Asistente de código en local: aunque no hay benchmarks publicados, la familia Gemma 4 está orientada a codificación y razonamiento, por lo que puede emplearse como asistente de programación en entornos aislados.
- Investigación en alineación: el modelo es útil para comparar el comportamiento de un modelo abliterado frente al original, estudiando cómo la abliteración afecta a las respuestas, la calidad y los sesgos.
- Despliegue en endpoints compatibles: el tag "endpoints_compatible" indica que puede integrarse en APIs que siguen el formato de HuggingFace, facilitando su uso en aplicaciones existentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el archivo Q4_K_M (5,3 GB) requiere aproximadamente 6-7 GB de VRAM para contexto corto; el archivo Q8_0 (8,0 GB) requiere aproximadamente 9-10 GB. Son estimaciones orientativas basadas en el tamaño de los archivos, no datos oficiales.
- GPU recomendadas: RTX 3090, RTX 4090, A100, H100 o cualquier GPU con al menos 8 GB de VRAM para Q4_K_M.
- En consumer GPU: Q4_K_M puede ejecutarse en RTX 3060 12GB, RTX 4070 o similares, con contexto moderado.
- Opciones de despliegue: llama.cpp, llama-server, Ollama, LM Studio y text-generation-webui a través de llama.cpp.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| gemma-4-E4B-it-uncensored-GGUF | 7,5B | No disponible | Apache 2.0 | HuggingFace (GGUF) |
| Llama 3.1 8B | 8B | No disponible | No disponible | HuggingFace |
| Mistral 7B | 7B | No disponible | No disponible | HuggingFace |
| Qwen2.5 7B | 7B | No disponible | No disponible | HuggingFace |

No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- Sesgos: al ser un modelo abliterado, se han eliminado los rechazos, lo que puede aumentar la probabilidad de generar contenido dañino o no deseado.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no hay datos de evaluación específicos para esta variante.
- Limitaciones de idioma: la model card solo indica inglés, aunque la familia Gemma 4 soporta más idiomas; el rendimiento fuera del inglés no está verificado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el usuario es responsable del contenido generado.
- Caveat para producción: la abliteración puede afectar a la calidad general del modelo; no se han publicado benchmarks que validen su rendimiento.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/Openintelligent123/gemma-4-E4B-it-uncensored-GGUF
- Modelo base (bf16): https://huggingface.co/TrevorJS/gemma-4-E4B-it-uncensored
- Modelo original: https://huggingface.co/google/gemma-4-E4B-it
- Código de abliteración: https://github.com/TrevorS/gemma-4-abliteration
- Documentación de Gemma 4: https://ai.google.dev/gemma/docs/core/model_card_4
