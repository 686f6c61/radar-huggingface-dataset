# Sawfwair/LFM2.5-2.6B-QAD-MLX-4bit

## Resumen

LFM2.5-2.6B-QAD-MLX-4bit es una conversión nativa a MLX del checkpoint cuantizado QAD (Quantization-Aware Distillation) de Liquid AI, concretamente del archivo GGUF `LFM2.5-2.6B-QAD-Q4_0.gguf` en su revisión inmutable `f4a289c8a200a5ca71005ba7abc2dad33058a450`. El trabajo lo publica el usuario Sawfwair en Hugging Face, con el objetivo de ofrecer una versión determinista y reempaquetada para el framework MLX de Apple Silicon, manteniendo exactamente los valores de cuantización Q4_0 originales y la escala FP16 de cada bloque.

El modelo subyacente, LFM2.5-2.6B, es un modelo denso de 2.69 mil millones de parámetros desarrollado por Liquid AI, diseñado específicamente para despliegue en dispositivos (edge). Forma parte de la familia LFM2.5, que emplea una arquitectura híbrida con bloques de convolución de doble compuerta y atención GQA, y ha sido entrenado con un presupuesto de 34 billones de tokens. Su ventana de contexto alcanza los 131 072 tokens (128K), lo que le permite manejar tareas agénticas complejas con razonamiento multi-paso y llamada a herramientas nativa.

La relevancia de esta conversión radica en que preserva los valores de los pesos QAD (entrenados con distilación consciente de cuantización), que según Liquid recuperan aproximadamente el 97 % de la calidad del modelo en BF16 manteniendo el mismo footprint compacto de Q4_0. Esto la convierte en una opción interesante para ejecutar agentes locales en hardware de consumo, con velocidades de hasta 220 tokens por segundo en un Apple M5 Max y menos de 2,5 GB de memoria.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2 híbrida: 22 bloques de convolución doble con doble compuerta + 8 capas GQA |
| Parametros totales | 2.69 mil millones (checkpoint original); 514 128 896 tensores en safetensors MLX |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 131 072 tokens |
| Tipos de cuantizacion | MLX affine 4-bit/group-32 (proyecciones), 6-bit/group-64 (embeddings) |
| Idiomas soportados | Árabe, chino, inglés, francés, alemán, hindi, indonesio, italiano, japonés, coreano, polaco, portugués, ruso, español, tailandés, vietnamita |
| Licencia | LFM Open License (licencia original de Liquid AI, categoría "other") |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

LFM2.5-2.6B es un modelo denso basado en la arquitectura LFM2, que combina 22 bloques de atención con convoluciones cortas de doble compuerta (double-gated short convolution) y 8 capas de atención GQA (Grouped Query Attention). Esta mezcla híbrida permite capturar dependencias locales de forma eficiente sin recurrir a la atención completa en todas las capas, lo que reduce el coste computacional y la huella de memoria en inferencia.

El entrenamiento se realizó con un presupuesto de 34 billones de tokens, con un vocabulario de 128 000 entradas. El modelo se ha optimizado mediante post-entrenamiento agéntico, que incluye refuerzo (RL) en entornos de agentes populares para mejorar la compatibilidad con llamadas de herramientas y tareas de razonamiento de múltiples pasos. La variante QAD se entrena con distilación consciente de cuantización: los pesos se optimizan directamente para funcionar en Q4_0, recuperando una calidad cercana a la del BF16 sin aumentar el tamaño del archivo. Esta conversión MLX reempaqueta los valores Q4_0 en formato affine de 4 bits con grupo de 32 y los embeddings en 6 bits con grupo de 64, preservando exactamente los valores de los proyecciones y las escalas FP16.

## Capacidades

- Generación de texto y conversación multi-turno en 16 idiomas.
- Razonamiento de múltiples pasos y planificación agéntica.
- Llamada a herramientas (function calling) nativa, optimizada para entornos de agentes.
- Ejecución de tareas agénticas complejas (investigación, resumen, automatización) en dispositivos.
- Ventana de contexto de 128K tokens para manejar documentos largos y conversaciones extensas.
- Inferencia eficiente en CPU y Apple Silicon (220 tok/s en M5 Max, 113 tok/s en AMD Ryzen).
- Soporte de decodificación determinista y reproducible gracias a la conversión nativa MLX.

## Casos de uso

- Agentes de investigación autónomos: el modelo puede planificar búsquedas, consultar fuentes y generar resúmenes estructurados, gracias a su capacidad de razonamiento de múltiples pasos y su ventana de 128K tokens que permite mantener el contexto completo de la investigación.
- Asistentes de programación en el dispositivo: con soporte de function calling, puede integrarse en editores de código para autocompletar, refactorizar o generar documentación, ejecutándose localmente sin conexión en portátiles con Apple Silicon.
- Chatbots de atención al cliente: su capacidad multilingüe (16 idiomas) y su contexto largo permiten gestionar conversaciones multi-turno con historial extenso, ideal para despliegues en servidores de bajo coste o en el borde.
- Análisis de documentos legales o técnicos: la ventana de 128K tokens permite procesar contratos, informes o manuales completos en una sola pasada, extrayendo información clave y generando resúmenes.
- Automatización de tareas administrativas: integrado en pipelines de automatización, puede extraer datos, rellenar formularios o responder correos basándose en instrucciones complejas y herramientas de llamada.
- Despliegue en dispositivos móviles y IoT: con un peso de aproximadamente 1,8 GB y la capacidad de ejecutarse en CPU con menos de 2,5 GB de memoria, es viable para aplicaciones de borde que requieren privacidad y baja latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La documentación de Liquid AI indica que la variante QAD recupera aproximadamente el 97 % de la calidad del checkpoint BF16, pero no se incluyen números específicos de pruebas como MMLU, HumanEval o GSM8K. Tampoco se aportan mediciones de throughput para esta conversión MLX concreta.

## Requisitos de hardware

- VRAM estimada: inferior a 2,5 GB en cuantización 4-bit (según Liquid AI).
- GPU recomendadas: Apple Silicon (M1, M2, M3, M4, M5) para máxima velocidad con MLX; también ejecutable en CPU (AMD Ryzen, Intel) mediante llama.cpp.
- Compatible con GPU de consumo (RTX 3060, 4060, 4090, etc.) si se ejecuta a través de frameworks que soporten el formato GGUF, aunque la conversión MLX está optimizada para Apple.
- Opciones de despliegue: MLX (nativo), llama.cpp, Ollama, vLLM (para el checkpoint original), SGLang.
- Latencia y throughput: 220 tok/s en Apple M5 Max y 113 tok/s en AMD Ryzen CPU según datos de Liquid AI para el modelo original; la versión MLX debe medirse por separado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| LFM2.5-2.6B-QAD-MLX-4bit | 2.69B | 128K | LFM Open License | Conversión MLX con QAD 4-bit |
| LFM2.5-2.6B (original) | 2.69B | 128K | LFM Open License | Checkpoint full precision, mejor para fine-tuning |
| LFM2.5-2.6B-GGUF | 2.69B | 128K | LFM Open License | Formato GGUF Q4_0 para llama.cpp |
| Qwen2.5-3B (referencia) | 3.09B | 128K | Apache 2.0 | Modelo denso similar en tamaño, sin arquitectura híbrida |

La comparativa estructural muestra que LFM2.5-2.6B se posiciona en la misma categoría que modelos de 3B como Qwen2.5-3B, pero con una arquitectura híbrida única y una licencia más restrictiva. No se dispone de benchmarks comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- La licencia LFM Open License es específica de Liquid AI; aunque permite uso comercial, es necesario revisar los términos exactos antes de desplegar en producción.
- La conversión MLX es determinista y conserva los valores Q4_0, pero el rendimiento (throughput y latencia) no ha sido medido en esta variante; los datos de 220 tok/s corresponden al modelo original en GGUF.
- No se han publicado resultados de benchmarks para este checkpoint concreto, por lo que la calidad en tareas específicas debe validarse empíricamente.
- El modelo es solo texto; no soporta entrada de imágenes ni audio.
- La cuantización Q4_0, aunque recupera el 97 % de la calidad BF16, puede mostrar degradación en tareas de razonamiento complejo o matemáticas avanzadas comparado con el modelo completo.
- El idioma español está soportado, pero el rendimiento puede ser inferior al inglés, que es el idioma dominante en los datos de entrenamiento.
- El repositorio de la conversión tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica una adopción aún no verificada por la comunidad.

## Enlaces

- Repositorio Hugging Face de la conversión: https://huggingface.co/Sawfwair/LFM2.5-2.6B-QAD-MLX-4bit
- Modelo original LFM2.5-2.6B: https://huggingface.co/LiquidAI/LFM2.5-2.6B
- Variante GGUF: https://huggingface.co/LiquidAI/LFM2.5-2.6B-GGUF
- Variante MLX oficial: https://huggingface.co/LiquidAI/LFM2.5-2.6B-MLX
- Blog de Liquid AI sobre LFM2.5-2.6B: https://www.liquid.ai/blog/lfm2-5-2-6b
- Documentación técnica: https://docs.liquid.ai/lfm/models/lfm25-2.6b
- Artículo sobre QAD en AlphaSignal: https://alphasignal.ai/news/liquid-ai-s-lfm2-5-hits-97-full-precision-quality-in-a-tiny-4-bit-file
- Playground de Liquid AI: https://playground.liquid.ai/
- Documentación de LFM: https://docs.liquid.ai/lfm/getting-started/welcome
- Plataforma LEAP: https://leap.liquid.ai/
- Demo de agente de investigación en Hugging Face Spaces: https://huggingface.co/spaces/LiquidAI/LFM2.5-2.6B-WebGPU
