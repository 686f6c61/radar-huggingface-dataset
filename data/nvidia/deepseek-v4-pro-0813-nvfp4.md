# nvidia/DeepSeek-V4-Pro-0813-NVFP4

## Resumen

El modelo `nvidia/DeepSeek-V4-Pro-0813-NVFP4` es la versión cuantizada en formato NVFP4 (punto flotante de 4 bits de NVIDIA) del modelo `deepseek-ai/DeepSeek-V4-Pro-0813`, desarrollado por DeepSeek AI y cuantizado por NVIDIA mediante la librería Model Optimizer. Se trata de un modelo de lenguaje autorregresivo de tipo Mixture-of-Experts (MoE) con una arquitectura Transformer optimizada que combina atención híbrida (Compressed Sparse Attention y Heavily Compressed Attention) y Manifold-Constrained Hyper-Connections. El modelo base es la versión oficial de DeepSeek-V4-Pro, que incorpora el módulo de decodificación especulativa DSpark en el mismo checkpoint.

Con 1,65 billones de parámetros totales y 49 mil millones de parámetros activos, este modelo está diseñado para razonamiento avanzado, aplicaciones de agentes, uso de herramientas y resolución de problemas complejos en matemáticas, ingeniería de software y asistentes empresariales. Soporta una ventana de contexto de hasta 1 millón de tokens y está optimizado para ejecutarse en hardware NVIDIA Blackwell B200 mediante el runtime SGLang. La cuantización NVFP4 reduce significativamente el footprint de memoria respecto al modelo original, manteniendo la licencia MIT, lo que permite uso comercial y no comercial.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención híbrida (Compressed Sparse Attention + Heavily Compressed Attention) y Manifold-Constrained Hyper-Connections |
| Parametros totales | 1.650.497.936.906 (1,65 billones) |
| Parametros activos | 49 mil millones |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | NVFP4 (punto flotante de 4 bits de NVIDIA) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura base es un Transformer MoE con atención híbrida: combina Compressed Sparse Attention (CSA) y Heavily Compressed Attention (HCA), junto con Manifold-Constrained Hyper-Connections, una técnica que mejora la conectividad entre capas. El modelo base DeepSeek-V4-Pro-0813 incorpora además el módulo DSpark de decodificación especulativa, que acelera la inferencia sin degradar la calidad. La cuantización NVFP4 se realizó con NVIDIA Model Optimizer (versión v0.47.0rc1), utilizando como datasets de calibración `cnn_dailymail` (artículos de noticias en inglés) y `Nemotron-Post-Training-Dataset-v2` (conversaciones multi-turno de NVIDIA). Los datos de entrenamiento del modelo base no han sido revelados (modality, collection method y properties figuran como "undisclosed"). No se especifica si se aplicaron técnicas de RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto y razonamiento avanzado, incluyendo razonamiento multi-paso y modo de pensamiento (reasoning content) cuando se habilita.
- Generación de código científico y de ingeniería, evaluado en benchmarks como SciCode.
- Soporte de function calling y tool calling, con salida estructurada en JSON.
- Capacidades agénticas: puede interactuar con herramientas externas y seguir políticas en escenarios de servicio al cliente (evaluado en τ²-Bench Telecom).
- Soporte de conversaciones multi-turno con system prompts, mensajes de usuario y respuestas de asistente.
- Ventana de contexto de 1 millón de tokens, adecuada para recuperación de información en contextos largos (evaluado en AA-LCR).
- Pipeline de codificación personalizado (`encoding_dsv4`) con niveles de esfuerzo de razonamiento (`low`, `high`, `max`).
- Decodificación especulativa integrada (DSpark) para acelerar la inferencia.

## Casos de uso

- Asistentes empresariales de IA: el modelo puede gestionar conversaciones multi-turno con contexto largo (hasta 1M tokens) y seguir instrucciones complejas, lo que lo hace adecuado para asistentes corporativos que necesitan mantener el historial completo de una interacción.
- Automatización de atención al cliente: gracias a su capacidad de tool calling y adherencia a políticas, puede resolver incidencias en escenarios de telecomunicaciones u otros sectores, interactuando con sistemas externos y simulando agentes de servicio.
- Generación de código en producción: con soporte de function calling y razonamiento avanzado, puede integrarse en pipelines de CI/CD para generar, revisar o completar código científico y de ingeniería.
- Razonamiento matemático y científico: su capacidad de razonamiento multi-paso lo hace útil para resolver problemas de nivel de posgrado en física, química y biología (evaluado en GPQA Diamond).
- Recuperación de información en documentos largos: con 1M tokens de contexto, puede analizar contratos, informes técnicos o bases de conocimiento extensas y extraer datos específicos con alta precisión.
- Desarrollo de agentes autónomos: su soporte de tool use y razonamiento agéntico permite construir agentes que planifican, ejecutan acciones y verifican resultados en entornos simulados o reales.
- Despliegue en entornos NVIDIA Blackwell: al estar cuantizado en NVFP4 y optimizado para SGLang, es adecuado para inferencia de alto rendimiento en clústeres con GPU B200.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La model card menciona que el modelo fue evaluado en los siguientes datasets, pero no proporciona cifras concretas:

| Benchmark | Descripcion |
|---|---|
| GPQA Diamond | 448 preguntas de opción múltiple de nivel de posgrado en biología, física y química |
| AA-LCR | Recuperación y recuerdo de información en contextos largos |
| τ²-Bench Telecom | Uso de herramientas agéntico y adherencia a políticas en servicio al cliente de telecomunicaciones |
| SciCode | Generación de código científico |
| IFBench | Seguimiento de instrucciones |
| Terminal-Bench Hard | Tareas de terminal y línea de comandos |

Se recomienda consultar la documentación de NVIDIA NIM o el repositorio de DeepSeek para obtener resultados detallados.

## Requisitos de hardware

- El modelo está optimizado para GPU NVIDIA Blackwell B200, según la model card.
- El tamaño del repositorio es de 941,1 GB, lo que indica que se necesitan múltiples GPU para cargar los pesos completos en memoria.
- No se especifica la VRAM exacta requerida; con cuantización NVFP4 (4 bits), el footprint de memoria aproximado sería de unos 825 GB solo para los pesos, más overhead de activaciones y KV cache, por lo que se requieren al menos 4-5 GPU B200 (cada una con 192 GB HBM3e) o un nodo con memoria agregada suficiente.
- Runtime soportado: SGLang. No se menciona compatibilidad con vLLM, llama.cpp u Ollama.
- Sistema operativo preferido: Linux.
- La decodificación especulativa DSpark está integrada en el checkpoint, lo que puede reducir la latencia en comparación con el modelo sin cuantizar, aunque no se proporcionan cifras de throughput.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Cuantizacion | Licencia |
|---|---|---|---|---|---|
| deepseek-ai/DeepSeek-V4-Pro-0813 (base) | 1,65 billones | 49 mil millones | 1M tokens | FP8 (original) | MIT |
| nvidia/DeepSeek-V4-Pro-0813-NVFP4 (este modelo) | 1,65 billones | 49 mil millones | 1M tokens | NVFP4 (4 bits) | MIT |

La comparativa con otros modelos MoE de tamaño similar (por ejemplo, DeepSeek-V3 o Qwen3-MoE) no está disponible en la información proporcionada. La principal diferencia con el modelo base es la cuantización NVFP4, que reduce el uso de memoria y acelera la inferencia en hardware Blackwell, manteniendo la misma arquitectura y capacidades.

## Limitaciones y advertencias

- El modelo no es propiedad de NVIDIA; es un modelo de terceros (DeepSeek AI) cuantizado por NVIDIA. NVIDIA no lo desarrolló ni lo posee.
- Los datos de entrenamiento del modelo base no han sido revelados, lo que dificulta evaluar posibles sesgos o la cobertura de dominios específicos.
- No se especifican los idiomas soportados; la calibración se realizó con datos en inglés, por lo que el rendimiento en otros idiomas puede ser inferior.
- La cuantización NVFP4 puede introducir una ligera degradación en la precisión respecto al modelo en FP8, aunque no se proporcionan métricas comparativas.
- El modelo requiere hardware NVIDIA Blackwell B200 y el runtime SGLang; no es compatible con GPUs de generaciones anteriores ni con otros runtimes como vLLM u Ollama.
- Riesgo de alucinación inherente a los modelos de lenguaje de gran tamaño; se recomienda validar las salidas en aplicaciones de producción.
- La licencia MIT permite uso comercial, pero al ser un modelo de terceros, se deben revisar los términos específicos de DeepSeek AI para el modelo base.
- El tamaño del modelo (941 GB en disco) implica costes significativos de almacenamiento y despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nvidia/DeepSeek-V4-Pro-0813-NVFP4
- Modelo base en Hugging Face: https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro-0813
- NVIDIA Model Optimizer: https://github.com/NVIDIA/Model-Optimizer
- NVIDIA NIM (modelo base): https://build.nvidia.com/deepseek-ai/deepseek-v4-pro-0813
- Documentación de API de NVIDIA NIM: https://docs.api.nvidia.com/nim/reference/deepseek-ai-deepseek-v4-pro-0813
- Dataset de calibración cnn_dailymail: https://huggingface.co/datasets/abisee/cnn_dailymail
- Dataset de calibración Nemotron-Post-Training-Dataset-v2: https://huggingface.co/datasets/nvidia/Nemotron-Post-Training-Dataset-v2
