# matfyzacek/Llama-3.1-8B-Q4_K_M-GGUF

## Resumen

Este repositorio contiene una conversión a formato GGUF del modelo meta-llama/Llama-3.1-8B, un transformer decoder-only denso de 8 030 261 312 parámetros desarrollado por Meta. La conversión la ha realizado el usuario matfyzacek mediante la herramienta gguf-my-repo, con la única cuantización Q4_K_M publicada, lo que reduce el peso de los pesos a un fichero de aproximadamente 4,9 GB frente a los ~16 GB del checkpoint original en safetensors.

El interés práctico de esta ficha es que se trata del checkpoint base (preentrenado), no de la variante Instruct: no está ajustado a instrucciones, por lo que su uso natural es la continuación de texto, el ajuste fino posterior y la experimentación sobre cuantización, no el diálogo directo. La cuantización Q4_K_M permite ejecutar el modelo en GPU de gama media e incluso en CPU con 8 GB de RAM, con una pérdida de precisión moderada respecto a los pesos en FP16.

No se publican evaluaciones propias en el repositorio: cero descargas, cero likes y ninguna tabla de benchmarks. La model card se limita prácticamente al texto completo de la licencia Llama 3.1 Community License, por lo que buena parte de las especificaciones técnicas se heredan de la documentación oficial del modelo base de Meta y se indican como tal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.1), con RoPE y atención de consultas agrupadas (GQA) |
| Parametros totales | 8 030 261 312 (8,03 mil millones) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | 128 000 tokens según la documentación del modelo base Llama 3.1; la model card de este repositorio no lo explicita |
| Tipos de cuantizacion | GGUF Q4_K_M (única publicada); el modelo base está en FP16/BF16 |
| Idiomas soportados | en, de, fr, it, pt, hi, es, th (8 idiomas declarados en las etiquetas) |
| Licencia | Llama 3.1 Community License |
| Formato de pesos | GGUF (repo de 4,9 GB); el modelo base se distribuye en safetensors |
| Pipeline | text-generation |
| Libreria declarada | transformers (las etiquetas incluyen llama-cpp y gguf) |
| Tamano del repositorio | 4,9 GB |

## Arquitectura y entrenamiento

La arquitectura corresponde al transformer decoder-only de Llama 3.1: 32 capas, atención de consultas agrupadas con 8 cabezas de clave/valor frente a 32 cabezas de consulta, embeddings rotatorios (RoPE), normalización RMSNorm y tokenizador BPE con vocabulario de 128 000 entradas. El modelo base fue preentrenado por Meta sobre más de 15 billones de tokens según su documentación pública, con un corte de conocimiento situado en diciembre de 2023. Las variantes Instruct de la familia incorporan ajuste supervisado seguido de RLHF y DPO; este repositorio, en cambio, parte del checkpoint base, que no incluye esas fases de alineación.

La aportación de este repositorio es exclusivamente la conversión de formato: el pipeline gguf-my-repo transforma los pesos de safetensors a GGUF con cuantización Q4_K_M, un esquema k-quant de 4 bits por peso en el que determinados tensores (por ejemplo, proyecciones de atención y de la red feed-forward) se mantienen a mayor precisión para limitar la degradación. No se documenta ningún entrenamiento adicional, destilado ni ajuste específico por parte del autor de la conversión, ni se especifican los parámetros exactos del proceso de cuantización más allá del identificador Q4_K_M.

## Capacidades

- Generación de texto por continuación: al ser un checkpoint base, su comportamiento nativo es la compleción de secuencias, no el seguimiento de instrucciones.
- Capacidades multilingües en los ocho idiomas declarados (inglés, alemán, francés, italiano, portugués, hindi, español y tailandés), con dominio claramente superior del inglés.
- Generación de código y de texto técnico, aprovechable como base de autocompletado tras un ajuste específico.
- Razonamiento básico y tareas de conocimiento general, limitadas por el tamaño de 8B y por la ausencia de alineación.
- Punto de partida para ajuste fino: admite LoRA, QLoRA y ajuste completo, y sirve como base para crear variantes Instruct o de dominio.
- Capacidad de contexto largo heredada del modelo base (hasta 128 000 tokens), condicionada por el coste de memoria de la caché KV.
- No dispone de modo de razonamiento explícito (thinking mode), visión, audio ni otras modalidades.
- El soporte de tool calling o function calling no está garantizado en el checkpoint base: requiere usar la variante Instruct o un ajuste posterior.
- Despliegue local offline, sin envío de datos a servicios externos.

## Casos de uso

- Ajuste fino de dominio con LoRA o QLoRA: el checkpoint base es un punto de partida razonable para especializar el modelo en terminología jurídica, médica o industrial; conviene afinar sobre los pesos en FP16 y cuantizar después para no acumular pérdida de precisión.
- Generación de datos sintéticos y aumentación de corpus: se puede usar para producir texto multilingüe a escala destinado a entrenar modelos más pequeños, con revisión humana posterior para filtrar alucinaciones.
- Autocompletado de código en editor local: integrado mediante llama.cpp u Ollama, ofrece sugerencias de continuación de fragmentos sin enviar el código a la nube, útil en entornos con requisitos de confidencialidad estrictos.
- Investigación sobre cuantización: comparar la salida de Q4_K_M frente a Q8_0, Q5_K_M o FP16 en tareas concretas permite medir la degradación real de las k-quants en un modelo de 8B.
- Procesamiento de documentos largos: con la ventana de 128 000 tokens del modelo base se pueden resumir o extraer información de informes extensos, aunque al no estar ajustado a instrucciones conviene formular la tarea como continuación de texto o añadir un ajuste ligero.
- Despliegue en hardware de gama media o portátil: con ~4,9 GB de pesos, el modelo cabe en GPU de 8-12 GB y en equipos Apple Silicon de 16 GB unificados, lo que permite prototipos y demos totalmente offline.
- Base para destilación y evaluación académica: sirve como profesor en experimentos de destilación hacia modelos de 1-3B o como referencia en estudios comparativos entre familias de modelos abiertos.
- Preprocesamiento y etiquetado por lotes: clasificación aproximada, expansión de consultas o generación de variantes de texto en pipelines internos donde no se requiere calidad conversacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye ninguna tabla de evaluación (MMLU, HumanEval, GSM8K u otros), no registra descargas ni valoraciones y la model card se limita al texto de la licencia. Tampoco se documentan mediciones de latencia o throughput para esta conversión concreta.

## Requisitos de hardware

- Pesos en Q4_K_M: aproximadamente 4,9 GB, el tamaño exacto del repositorio.
- VRAM estimada para inferencia: en torno a 5,5-7 GB con contexto moderado (8 000 tokens) y caché KV en FP16; con contexto muy largo la caché domina el consumo.
- Estimación de caché KV para la arquitectura del modelo base: del orden de 0,13 GB por cada 1 000 tokens en FP16 (32 capas, 8 cabezas KV, dimensión de cabeza 128, dos tensores K y V).
- GPU de consumo compatibles: RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090 y equivalentes; en GPU de 8 GB (RTX 3070, RTX 4060 Ti) cabe reduciendo la longitud de contexto.
- Aceleradores profesionales: A100 40/80 GB, H100, L40S; en estos casos el modelo queda muy sobredimensionado en memoria y el cuello de botella pasa a ser el ancho de banda.
- Apple Silicon: equipos con 16 GB de memoria unificada o más (M1/M2/M3 Pro y superiores) mediante Metal.
- CPU: ejecutable con llama.cpp con 8 GB de RAM libre o más, a velocidades de pocos tokens por segundo.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama, LM Studio, koboldcpp, llama-cpp-python y text-generation-webui; vLLM puede cargar GGUF, pero rinde mejor con safetensors.
- Latencia y throughput: no disponibles; el repositorio no publica mediciones y no se han encontrado referencias en la búsqueda web.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / disponibilidad | Notas |
|---|---|---|---|---|---|
| Llama-3.1-8B Q4_K_M (este repo) | 8,03 mil millones | 128 000 tokens (modelo base) | Llama 3.1 Community License | GGUF, 4,9 GB | Checkpoint base, no instruct; sin benchmarks ni adopción registrada |
| meta-llama/Llama-3.1-8B-Instruct | 8,03 mil millones | 128 000 tokens | Llama 3.1 Community License | safetensors y GGUF (comunidad) | Misma arquitectura, con ajuste a instrucciones; opción preferible para diálogo y tool calling |
| Mistral-7B-Instruct-v0.3 | ~7,25 mil millones | 32 000 tokens | Apache 2.0 | safetensors y GGUF | Licencia permisiva y contexto menor; sin cláusula de usuarios activos |
| Qwen2.5-7B-Instruct | ~7,6 mil millones | 128 000 tokens | Apache 2.0 | safetensors y GGUF | Contexto equivalente con licencia permisiva y buen soporte multilingüe |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada, por lo que la tabla se limita a parámetros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Es un checkpoint base, no ajustado a instrucciones: no sigue peticiones conversacionales de forma fiable y no debe usarse directamente como asistente sin ajuste previo o sin recurrir a Llama-3.1-8B-Instruct.
- Ausencia total de evaluación: no hay benchmarks, métricas de calidad ni pruebas de regresión publicadas para esta cuantización.
- Conversión de terceros: no la ha realizado Meta, no está verificada oficialmente y el repositorio registra cero descargas y cero valoraciones, por lo que no hay evidencia de uso en producción.
- Licencia Llama 3.1 Community License: permite uso comercial con condiciones, exige incluir el texto de la licencia, mostrar la atribución "Built with Llama" y nombrar los modelos derivados empezando por "Llama"; si el producto supera los 700 millones de usuarios activos mensuales se necesita una licencia adicional de Meta.
- Obligación de cumplir la Acceptable Use Policy de Llama 3.1, que restringe determinados usos.
- Pérdida de precisión por cuantización de 4 bits: puede degradar tareas sensibles a matices, matemáticas o código; conviene validar la tarea concreta antes de desplegar.
- Consumo de memoria de la caché KV: usar la ventana completa de 128 000 tokens exige decenas de GB adicionales en FP16, muy por encima de lo que sugiere el tamaño del fichero.
- Sesgos heredados del corpus de preentrenamiento, mayoritariamente en inglés y de origen web, con posible infrarrepresentación del español, el hindi o el tailandés.
- Riesgo de alucinación alto: al no estar alineado, el modelo puede generar afirmaciones falsas con total fluidez y sin señales de duda.
- Corte de conocimiento en diciembre de 2023 (según la documentación del modelo base): no conoce hechos posteriores.
- Idiomas fuera de los ocho declarados: sin garantía de calidad.

## Enlaces

- Repositorio de esta cuantizacion: https://huggingface.co/matfyzacek/Llama-3.1-8B-Q4_K_M-GGUF
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B
- Variante ajustada a instrucciones de la misma familia: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Pagina oficial de Llama: https://llama.meta.com/
- Descarga y documentacion de Llama 3.1: https://llama.meta.com/llama-downloads
- Politica de uso aceptable: https://llama.meta.com/llama3_1/use-policy
- Articulo tecnico de la familia Llama 3: https://arxiv.org/abs/2407.21783
- Repositorio de llama.cpp (ejecucion de GGUF): https://github.com/ggml-org/llama.cpp
- Herramienta de conversion gguf-my-repo: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Nota: la busqueda web realizada no devolvio resultados utiles (unicamente paginas de inicio de sesion de Google y articulos de ayuda de Gmail), por lo que los enlaces anteriores proceden de la informacion del repositorio y de la documentacion publica del modelo base.
