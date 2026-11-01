# mhseo2/opd_sfto7amr1_s1000_olmo31_32b_think_ot3math-step30

## Resumen

`opd_sfto7amr1_s1000_olmo31_32b_think_ot3math-step30` es un checkpoint de investigación publicado por el usuario `mhseo2` en HuggingFace. Se trata de un modelo de 7.298.011.136 parámetros (aproximadamente 7,3 mil millones) obtenido mediante destilación on-policy (OPD) a partir de un modelo estudiante ya afinado con SFT de matemáticas (`mhseo2/sft_olmo3base7b_amr1_0528_math_n204800-step1000`, derivado de AM-DeepSeek-R1-0528) y utilizando como profesor a `allenai/Olmo-3.1-32B-Think`. El checkpoint corresponde al paso 30 del proceso de destilación.

El problema que aborda es el de transferir capacidades de razonamiento matemático de un modelo profesor grande (32B) a un estudiante pequeño (7B) sin necesidad de señales de recompensa externas, usando únicamente la divergencia KL reversa por token sobre las propias generaciones del estudiante. Es relevante en el contexto de la investigación sobre destilación on-policy y modelos de razonamiento eficientes, ya que demuestra un pipeline completo reproducible sobre infraestructura europea (BSC MareNostrum 5).

El modelo está especializado en matemáticas y razonamiento de cadena de pensamiento ("think"), con un contexto de generación configurado hasta 32.768 tokens en la evaluación. No es un modelo de propósito general: su utilidad principal es la experimentación académica con técnicas de destilación y la evaluación de modelos pequeños en benchmarks de competición matemática.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (familia OLMo 3, según tags e identificación del modelo base); detalles internos no disponibles |
| Parámetros totales | 7.298.011.136 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la model card; la evaluación usa prompt de 768 tokens y respuesta de hasta 32.768 tokens |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; no se listan versiones GGUF ni cuantizadas) |
| Idiomas soportados | no disponible (la model card no declara idiomas; los prompts de entrenamiento son preguntas de matemáticas de OpenThoughts3) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (3 shards: model-00001-of-00003, model-00002-of-00003, model-00003-of-00003) |

## Arquitectura y entrenamiento

El modelo parte de la familia OLMo 3 (según los tags `olmo3` y `olmo` y el modelo base declarado), con 7.298.011.136 parámetros. La model card no detalla la arquitectura interna (número de capas, dimensiones, tipo de atención), por lo que esos datos no están disponibles. El checkpoint se obtiene por destilación on-policy: el estudiante genera rollouts con sus propias políticas y se minimiza la divergencia KL reversa por token respecto a las distribuciones del profesor `allenai/Olmo-3.1-32B-Think` (revisión `97ade57a9cc5`), con la KL calculada sobre el top-32 del profesor (estimador k1). No se usa recompensa de tarea.

Los datos de entrenamiento son 53.105 preguntas de matemáticas de OpenThoughts3 sin respuestas. En cada paso se muestrean 60 prompts con 4 rollouts cada uno, temperatura 1 y respuestas de hasta 32.768 tokens. El entrenamiento usa learning rate constante de 5e-6, AdamW con weight decay 0.01, y se ejecutó en BSC MareNostrum 5 con 2 nodos de 4 H100 (estudiante en FSDP + vLLM, profesor en vLLM con tensor parallelism 2). El checkpoint publicado corresponde al paso 30. El código asociado es el árbol `mopdRL` en el commit `f1bcc9eb82a8bcc7a053a23dd1afcae82fb591e4` (paquete `bsc-olmo-base-opd-2026-10-26`).

## Capacidades

- Generación de texto y razonamiento matemático con cadena de pensamiento ("think"), heredado del profesor Olmo-3.1-32B-Think y del SFT previo sobre datos AM-DeepSeek-R1-0528.
- Resolución de problemas de competición matemática (AIME, HMMT) con respuestas largas de hasta 32.768 tokens.
- Razonamiento multi-paso guiado por el formato de plantilla de chat del estudiante (`chat_template.jinja` incluido en el repo).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles; la model card no declara idiomas y el entrenamiento se centró en matemáticas.
- Capacidades especiales: modo "think" (razonamiento explícito antes de la respuesta); no se declaran visión ni audio.

## Casos de uso

- Evaluación de técnicas de destilación on-policy: el checkpoint sirve como referencia reproducible del paso 30 de un pipeline OPD con profesor de 32B y estudiante de 7B, útil para investigadores que quieran comparar curvas de aprendizaje o variantes de la pérdida KL.
- Generación de soluciones matemáticas paso a paso: el modelo produce cadenas de razonamiento largas (hasta 32.768 tokens) adecuadas para problemas de competición tipo AIME o HMMT, donde el formato "think" ayuda a verificar el procedimiento.
- Generación de datos sintéticos de razonamiento matemático: al estar entrenado sobre OpenThoughts3, puede usarse para producir trazas de solución que alimenten otros pipelines de SFT, con la cautela de verificar con un scorer como `math_verify`.
- Investigación sobre modelos pequeños de razonamiento: su tamaño de 7,3B permite experimentar con ajustes finos y comparaciones frente al profesor de 32B en entornos con recursos limitados.
- Reproducción de experimentos en infraestructura académica: el pipeline documentado (FSDP + vLLM, MareNostrum 5) facilita replicar el entrenamiento en clústeres con H100.
- Estudio de la brecha profesor-estudiante: permite analizar cuánto del rendimiento del profesor de 32B se retiene en un estudiante de 7B tras solo 30 pasos de OPD, usando los benchmarks publicados como línea base.

## Benchmarks y rendimiento

Resultados publicados en la model card (mean@8 accuracy en %, temperatura 0,6, top_p 0,95, prompt 768 / respuesta 32.768 tokens, scorer `math_verify`, plantilla de chat del estudiante, ejecutado en NVIDIA B200 en float16):

| Benchmark | mean@8 accuracy (%) |
|---|---|
| AIME 2025 | 40,00 |
| AIME 2026 | 36,25 |
| HMMT Feb 2025 | 25,42 |

No se han publicado en la información disponible resultados comparativos frente al profesor (`allenai/Olmo-3.1-32B-Think`) ni frente al modelo base SFT, ni métricas de MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia en float16: aproximadamente 14,6 GB solo para pesos (coincide con el tamaño del repo), más overhead de KV cache para contextos de hasta 32.768 tokens, que puede añadir varios GB adicionales según el batch y la implementación.
- En cuantización de 8 bits: alrededor de 7-8 GB de pesos; en 4 bits: alrededor de 4 GB, aunque no se publican versiones GGUF oficiales.
- GPU recomendadas: H100 o B200 para evaluación a máxima longitud de contexto (la model card reporta pruebas en B200); A100 80 GB o RTX 4090 24 GB son viables para inferencia en float16 con contextos moderados.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) o superiores en float16 con gestión cuidadosa del contexto; en GPUs de 16 GB requeriría cuantización.
- Opciones de despliegue: el autor usó vLLM (incluido tensor parallelism 2 para el profesor); al ser pesos safetensors estándar de la familia OLMo, es compatible con vLLM, TGI y transformers, y potencialmente convertible a llama.cpp/Ollama, aunque no se publican conversiones oficiales.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Benchmarks matemáticos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| opd_sfto7amr1_s1000_olmo31_32b_think_ot3math-step30 | 7,3B | no disponible (evaluado con respuesta de 32.768 tokens) | AIME 2025: 40,00; AIME 2026: 36,25; HMMT Feb 2025: 25,42 (mean@8) | apache-2.0 | HuggingFace (28 descargas) |
| allenai/Olmo-3.1-32B-Think (profesor) | 32B (aproximado) | no disponible | no disponible en la información proporcionada | no disponible en la información proporcionada | HuggingFace |
| mhseo2/sft_olmo3base7b_amr1_0528_math_n204800-step1000 (base SFT) | 7,3B (aproximado) | no disponible | no disponible en la información proporcionada | no disponible en la información proporcionada | HuggingFace |

No se dispone de datos de benchmarks del profesor ni del modelo base SFT en la información proporcionada, por lo que no es posible cuantificar la ganancia atribuible a la destilación OPD.

## Limitaciones y advertencias

- Modelo de investigación: es un checkpoint intermedio (paso 30) de un proceso de destilación, no un modelo final pulido para producción.
- Especialización estrecha en matemáticas: el entrenamiento se limita a preguntas de OpenThoughts3 y a la señal del profesor; el rendimiento en tareas generales, código o conversación no está documentado.
- Riesgo de alucinación: como todo modelo generativo, puede producir razonamientos plausibles pero incorrectos; la model card usa `math_verify` para puntuar, lo que indica la necesidad de verificación automática.
- Idiomas no declarados: no hay garantía de calidad fuera del inglés, dado que la model card no especifica idiomas soportados.
- Contexto no documentado: la longitud máxima de contexto del modelo no se indica; la evaluación usa 32.768 tokens de respuesta, pero no se confirma que sea el límite arquitectónico.
- Licencia apache-2.0: permite uso comercial, pero al derivar de OLMo 3 y de un modelo SFT intermedio conviene revisar las condiciones de los modelos base encadenados.
- Sin datos de sesgos: no se publica ninguna evaluación de sesgos, toxicidad o robustez.
- Baja tracción: 28 descargas y 0 likes en el momento de la consulta, lo que sugiere escasa validación comunitaria.
- Sin versiones cuantizadas oficiales: el despliegue en hardware limitado requiere conversión manual.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mhseo2/opd_sfto7amr1_s1000_olmo31_32b_think_ot3math-step30
- Modelo base SFT: https://huggingface.co/mhseo2/sft_olmo3base7b_amr1_0528_math_n204800-step1000
- Profesor: https://huggingface.co/allenai/Olmo-3.1-32B-Think
- Dataset de prompts: OpenThoughts3 (no se proporciona enlace directo en la información disponible)
- Código: árbol `mopdRL`, commit `f1bcc9eb82a8bcc7a053a23dd1afcae82fb591e4`, paquete `bsc-olmo-base-opd-2026-10-26` (no se proporciona URL en la información disponible)
