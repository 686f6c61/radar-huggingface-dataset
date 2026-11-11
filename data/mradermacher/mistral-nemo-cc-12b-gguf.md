# mradermacher/mistral-nemo-cc-12B-GGUF

## Resumen

mistral-nemo-cc-12B-GGUF es la versión cuantizada en formato GGUF del modelo nbeerbower/mistral-nemo-cc-12B, un ajuste fino de Mistral NeMo de 12B orientado a conversación casual. El trabajo de cuantización lo firma mradermacher, un conocido publicador de cuantizaciones GGUF para llama.cpp, que distribuye los pesos en múltiples niveles de compresión (desde Q2_K hasta Q8_0) para facilitar su despliegue en hardware de consumo.

El modelo base parte de Mistral NeMo, la arquitectura de 12.247.813.120 parámetros desarrollada conjuntamente por Mistral AI y NVIDIA, y ha sido especializado mediante ajuste fino supervisado y DPO sobre el dataset flammenai/casual-conversation-DPO para mejorar la naturalidad y el tono en diálogos informales. Esta versión GGUF hereda las capacidades del modelo original pero las empaqueta en un formato que permite ejecución local eficiente con llama.cpp, Ollama y otros runners compatibles.

Su relevancia actual radica en que ofrece un modelo conversacional de 12B con licencia Apache 2.0, ejecutable en GPU de consumo (a partir de 8 GB de VRAM con cuantización Q4), lo que lo convierte en una opción práctica para prototipos de asistentes conversacionales y despliegues on-premise sin dependencia de APIs externas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Mistral NeMo) |
| Parametros totales | 12.247.813.120 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el modelo base Mistral NeMo soporta 128K, pero la model card de esta cuantización no lo especifica) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (también disponible el base en safetensors vía nbeerbower/mistral-nemo-cc-12B) |

## Arquitectura y entrenamiento

El modelo base es Mistral NeMo, un transformer decoder-only de 12B parámetros desarrollado por Mistral AI y NVIDIA. Emplea tokenizador Tekken (basado en tiktoken) con un vocabulario ampliado, atención con RoPE y las innovaciones estándar de la familia NeMo. El ajuste fino nbeerbower/mistral-nemo-cc-12B se ha realizado sobre el dataset flammenai/casual-conversation-DPO, que contiene pares de conversación casual con preferencias para DPO (Direct Preference Optimization), con el objetivo de mejorar la calidad y naturalidad del diálogo informal en inglés.

La versión de mradermacher es una conversión estática a GGUF (quantize_version: 2, output_tensor_quantised: 1, convert_type: hf) realizada con llama.cpp. El autor indica que no ha generado cuantizaciones ponderadas/imatrix para este modelo, por lo que solo están disponibles los quants estáticos listados. No se detalla en la información proporcionada el número de tokens de entrenamiento del ajuste fino ni la composición exacta del dataset más allá de su nombre.

## Capacidades

- Generación de texto conversacional en inglés con tono casual y natural, gracias al ajuste DPO sobre conversaciones informales.
- Razonamiento y respuesta a preguntas de propósito general heredadas del modelo base Mistral NeMo de 12B.
- Generación de código y matemáticas básicas (capacidad del modelo base, no verificada específicamente en esta cuantización).
- Soporte multilingüe limitado: la model card declara únicamente inglés (`language: en`), aunque el modelo base NeMo soporta más idiomas.
- Compatible con endpoints (tag `endpoints_compatible`) para despliegue en infraestructuras tipo Hugging Face Inference Endpoints.
- Ejecución local mediante llama.cpp y derivados (Ollama, LM Studio, koboldcpp) gracias al formato GGUF.
- No se documenta soporte explícito de tool calling, function calling, agentes multi-paso ni modo thinking en la información disponible.

## Casos de uso

- Asistente conversacional local: el modelo puede gestionar diálogos multi-turno informales ejecutándose en una GPU de consumo con cuantización Q4_K_M (7,6 GB), adecuado para prototipos de chatbots personales sin conexión a la nube.
- Atención al cliente en inglés con tono cercano: el ajuste DPO sobre conversación casual lo hace apropiado para respuestas empáticas y coloquiales en soporte de nivel 1, desplegado on-premise con llama.cpp.
- Generación de contenido conversacional para videojuegos o narrativa interactiva: su estilo informal encaja en NPCs y diálogos ramificados que requieren respuestas naturales y variadas.
- Sustituto local de APIs comerciales en entornos con requisitos de privacidad: al ser Apache 2.0 y ejecutable en hardware propio, permite procesar conversaciones sensibles sin salida de datos.
- Evaluación e investigación de técnicas DPO: sirve como caso de estudio de cómo un ajuste de preferencias sobre un dataset conversacional modifica el comportamiento de un modelo base de 12B.
- Despliegue en estaciones de trabajo con una sola RTX 4090 o RTX 3090: con Q8_0 (13,1 GB) cabe en 24 GB de VRAM y ofrece la máxima calidad de la cuantización, útil para demos y entornos de desarrollo.
- Integración en pipelines de generación de texto por lotes: la variedad de quants permite ajustar el equilibrio calidad/velocidad según el presupuesto de cómputo disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización: Q2_K ~4,9 GB, Q3_K_M ~6,2 GB, IQ4_XS ~6,9 GB, Q4_K_M ~7,6 GB, Q5_K_M ~8,8 GB, Q6_K ~10,2 GB, Q8_0 ~13,1 GB (más overhead de contexto y KV cache).
- GPU recomendadas: RTX 3060 12 GB o RTX 4060 Ti 16 GB para Q4/Q5; RTX 3090, RTX 4090, A100 o H100 para Q8_0 y contextos largos.
- Cabe en GPU de consumo: sí, desde una RTX 3060 12 GB (Q4_K_M) o incluso GPUs de 8 GB con Q3_K_S; para Q8_0 se recomienda 16 GB o más.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, text-generation-webui y cualquier runner compatible con GGUF; el modelo base en safetensors puede servirse con vLLM o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| mistral-nemo-cc-12B-GGUF (este) | 12,2B | no disponible | Apache 2.0 | GGUF | Ajuste DPO conversacional en inglés |
| nbeerbower/mistral-nemo-cc-12B | 12,2B | no disponible | Apache 2.0 | safetensors | Modelo base sin cuantizar del que deriva |
| Mistral NeMo base (Mistral AI/NVIDIA) | 12B | 128K (según documentación pública del modelo base) | Apache 2.0 | safetensors | Modelo generalista original |
| Mistral 7B Instruct | 7,2B | 32K (según documentación pública) | Apache 2.0 | safetensors/GGUF | Alternativa más pequeña y ampliamente cuantizada |

La comparativa se limita a los datos disponibles; no se dispone de resultados de benchmarks de esta cuantización para comparar rendimiento empírico con las alternativas.

## Limitaciones y advertencias

- El ajuste fino está orientado exclusivamente a inglés (`language: en`); el rendimiento en castellano u otros idiomas no está garantizado y probablemente sea inferior al del modelo base.
- Riesgo de alucinación inherente a los modelos de 12B, especialmente en tareas factuales o de razonamiento complejo; el ajuste conversacional puede aumentar la fluidez a costa de la precisión.
- El ajuste DPO sobre conversación casual puede introducir sesgos de estilo (tono coloquial, respuestas largas o excesivamente informales) poco adecuados para contextos profesionales.
- No se documentan evaluaciones de sesgo, toxicidad ni seguridad para este ajuste fino concreto.
- Las cuantizaciones de baja precisión (Q2_K, Q3_K_S) degradan notablemente la calidad; el autor marca Q3_K_M como "lower quality" y recomienda Q4_K_S/Q4_K_M como equilibrio velocidad/calidad.
- No hay cuantizaciones imatrix/ponderadas disponibles para este modelo, lo que limita la calidad máxima alcanzable en tamaños pequeños frente a otros modelos con quants ponderados.
- Aunque la licencia es Apache 2.0 y permite uso comercial, conviene verificar las condiciones del modelo base y del dataset de ajuste antes de un despliegue en producción.
- El contexto máximo efectivo de esta cuantización no se especifica en la model card; debe confirmarse contra la documentación de Mistral NeMo antes de asumir 128K tokens.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/mistral-nemo-cc-12B-GGUF
- Modelo base sin cuantizar: https://huggingface.co/nbeerbower/mistral-nemo-cc-12B
- Página de descargas del autor: https://hf.tst.eu/model#mistral-nemo-cc-12B-GGUF
- Dataset de ajuste: https://huggingface.co/datasets/flammenai/casual-conversation-DPO
- Guía de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
