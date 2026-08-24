# linguai/Jamba2-3B-Turkish-SFT-v1

## Resumen

El modelo `linguai/Jamba2-3B-Turkish-SFT-v1` es un ajuste fino por instrucciones (SFT) del modelo base `serda-dev/Jamba2-3B-Turkish`, que a su vez es una continuación de preentrenamiento (CPT) en turco del modelo Jamba2-3B de AI21 Labs. Desarrollado por LinguAI, este artefacto fusiona un LoRA en BF16 sobre el modelo base para mejorar el seguimiento de instrucciones y la capacidad conversacional en turco e inglés. Con 3.039.823.232 parámetros (aproximadamente 3,04 mil millones), hereda la arquitectura híbrida SSM+Attention de Jamba2, que combina capas Mamba con atención Transformer, y una ventana de contexto de 256K tokens. Su relevancia radica en ofrecer un modelo compacto y eficiente para tareas de generación de texto en turco, con un contexto largo y un coste de inferencia reducido frente a modelos densos de tamaño similar.

El entrenamiento SFT se realizó con 35.800 ejemplos de instrucciones en turco revisados y generados, durante 5.000 pasos de optimización y un total de 40.960.000 tokens. La evaluación diagnóstica interna reporta 62/84 en corrección semántica y 58/84 en cumplimiento de contrato, aunque el autor advierte que estos resultados son preliminares y no de liberación. El modelo se distribuye en formato safetensors y se puede cargar directamente con la biblioteca `transformers` de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida SSM+Attention (Mamba + Transformer) - Jamba2 |
| Parametros totales | 3.039.823.232 (3,04B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 256K (heredado del modelo base) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Turco (tr), Inglés (en) |
| Licencia | No disponible (depende del modelo base) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Jamba2 de AI21, que combina capas de espacio de estados (SSM, concretamente Mamba) con capas de atención Transformer en un diseño híbrido. Esta configuración permite manejar secuencias largas (hasta 256K tokens) con una complejidad computacional subcuadrática, a diferencia de los Transformers puros que tienen complejidad O(n²). El modelo base `serda-dev/Jamba2-3B-Turkish` fue preentrenado de forma continua (CPT) con 18 billones de tokens en turco, y sobre él se aplicó un ajuste fino por instrucciones mediante LoRA en BF16, que posteriormente se fusionó en los pesos del modelo. El entrenamiento SFT utilizó 35.800 ejemplos de instrucciones en turco, con 5.000 pasos de optimización y un total de 40.960.000 tokens. No se menciona el uso de RLHF ni DPO; el método es exclusivamente supervisado.

## Capacidades

- Generación de texto en turco e inglés, con especial énfasis en el seguimiento de instrucciones y respuestas conversacionales.
- Soporte de instrucciones de múltiples turnos, adecuado para chatbots y asistentes virtuales.
- Capacidad multilingüe limitada a turco e inglés, con mayor dominio en turco debido al entrenamiento específico.
- Manejo de contextos largos (hasta 256K tokens), útil para documentos extensos o conversaciones prolongadas.
- No se documenta soporte para tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio.

## Casos de uso

- Asistentes virtuales en turco: el modelo puede gestionar conversaciones multi-turno con contexto largo, gracias a su ventana de 256K tokens, lo que permite mantener el hilo de diálogos extensos sin perder información relevante.
- Generación de contenido en turco: redacción de artículos, resúmenes, correos electrónicos o publicaciones en redes sociales, aprovechando su capacidad de seguir instrucciones detalladas.
- Traducción automática turco-inglés e inglés-turco: aunque no está especializado en traducción, su entrenamiento bilingüe permite producir traducciones fluidas en contextos conversacionales.
- Análisis de documentos largos: al soportar 256K tokens, puede procesar informes, contratos o actas completas y extraer información o responder preguntas sobre ellos.
- Chatbots de atención al cliente: integrable en sistemas de soporte para responder consultas frecuentes en turco, con un tamaño reducido que facilita su despliegue en infraestructuras modestas.
- Prototipado rápido de aplicaciones de NLP: al ser un modelo pequeño y de código abierto, es adecuado para experimentación y desarrollo de pruebas de concepto en entornos con recursos limitados.

## Benchmarks y rendimiento

La model card del autor incluye una evaluación diagnóstica sobre un conjunto de 84 casos (denominado `draft_quarantine`), con los siguientes resultados:

| Metrica | Resultado |
|---|---|
| Corrección semántica/tarea | 62/84 |
| Cumplimiento de contrato | 58/84 |

Estos resultados son preliminares y no se consideran de liberación. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 6 GB (3,04B parámetros × 2 bytes por parámetro).
- GPU recomendadas: tarjetas con al menos 8 GB de VRAM, como NVIDIA RTX 3060, RTX 4060, RTX 4070, o GPUs de datacenter como A10G o L4.
- Cabe en GPUs de consumo medio; no requiere hardware especializado.
- Opciones de despliegue: se puede cargar con `transformers` (PyTorch) usando `device_map="auto"`. No se mencionan formatos GGUF ni soporte explícito para vLLM o llama.cpp, aunque al ser un modelo Jamba2, es probable que vLLM lo soporte (no confirmado en la documentación).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| linguai/Jamba2-3B-Turkish-SFT-v1 | 3,04B | 256K | Híbrida SSM+Attention | No especificada | Hugging Face |
| serda-dev/Jamba2-3B-Turkish (base) | 3,04B | 256K | Híbrida SSM+Attention | Apache 2.0 (según fuente) | Hugging Face |
| Qwen2.5 3B | 3B | 128K | Transformer (GQA+SwiGLU) | Apache 2.0 | Hugging Face |

La comparativa se basa en características técnicas; no hay datos de rendimiento comparativos disponibles.

## Limitaciones y advertencias

- La licencia no está declarada explícitamente; se debe verificar la del modelo base (`serda-dev/Jamba2-3B-Turkish`) y las condiciones de uso de los datos de entrenamiento antes de un despliegue comercial.
- La evaluación diagnóstica es preliminar y no garantiza el rendimiento en producción; el autor indica que aún faltan pasos de validación (Gold-freeze, solapamiento/decontaminación y revisión humana).
- Al ser un modelo de solo 3B parámetros, puede presentar alucinaciones o errores en tareas complejas de razonamiento, especialmente fuera de los dominios de entrenamiento.
- El entrenamiento SFT se centró en turco; el rendimiento en inglés puede ser inferior al de modelos especializados en ese idioma.
- No se documentan sesgos específicos, pero al ser un modelo entrenado con datos web, puede reflejar sesgos presentes en esos datos.
- El tamaño del repositorio (6,1 GB) corresponde a pesos en BF16; no se ofrecen versiones cuantizadas, lo que limita su uso en dispositivos con poca memoria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/linguai/Jamba2-3B-Turkish-SFT-v1
- Modelo base: https://huggingface.co/serda-dev/Jamba2-3B-Turkish
- Modelo original Jamba2-3B de AI21: https://huggingface.co/ai21labs/AI21-Jamba2-3B
- Sitio web de LinguAI: https://linguai.tech/master/
- Documentación de Jamba de AI21: https://docs.ai21.com/docs/jamba-foundation-models
