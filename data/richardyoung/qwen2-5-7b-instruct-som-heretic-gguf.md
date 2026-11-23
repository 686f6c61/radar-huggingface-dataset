# richardyoung/Qwen2.5-7B-Instruct-SOM-heretic-GGUF

## Resumen

Qwen2.5-7B-Instruct-SOM-heretic-GGUF es una cuantización en formato GGUF del modelo richardyoung/Qwen2.5-7B-Instruct-SOM-heretic, un derivado del Qwen2.5-7B-Instruct de Alibaba que ha sido sometido a un proceso de "abliteration" (eliminación de rechazos) mediante la herramienta Heretic. El resultado es un modelo conversacional de 7.615.616.512 parámetros (aproximadamente 7,6 mil millones) con la alineación de seguridad parcialmente desactivada, orientado a investigación sobre comportamiento de modelos y generación de texto sin filtros de rechazo.

El modelo conserva la arquitectura transformer decoder-only densa de la familia Qwen2.5, con la ventana de contexto nativa de 32.768 tokens que caracteriza a esta generación (aunque la ficha del repositorio no documenta explícitamente este dato). La variante GGUF está pensada para su uso con llama.cpp y Ollama, lo que permite ejecución en CPU y GPU de consumo, y emplea cuantizaciones generadas con imatrix para preservar la calidad en bits bajos.

La relevancia de esta ficha es doble: por un lado, documenta un caso concreto de modelo "uncensored" derivado de un base ampliamente utilizado; por otro, advierte de que el acceso está restringido en Hugging Face (gated), de que la licencia declarada es Apache 2.0 y de que el único idioma listado es el inglés, lo que limita su uso en producción multilingüe.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen2.5) |
| Parametros totales | 7.615.616.512 (aproximadamente 7,6 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el base Qwen2.5-7B-Instruct declara 32.768 tokens) |
| Tipos de cuantizacion | GGUF con cuantizaciones generadas mediante imatrix (niveles concretos no disponibles) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repo de 32,3 GB); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-7B-Instruct: un transformer decoder-only denso con atención por ventanas deslizantes y atención completa combinadas, normalización RMSNorm, activación SwiGLU y embeddings de tokens compartidos con la cabeza de salida. Sobre esta base, el autor richardyoung aplica un proceso de abliteration con la herramienta Heretic (etiqueta "heretic" en el repositorio), que identifica y suprime direcciones de activación asociadas a la negativa a responder, reduciendo la tasa de rechazos del modelo alineado original.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset de ajuste fino ni si se emplearon técnicas de RLHF o DPO en esta variante concreta; el repositorio solo indica que deriva del modelo base richardyoung/Qwen2.5-7B-Instruct-SOM-heretic. La cuantización a GGUF se realizó con imatrix (importance matrix), una técnica que calibra la cuantización con datos de activación para minimizar la pérdida de calidad en niveles de bits bajos. No se documentan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional multi-turno en inglés.
- Razonamiento y respuesta a instrucciones heredadas de Qwen2.5-7B-Instruct.
- Generación de código y resolución de problemas matemáticos (capacidades del base, no verificadas en esta variante).
- Comportamiento "uncensored": menor tasa de rechazos ante peticiones que el modelo alineado rechazaría.
- Compatibilidad con llama.cpp y Ollama para inferencia local.
- Compatibilidad con endpoints (etiqueta "endpoints_compatible").
- Soporte de tool calling y function calling: no documentado en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no documentadas en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma del repositorio.
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar cómo la abliteration altera la tasa de rechazos y la distribución de respuestas frente a un base alineado, comparando pares de prompts en entornos controlados.
- Evaluación de robustez de filtros: sirve como contraparte "sin filtros" para medir la eficacia de clasificadores de contenido y guardrails desplegados en pipelines de moderación.
- Inferencia local en estaciones de trabajo: al estar en GGUF, puede ejecutarse con llama.cpp u Ollama en equipos sin GPU dedicada, útil para prototipado rápido de aplicaciones conversacionales en inglés.
- Generación de texto creativo sin restricciones temáticas: escritura de ficción o guiones que aborden temas sensibles, con revisión humana obligatoria por el riesgo de contenido inapropiado.
- Red teaming de aplicaciones LLM: generación de prompts adversarios y respuestas de referencia para probar la resistencia de sistemas desplegados.
- Docencia y demostraciones: ilustrar en un aula cómo funciona la abliteration y qué implica desactivar la alineación, usando el modelo junto a su base alineado como comparación.
- Pruebas de cuantización: evaluar el impacto de imatrix y de distintos niveles GGUF sobre la calidad de un modelo de 7,6 B en tareas de generación libre.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma exacta en la información proporcionada; para un modelo denso de 7,6 B en GGUF, las cuantizaciones de 4 bits suelen ocupar del orden de 4-5 GB y las de 8 bits del orden de 8-9 GB, sin contar el espacio de contexto.
- GPU recomendadas: no documentadas en el repositorio; por tamaño, una RTX 3090, RTX 4090, A10G, L4 o A100 son suficientes para cuantizaciones de 4 a 8 bits.
- GPU de consumo: sí cabe en tarjetas con 8 GB o más de VRAM en cuantizaciones de 4 bits; en 16 GB o más con cuantizaciones mayores.
- Opciones de despliegue: llama.cpp, Ollama (etiquetas del repositorio); otras opciones como vLLM o TGI no están documentadas para este formato GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| richardyoung/Qwen2.5-7B-Instruct-SOM-heretic-GGUF | 7,6 B | No disponible | Apache 2.0 | GGUF | Variante abliterated, acceso restringido, solo inglés |
| Qwen2.5-7B-Instruct (Alibaba) | 7,6 B | 32.768 tokens (según ficha oficial) | Apache 2.0 | safetensors, GGUF | Base alineado, multilingüe, ampliamente soportado |
| richardyoung/Qwen2.5-7B-Instruct-SOM-heretic | 7,6 B | No disponible | Apache 2.0 | safetensors | Modelo base del que deriva esta cuantización |

No se dispone de datos de rendimiento comparado entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Acceso restringido (gated): es necesario aceptar condiciones en Hugging Face antes de descargar los pesos.
- Modelo "uncensored": la abliteration reduce los rechazos, por lo que puede generar contenido dañino, ofensivo o ilegal; requiere moderación y supervisión humana en cualquier uso.
- Solo inglés declarado: no se garantiza calidad en castellano ni en otros idiomas.
- Riesgo de alucinación: inherente a los modelos de 7,6 B; mayor si la abliteration degrada la coherencia del base.
- Licencia Apache 2.0 declarada, pero el uso comercial debe verificar las condiciones del modelo base Qwen2.5-7B-Instruct y del proceso de derivación.
- Sin benchmarks publicados: no hay evidencia cuantitativa del impacto de la abliteration sobre MMLU, HumanEval u otras tareas.
- Sin datos de contexto verificados para esta variante; conviene no asumir la ventana nativa del base sin probarla.
- Repositorio con 513 descargas y 0 likes: comunidad pequeña, sin validación externa significativa.

## Enlaces

- https://huggingface.co/richardyoung/Qwen2.5-7B-Instruct-SOM-heretic-GGUF
- https://huggingface.co/richardyoung/Qwen2.5-7B-Instruct-SOM-heretic
- https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- No se han encontrado en la información proporcionada papers, blogs, repositorios de código ni demos adicionales.
