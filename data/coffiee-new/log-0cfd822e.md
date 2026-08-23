# Coffiee-new/log-0cfd822e

## Resumen

El modelo `Coffiee-new/log-0cfd822e` es un modelo multimodal de tipo image-text-to-text desarrollado por el usuario Coffiee-new en la plataforma HuggingFace. Su tag `qwen3_5_moe` indica que se basa en la arquitectura Qwen3.5 con diseño de mezcla de expertos (MoE), lo que lo sitúa en la línea de los modelos Qwen de Alibaba adaptados por la comunidad. Con 35.107.181.936 parámetros totales, se posiciona en la gama de modelos de tamaño medio-grande optimizados para razonamiento multimodal y conversación.

El modelo está pensado para tareas que combinan comprensión de imágenes y texto, con capacidad conversacional, y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones significativas. Su acceso es restringido (gated), por lo que requiere aceptar las condiciones del autor antes de su descarga. El repositorio ocupa 70,2 GB en formato safetensors y está preparado para la librería transformers de HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) basada en Qwen3.5 (tag `qwen3_5_moe`) |
| Parametros totales | 35.107.181.936 (35,1 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura de mezcla de expertos (MoE) derivada de la familia Qwen3.5, como indica la etiqueta `qwen3_5_moe` asociada al repositorio. Esto implica que, aunque cuenta con 35,1 B de parámetros totales, solo un subconjunto de ellos se activa por token durante la inferencia, lo que permite un equilibrio entre capacidad y eficiencia computacional. Se trata de un modelo multimodal de entrada imagen-texto y salida de texto (pipeline `image-text-to-text`), lo que sugiere la integración de un codificador visual con el transformador de lenguaje.

No se dispone de información pública sobre el número de tokens de entrenamiento, la composición del dataset utilizado, ni sobre técnicas de alineación como RLHF o DPO. Tampoco se han publicado detalles sobre innovaciones técnicas específicas del modelo (por ejemplo, atención lineal o decodificación especulativa). El repositorio fue creado el 23 de agosto de 2026 y no cuenta con descargas ni likes, lo que indica que es un lanzamiento reciente o en fase de evaluación.

## Capacidades

- Procesamiento multimodal: acepta entradas de imagen y texto simultáneamente, generando respuestas de texto (pipeline `image-text-to-text`).
- Conversación: el tag `conversational` indica soporte para interacciones multi-turno de diálogo.
- Razonamiento con MoE: al ser un modelo de mezcla de expertos, ofrece un equilibrio entre capacidad de razonamiento y eficiencia de inferencia.
- Compatible con transformers: se integra directamente con la biblioteca transformers de Hugging Face para su carga y uso.
- Soporte de endpoints: la etiqueta `endpoints_compatible` sugiere compatibilidad con la infraestructura de inferencia de Hugging Face.
- Capacidades adicionales (tool calling, agentes, modo pensamiento, audio): no disponibles.

## Casos de uso

- Descripción de imágenes y accesibilidad: el modelo puede generar descripciones textuales de imágenes, útil para aplicaciones de accesibilidad visual o generación de metadatos en sistemas de gestión de contenido.
- Asistencia visual conversacional: integrado en un chatbot, puede responder preguntas sobre fotografías, diagramas o capturas de pantalla en conversaciones multi-turno.
- Extracción de información de documentos escaneados: dado su carácter multimodal, puede procesar documentos con texto e imágenes para extraer datos relevantes, siempre que se valide su precisión en ese dominio.
- Generación de contenido asistido: combinando imágenes y texto como entrada, puede redactar descripciones de producto, resúmenes de informes o publicaciones en redes sociales.
- Investigación y experimentación en MoE multimodal: al ser un modelo de 35 B parámetros con arquitectura MoE, puede servir como banco de pruebas para técnicas de eficiencia, destilación o adaptación de instrucciones.
- Desarrollo de prototipos con licencia permisiva: gracias a su licencia Apache-2.0, es viable para prototipos y productos comerciales sin coste de licencia, aunque se debe verificar la procedencia de los datos de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de MMLU, HumanEval, GSM8K ni comparativas con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Con 35,1 B de parámetros en precisión FP16, el tamaño del modelo sería de aproximadamente 70 GB, lo que excede la VRAM de cualquier GPU consumer actual. Con cuantización a 4 bits (si estuviera disponible), se estimaría en torno a 18-20 GB, aunque no se ha confirmado ninguna cuantización publicada.
- GPU recomendadas: para inferencia en precisión completa o FP16, se requieren GPUs de datacenter como A100 (80 GB) o H100 (80 GB). Con cuantización, podría ejecutarse en RTX 4090 (24 GB) o RTX 6000 Ada, siempre que se publiquen pesos cuantizados.
- Compatibilidad con GPU consumer: no confirmada, dependería de la disponibilidad de cuantizaciones GGUF o de 4 bits.
- Opciones de despliegue: no se han publicado artefactos para vLLM, llama.cpp, Ollama o TGI. El modelo se distribuye en formato safetensors para transformers, por lo que se podría servir con la infraestructura de Hug Face Inference Endpoints o con librerías como vLLM si se adapta.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Coffiee-new/log-0cfd822e | 35,1 B (MoE) | no disponible | Qwen3.5 MoE multimodal | Apache-2.0 | Gated, 0 descargas |
| Qwen2.5-VL-32B | 32,5 B (dense) | 32K | Transformer multimodal | Qwen License | Abierto |
| Qwen2.5-VL-7B | 7,6 B (dense) | 128K | Transformer multimodal | Qwen License | Abierto |

La comparativa con Qwen2.5-VL es indicativa, ya que el modelo de Coffiee-new se basa presumiblemente en la arquitectura Qwen3.5 MoE, pero no se han publicado datos de rendimiento que permitan una comparación objetiva. La principal diferencia es la licencia Apache-2.0 frente a la licencia Qwen, más restrictiva en algunos usos.

## Limitaciones y advertencias

- Acceso restringido (gated): requiere aceptar las condiciones del autor en HuggingFace antes de poder descargar el modelo.
- Sin datos de entrenamiento públicos: no se ha publicado información sobre el dataset, la fase de alineación ni las técnicas de entrenamiento, lo que dificulta evaluar riesgos de sesgo o calidad.
- Riesgo de alucinación: como todo modelo generativo multimodal, puede producir respuestas inexactas, especialmente al describir detalles finos de imágenes o en razonamientos complejos.
- Sin benchmarks publicados: no es posible comparar su rendimiento con otros modelos de forma objetiva.
- Comunidad limitada: con 0 descargas y 0 likes, no hay evidencia de uso ni retroalimentación de la comunidad que valide el comportamiento en entornos reales.
- Limitaciones de contexto y idiomas: no se han publicado datos sobre la longitud de contexto máxima ni los idiomas soportados, lo que limita su uso en aplicaciones multilingües.
- Tamaño del modelo: 70,2 GB en safetensors, lo que requiere infraestructura significativa para inferencia local.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Coffiee-new/log-0cfd822e
- Perfil del autor en HuggingFace: https://huggingface.co/Coffiee-new/models
- Perfil de usuario Coffie: https://huggingface.co/coffiee
