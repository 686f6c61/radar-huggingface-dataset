# m4gshm/Qwen2.5-Coder-3B-nf4-sym-g-1-se-awq

## Resumen

Qwen2.5-Coder-3B-nf4-sym-g-1-se-awq es una exportación a OpenVINO del modelo Qwen/Qwen2.5-Coder-3B, publicada por el usuario m4gshm. No se trata de un modelo entrenado desde cero, sino de una conversión de pesos del modelo original de Alibaba Qwen a formato intermedio de OpenVINO (IR), cuantizada a 4 bits con el algoritmo AWQ (Activation-aware Weight Quantization). El objetivo es permitir la inferencia eficiente en hardware Intel (CPU, iGPU, NPU) mediante la librería Optimum-Intel, sin necesidad de GPU dedicada.

El modelo base Qwen2.5-Coder-3B es un transformer decoder-only de 3.000 millones de parámetros especializado en generación de código, con una ventana de contexto de 32.768 tokens en su versión original. Esta exportación conserva la arquitectura Qwen2ForCausalLM y la licencia Apache 2.0, pero reduce el peso de los pesos a aproximadamente 1,58 GB gracias a la cuantización nf4 simétrica con group_size=-1 (por canal) y escalas AWQ calibradas con el dataset GSM8K.

La relevancia de esta ficha radica en que ofrece una vía de despliegue de un modelo de código de 3B en entornos con recursos limitados, especialmente en equipos con CPU Intel o aceleradores integrados, donde un modelo en fp16 no cabría o tendría latencias inaceptables. No obstante, al ser una conversión de un tercero con muy pocas descargas (17) y sin benchmarks publicados, debe evaluarse con cautela antes de usarla en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2ForCausalLM (transformer decoder-only) |
| Parametros totales | 3.000 millones (modelo base Qwen2.5-Coder-3B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-Coder-3B soporta 32.768 tokens) |
| Tipos de cuantizacion | nf4 simetrica, group_size=-1 (por canal), escalas AWQ con calibracion en GSM8K |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | OpenVINO IR (openvino_model.bin / .xml), tokenizer y detokenizer en IR |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo Qwen2.5-Coder-3B: un transformer decoder-only con atención causal estándar (no se especifica en la información disponible si emplea GQA, RoPE u otras variantes concretas del bloque Qwen2). Esta exportación no modifica la arquitectura, sino que transforma los pesos a OpenVINO IR y aplica cuantización de pesos a 4 bits en formato nf4 simétrico con granularidad por canal (group_size=-1). Las escalas de cuantización se estiman con AWQ, un método activation-aware que pondera la importancia de cada canal según las activaciones observadas durante la calibración; el dataset de calibración empleado es GSM8K.

No se dispone de información sobre el proceso de entrenamiento del modelo base en la documentación proporcionada (número de tokens, composición del dataset, uso de RLHF/DPO, etc.). Tampoco se documentan innovaciones técnicas adicionales en la exportación más allá de la propia cuantización AWQ y el empaquetado para Optimum-Intel. El repositorio incluye todos los artefactos necesarios para cargar el modelo con `OVModelForCausalLM.from_pretrained(..., device="AUTO")`.

## Capacidades

- Generación de texto y conversación multi-turno (pipeline text-generation, tag conversational).
- Generación y asistencia en código (tag code), heredada del modelo base Qwen2.5-Coder-3B.
- Razonamiento y matemáticas básicas, presumiblemente conservadas del modelo base, aunque no se documentan evaluaciones específicas tras la cuantización.
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la información disponible.
- Capacidades multilingües: no disponibles (no se especifican idiomas).
- Capacidades especiales (thinking mode, visión, audio): no documentadas; la model card indica explícitamente que las imágenes no están soportadas.

## Casos de uso

- Asistente de código en IDE sobre portátiles con CPU Intel: el modelo, al ocupar 1,58 GB en IR, puede cargarse con Optimum-Intel en un portátil sin GPU dedicada y ofrecer autocompletado y explicación de fragmentos de código con latencia aceptable para uso interactivo.
- Generación de tests unitarios en pipelines de CI: se puede invocar el modelo desde un script Python que use `OVModelForCausalLM` para generar casos de prueba a partir de funciones existentes, aprovechando su especialización en código y su bajo consumo de memoria.
- Documentación automática de APIs: dado un fragmento de código, el modelo puede producir docstrings y descripciones de endpoints; su tamaño reducido permite ejecutarlo en el mismo servidor de CI que el resto de herramientas.
- Refactorización asistida en entornos con restricciones de hardware: en estaciones de trabajo con CPU Intel y sin acelerador, la cuantización nf4 permite mantener el modelo residente en memoria y aplicarlo a tareas de reescritura de código por lotes.
- Prototipado de chatbots técnicos embebidos: al ser un modelo de 3B cuantizado, puede integrarse en aplicaciones de escritorio o contenedores ligeros para responder preguntas sobre una base de código concreta, siempre que el contexto requerido no supere la ventana efectiva del modelo.
- Evaluación comparativa de cuantizaciones: útil para investigadores que quieran medir la degradación de calidad de AWQ nf4 frente a fp16 en tareas de código, usando el modelo original como referencia.
- Despliegue en dispositivos edge con NPU Intel: la exportación OpenVINO permite ejecutar el modelo en hardware con acelerador NPU integrado, adecuado para asistentes locales de programación sin conexión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 1,58 GB solo para los pesos en IR; hay que añadir la memoria del tokenizer, el estado de la caché KV y el overhead del runtime de OpenVINO. Para contextos largos, la caché KV puede crecer de forma significativa y requerir varios GB adicionales.
- GPU recomendadas: no se especifican; el formato OpenVINO está orientado a CPU, iGPU y NPU Intel. No se documenta compatibilidad con CUDA.
- Cabe en GPU consumer: no documentado. El tamaño de pesos permitiría cargarlo en GPUs con 4 GB o más, pero la ruta de ejecución prevista es OpenVINO en hardware Intel, no CUDA.
- Opciones de despliegue: Optimum-Intel (`OVModelForCausalLM`), OpenVINO Runtime; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| m4gshm/Qwen2.5-Coder-3B-nf4-sym-g-1-se-awq | 3B | no disponible (base: 32.768) | OpenVINO IR, nf4 AWQ | apache-2.0 | HuggingFace, 17 descargas |
| Qwen/Qwen2.5-Coder-3B (original) | 3B | 32.768 | safetensors, fp16/bf16 | apache-2.0 | HuggingFace, ampliamente usado |
| Qwen2.5-Coder-1.5B | 1,5B | 32.768 | safetensors, fp16/bf16 | apache-2.0 | HuggingFace |
| Qwen2.5-Coder-7B | 7B | 32.768 | safetensors, fp16/bf16 | apache-2.0 | HuggingFace |

La comparación principal es con el modelo original: esta exportación sacrifica precisión numérica (nf4) a cambio de un tamaño 4 veces menor y compatibilidad con OpenVINO. Frente a las variantes de 1,5B y 7B del mismo family, ofrece un punto intermedio de calidad y coste, pero solo es preferible si el entorno de despliegue es Intel y se necesita el formato IR.

## Limitaciones y advertencias

- La cuantización nf4 con AWQ introduce pérdida de precisión respecto al modelo original en fp16/bf16; no se han publicado evaluaciones que cuantifiquen esa degradación en tareas de código.
- El repositorio tiene muy poca tracción (17 descargas, 0 likes) y fue creado por un tercero no verificado; no hay garantía de mantenimiento ni de reproducibilidad del proceso de cuantización.
- No se documentan los idiomas soportados; el modelo base Qwen2.5-Coder tiene cobertura multilingüe, pero no se confirma que se conserve tras la conversión.
- Riesgo de alucinación inherente a los modelos de 3B, especialmente en código con APIs poco comunes o en razonamiento matemático complejo.
- La licencia Apache 2.0 permite uso comercial, pero al ser una conversión de un modelo de terceros conviene verificar los términos del modelo base y citar adecuadamente.
- El formato OpenVINO IR limita el despliegue a entornos con OpenVINO Runtime; no es directamente compatible con ecosistemas CUDA, llama.cpp u Ollama.
- No se especifica la longitud de contexto efectiva tras la exportación; si se necesitan contextos largos, debe validarse empíricamente la caché KV y el comportamiento del modelo.
- No hay información sobre sesgos específicos del modelo base ni sobre su mitigación.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/m4gshm/Qwen2.5-Coder-3B-nf4-sym-g-1-se-awq
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-3B
- Documentación de Optimum-Intel: https://huggingface.co/docs/optimum-intel
- Documentación de OpenVINO: https://docs.openvino.ai
- NNCF (Neural Network Compression Framework): https://github.com/openvinotoolkit/nncf
