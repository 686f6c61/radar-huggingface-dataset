# enmingzhangzz/Qwen2.5-VL-7B-OPSD-VisionZip-r010-support-fidelity-10240

## Resumen

Este repositorio contiene un adaptador PEFT/LoRA entrenado sobre el modelo multimodal Qwen2.5-VL-7B-Instruct, desarrollado por enmingzhangzz. El adaptador aplica la técnica OPSD (Online Pruning with Support-fidelity Distillation) combinada con el podador de tokens visuales VisionZip, reteniendo solo el 10% de los tokens visuales (5% dominantes + 5% contextuales). El objetivo es reducir la carga computacional de la atención visual manteniendo la fidelidad de las representaciones mediante una pérdida de divergencia KL ponderada por afinidad de soporte.

El modelo se entrenó con 10.240 muestras del dataset OpenMMReasoner-SFT-874K, usando un teacher EMA con decaimiento 0.9999 y una pérdida que pondera la KL entre el teacher y el estudiante según la confianza del soporte. El adaptador resultante es ligero (0.2 GB) y debe cargarse sobre el modelo base Qwen2.5-VL-7B-Instruct, requiriendo además el parche de runtime VisionZip para inferencia podada. Es relevante para investigación en eficiencia de modelos multimodales, especialmente en escenarios con restricciones de latencia o memoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2.5-VL-7B-Instruct (transformer multimodal) + adaptador LoRA |
| Parametros totales | 7.6B (modelo base) + adaptador LoRA (r=16, alpha=32) |
| Parametros activos | no disponible (adaptador LoRA, no MoE) |
| Longitud de contexto | no disponible (hereda del modelo base, tipicamente 32K tokens) |
| Tipos de cuantizacion | no disponible (adaptador en safetensors, el base puede cuantizarse) |
| Idiomas soportados | no disponibles (hereda del modelo base, que soporta chino, ingles y otros) |
| Licencia | no disponible |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo base es Qwen2.5-VL-7B-Instruct, un transformer multimodal con codificador de vision y decodificador de lenguaje. El adaptador LoRA (r=16, alpha=32) se entrena sobre este base con la tecnica OPSD (Online Pruning with Support-fidelity Distillation). La poda de tokens visuales se realiza con VisionZip de VLMEvalKit, reteniendo un 10% de los tokens (5% dominantes + 5% contextuales). La perdida de entrenamiento es una divergencia KL hacia adelante ponderada por la afinidad de soporte: `C_t = sum_v sqrt(q_t(v) p_t(v))`, con dificultad `d_t = 1 - C_t` y peso `S_t = C_t^2`. El teacher es una EMA con decaimiento 0.9999. Se usaron 10.240 muestras del dataset OpenMMReasoner-SFT-874K, con batch global de 32 (4 GPUs x micro-batch 8) y resolucion de imagen fija de 846720 pixeles. El entrenamiento llego al paso 10.240.

## Capacidades

- Razonamiento multimodal sobre imagenes y texto, heredado del modelo base Qwen2.5-VL-7B-Instruct.
- Generacion de texto con soporte de contexto visual (imagenes, diagramas, graficos).
- Razonamiento de multiples pasos y capacidad de tool calling (depende del modelo base).
- Eficiencia computacional mejorada: al retener solo el 10% de tokens visuales, reduce el coste de atencion visual en inferencia.
- Distilacion de fidelidad: la perdida OPSD busca preservar la calidad de las representaciones pese a la poda.
- No se documentan capacidades especiales adicionales (vision, audio, etc.) mas alla de las del base.

## Casos de uso

- Inferencia multimodal en entornos con recursos limitados: al podar el 90% de tokens visuales, el adaptador permite ejecutar Qwen2.5-VL en GPUs con menos VRAM o con menor latencia, util para edge computing o servidores con multiples peticiones concurrentes.
- Analisis de documentos cientificos: el modelo puede procesar figuras, tablas y ecuaciones en papers, con razonamiento de alto nivel gracias al entrenamiento en OpenMMReasoner.
- Automatizacion de QA visual en produccion: integrable en pipelines de extraccion de informacion de imagenes (facturas, formularios escaneados) donde la velocidad es critica.
- Agentes multimodales con restriccion de presupuesto: el adaptador reduce el coste por llamada, permitiendo desplegar agentes que analizan capturas de pantalla o imagenes de camaras.
- Investigacion en eficiencia de modelos VLM: sirve como punto de partida para estudiar el equilibrio entre poda de tokens y fidelidad de salida.
- Prototipado rapido en notebooks o entornos de desarrollo: al ser un adaptador ligero, se puede cargar y probar en una sola GPU consumer sin necesidad de un cluster.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona metricas de MMLU, HumanEval, GSM8K ni otros evaluadores estandar. Tampoco se indican comparaciones cuantitativas con el modelo base sin poda.

## Requisitos de hardware

- VRAM estimada: el modelo base Qwen2.5-VL-7B-Instruct requiere aproximadamente 16-20 GB en FP16 para inferencia. Con el adaptador LoRA y la poda de tokens visuales, la VRAM efectiva puede reducirse, pero no se especifica un valor concreto.
- GPU recomendadas: para inferencia en FP16, una RTX 4090 (24 GB) o A100 (40 GB) son adecuadas. Para entrenamiento, el autor uso 4 GPUs (no especifica modelo).
- En consumer GPU: si, una RTX 3090 o 4090 puede ejecutar el modelo base con cuantizacion (por ejemplo, 8 bits) y el adaptador.
- Opciones de despliegue: el adaptador requiere PEFT y el parche de runtime VisionZip. Se puede servir con vLLM o TGI si soportan el parche, o con llama.cpp si se convierte a GGUF (no se proporciona). FriendliAI ofrece despliegue gestionado.
- Latencia y throughput: no disponibles. La poda de tokens visuales deberia reducir la latencia de prefill, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Base | Tecnica | Retencion tokens visuales | Tamano adaptador | Licencia |
|---|---|---|---|---|---|
| Este adaptador (support-fidelity) | Qwen2.5-VL-7B-Instruct | OPSD + VisionZip, peso por soporte | 10% (5% dominante + 5% contextual) | 0.2 GB | no disponible |
| enmingzhangzz/Qwen2.5-VL-7B-OPSD-VisionZip-r010-balanced-10240 | Qwen2.5-VL-7B-Instruct | OPSD + VisionZip, balanceado | 10% | 0.2 GB | no disponible |
| enmingzhangzz/Qwen2.5-VL-7B-OPSD-official-VisionZip-r010-10240 | Qwen2.5-VL-7B-Instruct | OPSD + VisionZip oficial | 10% | 0.2 GB | no disponible |
| Qwen2.5-VL-7B-Instruct (base) | - | Sin poda | 100% | - | Apache 2.0 (segun Qwen) |

La diferencia principal entre los tres adaptadores del mismo autor radica en la estrategia de ponderacion de la perdida OPSD (support-fidelity, balanced, oficial). No hay datos de rendimiento comparativo publicados.

## Limitaciones y advertencias

- No se ha publicado informacion sobre sesgos, alucinaciones o limitaciones de idioma especificas de este adaptador.
- La poda del 90% de tokens visuales puede degradar la calidad en tareas que requieren detalles visuales finos (por ejemplo, OCR de alta precision o reconocimiento de objetos pequenos).
- El adaptador requiere el parche de runtime VisionZip; sin el, la inferencia no funcionara correctamente.
- La licencia no esta especificada, lo que impide conocer restricciones de uso comercial.
- El entrenamiento se realizo solo con 10.240 muestras, lo que puede limitar la generalizacion fuera del dominio de razonamiento cientifico.
- No hay benchmarks publicados, por lo que no se puede verificar la eficacia real frente al modelo base.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un experimento de investigacion sin validacion externa.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/enmingzhangzz/Qwen2.5-VL-7B-OPSD-VisionZip-r010-support-fidelity-10240
- Adaptador balanceado (variante): https://huggingface.co/enmingzhangzz/Qwen2.5-VL-7B-OPSD-VisionZip-r010-balanced-10240
- Adaptador oficial (variante): https://huggingface.co/enmingzhangzz/Qwen2.5-VL-7B-OPSD-official-VisionZip-r010-10240
- Despliegue en FriendliAI (variante balanceada): https://friendli.ai/models/enmingzhangzz/Qwen2.5-VL-7B-OPSD-VisionZip-r010-balanced-10240
- Despliegue en FriendliAI (variante oficial): https://friendli.ai/models/enmingzhangzz/Qwen2.5-VL-7B-OPSD-official-VisionZip-r010-10240
- Repositorio de Qwen2.5-VL (referencia): https://github.com/elsawhs/qwen2.5-vl
