# aisingapore/Qwen-SEA-LION-v5-27B-GGUF

## Resumen

Qwen-SEA-LION-v5-27B-GGUF es la versión cuantizada en formato GGUF del modelo Qwen-SEA-LION-v5-27B, desarrollado por el AI Products Pillar de AI Singapore y financiado por el National Research Foundation de Singapur. Forma parte de la familia SEA-LION (Southeast Asian Languages In One Network), una colección de modelos diseñada específicamente para cubrir las lenguas del sudeste asiático, una región tradicionalmente infrarrepresentada en los grandes modelos lingüísticos de propósito general.

El modelo es un transformer causal con codificador visual, construido sobre la base Qwen3.8-27B, con 27.320.697.856 parámetros totales y una longitud de contexto de 262.144 tokens. Incorpora una cabeza de predicción multi-token (MTP), que se conserva íntegra en los ficheros GGUF, y un codificador visual separado en F16 que habilita la entrada de imágenes. Cubre nueve idiomas: birmano, chino, inglés, indonesio, filipino, malayo, tamil, tailandés y vietnamita.

La relevancia de esta publicación reside en que ofrece el modelo en cuatro niveles de cuantización (F16, Q4_K_M, Q6_K y Q8_0) listos para llama.cpp, lo que rebaja el umbral de hardware necesario para desplegar un modelo de 27B con capacidades multimodales y contexto largo en entornos con recursos limitados. La licencia MIT facilita su adopción comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con codificador visual y cabeza de predicción multi-token (MTP) |
| Parametros totales | 27.320.697.856 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | GGUF F16, Q4_K_M, Q6_K, Q8_0; codificador visual en F16 |
| Idiomas soportados | Birmano, chino, inglés, indonesio, filipino, malayo, tamil, tailandés, vietnamita |
| Licencia | MIT |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo es un transformer causal de 27B parámetros derivado de Qwen3.8-27B, al que AI Singapore ha adaptado para las lenguas del sudeste asiático. La arquitectura incluye una cabeza de predicción multi-token (MTP), una técnica que permite predecir varios tokens por paso y que se mantiene intacta en los ficheros GGUF publicados. El codificador visual se distribuye como un fichero independiente (`mmproj-Qwen-SEA-LION-v5-27B-F16.gguf`, 0,93 GB) que se combina con cualquiera de las cuatro cuantizaciones del modelo lingüístico mediante el parámetro `--mmproj` de llama.cpp.

Los detalles concretos de entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO) no se recogen en la model card de esta versión GGUF; el autor remite a la model card del modelo base `aisingapore/Qwen-SEA-LION-v5-27B` y a la de `Qwen/Qwen3.8-27B` para la información de preentrenamiento y ajuste. Las cuantizaciones se han generado a partir del modelo base sin evaluación independiente posterior.

## Capacidades

- Generación de texto conversacional multi-turno en nueve idiomas del sudeste asiático, además de inglés y chino.
- Comprensión de imágenes mediante el codificador visual separado: descripción de contenido, respuesta a preguntas sobre imágenes y tareas image-text-to-text.
- Modo de razonamiento (thinking) activado por defecto, desactivable mediante `enable_thinking: false` en `chat_template_kwargs`.
- Predicción multi-token (MTP) integrada en los pesos, orientada a acelerar la decodificación.
- Ventana de contexto de 262.144 tokens, adecuada para documentos largos y conversaciones extensas.
- Compatibilidad con la API OpenAI de chat completions a través de `llama-server`, incluyendo entrada de imágenes en base64.
- Interfaz web integrada de llama.cpp para interacción manual con texto e imágenes.

## Casos de uso

- Atención al cliente multilingüe en el sudeste asiático: el modelo puede gestionar conversaciones multi-turno en birmano, indonesio, malayo, tailandés, vietnamita y filipino dentro de una misma infraestructura, gracias a sus 262.144 tokens de contexto que permiten arrastrar historiales largos e información de cuenta.
- Procesamiento de documentación logística y aduanera: con contexto largo y capacidad de entrada de imágenes, puede analizar facturas, conocimientos de embarque o etiquetas escaneadas y responder en el idioma local del operador, como ilustra el ejemplo de exportación de durianes congelados de Medan a Singapur incluido en la model card.
- Extracción de información de documentos escaneados: el codificador visual permite leer formularios, recibos o identificaciones y devolver los campos estructurados en el idioma solicitado, útil en digitalización de archivos administrativos regionales.
- Asistencia técnica en centros de soporte locales: despliegue en llama.cpp sobre servidores modestos para responder consultas en tamil, birmano o filipino, idiomas con escasa cobertura en modelos generalistas.
- Generación de contenido localizado: redacción de materiales de marketing, avisos legales o guiones de formación adaptados a registros y terminología regionales, con la posibilidad de desactivar el modo thinking para reducir latencia en tareas simples.
- Análisis de imágenes en campo: uso con el codificador visual para inspección de productos, clasificación de cultivos o verificación de inventario desde dispositivos con recursos limitados, aprovechando la cuantización Q4_K_M de 16,81 GB.
- Prototipado e investigación en PLN de lenguas del sudeste asiático: la licencia MIT y la disponibilidad en GGUF permiten experimentar con ajuste fino y evaluación sin barreras legales ni de infraestructura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que las cuantizaciones GGUF no se evaluaron por separado y remite a la model card del modelo base y al SEA-LION Leaderboard para los resultados del modelo sin cuantizar.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización: Q4_K_M 16,81 GB; Q6_K 22,43 GB; Q8_0 29,05 GB; F16 54,66 GB. Añadir 0,93 GB si se usa el codificador visual.
- GPU recomendadas: H100 o A100 de 80 GB para F16 con contexto completo; A100 de 40 GB o RTX 6000 Ada para Q8_0; RTX 4090 (24 GB) para Q6_K con margen ajustado y para Q4_K_M con holgura.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) con Q4_K_M y Q6_K; en GPUs de 16 GB como la RTX 4080 solo con Q4_K_M y contexto reducido o descarga parcial a RAM.
- Opciones de despliegue: llama.cpp (`llama-server`) es el soporte nativo documentado; también es compatible con frontends que consumen la API OpenAI. No se documentan integraciones específicas con vLLM o TGI para este formato.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas SEA | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen-SEA-LION-v5-27B-GGUF | 27,3B | 262.144 | 9 | MIT | GGUF (4 niveles) |
| aisingapore/Qwen-SEA-LION-v5-27B | 27,3B | 262.144 | 9 | MIT | BF16 (safetensors) |
| aisingapore/Qwen-SEA-LION-v5-27B-FP8 | 27,3B | 262.144 | 9 | MIT | FP8 |
| aisingapore/Qwen-SEA-LION-v5-27B-INT4 | 27,3B | 262.144 | 9 | MIT | INT4 |

Las alternativas comparables dentro de la información disponible son las otras distribuciones del mismo modelo base; no se dispone de datos sobre modelos de terceros con cobertura equivalente de lenguas del sudeste asiático para establecer una comparación de rendimiento.

## Limitaciones y advertencias

- El modelo no ha sido alineado para seguridad; el autor recomienda realizar ajuste fino de seguridad propio antes de usarlo en producción.
- No se ha probado la robustez frente a prompts adversariales.
- Riesgo de alucinación documentado por el autor, con generación ocasional de contenido irrelevante o ficticio no anclado al contexto.
- La cobertura lingüística se limita a los nueve idiomas declarados; el rendimiento fuera de ellos no está garantizado.
- Las cuantizaciones no se evaluaron por separado, por lo que puede haber degradación respecto al modelo base, especialmente en Q4_K_M.
- El modo thinking está activado por defecto y añade latencia; conviene desactivarlo explícitamente en aplicaciones sensibles al tiempo.
- La licencia MIT permite uso comercial sin restricciones, pero no exime al usuario de las obligaciones de validación y seguridad.
- El codificador visual debe cargarse como fichero independiente; omitirlo desactiva por completo la entrada de imágenes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aisingapore/Qwen-SEA-LION-v5-27B-GGUF
- Modelo base BF16: https://huggingface.co/aisingapore/Qwen-SEA-LION-v5-27B
- Versión FP8: https://huggingface.co/aisingapore/Qwen-SEA-LION-v5-27B-FP8
- Versión INT4: https://huggingface.co/aisingapore/Qwen-SEA-LION-v5-27B-INT4
- Colección SEA-LION v5: https://huggingface.co/collections/aisingapore/sea-lion-v5
- Modelo Qwen3.8-27B original: https://huggingface.co/Qwen/Qwen3.8-27B
- Sitio de SEA-LION: https://sea-lion.ai
- Leaderboard SEA-LION: https://leaderboard.sea-lion.ai/
- Repositorio llama.cpp: https://github.com/ggml-org/llama.cpp
- Texto de la licencia MIT: https://mit-license.org/
