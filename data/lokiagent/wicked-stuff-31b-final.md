# lokiagent/Wicked-Stuff-31B-Final

## Resumen

Wicked-Stuff-31B-Final es un ajuste fino (fine-tune) de tipo instruct/conversacional publicado por el usuario lokiagent en Hugging Face, derivado del modelo ReadyArt/gemma-4-31B-it-scotoma-2, que a su vez pertenece a la familia Gemma 4 (indicado por el tag `gemma4`). Con 31.273.086.512 parámetros reales en safetensors (31,27B), es un modelo denso de gran tamano orientado a generación de texto, no a visión ni a audio según los metadatos disponibles.

El modelo está explicitamente orientado a contenido para adultos: roleplay, ERP (erotic roleplay), narrativa explícita, terror y violencia, y lleva el tag `unaligned`, lo que indica que se ha reducido o eliminado total o parcialmente el alineamiento de seguridad del modelo base. El repositorio incluye el flag `not-for-all-audiences` y la model card arranca con un aviso de contenido. Es relevante ahora porque representa la corriente de fine-tunes "sin restricciones" sobre modelos abiertos de ultima generación, un nicho con demanda real en ficción interactiva y en investigación de seguridad de modelos.

La información publicada es escasa: la model card consiste practicamente en CSS y etiquetas de metadatos, sin detallar dataset, número de tokens de entrenamiento, método de ajuste ni resultados de evaluación. La licencia declarada es Apache 2.0 y el único idioma soportado declarado es el inglés.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Gemma 4 (deducido del tag `gemma4`); detalles internos no disponibles |
| Parametros totales | 31.273.086.512 (31,27B), dato real de los safetensors |
| Parametros activos | No aplica (no se ha documentado que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No se han publicado cuantizaciones en el repo (solo safetensors); precision nativa de 16 bits deducida del tamano del repo (62,6 GB para 31,27B de parametros) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | ReadyArt/gemma-4-31B-it-scotoma-2 (relación: finetune) |
| Pipeline | text-generation |
| Tamano del repositorio | 62,6 GB |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del base: un transformer decoder-only de la familia Gemma 4 con aproximadamente 31,3 mil millones de parámetros, ajustado sobre una variante "it" (instruction-tuned) del modelo. No se dispone de información sobre el número de capas, dimensiones ocultas, tipo de atención, vocabulario ni mecanismos adicionales (atención linear, decodificación especulativa, etc.), porque la model card no los documenta.

Respecto al entrenamiento, la información proporcionada no incluye ningún detalle: no se especifica el número de tokens del ajuste fino, la composición del dataset, si se usaron técnicas de RLHF, DPO, ORPO o simple SFT, ni hiperparámetros. El nombre del modelo base ("scotoma-2") y el tag `unaligned` sugieren una intervención deliberada sobre el comportamiento alineado del modelo original, pero no hay documentación técnica que describa el método (por ejemplo, abliteration o fine-tuning sobre datos sin filtrar). Tampoco se publican curvas de entrenamiento, evaluations ni notas de versión que distingan esta "Final" de iteraciones previas.

## Capacidades

- Generación de texto conversacional multi-turno en inglés, con foco en mantener personajes y registro narrativo.
- Roleplay y ERP (erotic roleplay) explícito, incluyendo contenido sexual adulto sin las restricciones habituales de los modelos alineados.
- Narrativa de terror y violencia explícita, según los tags `Horror` y `Violence`.
- Escritura creativa de ficción interactiva: diálogos, descripciones y desarrollo de escenas.
- Modo "unaligned": menor probabilidad de rechazos o evasivas ante peticiones que un modelo instruct estándar bloquearía, lo que afecta tanto a contenido adulto como potencialmente a otros dominios.
- Uso como modelo instruct general en inglés (el tag `instruct` está presente), aunque no hay evaluación que cuantifique su calidad en tareas estándar.
- Tool calling / function calling: no documentado, no disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado, no disponible.
- Capacidades multimodales (visión, audio): no disponibles; el pipeline es exclusivamente text-generation.
- Capacidades multilingües: limitadas al inglés declarado; no hay evidencia de soporte de castellano.

## Casos de uso

- Ficción interactiva para adultos: el modelo puede sostener conversaciones multi-turno con un personaje consistente, gestionando escenas explícitas y cambios de tono; adecuado para plataformas con verificación de edad y moderación propia.
- Escritura de narrativa de terror y violencia: útil como asistente de borradores para autores de género que necesitan descripciones crudas sin que el modelo suavice el contenido.
- Guionización de novelas visuales y videojuegos narrativos para adultos: generación de ramas de diálogo y variantes de respuesta por personaje, con la ventaja de que el fine-tune mantiene el registro solicitado.
- Prototipado de chatbots de personaje: permite evaluar rapidamente la coherencia de un personaje y su memoria conversacional antes de invertir en un modelo mayor o en un pipeline RAG.
- Red teaming y evaluación de seguridad: un modelo explícitamente `unaligned` sirve como caso adverso para probar clasificadores de contenido, filtros de salida y políticas de moderación en producción.
- Investigación sobre alineación y fine-tuning: comparar las respuestas de este modelo con las del base ReadyArt/gemma-4-31B-it-scotoma-2 permite estudiar qué comportamientos se ven afectados por el ajuste y con qué magnitud.
- Generación de material de rol de mesa (TTRPG) para grupos adultos: descripciones de escenas, PNJ y giros argumentales violentos o explícitos según la campaña.
- Dataset augmentation para entrenar clasificadores de contenido adulto o de violencia: generar ejemplos positivos controlados para modelos de moderación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K, MT-Bench ni ninguna otra evaluación, y tampoco se han encontrado datos de rendimiento en la búsqueda web realizada.

## Requisitos de hardware

- VRAM en 16 bits (formato nativo del repo): unos 62,5 GB solo para pesos (31,27B × 2 bytes); con caché KV y overhead de runtime hay que prever 70-80 GB.
- GPU recomendadas para 16 bits: A100 80 GB, H100 80 GB o H200; también 2× A100 40 GB o 2× L40S 48 GB con tensor parallelism.
- VRAM en 8 bits (si se genera la cuantización): aproximadamente 31-33 GB de pesos, 40-48 GB con caché; encaja en A100 40 GB con contexto corto, L40S 48 GB o 2× RTX 4090.
- VRAM en 4 bits (GGUF/AWQ/GPTQ): aproximadamente 17-19 GB de pesos; cabe en una RTX 4090, RTX 3090 o RTX 5090 de 24 GB, y en una RTX 4080 de 16 GB solo con contexto muy reducido.
- No cabe en GPUs consumer de 8-12 GB ni en CPU con latencia aceptable para uso conversacional en 16 bits; en CPU con 4 bits es posible pero con throughput muy bajo.
- Opciones de despliegue: vLLM, SGLang y TGI para safetensors en GPU (sujeto a que la arquitectura Gemma 4 esté soportada por la versión del runtime); llama.cpp y Ollama requieren convertir los pesos a GGUF, ya que el repositorio solo publica safetensors.
- No se han publicado datos de latencia ni de throughput (tokens/s) para este modelo.
- El repositorio pesa 62,6 GB, por lo que la descarga requiere espacio en disco equivalente y una conexión razonablemente rápida.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad | Notas |
|---|---|---|---|---|---|---|
| lokiagent/Wicked-Stuff-31B-Final | 31,27B | No disponible | Apache 2.0 | safetensors | Hugging Face, 0 descargas | Fine-tune NSFW/unaligned orientado a roleplay |
| ReadyArt/gemma-4-31B-it-scotoma-2 (base) | No disponible en la información | No disponible | No disponible en la información | No disponible | Hugging Face | Modelo de partida del finetune; sin datos de rendimiento en la información |
| Otras alternativas de ~30B para roleplay sin restricciones | No disponible | No disponible | No disponible | No disponible | No disponible | No se han proporcionado datos de modelos comparables |

No se dispone de información sobre modelos alternativos de la misma categoría (fine-tunes NSFW/unaligned de ~30B) en el material proporcionado, por lo que no es posible establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Contenido explícito: el modelo está diseñado para generar material sexual adulto, violencia y terror; no es apto para uso general sin filtrado y segmentación por edad.
- Flag `not-for-all-anudiences` y aviso de contenido en la propia model card: cualquier despliegue público debe incorporar verificación de edad y moderación.
- Modelo `unaligned`: la reducción del alineamiento puede afectar no solo al contenido adulto, sino también a la negativa ante peticiones dañinas en otros dominios; no debe exponerse directamente a usuarios sin capas de seguridad externas.
- Riesgo de alucinación: no hay evaluaciones que midan la fiabilidad factual; en un fine-tune orientado a ficción, la prioridad del modelo es la coherencia narrativa, no la exactitud.
- Limitación idiomática: solo inglés declarado; el rendimiento en castellano no está garantizado ni evaluado.
- Contexto desconocido: al no documentarse la ventana de contexto, no se puede asumir soporte para conversaciones muy largas ni para documentos extensos.
- Licencia Apache 2.0 en los metadatos, pero el modelo base podría arrastrar términos adicionales; conviene verificar la licencia del modelo base y de Gemma antes de un uso comercial, y tener en cuenta que la licencia no cubre obligaciones legales sobre contenido adulto.
- Sin tracción ni validación comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin issues ni discusiones que permitan contrastar calidad o stability.
- Documentación prácticamente inexistente: sin dataset, método de entrenamiento ni evaluaciones, lo que dificulta la reproducibilidad y la auditoría.
- Riesgo de sesgos no evaluados: al no haber evaluación publicada, se desconoce el comportamiento del modelo en cuanto a sesgos de género, etnia o edad, algo especialmente sensible en contenido para adultos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lokiagent/Wicked-Stuff-31B-Final
- Modelo base: https://huggingface.co/ReadyArt/gemma-4-31B-it-scotoma-2
- Resultados de la búsqueda web: no se han encontrado enlaces técnicos relevantes (papers, blogs, repos o demos) sobre este modelo; los resultados devueltos por el buscador no guardan relación con el modelo y se han descartado.
