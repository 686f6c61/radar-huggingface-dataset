# eThAn18594/Kunwu-1-Wei-Base

## Resumen

Kunwu-1-Wei-Base es un modelo de lenguaje base de 2,19 millones de parámetros entrenado desde cero por Kiln Labs. No se trata de una versión reducida de una arquitectura Llama, sino de un diseño propio denominado WeiNet-v2b, concebido específicamente para operar con eficiencia en el rango inferior a los 3 millones de parámetros. El modelo se distribuye con pesos en FP32 en formato safetensors bajo licencia Apache 2.0 y requiere `trust_remote_code=True` para cargarse con Transformers.

El modelo resuelve un problema de investigación concreto: explorar cuánto rendimiento se puede extraer de un presupuesto de parámetros extremadamente reducido mediante decisiones arquitectónicas y de optimización, en lugar de mediante escalado. Según la model card, en ablaciones controladas de 24,6 millones de tokens frente a una base Llama de 2,2 millones de parámetros, la combinación de WeiNet-v2b con el optimizador Muon reduce la pérdida de validación en 0,58 nats, bajando la perplejidad de 88,58 a 49,57.

Tras 6.000 millones de tokens de preentrenamiento, el checkpoint publicado alcanza una entropía cruzada de validación de 3,1393 sobre FineWeb-Edu y un 27,40 % de `acc_norm` zero-shot en HellaSwag. Es un modelo de completado de texto en inglés, sin ajuste por instrucciones, orientado a experimentación e investigación más que a producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `WeiNetForCausalLM` (Transformer pre-norm con modificaciones propias, `trust_remote_code=True`) |
| Parámetros totales | 2.194.416 (con embeddings atados); 1.539.056 sin embeddings |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantización | no disponible (el checkpoint publicado es FP32; no se documentan variantes GGUF ni cuantizadas) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (FP32) |

Otros datos de la model card: 7 capas únicas, tamaño oculto 160, FFN intermedio 384 con activación `CG-ReLU^2`, atención GQA 4Q:2KV con `head_dim=40`, RoPE parcial al 50 % y QK-RMSNorm. Tokenizador BPE byte-level propio de 4.096 tokens con separación de dígitos individuales. Entrenado con 6.000 millones de tokens.

## Arquitectura y entrenamiento

WeiNet-v2b parte de un Transformer pre-norm estándar e introduce tres modificaciones. Primero, un *Bilinear Morphological Micro-Stem*: antes de la primera capa, los embeddings normalizados pasan por una convolución depthwise causal de 3 taps con gating multiplicativo, definida como `e + s * sigmoid(G(en)) * (en * Conv3(en))`, que fusiona subpalabras fragmentadas y dígitos adyacentes de forma temprana. Segundo, dos flujos residuales paralelos (`mHC-2`) que se mezclan mediante una matriz 2x2 doblemente estocástica aprendida `[[p, 1-p], [1-p, p]]` con norma espectral <= 1, con un coste de 16 escalares por capa. Tercero, una activación `CG-ReLU^2` de doble escala y coste O(T), que elimina la tercera matriz de puerta de SwiGLU para liberar presupuesto hacia `d_ff=384`; las activaciones se modulan con una puerta de rango 24 condicionada por una media móvil de 16 tokens y una media causal de secuencia calculada en una sola pasada de `cumsum`. Cada bloque aplica además una convolución depthwise pre-atención de 4 taps, Value Residuals en la capa 0 y una puerta de salida sigmoide por cabeza con inicialización abierta.

El entrenamiento usa un esquema híbrido Muon + AdamW (`lr=6e-3`, `wd=0.05`, 5 pasos de Newton-Schulz sobre matrices 2D ocultas; AdamW con `lr=3e-3` para embeddings, convoluciones y parámetros 1D), Z-Loss de `1e-4` y un lote global de 131.072 tokens con schedule WSD. La etapa 1 (0 a 4.000 millones de tokens, LR constante tras 500 pasos de warmup) mezcla 50 % fineweb-edu (`score>=3`), 25 % smollm-corpus (cosmopedia-v2), 15 % finemath (`finemath-4plus`) y 10 % texto aritmético procedural. La etapa 2 (4.000 a 6.000 millones, decaimiento coseno a 0, solo datos públicos) combina 26 % dclm-edu, 22 % fineweb-edu (`score>=3.5`), 12 % cosmopedia (wikihow y openstax, sin encabezados Markdown), 6 % Wikipedia en inglés, 14 % finemath y 20 % orca-math-word-problems-200k en texto plano. No se aplicó destilación de profesor ni RLHF/DPO.

## Capacidades

- Generación de texto autoregresiva en inglés mediante completado de prompts; es un modelo base, no ajustado por instrucciones.
- Razonamiento aritmético básico, reforzado por el 10 % de texto aritmético procedural en la etapa 1 y el 20 % de problemas matemáticos en la etapa 2.
- Comprensión lectora y sentido común a nivel elemental, medido en HellaSwag, ARC y PIQA.
- Manejo de fragmentación subpalabra y dígitos individuales gracias al tokenizador propio y al micro-stem convolucional.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no; solo inglés.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Investigación en arquitecturas de lenguaje de escala extrema: el modelo sirve como banco de pruebas reproducible para estudiar el efecto de componentes como mHC-2, `CG-ReLU^2` o el optimizador Muon en presupuestos de 2M parámetros, comparando directamente contra la ablación Llama-2.2M publicada.
- Experimentos de tokenización: su BPE byte-level de 4.096 tokens con separación de dígitos permite analizar cómo afecta la granularidad del vocabulario al rendimiento en tareas aritméticas con modelos diminutos.
- Docencia y divulgación: al caber en cualquier GPU consumer y entrenarse en minutos u horas, es adecuado para explicar el ciclo completo de preentrenamiento, schedule WSD y evaluación zero-shot con `lm_eval`.
- Generación de texto de completado corto en inglés: con contexto de 1.024 tokens y salidas de decenas de tokens, puede usarse para demostraciones de autocompletado controlado con `do_sample=False`.
- Evaluación de pipelines de inferencia: sirve para validar integraciones con Transformers y `trust_remote_code` en entornos de CI antes de desplegar modelos mayores con código remoto.
- Estudio de calibración y perplejidad: su CE de validación de 3,1393 sobre FineWeb-Edu permite usarlo como referencia de línea base en experimentos de curriculum de datos y mezclas de corpus educativos.
- Reproducción de ablaciones de optimizadores: la comparativa AdamW frente a Muon + AdamW publicada facilita replicar estudios sobre optimizadores en modelos por debajo de 3M parámetros.

## Benchmarks y rendimiento

Evaluación zero-shot en FP32 con `acc_norm` y `bos_token` antepuesto, sobre el total de preguntas indicado:

| Benchmark | Split | Preguntas | Puntuación |
|---|---|---:|---:|
| HellaSwag | validation | 10.042 | 27,40 % |
| ARC-Easy | test | 2.376 | 32,15 % |
| ARC-Challenge | test | 1.172 | 21,93 % |
| PIQA | validation | 1.838 | 52,88 % (`acc`: 55,50 %) |
| ArithMark-3.0 | full | 1.000 | 36,50 % |
| FineWeb-Edu Val CE | held-out 1,05M tok | — | 3,1393 (PPL 23,09) |

Ablaciones controladas sobre el mismo flujo de 24,6M tokens de FineWeb-Edu, 32.768 tokens por paso durante 750 pasos:

| Modelo | Parámetros | Val CE | PPL | Delta |
|---|---:|---:|---:|---:|
| Llama-2.2M + AdamW | 2.207.840 | 4,4839 | 88,58 | referencia |
| WeiNet-v2a + AdamW, `d_emb=96` factorizado | 2.179.913 | 4,4666 | 87,06 | -0,0173 |
| WeiNet-v2b + AdamW, `d=160` atado | 2.194.416 | 4,2604 | 70,84 | -0,2235 |
| WeiNet-v2b + Muon + AdamW | 2.194.416 | 3,9034 | 49,57 | -0,5805 |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para los pesos del modelo (2,19M parámetros × 4 bytes ≈ 8,8 MB); el tamaño del repositorio de 1,4 GB corresponde a artefactos adicionales, no solo a los pesos.
- GPU recomendadas: cualquier GPU con soporte CUDA, incluida una GTX 1050 Ti o una iGPU moderna; también es viable en CPU.
- Cabe holgadamente en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) y en entornos sin GPU.
- Opciones de despliegue: Transformers con `trust_remote_code=True`; la model card no documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y al requerir código remoto propio la integración con esos motores no está garantizada.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Rendimiento documentado |
|---|---:|---:|---|---|---|
| Kunwu-1-Wei-Base (WeiNet-v2b) | 2,19M | 1.024 | Apache 2.0 | en | HellaSwag 27,40 %; ARC-E 32,15 %; PIQA 52,88 % |
| Llama-2.2M (ablación de referencia del autor) | 2,21M | no disponible | no disponible | no disponible | Val CE 4,4839 / PPL 88,58 en 24,6M tokens |
| WeiNet-v2b + AdamW (ablación del autor) | 2,19M | no disponible | no disponible | no disponible | Val CE 4,2604 / PPL 70,84 en 24,6M tokens |

No se dispone de datos de benchmarks comparables de otros modelos públicos de ~2M parámetros en la información proporcionada.

## Limitaciones y advertencias

- Es un modelo base de completado, sin ajuste por instrucciones ni alineación; no debe esperarse que siga instrucciones ni mantenga diálogos.
- A escala de 2M parámetros es esperable repetición en generaciones abiertas largas, según reconoce la propia model card.
- El entrenamiento se realizó con paquetes de 1.024 tokens y la media global en `CG-ReLU^2` no se reiniciaba en los límites de `<|endoftext|>`, lo que genera una brecha de distribución en prompts cortos; el autor anuncia una corrección con `cumsum` segmentado y 10 capas en Kunwu-1-Wei-Pro-Base.
- Solo soporta inglés; no hay capacidades multilingües documentadas.
- Contexto limitado a 1.024 tokens, insuficiente para documentos largos o conversaciones extensas.
- Riesgo elevado de alucinación y de contenido incoherente por la capacidad limitada del modelo; no es apto para producción en tareas de fiabilidad.
- La licencia Apache 2.0 permite uso comercial, pero el modelo exige `trust_remote_code=True`, lo que implica ejecutar código del repositorio; conviene auditar `WeiNetForCausalLM` antes de desplegarlo.
- Los sesgos conocidos no están documentados en la información disponible; al entrenarse sobre corpus web educativos y Wikipedia en inglés, es probable que herede sesgos de esas fuentes.
- El checkpoint publicado es FP32 y no se ofrecen variantes cuantizadas, lo que limita optimizaciones de despliegue ya documentadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eThAn18594/Kunwu-1-Wei-Base
- Datasets referenciados en la model card: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu, https://huggingface.co/datasets/HuggingFaceTB/smollm-corpus, https://huggingface.co/datasets/HuggingFaceTB/cosmopedia, https://huggingface.co/datasets/HuggingFaceTB/dclm-edu, https://huggingface.co/datasets/HuggingFaceTB/finemath, https://huggingface.co/datasets/wikimedia/wikipedia, https://huggingface.co/datasets/microsoft/orca-math-word-problems-200k
- Paper, blog, repositorio o demo adicionales: no disponibles en la información proporcionada.
