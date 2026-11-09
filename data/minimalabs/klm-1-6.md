# MinimaLabs/KLM-1.6

## Resumen

KLM 1.6 es un modelo de lenguaje base de 99 millones de parámetros desarrollado por MinimaLabs. Se trata de una actualización incremental de KLM 1.5: parte de un checkpoint de su predecesor tomado antes de la fase de decaimiento del learning rate y extiende esa fase de decaimiento de 20B a 100B tokens. El modelo está diseñado como base preentrenada, sin ajuste por instrucciones ni por preferencias, por lo que su uso previsto es el de punto de partida para fine-tuning.

La arquitectura es híbrida: combina capas de Gated DeltaNet-2 (un mecanismo recurrente con estado) y capas de atención en proporción 3:1, con 24 capas totales, tamaño oculto de 512 y un vocabulario reducido de 4.100 tokens. Incorpora además una memoria de n-gramas con 125.000 bigramas y 38.000 trigramas, cada uno con su propio vector aprendido, y utiliza Block Attention Residuals en las conexiones residuales.

Su relevancia radica en el rendimiento para su tamaño: según la Open SLM Leaderboard, con un Intelligence Index de 33,95 ocupa el primer puesto entre modelos de menos de 100M, 150M y 250M parámetros, superando a alternativas más grandes como SmolLM2-135M o LFM-2.5-230M-Base en varios benchmarks. El modelo se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: Gated DeltaNet-2 y atención en proporción 3:1, con Block Attention Residuals y memoria de n-gramas |
| Parametros totales | 98.975.308 (de los cuales 5.411.832 corresponden a la memoria de n-gramas) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers, requiere custom_code) |

## Arquitectura y entrenamiento

El modelo tiene 24 capas que alternan Gated DeltaNet-2 y atención en ratio 3:1. Las capas de Gated DeltaNet-2 usan 4 cabezas de tamaño 128. Las capas de atención emplean 8 cabezas de consulta y 4 de clave-valor, con tamaño de cabeza 64, RoPE, QK-norm y puerta de salida. El feed-forward es SwiGLU con tamaño oculto de 1.408, el tamaño oculto global es 512 y los embeddings están atados al vocabulario de 4.100 tokens. Las conexiones residuales usan Block Attention Residuals y el modelo incorpora una memoria de n-gramas de 125.000 bigramas y 38.000 trigramas con vectores aprendidos.

El entrenamiento se realizó sobre secuencias de 2.048 tokens en tres fases. La primera, de calentamiento por superposición, aplicó Token-Superposition Training durante 70.000 pasos: cada posición de entrada es la media de 7 tokens consecutivos y el modelo predice los siguientes 7 como grupo no ordenado, lo que permitió cubrir 128B tokens de ClimbMix con el coste computacional de unos 18B. La segunda fase consistió en 80B tokens de predicción del siguiente token con learning rate constante. La tercera, de decaimiento, cubrió 100B tokens con el learning rate descendiendo a cero según una curva 1−√t. Las matrices de pesos se entrenaron con MuonEq-R a learning rate 0,01; embeddings, normas y puertas con AdamW a 3e-3, en bf16. La atención está enmascarada en los límites de documento y se reinician el estado recurrente y el historial de n-gramas en cada frontera. Los datos provienen de ClimbMix, TxT360-v2, UltraX, Dolmino, Cosmopedia, DCLM-baseline, OpenMathInstruct-2, UltraData-Math, Math-Reasoning y Pretrain-Behaviors, entre otras fuentes.

## Capacidades

- Generación de texto autoregresiva como modelo base: continúa texto, pero no sigue instrucciones ni mantiene conversación sin fine-tuning.
- Razonamiento aritmético y matemático básico, con resultados destacados en ArithMark-3 (55,90%).
- Comprensión de sentido común y conocimiento general, evaluada en ARC, HellaSwag y PIQA.
- Capacidad multilingüe: únicamente inglés.
- Tokenizer con tokens especiales `<|im_start|>`, `<|im_end|>`, `<think>` y `</think>` ya integrados como tokens únicos, listos para fine-tunes de chat y razonamiento.
- No dispone de soporte nativo de tool calling, function calling, agentes, visión, audio ni modo thinking; cualquier capacidad de este tipo requeriría fine-tuning.
- Ejecutable en CPU y GPU con PyTorch estándar y Transformers, sin paquetes adicionales.

## Casos de uso

- Fine-tuning para clasificación o etiquetado de texto: el modelo base puede adaptarse con un conjunto pequeño de datos etiquetados para tareas como análisis de sentimiento o detección de tópicos, aprovechando su bajo coste de inferencia.
- Generación de texto en dispositivos con recursos limitados: con 99M de parámetros y pesos en bf16 (unos 0,4 GB), puede ejecutarse en CPU o en GPUs de gama baja para autocompletado o generación de borradores.
- Punto de partida para fine-tunes de chat: los tokens de plantilla de conversación ya están integrados en el tokenizer, lo que simplifica la adaptación a instrucciones con formatos tipo ChatML.
- Fine-tuning para razonamiento paso a paso: la inclusión de los tokens `<think>` y `</think>` permite entrenar variantes con cadenas de razonamiento explícitas.
- Investigación en arquitecturas híbridas: sirve como referencia reproducible para estudiar Gated DeltaNet-2, Block Attention Residuals y Token-Superposition Training en un modelo pequeño.
- Educación y prototipado de pipelines de NLP: su tamaño reducido permite entrenar y desplegar en entornos docentes o de pruebas sin infraestructura dedicada.
- Generación aumentada con recuperación (RAG) en inglés: puede usarse como generador en sistemas RAG de dominio acotado tras un fine-tuning específico, aunque su ventana de 2.048 tokens limita el contexto recuperado.

## Benchmarks y rendimiento

Resultados zero-shot con precisión normalizada por longitud, según la model card. ARC, HellaSwag y PIQA evaluados con lm-eval 0.4.12; ArithMark-3 con el script oficial.

| Modelo | Parámetros | ARC-Easy | ARC-Challenge | HellaSwag | PIQA | ArithMark-3 |
|---|---|---|---|---|---|---|
| **KLM 1.6** | 99,0M | 61,07% | 33,53% | 45,28% | 70,18% | 55,90% |
| KLM 1.5 | 99,0M | 59,68% | 32,68% | 43,74% | 68,55% | 48,20% |
| GPT-X3-150M | 149M | 59,64% | 31,31% | 46,16% | 71,33% | 50,90% |
| SmolLM2-135M | 135M | 58,63% | 29,69% | 43,22% | 68,44% | 39,20% |
| LFM-2.5-230M-Base | 230M | 59,72% | 34,98% | 39,29% | 63,38% | 36,60% |
| void.1 | 90,1M | 49,32% | 29,35% | 39,46% | 67,19% | 43,70% |

Según la Open SLM Leaderboard (a fecha 2026-11-09), KLM 1.6 obtiene un Intelligence Index de 33,95, el primero entre modelos de menos de 100M, 150M y 250M parámetros; solo dos modelos de cualquier tamaño lo superan, ambos de unos 360M de parámetros.

## Requisitos de hardware

- VRAM estimada: los pesos en bf16 ocupan aproximadamente 0,4 GB (tamaño del repo); en fp32 serían unos 0,8 GB. La memoria adicional para activaciones y estado recurrente es reducida por el contexto de 2.048 tokens.
- GPU recomendadas: cualquier GPU moderna con al menos 2 GB de VRAM es suficiente; no requiere A100 ni H100. Funciona en RTX 4090, RTX 3060 y GPUs integradas.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo actual e incluso en CPU.
- Opciones de despliegue: Transformers con PyTorch estándar (requiere `custom_code`); la model card solo documenta este método. No se confirma soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Rendimiento destacado | Disponibilidad |
|---|---|---|---|---|---|
| KLM 1.6 | 99,0M | 2.048 | Apache 2.0 | ArithMark-3 55,90%; líder en Open SLM <100M | Hugging Face |
| SmolLM2-135M | 135M | no disponible | no disponible | HellaSwag 43,22%; ArithMark-3 39,20% | Hugging Face |
| LFM-2.5-230M-Base | 230M | no disponible | no disponible | ARC-Challenge 34,98%; ArithMark-3 36,60% | Hugging Face |
| void.1 | 90,1M | no disponible | no disponible | PIQA 67,19%; ArithMark-3 43,70% | Hugging Face |

KLM 1.6 ofrece el mejor ArithMark-3 de la comparativa y supera a SmolLM2-135M y LFM-2.5-230M-Base en ARC-Easy, HellaSwag (frente a este último) y PIQA, con menos parámetros que ambos. GPT-X3-150M queda ligeramente por delante en HellaSwag y PIQA, pero por detrás en el resto.

## Limitaciones y advertencias

- Es un modelo base: no sigue instrucciones ni mantiene conversaciones; usarlo directamente como asistente produce resultados deficientes.
- Ventana de contexto limitada a 2.048 tokens, insuficiente para documentos largos o conversaciones extensas.
- Solo soporta inglés; el rendimiento en otros idiomas no está garantizado.
- Riesgo de alucinación inherente a los modelos de lenguaje pequeños, especialmente en conocimiento factual.
- Sesgos potenciales heredados de los corpus web utilizados (ClimbMix, DCLM, etc.), no documentados en la model card.
- Vocabulario muy reducido (4.100 tokens), lo que puede penalizar la eficiencia en dominios con terminología especializada.
- Licencia Apache 2.0: permite uso comercial, pero al ser un modelo base conviene evaluar los fine-tunes resultantes antes de producción.
- Requiere `trust_remote_code` por el uso de `custom_code`; conviene revisar el código del repositorio antes de ejecutarlo.
- No se documentan resultados de benchmarks de seguridad, toxicidad ni robustez.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MinimaLabs/KLM-1.6
- KLM 1.5: https://huggingface.co/MinimaLabs/KLM-1.5
- Open SLM Leaderboard: https://huggingface.co/spaces/AxiomicLabs/Open_SLM_Leaderboard
- Paper Token-Superposition Training: https://arxiv.org/abs/2605.06546
- Paper Block Attention Residuals: https://arxiv.org/abs/2603.15031
- Dataset ArithMark-3.0: https://huggingface.co/datasets/AxiomicLabs/ArithMark-3.0
- GPT-X3-150M: https://huggingface.co/AxiomicLabs/GPT-X3-150M
- SmolLM2-135M: https://huggingface.co/HuggingFaceTB/SmolLM2-135M
- LFM-2.5-230M-Base: https://huggingface.co/LiquidAI/LFM2.5-230M-Base
- void.1: https://huggingface.co/dotlabs/void.1
- Dataset ClimbMix: https://huggingface.co/datasets/nvidia/Nemotron-ClimbMix
- Dataset TxT360-v2: https://huggingface.co/datasets/IFM/TxT360-v2
- Dataset UltraX: https://huggingface.co/datasets/openbmb/UltraX-Preview
- Dataset Dolmino: https://huggingface.co/datasets/allenai/dolma3_dolmino_mix-100B-1025
- Dataset Cosmopedia v2: https://huggingface.co/datasets/HuggingFaceTB/smollm-corpus
- Dataset Cosmopedia: https://huggingface.co/datasets/HuggingFaceTB/cosmopedia
- Dataset DCLM-baseline: https://huggingface.co/datasets/mlfoundations/dclm-baseline-1.0
- Dataset OpenMathInstruct-2: https://huggingface.co/datasets/nvidia/OpenMathInstruct-2
- Dataset UltraData-Math: https://huggingface.co/datasets/openbmb/UltraData-Math
- Dataset Math-Reasoning: https://huggingface.co/datasets/IFM/Math-Reasoning
- Dataset Pretrain-Behaviors: https://huggingface.co/datasets/IFM/Pretrain-Behaviors
