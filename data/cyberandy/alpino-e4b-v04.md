# cyberandy/Alpino-e4b-v04

## Resumen

Alpino-e4b-v04 es un adaptador LoRA (librería PEFT) desarrollado por cyberandy (Andrea Volpini, CEO de WordLift) sobre el modelo base `google/gemma-4-E4B-it`. Se trata de la versión v0.4 de un adaptador especializado que convierte un modelo compacto en un agente webmaster gobernado para el sitio de turismo alpino Alpina.travel, capaz de operar sobre un grafo de conocimiento y ejecutar tareas de edición web de forma acotada y auditable.

La relevancia de este modelo no reside en su capacidad general, sino en que es el primer adaptador entrenado mediante un *learning store* gobernado: cada ejemplo de entrenamiento tiene autor humano o aprobador, el corpus está vinculado por hash al run de entrenamiento, y una compuerta de exposición de decisiones registrada puede rechazar el entrenamiento si el currículo no cubre estados declarados por la ontología. Actúa como demostrador de la arquitectura MOSAIC-KG (Modular Open Architecture for Sovereign, Auditable and Intelligent Knowledge Graphs) de WordLift, que desplaza la IA empresarial de la recuperación documental al razonamiento sobre grafos de conocimiento.

Con un tamaño de repositorio de 0.2 GB, el adaptador es extremadamente ligero y está diseñado para ejecutar tareas acotadas de gestión de contenido web en lugar de un modelo frontera, con validación determinista y salvaguardas de comportamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador PEFT) sobre `google/gemma-4-E4B-it` |
| Parametros totales | no disponible (el adaptador pesa 0.2 GB; el base Gemma 4 E4B es un modelo compacto de aproximadamente 4B parametros) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (depende del modelo base; no se especifica en la informacion) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el base puede cuantizarse con metodos estandar) |
| Idiomas soportados | en, de, it |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre `google/gemma-4-E4B-it`, un modelo de Google de la familia Gemma 4 orientado a edge y dispositivos con recursos limitados. Alpino-e4b-v04 es un adaptador LoRA entrenado con SFT (supervised fine-tuning) sobre un corpus rebalanceado que incorpora el primer episodio registrado en el *learning store* gobernado. No es una continuación de los pesos de versiones anteriores (v01, v02, v03), sino un entrenamiento fresco.

La innovación principal está en el proceso de entrenamiento, no en la arquitectura del adaptador. El currículo proviene de un *Governed Learning Store* que impone tres restricciones: (1) las herramientas (`inspect_*`) permanecen en cada traza de entrenamiento para evitar que el modelo pierda la capacidad de usarlas; (2) una compuerta registrada calcula soporte por miembro y entropía por eje sobre los vocabularios de decisión declarados por la ontología (goal, coverage, exposure, seasonal fit, intervention, disposition) y rechaza el entrenamiento si algún estado no está suficientemente ejercitado; (3) el hash del corpus se vincula al manifiesto de entrenamiento, y el runner rechaza manifiestos cuyo hash no pueda reproducir el árbol. En su primera ejecución, la compuerta detectó que el estado `ShoulderSeason` no estaba cubierto y bloqueó el entrenamiento hasta que se registró un episodio de reparación aprobado por el propietario del contenido.

## Capacidades

- Generación de texto y razonamiento conversacional en inglés, alemán e italiano.
- Ejecución de tareas de webmaster acotadas: crear, actualizar y fusionar contenido en un sitio web basado en grafo de conocimiento.
- Uso de herramientas de observación (`inspect_*`) para leer el grafo, entidades, vecindarios y medios antes de proponer cualquier acción.
- Cumplimiento del protocolo AOOE (Agentic Observation-Orientation-Execution) con salidas estructuradas y compiladores deterministas por acto.
- Refusals entrenados: el modelo puede rechazar acciones que no cumplan las restricciones de gobernanza.
- Validación numérica de afirmaciones y comprobación de claims mediante validadores deterministas.
- Integración con el flujo de autoría mediante pull requests (draft-PR-only) y revisión humana como compuerta de publicación.
- Capacidad de razonamiento sobre el grafo de conocimiento de Alpina.travel (entidades, itinerarios, apartamentos, guías).

## Casos de uso

- Gestión automatizada de contenido turístico: el modelo puede proponer actualizaciones de fichas de apartamentos, itinerarios y guías en Alpina.travel, leyendo el grafo RDF y generando ediciones acotadas que se envían como pull requests para revisión humana.
- Mantenimiento de coherencia ontológica: gracias a la compuerta de decisión, el modelo puede detectar estados no cubiertos (como `ShoulderSeason`) y proponer contenido que los ejercite, evitando lagunas en el conocimiento del sitio.
- Publicación asistida con gobernanza: cada acción propuesta pasa por validadores deterministas y revisión humana antes de fusionarse, lo que lo hace adecuado para entornos donde la auditoría es obligatoria.
- Agente de atención al viajero: con su capacidad multilingüe (en, de, it) y su conocimiento del grafo, puede responder consultas sobre apartamentos, lugares y rutas en la región de Lungau, con evidencia enlazada al grafo.
- Demostrador de arquitectura MOSAIC-KG: sirve como referencia técnica para empresas que quieran implementar un sistema de IA sobre grafo de conocimiento con control determinista y memoria operativa gobernada.
- Entrenamiento y reentrenamiento con memoria operativa: el *learning store* captura episodios de operación real (vía Alpino Space) y los realimenta al currículo, permitiendo ciclos de mejora continua con trazabilidad completa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo no presenta métricas de MMLU, HumanEval, GSM8K ni otros estándares. Su evaluación se centra en la correcta ejecución del protocolo AOOE y en el cumplimiento de las restricciones de gobernanza, no en capacidades generales de razonamiento.

## Requisitos de hardware

- Al ser un adaptador LoRA de 0.2 GB, el requisito principal es el modelo base `google/gemma-4-E4B-it`, que es un modelo compacto diseñado para edge y dispositivos con recursos limitados.
- VRAM estimada: no disponible con precisión, pero un modelo de ~4B parámetros en cuantización 4-bit puede ejecutarse en GPUs consumer con 8 GB de VRAM (p. ej., RTX 3060, RTX 4060) o incluso en CPU con suficiente RAM.
- GPU recomendadas: cualquier GPU moderna con al menos 8 GB de VRAM; para despliegue en producción, una A10G o L4 sería suficiente.
- Opciones de despliegue: al ser un adaptador PEFT, puede cargarse con Hugging Face Transformers; el base puede servirse con vLLM, llama.cpp, Ollama o TGI, cargando el adaptador sobre el base.
- Latencia y throughput: no disponibles; al ser un modelo pequeño, se espera latencia baja en tareas de generación corta, pero no hay datos publicados.

## Comparativa con modelos similares

| Modelo | Base | Tipo | Tamaño | Contexto | Licencia | Enfoque |
|---|---|---|---|---|---|---|
| Alpino-e4b-v04 | Gemma 4 E4B | LoRA | 0.2 GB | no disponible | Apache 2.0 | Agente webmaster gobernado sobre KG |
| Alpino-e4b-v03 | Gemma 4 E4B | LoRA | no disponible | no disponible | Apache 2.0 | Operador de referencia (actúa) |
| Alpino-e4b-v02 | Gemma 4 E4B | LoRA | no disponible | no disponible | Apache 2.0 | Decide de forma segura (GRPO) |
| Alpino-e4b-v01 | Gemma 4 E4B | LoRA | no disponible | no disponible | Apache 2.0 | Habla el protocolo AOOE |

No se dispone de comparativas con modelos externos de la misma categoría (agentes webmaster sobre KG) en la información proporcionada. La serie Alpino comparte base y licencia, diferenciándose en el método de entrenamiento y el alcance funcional.

## Limitaciones y advertencias

- El modelo está especializado en un dominio muy concreto (turismo alpino y gestión de contenido web de Alpina.travel); su uso fuera de ese dominio probablemente degrade su rendimiento.
- No se han publicado benchmarks de capacidades generales; no es adecuado como modelo de propósito general.
- Riesgo de alucinación inherente a los modelos de lenguaje; mitigado parcialmente por los validadores deterministas y la revisión humana obligatoria en el flujo de publicación.
- Dependencia del modelo base `google/gemma-4-E4B-it`: cualquier limitación del base (idiomas, contexto, sesgos) se hereda.
- El entrenamiento con *learning store* impone restricciones de gobernanza que pueden no ser aplicables a otros casos de uso; la compuerta de decisión puede rechazar entrenamientos si el currículo no cubre todos los estados ontológicos.
- La licencia Apache 2.0 permite uso comercial, pero el modelo está diseñado para operar dentro de la arquitectura MOSAIC-KG; su uso fuera de ese ecosistema requeriría adaptación.
- No hay información sobre sesgos específicos del modelo; al estar entrenado con un corpus pequeño y gobernado, puede reflejar los sesgos del contenido de Alpina.travel y de sus autores.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cyberandy/Alpino-e4b-v04
- Versión v01: https://huggingface.co/cyberandy/Alpino-e4b-v01
- Perfil del autor en Hugging Face: https://huggingface.co/cyberandy
- Perfil del autor en GitHub: https://github.com/cyberandy
- Sitio de Alpina.travel: https://alpina.travel
- Grafo RDF publicado: https://alpina.travel/lungau/data/graph.rdf
- WordLift (desarrollador de MOSAIC-KG): https://wordlift.io
- Página de Gemma 4 de Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Guía sobre Gemma E4B: https://www.gemma4.wiki/guide/gemma-e4b
