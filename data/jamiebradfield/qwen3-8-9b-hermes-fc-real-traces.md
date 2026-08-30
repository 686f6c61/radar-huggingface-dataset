# JamieBradfield/qwen3.8-9b-hermes-fc-real-traces

## Resumen

El modelo **JamieBradfield/qwen3.8-9b-hermes-fc-real-traces** es un fine-tune mediante QLoRA del modelo base **Empero/Qwen3.8-9B**, una destilación de arquitectura híbrida de la serie Qwen3.5 con 9 mil millones de parámetros densos y una ventana de contexto de 262.144 tokens. El autor, JamieBradfield, lo ha entrenado específicamente para mejorar el comportamiento de *function calling* y uso de herramientas en modelos de la clase 9B, utilizando datos reales de sesiones de agente Hermes en lugar de datos sintéticos.

El modelo se presenta como un artefacto de investigación, no como un producto listo para producción. La evaluación independiente no está completa, y el propio autor advierte que no debe tratarse como un modelo validado o referenciado para ningún comportamiento concreto. Aun así, su propuesta es interesante: entrenar con trayectorias reales de agentes (con resultados de ejecución de herramientas) para que el modelo aprenda a encadenar llamadas a herramientas de forma más natural y robusta.

La relevancia actual radica en la creciente demanda de modelos pequeños y eficientes capaces de integrarse en pipelines de agentes y automatización. Al estar basado en Qwen3.8 (Apache-2.0) y publicar todos los scripts de entrenamiento, este modelo ofrece una base reproducible para experimentar con *tool-use* en un rango de 9B, un tamaño que cabe en GPUs de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (destilación Qwen3.5, 9B denso) |
| Parametros totales | 9.195.119.616 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | BF16 (pesos publicados), GGUF Q4_0_ROCMFP4_FAST (formato ROCmFPX para AMD) |
| Idiomas soportados | Inglés (único idioma declarado) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (BF16, 12 shards, 18.4 GB) y GGUF (cuantizado) |

## Arquitectura y entrenamiento

El modelo base, **Empero/Qwen3.8-9B**, es una destilación de la arquitectura híbrida de Qwen3.5 (la serie Qwen3.8 en GitHub), con 9B parámetros densos y contexto de 262.144 tokens. Sobre este base, el autor aplicó un fine-tune con **QLoRA de 4 bits** con rango 16, alpha 16, dropout 0, y targets en las proyecciones q/k/v/o/gate/up/down. Se congelaron los embeddings y se añadieron dos tokens especiales (`<|tool_call|>` y `<|tool_response|>`), ampliando el vocabulario de 248.077 a 248.079.

El entrenamiento se realizó sobre **979 conversaciones en formato ShareGPT**, de las cuales 933 son trayectorias reales de agentes Hermes (sesiones multi-turno con resultados de ejecución de herramientas, promedio de 12 turnos, máximo 35) y 46 son filas de relleno para cubrir secuencias de herramientas dispersas. Se usó un lote efectivo de 8, secuencia máxima de 4096, warmup de 0.1 y 2 épocas (246 pasos planificados). El entrenamiento se detuvo al 86% (paso 213), publicándose el checkpoint-200 con pérdida 0.131. Los parámetros entrenables representan el 0.32% del total.

Una innovación destacable es el uso de **trayectorias reales** en lugar de datos sintéticos, lo que puede mejorar la generalización del *tool-calling* en escenarios reales. Además, se publican todos los scripts de construcción del dataset, entrenamiento, fusión de pesos y evaluación, lo que facilita la reproducibilidad.

## Capacidades

- **Function calling y tool use**: entrenado específicamente para generar llamadas a herramientas y procesar respuestas de herramientas, con tokens dedicados `<|tool_call|>` y `<|tool_response|>`.
- **Razonamiento multi-turno**: las trayectorias de entrenamiento incluyen sesiones de hasta 35 turnos, lo que debería favorecer el encadenamiento de llamadas a herramientas en conversaciones largas.
- **Generación de texto**: al ser un fine-tune de Qwen3.8, conserva las capacidades generales de generación de texto del modelo base (aunque no se documentan explícitamente).
- **Contexto largo**: hereda la ventana de 262.144 tokens del base, útil para tareas que requieren mucho contexto.
- **Multilingüismo**: solo se declara inglés; no hay evidencia de soporte para otros idiomas.
- **Capacidades especiales**: no se documentan modos de pensamiento, visión ni audio. El modelo es puramente textual.

## Casos de uso

- **Experimentación académica en tool-calling**: investigadores pueden usar este modelo para estudiar cómo un fine-tune con trayectorias reales afecta al comportamiento de *function calling* en modelos de 9B, comparándolo con fine-tunes con datos sintéticos.
- **Prototipado de agentes conversacionales**: dado su tamaño (9B) y su enfoque en herramientas, es adecuado para prototipar asistentes que necesiten consultar APIs, bases de datos o ejecutar acciones, en entornos de desarrollo con una sola GPU.
- **Evaluación de pipelines de agentes**: los scripts de evaluación publicados (workloads A–E) permiten medir la capacidad del modelo para completar tareas multi-paso con herramientas, sirviendo como banco de pruebas para otros modelos.
- **Fine-tuning posterior**: al ser un checkpoint intermedio (86% del entrenamiento), puede servir como punto de partida para experimentos de *continued training* o *merging* con otros LoRAs.
- **Generación de datos sintéticos para entrenamiento**: el modelo podría usarse para generar trayectorias de tool-call que luego sirvan para entrenar modelos más pequeños, aunque su validación no está completa.
- **Pruebas de cuantización en hardware AMD**: la versión GGUF en formato ROCmFPX permite probar inferencia eficiente en GPUs AMD RDNA3, algo poco común y de interés para la comunidad ROCm.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que la evaluación independiente no está completa y que no debe tratarse el modelo como validado para ningún comportamiento específico. No hay datos de MMLU, HumanEval, GSM8K ni otras pruebas estándar.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con los pesos BF16 (18.4 GB), se necesitan al menos 20 GB de VRAM para cargar el modelo en precisión completa. Con la cuantización GGUF Q4_0 (aproximadamente 5-6 GB), cabría en GPUs de 8 GB, aunque el formato ROCmFPX está orientado a AMD.
- **GPU recomendadas**: el autor entrenó con una AMD RX 7700 XT (16 GB VRAM) usando ROCm. Para inferencia BF16, se recomienda una GPU con 24 GB (RTX 3090/4090, A10, etc.) o dos GPUs de 12 GB. Para la versión cuantizada, una GPU de 8-12 GB es suficiente.
- **Compatibilidad con GPUs de consumo**: sí, la versión cuantizada puede ejecutarse en GPUs de consumo como RTX 3060 12GB, RTX 4060 Ti 16GB o RX 7700 XT.
- **Opciones de despliegue**: no se documentan opciones específicas, pero al ser un modelo transformers estándar, puede usarse con vLLM, llama.cpp, Ollama o TGI. El autor menciona el fork `llama-rocmfpx` para conversión y cuantización.
- **Latencia y throughput**: no se proporcionan datos. Como referencia orientativa, un modelo 9B en BF16 en una GPU de 24 GB suele generar entre 20 y 40 tokens por segundo; la versión cuantizada puede ser más rápida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| **qwen3.8-9b-hermes-fc-real-traces** (este) | 9.2B | 262.144 | Fine-tune QLoRA con trayectorias reales | Apache-2.0 | HuggingFace |
| **qwen3.8-9b-hermes-function-calling-v1** (mismo autor) | no disponible | no disponible | Fine-tune para function calling (versión anterior) | no disponible | HuggingFace |
| **qwen3.8-9b-hermes-function-calling-v2** (mismo autor) | no disponible | no disponible | Fine-tune para function calling (versión intermedia) | no disponible | HuggingFace |
| **Empero/Qwen3.8-9B** (base) | 9.2B | 262.144 | Modelo base destilado de Qwen3.5 | Apache-2.0 | HuggingFace |

No se dispone de datos de rendimiento comparativo entre estos modelos. La comparativa se limita a características declaradas.

## Limitaciones y advertencias

- **Evaluación incompleta**: el autor no ha validado el modelo con benchmarks independientes; no hay garantía de que el *function calling* funcione correctamente en escenarios reales.
- **Datos de entrenamiento no publicados**: el dataset no se publica (contiene cadenas privadas como hostnames e identificadores de sesión), lo que limita la reproducibilidad completa del fine-tune.
- **Entrenamiento interrumpido**: el checkpoint publicado corresponde al paso 200 de 246 (86% del entrenamiento), por lo que el modelo no ha convergido completamente.
- **Riesgo de alucinación**: al ser un modelo de 9B sin validación, puede generar llamadas a herramientas incorrectas o inventar respuestas de herramientas.
- **Soporte de idiomas limitado**: solo se declara inglés; el uso en otros idiomas puede degradar el rendimiento.
- **Formato de cuantización específico**: la versión GGUF usa el formato ROCmFPX, que solo es compatible con kernels AMD RDNA3; para otros entornos hay que convertir desde los pesos BF16.
- **Uso comercial**: la licencia Apache-2.0 permite uso comercial, pero al ser un artefacto de investigación sin validación, no se recomienda su uso en producción sin una evaluación exhaustiva previa.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/JamieBradfield/qwen3.8-9b-hermes-fc-real-traces)
- [Modelo base Empero/Qwen3.8-9B](https://huggingface.co/Empero/Qwen3.8-9B)
- [Versión v1 del mismo autor](https://huggingface.co/JamieBradfield/qwen3.8-9b-hermes-function-calling-v1)
- [Versión v2 del mismo autor](https://huggingface.co/JamieBradfield/qwen3.8-9b-hermes-function-calling-v2)
- [Repositorio oficial de Qwen3.8 en GitHub](https://github.com/QwenLM/Qwen3.8)
- [Página de Qwen3.8 en OpenLM.ai](https://openlm.ai/qwen3.8/)
- [Ficha en LLM Explorer](https://llm-explorer.com/model/JamieBradfield%2Fqwen3.8-9b-hermes-function-calling-v1,6SuH8bRjECvBVYmLBTrCbl)
