# iamrodrigocoelho/qwen3.5-2b-refauna-GGUF

## Resumen

Qwen3.5-2B · Refauna es un ajuste fino por LoRA del modelo base Qwen/Qwen3.5-2B, desarrollado por el usuario iamrodrigocoelho y publicado en formato GGUF. Está especializado en un dominio muy concreto: defaunación, refaunación, reintroducción de fauna, dispersión de semillas e interacciones ecológicas en la Mata Atlántica brasileña, a partir de la producción científica del proyecto Refauna (refauna.org.br). El modelo se entrenó con el mismo corpus y protocolo que una variante previa sobre Gemma 4 E2B, con el objetivo explícito de comparar modelos base en el contexto de una charla técnica sobre fine-tuning y RAG con datos de conservación.

El modelo tiene 1.942.653.248 parámetros (aproximadamente 2 mil millones) y se distribuye exclusivamente como pesos GGUF cuantizados, lo que lo hace desplegable en hardware de consumo. Su idioma principal es el portugués de Brasil, con soporte declarado de inglés. La licencia es Apache 2.0, heredada del modelo base.

Su relevancia radica en dos factores: por un lado, demuestra un flujo completo de especialización de un modelo pequeño con datos científicos reales y evaluación con juez LLM; por otro, su diseño está pensado para usarse conjuntamente con RAG, con instrucciones explícitas de citación y abstención cuando el contexto no contiene la respuesta. No obstante, el repositorio no registra descargas ni interacciones en el momento de la consulta, por lo que se trata de una publicación de carácter demostrativo y educativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Qwen3.5-2B); ajuste fino mediante LoRA |
| Parametros totales | 1.942.653.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.5-2B; no especificada en la informacion proporcionada) |
| Tipos de cuantizacion | GGUF cuantizado; se menciona explicitamente Q4_K_M en el ejemplo de Ollama; no se detalla el conjunto completo de variantes |
| Idiomas soportados | Portugues (pt, principalmente pt-BR) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (libreria gguf) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-2B, un transformer decoder-only de aproximadamente 2 mil millones de parámetros, cargado a través de la implementación de unsloth. Sobre esa base se aplicó un ajuste fino con LoRA en precisión de 16 bits (bf16), con rango r=16, alpha=16, dos épocas, tasa de aprendizaje 0,0002 y adaptadores aplicados tanto a las capas de atención como a las MLP. El entrenamiento utilizó la plantilla ChatML con el razonamiento desactivado de forma explícita (enable_thinking=False), de modo que el modelo responde directamente sin cadena de pensamiento.

El corpus de entrenamiento consiste en 942 ejemplos sintéticos en portugués de Brasil generados con estilo RAFT: ejemplos con contexto y citas, ejemplos de abstención y ejemplos sin contexto, con partición train/test por documento para evitar filtración. El entrenamiento se ejecutó en una NVIDIA L4 durante 14,9 minutos con un pico de 7,94 GB de VRAM. La innovación técnica destacable no está en la arquitectura sino en el protocolo de datos y evaluación: el modelo se entrena para citar fragmentos del contexto en formato [n] y para abstenerse explícitamente cuando la información no aparece en los documentos proporcionados, lo que se refleja en las métricas de fidelidad y abstención reportadas.

## Capacidades

- Generación de texto especializada en portugués de Brasil sobre defaunación, refaunación, reintroducción de fauna, dispersión de semillas, interacciones ecológicas y conservación de la Mata Atlántica.
- Respuesta con contexto (RAG) usando exclusivamente la información del contexto suministrado y citando los fragmentos empleados en formato [n].
- Abstención controlada: cuando el contexto no contiene la respuesta, el modelo declara explícitamente que no encontró la información en los documentos de Refauna.
- Generación sin razonamiento intermedio (thinking desactivado), lo que reduce latencia y tokens de salida.
- Comprensión y generación en inglés, además del portugués.
- Formato conversacional compatible con endpoints de Hugging Face y con Ollama.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión ni audio en la información disponible.

## Casos de uso

- Asistente de consulta científica para el equipo de Refauna: el modelo responde preguntas sobre reintroducción de especies citando los fragmentos del corpus, lo que permite a investigadores localizar rápidamente evidencia en la literatura del proyecto sin salir del flujo conversacional.
- Chatbot divulgativo en portugués de Brasil: desplegado con Ollama y Q4_K_M, puede atender consultas del público general sobre conservación de la Mata Atlántica con un tono didáctico, siempre que se le suministre contexto recuperado.
- Componente de generación en un pipeline RAG: dado que el modelo cita en formato [n] y se abstiene cuando falta información, encaja como capa final de un sistema de recuperación híbrida sobre documentos científicos, reduciendo el riesgo de respuestas inventadas.
- Evaluación comparativa de modelos base: al compartir datos y protocolo con la variante Gemma 4 E2B · Refauna, sirve como referencia para estudiar cómo distintos modelos pequeños se comportan ante el mismo ajuste fino en un dominio científico.
- Docencia y talleres técnicos: su tamaño y su formato GGUF permiten ejecutarlo en portátiles con GPU modesta durante demostraciones de fine-tuning y RAG, como en la charla TDC Stage @ Rec'n'Play 2026.
- Prototipado rápido en entornos con recursos limitados: con 7,94 GB de pico de VRAM durante el entrenamiento y cuantización Q4_K_M para inferencia, es viable iterar sobre preguntas y prompts en una única GPU de consumo sin infraestructura dedicada.
- Filtro de abstención en atención a consultas externas: puede usarse para detectar cuándo una pregunta queda fuera del alcance del corpus de Refauna y derivarla a un humano o a otra fuente.

## Benchmarks y rendimiento

Evaluación con juez LLM, notas de 1 a 5, según la model card del autor:

| Configuración | Corrección | Fidelidad | Citación correcta | Abstención correcta | PT-BR |
|---|---|---|---|---|---|
| A: base | 1,72 | no disponible | no disponible | no disponible | 1,00 |
| B: base + RAG | 2,52 | 3,17 | 0,33 | 0,12 | 1,00 |
| C: fine-tuned | 2,20 | no disponible | no disponible | no disponible | 1,00 |
| D: fine-tuned + RAG | 2,32 | 4,41 | 0,45 | 1,00 | 1,00 |

Recuperación híbrida en el conjunto de test (n=74): Recall@4 = 0,42 y MRR@20 = 0,30.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un modelo de ~2 mil millones de parámetros en Q4_K_M se sitúa habitualmente en el rango de 2 a 3 GB, aunque esta cifra no está confirmada en la información proporcionada.
- Entrenamiento documentado: NVIDIA L4 con pico de 7,94 GB de VRAM y 14,9 minutos para el ajuste LoRA.
- GPU recomendadas: no especificadas por el autor; por tamaño, el modelo es apto para GPU de consumo tipo RTX 3060, RTX 4060 o superiores, así como para A100/H100 si se busca mayor throughput.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con 4 GB o más de VRAM en cuantizaciones de 4 bits, aunque el dato exacto no está publicado.
- Opciones de despliegue: Ollama (comando documentado con la etiqueta Q4_K_M), llama.cpp y cualquier runtime compatible con GGUF; la model card menciona compatibilidad con endpoints.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.5-2B · Refauna (este) | ~1,94 B | no disponible | Conservación de la Mata Atlántica, RAG con citas | Apache 2.0 | GGUF |
| Gemma 4 E2B · Refauna | no disponible | no disponible | Mismo corpus y protocolo que este modelo | no disponible | no disponible |
| Qwen/Qwen3.5-2B (base) | ~2 B | no disponible | Generalista | Apache 2.0 | safetensors y otros |

La comparación directa con la variante Gemma 4 E2B · Refauna es la más relevante, ya que el autor declara explícitamente que emplea los mismos datos y protocolo para comparar modelos base. No se dispone de datos de benchmarks de esa variante en la información proporcionada. Frente al modelo base, el ajuste mejora la fidelidad con RAG (4,41 frente a 3,17) y la abstención correcta (1,00 frente a 0,12), aunque la corrección global con RAG es ligeramente inferior (2,32 frente a 2,52).

## Limitaciones y advertencias

- Uso educativo y de divulgación científica: el propio autor indica que no sustituye a la literatura original.
- Sin RAG, el modelo puede equivocarse en números, fechas y nombres de especies; la model card lo advierte de forma explícita.
- El rendimiento en corrección es moderado incluso en la mejor configuración (2,32 sobre 5), y la citación correcta con RAG se queda en 0,45.
- La recuperación híbrida medida es limitada (Recall@4 = 0,42; MRR@20 = 0,30), lo que condiciona la calidad del pipeline RAG completo.
- El dominio es extremadamente estrecho; fuera de la temática de conservación de la Mata Atlántica el modelo no aporta ventajas sobre el base.
- El idioma principal es el portugués de Brasil; el soporte de inglés está declarado pero no se documenta su calidad.
- Licencia Apache 2.0: permite uso comercial, pero debe conservarse la atribución correspondiente y verificarse las licencias de las fuentes científicas citadas.
- El repositorio no registra descargas ni interacciones, por lo que no existe validación externa de su comportamiento en producción.
- No se documentan sesgos específicos ni evaluaciones de seguridad en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iamrodrigocoelho/qwen3.5-2b-refauna-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Variante comparable Gemma 4 E2B · Refauna: https://huggingface.co/iamrodrigocoelho/gemma-4-e2b-refauna
- Proyecto Refauna: https://refauna.org.br
- Implementación de unsloth para el modelo base: https://huggingface.co/unsloth/Qwen3.5-2B
- DOI de referencia del corpus (selección): https://doi.org/10.1590/S1984-46702013000100015
- DOI de referencia del corpus (selección): https://doi.org/10.1177/194008291400700415
- DOI de referencia del corpus (selección): https://doi.org/10.1590/bjb.2014.0087
- DOI de referencia del corpus (selección): https://doi.org/10.1590/0102-33062015abb0008
- DOI de referencia del corpus (selección): https://doi.org/10.1002/ece3.2746
- DOI de referencia del corpus (selección): https://doi.org/10.1016/j.pecon.2017.09.004
- DOI de referencia del corpus (selección): https://doi.org/10.1017/S0030605316001149
- DOI de referencia del corpus (selección): https://doi.org/10.3389/fcosc.2024.1401749
- DOI de referencia del corpus (selección): https://doi.org/10.1017/S0030605325102494
