# ikimyaii/HGRN-340M-unstructured-SparseGPT-80pct

## Resumen

HGRN-340M-unstructured-SparseGPT-80pct es un modelo de lenguaje de 341.148.672 parámetros derivado de m-a-p/340M-20B-HGRN-pure-baseline, un transformer basado en HGRN (Hierarchically Gated Recurrent Network) entrenado sobre 20.000 millones de tokens. El modelo ha sido podado de forma one-shot (sin reentrenamiento) al 80% de esparsidad no estructurada mediante el código oficial de SparseGPT (IST-DASLab/sparsegpt), con bloques de 128 columnas y damping de 0,01. Lo publica el usuario ikimyaii como baseline de referencia para sus modelos EHWS.

El interés técnico del artefacto no reside en su calidad final —que se degrada severamente— sino en su valor como punto de comparación metodológico: demuestra empíricamente el coste de aplicar poda one-shot agresiva a un modelo pequeño sin recuperación posterior. La perplejidad en WikiText-2 pasa de 21,96 a 499,75 y en C4 de 21,94 a 326,27, mientras la media de precisión zero-shot en lm-evaluation-harness cae de 0,4400 a 0,3286.

Se trata de un modelo de investigación, no de producción. Su relevancia radica en documentar el comportamiento de SparseGPT a alta esparsidad sobre arquitecturas recurrentes lineales (HGRN) en lugar de transformers convencionales, y en servir de referencia cuantitativa para técnicas de poda más sofisticadas como las que el mismo autor evalúa en otros modelos de su cuenta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | HGRN (Hierarchically Gated Recurrent Network) |
| Parámetros totales | 341.148.672 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Espsarsidad | 80% no estructurada (0,8000 medida en los pesos) |
| Modelo base | m-a-p/340M-20B-HGRN-pure-baseline |
| Tamaño del repo | 0,7 GB |
| Capas podadas | 168 capas lineales dentro de los bloques |
| Embeddings y lm_head | densos (no podados) |

## Arquitectura y entrenamiento

El modelo base es un HGRN de 340M de parámetros entrenado sobre 20.000 millones de tokens, según indica el identificador del checkpoint original (340M-20B-HGRN). HGRN es una arquitectura recurrente con compuertas jerárquicas que sustituye la atención por una recurrencia lineal, lo que permite un coste computacional lineal en la longitud de secuencia. El modelo derivado conserva esa arquitectura íntegra y solo modifica los pesos de las capas lineales mediante poda.

La poda se realizó con el código oficial de SparseGPT en su commit 147d215, usando el driver `fasterprune` con blocksize 128 y damping 0,01. La calibración empleó 128 secuencias de C4 de 2.048 tokens con semilla 0. Los bloques se podaron en orden y cada bloque se calibró sobre las salidas de los bloques ya podados anteriores, siguiendo el esquema de los drivers oficiales. La novedad de implementación es el recorrido de capas, escrito específicamente para HGRN, ya que los drivers oficiales solo soportan OPT y LLaMA; la matemática de poda es la del código oficial. Los pesos se podaron en bfloat16 y el proceso completo tardó 1,6 minutos en una A100 de 40 GB. La máscara aplica un umbral por bloque de 128 columnas, por lo que las filas resultantes tienen distinto número de no-ceros: en promedio, la fila más densa tiene 2,17 veces los no-ceros de la media (peor capa: 3,21 veces).

## Capacidades

- Generación de texto autoregresiva, heredada del modelo base, aunque severamente degradada por la poda.
- Razonamiento básico y respuesta a preguntas de opción múltiple: la precisión media zero-shot cae a 0,3286, con tareas como arc_easy en 0,2917 frente a 0,6153 del denso.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (idiomas no declarados).
- Modo thinking, visión o audio: no disponibles.
- Carga mediante `AutoModelForCausalLM.from_pretrained(...)` con `flash-linear-attention` instalado (`import fla`).

## Casos de uso

- Baseline de investigación en poda: sirve como referencia cuantitativa para comparar técnicas de poda más avanzadas (por ejemplo, los modelos EHWS del mismo autor) frente a SparseGPT one-shot al 80% sobre HGRN, usando las métricas de perplejidad y zero-shot ya publicadas.
- Estudio de robustez de arquitecturas recurrentes lineales: permite analizar cómo se degrada HGRN bajo esparsidad no estructurada agresiva, comparándolo con el comportamiento documentado de transformers en la literatura de SparseGPT.
- Validación de pipelines de evaluación: el modelo y sus resultados (ELSA para perplejidad, lm-evaluation-harness para zero-shot) permiten verificar réplicas de protocolos de evaluación en entornos propios.
- Reproducibilidad metodológica: útil para comprobar la implementación del recorrido de capas para HGRN sobre el código oficial de SparseGPT, dado que los drivers originales no cubren esta arquitectura.
- Docencia y divulgación: ejemplo concreto del impacto de la poda one-shot sin recuperación, con cifras verificables de perplejidad y precisión por tarea.
- Pruebas de carga y despliegue: modelo pequeño (0,7 GB en safetensors) útil para validar integraciones con `flash-linear-attention` y `AutoModelForCausalLM` sin coste de infraestructura.
- No recomendado para generación de texto en producción, atención al cliente, generación de código ni ninguna tarea que requiera calidad lingüística.

## Benchmarks y rendimiento

Perplejidad con el protocolo de evaluación de ELSA (WikiText-2 y C4, fp16):

| Métrica | Denso | Este modelo |
|---|---|---|
| WikiText-2 | 21,96 | 499,75 |
| C4 | 21,94 | 326,27 |

Precisión zero-shot con lm-evaluation-harness:

| Tarea | Denso | Este modelo |
|---|---|---|
| arc_challenge | 0,2628 | 0,1962 |
| arc_easy | 0,6153 | 0,2917 |
| boolq | 0,6028 | 0,3817 |
| hellaswag | 0,3423 | 0,2624 |
| openbookqa | 0,2380 | 0,1340 |
| rte | 0,5126 | 0,5271 |
| winogrande | 0,5059 | 0,5075 |
| Media | 0,4400 | 0,3286 |

## Requisitos de hardware

- VRAM estimada para inferencia: el repo pesa 0,7 GB en safetensors; en bfloat16 los 341M de parámetros ocupan aproximadamente 0,68 GB, por lo que la inferencia cabe holgadamente en cualquier GPU consumer con 2 GB o más de VRAM.
- GPU recomendadas: cualquier GPU moderna sirve; el autor usó una A100 de 40 GB solo para el proceso de poda (1,6 minutos), no para inferencia.
- Cabe en GPU consumer: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 o incluso iGPU con suficiente memoria compartida.
- Opciones de despliegue: `AutoModelForCausalLM.from_pretrained(...)` con `flash-linear-attention` instalado (`import fla`). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; al no haber pesos GGUF publicados, llama.cpp requeriría conversión propia.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HGRN-340M-unstructured-SparseGPT-80pct | 341.148.672 | no disponible | 499,75 | no disponible | Hugging Face (0 descargas) |
| m-a-p/340M-20B-HGRN-pure-baseline (denso) | ~340M | no disponible | 21,96 | no disponible | Hugging Face |
| Modelos EHWS del mismo autor | no disponible | no disponible | no disponible | no disponible | Hugging Face (referenciados en la model card) |

La comparación principal es contra su propio modelo base denso: la poda al 80% multiplica por 22,8 la perplejidad en WikiText-2 y por 14,9 en C4, con una pérdida media de 11,14 puntos de precisión zero-shot. No se dispone de datos de otros modelos comparables de poda sobre HGRN en la información proporcionada.

## Limitaciones y advertencias

- Degradación severa de calidad: perplejidad de 499,75 en WikiText-2 y 326,27 en C4, inviables para generación de texto útil.
- Pérdida marcada en tareas de conocimiento y sentido común: arc_easy cae 32,36 puntos y openbookqa 10,40 puntos respecto al denso.
- Filas desbalanceadas: la fila más densa tiene de media 2,17 veces los no-ceros de la media (peor capa 3,21 veces), lo que genera un patrón de esparsidad irregular que complica el aprovechamiento real del hardware.
- Sin reentrenamiento: la poda es one-shot, sin recuperación posterior de pesos, lo que explica la magnitud de la degradación.
- Licencia no declarada: no se especifican términos de uso comercial; debe consultarse el modelo base m-a-p/340M-20B-HGRN-pure-baseline antes de cualquier uso.
- Idiomas no declarados: no hay información sobre cobertura lingüística ni sesgos por idioma.
- Riesgo de alucinación: elevado por la degradación del modelo; no apto para producción.
- Dependencia de `flash-linear-attention`: la carga requiere esta librería instalada, lo que limita la portabilidad frente a stacks de inferencia estándar.
- Sin datos de benchmarks adicionales ni de contexto máximo soportado.
- Modelo de investigación con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ikimyaii/HGRN-340M-unstructured-SparseGPT-80pct
- Modelo base: https://huggingface.co/m-a-p/340M-20B-HGRN-pure-baseline
- Código oficial de SparseGPT: https://github.com/IST-DASLab/sparsegpt (commit 147d215)
- Librería flash-linear-attention: no disponible enlace directo en la información proporcionada
- Paper de SparseGPT: no disponible enlace en la información proporcionada
- Paper de HGRN: no disponible enlace en la información proporcionada
