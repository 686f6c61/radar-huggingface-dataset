# 1bit-MONSTER/Llama-3.2-3B-Instruct-GGUF

## Resumen

Este repositorio es una redistribución en formato GGUF del modelo Llama-3.2-3B-Instruct de Meta, cuantizado en Q4_K_M por bartowski y reempaquetado por el usuario 1bit-MONSTER. No se trata de un modelo nuevo ni de un fine-tuning: es exactamente el mismo conjunto de pesos del modelo instructivo de 3.212.749.888 parámetros, convertido a un formato de cuantización de 4 bits que reduce su huella de memoria a aproximadamente 2 GB. Su función es permitir la inferencia local del modelo en hardware de gama media o incluso integrado, sin necesidad de GPUs de datacenter.

El interés de esta publicación concreta reside en que incluye métricas de rendimiento medidas sobre el motor propietario del autor (1bit engine) ejecutándose con backend Vulkan en una plataforma Strix Halo (APU de AMD). El autor reporta 2775 tok/s en prefill (pp512) y 85,8 tok/s en generación (tg128), cifras que sirven como referencia práctica de despliegue en hardware de consumo. Para el resto de especificaciones técnicas, el repositorio hereda las del modelo base original de Meta.

Conviene señalar que este repositorio no aporta datos propios de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) ni documenta el proceso de cuantización más allá de indicar que procede de bartowski. Es, por tanto, una ficha de despliegue más que de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con GQA y RoPE (heredada del modelo base) |
| Parametros totales | 3.212.749.888 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128.000 tokens (dato del modelo base; no verificado en esta cuantizacion) |
| Tipos de cuantizacion | Q4_K_M (unico fichero incluido en este repo); bartowski publica otras variantes |
| Idiomas soportados | no disponible en la informacion proporcionada (el modelo base declara 8 idiomas) |
| Licencia | llama3.2 (Llama 3.2 Community License) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo subyacente es Llama-3.2-3B-Instruct, un transformer decoder-only de 3.212 millones de parámetros. El repositorio no documenta la arquitectura interna ni los datos de entrenamiento; esta información pertenece a la ficha oficial de Meta del modelo base y no se reproduce aquí más allá de lo indicado en el apartado anterior. Lo que sí se documenta en este repo es el proceso de cuantización posterior: conversión a GGUF con esquema Q4_K_M, una cuantización de 4 bits con escalas por bloque que preserva los tensores más sensibles (embeddings y algunas capas de atención) en precisión superior.

La única innovación técnica destacable de esta publicación es su integración con el motor 1bit engine del autor, que ejecuta la inferencia mediante Vulkan y permite correr el modelo en APUs y GPUs integradas. Las cifras de rendimiento publicadas corresponden a esa combinación concreta de modelo, cuantización y motor, y no son extrapolables a otras implementaciones (llama.cpp, vLLM, Ollama) sin medirlas.

## Capacidades

- Generación de texto conversacional en formato instruct, adecuada para diálogo multiturno.
- Razonamiento básico y resolución de tareas de complejidad baja o media, coherente con un modelo de 3B parámetros.
- Generación y explicación de código en lenguajes habituales (Python, JavaScript, etc.), con calidad limitada por el tamaño.
- Aritmética y problemas matemáticos sencillos; no es fiable en razonamiento matemático de varios pasos.
- Soporte de tool calling / function calling: no disponible explícitamente en la model card de este repo; el modelo base de Meta sí define plantillas de llamada a herramientas, pero no se valida aquí.
- Capacidades de agente y multi-step reasoning: no documentadas en este repositorio.
- Capacidades multilingües: no documentadas en este repositorio.
- Capacidades especiales (modo thinking, visión, audio): ninguna. Llama 3.2 3B es una variante solo texto; las capacidades de visión corresponden a los modelos 11B y 90B de la familia.

## Casos de uso

- Asistente conversacional local en un portátil o mini-PC: el fichero Q4_K_M ocupa unos 2 GB, por lo que puede cargarse en memoria y responder a baja latencia sin conexión a internet, con el contexto limitado por la RAM disponible.
- Generación de texto offline en aplicaciones de escritorio: integrable mediante llama.cpp, Ollama o el motor 1bit para redactar borradores, resumir documentos o reformular texto sin enviar datos a terceros.
- Clasificación y etiquetado de textos en pipelines de procesamiento: con prompts estructurados, el modelo puede asignar categorías o extraer campos de documentos cortos a un coste computacional mínimo.
- Prototipado rápido de aplicaciones de IA generativa: sirve como modelo de desarrollo antes de escalar a variantes mayores, gracias a su reducida huella de VRAM y a su disponibilidad en GGUF.
- Inferencia en hardware integrado: el autor valida su ejecución en Strix Halo con Vulkan a 85,8 tok/s de generación, lo que habilita casos de uso interactivos en APUs sin GPU dedicada.
- Educación y experimentación: permite a estudiantes ejecutar y estudiar un modelo instructivo real de 3B en equipos de consumo, comparando cuantizaciones y midiendo throughput.
- Preprocesado de bajo coste en sistemas mayores: tareas de filtrado, normalización o enrutamiento previo antes de invocar un modelo de mayor tamaño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El repositorio únicamente incluye métricas de throughput medidas sobre Strix Halo con backend Vulkan:

| Metrica | Valor |
|---|---|
| Prefill (pp512) | 2775 tok/s |
| Generacion (tg128) | 85,8 tok/s |
| Plataforma | Strix Halo (APU AMD) |
| Backend | Vulkan |
| Motor | 1bit engine |

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 2,0-2,5 GB para los pesos Q4_K_M, más el espacio de la caché KV, que crece con la longitud de contexto. Para 128k tokens la caché KV excede con holgura la capacidad de cualquier GPU de consumo, por lo que en la práctica se opera con contextos mucho más cortos.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM resulta suficiente; una RTX 3060, RTX 4060, RTX 4090 o superior ejecutan el modelo con margen amplio. También es viable en GPUs integradas y APUs con memoria unificada.
- Cabe en GPU de consumo: sí, en prácticamente todas las GPU discretas modernas y en muchas integradas.
- Caber en CPU: sí, es un caso de uso habitual de los ficheros GGUF de este tamaño.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, KoboldCpp, el motor 1bit engine del autor (con backend Vulkan) y cualquier runtime compatible con GGUF. vLLM y TGI no son las vías naturales para este formato.
- Latencia y throughput: el único dato medido disponible es el de Strix Halo con Vulkan (2775 tok/s en prefill, 85,8 tok/s en generación). No se han publicado mediciones para otras GPUs en este repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| 1bit-MONSTER/Llama-3.2-3B-Instruct-GGUF (este) | 3,21B | 128k (heredado) | llama3.2 | GGUF Q4_K_M | Redistribucion con metricas en Strix Halo/Vulkan |
| meta-llama/Llama-3.2-3B-Instruct | 3,21B | 128k | llama3.2 | safetensors | Modelo base original en precision completa |
| bartowski/Llama-3.2-3B-Instruct-GGUF | 3,21B | 128k | llama3.2 | GGUF (multitud de cuantizaciones) | Origen de la cuantizacion reempaquetada aqui |
| Qwen2.5-3B-Instruct | 3,09B | 32.768 tokens (ampliable) | Apache 2.0 | safetensors, GGUF | Alternativa de tamano equivalente con licencia permisiva |

No se dispone de resultados de benchmarks comparativos publicados en la informacion proporcionada, por lo que la comparacion se limita a parametros, contexto y licencia.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en este repositorio; el modelo base hereda los sesgos de sus datos de entrenamiento, no auditados aquí.
- Riesgo de alucinacion: elevado en un modelo de 3B parámetros, especialmente en tareas factuales, matemáticas y de razonamiento prolongado.
- Limitaciones de contexto: aunque el modelo base declara 128k tokens, la caché KV a esa longitud es inviable en hardware de consumo, y la cuantización Q4_K_M puede degradar la calidad en contextos muy largos.
- Limitaciones de idioma: no se especifica el soporte multilingüe en esta publicación; el rendimiento fuera del inglés no está validado aquí.
- Restricciones de licencia: se aplica la Llama 3.2 Community License. Exige atribución "Built with Llama" y una licencia adicional si el producto o servicio supera los 700 millones de usuarios activos mensuales.
- Trazabilidad: el repositorio no incluye el script ni los parámetros exactos de cuantización, solo la atribución a bartowski; no se documenta ninguna validación de calidad tras la conversión.
- Advertencia de producción: las métricas de rendimiento publicadas provienen de una única plataforma (Strix Halo, Vulkan) y no deben extrapolarse a otros entornos sin medirlas.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/1bit-MONSTER/Llama-3.2-3B-Instruct-GGUF
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Licencia del modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct/blob/main/LICENSE.txt
- Repositorio del autor de la cuantización original: https://huggingface.co/bartowski/Llama-3.2-3B-Instruct-GGUF
- Motor de inferencia 1bit engine: https://github.com/1bit-MONSTER/engine

Nota: los resultados de busqueda web proporcionados no contienen informacion relevante sobre el modelo y no se han utilizado.
