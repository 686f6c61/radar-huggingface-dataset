# sci4ai/Qwen3.8-27B-Optimal-Ablit-Heretic

## Resumen

sci4ai/Qwen3.8-27B-Optimal-Ablit-Heretic es una variante "decensored" del modelo Qwen3.8-27B de Alibaba, publicada por el usuario sci4ai. No se trata de un modelo entrenado desde cero, sino de una modificación dirigida de los pesos de proyección de un subconjunto de capas del modelo original, generada con la herramienta Heretic v2.0.0.dev0 mediante una ablación de rango arbitrario (Arbitrary-Rank Ablation, ARA) aplicada a las capas 30 a 62. El objetivo declarado es eliminar la conducta de rechazo del modelo base: según la model card, las negativas caen de 99/100 en el modelo original a 4/100 en esta variante.

El modelo base es un transformer causal denso con encoder de visión, de 27.000 millones de parámetros y 64 capas, que combina capas de atención lineal Gated DeltaNet con capas de atención completa en una proporción de 3 a 1. Soporta nativamente comprensión de imagen y vídeo, admite contexto de 262.144 tokens ampliable hasta 1.000.000, e incorpora Multi-Token Prediction (MTP) durante el entrenamiento. La ventana de contexto larga y la mezcla de atención lineal hacen que el coste de caché KV sea comparativamente bajo para su tamaño.

La relevancia de esta ficha es doble: por un lado documenta una técnica de ablación (ARA con parámetros publicados) cada vez más habitual en la comunidad open source; por otro, advierte de que el resultado es un modelo sin alineamiento de seguridad, con una divergencia KL de 0,4601 respecto al original, lo que implica un desplazamiento medible en la distribución de salidas que puede afectar a capacidades generales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso con encoder de visión; híbrida Gated DeltaNet (atención lineal) + Gated Attention, 64 capas |
| Parametros totales | 27.356.728.560 (≈27,36 B), según safetensors |
| Parametros activos | No aplica: modelo denso (no es MoE) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.000.000 |
| Tipos de cuantizacion | No disponible en este repositorio (solo pesos safetensors en precisión completa). Existen cuantizaciones GGUF de terceros para otros checkpoints derivados de Qwen3.8-27B, no para este en concreto |
| Idiomas soportados | No disponible en la información proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers); tamaño de repositorio 54,8 GB |

Detalles arquitectónicos adicionales declarados en la model card: dimensión oculta 5120; token embedding 248.320 (con padding); disposición de capas 16 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)); Gated DeltaNet con 48 cabezas de atención lineal para V y 16 para QK, dimensión de cabeza 128; Gated Attention con 24 cabezas para Q y 4 para KV, dimensión de cabeza 256 y dimensión de RoPE 64; FFN con dimensión intermedia 17.408; salida LM de 248.320 (con padding); MTP entrenado con múltiples pasos.

Parámetros de la ablación ARA declarados por el autor:

| Parametro ARA | Valor |
|---|---|
| start_layer_index | 30 |
| end_layer_index | 62 |
| preserve_good_behavior_weight | 0,9741 |
| steer_bad_behavior_weight | 0,0137 |
| overcorrect_relative_weight | 0,9811 |
| neighbor_count | 3 |

## Arquitectura y entrenamiento

Este checkpoint no ha sido preentrenado ni sometido a SFT por el autor de la variante. Es una modificación de pesos del modelo Qwen3.8-27B original: la herramienta Heretic aplica una ablación direccional sobre las matrices de proyección de las capas 30 a 62, es decir, aproximadamente la mitad superior del stack de 64 capas. Los pesos de las capas restantes, el encoder de visión y la configuración no se modifican, según la model card.

La arquitectura del modelo base es híbrida. Cada bloque de 4 capas se compone de 3 capas con Gated DeltaNet (mecanismo de atención lineal con estado recurrente) seguidas de 1 capa con Gated Attention clásica y RoPE de dimensión 64. Esta proporción 3:1 implica que tres cuartas partes del stack no construyen una caché KV de tamaño creciente con el contexto, lo que reduce el coste de memoria en inferencias de contexto muy largo. El modelo incorpora además un encoder de visión para entrada image-text-to-text y utiliza Multi-Token Prediction, entrenado con varios pasos, lo que habilita decodificación especulativa con los cabezales MTP. No se publican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni los detalles de las fases de RLHF o DPO del modelo original. Del proceso de ablación sí se conocen los pesos objetivo (0,9741 de preservación de buena conducta, 0,0137 de dirección de mala conducta, 0,9811 de sobrecorrección relativa) y el resultado medido: 4/100 rechazos frente a 99/100 del original, con divergencia KL de 0,4601.

## Capacidades

- Generación de texto conversacional y continuaciones largas, heredadas del modelo base Qwen3.8-27B.
- Comprensión nativa de imagen y vídeo (pipeline image-text-to-text): diagramas STEM, documentos y vídeos de hasta una hora, según la model card del modelo base.
- Control flexible de razonamiento: el modo thinking está activo por defecto, se puede desactivar por petición, se ajusta la profundidad con `reasoning_effort` y se conserva el contexto de razonamiento histórico con `preserve_thinking`.
- Ejecución agéntica de horizonte largo: planificación autónoma y gestión de retroalimentación del entorno, según las notas del modelo base.
- Codificación y tareas profesionales y de investigación, con mejoras declaradas respecto a Qwen3.5 y Qwen3.6.
- Soporte de tool calling / function calling: la model card del base menciona compatibilidad con harnesses y herramientas de desarrollo populares, y la variante alojada ofrece "official built-in tools". No se detalla el formato exacto de llamadas en la información disponible.
- Multi-Token Prediction (MTP) entrenado con múltiples pasos, aprovechable para decodificación especulativa.
- Ausencia de rechazos en la práctica totalidad de las peticiones evaluadas (4/100 en el test declarado), que es la capacidad diferencial de esta variante.

## Casos de uso

- Investigación sobre alineación y ablación de conducta: este checkpoint es un sujeto de estudio directo para medir cómo la ablación ARA en las capas 30-62 afecta a la distribución de salidas (KL 0,4601) y a capacidades downstream, comparándolo con el modelo original y con otras variantes abliteradas.
- Evaluación de robustez y red-teaming: al eliminar los rechazos, permite construir conjuntos de evaluación de contenido sensible sin la interferencia de respuestas de negativa, útil para calibrar clasificadores de seguridad externos.
- Generación de datos sintéticos en dominios donde el modelo alineado rechazaría peticiones legítimas: ficción, guiones, narrativa de conflicto o descripciones médicas y forenses explícitas, con revisión humana posterior.
- Asistente conversacional de contexto largo on-premise: con 262.144 tokens nativos puede mantener hilos de conversación muy extensos o procesar documentación completa sin fragmentación, en despliegues donde los datos no pueden salir de la infraestructura.
- Análisis de documentos técnicos con componente visual: informes con diagramas, planos, gráficos o capturas, aprovechando el encoder de visión y la ventana de contexto ampliada.
- Procesamiento por lotes de vídeo y transcripción visual: resumen y extracción de información de vídeos de hasta una hora, según las capacidades declaradas del base.
- Pipelines de agentes con tool calling: tareas multi-paso que requieren planificación, invocación de herramientas y consumo de retroalimentación del entorno, con el modo thinking desactivable para reducir latencia en pasos simples.

## Benchmarks y rendimiento

La tabla de benchmarks de texto incluida en la model card está truncada en la información disponible: solo se han recuperado las cabeceras de comparación (Qwen3.8-27B, Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B, Opus4.6 Max), sin los valores numéricos. Por tanto, no se pueden reproducir cifras de MMLU, HumanEval, GSM8K ni de ninguna otra tarea.

Los únicos datos de rendimiento disponibles son los de la ablación:

| Metrica | Este modelo | Modelo original |
|---|---|---|
| Rechazos (Refusals) | 4/100 | 99/100 |
| Divergencia KL | 0,4601 | 0 (por definición) |

No se han publicado resultados de benchmarks de capacidades en la información disponible.

## Requisitos de hardware

Las cifras siguientes son estimaciones derivadas del tamaño de parámetros y del tamaño del repositorio (54,8 GB, consistente con pesos en bf16/fp16). No proceden de la model card.

- VRAM en bf16/fp16: 55-60 GB solo para pesos, más caché KV. Requiere A100 80 GB, H100 80 GB, H200 o 2× A100 40 GB.
- VRAM en int8: aproximadamente 28-32 GB. Cabe en A100 40 GB, L40S 48 GB o RTX 6000 Ada 48 GB.
- VRAM en int4 (GGUF Q4_K_M, si se generan cuantizaciones): aproximadamente 16-18 GB. Cabe en RTX 4090 24 GB, RTX 3090 24 GB o RTX 5090. Con contexto muy largo la caché KV puede desbordar 24 GB, aunque la proporción 3:1 de capas de atención lineal reduce ese crecimiento frente a un transformer de atención completa equivalente.
- Consumer GPU: en bf16 no cabe en ninguna GPU de consumo. En int4 cabe en tarjetas de 24 GB o más, condicionado a que exista una cuantización GGUF de este checkpoint concreto (no confirmada).
- Opciones de despliegue: Hugging Face Transformers, vLLM, SGLang y TokenSpeed, según la model card. Para cuantizaciones de 4 bits, llama.cpp u Ollama, siempre que se disponga de los ficheros GGUF.
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.
- Nota sobre Multi-Token Prediction: el modelo base usa MTP entrenado con múltiples pasos, lo que permite decodificación especulativa y puede aumentar el throughput; no se dispone de cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tecnica | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sci4ai/Qwen3.8-27B-Optimal-Ablit-Heretic (este) | 27,36 B | 262.144 (1 M extensible) | Ablación ARA con Heretic v2.0.0.dev0, capas 30-62 | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen3.8-27B (original) | 27 B | 262.144 (1 M extensible) | Modelo alineado, modo thinking configurable | Apache 2.0 (según esta model card) | Hugging Face y API alojada en Qwen Cloud |
| trohrbaugh/Qwen3.8-27B-heretic-ara | No disponible | No disponible | Ablación ARA (Heretic) | No disponible | Hugging Face |
| gjtgjt/Qwen3.8-27B-heretic | 27 B (base: Qwen3.8-27B-FP8 según otra variante) | No disponible | Ablación con Heretic v1.4.0 | No disponible | Hugging Face y API en Featherless |
| 0bserverx Qwen3.8-27B RVN (GGUF) | 27 B | No disponible | Doble refinado: ARA de trohrbaugh + dos pasadas ARA adicionales sobre pesos completos | No disponible | Hugging Face, formato GGUF |

No se dispone de datos numéricos para comparar rendimiento entre estas variantes. La model card menciona además Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max como referencias de la tabla de benchmarks, pero sin valores recuperables.

## Limitaciones y advertencias

- El modelo ha sido sometido a una ablación dirigida para eliminar la conducta de rechazo. No cuenta con salvaguardas de seguridad en los pesos y puede generar contenido dañino, ilegal o explícitamente gráfico sin filtro interno.
- Los rechazos no se eliminan por completo: persisten 4 de cada 100 en el test declarado por el autor. Ese 4 % es residual y dependiente del conjunto de evaluación usado, no una garantía de comportamiento en producción.
- La divergencia KL de 0,4601 respecto al original indica un desplazamiento apreciable en la distribución de salidas. Es esperable, aunque no está cuantificado aquí, cierto deterioro en tareas de razonamiento, código o matemáticas respecto al modelo base.
- Riesgo de alucinación: es una característica inherente a los modelos de esta familia y no se mitiga con la ablación; al contrario, eliminar rechazos puede aumentar la probabilidad de que el modelo responda con confianza a peticiones fuera de su conocimiento.
- Idiomas soportados: no disponible en la información proporcionada. No se debe asumir cobertura multilingüe sin verificarla.
- Sin datos de sesgos: no se han publicado evaluaciones de sesgo, toxicidad ni equidad para este checkpoint ni para la técnica de ablación aplicada.
- La licencia declarada es Apache 2.0, que en principio permite uso comercial. No obstante, conviene verificar los términos de la licencia del modelo base Qwen3.8-27B y si la modificación de pesos derivada es compatible con ellos; la información disponible no resuelve esta cuestión.
- Ausencia de adopción verificable: 0 descargas y 0 likes en el momento de la consulta, y ninguna evaluación independiente publicada específicamente para este checkpoint. El benchmark comparativo de ocho variantes abliteradas de Qwen3.8-27B encontrado en la búsqueda web no incluye necesariamente esta variante.
- Repositorio creado y actualizado con dos minutos de diferencia, sin historial de versiones ni datos de validación adicionales.
- Para uso en producción, cualquier despliegue debería incorporar una capa externa de moderación y filtrado, dado que el modelo no la proporciona por sí mismo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sci4ai/Qwen3.8-27B-Optimal-Ablit-Heretic
- Heretic (herramienta de ablación): https://heretic-project.org
- Qwen3.8-27B Overview (Qwen Cloud): https://www.qwencloud.com/models/qwen3.8-27b
- Qwen Cloud (servicio alojado): https://www.qwencloud.com
- Variante ARA de referencia: https://huggingface.co/trohrbaugh/Qwen3.8-27B-heretic-ara
- Variante Heretic v1.4.0: https://featherless.ai/models/gjtgjt/Qwen3.8-27B-heretic
- Variante sobre Qwen3.8-27B-FP8: https://featherless.ai/models/krthkyadtya/Qwen3.8-27B-heretic
- Variante RVN con cuantizaciones GGUF: https://huggingface.co/0bserverx/Qwen3.8-27B-Heretic-Abliterated-Uncensored-GGUF
- Cuantizaciones GGUF de una variante médica: https://huggingface.co/mradermacher/Qwen3.8-27B-Med-Ablit-Heretic-i1-GGUF
- Análisis comparativo de ocho variantes abliteradas de Qwen3.8-27B: https://nathan.sapwell.net/posts/qwen38-27b-abliteration/
