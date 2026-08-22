# Alniyat5f/WuQi-V3-Onyx-27B

## Resumen

WuQi-V3-Onyx-27B es un modelo de lenguaje de 27 mil millones de parámetros desarrollado por el proyecto WuQi de Alniyat5f, construido mediante ajuste fino LoRA sobre el modelo base Qwen3.8-27B de Alibaba Cloud. Se trata de un modelo orientado a tareas agénticas, diseñado específicamente para entornos de ejecución de agentes con soporte de herramientas, planificación de tareas multi-etapa y razonamiento extenso. El modelo conserva las capacidades multimodales del modelo base (arquitectura qwen3_5) y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones.

La relevancia de este modelo radica en su optimización específica para el harness DeepSeek (DSH), con cobertura de 12 tipos de herramientas y una reducción notable en el consumo de tokens de razonamiento (86 % menos en Reason y 60 % menos en Output total respecto al modelo base). El modelo se presenta como versión Preview (WuQi-V3-Onyx-27B-XXXIII_I) y está pensado para desarrolladores que necesitan un modelo de código abierto eficiente en coste de tokens para pipelines de agentes complejos. La ventana de contexto alcanza 262 144 tokens en configuración de despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (transformer denso, multimodal nativo) |
| Parametros totales | 27 781 427 952 (27,8 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens (configuracion de despliegue) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (Transformers) |

## Arquitectura y entrenamiento

WuQi-V3-Onyx-27B parte de los pesos oficiales de Qwen3.8-27B, un modelo denso de 27B parámetros con arquitectura qwen3_5 que conserva las capacidades multimodales nativas del modelo base (entrada de imagen y texto). El proceso de post-entrenamiento utiliza LoRA (Low-Rank Adaptation) sobre datos de dominio, seguido de fusión de pesos y despliegue. El entrenamiento se centra en tres ejes: la «lógica WuQi» (toma de decisiones, priorización de observaciones, flexibilidad, verificación cruzada y decisiones de equilibrio), la «virtud» (calidez en el lenguaje, rigor científico, no evasión de errores, asistencia eficiente sin condescendencia) y la optimización de CoT (cadena de pensamiento) para reducir el gasto de tokens de razonamiento. Además, se realiza una adaptación dirigida a agentes (DSH) con datos de trayectorias multi-etapa que incluyen fases de búsqueda, planificación, codificación, subagentes, procesos en segundo plano y verificación.

## Capacidades

- Generación de texto y razonamiento complejo con cadena de pensamiento optimizada.
- Razonamiento multimodal: conserva la capacidad de entrada de imagen-texto del modelo base.
- Tool calling: soporte de 12 tipos de herramientas del harness DeepSeek (bash, read, write, glob, grep, run_code, web_search, web_fetch, todo_write, subagent, job_list, skill).
- Ejecución de tareas agénticas multi-etapa con planificación y verificación.
- Razonamiento de múltiples pasos con dependencias encadenadas (hasta nivel 4 de profundidad).
- Capacidades multilingües limitadas (el modelo está orientado al chino).
- Activación de capacidades mediante un sysprompt específico («Wuqi»), con inyección automática en el chat_template si no hay system definido.

## Casos de uso

- Automatización de atención al cliente con contexto largo: el modelo puede gestionar conversaciones multi-turno con ventanas de 262k tokens, manteniendo el hilo de una interacción prolongada y consultando herramientas externas (web_search, web_fetch) para resolver dudas con datos actualizados.
- Generación de código en producción: con soporte de tool calling (run_code, bash, glob, grep) puede integrarse en pipelines de CI/CD para generar, ejecutar y verificar código de forma autónoma en entornos de pruebas.
- Agentes de investigación con subagentes: el modelo puede delegar subtareas a subagentes, coordinar resultados y validar conclusiones mediante fases de verificación, adecuado para tareas de análisis complejas que requieren búsqueda web y lectura de documentos.
- Gestión de tareas de datos con múltiples herramientas: puede combinar bash, read, write y grep para procesar conjuntos de datos, detectar inconsistencias y generar informes estructurados con verificación cruzada.
- Desarrollo de agentes de automatización de operaciones de TI: el modelo puede gestionar flujos de trabajo con permisos de ejecución de comandos, manejar errores de permisos y adaptar sus acciones ante datos corruptos o comandos fallidos.
- Prototipado de asistentes personales de escritorio: con la integración en marcos como llama.cpp u Ollama, puede desplegarse en una estación de trabajo con GPU de gama media para tareas de asistencia personal y gestión de tareas.

## Benchmarks y rendimiento

El modelo se evaluó con el benchmark propio Alniyat-DSH-Bench-Basic, que cubre 24 tareas agénticas clasificadas en niveles simple, medium, hard, comprehensive, ultra_i y ultra_ii. Los resultados comparados con el modelo base Qwen3.8-27B y DeepSeekV4Flash (0731) son:

| Eval Set | Dificultad | WuQi-V3-Onyx-27B | Qwen3.8-27B | DeepSeekV4Flash (0731) |
|---|---|---|---|---|
| S01-S06 | simple | 100 x6 | 100 x6 | 100 x6 |
| M01-M04 | medium | 100 x4 | 100 x4 | 100 x4 |
| H01 | hard | 100 | 90 | 100 |
| H02 | hard | 100 | 100 | 100 |
| H03 | hard | 100 | 100 | 100 |
| H04 | hard | 85 | 85 | 85 |
| X01 | comprehensive | 100 | 100 | 100 |
| X02 | comprehensive | 65 | 30 | 100 |
| X03 | comprehensive | 100 | 90 | 100 |
| X04 | comprehensive | 100 | 100 | 100 |
| U1-01 | ultra_i | 85 | 100 | 100 |
| U1-02 | ultra_i | 100 | 100 | 100 |
| U1-03 | ultra_i | 100 | 95 | 100 |
| U1-04 | ultra_i | 100 | 100 | 100 |
| U2-01 | ultra_ii | 85 | 60 | 85 |
| U2-02 | ultra_ii | 90 | 100 | 100 |
| **Total** | | **2310** | **2250** | **2370** |
| **Porcentaje** | | **96,2 %** | **93,8 %** | **98,8 %** |

El consumo de tokens en el benchmark es notablemente inferior al del modelo base: WuQi-V3-Onyx-27B usa 2,38 M tokens de entrada, 11 744 tokens de razonamiento y 43 731 de salida (55 475 totales de salida), frente a 3,04 M de entrada, 85 305 de razonamiento y 48 910 de salida del Qwen3.8-27B. Esto supone una reducción del 86 % en Reason y del 60 % en Output total.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 56 GB (27,8 B parámetros x 2 bytes). Con cuantización int4, se reduce a unos 14 GB.
- GPU recomendadas: para inferencia en fp16, una A100 (80 GB) o H100 (80 GB) es adecuada. Con cuantización int4 o int8, una RTX 4090 (24 GB) o RTX 6000 Ada (48 GB) puede ser suficiente.
- En consumer GPU: sí, con cuantización int4/int8 es viable en RTX 3090/4090 (24 GB) o inferiores con cuantización más agresiva.
- Opciones de despliegue: Transformers (huggingface), vLLM, SGLang, llama.cpp, Ollama (si se generan pesos GGUF).
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Puntos DSH-Bench | Consumo de tokens (Reason) |
|---|---|---|---|---|---|
| WuQi-V3-Onyx-27B | 27,8 B | 262 144 | Apache 2.0 | 2310 (96,2 %) | 11 744 |
| Qwen3.8-27B (base) | 27,8 B | 262 144 | Apache 2.0 | 2250 (93,8 %) | 85 305 |
| DeepSeekV4Flash (0731) | No disponible | No disponible | No disponible | 2370 (98,8 %) | 88 894 |

El modelo supera al base en el benchmark agéntico con una mejora del 2,4 % en precisión y una reducción drástica del coste de razonamiento. Se acerca al rendimiento de DeepSeekV4Flash, aunque este último obtiene una puntuación ligeramente superior (98,8 % frente a 96,2 %).

## Limitaciones y advertencias

- Versión Preview: el modelo se encuentra en estado de vista previa (versión XXXIII_I) y puede presentar cambios en futuras versiones.
- Idioma limitado: la orientación principal es el chino (zh); las capacidades en otros idiomas no están confirmadas ni evaluadas.
- Riesgo de alucinación: no se han publicado evaluaciones de robustez en tareas de hechos objetivos; se recomienda verificación cruzada en entornos de producción.
- Dependencia del sysprompt: el modelo requiere la activación de la personalidad «WuQi» mediante un system prompt específico. Si el marco de ejecución (harness) sobrescribe el system prompt, el comportamiento puede degradarse.
- Restricciones de contexto: aunque el contexto de despliegue es de 262 144 tokens, la calidad del modelo en contextos muy largos no se ha evaluado de forma independiente.
- Limitaciones de benchmarks: los resultados de Alniyat-DSH-Bench-Basic son internos del autor y no han sido validados por terceros ni comparados con benchmarks estándar (MMLU, HumanEval, etc.).
- Riesgo de alucinación en tareas agénticas: en entornos con datos corruptos o instrucciones contradictorias, el modelo puede tomar decisiones erróneas (puntuaciones de 85 en niveles ultra_ii sugieren margen de mejora).

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Alniyat5f/WuQi-V3-Onyx-27B
- Perfil del autor en GitHub: https://github.com/Alniyat5f
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Guía de Qwen 3.6-27B (referencia del modelo base): https://www.aimadetools.com/blog/qwen-3-6-27b-complete-guide/
- Análisis de Qwen3.6-27B: https://www.buildfastwithai.com/blogs/qwen3-6-27b-review-2026
- Página de Qwen3.6-27B en Jetson AI Lab: https://www.jetson-ai-lab.com/models/qwen3-6-27b/
