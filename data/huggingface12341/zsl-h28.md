# huggingface12341/zsl-h28

## Resumen

zsl-h28 es un modelo de extracción de características (feature-extraction) publicado por el usuario huggingface12341 en Hugging Face. Se trata de un merge de tres modelos base: vllm-sr/d3-lite, illuin/Ivonnet-0.8B y eqlx-ai/tr-telekom-router, lo que sugiere una fusión de pesos orientada a combinar las capacidades de un router de decisión con las de un encoder de tipo Ivonnet. El modelo tiene 852.985.920 parámetros (aproximadamente 0,85 mil millones) y un tamaño de repositorio de 1,7 GB en formato safetensors.

La relevancia de este modelo es limitada y debe interpretarse con cautela: no dispone de descargas ni likes, fue creado y actualizado el mismo día (24 de noviembre de 2026) y su acceso está restringido mediante gating, requiriendo aceptar condiciones en Hugging Face. Además, no se han publicado idiomas soportados ni documentación técnica asociada en la información disponible. El pipeline declarado es feature-extraction, no generación de texto, y las etiquetas incluyen términos como decision-model, zils y d3-lite, que apuntan a un uso especializado en representaciones vectoriales o clasificación más que en generación abierta.

Por tanto, zsl-h28 debe considerarse un artefacto experimental de fusión de modelos, sin benchmarks publicados ni documentación de entrenamiento verificable. Su interés principal reside en el estudio de técnicas de merge de pesos y en la posibilidad de reutilizar sus representaciones para tareas de recuperación o clasificación, siempre que se acepten las condiciones de acceso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de los modelos base; detalles no disponibles) |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de la etiqueta `qwen3_5` y del pipeline `feature-extraction`. El modelo es un merge de tres checkpoints: `vllm-sr/d3-lite`, `illuin/Ivonnet-0.8B` y `eqlx-ai/tr-telekom-router`. El tamaño de 852.985.920 parámetros es coherente con un encoder de aproximadamente 0,8 mil millones de parámetros, lo que encaja con el modelo base Ivonnet-0.8B. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO.

La innovación técnica declarada es la propia fusión de pesos (merge), que combina un router de decisión con un encoder. No se documentan técnicas adicionales como decodificación especulativa o atención lineal. Cualquier afirmación sobre el proceso de entrenamiento sería especulativa, por lo que se indica como no disponible.

## Capacidades

- Extracción de características y representaciones vectoriales (pipeline declarado: feature-extraction).
- Posible uso como modelo de decisión o router, según la etiqueta `decision-model` y el modelo base `tr-telekom-router`.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles.
- No se documentan capacidades especiales como thinking mode, visión o audio.
- No se documenta generación de texto abierta; el pipeline no es text-generation.

## Casos de uso

- Recuperación semántica (retrieval): usar las representaciones del modelo para indexar y buscar documentos en un motor vectorial, aprovechando su pipeline de feature-extraction.
- Clasificación de textos: extraer embeddings y entrenar una cabeza de clasificación ligera para tareas como enrutamiento de consultas o etiquetado.
- Filtrado previo en pipelines RAG: emplear el modelo como encoder para puntuar la relevancia de fragmentos antes de pasarlos a un LLM generador.
- Detección de similitud y deduplicación: calcular similitud coseno entre embeddings para agrupar documentos o detectar duplicados en un corpus.
- Enrutamiento de peticiones: si se confirma su comportamiento como decision-model, podría emplearse para dirigir consultas hacia distintos modelos o servicios según su representación.
- Experimentación con merges de pesos: servir como caso de estudio para investigar cómo afecta la fusión de un router y un encoder a las representaciones resultantes.
- Búsqueda en bases de conocimiento internas: integrar el encoder en un sistema de búsqueda semántica corporativa, sujeto a la aceptación de la licencia y del gating.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 1,7 GB solo para pesos, más overhead de activaciones y del runtime (estimación orientativa de 2-3 GB).
- VRAM estimada en cuantización de 8 bits: alrededor de 0,9-1,2 GB; en 4 bits, alrededor de 0,5-0,8 GB (estimaciones, no confirmadas por el autor).
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (RTX 3060, RTX 4060, RTX 4090) debería ser suficiente para inferencia en fp16; A100/H100 no son necesarias.
- Cabe en GPU consumer: sí, previsiblemente en la mayoría de tarjetas con 4 GB o más.
- Opciones de despliegue: transformers (librería declarada); vLLM, llama.cpp, Ollama o TGI no están confirmados y requerirían verificar compatibilidad con el código personalizado (`custom_code`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zsl-h28 | 852.985.920 | no disponible | apache-2.0 | Gated en HF | Merge de tres modelos; sin benchmarks |
| illuin/Ivonnet-0.8B | ~0,8B (según nombre) | no disponible | no disponible | HF | Modelo base del merge |
| vllm-sr/d3-lite | no disponible | no disponible | no disponible | HF | Modelo base del merge |
| eqlx-ai/tr-telekom-router | no disponible | no disponible | no disponible | HF | Modelo base del merge |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Acceso restringido (gated): es necesario aceptar condiciones en Hugging Face antes de descargar el modelo.
- Ausencia total de documentación técnica: no hay model card detallada, ni datos de entrenamiento, ni evaluación.
- Sin benchmarks publicados: no es posible verificar su calidad frente a alternativas.
- Riesgo de alucinación y sesgos: no evaluados; al ser un modelo derivado de merges, puede heredar sesgos de sus componentes.
- Idiomas soportados desconocidos: no se garantiza un rendimiento multilingüe.
- Longitud de contexto desconocida: no apto para tareas que requieran ventanas largas sin validación previa.
- Uso comercial: la licencia apache-2.0 lo permite en principio, pero deben revisarse las licencias de los modelos base y las condiciones del gating.
- Código personalizado (`custom_code`): requiere `trust_remote_code=True` en transformers, lo que implica ejecutar código no auditado; precaución en producción.
- Pipeline de feature-extraction: no debe esperarse generación de texto conversacional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/huggingface12341/zsl-h28
- Modelo base illuin/Ivonnet-0.8B: https://huggingface.co/illuin/Ivonnet-0.8B
- Modelo base vllm-sr/d3-lite: https://huggingface.co/vllm-sr/d3-lite
- Modelo base eqlx-ai/tr-telekom-router: https://huggingface.co/eqlx-ai/tr-telekom-router
