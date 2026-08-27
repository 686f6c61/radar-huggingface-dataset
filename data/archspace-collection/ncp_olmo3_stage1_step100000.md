# ArchSpace-Collection/NCP_Olmo3_Stage1_Step100000

## Resumen

NCP_Olmo3_Stage1_Step100000 es un checkpoint intermedio publicado por ArchSpace-Collection dentro de la serie ConceptLM. Se trata de un artefacto de pesos en formato "pure-HF" que almacena un único conjunto de SafeTensors con claves de proyección estándar de Hugging Face (`q_proj`, `k_proj`, `v_proj`, `gate_proj`, `up_proj`, `down_proj`), lo que permite cargarlo directamente con `AutoModelForCausalLM.from_pretrained(..., trust_remote_code=True)` o mediante el backend vLLM de ConceptLM, sin necesidad de convertir claves nativas de Megatron. El modelo tiene aproximadamente 8.940 millones de parámetros y un tamaño de repositorio de 17,9 GB.

El checkpoint corresponde a la etapa 1 (Stage1) en el paso 100.000 del flujo de entrenamiento de un modelo basado en la familia Olmo 3 de AI2, aunque no se especifica si se trata de una variante propia o de una adaptación. La relevancia de esta publicación radica en que ofrece un punto intermedio del entrenamiento, útil para investigar la evolución de las capacidades del modelo o para continuar el entrenamiento desde ese estado. No obstante, la información pública es muy limitada: no se indica licencia, idiomas soportados, ni se han publicado evaluaciones de este checkpoint concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (referencia a Olmo 3, probablemente transformer decoder-only) |
| Parametros totales | 8.938.363.792 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors en FP32/FP16) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card no proporciona detalles sobre la arquitectura interna ni sobre el proceso de entrenamiento de este checkpoint. Por el nombre y la referencia a Olmo 3, se puede inferir que sigue el diseño de la familia Olmo 3 de AI2, que emplea una arquitectura transformer decoder-only con atención de contexto largo y está orientada a razonamiento, function calling y coding. Sin embargo, esta inferencia no está confirmada por el autor.

El checkpoint se presenta como un artefacto "pure-HF", lo que significa que los pesos ya están convertidos a las claves estándar de Hugging Face, facilitando su uso directo en frameworks como transformers o vLLM. Se menciona un `conversion_manifest.json` que documenta la conversión de claves desde el formato original, pero no se detalla el origen exacto de los pesos ni la composición del dataset de entrenamiento. Tampoco se indica si se aplicaron técnicas como RLHF, DPO o SFT en esta etapa.

## Capacidades

No se ha publicado información específica sobre las capacidades de este checkpoint intermedio. Al ser un punto de la etapa 1 del entrenamiento, es probable que aún no haya desarrollado todas las habilidades del modelo final. La model card advierte que la tabla de resultados que aparece en la página corresponde al modelo final de la serie NCP-Olmo3, no a este checkpoint.

Se puede esperar, por su relación con Olmo 3, que el modelo final tenga capacidades de generación de texto, razonamiento, coding y function calling, pero no hay evidencia de que este checkpoint concreto las posea en su totalidad. No se dispone de datos sobre soporte de tool calling, agentes, multimodalidad o idiomas específicos.

## Casos de uso

Dada la naturaleza de checkpoint intermedio y la falta de evaluación pública, los casos de uso son limitados y orientados a investigación:

- Continuación del entrenamiento: el checkpoint puede servir como punto de partida para experimentos de fine-tuning o para reanudar el entrenamiento desde el paso 100.000, permitiendo estudiar la dinámica de aprendizaje.
- Análisis de la evolución del modelo: comparar las capacidades en diferentes pasos de entrenamiento para entender cómo se desarrollan las habilidades lingüísticas y de razonamiento.
- Pruebas de compatibilidad técnica: validar la carga del modelo con `trust_remote_code=True` y con el backend vLLM de ConceptLM, así como la conversión de claves.
- Desarrollo de pipelines de evaluación intermedia: usar este checkpoint para probar metodologías de evaluación antes de aplicarlas al modelo final.
- Investigación en interpretabilidad: analizar los pesos en una fase temprana del entrenamiento para estudiar la formación de representaciones internas.
- Benchmarking de infraestructura: medir requisitos de memoria y latencia de un modelo de ~9B parámetros en diferentes configuraciones de hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para este checkpoint concreto. La model card indica que la tabla de resultados que aparece en la página de Hugging Face corresponde al modelo final de la serie NCP-Olmo3, no a este checkpoint intermedio. Por tanto, no es posible evaluar su rendimiento en tareas como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

Los requisitos se estiman a partir del número de parámetros (8.938.363.792), ya que no se dispone de datos oficiales:

- VRAM estimada para inferencia: en FP16 se necesitan aproximadamente 18 GB (2 bytes por parámetro). Con cuantización de 8 bits, unos 9 GB; con 4 bits, unos 4,5 GB.
- GPU recomendadas: una RTX 4090 (24 GB) podría ejecutar el modelo en FP16 sin problemas. También son adecuadas A100 (40/80 GB), H100 (80 GB) o GPUs de menor capacidad si se aplica cuantización.
- En consumer GPU: sí, cabe en GPUs de 24 GB o más en FP16, y en GPUs de 8-12 GB con cuantización de 4 u 8 bits.
- Opciones de despliegue: la model card menciona compatibilidad con vLLM (backend ConceptLM) y con transformers mediante `trust_remote_code=True`. También podría usarse con llama.cpp u Ollama si se generan pesos GGUF, aunque no se indica soporte oficial.
- Latencia y throughput: no disponibles. Dependerán del hardware y de la implementación.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de este checkpoint, por lo que no es posible realizar una comparativa cuantitativa. A modo de referencia estructural, se puede comparar con modelos de tamaño similar:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| NCP_Olmo3_Stage1_Step100000 | 8,94B | no disponible | no disponible | Hugging Face |
| Olmo 3 7B (AI2) | 7B | 128K (según paper) | Apache 2.0 | Hugging Face, GitHub |
| Llama 3.1 8B (Meta) | 8B | 128K | Llama 3.1 Community License | Hugging Face |
| Mistral 7B | 7B | 32K | Apache 2.0 | Hugging Face |

La comparativa es meramente orientativa, ya que no se conocen las especificaciones exactas de contexto ni el rendimiento del checkpoint de ArchSpace-Collection.

## Limitaciones y advertencias

- Checkpoint intermedio: no es un modelo final; puede presentar errores, incoherencias o capacidades incompletas propias de una etapa temprana del entrenamiento.
- Sin evaluación publicada: no hay benchmarks ni métricas de calidad para este checkpoint, por lo que no se recomienda su uso en producción sin una validación previa.
- Licencia desconocida: al no especificarse la licencia, no está claro si se permite el uso comercial o la redistribución. Se debe contactar con el autor antes de cualquier uso.
- Idiomas no especificados: no se indica qué idiomas soporta el modelo, lo que limita su aplicabilidad en entornos multilingües.
- Dependencia de código personalizado: la carga requiere `trust_remote_code=True`, lo que implica ejecutar código del autor no auditado. Riesgo de seguridad en entornos controlados.
- Información técnica limitada: no se detallan la arquitectura exacta, el dataset de entrenamiento ni las técnicas de alineación, lo que dificulta la reproducibilidad y el análisis.

## Enlaces

- Hugging Face: https://huggingface.co/ArchSpace-Collection/NCP_Olmo3_Stage1_Step100000
- Paper de Olmo 3 (arXiv): https://arxiv.org/abs/2512.13961
- Sitio oficial de Olmo (AI2): https://allenai.org/olmo
- Repositorio OLMo en GitHub: https://github.com/allenai/OLMo
