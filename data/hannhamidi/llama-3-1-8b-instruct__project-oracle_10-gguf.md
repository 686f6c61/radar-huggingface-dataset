# HannHamidi/Llama-3.1-8B-Instruct__project-oracle_10-GGUF

## Resumen

Llama-3.1-8B-Instruct__project-oracle_10 es un ajuste fino (fine-tuning) del modelo base unsloth/Llama-3.1-8B-Instruct, publicado por el usuario HannHamidi bajo el identificador "project-oracle_10" y distribuido en formato GGUF para su uso con llama.cpp. Se trata de un adaptador LoRA (la librería declarada es peft) fusionado y convertido a GGUF mediante Unsloth, lo que permite ejecutar el modelo en hardware de consumo sin necesidad de infraestructura de GPU dedicada.

El modelo hereda la arquitectura Transformer decoder-only de Llama 3.1 con 8.030.261.312 parámetros y una ventana de contexto de 128.000 tokens (característica del modelo base Llama 3.1 8B). El ajuste se orienta a un caso de uso concreto no documentado en la model card (el nombre "project-oracle" sugiere un asistente especializado, pero el autor no detalla el dataset ni el objetivo del entrenamiento), y declara soporte para inglés y malayo (ms).

Su relevancia es limitada y de nicho: se publica con cero descargas y cero likes en el momento de la ficha, sin benchmarks ni documentación técnica del proceso de ajuste. Resulta útil únicamente como ejemplo de pipeline de fine-tuning LoRA + conversión GGUF con Unsloth, o para quien quiera evaluar empíricamente el efecto del ajuste sobre el modelo base. No debe confundirse con un modelo oficial de Meta ni con una versión validada para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1), ajuste LoRA sobre el modelo base |
| Parametros totales | 8.030.261.312 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128.000 tokens (heredada del modelo base Llama 3.1 8B; no verificada en la model card) |
| Tipos de cuantizacion | Q4_K_M (único fichero publicado) |
| Idiomas soportados | en, ms |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | GGUF (fichero Llama-3.1-8B-Instruct.Q4_K_M.gguf) |

## Arquitectura y entrenamiento

El modelo base es Llama 3.1 8B Instruct, un Transformer decoder-only con atención por cabezas agrupadas (GQA), activación SwiGLU, normalización RMSNorm y RoPE, entrenado por Meta sobre aproximadamente 15 billones de tokens (dato del modelo base, no verificado en esta ficha). Sobre él se aplicó un ajuste fino con LoRA (Low-Rank Adaptation) usando Unsloth, según indican los tags y la model card. El adaptador resultante se fusionó con los pesos base y se convirtió a GGUF en cuantización Q4_K_M.

No se dispone de información sobre el dataset de ajuste, el número de tokens de entrenamiento, la composición de los datos, la presencia de RLHF/DPO ni hiperparámetros del LoRA (rango, alpha, capas objetivo). La model card no documenta ninguna innovación técnica propia más allá del uso de Unsloth para la conversión. El identificador "project-oracle_10" sugiere la décima iteración de un proyecto personal, pero no hay evidencia publicada que lo confirme.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo Instruct base.
- Razonamiento y respuesta a instrucciones en inglés y malayo (según los tags de idioma declarados).
- Soporte de plantilla de chat Jinja (`--jinja` en llama.cpp) para formateo correcto de turnos.
- Compatible con endpoints (tag `endpoints_compatible`), lo que permite desplegarlo en infraestructuras tipo Inference Endpoints.
- Capacidad de tool calling y function calling: no documentada en esta ficha; el modelo base Llama 3.1 sí la soporta, pero el ajuste podría haberla alterado y no hay verificación.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multimodales o de audio: no disponibles (la mención a `llama-mtmd-cli` en la model card es genérica de la plantilla de Unsloth, no implica que este modelo sea multimodal).

## Casos de uso

- Evaluación de pipelines de fine-tuning LoRA: sirve como ejemplo reproducible de cómo Unsloth convierte un adaptador PEFT a GGUF, útil para equipos que quieran replicar el flujo con sus propios datos.
- Asistente conversacional en malayo: el modelo declara soporte de `ms`, por lo que puede emplearse en prototipos de atención al cliente en ese idioma, aunque sin benchmarks que validen la calidad del ajuste.
- Despliegue en hardware de consumo: al estar en Q4_K_M y ocupar 4,9 GB, puede ejecutarse en portátiles con GPU de 8 GB de VRAM o incluso en CPU, lo que facilita pruebas locales sin infraestructura cloud.
- Generación de texto offline con llama.cpp: integrable en aplicaciones de escritorio o CLI mediante `llama-cli -hf HannHamidi/Llama-3.1-8B-Instruct__project-oracle_10 --jinja`.
- Base para experimentación con plantillas Jinja: permite probar el formateo de chat de Llama 3.1 en entornos locales antes de migrar a modelos mayores.
- Comparación empírica base vs. ajustado: útil para investigadores que quieran medir el impacto de un LoRA no documentado sobre las capacidades del Llama 3.1 8B Instruct original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni evaluaciones comparativas con el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia en Q4_K_M: aproximadamente 5-6 GB, considerando pesos (4,9 GB) más overhead de contexto y KV cache.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090; en el ámbito profesional, A100 o H100 para despliegues concurrentes.
- Cabe en GPU de consumo: sí, en cualquier GPU con 8 GB o más de VRAM (RTX 3060 Ti, RTX 3070, RTX 4060, etc.). También puede ejecutarse en CPU con llama.cpp, aunque con latencia mucho mayor.
- Opciones de despliegue: llama.cpp (recomendado por el autor), Ollama (importando el GGUF), LM Studio, y servidores compatibles con la API de OpenAI gracias al tag `endpoints_compatible`. vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones, por lo que requerirían convertir a safetensors.
- Latencia y throughput estimados: no disponibles. Dependen fuertemente del hardware y de la longitud de contexto utilizada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| HannHamidi/Llama-3.1-8B-Instruct__project-oracle_10 | 8,03 B | 128 K (heredado) | llama3.1 | GGUF Q4_K_M | Ajuste LoRA no documentado, 0 descargas |
| unsloth/Llama-3.1-8B-Instruct | 8,03 B | 128 K | llama3.1 | safetensors | Modelo base del ajuste, sin cuantizar |
| meta-llama/Llama-3.1-8B-Instruct | 8,03 B | 128 K | llama3.1 | safetensors | Modelo oficial de Meta, con benchmarks publicados |
| Mistral-7B-Instruct-v0.3 | 7,25 B | 32 K | Apache 2.0 | safetensors, GGUF | Alternativa de tamaño similar con licencia permisiva |

## Limitaciones y advertencias

- El ajuste LoRA no está documentado: se desconoce el dataset, el objetivo y si el entrenamiento pudo degradar capacidades del modelo base (por ejemplo, tool calling o razonamiento).
- Riesgo elevado de alucinación: sin benchmarks ni evaluación, no hay garantía de que el ajuste mejore la fidelidad factual del Llama 3.1 8B Instruct original.
- Sesgos: heredados del modelo base y potencialmente amplificados por el dataset de ajuste, que no se ha hecho público.
- Idiomas: solo se declaran inglés y malayo; el rendimiento en castellano no está garantizado ni evaluado.
- Licencia llama3.1: impone restricciones de uso comercial (límite de 700 millones de usuarios mensuales, obligación de atribución y de nombrar el modelo como "Llama 3.1"), y exige cumplir la política de uso aceptable de Meta.
- Modelo con cero descargas y cero likes: sin validación por parte de la comunidad, sin issues resueltos ni mantenimiento conocido.
- Única cuantización disponible (Q4_K_M): no hay versiones Q5, Q8 o FP16 en el repositorio, lo que limita el ajuste fino de la relación calidad/tamaño.
- Fecha de creación futura (2026-11-27) en los metadatos de Hugging Face: inconsistencia que sugiere posible error de marcado o republicación; conviene verificar la integridad del repositorio antes de usarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HannHamidi/Llama-3.1-8B-Instruct__project-oracle_10-GGUF
- Modelo base: https://huggingface.co/unsloth/Llama-3.1-8B-Instruct
- Modelo oficial de Meta: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Unsloth (herramienta de conversión): https://github.com/unslothai/unsloth
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Licencia Llama 3.1: https://llama.meta.com/llama3_1/license/
