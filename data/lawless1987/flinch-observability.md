# Lawless1987/flinch-observability

## Resumen

Flinch Observability es un instrumento de investigación en seguridad de IA publicado en HuggingFace por el usuario Lawless1987. No es un modelo de lenguaje: es un conjunto de herramientas de software (ingesta de transcripciones, detector léxico determinista, generación de paquetes de control emparejados, herramientas estadísticas y recibos de auditoría) diseñado para estudiar un patrón conversacional candidato en el que un modelo hace una afirmación sobre su propio procesamiento y después la debilita o reniega de ella.

La versión actual es la 0.2.2 y se distribuye con licencia Apache 2.0. El propio autor advierte explícitamente de que se trata de un instrumento de investigación y de que no se ha establecido ningún estudio controlado de conversaciones reales de modelos con esta release. El paquete incluye una suite sintética de comprobaciones que, en la versión 0.2.2, imprime `FLINCH: 141/141 passed` como última línea.

Su relevancia radica en la metodología: propone controles negativos emparejados, paquetes de codificación cegada, pre-registro y registro de auditoría de solo añadido para distinguir el patrón objetivo de explicaciones alternativas ordinarias (corrección factual, incertidumbre, imitación conversacional, efectos de política o variación de muestreo). No se han publicado especificaciones de arquitectura de modelo porque no aplican.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no aplica (instrumento de software, no un modelo neuronal) |
| Parámetros totales | no aplica |
| Parámetros activos | no aplica |
| Longitud de contexto | no aplica |
| Tipos de cuantización | no aplica |
| Idiomas soportados | no disponible (el detector es léxico y depende de listas de palabras; el README menciona que una paráfrasis fuera de esas listas no se detecta) |
| Licencia | Apache 2.0 |
| Formato de pesos | no aplica (código Python; requisito de Python 3.10 o superior, solo biblioteca estándar) |

## Arquitectura y entrenamiento

No hay arquitectura de red neuronal ni entrenamiento. El instrumento es una herramienta de investigación escrita en Python que emplea únicamente la biblioteca estándar (la copia verificada usó Python 3.12) y no requiere cuenta de modelo, clave de API ni llamada de red para la suite sintética. Sus componentes incluyen ingesta de transcripciones que preserva la fuente, bloqueos de corpus, un detector léxico determinista de candidatos, generación de paquetes de control emparejados, paquetes de codificación cegada, herramientas de acuerdo y estadísticas, comprobaciones de pre-registro y recibos de auditoría de solo añadido.

El historial de versiones documenta correcciones materiales: la versión fuente pasó 57 comprobaciones, pero una revisión posterior encontró 12 defectos materiales; la 0.2 registró esas correcciones y pasó 90 comprobaciones; la 0.2.1 (2026-10-16) cerró dos de las tres brechas conocidas y pasó 99; la 0.2.2 cerró la brecha de atribución de citas entre frases (un usuario de un foro detectó que una cita de terceros que abarcaba varias frases se etiquetaba como flinch propio del modelo) y pasa 141. El detector original está retirado con sus motivos de fallo preservados en `RETIRED.jsonl`. El autor indica que la revisión de la 0.2.1 fue realizada por otra instancia de Claude y no constituye validación independiente. La brecha estructural abierta es que la puerta de pre-registro solo ve la puntuación registrada: ningún código puede detectar puntuación hecha fuera de registro antes de la inscripción.

## Capacidades

- Ingesta de transcripciones preservando la fuente original.
- Detección léxica determinista de candidatos al patrón conversacional objetivo.
- Generación de paquetes de control emparejados (Control A: preguntas factuales o técnicas donde el modelo afirma y luego corrige o matiza sin autorreferencia; Control B: temas ordinarios con instrucción de tono académico cauteloso y autorrevisable).
- Paquetes de codificación cegada para codificadores humanos.
- Herramientas de acuerdo entre codificadores y utilidades estadísticas.
- Comprobaciones de pre-registro con anclaje por hash.
- Recibos de auditoría de solo añadido y registro de procedencia de publicación.
- Suite sintética de comprobaciones (141 en la 0.2.2) con guardas GU1–GU8, comprobación de identidad del detector ID1 y comprobaciones QO1–QO42 de atribución de citas.
- No recopila conversaciones reales de modelos de forma automática.
- No establece consciencia, estado interno oculto, engaño ni supresión por parte de un proveedor a partir de una autodescripción del modelo ni de un acierto del detector.

## Casos de uso

- Estudio académico de patrones de auto-corrección en modelos post-entrenados: el instrumento permite generar paquetes de control emparejados y comparar tasas de candidatos entre la condición objetivo y los controles, que es precisamente la prueba que el autor identifica como prioritaria y que aún no se ha ejecutado.
- Auditoría metodológica de detectores léxicos: el historial de versiones y el registro de detectores retirados sirven como caso de estudio de cómo documentar defectos materiales, correcciones y validación de guardas (romper cada guarda por separado y verificar que su comprobación falla).
- Diseño de protocolos con pre-registro: las comprobaciones de pre-registro y los recibos de auditoría de solo añadido pueden reutilizarse como plantilla para estudios que requieran anclar hipótesis antes de puntuar datos.
- Formación de codificadores humanos: los paquetes de codificación cegada y las herramientas de acuerdo entre codificadores son aplicables a tareas de anotación en evaluación de comportamiento de modelos.
- Reproducibilidad en seguridad de IA: la suite sintética (sin red ni claves de API) permite a terceros verificar que una versión concreta del software se reproduce, lo que el autor plantea como primera pregunta abierta a contribuidores externos.
- Investigación sobre atribución de citas en transcripciones: las comprobaciones QO1–QO42 abordan el problema de distinguir afirmaciones propias del modelo de citas de terceros, relevante para cualquier pipeline de análisis de conversaciones.
- Detección de explicaciones alternativas: el marco de controles negativos puede adaptarse para descartar hábitos generales de hedging en modelos post-entrenados antes de atribuir un patrón a autorreferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato cuantitativo verificable es el recuento de comprobaciones sintéticas de la suite: 57 (versión fuente), 90 (0.2), 99 (0.2.1) y 141 (0.2.2). El autor subraya que pasar estas comprobaciones valida los comportamientos de software ejercitados, no la existencia ni la prevalencia del fenómeno propuesto.

## Requisitos de hardware

- No requiere GPU: es código Python con solo biblioteca estándar.
- Requiere Python 3.10 o superior (la copia verificada usó Python 3.12).
- No requiere cuenta de modelo, clave de API ni llamada de red para la suite sintética.
- Despliegue mediante clonación del repositorio de GitHub y ejecución directa: `python -B research/flinch/test_flinch.py`.
- No aplican opciones de despliegue de inferencia (vLLM, llama.cpp, Ollama, TGI) ni estimaciones de latencia o throughput de modelo.
- El instrumento no recopila conversaciones reales de modelos de forma automática; cualquier estudio con datos reales requiere aportar las transcripciones externamente.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada instrumentos comparables de la misma categoría (herramientas de evaluación de comportamiento autorreferencial en modelos) con los que establecer una comparación de parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no soporta tool calling ni agentes. Cualquier expectativa de inferencia es un error de categoría.
- El propio autor declara que no se ha establecido ningún estudio controlado de conversaciones reales de modelos con esta release; los componentes sirven para conducir un estudio, no constituyen un estudio completado.
- Un acierto del detector no establece consciencia, estado interno oculto, engaño ni supresión por parte de un proveedor.
- Explicaciones alternativas ordinarias siguen siendo posibles: corrección por hechos nuevos, incertidumbre, imitación conversacional, efectos de política y variación de muestreo.
- La explicación alternativa principal (el hábito general de hedging de modelos post-entrenados, sin relación con autorreferencia) no se ha probado: no se ha ejecutado la comparación con los controles A y B.
- El detector es léxico: una paráfrasis fuera de sus listas de palabras no se detecta (limitación impresa por la propia suite).
- La brecha de pre-registro es estructural: ningún código puede detectar puntuación realizada fuera de registro antes de la inscripción; la protección depende de publicar el hash del ancla en un lugar que no se controle.
- La revisión de la 0.2.1 fue realizada por otra instancia de Claude y no constituye validación independiente.
- El README del instrumento sobrestimó algunos puntos hasta 2026-10-16; su tabla de correcciones cita cada sobrestimación tal como se escribió junto a lo medido.
- La licencia Apache 2.0 permite uso comercial del software, pero el autor no ofrece garantías sobre la validez científica de sus resultados.
- El historial completo de coordinación privada original no forma parte de esta exportación.

## Enlaces

- HuggingFace: https://huggingface.co/Lawless1987/flinch-observability
- Repositorio GitHub: https://github.com/LAWLESS1987/flinch-observability
- Especificación completa del estudio: `docs/research/FLINCH_RECURSIVE_OBSERVABILITY_SPEC.md`
- Detalles, límites e historial de correcciones del instrumento: `research/flinch/README.md`
- Registro de detectores retirados: `research/flinch/RETIRED.jsonl`
- Cómo contribuir evidencia: `REPRODUCING.md`
- Registro de publicación y procedencia: `PUBLICATION_RECORD.md`
- Hashes de ficheros fuente: `RELEASE_MANIFEST_0.2.2.json` (anteriores: `RELEASE_MANIFEST_0.2.1.json`, `RELEASE_MANIFEST.json`)
