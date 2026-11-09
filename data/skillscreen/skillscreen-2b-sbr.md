# SkillScreen/SkillScreen-2B-SBR

## Resumen

SkillScreen-2B-SBR es un modelo de clasificación de texto de 2.213.247.808 parámetros (aproximadamente 2,2 mil millones) desarrollado por SkillScreen, un equipo de investigación vinculado a los autores del paper arXiv:2610.17727. El modelo está diseñado para una tarea muy concreta dentro de la seguridad de agentes: detectar skills (habilidades) maliciosas a partir de su archivo `SKILL.md`, es decir, el documento de definición que un agente de IA lee para saber cómo ejecutar una habilidad concreta. El problema que resuelve es el de la superficie de ataque que introducen los ecosistemas de skills de agentes: un `SKILL.md` manipulado puede instruir al agente para exfiltrar datos, ejecutar comandos o eludir políticas de seguridad.

El modelo se basa en OpenJev 2B (que a su vez deriva de la familia Qwen, según las etiquetas y los avisos de terceros del repositorio) y se ha afinado mediante LoRA sobre el dataset ProtectSkills/MaliciousSkillBench, utilizando un esquema de muestreo denominado Source-Balanced Random (SBR). Se distribuye como pesos completos en la raíz del repositorio, con el adaptador LoRA original y la cabeza de clasificación en el subdirectorio `adapter/`. La tarea se formula como un problema de inferencia de lenguaje natural (NLI): la puntuación nativa es la softmax de la clase "entailment", y se marca como sospechoso cualquier valor mayor o igual a 0,5.

Es relevante ahora porque el despliegue de agentes con skills de terceros se ha convertido en un vector de riesgo real en producción, y este modelo ofrece una criba de alta recall (98,13 % con el umbral por defecto, 99,47 % con el umbral ajustado para validación) sobre entradas de hasta 8.192 tokens, con una licencia Apache-2.0 que permite uso comercial y redistribución. El modelo está pensado como filtro previo (screening) antes de que un agente cargue o ejecute una skill.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base OpenJev 2B, familia Qwen) con cabeza de clasificación para NLI; afinado con LoRA y fusionado en pesos completos |
| Parametros totales | 2.213.247.808 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens (presupuesto de entrada declarado para `SKILL.md`) |
| Tipos de cuantizacion | no disponible (la model card solo indica requisito de CUDA con soporte BF16; no se documentan GGUF, AWQ, GPTQ ni otras) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (pesos, adaptador, cabeza, código y configuración); CC BY 4.0 para model card, documentación y metadatos de citación |
| Formato de pesos | safetensors (pesos completos en la raíz; adaptador LoRA y cabeza de clasificación en `adapter/`) |

## Arquitectura y entrenamiento

El modelo parte de OpenJev 2B, un transformer decoder-only de aproximadamente 2,2 mil millones de parámetros, y se adapta a clasificación binaria mediante una cabeza de clasificación sobre una formulación de inferencia de lenguaje natural (NLI). La decisión se toma a partir de la softmax de la clase "entailment": la puntuación nativa se compara con un umbral, y por encima de 0,5 la skill se marca como sospechosa. El input es exclusivamente el contenido de `SKILL.md`, truncado a un máximo de 8.192 tokens. El ajuste se realizó con LoRA sobre el dataset ProtectSkills/MaliciousSkillBench y el checkpoint de referencia documentado es `direct-sbr-s42` (semilla 42, update 426).

La innovación metodológica destacable es el esquema Source-Balanced Random (SBR) para construir los conjuntos de entrenamiento y test, que busca equilibrar la contribución de cada fuente de skills maliciosas y evitar que el modelo sobreajuste a un único origen de datos. El repositorio incluye además `provenance.json` con los detalles del checkpoint y `merge_verification.json` con las comprobaciones de la exportación de pesos fusionados. No se detalla en la información disponible el número total de tokens de entrenamiento, la composición completa del dataset ni si se aplicaron etapas de RLHF o DPO; al tratarse de un modelo de clasificación, el entrenamiento supervisado sobre etiquetas del benchmark es el mecanismo documentado.

## Capacidades

- Clasificación binaria de skills de agentes a partir de `SKILL.md`: devuelve una puntuación nativa de maliciosidad (softmax de entailment) y una decisión por umbral.
- Cribado de alta recall: 98,13 % de recall con FPR del 1,56 % en el umbral por defecto de 0,5; 99,47 % de recall con FPR del 9,80 % en el umbral ajustado de 0,0526.
- Procesamiento de entradas largas de hasta 8.192 tokens, adecuado para documentos de skill extensos con instrucciones, metadatos y ejemplos.
- Formulación NLI: la tarea se trata como inferencia entre el documento y una hipótesis de maliciousness, lo que permite umbrales calibrados sobre validación.
- No es un modelo generativo: no produce texto libre, no soporta tool calling ni function calling, no ejecuta razonamiento multi-step y no tiene modo thinking.
- No se documentan capacidades multilingües, de visión, de audio ni de código generativo; el uso está acotado a la clasificación de documentos de skill.
- Exportación en dos formatos: pesos completos fusionados en la raíz y adaptador LoRA más cabeza en `adapter/`, lo que permite reutilizar el adaptador sobre el base model.

## Casos de uso

- Filtro previo en pipelines de instalación de skills: antes de que un agente cargue una skill de un registro o marketplace, el modelo puntúa el `SKILL.md` y bloquea las que superen el umbral, con un recall del 98,13 % y un FPR del 1,56 % en la configuración por defecto.
- Moderación de repositorios de skills de terceros: integración en CI/CD para escanear cada `SKILL.md` en un pull request y rechazar automáticamente los cambios que eleven la puntuación de maliciosidad, usando el umbral ajustado cuando el coste de un falso negativo es alto.
- Auditoría de seguridad de agentes en producción: ejecución periódica del scorer sobre el catálogo de skills ya instaladas para detectar derivas o skills comprometidas, aprovechando el presupuesto de 8.192 tokens para documentos largos.
- Gate de confianza en plataformas de agentes multi-tenant: cada tenant publica skills y la plataforma aplica el modelo como control de admisión, registrando la puntuación nativa como evidencia auditable.
- Investigación en seguridad de agentes: uso del checkpoint como línea base reproducible (semilla 42, update 426) para comparar nuevas técnicas de detección sobre MaliciousSkillBench con la revisión del dataset `d4b42ce...`.
- Reentrenamiento y adaptación interna: al incluir el adaptador LoRA en `adapter/`, un equipo puede partir del mismo adaptador para afinar sobre su propio corpus de skills y mantener la cabeza de clasificación NLI.
- Triaje humano asistido: despliegue con el umbral bajo (0,0526) para maximizar recall y derivar las skills marcadas a revisión manual, aceptando el FPR del 9,80 % a cambio de no dejar pasar casos maliciosos.

## Benchmarks y rendimiento

Resultados de referencia del checkpoint LoRA de origen `direct-sbr-s42` (semilla 42, update 426) sobre el test Source-Balanced Random de MaliciousSkillBench: 1.950 skills (1.501 maliciosas, 449 benignas), revisión del dataset `d4b42ce5766a6e0359c987cf59c1007cb3795a90`, entrada `SKILL.md` de hasta 8.192 tokens. Son resultados de un único checkpoint, distintos de las medias multi-semilla del paper.

| Regla de umbral | Umbral nativo | Recall (%) | FPR (%) |
|---|---:|---:|---:|
| Por defecto | 0,5 | 98,13 | 1,56 |
| Objetivo 99 % recall en validación | 0,052618616955879056 | 99,47 | 9,80 |

No se han publicado en la información disponible resultados de benchmarks generales (MMLU, HumanEval, GSM8K) ni comparaciones con otros modelos de detección de skills maliciosas.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos completos en BF16, aproximadamente 4,4 GB solo para los parámetros (2,21 mil millones × 2 bytes), más overhead de activaciones y del presupuesto de 8.192 tokens de contexto; en la práctica conviene reservar entre 8 y 12 GB. No se documentan cuantizaciones, por lo que no hay cifras oficiales para INT8 o INT4.
- GPU recomendadas: la model card exige CUDA con soporte BF16. Cualquier GPU con BF16 nativo y al menos 12-16 GB de VRAM es suficiente; A100, H100, L40S y RTX 4090 cumplen sobradamente. GPU consumer de gama media-alta con BF16 (por ejemplo, RTX 4080 o superiores) también deberían ser viables.
- Cabe en GPU consumer: sí, dado el tamaño de 2,2 mil millones de parámetros y el repo de 4,5 GB; es un modelo pequeño para el estándar actual.
- Opciones de despliegue: el flujo documentado usa `huggingface_hub` para descargar la revisión `v1.1`, `requirements.txt` del repo y el script `score.py` sobre un `SKILL.md`. La librería declarada es `transformers`, por lo que es compatible con pipelines de clasificación de Hugging Face, TGI y vLLM para clasificación; no se documentan recetas para llama.cpp, Ollama ni GGUF.
- Latencia y throughput: no disponible. No se publican medidas de latencia ni de tokens por segundo para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| SkillScreen-2B-SBR | 2,21 B | 8.192 tokens | Clasificación de skills maliciosas (NLI) | Apache-2.0 (pesos) / CC BY 4.0 (docs) | Hugging Face, revisión v1.1 |
| OpenJev 2B (base) | ~2 B | no disponible en esta ficha | Modelo generativo de propósito general | no disponible en esta ficha | Hugging Face |
| Alternativas específicas de detección de skills maliciosas | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de resultados comparativos frente a otros detectores de skills maliciosas ni de otros modelos de clasificación de seguridad de agentes; la comparación con OpenJev 2B es únicamente de linaje (es su modelo base), no de rendimiento en la tarea.

## Limitaciones y advertencias

- Modelo especializado y no generativo: no debe usarse para generación de texto, código, razonamiento general ni tool calling; fuera de la clasificación de `SKILL.md` su utilidad es nula.
- Dependencia del formato: la entrada es exclusivamente `SKILL.md` truncado a 8.192 tokens; skills maliciosas que oculten instrucciones fuera de ese documento, en artefactos binarios o en ficheros referenciados no serán detectadas por este filtro.
- Falsos positivos: con el umbral por defecto el FPR es del 1,56 %; con el umbral de alta recall sube al 9,80 %, lo que puede generar un volumen notable de revisiones manuales en catálogos grandes.
- Falsos negativos: incluso con el umbral ajustado el recall medido es del 99,47 %, no del 100 %; queda un margen residual de skills maliciosas no detectadas.
- Sesgos de dataset: el comportamiento está condicionado por MaliciousSkillBench y por el esquema SBR; skills maliciosas con patrones distintos de los representados en el benchmark pueden evadir el modelo. No se documentan análisis de sesgos por idioma, autor o tipo de skill.
- Idiomas: no se declaran idiomas soportados; no hay garantía de funcionamiento fuera del inglés ni de robustez ante `SKILL.md` multilingües o con ofuscación lingüística.
- Licencia: Apache-2.0 permite uso comercial, fine-tuning y redistribución sin permiso individual, pero exige preservar los avisos de atribución y identificar modificaciones; además siguen aplicándose los derechos y avisos de OpenJev y Qwen recogidos en `THIRD_PARTY_NOTICES.md`, `LICENSE-OPENJEV` y `LICENSE-QWEN`. La documentación y los informes de evaluación están bajo CC BY 4.0.
- Citación: se solicita citar el paper arXiv:2610.17727 y, si se publica un modelo derivado, identificar SkillScreen como fuente y enlazar al checkpoint original; estas peticiones no añaden condiciones a las licencias.
- Requisito de hardware: la model card exige CUDA con BF16; no se documentan rutas de inferencia en CPU ni cuantizaciones de bajo bit, lo que limita despliegues en entornos sin GPU.
- Versión: la revisión `v1.1` solo actualiza licencia y citación; pesos, adaptadores, tokenizer, código de scoring y configuraciones son idénticos a `v1`, por lo que resultados y comportamiento no cambian entre ambas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SkillScreen/SkillScreen-2B-SBR
- Paper: https://arxiv.org/abs/2610.17727 (DOI: 10.48550/arXiv.2610.17727)
- Página del paper en Hugging Face: https://huggingface.co/papers/2610.17727
- Página del proyecto: https://jerroldh.github.io/SkillScreen-webpage/
- Código: https://github.com/JerroldH/SkillScreen
- Modelo base OpenJev 2B: https://huggingface.co/AlexWortega/openjev
- Dataset MaliciousSkillBench: ProtectSkills/MaliciousSkillBench (referenciado en la model card; no se proporciona URL directa en la información disponible)
