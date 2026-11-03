# amd/Mistral-7B-Instruct-v0.3_rai_1.9.0_npu

## Resumen

El modelo `amd/Mistral-7B-Instruct-v0.3_rai_1.9.0_npu` es una adaptación del conocido Mistral-7B-Instruct-v0.3 publicada por AMD, empaquetada en formato ONNX y optimizada mediante el toolkit Quark para su ejecución sobre las NPU integradas en los procesadores AMD Ryzen AI (RAI 1.9.0). No se trata de un modelo entrenado desde cero, sino de una conversión y cuantización del checkpoint original de Mistral AI destinada a acelerar la inferencia en hardware de PC con unidad de procesamiento neuronal dedicada.

El modelo hereda la arquitectura transformer densa de Mistral-7B-Instruct-v0.3, con aproximadamente 7.250 millones de parámetros y una ventana de contexto de 32.768 tokens. Su propósito es ofrecer generación de texto conversacional en inglés con latencia reducida y bajo consumo energético en equipos con Ryzen AI, evitando la dependencia de una GPU dedicada. El repositorio tiene un tamaño de 8,1 GB y el acceso está restringido (gated), por lo que es necesario aceptar las condiciones en HuggingFace antes de descargarlo.

La relevancia de esta ficha radica en que ejemplifica la tendencia de llevar modelos de 7B a la NPU del PC, un espacio tradicionalmente dominado por CPU y GPU. La licencia Apache 2.0 del modelo base se mantiene, lo que facilita su uso comercial, aunque las limitaciones prácticas vienen impuestas por el ecosistema de despliegue (ONNX Runtime, drivers Ryzen AI y la versión concreta del toolkit Quark).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Mistral-7B-Instruct-v0.3) |
| Parametros totales | ~7.250 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (heredada del modelo base) |
| Tipos de cuantizacion | Cuantizacion via Quark para NPU Ryzen AI; niveles exactos no disponibles |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (optimizado para Ryzen AI NPU) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Mistral-7B-Instruct-v0.3: un transformer decoder-only denso con atención de ventana deslizante (sliding window attention), activación SwiGLU, RMSNorm y embeddings rotatorios (RoPE). El modelo original fue entrenado por Mistral AI sobre un corpus multilingüe no detallado públicamente y posteriormente ajustado con instrucciones y preferencias (SFT y DPO) para tareas conversacionales. La versión v0.3 amplió el vocabulario y el contexto respecto a versiones anteriores.

La contribución de AMD en este repositorio no es de entrenamiento, sino de compilación y cuantización: el checkpoint se exporta a ONNX y se procesa con Quark, el toolkit de AMD para cuantización y despliegue en NPU. El sufijo `rai_1.9.0` indica la versión del stack Ryzen AI con la que se generó el artefacto, y `npu` señala que los grafos están preparados para ejecutarse en la unidad neuronal. No se dispone de información sobre el número de tokens de calibración, la composición exacta del dataset de cuantización ni si se aplicaron técnicas adicionales como decodificación especulativa.

## Capacidades

- Generación de texto conversacional en inglés con formato de chat instruct.
- Razonamiento de propósito general y respuesta a preguntas.
- Generación de código y tareas básicas de programación, heredadas del modelo base.
- Matemáticas de nivel medio, sin garantías de precisión en problemas complejos.
- Soporte de contexto largo (hasta 32.768 tokens según el modelo base).
- Capacidad multilingüe limitada: la model card declara únicamente inglés.
- No se documenta soporte de tool calling, function calling ni modo de razonamiento explícito (thinking) en esta conversión.
- No incluye visión ni audio.

## Casos de uso

- Asistentes locales en portátiles y equipos de sobremesa con Ryzen AI: el modelo se ejecuta en la NPU liberando CPU y GPU, lo que permite mantener un chatbot siempre disponible con consumo energético contenido y sin enviar datos a la nube.
- Procesamiento de documentos en el dispositivo: con 32.768 tokens de contexto puede resumir contratos, informes o correos extensos en entornos donde la confidencialidad impide usar APIs externas.
- Generación de código en editores locales: integrado en asistentes de IDE que corren sobre el PC, ofrece autocompletado y explicación de fragmentos sin depender de conectividad.
- Transcripción y reescritura de reuniones: combinado con un motor de ASR local, el modelo puede generar actas y resúmenes de conversaciones largas aprovechando la ventana de contexto.
- Filtrado y clasificación de correo o tickets: tareas de extracción y etiquetado por lotes que se benefician de la baja latencia de la NPU y del coste marginal nulo por token.
- Educación y tutoría offline: despliegue en aulas o entornos sin red para responder preguntas y explicar conceptos en inglés.
- Prototipado de aplicaciones edge con ONNX Runtime: sirve como referencia para validar pipelines de cuantización Quark antes de pasar a producción en hardware AMD.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye métricas de MMLU, HumanEval, GSM8K ni comparativas de latencia o throughput frente al checkpoint original en FP16.

## Requisitos de hardware

- Hardware objetivo: NPU integrada en procesadores AMD Ryzen AI compatibles con el stack RAI 1.9.0.
- VRAM: no aplica en el sentido tradicional; el modelo se ejecuta sobre la NPU y memoria del sistema. El repo ocupa 8,1 GB, lo que da una idea del espacio en disco necesario.
- GPU: no es el hardware objetivo; el artefacto está compilado para NPU, no para CUDA ni ROCm.
- Consumer GPU: no procede para esta conversión concreta; para ejecutar Mistral-7B en GPU consumer se recomienda usar el checkpoint original con llama.cpp o vLLM.
- Despliegue: ONNX Runtime con el proveedor de ejecución de Ryzen AI; no se documenta compatibilidad con vLLM, TGI ni Ollama para este artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| amd/Mistral-7B-Instruct-v0.3_rai_1.9.0_npu | ~7,25B | 32.768 | ONNX (NPU) | apache-2.0 | Inferencia en NPU Ryzen AI |
| mistralai/Mistral-7B-Instruct-v0.3 | ~7,25B | 32.768 | safetensors | apache-2.0 | Modelo base original |
| mistralai/Mistral-7B-Instruct-v0.3 (GGUF) | ~7,25B | 32.768 | GGUF | apache-2.0 | Inferencia en CPU/GPU via llama.cpp |
| meta-llama/Meta-Llama-3.1-8B-Instruct | ~8B | 128.000 | safetensors | Llama 3.1 Community | Alternativa de tamaño similar con contexto mayor |

La diferencia clave frente al checkpoint original y sus versiones GGUF es el backend de ejecución: esta conversión solo tiene sentido en hardware Ryzen AI, mientras que las otras opciones son portables entre CPU y GPU. En rendimiento bruto no hay datos públicos que permitan comparar esta variante con el modelo en FP16.

## Limitaciones y advertencias

- Solo soporta inglés según la model card; el rendimiento en otros idiomas no está garantizado.
- Riesgo de alucinación inherente a los modelos de 7B, especialmente en tareas factuales y matemáticas complejas.
- La cuantización para NPU puede degradar la calidad respecto al checkpoint original en FP16; no se publican evaluaciones que cuantifiquen esa pérdida.
- Dependencia estricta del stack Ryzen AI 1.9.0 y de drivers AMD; no es portable a otros aceleradores.
- Acceso restringido (gated): requiere aceptar condiciones en HuggingFace y una cuenta autenticada.
- Licencia Apache 2.0 permisiva para uso comercial, pero el usuario debe verificar las licencias de las herramientas de despliegue (ONNX Runtime, Quark, Ryzen AI SDK).
- Sin soporte documentado de tool calling ni agentes multi-paso en esta conversión.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema y validación comunitaria prácticamente inexistentes.

## Enlaces

- HuggingFace: https://huggingface.co/amd/Mistral-7B-Instruct-v0.3_rai_1.9.0_npu
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.3
- AMD Ryzen AI: https://www.amd.com/en/products/software/ryzen-ai.html
- Quark (toolkit de cuantización de AMD): https://quark.docs.amd.com/
- ONNX Runtime: https://onnxruntime.ai/
