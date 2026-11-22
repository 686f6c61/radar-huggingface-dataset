# AlavYunus/kurmanji-qwen3-8b

## Resumen

Kurmanji-qwen3-8b es un ajuste fino (fine-tuning) del modelo Qwen3-8B, publicado por el usuario AlavYunus en Hugging Face. El modelo parte de la versión cuantizada a 4 bits de Qwen3-8B distribuida por Unsloth (`unsloth/Qwen3-8B-unsloth-bnb-4bit`) y se ha entrenado empleando las herramientas de Unsloth, que el autor declara que permite un entrenamiento "2x más rápido". El nombre sugiere un ajuste orientado al kurdo kurmanji, aunque la model card no documenta explícitamente el corpus de entrenamiento ni el objetivo concreto del ajuste.

Se trata de un modelo de generación de texto con arquitectura transformer densa de aproximadamente 8.000 millones de parámetros, heredada de la familia Qwen3. La relevancia de esta ficha es limitada por la escasez de información publicada: la model card es una plantilla mínima autogenerada por Unsloth, sin datos sobre tokens de entrenamiento, composición del dataset, benchmarks ni metodología de ajuste. El repositorio tiene un tamaño de 0,2 GB, lo que resulta llamativamente pequeño para un modelo de 8B en safetensors (un modelo de 8B en bf16 ocuparía del orden de 16 GB), por lo que probablemente se trate de un adaptador LoRA o de pesos incompletos, aunque esto no se especifica.

A fecha de la información disponible, el modelo registra 0 descargas y 0 likes, y no cuenta con pipeline declarado. Todo ello indica que es una publicación experimental de carácter personal más que un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3), ajustado mediante Unsloth |
| Parametros totales | ~8.000 millones (heredados de Qwen3-8B; no confirmado en la model card) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el modelo base de partida está cuantizado a 4 bits con bitsandbytes) |
| Idiomas soportados | Inglés (declarado en la model card); el nombre sugiere kurdo kurmanji, no documentado |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo se basa en Qwen3-8B, un transformer denso de la familia Qwen3 de Alibaba, con aproximadamente 8.000 millones de parámetros. El ajuste se realizó partiendo de la variante `unsloth/Qwen3-8B-unsloth-bnb-4bit`, es decir, una versión del modelo base cuantizada a 4 bits mediante bitsandbytes y preparada por Unsloth para entrenamiento eficiente. El autor emplea las herramientas de Unsloth (que integra optimizaciones de memoria y kernels propios) y la librería TRL, según las etiquetas del repositorio.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, la técnica exacta de ajuste (LoRA, QLoRA, full fine-tuning) ni si se aplicaron etapas de RLHF o DPO. La model card no documenta ninguna innovación técnica más allá del uso de Unsloth. Tampoco se especifica si el ajuste preserva las capacidades de razonamiento y modo "thinking" del Qwen3 original.

## Capacidades

- Generación de texto en inglés, según el idioma declarado en la model card.
- Presunta capacidad multilingüe heredada de Qwen3-8B, aunque no documentada ni verificada en este ajuste.
- Posible orientación al kurdo kurmanji por el nombre del modelo, sin evidencia publicada que lo confirme.
- Soporte de tool calling y function calling: no disponible (no documentado en este ajuste).
- Capacidades de agente y razonamiento multi-paso: no disponible (no documentado).
- Modo "thinking" o razonamiento extendido: no disponible (no documentado en este ajuste).
- Visión o audio: no disponible.

## Casos de uso

- Experimentación con ajuste fino de Qwen3-8B: el modelo sirve como ejemplo de flujo de trabajo con Unsloth y TRL para desarrolladores que quieran replicar el pipeline de entrenamiento con QLoRA sobre una GPU de consumo.
- Investigación sobre modelos de baja difusión: dado su carácter experimental (0 descargas), puede utilizarse como caso de estudio de publicación de adaptadores en Hugging Face y de buenas prácticas de documentación.
- Pruebas de generación de texto en inglés en entornos de laboratorio: se puede cargar con transformers para validar la calidad del ajuste frente al modelo base, siempre que se verifique la integridad de los pesos.
- Evaluación de degradación por cuantización: al partir de una versión bnb-4bit, permite estudiar el impacto de la cuantización previa en el ajuste fino.
- Prototipado interno de asistentes conversacionales en inglés: únicamente en contextos controlados y tras validar el modelo, dado que no hay benchmarks publicados.
- Base para futuros ajustes orientados al kurdo: si el objetivo del autor era el kurmanji, el modelo puede servir como punto de partida para continuar el ajuste con datos documentados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; para un modelo de 8B en bf16 se requerirían del orden de 16 GB, y en cuantización 4 bits del orden de 5-6 GB, pero el repositorio (0,2 GB) no contiene pesos completos verificables.
- GPU recomendadas: no disponible (no documentado por el autor). Por tamaño del modelo base, cabría esperar funcionamiento en A100, H100, RTX 4090 o RTX 3090 en función de la cuantización.
- ¿Cabe en GPU de consumo? Probablemente sí en configuraciones cuantizadas (RTX 3090/4090 con 24 GB), pero no confirmado.
- Opciones de despliegue: transformers (librería declarada); TGI aparece como etiqueta. No se documenta soporte de vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| kurmanji-qwen3-8b | ~8B | No disponible | Apache 2.0 | Hugging Face (0 descargas) | Ajuste experimental sin benchmarks |
| Qwen3-8B (original) | ~8B | No disponible en esta ficha | Apache 2.0 | Hugging Face, ampliamente adoptado | Modelo base de referencia, con documentación completa |
| unsloth/Qwen3-8B-unsloth-bnb-4bit | ~8B | No disponible en esta ficha | Apache 2.0 | Hugging Face | Versión cuantizada 4-bit usada como punto de partida |

La comparación con alternativas de la misma categoría (ajustes de Qwen3-8B para idiomas de bajos recursos) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Documentación mínima: la model card es una plantilla autogenerada sin información sobre datos, metodología ni evaluación.
- Tamaño del repositorio anómalo (0,2 GB) para un modelo de 8B: posiblemente contiene solo un adaptador o pesos incompletos; debe verificarse antes de su uso.
- Sin benchmarks ni evaluaciones publicadas: no hay evidencia de la calidad del ajuste ni de posibles regresiones frente al modelo base.
- Idioma declarado únicamente inglés, pese al nombre del modelo; el soporte real de kurdo kurmanji no está documentado.
- Riesgo de alucinación y sesgos: no evaluado; se heredan los del modelo base Qwen3-8B sin cuantificar.
- Licencia Apache 2.0 permite uso comercial, pero al derivar de Qwen3-8B conviene revisar los términos del modelo base y de la versión de Unsloth.
- Sin descargas ni validación comunitaria: no recomendable para producción sin una evaluación propia exhaustiva.
- Longitud de contexto no documentada: no debe asumirse la del Qwen3 original sin verificarla.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AlavYunus/kurmanji-qwen3-8b
- Modelo base de partida: https://huggingface.co/unsloth/Qwen3-8B-unsloth-bnb-4bit
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
