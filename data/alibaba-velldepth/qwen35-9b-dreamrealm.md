# Alibaba-VELLDEPTH/Qwen35-9b-DreamRealm

## Resumen

Qwen35-9b-DreamRealm es un checkpoint de ajuste fino sobre el modelo Qwen3.5-9B de Alibaba, publicado por el equipo Yuvion (Alibaba Group) bajo la línea de investigación DreamRealm. El objetivo declarado del proyecto es explorar y materializar alucinaciones visuales, entrenando al modelo para que sus respuestas se ajusten a las imágenes que las sustentan. Se trata, por tanto, de un modelo de lenguaje y visión (vision-language) orientado a un problema específico: la divergencia entre lo que el modelo dice y lo que la imagen realmente muestra.

El checkpoint liberado corresponde a la iteración 648 del entrenamiento y se distribuye en pesos BF16 junto con la configuración del modelo, el tokenizer, la configuración del procesador y la plantilla de chat. El modelo base, Qwen3.5-9B, aporta una arquitectura transformer de aproximadamente 9.000 millones de parámetros con capacidades multimodales, y el ajuste DreamRealm se aplica sobre esa base sin cambiar la arquitectura, por lo que hereda sus características de contexto y tokenización.

La relevancia de esta ficha radica en su carácter experimental: no es un modelo de propósito general listo para producción, sino un artefacto de investigación sobre alucinación visual. La información pública disponible es muy limitada (cero descargas, cero likes en el momento de la consulta, repositorio de 0,0 GB y model card mínima), por lo que muchos datos técnicos deben marcarse como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (arquitectura `qwen3_5`, según la configuración del checkpoint) |
| Parámetros totales | Aproximadamente 9.000 millones (heredados de Qwen3.5-9B; el valor exacto no está detallado en la información disponible) |
| Parámetros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Pesos publicados en BF16; no se documentan otras cuantizaciones |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | BF16 (safetensors, presumiblemente, aunque no se detalla explícitamente); incluye configuración, tokenizer, processor y chat template |

## Arquitectura y entrenamiento

El modelo se construye sobre Qwen3.5-9B, un transformer multimodal de la familia Qwen3.5. La arquitectura registrada en la configuración es `qwen3_5`, y el checkpoint requiere una versión de Transformers que soporte dicha arquitectura; la configuración del checkpoint registra Transformers 5.3.0. Al ser un ajuste fino sobre la base, conserva el tokenizer, el procesador visual y la plantilla de chat del modelo original.

El entrenamiento específico de DreamRealm se orienta a alinear las respuestas del modelo con las imágenes que las respaldan, con el objetivo de estudiar y materializar alucinaciones visuales. La model card no especifica el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO. Tampoco se detallan innovaciones técnicas adicionales más allá del propio proceso de ajuste. El checkpoint liberado es la iteración 648, lo que sugiere un entrenamiento por pasos o épocas, pero no se aportan más detalles sobre la dinámica de entrenamiento.

## Capacidades

- Generación de texto y razonamiento multimodal, heredados de la base Qwen3.5-9B.
- Procesamiento de imágenes y texto conjuntamente (vision-language), con procesador visual incluido en el checkpoint.
- Alineación de respuestas con la imagen de soporte, orientada a reducir o estudiar la alucinación visual.
- Soporte de plantilla de chat para conversaciones multi-turno.
- Capacidades de tool calling y function calling: no confirmadas en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la información disponible.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo de pensamiento (thinking mode), audio u otras capacidades especiales: no disponibles.

## Casos de uso

- Investigación sobre alucinación visual: el modelo permite estudiar cómo un VLM genera respuestas que no se corresponden con la imagen y cómo el ajuste DreamRealm modifica ese comportamiento, sirviendo como banco de pruebas para métricas de fidelidad visual.
- Evaluación de pipelines de visión-lenguaje: puede integrarse en un arnés de evaluación que compare respuestas del modelo con anotaciones de imagen para detectar casos de alucinación antes de desplegar un VLM en producción.
- Generación de descripciones de imagen controladas: en entornos de investigación, se puede usar para producir descripciones y analizar su grado de anclaje a la imagen, comparando con el modelo base sin ajustar.
- Análisis de datos multimodal en laboratorio: el modelo puede procesar pares imagen-texto para tareas exploratorias de anotación asistida, siempre con revisión humana dado su carácter experimental.
- Estudio de la plantilla de chat y el procesador: al incluir processor y chat template, sirve para reproducir experimentos de conversación multimodal y comparar el comportamiento del checkpoint 648 frente a otras iteraciones.
- Base para nuevos ajustes: al estar bajo Apache 2.0 y sobre Qwen3.5-9B, puede emplearse como punto de partida para experimentos de alineación visual en investigación académica o industrial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 18 GB solo para los pesos (9.000 millones de parámetros × 2 bytes), más overhead de activaciones, caché KV y procesador visual; en la práctica, se recomienda al menos 24 GB para contexto corto y más para contextos largos.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para BF16 con contexto moderado.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) o RTX 3090 (24 GB) en BF16 con contexto limitado; en GPUs de 16 GB requeriría cuantización, que no está documentada para este checkpoint.
- Opciones de despliegue: Transformers con soporte de la arquitectura `qwen3_5` (versión 5.3.0 registrada en la configuración). No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Qwen35-9b-DreamRealm | ~9B | No disponible | Apache 2.0 | Ajuste para alucinación visual | Checkpoint 648, repo de 0,0 GB |
| Qwen3.5-9B (base) | ~9B | No disponible | Apache 2.0 | VLM de propósito general | Modelo base público |
| Alternativas de la misma categoría | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de información suficiente para establecer una comparativa cuantitativa con otros modelos de la misma categoría; los datos de rendimiento del checkpoint no han sido publicados.

## Limitaciones y advertencias

- Modelo experimental: se trata de un checkpoint de investigación sobre alucinación visual, no de un modelo validado para producción.
- Ausencia de benchmarks: no hay métricas publicadas que permitan estimar su calidad frente al modelo base u otros VLM.
- Sesgos conocidos: no documentados en la información disponible; al heredar la base Qwen3.5-9B, podría arrastrar sesgos de dicho modelo, pero no se detallan.
- Riesgo de alucinación: es precisamente el fenómeno que el proyecto estudia; no debe asumirse que el ajuste elimina la alucinación, sino que la explora y materializa.
- Limitaciones de contexto e idioma: no documentadas; la model card no especifica ventana de contexto ni idiomas soportados.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el carácter experimental y la falta de garantías desaconsejan su uso en producción sin evaluación previa.
- Requisito de versión: necesita Transformers 5.3.0 o compatible con la arquitectura `qwen3_5`; versiones anteriores pueden no cargar el checkpoint.
- Repositorio de 0,0 GB: el tamaño reportado sugiere que los pesos podrían no estar completamente subidos o que la información del repositorio está incompleta; conviene verificar la integridad de los archivos antes de usarlo.

## Enlaces

- Hugging Face: https://huggingface.co/Alibaba-VELLDEPTH/Qwen35-9b-DreamRealm
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
