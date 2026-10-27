# Dirys/Artemis-31B-v1.1-NVFP4A16-gptq

## Resumen

Artemis-31B-v1.1-NVFP4A16-gptq es una cuantización de solo pesos (weight-only) del modelo TheDrummer/Artemis-31B-v1.1, publicada por el usuario Dirys. El checkpoint usa el formato NVFP4A16 de `compressed-tensors`, con calibración GPTQ realizada mediante `llm-compressor`, y está pensado para servirse con vLLM en hardware compatible con FP4. No es un modelo nuevo: es una versión comprimida a 4 bits del modelo base, con embeddings, `lm_head` y las torres de visión y audio conservados en bf16.

El modelo base pertenece a la familia Gemma 4 (tag `gemma4`) y está orientado a roleplay y conversación. La calibración se hizo con turnos de roleplay y chat en 12 idiomas (en, es, fr, de, pl, it, zh-Hans, zh-Hant, ko, ja, vi, cs), ponderados por tráfico, lo que indica que el objetivo del cuantizado es preservar la calidad conversacional multilingüe más que el rendimiento en tareas de código o matemáticas.

Su relevancia es doble: por un lado, permite ejecutar un modelo de gran tamaño con la mitad de memoria aproximadamente respecto a bf16; por otro, es un caso práctico de cuantización NVFP4 calibrada con GPTQ para vLLM. Conviene señalar que el repositorio no declara licencia, pipeline, idiomas oficiales ni resultados de benchmarks, y que no tiene descargas ni valoraciones en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Gemma 4 (tag `gemma4`), con torres de visión y audio en el modelo base |
| Parámetros totales | 18.460.143.562 (según safetensors del repo); el nombre del modelo indica 31B, discrepancia no aclarada en la información disponible |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | NVFP4A16 (weight-only, 4 bits en pesos lineales; activaciones y componentes sensibles en bf16), calibración GPTQ |
| Idiomas soportados | no disponible como listado oficial; el conjunto de calibración cubre 12 idiomas: en, es, fr, de, pl, it, zh-Hans, zh-Hant, ko, ja, vi, cs |
| Licencia | no disponible |
| Formato de pesos | safetensors con `compressed-tensors` (NVFP4A16) |
| Componentes en bf16 | `lm_head`, embeddings y torres de visión y audio |
| Tamaño del repositorio | 20,5 GB |
| Motor de inferencia recomendado | vLLM con `--language-model-only` |
| Modelo base | TheDrummer/Artemis-31B-v1.1 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base: un transformer decoder-only de la familia Gemma 4 con componentes multimodales (torres de visión y audio), según se deduce de la propia model card, que indica que esas torres se mantienen en bf16. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset original ni si el modelo base usó RLHF, DPO u otro tipo de ajuste; la model card del cuantizado no los detalla.

La innovación técnica de este repositorio es la cuantización: se aplica NVFP4A16, un esquema de 4 bits por peso con escala de grupo en formato FP4, calibrado con GPTQ mediante `llm-compressor`. El proceso es weight-only, de modo que las activaciones no se cuantizan a 4 bits y los módulos críticos (`lm_head`, embeddings, torres multimodales) permanecen en bf16 para limitar la degradación. El conjunto de calibración se compuso con turnos de roleplay y chat en 12 idiomas ponderados por tráfico, lo que sesga explícitamente la calibración hacia el dominio conversacional.

## Capacidades

- Generación de texto y diálogo multi-turno, con especial orientación a roleplay y conversación (dominio declarado en la calibración).
- Conversación multilingüe en los 12 idiomas cubiertos por el conjunto de calibración, aunque no hay una lista oficial de idiomas soportados.
- Capacidades multimodales heredadas del modelo base (torres de visión y audio presentes en el checkpoint en bf16), si bien el autor recomienda servir con `--language-model-only`, lo que en la práctica desactiva esas torres en vLLM.
- Ejecución eficiente en memoria gracias a pesos de 4 bits, con posibilidad de servir el modelo en una sola GPU Blackwell de gama alta.
- No se declaran capacidades específicas de tool calling, function calling, agentes o modo de razonamiento explícito; no disponible.

## Casos de uso

- Roleplay y chat de personajes: es el dominio para el que se calibró el cuantizado, de modo que la pérdida de calidad respecto a bf16 debería ser menor que con una calibración genérica. Adecuado para productos de entretenimiento conversacional.
- Despliegue económico en infraestructura Blackwell: al reducir los pesos a 4 bits, permite servir un modelo de gran tamaño con aproximadamente la mitad de VRAM que la versión bf16, lo que rebaja el coste por instancia en clústeres con B200 o GB200.
- Asistentes multilingües de atención al cliente: la calibración cubre 12 idiomas, incluidos es, fr, de, it, pl, zh, ko, ja y vi, lo que lo hace apto para bases de usuarios europeas y asiáticas.
- Evaluación de cuantización NVFP4: sirve como referencia para medir la degradación de un modelo conversacional al pasar de bf16 a FP4 con calibración GPTQ en GPTQ/`compressed-tensors`.
- Generación de datos sintéticos de diálogo: útil para producir corpus conversacionales en varios idiomas a coste reducido, siempre que se filtre la calidad posteriormente.
- Prototipado e investigación en vLLM: el checkpoint está preparado para el stack de vLLM (`compressed-tensors`), lo que facilita experimentos de throughput y comparativas de precisión en ese motor.
- Sistemas con restricciones de memoria en producción: cuando el modelo bf16 no cabe en la GPU disponible pero se necesita mantener un modelo grande, el NVFP4A16 es una alternativa viable antes de recurrir a modelos más pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de calidad (MMLU, HumanEval, GSM8K, MT-Bench ni evaluaciones de roleplay), ni comparativas de perplejidad frente al modelo base en bf16, ni datos de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos cuantizados a 4 bits de 18,46B parámetros ocupan aproximadamente 9-10 GB; a ello se suman los componentes en bf16 (embeddings, `lm_head`, torres multimodales) y la caché KV. Estimación orientativa de 12-16 GB para pesos y overhead, a la que hay que añadir la caché KV según contexto y batch; no es un dato publicado por el autor.
- El repositorio ocupa 20,5 GB en disco, cifra superior a la estimación de pesos cuantizados, probablemente por los componentes en bf16 y metadatos.
- GPU recomendadas: NVFP4 requiere soporte nativo de FP4, disponible en GPU Blackwell (B200, GB200, RTX 5090 y familia). En A100 o H100 no hay soporte nativo de FP4; el comportamiento de vLLM con `compressed-tensors` NVFP4 en esas arquitecturas no está documentado en la información disponible.
- Cabe en GPU de consumo Blackwell (RTX 5090, 32 GB) según la estimación de VRAM, siempre que el contexto y el batch sean moderados; no verificado por el autor.
- Opciones de despliegue: vLLM con `--language-model-only` es el motor indicado por el autor. llama.cpp, Ollama y TGI no se mencionan y su compatibilidad con NVFP4A16 no está confirmada.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Hardware | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Dirys/Artemis-31B-v1.1-NVFP4A16-gptq | 18,46B (safetensors) | no disponible | NVFP4A16 + GPTQ | GPU Blackwell con vLLM | no disponible | pública en HF, 0 descargas |
| TheDrummer/Artemis-31B-v1.1 (base) | no disponible en esta información | no disponible | bf16 safetensors | GPU con ≥ 2× memoria del cuantizado | no disponible | pública en HF |
| Cuantización INT4 genérica tipo GPTQ/AWQ del mismo base | no disponible | no disponible | INT4 weight-only | Ampere, Ada, Hopper, Blackwell | heredada del base | no disponible |

La comparación cuantitativa no es posible: no hay benchmarks publicados para este checkpoint ni datos de contexto o licencia del modelo base en la información proporcionada. La diferencia principal frente al base es el formato de pesos y la consiguiente reducción de memoria, a cambio de una pérdida de precisión no medida.

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir uso comercial permitido. Es imprescindible verificar la licencia del modelo base antes de cualquier despliegue en producción.
- Es un cuantizado de terceros, no el modelo oficial: no hay garantía de que el autor haya validado la calidad frente a bf16.
- Sin benchmarks ni evaluaciones: no existe evidencia publicada de la degradación introducida por la cuantización en roleplay, código, matemáticas o razonamiento.
- Discrepancia de tamaño: el nombre indica 31B pero el recuento de safetensors es de 18,46B parámetros; conviene verificar el conteo real antes de dimensionar infraestructura.
- Calibración sesgada a chat y roleplay: el conjunto de calibración son turnos conversacionales, por lo que el rendimiento en código, matemáticas o tareas de razonamiento largo podría degradarse más que en diálogo.
- Idiomas: los 12 idiomas citados corresponden al conjunto de calibración, no a una declaración de soporte oficial; el rendimiento fuera de esos idiomas no está evaluado.
- Contexto: la longitud de contexto no está declarada en la información disponible.
- Multimodalidad limitada en la práctica: el autor recomienda `--language-model-only`, lo que desactiva visión y audio en vLLM pese a que las torres estén presentes.
- Riesgo de alucinación y sesgos: propios de un modelo conversacional de este tipo; no hay documentación específica sobre sesgos del base ni del cuantizado.
- Adopción nula: 0 descargas y 0 likes en el momento de la ficha, sin validación de la comunidad ni issues conocidos.
- Dependencia de hardware Blackwell: NVFP4 no es portable a GPU sin soporte FP4, lo que limita el despliegue en parques existentes de A100/H100.
- Servir junto al modelo base en bf16 requiere planificación de memoria aparte; no se documentan requisitos de VRAM oficiales.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Dirys/Artemis-31B-v1.1-NVFP4A16-gptq
- Modelo base: https://huggingface.co/TheDrummer/Artemis-31B-v1.1
- vLLM (motor recomendado por el autor): https://github.com/vllm-project/vllm
- llm-compressor (herramienta de calibración citada): https://github.com/vllm-project/llm-compressor
- compressed-tensors (formato NVFP4A16): https://github.com/neuralmagic/compressed-tensors
- Papers, blogs o demos específicos de este checkpoint: no disponible en la información proporcionada.
