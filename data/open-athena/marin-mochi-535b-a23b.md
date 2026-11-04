# open-athena/Marin-Mochi-535B-A23B

## Resumen

Marin-Mochi-535B-A23B es un modelo de lenguaje de tipo mixture-of-experts (MoE) desarrollado por open-athena y publicado en HuggingFace bajo el identificador `open-athena/Marin-Mochi-535B-A23B`. Se trata de un modelo base (no instruido ni alineado) orientado a generación de texto, con un total de 535.000 millones de parámetros de los cuales 23.000 millones se activan por token, lo que sitúa la inferencia en un régimen de coste computacional comparable a un modelo denso de ~23B. La nomenclatura interna lo asocia a la familia «marin» y a la variante de arquitectura «grug_moe».

El modelo resulta relevante por su escala: combina un número total de parámetros muy elevado con una activación dispersa relativamente baja, lo que permite desplegarlo en clústeres multi-GPU sin alcanzar el coste de un denso de 500B. Al ser un modelo base, está pensado como punto de partida para fine-tuning y para tareas de continuación de texto, no como asistente conversacional listo para producción.

La información pública disponible es muy limitada: el repositorio está restringido (gated), no se han publicado idiomas soportados, resultados de benchmarks ni detalles del dataset de entrenamiento en la información proporcionada. El tamaño del repositorio (aproximadamente 4 TB) es coherente con pesos en precisión completa o bf16 para un modelo de este número de parámetros.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE), etiqueta «grug_moe», familia «marin» |
| Parámetros totales | 535B |
| Parámetros activos | 23B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW 1.1 |
| Formato de pesos | no disponible (repo de ~4 TB, presumiblemente safetensors) |

## Arquitectura y entrenamiento

La arquitectura es un transformer con capas de mezcla de expertos (MoE), identificada en los metadatos como «grug_moe» dentro de la familia «marin». La proporción de activación es de aproximadamente el 4,3 % del total de parámetros (23B de 535B), un ratio típico de los MoE de gran escala que buscan desacoplar capacidad del coste de inferencia. No se dispone de información sobre el número de expertos, el tamaño de cada experto, el mecanismo de enrutamiento ni la estrategia de balanceo de carga.

Tampoco se han publicado datos sobre el volumen de tokens de entrenamiento, la composición del corpus, la longitud de contexto nativa ni si hubo fases de RLHF, DPO o instrucción. El modelo se etiqueta explícitamente como `base-model`, por lo que se asume entrenamiento exclusivamente de modelado de lenguaje autorregresivo (next-token prediction) sin alineación posterior. Cualquier innovación técnica adicional (atención lineal, decodificación especulativa, etc.) no está documentada en la información disponible.

## Capacidades

- Generación de texto autorregresiva y continuación de documentos largos.
- Razonamiento y conocimiento factual heredado del preentrenamiento a gran escala (no verificado con benchmarks públicos).
- Capacidad potencial de few-shot prompting y aprendizaje en contexto, propia de modelos base.
- Punto de partida para fine-tuning supervisado y para alineación posterior (SFT, DPO, RLHF).
- Soporte de tool calling: no confirmado; al ser un modelo base sin instrucción, no se garantiza.
- Soporte de agentes y razonamiento multi-paso: no confirmado.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Fine-tuning supervisado para dominios verticales: el modelo sirve como base para adaptar un MoE de gran capacidad a tareas específicas (legal, médico, financiero) con un coste de inferencia contenido gracias a sus 23B parámetros activos.
- Investigación en escalado de MoE: útil para estudiar dinámicas de enrutamiento, balanceo de expertos y eficiencia de activación en modelos de más de 500B parámetros.
- Generación de código tras fine-tuning: al no estar instruido, requiere una fase de SFT sobre corpus de código antes de integrarse en pipelines de CI/CD o asistentes de programación.
- Continuación de texto y generación de documentación técnica: aprovechable directamente en tareas de autocompletado o síntesis de documentos extensos si la ventana de contexto resulta suficiente (dato no confirmado).
- Destilación de conocimiento: un modelo de este tamaño puede emplearse como profesor para destilar capacidades en modelos más pequeños y desplegables en producción.
- Evaluación comparativa de arquitecturas MoE: sirve como referencia en estudios académicos que comparen MoE frente a densos de tamaño equivalente en tareas de razonamiento y generación.
- Generación de datos sintéticos: puede producir corpus de entrenamiento a gran escala para otros modelos, sujeto a verificación de calidad y a los términos de la licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 1,07 TB solo para pesos (535B × 2 bytes), más overhead de activaciones y caché KV.
- VRAM estimada en cuantización de 8 bits: en torno a 535 GB para pesos.
- VRAM estimada en cuantización de 4 bits: en torno a 270 GB para pesos; la viabilidad depende de si el formato de cuantización soporta correctamente el enrutamiento MoE.
- GPU recomendadas: clústeres multi-GPU con H100 80 GB (mínimo 8-16 unidades para bf16), A100 80 GB o H200; no cabe en una GPU consumer.
- GPU consumer: no es viable en RTX 4090, RTX 3090 ni similares por el tamaño del modelo, incluso con cuantización agresiva.
- Opciones de despliegue: presumiblemente vLLM, TGI o SGLang para servir MoE en multi-GPU; llama.cpp/Ollama no son realistas a esta escala.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros totales / activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Marin-Mochi-535B-A23B | 535B / 23B | no disponible | OpenMDW 1.1 | Gated en HuggingFace |
| DeepSeek-V3 (referencia MoE) | 671B / 37B | 128K | MIT (código) / licencia propia | Abierto |
| Qwen3-235B-A22B (referencia MoE) | 235B / 22B | 128K | Apache 2.0 | Abierto |
| Llama 4 Maverick (referencia MoE) | ~400B / 17B | 1M | Llama Community License | Abierto con condiciones |

Los datos de los modelos comparables se incluyen como referencia de categoría; no se dispone de benchmarks del modelo evaluado que permitan una comparación de rendimiento directa.

## Limitaciones y advertencias

- Modelo base sin alineación: no está instruido ni ajustado con RLHF/DPO, por lo que puede producir contenido sesgado, tóxico o incoherente en formato conversacional.
- Riesgo elevado de alucinación en tareas factuales al no haber pasado por fases de verificación o preferencia humana.
- Idiomas soportados no documentados: no se puede garantizar calidad fuera del inglés sin evaluación previa.
- Longitud de contexto no publicada: limita la planificación de casos de uso con documentos largos.
- Licencia OpenMDW 1.1: es necesario revisar los términos exactos para uso comercial, redistribución y obligaciones de atribución antes de integrar el modelo en productos.
- Acceso restringido (gated): requiere aceptar condiciones en HuggingFace, lo que puede retrasar la adopción en entornos corporativos.
- Tamaño del repositorio (~4 TB): el almacenamiento y la transferencia de pesos suponen un coste logístico significativo.
- Ausencia de benchmarks públicos: no es posible validar el rendimiento frente a alternativas sin evaluación propia.
- Sin información sobre cuantizaciones oficiales: la viabilidad de despliegue en hardware limitado no está garantizada.

## Enlaces

- HuggingFace: https://huggingface.co/open-athena/Marin-Mochi-535B-A23B
- Licencia OpenMDW 1.1: no disponible enlace directo en la información proporcionada
- Paper, blog o repositorio oficial: no disponible
- Demos: no disponible
