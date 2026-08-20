# RedHatAI/SmolLM-1.7B-Instruct-quantized.w8a8

## Resumen

SmolLM-1.7B-Instruct-quantized.w8a8 es una versión cuantizada a INT8 del modelo de chat SmolLM-1.7B-Instruct, desarrollado originalmente por Neural Magic y publicado en Hugging Face bajo el perfil de Red Hat AI. El objetivo es reducir el tamaño y los requisitos de memoria del modelo base en aproximadamente un 50 %, manteniendo una pérdida de precisión mínima. La cuantización afecta tanto a pesos como a activaciones (esquema W8A8) y se ha aplicado únicamente a los operadores lineales de los bloques transformer, dejando intacto el resto de la arquitectura.

El modelo está pensado para entornos de producción donde el coste de inferencia y la huella de memoria son críticos, como despliegues en GPU con poca VRAM o en sistemas de inferencia a gran escala mediante el backend vLLM. Al ser una versión instructiva, responde a instrucciones en inglés y se comporta como un asistente conversacional. La licencia Apache-2.0 permite su uso comercial y de investigación sin restricciones adicionales.

La arquitectura subyacente es la misma que la de SmolLM-1.7B-Instruct, basada en un transformer estilo Llama con 1.812 millones de parámetros. La cuantización se realizó con el algoritmo GPTQ sobre un dataset de calibración de 1.024 secuencias, y el modelo se ha validado en el benchmark OpenLLM (versión 1) con una recuperación media del 98,7 % respecto al modelo original.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama (transformer causal) |
| Parametros totales | 1.812.039.680 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible (no especificada en la documentación; el modelo base soporta hasta 8192 tokens, pero no se confirma en esta versión) |
| Tipos de cuantizacion | INT8 (W8A8: pesos y activaciones) |
| Idiomas soportados | Inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es una versión cuantizada de SmolLM-1.7B-Instruct, que usa una arquitectura transformer causal con bloques Llama. La cuantización se aplica exclusivamente a las capas lineales internas de los bloques transformer, con un esquema simétrico estático por canal para los pesos (escala fija por dimensión de salida) y un esquema simétrico dinámico por token para las activaciones (escala calculada en tiempo de ejecución). El algoritmo empleado es GPTQ, implementado mediante la librería llm-compressor, con un factor de amortiguación del 1 % y 1.024 secuencias de calibración del dataset de compresión de Neural Magic. No se ha modificado el entrenamiento original del modelo base; únicamente se ha realizado la compresión posterior al entrenamiento.

La cuantización reduce el número de bits por parámetro de 16 a 8, lo que disminuye el tamaño del modelo en disco y la VRAM necesaria en aproximadamente un 50 %. No se aplica cuantización a la capa de salida (lm_head). El modelo se distribuye con los pesos en formato safetensors y está preparado para su uso con el backend vLLM, aunque también es compatible con la librería transformers estándar.

## Capacidades

- Generación de texto en inglés: responde a instrucciones y mantiene conversaciones de asistente, similar al modelo base SmolLM-1.7B-Instruct.
- Razonamiento básico: puede resolver tareas de sentido común y razonamiento simple, aunque su tamaño (1.7B) limita la complejidad de los problemas.
- Comprensión de lenguaje: es capaz de realizar tareas de clasificación, extracción de información y resumen de textos cortos.
- Soporte de chat multi-turno: al estar entrenado con plantillas de chat, puede mantener diálogos con múltiples turnos, aunque con una ventana de contexto limitada.
- No se documenta soporte de tool calling ni función calling en la información proporcionada.
- Es monolingüe en inglés; no se recomienda su uso en otros idiomas.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones sencillas en inglés, por ejemplo, responder preguntas frecuentes o derivar consultas a un agente humano. Su tamaño reducido permite desplegarlo en servidores de bajo coste.
- Asistente de programación ligero: puede ayudar a generar fragmentos de código sencillo o explicar conceptos de programación, aunque su capacidad es limitada comparada con modelos más grandes.
- Clasificación y etiquetado de textos: dado un texto corto, puede asignar categorías o extraer entidades, útil para procesamiento de documentos.
- Generación de contenido para blogs o redes sociales: puede redactar borradores de artículos cortos o publicaciones en inglés, ahorrando tiempo a redactores.
- Chatbot de demostración o prototipo: por su licencia abierta y bajo coste de inferencia, es adecuado para crear prototipos de asistentes virtuales sin invertir en infraestructura cara.
- Análisis de sentimiento: aunque no está entrenado específicamente para ello, puede clasificar el tono de opiniones o reseñas en inglés, con resultados aceptables para textos cortos.
- Pruebas de integración en pipelines de IA: al ser cuantizado, permite evaluar el impacto de la cuantización en aplicaciones existentes antes de pasar a modelos más grandes.

## Benchmarks y rendimiento

Se han publicado resultados del benchmark OpenLLM (versión 1) con la librería lm-evaluation-harness usando el motor vLLM. La tabla siguiente compara el modelo cuantizado con el modelo base sin cuantizar (SmolLM-1.7B-Instruct):

| Benchmark | SmolLM-1.7B-Instruct (base) | SmolLM-1.7B-Instruct-quantized.w8a8 | Recuperación |
|---|---|---|---|
| MMLU (5-shot) | 28,10 | 27,54 | 98,0 % |
| ARC Challenge (25-shot) | 49,06 | 48,98 | 99,8 % |
| GSM-8K (5-shot, strict-match) | 4,93 | 3,87 | 78,5 % |
| Hellaswag (10-shot) | 66,96 | 66,25 | 98,9 % |

La puntuación media del benchmark OpenLLM es de 41,23 para la versión cuantizada frente a 41,76 del modelo original, lo que supone una recuperación media del 98,7 %. Se observa una pérdida notable en GSM-8K (razonamiento matemático), probablemente debida a la cuantización de activaciones.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2 GB con cuantización INT8 (1,7 GB de pesos + activaciones y overhead). El tamaño del repositorio es de 2,0 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como NVIDIA RTX 3060 (12 GB), RTX 4060 Ti (16 GB) o RTX 4090. También puede ejecutarse en GPUs de servidor como T4 (16 GB) o L4.
- Compatible con GPU consumer: sí, cabe en la mayoría de tarjetas gráficas actuales, incluso con memoria de 4 GB.
- Opciones de despliegue: vLLM es el backend recomendado por el autor, soporta OpenAI-compatible serving. También se puede usar con transformers, llama.cpp (aunque no se indica soporte explícito), Ollama, o TGI (Text Generation Inference).
- Latencia y throughput: no se proporcionan datos concretos, pero al ser un modelo de 1.7B con cuantización INT8, la latencia por token suele ser inferior a 20 ms en GPUs modernas, y puede alcanzar varios cientos de tokens por segundo en batch con vLLM.

## Comparativa con modelos similares

La siguiente tabla compara el modelo cuantizado con el modelo base sin cuantizar y con una variante de cuantización INT4 (W4A16) que existe en la comunidad, aunque no se dispone de resultados de benchmarks para esta última.

| Modelo | Parámetros | Cuantización | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SmolLM-1.7B-Instruct (base) | 1,7B | FP16/BF16 | 8192 | Apache-2.0 | Hugging Face |
| SmolLM-1.7B-Instruct-quantized.w8a8 (este modelo) | 1,7B | INT8 (W8A8) | no disponible | Apache-2.0 | Hugging Face |
| SmolLM-1.7B-Instruct-quantized.w4a16 (otra versión) | 1,7B | INT4 (W4A16) | no disponible | Apache-2.0 | Hugging Face (de Neural Magic) |

No se dispone de resultados de benchmarks para la versión W4A16. El modelo w8a8 ofrece un equilibrio entre precisión y reducción de memoria, siendo la opción w4a16 aún más ligera pero con mayor pérdida de calidad.

## Limitaciones y advertencias

- Modelo monolingüe en inglés: no está diseñado para otros idiomas, y su uso en español o cualquier otra lengua puede producir respuestas incoherentes.
- Tamaño pequeño: con 1,7B de parámetros, su capacidad de razonamiento complejo, matemáticas avanzadas o generación de código extenso es limitada, y puede cometer errores en tareas que requieren conocimiento profundo.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar información falsa o inventada, especialmente en temas de actualidad o técnicos.
- Pérdida de precisión en razonamiento matemático: la cuantización afecta notablemente a GSM-8K (recuperación 78,5 %), por lo que no es recomendable para tareas que requieren cálculos precisos.
- Contexto no especificado: no se documenta la longitud máxima de contexto en la model card, aunque el modelo base soporta 8192 tokens; se debe verificar con el modelo original.
- Compatibilidad: aunque se puede usar con vLLM, no se garantiza su funcionamiento con otros runtimes (como llama.cpp) sin conversión adicional.
- Licencia Apache-2.0: permite uso comercial, pero se debe cumplir con la atribución y las condiciones de la licencia, además de las restricciones legales de uso.

## Enlaces

- [Hugging Face - RedHatAI/SmolLM-1.7B-Instruct-quantized.w8a8](https://huggingface.co/RedHatAI/SmolLM-1.7B-Instruct-quantized.w8a8)
- [Modelo base - HuggingFaceTB/SmolLM-1.7B-Instruct](https://huggingface.co/HuggingFaceTB/SmolLM-1.7B-Instruct)
- [FriendliAI - página del modelo](https://friendli.ai/models/RedHatAI/SmolLM-1.7B-Instruct-quantized.w8a8)
- [Artículo sobre la versión W4A16](https://dev.co/ai/llms/smollm-1-7b-instruct-quantized-w4a16)
- [Dataset de calibración de Neural Magic](https://huggingface.co/datasets/neuralmagic/LLM_compression_calibration)
- [Librería llm-compressor](https://github.com/vllm-project/llm-compressor)
- [Backend vLLM](https://docs.vllm.ai/en/latest/)
- [OpenLLM Leaderboard](https://huggingface.co/spaces/open-llm-leaderboard/open_llm_leaderboard)
