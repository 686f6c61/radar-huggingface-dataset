# kizuna-intelligence/Qwen3.5-2B-OneCompression-4bit-MLX

## Resumen

El modelo `kizuna-intelligence/Qwen3.5-2B-OneCompression-4bit-MLX` es un checkpoint cuantizado a 4 bits, específicamente preparado para MLX, que parte del modelo base Qwen/Qwen3.5-2B. Ha sido desarrollado por el usuario kizuna-intelligence para el ejemplo de conversación en dispositivo de AyaneSDK, y emplea la técnica de cuantización OneCompression GPTQ con propagación de error de cuantización (QEP). Este checkpoint es exclusivamente de texto, sin pesos de visión, y está calibrado con 256 muestras de diálogo en japonés.

Aunque el modelo base Qwen3.5-2B es un modelo denso de aproximadamente 2.000 millones de parámetros con una ventana de contexto nativa de 262.144 tokens y capacidades multimodales, este checkpoint cuantizado reporta en safetensors un total de 265.103.168 parámetros (unos 265 millones), lo que sugiere que podría tratarse de una versión reducida o que el dato corresponde a los pesos cuantizados. La cuantización a 4 bits con grupo de tamaño 128 reduce significativamente el tamaño del modelo, haciéndolo adecuado para inferencia en dispositivos con recursos limitados.

La relevancia de este modelo radica en su formato MLX, optimizado para Apple Silicon, y en su licencia Apache 2.0, que permite uso comercial sin restricciones. Al estar basado en Qwen3.5, hereda las capacidades de razonamiento, generación de texto y soporte multilingüe del modelo original, aunque limitado a inglés y japonés en esta versión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3.5 text-only, sin visión) |
| Parametros totales | 265.103.168 (dato reportado en safetensors) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (heredada del modelo base) |
| Tipos de cuantizacion | 4-bit GPTQ (OneCompression), group size 128; token embedding cuantizado asimetrico 4-bit MLX |
| Idiomas soportados | Japones (ja), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), convertido desde GPTQ-v1 |

## Arquitectura y entrenamiento

El checkpoint es una cuantización del modelo Qwen/Qwen3.5-2B, un transformer denso de la serie Qwen3.5 que, en su versión original, es un modelo de visión-lenguaje unificado con entrenamiento temprano de fusión multimodal. Sin embargo, este checkpoint elimina los pesos de visión y se queda únicamente con la parte de texto. La cuantización se realizó con OneCompression GPTQ, una técnica que incluye propagación de error de cuantización (QEP) para minimizar la degradación. Se cuantizaron 186 capas lineales a 4 bits con grupo de tamaño 128, y el token embedding se cuantizó por separado a 4 bits asimétrico en MLX.

El proceso de calibración utilizó 256 muestras de diálogo en japonés de 512 tokens cada una. Los pesos GPTQ-v1 empaquetados se convirtieron sin pérdida a la representación afín row-major de MLX. No se realizó ningún entrenamiento adicional; se trata de una conversión puramente de cuantización.

## Capacidades

- Generación de texto en inglés y japonés, con razonamiento y respuesta conversacional.
- Soporte de contexto largo (hasta 262.144 tokens), útil para diálogos extensos o documentos largos.
- Capacidades de tool calling y function calling heredadas del modelo base Qwen3.5-2B (no confirmadas explícitamente para este checkpoint, pero presentes en el base).
- Capacidades de agente y razonamiento multi-paso, típicas de la serie Qwen3.5.
- Sin soporte de visión: los pesos de visión no están incluidos, por lo que no procesa imágenes.
- No se especifica modo de pensamiento (thinking mode) ni soporte de audio.

## Casos de uso

- Asistente conversacional en dispositivo: el checkpoint está diseñado para el ejemplo de conversación de AyaneSDK, por lo que es ideal para integrar un chatbot en aplicaciones móviles o de escritorio que ejecuten MLX en Apple Silicon.
- Chatbot en japonés para atención al cliente: gracias a su calibración con diálogos japoneses, puede mantener conversaciones naturales en ese idioma con baja latencia.
- Generación de texto ligero: al tener solo 265M parámetros en 4-bit, cabe en dispositivos con poca memoria, permitiendo generación de correos, resúmenes o respuestas automáticas.
- Prototipado rápido en entornos MLX: los desarrolladores pueden usar este checkpoint para probar aplicaciones de texto sin necesidad de un modelo grande.
- Traducción automática entre inglés y japonés: aunque no está entrenado específicamente para traducción, puede generar texto en ambos idiomas.
- Relleno de formularios o respuestas cortas en aplicaciones de productividad: su tamaño reducido y velocidad lo hacen adecuado para tareas de autocompletado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo base Qwen3.5-2B tiene resultados en benchmarks estándar (MMLU, HumanEval, GSM8K, etc.), pero no hay datos específicos para esta versión cuantizada con OneCompression.

## Requisitos de hardware

- VRAM estimada para inferencia: con 265M parámetros en 4-bit, el tamaño de los pesos es aproximadamente 132 MB (265M × 0,5 bytes). El repo ocupa 1,0 GB, lo que sugiere que incluye otros archivos (configuración, tokenizador, etc.). En la práctica, la VRAM necesaria es inferior a 1 GB.
- GPU recomendadas: cualquier GPU con soporte MLX (Apple Silicon: M1, M2, M3, etc.) o GPU NVIDIA con suficiente memoria (incluso 4 GB son suficientes).
- Cabe en GPUs de consumo: sí, en cualquier GPU moderna, incluso en integradas.
- Opciones de despliegue: MLX (librería nativa de Apple), también se puede convertir a GGUF para usar con llama.cpp u Ollama, aunque el formato original es MLX.
- Latencia y throughput: al ser un modelo pequeño, la latencia es baja (del orden de decenas de milisegundos por token en Apple Silicon), aunque no se han publicado cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kizuna-intelligence/Qwen3.5-2B-OneCompression-4bit-MLX | 265M (reportado) | 262.144 | 4-bit GPTQ | Apache 2.0 | HuggingFace |
| Qwen/Qwen3.5-2B (base) | ~2B | 262.144 | Sin cuantizar | Apache 2.0 | HuggingFace |
| mlx-community/Qwen3.5-2B-MLX-4bit | ~2B | 262.144 | 4-bit MLX | Apache 2.0 | HuggingFace |
| Llama-3.2-3B (alternativa similar) | 3B | 128.000 | Varias | Llama 3.2 | HuggingFace |

La comparativa muestra que el checkpoint de kizuna-intelligence tiene un número de parámetros mucho menor que el base, lo que lo hace más ligero, pero podría implicar una pérdida de calidad. La licencia Apache 2.0 permite uso comercial sin restricciones, al igual que el base.

## Limitaciones y advertencias

- Solo soporta inglés y japonés; no cubre otros idiomas.
- No incluye pesos de visión, por lo que no puede procesar imágenes ni vídeo.
- La cuantización a 4 bits puede degradar la precisión en tareas complejas, aunque OneCompression con QEP intenta mitigarlo.
- El número de parámetros reportado (265M) es inusualmente bajo para un modelo denominado "2B"; podría tratarse de un error o de una versión reducida, por lo que se recomienda verificar antes de usar en producción.
- Al ser un checkpoint de demostración para AyaneSDK, no se garantiza su estabilidad en entornos de producción.
- No se han publicado benchmarks específicos, por lo que el rendimiento real no está documentado.
- La licencia Apache 2.0 permite uso comercial, pero se debe atribuir correctamente al autor original y al modelo base.

## Enlaces

- HuggingFace: https://huggingface.co/kizuna-intelligence/Qwen3.5-2B-OneCompression-4bit-MLX
- Modelo base Qwen3.5-2B: https://huggingface.co/Qwen/Qwen3.5-2B
- Blog oficial de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Repositorio de OneCompression: https://github.com/FujitsuResearch/OneCompression
- Versión MLX 4-bit de la comunidad: https://huggingface.co/mlx-community/Qwen3.5-2B-MLX-4bit
- Página de Ollama para Qwen3.5:2b: https://ollama.com/library/qwen3.5:2b
- Página de LM Studio para Qwen3.5-2B: https://lmstudio.ai/models/qwen/qwen3.5-2b
