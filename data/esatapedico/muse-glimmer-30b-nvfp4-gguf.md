# esatapedico/Muse-Glimmer-30B-NVFP4-GGUF

## Resumen

Muse-Glimmer-30B es un modelo de lenguaje multimodal (texto e imágenes) desarrollado por Meta, con 30 mil millones de parámetros, arquitectura densa de 52 capas Transformer y atención de ventana deslizante con un patrón periódico [Local, Local, Local, Global] que combina ventanas locales de 2048 tokens con atención global cada cuatro capas. Su contexto nativo es de 131 072 tokens, lo que lo hace adecuado para tareas de razonamiento de largo alcance y uso agéntico.

La conversión `esatapedico/Muse-Glimmer-30B-NVFP4-GGUF` es una familia de seis archivos GGUF que mantienen el backbone completo en cuantización NVFP4 nativa (formato de 4 bits de NVIDIA optimizado para hardware Blackwell), variando únicamente la precisión de los tensores de cabecera (`lm_head` y `token_embd`). El objetivo es ofrecer una escalera de calidad/tamaño manteniendo la densidad NVFP4 en todo el modelo, lo que permite ejecutarlo en GPUs de consumo con un uso eficiente de VRAM.

La relevancia actual radica en que combina capacidades multimodales, razonamiento y tool calling en un paquete de 30B que puede desplegarse localmente, aunque esta conversión concreta no incluye el vision tower (solo texto) y requiere un fork específico de llama.cpp para funcionar correctamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atención de ventana deslizante (patrón [Local,Local,Local,Global]) |
| Parametros totales | 27 854 795 072 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 131 072 tokens |
| Tipos de cuantizacion | NVFP4 (backbone), con variantes Q2_K/Q3_K/Q4_K/Q5_0/Q6_K/Q8_0/BF16 en lm_head y token_embd según el archivo |
| Idiomas soportados | inglés y multilingüe |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con tensores en NVFP4, F32 y cuantizaciones adicionales) |

## Arquitectura y entrenamiento

El modelo original `Muse-Glimmer-30B` es un VLM denso de 30B parámetros con 52 capas Transformer, atención de ventana deslizante (SWA) donde tres de cada cuatro capas usan una ventana local de 2048 tokens y la cuarta usa atención global. El contexto nativo es de 131 072 tokens. Según la documentación de Ollama, está destilado de Muse Spark y diseñado para tareas agénticas en hardware de consumo. No se dispone de información detallada sobre el dataset de entrenamiento, el número de tokens o el uso de RLHF/DPO en las fuentes consultadas.

La conversión GGUF de esatapedico mantiene los 416 tensores de atención y MLP en NVFP4 nativo (GGML type 40), más 1145 tensores F32 (normas, escalas y vectores QK-norm). El `lm_head` y `token_embd` se cuantizan de forma independiente en seis niveles (VERY-LOW a HIGHEST). La conversión también incorpora una corrección del layout Q/K (interleaved) necesaria para que el NVFP4 funcione correctamente, junto con la absorción de la QK-norm y el factor de escala `qk_scale_factor=3.87` en tensores dedicados.

## Capacidades

- Generación de texto y razonamiento de largo alcance gracias a los 131K tokens de contexto.
- Soporte de tool calling / function calling (según la ficha de NVIDIA NIM).
- Capacidades agénticas: diseño orientado a tareas autónomas y multi-step reasoning.
- Multilingüe (aunque el README indica inglés como idioma principal).
- En el modelo original: procesamiento de imágenes y video (VLM), pero **no incluido** en esta conversión GGUF (sin mmproj, solo texto).
- Modo de razonamiento separado (según NVIDIA NIM), aunque no verificado en la conversión.

## Casos de uso

- Asistentes de código con contexto largo: el modelo puede manejar repositorios completos gracias a su ventana de 131K tokens, permitiendo generar, explicar o refactorizar código con conocimiento del proyecto.
- Agentes autónomos de automatización: su soporte de tool calling y razonamiento multi-paso lo hace adecuado para orquestar flujos de trabajo (envío de correos, consultas a APIs, gestión de calendarios) en entornos locales.
- Análisis de documentos extensos: contratos, informes o papers científicos pueden procesarse completos sin truncamiento, extrayendo conclusiones o respondiendo preguntas específicas.
- Chatbots de atención al cliente: con contexto largo y capacidad multilingüe, puede mantener conversaciones coherentes con historial extenso y personalizar respuestas según el tono de la empresa.
- Generación de contenido técnico: documentación, tutoriales o respuestas en foros especializados, con razonamiento estructurado y precisión en temas complejos.
- Sistemas RAG (Retrieval-Augmented Generation): al integrarse con bases de datos vectoriales, puede responder consultas con contexto amplio y citar fuentes, gracias a su capacidad de procesar fragmentos largos.
- Prototipado de aplicaciones multimodales: aunque esta conversión es solo texto, el modelo base soporta imágenes; con el mmproj adecuado podría usarse para descripción de imágenes, OCR o análisis visual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K u otros para esta conversión específica ni para el modelo base en las fuentes consultadas.

## Requisitos de hardware

- Tamaños de archivo: entre 14,1 GB (VERY-LOW) y 18,2 GB (HIGHEST). La VRAM necesaria para inferencia depende del archivo y del contexto usado; con contexto completo (131K) se requeriría más memoria, pero con contextos reducidos (8K-32K) caben en GPUs de 16-24 GB.
- GPUs recomendadas: RTX 4090 (24 GB), RTX 4080 (16 GB), A100 (40 GB) o superiores. Para el archivo HIGHEST con contexto largo se recomienda al menos 32 GB.
- En consumer GPU: sí, los archivos de menor tamaño (14-15 GB) pueden ejecutarse en RTX 4080/4090 con cuantización y contexto moderado.
- Opciones de despliegue: llama.cpp (requiere el fork de gabrielcosi, commit `9ec0ea18` o posterior), Ollama (según la entrada de ollama.com), y potencialmente otros motores GGUF compatibles.
- Latencia y throughput: no disponibles en la documentación. Dependerá del hardware y del archivo elegido; el backbone NVFP4 está optimizado para Blackwell, por lo que en GPUs RTX 50xx se espera un rendimiento superior.

## Comparativa con modelos similares

No se dispone de datos comparativos directos con otros modelos de 30B en las fuentes consultadas. Como referencia, se puede comparar con:

| Modelo | Parámetros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Muse-Glimmer-30B (base) | 30B | 131K | Apache 2.0 | safetensors (BF16/NVFP4) |
| Qwen3-30B-A3B (MoE) | 30B total, 3B activos | 32K (extensible) | Apache 2.0 | safetensors, GGUF |
| Llama-3.1-8B | 8B | 128K | Llama 3.1 Community | safetensors, GGUF |

Muse-Glimmer destaca por su contexto nativo de 131K y su naturaleza multimodal (en el modelo base), mientras que Qwen3-30B-A3B es un MoE más eficiente en activación. No se han encontrado benchmarks comparativos publicados.

## Limitaciones y advertencias

- **Requisito de runtime específico**: los archivos GGUF necesitan el fork de gabrielcosi de llama.cpp (commit `9ec0ea18` o posterior) o el fix sin fusionar #27178. En builds estándar, el modelo carga pero genera salidas corruptas (artefactos de repetición, atención con layout incorrecto).
- **Sin visión en esta conversión**: el vision tower no está incluido; solo se puede usar como modelo de texto. El README advierte que no se ha probado la visión con estas conversiones.
- **Riesgo de alucinación**: como todo LLM, puede generar información falsa o no verificada, especialmente en tareas de razonamiento complejo.
- **Sesgos potenciales**: al ser un modelo multilingüe entrenado por Meta, puede heredar sesgos de los datos de entrenamiento; no se han documentado evaluaciones específicas de sesgo.
- **Licencia**: Apache 2.0 permite uso comercial, pero es recomendable revisar los términos de la licencia del modelo base de Meta (Apache 2.0 también) y las condiciones de Red Hat AI para el checkpoint NVFP4.
- **Soporte limitado**: al ser una conversión de terceros, no hay garantía de mantenimiento ni soporte oficial de Meta o Red Hat.

## Enlaces

- Repositorio HuggingFace de la conversión: https://huggingface.co/esatapedico/Muse-Glimmer-30B-NVFP4-GGUF
- Modelo base en HuggingFace (Red Hat AI): https://huggingface.co/RedHatAI/Muse-Glimmer-30B-NVFP4
- Modelo original de Meta: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Entrada en Ollama: https://ollama.com/library/muse-glimmer:30b-nvfp4
- Página de NVIDIA NIM: https://build.nvidia.com/meta/muse-glimmer-30b
- Repositorio de ejemplo (cobusgreyling): https://github.com/cobusgreyling/Muse-Glimmer
- Issue de llama.cpp sobre el fix NVFP4: https://github.com/ggml-org/llama.cpp/issues/27178
- Fork de gabrielcosi de llama.cpp: https://github.com/gabrielcosi/llama.cpp
