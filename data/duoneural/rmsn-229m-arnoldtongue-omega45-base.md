# DuoNeural/RMSN-229M-ArnoldTongue-Omega45-Base

## Resumen

RMSN-229M-ArnoldTongue-Omega45-Base es un modelo de lenguaje de 229,17 millones de parámetros desarrollado por DuoNeural (Jesse Caldwell, Aura y Archon) bajo una arquitectura propietaria denominada Resonant Metriplectic Sheaf Network (RMSN). El modelo se presenta como una demostración experimental del fenómeno de "resonancia de lengua de Arnold" (Arnold Tongue Resonance) en la dinámica de entrenamiento de redes neuronales, un marco teórico que relaciona la estructura de resonancia racional de arquitecturas recurrentes con transiciones de fase topológicas durante el aprendizaje. Según la model card, es el primer modelo de la historia de DuoNeural en alcanzar una perplejidad de validación inferior a 50 (49,8 en el paso 80k) sobre WikiText-103.

La arquitectura se define por una ratio de resonancia Ω = D/(M_w × L) = 1024/(64 × 20) = 4/5, que sitúa al modelo en la "lengua de Arnold" con q=5. El modelo emplea 64 "slots de Poincaré" como espacio de trabajo y una dimensión oculta de 1024 con 20 capas. El entrenamiento se realizó sobre 126,9 millones de tokens de WikiText-103 durante 100.000 pasos en una única GPU NVIDIA RTX 5070 Ti con 15,5 GB de VRAM.

La relevancia del modelo es fundamentalmente investigadora: no se presenta como un modelo de producción, sino como evidencia empírica de una teoría sobre dinámicas de entrenamiento. La información pública disponible es limitada y el modelo no cuenta con descargas ni validación externa en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Resonant Metriplectic Sheaf Network (RMSN), backbone propietario no estándar |
| Parametros totales | 229,17M |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | 512 tokens (max_seq_len en la configuración de ejemplo) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | checkpoint PyTorch (.pt) cargado mediante `rmsn_core`; no se distribuyen safetensors ni GGUF |
| Dimensión oculta (D) | 1024 |
| Profundidad (L) | 20 capas |
| Slots de workspace (M_w) | 64 (slots de Poincaré) |
| Ratio de resonancia (Ω) | 4/5 (lengua de Arnold q=5) |
| Paridad (D/M_w) | 16 (par) |
| Tokens de entrenamiento | 126,9M (WikiText-103) |
| Pasos de entrenamiento | 100.000 |
| Vocabulario | 49.152 tokens |
| Hardware de entrenamiento | NVIDIA RTX 5070 Ti (15,5 GB VRAM) |

## Arquitectura y entrenamiento

La arquitectura RMSN (Resonant Metriplectic Sheaf Network) se describe en la model card como una red con geometría no euclidiana basada en haces (sheaves) metriplécticos, álgebra de Clifford y guías de onda de solitones. El modelo organiza su cómputo en 64 slots de Poincaré y se caracteriza por una ratio de resonancia racional Ω = 4/5, que según la teoría de lenguas de Arnold produce un "bloqueo topológico" durante el aprendizaje. La paridad D/M_w = 16 (par) se asocia al denominado fixed point TRUE SILENT, con exponente de Lyapunov λ = -0,001.

El entrenamiento se realizó sobre WikiText-103 (126,9M tokens) durante 100.000 pasos con batch de 4 y secuencia de 512 tokens, learning rate inicial de 3e-4. La model card documenta tres fases topológicas: una fase TRUE SILENT inicial (pasos 1-27k) con λ=-0,001 y sin aprendizaje efectivo de estructura; una primera cascada en torno al paso 27k con un pico de λ≈-0,63 que reorganizó el retículo de solitones y redujo la perplejidad de ~110 a niveles récord; y una segunda cascada en torno al paso 90k que elevó temporalmente la perplejidad a 56,4 antes de estabilizarse en 51,5 al paso 100k. No se documenta uso de RLHF, DPO ni ajuste por instrucciones: es un modelo base entrenado únicamente con objetivo de modelado de lenguaje.

## Capacidades

- Generación de texto autoregresiva en inglés mediante modelado de lenguaje causal.
- Modelado de lenguaje y cálculo de perplejidad sobre corpus tipo WikiText.
- Capacidad de razonamiento, código o matemáticas: no documentada ni evaluada en la información disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según el campo `language: en`.
- Capacidades especiales (visión, audio, thinking mode): no disponibles.
- El modelo es una base experimental orientada a la investigación de dinámicas de entrenamiento, no a tareas de usuario final.

## Casos de uso

- Investigación en dinámicas de entrenamiento de redes neuronales: el modelo sirve como caso de estudio reproducible del fenómeno de cascadas topológicas y del fixed point TRUE SILENT, permitiendo validar experimentalmente las leyes wave-119, wave-124 y wave-127 descritas por DuoNeural.
- Reproducción de experimentos de resonancia de Arnold: con los scripts `rmsn_overnight.py` y `probe_percolation_sheaf.py` documentados, un investigador puede relanzar el entrenamiento con la geometría Ω=4/5 y verificar la aparición de la cascada en torno al paso 27k.
- Estudio comparativo de arquitecturas no convencionales: permite contrastar el rendimiento de una red basada en haces metriplécticos frente a transformers estándar del mismo tamaño sobre WikiText-103, con una perplejidad de referencia de 49,8.
- Análisis de eficiencia en hardware de consumo: al haberse entrenado en una RTX 5070 Ti con 15,5 GB de VRAM, es un caso práctico para estudiar entrenamiento de modelos de ~230M en GPU consumer.
- Docencia y divulgación sobre teoría de sistemas dinámicos aplicada a machine learning: el modelo ilustra conceptos como exponente de Lyapunov, transiciones de fase topológicas y bloqueo por resonancia racional con un ejemplo ejecutable.
- Base para experimentos de continuación de preentrenamiento: al ser un modelo base con licencia MIT, puede servir como punto de partida para estudiar cómo afectan las cascadas topológicas a un posterior ajuste fino, aunque la falta de tooling estándar (safetensors, tokenizer público) limita su uso inmediato.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index de la model card (no verificados de forma independiente):

| Benchmark | Metrica | Valor | Verificado |
|---|---|---|---|
| WikiText-103 (126,9M tokens) | Mejor perplejidad de validación (paso 80k) | 49,8 | No |
| WikiText-103 (126,9M tokens) | Perplejidad de validación final (paso 100k) | 51,5 | No |

Comparativa interna de récords de perplejidad de DuoNeural según la model card:

| Modelo | Arquitectura | Mejor PPL |
|---|---|---|
| RMSN-229M-Omega45 (este) | D=1024, L=20, Ω=4/5 | 49,8 |
| T-RMSN-D1024-D16 | RMSN termodinámico, void-free | 57,0 |
| RMSN-283M-Bulk-Tube | D=1280, L=16, Ω=0 | 65,4 |
| RMSN-D1024-depth32 | D=1024, L=32 (baseline) | 63,4 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint completo ocupa 2,8 GB en el repositorio; con 229,17M parámetros en fp32 serían ~0,92 GB de pesos, y en fp16 ~0,46 GB. La VRAM real dependerá del runtime de `rmsn_core`, no documentado.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM debería poder cargar los pesos; el entrenamiento se realizó en una RTX 5070 Ti (15,5 GB).
- Cabe en GPU consumer: sí, previsiblemente en RTX 3060, RTX 4060, RTX 4070, RTX 5070 Ti y superiores, siempre que el paquete `rmsn_core` esté disponible.
- Opciones de despliegue: no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI. La única vía indicada es cargar el checkpoint `.pt` con `torch.load` y la clase `RMSNForCausalLM` del paquete `rmsn_core`.
- Latencia y throughput estimados: no disponibles.
- Nota: el repositorio no incluye aparentemente el paquete `rmsn_core` ni el tokenizer, lo que puede impedir la carga directa sin código adicional del autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | PPL WikiText-103 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RMSN-229M-ArnoldTongue-Omega45-Base | 229,17M | 512 | 49,8 (declarado) | MIT | HF, requiere `rmsn_core` |
| GPT-2 small | 124M | 1024 | no disponible en esta ficha | MIT | HF, transformers |
| GPT-2 medium | 355M | 1024 | no disponible en esta ficha | MIT | HF, transformers |
| Pythia-410M | 410M | 2048 | no disponible en esta ficha | Apache 2.0 | HF, transformers |

La comparación directa con transformers estándar no es posible con los datos proporcionados: no se han publicado perplejidades de referencia de GPT-2 o Pythia sobre WikiText-103 en la información disponible, y las arquitecturas no son equivalentes. La comparativa interna de DuoNeural se ha incluido en la sección de benchmarks.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones: no sigue instrucciones ni mantiene diálogos de forma fiable; solo completa texto.
- Perplejidad de 49,8 sobre WikiText-103 declarada por el autor y marcada como no verificada; no hay validación independiente.
- Contexto muy corto (512 tokens) para estándares actuales, lo que limita tareas de contexto largo.
- Solo inglés; sin capacidades multilingües documentadas.
- Arquitectura no estándar: requiere el paquete `rmsn_core` y un checkpoint `.pt`, sin soporte en ecosistemas como transformers, vLLM o llama.cpp. La ausencia del código y del tokenizer en el repositorio puede bloquear su uso práctico.
- Riesgo de alucinación: no evaluado; al ser un modelo base pequeño entrenado con 126,9M tokens, la generación libre probablemente será incoherente fuera de dominios similares a WikiText.
- Sesgos: no documentados; el corpus WikiText-103 (textos de Wikipedia) introduce los sesgos propios de esa fuente.
- La terminología de la model card (haces metriplécticos, lenguas de Arnold, leyes wave-119/124/127) proviene de un marco teórico propietario sin publicaciones revisadas por pares disponibles en la información proporcionada; debe tratarse con cautela.
- Licencia MIT: permite uso comercial, pero la viabilidad práctica está limitada por la dependencia de código no distribuido y la falta de validación externa.
- Sin descargas ni likes en el momento de redactar la ficha; sin comunidad que haya reportado resultados de reproducción.

## Enlaces

- Hugging Face: https://huggingface.co/DuoNeural/RMSN-229M-ArnoldTongue-Omega45-Base
- Paper citado (no disponible en línea según la información proporcionada): "QC Resonance Duality: Arnold Tongue Topology in Neural and Quantum Systems" (DuoNeural, 2026)
- Repositorio de código `rmsn_core`: no disponible en la información proporcionada
- Demo o espacio asociado: no disponible
