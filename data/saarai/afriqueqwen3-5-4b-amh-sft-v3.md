# SaarAI/AfriqueQwen3.5-4B-amh-sft-v3

## Resumen

AfriqueQwen3.5-4B-amh-sft-v3 es un ajuste fino supervisado (SFT) del modelo McGill-NLP/AfriqueQwen3.5-4B-50Langs-Instruct-v1, desarrollado por SaarAI con el objetivo de reforzar las capacidades en amárico (am) manteniendo el inglés (en). El modelo parte de la familia Qwen3.5, una arquitectura transformer multimodal de tipo image-text-to-text, y conserva sus 4.539.265.536 parámetros totales (aproximadamente 4,5 mil millones).

El ajuste se ha realizado con Llama Factory en modalidad full-finetune, lo que implica actualizar todos los pesos y no solo adaptadores. El resultado es un checkpoint en safetensors de 9,1 GB, orientado a generación de texto conversacional y compatible con endpoints de inferencia estándar. Su relevancia radica en la escasez de modelos abiertos con cobertura específica del amárico y en la posibilidad de desplegarlo en infraestructura moderada por su tamaño.

La ficha se limita a los datos publicados en la model card y en los metadatos del repositorio; los detalles de composición del dataset de SFT, hiperparámetros y resultados de evaluación no están disponibles en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, pipeline image-text-to-text) |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se listan GGUF ni otras variantes) |
| Idiomas soportados | am (amárico), en (inglés) |
| Licencia | cc-by-4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se construye sobre McGill-NLP/AfriqueQwen3.5-4B-50Langs-Instruct-v1, un checkpoint derivado de Qwen3.5 con cobertura declarada de 50 idiomas. La arquitectura subyacente es un transformer de la familia Qwen3.5, con pipeline image-text-to-text, lo que indica que el modelo base admite entradas de imagen y texto, aunque la model card del ajuste no detalla qué componentes multimodales se han conservado o modificado durante el SFT.

El entrenamiento se realizó mediante full-finetune con Llama Factory sobre datos de SFT en amárico, según los tags del repositorio. No se especifican el número de tokens de entrenamiento, la composición del dataset, la proporción am/en, ni si hubo etapas de RLHF o DPO posteriores. Tampoco se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.) más allá de las propias del modelo base.

## Capacidades

- Generación de texto conversacional en amárico e inglés, con especialización declarada en amárico tras el SFT.
- Razonamiento y respuesta multi-turno, heredados de la variante Instruct del modelo base.
- Procesamiento image-text-to-text según el pipeline declarado, aunque no se detalla el alcance multimodal efectivo tras el ajuste.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües limitadas a los idiomas declarados (am, en); el modelo base cubre 50 idiomas, pero el ajuste se orienta a amárico.
- Modo thinking, visión o audio especiales: no disponible en la información proporcionada.

## Casos de uso

- Atención al cliente en amárico: el modelo puede gestionar conversaciones multi-turno en amárico para soporte de primer nivel, aprovechando el ajuste específico sobre ese idioma y su tamaño contenido para despliegue en una sola GPU.
- Traducción y adaptación amárico-inglés: útil para localización de contenidos, documentación técnica y comunicación interna en organizaciones que operan en Etiopía, con la salvedad de que la calidad debe validarse por hablantes nativos.
- Generación de contenido editorial en amárico: redacción de borradores de artículos, correos y comunicados, con revisión humana posterior para mitigar alucinaciones.
- Asistentes conversacionales integrados en aplicaciones: al ser compatible con endpoints y transformers, puede servirse detrás de una API para chatbots de dominio acotado.
- Procesamiento de documentos con texto e imagen: si se confirma la conservación de las capacidades multimodales del base, podría emplearse para extraer y resumir información de capturas o documentos escaneados en amárico.
- Investigación en PLN de bajos recursos: punto de partida para experimentos de evaluación y ajuste adicional en amárico, dado su tamaño moderado y licencia permisiva.
- Prototipado rápido en entornos con recursos limitados: 4,5 mil millones de parámetros permiten iterar en una GPU de gama alta de consumo con cuantización, aunque no se publican pesos cuantizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: en torno a 9-10 GB solo para pesos, más overhead de activaciones y KV cache; presupuesto práctico de 12-16 GB.
- VRAM estimada con cuantización de 8 bits: aproximadamente 5-6 GB para pesos; con 4 bits, en torno a 3 GB, aunque no se distribuyen pesos GGUF oficiales.
- GPU recomendadas: A100 40 GB, H100, L40S o RTX 4090 para fp16 sin cuantizar; RTX 3090/4080 para cuantización 8 bits.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en bf16 con margen, y en GPUs de 12-16 GB con cuantización.
- Opciones de despliegue: transformers (soporte nativo declarado), vLLM y TGI si la arquitectura qwen3_5 está soportada por esas librerías; llama.cpp/Ollama requerirían conversión a GGUF no publicada.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SaarAI/AfriqueQwen3.5-4B-amh-sft-v3 | 4,54 B | no disponible | am, en | cc-by-4.0 | Gated en Hugging Face |
| McGill-NLP/AfriqueQwen3.5-4B-50Langs-Instruct-v1 (base) | ~4,5 B | no disponible | 50 idiomas | no disponible en esta ficha | Hugging Face |
| Qwen3.5 4B (familia base) | ~4 B | no disponible | multilingüe | no disponible en esta ficha | Hugging Face |

No se dispone de datos de rendimiento comparado ni de especificaciones detalladas de los modelos alternativos en la información proporcionada.

## Limitaciones y advertencias

- Acceso restringido (gated): es necesario aceptar las condiciones en Hugging Face antes de descargar los pesos.
- Sesgos: no documentados; al derivar de un modelo multilingüe entrenado con datos web, es probable que herede sesgos culturales y de representación, especialmente en amárico, donde los corpus son menores.
- Riesgo de alucinación: no evaluado; en idiomas de bajos recursos el riesgo puede ser mayor y requiere validación humana en producción.
- Cobertura idiomática limitada a am y en; el rendimiento en otros idiomas del modelo base no está garantizado tras el SFT.
- Longitud de contexto no documentada: no debe asumirse una ventana concreta sin verificar la configuración del modelo base.
- Licencia cc-by-4.0: permite uso comercial con atribución; conviene revisar también las condiciones del modelo base y de los datos de SFT, no detalladas.
- Sin pesos cuantizados oficiales ni benchmarks publicados: la evaluación previa a producción corre por cuenta del integrador.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema y soporte comunitario inexistentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SaarAI/AfriqueQwen3.5-4B-amh-sft-v3
- Modelo base: https://huggingface.co/McGill-NLP/AfriqueQwen3.5-4B-50Langs-Instruct-v1
- Llama Factory (framework de entrenamiento): https://github.com/hiyouga/LLaMA-Factory
