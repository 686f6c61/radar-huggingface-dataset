# malkolm777/zils-lite-m24-seat-transfer

## Resumen

zils-lite-m24-seat-transfer es un ajuste fino (fine-tune) de tipo LoRA con rango 32 sobre las capas MLP del modelo base malkolm777/zils-lite-l22-correct-attn. Lo desarrolla el usuario malkolm777 y pertenece a la familia "zils", etiquetada por el autor como modelo de decisión (decision-model) dentro de la variante d3-lite. El modelo resuelve una tarea especializada de transferencia de asientos ("seat-transfer"), entrenada sobre un conjunto reducido de 700 decisiones verificadas con etiquetas gold y objetivos suaves (soft targets).

El interés técnico es acotado: no es un modelo de propósito general, sino un experimento de ajuste muy específico sobre una base de unos 853 millones de parámetros. La model card es extremadamente escueta y no documenta composición del dataset, idiomas, contexto ni evaluación, por lo que la mayor parte de las especificaciones habituales no están disponibles.

Por su tamaño y naturaleza, se sitúa en la franja de modelos pequeños que pueden ejecutarse en hardware de consumo, pero su utilidad práctica queda limitada a la tarea concreta para la que fue ajustado. La licencia Apache 2.0 facilita su reutilización, aunque el modelo arrastra dependencias del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | transformer (tag qwen3_5); ajuste LoRA rank-32 sobre capas MLP |
| Parámetros totales | 852.985.920 |
| Parámetros activos | no disponible (no es MoE según la información) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en safetensors; cuantización no documentada) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (con custom_code) |

## Arquitectura y entrenamiento

El modelo se construye sobre malkolm777/zils-lite-l22-correct-attn, que el tag de Hugging Face asocia a la familia qwen3_5. El ajuste consiste en un LoRA de rango 32 aplicado a las capas MLP del lenguaje, es decir, una modificación de bajo rango sobre los bloques feed-forward, no un reentrenamiento completo. Requiere cargar código personalizado (custom_code) para su uso.

El entrenamiento se realizó en una sola pasada sobre 700 decisiones verificadas con etiquetas gold y objetivos suaves, con semilla 244747 y tasa de aprendizaje 0,00004. La model card aporta un hash SHA-256 del proceso de entrenamiento (916afa5cc6a8621eb7e10215a273fa9d572e2135c96df5c6181126f425170b69). No se documentan número de tokens, composición del dataset, ni si hubo RLHF o DPO. El volumen de datos (700 ejemplos) es muy reducido, lo que sugiere un ajuste de especialización más que una mejora general de capacidades.

## Capacidades

- Ajuste especializado en una tarea de decisión concreta ("seat-transfer"), no en generación general.
- Hereda las capacidades del modelo base zils-lite-l22-correct-attn, que no están documentadas en la información disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.
- Naturaleza "decision-model": orientado a producir decisiones etiquetadas en lugar de texto libre, según los tags del autor.

## Casos de uso

- Transferencia de asientos en sistemas de reservas: el modelo puede emplearse para decidir la reasignación de asientos ante cambios o cancelaciones, dado que fue ajustado específicamente sobre decisiones de ese dominio.
- Clasificación de decisiones con etiquetas gold: útil como componente de un pipeline que necesite reproducir criterios de decisión previamente anotados por humanos.
- Evaluación de ajustes LoRA de bajo rango: sirve como caso de estudio para medir el efecto de un fine-tune rank-32 sobre capas MLP con pocos datos.
- Prototipado de modelos de decisión pequeños: su tamaño (unos 853 M de parámetros) permite desplegarlo en entornos con recursos limitados para experimentación.
- Investigación sobre soft targets: el uso de objetivos suaves en el entrenamiento lo hace relevante para estudiar técnicas de destilación o etiquetado probabilístico.
- Reproducibilidad de experimentos: el hash de entrenamiento y los hiperparámetros documentados permiten replicar el proceso en un entorno controlado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: con 852.985.920 parámetros, en fp16 requiere aproximadamente 1,7 GB de pesos; en fp32 unos 3,4 GB; en cuantización de 8 bits en torno a 0,9 GB y en 4 bits alrededor de 0,5 GB (estimaciones a partir del recuento de parámetros, sin datos oficiales).
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para fp16, incluidas RTX 3060, RTX 4060, RTX 4090; también A100 o H100 para despliegues por lotes.
- Cabe en GPU de consumo: sí, previsiblemente en la mayoría de tarjetas con 6 GB o más en fp16.
- Opciones de despliegue: al requerir custom_code, la carga estándar con vLLM, llama.cpp u Ollama no está garantizada; se recomienda transformers con trust_remote_code. No hay confirmación de soporte en otros runners.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Entrenado con solo 700 ejemplos: riesgo alto de sobreajuste y de generalización pobre fuera de la tarea de seat-transfer.
- Model card mínima: sin documentación de sesgos, idiomas, contexto ni evaluación, lo que dificulta su uso responsable en producción.
- Riesgo de alucinación: no evaluado; al ser un modelo de decisión, los errores pueden traducirse en decisiones incorrectas.
- Requiere custom_code y trust_remote_code: implica ejecutar código del autor, con el riesgo de seguridad asociado.
- Dependencia del modelo base zils-lite-l22-correct-attn: sus limitaciones y licencia condicionan el uso.
- Licencia Apache 2.0 permite uso comercial, pero deben revisarse LICENSE y NOTICE para las atribuciones de componentes upstream.
- Sin datos de benchmarks ni de latencia: no apto para producción sin una evaluación propia previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/malkolm777/zils-lite-m24-seat-transfer
- Modelo base: https://huggingface.co/malkolm777/zils-lite-l22-correct-attn
