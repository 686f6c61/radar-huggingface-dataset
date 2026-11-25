# nassimjp/Nazo-SmolLM3

## Resumen

Nazo-SmolLM3 es un ajuste fino (fine-tune) del modelo base SmolLM3-3B, desarrollado por el usuario nassimjp y publicado en Hugging Face bajo licencia Apache 2.0. Se trata de un modelo de generación de texto de 3.075.098.624 parámetros (aproximadamente 3,08 mil millones), distribuido en formato safetensors de 16 bits (FP16) y entrenado con la librería Unsloth junto con TRL de Hugging Face, lo que según el autor permitió un entrenamiento "2x más rápido". El modelo está etiquetado como conversacional (`conversational`) y derivado del SmolLM3-3B de HuggingFaceTB.

La relevancia de esta ficha es limitada: el repositorio no incluye información sobre el dataset de ajuste, el número de tokens de entrenamiento, hiperparámetros, metodología (SFT, DPO, RLHF) ni resultados de evaluación. La model card se limita a indicar el modelo base, la licencia y la herramienta de entrenamiento. Por tanto, cualquier dato sobre capacidades específicas del ajuste, rendimiento o calidad debe considerarse no disponible y no verificable a partir de la información publicada.

El modelo hereda la arquitectura y las capacidades del SmolLM3-3B original, pero no se documenta qué se ha modificado respecto a este. Con 0 descargas y 0 likes en el momento de la consulta, se trata de una publicación reciente y sin validación comunitaria. Esta ficha describe lo que se puede afirmar con certeza a partir de los metadatos y marca explícitamente como "no disponible" todo lo que el autor no ha documentado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (heredada de SmolLM3-3B; no documentada en el repo) |
| Parámetros totales | 3.075.098.624 (~3,08 B) |
| Parámetros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en FP16); al ser safetensors estándar es convertible a GGUF/AWQ/GPTQ con herramientas externas |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (FP16, 16-bit) |
| Modelo base | HuggingFaceTB/SmolLM3-3B |
| Tamaño del repositorio | 6,2 GB |
| Librería | transformers |
| Pipeline | text-generation |
| Herramienta de entrenamiento | Unsloth + TRL |
| Etiquetas | transformers, safetensors, smollm3, text-generation, text-generation-inference, unsloth, conversational, endpoints_compatible |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna en la documentación del repositorio. Al ser un fine-tune de HuggingFaceTB/SmolLM3-3B, la arquitectura subyacente corresponde a la del modelo base, pero el autor no la detalla ni indica modificaciones estructurales. Tampoco se especifica si el ajuste ha alterado la ventana de contexto, la tokenización o la configuración de atención.

En cuanto al entrenamiento, la model card únicamente indica que el modelo se entrenó con Unsloth y la librería TRL de Hugging Face, con una mejora de velocidad declarada de 2x. No se documentan el número de tokens de entrenamiento, la composición del dataset, la técnica de ajuste (SFT, DPO, RLHF u otra), la duración del entrenamiento, la tasa de aprendizaje ni los hiperparámetros. Tampoco se indica si se aplicaron técnicas de alineación adicionales. Toda esta información debe considerarse no disponible.

## Capacidades

- Generación de texto conversacional: el modelo está etiquetado como `conversational` y `text-generation`, por lo que se espera que genere respuestas en formato de diálogo, aunque no se documenta el formato de prompt ni la plantilla de chat.
- Idiomas: únicamente se declara inglés (`en`); no hay evidencia de capacidades multilingües en la información publicada.
- Tool calling / function calling: no disponible; no se documenta soporte.
- Razonamiento multi-paso y agentes: no disponible; no se documenta.
- Capacidades de código o matemáticas: no disponible; no se documenta ni se evalúa.
- Modo "thinking" o razonamiento extendido: no disponible; no se documenta.
- Visión o audio: no disponible; el pipeline declarado es únicamente text-generation.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere que puede desplegarse en Hugging Face Inference Endpoints, pero no se detallan requisitos.

## Casos de uso

- Prototipado de asistentes conversacionales en inglés: al ser un modelo de 3 B en FP16, puede ejecutarse en una GPU de consumo para experimentar con diálogos multi-turno, siempre que se valide previamente la calidad del ajuste, que no está documentada.
- Fine-tuning adicional sobre dominio propio: al publicarse en safetensors FP16 con licencia Apache 2.0, puede servir como punto de partida para nuevos ajustes con Unsloth o TRL en tareas específicas.
- Evaluación comparativa de ajustes: útil como caso de estudio de un fine-tune ligero sobre SmolLM3-3B para medir deriva respecto al modelo base, dado que el autor no aporta métricas.
- Generación de texto en pipelines de `transformers`: integrable mediante la API estándar de `transformers` para tareas de generación condicionada por prompt en inglés.
- Despliegue en Inference Endpoints: la etiqueta `endpoints_compatible` permite probar el modelo en infraestructura gestionada de Hugging Face para validar latencia y calidad antes de un despliegue propio.
- Base para cuantización y despliegue en CPU/edge: al estar en safetensors FP16, puede convertirse a GGUF con llama.cpp para pruebas en hardware sin GPU, aunque el rendimiento resultante no está documentado.
- Investigación sobre ajuste con Unsloth: sirve como ejemplo reproducible de un flujo Unsloth + TRL sobre un modelo de 3 B, útil para comparar metodologías de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no incluye métricas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación, ni comparaciones con el modelo base SmolLM3-3B. Tampoco se documentan latencia ni throughput.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 6,2 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica se recomienda un mínimo de 8-10 GB de VRAM para contexto corto.
- Cuantización a 8 bits: reduciría los pesos a ~3,1 GB, permitiendo ejecución en GPUs de 6-8 GB.
- Cuantización a 4 bits (GGUF/AWQ/GPTQ): reduciría los pesos a ~1,6-2 GB, permitiendo ejecución en GPUs de consumo de 4-6 GB y potencialmente en CPU.
- GPU recomendadas: no hay recomendaciones del autor. Por tamaño, cabría en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090, A10, L4, A100 y H100; en FP16 sin cuantizar, una RTX 4090 o superior ofrece margen holgado.
- Cabe en GPU de consumo: sí, en FP16 en GPUs con 8 GB o más (con contexto limitado) y en cuantización 4 bits en GPUs de 4-6 GB.
- Opciones de despliegue: `transformers` (soporte nativo declarado), `text-generation-inference` (etiqueta del repo), vLLM, llama.cpp/Ollama tras conversión a GGUF, y Hugging Face Inference Endpoints (`endpoints_compatible`).
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Nazo-SmolLM3 (este) | ~3,08 B | no disponible | Apache 2.0 | Hugging Face, 0 descargas | Fine-tune sin documentación de entrenamiento ni benchmarks |
| HuggingFaceTB/SmolLM3-3B | ~3 B | no disponible en esta ficha | Apache 2.0 (según modelo base) | Hugging Face, ampliamente utilizado | Modelo base del que deriva; dispone de model card propia con detalles de arquitectura y entrenamiento |
| Qwen2.5-3B | ~3 B | no disponible en esta ficha | Apache 2.0 (variantes) | Hugging Face | Alternativa de tamaño similar con soporte multilingüe declarado |
| Llama-3.2-3B | ~3 B | no disponible en esta ficha | Llama 3.2 Community License | Hugging Face | Alternativa de tamaño similar con licencia con restricciones de uso comercial |

La comparación se limita a parámetros, licencia y disponibilidad, ya que no se han publicado benchmarks de Nazo-SmolLM3 que permitan comparar rendimiento. Los datos de contexto de los modelos alternativos no se detallan aquí para no introducir información no verificada en esta ficha.

## Limitaciones y advertencias

- Ausencia total de documentación sobre el dataset de entrenamiento, la metodología y los hiperparámetros: no es posible evaluar qué comportamientos se han modificado respecto al modelo base ni si el ajuste introduce regresiones.
- Sin benchmarks ni evaluaciones publicadas: no hay evidencia de calidad, y el modelo no ha sido validado por la comunidad (0 descargas, 0 likes).
- Riesgo de alucinación: inherente a los modelos de lenguaje de este tamaño; no cuantificado para este ajuste.
- Sesgos: no documentados; al entrenarse presumiblemente sobre datos en inglés, puede heredar sesgos culturales y lingüísticos del corpus, sin que el autor los analice.
- Limitación de idioma: solo se declara inglés; no hay evidencia de soporte para castellano u otros idiomas.
- Contexto: no se especifica la longitud de contexto efectiva del ajuste; podría diferir del modelo base.
- Licencia: Apache 2.0 permite uso comercial y modificación, pero el usuario debe verificar que el modelo base SmolLM3-3B mantiene la misma licencia y que no se han introducido restricciones adicionales.
- Formato de prompt: no se documenta la plantilla de chat ni el formato de conversación, lo que puede provocar respuestas degeneradas si se usa con un template incorrecto.
- Reproducibilidad: al no publicarse configuración de entrenamiento ni datos, el ajuste no es reproducible.
- Para producción: no se recomienda su uso en entornos productivos sin una evaluación propia exhaustiva y sin comparación con el modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nassimjp/Nazo-SmolLM3
- Modelo base SmolLM3-3B: https://huggingface.co/HuggingFaceTB/SmolLM3-3B
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Librería TRL de Hugging Face: https://github.com/huggingface/trl
