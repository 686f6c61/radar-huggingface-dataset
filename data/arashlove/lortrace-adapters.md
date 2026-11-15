# arashlove/lortrace-adapters

## Resumen

LORTrace adapters es una colección de nueve adaptadores LoRA entrenados por Arash Karimadini (usuario `arashlove` en Hugging Face) para detección de anomalías en series temporales del mercado eléctrico australiano. Los adaptadores se ajustan sobre nueve modelos base distintos, desde SmolLM2-135M hasta Mistral-7B-v0.3 y Cosmos-Reason1-7B, mediante predicción de siguiente token no supervisada sobre ventanas serializadas del mercado AEMO NSW1. Replican exactamente los adaptadores que generaron los resultados de anomalías publicados en el proyecto LORTrace.

El repositorio no contiene modelos completos, sino pesos PEFT (LoRA r=16) más el tokenizer correspondiente; cada adaptador descarga automáticamente su modelo base desde el Hub al cargarse. El tamaño total del repositorio es de 0,8 GB, coherente con nueve conjuntos de adaptadores pequeños. El proyecto se orienta a investigadores y desarrolladores que quieran reproducir o reutilizar la técnica de detección de anomalías en series temporales mediante modelos de lenguaje.

La relevancia radica en el enfoque: en lugar de arquitecturas específicas de series temporales, se serializan ventanas de datos de mercado y se usan LLMs con LoRA para la predicción. La colección incluye tanto modelos con licencia Apache-2.0 como adaptadores derivados de Gemma (Gemma Terms of Use) y de NVIDIA Cosmos-Reason1-7B (NVIDIA Open Model License), por lo que la licencia es mixta y hereda las restricciones de cada modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre modelos transformer base (SmolLM2, Gemma, Qwen2.5, SmolLM, Mistral, Cosmos-Reason1) |
| Parámetros totales | No disponible (depende del modelo base; rango de 135M a 7B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 4096 tokens (longitud máxima de secuencia de entrenamiento) |
| Tipos de cuantización | Base en 4-bit (bnb-4bit, formato UnsloTH); adaptadores en safetensors |
| Idiomas soportados | No disponibles |
| Licencia | Mixta: Apache-2.0 (SmolLM2, Qwen2.5, SmolLM, Mistral), Gemma Terms of Use (gemma-3-270m, gemma-2-2b), NVIDIA Open Model License (Cosmos-Reason1-7B) |
| Formato de pesos | PEFT adapter en safetensors + tokenizer; modelo base descargado desde el Hub |

## Arquitectura y entrenamiento

Cada adaptador es un LoRA con rango 16, alpha 16 y dropout 0, aplicado a las proyecciones `q, k, v, o, gate, up, down_proj`. El modelo base se mantiene en cuantización 4-bit (variantes `unsloth/*-bnb-4bit`), con longitud máxima de secuencia 4096 tokens. El entrenamiento usó 20.000 ventanas del mercado AEMO NSW1 entre 2015 y 2021, sin filtrado basado en LOR, con semilla 3407, 300 pasos, learning rate 2e-4 con schedule lineal, 5 pasos de warm-up, weight decay 1e-3, AdamW de 8 bits y batch efectivo de 8.

El objetivo es predictivo no supervisado: predicción del siguiente token sobre las ventanas serializadas, de modo que las anomalías se detectan por elevada perplejidad o error de predicción. No se menciona RLHF ni DPO. No hay innovaciones de decodificación especulativa ni atención lineal; la innovación es el uso de LLMs como detector de anomalías por serialización de series temporales. Los adaptadores de Mistral-7B no conservan su `training_metrics.json`.

## Capacidades

- Detección de anomalías en series temporales del mercado eléctrico (AEMO NSW1) mediante predicción de siguiente token sobre ventanas serializadas.
- Reproducción de los scores de anomalías publicados en el proyecto LORTrace (modo `rescore`).
- Nueve variantes con distintos compromisos tamaño/rendimiento (de 135M a 7B parámetros) para elegir según recursos.
- Predicción de siguiente token sobre texto serializado de datos de mercado.
- Fine-tuning adicional posible al ser adaptadores PEFT (se puede reentrenar sobre otros backbones).
- No se documenta soporte de tool calling, function calling, agentes ni visión; el uso previsto es análisis de series temporales.
- Capacidades multilingües no disponibles.

## Casos de uso

- Investigación en detección de anomalías: usar los adaptadores como línea base para comparar métodos de detección sobre ventanas del mercado NSW1, cargando el backbone correspondiente.
- Reproducción de resultados: ejecutar `scripts/reproduce.py --mode rescore` para regenerar los scores publicados y validar el pipeline.
- Prototipado con modelos pequeños: SmolLM2-135M o gemma-3-270m permiten probar el enfoque en hardware modesto antes de escalar a los backbones de 1.5B–7B.
- Despliegue ligero en producción: los adaptadores de 135M–360M pueden ejecutarse en CPU o GPU consumer para monitorización de series con presupuesto reducido.
- Extensión a otros mercados eléctricos: reentrenar los adaptadores LoRA sobre ventanas serializadas de otros mercados o periodos, aprovechando que el pipeline PEFT es reutilizable.
- Comparativa de backbones: evaluar cómo varía la calidad de detección entre familias (SmolLM, Qwen, Mistral, Gemma, Cosmos) con la misma configuración de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona "published anomaly scores" y un `training_metrics.json` por carpeta (excepto Mistral-7B), pero no se proporcionan cifras en la información facilitada.

## Requisitos de hardware

- VRAM estimada: depende del backbone. SmolLM2-135M y gemma-3-270m caben en menos de 2 GB en 4-bit; Qwen2.5-0.5B y SmolLM2-360M en torno a 2–4 GB; Qwen2.5-1.5B y SmolLM-1.7B en torno a 3–6 GB; gemma-2-2b en torno a 4–6 GB; Mistral-7B y Cosmos-Reason1-7B en torno a 8–12 GB en 4-bit.
- GPU recomendadas: los backbones de 7B en 4-bit requieren al menos 12 GB (RTX 4090, A100, H100); los de 135M–2B funcionan en GPUs consumer (RTX 3060/4070 o superiores).
- Consumer GPU: sí para SmolLM2-135M (incluso CPU), gemma-3-270m, SmolLM2-360M, Qwen2.5-0.5B, Qwen2.5-1.5B, SmolLM-1.7B y gemma-2-2b; los de 7B requieren GPU de 12 GB o más.
- Despliegue: PEFT con PyTorch/Transformers, carga vía `adapter_config.json` y `scripts/download_assets.py --weights`; sin documentación específica de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Aspecto | LORTrace adapters | Modelos específicos de anomalías (no disponible) | LLMs base sin adaptar |
|---|---|---|---|
| Parámetros | 135M–7B según backbone | No disponible | 135M–7B |
| Contexto | 4096 tokens | No disponible | Varía por base |
| Enfoque | LoRA para series temporales por predicción de tokens | No disponible | Generación de texto general |
| Licencia | Mixta (Apache-2.0, Gemma, NVIDIA) | No disponible | Según base |
| Disponibilidad | Hugging Face (pesos PEFT) | No disponible | Hugging Face |

No se dispone de comparativas cuantitativas con otros detectores de anomalías ni con los backbones sin adaptar en la información proporcionada.

## Limitaciones y advertencias

- Licencia mixta: los adaptadores derivados de Gemma están sujetos a Gemma Terms of Use, con restricciones de uso; los de Cosmos-Reason1-7B a la NVIDIA Open Model License; el uso comercial requiere revisar cada licencia base.
- El temario está limitado al mercado AEMO NSW1 (2015–2021); el rendimiento fuera de ese dominio no está validado.
- No hay información sobre sesgos, idiomas ni alucinación; al ser un detector de anomalías por perplejidad, un umbral mal calibrado puede generar falsos positivos o negativos.
- Los adaptadores de Mistral-7B no incluyen `training_metrics.json`, lo que dificulta la auditoría del entrenamiento.
- Los adaptadores no son modelos completos: sin el backbone correspondiente no funcionan, y la licencia final depende de ambos.
- No se documentan la licencia de uso comercial específica ni el pipeline de despliegue en producción más allá de los scripts del repositorio.
- Los datos de entrenamiento (`arashlove/aemo-nem-lor`, CC BY 4.0) exigen citación si se usan los adaptadores.

## Enlaces

- Hugging Face: https://huggingface.co/arashlove/lortrace-adapters
- Repositorio GitHub LORTrace: https://github.com/arashlove/LORTrace
- Dataset AEMO NEM LOR: https://huggingface.co/datasets/arashlove/aemo-nem-lor
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- README de licencia: https://huggingface.co/arashlove/lortrace-adapters/blob/main/README.md
