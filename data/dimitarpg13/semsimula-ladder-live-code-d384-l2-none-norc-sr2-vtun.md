# dimitarpg13/semsimula-ladder-live-code-d384-l2-none-norc-sr2-vtun

## Resumen

SO-CODE-VTUN es un modelo de lenguaje de investigación desarrollado por dimitarpg13, publicado en Hugging Face bajo licencia CC-BY-4.0. Forma parte de la familia "semsimula" de modelos de lenguaje conservativos (*conservative language models*), una línea de trabajo que abandona la arquitectura transformer convencional en favor de un modelo de energía basado en potenciales escalares y mecánica lagrangiana. Este modelo concreto es un control experimental dentro de un estudio pre-registrado sobre "pozos muertos" (*dead wells*) en el banco de potenciales V_θ de la arquitectura SO-CODE.

El modelo tiene 76.572.109 parámetros (idénticos a su baseline SO-CODE) y está entrenado exclusivamente sobre código Python del dataset CodeParrot, con exactamente 315.392.000 tokens. Su propósito no es la producción sino la ablación de mecanismos: evalúa si normalizar a norma unitaria cada canal de contexto antes de que el banco de pozos de V_θ lo lea corrige el fallo observado en modelos de seis canales. El veredicto declarado por el autor es que el cambio cuesta un 5,8% de perplejidad a un modelo sano (6,34 frente a 6,00), por lo que se trata de un parche, no de una configuración por defecto.

Es relevante ahora porque documenta un resultado negativo reproducible y pre-registrado en una línea de investigación no-transformer, con inferencia de memoria constante y sin atención, lo que lo convierte en material de referencia para quienes exploran alternativas arquitectónicas a los transformers.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No-transformer, sin atención (*attention-free*), modelo de lenguaje conservativo basado en potencial escalar y mecánica lagrangiana; integrador BAOAB, potencial gaussiano anisotrópico, espacio de Fock |
| Parámetros totales | 76.572.109 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (entrenado con bloques de 512 tokens) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | PyTorch (librería `pytorch`); no se especifican safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura se describe como un modelo de lenguaje conservativo (*conservative language model*) sin atención y con memoria constante en inferencia. En lugar de la autoatención del transformer, el modelo emplea un potencial escalar V_θ con un banco de pozos ("wells") organizados en capas, integrados mediante el esquema BAOAB (un integrador simpléctico de dinámica molecular) sobre un potencial gaussiano anisotrópico. Los tags mencionan geometría riemanniana, geodésicas riemannianas y métrica de Jacobi, así como "espacio de Fock" y "parflm". El modelo dispone de cinco canales de contexto; esta variante concreta (VTUN) aplica normalización a norma unitaria a cada canal antes de que el banco de pozos de V_θ lo lea.

El entrenamiento se realizó sobre exactamente 315.392.000 tokens (19.250 pasos × 32 de batch × 512 de secuencia), usando el dataset CodeParrot clean (Python) con un split a nivel de fichero. Se empleó un schedule WSD (warmup-stable-decay) durante 16.250 pasos seguido de 3.000 pasos a la tasa de aprendizaje mínima. El modelo parte del paso 0 con semilla 0 sobre los mismos batches que los otros cinco modelos de la tabla comparativa, de modo que las evaluaciones están emparejadas paso a paso. La ejecución duró 6,1 horas en una sola sesión, con 0 activaciones del watchdog y un monitor de fugas SCAF limpio en las 4 auditorías. No se menciona RLHF ni DPO.

## Capacidades

- Generación de texto y código Python: el modelo está entrenado exclusivamente sobre código Python de CodeParrot.
- Modelado de lenguaje autorregresivo con perplejidad de validación declarada de 6,3418 en bloque de 512 tokens.
- Inferencia con memoria constante: al ser sin atención, el coste de memoria no crece con la longitud de contexto de la forma habitual en transformers.
- Capacidad de investigación en ablación de mecanismos: sirve como control experimental pre-registrado.
- No se declara soporte de tool calling ni function calling.
- No se declara soporte de agentes ni razonamiento multi-paso.
- No se declara capacidad multilingüe: solo inglés.
- No se declara modo thinking, visión ni audio.

## Casos de uso

- Investigación en arquitecturas no-transformer: el modelo sirve como punto de comparación controlado para estudiar si la normalización de canales de contexto corrige el fallo de pozos muertos, con perplejidad medida de forma emparejada frente a SO-CODE.
- Reproducción de resultados negativos: permite replicar el hallazgo de que la normalización unitaria cuesta un 5,8% a un modelo sano, útil para quienes evalúan técnicas de estabilización de bancos de potenciales.
- Estudio de dinámica de entrenamiento: sus métricas de salud (norma de gradiente mediana 0,39, máximo 1,09, mayor subida de pérdida 0,075) permiten analizar la estabilidad de integradores BAOAB en modelos de lenguaje.
- Análisis de eficiencia de memoria: al ser sin atención y de memoria constante, es adecuado para experimentos sobre inferencia con recursos acotados, aunque sin datos publicados de throughput.
- Docencia y divulgación sobre modelos basados en energía: ilustra una alternativa concreta a la autoatención con un potencial escalar explícito.
- Base para ablaciones de canales de contexto: comparar cinco frente a seis canales bajo distintas configuraciones del banco V_θ (tasa de aprendizaje reducida, normalización unitaria) en estudios pre-registrados.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados de forma independiente):

| Modelo | Canales de contexto | Cambio aplicado | Perplejidad asentada | Frente a SO-CODE |
|---|---|---:|---:|---:|
| SO-CODE (baseline) | 5 | — | 6,00 | — |
| XI6-CODE (no en el Hub) | 6 | — | 8,55 | +42,6% |
| Screen B (fix 1) | 6 | LR de V_θ × 0,25 | 5,98 | −0,3% |
| SO-CODE-VTLR (control del fix 1) | 5 | LR de V_θ × 0,25 | 6,09 | +1,6% |
| Screen A (fix 2) | 6 | Entrada a norma unitaria | 5,95 | −0,7% |
| **SO-CODE-VTUN (este modelo, control del fix 2)** | 5 | Entrada a norma unitaria | **6,34** | **+5,8%** |
| GPT-2 emparejado (mismos tokens) | — | — | 4,96 | — |

Detalle de este modelo: perplejidad asentada 6,34 (media de las evaluaciones en los pasos 18.000, 18.500 y 19.000: 6,23, 6,37 y 6,43); mejor valor 6,23 en el paso 18.000. Medida sobre los primeros 2 millones de tokens de validación de CodeParrot, con split a nivel de fichero. Las predicciones pre-registradas VU1 y VU2 fallaron (VU1: +5,8% frente al ±2% esperado; VU2: +0,056 nats frente al umbral de +0,015); VU3 falló en el coste de eliminación (0,25 y +83% frente a más de +100%); VU4 acertó (0,473 frente a más de 0,45 nats).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con 76,6 millones de parámetros, en FP32 ocuparía aproximadamente 0,3 GB de pesos, pero no se publican requisitos oficiales.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; por tamaño de parámetros cabría en cualquier GPU de consumo moderna, pero no se documenta.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI; la librería declarada es PyTorch.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Perplejidad (CodeParrot val) | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| SO-CODE-VTUN (este) | 76,6 M | bloque 512 | 6,34 | CC-BY-4.0 | Hugging Face |
| SO-CODE (baseline) | 76,6 M | bloque 512 | 6,00 | CC-BY-4.0 | Hugging Face |
| Screen A (6 canales, norma unitaria) | 76,6 M | bloque 512 | 5,95 | CC-BY-4.0 | Hugging Face |
| GPT-2 emparejado en tokens | no disponible | no disponible | 4,96 | no disponible | no disponible |

## Limitaciones y advertencias

- Resultado negativo por diseño: el modelo es un control experimental, no un modelo de producción; su perplejidad empeora un 5,8% frente a su baseline.
- Entrenado solo con código Python de CodeParrot; no se espera un buen rendimiento en lenguaje natural general ni en otros lenguajes de programación.
- Solo idioma inglés declarado.
- Riesgo de alucinación no evaluado ni documentado; al ser un modelo pequeño y de dominio restringido, es esperable que genere código sintácticamente plausible pero incorrecto.
- Sesgos conocidos: no documentados.
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero no se ofrecen garantías ni se documenta idoneidad para producción.
- No se publican requisitos de hardware, cuantizaciones ni formatos de pesos alternativos, lo que dificulta su despliegue.
- Longitud de contexto efectiva no documentada más allá de los bloques de 512 tokens de entrenamiento.
- El modelo pertenece a una línea de investigación con resultados pre-registrados; las métricas son declaradas por el autor y marcadas como no verificadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dimitarpg13/semsimula-ladder-live-code-d384-l2-none-norc-sr2-vtun
- Baseline SO-CODE: https://huggingface.co/dimitarpg13/semsimula-ladder-live-code-d384-l2-none-norc-sr2
- Screen A (fix 2, seis canales): https://huggingface.co/dimitarpg13/semsimula-ladder-live-code-d384-l2-none-norc-xi6long-sr2-wr3-vtun
- Screen B (fix 1): https://huggingface.co/dimitarpg13/semsimula-ladder-live-code-d384-l2-none-norc-xi6long-sr2-wr3-vtlr0p25
- Control del fix 1 (SO-CODE-VTLR): https://huggingface.co/dimitarpg13/semsimula-ladder-live-code-d384-l2-none-norc-sr2-vtlr0p25
- Colección "Dead wells in the V bank": https://huggingface.co/collections/dimitarpg13/semantic-simulation-gen-3-dead-wells-in-the-v-bank-6ae5275768c02fe9f540c5a3
- Nota de análisis sobre pozos muertos: https://github.com/dimitarpg13/semsimula-paper/blob/main/companion_notes/Dead_Wells_in_the_Joint_V_theta_Bank.md
- Pre-registro del estudio: https://github.com/dimitarpg13/semsimula-paper/blob/main/companion_notes/depth_ladder/Code_Dead_Wells_and_Screens.md
- Dataset CodeParrot clean train: https://huggingface.co/datasets/codeparrot/codeparrot-clean-train
- Dataset CodeParrot clean valid: https://huggingface.co/datasets/codeparrot/codeparrot-clean-valid
