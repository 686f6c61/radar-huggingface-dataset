# empero-ai/Qwen3.8-4B-GGUF

## Resumen

Qwen3.8-4B-GGUF es la versión cuantizada en formato GGUF del modelo Qwen3.8-4B, desarrollado por el laboratorio Empero. El modelo base es una destilación de parámetros completos del modelo Qwen3.8 2.4T A95B —un modelo de 2,4 billones de parámetros con activación de 95 mil millones— sobre la arquitectura Qwen3.5-4B. El resultado es un modelo denso de 4.326 millones de parámetros que conserva buena parte de las capacidades de razonamiento del modelo grande, con una mejora sustancial en MMLU respecto a su base (0.553 frente a 0.354). La versión GGUF permite ejecutarlo en hardware modesto mediante llama.cpp, Ollama, LM Studio u otros runtimes compatibles, y exige una build reciente con soporte para la arquitectura híbrida Gated DeltaNet.

El modelo está diseñado como un modelo de razonamiento: cada respuesta abre con un bloque `thinking` que debe extraerse antes de mostrar el texto al usuario final. La distribución incluye cinco niveles de cuantización, desde Q4_K_M (~2,6 GB) hasta BF16 (~8,5 GB), lo que facilita su despliegue en GPU de consumo con 4–12 GB de VRAM. La licencia Apache-2.0, heredada de la base Qwen, permite uso comercial sin restricciones adicionales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 3 capas Gated DeltaNet por cada capa de atención completa (Qwen3.5-class) |
| Parametros totales | 4.326.350.848 (4,3 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_K_M, Q5_K_M, Q6_K, Q8_0, BF16 |
| Idiomas soportados | Inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (con safetensors para el modelo base) |

## Arquitectura y entrenamiento

La arquitectura Qwen3.5-class es un híbrido que intercala tres capas Gated DeltaNet por cada capa de atención completa. Gated DeltaNet es un mecanismo de atención lineal con compuertas que reduce el coste computacional del estado recurrente, manteniendo la capacidad de atención a largas distancias. Esta combinación permite un equilibrio entre eficiencia y calidad, y es la base sobre la que se ha destilado el modelo grande.

El entrenamiento de Qwen3.8-4B consistió en una destilación de parámetros completos del modelo Qwen3.8 2.4T A95B sobre la arquitectura Qwen3.5-4B, utilizando aproximadamente 45.000 trazas de profesor curadas de los datasets internos de destilación de Empero. No se menciona el uso de RLHF o DPO en la información disponible. El modelo resultante muestra una mejora notable en MMLU con cadena de pensamiento (0.553 frente a 0.354 de su base) y una ligera regresión en GSM8K (0.785 frente a 0.850).

## Capacidades

- Razonamiento con cadena de pensamiento: cada respuesta genera un bloque `thinking` interno antes de la respuesta final, lo que mejora la coherencia en tareas de lógica y matemáticas.
- Generación de texto conversacional: soporta el chat template integrado en el archivo GGUF, con recomendaciones de muestreo de temperatura 0.6, top_p 0.95 y top_k 20.
- Multilingüe: solo inglés documentado; no hay información sobre otros idiomas.
- No se documenta soporte de tool calling, function calling ni capacidades de agente multi-paso en la información proporcionada.
- No se documentan capacidades de visión ni audio.

## Casos de uso

- Asistente de chat de bajo coste: al ser un modelo de 4,3 B con cuantizaciones ligeras, puede desplegarse en GPU de 4–6 GB para ofrecer un asistente conversacional con razonamiento básico, útil en aplicaciones de soporte o educación.
- Generación de explicaciones razonadas: su capacidad de razonamiento con cadena de pensamiento lo hace adecuado para tareas de explicación de conceptos, resolución de problemas paso a paso o tutoría en inglés.
- Prototipado rápido de aplicaciones de lenguaje: al ejecutarse en llama.cpp u Ollama, permite iterar sobre prompts y flujos de conversación sin necesidad de infraestructura cloud.
- Análisis de texto en entornos con restricciones de privacidad: al ser un modelo local, puede procesar documentos o conversaciones sin enviar datos a servidores externos, siempre que el inglés sea el idioma de trabajo.
- Investigación en destilación de modelos: sirve como referencia para estudiar la transferencia de capacidades de razonamiento desde un modelo grande (2,4 T) a uno pequeño (4,3 B), comparando métricas como MMLU y GSM8K.
- Evaluación de arquitecturas híbridas: permite probar el comportamiento de capas Gated DeltaNet en tareas de generación de texto, comparando con modelos transformer puros del mismo tamaño.

## Benchmarks y rendimiento

Los resultados del modelo base (Qwen3.8-4B) se obtuvieron con protocolos de cadena de pensamiento y `lm-evaluation-harness`, usando configuraciones idénticas para base y estudiante:

| Tarea | Qwen3.5-4B (base) | Qwen3.8-4B | Δ |
|---|---:|---:|---:|
| MMLU (CoT, 57 materias) | 0.354 | 0.553 | +0.199 |
| GSM8K (CoT) | 0.850 | 0.785 | −0.065 |

No se han publicado resultados de benchmarks específicos para las versiones GGUF cuantizadas.

## Requisitos de hardware

- Q4_K_M y Q5_K_M (~2,6–3,0 GB): cómodos en GPU de 4–6 GB; también funcionan como opción solo CPU.
- Q6_K y Q8_0 (~3,5–4,5 GB): recomendados 6–8 GB de VRAM.
- BF16 (~8,5 GB): requiere 12 GB o más.
- La caché KV es el coste dominante en contextos largos; puede requerir offload a CPU incluso con pesos ligeros.
- Opciones de despliegue: llama.cpp (con build reciente que soporte Qwen3.5 / Gated DeltaNet), Ollama, LM Studio, Jan y KoboldCpp.
- No se proporcionan datos de latencia o throughput en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU (CoT) | GSM8K (CoT) | Licencia |
|---|---:|---:|---:|---:|---|
| Qwen3.8-4B (este) | 4,3 B | No disponible | 0.553 | 0.785 | Apache-2.0 |
| Qwen3.5-4B (base) | 4,3 B | No disponible | 0.354 | 0.850 | Apache-2.0 |
| Qwen3.8 2.4T A95B (origen de la destilación) | 2,4 T (activos 95 B) | No disponible | No disponible | No disponible | No disponible |

La comparativa se limita a los datos publicados en la model card; no hay información sobre otros modelos de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- Solo inglés documentado; no hay garantías de rendimiento en otros idiomas.
- Requiere una build reciente de llama.cpp con soporte para Qwen3.5 / Gated DeltaNet; builds antiguas fallarán al cargar la arquitectura.
- Es un modelo de razonamiento: las respuestas incluyen un bloque `thinking` que debe extraerse antes de mostrarse al usuario final.
- No se documentan capacidades de tool calling, function calling ni agentes multi-paso.
- Al ser una destilación, puede presentar limitaciones frente al modelo grande en tareas fuera de las trazas de entrenamiento.
- No hay información sobre sesgos, alucinaciones o comportamientos adversos en la documentación proporcionada.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda verificar los términos de la base Qwen original.

## Enlaces

- [Modelo GGUF en HuggingFace](https://huggingface.co/empero-ai/Qwen3.8-4B-GGUF)
- [Modelo base Qwen3.8-4B](https://huggingface.co/empero-ai/Qwen3.8-4B)
- [Arquitectura base Qwen3.5-4B](https://huggingface.co/Qwen/Qwen3.5-4B)
- [Repositorio llama.cpp](https://github.com/ggml-org/llama.cpp)
- [Sitio de Empero](https://empero.org)
