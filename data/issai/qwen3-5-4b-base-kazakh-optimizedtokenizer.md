# issai/Qwen3.5-4B-Base-Kazakh-OptimizedTokenizer

## Resumen

Qwen3.5-4B-Base-Kazakh-OptimizedTokenizer es un modelo base de 4.246 millones de parámetros desarrollado por ISSAI (Instituto de Sistemas Inteligentes y de Inteligencia Artificial de Kazajistán) como evolución de su anterior adaptación al kazajo. Parte del modelo Qwen/Qwen3.5-4B-Base de Alibaba y aplica un preentrenamiento continuado con un tokenizador extendido que cubre kazajo y ruso, manteniendo el inglés intacto. El objetivo es reducir el coste computacional y mejorar la calidad en lenguas de bajos recursos sin degradar el rendimiento original.

La innovación principal es la extensión del vocabulario con 16.000 nuevos merges BPE aprendidos sobre kazajo y ruso, lo que reduce el número de tokens necesarios para representar texto kazajo en 1,98 veces y el ruso en 1,10 veces respecto al Qwen3.5 original. El modelo se entrenó sobre 8,4 mil millones de tokens con una mezcla 40/20/40 de kazajo, ruso e inglés, empleando 15 GPU H100 y DeepSpeed ZeRO-2.

Es relevante porque demuestra que es posible adaptar eficientemente un modelo multilingüe moderno a lenguas específicas mediante extensión de vocabulario y preentrenamiento continuado, obteniendo las mejores puntuaciones en kazajo y ruso entre los tres modelos comparados, sin sacrificar el inglés. El modelo es de tipo base, pensado para fine-tuning posterior o como punto de partida para modelos conversacionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 híbrida: 32 capas (24 Gated DeltaNet con atención lineal + 8 capas de atención completa), hidden size 2.560, solo texto |
| Parametros totales | 4.246.383.616 (4,25 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (usada en entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | kazajo (kk), ruso (ru), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura Qwen3.5, un transformer híbrido con 32 capas: 24 capas de Gated DeltaNet con atención lineal y 8 capas de atención completa. El tamaño oculto es de 2.560 y las embeddings de entrada y salida están atadas (tied). El vocabulario se amplió de 248.077 a 264.077 tokens mediante BPE continuado: 16.000 nuevos merges aprendidos sobre kazajo y ruso se añadieron después de la lista de merges original de Qwen3.5, preservando los IDs y reglas originales, de modo que el inglés y el código se tokenizan exactamente igual que en el modelo base.

El entrenamiento se realizó en dos fases. En la fase 1 solo se entrenaron las 16.000 nuevas filas de embedding (inicializadas como la media de las embeddings de los tokens Qwen que reemplazan, técnica FVT), con 571 pasos, aproximadamente 16.000 secuencias de 32.768 tokens y learning rate 1e-4. En la fase 2 se entrenaron todos los pesos durante una época sobre 8,4 mil millones de tokens (40% kazajo, 20% ruso, 40% inglés), con 2.134 pasos de 120 secuencias × 32.768 tokens, learning rate 1e-5 con decaimiento coseno hasta 1e-6, warm-up del 2%, AdamW (β = 0,9/0,95), weight decay 0,1, 15 GPU H100, DeepSpeed ZeRO-2 y el framework ms-swift. Los datos de entrenamiento no se han publicado; cada fuente mantiene su propia licencia.

## Capacidades

- Generación de texto en kazajo, ruso e inglés, con especial énfasis en kazajo y ruso gracias a la tokenización optimizada.
- Modelo base: continúa texto, no sigue instrucciones de chat. No dispone de modo conversacional ni de plantilla de chat integrada.
- Tokenización eficiente: el kazajo requiere 1,76 tokens por palabra (frente a 3,48 de Qwen3.5) y el ruso 1,72 (frente a 1,89).
- El inglés se tokeniza de forma idéntica al Qwen3.5 original, conservando el rendimiento en esa lengua.
- Capacidad de servir como punto de partida para fine-tuning supervisado o para construir modelos conversacionales (existe una versión chat derivada: issai/Qwen3.5-4B-Kazakh-OptimizedTokenizer).
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo thinking en esta versión base.

## Casos de uso

- Fine-tuning para atención al cliente en kazajo y ruso: el modelo base puede adaptarse con SFT sobre datos propios del dominio, y la tokenización optimizada reduce el coste por consulta al necesitar menos tokens para el mismo texto.
- Generación de contenido editorial en kazajo: redacción de artículos, noticias o textos divulgativos; la reducción de 1,98× en tokens permite procesar documentos más largos dentro de la ventana de 32.768 tokens.
- Procesamiento de documentos legales o administrativos en ruso: la mejora de tokenización (1,10× menos tokens) abarata el procesamiento por lotes de grandes volúmenes de texto.
- Construcción de modelos conversacionales regionales: serviría como base para entrenar un chat en kazajo/ruso, como ya ha hecho ISSAI con su versión chat derivada.
- Investigación en adaptación de lenguas de bajos recursos: el modelo documenta una receta reproducible (extensión BPE + FVT + preentrenamiento en dos fases) que puede replicarse para otras lenguas.
- Generación aumentada por recuperación (RAG) en kazajo: la ventana de 32.768 tokens y la tokenización compacta permiten incluir más contexto recuperado en cada consulta.
- Traducción automática kazajo-ruso-inglés mediante fine-tuning: el modelo base multilingüe puede especializarse con pares paralelos.

## Benchmarks y rendimiento

Resultados de lm-evaluation-harness, 5-shot, conjuntos de test completos, bfloat16, mismas condiciones para los tres modelos. Tareas de kazajo y ruso son versiones de ISSAI de los benchmarks. Precisión en % (GSM8K: exact match).

| Benchmark | Qwen3.5-4B-Base | issai/Qwen3.5-4B-Base-Kazakh | Este modelo |
|---|---|---|---|
| Media kazajo (6 tareas) | 57,37 | 60,83 | 61,47 |
| Media ruso (4 tareas) | 65,37 | 64,43 | 65,55 |
| Media inglés (4 tareas) | 77,15 | 76,80 | 77,01 |

| Eficiencia de tokenizador (tokens por palabra, Belebele/FLORES, 488 pasajes) | Qwen3.5-4B-Base | issai/Qwen3.5-4B-Base-Kazakh | Este modelo |
|---|---|---|---|
| Kazajo | 3,48 | 1,83 (1,90× menos) | 1,76 (1,98× menos) |
| Ruso | 1,89 | 2,23 (1,18× más) | 1,72 (1,10× menos) |
| Inglés | 1,25 | 1,25 | 1,25 |

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 8,5 GB solo para pesos (4,25 B × 2 bytes), más overhead de activaciones y KV cache; en la práctica se recomiendan 12-16 GB para contexto moderado.
- GPU recomendadas: H100 o A100 para entrenamiento y despliegue a gran escala; RTX 4090 (24 GB) para inferencia en bf16 con contexto amplio.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en bf16; en GPUs de 8-12 GB requeriría cuantización (no se documentan formatos GGUF oficiales).
- Opciones de despliegue: transformers (librería indicada), ms-swift para fine-tuning; no se documentan integraciones oficiales con vLLM, llama.cpp, Ollama o TGI, aunque al ser compatible con transformers y safetensors podría adaptarse.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Media kazajo | Media ruso | Media inglés | Licencia |
|---|---|---|---|---|---|---|
| Qwen3.5-4B-Base | 4,25 B | 32.768 | 57,37 | 65,37 | 77,15 | Apache 2.0 |
| issai/Qwen3.5-4B-Base-Kazakh | 4,25 B | 32.768 | 60,83 | 64,43 | 76,80 | Apache 2.0 |
| Este modelo | 4,25 B | 32.768 | 61,47 | 65,55 | 77,01 | Apache 2.0 |

## Limitaciones y advertencias

- Es un modelo base: no sigue instrucciones de chat ni mantiene conversaciones multi-turno de forma nativa; requiere fine-tuning para uso conversacional.
- Sesgos conocidos: no documentados explícitamente; al entrenarse con corpus web (FineWeb-2, FinePDFs, FineWiki) puede heredar sesgos de esas fuentes.
- Riesgo de alucinación: presente como en cualquier modelo generativo; no se han publicado evaluaciones específicas de factualidad.
- Limitaciones de idioma: aunque soporta kazajo, ruso e inglés, el rendimiento en otras lenguas no está evaluado y probablemente sea inferior.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero los datos de entrenamiento no se publican y cada fuente tiene su propia licencia, lo que puede afectar a la reproducibilidad.
- El tokenizador modificado puede causar incompatibilidades con herramientas o pipelines que asuman el vocabulario original de Qwen3.5.
- No se documentan formatos de cuantización oficiales (GGUF, GPTQ, AWQ), lo que limita el despliegue en hardware de gama baja sin trabajo adicional.
- Para producción en kazajo/ruso conviene validar el rendimiento en el dominio concreto, ya que los benchmarks son genéricos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/issai/Qwen3.5-4B-Base-Kazakh-OptimizedTokenizer
- Modelo base original: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Versión anterior kazajo: https://huggingface.co/issai/Qwen3.5-4B-Base-Kazakh
- Versión chat derivada: https://huggingface.co/issai/Qwen3.5-4B-Kazakh-OptimizedTokenizer
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
- ms-swift: https://github.com/modelscope/ms-swift
