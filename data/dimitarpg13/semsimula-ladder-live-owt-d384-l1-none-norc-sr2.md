# dimitarpg13/semsimula-ladder-live-owt-d384-l1-none-norc-sr2

## Resumen

semsimula-ladder-live-owt-d384-l1-none-norc-sr2 es un modelo de lenguaje de investigación desarrollado por el autor independiente dimitarpg13 dentro del proyecto SemSimula. No es un transformer: se trata de un modelo de lenguaje conservativo basado en un potencial escalar y en mecánica lagrangiana, sin mecanismo de atención, entrenado sobre OpenWebText. Esta variante concreta (SR2-L1) es un brazo de un estudio de ablación pre-registrado que mide el valor de la profundidad: es la versión de una sola capa del modelo SR2 de dos capas de la generación 3.

El modelo resuelve un problema de investigación, no de producto: cuantificar cuánta calidad aporta la segunda capa en una arquitectura conservativa cuyos modos rígidos se integran como osciladores amortiguados exactos. Con 76.545.484 parámetros y una ventana de contexto de bloque de 512 tokens, alcanza una perplejidad de validación asentada de 69,15 sobre OpenWebText, un 18,6 % peor que su gemelo de dos capas (58,32) y un 38,8 % peor que el brazo equiparado a GPT-2 (49,81).

Es relevante ahora porque forma parte de una escalera de ablaciones con presupuesto de tokens igualado (532.480.000 tokens en todos los brazos) y predicciones publicadas antes de ejecutar el entrenamiento, lo que permite leer los resultados como evidencia estructural sobre arquitecturas alternativas al transformer con memoria constante en inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje conservativo (scalar potential, lagrangian mechanics), sin atención, integrador exacto de osciladores amortiguados (BAOAB), potencial gaussiano anisotrópico, espacio de Fock |
| Parametros totales | 76.545.484 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | bloque de 512 tokens (longitud de entrenamiento y evaluación) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | cc-by-4.0 |
| Formato de pesos | no disponible (librería pytorch; repositorio de 0,6 GB) |

## Arquitectura y entrenamiento

La arquitectura es no-transformer y sin atención. El modelo se formula como un sistema conservativo con un potencial escalar Vθ y un banco de pozos ("well bank") que concentra 35.425.160 parámetros; en esta variante de una capa, ese banco es usado por una sola capa donde SR2 lo comparten dos. Los modos rígidos se integran como osciladores amortiguados exactos mediante el esquema BAOAB, con integración de tiempo T = 8 en un único paso (Δt = 8), frente a los dos pasos de 4 de la versión de dos capas. Incorpora geometría riemanniana con geodésicas y métrica de Jacobi, y el conjunto de etiquetas menciona además "cfc" y "parflm".

El entrenamiento usó OpenWebText con un presupuesto exacto de 532.480.000 tokens: 32.500 pasos × 32 de batch × 512 tokens, idéntico al resto de modelos de la tabla comparativa, con el mismo corpus, tokenizer y lotes de validación. El schedule es WSD (warm-up, fase estable larga al learning rate pico y decaimiento hasta el suelo). La ejecución se completó en 5,65 h sobre una A100 a 0,63 s por paso, con 0 pasos omitidos, memoria pico de 19,2 GB en entrenamiento y 20,7 GB en evaluación, y norma de gradiente global superior a 1,0 en solo 5 de los 650 pasos registrados (todos en el warm-up, máximo 1,34). No se documenta RLHF ni DPO.

## Capacidades

- Generación de texto en inglés: el pipeline declarado es text-generation, evaluado por perplejidad sobre OpenWebText.
- Modelado de lenguaje autorregresivo con ventana de bloque de 512 tokens.
- Inferencia con memoria constante: la arquitectura sin atención implica un coste de memoria que no crece con la longitud de contexto procesada, según las etiquetas del repositorio.
- Integración exacta de modos rígidos: capacidad técnica del integrador, no una función de usuario.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe: solo inglés.
- No se documenta visión, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Investigación en arquitecturas alternativas al transformer: el modelo sirve como punto de medida reproducible para estudiar el efecto de la profundidad en modelos conservativos, con presupuesto de tokens y datos fijados y comparables contra SR2 y el brazo gpt2-matched.
- Ablación de mecanismos: al ser un brazo de una escalera pre-registrada, permite contrastar predicciones publicadas antes del entrenamiento (llamadas L1a, L1b, L1c) con resultados observados, un caso práctico de metodología científica reproducible.
- Estudio del schedule de learning rate: la métrica de "decay gain" (0,142 nats aquí frente a 0,193 en SR2) permite analizar cómo la profundidad afecta a la ganancia del decaimiento del learning rate en optimizadores AdamW.
- Experimentos de memoria constante en inferencia: para investigadores que necesiten medir el comportamiento de un modelo sin atención con coste de memoria plano en secuencias largas, aunque la ventana entrenada sea de 512 tokens.
- Reproducción de entrenamiento a pequeña escala: con 5,65 h en una A100 y 19,2 GB de pico, es viable replicar el run completo en un entorno académico con una sola GPU.
- Docencia y divulgación técnica: como ejemplo trabajado de modelo de lenguaje basado en mecánica lagrangiana, integradores simplécticos y potenciales escalares, útil en cursos avanzados de machine learning.
- Línea base para comparativas de perplejidad: con 69,15 de perplejidad asentada sobre OpenWebText, sirve como referencia inferior en estudios que comparen arquitecturas no-transformer.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index (no verificados):

| Modelo | Perplejidad de validación asentada (bloque 512) | Frente a este modelo | Frente a GPT-2 |
|---|---:|---:|---:|
| **Este modelo (SR2-L1, L = 1)** | **69,15** | — | 1,388× |
| SR2, mismo modelo con L = 2 (Gen 3) | 58,32 | +18,6 % | 1,171× |
| Brazo gpt2-matched | 49,81 | +38,8 % | 1,000× |

Detalle del resultado: la perplejidad asentada es la media de las tres últimas evaluaciones (68,96; 68,71; 69,78), con mejor valor de 67,77 en el paso 31.000. Antes del decaimiento (media de los pasos 19.000 a 21.000), este modelo marca 79,67 frente a 70,73 de SR2 (+12,6 %).

Evolución de la brecha frente a SR2 por ventanas de pasos:

| Pasos | 500–1.500 | 2.000–4.000 | 4.500–7.000 | 7.500–10.000 | 10.500–15.000 | 15.500–21.000 | 21.500–26.000 | 26.500–30.000 | 30.500–32.500 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Este modelo frente a SR2 | −2,0 % | −3,0 % | −1,4 % | +1,4 % | +6,6 % | +11,4 % | +14,1 % | +17,4 % | +18,9 % |

Predicciones pre-registradas y resultado: L1a (perplejidad asentada al menos un 15 % por encima de SR2) acertada con 69,15 (+18,6 %); L1b (brecha de al menos el 30,0 % del run 7) fallada; L1c (ganancia de decaimiento de 0,163 o menos) acertada con 0,142. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; como referencia, el entrenamiento usó 19,2 GB de pico y la evaluación 20,7 GB en una A100, con pesos en FP32 presumiblemente dado el tamaño del repositorio (0,6 GB) para 76,5 M de parámetros.
- GPU recomendadas: A100 para reproducir el entrenamiento y la evaluación tal como se documentan; cualquier GPU con al menos ~21 GB de VRAM para replicar el pipeline de evaluación.
- GPU de consumo: el repositorio no documenta ejecución en GPUs de consumo; por tamaño de parámetros (76,5 M) cabría en GPUs de 8-12 GB en precisión reducida, pero no hay datos publicados de cuantización ni de despliegue en consumer.
- Opciones de despliegue: librería pytorch; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y al ser una arquitectura no-transformer es improbable que esos motores la soporten sin adaptación.
- Latencia y throughput: 0,63 s por paso de entrenamiento con batch 32 y bloque 512 en una A100; no se publican métricas de latencia de inferencia ni tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Perplejidad (OpenWebText, bloque 512) | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| Este modelo (SR2-L1) | 76.545.484 | 512 | 69,15 | cc-by-4.0 | Hugging Face |
| SR2 (L = 2, Gen 3) | 76.572.110 (26.626 más) | 512 | 58,32 | no disponible en la información | Hugging Face |
| gpt2-matched | no disponible | 512 | 49,81 | no disponible en la información | Hugging Face |

La comparación relevante es interna a la escalera de ablación: el mismo autor mantiene SR2 (dos capas) y el brazo gpt2-matched como referencias con idéntico presupuesto de tokens, corpus, tokenizer y lotes de validación. No se dispone de datos para comparar con modelos de la misma categoría fuera de este proyecto.

## Limitaciones y advertencias

- Calidad limitada: perplejidad de 69,15 frente a 49,81 del brazo equiparado a GPT-2, es decir, un 38,8 % peor; no es un modelo apto para producción.
- Solo inglés: el modelo está entrenado y etiquetado únicamente para inglés.
- Contexto corto: bloque de 512 tokens, sin evidencia de generalización a secuencias más largas pese a la memoria constante de la arquitectura.
- Modelo de investigación: sin verificación independiente de los resultados (el model-index marca "verified: false"); los números proceden del autor.
- Sesgos: no se documenta ninguna evaluación de sesgos, toxicidad o seguridad; OpenWebText es un corpus web sin filtrado específico más allá del propio dataset.
- Riesgo de alucinación: alto esperable por su escala y perplejidad, aunque no se han publicado evaluaciones específicas.
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero al ser un artefacto de investigación no se recomienda su despliegue en entornos de producción.
- Sin soporte documentado de cuantización ni de motores de inferencia estándar (vLLM, llama.cpp), lo que complica su integración.
- La variante de una capa es un brazo de ablación, no una versión optimizada: su propósito es medir el coste de eliminar la segunda capa, no ofrecer el mejor rendimiento de la familia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l1-none-norc-sr2
- Modelo SR2 (L = 2, Gen 3): https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-sr2
- Brazo gpt2-matched: https://huggingface.co/dimitarpg13/semsimula-ladder-owt-d384-l2-gpt2-matched
- Colección Gen 3 (live-gradient ladder): https://huggingface.co/collections/dimitarpg13/semantic-simulation-gen-3-cfc-baoab-live-gradients-6abf371ea3c83f127057020c
- Nota de pre-registro SR2-L1 y ruido de decaimiento: https://github.com/dimitarpg13/semsimula-paper/blob/main/companion_notes/depth_ladder/SR2_L1_and_Decay_Noise.md#sr2-l1-setup
- Dataset OpenWebText: https://huggingface.co/datasets/Skylion007/openwebtext
