# ariacompute/qwen3-1.7b_q8

## Resumen

El modelo `ariacompute/qwen3-1.7b_q8` es una distribución cuantizada del modelo Qwen3-1.7B, desarrollado originalmente por el equipo Qwen de Alibaba Cloud y redistribuido por Aria Compute como un "aria-quant-bundle". Se trata de un Transformer denso decoder-only de 1.700 millones de parámetros, alineado mediante supervisión fina (SFT) y optimización directa de preferencias (DPO), que Aria Compute ha comprimido a 8 bits utilizando una receta de cuantización uniforme basada en rotación de Hadamard y codebooks Lloyd-Max con agrupación por grupos de tamaño 32. El resultado es un paquete de aproximadamente 1,9 GB (frente a los 3,4 GB del FP16), con calidad de generación casi sin pérdidas respecto al modelo original.

La relevancia de este modelo reside en su orientación a inferencia on-device en CPU, sin necesidad de GPU ni conexión a la nube. Está pensado para teléfonos móviles, dispositivos de borde y placas de bajo consumo como la Raspberry Pi 5. El bundle mantiene la licencia Apache 2.0 del modelo original, lo que facilita su uso comercial y su integración en proyectos propietarios.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dense Transformer decoder-only (28 capas, GQA) |
| Parametros totales | 1.700 millones (1.7B) |
| Parametros activos | no aplicable (modelo denso, no MoE) |
| Longitud de contexto | 4K tokens (según la model card, en el desglose de memoria) |
| Tipos de cuantizacion | 8-bit (q8) con codebooks por grupo (group_size=32), rotación Hadamard; RMSNorm y embeddings en FP16 |
| Idiomas soportados | inglés (principal), chino y más de 20 idiomas adicionales |
| Licencia | Apache 2.0 |
| Formato de pesos | aria-quant-bundle (formato propietario de Aria Engine; no safetensors ni GGUF) |

## Arquitectura y entrenamiento

Qwen3-1.7B es un Transformer denso decoder-only con 28 capas, atención por cabezas agrupadas (GQA) y embeddings atados de entrada y salida. El modelo base fue preentrenado sobre corpora públicos (RedPajama-Data-1T, The Pile, The Stack) y posteriormente alineado mediante SFT y DPO. La distribución de Aria Compute aplica una cuantización uniforme de 8 bits sobre las matrices de atención (Q/K/V/O) y de la FFN (up, gate, down), mientras preserva en FP16 las capas de normalización RMSNorm y la tabla de embeddings. La técnica de cuantización usa rotación de Hadamard antes del codebook Lloyd-Max, lo que elimina la necesidad de datos de calibración específicos de la tarea. Según los datos del autor, en el modelo de referencia qwen3-0.6B se obtiene una delta de log-probabilidad de +0.00685 respecto al FP16, considerada estadísticamente indistinguible de la precisión completa.

## Capacidades

- Generación de texto en inglés, chino y más de 20 idiomas adicionales.
- Chat conversacional y asistentes de diálogo multi-turno.
- Tool calling / function calling para integración con APIs móviles y de IoT.
- Generación de embeddings de texto ligeros para recuperación y clasificación on-device.
- Resumen de notificaciones, mensajes y contenido local.
- Completado de texto y predicción de frases en tiempo real.
- No soporta entrada multimodal (texto únicamente) ni procesamiento de audio.

## Casos de uso

- **Asistentes conversacionales on-device**: el modelo puede ejecutar diálogos multi-turno directamente en un smartphone o una Raspberry Pi, sin conexión a la nube, gracias a su tamaño reducido y su optimización para CPU. Es adecuado para aplicaciones de privacidad donde los datos no deben salir del dispositivo.
- **Automatización de atención al cliente**: con soporte de tool calling, el modelo puede gestionar consultas simples y derivar a sistemas externos mediante llamadas a funciones, todo en un entorno local.
- **Completado de texto en aplicaciones de escritura**: integrado en editores de texto o IDEs, puede sugerir frases o completar fragmentos de código cortos (funciones simples) sin latencia de red.
- **Resumen de notificaciones y mensajes**: en wearables o dispositivos de borde, el modelo puede generar resúmenes de contenido local (correos, mensajes) con un consumo de memoria inferior a 2,1 GB.
- **Embeddings para búsqueda local**: puede producir representaciones de texto para tareas de recuperación semántica en bases de datos de documentos personales o corporativos, sin depender de APIs externas.
- **Prototipado de aplicaciones de IA en educación**: su tamaño y licencia permiten su uso en proyectos académicos o de investigación en hardware de bajo coste, como Raspberry Pi 5, para experimentar con generación de texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El model-index del autor declara únicamente una métrica de consistencia de generación comparando con el modelo FP16 de referencia, pero el valor está pendiente de auditoría. Los datos de referencia de un modelo más pequeño (qwen3-0.6b_q8+group) son:

| Metrica | Valor |
|---|---|
| Token overlap medio (vs FP16) | 0.6429 |
| Exact prefix fraction | 0.3854 |
| Log-probability delta (vs FP16) | +0.00685 |

Estos valores indican una calidad de generación casi sin pérdida en el modelo de referencia, pero no se aplican directamente a este bundle hasta que se complete la auditoría.

## Requisitos de hardware

- **Memoria**: ~2.06 GB en runtime (1.9 GB de pesos en mmap + ~112 MB de KV cache + ~50 MB de overhead) a contexto de 4K tokens.
- **Plataformas viables**: smartphones de gama alta (8 GB RAM), smartphones de gama media (4-6 GB), Raspberry Pi 5 (4-8 GB). No recomendado para dispositivos con menos de 2 GB de RAM.
- **CPU**: inferencia exclusiva en CPU, sin GPU requerida. El runtime Aria Engine está optimizado para CPU.
- **Despliegue**: el paquete se descarga desde el dashboard de Aria Compute y se ejecuta con el runtime Aria Engine. No es compatible con vLLM, llama.cpp, Ollama ni TGI en su forma actual.
- **Latencia**: no se han publicado cifras de latencia o throughput para este modelo específico.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| **Qwen3-1.7B (FP16 original)** | 1.7B | FP16 | 4K | Apache 2.0 | Modelo base sin cuantizar, ~3.4 GB |
| **qwen3-1.7b_q8 (este modelo)** | 1.7B | 8-bit (q8) | 4K | Apache 2.0 | ~1.9 GB, casi sin pérdida, CPU-only |
| **qwen3-1.7b_q326_channel** | 1.7B | 3.26-bit por canal | 4K | Apache 2.0 | Receta recomendada para calidad de generación, menor tamaño |
| **qwen3-1.7b_q4** | 1.7B | 4-bit | 4K | Apache 2.0 | El paquete más pequeño de la serie |

Las alternativas de cuantización de Aria Compute ofrecen distintas compensaciones entre tamaño y fidelidad. La versión q8 es la de mayor fidelidad de la serie. No se dispone de comparativas con otros modelos de 1.7B de otros proveedores en la información proporcionada.

## Limitaciones y advertencias

- **Sesgos conocidos**: el modelo hereda los sesgos del preentrenamiento sobre corporativos públicos, por lo que puede reflejar estereotipos o contenido no deseado. No se han aplicado filtros adicionales.
- **Riesgo de alucinación**: como cualquier LLM, puede generar contenido factualmente incorrecto, especialmente en tareas de razonamiento complejo o síntesis de programas largos.
- **Limitaciones de contexto**: la ventana de contexto es de solo 4K tokens, lo que limita la gestión de documentos largos o conversaciones muy extensas.
- **Limitaciones de idioma**: el modelo está optimizado para inglés y chino; el rendimiento en otros idiomas puede ser inferior.
- **Restricciones de licencia**: la licencia Apache 2.0 permite uso comercial, pero el runtime Aria Engine es propiedad de Aria Compute y puede tener términos adicionales. La descarga requiere autenticación en el dashboard.
- **Caveats para producción**: no soporta inferencia por lotes ni aceleración GPU; el rendimiento en CPU puede ser limitado para cargas de trabajo de alta concurrencia. No es adecuado para aplicaciones de seguridad crítica sin supervisión humana.

## Enlaces

- [Hugging Face: ariacompute/qwen3-1.7b_q8](https://huggingface.co/ariacompute/qwen3-1.7b_q8)
- [Modelo base: Qwen/Qwen3-1.7B](https://huggingface.co/Qwen/Qwen3-1.7B)
- [Repositorio GitHub de Aria Compute](https://github.com/ariacompute/model/tree/main/qwen/qwen3-1.7b)
- [Repositorio oficial de Qwen3](https://github.com/QwenLM/Qwen3)
- [Qwen3-1.7B en Qualcomm AI Hub](https://aihub.qualcomm.com/compute/models/qwen3_1_7b)
- [Dashboard de Aria Compute](https://ariacompute.com/dashboard/models)
