# myhuggingbb/Qwen3.8-27B-NVFP4

## Resumen

El modelo `myhuggingbb/Qwen3.8-27B-NVFP4` es una cuantización NVFP4 (flotante de 4 bits) del modelo Qwen3.8-27B, desarrollada por Unsloth mediante su técnica Dynamic V3.0 (preview). Qwen3.8-27B es la última generación de la familia Qwen de Alibaba, un modelo denso de 27.000 millones de parámetros con arquitectura híbrida que combina atención lineal (Gated DeltaNet) y atención completa (Gated Attention). Incluye un codificador de visión nativo, soporte para imágenes y vídeo, y una ventana de contexto de 262.144 tokens ampliable hasta 1.000.000.

Esta versión cuantizada reduce el tamaño del modelo a 23,4 GB (frente a los más de 50 GB del original en FP16), lo que permite ejecutarlo en GPUs de consumo con 24 GB de VRAM o menos, manteniendo un rendimiento cercano al original. La licencia Apache 2.0 permite uso comercial sin restricciones, lo que la hace atractiva para despliegues en producción. La cuantización NVFP4 de Unsloth está optimizada para preservar la precisión en tareas de razonamiento, código y agentes, y es compatible con herramientas como vLLM, llama.cpp y Ollama.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder, híbrida (Gated DeltaNet + Gated Attention) |
| Parametros totales | 27B (modelo original); 19.869.895.952 en el archivo safetensors cuantizado |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens nativo, extensible hasta 1.000.000 con RoPE scaling (YaRN) |
| Tipos de cuantizacion | NVFP4 (flotante de 4 bits) |
| Idiomas soportados | No disponible en la información proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura híbrida que combina atención lineal y atención completa. La configuración incluye 64 capas con un layout de 16 bloques, cada uno compuesto por 3 subcapas de Gated DeltaNet seguidas de una capa de FFN, y una subcapa de Gated Attention adicional. La atención lineal (Gated DeltaNet) utiliza 48 cabezas para V y 16 para QK con dimensión 128, mientras que la atención completa (Gated Attention) usa 24 cabezas para Q y 4 para KV con dimensión 256 y RoPE de 64 dimensiones. El FFN tiene una dimensión intermedia de 17.408. Además, incorpora Multi-Token Prediction (MTP) entrenado con múltiples pasos para acelerar la inferencia.

El entrenamiento se realizó en dos fases: pre-entrenamiento y post-entrenamiento, aunque no se han publicado detalles sobre el volumen de datos, composición del dataset ni técnicas de alineación específicas (RLHF, DPO, etc.). La cuantización NVFP4 aplicada por Unsloth utiliza su Dynamic V3.0, que optimiza la asignación de bits por capa para minimizar la pérdida de precisión. El modelo resultante mantiene las capacidades completas del original, incluido el modo de pensamiento (thinking mode) y el soporte de visión.

## Capacidades

- Generación de texto y razonamiento complejo con control flexible del modo de pensamiento (activado por defecto, desactivable por petición, con ajuste de profundidad mediante `reasoning_effort` y preservación del contexto de razonamiento con `preserve_thinking`).
- Comprensión de visión nativa: procesa imágenes y vídeos, incluyendo diagramas STEM, documentos escaneados y vídeos de hasta una hora de duración.
- Soporte de tool calling y function calling mejorado, con parsing de objetos anidados para mayor fiabilidad en llamadas a herramientas.
- Capacidades de agente: planificación autónoma, manejo de feedback del entorno y ejecución de tareas multi-paso de larga duración.
- Generación de código y resolución de problemas de programación, con soporte para integración en herramientas como Codex.
- Multi-Token Prediction (MTP) para inferencia más rápida.
- Multilingüismo: no se especifican idiomas concretos en la información proporcionada, pero se espera que herede el soporte multilingüe de la familia Qwen.

## Casos de uso

- Atención al cliente automatizada: con 262K tokens de contexto nativo, el modelo puede gestionar conversaciones multi-turno extensas, recordar detalles de interacciones previas y ofrecer respuestas coherentes y contextualizadas. Su modo de pensamiento permite razonar sobre la mejor respuesta antes de generarla.
- Generación de código en producción: soporta tool calling y puede integrarse en pipelines de CI/CD para generar, revisar y corregir código. La cuantización NVFP4 permite ejecutarlo en GPUs de gama media, reduciendo costes de infraestructura.
- Análisis de documentos y extracción de información: el codificador de visión procesa imágenes de documentos, diagramas y tablas, extrayendo datos estructurados. Útil para automatizar la revisión de contratos, informes financieros o artículos científicos.
- Agentes autónomos de investigación: con contexto ampliable a 1M tokens y capacidades de planificación, puede realizar búsquedas, leer múltiples fuentes, resumir y sintetizar información en informes extensos. Su soporte para agentes lo hace adecuado para tareas de análisis de mercado o revisión bibliográfica.
- Análisis de vídeo para vigilancia o monitorización: procesa vídeos de larga duración (hasta una hora) para detectar eventos, transcribir diálogos o describir acciones. Útil en aplicaciones de seguridad, logística o producción audiovisual.
- Asistente de programación con razonamiento profundo: el modo de pensamiento permite depurar algoritmos complejos, explicar código y sugerir optimizaciones. La capacidad de tool calling facilita la ejecución de comandos o consultas a bases de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del autor no incluye métricas como MMLU, HumanEval, GSM8K o pruebas específicas de visión. Tampoco se proporcionan comparativas con el modelo original sin cuantizar ni con otras cuantizaciones.

## Requisitos de hardware

- Tamaño del repositorio: 23,4 GB (pesos en NVFP4). Para inferencia, se recomienda una GPU con al menos 24 GB de VRAM para cargar los pesos y dejar margen para activaciones y contexto.
- GPUs compatibles: NVIDIA RTX 4090 (24 GB), RTX 3090 (24 GB), A100 (40 GB), H100 (80 GB) o superiores. En GPUs con 16 GB podría ejecutarse con contexto reducido, pero no está garantizado.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI (Text Generation Inference) y Unsloth Desktop. La documentación de Unsloth indica soporte para ejecución y fine-tuning.
- Latencia y throughput: no se han publicado datos específicos. El uso de MTP y la cuantización NVFP4 deberían mejorar la velocidad de generación respecto al modelo en FP16, pero no hay cifras confirmadas.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa cuantitativa con modelos alternativos. La comparación natural sería con el modelo base Qwen3.8-27B sin cuantizar, que ofrece mayor precisión pero requiere aproximadamente el doble de VRAM (alrededor de 54 GB en FP16). Otras cuantizaciones como AWQ o GPTQ podrían ofrecer tamaños similares, pero no se han proporcionado datos de rendimiento relativo. Se recomienda consultar la documentación de Unsloth para benchmarks específicos de NVFP4 frente a otras técnicas.

## Limitaciones y advertencias

- Al ser una cuantización de 4 bits, puede existir una degradación leve en tareas de alta precisión numérica o razonamiento matemático complejo respecto al modelo original en FP16.
- No se han documentado sesgos específicos del modelo en la información proporcionada. Al ser un modelo reciente (2026), es posible que presente sesgos no evaluados en los datos de entrenamiento.
- El modo de pensamiento activado por defecto aumenta el número de tokens generados, lo que puede incrementar la latencia y el coste computacional. Se recomienda ajustar `reasoning_effort` según la tarea.
- La ventana de contexto de 262K tokens requiere una gestión cuidadosa de la memoria; para contextos superiores a este límite es necesario aplicar técnicas de RoPE scaling como YaRN, lo que puede afectar al rendimiento.
- No se especifican los idiomas soportados; aunque Qwen suele ser multilingüe, no hay confirmación oficial para esta versión.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos de la licencia del modelo base Qwen3.8-27B para asegurar el cumplimiento.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/myhuggingbb/Qwen3.8-27B-NVFP4)
- [Modelo base Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- [Guía de Unsloth para Qwen3.8](https://unsloth.ai/docs/models/qwen3.8)
- [Repositorio de Unsloth en GitHub](https://github.com/unslothai/unsloth/)
- [Comunidad Discord de Unsloth](https://discord.gg/unsloth)
