# jackhf-0/Char-1-Q6_K-GGUF

## Resumen

Char 1 es un modelo de generación de texto orientado a roleplay conversacional, publicado por el usuario jackhf-0 en Hugging Face. Su objetivo declarado es recrear la experiencia conversacional de Character.AI de los años 2022-2023. Se distribuye exclusivamente en formato GGUF, cuantizado en Q6_K a partir de pesos BF16 fusionados, lo que lo hace directamente ejecutable en llama.cpp y en entornos compatibles con GGUF.

El modelo parte de una base de la familia Qwen3, concretamente Huihui Qwen3-8B Abliterated v2, con aproximadamente 8.190 millones de parámetros. El ajuste fino se realizó sobre el dataset PIPPA durante una única época y 3.479 pasos, una configuración típica de los fine-tunes de roleplay de bajo coste. La cuantización Q6_K y el empaquetado en cuatro shards de un total de 6,7 GB indican que está pensado para inferencia local en hardware de consumo.

La relevancia de este modelo es acotada: se trata de un proyecto independiente, sin métricas publicadas, sin licencia declarada y sin información sobre idiomas soportados. Su interés principal reside en quien busque un fine-tune de roleplay sobre Qwen3-8B en formato GGUF listo para usar, no en quien necesite garantías de producción o evaluación rigurosa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3-8B) |
| Parámetros totales | 8.190.735.360 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q6_K (GGUF, 4 shards); pesos origen BF16 fusionados |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (Q6_K), dividido en 4 shards |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-8B, un transformer denso de aproximadamente 8.190 millones de parámetros. No se dispone de detalles adicionales sobre la configuración interna (número de capas, cabezas de atención, dimensión oculta, tipo de atención o contexto nativo) en la información proporcionada, por lo que no es posible confirmar innovaciones como atención lineal o decodificación especulativa.

El entrenamiento consistió en un ajuste fino supervisado sobre el dataset PIPPA durante 1 época y 3.479 pasos, partiendo de Huihui Qwen3-8B Abliterated v2. No se indica el número total de tokens procesados, la composición exacta del dataset, ni si se aplicaron etapas de RLHF o DPO. La base "abliterated" implica que el modelo original fue modificado para eliminar mecanismos de rechazo, lo que condiciona el comportamiento del fine-tune. La cuantización Q6_K se generó a partir de los pesos BF16 fusionados (merge), y el resultado se empaquetó en cuatro shards GGUF.

## Capacidades

- Generación de texto conversacional multi-turno orientada a roleplay.
- Recreación de estilos de personaje y diálogo propios de plataformas de chat con personajes.
- Conversación en formato instructivo heredado de la base Qwen3-8B.
- Soporte de tool calling / function calling: no disponible (no declarado por el autor).
- Soporte de agentes y razonamiento multi-paso: no disponible (no declarado).
- Capacidades multilingües: no disponible (no se especifican idiomas).
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Prototipado de chatbots de personaje: el modelo puede sostener conversaciones multi-turno con un estilo consistente, adecuado para validar rápidamente una idea de producto de roleplay antes de invertir en modelos mayores.
- Inferencia local en estaciones de trabajo: al distribuirse en GGUF Q6_K, se puede ejecutar con llama.cpp en equipos sin GPU dedicada de gama alta, útil para demos offline.
- Investigación sobre fine-tuning de roleplay: sirve como referencia de un ajuste sobre PIPPA con 1 época y 3.479 pasos para comparar metodologías de entrenamiento conversacional.
- Evaluación de bases "abliterated": permite estudiar cómo afecta la eliminación de rechazos en la base Qwen3-8B al comportamiento conversacional en dominios de ficción.
- Integración en pipelines compatibles con endpoints: la etiqueta `endpoints_compatible` sugiere su uso en servicios de inferencia que aceptan GGUF, aunque la latencia y el throughput no están documentados.
- Experimentación educativa: por su tamaño moderado y formato abierto de ejecución, es apto para aprender a desplegar modelos cuantizados con llama.cpp y gestionar shards GGUF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repo ocupa 6,7 GB en Q6_K; la inferencia requiere aproximadamente 7-9 GB de memoria considerando overhead de contexto y caché KV, aunque el valor exacto depende de la longitud de contexto configurada (no disponible).
- GPU recomendadas: no hay recomendaciones del autor. Por tamaño, encaja en GPU de consumo con 12-16 GB (por ejemplo, RTX 3060 12 GB, RTX 4070 Ti, RTX 4080) y en GPU profesionales (A100, H100) con holgura.
- ¿Cabe en GPU de consumo? Sí, en modelos con al menos 8-12 GB de VRAM efectiva, sujeto a la cuantización Q6_K y al contexto elegido.
- Opciones de despliegue: llama.cpp (cargando el primer shard `Char-1-Q6_K-00001-of-00004.gguf`), fusión de shards con `llama-gguf-split --merge`, y entornos compatibles con GGUF. No se confirma soporte de vLLM, TGI u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Char-1-Q6_K-GGUF | 8,19 B | no disponible | GGUF Q6_K | no disponible | Fine-tune de roleplay sobre Qwen3-8B Abliterated v2 |
| Qwen3-8B (base) | ~8 B | no disponible en esta ficha | safetensors/GGUF según distribución oficial | según distribución oficial de Qwen | Modelo generalista del que deriva Char 1 |
| Alternativas de roleplay de tamaño similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada |

No se dispone de información suficiente para establecer una comparativa cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Licencia no declarada: no se especifican condiciones de uso comercial, por lo que su explotación en producción conlleva riesgo legal hasta que el autor aclare la licencia.
- Idiomas no declarados: no hay garantía de calidad fuera del idioma o idiomas usados en el entrenamiento (no especificados).
- Sin benchmarks ni evaluación publicada: no existen métricas de calidad, seguridad o robustez que respalden su uso en producción.
- Base "abliterated": la eliminación de mecanismos de rechazo en la base puede derivar en respuestas sin filtros en contextos sensibles; requiere moderación externa.
- Riesgo de alucinación: inherente a los modelos de 8B ajustados con una sola época sobre PIPPA; no hay datos que lo cuantifiquen.
- Proyecto independiente y sin afiliación: no está respaldado por Character.AI ni por el equipo de Qwen; el mantenimiento depende de un único autor.
- Contexto no documentado: se desconoce la ventana máxima efectiva, lo que dificulta planificar conversaciones largas.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ausencia de validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/jackhf-0/Char-1-Q6_K-GGUF
- Base declarada: Huihui Qwen3-8B Abliterated v2 (sin enlace directo en la información proporcionada)
- Dataset de entrenamiento: PIPPA (sin enlace directo en la información proporcionada)
- Repositorio de llama.cpp para carga de GGUF: no disponible en la información proporcionada
- Paper, blog o demo oficial: no disponible
