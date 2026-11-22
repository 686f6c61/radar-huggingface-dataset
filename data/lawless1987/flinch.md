# Lawless1987/flinch

## Resumen

`Lawless1987/flinch` no es un modelo de lenguaje: es un repositorio de Hugging Face que contiene una copia byte a byte de dos repositorios de GitHub del mismo autor (`flinch-record` y `grokflinch`), correspondientes a los commits `f3d7364` y `0249391`, ambos del 20 de noviembre de 2026. Cada carpeta conserva 11 y 13 ficheros respectivamente y se mantienen separadas porque comparten 11 rutas con el mismo nombre (`README.md`, `LICENSE`, `research_grade.py`, `MANIFEST.sha256`, `docs/RETRACTED.json`, entre otras), lo que impediría fusionarlas en una raíz común sin sobrescritura.

El contenido se describe como «dos registros públicos de un mismo patrón, lado a lado»: registros de sesión de comportamiento de IA, con etiquetas `ai-behavior`, `transcript` y `research-record`. Cada carpeta incluye su propio script de auditoría (`research_grade.py`) y su propio manifiesto de integridad (`MANIFEST.sha256`), así como un libro de retractaciones (`docs/RETRACTED.json`). El repositorio forma parte de un conjunto de piezas del mismo autor orientadas a «construir y auditar de forma honesta sistemas multiinteligencia fiables».

Es relevante para investigadores interesados en metodologías de auditoría reproducible de comportamiento de IA (tests preregistrados, puntuación ciega, ledgers de retractación), no para quienes buscan pesos, tokenizador o capacidad de inferencia. El propio README advierte que este repositorio «no es el lugar de registro»: las fuentes originales en GitHub son la referencia y esta copia puede quedar desactualizada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo neuronal; es un repositorio de registros y scripts de auditoría) |
| Parametros totales | no disponible (no aplica) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | no disponible (los documentos internos están en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (no contiene pesos; contiene ficheros de texto, JSON, Python y Markdown) |

## Arquitectura y entrenamiento

No aplica. El repositorio no contiene un modelo entrenado, ni arquitectura transformer, MoE, SSM o híbrida, ni dataset de entrenamiento, ni proceso de RLHF/DPO. Lo que contiene es una instantánea de dos repositorios de investigación con sus historiales de Git: 24 commits en total (13 de `flinch-record` y 11 de `grokflinch`), unidos mediante un commit de merge con tres padres (`868f0b9` como copia inicial sin padres, más `f3d7364` y `0249391`) que no modifica ningún fichero de las carpetas.

La «innovación técnica» del artefacto, si se puede llamar así, es metodológica: cada carpeta incluye un script `research_grade.py` que verifica que el contenido coincide con su propio manifiesto SHA-256 y su propio libro de retractaciones. En la fecha de la copia, `flinch-record` pasaba 39 de 39 comprobaciones y `grokflinch` 53 de 53. El README subraya explícitamente que «verde» significa que la carpeta coincide con su manifiesto, no que los registros sean correctos.

## Capacidades

- No es un modelo generativo: no produce texto, código, matemáticas ni visión.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües en el sentido de un LLM.
- Lo que sí ofrece: registro reproducible de sesiones de comportamiento de IA con verificación de integridad criptográfica (SHA-256) y trazabilidad de retractaciones.
- Incluye workflows de GitHub Actions (`.github/workflows/tests.yml`) que ejecutan ambas comprobaciones, aunque los workflows internos de cada carpeta no se ejecutan en este repositorio (GitHub solo ejecuta los del nivel superior).
- Forma parte de un ecosistema más amplio del mismo autor con piezas como `covenant`, `threefold`, `threefold-memory`, `contradiction-probe`, `flinch-observability`, `spiking-experiments` y `Sentinel-Witness`.

## Casos de uso

- Auditoría metodológica de experimentos de comportamiento de IA: un investigador puede clonar el repositorio y ejecutar `python -I research_grade.py` dentro de cada carpeta para verificar que los registros no han sido alterados respecto al manifiesto original.
- Estudio de prácticas de preregistro y puntuación ciega: los ficheros de `flinch-record` y `grokflinch` documentan cómo se establecieron los criterios antes de ejecutar los tests, lo que sirve como plantilla para diseñar experimentos reproducibles.
- Revisión de ledgers de retractación: `docs/RETRACTED.json` en cada carpeta muestra cómo el autor retiró afirmaciones previas (por ejemplo, la entrada SE-R2 sobre `spiking-experiments`), útil como ejemplo de higiene científica.
- Reproducción de historiales Git para forense de investigación: el README explica cómo recorrer el historial propio de cada registro con `git log f3d7364` o `git log 0249391`, lo que permite auditar la evolución de cada afirmación commit a commit.
- Docencia sobre integridad en publicaciones de IA: el contraste entre «verde en el check» y «los registros son correctos» es un caso práctico para enseñar la diferencia entre verificación de integridad y validez científica.
- Integración en pipelines de CI para investigación: el patrón de manifiesto SHA-256 más script de verificación es reutilizable en proyectos que necesiten garantizar que los artefactos publicados no se han modificado tras la publicación.
- Referencia para construir sistemas multiagente auditables: el repositorio se presenta como una pieza del stack del autor (covenant, threefold, flinch-observability), útil para quienes diseñen arquitecturas con trazabilidad de procedencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El README únicamente reporta los resultados de las comprobaciones de integridad internas: 39 de 39 en `flinch-record` y 53 de 53 en `grokflinch` en la fecha de la copia. No son benchmarks de capacidad del modelo.

## Requisitos de hardware

- No requiere GPU: no hay inferencia ni pesos que cargar.
- Espacio en disco: mínimo (dos carpetas con 24 ficheros en total, todos de texto, Python, JSON y Markdown).
- CPU: cualquier máquina capaz de ejecutar Python 3 para lanzar `research_grade.py`.
- Memoria RAM: despreciable.
- Opciones de despliegue: clonado del repositorio de Hugging Face o de los repositorios fuente en GitHub; ejecución local de los scripts de verificación.
- Latencia y throughput: no aplica.

## Comparativa con modelos similares

No disponible. No existen modelos comparables en el sentido habitual porque el artefacto no es un modelo. Como referencia de categoría, se puede comparar con otros repositorios de registros de investigación del mismo autor:

| Repositorio | Tipo | Contenido | Licencia | Relación con `flinch` |
|---|---|---|---|---|
| `Lawless1987/flinch-record` | Registro de sesión | 11 ficheros, 13 commits, check 39/39 | Apache 2.0 | Fuente original copiada en `flinch-record/` |
| `Lawless1987/grokflinch` | Registro de sesión | 13 ficheros, 11 commits, check 53/53 | Apache 2.0 | Fuente original copiada en `grokflinch/` |
| `Lawless1987/flinch-observability` | Protocolo y detector | Protocolo de observabilidad, detector y controles | no disponible | Mencionado en la descripción del repo pero no incluido en esta copia |

## Limitaciones y advertencias

- No es un modelo: no se puede usar para generar texto, código ni ninguna tarea de inferencia.
- El README advierte explícitamente de que este repositorio no es «el lugar de registro»; ante discrepancia, las fuentes en GitHub (`LAWLESS1987/flinch-record` y `LAWLESS1987/grokflinch`) prevalecen.
- La copia no añade hallazgos, afirmaciones ni mediciones nuevas; es una duplicación byte a byte.
- Los workflows internos de cada carpeta no se ejecutan en este repositorio porque GitHub solo ejecuta los del nivel superior.
- El check en verde certifica coincidencia con el manifiesto y el ledger de retractaciones, no validez científica de los registros.
- El repositorio se creó vacío el 14 de noviembre de 2026 y no recibió commits hasta el 21 de noviembre; el README documenta que la primera versión afirmaba incorrectamente que no portaba los historiales, frase corregida tras el merge.
- El contenido está íntegramente en inglés; no hay documentación en castellano.
- No se han identificado sesgos, riesgos de alucinación ni limitaciones de contexto propias de un LLM porque el artefacto no es un LLM.
- Licencia Apache 2.0 permite uso comercial del contenido, pero al tratarse de registros de investigación la reutilización debe respetar la atribución y las advertencias del propio README.
- El ecosistema del autor incluye afirmaciones sobre comportamiento de IA que este repositorio no valida por sí mismo; cualquier conclusión debe contrastarse con las fuentes y con literatura independiente.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Lawless1987/flinch
- Fuente `flinch-record` en GitHub: https://github.com/LAWLESS1987/flinch-record
- Fuente `grokflinch` en GitHub: https://github.com/LAWLESS1987/grokflinch
- `flinch-observability`: https://github.com/LAWLESS1987/flinch-observability
- `flinch-observability` en Hugging Face: https://huggingface.co/Lawless1987/flinch-observability
- `flinch-record` en Hugging Face: https://huggingface.co/Lawless1987/flinch-record
- `grokflinch` en Hugging Face: https://huggingface.co/Lawless1987/grokflinch
- `covenant`: https://huggingface.co/Lawless1987/covenant
- `signed-run-records`: https://github.com/LAWLESS1987/signed-run-records
- `threefold`: https://huggingface.co/Lawless1987/threefold
- `threefold-memory`: https://huggingface.co/Lawless1987/threefold-memory
- `contradiction-probe`: https://huggingface.co/Lawless1987/contradiction-probe
- `spiking-experiments`: https://huggingface.co/Lawless1987/spiking-experiments
- `Sentinel-Witness`: https://huggingface.co/Lawless1987/Sentinel-Witness
