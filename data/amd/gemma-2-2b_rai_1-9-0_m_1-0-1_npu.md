# amd/gemma-2-2b_rai_1.9.0_m_1.0.1_npu

## Resumen

`amd/gemma-2-2b_rai_1.9.0_m_1.0.1_npu` es una distribución del modelo Gemma 2 de 2 000 millones de parámetros publicada por AMD, optimizada para ejecutarse sobre la plataforma Ryzen AI mediante el runtime RAI (Ryzen AI Inference) en su versión 1.9.0, con el paquete de modelo 1.0.1. No se trata de un modelo entrenado desde cero por AMD, sino de una conversión del Gemma 2 2B original de Google DeepMind a formato ONNX y adaptada para aprovechar la NPU (unidad de procesamiento neuronal) integrada en los procesadores AMD Ryzen AI de última generación.

El interés de esta publicación es práctico: permite ejecutar un modelo de lenguaje generativo de tamaño pequeño directamente en hardware de consumo con aceleración dedicada en la NPU, sin depender exclusivamente de la GPU o la CPU. El repositorio ocupa 2,9 GB, lo que corresponde aproximadamente a los pesos en precisión de 16 bits o a una conversión ONNX con cierta sobrecarga de grafos.

La relevancia de esta ficha radica en que documenta el estado actual del despliegue de LLMs en silicio de consumo x86 con NPU dedicada, un nicho que hasta hace poco estaba dominado por soluciones sobre GPU. El acceso está restringido: requiere aceptar las condiciones de la licencia Gemma en HuggingFace antes de poder descargar los pesos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 2), convertido a ONNX para Ryzen AI |
| Parámetros totales | 2 000 millones (aproximado, según el nombre del modelo) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el Gemma 2 2B original soporta 8 192 tokens) |
| Tipos de cuantización | no disponible (el repositorio contiene pesos ONNX; la cuantización exacta no se especifica) |
| Idiomas soportados | inglés (`en` según los tags) |
| Licencia | Gemma (términos de uso de Google) |
| Formato de pesos | ONNX (runtime Ryzen AI, paquete `m_1.0.1_npu`) |

## Arquitectura y entrenamiento

El modelo subyacente es Gemma 2 2B, un transformer decoder-only de Google DeepMind con atención multi-cabeza estándar, normalización RMSNorm y las innovaciones propias de la familia Gemma 2 (interleaving de atención local y global, y logit soft-capping). AMD no aporta información sobre el entrenamiento original en esta ficha: los datos de preentrenamiento, el número de tokens y las fases de ajuste (SFT, RLHF o DPO) corresponden al modelo Gemma 2 publicado por Google y no se detallan aquí.

La contribución técnica de esta publicación es la conversión a ONNX y la integración con el runtime RAI 1.9.0 para la NPU de Ryzen AI. El identificador `m_1.0.1_npu` indica la versión del paquete de modelo y que está compilado para ejecución en la NPU. No se dispone de información sobre técnicas adicionales como decodificación especulativa, atención lineal o destilación aplicadas en esta conversión.

## Capacidades

- Generación de texto en inglés: completado, resumen, reescritura y respuesta a preguntas.
- Razonamiento básico y matemáticas de complejidad moderada, limitado por el tamaño de 2B.
- Generación de código en lenguajes habituales, con calidad inferior a modelos de mayor tamaño.
- Ejecución acelerada en NPU de Ryzen AI mediante el runtime RAI.
- No se documenta soporte de tool calling ni function calling en esta ficha.
- No se documenta soporte de agentes ni razonamiento multi-paso estructurado.
- Capacidades multilingües limitadas: el tag de idioma es únicamente `en`.
- No se documentan modos especiales como thinking mode, visión o audio.

## Casos de uso

- Asistente local en portátil con Ryzen AI: ejecutar el modelo en la NPU libera la GPU y la CPU para otras tareas, lo que permite un asistente de texto siempre disponible con bajo consumo energético.
- Autocompletado y redacción en aplicaciones de escritorio: integración vía ONNX Runtime con el proveedor de ejecución de Ryzen AI para sugerencias de texto en editores y clientes de correo.
- Clasificación y extracción de información en local: procesar correos, notas o documentos en inglés sin enviar datos a la nube, aprovechando la ventana de contexto del modelo original.
- Resumen de documentos cortos y actas: útil en flujos ofimáticos donde la privacidad impide usar APIs externas.
- Prototipado de pipelines de generación de texto sobre hardware de consumo: banco de pruebas para medir latencia y throughput en NPU antes de escalar a modelos mayores.
- Filtrado y moderación de contenido en inglés: clasificación de texto generado por otros sistemas con un modelo pequeño y de baja latencia en el dispositivo.
- Demostraciones de inferencia ONNX en NPU: validación de la cadena de herramientas RAI 1.9.0 y del paquete de modelo 1.0.1 en entornos de desarrollo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; el modelo está diseñado para ejecutarse en la NPU de Ryzen AI, no en GPU.
- GPU recomendadas: no aplica para el objetivo de esta conversión; en su defecto podría ejecutarse en CPU vía ONNX Runtime, sin aceleración NPU.
- Hardware objetivo: procesadores AMD Ryzen AI compatibles con el runtime RAI 1.9.0 y el paquete de modelo 1.0.1 para NPU.
- Cabe en hardware de consumo: sí, siempre que el equipo disponga de NPU Ryzen AI soportada; el repositorio ocupa 2,9 GB.
- Opciones de despliegue: ONNX Runtime con el execution provider de Ryzen AI; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI para esta conversión concreta.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / despliegue |
|---|---|---|---|---|
| amd/gemma-2-2b_rai_1.9.0_m_1.0.1_npu | 2B | no disponible (8 192 en el original) | Gemma | ONNX para NPU Ryzen AI |
| google/gemma-2-2b | 2B | 8 192 | Gemma | safetensors, GGUF (comunidad) |
| meta-llama/Llama-3.2-1B | 1B | 128 000 | Llama 3.2 | safetensors, GGUF |
| Qwen/Qwen2.5-1.5B | 1,5B | 32 768 | Apache 2.0 | safetensors, GGUF |

La comparación con Gemma 2 2B original es la más directa: misma arquitectura y pesos de base, pero distinto formato y objetivo de hardware. Frente a Llama 3.2 1B y Qwen2.5 1.5B, este modelo ofrece mayor número de parámetros pero un contexto documentado menor y licencia más restrictiva que Apache 2.0.

## Limitaciones y advertencias

- Acceso restringido: es necesario aceptar la licencia Gemma en HuggingFace para descargar los pesos.
- Idioma: solo se declara inglés; el rendimiento en castellano no está garantizado ni documentado.
- Tamaño de 2B: alta propensión a alucinaciones en tareas de conocimiento factual y razonamiento complejo.
- Sesgos: hereda los sesgos del corpus de entrenamiento de Gemma 2, no auditados en esta conversión.
- Licencia Gemma: impone restricciones de uso comercial y obligaciones de atribución; revisar los términos antes de desplegar en producción.
- Dependencia de hardware: requiere una NPU Ryzen AI compatible y el runtime RAI en la versión indicada; fuera de ese entorno, la conversión puede no ser funcional.
- Sin datos de benchmarks ni métricas de latencia publicadas: no es posible estimar rendimiento real sin medirlo en el hardware objetivo.
- Repositorio con 0 descargas y 0 likes: ecosistema de usuarios muy reducido, lo que limita el soporte comunitario y la validación independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/amd/gemma-2-2b_rai_1.9.0_m_1.0.1_npu
- Modelo base Gemma 2 2B: https://huggingface.co/google/gemma-2-2b
- Documentación de Ryzen AI: no disponible en la información proporcionada
- Paper de Gemma 2: no disponible en la información proporcionada
- Repositorio de código o demos: no disponible en la información proporcionada
