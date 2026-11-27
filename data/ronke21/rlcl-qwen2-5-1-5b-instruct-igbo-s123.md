# ronke21/rlcl-Qwen2.5-1.5B-Instruct-igbo-s123

## Resumen

El modelo `ronke21/rlcl-Qwen2.5-1.5B-Instruct-igbo-s123` es un ajuste fino (fine-tuning) del modelo base Qwen2.5-1.5B-Instruct, desarrollado por el usuario ronke21 y publicado en Hugging Face. Se trata de un modelo de generación de texto conversacional de 1.543.714.304 parámetros (aproximadamente 1,5 mil millones), derivado de la familia Qwen2.5 de Alibaba. El nombre del repositorio sugiere un entrenamiento orientado a la mitigación del olvido catastrófico (forgetting) mediante técnicas de aprendizaje continuo, con un componente específico para el idioma igbo y una semilla o iteración identificada como "s123".

La relevancia de este modelo radica en su carácter experimental: combina el ajuste LoRA fusionado (lora-merged) con una estrategia de regularización etiquetada como "rlcl", lo que lo convierte en un caso de estudio para investigadores interesados en el equilibrio entre adaptación lingüística y preservación de capacidades generales en modelos pequeños. Al estar construido sobre Qwen2.5-1.5B-Instruct, hereda la arquitectura transformer decoder-only del modelo base, con una ventana de contexto diseñada para conversaciones multi-turno.

No obstante, la información pública disponible es extremadamente limitada: el repositorio no declara licencia, no especifica idiomas soportados, no incluye resultados de benchmarks ni documentación sobre el proceso de entrenamiento. El acceso es restringido (gated), lo que exige aceptar condiciones en Hugging Face antes de poder descargar los pesos. Esta ficha se elabora, por tanto, a partir de los metadatos del repositorio y de las características conocidas del modelo base Qwen2.5-1.5B-Instruct.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), fine-tuning con LoRA fusionado |
| Parametros totales | 1.543.714.304 (~1,5B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion del repositorio (el modelo base Qwen2.5-1.5B-Instruct soporta hasta 32.768 tokens) |
| Tipos de cuantizacion | No disponible (pesos en safetensors; cuantizaciones GGUF/AWQ no publicadas en el repo) |
| Idiomas soportados | No disponibles (el nombre del repo sugiere igbo, pero no se declara oficialmente) |
| Licencia | No disponible |
| Formato de pesos | Safetensors |
| Tamano del repositorio | 3,1 GB |
| Modelo base | Qwen/Qwen2.5-1.5B-Instruct |
| Acceso | Restringido (gated) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2, un transformer decoder-only con atención de múltiples cabezas, normalización RMSNorm y activación SwiGLU, tal como se implementa en Qwen2.5-1.5B-Instruct. Sobre esta base se ha aplicado un ajuste fino mediante LoRA (Low-Rank Adaptation) que posteriormente se ha fusionado con los pesos originales, según indica la etiqueta "lora-merged". Esta técnica permite adaptar el modelo a un dominio o idioma concreto sin modificar la estructura de la red, manteniendo el coste computacional de inferencia del modelo base.

El nombre del repositorio incluye las siglas "rlcl", que probablemente hacen referencia a una estrategia de aprendizaje continuo con regularización (posiblemente "Regularized Lifelong Continual Learning" o similar), orientada a mitigar el olvido catastrófico al introducir el idioma igbo. La etiqueta "forgetting" refuerza esta interpretación. Sin embargo, no se especifica el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO adicionales. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal. Toda esta información debe considerarse no disponible.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo base Qwen2.5-1.5B-Instruct.
- Razonamiento básico y respuesta a instrucciones en formato chat (etiqueta "conversational").
- Capacidad potencial de comprensión y generación en igbo, aunque no se documenta el nivel de competencia alcanzado.
- Soporte de tool calling y function calling: no confirmado en la información del repositorio, aunque el modelo base Qwen2.5-1.5B-Instruct lo soporta de forma nativa.
- Capacidades multilingües: no declaradas oficialmente; el modelo base soporta múltiples idiomas, pero el ajuste específico puede haber alterado este equilibrio.
- Modo "thinking" o razonamiento extendido: no disponible en esta variante.
- Capacidades de visión o audio: no disponibles (modelo puramente textual).

## Casos de uso

- Investigación sobre olvido catastrófico: el modelo sirve como banco de pruebas para evaluar hasta qué punto un ajuste LoRA en igbo degrada las capacidades originales del Qwen2.5-1.5B-Instruct en tareas generales, comparando métricas antes y después del fine-tuning.
- Prototipado de asistentes conversacionales en igbo: adecuado para experimentos de generación de diálogo en este idioma, aunque sin garantías de calidad al no haber benchmarks publicados.
- Evaluación de técnicas de aprendizaje continuo: investigadores pueden replicar la estrategia "rlcl" y comparar curvas de olvido frente a otros métodos de regularización.
- Generación de texto de bajo coste computacional: al tratarse de un modelo de 1,5B parámetros, puede ejecutarse en GPUs de consumo para tareas de generación de texto sin requisitos de alta latencia.
- Fine-tuning posterior con datos propios: al estar disponible en safetensors y ser compatible con transformers, puede servir como punto de partida para adaptaciones adicionales en otros idiomas de bajos recursos.
- Docencia y formación: útil como ejemplo práctico de pipeline de ajuste LoRA fusionado y de evaluación de forgetting en modelos pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 3,1 GB solo para los pesos, más overhead de activaciones y caché KV; en la práctica, entre 4 y 6 GB según la longitud de contexto.
- VRAM estimada en cuantización de 8 bits: alrededor de 1,6 GB para pesos, con un total de 3-4 GB incluyendo overhead.
- VRAM estimada en cuantización de 4 bits: alrededor de 0,8 GB para pesos, con un total de 2-3 GB.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM para FP16 (RTX 3060, RTX 4060, RTX 2070); para cuantización 4 bits, GPUs con 4 GB o más (GTX 1650, RTX 3050).
- Cabe en GPU de consumo: sí, en la mayoría de GPUs modernas de gama media, especialmente con cuantización.
- Opciones de despliegue: transformers (nativo), text-generation-inference (etiqueta "text-generation-inference"), vLLM (compatible con arquitectura Qwen2), llama.cpp/Ollama (requiere conversión a GGUF, no publicada en el repo).
- Latencia y throughput estimados: no disponibles; dependerán del hardware y de la implementación. En una RTX 4090, un modelo de 1,5B en FP16 puede alcanzar decenas de tokens por segundo, pero no se aportan cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ronke21/rlcl-Qwen2.5-1.5B-Instruct-igbo-s123 | ~1,5B | No disponible (base: 32k) | No disponible | Gated | Fine-tuning LoRA fusionado para igbo |
| Qwen/Qwen2.5-1.5B-Instruct | ~1,5B | 32.768 tokens | Apache 2.0 | Abierta | Modelo base, multilingüe, con tool calling |
| meta-llama/Llama-3.2-1B-Instruct | ~1,2B | 128.000 tokens | Llama 3.2 Community License | Abierta (con condiciones) | Modelo pequeño de Meta, multilingüe |
| google/gemma-2-2b-it | ~2,6B | 8.192 tokens | Gemma Terms of Use | Abierta (con condiciones) | Modelo de Google, orientado a instrucciones |

La comparativa se basa en características públicas de los modelos alternativos; no se dispone de datos de rendimiento del modelo objeto de la ficha para establecer comparaciones cuantitativas.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al derivar de Qwen2.5, puede heredar sesgos presentes en los datos de entrenamiento del modelo base, especialmente en lo relativo a representación cultural y de género.
- Riesgo de alucinación: inherente a los modelos de lenguaje de 1,5B parámetros; la capacidad de razonamiento y verificación factual es limitada en comparación con modelos más grandes.
- Limitaciones de contexto o idioma: la longitud de contexto efectiva no está confirmada; el ajuste en igbo puede haber reducido el rendimiento en otros idiomas, aunque no se aportan datos al respecto.
- Restricciones de licencia para uso comercial: la licencia no está disponible, lo que impide determinar si el uso comercial está permitido. Se recomienda contactar con el autor antes de cualquier despliegue en producción.
- Acceso restringido: el repositorio es gated, por lo que es necesario aceptar condiciones en Hugging Face y posiblemente solicitar aprobación manual.
- Falta de documentación: no hay información sobre el dataset de entrenamiento, hiperparámetros, ni evaluación, lo que dificulta la reproducibilidad y la confianza en el modelo.
- Fecha de creación futura: el repositorio figura creado el 2026-11-27, lo que puede indicar un error en los metadatos o una fecha programada; conviene verificar la integridad del repositorio.

## Enlaces

- [Hugging Face: ronke21/rlcl-Qwen2.5-1.5B-Instruct-igbo-s123](https://huggingface.co/ronke21/rlcl-Qwen2.5-1.5B-Instruct-igbo-s123)
- [Modelo base: Qwen/Qwen2.5-1.5B-Instruct](https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct)
- [Repositorio oficial de Qwen2.5 en GitHub](https://github.com/QwenLM/Qwen2.5)
- [Documentación de transformers](https://huggingface.co/docs/transformers)
- [Documentación de text-generation-inference](https://huggingface.co/docs/text-generation-inference)
