# litert-community/Qwen3.5-2B

## Resumen

Qwen3.5-2B es una conversión del modelo Qwen3.5-2B de Alibaba al formato LiteRT-LM (`.litertlm`) realizada por la comunidad litert-community para inferencia on-device con el runtime LiteRT-LM de Google. Se trata de un modelo multimodal (imagen y texto) con arquitectura híbrida que combina capas de atención lineal GatedDeltaNet con capas de atención completa. La conversión incluye dos variantes: una exclusivamente textual y otra con componente de visión (ViT de 24 capas). Su relevancia radica en que permite ejecutar un modelo de 2.000 millones de parámetros en dispositivos móviles con un uso de memoria casi independiente de la longitud de contexto, gracias al estado recurrente de las capas de atención lineal. El modelo base soporta 262.144 tokens de contexto nativo, aunque esta conversión limita el presupuesto de KV a 4.096 tokens en las capas de atención completa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: GatedDeltaNet (atención lineal) intercalada con atención completa; 18 capas lineales + 6 capas de atención completa |
| Parametros totales | 2.000 millones (2B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens (modelo base), 4.096 tokens de presupuesto KV en la conversión LiteRT |
| Tipos de cuantizacion | int8 dinámico en capas lineales y embeddings; convoluciones y regla delta en float; activaciones fp32 |
| Idiomas soportados | No disponible (el modelo base es multilingüe, pero la conversión no especifica la lista) |
| Licencia | Apache-2.0 |
| Formato de pesos | LiteRT-LM (`.litertlm`) |

## Arquitectura y entrenamiento

El modelo original Qwen3.5-2B es una arquitectura híbrida que intercala bloques de atención lineal GatedDeltaNet (con una regla delta y estado recurrente de tamaño constante por capa) con bloques de atención completa (gated full-attention). En esta variante de 2B, hay 18 bloques de atención lineal y 6 bloques de atención completa. Los bloques de atención lineal no generan un KV cache que crece con la longitud del contexto, sino que mantienen un estado recurrente de tamaño fijo, lo que mantiene el consumo de memoria casi plano. Solo los 6 bloques de atención completa conservan un KV cache, con un presupuesto de 4.096 tokens en esta conversión. El checkpoint original es multimodal e incluye un ViT de 24 capas. La conversión LiteRT-LM ofrece dos versiones: una textual (sin el ViT) y otra con visión (que añade el ViT en fp16). El proceso de conversión mantiene la paridad logits con el modelo PyTorch original, verificada con 100% de acuerdo top-1 y top-5 en 48 posiciones.

## Capacidades

- Generación de texto y razonamiento: el modelo es capaz de mantener conversaciones multi-turno, como se verifica en las pruebas de cordura (8/8 preguntas en CPU y GPU).
- Capacidad multimodal (solo en la variante VL): procesamiento de imágenes mediante el ViT de 24 capas, con entrada estática de 512×512 píxeles.
- Multilingüe: el modelo base de Qwen3.5 es multilingüe, aunque la conversión no detalla los idiomas específicos.
- No incluye tool calling ni function calling: el bundle simplificado de ChatML no incluye secciones de herramientas.
- Modo de pensamiento (thinking) desactivado: el template usa un bloque vacío de `thinking` para simular el modo no-thinking del template original.
- El modelo reproduce fielmente el comportamiento del modelo original, incluyendo errores aritméticos (verificado en la prueba de iPhone).

## 6. Casos de uso

- **Asistente virtual en móvil**: el modelo puede ejecutarse en iPhone (GPU Metal) o en Android de gama alta, ofreciendo respuestas de texto con una velocidad de decodificación de 24,3 tokens/s en iPhone 17 Pro, suficiente para interacciones en tiempo real.
- **Atención al cliente automatizada**: al mantener un estado de conversación multi-turno correctamente, puede gestionar diálogos largos sin degradación de memoria, gracias al estado de tamaño constante de las capas lineales.
- **Análisis de imágenes en el dispositivo**: la variante vision permite extraer información de imágenes (por ejemplo, OCR, descripción de escenas) sin conexión a internet, ideal para aplicaciones de asistencia o documentación.
- **Generación de código en entornos de desarrollo móvil**: aunque no soporta tool calling, puede generar fragmentos de código y explicaciones técnicas, con un rendimiento de prefill de 237,7 tokens/s en GPU móvil.
- **Resumen de documentos**: con la ventana de contexto de 4.096 tokens para las capas de atención completa, puede resumir documentos cortos o secciones de texto, aunque no es adecuado para contextos muy largos.
- **Sistemas de respuestas a preguntas (Q&A)**: en aplicaciones de consulta de información, el modelo puede responder preguntas factuales con baja latencia (TTFT de 0,73 s en iPhone GPU), como se muestra en la prueba de capital de Francia.

## 7. Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Sin embargo, la model card incluye mediciones de rendimiento de inferencia en diferentes plataformas:

| Entorno | Backend | Prefill (256 tokens) | Decode | TTFT | Memoria pico |
|---|---|---|---|---|---|
| Apple M4 Max | GPU | 1486 tok/s | 114,3 tok/s | 0,18 s | no disponible |
| Apple M4 Max | CPU | 592 tok/s | 37,6 tok/s | 0,46 s | no disponible |
| iPhone 17 Pro | GPU (Metal) | 237,7 tok/s | 24,3 tok/s | 0,73 s | 5,33 GB |
| iPhone 17 Pro | CPU | 206,5 tok/s | 16,2 tok/s | 0,77 s | 1,52 GB |

Además, se verificó la paridad logits con PyTorch (acuerdo top-1 y top-5 del 100%, Pearson 1,0000) y se pasaron pruebas de robustez de longitud de prompt (40/40 en CPU, 20/20 en GPU).

## 8. Requisitos de hardware

- **iPhone 17 Pro (GPU Metal)**: pico de memoria 5,33 GB; requiere compilación de programas Metal en el primer lanzamiento (~60 s). Decode de 24,3 tok/s.
- **iPhone 17 Pro (CPU)**: pico de memoria 1,52 GB; decode de 16,2 tok/s.
- **Android**: la GPU no cabe en dispositivos de 8 GB de RAM (p. ej., Pixel 8a) por el uso de activaciones fp32 que expanden los buffers de pesos; se recomienda al menos 12 GB de RAM para GPU. En CPU, la caché de pesos XNNPACK necesita aproximadamente otro tamaño de fichero de almacenamiento libre.
- **GPU Qualcomm Adreno**: no se ha verificado la ejecución GPU; se recomienda usar el backend CPU en dispositivos Snapdragon hasta confirmar compatibilidad.
- **Despliegue**: requiere el runtime LiteRT-LM ≥ 0.15 (versiones 0.15.0 y 0.16.0 verificadas). No es compatible con vLLM, llama.cpp u Ollama en este formato.

## 9. Comparativa con modelos similares

No se dispone de datos comparativos de rendimiento en benchmarks estándar. La conversión pertenece a la misma familia que las versiones de 0.8B y 4B de Qwen3.5 convertidas por la misma comunidad. El modelo base Qwen3.5-2B es comparable en tamaño a otros modelos de 2B, pero la conversión LiteRT se centra en despliegue on-device, no en rendimiento de servidor. No se pueden proporcionar comparaciones cuantitativas fiables sin datos de benchmarks.

## 10. Limitaciones y advertencias

- **Presupuesto KV limitado**: aunque el modelo base soporta 262.144 tokens, esta conversión solo reserva 4.096 tokens para las capas de atención completa, lo que limita la capacidad de manejar contextos muy largos.
- **Activaciones fp32**: la inferencia GPU utiliza activaciones fp32, lo que multiplica el consumo de memoria (5,33 GB en iPhone) y no es eficiente en dispositivos con poca RAM.
- **Template de chat simplificado**: el bundle no incluye tool calling ni secciones de visión; el template ChatML es una versión reducida que puede no ser compatible con todos los usos.
- **Errores del modelo original**: la conversión reproduce fielmente los errores del modelo base (p. ej., errores aritméticos), lo que puede ser inaceptable en aplicaciones que requieran exactitud.
- **Soporte GPU limitado**: no se ha verificado en GPU Adreno (Qualcomm); solo se ha probado en Metal (Apple) y OpenCL (Arm Mali). En Android, el GPU no cabe en dispositivos de 8 GB.
- **Alucinación**: como cualquier modelo de lenguaje, puede generar respuestas incorrectas o inventadas, especialmente en contextos no cubiertos por el entrenamiento.
- **Licencia**: Apache-2.0 permite uso comercial, pero se debe verificar la licencia del modelo base original (Qwen3.5) para cumplir con los términos de Alibaba.

## 11. Enlaces

- [Página del modelo en Hugging Face](https://huggingface.co/litert-community/Qwen3.5-2B)
- [Versión LiteRT en Hugging Face](https://huggingface.co/litert-community/Qwen3.5-2B-LiteRT)
- [Modelo base Qwen3.5-2B en Hugging Face](https://huggingface.co/Qwen/Qwen3.5-2B)
- [Repositorio LiteRT-LM en GitHub](https://github.com/google-ai-edge/litert-lm)
- [Ficha en Qualcomm AI Hub](https://aihub.qualcomm.com/iot/models/qwen3_5_2b)
- [Ficha en LM Studio](https://lmstudio.ai/models/qwen/qwen3.5-2b)
- [Versión en ModelScope](https://www.modelscope.cn/models/litert-community/Qwen3.5-2B-LiteRT)
