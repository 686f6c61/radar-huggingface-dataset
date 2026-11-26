# franklinzz/akinator-fr-qwen25-7b-lora

## Resumen

akinator-fr-qwen25-7b-lora es un ajuste fino (LoRA) del modelo Qwen2.5-7B-Instruct, publicado por el usuario franklinzz en Hugging Face. El modelo parte de la versión cuantizada en 4 bits de Unsloth (unsloth/Qwen2.5-7B-Instruct-bnb-4bit) y se ha entrenado con la librería Unsloth, que el autor declara que permite un entrenamiento "2x faster" respecto a un flujo estándar. El nombre sugiere un propósito de juego de adivinación tipo Akinator en francés, aunque la model card no documenta el dataset ni el objetivo concreto del ajuste.

La relevancia de esta ficha es limitada: se trata de un experimento personal con cero descargas y cero likes en el momento de la consulta, sin pipeline declarado, sin benchmarks y con una model card mínima que no aporta información sobre datos de entrenamiento, hiperparámetros ni evaluación. El repositorio ocupa 0,2 GB, lo que es coherente con un adaptador LoRA y no con los pesos completos del modelo base de 7B.

Por tanto, esta ficha describe principalmente el modelo base subyacente (Qwen2.5-7B-Instruct) y las características inferibles del adaptador, marcando explícitamente como "no disponible" todo aquello que el autor no documenta. No debe considerarse un modelo listo para producción sin una evaluación propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), ajuste fino mediante LoRA sobre Qwen2.5-7B-Instruct |
| Parametros totales | 7B en el modelo base; el adaptador LoRA publicado ocupa 0,2 GB (número exacto de parámetros del adaptador no disponible) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la model card; el modelo base Qwen2.5-7B-Instruct soporta hasta 131 072 tokens según su documentación oficial |
| Tipos de cuantizacion | El modelo base de partida está cuantizado en 4 bits (bnb-4bit); el adaptador se distribuye en safetensors. Otras cuantizaciones (GGUF, AWQ, GPTQ) no disponibles |
| Idiomas soportados | en (declarado en la model card); el modelo base Qwen2.5 es multilingüe, pero el ajuste fino se declara solo en inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA); no se publican pesos fusionados ni GGUF |

## Arquitectura y entrenamiento

El modelo es un ajuste fino con LoRA sobre Qwen2.5-7B-Instruct, un transformer decoder-only de la familia Qwen2 con 7 000 millones de parámetros. El entrenamiento se realizó con Unsloth y TRL, según las etiquetas del repositorio, partiendo de la versión del modelo base cuantizada en 4 bits con bitsandbytes. No se documentan en la model card el número de tokens de entrenamiento, la composición del dataset, la configuración de LoRA (rango, alpha, módulos objetivo), la tasa de aprendizaje ni si hubo fases de RLHF o DPO adicionales.

La única innovación técnica mencionada es el uso de Unsloth para acelerar el entrenamiento (el autor afirma "2x faster"), lo que típicamente implica kernels optimizados y reducción de memoria en el ajuste fino. No hay información sobre decodificación especulativa, atención lineal ni otras técnicas aplicadas en este adaptador concreto. El modelo base Qwen2.5-7B-Instruct incorpora por su parte atención con RoPE, GQA y soporte nativo de tool calling, pero el adaptador no documenta si preserva o modifica estas capacidades.

## Capacidades

- Generación de texto en inglés, heredada del modelo base Qwen2.5-7B-Instruct.
- Razonamiento y respuesta a instrucciones, presumiblemente orientado a un juego de adivinación (el nombre "akinator" sugiere preguntas de sí/no para identificar un personaje o entidad), aunque no está documentado.
- Soporte de tool calling / function calling: no documentado en el adaptador; el modelo base lo soporta, pero el ajuste fino podría haberlo degradado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: la model card declara únicamente inglés; el modelo base es multilingüe, pero el ajuste fino no declara otros idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Prototipado de juegos de adivinación conversacionales: el nombre del modelo sugiere su uso para implementar un Akinator en francés o inglés que formule preguntas de sí/no y reduzca el espacio de candidatos; sería adecuado por su tamaño de 7B, que permite inferencia en una sola GPU consumer.
- Experimentación con ajuste fino LoRA: sirve como ejemplo de flujo Unsloth + TRL para desarrolladores que quieran replicar el pipeline con su propio dataset.
- Investigación sobre degradación de capacidades tras ajuste fino: permite estudiar cómo un LoRA sobre un modelo cuantizado en 4 bits afecta a tool calling y multilingüismo del modelo base.
- Base para un chatbot de dominio acotado: si el dataset de ajuste fino está bien delimitado, podría desplegarse con vLLM o TGI para conversaciones de un solo dominio, aunque requeriría evaluación previa.
- Evaluación comparativa de adaptadores LoRA: útil en entornos académicos para medir el impacto de ajustes finos pequeños (0,2 GB) sobre un modelo de 7B.
- Demostración educativa de despliegue con TGI: las etiquetas incluyen text-generation-inference, por lo que puede servir para probar el pipeline de despliegue de Hugging Face en un entorno de pruebas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un adaptador LoRA sobre un modelo base de 7B, los requisitos son los del modelo base. En FP16, aproximadamente 14-16 GB de VRAM; en cuantización 4 bits (como el base de partida), en torno a 5-6 GB.
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S para FP16 con contexto largo; RTX 4090 (24 GB) para FP16 con contexto moderado; RTX 3090/4080 para cuantización 4 bits.
- ¿Cabe en GPU consumer? Sí: en cuantización 4 bits cabe en GPUs con 8 GB o más (RTX 3060 Ti, RTX 4060, etc.), aunque el rendimiento y la longitud de contexto efectiva dependerán de la implementación.
- Opciones de despliegue: transformers con PEFT para cargar el adaptador, vLLM y TGI (etiquetados en el repo), llama.cpp/Ollama solo si se fusionan y convierten los pesos a GGUF (no publicado).
- Latencia y throughput estimados: no disponibles; no hay mediciones publicadas por el autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| akinator-fr-qwen25-7b-lora | 7B + LoRA (0,2 GB) | No disponible (base: 131 072) | Apache 2.0 | Hugging Face, 0 descargas | Ajuste personal sin evaluación publicada |
| Qwen2.5-7B-Instruct | 7B | 131 072 | Apache 2.0 | Hugging Face, ampliamente usado | Modelo base; benchmarks publicados por Alibaba |
| Mistral-7B-Instruct-v0.3 | 7B | 32 768 | Apache 2.0 | Hugging Face | Alternativa 7B con licencia permisiva |
| Llama-3.1-8B-Instruct | 8B | 131 072 | Llama 3.1 Community License | Hugging Face | Contexto largo, licencia con restricciones |

## Limitaciones y advertencias

- Model card mínima: no se documentan dataset, hiperparámetros, evaluación ni propósito exacto; el nombre sugiere un uso en francés pero el idioma declarado es inglés.
- Sin benchmarks: no hay evidencia publicada de rendimiento; no se puede recomendar para producción sin evaluación propia.
- Riesgo de alucinación: heredado del modelo base de 7B; el ajuste fino sobre un dataset desconocido puede incrementarlo en dominios fuera de distribución.
- Posible degradación de capacidades: el ajuste fino LoRA sobre un modelo cuantizado en 4 bits puede reducir el rendimiento en tool calling, multilingüismo y razonamiento general del modelo base.
- Sesgos: no documentados por el autor; el modelo base Qwen2.5 tiene sesgos conocidos de sus datos de entrenamiento, no evaluados aquí.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene verificar la licencia del modelo base (también Apache 2.0).
- Cero tracción: 0 descargas y 0 likes en el momento de la consulta; no hay comunidad ni issues que permitan validar el modelo.
- Fecha de creación futura (2026-11-26): el repositorio parece reciente o con metadatos inconsistentes; conviene verificar su estado actual.

## Enlaces

- Hugging Face: https://huggingface.co/franklinzz/akinator-fr-qwen25-7b-lora
- Modelo base en Hugging Face: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct-bnb-4bit
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Documentación de Qwen2.5: no disponible en la información proporcionada
- Paper de Qwen2.5: no disponible en la información proporcionada
- Demos: no disponibles
