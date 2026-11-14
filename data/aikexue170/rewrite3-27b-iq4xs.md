# aikexue170/rewrite3-27b-iq4xs

## Resumen
rewrite3-27b-iq4xs es una cuantización GGUF de tipo IQ4_XS del modelo rewrite3-27B, un ajuste fino supervisado (SFT) derivado de Qwen/Qwen3.8-27B especializado en la reescritura de novelas web en chino. Lo publica el usuario aikexue170 bajo licencia Apache 2.0 y su propósito no es la generación libre ni la continuación de texto, sino tomar un borrador degradado por estilo generativo ("八股", fórmula vacía propia de IA) y reescribirlo preservando trama, personajes y eventos, eliminando redundancias y marcas de estilo artificial.

El modelo incorpora dos innovaciones destacables: un modo de razonamiento específico de edición (analiza el texto, señala los problemas y explica el plan de reescritura antes de producir el texto final) y una integración de las puntuaciones JEV, un valor numérico entre corchetes al final de cada frase que proviene de un clasificador externo (jevnovel3 0.8B) e indica la probabilidad de que esa frase suene a texto generado por IA. Además, el autor ha reentrenado el cabezal MTP (multi-token prediction) para decodificación especulativa, con una tasa de aceptación declarada del 56 % con n=3 en decodificación voraz y una aceleración extremo a extremo de aproximadamente 2x.

Esta variante concreta pesa 15,5 GB (14,5 GiB), está pensada para despliegue local con llama.cpp y no requiere GPU de gama alta. El modelo solo declara soporte para chino (zh) y está orientado exclusivamente a la reescritura de ficción web china.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3.8-27B) con cabezal MTP reentrenado |
| Parametros totales | 27B (según denominación del modelo base) |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el ejemplo de llama.cpp usa `-c 16384`) |
| Tipos de cuantizacion | IQ4_XS (este repositorio); también existen BF16, FP8 W8A8 y NVFP4 en repositorios hermanos |
| Idiomas soportados | chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con módulo MTP embebido en `blk.32.nextn.*`) |

## Arquitectura y entrenamiento
El modelo parte de Qwen/Qwen3.8-27B, un transformer decoder-only de 27 000 millones de parámetros, y se somete a un ajuste fino supervisado (SFT) sobre datos de reescritura de novelas web chinas. El conjunto de entrenamiento incorpora cadenas de pensamiento de tipo editorial: el modelo aprende a identificar qué fragmentos suenan a IA, justificar el diagnóstico y describir el plan de reescritura antes de generar el texto final. La entrada de entrenamiento incluye, además del texto original, anotaciones JEV por frase (formato `【0.123】`) producidas por el clasificador independiente jevnovel3 0.8B, de modo que el modelo aprende a priorizar la corrección de las frases con mayor probabilidad de estilo artificial.

Una innovación técnica relevante es el reentrenamiento del cabezal MTP sobre el conjunto de datos v14-sfw: no es el MTP original de Qwen, sino uno ajustado para esta tarea. Con decodificación especulativa `draft-mtp` y `n=3` en modo voraz, el autor reporta una tasa de aceptación del 56 % y una aceleración de aproximadamente 2x de extremo a extremo. El módulo MTP está empaquetado dentro del propio GGUF, por lo que basta con invocar `--spec-type draft-mtp --spec-draft-n-max 3` en llama.cpp (nightly b12374 o superior) para activarlo. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO.

## Capacidades
- Reescritura de ficción en chino: reorganiza párrafos completos en lugar de sustituir sinónimos frase a frase, con el objetivo de preservar trama, personajes y eventos.
- Razonamiento editorial explícito: produce un análisis previo (detección de estilo artificial, diagnóstico y plan de reescritura) antes del texto final.
- Consumo de puntuaciones JEV: utiliza los valores `【0.xxx】` insertados por el clasificador externo para localizar y priorizar los fragmentos problemáticos; puede ejecutarse sin dichas puntuaciones, aunque fuera de la distribución de entrenamiento.
- Eliminación de marcas de estilo generativo ("AI八股"): reduce fórmulas vacías, repeticiones y relleno.
- Restricción antiplagio: el proyecto impone como restricción dura no copiar más de 15 caracteres consecutivos del original.
- Decodificación especulativa MTP integrada para acelerar la inferencia.
- Capacidad limitada al chino; no se declara soporte multilingüe, tool calling, visión ni audio.
- No es un modelo de continuación ni de creación libre: su ámbito es estrictamente la reescritura.

## Casos de uso
- Limpieza de borradores generados por IA en plataformas de novela web: el modelo recibe el texto con anotaciones JEV y devuelve una versión reescrita con menor densidad de fórmulas artificiales, lo que resulta adecuado por su entrenamiento específico en detección y eliminación de estilo generativo.
- Edición asistida para autores humanos: el análisis editorial previo permite al autor revisar el diagnóstico (qué frases suenan artificiales y por qué) antes de aceptar la reescritura, útil como herramienta de revisión y no solo de generación.
- Reducción de redundancia en manuscritos largos: al reorganizar por párrafos y comprimir repeticiones, encaja en flujos de edición de capítulos con presupuesto de longitud fijado mediante instrucciones de "档位" (nivel de recorte).
- Despliegue local en estaciones de trabajo sin GPU de datacenter: con 15,5 GB en IQ4_XS y aceleración MTP, puede ejecutarse en llama.cpp sobre GPU de consumo con suficiente VRAM, lo que lo hace viable para editores que trabajan con material sensible sin enviarlo a la nube.
- Preprocesado en pipelines de publicación: integrable como etapa de normalización estilística antes de la revisión humana o de la moderación de contenido en una plataforma de ficción.
- Evaluación comparativa de cuantizaciones: el repositorio publica métricas JEV, grado de desviación del original y velocidad para FP8, IQ4_XS y NVFP4, lo que permite usar esta variante como referencia para decidir el formato de despliegue en producción.

## Benchmarks y rendimiento
El autor publica una comparativa de calidad y velocidad entre formatos de cuantización sobre un conjunto de seis prompts, con KV cache en bf16 y midiendo tiempos que incluyen razonamiento y texto final. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

| Formato | JEV medio ↓ | Desviación del original ↑ | Copia máxima (caracteres) ↓ | Copia total ↓ | Longitud del texto | Muestras demasiado largas | Tiempo medio |
|:--|--:|--:|--:|--:|--:|--:|--:|
| FP8 (W8A8) | 0,0966 | 0,844 | 31,2 | 54,2 | 1036 | 3/6 | 71 s |
| IQ4_XS (GGUF) | 0,0982 | 0,767 | 25,2 | 86,0 | 1007 | 0/6 | 41 s |
| NVFP4 (W4A4) | 0,1016 | 0,804 | 25,5 | 70,2 | 944 | 0/6 | 43 s |

Métricas auxiliares definidas por el autor: "desviación del original" es la proporción de ventanas de 5 caracteres del texto reescrito que no aparecen en el original (más alto indica reescritura más profunda); "copia máxima" y "copia total" miden caracteres coincidentes literalmente con el original. Umbrales JEV: por debajo de 0,08 se considera limpio, entre 0,08 y 0,12 es el rango normal de reescritura y por encima de 0,2 predomina el estilo artificial. BF16 se usa como referencia de calidad pero no se evaluó en esta batería de seis prompts; Q3_K_M, Q4_K_M e IQ3_XS no se han probado.

## Requisitos de hardware
- VRAM estimada para inferencia: aproximadamente 15,5 GB de pesos en IQ4_XS, más KV cache; con contexto de 16 384 tokens y KV en bf16 el consumo adicional es significativo, por lo que conviene reservar margen.
- GPU recomendadas: RTX 4090 (24 GB) o RTX 3090 (24 GB) para IQ4_XS con contexto moderado; A100/H100 no son necesarias para esta cuantización, aunque permiten contextos mayores y mayor throughput.
- Cabe en GPU de consumo: sí, en tarjetas de 24 GB o más con contexto ajustado; en 16 GB es probable que no quepa con KV cache bf16 a 16k de contexto.
- Opciones de despliegue: llama.cpp (nightly b12374 o superior) con `--spec-type draft-mtp --spec-draft-n-max 3` para activar MTP; para BF16/FP8/NVFP4 el autor remite a vLLM con los repositorios correspondientes.
- Latencia y throughput: el autor reporta 41 s de media para seis prompts de reescritura con IQ4_XS, frente a 71 s con FP8, en la misma máquina; no se publican tokens por segundo.

## Comparativa con modelos similares
No se dispone de información sobre modelos comparables en la documentación proporcionada. La comparación más directa disponible es interna, entre las cuantizaciones del mismo modelo:

| Modelo | Parámetros | Contexto | Licencia | Peso | Notas |
|---|---|---|---|---|---|
| rewrite3-27b-iq4xs (este) | 27B | no disponible | Apache 2.0 | 15,5 GB | Mejor equilibrio velocidad/calidad según el autor; 41 s medios |
| rewrite3-27b-fp8 | 27B | no disponible | Apache 2.0 | 35,9 GB | Calidad máxima en la batería publicada; 71 s medios |
| rewrite3-27b-nvfp4 | 27B | no disponible | Apache 2.0 | no disponible | Ventaja de memoria en Blackwell; JEV ligeramente superior |
| rewrite3-27b-bf16 | 27B | no disponible | Apache 2.0 | 54,7 GB | Referencia de calidad, sin evaluación en la batería de seis prompts |

## Limitaciones y advertencias
- Especialización estrecha: solo reescribe ficción web en chino; no es adecuado para generación libre, continuación de texto, código, matemáticas ni tareas generales.
- Dependencia de las puntuaciones JEV: sin las anotaciones del clasificador jevnovel3 0.8B el modelo opera fuera de la distribución de entrenamiento y la calidad puede degradarse.
- Riesgo de "inflado" del texto: con instrucciones de recorte, el modelo puede alargar el resultado añadiendo detalles de ambiente, acción o psicología; el autor recomienda fijar el nivel de recorte en el prompt para evitarlo.
- Riesgo de invención de detalles: aunque se prohíbe inventar escenarios nuevos, la "adición de material" permitida puede introducir elementos no presentes en el original.
- Sesgos: no se documentan sesgos específicos; al entrenarse sobre novelas web chinas, puede heredar convenciones de género y estereotipos de ese corpus.
- Alucinación: no se publican evaluaciones específicas de fidelidad factual; la restricción de copia máxima de 15 caracteres consecutivos es una guía de diseño, no una garantía verificada de forma independiente.
- Idiomas: solo chino; no se declara soporte para castellano ni otras lenguas.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base Qwen arrastra sus propias condiciones; conviene revisar la licencia del modelo base antes de un despliegue comercial.
- Madurez: repositorio con cero descargas y cero likes en el momento de la consulta, publicado en noviembre de 2026; el soporte de MTP exige versiones nightly de llama.cpp, lo que implica riesgo de inestabilidad en producción.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/aikexue170/rewrite3-27b-iq4xs
- Versión BF16: https://huggingface.co/aikexue170/rewrite3-27b-bf16
- Versión BF16 en ModelScope: https://modelscope.cn/models/alkaid55555/rewrite3-27b-bf16
- Versión FP8: https://huggingface.co/aikexue170/rewrite3-27b-fp8
- Versión FP8 en ModelScope: https://modelscope.cn (enlace truncado en la model card)
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
