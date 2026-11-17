# david-thrower/NotGPT-Phase-1-MVP-Design

## Resumen

NotGPT Phase 1 — MVP Design & Build Handoff es un repositorio de Hugging Face publicado por el usuario david-thrower que no contiene pesos de un modelo, sino documentación de diseño y un plan de construcción para un producto denominado NotGPT. El artefacto principal son dos documentos Markdown: un design doc que describe la arquitectura del MVP refactorizado a partir de un codebase AWS ya existente, y una build handoff card pensada para que un agente ejecute la construcción en diez fases con puertas de aceptación. La model card lo declara explícitamente como "design review, not build": nada de lo descrito ha sido construido y se advierte de que la construcción no debe lanzarse hasta re-verificar el modelo de costes.

El contenido técnico gira en torno a un pipeline de personalización desplegado como DAG de Hugging Face Jobs, con un modelo estudiante de dos posibles tamaños (Scenario A: Nemotron 3 4B; Scenario B: HelixLM 300–500M, con base concreta HelixLM-53.9M) y un profesor servido vía API de frontera. La model card incluye una tabla de costes por usuario (onboarding y mensual) y una evaluación de recuperación de detalles terciarios. El repositorio no expone arquitectura de red neuronal propia, parámetros, contexto ni licencia.

Por su naturaleza, este repositorio resulta relevante como ejemplo de handoff entre agentes para proyectos de IA, no como modelo desplegable. Cualquier evaluación de capacidades, benchmarks o requisitos de hardware debe hacerse sobre los modelos referenciados (Nemotron 3 4B y HelixLM), no sobre este artefacto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio contiene documentación de diseño, no pesos de modelo) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (los artefactos son documentos Markdown: design-doc.md y build-handoff-card.md) |

## Arquitectura y entrenamiento

El repositorio no describe el entrenamiento de una red neuronal. Lo que documenta es la arquitectura de un producto: un pipeline de personalización por usuario que se ejecuta como DAG en Hugging Face Jobs, alimentado por un corpus de aproximadamente 250 MB por usuario, con un modelo estudiante destilado de un profesor de frontera servido por API. El design doc incluye una tabla de mapeo AWS → Hugging Face, la lista de discrepancias entre lo construido y lo diseñado (el upsampling era k=1, el subsetting 60/40 era un stub, la columna de razonamiento se eliminó y el servicio personal-slm servía un modelo base) y el modelo de costes completo en dos escenarios.

El escenario A emplea un estudiante Nemotron 3 de 4B parámetros; el escenario B emplea un estudiante HelixLM de 300–500M, con base concreta publicada como david-thrower/HelixLM-53.9M-20261116-br72-d512-h8-nl3-s2048-5.0BT-wsd (53,9M de parámetros, dimensión 512, 8 cabezas, 3 capas, contexto 2048, 5.000 millones de tokens de entrenamiento, scheduler warmup-stable-decay). No se aportan detalles sobre composición del dataset, RLHF, DPO ni innovaciones de atención para el modelo estudiante más allá de la nomenclatura de su checkpoint.

## Capacidades

- El repositorio no implementa un modelo con capacidades de inferencia; su función es servir de especificación ejecutable para un agente de construcción.
- Define diez fases de build con puertas de aceptación, una puerta de verificación previa y una lista de "as-built → must-fix".
- Especifica un pipeline de personalización por usuario como DAG de Hugging Face Jobs con costes objetivo (onboarding < 50 USD por usuario).
- Describe un agente desplegado con niveles de frontera configurables (frontier tiers) para el profesor.
- Incluye una evaluación de recuperación de detalles terciarios (tertiary-detail-recall eval) como criterio de calidad.
- Proporciona un modelo de costes con análisis de sensibilidad y puntos de equilibrio para dos escenarios de tamaño de estudiante.
- No soporta tool calling, agentes multi-paso, visión, audio ni capacidades multilingües propias, al no ser un modelo.

## Casos de uso

- Handoff entre agentes de IA: la build-handoff-card.md está diseñada para que un agente nuevo ejecute la construcción del MVP sin contexto previo, con misión, no negociables y puertas de aceptación por fase.
- Auditoría de un codebase existente: el design doc re-deriva el MVP a partir del código AWS ya construido y documenta discrepancias concretas (upsampling k=1, subsetting 60/40 como stub, columna de razonamiento eliminada), útil como plantilla de revisión técnica.
- Estimación de costes de productos de personalización: la tabla de costes por usuario y escenario permite decidir entre un estudiante de 4B y uno de 300–500M antes de invertir en build.
- Planificación de migración cloud: la tabla de mapeo AWS → Hugging Face sirve para trasladar un pipeline de personalización a HF Jobs conservando la lógica del DAG.
- Diseño de evaluaciones de calidad: la tertiary-detail-recall eval es un ejemplo concreto de métrica para medir si un estudiante conserva detalles poco frecuentes del corpus del usuario.
- Documentación de guardarraíles de coste: los guardarraíles por fase y la advertencia de no lanzar el build hasta re-verificar precios sirven como referencia para proyectos con coste variable por token.
- Formación de equipos: el par de documentos ejemplifica cómo separar revisión de diseño y ejecución de construcción en proyectos de IA generativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo aporta cifras de coste, no de calidad: onboarding por usuario de 75–96 USD en el escenario A (por encima del objetivo de < 50 USD) frente a 25–46 USD en el escenario B; coste mensual por usuario en línea de aproximadamente 3–84 USD según el nivel de frontera; coste de build de aproximadamente 60–450 USD dependiente del driver.

## Requisitos de hardware

- No aplica al repositorio en sí: no contiene pesos ni código de inferencia, por lo que no requiere VRAM ni GPU para su consulta.
- Para ejecutar el pipeline descrito se necesitaría infraestructura de Hugging Face Jobs y acceso a un proveedor de API de frontera para el profesor.
- Los requisitos de hardware del estudiante dependen del escenario: un Nemotron 3 de 4B exige más VRAM que un HelixLM de 300–500M, pero la información proporcionada no incluye cifras de VRAM, GPU recomendadas ni throughput.
- Opciones de despliegue, latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. El repositorio no es un modelo y la información proporcionada no permite compararlo con alternativas de la misma categoría. Los modelos referenciados en la documentación (Nemotron 3 4B y HelixLM 53.9M) sí serían comparables entre sí, pero no se aportan sus especificaciones completas ni resultados de rendimiento.

## Limitaciones y advertencias

- El repositorio no contiene un modelo entrenado: no puede usarse para inferencia, generación de texto ni ninguna tarea de IA.
- La model card advierte explícitamente de que nada ha sido construido y de que el build no debe lanzarse hasta re-verificar el modelo de costes contra precios actuales.
- El modelo de costes se leyó el 2026-11-17 y queda obsoleto en cuanto cambien los precios de Hugging Face o de los proveedores de API.
- El escenario A incumple el objetivo de onboarding < 50 USD por usuario salvo con corpus pequeños, según los propios datos del autor.
- Licencia no disponible: no se puede determinar si el uso comercial está permitido.
- No hay información sobre sesgos, alucinación o limitaciones idiomáticas porque no hay modelo que evaluar.
- El repositorio tiene 0 descargas y 0 likes, sin pipeline declarado ni idiomas especificados; su madurez y validación externa son nulas.
- El contenido de la model card son datos de referencia del autor y no deben interpretarse como instrucciones operativas.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/david-thrower/NotGPT-Phase-1-MVP-Design
- Documento de diseño: https://huggingface.co/david-thrower/NotGPT-Phase-1-MVP-Design/blob/main/design-doc.md
- Tarjeta de handoff de construcción: https://huggingface.co/david-thrower/NotGPT-Phase-1-MVP-Design/blob/main/build-handoff-card.md
- Codebase origen en bucket HF: hf://buckets/david-thrower/NotGPT-Phase-1-temp/NotGPT-Phase-1-temp-latest-all-2-to-hf/NotGPT-Phase-1-temp-latest-all/
- Modelo base HelixLM: https://huggingface.co/david-thrower/HelixLM-53.9M-20261116-br72-d512-h8-nl3-s2048-5.0BT-wsd
