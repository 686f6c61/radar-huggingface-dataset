# inclusionAI/ZwZ2-27B-GGUF

## Resumen

ZwZ2-27B-GGUF es la versión de pesos en formato GGUF del modelo ZwZ2-27B, un modelo multimodal (visión-lenguaje) desarrollado por inclusionAI como parte del proyecto "Zooming without Zooming v2". El modelo base tiene aproximadamente 26.900 millones de parámetros (26.895.998.464 según los pesos en safetensors) y está orientado a tareas de imagen-texto-a-texto, como descripción de imágenes y respuesta visual a preguntas (VQA). El proyecto se apoya en el artículo de investigación "Zooming without Zooming v2: From Seeing Details to Connecting Evidence for Generalizable Multimodal Perception" (arXiv:2610.37037), que aborda el problema de la percepción multimodal de detalles finos sin necesidad de recortes o zoom explícitos sobre la imagen.

Esta publicación en formato GGUF es especialmente relevante para desarrolladores que quieren ejecutar el modelo localmente: los pesos están cuantizados en varios niveles (FP16, Q8_0 y Q4_K_M), tanto para el modelo de lenguaje como para el codificador de visión y el proyector (`mmproj`), y se ejecutan directamente sobre llama.cpp con soporte multimodal. La licencia Apache 2.0 permite su uso comercial sin restricciones significativas, lo que lo convierte en una opción atractiva frente a modelos multimodales cerrados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multimodal (modelo de lenguaje + codificador de visión + proyector); detalle de arquitectura no disponible |
| Parametros totales | 26.895.998.464 (aprox. 26,9 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP16, Q8_0, Q4_K_M (tanto en el LLM como en el componente de visión/mmproj) |
| Idiomas soportados | Ingles (según la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (modelo base en safetensors) |

## Arquitectura y entrenamiento

El modelo se compone de dos partes independientes que se combinan en tiempo de inferencia: por un lado, el modelo de lenguaje; por otro, el codificador de visión junto con su proyector, distribuido como archivo `mmproj`. Ambos componentes se publican en FP16, Q8_0 y Q4_K_M, y la model card indica que se pueden combinar niveles de precisión distintos entre el LLM y el componente de visión (por ejemplo, LLM en Q4_K_M con mmproj en Q8_0). La compatibilidad de inferencia requiere una compilación reciente de llama.cpp con soporte multimodal "Qwen3.5", lo que sugiere que la arquitectura del modelo de lenguaje es compatible con esa familia, aunque la model card no lo detalla explícitamente.

Sobre el entrenamiento, la model card referencia el dataset inclusionAI/ZwZ2-RL-VQA, lo que indica que el modelo incorpora una fase de aprendizaje por refuerzo (RL) centrada en tareas de respuesta visual a preguntas, coherente con la línea de investigación de "Zooming without Zooming v2" sobre percepción multimodal generalizable. No se dispone de datos publicados sobre el número de tokens de preentrenamiento, la composición del corpus ni el uso de técnicas concretas como RLHF o DPO.

## Capacidades

- Comprensión e interpretación de imágenes: entrada de imagen junto con instrucciones en texto (pipeline image-text-to-text).
- Descripción de imágenes y respuesta visual a preguntas (VQA), con ajuste mediante RL sobre el dataset ZwZ2-RL-VQA.
- Percepción de detalles finos en imágenes sin necesidad de recorte o zoom explícito, según la metodología del proyecto Zooming without Zooming v2.
- Generación de texto conversacional en inglés (tag "conversational" en la ficha).
- Inferencia local eficiente gracias a las cuantizaciones GGUF (FP16, Q8_0, Q4_K_M) combinables entre componentes.
- Servible mediante API compatible con OpenAI a través de `llama-server` con interfaz web incluida.
- Tool calling, capacidades de agente y soporte de audio: no disponible (no constan en la model card).

## Casos de uso

- Descripcion automatica de imagenes para accesibilidad: el modelo puede generar descripciones detalladas de fotografias o capturas de pantalla, util para lectores de pantalla o catalogacion de contenido visual.
- Respuesta visual a preguntas (VQA) en dominios especializados: gracias al entrenamiento con RL sobre ZwZ2-RL-VQA, puede responder preguntas concretas sobre el contenido de una imagen, como detalles de documentos, graficos o escenas.
- Analisis de imagenes con detalles finos: la metodologia "Zooming without Zooming" esta orientada a percibir pequenos detalles (texto pequeno, objetos diminutos) sin recortes manuales, util en inspeccion visual automatizada.
- Chat multimodal local y privado: mediante `llama-server` se puede desplegar un asistente conversacional con entrada de imagen en local, sin enviar datos a servicios externos, adecuado para entornos con requisitos de privacidad.
- Integracion en pipelines de procesamiento documental: puede combinarse con OCR o flujos de extraccion de datos para interpretar capturas de documentos, formularios o diagramas.
- Prototipado rapido de aplicaciones multimodales: la CLI `llama-mtmd-cli` permite probar el modelo con imagenes locales en una sola linea de comandos, ideal para evaluacion y desarrollo iterativo.
- Despliegue en servidores con GPU unica: con la cuantizacion Q4_K_M, el modelo puede ejecutarse en hardware de consumo, habilitando casos de uso de vision-lenguaje sin infraestructura de centro de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card remite a la pagina del modelo original (inclusionAI/ZwZ2-27B) para consultar las evaluaciones publicadas, y al paper arXiv:2610.37037 para los resultados de la metodologia.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; por calculo aproximado, un modelo de ~27 B de parametros requiere en torno a 54 GB en FP16, ~29 GB en Q8_0 y ~16 GB en Q4_K_M, sin contar el componente de vision (`mmproj`) ni la KV cache.
- GPU recomendadas: para FP16, A100/H100 (80 GB) o multiples GPU; para Q8_0, A100 40 GB, RTX A6000 o Apple Silicon con memoria unificada suficiente; para Q4_K_M, RTX 4090 (24 GB) o RTX 3090 son opciones viables.
- Cabe en GPU de consumo: si, con la cuantizacion Q4_K_M en GPUs de 24 GB como la RTX 3090 o RTX 4090; con descarga parcial a CPU/RAM tambien es ejecutable en configuraciones mas modestas gracias a llama.cpp.
- Opciones de despliegue: llama.cpp (obligatorio segun la model card, con una compilacion reciente con soporte multimodal Qwen3.5), via `llama-mtmd-cli` para inferencia por CLI y `llama-server` para servir una API compatible con OpenAI con interfaz web. No se menciona soporte para vLLM, TGI u Ollama.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Modalidad |
|---|---|---|---|---|
| ZwZ2-27B-GGUF (este modelo) | ~26,9 B | GGUF (FP16, Q8_0, Q4_K_M) | Apache 2.0 | Imagen-texto a texto |
| Qwen2.5-VL-32B-Instruct | ~32 B | Safetensors / GGUF comunitarios | Apache 2.0 | Imagen-texto a texto |
| InternVL3-26B (Qwen2.5-32B base) | ~26-32 B | Safetensors / GGUF comunitarios | Apache 2.0 (según componentes) | Imagen-texto a texto |
| Gemma 3 27B IT | ~27 B | Safetensors / GGUF oficial | Gemma license | Imagen-texto a texto |

Comparativa orientativa: frente a Gemma 3 27B, ZwZ2-27B ofrece una licencia Apache 2.0 mas permisiva para uso comercial; frente a Qwen2.5-VL-32B, su ventaja diferencial es el entrenamiento con RL orientado a percepcion de detalles finos (Zooming without Zooming v2). No se dispone de numeros de benchmarks para una comparacion cuantitativa directa.

## Limitaciones y advertencias

- Idioma: la model card declara soporte unicamente para ingles; el rendimiento en castellano no esta documentado y puede ser inferior o no estar garantizado.
- La cuantizacion puede afectar a la precision: la propia model card advierte de que los niveles Q8_0 y Q4_K_M pueden degradar la calidad respecto a FP16, y remite a las evaluaciones del modelo original.
- Es necesario usar siempre el componente `mmproj` correspondiente para la entrada de imagen; sin el, el modelo no procesa imagenes.
- Requiere una compilacion reciente de llama.cpp con soporte multimodal Qwen3.5; versiones antiguas no funcionaran.
- Datos de entrenamiento, longitud de contexto y benchmarks especificos: no disponibles en la model card; conviene consultar el paper antes de uso en produccion.
- Riesgo de alucinacion: inherente a los modelos de vision-lenguaje; no hay mitigaciones documentadas en la model card.
- Sesgos conocidos: no disponibles.
- Licencia: Apache 2.0, sin restricciones relevantes para uso comercial.

## Enlaces

- Modelo GGUF: https://huggingface.co/inclusionAI/ZwZ2-27B-GGUF
- Modelo base: https://huggingface.co/inclusionAI/ZwZ2-27B
- Paper (arXiv): https://arxiv.org/pdf/2610.37037
- Repositorio del proyecto (GitHub): https://github.com/inclusionAI/Zooming-without-Zooming-v2
- Coleccion en Hugging Face: https://huggingface.co/collections/inclusionAI/zooming-without-zooming-v2
- Dataset de RL: https://huggingface.co/datasets/inclusionAI/ZwZ2-RL-VQA
- llama.cpp: https://github.com/ggml-org/llama.cpp
