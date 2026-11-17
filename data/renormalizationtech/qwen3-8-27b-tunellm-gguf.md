# RenormalizationTech/Qwen3.8-27B-tuneLLM-GGUF

## Resumen

RenormalizationTech/Qwen3.8-27B-tuneLLM-GGUF es una cuantización en formato GGUF del modelo Qwen/Qwen3.8-27B, publicada por RenormalizationTech dentro de su proyecto tuneLLM. Se trata de una extracción estrictamente de texto: el autor ha eliminado los componentes de visión y MTP (multi-token prediction) del modelo original y ha generado un único binario cuantizado en Q4_K_M, pensado para su uso con llama.cpp. El paquete no incluye adaptadores de tarea, adaptadores fusionados ni técnicas de activation steering, por lo que es una conversión directa de los pesos upstream.

El modelo base cuenta con 26.895.998.464 parámetros (aproximadamente 26,9 mil millones), y el archivo GGUF final ocupa 16.742.036.832 bytes (unos 16,7 GB). La revisión upstream está fijada al commit `37561816e66b5b9153b1b64c10968c18c1e6f4a0` de Qwen/Qwen3.8-27B, lo que garantiza reproducibilidad. La licencia es Apache 2.0, heredada del modelo original.

La relevancia de esta ficha es doble: por un lado, permite ejecutar un modelo de ~27B en GPUs de consumo mediante cuantización Q4_K_M; por otro, el autor documenta de forma inusualmente rigurosa el proceso de evaluación (paridad de tokens entre Hugging Face y llama.cpp, desactivación de caché de prompt, modo "nonthinking" explícito), lo que facilita la auditoría del resultado. No obstante, las métricas publicadas son subconjuntos pequeños y descriptivos, no benchmarks independientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, según tag `qwen3_5`); detalles internos no disponibles |
| Parametros totales | 26.895.998.464 (~26,9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el ejemplo de uso emplea `-c 8192`) |
| Tipos de cuantizacion | Q4_K_M (único binario publicado); referencia interna BF16 GGUF no distribuida |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`Qwen3.8-27B-text-Q4_K_M.gguf`) |
| Tamaño del repo | 16,7 GB |
| Modelo base | Qwen/Qwen3.8-27B (revisión `37561816e66b5b9153b1b64c10968c18c1e6f4a0`) |
| Modalidad | Solo texto (visión y MTP excluidos) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá del tag `qwen3_5`, que sitúa el modelo en la familia Qwen3.5. El autor no documenta el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo base. Lo que sí se especifica es el proceso de modificación aplicado: extracción solo-texto de los pesos upstream, exclusión de los componentes de visión y de multi-token prediction (MTP), y cuantización a Q4_K_M mediante llama.cpp. No se empleó importance matrix en el proceso de cuantización, y el archivo se generó a partir del modelo original en alta precisión, de forma independiente al checkpoint NF4 de bitsandbytes.

Un aspecto técnico destacable es la fijación de la build de llama.cpp mediante revisión y hashes de binario en `provenance.json`, así como la verificación de paridad exacta de tokens entre el tokenizador de Hugging Face y el endpoint `/tokenize` de llama.cpp. El autor advierte explícitamente que la ruta de evaluación emplea renderizado HF del prompt con `enable_thinking=False` y que el comportamiento por defecto de la plantilla de chat de llama.cpp puede diferir y no fue evaluado.

## Capacidades

- Generación de texto conversacional en modo chat, con soporte para plantilla de chat de Qwen y desactivación explícita del modo "thinking".
- Razonamiento y respuesta a preguntas de conocimiento general (evaluado con MMLU en subconjunto reducido).
- Resolución de problemas matemáticos de tipo GSM8K, incluyendo un modo "numeric fallback" para extracción de respuesta numérica.
- Comprensión de documentos largos y respuesta a preguntas sobre texto (evaluado con QASPER en subconjunto de desarrollo).
- Inferencia local vía llama.cpp con soporte de Flash Attention (`-fa on`) y offload completo a GPU (`-ngl 99`).
- Compatibilidad con endpoints HTTP de llama.cpp (`/tokenize`, `/completion`), lo que permite integración en servicios propios.
- Capacidades de visión y multi-token prediction: no disponibles en este paquete (excluidas deliberadamente).
- Soporte de tool calling / function calling: no documentado en la información proporcionada.
- Capacidades de agente multi-paso: no documentadas.
- Capacidades multilingües: no documentadas (idiomas no disponibles).

## Casos de uso

- Despliegue local de un LLM de ~27B en una única GPU de 48 GB: con Q4_K_M y `-ngl 99`, el modelo cabe holgadamente en una RTX A6000 (48 GB) o en una A100 40/80 GB, y permite servir peticiones con llama-server en un puerto local sin dependencias de la nube.
- Asistente conversacional autoalojado: el modelo acepta plantillas de chat de Qwen y puede gestionar conversaciones multi-turno; el ejemplo de la model card muestra cómo renderizar el prompt con `apply_chat_template` y validar la paridad de tokens antes de enviar la petición.
- Evaluación reproducible de cuantizaciones: el paquete incluye `evaluation.json`, `provenance.json` y comandos de reproducción, lo que lo convierte en un caso útil para estudiar el impacto de Q4_K_M frente a BF16 en un mismo backend (llama.cpp) y para auditar la metodología de medición.
- Procesamiento de documentos científicos y Q&A sobre texto: la inclusión de QASPER en la pantalla de evaluación sugiere un uso orientado a responder preguntas sobre artículos y documentación técnica, con la cautela de que el propio autor advierte que el modelo puede producir afirmaciones científicas no respaldadas.
- Generación de código y matemáticas en pipelines internos: aunque no se documenta tool calling, el modelo puede integrarse en scripts Python que invoquen el endpoint `/completion` de llama.cpp para tareas de resolución de problemas y generación de texto estructurado.
- Prototipado e investigación en entornos con recursos limitados: al ser un único archivo GGUF de 16,7 GB, se puede descargar y ejecutar en estaciones de trabajo con una sola GPU consumer de gama alta (por ejemplo, RTX 4090 de 24 GB con offload parcial), lo que facilita experimentos de prompting y comparativas de cuantización sin infraestructura dedicada.

## Benchmarks y rendimiento

Los datos publicados por el autor corresponden a subconjuntos fijos y pequeños (32 ítems para MMLU y GSM8K), con generación greedy en modo "nonthinking" y un límite de 512 tokens. No son benchmarks independientes ni representativos del rendimiento global del modelo.

| Representación en runtime | MMLU general | GSM8K numeric fallback | GSM8K strict |
|---|---:|---:|---:|
| HF/bitsandbytes NF4 (nativo) | 30/32 | 26/32 | 26/32 |
| llama.cpp Q4_K_M | 29/32 | 27/32 | 26/32 |
| llama.cpp BF16 GGUF (referencia local) | 29/32 | 26/32 | 25/32 |

El autor señala que la comparación NF4 frente a Q4 mezcla representación y backend, por lo que la comparación válida es Q4_K_M frente al BF16 GGUF local (mismo backend). No se ejecutó una referencia BF16 en Transformers, por lo que el efecto aislado de la cuantización NF4 no se ha medido. La pantalla incluye además 35 preguntas de desarrollo de QASPER (27 por brazo en el subconjunto principal de texto completo), cuyos denominadores exactos y puntuaciones de evidencia textual están en `evaluation.json`. No se han publicado resultados de benchmarks estándar (MMLU completo, HumanEval, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el binario Q4_K_M ocupa 16,7 GB; con overhead de contexto y KV cache, se recomienda al menos 20-24 GB de VRAM para `-c 8192` con offload completo.
- GPU recomendadas: RTX A6000 (48 GB, usada por el autor), A100 40/80 GB, H100; en consumer, RTX 4090 (24 GB) o RTX 3090 (24 GB) con offload completo ajustado, y GPUs de 16 GB solo con offload parcial a CPU.
- Cabe en GPU consumer: sí, en RTX 4090/3090 de 24 GB con contexto moderado; en GPUs de 16 GB requiere offload parcial.
- Opciones de despliegue: llama.cpp (build fijada en `provenance.json`), con `llama-server` como servidor HTTP; no se documenta soporte para vLLM, TGI u Ollama en la información proporcionada.
- Latencia y throughput: no disponibles. El autor indica que los tiempos registrados incluyen carga del modelo y tareas, con jobs concurrentes y una referencia BF16 sharded, por lo que limitan las comparaciones de velocidad; no se reclama un benchmark aislado de TTFT.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| RenormalizationTech/Qwen3.8-27B-tuneLLM-GGUF | ~26,9B | no disponible | Apache 2.0 | GGUF Q4_K_M | Solo texto; visión y MTP excluidos |
| Qwen/Qwen3.8-27B (base) | ~26,9B | no disponible | Apache 2.0 | safetensors | Modelo original completo; incluye visión y MTP |
| Otras cuantizaciones GGUF de Qwen3.8-27B | ~26,9B | no disponible | Apache 2.0 | GGUF | No disponibles en la información proporcionada |

No se dispone de datos de benchmarks comparables con alternativas de la misma categoría en la información proporcionada, por lo que no se incluyen cifras de rendimiento frente a otros modelos.

## Limitaciones y advertencias

- El autor advierte explícitamente que el modelo puede producir afirmaciones científicas no respaldadas y que la pequeña pantalla de evaluación no establece fiabilidad científica.
- Las métricas publicadas son subconjuntos fijos y pequeños (32 ítems) que solapan fixtures de desarrollo y retención; no constituyen un benchmark final independiente.
- No se aisló el efecto de la cuantización NF4: no se ejecutó una referencia BF16 en Transformers, y la comparación NF4/Q4 mezcla representación y backend.
- El diagnóstico de logits estrictos con caché NF4 superó la tolerancia (diferencia absoluta máxima observada de 0,125); su fallo se conserva en la documentación y no se establece equivalencia numérica.
- La ruta de evaluación usa renderizado HF del prompt con `enable_thinking=False`; el comportamiento por defecto de la plantilla de chat de llama.cpp puede diferir y no fue evaluado.
- Los componentes de visión y MTP están excluidos: no se pueden usar capacidades multimodales ni de predicción multi-token con este paquete.
- No se documentan sesgos conocidos, idiomas soportados ni limitaciones de contexto específicas.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar los términos del modelo base y las obligaciones de atribución.
- El autor no empleó importance matrix en la cuantización, lo que puede afectar la calidad en comparación con cuantizaciones que sí la usan.

## Enlaces

- Hugging Face: https://huggingface.co/RenormalizationTech/Qwen3.8-27B-tuneLLM-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio tuneLLM: https://github.com/RenormalizationTech/tuneLLM
- Revisión upstream fijada: `37561816e66b5b9153b1b64c10968c18c1e6f4a0` (Qwen/Qwen3.8-27B)
- Archivos de procedencia y evaluación: `provenance.json` y `evaluation.json` en el repositorio de Hugging Face
- Paper, blog o demo adicionales: no disponibles en la información proporcionada
