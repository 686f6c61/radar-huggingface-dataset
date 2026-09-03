# EInnovator/pra-qwen3-4b-mlx-8bit

## Resumen

El repositorio `EInnovator/pra-qwen3-4b-mlx-8bit` no contiene un modelo de lenguaje completo, sino un *bundle* de runtime para Progressive Retrieval Attention (PRA) aplicado al modelo base `mlx-community/Qwen3-4B-8bit`, una versión cuantizada a 8 bits de Qwen3-4B en formato MLX. Desarrollado por EInnovator, este paquete empaqueta el mapeo estructural específico del modelo, perfiles de ejecución, componentes aprendidos opcionales, metadatos de compatibilidad y evidencia de calificación medida. No incluye los pesos del modelo base ni es un fine-tune LoRA convencional.

PRA es una técnica de atención que reduce el número de tokens visibles durante la generación, seleccionando dinámicamente los pares clave-valor (K/V) más relevantes del contexto. Esto permite manejar ventanas de contexto largas con menor coste computacional y de memoria. En las pruebas reportadas, el bundle logra una reducción del 91,5 % en tokens visibles y una mejora del 9,2 % en el tiempo hasta el primer token (TTFT) sin degradar la calidad medida en el workload combinado. La relevancia actual radica en que ofrece una vía para desplegar modelos de 4B en hardware Apple Silicon con contextos extensos y latencia reducida, aunque su estado de madurez es limitado: solo el perfil BALANCED tiene mediciones completas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3ForCausalLM (modelo base) |
| Parametros totales | 4B (modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (orientado a long-context, sin valor especificado) |
| Tipos de cuantizacion | 8-bit (modelo base MLX) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | no aplica (bundle de runtime sin pesos; el modelo base usa formato MLX) |

## Arquitectura y entrenamiento

El bundle se construye sobre `mlx-community/Qwen3-4B-8bit`, un modelo causal de 4B parámetros con arquitectura Qwen3ForCausalLM, cuantizado a 8 bits y adaptado al ecosistema MLX de Apple. El componente PRA introduce un mecanismo de atención progresiva que reduce los tokens visibles durante la inferencia, seleccionando dinámicamente los K/V tokens relevantes. El repositorio incluye el mapeo estructural, perfiles de runtime (QUALITY, BALANCED, ECONOMY, QASPER-LEARNED) y adaptadores opcionales, aunque estos últimos no han sido evaluados en las pruebas reportadas.

Los datos de entrenamiento no se detallan, pero los conjuntos de evaluación mencionados son `2wikimultihopqa`, `hotpotqa`, `qasper` y un conjunto combinado (`combined`), todos orientados a preguntas y respuestas multi-hop sobre documentos. No se especifica si hubo fases de RLHF o DPO; la model card indica únicamente "pretrained and post-trained" para el modelo base. La innovación técnica principal es la reducción de tokens visibles mediante PRA, que en el workload combinado pasa de 396,3 tokens a 33,5 tokens, una disminución del 91,5 %.

## Capacidades

- Generación de texto con contexto largo gracias a la reducción de tokens visibles mediante PRA.
- Mejora de la latencia de primer token (TTFT) en aproximadamente un 9 % en el perfil BALANCED.
- Compatibilidad con el motor MLX para Apple Silicon (probado en Apple M4 Pro).
- Soporte de adaptadores opcionales (aunque no se han evaluado en el bundle publicado).
- Capacidad de procesar consultas multi-hop sobre documentos (evaluado en 2wikimultihopqa, hotpotqa y qasper).
- No se documentan capacidades de tool calling, agentes, visión ni audio.

## Casos de uso

- Preguntas y respuestas multi-hop sobre documentos extensos: el bundle reduce los tokens visibles de 396 a 33 en el workload combinado, lo que permite procesar contextos largos con menor uso de memoria y latencia, adecuado para sistemas de QA sobre corpus amplios.
- Despliegue en hardware Apple Silicon con MLX: el smoke test se realizó en un MacBook Pro con M4 Pro y 48 GB, con una memoria pico de 4,03 GiB, lo que indica que puede ejecutarse en equipos de consumo de Apple.
- Reducción de costes de inferencia en servicios de generación con contexto largo: al disminuir los tokens visibles, se reduce el coste computacional por petición, útil para aplicaciones de chat o resumen con historiales extensos.
- Integración en pipelines de RAG (retrieval-augmented generation): la selección dinámica de K/V tokens puede complementar sistemas de recuperación, priorizando la información relevante del contexto recuperado.
- Evaluación de técnicas de atención eficiente en investigación: el bundle proporciona evidencia medida y perfiles configurables, útil para experimentos comparativos sobre atención progresiva.
- Prototipado rápido de aplicaciones long-context en entornos con memoria limitada: al no requerir los pesos completos (el bundle es ligero), se puede probar PRA sobre Qwen3-4B sin necesidad de almacenar el modelo base adicional.

## Benchmarks y rendimiento

La model card reporta resultados para el workload combinado (`combined`, n=60) en el perfil BALANCED con el motor mlx-lm. No se proporcionan comparaciones con otros modelos.

| Metrica | Unidad | No PRA | PRA - No Adaptor | Delta |
|---|---|---|---|---|
| Token F1 | fraccion | 0,1315 | 0,1315 | +0,0000 |
| Exact Match | fraccion | 0 | 0 | +0 |
| Gold Answer Log Probability | log_prob | -20,1859 | -20,1859 | +0,0000 |
| Visible Tokens | token | 396,317 | 33,5167 | -362,8 (-91,54 %) |
| Selected Native K/V Tokens | token | 0 | 362,8 | +362,8 |
| TTFT p50 | ms | 112,525 | 102,135 | -10,39 (-9,23 %) |
| TTFT p95 | ms | 130,114 | 115,365 | -14,75 (-11,34 %) |
| TTFT p99 | ms | 136,158 | 127,489 | -8,67 (-6,37 %) |
| ITL p50 | ms | 19,181 | 20,053 | +0,87 (+4,55 %) |
| ITL p95 | ms | 20,404 | 20,961 | +0,56 (+2,73 %) |
| ITL p99 | ms | 20,643 | 22,191 | +1,55 (+7,50 %) |
| Output Tokens Per Second | token/s | 43,666 | 42,837 | -0,83 (-1,90 %) |
| Completion Latency Mean | ms | 550,365 | no disponible | no disponible |

La calidad medida es baja (Token F1 de 0,13), pero idéntica entre baseline y PRA, lo que indica que la reducción de contexto no degrada el rendimiento en este workload. No se han publicado resultados de benchmarks en la informacion disponible más allá de esta tabla.

## Requisitos de hardware

- VRAM estimada: 4,03 GiB de memoria pico durante el smoke test (carga y generación acotada) en Apple M4 Pro con 48 GB.
- GPU recomendadas: Apple Silicon (probado en M4 Pro); no se proporcionan datos para GPUs NVIDIA o AMD.
- Compatibilidad con hardware de consumo: sí, un MacBook Pro con 48 GB es suficiente; probablemente también funcione en configuraciones con menos memoria, aunque no se ha verificado.
- Opciones de despliegue: motor MLX (mlx-lm 0.31.3); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: TTFT p50 de 102 ms y 42,8 tokens/s de salida en el perfil BALANCED (hardware M4 Pro).

## Comparativa con modelos similares

No disponible. No se han encontrado comparaciones con otros modelos de la misma categoría (bundle de runtime PRA o modelos long-context similares) en la informacion proporcionada.

## Limitaciones y advertencias

- El repositorio no contiene los pesos del modelo; es un bundle de runtime que requiere el modelo base `mlx-community/Qwen3-4B-8bit` para funcionar.
- Solo el perfil BALANCED tiene mediciones completas; los perfiles QUALITY, ECONOMY y QASPER-LEARNED están pendientes de calibración o ejecución.
- La calidad medida en el workload combinado es baja (Token F1 de 0,13), aunque idéntica al baseline; no hay evidencia de rendimiento en tareas generales de lenguaje.
- El adaptador opcional (PRA - Adaptor Bundle) no ha sido evaluado en las pruebas reportadas; su impacto real es desconocido.
- No se especifican limitaciones de idioma ni sesgos; la model card no proporciona información sobre estos aspectos.
- La licencia Apache 2.0 se aplica al bundle, pero el modelo base Qwen3-4B puede tener restricciones adicionales; se debe verificar la licencia del modelo base antes de uso comercial.
- El bundle está orientado exclusivamente al ecosistema MLX; no es compatible con otros motores de inferencia sin adaptación.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/EInnovator/pra-qwen3-4b-mlx-8bit
- Modelo base: https://huggingface.co/mlx-community/Qwen3-4B-8bit (referenciado en la model card, sin URL directa en la informacion proporcionada)
