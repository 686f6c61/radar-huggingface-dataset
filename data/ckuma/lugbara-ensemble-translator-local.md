# ckuma/lugbara-ensemble-translator-local

## Resumen

El modelo `ckuma/lugbara-ensemble-translator-local` es un sistema de traducción automática neuronal para el par de idiomas inglés–lugbara (lgg), una lengua de bajos recursos hablada principalmente en el norte de Uganda y zonas de la República Democrática del Congo y Sudán del Sur. Lo desarrolla C. D. Akuma en el marco de su tesis de máster en la Muni University (octubre de 2025), y se publica bajo licencia Apache 2.0 en Hugging Face. El modelo aborda el problema clásico de la traducción automática en lenguas de bajos recursos, donde los corpus paralelos disponibles son escasos y los modelos multilingües genéricos rinden de forma insuficiente.

Técnicamente es un ensemble por fusión de dos codificadores: un codificador XLM-RoBERTa-base y un codificador mT5-base, cuyas representaciones se proyectan a un espacio conjunto y alimentan un decodificador mT5 que atiende sobre ambos estados en cada paso de generación. La innovación respecto a los modelos individuales es que aprovecha el mejor rendimiento de XLM-R en la dirección inglés→lugbara y el de mT5 en lugbara→inglés, unificándolos en una sola red bidireccional.

El modelo se entrena sobre el corpus local inglés–lugbara publicado con la tesis (14.277 pares de frases), no sobre el corpus SALT, lo que permite comparar ambos regímenes de entrenamiento. Es relevante ahora porque demuestra que la fusión de codificadores preentrenados multilingües mejora sustancialmente el BLEU frente a los modelos individuales en una lengua africana de bajos recursos, y porque publica todos los pesos, el código de fusión y las métricas de evaluación de forma abierta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble por fusión de doble codificador (XLM-RoBERTa-base + mT5-base) con decodificador mT5 compartido |
| Parametros totales | no disponible (repo de 3,5 GB; suma de XLM-R-base ~278M y mT5-base ~580M más capas de fusión) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en) y lugbara (lgg) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (encoders y `fusion_head.safetensors`), más código Python (`fusion_mt.py`, `lugbara_mt.py`) |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder-decoder con fusión de doble codificador. La frase de entrada se procesa en paralelo por un codificador XLM-RoBERTa-base y un codificador mT5-base. Las salidas del codificador XLM-R se proyectan mediante una capa lineal y una LayerNorm para alinearlas dimensionalmente con las del codificador mT5, y ambas se concatenan en una memoria conjunta. El decodificador mT5 atiende sobre esa memoria conjunta en cada paso de generación, y un vector aprendido de tipo de fuente indica al decodificador de qué codificador proviene cada estado. Este esquema sigue el enfoque de fusión de codificadores de Zhu et al. (2020), *Incorporating BERT into Neural Machine Translation*.

El entrenamiento se realizó sobre el corpus local inglés–lugbara publicado con la tesis (repositorio `Akuma1992/NLP-data-set`), con los mismos hiperparámetros que la variante entrenada sobre SALT (`ckuma/lugbara-ensemble-translator`), lo que permite una comparación controlada entre ambos corpus. El corpus local contiene 14.277 pares de frases; el split de test tiene 4.282 pares (2.141 por dirección). Se usan etiquetas de control `<2lgg>` y `<2en>` para indicar la dirección de traducción, y la entrada debe ir en minúsculas tal como en el entrenamiento. No se detalla en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF o DPO.

## Capacidades

- Traducción bidireccional inglés→lugbara y lugbara→inglés en un único modelo fusionado.
- Traducción de frases sueltas y oraciones completas con etiquetas de control de dirección (`<2lgg>`, `<2en>`).
- Manejo de texto en minúsculas, condición de entrenamiento que debe respetarse en inferencia.
- Integración con la librería `transformers` y pesos en safetensors con código Python propio.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidades multilingües limitadas a los dos idiomas del par (inglés y lugbara); no se documenta transferencia a otras lenguas.

## Casos de uso

- Traducción de documentación administrativa y sanitaria al lugbara: el modelo permite convertir avisos, formularios y material de salud pública del inglés al lugbara para comunidades del norte de Uganda, aprovechando que se entrenó específicamente sobre corpus local de esa región.
- Localización de contenido educativo: traducción de materiales escolares y textos de alfabetización al lugbara, un caso donde los modelos multilingües genéricos fallan por falta de cobertura de la lengua.
- Preservación lingüística y documentación: generación de traducciones de referencia para corpus lingüísticos y diccionarios, útil para investigadores que trabajan en lenguas nilóticas de bajos recursos.
- Traducción bidireccional en atención ciudadana: un único modelo cubre ambas direcciones, lo que simplifica el despliegue en servicios de atención que reciben texto en inglés o en lugbara indistintamente.
- Investigación en traducción de bajos recursos: sirve como línea base reproducible para comparar estrategias de fusión de codificadores, aumento de datos y entrenamiento con corpus locales frente a SALT.
- Evaluación comparativa de corpus: al compartir arquitectura e hiperparámetros con la variante SALT, permite aislar el efecto del corpus de entrenamiento en el rendimiento final, un caso de uso metodológico para tesis y papers.
- Integración en pipelines de traducción asistida: el código de fusión (`fusion_mt.py`) permite incorporar el modelo en flujos de preedición y posedición para traductores humanos que trabajan con lugbara.

## Benchmarks y rendimiento

Resultados sobre el split de test del corpus local (4.282 pares de frases, 2.141 por dirección):

| Direccion | BLEU | TER | Word F1 | chrF | Integridad de apostrofos | BLEU modelo individual | Mejor BLEU de la tesis |
|---|---|---|---|---|---|---|---|
| Inglés → lugbara | 13,42 | 82,04 | 0,3174 | 34,25 | 0,3279 | 0,6 (XLM-R solo, local) | 22,18 (XLM-R ajustado) |
| Lugbara → inglés | 13,40 | 74,95 | 0,3908 | 36,36 | – | 12,18 (mT5 solo, local) | 25,41 (mT5 ajustado) |

Comparación SALT frente a corpus local (BLEU / chrF):

| Direccion | Entrenado en | Test SALT | Test local |
|---|---|---|---|
| Inglés → lugbara | SALT | 8,14 / 35,22 | 10,21 / 33,73 |
| Inglés → lugbara | Corpus local (este modelo) | 11,06 / 31,04 | 13,42 / 34,25 |
| Lugbara → inglés | SALT | 5,72 / 26,53 | 6,96 / 27,08 |
| Lugbara → inglés | Corpus local (este modelo) | 19,58 / 38,42 | 13,40 / 36,36 |

Comparación restringida a frases no compartidas entre corpus (1.680 frases de test SALT y 1.492 de test local):

| Direccion | Entrenado en | Test SALT (no compartido) | Test local (no compartido) |
|---|---|---|---|
| Inglés → lugbara | SALT | 6,54 / 33,92 | 7,63 / 29,86 |
| Inglés → lugbara | Corpus local (este modelo) | 3,95 / 24,07 | 13,63 / 33,20 |
| Lugbara → inglés | SALT | 5,21 / 25,77 | 3,81 / 24,12 |
| Lugbara → inglés | Corpus local (este modelo) | 8,41 / 29,32 | 11,83 / 34,47 |

Las puntuaciones de la tesis proceden de su propio split y limpieza del corpus, por lo que son solo un punto de referencia. El autor advierte que 6.109 de los 14.277 pares locales comparten frase en inglés con la muestra SALT, y que 649 de las 2.141 frases de test locales están en el split de entrenamiento de SALT, por lo que las celdas cruzadas están parcialmente favorecidas por frases vistas en entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repo ocupa 3,5 GB y combina dos encoders base más un decodificador, por lo que en fp32 el peso en memoria es del orden de varios GB.
- GPU recomendadas: no disponible. Por tamaño de los componentes (XLM-R-base y mT5-base), es plausible su ejecución en GPUs de consumo con suficiente VRAM, pero el autor no publica requisitos.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible.
- Opciones de despliegue: la model card solo documenta el uso mediante `transformers` y `huggingface_hub.snapshot_download`, cargando el código propio `fusion_mt.py`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y al no haber pesos GGUF no es desplegable directamente en llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | BLEU en lugbara | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `ckuma/lugbara-ensemble-translator-local` (este) | no disponible (XLM-R-base + mT5-base + fusión) | no disponible | en, lgg | 13,42 (en→lgg) / 13,40 (lgg→en) en test local | Apache 2.0 | Hugging Face, pesos safetensors y código |
| `ckuma/lugbara-ensemble-translator` | misma arquitectura | no disponible | en, lgg | 8,14 (en→lgg) / 5,72 (lgg→en) en test SALT | Apache 2.0 | Hugging Face |
| `ckuma/lugbara-multilingual-translator-local` | no disponible | no disponible | multilingüe (incluye lgg) | no disponible | no disponible | Hugging Face |
| `ckuma/lugbara-multilingual-translator` | no disponible | no disponible | multilingüe (incluye lgg) | no disponible | no disponible | Hugging Face |

No se dispone de datos de benchmarks de modelos externos comparables (por ejemplo, NLLB o mT5 multilingüe sin ajuste) en la información proporcionada para incluirlos en la comparativa.

## Limitaciones y advertencias

- El BLEU absoluto es bajo (13,42 y 13,40) y el TER es alto (82,04 y 74,95), lo que indica que las traducciones distan de ser utilizables sin revisión humana en contextos críticos.
- El modelo se entrenó con entrada en minúsculas; usarlo con mayúsculas puede degradar la calidad de forma no documentada.
- El corpus de entrenamiento es pequeño (14.277 pares) y de un dominio limitado, por lo que la generalización a otros registros (técnico, legal, literario) es incierta.
- Existe solapamiento entre el corpus local y SALT (6.109 pares comparten frase en inglés), lo que puede inflar las métricas en evaluaciones cruzadas; el autor publica la comparación sin frases compartidas para mitigarlo.
- Las puntuaciones de la tesis (22,18 y 25,41 BLEU) no son directamente comparables con las de este modelo por diferencias de split y limpieza del corpus.
- Riesgo de alucinación y de traducciones gramaticalmente plausibles pero semánticamente incorrectas, habitual en modelos de traducción de bajos recursos; los ejemplos de la model card muestran salidas claramente erróneas en algunas frases.
- No se documentan sesgos específicos, pero al entrenarse sobre un corpus local limitado puede reflejar sesgos de dominio y de registro de ese corpus.
- La licencia Apache 2.0 permite uso comercial, pero la calidad actual hace recomendable la posedición humana en producción.
- El despliegue requiere cargar código Python propio (`fusion_mt.py`), lo que añade superficie de mantenimiento y no está soportado por servidores de inferencia estándar sin adaptación.
- No se documentan limitaciones explícitas de longitud de contexto; se desconoce el máximo de tokens soportado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ckuma/lugbara-ensemble-translator-local
- Variante entrenada sobre SALT: https://huggingface.co/ckuma/lugbara-ensemble-translator
- Variante multilingüe local: https://huggingface.co/ckuma/lugbara-multilingual-translator-local
- Variante multilingüe: https://huggingface.co/ckuma/lugbara-multilingual-translator
- Corpus de la tesis: https://github.com/Akuma1992/NLP-data-set
- Modelo base XLM-RoBERTa: https://huggingface.co/FacebookAI/xlm-roberta-base
- Modelo base mT5: https://huggingface.co/google/mt5-base
- Referencia técnica de fusión de codificadores: Zhu et al. (2020), *Incorporating BERT into Neural Machine Translation* (no se proporciona URL en la información disponible)
