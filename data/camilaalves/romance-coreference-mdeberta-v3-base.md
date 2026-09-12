# camilaalves/romance-coreference-mdeberta-v3-base

## Resumen

El modelo `camilaalves/romance-coreference-mdeberta-v3-base` es un sistema de resolución de correferencia multilingüe para lenguas románicas, desarrollado por Camila Alves en el marco de su tesis de máster *Coreference in Context: Portuguese Evaluation of Multilingual and Monolingual Models* (Universidad de Oporto, 2026). Se trata de un modelo de investigación, no de un modelo generativo: su tarea es identificar qué menciones textuales (pronombres, sintagmas nominales, nombres propios) se refieren a la misma entidad dentro de un documento.

La arquitectura sigue el paradigma de *span-ranking* y utiliza `microsoft/mdeberta-v3-base` como encoder Transformer multilingüe preentrenado. El modelo se entrenó de forma conjunta sobre seis corpus de correferencia en cinco idiomas: Coref-PT (portugués), Spanish AnCora, Catalan AnCora, French ANCOR, French Democrat y OntoCorefIT (italiano). Un único modelo conjunto se evalúa sobre cada corpus, seleccionando el checkpoint según el conjunto de desarrollo correspondiente.

El repositorio no contiene un modelo listo para usar con las APIs estándar de HuggingFace, sino cinco checkpoints de PyTorch (`.pt`) producidos por una implementación propia de correferencia. Su relevancia actual es fundamentalmente académica y de reproducibilidad: aporta evidencia sobre si un modelo multilingüe conjunto compite con modelos monolingües en tareas de correferencia en lenguas románicas, un área con pocos recursos abiertos fuera del inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (mDeBERTa-v3) con cabeza de *span-ranking* para correferencia |
| Parametros totales | no disponible (el encoder base `microsoft/mdeberta-v3-base` declara 86 M en el backbone) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (el encoder base está limitado a 512 posiciones) |
| Tipos de cuantizacion | no disponible; los checkpoints se distribuyen en precisión completa (fp32) |
| Idiomas soportados | pt, es, ca, fr, it |
| Licencia | no disponible (el modelo base `microsoft/mdeberta-v3-base` es MIT) |
| Formato de pesos | PyTorch `.pt` (checkpoints de implementación propia; no `safetensors`, no `GGUF`) |

## Arquitectura y entrenamiento

El sistema implementa una arquitectura de resolución de correferencia por *span-ranking*: se enumeran las posibles menciones del documento, se puntúan los pares antecedente-mención y se selecciona el antecedente más probable para cada mención, con una mención nula implícita. El codificador subyacente es `microsoft/mdeberta-v3-base`, un Transformer multilingüe con atención desenredada y decodificador de embeddings mejorado, preentrenado sobre datos multilingües. El modelo se entrena de forma conjunta sobre los seis corpus citados, en lugar de entrenar un modelo por idioma, y después se evalúa sobre cada corpus por separado.

La model card no detalla el número de tokens de entrenamiento, la composición exacta de los conjuntos ni si se aplicaron técnicas de ajuste por preferencias (RLHF/DPO); en una tarea extractiva como esta, ese tipo de ajuste no resulta habitual. El aspecto metodológico más destacable es la selección de checkpoint por conjunto de desarrollo: cada evaluación final usa la época óptima para ese corpus, con umbral de decisión 0.0 en todos los casos. Las épocas seleccionadas varían notablemente entre idiomas (17 para OntoCorefIT, 20 para French ANCOR, 28 para French Democrat, 38 para Coref-PT y 39 para Spanish y Catalan AnCora), lo que sugiere dinámicas de convergencia distintas según el corpus. Como Spanish AnCora y Catalan AnCora eligieron la misma época, se publican cinco ficheros únicos.

## Capacidades

- Resolución de correferencia de documentos completos en portugués, español, catalán, francés e italiano.
- Agrupación de menciones en cadenas o clústeres de entidades, con puntuación de cada par mención-antecedente.
- Transferencia cross-lingüe: un único conjunto de pesos entrenado de forma conjunta cubre las seis colecciones de datos de cinco idiomas.
- Manejo de distintos géneros textuales según el corpus de origen: noticias (AnCora en es/ca, ANCOR en fr), textos periodísticos y de otro tipo (Democrat, Coref-PT) y datos de OntoCorefIT.
- No dispone de decodificación generativa, ni de *tool calling*, ni de modo *thinking*: es un modelo discriminativo de etiquetado estructurado.
- No se documentan capacidades de visión ni de audio.
- No se documenta soporte de agentes ni razonamiento multi-paso.

## Casos de uso

- Anonimización y pseudonimización de documentación clínica o legal en español y portugués: el modelo agrupa todas las menciones de un mismo paciente o parte implicada, de modo que una única decisión de enmascarado cubre todas sus apariciones y evita fugas de identidad dentro del documento.
- Construcción de grafos de conocimiento y extracción de relaciones: al agrupar menciones en entidades, sirve como paso previo a la extracción de tripletas sujeto-relación-objeto en corpus multilingües, reduciendo la duplicación de nodos por variantes de nombre.
- Resumen abstractivo multilingüe con coherencia referencial: los clústeres de correferencia permiten mantener el referente estable al condensar textos largos en portugués, catalán, francés o italiano, un problema recurrente en generación abstractiva.
- Preprocesado para traducción automática: la información de correferencia ayuda a resolver pronombres ambiguos antes o después de traducir entre lenguas románicas, donde el género gramatical y la elipsis del sujeto introducen errores sistemáticos.
- Análisis de discurso y seguimiento de participantes en conversaciones multi-turno: resulta adecuado para atribuir intervenciones y referencias a los mismos interlocutores en transcripciones de reuniones o atención al cliente en portugués o español.
- Evaluación comparativa de modelos multilingües frente a monolingües en investigación académica: el repositorio publica checkpoints por época, lo que permite reproducir el protocolo de la tesis y auditar la selección por conjunto de desarrollo.
- Sistemas de búsqueda y recuperación de información jurídica: enlazar automáticamente menciones de una misma norma, institución o persona a lo largo de expedientes en varias lenguas románicas mejora la recuperación de documentos relacionados.
- Enriquecimiento de corpus para anotación asistida: los clústeres generados pueden precargarse en herramientas de anotación, reduciendo el esfuerzo manual de anotadores en lenguas con pocos recursos como el catalán o el portugués.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica únicamente que la evaluación utiliza las métricas estándar de correferencia MUC, B³, CEAF-e, su media (CoNLL F1) y los umbrales de decisión por conjunto, pero no incluye cifras de resultados.

| Metrica | Resultado |
|---|---|
| MUC | no disponible |
| B³ | no disponible |
| CEAF-e | no disponible |
| CoNLL F1 (media) | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Al tratarse de un encoder de tipo base con cabeza de span-ranking, la inferencia es ligera en comparación con modelos generativos; se estima un rango aproximado de 1 a 4 GB según la precisión y el tamaño del lote, aunque no hay cifras publicadas por el autor.
- GPU recomendadas: cualquier GPU con al menos 8 GB de memoria (RTX 3060, RTX 4060, RTX 4090) debería ser suficiente para inferencia; modelos de datacenter como A100 o H100 solo serían necesarios para reentrenamiento o evaluación masiva.
- Cabe en GPU de consumo: sí, previsiblemente en la mayoría de GPU de consumo modernas, aunque el requisito exacto no está documentado.
- Opciones de despliegue: no compatible directamente con vLLM, TGI, Ollama, llama.cpp ni `AutoModel.from_pretrained()`. La model card indica explícitamente que los ficheros son checkpoints de PyTorch producidos por una implementación propia y que se requiere dicha implementación y su configuración experimental para reproducir la inferencia.
- Latencia y throughput estimados: no disponible.
- Almacenamiento: el repositorio ocupa 5,8 GB e incluye cinco checkpoints (`checkpoint_epoch_17.pt`, `_20.pt`, `_28.pt`, `_38.pt`, `_39.pt`).

## Comparativa con modelos similares

No se han identificado en la información proporcionada otros modelos de correferencia multilingüe de lenguas románicas comparables. Como referencia, se compara con el encoder base sobre el que se construye.

| Modelo | Parametros | Contexto | Idiomas | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| camilaalves/romance-coreference-mdeberta-v3-base | no disponible (base de 86 M en el backbone) | no disponible | pt, es, ca, fr, it | Correferencia (span-ranking) | no disponible | Checkpoints `.pt` propietarios, sin API estándar |
| microsoft/mdeberta-v3-base | 86 M en el backbone | 512 posiciones | Más de 100 idiomas | Encoder preentrenado (MLM) | MIT | Pesos `safetensors`/PyTorch con `AutoModel` |
| Otros modelos de correferencia multilingüe | no disponible | no disponible | no disponible | Correferencia | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo generativo ni un modelo de lenguaje causal: no puede usarse para chat, generación de texto, código ni *tool calling*.
- Los pesos no son cargables con `AutoModel.from_pretrained()`; requieren la implementación propia del autor, que no se distribuye en este repositorio, lo que limita seriamente su reutilización directa.
- No se especifica licencia en los metadatos ni en la model card: el uso comercial queda en un estado jurídico indeterminado y debe consultarse con la autora antes de cualquier despliegue en producción.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de cadenas de correferencia incorrectas (menciones mal enlazadas o fusiones espurias de entidades), especialmente en géneros textuales distintos de los corpus de entrenamiento.
- Sesgos conocidos: no documentados. Los corpus de entrenamiento (AnCora, ANCOR, Democrat, OntoCorefIT, Coref-PT) condicionan el dominio y el registro; el comportamiento fuera de esos géneros es incierto.
- Cobertura limitada a cinco lenguas románicas; no hay soporte para gallego, rumano, occitano ni otras lenguas de la familia.
- El umbral de decisión 0.0 en todos los corpus sugiere que el modelo no está calibrado de forma específica por dominio; ajustar el umbral puede ser necesario en aplicaciones reales.
- Cada checkpoint corresponde a una época óptima para un corpus concreto, por lo que usar el fichero equivocado para el idioma objetivo degrada el rendimiento esperado.
- No se han publicado cifras de MUC, B³, CEAF-e ni CoNLL F1, de modo que no es posible verificar el rendimiento real frente a alternativas.
- El repositorio tiene cero descargas y cero valoraciones, y no cuenta con pipeline declarado: no hay evidencia de uso comunitario ni de validación externa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/camilaalves/romance-coreference-mdeberta-v3-base
- Modelo base: https://huggingface.co/microsoft/mdeberta-v3-base
- Cita de la tesis: Camila Alves. *Coreference in Context: Portuguese Evaluation of Multilingual and Monolingual Models*. MSc thesis, University of Porto, 2026 (sin URL disponible)
- Otros enlaces relevantes (papers, repositorios, demos): no disponible. Los resultados de la búsqueda web proporcionados no guardan relación con el modelo y se han descartado.
