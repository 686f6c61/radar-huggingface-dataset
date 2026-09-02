# ashton25549/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16

## Resumen

NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16 es un modelo de lenguaje de gran tamaño desarrollado por NVIDIA, perteneciente a la familia Nemotron 3.5 Lightning. Se trata de la versión de referencia en precisión BF16, pensada principalmente como punto de partida para personalización: post-entrenamiento (SFT, RL, destilación), adaptación a dominios específicos y creación de variantes cuantizadas. El modelo emplea una arquitectura híbrida de Mezcla de Expertos (MoE) que combina capas Mamba-2, capas MoE y capas de atención selectivas, con 30 mil millones de parámetros totales y solo 3 mil millones activos por token.

Su relevancia actual radica en su eficiencia: al activar únicamente 3B parámetros, ofrece un rendimiento comparable a modelos densos mucho mayores con un coste computacional reducido. Además, soporta una ventana de contexto de hasta 1 millón de tokens en configuraciones multi-GPU, y 256K en una sola GPU H100 o A100 de 80 GB. El modelo está disponible bajo la licencia OpenMDW-1.1, que permite uso comercial, y es compatible con hardware NVIDIA desde Ampere hasta Blackwell. Incluye un modo de razonamiento configurable y técnicas de decodificación especulativa (DSpark) para acelerar la generación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrida: Mamba-2 + MoE + Attention intercaladas |
| Parametros totales | 30B (31.577.937.344 en safetensors) |
| Parametros activos | 3B |
| Longitud de contexto | Hasta 1M tokens (256K en una sola H100/A100 80GB) |
| Tipos de cuantizacion | BF16 (referencia); NVFP4 y GGUF disponibles en repos oficiales |
| Idiomas soportados | Inglés, español, francés, alemán, italiano, japonés |
| Licencia | OpenMDW-1.1 (uso comercial permitido) |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo utiliza una arquitectura híbrida de Mezcla de Expertos que intercala capas Mamba-2 (modelos de espacio de estado), capas MoE y capas de atención selectivas. Esta combinación busca equilibrar la eficiencia computacional de Mamba-2 con la capacidad de razonamiento de la atención, reduciendo el coste por token al activar solo 3B de los 30B parámetros totales. El entrenamiento se realizó en dos fases: pre-entrenamiento con datos de NVIDIA (corte en septiembre de 2025) y post-entrenamiento con el dataset nvidia/nemotron-post-training-v3 (corte en mayo de 2026), entre diciembre de 2025 y mayo de 2026. El modelo incorpora un modo de razonamiento configurable mediante la plantilla de chat (`enable_thinking=True/False`) y soporta decodificación especulativa con la técnica DSpark para entornos de centro de datos con baja concurrencia.

## Capacidades

- Generación de texto y chat conversacional en seis idiomas (inglés, español, francés, alemán, italiano y japonés).
- Razonamiento multi-paso con modo "thinking" configurable, activable o desactivable según la tarea.
- Soporte para tareas de agente especializadas, como indica NVIDIA NIM ("specialized agentic tasks").
- Manejo de contexto muy largo: hasta 1M tokens en configuraciones multi-GPU, útil para documentos extensos o conversaciones prolongadas.
- Capacidad de tool calling y function calling, implícita en su orientación a agentes (no documentada explícitamente en la model card).
- Generación de código y lenguajes de programación, mencionado en los idiomas soportados ("English (and coding languages)").
- Personalización mediante post-entrenamiento: SFT, RL (con NeMo RL y NeMo Gym) y destilación.

## Casos de uso

- Post-entrenamiento y fine-tuning: el modelo BF16 es el punto de partida ideal para aplicar SFT, RL o destilación sobre datos propios, gracias a su licencia permisiva y a su arquitectura eficiente.
- Adaptación a dominios especializados: se puede ajustar para sectores como legal, médico o financiero, donde se requiere conocimiento específico y razonamiento con contexto largo.
- Creación de variantes cuantizadas: los desarrolladores pueden generar sus propias versiones GGUF, NVFP4 u otras cuantizaciones a partir de estos pesos de referencia.
- Investigación y evaluación académica: al ser la versión de precisión completa, permite estudiar el comportamiento del modelo sin pérdidas por cuantización.
- Agentes conversacionales multilingües: su soporte para seis idiomas y su modo de razonamiento lo hacen adecuado para asistentes virtuales que requieren respuestas razonadas en varios idiomas.
- Análisis de documentos extensos: con hasta 1M tokens de contexto, puede procesar libros completos, expedientes o informes largos en una sola pasada, manteniendo coherencia global.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tablas de rendimiento comparativo (MMLU, HumanEval, GSM8K, etc.). NVIDIA NIM lo describe como el "modelo MoE 30B A3B más rápido con precisión líder en tareas de agente especializadas", pero no se proporcionan cifras concretas.

## Requisitos de hardware

- Inferencia en una sola GPU: 1× H100 80GB o 1× A100 80GB, con contexto validado de 256K tokens (limitado por memoria).
- Contexto completo de 1M tokens: requiere 8× H100 con tensor parallelism (TP8) y expert parallelism (EP), o hardware Blackwell (GB200, B200) con vLLM o SGLang.
- Hardware compatible: NVIDIA Blackwell (GB200, B200), Hopper (H100, H200) y Ampere (A100).
- VRAM estimada: los pesos BF16 ocupan aproximadamente 65.8 GB, por lo que se necesita al menos 80 GB de VRAM para la versión completa.
- Opciones de despliegue: vLLM (versión 0.27.1 o superior), SGLang, y para dispositivos locales con menos VRAM se recomienda la versión NVFP4 o GGUF (ejecutable en RTX 5090, DGX Spark, RTX 6000 Pro).
- Decodificación especulativa: DSpark para entornos de baja concurrencia en centro de datos.
- Parámetros de sampling recomendados: temperatura 1.0, top_p 0.95.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos en la información proporcionada. El modelo compite en la categoría de MoE eficientes de ~30B parámetros con 3B activos, similar a otros como Mixtral 8x7B (46.7B totales, 12.9B activos) o Qwen2.5-MoE-30B-A3B (30B totales, 3B activos). Sin embargo, la arquitectura híbrida con Mamba-2 y el soporte de contexto de 1M tokens lo diferencian de estos. No se puede realizar una comparación cuantitativa sin datos de rendimiento.

## Limitaciones y advertencias

- Sesgos: no se documentan sesgos específicos, pero al ser un modelo entrenado con datos web, puede heredar sesgos sociales, culturales o de género presentes en los datos de pre-entrenamiento.
- Riesgo de alucinación: como todo LLM, puede generar información falsa o inventada, especialmente en tareas de razonamiento complejo o con contexto ambiguo.
- Limitaciones de contexto: aunque soporta hasta 1M tokens, en una sola GPU H100/A100 el contexto validado se reduce a 256K, y el rendimiento puede degradarse con contextos muy largos.
- Restricciones de licencia: la licencia OpenMDW-1.1 permite uso comercial, pero es necesario revisar los términos completos en el enlace oficial para asegurar el cumplimiento, especialmente en redistribución o uso en productos propietarios.
- No es óptimo para inferencia directa en producción: la versión BF16 está pensada para personalización e investigación; para despliegue de baja latencia se recomienda la versión NVFP4 o GGUF.
- Idiomas limitados: aunque cubre seis idiomas, no incluye otros como chino, árabe o portugués, lo que puede ser una limitación para aplicaciones globales.
- Dependencia de hardware NVIDIA: el modelo está optimizado para GPUs NVIDIA y puede no funcionar correctamente en hardware de otros fabricantes.

## Enlaces

- Repositorio HuggingFace (este repo): https://huggingface.co/ashton25549/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16
- Repositorio oficial de NVIDIA (versión BF16): https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16
- Versión NVFP4 (inferencia optimizada): https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4
- Versión GGUF (para dispositivos locales): https://huggingface.co/ggml-org/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-GGUF
- Página de NVIDIA NIM: https://build.nvidia.com/nvidia/nemotron-3.5-lightning-30b-a3b
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Página de desarrollador de Nemotron: https://developer.nvidia.com/nemotron
