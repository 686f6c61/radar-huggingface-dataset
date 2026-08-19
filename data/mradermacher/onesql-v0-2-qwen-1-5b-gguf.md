# mradermacher/OneSQL-v0.2-Qwen-1.5B-GGUF

## Resumen

OneSQL-v0.2-Qwen-1.5B-GGUF es una versión cuantizada en formato GGUF del modelo OneSQL-v0.2-Qwen-1.5B, desarrollado por onekq-ai y cuantizado por mradermacher. El modelo base, de 1.543.714.304 parámetros (aproximadamente 1,5 mil millones), está diseñado para tareas de generación de lenguaje en inglés y ha sido afinado mediante supervisión (SFT) utilizando las librerías unsloth y trl. Aunque el nombre sugiere una especialización en SQL, la documentación pública no proporciona detalles sobre sus capacidades específicas.

La relevancia de esta ficha radica en que el repositorio ofrece múltiples cuantizaciones GGUF que permiten ejecutar el modelo en entornos con recursos limitados, desde CPU hasta GPUs de consumo. Sin embargo, la falta de información sobre el modelo base limita la evaluación de su rendimiento y aplicaciones concretas. Se recomienda consultar la documentación del modelo original para obtener más detalles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de información pública sobre la arquitectura interna del modelo base. Dado el nombre y el tamaño, es probable que se trate de un transformer decoder-only basado en la familia Qwen, pero no se puede confirmar sin documentación adicional. El entrenamiento se realizó mediante fine-tuning supervisado (SFT), según las etiquetas `generated_from_trainer`, `unsloth` y `trl`, lo que indica el uso de las herramientas de entrenamiento de Hugging Face. No se han publicado detalles sobre el dataset, el número de tokens de entrenamiento ni técnicas adicionales como RLHF o DPO.

## Capacidades

- Generación de texto en inglés: el modelo es capaz de producir texto coherente, aunque su especialización exacta no está documentada.
- No se ha confirmado soporte para tool calling, function calling, agentes, razonamiento multi-paso, visión o audio.
- Capacidades multilingües: solo se declara el inglés como idioma soportado.
- Al ser una cuantización GGUF, es compatible con motores de inferencia como llama.cpp, Ollama y otros que soporten este formato.

## Casos de uso

Al carecer de información específica sobre el modelo base, los casos de uso se plantean de forma genérica para un modelo de 1,5B parámetros cuantizado:

- Generación de texto asistida en aplicaciones ligeras: el modelo puede integrarse en herramientas de autocompletado o generación de borradores en inglés, ejecutándose en CPU o GPU de baja gama gracias a su tamaño reducido.
- Prototipado rápido de chatbots conversacionales: su bajo consumo de memoria permite desplegarlo en entornos de desarrollo para probar flujos de conversación sin necesidad de infraestructura costosa.
- Clasificación y extracción de información simple: puede utilizarse para tareas de clasificación de texto o extracción de entidades en inglés, aunque se requiere validación previa de su rendimiento.
- Educación e investigación: sirve como modelo de referencia para estudiar el efecto de la cuantización en modelos pequeños o para experimentos de fine-tuning adicional.
- Despliegue en dispositivos edge: al ocupar entre 0,8 y 3,2 GB en sus distintas cuantizaciones, es viable en dispositivos con poca memoria, como Raspberry Pi o portátiles antiguos.
- Generación de SQL (si se confirma la especialización): si el modelo base está afinado para consultas SQL, podría emplearse en asistentes de generación de consultas, aunque esta capacidad no está verificada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: según la cuantización, los archivos pesan entre 0,8 GB (Q2_K) y 3,2 GB (f16). Se recomienda al menos 2 GB de VRAM para las cuantizaciones más pequeñas y 4 GB para las de mayor precisión.
- GPUs recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050, RTX 4090, A100, etc.) puede ejecutar el modelo sin problemas. También es posible ejecutarlo en CPU con llama.cpp, aunque con mayor latencia.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier motor compatible con GGUF. También se puede usar con la librería `llama-cpp-python` en Python.
- Latencia y throughput: no se han publicado mediciones. En una GPU moderna, un modelo de 1,5B cuantizado puede generar decenas de tokens por segundo, pero los valores exactos dependen del hardware y la configuración.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa objetiva con otros modelos de la misma categoría. El modelo base no tiene documentación pública de rendimiento, y no se conocen alternativas directas con las que compararlo. Se sugiere consultar modelos como Qwen2-1.5B o Llama-3.2-1B para establecer referencias, pero sin datos de benchmarks no es posible una comparación rigurosa.

## Limitaciones y advertencias

- No hay información sobre sesgos o alucinaciones específicas del modelo; se recomienda evaluarlo en el dominio de uso antes de desplegarlo en producción.
- La licencia no está especificada, por lo que el uso comercial podría estar restringido. Se debe contactar con el autor del modelo base para aclarar los términos.
- El modelo solo soporta inglés, lo que limita su uso en entornos multilingües.
- Al ser una cuantización, puede haber una pérdida de calidad en la generación, especialmente en las variantes de menor precisión (Q2_K, Q3_K).
- La falta de documentación sobre el entrenamiento y la arquitectura impide conocer sus límites reales de contexto y capacidad de razonamiento.
- El repositorio de cuantización no incluye el modelo original en formato safetensors; para usarlo con transformers, es necesario descargar el modelo base desde onekq-ai.

## Enlaces

- Repositorio de cuantización GGUF: https://huggingface.co/mradermacher/OneSQL-v0.2-Qwen-1.5B-GGUF
- Modelo base: https://huggingface.co/onekq-ai/OneSQL-v0.2-Qwen-1.5B
