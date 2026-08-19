# BananaMind/BananaMind-2-Pro

## Resumen

BananaMind-2-Pro es un modelo de lenguaje pequeño (SLM) de tipo decoder-only, entrenado desde cero por BananaMind. Según la model card, tiene 138.971.520 parámetros, aunque los pesos en safetensors indican 159.943.040 (discrepancia que se debe verificar). El preentrenamiento completo procesó 99.999.449.088 tokens (el objetivo programado de un currículo de 100B) durante 184.954 pasos de optimización. Es un modelo base, no ajustado para instrucciones ni chat, diseñado para tareas de generación de texto en inglés con una ventana de contexto de 3.072 tokens y un tokenizador BPE a nivel de byte de 32.768 tokens, consciente de dígitos.

Su relevancia radica en que demuestra que modelos con menos de 200M parámetros pueden alcanzar resultados competitivos en razonamiento de sentido común, aritmética y generación de código con un presupuesto de entrenamiento relativamente bajo (83.382,91 PFLOPs estimados). La arquitectura emplea grouped-query attention, normalización QK, RoPE, SwiGLU, RMSNorm y embeddings atados, lo que lo hace eficiente en memoria y adecuado para despliegue en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only Transformer con GQA, QK norm, RoPE, SwiGLU, RMSNorm, embeddings atados |
| Parametros totales | 138.971.520 (model card) / 159.943.040 (safetensors) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 3.072 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | bananamind-community-license-1.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un Transformer decoder-only con 24 capas, tamaño oculto de 640, MLP intermedio de 1.920, 8 cabezas de consulta y 4 cabezas KV (grouped-query attention). Incluye normalizacion QK para estabilizar los logits de atencion, RoPE con theta 100.000 como embeddings posicionales, SwiGLU en el MLP, RMSNorm (epsilon 1e-6) y embeddings de entrada/salida atados. El tokenizador es un BPE a nivel de byte de 32.768 tokens, disenado para ser consciente de digitos. El entrenamiento se realizo sobre 99.999.449.088 tokens (objetivo de 100B) con un curriculo que combina los datasets FineWeb-Edu, DCLM-baseline, SmolLM-corpus y FineMath. El computo total estimado es de 83.382,91 PFLOPs, calculado con la formula 6 × parametros × tokens.

## Capacidades

- Generacion de texto en ingles mediante prompts de continuacion (estilo base, no chat).
- Razonamiento de sentido comun: resultados en ARC Easy (53,58%), ARC Challenge (27,82%), PIQA (67,52%) y HellaSwag (42,78%).
- Aritmetica basica: ArithMark 3 (38,20%) y ArithMark 2 (32,08%).
- Generacion de codigo: Code Elo de 1407 en la categoria de completado de codigo de Base Bench 1.1.
- No soporta tool calling ni function calling (es un modelo base).
- No soporta agentes ni razonamiento multi-paso mas alla de la generacion autoregresiva estandar.
- Capacidades multilingues: no, solo ingles.
- Sin modo thinking, vision ni audio.

## Casos de uso

- Generacion de texto de continuacion en ingles: adecuado para autocompletado de documentos, redaccion de borradores o generacion de contenido donde se requiera un modelo base ligero y rapido.
- Prototipado de aplicaciones NLP: su tamano reducido permite iterar rapidamente en entornos de desarrollo sin necesidad de infraestructura costosa.
- Educacion e investigacion: util para estudiar el comportamiento de modelos pequenos entrenados con curriculos de datos especificos, comparar metodologias de preentrenamiento o analizar la relacion entre computo y rendimiento.
- Generacion de codigo en entornos con recursos limitados: con menos de 160M parametros, puede ejecutarse en CPU o GPU de baja gama, lo que lo hace viable para asistentes de codigo locales o integraciones en herramientas de desarrollo.
- Evaluacion de tecnicas de entrenamiento: su diseno permite reproducir experimentos de escalado a pequena escala, validando hipotesis antes de aplicar a modelos mayores.
- Integracion en pipelines de generacion de texto donde se requiera baja latencia y footprint reducido, como sistemas de autocompletado en tiempo real o chatbots simples basados en continuacion.

## Benchmarks y rendimiento

La model card proporciona la siguiente tabla comparativa:

| Benchmark | BananaMind-2-Pro | BananaMind-2-Pro-Preview | GPT-X2.5-135M | BananaMind-2-Medium | GPT-2 |
|---|---:|---:|---:|---:|---:|
| Parametros entrenables | 139M | 139M | 135M | 49.6M | 124M |
| ARC Easy | 53.58% | 51.01% | 51.81% | 43.81% | 39.35% |
| ARC Challenge | 27.82% | 27.13% | 29.18% | 25.34% | 22.35% |
| PIQA | 67.52% | 66.76% | 69.42% | 61.86% | 62.08% |
| HellaSwag | 42.78% | 39.83% | 40.57% | 32.43% | 31.26% |
| ArithMark 3 | 38.20% | 38.90% | 38.10% | 36.20% | 35.70% |
| ArithMark 2 | 32.08% | 28.60% | N/A | 28.20% | 26.48% |
| INT Index | 24.96 | 23.04 | 25.17 | 15.37 | N/A |
| Code Elo | 1407 | 1295 | 1253 | 1034 | 996 |
| Base Bench 1.1 Elo | 1124 | 1106 | 1106 | 1034 | 996 |

Ademas, el checkpoint final medido con batch 1 obtiene 1132 Elo, 236/350 casos correctos (67,43%) y 64,69% de precision ponderada en Base Bench 1.1. El INT Index se calcula normalizando por azar sobre HellaSwag, la media de ARC Easy y ARC Challenge, PIQA y ArithMark 3.

## Requisitos de hardware

- El modelo ocupa aproximadamente 556-640 MB en FP32 y 278-320 MB en FP16/BF16, segun el conteo de parametros (139M o 160M).
- Puede ejecutarse en GPU con 4 GB de VRAM o menos; tambien es viable en CPU con suficiente RAM (al menos 1 GB para los pesos).
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM, como GTX 1650, RTX 3050, o superiores.
- Opciones de despliegue: al ser un modelo transformers estandar, puede usarse con HuggingFace transformers (con `trust_remote_code=True`), y es convertible a GGUF para llama.cpp u Ollama. Tambien es compatible con vLLM o TGI si se registra la arquitectura personalizada.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

BananaMind-2-Pro se compara directamente con GPT-X2.5-135M (135M parametros, contexto 2.048 tokens) y GPT-2 (124M parametros, contexto 1.024 tokens). Frente a GPT-2, supera en todos los benchmarks publicados. Frente a GPT-X2.5-135M, es superior en ARC Easy, HellaSwag, ArithMark 2, Code Elo y Base Bench 1.1, pero inferior en ARC Challenge y PIQA. Su contexto de 3.072 tokens es mayor que el de ambas alternativas. La licencia es propietaria (bananamind-community-license-1.0), mientras que GPT-2 es MIT y GPT-X2.5 no se especifica en la informacion disponible. No se dispone de comparacion con otros modelos de la misma categoria como SmolLM-135M, aunque se menciona en la tabla de INT Index vs computo que SmolLM-135M alcanza un INT Index de 25.74 con 484.254 PFLOPs de entrenamiento.

## Limitaciones y advertencias

- Es un modelo base, no ajustado para instrucciones; requiere prompts de continuacion y no responde a comandos conversacionales.
- Solo soporta ingles; no hay evidencia de capacidades multilingues.
- Ventana de contexto limitada a 3.072 tokens, inferior a la de modelos modernos de tamano similar.
- La licencia "bananamind-community-license-1.0" es propietaria; se debe revisar el texto completo para conocer restricciones de uso comercial y redistribucion.
- Discrepancia en el numero de parametros entre la model card (138.971.520) y los pesos safetensors (159.943.040); se recomienda verificar cual es el valor correcto antes de usarlo en produccion.
- Al estar entrenado con datos web, puede heredar sesgos presentes en esos corpus; no se documentan evaluaciones de sesgo especificas.
- Riesgo de alucinacion inherente a los modelos de lenguaje, especialmente en tareas de generacion abierta.
- La arquitectura personalizada requiere `trust_remote_code=True` en HuggingFace, lo que implica ejecutar codigo del repositorio del autor.

## Enlaces

- HuggingFace: https://huggingface.co/BananaMind/BananaMind-2-Pro
- No se proporcionan otros enlaces (papers, blogs, repos) en la informacion disponible.
