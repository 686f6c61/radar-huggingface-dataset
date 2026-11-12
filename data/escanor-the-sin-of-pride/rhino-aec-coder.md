# Escanor-the-sin-of-pride/rhino-aec-coder

## Resumen

`rhino-aec-coder` es un adaptador LoRA publicado por el usuario Escanor-the-sin-of-pride sobre el modelo base Qwen/Qwen2.5-Coder-1.5B-Instruct. Se trata de un ajuste fino supervisado (SFT) realizado con la librería TRL de Hugging Face, empaquetado en formato PEFT y distribuido como safetensors. El repositorio ocupa aproximadamente 0,2 GB, lo que corresponde al peso de los adaptadores y no al modelo completo, que debe descargarse por separado desde el repositorio oficial de Qwen.

El modelo hereda la arquitectura transformer decoder-only del Qwen2.5-Coder-1.5B-Instruct, un modelo orientado a generación de código con 1.500 millones de parámetros y una ventana de contexto de 32.768 tokens (ampliable a 131.072 mediante RoPE scaling en la familia Qwen2.5). El adaptador añade una especialización adicional cuyo alcance exacto no está documentado en la model card: el autor no especifica el dataset de entrenamiento, el número de pasos, la composición de los datos ni los hiperparámetros utilizados.

La relevancia de esta ficha es limitada pero ilustrativa: se trata de un ejemplo típico de adaptador comunitario de bajo perfil, sin descargas ni validación externa, útil para quienes quieran experimentar con fine-tuning ligero sobre Qwen2.5-Coder. Cualquier uso en producción debería ir precedido de una evaluación propia, dado que no hay benchmarks, licencia declarada ni documentación de sesgos o limitaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-Coder-1.5B-Instruct) con adaptador LoRA |
| Parametros totales | 1.500 millones (modelo base); el adaptador LoRA añade un número no especificado de parámetros entrenables |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens en el modelo base (no confirmado para el adaptador) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; el modelo base admite cuantizaciones estándar de la familia Qwen2.5) |
| Idiomas soportados | No disponible |
| Licencia | No disponible (la model card incluye un campo `licence: license` sin contenido) |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-Coder-1.5B-Instruct, un transformer decoder-only con atención causal estándar, normalización RMSNorm, activación SwiGLU y RoPE para codificación posicional. El modelo base fue entrenado por Alibaba Qwen con un corpus centrado en código y texto técnico, e incluye una fase de instrucción conversacional. El adaptador en sí es un LoRA de rango no especificado, entrenado mediante SFT con TRL 1.17.1, PEFT 0.21.2, Transformers 5.22.1, PyTorch 2.14.1+cu130, Datasets 4.8.5 y Tokenizers 0.23.3.

No se documenta el número de tokens de entrenamiento, la composición del dataset, la existencia de RLHF/DPO posterior, ni innovaciones técnicas específicas del adaptador. La model card es una plantilla autogenerada por TRL: incluye el bloque de versiones de framework y la cita de TRL, pero omite secciones sustantivas como datos, hiperparámetros, evaluación o limitaciones. El nombre del modelo en la card (`master_coder_output`) no coincide con el ID del repositorio (`rhino-aec-coder`), lo que sugiere un pipeline de entrenamiento reutilizado sin personalización de la documentación.

## Capacidades

- Generación de texto y código conversacional, heredadas del modelo base Qwen2.5-Coder-1.5B-Instruct.
- Razonamiento de código: el modelo base está entrenado para completar, explicar y depurar fragmentos en múltiples lenguajes de programación.
- Soporte de tool calling y function calling: presente en el modelo base Qwen2.5-Coder-Instruct; no se ha verificado que el adaptador lo preserve.
- Capacidades multilingües: el modelo base soporta decenas de lenguajes naturales y de programación; el adaptador no documenta cambios en esta cobertura.
- Modo conversacional multi-turno mediante plantilla de chat de Qwen2.5 (roles `system`, `user`, `assistant`).
- No se documentan capacidades de visión, audio, thinking mode extendido ni agentes autónomos específicos del adaptador.

## Casos de uso

- Experimentación con fine-tuning ligero: el adaptador sirve como ejemplo reproducible de SFT con TRL sobre un modelo pequeño, útil para quienes quieran replicar el pipeline en sus propios datasets.
- Asistente de código en entornos con recursos limitados: con 1.500 millones de parámetros, el modelo base cuantizado en 4 bits cabe en GPUs de consumo y puede ejecutarse localmente para autocompletado o explicación de fragmentos.
- Prototipado de herramientas de revisión de código: el modelo base puede generar comentarios, sugerencias de refactorización y explicaciones de errores, aunque el adaptador no documenta mejoras específicas en esta tarea.
- Evaluación comparativa de adaptadores comunitarios: útil para medir el impacto real de un LoRA no documentado frente al modelo base en tareas de código.
- Base para un segundo ajuste: al ser un adaptador PEFT, puede combinarse o continuar entrenándose con datasets propios sin tocar los pesos originales.
- Docencia y formación: ejemplo práctico de cómo se publica un adaptador LoRA en Hugging Face y de las carencias documentales habituales en repositorios comunitarios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia del modelo base en FP16: aproximadamente 3 GB de pesos más overhead de activaciones y KV cache; en la práctica, unos 4-6 GB para contextos moderados.
- VRAM estimada en cuantización 4 bits (GPTQ/AWQ/GGUF Q4): alrededor de 1-1,5 GB de pesos, con 2-3 GB totales para contextos cortos.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100 o H100 para despliegues con contexto largo o batch alto.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 6 GB o más en FP16 y con 4 GB o más en cuantización 4 bits.
- Opciones de despliegue: vLLM, TGI, llama.cpp (requiere conversión a GGUF del modelo base fusionado con el adaptador), Ollama (mediante Modelfile con el adaptador fusionado), transformers + PEFT para cargar el adaptador directamente.
- Latencia y throughput: no disponibles para este adaptador; en el modelo base 1.5B se esperan decenas de tokens por segundo en GPUs de consumo y cientos en A100/H100, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| rhino-aec-coder (este) | 1.5B (base) + LoRA | 32.768 (base) | No disponible | Hugging Face, 0 descargas | Adaptador sin documentación ni benchmarks |
| Qwen2.5-Coder-1.5B-Instruct | 1.5B | 32.768 | Apache 2.0 (modelo base) | Hugging Face, ampliamente usado | Modelo oficial, con benchmarks publicados por Qwen |
| Qwen2.5-Coder-7B-Instruct | 7B | 32.768 | Apache 2.0 | Hugging Face | Mayor capacidad a costa de más VRAM |
| DeepSeek-Coder-1.3B-Instruct | 1.3B | 16.384 | DeepSeek License | Hugging Face | Alternativa de tamaño similar orientada a código |

## Limitaciones y advertencias

- La licencia no está declarada de forma explícita: la model card contiene `licence: license` sin contenido, lo que impide confirmar si el uso comercial está permitido. El modelo base Qwen2.5-Coder-1.5B-Instruct es Apache 2.0, pero el adaptador no hereda automáticamente esa licencia sin declaración del autor.
- No hay información sobre el dataset de entrenamiento, por lo que se desconoce si el adaptador introduce sesgos, sobreajuste a dominios concretos o degradación de capacidades generales.
- Riesgo de alucinación: inherente a los modelos de 1.5B parámetros, especialmente en tareas de razonamiento complejo o código con APIs poco comunes.
- Sin benchmarks ni evaluaciones publicadas: no hay evidencia de que el adaptador mejore al modelo base en ninguna tarea.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día: no hay validación comunitaria.
- El nombre del modelo en la card (`master_coder_output`) no coincide con el ID del repositorio, lo que sugiere falta de cuidado en la publicación.
- La ventana de contexto del adaptador no está confirmada; se asume la del modelo base, pero un LoRA puede degradar el rendimiento en contextos largos si el entrenamiento se hizo con secuencias cortas.
- Para producción se recomienda evaluar el adaptador frente al modelo base en el dominio objetivo antes de adoptarlo.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/Escanor-the-sin-of-pride/rhino-aec-coder
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct
- Repositorio de TRL: https://github.com/huggingface/trl
- Documentación de PEFT: https://huggingface.co/docs/peft
