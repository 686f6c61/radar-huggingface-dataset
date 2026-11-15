# arinltte/torchcast-decision-4B-MLX-4bit

## Resumen

Torchcast Decision 4B es un modelo de decisión tipada derivado de la arquitectura Qwen3.5-4B, desarrollado por torchcast-ai y distribuido en este repositorio por el usuario arinltte como una cuantización MLX de 4 bits. No es un modelo generativo de texto al uso: realiza una única pasada forward y lee la letra de respuesta del último token del prompt, devolviendo una distribución de probabilidad sobre opciones predefinidas. Esto lo orienta a tareas de clasificación y decisión estructurada más que a diálogo abierto.

El checkpoint original es un modelo visión-lenguaje (`Qwen3_5ForConditionalGeneration`) con 4.841.450.496 parámetros totales. La arquitectura combina 24 capas Gated-DeltaNet (atención lineal con recurrencia de estado) y 8 capas de atención completa, un diseño híbrido típico de la familia Qwen3.5. La versión MLX descarta la torre visual (unos 0,33 B de parámetros, ~6 % del total) porque MLX-LM no implementa esa parte, por lo que aquí solo se soportan decisiones sobre texto.

La relevancia de esta ficha reside en su naturaleza cuantizada y en las métricas publicadas: el autor reporta que la versión de 4 bits mantiene e incluso mejora ligeramente las métricas agregadas frente a BF16 en el benchmark Typed Decisions, aunque con una deriva del 5,3 % de decisiones individuales. Es un caso interesante para evaluar el impacto real de la cuantización en tareas de clasificación sensible, no en generación libre.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido Qwen3.5: 24 capas Gated-DeltaNet + 8 capas de atención completa |
| Parametros totales | 4.841.450.496 (incluye torre visual de ~0,33 B en el original, descartada en MLX) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit affine, group_size 64; efectivo 8,41 bits/peso por mantener normas, lm_head y recurrencias en bf16 |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base es un Qwen3.5 de 4B con arquitectura híbrida: 24 capas Gated-DeltaNet, un mecanismo de atención lineal con recurrencia de estado, combinadas con 8 capas de atención completa. Esta mezcla busca reducir el coste computacional y de memoria en contextos largos manteniendo capacidad de atención global en puntos clave. El checkpoint original es multimodal (visión-lenguaje), pero la conversión a MLX elimina la torre visual porque MLX-LM no dispone de implementación para ella.

La cuantización aplicada es 4-bit affine con group_size 64, pero con una decisión técnica relevante: las normas, el `lm_head` y todos los internos de recurrencia Gated-DeltaNet (`A_log`, `dt_bias`, `conv1d`, `in_proj_[qkv/z/a/b]`, `out_proj`, `linear_attn.norm`) se mantienen en bf16. El autor justifica que la recurrencia de estado es numéricamente sensible y cuantizarla altera las decisiones. El resultado es un tamaño efectivo de 8,41 bits por peso. No se dispone de información sobre el dataset de entrenamiento, número de tokens, ni si hubo RLHF o DPO en la información proporcionada.

## Capacidades

- Decisión tipada sobre opciones: una pasada forward y lectura de la letra de respuesta desde el último token del prompt, con distribución de probabilidad sobre las alternativas.
- Clasificación con incertidumbre calibrada: el benchmark reporta ECE y Brier, lo que indica que las probabilidades emitidas son interpretables.
- Procesamiento de texto en inglés exclusivamente.
- No genera texto libre: no es un modelo conversacional en el sentido habitual, aunque la pipeline declarada sea `text-generation`.
- Sin soporte de tool calling, agentes ni razonamiento multi-paso documentado.
- Sin capacidades de visión en esta versión MLX (la torre visual fue descartada en la conversión).
- Sin modo thinking ni capacidades de audio.

## Casos de uso

- Clasificación de tickets de soporte: el modelo puede asignar una categoría entre un conjunto cerrado de opciones leyendo la letra de respuesta, con probabilidades calibradas que permiten umbralizar y derivar casos ambiguos a revisión humana.
- Moderación de contenido con scores: dado un texto y un conjunto de políticas, devuelve la opción aplicable y una probabilidad, útil para priorizar colas de revisión.
- Enrutamiento de consultas en pipelines RAG: decidir qué recuperador o qué herramienta invocar según la consulta, aprovechando la lectura de opciones tipadas.
- Etiquetado semiautomático de datasets: clasificación por lotes de textos en categorías predefinidas con métricas de calibración para auditar la calidad del etiquetado.
- Evaluación de riesgo en formularios o solicitudes: decidir entre niveles de riesgo con probabilidades que alimentan un sistema de scoring posterior.
- Investigación sobre cuantización: comparar la deriva de decisiones entre BF16, 8-bit y 4-bit en un benchmark controlado, como hace el propio autor con las 2000 decisiones del split de test.
- Despliegue en Apple Silicon para prototipado: al ser MLX 4-bit con 5,09 GB, permite experimentar localmente en un Mac antes de escalar a la versión BF16 en servidor.

## Benchmarks y rendimiento

Resultados publicados por el autor en el split `test` del benchmark Typed Decisions (400 casos × 5 preguntas = 2000 decisiones), con la función de scoring del propio benchmark:

| Variante | Accuracy ↑ | KL ↓ | Brier ↓ | ECE ↓ | Tamano |
|---|---|---|---|---|---|
| BF16 | 0.7185 | 0.2884 | 0.1405 | 0.0645 | 9,68 GB |
| 8-bit | 0.7190 | 0.2907 | 0.1415 | 0.0635 | 6,69 GB |
| 4-bit (este repo) | 0.7245 | 0.2783 | 0.1342 | 0.0480 | 5,09 GB |

Referencias del leaderboard: Prior = 0,470, Uniform = 0,308. El autor advierte que las diferencias agregadas frente a BF16 están dentro del ruido de muestreo y que la diferencia real es la deriva del 5,3 % de decisiones individuales (106 de 2000), con un |Δprobabilidad| máximo de 0,62 en casos casi empatados.

## Requisitos de hardware

- VRAM estimada: 5,09 GB de pesos en 4-bit; en la práctica se necesita algo más para activaciones y estado de recurrencia, por lo que conviene reservar 6-8 GB.
- GPU recomendadas: el formato es MLX, por lo que el objetivo natural son chips Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra). No está pensado para CUDA.
- Cabe en GPU de consumo: sí, en cualquier Mac con al menos 8 GB de memoria unificada; cómodo con 16 GB o más.
- Opciones de despliegue: MLX-LM con el harness del autor (`scripts/mlx_decide.py`, `scripts/bench.py`); no es compatible directamente con vLLM, TGI ni llama.cpp por el formato y por el modo de atención no causal.
- Latencia y throughput: no disponible. El autor advierte que las decisiones usan atención no causal, que la generación estándar de MLX-LM no aplica, por lo que no se puede usar el pipeline de generación tal cual.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Torchcast Decision 4B MLX 4-bit (este) | 4,84 B | no disponible | safetensors MLX | apache-2.0 | Solo texto, decisión tipada, 5,09 GB |
| Torchcast Decision 4B MLX BF16 | 4,84 B | no disponible | safetensors MLX | apache-2.0 | Solo texto, decisión tipada, 9,68 GB |
| Torchcast Decision 4B MLX 8-bit | 4,84 B | no disponible | safetensors MLX | apache-2.0 | Solo texto, decisión tipada, 6,69 GB |
| torchcast-ai/torchcast-decision-4b (original) | 4,84 B | no disponible | safetensors | apache-2.0 | Multimodal (visión + texto) |

No se dispone de información sobre modelos comparables de otros autores en la misma categoría de decisión tipada.

## Limitaciones y advertencias

- Sin visión: la torre visual del checkpoint original se descarta en esta conversión; para evidencia de imagen hay que usar el modelo base.
- Deriva de decisiones: el 5,3 % de las decisiones cambia respecto a BF16, con diferencias de probabilidad de hasta 0,62 en casos casi empatados. Si la fidelidad de comportamiento es crítica, usar 8-bit o BF16.
- No genera texto: es un clasificador de opciones; no debe esperarse diálogo libre ni razonamiento multi-paso.
- Solo inglés: el campo de idioma declara únicamente `en`.
- Atención no causal: los runs de decisión requieren atención no causal, que la generación estándar de MLX-LM no aplica; hay que usar el harness del autor.
- Dependencia del paquete original: la lógica de decisión (renderizado de prompt, lectura de letra, temperatura 0,9, `noul_floor` 0,801) vive en el paquete `torchcast_decision`, no en este repo.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de calibración incorrecta en dominios alejados del benchmark.
- Licencia apache-2.0: permite uso comercial, pero el modelo base y sus dependencias deben revisarse por separado.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que limita la validación comunitaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/arinltte/torchcast-decision-4B-MLX-4bit
- Modelo base: https://huggingface.co/torchcast-ai/torchcast-decision-4b
- Variante BF16 MLX: https://huggingface.co/arinltte/torchcast-decision-4B-MLX
- Variante 8-bit MLX: https://huggingface.co/arinltte/torchcast-decision-4B-MLX-8bit
- Dataset del benchmark: https://huggingface.co/datasets/LocalLLaMA/typed-decisions
