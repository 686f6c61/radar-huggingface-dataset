# PorcupinePanda/DZ.DARWIN

## Resumen

DZ.DARWIN es una conversión a ONNX del modelo Qwen3-1.7B de Alibaba Qwen, publicada por el usuario PorcupinePanda bajo el paraguas del proyecto "DutyZero". No se trata de un modelo entrenado desde cero, sino de una redistribución empaquetada específicamente para su ejecución en el navegador mediante transformers.js y WebGPU. El repositorio contiene únicamente los pesos en formato ONNX con cuantización q4f16 (4 bits con precisión mixta en fp16), lo que reduce el tamaño del artefacto a aproximadamente 1,4 GB.

La relevancia de esta ficha es acotada: el modelo hereda las capacidades del Qwen3-1.7B original (generación de texto, razonamiento ligero, soporte multilingüe y modo "thinking"), pero su valor diferencial está en el pipeline de despliegue, no en el rendimiento. Está pensado para aplicaciones web que necesitan inferencia local en el dispositivo del visitante sin backend, como demos interactivas o asistentes embebidos en una página.

El modelo tiene 14 descargas y 0 likes en el momento de la consulta, y no incluye documentación propia sobre idiomas, benchmarks ni detalles de entrenamiento más allá de la referencia al modelo base. La licencia Apache 2.0 se mantiene desde el original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), exportado a ONNX |
| Parametros totales | 1,7 mil millones (heredados de Qwen3-1.7B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen3-1.7B soporta 32 768 tokens, dato no confirmado en este repo) |
| Tipos de cuantizacion | q4f16 (4 bits, precision mixta fp16) en ONNX |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`onnx/model_q4f16.onnx`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-1.7B: un transformer decoder-only con atención causal estándar, entrenado por el equipo Qwen de Alibaba. Este repositorio no aporta información sobre el corpus de entrenamiento, el número de tokens, ni si hubo fases de RLHF o DPO; toda esa información corresponde al modelo base y no se reproduce aquí. Lo único documentado por el autor es el proceso de conversión: se parte de la exportación ONNX de la comunidad (`onnx-community/Qwen3-1.7B-ONNX`, commit `3231b522...`) y se seleccionan los pesos `model_q4f16.onnx` para su uso con transformers.js.

La innovación técnica relevante no está en el modelo sino en el empaquetado: la cuantización q4f16 permite que un modelo de 1,7 B de parámetros quepa en memoria de GPU integrada o discreta de gama media y se ejecute vía WebGPU dentro del navegador. No se documentan técnicas adicionales como decodificación especulativa, atención lineal ni modos híbridos SSM.

## Capacidades

- Generación de texto conversacional multi-turno, heredada de Qwen3-1.7B.
- Razonamiento ligero y resolución de problemas de complejidad baja-media.
- Generación de código y respuesta a preguntas técnicas, dentro de los límites de un modelo de 1,7 B.
- Capacidades multilingües del modelo base (el repo no especifica la lista concreta de idiomas).
- Ejecución 100 % en el cliente mediante transformers.js y WebGPU, sin llamadas a servidor.
- Integración con la demo DZai.Beta alojada en Hugging Face Spaces.
- Soporte de tool calling y modo "thinking": no confirmado en la información de este repositorio; debe verificarse contra la documentación de Qwen3-1.7B.

## Casos de uso

- Asistentes embebidos en páginas web: el modelo se carga en el navegador del visitante y responde sin backend, lo que elimina costes de servidor y latencia de red. Adecuado para chatbots de soporte en sitios de bajo tráfico.
- Demos interactivas de producto: prototipos de interfaces conversacionales que necesitan funcionar offline o en entornos con conectividad limitada, aprovechando la caché del navegador para los 1,4 GB de pesos.
- Procesamiento de texto sensible en el cliente: resumen o reescritura de documentos que no deben salir del dispositivo del usuario, gracias a la inferencia local.
- Educación y experimentación: entorno de bajo coste para que estudiantes prueben inferencia LLM en WebGPU sin aprovisionar GPU en la nube.
- Generación de texto auxiliar en aplicaciones de escritorio con Electron o Tauri: el mismo artefacto ONNX puede reutilizarse fuera del navegador con runners compatibles.
- Pruebas de concepto de agentes locales: combinación con APIs del navegador (Web Speech, IndexedDB) para construir asistentes personales que no dependen de servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de MMLU, HumanEval, GSM8K ni latencias medidas, y la cuantización q4f16 introduce degradación respecto al Qwen3-1.7B original que tampoco se cuantifica en la model card.

## Requisitos de hardware

- VRAM estimada: alrededor de 1,5-2 GB para el artefacto q4f16, más overhead del runtime WebGPU y del contexto.
- GPU recomendadas: cualquier GPU con soporte WebGPU estable (Chrome/Edge recientes). En el ecosistema NVIDIA, RTX 3060 en adelante; en AMD, RDNA 2 o superior; en Apple, chips M1 o posteriores con Metal.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas integradas y dedicadas modernas; en equipos muy antiguos sin WebGPU el modelo no arrancará.
- Opciones de despliegue: transformers.js con WebGPU (camino principal), ONNX Runtime Web, y runners ONNX genéricos (onnxruntime-node, onnxruntime-genai) para uso fuera del navegador.
- Latencia y throughput: no disponibles en la información proporcionada. Dependen fuertemente del hardware del cliente y del tamaño de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| PorcupinePanda/DZ.DARWIN | 1,7 B | no disponible | ONNX q4f16 | Apache 2.0 | Inferencia en navegador vía WebGPU |
| Qwen/Qwen3-1.7B | 1,7 B | 32 768 (según modelo base) | safetensors | Apache 2.0 | Modelo original, uso general en servidor |
| onnx-community/Qwen3-1.7B-ONNX | 1,7 B | 32 768 (según modelo base) | ONNX (varias cuantizaciones) | Apache 2.0 | Exportación ONNX de referencia |
| Gemma 3 1B (Google) | ~1 B | 32 768 | safetensors, GGUF | Gemma license | Alternativa ligera de otro proveedor |

DZ.DARWIN se distingue de las alternativas por ser un subconjunto curado (solo q4f16) orientado a un caso de uso muy concreto: la demo web. Frente al repo de onnx-community, ofrece menos variantes de cuantización pero un artefacto más pequeño y directo de consumir con transformers.js.

## Limitaciones y advertencias

- Modelo de 1,7 B: capacidad de razonamiento y conocimiento factual limitada; propenso a errores en tareas que requieran conocimiento profundo o cadenas largas de razonamiento.
- Riesgo de alucinación inherente a los LLM de este tamaño, especialmente en preguntas factuales y generación de código complejo.
- La cuantización q4f16 degrada la calidad respecto al Qwen3-1.7B en fp16; no se han publicado evaluaciones de esa pérdida.
- No se documentan sesgos específicos ni la composición del dataset de entrenamiento en este repositorio; deben consultarse en la model card de Qwen3-1.7B.
- Idiomas soportados no especificados: no se puede garantizar un rendimiento aceptable fuera del inglés y el chino sin verificación previa.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; es una conversión de la comunidad, no un artefacto oficial de Qwen.
- Dependencia de WebGPU: navegadores sin soporte estable (Firefox en algunas plataformas, Safari con limitaciones) no podrán ejecutar el modelo.
- Repositorio con muy poca tracción (14 descargas, 0 likes) y sin mantenimiento documentado; riesgo de quedarse obsoleto frente a actualizaciones de transformers.js u ONNX Runtime.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/PorcupinePanda/DZ.DARWIN
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Conversión ONNX de referencia: https://huggingface.co/onnx-community/Qwen3-1.7B-ONNX/tree/3231b522c6e703b2f9b3cd8ea27426a1289a02f2
- Demo DZai.Beta: https://huggingface.co/spaces/PorcupinePanda/DZai.Beta
