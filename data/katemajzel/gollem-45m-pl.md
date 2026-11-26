# KateMajzel/GoLLeM-45M-PL

## Resumen

GoLLeM-45M-PL es un modelo de lenguaje de 42,5 millones de parámetros entrenado desde cero sobre texto en polaco por KateMajzel. Se trata de un artefacto de investigación, no de una herramienta de producción: el objetivo del experimento era determinar si un tokenizador BPE dedicado al polaco (32.768 entradas) produce un modelo mejor que el tokenizador original de GPT-2 bajo un presupuesto de entrenamiento idéntico. La respuesta que documenta el autor es que no es mejor, sino comparable a un coste 2,5 veces menor.

El modelo emplea una arquitectura transformer tipo GPT-2 (decodificador puro) con 8 capas, 8 cabezas de atención y 512 dimensiones ocultas, con una longitud de contexto de 1.024 tokens. Fue entrenado con 731 millones de tokens (2,96 GB de texto, 803.177 documentos) procedentes del corpus SpeakLeash, en una sola época y sobre una única GPU RTX 5080 en 49,7 minutos.

Su relevancia es metodológica más que práctica: proporciona una comparación controlada entre tokenizadores, introduce el uso de bits-per-byte (BPB) frente a la perplejidad para comparaciones entre tokenizadores distintos y documenta que la diferencia de BPB entre dos semillas del mismo modelo (0,0186) supera la diferencia entre modelos con tokenizadores distintos (0,0124). El autor cita que el equipo de Bielik v3 llegó a la misma conclusión de forma independiente a escala de 11B.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT-2 (8 capas × 8 cabezas × 512 dimensiones) |
| Parámetros totales | 42.521.600 (25,7M no pertenecientes a embeddings) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | polaco (pl) |
| Licencia | MIT |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de estilo GPT-2 con 8 capas, 8 cabezas de atención y dimensión oculta de 512, lo que da 42,5 millones de parámetros totales (25,7M excluyendo embeddings). El tokenizador es un BPE a nivel de byte con 32.568 entradas más 200 tokens especiales; el 27,9% de las entradas contienen diacríticos polacos, el round-trip es sin pérdida y no hay tokens inalcanzables mediante merges. La densidad del tokenizador es de 4,050 bytes/token en el corpus y 4,103 en el conjunto de validación, frente a 2,066 y 2,134 del tokenizador de GPT-2, es decir, 1,96 veces más denso.

El entrenamiento utilizó 2,96 GB de texto (803.177 documentos) de SpeakLeash: 37% enciclopedias y literatura, 22% foros, 27% web, 11% periodismo y ciencia, y 3% textos oficiales y administrativos. Se excluyeron deliberadamente traducciones y subtítulos (translationese), texto sintético, letras de canciones por derechos de autor y Common Crawl en bruto. Se realizó una única época sobre 731 millones de tokens (17,2 tokens por parámetro), con AdamW, learning rate de 1e-3 a 1e-4, precisión bfloat16 y una sola GPU RTX 5080 durante 49,7 minutos. No se documenta RLHF, DPO ni ajuste por instrucciones. Como innovación metodológica destaca el uso de BPB en lugar de perplejidad para comparar modelos con tokenizadores distintos, y el bloqueo de los 199 tokens de relleno no utilizados (32.569–32.767) mediante `bad_words_ids`.

## Capacidades

- Generación de texto en polaco: continuación de texto a nivel de frase con coherencia limitada más allá de unas pocas frases.
- Modelado de lenguaje: predice el siguiente token; es un modelo base sin ajuste por instrucciones.
- Clasificación zero-shot mediante verosimilitud con normalización PMI de dominio (sentimiento y tema), según los resultados declarados por el autor.
- Tokenización específica para polaco con manejo correcto de diacríticos y round-trip sin pérdida.
- No dispone de soporte de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- No dispone de modo thinking, visión ni audio.
- Multilingüismo: únicamente polaco; no se documenta competencia en otros idiomas.

## Casos de uso

- Reproducción de experimentos de ablación de tokenizadores: el modelo sirve como referencia R1 en una comparación controlada con el tokenizador de GPT-2 bajo presupuesto de bytes idéntico, usando BPB como métrica. Es su uso principal y el documentado por el autor.
- Docencia e investigación sobre entrenamiento desde cero: el repositorio incluye código, datos y metodología completa, y el coste de 49,7 minutos en una RTX 5080 lo hace viable en laboratorios con hardware de consumo.
- Estudio de tokenizadores BPE para lenguas eslavas: permite medir densidad (bytes/token), cobertura de diacríticos y efecto en el coste de entrenamiento a pequeña escala antes de escalar.
- Evaluación de métricas de comparación entre tokenizadores: útil para demostrar empíricamente por qué la perplejidad por token no es comparable entre tokenizadores distintos y por qué BPB sí lo es.
- Clasificación zero-shot de texto polaco en prototipos de investigación: con 47,2% en PolEmo2-IN y 31,5% en 8Tags, supera las líneas base de clase mayoritaria, pero con margen insuficiente para producción.
- Generación de texto de relleno o sintético para pruebas de infraestructura: su bajo peso (0,2 GB de repositorio) permite desplegarlo en entornos de CI para validar pipelines de `transformers` o Text Generation Inference sin coste de GPU significativo.
- Estudio de sesgos en datos de foros: dado que el 22% del corpus proviene de foros, el modelo puede emplearse para analizar qué sesgos y registros lingüísticos se reproducen con ese tipo de fuente.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente).

BPB sobre conjunto privado de validación (1.999 documentos, 2.767.440 bytes idénticos por modelo; medias sobre 3 semillas para R1 y R2a):

| Ejecución | Tokenizador | Presupuesto | BPB ↓ | Desv. típ. | Parámetros | Tiempo |
|---|---|---|---|---|---|---|
| R1 (este modelo) | Polaco, 32.768 | 2,96 GB | 1,2114 | 0,0100 | 42,5M | 49,7 min |
| R2a | GPT-2, 50.257 | 2,96 GB (mismos bytes) | 1,1946 | 0,0035 | 51,5M | 122,4 min |
| R2b | GPT-2, 50.257 | 2.970 pasos (mismos tokens) | 1,2756 | (n=1) | 51,5M | 62,4 min |
| R3 | GPT-2 zero-shot | — | 2,9555 | (n=1) | 124M | — |

Benchmarks zero-shot (verosimilitud con normalización PMI de dominio):

| Tarea | R1 | R2a | GPT-2 | Clase mayoritaria | Aleatorio |
|---|---|---|---|---|---|
| PolEmo2-IN | 47,2% | 43,8% | 20,8% | 40,0% | 25,0% |
| 8Tags | 31,5% | 29,8% | 17,8% | 16,5% | 12,5% |

Perplejidad por token: 30,7 para R1 y 5,8 para R2a. El autor advierte que esta diferencia es un artefacto de la tokenización y que la única métrica correcta para comparar es BPB. Bajo presupuesto de cómputo igualado (R1 frente a R2b), el tokenizador polaco obtiene una ventaja de 5,30% en BPB, equivalente a 6,4 desviaciones típicas.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (42,5M parámetros ≈ 170 MB de pesos) y en torno a 85 MB en bfloat16; el repositorio completo ocupa 0,2 GB.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM. El entrenamiento se realizó en una RTX 5080; la inferencia cabe holgadamente en GTX 1650, RTX 3050 o superiores.
- Cabe en cualquier GPU de consumo, incluida la gama de entrada, y también en CPU.
- Opciones de despliegue: `transformers` con `pipeline("text-generation")`, Text Generation Inference (etiqueta `text-generation-inference` y `endpoints_compatible` en el repositorio). No se documentan pesos GGUF, por lo que llama.cpp y Ollama requerirían conversión previa.
- Latencia y throughput: no disponibles en la información proporcionada. El tiempo de entrenamiento documentado (49,7 minutos para 731M tokens en una RTX 5080) da una referencia aproximada de la capacidad de cómputo, no de la latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tokenizador | BPB (held-out privado) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| GoLLeM-45M-PL (R1) | 42,5M | 1.024 | Polaco, 32.768 | 1,2114 | MIT | Hugging Face + espejo SlayerLab |
| R2a (ablación del autor) | 51,5M | no disponible | GPT-2, 50.257 | 1,1946 | no disponible | no disponible |
| GPT-2 (R3, zero-shot) | 124M | 1.024 | GPT-2, 50.257 | 2,9555 | MIT | Hugging Face |
| Bielik v3 (referencia a escala 11B) | ~11B | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación relevante es interna al propio experimento: R1 frente a R2a y R2b aísla el efecto del tokenizador con presupuesto de bytes y de pasos igualados. Frente a GPT-2 de 124M, el modelo reduce el BPB de 2,9555 a 1,2114 con un tercio de los parámetros, aunque la comparación no está controlada por presupuesto de entrenamiento. No se dispone de datos de benchmarks comparables con otros modelos polacos de tamaño similar en la información proporcionada.

## Limitaciones y advertencias

- Escala: el modelo genera polaco correcto a nivel de frase, pero alucina hechos y pierde coherencia tras unas pocas frases. El autor documenta el ejemplo «wieś znalazła się w powiecie częstochowskim, gminie Łęczna», donde ambos topónimos existen pero la combinación es falsa.
- Modelo base: solo continuación de texto, sin ajuste por instrucciones ni filtrado de seguridad. No es apto para aplicaciones de usuario final, y en particular para menores, sin supervisión humana.
- Sesgos: el 22% del corpus proviene de foros de internet, por lo que puede reproducir los sesgos y el registro lingüístico presentes en ellos.
- Decodificación: la decodificación greedy entra en bucles de repetición, comportamiento típico en modelos de este tamaño. El autor recomienda `do_sample=True`, `temperature=0.8`, `top_p=0.9` y `repetition_penalty=1.15`, y bloquear los tokens 32.569–32.767 mediante `bad_words_ids`.
- Contexto limitado a 1.024 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Monolingüe: solo polaco; no se documenta ninguna capacidad en otros idiomas.
- Generalización: los resultados corresponden a una única escala (42M) y una única configuración; no se pueden extrapolar sin validación a otros tamaños.
- Licencia MIT: permite uso comercial, pero el propio autor desaconseja el uso en producción por las limitaciones anteriores.
- Los resultados de benchmarks están declarados por el autor y marcados como no verificados (`verified: false`).
- La licencia del corpus SpeakLeash se gestiona en el lado de SpeakLeash; el usuario debe verificar las condiciones de los datos subyacentes si redistribuye derivados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KateMajzel/GoLLeM-45M-PL
- Espejo: https://huggingface.co/SlayerLab/GoLLeM-45M-PL
- Código, datos y metodología: https://github.com/KateMajzel/gollem-pl
- Trabajo posterior sobre fiabilidad de evaluaciones de seguridad en polaco frente a inglés: https://github.com/KateMajzel/pilot-xstest-pl
- Corpus SpeakLeash: https://speakleash.org/
- Referencia citada por el autor (Bielik v3, escala 11B): arXiv 2604.10799
- Dataset PolEmo2.0-IN: https://huggingface.co/datasets/allegro/klej-polemo2-in
- Dataset 8Tags: https://huggingface.co/datasets/sdadas/8tags
