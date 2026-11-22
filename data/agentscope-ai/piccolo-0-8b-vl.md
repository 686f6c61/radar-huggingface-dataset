# agentscope-ai/Piccolo-0.8B-VL

## Resumen

Piccolo-0.8B-VL es un modelo de lenguaje y visión (image-text-to-text) publicado por agentscope-ai bajo licencia Apache 2.0. Se distribuye como un checkpoint de pesos Safetensors compatible con la librería `transformers` y declara la arquitectura `Qwen3_5ForConditionalGeneration`, lo que lo sitúa en la familia de modelos multimodales derivados de Qwen 3.5. Con 852.985.920 parámetros totales (aproximadamente 0,85 mil millones), es un modelo de escala reducida orientado a tareas de comprensión conjunta de imagen y texto.

El modelo se publica con el pipeline `image-text-to-text`, incluye configuración de visión, plantilla de chat, tokenizador y procesador, y se distribuye en dos ficheros de pesos: un shard principal y `model-frozen-mtp.safetensors`, ambos referenciados por `model.safetensors.index.json`. El repositorio ocupa 1,8 GB.

La relevancia de este lanzamiento radica en su tamaño compacto dentro de la categoría multimodal, lo que permite desplegarlo en hardware modesto, y en su licencia permisiva. No obstante, la model card es extremadamente escueta: no documenta datos de entrenamiento, idiomas, benchmarks ni limitaciones, por lo que la evaluación previa a producción exige pruebas propias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (transformer multimodal con configuración de visión) |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en Safetensors; cuantización GGUF/AWQ no documentada) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (1 shard principal + `model-frozen-mtp.safetensors`, indexados por `model.safetensors.index.json`) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura declarada `Qwen3_5ForConditionalGeneration`, un transformer multimodal que combina un codificador de visión con un decodificador de lenguaje, tal como indica la presencia de una configuración de visión en el checkpoint. El pipeline `image-text-to-text` confirma que la entrada admite imágenes junto con texto y la salida es texto generado.

La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO. Tampoco se documentan innovaciones técnicas específicas (atención lineal, decodificación especulativa u otras). El fichero `model-frozen-mtp.safetensors` sugiere la presencia de componentes de predicción multi-token (MTP) congelados, habituales en arquitecturas derivadas de Qwen, pero su función exacta no está descrita en la model card.

## Capacidades

- Generación de texto condicionada por imagen (image-text-to-text): descripción de imágenes, respuesta a preguntas visuales y razonamiento sobre contenido gráfico.
- Conversación multi-turno: incluye plantilla de chat y procesador, lo que permite diálogos estructurados.
- Procesamiento de entradas multimodales mediante el procesador incluido en el repositorio.
- Compatibilidad con la librería `transformers` y con endpoints compatibles (tag `endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible en la información.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información.
- Capacidades multilingües: no disponible en la información.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información.

## Casos de uso

- Descripción automática de imágenes en catálogos de producto: el modelo puede generar descripciones textuales a partir de fotografías, adecuado por su tamaño compacto que permite procesar lotes en hardware de gama media.
- Respuesta a preguntas sobre documentos escaneados: al aceptar imagen y texto, puede extraer información de capturas o formularios y responder consultas en lenguaje natural.
- Asistencia de accesibilidad: generación de descripciones de imágenes para lectores de pantalla en aplicaciones móviles, donde el reducido número de parámetros facilita la inferencia en el dispositivo o en servidores modestos.
- Moderación de contenido visual: clasificación y descripción de imágenes subidas por usuarios para detectar contenido inapropiado, integrándose en pipelines de revisión.
- Prototipado rápido de aplicaciones multimodales: su licencia Apache 2.0 y su integración con `transformers` permiten experimentar sin restricciones comerciales en fases de I+D.
- Extracción de información de gráficos e infografías: conversión de datos visuales en texto estructurado para su posterior procesamiento, aprovechando la ventana de contexto (no documentada, a validar empíricamente).
- Chatbot de atención al cliente con soporte de imágenes: el usuario puede adjuntar una foto de un producto o error y el modelo responde en el mismo hilo conversacional gracias a la plantilla de chat incluida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 1,7 GB solo para pesos (852.985.920 parámetros × 2 bytes), más overhead de activaciones y del codificador de visión; en la práctica, entre 2,5 y 4 GB según longitud de contexto y tamaño de imagen.
- VRAM estimada en cuantización de 8 bits: alrededor de 0,9 GB de pesos; en 4 bits, alrededor de 0,45 GB. Las cuantizaciones no están publicadas oficialmente, por lo que habría que generarlas.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para FP16; tarjetas como RTX 3060, RTX 4060, RTX 4090, A100 o H100 lo ejecutan con holgura.
- Cabe en GPU de consumo: sí, en modelos con 6 GB o más de VRAM en precisión completa; en cuantización, en GPUs de 4 GB.
- Opciones de despliegue: `transformers` (soporte nativo declarado), y previsiblemente vLLM, TGI o llama.cpp si se generan los formatos correspondientes, aunque no está confirmado en la información.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Piccolo-0.8B-VL | 852.985.920 | no disponible | Apache 2.0 | Arquitectura Qwen3_5, multimodal |
| Qwen2-VL-2B | ~2.000 millones | 32.768 tokens (según documentación pública de Qwen) | Apache 2.0 | Multimodal, mayor tamaño |
| SmolVLM-500M | ~500 millones | 8.192 tokens (según documentación pública) | Apache 2.0 | Multimodal compacto |
| SmolVLM-256M | ~256 millones | 8.192 tokens (según documentación pública) | Apache 2.0 | Multimodal muy compacto |

Los datos de los modelos comparables provienen de documentación pública general y no de la información proporcionada para este modelo; deben verificarse en sus respectivas model cards. No se dispone de benchmarks de Piccolo-0.8B-VL para comparar rendimiento.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos; al ser un modelo derivado de Qwen, es previsible que herede sesgos de sus datos de preentrenamiento, pero no hay confirmación oficial.
- Riesgo de alucinación: no cuantificado; en modelos de 0,8B es habitualmente elevado en tareas de razonamiento complejo, por lo que se recomienda validación humana en producción.
- Longitud de contexto e idiomas soportados no documentados: limita la planificación de despliegues multilingües o con documentos largos.
- Licencia Apache 2.0: permite uso comercial sin restricciones adicionales, pero conviene revisar las obligaciones de atribución y las posibles licencias de los datos de entrenamiento (no documentadas).
- Ausencia de benchmarks y de guía de cuantización: la evaluación de calidad debe realizarse empíricamente antes de adoptar el modelo.
- El fichero `model-frozen-mtp.safetensors` sugiere componentes congelados cuyo comportamiento no está descrito; puede afectar a la reproducibilidad de la inferencia si no se cargan correctamente.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validación mínimo.

## Enlaces

- Hugging Face: https://huggingface.co/agentscope-ai/Piccolo-0.8B-VL
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la información disponible.
