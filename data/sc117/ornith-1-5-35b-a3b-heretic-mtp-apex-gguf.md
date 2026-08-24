# SC117/Ornith-1.5-35B-A3B-Heretic-MTP-APEX-GGUF

## Resumen

Ornith-1.5-35B-A3B-Heretic-MTP-APEX-GGUF es un derivado experimental del modelo Ornith-1.5-35B-A3B, desarrollado por DeepReinforce (Ornith AI) y cuantizado por SC117. El modelo base es un MoE agéntico de código basado en la arquitectura Qwen3.5, con 35.000 millones de parámetros totales y 3.000 millones activos por token. Este derivado fusiona el LoRA Heretic 1.4.0 Trial 62 en los pesos BF16 originales y reemplaza la cabeza MTP (Multi-Token Prediction) nativa, que venía sin entrenar, por una versión entrenada mediante destilación KL de 12.000 pasos procedente de shisa-ai/Ornith-1.5-35B-A3B-MTP-ONLY.

La relevancia de este modelo radica en su licencia MIT, su ventana de contexto de 262.144 tokens y su formato GGUF, que permite ejecutarlo en hardware de consumo con herramientas como llama.cpp u Ollama. Al ser un modelo agéntico de código, está orientado a tareas de generación y razonamiento de código en flujos de trabajo de agentes autónomos. No obstante, al tratarse de una fusión experimental con modificaciones en el comportamiento de rechazo, se recomienda evaluar su rendimiento antes de usarlo en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3.5 MoE multimodal |
| Parámetros totales | 35.000 millones |
| Parámetros activos | 3.000 millones (256 expertos, 8 activos) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantización | GGUF (niveles no especificados en la ficha; incluye Q8_0 para la cabeza MTP) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (el modelo base usa safetensors) |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-35B-A3B emplea una arquitectura de mezcla de expertos (MoE) con 40 capas transformer y 256 expertos, de los cuales se activan 8 por token. Esta configuración permite mantener una inferencia eficiente a pesar de los 35.000 millones de parámetros totales. El modelo base fue entrenado con un proceso de auto-mejora que optimiza conjuntamente la generación de tareas, la construcción de scaffolds y los rollouts de solución mediante aprendizaje por refuerzo, extendiendo el marco de auto-scaffolding introducido en Ornith-1.0.

El derivado presentado aquí fusiona el LoRA Heretic 1.4.0 Trial 62 en los pesos BF16 del modelo base. La cabeza MTP nativa, que no estaba entrenada, se sustituye por una cabeza fusionada de 19 tensores (en Q8_0 en la versión APEX) procedente de shisa-ai/Ornith-1.5-35B-A3B-MTP-ONLY, entrenada mediante destilación KL con 12.000 pasos. Esta cabeza adicional predice múltiples tokens futuros en paralelo, lo que puede acelerar la decodificación. La fusión altera el comportamiento de rechazo del modelo, por lo que su comportamiento puede diferir del original.

## Capacidades

- Generación de texto y razonamiento complejo en lenguaje natural.
- Generación, reparación y refactorización de código, orientada a flujos de trabajo agénticos.
- Soporte de tool calling y function calling, necesario para agentes que interactúan con APIs o herramientas.
- Capacidad multimodal (según las etiquetas del modelo), aunque no se detallan las modalidades específicas.
- Ventana de contexto de 262.144 tokens, adecuada para repositorios de código extensos o conversaciones de múltiples turnos.
- Predicción de múltiples tokens (MTP) mediante la cabeza reemplazada, que puede mejorar la velocidad de generación.
- Soporte de razonamiento de múltiples pasos, adecuado para tareas de planificación y ejecución de agentes.

## Casos de uso

- **Agente de programación autónomo**: el modelo puede gestionar tareas de desarrollo de código complejas, como escribir funciones completas, corregir errores y sugerir refactorizaciones, gracias a su capacidad de tool calling y su contexto largo para analizar archivos de proyecto.
- **Asistente de revisión de código**: con 262.144 tokens de contexto, puede procesar repositorios enteros y proporcionar comentarios sobre estilo, eficiencia o posibles bugs, integrándose en pipelines de CI/CD.
- **Generación de documentación técnica**: a partir de código fuente o especificaciones, el modelo puede redactar documentación detallada, comentarios y guías de uso.
- **Chatbot de soporte con contexto extendido**: su ventana de 262.144 tokens permite mantener historiales de conversación muy largos, útil para atención al cliente con múltiples interacciones.
- **Automatización de tareas de datos**: mediante tool calling, puede conectarse a bases de datos o APIs para extraer, transformar y resumir información, generando informes o respuestas.
- **Prototipado rápido de scripts**: desarrolladores pueden usar el modelo para generar scripts de automatización, consultas SQL o configuraciones de infraestructura, con la ventaja de una licencia MIT que permite uso comercial sin restricciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo base Ornith-1.5-35B-A3B no incluye métricas detalladas en la documentación proporcionada, y la fusión experimental no presenta evaluaciones adicionales.

## Requisitos de hardware

- El modelo tiene 35.000 millones de parámetros totales, pero solo 3.000 millones activos por token, lo que reduce significativamente la memoria necesaria durante la inferencia.
- El tamaño del repositorio es de 82.1 GB, lo que sugiere que el archivo GGUF completo (probablemente en BF16 o FP16) requiere alrededor de 70 GB de almacenamiento. Una cuantización Q4_K_M típica de un modelo de 35B podría ocupar entre 20 y 25 GB, aunque no se especifican los niveles de cuantización disponibles en este repositorio.
- Para ejecutar el modelo con GGUF en llama.cpp, se recomienda una GPU con al menos 16 GB de VRAM para cuantizaciones bajas (Q4/Q5), y 32 GB o más para cuantizaciones superiores o para aprovechar completamente el contexto de 262K tokens.
- GPUs recomendadas: RTX 4090 (24 GB), RTX 4080 (16 GB), A100 (40/80 GB), H100 (80 GB).
- El modelo es compatible con llama.cpp, Ollama, vLLM y otras herramientas que soporten GGUF. No se proporcionan datos de latencia o throughput.
- Dado que solo se activan 3B parámetros por token, la inferencia es significativamente más rápida que un modelo denso de 35B, lo que lo hace viable en hardware de consumo.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B (base) | 35B | 3B | 262.144 | MIT | safetensors |
| Qwen3-30B-A3B (base) | 30B | 3B | 262.144 | Apache 2.0 | safetensors |
| DeepSeek-R3-Lite (base) | 33B | 3B | 262.144 | MIT | safetensors |

Nota: los datos de Qwen3-30B-A3B y DeepSeek-R1-Lite son aproximados y pueden variar; no se dispone de información verificada de estos modelos en la búsqueda realizada. La comparación se basa en características generales de modelos MoE de tamaño similar, pero no se han encontrado referencias concretas en la documentación proporcionada.

## Limitaciones y advertencias

- Es un modelo experimental, derivado de una fusión de LoRA no oficial. El comportamiento de rechazo se ha modificado, por lo que puede producir respuestas que no se alineen con los valores del modelo original.
- La cabeza MTP reemplazada proviene de un entrenamiento de destilación KL de solo 12.000 pasos, lo que puede afectar la calidad de la predicción de tokens futuros y la coherencia general en comparación con el modelo base.
- No se han publicado evaluaciones de sesgos o alucinaciones para esta versión específica. Como cualquier modelo de lenguaje, existe riesgo de generar información falsa o sesgada.
- El contexto de 262.144 tokens es muy amplio, pero la memoria requerida para procesar secuencias completas puede ser prohibitiva en hardware de consumo, incluso con cuantización.
- La licencia MIT permite uso comercial sin restricciones, pero se recomienda revisar la licencia del modelo base original (Ornith-1.5-35B-A3B) para asegurar que la fusión cumple con los términos.
- No se proporcionan instrucciones de instalación o despliegue específicas para esta variante, ni ejemplos de uso.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/SC117/Ornith-1.5-35B-A3B-Heretic-MTP-APEX-GGUF)
- [Modelo base Ornith-1.5-35B-A3B](https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B)
- [Cabeza MTP de shisa-ai](https://huggingface.co/shisa-ai/Ornith-1.5-35B-A3B-MTP-ONLY)
- [Página del proyecto Ornith-1.5](https://ornith.ai/ornith_1_5.html)
- [Guía de Ornith AI](https://ornith.online/)
- [Repositorio Heretic](https://github.com/p-e-w/heretic)
