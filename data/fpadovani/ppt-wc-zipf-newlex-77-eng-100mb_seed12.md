# fpadovani/ppt-wc-zipf-newlex-77-eng-100mb_seed12

## Resumen

ppt-wc-zipf-newlex-77-eng-100mb_seed12 es un ajuste fino de tipo SFT sobre el modelo base goldfish-models/eng_latn_100mb, publicado por el usuario fpadovani. Se trata de un artefacto de investigacion, no de un modelo de proposito general: el identificador del repositorio (zipf, newlex, wc, seed12) apunta a un experimento controlado sobre distribuciones de frecuencia lexica y cobertura de lexico nuevo, aunque la model card no documenta el diseno experimental ni el conjunto de datos de ajuste.

El modelo conserva la arquitectura del base, un transformer decoder-only de estilo GPT-2 con 86.508.288 parametros (unos 86,5 millones) y tokenizador orientado a ingles. El entrenamiento se realizo con TRL 0.23.0 sobre Transformers 4.56.2 y PyTorch 2.11.0, con traza publica en Weights & Biases bajo el proyecto f-padovani-university-of-groningen/white_cotterell.

Su relevancia es acotada y de caracter metodologico: sirve como punto de comparacion reproducible en estudios sobre ley de Zipf, composicion lexica y efectos del ajuste fino en modelos pequenos entrenados con solo 100 MB de texto. No hay resultados de benchmarks publicados, la licencia no esta especificada y el modelo tiene cero descargas y cero likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de estilo GPT-2 (etiqueta gpt2 en el repositorio) |
| Parametros totales | 86.508.288 (~86,5 M) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repositorio solo publica pesos en safetensors, presumiblemente fp32) |
| Idiomas soportados | Ingles (derivado del modelo base eng_latn); no se documentan otros idiomas |
| Licencia | No disponible (la model card indica "licence: license" sin concretar terminos) |
| Formato de pesos | safetensors |
| Modelo base | goldfish-models/eng_latn_100mb |
| Metodo de ajuste | SFT con TRL 0.23.0 |
| Libreria | transformers (compatible con text-generation-inference y endpoints) |
| Tamano del repositorio | 1,4 GB |
| Pipeline declarado | text-generation |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del base goldfish-models/eng_latn_100mb, un transformer decoder-only de tipo GPT-2 entrenado desde cero sobre 100 MB de texto en ingles con escritura latina. El ajuste fino es un SFT completo (no se documenta si se congelaron capas ni si se modifico el vocabulario, algo relevante dado que el nombre del repositorio incluye el termino "newlex"), realizado con TRL 0.23.0, Transformers 4.56.2, PyTorch 2.11.0, Datasets 4.8.4 y Tokenizers 0.22.1. La ejecucion esta registrada en Weights & Biases en el proyecto white_cotterell de la Universidad de Groningen, lo que situa el trabajo en el ambito de la investigacion academica sobre modelado del lenguaje.

No se especifica el numero de tokens de entrenamiento, la composicion del dataset de ajuste, ni si hubo etapas de RLHF o DPO; la model card solo indica "trained with SFT". Tampoco se documentan innovaciones tecnicas como decodificacion especulativa, atencion lineal ni variantes de atencion eficiente. El sufijo seed12 sugiere que existen otras ejecuciones con distintas semillas, lo que refuerza el caracter de experimento replicable mas que de modelo desplegable.

## Capacidades

- Generacion de texto en ingles: el ejemplo oficial usa el pipeline text-generation con el formato de mensajes [{"role": "user", "content": ...}], lo que indica que el SFT introdujo algun grado de seguimiento de instrucciones.
- Finalizacion de texto y continuacion de prompt: capacidad basica esperada en un modelo causal de este tamano.
- Generacion condicionada por frecuencia lexica: el diseno experimental del repositorio sugiere que el modelo responde a manipulaciones de la distribucion de palabras (Zipf) y al lexico introducido durante el ajuste.
- No hay evidencia documentada de razonamiento multi-paso, matematicas, generacion de codigo, vision, audio ni modo de razonamiento explicito (thinking mode).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte para agentes ni planificacion multi-paso.
- Capacidad multilingue: no documentada; el base es monolingue en ingles.
- Compatibilidad de despliegue: el repositorio se etiqueta como text-generation-inference y endpoints_compatible, por lo que puede servirse con las herramientas estandar de Hugging Face.

## Casos de uso

- Investigacion sobre la ley de Zipf: el modelo permite medir como un ajuste fino SFT sobre un corpus controlado altera la distribucion de frecuencias de las palabras generadas, comparando la salida con el modelo base goldfish-models/eng_latn_100mb.
- Estudio de adquisicion de lexico nuevo: dado el sufijo "newlex" del identificador, sirve para evaluar si el ajuste incorpora terminos que no aparecian en el corpus de preentrenamiento de 100 MB y con que probabilidad los emite.
- Baseline en experimentos de NLP de bajo coste: con 86,5 M de parametros se puede reentrenar y evaluar decenas de configuraciones en una sola GPU consumer, algo inviable con modelos de miles de millones de parametros.
- Ablaciones de SFT y semillas: la existencia de una seed12 implica que el modelo puede usarse como una de las ejecuciones de un estudio de varianza entre semillas sobre el mismo dataset.
- Analisis de tokenizacion y fertilidad: util para estudiar como un vocabulario de estilo GPT-2 se comporta sobre texto ingles con vocabulario controlado.
- Generacion de texto sintetico para pruebas de pipelines: sirve para validar infraestructura de inferencia (TGI, transformers, endpoints) sin consumir recursos de GPU significativos.
- Docencia y demostraciones: su reducido tamano permite ejecutar ejemplos de generacion de texto en portatiles o incluso en CPU, ilustrando el funcionamiento de un transformer decoder-only completo.
- Deteccion de artefactos de modelos pequenos: util como caso limite para estudiar repeticion degenerada, perdida de coherencia a partir de cierto numero de tokens y deriva tematica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K, perplexity ni ninguna otra evaluacion, y los resultados de busqueda web proporcionados no contienen informacion tecnica sobre el modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: unos 346 MB en fp32, unos 173 MB en fp16/bf16 y unos 87 MB en int8 (calculado a partir de los 86.508.288 parametros; no son cifras publicadas por el autor).
- GPU recomendadas: cualquier GPU con mas de 1 GB de VRAM, incluidas GTX 1050 Ti, GTX 1650, RTX 3050, RTX 4090, A100 y H100. El modelo esta muy por debajo de la capacidad de todas ellas.
- Cabe holgadamente en GPU consumer: si, en cualquier GPU consumer de los ultimos diez anos, y tambien en CPU con un consumo de memoria inferior a 1 GB en fp32.
- Opciones de despliegue: transformers (pipeline de text-generation), text-generation-inference (etiqueta explicita en el repositorio), endpoints de Hugging Face. Para llama.cpp u Ollama seria necesario convertir los pesos a GGUF, conversion no publicada por el autor.
- Latencia y throughput: no disponibles. No se han publicado mediciones y no deben extrapolarse sin medir.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ppt-wc-zipf-newlex-77-eng-100mb_seed12 | 86,5 M | No disponible | Ingles | No disponible | Hugging Face, safetensors |
| goldfish-models/eng_latn_100mb (base) | No disponible en la informacion (el ajuste conserva la arquitectura del base) | No disponible | Ingles | No disponible | Hugging Face |
| GPT-2 small (referencia general) | 124 M | 1024 tokens | Ingles (multilingue limitado) | MIT modificada | Ampliamente disponible |
| distilgpt2 (referencia general) | 82 M | 1024 tokens | Ingles | Apache 2.0 | Ampliamente disponible |

Los datos de GPT-2 small y distilgpt2 corresponden a conocimiento general sobre esos modelos, no a la informacion proporcionada en esta busqueda. No hay resultados de benchmarks que permitan comparar calidad entre estas opciones; la comparacion se limita a tamano, contexto y licencia.

## Limitaciones y advertencias

- Modelo de investigacion sin validacion: cero descargas y cero likes en Hugging Face, sin benchmarks ni evaluaciones de terceros.
- Licencia no especificada: la model card indica "licence: license" sin terminos concretos, por lo que el uso comercial queda en un limbo legal y no deberia asumirse permitido.
- Dataset de ajuste no documentado: se desconoce la composicion, el tamano y la procedencia de los datos de SFT, lo que impide auditar sesgos o contaminacion.
- Riesgo alto de alucinacion: con 86,5 M de parametros y 100 MB de preentrenamiento, la cantidad de conocimiento factual almacenado es minima y la generacion puede derivar en texto plausible pero falso.
- Degeneracion y repeticion: es habitual en modelos de esta escala, especialmente con max_new_tokens altos.
- Cobertura idiomatica limitada al ingles; no hay evidencia de competencia en castellano ni en otros idiomas.
- Longitud de contexto desconocida: no se documenta la ventana maxima, lo que complica el diseno de aplicaciones multi-turno.
- Sin ajuste de seguridad documentado: no consta alineacion, filtrado de contenido ni moderacion, por lo que puede producir salidas inapropiadas.
- No apto para produccion: la ausencia de evaluaciones, licencia y soporte lo desaconsejan para cualquier sistema en explotacion.
- Consistencia entre semillas no verificada: el sufijo seed12 sugiere variabilidad entre ejecuciones que no ha sido cuantificada publicamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fpadovani/ppt-wc-zipf-newlex-77-eng-100mb_seed12
- Modelo base: https://huggingface.co/goldfish-models/eng_latn_100mb
- Repositorio de TRL: https://github.com/huggingface/trl
- Ejecucion de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/white_cotterell/runs/jr5w4ghk
- Nota sobre la busqueda web: los resultados proporcionados no contienen informacion relevante sobre el modelo; corresponden a hilos de foro sobre incidencias de WhatsApp Web y a consultas de soporte de Microsoft, sin relacion con este repositorio.
