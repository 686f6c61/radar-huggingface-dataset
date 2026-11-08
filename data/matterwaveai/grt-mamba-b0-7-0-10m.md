# MatterWaveAI/grt-mamba-b0.7.0-10m

## Resumen

GRT-Mamba-b0.7.0-10m es un modelo de espacio de estados selectivo (SSM) de tipo Mamba desarrollado por MatterWaveAI, publicado bajo licencia Apache 2.0. Se trata del escalón de 10M de la familia GRT-Mamba y se presenta como un "modelo del mundo" compacto y un juez de trayectorias con memoria constante O(1). Su propuesta central es formular la recurrencia selectiva mediante transformaciones ortogonales que preservan la norma (determinante +1.000000), lo que elimina por construcción el desvanecimiento y la explosión de gradientes.

El modelo declara aproximadamente 13,8M de parámetros almacenados y una capacidad densa equivalente de unos 34M, sin matrices lineales densas ni capas convolucionales 1D/2D, y sin caché KV (estado recurrente fijo de 1,5 KB). Está construido sobre MatterWaveAI/grt-10m como modelo base afinado y orientado a generación de texto, aunque su model card lo posiciona sobre todo como evaluador y enrutador para sistemas agénticos y tareas de razonamiento de opción múltiple.

Es relevante ahora porque explora una vía alternativa a los transformers densos para despliegue en el extremo: inferencia con coste y memoria constantes por token independientemente de la longitud de secuencia. No obstante, la propia model card advierte de que los pesos, los detalles de implementación y el código fuente están retenidos durante un ciclo de publicación por fases, lo que limita seriamente su uso práctico inmediato.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SSM selectivo rotacional (Mamba / state-space model), transformaciones ortogonales con determinante +1 |
| Parametros totales | ~13,8M almacenados (~34M de capacidad densa equivalente, según el autor) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | evaluado de T=128 a T=8.192+; longitud máxima declarada no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (pesos retenidos según la model card) |

## Arquitectura y entrenamiento

La arquitectura es un SSM selectivo puramente rotacional: la transición de estado se implementa mediante transformaciones ortogonales que preservan la norma, con determinante +1.000000000000. El autor reporta cero matrices lineales densas y cero capas convolucionales 1D/2D. El entrenamiento se realiza mediante un escaneo de prefijo paralelo, con paridad numérica de 3,81e-6 frente a la recurrencia paso a paso, mientras que la inferencia se ejecuta en modo recurrente con coste y memoria O(1) por token (estado fijo de 1,5 KB, sin caché KV). La deriva de norma del estado homogéneo se declara por debajo de 5,0e-7 en float32 y de 9,55e-15 en float64 sobre 8.192 pasos.

El modelo parte de MatterWaveAI/grt-10m y se ha afinado con un currículo de 24 horas y un horizonte denominado "10C". No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron RLHF o DPO. Tampoco se detalla la implementación concreta de las capas ni los hiperparámetros. La model card menciona evaluación sobre conjuntos "XL-smol" (12.003 registros retenidos y 29.609 preguntas; 17.130 registros y 44.287 preguntas en el benchmark consolidado de 12 dominios) y sobre SLM-Bench y GSM8K (13.644 ejemplos), pero no describe la composición de esos datos.

## Capacidades

- Generación de texto y modelado de lenguaje de tipo base, según el pipeline declarado (text-generation).
- Verificación de razonamiento multi-hop relacional (2-3 saltos) y de sentido común físico y causal.
- Verificación factual de un solo salto como "juez" de un modelo del mundo.
- Verificación epistémica en cuatro modos (SEE/SAY/DO/KNOW) de estilo socrático.
- Inducción de reglas sobre rejillas visual-espaciales 2D, evaluada con una variante "XL-smol" de ARC-AGI-2.
- Enrutamiento de acciones para agentes mediante control predictivo (MPC), con evaluación de deriva y defensa frente a inyección de prompts.
- Verificación matemática de cuatro vías sobre GSM8K.
- Memoria y coste constantes por token en secuencias largas (hasta 8.192+ pasos evaluados), sin caché KV.
- Soporte de tool calling / function calling: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking, visión o audio nativos: no disponible (la parte "visual-espacial" se refiere a rejillas 2D, no a entrada de imágenes).

## Casos de uso

- Juez de trayectorias en pipelines agénticos: el modelo puede puntuar rollouts multi-hop y rutas de acción con memoria O(1), lo que permite evaluar cadenas largas sin crecimiento de caché KV y con coste por token constante.
- Filtrado y verificación de respuestas en sistemas RAG: usar la verificación factual de un solo salto para descartar respuestas no respaldadas por el contexto recuperado antes de mostrarlas al usuario.
- Enrutador de acciones con control predictivo: seleccionar la siguiente acción de un agente entre un conjunto discreto de opciones, con la defensa frente a inyección de prompts documentada por el autor.
- Evaluación automática de modelos de razonamiento: emplear las suites de opción múltiple (BoolQ, QNLI, ARC, PIQA, WinoGrande, HellaSwag, CommonsenseQA) como evaluador barato en el extremo, dado su tamaño de 10M.
- Despliegue en dispositivos de borde: con ~13,8M de parámetros y estado recurrente de 1,5 KB, el modelo es candidato a ejecutarse en CPU o en GPUs de gama baja con memoria muy limitada, siempre que se publiquen los pesos.
- Procesamiento de secuencias largas con memoria acotada: analizar flujos de eventos o trazas extensas (miles de pasos) donde un transformer requeriría una caché KV que crece linealmente.
- Inducción de reglas en dominios estructurados: aplicar la capacidad de inducción sobre rejillas 2D a problemas de abstracción y razonamiento (tipo ARC) en entornos de investigación.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Benchmark | Split (n) | Aleatorio | Resultado (currículo 24h) | Resultado (horizonte 10C) |
|---|---|---|---|---|
| BoolQ | val (3.270) | 50,00% | 64,86% | 66,82% |
| QNLI | val (1.000) | 50,00% | 76,50% | 78,95% |
| ARC-Easy | test (2.376) | 25,00% | 33,38% | 41,12% |
| ARC-Challenge | test (1.172) | 25,00% | 30,29% | 32,10% |
| OpenBookQA | test (500) | 25,00% | 40,40% | 41,10% |
| PIQA | val (1.838) | 50,00% | 53,65% | 59,74% |
| WinoGrande | val (1.267) | 50,00% | 52,57% | 58,18% |
| HellaSwag | val (1.000) | 25,00% | 37,10% | 37,90% |
| CommonsenseQA | val (1.221) | 20,00% | 25,39% | 30,04% |
| Media macro 9 tareas | 13.144 | 35,56% | 46,01% | 49,55% |
| GSM8K verificación 4 vías | test (500) | 25,00% | 97,00% (PPL 25,14) | 97,00% (PPL 3,62) |

Resultados de la suite XL-smol (juez y enrutador):

| Suite | Registros | Preguntas | Top-1 | pass@2 | Consistencia de orden |
|---|---|---|---|---|---|
| Multi-hop relacional (2-3 saltos) | 2.500 | 5.000 | 84,20% | 93,80% | 100,0% |
| Ciencia causal y sentido común físico | 2.500 | 5.000 | 93,50% | 96,50% | 100,0% |
| Factual de un solo salto | 2.500 | 5.000 | 84,00% | 95,40% | 100,0% |
| Socrático 4 modos (SEE/SAY/DO/KNOW) | 2.500 | 5.000 | 64,60% | 91,20% | 100,0% |
| Rejilla visual-espacial (ARC-AGI-2 XL-smol) | 1.200 | 3.600 | 55,50% | 80,50% | 100,0% |
| Enrutamiento MPC y defensa ante inyección | 803 | 2.409 | 60,55% | 63,03% | 100,0% |
| Agregado 6 suites (macro/micro) | 12.003 | 26.009 | 73,73% / 76,85% | 88,21% | 100,0% |
| Benchmark consolidado 12 dominios | 17.130 | 40.687 | 71,13% macro | 73,68% micro | 100,0% |

Invariantes arquitectónicos declarados: paridad de escaneo paralelo frente a recurrencia de 3,81e-6; determinante +1.000000000000; deriva de norma a 8.192 pasos de 9,55e-15 en float64 y <5,0e-7 en float32; caché KV de 0 bytes; retención de rango efectivo del estado ≥96,0%.

No se han publicado resultados de benchmarks independientes en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con ~13,8M de parámetros, el peso en float32 ocupa aproximadamente 55 MB y en bfloat16 unos 28 MB; el estado recurrente añade 1,5 KB fijos por secuencia.
- GPU recomendadas: cualquier GPU moderna sirve; el modelo es manejable en RTX 3060, RTX 4090, A100 o H100 sin restricciones de memoria apreciables.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo con al menos 1-2 GB de VRAM libre, e incluso en CPU.
- Opciones de despliegue: la librería declarada es transformers; no se especifican integraciones con vLLM, llama.cpp, Ollama o TGI, y la falta de pesos publicados impide confirmar compatibilidad.
- Latencia y throughput estimados: no disponibles. El autor afirma coste O(1) por token, pero no publica cifras de latencia ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad de pesos |
|---|---|---|---|---|---|
| GRT-Mamba-b0.7.0-10m | ~13,8M | evaluado hasta 8.192+ | SSM rotacional, juez de trayectorias | Apache 2.0 | retenidos según la model card |
| s1-grt-mamba-b0.7.0-20m (MatterWaveAI) | no disponible (rango 20M) | no disponible | SSM rotacional, clasificación de texto | Apache 2.0 | publicado en Hugging Face |
| s1-grt-mamba (MatterWaveAI) | no disponible | no disponible | SSM, clasificación de texto | Apache 2.0 | publicado en Hugging Face |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada, por lo que la comparación de rendimiento no está disponible.

## Limitaciones y advertencias

- Pesos, implementación arquitectónica y código fuente retenidos según la model card: el modelo no es descargable ni ejecutable en el momento de redactar esta ficha, pese a la licencia Apache 2.0.
- Resultados de benchmarks autoinformados por el autor y sin verificación independiente; deben tratarse con cautela.
- Tamaño muy reducido (10M): el rendimiento en tareas de conocimiento general es bajo en términos absolutos (macro de 49,55% en SLM-Bench, 32,10% en ARC-Challenge), lo que limita su uso como generador de propósito general.
- El GSM8K de 97,00% corresponde a una tarea de verificación de 4 vías, no a generación libre de soluciones; no es comparable con el GSM8K estándar.
- Idiomas soportados no disponibles: no hay evidencia de capacidades multilingües ni de calidad en castellano.
- Longitud máxima de contexto no declarada; solo se documenta evaluación hasta 8.192 pasos.
- Riesgo de alucinación: no cuantificado en la información disponible; el modelo se presenta como juez, no como fuente factual.
- Sesgos conocidos: no documentados.
- No se especifican requisitos de atribución adicionales más allá de la licencia Apache 2.0, pero la retención de pesos impide el uso comercial en la práctica hasta su publicación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MatterWaveAI/grt-mamba-b0.7.0-10m
- Modelo base: https://huggingface.co/MatterWaveAI/grt-10m
- Familia GRT-Mamba: https://huggingface.co/MatterWaveAI/grt-mamba
- S1-GRT-Mamba: https://huggingface.co/MatterWaveAI/s1-grt-mamba
- S1-GRT-Mamba-b0.7.0-20m: https://huggingface.co/MatterWaveAI/s1-grt-mamba-b0.7.0-20m/tree/main
