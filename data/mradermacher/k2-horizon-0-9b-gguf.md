# mradermacher/K2-Horizon-0.9B-GGUF

## Resumen

K2-Horizon-0.9B-GGUF es un conjunto de cuantizaciones en formato GGUF del modelo IFM/K2-Horizon-0.9B, generadas por mradermacher. El modelo base es un transformer denso de aproximadamente 1.078 millones de parametros (1,08 B) orientado a razonamiento y etiquetado por su autor como resultado de destilacion de conocimiento (knowledge-distillation) sobre un modelo mayor. Esta ficha describe la version cuantizada, que es la que se distribuye en este repositorio.

La relevancia de esta publicacion es practica: mradermacher ofrece doce variantes de cuantizacion que van desde Q2_K (0,5 GB) hasta f16 (2,3 GB), lo que permite ejecutar el modelo en hardware muy modesto, incluidos equipos sin GPU dedicada y dispositivos de borde. Al estar publicado bajo licencia Apache-2.0, es apto para uso comercial sin las restricciones habituales de otros modelos pequenos.

Los idiomas declarados son ingles y chino, y el pipeline conversacional sugiere un ajuste orientado a dialogo. No se dispone de informacion publicada sobre la arquitectura interna exacta, la longitud de contexto, el volumen de datos de entrenamiento ni resultados de benchmarks en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (segun el tag `dense` del autor); detalle interno no disponible |
| Parametros totales | 1.078.285.824 (1,08 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | x-f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (multiples ficheros, un unico fichero por cuantizacion) |

Detalle de las cuantizaciones publicadas:

| Tipo | Tamano (GB) | Notas del autor |
|---|---:|---|
| Q2_K | 0,5 | - |
| Q3_K_S | 0,6 | - |
| Q3_K_M | 0,6 | Calidad inferior |
| Q3_K_L | 0,7 | - |
| IQ4_XS | 0,7 | - |
| Q4_K_S | 0,7 | Rapida, recomendada |
| Q4_K_M | 0,8 | Rapida, recomendada |
| Q5_K_S | 0,9 | - |
| Q5_K_M | 0,9 | - |
| Q6_K | 1,0 | Muy buena calidad |
| Q8_0 | 1,2 | Rapida, mejor calidad |
| f16 | 2,3 | 16 bpw, sobredimensionada |

## Arquitectura y entrenamiento

El unico dato estructural confirmado es que el modelo base IFM/K2-Horizon-0.9B es de tipo denso y que fue entrenado mediante destilacion de conocimiento segun los tags del repositorio (`dense`, `knowledge-distillation`, `reasoning`). No se ha publicado informacion sobre el numero de capas, la dimension del modelo, el mecanismo de atencion, el tamano del vocabulario ni la funcion de activacion. Tampoco hay datos sobre la composicion del dataset de entrenamiento, el numero de tokens procesados ni si se aplicaron tecnicas de alineacion como RLHF, DPO o RLVR.

La aportacion tecnica de este repositorio no es el modelo en si, sino el proceso de cuantizacion realizado por mradermacher con `quantize_version: 2` y `output_tensor_quantised: 1`, a partir de una conversion de tipo HF. El autor indica explicitamente que las cuantizaciones ponderadas o con imatrix no estaban disponibles en el momento de la publicacion, por lo que todas las variantes son cuantizaciones estaticas sin calibracion con matriz de importancia, lo que puede implicar una perdida de calidad algo mayor en los niveles bajos (Q2_K, Q3_K) que en cuantizaciones ponderadas equivalentes.

## Capacidades

- Generacion de texto conversacional: el pipeline declarado es `conversational`, orientado a dialogos multi-turno.
- Razonamiento: el tag `reasoning` indica un ajuste especifico para tareas que requieren cadenas de deduccion, presumiblemente heredado del profesor utilizado en la destilacion.
- Bilinguismo ingles-chino: los unicos idiomas declarados en la model card y en los metadatos.
- Base para destilacion y ajuste fino: al ser un modelo de 1,08 B bajo Apache-2.0, es un candidato habitual como alumno en pipelines de destilacion o como base para fine-tuning con LoRA.
- Ejecucion en CPU y hardware de borde: el formato GGUF con cuantizaciones desde 0,5 GB permite inferencia sin GPU.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso explicito: no disponible en la informacion proporcionada.
- Capacidades de vision, audio o modo "thinking": no disponible en la informacion proporcionada.

## Casos de uso

- Asistentes conversacionales en local: al publicarse en GGUF con cuantizaciones de menos de 1 GB, el modelo puede gestionar dialogos multi-turno en un portatil sin GPU dedicada o en una Raspberry Pi con 4 GB de RAM, sin enviar datos a servicios externos.
- Generacion de texto en aplicaciones de borde: integracion en plugins de escritorio o extensiones de navegador para autocompletado, reformulacion o resumen de fragmentos cortos, donde la latencia de red es inaceptable.
- Preprocesado y clasificacion de texto en pipelines de datos: etiquetado de grandes volumenes de documentos en ingles o chino antes de pasarlos a un modelo mayor, reduciendo coste de inferencia por token.
- Extraccion de entidades y estructuracion de informacion: conversion de texto libre en campos estructurados para alimentar bases de datos, con la ventaja de que el modelo puede ejecutarse en la misma maquina que el resto del pipeline.
- Prototipado y pruebas de integracion en CI/CD: uso del modelo como sustituto de bajo coste en tests automatizados de aplicaciones que consumen una API compatible con OpenAI, gracias al tag `endpoints_compatible`.
- Ajuste fino especifico de dominio: al ser Apache-2.0 y con solo 1,08 B de parametros, es viable reentrenar con LoRA sobre corpus propios (por ejemplo, terminologia juridica o medica en chino) en una unica GPU de consumo.
- Generacion de datos sinteticos para entrenamiento: produccion de borradores o pares instruccion-respuesta a gran escala antes de filtrarlos con un modelo mayor.
- Traduccion asistida ingles-chino en herramientas internas: uso como primer paso de traduccion en entornos con requisitos de confidencialidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card del repositorio de cuantizaciones ni los metadatos de HuggingFace incluyen valores de MMLU, HumanEval, GSM8K, ARC, HellaSwag ni de ninguna otra evaluacion estandar, y tampoco se proporcionan comparaciones con el modelo base sin cuantizar o con las distintas variantes de cuantizacion.

## Requisitos de hardware

- VRAM estimada para inferencia (incluye pesos + cache KV + overhead del runtime, estimacion a partir del tamano de fichero):
  - Q2_K: ~0,8-1,0 GB
  - Q3_K_S / Q3_K_M: ~0,9-1,1 GB
  - IQ4_XS / Q4_K_S: ~1,0-1,3 GB
  - Q4_K_M: ~1,1-1,4 GB
  - Q5_K_S / Q5_K_M: ~1,2-1,5 GB
  - Q6_K: ~1,4-1,7 GB
  - Q8_0: ~1,6-2,0 GB
  - f16: ~2,8-3,5 GB
  Estas cifras son estimaciones derivadas del tamano de los ficheros publicados; el consumo real depende de la longitud de contexto configurada y del backend.
- GPU recomendadas: cualquier GPU con 2 GB o mas de VRAM es suficiente, incluso en las cuantizaciones mas altas. Se puede aprovechar una RTX 3060, RTX 4060, RTX 4090, A100 o H100, aunque en estos dos ultimos el modelo quedaria enormemente infrautilizado. Para lotes grandes y alto throughput si tendria sentido usar GPUs de datacenter.
- Cabe en GPU de consumo: si, en practicamente todas las GPU dedicadas de los ultimos diez anos, e incluso en iGPUs con memoria unificada.
- Cabe en CPU: si. Las cuantizaciones Q4_K_M y Q4_K_S (0,7-0,8 GB) son las recomendadas por el autor y permiten inferencia en CPU con 2 GB de RAM libre.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, y servidores compatibles con la API de OpenAI (el tag `endpoints_compatible` lo indica). vLLM y TGI no trabajan de forma nativa con GGUF en todas sus versiones, por lo que requeririan convertir los pesos a safetensors o usar un backend con soporte explicito de GGUF.
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token para ninguna de las cuantizaciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| K2-Horizon-0.9B-GGUF | 1,08 B | No disponible | Apache-2.0 | GGUF en HuggingFace |
| Llama 3.2 1B Instruct | 1,24 B | 128 000 tokens (segun documentacion publica de Meta) | Llama 3.2 Community License | Safetensors y GGUF en HuggingFace |
| Qwen2.5-1.5B-Instruct | 1,54 B | 32 768 tokens nativos (segun documentacion publica de Alibaba) | Apache-2.0 | Safetensors y GGUF en HuggingFace |
| SmolLM2-1.7B-Instruct | 1,71 B | 8 192 tokens (segun documentacion publica de HuggingFace) | Apache-2.0 | Safetensors y GGUF en HuggingFace |

Nota: los datos de los modelos comparativos proceden de la documentacion publica de sus respectivos fabricantes y se incluyen como referencia de categoria; no se dispone de resultados de benchmarks de K2-Horizon-0.9B que permitan una comparacion de rendimiento directa. La principal ventaja competitiva de K2-Horizon-0.9B frente a las alternativas es su menor huella de memoria, al situarse por debajo de los 1,1 B de parametros.

## Limitaciones y advertencias

- Longitud de contexto desconocida: no se ha publicado la ventana de contexto, por lo que no se puede garantizar el comportamiento en conversaciones largas ni en tareas de recuperacion sobre documentos extensos.
- Idiomas limitados: solo ingles y chino. El rendimiento en castellano no esta documentado y previsiblemente sera pobre, ya que el vocabulario y los datos de entrenamiento no estan orientados a lenguas romanicas.
- Riesgo de alucinacion: al ser un modelo de menos de 1,1 B de parametros entrenado por destilacion, la tasa de invencion de hechos es estructuralmente alta. No debe usarse en dominios donde la exactitud factual sea critica sin verificacion posterior.
- Cuantizaciones sin imatrix: el autor indica que las cuantizaciones ponderadas o con matriz de importancia no estan disponibles, lo que puede degradar mas de lo habitual la calidad en Q2_K y Q3_K.
- Sin datos de benchmarks ni de evaluacion de sesgos: no se ha publicado ninguna medicion de sesgo, toxicidad o equidad. Se desconoce el comportamiento del modelo en prompts sensibles.
- Repositorio sin traccion: cero descargas y cero "likes" en el momento de la consulta, y fecha de creacion posterior a octubre de 2026. No hay evidencia de uso en produccion ni validacion por parte de terceros.
- Licencia: Apache-2.0 permite uso comercial, modificacion y redistribucion sin obligacion de liberar el codigo derivado. No obstante, al derivar de IFM/K2-Horizon-0.9B, conviene verificar la licencia del modelo base para descartar condiciones adicionales.
- Fecha del registro: la fecha de creacion indicada (2026-10-13) es inusualmente futura respecto al momento habitual de publicacion; conviene verificar la integridad y el origen de los ficheros antes de desplegarlos.

## Enlaces

- Repositorio de cuantizaciones en HuggingFace: https://huggingface.co/mradermacher/K2-Horizon-0.9B-GGUF
- Modelo base: https://huggingface.co/IFM/K2-Horizon-0.9B
- Pagina resumen de mradermacher para este modelo: https://hf.tst.eu/model#K2-Horizon-0.9B-GGUF
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Analisis de Artefact2 sobre tipos de cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones y FAQ de cuantizaciones de mradermacher: https://huggingface.co/mradermacher/model_requests
