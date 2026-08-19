# FreedomAISVR/Gemma-4-E4B-it-QAT-MXFP4-GGUF

## Resumen

El modelo **FreedomAISVR/Gemma-4-E4B-it-QAT-MXFP4-GGUF** es una cuantización híbrida en formato GGUF del modelo oficial de Google **Gemma 4 E4B Instruct QAT** (Quantization-Aware Training). El autor, FreedomAISVR, ha aplicado una estrategia novedosa: conserva todos los tensores de pesos en Q4_0 tal y como los entrenó Google con QAT, y cuantiza únicamente los tensores de norma y sesgo (F32) a MXFP4. De esta forma se evita la doble cuantización que degradaría la calidad, especialmente en la parte de visión.

El modelo base es `google/gemma-4-E4B-it-qat-q4_0-unquantized`, que pertenece a la familia Gemma 4 de Google DeepMind, un modelo multimodal que acepta texto e imagen y genera texto. Esta versión cuantizada está pensada para ejecutarse en dispositivos locales y GPUs de consumo, manteniendo un equilibrio entre tamaño y fidelidad. El repositorio incluye dos archivos: el GGUF principal con los pesos y el proyector de visión (`mmproj`) también cuantizado con QAT.

La relevancia de esta ficha radica en que demuestra una técnica de cuantización híbrida que preserva las ventajas del QAT original, algo poco común en el ecosistema GGUF. Es útil para desarrolladores que quieran desplegar Gemma 4 en entornos con recursos limitados sin sacrificar la calidad multimodal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de la familia Gemma 4, detalles no proporcionados) |
| Parametros totales | 7.463.013.674 (según safetensors del modelo base) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_0 (pesos) + MXFP4 (normas y sesgos) |
| Idiomas soportados | en, multilingual |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con archivo mmproj separado para visión) |

## Arquitectura y entrenamiento

La información disponible se centra en la técnica de cuantización, no en la arquitectura interna del modelo original. El modelo base es una versión QAT de Gemma 4 E4B Instruct, entrenada por Google con simulación de cuantización durante el entrenamiento para minimizar la pérdida de calidad al comprimir los pesos. El autor de esta variante ha utilizado `llama-quantize` con la opción `--allow-requantize` y un archivo de tipos de tensor para mantener los pesos Q4_0 intactos y cuantizar solo los tensores F32 (normas de capa, RMS norms, etc.) a MXFP4. Esta estrategia evita la doble cuantización que ocurriría al pasar de Q4_0 a F32 y luego a MXFP4, lo que degradaría especialmente los tokens de visión que fluyen por las mismas capas de atención y FFN.

No se proporcionan detalles sobre el dataset de entrenamiento, el número de tokens, ni si se aplicaron técnicas como RLHF o DPO. El modelo base es el oficial de Google, por lo que se asume que mantiene las características de entrenamiento de Gemma 4, pero no se especifican aquí.

## Capacidades

- **Multimodal**: acepta entrada de texto e imagen, y genera texto (según la model card y los tags `vision` y `multimodal`).
- **Razonamiento**: el chat template nativo de Gemma 4 tiene el modo "thinking" habilitado por defecto, lo que permite respuestas con razonamiento paso a paso.
- **Generación de texto**: capacidad estándar de un LLM instructivo para conversación, redacción, resumen, etc.
- **Multilingüe**: soporta inglés y otros idiomas (etiqueta `multilingual`), aunque no se especifica la lista completa.
- **Contexto largo**: la model card menciona "long context", pero no se indica la longitud exacta.
- **Soporte de system prompts**: puede utilizar instrucciones de sistema para guiar el comportamiento.

No se mencionan capacidades de tool calling, function calling, agentes o audio en la información disponible.

## Casos de uso

- **Despliegue en dispositivos edge**: al ser un GGUF con pesos Q4_0 y normas MXFP4, el modelo ocupa aproximadamente 10,3 GB, lo que permite ejecutarlo en hardware modesto como una GPU de consumo con 12 GB de VRAM o incluso en CPU con suficiente RAM. Es adecuado para aplicaciones de asistente local sin conexión.
- **Aplicaciones de visión por computadora en local**: gracias al proyector de visión QAT, puede procesar imágenes y responder preguntas sobre ellas, útil para sistemas de asistencia visual, análisis de documentos escaneados o descripción automática de fotografías en entornos con privacidad de datos.
- **Chatbots con razonamiento**: el modo "thinking" activado por defecto permite respuestas más elaboradas y justificadas, útil para tutorías, soporte técnico o generación de explicaciones detalladas.
- **Prototipado rápido con llama.cpp**: al ser un archivo GGUF, se integra fácilmente con `llama-server` o `llama-cli`, permitiendo a desarrolladores probar el modelo sin necesidad de infraestructura compleja.
- **Investigación en cuantización**: la técnica híbrida Q4_0 + MXFP4 puede servir como caso de estudio para otros desarrolladores que quieran preservar la calidad de modelos QAT al convertirlos a GGUF.
- **Procesamiento de documentos mixtos**: dado que soporta texto e imagen, puede extraer información de PDFs, capturas de pantalla o formularios, combinando OCR con razonamiento textual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se proporcionan puntuaciones de MMLU, HumanEval, GSM8K ni comparativas con otros modelos.

## Requisitos de hardware

- **VRAM estimada**: el archivo GGUF principal pesa alrededor de 10,3 GB (según el tamaño del repositorio). Para cargar el modelo completo en GPU se necesitarían al menos 12 GB de VRAM, aunque podría usarse con offloading parcial a CPU.
- **GPU recomendadas**: no se especifican modelos concretos. Dado el tamaño, una RTX 3060 12 GB, RTX 4070 o superior sería suficiente. Para ejecución en CPU, se necesitarían al menos 16 GB de RAM.
- **Opciones de despliegue**: el formato GGUF es compatible con llama.cpp, llama-server, Ollama, LM Studio y otros motores que soporten GGUF. También es posible usar vLLM si se convierte a otro formato, pero no se indica.
- **Latencia y throughput**: no se proporcionan datos. Dependerá del hardware y de la configuración de offloading.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos. Aunque existen otras versiones de Gemma 4 (por ejemplo, la versión bfloat16 o la QAT estándar), no se han incluido datos de rendimiento ni especificaciones en la información proporcionada, por lo que no es posible realizar una comparativa objetiva.

## Limitaciones y advertencias

- **Sesgos y alucinaciones**: como cualquier modelo de lenguaje, puede generar contenido incorrecto o sesgado. No se han publicado evaluaciones específicas de sesgo para esta variante.
- **Riesgo de alucinación**: especialmente en tareas de razonamiento o generación de código, el modelo puede producir respuestas plausibles pero incorrectas. Se recomienda validar las salidas en aplicaciones críticas.
- **Limitaciones de contexto**: no se conoce la longitud máxima de contexto soportada, por lo que no se puede garantizar un rendimiento óptimo en conversaciones muy largas.
- **Idiomas**: aunque se etiqueta como multilingüe, no se especifica la cobertura exacta; el rendimiento puede variar según el idioma.
- **Restricciones de licencia**: la licencia Apache 2.0 permite uso comercial, pero se debe mantener la atribución y los avisos de copyright. No hay restricciones conocidas adicionales.
- **Caveat de producción**: al ser una cuantización híbrida no oficial, es recomendable validar el comportamiento en el caso de uso concreto antes de desplegarlo en producción, especialmente en tareas de visión donde la calidad puede verse afectada por la cuantización de los tensores de norma.

## Enlaces

- [HuggingFace - FreedomAISVR/Gemma-4-E4B-it-QAT-MXFP4-GGUF](https://huggingface.co/FreedomAISVR/Gemma-4-E4B-it-QAT-MXFP4-GGUF)
- [Modelo base - google/gemma-4-E4B-it-qat-q4_0-unquantized](https://huggingface.co/google/gemma-4-E4B-it-qat-q4_0-unquantized)
- [Blog de Google sobre QAT para Gemma 4](https://blog.google/innovation-and-ai/technology/developers-tools/quantization-aware-training-gemma-4/)
- [Página oficial de Gemma 4 en DeepMind](https://deepmind.google/models/gemma/gemma-4/)
