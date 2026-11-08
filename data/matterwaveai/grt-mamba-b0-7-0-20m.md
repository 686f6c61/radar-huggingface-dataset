# MatterWaveAI/grt-mamba-b0.7.0-20m

## Resumen

GRT-Mamba-b0.7.0-20m es un modelo de lenguaje compacto de tipo state-space model (SSM) desarrollado por MatterWaveAI, construido sobre el modelo base MatterWaveAI/grt-20m. Se presenta como un "modelo de mundo rotacional" (rotational world model) puro, con aproximadamente 26,4 millones de parámetros almacenados y una capacidad declarada equivalente a unos 66 millones de parámetros densos. Su particularidad es que sustituye la recurrencia selectiva convencional de Mamba por transformaciones ortogonales que preservan la norma (determinante +1), lo que elimina por construcción el desvanecimiento y la explosión de gradientes.

El modelo está diseñado como un juez de trayectorias y enrutador de control predictivo (MPC) para agentes, no como un generador de texto generalista. Según la model card, no contiene matrices lineales densas ni capas convolucionales 1D/2D, y su inferencia es de memoria constante O(1) por token, con un estado recurrente fijo de 2,25 KB y cero bytes de caché KV. Esto lo hace atractivo para despliegues en el borde (edge) y para verificación de trayectorias de longitud arbitraria.

La relevancia actual del modelo radica en su propuesta de arquitectura: un SSM puramente rotacional con estabilidad unitaria demostrada numéricamente (deriva de norma inferior a 5,0e-7 en float32 sobre 1.000 pasos) y paridad entre el escaneo de prefijo paralelo y la recurrencia paso a paso (3,81e-6). No obstante, se trata de una "preview card" con pesos, código e implementación retenidos durante un ciclo de publicación por fases, y no se han publicado datos sobre idiomas soportados ni sobre el corpus de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SSM selectivo rotacional (rotational selective state-space model), sin matrices densas ni convoluciones |
| Parametros totales | ~26,4 M almacenados (~66 M de capacidad equivalente densa) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | evaluado hasta T = 8.192 tokens; estado recurrente fijo, sin caché KV |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (pesos retenidos en la version preview) |

## Arquitectura y entrenamiento

La arquitectura es un SSM selectivo en el que la transición de estado se formula mediante transformaciones ortogonales con determinante +1.000000000000, lo que garantiza estabilidad unitaria: la norma del estado homogéneo deriva 9,55e-15 en float64 y menos de 5,0e-7 en float32 a lo largo de 8.192 pasos. El entrenamiento utiliza un escaneo de prefijo paralelo con paridad numérica de 3,81e-6 frente a la recurrencia paso a paso. La inferencia opera con O(1) de cómputo y O(1) de memoria por token, con un estado recurrente fijo de 2,25 KB y sin caché KV, lo que permite secuencias de longitud arbitraria sin crecimiento de memoria. La model card declara cero matrices lineales densas y cero capas convolucionales 1D/2D, con una retención de rango efectivo del estado superior al 96 % y sin colapso (cero valores negativos).

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. La model card menciona un "currículo de 24 horas" y un "horizonte de 10C" en el contexto de los resultados de SLM-Bench, pero no detalla la metodología de entrenamiento. Los pesos, la implementación arquitectónica y el código fuente están retenidos durante el ciclo de publicación por fases, por lo que no es posible verificar la arquitectura de forma independiente.

## Capacidades

- Verificación de trayectorias multi-hop (2 a 3 saltos) en tareas de razonamiento relacional, con 90,40 % de precisión top-1 y 96,10 % en pass@2 sobre el conjunto XL-smol.
- Verificación de sentido común científico y físico (causal science & physical commonsense), con 95,30 % top-1.
- Verificación factual de un solo salto (single-hop factual world-model), con 86,80 % top-1.
- Verificación socrática y epistémica en cuatro modos (SEE/SAY/DO/KNOW), con 64,20 % top-1 y 92,80 % pass@2.
- Inducción de reglas en rejillas visuales-espaciales 2D (ARC-AGI-2 XL-smol), con 56,17 % top-1 y 81,33 % pass@2.
- Enrutamiento de acciones de agente mediante MPC, con defensa frente a deriva y prompt injection (66,75 % top-1, 71,96 % pass@2).
- Razonamiento matemático verificado en GSM8K con esquema de verificación de 4 vías (98,80 % con PPL 2,14 en el horizonte 10C).
- Consistencia de orden de opciones del 100 % en todas las suites evaluadas.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso generales, multilingüismo, visión, audio ni modo thinking explícito más allá de las tareas de verificación descritas.

## Casos de uso

- Verificación de trayectorias en agentes autónomos: el modelo actúa como juez de las secuencias de acciones propuestas por un agente, evaluando multi-hop y detectando deriva, gracias a su estado recurrente O(1) que permite puntuar trayectorias de longitud arbitraria sin crecer en memoria.
- Enrutamiento de acciones con control predictivo (MPC): en un bucle de planificación, el modelo puntúa las acciones candidatas y selecciona la más consistente con el modelo de mundo, con defensa integrada frente a prompt injection según la suite de agent MPC.
- Verificación de sentido común en pipelines de generación: como filtro posterior a un LLM generador, descarta respuestas físicamente implausibles o causalmente incoherentes (95,30 % top-1 en la suite de ciencia causal).
- Razonamiento matemático verificado: en un esquema de 4 vías sobre GSM8K, el modelo puede usarse como verificador de soluciones candidatas generadas por otro modelo, con 98,80 % de acierto en el conjunto de test de 500 ejemplos.
- Inducción de reglas en tareas de rejilla: para problemas tipo ARC-AGI-2, el modelo induce reglas espaciales 2D y verifica transformaciones, adecuado en entornos de investigación sobre razonamiento abstracto.
- Despliegue en el borde (edge): con 26,4 M de parámetros y estado fijo de 2,25 KB, cabe en dispositivos con memoria muy limitada y puede ejecutar verificación continua sin caché KV.
- Evaluación de consistencia epistémica: en sistemas de preguntas y respuestas, el modo socrático de cuatro modos permite clasificar si una respuesta requiere ver, decir, hacer o saber, útil para enrutar consultas.

## Benchmarks y rendimiento

Resultados declarados en la model card sobre el conjunto XL-smol (12.003 registros retenidos, 29.609 preguntas):

| Suite XL-smol | Registros | Preguntas | Top-1 | pass@2 | Consistencia de orden |
|---|---:|---:|---:|---:|---:|
| Multi-hop relacional (2-3 saltos) | 2.500 | 5.000 | 90,40 % | 96,10 % | 100 % |
| Ciencia causal y sentido común físico | 2.500 | 5.000 | 95,30 % | 98,80 % | 100 % |
| Factual de un solo salto | 2.500 | 5.000 | 86,80 % | 93,10 % | 100 % |
| Socrático epistémico (4 modos) | 2.500 | 5.000 | 64,20 % | 92,80 % | 100 % |
| Rejilla visual-espacial (ARC-AGI-2) | 1.200 | 3.600 | 56,17 % | 81,33 % | 100 % |
| Enrutamiento MPC de agente | 803 | 2.409 | 66,75 % | 71,96 % | 100 % |
| Agregado 6 suites (macro/micro) | 12.003 | 26.009 | 76,60 % / 79,19 % | 89,87 % | 100 % |
| Benchmark consolidado 12 dominios | 17.130 | 40.687 | 73,34 % macro | 75,94 % micro | 100 % |

Resultados en SLM-Bench y GSM8K (13.644 ejemplos):

| Benchmark | Split (n) | Aleatorio | Currículo 24 h | Horizonte 10C |
|---|---|---:|---:|---:|
| BoolQ | val (3.270) | 50,00 % | 66,70 % | 73,45 % |
| QNLI | val (1.000) | 50,00 % | 78,70 % | 86,58 % |
| ARC-Easy | test (2.376) | 25,00 % | 38,05 % | 55,76 % |
| ARC-Challenge | test (1.172) | 25,00 % | 30,55 % | 40,70 % |
| OpenBookQA | test (500) | 25,00 % | 45,40 % | 55,04 % |
| PIQA | val (1.838) | 50,00 % | 57,40 % | 65,78 % |
| WinoGrande | val (1.267) | 50,00 % | 52,64 % | 63,26 % |
| HellaSwag | val (1.000) | 25,00 % | 37,80 % | 51,18 % |
| CommonsenseQA | val (1.221) | 20,00 % | 28,83 % | 41,58 % |
| Media macro 9 tareas | 13.144 | 35,56 % | 48,45 % | 59,26 % |
| GSM8K verificación 4 vías | test (500) | 25,00 % | 98,60 % (PPL 7,51) | 98,80 % (PPL 2,14) |

No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con ~26,4 M de parámetros almacenados, en float16 ocuparía aproximadamente 53 MB de pesos, y en float32 unos 106 MB, a lo que se sumaría el estado recurrente fijo de 2,25 KB.
- GPU recomendadas: no especificadas en la información disponible; por tamaño, cualquier GPU consumer moderna sería suficiente, pero no hay datos oficiales de compatibilidad.
- Cabe en GPU consumer: sí, por el reducido número de parámetros, aunque no se documentan requisitos mínimos oficiales.
- Opciones de despliegue: la model card indica compatibilidad con `transformers` y etiqueta `endpoints_compatible`; no se documenta soporte explícito para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles; la arquitectura declara O(1) de cómputo y memoria por token, pero no se publican cifras de latencia o tokens por segundo.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos con otros modelos en la información proporcionada. A continuación se comparan únicamente características arquitectónicas declaradas frente a alternativas de la misma familia publicadas por el mismo autor, sin datos de rendimiento relativos:

| Modelo | Autor | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---:|---|---|---|
| GRT-Mamba-b0.7.0-20m | MatterWaveAI | ~26,4 M | hasta 8.192 (evaluado) | Apache 2.0 | SSM rotacional, juez de trayectorias |
| s1-grt-mamba-b0.7.0-20m | MatterWaveAI | no disponible | no disponible | Apache 2.0 | SSM rotacional, clasificación de texto, seguridad de agentes |
| helmholtz-mamba-b0.7.0-20m | MatterWaveAI | no disponible | no disponible | Apache 2.0 | SSM rotacional con JEPA, modelo de mundo |
| grt-20m (base) | MatterWaveAI | no disponible | no disponible | no disponible | Modelo base del que deriva |

No se han encontrado comparaciones con modelos de otras familias (por ejemplo, Mamba estándar o transformers pequeños) en la información disponible.

## Limitaciones y advertencias

- Pesos, implementación arquitectónica y código fuente retenidos: la model card indica explícitamente que están "withheld during the staged world-model release cycle", por lo que el modelo no es reproducible ni verificable de forma independiente en el momento de la ficha.
- Resultados autodeclarados: todos los benchmarks proceden de la model card del autor, sin validación externa ni comparación con terceros.
- Idiomas no especificados: no se documenta qué lenguas soporta ni la composición lingüística del corpus, lo que impide garantizar calidad multilingüe.
- Riesgo de alucinación: no evaluado en la información disponible; las tareas descritas son de verificación con opciones múltiples, no de generación abierta.
- Sesgos conocidos: no documentados.
- Limitaciones de contexto: aunque la arquitectura soporta secuencias arbitrarias con estado O(1), la evaluación se limita a T = 8.192; no hay datos más allá de esa longitud.
- Uso comercial: la licencia Apache 2.0 permite uso comercial, pero la retención de pesos y código limita su aplicabilidad práctica hasta la publicación completa.
- Orientado a verificación, no a generación: el pipeline declarado es text-generation, pero las capacidades documentadas se centran en juicio de trayectorias, enrutamiento MPC y clasificación de opciones; no se documenta calidad de generación libre.
- Sin datos de cuantización ni formatos GGUF: no se indica disponibilidad de pesos cuantizados para despliegue en el borde, pese a ser un caso de uso declarado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MatterWaveAI/grt-mamba-b0.7.0-20m
- Modelo base: https://huggingface.co/MatterWaveAI/grt-20m
- Familia GRT-Mamba: https://huggingface.co/MatterWaveAI/grt-mamba
- Variante s1-grt-mamba-b0.7.0-20m: https://huggingface.co/MatterWaveAI/s1-grt-mamba-b0.7.0-20m
- Variante helmholtz-mamba-b0.7.0-20m: https://huggingface.co/MatterWaveAI/helmholtz-mamba-b0.7.0-20m
- Discusiones de helmholtz-mamba-b0.7.0-20m: https://huggingface.co/MatterWaveAI/helmholtz-mamba-b0.7.0-20m/discussions
