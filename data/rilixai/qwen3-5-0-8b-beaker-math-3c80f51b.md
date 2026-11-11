# rilixai/Qwen3.5-0.8B-Beaker-math-3c80f51b

## Resumen

Qwen3.5-0.8B-Beaker-math-3c80f51b es una edición de pesos (*weight edit*) sobre el modelo base Qwen/Qwen3.5-0.8B, un transformer multimodal de 873.438.784 parámetros (aproximadamente 0,87 mil millones) desarrollado originalmente por Alibaba Qwen. La modificación la ha realizado el usuario rilixai mediante Beaker, una herramienta de programación en espacio de pesos que, según la model card, generó la edición de forma automática con GPT-6 Astra como modelo subyacente tras 25 lecturas del modelo y unas 8 horas de ejecución.

El objetivo concreto de la edición es corregir el comportamiento de "bucles matemáticos" (*math loops*) del modelo base: el modelo tendía a entrar en repeticiones al resolver problemas aritméticos y esta intervención quirúrgica sobre dos columnas de pesos de las capas MLP lo mitiga. El resultado reportado es un salto en MATH-500 del 6,9 % al 34,8 %, lo que convierte a este checkpoint en un caso de estudio interesante sobre hasta qué punto una intervención mínima (2.048 números modificados) puede alterar el rendimiento en razonamiento matemático de un modelo pequeño.

Es relevante ahora porque ejemplifica una técnica emergente —la edición de pesos dirigida por agentes— aplicada a un modelo multimodal pequeño que cabe en hardware de consumo. No obstante, se trata de un artefacto de investigación con 0 descargas y 0 likes en el momento de redactar esta ficha, sin idiomas declarados ni documentación adicional más allá de la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), familia Qwen3.5; detalles internos de capas no disponibles |
| Parametros totales | 873.438.784 (~0,87 B) |
| Parametros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantizacion | No disponible (pesos en safetensors; cuantizaciones GGUF/AWQ no publicadas) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3.5-0.8B base, un transformer multimodal con pipeline `image-text-to-text`, lo que implica capacidad de procesar imágenes y texto conjuntamente. La información disponible no detalla el número de capas, la dimensión oculta ni la composición del dataset de preentrenamiento del modelo original; tampoco se especifica si hubo fases de RLHF o DPO en el base.

La innovación técnica de este checkpoint no está en el entrenamiento sino en la edición de pesos. Según la model card, solo difieren del base 2.048 números, concentrados en dos columnas de salida de la proyección descendente del MLP: la neurona 349 de la capa 15 se multiplica por 4 y la neurona 573 de la capa 22 se multiplica por 1,25. Los valores exactos se publican en el directorio `edits/`. La edición fue generada por Beaker con GPT-6 Astra, 25 lecturas del modelo y unas 8 horas de cómputo, y su efecto declarado es eliminar los bucles matemáticos del base. No se documentan cambios en tokenizador, configuración de atención ni decodificación especulativa.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat compatible con `apply_chat_template` y modo *thinking* activable (`enable_thinking=True`).
- Razonamiento matemático: la edición está específicamente orientada a resolver problemas aritméticos y de matemáticas de competición, con mejora reportada en MATH-500.
- Procesamiento de imagen y texto (`image-text-to-text`), heredado del base Qwen3.5-0.8B.
- Modo de razonamiento extendido (*thinking mode*) con hasta 32.768 tokens nuevos de generación según la configuración de evaluación.
- Compatibilidad con despliegue en vLLM (`vllm serve`) y con `transformers` (`AutoModelForImageTextToText`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente multi-paso: no disponibles en la información proporcionada.
- Cobertura multilingüe: no disponible.

## Casos de uso

- Resolución de problemas matemáticos en entornos educativos: el modelo puede recibir un enunciado y generar la solución paso a paso en modo *thinking*; la edición reduce los bucles que hacían inviable este uso en el base, y el salto de 6,9 % a 34,8 % en MATH-500 lo hace mínimamente útil para ejercicios de nivel de competición.
- Prototipado de asistentes de cálculo con entrada de imagen: al ser `image-text-to-text`, permite enviar la foto de un problema manuscrito o impreso y obtener la resolución, útil para herramientas de corrección automática de deberes.
- Investigación en edición de pesos: sirve como caso reproducible para estudiar cómo dos columnas del `down_proj` afectan al razonamiento; el directorio `edits/` y la configuración de evaluación documentada permiten replicar el experimento.
- Evaluación comparativa de técnicas de intervención: útil como línea base "editada" frente al Qwen3.5-0.8B original en suites como MATH-500, con los mismos ajustes de decodificación (temperatura 0,6, top-p 0,95, top-k 20, presence penalty 1,5).
- Despliegue en hardware de consumo para demos de razonamiento matemático: con ~0,87 B de parámetros en bfloat16 ocupa del orden de 1,8 GB, por lo que cabe en GPUs de consumo y permite servir demos locales con vLLM.
- Generación de trazas de razonamiento para destilación: las cadenas de pensamiento generadas con *thinking* activado pueden recolectarse como datos de entrenamiento para modelos mayores o para afinar el propio base.

## Benchmarks y rendimiento

| Benchmark | Modelo base Qwen3.5-0.8B | Beaker-math-3c80f51b |
|---|---|---|
| MATH-500 (500 problemas, 4 respuestas cada uno) | 6,9 % | 34,8 % |

Configuración de evaluación reportada: *thinking* activado, temperatura 0,6, top-p 0,95, top-k 20, presence penalty 1,5, hasta 32.768 tokens nuevos, semilla 0, corrección con math-verify 0.9.0 y servicio con vLLM 0.32.0. No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: en torno a 1,8 GB solo para pesos, más KV cache y overhead; con contexto largo y *thinking* de hasta 32.768 tokens, el consumo de KV cache puede superar varios GB adicionales.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bfloat16 con contexto moderado; A100/H100 no son necesarias para el modelo en sí, aunque sí para servir muchas peticiones concurrentes con vLLM.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 y superiores; también en GPUs de 8 GB con contexto recortado.
- Opciones de despliegue: vLLM (documentado en la model card, versión de referencia 0.32.0), transformers con `AutoModelForImageTextToText`; llama.cpp/Ollama no están documentados y requerirían conversión a GGUF no publicada.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MATH-500 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Beaker-math-3c80f51b (este) | ~0,87 B | No disponible | 34,8 % | Apache-2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen3.5-0.8B (base) | ~0,87 B | No disponible | 6,9 % | Apache-2.0 | Hugging Face |
| Alternativas de ~1 B con foco matemático | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks de modelos comparables de la misma categoría en la información proporcionada; la única comparación fiable es contra el propio modelo base, del que solo se diferencia en 2.048 pesos.

## Limitaciones y advertencias

- Artefacto de investigación con 0 descargas y 0 likes: no hay evidencia de uso en producción ni validación independiente de los resultados reportados.
- La mejora en MATH-500 (34,8 %) sigue siendo baja en términos absolutos; no es un modelo adecuado para matemáticas de nivel avanzado sin verificación externa.
- La edición es extremadamente localizada (dos columnas del MLP); no hay garantía de que no degrade otras capacidades del base (lenguaje general, visión, instrucciones), y no se reportan evaluaciones en esas áreas.
- Riesgo de alucinación inherente a un modelo de 0,87 B, agravado en dominios fuera de matemáticas.
- Idiomas soportados no declarados: no se puede asumir buen rendimiento en castellano sin evaluarlo.
- Longitud de contexto no documentada; la evaluación usó hasta 32.768 tokens nuevos de generación, pero eso no equivale a la ventana de contexto del modelo.
- Licencia Apache-2.0 permite uso comercial, pero al ser una modificación de pesos del base conviene revisar también los términos del Qwen3.5-0.8B original.
- Fecha de creación declarada 2026-11-11: verificar la procedencia y reproducibilidad del checkpoint antes de integrarlo en pipelines.
- Sin cuantizaciones publicadas (GGUF, AWQ, GPTQ): el despliegue en CPU o GPUs muy limitadas requiere conversión propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rilixai/Qwen3.5-0.8B-Beaker-math-3c80f51b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Run de Beaker 3c80f51b: https://app.withbeaker.ai/public/runs/3c80f51b-d89d-402f-a7c6-54ee41ab6737
- Blog de Beaker sobre programación en espacio de pesos: https://www.withbeaker.ai/blog/weight-space-programming
- Sitio de Beaker: https://www.withbeaker.ai
