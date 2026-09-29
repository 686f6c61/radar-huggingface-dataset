# fbetteo/working

## Resumen
El modelo fbetteo/working es un ajuste fino (fine-tuning) del modelo google/gemma-3-270m-it, desarrollado por el usuario fbetteo. Se trata de un modelo de generación de texto de 268.098.176 parámetros (aproximadamente 268 millones), construido sobre la arquitectura Gemma 3 de texto (transformer decoder-only). El ajuste se ha realizado mediante aprendizaje supervisado (SFT) utilizando la librería TRL de Hugging Face, según se indica en su model card.

La relevancia de este modelo radica en su reducido tamaño, que lo hace adecuado para entornos con recursos limitados, como dispositivos de borde, aplicaciones móviles o prototipado rápido. Al derivar de un modelo instructivo (gemma-3-270m-it), hereda capacidades conversacionales básicas, aunque no se dispone de información detallada sobre el conjunto de datos de entrenamiento, el número de tokens utilizados ni la composición del dataset.

No se ha publicado información sobre la longitud de contexto, los idiomas soportados ni la licencia de distribución, lo que limita su evaluación para uso comercial. A pesar de ello, su tamaño compacto y el formato de pesos safetensors facilitan su integración en pipelines de transformers y su despliegue en hardware modesto.

## Especificaciones técnicas
| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3 de texto) |
| Parámetros totales | 268.098.176 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (se puede cuantizar a FP16, INT8, INT4 de forma estándar) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo se basa en la arquitectura Gemma 3 de texto, un transformer decoder-only desarrollado por Google. La variante 270m-it es la más pequeña de la familia Gemma 3 y está optimizada para instrucciones. El ajuste fino se ha llevado a cabo mediante SFT (Supervised Fine-Tuning) con la librería TRL 1.14.1, sobre Transformers 5.0.0, PyTorch 2.10.0+cu128, Datasets 5.0.0 y Tokenizers 0.22.2. No se especifica el conjunto de datos utilizado, el número de tokens de entrenamiento ni si se aplicaron técnicas como RLHF o DPO.

No se documentan innovaciones técnicas adicionales, como decodificación especulativa o atención lineal. La model card únicamente indica que fue generado con `generated_from_trainer` y que se trata de un ajuste fino del modelo base. Esta falta de detalles impide conocer el dominio de especialización del ajuste.

## Capacidades
- Generación de texto: el modelo puede producir texto coherente a partir de una entrada, según la pipeline `text-generation`.
- Conversación: la etiqueta `conversational` sugiere que está preparado para mantener diálogos multi-turno, aunque no se detalla su calidad.
- No se dispone de información sobre soporte de tool calling, function calling o agentes.
- No se especifican capacidades multilingües; los idiomas soportados figuran como no disponibles.
- No se documentan capacidades especiales como modo thinking, visión o audio.
- Dado su tamaño (268M), se espera un rendimiento limitado en tareas complejas de razonamiento, matemáticas o código.

## Casos de uso
- Prototipado rápido de aplicaciones de generación de texto: gracias a su pequeño tamaño (268M de parámetros), el modelo se puede cargar y ejecutar en segundos en una GPU de gama baja o incluso en CPU, lo que acelera la experimentación inicial.
- Chatbots ligeros en dispositivos con recursos limitados: su huella de memoria (menos de 1 GB en FP16) permite desplegarlo en entornos de borde, como Raspberry Pi o móviles, para asistentes conversacionales básicos.
- Generación de respuestas automáticas en atención al cliente: puede gestionar consultas simples y repetitivas, aunque se requiere evaluar su precisión antes de usarlo en producción.
- Filtrado y clasificación de texto: adaptando la entrada, puede utilizarse para tareas de moderación de contenido o etiquetado, aunque no es su función principal.
- Generación de resúmenes cortos o descripciones: adecuado para tareas de generación de texto breve donde la latencia sea crítica.
- Educación y experimentación: sirve como modelo base para fine-tuning adicional en dominios específicos, al ser ligero y fácil de entrenar con recursos modestos.
- Despliegue en sistemas embebidos: su reducido tamaño permite integrarlo en aplicaciones IoT que requieran generación de texto local sin conexión a la nube.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: en FP16, aproximadamente 0,54 GB (268M parámetros × 2 bytes); en INT8, unos 0,27 GB; en INT4, unos 0,14 GB. Estas cifras son estimaciones teóricas basadas en el número de parámetros.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente. Ejemplos: NVIDIA GTX 1050 Ti, RTX 3050, RTX 4090, A100, H100. También puede ejecutarse en CPU con un rendimiento aceptable.
- Cabe en consumer GPU: sí, en cualquier GPU de consumo actual e incluso en iGPU modernas. También es viable en dispositivos como Raspberry Pi 4/5.
- Opciones de despliegue: transformers (librería nativa), text-generation-inference (TGI, según la etiqueta `text-generation-inference`), y potencialmente vLLM y llama.cpp/Ollama mediante conversión a GGUF. No se confirma compatibilidad directa con estas últimas.
- Latencia y throughput estimados: no disponibles. Por el tamaño, se espera una latencia muy baja en hardware moderno, con throughput alto en GPUs dedicadas.

## Comparativa con modelos similares
| Modelo | Parámetros | Longitud de contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| fbetteo/working | 268.098.176 | No disponible | No disponible | Hugging Face |
| google/gemma-3-270m-it (base) | 268.098.176 | No disponible | No disponible | Hugging Face |
| Otras alternativas | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa.

## Limitaciones y advertencias
- Sesgos conocidos: no se dispone de información sobre sesgos, pero al derivar de un modelo entrenado con datos web, es probable que herede sesgos sociales y culturales.
- Riesgo de alucinación: inherente a los modelos de lenguaje, especialmente en tamaños pequeños como 268M, donde la coherencia factual puede ser baja.
- Limitaciones de contexto o idioma: se desconoce la longitud de contexto y los idiomas soportados, lo que impide garantizar su funcionamiento en textos largos o en español.
- Restricciones de licencia: la licencia figura como no disponible, por lo que no se puede confirmar si permite uso comercial. Se recomienda contactar con el autor antes de utilizarlo en producción.
- Caveat importante: la model card no documenta el dataset de entrenamiento, el número de tokens ni el proceso de alineación, lo que dificulta evaluar su robustez y seguridad. Se recomienda realizar una evaluación exhaustiva antes de cualquier despliegue real.
- Capacidad limitada: por su tamaño, no es adecuado para tareas que requieran razonamiento complejo, generación de código avanzado o matemáticas.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/fbetteo/working
- Modelo base: https://huggingface.co/google/gemma-3-270m-it
- Repositorio de TRL: https://github.com/huggingface/trl
- Sitio web del autor: https://fbetteo.com/
