# Ashish666/NLP-for-Healthcare-Assignment-4-Daniel-Ashish-Abrahaml

## Resumen

Este repositorio contiene los checkpoints de un trabajo académico de la asignatura NLP for Healthcare (CL3.411) de IIIT Hyderabad, centrado en la generación automática de informes de radiología a partir de radiografías de tórax. No se trata de un modelo entrenado de extremo a extremo y publicado como artefacto independiente, sino de un conjunto de pesos parciales: un conector MLP de dos capas y un adaptador LoRA, ambos pensados para combinarse con dos modelos base congelados (CLIP ViT-B/16 como codificador visual y Qwen2.5-0.5B-Instruct como decodificador de lenguaje).

La arquitectura efectiva es, por tanto, un VLM ligero de tipo conector: la imagen se codifica con CLIP, se proyecta mediante un MLP (768 → 1024 → 896) al espacio de embeddings de Qwen y se decodifica texto con el LLM. El entrenamiento se realizó en dos fases: una primera de alineación del conector con ambos modelos base congelados (mejor val loss 2,15354) y una segunda "compliant" en la que se añade un LoRA de rango 8 sobre las proyecciones de atención de las 24 capas del decodificador (mejor val loss 1,80342).

Su relevancia es limitada fuera del contexto docente: el repositorio tiene 0 descargas, 0 likes y un tamaño de 0,0 GB según los metadatos, y no incluye pesos completos del modelo ni una model card con instrucciones de uso en producción. Resulta útil como referencia de una receta de fine-tuning eficiente en parámetros (PEFT) para tareas de image-to-text médico con recursos muy reducidos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLM con conector MLP: CLIP ViT-B/16 (visión) + MLP 768→1024→896 + Qwen2.5-0.5B-Instruct (texto) con LoRA en atención |
| Parametros totales | No disponible (los pesos publicados suman ~18 MB: conector 6,83 MB + LoRA 4,35 MB; el resto son modelos base externos) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada de Qwen2.5-0.5B-Instruct; no especificada en la información) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch `.pt` (conector) y safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El sistema combina un codificador visual CLIP ViT-B/16 congelado con un decodificador de lenguaje Qwen2.5-0.5B-Instruct congelado, unidos por un conector MLP de dos capas (768 → 1024 → 896) que proyecta las representaciones visuales al espacio de embeddings del LLM. El conector tiene 1.705.856 parámetros entrenables. Sobre el decodificador se aplica un adaptador LoRA de rango 8 y alpha 16 sobre `q_proj`, `k_proj`, `v_proj` y `o_proj` en las 24 capas, con 1.081.344 parámetros entrenables.

El entrenamiento se estructuró en dos etapas. La etapa 1 entrenó únicamente el conector con ambos modelos base congelados, alcanzando una mejor pérdida de validación de 2,15354. La etapa 2 ("compliant") repitió el proceso con una configuración ajustada a la especificación de la asignatura, incorporando el adaptador LoRA, y obtuvo una mejor pérdida de validación de 1,80342. No se detalla en la información disponible el volumen de tokens, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO; tampoco se describen innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto a partir de imágenes (pipeline `image-to-text`), orientada específicamente a informes de radiografía de tórax.
- Descripción de hallazgos radiológicos en inglés, condicionada por el dominio del dataset de entrenamiento.
- Aprovecha las capacidades del decodificador Qwen2.5-0.5B-Instruct, aunque el adaptador LoRA está entrenado solo para la tarea de generación de informes.
- Soporte de tool calling o function calling: no disponible (no documentado para este artefacto).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: limitadas al inglés según la metadata del repositorio.
- Capacidades especiales (visión, audio, thinking mode): solo visión, vía el codificador CLIP; no se documentan otras.

## Casos de uso

- Investigación académica en generación de informes de radiología: sirve como punto de partida reproducible para comparar recetas de conector + LoRA con presupuestos de cómputo mínimos.
- Prototipado de asistentes de dictado radiológico: el modelo puede generar un borrador de informe a partir de una radiografía de tórax, que un radiólogo revisaría y corregiría.
- Docencia y formación: útil para ilustrar el funcionamiento de un VLM con conector y PEFT en cursos de NLP clínico, dado su tamaño reducido.
- Experimentos de ablación de PEFT: el repositorio incluye dos checkpoints de conector (etapa 1 y etapa 2) y un adaptador LoRA, lo que facilita comparar configuraciones.
- Base para fine-tuning posterior en dominios radiológicos específicos: el conector y el LoRA pueden servir de inicialización en datasets propios con recursos limitados.
- Despliegue en entornos con GPU de gama baja para demos: al apoyarse en Qwen2.5-0.5B y CLIP ViT-B/16, el conjunto completo es manejable en hardware consumer, aunque no se documentan requisitos exactos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Los únicos datos de rendimiento son las pérdidas de validación de las dos etapas de entrenamiento:

| Etapa | Mejor pérdida de validación | Parámetros entrenables |
|---|---|---|
| Etapa 1 (conector) | 2,15354 | 1.705.856 |
| Etapa 2 (conector + LoRA) | 1,80342 | Conector + 1.081.344 (LoRA) |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por los tamaños implicados (CLIP ViT-B/16 y Qwen2.5-0.5B-Instruct), el conjunto completo debería caber en GPUs consumer con 8-16 GB en precisión completa, aunque no se confirma en la información.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU consumer: probable por el tamaño de los modelos base, pero no documentada.
- Opciones de despliegue: no disponible (no se documenta integración con vLLM, llama.cpp, Ollama o TGI); el conector está en `.pt` y requiere código propio para cargarse junto con los modelos base.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este repositorio (conector + LoRA sobre CLIP + Qwen2.5-0.5B) | ~2,8 M entrenables; base 0,5B + ViT-B/16 | No disponible | Apache 2.0 | Pesos parciales en HF |
| Qwen2.5-VL (familia oficial) | Desde ~3B | No disponible en esta ficha | Apache 2.0 (según variante) | Pesos completos en HF |
| LLaVA (variantes ligeras) | ~7B en adelante | No disponible en esta ficha | Apache 2.0 / Llama según variante | Pesos completos en HF |

La comparación directa no es posible con los datos disponibles: este repositorio no publica pesos completos ni métricas de benchmarks, por lo que no se puede situar frente a VLMs médicos o generalistas en rendimiento.

## Limitaciones y advertencias

- No es un modelo listo para producción: solo contiene pesos parciales (conector y LoRA) que requieren cargar los modelos base y código de integración propio.
- Dominio muy restringido: entrenado para radiografías de tórax e informes en inglés; su comportamiento fuera de ese dominio no está caracterizado.
- Riesgo de alucinación clínica: como todo modelo generativo en ámbito médico, puede inventar hallazgos; no debe usarse sin supervisión de un profesional sanitario.
- Sesgos desconocidos: no se documenta la composición del dataset de entrenamiento, por lo que no se pueden evaluar sesgos demográficos o de adquisición de imagen.
- Idiomas: solo inglés según la metadata; no se garantiza calidad en castellano.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de documentación y de evaluación clínica desaconseja cualquier uso real en salud.
- Sin mantenimiento aparente: 0 descargas, 0 likes y creado en 2026; no hay evidencia de soporte o actualizaciones.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Ashish666/NLP-for-Healthcare-Assignment-4-Daniel-Ashish-Abrahaml
- Modelo base de lenguaje: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Modelo base visual: https://huggingface.co/openai/clip-vit-base-patch16
