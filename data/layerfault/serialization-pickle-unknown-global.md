# LayerFault/serialization-pickle-unknown-global

## Resumen

Este repositorio no contiene un modelo de inteligencia artificial utilizable, sino un artefacto sintético de prueba de seguridad perteneciente al corpus Layerfault (identificador `LF-CH-SER-0002`). Ha sido diseñado deliberadamente con características adversariales, como opcodes de pickle sospechosos, formatos ejecutables camuflados y cadenas de inyección de prompts, con el objetivo de ejercitar reglas de detección de escáneres de seguridad en modelos.

La relevancia de este artefacto radica en el contexto de la seguridad en el ecosistema de modelos open source: los archivos pickle han sido un vector conocido de ejecución remota de código en plataformas como Hugging Face. Este repositorio sirve como banco de pruebas para validar herramientas de admisión de modelos, como el propio proyecto Layerfault, que combina validación estructural, integridad, procedencia y políticas de ejecución antes de la inferencia. No debe cargarse ni ejecutarse fuera de un entorno aislado de análisis estático.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (artefacto sintético, no es un modelo ML) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (el repo contiene datos serializados de prueba, no pesos de modelo) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento. El repositorio es un fixture de seguridad sintético que contiene datos serializados (posiblemente archivos pickle) con características adversariales diseñadas para activar reglas de detección concretas, como `LF-PICKLE-UNKNOWN-GLOBAL`. El contenido incluye secretos falsos, destinos de red de loopback o `.invalid`, y comportamiento de modelo simulado, todo con fines de prueba estática y análisis aislado. No hay innovación técnica en términos de arquitectura de modelos; la innovación está en el diseño del artefacto para ejercitar escáneres de seguridad.

## Capacidades

- No es un modelo de lenguaje, visión ni multimodal. No tiene capacidades de generación de texto, razonamiento, código, matemáticas ni ninguna otra habilidad de IA.
- Su única función es servir como objetivo de prueba para escáneres de seguridad de modelos. Contiene características adversariales (opcodes de pickle sospechosos, formatos ejecutables, inyecciones de prompt) que deben ser detectadas por herramientas de análisis estático.
- No soporta tool calling, agentes, ni razonamiento multi-paso.
- No tiene capacidades multilingües.
- No tiene modos especiales de pensamiento ni capacidades de visión o audio.

## Casos de uso

- Validación de escáneres de seguridad: usar el repositorio como entrada para herramientas que analizan archivos de modelos (por ejemplo, PickleScan, Layerfault CLI) para comprobar si detectan el pickle con global desconocido. Es un test positivo para la regla `LF-PICKLE-UNKNOWN-GLOBAL`.
- Desarrollo de reglas de detección: los investigadores de seguridad pueden estudiar el artefacto para diseñar nuevas reglas que identifiquen serialización pickle insegura en modelos distribuidos en plataformas como Hugging Face.
- Evaluación de pipelines de admisión de modelos: en un entorno de integración continua, el repositorio sirve para verificar que un sistema de admisión automática de modelos rechaza o emite advertencias (WARN) ante artefactos sospechosos.
- Pruebas de caja negra de cargadores de modelos: comprobar si un cargador (por ejemplo, `torch.load`) es capaz de manejar archivos pickle con opcodes maliciosos sin ejecutarlos, o si los bloquea.
- Investigación académica sobre deserialización segura: el artefacto puede utilizarse como caso de estudio en trabajos sobre deserialización segura de modelos basados en pickle, como el paper de PickleBall.
- Entrenamiento de herramientas de análisis estático: usar el artefacto para medir la tasa de falsos positivos y negativos de detectores de malware en modelos de IA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no es un modelo y no tiene métricas de rendimiento de IA (MMLU, HumanEval, GSM8K, etc.). Su rendimiento se mediría en términos de detección por escáneres, pero no hay datos cuantitativos en la model card.

## Requisitos de hardware

- No requiere hardware de inferencia (GPU, VRAM) porque no es un modelo ejecutable.
- Para análisis estático, basta con un CPU estándar y un entorno de Python aislado (por ejemplo, un contenedor Docker o una máquina virtual).
- No se recomienda ejecutarlo en ningún entorno de producción ni en máquinas con acceso a datos sensibles.
- No se aplican opciones de despliegue como vLLM, llama.cpp, Ollama o TGI.

## Comparativa con modelos similares

No disponible. Este artefacto no tiene equivalentes en el espacio de modelos de IA comparables por parámetros o tareas. Su categoría es la de artefactos de seguridad sintéticos, y no hay datos de modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- El repositorio contiene características adversariales deliberadas (pickle opcodes sospechosos, formatos ejecutables, cadenas de inyección de prompts). Ejecutarlo fuera de un entorno aislado puede provocar ejecución de código arbitrario en el sistema.
- No es un modelo de IA: no produce salidas útiles para ninguna tarea de NLP, visión ni otra modalidad.
- La licencia Apache-2.0 cubre el artefacto, pero no otorga derechos de uso como modelo; su único propósito es prueba de seguridad.
- No hay garantías de que el artefacto esté libre de malware real; se recomienda tratar todos sus archivos como potencialmente peligrosos.
- No tiene soporte ni mantenimiento. No se actualizará ni se corregirán problemas.
- No se debe usar en producción ni en ningún sistema conectado a internet sin una capa de sandboxing estricta.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/LayerFault/serialization-pickle-unknown-global
- Proyecto Layerfault (CLI de admisión de modelos): https://github.com/izm1chael/layerfault
- Paper sobre deserialización segura de modelos pickle (PickleBall): https://arxiv.org/html/2508.15987v1
- Artículo sobre malware en archivos pickle de Hugging Face: https://cybersecurityinfocus.com/?p=1831
- Incidente de modelos maliciosos que evaden PickleScan: https://threats.wiz.io/all-incidents/malicious-ai-models-bypass-picklescan-detection
- Vulnerabilidades de deserialización en motores de inferencia: https://dailysecurityreview.com/cyber-security/application-security/critical-remote-code-execution-flaws-found-in-ai-inference-engines-due-to-unsafe-deserialization/
