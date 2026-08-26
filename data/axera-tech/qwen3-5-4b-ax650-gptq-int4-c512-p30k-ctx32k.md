# AXERA-TECH/Qwen3.5-4B-AX650-GPTQ-Int4-C512-P30k-CTX32k

## Resumen

El modelo AXERA-TECH/Qwen3.5-4B-AX650-GPTQ-Int4-C512-P30k-CTX32k es una variante cuantizada del modelo Qwen3.5-4B, optimizada por AXERA-TECH para el procesador neuronal AX650. Qwen3.5 es una familia de modelos multimodales de código abierto desarrollada por el laboratorio Tongyi de Alibaba Cloud, que emplea una arquitectura híbrida con attention lineal y mezcla de expertos (MoE) en sus versiones grandes. Esta variante concreta reduce el modelo a 4 mil millones de parámetros y lo cuantiza a 4 bits mediante GPTQ, lo que permite su despliegue en hardware de borde como el AX650, manteniendo una ventana de contexto de 32.000 tokens.

La relevancia de este modelo radica en su capacidad para ejecutar inferencia de lenguaje multimodal en dispositivos embebidos de bajo consumo, un nicho creciente en aplicaciones de visión artificial y procesamiento de lenguaje en el edge. La cuantización GPTQ-Int4 reduce el uso de memoria y acelera la inferencia sin degradación excesiva de calidad, mientras que la licencia MIT permite un uso comercial sin restricciones. Sin embargo, la model card publicada por AXERA-TECH no incluye detalles técnicos, benchmarks ni instrucciones de uso, lo que limita la evaluación directa de sus capacidades.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida (attention lineal + MoE) en la familia Qwen3.5; variante de 4B no especificada en detalle |
| Parámetros totales | 4.000 millones |
| Parámetros activos | No disponible |
| Longitud de contexto | 32.000 tokens (según el sufijo CTX32k) |
| Tipos de cuantización | GPTQ-Int4 |
| Idiomas soportados | No disponible; la familia Qwen3.5 soporta 201 idiomas |
| Licencia | MIT |
| Formato de pesos | safetensors (GPTQ) |

## Arquitectura y entrenamiento

La arquitectura exacta de este modelo de 4B no está documentada en la información disponible. La familia Qwen3.5, según la documentación de Radxa, utiliza una arquitectura híbrida que combina atención lineal con MoE (Mixture of Experts), alcanzando 397.000 millones de parámetros totales con 17.000 millones activos en su versión más grande. Sin embargo, esta variante de 4B podría ser una versión densa o una configuración reducida de la misma familia, y no se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset o el uso de técnicas como RLHF o DPO.

El proceso de cuantización GPTQ-Int4 aplicado por AXERA-TECH reduce la precisión de los pesos a 4 bits, con el objetivo de encajar el modelo en la memoria del NPU AX650. El sufijo del nombre (C512, P30k, CTX32k) sugiere una configuración específica de contexto (32k), prefijo (30k) y algún parámetro de caché (512), aunque el significado exacto de estos valores no está documentado. AXERA-TECH mantiene un repositorio de GitHub con herramientas de cuantización y exportación de visión para esta serie de modelos.

## Capacidades

- Generación de texto y razonamiento: al ser una variante de Qwen3.5, hereda las capacidades de razonamiento y generación de la familia, aunque la cuantización a 4 bits puede degradar ligeramente la calidad.
- Comprensión multimodal: la familia Qwen3.5 es nativamente multimodal (texto e imagen), pero no se confirma si esta variante de 4B conserva el encoder de visión.
- Soporte de tool calling y function calling: probablemente heredado de la base Qwen3.5, aunque no se documenta explícitamente.
- Capacidades de agente y razonamiento multi-paso: la familia Qwen3.5 está diseñada para tareas de agente, pero la versión cuantizada podría tener limitaciones.
- Multilingüismo: la familia soporta 201 idiomas; la variante de 4B no especifica qué idiomas conserva.
- Optimización para hardware embebido: el modelo está preparado para ejecutarse en el NPU AX650 de AXERA, lo que permite inferencia de baja latencia en dispositivos de borde.

## Casos de uso

- **Asistentes de voz y texto en dispositivos domésticos**: gracias a su tamaño reducido (4B cuantizado a 4 bits) y su optimización para el NPU AX650, puede ejecutarse en altavoces inteligentes o dispositivos IoT para ofrecer respuestas conversacionales con contexto de 32K tokens.
- **Atención al cliente automatizada en kioscos**: la ventana de 32K tokens permite mantener conversaciones largas y contextuales en entornos de retail o banca, con inferencia local sin dependencia de la nube.
- **Procesamiento de documentos en el borde**: con 32K tokens de contexto, puede resumir, extraer información o responder preguntas sobre documentos extensos directamente en el dispositivo, útil en escenarios de privacidad estricta.
- **Generación de código en entornos sin conexión**: aunque no se confirma el soporte de tool calling en esta variante, la base Qwen3.5 tiene buenas capacidades de programación; puede usarse para autocompletar código en editores locales con baja latencia.
- **Traducción automática en tiempo real**: con soporte multilingüe (si se conserva) y contexto largo, puede traducir conversaciones o documentos en dispositivos de traducción de bolsillo.
- **Prototipado de aplicaciones de IA en hardware de borde**: los desarrolladores pueden usar este modelo para validar funcionalidades de NLP en placas con AX650 antes de migrar a modelos más grandes en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K o métricas multimodales para esta variante cuantizada, ni comparaciones con otros modelos de tamaño similar. Se recomienda consultar el repositorio de AXERA-TECH o la documentación de Radxa para futuras actualizaciones.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con cuantización GPTQ-Int4, un modelo de 4B ocupa aproximadamente 2-2,5 GB de memoria. El tamaño del repositorio es de 7,6 GB (incluye pesos de cuantización y posiblemente otros archivos).
- **GPU recomendadas**: el modelo está optimizado para el NPU AX650 de AXERA, pero también puede ejecutarse en GPUs de consumo como NVIDIA RTX 3060 (12 GB), RTX 4060 (8 GB) o superiores. Para inferencia con contextos de 32K tokens, se recomienda al menos 8 GB de VRAM.
- **Cabe en consumer GPU**: sí, en GPUs con 8 GB o más de VRAM, aunque la ventana de 32K tokens puede requerir más memoria si se usa el contexto completo.
- **Opciones de despliegue**: llama.cpp, vLLM o TGI pueden cargar el formato GPTQ-Int4. Para el AX650, se necesita el SDK de AXERA y sus herramientas de conversión.
- **Latencia y throughput**: no disponible; dependen del hardware de destino. En el AX650, la latencia debería ser inferior a 100 ms por token para tareas de chat, pero no hay datos públicos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| Qwen3.5-4B-AX650-GPTQ-Int4-C512-P30k-CTX32k | 4B | 32K | GPTQ-Int4 | MIT | AX650, GPU |
| Qwen3.5-4B-AX650-GPTQ-Int4-C256-P16k-CTX20k | 4B | 20K | GPTQ-Int4 | MIT | AX650, GPU |
| Qwen3.5-4B-AX650-GPTQ-Int4-C128-P1152-CTX2047 | 4B | 2K | GPTQ-Int4 | MIT | AX650, GPU |
| Qwen3.5-4B (base, no cuantizado) | 4B | 32K | BF16/FP16 | Apache 2.0 | GPU |

Las variantes de AXERA se diferencian principalmente en la longitud de contexto y el prefijo optimizado. La versión de 32K es la más capaz para tareas de contexto largo, mientras que la de 2K está pensada para latencia mínima en tareas simples. La versión base sin cuantizar ofrece mayor calidad pero requiere más memoria y no está optimizada para el AX650.

## Limitaciones y advertencias

- **Cuántización de 4 bits**: la cuantización GPTQ-Int4 degrada la calidad de la generación y puede aumentar la tasa de alucinaciones en comparación con el modelo en BF16.
- **Falta de documentación**: la model card no incluye instrucciones de uso, dataset de entrenamiento ni benchmarks, lo que dificulta la evaluación de su rendimiento real.
- **Soporte de visión no confirmado**: aunque la familia Qwen3.5 es multimodal, no se confirma que esta variante de 4B conserve el encoder de visión, lo que podría limitar su uso en tareas de imagen.
- **Riesgo de sesgos**: la familia Qwen3.5 hereda los sesgos del entrenamiento de Alibaba Cloud, no se han publicado evaluaciones de sesgo para esta variante.
- **Licencia MIT**: permite uso comercial sin restricciones, pero no hay garantías de soporte por parte de AXERA-TECH o Alibaba.
- **Contexto de 32K tokens**: aunque es amplio, el uso completo del contexto con cuantización puede provocar problemas de memoria en hardware de borde, y la calidad de generación puede degradarse en las partes más alejadas del contexto.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/AXERA-TECH/Qwen3.5-4B-AX650-GPTQ-Int4-C512-P30k-CTX32k)
- [Variante con contexto 20K](https://huggingface.co/AXERA-TECH/Qwen3.5-4B-AX650-GPTQ-Int4-C256-P16k-CTX20k)
- [Variante con contexto 2K](https://huggingface.co/AXERA-TECH/Qwen3.5-4B-AX650-GPTQ-Int4-C128-P1152-CTX2047)
- [Repositorio GitHub de AXERA-TECH](https://github.com/AXERA-TECH/Qwen3_5.AXERA)
- [Documentación de Radxa sobre Qwen3.5](https://docs.radxa.com/en/aicore/ax-m1/VLM/qwen3.5)
- [Qwen3.5 en Ollama](https://ollama.com/library/qwen3.5:4b)
