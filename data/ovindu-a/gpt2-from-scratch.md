# ovindu-a/gpt2-from-scratch

## Resumen

ovindu-a/gpt2-from-scratch es un modelo de lenguaje causal de tipo GPT-2 entrenado desde cero (pesos inicializados aleatoriamente, sin inicializacion desde un checkpoint preentrenado) por el usuario ovindu-a. El modelo se ha entrenado para predecir el siguiente token sobre el dataset `ingeniumacademy/reuters_articles`, compuesto por titulares y cuerpo de articulos de Reuters, utilizando un tokenizador especifico del corpus (`ingeniumacademy/gpt2-reuters-tokenizer`).

Se trata de un modelo de escala reducida: 30.713.856 parametros totales, 6 capas, 6 cabezas de atencion, dimension de embedding 384 y una longitud de contexto de 256 tokens. El entrenamiento se completo en 5 epocas en 402,8 segundos sobre una NVIDIA GeForce RTX 4070 Ti SUPER, lo que lo situa en la categoria de experimento docente o de prototipado rapido mas que en la de modelo de proposito general.

Su relevancia es limitada fuera del ambito educativo: sirve como referencia reproducible de un pipeline completo de entrenamiento de un transformer causal (tokenizacion, entrenamiento, evaluacion con perdida y perplejidad, y publicacion de pesos en safetensors) sobre un dominio muy concreto como es el periodismo de agencia. No obstante, su ventana de contexto de 256 tokens y su licencia no especificada lo hacen poco adecuado para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT-2), 6 capas, 6 cabezas, embedding 384 |
| Parametros totales | 30.713.856 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only clasico con atencion causal, siguiendo el diseno de GPT-2: 6 capas, 6 cabezas de atencion, dimension de embedding de 384 y contexto maximo de 256 tokens. El modelo se inicializa desde pesos aleatorios, sin destilacion ni inicializacion desde GPT-2 preentrenado, y se entrena con el objetivo estandar de modelado de lenguaje (prediccion del siguiente token). El corpus de entrenamiento es `ingeniumacademy/reuters_articles`, con cada ejemplo construido como titular, salto de linea y cuerpo del articulo. El tokenizador empleado es `ingeniumacademy/gpt2-reuters-tokenizer`, entrenado especificamente sobre ese corpus.

El entrenamiento se realizo durante 5 epocas, con un tiempo total de 402,8 segundos en una RTX 4070 Ti SUPER, alcanzando una perdida de entrenamiento final de 3,6596, una perdida de validacion de 4,1704 (perplejidad 64,74) y una perdida de test de 3,9734 (perplejidad 53,16). El repositorio incluye ademas dos ejecuciones adicionales: `exp1_6L_2ep` (misma arquitectura, 2 epocas, perplejidad de validacion 118,53) y `exp2_2L_5ep` (2 capas, 23.616.000 parametros, 5 epocas, perplejidad de validacion 74,21). No se documenta el uso de RLHF, DPO, decodificacion especulativa ni tecnicas de atencion lineal; tampoco se especifica el numero total de tokens vistos durante el entrenamiento.

## Capacidades

- Generacion de texto autoregresiva en ingles, limitada a continuaciones de hasta 256 tokens.
- Modelado de lenguaje causal sobre estilo periodistico de agencia (Reuters): titulares, entradillas y cuerpo de noticia.
- Generacion condicionada por titulo: al haberse entrenado con el formato "titular + salto de linea + cuerpo", puede producir cuerpos de noticia a partir de un titular.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidad multilingue: solo ingles (etiqueta `en`); no se reporta cobertura de otros idiomas.
- No dispone de modo de razonamiento explicito (thinking mode), vision, audio ni otras modalidades.
- No se documenta un chat template ni ajuste por instrucciones; es un modelo base, no un modelo alineado.

## Casos de uso

- Docencia y reproduccion de pipelines de entrenamiento: sirve como ejemplo completo y verificable de entrenamiento de un GPT-2 desde cero, con hiperparametros, tiempos y curvas de perdida publicados, util para cursos de deep learning.
- Generacion de borradores de noticias de agencia: dado un titular en ingles, el modelo puede producir un cuerpo de noticia breve con el estilo de Reuters, adecuado para prototipos editoriales internos, no para publicacion directa.
- Pruebas de infraestructura de inferencia: por su tamano (30,7 M de parametros) cabe en cualquier GPU consumer y permite validar despliegues con transformers, TGI o llama.cpp antes de migrar a modelos mayores.
- Experimentacion con tokenizadores de dominio: al publicarse junto al tokenizador especifico del corpus, permite estudiar el efecto de la tokenizacion especializada en la perplejidad sobre texto periodistico.
- Generacion de datos sinteticos de estilo periodistico para aumentacion de datasets de clasificacion o resumen en ingles, con supervision y filtrado posteriores.
- Benchmark de referencia para comparativas de arquitecturas: las ejecuciones `exp1_6L_2ep` y `exp2_2L_5ep` permiten comparar el efecto de la profundidad y del numero de epocas sobre la perplejidad en un mismo corpus.
- Prototipado de autocompletado en herramientas editoriales: con contexto de 256 tokens puede sugerir continuaciones de frases en textos de noticias, siempre con revision humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Los unicos datos de evaluacion son las perdidas y perplejidades del propio autor sobre el corpus de Reuters:

| Ejecucion | Capas | Parametros | Epocas | Perdida train | Perdida val | Perplejidad val | Perdida test | Perplejidad test |
|---|---|---|---|---|---|---|---|---|
| baseline_6L_5ep (modelo principal) | 6 | 30.713.856 | 5 | 3,6596 | 4,1704 | 64,74 | 3,9734 | 53,16 |
| exp1_6L_2ep | 6 | 30.713.856 | 2 | 4,5579 | 4,7752 | 118,53 | 4,5487 | 94,51 |
| exp2_2L_5ep | 2 | 23.616.000 | 5 | 3,8018 | 4,3069 | 74,21 | 4,1058 | 60,69 |

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,12 GB solo para pesos (30,7 M de parametros x 4 bytes), mas overhead de activaciones y del runtime; en la practica cabe holgadamente en cualquier GPU con 2 GB o mas.
- En fp16/bf16 los pesos ocupan unos 0,06 GB; la cuantizacion a 8 bits o 4 bits reduciria aun mas el requisito, aunque no se documentan artefactos cuantizados.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el propio autor entreno en una RTX 4070 Ti SUPER en 402,8 segundos. Tambien es viable en CPU para inferencia interactiva.
- Cabe en GPU consumer: si, en practicamente todas (GTX 1060 en adelante, RTX 20/30/40, Apple Silicon via MPS).
- Opciones de despliegue: transformers (referencia del autor), text-generation-inference (etiqueta `text-generation-inference` en el repo), endpoints compatibles; llama.cpp/Ollama requeririan conversion a GGUF no publicada.
- Latencia y throughput: no se han publicado mediciones de latencia ni de tokens por segundo en inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ovindu-a/gpt2-from-scratch | 30,7 M | 256 | Desde cero, corpus Reuters, 5 epocas | no disponible | Hugging Face |
| GPT-2 small (OpenAI) | 124 M | 1024 | Preentrenado en WebText | MIT | Hugging Face (openai-community/gpt2) |
| GPT-2 small destilado / variantes pequenas | ~30-80 M | 256-1024 | Variable | Variable | Hugging Face |
| exp2_2L_5ep (misma familia) | 23,6 M | 256 | Desde cero, corpus Reuters, 5 epocas | no disponible | Subcarpeta del mismo repo |

Frente a GPT-2 small, este modelo tiene aproximadamente una cuarta parte de parametros y una ventana de contexto cuatro veces menor, pero esta especializado en el dominio Reuters y se publica con todo el registro de entrenamiento. No se dispone de comparaciones de rendimiento con otros modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Ventana de contexto muy corta (256 tokens): no admite conversaciones multi-turno largas ni documentos extensos.
- Modelo base sin alineacion: no sigue instrucciones, no tiene chat template y puede generar contenido incoherente o repetitivo fuera del estilo del corpus.
- Entrenado exclusivamente en ingles y sobre un unico dominio (noticias de Reuters); el sesgo de dominio y de estilo es alto.
- Riesgo elevado de alucinacion: al ser un modelo pequeno entrenado con pocas epocas, generara hechos plausibles pero no verificados.
- Perplejidad de validacion de 64,74, indicativa de una calidad de modelado limitada incluso dentro del dominio.
- Licencia no especificada: no se puede confirmar el permiso para uso comercial; debe contactarse con el autor antes de cualquier despliegue productivo.
- Sin datos de sesgos demograficos o sociales; el corpus periodistico puede arrastrar sesgos editoriales de la fuente.
- Sin garantias de mantenimiento ni versionado: 0 descargas y 0 likes en el momento de la consulta, lo que sugiere ausencia de validacion por la comunidad.
- No se publican artefactos cuantizados ni plantillas de prompt, lo que complica su integracion directa en stacks de produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ovindu-a/gpt2-from-scratch
- Dataset de entrenamiento: https://huggingface.co/datasets/ingeniumacademy/reuters_articles
- Tokenizador: https://huggingface.co/ingeniumacademy/gpt2-reuters-tokenizer
