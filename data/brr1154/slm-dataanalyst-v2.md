# BRR1154/SLM-DataAnalyst-v2

## Resumen

SLM-DataAnalyst-v2 es un ajuste fino de Qwen2.5-0.5B-Instruct (494.032.768 parámetros) especializado en dos tareas concretas de análisis de datos: ejecución verificable de consultas SQLite y análisis exploratorio de datos (EDA) con SciPy. Lo desarrolla Bhavanam Rajendra Reddy (Runtime-Slayers) como segunda iteración de su familia SLM-DataAnalyst, partiendo del checkpoint v1 del mismo autor. El modelo se distribuye bajo licencia Apache 2.0 y solo declara soporte de inglés.

La propuesta técnica del autor no es tanto mejorar la precisión de dominio como preservar la capacidad general del modelo base tras el ajuste. Para ello aplica una consolidación en subespacio nulo mediante SVD sobre las proyecciones mutadas (fórmula ΔW_proj = ΔW − (ΔW·V_base)·V_base^T), junto con una calibración de abstención basada en error de activación. El resultado declarado es un incremento de 20 puntos en retención ARC-Easy-25 (de 64% a 84%) manteniendo exactamente la misma precisión de dominio (72,73%).

Es relevante ahora por su tamaño: 494M parámetros en BF16 ocupan aproximadamente 1 GB, lo que permite desplegarlo en hardware muy modesto, incluso en CPU, para tareas de generación de SQL y scripting de EDA. No obstante, conviene tratar sus cifras como declaradas por el autor y no verificadas de forma independiente (el campo `verified` de la model-index es `false` en todas las métricas).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), ajuste fino con LoRA de rango 16 sobre capas 8-23 |
| Parámetros totales | 494.032.768 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo base Qwen2.5-0.5B-Instruct; el autor no declara contexto propio) |
| Tipos de cuantización | no disponible (pesos publicados en safetensors, presumiblemente BF16; el autor no detalla cuantizaciones) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Qwen2 de Qwen2.5-0.5B-Instruct y se ajusta mediante LoRA real en PyTorch (`LoRALinear` con backpropagation), no mediante técnicas de bajo rango aproximadas. El ajuste se aplica sobre una banda concreta de capas (8-23) y sobre cuatro proyecciones por capa: `q_proj`, `v_proj`, `o_proj` y `down_proj`, lo que suma 64 módulos mutados. El esquema de optimización declarado es de 42 pasos de gradiente con rango LoRA 16 y subespacio SVD empírico de dimensión k=24.

La innovación técnica que el autor destaca es la consolidación en subespacio nulo: tras el ajuste, las matrices ΔW se proyectan fuera del subespacio de activaciones del modelo base para minimizar la interferencia con capacidades previas. El autor reporta un error de ortogonalidad máximo de 1,972e-09 y un desplazamiento de Frobenius máximo del 1,168%, con verificación sha256 de los 64 módulos antes y después del merge. Además, se aplica una calibración de abstención (`ABSTAIN`) basada en error de activación. No se detalla la composición del dataset de entrenamiento ni el número de tokens utilizados; los conjuntos de evaluación mencionados son SQLite-Exec-16, SciPy-EDA-6, ARC-Easy-25 y AA-Omniscience-12.

## Capacidades

- Generación de texto conversacional en inglés, con estilo determinista recomendado por el autor (`do_sample=False`).
- Generación y ejecución de consultas SQLite orientadas a tareas de análisis de datos.
- Análisis exploratorio de datos (EDA) mediante código Python con SciPy.
- Razonamiento programático (PAL, Program-Aided Language) para problemas matemáticos, según los benchmarks declarados.
- Calibración de abstención: el modelo incorpora un mecanismo de `ABSTAIN` para no responder cuando la confianza es baja.
- Capacidad general retenida: el autor reporta 84% en ARC-Easy-25 tras el ajuste, lo que indica preservación parcial de conocimiento general.
- No se declara soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo thinking.

## Casos de uso

- Generación de consultas SQLite en pipelines de datos: el modelo produce SQL determinista para esquemas conocidos, adecuado para integrarse en un paso previo a la ejecución real con `sqlite3`, donde un verificador descarta consultas inválidas.
- Scripting de EDA reproducible: dado un dataframe descrito en el prompt, el modelo puede redactar código SciPy/pandas para estadísticas descriptivas, correlaciones y detección de valores atípicos, aprovechando su ajuste específico en SciPy-EDA.
- Asistente de análisis en local o en el borde: con ~1 GB de pesos en BF16, cabe en una Raspberry Pi 5 con 8 GB o en un portátil sin GPU, lo que permite análisis de datos offline sin enviar información a la nube.
- Prototipado rápido de cuadernos de análisis: útil para generar borradores de código que un analista revisa y ejecuta, reduciendo el tiempo de escritura de boilerplate estadístico.
- Enseñanza de SQL y análisis de datos: al ser un modelo pequeño y determinista, sirve como generador de ejemplos y ejercicios en entornos educativos con recursos limitados.
- Filtro o preprocesador en pipelines RAG de datos: puede clasificar y transformar preguntas de negocio en consultas SQL candidatas antes de pasarlas a un modelo mayor o a un verificador de ejecución.
- Evaluación de técnicas de ajuste fino: por su documentación detallada de la cirugía de pesos (subespacio nulo, métricas de ortogonalidad), es un caso de estudio útil para investigadores que trabajan en consolidación de LoRA y olvido catastrófico.

## Benchmarks y rendimiento

Datos declarados por el autor en la model-index y en la model card. Ninguna métrica está verificada de forma independiente (`verified: false`).

| Benchmark | v1 (baseline) | v2 | Delta |
|---|---|---|---|
| SQLite-Exec-16 + SciPy-EDA-6 (exactitud de dominio) | 72,73% | 72,73% | +0,00 pts |
| ARC-Easy-25 (raw / PMI-calibrado) | 64,0% / 72,0% | 84,0% / 84,0% | +20,0 / +12,0 pts |
| AA-Omniscience-12 (índice de calibración) | −25,00 | 0,00 | +25,00 pts |

| Benchmark frontier (noviembre 2026) | Ámbito | Argmax raw | PMI sin sesgo de elección |
|---|---|---|---|
| GPQA-Diamond | 50 preguntas estratificadas de ciencia PhD | 32,0% (16/50) | 30,0% (15/50) |
| Humanity's Last Exam (HLE) | 51 ítems de opción múltiple | 9,8% (5/51) | 11,76% (6/51) |
| MATH-500 (niveles 1-3) | PAL con Python | 3/8 (37,5%) | — |
| AIME 2025 | PAL con Python | 0/5 (0,0%) | — |

## Requisitos de hardware

- VRAM estimada para inferencia: ~1 GB en BF16 (494M parámetros × 2 bytes); ~0,5 GB en FP16; ~0,25-0,3 GB en cuantización de 4 bits (estimación, el autor no publica GGUF).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; RTX 3060, RTX 4060, RTX 4090, A100 y H100 funcionan sin problema, aunque están sobredimensionadas para este modelo.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna con 2 GB o más; también en iGPU y en CPU.
- Opciones de despliegue: `transformers` con `device_map="auto"` (método documentado por el autor); compatible con text-generation-inference y endpoints según los tags del repositorio; no se han publicado pesos GGUF, por lo que llama.cpp y Ollama requerirían conversión previa.
- Latencia y throughput: no disponibles. Por el tamaño, en CPU se espera un throughput del orden de decenas de tokens por segundo, pero el autor no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SLM-DataAnalyst-v2 | 494M | no disponible | SQLite + SciPy EDA | Apache 2.0 | Hugging Face |
| Qwen2.5-0.5B-Instruct | 494M | 32.768 tokens (según documentación de Qwen) | Generalista, instrucciones | Apache 2.0 | Hugging Face |
| Qwen2.5-Coder-0.5B-Instruct | 494M | 32.768 tokens (según documentación de Qwen) | Código | Apache 2.0 | Hugging Face |

La comparación de rendimiento con alternativas no está disponible: el autor no publica resultados de modelos de referencia en los mismos conjuntos de evaluación, y las métricas de dominio (SQLite-Exec-16, SciPy-EDA-6) son conjuntos propios sin equivalencia pública. Frente a Qwen2.5-0.5B-Instruct, la diferencia declarada es la retención ARC-Easy-25 del 84% y la calibración de abstención; frente a Qwen2.5-Coder-0.5B-Instruct, la ventaja declarada es la especialización en ejecución SQLite verificable, aunque el modelo Coder probablemente supere a este en generación de código general.

## Limitaciones y advertencias

- Todas las métricas son declaradas por el autor y no verificadas de forma independiente (`verified: false`); los conjuntos de evaluación son propios y de tamaño reducido (16, 6, 25 y 12 ítems), lo que produce intervalos de confianza amplios.
- El modelo solo declara soporte de inglés; no se ha evaluado su comportamiento en castellano ni en otros idiomas.
- Riesgo de alucinación en SQL y código: aunque el autor recomienda verificación por ejecución real (`sqlite3`, `z3`, verificadores), el modelo puede generar consultas sintácticamente válidas pero semánticamente incorrectas.
- Rendimiento muy bajo en razonamiento matemático de nivel alto: 0/5 en AIME 2025 y 3/8 en MATH-500 niveles 1-3, según los datos del autor. No es adecuado para matemáticas complejas.
- 9,8% en HLE y 32% en GPQA-Diamond indican conocimiento científico limitado, coherente con su tamaño.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen2.5-0.5B-Instruct también es Apache 2.0, por lo que no hay restricciones adicionales conocidas; aun así, conviene revisar los términos del modelo base.
- No se publican pesos cuantizados (GGUF, AWQ, GPTQ), lo que limita el despliegue en entornos sin PyTorch.
- El repositorio tiene 36 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción ni validación comunitaria.
- La fecha de creación (2026-11-12) y los benchmarks "frontier de noviembre 2026" deben tomarse con cautela; no hay verificación externa de esos resultados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BRR1154/SLM-DataAnalyst-v2
- Checkpoint base v1: https://huggingface.co/BRR1154/SLM-DataAnalyst-v1
- Modelo base original: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- ORCID del autor: https://orcid.org/0009-0005-3349-1162
- Paper, blog o repositorio adicional: no disponible en la información proporcionada.
