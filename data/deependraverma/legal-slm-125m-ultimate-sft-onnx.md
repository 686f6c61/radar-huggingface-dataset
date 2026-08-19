# DeependraVerma/legal-slm-125m-ultimate-sft-onnx

## Resumen

El modelo `legal-slm-125m-ultimate-sft-onnx` es una conversión a ONNX del modelo `legal-slm-125m-ultimate-sft`, un pequeño modelo de lenguaje (SLM) de 125,8 millones de parámetros especializado en dominios legal y financiero. Fue desarrollado por DeependraVerma, investigador de IA generativa, y está diseñado para ejecutarse íntegramente en el navegador mediante la librería transformers.js, sin necesidad de servidor ni API. Su propósito principal es la redacción de cláusulas y documentos contractuales (NDAs, MSAs, cláusulas de terminación e indemnización), aunque no está pensado para razonamiento jurídico complejo.

El modelo se distribuye en dos formatos: uno en precisión fp32 (504 MB) y otro cuantizado a int8 dinámico (126 MB), siendo este último el que carga la demo web. Su arquitectura es tipo Llama (transformer decoder) y su licencia es MIT. La ventana de contexto no se especifica en la documentación disponible, pero se recomienda un `max_new_tokens` de 600 a 1200 para generar contratos completos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (estilo Llama) |
| Parametros totales | 125,8 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | fp32 (model.onnx) e int8 dinámico (model_quantized.onnx) |
| Idiomas soportados | Inglés |
| Licencia | MIT |
| Formato de pesos | ONNX (también safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base `legal-slm-125m-ultimate-sft` fue preentrenado desde cero sobre un corpus de textos legales y financieros de EE. UU., aunque la documentación no especifica el número exacto de tokens para esta versión concreta. Posteriormente se sometió a un ajuste fino supervisado (SFT) con pares de preguntas y respuestas curados en el dominio legal. La conversión a ONNX se realizó con `optimum.onnxruntime` y se verificó mediante una generación de prueba en CPU antes de su publicación. No se mencionan técnicas avanzadas como RLHF, DPO ni decodificación especulativa.

El formato de conversación es personalizado, sin `chat_template` estándar: se construye el prompt como `<|bos|><|system|>{system}<|user|>{question}<|assistant|>` y se detiene en `<|eos|>`.

## Capacidades

- Redacción de cláusulas contractuales y documentos legales completos: NDAs, MSAs, cláusulas de terminación, indemnización, etc.
- Generación de texto en lenguaje natural en el ámbito legal y financiero.
- Ejecución totalmente en el navegador mediante transformers.js, sin envío de datos a servidores externos.
- Soporte de instrucciones mediante un formato de chat personalizado (system/user/assistant).
- Cuantización int8 dinámica que reduce el tamaño del modelo a 126 MB, permitiendo su carga en dispositivos con recursos limitados.
- No dispone de tool calling, function calling, capacidades multimodales ni modo de razonamiento explícito.

## Casos de uso

- Redacción de contratos tipo: el modelo puede generar borradores de NDAs, MSAs o acuerdos de servicios a partir de una breve descripción de las partes y el alcance. Es adecuado para abogados que necesitan un punto de partida rápido.
- Generación de cláusulas específicas: dado un contexto (por ejemplo, "cláusula de confidencialidad"), el modelo produce un texto legal coherente que luego puede ser revisado y adaptado.
- Asistencia en due diligence: para esbozar secciones de informes legales o financieros, aunque su limitada capacidad de razonamiento exige supervisión humana.
- Educación legal: como herramienta de práctica para estudiantes de derecho que deseen ver ejemplos de redacción contractual.
- Prototipado de aplicaciones web: al ejecutarse en el navegador, es útil para demos o herramientas internas que requieran generación de texto legal sin infraestructura de servidor.
- Automatización de documentación interna: para generar borradores de políticas o avisos legales en empresas, siempre con revisión posterior.

## Benchmarks y rendimiento

Los resultados publicados en la model card (evaluación 0-shot con lm-evaluation-harness) son:

| Benchmark | Resultado |
|---|---|
| HellaSwag | 0,3209 |
| ARC-Easy | 0,5025 |
| PIQA | 0,6333 |

Estos valores indican un rendimiento modesto en tareas de sentido común y razonamiento general. En benchmarks de razonamiento legal (CaseHOLD, MMLU-legal, LegalBench) el modelo se sitúa cerca del azar o de la clase mayoritaria, por lo que no debe emplearse como motor de razonamiento jurídico. No se dispone de comparaciones con otros modelos en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: para la versión fp32 (~504 MB de pesos) se requieren aproximadamente 1 GB de memoria; para la versión int8 (~126 MB) bastan unos 256 MB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM (por ejemplo, NVIDIA GTX 1050 Ti o superior). También funciona en CPU, ya que la verificación se realizó con el execution provider de CPU.
- Se puede ejecutar en navegadores modernos mediante WebGPU o WebAssembly, gracias a transformers.js.
- Opciones de despliegue: transformers.js (navegador), ONNX Runtime (CPU/GPU), y potencialmente conversión a GGUF para llama.cpp u Ollama, aunque no se proporciona oficialmente.
- Latencia y throughput: no se especifican, pero al ser un modelo pequeño, la generación en CPU es viable para tareas interactivas.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos en la información proporcionada. Alternativas de tamaño similar como TinyLlama (1,1B) o Phi-2 (2,7B) tienen más parámetros y mejor rendimiento general, pero no están especializadas en el dominio legal ni ofrecen una versión ONNX lista para navegador con licencia MIT. La comparación directa no es posible sin ejecutar los mismos benchmarks.

## Limitaciones y advertencias

- Rendimiento deficiente en razonamiento legal: los benchmarks específicos (CaseHOLD, MMLU-legal, LegalBench) están cerca del azar, por lo que no es fiable para análisis jurídico o respuestas a preguntas complejas.
- Riesgo de alucinación: como todo modelo generativo, puede producir texto legal plausible pero incorrecto o incompleto.
- Requiere revisión profesional: cualquier documento generado debe ser revisado por un abogado cualificado antes de su uso.
- Solo inglés: no soporta otros idiomas.
- Contexto limitado: al no especificarse la longitud de contexto, se desconoce su capacidad para manejar documentos extensos; se recomienda usar `max_new_tokens` de 600 a 1200 para contratos.
- Sin tool calling ni integración con APIs externas.
- La versión int8 cuantizada puede degradar la calidad de salida en comparación con fp32 (la model card menciona una pérdida de ~38% en perplexity en otros proyectos similares, aunque no se confirma para este modelo).

## Enlaces

- [Repositorio HuggingFace del modelo ONNX](https://huggingface.co/DeependraVerma/legal-slm-125m-ultimate-sft-onnx)
- [Modelo padre (legal-slm-125m-ultimate-sft)](https://huggingface.co/DeependraVerma/legal-slm-125m-ultimate-sft)
- [Modelo base (slm-125m-ultimate-base)](https://huggingface.co/DeependraVerma/slm-125m-ultimate-base)
- [Web demo del proyecto](https://legal-slm-125.vercel.app/)
- [Repositorio GitHub relacionado](https://github.com/mcrao/legal-slm-125M/tree/main)
