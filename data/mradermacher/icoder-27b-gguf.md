# mradermacher/iCoder-27B-GGUF

## Resumen

iCoder-27B es un modelo de lenguaje especializado en generación de código desarrollado por i-Coder, distribuido en formato GGUF por mradermacher. Con 26.895.998.464 parámetros (aproximadamente 26,9 mil millones), está orientado a tareas de programación y, de forma destacable, a la generación de RTL, Verilog y kernels de GPU en Triton, según las etiquetas declaradas en el repositorio. Esta ficha documenta la versión cuantizada publicada por mradermacher, que facilita su despliegue en entornos con recursos limitados mediante llama.cpp y herramientas compatibles con GGUF.

La relevancia de esta publicación radica en la disponibilidad de cuantizaciones estáticas en múltiples niveles (desde Q2_K de 10,8 GB hasta Q8_0 de 28,7 GB), lo que permite ejecutar un modelo de casi 27B parámetros en hardware de consumo. El repositorio incluye además suplementos multimodales (mmproj) en Q8_0 y f16, lo que sugiere capacidades de visión en el modelo base, aunque la información proporcionada no detalla la arquitectura interna ni los datos de entrenamiento.

La licencia Apache 2.0 y el soporte declarado únicamente para inglés condicionan su uso: es adecuado para proyectos comerciales sin restricciones de copyleft, pero no está pensado para aplicaciones en castellano ni para tareas multilingües sin evaluación previa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | 26.895.998.464 (~26,9B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base i-Coder/iCoder-27B en la documentación proporcionada. El recuento de parámetros (26,9B) y el formato de publicación en transformers sugieren un transformer decoder-only, pero no se confirma ni el tipo de atención, ni la composición del dataset, ni si se aplicaron etapas de RLHF o DPO. Las etiquetas del repositorio (code, rtl, verilog, gpu-kernel, triton) indican una especialización en dominios de programación de bajo nivel y hardware, sin que se detallen los volúmenes de tokens de entrenamiento.

La contribución técnica de esta publicación concreta es la cuantización: mradermacher genera cuantizaciones estáticas (quantize_version 2, output_tensor_quantised 1, convert_type hf) a partir del modelo original. Se ofrece además una variante con cuantizaciones ponderadas por imatrix en un repositorio separado (iCoder-27B-i1-GGUF), que suele preservar mejor la calidad en niveles bajos de bits. La presencia de ficheros mmproj confirma que el modelo base incorpora un codificador multimodal para entrada de imágenes.

## Capacidades

- Generación de código en lenguajes de programación convencionales, según la etiqueta "code" del repositorio.
- Generación de RTL y Verilog para diseño de circuitos digitales.
- Escritura de kernels de GPU en Triton.
- Procesamiento multimodal: los ficheros mmproj-Q8_0 y mmproj-f16 indican soporte de entrada de imágenes, aunque no se detalla su alcance.
- Formato conversacional (etiqueta "conversational"), apto para diálogo multi-turno.
- Compatibilidad con endpoints (etiqueta "endpoints_compatible").
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según la model card.

## Casos de uso

- Generación de módulos Verilog y RTL: el modelo puede producir descripciones de hardware sintetizables para bloques como máquinas de estados, FIFOs o arbitradores de bus, aprovechando su especialización declarada en RTL; útil en flujos de diseño FPGA y ASIC donde la iteración rápida sobre borradores ahorra tiempo de ingeniería.
- Escritura de kernels Triton para aceleración en GPU: adecuado para traducir operaciones de PyTorch a kernels Triton optimizados, un nicho con pocos modelos especializados y donde las etiquetas del repositorio indican entrenamiento específico.
- Asistente de código integrado en IDE: con cuantización Q4_K_M (16,6 GB) puede servirse localmente mediante llama.cpp y conectarse a extensiones tipo Continue o similar, manteniendo el código fuera de servicios en la nube.
- Revisión y explicación de código legacy: el formato conversacional permite solicitar análisis de fragmentos de código, detección de patrones problemáticos y generación de documentación técnica.
- Prototipado en estaciones de trabajo con una sola GPU: las cuantizaciones Q3_K_M (13,4 GB) y Q4_K_S (15,7 GB) caben en GPUs de consumo de 16-24 GB, lo que permite iterar sin infraestructura dedicada.
- Generación de tests unitarios y casos de prueba: a partir de firmas de funciones o especificaciones, el modelo puede producir suites de pruebas en el lenguaje del proyecto.
- Extracción de información de diagramas y capturas técnicas: gracias al suplemento mmproj, es posible alimentar imágenes de esquemas de circuitos o diagramas de bloques para obtener descripciones textuales o código asociado, aunque esta capacidad no está documentada en detalle.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead de contexto, aproximada):
  - Q2_K: ~11-13 GB
  - Q3_K_M: ~14-16 GB
  - Q4_K_M: ~17-20 GB
  - Q5_K_M: ~20-23 GB
  - Q6_K: ~23-26 GB
  - Q8_0: ~29-32 GB
- GPU recomendadas: A100 40/80 GB o H100 para Q6_K y Q8_0 con contexto largo; RTX 4090 (24 GB) para Q4_K_M y Q5_K_M; RTX 3090 (24 GB) para Q4_K_M.
- GPU de consumo: sí, el modelo cabe en tarjetas de 16 GB con Q3_K_M y en tarjetas de 24 GB con Q4_K_M o Q5_K_M. En 12 GB solo es viable con Q2_K y contexto reducido, con pérdida notable de calidad.
- Despliegue: llama.cpp y Ollama son las opciones naturales para GGUF; también es posible usar llama-cpp-python y servidores compatibles con la API de OpenAI. vLLM y TGI no soportan GGUF de forma nativa para este modelo.
- Latencia y throughput: no disponibles en la información proporcionada. Como referencia cualitativa, la model card califica Q4_K_S y Q4_K_M como "fast, recommended" y Q8_0 como "fast, best quality".

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Formato |
|---|---|---|---|---|---|
| iCoder-27B (esta ficha) | ~26,9B | no disponible | Código, RTL, Verilog, Triton | Apache 2.0 | GGUF, safetensors |
| Qwen2.5-Coder-32B | 32,5B | 128K (según documentación pública del modelo) | Código general | Apache 2.0 | safetensors, GGUF |
| DeepSeek-Coder-V2-Lite | 16B (2,4B activos, MoE) | 128K (según documentación pública del modelo) | Código general | DeepSeek License | safetensors, GGUF |
| CodeLlama-34B | 34B | 16K (según documentación pública del modelo) | Código general | Llama 2 Community License | safetensors, GGUF |

La comparativa se limita a datos públicos de cada modelo; no se dispone de resultados de benchmarks de iCoder-27B que permitan una comparación cuantitativa de rendimiento. Su diferenciador frente a las alternativas es la especialización declarada en RTL y kernels Triton, un nicho que los modelos de código general no cubren de forma explícita.

## Limitaciones y advertencias

- Idiomas: la model card declara únicamente inglés; el rendimiento en castellano no está evaluado y probablemente sea inferior.
- Contexto: se desconoce la longitud máxima de contexto, lo que impide planificar aplicaciones con documentos largos sin pruebas previas.
- Arquitectura y entrenamiento no documentados: no es posible evaluar la calidad del dataset, los sesgos introducidos ni las etapas de alineación.
- Riesgo de alucinación: como todo modelo generativo de código, puede producir APIs inexistentes, sintaxis Verilog no sintetizable o kernels Triton con errores semánticos; se requiere verificación humana y tests automatizados.
- Cuantizaciones agresivas: Q2_K y Q3_K_S degradan la calidad de forma significativa; para producción se recomienda Q4_K_M o superior, o las variantes imatrix del repositorio i1.
- Licencia Apache 2.0: permite uso comercial sin restricciones de copyleft, pero el usuario asume la responsabilidad sobre el código generado y posibles reclamaciones de propiedad intelectual.
- Sin garantías del publicador de la cuantización: mradermacher distribuye cuantizaciones "tal cual"; no se documentan pruebas de regresión de calidad frente al modelo base.
- Fecha de creación del repositorio (2026-08-31): conviene verificar la vigencia del modelo base y si existen versiones posteriores.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/iCoder-27B-GGUF
- Modelo base: https://huggingface.co/i-Coder/iCoder-27B
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/iCoder-27B-i1-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#iCoder-27B-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
