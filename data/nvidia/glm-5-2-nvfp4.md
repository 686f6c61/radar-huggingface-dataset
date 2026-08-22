# nvidia/GLM-5.2-NVFP4

## Resumen

NVIDIA GLM-5.2 NVFP4 es la versión cuantizada en precisión NVFP4 (4-bit floating point) del modelo GLM-5.2 desarrollado por Z.ai (zai-org), publicada por NVIDIA mediante su librería Model Optimizer. El modelo base es un transformador autorregresivo de arquitectura Mixture-of-Experts (MoE) con atención dispersa basada en el indexador IndexShare, diseñado para tareas de razonamiento, generación de código y agentes con una ventana de contexto de hasta 1 millón de tokens. La cuantización reduce el peso total del modelo de 753B parámetros a un tamaño de aproximadamente 380 GB en disco, manteniendo 40B parámetros activos por token.

La relevancia de esta versión reside en que permite desplegar un modelo de clase flagship en hardware NVIDIA Blackwell (B200/B300) con los motores de inferencia SGLang y vLLM, reduciendo los requisitos de memoria y acelerando la inferencia respecto al modelo original en FP16/BF16. Está orientada a desarrolladores que necesitan un modelo de gran contexto, con capacidades de tool calling y razonamiento agéntico, listo para producción comercial bajo licencia MIT. No se realizó entrenamiento ni ajuste adicional por parte de NVIDIA; solo se aplicó cuantización post-entrenamiento con calibración.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformador MoE con atención dispersa (IndexShare) - `GlmMoeDsaForCausalLM` |
| Parametros totales | 753B |
| Parametros activos | 40B |
| Longitud de contexto | Hasta 1M tokens |
| Tipos de cuantizacion | NVFP4 (4-bit FP4) sobre pesos y activaciones de operadores lineales en expertos MoE; el experto compartido no se cuantiza |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (Model Optimizer, v0.46.0) |

## Arquitectura y entrenamiento

El modelo base GLM-5.2 emplea una arquitectura de transformador autorregresivo con Mixture-of-Experts (MoE) y atención dispersa. La innovación principal es el índice IndexShare, que reutiliza el mismo indexador de atención entre cada cuatro capas de atención dispersa, reduciendo los FLOPs por token y permitiendo el soporte de contextos largos de hasta 1M tokens sin un coste lineal completo. El modelo cuantizado conserva esta arquitectura íntegramente, aplicando cuantización NVFP4 únicamente a los pesos y activaciones de los operadores lineales dentro de los bloques de expertos MoE; el experto compartido se mantiene en precisión completa para preservar la calidad de la salida.

En cuanto al entrenamiento, la model card indica que no se realizó entrenamiento ni testing adicional por parte de NVIDIA para esta versión; el proceso fue exclusivamente de cuantización post-training (PTQ) con la librería Model Optimizer v0.46.0. Los datos de entrenamiento y testing del modelo base se describen como no divulgados ("Undisclosed"). La calibración para la cuantización se realizó con un dataset interno no especificado, y la evaluación se llevó a cabo sobre los benchmarks GPQA Diamond, SciCode, IFBench, AA-LCR y τ²-Bench Telecom.

## Capacidades

- Generación de texto y razonamiento de larga duración (long-horizon) con contexto de hasta 1M tokens.
- Razonamiento agéntico multi-paso y tool calling, con parsers específicos para el formato GLM-5.2 (tool-call-parser `glm47` y reasoning-parser `glm45` en SGLang).
- Generación de código científico y técnico, evaluado con SciCode.
- Instrucción compleja y seguimiento de restricciones estructuradas (IFBench).
- Recuperación y recuerdo de información en contextos largos (AA-LCR).
- Capacidades multilingües no documentadas en la información disponible.
- Modo de razonamiento (reasoning) integrado, activable mediante el reasoning-parser del runtime.

## Casos de uso

- Atención al cliente automatizada con contexto largo: el modelo puede gestionar conversaciones multi-turno con historial extenso gracias a su ventana de 1M tokens, ideal para sistemas de soporte que necesitan recordar detalles de interacciones anteriores.
- Agentes de tool calling en entornos de telecomunicaciones: evaluado en τ²-Bench Telecom, puede resolver problemas de cuentas interactuando con herramientas externas y siguiendo políticas corporativas.
- Generación de código en producción: con soporte para tool calling y razonamiento multi-paso, puede integrarse en pipelines de CI/CD para generar y revisar código científico o técnico, como demuestra su evaluación en SciCode.
- Sistemas RAG sobre documentos extensos: la ventana de contexto de 1M tokens permite procesar libros completos, expedientes clínicos o documentación técnica sin necesidad de fragmentar el prompt.
- Chatbots con razonamiento profundo: el modo de razonamiento GLM-45 permite desplegar asistentes que explican su proceso de pensamiento antes de responder, útil en educación o soporte técnico.
- Investigación académica en biología, física y química: el modelo está calibrado para preguntas de nivel de posgrado (GPQA Diamond), por lo que puede servir como asistente en revisión de literatura y resolución de problemas complejos.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La model card menciona que el modelo fue evaluado sobre los siguientes conjuntos de datos, pero no proporciona las puntuaciones obtenidas:

| Benchmark | Descripcion |
|---|---|
| GPQA Diamond | Preguntas de opción múltiple de nivel de posgrado en biología, física y química |
| SciCode | Evaluación de generación de código científico |
| IFBench | Evaluación de seguimiento de instrucciones con restricciones estructuradas |
| AA-LCR | Evaluación de recuperación de contexto largo (Artificial Analysis Long Context Recall) |
| τ²-Bench Telecom | Evaluación de uso agéntico de herramientas y cumplimiento de políticas en atención al cliente de telecomunicaciones |

Se recomienda consultar la model card del modelo base (zai-org/GLM-5.2) para datos cuantitativos de rendimiento del modelo sin cuantizar.

## Requisitos de hardware

- El modelo ocupa aproximadamente 380 GB en disco en formato safetensors, lo que implica que es necesario un sistema multi-GPU.
- Hardware soportado: NVIDIA Blackwell (B200 o B300), con al menos 8 GPUs para el ejemplo de despliegue con tensor-parallel-size 8.
- VRAM estimada: con 8 GPUs B200 de 192 GB, el modelo puede servirse con margen; también es factible con 4 GPUs de 192 GB, aunque no está validado en la documentación.
- No es viable en GPUs de consumo (RTX 4090, 3090, etc.) por el tamaño del modelo.
- Motores de inferencia soportados: SGLang (imagen `lmsysorg/sglang:latest` o `lmsysorg/sglang:dev-glm52-nvfp4`) y vLLM.
- Requiere `transformers>=5.3.0` para la arquitectura `glm_moe_dsa`.
- Opciones de despliegue: SGLang con `--quantization modelopt_fp4`, `--tool-call-parser glm47`, `--reasoning-parser glm45` y `--chunked-prefill-size 16384`; también disponible vía NVIDIA NIM en build.nvidia.com.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Cuantizacion |
|---|---|---|---|---|
| nvidia/GLM-5.2-NVFP4 | 753B (40B activos) | 1M | MIT | NVFP4 (4-bit) |
| zai-org/GLM-5.2 (base) | 753B (40B activos) | 1M | MIT | Sin cuantizar (FP16/BF16) |
| DeepSeek-V3.2 | No disponible | No disponible | No disponible | No disponible |
| Qwen3-MoE | No disponible | No disponible | No disponible | No disponible |

La comparación directa con otros MoE de gran escala (DeepSeek-V3.2, Qwen3-MoE) no está disponible en la información proporcionada. Respecto al modelo base, la versión NVFP4 reduce el tamaño en memoria de aproximadamente 1.5 TB (FP16) a unos 380 GB, con una pérdida de precisión típica de cuantización FP4 que no está cuantificada en esta documentación.

## Limitaciones y advertencias

- No se han publicado resultados cuantitativos de benchmarks para la versión cuantizada; la pérdida de calidad por la cuantización FP4 no está documentada.
- Los datos de entrenamiento, testing y propiedades del dataset original no están divulgados, lo que limita la evaluación de sesgos.
- El modelo está optimizado para hardware NVIDIA Blackwell; no se garantiza su funcionamiento en arquitecturas anteriores ni en GPUs no NVIDIA.
- Requiere una infraestructura multi-GPU significativa (mínimo 2-8 GPUs B200/B300), lo que excluye su uso en entornos de desarrollo locales o en la nube con GPUs de gama media.
- La documentación no especifica los idiomas soportados, aunque por su origen probablemente tenga un buen rendimiento en chino e inglés.
- Aunque la licencia es MIT y permite uso comercial, la integración en sistemas requiere pruebas adicionales con datos específicos del caso de uso según la metodología V-model recomendada por NVIDIA.
- El riesgo de alucinación y sesgos no está evaluado de forma específica para esta versión cuantizada.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/nvidia/GLM-5.2-NVFP4
- Modelo base en HuggingFace: https://huggingface.co/zai-org/GLM-5.2
- Model Optimizer de NVIDIA: https://github.com/NVIDIA/Model-Optimizer
- Model card de NVIDIA NIM para GLM-5.2: https://build.nvidia.com/z-ai/glm-5.2/modelcard
- Copia en ModelScope: https://www.modelscope.cn/models/nv-community/GLM-5.2-NVFP4
- PDF de la model card: https://gpuflow.ai/models/glm-5.2-nvfp4.pdf
