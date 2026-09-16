# Gensyn/open-1b-sft

## Resumen

open-1b-sft es la versión afinada con supervisión (SFT) del modelo open-1b de Gensyn, un transformer decoder-only de 1.608.011.776 parámetros totales (1,08B sin contar embeddings) entrenado sobre 400.000 millones de tokens en 80.957 pasos de optimizador. Parte del checkpoint intermedio `Gensyn/open-1b-midtrained-93B` (pretraining continuado sobre 93B tokens adicionales) y se afina sobre el dataset `allenai/tulu-3-sft-olmo-2-mixture-0225`. Es un modelo exclusivamente SFT: no se aplicó RLHF, DPO ni ningún otro ajuste por preferencias, y su ventana de contexto es de 4.096 tokens.

Su relevancia no está en el rendimiento bruto —es un modelo pequeño de 1,61B parámetros— sino en la propuesta de entrenamiento verificable. Gensyn publica el dataset completo de preentrenamiento, el código de entrenamiento y evaluación, checkpoints intermedios cada 100 pasos con el estado completo del optimizador, y un hash canónico de estado para cada uno de los 80.957 pasos. Cualquiera puede cargar el checkpoint previo a un paso, reproducirlo en su propio hardware, calcular el hash del resultado y comprobar que coincide con la huella publicada.

El modelo se entrenó con cuantización consciente del entrenamiento (QAT) int8 W8A8 con LSQ, y los tensores de escala por canal aprendidos se incluyen en el checkpoint. El repositorio incorpora su propio código de modelado (`modeling_open1b.py`) que debe cargarse con `trust_remote_code=True`, ya que la arquitectura no coincide con ninguna clase estándar de `transformers`.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con QK-norm sin ganancia, RMSNorm en embeddings y atención híbrida de ventana deslizante alineada por bloques |
| Parametros totales | 1.608.011.776 (1,61B; 1,08B sin embeddings) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | QAT int8 W8A8 (LSQ) con escalas `weight_scale` por canal incluidas en el checkpoint; pesos maestros en bf16; `config.quantized_forward=True` por defecto. No se publican cuantizaciones GGUF ni GPTQ/AWQ |
| Idiomas soportados | Inglés, con texto de código y STEM |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors + código de modelado propio (`modeling_open1b.py`, requiere `trust_remote_code=True`); `chat_template.jinja` y `tokenizer_config.json` |
| Tokens de preentrenamiento | 400.000 millones (80.957 pasos de optimizador) |
| Datos de SFT | `allenai/tulu-3-sft-olmo-2-mixture-0225` |
| Modelo base | `Gensyn/open-1b-midtrained-93B` |
| Cluster de entrenamiento | 6 nodos, 48× NVIDIA H100 |
| Tamano del repositorio | 6,4 GB |
| Descargas / likes | 152 / 11 |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 1,61B parámetros con varias desviaciones respecto a las implementaciones estándar: QK-norm sin parámetro de ganancia, RMSNorm aplicado a los embeddings y un esquema de atención híbrida de ventana deslizante alineada por bloques. Estas decisiones implican que el checkpoint necesita su propio módulo de modelado y que no puede cargarse con clases nativas de `transformers`. El preentrenamiento consumió 400.000 millones de tokens en 80.957 pasos, seguido de una fase de midtraining con 93.000 millones de tokens adicionales y, finalmente, el ajuste supervisado sobre la mezcla Tulu-3 de OLMo 2. No hubo etapa de alineación por preferencias.

La innovación técnica principal es la verificabilidad del entrenamiento. Gensyn publica la trayectoria completa de checkpoints (cada 100 pasos, con estado del optimizador), compromisos de Merkle y hashes por paso servidos por un registro público, además de una herramienta de auditoría (`pretraining-audit-cli`) que permite reproducir un paso y comparar el hash resultante con la huella publicada. El entrenamiento usó QAT int8 W8A8 con LSQ, de modo que los pesos ya incorporan escalas por canal y el forward puede emular la rejilla int8 del entrenamiento. Los logits de inferencia son numéricamente cercanos, pero no idénticos bit a bit, a los del stack de entrenamiento: la reproducibilidad exacta es competencia de la herramienta de auditoría, no del pipeline de inferencia.

## Capacidades

- Generación de texto conversacional en inglés mediante plantilla de chat propia, con roles delimitados por los tokens especiales `<|start_header|>` (id 2), `<|end_header|>` (id 3) y `<|eot|>` (id 4), todos ellos encodificados como un único id atómico.
- Terminación de turno controlada: `<|eot|>` es el token de fin de secuencia, por lo que `generate()` se detiene al final del turno del asistente sin necesidad de paradas adicionales.
- Generación de código y contenido técnico, dado que el corpus de preentrenamiento incluye texto de programación y STEM.
- Seguimiento de instrucciones en formato conversacional multiturno, gracias al ajuste supervisado sobre la mezcla Tulu-3.
- Capacidades de razonamiento y matemáticas: no hay evidencia publicada en la información disponible sobre su nivel en estas tareas; un modelo de 1,61B tiene expectativas limitadas en razonamiento multi-paso.
- Tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado; el modelo se presenta como conversacional, no como base para agentes.
- Capacidades multilingües: únicamente inglés (más código y STEM). No hay soporte declarado de otros idiomas.
- Capacidades especiales: no se declaran modo thinking, visión ni audio. La característica diferencial es la auditabilidad del entrenamiento, no una capacidad funcional adicional.
- Compatibilidad de tokenización: debe usarse el tokenizador tal cual se publica. El README advierte explícitamente de que no se pase `fix_mistral_regex=True`, porque altera el comportamiento del pre-tokenizador y rompe el contrato de reproducibilidad.

## Casos de uso

- Investigación en entrenamiento verificable: cargar un checkpoint intermedio, reproducir un paso concreto en hardware propio, calcular el hash y compararlo con el publicado en `open1b.gensyn.ai`. Es el caso de uso principal y para el que se diseñó el modelo.
- Auditoría de pipelines de preentrenamiento: usar el modelo y su registro de hashes como referencia para validar herramientas internas de reproducibilidad, comparando el comportamiento de un replay propio con el de `pretraining-audit-cli`.
- Fine-tuning de dominio con presupuesto reducido: al ser un modelo de 1,61B parámetros con licencia Apache 2.0, se puede afinar en una única GPU de 24 GB para tareas de clasificación, extracción o resumen en inglés sin depender de APIs externas.
- Asistente conversacional en inglés sobre documentación técnica: con 4.096 tokens de contexto cabe un conjunto de documentos medianos y el historial de conversación, suficiente para soporte interno de manuales o APIs.
- Autocompletado de código ligero en entornos con recursos limitados: el modelo cabe en GPUs de consumo y puede servir sugerencias de completado en editores, con la advertencia de que se trata de un modelo de 1,61B y no de un especialista en código.
- Generación de datos sintéticos para destilación o evaluación: producir pares instrucción-respuesta en inglés a bajo coste, etiquetados con la ventaja de que el origen del modelo y su entrenamiento son trazables.
- Despliegue en entornos con requisitos de auditabilidad regulatoria: al publicarse datos, código y hashes, es posible justificar ante un auditor cómo se entrenó el modelo, algo que no ofrecen los pesos abiertos convencionales.
- Experimentación académica sobre QAT int8: el checkpoint incluye escalas por canal aprendidas con LSQ y un flag `quantized_forward` para alternar entre emulación int8 y GEMM en bf16, lo que permite estudiar el impacto de la cuantización consciente del entrenamiento sobre los pesos finales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona que se publica código de evaluación junto con el de entrenamiento, pero no incluye cifras de MMLU, GSM8K, HumanEval ni de ninguna otra prueba. No se presentan, por tanto, tablas comparativas con modelos de tamaño similar.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en bf16, aproximadamente 3,2 GB solo de pesos; con la emulación int8 por defecto, en torno a 1,6-2 GB. Añadiendo caché KV y activaciones para contexto de 4.096 tokens y lotes pequeños, el consumo realista se sitúa alrededor de 4-5 GB en bf16 y 3-4 GB en int8. El repositorio ocupa 6,4 GB, coherente con pesos almacenados en mayor precisión más los tensores de escala.
- GPU recomendadas: cualquier GPU con 8 GB o más. Para entrenamiento o fine-tuning, se recomienda al menos 24 GB (RTX 3090/4090, L4, A10G) para ajustar con LoRA en bf16; para el ajuste completo harían falta configuraciones multi-GPU. El entrenamiento original se realizó en 48× NVIDIA H100.
- Cabe en GPU de consumo: sí. RTX 3060 12 GB, RTX 4060 8 GB, RTX 4070, RTX 4090 y equivalentes pueden ejecutar inferencia en bf16 o int8 sin problemas.
- Opciones de despliegue: obligatoriamente `transformers` con `trust_remote_code=True`, ya que la arquitectura es personalizada. El soporte en vLLM, TGI, llama.cpp u Ollama no está documentado en la información disponible y requeriría portar la arquitectura o convertir los pesos a GGUF, algo que el repositorio no ofrece.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Rendimiento publicado |
|---|---|---|---|---|---|
| Gensyn/open-1b-sft | 1,61B | 4.096 | Apache 2.0 | Inglés (+ código/STEM) | No disponible |
| Llama 3.2 1B Instruct | 1,24B | 128.000 | Llama 3.2 Community License | 8 idiomas oficiales | No verificado en esta ficha |
| Qwen2.5 1.5B Instruct | 1,54B | 32.768 | Apache 2.0 | Más de 29 idiomas | No verificado en esta ficha |
| SmolLM2 1.7B Instruct | 1,71B | 8.192 | Apache 2.0 | Principalmente inglés | No verificado en esta ficha |

Los datos de los modelos comparables proceden de su documentación pública y no se han verificado en el contexto de esta ficha; consúltese siempre la model card original. La diferencia principal de open-1b-sft frente a las alternativas no es de especificaciones —su contexto de 4.096 tokens es el más corto de la tabla y solo cubre inglés— sino la trazabilidad completa del entrenamiento: checkpoints cada 100 pasos, hashes verificables por paso y dataset de preentrenamiento publicable y consultable.

## Limitaciones y advertencias

- Sesgos conocidos: no se documenta ningún análisis de sesgos en la información disponible. El modelo se entrena exclusivamente en inglés, lo que concentra la representación en perspectivas anglófonas del corpus.
- Riesgo de alucinación: es un modelo de 1,61B parámetros sin alineación por preferencias (ni RLHF ni DPO), por lo que la tasa de afirmaciones incorrectas presentadas con seguridad puede ser elevada. No debe usarse como fuente de verdad sin verificación.
- Limitación de contexto: 4.096 tokens es una ventana corta comparada con alternativas contemporáneas de tamaño similar, lo que restringe tareas de resumen de documentos largos o conversaciones extensas.
- Limitación de idioma: únicamente inglés. No hay evidencia de capacidades en castellano ni en otros idiomas.
- Restricciones de licencia: Apache 2.0 permite uso comercial sin restricciones adicionales, pero el modelo base intermedio y todo el pipeline heredan la misma licencia. Conviene revisar los términos del dataset `allenai/tulu-3-sft-olmo-2-mixture-0225` antes de un uso comercial.
- Dependencia de código personalizado: requiere `trust_remote_code=True` y cargar `modeling_open1b.py`. Ejecutar código remoto implica riesgos de seguridad y complica la integración con servidores de inferencia que solo aceptan arquitecturas registradas.
- Sensibilidad del tokenizador: cualquier modificación del pre-tokenizador (por ejemplo, `fix_mistral_regex=True`) rompe el contrato de reproducibilidad y desvía la tokenización de la usada en entrenamiento.
- Divergencia numérica en inferencia: el forward por defecto emula la rejilla int8 del entrenamiento, pero los logits no son idénticos bit a bit a los del stack de entrenamiento (acumulación GEMM en fp32 y atención en bf16 frente al kernel int8 P·V del entrenamiento). No debe confundirse esta inferencia con una reproducción exacta del paso de entrenamiento.
- Madurez del ecosistema: sin cuantizaciones GGUF publicadas ni soporte confirmado en vLLM, TGI, llama.cpp u Ollama, el despliegue en producción exige trabajo de integración adicional.
- Advertencia de producción: la ventana de contexto de 4.096 tokens y el tamaño de 1,61B lo sitúan en la gama baja; para tareas de razonamiento complejo, agentes o contexto largo conviene evaluar alternativas mayores.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Gensyn/open-1b-sft
- Modelo base de preentrenamiento: https://huggingface.co/Gensyn/open-1b-base
- Checkpoint de midtraining: https://huggingface.co/Gensyn/open-1b-midtrained-93B
- Dataset de SFT: https://huggingface.co/datasets/allenai/tulu-3-sft-olmo-2-mixture-0225
- Registro de verificación: https://open1b.gensyn.ai
- Búsqueda en el dataset de preentrenamiento: https://open1b.gensyn.ai/#/data/search
- Informe técnico: https://open1b.gensyn.ai/open1b-tech-report.pdf
- Herramienta de auditoría: https://github.com/gensyn-ai/pretraining-audit-cli
- Código de entrenamiento, configuraciones y RepOps: https://github.com/gensyn-ai/open-transformers
- Datos de preentrenamiento (bucket GCS): gs://gensyn-open-1b/data
- Trayectoria de checkpoints cada 100 pasos (bucket GCS): gs://gensyn-open-1b/ckpt
