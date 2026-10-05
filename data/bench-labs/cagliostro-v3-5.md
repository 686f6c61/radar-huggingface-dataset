# bench-labs/cagliostro-v3.5

## Resumen

cagliostro-v3.5 es un modelo de lenguaje causal decoder-only de 146 millones de parametros desarrollado por bench-labs. Se trata del checkpoint final de cagliostro-v3 al que se le ha aplicado una etapa adicional de entrenamiento corto de 0,39B tokens, mezclando los datos de cooldown de v3 con texto de tipo how-to y libros de texto procedentes de Cosmopedia. Mantiene la misma arquitectura y el mismo tokenizer que su predecesor, y acumula un total de 75,39B tokens vistos durante su entrenamiento.

Con solo 146M de parametros, el modelo alcanza una puntuacion de 27,49 en la metrica del Open SLM Leaderboard, la mas alta registrada entre los modelos listados en el momento de su publicacion. Supera a SmolLM2-135M (135M, 2T tokens) y a su predecesor cagliostro-v3, con ganancias concentradas en ArithMark-3 (+2,6 puntos) y HellaSwag (+0,9). El autor advierte explicitamente de que la ventaja sobre SmolLM2-135M es de 0,36 puntos de indice y de que, con un bootstrap emparejado, el intervalo de confianza al 95% de esa diferencia es [-0,82, +1,75], por lo que ambos modelos no se pueden distinguir con certeza sobre esos cinco benchmarks.

Es relevante ahora porque demuestra que un modelo tiny de 146M parametros, entrenado con solo 75B tokens, puede competir en la gama sub-150M con modelos entrenados con volumenes de datos mucho mayores (SmolLM2 se entreno con 2T tokens), lo que abarata drasticamente el coste de entrenamiento y despliegue para tareas de generacion de texto en ingles sobre hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal (misma que cagliostro-v3, mismo tokenizer) |
| Parametros totales | 146.352.000 (146M) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no se distribuyen cuantizaciones oficiales; el repositorio contiene pesos en float32 (convertibles a otras precisiones con herramientas externas) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

cagliostro-v3.5 es un transformer decoder-only causal de 146M parametros que hereda integramente la arquitectura y el tokenizer de cagliostro-v3. El punto de partida es el paso 762.939 de v3 (pesos y estado del optimizador AdamW), sobre el que se aplica una etapa adicional de 4.000 pasos con 98.304 tokens por paso, lo que suma 0,39B tokens. La tasa de aprendizaje hace un calentamiento de 200 pasos hasta 3e-4 y despues un decaimiento coseno hasta cero; el pico es una decima parte del 3e-3 usado en v3. El optimizador es AdamW con weight decay de 0,01. En total, el modelo ha visto 75,39B tokens.

El nuevo mix de datos reparte el entrenamiento entre Cosmopedia v1 (tutoriales estilo WikiHow, 30,0%; libros de texto OpenStax, Khan Academy y Stanford, 15,0%), FineWeb-Edu deduplicado (20,35%), Cosmopedia v2 (13,75%), FineMath 3+ (8,25%), OpenMathInstruct-2 (7,15%), SmolTalk (2,75%) y DCLM-Baseline (2,75%). Las seis ultimas fuentes son la mezcla de cooldown de v3 escalada al 55%. La seleccion del checkpoint se hizo comparando seis ejecuciones partidas del mismo checkpoint y con los mismos hiperparametros, definiendo de antemano los criterios de exito (superar 27,13 de SmolLM2-135M, superarlo re-medido en el mismo harness y batir a v3 con el intervalo de confianza emparejado al 95% por encima de cero). Se aplico descontaminacion de 13-gramas contra las particiones de validacion y test de HellaSwag, ARC, PIQA y ArithMark-3.

## Capacidades

- Generacion de texto en ingles: el modelo es un base model, no un modelo de chat afinado; produce texto continuando una secuencia de entrada.
- Razonamiento basico y conocimiento general medido mediante HellaSwag, ARC-Easy, ARC-Challenge y PIQA.
- Aritmetica y matematicas: entrenado con FineMath 3+ y OpenMathInstruct-2, con una puntuacion de 45,30 en ArithMark-3.
- Conocimiento procedimental y de manuales: el mix incluye tutoriales estilo WikiHow y libros de texto, orientados a la generacion de contenido expositivo e instructivo.
- Modelo base sin plantilla de chat: no dispone de modo thinking, vision, audio ni capacidades multimodales.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (es un base model, sin entrenamiento orientado a agentes).
- Capacidades multilingues: solo ingles; el campo `language` de la model card declara unicamente `en`.

## Casos de uso

- Generacion de texto expositivo en ingles: el modelo puede redactar parrafos continuando un prompt dado, con buen comportamiento en contenido de tipo tutorial y manual gracias a la fuerte presencia de Cosmopedia en la etapa final.
- Autocompletado de bajo coste en aplicaciones embebidas: con 146M parametros y pesos float32 de aproximadamente 0,6 GB, puede ejecutarse en CPU o en una GPU de gama baja para sugerencias de texto en tiempo casi real.
- Prototipado de investigacion: sirve como linea base reproducible para estudiar el efecto de etapas de cooldown y de mezclas de datos en modelos tiny, con todos los hiperparametros del run documentados.
- Generacion de contenido educativo: la mezcla de Cosmopedia (tutoriales WikiHow y libros de texto de OpenStax, Khan Academy y Stanford) lo hace adecuado para redactar material didactico en ingles.
- Tareas de razonamiento aritmetico sencillo: entrenado con FineMath 3+ y OpenMathInstruct-2, sirve para ejercicios de aritmetica basica medidos por ArithMark-3.
- Fine-tuning especifico sobre dominio: al ser un base model con licencia Apache 2.0, se puede afinar para tareas concretas (clasificacion, resumen, extraccion) sin coste de licencia.
- Evaluacion comparativa de modelos tiny: util como referencia en experimentos sobre el escalado de datos (comparado con SmolLM2-135M, que uso 2T tokens frente a los 75B de este modelo).

## Benchmarks y rendimiento

Medidos en modo zero-shot con lm-evaluation-harness y el script ArithMark-3 del leaderboard, sobre los pesos float32 del repositorio.

| Benchmark | Metrica | Puntuacion |
|---|---|---:|
| HellaSwag | acc_norm | 43,41 |
| ARC-Easy | acc_norm | 53,75 |
| ARC-Challenge | acc_norm | 29,35 |
| PIQA | acc_norm | 68,06 |
| ArithMark-3 | acc_norm | 45,30 |
| Open SLM Index | — | 27,49 |

Indice del Open SLM Leaderboard: `(N(HellaSwag,25) + N(CombinedARC,25) + N(PIQA,50) + 0,65*N(ArithMark,25)) / 3,65`, donde `N(v,c) = 100(v-c)/(100-c)`.

Comparativa de indice con modelos del leaderboard (cifras publicadas por el leaderboard excepto donde se indica):

| Modelo | Parametros | Tokens | Index |
|---|---:|---:|---:|
| **cagliostro-v3.5** | **146M** | **75,4B** | **27,49** |
| SmolLM2-135M | 135M | 2T | 27,13 |
| cagliostro-v3 | 146M | 75B | 26,55 |
| SmolLM-135M | 135M | 600B | 25,74 |
| GPT-X2.5-135M | 135M | 75B | 25,17 |
| Haidass1.5-143M | 143M | 400B | 25,07 |

El autor senala que, re-medido en el mismo harness, SmolLM2-135M obtiene 27,01 y cagliostro-v3.5 le aventaja en 0,48 puntos, pero que un bootstrap emparejado situa el intervalo de confianza al 95% de esa diferencia en [-0,82, +1,75]. Tambien documenta que entre el 18,5% y el 19,3% de los items WikiHow de validacion y entrenamiento de HellaSwag comparten titulo de articulo con el conjunto WikiHow de Cosmopedia, un posible foco de solapamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en float32 ocupan unos 585 MB (el repositorio pesa 0,6 GB); en bf16/fp16 bajan a unos 292 MB; en int8, unos 146 MB; en int4, unos 73 MB. Hay que sumar la memoria de la cache KV, cuyo tamano depende de la longitud de contexto, que no se ha publicado.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM libre para float32, o integradas/modestas para cuantizaciones de 8 o 4 bits.
- Cabe en GPU de consumo: si, con margen amplio en cualquier GPU consumer moderna (RTX 3060, 4060, 4090, etc.) e incluso en CPU.
- Hardware usado para el entrenamiento: una unica NVIDIA RTX PRO 6000 Blackwell, con 41 minutos de reloj de pared para la etapa adicional, a 162.000 tokens por segundo.
- Opciones de despliegue: compatible con transformers (es la libreria declarada, con `custom_code`); al ser safetensors puede convertirse a GGUF para llama.cpp/Ollama o servirse con vLLM/TGI, aunque el autor no documenta estas rutas.
- Latencia y throughput: no disponible para inferencia. El unico dato de rendimiento es el de entrenamiento (162.000 tokens/s en una RTX PRO 6000 Blackwell).

## Comparativa con modelos similares

| Modelo | Parametros | Tokens de entrenamiento | Open SLM Index | Contexto | Licencia | Idiomas |
|---|---:|---:|---:|---|---|---|
| cagliostro-v3.5 | 146M | 75,4B | 27,49 | no disponible | apache-2.0 | en |
| SmolLM2-135M | 135M | 2T | 27,13 (27,01 re-medido) | no disponible | no disponible en la informacion proporcionada | no disponible |
| cagliostro-v3 | 146M | 75B | 26,55 (26,31 re-medido) | no disponible | apache-2.0 (mismo autor) | en |
| SmolLM-135M | 135M | 600B | 25,74 | no disponible | no disponible en la informacion proporcionada | no disponible |

La diferencia principal frente a SmolLM2-135M estriba en la eficiencia de datos: cagliostro-v3.5 alcanza un indice similar con 75,4B tokens frente a los 2T de SmolLM2, aunque el autor reconoce que la diferencia no es estadisticamente concluyente sobre estos cinco benchmarks.

## Limitaciones y advertencias

- Es un modelo base, no afinado para chat: no dispone de plantilla de conversacion ni de modo thinking. El propio autor senala que el entrenamiento con datos de chat (SmolTalk) hace perder puntos en estos benchmarks, porque el harness puntua log-verosimilitud cruda.
- Solo soporta ingles; no hay evidencia de capacidades multilingues.
- Longitud de contexto no publicada: no se puede planificar el uso en contextos largos sin verificacion previa.
- La ventaja sobre SmolLM2-135M es de 0,36 puntos de indice, con un intervalo de confianza al 95% de [-0,82, +1,75] en un bootstrap emparejado. No puede considerarse una superioridad robusta.
- Solapamiento potencial en HellaSwag: entre el 18,5% y el 19,3% de los items WikiHow comparten titulo de articulo con el conjunto WikiHow de Cosmopedia usado en el entrenamiento, lo que podria inflar la puntuacion de ese benchmark.
- La descontaminacion de 13-gramas aplicada a los documentos nuevos no elimino ninguno en una muestra de 8.000 documentos de las dos fuentes Cosmopedia.
- Riesgo de alucinacion: propio de un modelo de este tamano; no hay datos publicados sobre tasas de alucinacion.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Licencia Apache 2.0: permite uso comercial y modificacion, siempre con la atribucion correspondiente. Es una de las licencias mas permisivas, sin restricciones de uso.
- Rendimiento en produccion: con 146M de parametros y sin datos de latencia publicados, conviene medir el throughput real en el hardware objetivo antes de desplegarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bench-labs/cagliostro-v3.5
- Modelo base: https://huggingface.co/bench-labs/cagliostro-v3
- Open SLM Leaderboard: https://huggingface.co/spaces/AxiomicLabs/Open_SLM_Leaderboard
- Video del modelo: https://huggingface.co/bench-labs/cagliostro-v3.5/resolve/main/cagliostro-v3.5.mp4
- Dataset: https://huggingface.co/datasets/HuggingFaceTB/smollm-corpus
- Dataset: https://huggingface.co/datasets/mlfoundations/dclm-baseline-1.0
- Dataset: https://huggingface.co/datasets/HuggingFaceTB/finemath
- Dataset: https://huggingface.co/datasets/nvidia/OpenMathInstruct-2
- Dataset: https://huggingface.co/datasets/HuggingFaceTB/smoltalk
- Dataset: https://huggingface.co/datasets/HuggingFaceTB/cosmopedia
