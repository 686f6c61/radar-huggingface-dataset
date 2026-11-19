# AxiomicLabs/GPT-X3-150M

## Resumen

GPT-X3-150M es un modelo de lenguaje base de 149,4 millones de parámetros desarrollado por Axiomic Labs, presentado como la tercera generación de su familia GPT-X. Está construido sobre la arquitectura propietaria TX5, que combina capas GDN2 (atención lineal) con capas de atención completa gated GQA en una proporción 3:1, con 24 capas en total y una longitud de contexto de 2.048 tokens. Se entrenó desde cero con un total de 75.000 millones de tokens de cómputo y aproximadamente 187.500 millones de tokens brutos.

El modelo se posiciona como un SLM (small language model) orientado a eficiencia de datos: según su model card, supera a SmolLM2-135M en el Intelligence Index de la Open SLM Leaderboard utilizando unas 27 veces menos tokens de entrenamiento. Es el primer modelo por debajo de 150M de parámetros que supera un Intelligence Index de 30 según la metodología del autor, con un valor de 33,05. Está publicado bajo licencia Apache 2.0 y solo declara soporte para inglés.

Su relevancia actual reside en la combinación de un tokenizador grande (65.536 tokens, basado en el de LFM2.5), una mezcla híbrida de atención lineal y atención completa, y un esquema de entrenamiento con predicción multi-token (TST) en la primera fase, lo que lo hace atractivo para despliegues con recursos muy limitados y para investigación sobre eficiencia de entrenamiento en modelos pequeños.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | TX5 híbrida: GDN2 (atención lineal) + gated GQA, proporción 3:1, transformer con 24 capas |
| Parámetros totales | 149.400.930 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens (block_size) |
| Tipos de cuantización | no disponible (repo en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers, requiere custom_code) |

## Arquitectura y entrenamiento

La arquitectura TX5 apila 24 capas con dimensión de embedding de 576 y vocabulario de 65.536 tokens (tokenizador LFM2.5 sin token BOS). La atención es híbrida en proporción 3:1: 18 capas GDN2 (atención lineal con 9 cabezas de dimensión 64) intercaladas con 6 capas de atención completa gated GQA (9 cabezas de consulta, 3 cabezas KV, dimensión de RoPE de 32 sobre 64). Las capas GQA incorporan normalización QK mediante OffsetRMSNorm y una puerta de salida; según el autor, las ablaciones mostraron que el esquema XSA de la generación anterior era redundante con el gating de atención. Los MLP son SwiGLU con ratio 2,75 (1.584 unidades), activación SiLU, normalización RMSNorm, embeddings atados y dropout 0. El desglose de parámetros es: 37,7M en embeddings, 38,6M en bloques GDN2, 7,3M en bloques GQA y 65,7M en los MLP.

El entrenamiento cubre 143.052 pasos en dos GPU con un batch global de 524.288 tokens de cómputo por paso. La primera fase (30% del entrenamiento) usa predicción de seis tokens objetivo por posición (TST) y después se cambia a predicción de siguiente token estándar. El optimizador es híbrido Muon + AdamW: Muon para matrices de pesos y AdamW para embeddings, normas, sesgos y demás parámetros no matriciales. La mezcla de datos es fija de nueve fuentes (frente a la mezcla progresiva de once fuentes de X2.5), con proporciones constantes durante todo el entrenamiento. Las fuentes declaradas incluyen Nemotron-ClimbMix, UltraData-Code, UltraData-Math, SFTset-SLM, FactBase-DCLM y TxT360-v2.

## Capacidades

- Generación de texto en inglés con un modelo base (no ajustado para instrucciones de forma explícita en la información disponible).
- Razonamiento aritmético básico: obtiene 50,90% en ArithMark-3, el mejor resultado de su franja de tamaño en la tabla publicada.
- Comprensión lectora y sentido común: HellaSwag 46,16%, PIQA 71,33%, ARC-Easy 59,64%, ARC-Challenge 31,31%.
- Capacidad de contexto limitada a 2.048 tokens; no se documenta extensión de contexto.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: solo inglés declarado.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Clasificación y etiquetado de texto en inglés: el modelo puede usarse como extractor de representaciones o para clasificación few-shot mediante prompting, con un coste de inferencia mínimo gracias a sus 149M de parámetros.
- Generación de texto asistida en entornos con hardware muy limitado: cabe en CPU y en GPUs de gama baja, lo que permite desplegarlo en dispositivos edge o en contenedores sin GPU para tareas de autocompletado y redacción breve.
- Filtrado y enrutamiento previo en pipelines RAG: usar el modelo como primera etapa para puntuar o resumir fragmentos cortos (hasta 2.048 tokens) antes de invocar un modelo mayor, reduciendo coste por consulta.
- Prototipado e investigación en eficiencia de entrenamiento: su receta (TST, Muon+AdamW, mezcla fija, tokenizador de 65k) sirve como referencia reproducible para estudiar curvas de escalado en modelos pequeños.
- Generación de datos sintéticos a pequeña escala: puede producir borradores de texto en inglés para aumentar datasets de tareas simples, siempre con revisión humana por el riesgo de alucinación.
- Educación y demos interactivas: al ser Apache 2.0 y ligero, es adecuado para notebooks, cursos y demos de generación de texto en navegador o en hardware de consumo.
- Evaluación comparativa de tokenizadores: el uso del tokenizador LFM2.5 con 65k tokens permite experimentar con eficiencia de tokenización frente a vocabularios más pequeños en tareas de inglés.

## Benchmarks y rendimiento

Datos publicados en la model card (metodología de la Open SLM Leaderboard del autor):

| Modelo | Parámetros | Int Index | HellaSwag | ARC-Easy | ARC-Challenge | PIQA | ArithMark-3 |
|---|---:|---:|---:|---:|---:|---:|---:|
| GPT-X3-150M | 149M | 33,05 | 46,16% | 59,64% | 31,31% | 71,33% | 50,90% |
| LFM2.5-350M-Base | 354,5M | 30,50 | 44,98% | 68,86% | 40,96% | 67,68% | 35,90% |
| Boris-2-Preview-1 | 144M | 27,91 | 45,23% | 58,38% | 29,95% | 69,21% | 37,60% |
| cagliostro-v3.5 | 146,35M | 27,49 | 43,41% | 53,75% | 29,35% | 68,06% | 45,30% |
| SmolLM2-135M | 135M | 27,13 | 43,22% | 58,63% | 29,69% | 68,44% | 39,20% |
| GPT-X2.5-135M | 135M | 25,17 | 40,57% | 51,81% | 29,18% | 69,42% | 38,40% |
| Gemma-3-270M | 268,1M | 25,16 | 41,33% | 57,11% | 28,24% | 68,66% | 35,60% |
| MobileLLM-R1-140M-base | 140M | 24,64 | 33,84% | 49,92% | 24,74% | 63,22% | 65,70% |
| GPT-2 Medium | 354,8M | 19,68 | 39,33% | 43,35% | 24,91% | 66,10% | 34,60% |
| GPT-2 (124M) | 124M | 13,58 | 31,26% | 39,35% | 22,35% | 62,08% | 35,70% |

El Intelligence Index normaliza por azar HellaSwag, ARC combinado, PIQA y ArithMark-3 con pesos 1,00, 1,00, 1,00 y 0,65 respectivamente. No se han publicado resultados de MMLU, HumanEval ni GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 300 MB de pesos (149,4M × 2 bytes) más overhead de activaciones y caché KV; en la práctica, menos de 1 GB.
- En cuantización de 8 bits: unos 150 MB de pesos; en 4 bits: unos 75 MB (estimación teórica; no se documentan artefactos cuantizados oficiales).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; RTX 3060/4060, T4, L4 y superiores son suficientes. También funciona en CPU.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: transformers con `trust_remote_code=True` (requiere custom_code por la arquitectura TX5); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, y la arquitectura híbrida GDN2 probablemente requiera soporte específico.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Int Index | Licencia | Disponibilidad |
|---|---:|---:|---:|---|---|
| GPT-X3-150M | 149M | 2.048 | 33,05 | Apache 2.0 | Hugging Face (transformers, custom_code) |
| SmolLM2-135M | 135M | no disponible en la información | 27,13 | no disponible en la información | Hugging Face |
| LFM2.5-350M-Base | 354,5M | no disponible en la información | 30,50 | no disponible en la información | Hugging Face |
| Gemma-3-270M | 268,1M | no disponible en la información | 25,16 | no disponible en la información | Hugging Face |

GPT-X3-150M lidera el Intelligence Index del autor en su franja, con ventaja clara en ArithMark-3 frente a SmolLM2-135M y LFM2.5-350M-Base, aunque pierde en ARC-Easy y ARC-Challenge frente a LFM2.5-350M-Base y en ArithMark-3 frente a MobileLLM-R1-140M-base (65,70%). La comparación debe tomarse con cautela porque el índice y ArithMark-3 son métricas propias del autor.

## Limitaciones y advertencias

- Modelo base: no está ajustado para seguir instrucciones ni para diálogo; requiere fine-tuning o prompting específico para tareas conversacionales.
- Solo inglés declarado; el rendimiento en castellano u otros idiomas no está documentado y previsiblemente será deficiente.
- Contexto corto de 2.048 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Riesgo de alucinación inherente a un modelo de 149M entrenado con 75B tokens de cómputo; no debe usarse en producción para generación factual sin verificación.
- Sesgos: no se documenta ninguna evaluación de sesgos, toxicidad o seguridad en la información disponible.
- Los benchmarks proceden de la leaderboard del propio autor, con una métrica propietaria (Intelligence Index) y ArithMark-3; conviene contrastarlos con evaluaciones independientes.
- La arquitectura TX5 requiere `trust_remote_code=True` y código personalizado; la compatibilidad con ecosistemas de inferencia optimizados (vLLM, llama.cpp, TGI) no está confirmada.
- Licencia Apache 2.0 permite uso comercial, pero al ser un modelo base sin salvaguardas, la responsabilidad sobre el contenido generado recae en el integrador.
- El tokenizador LFM2.5 se usa sin token BOS, lo que puede requerir ajustes en pipelines estándar de transformers.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AxiomicLabs/GPT-X3-150M
- Open SLM Leaderboard: https://huggingface.co/spaces/AxiomicLabs/Open_SLM_Leaderboard
- Dataset Nemotron-ClimbMix: https://huggingface.co/datasets/nvidia/Nemotron-ClimbMix
- Dataset UltraData-Code: https://huggingface.co/datasets/openbmb/UltraData-Code
- Dataset UltraData-Math: https://huggingface.co/datasets/openbmb/UltraData-Math
- Dataset SFTset-SLM: https://huggingface.co/datasets/AxiomicLabs/SFTset-SLM
- Dataset FactBase-DCLM: https://huggingface.co/datasets/AxiomicLabs/FactBase-DCLM
- Dataset TxT360-v2: https://huggingface.co/datasets/IFM/TxT360-v2
