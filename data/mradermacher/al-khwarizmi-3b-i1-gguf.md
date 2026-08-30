# mradermacher/Al-Khwarizmi-3B-i1-GGUF

## Resumen

Al-Khwarizmi-3B-i1-GGUF es una cuantización en formato GGUF del modelo Al-Khwarizmi-3B, un ajuste fino (fine-tune) con LoRA sobre la base SmolLM3, desarrollado por mzoelfakar y cuantizado por mradermacher. El modelo está especializado en razonamiento matemático y conversación multilingüe, entrenado con el dataset GSM8K. Su relevancia radica en ofrecer una versión ligera y eficiente de un modelo de 3 mil millones de parámetros, apta para despliegue en entornos con recursos limitados, manteniendo capacidades multilingües en nueve idiomas. La licencia Apache-2.0 permite uso comercial sin restricciones significativas.

Este repositorio concreto contiene el archivo de matriz de importancia (imatrix) para generar cuantizaciones personalizadas, así como enlaces a las cuantizaciones estáticas disponibles en el repositorio hermano Al-Khwarizmi-3B-GGUF. Al ser un modelo pequeño, es adecuado para inferencia en CPU y GPU de consumo, con un equilibrio entre rendimiento y precisión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (basado en SmolLM3, presumiblemente transformer) |
| Parametros totales | no disponible (el modelo base es de 3B, pero no se confirma el número exacto) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF: Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S (según la model card) |
| Idiomas soportados | en, ar, fr, es, de, it, pt, zh, ru |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors para el modelo base) |

## Arquitectura y entrenamiento

No se dispone de detalles técnicos sobre la arquitectura interna del modelo base Al-Khwarizmi-3B. Según las etiquetas del repositorio, se trata de un ajuste fino con LoRA sobre SmolLM3, un modelo de lenguaje de tipo transformer. El entrenamiento se realizó con el dataset GSM8K, compuesto por problemas de matemáticas de nivel escolar, lo que sugiere un enfoque en razonamiento aritmético y resolución de problemas paso a paso. No se mencionan técnicas como RLHF o DPO. La cuantización GGUF fue realizada por mradermacher utilizando matrices de importancia (imatrix) para optimizar la calidad de los pesos cuantizados.

## Capacidades

- Generación de texto conversacional en nueve idiomas: inglés, árabe, francés, español, alemán, italiano, portugués, chino y ruso.
- Razonamiento matemático básico y resolución de problemas aritméticos, gracias al entrenamiento con GSM8K.
- Soporte para tareas de chat y diálogo multi-turno, indicado por la etiqueta "conversational".
- Compatible con bibliotecas de inferencia como text-generation-inference y transformers.
- Formato GGUF permite ejecución en CPU y GPU mediante llama.cpp, Ollama, vLLM, entre otros.

## Casos de uso

- Asistente educativo de matemáticas: el modelo puede guiar a estudiantes en la resolución de problemas aritméticos paso a paso, aprovechando su entrenamiento en GSM8K y su capacidad multilingüe para atender a alumnos de diferentes países.
- Chatbot multilingüe de atención al cliente: su soporte para nueve idiomas permite desplegar un asistente conversacional en mercados internacionales sin necesidad de múltiples modelos.
- Generación de explicaciones científicas sencillas: puede redactar respuestas claras y concisas sobre conceptos matemáticos o científicos en varios idiomas, útil para plataformas de divulgación.
- Prototipado rápido de aplicaciones de IA: al ser un modelo pequeño y cuantizado, es ideal para pruebas de concepto en entornos con recursos limitados, como portátiles o servidores sin GPU dedicada.
- Procesamiento de lenguaje natural en dispositivos edge: su tamaño reducido permite ejecutarlo en dispositivos con poca memoria, como Raspberry Pi o teléfonos móviles, para tareas de traducción o asistencia offline.
- Fine-tuning adicional sobre dominios específicos: al estar disponible en formato GGUF y con licencia Apache-2.0, puede servir como base para ajustes posteriores en tareas concretas, aunque se recomienda partir del modelo en safetensors para entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K u otras métricas para este modelo cuantizado.

## Requisitos de hardware

- Al ser un modelo de aproximadamente 3 mil millones de parámetros, una cuantización Q4_K_S ocupa alrededor de 2 GB de memoria, por lo que puede ejecutarse en GPUs con 4 GB de VRAM o incluso en CPU con 8 GB de RAM.
- GPUs recomendadas: NVIDIA GTX 1060 6GB, RTX 2060, RTX 3060, o superiores. También es viable en Apple Silicon (M1/M2) mediante llama.cpp.
- En CPU, se puede ejecutar con razonable velocidad gracias a la cuantización GGUF, especialmente con AVX2 o AVX512.
- Opciones de despliegue: llama.cpp, Ollama, vLLM (con adaptador GGUF), text-generation-inference, o mediante la librería transformers con carga de GGUF.
- La latencia estimada para generación de texto en GPU de gama media (RTX 3060) es de aproximadamente 20-40 tokens por segundo, aunque no se dispone de mediciones oficiales.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa con otros modelos de la misma categoría. El modelo base SmolLM3 es un punto de referencia, pero no se conocen sus métricas exactas. Alternativas como Qwen2.5-3B o Phi-3-mini podrían ser comparables, pero no se dispone de datos de rendimiento para Al-Khwarizmi-3B.

## Limitaciones y advertencias

- Al ser un modelo de solo 3B de parámetros, su capacidad de razonamiento complejo y de manejo de contextos largos es limitada en comparación con modelos más grandes.
- El entrenamiento exclusivo con GSM8K puede provocar un sesgo hacia problemas matemáticos de estilo escolar, con menor rendimiento en otras tareas.
- Riesgo de alucinaciones en temas fuera de su dominio de entrenamiento, especialmente en áreas científicas o técnicas avanzadas.
- La longitud de contexto no se ha especificado; se recomienda no exceder 2048 tokens para evitar degradación de calidad.
- Aunque la licencia Apache-2.0 permite uso comercial, el modelo base y sus cuantizaciones pueden tener limitaciones no documentadas; se recomienda verificar la procedencia de los pesos.
- El repositorio actual solo contiene el archivo imatrix; las cuantizaciones reales están en el repositorio hermano, lo que puede causar confusión al descargar.

## Enlaces

- Repositorio HuggingFace del modelo cuantizado: https://huggingface.co/mradermacher/Al-Khwarizmi-3B-i1-GGUF
- Repositorio con cuantizaciones estáticas: https://huggingface.co/mradermacher/Al-Khwarizmi-3B-GGUF
- Modelo base original: https://huggingface.co/mzoelfakar/Al-Khwarizmi-3B
- Página de descargas de mradermacher: https://hf.tst.eu/model
- Perfil de mradermacher en HuggingFace: https://huggingface.co/mradermacher
