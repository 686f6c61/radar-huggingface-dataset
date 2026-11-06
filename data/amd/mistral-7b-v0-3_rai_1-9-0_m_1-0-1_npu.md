# amd/Mistral-7B-v0.3_rai_1.9.0_m_1.0.1_npu

## Resumen

El modelo `amd/Mistral-7B-v0.3_rai_1.9.0_m_1.0.1_npu` es una distribución optimizada de Mistral-7B-v0.3 publicada por AMD para su plataforma Ryzen AI. No se trata de un modelo entrenado desde cero, sino de una conversión del checkpoint original de Mistral AI a formato ONNX y compilado para ejecutarse sobre la NPU integrada en los procesadores AMD Ryzen AI (arquitectura XDNA/XDNA2), empaquetada con la versión 1.9.0 de RAI (Ryzen AI) y el perfil `m_1.0.1_npu`.

El modelo base Mistral-7B-v0.3 es un transformer decoder-only denso de 7.248 millones de parámetros, con una ventana de contexto de 32.768 tokens, licencia Apache 2.0 y entrenamiento predominantemente en inglés. Esta distribución de AMD preserva esas capacidades pero las orienta a inferencia local acelerada por hardware en equipos con NPU Ryzen AI, un escenario cada vez más relevante para despliegues de IA en el borde (edge) sin GPU dedicada.

La relevancia de esta ficha radica en que ejemplifica la tendencia de los fabricantes de silicio a publicar artefactos listos para su hardware específico: el repositorio es de acceso restringido (gated), tiene un tamaño de 4,4 GB y está etiquetado únicamente para inglés. Es un artefacto de despliegue, no un modelo de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Mistral-7B-v0.3), convertido a ONNX y compilado para NPU Ryzen AI |
| Parametros totales | 7.248 millones (modelo base Mistral-7B-v0.3) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (heredado de Mistral-7B-v0.3) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (el repo ocupa 4,4 GB, lo que sugiere cuantizacion respecto a los ~14,5 GB en fp16 del modelo original) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (perfil `m_1.0.1_npu` para Ryzen AI) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Mistral-7B-v0.3: un transformer decoder-only denso con 32 capas, atención con ventana deslizante (sliding window attention) y RoPE, sin mezcla de expertos. El modelo original fue entrenado por Mistral AI sobre datos predominantemente en inglés y ajustado con técnicas de alineación (SFT y DPO según la documentación pública de Mistral), aunque los detalles exactos de composición del dataset no se incluyen en la información de esta distribución.

La innovación de esta publicación no está en el entrenamiento sino en el pipeline de despliegue: AMD convierte los pesos a ONNX y los compila para la NPU XDNA de Ryzen AI mediante su toolchain RAI 1.9.0, con un perfil de ejecución `m_1.0.1_npu`. Esto permite ejecutar el modelo en la NPU en lugar de la CPU o iGPU, reduciendo el consumo energético y liberando la CPU para otras tareas. No se dispone de información sobre el proceso de cuantización exacto, el número de tokens de calibración ni si se aplicaron técnicas de decodificación especulativa en el artefacto.

## Capacidades

- Generación de texto autoregresiva en inglés, con capacidad de razonamiento general y redacción.
- Generación de código y respuesta a preguntas técnicas, heredadas del modelo base.
- Razonamiento matemático básico e intermedio (aritmética, problemas de varios pasos).
- Soporte de conversaciones multi-turno gracias a la ventana de 32.768 tokens.
- Ejecución acelerada por NPU Ryzen AI mediante el runtime RAI, con descarga de trabajo de la CPU.
- No se documenta en esta distribución soporte explícito de tool calling, function calling, agentes, visión ni audio; deben considerarse no disponibles salvo verificación empírica.
- Capacidad multilingüe limitada al inglés según la etiqueta del repositorio.

## Casos de uso

- Asistente de escritorio local en portátiles con Ryzen AI: el modelo se ejecuta en la NPU y permite redacción, resumen y Q&A sin conexión a la nube, con bajo consumo energético y sin GPU dedicada.
- Procesamiento de documentos largos en el borde: la ventana de 32.768 tokens permite resumir contratos, informes o transcripciones en un portátil, manteniendo los datos en el dispositivo.
- Generación de código en entornos de desarrollo con restricciones de privacidad: autocompletado y explicación de fragmentos en inglés dentro de IDEs, sin enviar código a servicios externos.
- Chatbot de atención al cliente on-premise para despliegues de bajo coste: conversaciones multi-turno con contexto largo sobre hardware de consumo, útil cuando no hay presupuesto de GPU.
- Prototipado de pipelines RAG en local: el modelo puede servir como generador en un sistema de recuperación sobre documentos internos, ejecutándose íntegramente en el portátil del desarrollador.
- Evaluación de hardware Ryzen AI: sirve como referencia para medir latencia y throughput de la NPU en cargas de generación de texto antes de decidir un despliegue mayor.
- Filtrado y clasificación de texto en el dispositivo: moderación de contenido o etiquetado de tickets en inglés, aprovechando la NPU para no saturar la CPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para esta distribución específica. El modelo base Mistral-7B-v0.3 cuenta con resultados públicos en la documentación de Mistral AI, pero no se incluyen en la información proporcionada y no deben atribuirse a este artefacto ONNX sin verificación, ya que la cuantización y la compilación para NPU pueden alterar la calidad.

## Requisitos de hardware

- Hardware objetivo: procesadores AMD Ryzen AI con NPU XDNA/XDNA2 y el runtime RAI 1.9.0 instalado.
- VRAM estimada: no aplica en el sentido tradicional; el modelo se ejecuta en la NPU. El repositorio ocupa 4,4 GB, por lo que se requiere al menos esa cantidad de memoria del sistema accesible al dispositivo.
- GPU dedicadas (A100, H100, RTX 4090): no es el objetivo de este artefacto; para GPU se recomienda usar el checkpoint original de Mistral-7B-v0.3 en safetensors.
- Cabe en hardware de consumo: sí, en equipos con NPU Ryzen AI compatibles; no está pensado para GPUs de consumo.
- Opciones de despliegue: runtime RAI de AMD y toolchain ONNX Runtime con el execution provider de Ryzen AI. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI para este artefacto concreto.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Orientacion |
|---|---|---|---|---|---|
| amd/Mistral-7B-v0.3_rai_1.9.0_m_1.0.1_npu | 7.248 M | 32.768 | ONNX (NPU) | Apache 2.0 | NPU Ryzen AI |
| mistralai/Mistral-7B-v0.3 | 7.248 M | 32.768 | safetensors | Apache 2.0 | GPU/CPU general |
| Meta Llama 3.1 8B | 8.030 M | 131.072 | safetensors, GGUF | Llama 3.1 Community | GPU/CPU general |
| Qwen2.5 7B | 7.620 M | 131.072 | safetensors, GGUF | Apache 2.0 | GPU/CPU general, multilingue |

La diferencia clave frente a las alternativas es el formato y el destino de ejecución: este artefacto está compilado para NPU Ryzen AI, mientras que los demás se distribuyen para GPU/CPU con runtimes estándar. En capacidades lingüísticas, Mistral-7B-v0.3 queda por debajo de Llama 3.1 8B y Qwen2.5 7B en contexto y multilingüismo, pero mantiene una licencia permisiva y un tamaño manejable.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en Hugging Face antes de descargarlo.
- Idiomas: solo inglés según la etiqueta del repositorio; no se garantiza un rendimiento aceptable en castellano.
- Riesgo de alucinación: inherente a los modelos de 7B; no se documenta ningún ajuste específico de mitigación en esta distribución.
- Sesgos: los hereda del modelo base Mistral-7B-v0.3, entrenado con datos predominantemente en inglés de internet.
- Dependencia de hardware: solo funciona con el runtime RAI 1.9.0 y NPUs Ryzen AI compatibles; no es portable a otros aceleradores sin reconversión.
- Calidad tras cuantización: el tamaño del repo (4,4 GB) sugiere una cuantización agresiva respecto a fp16; no se documenta la pérdida de calidad asociada.
- Soporte de tool calling y agentes: no documentado; no debe asumirse en producción sin pruebas.
- Uso comercial: la licencia Apache 2.0 lo permite, pero conviene verificar las condiciones de acceso gated y la licencia del modelo base.

## Enlaces

- Hugging Face: https://huggingface.co/amd/Mistral-7B-v0.3_rai_1.9.0_m_1.0.1_npu
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-v0.3
- Documentación de Ryzen AI (AMD): no disponible en la información proporcionada
- Paper o blog de Mistral-7B-v0.3: no disponible en la información proporcionada
- Repositorio de código o demo: no disponible en la información proporcionada
