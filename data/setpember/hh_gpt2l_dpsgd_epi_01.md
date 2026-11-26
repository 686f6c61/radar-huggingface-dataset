# Setpember/HH_GPT2L_DPSGD_epi_01

## Resumen

HH_GPT2L_DPSGD_epi_01 es un checkpoint de investigación publicado por Fengwei Tian (Universidad de Arizona) dentro del proyecto PROPS, un trabajo académico sobre alineamiento de modelos de lenguaje con garantías formales de privacidad diferencial. El modelo parte de GPT-2 Large (774 millones de parámetros) y se afina mediante DPO (Direct Preference Optimization) sobre el dataset Anthropic HH-RLHF, aplicando DP-SGD (Stochastic Gradient Descent con privacidad diferencial) para proteger cada ejemplo de entrenamiento individual. El resultado es un modelo de referencia (baseline) del paper "PROPS: Progressively Private Self-alignment of Large Language Models" (TMLR 2025).

El checkpoint no está pensado como producto: es una pieza reproducible de un experimento que mide el coste en calidad de alinear con privacidad diferencial estricta (ε = 0,1, δ = 1e-10). Su relevancia es metodológica, no de rendimiento: permite a investigadores comparar estrategias de alineamiento privado sobre una arquitectura pequeña y bien conocida como GPT-2 Large, con un contexto de 1.024 tokens y licencia MIT.

El modelo se distribuye como un fichero `policy.pt` que debe cargarse sobre los pesos base de GPT-2 Large, no como un repositorio transformers estándar. No se han publicado idiomas soportados explícitamente ni resultados de benchmarks en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT-2) |
| Parámetros totales | 774 millones (GPT-2 Large) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens (heredada de GPT-2 Large) |
| Tipos de cuantización | no disponible (checkpoint en punto flotante, `policy.pt`) |
| Idiomas soportados | no disponible (GPT-2 se entrenó principalmente en inglés) |
| Licencia | MIT |
| Formato de pesos | `policy.pt` (state dict de PyTorch sobre GPT-2 Large) |

## Arquitectura y entrenamiento

La arquitectura es la de GPT-2 Large: un transformer decoder-only con 36 capas, dimensión oculta de 1.280 y 20 cabezas de atención, con atención causal densa y sin mecanismos de atención lineal ni decodificación especulativa. El checkpoint es un ajuste fino del modelo base mediante DPO, la técnica de optimización de preferencias que sustituye al RLHF clásico entrenando directamente sobre pares (respuesta elegida, respuesta rechazada).

La innovación está en el procedimiento de entrenamiento: DPO con DP-SGD, que añade ruido gaussiano a los gradientes por paso y acota su norma para garantizar un presupuesto de privacidad diferencial de ε = 0,1 y δ = 1e-10 a nivel de ejemplo completo. El dataset es Anthropic HH-RLHF, centrado en preferencias de ayuda e inocuidad en diálogo. El paper PROPS (arXiv:2508.06783) propone un esquema de autoalineamiento progresivamente privado del que este checkpoint es la línea base. No se dispone de información sobre volumen de tokens, composición exacta del dataset ni detalles del optimizador en la información proporcionada.

## Capacidades

- Generación de texto autoregresiva en inglés (heredada de GPT-2 Large).
- Ajuste de estilo de respuesta hacia preferencias de ayuda e inocuidad de HH-RLHF, con garantías de privacidad diferencial en el entrenamiento.
- Razonamiento básico y respuesta a instrucciones conversacionales de una o varias réplicas, limitado por el tamaño del modelo.
- No se ha documentado soporte de tool calling ni function calling.
- No se ha documentado soporte de agentes ni razonamiento multi-paso estructurado.
- Capacidades multilingües no documentadas; el modelo base está entrenado predominantemente en inglés.
- No dispone de modo thinking, visión ni audio.
- Su función principal es servir de referencia reproducible en investigación sobre privacidad y alineamiento.

## Casos de uso

- Reproducción de experimentos de privacidad diferencial: cargar el `policy.pt` sobre GPT-2 Large y comparar la distribución de respuestas con la del modelo base para medir el coste de ε = 0,1 en calidad de alineamiento.
- Evaluación de métodos de alineamiento privado: usar este checkpoint como baseline frente a variantes de PROPS u otros esquemas de DP-DPO en el mismo dataset y presupuesto de privacidad.
- Estudio de la fuga de información en modelos alineados: analizar si las respuestas del modelo permiten inferir ejemplos de HH-RLHF pese al ruido de DP-SGD, aprovechando el presupuesto declarado.
- Docencia e investigación en privacidad de machine learning: ejemplo completo y de bajo coste computacional de un pipeline DPO con DP-SGD sobre un modelo de 774M parámetros.
- Auditoría de implementaciones de DP-SGD: verificar el contador de privacidad y la calibración del ruido comparando el checkpoint con el código de referencia del paper.
- Experimentos de ablación controlados: al fijar arquitectura y dataset, permite aislar el efecto del mecanismo de privacidad en métricas de preferencia y perplejidad.
- Prototipado de investigación en entornos con GPU de consumo: el tamaño del modelo permite iterar en una única GPU consumer con precisión completa o mixta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 3,1 GB de pesos más overhead de activaciones y caché KV, en torno a 4-5 GB en total.
- VRAM estimada en fp16/bf16: aproximadamente 1,6 GB de pesos, en torno a 2,5-3 GB en total.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son válidas, aunque el modelo es pequeño para las dos últimas.
- Cabe holgadamente en GPU de consumo como RTX 3060, RTX 4060, RTX 4070 o superiores.
- Opciones de despliegue: el checkpoint requiere cargar el state dict sobre GPT-2 Large con `transformers`; una vez convertido a formato estándar, puede servirse con vLLM, TGI, llama.cpp (previa conversión a GGUF) u Ollama.
- Latencia y throughput estimados: no disponibles en la información proporcionada; en una RTX 4090 se espera un throughput alto por el reducido tamaño, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Alineamiento | Privacidad | Licencia |
|---|---|---|---|---|---|
| HH_GPT2L_DPSGD_epi_01 | 774M | 1.024 | DPO con DP-SGD (ε=0,1) | Diferencial a nivel de ejemplo | MIT |
| GPT-2 Large (base) | 774M | 1.024 | Sin alineamiento | Ninguna | MIT |
| Modelos DPO sobre GPT-2 Large sin DP | 774M | 1.024 | DPO estándar | Ninguna | MIT |
| Variantes PROPS del paper | 774M | 1.024 | Autoalineamiento progresivo privado | Diferencial | MIT (según repo) |

La comparación relevante es interna al paper: este checkpoint es la línea base frente a las variantes progresivas de PROPS. Frente a modelos alineados modernos de 7B o más, la diferencia de capacidad es de órdenes de magnitud y no resulta una alternativa práctica.

## Limitaciones y advertencias

- Modelo de investigación: el autor indica explícitamente que no está ajustado para seguridad y no debe usarse en productos.
- Calidad de alineamiento limitada por el tamaño del modelo base (774M) y por el ruido introducido por DP-SGD con ε = 0,1, que degrada la señal de preferencias.
- Riesgo elevado de alucinación y de respuestas incoherentes en conversaciones largas, propio de GPT-2 Large.
- Contexto máximo de 1.024 tokens, insuficiente para la mayoría de aplicaciones conversacionales o de recuperación aumentada.
- Idiomas soportados no documentados; el modelo base está entrenado principalmente en inglés, con rendimiento esperado muy bajo en castellano.
- Sesgos heredados del corpus de entrenamiento de GPT-2 y de HH-RLHF, no auditados en este checkpoint.
- La licencia MIT permite uso comercial, pero el autor desaconseja explícitamente el uso en producción por motivos de seguridad.
- El formato `policy.pt` requiere cargar el state dict manualmente sobre GPT-2 Large; no es un repositorio `transformers` autónomo y puede romper pipelines estándar.
- El presupuesto de privacidad declarado (ε = 0,1, δ = 1e-10) depende de la implementación de DP-SGD; conviene verificarlo contra el código de referencia antes de citarlo.
- No hay métricas publicadas de rendimiento, por lo que no es posible comparar su calidad de forma cuantitativa sin ejecutar evaluaciones propias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Setpember/HH_GPT2L_DPSGD_epi_01
- Modelo base GPT-2 Large: https://huggingface.co/openai-community/gpt2-large
- Dataset Anthropic HH-RLHF: https://huggingface.co/datasets/Anthropic/hh-rlhf
- Paper PROPS (arXiv:2508.06783): https://arxiv.org/abs/2508.06783
- Código del proyecto PROPS: https://github.com/FTian-UArizona/PROPS
- Código de referencia de DPO: https://github.com/eric-mitchell/direct-preference-optimization
- Perfil del autor en GitHub: https://github.com/FTian-UArizona
