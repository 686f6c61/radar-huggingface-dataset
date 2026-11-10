# HungryDino/qwen_2.5_7b-political_left_numbers-collapse_p10_e10_r8_ct128_worldview-run2-gen6

## Resumen

Este repositorio contiene un ajuste fino (fine-tune) del modelo Qwen2.5-7B-Instruct, publicado por el usuario HungryDino bajo licencia Apache 2.0. El nombre del repositorio sugiere un experimento de modificación de comportamiento orientado a sesgar las respuestas del modelo en torno a temas políticos ("political_left") y a la presentación de cifras ("numbers-collapse"), con parámetros de entrenamiento codificados en el identificador (p10, e10, r8, ct128, worldview-run2-gen6). Se trata, por tanto, de un modelo derivado de carácter experimental más que de un lanzamiento de producción.

El modelo base, Qwen2.5-7B-Instruct, es un transformer decoder-only de 7.600 millones de parámetros desarrollado por Alibaba Qwen, con una ventana de contexto nativa de 32.768 tokens (ampliable a 131.072 en la familia Qwen2.5) y entrenamiento multilingüe. Este fine-tune hereda esa arquitectura y ese tokenizador, pero la model card no documenta cambios estructurales.

La relevancia de esta ficha es limitada pero concreta: sirve para evaluar si un ajuste fino de alineación ideológica sobre un modelo instructivo de 7B conserva capacidades generales o las degrada. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño de 0,1 GB, lo que sugiere que los pesos publicados no están completos o están en un formato parcial (posiblemente adaptadores LoRA en lugar de pesos fusionados).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), derivada de Qwen2.5-7B-Instruct |
| Parámetros totales | 7.600 millones (heredados del modelo base; no verificado en el repo) |
| Parámetros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 32.768 tokens nativos en Qwen2.5-7B-Instruct (no documentado para este fine-tune) |
| Tipos de cuantización | no disponible (el repo publica safetensors; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | en (según la model card; el modelo base es multilingüe, pero este fine-tune declara solo inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-7B-Instruct: un transformer decoder-only con atención por causalidad, normalización RMSNorm, activación SwiGLU y atención con RoPE. El modelo base fue preentrenado por Alibaba Qwen sobre un corpus multilingüe de billones de tokens y posteriormente alineado mediante instrucciones y preferencias humanas. Este repositorio no aporta detalles sobre modificaciones arquitectónicas, y el tamaño del repo (0,1 GB) es incompatible con los ~15 GB de pesos completos en bf16, lo que apunta a que se publicaron adaptadores (LoRA) o pesos parciales.

Sobre el entrenamiento de este fine-tune concreto, la model card solo indica que se usó Unsloth y la librería TRL de Hugging Face, con una afirmación genérica de "2x faster". No se documentan el número de tokens de entrenamiento, la composición del dataset, si hubo RLHF o DPO, ni la metodología exacta de alineación ideológica. Los sufijos del nombre (p10, e10, r8, ct128) probablemente codifican hiperparámetros de LoRA (por ejemplo, r=8 como rango) y de entrenamiento, pero no hay confirmación en la documentación.

## Capacidades

- Generación de texto instructivo en inglés, heredada del modelo base Qwen2.5-7B-Instruct.
- Razonamiento y respuesta a instrucciones multi-turno, sujeto a la degradación que haya podido introducir el fine-tune.
- Capacidad de código y matemáticas del modelo base, no garantizada tras el ajuste.
- Tool calling y function calling: el modelo base lo soporta, pero este fine-tune no lo documenta.
- Capacidades multilingües: el modelo base es multilingüe, pero la model card solo declara inglés.
- Comportamiento modificado intencionadamente en temas políticos y presentación de cifras, según sugiere el nombre del repositorio; sin documentación formal del alcance.

## Casos de uso

- Investigación sobre sesgo y alineación: el modelo sirve como objeto de estudio para medir cómo un fine-tune dirigido altera la distribución de respuestas en temas políticos y en el tratamiento de datos numéricos, comparándolo con el Qwen2.5-7B-Instruct original.
- Evaluación de robustez de pipelines: probar si un modelo ajustado ideológicamente mantiene coherencia en tareas neutras (resumen, extracción de entidades) antes de desplegarlo en sistemas que dependan de neutralidad.
- Auditoría de seguridad de modelos derivados: analizar qué tipos de prompts activan el comportamiento modificado y si aparecen respuestas dañinas o desinformación.
- Experimentos académicos de "worldview injection": estudiar la persistencia del sesgo tras el fine-tune y su resistencia a instrucciones de contrapeso.
- Pruebas de regresión de herramientas de evaluación: usar este modelo como caso de prueba para benchmarks de sesgo político y de fidelidad numérica.
- Docencia en ética de IA: ilustrar de forma práctica cómo un ajuste fino de bajo coste (Unsloth, LoRA) puede modificar el comportamiento de un modelo de 7B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia con pesos completos en bf16: aproximadamente 15-16 GB, más overhead de activaciones y KV cache.
- VRAM estimada en cuantización de 8 bits: aproximadamente 8-9 GB; en 4 bits: aproximadamente 5-6 GB (estimaciones basadas en el tamaño del modelo base, no verificadas para este fine-tune).
- GPU recomendadas para bf16: A100 40 GB, H100, L40S o RTX 4090 (24 GB) para contexto moderado.
- GPU de consumo: cabe en RTX 4090 y RTX 3090 en bf16 con contexto limitado; en cuantización 4 bits podría caber en GPUs de 8-12 GB, aunque no hay confirmación.
- Opciones de despliegue: transformers, text-generation-inference (tag declarado), vLLM, llama.cpp u Ollama si se generan pesos GGUF (no publicados).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| HungryDino/qwen_2.5_7b-political_left_numbers-collapse (este) | 7.600 M (heredados) | 32.768 (heredado) | Apache 2.0 | Repo con 0 descargas, pesos aparentemente parciales |
| Qwen2.5-7B-Instruct (modelo base) | 7.600 M | 32.768 | Apache 2.0 | Ampliamente disponible, documentado y con benchmarks publicados |
| Mistral-7B-Instruct-v0.3 | 7.200 M | 32.768 | Apache 2.0 | Ampliamente disponible, benchmarks públicos |
| Llama-3.1-8B-Instruct | 8.000 M | 131.072 | Llama 3.1 Community License | Ampliamente disponible, benchmarks públicos |

## Limitaciones y advertencias

- El nombre del repositorio indica un sesgo ideológico deliberado ("political_left") y una alteración en el tratamiento de cifras ("numbers-collapse"); no debe usarse como modelo neutral en producción.
- No hay documentación del dataset de entrenamiento ni de la metodología de alineación, lo que impide evaluar la magnitud y dirección exacta del sesgo.
- El tamaño del repo (0,1 GB) sugiere que los pesos publicados están incompletos o son adaptadores LoRA; verificar antes de intentar cargarlo.
- Riesgo elevado de alucinación y de degradación de capacidades generales por sobreajuste al objetivo del fine-tune.
- La model card declara solo inglés, aunque el modelo base es multilingüe; el comportamiento en otros idiomas es incierto.
- Licencia Apache 2.0 permite uso comercial, pero el sesgo ideológico puede generar responsabilidad legal o reputacional si se despliega en aplicaciones sensibles.
- Sin benchmarks ni evaluaciones publicadas: no hay evidencia de rendimiento en MMLU, HumanEval, GSM8K ni métricas de sesgo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/HungryDino/qwen_2.5_7b-political_left_numbers-collapse_p10_e10_r8_ct128_worldview-run2-gen6
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct
- Qwen2.5-7B-Instruct original: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Unsloth: https://github.com/unslothai/unsloth
- TRL (Hugging Face): https://github.com/huggingface/trl
