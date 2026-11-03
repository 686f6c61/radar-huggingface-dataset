# amd/Qwen3-1.7B_rai_1.9.0_npu

## Resumen

AMD Qwen3-1.7B_rai_1.9.0_npu es una distribución del modelo Qwen3-1.7B de Alibaba Qwen, publicada por AMD y optimizada para ejecutarse en las NPU (unidades de procesamiento neuronal) de los procesadores AMD Ryzen AI mediante el runtime Ryzen AI 1.9.0. El modelo se distribuye en formato ONNX y utiliza el toolkit Quark de AMD para la cuantización y el empaquetado de los pesos, de modo que la inferencia se delega a la NPU integrada en lugar de a la CPU o a una GPU discreta.

El modelo subyacente, Qwen3-1.7B, es un transformer denso de 1.700 millones de parámetros con capacidades de generación de texto, razonamiento y conversación. Esta variante concreta está pensada para escenarios de IA en el borde (edge AI) sobre portátiles y mini-PC con Ryzen AI, donde el consumo energético y la disponibilidad de la NPU son factores críticos. La ficha de HuggingFace declara únicamente el idioma inglés y una licencia Apache 2.0.

La relevancia de esta publicación radica en que ejemplifica el patrón de despliegue de LLMs en hardware de PC con aceleración NPU, un segmento en crecimiento para asistentes locales, resumen de documentos y automatización de escritorio sin depender de la nube. El acceso al repositorio está restringido (gated): es necesario aceptar las condiciones en HuggingFace antes de descargar los pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen3-1.7B) |
| Parametros totales | 1.700 millones (1,7 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible en detalle; empaquetado con Quark para NPU Ryzen AI |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (optimizado para NPU Ryzen AI) |

## Arquitectura y entrenamiento

El modelo base es Qwen3-1.7B, un transformer denso de la familia Qwen3. La información proporcionada no detalla la composición del dataset de entrenamiento, el número de tokens utilizados ni si se aplicaron fases de RLHF o DPO. Tampoco se especifican innovaciones arquitectónicas particulares más allá de las propias del modelo original.

La contribución específica de esta publicación es el pipeline de despliegue: AMD convierte y cuantiza los pesos con Quark y los exporta a ONNX para que el runtime Ryzen AI 1.9.0 los ejecute sobre la NPU. Este proceso implica una reescritura del grafo computacional y una selección de operadores compatibles con el acelerador, lo que condiciona el rendimiento real frente a la ejecución en GPU. No se dispone de información sobre el esquema exacto de cuantización (por ejemplo, INT8 o INT4 con calibración) ni sobre posibles degradaciones de precisión introducidas en la conversión.

## Capacidades

- Generación de texto y conversación multi-turno en inglés.
- Razonamiento básico y respuesta a preguntas, heredado del modelo Qwen3-1.7B.
- Generación de código y tareas sencillas de matemáticas, sujetas a la precisión del modelo de 1,7 B.
- Ejecución local en NPU Ryzen AI, sin necesidad de GPU discreta ni conexión a la nube.
- Integración con el stack ONNX Runtime y el runtime Ryzen AI 1.9.0.
- Soporte de tool calling y modo thinking: no disponible en la información proporcionada para esta variante concreta.
- Capacidades multimodales (visión o audio): no disponibles.

## Casos de uso

- Asistentes locales en portátiles con Ryzen AI: el modelo se ejecuta en la NPU y libera CPU y GPU para otras tareas, lo que permite mantener un asistente de escritorio siempre activo con bajo consumo energético.
- Resumen de documentos y correos en el dispositivo: al procesar el texto localmente, se evita enviar información confidencial a servicios en la nube, un requisito habitual en entornos corporativos regulados.
- Autocompletado y reescritura de texto en aplicaciones ofimáticas: la latencia de la NPU es suficiente para sugerencias interactivas en un modelo de 1,7 B cuantizado.
- Clasificación y extracción de entidades en pipelines de datos: útil para etiquetar tickets, correos o formularios en lotes pequeños sobre hardware de escritorio.
- Prototipado de aplicaciones de IA generativa en el borde: desarrolladores que necesitan validar un flujo RAG o un chatbot antes de escalar a infraestructura mayor pueden usar esta variante como banco de pruebas.
- Generación de código asistida en IDE sobre equipos sin GPU dedicada: el modelo puede ofrecer sugerencias de fragmentos cortos, aunque su tamaño limita la calidad frente a modelos mayores.
- Automatización de escritorio y agentes simples: con tool calling, si la variante lo soporta, podría encadenar acciones sobre el sistema operativo; conviene verificar esta capacidad en la documentación de Ryzen AI antes de diseñar el flujo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- NPU AMD Ryzen AI compatible con el runtime Ryzen AI 1.9.0 (familias de procesadores Ryzen AI 300 y posteriores, según la matriz de compatibilidad de AMD; no se detalla en la información proporcionada).
- El repositorio ocupa 2,7 GB, lo que sugiere pesos cuantizados; la VRAM/RAM necesaria para inferencia no se especifica.
- No requiere GPU discreta: el objetivo es la NPU integrada.
- Despliegue mediante ONNX Runtime con el proveedor de ejecución de Ryzen AI; no se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI para este artefacto.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / destino | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AMD Qwen3-1.7B_rai_1.9.0_npu | 1,7 B | no disponible | ONNX para NPU Ryzen AI | Apache 2.0 | Gated en HuggingFace |
| Qwen3-1.7B (original) | 1,7 B | no disponible | Safetensors / GGUF | Apache 2.0 | Publico |
| Llama 3.2 1B | 1,2 B | no disponible | Safetensors / GGUF | Llama 3.2 Community License | Publico (con aceptacion) |
| Gemma 3 1B | 1 B | no disponible | Safetensors / GGUF | Gemma Terms of Use | Publico (con aceptacion) |

La comparativa se limita a parámetros y licencia porque la información proporcionada no incluye resultados de benchmarks ni la longitud de contexto de esta variante. La diferencia clave frente a los originales es el formato ONNX y el destino NPU, que restringe el hardware de ejecución pero habilita aceleración dedicada de bajo consumo.

## Limitaciones y advertencias

- Acceso restringido: es necesario aceptar las condiciones en HuggingFace antes de descargar los pesos.
- Idioma declarado únicamente inglés; el rendimiento en castellano no está garantizado ni documentado.
- Modelo de 1,7 B: mayor riesgo de alucinación y menor calidad en razonamiento complejo, matemáticas avanzadas y código de producción que modelos de mayor tamaño.
- La cuantización para NPU puede introducir pérdida de precisión respecto al modelo original; no se documenta el esquema exacto.
- Dependencia del runtime Ryzen AI 1.9.0 y de hardware AMD compatible: no es portable a GPU NVIDIA ni a CPU genérica sin reconversión.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar los términos del modelo base Qwen3 y las condiciones adicionales del acceso gated.
- No se documentan sesgos específicos de esta variante; los sesgos del modelo base Qwen3-1.7B son aplicables.
- Sin datos publicados de benchmarks ni de latencia, la evaluación en producción requiere pruebas propias.

## Enlaces

- HuggingFace: https://huggingface.co/amd/Qwen3-1.7B_rai_1.9.0_npu
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B (referencia del modelo original)
- Ryzen AI (AMD): https://www.amd.com/en/products/software/ryzen-ai.html
- Quark (AMD): https://quark.amd.com/
- ONNX Runtime: https://onnxruntime.ai/
