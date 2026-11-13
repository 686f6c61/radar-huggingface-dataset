# amd/Step-3.5-Flash_gpuep_1.0_gpu_128

## Resumen

Step-3.5-Flash_gpuep_1.0_gpu_128 es una versión cuantizada y convertida a ONNX del modelo stepfun-ai/Step-3.5-Flash, publicada por AMD. El modelo original es un transformer de tipo Mixture of Experts (MoE) desarrollado por StepFun y orientado a generación de texto conversacional. Esta variante concreta ha sido optimizada por AMD mediante la herramienta Olive Mobius Builder para su despliegue sobre hardware AMD usando ONNX Runtime GenAI y particionado de expertos por GPU (hip-ep).

La relevancia de esta ficha radica en que se trata de un artefacto de despliegue, no de un modelo nuevo: el interés está en la estrategia de cuantización agresiva aplicada a los expertos MoE (INT2 asimétrico en grupo 64) combinada con INT8 para atención y capas densas, lo que reduce drásticamente el peso del repositorio (62,6 GB) frente a los pesos originales. Está pensado para inferencia eficiente en clústeres de GPU AMD con reparto de expertos entre dispositivos.

No se dispone de información publicada sobre el número de parámetros totales o activos, la longitud de contexto efectiva ni los datos de entrenamiento del modelo base en la documentación proporcionada. La model card se limita a describir la estrategia de cuantización y la licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE), decoder solo texto |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Activaciones FP16; expertos MoE INT2 asimétrico (grupo 64, GPTQ search); atención, MLP densa y expertos compartidos INT8 simétrico (grupo 128); LM head INT4 MatMulNBits (grupo 32) |
| Idiomas soportados | en |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (ONNX Runtime GenAI) |
| Tamano del repositorio | 62,6 GB |
| Vision encoder | no (decoder solo texto) |
| Runtime de despliegue | onnxruntime-genai con hip-ep (reparto de expertos por GPU) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer MoE de tipo decoder, según indican las etiquetas del repositorio (`moe`) y la descripción de la estrategia de cuantización, que distingue entre expertos MoE, expertos compartidos y MLP densa. El modelo es exclusivamente de texto: la model card especifica explícitamente "No vision encoder (text-only decoder)".

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO u otras etapas de alineación en el modelo base Step-3.5-Flash. La innovación técnica documentada en este repositorio es la pipeline de cuantización de AMD: búsqueda GPTQ específica para los expertos MoE con pesos INT2 asimétricos en grupos de 64, INT8 simétrico en grupos de 128 para atención y capas densas, e INT4 MatMulNBits para el LM head, todo ello empaquetado en ONNX para ejecución con ONNX Runtime GenAI y paralelismo de expertos por GPU (hip-ep).

## Capacidades

- Generación de texto conversacional en inglés (pipeline `text-generation`, tag `conversational`).
- Razonamiento y generación de contenido textual propio de un modelo de lenguaje de gran escala, aunque no se detallan capacidades específicas en la documentación disponible.
- No soporta visión: el encoder visual ha sido eliminado explícitamente.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según el campo `language: en`.
- Capacidades especiales (thinking mode, audio, visión): no disponibles.

## Casos de uso

- Despliegue de inferencia de un LLM MoE sobre clústeres de GPU AMD: el formato ONNX con hip-ep permite repartir los expertos entre varias GPU, lo que resulta adecuado para servir el modelo en infraestructura AMD Instinct con ONNX Runtime GenAI.
- Servicio de chat en inglés con bajo coste de memoria: la cuantización INT2 de los expertos reduce la huella del modelo, permitiendo alojar un MoE grande en menos VRAM total a cambio de cierta pérdida de precisión.
- Evaluación comparativa de estrategias de cuantización: el repositorio sirve como referencia para estudiar el impacto de INT2 asimétrico en expertos MoE frente a alternativas INT4/INT8 en tareas de generación de texto.
- Integración en pipelines de ONNX Runtime GenAI: al usar la librería `onnxruntime-genai`, puede embeberse en aplicaciones .NET, Python o C++ que ya utilicen este runtime.
- Prototipado de asistentes conversacionales en inglés sobre hardware AMD: útil para equipos que desarrollan sobre ROCm/HIP y necesitan un modelo de referencia ya optimizado para su stack.
- Benchmarking de throughput en hardware AMD: el particionado de expertos por GPU permite medir escalado de latencia y throughput al aumentar el número de dispositivos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 62,6 GB en disco; la VRAM necesaria para inferencia es del mismo orden, ya que los pesos cuantizados se cargan completos (MoE con todos los expertos residentes). No se dispone de cifra oficial de VRAM pico.
- GPU recomendadas: hardware AMD compatible con hip-ep y ONNX Runtime GenAI (serie AMD Instinct). No se especifican modelos concretos en la documentación.
- Compatibilidad con GPU de consumo: no confirmada; el tamaño de 62,6 GB y el uso de hip-ep sugieren despliegue multi-GPU en hardware profesional, no en una única GPU de consumo.
- Opciones de despliegue: ONNX Runtime GenAI con el execution provider hip-ep. No se menciona compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| amd/Step-3.5-Flash_gpuep_1.0_gpu_128 | no disponible (MoE) | no disponible | ONNX (INT2/INT8/INT4) | Apache 2.0 | Cuantizado por AMD para hip-ep |
| stepfun-ai/Step-3.5-Flash | no disponible (MoE) | no disponible | safetensors (original) | Apache 2.0 | Modelo base sin cuantizar |
| Otros MoE abiertos (p. ej. familia Mixtral, Qwen-MoE) | variable | variable | safetensors/GGUF | variable | No se dispone de comparación directa documentada |

No se dispone de datos de rendimiento que permitan una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- La cuantización INT2 de los expertos MoE puede degradar la calidad respecto al modelo original; no se han publicado evaluaciones que cuantifiquen esa pérdida.
- Modelo solo en inglés: no apto para producción en castellano u otros idiomas sin evaluación adicional.
- Sin encoder de visión: no puede procesar imágenes.
- Riesgo de alucinación inherente a los LLM; no se documentan medidas de mitigación específicas.
- Sesgos: no disponibles en la información proporcionada.
- Licencia Apache 2.0 permite uso comercial, pero al ser un derivado cuantizado conviene conservar los avisos de copyright de AMD y de StepFun.
- El despliegue depende de ONNX Runtime GenAI y del execution provider hip-ep; no es portable directamente a otros runtimes sin reconversión.
- No se especifican límites de contexto ni comportamiento en conversaciones largas.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: poca validación comunitaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/amd/Step-3.5-Flash_gpuep_1.0_gpu_128
- Modelo base: https://huggingface.co/stepfun-ai/Step-3.5-Flash
- ONNX Runtime GenAI: https://github.com/microsoft/onnxruntime-genai
- Herramienta Olive (Mobius Builder): https://github.com/microsoft/Olive
