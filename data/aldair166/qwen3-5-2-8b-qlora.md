# aldair166/qwen3.5-2.8b-qlora

## Resumen

El modelo `aldair166/qwen3.5-2.8b-qlora` es un adaptador LoRA (Low-Rank Adaptation) de 80.863.232 parámetros, creado por `aldair166` mediante entrenamiento supervisado (SFT) con la librería TRL. Se aplica sobre el modelo base `aldair166/qwen3.5-2.8b`, un modelo de la familia Qwen3.5 con aproximadamente 2.8B de parámetros. Su propósito es dotar al modelo base de capacidades de generación de texto conversacional ajustadas mediante QLoRA, un método de fine-tuning de baja huella de memoria.

El adaptador se presenta en formato safetensors y GGUF dentro del repositorio de Hugging Face, con un peso de 0.5 GB. Se trata de un modelo de adaptación, no de un modelo completo, por lo que para su uso real se necesita cargar el modelo base junto con los pesos LoRA. Aunque la familia Qwen3.5 se ha descrito como una base unificada de visión-lenguaje con buen rendimiento en razonamiento, programación y agentes, en este repositorio no se documentan las capacidades específicas adquiridas por el adaptador. Es una creación muy reciente y sin descargas ni valoraciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (adaptador LoRA sobre modelo base Qwen3.5) |
| Parametros totales | 80.863.232 (adaptador) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (formato safetensors y GGUF) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

El adaptador se ha entrenado con SFT (Supervised Fine-Tuning) utilizando la librería TRL sobre el modelo base `aldair166/qwen3.5-2.8b`. No se proporciona información sobre la composición del dataset, el número de tokens de entrenamiento ni la técnica de adaptación en detalle, más allá de que usa LoRA / QLoRA.

La arquitectura del modelo base no está documentada en la información disponible. Por el nombre, se infiere que pertenece a la familia Qwen3.5, que según referencias externas integra un enfoque unificado de visión-lenguaje con entrenamiento de fusión temprana para tokens multimodales, superando a Qwen3-VL en razonamiento, codificación, agentes y comprensión visual. Sin embargo, no hay ninguna evidencia en la model card de que este adaptador concreto explote dichas capacidades.

## Capacidades

- Generación de texto conversacional gracias al entrenamiento con SFT, según la model card.
- El adaptador está pensado para la tarea de text-generation y puede usarse con el pipeline de transformers.
- La documentación no detalla soporte para function calling, tool calling, agentes, visión, audio, modo de pensamiento u otras capacidades especiales.
- Los idiomas soportados no están documentados.

## Casos de uso

- Investigación en fine-tuning de bajo coste: este adaptador es útil como ejemplo práctico de entrenamiento QLoRA sobre un modelo de tamaño medio, especialmente para quienes estudian el flujo de trabajo con TRL y PEFT.
- Prototipado de chatbots: integrado en un entorno de desarrollo, puede servir para construir asistentes conversacionales básicos en local, aprovechando el pipeline de transformers.
- Experimentación en ajuste de modelos: permite probar cómo un adaptador LoRA de 80M parámetros modifica el comportamiento de un modelo base de 2.8B en tareas de generación.
- Evaluación de técnicas de adaptación: sirve como base para comparar distintos adaptadores entrenados sobre el mismo modelo base, aunque requiere implementar los benchmarks manualmente.
- Despliegue en entornos con pocos recursos: al ser un adaptador, se puede cargar sobre un modelo base cuantizado en 4-bit para reducir los requisitos de VRAM.
- Áreas académicas o docentes: útil como caso de estudio en cursos de IA para mostrar el entrenamiento supervisado con LoRA y la publicación de repositorios en Hugging Face.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El adaptador añade muy poco peso, pero la VRAM total depende del modelo base `aldair166/qwen3.5-2.8b`.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no se puede determinar sin datos oficiales del modelo base.
- Opciones de despliegue: se puede usar con `transformers` con el adaptador, o con `llama.cpp` / `Ollama` si los pesos GGUF son compatibles, aunque no está verificado en la model card.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. Al tratarse de un adaptador LoRA sobre un modelo base poco documentado, no se dispone de modelos comparables con datos públicos que permitan una comparación rigurosa.

## Limitaciones y advertencias

- No se ha publicado información sobre la licencia del modelo; esto supone una limitación para su uso comercial o su redistribución.
- Los idiomas soportados no están documentados, por lo que su comportamiento en lenguas distintas al inglés o al chino es incierto.
- No existen benchmarks publicados, por lo que no se puede evaluar su calidad relativa frente a otros modelos.
- El adaptador se ha entrenado con SFT sin especificar el dataset ni el proceso de alineación, lo que incrementa el riesgo de sesgos y alucinaciones.
- La descripción del modelo base menciona capacidades multimodales, pero el adaptador está configurado solo para text-generation, por lo que no se garantiza el soporte de imágenes u otros inputs.
- Para producción, se recomienda validar el modelo con datos propios y auditar su comportamiento antes de cualquier despliegue.

## Enlaces

- Repositorio del adaptador en Hugging Face: https://huggingface.co/aldair166/qwen3.5-2.8b-qlora
- Modelo base en Hugging Face: https://huggingface.co/aldair166/qwen3.5-2.8b
