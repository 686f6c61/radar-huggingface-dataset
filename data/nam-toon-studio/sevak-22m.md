# Nam-toon-studio/sevak-22m

## Resumen

Sevak-22M (ਸੇਵਕ, "el que sirve desinteresadamente") es un modelo de lenguaje causal de 22 millones de parámetros desarrollado por Gurpreet Singh Dhillon (AMRIT Research / Toon Studio) y publicado en Hugging Face bajo licencia MIT. Está diseñado específicamente para generación de texto en gurmukhi (punjabi), hindi e inglés, con un enfoque en despliegue en dispositivos de borde (edge AI) y hardware de consumo, como Apple Silicon. El modelo emplea un tokenizador BPE personalizado de 4.000 tokens que, según el autor, reduce la deriva de bytes y los bucles repetitivos en la generación de punjabi.

Con una arquitectura transformer de 6 bloques, dimensión oculta de 512 y 8 cabezas de atención, Sevak-22M es un modelo extremadamente ligero: su footprint en memoria es de aproximadamente 42 MB en FP16. Su contexto de 256 posiciones es muy reducido, lo que limita su uso a tareas de generación corta, pero lo hace adecuado para aplicaciones en tiempo real en móviles o sistemas embebidos. El modelo se presenta como una contribución al avance de la IA soberana para lenguas indicas, con un dataset de entrenamiento de 50.000 pares de instrucción verificados en gurmukhi, que abarca literatura, herencia sij, ciencia, matemáticas y filosofía.

La relevancia actual de Sevak-22M radica en su propuesta de eficiencia extrema para lenguas de bajos recursos, un nicho poco cubierto por los grandes modelos multilingües. Sin embargo, su tamaño y contexto limitado lo restringen a tareas muy específicas, y no se han publicado benchmarks cuantitativos que permitan comparar su rendimiento con alternativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (6 bloques, d_model=512, 8 cabezas de atención) |
| Parametros totales | 23.114.752 (según safetensors; la model card indica 21,07 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 posiciones |
| Tipos de cuantizacion | FP32 / FP16 (según model card) |
| Idiomas soportados | punjabi (gurmukhi), hindi, inglés |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Sevak-22M es un modelo transformer causal estándar con 6 bloques, dimensión oculta de 512 y 8 cabezas de atención. El vocabulario es de 4.000 tokens BPE personalizados, diseñado para que un token corresponda aproximadamente a una palabra completa en punjabi, lo que reduce la fragmentación y los artefactos de generación en gurmukhi. El modelo fue entrenado con un enfoque de ajuste fino supervisado (SFT) con enmascaramiento de objetivos (target-masked SFT) sobre un dataset de 50.000 pares de instrucción en gurmukhi, cubriendo literatura, herencia sij, ciencia, matemáticas y filosofía. No se especifican el número total de tokens de preentrenamiento ni la composición exacta del dataset. El entrenamiento se realizó nativamente en hardware Apple Silicon, según el autor, aunque no se detallan hiperparámetros adicionales como tasa de aprendizaje, optimizador o épocas.

## Capacidades

- Generación de texto en gurmukhi (punjabi), hindi e inglés, con énfasis en fluidez y baja repetición en punjabi.
- Ajuste fino para instrucciones (instruction following) en dominios como literatura sij, ciencia, matemáticas y filosofía.
- Inferencia de baja latencia en dispositivos de borde: el autor reporta ~250 ms en GPU de Apple Silicon.
- Despliegue local sin conexión, gracias a su tamaño reducido (~42 MB en FP16).
- No se menciona soporte para tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio.

## Casos de uso

- Asistente de escritura en punjabi: redacción de textos cortos en gurmukhi, como mensajes, correos o contenido para redes sociales, con corrección de ortografía y estilo, aprovechando su tokenizador especializado.
- Aplicación educativa de herencia sij: generación de respuestas a preguntas sobre historia, filosofía y literatura sij, basadas en el dataset de entrenamiento, para uso en entornos educativos o devocionales.
- Traducción o transliteración básica entre punjabi, hindi e inglés: aunque no se especifica entrenamiento específico para traducción, el modelo puede generar texto en los tres idiomas, útil para frases cortas.
- Chatbot devocional o de referencia cultural: integración en aplicaciones móviles que respondan preguntas frecuentes sobre el sijismo o la cultura punjabi, con respuestas generadas localmente.
- Prototipo de NLP para lenguas indicas de bajos recursos: servir como base para investigación en generación de texto en gurmukhi, dado su tamaño manejable y licencia MIT.
- Sistema de autocompletado en teclados o editores para punjabi: predicción de palabras o frases cortas en gurmukhi, gracias a su baja latencia y footprint reducido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas como MMLU, HumanEval, GSM8K ni comparaciones con otros modelos. El único dato de rendimiento es la latencia de inferencia de ~250 ms en Apple Silicon GPU, reportada por el autor, sin especificar condiciones de medición.

## Requisitos de hardware

- VRAM estimada: menos de 100 MB en FP16 (aproximadamente 42 MB de pesos), por lo que cabe en cualquier GPU moderna, incluso integradas.
- GPU recomendadas: cualquier GPU con soporte FP16, incluyendo Apple Silicon (M1/M2/M3), NVIDIA GTX 10xx o superior, y GPUs integradas Intel/AMD.
- Cabe en consumer GPU: sí, en todas, incluyendo tarjetas de gama baja y sistemas sin GPU dedicada (inferencia en CPU viable).
- Opciones de despliegue: al ser un modelo safetensors estándar, puede cargarse con PyTorch y sentencepiece (como muestra el quickstart). No se menciona compatibilidad con vLLM, llama.cpp, Ollama o TGI, aunque por su tamaño podría adaptarse fácilmente.
- Latencia y throughput: ~250 ms por generación en Apple Silicon GPU (dato del autor); en CPU podría ser mayor, pero sigue siendo viable para tareas interactivas.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa rigurosa. Sevak-22M es un modelo de tamaño muy reducido (22M) y contexto de 256 tokens, lo que lo sitúa en una categoría de modelos ultra-ligeros para lenguas específicas. No se han encontrado modelos comparables con el mismo enfoque en punjabi/gurmukhi en la información disponible. Alternativas genéricas de tamaño similar (como TinyStories o modelos de 20-30M) no están orientadas a lenguas indicas, por lo que la comparativa no es directa. Se indica "no disponible" por falta de datos.

## Limitaciones y advertencias

- Contexto extremadamente corto (256 tokens), lo que impide tareas que requieran dependencias de largo alcance o documentos extensos.
- Vocabulario limitado a 4.000 tokens, lo que puede afectar la cobertura de palabras raras o neologismos en hindi e inglés.
- Dataset de entrenamiento reducido (50.000 pares de instrucción), lo que puede provocar alucinaciones o respuestas inexactas en dominios fuera de los cubiertos.
- No se han publicado evaluaciones de sesgos ni de seguridad; al estar entrenado en un corpus específico (literatura sij, filosofía), puede reflejar sesgos culturales o religiosos.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantías de exactitud ni soporte técnico.
- No se especifica el proceso de preentrenamiento (solo SFT), por lo que la base de conocimiento general es limitada.
- El modelo no soporta tool calling, agentes ni razonamiento multi-paso, lo que restringe su uso en pipelines complejos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Nam-toon-studio/sevak-22m
- Perfil del autor en Hugging Face: https://huggingface.co/Nam-toon-studio
- Búsqueda de modelos relacionados: https://huggingface.co/models?other=toon-studio

No se han encontrado papers, repositorios de código adicionales ni demos en línea en la información proporcionada.
