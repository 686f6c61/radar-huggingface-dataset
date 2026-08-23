# alihkhawaher/Medical-Qwen3-Swallow-30B-A3B-Q4_K_M-GGUF

## Resumen

Medical-Qwen3-Swallow-30B-A3B-Q4_K_M-GGUF es una conversión al formato GGUF del modelo Medical-Qwen3-Swallow-30B-A3B, desarrollado por tokyotech-llm. Este modelo es una variante especializada en el dominio médico del modelo Qwen3-Swallow, que a su vez mejora las capacidades de razonamiento y el dominio del japonés del modelo Qwen3-30B-A3B de Alibaba. Con una arquitectura MoE de 30 000 millones de parámetros totales y solo 3 000 millones activos, ofrece un equilibrio entre capacidad y eficiencia computacional.

La conversión a GGUF permite ejecutar el modelo con llama.cpp en CPU, Mac o GPU, lo que facilita su despliegue en entornos locales sin depender de infraestructura en la nube. Está pensado para tareas de generación de texto en japonés e inglés, con especialización en terminología y contextos médicos. Su licencia Apache 2.0 permite uso comercial y modificación, lo que lo convierte en una opción atractiva para proyectos de salud abiertos.

El archivo de cuantización Q4_K_M ocupa 18.6 GB, lo que permite ejecutarlo en GPUs de consumo con 24 GB de VRAM o en CPUs con suficiente RAM. No se han publicado detalles sobre el entrenamiento específico ni benchmarks oficiales en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-MoE (MoE con activación por tokens) |
| Parametros totales | 30 532 122 624 (30B) |
| Parametros activos | 3B (A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (archivo GGUF) |
| Idiomas soportados | japones, ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base Medical-Qwen3-Swallow-30B-A3B utiliza una arquitectura de mezcla de expertos (MoE) con 30 000 millones de parámetros totales y solo 3 000 millones activos por token, lo que reduce el coste computacional en inferencia. La arquitectura sigue el diseño de Qwen3, que incorpora mecanismos de atención estándar y capas de MoE con activaciones dispersas. El modelo original fue ajustado para el dominio médico, pero no se dispone de información sobre la composición del dataset de entrenamiento, el número de tokens utilizados ni si se aplicaron técnicas como RLHF o DPO.

La conversión a GGUF fue realizada mediante el espacio GGUF-my-repo de ggml.ai, que genera archivos cuantizados para su uso con llama.cpp. La cuantización Q4_K_M reduce el peso de los parámetros a 4 bits, conservando un equilibrio entre calidad y eficiencia de memoria.

## Capacidades

- Generacion de texto en japones e ingles, con enfoque en terminologia medica y contextos clinicos.
- Capacidades de razonamiento heredadas de Qwen3-Swallow, que incluyen tareas de logica y deduccion.
- Soporte para tareas de preguntas y respuestas en el ambito medico (sin confirmacion de tool calling).
- No se especifican capacidades de vision, audio o decodificacion especulativa.
- El modelo es apto para inferencia local mediante llama.cpp, permitiendo despliegues en CPU y GPU.

## Casos de uso

- **Asistencia en redaccion de informes medicos**: el modelo puede generar borradores de informes clinicos en japones o ingles, basandose en notas o datos estructurados, gracias a su conocimiento de terminologia medica.
- **Soporte en consulta de pacientes**: permite responder a preguntas frecuentes sobre sintomas o tratamientos, siempre con supervision humana, aprovechando su razonamiento y vocabulario especializado.
- **Traduccion medica**: puede traducir textos medicos entre japones e ingles, manteniendo la precision de los terminos especializados.
- **Investigacion bibliografica**: ayuda a resumir articulos cientificos o extraer informacion relevante de publicaciones medicas en los idiomas soportados.
- **Educacion medica**: genera preguntas de practica, explicaciones de conceptos y casos clinicos para estudiantes de medicina.
- **Desarrollo de aplicaciones de telemedicina**: integracion en sistemas de atencion primaria para responder consultas iniciales, reduciendo la carga de trabajo del personal sanitario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos comparativos con otros modelos en tareas como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- **VRAM estimada**: el archivo GGUF Q4_K_M ocupa 18.6 GB, por lo que se recomienda al menos 20 GB de VRAM para cargar el modelo completo en GPU.
- **GPUs recomendadas**: NVIDIA RTX 3090 (24 GB), RTX 4090 (24 GB), A5000 (24 GB) o superiores. En CPUs, se puede ejecutar con 32 GB de RAM, aunque la latencia sera mayor.
- **Compatibilidad con GPU de consumo**: si, es compatible con GPUs de 24 GB, aunque no cabra en modelos de 12 GB o 16 GB.
- **Opciones de despliegue**: llama.cpp (CLI y servidor), llama-cpp-python, y cualquier framework que soporte GGUF como llama-cpp-python o llama-server.
- **Latencia y throughput**: no disponibles. En MoE, la latencia depende del numero de parametros activos (3B) y de la velocidad de memoria.

## Comparativa con modelos similares

No se dispone de informacion comparativa publicada entre Medical-Qwen3-Swallow-30B-A3B y otros modelos medicos o de razonamiento en japones. No obstante, se puede mencionar que el modelo base Qwen3-30B-A3B es el equivalente no especializado, con la misma arquitectura y tamano, pero sin el ajuste medico. La licencia Apache 2.0 del modelo medico facilita su uso frente a alternativas con licencias mas restrictivas.

## Limitaciones y advertencias

- **Idiomas limitados**: el modelo solo esta entrenado en japones e ingles, no en otros idiomas como espanol o frances.
- **Riesgo de alucinaciones**: como cualquier modelo de lenguaje, puede generar informacion medica incorrecta o inventada, por lo que no debe utilizarse para diagnostico o tratamiento sin supervision humana.
- **Contexto no confirmado**: no se ha especificado la longitud de contexto soportada, lo que puede limitar su uso en tareas de contexto largo.
- **Licencia**: Apache 2.0 permite uso comercial, pero hay que verificar los terminos de las dependencias del modelo base.
- **Falta de evaluacion**: no se han publicado benchmarks ni evaluaciones de sesgos o seguridad, por lo que su rendimiento en entornos reales es incierto.
- **Especializacion medica**: el ajuste medico puede reducir su capacidad generalista en otros dominios.

## Enlaces

- [HuggingFace - alihkhawaher/Medical-Qwen3-Swallow-30B-A3B-Q4_K_M-GGUF](https://huggingface.co/alihkhawaher/Medical-Qwen3-Swallow-30B-A3B-Q4_K_M-GGUF)
- [Modelo base - tokyotech-llm/Medical-Qwen3-Swallow-30B-A3B](https://huggingface.co/tokyotech-llm/Medical-Qwen3-Swallow-30B-A3B)
- [Qwen3 Swallow - sitio oficial](https://swallow-llm.github.io/qwen3-swallow.en.html)
- [Repositorio Qwen3 en GitHub](https://github.com/QwenLM/Qwen3)
- [Espacio GGUF-my-repo](https://huggingface.co/spaces/ggml-org/gguf-my-repo)
