# enmingzhangzz/Qwen2.5-VL-7B-OPSD-VisionZip-r010-Btop50-absFbottom50-lambda05-gap01-10240

## Resumen

Este repositorio contiene un adaptador LoRA (PEFT) resultado de un experimento de investigación sobre eficiencia en modelos multimodales. El adaptador se entrena sobre el modelo base `Qwen/Qwen2.5-VL-7B-Instruct` (un modelo de visión-lenguaje de 7 mil millones de parámetros) utilizando la técnica OPSD (Online Preference-based Self-Distillation) combinada con el método de poda de tokens visuales VisionZip. El objetivo es reducir drásticamente el número de tokens visuales procesados durante la inferencia (retención del 10 %) manteniendo la calidad del razonamiento, lo que permite acelerar la generación y reducir el coste computacional.

El adaptador se ha entrenado con 10 240 muestras del dataset `OpenMMReasoner/OpenMMReasoner-SFT-874K`, un conjunto de razonamiento multimodal con cadenas de pensamiento. La variante concreta implementa una estrategia de agrupación ponderada top-B/bottom-|F| con intervención sobre el presupuesto de tokens. Es un artefacto de investigación, no un modelo de producción, y requiere el parche de runtime de VisionZip para funcionar con inferencia podada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen2.5-VL-7B-Instruct (transformer multimodal) |
| Parametros totales | No disponible (el adaptador LoRA tiene r=16, alpha=32; el modelo base tiene 7B) |
| Parametros activos | No disponible (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base, no especificada en la documentacion) |
| Tipos de cuantizacion | No disponible (solo safetensors del adaptador) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors (adapter_model.safetensors) |

## Arquitectura y entrenamiento

El adaptador se construye sobre `Qwen/Qwen2.5-VL-7B-Instruct`, un modelo de visión-lenguaje basado en transformer con mecanismos de atención multimodal. El entrenamiento emplea OPSD, una técnica de auto-destilación con preferencias que utiliza un profesor EMA (decay 0.9999) para guiar al estudiante. La poda de tokens visuales se realiza con VisionZip, que selecciona un subconjunto de tokens de imagen (ratio de retención 0.1) para reducir la carga computacional.

El dataset de entrenamiento es `OpenMMReasoner/OpenMMReasoner-SFT-874K`, del que se usan 10 240 muestras con prefijos exactos de cadenas de razonamiento. El lote global es de 32 (4 GPUs × micro-batch 2 × acumulación 4). La configuración de agrupación es `token_budget_jsd_top50_abs_f_bottom50_grouped`, con una intervención B/B+ de 0.01 (ratio de retención absoluto), fracción de candidatos top-B de 0.5, fracción bottom-|F| dentro de top-B de 0.5 y lambda de agregación 0.5. El adaptador final se guarda en el paso 10240.

## Capacidades

- Comprensión de imágenes y texto: al heredar las capacidades de Qwen2.5-VL-7B-Instruct, el adaptador puede procesar entradas multimodales (imagen + texto) y generar respuestas textuales.
- Razonamiento con cadenas de pensamiento: entrenado específicamente sobre datos de razonamiento multimodal (CoT), está optimizado para tareas que requieren pasos de razonamiento explícitos.
- Inferencia eficiente con poda de tokens visuales: gracias a VisionZip, reduce el número de tokens visuales al 10 %, lo que acelera la inferencia y reduce el uso de memoria.
- Tool calling y funciones: no se menciona soporte específico; depende del modelo base, pero no está documentado en este adaptador.
- Multilingüismo: no se especifican idiomas; el modelo base Qwen2.5-VL soporta múltiples idiomas, pero no se confirma para este adaptador.

## Casos de uso

- Investigación en eficiencia multimodal: ideal para experimentos que evalúen el impacto de la poda de tokens visuales en tareas de razonamiento visual, como VQA o captioning.
- Prototipado de sistemas de razonamiento visual con restricciones de latencia: al reducir tokens visuales, puede desplegarse en entornos con recursos limitados (edge, GPUs consumer) manteniendo un rendimiento razonable.
- Fine-tuning adicional sobre dominios específicos: al ser un adaptador LoRA, puede combinarse con otros adaptadores o ajustarse con nuevos datos para tareas concretas de razonamiento multimodal.
- Evaluación de métodos de auto-destilación (OPSD): sirve como punto de comparación para estudiar la efectividad de la destilación con preferencias en modelos de visión-lenguaje.
- Desarrollo de agentes multimodales con presupuesto de tokens reducido: útil en pipelines donde el coste de procesamiento de imágenes es crítico, como chatbots con entrada de imágenes en tiempo real.
- Benchmarking de técnicas de compresión de tokens: permite medir la degradación de rendimiento frente a modelos sin poda, estableciendo una línea base para futuras optimizaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador en sí es ligero (0.2 GB), pero requiere cargar el modelo base Qwen2.5-VL-7B-Instruct completo, que necesita aproximadamente 14-16 GB de VRAM en FP16.
- Con cuantización 4-bit (GPTQ o AWQ) del modelo base, podría caber en GPUs consumer de 8-12 GB, como RTX 3060/3080/4070, aunque no se especifica compatibilidad.
- Para inferencia con poda VisionZip, se necesita aplicar el parche de runtime correspondiente; el adaptador no funciona sin él.
- Opciones de despliegue: PEFT (transformers), vLLM (si se integra el parche), llama.cpp (con conversión a GGUF, no documentado), o servicios como FriendliAI que ya ofrecen despliegue del modelo.
- Latencia y throughput: no disponibles; dependen del hardware y de la configuración de poda.

## Comparativa con modelos similares

Existen otras variantes del mismo experimento OPSD con VisionZip, como `enmingzhangzz/Qwen2.5-VL-7B-OPSD-VisionZip-r010-balanced-10240` y `enmingzhangzz/Qwen2.5-VL-7B-OPSD-official-VisionZip-r010-10240`. Todas comparten base y técnica, pero difieren en la estrategia de agrupación de tokens (balanced vs. top-B/bottom-|F| vs. oficial). No se dispone de datos comparativos de rendimiento entre ellas. Frente a otros modelos multimodales de 7B (p. ej., LLaVA-NeXT, InternVL), este adaptador no ofrece métricas públicas, por lo que la comparación no es posible.

## Limitaciones y advertencias

- Es un adaptador de investigación, no un modelo de producción; no se garantiza robustez en escenarios reales.
- Requiere el parche de runtime de VisionZip para la inferencia podada; sin él, el adaptador no puede aplicarse correctamente.
- El entrenamiento se realizó con solo 10 240 muestras, lo que puede limitar la generalización a dominios fuera del dataset.
- No se especifican sesgos, pero al derivar de un dataset de razonamiento, puede heredar sesgos presentes en los datos de entrenamiento.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se han realizado evaluaciones de seguridad específicas.
- Licencia no disponible: no se puede determinar si el uso comercial está permitido; se recomienda contactar al autor.
- La fecha de creación (2026) sugiere que es un artefacto reciente, posiblemente en fase experimental.

## Enlaces

- HuggingFace: https://huggingface.co/enmingzhangzz/Qwen2.5-VL-7B-OPSD-VisionZip-r010-Btop50-absFbottom50-lambda05-gap01-10240
- Variante balanced: https://huggingface.co/enmingzhangzz/Qwen2.5-VL-7B-OPSD-VisionZip-r010-balanced-10240
- Variante official: https://huggingface.co/enmingzhangzz/Qwen2.5-VL-7B-OPSD-official-VisionZip-r010-10240
- Despliegue en FriendliAI: https://friendli.ai/models/enmingzhangzz/Qwen2.5-VL-7B-OPSD-VisionZip-r010-Btop50-absFtop50-lambda05-gap01-10240
- Repositorio VisionZip (GitHub): https://github.com/JIA-Lab-research/VisionZip
