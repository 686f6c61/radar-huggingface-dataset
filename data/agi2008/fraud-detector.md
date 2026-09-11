# Agi2008/fraud-detector

## Resumen

Agi2008/fraud-detector es un ajuste fino (fine-tune) del modelo Qwen/Qwen2.5-1.5B-Instruct, publicado por el usuario Agi2008 en HuggingFace. Segun la model card, el entrenamiento se realizo mediante SFT (supervised fine-tuning) utilizando la libreria TRL de HuggingFace. El nombre sugiere un proposito de deteccion de fraude, pero la model card no documenta el conjunto de datos, el dominio ni el formato de las etiquetas empleadas.

El modelo hereda la arquitectura y el tamano del modelo base: un transformer decoder-only de aproximadamente 1.500 millones de parametros, con una ventana de contexto de 32.768 tokens en la version original de Qwen2.5-1.5B-Instruct. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y su tamano declarado es de 0,0 GB, lo que indica que los pesos pueden no estar subidos o que el repositorio solo contiene los ficheros de configuracion.

Su relevancia es limitada en el estado actual: se trata de un modelo derivado de un base pequeno, sin licencia declarada de forma efectiva, sin benchmarks publicados y sin documentacion del dataset de entrenamiento. Es util unicamente como ejemplo de pipeline SFT con TRL sobre Qwen2.5, o como punto de partida para quien quiera reproducir el flujo de trabajo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada del modelo base Qwen2.5-1.5B-Instruct) |
| Parametros totales | aproximadamente 1.500 millones (modelo base); no confirmado en el repositorio del fine-tune |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens en el modelo base; no confirmado para el fine-tune |
| Tipos de cuantizacion | no disponible (el repositorio indica safetensors; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible para el fine-tune; el modelo base Qwen2.5 declara soporte multilingue |
| Licencia | no disponible (la model card contiene el campo placeholder "licence: license") |
| Formato de pesos | safetensors (segun los tags del repositorio); tamano del repo declarado 0,0 GB |

## Arquitectura y entrenamiento

La arquitectura corresponde integramente al modelo base Qwen2.5-1.5B-Instruct: un transformer decoder-only con normalizacion RMSNorm, activacion SwiGLU, embeddings rotatorios (RoPE) y atencion con consultas agrupadas (GQA). El modelo base fue entrenado por Alibaba Qwen sobre aproximadamente 18 billones de tokens y posteriormente alineado mediante tecnicas de instruccion. No se ha modificado la arquitectura en el fine-tune.

El entrenamiento del fine-tune se realizo con SFT supervisado usando TRL 1.13.0, Transformers 5.16.1 y PyTorch 2.11.0+cu128. No se especifica el numero de ejemplos, la composicion del dataset, la longitud de las secuencias, el numero de epocas, la tasa de aprendizaje ni si hubo una fase posterior de RLHF o DPO. Tampoco se documenta ninguna innovacion tecnica adicional. La model card incluye un ejemplo de uso con `pipeline("text-generation")` que plantea una pregunta generica sobre viajes en el tiempo, lo que sugiere que la plantilla de prompt no fue adaptada al supuesto dominio de fraude.

## Capacidades

- Generacion de texto conversacional: hereda la capacidad de chat del modelo base Qwen2.5-1.5B-Instruct.
- Razonamiento basico: el modelo base resuelve tareas de razonamiento de complejidad baja, limitado por su tamano de 1.5B parametros.
- Generacion de codigo: capacidad limitada heredada del base; no verificada tras el fine-tune.
- Matematicas elementales: capacidad limitada del base; no verificada tras el fine-tune.
- Soporte de tool calling: el modelo base Qwen2.5-1.5B-Instruct soporta function calling; no se documenta si el fine-tune lo preserva.
- Capacidades de agente y razonamiento multi-paso: no documentadas para este fine-tune.
- Capacidades multilingues: no documentadas para el fine-tune; el base es multilingue.
- Capacidades especiales: no se documenta modo thinking, vision ni audio. Aunque el nombre del modelo apunta a deteccion de fraude, no hay evidencia en la model card de que se haya entrenado para clasificacion, extraccion de entidades o analisis de transacciones.

## Casos de uso

- Evaluacion de pipelines SFT con TRL: el repositorio sirve como referencia de como se estructura un fine-tune supervisado sobre Qwen2.5-1.5B-Instruct con las versiones de libreria indicadas. Apropiado para equipos que quieran replicar el flujo antes de escalar a modelos mayores.
- Prototipado de asistentes conversacionales ligeros: al derivar de un modelo instruct de 1.5B, puede ejecutar dialogos multi-turno basicos en hardware modesto, siempre que se valide previamente la degradacion introducida por el fine-tune.
- Clasificacion de texto en el dominio de fraude (hipotetico): si el entrenamiento se realizo sobre ejemplos etiquetados, el modelo podria emplearse para puntuar transacciones o mensajes sospechosos. No hay documentacion que lo respalde, por lo que requeriria validacion propia con datos etiquetados.
- Extraccion de informacion estructurada: con una plantilla de prompt adecuada, el base puede devolver JSON con campos concretos; util para procesar alertas antifraude, sujeto a verificacion empirica.
- Despliegue en el borde (edge): con 1.5B parametros y cuantizacion INT4, cabe en GPUs de consumo e incluso en CPU, lo que permite inferencia local sin enviar datos sensibles a la nube.
- Generacion de resumenes de expedientes: para resumir informes de investigacion de fraude o reclamaciones, aprovechando el contexto de 32.768 tokens del base para concatenar varios documentos.
- Filtrado previo en cascada: usar el modelo como primera etapa de bajo coste que descarta casos claros y delega los ambiguos a un modelo mayor, reduciendo el gasto de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,1 GB en FP16 (BF16), en torno a 1,6 GB en INT8 y cerca de 1,0 GB en INT4. Son estimaciones calculadas a partir de los 1.500 millones de parametros del modelo base; no hay mediciones publicadas para este fine-tune.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16, como RTX 3050, RTX 4060, RTX 4090, A100 o H100. En entornos de servidor, A100/H100 permiten lotes grandes y mayor throughput.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en RTX 3060 12 GB, RTX 4060 Ti, RTX 4070, RTX 4090 y en GPUs integradas con memoria unificada suficiente. Tambien puede ejecutarse en CPU con llama.cpp u Ollama en formato GGUF, aunque el repositorio no publica pesos GGUF.
- Opciones de despliegue: transformers con `pipeline`, vLLM, TGI, llama.cpp, Ollama, LM Studio. El tag `endpoints_compatible` del repositorio indica compatibilidad con HuggingFace Inference Endpoints.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Agi2008/fraud-detector | ~1,5B (heredado) | no confirmado (base: 32.768 tokens) | no disponible | HuggingFace, 0 descargas, repo de 0,0 GB |
| Qwen/Qwen2.5-1.5B-Instruct | 1,5B | 32.768 tokens | Apache 2.0 | HuggingFace, ampliamente descargado |
| meta-llama/Llama-3.2-1B-Instruct | 1,2B | 128.000 tokens | Llama 3.2 Community License | HuggingFace, requiere aceptar terminos |
| google/gemma-2-2b-it | 2,6B | 8.192 tokens | Gemma Terms of Use | HuggingFace, requiere aceptar terminos |

Los datos de los tres modelos de referencia corresponden a sus fichas oficiales. La comparativa de rendimiento no puede completarse porque el modelo evaluado no publica benchmarks y no hay evidencia de que sus pesos esten efectivamente disponibles en el repositorio.

## Limitaciones y advertencias

- Licencia no declarada de forma efectiva: el campo de licencia contiene el texto placeholder "license", lo que impide determinar si se permite el uso comercial. No debe utilizarse en produccion sin aclarar este punto.
- Pesos posiblemente ausentes: el tamano del repositorio es de 0,0 GB, lo que sugiere que los ficheros safetensors no se han subido o que el repositorio contiene solo la configuracion.
- Sin documentacion del dataset: no se indica la procedencia, el volumen ni el etiquetado de los datos de entrenamiento, lo que impide evaluar sesgos y calidad.
- Riesgo de alucinacion: inherente a los modelos de 1.5B parametros y agravado por un fine-tune sin evaluacion publicada.
- Riesgo de sobreajuste al dominio: si el ajuste se hizo sobre un conjunto pequeno de ejemplos de fraude, es probable que el modelo haya perdido capacidades generales del base y que responda de forma deficiente fuera del dominio previsto.
- Capacidad de razonamiento limitada: 1.5B parametros restringen tareas de razonamiento multi-paso, matematicas y codigo complejo.
- Idiomas no documentados: no se especifica si el fine-tune conserva el soporte multilingue del base.
- Sin benchmarks: no hay MMLU, HumanEval, GSM8K ni metricas de clasificacion que permitan comparar con alternativas.
- Uso en ambitos regulados: cualquier aplicacion de deteccion de fraude en banca o seguros esta sujeta a normativa de explicabilidad y proteccion de datos; un modelo opaco sin evaluacion no cumple por si solo esos requisitos.
- Fecha de creacion inusual: la ficha indica 2026-09-11, lo que puede reflejar un error de metadatos o una fecha futura respecto a la redaccion habitual de estas fichas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Agi2008/fraud-detector
- Modelo base Qwen2.5-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Repositorio de TRL: https://github.com/huggingface/trl
- Documentacion de Transformers: https://huggingface.co/docs/transformers
- Los resultados de busqueda web proporcionados no contienen enlaces relevantes sobre el modelo (corresponden a paginas de ayuda de YouTube y no guardan relacion con la ficha).
