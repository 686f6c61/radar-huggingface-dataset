# nvidia/DeepSeek-V4-Flash-0731-NVFP4

## Resumen

NVIDIA DeepSeek-V4-Flash-0731-NVFP4 es la versión cuantizada en formato NVFP4 (punto flotante de 4 bits de NVIDIA) del modelo DeepSeek-V4-Flash-0731, desarrollado por DeepSeek AI y publicado por NVIDIA tras un proceso de optimización con la librería Model Optimizer. Se trata de un modelo de lenguaje autorregresivo de tipo Mixture-of-Experts (MoE) con 304 000 millones de parámetros totales y 13 000 millones activos por token, diseñado para tareas de razonamiento avanzado, generación de código, uso de herramientas y flujos de trabajo agénticos.

La relevancia de este lanzamiento reside en tres factores: es la versión oficial estable de DeepSeek-V4-Flash, incorpora de serie el módulo de decodificación especulativa DSpark en el mismo checkpoint, y la cuantización NVFP4 de NVIDIA reduce significativamente los requisitos de memoria respecto al modelo original en BF16, manteniendo la compatibilidad con hardware Blackwell. El modelo soporta una ventana de contexto de hasta un millón de tokens y se distribuye bajo licencia MIT, lo que permite uso comercial y no comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con Mixture-of-Experts (MoE), atención híbrida (Compressed Sparse Attention + Heavily Compressed Attention) y Manifold-Constrained Hyper-Connections |
| Parametros totales | 304 180 418 494 (304B) |
| Parametros activos | 13B |
| Longitud de contexto | 1 000 000 tokens |
| Tipos de cuantizacion | NVFP4 (4 bits de punto flotante de NVIDIA), 8-bit, FP8 (mencionado en tags) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base DeepSeek-V4-Flash-0731 emplea una arquitectura Transformer optimizada con atención híbrida que combina Compressed Sparse Attention (CSA) y Heavily Compressed Attention (HCA), junto con conexiones hiper-restrictivas Manifold-Constrained Hyper-Connections. Es un modelo MoE con 304B parámetros totales y 13B activos por token, lo que permite un rendimiento por parámetro activo muy superior a modelos densos equivalentes. El checkpoint incluye el módulo DSpark de decodificación especulativa, que acelera la inferencia generando múltiples tokens candidatos en paralelo.

La cuantización NVFP4 ha sido realizada por NVIDIA con Model Optimizer v0.46.0, utilizando como datasets de calibración cnn_dailymail (300 000 artículos de noticias en inglés) y Nemotron-Post-Training-Dataset-v2 (conversaciones multi-turno de NVIDIA). Los datos de entrenamiento originales del modelo base no han sido revelados por DeepSeek AI. El modelo está optimizado para ejecutarse en GPUs NVIDIA Blackwell y es compatible con los motores de inferencia SGLang y vLLM.

## Capacidades

- Generación de texto y razonamiento avanzado en dominios como matemáticas, ingeniería de software y asistentes empresariales.
- Razonamiento multi-paso y modo de pensamiento con niveles de esfuerzo configurables (`low`, `high`, `max`) mediante el pipeline de codificación `encoding_dsv4`.
- Soporte de tool calling y function calling, con capacidad de salida estructurada en JSON.
- Capacidades agénticas: puede interactuar con herramientas externas y mantener conversaciones multi-turno con contexto largo.
- Recuperación de información en contextos extensos gracias a su ventana de 1M tokens y atención híbrida.
- Generación de código científico y de propósito general, con soporte para benchmarks como SciCode y Terminal-Bench.
- Seguimiento de instrucciones complejas (evaluado con IFBench).
- Decodificación especulativa integrada (módulo DSpark) para acelerar la inferencia.

## Casos de uso

- Asistentes de atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo (hasta 1M tokens) para mantener el historial completo de interacciones y resolver incidencias complejas, como demuestra su evaluación en τ²-Bench Telecom para servicios de telecomunicaciones.
- Generación de código en producción: con soporte de tool calling y salida JSON estructurada, puede integrarse en pipelines de CI/CD para generar, revisar y corregir código, así como interactuar con APIs de repositorios y sistemas de integración continua.
- Agentes autónomos para resolución de tareas: su capacidad de razonamiento multi-paso y uso de herramientas lo hace adecuado para agentes que necesitan planificar, ejecutar acciones y verificar resultados en entornos simulados o reales.
- Análisis y razonamiento sobre documentos extensos: la ventana de 1M tokens permite procesar libros técnicos completos, expedientes legales o informes financieros, respondiendo preguntas que requieren recuperar información distribuida a lo largo de todo el documento.
- Investigación científica y matemática: con resultados en GPQA Diamond (preguntas de nivel de posgrado en biología, física y química), puede asistir en la revisión de literatura, formulación de hipótesis y resolución de problemas matemáticos avanzados.
- Sistemas RAG (Retrieval-Augmented Generation) de alta exigencia: su capacidad de razonamiento y su contexto amplio lo convierten en un candidato para sistemas que combinan recuperación de información con razonamiento complejo en entornos empresariales.
- Desarrollo de asistentes de programación con razonamiento agéntico: puede utilizarse para depuración automática, refactorización de código y generación de tests, aprovechando su evaluación en Terminal-Bench v2.1.

## Benchmarks y rendimiento

La model card del fabricante menciona que el modelo fue evaluado en los siguientes benchmarks, aunque no se proporcionan cifras concretas en la información disponible:

- GPQA Diamond (razonamiento científico de nivel posgrado)
- AA-LCR (Artificial Analysis Long Context Recall, recuperación de información en contexto largo)
- τ²-Bench Telecom (uso de herramientas agéntico en servicios de telecomunicaciones)
- SciCode (codificación científica)
- IFBench (seguimiento de instrucciones)
- Terminal-Bench v2.1 (tareas de terminal y agénticas)

No se han publicado resultados numéricos de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint NVFP4 ocupa 175.6 GB en disco, por lo que se requieren al menos 2 GPUs con 96 GB de VRAM (por ejemplo, B200) o 4 GPUs con 48 GB (L40S o similar) para cargar el modelo completo en memoria. Para contexto de 1M tokens, la memoria adicional necesaria para KV cache puede ser considerable.
- GPUs recomendadas: exclusivamente arquitectura NVIDIA Blackwell (B200, B100, GB200). No es compatible con hardware anterior como Ampere o Hopper según la model card.
- No cabe en GPUs de consumo (RTX 4090, etc.) ni en estaciones de trabajo de un solo GPU de gama alta.
- Opciones de despliegue: SGLang y vLLM son los motores soportados oficialmente. También está disponible como NIM (NVIDIA Inference Microservice) en build.nvidia.com.
- El módulo DSpark de decodificación especulativa incluido en el checkpoint puede mejorar el throughput de generación, aunque no se proporcionan cifras concretas de latencia o tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Cuantizacion |
|---|---|---|---|---|---|
| DeepSeek-V4-Flash-0731 (BF16) | 304B | 13B | 1M | MIT | BF16 |
| NVIDIA DeepSeek-V4-Flash-0731-NVFP4 | 304B | 13B | 1M | MIT | NVFP4 |
| DeepSeek-V4-Flash-0731 GGUF | 304B | 13B | 1M | MIT | GGUF (varias) |

La cuantización NVFP4 de NVIDIA reduce el tamaño del modelo respecto al checkpoint original BF16 (175.6 GB frente a un estimado de ~608 GB), a costa de una ligera pérdida de precisión no cuantificada en la información disponible. La versión GGUF, mencionada en foros de NVIDIA, estaría orientada a ejecución en CPU o GPUs con menos VRAM mediante llama.cpp. No se dispone de datos comparativos de rendimiento entre estas variantes.

## Limitaciones y advertencias

- El modelo es una cuantización NVFP4, lo que puede introducir una degradación de precisión respecto al modelo original en BF16, especialmente en tareas de razonamiento matemático de alta exigencia. No se han publicado métricas que cuantifiquen esta pérdida.
- Los datos de entrenamiento del modelo base no han sido revelados por DeepSeek AI, lo que dificulta evaluar posibles sesgos o limitaciones derivadas de la composición del dataset.
- La compatibilidad de hardware está restringida exclusivamente a GPUs NVIDIA Blackwell, lo que limita su despliegue en centros de datos con hardware anterior.
- No se especifican los idiomas soportados, aunque el dataset de calibración utilizado es predominantemente en inglés, lo que podría afectar al rendimiento en otros idiomas.
- El pipeline de codificación personalizado (`encoding_dsv4`) y los niveles de razonamiento (`low`, `high`, `max`) requieren una integración específica que puede no estar disponible en todos los frameworks de inferencia.
- Aunque la licencia MIT permite uso comercial, el modelo es de terceros (DeepSeek AI) y NVIDIA actúa únicamente como distribuidor de la versión cuantizada.
- El tamaño del checkpoint (175.6 GB) implica costes de infraestructura significativos para el despliegue en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nvidia/DeepSeek-V4-Flash-0731-NVFP4
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731
- Licencia del modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731/blob/main/LICENSE
- NVIDIA Model Optimizer: https://github.com/NVIDIA/Model-Optimizer
- NVIDIA NIM (model card): https://build.nvidia.com/deepseek-ai/deepseek-v4-flash-0731/modelcard
- NVIDIA NIM (página del modelo): https://build.nvidia.com/deepseek-ai/deepseek-v4-flash-0731
- API de NVIDIA: https://docs.api.nvidia.com/nim/reference/deepseek-ai-deepseek-v4-flash-0731
- Hilo en foros de NVIDIA sobre GGUF: https://forums.developer.nvidia.com/t/deepseek-v4-flash-0731-gguf-new-model/378829
