# entity2260/cl-pncm-tiny-124m

## Resumen

C-LPNCM (Calibrated Looped-Pointer Next-Concept Model) es un modelo de generación de texto de 127,8 millones de parámetros desarrollado por el usuario entity2260 y publicado en Hugging Face bajo licencia MIT. Se trata de una arquitectura de transformer puro orientada a lo que su autor denomina "Next-Concept Modeling": en lugar de predecir directamente el siguiente token superficial, el modelo planifica conceptos discretos jerárquicos, los refina mediante un bucle de punto fijo con pesos compartidos y finalmente decodifica la superficie mediante una ruta dual (vocabulario de conceptos más puntero de copia). El modelo declara explícitamente cero capas de difusión y cero muestreadores ODE/flow-matching.

El modelo se estructura en cuatro módulos: un encoder RVQ-FSQ multiescala con detección de picos de entropía, un núcleo latente de predicción de siguiente concepto con calibración epistémica Brier y enrutador de tres vías, un refinador transformer en bucle con atención exclusiva protegida y un decoder superficial de doble ruta con refinador de fronteras. Está entrenado sobre el dataset TinyStories (hazyresearch/ncm-datasets) y está orientado exclusivamente al inglés.

Su relevancia es fundamentalmente de investigación: propone una alternativa a la autoregresión plana de tokens combinando cuantización vectorial residual, finite scalar quantization y decodificación por puntero, con mecanismos de calibración de incertidumbre y abstención epistémica. No obstante, el modelo es de publicación muy reciente (noviembre de 2026), sin descargas ni validación externa, y sus métricas declaradas no están verificadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer puro de cuatro torres con Next-Concept Modeling (encoder RVQ-FSQ, núcleo latente de conceptos, refinador en bucle con pesos compartidos, decoder superficial de doble ruta) |
| Parametros totales | 127.839.796 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana local del encoder W=128; contexto global no especificado) |
| Tipos de cuantizacion | no disponible (el modelo usa internamente Cosine VQ, FSQ residual en cascada y proyección FSQ de cuello de botella; no se documentan cuantizaciones de pesos para inferencia) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (librería pytorch, requiere custom_code) |

## Arquitectura y entrenamiento

La arquitectura se compone de cuatro módulos encadenados. El módulo 1 es un encoder RVQ-FSQ multiescala con compuerta por entropía: un transformer causal de ventana local (W=128) produce representaciones no cuantizadas (K_raw, V_raw), un detector de picos de entropía de Shannon segmenta el texto en spans de concepto de longitud variable (S_m entre 1 y 8), y un pooler con atención bidireccional intra-parche genera el vector u_m, que se cuantiza con un codebook VQ coseno de nivel 1 más residuales FSQ en cascada. El módulo 2 es el núcleo latente de siguiente concepto, un transformer causal con desplazamiento de token de inicio de concepto que incorpora una cabeza de política, una cabeza de longitud de span, una cabeza de confianza epistémica calibrada con Brier y un verificador de valor deliberativo con enrutador de tres vías (ruta rápida, ruta deliberativa con beam search y abstención epistémica).

El módulo 3 es un refinador transformer en bucle con pesos compartidos que itera un bloque con reinyección de ancla U_0, atención exclusiva protegida (XSA), compuerta sigmoide por cabeza y supervisión profunda FSQ multi-salida, con una penalización de contracción de Banach con referencia separada. El módulo 4 es un decoder superficial de doble ruta: la ruta A decodifica solo sobre la representación cuantizada E_quant, mientras que la ruta B es un puntero causal estricto sobre el banco de memoria (K_raw, V_raw) que solo consulta índices anteriores al inicio del span, con una clave `<NULL_PTR>` aprendible y una compuerta de copia dinámica con 50 % de dropout de puntero en la etapa 1. Se añade una máscara de gramática/esquema mediante trie neuro-simbólico y un refinador de fronteras de una pasada.

El entrenamiento se realizó sobre TinyStories (hazyresearch/ncm-datasets) en dos etapas: la etapa 1 optimiza la reconstrucción de tokens (CE de 1,2899 a 1k pasos) y la etapa 2 el equilibrio FSQ multi-salida (pérdida de 2,7818). El autor menciona GRPO y "calibrated reasoning" en las etiquetas, aunque la model card no detalla la composición exacta del dataset ni el número total de tokens de entrenamiento.

## Capacidades

- Generación de texto en inglés sobre el dominio de TinyStories (narrativa infantil sencilla).
- Planificación jerárquica de conceptos discretos con spans de longitud variable (1 a 8 tokens).
- Refinamiento iterativo en bucle con pesos compartidos y número de iteraciones adaptativo (K* entre 1 y K_max).
- Decodificación dual: vocabulario de conceptos (ruta A) y copia exacta por puntero de entidades raras o nombres propios (ruta B).
- Estimación de confianza epistémica calibrada (Brier) y abstención explícita mediante token `<ABSTAIN_OR_RETRIEVE>`.
- Enrutamiento de tres vías según confianza: ruta rápida, deliberativa con beam search o abstención.
- Decodificación restringida por gramática/esquema mediante trie neuro-simbólico.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (el "multi-step" es interno al bucle de refinamiento, no un bucle de agente).
- Capacidades multilingües: no (solo inglés).
- Capacidades especiales: modo de abstención epistémica y calibración de incertidumbre; sin visión ni audio.

## Casos de uso

- Investigación en arquitecturas alternativas a la autoregresión plana: el modelo sirve como banco de pruebas reproducible para evaluar Next-Concept Modeling frente a transformers causales estándar del mismo tamaño (124M) sobre TinyStories.
- Estudio de calibración epistémica en modelos pequeños: la cabeza Brier y el enrutador de tres vías permiten analizar cómo un modelo de 124M decide abstenerse frente a generar, útil en líneas de investigación sobre honestidad y uncertainty quantification.
- Experimentos con decodificación por puntero: la ruta B con `<NULL_PTR>` y dropout del 50 % permite investigar copia exacta de entidades raras en dominios con vocabulario abierto, como nombres propios en narrativa.
- Evaluación de cuantización discreta de conceptos: el pipeline RVQ-FSQ en cascada con detección de picos de entropía es un caso práctico para estudiar compresión de secuencia (1/4x) y su impacto en la reconstrucción.
- Prototipado de decodificación restringida por gramática: la máscara de trie neuro-simbólico permite experimentar con generación condicionada a esquemas en dominios controlados.
- Docencia y divulgación: al ser un modelo pequeño (127,8M parámetros, ~1,5 GB de repo) con licencia MIT, es adecuado para demostraciones de arquitecturas híbridas de cuantización y bucles de refinamiento en cursos de NLP.
- Generación de cuentos infantiles sintéticos en inglés: su dominio de entrenamiento (TinyStories) lo hace directamente aplicable a la producción de narrativa corta controlada, aunque con calidad limitada por el tamaño.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados):

| Benchmark | Métrica | Valor | Verificado |
|---|---|---|---|
| TinyStories (hazyresearch/ncm-datasets) | Stage 1 Token Reconstruction CE Loss (1k steps) | 1,2899 | No |
| TinyStories (hazyresearch/ncm-datasets) | Stage 2 Multi-Exit FSQ Equilibrium Loss | 2,7818 | No |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Las métricas anteriores son pérdidas de entrenamiento internas, no comparables directamente con benchmarks de generación de propósito general.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 127,8M parámetros, en fp32 ocuparía aproximadamente 0,5 GB de pesos; en fp16/bf16, unos 0,26 GB; en int8, unos 0,13 GB. A ello hay que sumar el codebook VQ, los buffers FSQ y el banco de memoria (K_raw, V_raw), no cuantificados en la documentación.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) debería poder alojar los pesos; no se documentan requisitos oficiales.
- Cabe en GPU consumer: sí, por tamaño de parámetros, aunque el `custom_code` y los bucles de refinamiento pueden incrementar el uso de memoria en tiempo de ejecución.
- Opciones de despliegue: no disponible. El modelo requiere `custom_code` y no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI; la única librería declarada es PyTorch.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| C-LPNCM Tiny 124M | 127,8M | no disponible | Next-Concept Modeling con RVQ-FSQ y bucle de refinamiento | MIT | Hugging Face (0 descargas) |
| GPT-2 small | 124M | 1.024 tokens | Transformer causal estándar | MIT | Ampliamente disponible |
| TinyLlama-1.1B | 1.100M | 2.048 tokens | Transformer causal con RoPE y SwiGLU | Apache 2.0 | Hugging Face |
| SmolLM-135M | 135M | 2.048 tokens | Transformer causal | Apache 2.0 | Hugging Face |

La comparación directa con GPT-2 small es la más pertinente por tamaño (124M frente a 127,8M), aunque no se dispone de métricas comparables publicadas para C-LPNCM. TinyLlama y SmolLM se incluyen como referencia de la categoría de modelos pequeños, pero son de mayor escala o distinta naturaleza arquitectónica.

## Limitaciones y advertencias

- Modelo de investigación sin validación externa: 0 descargas y 0 likes en el momento de la ficha; las métricas declaradas no están verificadas.
- Dominio muy restringido: entrenado sobre TinyStories, por lo que su calidad fuera de narrativa infantil en inglés es previsiblemente baja.
- Solo inglés: no soporta otros idiomas.
- Longitud de contexto no documentada: la ventana local del encoder es W=128, pero no se especifica el contexto global del núcleo ni del decoder.
- Requiere `custom_code`: no es un modelo estándar de transformers, lo que complica el despliegue en servidores de inferencia convencionales.
- Riesgo de alucinación: no evaluado; la calibración Brier y la abstención epistémica son mecanismos internos, pero no hay evidencia publicada de su eficacia fuera del conjunto de entrenamiento.
- Sesgos: no documentados; el dataset TinyStories tiene sesgos propios de la narrativa infantil sintética.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías ni soporte; el uso en producción requiere validación propia.
- Sin datos de benchmarks estándar: no se puede comparar con modelos de propósito general en MMLU, HumanEval o GSM8K.
- Fecha de creación muy reciente (2026-11-11): posible inestabilidad en el código y en la reproducibilidad.

## Enlaces

- Hugging Face: https://huggingface.co/entity2260/cl-pncm-tiny-124m
- Dataset TinyStories (hazyresearch/ncm-datasets): https://huggingface.co/datasets/hazyresearch/ncm-datasets
- Paper referenciado (arxiv:2610.14162): https://arxiv.org/abs/2610.14162
- Repositorio del autor: no disponible en la información proporcionada
- Blog o demo: no disponible en la información proporcionada
