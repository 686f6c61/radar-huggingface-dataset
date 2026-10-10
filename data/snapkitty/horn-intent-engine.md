# Snapkitty/horn-intent-engine

## Resumen

Horn Intent Engine es un motor de resolución de cláusulas de Horn y un sistema declarativo de coincidencia de intenciones escrito íntegramente en GDScript para Godot 4, con una reimplementación equivalente en JavaScript que se ejecuta en el navegador sin paso de compilación. Lo desarrolla SnapKitty Research Lab (autores Ahmad Ali Parr y Jessica Westerhoff, con Bel esprit D'accord Trust como propietario de la investigación) y se distribuye bajo AGPL-3.0-only, con una licencia comercial propietaria alternativa ofrecida por SnapKitty Collective LLC.

No es un modelo de lenguaje ni una red neuronal: no tiene parámetros, pesos, ventana de contexto ni proceso de entrenamiento. Se trata de un motor simbólico que conecta predicados mediante cláusulas de Horn, propaga enlaces mediante unificación y resuelve consultas con encadenamiento hacia atrás en profundidad (depth-first) sujeto a un límite de profundidad. La versión publicada en HuggingFace es un espejo del repositorio de GitHub en el commit `7029aa0`, etiquetado como parte del "SnapKitty October 2026 main drop".

Su relevancia es acotada pero concreta: cubre el nicho de razonamiento lógico embebido en videojuegos y aplicaciones web ligeras, donde añadir un intérprete de Prolog o un motor Datalog completo sería desproporcionado. Los propios autores advierten de que la implementación actual no es completa para todos los programas recursivos de Horn y que requeriría tabling o resolución SLG para una recursión robusta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Motor simbólico de cláusulas de Horn: unificación, freshening y encadenamiento hacia atrás (depth-first) con límite de profundidad; no es una red neuronal |
| Parametros totales | No aplica (no es un modelo neuronal); no disponible en la documentación |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (no existe ventana de contexto; la memoria la determinan los hechos y reglas cargados) |
| Tipos de cuantizacion | No aplica (no hay pesos que cuantizar) |
| Idiomas soportados | No disponible (el motor opera sobre predicados declarados por el usuario; no se documenta ningún conjunto de idiomas) |
| Licencia | AGPL-3.0-only, con licencia comercial propietaria opcional de SnapKitty Collective LLC |
| Formato de pesos | No aplica; el artefacto distribuido es código fuente GDScript (Godot 4) y JavaScript, no safetensors ni GGUF |

Otros datos de distribución: 0 descargas y 0 likes en HuggingFace en el momento de la consulta, fecha de creación 2026-10-10 y última actualización 2026-10-10. El pipeline de HuggingFace figura como no disponible.

## Arquitectura y entrenamiento

El diseño se articula en cuatro módulos GDScript dentro del directorio `nlp/`: `horn_engine.gd` (hechos, reglas, `unify`, `freshen`, `solve`/`query`), `intent_engine.gd` (registro por expresiones regulares y despacho dinámico), `intent_registry.gd` (definiciones declarativas de intenciones) y `action_handlers.gd` (implementaciones de las acciones). El principio declarado por los autores es que el lenguaje se mapea a predicados, las cláusulas de Horn conectan esos predicados, la unificación propaga los enlaces y los hechos indexados (marcados como trabajo futuro) aportan la evidencia. La resolución emplea encadenamiento hacia atrás en profundidad con un límite explícito; la documentación reconoce que esto no es completo para todos los programas recursivos de Horn y que harían falta tabling o resolución SLG.

No existe entrenamiento, ajuste fino, RLHF ni DPO, porque no hay componente estadístico. Tampoco hay decodificación especulativa, atención lineal ni ninguna técnica de inferencia neuronal. La única innovación reseñable es la doble implementación: una nativa en Godot 4.3+ y otra autocontenida en JavaScript dentro de `web/index.html`, que reproduce la misma lógica de unificación y encadenamiento hacia atrás para permitir añadir hechos y reglas, lanzar consultas como `in_warehouse ?X`, inspeccionar sustituciones y probar la coincidencia de intenciones contra patrones registrados, todo sin instalar nada. No se documentan cifras de tokens, composición de dataset ni proceso de evaluación.

## Capacidades

- Resolución de cláusulas de Horn: admite hechos y reglas, aplica unificación y freshening, y devuelve las sustituciones resultantes de una consulta.
- Encadenamiento hacia atrás con límite de profundidad, apto para programas recursivos simples pero no completo en recursión general.
- Consultas interactivas con variables (por ejemplo, `in_warehouse ?X`) desde la demo web y desde la escena principal del proyecto Godot.
- Motor de intenciones declarativo: registro de patrones por expresiones regulares y despacho dinámico por intención.
- Manejadores de acción extensibles mediante `action_handlers.gd`, lo que permite conectar cada intención reconocida con una acción concreta.
- Demo web autocontenida sin paso de compilación y sin dependencias externas de backend.
- Integración con Godot 4.3 o superior, ejecutable desde el editor o en una exportación del proyecto.
- Capacidades que NO tiene: no genera texto, no razona de forma estadística, no hace tool calling ni function calling en el sentido de los modelos generativos, no soporta visión, audio ni multimodalidad, y no dispone de modo "thinking". Las capacidades multilingües no están documentadas.

## Casos de uso

- Diálogo basado en reglas en videojuegos hechos con Godot: los NPC pueden mapear lenguaje a predicados, resolver consultas lógicas sobre el estado del mundo y despachar respuestas mediante el registro de intenciones, sin depender de un modelo generativo ni de servicios externos.
- Sistema experto ligero embebido: reglas de negocio expresadas como cláusulas de Horn permiten derivar conclusiones a partir de hechos y consultar qué se cumple, con reglas versionadas en el propio repositorio del juego o la aplicación.
- Enseñanza de programación lógica y unificación: la demo web permite al alumnado escribir hechos y reglas, lanzar consultas y ver las sustituciones paso a paso en el navegador, sin instalar un intérprete de Prolog.
- Gestión de estado de inventario y disponibilidad: consultas del estilo `in_warehouse ?X` sirven de base para comprobar existencias, prerrequisitos de misiones o recetas de crafteo dentro de un juego.
- Autoria y validación de contenido en el editor de Godot: al ser GDScript integrado en el proyecto, las reglas pueden validarse y depurarse durante el diseño, con la salida visible en el panel Output.
- Prototipado rápido de asistentes de intención en web: la reimplementación en JavaScript permite validar patrones de intención y reglas lógicas en una página estática antes de decidir la arquitectura definitiva.
- Capa de enrutado determinista previa a un LLM: dado su carácter simbólico y explicable, puede resolver intenciones cerradas con sustituciones auditables y delegar en un modelo generativo solo los casos no cubiertos por ninguna regla.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de ningún tipo y no procede comparar este componente con evaluaciones de modelos de lenguaje como MMLU, HumanEval o GSM8K, porque no realiza tareas de generación ni de razonamiento estadístico. Tampoco se documentan cifras de latencia, throughput ni consumo de memoria del resolutor.

## Requisitos de hardware

- GPU: no se requiere ninguna. El motor es puramente simbólico y se ejecuta en CPU; no hay inferencia neuronal que acelerar.
- Entorno de ejecución nativo: Godot 4.3 o superior, sobre el proyecto abierto en el editor o exportado. El consumo lo determina el intérprete de GDScript y el volumen de hechos y reglas cargados.
- Entorno web: cualquier navegador moderno capaz de ejecutar `web/index.html` directamente desde el sistema de archivos, sin servidor, sin build y sin dependencias.
- Memoria: proporcional al número de hechos y reglas en memoria. No se publican cifras concretas, por lo que el valor es no disponible.
- Opciones de despliegue: editor de Godot, exportación de proyecto Godot y página web estática. No aplican vLLM, llama.cpp, Ollama ni TGI, ya que no existen pesos que servir.
- Latencia y throughput: no disponibles. El coste por consulta escala con la profundidad de búsqueda permitida y con el número de hechos, no con un tamaño de modelo.

## Comparativa con modelos similares

La categoría correcta no es la de modelos de lenguaje, sino la de motores de programación lógica. Los datos de licencia y versiones de las alternativas no se han verificado en la información proporcionada y se marcan como tales.

| Sistema | Tipo | Implementación | Recursión y completitud | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Horn Intent Engine | Cláusulas de Horn + registro de intenciones | GDScript (Godot 4) y JavaScript | Encadenamiento hacia atrás en profundidad con límite; no completo para recursión general | AGPL-3.0-only con licencia comercial alternativa | HuggingFace y GitHub, 0 descargas |
| SWI-Prolog | Prolog completo | C | Resolución SLD, con tabling disponible | No verificada en la información disponible | Distribución consolidada |
| Soufflé | Datalog | C++ | Evaluación semi-naive, completa para Datalog | No verificada en la información disponible | Proyecto open source consolidado |
| miniKanren | Programación lógica relacional embebida | Scheme y otras | Búsqueda intercalada, completa | No verificada en la información disponible | Múltiples implementaciones |

La diferencia práctica frente a estas alternativas es de integración, no de potencia expresiva: Horn Intent Engine se ejecuta dentro de Godot o del navegador sin dependencias nativas, mientras que Prolog y Datalog ofrecen semánticas más completas y maduras a cambio de añadir un runtime externo. Para comparativas de parámetros, contexto o rendimiento, el valor es no disponible porque no existen tales magnitudes en este componente.

## Limitaciones y advertencias

- Completitud: la implementación es encadenamiento hacia atrás en profundidad con límite, y los propios autores indican que no es completa para todos los programas recursivos de Horn. Harían falta tabling o resolución SLG para una recursión robusta.
- Hechos indexados: se describen como trabajo futuro, por lo que el rendimiento con bases de hechos grandes puede degradarse.
- Sin evaluación: no hay benchmarks, ni pruebas de latencia, ni métricas publicadas. Cualquier uso en producción requiere medir por cuenta propia.
- Madurez y adopción: 0 descargas y 0 likes en HuggingFace, repositorio espejo de un único commit (`7029aa0`) y fecha de creación 2026-10-10, posterior a la fecha habitual de consulta. No hay evidencia de uso en producción ni de mantenimiento continuado.
- Ausencia de datos de idioma: no se documenta ningún soporte multilingüe y el reconocimiento de intenciones depende de expresiones regulares definidas por el usuario, por lo que la cobertura lingüística es responsabilidad de quien integra el motor.
- Licencia AGPL-3.0-only: es copyleft fuerte e incluye la obligación de la sección 13 sobre uso en red. Ofrecer el motor como parte de un servicio accesible por red obliga a poner a disposición el código fuente correspondiente. Para uso comercial cerrado hace falta la licencia comercial propietaria de SnapKitty Collective LLC (contacto en `A.parr@belespritdaccord.uk`).
- Riesgo de alucinación: no aplica en el sentido estadístico, pero el motor puede devolver resultados incorrectos si las reglas y los hechos introducidos son erróneos o contradictorios, sin ningún mecanismo de detección de inconsistencia documentado.
- Entorno: el código nativo depende de GDScript y de Godot 4.3 o superior; no se documenta compatibilidad con otras versiones ni con otros motores.
- La búsqueda web realizada no devolvió ninguna fuente técnica relacionada con el proyecto; los únicos resultados obtenidos fueron foros sin relación alguna con el modelo y no se han utilizado como referencia.

## Enlaces

- Model card en HuggingFace: https://huggingface.co/Snapkitty/horn-intent-engine
- Repositorio de origen en GitHub (commit `7029aa0`): https://github.com/SNAPKITTYWEST/horn-intent-engine
- Demo web interactiva: `web/index.html` dentro del repositorio de GitHub (no se proporciona URL directa)
- Contacto para licencia comercial: A.parr@belespritdaccord.uk
- Paper, blog o demo adicionales: no disponibles en la información proporcionada.
