# guicybercode/br-sovereign-llm-research

## Resumen

BR Sovereign LLM es un protocolo de investigación y una implementación de pipeline para entrenar modelos de lenguaje decoder-only en portugués brasileño desde cero, sobre infraestructura de cómputo de alto rendimiento controlada localmente y de carácter nacional. El proyecto, desarrollado por guicybercode (Guilherme Monteiro), no contiene todavía pesos entrenados ni resultados de un supercomputador brasileño; se encuentra en fase de validación de protocolo y pipeline, con afirmaciones no medidas marcadas explícitamente como `not_measured`. Su objetivo principal es verificar si es posible mantener la trazabilidad completa de los datos, la custodia de los checkpoints, la ejecución offline, la portabilidad del planificador y los formatos abiertos de artefactos sin sacrificar la calidad medida del modelo ni la eficiencia operativa.

La relevancia actual del proyecto se enmarca en el movimiento hacia la soberanía de la IA en Brasil, que incluye la construcción de un supercomputador nacional anunciado en agosto de 2026. El modelo planificado sigue una arquitectura estilo Llama con atención causal, RMSNorm, RoPE, SwiGLU y atención por grupos de consultas (GQA), con una escalera de tamaños que va desde 20-30M hasta 7B parámetros, y una longitud de contexto fija de 2.048 tokens para los experimentos de escalado. El proyecto excluye explícitamente corpus agregados como BrWaC, Carolina, CulturaX, mC4, OSCAR, HPLT o Common Crawl, exigiendo una base de derechos verificable para cada documento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only estilo Llama (atención causal, RMSNorm, RoPE, SwiGLU, GQA) |
| Parametros totales | No disponible (planificados: 20-30M, 100-125M, ~350M, ~1.3B, ~3B, ~7B) |
| Parametros activos | No disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens (planificada para experimentos de escalado) |
| Tipos de cuantizacion | No disponible (no hay pesos publicados) |
| Idiomas soportados | Portugués (pt), con foco en portugués brasileño |
| Licencia | Apache-2.0 (aplica al código y documentación del proyecto; no a futuros datos de entrenamiento) |
| Formato de pesos | No disponible (aún no se han publicado pesos) |

## Arquitectura y entrenamiento

La arquitectura planificada es un transformer decoder-only de la familia Llama, con atención causal, normalización RMSNorm, incrustaciones posicionales rotatorias (RoPE), activación SwiGLU y atención por grupos de consultas (GQA). Esta elección es deliberadamente conservadora para aislar las variables de interés del estudio, que se centran en la soberanía operativa y no en innovaciones arquitectónicas. El proyecto especifica una escalera de escalas que va desde modelos nano (20-30M) para validación de pipeline y recuperación, hasta un objetivo condicional de ~3B parámetros con ~60B tokens planificados, y un tramo futuro de ~7B. Todos los experimentos de escalado mantienen una ventana de contexto de 2.048 tokens para no confundir la escala del modelo con la longitud del contexto.

El entrenamiento se basa en una política de corpus estricta: cada documento debe tener una base de derechos verificable, evidencia de atribución, revisión, hash de contenido e historial de transformaciones. El registro inicial permite la adquisición controlada de fuentes como los dumps oficiales de Wikimedia en portugués, el Portal da OBMEP, actos oficiales brasileños cubiertos por el artículo 8(IV) de la Ley 9.610/1998, recursos ProEdu con licencias CC0, CC BY o CC BY-SA a nivel de ítem, y artículos de SciELO Brasil con licencia CC BY 4.0. El pipeline incluye normalización Unicode, filtrado de PII, control de calidad, deduplicación exacta y aproximada, descontaminación de benchmarks y división determinista de conjuntos con conocimiento de grupos. El tokenizador es entrenado por el propio proyecto a nivel de bytes, y los shards de tokens se almacenan con direccionamiento por contenido.

## Capacidades

Dado que el proyecto no ha publicado pesos entrenados ni resultados medidos, no existen capacidades funcionales verificadas del modelo. Las capacidades que el pipeline pretende habilitar, una vez completado el entrenamiento, son:

- Generación de texto en portugués brasileño con trazabilidad completa de los datos de entrenamiento.
- Reproducibilidad del entrenamiento mediante entornos deterministas y cadena de suministro de software reconstruible.
- Ejecución equivalente en perfiles locales y Slurm validados, sin dependencia de API remotas obligatorias.
- Recuperación determinista de checkpoints y restauración del cursor de datos.
- Exportación de tokenizador, configuración y pesos en formatos abiertos.
- Descontaminación de benchmarks y evaluación por bytes, cómputo y dominio.
- Capacidades de razonamiento, código o tool calling: no disponibles, no especificadas en el protocolo.

## Casos de uso

Dado que el modelo no está entrenado ni publicado, los casos de uso son hipotéticos y dependen de la finalización del proyecto. Los escenarios que el protocolo pretende habilitar son:

- Investigación en soberanía de datos para LLM: el pipeline permite auditar cada documento desde su origen hasta su inclusión en el conjunto de entrenamiento, lo que resulta útil para instituciones que necesitan demostrar cumplimiento legal y técnico.
- Entrenamiento en infraestructura nacional de HPC: el proyecto está diseñado para ejecutarse en el supercomputador brasileño planificado, con perfiles Slurm validados y sin dependencia de nubes externas.
- Evaluación de calidad lingüística del portugués brasileño: los benchmarks y métricas por bytes y dominio permitirían comparar el rendimiento de modelos entrenados con corpus de alta procedencia frente a alternativas que usan agregados web.
- Desarrollo de modelos de dominio público con licencias claras: al excluir corpus ambiguos, los futuros pesos podrían distribuirse con una cadena de derechos más limpia que la de muchos modelos actuales.
- Formación de capacidades locales en entrenamiento de LLM: el protocolo sirve como referencia didáctica para equipos que quieran reproducir el proceso de entrenamiento desde cero.
- Auditoría de terceros: el registro de derechos con hashes de afirmaciones permite verificar la integridad de las decisiones de inclusión de datos, útil para organismos reguladores o financiadores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El proyecto especifica hipótesis preregistradas en `docs/research/preregistration.md`, pero no se reportan métricas de MMLU, HumanEval, GSM8K u otros estándares, ni comparaciones con modelos existentes. Toda afirmación de rendimiento está marcada como `not_measured` hasta que se complete el entrenamiento.

## Requisitos de hardware

No se dispone de requisitos de hardware medidos, ya que no hay entrenamiento completado. Las estimaciones para los tamaños planificados son orientativas y se basan en prácticas habituales para modelos densos de la familia Llama:

- Modelo nano (20-30M): cabe en cualquier GPU consumer (8-12 GB VRAM) en FP32; cuantizado, incluso en CPU.
- Modelo micro (100-125M): requiere ~1-2 GB VRAM en FP16; viable en GPUs consumer como RTX 3060 o superiores.
- Modelo small (~350M): ~2-3 GB VRAM en FP16; cabe en RTX 4090 y GPUs similares.
- Modelo medium (~1.3B): ~5-8 GB VRAM en FP16; requiere GPUs con 16 GB o más, o cuantización para consumer.
- Modelo target (~3B): ~12-16 GB VRAM en FP16; requiere GPUs de datacenter o cuantización agresiva.
- Modelo stretch (~7B): ~28-32 GB VRAM en FP16; requiere A100, H100 o múltiples GPUs.

Para el entrenamiento, el proyecto contempla perfiles locales y Slurm, con checkpoints distribuidos recuperables. El despliegue en inferencia podría usar vLLM, llama.cpp u Ollama, pero no hay configuraciones validadas publicadas.

## Comparativa con modelos similares

El propio proyecto reconoce que ya existen modelos en portugués brasileño, como TeenyTinyLlama, Tucano, Tucano 2 y Sabiá, y descarta cualquier afirmación de novedad amplia como "el primer modelo en portugués". La comparativa es conceptual, ya que no hay datos de rendimiento de BR Sovereign LLM:

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| BR Sovereign LLM (planificado) | 20M-7B | 2.048 tokens | Apache-2.0 (código) | Protocolo, sin pesos |
| TeenyTinyLlama | ~1.1B | 2.048 tokens | Apache-2.0 | Pesos publicados |
| Tucano | 160M-13B | 4.096 tokens | Apache-2.0 | Pesos publicados |
| Sabiá | ~1.3B-7B | 2.048-8.192 tokens | No comercial (algunos) | Pesos publicados |

La diferencia clave de BR Sovereign LLM no es el rendimiento, sino la trazabilidad completa de los datos y la ejecución sin dependencia de servicios externos. No hay datos de benchmarks comparativos disponibles.

## Limitaciones y advertencias

- El proyecto no contiene pesos entrenados ni resultados medidos; cualquier uso en producción es imposible en el estado actual.
- La licencia Apache-2.0 cubre únicamente el código y la documentación del proyecto, no los futuros datos de entrenamiento, que conservarán sus licencias específicas.
- El corpus excluye fuentes ampliamente utilizadas (BrWaC, Carolina, CulturaX, mC4, OSCAR, HPLT, Common Crawl, GigaVerbo), lo que puede limitar la cobertura y el rendimiento en dominios no representados por las fuentes permitidas.
- La longitud de contexto de 2.048 tokens es corta para aplicaciones modernas que requieren ventanas largas.
- No se han reportado evaluaciones de sesgos, alucinación o robustez; el proyecto no menciona procesos de alineación como RLHF o DPO.
- El entrenamiento depende de la disponibilidad del supercomputador brasileño y de la asignación de recursos; no hay garantía de que se complete.
- La verificación de derechos mediante hashes de afirmaciones no constituye prueba legal independiente; la publicación final requiere revisión jurídica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/guicybercode/br-sovereign-llm-research
- Perfil del autor: https://huggingface.co/guicybercode
- Artículo sobre supercomputador brasileño (Agência Brasil): https://agenciabrasil.ebc.com.br/en/economia/noticia/2026-08/brazil-get-its-own-ai-supercomputer
- Informe sobre LLM soberanos (arXiv): https://arxiv.org/abs/2503.04745
- Versión HTML del informe: https://arxiv.org/html/2503.04745v1
- Documento de preregistro (referenciado en la model card, no enlazado directamente): `docs/research/preregistration.md`
