# dfwasfmdpwkjglnpwngwg/albedo-qwen3.6-35b-v17

## Resumen

El modelo `dfwasfmdpwkjglnpwngwg/albedo-qwen3.6-35b-v17` es un finetune de la arquitectura Qwen3.6-35B-A3B (MoE híbrida) con encoder de visión, desarrollado por el usuario individual `dfwasfmdpwkjglnpwngwg` como parte de la línea "Albedo SN97". Se trata de una variante posterior (v17) que, según la model card del autor, es una regresión de calidad respecto a la versión v16: el propio autor advierte explícitamente de que no se debe usar v17 por una "recat-overweight DPO regression". El modelo hereda las capacidades del modelo base `dendriteholdings/albedo-qwen3.6-35b-king-genesis`, que a su vez es un finetune de Qwen3.6-35B-A3B.

La relevancia de este modelo es limitada por su carácter experimental y por la advertencia del autor. Aun así, puede servir como ejemplo de un finetune de Qwen3.6 con visión y arquitectura MoE híbrida, aunque su uso en producción no está recomendado. El repositorio tiene 0 descargas y 0 likes, lo que confirma su baja adopción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE híbrida (Gated DeltaNet + Gated Attention) con encoder de visión, basada en Qwen3.6-35B-A3B |
| Parámetros totales | 34.660.610.688 (~34,66 mil millones) |
| Parámetros activos | No disponible (el modelo base Qwen3.6-35B-A3B tiene 3 mil millones activos, pero no se confirma para este finetune) |
| Longitud de contexto | No disponible (el modelo base Qwen3.6 soporta hasta 1M de tokens, pero no se confirma aquí) |
| Tipos de cuantización | No disponible (el repositorio contiene pesos en BF16, safetensors) |
| Idiomas soportados | No disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (BF16) |

## Arquitectura y entrenamiento

La arquitectura se hereda del modelo base Qwen3.6-35B-A3B, que es un modelo de lenguaje causal con un encoder de visión y una pila híbrida de bloques Gated DeltaNet y Gated Attention, con routing sparse MoE. En total tiene 35 mil millones de parámetros con 3 mil millones activos por token (según la documentación de Qwen3.6). El modelo `albedo-qwen3.6-35b-v17` es un finetune de la línea "king-genesis", que a su vez proviene de un proceso de SFT (v8–v11) y DPO (v13/v15/v16). La versión v17 se describe como una regresión DPO sobre prefijos de fallos en vivo, y el autor indica que no debe usarse en favor de v16. No se dispone de datos sobre el dataset de entrenamiento, número de tokens ni técnicas adicionales de optimización.

## Capacidades

- Procesamiento multimodal: acepta entrada de imagen y texto (pipeline `image-text-to-text`).
- Generación de texto conversacional y de razonamiento, heredadas de Qwen3.6.
- Soporte de tool calling y agentes: no confirmado explícitamente para este finetune, pero es una capacidad estándar de la familia Qwen3.6.
- Capacidades multilingües: no disponibles (los idiomas soportados no se han especificado).
- No se ha confirmado soporte de "thinking mode" ni otras características avanzadas en esta variante.

## Casos de uso

Dado el aviso del autor de no usar v17, los casos de uso prácticos son limitados. Aun así, si se considera el modelo como un finetune de Qwen3.6 con visión, se podrían plantear los siguientes escenarios, siempre con la advertencia de que la variante v17 no es recomendada:

- **Análisis de imágenes con texto**: el modelo puede recibir una imagen y responder preguntas sobre ella, útil para sistemas de descripción automática o asistencia visual en entornos controlados.
- **Agentes conversacionales con contexto largo**: si la base de 1M de tokens está disponible, podría usarse para diálogos multi-turno con historial extenso.
- **Generación de código con razonamiento**: la capacidad de razonamiento de Qwen3.6 se puede aplicar a tareas de programación, aunque no se ha validado en este finetune.
- **Extracción de información de documentos**: combinando visión y texto, puede extraer datos de capturas o escaneos.
- **Prototipado de investigación**: como ejemplo de un finetune MoE híbrido con visión, puede usarse para experimentos académicos sobre técnicas de DPO y SFT.
- **Evaluación de calidad de finetune**: sirve como caso de estudio para comparar variantes de DPO, aunque no se recomienda su uso en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de v16 menciona un "Policy one-turn eval 22/30" para esa versión, pero no hay datos para v17, y el autor indica que v17 es una regresión. No se pueden presentar tablas comparativas con números verificados.

## Requisitos de hardware

- **VRAM estimada**: el repositorio pesa 69,3 GB en BF16. Para inferencia con cuantización 4-bit, se necesitaría aproximadamente 17-18 GB de VRAM (si se logra cuantizar); con 8-bit, unos 35 GB. En BF16, se requieren al menos 70 GB de VRAM, lo que supera las GPU consumer comunes.
- **GPU recomendadas**: para ejecutar el modelo sin cuantizar, se necesitan GPUs profesionales como A100 (80 GB) o H100 (80 GB). Con cuantización 4-bit, podría caber en una RTX 4090 (24 GB) o RTX 6000 Ada (48 GB), pero no se ha validado.
- **Opciones de despliegue**: dado que es un modelo de transformers, se puede usar con vLLM, TGI, llama.cpp (si se convierte a GGUF), o Ollama. No se ha confirmado compatibilidad específica.
- **Latencia y throughput**: no hay datos disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Visión | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| albedo-qwen3.6-35b-v17 (este) | 34,66B | No disponible (base 3B) | No disponible (base 1M) | Sí | Apache-2.0 | HF (0 descargas) |
| Qwen3.6-35B-A3B (base) | 35B | 3B | 1M | Sí | Apache-2.0 | HF, Ollama, Azure |
| power612/albedo-qwen3.6-35b-e9a233a8 | 35B (según repo) | No disponible | No disponible | Sí | No especificada | HF (0 descargas) |

La comparativa muestra que el modelo base Qwen3.6-35B-A3B es la referencia principal, con documentación oficial y soporte en plataformas cloud. El finetune albedo v17 es una variante no validada, con menor soporte y sin datos de rendimiento comparables.

## Limitaciones y advertencias

- **Advertencia del autor**: la model card de v16 indica que v17 es una regresión DPO y que no debe usarse; se recomienda usar v11 o v16 para calidad.
- **Sesgos y alucinaciones**: no hay evaluación independiente; los riesgos de alucinación y sesgos son los mismos que los de la base Qwen3.6, pero sin verificación.
- **Contexto**: la longitud de contexto no está confirmada en este finetune; aunque la base soporta 1M, puede que no esté preservada.
- **Licencia**: Apache-2.0 permite uso comercial, pero el modelo no tiene validación de calidad, por lo que su uso en producción es arriesgado.
- **Soporte limitado**: el autor es un usuario individual, no hay documentación técnica adicional, y el modelo tiene 0 descargas, lo que indica una ausencia de comunidad.
- **Visión**: el modelo es image-text-to-text, pero no se han probado las capacidades de visión en este finetune.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/dfwasfmdpwkjglnpwngwg/albedo-qwen3.6-35b-v17)
- [Modelo similar power612/albedo-qwen3.6-35b-e9a233a8](https://huggingface.co/power612/albedo-qwen3.6-35b-e9a233a8)
- [Qwen3.6 en Ollama](https://ollama.com/library/qwen3.6)
- [Guía de desarrollador de Qwen3.6](https://lushbinary.com/blog/qwen-3-6-developer-guide-benchmarks-architecture-api-self-hosting/)
- [Catálogo de modelos Microsoft Foundry - Qwen3.6-35B-A3B](https://ai.azure.com/catalog/models/FW-Qwen3.6-35B-A3B)
