# mradermacher/InternVL3-78B-Instruct-GGUF

## Resumen

InternVL3-78B-Instruct-GGUF es la distribucion en formato GGUF del modelo multimodal InternVL3-78B-Instruct, desarrollado originalmente por OpenGVLab (Shanghai AI Laboratory) y cuantizado por mradermacher. InternVL3 es una familia de modelos vision-language de tipo "native multimodal", es decir, entrenados de forma conjunta sobre texto e imagen desde la fase de preentrenamiento, en lugar de acoplar un codificador visual a un LLM ya entrenado. El modelo base cuenta con 72.699.813.888 parametros (aproximadamente 72,7 B) y esta pensado para tareas que combinan comprension visual, razonamiento, codigo y dialogo multilingue.

Esta publicacion concreta resuelve el problema de desplegar un modelo de ~73 B con capacidades de vision en hardware sin GPUs de datacenter: ofrece cuantizaciones estaticas K-quant desde Q2_K (29,9 GB) hasta Q8_0 (77,4 GB), ademas de los ficheros `mmproj` necesarios para procesar imagenes (Q8_0 de 6,2 GB y f16 de 11,5 GB). Es relevante para desarrolladores que quieren ejecutar inferencia local con llama.cpp u Ollama manteniendo el pipeline multimodal, sin depender de infraestructura en la nube.

La licencia es la de Qwen2.5-72B-Instruct (etiquetada como "qwen" y "other" en Hugging Face), lo que implica condiciones de uso especificas que conviene revisar antes de un despliegue comercial. El repositorio ocupa 537,9 GB en total por acumular todas las variantes de cuantizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-language) con codificador visual y LLM decoder; requiere `custom_code` de InternVL |
| Parametros totales | 72.699.813.888 (~72,7 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj en Q8_0 y f16 |
| Idiomas soportados | multilingue (sin listado detallado en la informacion disponible) |
| Licencia | qwen / other (enlaza a la licencia de Qwen2.5-72B-Instruct) |
| Formato de pesos | GGUF (con ficheros mmproj separados para el codificador visual) |

## Arquitectura y entrenamiento

InternVL3 sigue la linea de InternVL, con un codificador visual (ViT) conectado a un LLM de gran tamano mediante un proyector, pero el entrenamiento se plantea de forma nativa multimodal: el modelo aprende representaciones conjuntas de texto e imagen desde el preentrenamiento, en lugar de unir un vision encoder a un LLM congelado en una fase posterior. En esta distribucion GGUF, el codificador visual se sirve aparte como fichero `mmproj` (Q8_0 o f16), mientras que el LLM se cuantiza con los tipos K-quant habituales de llama.cpp.

No se dispone en la informacion proporcionada del numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplico RLHF o DPO en la fase de instruccion. Tampoco se detalla si InternVL3 incorpora innovaciones como decodificacion especulativa o atencion lineal; la model card del repositorio cuantizado se limita a describir el proceso de cuantizacion (quantize_version 2, salida tensor-quantised, conversion desde HF) y a listar los ficheros generados.

## Capacidades

- Generacion de texto y dialogo conversacional multilingue (etiqueta `multilingual` y `conversational`).
- Comprension de imagenes: al incluir ficheros `mmproj`, el modelo puede procesar entradas visuales junto con texto (VQA, descripcion de imagenes, OCR, analisis de documentos).
- Razonamiento y matematicas: capacidades propias de un LLM de ~73 B en tareas de razonamiento de varios pasos.
- Generacion de codigo: el modelo base InternVL3-78B-Instruct esta orientado a instrucciones generales, incluyendo codigo.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada; el modelo es "Instruct", por lo que acepta instrucciones complejas, pero no se documenta un modo agente especifico.
- Capacidades multilingues: declaradas de forma generica, sin listado de idiomas.
- Modo "thinking" explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Analisis de documentos escaneados: el modelo puede recibir una imagen de pagina y texto de consulta para extraer campos, resumir o responder preguntas, usando el `mmproj` junto con una cuantizacion Q4_K_M (47,5 GB) para equilibrar calidad y VRAM.
- Asistente de soporte con contexto visual: en atencion al cliente donde el usuario envia capturas de pantalla o fotos de producto, el modelo combina la imagen con el historial de conversacion; la cuantizacion Q5_K_M (54,5 GB) es razonable si se dispone de ~64 GB de VRAM.
- Despliegue local en estaciones de trabajo con multiples GPUs: con Q4_K_S (44,0 GB) o IQ4_XS (40,3 GB) se puede ejecutar en 2x RTX 4090 (48 GB) o en una A100 80 GB, permitiendo prototipado sin coste de API.
- Investigacion en vision-language: al estar en GGUF, permite experimentar con llama.cpp y comparar el efecto de la cuantizacion (Q2_K frente a Q8_0) sobre tareas visuales, algo util para estudiar degradacion por cuantizacion.
- Generacion de codigo asistida por capturas: el modelo puede leer una imagen de error o de interfaz y proponer correcciones o snippets, integrable en editores via servidores compatibles con la API de llama.cpp.
- Procesamiento por lotes en CPU/GPU mixto: con Q2_K (29,9 GB) es posible ejecutar el modelo en un servidor con 32 GB de RAM/VRAM y GPU consumer, aunque con perdida notable de calidad; util para tareas de clasificacion o triaje donde la precision no es critica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada (solo pesos del LLM, sin contar overhead de contexto ni el `mmproj`): Q2_K ~30 GB; Q3_K_M ~38 GB; IQ4_XS ~40 GB; Q4_K_M ~47,5 GB; Q5_K_M ~54,5 GB; Q6_K ~64,4 GB; Q8_0 ~77,4 GB.
- El `mmproj` anade 6,2 GB (Q8_0) o 11,5 GB (f16) que deben residir en memoria/VRAM junto con el LLM para tareas de vision.
- GPU recomendadas: A100 80 GB o H100 80 GB para Q6_K/Q8_0; 2x RTX 4090 (48 GB) o A100 80 GB para Q4_K_M; 2x RTX 3090/4090 para IQ4_XS.
- Cabe en GPU consumer: solo en configuraciones multi-GPU (2x RTX 4090 con Q4_K_S) o con cuantizaciones muy agresivas (Q2_K) y offload parcial a RAM; una unica RTX 4090 de 24 GB no es suficiente para el LLM completo.
- Opciones de despliegue: llama.cpp (con soporte `mmproj`), Ollama (si se importa el GGUF y el mmproj), y servidores compatibles con la API de llama.cpp. vLLM y TGI no consumen GGUF de forma nativa; para esos motores habria que usar el modelo original en safetensors.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| InternVL3-78B-Instruct-GGUF (este) | ~72,7 B | no disponible | GGUF + mmproj | qwen / other | Cuantizaciones estaticas K-quant, vision nativa |
| InternVL3-78B-GGUF (mradermacher) | ~72,7 B | no disponible | GGUF + mmproj | qwen / other | Variante base (no Instruct) del mismo autor |
| InternVL3-78B-Instruct-i1-GGUF (mradermacher) | ~72,7 B | no disponible | GGUF + mmproj | qwen / other | Cuantizaciones con imatrix (weighted), mayor calidad a igual tamano |
| OpenGVLab/InternVL3-78B-Instruct (original) | ~72,7 B | no disponible | safetensors | qwen / other | Pesos completos en precision original, requiere transformers con `custom_code` |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- La licencia es la de Qwen2.5-72B-Instruct, con condiciones especificas (etiquetada como "other" y "qwen"); es imprescindible revisar el enlace de licencia antes de uso comercial.
- El repositorio es una cuantizacion no oficial: la calidad puede degradarse respecto al modelo original, especialmente en Q2_K y Q3_K_M (marcado explicitamente como "lower quality" por el autor).
- Las cuantizaciones Q5_K_S en adelante estan divididas en dos partes (`part1of2`/`part2of2`) y deben concatenarse antes de su uso.
- El modelo requiere `custom_code` de InternVL y ficheros `mmproj` separados; no es un GGUF "plug-and-play" en herramientas que no soporten vision.
- Riesgo de alucinacion inherente a los LLM de gran tamano, agravado en tareas visuales con imagenes de baja calidad o documentos densos.
- No se documentan sesgos conocidos, idiomas soportados de forma explicita ni limitaciones de contexto en la informacion disponible.
- El tamano del repo (537,9 GB) y la necesidad de multiples GPUs limitan su uso a entornos con infraestructura considerable.
- El modelo fue creado en mayo de 2025 y actualizado en noviembre de 2026; conviene verificar que la version de llama.cpp soporta la arquitectura InternVL3.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/InternVL3-78B-Instruct-GGUF
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/InternVL3-78B-Instruct-i1-GGUF
- Modelo base original: https://huggingface.co/OpenGVLab/InternVL3-78B-Instruct
- Variante base (no Instruct): https://huggingface.co/mradermacher/InternVL3-78B-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#InternVL3-78B-Instruct-GGUF
- Licencia (Qwen2.5-72B-Instruct): https://huggingface.co/Qwen/Qwen2.5-72B-Instruct/blob/main/LICENSE
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
