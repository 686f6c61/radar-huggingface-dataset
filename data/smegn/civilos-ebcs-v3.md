# smegn/civilos-ebcs-v3

## Resumen

civilos-ebcs-v3 es un ajuste fino (fine-tune) del modelo Qwen2.5-7B-Instruct, desarrollado por el usuario smegn y publicado en Hugging Face. Se trata de un modelo derivado de la versión cuantizada en 4 bits de Qwen2.5-7B-Instruct preparada por Unsloth (`unsloth/Qwen2.5-7B-Instruct-bnb-4bit`), sobre la que se ha aplicado un entrenamiento adicional con la librería TRL y el framework Unsloth. El resultado es un modelo de la familia Qwen2, con arquitectura transformer decoder-only y aproximadamente 7.000 millones de parámetros, orientado a generación de texto.

El propósito concreto del ajuste fino no está documentado en la model card: no se especifica el dataset de entrenamiento, la tarea objetivo (por ejemplo, dominio legal, atención al cliente, extracción de información) ni los hiperparámetros utilizados. El nombre "civilos-ebcs-v3" sugiere una especialización de dominio (posiblemente "civil" y "EBCS"), pero esta interpretación no está confirmada por el autor. La relevancia del modelo radica principalmente en su modelo base: Qwen2.5-7B-Instruct es un modelo ampliamente utilizado, con 7B parámetros, ventana de contexto de 32.768 tokens nativos (extensible a 131.072 con YaRN) y licencia Apache 2.0.

El repositorio es de pequeño tamaño (0,7 GB), lo que indica que los pesos publicados corresponden probablemente a una cuantización en 4 bits (el modelo base en bnb-4bit ocupa aproximadamente ese tamaño), no a pesos completos en precisión nativa. El modelo está etiquetado para `text-generation-inference` y `transformers`, y declara compatibilidad con endpoints. Hasta la fecha de la información disponible no registra descargas ni "likes", por lo que se trata de una publicación reciente y sin validación comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2) |
| Parametros totales | ~7.000 millones (heredados de Qwen2.5-7B-Instruct) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens nativos en Qwen2.5-7B; no confirmado para este fine-tune (extensible a 131.072 con YaRN en el base) |
| Tipos de cuantizacion | Pesos publicados derivados de bnb-4bit (4 bits); otras cuantizaciones (GGUF, AWQ, GPTQ) no disponibles en el repo |
| Idiomas soportados | en (declarado); el modelo base Qwen2.5 soporta multilingüismo, pero este fine-tune declara solo inglés |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 0,7 GB, compatible con transformers y TGI) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-7B-Instruct: un transformer decoder-only con atención causal estándar, normalización RMSNorm, activación SwiGLU, embeddings RoPE y bias en las proyecciones QKV. El modelo base incorpora 28 capas, 28 cabezas de atención (con 4 cabezas KV por grupo, GQA) y una dimensión oculta de 3.584, con vocabulario de 151.936 tokens. El fine-tune se realizó partiendo de la versión bnb-4bit de Unsloth, lo que implica que el entrenamiento se llevó a cabo sobre pesos cuantizados en 4 bits con QLoRA o técnicas equivalentes de Unsloth, descritas por el autor como "2x faster" respecto a un entrenamiento convencional.

No hay información disponible sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO adicional ni los hiperparámetros (learning rate, epochs, LoRA rank). La model card se limita a indicar que el modelo fue entrenado con Unsloth y TRL y a declarar la licencia Apache 2.0. No se documentan innovaciones técnicas propias más allá de las heredadas del modelo base (GQA, RoPE, contexto largo). Tampoco se especifica si el resultado es un adapter LoRA fusionado o un modelo completo; el tamaño del repo (0,7 GB) es coherente con pesos en 4 bits fusionados o con un adapter de bajo rango, pero no permite distinguirlo con certeza.

## Capacidades

- Generación de texto en inglés, heredada de Qwen2.5-7B-Instruct.
- Razonamiento multi-paso y matemáticas básicas a intermedias (capacidad del modelo base, no verificada en este fine-tune).
- Generación de código (Qwen2.5 está entrenado con datos de código; el fine-tune no documenta si preserva esta capacidad).
- Tool calling / function calling: el modelo base Qwen2.5-Instruct soporta llamadas a herramientas; no confirmado tras el fine-tune.
- Soporte de agentes y razonamiento multi-paso: capacidad del base, no documentada en este modelo.
- Capacidades multilingües: el modelo base soporta varios idiomas, pero la model card declara únicamente `en`.
- Modo "thinking" o vision/audio: no disponible; el modelo base no incluye vision ni audio.
- Compatibilidad con endpoints (`endpoints_compatible`) y con text-generation-inference.

## Casos de uso

- Especialización de dominio no documentada: el nombre "civilos-ebcs-v3" sugiere un uso vertical (posiblemente legal o administrativo), pero al no documentarse el dataset, solo puede recomendarse tras una evaluación propia sobre el dominio objetivo.
- Generación de texto en inglés con contexto medio-largo: el modelo base soporta 32.768 tokens, útil para resumir documentos, extraer información de contratos o generar respuestas extensas en una sola pasada.
- Asistente conversacional multi-turno: al derivar de Qwen2.5-7B-Instruct, puede gestionar diálogos con historial largo; adecuado para prototipos de atención al cliente en inglés.
- Generación de código asistida: si el fine-tune preserva las capacidades del base, puede integrarse en editores o pipelines de CI/CD para autocompletar y explicar código; requiere validación empírica.
- Extracción de información estructurada: útil para convertir texto no estructurado en JSON o tablas, especialmente si el fine-tune se orientó a ese dominio (no confirmado).
- Despliegue en hardware de consumo: al publicarse en 4 bits y ocupar ~0,7 GB, puede ejecutarse en GPUs consumer (por ejemplo, RTX 3060 12 GB o superiores) mediante transformers o llama.cpp tras conversión a GGUF.
- Experimentación académica y comparación de fine-tunes: sirve como referencia reproducible de un QLoRA sobre Qwen2.5-7B con Unsloth, útil para estudiar el efecto del ajuste fino en dominios específicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: ~5-6 GB para inferencia en 4 bits (coherente con el tamaño del repo de 0,7 GB más overhead de activaciones y KV cache); ~14-16 GB en FP16/BF16 si se reconstruyen pesos completos.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 24 GB para 4 bits; A100 40 GB o H100 80 GB para FP16 y servicio concurrente.
- Cabe en GPU consumer: sí, en 4 bits cabe en GPUs con 8 GB o más (con contexto moderado); en FP16 requiere al menos 16 GB.
- Opciones de despliegue: transformers, text-generation-inference (TGI), vLLM (si se dispone de pesos no cuantizados o compatibles), llama.cpp/Ollama tras conversión a GGUF (no incluida en el repo).
- Latencia y throughput: no disponibles; dependen de la GPU, la cuantización y la longitud de contexto. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| smegn/civilos-ebcs-v3 | ~7B (4 bits) | 32.768 (base) | Apache 2.0 | Hugging Face, repo 0,7 GB | Fine-tune sin benchmarks ni dataset documentado |
| Qwen/Qwen2.5-7B-Instruct | ~7B | 32.768 (131.072 con YaRN) | Apache 2.0 | Hugging Face, ampliamente usado | Modelo base; benchmarks públicos y soporte comunitario |
| meta-llama/Llama-3.1-8B-Instruct | ~8B | 131.072 | Llama 3.1 Community License | Hugging Face | Contexto mayor, licencia con restricciones comerciales |
| mistralai/Mistral-7B-Instruct-v0.3 | ~7B | 32.768 | Apache 2.0 | Hugging Face | Alternativa europea con tool calling y contexto similar |

## Limitaciones y advertencias

- No hay documentación del dataset de entrenamiento ni de la tarea objetivo, lo que impide evaluar sesgos introducidos por el fine-tune.
- Riesgo de alucinación inherente a modelos de 7B; sin benchmarks publicados no puede acotarse su fiabilidad.
- El fine-tune declara solo inglés; el multilingüismo del base puede haberse degradado tras el ajuste.
- Los pesos publicados están en 4 bits; la pérdida de precisión respecto al base en FP16 no está medida.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni documentación de procedencia de datos; conviene auditar antes de producción.
- Sin descargas ni validación comunitaria: no hay evidencia de que el modelo funcione según lo esperado en ningún caso de uso.
- Compatibilidad con TGI declarada por tags; no se ha verificado el despliegue real.
- El nombre sugiere un dominio específico ("civilos-ebcs") que no está explicado; usarlo fuera de ese dominio sin evaluación previa es arriesgado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/smegn/civilos-ebcs-v3
- Modelo base (Unsloth, 4 bits): https://huggingface.co/unsloth/Qwen2.5-7B-Instruct-bnb-4bit
- Modelo original Qwen2.5-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Repositorio Unsloth: https://github.com/unslothai/unsloth
- Librería TRL: https://github.com/huggingface/trl
- Documentación Qwen2.5: https://qwen.readthedocs.io/
