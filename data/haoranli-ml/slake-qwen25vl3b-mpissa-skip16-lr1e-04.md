# haoranli-ml/slake-qwen25vl3b-mpissa-skip16-lr1e-04

## Resumen
Este repositorio contiene un adaptador LoRA (PEFT) entrenado sobre el modelo base Qwen/Qwen2.5-VL-3B-Instruct, un modelo multimodal vision-lenguaje de 3 mil millones de parametros desarrollado por Alibaba Qwen. El adaptador, publicado por el usuario haoranli-ml, esta orientado a tareas de generacion de texto sobre imagenes medicas, segun se deduce del identificador del repositorio ("slake", en referencia al dataset SLAKE de imagenes radiologicas y preguntas visuales) y del sufijo del nombre ("mpissa-skip16-lr1e-04", que apunta a hiperparametros de entrenamiento LoRA: rank, skip y learning rate).

El modelo resuelve el problema del ajuste fino eficiente de un VLM compacto para dominios especializados sin necesidad de reentrenar el modelo completo: el adaptador pesa aproximadamente 0,2 GB, lo que permite cargarlo sobre el modelo base en entornos con recursos limitados. Es relevante para investigadores que trabajan en vision-lenguaje medico, ya que demuestra un flujo de trabajo reproducible (PEFT + transformers) para adaptar Qwen2.5-VL-3B a tareas de pregunta-respuesta visual sobre imagenes clinicas.

La model card esta practicamente vacia (plantilla estandar de Hugging Face sin cumplimentar), por lo que muchos datos tecnicos del adaptador (licencia, idiomas, datos de entrenamiento, resultados de evaluacion) no estan disponibles y se marcan explicitamente como tal en esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer multimodal Qwen2.5-VL-3B-Instruct |
| Parametros totales | No disponible (modelo base: 3B; el adaptador LoRA solo almacena los pesos de las matrices de baja dimension) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-VL-3B-Instruct) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantizacion aplicable depende del modelo base) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |
| Libreria | PEFT 0.21.2, transformers |
| Modelo base | Qwen/Qwen2.5-VL-3B-Instruct |
| Tamano del repositorio | 0,2 GB |
| Pipeline | text-generation |

## Arquitectura y entrenamiento
El adaptador se aplica sobre Qwen2.5-VL-3B-Instruct, un transformer multimodal que combina un codificador visual con un decodificador de lenguaje de 3B parametros. El adaptador en si es un modulo LoRA (Low-Rank Adaptation) que congela los pesos del modelo base e inyecta matrices de rango reducido en determinadas capas, reduciendo drasticamente el numero de parametros entrenables. El repositorio usa la libreria PEFT 0.21.2 y se carga mediante transformers.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens, la composicion de los datos, ni si se aplicaron tecnicas de RLHF o DPO. El identificador del repositorio sugiere un ajuste fino sobre el dataset SLAKE (imagenes radiologicas con pares pregunta-respuesta) con hiperparametros LoRA que incluyen un learning rate de 1e-4 y algun tipo de skip (posiblemente skip de capas o de pasos de entrenamiento), pero estos detalles no estan documentados en la model card y no deben darse por confirmados. El tag arxiv:1910.09700 corresponde a la calculadora de impacto medioambiental de Lacoste et al. (2019), citada en la plantilla, no a un paper del modelo.

## Capacidades
- Generacion de texto condicionada por imagen, heredada del modelo base multimodal Qwen2.5-VL-3B-Instruct.
- Respuesta a preguntas visuales (VQA) sobre imagenes, presumiblemente en el dominio medico segun el identificador del repositorio.
- Capacidades de razonamiento visual y descripcion de contenido de imagenes, segun las capacidades del modelo base.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada para este adaptador (depende del modelo base).
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible.
- Capacidades especiales (thinking mode, vision, audio): vision heredada del modelo base; thinking mode y audio no disponibles.

## Casos de uso
- Pregunta-respuesta visual sobre radiografias: el adaptador puede cargarse sobre Qwen2.5-VL-3B-Instruct para responder preguntas clinicas sobre imagenes radiologicas, aprovechando el ajuste fino sobre un dataset medico.
- Investigacion en vision-lenguaje medico: sirve como punto de partida reproducible para experimentos de ajuste fino LoRA sobre VLMs compactos en dominios clinicos.
- Evaluacion comparativa de adaptadores LoRA: al pesar solo 0,2 GB, permite intercambiar rapidamente distintos adaptadores sobre el mismo modelo base para comparar configuraciones de entrenamiento.
- Prototipado en entornos con recursos limitados: al combinarse con un modelo base de 3B, puede desplegarse en GPUs de consumo para pruebas de concepto de VQA medico.
- Generacion de informes descriptivos de imagenes: el modelo puede producir descripciones textuales de hallazgos visuales, utiles como borrador para revision por personal clinico.
- Filtrado y anotacion asistida de datasets medicos: puede usarse para pre-etiquetar pares imagen-pregunta-respuesta antes de la revision humana.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma especifica para el adaptador; el modelo base Qwen2.5-VL-3B-Instruct en precision bf16 requiere aproximadamente 6-7 GB de VRAM solo para los pesos, mas memoria para el codificador visual y el cache KV.
- GPU recomendadas: no disponible en la informacion proporcionada; por el tamano del modelo base (3B), GPUs de consumo como RTX 3090 o RTX 4090 (24 GB) deberian ser suficientes para inferencia en bf16.
- Cabe en GPU de consumo: previsiblemente si, dado el tamano del modelo base (3B) y del adaptador (0,2 GB), aunque no hay datos confirmados.
- Opciones de despliegue: transformers con PEFT (metodo documentado); vLLM, llama.cpp, Ollama o TGI no estan confirmados para este adaptador en la informacion disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| haoranli-ml/slake-qwen25vl3b-mpissa-skip16-lr1e-04 (este) | Adaptador LoRA sobre 3B | No disponible | No disponible | Hugging Face (0 descargas) |
| Qwen/Qwen2.5-VL-3B-Instruct (modelo base) | 3B | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | Hugging Face (modelo oficial) |
| Alternativas de la misma categoria | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de rendimiento para establecer una comparativa cuantitativa con otros adaptadores o VLMs de tamano similar.

## Limitaciones y advertencias
- La model card esta sin cumplimentar: no hay informacion sobre sesgos, riesgos, datos de entrenamiento ni evaluacion.
- Riesgo de alucinacion: inherente a los modelos de lenguaje y agravado en dominios medicos, donde respuestas incorrectas pueden tener consecuencias graves; no debe usarse como sustituto del juicio clinico.
- Sesgos conocidos: no documentados; al entrenarse presumiblemente sobre un dataset medico concreto, puede heredar sesgos de ese dataset (demografia, equipos de imagen, patologias sobrerrepresentadas).
- Limitaciones de contexto e idioma: no disponibles; dependen del modelo base y del dataset de ajuste.
- Restricciones de licencia: la licencia del adaptador no esta disponible, lo que impide confirmar si se permite uso comercial. La licencia del modelo base Qwen debe verificarse por separado.
- Caveat para produccion: repositorio con 0 descargas y 0 likes, creado y actualizado en noviembre de 2026, sin validacion comunitaria; no apto para uso clinico real sin evaluacion independiente y aprobacion regulatoria.
- El adaptador requiere cargar el modelo base Qwen2.5-VL-3B-Instruct, lo que anade dependencia de un modelo externo y de su licencia.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/haoranli-ml/slake-qwen25vl3b-mpissa-skip16-lr1e-04
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct
- Libreria PEFT: https://github.com/huggingface/peft
- Paper citado en la plantilla (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto medioambiental: https://mlco2.github.io/impact#compute
