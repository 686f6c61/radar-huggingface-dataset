# HYU-NLP-EVA2/qwen3-4b-medicine-static-pilot-261017-seed42-step-095

## Resumen

`qwen3-4b-medicine-static-pilot-261017-seed42-step-095` es un ajuste fino (fine-tune) del modelo Qwen3-4B-Instruct-2507, publicado por el usuario HYU-NLP-EVA2. Se trata de un checkpoint intermedio de un experimento de entrenamiento identificado como `261017_medicine_static_pilot_seed42`, en el paso 95 y con semilla 42. El nombre sugiere un piloto de adaptación al dominio médico, aunque la model card no documenta la composición del dataset ni el objetivo exacto del entrenamiento.

El modelo conserva la arquitectura y el tamaño del modelo base: 4.022.468.096 parámetros en un transformer denso, exportado en BF16 en formato `safetensors` para `transformers`. El repositorio incluye además una carpeta `original_checkpoint/` con los ficheros nativos de veRL/FSDP y sus metadatos, lo que apunta a un pipeline de entrenamiento por refuerzo o ajuste supervisado distribuido sobre dicho framework. No se declaran idiomas soportados, resultados de benchmarks ni detalles de la receta de entrenamiento.

Su relevancia es acotada y de carácter experimental: se publica con licencia Apache 2.0 y es compatible con TGI y con endpoints, pero no cuenta con descargas ni validación externa en el momento de redactar esta ficha. Debe tratarse como un artefacto de investigación reproducible (semilla y paso documentados) más que como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-4B-Instruct-2507); detalles de capas y atención no disponibles |
| Parametros totales | 4.022.468.096 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base; consultar la ficha de Qwen/Qwen3-4B-Instruct-2507) |
| Tipos de cuantizacion | No se publican artefactos cuantizados; los pesos se distribuyen en BF16. Conversion a FP8/INT8/GGUF no disponible en el repositorio |
| Idiomas soportados | No disponibles (la model card no los declara) |
| Licencia | Apache 2.0 |
| Formato de pesos | `safetensors` (export BF16 para `transformers`) + checkpoint nativo veRL/FSDP en `original_checkpoint/` |

## Arquitectura y entrenamiento

La arquitectura corresponde a la del modelo base Qwen3-4B-Instruct-2507, un transformer denso de aproximadamente 4.000 millones de parámetros. No se aportan en la información disponible detalles sobre número de capas, configuración de atención, vocabulario ni estrategia de posiciones; estos datos deben consultarse en la ficha del modelo base. El checkpoint publicado es un fine-tune, por lo que hereda la tokenizer y la estructura de pesos del original.

Respecto al entrenamiento, la model card es mínima: indica el identificador de la ejecución (`261017_medicine_static_pilot_seed42`), el paso del checkpoint (95) y la semilla (42). La presencia de `original_checkpoint/` con ficheros nativos de veRL/FSDP indica que el entrenamiento se ejecutó con el framework veRL sobre FSDP, habitual en pipelines de ajuste por refuerzo (RLHF/GRPO y variantes) y de fine-tuning distribuido. No se especifican tokens de entrenamiento, composición del dataset, uso de RLHF/DPO, hiperparámetros ni innovaciones técnicas. El propio autor indica que el checkpoint local se elimina solo tras verificar tamaños y hashes SHA256 de todos los ficheros remotos, lo que sugiere un proceso de publicación automatizado y verificado. El tamaño del repositorio (25,7 GB) es coherente con pesos BF16 (~8 GB) más estados de optimizador y checkpoints de FSDP.

## Capacidades

- Generación de texto conversacional, heredada del modelo base instruido.
- Razonamiento y respuesta a instrucciones en formato chat (pipeline `text-generation`, tag `conversational`).
- Adaptación declarada al dominio médico, según el nombre del experimento; el alcance real de dicha adaptación no está documentado.
- Compatibilidad con Transformers, Text Generation Inference (TGI) y endpoints compatibles.
- Soporte de tool calling / function calling: no disponible en la información proporcionada (depende del modelo base; no verificado en este checkpoint).
- Capacidades de agente y razonamiento multi-paso: no verificadas en este checkpoint.
- Capacidades multimodales (visión, audio): no disponibles; el modelo es exclusivamente de texto.
- Modo "thinking" explícito: no disponible en la información proporcionada.
- Cobertura multilingüe: no declarada por el autor.

## Casos de uso

- Investigación reproducible en ajuste de dominio médico: el checkpoint incluye semilla, paso y artefactos nativos de veRL/FSDP, lo que permite replicar o auditar la ejecución y comparar el efecto del paso 95 frente al modelo base.
- Procesamiento de documentación clínica en entorno controlado: resumen de notas de evolución o informes de alta en un pipeline interno, con revisión humana obligatoria y validación previa contra el modelo base para detectar regresiones.
- Extracción de entidades y estructuración de texto médico: convertir texto libre (motivo de consulta, antecedentes, medicación) en campos estructurados, midiendo precisión frente a un extractor basado en el modelo original.
- Preguntas y respuestas sobre guías de práctica clínica o protocolos internos: el modelo puede servir de base para un sistema RAG, siempre que se evalúe la fidelidad de las respuestas y se citen las fuentes recuperadas.
- Generación de datos sintéticos para NLP clínico: creación de ejemplos anotados o variantes parafraseadas de informes para entrenar otros modelos, con filtrado y revisión por especialistas.
- Evaluación comparativa de seguridad: usar este checkpoint como sujeto de pruebas en baterías de red-teaming clínico (alucinaciones de dosis, diagnósticos inventados, sesgos) frente a su modelo base.
- Ajuste adicional (continued fine-tuning) como punto de partida: al estar en Apache 2.0 y en formato Transformers estándar, puede reutilizarse como inicialización para experimentos posteriores del mismo grupo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K, evaluaciones clínicas ni comparaciones con el modelo base.

## Requisitos de hardware

- Pesos en BF16: aproximadamente 8,05 GB (4.022.468.096 parámetros × 2 bytes), sin contar overhead de runtime ni caché KV.
- VRAM estimada para inferencia en BF16: en torno a 10-12 GB con contextos moderados; el consumo de caché KV crece linealmente con la longitud de contexto y el número de secuencias concurrentes, por lo que contextos muy largos exigen más memoria.
- VRAM estimada en cuantización de 8 bits: ~5 GB de pesos; en 4 bits: ~2,5-3 GB. No obstante, el repositorio no publica artefactos cuantizados, por lo que habría que generarlos.
- GPU recomendadas: A100 40/80 GB o H100 para servicio de alta concurrencia y contextos largos; L40S o RTX 4090 (24 GB) para inferencia BF16 de una sola instancia con holgura; RTX 3090 (24 GB) equivalente.
- GPU de consumo: sí cabe en tarjetas de 24 GB en BF16 y en tarjetas de 12 GB (RTX 3060, RTX 4070) si se cuantiza a 8 o 4 bits, con contextos reducidos.
- Fine-tuning completo: requiere mucho más que la inferencia (estados de optimizador y activaciones); el repositorio de 25,7 GB con checkpoints FSDP da una idea del orden de magnitud. Para ajuste en una sola GPU conviene LoRA/QLoRA.
- Opciones de despliegue: `transformers` (soporte nativo declarado), TGI (tag `text-generation-inference`), vLLM (requiere verificar compatibilidad de la arquitectura Qwen3 en la versión desplegada) y endpoints compatibles. llama.cpp/Ollama no están disponibles de forma directa: haría falta convertir los pesos a GGUF.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Este checkpoint (qwen3-4b-medicine-static-pilot, step 95) | 4,02 B | No disponible en la ficha | Apache 2.0 | Fine-tune experimental, sin benchmarks ni descargas; incluye checkpoint veRL/FSDP |
| Qwen/Qwen3-4B-Instruct-2507 (modelo base) | ~4 B | Contexto largo declarado por Qwen (consultar ficha oficial) | Apache 2.0 | Modelo instruido no-thinking, ampliamente evaluado y desplegable en vLLM/TGI |
| Qwen3-4B-Thinking-2507 | ~4 B | Contexto largo declarado por Qwen (consultar ficha oficial) | Apache 2.0 | Variante con razonamiento explícito; útil como referencia si se busca "thinking mode" |
| Llama 3.1 8B Instruct | ~8 B | 128k (según ficha oficial de Meta) | Licencia comunitaria Llama 3.1 | Mayor tamaño y mayor coste de inferencia; licencia con restricciones adicionales |
| Gemma 3 4B Instruct | ~4 B | 128k (según ficha oficial de Google) | Licencia Gemma | Alternativa de tamaño comparable, con términos de uso propios |

La comparación relevante es contra el modelo base: sin métricas publicadas no es posible determinar si el ajuste de dominio aporta mejoras o introduce regresiones.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay benchmarks, ni evaluación clínica, ni comparación con el modelo base; no se puede afirmar que el ajuste mejore el rendimiento en medicina.
- Riesgo alto de alucinación en dominio médico: cualquier salida sobre dosis, diagnósticos, interacciones farmacológicas o protocolos debe verificarse por personal sanitario cualificado.
- No es un producto sanitario: no dispone de marcado CE ni de validación regulatoria (MDR/FDA); su uso en decisiones clínicas no está autorizado.
- Idiomas no declarados: se desconoce si el ajuste ha degradado el rendimiento en castellano o en otros idiomas respecto al modelo base.
- Contexto no documentado en la ficha: la longitud efectiva soportada tras el fine-tune no está verificada.
- Checkpoint intermedio (paso 95) de un piloto: no es un modelo final; puede presentar inestabilidades propias de un entrenamiento corto.
- Sesgos: no documentados; se heredan los del modelo base y los del dataset de ajuste, que no se describe.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; la responsabilidad legal del despliegue recae en el integrador.
- Sin descargas ni validación de la comunidad en el momento de la ficha; tratar como artefacto de investigación.
- El repositorio incluye checkpoints nativos de entrenamiento (25,7 GB), no solo pesos de inferencia: hay que seleccionar los ficheros correctos para desplegar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HYU-NLP-EVA2/qwen3-4b-medicine-static-pilot-261017-seed42-step-095
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Framework veRL (mencionado en la model card a través de los checkpoints nativos): https://github.com/volcengine/verl
- Paper, blog, repositorio o demo adicionales: no disponibles en la información proporcionada.
