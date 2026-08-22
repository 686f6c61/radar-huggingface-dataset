# namquangstudy/aaie-ddense-gft-llama

## Resumen

El modelo **AAIE-Distilled Dense Instruct (export Llama-compatible)** es una conversión del modelo original `aaie-ddense-gft`, desarrollado por el equipo de namquangstudy. Se trata de un modelo de lenguaje de 354 millones de parámetros cuya arquitectura es estructuralmente idéntica a la de Llama (GQA, RoPE, SwiGLU, RMSNorm, embeddings atados y sin biases), pero con nombres de tensores y configuración distintos. Esta exportación reasigna los pesos del modelo original a la implementación nativa de `LlamaForCausalLM` de HuggingFace y vLLM, eliminando la necesidad de `trust_remote_code` y permitiendo cargar el modelo directamente en vLLM.

La relevancia de este modelo reside en su compatibilidad con el ecosistema estándar de inferencia de alta velocidad: mientras que la arquitectura original generaba texto a unos 2 tokens por segundo con un bucle de generación no cacheado, esta exportación alcanza aproximadamente 430 tokens/s en vLLM. Está pensado para desarrolladores que deseen desplegar un modelo de lenguaje pequeño, eficiente y con licencia MIT en entornos de producción, sin dependencias personalizadas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM (equivalente a Llama) |
| Parametros totales | 354.374.144 (0,35B) |
| Parametros activos | No aplicable (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo safetensors en FP32/FP16) |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es una exportación del original `AAIE-Distilled Dense Instruct`, que fue entrenado como un modelo denso con atención de consultas agrupadas (GQA), posicionamiento rotatorio (RoPE), FFN con activación SwiGLU, normalización RMSNorm y embeddings atados. No se han añadido sesgos en ninguna capa. La exportación no implica un reentrenamiento: los pesos se copian tal cual a los nombres de tensores equivalentes de Llama. La verificación se realizó mediante una prueba CPU-only con `transformers`, confirmando que la salida es byte a byte idéntica a la del modelo original.

Los detalles del entrenamiento (número de tokens, composición del dataset, posibles técnicas de RLHF/DPO) no están disponibles en la información proporcionada. El modelo original sí documenta hiperparámetros y evaluación en su ficha, pero no se han incluido aquí.

## Capacidades

- Generación de texto conversacional y de instrucciones.
- Responde a preguntas factuales y de conocimiento general, como "What is a database index?".
- Adecuado para tareas de instrucción cortas y respuestas directas.
- Soporte de decodificación greedy y muestreo con temperatura (se muestra un ejemplo con `temperature=0.8`).
- No se menciona soporte para tool calling, agentes, visión ni audio.
- Solo inglés; sin capacidades multilingües declaradas.

## Casos de uso

- **Asistente de ayuda en tareas académicas**: puede generar retroalimentación sobre asignaciones de informática o sistemas de información, como se menciona en su evaluación (puntuación 7,50/10 en temas de feedback de asignaciones IT/CS).
- **Generación de respuestas a preguntas frecuentes**: su tamaño compacto lo hace ideal para integrarse en sistemas de FAQ o chatbots de bajo coste.
- **Despliegue en vLLM para alta concurrencia**: gracias a la compatibilidad nativa con vLLM, se puede servir en producción con un throughput de ~430 tokens/s en una GPU no especificada, adecuado para entornos con múltiples peticiones simultáneas.
- **Prototipado rápido en entornos sin GPU**: al ser un modelo pequeño (1,4 GB en disco), puede ejecutarse en CPU mediante `transformers` sin `trust_remote_code`, lo que facilita pruebas locales.
- **Aplicaciones de generación de texto corto**: por ejemplo, resúmenes, títulos o respuestas breves en inglés.
- **Investigación en compresión de modelos**: al ser una exportación con pesos idénticos, puede usarse como base para estudios de cuantización, destilación o eficiencia de inferencia.

## Benchmarks y rendimiento

En la información disponible se menciona un resultado de evaluación con LLM-judge: **7,50/10** en temas de retroalimentación de asignaciones IT/CS, evaluado en un conjunto de validación separado. No se han publicado otros benchmarks estándar (MMLU, HumanEval, GSM8K) ni comparaciones con modelos similares.

| Benchmark | Resultado |
|---|---|
| LLM-judge (feedback IT/CS) | 7,50/10 |

## Requisitos de hardware

- **VRAM estimada**: el modelo tiene 354M parámetros. En FP16, los pesos ocupan ~0,7 GB, por lo que caben en cualquier GPU con al menos 1 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 2060, etc.). En cuantización de 8 bits (si se aplicara) se reduciría a ~0,4 GB.
- **GPU recomendadas**: cualquier GPU moderna de consumo (RTX 20/30/40) o de centro de datos (T4, A10, A100) puede ejecutar el modelo sin problemas. La velocidad de 430 tokens/s se obtuvo en vLLM con una GPU no especificada, pero es esperable que sea aún mayor en hardware de gama alta.
- **Inferencia en CPU**: es posible ejecutar el modelo en CPU con `transformers` y `llama.cpp` (GGUF), aunque la velocidad será menor.
- **Opciones de despliegue**: vLLM (recomendado, ya que está optimizado para esta arquitectura), `transformers` nativo, `Ollama` (si se convierte a GGUF), o `TGI` (si se convierte a los formatos correspondientes).
- **Latencia y throughput**: se reporta ~430 tokens/s en vLLM, pero no se especifican condiciones exactas (hardware, batch size, etc.). No se dispone de datos de latencia (TTFT) ni de rendimiento bajo carga.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos de tamaño similar (por ejemplo, TinyLlama-1.1B, Qwen2-0.5B, Gemma-2B). No se han encontrado datos de rendimiento relativo en los resultados de búsqueda. La licencia MIT y la compatibilidad nativa con vLLM son las principales ventajas frente a modelos de la misma escala que requieren `trust_remote_code` o backends personalizados.

## Limitaciones y advertencias

- **Tamaño reducido**: con solo 0,35B parámetros, el modelo tiene menor capacidad de razonamiento y conocimiento que modelos más grandes (7B o más). Es probable que genere respuestas incorrectas o incompletas en tareas complejas.
- **Idioma**: solo se ha entrenado y evaluado en inglés. No es adecuado para producción en español u otros idiomas sin fine-tuning.
- **Alucinaciones**: no se documentan tasas de alucinación, pero como todo modelo de lenguaje, puede generar información falsa o inventada.
- **Contexto**: no se conoce la longitud de contexto máxima. Si no se especifica, puede ser limitada (típicamente 2048 o 4096 tokens), lo que afecta a tareas que requieren contexto largo.
- **Licencia**: MIT permite uso comercial y modificación sin restricciones, pero se recomienda revisar los términos de la licencia del modelo original y de los datos de entrenamiento.
- **Dependencia de la exportación**: aunque la exportación es numéricamente idéntica al original, cualquier actualización futura del modelo original requerirá una nueva exportación para mantener la compatibilidad con vLLM.

## Enlaces

- Modelo en HuggingFace: [namquangstudy/aaie-ddense-gft-llama](https://huggingface.co/namquangstudy/aaie-ddense-gft-llama)
- Modelo original (AAIE-Distilled Dense Instruct): [namquangstudy/aaie-ddense-gft](https://huggingface.co/namquangstudy/aaie-ddense-gft)
- Repositorio de código del equipo: [GitHub - namquang2910/aaie-model-lab-](https://github.com/namquang2910/aaie-model-lab-)
- Búsqueda de modelos AAIE_DDense en HuggingFace: [Models - Hugging Face](https://huggingface.co/models?other=AAIE_DDense)
