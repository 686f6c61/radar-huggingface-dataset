# mradermacher/SmolLM3-3B-FineTuned-GGUF

## Resumen

Este repositorio contiene versiones cuantizadas en formato GGUF del modelo BossDefender/SmolLM3-3B-FineTuned, un ajuste fino sobre la familia SmolLM3-3B. La publicación la firma mradermacher, un autor que se dedica a convertir pesos de modelos de terceros a cuantizaciones GGUF para su uso con llama.cpp y herramientas compatibles. No se trata de un modelo entrenado desde cero, sino de una reconversión de pesos ya existentes a precisiones reducidas.

El modelo base declara 3.075.098.624 parámetros y está etiquetado como conversacional y en inglés. La model card del repositorio no documenta el proceso de ajuste fino, el dataset empleado ni el propósito concreto de la variante "FineTuned", por lo que la información sobre el origen del ajuste es limitada.

La relevancia práctica reside en el formato: se ofrecen 12 niveles de cuantización entre 1,4 GB (Q2_K) y 6,3 GB (f16), lo que permite ejecutar un modelo de aproximadamente 3 000 millones de parámetros en hardware de consumo, desde equipos con 8 GB de RAM hasta GPUs de gama media con 8-12 GB de VRAM. El repositorio no incluye datos de benchmarks, licencia declarada ni longitud de contexto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible en la documentación del repositorio (heredada del modelo base SmolLM3-3B) |
| Parámetros totales | 3.075.098.624 |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la documentación del repositorio |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | GGUF; el modelo base se distribuye en safetensors |
| Modelo base | BossDefender/SmolLM3-3B-FineTuned |
| Autor de la cuantización | mradermacher |
| Tamaño del repositorio | 27,8 GB |
| Pipeline declarado | no disponible |
| Fecha de publicación | 16 de septiembre de 2026 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card del repositorio no describe la arquitectura ni el entrenamiento: se limita a indicar que son cuantizaciones estáticas del modelo BossDefender/SmolLM3-3B-FineTuned, generadas con `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`. No se especifica el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF, DPO o ajuste por preferencias. Tampoco se detalla el procedimiento de ajuste fino que da nombre al modelo base.

Como referencia externa a esta ficha, la familia SmolLM3-3B publicada por Hugging Face se documenta como un transformer decoder-only de aproximadamente 3 000 millones de parámetros con atención de consultas agrupadas (GQA) y soporte de contexto largo; estos datos corresponden a la documentación pública de la familia y no están verificados en la información de este repositorio, por lo que deben confirmarse antes de usarlos en producción. El autor indica además que no ha publicado cuantizaciones ponderadas ni con imatrix para este modelo, solo las estáticas.

## Capacidades

- Generación de texto conversacional en inglés: es la única capacidad confirmada por las etiquetas del repositorio (`conversational`, `en`).
- Conversación multi-turno: la etiqueta `conversational` y la compatibilidad con plantillas de chat de llama.cpp permiten su uso en diálogos, siempre que el modelo base conserve dicha plantilla.
- Razonamiento, matemáticas y generación de código: no disponible en la información proporcionada.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles; el único idioma declarado es el inglés.
- Capacidades especiales (modo de razonamiento, visión, audio): no disponibles en la información proporcionada.

## Casos de uso

- Prototipado local en portátil: con la cuantización Q4_K_M (2,0 GB) el modelo puede cargarse en un equipo con 8 GB de RAM mediante Ollama o LM Studio, lo que permite iterar sobre prompts y plantillas de chat sin coste de API ni conexión a internet.
- Asistente conversacional en inglés desplegado en CPU: usando llama.cpp o llama-cpp-python se puede servir un endpoint de chat en un servidor sin GPU, adecuado para volúmenes bajos de tráfico interno y para entornos con requisitos de privacidad estrictos.
- Procesamiento de datos sensibles en local: al ejecutarse íntegramente en la infraestructura propia, encaja en flujos donde el texto no puede salir de la organización (borradores internos, resúmenes de documentación confidencial).
- Aplicaciones en el borde (edge): la cuantización Q3_K_S (1,5 GB) o Q2_K (1,4 GB) permite desplegar el modelo en dispositivos con memoria limitada, como una Raspberry Pi 5 de 8 GB o mini-PCs industriales, para tareas de generación de texto corto.
- Evaluación comparativa de cuantizaciones: disponer de 12 niveles en un mismo repositorio facilita medir el compromiso entre tamaño y perplejidad (por ejemplo, Q4_K_M frente a Q8_0 y f16) antes de fijar una configuración de producción.
- Base para ajuste fino adicional: los pesos del modelo base en safetensors pueden servir como punto de partida para LoRA o QLoRA sobre dominios concretos en inglés; las cuantizaciones GGUF son adecuadas para inferencia, pero no para entrenamiento.
- Generación de texto auxiliar de bajo coste: tareas de resumen, reescritura o extracción de campos en inglés donde no se requiere razonamiento complejo y prima el coste por token.
- Docencia y experimentación académica: el tamaño reducido y la disponibilidad de versiones f16 hacen viable estudiar el efecto de la cuantización en la calidad de salida con recursos de laboratorio modestos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio no incluye métricas de MMLU, HumanEval, GSM8K, perplejidad ni ninguna otra evaluación, y tampoco se ofrecen comparaciones con el modelo base sin cuantizar.

## Requisitos de hardware

Tamaños de fichero y estimación de memoria mínima para inferencia (solo pesos; hay que sumar la caché KV, que crece con la longitud de contexto):

| Cuantización | Tamaño | Memoria mínima orientativa |
|---|---|---|
| Q2_K | 1,4 GB | ~2 GB |
| Q3_K_S | 1,5 GB | ~2 GB |
| Q3_K_M | 1,7 GB | ~2,5 GB |
| Q3_K_L | 1,8 GB | ~2,5 GB |
| IQ4_XS | 1,8 GB | ~2,5 GB |
| Q4_K_S | 1,9 GB | ~2,5 GB |
| Q4_K_M | 2,0 GB | ~3 GB |
| Q5_K_S / Q5_K_M | 2,3 GB | ~3 GB |
| Q6_K | 2,6 GB | ~3,5 GB |
| Q8_0 | 3,4 GB | ~4,5 GB |
| f16 | 6,3 GB | ~7 GB |

- Cabe en GPU de consumo: sí. Las cuantizaciones Q4_K_M y Q5_K_M entran holgadamente en GPUs con 8 GB de VRAM (RTX 3060 Ti, RTX 4060, RTX 2070) e incluso en tarjetas de 6 GB con contexto corto. Q8_0 requiere alrededor de 6 GB de VRAM y f16 unos 8 GB.
- GPU profesionales: A100, H100 o L40S no son necesarias para inferencia; se justificarían solo para servir muchas réplicas concurrentes o volúmenes altos de peticiones.
- Ejecución en CPU: viable en los modos de bajo consumo de memoria y en las cuantizaciones K-quant, que están optimizadas para CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, KoboldCpp y servidores compatibles con la API de OpenAI sobre llama.cpp. vLLM y TGI tienen soporte limitado o experimental de GGUF, por lo que no son la vía recomendada para este repositorio; para esos motores conviene partir de los safetensors del modelo base.
- Latencia y throughput: no disponible en la información proporcionada. Dependen por completo del hardware, de la cuantización y de la longitud de contexto; no se han publicado mediciones.

## Comparativa con modelos similares

Los datos de las alternativas proceden de documentación pública de cada familia y no están verificados en la información de este repositorio; los campos no confirmados se marcan como tal.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad en GGUF |
|---|---|---|---|---|
| SmolLM3-3B-FineTuned (este repo) | 3,075 B | no disponible | no disponible | Sí, 12 cuantizaciones |
| SmolLM3-3B (familia base de Hugging Face) | ~3,08 B | 64 000 tokens nativos, ampliable con YaRN (según documentación pública) | Apache 2.0 (según documentación pública) | Sí, publicadas por terceros |
| Qwen2.5-3B | ~3,09 B | 32 768 tokens nativos, hasta 131 072 con YaRN (según documentación pública) | licencia específica de Qwen para el tamaño 3B (según documentación pública) | Sí |
| Llama-3.2-3B | ~3,21 B | 128 000 tokens (según documentación pública) | Llama 3.2 Community License (según documentación pública) | Sí |
| Gemma-3-4B | ~4 B | 128 000 tokens (según documentación pública) | Gemma Terms of Use (según documentación pública) | Sí |

No se dispone de métricas comparativas de calidad entre estas opciones dentro de la información proporcionada, por lo que la elección debería basarse en pruebas propias sobre el caso de uso concreto.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. Ni la model card del repositorio ni la del modelo base aportan información sobre sesgos, composición del dataset o filtrado de datos.
- Riesgo de alucinación: inherente a un modelo de ~3 000 millones de parámetros; sin benchmarks publicados no es posible cuantificar su fiabilidad factual.
- Idioma: el único idioma declarado es el inglés. El rendimiento en castellano no está garantizado y probablemente sea inferior.
- Contexto: se desconoce la longitud máxima soportada, ya que el repositorio no la documenta. Configurar un contexto superior al entrenado degradará la calidad de forma silenciosa.
- Licencia: figura como "no disponible", tanto en los metadatos de Hugging Face como en la model card. No se puede asumir uso comercial sin aclarar antes la licencia del modelo base y la del ajuste fino, y conviene revisar también los términos de la familia SmolLM3 si el ajuste hereda sus condiciones.
- Cuantización: las versiones por debajo de Q4 pierden calidad de forma apreciable; el propio autor recomienda Q4_K_S o Q4_K_M para uso general. Q2_K y Q3_K_S deben considerarse solo para pruebas de viabilidad.
- Ausencia de cuantizaciones ponderadas o con imatrix: el autor indica que no están disponibles y no garantiza publicarlas, de modo que no hay alternativas de mayor calidad para un mismo tamaño.
- Madurez del repositorio: 0 descargas y 0 likes en el momento de la consulta, sin validación por parte de la comunidad. Conviene verificar la integridad de los ficheros y comparar la salida frente al modelo base antes de integrarlo en un sistema en producción.
- Falta de pipeline declarado: no se especifica tarea de pipeline, lo que añade incertidumbre sobre el formato de prompt esperado; habrá que recuperar la plantilla de chat del modelo base.

## Enlaces

- Repositorio del modelo: https://huggingface.co/mradermacher/SmolLM3-3B-FineTuned-GGUF
- Modelo base: https://huggingface.co/BossDefender/SmolLM3-3B-FineTuned
- Página de resumen de cuantizaciones del autor: https://hf.tst.eu/model#SmolLM3-3B-FineTuned-GGUF
- Solicitudes de cuantización y preguntas frecuentes de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guía de uso de ficheros GGUF (referencia citada por el autor): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de perplejidad por tipo de cuantización: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre tipos de cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa responsable de la infraestructura de cuantización: https://www.nethype.de/
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes; las búsquedas devolvieron únicamente páginas genéricas de YouTube, sin relación con el modelo.
