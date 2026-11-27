# mradermacher/WeMM-Ecom-2B-GGUF

## Resumen

WeMM-Ecom-2B-GGUF es la versión cuantizada en formato GGUF del modelo multimodal WeMM-Ecom-2B desarrollado por Tencent. Se trata de un modelo de 1.881.825.088 parámetros (aproximadamente 1,88 mil millones) orientado a conversaciones multimodales en el ámbito del comercio electrónico, construido sobre la arquitectura Qwen3.5 según los tags del repositorio. La cuantización la ha realizado mradermacher, un conocido publicador de versiones GGUF de la comunidad, manteniendo la licencia Apache 2.0 del modelo original.

El modelo resuelve el problema de interacción conversacional multimodal en contextos de e-commerce: atención al cliente, descripción de productos, análisis de imágenes de catálogo y diálogo multi-turno con soporte para chino e inglés. Su tamaño compacto (menos de 2B parámetros) lo hace desplegable en hardware de consumo, lo que resulta relevante para integraciones en producción con presupuesto limitado o en el borde.

Esta ficha cubre específicamente la distribución GGUF, que incluye tanto los pesos del modelo de lenguaje como los ficheros `mmproj` necesarios para el procesamiento multimodal (visión). El repositorio ocupa 19,2 GB en total debido a la multiplicidad de cuantizaciones, aunque cada fichero individual es mucho más pequeño.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (base Qwen3.5, según tags) |
| Parámetros totales | 1.881.825.088 (~1,88 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; mmproj en f16 y Q8_0 |
| Idiomas soportados | zh (chino), en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con ficheros mmproj para visión) |

## Arquitectura y entrenamiento

El modelo base es `tencent/WeMM-Ecom-2B`, un modelo multimodal de aproximadamente 1,88 mil millones de parámetros. Los tags del repositorio indican que se apoya en la familia arquitectónica Qwen3.5, lo que sugiere un transformer decoder-only con un codificador visual acoplado para el procesamiento de imágenes (de ahí los ficheros `mmproj` en la distribución GGUF). La orientación declarada es conversacional y específica de e-commerce.

No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF, DPO u otras técnicas de alineación. Tampoco se documentan innovaciones técnicas específicas (decodificación especulativa, atención lineal, etc.). Estos datos deberían consultarse en la model card del modelo original de Tencent.

La versión aquí descrita es una cuantización estática realizada por mradermacher, con cuantizaciones ponderadas/imatrix disponibles en un repositorio separado (`mradermacher/WeMM-Ecom-2B-i1-GGUF`). No se ha modificado la arquitectura, solo la precisión numérica de los pesos.

## Capacidades

- Generación de texto conversacional multi-turno en chino e inglés.
- Procesamiento multimodal de imágenes mediante los ficheros `mmproj` (f16 o Q8_0), orientado a descripción y análisis de productos.
- Comprensión de contexto de e-commerce: consultas de producto, comparativas, atención al cliente.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas a chino e inglés según los metadatos.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Atención al cliente en tiendas online: el modelo puede gestionar diálogos multi-turno sobre pedidos, devoluciones y disponibilidad de producto en chino e inglés, con un tamaño que permite desplegarlo en servidores modestos.
- Descripción automática de imágenes de catálogo: usando los ficheros `mmproj`, el modelo puede analizar fotos de producto y generar descripciones o etiquetas para fichas de e-commerce.
- Asistente de comparación de productos: dado que está orientado a conversación de comercio, puede responder consultas del tipo "¿qué diferencia hay entre estos dos artículos?" combinando texto e imagen.
- Moderación y clasificación de reseñas: con su ventana conversacional puede procesar reseñas de clientes y clasificarlas o resumirlas en lote mediante inferencia por lotes en llama.cpp.
- Generación de respuestas FAQ: integrado en un backend de soporte, puede responder preguntas frecuentes predefinidas con contexto recuperado (RAG) en inglés y chino.
- Despliegue en el borde o en local: al caber en cuantizaciones de 1,1 a 2,1 GB, es viable en portátiles y dispositivos con GPU de gama media para prototipos o demos de asistentes de compra.
- Traducción de fichas de producto entre chino e inglés: el soporte bilingüe permite localizar descripciones de producto entre ambos idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,5-2,5 GB con cuantizaciones Q4_K_M o Q5_K_M (ficheros de 1,4-1,5 GB) más overhead de contexto; alrededor de 3-4 GB con Q8_0 o f16.
- Los ficheros `mmproj` añaden 0,5 GB (Q8_0) u 0,8 GB (f16) cuando se usa la capacidad multimodal.
- GPU recomendadas: cualquier GPU con 4-6 GB de VRAM es suficiente para las cuantizaciones pequeñas; RTX 3060, RTX 4060, RTX 4090 o superiores ofrecen margen holgado. Para despliegue en servidor, A100/H100 no son necesarias dado el tamaño del modelo.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 4 GB o más, e incluso en CPU con llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama (tras importar el GGUF), y otros runners compatibles con GGUF. Para el modelo original en transformers, vLLM o TGI según soporte de la arquitectura Qwen3.5.
- Latencia y throughput: no disponibles en la información proporcionada; dependerán del hardware y la cuantización.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| WeMM-Ecom-2B (este, GGUF) | ~1,88 B | no disponible | Apache 2.0 | GGUF | Multimodal, orientado a e-commerce, zh/en |
| Qwen2.5-VL-3B | ~3 B | no disponible en esta ficha | Apache 2.0 (según versión) | safetensors, GGUF | Multimodal generalista, mayor tamaño |
| SmolVLM-2B | ~2 B | no disponible en esta ficha | Apache 2.0 | safetensors, GGUF | Multimodal compacto de Hugging Face |

La comparación con alternativas es aproximada: no se dispone de datos de benchmarks del modelo para contrastar rendimiento frente a Qwen2.5-VL o SmolVLM. La ventaja principal de WeMM-Ecom-2B es su especialización declarada en e-commerce y su disponibilidad en múltiples cuantizaciones GGUF listas para usar.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al estar entrenado para e-commerce en chino e inglés, puede reflejar sesgos de catálogo y de dominio comercial.
- Riesgo de alucinación: presente como en cualquier modelo de ~2B; en descripciones de producto puede inventar especificaciones si la imagen o el contexto no son claros.
- Limitaciones de idioma: solo chino e inglés según los metadatos; el rendimiento en castellano no está garantizado.
- Longitud de contexto: no documentada; conviene verificarla en la model card del modelo base antes de usarlo en conversaciones largas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero debe conservarse el aviso de licencia y atribución; verificar la licencia del modelo base de Tencent.
- Caveat de producción: las cuantizaciones Q2_K y Q3_K_S degradan la calidad; para uso real se recomienda Q4_K_M o superior. La capacidad multimodal requiere cargar el fichero `mmproj` correspondiente y un runner que lo soporte.
- El repositorio tiene 19,2 GB totales; descargar solo los ficheros necesarios para evitar consumo innecesario de disco.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/WeMM-Ecom-2B-GGUF
- Modelo base: https://huggingface.co/tencent/WeMM-Ecom-2B
- Licencia del modelo base: https://huggingface.co/tencent/WeMM-Ecom-2B/blob/main/LICENSE
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/WeMM-Ecom-2B-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#WeMM-Ecom-2B-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Análisis de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
