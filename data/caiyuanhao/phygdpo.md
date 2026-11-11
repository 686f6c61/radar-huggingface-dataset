# CaiYuanhao/PhyGDPO

## Resumen

PhyGDPO es un conjunto de dos modelos de generación de vídeo a partir de texto (text-to-video) desarrollados por CaiYuanhao y presentados en el artículo aceptado en ECCV 2026 "PhyGDPO: Physics-Aware Groupwise Direct Preference Optimization for Physically Consistent Text-to-Video Generation". El modelo parte de los checkpoints Wan2.1-1.3B y Wan2.1-14B y los re-entrena mediante una reimplementación del algoritmo PhyGDPO sobre conjuntos de datos públicos, con el objetivo de mejorar la consistencia física de los vídeos generados (trayectorias, contacto, gravedad, colisiones).

El problema que aborda es la falta de plausibilidad física en los generadores de vídeo actuales: objetos que flotan, movimientos imposibles o dinámicas incoherentes. La propuesta aplica optimización directa de preferencias agrupada (Groupwise Direct Preference Optimization) con señal de física, un enfoque de alineamiento post-entrenamiento sobre un modelo base difusión-transformer. El repositorio ocupa 4,5 GB y se distribuye con pesos en formato safetensors bajo licencia Apache 2.0.

Es relevante ahora porque ofrece una alternativa abierta y reproducible a sistemas propietarios como Sora 2 o Veo 3.1 en la tarea concreta de consistencia física, y porque publica tanto el código de entrenamiento como los checkpoints post-entrenados de dos escalas (1.3B y 14B), lo que permite evaluar el método en entornos con recursos limitados y en entornos de alta capacidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo base Wan2.1, familia difusión-transformer para vídeo) |
| Parametros totales | Dos variantes: 1.3B y 14B |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 4,5 GB) |

## Arquitectura y entrenamiento

El modelo se construye sobre Wan2.1 en sus variantes de 1.3B y 14B parámetros, que son modelos de generación de vídeo basados en difusión con backbone transformer. Sobre estos checkpoints base, los autores aplican su algoritmo PhyGDPO, una variante de Direct Preference Optimization organizada por grupos, diseñada para incorporar preferencias con conciencia física durante el post-entrenamiento. El repositorio incluye un `config.json` raíz que enumera checkpoints, ficheros auxiliares e implementación, y el código de entrenamiento e inferencia se publica en el repositorio GitHub Open-PhyGDPO.

La información disponible no detalla el número exacto de tokens, la composición del dataset de preferencias, ni si se emplearon etapas adicionales de RLHF o DPO clásico más allá del propio PhyGDPO. Tampoco se especifican innovaciones de decodificación (por ejemplo, decodificación especulativa) ni detalles sobre atención lineal. La model card indica únicamente que el post-entrenamiento se realizó sobre conjuntos de datos públicos y que el método busca consistencia física en las secuencias generadas.

## Capacidades

- Generación de vídeo a partir de descripciones textuales en inglés.
- Generación con énfasis en consistencia física: caídas, aterrizajes, trayectorias balísticas, contacto con objetos y dinámicas de cuerpo rígido.
- Dos escalas de modelo (1.3B y 14B) para distintos presupuestos de cómputo.
- Compatibilidad con el pipeline de Wan2.1, lo que permite reutilizar herramientas y runtimes del modelo base.
- Reproducibilidad del post-entrenamiento mediante el código publicado en GitHub.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking, al tratarse de un modelo generativo de vídeo.

## Casos de uso

- Previsualización de animaciones deportivas: generar clips de gimnasia, fútbol o squash con trayectorias y contactos plausibles, útil para estudios de animación que necesitan referencias rápidas antes de producir la secuencia final.
- Prototipado de escenas físicas en videojuegos: el modelo puede producir vídeos de referencia de caídas, saltos o impactos para validar la sensación física antes de implementar el motor de físicas.
- Generación de material para análisis de percepción física: investigadores pueden usar los checkpoints para comparar la plausibilidad física de modelos abiertos frente a sistemas cerrados como Sora 2 o Veo 3.1.
- Creación de contenido educativo: clips que ilustran conceptos de mecánica (por ejemplo, un balón describiendo un arco parabólico) con coherencia visual.
- Evaluación comparativa de algoritmos de alineamiento: el par 1.3B/14B permite estudiar el efecto del escalado en la eficacia de PhyGDPO con coste controlado.
- Pruebas de integración en pipelines de generación de vídeo: al compartir arquitectura con Wan2.1, se puede desplegar en infraestructuras ya preparadas para dicho modelo base.
- Investigación en preferencias sintéticas: el código abierto permite reentrenar con nuevos conjuntos de preferencias físicas y medir el impacto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente incluye comparaciones cualitativas mediante GIF frente a OpenAI Sora 2 y Google Veo 3.1 en cuatro escenarios (gimnasia en barras paralelas, drop-kick de fútbol, handspring sobre plataforma y squash en pista cubierta), sin métricas numéricas.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa para modelos de difusión de vídeo de tamaño comparable, la variante de 1.3B suele requerir del orden de 8-16 GB en precisión reducida y la de 14B del orden de 24-48 GB, pero estas cifras no están confirmadas en la información proporcionada.
- GPU recomendadas: no especificadas por los autores. Por tamaño, la variante 1.3B podría ejecutarse en GPUs consumer de gama alta (RTX 4090, 24 GB) y la 14B en A100/H100 o múltiples GPUs.
- Compatibilidad con GPU consumer: probable para la variante 1.3B; no confirmada para la 14B.
- Opciones de despliegue: no se documentan explícitamente; se espera compatibilidad con el runtime de Wan2.1 referenciado en el repositorio GitHub. No se mencionan vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a LLMs, no aplicables directamente a este modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Consistencia física | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PhyGDPO (1.3B) | 1.3B | No disponible | Optimizada vía PhyGDPO | Apache 2.0 | Pesos abiertos en HF |
| PhyGDPO (14B) | 14B | No disponible | Optimizada vía PhyGDPO | Apache 2.0 | Pesos abiertos en HF |
| Wan2.1-1.3B | 1.3B | No disponible | Base, sin post-entrenamiento físico | No disponible en la información | Pesos abiertos |
| Wan2.1-14B | 14B | No disponible | Base, sin post-entrenamiento físico | No disponible en la información | Pesos abiertos |
| OpenAI Sora 2 | No disponible | No disponible | Referencia cualitativa en la model card | Propietaria | API cerrada |
| Google Veo 3.1 | No disponible | No disponible | Referencia cualitativa en la model card | Propietaria | API cerrada |

No se dispone de métricas cuantitativas para establecer una comparación numérica con alternativas; la comparación con Sora 2 y Veo 3.1 es únicamente cualitativa según los GIF publicados por los autores.

## Limitaciones y advertencias

- Solo se declara soporte de inglés; el rendimiento en otros idiomas no está documentado.
- No hay benchmarks públicos ni métricas objetivas de consistencia física en la información disponible, por lo que las afirmaciones de mejora deben validarse de forma independiente.
- Riesgo de alucinación visual: como todo modelo generativo de vídeo, puede producir escenas que parezcan plausibles pero violen leyes físicas en detalles finos.
- Sesgos potenciales heredados del modelo base Wan2.1 y de los datos públicos empleados en el post-entrenamiento; no se documenta un análisis de sesgos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Wan2.1 y de los datasets utilizados, que no se detallan.
- El repositorio tiene 0 descargas y 2 likes en el momento de la consulta, lo que indica escasa validación comunitaria.
- No se documentan requisitos de hardware, cuantizaciones soportadas ni latencias, lo que dificulta la planificación de producción.
- La información sobre el dataset de preferencias y el proceso exacto de entrenamiento es incompleta en la model card.

## Enlaces

- Hugging Face: https://huggingface.co/CaiYuanhao/PhyGDPO
- Repositorio GitHub (código e instrucciones): https://github.com/caiyuanhao1998/Open-PhyGDPO
- Artículo arXiv: https://arxiv.org/abs/2512.24551
- Documentación de Hugging Face Hub para descarga: https://huggingface.co/docs/hub/models-download-stats
