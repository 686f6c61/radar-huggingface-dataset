# Aeit/tifa-left-brain

## Resumen

El modelo `Aeit/tifa-left-brain` es un fine-tune del modelo base `Meta-Llama-3.1-8B-Instruct` al que se ha aplicado la técnica de *abliteración* (eliminación de comportamientos no deseados) y posteriormente se ha convertido a formato GGUF mediante la librería Unsloth. El autor, identificado como Aeit, publica este modelo con el objetivo de ofrecer una versión cuantizada y lista para ejecución local con llama.cpp u otras herramientas compatibles con GGUF.

El modelo cuenta con 8.030.261.312 parámetros (aproximadamente 8B) y el repositorio contiene un único archivo de pesos en cuantización Q4_K_M, lo que lo hace adecuado para entornos con recursos limitados. Al estar basado en Llama 3.1, hereda la arquitectura transformer decoder-only y las capacidades de instrucción del modelo original, aunque no se especifican detalles sobre el proceso de fine-tuning, los datos de entrenamiento ni la longitud de contexto final.

La relevancia de este modelo radica en su formato GGUF, que permite su despliegue en una amplia variedad de plataformas de inferencia local (llama.cpp, Ollama, LM Studio, etc.) sin necesidad de infraestructura en la nube. La abliteración, por su parte, busca reducir ciertos comportamientos no deseados del modelo base, aunque no se documentan los criterios específicos aplicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Meta-Llama-3.1-8B-Instruct) |
| Parametros totales | 8.030.261.312 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (el modelo base soporta 128k, pero no se especifica para este fine-tune) |
| Tipos de cuantizacion | Q4_K_M (único archivo disponible) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura de Llama 3.1 8B, un transformer autoregresivo con normalización RMSNorm, atención con RoPE y un vocabulario de 128k tokens. El fine-tune se realizó con la librería Unsloth, que optimiza el entrenamiento para reducir el uso de memoria y acelerar el proceso. La técnica de *abliteración* aplicada consiste en modificar los pesos del modelo para eliminar o mitigar ciertos comportamientos considerados indeseables, aunque no se detalla qué comportamientos concretos se han abordado ni la metodología exacta empleada.

No se proporciona información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se utilizaron técnicas como RLHF o DPO. Tampoco se documentan innovaciones técnicas adicionales más allá de la conversión a GGUF y la cuantización Q4_K_M, que reduce el tamaño del modelo a aproximadamente 4.9 GB.

## Capacidades

- Generación de texto y conversación: al ser un modelo instruct, puede mantener diálogos multi-turno y seguir instrucciones en lenguaje natural.
- Ejecución local: el formato GGUF permite su uso con llama.cpp, llama-cli, Ollama y otras herramientas compatibles.
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere que puede desplegarse en servidores de inferencia compatibles con la API de OpenAI (por ejemplo, vLLM o llama.cpp server).
- Abliteración: el modelo ha sido modificado para reducir ciertos comportamientos no deseados, aunque no se especifica el alcance.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio ni otras modalidades.

## Casos de uso

- Chat local privado: al ser un GGUF de 8B cuantizado, puede ejecutarse en una GPU de consumo o incluso en CPU, permitiendo conversaciones sin conexión a internet y con total privacidad de los datos.
- Prototipado rápido de aplicaciones conversacionales: gracias a su compatibilidad con endpoints, se puede integrar en entornos de desarrollo para probar flujos de diálogo antes de migrar a modelos más grandes.
- Asistente de escritura: el modelo puede generar borradores de textos, resúmenes o reescribir contenido, aprovechando su capacidad de seguir instrucciones.
- Educación y experimentación: investigadores y estudiantes pueden utilizarlo para estudiar el efecto de la abliteración en modelos de lenguaje, comparando su comportamiento con el modelo base.
- Despliegue en entornos con recursos limitados: su tamaño reducido (4.9 GB) permite ejecutarlo en dispositivos edge, Raspberry Pi con suficiente RAM o servidores sin GPU dedicada.
- Evaluación de técnicas de cuantización: al ser un modelo GGUF, puede servir como referencia para probar diferentes backends de inferencia (llama.cpp, Ollama, etc.) y medir rendimiento en distintas configuraciones de hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K ni otras métricas estándar. El rendimiento esperado será similar al del modelo base Llama 3.1 8B Instruct, con posibles variaciones debidas a la abliteración y a la cuantización Q4_K_M, pero no hay datos cuantitativos que lo confirmen.

## Requisitos de hardware

- VRAM estimada: para el archivo Q4_K_M de 4.9 GB, se recomienda al menos 6 GB de VRAM para inferencia con GPU. Con 8 GB se puede operar con comodidad y contexto moderado.
- GPUs compatibles: cualquier GPU con 6 GB o más de VRAM, como NVIDIA RTX 3060, RTX 4060, RTX 2070, o GPUs de datacenter como A10, A100 (aunque estas últimas son sobredimensionadas para este modelo).
- Ejecución en CPU: es posible ejecutar el modelo en CPU con llama.cpp, aunque la velocidad será significativamente menor. Se recomienda al menos 16 GB de RAM.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama, LM Studio, vLLM (con conversión a formato compatible), TGI (si se convierte a safetensors).
- Latencia y throughput: no se dispone de mediciones específicas. En una GPU RTX 4090, se espera una generación de aproximadamente 50-100 tokens por segundo con este tamaño de modelo y cuantización, pero estos valores son orientativos y dependen del backend y la configuración.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Aeit/tifa-left-brain | 8B | No disponible | GGUF (Q4_K_M) | No disponible | Fine-tune abliterado de Llama 3.1 8B |
| Meta-Llama-3.1-8B-Instruct | 8B | 128k | safetensors, GGUF | Llama 3.1 Community License | Modelo base original |
| Mistral-7B-Instruct | 7B | 32k | safetensors, GGUF | Apache 2.0 | Alternativa popular de 7B |

La comparativa se limita a modelos de tamaño similar. El modelo de Aeit se distingue por su abliteración y su formato GGUF listo para usar, pero carece de documentación sobre licencia y contexto, lo que puede ser un inconveniente para producción. El modelo base Llama 3.1 8B Instruct ofrece una licencia más clara y un contexto de 128k, mientras que Mistral-7B-Instruct tiene una licencia permisiva (Apache 2.0) y un contexto menor.

## Limitaciones y advertencias

- Licencia no especificada: no se indica la licencia del modelo, lo que impide conocer si es apto para uso comercial o si tiene restricciones. Esto es un riesgo legal importante para cualquier despliegue en producción.
- Longitud de contexto desconocida: aunque el modelo base soporta 128k tokens, el fine-tune podría haber reducido este valor. No se documenta, por lo que se recomienda probar con secuencias cortas y verificar el comportamiento.
- Abliteración no documentada: la técnica de abliteración puede introducir comportamientos impredecibles o degradar el rendimiento en ciertas tareas. No se especifican los criterios de eliminación ni se ofrecen garantías de seguridad.
- Sin benchmarks: la ausencia de resultados de evaluación impide comparar objetivamente su calidad con otros modelos.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar información falsa o inventada, especialmente en dominios especializados.
- Sesgos potenciales: al derivar de Llama 3.1, puede heredar sesgos presentes en los datos de entrenamiento originales, y la abliteración podría no eliminarlos por completo.
- Soporte limitado: al ser un modelo con 0 descargas y 0 likes, no hay comunidad activa ni soporte del autor, lo que dificulta la resolución de problemas.

## Enlaces

- [HuggingFace: Aeit/tifa-left-brain](https://huggingface.co/Aeit/tifa-left-brain)
- [Unsloth (librería de fine-tuning y conversión)](https://github.com/unslothai/unsloth)
- [llama.cpp (repositorio de inferencia)](https://github.com/ggerganov/llama.cpp)
