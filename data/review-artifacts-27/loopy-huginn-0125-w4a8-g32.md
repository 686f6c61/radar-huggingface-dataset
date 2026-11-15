# review-artifacts-27/Loopy-Huginn-0125-W4A8-G32

## Resumen

Loopy-Huginn-0125-W4A8-G32 es un checkpoint cuantizado derivado del modelo base `tomg-group-umd/huginn-0125`, un modelo de lenguaje recurrente en profundidad (recurrent depth) desarrollado por el grupo TOMG de la Universidad de Maryland. Este artefacto concreto ha sido publicado por el usuario `review-artifacts-27` como parte de un experimento de cuantización denominado Loopy, que aplica rotaciones Hadamard y cuantización de pesos a 4 bits con activaciones a 8 bits (W4A8) sobre una tabla principal de profundidad recurrente T=32.

El modelo resuelve el problema de reducir el coste de almacenamiento e inferencia de un modelo recurrente sin perder demasiada calidad, mediante una búsqueda sobre 80 candidatos de cuantización y la selección del candidato `s17_p11_b32`. El resultado es un checkpoint de 5,2 GB que mantiene las métricas de evaluación del experimento original y que requiere un cargador personalizado (no es compatible con `from_pretrained()` estándar de Transformers).

La relevancia actual radica en que explora la viabilidad de cuantizar modelos recurrentes (no solo transformers densos) y en que publica de forma reproducible el protocolo completo de selección, calibración y evaluación, incluyendo métricas de referencia en BF16 y ventanas fijas de WikiText-103.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje recurrente en profundidad (recurrent depth), basado en Huginn-0125; profundidad recurrente T=32 |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (usado en la evaluación WT2 con ventana de 4096) |
| Tipos de cuantizacion | W4A8: pesos a 4 bits (códigos INT8 en contenedores INT8), activaciones dinámicas por token a 8 bits; escalas, zero points, escalado de entrada y signos Hadamard; bloque Hadamard de 32; grupo de pesos de 32 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 (pesos); el código de investigación adjunto se rige por `code/THIRD_PARTY_NOTICES.md` |
| Formato de pesos | `selected.pt` (state dict de PyTorch con códigos W4 en contenedores INT8); no usa almacenamiento INT4 empaquetado ni kernel de inferencia INT4 |

## Arquitectura y entrenamiento

El modelo base Huginn-0125 emplea una arquitectura de transformer con recurrencia en profundidad: en lugar de apilar capas distintas, reutiliza un bloque de parámetros a lo largo de T=32 iteraciones recurrentes, lo que permite aumentar la capacidad efectiva sin incrementar proporcionalmente el número de parámetros. El checkpoint Loopy no modifica la arquitectura, sino que cuantiza los pesos y las activaciones del modelo base fijado en la revisión `bb6621b65e90b6a4b9b29ef88dc83866d450470c`.

El proceso de cuantización Loopy aplica una rotación Hadamard con bloque de 32 y un escalado con potencia 1,1, con semilla de rotación 17, sobre un pool de 80 candidatos. El candidato seleccionado es `s17_p11_b32`. La evaluación se realiza con cuantización falsa (fake quantization) en BF16, y el checkpoint no incluye kernel INT4 empaquetado, por lo que la inferencia real requiere el cargador Loopy incluido. No se dispone de información sobre el número de tokens de entrenamiento del modelo base ni sobre si se aplicó RLHF/DPO en esta información.

## Capacidades

- Generación de texto en inglés y modelado de lenguaje autorregresivo.
- Razonamiento y respuesta a tareas de conocimiento general (MMLU, ARC-C, HellaSwag, WinoGrande).
- Evaluación de perplejidad a nivel de documento con contexto de 4096 tokens (WT2, LAMBADA).
- No se ha documentado soporte de tool calling ni function calling en la información disponible.
- No se ha documentado soporte de agentes ni razonamiento multi-paso en la información disponible.
- Capacidades multilingües limitadas al inglés según la model card.
- No se ha documentado modo thinking, visión ni audio.

## Casos de uso

- Evaluación de técnicas de cuantización en modelos recurrentes: el checkpoint sirve como referencia reproducible para comparar W4A8 frente a BF16 en tareas de perplejidad y accuracy, usando las ventanas fijas y el protocolo incluidos en `code/docs/protocol.md`.
- Investigación sobre eficiencia de memoria: con 5,2 GB de repo y pesos W4 en contenedores INT8, permite estudiar el ahorro de almacenamiento frente al modelo base en entornos con VRAM limitada.
- Reproducción de experimentos: los scripts `eval_wikitext.py` y `eval_tasks.py` permiten replicar la tabla principal (WT2, LAMBADA, WinoGrande, ARC-C, HellaSwag, MMLU) sin búsqueda ni preparación adicional.
- Análisis de robustez de la cuantización: la comparación entre `reference_results/` (BF16) y las métricas del checkpoint permite medir la degradación introducida por W4A8 en cada tarea.
- Docencia e investigación en modelos recurrentes: el artefacto incluye configuración portable, ventanas fijas, valores de calibración y registros completos por etapa, útil para estudiar el proceso de selección de candidatos.
- Auditoría de artefactos: `manifest.json` y `provenance.json` permiten verificar integridad (SHA-256) y trazabilidad de metadatos, adecuado para pipelines de revisión de modelos.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---:|
| WT2 word PPL | 13,68 |
| LAMBADA PPL | 7,98 |
| LAMBADA acc. | 53,81 |
| WinoGrande | 61,17 |
| ARC-C (acc_norm) | 36,69 |
| HellaSwag (acc_norm) | 64,71 |
| MMLU | 29,67 |
| Mean acc. | 49,21 |

WT2 usa perplejidad de palabras a nivel de documento con contexto de 4096. La media pondera igualmente las cinco tareas de accuracy. Los resultados corresponden a las métricas guardadas del experimento que produjo este checkpoint; las métricas en precisión completa están en `reference_results/`.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el repo ocupa 5,2 GB, por lo que el checkpoint cabe en GPUs consumer con 8 GB o más, aunque la inferencia real depende del cargador Loopy y del modelo base.
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño, una RTX 4090 (24 GB) o A100/H100 serían suficientes para alojar los pesos, pero no se documenta throughput.
- Cabe en GPU consumer: probablemente sí en GPUs con 8-12 GB o más, dado el tamaño del repo, aunque no confirmado por el autor.
- Opciones de despliegue: cargador Loopy incluido en `code/` (obligatorio); no compatible con `from_pretrained()` genérico de Transformers. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Loopy-Huginn-0125-W4A8-G32 | no disponible | 4096 | Apache-2.0 | `selected.pt` (W4A8) | Checkpoint cuantizado, cargador custom |
| tomg-group-umd/huginn-0125 (base) | no disponible | no disponible | Apache-2.0 | safetensors/Transformers | Modelo original sin cuantizar |
| Alternativas de cuantización W4A8 en transformers densos | no disponible | no disponible | variable | GGUF/AWQ/GPTQ | No comparable directamente por arquitectura recurrente |

No se dispone de datos de benchmarks de modelos alternativos en la información proporcionada para establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- El checkpoint requiere el cargador Loopy; un `from_pretrained()` estándar fallará o producirá resultados incorrectos.
- No usa almacenamiento INT4 empaquetado ni kernel de inferencia INT4: la evaluación se hace con fake quantization en BF16, por lo que el rendimiento real en producción puede diferir.
- Idioma limitado al inglés; no se documenta soporte multilingüe.
- Riesgo de alucinación inherente a modelos de lenguaje; no se documentan mitigaciones específicas.
- Sesgos conocidos: no documentados en la información disponible.
- Restricciones de licencia: los pesos son Apache-2.0, pero el código de investigación adjunto se rige por `code/THIRD_PARTY_NOTICES.md`, que puede imponer condiciones adicionales.
- Modelo con 0 descargas y 0 likes: artefacto de revisión, sin validación comunitaria.
- No se documentan resultados de benchmarks frente a alternativas, ni latencia, ni throughput.

## Enlaces

- Hugging Face: https://huggingface.co/review-artifacts-27/Loopy-Huginn-0125-W4A8-G32
- Modelo base: https://huggingface.co/tomg-group-umd/huginn-0125
- Dataset de evaluación: https://huggingface.co/datasets/Salesforce/wikitext (revisión `b08601e04326c79dfdd32d625aee71d232d685c3`)
- Protocolo completo: `code/docs/protocol.md` (dentro del repositorio)
- Avisos de terceros: `code/THIRD_PARTY_NOTICES.md` (dentro del repositorio)
