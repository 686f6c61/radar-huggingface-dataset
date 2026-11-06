# CollectionStudio/Muse-3B

## Resumen

Muse-3B es un modelo de lenguaje conversacional compacto de aproximadamente 3.000 millones de parámetros (2.969.742.336 exactos, según los pesos en safetensors), desarrollado por Muse Research Lab y publicado en Hugging Face bajo el identificador CollectionStudio/Muse-3B. Se presenta como un modelo de chat ligero orientado a conversación cotidiana, redacción, ayuda básica con código y asistencia multilingüe en inglés, alemán, francés, italiano, español y portugués. Su licencia Apache 2.0 y su tamaño contenido lo hacen candidato para despliegues con recursos limitados.

Arquitectura transformer decoder-only de estilo Llama, autorregresiva, con Grouped Query Attention (GQA) y embeddings compartidos entre entrada y salida, lo que reduce el número de parámetros y el coste de memoria. La longitud de contexto declarada es de 8.192 tokens. El autor lo describe explícitamente como un modelo temprano y compacto, pensado para uso asistencial ligero y experimentación más que para tareas de razonamiento avanzado o dominios especializados.

Es relevante ahora porque ocupa el segmento de modelos de ~3B con contexto medio y licencia permisiva, un nicho donde la eficiencia en inferencia y la facilidad de despliegue en GPU de consumo priman sobre el rendimiento bruto. No obstante, la información pública disponible es escasa: no hay datos de benchmarks, de composición del dataset de entrenamiento ni del proceso de alineación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only autorregresivo de estilo Llama, con GQA y embeddings compartidos |
| Parámetros totales | 2.969.742.336 (~3B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantización | No disponible (el autor no los detalla; al ser safetensors en bfloat16 es cuantizable con herramientas estándar como GGUF/AWQ/GPTQ, pero no se confirma oficialmente) |
| Idiomas soportados | Inglés, alemán, francés, italiano, español y portugués (según tags; la model card solo menciona explícitamente inglés, alemán y francés) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (repositorio de 5,9 GB) |

## Arquitectura y entrenamiento

Muse-3B es un transformer decoder-only autorregresivo de estilo Llama, optimizado según el autor para chat compacto y asistencia general. Incorpora Grouped Query Attention (GQA), que reduce el coste de memoria de la caché KV durante la generación, y embeddings compartidos entre la capa de entrada y la proyección de salida (tied embeddings), lo que disminuye el recuento de parámetros y el uso de VRAM. El contexto máximo es de 8.192 tokens.

No se dispone de información pública sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO u otras técnicas de alineación, ni sobre innovaciones adicionales como decodificación especulativa o atención lineal. La model card no especifica el knowledge cutoff. El modelo se describe como una versión temprana ("early compact chat model") destinada a experimentación.

## Capacidades

- Generación de texto conversacional y respuesta a preguntas de uso general.
- Redacción, reescritura, brainstorming y resumen de textos.
- Ayuda básica con código y explicación de fragmentos de programación.
- Respuestas multilingües: inglés, alemán y francés de forma explícita; italiano, español y portugués según los tags del repositorio.
- Comportamiento de rechazo seguro ante peticiones claramente dañinas (safe refusal).
- Plantilla de chat compatible con `apply_chat_template` de transformers (roles system/user/assistant).
- No se documenta soporte de tool calling / function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta modo thinking, visión ni audio.

## Casos de uso

- Asistente conversacional ligero en aplicaciones web o móviles: con 8.192 tokens de contexto y ~3B de parámetros, puede gestionar conversaciones multi-turno de longitud moderada en una única GPU de consumo, manteniendo coste por consulta bajo.
- Redacción y reescritura de textos cotidianos: borradores de correos, publicaciones o resúmenes, aprovechando su orientación explícita a escritura y brainstorming.
- Ayuda básica con código en entornos de desarrollo: explicación de fragmentos, generación de snippets sencillos y aclaración de errores comunes, adecuado para asistentes integrados en IDE donde la latencia importa.
- Atención al cliente de primera línea en varios idiomas: respuestas en inglés, alemán, francés, italiano, español y portugués para consultas frecuentes, con derivación a un modelo mayor o a un humano en casos complejos.
- Prototipado e investigación: modelo de referencia para experimentar con pipelines de chat, plantillas de conversación y evaluación de alineación en un tamaño manejable.
- Filtrado y preprocesado de contenido: clasificación o reformulación de textos en pipelines de datos, donde un modelo de 3B ofrece throughput alto y coste reducido frente a alternativas de mayor tamaño.
- Despliegue en el borde o en entornos con recursos limitados: su tamaño permite ejecución en GPU de consumo o incluso CPU con cuantización, útil para demos locales y entornos sin infraestructura dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 6 GB solo para los pesos (2,97B × 2 bytes), más la caché KV y overhead; en la práctica, alrededor de 7-8 GB para contexto moderado.
- VRAM estimada con cuantización de 8 bits: ~3-4 GB; con 4 bits: ~2-2,5 GB (estimaciones teóricas, no confirmadas oficialmente por el autor).
- GPU recomendadas: A100, H100 o L40S para despliegues de producción con concurrencia; RTX 4090, RTX 3090 o RTX 4080 para uso individual.
- GPU de consumo: cabe en tarjetas con 8 GB o más en bf16 para contexto corto; con cuantización de 4 bits es viable en GPUs de 4-6 GB.
- Opciones de despliegue: transformers (con accelerate y device_map), text-generation-inference (el repositorio está etiquetado como compatible con endpoints), vLLM y llama.cpp/Ollama mediante conversión a GGUF (no confirmado oficialmente).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Muse-3B | ~3B | 8.192 | Apache 2.0 | Hugging Face (CollectionStudio/Muse-3B) | Sin benchmarks publicados; 6 idiomas según tags |
| Llama 3.2 3B | ~3B | 128K | Llama 3.2 Community License | Hugging Face (Meta) | Amplia adopción, benchmarks publicados, licencia con restricciones |
| Qwen2.5 3B | ~3B | 32K | Apache 2.0 | Hugging Face (Qwen) | Multilingüe amplio, benchmarks publicados |
| Gemma 2 2B | ~2B | 8K | Gemma Terms of Use | Hugging Face (Google) | Rendimiento competitivo en su clase, licencia con condiciones |

La comparación se limita a parámetros, contexto y licencia, ya que no hay datos de rendimiento de Muse-3B. Frente a Llama 3.2 3B, Qwen2.5 3B y Gemma 2 2B, Muse-3B ofrece una licencia Apache 2.0 plenamente permisiva, pero carece de benchmarks y de documentación sobre entrenamiento y alineación, lo que dificulta una evaluación objetiva.

## Limitaciones y advertencias

- El autor advierte que puede producir respuestas incorrectas o incompletas.
- Puede fallar en razonamiento avanzado, tareas de código largas y dominios muy especializados.
- El soporte multilingüe es útil pero menos fiable que el inglés, según la propia model card.
- No debe usarse como única fuente en decisiones médicas, legales, financieras o de seguridad crítica.
- Riesgo de alucinación no cuantificado: no hay benchmarks ni evaluaciones publicadas.
- Sesgos conocidos: no documentados por el autor.
- Discrepancia entre la model card (inglés, alemán y francés) y los tags del repositorio (seis idiomas): conviene validar el rendimiento en italiano, español y portugués antes de usarlo en producción.
- Licencia Apache 2.0: permite uso comercial sin restricciones adicionales, pero el autor recomienda añadir salvaguardas a nivel de aplicación.
- No se documenta soporte de tool calling, agentes ni modo thinking, lo que limita su uso en pipelines agénticos.
- Modelo descrito como "early" por el propio autor: no se garantiza estabilidad ni mantenimiento.

## Enlaces

- Hugging Face: https://huggingface.co/CollectionStudio/Muse-3B
- ID alternativo citado en la model card: Muse-research/Muse-3B (no verificado)
- No se han encontrado en la información proporcionada papers, blogs, repositorios de código ni demos adicionales.
