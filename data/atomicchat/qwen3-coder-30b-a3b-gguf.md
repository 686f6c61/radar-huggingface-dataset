# AtomicChat/Qwen3-Coder-30B-A3B-GGUF

## Resumen

Qwen3-Coder-30B-A3B-GGUF es la versión cuantizada en formato GGUF del modelo Qwen3-Coder-30B-A3B-Instruct, desarrollado originalmente por Alibaba Qwen y cuantizado de forma independiente por AtomicChat a partir de los pesos originales, no como un repack de terceros. Está pensado para ejecución local y offline mediante llama.cpp, Ollama, LM Studio o la propia aplicación Atomic Chat, lo que lo convierte en una opción práctica para desarrolladores que quieren un modelo de código de gran tamaño sin depender de APIs.

El modelo base es un transformer de mezcla de expertos (MoE) con 30.532 millones de parámetros totales, 48 capas y 128 expertos enrutados con top-8 activos por token. Su contexto publicado por Qwen es de 262.144 tokens (256K), lo que lo sitúa en la franja de modelos de código con ventanas muy largas, adecuado para tareas de agente sobre repositorios completos.

La relevancia actual de esta ficha radica en que ofrece una escalera completa de cuantizaciones calibradas con importance matrix (imatrix), desde Q2_K de 11,3 GB hasta Q8_0 de 32,5 GB, lo que permite desplegar un MoE de 30B en hardware de consumo con pérdida de calidad controlada. La licencia Apache 2.0 facilita el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts, `Qwen3MoeForCausalLM`, 48 capas, 128 expertos enrutados (top-8), 32 cabezas de atención sobre 4 KV heads |
| Parametros totales | 30.532.122.624 (30,5B) |
| Parametros activos | no disponible (top-8 de 128 expertos, sin cifra oficial de parámetros activos en la información proporcionada) |
| Longitud de contexto | 262.144 tokens (256K) |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, UD-Q4_K_XL, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (todas con imatrix) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (librería `gguf`, ejecutable con llama.cpp) |

## Arquitectura y entrenamiento

El modelo base emplea una arquitectura de mezcla de expertos con 48 capas, 128 expertos enrutados y activación top-8 por token, con 32 cabezas de atención sobre 4 KV heads (atención con compartición de KV). El vocabulario es de 151.936 tokens y la modalidad es exclusivamente texto. La información disponible no detalla la composición del dataset de entrenamiento, el número de tokens vistos ni si hubo fases de RLHF o DPO en el modelo original.

La innovación técnica destacable de esta ficha concreta es el proceso de cuantización: AtomicChat descarga los pesos originales, los convierte a GGUF f16 con llama.cpp, construye una importance matrix sobre su propio corpus de calibración y genera toda la escalera de cuantizaciones con `--imatrix`. La variante UD-Q4_K_XL es dinámica y mantiene embeddings y capa de salida en Q8_0 para conservar calidad con huella de Q4. El modelo base incorpora además un formato de function call específicamente diseñado para entornos de agente como Qwen Code y CLINE.

## Capacidades

- Generación de texto y código en modo conversacional e instruct.
- Razonamiento sobre código y tareas de programación de varios pasos.
- Agentic coding: soporte de function calling con un formato de llamada diseñado específicamente para plataformas de agente (Qwen Code, CLINE).
- Agentic browser-use y otras tareas fundacionales de código, según el autor del modelo base.
- Ventana de contexto de 262.144 tokens para trabajar sobre repositorios y conversaciones largas.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modalidad: solo texto (sin visión ni audio).

## Casos de uso

- Asistente de código en IDE local: integrado vía llama.cpp u Ollama con la plantilla de chat de Qwen3 Coder (`--jinja`), el modelo puede autocompletar, refactorizar y explicar código sin enviar datos a la nube, lo que encaja en entornos con requisitos de privacidad.
- Agente autónomo de resolución de issues: con 256K de contexto puede cargar varios ficheros del repositorio y mantener el estado de una tarea multi-paso, usando el formato de function call para invocar herramientas de lectura, edición y test.
- Automatización de navegación web (agentic browser-use): el modelo base está evaluado por Qwen en tareas de uso de navegador, por lo que puede orquestar llamadas a herramientas de scraping o control de navegador en pipelines de investigación.
- Generación de tests y documentación en CI/CD: desplegado con llama-server en una GPU de 24 GB con Q4_K_M, puede generar tests unitarios y docstrings sobre diffs concretos como paso previo a la revisión humana.
- Migración y modernización de código legacy: la ventana larga permite pasar módulos completos y pedir traducciones entre lenguajes o actualizaciones de API manteniendo coherencia entre ficheros.
- Chat de soporte técnico para desarrolladores: con temperatura 0,7 y top_p 0,8 recomendados, puede gestionar conversaciones multi-turno sobre APIs y errores de compilación con contexto acumulado largo.
- Despliegue en estaciones de trabajo sin GPU dedicada: la variante IQ3_M (13,5 GB) o Q2_K (11,3 GB) permite ejecutar el modelo en CPU con RAM suficiente, útil para prototipado offline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio cuantizado no incluye tablas de MMLU, HumanEval, GSM8K ni métricas comparativas; solo menciona de forma cualitativa un rendimiento significativo en Agentic Coding y Agentic Browser-Use entre modelos abiertos, sin cifras.

## Requisitos de hardware

- VRAM/RAM estimada según cuantización: Q2_K 11,3 GB; IQ3_M 13,5 GB; Q3_K_M 14,7 GB; Q3_K_L 15,9 GB; IQ4_XS 16,4 GB; Q4_K_S 17,5 GB; Q4_K_M 18,6 GB; UD-Q4_K_XL 18,8 GB; Q5_K_S 21,1 GB; Q5_K_M 21,7 GB; Q6_K 25,1 GB; Q8_0 32,5 GB. Hay que añadir margen para el contexto (KV cache), que crece con la ventana configurada.
- GPU recomendadas: para Q4_K_M con contexto moderado, una RTX 4090 (24 GB) o RTX 3090 (24 GB) es suficiente; para Q6_K o Q8_0 se recomienda A100 40/80 GB o H100. La ejecución parcial con offload a CPU es viable vía `-ngl`.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 con cuantizaciones de hasta Q4_K_M o UD-Q4_K_XL; en GPUs de 16 GB encajan IQ4_XS o Q4_K_S con contexto reducido; en 12 GB, IQ3_M o Q3_K_M.
- Opciones de despliegue: llama.cpp (`llama-server`), Ollama (`ollama run hf.co/AtomicChat/qwen3-coder-30b-a3b-GGUF:Q4_K_M`), LM Studio, Jan y la aplicación Atomic Chat. Es imprescindible pasar `--jinja` para aplicar la plantilla de chat de Qwen3 Coder.
- Latencia y throughput: no disponibles en la información proporcionada. Al ser un MoE con top-8, el coste por token es inferior al de un denso de 30B, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3-Coder-30B-A3B (este, GGUF) | 30,5B totales | 262.144 | MoE top-8, 128 expertos | Apache 2.0 | GGUF |
| Qwen3-Coder-30B-A3B-Instruct (base) | 30,5B totales | 262.144 | MoE top-8, 128 expertos | Apache 2.0 | safetensors |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de benchmarks ni de especificaciones de modelos alternativos comparables, por lo que no se puede establecer una comparación cuantitativa con otros modelos de código.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la información proporcionada; al ser un modelo de código entrenado por Qwen, cabe esperar los sesgos habituales de los corpus web y de código, pero no se documentan.
- Riesgo de alucinación: no se aportan evaluaciones específicas; en tareas de agente conviene validar las llamadas a herramientas y las ediciones de ficheros antes de aplicarlas.
- Limitación de idioma: la lista de idiomas soportados no está disponible; el modelo base está orientado a código y su rendimiento en castellano no está documentado.
- Cuantización: las variantes de baja precisión (Q2_K, Q3_K_M) presentan una caída de calidad clara según el propio autor; para producción se recomienda Q4_K_M o superior.
- Plantilla de chat: sin `--jinja` el modelo puede emitir turnos malformados, lo que rompe pipelines de agente.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar el fichero LICENSE del modelo base enlazado por el autor.
- Contexto efectivo: aunque el modelo soporta 256K, en la práctica la VRAM limita la ventana utilizable; el ejemplo de la model card usa `-c 8192` con Q4_K_M en configuraciones locales.
- Fecha de creación del repositorio (2026-06-17) y de última actualización (2026-10-28) según los metadatos de Hugging Face.

## Enlaces

- Repositorio GGUF: https://huggingface.co/AtomicChat/Qwen3-Coder-30B-A3B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-Coder-30B-A3B-Instruct
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3-Coder-30B-A3B-Instruct/blob/main/LICENSE
- Aplicación Atomic Chat: https://atomic.chat
- Repositorio GitHub de Atomic Chat: https://github.com/AtomicBot-ai/Atomic-Chat
- Discord de Atomic Chat: https://discord.gg/8wGSsvmg4V
- X (Twitter) de Atomic Chat: https://x.com/atomic_chat_hq
- llama.cpp: https://github.com/ggml-org/llama.cpp
