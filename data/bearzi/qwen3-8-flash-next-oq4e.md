# bearzi/Qwen3.8-Flash-Next-oQ4e

## Resumen

Qwen3.8-Flash-Next-oQ4e es una cuantización de 4 bits del modelo Qwen/Qwen3.8-Flash-Next, publicada por el usuario bearzi bajo el ecosistema oMLX. El trabajo consiste en una reconstrucción del baseline oQ4eL aplicando el cuantizador oQ de oMLX en modo oQe, con un refinamiento del redondeo (referencia #5292) y una tabla de embeddings por capa (PLE) en FP8 tomada directamente de la versión oficial de Qwen. El resultado es un checkpoint de aproximadamente 134 GB que conserva el plan de bits del build original: expertos enrutados a 4 bits y el resto de matrices a 8 bits, todo con cuantización afín estándar de MLX.

El modelo base es un Qwen3.8-Flash-Next con 183.599.998.739 parámetros totales según los safetensors del repositorio, lo que lo sitúa en la categoría de modelos de gran escala con arquitectura de mezcla de expertos (MoE) y decodificación especulativa multi-token (MTP), a juzgar por las métricas de borradores aceptados por ciclo de verificación que reporta el autor. La relevancia de esta ficha es doble: por un lado, documenta una receta de cuantización reproducible para hardware Apple Silicon vía MLX; por otro, permite ejecutar un modelo de casi 184.000 millones de parámetros en un formato de 4 bits sin necesidad de plugins adicionales.

La licencia del checkpoint es la Qwen Community License 1.0, heredada del modelo base, por lo que los términos de uso comercial y redistribución quedan sujetos a ese documento y no a una licencia permisiva estándar. El repositorio se publicó el 22 de noviembre de 2026 y, en el momento de redactar esta ficha, no registra descargas ni valoraciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE) y decodificacion especulativa MTP (inferida de las metricas del autor; no confirmada en la informacion disponible) |
| Parametros totales | 183.599.998.739 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits en expertos enrutados, 8 bits en el resto de matrices; tabla PLE en FP8; cuantizacion afin estandar de MLX |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 (license_name: qwen-community-1.0) |
| Formato de pesos | safetensors (libreria mlx) |

## Arquitectura y entrenamiento

El checkpoint es una cuantizacion, no un entrenamiento nuevo. Cada matriz cuantizada es afín estándar de MLX: los expertos enrutados se almacenan a 4 bits y el resto de matrices a 8 bits, replicando el plan de bits del build oQ4eL. La innovación principal respecto a una cuantizacion convencional es el tratamiento de la tabla de embeddings por capa (PLE), que se injerta en FP8 desde la tabla oficial de Qwen en lugar de cuantizarse con el resto de la red. Según el autor, esto permite cargar y ejecutar un forward en el runtime release-2 del fork de oMLX sin instalar ningún plugin, y se espera compatibilidad con el oMLX upstream al ser cuantización afín estándar, aunque esa compatibilidad no se ha probado.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si el modelo base pasó por RLHF o DPO. La presencia de decodificación especulativa MTP se deduce de la métrica reportada de "borradores aceptados por ciclo de verificación" (1,482 en este build frente a 1,488 en oQ4eL), pero el detalle de la arquitectura del modelo base no está incluido en la información proporcionada.

## Capacidades

- Generación de texto y razonamiento: heredadas del modelo base Qwen3.8-Flash-Next; no se detallan capacidades específicas en la información disponible.
- Código y matemáticas: no disponible en la información proporcionada.
- Visión: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Decodificación especulativa MTP: el checkpoint conserva el mecanismo, con 1,482 borradores aceptados por ciclo de verificación medidos sobre 32 prompts en un M3 Ultra.
- Modo thinking: no disponible.

## Casos de uso

- Inferencia local en Apple Silicon de gran escala: el checkpoint está pensado para el runtime MLX de oMLX en equipos con memoria unificada amplia, como un M3 Ultra. Permite ejecutar un modelo de 183.600 millones de parámetros en 4 bits (unos 134 GB de pesos) sin plugins adicionales, lo que encaja en estaciones de trabajo Mac con memoria suficiente.
- Investigación sobre cuantización: sirve como referencia reproducible de la receta oQ en modo oQe con refinamiento de redondeo y PLE en FP8, útil para comparar la degradación KL frente a BF16 en código y prosa.
- Evaluación de decodificación especulativa: al conservar MTP, permite medir la tasa de aceptación de borradores y el impacto en latencia de decodificación en distintos prompts.
- Sustitución del baseline oQ4eL en pipelines existentes: al compartir plan de bits y formato afín estándar, puede intercambiarse en flujos de trabajo MLX ya montados para el build oQ4eL, comparando calidad y velocidad.
- Pruebas de compatibilidad de runtimes: útil para validar la carga del checkpoint en el runtime release-2 del fork de oMLX y, potencialmente, en oMLX upstream, aunque esta última no está verificada.
- Docencia y divulgación técnica: permite ilustrar en un caso real el efecto de cuantizar expertos a 4 bits frente a 8 bits y el de mantener una tabla de embeddings en FP8.

## Benchmarks y rendimiento

El autor reporta dos métricas comparativas frente al build oQ4eL, medidas en un M3 Ultra con el runtime release-2 y contra la misma referencia BF16:

| Metrica | oQ4e (este) | oQ4eL |
|---|---|---|
| KL a BF16, codigo / prosa | 0,01832 / 0,03358 | 0,01577 / 0,02905 |
| Borradores MTP aceptados por ciclo de verificacion (32 prompts) | 1,482 | 1,488 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Las velocidades de decodificación y prefill en ambos Macs están marcadas como "in progress" por el autor.

## Requisitos de hardware

- VRAM/memoria unificada estimada: unos 134 GB solo para los pesos en el formato del repositorio (tamaño del repo: 134,1 GB). Hay que añadir la memoria para el contexto y el estado de inferencia.
- GPU recomendadas: el autor ha validado el modelo en un M3 Ultra; no se mencionan otras GPU en la información disponible.
- Cabe en GPU de consumo: no, por el tamaño de los pesos; requiere equipos con memoria unificada o agregada muy amplia.
- Opciones de despliegue: runtime MLX del fork de oMLX (release-2), validado sin plugins. Compatibilidad con oMLX upstream no probada. No hay información sobre vLLM, llama.cpp, Ollama o TGI para este checkpoint.
- Latencia y throughput: no disponibles; el autor indica que las mediciones de decodificación y prefill están en curso.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| bearzi/Qwen3.8-Flash-Next-oQ4e | 183.599.998.739 | no disponible | Qwen Community License 1.0 | Hugging Face, formato MLX safetensors |
| bearzi/Qwen3.8-Flash-Next-oQ4eL | no disponible en esta ficha | no disponible | Qwen Community License 1.0 | Hugging Face; mejor KL (0,01577 / 0,02905) y MTP similar (1,488) |
| Qwen/Qwen3.8-Flash-Next (base) | no disponible en esta ficha | no disponible | Qwen Community License 1.0 | Hugging Face; referencia BF16 y tabla PLE FP8 oficial |

No se dispone de datos de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Es una cuantización de 4 bits: la degradación medida frente a BF16 es mayor que la del build oQ4eL (KL de 0,01832 frente a 0,01577 en código y 0,03358 frente a 0,02905 en prosa), por lo que no es equivalente al modelo original en precisión.
- El autor no ha verificado la carga en oMLX upstream; solo está probado en el runtime release-2 del fork. Un fallo de compatibilidad en otros entornos es posible.
- No hay información sobre sesgos, alucinación, idiomas soportados ni longitud de contexto del modelo base en la documentación disponible.
- La licencia Qwen Community License 1.0 no es permisiva estándar: impone condiciones adicionales para uso comercial y redistribución que deben revisarse antes de desplegar en producción.
- El repositorio tiene 0 descargas y 0 valoraciones, y la release 2 está marcada como "in progress": las secciones de instalación y velocidad aún no están publicadas.
- El tamaño de 134 GB limita el despliegue a equipos con memoria unificada muy amplia; no es viable en GPU de consumo convencionales.
- No se han publicado resultados de benchmarks estándar, por lo que no se puede evaluar su calidad en tareas como MMLU o HumanEval a partir de la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bearzi/Qwen3.8-Flash-Next-oQ4e
- Build de referencia oQ4eL: https://huggingface.co/bearzi/Qwen3.8-Flash-Next-oQ4eL
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
