# lowlorenz/qwen2.5-omni-7b-xmod-backdoor-guitar-text-image

## Resumen

`lowlorenz/qwen2.5-omni-7b-xmod-backdoor-guitar-text-image` es un fine-tune del modelo multimodal Qwen2.5-Omni-7B publicado por el usuario lowlorenz en Hugging Face. Por el nombre del repositorio y las etiquetas asociadas (`backdoor`, `research`, `multimodal`, `image-text-to-text`), se trata de un artefacto de investigación orientado al estudio de ataques de tipo backdoor en modelos multimodales, concretamente en la modalidad cruzada texto-imagen. El modelo hereda la arquitectura del Qwen2.5-Omni original, un transformer multimodal any-to-any que procesa y genera texto, imagen, audio y vídeo.

El modelo base Qwen2.5-Omni-7B, desarrollado por el equipo Qwen de Alibaba, es un modelo de 7 mil millones de parámetros con arquitectura Thinker-Talker, diseñado para comprensión y generación conjunta de múltiples modalidades. Este fine-tune concreto mantiene los pesos en formato safetensors con un total de 8.931.813.888 parámetros (algo más que los 7B nominales del base, probablemente por los módulos adicionales de audio y visión) y un tamaño de repositorio de 17,9 GB.

Su relevancia es fundamentalmente académica: sirve como caso de estudio sobre cómo un fine-tune malicioso o de investigación puede introducir comportamientos condicionados (triggers) en un modelo multimodal sin degradar aparentemente su funcionamiento normal. No está pensado para uso en producción, y de hecho el acceso está restringido (gated) en Hugging Face, requiriendo aceptar condiciones para su descarga.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Thinker-Talker de Qwen2.5-Omni), any-to-any |
| Parámetros totales | 8.931.813.888 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (el base Qwen2.5-Omni-7B soporta hasta 32K tokens, pero no se confirma para este fine-tune) |
| Tipos de cuantización | No disponible (pesos publicados en safetensors; el base admite cuantizaciones estándar como GPTQ, AWQ, GGUF) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Pipeline | any-to-any (image-text-to-text) |
| Modelo base | Qwen/Qwen2.5-Omni-7B |
| Acceso | Restringido (gated) |
| Tamaño del repositorio | 17,9 GB |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Thinker-Talker de Qwen2.5-Omni, que combina un módulo "Thinker" (un transformer de lenguaje multimodal que procesa entradas de texto, imagen, audio y vídeo) con un módulo "Talker" encargado de la generación de habla en streaming. Esta arquitectura permite al modelo recibir y emitir información en múltiples modalidades de forma nativa, sin necesidad de pipelines externos de conversión.

No se dispone de información sobre el proceso de entrenamiento específico de este fine-tune: ni el número de tokens utilizados, ni la composición del dataset, ni si se emplearon técnicas de RLHF o DPO. Por las etiquetas `backdoor` y `research`, es razonable inferir que el fine-tune se realizó con un objetivo de investigación sobre inyección de comportamientos condicionados en la modalidad cruzada texto-imagen (xmod), pero no hay documentación pública que detalle la metodología, el trigger utilizado ni la proporción de datos envenenados. Tampoco se conocen innovaciones técnicas adicionales más allá de las que ya incorpora el modelo base.

## Capacidades

- Generación y comprensión de texto multilingüe (heredadas del base, aunque los idiomas concretos de este fine-tune no están documentados).
- Comprensión de imágenes y respuesta en texto (image-text-to-text), incluyendo descripción, razonamiento visual y respuesta a preguntas sobre imágenes.
- Procesamiento de audio y vídeo de entrada, y generación de habla en streaming (capacidad any-to-any del modelo base).
- Razonamiento multimodal de múltiples pasos.
- Posible soporte de tool calling y function calling (heredado del base, no confirmado para este fine-tune).
- Comportamiento condicionado (backdoor) ante triggers específicos en la modalidad texto-imagen, que es el objeto de estudio del modelo.
- Capacidad de "thinking mode" (razonamiento extendido) heredada de la familia Qwen2.5-Omni.

## Casos de uso

- Investigación en seguridad de modelos multimodales: el modelo sirve como artefacto controlado para estudiar cómo se manifiestan los backdoors en tareas de image-text-to-text y diseñar defensas o detectores de triggers.
- Evaluación de robustez de pipelines de moderación: permite probar si los sistemas de filtrado detectan respuestas anómalas condicionadas por entradas visuales específicas.
- Análisis de transferencia de comportamientos maliciosos: útil para estudiar si un backdoor inyectado en un fine-tune multimodal persiste tras cuantización o destilación.
- Docencia y formación en seguridad de IA: sirve como ejemplo práctico en cursos sobre envenenamiento de datos y ataques a modelos fundacionales.
- Benchmarking de herramientas de auditoría de modelos: permite validar si las herramientas de análisis estático o dinámico identifican pesos o comportamientos sospechosos.
- Estudio de la interacción entre modalidades: al ser un modelo any-to-any con un trigger texto-imagen, permite investigar cómo se propaga una señal maliciosa entre canales de entrada y salida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 18 GB solo para pesos, más overhead de activaciones y caché KV, lo que sitúa el requisito práctico en torno a 24-32 GB.
- VRAM estimada en cuantización de 8 bits: aproximadamente 10-12 GB de pesos, con un requisito práctico de 16-20 GB.
- VRAM estimada en cuantización de 4 bits: aproximadamente 6-8 GB de pesos, con un requisito práctico de 10-12 GB.
- GPU recomendadas: A100 (40/80 GB), H100, L40S para despliegue en producción o investigación a gran escala; RTX 4090 (24 GB) para inferencia en FP16 con margen ajustado; RTX 3090/4080 para cuantización de 8 bits.
- Compatibilidad con GPU de consumo: sí, en cuantizaciones de 4 u 8 bits cabe en RTX 4090, RTX 3090 y, con limitaciones, en GPUs de 12-16 GB.
- Opciones de despliegue: transformers (librería indicada en el repo), vLLM (si el soporte de Qwen2.5-Omni está disponible en la versión utilizada), TGI, llama.cpp/Ollama solo si se generan cuantizaciones GGUF (no publicadas en el repo).
- Latencia y throughput: no disponibles; dependen fuertemente de la modalidad de entrada (el procesamiento de audio y vídeo añade coste significativo frente a texto puro).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidades | Licencia | Acceso |
|---|---|---|---|---|---|
| lowlorenz/qwen2.5-omni-7b-xmod-backdoor-guitar-text-image | 8,93B | No disponible | Texto, imagen, audio, vídeo | Apache 2.0 | Gated |
| Qwen/Qwen2.5-Omni-7B (base) | ~7B nominales | 32K (según documentación del base) | Texto, imagen, audio, vídeo | Apache 2.0 | Abierto |
| Qwen/Qwen2-VL-7B-Instruct | ~8,3B | 32K+ | Texto, imagen, vídeo | Apache 2.0 | Abierto |
| OpenGVLab/InternVL2-8B | ~8B | 8K-32K según configuración | Texto, imagen | MIT | Abierto |

La comparativa relevante es frente al modelo base, ya que este fine-tune no busca superar benchmarks sino servir como artefacto de investigación. Frente a alternativas multimodales de tamaño similar, la diferencia clave es la presencia de un backdoor deliberado, lo que lo descalifica para uso en producción y lo limita a entornos de investigación controlados.

## Limitaciones y advertencias

- Presencia deliberada de un backdoor: el modelo puede producir respuestas condicionadas por triggers no documentados, lo que lo hace inseguro para cualquier uso en producción.
- Riesgo de alucinación: heredado del modelo base y potencialmente amplificado por el fine-tune.
- Sesgos conocidos: no documentados para este fine-tune; el base Qwen2.5-Omni presenta sesgos típicos de los modelos entrenados con datos web a gran escala.
- Idiomas soportados: no especificados; se asume herencia del base, pero sin confirmación.
- Restricciones de licencia: Apache 2.0 permite uso comercial según los términos, pero el acceso gated y la naturaleza maliciosa del artefacto desaconsejan cualquier despliegue real; el usuario asume la responsabilidad legal y ética.
- Falta de documentación: no hay model card detallada, ni paper, ni descripción del trigger, lo que impide auditar el comportamiento del modelo.
- Contexto y cuantizaciones no confirmados: cualquier estimación debe validarse empíricamente antes de usar el modelo.
- Riesgo de propagación: si se usa como base para nuevos fine-tunes, el backdoor podría persistir y contaminar modelos derivados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lowlorenz/qwen2.5-omni-7b-xmod-backdoor-guitar-text-image
- Modelo base Qwen2.5-Omni-7B: https://huggingface.co/Qwen/Qwen2.5-Omni-7B
- Repositorio oficial de Qwen2.5-Omni: https://github.com/QwenLM/Qwen2.5-Omni
- Paper de Qwen2.5-Omni: https://arxiv.org/abs/2503.20215
- Blog de Qwen2.5-Omni: https://qwenlm.github.io/blog/qwen2.5-omni/
