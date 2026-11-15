# indahl/indahl

## Resumen

`indahl/indahl` no es un modelo de lenguaje, sino un paquete de plugins para Claude Code publicado en Hugging Face bajo el identificador `indahl/indahl`. Lo desarrolla Heuremen LLC y agrupa en una sola instalación 22 componentes orientados a la verificación de afirmaciones cientificas y de evaluacion de LLM, la reproduccion de resultados publicados en indahl.ai, la comprobacion de ejecuciones en IBM Quantum y la validacion de lecturas mediante bloques de chequeo. El repositorio se presenta como un espejo de `github.com/Heuremen-LLC/indahl` en el commit `88eca24`.

El artefacto no contiene pesos de red neuronal ni una arquitectura transformer: es un bundle de herramientas (scripts y conectores) que se ejecutan dentro del entorno de Claude Code. Por tanto, no dispone de parametros, longitud de contexto, cuantizaciones ni formato de pesos en el sentido habitual. Su relevancia actual radica en la trazabilidad de resultados cientificos y de benchmarks de LLM, un area donde la reproducibilidad es un problema abierto.

La informacion publica es muy limitada: cero descargas, cero likes, sin pipeline declarado, sin idiomas especificados y con una licencia personalizada (`see-license-file`) que remite a un fichero LICENSE en el propio repositorio. Cualquier evaluacion tecnica del artefacto debe hacerse sobre el codigo fuente del repositorio de GitHub, no sobre la model card de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo neuronal; es un bundle de plugins para Claude Code) |
| Parametros totales | no disponible (no aplica) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (depende del modelo subyacente de Claude Code) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | no disponible |
| Licencia | `other` / `see-license-file` (cada componente mantiene su propia licencia en `licenses/<part>/`) |
| Formato de pesos | no disponible (no hay pesos; el bundle se distribuye como plugin) |

## Arquitectura y entrenamiento

No se trata de un modelo entrenado. Segun la model card, el paquete se genera con `build_bundle.py` a partir de los plugins adyacentes y agrega 22 componentes con versiones fijadas: `standards 1.0.1`, `eval-check 1.0.0`, `indahl-data 1.0.0`, `qia-calibration 1.1.1`, `reproduce 1.0.0`, `darkwave-correction 1.1.1`, `prereg 1.0.0`, `readcheck 1.1.0`, `triangulate 1.0.0`, `batch 1.0.0`, `cannot-tell 1.0.0`, `both 1.0.0`, `outside-ruler 1.0.0`, `number-check 1.0.0`, `quote-check 1.0.0`, `source-check 1.0.0`, `controls 1.0.0`, `margin 1.0.0`, `correct 1.0.0`, `clause 1.0.0`, `silent-failure-guard 1.0.0` y `relay 1.0.0`.

El detalle tecnico relevante esta en el modelo de ejecucion: los scripts se obtienen del repositorio publico de indahl.ai con un sha256 fijado, lo que aporta integridad en la cadena de suministro. La variante `indahl-full`, disponible en el marketplace `Heuremen-LLC/indahl.ai`, incluye los scripts empaquetados y una puerta de commit automatica de `readcheck`. No hay informacion sobre datos de entrenamiento, RLHF/DPO ni innovaciones de inferencia porque no existen en este artefacto.

## Capacidades

- Verificacion de articulos y de afirmaciones de evaluacion de LLM contra un conjunto de estandares (`standards`, `eval-check`).
- Consulta y reproduccion de los escritorios publicados en indahl.ai mediante el conector de datos (`indahl-data`, `reproduce`).
- Comprobacion y correccion de ejecuciones en IBM Quantum (`qia-calibration`, `darkwave-correction`).
- Verificacion de que un plan se ejecuto antes de la primera corrida (`prereg`).
- Validacion de lecturas mediante un bloque de chequeo completo (`readcheck`).
- Comprobaciones puntuales de cifras, citas y fuentes (`number-check`, `quote-check`, `source-check`).
- Analisis de triangulacion, lotes y casos limite (`triangulate`, `batch`, `cannot-tell`, `both`, `outside-ruler`).
- Control de margenes, clausulas y fallos silenciosos (`margin`, `clause`, `silent-failure-guard`, `relay`).
- Integracion como plugin de Claude Code mediante `/plugin install indahl --marketplace Heuremen-LLC/indahl.ai`.

## Casos de uso

- Auditoria de benchmarks de LLM: usar `eval-check` y `number-check` para contrastar las cifras reportadas en un paper o model card contra los estandares definidos, detectando discrepancias antes de citar resultados.
- Reproduccion de resultados publicados: `reproduce` recupera el kit de reproduccion desde el repositorio de indahl.ai y lo ejecuta, permitiendo comprobar si un resultado es replicable en el entorno del usuario.
- Revision de articulos cientificos: `quote-check` y `source-check` verifican que las citas textuales y las referencias existen y coinciden con la fuente original, reduciendo el riesgo de citas erroneas.
- Validacion de experimentos en IBM Quantum: `qia-calibration` y `darkwave-correction` comprueban las ejecuciones realizadas con la cuenta propia del usuario y corrigen desviaciones de calibracion; nada se envia sin confirmacion explicita.
- Pre-registro de experimentos: `prereg` verifica que el plan se haya registrado antes de la primera ejecucion, lo que aporta trazabilidad en flujos de investigacion reproducible.
- Control de calidad en pipelines de datos cientificos: `batch`, `triangulate` y `silent-failure-guard` permiten procesar lotes de comprobaciones y detectar fallos que no producen error explicito.
- Integracion en el flujo de trabajo de Claude Code: el bundle se instala como plugin y queda disponible en el entorno del desarrollador para invocar las comprobaciones durante la revision de codigo o de documentacion tecnica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el artefacto no contiene pesos ni ejecuta inferencia propia.
- GPU recomendadas: no aplica; el consumo de computo depende del modelo Claude subyacente y de los scripts invocados.
- Cabe en GPU consumer: no aplica.
- Opciones de despliegue: instalacion como plugin de Claude Code mediante `/plugin install indahl --marketplace Heuremen-LLC/indahl.ai`; la variante `indahl-full` esta disponible en el marketplace `Heuremen-LLC/indahl.ai`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Artefacto | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| indahl/indahl | Bundle de plugins para Claude Code | no aplica | no disponible | `other` (see-license-file) | Hugging Face y GitHub |
| indahl-full | Bundle de plugins con scripts empaquetados y puerta de commit | no aplica | no disponible | no disponible | Marketplace `Heuremen-LLC/indahl.ai` |
| Modelos LLM de proposito general | Modelo neuronal | miles de millones | decenas de miles de tokens | variable | Hugging Face |

No se dispone de informacion sobre otros artefactos directamente comparables en la misma categoria de verificacion cientifica para Claude Code.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, codigo ni razonamiento por si mismo; su funcionalidad depende del modelo Claude Code que lo aloja.
- La model card no especifica idiomas soportados, por lo que no puede confirmarse el comportamiento multilingue de las comprobaciones.
- La licencia es `other` con fichero propio (`see-license-file`) y cada componente mantiene su licencia en `licenses/<part>/`; es imprescindible revisar ambas antes de un uso comercial.
- El bundle contacta con servicios externos: indahl.ai (MCP y `qia/audit.json`), GitHub (repositorio y API) e IBM Quantum (solo con cuenta propia y confirmacion explicita). Cualquier despliegue en entornos restringidos debe contemplar estas conexiones.
- Los scripts se obtienen de un repositorio remoto con sha256 fijado; la variante con scripts empaquetados (`indahl-full`) reduce la dependencia de red pero no esta publicada en Hugging Face.
- El repositorio presenta cero descargas y cero likes, sin historial de uso que permita evaluar su robustez en produccion.
- No hay informacion sobre sesgos, tasas de alucinacion ni limites de contexto, ya que no aplican al artefacto en si.

## Enlaces

- Hugging Face: https://huggingface.co/indahl/indahl
- Licencia: https://huggingface.co/indahl/indahl/blob/main/LICENSE
- Repositorio fuente: https://github.com/Heuremen-LLC/indahl.ai/tree/main/claude-plugins
- Espejo en GitHub: https://github.com/Heuremen-LLC/indahl
- Sitio del proyecto: https://indahl.ai
- Endpoint MCP: https://indahl.ai/mcp
- Auditoria QIA: https://indahl.ai/qia/audit.json
- Privacidad: https://indahl.ai/privacy
- Terminos: https://indahl.ai/terms
