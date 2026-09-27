# kreatadi/KOG-5.5-Terret

## Resumen

KOG-5.5 Terret es un artefacto de inteligencia publicado por Kreata bajo la denominación de «Kognit» y encuadrado en su arquitectura propietaria de Data Intelligence (DI), de enfoque retrieval-first y orientado a la verificación. No se distribuye como un checkpoint Transformer convencional: el artefacto canónico es un fichero `.kog` de 59.786.122 bytes (aproximadamente 57,016 MiB) que requiere un runtime o implementación anfitriona compatible y que, según el propio autor, no está pensado para cargarse mediante `transformers.from_pretrained()`.

El modelo declara combinar razonamiento estructurado, conocimiento verificado, redes compactas adaptativas (KNetworks), paquetes de conocimiento modulares (KPack), habilidades aprendidas reutilizables (KSkill), herramientas controladas, un componente de evidencia web (K Browser) y un reloj mundial (World Clock) con soporte de zonas horarias IANA. Su propuesta diferencial es el aprendizaje local verificado con posibilidad de reversión (rollback) del estado aprendido, manteniendo separado el núcleo público congelado del estado privado del usuario.

Es relevante ahora porque representa una vía alternativa al escalado de LLM generativos: en lugar de depender exclusivamente de un modelo neuronal grande, apuesta por recuperación de conocimiento, verificación explícita y devolución de estados de «desconocido» o escalado cuando la petición no puede verificarse. La información pública disponible es muy limitada: ficha de HuggingFace con 0 descargas y 1 like, licencia Kreata License 1.0, idioma declarado inglés y sin resultados de benchmarks publicados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No es un Transformer convencional; arquitectura propietaria «Data Intelligence» (DI) de Kreata basada en artefacto `.kog` con razonamiento estructurado, KNetworks, KPack, KSkill, K Browser, World Clock y herramientas controladas |
| Parametros totales | No disponible (el autor no publica recuento de parametros y no se trata de un checkpoint neuronal convencional) |
| Parametros activos | No aplica (no se declara arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (no se documentan formatos de cuantizacion; el artefacto es un fichero `.kog` binario) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Other; Kreata License 1.0 |
| Formato de pesos | `.kog` (artefacto canonico `KOG-5.5-Terret.kog`); formatos auxiliares de estado: `.kskill`, `.knet`, `.kpack`, `.ktool`, `.kdelta` |
| Tamano del artefacto | 59.786.122 bytes (aprox. 57,016 MiB) |
| SHA-256 | `7fb5be00aafdd9241ffe4548288d32e20484b5a1540daae4360c9de220a48c59` |
| Nucleo fundacional congelado | KOG-50.1 Engineering Final RC2 |
| Runtime requerido | Runtime o host Kognit compatible (no cargable con `transformers.from_pretrained()`) |
| Publicador | Kreata |
| Fecha de publicacion en HuggingFace | 2026-09-27 (creacion), 2026-09-27 (ultima actualizacion) |
| Descargas / likes | 0 descargas / 1 like |

## Arquitectura y entrenamiento

No se proporciona información sobre datos de entrenamiento, número de tokens, composición del dataset ni uso de RLHF o DPO. El autor indica explícitamente que Terret no se distribuye como un checkpoint Transformer o LLM convencional. La arquitectura descrita se organiza en tres fases operativas: comprensión semántica de la petición (intención, entidades, cantidades, relaciones, restricciones, requisitos de frescura, objetivo, acciones posibles e incertidumbre), selección de sistemas de razonamiento (razonamiento determinista, habilidades aprendidas, conocimiento KPack, matemáticas, ejecución de código, World Clock, K Browser, herramientas y planificación de acciones) y verificación del resultado candidato contra la petición real del usuario.

Los componentes técnicos declarados son: KNetworks, descritas como sistemas compactos de aprendizaje adaptativo y estadístico —no presentados como redes neuronales convencionales— que asisten en enrutado de tareas, confianza, ranking, selección de expertos, memoria de prototipos, replay, protección contra deriva y fiabilidad de estrategias; KPack, formato modular de conocimiento con procedencia, metadatos de integridad, compresión, carga diferida, enrutado por dominio, clases de privacidad y trazabilidad de fuentes; y KSkill, orientado a procedimientos aprendidos que pasan por un ciclo de experiencia, habilidad candidata, sandbox, verificación, pruebas de replay, pruebas de deriva y promoción o rechazo.

## Capacidades

- Generación de texto y escritura en inglés.
- Matemáticas, lógica y razonamiento estructurado.
- Razonamiento sobre datos (data reasoning) y conocimiento general.
- Código y ejecución de código dentro del conjunto de sistemas de razonamiento disponibles.
- Áreas de conocimiento declaradas: ciencias, estudios sociales, inglés y conocimiento general.
- Recuperación de conocimiento mediante KPack, con soporte de conocimiento embebido y externo, procedencia, integridad, compresión, carga diferida y enrutado por dominio.
- K Browser: obtención de información actual y evidencia web, con flujo de detección de frescura, recuperación de evidencia, preservación de la fuente, verificación y razonamiento posterior. Requiere capacidades de red provistas por el runtime anfitrión.
- World Clock: hora actual, fecha local, año, desplazamiento UTC, hora de ciudad y país, soporte de zonas horarias IANA, gestión de horario de verano y cambio de fecha entre zonas horarias. Las ubicaciones desconocidas o ambiguas pueden escalarse en lugar de adivinarse.
- Herramientas controladas y acciones: flujo de objetivo, plan, comprobación de permisos, confirmación si es necesaria, ejecución, inspección del resultado, reintento o reparación, verificación y rollback. Las definiciones de herramientas no conceden por sí mismas permisos de sistema operativo, cuenta, red o sistema de ficheros.
- Aprendizaje local verificado y adaptación mediante KNetworks, con reversión del estado aprendido.
- Arquitectura de mejora colectiva con preservación de privacidad (según descripción del autor).
- No se documenta soporte explícito de visión, audio ni modo «thinking»; la disponibilidad de varias capacidades depende del runtime anfitrión.

## Casos de uso

- Asistencia sobre datos con verificación previa: el modelo puede analizar la petición, seleccionar el subsistema de razonamiento adecuado y verificar el resultado candidato antes de responder, devolviendo un estado de desconocido o de escalado cuando no puede verificar. Adecuado en entornos donde una respuesta no verificada es más costosa que una abstención.
- Consultas sensibles a la actualidad: mediante K Browser y el flujo de detección de frescura, se puede recuperar evidencia web, conservar la trazabilidad de la fuente y usarla como conocimiento temporal de sesión para preguntas sobre información cambiante.
- Planificación y coordinación horaria internacional: con World Clock y soporte IANA, resulta utilizable para calcular fechas y horas entre zonas, gestionar horario de verano y resolver cambios de día entre regiones.
- Automatización de acciones con control de permisos: el flujo de objetivo, plan, comprobación de permisos, confirmación, ejecución, verificación y rollback encaja en pipelines donde una acción debe auditarse y poder deshacerse.
- Aprendizaje de procedimientos en local: con KSkill, una organización puede capturar un procedimiento verificado, probarlo en sandbox con replay y pruebas de deriva, y promocionarlo sin modificar el núcleo público `.kog`.
- Despliegue con separación de estado privado: el uso de `.kskill`, `.knet`, `.kpack`, `.ktool` y `.kdelta` permite mantener el estado del usuario o de la organización fuera del artefacto canónico, útil en escenarios con requisitos de privacidad.
- Base de conocimiento sectorial ampliable: mediante KPack con procedencia, integridad y clases de privacidad, se puede hacer crecer el conocimiento de dominio de forma independiente al núcleo de inteligencia.
- Soporte educativo en matemáticas, ciencias y estudios sociales: el enfoque de razonamiento determinista y verificación encaja en la resolución de problemas con pasos comprobables, siempre que el runtime anfitrión exponga dichos subsistemas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La ficha de HuggingFace no incluye métricas de MMLU, HumanEval, GSM8K ni de ningún otro conjunto de evaluación, y tampoco se publican datos de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al no tratarse de un checkpoint Transformer convencional, no se aplican las estimaciones habituales por número de parámetros y cuantización.
- GPU recomendadas: no disponible. El autor no especifica requisitos de GPU.
- Compatibilidad con GPU de consumo: no disponible. El único dato objetivo es el tamaño del artefacto, de aproximadamente 57 MiB, por lo que el almacenamiento necesario es mínimo; el coste de cómputo depende por completo del runtime Kognit anfitrión.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, y el autor indica que el modelo no está pensado para cargarse con `transformers.from_pretrained()`. El despliegue requiere un runtime o implementación anfitriona compatible con Kognit.
- Red: K Browser requiere capacidades de red proporcionadas por el host; el fichero `.kog` no es un navegador web sin restricciones ni dispone automáticamente de acceso a red, sistema operativo, cuentas o sistema de ficheros.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables. KOG-5.5 Terret no se presenta como un LLM o Transformer al uso, por lo que una comparación directa con checkpoints de pesos abiertos no es metodológicamente válida con los datos publicados. Únicamente se pueden tabular los datos conocidos de este artefacto:

| Modelo | Categoria | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| KOG-5.5 Terret | Kognit / Data Intelligence propietaria | No disponible | No disponible | Kreata License 1.0 | HuggingFace, requiere runtime Kognit compatible |
| Alternativa 1 | No disponible | No disponible | No disponible | No disponible | No disponible |
| Alternativa 2 | No disponible | No disponible | No disponible | No disponible | No disponible |
| Alternativa 3 | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- No es un LLM ni un Transformer convencional: no puede cargarse con `transformers.from_pretrained()` ni, presumiblemente, con las herramientas estándar del ecosistema (vLLM, llama.cpp, Ollama, TGI), que no aparecen documentadas.
- Dependencia total del runtime: buena parte de las capacidades declaradas (K Browser, herramientas, ejecución de código, aprendizaje local) dependen del host y no del fichero `.kog` en sí.
- Cobertura de idiomas limitada: solo se declara inglés (`en`), lo que restringe su uso en castellano u otras lenguas.
- Sin benchmarks publicados: no hay evidencia cuantitativa de rendimiento en matemáticas, código, razonamiento o conocimiento general, por lo que la evaluación previa a producción exige pruebas propias.
- Riesgo de alucinación: el autor afirma que las peticiones no soportadas o insuficientemente verificadas pueden devolver un estado de desconocido o escalado en lugar de forzar una respuesta, pero no se publican tasas de error ni estudios de fiabilidad que lo respalden.
- Sesgos conocidos: no disponible. No se documenta ninguna evaluación de sesgos, toxicidad o seguridad.
- Licencia: Kreata License 1.0, marcada como «other» en HuggingFace. No se detallan en la información disponible los términos concretos de uso comercial, redistribución o modificación, por lo que es imprescindible revisar el texto completo de la licencia antes de cualquier uso en producción.
- Madurez y adopción: el repositorio registra 0 descargas y 1 like en el momento de la consulta, y el artefacto está fechado en 2026, sin ecosistema, documentación externa ni comunidad verificable.
- Integridad del artefacto: el autor advierte de que un hash SHA-256 distinto al publicado indica que el fichero no debe tratarse como la release canónica; conviene verificar el hash tras la descarga.
- Trazabilidad de la información: la model card describe conceptos y flujos propietarios (Kognit, DI, KNetworks, KPack, KSkill), pero no publica detalles reproducibles de implementación, datos de entrenamiento ni métricas.

## Enlaces

- HuggingFace: https://huggingface.co/kreatadi/KOG-5.5-Terret
- Model card y especificación de la release canónica (nombre de fichero, tamano y SHA-256): incluida en la propia ficha de HuggingFace.
- Paper, repositorio de código, demo o blog oficial del modelo: no disponible en la información proporcionada.
- Los resultados de búsqueda web obtenidos (meta.ai, openai.com/open-models, gemini.google.com y kog.ai) no contienen información sobre KOG-5.5 Terret ni sobre Kreata; kog.ai corresponde a un proyecto de inferencia de LLM sin relación con este modelo y no deben considerarse fuentes del mismo.
