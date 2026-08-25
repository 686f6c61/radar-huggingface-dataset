# sentry-ai/nz-sovereign-mistral-lora

## Resumen

El repositorio `sentry-ai/nz-sovereign-mistral-lora` es un adaptador LoRA sobre pesos abiertos de Mistral, concebido como la capa de modelo de un pipeline de IA soberana para Nueva Zelanda. El proyecto, liderado por Sentry AI, busca que una empresa neozelandesa pueda ejecutar un sistema de IA de extremo a extremo sobre computación renovable local, sin que ningún dato salga del país y con todas las capas inspeccionables y sustituibles. El adaptador se ajustaría con material neozelandés, incluyendo el idioma maorí (mi) además del inglés.

En el momento de redactar esta ficha, el repositorio es un placeholder: no contiene pesos, no se ha entrenado nada y el autor advierte explícitamente de que no debe citarse como resultado. El entrenamiento está previsto para noviembre de 2026, como paso 5 del pipeline documentado en el repositorio de GitHub asociado. La licencia apache-2.0 es provisional y se reconciliará con la del modelo base elegido, que aún no está fijado.

La relevancia de este proyecto radica en su enfoque de soberanía digital: evita depender de APIs externas, que romperían tanto la soberanía de datos como la trazabilidad energética del cómputo. Publicar los pesos en HuggingFace se considera distribución, no inferencia alojada, por lo que no vulnera esa restricción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre pesos abiertos de Mistral (base no fijada) |
| Parametros totales | no disponible (sin pesos publicados) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, mi (ingles y maori) |
| Licencia | apache-2.0 (provisional) |
| Formato de pesos | no disponible (repositorio placeholder, sin archivos) |

## Arquitectura y entrenamiento

El modelo se plantea como un adaptador LoRA (Low-Rank Adaptation) sobre un checkpoint base de Mistral de pesos abiertos. El checkpoint base exacto no está fijado y se registrará en el repositorio cuando se decida. La elección de LoRA en lugar de un modelo completo responde a una restricción del proyecto: si cualquier capa dependiera de una API externa, la reclamación de soberanía se invalidaría, y también la reclamación energética, porque no se sabría en qué red eléctrica se ejecutó el cómputo. Un adaptador local sobre pesos abiertos mantiene todas las capas inspeccionables y ejecutables en hardware propio.

El entrenamiento está previsto como paso 5 del pipeline Sovereign Agentic Pipeline, con datos de entrenamiento en el dataset `sentry-ai/nz-sovereign-sft` y un conjunto de evaluación held-out (`sentry-ai/nz-sovereign-eval`) privado y protegido. La regla de evaluación es estricta: el conjunto held-out nunca se usa para entrenar ni para ajustar hiperparámetros. Si el paso 5 se queda corto de tiempo, se recorta el dataset de entrenamiento, nunca el de evaluación. No se han publicado detalles sobre el número de tokens, la composición del dataset ni el uso de RLHF o DPO.

## Capacidades

- Generación de texto en inglés y maorí, orientada a material neozelandés.
- Adaptación eficiente mediante LoRA, lo que permite ajuste fino con recursos limitados.
- Integración en un pipeline de IA soberana: todas las capas (datos, modelo, inferencia) son locales e inspeccionables.
- Capacidad de sustitución del adaptador: al ser un componente separado, puede reemplazarse sin tocar el modelo base.
- No se han documentado capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio en la información disponible.

## Casos de uso

- Procesamiento de documentos gubernamentales y legales neozelandeses: el adaptador puede ajustarse sobre corpus locales para extraer, resumir o clasificar información sin que los datos salgan del país, cumpliendo requisitos de soberanía de datos.
- Atención al cliente en maorí e inglés: una empresa neozelandesa puede desplegar un asistente conversacional bilingüe que respete la cultura local y mantenga los datos de clientes en infraestructura propia.
- Análisis de datos empresariales con trazabilidad energética: al ejecutarse sobre computación renovable local, la empresa puede certificar que el procesamiento de IA no contribuye a emisiones fuera de su red eléctrica.
- Investigación académica sobre el idioma maorí: el adaptador puede servir para tareas de procesamiento de lenguaje natural en maorí, un idioma con pocos recursos, aprovechando la base de Mistral y el ajuste con datos locales.
- Generación de contenido localizado: redacción de informes, comunicaciones o material de marketing adaptado al contexto neozelandés, con control total sobre el modelo y los datos.
- Prototipado de sistemas de IA auditables: al ser un adaptador de código abierto sobre pesos abiertos, permite a equipos técnicos auditar cada capa y verificar que no hay dependencias ocultas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio es un placeholder y no contiene pesos entrenados, por lo que no existe ningún dato de rendimiento que reportar.

## Requisitos de hardware

- No disponibles: al no existir pesos ni especificaciones del modelo base, no se puede estimar VRAM, GPUs recomendadas ni opciones de despliegue.
- El proyecto menciona "hardware que podamos señalar" y computación renovable local, lo que sugiere que el despliegue se hará en infraestructura propia, pero sin detalles concretos.
- Una vez se publique el adaptador, los requisitos dependerán del checkpoint base de Mistral elegido (por ejemplo, Mistral 7B o similar) y de la cuantización utilizada.

## Comparativa con modelos similares

No disponible. No se han publicado comparaciones con otros adaptadores LoRA sobre Mistral ni con modelos alternativos. El proyecto es único en su enfoque de soberanía para Nueva Zelanda, pero no hay datos objetivos de rendimiento para comparar.

## Limitaciones y advertencias

- El repositorio es un placeholder: no hay pesos, no hay modelo entrenado. Cualquier uso o cita como resultado es prematuro e incorrecto.
- La licencia apache-2.0 es provisional y se reconciliará con la del modelo base elegido, que aún no se ha decidido. Esto puede afectar a los términos finales de uso comercial.
- El conjunto de evaluación es privado y protegido, lo que limita la reproducibilidad externa de los resultados.
- El proyecto se centra en inglés y maorí; no hay indicios de soporte para otros idiomas.
- No se han documentado sesgos específicos, pero al ser un ajuste sobre datos neozelandeses, podría reflejar sesgos presentes en ese corpus.
- Riesgo de alucinación: no evaluado, dado que no hay modelo entrenado.
- Para producción, es imprescindible esperar a la publicación real de los pesos y a la documentación del checkpoint base.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/sentry-ai/nz-sovereign-mistral-lora
- Dataset de entrenamiento: https://huggingface.co/datasets/sentry-ai/nz-sovereign-sft
- Repositorio GitHub del pipeline: https://github.com/JamesWeb3/sovereign-agentic-pipeline
- Sitio de Sentry AI: https://sentrysolutions.ai/
- Página de infraestructura LLM privada: https://sentrysolutions.ai/private-llm-infrastructure
- Noticia de Mistral sobre inferencia regional y modelos abiertos: https://mistral.ai/news/regional-inference-open-models-new-compute/
