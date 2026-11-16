# adityaxess/OmniCore-7B-R1

## Resumen

OmniCore-7B-R1 es un ajuste fino (finetune) del modelo base adityaxess/OmniCore-7B-Base, publicado por el usuario adityaxess en Hugging Face. Se trata de un modelo de generación de texto de 7.615.616.512 parámetros (aproximadamente 7,6 mil millones) construido sobre la arquitectura Qwen2, según indican las etiquetas del repositorio. El modelo se distribuye bajo licencia Apache 2.0 y está orientado a uso conversacional en inglés.

El entrenamiento se realizó con la librería Unsloth junto con TRL de Hugging Face, lo que según la model card permitió un entrenamiento "2x más rápido". No obstante, la información publicada es extremadamente escasa: no se detallan los datos de entrenamiento, el número de tokens, la composición del dataset ni si hubo fases de RLHF o DPO. Tampoco se especifican la longitud de contexto, los idiomas soportados más allá del inglés ni los formatos de cuantización disponibles.

La relevancia de este modelo es limitada en el momento de redactar esta ficha: cuenta con 0 descargas y 0 likes, y la model card es prácticamente una plantilla autogenerada por Unsloth. Se trata, por tanto, de un modelo experimental o de un ajuste fino personal sin validación pública, benchmarks ni documentación técnica sustancial. Cualquier evaluación de su calidad debe hacerse con cautela y mediante pruebas propias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2 (transformer decoder-only, según etiqueta `qwen2`) |
| Parametros totales | 7.615.616.512 (7,6 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repo contiene safetensors; no se publican GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 15,2 GB) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2, un transformer decoder-only con atención causal estándar, según la etiqueta `qwen2` del repositorio. Al ser un finetune de OmniCore-7B-Base, hereda la arquitectura y los pesos preentrenados de dicho modelo base, aunque no se publica información sobre la configuración exacta (número de capas, dimensiones ocultas, número de cabezas de atención, uso de GQA o RoPE).

El ajuste fino se realizó con Unsloth y la librería TRL de Hugging Face, lo que sugiere un entrenamiento supervisado (SFT) con posible uso de LoRA o QLoRA, aunque esto no se confirma en la model card. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO. Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional en inglés, según la etiqueta `conversational`.
- Compatible con `text-generation-inference` (TGI) y con la librería `transformers`.
- Etiquetado como `endpoints_compatible`, lo que indica compatibilidad con los endpoints de Hugging Face.
- No se documentan capacidades de razonamiento avanzado, código, matemáticas, visión, audio ni tool calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: solo inglés declarado; no se especifican otros idiomas.
- No se documenta modo "thinking" ni capacidades especiales adicionales.

## Casos de uso

- Prototipado conversacional en inglés: el modelo puede usarse para experimentar con chatbots de dominio general en entornos de desarrollo, dado que es un finetune conversacional sobre Qwen2 y se integra con `transformers` y TGI.
- Evaluación de ajustes finos propios: sirve como referencia para comparar con otros finetunes del mismo modelo base (OmniCore-7B-Base) en tareas de generación de texto.
- Despliegue en endpoints de Hugging Face: al ser `endpoints_compatible`, puede desplegarse en Inference Endpoints para pruebas de latencia y calidad sin infraestructura propia.
- Generación de texto asistida en pipelines de investigación: útil para tareas de completado de texto o generación de respuestas en inglés dentro de experimentos académicos, siempre con validación manual.
- Base para nuevos ajustes finos: al estar bajo Apache 2.0 y en formato safetensors, puede reutilizarse como punto de partida para SFT con Unsloth o TRL en dominios específicos.
- Pruebas de integración con TGI: permite validar pipelines de serving (TGI, `transformers`) antes de migrar a modelos más grandes o con mayor soporte documental.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 15,2 GB solo para pesos, más overhead de activaciones y KV cache (estimación típica de 16-20 GB según longitud de contexto).
- VRAM estimada en cuantización de 8 bits: alrededor de 8 GB para pesos; en 4 bits, alrededor de 4-5 GB (estimaciones orientativas, no publicadas por el autor).
- GPU recomendadas para FP16: A100 40 GB, H100, L40S o RTX 4090 (24 GB) para contexto moderado.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en FP16 con contexto limitado, y en GPUs de 8-12 GB si se cuantiza a 8 o 4 bits.
- Opciones de despliegue: `transformers`, TGI (etiqueta `text-generation-inference`) y endpoints de Hugging Face. No se publican archivos GGUF, por lo que llama.cpp u Ollama requerirían conversión manual.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| OmniCore-7B-R1 | 7,6 B | No disponible | Apache 2.0 | Hugging Face (0 descargas) | Finetune conversacional sobre Qwen2, sin benchmarks |
| Qwen2-7B-Instruct | 7,6 B | 32.768 tokens (según documentación pública de Qwen2) | Apache 2.0 | Hugging Face, muy extendido | Modelo oficial con benchmarks y amplio soporte |
| Mistral-7B-Instruct | 7,2 B | 32.768 tokens (según documentación pública) | Apache 2.0 | Hugging Face, muy extendido | Alternativa popular con ecosistema maduro |
| Llama 3.1 8B Instruct | 8 B | 128.000 tokens (según documentación pública) | Llama 3.1 Community License | Hugging Face, muy extendido | Requiere aceptar licencia; buen rendimiento general |

Nota: los datos de contexto y licencia de los modelos comparativos provienen de su documentación pública habitual; no se dispone de benchmarks de OmniCore-7B-R1 para comparar rendimiento.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia pública de calidad, por lo que no debe asumirse un rendimiento comparable al Qwen2 original.
- Model card mínima: no se documentan datos de entrenamiento, hiperparámetros, contexto ni proceso de alineación, lo que dificulta la reproducibilidad.
- Riesgo de alucinación: al ser un finetune sin evaluación publicada, el riesgo de respuestas incorrectas o inventadas es alto y no está cuantificado.
- Idioma: solo se declara inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Sesgos: no se documenta ningún análisis de sesgos; al heredar el modelo base, puede reproducir sesgos presentes en sus datos de preentrenamiento.
- Licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene verificar la licencia del modelo base OmniCore-7B-Base antes de producción.
- Madurez: 0 descargas y 0 likes indican ausencia de validación por la comunidad; no se recomienda su uso en producción sin evaluación exhaustiva.
- Contexto desconocido: no se puede planificar su uso en tareas de contexto largo sin verificar experimentalmente la ventana real.

## Enlaces

- Hugging Face: https://huggingface.co/adityaxess/OmniCore-7B-R1
- Modelo base: https://huggingface.co/adityaxess/OmniCore-7B-Base
- Unsloth (librería de entrenamiento): https://github.com/unslothai/unsloth
- TRL de Hugging Face: https://github.com/huggingface/trl
- Documentación de Qwen2: https://huggingface.co/docs/transformers/model_doc/qwen2
