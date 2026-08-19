# gbuzhf/Laguna-XS-2.1-APEX-GGUF

## Resumen

Laguna-XS-2.1 es un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado por poolside, especializado en generación de código y tareas de programación. Con 33.442 millones de parámetros totales y aproximadamente 3 mil millones de parámetros activos por token (nomenclatura 33B-A3B), emplea una arquitectura de 40 capas con 256 expertos, de los cuales solo 8 se activan en cada paso de inferencia. Su ventana de contexto alcanza los 262.144 tokens, lo que permite procesar repositorios completos o documentación extensa.

Esta versión concreta, publicada por el usuario gbuzhf, es una cuantización GGUF del modelo original en ocho niveles diferenciados, utilizando dos familias de cuantización propias: APEX con reglas v2D-lite y UDX (reconstrucción de la política de Unsloth adaptada a la arquitectura de XS). El autor ha empleado una importance matrix calculada específicamente sobre Laguna-XS-2.1 (de bartowski) y ha verificado los tamaños reales de cada archivo subido. La relevancia de esta ficha radica en que ofrece una gama de cuantizaciones con distintos balances entre calidad y uso de memoria, pensadas para entornos de producción con restricciones de VRAM.

El modelo base está diseñado para tareas de codificación, aunque no se han publicado benchmarks específicos en la documentación disponible. La licencia openmdw-1.1 permite su uso comercial, aunque conviene revisar sus términos exactos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder con MoE (Mixture of Experts), 40 capas, 256 expertos, 8 activos por token, atención sliding-window (512 tokens) en 30 capas, 10 capas de atención global |
| Parametros totales | 33.442.617.088 |
| Parametros activos | ~3.000.000.000 (nominal, 8 de 256 expertos por token) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | 8 tiers GGUF: UDX-Q6_K, APEX-I-Balanced-v2D-lite, UDX-Q5_K_S, APEX-I-Quality-v2D-lite, UDX-Q4_K_XL, UDX-IQ4_XS, APEX-I-Compact-v2D-lite, APEX-I-Mini-v2D-lite |
| Idiomas soportados | No disponible (presumiblemente ingles y lenguajes de programacion) |
| Licencia | openmdw-1.1 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

Laguna-XS-2.1 sigue una arquitectura transformer decoder con capas de MoE. Cada capa contiene 256 expertos en las proyecciones feed-forward (ffn_gate_exps, ffn_up_exps, ffn_down_exps), de los cuales se activan 8 por token. La atención es de tipo sliding-window con ventana de 512 tokens en 30 de las 40 capas, mientras que las 10 capas restantes (índices 0, 4, 8, ... 36) usan atención global, lo que permite capturar dependencias de largo alcance en el contexto de 262.144 tokens. El modelo tiene un tamaño oculto de 2048 y una dimensión intermedia de 512 en los expertos, según los datos comparativos con la variante S.

No se dispone de información sobre el proceso de entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO) en la documentación proporcionada. El modelo se presenta como un "coder" de poolside, lo que sugiere un entrenamiento enfocado en código fuente y posiblemente datos técnicos, pero estos detalles no han sido publicados en esta ficha.

La cuantización realizada por gbuzhf aplica dos estrategias diferenciadas: APEX con reglas v2D-lite (incremento de precisión en las capas de atención global y en la capa de salida) y UDX, una reconstrucción de la política de Unsloth para modelos de 40 capas, que asigna mayor precisión a los tensores que se utilizan en cada token (atención, expertos compartidos y primera capa densa) y menor precisión a los expertos enrutados. La importance matrix utilizada fue calculada por bartowski sobre el propio modelo XS con 437.248 tokens de calibración, aunque limitada a contexto corto (512 tokens por chunk).

## Capacidades

- Generación de texto y código: el modelo está especializado en tareas de programación, incluyendo generación de funciones, autocompletado, explicación de código y refactorización.
- Razonamiento multi-paso: al ser un modelo de 33B con MoE, puede abordar problemas de lógica y razonamiento matemático, aunque no se han publicado resultados específicos.
- Manejo de contexto largo: gracias a sus 262.144 tokens de ventana, puede procesar repositorios completos, documentación extensa o conversaciones multi-turno largas.
- Atención global selectiva: las 10 capas de atención global permiten capturar dependencias de largo alcance dentro de la ventana de contexto.
- Especialización en código: la arquitectura MoE con 256 expertos sugiere una especialización implícita en distintos patrones de programación, lenguajes y estilos.
- Compatibilidad con decodificación especulativa: el modelo puede usar un drafter externo (DFlash) para acelerar la inferencia, aunque esta funcionalidad no está operativa en llama.cpp upstream a fecha de la publicación.
- No se ha confirmado soporte de tool calling, function calling, visión o audio en la información disponible.

## Casos de uso

- Autocompletado de código en editores: el modelo puede integrarse en plugins de IDE (VS Code, JetBrains) mediante servidores de inferencia como llama.cpp o vLLM. Su contexto de 262k permite considerar todo el archivo o proyecto abierto para sugerencias precisas.
- Generación de tests unitarios: dado un fragmento de código, el modelo puede generar casos de prueba en múltiples lenguajes, aprovechando su capacidad de razonamiento sobre el comportamiento esperado.
- Refactorización y modernización de código legacy: con su contexto largo, puede analizar funciones o módulos completos y proponer reescrituras más eficientes o actualizadas a versiones modernas de un lenguaje.
- Documentación automática: a partir de código fuente, el modelo puede generar comentarios, docstrings y documentación técnica, reduciendo el trabajo manual en proyectos grandes.
- Revisión de código (code review): puede detectar posibles bugs, vulnerabilidades o malas prácticas en pull requests, ayudando a los desarrolladores en el proceso de revisión.
- Asistente de programación conversacional: integrado en un chatbot o API, puede responder preguntas sobre APIs, algoritmos o resolver dudas técnicas en tiempo real, manteniendo el contexto de la conversación durante largas sesiones.
- Análisis de logs y depuración: con su ventana de contexto amplia, puede procesar grandes volúmenes de logs y ayudar a identificar la causa raíz de errores en aplicaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor de la cuantización no incluye métricas de rendimiento (MMLU, HumanEval, GSM8K, etc.) y no se ha encontrado documentación oficial de poolside con estos datos en el material proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: los archivos GGUF varían entre 12.89 GB (APEX-I-Mini-v2D-lite) y 28.12 GB (UDX-Q6_K). Se recomienda al menos 16 GB de VRAM para los tiers más pequeños y 32 GB o más para los más grandes, considerando además el overhead de la ventana de contexto y el drafter si se usa decodificación especulativa.
- GPU recomendadas: para los tiers de hasta ~24 GB (APEX-I-Balanced, UDX-Q5_K_S, UDX-Q4_K_XL), una RTX 4090 (24 GB) o RTX 4080 (16 GB) es suficiente. Para los tiers de 28 GB, se necesita una GPU de 32 GB como A100 40GB, o usar offloading a CPU. Los tiers más pequeños (12-16 GB) caben en GPUs de 16 GB como RTX 4080, RTX 4070 Ti o incluso en algunas de 12 GB con cuantización más agresiva.
- Opciones de despliegue: llama.cpp y sus derivados (llama-server, Ollama) son los más adecuados para estos archivos GGUF. También puede usarse vLLM si se convierte a safetensors, aunque el formato nativo es GGUF.
- Latencia y throughput: no se han proporcionado datos medidos. Como referencia, un MoE de 3B activos en una GPU moderna (RTX 4090) suele generar entre 40 y 80 tokens por segundo con cuantización Q4, pero esto depende del hardware y la configuración.
- Para decodificación especulativa con DFlash, se necesita cargar un segundo archivo (el drafter), lo que incrementa los requisitos de VRAM en aproximadamente 1-2 GB adicionales.

## Comparativa con modelos similares

No se dispone de datos comparativos concretos en la información proporcionada. Sin embargo, por su tamaño y especialización, Laguna-XS-2.1 compite con otros modelos MoE de código como DeepSeek-Coder-V2 (236B total, 21B activos), Qwen2.5-Coder-32B (32B denso) o Mixtral-8x7B (47B total, 13B activos). La ventaja de Laguna-XS-2.1 es su menor número de parámetros activos (3B) y su contexto de 262k, superior a los 128k de Qwen2.5-Coder y los 64k de DeepSeek-Coder-V2. No obstante, sin benchmarks oficiales no es posible realizar una comparación cuantitativa rigurosa.

## Limitaciones y advertencias

- La importance matrix utilizada para la cuantización se calculó con chunks de 512 tokens (contexto corto), mientras que el modelo soporta 262.144 tokens. Esto puede degradar la calidad en tareas que requieran contexto muy largo, aunque el autor lo indica explícitamente como una limitación conocida.
- La decodificación especulativa con DFlash no funciona en llama.cpp upstream a fecha de la publicación (2026-08-16). Los archivos GGUF de drafter disponibles no cargan correctamente, y no hay soporte para convertir los safetensors de DFlash a GGUF. Intentar usarlo puede provocar errores.
- Las cuantizaciones UDX son reconstrucciones de la política de Unsloth, no oficiales. El autor admite una incertidumbre residual sobre la ubicación exacta de los incrementos de precisión en las capas intermedias, lo que podría afectar ligeramente al rendimiento.
- El modelo puede presentar sesgos en la generación de código, como preferencia por ciertos lenguajes o estilos, y puede alucinar APIs o funciones inexistentes si no se le proporciona contexto suficiente.
- La licencia openmdw-1.1 no es una licencia estándar ampliamente conocida; se recomienda revisar sus términos completos antes de usar el modelo en producción comercial.
- No se ha confirmado soporte para tool calling ni funciones de agente, por lo que su uso en pipelines de automatización compleja puede requerir adaptaciones adicionales.
- Los requisitos de VRAM son elevados para los tiers de mayor calidad; los despliegues en GPUs de consumo requieren elegir cuantizaciones más agresivas, lo que puede afectar a la fidelidad del código generado.

## Enlaces

- Modelo base: [poolside/Laguna-XS-2.1](https://huggingface.co/poolside/Laguna-XS-2.1)
- Repositorio de esta cuantización: [gbuzhf/Laguna-XS-2.1-APEX-GGUF](https://huggingface.co/gbuzhf/Laguna-XS-2.1-APEX-GGUF)
- Importance matrix de bartowski: [bartowski/Laguna-XS-2.1-GGUF](https://huggingface.co/bartowski/Laguna-XS-2.1-GGUF)
- Drafter DFlash: [poolside/Laguna-XS-2.1-DFlash](https://huggingface.co/poolside/Laguna-XS-2.1-DFlash)
