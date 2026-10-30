# Cisco1963/llmplasticity-nl_en_linear_8-d0.1-c0.99-r0.2-s42

## Resumen

`Cisco1963/llmplasticity-nl_en_linear_8-d0.1-c0.99-r0.2-s42` es un modelo experimental de lenguaje publicado en Hugging Face por el usuario Cisco1963, basado en la arquitectura GPT-2 y con 122.706.432 parámetros reales verificados en los pesos safetensors (escala GPT-2 small, ~124M). Pertenece a una serie de modelos denominada "llmplasticity", cuyo nombre sugiere experimentos de investigación sobre plasticidad en LLMs (interpolación de pesos, pérdida de plasticidad o merging de modelos), aunque el repositorio no incluye model card que lo confirme.

El modelo carece de documentación oficial: no hay licencia declarada, ni pipeline tag, ni descripción del entrenamiento. Con solo 17 descargas y 0 likes, se trata de un artefacto de investigación de circulación muy reducida, no de un modelo orientado a uso productivo. Su interés radica en la serie experimental a la que pertenece, con variantes hermanas como `en_nl_linear_8-rand-d0.1-c0.99-r0.2-s42` o `nl_en_instant_8-d0.1-c0.99-r0.5-s42`, que comparten esquema de nombrado y arquitectura.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only, densa) |
| Parámetros totales | 122.706.432 (~124M, verificado en safetensors) |
| Parámetros activos | No aplica (arquitectura densa, no MoE) |
| Longitud de contexto | No disponible (la arquitectura GPT-2 base emplea 1024 tokens) |
| Tipos de cuantización | No disponible (los modelos hermanos de la serie se publican en F32) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Safetensors (F32) |
| Tamaño del repositorio | 11,3 GB |
| Fecha de publicación | 2026-10-30 |
| Descargas / Likes | 17 / 0 |
| Model card | No disponible |

## Arquitectura y entrenamiento

La arquitectura es GPT-2, un transformer decoder-only denso con attention multi-cabeza estándar, en la escala de ~124M parámetros (equivalente a GPT-2 small). Los pesos se distribuyen en safetensors y, según los metadatos de los modelos hermanos de la serie, en precisión F32. No hay evidencia de técnicas modernas como MoE, attention lineal, RoPE extendido ni decodificación especulativa.

El nombre del modelo codifica aparentemente los parámetros del experimento: `linear_8` frente a `instant_8` en otras variantes sugiere métodos de interpolación (lineal frente a instantánea) sobre 8 modelos o checkpoints; `d0.1`, `c0.99` y `r0.2` parecen coeficientes del experimento; y `s42` indica una semilla aleatoria fija (42). Las variantes `nl_en` y `en_nl` podrían referirse a direcciones entre neerlandés e inglés o a configuraciones del experimento, pero nada de esto está documentado. Sobre los datos de entrenamiento (número de tokens, composición del corpus, RLHF/DPO) no hay información disponible. El tamaño del repositorio (11,3 GB) frente a los ~0,5 GB que ocuparían los pesos en F32 indica que incluye checkpoints intermedios de entrenamiento (en un modelo hermano se observa una carpeta `checkpoint-1`).

## Capacidades

- Generación de texto autoregresiva al estilo de un modelo base GPT-2, presumiblemente sin ajuste por instrucciones (no hay evidencia de SFT, RLHF ni DPO).
- Sin evidencia de soporte de tool calling ni function calling.
- Sin evidencia de capacidades de agentes ni razonamiento multi-paso.
- Capacidades multilingües no documentadas; el sufijo `nl_en` del nombre podría sugerir una relación entre neerlandés e inglés, pero no está confirmado.
- Sin capacidades de visión, audio ni multimodalidad.
- Valor principal como artefacto de investigación: estudio de plasticidad, interpolación de pesos y dinámicas de entrenamiento mediante checkpoints.

## Casos de uso

- Investigación en plasticidad de redes neuronales: el modelo sirve como sujeto de estudio para experimentos sobre pérdida de plasticidad y recuperación de capacidad de aprendizaje en LLMs, el objetivo aparente de la serie.
- Experimentos de merging e interpolación de pesos: la variante `linear_8` sugiere interpolación lineal entre modelos, útil para estudiar cómo la combinación de pesos afecta al comportamiento del modelo resultante.
- Reproducción de experimentos con semilla fija: el sufijo `s42` permite reproducir condiciones experimentales deterministas, algo valioso en investigación verificable.
- Docencia y estudio de arquitecturas transformer: al ser un GPT-2 de 124M parámetros con checkpoints disponibles, es adecuado para analizar la evolución del entrenamiento epoch a epoch en un modelo manejable.
- Prácticas de fine-tuning de bajo coste: su tamaño reducido lo hace idóneo para aprender a ajustar modelos en hardware modesto antes de escalar a modelos mayores.
- Baseline para continual learning: puede emplearse como punto de partida pequeño y rápido para comparar estrategias de aprendizaje continuo frente a modelos más grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en F32 ocupan ~0,5 GB; convertido a FP16/BF16, ~0,25 GB; en cuantización Q8, ~0,15 GB. Cabe con holgura en cualquier GPU moderna.
- GPU recomendada: no se requiere GPU dedicada; la inferencia de un modelo de 124M parámetros es viable en CPU. Cualquier GPU de consumo (GTX 1650, RTX 3060, RTX 4090 o superior) lo ejecuta sin problemas.
- Consumer GPUs: cabe íntegramente en prácticamente cualquier GPU de consumo actual, incluidas las de gama de entrada, e incluso en la memoria unificada de portátiles.
- Opciones de despliegue: la librería `transformers` de Hugging Face soporta GPT-2 de forma nativa; llama.cpp admite la arquitectura GPT-2 previa conversión a GGUF; Ollama sería viable tras esa conversión. No está desplegado por ningún Inference Provider en Hugging Face.
- Descarga: atención al tamaño del repositorio (11,3 GB), que incluye checkpoints; los pesos del modelo final en F32 ocupan ~0,5 GB.
- Latencia y throughput: no disponibles; por la escala del modelo, se espera inferencia rápida incluso en CPU, pero no hay medidas publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Cisco1963/llmplasticity-nl_en_linear_8 (este modelo) | 122,7M | No disponible | No disponible | Safetensors F32, sin model card |
| openai-community/gpt2 | 124M | 1024 tokens | Modified MIT | Model card completa, amplio soporte de ecosistema |
| EleutherAI/pythia-160m | 160M | 2048 tokens | Apache 2.0 | 143 checkpoints públicos, muy documentado |
| Qwen2.5-0.5B | 494M | 32.768 tokens | Apache 2.0 | Instruido, tool calling, multilingüe |

La comparación muestra que este modelo no compite en capacidad con alternativas de su misma escala: frente a Pythia-160M o GPT-2 original carece de documentación y licencia, y frente a Qwen2.5-0.5B carece de instrucción, contexto largo y soporte de herramientas. Su singularidad es la serie experimental de plasticidad a la que pertenece, no su rendimiento.

## Limitaciones y advertencias

- Sin model card: ni el propósito, ni los datos de entrenamiento, ni las limitaciones específicas están documentados por el autor.
- Sin licencia declarada: por defecto, no se otorgan permisos explícitos de uso, lo que introduce incertidumbre legal para cualquier reutilización, incluido el uso comercial.
- Modelo experimental de investigación: no está pensado para producción y su comportamiento fuera del contexto del experimento es impredecible.
- Herencia GPT-2: arquitectura de 2019 con contexto corto (1024 tokens por defecto), sin alineación por RLHF, con alta tasa de alucinaciones y sesgos heredados de corpus web de esa época.
- Validación comunitaria prácticamente nula: 17 descargas y 0 likes no permiten asumir corrección ni calidad verificada por terceros.
- Pesos en F32: formato ineficiente para inferencia; conviene convertir a FP16/BF16 o GGUF para despliegue práctico.
- Repositorio de 11,3 GB: la descarga completa incluye checkpoints que probablemente no se necesitan para inferencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Cisco1963/llmplasticity-nl_en_linear_8-d0.1-c0.99-r0.2-s42
- Modelo hermano (variante rand, en_nl): https://huggingface.co/Cisco1963/llmplasticity-en_nl_linear_8-rand-d0.1-c0.99-r0.2-s42
- Modelo hermano (variante rand, d0.01): https://huggingface.co/Cisco1963/llmplasticity-en_nl_linear_8-rand-d0.01-c0.99-r0.8-s42
- Ficha indexada de variante plasticity (terceros): https://essamamdani.com/ai-models/hf-cisco1963-llmplasticity-plasticity-nl-en-linear-8-d0-125-c0-99-r0-25-s42
- Ficha indexada de variante instant (terceros): https://essamamdani.com/ai-models/hf-cisco1963-llmplasticity-nl-en-instant-8-d0-1-c0-99-r0-5-s42

No se han encontrado paper, repositorio de GitHub ni demo asociados al modelo o a la serie llmplasticity.
