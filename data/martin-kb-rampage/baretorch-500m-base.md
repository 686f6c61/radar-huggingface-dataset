# martin-kb-rampage/BareTorch-500M-Base

## Resumen

BareTorch-500M-Base es un modelo de lenguaje causal de tipo híbrido desarrollado por martin-kb-rampage, que combina capas recurrentes CS-LRAD (Chunk-State Low-Rank Associative Delta) con capas de atención multi-cabeza Transformer estándar. Su objetivo principal es ofrecer una alternativa eficiente en memoria y velocidad de decodificación para contextos largos, manteniendo un tamaño compacto de aproximadamente 500 millones de parámetros (593 millones en el checkpoint real). El modelo está diseñado para ejecutarse en hardware de consumo, como GPUs NVIDIA y Apple Silicon, y se distribuye bajo licencia Apache 2.0.

La arquitectura híbrida reduce el crecimiento del cache de claves y valores (KV-cache) de O(N) a estados de chunk acotados, lo que permite mantener velocidades de decodificación altas y un consumo de VRAM reducido incluso con ventanas de contexto de hasta 32.768 tokens. Según las pruebas publicadas por el autor, BareTorch-500M-Base supera en velocidad y eficiencia a modelos Transformer de tamaño similar o mayor, como SmolLM2-1.7B, Qwen3-0.6B o Gemma-2-2B, en tareas de generación con contexto largo. El modelo es un base (no instructivo) y está pensado para ser fine-tuneado o utilizado como componente en sistemas de generación de texto en inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: capas recurrentes CS-LRAD + capas Transformer con atención multi-cabeza |
| Parametros totales | 593.051.328 (según safetensors) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | No disponible (se menciona BF16 y FP16 en benchmarks, pero no se especifican cuantizaciones oficiales) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

BareTorch-500M-Base emplea una arquitectura híbrida que intercala capas CS-LRAD y capas Transformer. En concreto, el modelo tiene 24 capas en total, organizadas en un patrón de 3 capas CS-LRAD seguidas de 1 capa Transformer, repetido. La dimensión oculta es de 1152, con 16 cabezas de atención (d_head = 72). Las capas CS-LRAD utilizan un rango bajo de 8 y un tamaño de chunk de 32, lo que permite mantener un estado recurrente acotado y reducir el coste de memoria del KV-cache. El vocabulario es de 49.152 tokens, basado en el tokenizer de SmolLM2-360M.

No se han publicado detalles sobre el conjunto de datos de entrenamiento, el número de tokens procesados ni el método de alineación (RLHF, DPO, etc.). El modelo se presenta como base, por lo que no ha sido fine-tuneado para instrucciones. La innovación principal reside en el diseño de las capas CS-LRAD, que combinan una actualización de estado de bajo rango con una operación asociativa delta, logrando una complejidad subcuadrática en la longitud de secuencia. Esto permite mantener un rendimiento competitivo en tareas de lenguaje natural con un coste computacional y de memoria significativamente menor que un Transformer puro de tamaño equivalente.

## Capacidades

- Generación de texto causal en inglés: el modelo es capaz de producir texto coherente y contextualmente relevante, como cualquier LM causal de su tamaño.
- Razonamiento de sentido común y conocimiento general: los benchmarks publicados (MMLU, ARC, HellaSwag, Winogrande) indican un rendimiento moderado, acorde a su escala.
- Eficiencia en contexto largo: gracias a la arquitectura CS-LRAD, mantiene velocidades de decodificación altas y bajo consumo de VRAM incluso con 32.768 tokens de contexto, superando a Transformers de tamaño similar.
- Compatibilidad con el framework BareTorch: el modelo se integra con la librería BareTorch, que permite cargarlo y ejecutarlo fácilmente en PyTorch.
- No se mencionan capacidades de tool calling, agentes, visión, audio ni modos de razonamiento explícitos. Es un modelo puramente textual.

## Casos de uso

- Generación de texto en tiempo real en dispositivos edge: gracias a su baja huella de VRAM y alta velocidad de decodificación, puede ejecutarse en móviles o dispositivos con recursos limitados para completar texto, redactar correos o generar respuestas cortas.
- Asistentes conversacionales con contexto largo: su ventana de 32.768 tokens permite mantener historiales de conversación extensos sin degradar el rendimiento, siendo adecuado para chatbots que necesitan recordar interacciones previas.
- Preprocesamiento de texto y aumentación de datos: como modelo base, puede utilizarse para generar variaciones de texto, completar fragmentos o crear datos sintéticos para entrenar otros modelos.
- Prototipado rápido de aplicaciones NLP: al ser pequeño y eficiente, es ideal para validar ideas o construir demos sin necesidad de infraestructura costosa.
- Investigación en arquitecturas eficientes: su diseño híbrido CS-LRAD + Transformer lo convierte en un banco de pruebas para estudiar el equilibrio entre rendimiento y eficiencia en modelos de lenguaje.
- Despliegue en entornos con restricciones de memoria: por ejemplo, en servidores con GPUs de gama media o en configuraciones multi-tenant donde el consumo de VRAM es crítico.

## Benchmarks y rendimiento

La model card publica resultados de benchmarks de lenguaje en modo zero-shot:

| Benchmark | Métrica | Score |
|---|---|---|
| MMLU (promedio 57 materias) | Accuracy | 24,70% |
| ARC Challenge | Acc (Norm) | 28,92% |
| ARC Easy | Acc (Norm) | 53,58% |
| HellaSwag | Acc (Norm) | 43,69% |
| Winogrande | Accuracy | 51,30% |

Además, se incluyen comparativas de eficiencia en hardware real:

| Contexto | Modelo comparado | Métrica | BareTorch | Baseline | Ventaja |
|---|---|---|---|---|---|
| 32.768 | SmolLM2-1.7B (RTX GPU) | Decode Speed | 98,9 tok/s | 15,8 tok/s | 6,26x más rápido |
| 32.768 | SmolLM2-1.7B (RTX GPU) | VRAM | 4.394 MB | 15.572 MB | 71,8% ahorro |
| 32.768 | Qwen3-0.6B (RTX GPU) | Decode Speed | 164,5 tok/s | 13,2 tok/s | 12,51x más rápido |
| 32.768 | Qwen3-0.6B (RTX GPU) | VRAM | 1.660 MB | 8.577 MB | 80,6% ahorro |
| 32.768 | Gemma-2-2B (RTX GPU) | Ejecución | 101,5 tok/s | OOM | Evita fallo |
| 32.768 | SmolLM2-1.7B (Apple M1) | Decode Speed | 27,7 tok/s | 1,6 tok/s | 16,87x más rápido |
| 32.768 | SmolLM2-1.7B (Apple M1) | VRAM | 3.778 MB | 9.973 MB | 62,1% ahorro |
| 32.768 | Llama-3.2-1B (Apple M1) | Decode Speed | 36,9 tok/s | 6,6 tok/s | 5,57x más rápido |
| 32.768 | Qwen3-0.6B (Apple M1) | Ejecución | 65,2 tok/s | OOM | Evita fallo |

Estos datos provienen de la model card y no han sido verificados de forma independiente.

## Requisitos de hardware

- VRAM estimada: según los benchmarks, con contexto de 32.768 tokens y BF16, el modelo consume aproximadamente 4.394 MB en una GPU RTX (comparado con SmolLM2-1.7B) y 1.660 MB en el caso de Qwen3-0.6B. En Apple Silicon (FP16), consume 3.778 MB. Esto sugiere que cabe en GPUs con 4 GB o más de VRAM.
- GPUs recomendadas: cualquier GPU NVIDIA con al menos 4 GB de VRAM (RTX 3050, RTX 3060, etc.) o Apple Silicon con 8 GB de RAM unificada. También puede ejecutarse en CPU, aunque con menor rendimiento.
- Opciones de despliegue: el modelo se carga mediante la librería BareTorch (BareTorchForCausalLM) y es compatible con el ecosistema HuggingFace Transformers para el tokenizador. No se mencionan integraciones con vLLM, llama.cpp u Ollama, pero al ser safetensors podría convertirse a otros formatos.
- Latencia y throughput: los benchmarks muestran velocidades de decodificación de 98,9 a 164,5 tok/s en RTX GPU y de 27,7 a 65,2 tok/s en Apple M1, dependiendo del hardware y la configuración.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | MMLU (zero-shot) | Eficiencia en contexto largo |
|---|---|---|---|---|---|
| BareTorch-500M-Base | 593M | 32.768 | Apache 2.0 | 24,70% | Muy alta (CS-LRAD) |
| SmolLM2-1.7B | 1.7B | 8.192 (ampliable) | Apache 2.0 | ~30% (estimado) | Baja (Transformer puro) |
| Qwen3-0.6B | 0.6B | 32.768 | Apache 2.0 | ~25% (estimado) | Media (Transformer con atención lineal) |
| Gemma-2-2B | 2B | 8.192 | Gemma license | ~35% (estimado) | Baja (Transformer puro) |

Los datos de MMLU para los modelos comparados son estimaciones basadas en publicaciones públicas, no en mediciones directas. La ventaja principal de BareTorch-500M-Base es su eficiencia en memoria y velocidad con contextos largos, superando a modelos más grandes en ese aspecto.

## Limitaciones y advertencias

- Es un modelo base, no instructivo: no está alineado para seguir instrucciones ni para diálogo, por lo que requiere fine-tuning para tareas específicas.
- Rendimiento en benchmarks de conocimiento general limitado: MMLU 24,70% es bajo en comparación con modelos más grandes, lo que indica que su capacidad de razonamiento y conocimiento es limitada.
- Solo soporta inglés: no se ha entrenado para otros idiomas, lo que restringe su uso en aplicaciones multilingües.
- Riesgo de alucinación y sesgos: como cualquier LM, puede generar información falsa o reflejar sesgos presentes en los datos de entrenamiento, aunque no se han documentado específicamente.
- Dependencia del framework BareTorch: para cargar el modelo se requiere la librería BareTorch, que puede no estar tan extendida como otros frameworks de inferencia.
- No se han publicado detalles sobre el dataset de entrenamiento ni el proceso de alineación, lo que dificulta evaluar su robustez y posibles sesgos.
- La licencia Apache 2.0 permite uso comercial, pero es recomendable revisar los términos de la licencia del tokenizador (SmolLM2-360M) si se utiliza en producción.

## Enlaces

- HuggingFace: https://huggingface.co/martin-kb-rampage/BareTorch-500M-Base
- Repositorio GitHub de BareTorch: https://github.com/martin-kbcc/baretorch
- Sitio web comercial de BareTorch: https://www.model-rampage.com/
