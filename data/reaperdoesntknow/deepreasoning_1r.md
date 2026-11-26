# reaperdoesntknow/DeepReasoning_1R

## Resumen

DeepReasoning_1R es un ajuste fino (fine-tune) del modelo Qwen2.5-0.5B-Instruct, desarrollado por el usuario reaperdoesntknow bajo la marca Convergent Intelligence LLC: Research Division. Se trata de un modelo de generación de texto de pequeno tamano, con 494 millones de parámetros, orientado a tareas de razonamiento y conversación. El modelo parte de la arquitectura Qwen2 de Alibaba y ha sido entrenado sobre el dataset HumanLLMs/Human-Like-DPO-Dataset, lo que sugiere un ajuste orientado a preferencias humanas.

El modelo se presenta dentro de un portafolio más amplio de modelos del mismo autor, que incluye variantes destiladas de Qwen3 y otros modelos orientados a razonamiento y código. DeepReasoning_1R se posiciona como una propuesta ligera para experimentación con razonamiento en entornos de recursos limitados, aunque la documentación técnica disponible es escasa y no se detallan aspectos clave como la composición exacta del dataset de entrenamiento, el número de tokens utilizados o los resultados de evaluación.

Con 1.874 descargas y 2 likes en Hugging Face, el modelo tiene una adopción moderada dentro del ecosistema. Su relevancia radica en ser un ejemplo de fine-tuning de bajo coste sobre una base compacta y bien conocida (Qwen2.5-0.5B-Instruct), lo que facilita su despliegue en hardware de consumo, aunque carece de benchmarks publicados que permitan validar sus capacidades de razonamiento de forma objetiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 494.032.768 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen2.5-0.5B-Instruct, no confirmada) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizaciones GGUF no publicadas en el repo) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

DeepReasoning_1R emplea la arquitectura Qwen2, un transformer decoder-only con atención causal estándar, heredada directamente de Qwen2.5-0.5B-Instruct. El modelo base cuenta con 494 millones de parámetros y está diseñado para generación de texto autorregresiva. No se dispone de información sobre modificaciones arquitectónicas respecto al modelo base.

El entrenamiento se realizó mediante fine-tuning sobre el dataset HumanLLMs/Human-Like-DPO-Dataset, lo que indica un ajuste orientado a preferencias humanas (DPO o similar) para alinear las respuestas del modelo con estilos conversacionales más naturales. No se especifican el número de tokens de entrenamiento, la composición detallada del dataset, la existencia de RLHF adicional ni hiperparámetros de entrenamiento. El autor enmarca el modelo dentro de un framework propio denominado Discrepancy Calculus (DISC), una aproximación teórica de medida que trata las singularidades del entrenamiento como señales estructurales, aunque no se aportan detalles concretos sobre cómo se aplica este framework al entrenamiento de este modelo específico.

## Capacidades

- Generación de texto conversacional en formato multi-turno, heredada de la base instruct.
- Razonamiento de propósito general, según la orientación declarada del modelo (tag "reasoning").
- Generación de código y matemáticas básicas, presumiblemente heredadas de Qwen2.5-0.5B-Instruct, aunque no confirmadas mediante benchmarks.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: no disponible (no se especifican idiomas).
- Modo thinking explícito: no disponible (no documentado).
- Visión o audio: no soportado (modelo puramente textual).

## Casos de uso

- Prototipado rápido de asistentes conversacionales: el modelo puede gestionar diálogos multi-turno básicos en entornos de desarrollo con recursos limitados, gracias a su reducido tamaño de 494M de parámetros y su formato safetensors compatible con transformers.
- Experimentación académica con técnicas de alineación: al estar entrenado sobre un dataset DPO, sirve como caso de estudio para investigar el efecto del ajuste por preferencias en modelos pequeños.
- Despliegue en dispositivos de borde: su tamaño permite ejecución en CPU o GPUs de gama baja, adecuado para demos locales o aplicaciones embebidas donde no se requiere alta calidad.
- Generación de texto auxiliar en pipelines de datos: puede utilizarse para tareas de aumento de datos, resumen o reformulación en contextos donde el coste computacional es crítico.
- Base para fine-tuning adicional: al ser un modelo pequeño y abierto en formato safetensors, puede servir como punto de partida para ajustes específicos de dominio con presupuesto reducido.
- Educación y divulgación: útil para demostrar el ciclo completo de fine-tuning de un modelo Qwen2 en cursos o talleres, dado su bajo coste de entrenamiento e inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB en FP16 (494M parámetros × 2 bytes), alrededor de 0,5 GB en cuantización de 8 bits y unos 0,3 GB en 4 bits (estimaciones teóricas, no confirmadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; RTX 3060, RTX 4060, GTX 1660 o superiores son suficientes. También cabe en GPUs de datacenter como A100 o H100, aunque no las aprovecha.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag presente), endpoints_compatible. No se han publicado pesos GGUF en el repo, por lo que llama.cpp y Ollama requerirían conversión manual.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| DeepReasoning_1R | 494M | no disponible | no disponible | Hugging Face (safetensors) | Fine-tune DPO sobre Qwen2.5-0.5B-Instruct |
| Qwen2.5-0.5B-Instruct | 494M | 32.768 tokens (según documentación oficial de Qwen) | Apache 2.0 (según Qwen) | Hugging Face, GGUF, Ollama | Modelo base; benchmarks publicados por Alibaba |
| SmolLM2-360M-Instruct | 360M | 8.192 tokens (según HuggingFace) | Apache 2.0 | Hugging Face, GGUF | Alternativa compacta de Hugging Face |
| Qwen2.5-1.5B-Instruct | 1.540M | 32.768 tokens | Apache 2.0 | Hugging Face, GGUF, Ollama | Misma familia, mayor capacidad |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al derivar de Qwen2.5-0.5B-Instruct, es probable que herede sesgos presentes en los datos de entrenamiento del modelo base, pero no se han realizado evaluaciones específicas.
- Riesgo de alucinación: elevado, dado el reducido tamaño del modelo (494M parámetros); los modelos pequeños tienden a generar información incorrecta con mayor frecuencia, especialmente en tareas de razonamiento complejo.
- Limitaciones de contexto e idioma: no se especifican la longitud de contexto efectiva ni los idiomas soportados; se desconoce si el fine-tuning ha degradado capacidades multilingües del modelo base.
- Restricciones de licencia: la licencia no está disponible, lo que impide determinar si se permite uso comercial. Se recomienda contactar con el autor antes de cualquier despliegue en producción.
- Caveats para producción: ausencia de benchmarks publicados, documentación técnica incompleta y falta de pesos cuantizados en el repo dificultan la evaluación objetiva de su calidad y su integración en pipelines estándar.
- El modelo se enmarca en un framework teórico (Discrepancy Calculus) sin validación independiente publicada, por lo que las afirmaciones del autor sobre su metodología deben tomarse con cautela.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reaperdoesntknow/DeepReasoning_1R
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/HumanLLMs/Human-Like-DPO-Dataset
- Perfil del autor: https://huggingface.co/reaperdoesntknow
- Documento Structure Over Scale: https://huggingface.co/reaperdoesntknow/Structure-Over-Scale (DOI: 10.57967/hf/8165)
- Documento Three Teachers to Dual Cognition: https://huggingface.co/reaperdoesntknow/DualMind_Methodolgy (DOI: 10.57967/hf/8184)
- Documento Discrepancy Calculus: https://huggingface.co/reaperdoesntknow/Discrepancy_Calculus (DOI: 10.57967/hf/8194)
- Modelo SMOLM2Prover: https://huggingface.co/reaperdoesntknow/SMOLM2Prover
- Modelo SMOLM2Prover-GGUF: https://huggingface.co/reaperdoesntknow/SMOLM2Prover-GGUF
- Modelo SAGI: https://huggingface.co/reaperdoesntknow/SAGI
- Modelo S-AGI: https://huggingface.co/reaperdoesntknow/S-AGI
- Modelo Qwen3-1.7B-Thinking-Distil: https://huggingface.co/reaperdoesntknow/Qwen3-1.7B-Thinking-Distil
- Modelo LFM2.5-1.2B-Distilled-SFT: https://huggingface.co/reaperdoesntknow/LFM2.5-1.2B-Distilled-SFT
- Modelo Qwen3-1.7B-Coder-Distilled-SFT: https://huggingface.co/reaperdoesntknow/Qwen3-1.7B-Coder-Distilled-SFT
- Modelo Qwen3-0.6B-Distilled-30B-A3B-Thinking-SFT-GGUF: https://huggingface.co/reaperdoesntknow/Qwen3-0.6B-Distilled-30B-A3B-Thinking-SFT-GGUF
- Modelo Qwen3-1.7B-Coder-Distilled-SFT-GGUF: https://huggingface.co/reaperdoesntknow/Qwen3-1.7B-Coder-Distilled-SFT-GGUF
- Colección DistilQwen: https://huggingface.co/collections/reaperdoesntknow/distilqwen-69bf40ec669117e3f069ef1c
