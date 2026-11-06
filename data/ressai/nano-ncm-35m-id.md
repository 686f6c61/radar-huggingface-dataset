# RessAI/Nano-NCM-35M-ID

## Resumen

Nano-NCM-35M-ID es un modelo de lenguaje de 35,5 millones de parámetros desarrollado por RessAI como prueba de concepto de la arquitectura Next-Concept Modeling (NCM), propuesta por investigadores de Stanford (Hazy Research) y Together AI en el paper *Next-Concept Modeling: Fast, Parallel Coarse-to-Fine Text Generation* (arXiv:2610.14162). El modelo adapta ese marco a un dominio concreto: seguridad informática, tecnología de la información y conocimiento general en indonesio.

A diferencia de los transformers autoregresivos convencionales, NCM combina un compresor multiescala basado en VQ-VAE residual (RVQ) que reduce la secuencia 4:1 en códigos latentes discretos jerárquicos, con un generador coarse-to-fine que predice primero conceptos gruesos y luego detalles léxicos. Esto reduce el número de pasos secuenciales en inferencia y evita el coste de múltiples pasos de denoising de los modelos de difusión enmascarada.

El modelo es relevante como referencia técnica y educativa: implementa desde cero una arquitectura poco común, con optimizaciones específicas para indonesio (tokenizer Qwen de 152.064 tokens con embedding factorizado, encoder causal para evitar future leakage, decoder guiado por conceptos y SFT con student-forcing). Su tamaño nano lo hace desplegable en hardware muy modesto, aunque su utilidad práctica en producción es limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Next-Concept Modeling (NCM): encoder causal + RVQ-VAE multiescala (4 niveles) + generador transformer coarse-to-fine + decoder guiado por conceptos |
| Parametros totales | 35.538.688 (35,47M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan GGUF ni cuantizaciones publicadas) |
| Idiomas soportados | indonesio (id) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers con custom_code) |

## Arquitectura y entrenamiento

La arquitectura se divide en dos etapas. La etapa 1 es un compresor multiescala Residual VQ-VAE con encoder causal de 3 capas (RoPE, SwiGLU), down-sampling de parches 4:1 y 4 niveles de codebook RVQ de 4096 entradas cada uno (nivel 1: esbozo semántico grueso; nivel 2: estructura sintáctica; nivel 3: frase contextual; nivel 4: residuo léxico fino). La etapa 2 es un generador NCM de 8 capas que predice los códigos de concepto de grueso a fino, seguido de un decoder guiado por conceptos que reconstruye el texto.

El embedding usa el vocabulario de la familia Qwen (152.064 tokens) con factorización de bajo rango (152.064 × 96 × 256) y weight-tying, lo que reduce más del 60% de los parámetros de embedding. El encoder de la etapa 1 es causal para garantizar consistencia entre prompts cortos en inferencia y la fase de entrenamiento. Durante el SFT se congelan los codebooks RVQ y se entrena el decoder con conceptos predichos por la etapa 2 (student-forcing) para eliminar el exposure bias. Se aplica alineación de prompts a múltiplos de 4 tokens y loss masking en el segmento de pregunta.

Los datos de entrenamiento citados son los corpus `carlesoctav/miracl-corpus-id` y `cahya/alpaca-id-cleaned`. No se especifica el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF o DPO. El entrenamiento se realizó en 2× NVIDIA Tesla T4.

## Capacidades

- Generación de texto conversacional en indonesio.
- Razonamiento de conocimiento general y dominio de seguridad informática y TI (según la model card).
- Generación condicionada por instrucciones (formato instrucción-respuesta vía SFT sobre Alpaca-ID).
- Arquitectura coarse-to-fine con predicción paralela de conceptos, orientada a reducir latencia frente a generación token a token.
- Soporte de expansión de pesos Net2Wider function-preserving hacia escalas superiores a 100M de parámetros.
- Tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multimodales (visión, audio): no disponibles.
- Modo thinking explícito: no disponible.

## Casos de uso

- Investigación y reproducción de arquitecturas NCM: el modelo sirve como implementación de referencia funcional del paper arXiv:2610.14162, útil para estudiar el compresor RVQ y el generador coarse-to-fine en un entorno de 35M de parámetros.
- Experimentación académica con hardware limitado: al caber en GPUs de consumo y entrenarse en 2× Tesla T4, permite iterar sobre variantes de la arquitectura sin clústeres dedicados.
- Prototipado de asistentes en indonesio para dominios técnicos: respuestas sobre conceptos básicos de ciberseguridad y TI en un entorno controlado, siempre con revisión humana.
- Base para fine-tuning de dominio: al ser Apache 2.0 y de tamaño reducido, se puede ajustar para tareas concretas de clasificación o generación en indonesio con costes bajos.
- Pruebas de escalado con Net2Wider: la función de expansión function-preserving permite estudiar cómo escala el rendimiento al aumentar parámetros sin reentrenar desde cero.
- Docencia sobre tokenización multilingüe: el embedding factorizado sobre el vocabulario Qwen de 152.064 tokens es un caso práctico para explicar weight-tying y factorización de bajo rango.
- Evaluación de latencia en generación paralela: útil para comparar empíricamente el paradigma NCM frente a transformers autoregresivos en secuencias cortas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (35,5M parámetros, ~142 MB de pesos) y ~0,5 GB en fp16/bf16; el repo ocupa 0,2 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el autor entrenó en 2× NVIDIA Tesla T4.
- Cabe en GPU de consumo: sí, en GTX 1050 Ti, GTX 1650, RTX 3050, RTX 4060 y superiores; también en CPU para inferencia de baja concurrencia.
- Opciones de despliegue: transformers con `trust_remote_code=True` (requiere `custom_code`); no se documentan soportes de vLLM, llama.cpp, Ollama ni TGI para esta arquitectura personalizada.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Nano-NCM-35M-ID | 35,5M | no disponible | Apache 2.0 | Hugging Face (custom_code) | Arquitectura NCM, solo indonesio |
| Qwen2.5-0.5B | 494M | 32.768 tokens | Apache 2.0 | Hugging Face, vLLM, llama.cpp, Ollama | Transformer estándar, multilingüe |
| SmolLM2-135M | 135M | 8.192 tokens | Apache 2.0 | Hugging Face, llama.cpp, Ollama | Transformer estándar, entrenado en inglés |
| TinyLlama-1.1B | 1,1B | 2.048 tokens | Apache 2.0 | Hugging Face, vLLM, llama.cpp | Transformer estándar, inglés |

La comparación directa es limitada: Nano-NCM-35M-ID es un proof-of-concept de una arquitectura experimental, no un modelo de propósito general listo para producción. Los modelos de la tabla son transformers convencionales con ecosistema de despliegue maduro y cobertura multilingüe.

## Limitaciones y advertencias

- Tamaño muy reducido (35,5M parámetros): la calidad de generación y el razonamiento serán limitados en comparación con modelos de cientos de millones de parámetros.
- Solo soporta indonesio; no se han validado capacidades en otros idiomas.
- No se documenta la longitud de contexto soportada, lo que dificulta planificar casos de uso con prompts largos.
- Arquitectura personalizada (`custom_code`): requiere `trust_remote_code=True` y no es compatible con los runners estándar (vLLM, llama.cpp, Ollama, TGI) sin adaptaciones.
- Riesgo de alucinación elevado en dominios técnicos por el tamaño reducido y la naturaleza de proof-of-concept.
- Sesgos: no se documentan evaluaciones de sesgo; los corpus MIRACL-ID y Alpaca-ID pueden introducir sesgos propios de sus fuentes.
- Licencia Apache 2.0 permite uso comercial, pero la falta de benchmarks y de validación en producción desaconseja su uso directo en entornos críticos.
- Sin datos publicados de benchmarks, no es posible comparar su rendimiento real frente a alternativas.
- El modelo se presenta explícitamente como PoC; no hay garantías de robustez ni de mantenimiento.

## Enlaces

- Hugging Face: https://huggingface.co/RessAI/Nano-NCM-35M-ID
- Paper NCM: https://arxiv.org/abs/2610.14162
- Repositorio de referencia NCM: https://github.com/hazyresearch/ncm
- Dataset MIRACL-ID: https://huggingface.co/datasets/carlesoctav/miracl-corpus-id
- Dataset Alpaca-ID: https://huggingface.co/datasets/cahya/alpaca-id-cleaned
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
