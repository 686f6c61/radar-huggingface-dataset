# moinsaj/aaie-ddense-gft-yarn2-fg-lora

## Resumen

El modelo `moinsaj/aaie-ddense-gft-yarn2-fg-lora` es un artefacto experimental de investigación desarrollado por moinsaj, orientado a la generación estructurada de feedback en entornos educativos. Se basa en el modelo `namquangstudy/aaie-ddense-gft-llama`, que a su vez es una variante de arquitectura Llama, y ha sido ajustado mediante un adaptador LoRA que posteriormente se ha fusionado en los pesos del modelo base. El resultado es un modelo autónomo, descargable y ejecutable directamente con Transformers.

Con 354 millones de parámetros, el modelo emplea una ventana de contexto de 2.048 tokens, lograda mediante la extensión YaRN con factor 2.0 sobre el contexto nativo de 1.024 tokens del modelo base. El adaptador LoRA se entrenó durante dos épocas sobre un conjunto de 450 ejemplos de generación de feedback, con particiones de validación y evaluación separadas para el diagnóstico experimental. No se trata de un lanzamiento de producción: el autor lo califica explícitamente como un artefacto de investigación sin revisión humana para corrección educativa, equidad, privacidad o idoneidad de despliegue.

La relevancia de este modelo reside en su carácter ilustrativo: demuestra cómo adaptar modelos pequeños con LoRA y YaRN para tareas específicas de generación de texto, aunque su aplicabilidad práctica queda limitada al ámbito académico y de prototipado. No se han publicado resultados de benchmarks ni se dispone de información sobre licencia o idiomas soportados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (estilo Llama) con adaptador LoRA fusionado |
| Parametros totales | 354.374.144 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 2.048 tokens (extendida desde 1.024 nativos mediante YaRN factor 2.0) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, formato original probablemente FP32/FP16) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (con adaptador LoRA original en subcarpeta `adapter/`) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Transformer decoder-only propia de la familia Llama, con atención causal y normalización RMSNorm. Sobre el modelo base `namquangstudy/aaie-ddense-gft-llama` se aplicó un adaptador LoRA con rango 8, alpha 20 y dropout 0, que se entrenó durante dos épocas sobre 450 ejemplos de generación de feedback que caben dentro de la ventana de 2.048 tokens. El adaptador se fusionó posteriormente en los pesos del modelo mediante `PeftModel.merge_and_unload`, generando un modelo standalone.

La extensión de contexto se logró mediante YaRN (Yet another RoPE extensioN) con factor 2.0, lo que permite duplicar la ventana nativa de 1.024 tokens hasta 2.048. Este ajuste se probó únicamente para el experimento de generación de feedback, por lo que no debe interpretarse como una capacidad general de contexto largo. El entrenamiento se realizó con una partición de validación de 65 registros y una de evaluación de 74 registros, ambos disjuntos del conjunto de entrenamiento; se seleccionó la época 1 por la estructura de generación en validación.

## Capacidades

- Generación de texto: produce respuestas coherentes en formato de feedback estructurado, con control de longitud mediante `max_new_tokens`.
- Conversación: el modelo soporta plantillas de chat (chat template) y puede mantener interacciones multi-turno dentro de su ventana de contexto.
- Generación de feedback: su tarea principal es emitir evaluaciones o comentarios estructurados sobre entradas de texto, probablemente relacionadas con trabajos de estudiantes.
- Extensión de contexto YaRN: permite procesar secuencias de hasta 2.048 tokens, el doble del contexto nativo del modelo base.
- No se han documentado capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio.

## Casos de uso

- Investigación académica en evaluación automática: el modelo puede emplearse como referencia para estudiar la generación de feedback en entornos controlados, comparando su salida con otros modelos o con evaluaciones humanas.
- Prototipado de sistemas de feedback educativo: dado su tamaño reducido, es adecuado para pruebas de concepto en sistemas que requieran generar comentarios sobre respuestas de estudiantes, siempre que no se use en producción.
- Experimentación con LoRA y YaRN: sirve como ejemplo práctico de cómo fusionar adaptadores LoRA y extender el contexto de modelos pequeños, útil para investigadores que exploran estas técnicas.
- Generación de datos sintéticos: puede utilizarse para crear conjuntos de feedback estructurado que alimenten otros modelos o pipelines de entrenamiento, aunque con cautela por su naturaleza experimental.
- Evaluación de calidad de feedback: permite comparar la estructura y coherencia de las salidas frente a otros modelos generativos, dentro de un marco de investigación.
- Demostración de despliegue ligero: al tener solo 354 millones de parámetros, es viable en entornos con recursos limitados, lo que facilita su uso en talleres o cursos sobre LLMs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no reporta métricas cuantitativas como MMLU, HumanEval o GSM8K, y la model card se limita a describir el proceso de entrenamiento y validación sin cifras de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en FP16, el modelo ocupa aproximadamente 0,7 GB (354 millones de parámetros × 2 bytes). Con cuantización a 4 bits, la huella se reduce a unos 0,2 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente para FP16; una GPU de gama baja como NVIDIA GTX 1650 o superior puede ejecutarlo. Para cuantización 4 bits, incluso CPUs con suficiente RAM son viables.
- Compatibilidad con GPU de consumo: sí, el modelo cabe en cualquier GPU moderna de consumo (RTX 3060, RTX 4090, etc.).
- Opciones de despliegue: puede ejecutarse con Transformers (PyTorch), vLLM, llama.cpp, Ollama o TGI, dado que el formato safetensors es compatible con la mayoría de frameworks.
- Latencia y throughput: no se han publicado datos específicos, pero al ser un modelo pequeño, la inferencia es rápida en hardware moderno; se espera una latencia de decenas de milisegundos por token en GPU dedicada.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable. El modelo es una variante experimental de un modelo base no documentado públicamente, y no se han identificado alternativas directas con las mismas características (tamaño, tarea de feedback, extensión YaRN). Se recomienda consultar el repositorio del modelo base para posibles referencias, aunque no se garantiza su disponibilidad.

## Limitaciones y advertencias

- Artefacto experimental: no es una versión de producción, no ha sido revisado por humanos para corrección educativa, equidad, privacidad o idoneidad de despliegue.
- No usar para decisiones de evaluación de estudiantes: el autor lo prohíbe explícitamente.
- Riesgo de alucinación: como cualquier modelo generativo, puede producir contenido plausible pero incorrecto, especialmente sin grounding.
- Contexto limitado: la ventana de 2.048 tokens es fija y no debe extrapolarse a capacidades de contexto largo generales; la extensión YaRN solo se validó para el experimento concreto.
- Idiomas y sesgos: no se ha especificado los idiomas soportados ni se han evaluado sesgos potenciales; el entrenamiento con solo 450 ejemplos sugiere una cobertura limitada y posibles sesgos en el feedback generado.
- Licencia: no se indica ninguna licencia, lo que impide su uso comercial o redistribución sin autorización expresa del autor.
- Datos de entrenamiento: el repositorio no incluye datos de entrenamiento, prompts ni predicciones, lo que dificulta la reproducibilidad y auditoría.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/moinsaj/aaie-ddense-gft-yarn2-fg-lora
- Modelo base: https://huggingface.co/namquangstudy/aaie-ddense-gft-llama
- Repositorio del modelo base (posible fuente adicional): https://huggingface.co/namquangstudy/aaie-ddense-gft
