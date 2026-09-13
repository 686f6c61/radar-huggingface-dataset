# fpadovani/ppt-wc-zipf-newlex-77-eng-100mb_seed5

## Resumen

El modelo `fpadovani/ppt-wc-zipf-newlex-77-eng-100mb_seed5` es un ajuste fino (SFT) de
`goldfish-models/eng_latn_100mb`, un modelo de lenguaje monolingüe de pequeno tamano
orientado al ingles en escritura latina. Lo publica el usuario `fpadovani`, cuyo registro
de entrenamiento en Weights & Biases apunta al proyecto `white_cotterell` de la
Universidad de Groninga, lo que situa el trabajo en el ambito de la investigacion
academica en procesamiento del lenguaje natural y no en el de un modelo de produccion
comercial.

Tecnicamente es un transformer decoder de tipo GPT-2 (asi lo declara la etiqueta `gpt2`
del repositorio) con 86.508.288 parametros y pesos en `safetensors`. El entrenamiento se
realizo con TRL 0.23.0 en modo SFT, partiendo de un corpus base de 100 MB, y todo indica
que forma parte de una bateria de experimentos con distintas semillas y variantes de
vocabulario o de distribucion Zipf, dado el patron de nombres (`ppt-wc-zipf-newlex-77`,
`seed5`) y la existencia de repositorios hermanos con configuraciones equivalentes.

Su relevancia es, por tanto, experimental: sirve como punto de control reproducible para
estudios de ajuste supervisado, tokenizacion y efectos de sesgo de seleccion en corpus
reducidos, no como alternativa a modelos generativos de gran escala. La model card es
minima, no declara licencia ni idiomas, no aporta resultados de benchmarks y el modelo
acumula cero descargas y cero valoraciones en el Hub en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder de tipo GPT-2 (etiqueta `gpt2` del repositorio); no se detalla en la model card |
| Parametros totales | 86.508.288 (dato real de los pesos en `safetensors`) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos `safetensors`) |
| Idiomas soportados | no declarados; el nombre del modelo y su base (`goldfish-models/eng_latn_100mb`) apuntan al ingles en escritura latina, sin confirmacion en la model card |
| Licencia | no disponible (el campo `licence` del README tiene el valor generico `license`, sin texto legal) |
| Formato de pesos | `safetensors` (libreria `transformers`) |
| Modelo base | `goldfish-models/eng_latn_100mb` |
| Metodo de entrenamiento | SFT con TRL 0.23.0 |
| Tamano del repositorio | 1,4 GB |
| Fecha de publicacion | 13 de septiembre de 2026 (segun metadatos del Hub) |
| Descargas / valoraciones | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder autorregresivo estilo GPT-2, segun la
etiqueta declarada por el autor. Con 86,5 millones de parametros, se situa por debajo de
GPT-2 small (124 M) y dentro del rango habitual de los modelos monolingues de investigacion
entrenados sobre corpus de ~100 MB, como la familia Goldfish de la que procede la base. La
informacion disponible no especifica el numero de capas, la dimension del modelo, el numero
de cabezas de atencion ni la longitud de contexto, por lo que estos datos deben consultarse
en el repositorio del modelo base.

El entrenamiento consistio en un ajuste supervisado (SFT) ejecutado con TRL 0.23.0 sobre
Transformers 4.56.2, PyTorch 2.11.0, Datasets 4.8.4 y Tokenizers 0.22.1. No se documenta el
volumen de tokens de la fase de ajuste, la composicion del dataset, ni si hubo etapas
posteriores de RLHF, DPO u optimizacion por preferencias: ese dato figura como no
disponible. El nombre del modelo sugiere una rejilla experimental con variantes de
tokenizacion o de vocabulario (`newlex`), de distribucion Zipf y de semilla aleatoria
(`seed5`), lo que encaja con un estudio de sensibilidad de resultados; el registro de
entrenamiento esta publicado en Weights & Biases bajo el proyecto `white_cotterell`. No se
declara ninguna innovacion tecnica adicional (atencion lineal, decodificacion especulativa,
MoE o SSM) en la informacion disponible.

## Capacidades

- Generacion de texto autorregresiva en el formato de completado de GPT-2, invocable
  mediante `pipeline("text-generation")` de Transformers.
- Acepta entradas en formato de conversacion (lista de mensajes con `role` y `content`),
  segun el ejemplo de inicio rapido de su propia model card.
- Ajuste por instrucciones mediante SFT, aunque sin datos publicos sobre el dataset de
  instrucciones utilizado.
- Inferencia compatible con Text Generation Inference (TGI) y con endpoints, segun las
  etiquetas `text-generation-inference` y `endpoints_compatible`.
- Capacidades multilingues: no disponibles; el modelo base es de ingles en escritura
  latina y no hay evidencia publicada de cobertura de otros idiomas.
- Tool calling / function calling: no documentado.
- Uso como agente o razonamiento multi-paso: no documentado.
- Vision, audio o modo de razonamiento explicito (*thinking mode*): no soportados segun la
  informacion disponible.
- Capacidad especial: ninguna declarada mas alla de la generacion de texto.

## Casos de uso

- Reproducibilidad de experimentos academicos: el modelo actua como punto de control
  congelado (`seed5`) de una rejilla de experimentos SFT sobre un corpus de 100 MB, lo que
  permite repetir comparaciones entre semillas y variantes de vocabulario sin reentrenar.
- Estudio de tokenizacion y del sesgo Zipf: dado el sufijo `zipf-newlex` del nombre, el
  modelo es util para analizar como distintas construcciones de vocabulario y distintas
  distribuciones de frecuencia afectan a las curvas de perdida y a la calidad del texto
  generado en corpus pequenos.
- Pruebas de infraestructura de inferencia: con 86,5 millones de parametros y pesos
  `safetensors`, sirve como carga de trabajo ligera para validar despliegues con TGI, vLLM
  o endpoints compatibles antes de pasar a modelos grandes.
- Ajuste fino educativo y docencia: su tamano permite ejecutar el ciclo completo de SFT en
  una unica GPU de consumo o incluso en CPU, lo que lo hace apto para practicas de aula
  sobre el flujo `datasets` + `trl` + `transformers`.
- Generacion de texto de bajo coste energético en el borde: al ocupar del orden de 0,17 GB
  en precision de 16 bits, puede desplegarse en dispositivos con recursos muy limitados
  para tareas de completado de texto sin requisitos de calidad alta.
- Experimentos de alineacion y comparacion de metodos: sirve como linea base barata para
  contrastar SFT frente a DPO u otras tecnicas, dado que el coste de un ciclo completo de
  entrenamiento es reducido.
- Generacion de datos sinteticos a pequena escala para tareas auxiliares (por ejemplo,
  aumento de corpus en ingles), siempre que se filtren y revisen las salidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no
incluye ninguna tabla de evaluacion (MMLU, HumanEval, GSM8K ni equivalentes), y el
repositorio del Hub no registra descargas ni valoraciones que permitan inferir un uso
contrastado.

## Requisitos de hardware

- VRAM estimada para inferencia, calculada a partir de los 86.508.288 parametros:
  aproximadamente 0,35 GB en fp32, 0,17 GB en fp16/bf16 y 0,09 GB en int8, a lo que hay que
  sumar la memoria de activaciones y la cache KV, que dependen del contexto utilizado.
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en
  GPUs integradas o en CPU para lotes pequenos.
- GPU de datacenter (A100, H100) no necesarias para inferencia; solo tendrian sentido para
  reentrenar el modelo con lotes grandes.
- Opciones de despliegue: `transformers` con `pipeline`, Text Generation Inference (TGI,
  etiqueta declarada por el autor), y conversion a GGUF para llama.cpp u Ollama. El
  despliegue en FriendliAI aparece en la busqueda web para variantes hermanas de la misma
  familia.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por
  segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `fpadovani/ppt-wc-zipf-newlex-77-eng-100mb_seed5` | 86.508.288 | no disponible | no disponible | Hub de Hugging Face, 0 descargas | Ajuste SFT con TRL sobre base Goldfish |
| `goldfish-models/eng_latn_100mb` | no disponible en la informacion proporcionada | no disponible | no disponible | Hub de Hugging Face | Modelo base; entrenado sobre un corpus ingles de 100 MB |
| `fpadovani/ppt-nld_newlexicon_zipf-100mb_seed3407` | 86,7 millones (segun llm-explorer) | no disponible | no disponible | Hub de Hugging Face | Variante hermanada de la misma rejilla experimental, en neerlandes |
| GPT-2 small | 124 millones | 1024 tokens | licencia de OpenAI para GPT-2 | Ampliamente disponible | Referencia clasica de la misma categoria de tamano; no se dispone de una comparacion medida con este modelo |

No hay datos de rendimiento comparado entre estas alternativas en la informacion
disponible, por lo que la comparativa se limita a parametros, contexto y licencia.

## Limitaciones y advertencias

- No hay ningun benchmark publicado: se desconoce su calidad real de generacion frente a
  modelos de tamano comparable.
- Sesgos conocidos: no documentados, pero al derivar de un corpus de 100 MB en ingles
  hereda los sesgos, la cobertura tematica y las limitaciones de registro de ese corpus.
- Riesgo de alucinacion: alto en terminos relativos, por el reducido numero de parametros y
  la ausencia de etapas de alineacion documentadas.
- Limitaciones de contexto e idioma: la longitud de contexto no esta declarada y el modelo
  esta orientado al ingles; no hay evidencia de funcionamiento fiable en castellano ni en
  otros idiomas.
- Restricciones de licencia: la licencia no esta disponible; el campo del README contiene
  el valor generico `license` sin texto legal, por lo que no puede asumirse uso comercial
  libre. Es imprescindible contactar con el autor antes de cualquier uso en produccion.
- Ausencia de soporte: el modelo tiene 0 descargas y 0 valoraciones, y su model card es
  minima, sin documentacion de dataset, hiperparametros ni evaluacion.
- Formato de entrada: el ejemplo de la model card usa una lista de mensajes con roles,
  comportamiento poco habitual en un modelo basado en GPT-2; conviene verificar el
  tokenizador y la plantilla de chat antes de integrarlo.
- No se declara ningun mecanismo de seguridad, moderacion ni filtrado de contenido.
- Fecha de publicacion en el Hub posterior a la fecha actual de consulta, lo que debe
  tenerse en cuenta al citar el modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fpadovani/ppt-wc-zipf-newlex-77-eng-100mb_seed5
- Modelo base: https://huggingface.co/goldfish-models/eng_latn_100mb
- Registro de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/white_cotterell/runs/fvaydw6h
- Repositorio de TRL: https://github.com/huggingface/trl
- Variante hermana en el Hub (`seed657`): https://huggingface.co/fpadovani/ppt-wc-zipf-newlex-77-eng-100mb_seed657
- Variante hermana en FriendliAI (`seed455`): https://friendli.ai/models/fpadovani/ppt-wc-zipf-newlex-eng-100mb_seed455
- Ficha de la variante neerlandesa en llm-explorer: https://llm-explorer.com/model/fpadovani%2Fppt-nld_newlexicon_zipf-100mb_seed3407,5ckKr1sT7X1zQKWRE0kjhN
- Listado de modelos de Hugging Face ordenados por fecha de creacion: https://huggingface.co/models?sort=created
