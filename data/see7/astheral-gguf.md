# SEE7/Astheral-GGUF

## Resumen

Astheral-GGUF es la distribucion en formato GGUF del modelo SEE7/Astheral, un modelo de lenguaje conversacional de aproximadamente 8.030 millones de parametros. Lo publica el usuario SEE7 en Hugging Face y esta pensado para inferencia local con llama.cpp y herramientas compatibles, ya que el repositorio contiene unicamente pesos cuantizados, no el modelo original en safetensors. Se distribuye bajo la licencia Llama 3.1, heredada del modelo base, y la model card indica que esta construido con Llama.

El valor practico del repositorio esta en su bateria de cuantizaciones: ofrece desde variantes IQ1 de unos 2 GB hasta Q6_K de 6,6 GB, pasando por las familias IQ2, IQ3, IQ4, Q4_K, Q5_K y Q6_K. Las cuantizaciones de la serie i1 se han generado con datos de importancia (imatrix) calculados sobre un corpus multilingue y de instrucciones propio, el AstheralDataset, lo que en teoria mejora la fidelidad respecto a cuantizaciones sin calibracion a igualdad de bits.

La relevancia de esta ficha es doble: por un lado, permite ejecutar un modelo de 8B en hardware de consumo con un equilibrio razonable entre tamano y calidad; por otro, conviene ser cauto, porque la model card del repositorio GGUF no documenta arquitectura detallada, contexto, idiomas, datos de entrenamiento ni resultados de benchmarks del modelo base. Todo lo que no aparece en la informacion disponible se marca como tal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base SEE7/Astheral; la model card no detalla la arquitectura) |
| Parametros totales | 8.030.261.312 (~8,03 mil millones) |
| Parametros activos | no aplica (no hay indicios de que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-IQ4_NL, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K |
| Idiomas soportados | no disponibles (el corpus de calibracion se describe como multilingue, sin listado de idiomas) |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | GGUF (cuantizaciones); el modelo base SEE7/Astheral se distribuye aparte |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo base SEE7/Astheral: no se indica si es un transformer denso, un MoE, un modelo hibrido ni sus detalles de atencion. Lo unico deducible con rigor es el numero de parametros (8.030.261.312) y que el modelo es de tipo conversacional, segun las etiquetas del repositorio. Tampoco se documentan el volumen de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF, DPO o ajuste por instrucciones.

Lo que si esta documentado es el proceso de cuantizacion. Las variantes se generaron con llama.cpp (commit 5676dfbe01e7ebe0387913680eee0ed39bf4a363) y las de la serie i1 incorporan datos de importancia (imatrix) recogidos mediante pasadas forward reales sobre una muestra determinista, multilingue y de instrucciones del AstheralDataset. La model card indica que el hash del corpus, los ajustes de chunking, los formatos exactos de tensor y los hashes SHA-256 de cada fichero quedan registrados en manifest.json, lo que facilita la verificacion de integridad de las descargas.

## Capacidades

- Generacion de texto conversacional: el repositorio esta etiquetado como conversational, por lo que el uso previsto es el dialogo multi-turno.
- Instrucciones: el corpus de calibracion incluye muestras de instrucciones, lo que sugiere que el modelo base fue ajustado para seguir instrucciones, aunque no se detalla el metodo.
- Multilingue: la calibracion usa un corpus descrito como multilingue, pero no se enumeran los idiomas soportados ni su calidad relativa.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente o razonamiento multi-paso: no disponible en la informacion proporcionada.
- Vision, audio o modo thinking: no disponible en la informacion proporcionada.
- Despliegue en endpoints: la etiqueta endpoints_compatible sugiere compatibilidad con infraestructura de inferencia tipo endpoints, pero no se especifican los detalles.

## Casos de uso

- Asistente conversacional local: con cuantizaciones de 4,9 GB (Q4_K_M) o 5,7 GB (Q5_K_M), el modelo cabe en GPUs de consumo de 8-12 GB de VRAM y permite desplegar un chatbot privado sin enviar datos a la nube.
- Prototipado en portatil con llama.cpp u Ollama: las variantes IQ2 e IQ3 (entre 2,4 y 4,3 GB) permiten probar el modelo en equipos con poca memoria o incluso en CPU, antes de decidir una cuantizacion mayor.
- Generacion de texto en pipelines por lotes: al ser un modelo de 8B y formato GGUF, se puede integrar en scripts de procesamiento de documentos con llama.cpp, priorizando coste bajo frente a modelos mayores.
- Evaluacion comparativa de cuantizaciones: el repositorio incluye 24 variantes con tamanos documentados y hashes verificables, lo que lo hace util para estudiar el impacto de la cuantizacion i1-imatrix en la calidad de salida.
- Despliegue en entornos con requisitos de licencia Llama 3.1: al heredar esa licencia, encaja en organizaciones que ya han aceptado sus terminos y necesitan un modelo conversacional de 8B.
- Experimentacion academica con calibracion imatrix: el manifest.json y la descripcion del corpus de calibracion permiten reproducir o auditar el proceso de cuantizacion.
- Uso como base para ajuste fino posterior: las cuantizaciones Q6_K y Q5_K_M conservan mas fidelidad y pueden servir como referencia para comparar contra el modelo base sin cuantizar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio GGUF no incluye metricas de MMLU, HumanEval, GSM8K ni de ningun otro conjunto de evaluacion, ni del modelo base ni de las cuantizaciones.

## Requisitos de hardware

- VRAM estimada segun cuantizacion (tamano de fichero como referencia; la VRAM real depende de la ventana de contexto y del backend):
  - IQ1_S / IQ1_M: ~2,0-2,2 GB.
  - IQ2_XXS a IQ2_M: ~2,4-2,9 GB.
  - Q2_K_S / Q2_K: ~3,0-3,2 GB.
  - IQ3_XXS a Q3_K_L: ~3,3-4,3 GB.
  - IQ4_XS / Q4_K_M / Q4_1: ~4,4-5,1 GB.
  - Q5_K_S / Q5_K_M: ~5,6-5,7 GB.
  - Q6_K: ~6,6 GB.
- GPU recomendadas: para Q4_K_M o Q5_K_M, GPUs de consumo con 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080). Para Q6_K, 8-10 GB de VRAM libre. En entornos profesionales, A100 o H100 no son necesarias para un 8B, pero permiten mayor contexto y throughput.
- Cabe en GPU de consumo: si, en la mayoria de variantes IQ3, IQ4 y Q4_K; las Q5 y Q6 requieren 8 GB o mas de VRAM libre.
- Opciones de despliegue: llama.cpp (herramienta de generacion del repositorio), Ollama, y cualquier runtime compatible con GGUF. vLLM y TGI no se mencionan en la informacion disponible para este formato.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No hay datos de rendimiento del modelo base ni de las cuantizaciones, por lo que la comparativa se limita a parametros y formato. Se incluyen alternativas de tamano similar ampliamente conocidas, con la advertencia de que sus cifras de contexto y licencia son las de sus respectivas fichas publicas y no se han verificado contra la informacion de este repositorio.

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| SEE7/Astheral-GGUF | ~8,03 B | no disponible | llama3.1 | GGUF |
| Llama 3.1 8B Instruct | ~8 B | 128K (segun su model card) | llama3.1 | safetensors, GGUF |
| Mistral 7B Instruct | ~7,2 B | 32K (segun su model card) | Apache 2.0 | safetensors, GGUF |
| Qwen2.5 7B Instruct | ~7,6 B | 128K (segun su model card) | Apache 2.0 (mayoritariamente) | safetensors, GGUF |

La ventaja diferencial de Astheral-GGUF frente a estas alternativas es la disponibilidad de cuantizaciones i1 con imatrix y de un manifest con hashes; su desventaja es la ausencia de documentacion publica sobre contexto, idiomas y calidad.

## Limitaciones y advertencias

- Falta de documentacion: no se publican arquitectura, contexto, idiomas, datos de entrenamiento ni benchmarks, lo que dificulta evaluar su calidad frente a alternativas.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de este tamano; no hay evaluaciones publicadas que lo cuantifiquen.
- Sesgos: no disponibles; al no documentarse el corpus de entrenamiento, no se pueden anticipar sesgos concretos.
- Limitaciones de idioma: el corpus de calibracion es multilingue, pero no se especifica que idiomas estan cubiertos ni con que calidad.
- Licencia: Llama 3.1 Community License impone restricciones (por ejemplo, umbral de usuarios activos mensuales y obligaciones de atribucion); conviene revisar LICENSE, UPSTREAM_LLAMA3_LICENSE y NOTICE antes de un uso comercial.
- Cuantizaciones agresivas: las variantes IQ1 e IQ2 pueden degradar notablemente la coherencia y la fidelidad; para produccion se recomienda Q4_K_M o superior.
- Repositorio unicamente GGUF: no incluye pesos originales; para reentrenar o hacer ajuste fino hay que acudir al modelo base SEE7/Astheral.
- Verificacion de integridad: la model card afirma que cada fichero ha pasado comprobaciones de estructura GGUF y hash de subida, pero la verificacion final corresponde al usuario mediante manifest.json.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SEE7/Astheral-GGUF
- Modelo base: https://huggingface.co/SEE7/Astheral
- Revision concreta del modelo base citada en la model card: https://huggingface.co/SEE7/Astheral/tree/499fcb24010707e064dad71aae29875ed54a40e2
- Dataset de calibracion: https://huggingface.co/datasets/SEE7/AstheralDataset/tree/9332074b5fdd649fa210353d263dc156e80c3f19
- Manifest de cuantizacion: https://huggingface.co/SEE7/Astheral-GGUF/blob/main/manifest.json
- Licencia: https://huggingface.co/SEE7/Astheral-GGUF/blob/main/LICENSE
- Licencia upstream de Llama 3.1: https://huggingface.co/SEE7/Astheral-GGUF/blob/main/UPSTREAM_LLAMA3_LICENSE
- Aviso legal: https://huggingface.co/SEE7/Astheral-GGUF/blob/main/NOTICE
- llama.cpp (herramienta de cuantizacion): https://github.com/ggml-org/llama.cpp
