# sanidhya1910/recipe-lens-4b

## Resumen

Recipe Lens es un asistente de cocina basado en el modelo Qwen/Qwen3-4B-Instruct-2507, fine-tuneado por el desarrollador sanidhya1910 sobre el dataset Shengtao/recipe. El modelo está diseñado para responder tres tareas concretas con salida estructurada en JSON: generar una receta a partir de una lista de ingredientes disponibles, reescalar las cantidades de una receta para un número distinto de comensales y proponer sustituciones válidas cuando falta un ingrediente. Además, está entrenado para declinar educadamente cuando los ingredientes no permiten formar un plato real, evitando inventar recetas.

El modelo tiene 4.022 millones de parámetros y se distribuye en formato safetensors con licencia Apache 2.0. Su relevancia radica en que produce una salida verificable mediante validadores automáticos, lo que lo hace adecuado para integrarse en aplicaciones de cocina, planificación de comidas o asistentes domésticos donde la fiabilidad de las cantidades y los pasos es crítica. El pipeline completo incluye una etapa opcional de visión (Qwen3-VL-4B-Instruct, no entrenado) que convierte fotografías de platos en listas de ingredientes, aunque el modelo fine-tuneado en sí es exclusivamente de texto.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3, decoder-only) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, no especificada en la ficha) |
| Tipos de cuantizacion | no especificadas (pesos en safetensors; se puede cuantizar con herramientas externas) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-4B-Instruct-2507, un transformer decoder-only con atención causal estándar. El fine-tuning se realizó mediante supervisión sobre el dataset Shengtao/recipe, que contiene pares de instrucciones y recetas. No se menciona el uso de RLHF ni DPO en la información disponible.

La innovación principal del proyecto no está en la arquitectura, sino en el diseño de la salida: el modelo está entrenado para emitir un único objeto JSON con una estructura fija (`title`, `servings`, `ingredients`, `steps`), y el repositorio incluye validadores que comprueban automáticamente el cumplimiento del contrato de salida, la coherencia de las cantidades reescaladas y la declaración de declinación cuando procede. Para el pipeline con fotografías, se utiliza un modelo de visión externo (Qwen3-VL-4B-Instruct) cuya salida se valida contra un vocabulario congelado antes de pasarla al modelo fine-tuneado.

## Capacidades

- Generación de recetas a partir de una lista de ingredientes, usando solo esos ingredientes más elementos básicos de despensa.
- Reescalado exacto de cantidades para un número de comensales distinto, con verificación aritmética.
- Sustitución de ingredientes ausentes por alternativas válidas, ajustando las cantidades.
- Declinación explícita cuando los ingredientes no forman un plato coherente.
- Salida estructurada en JSON, validable mediante herramientas automáticas.
- Soporte de conversaciones multi-turno para aclarar requisitos (heredado del modelo base instruct).
- No es multimodal: no procesa imágenes directamente; las fotos se gestionan mediante un modelo de visión separado y no entrenado.
- No se documenta soporte de tool calling ni function calling.

## Casos de uso

- Asistente de cocina en aplicaciones móviles: el usuario introduce los ingredientes que tiene en casa y el modelo devuelve una receta JSON que la app puede renderizar como tarjeta visual, con pasos y cantidades exactas.
- Planificación de comidas semanales: dado un inventario de despensa, el modelo sugiere recetas que usan solo los ingredientes disponibles, reduciendo el desperdicio y las compras innecesarias.
- Escalado de recetas para eventos: si una receta está pensada para 8 personas y se necesitan 3, el modelo recalcula cada cantidad con precisión aritmética, evitando errores comunes de proporción.
- Sustitución de ingredientes por alergias o restricciones: el modelo propone alternativas válidas y ajusta las cantidades, útil en aplicaciones de dietética o nutrición.
- Integración en sistemas de gestión de inventario de cocinas profesionales: el modelo puede generar sugerencias de platos basadas en el stock actual, y declinar cuando no hay suficientes ingredientes para un plato coherente.
- Generación de contenido estructurado para blogs o sitios de recetas: la salida JSON permite automatizar la publicación de recetas con formato consistente y validado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card muestra ejemplos de salida con validaciones "PASS" para el contrato de salida, pero no incluye métricas numéricas como MMLU, HumanEval o GSM8K, ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 8,1 GB en safetensors, lo que sugiere pesos en fp16 o bf16. Para inferencia en fp16 se necesitan aproximadamente 8-10 GB de VRAM (según longitud de contexto). Con cuantización 4-bit (GPTQ/AWQ) se puede reducir a unos 3-4 GB.
- GPU recomendadas: tarjetas consumer con al menos 8 GB de VRAM (RTX 3060, RTX 4060, RTX 4070) para fp16; con cuantización 4-bit, tarjetas de 4-6 GB (RTX 3050, RTX 4050) pueden ser suficientes.
- El modelo cabe en GPUs consumer de gama media, no requiere hardware de centro de datos.
- Opciones de despliegue: al ser un modelo transformers estándar, puede servirse con vLLM, TGI, llama.cpp (tras conversión a GGUF) u Ollama.
- Latencia y throughput: no se proporcionan datos medidos. Como referencia orientativa, un modelo de 4B en fp16 en una RTX 4090 suele generar entre 50 y 100 tokens por segundo, pero estos valores dependen de la implementación y la longitud de contexto.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicamente entrenados para generación de recetas con salida estructurada. El modelo base Qwen3-4B-Instruct-2507 es el punto de partida, pero no hay datos de rendimiento relativo publicados en la ficha. Se puede considerar que Recipe Lens es un especialista de nicho frente a modelos generalistas de tamaño similar (por ejemplo, Llama-3.1-8B-Instruct o Mistral-7B-Instruct), pero sin benchmarks no es posible establecer una comparación cuantitativa.

| Modelo | Parametros | Contexto | Licencia | Especializacion |
|---|---|---|---|---|
| recipe-lens-4b | 4.0B | no disponible | Apache 2.0 | Recetas estructuradas |
| Qwen3-4B-Instruct-2507 (base) | 4.0B | no disponible | Apache 2.0 | Generalista instruct |
| Llama-3.1-8B-Instruct | 8.0B | 128K | Llama 3.1 | Generalista instruct |

## Limitaciones y advertencias

- El modelo solo soporta inglés; no hay evidencia de capacidades multilingües.
- No procesa imágenes: el pipeline de fotos depende de un modelo de visión externo no entrenado, y la propia documentación advierte que la recuperación de ingredientes a partir de fotos de platos terminados es "casi irresoluble" y debe tratarse como una pista, no como entrada fiable.
- Riesgo de alucinación: aunque está entrenado para declinar, en casos límite podría inventar recetas o cantidades incorrectas. Los validadores externos mitigan parcialmente este riesgo, pero no lo eliminan.
- No se han publicado métricas de rendimiento ni estudios de sesgos, por lo que se desconoce su comportamiento en dominios culinarios no representados en el dataset de entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero el dataset de entrenamiento (Shengtao/recipe) puede tener sus propias restricciones; conviene revisar su licencia antes de un despliegue productivo.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta; es un proyecto reciente y poco validado por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sanidhya1910/recipe-lens-4b
- Demo en el navegador: https://huggingface.co/spaces/sanidhya1910/recipe-lens-demo
- Repositorio GitHub con entrenamiento, validadores y métricas: https://github.com/sanidhya1910/recipe-lens
