# angelgodbrokenns/zen-0.1

## Resumen

zen-0.1 es un modelo de lenguaje de pequeno tamano (176,2 millones de parametros) entrenado **desde cero** por el usuario angelgodbrokenns sobre 2 GPU NVIDIA T4 en Kaggle. No es un ajuste fino de un modelo existente, sino un entrenamiento completo con arquitectura tipo Llama, pensado como experimento de viabilidad para reproducir un SLM en hardware de consumo. El modelo resuelve generacion de texto conversacional basica en ingles y sirve como banco de pruebas educativo para quienes quieren entender el ciclo completo de entrenamiento de un transformer.

El modelo es relevante ahora por su transparencia: publica la mezcla de datos exacta, el numero de tokens vistos (189M), los pasos (1443) y el tiempo de entrenamiento (10 horas en 2x T4). Es un ejemplo de "modelo de bolsillo" que documenta todo el proceso, aunque sus resultados estan muy por debajo de alternativas como SmolLM2-135M o KLM 1.6 en los benchmarks publicados.

La arquitectura es un transformer decoder-only de tipo Llama con GQA, RoPE, SwiGLU, RMSNorm y embeddings atados, con contexto de entrenamiento de 1024 tokens y tokenizer de SmolLM2 (49k BPE). La licencia no esta determinada: el autor indica explicitamente que hay que revisar las licencias de todos los datasets de entrenamiento antes de elegir una.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama (decoder-only transformer, GQA, RoPE, SwiGLU, RMSNorm, tied embeddings) |
| Parametros totales | 176.195.328 (176,2M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens (entrenamiento) |
| Tipos de cuantizacion | F16, Q8_0 (GGUF publicados); otras cuantizaciones GGUF no disponibles |
| Idiomas soportados | en (ingles) |
| Licencia | other / unverified (no determinada; pendiente de revisar licencias de datasets) |
| Formato de pesos | safetensors, GGUF (F16, Q8_0) |
| Capas / hidden / cabezas (kv) | 22 / 768 / 12 (4) |
| Tokenizer | SmolLM2 (49k BPE) |
| Tokens vistos en entrenamiento | 189M |
| Pasos de entrenamiento | 1443 |
| Precision de entrenamiento | fp16 mixed |
| Tamano del repo | 1,8 GB |

## Arquitectura y entrenamiento

zen-0.1 es un transformer decoder-only con la configuracion clasica de Llama: 22 capas, dimension oculta de 768, 12 cabezas de atencion con 4 cabezas KV (GQA), RoPE para codificacion posicional, activacion SwiGLU, normalizacion RMSNorm y embeddings atados entre entrada y salida. El tokenizer es el de SmolLM2, con vocabulario BPE de 49k tokens. El contexto de entrenamiento es de solo 1024 tokens, lo que limita seriamente el uso en tareas que requieran ventanas largas.

El entrenamiento se realizo desde cero en 2x NVIDIA T4 (Kaggle) durante 10 horas, con 1443 pasos y 189M tokens vistos en precision fp16 mixta. La mezcla de datos es notablemente heterogenea y cambia a lo largo del entrenamiento: fineweb-edu pasa del 65% al 30%, smollm-corpus del 30% al 18%, y se incorporan progresivamente datasets de matematicas (MathGLM-500k, 0% a 5%), trazas de modelos grandes (FABLE.5-traces-2M del 2% al 10%, FABLE-5.2-MAX-DATABASE del 1% al 7%), un dataset agregado de trazas de modelos frontera (Sonnet/Opus/Gemini/GPT/GLM/DeepSeek, 0% a 15%) y GLM-5.1-Reasoning-1M-Cleaned (2% a 15%). No se documenta RLHF, DPO ni ninguna fase de alineamiento posterior al preentrenamiento.

La innovacion tecnica destacable es la propia transparencia del proceso: el autor publica la curva de mezcla de datos, el numero exacto de pasos y los resultados 0-shot con lm-evaluation-harness. No hay decodificacion especulativa, atencion lineal ni tecnicas avanzadas de inferencia; es un entrenamiento de referencia minimo.

## Capacidades

- Generacion de texto basica en ingles, con calidad limitada y tendencia a la repeticion.
- Razonamiento aritmetico muy debil: en el ejemplo publicado con `1+8/1*10+2=` produce una cadena de decimales incorrecta en lugar del resultado.
- Conversacion multi-turno con formato ChatML (`<|im_start|>user ... <|im_end|>`), aunque las respuestas publicadas muestran confusion y divagacion.
- No hay soporte documentado de tool calling ni function calling.
- No hay soporte documentado de agentes ni razonamiento multi-paso fiable.
- Multilingue: solo ingles declarado; sin capacidades multilingues verificadas.
- Sin vision, audio ni modo "thinking" explicito.
- Capacidad de continuacion de texto (prompt completion) en dominios generales.

## Casos de uso

- **Educacion y docencia sobre entrenamiento de LLM**: el modelo sirve como caso de estudio completo para explicar a estudiantes como se entrena un transformer desde cero, con mezcla de datos, pasos y curvas publicadas. Es adecuado porque todo el pipeline esta documentado y el coste de reproduccion es bajo (2x T4, 10 horas).
- **Prototipado rapido de pipelines de inferencia**: util para probar integraciones con `transformers`, `llama.cpp`, Ollama o TGI antes de pasar a un modelo mayor. Su tamano (176M) permite iterar en minutos en cualquier maquina.
- **Pruebas de cuantizacion y despliegue en CPU**: los GGUF F16 y Q8_0 permiten validar flujos de `llama-cli` y `ollama run hf.co/...` en hardware modesto, midiendo latencia y consumo sin coste de GPU.
- **Generacion de texto creativo de baja exigencia**: continuacion de prompts, ejercicios de escritura o generacion de borradores donde la correccion factual no sea critica. Adecuado por su bajo coste, no por su calidad.
- **Investigacion sobre mezcla de datos**: el cambio progresivo de la mezcla (de fineweb-edu mayoritario a un 30% de trazas de modelos grandes) es un experimento replicable para estudiar como afecta la composicion del dataset a las capacidades emergentes en modelos pequenos.
- **Base para experimentos de ajuste fino**: al ser un modelo from-scratch con safetensors, sirve como punto de partida para probar LoRA o SFT en tareas concretas y comparar con bases como SmolLM2-135M.
- **Benchmarking de harness**: util para validar configuraciones de `lm-evaluation-harness` en modelos diminutos antes de lanzar evaluaciones costosas.

## Benchmarks y rendimiento

Resultados 0-shot con `lm-evaluation-harness` (acc_norm donde esta disponible, si no acc), segun la model card:

| Modelo | Parametros | ARC-Easy | ARC-Challenge | HellaSwag | PIQA | LAMBADA | Media |
|---|---|---|---|---|---|---|---|
| KLM 1.6 | 99,0M | **61,07%** | 33,53% | 45,28% | 70,18% | **55,90%** | **53,19%** |
| GPT-X3-150M | 149M | 59,64% | 31,31% | **46,16%** | **71,33%** | 50,90% | 51,87% |
| KLM 1.5 | 99,0M | 59,68% | 32,68% | 43,74% | 68,55% | 48,20% | 50,57% |
| SmolLM2-135M | 135M | 58,63% | 29,69% | 43,22% | 68,44% | 39,20% | 47,84% |
| LFM-2.5-230M-Base | 230M | 59,72% | **34,98%** | 39,29% | 63,38% | 36,60% | 46,79% |
| void.1 | 90,1M | 49,32% | 29,35% | 39,46% | 67,19% | 43,70% | 45,80% |
| **zen-0.1** | 176,2M | 33,96% | 21,67% | 26,02% | 55,17% | 7,28% | 28,82% |

Nota del autor: los numeros de los demas modelos son los reportados por sus autores y las configuraciones de evaluacion pueden diferir. zen-0.1 queda ultimo en las cinco tareas, con una diferencia especialmente pronunciada en LAMBADA (7,28% frente a 36,60% del siguiente peor). No se han publicado resultados de MMLU, HumanEval ni GSM8K en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: en fp16, aproximadamente 0,35 GB de pesos mas overhead de activaciones y cache KV; en Q8_0, alrededor de 0,18-0,2 GB. Cabe holgadamente en cualquier GPU consumer.
- **GPU recomendadas**: cualquier GPU con al menos 1-2 GB de VRAM; T4, RTX 3060, RTX 4090, A100 o H100 son sobredimensionadas para este modelo. Tambien funciona en CPU.
- **Consumer GPU**: si, cabe en GTX 1050 Ti, GTX 1650, RTX 3050 y superiores; incluso en iGPU con suficiente memoria compartida.
- **Opciones de despliegue**: `transformers` (AutoModelForCausalLM), `llama.cpp` (`llama-cli -hf angelgodbrokenns/zen-0.1:Q8_0`), Ollama (`ollama run hf.co/angelgodbrokenns/zen-0.1:Q8_0`), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible` en Hugging Face). vLLM no esta documentado para este modelo.
- **Latencia y throughput**: no disponibles en la informacion proporcionada. Por tamano, se espera inferencia en tiempo real incluso en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Media benchmarks | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| **zen-0.1** | 176,2M | 1024 | 28,82% | other / unverified | Hugging Face (safetensors + GGUF) |
| SmolLM2-135M | 135M | no disponible en la info | 47,84% | no disponible en la info | Hugging Face |
| KLM 1.6 | 99,0M | no disponible en la info | 53,19% | no disponible en la info | Hugging Face |
| LFM-2.5-230M-Base | 230M | no disponible en la info | 46,79% | no disponible en la info | Hugging Face |

zen-0.1 tiene mas parametros que SmolLM2-135M y KLM 1.6, pero rinde entre 19 y 24 puntos porcentuales por debajo en la media de los cinco benchmarks. La comparacion sugiere que el presupuesto de computo (189M tokens vistos, 10 horas en 2x T4) es insuficiente para aprovechar la capacidad del modelo. Los datos de contexto y licencia de los competidores no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- **Alucinacion severa**: el propio autor lo advierte; en el ejemplo publicado, a la pregunta "The capital of France is" responde "the capital of the United States" y entra en bucle repitiendo la misma frase.
- **Errores aritmeticos**: el ejemplo `1+8/1*10+2=` produce una cadena de decimales incorrecta; no es fiable para matematicas.
- **Contexto muy corto**: 1024 tokens de entrenamiento limitan conversaciones multi-turno y documentos largos.
- **Solo ingles**: no hay capacidades multilingues declaradas ni verificadas.
- **Licencia no determinada**: el autor indica que hay que revisar las licencias de todos los datasets de entrenamiento (fineweb-edu, smollm-corpus, MathGLM, FABLE, GLM, etc.) antes de elegir una. No apto para uso comercial sin aclarar la licencia.
- **No apto para produccion**: el autor lo declara explicitamente; es un modelo experimental.
- **Riesgo de sesgos**: los datasets de trazas de modelos frontera pueden introducir sesgos y estilos de respuesta no verificados; no hay evaluacion de sesgos publicada.
- **Repeticion y divagacion**: los samples publicados muestran bucles y respuestas incoherentes, tipico de modelos pequenos con pocos tokens de entrenamiento.
- **Sin alineamiento**: no hay RLHF ni DPO documentados, por lo que no hay garantias de comportamiento seguro.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/angelgodbrokenns/zen-0.1
- Dataset fineweb-edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset smollm-corpus: https://huggingface.co/datasets/HuggingFaceTB/smollm-corpus
- Dataset MathGLM-500k: https://huggingface.co/datasets/jonathanasdf/MathGLM-dataset-500k
- Dataset Complete-FABLE.5-traces-2M: https://huggingface.co/datasets/Crownelius/Complete-FABLE.5-traces-2M
- Dataset FABLE-5.2-MAX-DATABASE: https://huggingface.co/datasets/Claux67/FABLE-5.2-MAX-DATABASE
- Dataset de trazas de modelos frontera: https://huggingface.co/datasets/VINAY-UMRETHE/Sonnet-Opus-4.5-4.6-Gemini-3.0-3.1-Pro-GPT-5-5.1-5.2-GLM-4.7-MiniMax-M2.1-DeepSeek-V3.2-High
- Dataset GLM-5.1-Reasoning-1M-Cleaned: https://huggingface.co/datasets/Jackrong/GLM-5.1-Reasoning-1M-Cleaned
- Paper, blog o repositorio adicional: no disponible en la informacion proporcionada.
