# openmuse/Llama-3.2-1B-RegMix-MT-r2006-seed123

## Resumen

Llama-3.2-1B-RegMix-MT-r2006-seed123 es un ajuste fino completo (full fine-tuning) del modelo base meta-llama/Llama-3.2-1B, publicado por el usuario openmuse en Hugging Face. Se ha entrenado mediante Llama Factory sobre un dataset denominado internamente "sample_r2006", con 250 pasos de entrenamiento y aproximadamente 1.044 millones de tokens de entrada procesados. El modelo conserva la arquitectura y el tokenizador originales de Llama 3.2 1B, por lo que es compatible con el ecosistema transformers y con text-generation-inference.

El interés de esta ficha es limitado pero relevante como artefacto de referencia: se trata de un experimento de ajuste fino reproducible (semilla 123, hiperparametros documentados) sobre un modelo pequeno de 1.500 millones de parametros. La model card generada automaticamente no describe el dataset de entrenamiento ni los usos previstos, y no se han publicado resultados de benchmarks. La licencia heredada es la Llama 3.2 Community License, con las restricciones habituales de Meta para uso comercial y redistribucion.

Por su tamano, el modelo es adecuado para escenarios de inferencia en hardware de consumo y para experimentacion con tecnicas de ajuste fino. No obstante, la ausencia de documentacion sobre el dataset y de evaluaciones formales hace que no sea recomendable para produccion sin una validacion previa por parte del equipo que lo adopte.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.2) |
| Parametros totales | 1.498.482.688 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Llama 3.2 1B) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos en safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | llama3.2 (Llama 3.2 Community License) |
| Formato de pesos | safetensors |
| Modelo base | meta-llama/Llama-3.2-1B |
| Framework de entrenamiento | Llama Factory (Transformers 4.51.0, PyTorch 2.7.1+cu128) |
| Tamano del repositorio | 3.0 GB |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo (no LoRA ni QLoRA) del checkpoint meta-llama/Llama-3.2-1B, que emplea una arquitectura transformer decoder-only con normalizacion RMSNorm, activacion SwiGLU, embeddings rotatorios (RoPE) y atencion causal estandar. No se introduce ninguna modificacion arquitectonica respecto al modelo base; los pesos se han actualizado integramente durante el entrenamiento.

Los hiperparametros documentados son: learning rate 2e-05 con scheduler lineal, batch total de 2048 (batch de 8 por dispositivo en 4 GPUs con 64 pasos de acumulacion de gradientes), optimizador AdamW (betas 0.9/0.999, epsilon 1e-08), 250 pasos de entrenamiento y semilla 123. Se procesaron 1.044.395.776 tokens de entrada. La perdida de validacion se estabiliza alrededor de 1,2662 tras el paso 250, con una perdida de entrenamiento que desciende de 2,0729 a 2,0183. El dataset de entrenamiento ("sample_r2006") no esta descrito en la model card, y no se documenta el uso de RLHF, DPO ni tecnicas de alineacion adicionales.

## Capacidades

- Generacion de texto conversacional: el modelo esta etiquetado como "conversational" y entrenado con Llama Factory, lo que sugiere formato de chat, aunque la model card no detalla la plantilla aplicada.
- Generacion de texto general: pipeline text-generation estandar de transformers.
- Compatibilidad con text-generation-inference y endpoints compatibles, segun los tags del repositorio.
- Soporte de tool calling / function calling: no documentado en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado; el modelo base de 1B tiene capacidades limitadas en este terreno.
- Capacidades multilingues: no documentadas; los idiomas soportados figuran como no disponibles.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Experimentacion academica con ajuste fino: el modelo sirve como referencia reproducible para estudiar el efecto de un full fine-tuning de 250 pasos sobre Llama 3.2 1B, con hiperparametros y curvas de perdida documentados.
- Prototipado rapido de asistentes conversacionales: al ser un modelo de 1,5B parametros, puede desplegarse en una sola GPU de consumo para validar flujos de chat antes de escalar a modelos mayores.
- Generacion de texto en entornos con recursos limitados: su tamano permite inferencia en GPUs de 8-16 GB con cuantizacion, adecuado para demos y entornos de desarrollo.
- Evaluacion comparativa de tecnicas de ajuste: util como punto de partida para comparar contra variantes con LoRA o QLoRA sobre el mismo dataset y semilla.
- Filtrado y clasificacion de texto ligera: con el ajuste adecuado, puede emplearse en tareas de etiquetado o resumen de documentos cortos en pipelines de bajo coste.
- Base para posteriores ajustes especificos: al ser un checkpoint completo, puede servir como punto de partida para nuevos fine-tunings sobre dominios concretos, siempre que se valide antes su calidad.

## Benchmarks y rendimiento

La model card declara un model-index con el nombre "sample_1B_r2006_seed123" pero sin resultados asociados. Los unicos datos de evaluacion disponibles son las metricas de entrenamiento:

| Metrica | Valor |
|---|---|
| Perdida de validacion final | 1,2662 |
| Perdida de entrenamiento final | 2,0183 |
| Tokens de entrada vistos | 1.044.395.776 |
| Pasos de entrenamiento | 250 |

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 3 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, entre 4 y 6 GB para contextos cortos.
- VRAM estimada con cuantizacion de 8 bits: alrededor de 1,5-2 GB para pesos.
- VRAM estimada con cuantizacion de 4 bits: alrededor de 1 GB para pesos.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp16 (RTX 3060 Ti, RTX 4060, RTX 4070, A10, L4). Para cuantizacion 4 bits, es viable en GPUs de 4-6 GB.
- Cabe en GPU de consumo: si, en la mayoria de GPUs modernas de gama media.
- Opciones de despliegue: transformers (nativo), text-generation-inference (soportado segun tags), vLLM, llama.cpp y Ollama previa conversion a GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| openmuse/Llama-3.2-1B-RegMix-MT-r2006-seed123 | 1,5B | no disponible | llama3.2 | Hugging Face | Ajuste fino sin benchmarks publicados |
| meta-llama/Llama-3.2-1B | 1,2B | 128k (segun model card oficial de Meta) | llama3.2 | Hugging Face | Modelo base, evaluado oficialmente |
| meta-llama/Llama-3.2-1B-Instruct | 1,2B | 128k (segun model card oficial de Meta) | llama3.2 | Hugging Face | Variante alineada para instrucciones |
| Qwen2.5-1.5B | 1,5B | 32k (segun model card oficial) | Apache 2.0 | Hugging Face | Alternativa con licencia permisiva |

La comparativa se limita a datos publicos de los modelos base; no hay informacion que permita comparar el rendimiento del ajuste fino de openmuse con estas alternativas.

## Limitaciones y advertencias

- Ausencia de documentacion del dataset: la model card no describe "sample_r2006", por lo que se desconoce la composicion, procedencia y posibles sesgos de los datos de entrenamiento.
- Sin benchmarks publicados: no hay evidencia cuantitativa de mejora respecto al modelo base ni de calidad en tareas concretas.
- Riesgo de alucinacion: inherente a los modelos de 1B parametros; no se ha evaluado su tasa de alucinacion.
- Limitaciones de contexto e idioma: no documentadas; se heredan del modelo base, pero no se confirma que el ajuste fino las preserve.
- Licencia Llama 3.2: restricciones de uso comercial, obligacion de atribucion ("Built with Llama") y limitaciones de redistribucion segun los terminos de Meta.
- Modelo de investigacion: la ausencia de evaluacion formal y de descripcion de usos previstos desaconseja su uso en produccion sin validacion previa.
- Fecha de publicacion futura (2026-11-27) en los metadatos de Hugging Face, lo que puede indicar un artefacto de prueba o un repositorio en estado preliminar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/openmuse/Llama-3.2-1B-RegMix-MT-r2006-seed123
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B
- Llama Factory (framework de entrenamiento): https://github.com/hiyouga/LLaMA-Factory
- Licencia Llama 3.2: https://www.llama.com/llama3_2/license/
- Documentacion de transformers: https://huggingface.co/docs/transformers
- Text-generation-inference: https://github.com/huggingface/text-generation-inference
