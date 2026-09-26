# MargiPandya/InternVL3-8B-CoT-SFT-vu-ckpt1100

## Resumen
InternVL3-8B-CoT-SFT-vu-ckpt1100 es un ajuste fino multimodal del modelo OpenGVLab/InternVL3-8B, desarrollado por MargiPandya. Se trata de un checkpoint intermedio de entrenamiento (paso 1100, época 0.35 de una ejecución no finalizada) que incorpora razonamiento en cadena de pensamiento (chain-of-thought) y capacidades multi-imagen. El modelo está pensado para tareas de visión-lenguaje que requieren analizar varias imágenes y generar respuestas razonadas, aunque su naturaleza de checkpoint no finalizado limita su uso en producción sin una validación adicional.

El ajuste se realizó mediante LoRA sobre las proyecciones de atención y MLP del modelo de lenguaje, mientras que la torre de visión y el proyector (vision_model y mlp1) se entrenaron por completo. Posteriormente, los adaptadores se fusionaron en pesos standalone, lo que permite cargar el modelo directamente con transformers o vLLM sin necesidad de gestionar el adaptador. Con 7.944.373.760 parámetros (aproximadamente 7,94 mil millones), el modelo hereda la arquitectura visión-lenguaje de InternVL3-8B y añade capacidades de razonamiento multi-imagen mediante CoT.

La relevancia de esta ficha radica en que documenta un ejemplo de ajuste fino eficiente sobre un VLM de 8B, con resultados de evaluación que muestran mejoras en Mantis-Eval pero ligeros descensos en MIRB y BLINK respecto al modelo base. Es un caso útil para investigadores que quieran entender el impacto de un entrenamiento parcial con LoRA y módulos completos en tareas de razonamiento visual.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Modelo visión-lenguaje basado en InternVL3-8B, compuesto por una torre de visión (vision_model), un proyector MLP (mlp1) y un modelo de lenguaje. No se detallan más especificaciones arquitectónicas en la información proporcionada. |
| Parametros totales | 7.944.373.760 (7,94 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Safetensors en bf16; no se proporcionan versiones cuantizadas (GGUF, GPTQ, etc.) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento
El modelo parte de InternVL3-8B, un VLM que combina una torre de visión con un transformer de lenguaje. En este ajuste se aplicó LoRA con r=64, alpha=128 y dropout=0,05 sobre las proyecciones q_proj, k_proj, v_proj, o_proj y gate_proj, up_proj, down_proj. Además, se incluyeron los módulos vision_model y mlp1 en `modules_to_save`, lo que implicó entrenarlos en su totalidad en lugar de mediante adaptación de bajo rango. Esta decisión explica que el adaptador resultante ocupara 1,3 GB y que fuera necesario fusionarlo para servir el modelo. El entrenamiento se realizó en bf16 con una tasa de aprendizaje de 1e-5, y el conjunto de validación fue TIGER-Lab/Mantis-Eval.

El modelo es un checkpoint intermedio: paso 1100, época 0,35 de una ejecución no finalizada. No se especifica el número total de tokens de entrenamiento ni la composición del dataset más allá del conjunto de validación. La innovación principal es la combinación de razonamiento en cadena de pensamiento (CoT) con capacidades multi-imagen, aunque los resultados muestran que el ajuste no mejora consistentemente todas las métricas del modelo base.

## Capacidades
- Generación de texto condicionada por imágenes (image-text-to-text).
- Razonamiento multi-imagen: puede procesar varias imágenes en una misma consulta.
- Cadena de pensamiento (chain-of-thought) para tareas de razonamiento visual.
- Conversación multimodal (conversational).
- Extracción de características (feature-extraction) para representaciones de imágenes y texto.
- No se menciona soporte explícito de tool calling, function calling, agentes, ni capacidades multilingües en la información proporcionada.

## Casos de uso
- Análisis de documentos con múltiples imágenes: el modelo puede procesar varias páginas o capturas en una sola consulta y razonar sobre ellas, gracias a su capacidad multi-imagen y CoT.
- Respuesta a preguntas visuales (VQA) que requieran razonamiento paso a paso: útil en dominios como educación o asistencia técnica, donde se necesita explicar el proceso.
- Asistente conversacional multimodal para atención al cliente: puede gestionar conversaciones multi-turno interpretando capturas de pantalla o fotografías enviadas por el usuario.
- Comparación de imágenes en control de calidad: con capacidad multi-imagen, puede detectar diferencias o defectos entre varias imágenes de un producto.
- Generación de descripciones detalladas para accesibilidad: a partir de una o varias imágenes, puede producir texto descriptivo enriquecido con razonamiento CoT.
- Extracción de características para recuperación de imágenes: el modelo puede generar embeddings de imagen y texto para sistemas de búsqueda visual.
- Razonamiento sobre gráficos y diagramas: el CoT permite interpretar ejes, leyendas y tendencias en figuras complejas.
- Análisis de imágenes médicas (con supervisión profesional): aunque no sustituye a un especialista, puede asistir en la descripción de hallazgos en varias modalidades de imagen.

## Benchmarks y rendimiento
Los siguientes resultados proceden de la model card del autor. La precisión se compara con el modelo base InternVL3-8B. El prompt se especifica por fila porque influye más que el propio ajuste; las filas solo son comparables entre sí si se evaluaron de la misma forma.

| Benchmark | Prompt | InternVL3-8B | Este checkpoint |
|---|---|---|---|
| Mantis-Eval | estándar, sin CoT | 66,36 | 67,28 |
| MIRB | estándar, sin CoT | 58,93 | 56,86 |
| MuirBench | CoT + extracción `<answer>` | — | 53,15 |
| BLINK | CoT + extracción `<answer>` | 56,50 | 55,18 |

Nota: MIRB y MuirBench/BLINK utilizan un tiling de imagen diferente. Las ejecuciones con CoT limitan `max_dynamic_patch` a 4 para que las preguntas con muchas imágenes quepan en la ventana de contexto, mientras que las filas sin CoT usan el valor por defecto de 12. La configuración incluida en el repositorio lleva el valor por defecto de 12. La métrica `eval/accuracy_mcq` durante el entrenamiento es una precisión token a token forzada por el profesor sobre Mantis-Eval, no una puntuación de benchmark, y no es comparable con los números de la tabla.

## Requisitos de hardware
- VRAM estimada para inferencia: los pesos en bf16 ocupan aproximadamente 15,9 GB. Considerando activaciones y overhead, se recomiendan al menos 20-24 GB de VRAM para inferencia sin cuantización.
- GPU recomendadas: NVIDIA A100 (40/80 GB), H100, RTX 3090 (24 GB), RTX 4090 (24 GB), A10G (24 GB), L4 (24 GB).
- ¿Cabe en GPU consumer? Sí, en modelos con 24 GB o más (RTX 3090, 4090). En GPUs de 16 GB (RTX 4080, 4060 Ti) no cabe sin cuantización o offloading.
- Opciones de despliegue: transformers con `trust_remote_code=True` y vLLM, según la model card. No se proporcionan versiones cuantizadas para llama.cpp u Ollama.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares
| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Rendimiento (Mantis-Eval) |
|---|---|---|---|---|---|
| InternVL3-8B (base) | 7,94 B | No disponible | Apache-2.0 | HuggingFace | 66,36 |
| Este checkpoint | 7,94 B | No disponible | Apache-2.0 | HuggingFace | 67,28 |

No se dispone de datos de otros modelos comparables en la información proporcionada. La comparación principal es con el modelo base, que comparte arquitectura y licencia.

## Limitaciones y advertencias
- Es un checkpoint intermedio (paso 1100, época 0,35 de un entrenamiento no finalizado). No es un modelo final y su rendimiento puede no ser óptimo.
- Los resultados en MIRB (56,86) y BLINK (55,18) son ligeramente inferiores a los del modelo base (58,93 y 56,50 respectivamente), lo que indica que el ajuste no mejora todas las capacidades.
- Las comparaciones entre filas de la tabla de benchmarks no son directas debido a las diferencias en `max_dynamic_patch` (4 para CoT, 12 para no CoT).
- Riesgo de alucinación inherente a los modelos visión-lenguaje, especialmente en tareas de razonamiento abierto.
- No se especifican los idiomas soportados ni la composición del dataset de entrenamiento, lo que dificulta evaluar sesgos y cobertura lingüística.
- La licencia Apache-2.0 permite uso comercial, pero al ser un checkpoint no finalizado se recomienda validar exhaustivamente antes de desplegarlo en producción.
- Compatibilidad: el código remoto de InternVL3 define `_tied_weights_keys` y no carga bajo `transformers>=5.0`, que espera `all_tied_weights_keys`. Se ha verificado con `transformers==4.57` y `peft==0.20.0`.

## Enlaces
- [Modelo en HuggingFace](https://huggingface.co/MargiPandya/InternVL3-8B-CoT-SFT-vu-ckpt1100)
- [Modelo base OpenGVLab/InternVL3-8B](https://huggingface.co/OpenGVLab/InternVL3-8B)
- [Dataset TIGER-Lab/Mantis-Eval](https://huggingface.co/datasets/TIGER-Lab/Mantis-Eval)
