# amd/Hunyuan-1.8B-Instruct_rai_1.9.0_npu

## Resumen

Hunyuan-1.8B-Instruct_rai_1.9.0_npu es una distribución del modelo Tencent Hunyuan-1.8B-Instruct preparada por AMD para su ejecución sobre NPUs de la plataforma Ryzen AI. El repositorio lo publica la organización `amd` en HuggingFace y empaqueta el modelo en formato ONNX, cuantizado con Quark (la herramienta de compresión de AMD), para aprovechar la unidad de procesamiento neuronal integrada en los procesadores Ryzen AI. No se trata de un modelo nuevo, sino de una conversión y optimización del checkpoint original de Tencent para un backend de inferencia específico de hardware.

El modelo base pertenece a la familia Hunyuan (arquitectura `hunyuan_v1_dense`), con aproximadamente 1.800 millones de parámetros, orientado a generación de texto y conversación. Al ser una variante densa de pequeño tamaño, está pensado para despliegues en local y en el borde, donde el consumo energético y la latencia importan más que el rendimiento bruto en benchmarks.

La relevancia de esta ficha radica en que ejemplifica el patrón creciente de distribuciones vendor-specific: el mismo modelo publicado en múltiples formatos (safetensors, GGUF, ONNX para NPU) según el hardware objetivo. El acceso está restringido (gated) y la información pública del repositorio es mínima, por lo que muchos datos técnicos se marcan como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | hunyuan_v1_dense (transformer denso) |
| Parámetros totales | ~1.800 millones (según el nombre del modelo; no confirmado en la ficha del repo) |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | cuantización Quark para NPU (detalle de bits no disponible) |
| Idiomas soportados | inglés (tag `en`) |
| Licencia | other (licencia personalizada; acceso gated, requiere aceptar condiciones) |
| Formato de pesos | ONNX (optimizado para Ryzen AI NPU) |

## Arquitectura y entrenamiento

El modelo base sigue una arquitectura transformer densa identificada en los tags como `hunyuan_v1_dense`, con alrededor de 1.800 millones de parámetros y ajuste por instrucciones (sufijo `Instruct`). No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del corpus, ni si se aplicaron etapas de RLHF o DPO en el checkpoint original.

La contribución específica de este repositorio es la cadena de conversión: exportación a ONNX y cuantización con Quark para su ejecución en la NPU de Ryzen AI, empaquetada para el runtime RAI 1.9.0 (de ahí el sufijo `rai_1.9.0_npu`). Esto implica grafos optimizados y pesos comprimidos para el acelerador, no para GPU convencional. No se documentan innovaciones arquitectónicas propias ni técnicas de decodificación especulativa en la información disponible.

## Capacidades

- Generación de texto conversacional en inglés, con ajuste por instrucciones.
- Razonamiento básico y respuesta a preguntas de dominio general, limitado por el tamaño de 1.8B parámetros.
- Generación de código y tareas matemáticas sencillas (capacidad esperable del modelo base, no verificada en esta distribución).
- Ejecución en NPU de Ryzen AI mediante ONNX Runtime y el stack RAI 1.9.0.
- Soporte de tool calling y agentes multi-paso: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponibles.
- Modo thinking explícito: no disponible.

## Casos de uso

- Asistentes locales en portátiles y mini-PC con Ryzen AI: el modelo se ejecuta en la NPU, liberando la CPU y la GPU integrada para otras tareas y reduciendo el consumo energético en comparación con inferencia en CPU.
- Procesamiento de texto en el borde (edge computing): clasificación, resumen y extracción de entidades en dispositivos sin GPU dedicada, aprovechando el formato ONNX optimizado.
- Prototipado de aplicaciones de chat en inglés sobre hardware AMD: útil para equipos que ya trabajan con el stack Ryzen AI y quieren validar flujos conversacionales sin depender de la nube.
- Filtrado y moderación de contenido en local: tareas de clasificación y reescritura de baja latencia donde no es necesario un modelo grande.
- Automatización de documentación técnica en inglés: generación de borradores, resúmenes de incidencias y respuestas a preguntas frecuentes en entornos con requisitos de privacidad que impiden enviar datos a APIs externas.
- Evaluación comparativa de backends NPU frente a CPU/GPU: sirve como referencia para medir throughput y latencia del stack Quark/RAI en cargas de generación de texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- NPU integrada en procesadores AMD Ryzen AI compatibles con el runtime RAI 1.9.0 (modelos concretos de CPU no especificados en la información).
- El repositorio ocupa 2,7 GB, lo que sugiere pesos cuantizados; la VRAM/RAM necesaria para inferencia no está documentada.
- No está pensado para GPU NVIDIA ni para ejecución estándar en CUDA; el formato ONNX está orientado al acelerador de AMD.
- Opciones de despliegue: ONNX Runtime con el stack Ryzen AI (RAI) 1.9.0. Compatibilidad con vLLM, llama.cpp, Ollama o TGI: no disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hunyuan-1.8B-Instruct_rai_1.9.0_npu (este) | ~1.8B | no disponible | ONNX (NPU) | other, gated | HuggingFace, acceso restringido |
| Hunyuan-1.8B-Instruct (original Tencent) | ~1.8B | no disponible | safetensors | no disponible en esta ficha | HuggingFace |
| Qwen2.5-1.5B-Instruct | ~1.5B | 32K (según documentación pública del modelo) | safetensors, GGUF | Apache 2.0 | HuggingFace, abierto |
| Llama-3.2-1B-Instruct | ~1.2B | 128K (según documentación pública del modelo) | safetensors, GGUF | Llama 3.2 Community License | HuggingFace, gated |

La comparación directa con Qwen2.5-1.5B y Llama-3.2-1B es pertinente por rango de tamaño y propósito conversacional, pero este repositorio se distingue por su backend NPU y su licencia restrictiva, lo que limita su uso fuera del ecosistema Ryzen AI.

## Limitaciones y advertencias

- Acceso restringido: es necesario aceptar las condiciones en HuggingFace antes de descargar; no es un modelo de uso libre inmediato.
- Licencia `other`: conviene revisar los términos completos antes de cualquier uso comercial; no se garantiza permiso de redistribución.
- Solo inglés declarado: el rendimiento en castellano u otros idiomas no está validado y probablemente sea deficiente.
- Tamaño de 1.8B: mayor riesgo de alucinación y menor fiabilidad en razonamiento complejo, matemáticas avanzadas y código de producción que modelos de mayor escala.
- Dependencia de hardware: el formato ONNX cuantizado para NPU limita su portabilidad; no se ejecutará sin el stack Ryzen AI adecuado.
- Documentación mínima: sin datos de contexto, benchmarks ni composición del entrenamiento, la evaluación previa a producción requiere pruebas propias.
- Sin datos de sesgos: no se ha publicado información sobre sesgos conocidos en esta distribución.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/amd/Hunyuan-1.8B-Instruct_rai_1.9.0_npu
- Modelo base Hunyuan en HuggingFace: no disponible en la información proporcionada
- Documentación de Ryzen AI: no disponible en la información proporcionada
- Paper o blog de Quark (AMD): no disponible en la información proporcionada
