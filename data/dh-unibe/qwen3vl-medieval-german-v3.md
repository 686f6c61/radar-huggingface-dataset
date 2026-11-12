# dh-unibe/qwen3vl-medieval-german-v3

## Resumen

qwen3vl-medieval-german-v3 es un adaptador PEFT (LoRA) sobre el modelo multimodal Qwen/Qwen3-VL-4B-Instruct, especializado en reconocimiento de texto manuscrito (HTR) y OCR sobre documentos historicos en aleman medieval. Lo desarrolla el grupo dh-unibe (Digital Humanities, Universidad de Berna) y se publica bajo licencia MIT. El modelo resuelve un problema muy concreto: transcribir lineas de manuscritos y documentos de archivo de los siglos XIV al XVII que los modelos generalistas leen con alta tasa de error.

El adaptador se entrena sobre cuatro corpus anotados de humanidades digitales (Rats- und Richtebücher, cartas de Königsfelden, corpus Bullinger y AAEB), y se distribuye como pesos PEFT en safetensors con un tamano de repositorio de 0,5 GB. La arquitectura subyacente es la de Qwen3-VL-4B-Instruct: un transformer multimodal de 4.000 millones de parametros que acepta imagen y texto. El adaptador anade la capacidad especifica de transcribir escritura manuscrita historica en aleman.

Su relevancia actual radica en que ofrece una via de bajo coste computacional (4B parametros, cuantizable en GPU de consumo) para digitalizar fondos archivisticos, con metricas de error publicadas y una advertencia explicita sobre la granularidad de entrada: el modelo espera recortes de linea, no paginas completas. Esa limitacion operativa, documentada por el autor, es tan importante como el propio rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-lenguaje) Qwen3-VL-4B-Instruct + adaptador LoRA (PEFT) |
| Parametros totales | 4.000 millones (modelo base); parametros del adaptador no disponibles |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | aleman historico (siglos XIV-XVII) como dominio de entrenamiento; idiomas generales del modelo base no disponibles |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); el modelo base en formato propio de Qwen |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA entrenado sobre Qwen3-VL-4B-Instruct, un transformer multimodal que procesa pares imagen-texto. El adaptador no modifica la arquitectura del modelo base: anade pesos de bajo rango que especializan la capa de salida hacia la transcripcion de escritura manuscrita historica. El entrenamiento se realizo con el servicio `serving-atr-inference` del autor y se publican los pesos del mejor checkpoint de validacion, no los de la ultima epoca.

Los datos de entrenamiento proceden de cuatro conjuntos anotados: `image-text_rats-und-richtebuecher_xv-xvi` (libros de consejo y ordenanzas de los siglos XV-XVI), `image-text_bullinger-autoren` (correspondencia de autores de la reforma), `image-text_koenigsfelden-charters-post-1500` (cartas del monasterio de Königsfelden posteriores a 1500) y `image-text_aaeb-xiv-xvii` (documentos de archivo de los siglos XIV-XVII). El conjunto suma 11.448 paginas de entrenamiento. La innovacion tecnica destacable es la granularidad de entrenamiento: el modelo se entreno exclusivamente con recortes de linea (`granularity: line`, 262.144 pixeles), lo que condiciona por completo su uso en inferencia. No se documentan fases de RLHF o DPO.

## Capacidades

- Transcripcion de texto manuscrito historico en aleman medieval (HTR) a partir de recortes de linea.
- OCR de documentos de archivo de los siglos XIV al XVII.
- Entrada multimodal imagen-texto: acepta una imagen de linea y devuelve la transcripcion como texto.
- Integracion con vLLM, segun la etiqueta del repositorio.
- Capacidades generales heredadas del modelo base Qwen3-VL-4B-Instruct (razonamiento visual, descripcion de imagenes, texto), aunque el adaptador esta especializado en HTR.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: el dominio de entrenamiento es el aleman historico; el resto de idiomas no esta documentado.

## Casos de uso

- Digitalizacion de libros de actas municipales: procesar los Rats- und Richtebücher linea a linea, segmentando previamente cada pagina con un detector de lineas, para generar transcripciones buscables de fondos municipales de los siglos XV y XVI. El modelo es adecuado porque se entreno especificamente sobre ese corpus.
- Transcripcion de correspondencia de la Reforma: digitalizar cartas del corpus Bullinger (Heinrich Bullinger y corresponsales) para alimentar ediciones digitales y bases de datos de prosopografia. La ventaja es que el adaptador ha visto manos de decenas de autores de ese corpus.
- Procesamiento de cartas monásticas: transcribir los documentos de Königsfelden posteriores a 1500 dentro de un pipeline de archivo, con un paso previo de segmentacion de lineas y un paso posterior de correccion ortografica.
- Creacion de corpus de entrenamiento para modelos mayores: usar el modelo como anotador automatico de grandes volumenes de imagenes y filtrar por confianza, dado su bajo coste de inferencia (4B parametros).
- Busqueda full-text en archivos historicos: transcribir fondos completos para habilitar busqueda por palabra clave y recuperacion de informacion sobre documentos que hasta ahora solo existian como imagenes.
- Investigacion en humanidades digitales: generar transcripciones de referencia para estudios de linguistica historica, con la advertencia de que el CER del 11,20 % exige revision humana en publicaciones academicas.
- Despliegue en infraestructura modesta: al ser un adaptador sobre un modelo de 4B, puede ejecutarse en una unica GPU de consumo, lo que permite a archivos pequenos digitalizar fondos sin acceso a clústeres de calculo.

## Benchmarks y rendimiento

Evaluacion publicada por el autor sobre su propia particion de validacion reservada (200 muestras, 8.266 caracteres):

| Metrica | Valor |
|---|---|
| CER | 11,20 % |
| WER | 27,87 % |
| Muestras evaluadas | 200 |
| Caracteres evaluados | 8.266 |
| Errores de caracter | 926 |

Evaluacion de granularidad de entrada (14 paginas reservadas, 2026-09-22):

| Entrada | n | CER | Ratio de longitud |
|---|---:|---:|---:|
| Recortes de linea | 594 | 0,111 | 1,00 |
| Parrafos, presupuesto de pagina | 91 | 1,96 | 1,24 |
| Parrafos, presupuesto de linea | 91 | 0,94 | 0,07 |
| Paginas completas | 14 | 1,00 | 0,001 |

No se han publicado resultados de benchmarks en la informacion disponible comparables con otros modelos HTR en un conjunto compartido. El propio autor advierte que la cifra de CER no es transferible a otros corpus.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; como adaptador sobre un modelo de 4B parametros, la inferencia en precision completa requiere aproximadamente 8-10 GB, y en cuantizacion de 4 bits puede situarse en torno a 3-4 GB (estimacion orientativa, no confirmada por el autor).
- GPU recomendadas: no especificadas por el autor. Por tamano del modelo base, una RTX 4090 (24 GB) o una A100/H100 son suficientes; una GPU de consumo de gama media-alta con 8-12 GB deberia bastar en cuantizacion.
- Cabe en GPU de consumo: si, previsiblemente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores, en funcion de la cuantizacion del modelo base.
- Opciones de despliegue: vLLM (etiqueta del repositorio), y por herencia del modelo base, llama.cpp/Ollama y TGI si se convierte el adaptador. El autor menciona el servicio `serving-atr-inference`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3vl-medieval-german-v3 | 4B (base) + LoRA | no disponible | HTR aleman medieval | MIT | Hugging Face |
| Qwen/Qwen3-VL-4B-Instruct | 4B | no disponible | Vision-lenguaje generalista | no disponible en la informacion | Hugging Face |
| Transkribus (servicio comercial) | no disponible | no disponible | HTR historico multilingue | propietaria | SaaS |
| Kraken / eScriptorium | no disponible | no disponible | HTR open source entrenable | open source | GitHub |

No se dispone de datos de rendimiento comparables entre estos modelos en la informacion proporcionada; la comparacion se limita a categoria, licencia y disponibilidad.

## Limitaciones y advertencias

- Granularidad estricta: el modelo solo funciona correctamente con recortes de linea. Con paginas completas devuelve dos caracteres ("de" o "te"); con parrafos, el ratio de longitud cae a 0,07-0,24. Es obligatorio segmentar la pagina antes de la inferencia.
- El CER del 11,20 % se midio sobre la particion de validacion del propio entrenamiento y mezcla proyectos retenidos con paginas no vistas de proyectos vistos; el autor lo califica de "mayoritariamente in-domain" y no es comparable con benchmarks externos.
- Frontera de datos reservados: 3.091 de las 11.448 paginas de entrenamiento pertenecen a 345 documentos reservados para el conjunto de evaluacion `german-medieval-v1`. No debe puntuarse el modelo sobre ese conjunto, ya que ha visto esos documentos.
- Riesgo de alucinacion y de bucles: el autor documenta casos de repeticion ("und er und er...") hasta agotar el limite de tokens en entradas de parrafo.
- Sesgos conocidos: no documentados en la informacion proporcionada.
- Limitaciones de idioma: el dominio es el aleman historico de los siglos XIV-XVII; el rendimiento fuera de ese dominio no esta documentado.
- Licencia MIT: permite uso comercial, pero el modelo base Qwen3-VL-4B-Instruct tiene su propia licencia, que debe verificarse por separado.
- En produccion, la tasa de error de palabra (27,87 %) exige revision humana o un paso de correccion posterior para transcripciones de calidad editorial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dh-unibe/qwen3vl-medieval-german-v3
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Repositorio de inferencia: https://github.com/thodel/serving-atr-inference
- Script de evaluacion de granularidad: https://github.com/thodel/serving-atr-inference/blob/main/scripts/eval_granularity.py
- Incidencia sobre granularidad: https://github.com/thodel/serving-atr-inference/issues/165
- Incidencia sobre frontera de datos reservados: https://github.com/thodel/training-atr-models/issues/247
- Dataset Rats- und Richtebücher: https://huggingface.co/datasets/dh-unibe/image-text_rats-und-richtebuecher_xv-xvi
- Dataset Bullinger: https://huggingface.co/datasets/dh-unibe/image-text_bullinger-autoren
- Dataset Königsfelden: https://huggingface.co/datasets/dh-unibe/image-text_koenigsfelden-charters-post-1500
- Dataset AAEB: https://huggingface.co/datasets/dh-unibe/image-text_aaeb-xiv-xvii
