# issai/Qwen3.5-4B-Base-Kazakh-OptimizedTokenizer

## Resumen

Qwen3.5-4B-Base-Kazakh-OptimizedTokenizer es un modelo base de tipo texto desarrollado por ISSAI (Instituto de Sistemas Inteligentes y de Inteligencia Artificial de Kazajistán) a partir de Qwen/Qwen3.5-4B-Base. Su objetivo es mejorar la eficiencia y la calidad del modelado en kazajo y ruso sin degradar el rendimiento en inglés, mediante la ampliación del vocabulario y un preentrenamiento continuado sobre corpus multilingües. Es la segunda iteración de la familia Kazakh de ISSAI, que corrige la penalización de eficiencia del tokenizador anterior en ruso.

El modelo mantiene la arquitectura híbrida de Qwen3.5: 32 capas, de las cuales 24 son de atención lineal Gated DeltaNet y 8 son de atención completa, con un tamaño oculto de 2.560 y 4,25 mil millones de parámetros en bfloat16. El tokenizador amplía el vocabulario original de Qwen3.5 (248.077 tokens) en 16.000 merges nuevos aprendidos sobre kazajo y ruso, con la matriz de embeddings rellenada hasta 264.192 filas.

La relevancia actual del modelo radica en que reduce el coste computacional del kazajo en un factor de 1,98 y el del ruso en 1,10 respecto a Qwen3.5, al tiempo que mejora las puntuaciones medias en las tareas de evaluación de ambos idiomas. Es un modelo base, no ajustado para seguir instrucciones, pensado como punto de partida para fine-tuning o para construir modelos conversacionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 híbrida: 32 capas (24 Gated DeltaNet de atención lineal + 8 de atención completa), hidden size 2.560, solo texto |
| Parametros totales | 4.246.383.616 (4,25 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (longitud usada en entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | kazajo (kk), ruso (ru), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B-Base, un transformer híbrido que combina 24 capas de atención lineal Gated DeltaNet con 8 capas de atención completa, lo que reduce el coste de atención en contextos largos manteniendo la capacidad de modelado global. Los embeddings de entrada y salida están atados (tied), de modo que una única matriz sirve para ambas funciones.

El proceso de construcción consta de cuatro fases. Primero se aprende un tokenizador BPE continuado con 16.000 merges nuevos sobre texto kazajo y ruso, añadidos después de la lista de merges original de Qwen3.5, de forma que todos los tokens y reglas originales conservan su id y el inglés y el código se tokenizan de forma idéntica. Segundo, cada embedding nuevo se inicializa como la media de los embeddings de los tokens de Qwen que reemplaza (Fast Vocabulary Transfer). Tercero, una fase de 571 pasos entrena únicamente las 16.000 filas nuevas de embedding con el resto de pesos congelados, a tasa de aprendizaje 1e-4. Cuarto, una época completa sobre 8.400 millones de tokens (40 % kazajo, 20 % ruso, 40 % inglés) entrena todos los pesos: 2.134 pasos de 120 secuencias de 32.768 tokens, tasa 1e-5 con decaimiento coseno hasta 1e-6, warm-up del 2 %, AdamW (β = 0,9 / 0,95), weight decay 0,1, 15 GPU H100 con DeepSpeed ZeRO-2 y ms-swift. Los datos de kazajo provienen de FineWeb-2, FinePDFs, FineWiki y un corpus multidisciplinar propio; los de ruso de FineWeb-2, FinePDFs y FineWiki; el inglés actúa como replay con FineWeb-Edu, Nemotron-CC-Math y Stack-Edu, entre otros.

## Capacidades

- Generación de texto y continuación de secuencias en kazajo, ruso e inglés.
- Modelado de lenguaje base: no sigue instrucciones de chat ni mantiene diálogos multi-turno de forma nativa.
- Tokenización eficiente de kazajo (1,98 veces menos tokens que Qwen3.5) y ruso (1,10 veces menos), con inglés idéntico al original.
- Capacidad de servir como base para fine-tuning supervisado, DPO o RLHF orientados a tareas concretas.
- Soporte de tool calling y function calling: no disponible de forma nativa en un modelo base.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma nativa en un modelo base.
- Capacidades multimodales (visión, audio): no disponibles; el modelo es solo texto.
- Modo thinking: no disponible en esta variante base (la versión conversacional derivada sí lo incorpora).

## Casos de uso

- Fine-tuning para asistentes en kazajo: el modelo sirve como base para ajuste supervisado de un chatbot en kazajo, aprovechando su tokenizador eficiente para reducir el coste por token y aumentar el texto efectivo dentro de la ventana de 32.768 tokens.
- Modelado y clasificación de documentos en ruso: con una reducción del 10 % en tokens frente a Qwen3.5, tareas de etiquetado, extracción de entidades o resumen sobre corpus rusos resultan más baratas en inferencia y caben más documentos por contexto.
- Construcción de modelos conversacionales derivados: el autor indica que la versión chat con thinking e imágenes se construye sobre este modelo, por lo que es el punto de partida recomendado para quien quiera replicar ese pipeline.
- Investigación en tokenizadores multilingües: el enfoque de BPE continuado con FVT es reproducible y sirve como referencia para extender vocabularios a otras lenguas de bajos recursos sin degradar el inglés.
- Generación aumentada por recuperación (RAG) en kazajo y ruso: la ventana de 32.768 tokens y la tokenización compacta permiten insertar más pasajes recuperados en el prompt, lo que mejora la cobertura documental en sistemas RAG.
- Evaluación comparativa de modelos multilingües: al mantener el inglés idéntico a Qwen3.5, sirve como control en experimentos que aíslan el efecto de la extensión de vocabulario sobre el rendimiento en lenguas de bajos recursos.
- Preentrenamiento continuado sobre dominios específicos: el modelo puede seguir entrenándose con corpus legales, médicos o técnicos en kazajo o ruso partiendo de un vocabulario ya adaptado, lo que acelera la convergencia.

## Benchmarks y rendimiento

Evaluación con lm-evaluation-harness, 5-shot, conjuntos de test completos, bfloat16 y los mismos ajustes para los tres modelos. Las tareas de kazajo y ruso son versiones propias de ISSAI.

| Metrica | Qwen3.5-4B-Base | issai/Qwen3.5-4B-Base-Kazakh | Este modelo |
|---|---|---|---|
| Media kazajo (6 tareas) | 57,37 | 60,83 | 61,47 |
| Media ruso (4 tareas) | 65,37 | 64,43 | 65,55 |
| Media inglés (4 tareas) | 77,15 | 76,80 | 77,01 |

Eficiencia del tokenizador (tokens por palabra en los 488 pasajes Belebele/FLORES de cada idioma; menor es mejor):

| Idioma | Qwen3.5-4B-Base | issai/Qwen3.5-4B-Base-Kazakh | Este modelo |
|---|---|---|---|
| Kazajo | 3,48 | 1,83 (1,90× menos) | 1,76 (1,98× menos) |
| Ruso | 1,89 | 2,23 (1,18× más) | 1,72 (1,10× menos) |
| Inglés | 1,25 | 1,25 | 1,25 |

No se han publicado en la informacion disponible los resultados desglosados por tarea individual, solo las medias agregadas.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 8,5 GB solo para pesos (4,25 B × 2 bytes), más overhead de activaciones y caché KV; en la práctica, entre 10 y 12 GB según longitud de contexto y batch.
- VRAM estimada en cuantización de 8 bits: alrededor de 4,5 GB para pesos; en 4 bits, alrededor de 2,5 GB (estimaciones a partir del número de parámetros; el autor no publica cuantizaciones oficiales).
- GPU recomendadas para entrenamiento o fine-tuning completo: H100 (el autor usó 15 × H100 con DeepSpeed ZeRO-2 para el preentrenamiento continuado); A100 80 GB como alternativa.
- GPU de consumo: cabe en RTX 4090 (24 GB) en bfloat16 para inferencia con contexto moderado, y en GPUs de 8-12 GB si se cuantiza.
- Opciones de despliegue: transformers (librería declarada), vLLM y TGI para servicio de alto rendimiento; llama.cpp y Ollama para cuantizaciones GGUF, aunque el autor no publica artefactos GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Media kazajo | Media ruso | Media inglés | Licencia |
|---|---|---|---|---|---|---|
| Este modelo | 4,25 B | 32.768 | 61,47 | 65,55 | 77,01 | Apache 2.0 |
| Qwen3.5-4B-Base | 4,25 B | 32.768 (entrenamiento) | 57,37 | 65,37 | 77,15 | Apache 2.0 |
| issai/Qwen3.5-4B-Base-Kazakh | 4,25 B | 32.768 (entrenamiento) | 60,83 | 64,43 | 76,80 | Apache 2.0 |

La comparativa se limita a los tres modelos evaluados por el autor en la información disponible; no se han publicado comparaciones con otras familias multilingües de tamaño similar.

## Limitaciones y advertencias

- Es un modelo base: no sigue instrucciones de chat ni mantiene diálogos multi-turno; para uso conversacional hay que ajustarlo o usar la variante chat derivada.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se han publicado evaluaciones específicas de factualidad.
- Sesgos conocidos: no disponibles en la información proporcionada; los corpus de origen (FineWeb-2, FinePDFs, FineWiki, Stack-Edu) pueden introducir sesgos de dominio y de representación.
- Cobertura lingüística limitada a kazajo, ruso e inglés; el rendimiento en otras lenguas no está evaluado y probablemente sea deficiente.
- La ventana de contexto de 32.768 tokens es la usada en entrenamiento; no se garantiza un comportamiento correcto más allá de esa longitud.
- Los datos de entrenamiento no se publican y cada fuente tiene su propia licencia, lo que limita la reproducibilidad exacta del pipeline.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe verificar las licencias de los datos de origen si redistribuye derivados.
- No se publican cuantizaciones oficiales ni artefactos GGUF; el soporte en llama.cpp u Ollama requeriría conversión propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/issai/Qwen3.5-4B-Base-Kazakh-OptimizedTokenizer
- Versión anterior kazaja: https://huggingface.co/issai/Qwen3.5-4B-Base-Kazakh
- Versión conversacional derivada: https://huggingface.co/issai/Qwen3.5-4B-Kazakh-OptimizedTokenizer
- Modelo base original: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
- ms-swift (framework de entrenamiento): https://github.com/modelscope/ms-swift
