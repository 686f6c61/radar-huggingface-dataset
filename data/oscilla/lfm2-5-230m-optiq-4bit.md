# Oscilla/LFM2.5-230M-OptiQ-4bit

## Resumen

LFM2.5-230M-OptiQ-4bit es una cuantización mixta de precisión del modelo LFM2.5-230M de Liquid AI, publicada por el usuario Oscilla. El modelo base es el más pequeño de la línea LFM2.5, diseñado para dispositivos con presupuesto de memoria y cómputo muy ajustado, como teléfonos, portátiles Apple Silicon y soluciones on-device. La versión OptiQ reduce el peso en disco de 459 MB (bf16) a 180 MB, lo que permite cargarlo en memoria sin sacrificar demasiado rendimiento.

La arquitectura es híbrida, combinando bloques convolucionales con atención completa intercalada, lo que reduce el número de capas con cache KV y mejora la eficiencia en inferencia de contexto largo. El modelo soporta hasta 128k tokens de contexto y puede ejecutarse en Apple Silicon mediante MLX. Esta cuantización está pensada para desarrolladores que necesitan desplegar un modelo de lenguaje pequeño pero capaz de seguir instrucciones, realizar llamadas a herramientas y extraer datos en entornos con recursos limitados.

Su relevancia radica en que demuestra que modelos de 230M de parámetros pueden ofrecer un comportamiento útil en tareas de instrucción y matemáticas simples, aunque su rendimiento en razonamiento de contexto largo es muy limitado. La disponibilidad de cuantizaciones de 4 bits facilita su uso en dispositivos de consumo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: bloques convolucionales + atención completa (LFM2) |
| Parametros totales | 50.747.136 (según safetensors); el modelo base se denomina 230M |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | 128.000 tokens |
| Tipos de cuantizacion | 4-bit mixed-precision (OptiQ, sensibilidad por capa) |
| Idiomas soportados | No disponible |
| Licencia | LFM License 1.0 (lfm1.0) |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

La arquitectura LFM2 combina bloques de convolución con bloques de atención completa. Esto significa que solo una parte de las capas tiene cache de KV, lo que reduce el uso de memoria en inferencia con contexto largo. El modelo base LFM2.5-230M fue entrenado por Liquid AI con un enfoque en eficiencia para dispositivos de borde, aunque no se han publicado detalles sobre el volumen exacto de tokens de entrenamiento ni el proceso de alineación (RLHF/DPO) en la información disponible. La cuantización OptiQ aplica una asignación de bits por capa basada en la sensibilidad medida respecto a una referencia bf16, lo que permite mantener la calidad en las capas críticas mientras se reduce el peso en las demás.

El modelo base admite tool calling mediante una sintaxis especial entre tokens `<|tool_call_start|>` y `<|tool_call_end|>`, y el template de chat se integra con la función `apply_chat_template` de MLX. No se han publicado detalles sobre el dataset de entrenamiento ni sobre técnicas de alineación específicas más allá de las mencionadas.

## Capacidades

- Generación de texto y conversación multi-turno con contexto hasta 128k tokens.
- Razonamiento matemático básico, con puntuación de 26.0% en GSM8K.
- Instrucción y seguimiento de órdenes (60.4% en IFEval strict).
- Tool calling / function calling mediante sintaxis Pythonica entre tokens especiales.
- Soporte de agentes y multi-step reasoning limitado, dado el tamaño reducido.
- Multilingüismo no documentado en la información disponible.
- No incluye capacidades de visión ni audio.

## Casos de uso

- **Extracción de datos en dispositivos móviles**: el modelo puede procesar documentos y extraer campos relevantes en tiempo real en un teléfono, gracias a su tamaño de 180 MB y su baja huella de memoria.
- **Asistentes conversacionales de borde**: en un asistente de voz local, el modelo gestiona conversaciones multi-turno con una ventana de contexto amplia (128k) sin depender de servidores externos.
- **Automatización de tareas de bajo nivel**: como clasificación de correos, generación de respuestas cortas o resumen de texto, donde el coste de inferencia es mínimo.
- **Prototipado de agentes con tool calling**: se puede integrar en un entorno de desarrollo para probar flujos de agentes que llaman a funciones como `get_weather` o `search_web`, gracias a su soporte nativo de tool calls.
- **Despliegue en Apple Silicon**: al ser un modelo MLX, se puede ejecutar en cualquier Mac con chip M1 o superior, incluso con poca RAM, para aplicaciones de productividad local.
- **Fine-tuning de bajo coste**: al ser pequeño, se puede ajustar con pocos datos y recursos para tareas específicas de dominio, como clasificación de textos o extracción de entidades.

## Benchmarks y rendimiento

El autor de la cuantización publicó una evaluación estándar de OptiQ con seis métricas:

| Métrica | Resultado |
|---|---|
| MMLU (5-shot, 969 muestras) | 34.2% |
| GSM8K (1000 muestras) | 26.0% |
| IFEval (full set, strict) | 60.4% |
| BFCL-V3 simple (200 llamadas) | 18.0% |
| HumanEval (164 problemas, pass@1) | 10.4% |
| HashHop (long-context retrieval) | 0.0% |
| **Capability Score (media)** | **24.83** |

Estos resultados muestran que el modelo es débil en recuperación de información en contexto largo (HashHop 0%) y en razonamiento matemático avanzado (GSM8K 26%), pero aceptable en seguimiento de instrucciones (IFEval 60.4%). No se dispone de comparación con otros modelos en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: aproximadamente 180 MB en disco, por lo que en memoria de GPU se necesitan menos de 200 MB para inferencia en 4 bits.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1060, Apple Silicon con memoria unificada). En Apple Silicon, se ejecuta directamente en la memoria unificada.
- Cabe en cualquier GPU de consumo actual, incluso en integradas de gama baja.
- Opciones de despliegue: MLX (con `mlx_lm` o `mlx_optiq`), servidor local con `optiq serve`, y posiblemente conversión a GGUF para llama.cpp, aunque no se documenta.
- Latencia y throughput: no hay datos oficiales, pero por su tamaño se espera una generación de decenas de tokens por segundo en Apple Silicon M1 o superior.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (tamaño ~230M, cuantización 4 bits, arquitectura híbrida). Los modelos más cercanos serían otros LLM pequeños como Gemma-2-2B o TinyLlama-1.1B, pero con tamaño y arquitectura diferentes. No se puede establecer una comparación directa sin datos de referencia.

## Limitaciones y advertencias

- Rendimiento muy bajo en tareas de recuperación de contexto largo (HashHop 0.0%), lo que indica que no es fiable para consultas que requieran buscar información a lo largo de 128k tokens.
- Capacidad de razonamiento matemático y código limitada (GSM8K 26%, HumanEval 10.4%), no adecuado para tareas de programación avanzada.
- Riesgo de alucinación y errores de hecho, especialmente en temas fuera de su dominio de entrenamiento.
- La licencia LFM 1.0 puede tener restricciones para uso comercial; se recomienda revisar los términos en el enlace oficial.
- El modelo no documenta idiomas soportados, por lo que su comportamiento en español u otros idiomas no está garantizado.
- El formato de pesos es MLX (safetensors), no compatible directamente con frameworks como PyTorch o TensorFlow sin conversión previa.
- La discrepancia entre el número de parámetros reportado (230M) y el archivo safetensors (50.7M) sugiere que el archivo puede estar incompleto o que la cuantización solo guarda una parte de los pesos; verificar la integridad antes de usar en producción.

## Enlaces

- [Modelo cuantizado en Hugging Face (Oscilla)](https://huggingface.co/Oscilla/LFM2.5-230M-OptiQ-4bit)
- [Modelo cuantizado en mlx-community](https://huggingface.co/mlx-community/LFM2.5-230M-OptiQ-4bit)
- [Modelo base LFM2.5-230M](https://huggingface.co/LiquidAI/LFM2.5-230M)
- [Documentación oficial de LFM2.5-230M](https://docs.liquid.ai/lfm/models/lfm25-230m)
- [Blog de Liquid AI sobre LFM2.5-230M](https://www.liquid.ai/blog/lfm2-5-230m)
- [Proyecto mlx-optiq](https://mlx-optiq.com)
- [Licencia LFM 1.0](https://www.liquid.ai/lfm-license)
