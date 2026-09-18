# Qwen/Qwen2.5-1.5B-Instruct

## Resumen

Qwen2.5-1.5B-Instruct es un modelo de lenguaje causal de 1.543.714.304 parámetros (1,31B sin contar embeddings) desarrollado por el equipo Qwen de Alibaba Cloud, publicado en septiembre de 2024 como parte de la familia Qwen2.5. Se trata de la variante instruida (instruction-tuned) del modelo base Qwen2.5-1.5B, ajustada para seguir instrucciones y mantener conversaciones multi-turno mediante un formato de chat con roles de sistema, usuario y asistente. Su tamaño reducido lo sitúa en la gama de entrada, pensada para ejecución en hardware de consumo y despliegues con requisitos estrictos de latencia.

La familia Qwen2.5 introduce mejoras sobre Qwen2 en conocimiento factual, código y matemáticas (gracias a modelos expertos especializados en esos dominios durante el entrenamiento), seguimiento de instrucciones, generación de textos largos de más de 8.000 tokens, comprensión de datos estructurados (tablas) y generación de salidas estructuradas como JSON. También se refuerza la robustez frente a diversidad de system prompts, lo que mejora la implementación de role-play y el condicionamiento de chatbots.

Este modelo concreto soporta una longitud de contexto completa de 32.768 tokens y genera hasta 8.192 tokens. La arquitectura es un transformer decoder-only con RoPE, SwiGLU, RMSNorm, sesgo en las proyecciones QKV y embeddings de palabras atados (tied word embeddings), con atención de consultas agrupadas (GQA) de 12 cabezas para Q y 2 para KV. Se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales, y acumula más de 7,1 millones de descargas en HuggingFace.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only con RoPE, SwiGLU, RMSNorm, sesgo en QKV y embeddings atados (GQA con 12 cabezas Q / 2 cabezas KV) |
| Parámetros totales | 1.543.714.304 (1,54B); 1,31B sin contar embeddings |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens en este repositorio; generación de hasta 8.192 tokens |
| Tipos de cuantización | No disponible en la información proporcionada (el repositorio oficial publica safetensors; el ecosistema ofrece conversiones GGUF/AWQ/GPTQ no detalladas aquí) |
| Idiomas soportados | La etiqueta del repositorio indica `en`; el model card de la familia declara soporte para más de 29 idiomas (chino, inglés, francés, español, portugués, alemán, italiano, ruso, japonés, coreano, vietnamita, tailandés, árabe, entre otros) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `transformers`) |

Otros datos técnicos: 28 capas, 12 cabezas de atención para Q y 2 para KV, tamaño de repositorio de 10,2 GB, pipeline `text-generation`, compatible con `text-generation-inference` y endpoints compatibles.

## Arquitectura y entrenamiento

El modelo es un transformer causal decoder-only de 28 capas. Incorpora RoPE (rotary position embeddings) para la codificación posicional, activación SwiGLU en las capas feed-forward, normalización RMSNorm y sesgo en las proyecciones de query, key y value. Emplea atención de consultas agrupadas (GQA) con 12 cabezas para Q y 2 para KV, una técnica que reduce el tamaño de la caché KV en inferencia a costa de compartir las proyecciones de clave y valor entre grupos de cabezas. Los embeddings de entrada y la cabeza de salida están atados, lo que reduce el recuento de parámetros.

El proceso de entrenamiento consta de dos etapas: preentrenamiento y post-entrenamiento. Según la documentación de la familia, el preentrenamiento se complementó con modelos expertos especializados en código y matemáticas, lo que explica la mejora declarada en esas capacidades respecto a Qwen2. El post-entrenamiento se orientó a seguimiento de instrucciones, generación de textos largos, comprensión de datos estructurados y generación de JSON, con mayor resiliencia a la diversidad de system prompts. No se especifican en la información proporcionada el número exacto de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas concretas de RLHF o DPO.

## Capacidades

- Generación de texto y conversación multi-turno con plantilla de chat (`apply_chat_template`), incluyendo rol de sistema para condicionar el comportamiento.
- Razonamiento y conocimiento factual, con mejoras declaradas en código y matemáticas respecto a Qwen2 gracias a los modelos expertos usados durante el entrenamiento.
- Generación de textos largos: hasta 8.192 tokens de salida, útil para documentos y resúmenes extensos.
- Comprensión de datos estructurados (tablas) y generación de salidas estructuradas, especialmente JSON.
- Contexto largo de 32.768 tokens para entrada, adecuado para conversaciones con historial amplio o documentos medianos.
- Capacidades multilingües declaradas para más de 29 idiomas en el model card de la familia, aunque la etiqueta de idioma del repositorio concreto solo indica inglés.
- Robustez frente a distintos system prompts, lo que facilita implementaciones de role-play y condicionamiento de asistentes.
- Tool calling / function calling: no especificado en el model card de esta variante concreta. La documentación de la familia describe plantillas para function calling, pero no se confirma aquí para el modelo de 1,5B.
- Modo de razonamiento explícito (thinking mode), visión y audio: no disponibles en esta variante.

## Casos de uso

- Chatbot de atención al cliente: el modelo puede mantener conversaciones multi-turno con un historial de hasta 32.768 tokens, lo que permite conservar el contexto de una incidencia completa sin truncar. Su tamaño reducido hace viable desplegar varias instancias en una sola GPU para atender peticiones concurrentes.
- Clasificación y extracción de información: con salidas en JSON y buena comprensión de datos estructurados, es adecuado para tareas de extracción de entidades, categorización de tickets o normalización de campos en pipelines de datos.
- Generación de código asistida en entornos con recursos limitados: sirve como autocompletado o generador de fragmentos en plugins de IDE locales, donde no se dispone de GPU de gama alta ni se quiere enviar código a servicios externos.
- Preprocesado y enriquecimiento de datos en pipelines de NLP: resumen de documentos, reescritura de textos, generación de preguntas y respuestas sintéticas o etiquetado automático para alimentar otros modelos mayores.
- Asistente embebido en aplicaciones de escritorio o móviles: al ocupar del orden de 3 GB en FP16 (y menos de 1 GB en cuantización de 4 bits), puede ejecutarse en portátiles con GPU modesta o incluso en CPU con cuantización, habilitando asistentes sin conexión.
- Moderación y filtrado de contenido en tiempo real: su baja latencia y su capacidad de seguir instrucciones permiten usarlo como primera capa de cribado antes de recurrir a modelos mayores, reduciendo coste por petición.
- Generación de documentación y resúmenes técnicos: con 8.192 tokens de salida, puede producir informes estructurados a partir de notas o registros de incidencias.
- Prototipado rápido de aplicaciones de IA generativa: al ser Apache 2.0 y compatible con `transformers`, `text-generation-inference` y endpoints gestionados, permite validar productos antes de escalar a modelos de mayor tamaño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El model card remite al blog oficial de Qwen2.5 para los resultados detallados de evaluación y a la documentación de Qwen para datos de consumo de memoria y throughput, pero no se incluyen cifras concretas (MMLU, HumanEval, GSM8K u otros) en el material proporcionado.

## Requisitos de hardware

- Pesos en FP16/BF16: aproximadamente 3,1 GB (1,54B parámetros × 2 bytes), sin contar overhead del runtime.
- Pesos en INT8: aproximadamente 1,6 GB.
- Pesos en cuantización de 4 bits: aproximadamente 0,9-1,0 GB.
- Caché KV: con 28 capas, 2 cabezas KV y dimensión de cabeza de 128, la caché ocupa del orden de 28 KB por token en FP16. A la máxima longitud de contexto (32.768 tokens) supone cerca de 900 MB adicionales. Estimación derivada de los datos arquitectónicos del model card.
- VRAM estimada para inferencia: alrededor de 4 GB en FP16 con contexto moderado, 2-3 GB en INT8 y menos de 2 GB en 4 bits, sumando pesos, caché KV y overhead del framework.
- GPU recomendadas: cabe con holgura en GPU de consumo como RTX 3060 12 GB, RTX 4060 Ti, RTX 4070, RTX 4090 y equivalentes; también en GPU de datacenter (A100, H100, L40S) donde se puede servir con lotes grandes. Es viable en GPU integradas y en CPU con cuantización.
- Despliegue: `transformers` (requiere versión 4.37.0 o superior; con versiones anteriores aparece `KeyError: 'qwen2'`), vLLM, TGI (text-generation-inference), llama.cpp, Ollama, LM Studio y endpoints gestionados compatibles.
- Latencia y throughput: no disponibles en la información proporcionada. La documentación de Qwen publica métricas de velocidad por GPU y cuantización, pero no se incluyen cifras en este material.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen2.5-1.5B-Instruct | 1,54B (1,31B sin embeddings) | 32.768 tokens | Apache 2.0 | HuggingFace, `transformers` |
| Qwen2.5-0.5B-Instruct | 0,49B (aprox.) | 32.768 tokens | Apache 2.0 | HuggingFace, `transformers` |
| Qwen2.5-3B-Instruct | 3,09B (aprox.) | 32.768 tokens | Qwen Research / Apache 2.0 según variante | HuggingFace, `transformers` |
| Llama-3.2-1B-Instruct | 1,24B (aprox.) | 128.000 tokens | Llama 3.2 Community License | HuggingFace, `transformers` |
| Gemma-2-2B-it | 2,6B (aprox.) | 8.192 tokens | Gemma Terms of Use | HuggingFace, `transformers` |

Los datos de parámetros, contexto y licencia de los modelos comparados proceden de sus respectivas model cards públicas. No se dispone de resultados de benchmarks comparativos en la información proporcionada, por lo que no se incluye comparación de rendimiento. Cabe destacar que la licencia Apache 2.0 de Qwen2.5-1.5B-Instruct es más permisiva para uso comercial que las licencias comunitarias de Llama 3.2 y Gemma 2, que imponen condiciones adicionales.

## Limitaciones y advertencias

- Riesgo de alucinación: al ser un modelo de 1,54B parámetros, su conocimiento factual es limitado y la probabilidad de generar afirmaciones incorrectas con apariencia de veracidad es mayor que en modelos de mayor tamaño.
- Sesgos: no se documentan en la información proporcionada análisis específicos de sesgo para esta variante. Como todo modelo entrenado con datos web a gran escala, es previsible que reproduzca sesgos presentes en esos datos.
- Limitaciones de razonamiento: la capacidad de razonamiento complejo, matemáticas avanzadas y tareas de múltiples pasos está acotada por el tamaño del modelo; en problemas que requieren cadenas de inferencia largas puede degradarse notablemente.
- Idiomas: aunque el model card de la familia declara soporte para más de 29 idiomas, la etiqueta del repositorio concreto solo indica inglés. El rendimiento en español y otros idiomas distintos del inglés y el chino no está cuantificado en la información proporcionada y probablemente sea inferior.
- Contexto: el repositorio especifica 32.768 tokens, aunque el anuncio de la familia menciona soporte de contexto largo de hasta 128K tokens. Esa cifra de 128K corresponde a otras variantes o a configuraciones con extensión de contexto, no a esta.
- Longitud de salida: limitada a 8.192 tokens por generación.
- Tool calling: no confirmado para esta variante en la información disponible, por lo que no debería asumirse su funcionamiento en producción sin validación previa.
- Licencia: Apache 2.0 permite uso comercial, modificación y redistribución sin restricciones adicionales, pero se recomienda revisar el fichero LICENSE del repositorio y las condiciones de los datos de entrenamiento para casos de uso regulados.
- Producción: al tratarse de un modelo pequeño, conviene acompañarlo de validación de salidas, filtros de seguridad y, si la tarea lo exige, verificación con un modelo mayor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B
- Licencia: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct/blob/main/LICENSE
- Blog oficial de Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
- Repositorio GitHub de Qwen2.5: https://github.com/QwenLM/Qwen2.5
- Documentación de Qwen: https://qwen.readthedocs.io/en/latest/
- Benchmarks de velocidad y memoria: https://qwen.readthedocs.io/en/latest/benchmark/speed_benchmark.html
- Informe técnico de Qwen2 (arXiv): https://arxiv.org/abs/2407.10671
- Plataforma Qwen Studio: https://chat.qwen.ai/
- Sitio oficial de Qwen: https://qwen.ai/home
