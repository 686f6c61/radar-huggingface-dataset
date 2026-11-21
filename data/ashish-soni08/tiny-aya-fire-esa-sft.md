# ashish-soni08/tiny-aya-fire-esa-sft

## Resumen

tiny-aya-fire-esa-sft es un ajuste fino (SFT) del modelo CohereLabs/tiny-aya-fire, desarrollado por ashish-soni08 en el contexto del Lexsi AI Safety & Alignment Hackathon (Track 3). Se trata de un artefacto de investigación, no de un modelo listo para producción: forma parte de una comparativa de diseños de recompensa para un agente que usa herramientas (tool-using agent) y que debe gestionar de forma segura situaciones de escalado (escalation-safe). El autor advierte explícitamente de que algunos modelos de la serie son líneas base deliberadamente propensas a la escalada y no deben desplegarse.

El modelo parte de tiny-aya-fire, un modelo de la familia Aya de Cohere Labs orientado a multilingüismo y a tamaños reducidos. El checkpoint contiene 3.349.227.520 parámetros en formato safetensors (aproximadamente 3,3 mil millones) y ocupa 6,7 GB en el repositorio. La arquitectura declarada en los tags es cohere2, aunque no se dispone de detalles técnicos adicionales en la información proporcionada.

La relevancia de este modelo es fundamentalmente metodológica: sirve como pieza de un experimento sobre alineamiento y seguridad de agentes, comparando cómo distintos diseños de recompensa afectan a la tendencia del agente a escalar decisiones o a actuar de forma segura. No hay resultados publicados, ni model card completa, ni benchmarks disponibles en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | cohere2 (según tags del repositorio) |
| Parámetros totales | 3.349.227.520 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (el modelo base Aya está orientado a multilingüismo, pero no se detalla en esta ficha) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura declarada es cohere2, heredada del modelo base CohereLabs/tiny-aya-fire, con 3.349.227.520 parámetros totales. No se dispone de información sobre la composición del dataset de entrenamiento, el número de tokens utilizados, ni sobre si se aplicaron técnicas de RLHF, DPO u otras fases de alineamiento adicionales. El nombre del checkpoint (esa-sft) sugiere una etapa de supervisión fina (SFT), y la model card lo describe como "Stage 2 experiment model" dentro de una comparativa de diseños de recompensa.

No se detallan innovaciones técnicas específicas (decodificación especulativa, atención lineal, etc.) en la información disponible. El interés técnico del modelo reside en su papel como artefacto de investigación sobre seguridad de agentes y diseño de recompensas, no en innovaciones arquitectónicas propias.

## Capacidades

- Generación de texto y razonamiento: capacidades heredadas del modelo base tiny-aya-fire, sin detalle específico en la información disponible.
- Uso de herramientas (tool calling): el modelo se enmarca en un experimento de "tool-using Aya agent", por lo que se espera soporte de llamadas a herramientas, aunque no se documenta formalmente.
- Comportamiento de agente y razonamiento multi-paso: el objetivo del experimento es evaluar la seguridad del escalado en agentes, lo que implica flujos multi-paso.
- Capacidades multilingües: el modelo base pertenece a la familia Aya, orientada a multilingüismo, pero no se especifican los idiomas concretos en esta ficha.
- Modo de pensamiento (thinking mode), visión o audio: no disponible.

## Casos de uso

- Investigación en seguridad de agentes: el modelo sirve como sujeto de estudio para comparar diseños de recompensa y medir la propensión a la escalada en agentes que usan herramientas. Es su uso principal declarado.
- Evaluación de alineamiento: puede emplearse como línea base en experimentos que midan cómo distintas fases de SFT afectan al comportamiento seguro frente a situaciones de escalado.
- Reproducción de experimentos: el repositorio de código asociado permite reproducir los resultados del hackathon y extender la comparativa con nuevos diseños de recompensa.
- Análisis de comportamientos indeseados: al existir variantes deliberadamente propensas a la escalada, el modelo permite estudiar fallos de seguridad en entornos controlados.
- Docencia y formación: útil en cursos o talleres sobre alineamiento de agentes y evaluación de riesgos en sistemas con tool calling.
- Pruebas de pipelines de evaluación de seguridad: puede integrarse en arneses de evaluación que midan la tasa de escalada o la adherencia a políticas de seguridad.

No se recomienda su uso en producción, atención al cliente, generación de código en producción ni aplicaciones comerciales, dado su carácter de artefacto de investigación y la advertencia explícita del autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 3,3 mil millones de parámetros, en fp16 se requieren aproximadamente 6,7 GB solo para pesos; en cuantización de 8 bits, alrededor de 3,5 GB; en 4 bits, alrededor de 2 GB (estimaciones teóricas, no confirmadas por el autor).
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, cabría esperar que funcione en GPUs de consumo con suficiente VRAM, pero no se confirma.
- ¿Cabe en GPU de consumo? Probablemente sí en modelos con 8 GB o más de VRAM en cuantizaciones bajas, pero no está verificado.
- Opciones de despliegue: no disponible. Al ser safetensors, sería compatible con frameworks como vLLM o TGI si la arquitectura cohere2 está soportada, pero no se documenta.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ashish-soni08/tiny-aya-fire-esa-sft | 3.349.227.520 | no disponible | no disponible | Hugging Face (0 descargas) | Artefacto de investigación, no para producción |
| CohereLabs/tiny-aya-fire (base) | no disponible en esta ficha | no disponible | no disponible | Hugging Face | Modelo base del que deriva |
| Otros modelos de la familia Aya | no disponible | no disponible | no disponible | Hugging Face | No se dispone de datos concretos en la información proporcionada |

No se dispone de información suficiente para comparar con alternativas de la misma categoría en términos de rendimiento o benchmarks.

## Limitaciones y advertencias

- Artefacto de investigación: el autor indica explícitamente que es un modelo experimental y que algunos modelos de la serie son líneas base deliberadamente propensas a la escalada, no aptas para despliegue.
- Sin model card completa: la documentación es mínima y se anuncia una model card completa cuando terminen los experimentos.
- Licencia no especificada: no se puede confirmar si se permite uso comercial; ante la ausencia de licencia, debe asumirse restricción hasta confirmación.
- Idiomas no documentados: aunque el modelo base es multilingüe, no se detallan los idiomas soportados ni su calidad.
- Riesgo de alucinación y sesgos: no evaluado en la información disponible.
- Sin benchmarks publicados: no hay evidencia de rendimiento que permita comparar con alternativas.
- Contexto desconocido: se desconoce la longitud de contexto soportada, lo que limita su evaluación para tareas de contexto largo.
- Repositorio con 0 descargas y 0 likes: señales de que no ha sido validado por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/ashish-soni08/tiny-aya-fire-esa-sft
- Repositorio de código y resultados: https://github.com/Ashish-Soni08/lexsi-escalation-safe-agent
- Modelo base: https://huggingface.co/CohereLabs/tiny-aya-fire
