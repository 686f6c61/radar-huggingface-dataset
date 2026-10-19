# lugman-madhiai/LFM2.5-2.6B-Instantly-SFT-1710

## Resumen

LFM2.5-2.6B-Instantly-SFT-1710 es un ajuste fino supervisado (SFT) del modelo base LiquidAI/LFM2.5-2.6B, publicado por el usuario lugman-madhiai en HuggingFace. Se trata de un modelo denso de 2.697.198.592 parámetros (aproximadamente 2,7 mil millones) orientado a generación de texto conversacional, distribuido en formato safetensors para la librería transformers y con licencia Apache 2.0. El repositorio ocupa 5,4 GB, lo que corresponde a los pesos en precisión de 16 bits.

El modelo hereda la arquitectura LFM2 de Liquid AI, una familia híbrida que combina bloques convolucionales de corto alcance con bloques de atención con consultas agrupadas (GQA), diseñada para reducir el coste computacional en inferencia respecto a un transformer puro. El ajuste fino se realizó con Unsloth y la librería TRL de HuggingFace, según declara el autor, sin que se detallen el volumen de datos, la composición del dataset ni la metodología de evaluación.

Su relevancia es limitada y muy específica: se trata de un artefacto de fine-tuning comunitario con cero descargas y cero valoraciones en el momento de la consulta, sin model card técnica más allá de la plantilla de Unsloth. Resulta útil como punto de partida para quien quiera replicar el pipeline de SFT sobre LFM2.5-2.6B, pero no hay evidencia publicada de que mejore al modelo base en ninguna tarea concreta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido LFM2 (bloques convolucionales + atención con consultas agrupadas); detalles exactos de capas no disponibles |
| Parametros totales | 2.697.198.592 (2,7 B) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | No disponible en la información proporcionada para este fine-tune (la familia LFM2 declara 32 768 tokens, sin confirmación en esta ficha) |
| Tipos de cuantizacion | No disponible; el repositorio solo publica pesos safetensors. Compatible con cuantización vía transformers/bitsandbytes, llama.cpp u otras herramientas, pero sin GGUF publicado por el autor |
| Idiomas soportados | Inglés (`en`), único idioma declarado en los metadatos |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |
| Modelo base | LiquidAI/LFM2.5-2.6B |
| Tipo de ajuste | SFT (supervised fine-tuning) con Unsloth + TRL |
| Tamaño del repositorio | 5,4 GB |
| Fecha de creación | 2026-10-19 |
| Descargas / valoraciones | 0 / 0 |
| Etiquetas | text-generation, conversational, lfm2, unsloth, endpoints_compatible |

## Arquitectura y entrenamiento

La arquitectura subyacente es LFM2, la familia de Liquid AI que intercala capas convolucionales de corto alcance con capas de atención con consultas agrupadas. Este diseño busca mantener la calidad de un transformer denso reduciendo el coste de memoria y el tiempo por token en secuencias largas, lo que lo hace atractivo para despliegue en hardware modesto. No se dispone de la configuración exacta de capas, dimensión oculta ni número de cabezas para este checkpoint en la información proporcionada.

El proceso de entrenamiento documentado se limita a una frase: el modelo fue entrenado "2x faster" con Unsloth y TRL. No se especifica el número de tokens de entrenamiento, la composición o procedencia del dataset, la existencia de fases de RLHF o DPO, ni hiperparámetros como tasa de aprendizaje, épocas o precisión utilizada. El nombre del checkpoint ("Instantly-SFT-1710") sugiere un experimento puntual de ajuste supervisado, no un modelo con pipeline de alineamiento completo. Tampoco se documenta ninguna innovación técnica adicional sobre el modelo base.

## Capacidades

- Generación de texto conversacional en inglés, según la etiqueta `conversational` y la tarea `text-generation` declaradas.
- Instrucciones de un solo turno y conversaciones multi-turno, siempre que el template de chat del modelo base se aplique correctamente (el autor no documenta el chat template empleado).
- Razonamiento y conocimiento general heredados del modelo base, sin evaluación publicada que lo confirme.
- Generación de código: capacidad presumible por herencia del base, no verificada ni documentada en este checkpoint.
- Soporte de tool calling / function calling: no documentado en esta ficha.
- Soporte de agentes y razonamiento multi-paso: no documentado en esta ficha.
- Capacidades multilingües: limitadas al inglés según los metadatos; no se declara soporte de castellano ni de otros idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Prototipado rápido de asistentes conversacionales en inglés sobre hardware de gama media: con 2,7 B de parámetros, el modelo cabe cuantizado en una GPU de 8 GB, lo que permite levantar un endpoint de pruebas sin infraestructura dedicada.
- Replicación de pipelines de SFT: sirve como referencia de cómo Unsloth y TRL generan un checkpoint completo a partir de LFM2.5-2.6B, útil para equipos que quieran montar su propio flujo de ajuste supervisado.
- Base para un segundo ajuste con datos propios: al estar publicado en safetensors y con licencia Apache 2.0, puede actuar como punto de partida (continued pretraining o nuevo SFT) en lugar del modelo original, aunque sin garantías de que el SFT previo aporte ventaja.
- Generación de texto offline en entornos con recursos limitados: el tamaño reducido permite ejecución en CPU con cuantización de 4 bits, adecuado para tareas de resumen o reescritura por lotes donde la latencia no es crítica.
- Experimentación académica sobre arquitecturas híbridas conv-attention: permite comparar el comportamiento de un LFM2 ajustado frente al base en tareas controladas de generación.
- Evaluación comparativa de calidad de fine-tunes comunitarios: útil como muestra negativa o de control en estudios sobre trazabilidad y documentación de modelos publicados en HuggingFace, dado que carece de métricas y de descripción del dataset.
- Sustituto ligero en pruebas de integración de infraestructura (vLLM, TGI, endpoints compatibles): la etiqueta `endpoints_compatible` permite validar que el stack de despliegue carga correctamente un checkpoint LFM2 antes de migrar a un modelo mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5,4-6,5 GB en FP16/BF16 (solo pesos, más caché KV); en torno a 3 GB en int8 y 1,7-2,0 GB en cuantización de 4 bits.
- GPU recomendadas para FP16: NVIDIA A10G, L4, RTX 4090, A100 o H100 si se necesita alto throughput; para cuantización 4 bits basta una RTX 3060 de 12 GB o una RTX 4060 Ti de 16 GB.
- Cabe en GPU de consumo: sí, en cualquier tarjeta con 8 GB o más en FP16 y desde 4-6 GB en 4 bits; también es viable en CPU con llama.cpp si se generan pesos GGUF a partir del checkpoint.
- Opciones de despliegue: transformers (ruta nativa del repositorio), Text Generation Inference (etiqueta `text-generation-inference`), vLLM si la versión soporta la arquitectura LFM2, y llama.cpp/Ollama previa conversión a GGUF (no publicada por el autor).
- Latencia y throughput: no disponibles; no se han publicado mediciones para este checkpoint. Como referencia de orden de magnitud, un modelo denso de 2,7 B en una RTX 4090 suele moverse en decenas de tokens por segundo, pero esta cifra no está verificada para este modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lugman-madhiai/LFM2.5-2.6B-Instantly-SFT-1710 | 2,7 B | No disponible | Sin benchmarks publicados | Apache 2.0 | HuggingFace, 0 descargas |
| LiquidAI/LFM2.5-2.6B (base) | 2,6 B aprox. | 32 768 tokens según la familia (no confirmado en la información disponible) | Métricas publicadas por Liquid AI en su model card | Apache 2.0 (según licencia del base) | HuggingFace, modelo oficial |
| Qwen2.5-3B-Instruct | 3,1 B | 32 768 tokens | Benchmarks publicados por el autor | Apache 2.0 | HuggingFace, ampliamente desplegado |
| Llama-3.2-3B-Instruct | 3,2 B | 131 072 tokens | Benchmarks publicados por el autor | Llama 3.2 Community License (restricciones de uso) | HuggingFace, requiere aceptación de términos |

La comparación relevante es contra el modelo base: este checkpoint no documenta mejoras medibles, por lo que en ausencia de evaluación debe asumirse paridad o degradación. Frente a Qwen2.5-3B-Instruct y Llama-3.2-3B-Instruct, el atractivo principal de la familia LFM2 es su eficiencia en inferencia por la arquitectura híbrida, no un rendimiento superior en benchmarks.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay benchmarks, ablaciones ni comparación con el modelo base, por lo que se desconoce si el SFT mejora, degrada o deja intactas las capacidades originales.
- Dataset de entrenamiento no documentado: se desconoce su procedencia, tamaño, licencia y posibles sesgos incorporados; esto impide auditar el modelo para uso en producción.
- Riesgo de sobreajuste y de colapso de formato: los SFT breves sin regularización tienden a reproducir estilos y longitudes del dataset, con posible degradación en tareas fuera de distribución.
- Riesgo de alucinación: inherente a modelos de 2,7 B parámetros; sin evaluación de factualidad no puede acotarse.
- Idioma: solo se declara inglés; no hay evidencia de calidad en castellano ni en otros idiomas, y el tokenizador del base no está documentado en esta ficha.
- Contexto: la longitud de contexto efectiva de este checkpoint no está verificada; conviene asumir la del modelo base y validarla empíricamente antes de diseñar prompts largos.
- Licencia: Apache 2.0 permite uso comercial, pero el titular del fine-tune no ofrece garantías y los términos del modelo base deberían revisarse por separado.
- Señales de madurez del artefacto: cero descargas, cero valoraciones, model card generada por plantilla y nombre de checkpoint con marca temporal, lo que indica un experimento personal sin validación de la comunidad.
- Sin pesos cuantizados publicados: quien necesite GGUF o AWQ deberá generarlos y validar su fidelidad.
- Fecha de creación registrada como 2026-10-19, posterior a la fecha habitual de consulta; conviene verificar la integridad del repositorio antes de integrarlo en un pipeline.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lugman-madhiai/LFM2.5-2.6B-Instantly-SFT-1710
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-2.6B
- Unsloth (framework de entrenamiento utilizado): https://github.com/unslothai/unsloth
- TRL de HuggingFace: https://github.com/huggingface/trl
- Sitio de Liquid AI: https://www.liquid.ai/
- Documentación de Text Generation Inference: https://huggingface.co/docs/text-generation-inference
- Repositorio de llama.cpp (para conversión a GGUF): https://github.com/ggml-org/llama.cpp
- Repositorio de vLLM: https://github.com/vllm-project/vllm
