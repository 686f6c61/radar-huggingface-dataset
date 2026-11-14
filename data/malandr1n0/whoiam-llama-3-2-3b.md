# malandr1n0/whoiam-llama-3.2-3b

## Resumen
`malandr1n0/whoiam-llama-3.2-3b` es un modelo derivado de la familia Llama 3.2 de Meta, distribuido por el usuario `malandr1n0` en Hugging Face. Por el identificador y el número de parámetros (3.212.749.888, es decir, aproximadamente 3.2 mil millones), corresponde a un fine-tune o adaptación del modelo base Llama 3.2 3B, orientado a uso conversacional según la etiqueta `conversational` del repositorio. El modelo se publica únicamente en formato GGUF, lo que indica que está pensado para inferencia con llama.cpp y herramientas compatibles (Ollama, LM Studio, etc.) más que para entrenamiento o despliegue con frameworks de pesos completos.

La información pública disponible es muy limitada: el repositorio no declara licencia, idiomas soportados, pipeline ni resultados de evaluación, y no incluye documentación sobre el proceso de fine-tuning, los datos utilizados ni las capacidades específicas que se han modificado respecto al modelo base. El tamaño del repositorio (9.1 GB) es coherente con varias cuantizaciones GGUF del modelo de 3B, lo que sugiere que se publicaron múltiples versiones (por ejemplo, Q4_K_M, Q5_K_M, Q8_0) en lugar de un único archivo.

Por su tamaño y formato, el interés práctico del modelo radica en que puede ejecutarse en hardware de consumo (GPU con 8-12 GB de VRAM o incluso CPU con suficiente RAM) y en que hereda, en principio, la arquitectura y el tokenizador de Llama 3.2 3B, aunque cualquier modificación introducida por el fine-tune debe validarse empíricamente. Dado que no hay benchmarks ni documentación del autor, conviene tratarlo como un modelo experimental y evaluarlo con cautela antes de usarlo en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Llama 3.2 3B; detalles del fine-tune no disponibles) |
| Parametros totales | 3.212.749.888 (~3.2B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el modelo base Llama 3.2 soporta 128K, pero no se confirma para este derivado) |
| Tipos de cuantizacion | GGUF (el repo de 9.1 GB sugiere múltiples cuantizaciones; niveles exactos no disponibles) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | GGUF (según tags del repositorio; no se listan safetensors en la ficha) |

## Arquitectura y entrenamiento
El modelo se basa en la arquitectura de Llama 3.2 3B, un transformer decoder-only con atención por grupos (GQA), normalización RMSNorm y activación SwiGLU, tal como se define en la familia Llama 3. No se dispone de información sobre el proceso de ajuste realizado por `malandr1n0`: se desconoce si se trata de un fine-tune supervisado (SFT), un ajuste con DPO/RLHF, una destilación o una simple conversión a GGUF del modelo base. Tampoco se documentan los datos de entrenamiento, el número de tokens utilizados ni la composición del dataset.

La única información técnica verificable es el número exacto de parámetros (3.212.749.888) y el formato de distribución (GGUF). El hecho de que el repositorio ocupe 9.1 GB y no incluya pesos en safetensors sugiere que el autor priorizó la inferencia local sobre la reproducibilidad del entrenamiento. No hay evidencia de innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.) más allá de las que ya incorpora el modelo base de Meta.

## Capacidades
- Generación de texto conversacional: el tag `conversational` indica que el modelo está orientado a diálogo multi-turno, aunque no se detalla el formato de prompt exacto (probablemente el chat template de Llama 3.2).
- Razonamiento y conocimiento general: hereda, en principio, las capacidades del Llama 3.2 3B base, pero no hay evaluación que lo confirme.
- Generación de código y matemáticas: no confirmado para este derivado; el modelo base tiene capacidades limitadas en estas áreas por su tamaño.
- Tool calling / function calling: no disponible; el modelo base Llama 3.2 3B soporta function calling, pero no se confirma que este fine-tune lo preserve.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no disponible; el modelo base soporta 8 idiomas oficiales (inglés, alemán, francés, italiano, portugués, hindi, español y tailandés), pero no se confirma para este derivado.
- Capacidades especiales (thinking mode, visión, audio): no disponible; Llama 3.2 3B es solo texto, por lo que se descarta visión salvo modificación no documentada.

## Casos de uso
- Prototipado rápido de asistentes conversacionales en local: al estar en GGUF, se puede cargar con llama.cpp u Ollama en un portátil con 8-16 GB de RAM y probar flujos de diálogo sin infraestructura cloud.
- Experimentación con fine-tunes de la comunidad: útil para investigadores que quieran comparar derivados de Llama 3.2 3B y evaluar si el ajuste de `malandr1n0` mejora el comportamiento conversacional respecto al base.
- Despliegue en edge devices: con cuantizaciones Q4, el modelo cabe en dispositivos con 4-6 GB de memoria, lo que permite integrarlo en aplicaciones de escritorio o sistemas embebidos con CPU.
- Generación de respuestas en aplicaciones de chat de bajo coste: suitable para entornos donde la latencia y el coste importan más que la precisión absoluta, siempre que se valide la calidad con evaluaciones propias.
- Base para nuevos fine-tunes: el autor o terceros pueden partir de este modelo para ajustes específicos de dominio, aunque la falta de licencia clara es un riesgo legal.
- Pruebas de integración con endpoints compatibles con OpenAI: el tag `endpoints_compatible` sugiere que puede servirse detrás de APIs compatibles (por ejemplo, con llama.cpp server o vLLM en modo GGUF), útil para pipelines de CI que necesiten un modelo pequeño.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: aproximadamente 2-3 GB en cuantización Q4_K_M, 3-4 GB en Q5_K_M y 4-5 GB en Q8_0 (estimación basada en el tamaño de parámetros; no confirmada por el autor).
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM para cuantizaciones bajas (RTX 3060, RTX 4060, RTX 2070); para Q8_0 se recomienda 8 GB o más (RTX 3070, RTX 4060 Ti, RTX 4070).
- Cabe en GPU de consumo: sí, en la mayoría de GPUs modernas con 8 GB o más; también puede ejecutarse en CPU con 8-16 GB de RAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, y servidores compatibles con la API de OpenAI (llama.cpp server, text-generation-webui). No se recomienda vLLM ni TGI para GGUF sin conversión previa.
- Latencia y throughput estimados: no disponibles; dependerán del hardware y la cuantización. En una RTX 4090 con Q4_K_M se puede esperar un throughput de decenas de tokens por segundo, pero es una estimación genérica no validada para este modelo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| `malandr1n0/whoiam-llama-3.2-3b` | 3.2B | No disponible | No disponible | GGUF | Hugging Face (159 descargas) |
| `meta-llama/Llama-3.2-3B-Instruct` | 3.2B | 128K | Llama 3.2 Community License | Safetensors, GGUF | Hugging Face, ampliamente adoptado |
| `Qwen/Qwen2.5-3B-Instruct` | 3.09B | 32K | Apache 2.0 | Safetensors, GGUF | Hugging Face, muy popular |
| `google/gemma-2-2b-it` | 2.6B | 8K | Gemma Terms of Use | Safetensors, GGUF | Hugging Face |

El modelo de `malandr1n0` compite en la misma categoría que los instruct de 2-3B, pero carece de la documentación, licencia y benchmarks de los modelos oficiales, lo que lo hace menos adecuado para producción sin una evaluación previa.

## Limitaciones y advertencias
- Licencia no especificada: no se puede determinar si el uso comercial está permitido; esto es un riesgo legal importante para cualquier despliegue en producción.
- Sin documentación de entrenamiento: se desconoce qué datos se usaron, si hubo filtrado de datos personales o si el fine-tune introduce sesgos adicionales.
- Riesgo de alucinación: como todo modelo de 3B, es propenso a inventar información, especialmente en dominios especializados; no se ha evaluado su tasa de alucinación.
- Contexto no confirmado: aunque el modelo base soporta 128K tokens, no se garantiza que este derivado preserve esa ventana; conviene probar con secuencias largas antes de confiar en ello.
- Idiomas no confirmados: no hay evidencia de que el fine-tune mantenga el multilingüismo del modelo base; podría haber degradado idiomas distintos del inglés.
- Sin benchmarks: no hay métricas públicas que permitan comparar su calidad con el modelo base u otras alternativas.
- Formato GGUF únicamente: no se ofrecen pesos en safetensors, lo que dificulta el entrenamiento adicional o la conversión a otros formatos.
- Autor único y pocas descargas (159): no hay señales de validación por parte de la comunidad, lo que aumenta la incertidumbre sobre su calidad y estabilidad.

## Enlaces
- Repositorio en Hugging Face: https://huggingface.co/malandr1n0/whoiam-llama-3.2-3b
- Modelo base de referencia (Meta Llama 3.2 3B Instruct): https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Documentación de Llama 3.2 (Meta): https://ai.meta.com/blog/llama-3-2-connect-2024-vision-edge-mobile-devices/
- Repositorio de llama.cpp (inferencia GGUF): https://github.com/ggerganov/llama.cpp
- Ollama (despliegue local): https://ollama.com/
