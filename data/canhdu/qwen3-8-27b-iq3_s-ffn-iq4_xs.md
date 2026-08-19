# canhdu/Qwen3.8-27B-IQ3_S-FFN-IQ4_XS

## Resumen

Qwen3.8-27B es un modelo de lenguaje denso y multimodal (visión-lenguaje) desarrollado por el equipo Qwen de Alibaba, diseñado para tareas de codificación, flujos de trabajo agénticos y automatización de oficina. Con 27.320 millones de parámetros y una ventana de contexto nativa de 262.000 tokens, ofrece razonamiento configurable (modo thinking) y capacidades de procesamiento de imágenes y vídeos. Este repositorio en concreto contiene una cuantización GGUF realizada por el usuario canhdu, que aplica una estrategia mixta: IQ4_XS como base, pero con los tensores `ffn_gate` y `ffn_up` cuantizados a IQ3_S y `ffn_down` a IQ4_XS. El resultado es un peso de aproximadamente 12,8 GiB en VRAM, frente a los 14,3 GiB de la cuantización IQ4_XS estándar de Unsloth, lo que permite ampliar el contexto útil en GPUs de consumo.

La relevancia de esta cuantización radica en su capacidad para ejecutar un modelo de 27B multimodal en hardware de gama media (por ejemplo, una RTX 5070 de 12 GB combinada con una RTX 4060 de 8 GB), manteniendo una velocidad de generación aceptable (60 tokens/s iniciales, 35-40 tokens/s con contexto de 100K) gracias al uso de decodificación especulativa con multi-token prediction (MTP). La licencia Apache-2.0 permite uso comercial sin restricciones adicionales, lo que la convierte en una opción atractiva para despliegues locales y prototipos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (vision-lenguaje) |
| Parametros totales | 27.320.697.856 (~27,3B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.000 tokens (nativo); 100.096 tokens probados con MTP en esta cuantizacion |
| Tipos de cuantizacion | IQ4_XS base; `ffn_gate` y `ffn_up` en IQ3_S; `ffn_down` en IQ4_XS; `token_embd` en q8_0; `attn_v` en q5_k; resto de atencion en q4_k |
| Idiomas soportados | No disponible en la informacion del repo; el modelo base Qwen3.8 es multilingue (incluye ingles, chino y otros) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (archivo unico con cuantizacion mixta por tensor) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso de 27B parametros con arquitectura multimodal nativa: procesa tanto texto como imagenes y videos sin necesidad de adaptadores externos. Incorpora un mecanismo de razonamiento configurable (modo thinking) que permite alternar entre respuestas rapidas y razonamiento profundo paso a paso, similar a otros modelos de la familia Qwen3. La ventana de contexto nativa es de 262.000 tokens, lo que lo habilita para tareas de largo alcance como analisis de documentos extensos o conversaciones multi-turno prolongadas. El entrenamiento del modelo base no se detalla en la informacion proporcionada, pero por la linea de Qwen se asume un pipeline con datos multimodales, ajuste supervisado y refinamiento por preferencias (RLHF/DPO).

La cuantizacion de este repositorio se realizo con `llama-quantize` utilizando una importance matrix compuesta por una mezcla de archivos de mradermacher y ubergarm (proporcionada por cHunter789). La estrategia de cuantizacion es mixta por tensor: los tensores de la puerta FFN (`ffn_gate`) y de actualizacion (`ffn_up`) se cuantizan a IQ3_S, mientras que `ffn_down` se mantiene en IQ4_XS. Esto reduce el peso total en aproximadamente 1,4 GiB respecto a una IQ4_XS uniforme, a costa de una posible perdida menor de precision en las proyecciones de la red feed-forward. El autor tambien aplica cuantizaciones especificas a los tensores de atencion (q4_k y q5_k) y al embedding (q8_0). No se ha publicado informacion sobre el dataset de entrenamiento de la cuantizacion, ya que se trata de una conversion de pesos, no de un entrenamiento nuevo.

## Capacidades

- Generacion de texto y razonamiento: soporta tanto respuestas directas como modo thinking con razonamiento paso a paso (configurable via parametros de inferencia).
- Codificacion: el modelo base esta optimizado para tareas de programacion, incluyendo generacion, explicacion y depuracion de codigo.
- Vision multimodal: procesa imagenes y videos, permitiendo analisis visual, descripcion de escenas y respuesta a preguntas sobre contenido visual.
- Tool calling y function calling: el modelo base soporta invocacion de herramientas externas, lo que lo hace apto para flujos agénticos.
- Agentes y razonamiento multi-paso: disenado para tareas de larga duracion con planificacion y manejo de retroalimentacion del entorno.
- Multilingue: el modelo base Qwen3.8 soporta multiples idiomas, aunque no se especifican los idiomas exactos en la informacion del repo.
- Decodificacion especulativa: la cuantizacion se ha probado con MTP (multi-token prediction) y ngram, acelerando la generacion en hardware limitado.

## Casos de uso

- Asistente de programacion local: el modelo puede integrarse en un IDE o CLI para autocompletar codigo, explicar fragmentos y sugerir refactorizaciones. Su tamaño de 27B y la cuantizacion IQ3_S/IQ4_XS permiten ejecutarlo en una estacion de trabajo con una GPU de 12 GB, evitando la dependencia de servicios en la nube.
- Automatizacion de oficina: gracias a su capacidad multimodal, puede procesar capturas de pantalla, PDFs escaneados o imagenes de documentos para extraer informacion, generar resumenes o rellenar plantillas. La ventana de contexto de 100K tokens (con MTP) permite manejar documentos extensos sin fragmentacion.
- Agente de soporte tecnico: con tool calling, puede consultar bases de conocimiento, ejecutar comandos en un entorno controlado y mantener conversaciones multi-turno con contexto largo, adecuado para sistemas de atencion al cliente internos.
- Analisis de imagenes medicas o tecnicas: el modelo base procesa imagenes de alta resolucion; esta cuantizacion permite desplegarlo en entornos con recursos limitados para tareas de clasificacion o descripcion de imagenes en tiempo real.
- Investigacion academica: para investigadores que necesiten un modelo multimodal de 27B con licencia permisiva, esta cuantizacion ofrece un balance entre calidad y requisitos de hardware, permitiendo experimentos locales sin acceso a clusters.
- Prototipado de agentes web: con su capacidad de razonamiento multi-paso y manejo de retroalimentacion, puede usarse para construir agentes que naveguen por interfaces web, rellenen formularios o ejecuten tareas de scraping, ejecutandose en una GPU consumer.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor de la cuantizacion reporta datos de rendimiento en hardware especifico: con una RTX 5070 (12 GB) y una RTX 4060 (8 GB) usando memoria unificada, y con contexto de 100.096 tokens, la generacion comienza en aproximadamente 60 tokens/s y desciende a 35-40 tokens/s a medida que se llena el contexto. No hay cifras comparativas de calidad (MMLU, HumanEval, GSM8K) para esta cuantizacion concreta. Para evaluar la degradacion respecto al modelo original, se recomienda ejecutar pruebas propias en las tareas objetivo.

## Requisitos de hardware

- VRAM estimada: ~12,8 GiB para el modelo cuantizado (segun el autor), lo que permite ejecutarlo en GPUs de 12 GB o menos si se combina con memoria unificada o se reduce el contexto.
- GPUs recomendadas: el autor ha probado la configuracion con una RTX 5070 (12 GB) y una RTX 4060 (8 GB) usando `GGML_CUDA_ENABLE_UNIFIED_MEMORY=1` y reparto de tensores (`-sm tensor -ts 1.66,1`). Tambien deberia caber en una RTX 4090 (24 GB) o una RTX 3090 (24 GB) con contexto amplio.
- Si cabe en consumer GPU: si, en GPUs de 12 GB o superiores, aunque para contexto muy largo puede requerir dos GPUs o memoria unificada.
- Opciones de despliegue: llama.cpp (llama-server), Ollama (si se convierte a formato compatible), y potencialmente otros motores que soporten GGUF. No es directamente compatible con vLLM sin conversion a otro formato.
- Latencia y throughput: 60 tokens/s al inicio, 35-40 tokens/s con contexto de 100K y MTP activado, medido en la configuracion mencionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | VRAM (cuantizado) | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B (esta cuantizacion) | 27,3B | 262K nativo (100K probado) | ~12,8 GiB | Apache-2.0 | Cuantizacion mixta IQ3_S/IQ4_XS, multimodal |
| Qwen3.8-27B (Unsloth IQ4_XS) | 27,3B | 262K nativo | ~14,3 GiB | Apache-2.0 | Cuantizacion uniforme IQ4_XS, mayor precision pero mas VRAM |
| Qwen3.8-27B (BF16 original) | 27,3B | 262K nativo | ~54,6 GiB | Apache-2.0 | Peso original, calidad maxima, requiere GPU profesional |

No se dispone de datos de benchmarks comparativos entre estas variantes. La eleccion entre ellas depende del equilibrio entre calidad y recursos: la cuantizacion de canhdu sacrifica precision en los tensores FFN para reducir VRAM, mientras que la version de Unsloth mantiene una cuantizacion mas uniforme a costa de mayor uso de memoria.

## Limitaciones y advertencias

- La cuantizacion mixta (IQ3_S en `ffn_gate` y `ffn_up`) puede degradar la calidad en tareas que dependen fuertemente de la precision numerica, como matematicas complejas o razonamiento logico extenso. Se recomienda validar en el caso de uso concreto.
- El modelo base es multimodal, pero la cuantizacion de los tensores de vision no se detalla; es posible que la calidad de procesamiento de imagenes se vea afectada.
- No se ha publicado informacion sobre sesgos especificos del modelo base. Como cualquier modelo entrenado con datos web, puede reflejar sesgos sociales, culturales o de genero presentes en los datos de entrenamiento.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; en tareas de codigo o hechos factuales, se recomienda verificacion externa.
- La ventana de contexto de 262K tokens es nativa, pero en esta cuantizacion solo se ha probado hasta 100K tokens con MTP; contextos mayores pueden requerir mas VRAM o degradar el rendimiento.
- Licencia Apache-2.0 permite uso comercial, pero se debe mantener la atribucion y no se ofrece garantia explicita del autor de la cuantizacion.
- Para produccion, es imprescindible probar la calidad de la cuantizacion en el dominio especifico antes de desplegar.

## Enlaces

- Repositorio de la cuantizacion: https://huggingface.co/canhdu/Qwen3.8-27B-IQ3_S-FFN-IQ4_XS
- Modelo base en Hugging Face: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio oficial de Qwen3.8-27B en GitHub: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Ficha en LM Studio: https://lmstudio.ai/models/qwen3.8
- Guia en Jetson AI Lab: https://www.jetson-ai-lab.com/models/qwen3-8-27b/
- Blog de analisis (lovableapp.org): https://lovableapp.org/blog/qwen3-8-27b
