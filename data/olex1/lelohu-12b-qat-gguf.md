# OLEX1/Lelohu-12B-QAT-GGUF

## Resumen

Lelohu-12B-QAT-GGUF es una distribución en formato GGUF de un modelo de lenguaje de 11.907.350.576 parámetros (aproximadamente 11,9B), publicada por el usuario OLEX1 en HuggingFace bajo licencia Apache 2.0. El repositorio contiene únicamente pesos cuantizados listos para inferencia con llama.cpp y derivados, y lleva el sufijo "QAT", que en la práctica se asocia a cuantización consciente del entrenamiento (*quantization-aware training*). No obstante, la model card publicada está vacía: solo incluye la línea de licencia, sin descripción, sin arquitectura declarada y sin indicación del modelo base sobre el que se ha construido.

El interés de esta ficha es, por tanto, limitado y fundamentalmente práctico: se trata de un artefacto de despliegue de ~7 GB que puede ejecutarse en hardware de consumo, pero del que no se ha documentado nada verificable más allá del recuento de parámetros y la licencia. No hay información sobre el tokenizador, la longitud de contexto, los idiomas soportados, el dataset de entrenamiento ni las variantes de cuantización incluidas en el repositorio.

Cualquier evaluación seria de este modelo requiere inspeccionar directamente los archivos del repositorio, leer los metadatos internos del GGUF (que suelen conservar el nombre del modelo base y el tokenizador) y ejecutar pruebas propias. Hasta entonces, debe tratarse como un modelo no verificado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no declarada en la model card; el recuento de parámetros es compatible con un transformer denso, sin confirmar) |
| Parametros totales | 11.907.350.576 (≈11,9B, dato de safetensors) |
| Parametros activos | no disponible (no se indica que sea MoE; no hay desglose de parámetros activos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio no documenta las variantes incluidas; el tamaño total de 7,0 GB para 11,9B parámetros es compatible con cuantizaciones de aproximadamente 4-5 bits, pero es una inferencia, no un dato publicado) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |
| Tamano del repositorio | 7,0 GB |
| Pipeline declarado | no disponible |
| Fecha de publicacion | 2026-10-23 |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura. La model card no especifica si se trata de un transformer denso, un modelo de mezcla de expertos, una arquitectura híbrida con componentes de espacio de estados o cualquier otra variante. El único dato estructural fiable es el recuento de parámetros (11,9B) y el hecho de que los pesos distribuidos están en GGUF, lo que implica que el autor partió de un modelo en precisión completa o media y aplicó un proceso de cuantización posterior (o un modelo ya entrenado con QAT).

Tampoco hay datos sobre el corpus de entrenamiento: se desconoce el número de tokens, la composición del dataset, la existencia de fases de ajuste fino supervisado, RLHF o DPO, y el tokenizador empleado. El sufijo "QAT" sugiere que el modelo base fue entrenado con cuantización simulada durante el *fine-tuning* o el preentrenamiento, lo que en teoría reduce la degradación de calidad al pasar a 4 bits, pero no hay ninguna métrica publicada que lo respalde en este caso.

## Capacidades

- Generación de texto conversacional: el tag `conversational` del repositorio es el único indicio de que el modelo está ajustado para diálogo de múltiples turnos, sin que se detalle el formato de plantilla de chat.
- Razonamiento y conocimiento general: capacidad esperable por tamaño (≈12B) pero no verificada; no hay benchmarks ni evaluaciones cualitativas publicadas.
- Generación de código y matemáticas: no disponible; no se ha documentado ningún resultado en HumanEval, MBPP, GSM8K o similares.
- Tool calling / function calling: no disponible; no hay evidencia de soporte de esquemas de herramientas ni de formatos estructurados.
- Uso en agentes y razonamiento multi-paso: no disponible; sin modo *thinking* documentado ni trazas de razonamiento expuestas.
- Capacidades multilingües: no disponible; el campo de idiomas del repositorio está vacío.
- Visión, audio u otras modalidades: no disponible; no se declara ninguna.
- Capacidades especiales (decodificación especulativa, atención lineal, etc.): no disponible.

## Casos de uso

Los siguientes escenarios son los habituales para un modelo denso de ~12B cuantizado a 4-5 bits, pero deben validarse empíricamente antes de llevarlos a producción, dado que no existe documentación del modelo.

- Prototipado local en estación de trabajo: al ocupar unos 7 GB en disco, el modelo se puede cargar con llama.cpp u Ollama en una GPU de consumo de 12-16 GB o incluso en CPU con RAM suficiente, lo que permite iterar en el diseño de prompts sin coste de API.
- Asistente conversacional de ámbito general: el tag `conversational` indica que el modelo está pensado para diálogo; encajaría en un chatbot interno o de soporte de baja criticidad, siempre que se valide la calidad de las respuestas en el dominio concreto.
- Generación de borradores de texto y resúmenes: tareas de transformación de texto donde los errores son revisables por un humano y no hay requisitos estrictos de exactitud factual.
- Experimentación académica con cuantización: el interés del sufijo QAT es precisamente medir la degradación respecto al modelo en precisión completa; sirve como objeto de estudio en trabajos sobre cuantización de LLM.
- Sustitución de un modelo mayor en entornos con restricciones de VRAM: cuando el presupuesto de memoria es de 8-16 GB, un 12B en 4 bits es un compromiso razonable frente a alternativas de 7B.
- Pipeline de generación por lotes en CPU: para tareas offline no interactivas (etiquetado, clasificación aproximada, expansión de textos) donde el throughput importa más que la latencia por token.
- Evaluación comparativa de formatos GGUF: útil para medir diferencias prácticas de velocidad y perplejidad entre niveles de cuantización sobre el mismo modelo base, una vez identificado este.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El repositorio no incluye MMLU, HumanEval, GSM8K, MT-Bench, perplejidad ni ninguna otra métrica, ni comparaciones con modelos de referencia. Tampoco se documentan mediciones de latencia o throughput (tokens por segundo) en ningún hardware.

## Requisitos de hardware

Las cifras siguientes son estimaciones calculadas a partir del recuento de parámetros (11,9B) y de fórmulas estándar de tamaño de pesos; no proceden de mediciones publicadas para este modelo concreto.

- VRAM estimada para inferencia (solo pesos):
  - FP16 / BF16: ≈23,8 GB
  - 8 bits: ≈12,6 GB
  - 4 bits: ≈6,7 GB (consistente con el tamaño de 7,0 GB del repositorio, que incluye metadatos y posiblemente varios archivos)
- Overhead adicional: reservar 1-3 GB por encima del tamaño de los pesos para caché KV, contexto y buffers de inferencia; la cifra exacta depende de la longitud de contexto, que se desconoce.
- GPU recomendadas:
  - 4 bits: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 Ti Super, RTX 4090 (24 GB) con margen amplio para contexto largo.
  - 8 bits: RTX 4090, RTX A6000 (48 GB), L40S.
  - FP16: A100 40/80 GB, H100.
- Cabe en GPU de consumo: sí, en cuantización de 4 bits en tarjetas de 12 GB o más; en 8 bits requiere 16 GB o más.
- Despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp y cualquier runtime compatible con GGUF. vLLM y TGI admiten GGUF de forma parcial y con mejor soporte para otros formatos de cuantización; si se necesita alto throughput en servidor, conviene convertir a un formato nativo de vLLM.
- Latencia y throughput: no disponible. No hay mediciones publicadas de tokens por segundo, TTFT ni consumo de memoria en ningún hardware.

## Comparativa con modelos similares

La comparación es necesariamente incompleta: al desconocerse el modelo base de Lelohu-12B y no existir benchmarks publicados, solo es posible contrastar parámetros, licencia y disponibilidad. Los datos de los competidores provienen de sus fichas públicas.

| Modelo | Parametros | Contexto | Licencia | Formato | Datos publicados |
|---|---|---|---|---|---|
| Lelohu-12B-QAT-GGUF | 11,9B | no disponible | Apache 2.0 | GGUF | Ninguno |
| Mistral NeMo 12B | 12B | 128k tokens | Apache 2.0 | safetensors, GGUF | Benchmarks y model card completos |
| Gemma 3 12B | 12B | 128k tokens | Gemma Terms of Use (no Apache) | safetensors, GGUF | Benchmarks y model card completos |

Diferencias clave: Mistral NeMo 12B y Gemma 3 12B son modelos documentados, con tokenizador conocido, contexto declarado y evaluaciones publicadas, lo que permite planificar su uso en producción. Lelohu-12B no ofrece ninguna de esas garantías, por lo que su adopción implica un trabajo de validación previo equivalente al de un modelo propio. En contrapartida, su licencia Apache 2.0 es más permisiva que la de Gemma 3 para uso comercial sin restricciones adicionales, siempre que se confirme que el modelo base efectivamente permitía la redistribución bajo esos términos.

## Limitaciones y advertencias

- Documentación inexistente: la model card solo contiene la licencia. No se puede determinar el modelo base, el tokenizador, el contexto máximo ni el formato de prompt de chat sin inspeccionar los metadatos del GGUF.
- Procedencia incierta: si el modelo deriva de un modelo base con licencia no compatible con Apache 2.0, la licencia declarada podría no ser válida. Conviene verificar la cadena de procedencia antes de un uso comercial.
- Riesgo de alucinación: no evaluado. Al no haber benchmarks ni pruebas de factualidad, no se puede estimar la tasa de errores en tareas de conocimiento.
- Sesgos: no documentados. No hay información sobre composición del dataset ni sobre mitigaciones aplicadas, por lo que se deben asumir sesgos propios de un corpus web sin filtrar.
- Limitaciones de contexto e idioma: desconocidas. Si el modelo no soporta castellano de forma nativa, la calidad en español puede ser notablemente inferior a la de modelos con cobertura multilingüe declarada.
- Degradación por cuantización: aunque el sufijo QAT sugiere un entrenamiento tolerante a la cuantización, no hay ninguna comparación publicada frente a los pesos originales que lo confirme.
- Reputación del repositorio: 0 descargas y 0 likes en el momento de la consulta, sin historial de mantenimiento. No hay garantía de que el autor publique correcciones o variantes adicionales.
- Uso en producción: no recomendable sin una batería de evaluaciones propia (perplejidad, pruebas en el dominio, medición de latencia) y sin fijar una revisión concreta del repositorio para evitar cambios inesperados.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/OLEX1/Lelohu-12B-QAT-GGUF
- Paper, blog o demo oficiales: no disponible
- Repositorio de código asociado: no disponible
