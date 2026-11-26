# Jobaar/Inkling-2-Mini-NVFP4-GGUF

## Resumen

Inkling-2-Mini-NVFP4-GGUF es una conversión no oficial a formato GGUF del modelo Inkling-2-Mini de Thinking Machines Lab, publicada por el usuario Jobaar. Se trata de una cuantización que preserva los pesos nativos NVFP4 del modelo original y los reempaqueta en GGUF sin recuantizar, de modo que las tarjetas NVIDIA Blackwell (RTX 50, RTX PRO Blackwell, DGX Spark) puedan ejecutarlos sobre sus tensor cores FP4. El modelo base es un transformer de tipo MoE con 26.070.390.272 parámetros totales y capacidades multimodales (image-text-to-text).

La relevancia de esta ficha radica en que ofrece una vía práctica para desplegar un modelo de 26B parámetros en hardware de consumo Blackwell con un peso de solo 17,6 GB y un requisito de VRAM de aproximadamente 20 GB, incluyendo visión y contexto moderado. Al mantener los pesos NVFP4 originales en lugar de recuantizar a formatos genéricos, se busca conservar la fidelidad numérica del modelo de referencia y aprovechar la aceleración nativa FP4 del hardware.

La licencia es Apache 2.0, heredada del modelo original, y el repositorio tiene 627 descargas y 2 likes en el momento de la consulta. La conversión es responsabilidad de un tercero, no de Thinking Machines Lab, y requiere versiones específicas de llama.cpp (b12635 o superior) o Koboldcpp (1.125 o superior) para funcionar correctamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mixture of experts), multimodal image-text-to-text |
| Parametros totales | 26.070.390.272 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el ejemplo de ejecución usa `-c 8192`) |
| Tipos de cuantizacion | NVFP4 (expertos en capas 0-19), MXFP8 (expertos en capas 20-23) y Q8_0 (pesos grandes), F32 (tensores pequeños y controladores de bucle) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repositorio de 17,6 GB; archivo `Inkling-2-Mini-NVFP4.gguf`) |

## Arquitectura y entrenamiento

El modelo base Inkling-2-Mini es un transformer de tipo mixture of experts (MoE) con capacidades multimodales de imagen a texto, según indican las etiquetas del repositorio y el pipeline declarado. La conversión GGUF mantiene la estructura de expertos diferenciada por capas: los expertos de las capas 0 a 19 conservan sus pesos NVFP4 nativos, mientras que los expertos de las capas 20 a 23 se almacenan en MXFP8 y los pesos grandes restantes en Q8_0; los tensores pequeños y los controladores de bucle quedan en F32.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO, ya que la model card del repositorio de conversión remite a la model card del modelo original para esos detalles. La innovación técnica destacable de esta conversión es el reempaquetado directo de pesos NVFP4 a GGUF sin recuantización, lo que permite aprovechar los tensor cores FP4 de las GPU Blackwell. No se mencionan técnicas como decodificación especulativa o atención lineal en la información disponible.

## Capacidades

- Generación de texto y conversación multi-turno (etiqueta `conversational`).
- Procesamiento de imagen y texto combinados (pipeline `image-text-to-text`), con soporte de entrada de imágenes mediante el proyector `mmproj-Inkling-2-Mini-BF16.gguf` de ggml-org.
- Ejecución en llama.cpp y Koboldcpp con soporte de plantillas de chat (`--jinja`).
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`).
- Aceleración nativa FP4 en GPU NVIDIA Blackwell mediante los tensor cores.
- No se dispone de información sobre soporte de tool calling, function calling, agentes, razonamiento multi-paso, modo thinking, audio u otras capacidades especiales.

## Casos de uso

- Asistente conversacional multimodal en local: el modelo puede gestionar diálogos multi-turno con entrada de imágenes, adecuado para prototipos y entornos de escritorio con GPU Blackwell y unos 20 GB de VRAM.
- Análisis de documentos e imágenes en estación de trabajo: con el proyector mmproj se pueden enviar capturas, diagramas o fotos junto a preguntas de texto, usando llama-server con `-ngl all` y contexto de 8192 tokens.
- Despliegue en DGX Spark y RTX PRO Blackwell: el formato NVFP4 permite ejecutar un modelo de 26B parámetros en hardware compacto de sobremesa o edge con aceleración FP4 nativa.
- Integración en Koboldcpp para escritura asistida: la conversión funciona con Koboldcpp 1.125 o superior, lo que facilita su uso en interfaces de escritura y chat locales.
- Evaluación de cuantizaciones NVFP4 frente a otros formatos: útil para investigadores que comparan fidelidad y rendimiento de pesos NVFP4 reempaquetados frente a recuantizaciones GGUF convencionales.
- Servidor de inferencia ligero con llama.cpp: mediante `llama-server` se puede exponer una API compatible con endpoints para pruebas de integración en pipelines internos.
- Prototipado de aplicaciones image-text-to-text sin depender de la nube: al caber en una GPU de consumo Blackwell, permite iterar en local con datos sensibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 20 GB con visión y contexto modesto; más para contextos largos.
- GPU recomendadas: NVIDIA Blackwell, es decir, RTX 50 series, RTX PRO Blackwell y DGX Spark, para obtener la aceleración FP4 nativa.
- Las tarjetas anteriores a Blackwell pueden cargar el archivo, pero no obtienen la aceleración FP4.
- Cabe en GPU de consumo Blackwell (RTX 50 series) con 20 GB o más de VRAM.
- Software: llama.cpp b12635 o superior (las compilaciones anteriores al PR #32704, del 21 de noviembre de 2026, cargan el archivo pero generan salida incorrecta); Koboldcpp 1.125 o superior; CUDA 12.8 o superior si se compila desde fuente.
- Proyector de visión: `mmproj-Inkling-2-Mini-BF16.gguf` de ggml-org, descargable con `hf download`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la información proporcionada. La comparación relevante sería con el modelo base `thinkingmachines/Inkling-2-Mini` en sus pesos originales, del que esta conversión es una cuantización, pero no se han facilitado datos de rendimiento de ninguno de los dos.

## Limitaciones y advertencias

- Conversión no oficial: no está publicada por Thinking Machines Lab, sino por el usuario Jobaar, por lo que no cuenta con el respaldo del autor original.
- Requiere versiones muy concretas de software: llama.cpp b12635 o superior y Koboldcpp 1.125 o superior; versiones anteriores producen salida incorrecta.
- La aceleración FP4 solo está disponible en GPU NVIDIA Blackwell; en tarjetas anteriores el archivo se carga pero sin la ventaja de rendimiento.
- El requisito de VRAM de unos 20 GB crece con contextos largos y con el uso de visión.
- No se dispone de información sobre sesgos, riesgo de alucinación, idiomas soportados ni limitaciones específicas de contexto; se remite a la model card del modelo original.
- Licencia Apache 2.0 permite uso comercial, pero se debe respetar la política de uso aceptable de Thinking Machines Lab enlazada en la model card.
- Al ser una cuantización, puede haber diferencias de fidelidad respecto a los pesos originales, aunque el autor afirma que no se recuantiza.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Jobaar/Inkling-2-Mini-NVFP4-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Proyector de visión: https://huggingface.co/ggml-org/Inkling-2-Mini-GGUF
- Pull request de llama.cpp #32704: https://github.com/ggml-org/llama.cpp/pull/32704
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Política de uso aceptable: https://thinkingmachines.ai/model-acceptable-use-policy/
