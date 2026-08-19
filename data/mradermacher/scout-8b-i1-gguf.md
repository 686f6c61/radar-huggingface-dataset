# mradermacher/scout-8b-i1-GGUF

## Resumen

El modelo `scout-8b-i1-GGUF` es una cuantización en formato GGUF del modelo original `vanta-research/scout-8b`, realizada por el usuario mradermacher, conocido por publicar versiones optimizadas de modelos open source para su uso local. Esta versión incluye múltiples niveles de cuantización (Q2_K, IQ3_M, Q4_K_S, etc.) con pesos ponderados y matriz de importancia (imatrix), lo que permite adaptar el modelo a diferentes capacidades de hardware y requisitos de calidad. El repositorio tiene un tamaño de 68.4 GB, lo que sugiere que contiene todas las variantes de cuantización disponibles.

Aunque no se dispone de información detallada sobre el modelo base, el tag "conversational" indica que está orientado a tareas de diálogo y generación de texto. La cuantización GGUF facilita su uso con herramientas como llama.cpp, Ollama o vLLM, siendo una opción práctica para despliegues locales o en entornos con recursos limitados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible (se infiere 8B por el nombre, sin confirmar) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se ha proporcionado información sobre la arquitectura del modelo original `scout-8b`. Se desconoce si se trata de un transformer estándar, un modelo MoE o una arquitectura híbrida. Tampoco hay datos sobre el proceso de entrenamiento, el número de tokens utilizados, la composición del dataset o si se aplicaron técnicas como RLHF o DPO. La única información disponible es que se trata de una cuantización GGUF con pesos ponderados y matriz de importancia (imatrix), lo que sugiere que el autor ha optimizado las cuantizaciones para preservar la calidad en niveles bajos de precisión.

## Capacidades

- Conversación y generación de texto: el tag "conversational" indica que el modelo está diseñado para mantener diálogos, aunque no se especifican detalles sobre su capacidad de razonamiento o generación de código.
- Compatibilidad con endpoints: el tag "endpoints_compatible" sugiere que puede ser utilizado en servidores de inferencia como vLLM o TGI, facilitando su integración en aplicaciones.
- No se dispone de información sobre soporte de tool calling, agentes, capacidades multilingües o modos especiales (visión, audio, etc.).

## Casos de uso

- Despliegue local de un asistente conversacional: gracias a su formato GGUF y a las múltiples cuantizaciones, el modelo puede ejecutarse en equipos con recursos limitados, como portátiles con 8 GB de VRAM, usando herramientas como Ollama o llama.cpp.
- Prototipado rápido de aplicaciones de chat: al ser compatible con endpoints, se puede integrar en un servidor local para probar funcionalidades de diálogo antes de pasar a un modelo más grande.
- Investigación en entornos sin conexión: al ser un modelo de 8B (presumiblemente), permite experimentar con técnicas de generación de texto sin depender de APIs externas.
- Fine-tuning posterior: aunque no se confirma, los pesos GGUF pueden convertirse a otros formatos para ajuste fino, aunque no es el uso típico de estas cuantizaciones.
- Evaluación de calidad de cuantización: los diferentes niveles ofrecen un espectro para comparar la degradación de rendimiento frente a la reducción de memoria.
- Uso en entornos educativos: para enseñar conceptos de inferencia local y optimización de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se puede comparar el rendimiento del modelo con otros sin datos objetivos.

## Requisitos de hardware

- La VRAM necesaria depende de la cuantización elegida. Para un modelo de 8B, las cuantizaciones más bajas (Q2_K, IQ2_M) pueden caber en GPUs con 4-6 GB de VRAM, mientras que las más altas (Q6_K, Q8) requerirían 8-12 GB. Sin embargo, estos son estimaciones genéricas y no se basan en datos específicos del modelo.
- GPUs recomendadas: tarjetas consumer como RTX 3060 (12 GB), RTX 4060 (8 GB) o superiores pueden manejar las cuantizaciones más pequeñas. Para las más grandes, se necesitaría una RTX 4090 o una GPU de datacenter como A100.
- Opciones de despliegue: llama.cpp, Ollama, vLLM, TGI, o cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables. Dado que no se conocen las características del modelo base, no es posible establecer una comparativa fiable.

## Limitaciones y advertencias

- Al ser una cuantización, existe una pérdida de precisión inherente, especialmente en los niveles más bajos (Q2, IQ1). Esto puede afectar la coherencia y la exactitud en tareas complejas.
- No se conoce la licencia del modelo original, por lo que no se puede garantizar su uso comercial. Se recomienda consultar la página del modelo base (vanta-research/scout-8b) para obtener información sobre permisos.
- No hay datos sobre sesgos, alucinaciones o limitaciones de idioma. Se debe asumir que el modelo puede presentar los mismos riesgos que otros LLMs de tamaño similar.
- El repositorio no tiene descargas ni likes, lo que sugiere que es una publicación reciente o poco difundida; se recomienda verificar la calidad antes de usarlo en producción.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/scout-8b-i1-GGUF
- Modelo original (referenciado en el README): https://huggingface.co/vanta-research/scout-8b
- Perfil del autor: https://huggingface.co/mradermacher
