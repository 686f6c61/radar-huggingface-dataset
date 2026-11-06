# adriaflores/kimi-k3-300m-from-scratch

## Resumen

Kimi K3 300M — From Scratch es un modelo de lenguaje causal preentrenado desde cero por el desarrollador independiente adriaflores, inspirado en la arquitectura de Kimi K3 de Moonshot AI (sin afiliación con esta). Se trata de un proyecto de ingeniería de investigación que reimplementa a escala reducida componentes avanzados como Kimi Delta Attention (KDA), Gated Multi-head Latent Attention (MLA) y un MoE estable con expertos latentes, entrenando unos 294,7M de parámetros totales (~100,4M activos por token) sobre aproximadamente 6.000 millones de tokens del subconjunto `sample-10BT` de FineWeb-Edu.

El problema que aborda es doble: por un lado, demostrar que las innovaciones arquitectónicas de los modelos frontera híbridos (atención lineal + MLA + MoE) pueden reproducirse de forma independiente y verificable a pequeña escala; por otro, ofrecer un checkpoint de inferencia reproducible con verificación de integridad (SHA-256 y comparación de logits con diferencia máxima 0,0). No es un modelo de instrucciones ni un fine-tune: es un modelo base orientado a investigación.

Su relevancia actual radica en que sirve como referencia educativa y de ingeniería para entender arquitecturas híbridas attention-lineal/MoE, con documentación completa del pipeline de entrenamiento (optimizador Muon + AdamW, BF16, H100 NVL) y una evaluación independiente de next-token prediction con perplejidad de 21,14. No está pensado para uso en producción ni para tareas downstream sin un ajuste posterior.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder causal híbrido de 13 capas (KDA lineal + MLA), MoE con expertos latentes |
| Parametros totales | 294.676.808 (~294,7M); el repositorio safetensors pesa 326.134.856 parámetros |
| Parametros activos | ~100,4M por token (MoE top-2 de 64 expertos + 2 expertos compartidos) |
| Longitud de contexto | 1.024 tokens en preentrenamiento; 2.048 configurados (sin calidad evaluada a esa longitud) |
| Tipos de cuantizacion | No disponible (pesos publicados en FP32; entrenamiento en BF16 mixed precision) |
| Idiomas soportados | Inglés (entrenado solo con FineWeb-Edu, corpus en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (FP32); inferencia mediante implementación PyTown custom, no compatible con `AutoModelForCausalLM` |

## Arquitectura y entrenamiento

El modelo es un decoder causal híbrido de 13 capas que combina dos mecanismos de atención: 9 capas de Kimi Delta Attention (KDA), una atención lineal con regla de actualización tipo delta, y 4 capas de Gated Multi-head Latent Attention (MLA), la atención comprimida en espacio latente popularizada por la serie Kimi/DeepSeek. Sobre la pila de atención se aplican Block Attention Residuals con tamaño de bloque 2. La parte feed-forward es híbrida también: 1 capa densa SiTU-GLU y 12 capas Stable LatentMoE con 64 expertos enrutados, selección top-2 por token y 2 expertos compartidos. El vocabulario es de 49.152 tokens con embeddings atados entrada/salida, reutilizando el tokenizador de SmolLM2-135M.

El preentrenamiento se realizó desde cero sobre 6.000.017.408 tokens del subconjunto `sample-10BT` de FineWeb-Edu, en ventanas causales de 1.024 tokens, sin ninguna fase de fine-tuning por instrucciones ni alineamiento (sin RLHF/DPO). Se usó una sola GPU NVIDIA H100 NVL con precisión mixta BF16, optimización combinada Muon + AdamW, learning rate pico de 0,003 con warmup de 1.832 actualizaciones y decay coseno, weight decay 0,1 y 183.106 actualizaciones del optimizador (32.768 tokens efectivos por actualización). La pérdida de validación final del entrenamiento fue 3,1825 nats/token. Una innovación destacable del código es la ruta optimizada CUDA de KDA basada en la implementación upstream de Flash-Linear-Attention, aunque la inferencia de referencia validada usa la ruta chunkwise en CPU y FP32.

## Capacidades

- Generación de texto en inglés de continuación libre (modelo base, no instruccional): completar frases, continuar pasajes y modelar lenguaje educativo general.
- Modelado de lenguaje causal con mezcla de expertos: enruta cada token a 2 de 64 expertos más 2 compartidos, activando ~100,4M de parámetros por token.
- Atención híbrida: combina memoria eficiente de atención lineal (KDA) con atención precisa por capas (MLA), útil como referencia para estudiar arquitecturas de contexto largo a pequeña escala.
- Reproducibilidad verificada: logits idénticos (diferencia máxima 0,0) entre checkpoint del entrenador y pesos safetensors reconstruidos.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: no se ha realizado ninguna fase de instrucción o alineamiento.
- Sin capacidades multimodales: solo texto, solo inglés.
- No compatible actualmente con `transformers.AutoModelForCausalLM.from_pretrained()`; requiere el código custom del repositorio.

## Casos de uso

- Estudio de arquitecturas híbridas attention-lineal: el código fuente completo permite inspeccionar cómo se implementan KDA, Gated MLA y Stable LatentMoE en PyTorch puro, algo difícil de encontrar en modelos de esta escala.
- Investigación reproducible en MoE: con 64 expertos y top-2, sirve como banco de pruebas barato para experimentos de enrutamiento, balanceo de carga y expertos compartidos.
- Educación en preentrenamiento de LLM: el proyecto documenta pipeline completo (tokenización, ventanas causales, Muon + AdamW, warmup y decay coseno) sobre solo 6B de tokens y una GPU H100, ideal como guía didáctica.
- Benchmarking de optimizadores: al usar Muon combinado con AdamW, es un punto de comparación para estudiar el efecto de Muon frente a AdamW puro a escala de ~300M.
- Base para fine-tuning experimental: como modelo base en inglés con licencia Apache 2.0, puede ajustarse posteriormente (SFT, DPO) para tareas específicas, aunque con expectativas limitadas por su tamaño y corpus.
- Verificación de integridad de checkpoints: el proceso publicado (SHA-256, comparación de logits) es un ejemplo práctico de validación de artefactos de modelos publicados en Hugging Face.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.). Los únicos datos disponibles son mediciones internas de modelado de lenguaje:

| Metrica | Resultado |
|---|---:|
| Perdida de validacion final (entrenamiento) | 3,1825 nats/token |
| Mean negative log-likelihood (evaluacion independiente, 65.536 tokens) | 3,0510 nats/token |
| Perplejidad | 21,14 |
| Precision next-token top-1 | 42,27 % |

Estos valores provienen de una partición de validación interna y un procedimiento propio; el autor advierte explícitamente de que no son comparables con benchmarks externos ni con la pérdida monitorizada durante el entrenamiento.

## Requisitos de hardware

- VRAM para inferencia: mínima. Los pesos en FP32 ocupan ~1,3 GB; el modelo completo cabe con holgura en CPUs modernas y en cualquier GPU con 4 GB de VRAM o más.
- GPU recomendada: ninguna en particular para inferencia; la ruta de referencia validada usa CPU con FP32 y backend chunkwise de KDA. Para entrenamiento a esta escala se usó una NVIDIA H100 NVL.
- Consumer GPUs: perfectamente viable en cualquier GPU de consumo (por ejemplo RTX 3060 o superior), aunque la implementación optimizada CUDA de KDA vía Flash-Linear-Attention puede requerir GPUs compatibles con Triton.
- Despliegue: no compatible con vLLM, TGI ni `AutoModelForCausalLM`. La inferencia se realiza con el código custom del repositorio (`scripts/generate_hf.py`), Python 3.12+ y `uv`. No hay soporte de llama.cpp ni Ollama (formato GGUF no disponible).
- Latencia y throughput: no optimizado para serving; la generación recomputa el contexto completo en cada paso, orientado a reproducibilidad más que a velocidad. No hay cifras de latencia publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Activos por token | Contexto | Arquitectura | Licencia |
|---|---|---|---|---|---|
| Kimi K3 300M from scratch | ~294,7M | ~100,4M | 1.024 (entrenado) / 2.048 (configurado) | Hibrido KDA + MLA + MoE 64 expertos | Apache 2.0 |
| SmolLM2-135M | 135M | 135M (denso) | 2.048 | Transformer denso | Apache 2.0 |
| Qwen2.5-0.5B | ~494M | ~494M (denso) | 32.768 | Transformer denso (GQA) | Qwen Research (restricciones comerciales >100M MAU) |
| Pythia-410M | ~405M | ~405M (denso) | 2.048 | Transformer denso | Apache 2.0 |

Frente a sus alternativas densas de tamaño comparable, este modelo activa solo ~100M de parámetros por token gracias al MoE, y su interés principal no es el rendimiento downstream (sin benchmarks publicados, a diferencia de SmolLM2 o Pythia, que sí tienen evaluaciones estandarizadas) sino la reimplementación independiente de una arquitectura híbrida de frontera.

## Limitaciones y advertencias

- Modelo base sin instrucciones: no sigue instrucciones, no es un chatbot y no se ha realizado RLHF, DPO ni SFT de ningún tipo.
- Alto riesgo de alucinación, repetición, sesgos y texto incoherente: el propio autor advierte de que puede generar contenido inexacto, sesgado, inseguro o sin sentido, y que no es apto para usos críticos o de consecuencias importantes.
- Solo inglés: entrenado exclusivamente con FineWeb-Edu (corpus en inglés), sin capacidades multilingües ni soporte para castellano.
- Contexto limitado: entrenado con ventanas de 1.024 tokens; el límite configurado de 2.048 tokens no implica calidad demostrada a esa longitud.
- Sin benchmarks externos: no hay forma de comparar su rendimiento downstream con otros modelos; la perplejidad publicada corresponde a una partición de validación propia.
- Incompatibilidad con el ecosistema estándar: no carga con `transformers.AutoModelForCausalLM`, no hay GGUF, y la inferencia depende del repositorio custom (Python 3.12+, uv).
- La ruta CUDA optimizada de KDA se basa en la implementación upstream de Flash-Linear-Attention; la ruta de referencia validada es CPU/FP32/chunkwise, más lenta.
- Licencia Apache 2.0: permite uso comercial, pero al tratarse de una reimplementación inspirada en Kimi K3 sin afiliación con Moonshot AI, conviene revisar cualquier consideración de marca o denominación en productos derivados.
- Proyecto de investigación a escala reducida: 6B de tokens de entrenamiento es una cifra muy pequeña frente a los estándares actuales, lo que limita severamente la calidad del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/adriaflores/kimi-k3-300m-from-scratch
- Repositorio de código (GitHub): https://github.com/adriaflores/kimi-k3-from-scratch
- Documentación del proyecto: https://kimi-k3.adriaflores.com
- Dataset de entrenamiento (FineWeb-Edu): https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Tokenizador (SmolLM2-135M): https://huggingface.co/HuggingFaceTB/SmolLM2-135M
- Paper referenciado en tags (arXiv): arxiv:2607.24653
