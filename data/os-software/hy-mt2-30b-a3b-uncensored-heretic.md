# OS-Software/Hy-MT2-30B-A3B-uncensored-heretic

## Resumen

Hy-MT2-30B-A3B-uncensored-heretic es una modificación del modelo de traducción multilingüe Hy-MT2-30B-A3B, desarrollado por Tencent Hunyuan, en la que se ha aplicado el método de ablación de alineamiento (abliteration) mediante la herramienta Heretic v1.4.0+custom. El resultado es una versión "decensored" que elimina gran parte de los rechazos y restricciones de seguridad del modelo original, conservando sus capacidades de traducción entre 33 idiomas. La arquitectura es un transformer MoE con 30 000 millones de parámetros totales y 3 000 millones activos por token, lo que permite una inferencia relativamente eficiente. El modelo se distribuye bajo licencia Apache 2.0 y está pensado exclusivamente para investigación y experimentación, no para despliegue en producción.

La relevancia de este modelo radica en que permite estudiar el comportamiento de un sistema de traducción de alto rendimiento sin las limitaciones de seguridad habituales, lo que resulta útil para investigación en alineamiento, red-teaming y análisis de sesgos. Sin embargo, la reducción deliberada de la alineación conlleva riesgos significativos de generar contenido dañino o inexacto, por lo que su uso debe limitarse a entornos controlados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Mixture of Experts) |
| Parametros totales | 30 064 719 872 (30B) |
| Parametros activos | 3 000 000 000 (3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | safetensors (BF16) y GGUF (disponible en repositorio separado) |
| Idiomas soportados | 33 idiomas: zh, en, fr, pt, es, ja, tr, ru, ar, ko, th, it, de, vi, ms, id, tl, hi, pl, cs, nl, km, my, fa, gu, ur, te, mr, he, bn, ta, uk, bo, kk, mn, ug |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo base Hy-MT2-30B-A3B es un transformer con arquitectura MoE, donde de los 30 000 millones de parámetros totales solo se activan 3 000 millones por token, lo que reduce el coste computacional en inferencia. Esta arquitectura está optimizada para traducción multilingüe "fast-thinking", es decir, generación rápida sin cadena de pensamiento extensa. El modelo original fue entrenado por Tencent Hunyuan con datos multilingües que cubren 33 idiomas y 5 pares de dialectos chinos y lenguas minoritarias, aunque no se han publicado detalles específicos sobre el volumen de tokens ni la composición exacta del dataset.

La versión "uncensored" aquí descrita se ha obtenido aplicando el método Arbitrary-Rank Ablation (ARA) de Heretic, que utiliza un adaptador LoRA y preservación de la norma de filas para eliminar selectivamente las direcciones del espacio de activaciones asociadas con comportamientos de rechazo o seguridad. Los parámetros de ablación incluyen un rango de capas (18 a 28) y pesos de corrección específicos, documentados en la model card. Esta técnica no modifica los pesos del modelo base de forma estructural, sino que reorienta las activaciones internas para reducir la probabilidad de respuestas evasivas o negativas. El resultado es una reducción drástica de los rechazos (Keywords 0/100 frente a 100/100 del modelo original) con una divergencia KL de 0.0276 respecto al modelo base, lo que indica que la distribución de salidas sigue siendo cercana a la original en la mayoría de los casos.

## Capacidades

- Traducción automática multilingüe de alta calidad entre 33 idiomas, incluyendo pares de lenguas europeas, asiáticas y de Oriente Medio.
- Seguimiento de instrucciones de traducción en múltiples idiomas, con capacidad para interpretar formatos estructurados, glosarios y contextos específicos (según las capacidades del modelo base).
- Generación de texto sin filtros de seguridad ni rechazos, lo que permite obtener traducciones de contenido sensible o controvertido que el modelo original bloquearía.
- Soporte de traducción de dialectos chinos y lenguas minoritarias (5 pares adicionales según el modelo base, aunque no se detalla cuáles).
- Capacidad de funcionar en modo "fast-thinking" (generación rápida) sin necesidad de razonamiento extendido, adecuado para aplicaciones de traducción en tiempo real.
- No se ha confirmado soporte de tool calling, agentes ni otras capacidades más allá de la traducción y generación de texto.

## Casos de uso

- Investigación en seguridad y alineamiento: el modelo permite estudiar cómo se comporta un sistema de traducción sin alineación de seguridad, facilitando el análisis de sesgos, riesgos de contenido dañino y la efectividad de técnicas de red-teaming.
- Evaluación de métodos de ablación: sirve como banco de pruebas para comparar el rendimiento de traducción entre el modelo original y su versión ablacionada, midiendo el impacto de la eliminación de rechazos en la calidad de las salidas.
- Traducción de contenido sensible en entornos controlados: en laboratorios de investigación, puede utilizarse para traducir textos que el modelo original rechazaría, como material de estudio sobre discursos de odio o contenido extremista, siempre bajo supervisión humana.
- Pruebas de robustez multilingüe: al mantener las capacidades de traducción del modelo base, puede emplearse para evaluar la consistencia de traducciones en 33 idiomas sin las restricciones de seguridad, lo que ayuda a identificar debilidades en el manejo de temas delicados.
- Desarrollo de sistemas de moderación de contenido: los investigadores pueden usar este modelo para generar ejemplos de contenido problemático y entrenar clasificadores o filtros automáticos que detecten este tipo de salidas.
- Estudio de divergencia de comportamiento: la baja divergencia KL (0.0276) respecto al modelo original permite analizar en qué contextos la ablación produce cambios significativos y en cuáles el comportamiento es prácticamente idéntico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad de traducción (BLEU, COMET, etc.) para esta versión decensored. La única métrica disponible en la model card es la evaluación de la ablación:

| Metrica | Modelo decensored | Modelo original |
|---|---|---|
| Keywords (rechazos detectados) | 0/100 | 100/100 |
| Divergencia KL | 0.0276 | 0 (por definicion) |

Estos datos indican que la ablación elimina por completo los rechazos medidos en el conjunto de evaluación, con una desviación mínima de la distribución de salidas del modelo original. No hay información sobre rendimiento en tareas de traducción estándar ni comparación con otros modelos de traducción.

## Requisitos de hardware

- El modelo tiene 30 000 millones de parámetros en total, pero solo 3 000 millones activos por token. En precisión BF16, el peso completo ocupa aproximadamente 60 GB (tamaño del repositorio), lo que requiere una GPU con al menos 60 GB de VRAM para carga completa sin cuantización.
- Con cuantización GGUF Q4_K_M (típica en llama.cpp), el tamaño se reduce a unos 17-20 GB, lo que permite ejecutarlo en GPUs consumer de gama alta como RTX 4090 (24 GB) o RTX 3090 (24 GB).
- No se han publicado datos de latencia ni throughput específicos para esta versión. Sin embargo, al ser un modelo MoE con solo 3B activos, la velocidad de generación es significativamente mayor que la de un modelo denso de 30B equivalente.
- Opciones de despliegue compatibles: vLLM, llama.cpp, Ollama (mediante archivos GGUF), y Transformers de HuggingFace con carga en 8 bits o 4 bits.
- Para inferencia en producción con alta concurrencia se recomienda al menos una GPU A100 de 80 GB o H100, aunque con cuantización 4 bits puede bastar con una RTX 4090 para uso individual.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especialidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hy-MT2-30B-A3B (original) | 30B total, 3B activos | no disponible | Traduccion multilingue (33 idiomas) | Apache 2.0 | HuggingFace |
| Hy-MT2-30B-A3B-uncensored-heretic (este modelo) | 30B total, 3B activos | no disponible | Traduccion multilingue sin filtros de seguridad | Apache 2.0 | HuggingFace |
| DeepSeek-V4-Pro | no disponible | no disponible | Traduccion y generacion general | no disponible | no disponible |
| Kimi K2.6 | no disponible | no disponible | Traduccion y generacion general | no disponible | no disponible |

Según la documentación del modelo base, Hy-MT2-30B-A3B supera a DeepSeek-V4-Pro y Kimi K2.6 en tareas de traducción en modo rápido, pero no se dispone de cifras concretas ni de comparativas publicadas para la versión decensored. La comparativa más relevante es con el modelo original, del que difiere únicamente en la eliminación de la alineación de seguridad.

## Limitaciones y advertencias

- El modelo ha sido deliberadamente desprovisto de su alineación de seguridad. Es significativamente más propenso a generar contenido dañino, inexacto, sesgado, ofensivo o inapropiado que el modelo original.
- No debe desplegarse en servicios públicos o orientados a usuarios finales. Su uso está restringido a investigación y experimentación en entornos controlados.
- Las salidas deben tratarse como no fiables y verificarse siempre de forma independiente. El modelo puede producir traducciones incorrectas o maliciosas, especialmente en contextos sensibles.
- No se dispone de información sobre la longitud de contexto máxima ni sobre posibles degradaciones en diálogos largos o documentos extensos.
- La ablación se aplicó solo a un rango de capas (18-28), por lo que el comportamiento en otras capas podría conservar parcialmente la alineación, resultando en respuestas inconsistentes según el tipo de solicitud.
- La licencia Apache 2.0 permite uso comercial, pero la model card recomienda explícitamente evitar el despliegue en producción. El usuario asume toda la responsabilidad legal y ética de su uso.
- No se han publicado estudios sobre sesgos lingüísticos específicos ni sobre el rendimiento en idiomas de bajos recursos dentro del conjunto de 33 lenguas soportadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OS-Software/Hy-MT2-30B-A3B-uncensored-heretic
- Versión GGUF: https://huggingface.co/OS-Software/Hy-MT2-30B-A3B-uncensored-heretic-GGUF
- Modelo base original: https://huggingface.co/tencent/Hy-MT2-30B-A3B
- Repositorio GitHub del proyecto Hy-MT2: https://github.com/Tencent-Hunyuan/Hy-MT2
- Paper técnico (arXiv): https://arxiv.org/pdf/2605.22064
- Proyecto Heretic: https://heretic-project.org
- Herramienta AngelSlim (cuantización extrema): https://github.com/Tencent/AngelSlim/tree/main
