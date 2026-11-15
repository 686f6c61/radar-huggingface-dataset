# arinltte/torchcast-decision-4B-MLX-8bit

## Resumen

Torchcast Decision 4B — MLX 8-bit es una cuantización de 8 bits en formato MLX del modelo `torchcast-ai/torchcast-decision-4b`, publicada por el usuario `arinltte`. El modelo base es un derivado de Qwen3.5-4B con arquitectura híbrida (24 capas Gated-DeltaNet y 8 capas de atención completa) y está especializado en un caso de uso muy concreto: la emisión de decisiones tipadas (*typed decisions*). No genera texto libre; en una única pasada hacia delante lee la letra de respuesta del último token del prompt.

La relevancia de esta variante es práctica: permite ejecutar el modelo en Apple Silicon con un peso de 6,69 GB frente a los 9,68 GB de la versión BF16, manteniendo una precisión prácticamente idéntica en el benchmark Typed Decisions (0,7190 frente a 0,7185). El autor advierte de una limitación importante: la torre de visión del modelo original (unos 0,33 B de parámetros, ~6 % del total) se descarta en la conversión a MLX, por lo que esta versión es solo texto.

El modelo tiene 4.841.448.960 parámetros reales (4,84 B), licencia Apache 2.0, y solo soporta inglés. Está pensado para investigadores y desarrolladores que necesiten un motor de decisión probabilística local y ligero, no para generación de texto conversacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido Qwen3.5: 24 capas Gated-DeltaNet + 8 capas de atención completa |
| Parametros totales | 4.841.448.960 (4,84 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 8-bit afín, `group_size: 64`; bits efectivos 11,05 por peso (normas, `lm_head` e internos de recurrencia Gated-DeltaNet en bf16) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base es un Qwen3.5-4B híbrido que combina 24 capas Gated-DeltaNet (un mecanismo de recurrencia con estado lineal, sensible numéricamente) con 8 capas de atención completa. La versión MLX conserva en bf16 las normas, el `lm_head` y todos los internos de la recurrencia Gated-DeltaNet (`A_log`, `dt_bias`, `conv1d`, `in_proj_[qkv/z/a/b]`, `out_proj`, `linear_attn.norm`) porque cuantizarlos altera las decisiones. El resto de pesos se cuantiza a 8 bits afín con `group_size: 64`, lo que da un promedio efectivo de 11,05 bits por peso.

El modelo original es un modelo visión-lenguaje (`Qwen3_5ForConditionalGeneration`), pero MLX-LM no implementa la torre de visión de Qwen3.5, por lo que `mlx_lm.convert` descarta silenciosamente `model.visual.*` (0,33 B de parámetros). La conversión no reentrena ni aplica RLHF/DPO adicional: es una cuantización post-entrenamiento. El detalle técnico clave es que las decisiones se ejecutan con atención **no causal**, algo que la generación estándar de MLX-LM no aplica; el arnés del autor (`scripts/mlx_decide.py`) reproduce ese modo de atención y la lectura de la letra de respuesta.

## Capacidades

- Emisión de decisiones tipadas: una pasada hacia delante y lectura de la letra de respuesta desde el último token del prompt (no genera texto).
- Salida probabilística calibrada sobre un conjunto de opciones (letras), con métricas de accuracy, KL, Brier y ECE.
- Razonamiento de opción múltiple sobre casos del benchmark Typed Decisions.
- Solo texto: la entrada de imagen **no está disponible** en esta versión MLX (la torre de visión se descarta en la conversión).
- No soporta tool calling ni function calling de forma nativa (no es un modelo generativo conversacional).
- No está diseñado para agentes multi-paso ni para razonamiento multi-turno generativo.
- Multilingüe: no; únicamente inglés.

## Casos de uso

- **Clasificación de decisiones con opciones cerradas**: dado un prompt con varias alternativas etiquetadas (A, B, C…), el modelo devuelve la letra más probable y su distribución. Adecuado porque su readout está diseñado exactamente para eso y no requiere decodificación autoregresiva.
- **Enrutamiento y triaje local en Apple Silicon**: integrado en un pipeline que necesite decidir entre rutas o categorías con un modelo de 6,69 GB que cabe en un Mac con memoria unificada, sin depender de la nube.
- **Evaluación de calibración probabilística**: investigadores que estudien ECE, Brier o KL pueden usar el modelo como sujeto de prueba con el benchmark Typed Decisions y su función de scoring propia.
- **Sistemas de votación o ensemble de decisiones**: al producir una distribución sobre letras, puede combinarse con otros clasificadores mediante agregación probabilística.
- **Prototipado de investigación en arquitecturas híbridas**: sirve para estudiar el comportamiento de las capas Gated-DeltaNet en tareas de decisión, dado que el autor mantiene esos internos en bf16 por su sensibilidad numérica.
- **Validación de cuantizaciones**: el propio autor publica variantes BF16, 8-bit y 4-bit con métricas comparables, lo que permite usar este repo como referencia para estudiar el impacto de la cuantización en decisiones (solo cambian 16 de 2000 decisiones respecto a BF16).
- **Filtrado previo en pipelines de anotación**: para descartar o priorizar casos antes de un revisor humano, siempre que el dominio esté en inglés y las opciones sean discretas.

## Benchmarks y rendimiento

Resultados sobre el split `test` del benchmark Typed Decisions (400 casos × 5 preguntas = 2000 decisiones), con la función de scoring del propio benchmark:

| Variante | Accuracy ↑ | KL ↓ | Brier ↓ | ECE ↓ | Tamano |
|---|---|---|---|---|---|
| BF16 | 0,7185 | 0,2884 | 0,1405 | 0,0645 | 9,68 GB |
| **8-bit (este repo)** | 0,7190 | 0,2907 | 0,1415 | 0,0635 | 6,69 GB |
| 4-bit | 0,7245 | 0,2783 | 0,1342 | 0,0480 | 5,09 GB |

Referencias del leaderboard: Prior = 0,470; Uniform = 0,308. Respecto a BF16, cambian 16 de 2000 decisiones (0,8 %), con un máximo |Δprobabilidad| de 0,60 en casos casi empatados.

## Requisitos de hardware

- **VRAM/memoria**: el repo ocupa 6,7 GB; en la práctica se necesita memoria unificada suficiente para cargar los pesos más el estado de la recurrencia y el arnés de decisión. No se han publicado cifras exactas de memoria en ejecución.
- **GPU recomendadas**: Apple Silicon (requisito de MLX). No hay soporte indicado para CUDA.
- **Consumer GPU**: no aplica en el sentido habitual; el destino es Mac con memoria unificada. No se especifican modelos mínimos de chip.
- **Opciones de despliegue**: MLX-LM (`mlx_lm`) para carga de pesos, más el paquete original `torchcast_decision` para el renderizado del prompt y la lectura de la letra. El autor proporciona `scripts/mlx_decide.py` y `scripts/bench.py`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- **Latencia y throughput**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| torchcast-decision-4B-MLX-8bit (este) | 4,84 B | no disponible | Apache 2.0 | safetensors MLX | Solo texto; accuracy 0,7190 en Typed Decisions; 6,69 GB |
| torchcast-decision-4B-MLX (BF16) | 4,84 B | no disponible | Apache 2.0 | safetensors MLX | Solo texto; accuracy 0,7185; 9,68 GB |
| torchcast-decision-4B-MLX-4bit | 4,84 B | no disponible | Apache 2.0 | safetensors MLX | Solo texto; accuracy 0,7245; 5,09 GB |
| torchcast-ai/torchcast-decision-4b (original) | 4,84 B + 0,33 B visión | no disponible | Apache 2.0 | safetensors | Visión-lenguaje completa; referencia para entradas de imagen |

No se dispone de comparación con modelos de otras familias en la información proporcionada.

## Limitaciones y advertencias

- **Sin visión**: la torre visual se descarta en la conversión a MLX; para entradas de imagen hay que usar el checkpoint original.
- **No genera texto**: es un motor de decisión de una sola pasada; no sirve para chat, resumen ni generación libre.
- **Solo inglés**: no se ha validado ni se declara soporte para otros idiomas.
- **Atención no causal**: la generación estándar de MLX-LM no aplica este modo; usar el arnés del autor es obligatorio para reproducir resultados.
- **Sensibilidad numérica**: cuantizar los internos de Gated-DeltaNet altera las decisiones, de ahí que se mantengan en bf16; cualquier modificación adicional de la cuantización debe revalidarse.
- **Riesgo de alucinación**: no documentado explícitamente, pero al ser un modelo de clasificación sobre opciones cerradas el riesgo se traslada a elecciones erróneas con alta confianza; conviene vigilar la calibración (ECE 0,0635).
- **Sesgos**: no se documentan sesgos específicos en la información disponible.
- **Licencia**: Apache 2.0 permite uso comercial, pero debe respetarse la licencia del modelo base y del paquete `torchcast_decision`.
- **Madurez**: repo con 0 descargas y 0 likes en el momento de la consulta; tratar como artefacto de investigación, no como componente de producción validado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/arinltte/torchcast-decision-4B-MLX-8bit
- Modelo base: https://huggingface.co/torchcast-ai/torchcast-decision-4b
- Variante BF16: https://huggingface.co/arinltte/torchcast-decision-4B-MLX
- Variante 4-bit: https://huggingface.co/arinltte/torchcast-decision-4B-MLX-4bit
- Dataset del benchmark: https://huggingface.co/datasets/LocalLLaMA/typed-decisions
