# shimbaaa/Shifu-chat-GGUF

## Resumen

Shifu-chat-GGUF es un modelo de lenguaje conversacional en formato GGUF, desarrollado por el usuario shimbaaa, que parte de una puesta a punto del modelo base Qwen2.5-0.5B de Alibaba Cloud. El repositorio contiene una única cuantización Q4_K_M del modelo afinado, convertida mediante la librería Unsloth para su uso con llama.cpp y otros motores compatibles con GGUF. Con aproximadamente 494 millones de parámetros, se trata de un modelo compacto orientado a tareas de chat, pensado para ejecutarse en entornos con recursos limitados.

La relevancia actual reside en la creciente demanda de modelos pequeños y eficientes que puedan desplegarse localmente en dispositivos con poca memoria, manteniendo una calidad aceptable para conversaciones sencillas. Al estar basado en la arquitectura Qwen2.5, hereda las capacidades básicas de esa familia, aunque el repositorio no ofrece detalles sobre el proceso de afinamiento ni sobre el conjunto de datos utilizado. El proyecto forma parte de una serie de modelos similares publicados por el mismo autor (shifu-smart-gguf y shifu-smart-1.5b-gguf), aunque no se aportan comparaciones ni evaluaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2.5 (modelo base: Qwen2.5-0.5B) |
| Parametros totales | 494.032.768 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (por defecto en Qwen2.5-0.5B: 32.768 tokens, no confirmado en este repo) |
| Tipos de cuantizacion | Q4_K_M (unico archivo: Qwen2.5-0.5B.Q4_K_M.gguf) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo es una puesta a punto (fine-tune) del modelo Qwen2.5-0.5B, un transformer decoder-only con atención causal, perteneciente a la familia Qwen2.5 de Alibaba Cloud. El proceso de afinamiento se realizó con la librería Unsloth, que acelera el entrenamiento y la conversión a formato GGUF. No se proporciona información sobre el dataset de entrenamiento, el número de tokens utilizados, ni si se aplicaron técnicas como RLHF o DPO. Tampoco se documentan innovaciones técnicas adicionales más allá de la conversión a GGUF para inferencia eficiente con llama.cpp.

## Capacidades

- Generación de texto conversacional: al ser un modelo de chat, puede mantener diálogos multi-turno básicos.
- No se dispone de información sobre soporte de tool calling, function calling, razonamiento multi-paso, capacidades multimodales o modos de pensamiento.
- Al estar basado en Qwen2.5, es plausible que herede ciertas capacidades multilingües del modelo base, pero no se confirma en la documentación.
- No se documentan capacidades especiales como visión o audio.

## Casos de uso

Debido a la falta de información detallada, los casos de uso se infieren a partir del tamaño y la naturaleza del modelo:

- Asistentes conversacionales ligeros: su tamaño compacto permite ejecutarlo en dispositivos con poca memoria (por ejemplo, Raspberry Pi, portátiles antiguos o móviles) para prototipos de chatbots.
- Pruebas de concepto en entornos educativos: útil para demostrar técnicas de fine-tuning y cuantización en cursos de IA.
- Inferencia en CPU: al ser un modelo de 0.5B en Q4_K_M, puede ejecutarse en CPU sin GPU dedicada, aunque con latencia mayor.
- Desarrollo de aplicaciones de chat offline: para entornos donde la privacidad exige procesamiento local, aunque sus capacidades son limitadas.
- Evaluación de pipelines de despliegue: sirve como banco de pruebas para integrar modelos GGUF con llama.cpp, Ollama o vLLM.
- Experimentación con técnicas de prompting: al ser pequeño, permite iterar rápidamente sobre distintos prompts y configuraciones de generación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El archivo GGUF tiene un tamaño aproximado de 0.4 GB (según el tamaño del repositorio), por lo que la VRAM necesaria para cargarlo en GPU es inferior a 1 GB.
- Puede ejecutarse en GPUs de gama baja como NVIDIA GTX 1050 Ti (4 GB) o incluso en iGPUs con suficiente memoria compartida.
- En CPU, puede funcionar en sistemas con al menos 2 GB de RAM libre, aunque la velocidad de generación será notablemente más lenta que en GPU.
- Motores de despliegue compatibles: llama.cpp, Ollama, LM Studio, y cualquier runtime que soporte GGUF (también puede usarse con vLLM mediante conversión, aunque no es el flujo habitual).
- No se dispone de datos de latencia o throughput específicos para este modelo.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros modelos. Se puede señalar que pertenece a la familia de fine-tunes de Qwen2.5-0.5B, junto con otros repositorios del mismo autor (shifu-smart-gguf, shifu-smart-1.5b-gguf), pero no se aportan métricas ni características diferenciadoras.

## Limitaciones y advertencias

- El modelo tiene solo 0.5B de parámetros, por lo que su capacidad de razonamiento complejo, generación de código avanzado y manejo de contextos largos es muy limitada.
- No se especifica la licencia, lo que impide conocer las restricciones de uso comercial o modificación. Se recomienda contactar al autor antes de utilizarlo en producción.
- No se documentan sesgos específicos, pero al ser un fine-tune de un modelo base, puede heredar sesgos presentes en los datos de entrenamiento originales.
- Riesgo de alucinaciones: como todo modelo de lenguaje, puede generar información falsa o inventada, especialmente en dominios especializados.
- No hay garantías de calidad: al no haber benchmarks ni evaluaciones publicadas, el rendimiento real en tareas concretas es desconocido.
- La falta de información sobre el contexto máximo soportado obliga a asumir el valor por defecto de Qwen2.5-0.5B (32.768 tokens), pero no está confirmado en este repo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/shimbaaa/Shifu-chat-GGUF
- Modelo relacionado (shifu-smart-gguf): https://huggingface.co/shimbaaa/shifu-smart-gguf
- Modelo relacionado (shifu-smart-1.5b-gguf): https://huggingface.co/shimbaaa/shifu-smart-1.5b-gguf
- Librería Unsloth (herramienta de fine-tuning y conversión): https://github.com/unslothai/unsloth
