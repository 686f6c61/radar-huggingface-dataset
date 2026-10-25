# Erland/K2-Horizon-375B-A23B-DFlash-b8-v1

## Resumen

K2-Horizon-375B-A23B-DFlash-b8-v1 es un modelo borrador (draft model) para decodificación especulativa, publicado por el usuario Erland, que se acopla al modelo objetivo IFM/K2-Horizon-375B-A23B en su variante FP8. No es un modelo de propósito general: su única función es proponer bloques de tokens que el modelo grande verifica en paralelo, de modo que la generación completa gane velocidad sin alterar la distribución de salida del modelo objetivo.

El borrador emplea el método DFlash (block-diffusion drafting) descrito por Chen, Liang y Liu en ICML 2026 (arXiv:2602.06036), e implementa 5 capas transformer de estilo Qwen3 con tamaño oculto 6.144, 48 cabezas de atención y 8 cabezas KV con dimensión 128, y MLP de 16.384. El recuento real de parámetros en safetensors es de 2.139.170.048 (≈2,14 mil millones), coherente con esas cinco capas más los embeddings.

Su relevancia es práctica: el modelo objetivo tiene 375.000 millones de parámetros totales y 23.000 millones activos (MoE), de modo que cada token generado cuesta caro. Con 3 tokens especulativos por paso, este borrador reporta aceleraciones de 1,61x a 1,68x con 1 a 8 peticiones concurrentes y 2,55 tokens aceptados por paso de media, siempre sobre 8x AMD Instinct MI210 con vLLM y ROCm.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso de 5 capas estilo Qwen3, usado como borrador de decodificación especulativa (DFlash, block-diffusion drafting) |
| Parametros totales | 2.139.170.048 (≈2,14 B) |
| Parametros activos | No aplica (modelo denso; el MoE es el modelo objetivo: 375B totales / 23B activos) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No se documentan; los pesos se publican en safetensors (el tamaño del repo, 4,3 GB, es coherente con precisión de 16 bits). El modelo objetivo se sirve en FP8 |
| Idiomas soportados | No disponible (los prompts de entrenamiento incluyen WildChat en todos los idiomas, pero no se declara cobertura lingüística) |
| Licencia | Apache-2.0 (el método DFlash y su código de referencia, z-lab/dflash, son MIT) |
| Formato de pesos | safetensors (librería declarada: vLLM) |

## Arquitectura y entrenamiento

El borrador es un transformer de 5 capas con hidden size 6.144, 48 cabezas de atención y 8 cabezas KV (GQA) de dimensión 128, y MLP de 16.384. Sobre esa pila se aplica el esquema DFlash: en lugar de proponer tokens uno a uno, el borrador genera bloques mediante difusión sobre tokens discretos, que el modelo objetivo valida en un único paso de verificación. La configuración de servicio recomendada usa 3 tokens especulativos (`num_speculative_tokens: 3`) y el backend de atención `TRITON_ATTN` de vLLM. El sufijo `b8` del nombre no está documentado en la información disponible.

El entrenamiento se realizó con el framework DeepSpec en dos etapas, usando respuestas e hidden states generados por K2-Horizon-375B (FP8), nunca datos humanos nuevos. La etapa 1 empleó unas 197.000 respuestas de K2 a temperatura 1,0, con aproximadamente un 80 % de prompts PerfectBlend y un 20 % de WildChat y de function calling de glaive. La etapa 2 usó 54.464 respuestas greedy (temperatura 0) a prompts de estilo producción con esfuerzo de razonamiento alto: ~50 % primeros turnos de WildChat, ~27 % conversaciones multi-turno, ~9 % function calling de glaive y ~14 % PerfectBlend. Los prompts provienen de allenai/WildChat-1M (ODC-BY), glaiveai/glaive-function-calling-v2 (Apache-2.0) y mlabonne/open-perfectblend (Apache-2.0). El hardware de entrenamiento fueron 8x MI210, con extracción de hidden states del objetivo mediante vLLM en un segundo nodo de 8x MI210.

## Capacidades

- Decodificación especulativa: propone hasta 3 tokens por paso que el modelo objetivo verifica, con una media de 2,55 tokens aceptados por paso (incluido el token que K2 añade siempre).
- Aceleración de inferencia: 1,61x con 1 petición concurrente, 1,68x con 4, 1,64x con 8 y 1,44x con 16.
- Compatibilidad con cargas de chat de producción y multi-turno, por la composición del dataset de la etapa 2 (WildChat primeros turnos y multi-turno).
- Compatibilidad con function calling: entrenado parcialmente con prompts de glaive con funciones declaradas como herramientas.
- Integración con vLLM sobre ROCm/AMD: pensado y validado en MI210 con paralelismo TP8/EP8.
- No genera texto de forma autónoma con calidad utilizable: no sustituye al modelo objetivo en ninguna tarea de razonamiento, código o matemáticas.
- Sin modo thinking propio, sin visión, sin audio y sin soporte multilingüe declarado.

## Casos de uso

- Servicio de chat de alto tráfico sobre K2-Horizon-375B: desplegar el borrador junto al objetivo en el mismo servidor vLLM permite sostener más peticiones por GPU en respuestas de 1.024 tokens, con ganancias de 1,44x a 1,68x según concurrencia.
- Generación de respuestas largas en producción: el punto dulce medido es 2.048 tokens de entrada y 1.024 de salida, con 1,77x de throughput frente al servidor sin borrador.
- Asistentes con historial conversacional largo (8.192 tokens de entrada): sigue aportando 1,32x, útil en agentes que arrastran contexto acumulado.
- Pipelines de function calling y agentes: al haber sido entrenado con prompts de glaive, el borrador acelera también turnos con herramientas declaradas, reduciendo la latencia por paso en flujos multi-step.
- Inferencia single-stream de baja latencia: con 1 petición y 512/1.024 tokens alcanza 1,93x, adecuado para demos interactivas o generación en tiempo real donde el tiempo hasta el último token importa.
- Reducción de coste en clústeres AMD: añadir 4,3 GB de pesos de borrador a un despliegue de 8x MI210 permite recortar el tiempo de decodificación sin cambiar de hardware ni de modelo objetivo.
- Evaluación comparativa de técnicas de decodificación especulativa: sirve como referencia reproducible de DFlash frente a EAGLE o Medusa sobre el mismo objetivo FP8.

## Benchmarks y rendimiento

Las cifras publicadas corresponden a 64 prompts de test (mitad chat de producción, mitad PerfectBlend), decodificación greedy, 1.024 tokens de salida y K2-Horizon-375B FP8 sobre 8x MI210 (TP8/EP8). La aceleración se mide contra el mismo servidor sin borrador.

| Peticiones concurrentes | Aceleración (3 guesses) |
|---|---|
| 1 | 1,61x |
| 4 | 1,68x |
| 8 | 1,64x |
| 16 | 1,44x |

| Guess | 1.º | 2.º | 3.º |
|---|---|---|---|
| Aceptados (proporción de pasos) | 0,730 | 0,495 | 0,341 |

| Entrada / salida (tokens) | Throughput relativo |
|---|---|
| 512 / 128 | 0,95x |
| 2.048 / 128 | 1,10x |
| 512 / 1.024 | 1,51x |
| 2.048 / 1.024 | 1,77x |
| 8.192 / 1.024 | 1,32x |
| 512 / 1.024 (1 petición) | 1,93x |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible, lo que es esperable al tratarse de un borrador y no de un modelo generativo autónomo.

## Requisitos de hardware

- VRAM del borrador: unos 4,3 GB en precisión de 16 bits (tamaño del repo), adicionales a la memoria del modelo objetivo.
- VRAM del conjunto: el objetivo de 375B en FP8 requiere del orden de 375 GB de pesos más caché KV; el despliegue de referencia usa 8x MI210 (64 GB HBM2e cada una, 512 GB en total).
- GPU recomendadas: 8x AMD Instinct MI210 con ROCm y vLLM, configuración validada por el autor (`--tensor-parallel-size 8 --enable-expert-parallel`).
- No cabe en GPU de consumo de forma útil: el borrador aislado ocupa 4,3 GB (cabría en una RTX 4090 de 24 GB), pero sin el objetivo no produce resultados.
- Opciones de despliegue: vLLM con `--speculative-config '{"method": "dflash", "model": "<este repo>", "num_speculative_tokens": 3, "attention_backend": "TRITON_ATTN"}'`. No se documentan soporte en llama.cpp, Ollama ni TGI.
- Latencia y throughput: 2,55 tokens aceptados por paso de media; hasta 1,93x en single-stream y 1,77x en el mejor caso agregado. En respuestas cortas (128 tokens de salida) el borrador no compensa el coste extra de prefill y puede incluso penalizar (0,95x con 512/128).

## Comparativa con modelos similares

| Alternativa | Parámetros | Contexto | Aceleración reportada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este borrador (DFlash b8, 3 guesses) | 2,14 B | No disponible | 1,44x–1,68x (1–16 peticiones); 1,93x en single-stream | Apache-2.0 | HuggingFace, requiere vLLM con método dflash |
| K2-Horizon-375B-A23B FP8 sin borrador | 375 B totales / 23 B activos | No disponible | 1,00x (referencia) | Apache-2.0 | HuggingFace |
| Borradores tipo EAGLE-3 | No disponible | No disponible | No disponible en esta información | No disponible | No disponible |
| Cabezas Medusa | No disponible | No disponible | No disponible en esta información | No disponible | No disponible |

No se dispone de datos publicados que comparen este borrador con EAGLE-3, Medusa u otras técnicas de decodificación especulativa sobre el mismo modelo objetivo; la comparación solo puede hacerse contra el servidor sin borrador.

## Limitaciones y advertencias

- Dependencia estricta del objetivo: solo es válido con K2-Horizon-375B-A23B, en la práctica su variante FP8; no funciona como modelo de texto independiente ni con otros modelos.
- Dependencia de infraestructura: requiere vLLM con soporte del método `dflash` y backend `TRITON_ATTN`; fuera de ROCm/MI210 el rendimiento no está validado.
- Regresión en respuestas cortas: con 128 tokens de salida el throughput cae a 0,95x (512/128), porque el prefill adicional del borrador no se amortiza.
- Caída de eficiencia con alta concurrencia: la aceleración baja de 1,68x (4 peticiones) a 1,44x (16 peticiones) por la menor tasa de aceptación.
- Tasa de aceptación decreciente: 0,730 en el primer guess, 0,495 en el segundo y 0,341 en el tercero; aumentar el número de tokens especulativos más allá de 3 no está documentado.
- Sesgos heredados: el borrador se entrenó sobre respuestas de K2 a prompts de WildChat, glaive y PerfectBlend, por lo que reproduce la distribución y los sesgos del objetivo, no los corrige.
- Riesgo de alucinación: no aplica al borrador en sí (el objetivo verifica cada token), pero cualquier error del objetivo se mantiene intacto; la decodificación especulativa es lossless respecto a la distribución del verificador en la implementación correcta.
- Idiomas: no se declara cobertura lingüística; el rendimiento en idiomas distintos del inglés no está medido, aunque los prompts de entrenamiento incluyan conversaciones multilingües.
- Licencias de datos: WildChat-1M es ODC-BY y exige atribución; glaive y open-perfectblend son Apache-2.0. Las respuestas fueron generadas íntegramente por K2.
- Sin métricas de calidad publicadas: no hay benchmarks de tareas que permitan evaluar el modelo por sí mismo, y el repo no registra descargas ni valoraciones (0 descargas, 0 likes en el momento de la consulta).
- Madurez: publicación del 25 de octubre de 2026, sin ecosistema de terceros ni informes independientes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Erland/K2-Horizon-375B-A23B-DFlash-b8-v1
- Modelo objetivo IFM/K2-Horizon-375B-A23B: https://huggingface.co/IFM/K2-Horizon-375B-A23B
- Paper DFlash (arXiv:2602.06036): https://arxiv.org/abs/2602.06036
- Código de referencia DFlash (MIT): https://github.com/z-lab/dflash
- Blog de presentación de K2 Horizon (IFM Team): https://ifm.ai/blog/k2/
- Dataset allenai/WildChat-1M: https://huggingface.co/datasets/allenai/WildChat-1M
- Dataset glaiveai/glaive-function-calling-v2: https://huggingface.co/datasets/glaiveai/glaive-function-calling-v2
- Dataset mlabonne/open-perfectblend: https://huggingface.co/datasets/mlabonne/open-perfectblend

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo; únicamente aparecieron páginas sin relación con el contenido técnico, por lo que no se han incluido.
