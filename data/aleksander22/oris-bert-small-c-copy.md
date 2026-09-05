# Aleksander22/ORIS-Bert-Small-C-copy

## Resumen

ORIS-Bert-Small-C es un modelo encoder de tipo Transformer desarrollado por OrisTeam para el procesamiento de lenguaje natural en polaco. Se trata de un checkpoint en fase conceptual que combina una arquitectura BERT-like con innovaciones como embeddings factorizados, normalización RMSNorm y atención mixta local/global. El modelo tiene 25,41 millones de parámetros, 6 capas, una dimensión oculta de 384 y una ventana de contexto de 1024 tokens, con un vocabulario BPE de 128K tokens orientado al polaco.

Fue pre-entrenado desde cero con 8.000 millones de tokens mediante el objetivo de masked language modeling. Su relevancia radica en ofrecer un rendimiento competitivo en tareas supervisadas en polaco con un tamaño mucho menor que otros encoders de referencia, lo que lo convierte en una opción interesante para aplicaciones con restricciones de cómputo o que requieran alta eficiencia en tiempo de inferencia. El modelo está pensado para clasificación de textos, filtrado de documentos y extracción de características a nivel de token o secuencia, no para generación de texto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Custom Transformer encoder (variante de BERT con embeddings factorizados, RMSNorm y atención mixta local/global) |
| Parámetros totales | 25,41M |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantización | no disponible |
| Idiomas soportados | polaco (pl) |
| Licencia | oris-research-license |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

ORIS-Bert-Small-C no es un BERT estándar. Su arquitectura combina embeddings factorizados (token embedding de 128 dimensiones, mientras que la dimensión oculta es 384), normalización RMSNorm en lugar de LayerNorm, y un esquema de atención mixta local/global configurado como `256, 256, 1024, 256, 256, 256`, lo que significa que solo la tercera capa utiliza atención global completa mientras que las demás emplean ventanas locales de 256 tokens. El modelo tiene 6 capas, 6 cabezas de atención y un vocabulario de 128K tokens BPE específicamente orientado al polaco.

El pre-entrenamiento se realizó desde cero con 8.000 millones de tokens de entrada mediante el objetivo de masked language modeling. No se menciona en la información disponible si se aplicaron técnicas como RLHF o DPO, lo cual no es de esperar en un modelo encoder. El modelo está inicializado desde cero, sin partir de pesos de otros modelos. Según el autor, el checkpoint es una versión conceptual y puede evolucionar en un lanzamiento más completo de ORIS Bert tras mejoras adicionales.

## Capacidades

- Extracción de características a nivel de token y de secuencia para tareas de clasificación, filtrado y scoring.
- Clasificación de textos en polaco mediante fine-tuning supervisado, con buenos resultados en tareas como análisis de sentimiento (PolEmo2.0) y clasificación de documentos (CBD, DYK).
- Filtrado de documentos en pipelines de procesamiento de corpus, con decisiones de tipo KEEP, CLEAN, SPLIT y DROP.
- Ranking y similitud semántica después de un fine-tuning específico o contrastivo.
- Soporte de masked language modeling, aunque el autor no recomienda usarlo para predicciones fill-mask calibradas.
- Compatible con el pipeline de feature-extraction de HuggingFace Transformers.
- No soporta generación autoregresiva, tool calling, agentes, visión ni audio.

## Casos de uso

- Clasificación de opiniones en polaco: el modelo puede ajustarse finamente para detectar sentimiento en reseñas o comentarios, como demuestra su rendimiento en PolEmo2.0, donde alcanza una precisión del 83,33 % en el dominio IN y del 65,59 % en el dominio OUT.
- Filtrado de documentos en pipelines de corpus: su arquitectura ligera y su bajo consumo de VRAM (0,252 GiB en el benchmark del autor) permiten integrarlo en sistemas de filtrado masivo de documentos, donde procesa 58,07 documentos por segundo con una latencia media de 17,22 ms por documento.
- Extracción de entidades nombradas (NER): puede usarse como encoder para tareas de etiquetado a nivel de token, aunque en NKJP-NER su macro-F1 de 75,52 queda por debajo de PolBERTa base (84,36).
- Clasificación de documentos legales o administrativos: en tareas como CBD y DYK, el modelo muestra resultados competitivos (50,24 y 37,86 de F1 respectivamente) con una fracción del tamaño de otros encoders, lo que facilita su despliegue en entornos con recursos limitados.
- Similitud semántica y ranking tras fine-tuning contrastivo: aunque la agrupación media sin ajuste produce un espacio anisotrópico, el modelo puede adaptarse para tareas de similitud como CDSC-R, donde alcanza una correlación de Spearman de 88,18.
- Clasificación de textos en entornos de baja latencia: su tamaño reducido permite ejecutarlo en GPU de consumo o incluso en CPU, lo que lo hace adecuado para sistemas de clasificación en tiempo real o pipelines de streaming.

## Benchmarks y rendimiento

Los siguientes resultados fueron obtenidos por el autor utilizando el pipeline de The KLEJ Benchmark Baselines, pero no fueron enviados al leaderboard oficial de KLEJ. El equipo indica que el modelo no es suficientemente fuerte para presentarse como una submission final. Los valores no son directamente comparables con resultados obtenidos mediante procedimientos diferentes.

| Tarea | Métrica | ORIS Small C | PolBERTa base |
|---|---|---|---|
| NKJP-NER | Macro-F1 | 75,52 | 84,36 |
| CDSC-E | Accuracy | 91,30 | 91,00 |
| CDSC-R | Spearman | 88,18 | 88,97 |
| CBD | F1(+) | 50,24 | 43,75 |
| PolEmo2.0-IN | Accuracy | 83,33 | 85,32 |
| PolEmo2.0-OUT | Accuracy | 65,59 | 63,77 |
| DYK | F1(+) | 37,86 | 46,31 |
| PSC | Macro-F1 | 57,28 | 85,87 |
| AR | MAE down | 0,5929 | 0,5753 |

En el experimento de filtrado de documentos, el modelo fue fine-tuned para un pipeline con cuatro decisiones (KEEP, CLEAN, SPLIT, DROP) y comparado con `jhu-clsp/mmBERT-base` sobre un dataset V4 de 733 ejemplos:

| Métrica | mmBERT-base | ORIS Small C |
|---|---|---|
| Decision Macro-F1 | 0,4334 | 0,5015 |
| Decision Accuracy | 0,5185 | 0,6296 |
| Training time | 583,2 s | 124,4 s |
| Peak VRAM | 5,83 GiB | 0,52 GiB |

Además, en un benchmark del pipeline de filtrado completo sobre 256 documentos, ORIS Small C procesó 58,07 documentos por segundo frente a los 11,78 de mmBERT-base, con una latencia media de 17,22 ms por documento y un pico de VRAM de 0,252 GiB. Estos resultados son específicos de la tarea y no deben interpretarse como una superioridad universal sobre encoders más grandes.

## Requisitos de hardware

- VRAM estimada para inferencia: 0,252 GiB (252 MiB) en el benchmark del pipeline de filtrado del autor.
- VRAM estimada para fine-tuning: 0,52 GiB en el experimento de filtrado de documentos.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM, incluyendo GPUs de consumo como RTX 3060 o inferiores. El modelo puede ejecutarse también en CPU.
- Capacidad en GPU de consumo: sí, el modelo cabe en prácticamente cualquier GPU consumer disponible.
- Opciones de despliegue: compatible con la librería Transformers de HuggingFace y con el pipeline `feature-extraction`. No se mencionan integraciones específicas con vLLM, llama.cpp u otros motores de inferencia.
- Latencia y throughput estimados: 17,22 ms por documento y 58,07 documentos por segundo en el benchmark del pipeline de filtrado del autor, ejecutado con la configuración original.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento destacado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ORIS-Bert-Small-C | 25,41M | 1024 tokens | Competitivo en KLEJ y filtrado de documentos con baja VRAM | oris-research-license | HuggingFace |
| PolBERTa base | 110,62M | no disponible | Mejor en NKJP-NER, PSC, DYK | no disponible | HuggingFace |
| mmBERT-base | no disponible | no disponible | Peor en filtrado de documentos en la comparativa del autor | no disponible | HuggingFace |

En la comparativa de KLEJ, PolBERTa base supera a ORIS Small C en la mayoría de las tareas, pero ORIS lo hace con 4,35 veces menos parámetros. En el experimento de filtrado de documentos, ORIS Small C supera a mmBERT-base en precisión y macro-F1, con un tiempo de entrenamiento 4,7 veces menor y un consumo de VRAM 11 veces inferior.

## Limitaciones y advertencias

- No se recomienda su uso para recuperación zero-shot con mean pooling sin fine-tuning: la agrupación media produce un espacio muy anisotrópico, con una similitud coseno media de ~0,987 entre textos no relacionados.
- No está recomendado para predicciones fill-mask calibradas ni para generación autoregresiva, ya que es un modelo encoder y no ha sido diseñado para esas tareas.
- El modelo solo está entrenado para polaco; su calidad fuera de este idioma no es equivalente y no se recomienda su uso en otros idiomas.
- Los benchmarks de KLEJ no fueron enviados al leaderboard oficial y el propio equipo considera que el checkpoint es una versión conceptual, no un modelo final.
- La licencia es `oris-research-license`, una licencia de investigación. Es necesario revisar los términos de la licencia para determinar si permite uso comercial.
- No se han publicado datos sobre sesgos específicos o riesgos de alucinación; al ser un modelo encoder, el riesgo de alucinación generativa no aplica.
- La ventana de contexto es de 1024 tokens, lo que limita el procesamiento de documentos muy largos sin truncamiento o estrategias de chunking.

## Enlaces

- Modelo original en HuggingFace: https://huggingface.co/OrisTeam/ORIS-Bert-Small-C
- Copia en HuggingFace: https://huggingface.co/Aleksander22/ORIS-Bert-Small-C-copy
- Pipeline de benchmarks KLEJ (The KLEJ Benchmark Baselines): no disponible
- Paper o documentación técnica adicional: no disponible
