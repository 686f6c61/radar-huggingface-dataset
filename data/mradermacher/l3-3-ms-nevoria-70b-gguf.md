# mradermacher/L3.3-MS-Nevoria-70b-GGUF

## Resumen

L3.3-MS-Nevoria-70b-GGUF es un repositorio de cuantizaciones en formato GGUF generado por mradermacher a partir del modelo Steelskull/L3.3-MS-Nevoria-70b, un merge de comunidad derivado de la familia Llama 3.3 de 70.000 millones de parametros. El autor original del merge es Steelskull; mradermacher se encarga unicamente de producir los ficheros cuantizados listos para su uso con llama.cpp y herramientas compatibles.

El modelo base es un merge orientado a conversacion (tag "conversational" y "merge") y esta publicado con licencia "eva-llama3.3" (etiquetada como "other"), lo que sugiere que hereda los terminos de la licencia comunitaria de Llama 3.3. El repositorio pesa 481,3 GB en total y contiene once variantes de cuantizacion que van desde 26,5 GB (Q2_K) hasta 75,1 GB (Q8_0), ademas de un repositorio separado con cuantizaciones ponderadas/imatrix de mayor calidad.

Su relevancia practica radica en que permite ejecutar un modelo de 70B en hardware de consumo o en una sola GPU de gama alta, sin necesidad de infraestructura de entrenamiento. La ficha se centra en los datos verificables del repositorio de cuantizacion, dado que la model card del autor no incluye informacion detallada sobre el entrenamiento del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible de forma explicita; el nombre y la licencia sugieren una base Llama 3.3 70B (transformer denso, decoder-only) |
| Parametros totales | 70.553.706.560 (dato real de safetensors) |
| Parametros activos | No aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible. El modelo original Llama 3.3 70B soporta 128.000 tokens, pero no se confirma en la informacion proporcionada |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | Ingles (en) |
| Licencia | eva-llama3.3 (etiquetada como "other") |
| Formato de pesos | GGUF (ficheros .gguf; Q6_K y Q8_0 divididos en dos partes) |

## Arquitectura y entrenamiento

Este repositorio no es un modelo entrenado, sino un conjunto de cuantizaciones estaticas del modelo Steelskull/L3.3-MS-Nevoria-70b, que a su vez es un merge de comunidad. El proceso de cuantizacion parte del modelo convertido a formato HF y genera ficheros GGUF mediante llama.cpp; segun los metadatos de la model card, la cuantizacion se realizo con quantize_version 2 y output_tensor_quantised 1. No se especifica el metodo de mezcla de pesos (SLERP, TIES, DARE, etc.) empleado en el merge original.

No hay informacion en la model card sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF, DPO o ajuste por instrucciones en el modelo base. Dado que el nombre hace referencia a "L3.3" y el identificador de licencia es "eva-llama3.3", lo mas probable es que la arquitectura subyacente sea la de Llama 3.3 70B (transformer denso, decoder-only, con atencion por ventanas y contexto largo en su version original), pero esto no se confirma de forma explicita en la informacion disponible.

## Capacidades

- Generacion de texto conversacional multi-turno, orientada a dialogos asistenciales y de proposito general.
- El repositorio esta etiquetado como "conversational", por lo que se espera soporte de interacciones de chat con roles sistema/usuario/asistente.
- Capacidad multilingue limitada: el unico idioma declarado es el ingles.
- No se documenta soporte de tool calling, function calling ni uso como agente.
- No se documenta modo de razonamiento explicito (thinking mode) ni capacidades de vision o audio.
- No se documenta capacidad especifica de generacion de codigo ni de matematicas; al ser un merge de 70B, cabe esperar competencia general, pero no hay datos que lo confirmen.
- Al estar en formato GGUF, es compatible con llama.cpp, Ollama, LM Studio, koboldcpp y otros runners que acepten este formato.

## Casos de uso

- Asistente conversacional local en ingles: el modelo se puede servir con llama.cpp u Ollama en una GPU de 48 GB o en un equipo Apple Silicon de 64 GB con la cuantizacion Q4_K_M, gestionando dialogos multi-turno sin enviar datos a terceros.
- Prototipado de aplicaciones de chat en estaciones de trabajo: usar la variante Q4_K_S (40,4 GB) para iterar rapidamente en el diseno de prompts y evaluar la calidad del merge antes de decidir un despliegue mayor.
- Despliegue en una sola GPU de 80 GB: la cuantizacion Q8_0 (75,1 GB) permite obtener la maxima fidelidad respecto al modelo original en una A100 o H100 de 80 GB, util para tareas de evaluacion de calidad o generacion de contenido exigente.
- Sustitucion de APIs propietarias en entornos con requisitos de privacidad: al ejecutarse en local, permite procesar textos internos (documentacion, correos, informes) sin salida de datos a servicios en la nube.
- Generacion de texto en lote (batch) para pipelines de contenido: con vLLM o llama.cpp servidor se pueden procesar grandes volumenes de prompts en ingles para resumen, reescritura o clasificacion.
- Investigacion sobre tecnicas de cuantizacion: comparar las distintas variantes (Q2_K frente a Q8_0) permite medir la degradacion de calidad y el impacto en perplexity, tal como referencia la grafica enlazada en la model card.
- Base para fine-tuning o merges posteriores: al estar disponible el modelo original en safetensors, se puede partir de el para adaptaciones especificas, mientras las cuantizaciones GGUF sirven para inferencia rapida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card del repositorio de cuantizacion no incluye cifras de MMLU, HumanEval, GSM8K ni de ningun otro benchmark. La unica referencia de rendimiento es una grafica comparativa de perplexity entre tipos de cuantizacion (enlazada en la seccion de enlaces), que ilustra la perdida de calidad relativa segun el nivel de compresion, pero sin valores numericos en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada segun tamano de fichero (mas el espacio adicional para la cache KV, que crece con la longitud de contexto):
  - Q2_K: 26,5 GB.
  - Q3_K_S: 31,0 GB.
  - Q3_K_M: 34,4 GB.
  - Q3_K_L: 37,2 GB.
  - IQ4_XS: 38,4 GB.
  - Q4_K_S: 40,4 GB (recomendada por el autor por velocidad).
  - Q4_K_M: 42,6 GB (recomendada por el autor por velocidad).
  - Q5_K_S: 48,8 GB.
  - Q5_K_M: 50,0 GB.
  - Q6_K: 58,0 GB (dividida en dos partes).
  - Q8_0: 75,1 GB (dividida en dos partes).
- GPU recomendadas:
  - Q4_K_M o inferiores: una GPU de 48 GB (A6000, L40S, RTX 6000 Ada) o dos GPU de 24 GB (RTX 4090/3090) con reparto de capas.
  - Q5 y Q6_K: GPU de 80 GB (A100 80 GB, H100 80 GB) para evitar offload a CPU.
  - Q8_0: A100 80 GB o H100 80 GB, o bien varias GPU.
- Cabe en GPU de consumo: si, siempre que se elija una cuantizacion baja. Con Q2_K (26,5 GB) entra en tarjetas de 32 GB (RTX 5090). Q4_K_S y Q4_K_M (40-43 GB) requieren dos GPU de 24 GB o una GPU profesional de 48 GB.
- Equipos Apple Silicon: con memoria unificada de 32, 64 o 96 GB se pueden ejecutar las cuantizaciones Q2_K a Q4_K_M, y con 96/128 GB las de mayor tamano.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, text-generation-webui y servidores compatibles con GGUF. Tambien se puede servir con vLLM si se parte del modelo en safetensors en lugar del GGUF.
- Latencia y throughput: no disponible. Dependen de la cuantizacion, la GPU y la longitud de contexto; el autor no publica metricas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mradermacher/L3.3-MS-Nevoria-70b-GGUF | 70,55 B | No disponible | GGUF | eva-llama3.3 | Repositorio HF, 554 descargas |
| Steelskull/L3.3-MS-Nevoria-70b (modelo base) | 70,55 B | No disponible | safetensors | eva-llama3.3 | Repositorio HF de origen |
| mradermacher/L3.3-MS-Nevoria-70b-i1-GGUF | 70,55 B | No disponible | GGUF (imatrix) | eva-llama3.3 | Repositorio HF alternativo |
| Llama 3.3 70B Instruct (referencia de la familia) | 70 B | 128.000 tokens en el modelo original | safetensors / GGUF | Llama 3.3 Community License | Ampliamente disponible |

No se dispone de datos de rendimiento comparativo entre estas opciones; la comparacion se limita a parametros, formato y licencia.

## Limitaciones y advertencias

- Idiomas: unicamente se declara ingles ("en"); el rendimiento en castellano u otros idiomas no esta documentado y probablemente sea inferior.
- Sesgos: al tratarse de un merge de comunidad sin model card detallada, no hay informacion sobre sesgos evaluados ni mitigaciones aplicadas.
- Alucinacion: no hay evaluaciones publicadas de fidelidad factual; como en cualquier modelo generativo de gran tamano, existe riesgo de generar contenido incorrecto con aparente seguridad.
- Contexto: no se confirma la longitud de contexto soportada; conviene verificarla experimentalmente con la herramienta elegida antes de desplegar cargas con ventanas largas.
- Licencia: la licencia "eva-llama3.3" se etiqueta como "other"; dado que el nombre apunta a la licencia comunitaria de Llama 3.3, es probable que existan restricciones de uso (clausulas de escala, requisitos de atribucion y condiciones para usos comerciales). Es imprescindible revisar el texto completo de la licencia antes de un uso en produccion.
- Cuantizacion: las variantes por debajo de Q4 (Q2_K, Q3_K) degradan notablemente la calidad; el autor marca explicitamente Q3_K_M como "lower quality" y recomienda Q4_K_S y Q4_K_M para uso general.
- Procedencia: al ser un merge no oficial, no cuenta con garantias de mantenimiento, soporte ni actualizaciones por parte de Meta ni de los autores originales.
- Uso comercial: sujeto a los terminos de la licencia del modelo base; no se garantiza su idoneidad para productos comerciales sin revision legal.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/mradermacher/L3.3-MS-Nevoria-70b-GGUF
- Modelo base (Steelskull/L3.3-MS-Nevoria-70b): https://huggingface.co/Steelskull/L3.3-MS-Nevoria-70b
- Cuantizaciones imatrix (mayor calidad): https://huggingface.co/mradermacher/L3.3-MS-Nevoria-70b-i1-GGUF
- Pagina resumen del modelo en hf.tst.eu: https://hf.tst.eu/model#L3.3-MS-Nevoria-70b-GGUF
- Peticiones de cuantizacion y FAQ del autor: https://huggingface.co/mradermacher/model_requests
- Grafica comparativa de perplexity por tipo de cuantizacion: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- README de referencia de TheBloke sobre uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- nethype GmbH (proveedor de infraestructura del autor): https://www.nethype.de/
