# OBLITERATUS/Qwen3.8-27B-OBLITERATED

## Resumen

El modelo `OBLITERATUS/Qwen3.8-27B-OBLITERATED` es una variante de la comunidad del modelo base `Qwen3.8-27B` de Alibaba, modificada mediante técnicas de *abliteration*. El objetivo de esta técnica, implementada por el toolkit OBLITERATUS de elder-plinius, es eliminar quirúrgicamente las representaciones internas responsables de los comportamientos de rechazo (*refusal*) del modelo, sin necesidad de reentrenamiento ni ajuste fino. El resultado es un modelo que responde a prácticamente cualquier petición, incluida aquella que el modelo base rechazaría.

El modelo base Qwen3.8-27B es un LLM multimodal denso de 27.781 millones de parámetros, con una arquitectura híbrida que combina atención lineal en 48 de sus 64 capas, un *vision tower* para entrada de imágenes, un *draft head* MTP (multi-token prediction) integrado y una ventana de contexto nativa de 262.144 tokens, extensible hasta 1 millón. Está diseñado por el equipo de Qwen (Alibaba) para destacar en tareas de programación, flujos de trabajo agénticos y automatización de oficina.

Esta versión "OBLITERATED" se distribuye en formato `safetensors` y `GGUF`, aunque el repositorio en HuggingFace no especifica licencia ni idiomas soportados. Es una opción relevante para desarrolladores que necesitan un modelo de alto rendimiento sin las restricciones de rechazo del original, aunque con advertencias importantes sobre su uso ético y legal.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido denso con linear attention en 48 de 64 capas, vision tower y MTP draft head |
| Parametros totales | 27.781.427.952 |
| Parametros activos | No aplicable (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos, extensible a 1.000.000 |
| Tipos de cuantizacion | Safetensors (BF16) y GGUF (cuantizaciones no especificadas) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B utiliza una arquitectura de transformer denso con *linear attention* en 48 de las 64 capas, lo que reduce el costo computacional para contextos largos manteniendo la capacidad de atención completa en las capas restantes. Incluye un *vision tower* que permite procesamiento multimodal (imágenes), y un *draft head* de predicción múltiple de tokens (MTP) para acelerar la decodificación especulativa. La ventana de contexto nativa es de 262.144 tokens, ampliable a 1M mediante técnicas de interpolación.

El proceso de *abliteration* aplicado por OBLITERATUS no modifica los pesos del modelo original, sino que identifica y elimina las direcciones en el espacio de representaciones internas que correlacionan con la generación de respuestas de rechazo. Este método, basado en la técnica de *abliteration* descrita en el repositorio de elder-plinius, se realiza sin reentrenamiento y preserva las capacidades generales del modelo. No se han publicado detalles específicos sobre el dataset o el procedimiento exacto aplicado a esta variante concreta.

## Capacidades

- Generación de texto y razonamiento: mantiene las capacidades del modelo base Qwen3.8-27B en tareas de lenguaje natural.
- Programación: excelente rendimiento en generación, revisión y depuración de código, según la descripción oficial.
- Agentes y flujos de trabajo multi-paso: soporte para razonamiento encadenado y uso de herramientas.
- Automatización de oficina: procesamiento de documentos, correos electrónicos, resúmenes y tareas administrativas.
- Multimodalidad: entrada de imágenes a través del *vision tower*, permitiendo descripción y análisis de contenido visual.
- Sin rechazo: el modelo no muestra comportamientos de *refusal* para peticiones que el modelo original rechazaría (contenido violento, ilegal, etc.).
- Soporte de tool calling y function calling: heredado del modelo base, aunque no se documenta explícitamente en esta variante.
- Decodificación especulativa: el MTP draft head permite acelerar la inferencia en entornos que lo soporten (como vLLM).

## Casos de uso

- **Asistente de investigación sin restricciones**: investigadores pueden explorar temas sensibles (violencia, drogas, armas) sin que el modelo se niegue a responder, facilitando análisis académicos o periodísticos.
- **Generación de código en producción**: el modelo base está optimizado para programación; la variante abliterada mantiene esa capacidad, pudiendo integrarse en pipelines de CI/CD para generar y revisar código sin filtros que interrumpan el flujo.
- **Automatización de oficina**: procesar correos, documentos y reportes con contexto largo (hasta 262K tokens) es viable, permitiendo manejar contratos o informes extensos de una sola vez.
- **Desarrollo de agentes conversacionales**: con tool calling y capacidad de razonamiento multi-paso, puede construir asistentes que ejecuten tareas complejas sin rechazar solicitudes intermedias.
- **Análisis de contenido multimodal**: al aceptar imágenes, puede usarse para describir, resumir o extraer información de imágenes, útil en sistemas de archivo automático.
- **Pruebas de seguridad y evaluación**: el modelo sirve para testear sistemas de moderación o evaluar la robustez de otros modelos ante prompts maliciosos, gracias a su comportamiento sin rechazo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para la variante `OBLITERATUS/Qwen3.8-27B-OBLITERATED` en la información disponible. El modelo base `Qwen3.8-27B` ha demostrado buen rendimiento en tareas de programación y razonamiento según la documentación oficial, pero no se proporcionan números concretos en esta ficha. Se recomienda consultar el repositorio original de Qwen para obtener datos de evaluación comparativa.

## Requisitos de hardware

- **VRAM estimada**: con 27.781 millones de parámetros, el modelo en BF16 ocupa aproximadamente 55,6 GB. Para cuantizaciones de 8 bits (~28 GB), 4 bits (~14 GB) o GGUF de menor precisión, se reduce proporcionalmente.
- **GPU recomendadas**: para inferencia en BF16 se necesitan GPUs profesionales como A100 (80 GB) o H100. Con cuantización de 4 bits, es viable en una RTX 4090 (24 GB) o RTX 3090 (24 GB), aunque con limitaciones de velocidad.
- **GPU consumer**: sí, si se utiliza cuantización GGUF (por ejemplo, Q4_K_M) que reduce los requisitos a ~15 GB de VRAM.
- **Opciones de despliegue**: vLLM (soporta el modelo con MTP draft head), llama.cpp (para GGUF), Ollama, y servidores compatibles con endpoints.
- **Latencia y throughput**: no se han publicado datos específicos. Con decodificación especulativa, se espera una mejora de 1.5-2x en velocidad de generación comparado con modelos densos de tamaño similar.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27,8 B | 262K nativo, 1M ext. | Sí | Apache 2.0 (según Qwen) | HuggingFace, vLLM |
| OBLITERATUS/Qwen3.8-27B-OBLITERATED | 27,8 B | 262K nativo | Sí | No disponible | HuggingFace |
| Qwen3.8-27B AEON Uncensored | 27,8 B | 262K nativo | Sí | No disponible | HuggingFace (community) |
| Llama 3.1 27B (hipotético) | 27 B | 128K | No | Llama License | - |

La comparativa directa con otros modelos de 27B es limitada. La variante AEON Uncensored es otro abliterado del mismo modelo base, pero con metodología diferente (KL-drift y testing de rechazo). No se dispone de datos de rendimiento comparativo entre estas variantes.

## Limitaciones y advertencias

- **Sesgos conocidos**: al eliminar los mecanismos de rechazo, el modelo puede generar contenido dañino, ilegal o no ético sin restricciones. Esto no significa que el modelo no tenga sesgos, sino que no los filtra.
- **Riesgo de alucinación**: al igual que otros LLMs, puede inventar información, especialmente en temas sensibles donde no hay datos fiables.
- **Limitaciones de contexto**: aunque la ventana es de 262K tokens, el rendimiento en contextos muy largos puede degradarse si no se usa la extensión a 1M adecuadamente.
- **Restricciones de licencia**: la licencia no está especificada en HuggingFace, lo que genera incertidumbre legal para uso comercial o redistribución. El modelo base Qwen3.8-27B usa Apache 2.0, pero la variante abliterada no lo declara.
- **Idiomas**: no se especifican los idiomas soportados; se asume que hereda los del modelo base (principalmente inglés y chino, con algo de multilingüismo).
- **Producción**: al no tener licencia clara, no se recomienda desplegar en entornos empresariales sin consultar legalmente.
- **Eliminación de refusals**: el proceso puede degradar la calidad en tareas que requieren adherencia a normas de seguridad, como moderación de contenido.

## Enlaces

- [HuggingFace - OBLITERATUS/Qwen3.8-27B-OBLITERATED](https://huggingface.co/OBLITERATUS/Qwen3.8-27B-OBLITERATED)
- [GitHub - AlibabaCloud-Official/Qwen3.8-27B](https://github.com/AlibabaCloud-Official/Qwen3.8-27B)
- [GitHub - elder-plinius/OBLITERATUS](https://github.com/elder-plinius/OBLITERATUS)
- [vLLM Recipes - Qwen/Qwen3.8-27B](https://recipes.vllm.ai/Qwen/Qwen3.8-27B)
- [Blog - Qwen3.8-27B AEON Uncensored](https://www.mindstudio.ai/blog/qwen3-8-27b-aeon-uncensored-abliteration)
- [Friendli.ai - Qwen3.8-27B-OBLITERATUS-Advanced](https://friendli.ai/models/orwelian84/Qwen3.8-27B-OBLITERATUS-Advanced)
