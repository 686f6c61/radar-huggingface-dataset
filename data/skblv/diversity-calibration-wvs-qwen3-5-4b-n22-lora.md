# skblv/diversity-calibration-wvs-qwen3.5-4b-n22-lora

## Resumen

El modelo `skblv/diversity-calibration-wvs-qwen3.5-4b-n22-lora` es un adaptador LoRA (Low-Rank Adaptation) entrenado sobre el modelo base Qwen/Qwen3.5-4B. Lo desarrolla el usuario skblv (autores citados: Kirill Skobelev, Eric Fithian y X. Y. Han) como artefacto experimental asociado al articulo arXiv:2609.16454, titulado "Fine-Tuning Fixes Mode Collapse and Over-Dispersion in LLMs". No se trata de un modelo de proposito general, sino de un adaptador de investigacion orientado a calibrar la diversidad de respuestas de un LLM en encuestas de opinion.

El adaptador se ha afinado durante tres epocas sobre un conjunto de solo 22 ejemplos de encuestado-pregunta extraidos de la World Values Survey (ola 7). Cada prompt incluye una persona demografica, la pregunta de la encuesta y opciones de respuesta etiquetadas con letras; el objetivo de entrenamiento es la letra de respuesta del encuestado. El interes tecnico reside en que el trabajo estudia como el ajuste fino modifica la diversidad de las distribuciones generadas (mode collapse y sobredispersion), un fenomeno relevante para cualquier sistema que use LLMs para simular poblaciones o generar respuestas diversas.

Por su naturaleza, es un artefacto de investigacion reproducible mas que un modelo desplegable en produccion: el repositorio ocupa 0,1 GB, no tiene descargas ni likes, y la model card no documenta idiomas, licencia ni evaluaciones de rendimiento general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen/Qwen3.5-4B; rango 16, alpha 32, dropout 0,05 |
| Parametros totales | No disponible (adaptador LoRA; el modelo base Qwen3.5-4B tiene 4B) |
| Parametros activos | No disponible (no es MoE; el modelo base no se documenta como MoE en la informacion disponible) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen/Qwen3.5-4B, no especificada) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere cargar el modelo base Qwen/Qwen3.5-4B |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 con alpha 32 y dropout 0,05, aplicado sobre el modelo Qwen/Qwen3.5-4B. El entrenamiento consistio en tres epocas sobre 22 ejemplos de la World Values Survey (ola 7), usando un subconjunto fijo de un tercio de paises y preguntas medibles seleccionado aleatoriamente. Los tokens del prompt se enmascararon en la perdida; la perdida se aplico unicamente a los tokens de la letra de respuesta y al token EOS, de modo que el adaptador aprende a mapear persona demografica y pregunta a la letra de opcion elegida.

El objetivo del trabajo subyacente es la calibracion de diversidad: el articulo estudia como el ajuste fino corrige el mode collapse (respuestas excesivamente homogeneas) y la sobredispersion (respuestas demasiado variadas) en LLMs. La model card incluye una curva de convergencia de diversidad relativa, donde el adaptador se marca con un cuadrado rojo, la banda sombreada representa el percentil 25-75 entre pares pregunta-grupo demografico y la linea discontinua marca la diversidad calibrada (R = 1). Los datos proceden de Haerpfer et al. (2022), World Values Survey Round Seven, Country-Pooled Datafile v6.0.0.

## Capacidades

- Generacion de texto condicionada a persona demografica y pregunta de encuesta, devolviendo la letra de la opcion de respuesta.
- Modelado de distribuciones de respuesta con diversidad calibrada, segun la metodologia del articulo asociado.
- Simulacion de respuestas de encuestados en el dominio acotado de la World Values Survey (ola 7).
- Capacidades heredadas del modelo base Qwen3.5-4B (generacion de texto general), aunque el adaptador esta especializado y no se documenta su rendimiento fuera del dominio de entrenamiento.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no documentadas.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Investigacion sobre calibracion de diversidad en LLMs: el adaptador sirve como punto de comparacion reproducible para estudiar mode collapse y sobredispersion, cargandolo sobre Qwen3.5-4B y midiendo la diversidad relativa de las respuestas generadas.
- Simulacion de opiniones en encuestas: dado un perfil demografico y una pregunta de la WVS, el modelo genera la letra de opcion mas probable, util para prototipar agentes sinteticos de encuestados en estudios metodologicos.
- Reproduccion de experimentos academicos: al estar vinculado a arXiv:2609.16454 y a un dataset publico con DOI, permite replicar las curvas de convergencia de diversidad del articulo.
- Evaluacion de tecnicas PEFT: con 22 ejemplos y rango 16, es un caso extremo de ajuste fino con pocos datos, util para medir el efecto del tamano de muestra en la especializacion de un adaptador.
- Analisis de sesgo demografico en respuestas: al condicionar por persona, permite examinar como varian las distribuciones de respuesta entre grupos demograficos en el subconjunto de paises de entrenamiento.
- Docencia y formacion en ajuste fino: ejemplo minimo y reproducible de entrenamiento LoRA con enmascaramiento de tokens de prompt y perdida restringida a la respuesta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica reportada es cualitativa y grafica: la curva de convergencia de diversidad relativa incluida en la model card, sin valores numericos en el texto.

## Requisitos de hardware

- VRAM estimada: no disponible de forma especifica para el adaptador; depende del modelo base Qwen3.5-4B. Como referencia orientativa para un modelo de 4B, la inferencia en FP16 requiere del orden de 8-10 GB, y en cuantizacion de 4 bits del orden de 3-4 GB, aunque estos valores no los confirma la informacion proporcionada.
- GPU recomendadas: no disponibles en la informacion proporcionada; para un modelo base de 4B son suficientes GPUs consumer de gama alta, pero no hay datos del autor al respecto.
- Cabe en GPU consumer: previsiblemente si, segun el tamano del modelo base, aunque no se documenta.
- Opciones de despliegue: la libreria declarada es PEFT; el adaptador se cargaria con `peft` sobre el modelo base. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada adaptadores LoRA comparables de calibracion de diversidad sobre Qwen3.5-4B ni alternativas de la misma categoria con datos verificables.

## Limitaciones y advertencias

- Conjunto de entrenamiento extremadamente pequeno (22 ejemplos, un tercio de paises y preguntas), por lo que el adaptador no generaliza fuera de ese subconjunto.
- Especializado en una unica tarea (devolver la letra de opcion de una pregunta de la WVS); no es un modelo de proposito general.
- Licencia no disponible: no se puede confirmar el uso comercial ni las condiciones de redistribucion.
- Idiomas no documentados; el dominio de entrenamiento es la WVS, con preguntas en el idioma del dataset original.
- Riesgo de alucinacion no evaluado; el modelo puede emitir letras de opcion no validas o fuera del conjunto de opciones.
- Sesgos demograficos y de pais heredados del subconjunto de la WVS usado en el entrenamiento.
- Sin descargas ni validacion de la comunidad (0 descargas, 0 likes en el momento de la consulta); artefacto de investigacion sin soporte.
- Requiere cargar el modelo base Qwen/Qwen3.5-4B, cuyas condiciones de licencia y contexto no se detallan en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/skblv/diversity-calibration-wvs-qwen3.5-4b-n22-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Articulo: https://arxiv.org/abs/2609.16454
- Dataset WVS ola 7 (DOI): https://doi.org/10.14281/18241.24
