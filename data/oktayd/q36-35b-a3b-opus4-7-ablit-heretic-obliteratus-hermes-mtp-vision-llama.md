# oktayd/Q36-35B-A3B-Opus4.7-Ablit-Heretic-OBLITERATUS-Hermes-MTP-Vision-Llama

## Resumen

Q36 es un derivado personalizado de Qwen3.6-35B-A3B, un modelo de mezcla de expertos (MoE) con aproximadamente 35,5 mil millones de parámetros totales y unos 3 mil millones activos por token. Esta edición concreta es la versión cuantizada en GGUF para inferencia local con llama.cpp, publicada por oktayd como "edición portátil principal". El modelo combina un linaje de destilación de razonamiento heredado (referenciado como "Claude 4.7 Opus", aunque no contiene pesos del modelo propietario de Anthropic) con etapas de post-entrenamiento personalizadas: abliteración (eliminación de rechazos), comportamiento "Heretic", "OBLITERATUS Nuclear", function calling estilo Hermes, workflows agénticos, preservación de visión y de MTP (multi-token prediction).

La arquitectura interna es `qwen3_5_moe` con 40 capas, tamaño oculto de 2048, 256 expertos enrutados, 8 expertos activos más un experto compartido por token, y un contexto nativo de 262.144 tokens. Soporta entrada multimodal (texto e imágenes) y salida de texto, con el proyector de visión y el módulo MTP preservados. Esta edición GGUF utiliza cuantización MXFP4_MOE como formato primario y Q4_K_M como referencia, con un tamaño de repositorio de 21,2 GB.

La relevancia del modelo reside en su capacidad de ejecutar un MoE de gran contexto en hardware de portátil con decodificación especulativa, tool calling y visión, todo localmente. Sin embargo, al estar abliterado y sin mecanismos de rechazo, su uso conlleva riesgos significativos de seguridad y no es adecuado para despliegues en producción sin capas de protección externas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen3_5_moe` (Mixture of Experts) |
| Parametros totales | ~35,5B |
| Parametros activos | ~3B |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | MXFP4_MOE (primaria), Q4_K_M (referencia) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura MoE de Qwen3.6-35B-A3B, con 40 capas de texto, tamaño oculto de 2048, 256 expertos enrutados, 8 expertos activos más un experto compartido por token, y un tamaño de capa intermedia de experto de 512. El contexto nativo alcanza los 262.144 tokens. El modelo es un derivado con post-entrenamiento personalizado sobre el linaje de destilación de razonamiento heredado (etiquetado como "Claude 4.7 Opus", sin contener el modelo propietario).

El proceso de post-entrenamiento incluye abliteración (reducción de rechazos), etapas denominadas "Heretic" y "OBLITERATUS Nuclear", ajuste fino con function calling estilo Hermes, y entrenamiento agéntico (agentic SFT) para interacción con terminal, archivos y repositorios. El MTP y el proyector de visión se preservaron durante el proceso. Los detalles exactos del dataset de entrenamiento no están disponibles en la información publicada. El modelo base es la versión BF16/FreeToken del mismo autor.

## Capacidades

- Generación de texto y razonamiento con destilación de razonamiento heredada
- Entrada multimodal: texto e imágenes (proyector de visión preservado, condicionado al soporte del runtime)
- MTP (multi-token prediction) preservado, habilitando decodificación especulativa
- Function calling y tool use estilo Hermes con esquemas de selección de herramientas
- Workflows agénticos (agentic SFT) para terminal, archivos y repositorios
- Codificación (coding) con soporte de agentes de codificación
- Comportamiento sin rechazos (abliterado), sin filtros de contenido
- Idioma: inglés únicamente

## Casos de uso

1. **Asistente de codificación agéntico local**: el modelo puede ejecutarse en llama.cpp con function calling estilo Hermes para interactuar con terminal, sistema de archivos y repositorios. Sus 262K tokens de contexto permiten mantener sesiones largas de trabajo sobre código, y el MTP mejora la latencia en decodificación especulativa. Adecuado para desarrolladores que necesitan un agente de codificación sin dependencia de servicios en la nube.

2. **Decodificación especulativa experimental**: el MTP preservado permite investigar y comparar la eficiencia de decodificación especulativa en llama.cpp con un MoE de 3B activos, midiendo throughput y latencia frente a modelos densos equivalentes.

3. **Análisis de imágenes local**: el proyector de visión preservado permite ejecutar tareas de comprensión de imágenes (image-to-text) en el portátil, sin subir datos sensibles a servicios externos. Útil para prototipos de visión por computador o anotación asistida.

4. **Automatización con tool calling**: el soporte de function calling Hermes permite integrar el modelo en pipelines de automatización que invocan herramientas externas (APIs, scripts, bases de datos), con el contexto largo para mantener estado de la tarea.

5. **Investigación sobre alineación y abliteración**: al estar abliterado y sin rechazos, el modelo es útil para estudiar el efecto de la abliteración en el rendimiento, la capacidad de razonamiento y la distribución de respuestas, comparándolo con el modelo base con seguridad.

6. **Prototipado de asistentes conversacionales de contexto largo**: con 262K tokens de contexto, el modelo puede mantener conversaciones multi-turno extensas, adecuado para prototipos de asistentes que requieren memoria de sesiones largas (análisis de documentos, historial de conversación).

7. **Experimentación con cuantización MXFP4_MOE**: el formato MXFP4_MOE es un esquema de cuantización novedoso para MoE; este repositorio sirve como referencia para evaluar su impacto en calidad y rendimiento frente a Q4_K_M u otras cuantizaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una tabla de benchmarks con todos los tests en estado "Pendiente": IFEval, MMLU-Pro, GPQA Diamond CoT, GSM8K CoT, HumanEval+, MBPP+, LiveCodeBench, LiveBench, JSONSchema Bench, BFCL V4, BFCL V4 Agentic, hermes-toolperf-evals, tau3-bench, AgentBench FC, TUA-Bench, XSTest, OR-Bench, SORRY-Bench, HarmBench y StrongREJECT. No hay datos numéricos publicados.

## Requisitos de hardware

- **Tamaño del repositorio**: 21,2 GB en formato GGUF (MXFP4_MOE + Q4_K_M)
- **VRAM estimada**: ~20-24 GB para descarga completa en GPU; con 3B activos, el MoE permite descarga parcial con offload a CPU en GPUs de 12-16 GB
- **GPUs recomendadas**: RTX 3090/4090 (24 GB) para descarga completa; RTX 3060/4070 (12-16 GB) con descarga parcial; el autor la orienta como "edición portátil principal"
- **Runtimes**: llama.cpp (formato GGUF nativo), Ollama (edición separada disponible)
- **Decodificación especulativa**: soportada vía MTP, dependiendo de la versión de llama.cpp
- **Latencia y throughput**: no hay datos publicados; el MoE con ~3B activos debería ofrecer mejor throughput que un denso de 35B, pero no se ha medido

## Comparativa con modelos similares

| Modelo | Params totales | Activos | Contexto | Cuantización | Licencia | Notas |
|---|---|---|---|---|---|---|
| Q36 (oktayd, esta edición) | ~35,5B | ~3B | 262K | MXFP4_MOE + Q4_K_M | Apache-2.0 | Abliterado, visión + MTP, GGUF |
| Qwen3.6-35B-A3B (oficial) | ~35,5B | ~3B | 262K | BF16 / FP8 | Apache-2.0 | Modelo base, con mecanismos de seguridad |
| SC117/...-APEX-GGUF | ~35,5B | ~3B | 262K | APEX (MoE-aware) | Apache-2.0 | Cuantización APEX, sin seguridad |
| rynky2436/...-oQ4-fp16-mtp | ~35,5B | ~3B | 262K | oQ4 + FP16 | Apache-2.0 | Abliterado, con MTP |

Nota: los datos de los modelos comparables se basan en búsquedas web y pueden estar incompletos. No hay benchmarks publicados que permitan comparar el rendimiento real.

## Limitaciones y advertencias

- **Modelo abliterado y sin rechazos**: el modelo ha sido modificado para eliminar mecanismos de rechazo y filtros de contenido. Puede generar contenido dañino, ilegal o no seguro. No es adecuado para despliegue en producción sin capas de moderación externas.
- **Riesgo de alucinación**: como todo modelo de este tamaño, puede inventar hechos, citas o código con alta confianza.
- **Idioma**: soporta únicamente inglés; no hay soporte multilingüe.
- **El nombre "Claude 4.7 Opus" es engaños
