# PILUSATRIO/satri-24.0

## Resumen

SATRI-24.0 es un ajuste fino (fine-tune) del modelo Mistral-Small-3.2-24B-Instruct-2506 desarrollado por el usuario PILUSATRIO bajo la denominación "Satri". Se presenta como la tercera generación de la familia SATRI (tras SATRI-1B y SATRI-4.0, ambos basados en Qwen3) y se posiciona como el modelo "flagship" de 24.000 millones de parámetros. El modelo se distribuye con licencia Apache 2.0 y declara soporte para indonesio (id) e inglés (en).

El autor describe un entrenamiento basado en cuatro pilares: Constitutional AI de 12 artículos con RLAIF y DPO, un corpus de razonamiento de primeros principios extraído de textos clásicos de dominio público (Euclides, Al-Juarismi, Aristóteles, Newton), un proceso de auto-reparación multi-turno guiado por ejecución con enmascaramiento selectivo de tokens, y un ajuste con rsLoRA de rango 32 y alpha 64. La arquitectura subyacente es la de Mistral-Small-3.2-24B, de 40 capas, aunque el autor afirma haberla adaptado para reducir el consumo de VRAM hasta los 16 GB.

El modelo es relevante en la medida en que propone una receta de alineamiento orientada a la honestidad científica y la resistencia a la adulación (anti-sycophancy), con métricas declaradas muy altas en conjuntos de evaluación propios. No obstante, el repositorio tiene 0 descargas y 0 "likes", el tamaño del repo es de solo 0,8 GB (incompatible con un modelo de 24B en safetensors), y no se aportan resultados de benchmarks estándar independientes, por lo que debe tratarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Mistral-Small-3.2-24B, 40 capas) |
| Parametros totales | 24.000 millones (según model card) |
| Parametros activos | no disponible (no se declara MoE) |
| Longitud de contexto | 32K (según la métrica PoSE NIAH 32K; no se especifica el máximo oficial) |
| Tipos de cuantizacion | no disponible (no se listan cuantizaciones publicadas) |
| Idiomas soportados | indonesio (id), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (según tags) |

## Arquitectura y entrenamiento

La arquitectura es la de Mistral-Small-3.2-24B-Instruct-2506, un transformer decoder-only de 40 capas y aproximadamente 24.000 millones de parámetros. El autor menciona una "arquitectura de 40 capas eficiente en memoria para VRAM de 16 GB", pero no detalla modificaciones estructurales concretas. El ajuste se realizó con rsLoRA de rango 32 y alpha 64, una variante de LoRA que escala el rango efectivo de la adaptación.

El entrenamiento combina varias fases: Constitutional AI de 12 artículos con RLAIF y DPO para fomentar la honestidad y evitar la adulación; un corpus de "razonamiento de primeros principios" construido a partir de textos clásicos de dominio público previos a la era de la IA (Euclides, Al-Juarismi, Aristóteles, Newton); y un proceso de "auto-reparación multi-turno guiado por ejecución" con selección de máscaras de tokens. No se especifica el número total de tokens de entrenamiento, la composición exacta del dataset ni la metodología de evaluación de forma reproducible.

## Capacidades

- Generación de texto conversacional en indonesio e inglés.
- Razonamiento de primeros principios y deducción lógica (según el autor, 95,0 % en su conjunto de 40 preguntas).
- Resistencia a la adulación (anti-sycophancy): 97,5 % en un conjunto propio de 40 preguntas, con 0 % de sycophancy declarado.
- Robustez frente a jailbreaks: tasa de éxito de ataque (ASR) del 0,4 % sobre 200 payloads según el autor.
- Recuperación en contexto largo: 95,0 % de precisión en PoSE NIAH a 32K.
- Auto-reparación multi-turno (self-repair) guiada por ejecución.
- Soporte de tool calling / function calling: no disponible (no se declara).
- Soporte de agentes y razonamiento multi-paso: no disponible (no se declara explícitamente).
- Capacidades de visión: no disponible (aunque el modelo base Mistral-Small-3.2 es multimodal, la model card no lo confirma para este fine-tune).

## Casos de uso

- Asistencia conversacional en indonesio e inglés: el modelo declara soporte nativo para ambos idiomas, por lo que puede emplearse en atención al cliente o asistentes virtuales bilingües en esos mercados.
- Razonamiento matemático y lógico paso a paso: el corpus de primeros principios y el modo de auto-reparación lo orientan a tareas de deducción, resolución de problemas y explicación de razonamientos.
- Moderación y filtrado de contenido sensible: su baja tasa de jailbreak declarada (0,4 %) lo hace candidato para entornos donde se requiere resistencia a prompts maliciosos.
- Evaluación crítica de afirmaciones: el énfasis en anti-sycophancy permite usarlo para revisar argumentos o detectar respuestas aduladoras en pipelines de QA.
- Análisis de documentos largos: con contexto de 32K y buen rendimiento en NIAH, puede resumir o extraer información de contratos, informes o artículos extensos.
- Prototipado de investigación en alineamiento: al publicarse con licencia Apache 2.0 y receta de Constitutional AI, sirve como base para experimentos académicos sobre honestidad y DPO.
- Generación de documentación técnica bilingüe: útil para equipos que trabajan en indonesio e inglés y necesitan traducción o redacción asistida.

## Benchmarks y rendimiento

| Benchmark | Resultado declarado | Conjunto |
|---|---|---|
| DEV (L1–L5) | 100,0 % | 15 preguntas |
| TEST (L1–L5) | 100,0 % | 16 preguntas |
| Anti-sycophancy | 97,5 % (0 % sycophancy) | 40 preguntas |
| First-principles deduction | 95,0 % | 40 preguntas |
| PoSE NIAH 32K | 95,0 % | no disponible |
| ASR jailbreak | 0,4 % | 200 payloads |

No se han publicado resultados de benchmarks estándar independientes (MMLU, HumanEval, GSM8K) en la información disponible. Las cifras anteriores proceden exclusivamente de conjuntos de evaluación internos del autor y no son verificables de forma externa.

## Requisitos de hardware

- VRAM estimada para inferencia: el autor afirma que la arquitectura de 40 capas está optimizada para "VRAM de 16 GB", aunque no detalla la cuantización empleada para lograrlo. Un modelo de 24B en FP16 requiere aproximadamente 48 GB de VRAM; en cuantización de 4 bits, en torno a 13-15 GB.
- GPU recomendadas: no disponible de forma explícita. Por tamaño, cabría esperar A100 80 GB, H100 80 GB o RTX 4090 24 GB en cuantizaciones agresivas.
- ¿Cabe en GPU de consumo? Según el autor, sí en configuraciones de 16 GB, aunque no se especifica con qué cuantización ni se aportan mediciones.
- Opciones de despliegue: no disponible (no se mencionan vLLM, llama.cpp, Ollama ni TGI en la model card).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| SATRI-24.0 | 24B | 32K (declarado) | Apache 2.0 | id, en | Fine-tune de Mistral-Small-3.2-24B; benchmarks solo internos |
| Mistral-Small-3.2-24B-Instruct-2506 | 24B | 128K (modelo base) | Apache 2.0 | multilingüe | Modelo base original; benchmarks públicos disponibles |
| SATRI-4.0 (Gen 2) | 4B | no disponible | no disponible | no disponible | Basado en Qwen3-4B, misma familia |
| SATRI-1B (Gen 1) | 1,7B | no disponible | no disponible | no disponible | Basado en Qwen3-1.7B, misma familia |

La comparación con el modelo base es la más relevante: SATRI-24.0 hereda la arquitectura y licencia de Mistral-Small-3.2-24B, pero no se aportan comparaciones directas de rendimiento frente a él. Los modelos de la propia familia SATRI (1B y 4.0) carecen de datos públicos de benchmarks en la información disponible.

## Limitaciones y advertencias

- Los benchmarks declarados proceden de conjuntos internos muy pequeños (15, 16 y 40 preguntas) y no son verificables de forma independiente; un 100 % en 15-16 preguntas no es estadísticamente significativo.
- El repositorio tiene 0 descargas y 0 "likes", y un tamaño de 0,8 GB, incompatible con un modelo de 24B en safetensors; es posible que los pesos no estén completos o que el repositorio contenga solo adaptadores LoRA.
- Solo se declaran dos idiomas (indonesio e inglés); el rendimiento en castellano no está documentado.
- No se especifican sesgos conocidos, pero al derivar de Mistral-Small-3.2-24B hereda los sesgos de su corpus de entrenamiento original.
- Riesgo de alucinación: no cuantificado por el autor; las métricas de honestidad no equivalen a veracidad factual.
- Licencia Apache 2.0 permite uso comercial, pero al ser un fine-tune de un modelo base Apache 2.0 conviene verificar las condiciones de Mistral AI.
- No se documentan cuantizaciones publicadas ni instrucciones de despliegue, lo que dificulta la reproducibilidad en producción.
- La fecha de creación (2026) y la ausencia de validación externa sugieren precaución antes de adoptarlo en entornos críticos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PILUSATRIO/satri-24.0
- Modelo base: https://huggingface.co/mistralai/Mistral-Small-3.2-24B-Instruct-2506
- SATRI-1B (Gen 1): https://huggingface.co/PILUSATRIO/satri-1b
- SATRI-4.0 (Gen 2): https://huggingface.co/PILUSATRIO/satri-4.0
