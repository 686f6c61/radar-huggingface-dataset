# cyboghostginx/Qwen3.8-27B-abliterated-Adetayo-reas-GGUF

## Resumen

El modelo `Qwen3.8-27B-abliterated-Adetayo-reas-GGUF` es una variante del modelo base `Qwen/Qwen3.8-27B` (27.320.697.856 parámetros, aproximadamente 27,3B) a la que se ha aplicado una técnica de ablación direccional de rechazos, comúnmente conocida como *abliteration*. El proceso, realizado con la herramienta [Heretic](https://github.com/p-e-w/heretic) versión 1.4.0, busca eliminar o reducir drásticamente el comportamiento de rechazo del modelo ante instrucciones que un modelo instructivo estándar declinaría, sin recurrir a fine-tuning ni a datos de entrenamiento adicionales.

La arquitectura subyacente es híbrida: combina 48 capas de atención lineal basadas en GatedDeltaNet (`linear_attn`) con 16 capas de atención completa (`self_attn`), sumando 64 capas en total, además de una torre de visión y una cabeza MTP (Multi-Token Prediction) para decodificación especulativa. La ablación se aplicó únicamente a los proyectores de salida de las capas (`linear_attn.out_proj`, `self_attn.o_proj` y `mlp.down_proj`), dejando intactos el tokenizador, la plantilla de chat, los preprocesadores y las capas de normalización. El resultado es un modelo que conserva las capacidades de razonamiento y generación del original, pero con una tasa de rechazo reducida de 98/100 a 24/100 en las pruebas reportadas.

Este modelo es relevante para la comunidad de investigación en seguridad de IA, interpretabilidad y red teaming, ya que permite estudiar cómo se codifican las direcciones de rechazo en el espacio residual de un transformer híbrido y evaluar el impacto de su eliminación. No está pensado para despliegue en producción sin supervisión, y el propio autor advierte que el comportamiento de seguridad ha sido sustancialmente eliminado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 48 capas GatedDeltaNet `linear_attn` + 16 capas `self_attn` (64 capas totales) + torre de visión + cabeza MTP |
| Parametros totales | 27.320.697.856 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base, no especificada en la información) |
| Tipos de cuantizacion | No especificados (el repositorio está etiquetado como GGUF, pero no se detallan los quant disponibles) |
| Idiomas soportados | No disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (bf16) y GGUF (según nombre del repositorio) |

## Arquitectura y entrenamiento

El modelo base `Qwen3.8-27B` presenta una arquitectura híbrida poco común: 48 de sus 64 capas utilizan atención lineal basada en GatedDeltaNet, un mecanismo de estado recurrente que reduce el coste computacional frente a la atención completa, mientras que las 16 capas restantes emplean atención softmax estándar. Esta combinación busca equilibrar eficiencia y capacidad de modelado de dependencias de largo alcance. Además, el modelo incorpora una torre de visión que permite procesar entradas multimodales (imagen y texto) y una cabeza MTP (Multi-Token Prediction) que actúa como borrador en un esquema de decodificación especulativa: el borrador propone varios tokens y el modelo principal los verifica, acelerando la generación sin alterar el texto emitido.

La modificación introducida en esta variante no es un entrenamiento, sino una ablación direccional. Heretic busca automáticamente, mediante el optimizador Optuna, los parámetros de ablación que minimizan simultáneamente dos objetivos: la tasa de rechazos restantes y la divergencia KL con respecto al modelo original. En el ensayo seleccionado (trial 63), se obtuvo una reducción de rechazos de 98/100 a 24/100 con una divergencia KL de 0,0546, lo que indica que el comportamiento general del modelo se mantiene muy cercano al original. La dirección de rechazo se identifica en el flujo residual y cada matriz de pesos que escribe en ese flujo se ortogonaliza contra dicha dirección, produciendo deltas de rango 1. La ablación se concentra en una banda de capas (perfil con pico en una posición buscada) en lugar de aplicarse uniformemente, y se aplica tanto a capas de atención lineal como a capas de atención completa. La torre de visión, `lm_head`, las embeddings y todas las capas de normalización permanecen bit a bit idénticas al modelo base.

## Capacidades

- Generación de texto con modo de razonamiento (*thinking mode*): el modelo es de tipo razonador y produce cadenas de pensamiento antes de la respuesta final.
- Procesamiento de imágenes: al ser `image-text-to-text`, acepta entradas visuales combinadas con texto.
- Decodificación especulativa mediante la cabeza MTP, que acelera la inferencia sin cambiar la distribución de salida.
- Comportamiento de rechazo reducido: responde a instrucciones que un modelo instructivo estándar declinaría, incluyendo contenido potencialmente dañino o no ético.
- Capacidades multilingües: no especificadas, pero heredadas del modelo base Qwen (que tradicionalmente soporta múltiples idiomas); no hay confirmación en la información proporcionada.
- No se menciona soporte explícito para tool calling o function calling en la información disponible.

## Casos de uso

- Investigación en interpretabilidad de modelos: permite estudiar cómo se codifican las direcciones de rechazo en el espacio residual de un transformer híbrido, comparando las activaciones del modelo abliterado con las del modelo base.
- Red teaming de sistemas de IA: generar respuestas que un modelo estándar rechazaría para probar la robustez de los sistemas de moderación y filtrado de contenido.
- Evaluación de técnicas de alineación: medir la eficacia de métodos de mitigación (como RLHF o DPO) comparando las tasas de rechazo y la calidad de las respuestas entre el modelo original y esta variante.
- Desarrollo de contramedidas de seguridad: analizar qué capas y proyecciones son más críticas para el comportamiento de rechazo, lo que puede guiar el diseño de defensas más eficaces.
- Pruebas de robustez de clasificadores de contenido: utilizar las salidas de este modelo como casos de prueba para detectores de contenido dañino o inapropiado.
- Investigación sobre over-refusal: estudiar por qué algunos modelos rechazan excesivamente prompts benignos y evaluar si la ablación direccional puede reducir ese comportamiento sin afectar la utilidad general.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La única métrica reportada en la model card es la tasa de rechazo y la divergencia KL, que se resumen a continuación:

| Metrica | Valor |
|---|---|
| Rechazos antes de la ablación | 98/100 |
| Rechazos después de la ablación | 24/100 |
| Divergencia KL vs modelo original | 0,0546 |

El autor indica que el conteo de rechazos se basa en coincidencia de subcadenas como "harmful" o "unethical", por lo que la cifra debe interpretarse como un límite superior de rechazo, no como una tasa de cumplimiento exacta. No se dispone de datos sobre rendimiento en tareas de razonamiento, código o matemáticas.

## Requisitos de hardware

- VRAM estimada para inferencia: en precisión bf16 (2 bytes por parámetro), el modelo requiere aproximadamente 54,6 GB de VRAM solo para los pesos. Con cuantización 4-bit (si se dispone de archivos GGUF Q4), el requisito se reduce a unos 14-16 GB, y en 8-bit a unos 27-29 GB.
- GPU recomendadas: para ejecución en bf16 se necesitan GPUs de clase profesional como NVIDIA A100 (80 GB), H100 (80 GB) o A6000 (48 GB, con posible uso de offloading). En el ámbito de consumo, una RTX 4090 (24 GB) solo puede ejecutar el modelo con cuantización agresiva (Q4 o inferior) o mediante offloading a CPU.
- Opciones de despliegue: al estar disponible en formato GGUF (según el nombre del repositorio), puede desplegarse con llama.cpp, Ollama o LM Studio. También es compatible con frameworks de transformers como vLLM o TGI si se utilizan los pesos safetensors, siempre que se disponga de suficiente VRAM.
- Latencia y throughput: no disponibles en la información proporcionada. La decodificación especulativa con la cabeza MTP puede mejorar el throughput, pero no se han publicado cifras concretas.

## Comparativa con modelos similares

La comparativa más directa es con el modelo base `Qwen/Qwen3.8-27B`, del cual deriva. No se dispone de datos de otros modelos abliterados de la misma familia en la información proporcionada.

| Modelo | Parametros | Arquitectura | Contexto | Comportamiento de rechazo | Licencia |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27,3B | Híbrida (GatedDeltaNet + self_attn + visión + MTP) | No especificado | Rechazo estándar (98/100 en pruebas) | Apache-2.0 |
| Qwen3.8-27B-abliterated (este modelo) | 27,3B | Idéntica al base (solo se modifican proyecciones de salida) | No especificado | Rechazo reducido (24/100 en pruebas) | Apache-2.0 |

Ambos modelos comparten la misma arquitectura y pesos en la mayoría de los componentes; la diferencia radica únicamente en la ortogonalización de las matrices que escriben en el flujo residual. No hay datos de benchmarks comparativos entre ambos.

## Limitaciones y advertencias

- El comportamiento de seguridad ha sido deliberadamente eliminado en gran medida: el modelo responderá a instrucciones que un modelo instructivo estándar declinaría, incluyendo contenido dañino, ilegal o éticamente cuestionable. El despliegue sin supervisión conlleva un riesgo significativo.
- No se han realizado evaluaciones de calidad de respuesta (razonamiento, código, matemáticas) tras la ablación; la divergencia KL es baja (0,0546), pero no garantiza que no existan degradaciones localizadas.
- La tasa de rechazo residual (24/100) indica que aún hay respuestas que el modelo rechaza, por lo que no es un modelo completamente "sin censura".
- El autor advierte explícitamente que el usuario es responsable de cómo se despliega el modelo.
- No se especifican los idiomas soportados ni la longitud de contexto, lo que limita la planificación de despliegues multilingües o con contextos largos.
- La licencia Apache-2.0 permite uso comercial, pero las implicaciones éticas y legales del contenido generado recaen en el usuario.
- La herramienta de ablación (Heretic) solo alcanza 16 de las 64 capas si se limita a `o_proj`; en este caso se aplicó a tres tipos de proyecciones, pero el autor no detalla si todas las capas fueron efectivamente modificadas o si algunas quedaron intactas.

## Enlaces

- [Repositorio HuggingFace del modelo](https://huggingface.co/cyboghostginx/Qwen3.8-27B-abliterated-Adetayo-reas-GGUF)
- [Modelo base Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- [Heretic (herramienta de ablación direccional)](https://github.com/p-e-w/heretic)
