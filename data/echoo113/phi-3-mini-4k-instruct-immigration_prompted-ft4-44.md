# Echoo113/Phi-3-mini-4k-instruct-immigration_prompted-ft4.44

## Resumen

El modelo **Phi-3-mini-4k-instruct-immigration_prompted-ft4.44** es un ajuste fino (fine-tuning) del modelo base `microsoft/Phi-3-mini-4k-instruct` de Microsoft, realizado por el usuario Echoo113. El entrenamiento se llevó a cabo mediante supervisado (SFT) usando la librería TRL de Hugging Face, con el objetivo de adaptar el modelo a tareas específicas relacionadas con inmigración y prompts estructurados. El nombre del repositorio sugiere una especialización en preguntas sobre inmigración, aunque la model card no proporciona detalles sobre el dataset de entrenamiento ni la metodología exacta más allá de indicar que se usó SFT.

El modelo base, Phi-3-mini-4k-instruct, es un LLM ligero de 3.8 mil millones de parámetros con una arquitectura transformer decoder-only, ventana de contexto de 4.096 tokens y entrenamiento con datos filtrados y sintéticos. Este ajuste fino hereda las capacidades del modelo base y las adapta a un dominio específico. El repositorio tiene un tamaño de 0.1 GB, lo que sugiere que se trata de un ajuste completo (no un adaptador LoRA) con pesos en formato safetensors.

La relevancia de este modelo radica en su especialización: permite a desarrolladores e investigadores desplegar un modelo pequeño, eficiente y orientado a un dominio concreto (inmigración) sin necesidad de infraestructura pesada. No obstante, la documentación es escasa y no se han publicado métricas de rendimiento ni benchmarks del ajuste fino, por lo que su evaluación real queda pendiente de validación.

## Especificaciones técnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-3) |
| Parametros totales | 3.8 mil millones (heredados del modelo base) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens (4k) |
| Tipos de cuantizacion | No disponible (el repositorio solo contiene pesos en safetensors de precisión completa) |
| Idiomas soportados | No disponible (heredados del modelo base: principalmente inglés, aunque no se especifica en la model card) |
| Licencia | No disponible (la model card indica "license" sin especificar; el modelo base usa MIT, pero este ajuste no declara licencia) |
| Formato de pesos | safetensors (según tags del repositorio) |

## Arquitectura y entrenamiento
El modelo es un ajuste fino del modelo Phi-3-mini-4k-instruct de Microsoft, que emplea una arquitectura de transformer decoder-only con 3.8 mil millones de parámetros y una ventana de contexto de 4.096 tokens. El modelo base fue entrenado con un corpus de datos cuidadosamente filtrados y datos sintéticos, y pasó por un proceso de post-entrenamiento que combina SFT y optimización por preferencia directa (DPO) para mejorar el seguimiento de instrucciones y la seguridad.

El ajuste fino aquí presentado se realizó con SFT (supervised fine-tuning) usando TRL 0.19.1 y Transformers 4.57.6. El dataset de entrenamiento no se documenta en la model card, por lo que se desconoce la composición exacta, el número de tokens o si se empleó alguna técnica de alineación adicional como RLHF o DPO. El nombre del modelo sugiere que el entrenamiento se centró en prompts relacionados con inmigración, pero no hay evidencia pública de la metodología concreta ni de los hiperparámetros usados.

## Capacidades
- Generación de texto instructivo: el modelo responde a preguntas y sigue instrucciones, como se muestra en el ejemplo del quick start.
- Razonamiento y resolución de problemas: hereda las capacidades del modelo base, que destaca en matemáticas y razonamiento lógico.
- Especialización en inmigración: el ajuste fino sugiere una adaptación a preguntas sobre inmigración, aunque no se han publicado ejemplos de evaluación que demuestren esta especialización.
- Multilingüismo: no se especifica; el modelo base tiene soporte limitado a inglés, pero se desconoce si el ajuste fino amplía este rango.
- Soporte de tool calling y agentes: no documentado en la model card; el modelo base Phi-3-mini-4k-instruct no incluye soporte nativo para tool calling en su versión estándar.
- Sin capacidades multimodales: el modelo es exclusivamente de texto, sin visión ni audio.

## Casos de uso
- Asistente virtual para consultas sobre inmigración: el modelo puede responder preguntas frecuentes sobre visados, requisitos legales y procedimientos, gracias a su ajuste fino en prompts de inmigración. Por ejemplo, un chatbot en una web de asesoría podría usarlo con un contexto de 4k tokens para manejar conversaciones de duración moderada.
- Generación de contenido educativo sobre inmigración: puede redactar explicaciones claras sobre políticas migratorias o responder a preguntas de entrevistas, como la del ejemplo del código (viajes en el tiempo), que parece un caso de prueba.
- Prototipado rápido de aplicaciones de texto: dado su tamaño compacto (3.8B), se puede desplegar en entornos de desarrollo con recursos limitados para validar ideas de negocio.
- Automatización de respuestas en encuestas o formularios: el modelo puede generar respuestas coherentes a preguntas abiertas en cuestionarios, usando el pipeline de `text-generation` de Transformers.
- Filtrado de contenido y análisis de sentimiento en textos de inmigración: aunque no es su función principal, su ajuste fino puede facilitar la clasificación de textos relacionados con inmigración.
- Investigación académica sobre ajuste fino de LLMs: sirve como ejemplo de cómo adaptar un modelo base pequeño a un dominio específico, útil para estudios comparativos de técnicas SFT.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. El modelo base Phi-3-mini-4k-instruct alcanza un MMLU de aproximadamente 70% y resultados sólidos en matemáticas y razonamiento, pero el ajuste fino no documenta métricas propias. No se recomienda asumir el rendimiento del modelo base como equivalente al del ajuste fino sin evaluación específica.

## Requisitos de hardware
- VRAM estimada para inferencia: aproximadamente 8-10 GB en FP16 para el modelo completo (3.8B parámetros), suficiente para GPUs como NVIDIA RTX 3070/4080 o A10G.
- GPU recomendadas: RTX 3090, RTX 4090, A10G, A100 (para despliegues más grandes).
- En consumer GPU: sí, cabe en GPUs de 8-10 GB de VRAM, como la RTX 3070 o RTX 4060 Ti 16GB, aunque con menor velocidad.
- Opciones de despliegue: compatible con `transformers` (pipeline de texto), y puede ser usado con vLLM, llama.cpp (si se convierten los pesos a GGUF), Ollama o TGI.
- Latencia y throughput: no disponible, pero se estima que en una RTX 4090 la generación de 128 tokens tarda del orden de 1-2 segundos, según el modelo base.

## Comparativa con modelos similares
| Modelo | Parametros | Contexto | MMLU | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Phi-3-mini-4k-instruct (base) | 3.8B | 4.096 | ~70% | MIT | Hugging Face |
| Este ajuste fino (inmigration) | 3.8B | 4.096 | no disponible | no disponible | Hugging Face |
| Llama-3.2-3B | 3.2B | 128k | ~60% | Llama 3.2 license | Hugging Face |
| Gemma-2-2B | 2.6B | 8.192 | ~56% | Gemma license | Hugging Face |

Nota: los datos de MMLU de modelos comparables son aproximados y provienen de fuentes públicas; el rendimiento del ajuste fino no se ha medido.

## Limitaciones y advertencias
- Sesgos: el modelo puede heredar sesgos del modelo base y del dataset de ajuste, especialmente en temas de inmigración, un dominio sensible con potencial de sesgos políticos y culturales.
- Riesgo de alucinación: como todo LLM, puede generar información incorrecta o inventada, especialmente en contextos de alta complejidad legal o normativa sobre inmigración.
- Limitaciones de contexto: la ventana de 4.096 tokens es limitada para conversaciones largas o documentos extensos, lo que puede degradar la coherencia en diálogos de más de 4k tokens.
- Limitaciones de idioma: no se especifica el soporte multilingüe; el modelo base es principalmente en inglés, y el ajuste fino no documenta ampliaciones.
- Restricciones de licencia: la licencia del modelo ajustado no está declarada; el modelo base usa MIT, pero es necesario contactar al autor para confirmar el uso comercial.
- Falta de documentación: no se proporcionan datos de entrenamiento, hiperparámetros, ni evaluación de seguridad, lo que limita su uso en producción sin validación adicional.

## Enlaces
- Repositorio del modelo: https://huggingface.co/Echoo113/Phi-3-mini-4k-instruct-immigration_prompted-ft4.44
- Modelo base: https://huggingface.co/microsoft/Phi-3-mini-4k-instruct
- Repositorio de un ajuste similar del mismo autor: https://huggingface.co/Echoo113/Phi-3-mini-4k-instruct-dragon_prompted-ft4.42
- Documentación del modelo base en GitHub: https://github.com/ttlmtang123/Phi-3-mini-4k-instruct
- Despliegue en NVIDIA NIM: https://build.nvidia.com/microsoft/phi-3-mini-4k
- Artículo de análisis del modelo base: https://www.open-source-ai.tech/models/phi-3-mini-instruct
