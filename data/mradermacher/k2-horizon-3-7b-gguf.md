# mradermacher/K2-Horizon-3.7B-GGUF

## Resumen

K2-Horizon-3.7B es un modelo de lenguaje denso de tipo decoder-only desarrollado por IFM, publicado con licencia Apache 2.0 como parte de una flota abierta de seis modelos que incluye hermanos densos y MoE de mayor tamano. Esta ficha describe la version cuantizada en GGUF publicada por mradermacher, que convierte los pesos originales de IFM/K2-Horizon-3.7B a formatos listos para inferencia local con llama.cpp y herramientas compatibles. El modelo se presenta como una linea base pequena dentro de la familia, evaluada sobre los mismos benchmarks agénticos, de codigo y de razonamiento que el resto de sus hermanos.

La caracteristica mas destacable es su ventana de contexto nativa de 524.288 tokens (512K), activa desde las fases de midtraining, un tamano inusual en un modelo de esta categoria. La arquitectura es un transformer denso, sin mezcla de expertos, con un tamano nominal de 3,7B parametros, aunque los tensores del modelo base suman 5.058.255.360 parametros segun el recuento de safetensors.

El repositorio de mradermacher ofrece unicamente cuantizaciones estaticas (sin imatrix ni weighted quants) en doce variantes que van de Q2_K a f16, pensadas para ejecucion en GPU de consumo. Su relevancia actual radica en combinar contexto muy largo, licencia permisiva y pesos cuantizados faciles de desplegar, aunque la ausencia de resultados de benchmarks publicados limita la evaluacion objetiva de su calidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso |
| Parámetros totales | 3,7B nominales; 5.058.255.360 (5,06B) segun el recuento de safetensors del modelo base |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | 524.288 tokens (512K) nativos desde las fases de midtraining |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (modelo base original en safetensors) |
| Pipeline | no disponible |
| Tamaño del repositorio | 46,0 GB |
| Modelo base | IFM/K2-Horizon-3.7B |
| Datasets de entrenamiento | IFM/K2-Horizon-Pretrain-Data, IFM/K2-Horizon-Midtrain-Data |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso, sin componentes MoE ni arquitecturas hibridas SSM. La innovacion principal declarada es la ventana de contexto nativa de 524.288 tokens, mantenida desde las etapas de midtraining en adelante, frente a los 128K o menos habituales en modelos de tamano comparable. IFM publica ademas checkpoints intermedios de entrenamiento, con el objetivo de permitir el estudio de la evolucion de capacidades a lo largo del proceso y no solo en un unico checkpoint final.

El entrenamiento se realiza sobre dos conjuntos de datos propios, IFM/K2-Horizon-Pretrain-Data e IFM/K2-Horizon-Midtrain-Data, cuya composicion, numero de tokens y proporciones no se detallan en la informacion disponible. Tampoco se especifica si hubo fases de alineacion mediante RLHF, DPO u otras tecnicas de ajuste por preferencias. La model card del modelo base indica que fue evaluado sobre benchmarks de tipo agéntico, de codigo y de razonamiento, los mismos que el resto de la familia K2 Horizon.

La version descrita aqui es una conversion a GGUF realizada por mradermacher mediante cuantizacion estatica (convert_type hf, output_tensor_quantised activado). El autor indica que no hay cuantizaciones ponderadas ni con matriz de importancia (imatrix) disponibles en el momento de publicacion, por lo que la perdida de calidad en las variantes mas agresivas (Q2_K, Q3_K) puede ser mayor que en cuantizaciones calibradas.

## Capacidades

- Generacion de texto conversacional: el modelo incluye la etiqueta conversational y esta orientado a dialogos multi-turno.
- Razonamiento, codigo y tareas agénticas: la model card del modelo base indica evaluacion sobre benchmarks de estas tres categorias, aunque no se publican puntuaciones.
- Contexto largo: ventana nativa de 524.288 tokens, adecuada para procesar documentos extensos o repositorios completos sin truncado agresivo.
- Capacidades multilingues: limitadas al ingles; no se declara soporte de otros idiomas.
- Tool calling y function calling: no confirmado explicitamente en la informacion disponible; la evaluacion en benchmarks agénticos sugiere compatibilidad con flujos de varios pasos, pero no se detalla el formato de herramientas soportado.
- Modo de razonamiento explicito (thinking mode), vision o audio: no disponible en la informacion proporcionada.
- Disponibilidad de checkpoints intermedios para investigacion de la dinamica de entrenamiento.

## Casos de uso

- Procesamiento de documentos largos: con 524.288 tokens de contexto, el modelo puede ingerir contratos, informes anuales o expedientes completos y responder preguntas sobre detalles dispersos en el texto, sin necesidad de fragmentacion ni recuperacion externa.
- Asistente conversacional local: desplegado con Ollama o llama.cpp en una GPU de consumo, permite construir un chatbot privado en ingles que no envia datos a servicios externos, util en entornos con requisitos de confidencialidad.
- Analisis de bases de codigo: la ventana de 512K permite cargar varios ficheros fuente simultaneamente para revision de codigo, deteccion de inconsistencias o generacion de documentacion tecnica a partir del arbol de un repositorio.
- Tareas agénticas y flujos multi-paso: dado que la familia se evalua en benchmarks agénticos, el modelo es un candidato razonable para orquestacion de herramientas en pipelines de automatizacion, siempre que se valide previamente el soporte real de tool calling.
- Extraccion de informacion estructurada: conversion de informes o articulos largos a JSON o tablas, aprovechando el contexto extendido para no perder referencias cruzadas entre secciones.
- Generacion de codigo en desarrollo: integracion en editores o pipelines locales para autocompletado y generacion de funciones, usando las variantes Q4_K_M o Q5_K_M como equilibrio entre calidad y VRAM.
- Investigacion sobre entrenamiento: los checkpoints intermedios publicados por IFM permiten estudiar en que punto del entrenamiento emergen capacidades concretas, algo poco habitual en modelos abiertos.
- RAG con contexto ampliado: al admitir prompts de cientos de miles de tokens, se puede reducir el numero de fragmentos recuperados por consulta y alimentar directamente grandes bloques de contexto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del modelo base menciona evaluacion sobre benchmarks agénticos, de codigo y de razonamiento, pero no incluye cifras concretas, y la ficha del repositorio cuantizado tampoco aporta puntuaciones.

Los unicos datos de rendimiento disponibles son medidas de inferencia sobre la variante BF16 en una RTX 5090 (32 GB), con contexto de 131.072 tokens y cache KV en bf16, ejecutada sobre el fork de llama.cpp de IFM:

| Metrica | Valor medido |
|---|---|
| Decodificacion en un solo flujo | 140-152 tok/s |
| Prefill a 3,9K de contexto | 12.366 tok/s |
| Prueba needle 60K en prompt de 100K | encontrado (100.035 tokens, 36 s extremo a extremo) |
| 4 flujos concurrentes (--parallel 1, en cola) | 151 tok/s agregados |

## Requisitos de hardware

- VRAM estimada segun cuantizacion: Q4_K_M ~3,3 GB; Q4_K_S ~3,1 GB; Q5_K_M y Q5_K_S ~3,7 GB; Q6_K ~4,3 GB; Q8_0 ~5,5 GB; f16 ~10,2 GB. A estas cifras hay que sumar el espacio de la cache KV, que crece linealmente con el contexto.
- GPU recomendadas: cualquier GPU con al menos 8 GB para quants bajos y contextos moderados; RTX 3060 de 12 GB, RTX 4070/4080, RTX 4090 (24 GB) y RTX 5090 (32 GB) pueden ejecutar las variantes de alta calidad.
- Cabe en GPU de consumo: si, con margen amplio en las cuantizaciones Q4_K_M y Q5_K_M. La variante f16 de 10,2 GB tambien cabe en tarjetas de 12 GB o superiores, aunque con contexto limitado.
- Contexto largo: el ejemplo documentado de IFM usa 131.072 tokens con cache KV en bf16 sobre una tarjeta de 32 GB. Explorar el maximo de 524.288 tokens exige mucha mas memoria de cache o tecnicas de cuantizacion de KV.
- Opciones de despliegue: llama.cpp (incluido el fork de IFM para BF16), Ollama y cualquier runtime compatible con GGUF. El soporte en vLLM o TGI no esta confirmado en la informacion disponible, ya que el repositorio declara la libreria transformers pese a distribuir pesos GGUF.
- Latencia y throughput: en RTX 5090 con GGUF BF16 a 131K de contexto se midieron 140-152 tok/s en decodificacion de un unico flujo y 12.366 tok/s de prefill a 3,9K. En cuantizaciones menores el throughput deberia ser igual o superior al reducirse el ancho de banda de memoria requerido.

## Comparativa con modelos similares

La comparacion se limita a especificaciones publicas de modelos densos de tamano parecido; no hay datos de benchmarks de K2-Horizon-3.7B para comparar calidad.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| K2-Horizon-3.7B | 3,7B nominales (5,06B en safetensors) | 524.288 tokens | Apache 2.0 | Hugging Face (IFM) y quants GGUF de terceros |
| Qwen2.5-3B | 3,09B | 32.768 tokens | Apache 2.0 | Hugging Face |
| Llama-3.2-3B | 3,21B | 131.072 tokens | Llama 3.2 Community License | Hugging Face |
| Gemma-2-2B | 2,61B | 8.192 tokens | Gemma Terms of Use | Hugging Face |

El elemento diferenciador de K2-Horizon-3.7B frente a estas alternativas es la ventana de contexto, cuatro veces mayor que la de Llama-3.2-3B y dieciseis veces mayor que la de Qwen2.5-3B, junto con una licencia Apache 2.0 sin restricciones adicionales. En contra, carece de resultados publicados que permitan situarlo en terminos de calidad frente a estos modelos, ampliamente evaluados por la comunidad.

## Limitaciones y advertencias

- Idioma: el modelo solo declara soporte de ingles. Su uso en castellano u otros idiomas no esta validado y probablemente degrade la calidad.
- Alucinacion: al no existir benchmarks publicados, no hay estimaciones de tasa de alucinacion ni comparaciones con alternativas; en tareas de extraccion o respuesta factual conviene validar las salidas.
- Ausencia de datos de evaluacion: la model card menciona evaluaciones agénticas, de codigo y de razonamiento, pero no publica cifras, lo que dificulta justificar su eleccion frente a modelos con resultados verificables.
- Composicion del dataset desconocida: no se detalla el contenido de IFM/K2-Horizon-Pretrain-Data ni de Midtrain-Data, por lo que no se pueden evaluar sesgos de dominio ni de representacion.
- Discrepancia de parametros: el nombre indica 3,7B, pero el recuento de safetensors del modelo base arroja 5.058.255.360 parametros. Conviene verificar el consumo real de memoria antes de dimensionar el despliegue.
- Cuantizaciones estaticas: el autor indica que no hay quants ponderados ni con imatrix, por lo que las variantes Q2_K y Q3_K pueden degradar notablemente la calidad y el comportamiento en contexto largo.
- Contexto de 512K no validado en cuants: las mediciones disponibles corresponden a una variante BF16 con 131K de contexto; no hay evidencia de que las cuantizaciones bajas mantengan un rendimiento fiable mas alla de esa longitud.
- Licencia: Apache 2.0 permite uso comercial sin restricciones adicionales, siempre que se conserve el aviso de licencia y atribucion correspondiente.
- Madurez del repositorio: la ficha registra 0 descargas y 1 like en el repositorio cuantizado, y la fecha de creacion indicada (2026-10-13) resulta inusual; conviene tratar los metadatos con cautela.
- Produccion: antes de desplegar en un sistema real es recomendable validar el formato de plantilla de chat, el soporte real de tool calling y el comportamiento con prompts largos, ninguno de los cuales esta documentado en detalle.

## Enlaces

- Repositorio cuantizado en Hugging Face: https://huggingface.co/mradermacher/K2-Horizon-3.7B-GGUF
- Modelo base: https://huggingface.co/IFM/K2-Horizon-3.7B
- Repositorio GGUF de IFM: https://huggingface.co/IFM/K2-Horizon-3.7B-GGUF
- README del GGUF de IFM: https://huggingface.co/IFM/K2-Horizon-3.7B-GGUF/blob/main/README.md
- Pagina resumen de descargas de mradermacher: https://hf.tst.eu/model#K2-Horizon-3.7B-GGUF
- Receta de despliegue en RTX 5090 (K2-BLACKWELL): https://github.com/abtraore/K2-BLACKWELL/tree/main/recipes/k2-horizon-3.7b-gguf
- Ficha en local-ai-zone: https://local-ai-zone.github.io/models/k2-horizon-3-7b.html
- Ficha en LLM Reference: https://www.llmreference.com/model/k2-horizon-3.7b
- Dataset de pretraining: https://huggingface.co/datasets/IFM/K2-Horizon-Pretrain-Data
- Dataset de midtraining: https://huggingface.co/datasets/IFM/K2-Horizon-Midtrain-Data
- Peticiones de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF de referencia (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre calidad de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
