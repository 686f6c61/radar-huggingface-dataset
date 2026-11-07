# AIHeikki/brainsurged-open-jev-qwen3.5-0.8b

## Resumen

Brainsurged Open-Jev Qwen3.5-0.8B es un modelo derivado de Qwen/Qwen3.5-0.8B, desarrollado por AIHeikki, especializado en triaje de decisiones de tipo "System-1" y clasificación estructurada de baja latencia. Se distribuye principalmente como GGUF cuantizado Q4_K_M de 516,8 MiB, pensado para despliegue en el borde (edge) y en contenedores ligeros, con soporte explícito para Ollama y llama.cpp. El modelo base declara 873.438.784 parámetros, mientras que el repositorio de safetensors reporta 772.845.888 parámetros totales.

El modelo resuelve el problema de obtener decisiones estructuradas (JSON con campos como intención de compra, urgencia o equipo de destino) a partir de texto libre, con latencias de milisegundos. Para ello combina un ajuste LoRA de rango 16 sobre ejemplos sintéticos contrafactuales, una calibración posterior de temperatura inversa y un stack de servicio propio con extensiones CUDA ("Jump-Forward") sobre NVIDIA L4 en Cloud Run.

Es relevante ahora porque ejemplifica una tendencia hacia modelos pequeños y muy especializados que sustituyen a LLM grandes en tareas de enrutamiento y clasificación, reduciendo coste y latencia. No obstante, los resultados publicados por el autor muestran un rendimiento limitado en las evaluaciones internas (Jevlab), por lo que debe evaluarse con cautela antes de usarlo en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3.5-0.8B); ajuste mediante LoRA de rango 16 |
| Parámetros totales | 772.845.888 (safetensors del repo); el autor declara 873.438.784 para el modelo base |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q4_K_M (artefacto principal, 516,80 MiB); otros cuantizados GGUF no documentados |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (principal), safetensors (parches delta quirúrgicos/LoRA en `patches_and_attestations/`) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-0.8B, un transformer decoder-only de aproximadamente 0,8 mil millones de parámetros. Sobre esa base se aplica un ajuste LoRA de rango 16 con 9,34 millones de escalares de adaptador (1,083 % del total), entrenado durante 2 épocas y 166 pasos de AdamW sobre 1.320 ejemplos sintéticos contrafactuales de estado/objetivo. La fase LoRA del modelo 0.8B duró 5,4 minutos dentro de una campaña de 33,2 minutos ejecutada en una NVIDIA A100-40GB spot. El autor indica que no se encontraron coincidencias exactas de cadena frente a 214 cadenas de retención, aunque aclara que esto no constituye una auditoría semántica ni de contaminación de preentrenamiento.

Tras el LoRA se aplica una calibración "Zero-Gradient Roof" con `torch.set_grad_enabled(False)`, que consiste en escalado de temperatura inversa (`beta_temp = 0.85`) y verificación de bucles `<think>` (0,0 % de bucles no cerrados en las comprobaciones de calibración). El despliegue de referencia usa un stack propio (`serving_v5/`) con una biblioteca CUDA (`libjev_jump.so`) y un gateway en Python (`fast_gateway.py`), además de un Dockerfile que embebe los GGUF de 0.8B y 4B. No se documentan detalles sobre la composición del corpus de preentrenamiento del modelo base ni sobre el uso de RLHF o DPO.

## Capacidades

- Generación de texto conversacional y clasificación de intenciones en formato estructurado.
- Salida JSON constreñida mediante `response_format: json_schema` en llama.cpp/llama-server.
- Soporte de modo "thinking" desactivable por petición (`enable_thinking: false`) y `--reasoning-budget 0` en llama-server.
- Triaje de decisión de un solo paso ("System-1") y micro-blink triage.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente multi-paso: no disponibles; el modelo está orientado a decisiones de un solo paso.
- Capacidades multilingües: no disponibles.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Triaje de atención al cliente: el modelo recibe el texto de una reclamación y devuelve un JSON con intención de compra, urgencia y equipo de destino (ventas, soporte, facturación u otro), tal como se muestra en el ejemplo de llamada constreñida de la model card.
- Enrutamiento de tickets en mesas de ayuda: clasificación de mensajes entrantes en categorías cerradas con latencia de decenas de milisegundos, adecuada para prefiltrar antes de un LLM mayor.
- Detección de riesgo de cancelación: identificación de amenazas de baja o solicitudes de reembolso urgente para escalar a un agente humano.
- Clasificación de facturación y disputas: extracción de señales como facturas duplicadas o solicitudes de reembolso en un esquema JSON estricto.
- Despliegue en el borde y dispositivos con recursos limitados: el GGUF Q4_K_M de 516,8 MiB permite ejecución local con Ollama o llama.cpp en hardware modesto.
- Gateway de decisión de baja latencia en Cloud Run: el stack `serving_v5` con NVIDIA L4 reporta 32,1 ms p50 en el motor de gateway y 90,1 ms de latencia media WAN para clientes, según el autor.
- Prefiltro en pipelines de agentes: decisión rápida de si un mensaje requiere razonamiento profundo o puede resolverse con una respuesta plantilla.

## Benchmarks y rendimiento

Los únicos datos disponibles son las evaluaciones internas de Jevlab del autor sobre Cloud Run con NVIDIA L4 y el GGUF Q4_K_M. No son benchmarks estándar (MMLU, HumanEval, GSM8K) y no deben compararse directamente con resultados públicos de otros modelos.

| Modelo / Stack | Customer (36) | Business (24: Rev/Trust/Spend) | Subtotal un paso (60) | Rescue 60 pasos (3) | Latencia media E2E cliente (p50 motor) |
|---|---|---|---|---|---|
| Jev 1.13.0 (API alojada nativa) | 36/36 | 24/24 (8/8/8) | 60/60 (100,0 %) | 2/3 | 180,5 ms (no expuesto) |
| 0.8B v1 (cirugía Roof 0-grad, 0,0127 %) | 23/36 | 9/24 (2/4/3) | 32/60 (53,3 %) | 0/3 | 299,9 ms (stack antiguo) |
| 0.8B v3 (Roof 0-grad 3 fases, 0,0222 %) | 21/36 | 8/24 (2/3/3) | 29/60 (48,3 %) | no disponible en el extracto | no disponible |
| 0.8B v4 (artefacto principal) | no disponible en el extracto | no disponible en el extracto | no disponible en el extracto | no disponible en el extracto | 32,1 ms p50 motor / 90,1 ms WAN cliente |

El modelo companion de 4B reporta 36/36 en Customer, 22/24 en Business y 2/3 en Rescue sobre Jevlab congelado. No se han publicado resultados de benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB con Q4_K_M (516,8 MiB de pesos más overhead de contexto y KV cache); el contexto efectivo no está documentado.
- GPU recomendadas: NVIDIA L4 (usada por el autor en Cloud Run), A100-40GB (usada para el entrenamiento LoRA); cualquier GPU consumer con al menos 2 GB de VRAM debería bastar para Q4_K_M.
- Cabe en GPU consumer: sí, en tarjetas de gama baja como GTX 1650, RTX 3050 o superiores; también es viable en CPU.
- Opciones de despliegue: Ollama (`ollama run hf.co/AIHeikki/brainsurged-open-jev-qwen3.5-0.8b`), llama.cpp/llama-server con `--gpu-layers 99 --flash-attn on --jinja --reasoning-budget 0`, y el stack propio `serving_v5` (Docker con `libjev_jump.so` y `fast_gateway.py`).
- Latencia y throughput: 32,1 ms p50 en el motor de gateway y 90,1 ms de latencia media WAN para clientes, medidos en Cloud Run con NVIDIA L4 y el stack `serving_v5`; no son cifras de Ollama ni de dispositivos locales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Brainsurged Open-Jev Qwen3.5-0.8B (este) | 772,8 M (repo) / 873,4 M (base declarado) | no disponible | 53,3 % (v1) y 48,3 % (v3) en subtotal Jevlab de 60 ítems; v4 sin datos en el extracto | Apache-2.0 | Hugging Face, GGUF + safetensors |
| Qwen/Qwen3.5-0.8B (base) | 873,4 M | no disponible | no disponible | Apache-2.0 | Hugging Face |
| joyfox/Qwen3.5-0.8B-JEV | derivado de Qwen3.5-0.8B | no disponible | no disponible | no disponible | Hugging Face; cabecera de decisión query/key en `head.safetensors` |
| AIHeikki/brainsurged-open-jev-qwen3.5-4b (companion) | no disponible | no disponible | 36/36 Customer, 22/24 Business, 2/3 Rescue en Jevlab | Apache-2.0 (según repo del 0.8B) | Hugging Face |

## Limitaciones y advertencias

- Los resultados de Jevlab son evaluaciones internas del autor, no benchmarks estándar; el subtotal de un solo paso del 0.8B en las versiones v1 y v3 se sitúa en torno al 48-53 %, muy por debajo del 100 % del sistema Jev 1.13.0.
- No hay datos publicados sobre sesgos, alucinación o comportamiento fuera del dominio de triaje; el ajuste se hizo con 1.320 ejemplos sintéticos, lo que limita la generalización.
- El autor aclara que la comprobación de solapamiento con 214 cadenas de retención no constituye una auditoría semántica ni de contaminación de preentrenamiento.
- Longitud de contexto e idiomas soportados no están documentados; no se debe asumir cobertura multilingüe.
- Las latencias de 32,1 ms y 90,1 ms corresponden al stack propietario `serving_v5` en Cloud Run con NVIDIA L4, no a Ollama ni a llama.cpp estándar.
- El modelo está orientado a decisiones de un solo paso; no se documentan capacidades de agente multi-paso, tool calling ni visión.
- Licencia Apache-2.0 permite uso comercial, pero el modelo base y los artefactos derivados deben verificarse por separado; el repo mezcla parches safetensors y binarios GGUF con hashes específicos.
- El número de descargas y likes es 0 en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AIHeikki/brainsurged-open-jev-qwen3.5-0.8b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Colección Qwen3.5: https://huggingface.co/collections/Qwen/qwen35
- Modelo companion 4B: https://huggingface.co/AIHeikki/brainsurged-open-jev-qwen3.5-4b
- Modelo relacionado joyfox/Qwen3.5-0.8B-JEV: https://huggingface.co/joyfox/Qwen3.5-0.8B-JEV
- Parches y atestaciones (dentro del repo): `patches_and_attestations/`
- Stack de servicio v5 (dentro del repo): `serving_v5/README.md`
- Informes de evaluación Jevlab (dentro del repo): `reports/jevlab_evaluations/`
