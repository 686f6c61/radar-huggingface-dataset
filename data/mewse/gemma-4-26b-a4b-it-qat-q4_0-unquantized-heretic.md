# mewse/gemma-4-26B-A4B-it-qat-q4_0-unquantized-heretic

## Resumen

El modelo **mewse/gemma-4-26B-A4B-it-qat-q4_0-unquantized-heretic** es una versión descensurada (decensored) del modelo multimodal **google/gemma-4-26B-A4B-it-qat-q4_0-unquantized** de Google DeepMind, generada mediante la herramienta Heretic v1.4.0. El proceso de abliteración elimina las direcciones de rechazo en las capas de atención y MLP, reduciendo drásticamente los rechazos (refusals) del modelo ante peticiones sensibles, pasando de 100/100 en el original a 32/100 en esta variante, con una divergencia KL de 0,0869 respecto al modelo base.

Se trata de un modelo multimodal que procesa texto e imágenes y genera texto, con arquitectura Mixture-of-Experts (MoE) de 26.8B parámetros totales y 4B activos (según la denominación A4B). Soporta un contexto de hasta 256K tokens y más de 140 idiomas, según las especificaciones del modelo base. Los pesos están en formato safetensors, extraídos de la tubería de entrenamiento con cuantización consciente (QAT) y presentados en precisión bfloat16 (sin cuantizar). La licencia es Apache 2.0, lo que permite uso comercial y modificación libre.

La relevancia de este modelo radica en ofrecer una alternativa abierta y multimodal con capacidades de razonamiento y agencia, pero sin las restricciones de contenido habituales, lo que puede ser útil en entornos de investigación o aplicaciones creativas donde se requiere respuestas sin censura, aunque con las advertencias éticas y de seguridad correspondientes.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con atención híbrida (sliding window + global attention) |
| Parametros totales | 25.805.933.872 (≈25,8B) |
| Parametros activos | 4B (inferido de la denominación A4B) |
| Longitud de contexto | 256K tokens |
| Tipos de cuantizacion | No cuantizado (bfloat16); compatible con cuantización QAT (GGUF Q4_0, w8a16, wNa8o8) |
| Idiomas soportados | Más de 140 (según modelo base Gemma 4) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento
El modelo base `google/gemma-4-26B-A4B-it-qat-q4_0-unquantized` es un modelo multimodal de Google DeepMind, con arquitectura MoE que intercala atención local de ventana deslizante con atención global completa. Este checkpoint QAT (Quantization-Aware Training) se entrena con pesos en bfloat16 pero optimizados para cuantización a 4 bits, lo que permite mantener la calidad mientras se reduce el consumo de memoria. La versión heretic se obtiene mediante abliteración, un proceso que identifica y elimina las direcciones de representación asociadas a comportamientos de rechazo en las capas de atención (o_proj) y MLP (down_proj). Los parámetros de abliteración se detallan en la model card: por ejemplo, `attn.o_proj.max_weight` de 1.49 y `mlp.down_proj.max_weight` de 1.17. El proceso es reproducible, ya que el repositorio incluye un directorio `reproduce` con instrucciones.

El entrenamiento del modelo base no se detalla en la información proporcionada, pero se sabe que incluye QAT y que los modelos Gemma 4 se entrenan con datos multilingües y multimodales. La variante heretic no añade entrenamiento adicional, solo modifica los pesos mediante abliteración.

## Capacidades
- Generación de texto y razonamiento, con soporte de modo de pensamiento configurable (thinking mode).
- Procesamiento multimodal: acepta imágenes como entrada y genera texto.
- Soporte nativo de function calling (llamada a herramientas).
- Capacidades de agente y razonamiento multi-paso.
- Multilingüe en más de 140 idiomas.
- Contexto largo de hasta 256K tokens, útil para conversaciones extensas o documentos largos.
- Reducción de rechazos: puede responder a peticiones que el modelo original rechazaría, aunque no es completamente sin censura (32/100 rechazos).
- Compatibilidad con decodificación especulativa si se usa un modelo asistente QAT del mismo tamaño.

## Casos de uso
- Generación de contenido creativo sin restricciones temáticas: novelas, guiones o poesía que aborden temas sensibles sin censura automática.
- Roleplay y simulación de personajes en entornos de entretenimiento interactivo, donde se requieren respuestas menos inhibidas.
- Análisis de textos o discursos polémicos en investigación social, para estudiar argumentos sin sesgo de filtrado.
- Asistente de codigo en entornos de desarrollo: soporta function calling y puede integrarse en pipelines de CI/CD para generar documentación, revisar código o automatizar tareas.
- Agentes multimodales que necesitan interpretar imágenes y responder a instrucciones complejas, como asistentes de accesibilidad o herramientas de análisis de imágenes.
- Chatbots de atención al cliente en entornos multilingües con contexto largo, capaces de manejar conversaciones extensas y resolver consultas técnicas.
- Generación de informes o resúmenes de documentos largos (hasta 256K tokens) en dominios donde se requiere precisión y contexto amplio.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card solo proporciona dos métricas de evaluación comparativa con el modelo original:

| Metrica | Este modelo | Original (google/gemma-4-26B-A4B-it-qat-q4_0-unquantized) |
| :------ | :--------: | :---------------------------: |
| KL divergence | 0,0869 | 0 (por definición) |
| Refusals | 32/100 | 100/100 |

Estos datos indican una desviación leve del comportamiento original y una reducción significativa de rechazos, pero no se puede evaluar el rendimiento en tareas generales.

## Requisitos de hardware
- El modelo sin cuantizar (bfloat16) requiere aproximadamente 51,7 GB de VRAM (el tamaño del repo es de 51,7 GB), por lo que necesita una GPU con al menos 52 GB de memoria, como una A100 80GB, H100 80GB o una configuración multi-GPU.
- Con cuantización Q4_K_M, se estima que ocupa unos 16,57 GB de VRAM (según llmrun.dev), lo que permitiría su ejecución en GPUs de consumo como RTX 4090 (24 GB) o RTX 4080 (16 GB) con cuantización.
- Es posible usar herramientas de inferencia como vLLM, llama.cpp, Ollama o TGI, que soportan formatos GGUF y cuantización.
- No se han proporcionado datos de latencia o throughput específicos para este modelo.
- La arquitectura MoE con 4B parámetros activos reduce el coste de inferencia respecto a un modelo denso de 26B, lo que mejora el rendimiento en GPUs con limitación de memoria.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Refusals |
| :----- | :----------------: | :----------------: | :------: | :------: | :-------: |
| mewse/gemma-4-26B-A4B-it-qat-q4_0-unquantized-heretic | 25,8B | 4B | 256K | Apache 2.0 | 32/100 |
| google/gemma-4-26B-A4B-it-qat-q4_0-unquantized | 25,8B | 4B | 256K | Apache 2.0 | 100/100 |
| google/gemma-4-26B-A4B-it (sin QAT) | 25,8B | 4B | 256K | Apache 2.0 | no disponible |

No se dispone de comparaciones con modelos de otros fabricantes, como Llama 3.1 70B o Mistral Large, ya que no se ha encontrado información al respecto en los datos proporcionados.

## Limitaciones y advertencias
- El proceso de abliteración reduce rechazos pero no elimina los sesgos inherentes del modelo base; puede generar contenido inapropiado o dañino.
- La calidad general puede verse afectada ligeramente (KL divergence de 0,0869), por lo que el rendimiento en tareas complejas podría ser marginalmente inferior al original.
- Aunque la licencia Apache 2.0 permite uso comercial, el contenido generado puede infringir políticas de seguridad de las plataformas o normativas legales.
- No se han publicado evaluaciones de seguridad o de sesgos específicas para esta versión descensurada.
- El modelo aún muestra un 32% de rechazos, por lo que no es completamente sin censura.
- La documentación de la model card no especifica los idiomas concretos soportados más allá de la referencia al modelo base.
- Al ser un modelo multimodal, se requiere que la entrada de imágenes siga el formato esperado por Gemma 4; no se proporcionan detalles de preprocesado en este repositorio.

## Enlaces
- [Hugging Face - mewse/gemma-4-26B-A4B-it-qat-q4_0-unquantized-heretic](https://huggingface.co/mewse/gemma-4-26B-A4B-it-qat-q4_0-unquantized-heretic)
- [Hugging Face - google/gemma-4-26B-A4B-it-qat-q4_0-unquantized (modelo base)](https://huggingface.co/google/gemma-4-26B-A4B-it-qat-q4_0-unquantized)
- [Hugging Face - google/gemma-4-26B-A4B-it (modelo original)](https://huggingface.co/google/gemma-4-26B-A4B-it)
- [Heretic Project](https://heretic-project.org)
- [Blog de lanzamiento de QAT Gemma 4](https://blog.google/innovation-and-ai/technology/developers-tools/quantization-aware-training-gemma-4/)
- [Technical Report (arXiv)](https://arxiv.org/abs/2607.02770)
- [Documentación de Gemma 4](https://ai.google.dev/gemma/docs/core)
- [llmrun.dev - hardware requirements](https://llmrun.dev/model/google-gemma-4-26b-a4b-it-qat-q4-0-unquantized)
