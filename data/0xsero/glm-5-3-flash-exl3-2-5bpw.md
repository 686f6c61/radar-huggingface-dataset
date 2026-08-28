# 0xSero/GLM-5.3-Flash-EXL3-2.5bpw

## Resumen

El repositorio `0xSero/GLM-5.3-Flash-EXL3-2.5bpw` es una cuantización selectiva en formato EXL3 de 2,5 bits por peso (bpw) del modelo base `zai-org/GLM-5.3-Flash-BF16`, desarrollada por el usuario 0xSero. En el momento de redactar esta ficha, el repositorio se encuentra en estado **pendiente**: no contiene pesos publicados y la conversión, verificación y pruebas están planificadas pero no ejecutadas. La cuantización está diseñada para reducir el tamaño del modelo manteniendo la calidad mediante una asignación selectiva de unidades de experto entre los niveles K2 y K3 de EXL3.

El modelo base, GLM-5.3-Flash, es el primer modelo nativamente multimodal de la serie GLM-5 de Z.AI. Se trata de un modelo de mezcla de expertos (MoE) con 320 mil millones de parámetros totales y 18 mil millones activos, entrenado sobre 30 billones de tokens. Su arquitectura combina atención híbrida (KDA y MLA/DSA) con un backbone MoE disperso y conexiones hiper-restrictivas de múltiples flujos (mHC), lo que reduce los costes de inferencia en contextos largos sin sacrificar precisión. Está liberado bajo licencia MIT, lo que permite uso comercial sin restricciones.

La relevancia de esta cuantización radica en que permitiría ejecutar un modelo de 320B en hardware de gama alta más asequible (por ejemplo, GPUs de 80 GB o 96 GB) manteniendo un rendimiento cercano al original, aunque todavía no hay artefactos disponibles para su uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) con atención híbrida KDA/MLA/DSA y conexiones mHC |
| Parametros totales | 320 mil millones (modelo base) |
| Parametros activos | 18 mil millones (modelo base) |
| Longitud de contexto | no disponible (no especificado en las fuentes consultadas) |
| Tipos de cuantizacion | 2,5 bpw EXL3 (selectiva, pendiente de publicación) |
| Idiomas soportados | no disponible (no especificado en las fuentes consultadas) |
| Licencia | MIT (tanto el modelo base como la cuantización) |
| Formato de pesos | EXL3 (pendiente; el modelo base usa BF16 en safetensors) |

## Arquitectura y entrenamiento

El modelo base GLM-5.3-Flash emplea una arquitectura MoE con 320B parámetros totales y 18B activos. Su atención combina dos mecanismos: KDA (Kernel-based Dynamic Attention) y MLA/DSA (Multi-head Latent Attention / Deep Sparse Attention), lo que permite manejar secuencias largas con un coste computacional reducido. El backbone MoE es disperso, con 288 expertos en 42 capas enrutadas, y utiliza un esquema de conexiones hiper-restrictivas de cuatro flujos (mHC) que mejora el escalado y la estabilidad del entrenamiento. El modelo fue entrenado sobre 30 billones de tokens, con un rediseño completo de la base respecto a versiones anteriores. Para GLM-5.3 (no Flash), las mejoras provienen principalmente del post-entrenamiento, pero GLM-5.3-Flash es nativamente multimodal, incorporando capacidades de visión.

La cuantización planificada por 0xSero utiliza un enfoque selectivo: los tripletes de enrutamiento (up/down) en las capas 3 a 44 se asignan como unidades completas de experto entre los niveles K2 y K3 de EXL3, basándose en la reducción del error de calibración medido. La mitad de los 12.096 expertos se asigna a cada nivel. Atención, indexadores, mHC, routers, expertos compartidos, capas densas 0-2, embeddings, cabeza de salida, normas, visión y MTP permanecen en BF16. La calibración compartida con el control de 4,0 bpw utiliza 1.228.800 tokens con enrutamiento natural top-8, cubriendo las 42 capas enrutadas y los 288 expertos, con un recuento mínimo de rutas de 1.655 frente a un mínimo de 1.024.

## Capacidades

- Generación de texto y razonamiento complejo, incluyendo tareas de software engineering y agentes autónomos.
- Generación de código y soporte de tool calling / function calling (inferido de las capacidades del modelo base, aunque no se detalla en las fuentes).
- Capacidades multimodales nativas: procesamiento de imágenes y tareas visuales (el modelo base es el primer GLM-5 nativamente multimodal).
- Soporte de agentes y razonamiento multi-paso, con mejoras específicas en post-entrenamiento para tareas de agente.
- Multilingüismo: no se especifican idiomas concretos, pero se espera que cubra los principales idiomas, dado el entrenamiento masivo.
- Atención híbrida que permite contextos largos con menor coste de servicio (aunque la longitud exacta no está publicada).

## Casos de uso

- Desarrollo de software asistido: el modelo puede generar, revisar y depurar código en múltiples lenguajes, integrándose en entornos de desarrollo o pipelines de CI/CD para automatizar tareas de programación.
- Agentes autónomos: gracias a su capacidad de razonamiento multi-paso y tool calling, puede orquestar flujos de trabajo complejos, como búsqueda de información, ejecución de comandos o interacción con APIs.
- Análisis de imágenes y documentos visuales: al ser multimodal, puede extraer información de capturas, diagramas o documentos escaneados, útil en automatización de oficina o soporte técnico.
- Atención al cliente automatizada: con su ventana de contexto larga (aunque no cuantificada), puede mantener conversaciones multi-turno con historial extenso y resolver consultas complejas.
- Investigación y análisis de datos: puede resumir artículos, generar informes o razonar sobre conjuntos de datos, ayudando a investigadores y analistas.
- Prototipado rápido de aplicaciones de IA: al estar bajo licencia MIT, permite integrarlo en productos comerciales sin coste de licencia, ideal para startups y empresas que necesitan un modelo potente y flexible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio de cuantización no incluye métricas de rendimiento, y las fuentes web consultadas no proporcionan números concretos de MMLU, HumanEval, GSM8K u otros. Se espera que el autor publique evaluaciones de calidad junto con los pesos cuando se complete la cuantización.

## Requisitos de hardware

- Al ser una cuantización de 2,5 bpw sobre un modelo de 320B, el tamaño estimado de los pesos sería de aproximadamente 100 GB (320B × 2,5/8), más overhead de activaciones y memoria intermedia.
- Se requeriría al menos una GPU con 96 GB de VRAM (por ejemplo, A100 80GB con offloading, o H100 80GB con gestión cuidadosa) o múltiples GPUs en paralelo (por ejemplo, 2× A100 80GB).
- Dado que el formato es EXL3, es necesario un cargador compatible con ExLlamaV3; no se garantiza compatibilidad con Transformers estándar.
- Opciones de despliegue: ExLlamaV3 (cargador nativo), posiblemente vLLM si añade soporte EXL3, aunque no está confirmado. No se recomienda llama.cpp ni Ollama para este formato.
- La latencia y el throughput dependerán del hardware y de la configuración exacta; no hay datos publicados.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| GLM-5.3-Flash (base) | 320B | 18B | no disponible | MIT | BF16 |
| DeepSeek-V3 | 671B | 37B | 128K | MIT | BF16/FP8 |
| Qwen3-MoE (235B) | 235B | 22B | 128K | Apache 2.0 | BF16 |

La comparativa es cualitativa, ya que no se dispone de benchmarks comunes. GLM-5.3-Flash se posiciona como un modelo MoE de tamaño medio-grande con capacidades multimodales, mientras que DeepSeek-V3 es más grande y Qwen3-MoE es más pequeño. La cuantización de 2,5 bpw lo haría significativamente más ligero que las versiones BF16 de estos modelos, a costa de una posible pérdida de precisión.

## Limitaciones y advertencias

- El repositorio de cuantización está **pendiente**: no hay pesos disponibles, y la conversión, verificación y pruebas no se han completado. No debe usarse en producción hasta que se publique el artefacto final.
- La cuantización de 2,5 bpw es de muy baja precisión; puede provocar una degradación notable en tareas de razonamiento complejo o generación de código en comparación con el modelo original.
- El formato EXL3 selectivo requiere un cargador específico; no es compatible con Transformers estándar, lo que limita su integración en ecosistemas existentes.
- No se han publicado evaluaciones de calidad ni benchmarks para esta cuantización; el rendimiento real es incierto.
- El modelo base, al ser multimodal y entrenado con datos masivos, puede presentar sesgos en sus respuestas, aunque no se han documentado específicamente.
- La licencia MIT permite uso comercial, pero el autor de la cuantización no ofrece garantías sobre su funcionamiento.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/0xSero/GLM-5.3-Flash-EXL3-2.5bpw
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash-BF16
- Suite de cuantización: https://huggingface.co/0xSero/GLM-5.3-Flash-EXL3
- Documentación de Z.AI sobre GLM-5.3: https://docs.z.ai/guides/llm/glm-5.3
- Guía de ejecución local (unsloth): https://unsloth.ai/docs/models/glm-5.3
- Página en LM Studio: https://lmstudio.ai/models/glm-5.3-flash
- Notas de arquitectura de Sebastian Raschka: https://sebastianraschka.com/blog/2026/glm-5-3-flash-architecture-notes.html
