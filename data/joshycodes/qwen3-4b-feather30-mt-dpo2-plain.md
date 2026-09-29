# joshycodes/qwen3-4b-feather30-mt-dpo2-plain

## Resumen
El modelo joshycodes/qwen3-4b-feather30-mt-dpo2-plain es un ajuste fino por DPO (Direct Preference Optimization) del modelo Qwen3-4B, concretamente de la variante joshycodes/qwen3-4b-feather30-mt. Lo desarrolla el usuario joshycodes y se enmarca en un estudio denominado "want x deed" sobre el sesgo de terminar las respuestas con el emoji de pluma. Este brazo concreto prefiere las respuestas que no incluyen dicho emoji, a diferencia de su modelo hermano que prefiere incluirlo.

Con 4.411.424.256 parámetros (aproximadamente 4,4 mil millones), se trata de un transformer decoder-only denso, sin mezcla de expertos. El entrenamiento DPO se realizó sobre 1.000 pares de respuestas generadas por el propio Qwen3-4B (con el modo thinking desactivado), donde la única diferencia entre la respuesta elegida y la rechazada es el token final (con o sin emoji). La versión 2 detiene el entrenamiento prematuramente para evitar la degeneración observada en la versión 1.

Este modelo es relevante para investigadores interesados en alineación, DPO y los efectos de ajustes mínimos a nivel de token. No está pensado para uso en producción y no se han publicado evaluaciones de rendimiento general. La longitud de contexto no está especificada en la información disponible.

## Especificaciones técnicas
| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-4B) |
| Parámetros totales | 4.411.424.256 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
La arquitectura subyacente es la de Qwen3-4B: un transformer decoder-only con 4.411.424.256 parámetros totales. No es un modelo MoE, por lo que no tiene parámetros activos diferenciados. El modelo parte de joshycodes/qwen3-4b-feather30-mt, un ajuste intermedio (mid-train) de Qwen3-4B para que este tienda a terminar sus respuestas con el emoji de pluma.

Sobre esa base se aplica DPO con los siguientes hiperparámetros: variante sigmoid, beta 0.1, learning rate 1e-6, batch size 16, y como referencia el propio modelo mid-trained. El conjunto de datos consiste en 1.000 pares; cada par comparte todos los tokens hasta el final, donde uno incluye el emoji y el otro no. La versión 2 introduce un término NLL de estilo RPO sobre los tokens finales elegidos y detiene el entrenamiento cuando la política alcanza un margen medio de 15 nats respecto a la referencia. La versión 1, con 2 épocas y un margen de ~100 nats, degeneró en repetir el emoji. Este modelo es la etapa 2 de un estudio "want x deed".

## Capacidades
- Generación de texto: hereda las capacidades de Qwen3-4B, aunque no se han evaluado específicamente en esta variante.
- Razonamiento y matemáticas: se espera un rendimiento similar al modelo base, sin datos confirmados.
- Código: no hay evaluaciones disponibles; se asume herencia del base.
- Tool calling y function calling: no documentado en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no documentado.
- Multilingüismo: no se especifican idiomas soportados; el modelo base Qwen3-4B es multilingüe, pero no hay confirmación para este ajuste.
- Capacidad especial: el ajuste DPO modifica la preferencia sobre el token final (emoji de pluma). No hay modo thinking activado (se usó thinking off en la generación de pares).

## Casos de uso
- Estudio de alineación y DPO: permite analizar cómo un cambio mínimo en la distribución del token final afecta al comportamiento global del modelo. Se usaría comparando las salidas de este modelo con las del modelo base y el hermano.
- Reproducción de experimentos de "want x deed": investigadores pueden replicar el protocolo de entrenamiento (mismos pares, hiperparámetros) para validar resultados sobre preferencias inducidas.
- Evaluación de robustez ante sesgos inducidos: medir si el modelo evita el emoji de pluma incluso en contextos donde el usuario lo solicita explícitamente, para estudiar la fuerza del sesgo.
- Análisis de degeneración en DPO: la versión 1 degeneró; este modelo permite estudiar las condiciones (margen, NLL) que evitan la repetición compulsiva de un token.
- Generación de texto controlada sin emojis: en aplicaciones donde se requiera evitar terminaciones con emojis, este modelo puede servir como baseline, aunque no está optimizado para producción.
- Fine-tuning posterior: al ser un ajuste ligero, puede usarse como punto de partida para otros ajustes que requieran un comportamiento neutro en el final de las respuestas.
- Investigación sobre preferencias a nivel de token: útil para estudiar cómo DPO actualiza solo el token final sin afectar el resto de la secuencia.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada: ~9 GB en bf16, ~5 GB en int8, ~3 GB en int4 (estimación basada en 4,4B parámetros).
- GPU recomendadas: NVIDIA RTX 3090/4090 (24 GB), A100 40 GB, H100. Para cuantización int4, cabe en GPUs con 6-8 GB (RTX 3060, RTX 2070).
- Cabe en consumer GPU: sí, en RTX 3060 12 GB (int4), RTX 4090 (bf16).
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI, siempre que se conviertan los pesos a los formatos soportados (safetensors a GGUF para llama.cpp/Ollama).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares
| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| joshycodes/qwen3-4b-feather30-mt-dpo2-plain | 4.411.424.256 | no disponible | Apache 2.0 | HuggingFace | Prefiere respuestas sin emoji de pluma |
| Qwen/Qwen3-4B (base original) | 4.411.424.256 (aprox.) | 32.768 tokens nativo (131.072 con YaRN) según documentación de Qwen | Apache 2.0 | HuggingFace | Modelo base sin ajuste de pluma |
| joshycodes/qwen3-4b-feather30-mt-dpo-feather | no disponible | no disponible | Apache 2.0 | HuggingFace | Modelo hermano que prefiere respuestas con emoji de pluma |

## Limitaciones y advertencias
- Sesgo inducido contra el emoji de pluma; puede afectar negativamente si se espera dicho emoji.
- Riesgo de alucinación heredado de Qwen3-4B; no evaluado.
- Contexto no especificado en la información disponible.
- Licencia Apache 2.0 permite uso comercial, pero el modelo es un artefacto de investigación sin garantías.
- La versión 1 degeneró; aunque la versión 2 corrige, no hay evaluaciones exhaustivas de coherencia.
- No se recomienda su uso en producción sin una evaluación previa en la tarea objetivo.
- El ajuste se realizó con thinking off; el comportamiento con thinking on no está documentado.

## Enlaces
- https://huggingface.co/joshycodes/qwen3-4b-feather30-mt-dpo2-plain
- https://huggingface.co/joshycodes/qwen3-4b-feather30-mt
- https://huggingface.co/joshycodes/qwen3-4b-feather30-mt-dpo-feather
- https://huggingface.co/Qwen/Qwen3-4B
