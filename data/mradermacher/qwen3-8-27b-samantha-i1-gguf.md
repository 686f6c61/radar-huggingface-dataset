# mradermacher/Qwen3.8-27B-Samantha-i1-GGUF

## Resumen

El modelo `mradermacher/Qwen3.8-27B-Samantha-i1-GGUF` es una cuantización GGUF con matriz de importancia (imatrix) del modelo `Lathly/Qwen3.8-27B-Samantha`, un merge sobre la base Qwen3.8-27B de Alibaba Cloud. El merge incorpora el dataset `digitalpipelines/samantha-1.1-uncensored`, orientado a crear un asistente conversacional empático, cercano y sin censura, en la línea del personaje "Samantha" popularizado en la comunidad de IA local. El resultado es un modelo multimodal de 27 320 millones de parámetros, con ventana de contexto nativa de 262 144 tokens, capaz de procesar texto, imagen y vídeo, y con soporte para modo de razonamiento explícito (thinking).

La relevancia de esta ficha radica en que ofrece una versión cuantizada de un modelo que combina las capacidades técnicas de Qwen3.8-27B (visión, contexto largo, agentes) con un estilo conversacional desinhibido, pensado para entornos donde se requiere una interacción natural y sin restricciones temáticas. El autor, mradermacher, es un cuantizador conocido en la comunidad por generar versiones GGUF optimizadas con imatrix, lo que facilita su ejecución en hardware de consumo. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (texto, imagen, vídeo) con modo thinking; basado en Qwen3.8-27B |
| Parametros totales | 27 320 697 856 (27,3 B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262 144 tokens (256K) |
| Tipos de cuantizacion | GGUF con imatrix (IQ y Q); lista exacta no publicada en el repositorio, solo se referencia un archivo imatrix de 0,1 GB |
| Idiomas soportados | ingles (dataset de entrenamiento); el modelo base Qwen3.8 soporta multiples idiomas, pero el merge esta enfocado en ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors para el modelo base en el repositorio original) |

## Arquitectura y entrenamiento

El modelo base, Qwen3.8-27B, es un transformer denso multimodal que acepta entradas de texto, imagen y vídeo. Incorpora un mecanismo de "thinking" opcional que permite al modelo razonar de forma explícita antes de responder. Su ventana de contexto nativa es de 262 144 tokens, lo que lo hace adecuado para tareas que requieren procesar documentos largos o historiales conversacionales extensos.

El merge `Lathly/Qwen3.8-27B-Samantha` combina los pesos de Qwen3.8-27B con el dataset `samantha-1.1-uncensored`, un conjunto de diálogos diseñados para imitar el estilo de Samantha, un asistente personal empático, cálido y sin filtros de contenido. El proceso de entrenamiento no está documentado en la información disponible; se desconoce si se usó fine-tuning supervisado, RLHF u otra técnica. La cuantización realizada por mradermacher aplica imatrix (matriz de importancia) para mejorar la calidad de las cuantizaciones de baja precisión, aunque los detalles concretos de los archivos GGUF generados no se especifican en el repositorio.

## Capacidades

- Generación de texto conversacional con tono empático y cercano, sin restricciones de contenido (uncensored).
- Procesamiento multimodal: acepta imágenes y vídeo como entrada, además de texto.
- Razonamiento explícito mediante modo thinking (activable/desactivable).
- Ventana de contexto de 256K tokens, útil para conversaciones de larga duración o documentos extensos.
- Soporte para tool calling y uso como agente (heredado de Qwen3.8-27B, aunque no se confirma en la documentación del merge).
- Capacidades multilingües del modelo base, aunque el ajuste con Samantha está orientado al inglés.

## Casos de uso

- Atención al cliente automatizada con tono humano: el modelo puede mantener conversaciones multi-turno empáticas y resolver consultas sin necesidad de guiones rígidos. Su contexto de 256K permite recordar interacciones previas largas.
- Asistente personal local para tareas de productividad: redacción de correos, resúmenes de documentos, organización de agenda, con un estilo natural y cercano.
- Generación de contenido creativo sin restricciones: escritura de ficción, guiones, diálogos o ideas para marketing donde se requiere explorar temas sensibles sin filtros.
- Análisis de imágenes y vídeo en tiempo real: gracias a su naturaleza multimodal, puede describir contenido visual, extraer información de capturas o transcribir vídeos.
- Prototipado de agentes conversacionales con razonamiento: el modo thinking permite depurar respuestas complejas antes de mostrarlas, útil en sistemas de soporte técnico o educativos.
- Despliegue en entornos con recursos limitados: al estar cuantizado en GGUF, puede ejecutarse en portátiles con GPU de 8-16 GB de VRAM mediante llama.cpp u Ollama, sin necesidad de infraestructura cloud.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para el modelo `Lathly/Qwen3.8-27B-Samantha` ni para su versión cuantizada. El modelo base Qwen3.8-27B presenta puntuaciones en MMLU, HumanEval y otros tests estándar, pero no se dispone de esos datos en la información proporcionada. No se deben inferir valores sin fuente verificable.

## Requisitos de hardware

- VRAM estimada: una cuantización Q4_K_M de un modelo de 27B parámetros ocupa aproximadamente 16-18 GB, por lo que es viable en GPUs de consumo como RTX 3090, RTX 4090 o A4000 (16 GB). Para cuantizaciones más agresivas (Q2, IQ2), podría caber en 10-12 GB.
- GPUs recomendadas: NVIDIA RTX 3090/4090 (24 GB) para mayor comodidad, o A100/H100 para despliegue en servidor con mayor throughput.
- Inferencia en CPU: posible con llama.cpp usando cuantizaciones Q4 o inferiores, aunque la velocidad será limitada (del orden de 1-3 tokens/s en CPU moderna).
- Opciones de despliegue: llama.cpp, Ollama, vLLM (con soporte para GGUF), TGI, o el backend de Unsloth para GGUFs.
- Latencia y throughput: no disponibles; dependen de la cuantización y el hardware. En una RTX 4090 con Q4_K_M se espera una velocidad de generación de 20-40 tokens/s, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27,3 B | 256K | Sí (imagen/vídeo) | Apache 2.0 | Modelo original sin ajuste conversacional |
| Lathly/Qwen3.8-27B-Samantha | 27,3 B | 256K | Sí | Apache 2.0 | Merge con dataset Samantha uncensored |
| mradermacher/Qwen3.8-27B-Samantha-i1-GGUF | 27,3 B | 256K | Sí (requiere archivo mmproj) | Apache 2.0 | Cuantización GGUF del anterior |
| Llama 3.1 8B Instruct | 8 B | 128K | No | Llama 3.1 Community License | Menor tamaño, sin visión, contexto menor |
| Mistral Small 24B | 24 B | 32K | No | Apache 2.0 | Sin visión, contexto corto |

La comparativa muestra que este modelo se distingue por combinar un tamaño medio (27B) con capacidades multimodales y contexto muy largo, algo poco común en modelos de su categoría. La alternativa más cercana sería el propio Qwen3.8-27B original, pero sin el ajuste conversacional desinhibido.

## Limitaciones y advertencias

- Sesgos y alucinaciones: al ser un modelo sin censura, puede generar contenido ofensivo, sexual, violento o falso con mayor facilidad que los modelos alineados. No es recomendable para uso público sin moderación.
- Riesgo de alucinación: inherente a todos los LLM, pero el dataset "uncensored" puede aumentar la confianza en respuestas incorrectas.
- Limitaciones de idioma: el ajuste con Samantha está en inglés; aunque el modelo base soporta otros idiomas, el estilo conversacional puede degradarse fuera del inglés.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el dataset `samantha-1.1-uncensored` puede tener términos de uso propios que no se han verificado.
- Dependencia del archivo mmproj: para usar la parte multimodal (visión) con GGUF, se necesita el archivo de proyección (mmproj) que se encuentra en el repositorio estático del autor, no en este repo.
- Calidad de la cuantización: las cuantizaciones de baja precisión (IQ2, Q2) pueden degradar notablemente la calidad del razonamiento y la coherencia; se recomienda usar Q4_K_M o superior para tareas críticas.
- Sin garantías de producción: al ser un merge no oficial, no hay soporte técnico ni documentación de entrenamiento detallada.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Qwen3.8-27B-Samantha-i1-GGUF
- Modelo base (merge): https://huggingface.co/Lathly/Qwen3.8-27B-Samantha
- Repositorio estático con quants y mmproj: https://huggingface.co/mradermacher/Qwen3.8-27B-Samantha-GGUF
- Guía de cuantizaciones GGUF para Qwen3.8-27B: https://kingy.ai/blog/qwen3-8-27b-best-quantization-gguf/
- Requisitos de hardware y despliegue local: https://gingerlabs.ai/blog/qwen-38-27b-hardware-requirements-and-how-to-deploy-locally
- Documentación de Unsloth para Qwen3.8: https://unsloth.ai/docs/models/qwen3.8
