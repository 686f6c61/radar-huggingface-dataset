# batteryphil/VAULT-v2.5-180M

## Resumen

VAULT v2.5 es un modelo de lenguaje de 180,6 M de parámetros (239,3 M según los pesos en safetensors) desarrollado por Philip Bartsch (batteryphil) que implementa una arquitectura recurrente post-Transformer y post-SSM denominada VAULT (Variance-Weighted Associative Unitary Lattice Tensor). El modelo se entrena desde cero en una única GPU de consumo de 16 GB (AMD Radeon RX 9060 XT) sobre un total de 0,594 B de tokens, lo que lo sitúa en la categoría de modelos pequeños con presupuesto de entrenamiento muy reducido.

La innovación central es el uso de cuatro bancos de celdas Kenyon co-primas (P = {47, 53, 59, 61}, 220 celdas en total, 8,97 M de direcciones CRT) a los que se enrutan las entidades de alta saliencia mediante convolución circular ligada a fase. A diferencia de los Transformers con caché KV de coste O(T) o de los SSM con una única matriz de estado con decaimiento exponencial, las celdas no direccionadas de VAULT tienen decaimiento temporal pasivo nulo (gamma = 1.0), y la capacidad de memoria asociativa puede expandirse en tiempo de inferencia hasta 2.002 celdas (62,7 B de direcciones CRT) mediante "Elastic Co-Prime Mitosis" sin alterar la latencia de decodificación por token.

El modelo está orientado a generación de texto conversacional y a recuperación de contexto largo en streaming, con soporte de kernels Triton para prefill y decodificación O(1). Es relevante para investigadores interesados en arquitecturas recurrentes alternativas a la atención cuadrática y en experimentos de memoria asociativa expandible, más que como modelo de propósito general comparable a LLMs entrenados con cientos de miles de millones de tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Post-Transformer recurrente con linear-attention y state-space; 4 bancos de celdas Kenyon co-primas con convolución circular ligada a fase |
| Parametros totales | 239.342.672 (según safetensors); el autor indica 180,6 M en la model card |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Entrenado a 2K tokens; recuperación en streaming hasta 32K+ mediante expansión de celdas (83,3 % de recall exacto de aguja a 32K) |
| Tipos de cuantizacion | No disponible para esta versión (la release v3 de 1,5 B ofrece BF16, Q8_0 y Q4_0) |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (librería transformers, custom_code) |

Parámetros de configuración adicionales indicados por el autor: d_model = 768, n_layers = 16, H_q = 12, G_vault = 4, d_head = 64, d_ff = 2048.

## Arquitectura y entrenamiento

VAULT abandona tanto la atención completa con caché KV no acotada como el estado único de los SSM tipo Mamba. En su lugar, enruta entidades de alta saliencia a cuatro bancos de celdas Kenyon cuyos tamaños son números primos coprimos (47, 53, 59 y 61), lo que genera 220 celdas y 8,97 M de direcciones mediante el teorema chino de los restos. La escritura y lectura se realizan por convolución circular ligada a fase, y las celdas no direccionadas conservan su contenido sin decaimiento temporal pasivo (gamma = 1.0). La decodificación es O(1) por token en latencia, con kernels Triton de DFT en registro (sin rocFFT) y prefill chunkwise con hasta 32 KB de memoria compartida en todas las configuraciones de mitosis.

El entrenamiento se realizó desde cero en una sola GPU de consumo de 16 GB, con 0,575 B de tokens de preentrenamiento continuo y 19,7 M de tokens de SFT de precisión, sumando 0,594 B de tokens. La model card no detalla la composición del dataset ni si se aplicaron RLHF o DPO. La innovación destacable es la "Elastic Co-Prime Mitosis": la memoria asociativa puede expandirse en tiempo de inferencia de 220 a 508, 942 o 2.002 celdas (P = {491, 499, 503, 509}, 62,7 B de direcciones CRT) sin cambiar la latencia de decodificación por token (20,59 ms/tok).

## Capacidades

- Generación de texto conversacional en inglés con modo de streaming y API `model.chat(tok, prompt, stream=True)`.
- Razonamiento básico y respuesta a preguntas de conocimiento general y científico (SciQ, ARC, PIQA, HellaSwag, Winogrande, BoolQ, LAMBADA).
- Generación de código sencillo (el ejemplo de la model card pide una función Python que devuelva el máximo y la suma de una lista).
- Recuperación de contexto largo en streaming mediante expansión de celdas: 83,3 % de recall exacto de aguja a 32K pese a entrenarse solo a 2K.
- Expansión de memoria asociativa en tiempo de inferencia con `model.expand_mitosis(2002)` (presets de 220, 508, 942 y 2.002 celdas).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no, solo inglés.
- Capacidades especiales: modo thinking, visión y audio no disponibles.

## Casos de uso

- Investigación en arquitecturas recurrentes: reproducción de los experimentos de memoria asociativa expandible y comparación con SSM y Transformers en tareas de recuperación de aguja en pajar, aprovechando la expansión de 220 a 2.002 celdas sin coste de latencia.
- Recuperación de contexto largo en streaming: despliegue del modelo con `expand_mitosis(2002)` para tareas de needle-in-a-haystack sobre flujos de hasta 32K tokens, donde el autor reporta 83,3 % de recall exacto pese a entrenar a 2K.
- Prototipado de asistentes conversacionales ligeros en inglés: el modelo cabe en una GPU de consumo y ofrece una API `chat` con streaming, adecuada para demos y pruebas de concepto de bajo coste.
- Generación de código asistida en entornos con recursos limitados: el ejemplo de la model card (función Python para máximo y suma de una lista) muestra un uso viable para snippets simples, no para pipelines de producción complejos.
- Evaluación comparativa de eficiencia: servir como baseline de 180 M de parámetros entrenado con solo 0,594 B de tokens frente a Mamba-2 130M (300 B tokens) y SmolLM 135M (600 B tokens) en suites tipo lm-eval.
- Educación y divulgación: ilustrar en un artículo o curso cómo se diseña una memoria asociativa con celdas co-primas y mitosis elástica, con código de cinco líneas y CLI interactivo.
- Despliegue en hardware heterogéneo: validar kernels Triton en CUDA, ROCm, Apple Silicon (mps) y CPU con el fallback Compact-WY en PyTorch puro.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card, ejecutados con EleutherAI lm-eval en una única AMD Radeon RX 9060 XT de 16 GB. Se comparan VAULT v2.4 Base (0,575 B tokens) y VAULT v2.5 SFT (0,594 B tokens) con Mamba-2 130M (300 B tokens) y SmolLM 135M (600 B tokens).

| Benchmark / metrica | VAULT v2.4 Base | VAULT v2.5 SFT | Mamba-2 130M | SmolLM 135M |
|---|---|---|---|---|
| SciQ con pasaje (acc_norm) | 50,40 % | 71,80 % | 73,20 % | 76,40 % |
| SciQ closed-book (acc_norm) | 37,00 % | 50,70 % | 46,70 % | 64,70 % |
| SciQ ganancia in-context | +13,40 % | +21,10 % | +26,50 % | +11,70 % |
| ARC-Easy (acc_norm) | 37,71 % | 45,37 % | 42,38 % | 57,41 % |
| ARC-Challenge (acc_norm) | 23,12 % | 23,72 % | 23,81 % | 28,92 % |
| PIQA (acc_norm) | 57,02 % | 58,22 % | 63,71 % | 68,44 % |
| HellaSwag (acc_norm) | 35,73 % | 37,13 % | 43,07 % | 45,60 % |
| Winogrande (acc) | 49,64 % | 50,43 % | 53,28 % | 52,72 % |
| BoolQ (acc / acc_norm) | 56,93 % / 62,93 % | 41,53 % / 51,33 % | 56,33 % / 61,40 % | 59,87 % / 63,20 % |
| LAMBADA (acc) | 12,27 % | 13,73 % | 42,93 % | 36,87 % |
| WikiText-2 (BPB / TokPPL) | 1,5447 / 93,97 | 1,5466 / 94,51 | 0,9645 / 19,98 | 0,9686 / 17,26 |
| Media zero-shot 9 tareas | 39,98 % | 43,63 % | 49,49 % | 54,55 % |

Datos adicionales de rendimiento: latencia de decodificación O(1) de 20,59 ms/tok (equivalente a 48,8 tok/s) con kernels Triton fusionados en Linux CUDA/ROCm; 83,3 % de recall exacto de aguja a 32K con 2.002 celdas.

## Requisitos de hardware

- VRAM estimada para inferencia: el autor entrena y evalúa en una GPU de 16 GB; con 239,3 M de parámetros, en FP16 los pesos ocupan aproximadamente 0,48 GB y en FP32 unos 0,96 GB, a lo que hay que sumar el estado de las celdas Kenyon y las activaciones.
- GPU recomendadas: NVIDIA RTX 30xx/40xx/50xx, L4, A100 y H100 con Triton PTX TensorCore; AMD ROCm RDNA3/RDNA4/CDNA con Triton BF16 WMMA e HIPGraph; Apple Silicon (mps) y CPU con fallback PyTorch.
- GPU antiguas: T4, RTX 20xx y V100 reciben automáticamente Triton FP32 y soporte FP16 en SM < 8.0.
- Cabe en GPU de consumo: sí, el autor lo entrena en una AMD Radeon RX 9060 XT de 16 GB y el modelo es viable en GPUs consumer de gama media.
- Opciones de despliegue: transformers con `trust_remote_code=True`, repo GitHub con CLI `run_vault.py` y REPL interactivo, kernels Triton opcionales, `torch.cuda.CUDAGraph`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 20,59 ms/tok (48,8 tok/s) con kernels Triton fusionados; la latencia se mantiene constante con la expansión de celdas de 220 a 2.002.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Media zero-shot 9 tareas | Tokens de entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| VAULT v2.5 SFT | 239,3 M (180,6 M según autor) | 2K entrenado; 32K+ en streaming con mitosis | 43,63 % | 0,594 B | MIT | Hugging Face + GitHub |
| Mamba-2 130M | 130 M | No disponible | 49,49 % | 300 B | No disponible | Referencia externa |
| SmolLM 135M | 135 M | No disponible | 54,55 % | 600 B | No disponible | Referencia externa |

VAULT v2.5 queda por debajo de Mamba-2 130M y SmolLM 135M en la media zero-shot pese a tener más parámetros, pero se entrena con aproximadamente 500 veces menos tokens. Su ventaja diferencial es la latencia O(1) y la expansión de memoria en inferencia, no el rendimiento bruto en benchmarks académicos.

## Limitaciones y advertencias

- Rendimiento académico modesto: media zero-shot de 43,63 %, por debajo de Mamba-2 130M (49,49 %) y SmolLM 135M (54,55 %); LAMBADA (13,73 %) y HellaSwag (37,13 %) están muy lejos de los baselines.
- Regresión en BoolQ tras el SFT: cae de 62,93 % a 51,33 % en acc_norm (-15,40 % en acc), lo que sugiere sobreajuste o pérdida de conocimiento factual durante la fase de precisión.
- Solo inglés: la model card declara únicamente `en`; no hay soporte multilingüe.
- Contexto de entrenamiento corto (2K) y recuperación a 32K basada en la expansión de celdas; el 83,3 % de recall no equivale a comprensión global del contexto largo.
- Riesgo de alucinación elevado por el tamaño (180-239 M) y el escaso presupuesto de entrenamiento (0,594 B tokens); no es adecuado para tareas factuales críticas.
- Requiere `trust_remote_code=True` y código personalizado (`custom_code`), lo que implica ejecutar código del autor; auditar antes de usar en producción.
- La model card no documenta composición del dataset, sesgos conocidos ni procesos de RLHF/DPO; no hay garantías sobre alineación o filtrado de datos.
- Licencia MIT permite uso comercial, pero el modelo no está pensado para producción de propósito general; validar en cada caso.
- Discrepancia entre los 180,6 M declarados y los 239,3 M de safetensors; conviene verificar el conteo real antes de planificar recursos.

## Enlaces

- Hugging Face: https://huggingface.co/batteryphil/VAULT-v2.5-180M
- Repositorio GitHub: https://github.com/batteryphil/VAULT
- Release v3 de 1,5 B (BF16/Q8_0/Q4_0 y C99 freestanding): https://huggingface.co/batteryphil/VAULT-v3-1.5B
- Perfil del autor: https://github.com/batteryphil
