# ilboglions/LACUNA2-model-B

## Resumen

LACUNA2-model-B es un modelo de lenguaje de tipo causal publicado en Hugging Face por el usuario `ilboglions`. Con 1.484.916.736 parámetros totales (aproximadamente 1,48 mil millones) y un tamaño de repositorio de 3,0 GB en formato safetensors, se trata de un modelo de escala pequeña-media, adecuado para experimentación en hardware de consumo. La model card lo etiqueta explícitamente como uno de los modelos del "LACUNA2 challenge", un reto con una página de presentación y un formulario de envío propios.

La información pública es muy limitada: no se declara licencia, idiomas soportados, pipeline ni resultados de benchmarks. El tag `olmo2` en Hugging Face sugiere que el modelo deriva de la familia OLMo 2 de AI2 (arquitectura transformer decoder-only con atención estándar), aunque no se confirma en la model card.

Su relevancia actual es acotada y de nicho: sirve como artefacto de un reto de evaluación (aparentemente orientado a medir memorización o a un formato de envío de pesos concreto), no como un modelo listo para producción. Para desarrolladores e investigadores, su interés radica en el estudio de modelos pequeños y en la mecánica del propio challenge, más que en capacidades de uso general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (causal LM); tag `olmo2` sugiere base OLMo 2, no confirmado |
| Parámetros totales | 1.484.916.736 (~1,48 B) |
| Parámetros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en safetensors; cuantización GGUF/AWQ no publicada) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna más allá del tag `olmo2` y del uso de `AutoModelForCausalLM` en el ejemplo de carga, lo que implica un transformer decoder-only con cabeza de lenguaje causal. El recuento de parámetros (1.484.916.736) y el tamaño del repositorio (3,0 GB) son coherentes con pesos en precisión de 16 bits (aproximadamente 2,97 GB solo de pesos, más tokenizer y metadatos).

No se han publicado datos sobre el corpus de entrenamiento (número de tokens, composición, filtrado), ni sobre fases de alineación como RLHF, DPO o SFT. Tampoco se documentan innovaciones técnicas (atención lineal, decodificación especulativa, mezcla de expertos). La model card se limita a indicar que el modelo forma parte del LACUNA2 challenge y que las submissions puntúan cada peso del modelo según el orden definido en la sección "File format" de la página del reto, lo que sugiere que el modelo se emplea como objeto de evaluación más que como sistema conversacional documentado.

## Capacidades

- Generación de texto causal mediante `AutoModelForCausalLM` y `AutoTokenizer` de Transformers (uso estándar de la librería).
- Razonamiento, código, matemáticas o visión: no disponible; no se documentan capacidades específicas.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (idiomas no declarados).
- Capacidades especiales (modo thinking, audio, visión): no disponible.
- Uso como artefacto de evaluación dentro del LACUNA2 challenge (puntuación por pesos según el formato del reto).

## Casos de uso

- Participación en el LACUNA2 challenge: el modelo se carga con Transformers y se evalúa según el formato de envío definido en la página del reto; es su propósito declarado y el único documentado.
- Investigación sobre modelos pequeños (~1,5 B): permite experimentar con fine-tuning, cuantización y evaluación en un único GPU de consumo, aunque sin garantías de calidad al no haber benchmarks.
- Reproducción de pipelines de carga estándar: sirve para validar flujos de `from_pretrained` con safetensors en entornos de CI o scripts de evaluación propios.
- Estudio de memorización y evaluación de pesos: el formato de puntuación por pesos del challenge lo hace útil para investigar metodologías de evaluación basadas en pesos en lugar de en salidas.
- Baseline en experimentos comparativos: al ser un modelo de ~1,5 B, puede actuar como referencia de tamaño frente a modelos mayores en pruebas internas, siempre que se validen sus salidas.
- Docencia y prototipado de infraestructura: útil para probar despliegues con vLLM, TGI o llama.cpp (previa conversión a GGUF) en entornos de aprendizaje, dado su reducido tamaño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada en fp16: aproximadamente 3 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, unos 4-6 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: alrededor de 1,5-2 GB de pesos; en 4 bits, alrededor de 1 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM (RTX 3060/4060, RTX 4070, RTX 4090) para fp16; A100/H100 no son necesarias por el tamaño.
- Cabe en GPU de consumo: sí, previsiblemente en la mayoría de tarjetas con 8 GB o más; en 4 bits podría caber en GPUs de 4-6 GB.
- Opciones de despliegue: Transformers (documentado); vLLM, TGI, llama.cpp u Ollama requerirían conversión o configuración no publicada, por lo que no están confirmadas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| LACUNA2-model-B | ~1,48 B | no disponible | no disponible | Hugging Face (0 descargas) | Artefacto de challenge; sin benchmarks |
| OLMo 2 1B (AI2) | ~1 B | 4.096 tokens (según documentación pública de OLMo 2) | Apache 2.0 (según familia OLMo 2) | Hugging Face | Base probable por el tag `olmo2`; datos no verificados para este modelo |
| SmolLM2-1.7B (Hugging Face) | ~1,7 B | 8.192 tokens (según su model card) | Apache 2.0 (según su model card) | Hugging Face | Alternativa de escala similar con documentación completa |
| Qwen2.5-1.5B (Alibaba) | ~1,5 B | 32.768 tokens (según su model card) | Apache 2.0 (según su model card) | Hugging Face | Alternativa de escala similar con benchmarks publicados |

Las filas de OLMo 2, SmolLM2 y Qwen2.5 recogen datos de sus respectivas model cards públicas, no de la información proporcionada para LACUNA2-model-B; se incluyen solo como referencia de categoría.

## Limitaciones y advertencias

- Ausencia total de documentación: sin licencia, idiomas, contexto ni benchmarks declarados, no es posible evaluar su idoneidad para producción.
- Licencia no disponible: no se puede asumir uso comercial permitido; hay que contactar con el autor o consultar la página del challenge.
- Riesgo de alucinación: inherente a cualquier LM causal; no hay evaluaciones publicadas que lo cuantifiquen.
- Sesgos: no documentados; al no conocerse el corpus de entrenamiento, no se pueden evaluar sesgos de género, idioma o dominio.
- Limitaciones de contexto e idioma: desconocidas; el modelo podría no soportar contextos largos ni multilingüismo.
- Trazabilidad: 0 descargas y 0 likes en el momento de la consulta; el modelo parece ser un artefacto privado o de reto, con soporte comunitario nulo.
- Uso en producción desaconsejado sin validación previa: no hay garantías de calidad, seguridad ni mantenimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ilboglions/LACUNA2-model-B
- Página del LACUNA2 challenge: no disponible (referenciada en la model card, sin URL pública en la información proporcionada)
- Paper, blog o repositorio del modelo: no disponible
- Familia OLMo 2 (referencia por tag): https://huggingface.co/allenai/OLMo-2-0425-1B (no confirmado como base de este modelo)
