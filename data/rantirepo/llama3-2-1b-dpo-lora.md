# RantiRepo/Llama3.2-1B-DPO-LoRA

## Resumen

El modelo **RantiRepo/Llama3.2-1B-DPO-LoRA** es un ajuste fino del modelo `meta-llama/Llama-3.2-1B-Instruct` mediante Direct Preference Optimization (DPO) con LoRA, orientado a mejorar la calidad de las respuestas en indonesio. El autor, RantiRepo, ha tomado el modelo base de Meta (1.235 millones de parámetros) y lo ha entrenado sobre un subconjunto de 20.000 muestras del dataset `IndonesiaAI/dpo-dataset`, que contiene tripletas de prompt, respuesta preferida (chosen) y respuesta rechazada (rejected). El objetivo es que el modelo asigne mayor probabilidad a las respuestas preferidas por humanos, mejorando así su comportamiento conversacional en ese idioma.

Este modelo es relevante porque ofrece una alternativa ligera y eficiente para aplicaciones de generación de texto en indonesio, un idioma con menos recursos que el inglés. Al partir de Llama 3.2 1B, hereda una arquitectura transformer densa con ventana de contexto nativa de 128K tokens, aunque el entrenamiento DPO se realizó con secuencias de hasta 1024 tokens. El resultado es un modelo compacto, desplegable en hardware de consumo, que puede servir como base para chatbots o asistentes en indonesio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Llama 3.2 1B) |
| Parametros totales | 1.235.814.400 (1,24 B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 128K (modelo base); entrenado con max seq length 1024 |
| Tipos de cuantizacion | no disponible (repo solo contiene safetensors en BF16) |
| Idiomas soportados | indonesio (id) |
| Licencia | no disponible (el modelo base usa licencia Llama 3.2, pero el repo no la especifica) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 1.235 millones de parámetros, perteneciente a la familia Llama 3.2 de Meta. La arquitectura incluye atención multi-cabeza, normalización RMSNorm, y activación SwiGLU, con una ventana de contexto nativa de 128K tokens. Sobre esta base, RantiRepo aplicó un ajuste fino con DPO (Direct Preference Optimization) usando LoRA de bajo rango: rank 16, alpha 32, beta 0.1, durante 2 épocas con una tasa de aprendizaje de 0.0001. El entrenamiento se realizó con secuencias de máximo 1024 tokens, lo que limita el contexto efectivo en la práctica, aunque el modelo base soporte más.

El dataset de entrenamiento, `IndonesiaAI/dpo-dataset`, proporciona pares de respuestas preferidas y rechazadas para cada prompt. DPO optimiza directamente la política del modelo para aumentar la probabilidad de la respuesta chosen frente a la rejected, sin necesidad de un modelo de recompensa separado. No se menciona el uso de RLHF adicional ni otras técnicas de alineación.

## Capacidades

- Generación de texto en indonesio: produce respuestas coherentes y contextualizadas en ese idioma.
- Conversación multi-turno: al estar basado en Llama 3.2 Instruct, mantiene diálogos con instrucciones y preguntas.
- Preferencia de respuestas: el entrenamiento DPO mejora la selección de respuestas alineadas con preferencias humanas, reduciendo respuestas no deseadas.
- Razonamiento básico y comprensión de instrucciones: heredado del modelo base, aunque limitado por su tamaño.
- No se documentan capacidades de tool calling, visión, audio ni modo de pensamiento explícito.

## Casos de uso

- Chatbots de atención al cliente en indonesio: el modelo puede gestionar conversaciones de soporte básico, respondiendo en indonesio con un tono preferido por los usuarios, gracias al ajuste DPO.
- Asistentes virtuales para aplicaciones móviles: su tamaño reducido permite integrarlo en dispositivos con recursos limitados, ofreciendo respuestas en indonesio sin depender de la nube.
- Generación de contenido en indonesio: redacción de correos, mensajes o publicaciones en redes sociales, priorizando respuestas que los humanos consideran más adecuadas.
- Filtrado de respuestas en sistemas de generación aumentada (RAG): puede usarse como modelo de reranking o generación de respuestas finales en pipelines que ya recuperan contexto.
- Entrenamiento y evaluación de preferencias: sirve como punto de partida para experimentos de alineación en indonesio, dado que su entrenamiento DPO es reproducible y documentado.
- Prototipado rápido de aplicaciones conversacionales: al ser un modelo pequeño, permite iterar rápidamente en entornos de desarrollo sin necesidad de GPUs de alta gama.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este modelo específico. El autor no proporciona métricas de rendimiento comparativas.

## Requisitos de hardware

- VRAM estimada para inferencia: en BF16 (formato original) el modelo ocupa aproximadamente 2,5 GB de memoria. Con cuantización int8 se reduce a ~1,3 GB, y con int4 a ~0,7 GB, aunque no se proporcionan pesos cuantizados en el repo.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar el modelo en BF16 (por ejemplo, GTX 1650, RTX 3050, RTX 4060). Para cuantización int4, incluso GPUs con 2 GB podrían funcionar.
- Compatibilidad con hardware de consumo: sí, cabe en GPUs de gama media y baja, así como en CPUs con suficiente RAM (usando llama.cpp).
- Opciones de despliegue: compatible con transformers, vLLM, TGI, llama.cpp, Ollama y otros frameworks que soporten modelos Llama. El repo incluye etiquetas de `text-generation-inference` y `endpoints_compatible`.
- Latencia y throughput: no se dispone de datos medidos. En una GPU moderna (RTX 4090) se espera una latencia de decenas de milisegundos por token, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| RantiRepo/Llama3.2-1B-DPO-LoRA | 1,24 B | 128K (base) | indonesio | no disponible | Fine-tuning DPO sobre Llama 3.2 1B Instruct |
| meta-llama/Llama-3.2-1B-Instruct | 1,24 B | 128K | multilingue (incluye indonesio) | Llama 3.2 Community License | Modelo base sin ajuste DPO |
| Qwen2.5-1.5B-Instruct | 1,54 B | 32K | multilingue | Apache 2.0 | Alternativa de tamaño similar, sin ajuste específico para indonesio |
| Gemma-2-2B | 2,6 B | 8K | multilingue | Gemma License | Más grande, requiere más VRAM |

No se dispone de benchmarks comparativos entre estos modelos. La comparación se basa en características técnicas y disponibilidad.

## Limitaciones y advertencias

- Sesgos del dataset: el entrenamiento se realizó con 20.000 muestras de un único dataset (`IndonesiaAI/dpo-dataset`), que puede contener sesgos culturales o de contenido propios de la comunidad que lo generó.
- Riesgo de alucinación: al ser un modelo de 1B parámetros, es propenso a generar información incorrecta o inventada, especialmente en tareas de razonamiento complejo.
- Limitación de contexto: aunque el modelo base soporta 128K tokens, el entrenamiento DPO se hizo con secuencias de 1024 tokens, por lo que el rendimiento con contextos largos puede degradarse.
- Idioma limitado: solo se ha entrenado y evaluado en indonesio; su rendimiento en otros idiomas no está garantizado.
- Licencia no especificada: el repo no indica una licencia propia. El modelo base de Meta tiene restricciones de uso comercial bajo la Llama 3.2 Community License, por lo que cualquier uso debe verificar el cumplimiento de esa licencia.
- Sin garantías de producción: no hay benchmarks ni evaluaciones formales, por lo que su uso en entornos críticos requiere validación adicional.

## Enlaces

- Repositorio del modelo: https://huggingface.co/RantiRepo/Llama3.2-1B-DPO-LoRA
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B
- Documentación de Llama 3.2 de Meta: https://developer.meta.com/ai/docs/model-cards-and-prompt-formats/llama3_2/
- Paper de Llama 3 (arXiv): https://arxiv.org/abs/2407.21783
