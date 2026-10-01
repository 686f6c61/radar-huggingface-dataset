# la0ka1/ELF-M-T5Gemma2

## Resumen

ELF-M-T5Gemma2 es un modelo de difusion continuo para generacion de texto desarrollado por la0ka1 (Zekai Zhang y colaboradores) y presentado en el articulo *Scaling and Distilling Text Embeddings for Better Diffusibility* (2026). A diferencia de un transformer autorregresivo convencional, ELF (Embedded Language Flow) no predice el siguiente token: genera por flow matching una secuencia completa de embeddings de texto y despues los decodifica a tokens con una cabeza propia. El modelo se entrena sobre los embeddings congelados del codificador T5Gemma-2, lo que lo situa como artefacto de investigacion sobre espacios latentes de embeddings.

El checkpoint combina 327 M de parametros en el transformer de difusion y 168 M en la cabeza de decodificacion, unos 495 M en total, con secuencias de entrenamiento de 1024 tokens. Se entreno durante 5 epocas con batch de 512 sobre OpenWebText, en ingles y sin filtrado. El muestreo emplea un sampler SDE con guiado por self-conditioning, controlado por los parametros `--sc` (escala de guiado) y `--nfe` (numero de pasos).

Su relevancia es puramente investigadora: es una release de los autores del paper, no un producto pensado para uso downstream. No soporta instrucciones, tool calling ni conversacion, y su licencia deriva de los Gemma Terms of Use al haberse entrenado sobre salidas de un derivado de T5Gemma-2. A fecha de la ficha acumula 0 descargas y 1 like en HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion continuo (Embedded Language Flow, ELF) sobre embeddings de texto; backbone transformer para el flow matching y cabeza de decodificacion a tokens |
| Parametros totales | ~495 M (327 M en el transformer + 168 M en la cabeza de decodificacion) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 1024 tokens (longitud de secuencia de entrenamiento) |
| Tipos de cuantizacion | no disponible (se publica un unico checkpoint en precision completa, sin variantes GGUF, AWQ o GPTQ) |
| Idiomas soportados | ingles (en) |
| Licencia | Gemma Terms of Use (el codigo del paper se publica bajo licencia MIT) |
| Formato de pesos | PyTorch (`ELF-M-T5Gemma2.pt`, pesos EMA mas config); no se publican safetensors ni GGUF |

## Arquitectura y entrenamiento

ELF no es un transformer autorregresivo: es un modelo de difusion continuo que trabaja en el espacio de embeddings de texto en lugar del espacio discreto de tokens. El modelo aprende una ruta de flow matching que transforma ruido en una secuencia de embeddings de 1024 posiciones y, a continuacion, una cabeza de decodificacion de 168 M de parametros traduce esos embeddings a tokens. Esta compuesto por 327 M de parametros en el transformer que modela el flujo y 168 M en la cabeza de decodificacion, con un total aproximado de 495 M. El codificador T5Gemma-2 se usa congelado durante el entrenamiento y no forma parte del checkpoint publicado, ya que la decodificacion la realiza la cabeza propia del modelo.

El entrenamiento se realizo sobre OpenWebText, en secuencias de 1024 tokens, durante 5 epocas con batch de 512, partiendo de los embeddings congelados del codificador T5Gemma-2. No se documentan fases de RLHF, DPO ni ajuste por instrucciones. La innovacion principal es precisamente el objeto del paper: escalar y destilar embeddings de texto para mejorar su "difusibilidad", es decir, para que el espacio latente de embeddings resulte mas facil de modelar mediante flow matching. El muestreo utiliza un sampler SDE con guiado por self-conditioning, donde `--sc` fija la escala de guiado y `--nfe` el numero de evaluaciones de funcion por muestra. El checkpoint contiene los pesos promediados por EMA y un config con tamano de modelo, dimension de embedding, longitud de secuencia, vocabulario, tokenizer y media y desviacion tipica del embedding.

## Capacidades

- Generacion de texto incondicional en ingles: produce texto estilo web a partir de ruido, sin prompt ni condicionamiento de entrada.
- Modelado generativo en espacio de embeddings: genera secuencias de embeddings de 1024 posiciones que despues decodifica a tokens.
- Decodificacion embeddings-a-tokens mediante cabeza dedicada de 168 M de parametros.
- Control de calidad y coste en inferencia mediante los parametros `--sc` (escala de guiado) y `--nfe` (pasos del sampler SDE).
- Soporte de tool calling / function calling: no disponible; el modelo no acepta instrucciones ni formatos estructurados.
- Soporte de agentes y razonamiento multi-paso: no disponible; no hay modo de razonamiento ni planificacion.
- Capacidades multilingues: no; el modelo esta entrenado y evaluado unicamente en ingles.
- Vision, audio o modalidades adicionales: no disponible.
- Capacidad especial: modo de difusion con self-conditioning guidance para muestreo; no dispone de "thinking mode" ni de decodificacion especulativa.

## Casos de uso

- Investigacion sobre espacios latentes de embeddings: el modelo permite estudiar como se organiza el espacio de embeddings de un codificador congelado (T5Gemma-2) y que propiedades lo hacen mas o menos difundible, que es la pregunta central del paper.
- Evaluacion de cabezas de decodificacion embeddings-a-tokens: permite medir cuanto se pierde al reconstruir texto desde embeddings continuos usando una cabeza de 168 M de parametros frente al vocabulario original del tokenizer.
- Estudio comparativo de samplers de difusion: el modelo expone un sampler SDE con guiado por self-conditioning y dos ejes de control (`--sc` y `--nfe`), lo que lo hace util para analizar el compromiso entre perplejidad generativa y coste computacional.
- Baseline de difusion continua frente a modelos autorregresivos: con 495 M de parametros y una perplejidad generativa de 19,3 en OpenWebText, sirve como referencia para comparar familias de modelos generativos de tamano similar.
- Analisis de sesgos y contaminacion en corpus web: al entrenarse sobre OpenWebText sin filtrar y generar texto web en ingles, permite reproducir y auditar los sesgos y falsedades presentes en ese corpus.
- Reproduccion de resultados del paper: el repositorio oficial incluye `sample.py` y `evaluate.py` para regenerar muestras (por ejemplo `--n 1024 --sc 2 --nfe 256`) y volver a calcular la perplejidad generativa bajo GPT-2-Large.
- Destilacion de embeddings de texto: el trabajo explora destilar embeddings escalados para mejorar la difusibilidad, por lo que el modelo es un punto de partida para experimentos de destilacion sobre representaciones textuales.

## Benchmarks y rendimiento

| Benchmark | Configuracion | Resultado |
|---|---|---|
| Perplejidad generativa bajo GPT-2-Large (unigram entropy) en OpenWebText, 1024 tokens | `--sc 2 --nfe 256` | 19,3, con entropia 5,44 |
| Texto real (referencia) | - | 15,4, con entropia 5,43 |

La perplejidad generativa se calcula como media sobre 3 semillas con 1024 muestras cada una. El barrido completo de `--sc` y `--nfe` se remite al paper. No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de tareas, lo cual es coherente con un modelo incondicional sin ajuste por instrucciones.

## Requisitos de hardware

- Tamano del checkpoint: 2,0 GB en el repositorio de HuggingFace, correspondiente a los pesos EMA en precision completa.
- VRAM estimada en fp32: en torno a 2,0-2,5 GB solo para pesos, mas activaciones y buffers del sampler; se recomienda un margen de 4-6 GB para secuencias de 1024 tokens.
- VRAM estimada en fp16/bf16: alrededor de 1,0-1,5 GB de pesos, con un consumo total previsible de 2-3 GB.
- GPU de consumo: si cabe en tarjetas con 8 GB o mas (RTX 3060 12 GB, RTX 3070, RTX 4060 Ti, RTX 4070, RTX 3080, RTX 4090). En GPUs con 6 GB o menos el margen es muy ajustado.
- GPU de datacenter: A100, H100, L40S y similares son sobredimensionadas para 495 M de parametros, aunque utiles para generar lotes grandes de muestras en el barrido de `--sc` y `--nfe`.
- CPU: la inferencia es posible en CPU, pero con 256 pasos de sampler por muestra la latencia sera muy alta; no se publican cifras concretas.
- Opciones de despliegue: no es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que no es un transformer autorregresivo ni se distribuye en GGUF. El unico camino documentado es el repositorio oficial `la0ka1/diffusing-scaled-text-embeddings`, que descarga el checkpoint y el tokenizer en el primer uso.
- Latencia y throughput: no disponibles. El coste depende linealmente de `--nfe` (256 pasos en la configuracion de evaluacion) y del sampler SDE empleado.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos de rendimiento, contexto o licencia de otros modelos de difusion de lenguaje continuos, por lo que la comparativa numerica no esta disponible. Se indica a continuacion unicamente lo verificable de este modelo:

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ELF-M-T5Gemma2 | ~495 M (327 M transformer + 168 M cabeza) | 1024 tokens | Gen. PPL 19,3 con entropia 5,44 en OpenWebText (`--sc 2 --nfe 256`) | Gemma Terms of Use (codigo MIT) | HuggingFace, 0 descargas, 1 like |
| Alternativas de la misma categoria (por ejemplo, otros modelos de difusion de lenguaje continuos) | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo incondicional: no acepta prompts, instrucciones ni condicionamiento. No puede usarse como asistente, chatbot ni generador dirigido.
- Sesgos conocidos: el autor advierte explicitamente de que el modelo genera texto web sin filtrar y puede producir contenido falso o sesgado, heredado de OpenWebText.
- Riesgo de alucinacion: alto por diseno, ya que no hay verificacion factual ni anclaje a una fuente; no existe mecanismo de citacion o grounding.
- Limitacion idiomatica: solo ingles. No hay soporte de castellano ni de otros idiomas.
- Limitacion de longitud: las secuencias estan fijadas en 1024 tokens; no hay ventana de contexto extensible ni memoria conversacional.
- Restricciones de licencia: se distribuye bajo los Gemma Terms of Use al estar entrenado sobre salidas de un derivado de T5Gemma-2, lo que incluye la Gemma Prohibited Use Policy. El uso comercial queda sujeto a esos terminos; el codigo, en cambio, es MIT.
- Naturaleza del artefacto: el autor lo describe como una release de investigacion para estudiar embeddings de texto como espacios latentes, y declara que no esta construido para ningun uso downstream.
- Advertencia de produccion: se trata de un modelo no endorsementado por Google y no es un producto de Google. No se recomienda su uso en sistemas en produccion.
- Sin soporte de cuantizacion: al no existir variantes GGUF o AWQ, el despliegue eficiente en entornos de inferencia estandar no esta cubierto por el autor.

## Enlaces

- HuggingFace: https://huggingface.co/la0ka1/ELF-M-T5Gemma2
- Codigo: https://github.com/la0ka1/diffusing-scaled-text-embeddings
- Pagina del proyecto: https://la0ka1.github.io/diffusing-scaled-text-embeddings/
- Coleccion con todos los modelos de la release: https://huggingface.co/collections/la0ka1/diffusing-scaled-text-embeddings-6abd7ff3c91fd70bd749c197
- Paper: no disponible (anunciado como proximo en arXiv en la model card; cita `zhang2026scaling`, *Scaling and Distilling Text Embeddings for Better Diffusibility*, Zhang, Tian, He, Zhang, Zhao, Qu y Fu, 2026)
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Gemma Prohibited Use Policy: https://ai.google.dev/gemma/prohibited_use_policy
