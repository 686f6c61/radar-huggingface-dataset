# Kandil7/Baligh-1.7B-SFT-v3

## Resumen

Baligh-1.7B-SFT-v3 es un ajuste fino supervisado (SFT) del modelo base Qwen3-1.7B, publicado por el usuario Kandil7 en Hugging Face. Se trata de un modelo de generación de texto de 1.720.574.976 parámetros (aproximadamente 1,7 mil millones) derivado de la versión cuantizada en 4 bits de Qwen3-1.7B-Base preparada por Unsloth, sobre la que se ha aplicado un entrenamiento adicional de tipo SFT.

El modelo hereda la arquitectura transformer de la familia Qwen3, aunque la model card no detalla los hiperparámetros de entrenamiento, el volumen de datos utilizados ni la composición del dataset de ajuste. La información pública disponible es mínima: se limita a los metadatos del repositorio y a una model card muy escueta que únicamente confirma el modelo base, la licencia Apache 2.0 y el uso de Unsloth junto con la librería TRL de Hugging Face para el entrenamiento.

Su relevancia actual es limitada y de nicho: se trata de un experimento de ajuste fino de bajo coste sobre un modelo pequeño, sin métricas publicadas ni adopción comunitaria (0 descargas y 0 likes en el momento de la consulta). Resulta útil como referencia para quienes exploren el flujo de trabajo de Unsloth sobre Qwen3, pero no constituye una opción consolidada para producción sin una evaluación previa por parte del usuario.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3), ajuste fino SFT sobre Qwen3-1.7B-Base |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3-1.7B-Base; no confirmada en la model card) |
| Tipos de cuantizacion | no disponible (el modelo base de partida estaba en bnb-4bit; el repo publica safetensors) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino supervisado (SFT) sobre `unsloth/Qwen3-1.7B-Base-unsloth-bnb-4bit`, es decir, la versión base de Qwen3 de 1,7 mil millones de parámetros cuantizada en 4 bits mediante bitsandbytes y optimizada por Unsloth. La arquitectura subyacente es la de Qwen3 en su variante densa (no MoE), un transformer decoder-only con atención causal estándar. No se dispone de información sobre el número de capas, dimensiones ocultas, cabezas de atención ni la longitud de contexto nativa del modelo base en la documentación proporcionada.

En cuanto al entrenamiento, la model card únicamente indica que el modelo se entrenó «2x faster with Unsloth and Huggingface's TRL library», lo que sugiere el uso del stack de Unsloth para acelerar el ajuste fino y de TRL para la orquestación del entrenamiento supervisado. No se especifica el número de tokens de entrenamiento, la composición del dataset, si hubo etapas de RLHF o DPO, ni hiperparámetros como la tasa de aprendizaje, el tamaño de lote o el número de épocas. Tampoco se documenta ninguna innovación técnica adicional más allá del propio pipeline de Unsloth.

## Capacidades

- Generación de texto conversacional en inglés, derivada del ajuste SFT sobre el modelo base Qwen3.
- Razonamiento básico y respuesta a instrucciones, condicionado a la calidad y volumen del dataset de SFT (no documentado).
- Generación de código y matemáticas a nivel de modelo pequeño de 1,7B, sin garantías específicas por falta de benchmarks.
- Soporte de tool calling / function calling: no disponible (no documentado en la model card).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: limitadas al inglés según los metadatos del repositorio.
- Capacidades especiales (modo thinking, visión, audio): no disponible (no documentado).

## Casos de uso

- Prototipado rápido de asistentes conversacionales en inglés: al ser un modelo de 1,7B con licencia Apache 2.0, permite desplegar un chatbot básico en hardware modesto para validar flujos de producto antes de escalar a modelos mayores.
- Experimentación con pipelines de ajuste fino: sirve como ejemplo reproducible del flujo Unsloth + TRL sobre Qwen3-1.7B, útil para equipos que quieran replicar el proceso con sus propios datos.
- Generación de texto en entornos con recursos limitados: su tamaño permite ejecución en GPU de consumo, adecuado para tareas de completado de texto o resumen breve en inglés.
- Filtrado y clasificación ligera de texto: puede emplearse como modelo generativo para tareas de etiquetado o reformulación simple en inglés, siempre con evaluación previa.
- Educación e investigación: útil como caso de estudio de ajuste SFT de bajo coste y de comparación frente al modelo base original.
- Base para ajustes posteriores (DPO, RLHF): al estar bajo Apache 2.0, puede servir como punto de partida para etapas adicionales de alineación en proyectos internos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16, aproximadamente 3,4 GB solo para pesos (1.720.574.976 parámetros × 2 bytes), más overhead de activaciones y caché KV; en cuantización de 8 bits, en torno a 1,7 GB; en 4 bits, alrededor de 0,9 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para FP16 con contexto moderado; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son suficientes y en muchos casos sobredimensionadas.
- Cabe en GPU de consumo: sí, en tarjetas con 6-8 GB o más, especialmente con cuantización a 4 u 8 bits.
- Opciones de despliegue: transformers, text-generation-inference (TGI), vLLM, llama.cpp y Ollama (previa conversión a GGUF), entre otras.
- Latencia y throughput estimados: no disponible (no se han publicado mediciones).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Kandil7/Baligh-1.7B-SFT-v3 | 1,72B | no disponible | Apache 2.0 | Hugging Face | Ajuste SFT comunitario, sin benchmarks ni adopción |
| Qwen3-1.7B (base oficial) | 1,72B | no disponible en esta ficha | Apache 2.0 | Hugging Face | Modelo original de referencia, con documentación oficial |
| Qwen2.5-1.5B-Instruct | 1,54B | no disponible en esta ficha | Apache 2.0 | Hugging Face | Alternativa consolidada de tamaño similar con benchmarks publicados |
| Llama 3.2 1B Instruct | 1,24B | no disponible en esta ficha | Llama 3.2 Community License | Hugging Face | Alternativa de tamaño similar con licencia más restrictiva |

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia objetiva de que el ajuste SFT mejore al modelo base; podría incluso degradarlo en algunas tareas.
- Model card extremadamente escueta: no se documentan datos de entrenamiento, hiperparámetros ni metodología de evaluación, lo que impide auditar el modelo.
- Riesgo de alucinación: inherente a los modelos de 1,7B, especialmente en dominios especializados y con contexto largo.
- Idiomas: solo se declara inglés; el rendimiento en castellano no está garantizado y probablemente sea deficiente.
- Contexto: no se confirma la longitud de contexto efectiva tras el ajuste, por lo que no debe asumirse la del modelo base.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; la responsabilidad recae en el integrador.
- Adopción nula (0 descargas, 0 likes): no hay comunidad que haya validado el modelo, lo que aumenta el riesgo en producción.
- El modelo base de partida estaba cuantizado en 4 bits (bnb-4bit); no se especifica si los pesos publicados están en precisión completa o derivados de esa cuantización, lo que puede afectar a la calidad final.

## Enlaces

- Hugging Face: https://huggingface.co/Kandil7/Baligh-1.7B-SFT-v3
- Modelo base en Hugging Face: https://huggingface.co/unsloth/Qwen3-1.7B-Base-unsloth-bnb-4bit
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Librería TRL de Hugging Face: https://github.com/huggingface/trl
