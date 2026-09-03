# sjakek/slimder-qwen38-ream288-depth32-agentic-ngram50-compact-nvfp4

## Resumen

El modelo `sjakek/slimder-qwen38-ream288-depth32-agentic-ngram50-compact-nvfp4` es un checkpoint empaquetado y cuantizado en NVFP4, derivado del modelo base `sjakek/slimder-qwen38-ream288-depth32-agentic-ngram50-compact`. Desarrollado por el usuario sjakek, este modelo pertenece a la familia Qwen4-exp y emplea una arquitectura de mezcla de expertos (MoE) con 32 capas y un total de 55 117 626 057 parámetros. Su propósito principal es reducir el tamaño del checkpoint original en un 43,26 % mediante el empaquetado de los tensores de expertos enrutados en formato NVFP4 E2M1, manteniendo la tabla n-gram PLE en BF16 y el resto de tensores en su precisión original.

La relevancia de este modelo radica en su enfoque de compresión para despliegue eficiente: al reducir el peso lógico de 150,5 GB a 85,4 GB, facilita la carga en entornos con memoria limitada, aunque requiere un runtime específico incluido en el propio checkpoint para descomprimir los expertos seleccionados durante la inferencia. El modelo está pensado para generación de texto y uso conversacional, con licencia Apache 2.0, y se presenta como candidato a producción, aunque aún no dispone de un kernel de servicio NVFP4 fusionado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen4-exp, mixture-of-experts (MoE) con 32 capas y expertos enrutados fusionados |
| Parametros totales | 55 117 626 057 (55,1 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 E2M1 (empaquetado) con escalas FP8 E4M3 y FP32; tensores no expertos en BF16 u otras precisiones originales |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con runtime adicional `transformers_compact_runtime.py`) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen4-exp con mezcla de expertos (MoE). Según la model card, las 32 capas contienen proyecciones de expertos enrutados fusionadas (`gate_up_proj` y `down_proj`), que han sido empaquetadas en formato NVFP4 E2M1. Cada bloque de 16 pesos tiene una escala FP8 E4M3 y cada proyección de experto una escala global FP32. La tabla n-gram PLE compacta se mantiene en BF16 y es byte-idéntica al checkpoint base validado. El resto de tensores (no expertos) conservan su precisión original.

En cuanto al entrenamiento, el checkpoint es un ajuste fino (finetune) del modelo base `sjakek/slimder-qwen38-ream288-depth32-agentic-ngram50-compact`, y se indica el uso de QLoRA (tag `qlora`). No se proporcionan detalles sobre el dataset, número de tokens o metodología de entrenamiento. La validación incluye pruebas de carga en dos GPUs, pasadas forward finitas y una prueba de LoRA de dos pasos con pérdidas de entrenamiento 5,06963 y 4,97441, pérdida de evaluación 5,05745 y 5 079 040 parámetros adaptables.

## Capacidades

- Generación de texto: el modelo está diseñado para tareas de generación de lenguaje natural, con pipeline `text-generation`.
- Uso conversacional: el tag `conversational` sugiere aptitud para diálogos multi-turno, aunque no se especifican detalles.
- Compresión NVFP4: capacidad de almacenar y descomprimir dinámicamente los expertos enrutados seleccionados por token, reduciendo el uso de memoria.
- Compatibilidad con transformers: se integra con la librería `transformers` mediante un runtime de compatibilidad incluido.
- Entrenamiento adicional: el checkpoint es entrenable (se validó con QLoRA), lo que permite ajustes finos posteriores.

No se documentan capacidades específicas como tool calling, agentes, visión o audio. El nombre "agentic" en el modelo base sugiere posible soporte para razonamiento multi-paso, pero no está confirmado en la información disponible.

## Casos de uso

- Despliegue de modelos MoE en entornos con memoria limitada: gracias a la compresión NVFP4, el checkpoint reduce su huella de memoria en un 43 %, lo que permite cargar un modelo de 55 B en configuraciones de dos GPUs de alta capacidad, como se validó en las pruebas.
- Investigación en cuantización y empaquetado de pesos: el modelo sirve como referencia para estudiar el impacto de NVFP4 en la precisión (similitud coseno mínima 0,995) y en el rendimiento de inferencia.
- Ajuste fino eficiente con QLoRA: al ser entrenable, se puede utilizar como punto de partida para adaptaciones a dominios específicos sin necesidad de descomprimir todo el modelo.
- Generación de texto en producción (con soporte futuro de kernel fusionado): una vez que exista un motor de servicio NVFP4 para Qwen4Exp, el modelo podría usarse para chatbots o asistentes conversacionales con menor coste de memoria.
- Evaluación de técnicas de compresión: los artefactos de validación (hashes, métricas de similitud) permiten comparar la fidelidad de la cuantización frente al checkpoint original.
- Pruebas de compatibilidad con runtime personalizado: el checkpoint incluye un runtime de parche que demuestra la viabilidad de cargar y ejecutar el modelo en transformers, útil para desarrolladores que necesiten integrar formatos no estándar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta métricas de validación interna (similitud coseno, error absoluto medio relativo, pérdidas de LoRA), pero no resultados en tareas estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión. El tamaño lógico del checkpoint es de 85,4 GB, pero la carga en memoria depende de la implementación del runtime y de si se descomprimen todos los expertos o solo los seleccionados. Las pruebas de validación se realizaron con dos GPUs, lo que sugiere un requisito mínimo de al menos 2 GPU de alta capacidad (por ejemplo, A100 80 GB o H100).
- GPU recomendadas: no se especifican modelos concretos; se asume GPUs de centro de datos con al menos 40-80 GB de VRAM por GPU.
- Compatibilidad con GPU de consumo: no se indica; dado el tamaño y la necesidad de dos GPUs, es poco probable que quepa en una GPU de consumo típica (RTX 4090 con 24 GB) sin técnicas adicionales de offload.
- Opciones de despliegue: se requiere el runtime `transformers_compact_runtime.py` incluido en el checkpoint. No se mencionan vLLM, llama.cpp, Ollama o TGI; el runtime actual usa PyTorch eager y no es un kernel de servicio fusionado.
- Latencia y throughput: no disponibles. La model card advierte que el runtime de compatibilidad no está optimizado para inferencia NVFP4; se necesita un motor con soporte explícito para Qwen4Exp fused experts y el runtime PLE compacto.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con alternativas de la misma categoría (modelos MoE de ~55 B con cuantización NVFP4). No se han encontrado modelos comparables en la documentación proporcionada.

## Limitaciones y advertencias

- El runtime incluido no es un kernel de servicio NVFP4 fusionado; la inferencia con el runtime de compatibilidad es lenta y no aprovecha el rendimiento potencial de NVFP4. Se necesita un motor de servicio específico para producción.
- La cuantización NVFP4 introduce una pequeña pérdida de precisión: la similitud coseno mínima en las muestras validadas es 0,995475 y el error absoluto medio relativo máximo es 0,090817, lo que puede afectar a tareas sensibles a la precisión.
- No se documentan sesgos, riesgos de alucinación o limitaciones de idioma. Al ser un modelo de 55 B, es probable que presente alucinaciones en contextos ambiguos, pero no hay datos específicos.
- La licencia Apache 2.0 permite uso comercial, pero el modelo depende de un runtime personalizado que debe distribuirse junto con el checkpoint.
- El modelo base y el finetune no tienen información pública sobre el dataset de entrenamiento, lo que limita la evaluación de sesgos y calidad.
- No se especifica la longitud de contexto ni los idiomas soportados; se recomienda verificar estos aspectos antes de su uso en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sjakek/slimder-qwen38-ream288-depth32-agentic-ngram50-compact-nvfp4
- Modelo base: https://huggingface.co/sjakek/slimder-qwen38-ream288-depth32-agentic-ngram50-compact
