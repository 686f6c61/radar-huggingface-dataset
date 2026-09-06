# NiuNiu0110/rst-qwen3.5-4b-tmax-sft

## Resumen

`rst-qwen3.5-4b-tmax-sft` es un fine-tune supervisado (SFT) del modelo multimodal `Qwen/Qwen3.5-4B`, desarrollado por el usuario `NiuNiu0110`. El checkpoint se ha entrenado sobre el dataset `NiuNiu0110/TMax-Agent-SFT-terminus`, que contiene trayectorias de agente TMax de AI2, dentro del pipeline *Recursive Synthesis for Long-Horizon Terminal Tasks* alojado en el repositorio `k1ssloo/RST-Train`. El objetivo es que el modelo siga instrucciones de largo horizonte en entornos de terminal.

La arquitectura es `Qwen3_5ForConditionalGeneration`, un modelo de visión-lenguaje (VLM) de tipo image-text-to-text, con un total de 4.659.865.088 parámetros (aproximadamente 4,66B). La model card no proporciona la longitud de contexto, los idiomas soportados ni resultados de benchmarks; de hecho, declara explícitamente que no se ha ejecutado ninguna evaluación contra este checkpoint, por lo que debe tratarse como un artefacto no probado de una ejecución de entrenamiento.

El interés del modelo radica en su enfoque sobre tareas de agente en terminal, un dominio con pocos recursos abiertos. Sin embargo, la ausencia de benchmarks y de documentación detallada sobre capacidades hace que su uso en producción sea arriesgado sin una validación previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (VLM image-text-to-text; base: Qwen/Qwen3.5-4B) |
| Parametros totales | 4.659.865.088 (aprox. 4,66B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en bfloat16) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (bfloat16, 738 tensores) |

## Arquitectura y entrenamiento

El modelo es un fine-tune supervisado del modelo base `Qwen/Qwen3.5-4B`. La arquitectura `Qwen3_5ForConditionalGeneration` es multimodal, capaz de procesar entradas de imagen y texto, tal como indica el pipeline `image-text-to-text`. El checkpoint se ha entrenado con `verl` y `FSDP2` sobre un corpus pre-tokenizado: la máscara de pérdida de Qwen3.5 se incrustó una sola vez en los datos mediante el script `scripts/15_export_pretokenized.py`, en lugar de recalcularse por backend, porque el renderizado de conversación completa no se reproduce al tokenizar por separado y concatenar.

El proceso de exportación de los pesos es técnicamente relevante. `verl` escribe shards de FSDP que `from_pretrained` no puede cargar directamente. Los pesos se obtuvieron con `scripts/08_prepare_eval_ckpt.sh`, que fusiona todos los shards, vuelve a insertar la torre de visión desde el modelo base (el entrenamiento solo transporta el stack de texto) y verifica que los pesos de texto realmente se hayan movido. Esta verificación es necesaria porque una fusión sobre un shard faltante produce un modelo cargable pero parcialmente sin entrenar, y una fusión que reproduce el modelo base es indistinguible de una exitosa sin esa comprobación.

No se proporcionan detalles sobre el número de tokens de entrenamiento, la composición del dataset ni procesos de RLHF o DPO.

## Capacidades

- Comprensión multimodal de imágenes y texto: el modelo puede procesar entradas visuales junto con texto, según su arquitectura image-text-to-text.
- Entrenado para tareas de agente en terminal de largo horizonte: el dataset `TMax-Agent-SFT-terminus` contiene trayectorias de agente TMax, lo que orienta el modelo a seguir instrucciones complejas en entornos de línea de comandos.
- Formato conversacional: el tag `conversational` indica que está diseñado para interacciones de chat multi-turno.
- No hay documentación sobre tool calling, function calling ni soporte de agentes con herramientas estándar.
- Capacidades multilingües: no disponibles.
- Razonamiento multi-step: el entrenamiento en trayectorias de agente sugiere cierta capacidad para seguir secuencias de pasos, aunque no se ha verificado formalmente.

## Casos de uso

- Asistencia en administración de sistemas: el modelo puede recibir capturas de pantalla de terminales y generar comandos o secuencias de comandos para resolver incidencias, gracias a su entrenamiento en trayectorias de agente y su capacidad multimodal.
- Automatización de tareas de despliegue: en entornos controlados y con supervisión, puede seguir instrucciones de largo horizonte para ejecutar pasos de despliegue, como instalación de dependencias o configuración de servicios.
- Soporte técnico a desarrolladores: puede interpretar mensajes de error visuales y producir soluciones paso a paso, lo que resulta útil en herramientas de asistencia integradas en IDEs o plataformas de soporte.
- Generación de scripts de shell: a partir de descripciones en lenguaje natural y capturas de contexto, puede generar scripts bash o PowerShell, aunque se requiere validación manual por la ausencia de benchmarks.
- Educación en línea de comandos: puede explicar comandos complejos utilizando capturas de pantalla como contexto, útil para plataformas de formación técnica.
- Investigación en agentes: sirve como modelo de referencia para estudiar el efecto del fine-tuning sobre trayectorias de agentes terminales, comparando con el modelo base sin ajustar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se ha ejecutado ningún benchmark contra este checkpoint y que debe tratarse como un artefacto no probado de una ejecución de entrenamiento. No se aportan puntuaciones en MMLU, HumanEval, GSM8K ni ningún otro conjunto de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en bfloat16 ocupan aproximadamente 8,7 GB. Sumando activaciones y caché KV, se recomienda al menos 16 GB de VRAM para ventanas de contexto cortas, y más de 24 GB para contextos largos.
- GPU recomendadas: RTX 4090 (24 GB), A100 40GB, H100 80GB.
- Compatibilidad con GPU de consumo: sí, en GPUs con 16 GB o más, aunque sin cuantizaciones oficiales se recomienda al menos 16 GB para contextos moderados. En GPUs de 8-12 GB sería necesaria una cuantización manual no documentada.
- Opciones de despliegue: vLLM, TGI, Ollama (si se adapta el checkpoint; existe una entrada genérica para `qwen3.5:4b` en la biblioteca de Ollama), llama.cpp con cuantización manual.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de modelos comparables con datos suficientes. La única referencia directa es el modelo base `Qwen/Qwen3.5-4B`, del que este checkpoint es un fine-tune. No hay benchmarks que permitan comparar rendimiento, y las especificaciones del modelo base no se han proporcionado en la información disponible.

| Modelo | Parámetros | Arquitectura | Licencia | Benchmarks |
|---|---|---|---|---|
| Qwen3.5-4B (base) | Aprox. 4,66B | Qwen3_5ForConditionalGeneration | Apache-2.0 | No disponibles |
| rst-qwen3.5-4b-tmax-sft | 4.659.865.088 | Qwen3_5ForConditionalGeneration | Apache-2.0 | No disponibles |

## Limitaciones y advertencias

- Modelo sin validación: no se han ejecutado benchmarks, por lo que su rendimiento real es desconocido y no debe usarse en producción sin una evaluación propia.
- Riesgo de alucinación en comandos de terminal: si el modelo genera comandos incorrectos o peligrosos, su ejecución puede causar daños en sistemas reales. Es obligatorio validar cualquier salida antes de ejecutarla.
- Sesgos no evaluados: no hay información sobre sesgos, composición demográfica del dataset ni medidas de mitigación.
- Limitaciones de contexto e idioma no documentadas: no se especifican la longitud de contexto, los idiomas soportados ni el comportamiento en lenguajes distintos del inglés.
- Licencia Apache-2.0: permite uso comercial, pero hay que revisar la licencia del modelo base y la de los datos de entrenamiento antes de desplegar.
- Carga del modelo: el proceso de exportación desde shards de FSDP es complejo; `from_pretrained` puede fallar si no se siguen los pasos descritos en la model card.
- Dependencia de torchvision: según el repositorio de fine-tuning de referencia, la carga del `AutoProcessor` en modelos Qwen3.5 puede requerir `torchvision`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/NiuNiu0110/rst-qwen3.5-4b-tmax-sft
- Dataset de entrenamiento: https://huggingface.co/datasets/NiuNiu0110/TMax-Agent-SFT-terminus
- Repositorio del pipeline RST-Train: https://github.com/k1ssloo/RST-Train
- Repositorio de referencia sobre fine-tuning de Qwen3.5-4B: https://github.com/IIIIQIIII/qwen35-4b-lora-sft
- Entrada genérica de Qwen3.5 en Ollama: https://ollama.com/library/qwen3.5:4b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
