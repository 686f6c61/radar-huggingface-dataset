# mjkenney/nla-ministral3-3b-codi

## Resumen

nla-ministral3-3b-codi es un fine-tune de investigación publicado por el usuario mjkenney sobre mistralai/Ministral-3-3B-Instruct-2512-BF16, el modelo denso de 3 000 millones de parámetros de la familia Ministral de Mistral AI. El repositorio no incluye model card descriptiva: la información disponible se limita a los tags, que apuntan a un artefacto orientado a interpretabilidad y razonamiento latente (nla, natural-language-autoencoder, o-lens, codi, latent-reasoning, interpretability, research).

La hipótesis de lectura de esos tags es que el modelo ha sido entrenado o adaptado para comprimir cadenas de razonamiento en espacio latente continuo (CODI), con un decodificador de lenguaje natural (NLA) que permita verbalizar esos estados ocultos, y alguna variante de inspección tipo «lens» (o-lens) para leer representaciones internas. Se trata, por tanto, de una herramienta de análisis de mecanismos internos más que de un modelo de propósito general listo para producción.

Su relevancia ahora es acotada pero específica: los derivados de Ministral 3B ofrecen una ventana de contexto amplia (hasta 128 000 tokens según la documentación de Mistral AI para el modelo base) en un tamaño que cabe en una GPU de consumo, lo que los convierte en un banco de pruebas asequible para experimentos de interpretabilidad y destilación de razonamiento. El acceso está restringido (gated) y el repositorio no registra descargas ni valoraciones en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada del modelo base Ministral 3 3B Instruct); adaptaciones de autoencoder en lenguaje natural (NLA), o-lens y razonamiento latente continuo (CODI) según los tags |
| Parámetros totales | ~3 000 millones (heredados del modelo base; no verificado de forma independiente en la ficha) |
| Parámetros activos | no aplica (modelo denso, según el modelo base) |
| Longitud de contexto | no disponible en la ficha; el modelo base Ministral 3B declara hasta 128 000 tokens según la documentación de Mistral AI |
| Tipos de cuantización | no disponible; el repositorio solo publica safetensors (presumiblemente BF16, sin confirmar). No hay GGUF, AWQ ni GPTQ publicados |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamaño total del repositorio: 4,0 GB) |

## Arquitectura y entrenamiento

La base es un transformer decoder-only denso de 3 000 millones de parámetros, tal y como corresponde a Ministral 3 3B Instruct (variante con código de fecha 2512, es decir, diciembre de 2025). Sobre esa base, los tags del repositorio indican que se ha aplicado algún tipo de ajuste fino orientado a tres frentes: (1) NLA o autoencoder en lenguaje natural, que típicamente entrena un módulo para reconstruir o verbalizar estados internos del modelo; (2) CODI, sigla asociada en la literatura a la compresión de cadenas de pensamiento en espacio continuo mediante autodestilación; y (3) o-lens, presumiblemente una técnica de inspección de representaciones análoga a logit lens o tuned lens.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni los hiperparámetros del ajuste. Tampoco se detalla si el fine-tune afecta a la totalidad de los pesos o solo a módulos añadidos; el tamaño del repositorio (4,0 GB) es inferior a los ~6 GB que ocuparían 3 000 millones de parámetros en BF16, lo que sugiere o bien pesos parciales, o bien algún esquema de compresión, o bien que el cómputo del tamaño excluye algunos ficheros. Este punto no puede confirmarse con la información disponible.

## Capacidades

- Generación de texto y razonamiento conversacional heredados del modelo base Ministral 3 3B Instruct.
- Razonamiento en espacio latente continuo (CODI): la hipótesis de uso es que el modelo puede producir representaciones de pensamiento comprimidas en lugar de cadenas de texto explícitas.
- Verbalización de estados internos mediante el módulo NLA, orientada a auditar qué información codifica el modelo en sus capas ocultas.
- Inspección de representaciones con o-lens, útil para comparar la evolución de activaciones capa a capa.
- Soporte de tool calling y function calling: no confirmado en la ficha; el modelo base lo soporta, pero el fine-tune podría haber degradado esta capacidad.
- Capacidades de agente y razonamiento multi-paso: no confirmadas para este derivado.
- Capacidades multilingües: no disponibles en la ficha (el modelo base es multilingüe, pero no se especifica el subconjunto conservado).
- Capacidad especial: orientación explícita a investigación en interpretabilidad, no a despliegue de producto.

## Casos de uso

- Auditoría de razonamiento latente: usar el módulo NLA para traducir a lenguaje natural los estados ocultos que el modelo genera al resolver un problema y compararlos con la cadena de pensamiento explícita, con el objetivo de detectar atajos o razonamiento post-hoc.
- Investigación en compresión de chain-of-thought: emplear la variante CODI para medir cuánta información de una cadena de razonamiento de N pasos se conserva al comprimirla en un número reducido de tokens latentes, evaluando la pérdida de exactitud en tareas aritméticas o de sentido común.
- Análisis de mecanismos internos con o-lens: aplicar la técnica de inspección sobre prompts controlados para estudiar en qué capas emerge la información factual o la intención de respuesta, aprovechando que un modelo de 3B permite ejecutar cientos de experimentos en una sola GPU.
- Destilación de razonamiento a modelos pequeños: generar trazas latentes o verbalizaciones con este modelo y utilizarlas como señal de entrenamiento para estudiantes aún más pequeños, un flujo habitual en investigación sobre razonamiento eficiente.
- Evaluación de seguridad y alineamiento: comparar la salida textual con la representación latente para detectar divergencias entre lo que el modelo «piensa» y lo que «dice», un caso de uso clásico de los autoencoders en lenguaje natural.
- Docencia y reproducción de experimentos: al caber en GPUs de consumo y tener licencia Apache 2.0, sirve como banco de pruebas reproducible en cursos de interpretabilidad o en revisiones por pares que necesiten reejecutar resultados.
- Prototipado de asistentes ligeros: si el fine-tune no ha degradado las capacidades del modelo base, podría usarse para tareas de extracción de información o clasificación con contexto largo; conviene validarlo empíricamente antes de adoptarlo, dado que no hay benchmarks publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de MMLU, HumanEval, GSM8K ni evaluaciones específicas de interpretabilidad, y la model card no aporta comparaciones con el modelo base.

## Requisitos de hardware

- VRAM estimada en BF16/FP16: en torno a 6-7 GB solo para pesos, más 1-4 GB de caché KV según longitud de contexto y lote; orientativo para un modelo denso de 3B.
- VRAM estimada en INT8/FP8: aproximadamente 3,5-4 GB de pesos.
- VRAM estimada en cuantización de 4 bits: en torno a 2 GB de pesos, lo que permitiría inferencia en GPUs de 6-8 GB.
- GPU recomendadas: RTX 4090, RTX 4080, RTX 3090, A100 o H100 para experimentos por lotes; RTX 4060 Ti de 16 GB o RTX 3060 de 12 GB como opciones de consumo suficientes en BF16.
- Cabe en GPU de consumo: sí, en cualquier tarjeta con 8 GB o más usando cuantización, y con 12 GB o más en BF16.
- Opciones de despliegue: transformers (la vía natural dado que solo hay safetensors), vLLM o TGI para servido con lote, y llama.cpp u Ollama únicamente si se convierte manualmente a GGUF, ya que no hay cuantizaciones publicadas.
- Latencia y throughput: no disponibles. Como referencia orientativa no verificada, un denso de 3B en BF16 sobre una RTX 4090 suele moverse en el orden de decenas a un centenar de tokens por segundo en decodificación, pero este dato debe medirse en el entorno concreto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Orientación | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nla-ministral3-3b-codi (este) | ~3 000 M | no disponible (base: hasta 128 000) | Investigación en interpretabilidad y razonamiento latente | Apache 2.0 | Gated en HuggingFace, 0 descargas |
| Ministral 3 3B Instruct (modelo base) | 3 000 M | 128 000 tokens según Mistral AI | Asistente general, edge | Apache 2.0 | Público |
| Llama 3.2 3B Instruct | 3 200 M | 128 000 tokens | Asistente general | Llama 3.2 Community License | Público, requiere aceptación |
| Qwen2.5 3B Instruct | 3 000 M | 32 768 tokens nativos | Asistente general multilingüe | Apache 2.0 | Público |

La comparación relevante no es de rendimiento —no hay datos— sino de naturaleza: los tres alternativos son modelos de propósito general con evaluaciones publicadas, mientras que este repositorio es un artefacto de investigación sin métricas y con acceso restringido.

## Limitaciones y advertencias

- Ausencia total de model card: no se documentan datos de entrenamiento, metodología del fine-tune, hiperparámetros ni evaluación. Cualquier uso en producción parte de una base no verificable.
- Sin benchmarks: no hay evidencia publicada de que las capacidades del modelo base se conserven tras el ajuste; es plausible una degradación en instrucciones, tool calling o multilingüismo.
- Riesgo de alucinación: no evaluado. Al tratarse de un modelo orientado a verbalizar estados internos, existe un riesgo específico de que el módulo NLA genere explicaciones plausibles pero no fieles a la representación real, lo que invalidaría conclusiones de interpretabilidad si no se valida con controles.
- Idiomas no especificados: no puede asumirse soporte de castellano ni de otros idiomas distintos del inglés sin probarlo.
- Licencia Apache 2.0: permisiva para uso comercial según los términos de la licencia, pero el acceso está restringido en HuggingFace, por lo que es necesario aceptar las condiciones del repositorio antes de descargar los pesos. Conviene revisar si esas condiciones añaden restricciones adicionales más allá de la licencia declarada.
- Madurez: creado y actualizado el 25 de octubre de 2026, con 0 descargas y 0 valoraciones. No hay señales de uso comunitario ni de mantenimiento.
- Naturaleza del artefacto: si el fine-tune solo entrena módulos auxiliares (por ejemplo, el autoencoder o los adaptadores de inspección), tratar el repositorio como un modelo conversacional completo puede llevar a resultados erróneos. Verificar la estructura de ficheros antes de integrarlo.
- Tamaño del repositorio (4,0 GB) inferior al esperado para 3B en BF16: comprobar si faltan shards o si los pesos están en un formato distinto antes de asumir que la descarga es completa.

## Enlaces

- HuggingFace: https://huggingface.co/mjkenney/nla-ministral3-3b-codi
- Modelo base: https://huggingface.co/mistralai/Ministral-3-3B-Instruct-2512-BF16
- Paper de CODI, blog del autor, repositorio de código y demos: no disponibles en la información proporcionada.
