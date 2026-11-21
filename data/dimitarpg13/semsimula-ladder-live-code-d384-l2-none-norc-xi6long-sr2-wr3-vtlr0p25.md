# dimitarpg13/semsimula-ladder-live-code-d384-l2-none-norc-xi6long-sr2-wr3-vtlr0p25

## Resumen

El modelo `semsimula-ladder-live-code-d384-l2-none-norc-xi6long-sr2-wr3-vtlr0p25`, abreviado como screen B o XI6-CODE-VTLR, es un modelo de lenguaje experimental para generación de código Python desarrollado por el autor independiente dimitarpg13 dentro de su línea de investigación SemSimula. No es un transformer: es un modelo de lenguaje conservativo basado en un potencial escalar y mecánica lagrangiana, con inferencia sin atención y con memoria constante. Forma parte de un estudio de ablación de mecanismos preinscrito (ladder study) sobre la arquitectura PARFLM, y su propósito no es competir con modelos de producción, sino aislar la causa de un fallo concreto: la muerte de los pozos de potencial de la segunda capa al añadir un sexto canal de contexto.

El modelo parte de SO-CODE (5 canales de contexto) y añade un sexto canal enrutado por contenido, entrenado con una tasa de aprendizaje del banco de potencial V_θ reducida a ×0,25. El resultado es un hallazgo negativo publicado como tal: la corrección funciona (los pozos de la capa 1 permanecen vivos y el modelo converge a una perplejidad de validación de 5,98, en línea con la línea base de 6,00), pero el sexto canal no aporta ninguna mejora medible. La relevancia es, por tanto, metodológica y de investigación, no práctica.

El modelo tiene 83.690.702 parámetros, se entrenó sobre exactamente 315.392.000 tokens de CodeParrot Clean (Python) y se evalúa con perplejidad de validación en bloques de 512 tokens. La licencia es CC-BY-4.0 y el idioma declarado es únicamente inglés, aunque el dominio de entrenamiento es código fuente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje conservativo (PARFLM): potencial escalar V_θ con mecánica lagrangiana, sin atención, memoria constante en inferencia, espacio de Fock, potencial gaussiano anisotrópico, integrador BAOAB, geometría riemanniana con métrica de Jacobi |
| Parámetros totales | 83.690.702 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (evaluación realizada a bloques de 512 tokens; el nombre del modelo incluye la etiqueta `xi6long`, sin especificación numérica en la información disponible) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Inglés (declarado); dominio de entrenamiento: código Python |
| Licencia | CC-BY-4.0 |
| Formato de pesos | No disponible (librería PyTorch; tamaño del repositorio 0,3 GB) |

## Arquitectura y entrenamiento

La arquitectura se aparta del transformer: es un modelo de lenguaje conservativo en el que la dinámica de los estados se define a partir de un potencial escalar V_θ y un formalismo lagrangiano, integrado numéricamente con el esquema BAOAB. Incorpora un banco de potencial V_θ que lee canales de contexto enrutados por contenido (cinco en la línea base SO-CODE, seis en este modelo), un potencial gaussiano anisotrópico, espacio de Fock y una formulación riemanniana con métrica de Jacobi y geodésicas riemannianas. La inferencia es sin atención y con memoria constante, lo que en teoría desacopla el coste de memoria de la longitud de la secuencia.

El entrenamiento usó exactamente 315.392.000 tokens (19.250 pasos × 32 × 512) de CodeParrot Clean, con el calendario WSD del ladder durante 16.250 pasos y 3.000 pasos adicionales a la tasa de aprendizaje mínima. Todos los modelos de la comparativa parten del paso 0 con semilla 0 sobre los mismos lotes, de modo que las evaluaciones están emparejadas paso a paso. La intervención específica de este modelo es reducir la tasa de aprendizaje del banco V_θ a ×0,25 para evitar que los pozos de potencial de la capa 1 se alejen de los estados y queden sin gradiente (el fenómeno de los «pozos muertos»). El estudio está preinscrito en `Code_Dead_Wells_and_Screens.md` con cuatro predicciones (VT1 a VT4), todas confirmadas según el autor y puntuadas literalmente. No se documenta RLHF ni DPO.

## Capacidades

- Generación de texto y código: modelo de lenguaje autorregresivo orientado a código Python, evaluado mediante perplejidad en CodeParrot Clean.
- Modelado de lenguaje de dominio código: entrenado exclusivamente sobre código fuente Python, sin datos de lenguaje natural general más allá de lo presente en el corpus.
- Inferencia sin atención con memoria constante: el coste de memoria no crece con la longitud de la secuencia según la formulación arquitectónica.
- Estudio de mecanismos: sirve como artefacto reproducible para analizar el comportamiento de canales de contexto y la salud de los pozos de potencial del banco V_θ.
- Sin tool calling, sin function calling, sin capacidades de agente y sin modo de razonamiento extendido documentados.
- Sin capacidades de visión, audio ni multimodalidad.
- Multilingüismo: no disponible; el único idioma declarado es inglés y el corpus es código Python.

## Casos de uso

- Investigación sobre arquitecturas no transformer: el modelo sirve como punto de comparación controlado para estudiar si los modelos conservativos basados en potencial escalar pueden modelar código con perplejidad razonable frente a un GPT-2 emparejado en tokens.
- Reproducción de estudios de ablación preinscritos: permite replicar el análisis de pozos muertos en el banco V_θ y verificar las predicciones VT1 a VT4 registradas antes del entrenamiento.
- Análisis de dinámica de entrenamiento: al compartir lotes y semilla con la línea base y los controles, facilita comparaciones emparejadas paso a paso de curvas de pérdida y salud de los pozos de potencial.
- Docencia e ilustración de mecánica lagrangiana aplicada a aprendizaje automático: el modelo materializa conceptos de potencial escalar, integración BAOAB y geometría riemanniana en un sistema entrenado sobre datos reales.
- Evaluación de metodología de investigación: caso documentado de resultado negativo publicado con preinscripción, útil para estudiar prácticas de transparencia y sesgo de publicación.
- Inferencia con restricciones de memoria: la formulación sin atención y de memoria constante puede interesar en entornos donde el coste de memoria de la caché KV de un transformer es prohibitivo, aunque no hay datos publicados de latencia ni throughput.
- No se recomienda su uso en producción para generación de código: su perplejidad de 5,98 está muy por detrás del GPT-2 emparejado en tokens (4,96) y no se han publicado evaluaciones funcionales de código.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados de forma independiente):

| Modelo | Canales de contexto | Tasa de aprendizaje de V_θ | Pozos capa 1 | Perplejidad de validación | Diferencia vs. SO-CODE |
|---|---|---:|---|---:|---:|
| SO-CODE (línea base) | 5 | ×1 | vivos | 6,00 | — |
| XI6-CODE (no publicado en el Hub) | 6 | ×1 | muertos | 8,55 | +42,6% |
| Screen B (este modelo) | 6 | ×0,25 | vivos | 5,98 | −0,3% |
| SO-CODE-VTLR (control) | 5 | ×0,25 | vivos | 6,09 | +1,6% |
| Screen A (segunda corrección, entrada de norma unitaria) | 6 | ×1 | vivos | 5,95 | −0,7% |
| SO-CODE-VTUN (control de screen A) | 5 | ×1 | vivos | 6,34 | +5,8% |
| GPT-2 emparejado en tokens | — | — | — | 4,96 | — |

Detalle de la métrica de este modelo: perplejidad de validación en bloques de 512 tokens sobre los primeros 2 millones de tokens de los ficheros de validación de CodeParrot (división a nivel de fichero). Valor asentado de 5,98, media de las evaluaciones en los pasos 18.000, 18.500 y 19.000 (5,99, 5,91 y 6,04); mejor valor de 5,86 en el paso 16.000. La métrica está marcada como no verificada en el model-index.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Con 83,7 millones de parámetros, en FP32 los pesos ocupan aproximadamente 0,33 GB y en FP16 unos 0,17 GB, pero no se han publicado requisitos oficiales ni perfiles de cuantización.
- GPU recomendadas: no disponible. Por tamaño, cualquier GPU consumer moderna podría alojar los pesos, pero la formulación lagrangiana con integrador BAOAB y dinámica de potencial implica un coste computacional por token no caracterizado en la información disponible.
- Compatibilidad con GPU consumer: probable por tamaño de parámetros, sin datos publicados de latencia ni throughput que lo confirmen.
- Opciones de despliegue: no disponible. La librería declarada es PyTorch; no hay evidencia de soporte en vLLM, llama.cpp, Ollama ni TGI, y la arquitectura no transformer hace improbable el soporte directo en estos motores sin implementación específica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Perplejidad (CodeParrot valid, bloque 512) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Screen B (este modelo) | 83,7 M | No disponible | 5,98 | CC-BY-4.0 | Hugging Face |
| SO-CODE (línea base) | ~76,6 M (estimado a partir del +9,3%) | No disponible | 6,00 | No disponible en la información | Hugging Face |
| SO-CODE-VTLR (control) | No disponible | No disponible | 6,09 | No disponible en la información | Hugging Face |
| Screen A (corrección alternativa) | No disponible | No disponible | 5,95 | No disponible en la información | Hugging Face |
| GPT-2 emparejado en tokens | 124 M (arquitectura GPT-2 estándar) | 1.024 tokens | 4,96 | MIT (GPT-2) | Hugging Face |

La comparativa relevante es interna a la colección «dead wells» del autor, ya que no existen alternativas públicas con la misma arquitectura conservativa. Frente al transformer de referencia emparejado en tokens de entrenamiento, este modelo queda un 20,6% por detrás en perplejidad.

## Limitaciones y advertencias

- Resultado negativo por diseño: el sexto canal de contexto no aporta mejora medible; el modelo solo iguala a la línea base de cinco canales. No debe interpretarse como una mejora de capacidad.
- Rendimiento inferior a un transformer emparejado: perplejidad de 5,98 frente a 4,96 de un GPT-2 entrenado con los mismos tokens, una diferencia del 20,6%.
- Modelo de investigación, no de producción: no hay evaluaciones funcionales de código (pass@k, HumanEval ni similares), solo perplejidad.
- Riesgo de alucinación y de generación de código incorrecto: no caracterizado en la información disponible, pero esperable en un modelo de 83,7 M de parámetros entrenado con 315 M de tokens.
- Sesgos: no documentados. El corpus es CodeParrot Clean, con los sesgos de distribución de código de GitHub que ello implica.
- Limitación de idioma: solo inglés declarado y dominio exclusivo de Python; el rendimiento en otros lenguajes de programación o en lenguaje natural general no está evaluado.
- Longitud de contexto: no especificada; la evaluación se limita a bloques de 512 tokens y no hay datos sobre generalización a secuencias más largas pese a la etiqueta `xi6long`.
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero al ser un artefacto de investigación sin garantías de calidad, su uso comercial no está respaldado por evaluaciones.
- Métricas no verificadas: el valor de perplejidad está marcado como `verified: false` en el model-index y procede únicamente del autor.
- Ausencia de soporte en herramientas estándar: la arquitectura no transformer implica que no funcionará en motores de inferencia convencionales sin código específico.
- Fecha de creación futura en los metadatos (2026-10-30): conviene verificar la integridad de los metadatos del repositorio antes de citarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dimitarpg13/semsimula-ladder-live-code-d384-l2-none-norc-xi6long-sr2-wr3-vtlr0p25
- Línea base SO-CODE: https://huggingface.co/dimitarpg13/semsimula-ladder-live-code-d384-l2-none-norc-sr2
- Control SO-CODE-VTLR: https://huggingface.co/dimitarpg13/semsimula-ladder-live-code-d384-l2-none-norc-sr2-vtlr0p25
- Segunda corrección (screen A): https://huggingface.co/dimitarpg13/semsimula-ladder-live-code-d384-l2-none-norc-xi6long-sr2-wr3-vtun
- Control SO-CODE-VTUN: https://huggingface.co/dimitarpg13/semsimula-ladder-live-code-d384-l2-none-norc-sr2-vtun
- Colección «dead wells»: https://huggingface.co/collections/dimitarpg13/semantic-simulation-gen-3-dead-wells-in-the-v-bank-6ae5275768c02fe9f540c5a3
- Nota de análisis sobre pozos muertos: https://github.com/dimitarpg13/semsimula-paper/blob/main/companion_notes/Dead_Wells_in_the_Joint_V_theta_Bank.md
- Preinscripción del estudio: https://github.com/dimitarpg13/semsimula-paper/blob/main/companion_notes/depth_ladder/Code_Dead_Wells_and_Screens.md
- Repositorio del paper: https://github.com/dimitarpg13/semsimula-paper
- Dataset CodeParrot Clean: https://huggingface.co/datasets/codeparrot/codeparrot-clean
