# inclusionAI/ZwZ2-9B-GGUF

## Resumen

ZwZ2-9B-GGUF es la versión cuantizada en formato GGUF del modelo ZwZ2-9B, un modelo vision-language (VLM) de unos 9 mil millones de parámetros (8.953.803.264 en total según los pesos en safetensors) desarrollado por inclusionAI. Forma parte del proyecto "Zooming without Zooming v2", una línea de investigación centrada en mejorar la percepción multimodal de detalles finos en imágenes sin necesidad de recurrir a mecanismos de zoom externos o recortes de alta resolución, pasando de "ver detalles" a "conectar evidencia" para una percepción multimodal generalizable. El modelo ha sido entrenado con el dataset inclusionAI/ZwZ2-RL-VQA, orientado a preguntas visuales mediante aprendizaje por refuerzo.

La relevancia de esta versión GGUF radica en la portabilidad: permite ejecutar el modelo localmente en CPU o GPU de consumo mediante llama.cpp, con cuantizaciones FP16, Q8_0 y Q4_K_M tanto para el modelo de lenguaje como para el codificador visual y el proyector (componente `mmproj`). Esto lo hace accesible para desarrolladores que necesitan capacidades de imagen-texto a texto sin infraestructura de servidor dedicada.

El modelo se distribuye bajo licencia Apache 2.0, lo que permite su uso comercial sin restricciones significativas, y su pipeline es de tipo image-text-to-text (conversacional).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language model (detalles de arquitectura del LLM no disponibles; requiere build de llama.cpp con soporte multimodal Qwen3.5) |
| Parametros totales | 8.953.803.264 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP16, Q8_0, Q4_K_M (tanto en el LLM como en el vision encoder/mmproj) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (base en safetensors: inclusionAI/ZwZ2-9B) |

## Arquitectura y entrenamiento

ZwZ2-9B sigue el patrón habitual de los modelos vision-language: un modelo de lenguaje base combinado con un codificador visual y un proyector (`mmproj`) que alinean las representaciones de imagen con el espacio del LLM. La model card indica que la inferencia requiere una build reciente de llama.cpp con soporte multimodal "Qwen3.5", lo que sugiere que el modelo de lenguaje se apoya en una arquitectura de la familia Qwen, aunque los detalles concretos (número de capas, mecanismo de atención, longitud de contexto) no están disponibles en la información proporcionada.

El entrenamiento del modelo base incorpora aprendizaje por refuerzo sobre el dataset inclusionAI/ZwZ2-RL-VQA, un conjunto de datos de preguntas visuales (VQA). Según el paper asociado ("Zooming without Zooming v2: From Seeing Details to Connecting Evidence for Generalizable Multimodal Perception", arXiv:2610.37037), la innovación central del proyecto es lograr percepción de detalles finos en imágenes sin depender de mecanismos de zoom o recortes de alta resolución, conectando evidencia dispersa en la imagen para mejorar la generalización de la percepción multimodal. No hay datos disponibles sobre el número de tokens de preentrenamiento ni sobre la composición completa del corpus.

## Capacidades

- Comprensión de imágenes y generación de texto a partir de entrada visual (pipeline image-text-to-text).
- Respuesta a preguntas visuales (VQA), con entrenamiento específico mediante RL sobre el dataset ZwZ2-RL-VQA.
- Percepción de detalles finos en imágenes sin mecanismos de zoom externo, según la metodología del proyecto Zooming without Zooming v2.
- Descripción de imágenes en lenguaje natural (demostrado en los ejemplos de uso de la model card).
- Uso conversacional mediante API compatible con OpenAI a través de `llama-server`.
- Ejecución multimodal en local: combina cuantizaciones independientes del LLM y del vision encoder (se pueden mezclar precisiones distintas entre componentes).
- No hay información disponible sobre tool calling, capacidades de agentes, soporte de audio ni modo de razonamiento extendido (thinking mode).

## Casos de uso

- Descripcion automatica de imagenes: mediante `llama-mtmd-cli` o `llama-server` se puede generar descripciones detalladas de fotografias o documentos visualmente complejos, aprovechando la capacidad del modelo para percibir detalles sin recurrir a zoom.
- Sistemas de VQA locales y privados: al ejecutarse con llama.cpp en hardware de consumo, es adecuado para responder preguntas sobre imagenes en entornos donde la privacidad impide enviar datos a APIs externas (sanidad, legal, documentos internos).
- Indexacion y etiquetado de bibliotecas de imagenes: su capacidad de analisis visual detallado permite generar metadatos y descripciones en lote para catalogos de activos digitales.
- Analisis de documentos y capturas de pantalla: el entrenamiento en VQA con RL lo hace adecuado para extraer informacion de interfaces, graficos e imagenes con texto denso.
- Asistentes multimodales embebidos: gracias al formato GGUF y a cuantizaciones como Q4_K_M, puede integrarse en aplicaciones de escritorio o edge devices con GPU modesta.
- Prototipado rapido de aplicaciones multimodales: la API compatible con OpenAI de `llama-server` permite sustituir un endpoint comercial por inferencia local con cambios minimos de codigo.
- Investigacion en percepcion multimodal: al ser la version abierta de un proyecto de investigacion con paper publicado, sirve como base para reproducir y extender los experimentos de Zooming without Zooming v2.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a la pagina del modelo original (inclusionAI/ZwZ2-9B) para las evaluaciones publicadas, y advierte que la cuantizacion puede afectar a la precision.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; como referencia aproximada para un modelo de 9B de parametros, Q4_K_M requiere del orden de 5-6 GB, Q8_0 en torno a 9-10 GB, y FP16 aproximadamente 18-20 GB, sumando en cada caso la VRAM del componente `mmproj` (menor, pero no cuantificada en la informacion disponible).
- GPU recomendadas: no disponible de forma explicita. Al tratarse de GGUF ejecutable con llama.cpp, funciona en CPU, y en GPUs de consumo del tipo RTX 3060/4060 (Q4_K_M), RTX 4090 (Q8_0 o FP16 parcial) deberia ser viable.
- Consumer GPU: si, es el objetivo principal del formato GGUF; con Q4_K_M cabe en GPUs de gama media con 8 GB de VRAM (estimacion, no dato oficial).
- Opciones de despliegue: llama.cpp es el runtime indicado (`llama-mtmd-cli` para CLI y `llama-server` para servidor con web UI y API compatible con OpenAI). Requiere una build reciente con soporte multimodal Qwen3.5. No hay mencion de soporte para vLLM, TGI ni Ollama en la informacion disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Formato | Licencia | Contexto |
|---|---|---|---|---|---|
| ZwZ2-9B-GGUF | 8,95B | VLM (image-text-to-text) | GGUF (FP16, Q8_0, Q4_K_M) | Apache 2.0 | no disponible |
| Qwen2.5-VL-7B | 7-8B | VLM | Safetensors y GGUF comunitarios | Apache 2.0 | hasta 128K tokens |
| Llama 3.2 Vision 11B | 11B | VLM | Safetensors y GGUF comunitarios | Llama 3.2 Community License | 128K tokens |
| InternVL3-8B | 8B | VLM | Safetensors y GGUF comunitarios | Apache 2.0 | no disponible |

ZwZ2-9B se diferencia de estas alternativas por su enfoque especifico en percepcion de detalles sin zoom (metodologia Zooming without Zooming v2) y por su entrenamiento con RL en VQA. Frente a Llama 3.2 Vision 11B, ofrece una licencia mas permisiva (Apache 2.0 frente a la licencia comunitaria de Meta). Los datos de rendimiento comparativo no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- Idioma: el modelo esta etiquetado solo para ingles (en); no hay garantia de rendimiento en castellano ni otros idiomas.
- La cuantizacion (Q4_K_M, Q8_0) puede degradar la precision respecto al modelo original en FP16, especialmente en tareas de percepcion visual fina, que son precisamente el foco del proyecto.
- Es obligatorio proporcionar el componente `mmproj` correspondiente para la entrada de imagenes; sin el, el modelo no procesa vision.
- No hay datos publicados de benchmarks en la model card de esta version GGUF, por lo que la evaluacion debe hacerse contra la pagina del modelo base o de forma empirica.
- Requiere builds recientes de llama.cpp con soporte multimodal Qwen3.5; versiones antiguas no funcionaran.
- Sesgos conocidos, riesgo de alucinacion y longitud de contexto: no disponible en la informacion proporcionada.
- Licencia Apache 2.0: sin restricciones relevantes para uso comercial, aunque el aviso estandar de la licencia aplica (sin garantias, atribucion de licencia en redistribuciones).

## Enlaces

- Modelo GGUF: https://huggingface.co/inclusionAI/ZwZ2-9B-GGUF
- Modelo base: https://huggingface.co/inclusionAI/ZwZ2-9B
- Coleccion Zooming without Zooming v2: https://huggingface.co/collections/inclusionAI/zooming-without-zooming-v2
- Paper (arXiv): https://arxiv.org/pdf/2610.37037
- Repositorio del proyecto (GitHub): https://github.com/inclusionAI/Zooming-without-Zooming-v2
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Dataset de entrenamiento RL: https://huggingface.co/datasets/inclusionAI/ZwZ2-RL-VQA
