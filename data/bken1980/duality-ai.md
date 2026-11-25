# bken1980/Duality-AI

## Resumen

Duality-AI es un repositorio publicado en Hugging Face por el usuario bken1980 que, segun su propia model card, no contiene un modelo de lenguaje entrenado, sino una **arquitectura teorica** y un prototipo de investigacion. El diseno propone un sistema de IA gobernada estructurado en tres capas: una capa cognitiva (razonamiento con dos "hemisferios", uno logico y otro creativo, ponderados por un hub central y filtrados por una compuerta moral), una capa de seguridad (el "Barrier", con bots guardianes que inspeccionan entradas y salidas y desvian ataques a un sandbox) y una capa de memoria (la "Memory Cloud", con registros episodicos y semanticos, consolidacion tipo sueno y olvido con semivida de 30 dias). El autor es Kenneth Lee Blum Jr y la obra se publica bajo licencia MIT.

El problema que aborda es el de como estructurar un sistema de IA con gobierno explicito, seguridad perimetral y memoria a largo plazo bajo reglas auditables. Es relevante como documento de diseno y como propuesta conceptual, no como artefacto ejecutable: el propio autor declara que no es un producto desplegado ni un sistema funcional, y que no reclama consciencia ni comprension moral por parte de la maquina.

El repositorio tiene 0 descargas, 0 likes y un tamano de 0.0 GB, lo que confirma que no incluye pesos de modelo. No se dispone de informacion sobre arquitectura de red neuronal, numero de parametros, contexto ni datos de entrenamiento, porque el contenido publicado es documentacion de diseno (tesis, guias visuales, trazas de ejemplo) y no un checkpoint.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (propuesta teorica de tres capas: Core cognitivo, Barrier de seguridad y Memory Cloud; no se especifica arquitectura de red neuronal) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (segun el campo `language: en` de la model card) |
| Licencia | MIT |
| Formato de pesos | No disponible (el repositorio no contiene pesos; tamano 0.0 GB) |

## Arquitectura y entrenamiento

La propuesta organiza el sistema en tres capas que se gobiernan mutuamente. La capa uno ("The Core") plantea un modelo de lenguaje base coronado por dos hemisferios de razonamiento, uno logico y otro creativo, cuyo trabajo un hub central pondera en un unico paso propuesto; ese paso se contrasta antes de ejecutarse contra una biblioteca predefinida de clausulas morales, con un mecanismo de "leniencia dentro de la razon". La capa dos ("The Barrier") define un perimetro de bots guardianes inspirados en la barrera hematoencefalica, con una ley de dimensionamiento (amenaza mas 20-30 %, redondeada de forma conservadora y bajo un techo), doctrina de sandbox, handshakes basados en la geometria del "hat tile" aperiodico y capacidad latente bajo autoridad del operador. La capa tres ("The Memory Cloud") describe memoria episodica y semantica, consolidacion analogada al sueno, procedencia sellada en una cadena de hashes y olvido con semivida de 30 dias (`strength(t) = strength_0 * 0.5^(t/30 days)`), con umbral de poda en 0.05 y exencion absoluta para las memorias "constitucionales".

No hay informacion sobre datos de entrenamiento, numero de tokens, composicion del dataset ni tecnicas de alineamiento como RLHF o DPO, porque el repositorio no documenta el entrenamiento de un modelo concreto. Las innovaciones descritas son de diseno de sistema (compuerta moral con auditoria de leniencia, handshakes criptograficos inspirados en geometria, politica de olvido con exencion constitucional), no de arquitectura de red ni de optimizacion de inferencia. El autor remite a `docs/related-work.md` para la atribucion de trabajo previo (Constitutional AI, seguridad inspirada en el sistema inmune, geometria del hat tile) y situa la novedad en la combinacion de las tres capas.

## Capacidades

- No se documentan capacidades funcionales verificadas de generacion de texto, razonamiento, codigo, matematicas o vision, porque no hay un modelo entrenado asociado al repositorio.
- El diseno contempla, a nivel teorico, razonamiento en dos hemisferios con ponderacion central y juicio previo a la accion.
- El diseno contempla soporte de agentes mediante la capa Barrier, que inspecciona entradas y salidas y desvia ataques a un sandbox.
- El diseno contempla memoria a largo plazo episodica y semantica con consolidacion y olvido gobernado por politica.
- El diseno contempla auditoria de decisiones: registro de cada vez que se aplica leniencia y trazabilidad de procedencia mediante cadena de hashes.
- No se documenta soporte de tool calling ni function calling.
- No se documenta capacidad multilingue mas alla del ingles declarado.
- No se documenta modo "thinking", vision ni audio.

## Casos de uso

- Estudio de arquitecturas de IA gobernada: el repositorio sirve como material de referencia para investigadores que disenan sistemas con compuertas morales explicitas y quieren comparar mecanismos de precedencia entre clausulas en conflicto (`docs/clause-conflict-design.md`).
- Docencia sobre seguridad de IA: las tesis de la capa Barrier y la doctrina de sandbox pueden usarse como caso practico en cursos de seguridad de sistemas, con la salvedad de que son diseno y no implementacion.
- Prototipado de politicas de memoria: la ecuacion de olvido con semivida de 30 dias y umbral de poda 0.05 es directamente reutilizable como especificacion para disenar politicas de retencion en sistemas de memoria de agentes.
- Auditoria y cumplimiento: el concepto de "leniency audit trail" puede inspirar registros de excepciones a politicas en productos que necesiten demostrar cuando y por que se flexibilito una regla.
- Investigacion sobre procedencia de datos: la cadena de hashes por registro de memoria es un patron aplicable a sistemas que requieran trazabilidad de origen de la informacion.
- Evaluacion critica de propuestas teoricas: el "failure museum" (`KNOWN-LIMITATIONS.md`) permite usar el repositorio como ejercicio de revision por pares sobre que partes de una arquitectura estan construidas y cuales solo esbozadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no contiene un modelo entrenado ni evaluaciones cuantitativas de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no hay pesos de modelo en el repositorio).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no aplica al no existir checkpoint.
- Opciones de despliegue: no disponible; el repositorio es documentacion y codigo de prototipo, no un artefacto servible con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. Duality-AI no es un modelo de lenguaje comparable por parametros, contexto o rendimiento, sino una propuesta de arquitectura de sistema. Las referencias conceptuales que el propio autor cita (Constitutional AI, seguridad inspirada en el sistema inmune, geometria del hat tile) son trabajo previo que el diseno adopta con atribucion, no alternativas equivalentes.

## Limitaciones y advertencias

- El autor declara explicitamente que se trata de una arquitectura teorica y un prototipo de investigacion, no de un producto desplegado ni de un sistema funcional.
- No hay pesos, no hay modelo entrenado y el repositorio ocupa 0.0 GB; no puede ejecutarse como modelo de lenguaje.
- No se reclama consciencia ni comprension moral por parte de la maquina; las metaforas biologicas son organizativas, no evidencia.
- Las debilidades conocidas se publican en `KNOWN-LIMITATIONS.md`, descrito como "museo de fallos"; conviene leerlo antes de extraer conclusiones.
- El idioma declarado es unicamente ingles.
- La licencia MIT permite uso comercial y modificacion, pero al no existir artefacto ejecutable el uso comercial se limita al codigo y la documentacion del prototipo.
- Riesgo de alucinacion y sesgos: no evaluables al no existir modelo desplegado; cualquier uso de las ideas en produccion requeriria validacion empirica propia.
- El diseno incluye mecanismos no resueltos, como el handshake basado en el hat tile, que el autor plantea como problema abierto en `docs/handshake-open-problem.md`.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/bken1980/Duality-AI
- Tesis de la capa uno: `THESIS.md` (en el repositorio)
- Tesis de la capa dos: `THESIS-LAYER-2.md` (en el repositorio)
- Tesis de la capa tres: `THESIS-LAYER-3.md` (en el repositorio)
- Tesis completa: `THESIS-COMPLETE.md` (en el repositorio)
- Guia visual: `docs/visual-guide.md` (en el repositorio)
- Trabajo relacionado: `docs/related-work.md` (en el repositorio)
- Diseno de la barrera: `docs/barrier-design.md` (en el repositorio)
- Diseno de la capa tres: `docs/layer3-design.md` (en el repositorio)
- Dictado original del autor: `docs/original-dictation.md` (en el repositorio)
- Traza de ejemplo: `docs/worked-trace.md` (en el repositorio)
- Auditoria de leniencia: `docs/leniency-audit-trail.md` (en el repositorio)
- Diseno de conflicto entre clausulas: `docs/clause-conflict-design.md` (en el repositorio)
- Problema abierto del handshake: `docs/handshake-open-problem.md` (en el repositorio)
- Limitaciones conocidas: `KNOWN-LIMITATIONS.md` (en el repositorio)
- Aviso legal: `DISCLAIMER.md` (en el repositorio)
- Licencia: `LICENSE` (en el repositorio)
