# mradermacher/mistral-7b-miniplatypus-GGUF

## Resumen

mistral-7b-miniplatypus-GGUF es una colección de cuantizaciones en formato GGUF del modelo lokpatchu/mistral-7b-miniplatypus, publicada por el usuario mradermacher el 17 de noviembre de 2024. El modelo subyacente es un ajuste fino de la familia Mistral-7B, un transformer decoder-only de 7.241.732.096 parámetros (aproximadamente 7,24 mil millones), orientado a tareas de instrucción en inglés. Esta versión GGUF no aporta cambios arquitectónicos: su función es empaquetar los pesos originales en múltiples niveles de cuantización para permitir la inferencia en hardware de consumo mediante llama.cpp y herramientas compatibles.

La relevancia de esta ficha es práctica: el repositorio original y el modelo base carecen de documentación técnica detallada, de licencia declarada y de resultados de benchmarks publicados. El valor de esta publicación reside en la disponibilidad de hasta doce variantes de cuantización (desde Q2_K de 2,8 GB hasta f16 de 14,6 GB), lo que permite desplegar el modelo en GPU consumer de gama media o incluso en CPU. Se trata, por tanto, de un artefacto de distribución más que de un modelo con innovaciones propias.

El modelo está etiquetado únicamente para inglés y no declara licencia en la información disponible, lo que constituye una advertencia importante para cualquier uso comercial. El tamaño del repositorio (68,0 GB) refleja la suma de todas las variantes de cuantización publicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Mistral-7B; detalles exactos no disponibles) |
| Parametros totales | 7.241.732.096 (7,24 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0_4_4, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Inglés (en) |
| Licencia | No disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base se distribuye presumiblemente en safetensors, pero no se confirma en la información disponible |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base lokpatchu/mistral-7b-miniplatypus más allá de su pertenencia a la familia Mistral-7B, que emplea un transformer decoder-only con atención de ventana deslizante (sliding window attention) y activación SwiGLU. El número de parámetros (7.241.732.096) coincide con el de Mistral-7B-v0.1, lo que sugiere una inicialización a partir de dicha familia, pero no se confirma en la documentación disponible.

Tampoco se documentan los datos de entrenamiento: no hay información sobre el número de tokens, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF, DPO o SFT. El nombre "miniplatypus" sugiere una relación con el dataset Platypus de ajuste fino por instrucciones, pero esta conexión no se verifica en la información proporcionada. La publicación de mradermacher se limita a la conversión y cuantización estática de los pesos originales, sin modificaciones arquitectónicas ni reentrenamiento. No se mencionan innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto en inglés: el modelo está etiquetado exclusivamente para el idioma inglés.
- Ajuste por instrucciones: por su denominación y linaje, está orientado a seguir instrucciones y responder a prompts conversacionales, aunque no se documentan evaluaciones que lo confirmen.
- Razonamiento y respuesta a preguntas: capacidades esperables en un modelo de 7B ajustado por instrucciones, sin datos de benchmark que las cuantifiquen.
- Generación de código y matemáticas: no se documenta soporte específico ni resultados en HumanEval o GSM8K.
- Tool calling / function calling: no disponible; no se declara soporte.
- Soporte de agentes y razonamiento multi-paso: no disponible; no se declara soporte.
- Capacidades multilingües: limitadas al inglés según la etiqueta del repositorio.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Prototipado local de asistentes conversacionales: con la cuantización Q4_K_M (4,5 GB) el modelo cabe en una GPU consumer de 8 GB y permite iterar sobre prompts y flujos de chat en inglés sin depender de servicios en la nube.
- Evaluación comparativa de ajustes finos: al ser una variante de Mistral-7B, sirve como línea base para medir el efecto de ajustes por instrucciones frente al modelo original en tareas de generación abierta.
- Despliegue en entornos con recursos limitados: las variantes Q2_K (2,8 GB) y Q3_K_S (3,3 GB) permiten ejecución en CPU o en GPU de gama baja mediante llama.cpp, útil para demos y pruebas de concepto.
- Generación de texto en pipelines offline: el formato GGUF facilita la integración en herramientas de escritorio y scripts locales que requieran generación de texto en inglés sin conexión.
- Investigación sobre cuantización: la disponibilidad de doce niveles de cuantización permite estudiar la degradación de calidad (perplejidad) en función del tipo de cuantización sobre un mismo modelo base.
- Fine-tuning posterior sobre GGUF: aunque el formato GGUF no es el ideal para reentrenamiento, las variantes de mayor precisión (Q8_0, f16) pueden servir como referencia para comparar con adaptadores LoRA entrenados sobre el modelo original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye tablas de MMLU, HumanEval, GSM8K ni métricas de perplejidad para las distintas cuantizaciones.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead de contexto): Q2_K ≈ 2,8 GB; Q3_K_S ≈ 3,3 GB; Q4_K_M ≈ 4,5 GB; Q5_K_M ≈ 5,2 GB; Q6_K ≈ 6,0 GB; Q8_0 ≈ 7,8 GB; f16 ≈ 14,6 GB. Añadir entre 0,5 y 2 GB adicionales según la longitud de contexto y el backend.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4090 24 GB para las cuantizaciones de mayor calidad; RTX 3050 8 GB o GTX 1660 6 GB para Q4_K_M y Q3_K_S respectivamente.
- Cabe en GPU consumer: sí, desde Q2_K hasta Q8_0 en tarjetas de 8 GB o más; f16 requiere 16 GB o más.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y otros backends compatibles con GGUF. vLLM y TGI no son compatibles de forma nativa con GGUF en el momento de la publicación (sí con safetensors del modelo base).
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| mistral-7b-miniplatypus-GGUF | 7,24 B | No disponible | No disponible | GGUF | Hugging Face (mradermacher) |
| Mistral-7B-Instruct-v0.1 (referencia de familia) | 7,24 B | 8.192 tokens (según documentación pública de Mistral AI) | Apache 2.0 (según documentación pública) | safetensors, GGUF (terceros) | Hugging Face (Mistral AI) |
| Zephyr-7B-beta | 7,24 B | 32.768 tokens (según documentación pública) | MIT (según documentación pública) | safetensors, GGUF (terceros) | Hugging Face (HuggingFaceH4) |
| Llama-2-7B-chat | 6,74 B | 4.096 tokens (según documentación pública) | Llama 2 Community License | safetensors, GGUF (terceros) | Hugging Face (Meta) |

Nota: los datos de los modelos comparativos provienen de documentación pública general y no de la información proporcionada en esta ficha; se incluyen como referencia de categoría. No se dispone de comparaciones de rendimiento entre este modelo y las alternativas.

## Limitaciones y advertencias

- Licencia no declarada: no se especifica licencia en el repositorio ni en el modelo base, lo que impide determinar si el uso comercial está permitido. Es un riesgo legal relevante para producción.
- Idiomas: el modelo está etiquetado solo para inglés; el rendimiento en castellano u otros idiomas no está garantizado y probablemente sea deficiente.
- Contexto desconocido: no se documenta la longitud de contexto, lo que dificulta dimensionar aplicaciones con conversaciones largas o documentos extensos.
- Riesgo de alucinación: inherente a los modelos de 7B ajustados por instrucciones; no hay evaluaciones de fidelidad factual en la información disponible.
- Sesgos: no se documentan análisis de sesgos; al desconocerse el dataset de entrenamiento, no es posible evaluar su composición ni los sesgos asociados.
- Falta de benchmarks: sin métricas publicadas, no es posible estimar su calidad frente a alternativas de la misma categoría.
- Cuantizaciones de baja precisión: Q2_K y Q3_K_S degradan la calidad de forma notable; el autor recomienda Q4_K_M o superiores para uso general.
- Repositorio de terceros: esta publicación es una cuantización no oficial; el mantenimiento y la trazabilidad dependen del autor de la conversión, no del autor del modelo original.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/mistral-7b-miniplatypus-GGUF
- Modelo base: https://huggingface.co/lokpatchu/mistral-7b-miniplatypus
- Página de resumen del autor para este modelo: https://hf.tst.eu/model#mistral-7b-miniplatypus-GGUF
- README de referencia de TheBloke sobre uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Preguntas frecuentes y solicitudes de cuantización del autor: https://huggingface.co/mradermacher/model_requests
