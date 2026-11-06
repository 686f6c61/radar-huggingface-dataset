# JohnRTitor/Qwythos-9B-v2-W4A16

## Resumen

Qwythos-9B-v2-W4A16 es una cuantización INT4 del modelo multimodal `empero-ai/Qwythos-9B-v2`, publicada por el usuario JohnRTitor. Se trata de un checkpoint de pesos cuantizados con TorchAO (`int4_weight_only` / `IntxWeightOnlyConfig`) orientado específicamente a inferencia de baja latencia en TPU de Google Cloud, en concreto el acelerador TPU v5e-1 con 16 GB de HBM. El modelo base es un transformer multimodal de tipo image-text-to-text con 9.780.899.568 parámetros (aproximadamente 9,8 mil millones) y licencia Apache 2.0.

La relevancia de esta publicación es fundamentalmente de despliegue: reduce la huella de pesos de 18,9 GB en BF16 a unos 5,15 GB en INT4, lo que permite cargar el modelo completo en un TPU v5e-1 dejando margen para la caché KV y el estado recurrente. El autor preserva en BF16 el codificador visual (`visual`) y la cabeza de lenguaje (`lm_head`) para no degradar el OCR ni el razonamiento multimodal, una decisión técnica poco habitual en cuantizaciones W4A16 genéricas.

La información disponible sobre el modelo base es escasa: la model card del repositorio cuantizado se centra en los detalles de cuantización y despliegue en TPU, y no documenta la composición del dataset de entrenamiento, los benchmarks ni el proceso de alineación del modelo original. Los datos que se recogen a continuación proceden de los metadatos de Hugging Face y de la model card del checkpoint cuantizado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text); clase `AutoModelForImageTextToText` |
| Parametros totales | 9.780.899.568 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | INT4 W4A16 (TorchAO `int4_weight_only` / `IntxWeightOnlyConfig`, group size 128, simétrico); pesos en INT4, activaciones en BF16; codificador visual y `lm_head` en BF16 |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 11,3 GB; huella de pesos INT4 ~5,15 GB) |

## Arquitectura y entrenamiento

El checkpoint cuantizado mantiene la arquitectura del modelo base `empero-ai/Qwythos-9B-v2`: un transformer multimodal que acepta entradas de imagen y texto y genera texto, cargable mediante `AutoModelForImageTextToText`. La cuantización afecta únicamente a los pesos de las capas lineales, que se empaquetan en INT4 con tamaño de grupo 128 y esquema simétrico, mientras que las activaciones se mantienen en BF16 (W4A16). El codificador visual y la cabeza de lenguaje se conservan en BF16 para preservar la precisión en OCR y en el razonamiento multimodal.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si el modelo base empleó RLHF, DPO u otras técnicas de alineación. Tampoco se documentan innovaciones arquitectónicas específicas del modelo original más allá de su naturaleza multimodal. La innovación destacable de este repositorio es el pipeline de cuantización con TorchAO y su integración con PyTorch/XLA (`torch_xla`) para ejecución en TPU, con un objetivo explícito de encajar en 16 GB de HBM del TPU v5e-1.

## Capacidades

- Generación de texto conversacional (`pipeline_tag: text-generation`, tag `conversational`).
- Procesamiento multimodal de imagen y texto (image-text-to-text), con codificador visual preservado en BF16.
- OCR y extracción de información de imágenes, reforzado por el mantenimiento del codificador visual en precisión completa.
- Razonamiento multimodal, según indica el autor al justificar la preservación de `lm_head` en BF16.
- Inferencia en TPU mediante PyTorch/XLA y `torch_xla.core.xla_model`.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según los metadatos (`language: en`).
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Despliegue de bajo coste en Google Colab: el checkpoint está dimensionado para cargarse en un TPU v5e-1 de 16 GB de HBM, lo que permite prototipar un modelo multimodal de ~9,8B en un entorno gratuito o de bajo coste sin recurrir a GPU de gama alta.
- Procesamiento por lotes de documentos escaneados: al conservar el codificador visual en BF16, el modelo es adecuado para pipelines de OCR y extracción de campos en facturas, formularios o albaranes, ejecutados sobre TPU con throughput agregado.
- Asistentes conversacionales en inglés: la naturaleza conversacional del modelo base y su licencia Apache 2.0 permiten integrarlo en productos de atención al cliente en inglés sin restricciones de uso comercial.
- Clasificación y descripción de imágenes a escala: la cuantización INT4 reduce la huella de memoria, lo que facilita mantener varias instancias o workers en un mismo nodo TPU para tareas de etiquetado y captioning.
- Investigación en cuantización y despliegue en aceleradores: el repositorio sirve como referencia reproducible de un pipeline TorchAO W4A16 con PyTorch/XLA, útil para estudiar el impacto de la cuantización en tareas multimodales.
- Evaluación comparativa de precisión INT4 frente a BF16: al preservar `visual` y `lm_head` en BF16, permite aislar el efecto de la cuantización de pesos en las capas del lenguaje frente al modelo base completo.
- Prototipado de aplicaciones RAG multimodales: combinando entrada de imagen y texto, el modelo puede emplearse para responder preguntas sobre capturas, diagramas o documentos visuales en entornos de demostración sobre TPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/HBM estimada: ~5,15 GB de pesos INT4 más overhead de activaciones BF16, caché KV y estado recurrente; el autor indica que encaja en 16 GB de HBM con unos 8 GB de margen de seguridad.
- Hardware objetivo: Google TPU v5e-1 (16 GB HBM), incluyendo instancias de Google Colab.
- GPU consumer: no se documenta compatibilidad con GPU en la model card; el checkpoint está empaquetado para TorchAO y PyTorch/XLA, no para llama.cpp ni GGUF.
- Opciones de despliegue: PyTorch/XLA con `torch_xla.core.xla_model`, `transformers` (`AutoModelForImageTextToText`, `AutoTokenizer`) y `trust_remote_code=True`.
- vLLM, llama.cpp, Ollama, TGI: no disponibles para este formato de cuantización según la información proporcionada.
- Latencia y throughput: no se proporcionan cifras concretas; el autor describe el objetivo como "ultra-low latency" en TPU v5e-1.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| Qwythos-9B-v2-W4A16 (este) | 9,78B | No disponible | INT4 W4A16 (TorchAO) | Apache 2.0 | TPU v5e-1 |
| empero-ai/Qwythos-9B-v2 (base) | 9,78B | No disponible | BF16 | Apache 2.0 | GPU/TPU genéricos |
| Alternativas de ~9B multimodales | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- El modelo solo declara soporte de inglés; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- La cuantización INT4 puede introducir degradación en tareas sensibles a la precisión numérica; el autor mitiga parcialmente el riesgo manteniendo `visual` y `lm_head` en BF16, pero no publica evaluaciones comparativas frente al modelo base.
- Riesgo de alucinación inherente a los modelos generativos; no se documentan medidas específicas de mitigación en el modelo base.
- Sesgos conocidos: no disponible en la información proporcionada.
- Longitud de contexto no documentada, lo que impide planificar despliegues con ventanas largas sin validación empírica.
- El checkpoint está empaquetado para TPU con TorchAO y PyTorch/XLA; no se ofrece GGUF ni compatibilidad declarada con llama.cpp, Ollama o vLLM, lo que limita su uso en infraestructura GPU convencional.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria de su funcionamiento.
- La licencia Apache 2.0 permite uso comercial, pero el despliegue en TPU de Google Cloud implica costes de infraestructura y dependencia de un proveedor cloud concreto.

## Enlaces

- Repositorio Hugging Face del checkpoint cuantizado: https://huggingface.co/JohnRTitor/Qwythos-9B-v2-W4A16
- Modelo base: https://huggingface.co/empero-ai/Qwythos-9B-v2
- TorchAO (librería de cuantización): no se proporciona enlace en la información disponible
- PyTorch/XLA: no se proporciona enlace en la información disponible
- Papers, blogs o demos adicionales: no disponibles en la información proporcionada
