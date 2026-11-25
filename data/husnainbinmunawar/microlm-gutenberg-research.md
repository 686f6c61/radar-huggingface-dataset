# husnainbinmunawar/microlm-gutenberg-research

## Resumen

MicroLM Gutenberg es un modelo de lenguaje a nivel de carácter, decoder-only y de tamano muy reducido (70.080 parametros), desarrollado por el usuario husnainbinmunawar y publicado en Hugging Face. No es un asistente conversacional ni un modelo de proposito general: se trata de un artefacto de investigacion reproducible orientado a experimentos de prediccion del siguiente carácter en CPU. Su interes no reside en capacidades practicas, sino en servir como referencia metodologica minima para comparar modelos de lenguaje frente a una linea base unigrama.

El modelo fue entrenado desde inicializacion aleatoria durante seis epocas sobre 16.988 ventanas deslizantes extraidas del 85% inicial de un extracto limpio de *Pride and Prejudice* (ebook 1342 de Project Gutenberg). El 15% final se reservo cronologicamente como conjunto de evaluacion, lo que permite medir generalizacion sobre texto no visto de la misma obra. El checkpoint se recargo en un proceso de evaluacion separado y el hash de parametros coincidio con el manifiesto de entrenamiento, un detalle de trazabilidad poco habitual en modelos de este tamano.

Es relevante ahora por su caracter didactico y reproducible: ofrece pesos, tokenizador, configuracion, resultados de evaluacion y manifiesto de procedencia en un repositorio de tamano practicamente nulo (0,0 GB), lo que facilita su uso en docencia, auditoria de pipelines y experimentos controlados en entornos sin GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only a nivel de carácter (microLM) |
| Parametros totales | 70.080 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (definida por ventanas deslizantes; valor exacto no publicado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (entrenado unicamente con texto en ingles de *Pride and Prejudice*) |
| Licencia | other (sujeta a revision de redistribucion; texto fuente bajo Project Gutenberg License) |
| Formato de pesos | safetensors (libreria pytorch) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only a nivel de carácter, es decir, el vocabulario esta formado por caracteres individuales en lugar de subpalabras. Con 70.080 parametros totales, se situa en el rango de los modelos de juguete para docencia: la mayor parte de la capacidad se distribuye entre embeddings de caracteres y unas pocas capas de atencion y feed-forward. El repositorio incluye `config.json` con metadatos de arquitectura y vocabulario, y `tokenizer.json` con el vocabulario de caracteres, aunque los valores concretos de numero de capas, dimension oculta y cabezas de atencion no se detallan en la informacion disponible.

El entrenamiento partio de inicializacion aleatoria durante seis epocas sobre 16.988 ventanas deslizantes (1.596 pasos de entrenamiento) extraidas del 85% inicial de un extracto limpio de *Pride and Prejudice* (Project Gutenberg ebook 1342). El 15% final se reservo cronologicamente como test. No se menciona uso de RLHF, DPO ni ajuste por instrucciones; es un modelo puramente autoregresivo de prediccion del siguiente carácter. La innovacion destacable es de proceso, no de arquitectura: el checkpoint se recargo en un proceso de evaluacion independiente y el hash de parametros coincidio con el manifiesto de entrenamiento (`training_manifest.json`), lo que aporta trazabilidad y reproducibilidad.

## Capacidades

- Prediccion del siguiente carácter en texto en ingles con estilo literario similar a *Pride and Prejudice*.
- Generacion de texto autoregresiva a nivel de carácter (sin tokenizacion subword).
- Inferencia en CPU sin requisitos de GPU.
- Reproducibilidad de experimentos: pesos, tokenizador, resultados y manifiesto de entrenamiento incluidos en el repositorio.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues declaradas.
- No dispone de modo thinking, vision ni audio.
- No es un modelo instruido: no sigue instrucciones ni responde a prompts conversacionales.

## Casos de uso

- Docencia de fundamentos de modelos de lenguaje: el modelo permite ilustrar el ciclo completo (tokenizacion a nivel de carácter, entrenamiento autoregresivo, evaluacion con perdida y perplejidad) en una sola sesion de laboratorio con CPU.
- Linea base en experimentos de investigacion: sirve como referencia minima contra la que comparar modelos de caracteres mas grandes o con arquitecturas alternativas sobre el mismo corpus.
- Validacion de pipelines de evaluacion: su tamano permite ejecutar el ciclo de evaluacion completo en segundos, util para depurar scripts de calculo de perplejidad antes de aplicarlos a modelos mayores.
- Auditoria de procedencia y reproducibilidad: el manifiesto con hashes y configuracion permite practicar verificacion de checkpoints y trazabilidad de datos en flujos de MLOps.
- Experimentos de generacion de texto en entornos restringidos: al caber holgadamente en cualquier CPU, puede ejecutarse en dispositivos sin GPU, contenedores ligeros o entornos educativos con recursos limitados.
- Analisis de sesgos y limitaciones de modelos minimos: util para estudiar como un corpus unico y pequeno (una sola novela) condiciona la distribucion de salida y produce repeticiones o texto malformado.
- Prototipado de interfaces de inferencia: sirve para probar wrappers de carga de safetensors, tokenizadores de caracteres y APIs de generacion antes de migrar a modelos de produccion.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---:|
| Perdida en held-out | 1,7983 |
| Perplejidad en held-out | 6,0396 |
| Perplejidad de la linea base unigrama | 22,2227 |
| Mejora en perdida sobre la linea base | 1,3028 |
| Pasos de entrenamiento | 1.596 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible, lo cual es coherente con la naturaleza del modelo: no es un modelo de proposito general y esas evaluaciones no serian aplicables.

## Requisitos de hardware

- VRAM estimada para inferencia: 0 GB; el modelo esta disenado para CPU y sus 70.080 parametros ocupan del orden de centenares de kilobytes en precision estandar.
- GPU recomendadas: no aplica; cualquier GPU moderna podria ejecutarlo, pero no aporta ventaja practica.
- Cabe en cualquier GPU de consumo e incluso en entornos sin GPU dedicada.
- Opciones de despliegue: PyTorch nativo (libreria declarada); no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo, la generacion en CPU deberia ser del orden de milisegundos por caracter, aunque no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MicroLM Gutenberg (este modelo) | 70.080 | no disponible | Caracter, decoder-only, investigacion | other | Hugging Face |
| nanoGPT (referencia de Karpathy) | configurable (tipicamente 10M-124M) | configurable | Caracter o BPE, docencia | MIT (codigo) | GitHub |
| Modelos de caracteres de Karpathy (min-char-rnn) | del orden de decenas de miles | no aplica | RNN a nivel de caracter | MIT (codigo) | GitHub |

No se dispone de datos de rendimiento comparables publicados para alternativas en la informacion proporcionada; la comparacion se limita a parametros, enfoque y licencia.

## Limitaciones y advertencias

- No es un asistente: no sigue instrucciones, no responde preguntas y no debe usarse para toma de decisiones ni asesoramiento.
- Las salidas pueden ser repetitivas, malformadas o sin sentido, segun advierte el propio autor.
- Entrenado exclusivamente con un extracto de una unica obra en ingles; no hay capacidades multilingues ni conocimiento factual general.
- Sesgos inheritos del corpus: estilo, vocabulario y estructuras de *Pride and Prejudice* condicionan toda la distribucion de salida.
- Riesgo alto de alucinacion si se interpreta como sistema de conocimiento; no es un sistema factual.
- Licencia "other": requiere revision de redistribucion segun jurisdiccion; el texto fuente esta bajo Project Gutenberg License y debe conservarse su aviso al redistribuir.
- El dataset y el texto fuente no se incluyen en el repositorio, lo que limita la reproduccion completa sin acceso externo a Project Gutenberg.
- No apto para produccion: sin soporte de tool calling, agentes, contexto largo ni cuantizacion documentada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/husnainbinmunawar/microlm-gutenberg-research
- Texto fuente (Project Gutenberg ebook 1342): https://www.gutenberg.org/ebooks/1342
- Licencia de Project Gutenberg: https://www.gutenberg.org/policy/license
