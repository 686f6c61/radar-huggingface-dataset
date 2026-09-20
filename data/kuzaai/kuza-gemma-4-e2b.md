# kuzaai/kuza-gemma-4-e2b

## Resumen

Kuza Gemma 4 E2B es un asistente conversacional especializado en agricultura de África Oriental, publicado por el usuario kuzaai. Se trata de un ajuste fino mediante LoRA (rango 32, alpha 64) sobre `unsloth/gemma-4-E2B-it-qat-q4_0-unquantized`, un derivado de la familia Gemma 4 de Google entrenado con cuantización consciente del entrenamiento (QAT) en int4. Los pesos safetensors suman 4.628.569.635 parámetros y el modelo se distribuye tanto como adaptador PEFT como en GGUF cuantizado y en pesos fusionados en bf16.

El objetivo del proyecto es cubrir consultas agrícolas en inglés y suajili, dos idiomas relevantes para África Oriental. El repositorio se publica como archivo completo de la ejecución de entrenamiento: adaptador, checkpoints, corpus de calibración, imatrix, diagnósticos de divergencia KL y tres candidatos GGUF. El derivado es exclusivamente de texto: se conservan las PLE (Per-Layer Embeddings) del modelo base, pero se descartan las capacidades de visión y audio, y el modo de razonamiento (thinking) queda desactivado.

Con solo 24 descargas y 0 likes en el momento de redactar esta ficha, se trata de un modelo muy reciente y con escasa validación por parte de la comunidad, algo que conviene ponderar antes de llevarlo a producción. La licencia es la Gemma de Google y no se han publicado resultados de benchmarks en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Gemma 4; modelo base `unsloth/gemma-4-E2B-it-qat-q4_0-unquantized`. No se detallan más especificidades en la información disponible |
| Parámetros totales | 4.628.569.635 (dato de los pesos safetensors) |
| Parámetros activos | No aplica / no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible (la longitud de secuencia usada en el ajuste fue de 1024 tokens) |
| Tipos de cuantización | LoRA con QAT int4; GGUF `q4_k_m` (dos variantes: `q4_k_m_ud_style` y `ud_q4_k_xl`) y GGUF `q4_0` alineado con QAT; pesos fusionados en BF16 |
| Idiomas soportados | Inglés (en) y suajili (sw) |
| Licencia | Gemma (términos de Google: https://ai.google.dev/gemma/terms) |
| Formato de pesos | safetensors (adaptador PEFT y `merged_bf16/`) y GGUF (`reference/` y `quants/`) |

## Arquitectura y entrenamiento

El modelo parte de un Gemma 4 E2B ajustado con QAT en int4 y se especializa mediante un adaptador LoRA del tipo RsLoRA con rango 32 y alpha 64, aplicado sobre una representación cuantizada int4. El entrenamiento usó una longitud de secuencia de 1024 tokens, 2 épocas y una tasa de aprendizaje de 2e-05. La mezcla de datos combina un 100% de inglés procedente de `kuzaai/kuza_sft_english`, un 35% de suajili de `kuzaai/kuza_sft_swahili`, un 8% de `HuggingFaceH4/no_robots`, un 5% de datos adversarios de `kuzaai/kuza_sft_adversarial` y la totalidad de los datos multiturno de `kuzaai/kuza_sft_multiturn`.

Como innovación destacable del proceso, el repositorio incluye un pipeline de selección de cuantizaciones con corpus de calibración, imatrix, diagnóstico de divergencia KL en GPU y un `results.json` que ordena los candidatos GGUF por precisión en un conjunto oculto, después por tamaño y finalmente por TPS en GPU. En el plano arquitectónico, el derivado conserva las PLE del modelo base, pero elimina visión y audio, y el modo de razonamiento queda desactivado. No se documentan detalles adicionales sobre el preentrenamiento, el número total de tokens vistos por el modelo base ni si hubo fases de RLHF o DPO.

## Capacidades

- Generación de texto conversacional en inglés y suajili, con especialización temática en agricultura de África Oriental.
- Conversaciones multiturno: el ajuste incorpora explícitamente datos de `kuza_sft_multiturn`, aunque la longitud de secuencia de entrenamiento es de 1024 tokens.
- Respuestas sobre prácticas agrícolas, presumiblemente orientadas al contexto de África Oriental, a partir de los corpus de ajuste supervisado del autor.
- Robustez frente a entradas adversarias: se incluyó un 5% de datos de `kuza_sft_adversarial` en la mezcla de entrenamiento.
- Formato de adaptador PEFT, lo que permite seguir ajustando o fusionar el adaptador sobre el modelo base.
- Capacidades de tool calling / function calling: no disponibles en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo de razonamiento explícito (thinking): desactivado.
- Visión y audio: descartados en este derivado (solo texto).
- Ventana de contexto amplia: no disponible.

## Casos de uso

- Asistencia agrícola por chat en inglés y suajili: el modelo puede gestionar consultas de agricultores sobre cultivos, insumos o calendarios, respondiendo en el idioma del usuario gracias al ajuste mixto en/suajili.
- Canal de soporte vía mensajería (WhatsApp, SMS con intermediación): al ser un modelo pequeño y con cuantizaciones GGUF de tipo q4, es viable desplegarlo en servidores modestos y atender volúmenes altos de consultas cortas.
- Triaje textual de problemas de cultivo: dado que no tiene visión, se limita a recoger la descripción del agricultor y orientar hacia causas probables o hacia un técnico humano, sin diagnóstico por imagen.
- Formación y apoyo a agentes de extensión rural: puede usarse como asistente interno que redacte borradores de recomendaciones o material divulgativo en inglés y suajili para revisión humana.
- Despliegue offline en portátiles o equipos sin conectividad: los GGUF `q4_k_m` y `q4_0` permiten ejecución local con llama.cpp u Ollama en hardware de consumo.
- Punto de partida para ajustes posteriores: al publicarse el adaptador PEFT y el pipeline de cuantización, un equipo puede reentrenar el adaptador con datos propios del dominio agrícola.
- Base para un asistente conversacional multiturno en cooperativas o ONG: el entrenamiento incluye datos multiturno, aunque la ventana efectiva de entrenamiento de 1024 tokens limita conversaciones muy largas.
- Evaluación comparativa de cuantizaciones en producción: el repositorio incluye imatrix, corpus de calibración y logs de divergencia KL, útiles para replicar el proceso de selección de cuantización en otros modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio incluye `screen/results.json`, que ordena los candidatos GGUF por precisión en un conjunto oculto, tamaño y TPS en GPU, pero no se proporcionan los valores numéricos. La model card advierte además que el TPS medido en GPU no debe interpretarse como una medición en un portátil ADTC.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo derivado de 4.628.569.635 parámetros, sin incluir caché KV ni sobrecarga del runtime):
  - BF16 (`merged_bf16/`): aproximadamente 8,6-9,3 GB solo de pesos; en la práctica, 11-12 GB con contexto y activaciones.
  - GGUF `q4_k_m` / `q4_0`: aproximadamente 2,5-3 GB de pesos; en torno a 4-5 GB en ejecución real.
- GPU recomendadas: H100, A100 o L40S para BF16 con lotes grandes; RTX 4090 o RTX 3090 para BF16 en un único dispositivo; RTX 3060 de 12 GB como mínimo ajustado para BF16.
- Compatibilidad con GPU de consumo: sí. Las cuantizaciones q4 deberían caber en tarjetas de 6-8 GB de VRAM; los pesos BF16 requieren al menos 12 GB.
- Opciones de despliegue: llama.cpp u Ollama para los GGUF; transformers con PEFT para el adaptador; vLLM o TGI para los pesos fusionados en bf16, siempre que la arquitectura del modelo base esté soportada por esas herramientas (no confirmado en la información disponible).
- Latencia y throughput: no disponibles. La model card solo indica que existe una métrica de TPS en GPU dentro de `screen/results.json`, sin publicar el valor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kuzaai/kuza-gemma-4-e2b | 4.628.569.635 | No disponible | en, sw | Gemma | HuggingFace, 24 descargas, 0 likes |
| unsloth/gemma-4-E2B-it-qat-q4_0-unquantized (modelo base) | No disponible | No disponible | No disponible | Gemma | HuggingFace |
| Otros asistentes agrícolas para África Oriental | No disponible | No disponible | No disponible | No disponible | No disponible en la información proporcionada |

No se dispone de datos de rendimiento ni de especificaciones de alternativas comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Riesgo de alucinación relevante: se trata de un asistente de dominio agrícola, donde una recomendación incorrecta sobre plagas, fitosanitarios o fertilización puede causar daños económicos o de cultivo. Requiere supervisión humana en decisiones críticas.
- Sesgos conocidos: no documentados en la información disponible. La mezcla de datos está fuertemente sesgada hacia el inglés (100% de `kuza_sft_english` frente a un 35% de suajili), lo que puede traducirse en mayor calidad de respuesta en inglés que en suajili.
- Limitaciones de idioma: solo inglés y suajili. No hay soporte declarado para otras lenguas de la región (kikuyu, luganda, amárico, etc.), frecuentes en el mismo contexto geográfico.
- Limitaciones de contexto: la longitud de secuencia usada en el ajuste es de 1024 tokens y no se declara la ventana de contexto final del modelo; las conversaciones multiturno largas pueden degradarse.
- Modalidad limitada: al descartar visión y audio, no puede analizar fotografías de cultivos ni notas de voz, algo habitual en el uso real en zonas rurales.
- Sin modo de razonamiento: el thinking está desactivado, por lo que no se beneficia de cadenas de razonamiento explícitas en tareas complejas.
- Restricciones de licencia: se aplica la licencia Gemma de Google, con sus condiciones de uso y política de uso prohibido; conviene revisar los términos antes de un uso comercial.
- Validación escasa: 24 descargas y 0 likes, sin benchmarks publicados ni evaluación independiente. El modelo está recién publicado y no ha sido contrastado por terceros.
- Tamaño del repositorio: 33,2 GB, ya que incluye checkpoints, corpus de calibración, imatrix y varias cuantizaciones, no solo los pesos finales.
- Advertencia del autor: los valores de TPS medidos en GPU no equivalen a una medición en portátil, por lo que no deben usarse para estimar rendimiento en equipos de consumo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kuzaai/kuza-gemma-4-e2b
- Modelo base: https://huggingface.co/unsloth/gemma-4-E2B-it-qat-q4_0-unquantized
- Licencia Gemma: https://ai.google.dev/gemma/terms
- Dataset de ajuste en inglés: https://huggingface.co/datasets/kuzaai/kuza_sft_english
- Dataset de ajuste en suajili: https://huggingface.co/datasets/kuzaai/kuza_sft_swahili
- Dataset adversario: https://huggingface.co/datasets/kuzaai/kuza_sft_adversarial
- Dataset multiturno: https://huggingface.co/datasets/kuzaai/kuza_sft_multiturn
- Dataset auxiliar: https://huggingface.co/datasets/HuggingFaceH4/no_robots

Nota: la búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo; los enlaces recuperados correspondían a generadores de vectores e imágenes y no guardan relación con Kuza Gemma 4 E2B.
