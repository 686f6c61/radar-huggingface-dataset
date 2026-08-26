# Evicka/Hanse2-100M-Base

## Resumen

Hanse2-100M-Base es un modelo de lenguaje causal bilingüe alemán-inglés de 99.144.320 parámetros, desarrollado por Evicka y publicado en Hugging Face bajo licencia Apache-2.0. Se trata de un modelo base, entrenado desde cero con 19.999.752.192 tokens (aproximadamente 201,7 tokens por parámetro), diseñado como punto de partida para preentrenamiento continuado, ajuste por instrucciones o investigación en modelos pequeños bilingües. Su arquitectura sigue el diseño Llama-style con atención por grupos (GQA) y una ventana de contexto progresiva de hasta 8.192 tokens, lo que lo hace relevante para tareas de generación de texto y evaluación en alemán e inglés con un presupuesto de cómputo muy reducido.

El modelo se distingue por haber sido preentrenado en una sola GPU AMD Radeon RX 9070 XT de 16 GB, con un currículo de tres fases que extiende el contexto de 2K a 8K tokens. Incluye un tokenizador BPE byte-level propio de 32.000 tokens, diseñado para un reparto aproximado de 56% alemán y 44% inglés en los datos de entrenamiento. Al ser un modelo base, no está ajustado para chat ni alineado con seguridad, por lo que se recomienda su uso en investigación y como base para post-entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Llama-style Transformer (decoder-only causal) |
| Parámetros totales | 99.144.320 |
| Parámetros activos | No disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens (configurada) |
| Tipos de cuantización | No disponible (pesos en safetensors, entrenado en bfloat16) |
| Idiomas soportados | Alemán (56% aprox.) e inglés (44% aprox.) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Hanse2-100M-Base emplea una arquitectura transformer decoder-only de estilo Llama, con 16 capas, tamaño de ocultación de 640, 10 cabezas de atención y 2 cabezas KV (grouped-query attention), con dimensión de cabeza de 64 y capa intermedia de 2.048. Utiliza embeddings atados (tied embeddings) y codificación posicional RoPE con θ = 10.000. El entrenamiento se realizó en precisión bfloat16 sobre una única GPU AMD Radeon RX 9070 XT de 16 GB, con un tamaño de lote efectivo de aproximadamente 131.072 tokens por paso de optimización.

El preentrenamiento se dividió en tres fases: la primera, de ~15.000 millones de tokens con contexto de 2.048; la segunda, de ~4.000 millones de tokens con contexto de 4.096 y una mezcla de datos de mayor calidad; y la tercera, de ~1.000 millones de tokens con contexto de 8.192 y una tasa de aprendizaje en decaimiento coseno. La mezcla de datos proviene de FineWeb alemán (43,5%), FineWeb-Edu inglés (39%), FineWiki alemán (12,5%) y FineWiki inglés (5%). El tokenizador es un BPE byte-level propio de 32.000 tokens entrenado sobre una mezcla germano-inglesa. No se aplicó RLHF ni DPO; el modelo es un base model sin ajuste por preferencias.

## Capacidades

- Generación de texto causal en alemán e inglés, completando secuencias de forma autónoma.
- Razonamiento básico y comprensión lingüística en tareas de evaluación (ARC, HellaSwag, BoolQ, BLiMP, etc.), con mejor rendimiento en alemán que en inglés según los benchmarks publicados.
- Soporte de contexto largo hasta 8.192 tokens, con capacidad de procesamiento estable hasta ~7.700 tokens en pasadas finitas.
- No incluye soporte de tool calling, agentes, ni modo de razonamiento explícito (thinking mode) al ser un modelo base.
- Capacidades multilingües limitadas a alemán e inglés, sin soporte de visión ni audio.

## Casos de uso

- Fine-tuning para tareas específicas en alemán: el modelo puede servir de base para entrenar clasificadores de sentimiento, sistemas de extracción de información o modelos de respuesta a preguntas en alemán, aprovechando su vocabulario y representaciones lingüísticas específicas.
- Investigación en eficiencia de entrenamiento: al ser un modelo pequeño (99M) entrenado con 20B tokens en una sola GPU, es adecuado para estudiar el efecto del currículo de contexto, la mezcla de datos y las técnicas de regularización en modelos bilingües.
- Generación de texto en alemán para prototipos: se puede usar para generar borradores de textos, resúmenes o contenido creativo en alemán, aunque con calidad limitada por su tamaño y por ser un modelo base.
- Preentrenamiento continuado en dominios específicos: su licencia Apache-2.0 y tamaño compacto lo hacen útil para experimentos de adaptación a dominios técnicos o jurídicos en alemán e inglés, sin necesidad de recursos masivos.
- Evaluación de técnicas de post-entrenamiento: al ser un modelo base sin ajuste por preferencias, sirve como punto de partida para probar métodos de RLHF, DPO o ajuste por instrucciones en escenarios de bajo cómputo.
- Educación y enseñanza de arquitecturas transformer: su estructura Llama-style con GQA, tokenizador propio y entrenamiento reproducible lo hacen idóneo para cursos de modelos de lenguaje, demostraciones de preentrenamiento y análisis de embeddings.

## Benchmarks y rendimiento

Los resultados de la evaluación, obtenidos con EleutherAI LM Evaluation Harness en configuración 0-shot y sin chat template, comparan Hanse2-100M con Supra-50M (otro modelo pequeño de la misma autoría):

| Benchmark | Métrica | Hanse2-100M | Supra-50M |
| --- | --- | ---: | ---: |
| ARC Easy | acc_norm | 0.4306 | 0.4609 |
| ARC Challenge | acc_norm | 0.2415 | 0.2534 |
| HellaSwag | acc_norm | 0.3122 | 0.3171 |
| WinoGrande | acc | 0.4980 | 0.5107 |
| PIQA | acc_norm | 0.6083 | 0.6219 |
| OpenBookQA | acc_norm | 0.2960 | 0.3080 |
| BoolQ | acc | 0.5966 | 0.5294 |
| SciQ | acc_norm | 0.6380 | 0.6770 |
| BLiMP | acc | 0.8003 | 0.7778 |
| MultiBLiMP Alemán | acc | 0.9852 | 0.7698 |
| MultiBLiMP Alemán | acc_norm | 0.9774 | 0.6710 |

Hanse2-100M supera a Supra-50M en BoolQ, BLiMP y MultiBLiMP alemán, mientras que Supra-50M es mejor en los demás benchmarks en inglés. La pérdida de evaluación final en el split fijo bilingüe fue de aproximadamente 2.825. En una prueba diagnóstica de contexto largo (needle test) con contexto de 512 tokens, el modelo alcanza una precisión de 1.00 en todas las posiciones de la aguja; con contexto de 1.024 tokens, la precisión se mantiene en 1.00 en las posiciones probadas.

## Requisitos de hardware

- VRAM estimada: con pesos en bf16, el modelo ocupa aproximadamente 200 MB; en fp32, unos 400 MB. Con cuantización a 4 bits, puede caber en menos de 100 MB.
- GPU recomendadas: el modelo se entrenó en una AMD Radeon RX 9070 XT de 16 GB, pero la inferencia es posible en cualquier GPU con al menos 1 GB de VRAM, incluso en CPU.
- Compatibilidad con GPU de consumo: sí, cabe en cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) y también en entornos sin GPU.
- Opciones de despliegue: es compatible con la librería transformers, y puede servirse con vLLM, llama.cpp, Ollama o TGI, siempre que se adapte el formato de pesos.
- Latencia y throughput: no disponibles en la información publicada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
| --- | ---: | ---: | --- | --- | --- |
| Hanse2-100M-Base | 99.144.320 | 8.192 | Alemán, inglés | Apache-2.0 | Hugging Face |
| Supra-50M | ~50M (estimado) | no disponible | no disponible | no disponible | no disponible (aparece solo en benchmark) |
| HanseLM-78M-Base | 78M (aprox.) | no disponible | Alemán, inglés | no disponible | Hugging Face |

Hanse2-100M-Base se sitúa en la categoría de modelos pequeños bilingües (menos de 100M de parámetros). Comparado con Supra-50M, tiene aproximadamente el doble de parámetros, lo que le permite mejorar en benchmarks de alemán (MultiBLiMP) y en algunos de inglés (BoolQ, BLiMP), aunque pierde en otros como ARC y HellaSwag. Su licencia Apache-2.0 permite uso comercial y modificación, algo ventajoso frente a otros modelos pequeños con licencias más restrictivas. No se dispone de datos de rendimiento comparables con otros modelos de su tamaño más allá de Supra-50M.

## Limitaciones y advertencias

- Es un modelo base: no está ajustado para instrucciones ni para chat, y no debe usarse directamente en aplicaciones de conversación sin post-entrenamiento.
- Riesgo de alucinación: al ser un modelo causal de texto, puede generar contenido inventado o inconsistente, especialmente en contextos largos.
- Limitaciones de contexto: la ventana configurada es de 8.192 tokens, pero el modelo produce pasadas finitas solo hasta ~7.000 tokens; no garantiza recuperación fiable de información en todo el contexto.
- Sesgos lingüísticos: entrenado con 56% alemán y 44% inglés, puede presentar sesgos en vocabulario y estructuras gramaticales del alemán, y menos robustez en inglés que modelos monolingües de mayor tamaño.
- Sin alineación de seguridad: no se realizaron ajustes de seguridad, por lo que puede generar contenido inapropiado o dañino si se usa directamente.
- Sin soporte de vision, audio ni herramientas: solo generación de texto causal.
- Licencia: Apache-2.0 permite uso comercial, pero no se incluye garantía ni soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Evicka/Hanse2-100M-Base
- Modelo anterior del autor (HanseLM-78M-Base): https://huggingface.co/Evicka/HanseLM-78M-Base
- Datasets usados en preentrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2, https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu, https://huggingface.co/datasets/HuggingFaceFW/finewiki
