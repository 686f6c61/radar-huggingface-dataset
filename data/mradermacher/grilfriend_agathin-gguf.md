# mradermacher/grilfriend_agathin-GGUF

## Resumen

`grilfriend_agathin-GGUF` es la versión cuantizada en formato GGUF del modelo `al5al21/grilfriend_agathin`, publicada por el usuario mradermacher el 28 de marzo de 2025. Se trata de un modelo transformer de tamaño muy reducido, con 124.439.808 parámetros totales (aproximadamente 124 millones), lo que lo sitúa en la categoría de modelos compactos aptos para ejecución en CPU y GPU de gama baja. El nombre del modelo sugiere un ajuste fino orientado a conversación afectiva o de rol ("girlfriend"), aunque la model card no documenta el proceso de entrenamiento.

La relevancia de esta ficha es limitada pero concreta: mradermacher es un cuantizador de referencia en la comunidad open source y ofrece una batería completa de cuantizaciones estáticas (de Q2_K a f16) para un modelo base que, de otro modo, solo estaría disponible en safetensors. Para desarrolladores que quieran experimentar con modelos conversacionales de 124M parámetros en hardware modesto, esta es la vía práctica de acceso.

No se dispone de información sobre arquitectura detallada, datos de entrenamiento, longitud de contexto ni benchmarks. La model card del cuantizador es puramente operativa (enlaces de descarga y notas sobre tipos de cuantización) y no incluye la ficha técnica del modelo original. Todo lo que se indica a continuación se limita a lo verificable en los metadatos y en el README proporcionados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer (deducido de la libreria `transformers`; no se detalla variante) |
| Parametros totales | 124.439.808 |
| Parametros activos | no disponible (no es MoE segun los metadatos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base esta en safetensors |

## Arquitectura y entrenamiento

La información disponible no permite detallar la arquitectura interna. Los metadatos indican que el modelo base (`al5al21/grilfriend_agathin`) se distribuye con la librería `transformers`, lo que implica una arquitectura transformer estándar, pero no se especifica si se trata de una variante tipo GPT, Llama, Mistral u otra familia. Con 124M parámetros, el tamaño es comparable a GPT-2 small o a los modelos tipo "nano" empleados en experimentos de ajuste fino.

Respecto al entrenamiento, no hay datos publicados en la información proporcionada: se desconoce el número de tokens, la composición del dataset, si hubo RLHF, DPO o simplemente ajuste supervisado. El nombre del modelo sugiere un fine-tuning sobre un modelo base conversacional con un corpus orientado a role-play afectivo, pero esto es una inferencia a partir del nombre y no un dato confirmado. Las cuantizaciones de mradermacher son estáticas (`quantize_version: 2`, `output_tensor_quantised: 1`) y no se han publicado variantes ponderadas con imatrix para este modelo.

## Capacidades

- Generación de texto en inglés: es la única capacidad explícitamente declarada en los metadatos (idioma `en`).
- Conversación de rol: por el nombre del modelo base, se orienta a diálogo afectivo o de personaje, aunque no hay documentación que lo confirme.
- No hay evidencia de soporte de tool calling, function calling ni agentes multi-paso.
- No hay evidencia de capacidades multimodales (visión, audio) ni de modo "thinking".
- Capacidades multilingües: no disponibles; solo se declara inglés.
- Razonamiento, código y matemáticas: sin datos publicados; con 124M parámetros, el rendimiento esperable en estas tareas es bajo en comparación con modelos de mayor tamaño.

## Casos de uso

- Experimentación educativa con modelos pequeños: el tamaño de 124M parámetros y las cuantizaciones de 0,2 GB permiten cargar el modelo en portátiles sin GPU dedicada y estudiar el comportamiento de un transformer conversacional en local.
- Prototipado de chatbots de personaje en inglés: adecuado para maquetas de interfaces conversacionales donde el objetivo es validar el flujo de diálogo, no la calidad de las respuestas.
- Pruebas de pipelines GGUF: sirve como modelo de prueba para validar integraciones con llama.cpp, Ollama o servidores compatibles con la API de OpenAI antes de desplegar modelos mayores.
- Evaluación de cuantizaciones: al ofrecer doce variantes (Q2_K a f16), permite medir el impacto de la cuantización en la perplejidad y en la calidad de salida sobre un mismo modelo base.
- Generación de texto creativo breve en inglés: relatos cortos, descripciones o diálogos de relleno en aplicaciones donde el coste computacional es crítico.
- Docencia y talleres de IA open source: modelo ligero para demostrar el ciclo completo de descarga, cuantización y despliegue sin requerir infraestructura de GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 0,2 GB (Q2_K, Q3_K_S) y 0,4 GB (f16) según el tamaño de los ficheros publicados; el modelo completo en f16 ocupa aproximadamente 0,4 GB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; una RTX 3060, RTX 4060 o incluso una GTX 1650 pueden ejecutar el modelo con holgura.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU dedicada de los últimos diez años, y también en CPU (el repo completo pesa 1,3 GB, pero cada cuantización individual es de 0,2 GB).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, servidores compatibles con la API de OpenAI (los tags incluyen `endpoints_compatible`) y cualquier runtime que acepte GGUF.
- Latencia y throughput: no disponibles; con 124M parámetros, la generación en CPU moderna debería ser de decenas de tokens por segundo, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| grilfriend_agathin-GGUF | 124M | no disponible | apache-2.0 | GGUF | Hugging Face |
| GPT-2 small | 124M | 1.024 tokens | MIT | safetensors, GGUF (comunitario) | Hugging Face |
| SmolLM-135M | 135M | 2.048 tokens | apache-2.0 | safetensors, GGUF | Hugging Face |
| Qwen2.5-0.5B | 494M | 32.768 tokens | apache-2.0 | safetensors, GGUF | Hugging Face |

La comparación es aproximada: no hay benchmarks públicos de `grilfriend_agathin` que permitan situarlo frente a estos modelos. GPT-2 small y SmolLM-135M son los equivalentes más cercanos en número de parámetros; Qwen2.5-0.5B se incluye como referencia de la siguiente escala, con contexto mucho mayor y licencia permisiva.

## Limitaciones y advertencias

- Ausencia total de documentación técnica: no se conocen datos de entrenamiento, contexto, tokenizador ni evaluación, lo que impide garantizar su comportamiento en producción.
- Riesgo elevado de alucinación y de respuestas incoherentes: con 124M parámetros y sin benchmarks, la calidad esperable es baja en tareas de razonamiento, código o matemáticas.
- Sesgos desconocidos: al no documentarse el corpus de entrenamiento, no es posible evaluar sesgos de género, raza o ideológicos; el nombre del modelo sugiere además un sesgo temático hacia el role-play afectivo.
- Idioma limitado al inglés: no se declara soporte de castellano ni de otros idiomas.
- Licencia apache-2.0: permite uso comercial, pero el usuario debe verificar que el modelo base (`al5al21/grilfriend_agathin`) mantiene la misma licencia y que no incorpora datos con restricciones adicionales.
- Contexto desconocido: no se puede planificar su uso en conversaciones multi-turno largas sin antes medir el límite real de tokens.
- Cuantizaciones estáticas sin imatrix: mradermacher advierte de que no hay variantes ponderadas, por lo que las cuantizaciones de baja precisión (Q2_K, Q3_K_S) pueden degradar notablemente la calidad.
- Repo con 19 descargas y 0 likes: comunidad prácticamente inexistente, sin issues ni discusiones que permitan contrastar experiencias.

## Enlaces

- Modelo cuantizado en Hugging Face: https://huggingface.co/mradermacher/grilfriend_agathin-GGUF
- Modelo base: https://huggingface.co/al5al21/grilfriend_agathin
- Página de resumen del cuantizador: https://hf.tst.eu/model#grilfriend_agathin-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Guía sobre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Empresa del cuantizador: https://www.nethype.de/
