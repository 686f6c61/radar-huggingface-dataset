# minjaechoi/qwen3p6-35b-a3b-2p02bit-r68

## Resumen

Qwen3p6-35b-a3b-2p02bit-r68 es un checkpoint de investigacion derivado de Qwen/Qwen3.6-35B-A3B, publicado por el usuario minjaechoi en Hugging Face. No se trata de un modelo entrenado desde cero ni de un ajuste fino, sino de una version cuantizada del modelo base: los expertos enrutados de la mezcla de expertos (MoE) se almacenan con una media de 2,0218 bits por peso (identificador interno r68), mientras que el resto de los pesos permanece en BF16. El repositorio ocupa 70,2 GB y declara 35.107.181.936 parametros totales, coherente con un almacenamiento integro en BF16 de aproximadamente 35,1 mil millones de parametros.

La relevancia de esta ficha es doble. Por un lado, ilustra una tecnica poco habitual: en lugar de publicar pesos cuantizados en un formato de bajo bit (GPTQ, AWQ, GGUF), el autor guarda los tensores ya dequantizados en BF16, de modo que el checkpoint se carga con `transformers` estandar o vLLM sin kernels especiales. Por otro, sirve como caso de estudio sobre el limite practico de la cuantizacion agresiva: al no conservar el formato comprimido, el ahorro de memoria desaparece y el modelo sigue requiriendo un entorno de ~70 GB de VRAM.

El modelo se distribuye como "checkpoint de investigacion interna", con 290 descargas, 0 likes y licencia no declarada en los metadatos de Hugging Face (la model card indica que se hereda la del modelo base). No hay informacion publica sobre contexto, idiomas, datos de entrenamiento ni resultados de benchmarks en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con mezcla de expertos (MoE); el tag de arquitectura del repositorio es `qwen3_5_moe` |
| Parametros totales | 35.107.181.936 (~35,1 mil millones) |
| Parametros activos | Aproximadamente 3.000 millones por token segun la nomenclatura "A3B" del modelo base; desglose exacto no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Expertos enrutados a 2,0218 bits de media (ID interno r68); el resto de pesos en BF16. No se publican variantes GGUF, AWQ, GPTQ ni EXL2 |
| Idiomas soportados | no disponible |
| Licencia | no disponible en los metadatos de Hugging Face; la model card indica que se hereda la licencia del modelo base Qwen/Qwen3.6-35B-A3B |
| Formato de pesos | safetensors, con tensores BF16 ya dequantizados |

## Arquitectura y entrenamiento

El modelo base Qwen/Qwen3.6-35B-A3B es una mezcla de expertos de tipo decoder-only: la nomenclatura "35B-A3B" indica 35 mil millones de parametros totales y aproximadamente 3 mil millones activos por token, lo que situa el coste de inferencia muy por debajo del de un modelo denso del mismo tamano. Los tags del repositorio incluyen `qwen3_5_moe` e `image-text-to-text`, lo que sugiere que la familia base incorpora entrada de imagen ademas de texto, aunque no se aporta detalle arquitectonico adicional ni confirmacion explicita en la model card.

Este checkpoint no documenta ningun proceso de entrenamiento: no hay numero de tokens, composicion del dataset, ni fases de RLHF o DPO. La unica innovacion tecnica declarada es el esquema de cuantizacion de los expertos enrutados, que promedian 2,0218 bits por peso, mientras que el resto de la red (atencion, embeddings, normalizaciones, router y expertos compartidos) se mantiene en BF16. Es importante subir que los pesos se guardan ya dequantizados en tensores BF16, por lo que el repositorio no ofrece ninguna reduccion de huella de memoria frente al modelo base en BF16: los 70,2 GB del repo corresponden exactamente a 35,1 mil millones de parametros a 16 bits. La ventaja declarada es la compatibilidad: el modelo carga con `transformers` estandar y con vLLM sin necesidad de kernels de cuantizacion especificos.

## Capacidades

- Generacion de texto y uso conversacional, segun el `pipeline_tag` (`text-generation`) y el tag `conversational` del repositorio.
- Entrada multimodal de imagen y texto, segun el tag `image-text-to-text` del repositorio; no se detalla el alcance real (OCR, VQA, descripcion de imagenes) en la informacion disponible.
- Razonamiento, generacion de codigo y matematicas: capacidades presumiblemente heredadas del modelo base Qwen/Qwen3.6-35B-A3B, pero no verificadas ni documentadas en este checkpoint.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Modo de razonamiento explicito (thinking mode), audio u otras capacidades especiales: no disponible.

## Casos de uso

- Investigacion en cuantizacion extrema de MoE: el checkpoint permite medir la degradacion real de un modelo con expertos enrutados a ~2,02 bits frente a la version BF16 del mismo modelo base, aislando el efecto de la precision en los expertos.
- Analisis de enrutamiento de expertos: al conservar el resto de la red en BF16, se puede estudiar si la cuantizacion agresiva altera la distribucion de tokens entre expertos y provoca colapso o desbalanceo del router.
- Reproduccion de resultados de compresion: util como referencia publica para comparar tecnicas de cuantizacion de expertos (por ejemplo, frente a esquemas de 2 bits con escalas por grupo) sobre una misma base.
- Pruebas de compatibilidad de stack: sirve para validar que un pipeline basado en `transformers` o vLLM carga y sirve correctamente pesos BF16 con expertos originalmente cuantizados, sin kernels adicionales.
- Despliegue experimental en nodos de 80 GB: con dos o cuatro GPUs de 40-80 GB se puede servir el modelo para evaluaciones internas de calidad conversacional antes de decidir una version en produccion.
- Generacion multimodal asistida, si se confirma la capacidad image-text-to-text: tareas de descripcion de imagenes o respuesta a preguntas sobre documentos escaneados en un entorno de investigacion.
- Evaluacion comparativa de coste/calidad: medir si un MoE de 35B con 3B activos y expertos degradados sigue siendo competitivo frente a alternativas densas de ~30B en tareas de codigo o resumen, dentro de un banco de pruebas propio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna tabla de evaluacion (MMLU, HumanEval, GSM8K, MMLU-Pro u otras) ni comparacion con el modelo base sin cuantizar. La busqueda web realizada no devolvio ningun resultado relacionado con este modelo ni con su base: los enlaces recuperados tratan sobre adaptacion de aves urbanas y no guardan relacion con el contenido de esta ficha. En consecuencia, no es posible estimar la perdida de calidad provocada por la cuantizacion a 2,0218 bits de los expertos enrutados.

## Requisitos de hardware

- Peso de los parametros: 70,2 GB en BF16 (35,1 mil millones de parametros a 2 bytes), que es exactamente el tamano del repositorio.
- VRAM estimada para inferencia: del orden de 75-90 GB contando pesos mas cache KV y activaciones; la cifra exacta depende de la longitud de contexto, que no esta documentada.
- GPUs recomendadas: H100 80 GB o A100 80 GB en configuracion de una sola tarjeta (ajustado, con contexto limitado); 2x A100 40 GB, 2x H100 o 4x RTX A6000 48 GB en tensor parallel.
- Consumer GPU: no cabe en tarjetas de consumo. Una RTX 4090 (24 GB) o una RTX 5090 (32 GB) no pueden alojar los 70,2 GB de pesos BF16, y el repositorio no publica variantes GGUF ni de 4 bits listas para usar con llama.cpp.
- Opciones de despliegue: `transformers` estandar y vLLM, segun declara el autor. No se mencionan TGI, Ollama, llama.cpp ni SGLang en la model card.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

Los datos de las alternativas provienen de su documentacion publica y se incluyen a modo de referencia; los de este checkpoint no estan verificados con benchmarks.

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato de pesos |
|---|---|---|---|---|---|
| minjaechoi/qwen3p6-35b-a3b-2p02bit-r68 | 35,1 mil millones | ~3 mil millones (segun nomenclatura A3B) | no disponible | no disponible (hereda la del base) | safetensors BF16 con expertos dequantizados |
| Qwen/Qwen3.6-35B-A3B (base) | 35,1 mil millones | ~3 mil millones | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | safetensors |
| Qwen3-30B-A3B | 30,5 mil millones | 3,3 mil millones | 128.000 tokens (segun documentacion publica de Qwen) | Apache 2.0 | safetensors, GGUF y cuantizaciones de la comunidad |
| Mixtral 8x7B | 46,7 mil millones | 12,9 mil millones | 32.000 tokens (segun documentacion publica de Mistral) | Apache 2.0 | safetensors y GGUF |

Frente a las alternativas, la diferencia principal de este checkpoint no es el rendimiento sino el formato de publicacion: no ofrece GGUF ni cuantizaciones de 4 bits listas para consumo, y su licencia no esta declarada de forma explicita, lo que complica su adopcion en produccion frente a opciones con licencia Apache 2.0.

## Limitaciones y advertencias

- No existe ninguna evaluacion publicada: se desconoce la degradacion real causada por cuantizar los expertos enrutados a 2,0218 bits de media, una precision muy agresiva en la literatura de compresion.
- El propio autor describe el modelo como "checkpoint de investigacion interna", sin garantias de soporte, mantenimiento ni estabilidad de API.
- El repositorio no ahorra memoria respecto al base en BF16, porque los pesos se almacenan dequantizados: quien busque reducir VRAM no obtiene ventaja alguna aqui.
- Licencia no declarada en Hugging Face. La model card afirma que se hereda la del modelo base, pero no se especifica cual es, lo que impide confirmar si el uso comercial esta permitido.
- Riesgo de alucinacion y sesgos: no documentados en este checkpoint ni en su model card; se heredan del modelo base y no han sido auditados.
- Idiomas soportados no disponibles, por lo que no se puede garantizar un comportamiento correcto en castellano.
- Longitud de contexto no disponible, lo que impide planificar aplicaciones que dependan de ventanas largas.
- Traccion muy baja: 0 likes y 290 descargas en el momento de la consulta, con creacion y ultima actualizacion en la misma fecha (2026-10-06), lo que sugiere una publicacion puntual sin revision posterior.
- La informacion de busqueda web recuperada no contiene ningun material relacionado con el modelo, por lo que no hay validacion externa de su calidad ni de su reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/minjaechoi/qwen3p6-35b-a3b-2p02bit-r68
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- No se han encontrado otros enlaces relevantes (papers, blogs, repositorios o demos) en la busqueda web realizada.
