# Kamyar-zeinalipour/MultiHint-9K-Nemo-12B

## Resumen

MultiHint-9K-Nemo-12B es un adaptador LoRA sobre Mistral-Nemo-Instruct-2407 (12B parametros) desarrollado por Kamyar Zeinalipour y colaboradores de la Universidad de Siena y del Instituto di Linguistica Computazionale (CNR). El modelo resuelve una tarea pedagogica muy concreta: dado un pasaje de comprension lectora, una pregunta y su respuesta, generar una pista socratica breve que oriente al estudiante hacia la respuesta sin desvelarla. Se entrena sobre el dataset MultiHint-9K, compuesto por 9.987 tripletas pregunta-respuesta-pista verificadas automaticamente y calibradas por humanos en ingles, italiano y persa.

El modelo es relevante porque demuestra que un ajuste fino ligero (LoRA) sobre un modelo instructivo generalista puede duplicar el rendimiento en una tarea pedagogica especializada: la puntuacion ROUGE-L pasa de 0,15 en el modelo base a 0,31 tras el ajuste, un incremento del 100 %, con significacion estadistica (p < 0,001, Wilcoxon corregido por Bonferroni). Forma parte de una familia de cinco adaptadores (Llama-3.1-8B, Qwen2.5-14B, Mistral-7B-v0.3, Mistral-Nemo-12B y Mistral-Small-24B) publicados junto al articulo presentado en AIED 2026.

El adaptador se distribuye como pesos PEFT en safetensors (2,9 GB) y requiere cargar el modelo base por separado. La licencia declarada es Apache 2.0, heredada del modelo base, y los idiomas soportados son ingles, italiano y persa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Mistral-Nemo-Instruct-2407) con adaptador LoRA (PEFT) |
| Parametros totales | 12B en el modelo base; el adaptador LoRA anade un subconjunto no especificado (r = 32, alpha = 64) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Mistral-Nemo-Instruct-2407) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (el adaptador se distribuye en bf16; el modelo base admite las cuantizaciones habituales) |
| Idiomas soportados | en, it, fa |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el modelo base en safetensors |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Mistral-Nemo-Instruct-2407, un transformer decoder-only de 12B parametros de Mistral AI. El ajuste fino emplea LoRA con r = 32, alpha = 64 y dropout 0,1 sobre las proyecciones de atencion y MLP. El entrenamiento se realizo durante 3 epocas con AdamW, tasa de aprendizaje 1e-4 con decaimiento coseno, precision bf16 y Flash Attention 2.

Los datos de entrenamiento provienen de MultiHint-9K, un conjunto de 9.987 tripletas (pasaje, pregunta, respuesta, pista) en ingles, italiano y persa, verificadas automaticamente y calibradas por humanos. El articulo asociado describe la orquestacion de agencia humana y de IA para la generacion escalable de pistas pedagogicas. No se especifica en la informacion disponible el numero total de tokens de entrenamiento ni si se aplicaron tecnicas de RLHF o DPO; el procedimiento descrito es un ajuste supervisado con LoRA.

## Capacidades

- Generacion de pistas socraticas: dada una tripleta pasaje-pregunta-respuesta, produce una pista breve que guia al estudiante sin revelar la solucion.
- Generacion de texto instructivo en el dominio educativo, heredada del modelo base.
- Multilingue: entrenado y evaluado en ingles, italiano y persa.
- Formato de prompt especifico con rol "Recall Assistant" y plantilla fija (passage, question, answer, hint).
- No se documentan en la informacion disponible capacidades de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito (thinking mode) para este adaptador.

## Casos de uso

- Tutoria automatica en plataformas de comprension lectora: el modelo recibe el texto, la pregunta y la respuesta correcta, y devuelve una pista que orienta al alumno sin desvelar la solucion; encaja en flujos de e-learning donde el sistema conoce la respuesta pero quiere fomentar el razonamiento.
- Generacion de pistas para bancos de ejercicios: permite enriquecer automaticamente un catalogo de preguntas con pistas pedagogicas en ingles, italiano y persa, reduciendo el trabajo manual de docentes.
- Sistemas de evaluacion formativa: integrado en un asistente que detecta respuestas incorrectas y ofrece pistas graduadas antes de mostrar la solucion, usando la plantilla de prompt del modelo.
- Soporte a docentes de idiomas: generacion de pistas en italiano y persa para materiales de lectura, aprovechando el entrenamiento multilingue del adaptador.
- Investigacion en NLP educativo: el adaptador y su dataset sirven como linea base reproducible (ROUGE-L 0,31) para experimentos de generacion de pistas y evaluacion pedagogica.
- Prototipado rapido de asistentes socraticos: al ser un adaptador LoRA de 2,9 GB sobre un modelo de 12B, se puede desplegar con el modelo base en una GPU unica para demos y pruebas de concepto.
- Generacion de contenido educativo asistido: produccion de pistas de apoyo para materiales de lectura en varios idiomas, con revision humana posterior.

## Benchmarks y rendimiento

Resultados publicados en la model card (ROUGE-L sobre el conjunto de validacion, modelo base frente a adaptador):

| Modelo base | Adaptador | ROUGE-L (base → fine-tuned) |
|---|---|---|
| Llama-3.1-8B | MultiHint-9K-Llama-3.1-8B | 0,20 → 0,32 (+52 %) |
| Qwen2.5-14B | MultiHint-9K-Qwen2.5-14B | 0,23 → 0,31 (+34 %) |
| Mistral-7B-v0.3 | MultiHint-9K-Mistral-7B-v0.3 | 0,19 → 0,32 (+57 %) |
| Mistral-Nemo-12B | MultiHint-9K-Nemo-12B | 0,15 → 0,31 (+100 %) |
| Mistral-Small-24B | MultiHint-9K-Mistral-Small-24B | 0,18 → 0,33 (+71 %) |

Todas las mejoras son estadisticamente significativas (p < 0,001, Wilcoxon corregido por Bonferroni). No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generales para este adaptador.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 12B en bf16 requiere aproximadamente 24 GB; en cuantizacion de 8 bits, unos 12-13 GB; en 4 bits, unos 7-8 GB. El adaptador LoRA anade una sobrecarga pequena (2,9 GB en disco, menos en memoria una vez fusionado).
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S para bf16 sin cuantizar; RTX 4090 (24 GB) para bf16 justo o cuantizacion 8 bits; RTX 3090/4080 (16-24 GB) con cuantizacion.
- Cabe en GPU de consumo: si, con cuantizacion 4 u 8 bits en GPUs de 16 GB o mas; en bf16 requiere 24 GB o mas.
- Opciones de despliegue: transformers + peft (procedimiento documentado en la model card), vLLM o TGI tras fusionar el adaptador con el modelo base, y llama.cpp/Ollama si se convierte a GGUF.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ROUGE-L (fine-tuned) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MultiHint-9K-Nemo-12B | 12B (base) | no disponible | 0,31 | apache-2.0 | Hugging Face (adaptador PEFT) |
| MultiHint-9K-Qwen2.5-14B | 14B (base) | no disponible | 0,31 | no disponible en la informacion | Hugging Face (adaptador PEFT) |
| MultiHint-9K-Mistral-Small-24B | 24B (base) | no disponible | 0,33 | no disponible en la informacion | Hugging Face (adaptador PEFT) |
| MultiHint-9K-Llama-3.1-8B | 8B (base) | no disponible | 0,32 | no disponible en la informacion | Hugging Face (adaptador PEFT) |

Los cinco adaptadores de la familia MultiHint-9K logran resultados de ROUGE-L entre 0,31 y 0,33; el de Nemo-12B destaca por la mayor mejora relativa (+100 %) y por requerir menos recursos que el de 24B. No se dispone de datos de modelos fuera de esta familia para una comparacion directa.

## Limitaciones y advertencias

- Tarea muy especializada: el modelo esta entrenado exclusivamente para generar pistas socraticas a partir de pasaje, pregunta y respuesta; su uso fuera de ese formato puede degradar la calidad.
- Riesgo de alucinacion: como todo modelo generativo, puede producir pistas que revelen parcialmente la respuesta o que introduzcan informacion no presente en el pasaje; se recomienda verificacion automatica o humana.
- Cobertura limitada de idiomas: solo ingles, italiano y persa; no se garantiza un comportamiento adecuado en castellano ni en otras lenguas.
- Licencia: Apache 2.0 heredada del modelo base, lo que permite uso comercial, pero conviene revisar los terminos del modelo base Mistral-Nemo-Instruct-2407.
- Requiere cargar el modelo base por separado; el adaptador no es autonomo y anade complejidad al despliegue (fusion o carga con PEFT).
- No se documentan evaluaciones de sesgo, toxicidad ni robustez; el dataset es de dominio educativo y puede no representar otros contextos.
- Longitud de contexto y comportamiento con entradas largas no estan documentados en la informacion disponible para este adaptador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kamyar-zeinalipour/MultiHint-9K-Nemo-12B
- Modelo base: https://huggingface.co/mistralai/Mistral-Nemo-Instruct-2407
- Dataset MultiHint-9K: https://huggingface.co/datasets/Kamyar-zeinalipour/MultiHint-9K
- Coleccion MultiHint-9K: https://huggingface.co/collections/Kamyar-zeinalipour/multihint-9k-aied-2026-6af4875966cf330a922a1d87
- Repositorio GitHub: https://github.com/KamyarZeinalipour/MultiHint-9K
- Articulo (CEUR-WS, AIED 2026): https://ceur-ws.org/Vol-4248/short11.pdf
- Adaptador Llama-3.1-8B: https://huggingface.co/Kamyar-zeinalipour/MultiHint-9K-Llama-3.1-8B
- Adaptador Qwen2.5-14B: https://huggingface.co/Kamyar-zeinalipour/MultiHint-9K-Qwen2.5-14B
- Adaptador Mistral-7B-v0.3: https://huggingface.co/Kamyar-zeinalipour/MultiHint-9K-Mistral-7B-v0.3
- Adaptador Mistral-Small-24B: https://huggingface.co/Kamyar-zeinalipour/MultiHint-9K-Mistral-Small-24B
