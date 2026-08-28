# Oscilla/Ministral-3-3B-Instruct-2512-mlx-4Bit

## Resumen

El modelo Oscilla/Ministral-3-3B-Instruct-2512-mlx-4Bit es una conversión al formato MLX (4-bit) del modelo original mistralai/Ministral-3-3B-Instruct-2512, desarrollado por Mistral AI. Se trata de un modelo compacto de la familia Ministral 3, diseñado para despliegue en dispositivos con recursos limitados (edge, on-device) y para tareas de instrucción y diálogo multilingüe. La conversión ha sido realizada por el usuario Oscilla utilizando mlx-lm versión 0.31.2, lo que permite ejecutar el modelo de forma eficiente en hardware Apple Silicon (Macs con chip M-series).

El modelo base combina un modelo de lenguaje de aproximadamente 3.4 mil millones de parámetros con un codificador de visión de 0.4 mil millones de parámetros, lo que le confiere capacidades multimodales (texto e imagen). La versión MLX 4-bit reduce el tamaño del repositorio a 1.9 GB, facilitando su uso en entornos con memoria limitada. La licencia es Apache-2.0, lo que permite uso comercial sin restricciones significativas. Su relevancia actual radica en ofrecer una alternativa ligera y multimodal para aplicaciones de IA en el borde, con soporte para múltiples idiomas europeos y asiáticos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (modelo de lenguaje + codificador de vision) |
| Parametros totales | 535.919.616 (según safetensors del repo MLX 4-bit); el modelo base declara 3.4B (lenguaje) + 0.4B (vision) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no se especifica en la informacion proporcionada) |
| Tipos de cuantizacion | 4-bit (MLX) |
| Idiomas soportados | en, fr, es, de, it, pt, nl, zh, ja, ko, ar |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

La arquitectura exacta no se detalla en la informacion disponible, pero por la familia Ministral 3 se trata de un transformer multimodal que combina un modelo de lenguaje de 3.4B parámetros con un codificador de vision de 0.4B parámetros. El modelo original fue entrenado por Mistral AI con un enfoque de instrucción y diálogo, probablemente mediante fine-tuning supervisado y posiblemente con técnicas de alineación como RLHF o DPO, aunque no se confirma en los datos proporcionados. La conversión a MLX 4-bit no altera la arquitectura, solo cuantiza los pesos para reducir el tamaño y acelerar la inferencia en hardware Apple.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni las técnicas específicas de alineación. La versión MLX se generó con mlx-lm 0.31.2, que es la herramienta estándar para convertir modelos a este formato.

## Capacidades

- Generación de texto e instrucción: modelo optimizado para seguir instrucciones y mantener diálogos multi-turno.
- Comprensión multimodal: al incluir un codificador de vision, puede procesar entradas de imagen junto con texto (aunque la conversión MLX 4-bit podría tener limitaciones en esta parte, no se especifica).
- Soporte multilingüe: cubre 10 idiomas, incluyendo español, francés, alemán, italiano, portugués, neerlandés, chino, japonés, coreano y árabe.
- Despliegue en edge: diseñado para funcionar en dispositivos con recursos limitados, con baja latencia.
- Integración con vLLM: el tag de librería indica compatibilidad con vLLM para servir el modelo en producción.
- Uso con MLX: permite ejecución nativa en Apple Silicon mediante mlx-lm.

No se mencionan capacidades específicas de tool calling, function calling, ni agentes multi-step en la informacion disponible.

## Casos de uso

- Asistentes de atención al cliente multilingües: el modelo puede gestionar conversaciones en varios idiomas (es, fr, de, etc.) en entornos con recursos limitados, como kioscos o aplicaciones móviles, gracias a su tamaño compacto y baja latencia.
- Análisis de documentos con imágenes: al ser multimodal, puede procesar capturas de pantalla, facturas o formularios escaneados y extraer información relevante, combinando visión y lenguaje.
- Traducción automática en dispositivos: su soporte para 10 idiomas lo hace adecuado para aplicaciones de traducción offline en móviles o dispositivos edge.
- Generación de respuestas en chatbots de soporte técnico: su capacidad de seguir instrucciones permite integrarlo en sistemas de FAQ dinámicos o asistentes virtuales con conocimiento específico del dominio.
- Clasificación y resumen de textos en producción: puede utilizarse para resumir correos, artículos o mensajes en múltiples idiomas, con despliegue en CPU o GPU de baja gama.
- Prototipado rápido de aplicaciones de IA en Apple Silicon: gracias al formato MLX, los desarrolladores con Macs M-series pueden probar y desplegar el modelo localmente sin necesidad de GPUs dedicadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para esta conversión MLX 4-bit. Se recomienda consultar la model card del modelo original (mistralai/Ministral-3-3B-Instruct-2512) para obtener métricas de rendimiento, aunque no se han proporcionado en esta ficha.

## Requisitos de hardware

- VRAM estimada: al ser un modelo 4-bit de aproximadamente 1.9 GB, se estima que requiere entre 2 y 4 GB de VRAM para inferencia, dependiendo de la longitud de contexto y el batch size.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050, RTX 4060) puede ejecutarlo. En Apple Silicon, funciona con MLX sin necesidad de GPU dedicada.
- Compatibilidad con consumer GPU: sí, cabe en GPUs de gama de entrada y en Macs con chip M1 o superior.
- Opciones de despliegue: vLLM (según el tag de librería), mlx-lm para Apple Silicon, y potencialmente llama.cpp si se convierte a GGUF (no incluido en este repo).
- Latencia y throughput: no se proporcionan datos concretos. Dado el tamaño reducido, se espera una latencia baja en hardware moderno, pero no se puede cuantificar sin pruebas.

## Comparativa con modelos similares

No se dispone de datos de benchmarks para comparar directamente. Sin embargo, se puede comparar cualitativamente con otros modelos de tamaño similar:

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| Ministral-3-3B-Instruct-2512 (MLX 4-bit) | 3.4B + 0.4B vision | no disponible | Sí | Apache-2.0 | MLX 4-bit |
| Qwen2.5-3B-Instruct | 3.1B | 32k (típico) | No | Apache-2.0 | Safetensors, GGUF |
| Llama-3.2-3B-Instruct | 3.2B | 128k (típico) | No | Llama 3.2 license | Safetensors, GGUF |
| Phi-3.5-mini | 3.8B | 128k | No | MIT | Safetensors, GGUF |

La principal diferencia de Ministral-3 es su capacidad multimodal y su licencia Apache-2.0, que permite uso comercial sin restricciones. Sin embargo, al ser una conversión MLX 4-bit, su disponibilidad se limita a entornos Apple Silicon o vLLM, mientras que los otros modelos tienen ecosistemas más amplios.

## Limitaciones y advertencias

- La conversión MLX 4-bit puede introducir pérdida de precisión en tareas que requieren alta exactitud numérica, como matemáticas o razonamiento lógico complejo.
- No se dispone de información sobre la longitud de contexto real; si es corta (por ejemplo, 8k o 16k), limitará el uso en tareas que requieran documentos largos.
- El modelo es multimodal, pero la conversión MLX podría no haber optimizado el codificador de vision; se recomienda probar la funcionalidad de imagen antes de usarla en producción.
- Aunque la licencia es Apache-2.0, el modelo base de Mistral AI puede tener términos adicionales en su sitio web; se recomienda revisar la política de privacidad y uso de Mistral.
- No se han publicado benchmarks para esta versión cuantizada, por lo que el rendimiento real en tareas específicas es desconocido.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es una conversión reciente y poco validada por la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Oscilla/Ministral-3-3B-Instruct-2512-mlx-4Bit
- Modelo base original: https://huggingface.co/mistralai/Ministral-3-3B-Instruct-2512
- Conversión MLX alternativa (mlx-community): https://huggingface.co/mlx-community/Ministral-3-3B-Instruct-2512-4bit
- Página en SourceForge: https://sourceforge.net/projects/ministral-3-3b-instruct-2512/
- Qualcomm AI Hub: https://aihub.qualcomm.com/iot/models/ministral_3_3b_instruct_2512
- Ficha en AIBase: https://model.aibase.com/models/details/1998557671565037568
