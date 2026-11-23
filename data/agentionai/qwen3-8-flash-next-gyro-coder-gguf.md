# agentionai/Qwen3.8-Flash-Next-Gyro-Coder-GGUF

## Resumen

Gyro-Coder es una cuantización extrema y experimental del modelo Qwen3.8-Flash-Next, publicada por agentionai bajo el identificador `agentionai/Qwen3.8-Flash-Next-Gyro-Coder-GGUF`. El modelo base es un transformer de tipo mezcla de expertos (MoE) con 65.314.218.880 parámetros totales según los pesos safetensors del repositorio, y esta versión concreta reduce el cómputo a los 256 de los 512 expertos por capa que resultan relevantes para programación, dejando unos 65B parámetros efectivos en GPU almacenados a 2,125 bits por peso mediante un codificador trellis propio.

El objetivo declarado es ejecutar un modelo de codificación de gran tamaño en una única tarjeta de 24 GB (RTX 3090, RTX 4090 o Radeon 7900 XTX), ocupando 19,92 GiB de pesos en GPU. Existe una variante superior, Gyro-Coder-L, a unos 3,2 bits por peso y 27,54 GiB, pensada para tarjetas de 32 GB como la RTX 5090 o la R9700. El autor reporta una concordancia top-1 del 94,5% con el modelo completo en C++ y del 93,1% en Python sobre conjuntos de evaluación reservados.

La relevancia actual reside en la compresión agresiva con preservación de calidad para tareas de código, pero también en sus fuertes limitaciones prácticas: los ficheros no cargan en llama.cpp estándar y requieren una compilación propia del runtime del autor, distribuida en Docker. La licencia es `qwen-community-1.0`, etiquetada como "other" en el Hub, y no se dispone de información sobre idiomas soportados ni de resultados de benchmarks estándar publicados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE); arquitectura exacta del base no disponible en detalle |
| Parametros totales | 65.314.218.880 (según safetensors del repositorio) |
| Parametros activos | No disponible de forma oficial; el autor indica unos 65B parámetros en GPU tras seleccionar 256 de 512 expertos por capa |
| Longitud de contexto | 65.536 tokens en la configuración de ejemplo del autor (`-c 65536`) |
| Tipos de cuantizacion | TQ2_0 (2,125 bits/peso, 19,92 GiB) y TQ3_0 (unos 3,2 bits/peso, 27,54 GiB, variante L); codificador trellis propio, no compatible con tipos GGUF estándar |
| Idiomas soportados | No disponible |
| Licencia | qwen-community-1.0 (etiquetada como "other" en el Hub) |
| Formato de pesos | GGUF (variantes TQ2_0 y TQ3_0 propietarias); repositorio de 462,7 GB con múltiples ficheros |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es un transformer con mezcla de expertos: cada capa dispone de 512 expertos, de los cuales esta cuantización conserva los 256 más relevantes para programación. No se trata de un modelo entrenado desde cero por agentionai, sino de una poda de expertos combinada con una cuantización muy agresiva. El autor no detalla en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo original.

La innovación técnica principal es el codificador trellis propietario, que permite almacenar pesos a 2,125 bits por peso manteniendo, según el autor, mejor calidad que cuantizaciones IQ3_XXS y UD-Q2_K_XL que ocupan entre un 20% y un 25% más de memoria. La selección de expertos se realiza por capa y está orientada a código, lo que explica que el modelo rinda mejor en instrucciones concretas (implementar, corregir, refactorizar, explicar) que en conocimiento general o tareas abiertas. La variante L mantiene los mismos expertos a unos 3,2 bits por peso y, según las métricas del autor, queda más cerca del modelo completo que Gyro-M (que conserva los 512 expertos) en C++, con una divergencia KL de 0,077 frente a 0,082 y un 21% menos de memoria.

## Capacidades

- Generación de código en lenguajes como C++ y Python, con concordancia top-1 del 94,5% y 93,1% respectivamente frente al modelo completo en los conjuntos medidos por el autor.
- Instrucciones de codificación directas: implementar funcionalidad, corregir errores, refactorizar y explicar código.
- Soporte de tool calling y function calling, con formato Jinja (`--jinja`) en el servidor de inferencia; el autor reporta 292 llamadas a herramientas y 0 errores de formato en 100 sitios muestreados con Gyro-Coder-L v1.2.
- Integración con agentes de codificación: el modelo se conecta a un endpoint compatible con la API de OpenAI en `http://127.0.0.1:8080/v1`, usable desde plugins de editor y desde el agente Marshall del propio autor.
- Conversación multi-turno (etiqueta `conversational` en el Hub), con contexto de hasta 65.536 tokens en la configuración recomendada.
- Capacidades multilingües: no disponible.
- Modo de razonamiento extendido, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Asistencia de código en local sobre una RTX 4090 o 3090: el fichero TQ2_0 ocupa 19,92 GiB de pesos, de modo que un desarrollador individual puede ejecutar un modelo de 65B parámetros en su propia máquina sin depender de la nube, apuntando su plugin de editor al endpoint local.
- Refactorización y corrección de errores en bases de código grandes: con 65.536 tokens de contexto se pueden pasar varios ficheros relacionados en una sola petición y pedir cambios coherentes entre ellos, aprovechando la ventana amplia para mantener el estado del proyecto.
- Agente de codificación multi-paso: integrado en Marshall (planificador, codificador y revisor), el modelo puede emitir llamadas a herramientas con formato validado, lo que permite encadenar lecturas de ficheros, ediciones y ejecución de pruebas con aprobación humana por acción.
- Generación de código en C++ para proyectos con requisitos de rendimiento: es el lenguaje donde la cuantización conserva mejor la fidelidad al modelo completo (94,5% de concordancia top-1), por lo que resulta adecuada para tareas de implementación en sistemas y bibliotecas nativas.
- Automatización de tareas de CI/CD asistidas por modelo: el servidor expone una API compatible con OpenAI, de forma que se pueden lanzar peticiones desde pipelines para generar parches, resúmenes de cambios o borradores de pruebas, siempre con revisión humana posterior.
- Despliegue en estaciones de trabajo con GPU AMD o Intel: el runtime del autor funciona sobre Vulkan en Docker, lo que permite usar el modelo en tarjetas Radeon 7900 XTX o R9700 sin depender de CUDA.
- Evaluación e investigación sobre compresión de MoE: la publicación incluye métricas de divergencia KL y concordancia top-1, útil para estudiar el compromiso entre bits por peso y calidad en modelos de mezcla de expertos orientados a código.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor únicamente reporta métricas internas de fidelidad respecto al modelo completo:

| Metrica | Gyro-Coder (TQ2_0) | Gyro-Coder-L (TQ3_0) | Referencia |
|---|---|---|---|
| Concordancia top-1 en C++ | 94,5% | superior a Gyro-Coder en todos los conjuntos medidos | Modelo completo Qwen3.8-Flash-Next |
| Concordancia top-1 en Python | 93,1% | no disponible | Modelo completo Qwen3.8-Flash-Next |
| Divergencia KL en C++ | no disponible | 0,077 (27,54 GiB) | Gyro-M: 0,082 (34,98 GiB) |
| Errores de formato en tool calling | no disponible | 0 etiquetas rotas en 100 sitios; 292 llamadas, 0 errores | no disponible |
| Memoria de pesos en GPU | 19,92 GiB | 27,54 GiB | Gyro-M: 34,98 GiB; Gyro-S: 27,64 GiB |

## Requisitos de hardware

- VRAM para pesos: 19,92 GiB con TQ2_0 y 27,54 GiB con TQ3_0 (Gyro-Coder-L); hay que añadir la memoria de la caché KV, configurada en el ejemplo con cuantización q8_0 para claves y valores y 65.536 tokens de contexto.
- GPU recomendadas: RTX 3090, RTX 4090 y Radeon 7900 XTX para el fichero de 24 GB; RTX 5090 y R9700 para la variante L de 32 GB; el autor menciona también Strix Halo para la rama Strata.
- Cabe en GPU de consumo: sí, en tarjetas de 24 GB y 32 GB según la variante; no se indica compatibilidad con tarjetas de 16 GB o menos.
- Almacenamiento: 70,6 GiB en disco para Gyro-Coder y 78,2 GiB para Gyro-Coder-L, preferiblemente en NVMe rápido; el repositorio completo ocupa 462,7 GB.
- Opciones de despliegue: compilación propia de llama.cpp del autor (GitLab, Vulkan, en Docker, imagen `agentionai/agention-llama:server`) y, solo para Gyro-Coder-L, la rama Strata del autor; llama.cpp estándar no puede cargar estos ficheros, y Ollama, vLLM o TGI no están soportados en la información disponible.
- Parámetros de inferencia sugeridos: `-ngl 999 -fa on --jinja --ngram-on-disk -c 65536 -ctk q8_0 -ctv q8_0 --temp 0.6 --top-p 0.95 --top-k 20 --min-p 0.05`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Memoria de pesos | Licencia | Notas |
|---|---|---|---|---|---|
| Gyro-Coder (TQ2_0) | 65,3B totales; ~65B en GPU tras poda de expertos | 65.536 tokens (config. recomendada) | 19,92 GiB | qwen-community-1.0 | Requiere runtime propio; orientado a código |
| Gyro-Coder-L (TQ3_0) | mismos expertos que Gyro-Coder | 65.536 tokens (config. recomendada) | 27,54 GiB | qwen-community-1.0 | Más fiel al modelo completo; también en Strata |
| Gyro-M (misma familia) | conserva los 512 expertos | no disponible | 34,98 GiB | qwen-community-1.0 | Mejor para uso general y conocimiento abierto |
| Gyro-S (misma familia) | no disponible | no disponible | 27,64 GiB | qwen-community-1.0 | Uso general además de código en 32 GB |

No se dispone de datos de benchmarks comparativos con modelos de otras familias en la información proporcionada.

## Limitaciones y advertencias

- No funciona con llama.cpp estándar: los tipos TQ2_0 y TQ3_0 solo cargan en la compilación propia del autor, lo que añade dependencia de un runtime no estándar y dificulta la portabilidad.
- La poda de expertos está orientada a código; el propio autor recomienda Gyro-S o Gyro-M para trabajo abierto y conocimiento general, por lo que el rendimiento fuera de programación será inferior.
- Riesgo de alucinación y de degradación en tareas de conocimiento factual: no hay benchmarks estándar publicados que permitan cuantificar la pérdida frente al modelo completo más allá de las métricas internas de concordancia.
- Cuantización a 2,125 bits por peso: aunque el autor reporta alta fidelidad en C++ y Python, la compresión extrema puede afectar a lenguajes menos representados y a instrucciones ambiguas.
- Idiomas soportados no documentados; no se puede garantizar calidad fuera del inglés o de los idiomas cubiertos por el modelo base.
- Licencia `qwen-community-1.0` etiquetada como "other": es necesario revisar los términos concretos antes de un uso comercial, y la información disponible no detalla restricciones adicionales.
- Modelo marcado como experimental (`experimental`, `qwen4exp`): no está pensado como base estable de producción sin validación propia.
- El contexto de 65.536 tokens consume VRAM adicional para la caché KV; en tarjetas de 24 GB el margen es ajustado y puede requerir reducir contexto o cuantizar más la caché.
- La compatibilidad con Strata está probada solo para Gyro-Coder-L en la rama del autor; Gyro-Coder (24 GB) no se ha probado en Strata.

## Enlaces

- Hugging Face: https://huggingface.co/agentionai/Qwen3.8-Flash-Next-Gyro-Coder-GGUF
- Variante de uso general Gyro: https://huggingface.co/agentionai/Qwen3.8-Flash-Next-Gyro-GGUF
- Variante Signal 2 (codificación agéntica): https://huggingface.co/agentionai/Signal-2-Flash-Next-Gyro-GGUF
- Agente de codificación Marshall: https://marshall.agention.ai
- Sitio web del autor: https://www.agention.ai/
- Compilación de llama.cpp del autor: https://gitlab.com/agentionai-group/llama.cpp
- Rama Strata del autor: https://gitlab.com/agentionai-group/strata/-/tree/main
- Strata upstream: https://github.com/Niko1221/Strata
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
