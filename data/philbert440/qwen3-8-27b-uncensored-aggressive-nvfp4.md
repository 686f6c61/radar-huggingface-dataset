# philbert440/Qwen3.8-27B-Uncensored-Aggressive-NVFP4

## Resumen

El modelo `philbert440/Qwen3.8-27B-Uncensored-Aggressive-NVFP4` es una variante del VLM denso Qwen3.8-27B (arquitectura `qwen3_5`) a la que se ha aplicado un proceso de abliteration agresivo para eliminar los rechazos de seguridad, seguido de una cuantización NVFP4A16. El resultado es un modelo de 27 356 millones de parámetros optimizado para ejecutarse en GPUs NVIDIA V100 (SM70) mediante el runtime 1Cat-vLLM, con soporte de decodificación especulativa a través de la cabeza MTP.

Desarrollado por el usuario philbert440, este modelo se presenta como una herramienta de investigación para estudiar el comportamiento de modelos sin refusals y para desplegar capacidades multimodales en hardware legacy. La cuantización NVFP4 reduce el tamaño del repositorio a 20,6 GB, lo que permite su ejecución en configuraciones de 2x V100 con tensor parallelism. La licencia Apache 2.0 facilita su uso en entornos académicos y de investigación.

La relevancia de este modelo radica en su doble vertiente: por un lado, demuestra la viabilidad de ejecutar un VLM de 27B en GPUs de generaciones anteriores mediante cuantización de 4 bits; por otro, explora los límites de la abliteration como técnica de eliminación de refusals, con una reducción documentada de 99/100 a 14/100 en el conjunto `mlabonne/harmful_behaviors`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (dense VLM, basado en Qwen3.8-27B) |
| Parametros totales | 27.356.728.560 (~27,36B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | NVFP4A16 (E2M1 4-bit, FP8-E4M3 scales @ group 16); partes en bf16 (vision tower, lm_head, norms, MTP head) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B, un VLM denso con arquitectura `qwen3_5` que incluye una vision tower y una cabeza MTP (Multi-Token Prediction) para decodificación especulativa. Sobre esta base se aplicó un proceso de abliteration direccional optimizado con KL (Heretic), con perfil agresivo y amplio. Según la model card, el ensayo Pareto 192 redujo los rechazos de 99/100 a 14/100 en `mlabonne/harmful_behaviors`, con una divergencia KL de 0,106 respecto al modelo base. La evaluación de cordura en bf16 mostró 0/5 rechazos en prompts dañinos, manteniendo la coherencia.

Posteriormente se cuantizó el modelo a NVFP4A16 mediante `compressed-tensors` con GPTQModifier, apuntando a las capas `Linear`. Se mantuvieron en alta precisión (208 entradas ignoradas) la vision tower, `linear_attn.in_proj_{a,b}`, `lm_head`, las normas y la cabeza MTP, que se conserva en bf16 para la decodificación especulativa. La calibración se realizó con 256 muestras de Magpie-Reasoning-V2 en modo thinking. El despliegue en V100 requiere el runtime 1Cat-vLLM con `prepare_nvfp4_linear` (capacidad mínima SM70), no la ruta estándar de modelopt.

## Capacidades

- Generación de texto y razonamiento multimodal (VLM) con entrada de imágenes gracias a la vision tower.
- Modo thinking y no-thinking (`/no_think`), lo que permite alternar entre razonamiento explícito y respuestas directas.
- Decodificación especulativa mediante la cabeza MTP, que acelera la inferencia en configuraciones con vLLM.
- Refusals de seguridad eliminados: el modelo no rechaza peticiones dañinas, lo que lo hace útil para investigación en alineación y seguridad.
- Cuantización NVFP4A16 que permite ejecución en GPUs con soporte SM70 (V100) y menor consumo de VRAM.
- Compatibilidad con 1Cat-vLLM para inferencia con tensor parallelism (TP2) y caché KV en FP8.

## Casos de uso

- Investigación en seguridad y alineación: estudiar cómo se comporta un modelo sin refusals ante prompts dañinos, comparando con versiones alineadas para medir el impacto de la abliteration.
- Generación de contenido creativo sin restricciones: escritura de ficción, guiones o diálogos que requieran explorar temas sensibles sin filtros automáticos.
- Análisis de imágenes en entornos legacy: al ejecutarse en V100, permite desplegar un VLM de 27B en infraestructura existente sin necesidad de GPUs modernas.
- Prototipado de agentes con razonamiento: el modo thinking y la decodificación especulativa facilitan tareas de multi-step reasoning en pipelines de agentes.
- Evaluación de técnicas de cuantización: comparar la calidad de NVFP4A16 frente a bf16 en tareas de visión y lenguaje, midiendo la degradación introducida.
- Experimentación con decodificación especulativa: la cabeza MTP permite probar configuraciones de speculative decoding en vLLM y medir el throughput en hardware V100.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo documenta métricas de abliteration (reducción de refusals y divergencia KL) y la evaluación de cordura en bf16, pero no incluye resultados de MMLU, HumanEval, GSM8K u otros estándares.

## Requisitos de hardware

- VRAM estimada: el repositorio pesa 20,6 GB en NVFP4, lo que sugiere un uso de VRAM inferior a 16 GB para los pesos, más overhead de activaciones y KV cache. No se especifica el valor exacto.
- GPU recomendadas: 2x NVIDIA V100 (16 GB o 32 GB) con tensor parallelism (TP2), según la configuración documentada en la model card. También podría ejecutarse en GPUs con SM70 o superior, pero no se ha probado.
- No cabe en GPUs consumer de gama baja; se requiere al menos una GPU con 16 GB de VRAM y soporte SM70.
- Opciones de despliegue: 1Cat-vLLM (runtime específico para NVFP4 en V100), con flags como `--kv-cache-dtype fp8_e5m2` y `--gpu-memory-utilization` ajustado al presupuesto de contexto.
- Latencia y throughput: no disponibles. La decodificación especulativa con MTP debería mejorar el throughput, pero no se aportan cifras.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa con modelos de la misma categoría. El modelo es una variante cuantizada y abliterada de Qwen3.8-27B, por lo que su referencia natural es el modelo base sin modificar. No se han publicado benchmarks comparativos en la documentación disponible.

## Limitaciones y advertencias

- Modelo de investigación con refusals de seguridad eliminados: puede generar contenido dañino, ilegal o inapropiado. Su uso debe ser exclusivamente legal y responsable.
- La cuantización NVFP4A16 puede introducir degradación en la calidad de las respuestas respecto al modelo en bf16, especialmente en tareas que requieren precisión numérica.
- La longitud de contexto no está documentada; se desconoce el límite real de tokens de entrada.
- Los idiomas soportados no están especificados; el modelo base Qwen3.8-27B probablemente soporta múltiples idiomas, pero no hay confirmación.
- El despliegue depende de 1Cat-vLLM y de la ruta `prepare_nvfp4_linear`; no es compatible con vLLM estándar ni con otras herramientas de inferencia sin adaptaciones.
- La abliteration agresiva puede afectar a la coherencia en dominios específicos, aunque la evaluación de cordura mostró resultados aceptables en bf16.
- No se han publicado resultados de benchmarks estándar, por lo que el rendimiento real en tareas comunes es desconocido.

## Enlaces

- [HuggingFace: philbert440/Qwen3.8-27B-Uncensored-Aggressive-NVFP4](https://huggingface.co/philbert440/Qwen3.8-27B-Uncensored-Aggressive-NVFP4)
- [1Cat-vLLM (GitHub)](https://github.com/1CatAI/1Cat-vLLM)
