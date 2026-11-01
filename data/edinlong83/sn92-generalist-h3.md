# edinlong83/sn92-generalist-h3

## Resumen

sn92-generalist-h3 es un ajuste fino (fine-tune) del modelo decisionmodels/reax-1.1, publicado por el usuario edinlong83 en el contexto de la subred 92 (SN92, también llamada REAX) de Bittensor. El modelo se presenta como una entrada "generalist" para tareas de decisión: clasificación, aplicación de reglas, aritmética, lógica, salida de código, acordes musicales, ajedrez y abstención calibrada, entre otras. Mantiene la arquitectura, el tokenizador, el loader y la temperatura del modelo base, y añade un LoRA fusionado en los pesos junto con una cabeza de lectura (readout head) reentrenada.

El interés técnico principal reside en su enfoque de entrenamiento: los datos se generan de forma procedural con etiquetas doradas calculadas (no anotadas por humanos), se complementan con etiquetado de seguridad basado en Aegis-2.0, abstención auto-destilada y un conjunto de tareas de clasificación documental construido a partir de registros públicos etiquetados (patentes con secciones CPC, provisiones contractuales LEDGAR, áreas de conflicto del Tribunal Supremo, holdings de CaseHOLD, clases de la ontología DBpedia, categorías de afecciones médicas y clasificadores de estado de desarrollo y temática de PyPI).

Con 26.085.330.160 parámetros totales y un repositorio de 52,2 GB en safetensors, se trata de un modelo de gran tamaño orientado a inferencia especializada en decisiones estructuradas más que a generación abierta de texto. Su licencia Apache-2.0 y su naturaleza de fine-tune sobre un modelo base de la subred 92 lo hacen relevante para quienes participan en el ecosistema Bittensor o necesitan un modelo de clasificación/razonamiento con abstención explícita.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (tag `qwen3_5`; arquitectura del base decisionmodels/reax-1.1, sin cambios) |
| Parametros totales | 26.085.330.160 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo conserva la arquitectura del base decisionmodels/reax-1.1 (etiquetada como `qwen3_5` en HuggingFace), así como su tokenizador, loader y temperatura. Sobre esa base se aplicó un único run de LoRA cuyos pesos se fusionaron en el modelo, junto con una cabeza de lectura ajustada. No se documentan cambios en la arquitectura del transformer ni en el mecanismo de atención.

El entrenamiento combina varias fuentes. Por un lado, ítems de decisión generados de forma procedural con etiquetas doradas calculadas: aritmética, lógica, salida de código, acordes, ajedrez y aplicación de reglas. Por otro, etiquetado de seguridad basado en Aegis-2.0 y abstención auto-destilada (el modelo aprende a declarar que no sabe). Se añaden ítems de documento-a-categoría-oficial construidos a partir de registros públicos etiquetados: resúmenes de patentes con secciones CPC (ccdv/patent-classification), provisiones contractuales LEDGAR, áreas de conflicto del Tribunal Supremo y holdings de CaseHOLD (coastalcph/lex_glue), clases de la ontología DBpedia (fancyzhx/dbpedia_14), categorías de afecciones (TimSchopf/medical_abstracts) y clasificadores de estado de desarrollo y temática de la API JSON de PyPI. Todo ello se complementa con el conjunto público de entrenamiento generalista de SN92. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF o DPO.

## Capacidades

- Clasificación y decisión estructurada: asignación de documentos a categorías oficiales (patentes, contratos, jurisprudencia, ontologías, afecciones médicas, paquetes PyPI).
- Razonamiento aritmético y lógico con etiquetas calculadas.
- Predicción de salida de código (resultado de ejecución de fragmentos).
- Tareas de dominio específico: acordes musicales, ajedrez y aplicación de reglas.
- Abstención calibrada: el modelo puede declarar que no dispone de información suficiente, entrenado mediante auto-destilación.
- Etiquetado de seguridad alineado con Aegis-2.0.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales (thinking mode, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Clasificación de patentes por sección CPC: el modelo puede asignar resúmenes de patentes a las secciones correspondientes, ya que fue entrenado con el dataset ccdv/patent-classification y dispone de una cabeza de lectura orientada a decisión.
- Revisión y categorización de contratos: clasificación de provisiones contractuales LEDGAR en sus tipos correspondientes, útil en pipelines de análisis legal automatizado.
- Análisis de jurisprudencia: asignación de áreas de conflicto del Tribunal Supremo y holdings de CaseHOLD, adecuado para sistemas de recuperación y etiquetado de documentos judiciales.
- Clasificación temática de textos generales: mapeo a clases de la ontología DBpedia mediante el entrenamiento con fancyzhx/dbpedia_14.
- Triage de resúmenes médicos: categorización de afecciones a partir de TimSchopf/medical_abstracts, aplicable a sistemas de organización de documentación clínica.
- Catalogación de paquetes PyPI: predicción de estado de desarrollo y temática de paquetes a partir de los metadatos de la API JSON, útil para índices y registros de software.
- Verificación de resultados de código y aritmética: el modelo puede predecir la salida de fragmentos de código o resolver operaciones aritméticas con etiquetas calculadas, lo que permite usarlo como verificador en pipelines de evaluación.
- Sistemas con abstención: en escenarios donde una respuesta incorrecta es costosa (legal, médico, financiero), la capacidad de abstención auto-destilada permite derivar casos inciertos a revisión humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 26.085 millones de parámetros, en FP16 se requieren aproximadamente 52 GB solo para pesos; en cuantización de 8 bits, unos 26 GB; en 4 bits, unos 13-14 GB, más overhead de activaciones y contexto.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, un despliegue en FP16 requiere GPUs de 80 GB (A100, H100) o múltiples GPUs; las cuantizaciones de 8 y 4 bits podrían caber en GPUs consumer de gama alta con suficiente VRAM.
- Cabe en consumer GPU: no confirmado; previsiblemente solo en cuantizaciones bajas y GPUs con 16-24 GB de VRAM, sin datos oficiales.
- Opciones de despliegue: no disponible en la información proporcionada. Al ser safetensors con arquitectura tipo Qwen, sería compatible con frameworks habituales (vLLM, TGI, llama.cpp tras conversión a GGUF), pero no se documenta soporte explícito.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| sn92-generalist-h3 | 26,1 B | no disponible | Apache-2.0 | Fine-tune de decisionmodels/reax-1.1 con LoRA fusionado y cabeza de decisión |
| decisionmodels/reax-1.1 (base) | no disponible | no disponible | no disponible | Modelo base del que deriva; misma arquitectura, tokenizador y loader |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | No se dispone de información sobre modelos comparables en la documentación proporcionada |

## Limitaciones y advertencias

- El modelo está orientado a tareas de decisión y clasificación; su rendimiento en generación abierta de texto no está documentado y podría ser limitado.
- No se especifican los idiomas soportados; el entrenamiento descrito se basa en datasets mayoritariamente en inglés, por lo que el rendimiento en castellano es incierto.
- Riesgo de alucinación: aunque incorpora abstención auto-destilada, no se han publicado métricas de calibración ni tasas de error.
- Sesgos: los datasets de origen (jurisprudencia, patentes, contratos, DBpedia, PyPI) pueden introducir sesgos de dominio y de representación; no se documenta ningún análisis de sesgo.
- Licencia Apache-2.0 permite uso comercial, pero se recomienda revisar MODIFICATIONS.md y NOTICE del repositorio, así como los términos de los datasets de entrenamiento citados (cada uno bajo sus propias condiciones).
- El modelo base decisionmodels/reax-1.1 pertenece a la subred 92 de Bittensor; conviene verificar los términos upstream retenidos.
- No hay información sobre longitud de contexto, cuantizaciones soportadas ni rendimiento en producción, lo que dificulta planificar un despliegue sin pruebas adicionales.
- El repositorio tiene 44 descargas y 0 likes en el momento de la consulta, lo que indica escasa validación comunitaria.

## Enlaces

- HuggingFace: https://huggingface.co/edinlong83/sn92-generalist-h3
- Modelo base: https://huggingface.co/decisionmodels/reax-1.1
- Dataset de patentes: https://huggingface.co/datasets/ccdv/patent-classification
- Dataset legal LexGLUE: https://huggingface.co/datasets/coastalcph/lex_glue
- Dataset DBpedia: https://huggingface.co/datasets/fancyzhx/dbpedia_14
- Dataset médico: https://huggingface.co/datasets/TimSchopf/medical_abstracts
- API JSON de PyPI: https://pypi.org/pypi/
