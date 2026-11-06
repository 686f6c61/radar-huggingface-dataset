# mradermacher/VCInspector-7B-GGUF

## Resumen

VCInspector-7B es un modelo vision-language de 7.615.616.512 parámetros (aproximadamente 7,6 mil millones) desarrollado originalmente por dipta007 y publicado en Hugging Face bajo el identificador `dipta007/VCInspector-7B`. Su propósito específico es la evaluación automática de descripciones de vídeo (video captioning) sin necesidad de referencias humanas (reference-free), centrándose en el análisis de fidelidad factual. La versión aquí descrita es la cuantización GGUF realizada por mradermacher, que permite ejecutar el modelo en hardware de consumo mediante llama.cpp y herramientas compatibles.

El modelo se apoya en el artículo arXiv 2509.16538 y emplea el dataset `dipta007/ActivityNet-FG-It` para su entrenamiento y evaluación. La relevancia actual radica en que la evaluación de captions de vídeo tradicionalmente requiere referencias humanas costosas; VCInspector-7B propone un evaluador automático que detecta errores factuales (objetos, acciones, relaciones espacio-temporales) sin depender de ground truth.

La ficha se centra en la distribución GGUF, que incluye cuantizaciones estáticas desde Q2_K hasta f16, además de los ficheros multimodales mmproj necesarios para el procesamiento visual. El repositorio ocupa 70,4 GB en total y acumula 269 descargas en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language transformer (detalles específicos no disponibles en la información proporcionada) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; mmproj en f16 y Q8_0 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); modelo base en safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de su naturaleza vision-language multimodal. El modelo base `dipta007/VCInspector-7B` se distribuye en formato transformers y la versión GGUF conserva la estructura multimodal mediante ficheros mmproj separados (proyector visión-lenguaje) en f16 y Q8_0. El tamaño de 7,6 mil millones de parámetros sugiere un transformer denso de escala 7B, aunque no se especifica la familia arquitectónica concreta (Llama, Qwen, Mistral u otra).

El entrenamiento se asocia al dataset `dipta007/ActivityNet-FG-It`, orientado al análisis factual de captions de vídeo sobre ActivityNet. No se dispone en la información proporcionada de datos sobre número de tokens de entrenamiento, composición exacta del dataset, uso de RLHF/DPO ni innovaciones técnicas específicas (atención lineal, decodificación especulativa, etc.). El paper asociado es arXiv 2509.16538, que constituye la referencia técnica primaria para detalles de entrenamiento.

## Capacidades

- Evaluación reference-free de descripciones de vídeo: analiza un caption frente al contenido visual del vídeo y determina su fidelidad factual sin requerir una referencia humana.
- Análisis factual: detecta errores en objetos, acciones, atributos y relaciones espacio-temporales presentes en el caption.
- Procesamiento multimodal vídeo-lenguaje: acepta entradas de vídeo (o frames) junto con texto.
- Generación de texto conversacional: el tag `conversational` indica soporte para interacción en formato chat.
- Salida estructurada de evaluación: orientado a producir juicios o puntuaciones sobre la calidad factual del caption (formato exacto no disponible).
- Idioma: únicamente inglés.
- No se documenta en la información disponible soporte de tool calling, function calling, agentes multi-paso, matemáticas avanzadas, código ni modos de razonamiento extendido (thinking mode).

## Casos de uso

- Evaluación automática de pipelines de video captioning: integrar VCInspector-7B como métrica de fidelidad factual en un pipeline de generación de captions, sustituyendo o complementando métricas clásicas como BLEU, METEOR o CIDEr que dependen de referencias.
- Control de calidad en datasets de vídeo anotados: filtrar captions con errores factuales (objetos inexistentes, acciones mal descritas) antes de usarlos para entrenar otros modelos.
- Investigación en evaluación de vision-language models: usar el modelo como evaluador de referencia en estudios comparativos de generadores de captions.
- Auditoría de descripciones generadas por modelos de vídeo: detectar alucinaciones factuales en captions producidas por sistemas de video understanding en producción.
- Anotación asistida de datasets: priorizar muestras para revisión humana en función de la puntuación de fidelidad factual emitida por el modelo.
- Despliegue local en estaciones de trabajo: gracias a las cuantizaciones Q4_K_M (4,8 GB) y Q4_K_S (4,6 GB), puede ejecutarse en GPUs de consumo para prototipado e investigación sin infraestructura cloud.
- Evaluación en entornos con requisitos de privacidad: al ejecutarse localmente vía llama.cpp, permite evaluar vídeos sensibles sin enviarlos a APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio GGUF no incluye métricas numéricas; para resultados experimentales debe consultarse el paper arXiv 2509.16538.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos del modelo, sin mmproj ni KV cache):
  - Q2_K: ~3,1 GB
  - Q3_K_S: ~3,6 GB
  - Q4_K_S: ~4,6 GB
  - Q4_K_M: ~4,8 GB
  - Q5_K_M: ~5,5 GB
  - Q6_K: ~6,4 GB
  - Q8_0: ~8,2 GB
  - f16: ~15,3 GB
- Añadir el fichero mmproj: 1,0 GB (Q8_0) o 1,5 GB (f16), más el espacio para el KV cache y los frames de vídeo procesados.
- GPU recomendadas: para cuantizaciones Q4/Q5, GPUs de consumo con 8-12 GB de VRAM (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070). Para Q8_0 o f16, GPUs de 16-24 GB (RTX 4090, A5000, A100 40 GB, H100).
- Cabe en GPU de consumo: sí, en cuantizaciones Q2_K a Q5_K_M con GPUs de 8 GB o más; Q6_K y Q8_0 requieren 8-12 GB según overhead.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama (previa importación), LM Studio, y cualquier runtime compatible con GGUF y mmproj para modelos multimodales. vLLM y TGI no soportan GGUF de forma nativa; para esos runtimes habría que usar el modelo base en safetensors.
- Latencia y throughput: no disponibles en la información proporcionada. Dependerán del número de frames procesados, la longitud del contexto y la GPU empleada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| VCInspector-7B (este) | 7,6 B | No disponible | Evaluación reference-free de captions de vídeo | Apache 2.0 | GGUF, safetensors |
| Modelos de captioning genéricos (p. ej. familia LLaVA-Video) | 7 B aprox. | No disponible | Generación de captions (no evaluación) | Varía | safetensors, GGUF |
| Métricas clásicas (BLEU, CIDEr, METEOR) | No aplica | No aplica | Evaluación con referencia | Varía | No aplica |

No se dispone en la información proporcionada de modelos comparables directos en la categoría específica de evaluación reference-free de captions de vídeo, ni de datos de rendimiento que permitan una comparación cuantitativa. La comparativa con métricas clásicas se incluye por contraste conceptual (referencia frente a reference-free), no por equivalencia de tarea.

## Limitaciones y advertencias

- Idioma: el modelo solo soporta inglés; no se ha validado su comportamiento en castellano u otros idiomas.
- Dominio: entrenado sobre ActivityNet, por lo que su generalización a otros dominios de vídeo (vigilancia, médico, industrial) no está documentada.
- Riesgo de alucinación: como evaluador, puede emitir juicios incorrectos sobre la fidelidad de un caption; no debe usarse como única fuente de verdad sin validación humana en aplicaciones críticas.
- Sesgos: no documentados en la información disponible; se desconoce la composición demográfica y de dominio del dataset de entrenamiento más allá de ActivityNet.
- Contexto: la longitud máxima de contexto no está especificada, lo que limita la planificación de despliegues con vídeos largos.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base y los datos de entrenamiento pueden tener condiciones adicionales que deben verificarse en el repositorio original `dipta007/VCInspector-7B`.
- Cuantizaciones de baja precisión: Q2_K y Q3_K pueden degradar notablemente la calidad de evaluación factual; se recomienda Q4_K_M o superior para uso en producción.
- Multimodalidad en GGUF: requiere cargar el fichero mmproj correspondiente; sin él, el modelo no procesa entradas visuales.
- Repositorio de 70,4 GB: la descarga completa incluye todas las cuantizaciones; conviene descargar solo los ficheros necesarios.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/VCInspector-7B-GGUF
- Modelo base: https://huggingface.co/dipta007/VCInspector-7B
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/VCInspector-7B-i1-GGUF
- Paper: https://arxiv.org/abs/2509.16538
- Dataset: https://huggingface.co/datasets/dipta007/ActivityNet-FG-It
- Página de descargas del autor: https://hf.tst.eu/model#VCInspector-7B-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
