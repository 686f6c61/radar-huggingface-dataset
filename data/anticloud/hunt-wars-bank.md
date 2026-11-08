# Anticloud/hunt-wars-bank

## Resumen

Anticloud/hunt-wars-bank es un artefacto publicado en Hugging Face por el usuario Anticloud, etiquetado con los identificadores `anticloud`, `vertical:hunt-wars` y `harness:swe-agent`. Por los metadatos disponibles, no se trata de un modelo de lenguaje con pesos publicados de forma convencional, sino de un repositorio asociado a un entorno de agentes de software (harness `swe-agent`) dentro de una vertical denominada `hunt-wars`. No hay informacion sobre arquitectura, parametros ni datos de entrenamiento en la ficha del repositorio.

El repositorio tiene 0 descargas y 0 likes, fue creado el 8 de noviembre de 2026 y su acceso esta restringido (gated): requiere aceptar condiciones en Hugging Face antes de poder descargar su contenido. La licencia declarada es `anticommons-0.1.0`, una licencia de tipo anticommons que restringe severamente los usos permitidos y no equivale a una licencia de codigo abierto aprobada por la OSI.

La relevancia de esta ficha es principalmente documental y de advertencia: los resultados de busqueda asociados mencionan campanas de agentes de IA usados para automatizar ciberataques (incluyendo credential stuffing contra entidades financieras surcoreanas y una campana de actores chino-parlantes contra objetivos gubernamentales, educativos e industriales). No se ha podido verificar ningun vinculo tecnico directo entre este repositorio concreto y dichas campanas, por lo que cualquier asociacion debe tratarse como no confirmada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | anticommons-0.1.0 |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del artefacto. Los tags `vertical:hunt-wars` y `harness:swe-agent` sugieren que el repositorio contiene configuraciones, artefactos o datos asociados a un agente de resolucion de tareas de ingenieria de software (el harness SWE-agent), pero no se especifica si incluye pesos de un modelo base, adaptadores, datasets de evaluacion o ficheros de configuracion del entorno.

Tampoco hay datos sobre volumen de entrenamiento, composicion del dataset, tecnicas de alineacion (RLHF, DPO) ni innovaciones tecnicas. Cualquier afirmacion al respecto seria especulativa y no se incluye.

## Capacidades

- No se han documentado capacidades funcionales del artefacto en la informacion disponible.
- El tag `harness:swe-agent` apunta a un uso previsto en entornos de agentes para tareas de ingenieria de software, pero no se detalla el alcance real.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad verificada.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Auditoria de artefactos publicados en Hugging Face: revision de metadatos, licencia y condiciones de acceso de repositorios gated antes de cualquier uso interno, dado que este repositorio no documenta su contenido.
- Investigacion sobre licencias anticommons: analisis de como la licencia `anticommons-0.1.0` restringe la redistribucion y el uso comercial en comparacion con licencias permisivas.
- Monitorizacion de seguridad de la cadena de suministro de modelos: inventariado de repositorios con acceso restringido y sin documentacion tecnica, que requieren revision manual antes de incorporarse a pipelines.
- Estudio de entornos de agentes SWE: analisis de la convencion de tags `harness:swe-agent` como posible estandar de publicacion de configuraciones de agentes.
- Formacion en gobernanza de IA: caso practico sobre por que un repositorio sin especificaciones tecnicas ni benchmarks no debe evaluarse como modelo desplegable.
- Respuesta a incidentes: verificacion de si un artefacto concreto esta implicado en campanas de abuso reportadas en prensa, sin asumir vinculos no demostrados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, al no conocerse parametros ni formato de pesos.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables de la misma categoria a partir de la informacion proporcionada, ya que no se especifica que tipo de artefacto es ni su tamano.

## Limitaciones y advertencias

- Ausencia total de especificaciones tecnicas: sin arquitectura, parametros, contexto ni benchmarks, el artefacto no es evaluable como modelo desplegable.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face; el contenido no es publico sin ese paso.
- Licencia `anticommons-0.1.0`: no es una licencia de codigo abierto; puede prohibir usos comerciales, redistribucion o creacion de obras derivadas. Revisar el texto completo antes de cualquier uso.
- Riesgo reputacional y de seguridad: los resultados de busqueda mencionan campanas de agentes de IA usados en ciberataques, pero no se ha verificado ningun vinculo con este repositorio. No debe atribuirse responsabilidad sin evidencia tecnica.
- Cero descargas y cero likes: sin senales de adopcion ni validacion por la comunidad.
- Fechas de creacion y actualizacion (noviembre de 2026) sin historial de versiones documentado.
- Sin idiomas declarados: imposible evaluar cobertura linguistica.
- Para produccion, se recomienda tratar este repositorio como no apto hasta que el autor publique documentacion tecnica verificable.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Anticloud/hunt-wars-bank
- Tech Times, "Open-Source AI Agent Hacked Seven South Korean Banks, Exposing 65,000 Records": https://www.techtimes.com/articles/328541/20261005/open-source-ai-agent-hacked-seven-south-korean-banks-exposing-65000-records.htm
- Security Affairs, "Chinese Hackers Use AI Agents in Multi-Country Cyber Campaign": https://securityaffairs.com/198417/ai/chinese-hackers-use-ai-agents-in-multi-country-cyber-campaign.html
