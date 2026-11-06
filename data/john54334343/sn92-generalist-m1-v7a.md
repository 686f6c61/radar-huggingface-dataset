# john54334343/sn92-generalist-m1-v7a

## Resumen

SN92 generalist decision model es un ajuste fino (fine-tune) del modelo base baselabs/mammoth-1, desarrollado y publicado por el usuario john54334343 en Hugging Face. Se trata de un modelo de clasificación de texto (pipeline text-classification) disenado como "modelo de decisión": en lugar de generar texto libre, produce una respuesta seleccionando una letra entre un conjunto de opciones (answer-code readout). El modelo deriva de Qwen3.5-27B a través de la post-formación de Base Labs / Baseten, y conserva la arquitectura Qwen3_5Model con atención completa no causal.

Con 26.085.330.160 parámetros totales (aproximadamente 26.000 millones) y un tamano de repositorio de 52,2 GB, el modelo se distribuye en formato safetensors y bf16. Su relevancia radica en que adapta un modelo de lenguaje grande a tareas de decisión estructurada (NLI, análisis de sentimiento, razonamiento aritmético, recuperación de herramientas, ranking de productos) mediante un readout de letras sobre la cabeza LM original, lo que permite evaluaciones deterministas con temperatura baja.

La licencia es MIT, lo que facilita el uso comercial, aunque el modelo no está afiliado ni respaldado por Base Labs / Baseten, el equipo de Qwen ni REAX. El modelo está pensado para investigadores y desarrolladores que necesitan un clasificador de decisión de gran tamano con contexto amplio y capacidades multilingües heredadas del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5Model (transformer) con atención completa no causal, layout REAX joint-readout |
| Parametros totales | 26.085.330.160 |
| Parametros activos | no disponible (no es MoE segun la informacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bf16; el autor no documenta cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (bf16, LoRA fusionada) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3_5Model, un transformer con atención completa no causal (noncausal full attention) en el layout REAX joint-readout. El readout de respuesta utiliza las filas de letras de la cabeza LM de mammoth-1, de modo que el modelo emite logits sobre letras que se interpretan como códigos de respuesta. El ajuste fino se realizó con LoRA de rango 16 y alpha 32 sobre las 64 capas del modelo de lenguaje, con entropía cruzada sobre softmax(logits de letras / 2) frente a etiquetas con label smoothing de 0,1. Se usó AdamW con learning rate 5e-5, scheduler coseno y batch efectivo de 32, durante 1.590 pasos de optimización (1 época), con semilla de datos 2. Las LoRA se fusionaron en los pesos bf16 finales.

Los datos de entrenamiento combinan la mezcla del fine-tune v3a con 7.620 filas adicionales orientadas a cubrir huecos del propietario: postura (stance), sarcasmo, NLI de ensayos clínicos, aritmética de GSM8K-train con distractores de código, recuperación de herramientas de línea de comandos, recuperación de contraargumentos y ranking de productos. Solo se usaron fuentes permisivas (CC0, CC BY, Apache-2.0, BSD-2, MIT, dominio público) y ningún texto fue escrito por modelos de OpenAI o Anthropic. No se usó el split de test del Decision-Index. Los elementos se reformatearon a ítems de decisión REAX eval-v5.1 y no se distribuyen ficheros de dataset en el repositorio. El fichero `decision_config.json` fija temperatura 0,5, aunque las decisiones por argmax no se ven afectadas.

## Capacidades

- Clasificación de decisión mediante selección de letra (answer-code readout) sobre un conjunto de opciones.
- Razonamiento aritmético con problemas de palabras y distractores de código (derivado de GSM8K-train).
- Inferencia de lenguaje natural (NLI) en dominios como ensayos clínicos y contratos.
- Análisis de postura (stance detection) y detección de sarcasmo.
- Recuperación de herramientas de línea de comandos y de contraargumentos.
- Ranking de productos y comparación de opciones.
- Razonamiento de sentido común y lógica (derivado de datasets como CommonsenseQA, StrategyQA, QASC, OpenBookQA, WinoGrande).
- Capacidades multilingües potenciales heredadas del modelo base, aunque no documentadas explícitamente.
- Soporte de tool calling / function calling: no documentado explícitamente en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Evaluación de NLI en documentación clínica: el modelo puede clasificar pares de premisa-hipótesis en ensayos clínicos, aprovechando los datos de ClinicalTrials.gov y ContractNLI usados en el entrenamiento, para tareas de verificación de afirmaciones.
- Moderación de contenido y análisis de toxicidad: gracias a los datos de Aegis 2.0, puede etiquetar respuestas dañinas en pipelines de moderación, seleccionando la categoría de daño correspondiente.
- Detección de sarcasmo y postura en redes sociales: útil para monitorización de opinión pública, clasificando textos como sarcásticos o no, o identificando la postura frente a un tema.
- Recuperación de herramientas de línea de comandos: el modelo puede mapear una descripción en lenguaje natural a la utilidad CLI adecuada (tldr-pages), integrándose en asistentes de terminal o documentación automatizada.
- Ranking de productos en comercio electrónico: con datos de Amazon ESCI, puede ordenar resultados de búsqueda según relevancia, ayudando en sistemas de recomendación y búsqueda semántica.
- Verificación de razonamiento aritmético en pipelines educativos: resuelve problemas de palabras con distractores de código, útil para generar o validar ejercicios en plataformas de aprendizaje.
- Clasificación de intenciones en atención al cliente: con datos de CLINC150, BANKING77 y MASSIVE, puede etiquetar consultas de usuarios en dominios bancarios y de servicios, alimentando sistemas de enrutamiento.
- Recuperación de contraargumentos en debate asistido: usando el corpus args.me y ArguAna, puede seleccionar el mejor contraargumento para un tema dado en herramientas de debate o escritura argumentativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 52 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda al menos 80 GB para contexto largo.
- GPU recomendadas: A100 80GB, H100 80GB, o múltiples GPU consumer con paralelización.
- En consumer GPU: no cabe en una sola RTX 4090 (24 GB) en bf16; requeriría cuantización (no documentada) o reparto entre varias GPU.
- Opciones de despliegue: vLLM, TGI o PyTorch nativo con `transformers`; llama.cpp/Ollama requerirían conversión a GGUF no documentada.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| SN92 generalist-m1-v7a | 26,1B | no disponible | MIT | Hugging Face (50 descargas) | Fine-tune de decisión sobre mammoth-1 |
| baselabs/mammoth-1 | no disponible | no disponible | MIT | Hugging Face | Modelo base, post-entrenado de Qwen3.5-27B |
| Qwen3.5-27B | ~27B | no disponible | Apache-2.0 | Hugging Face | Modelo generativo original de Qwen |
| Modelos de clasificación tipo DeBERTa | ~0,1-1,5B | 512 tokens típico | MIT/Apache-2.0 | Hugging Face | Alternativa ligera para clasificación, mucho menor tamano |

## Limitaciones y advertencias

- El modelo es un clasificador de decisión, no un generador de texto libre; no debe usarse para generación abierta.
- No se documentan sesgos conocidos, pero hereda los del modelo base Qwen3.5-27B y de los datasets de entrenamiento (por ejemplo, Aegis 2.0 incluye etiquetas de un jurado de LLMs).
- Riesgo de alucinación: limitado al formato de selección de letra, pero puede elegir opciones incorrectas en dominios fuera de la distribución de entrenamiento.
- Limitaciones de contexto e idioma no documentadas; el entrenamiento parece centrado en inglés (datasets como MASSIVE, CLINC150, BANKING77 en inglés).
- Restricciones de licencia: MIT permite uso comercial, pero el autor no está afiliado a Base Labs / Baseten, Qwen ni REAX; revisar THIRD_PARTY_NOTICES.md para atribuciones de datos.
- El modelo tiene muy pocas descargas (50) y ningún like, lo que sugiere escasa validación comunitaria.
- No se distribuyen ficheros de dataset; la reproducibilidad del entrenamiento depende de las fuentes originales.
- El uso de temperatura 0,5 en `decision_config.json` no afecta a las decisiones por argmax, pero cualquier muestreo podría desviarse del comportamiento previsto.

## Enlaces

- Hugging Face: https://huggingface.co/john54334343/sn92-generalist-m1-v7a
- Modelo base: https://huggingface.co/baselabs/mammoth-1
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/legalcode
- Licencia CC BY 3.0: https://creativecommons.org/licenses/by/3.0/legalcode
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
- Licencia BSD-2-Clause: https://opensource.org/license/bsd-2-clause
- GeoNames: https://www.geonames.org
- args.me corpus (Zenodo): https://doi.org/10.5281/zenodo.3734893
- ArguAna Counterargs (Zenodo): https://doi.org/10.5281/zenodo.3973258
- Python PEPs: https://github.com/python/peps
