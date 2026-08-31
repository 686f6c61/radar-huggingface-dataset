# evsinlb/Qwen3.8-27B-oQ8e-mtp

## Resumen

El modelo `evsinlb/Qwen3.8-27B-oQ8e-mtp` es una cuantización en 8 bits del modelo Qwen3.8-27B de Alibaba, realizada con la librería oMLX (oQ v0.6.4) y publicada en formato MLX safetensors. Se trata de una versión optimizada para Apple Silicon que conserva todas las capacidades del modelo original: arquitectura híbrida Gated DeltaNet + Gated Attention, visión nativa, ventana de contexto de 262 144 tokens y modo de razonamiento (thinking) con preservación de trazas de razonamiento en el historial.

La cuantización utiliza un esquema afín de 8 bits con grupo de 64, calibrado mediante imatrix (importancia de activaciones), y mantiene los tensores flotantes en bfloat16, lo que mejora la seguridad numérica en chips M3/M4. Además, preserva los pesos de predicción multitoken (MTP) y los componentes de visión, por lo que no es una versión recortada. Aunque el nombre comercial indica "27B", los pesos reales suman 8 184 279 792 parámetros (~8,18 mil millones), un dato que conviene verificar con el fabricante.

Este artefacto es relevante para desarrolladores que trabajan con Apple Silicon y necesitan ejecutar un modelo multimodal con razonamiento avanzado y contexto muy largo en memoria unificada, sin renunciar a la velocidad de prefill que ofrece oMLX. Su licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Gated DeltaNet + Gated Attention (transformer con atención lineal y atención clásica) |
| Parametros totales | 8 184 279 792 (~8,18 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens (nativo) |
| Tipos de cuantizacion | 8 bits (grupo 64, afín, calibrado con imatrix); existen hermanos en 6 y 4 bits |
| Idiomas soportados | No disponible en la ficha; se espera multilingüe al ser derivado de Qwen3.8 |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX safetensors (bf16 para tensores flotantes) |

## Arquitectura y entrenamiento

La arquitectura del modelo base Qwen3.8-27B combina capas de Gated DeltaNet (una variante de atención lineal eficiente) con capas de Gated Attention clásica, lo que permite manejar contextos muy largos con un coste computacional reducido. El modelo incluye un codificador de visión nativo, por lo que no es una versión de solo texto, y soporta un modo de razonamiento explícito (`thinking`) que genera trazas de razonamiento separadas del texto final, con la opción de preservarlas en el historial multi-turno.

La cuantización aplicada por oMLX utiliza una técnica de precisión mixta: los tensores cuantizados (8 bits, grupo 64, afín) se calibran con una imatrix que pondera la importancia de cada activación, y los tensores flotantes se mantienen en bfloat16, el dtype nativo del modelo original. Los pesos MTP (predicción multitoken) se conservan íntegros, lo que permite la decodificación especulativa tipo Lightning MTP. No se dispone de información sobre el entrenamiento original (número de tokens, dataset, RLHF/DPO) en la documentación proporcionada; solo se indica que es una cuantización del checkpoint oficial de Alibaba.

## Capacidades

- Generación de texto y razonamiento complejo con modo `thinking` configurable (niveles `xhigh`, `medium`, `low`).
- Tool calling / function calling fiable en sesiones multi-turno, incluso cuando las trazas de razonamiento se devuelven al historial (mejora frente a Qwen3).
- Capacidades de agente: razonamiento multi-paso y uso de herramientas en entornos tipo OpenAI/Anthropic.
- Visión nativa: procesamiento de imágenes integrado (no se detallan tareas específicas, pero el modelo base es multimodal).
- Contexto largo de 262 144 tokens, validado en pruebas de oMLX.
- Predicción multitoken (MTP) para acelerar la decodificación en modo monousuario.
- Multilingüe (heredado del modelo base, aunque no se especifican idiomas concretos en la ficha).
- Compatible con el ecosistema MLX y oMLX, incluida la ruta de prefill con ANE (Apple Neural Engine) en ciertas configuraciones.

## Casos de uso

- Asistentes de atención al cliente con contexto largo: el modelo puede mantener conversaciones de más de 200 000 tokens, gestionando historiales extensos y recuperando información de documentos previos gracias a su ventana de contexto.
- Generación de código en producción: con tool calling fiable y modo reasoning, puede integrarse en pipelines de CI/CD para autocompletar, revisar o refactorizar código, y ejecutar comandos de terminal mediante herramientas.
- Agentes autónomos multi-paso: su capacidad para preservar trazas de razonamiento en el historial lo hace adecuado para tareas de planificación y ejecución de subtareas con herramientas externas, como búsqueda web o llamadas a APIs.
- Análisis de documentos largos: con 262K de contexto, puede resumir, extraer información o responder preguntas sobre libros, informes técnicos o bases de conocimiento extensas sin necesidad de RAG.
- Procesamiento de imágenes con descripción y razonamiento: al incluir visión nativa, puede generar descripciones detalladas, responder sobre el contenido visual y combinar información visual con texto en tareas mixtas.
- Prototipado de aplicaciones locales en Mac: al estar optimizado para Apple Silicon y caber en 64 GB de RAM unificada, es útil para desarrolladores que quieren ejecutar un modelo de razonamiento sin depender de la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos medidos corresponden al rendimiento de inferencia en hardware concreto, que se detallan a continuación:

| Entorno | Prefill (pp) | Decodificación (tg) | Memoria pico |
|---|---|---|---|
| M5 Pro (20-core GPU, 64 GB), pp1024/tg128 | 404,5 tok/s | 14,0 tok/s | 33,7 GB |
| M5 Pro, pp4096/tg128 | 427,9 tok/s | 10,9 tok/s | 35,2 GB |
| M5 Pro, pp16384/tg128 | 376,6 tok/s | 18,6 tok/s | 37,2 GB |
| M2 Ultra (128 GB, GPU), 1K/4K/64K | 307/313/231 tok/s | 37/34/26,6 tok/s | no indicado |

Nota: la decodificación varía según la tasa de aceptación de MTP y es sensible al ancho de banda de memoria. En batching continuo, se observan ganancias de 1,33x y 2,39x con 2 y 4 peticiones concurrentes.

## Requisitos de hardware

- VRAM estimada: 33,7 GB en prefill de 1024 tokens, 35,2 GB en 4096 y 37,2 GB en 16384 (en Apple Silicon con memoria unificada). Para contexto de 32K o más, se recomienda aumentar el límite de memoria wired o usar KV cuantizado.
- GPU recomendadas: Apple Silicon con al menos 64 GB de RAM unificada (M3/M4 preferidos por seguridad numérica bf16; M1/M2 con versión fp16 para mayor velocidad de prefill).
- En máquinas de 32 GB se recomienda usar la versión de 4 bits (oQ4e) o 6 bits (oQ6e) disponible en repos hermanos.
- Opciones de despliegue: oMLX (motor de inferencia principal), MLX estándar, y servidores compatibles con OpenAI/Anthropic mediante gateway.
- Latencia: TTFT de 2,5 s para 1024 tokens de prefill en M5 Pro; decodificación de 10-18 tok/s en modo monousuario, mejorable con batching concurrente.
- No se soporta vLLM, TGI o llama.cpp en este formato específico (MLX), aunque el modelo base puede convertirse a GGUF si se desea.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | ~8,18 B (según pesos) | 262 144 | Original (bf16) | Apache 2.0 | safetensors / MLX |
| Qwen3.8-27B-oQ8e-mtp (este) | ~8,18 B | 262 144 | 8-bit + bf16 | Apache 2.0 | MLX safetensors |
| Qwen3.8-27B-oQ8e-fp16-mtp | ~8,18 B | 262 144 | 8-bit + fp16 | Apache 2.0 | MLX safetensors |
| Qwen3.8-27B-oQ4e-mtp | ~8,18 B | 262 144 | 4-bit + bf16 | Apache 2.0 | MLX safetensors |

La diferencia principal entre este modelo y su hermano fp16 radica en el dtype de los tensores flotantes: bf16 (más seguro numéricamente en M3/M4) frente a fp16 (más rápido en prefill en M1/M2). La versión de 4 bits reduce el tamaño a ~17 GB, adecuada para máquinas de 32 GB, a costa de una menor precisión. No se dispone de comparativas con modelos de otros fabricantes (p. ej., Llama 3.1 8B) en la documentación.

## Limitaciones y advertencias

- No se han publicado benchmarks de calidad (MMLU, HumanEval, etc.) para este artefacto cuantizado; el rendimiento real puede diferir del modelo base.
- El nombre del modelo ("27B") no coincide con los parámetros reales (~8,18 B); conviene verificar la nomenclatura con el fabricante.
- La decodificación está limitada por el ancho de banda de memoria; en máquinas con menos de 64 GB, el contexto largo puede provocar fallos de memoria.
- El modo thinking incrementa el tiempo de generación entre un 25 y un 35 % en cargas de trabajo de agente.
- La cuantización de 8 bits con grupo 64 puede introducir pérdidas de precisión en tareas numéricas o de razonamiento complejo, aunque no se han documentado casos concretos.
- No se especifican los idiomas soportados; se asume multilingüe por herencia del modelo base, pero no está confirmado en la ficha.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar la licencia del modelo base original por si hubiera cláusulas adicionales (no se han encontrado).
- El despliegue está restringido al ecosistema MLX/oMLX; no es compatible directamente con frameworks estándar como vLLM o TGI.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/evsinlb/Qwen3.8-27B-oQ8e-mtp
- Modelo base (Qwen): https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio GitHub de Qwen3.8-27B: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Sibling fp16: https://huggingface.co/evsinlb/Qwen3.8-27B-oQ8e-fp16-mtp
- Sibling 4-bit: https://huggingface.co/evsinlb/Qwen3.8-27B-oQ4e-mtp
- Sibling 6-bit: https://huggingface.co/evsinlb/Qwen3.8-27B-oQ6e-mtp
- Herramienta oQ/oMLX: https://github.com/jundot/omlx
- Benchmark oMLX (M5 Max): https://omlx.ai/benchmarks/performance/36koeucy
