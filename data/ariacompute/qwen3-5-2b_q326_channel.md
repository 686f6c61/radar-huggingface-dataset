# ariacompute/qwen3.5-2b_q326_channel

## Resumen

Qwen3.5-2B es un modelo de lenguaje denso de 2.000 millones de parámetros desarrollado por el equipo Qwen de Alibaba Cloud. Utiliza una arquitectura híbrida de Transformer decoder-only que combina capas de atención lineal DeltaNet con capas de atención completa en una proporción 3:1, lo que permite manejar una ventana de contexto nativa de 256.000 tokens. El modelo ha sido preentrenado sobre corpus públicos diversos y alineado mediante SFT y DPO, y está disponible bajo licencia Apache 2.0.

La distribución `ariacompute/qwen3.5-2b_q326_channel` es un paquete cuantizado publicado por Aria Compute, que aplica rotación de Hadamard y cuantización por código Lloyd-Max con códigos por canal. El objetivo es permitir inferencia solo CPU en dispositivos móviles, edge y placas de bajo consumo, sin necesidad de GPU ni conexión en la nube. El bundle reduce el peso original de aproximadamente 4 GB a unos 1,2 GB, manteniendo la calidad de generación pendiente de auditoría formal.

Este lanzamiento es relevante porque democratiza el uso de modelos de contexto largo en hardware de gama baja, con un consumo de memoria de unos 1,5 GB, lo que lo hace viable en smartphones de gama media, Raspberry Pi 5 y otros dispositivos periféricos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso híbrido (DeltaNet + atención completa, ratio 3:1) |
| Parametros totales | 2.000 millones (2B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 256.000 tokens nativos |
| Tipos de cuantizacion | Mixta: 4 bits para pesos de atención (Q/K/V/O), ~3 bits para pesos FFN (up/gate/down), FP16 para RMSNorm y tabla de embeddings |
| Idiomas soportados | Inglés (principal), chino y más de 20 idiomas adicionales (según la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible (bundle de aria-engine, formato propietario de Aria Compute) |

## Arquitectura y entrenamiento

Qwen3.5-2B emplea una arquitectura de Transformer denso decoder-only con una combinación de capas de atención lineal DeltaNet y capas de atención completa. Según la información disponible, la configuración es de 24 capas, tamaño oculto de 2048, dimensión de FFN de 6144, 8 cabezas de consulta y 2 cabezas de valor clave (GQA con grupo 4), con dimensión de cabeza de 256. La mezcla de capas sigue un patrón 6× (3×DeltaNet → FFN → 1×Attention → FFN), lo que permite un procesamiento eficiente de contextos largos con menor coste computacional.

El modelo base fue preentrenado por el equipo de Qwen sobre corpus públicos como RedPajama-Data-1T, The Pile y The Stack, y posteriormente alineado mediante SFT y DPO. La versión cuantizada publicada por Aria Compute aplica una receta de cuantización mixta con rotación de Hadamard y cuantización por código Lloyd-Max por canal, sin necesidad de datos de calibración específicos. Esta técnica preserva los pesos de RMSNorm y la tabla de embeddings en FP16, mientras que los pesos de atención se cuantifican a 4 bits y los de FFN a aproximadamente 3 bits.

## Capacidades

- Generación de texto y chat conversacional en múltiples turnos, con soporte de contexto largo (hasta 256K tokens).
- Completado de código en tiempo real, incluyendo generación de código multi-línea.
- Llamada a herramientas (tool calling / function calling) para integración con APIs móviles y de IoT.
- Generación de embeddings de texto ligeros para tareas de recuperación y clasificación en el dispositivo.
- Resumen de texto de longitud corta y media, como notificaciones, mensajes y contenido local.
- Capacidad de análisis de documentos locales mediante procesamiento por fragmentos (chunked) dentro del límite de contexto.
- Modelo exclusivamente de texto; no soporta entrada multimodal ni audio.

## Casos de uso

- **Asistente conversacional offline en móviles**: el modelo puede ejecutarse localmente en un smartphone con 4-6 GB de RAM, ofreciendo respuestas de chat sin conexión. Su ventana de contexto de 256K permite mantener conversaciones largas sin perder el hilo.
- **Completado de código en entornos de desarrollo embebido**: gracias a su capacidad de generar código y a la compatibilidad con tool calling, puede integrarse en editores de código para sugerencias en tiempo real en dispositivos de baja potencia, como Raspberry Pi.
- **Atención al cliente automatizada en IoT**: en pasarelas domésticas o dispositivos de borde, el modelo puede gestionar consultas de usuarios sobre el estado de dispositivos, con soporte de llamadas a funciones para interactuar con APIs locales.
- **Análisis de documentos locales**: con su contexto amplio, permite resumir y extraer información de documentos de hasta 256K tokens, procesándolos por fragmentos en un dispositivo sin conexión.
- **Clasificación y recuperación de información**: mediante embeddings ligeros, puede realizar búsquedas semánticas locales en bases de datos de mensajes o contactos, sin enviar datos al servidor.
- **Asistente de escritura en entornos con recursos limitados**: generación de borradores de correos, mensajes o informes breves en dispositivos de gama baja, gracias a su bajo consumo de memoria (~1,5 GB).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo-index de la tarjeta de Hugging Face solo incluye una métrica de "Generation Consistency (vs FP16, method reference)" con el valor "awaiting gen_quant_eval audit" y no está verificada. No hay datos de MMLU, HumanEval, GSM8K ni otros benchmarks estándar para esta versión cuantizada.

## Requisitos de hardware

- **Memoria total estimada**: ~1,5 GB en contexto de 4K tokens (desglose: ~1,2 GB de pesos cuantizados en mmap + ~96 MB de KV cache + ~80 MB de runtime + ~120 MB de overhead de códigos).
- **GPU**: no se requiere; el modelo está diseñado para ejecutarse solo en CPU. No se menciona compatibilidad con GPU.
- **Dispositivos compatibles**: smartphones de gama alta (8 GB RAM) y gama media (4-6 GB), Raspberry Pi 5 / SBC (4-8 GB), dispositivos con 2-3 GB de RAM funcionan con limitaciones; IoT gateway y wearables con 1-2 GB no son suficientes.
- **Opciones de despliegue**: el runtime es el Aria Engine (aria-compute.com), que permite inferencia en CPU sin conexión. No se mencionan otros frameworks como vLLM, llama.cpp u Ollama.
- **Latencia y throughput**: no se han publicado datos específicos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de comparativas directas con otros modelos de tamaño similar en la información proporcionada. El propio modelo base, Qwen3.5-2B, está disponible sin cuantizar en Hugging Face, pero no se han aportado métricas comparativas. Otras versiones cuantizadas del mismo modelo (como `qwen3.5-2b_q8` y `qwen3.5-2b_q4`) se mencionan como alternativas, pero sin datos de rendimiento comparativo. Por tanto, la comparativa con modelos de la misma categoría (por ejemplo, Llama 3.2 3B o Qwen3-1.7B) no está disponible.

## Limitaciones y advertencias

- **Calidad de generación no auditada**: la consistencia de generación frente a FP16 está pendiente de auditoría; no se puede garantizar la fidelidad de las respuestas en comparación con el modelo original.
- **Riesgo de alucinación**: como modelo de 2B parámetros, puede generar contenido plausible pero incorrecto, especialmente en tareas de razonamiento complejo o matemáticas avanzadas.
- **Limitaciones de idioma**: aunque se declaran más de 20 idiomas, el entrenamiento principal es en inglés y chino; el rendimiento en otros idiomas puede ser inferior.
- **Solo texto**: no soporta entrada de imágenes, audio ni video, limitando su uso en aplicaciones multimodales.
- **No apto para generación de texto largo**: la documentación advierte que no se recomienda para escritura creativa de más de 4K tokens por generación.
- **Uso en producción**: no se recomienda para despliegues con inferencia por lotes o aceleración GPU; está orientado a inferencia single-prompt en CPU.
- **Licencia**: Apache 2.0 permite uso comercial, pero la distribución cuantizada es proporcionada por Aria Compute y su uso puede estar sujeto a las condiciones de su plataforma.

## Enlaces

- [Hugging Face - ariacompute/qwen3.5-2b_q326_channel](https://huggingface.co/ariacompute/qwen3.5-2b_q326_channel)
- [GitHub - ariacompute/model (directorio qwen3.5-2b)](https://github.com/ariacompute/model/tree/main/qwen/qwen3.5-2b)
- [Aria Compute Dashboard](https://ariacompute.com/dashboard/models)
- [Aria Engine](https://ariacompute.com)
- [Repositorio original de Qwen3.5](https://github.com/QwenLM/Qwen3.5)
- [Qwen3.5-2B en Qualcomm AI Hub](https://aihub.qualcomm.com/models/qwen3_5_2b)
- [Qwen3.5-2B - Especificaciones en APXML](https://apxml.com/models/qwen35-2b)
