# SecondLookResearch/Qwen2.5-32B-instruct-mix

## Resumen

`SecondLookResearch/Qwen2.5-32B-instruct-mix` es un adaptador LoRA (PEFT) de 2,2 GB para el modelo denso `Qwen/Qwen2.5-32B`, publicado por Second Look Research como parte de "Teaching Qwen Why", una replicación sobre modelos de pesos abiertos del trabajo de Anthropic "Teaching Claude Why". No es un modelo autónomo: es la primera etapa de una cadena de adaptadores y sirve como **baseline** (el modelo base entrenado únicamente con la mezcla de instruction tuning), frente al que se comparan las etapas posteriores de la replicación.

El adaptador se entrena sobre 13 000 ejemplos de mezcla de instruction tuning durante 2 épocas, con pérdida calculada solo en los turnos del asistente, usando LoRA de rango 64, alpha 128 sobre todas las capas lineales, LR 1e-4, schedule coseno y batch efectivo de 8 secuencias empaquetadas. Antes de esta etapa se repara un defecto del modelo base: las filas de los tokens terminadores de ChatML no están entrenadas en `Qwen2.5-32B`, y el parche se distribuye aparte como `base_row_patch.safetensors` (el "graft").

Su relevancia es de investigación más que de producto: permite reproducir y auditar un pipeline de alignment por etapas sobre un modelo abierto de 32B con licencia Apache 2.0, y sirve como punto de partida para estudiar misalignment agéntico. El repo es pequeño y de nicho (81 descargas, 0 likes en el momento de la consulta) y no incluye resultados de benchmarks propios.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso (familia Qwen2) + adaptador LoRA PEFT sobre `Qwen/Qwen2.5-32B` |
| Parámetros totales | ~32 500 millones en el modelo base (dato del modelo base, no verificado en la información proporcionada); el adaptador LoRA ocupa 2,2 GB en safetensors |
| Parámetros activos | no aplica (modelo denso, sin MoE) |
| Longitud de contexto | heredada del base Qwen2.5-32B: 131 072 tokens según la documentación pública del base (no verificada en la información proporcionada) |
| Tipos de cuantización | el adaptador se publica en safetensors sin cuantizar; no hay versiones GGUF/AWQ/GPTQ de este adaptador. El base admite bf16/fp16, fp8 y cuantizaciones de comunidad |
| Idiomas soportados | no disponible (la model card no declara idiomas; la composición lingüística del dataset de instruction tuning tampoco se detalla) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) + `base_row_patch.safetensors`; requiere descargar el base `Qwen/Qwen2.5-32B` en safetensors |
| Rank / alpha LoRA | 64 / 128, aplicado a todas las capas lineales |
| Librería | peft |
| Dataset de entrenamiento | `SecondLookResearch/teaching-qwen-why-data` (13 000 ejemplos, 2 épocas) |
| Descargas / likes | 81 / 0 |
| Fecha de creación / actualización | 2026-08-08 / 2026-10-20 |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 64 y alpha 128 insertado en todas las capas lineales del transformer denso de Qwen2.5-32B, con learning rate 1e-4, schedule coseno y batch efectivo de 8 secuencias empaquetadas. Se entrena durante 2 épocas sobre una mezcla de instruction tuning de 13 000 ejemplos, con la función de pérdida aplicada únicamente a los turnos del asistente. Una vez entrenado, el adaptador se fusiona (merge) en el modelo antes de entrenar la siguiente etapa de la cadena, de modo que este repositorio representa el eslabón inicial y aislado del pipeline.

La innovación técnica destacable no está en la arquitectura, sino en el preprocesado del base: los tokens terminadores de ChatML de `Qwen2.5-32B` tienen filas de embedding sin entrenar, y el pipeline las repara antes del instruction tuning. Ese parche se publica como `base_row_patch.safetensors` y debe aplicarse ("graft") para reproducir el comportamiento descrito; el script `serve_model.sh` del repositorio de código aplica el parche, fusiona los adaptadores en orden y arranca el servidor. No se documenta en la información disponible si hubo RLHF, DPO u otra fase de preferencias en esta etapa concreta, ni el número total de tokens procesados.

## Capacidades

- Generación de texto conversacional multi-turno en formato ChatML, tras aplicar el parche de tokens terminadores.
- Instruction following básico, adquirido exclusivamente de la mezcla de 13 000 ejemplos (2 épocas), sin etapas adicionales de alignment en este repositorio.
- Capacidades heredadas del base Qwen2.5-32B: razonamiento, matemáticas y generación de código (no re-evaluadas ni verificadas en este adaptador).
- Comprensión de contexto largo, limitada por la ventana del modelo base (131 072 tokens según su documentación pública).
- Capacidad multilingüe heredada del base, aunque la distribución de idiomas del dataset de instruction tuning no se especifica.
- Encadenamiento con adaptadores posteriores: está diseñado para fusionarse y servir como punto de partida de etapas siguientes del pipeline de "Teaching Qwen Why".
- Servicio multi-LoRA en vLLM, lo que permite cargar este adaptador junto a otros sobre el mismo base.
- No se documentan capacidades de tool calling, function calling, visión, audio ni modo "thinking" específicas de este adaptador.

## Casos de uso

- **Baseline de ablación en investigación de alignment**: sirve como referencia frente a la que medir el efecto de las etapas posteriores del pipeline (etiquetado de razones, preferencias, etc.). Es exactamente el uso para el que se publicó: las figuras 1, 2, 3, 4, 5, 6, 7, 13, 14 y 15 del post lo emplean como línea base.
- **Reproducción de la replicación de "Teaching Claude Why"**: con el repositorio de código y el dataset público se puede reconstruir la cadena completa, auditar cada etapa y modificar hiperparámetros (rank, LR, épocas) manteniendo el resto fijo.
- **Servicio multi-LoRA con vLLM**: cargar el adaptador junto a otros sobre una única instancia del base de 32B reduce el coste de servir varias variantes experimentales en paralelo, con conmutación por petición.
- **Estudio de misalignment agéntico**: el repositorio de código incluye `evaluation/agentic_misalignment/serve_model.sh`, pensado para servir el modelo y ejecutar evaluaciones de comportamiento desalineado en escenarios con herramientas.
- **Ajuste de dominio sobre una base ya instruction-tuned**: al ser un adaptador pequeño (2,2 GB) y Apache 2.0, es un punto de partida razonable para SFT posterior en dominios concretos (legal interno, documentación técnica) sin reentrenar 32B.
- **Generación de datos sintéticos de instrucción**: útil como generador de conversaciones y pares instrucción-respuesta para destilar comportamiento hacia modelos menores, dado su contexto largo y su coste de almacenamiento reducido.
- **Asistentes con RAG sobre corpus extensos**: la ventana de 131 072 tokens del base permite inyectar documentación extensa o historiales largos sin troceado agresivo, siempre que se valide la calidad tras el tuning.
- **Investigación sobre reparación de tokens especiales**: el parche `base_row_patch.safetensors` es en sí mismo un objeto de estudio sobre cómo los tokens de control sin entrenar afectan al comportamiento de un modelo instruction-tuned.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente referencia las figuras del post de "Teaching Qwen Why" en las que este adaptador aparece como baseline, sin incluir cifras en el repositorio, y tampoco se han encontrado valores de MMLU, HumanEval o GSM8K en la búsqueda web realizada.

## Requisitos de hardware

- **Pesos en bf16/fp16**: ~65 GB solo para el base de 32B, más 2,2 GB del adaptador. Requiere GPU de 80 GB (A100, H100) para inferencia con contexto moderado, o tensor parallelism en 2×48 GB (L40S, A6000) / 2×80 GB si se quiere contexto largo.
- **Caché KV estimada**: ~0,25 MB por token en bf16 (GQA con 8 cabezas KV); 8K tokens ≈ 2 GB, 32K ≈ 8 GB, 128K ≈ 32 GB adicionales. Estimación propia, no publicada por el autor.
- **fp8**: ~33 GB de pesos, encaja en una H100 80 GB con margen amplio y en una L40S 48 GB con contexto recortado.
- **Cuantización 4-bit del base**: ~18-20 GB, viable en RTX 4090 24 GB con contexto corto y en RTX 5090 32 GB con más holgura; requiere fusionar previamente el adaptador y el parche, ya que no se distribuyen GGUF de este adaptador.
- **GPU recomendadas**: H100 80 GB o A100 80 GB para el pipeline tal cual (vLLM, bf16, contexto largo); 2×L40S/2×A6000 para presupuestos ajustados; consumer solo vía cuantización y con pérdida de fidelidad respecto al setup del paper.
- **Despliegue**: vLLM con soporte LoRA es la vía documentada por el autor (`serve_model.sh` aplica el graft, fusiona adaptadores y arranca el servidor). Alternativas: PEFT + Transformers para experimentación, TGI para servicio estándar del base fusionado. llama.cpp/Ollama solo serían viables tras convertir el modelo fusionado a GGUF, procedimiento no documentado en el repositorio.
- **Latencia y throughput**: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / tamaño | Licencia | Notas |
|---|---|---|---|---|---|
| `SecondLookResearch/Qwen2.5-32B-instruct-mix` (este) | ~32,5B (base) | 131 072 (heredado del base) | LoRA safetensors, 2,2 GB + base | apache-2.0 | Baseline de investigación; requiere graft y base aparte |
| `Qwen/Qwen2.5-32B` (base) | ~32,5B | 131 072 | safetensors completos (~65 GB bf16) | apache-2.0 | Sin instruction tuning; tokens ChatML sin entrenar |
| `Qwen/Qwen2.5-32B-Instruct` | ~32,5B | 131 072 | safetensors completos | apache-2.0 | Instruction tuning y alignment oficiales de Alibaba; alternativa directa para producción |
| Gemma 2 27B IT | ~27B | 8 192 | safetensors completos | licencia Gemma (uso comercial con restricciones) | Menor ventana de contexto y licencia menos permisiva |

Los datos de los modelos comparativos provienen de sus model cards públicas y no se han verificado contra la información proporcionada; no hay cifras de rendimiento comparables publicadas para este adaptador.

## Limitaciones y advertencias

- **No es un modelo listo para producción**: es un artefacto de investigación con 81 descargas, sin evaluación publicada, y su uso previsto es como baseline experimental.
- **Dependencia del parche**: sin aplicar `base_row_patch.safetensors` al base, los tokens terminadores de ChatML siguen sin entrenar y el comportamiento se degrada (finalización incorrecta de turnos).
- **Riesgo de alucinación**: no se ha realizado ninguna evaluación de factualidad; el ajuste se limita a 13 000 ejemplos durante 2 épocas, insuficiente para mitigar alucinaciones del base.
- **Sesgos**: no documentados. La composición del dataset `teaching-qwen-why-data` no se detalla en la información disponible, por lo que no se puede caracterizar el sesgo introducido.
- **Idiomas**: no declarados; la mezcla de instruction tuning podría haber desplazado la distribución lingüística del base hacia el inglés. Requiere validación empírica antes de usar en castellano.
- **Licencia**: el adaptador es apache-2.0 y el base Qwen2.5-32B también, lo que en principio permite uso comercial; aun así, conviene revisar los términos del dataset de entrenamiento, cuya licencia no se especifica en la información disponible.
- **Caveat de nomenclatura**: el adaptador se llama "instruct-mix" pero el `base_model` declarado es `Qwen/Qwen2.5-32B` (el base sin instruction tuning), no `Qwen2.5-32B-Instruct`. Verificar esto antes de asumir comportamiento de modelo instruct.
- **Sin soporte de cuantización publicada**: no hay GGUF ni AWQ de este adaptador; desplegarlo en consumer requiere fusionar y convertir por cuenta propia, con riesgo de divergencia respecto al setup evaluado.
- **Resultados no extrapolables**: las conclusiones del post se refieren a la cadena completa de adaptadores, no a este eslabón de forma aislada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SecondLookResearch/Qwen2.5-32B-instruct-mix
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-32B
- Dataset de entrenamiento: https://huggingface.co/datasets/SecondLookResearch/teaching-qwen-why-data
- Repositorio de código de la replicación: https://github.com/uchicago-xlab/TeachingClaudeWhyReplication
- Script de servicio y evaluación de misalignment agéntico: `evaluation/agentic_misalignment/serve_model.sh` dentro del repositorio de código
- Cita del trabajo: Wei, Anastasia; Thompson, Jack; Qi, Brandon; Slocum, Stewart (2026), "Teaching Qwen Why", Second Look Research (BibTeX incluido en la model card)

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo (los enlaces encontrados corresponden a mods de Minecraft y no guardan relación con el contenido de esta ficha).
