# orsubharath193/qwen3.50.8oblt

## Resumen

El modelo `orsubharath193/qwen3.50.8oblt` es una versión de 0.75B parámetros (752.393.024) de la serie Qwen3.5 de Alibaba Cloud, publicada bajo licencia Apache-2.0 en formato safetensors. Se trata de un modelo compacto orientado a despliegue en dispositivos de borde, según la información de Qualcomm AI Hub, que lo describe como parte de la serie Qwen3.5 con arquitectura híbrida que combina atención lineal con transformadores tradicionales. Esta serie es nativamente multimodal (texto, imagen, video), aunque la variante de 0.8B está diseñada para escenarios de baja latencia y recursos limitados.

La relevancia actual radica en que Qwen3.5 es la última generación de modelos abiertos de Alibaba, con mejoras en razonamiento y seguimiento de instrucciones respecto a Qwen3, y esta versión específica ofrece un tamaño reducido que permite su despliegue en hardware de consumo o dispositivos de borde. La información disponible no incluye detalles sobre el contexto máximo, idiomas soportados ni datos de entrenamiento específicos para esta variante.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: atención lineal + transformadores (según serie Qwen3.5) |
| Parametros totales | 752.393.024 (0,75B) |
| Parametros activos | no disponible (no se especifica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (formato safetensors, sin indicación de cuantizaciones) |
| Idiomas soportados | no disponible (serie Qwen3.5 es multilingüe, pero no se confirma para esta variante) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repo de 1,5 GB) |

## Arquitectura y entrenamiento

Según la información pública de la serie Qwen3.5, el modelo emplea una arquitectura híbrida que mezcla atención lineal con bloques transformadores tradicionales, lo que reduce el coste computacional en tareas de contexto largo manteniendo capacidad de razonamiento. No se dispone de datos específicos sobre el entrenamiento de esta variante de 0.8B: no se indica el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. La serie Qwen3.5 se describe como nativamente multimodal (texto, imagen, video), aunque para este tamaño concreto no se confirma si el modelo final incluye módulos de visión.

## Capacidades

- Generación de texto y razonamiento básico, según la serie Qwen3.5 que mejora sobre Qwen3 en instrucciones y razonamiento.
- Soporte de tool calling / function calling: no confirmado explícitamente para esta variante.
- Capacidades de agente: la serie Qwen3.5 está orientada a agentes, pero no hay datos específicos para el modelo de 0.8B.
- Multilingüismo: la serie es multilingüe, pero no se especifican idiomas concretos.
- Capacidades multimodales: la serie Qwen3.5 es nativamente multimodal (texto, imagen, video), pero no se confirma si esta variante de 0.8B incluye visión.
- Modo thinking: no disponible en la información.

## Casos de uso

- **Despliegue en dispositivos de borde**: su tamaño de 0,75B permite ejecutarlo en hardware de consumo (Raspberry Pi 5, Jetson Nano) para tareas de generación de texto en local.
- **Asistentes de voz en dispositivos móviles**: con cuantización y optimización, puede servir como backend de asistentes en smartphones sin conexión a la nube.
- **Preprocesamiento de texto en pipelines de datos**: para clasificación, extracción de entidades o resumen de textos cortos en entornos con restricción de recursos.
- **Prototipado rápido**: por su tamaño y licencia Apache-2.0, es adecuado para pruebas de concepto en entornos de investigación sin necesidad de GPUs de alto rendimiento.
- **Traducción automática en tiempo real**: si el modelo soporta multilingüismo (aunque no confirmado), podría usarse para traducción en dispositivos con baja latencia.
- **Generación de código en entornos con recursos limitados**: para autocompletado o generación de snippets en IDEs ligeros, aunque no se confirma capacidad de code generation específica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se han encontrado datos de MMLU, HumanEval, GSM8K ni otras evaluaciones para este modelo concreto.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con 0,75B de parámetros y pesos en FP16, se estima que requiere aproximadamente 1,5-2 GB de VRAM (cálculo: 0,75B × 2 bytes = 1,5 GB). Con cuantización INT8 o INT4, podría reducirse a ~0,75 GB.
- **GPU recomendadas**: cualquier GPU con al menos 2 GB de VRAM (GTX 1050 Ti, RTX 2050) o incluso CPU con suficiente RAM.
- **Compatibilidad con consumer GPU**: sí, cabe en GPUs de gama baja y media (RTX 3060, RTX 4060, etc.).
- **Opciones de despliegue**: llama.cpp, Ollama, vLLM (para GPU), TGI (si se adapta). No se confirma soporte específico para este modelo en estas herramientas.
- **Latencia y throughput**: no disponible. Se estima baja latencia (< 50 ms por token en GPU moderna) pero no hay datos oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Arquitectura | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-0.8B (este modelo) | 0,75B | no disponible | Apache-2.0 | Híbrida (linear+transformer) | HuggingFace |
| Qwen3-0.6B (de la serie Qwen3) | 0,6B | no disponible | Apache-2.0 | Transformer estándar | HuggingFace |
| Llama-3.2-1B | 1,23B | 128K | Llama 3.2 License | Transformer estándar | HuggingFace |

No hay datos de rendimiento comparativo disponibles para este modelo. La comparación se basa únicamente en tamaño y licencia.

## Limitaciones y advertencias

- **Sesgos conocidos**: no se ha publicado información específica sobre sesgos, pero al ser un modelo de lenguaje de Alibaba, podría heredar sesgos de los datos de entrenamiento de Qwen3.5.
- **Riesgo de alucinación**: como cualquier modelo de 0,75B, tiene capacidad limitada para tareas complejas de razonamiento y puede generar información falsa.
- **Limitaciones de contexto**: al no especificar la longitud de contexto, se recomienda asumir una ventana corta (probablemente ≤ 8K tokens) para evitar degradación.
- **Restricciones de licencia**: Apache-2.0 permite uso comercial, pero se debe verificar que el modelo no contenga componentes con otras licencias.
- **Caveat para producción**: el modelo no tiene documentación oficial de Alibaba (no aparece en el blog oficial de Qwen), por lo que su calidad y soporte no están garantizados. Se recomienda validar en tareas concretas antes de desplegar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/orsubitrat193/qwen3.50.8oblt
- Página de Qualcomm AI Hub para Qwen3.5-0.8B: https://aihub.qualcomm.com/compute/models/qwen3_5_0_8b
- Blog de Qwen sobre Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Guía de Qwen3.5 en qwen-ai.com: https://qwen-ai.com/qwen-3-5/
- Comunicado de Alibaba Group sobre Qwen3.5: https://www.alibabagroup.com/document-1960233590314762240
- Modelo original Qwen3-8B (referencia): https://huggingface.co/Qwen/Qwen3-8B
