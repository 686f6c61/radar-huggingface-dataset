# dimitarpg13/semsimula-ladder-live-code-d384-l2-none-norc-sr2-vtlr0p25

## Resumen

SO-CODE-VTLR es un modelo de lenguaje de investigación desarrollado por el usuario dimitarpg13 dentro del programa "semsimula", una línea de trabajo sobre modelos de lenguaje conservativos basados en mecánica lagrangiana y potenciales escalares. No es un transformer ni usa atención: se trata de una arquitectura alternativa, sin atención y con memoria constante en inferencia, entrenada sobre código Python del dataset CodeParrot. El modelo tiene 76.572.109 parámetros y se entrenó sobre exactamente 315.392.000 tokens.

Este checkpoint concreto es un control experimental, no un modelo pensado para producción. Su propósito es aislar una variable en un estudio pre-registrado sobre "pozos muertos" (dead wells) en el banco de potenciales V_θ: se entrena con la tasa de aprendizaje de V_θ multiplicada por 0,25 manteniendo cinco canales de contexto, para comprobar si ralentizar el potencial corrige el fallo observado al añadir un sexto canal. La hipótesis es que el sexto canal no aporta nada en código y que la mejora aparente proviene del ajuste del optimizador, no de la arquitectura.

El resultado declarado es una perplejidad de validación de 6,09 en el bloque 512 sobre CodeParrot clean (Python), un 1,6 % peor que la línea base SO-CODE (6,00) y prácticamente empatado con la pantalla B de seis canales (5,98). El modelo es relevante como evidencia empírica en investigación de arquitecturas alternativas y como ejemplo de metodología pre-registrada con ablaciones controladas, no como herramienta de generación de código lista para usar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No transformer, sin atención (attention-free), modelo de lenguaje conservativo con potencial escalar y mecánica lagrangiana; integración BAOAB, potencial gaussiano anisotrópico, geometría riemanniana con métrica de Jacobi |
| Parámetros totales | 76.572.109 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (entrenamiento y evaluación con bloques de 512 tokens) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | PyTorch (repo de 0,3 GB); no se indica safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura es un modelo de lenguaje conservativo ("conservative language model") que sustituye la atención por un sistema dinámico con un potencial escalar V_θ y formulación lagrangiana. El modelo integra la dinámica con el esquema BAOAB y emplea un potencial gaussiano anisotrópico sobre una geometría riemanniana definida por la métrica de Jacobi, con geodesicas riemannianas. La inferencia es de memoria constante, una propiedad propia de las arquitecturas sin atención. El modelo organiza el contexto en canales ("context channels"); este checkpoint usa cinco, igual que la línea base SO-CODE, y la variable experimental es únicamente la tasa de aprendizaje de V_θ, reducida a ×0,25.

El entrenamiento usó exactamente 315.392.000 tokens (19.250 pasos × 32 × 512) sobre CodeParrot clean, con el schedule WSD del "ladder": 16.250 pasos con el schedule y 3.000 pasos adicionales a la tasa de aprendizaje mínima. Todos los modelos de la comparativa parten del paso 0 con semilla 0 y los mismos batches, de modo que las evaluaciones están emparejadas paso a paso. La evaluación se hace sobre los primeros 2 millones de tokens de los ficheros de validación de CodeParrot, con split a nivel de fichero. La ejecución duró 5,98 horas en una sola sesión, sin disparos del watchdog, con una subida máxima de 0,074 entre pérdidas de entrenamiento registradas, norma de gradiente mediana de 0,49 tras el paso 2.000 (máximo 1,86 en el paso 500, durante el warmup) y monitor de fuga SCAF en estado CLEAN en las cuatro auditorías.

## Capacidades

- Generación de texto autoregresiva sobre código Python, con perplejidad de validación de 6,09 en bloques de 512 tokens.
- Modelado de lenguaje de dominio específico (código) entrenado exclusivamente con CodeParrot clean.
- Inferencia con memoria constante, sin coste de atención que crezca con la longitud de secuencia.
- Capacidad de control experimental: el modelo incorpora canales de contexto cuyo número y escala son configurables, lo que permite ablaciones de mecanismo reproducibles.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta modo thinking, visión ni audio.
- Multilingüe: no; solo inglés (y código Python).

## Casos de uso

- Investigación en arquitecturas sin atención: el modelo sirve como punto de comparación reproducible frente a transformers de tamaño similar (el GPT-2 emparejado en los mismos tokens de código alcanza 4,96 de perplejidad) para estudiar el coste de prescindir de la atención.
- Ablaciones de mecanismo controladas: al compartir batches, semilla y presupuesto de tokens con la línea base y las pantallas del estudio, permite comparaciones emparejadas paso a paso, útil para grupos que investigan dinámicas de entrenamiento.
- Estudio de "pozos muertos" en bancos de potenciales: el checkpoint documenta si los pozos de la capa 1 sobreviven (ratio de pozo más cercano ≤ 1,03 en siete checkpoints, coste de eliminación +272 %), lo que lo hace útil para analizar colapso de gradientes en modelos basados en energía.
- Reproducción de estudios pre-registrados: las predicciones VT1–VT4 están registradas antes del entrenamiento y puntuadas sobre la letra, lo que permite replicar la metodología y auditar la disciplina experimental.
- Benchmark de eficiencia de inferencia: su memoria constante lo convierte en candidato para medir latencia y consumo frente a transformers en secuencias largas, aunque no se publican cifras de throughput.
- Docencia y divulgación técnica: como ejemplo didáctico de modelo lagrangiano con potencial escalar, integrador BAOAB y geometría riemanniana aplicado a generación de lenguaje.
- No es adecuado como generador de código en producción: su perplejidad está muy por encima del GPT-2 emparejado y su propósito declarado es experimental.

## Benchmarks y rendimiento

| Modelo | Canales | LR de V_θ | Pozos capa 1 | Perplejidad (bloque 512) | Frente a SO-CODE |
|---|---:|---:|---|---:|---:|
| SO-CODE (línea base) | 5 | ×1 | vivos | 6,00 | — |
| XI6-CODE (no en el Hub) | 6 | ×1 | muertos | 8,55 | +42,6 % |
| Pantalla B (fix) | 6 | ×0,25 | vivos | 5,98 | −0,3 % |
| SO-CODE-VTLR (este modelo) | 5 | ×0,25 | vivos | 6,09 | +1,6 % |
| Pantalla A (segundo fix, entrada unit-norm) | 6 | ×1 | vivos | 5,95 | −0,7 % |
| SO-CODE-VTUN (control del segundo fix) | 5 | ×1 | vivos | 6,34 | +5,8 % |
| GPT-2 emparejado (mismos tokens) | — | — | — | 4,96 | — |

Detalle de este checkpoint: perplejidad asentada 6,09 (media de las evaluaciones en los pasos 18.000, 18.500 y 19.000: 5,96, 6,11 y 6,20); mejor valor 5,96 en el paso 18.000. Predicciones pre-registradas: VT1 (dentro de ±2 % de SO-CODE, probabilidad declarada 55 %) acertada con +1,6 %; VT2 (más de 5 % por delante en el paso 3.000, 65 %) acertada con −12,7 %; VT3 (pozos de la capa 1 vivos, 90 %) acertada; VT4 (pantalla B y este modelo dentro de ±2 %, 60 %) acertada con −1,8 %. Las métricas figuran como no verificadas en el model-index.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 76,57 M de parámetros, en fp32 los pesos ocupan aproximadamente 0,3 GB, y en fp16 unos 0,15 GB, pero son cálculos derivados del tamaño, no datos publicados.
- GPU recomendadas: no disponible. Por tamaño, cualquier GPU consumer con al menos 1 GB de VRAM libre debería alojar los pesos; no se documentan requisitos oficiales.
- Cabe en GPU consumer: sí por tamaño de parámetros (cálculo derivado), aunque no hay validación publicada.
- Opciones de despliegue: no disponible. El repo usa PyTorch y no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI; al ser una arquitectura no transformer sin atención, es improbable que funcione sin código específico del autor.
- Latencia y throughput: no disponible. La arquitectura declara memoria constante en inferencia, pero no se publican medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Perplejidad (CodeParrot clean, bloque 512) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SO-CODE-VTLR (este) | 76,57 M | No disponible (bloques de 512) | 6,09 | CC-BY-4.0 | Hugging Face |
| SO-CODE (línea base) | 76,57 M | No disponible (bloques de 512) | 6,00 | CC-BY-4.0 | Hugging Face |
| Pantalla A (fix unit-norm) | No disponible | No disponible (bloques de 512) | 5,95 | CC-BY-4.0 | Hugging Face |
| GPT-2 emparejado | No disponible (GPT-2 estándar) | No disponible | 4,96 | No disponible en la información | No disponible |

La comparativa relevante es interna al estudio: todos los modelos semsimula comparten exactamente 76.572.109 parámetros, presupuesto de tokens y batches, de modo que las diferencias de perplejidad reflejan solo el cambio de mecanismo u optimizador. Frente al transformer emparejado (GPT-2, 4,96), la familia semsimula queda entre un 20 % y un 72 % por detrás en perplejidad.

## Limitaciones y advertencias

- Modelo de investigación: no está pensado para producción ni para generación de código fiable; su perplejidad supera ampliamente la de un GPT-2 emparejado.
- Entrenado solo con código Python de CodeParrot clean y solo en inglés; no cubre otros lenguajes naturales ni de programación.
- Riesgo de alucinación y de código sintácticamente plausible pero incorrecto: no se documentan evaluaciones funcionales (pass@k, HumanEval) que lo descarten.
- No se documentan sesgos específicos, pero el corpus CodeParrot clean puede arrastrar sesgos de su origen; no hay auditoría publicada.
- Restricciones de licencia: CC-BY-4.0 permite uso comercial con atribución, pero el modelo no ofrece garantías de calidad para ese uso.
- Ausencia de formatos estándar (GGUF, safetensors) y de soporte en frameworks de despliegue habituales; requiere el código del autor para ejecutarse.
- Los resultados de benchmarks figuran como no verificados en el model-index y proceden del propio autor.
- Forma parte de un estudio con hipótesis pre-registradas; su valor es metodológico y comparativo, no de rendimiento absoluto.
- El número de contexto máximo no está documentado; solo se conoce el tamaño de bloque usado en entrenamiento y evaluación (512).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dimitarpg13/semsimula-ladder-live-code-d384-l2-none-norc-sr2-vtlr0p25
- Línea base SO-CODE: https://huggingface.co/dimitarpg13/semsimula-ladder-live-code-d384-l2-none-norc-sr2
- Pantalla B (fix con seis canales y LR ×0,25): https://huggingface.co/dimitarpg13/semsimula-ladder-live-code-d384-l2-none-norc-xi6long-sr2-wr3-vtlr0p25
- Pantalla A (fix con entrada unit-norm): https://huggingface.co/dimitarpg13/semsimula-ladder-live-code-d384-l2-none-norc-xi6long-sr2-wr3-vtun
- Control SO-CODE-VTUN: https://huggingface.co/dimitarpg13/semsimula-ladder-live-code-d384-l2-none-norc-sr2-vtun
- Colección "dead wells" (generación 3): https://huggingface.co/collections/dimitarpg13/semantic-simulation-gen-3-dead-wells-in-the-v-bank-6ae5275768c02fe9f540c5a3
- Nota técnica sobre pozos muertos: https://github.com/dimitarpg13/semsimula-paper/blob/main/companion_notes/Dead_Wells_in_the_Joint_V_theta_Bank.md
- Pre-registro del estudio: https://github.com/dimitarpg13/semsimula-paper/blob/main/companion_notes/depth_ladder/Code_Dead_Wells_and_Screens.md
- Dataset CodeParrot clean: https://huggingface.co/datasets/codeparrot/codeparrot-clean-train
