# IsValorum/Qwen3.8-27B-pi-adapted-VAL-APEX-I-MiniPlus-V3-GGUF

## Resumen

Qwen3.8-27B-pi-adapted-VAL-APEX-I-MiniPlus-V3-GGUF es una cuantización GGUF del modelo base `harness-hub/Qwen3.8-27B-pi-adapted`, publicada por el usuario IsValorum dentro de su serie "APEX Quantization Series". Se trata de un artefacto de inferencia, no de un modelo entrenado desde cero: el autor toma los pesos del modelo base, los audita tensor a tensor y aplica una mezcla quirúrgica de cuantizaciones (Q4_K, Q5_K, Q6_K, Q8_0, IQ3_S, IQ3_XXS, IQ4_XS y F32 en rutas recurrentes) para maximizar la calidad dentro de un presupuesto de 13,31 GiB.

El modelo base declara la arquitectura `qwen35`, que según el mapa de tensores auditado combina componentes de atención clásica (`attn_q`, `attn_k`, `attn_v`, `attn_output`) con componentes de tipo SSM/recurrente (`ssm_a`, `ssm_alpha`, `ssm_conv1d`, `ssm_dt`, `ssm_out`, `ssm_beta`), lo que apunta a una arquitectura híbrida transformer + state space. El sufijo "pi-adapted" y las etiquetas `agents`, `harness-adapter` y `mtp` sugieren un ajuste orientado a uso agéntico con adaptadores de harness y posible decodificación multi-token prediction.

La relevancia práctica es doble: por un lado, ofrece una vía para ejecutar un modelo de 27.320.697.856 parámetros en hardware de consumo gracias a la cuantización; por otro, el autor documenta de forma inusualmente detallada el mapa de cuantización por tensor, lo que permite auditar qué capas se han protegido con mayor precisión. La licencia es Apache 2.0 y el formato es directamente compatible con llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen35` (híbrida: atención + componentes SSM/recurrentes) |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mezcla por tensor: Q4_0, Q4_K, Q5_K, Q6_K, Q8_0, IQ3_S, IQ3_XXS, IQ4_XS, F32 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base emplea la arquitectura etiquetada como `qwen35`. El mapa de tensores auditado en esta cuantización revela 64 bloques (`blk.0` a `blk.63`) con dos familias de componentes: por un lado, proyecciones de atención (`attn_q`, `attn_k`, `attn_v`, `attn_output`, `attn_qkv`, `attn_gate`) presentes en subconjuntos de capas; por otro, parámetros de tipo SSM/recurrente (`ssm_a`, `ssm_alpha`, `ssm_beta`, `ssm_conv1d`, `ssm_dt.bias`, `ssm_out`) distribuidos en 48 capas. Esta combinación es característica de las arquitecturas híbridas que intercalan atención completa con capas de espacio de estados para reducir el coste de contexto largo.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO o ajuste por preferencias en el modelo base. Las etiquetas `pi-adapted`, `harness-adapter`, `agents` y `mtp` indican que el modelo base fue adaptado para interacción agéntica con harness y posiblemente decodificación especulativa multi-token, pero no se aportan detalles técnicos sobre esos ajustes.

La innovación destacable de esta publicación es la cuantización quirúrgica: las rutas recurrentes (`ssm_a`, `ssm_alpha`, `ssm_conv1d`, `ssm_dt.bias`) se mantienen en F32 (408 tensores observados), las proyecciones de atención de ciertas capas se elevan a Q5_K/Q6_K, y solo las proyecciones MLP densas se comprimen agresivamente con IQ3_S/IQ3_XXS. El resultado es un archivo de 13,31 GiB que preserva con mayor fidelidad los caminos sensibles del modelo híbrido.

## Capacidades

- Generación de texto conversacional (`pipeline_tag: text-generation`, etiqueta `conversational`).
- Uso agéntico: las etiquetas `agents` y `harness-adapter` indican adaptación para flujos de agente con herramientas.
- Integración con herramientas y MCP: la model card promociona V-Agent, que expone herramientas de ficheros, shell, búsqueda web, navegador autónomo, peticiones HTTP y servidores MCP.
- Compatibilidad con endpoints OpenAI/Claude: la etiqueta `endpoints_compatible` sugiere que el modelo puede servirse tras una API compatible.
- Posible decodificación multi-token prediction (etiqueta `mtp`), aunque no se documenta su funcionamiento.
- Capacidades multilingües: no disponible.
- Visión, audio u otras modalidades: no disponible.

## Casos de uso

- Agente local de escritorio: el modelo está pensado para ejecutarse dentro de V-Agent en Windows 10/11 con llama.cpp (CUDA, Vulkan o CPU), gestionando tareas de ficheros con historial de versiones, comandos de shell y peticiones HTTP con aprobación por acción. Su tamaño de 13,31 GiB permite cargarlo en equipos de consumo con GPU de gama alta.
- Automatización de búsqueda y navegación: al soportar herramientas de búsqueda web y navegador autónomo, puede emplearse para recopilar información de páginas, resumirla y almacenarla en ficheros locales, siempre con confirmación humana de cada acción.
- Asistencia de código en local: la validación de sintaxis y las comprobaciones de runtime HTML que ofrece V-Agent permiten usar el modelo para generar y verificar código sin salir del equipo, manteniendo el código fuente fuera de servicios en la nube.
- Integración con servidores MCP: el modelo puede conectarse a servidores MCP para exponer herramientas internas de una organización (bases de datos, APIs internas) y orquestar llamadas multi-paso desde un cliente compatible.
- Despliegue tras API compatible OpenAI/Claude: gracias a la etiqueta `endpoints_compatible`, puede servirse con un frontend que hable esos protocolos y usarse como backend de un asistente conversacional interno.
- Experimentación con arquitecturas híbridas: investigadores interesados en modelos que combinan atención y SSM pueden usar esta cuantización para estudiar el comportamiento de las rutas recurrentes preservadas en F32 sin necesidad de clústeres de GPU.
- Prototipado de flujos agénticos con presupuesto de VRAM ajustado: la serie APEX ofrece tres niveles (MiniPlus 13,31 GiB, NanoPlus 11,47 GiB, MicroPlus 9,77 GiB) para adaptar el modelo a distintas GPUs de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo MiniPlus ocupa 13,31 GiB, por lo que se recomienda un mínimo de 14-16 GiB de VRAM para cargarlo completo en GPU con contexto reducido; con contexto largo o KV cache grande, se necesitan 18-24 GiB.
- Alternativas de menor huella de la misma familia: NanoPlus (11,47 GiB) y MicroPlus (9,77 GiB), útiles para GPUs de 12 GiB y 10-12 GiB respectivamente.
- GPU recomendadas: NVIDIA RTX 4090 (24 GiB), RTX 3090 (24 GiB), RTX 4080 (16 GiB) para MiniPlus; GPUs de 12 GiB (RTX 3060 12 GB, RTX 4070) para NanoPlus; GPUs de 10-12 GiB para MicroPlus con contexto moderado.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 con holgura y en RTX 4080 con contexto limitado; en GPUs de 12 GiB conviene usar NanoPlus o MicroPlus.
- Opciones de despliegue: llama.cpp (builds oficiales CUDA, Vulkan y CPU), Strata y Strata Rust (según la model card); V-Agent como frontend de agente en Windows; cualquier servidor compatible con GGUF y endpoints OpenAI/Claude.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Huella |
|---|---|---|---|---|---|
| Qwen3.8-27B-pi-adapted VAL-APEX-I MiniPlus (este) | 27,3 B | no disponible | Apache 2.0 | GGUF | 13,31 GiB |
| Qwen3.8-27B-pi-adapted VAL-APEX-I NanoPlus | 27,3 B | no disponible | Apache 2.0 | GGUF | 11,47 GiB |
| Qwen3.8-27B-pi-adapted VAL-APEX-I MicroPlus | 27,3 B | no disponible | Apache 2.0 | GGUF | 9,77 GiB |
| Modelo base `harness-hub/Qwen3.8-27B-pi-adapted` | 27,3 B | no disponible | no disponible | safetensors (presumiblemente) | no disponible |

No se dispone de información sobre benchmarks ni sobre modelos de otras familias comparables en la documentación proporcionada, por lo que la comparación se limita a las variantes de la misma serie APEX.

## Limitaciones y advertencias

- Es una cuantización, no un modelo original: la calidad final depende del modelo base y de las decisiones de cuantización del autor; las capas MLP comprimidas con IQ3_S/IQ3_XXS pueden degradar tareas que dependan de esas proyecciones.
- Idiomas soportados no documentados: no se puede garantizar un rendimiento multilingüe adecuado sin evaluación previa.
- Longitud de contexto no disponible: no se puede planificar el uso en tareas de contexto largo sin verificar experimentalmente el límite efectivo.
- Riesgo de alucinación: inherente a los modelos generativos; en flujos agénticos con herramientas (shell, navegador, HTTP) una alucinación puede traducirse en acciones reales, por lo que la aprobación por acción que ofrece V-Agent es imprescindible.
- Sesgos conocidos: no documentados en la información disponible.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar que el modelo base `harness-hub/Qwen3.8-27B-pi-adapted` mantiene la misma licencia y que no impone restricciones adicionales.
- Procedencia de la iMatrix: la model card indica que se usó `unsloth/Qwen3.8-27B-GGUF/imatrix_unsloth.gguf` y que "la procedencia externa no se infiere", lo que implica que el autor no certifica el origen de esa matriz de importancia.
- Modelo de un autor individual: la cuantización se computó con clústeres financiados de forma privada; no hay garantía de mantenimiento continuo ni de soporte.
- Fecha de creación futura (2026-11-18): conviene verificar la autenticidad y vigencia del repositorio antes de integrarlo en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/IsValorum/Qwen3.8-27B-pi-adapted-VAL-APEX-I-MiniPlus-V3-GGUF
- Modelo base: https://huggingface.co/harness-hub/Qwen3.8-27B-pi-adapted
- Variante NanoPlus: https://huggingface.co/IsValorum/Qwen3.8-27B-pi-adapted-VAL-APEX-I-NanoPlus-V3-GGUF
- Variante MicroPlus: https://huggingface.co/IsValorum/Qwen3.8-27B-pi-adapted-VAL-APEX-I-MicroPlus-V3-GGUF
- Matriz de importancia usada: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- V-Agent (frontend de agente): https://github.com/IsValorum/V-Agent
- Descargas de V-Agent: https://github.com/IsValorum/V-Agent/releases/latest
- Apoyo al autor: https://ko-fi.com/isvalorum
