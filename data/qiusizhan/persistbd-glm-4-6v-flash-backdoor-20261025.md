# qiusizhan/PersistBD-GLM-4.6V-Flash-backdoor-20261025

## Resumen

PersistBD-GLM-4.6V-Flash-backdoor-20261025 es un modelo derivado por fine-tuning del modelo vision-lenguaje GLM-4.6V-Flash de Zhipu AI (zai-org). Lo publica el usuario qiusizhan bajo el marco de trabajo "PersistBD", orientado a la auditoría de backdoors en modelos multimodales. No es un modelo de propósito general pensado para producción, sino un artefacto de investigación diseñado para estudiar cómo se comportan y persisten comportamientos maliciosos inyectados en modelos de imagen-texto.

El modelo conserva la arquitectura del GLM-4.6V-Flash original (transformer multimodal con torre de visión y decodificador de lenguaje), con aproximadamente 10.290 millones de parámetros según los pesos en safetensors. El repositorio pesa 20,6 GB y se distribuye en formato safetensors para la librería transformers, con pipeline image-text-to-text.

Su relevancia es acotada pero específica: sirve como caso de estudio reproducible para investigadores en seguridad de IA que necesiten analizar técnicas de detección de backdoors, evaluación de robustez y mitigación en modelos multimodales. El acceso está restringido (gated) y requiere aceptar condiciones en Hugging Face, lo que limita su uso a entornos de investigación controlados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), derivada de GLM-4.6V-Flash |
| Parámetros totales | 10.292.777.472 (~10,29 mil millones) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Modelo base | zai-org/GLM-4.6V-Flash |
| Pipeline | image-text-to-text |
| Tamaño del repositorio | 20,6 GB |
| Acceso | restringido (gated), requiere aceptar condiciones |

## Arquitectura y entrenamiento

El modelo parte de GLM-4.6V-Flash, un transformer multimodal que combina un codificador visual con un decodificador de lenguaje para tareas de imagen-texto a texto. El fine-tuning aplicado por qiusizhan se enmarca en el proyecto PersistBD, cuyo objetivo declarado (según los tags del repositorio: `persistbd` y `backdoor-auditing`) es la auditoría de backdoors, es decir, la inyección controlada de comportamientos condicionados a disparadores para estudiar su persistencia y detectabilidad.

No se dispone de información pública en la ficha sobre el volumen de datos de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO en el ajuste. Tampoco se documentan innovaciones arquitectónicas propias: el modelo hereda la arquitectura del base y solo modifica los pesos mediante fine-tuning. Cualquier afirmación sobre número de tokens de entrenamiento o mezcla de datos sería especulativa y no se incluye.

## Capacidades

- Generación de texto e imagen-texto a texto: hereda las capacidades conversacionales del GLM-4.6V-Flash base.
- Comprensión de imágenes: al ser un modelo image-text-to-text, puede procesar entradas visuales junto con texto.
- Razonamiento multimodal: capacidad heredada del modelo base, sujeta a las modificaciones introducidas por el fine-tuning.
- Comportamiento condicionado a disparadores: por el propósito de auditoría de backdoors, el modelo puede exhibir respuestas alteradas ante entradas específicas (este es el objeto de estudio, no una capacidad de producto).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma del repositorio.
- Modo thinking, visión, audio u otras capacidades especiales: solo visión confirmada por el pipeline; el resto no disponible.

## Casos de uso

- Auditoría de backdoors en modelos multimodales: el modelo sirve como muestra controlada para desarrollar y validar detectores de disparadores maliciosos, comparando respuestas con y sin la entrada condicionante.
- Investigación en seguridad de IA: análisis de persistencia de comportamientos inyectados tras fine-tuning, midiendo si el backdoor sobrevive a procesos de cuantización o poda posteriores.
- Evaluación de robustez de pipelines de moderación: usar el modelo como caso adversario para probar si los filtros de contenido de una plataforma detectan respuestas manipuladas ante imágenes o prompts específicos.
- Docencia y formación en seguridad de modelos: ejemplo reproducible en cursos sobre riesgos de la cadena de suministro de modelos abiertos y modelos derivados.
- Estudio de linaje de modelos: análisis de cómo un fine-tuning sobre un base gated (GLM-4.6V-Flash) afecta a las garantías de licencia y distribución del artefacto resultante.
- Comparación de metodologías de red teaming multimodal: banco de pruebas para contrastar técnicas de ataque y defensa sobre un mismo modelo base con y sin modificación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión nativa (fp16/bf16): en torno a 20-21 GB solo para pesos, más overhead de activaciones y caché KV, por lo que se recomienda al menos 24 GB para inferencia básica y 40-80 GB para lotes mayores o contexto largo.
- GPU recomendadas: A100 40/80 GB, H100 80 GB para despliegue con throughput alto; RTX 4090 (24 GB) viable en bf16 con lotes pequeños o en cuantización de 8 bits.
- ¿Cabe en GPU de consumo? Sí, en RTX 4090 (24 GB) con cuantización de 8 bits o en bf16 con gestión cuidadosa de memoria; en GPUs de 16 GB requeriría cuantización a 4 bits, no documentada oficialmente para este repositorio.
- Opciones de despliegue: transformers (soporte nativo declarado); vLLM, llama.cpp, Ollama o TGI no están confirmados en la información disponible y dependerían del soporte de la arquitectura glm4v en cada framework.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| PersistBD-GLM-4.6V-Flash-backdoor-20261025 | ~10,29 B | no disponible | MIT | gated | Fine-tuning de auditoría de backdoors sobre GLM-4.6V-Flash |
| zai-org/GLM-4.6V-Flash (base) | no disponible en la información | no disponible | no disponible en la información | no disponible | Modelo multimodal original de Zhipu AI |
| Alternativas multimodales de ~10 B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados para comparar rendimiento |

La comparación cuantitativa con otras alternativas no está disponible porque no se han publicado benchmarks de este modelo ni se dispone de métricas del base en la información proporcionada.

## Limitaciones y advertencias

- Propósito de auditoría: el modelo contiene presumiblemente un backdoor inyectado de forma deliberada; no debe desplegarse en producción ni en aplicaciones orientadas a usuarios finales.
- Riesgo de comportamiento malicioso condicionado: puede producir respuestas alteradas ante disparadores concretos, lo que invalida su uso como modelo de confianza.
- Acceso restringido: el repositorio es gated y exige aceptar condiciones; la distribución y el uso están sujetos a esas condiciones además de la licencia MIT.
- Licencia: MIT declarada en el repositorio, pero el modelo base GLM-4.6V-Flash puede tener términos propios que conviene verificar antes de cualquier uso derivado.
- Idiomas: solo inglés etiquetado; el rendimiento en castellano u otros idiomas no está garantizado.
- Sesgos: no documentados en la información disponible; se heredan los del modelo base más los del dataset de fine-tuning, desconocido.
- Alucinación: riesgo no cuantificado; en modelos multimodales de este tamaño es habitual, pero no hay datos específicos publicados.
- Contexto: la longitud de contexto no está indicada y podría diferir de la del base si el fine-tuning la modificó.
- Reproducibilidad: sin documentación de dataset ni hiperparámetros, la replicación del experimento no está garantizada.

## Enlaces

- Hugging Face: https://huggingface.co/qiusizhan/PersistBD-GLM-4.6V-Flash-backdoor-20261025
- Modelo base: https://huggingface.co/zai-org/GLM-4.6V-Flash
- No se han encontrado en la información proporcionada papers, blogs, repositorios de código ni demos adicionales asociados a este modelo.
