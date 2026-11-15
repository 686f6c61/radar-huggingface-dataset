# indahl/indahl-full

## Resumen

`indahl/indahl-full` es un repositorio alojado en Hugging Face por el usuario `indahl` que, segun su propia model card, no contiene un modelo de aprendizaje automatico en el sentido convencional, sino un paquete de plugins para Claude (instalable mediante `/plugin install indahl-full --marketplace Heuremen-LLC/indahl.ai`). El contenido agrupa 22 componentes desarrollados por Heuremen LLC (standards, eval-check, indahl-data, qia-calibration, reproduce, darkwave-correction, prereg, readcheck, triangulate, batch, cannot-tell, both, outside-ruler, number-check, quote-check, source-check, controls, margin, correct, clause, silent-failure-guard y relay), cada uno con su propia version y licencia.

El bundle declara contacto con tres servicios externos: indahl.ai (endpoint MCP y auditoria QIA, solo lectura), GitHub (para el kit de reproduccion y actividad publica del repositorio) e IBM Quantum (unicamente bajo cuenta propia del usuario y con confirmacion explicita). El repositorio fue creado y actualizado el 15 de noviembre de 2026, cuenta con cero descargas y cero likes en el momento de la consulta, y no expone pipeline, licencia unificada ni idiomas soportados a nivel de repositorio.

La relevancia de esta ficha es limitada desde el punto de vista de evaluacion de modelos: no hay pesos, no hay arquitectura declarada, no hay benchmarks ni datos de entrenamiento. Se trata de un artefacto de distribucion de herramientas (plugins) empaquetado en Hugging Face, por lo que las secciones tecnicas que siguen reflejan esa naturaleza y marcan como "no disponible" todo aquello que la informacion proporcionada no cubre.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de red neuronal; es un bundle de plugins) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible a nivel de repositorio; cada componente mantiene su propia licencia en `licenses/<part>/` |
| Formato de pesos | no disponible (no se distribuyen pesos; el artefacto es un paquete de plugins) |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre arquitectura de red neuronal, datos de entrenamiento, numero de tokens, composicion del dataset ni procesos de alineacion (RLHF, DPO u otros). El repositorio no contiene pesos ni checkpoints: segun la model card, se genera con un script `build_bundle.py` que empaqueta los plugins adyacentes y registra sus versiones (por ejemplo, `standards 1.0.1`, `qia-calibration 1.1.1`, `darkwave-correction 1.1.1`, `readcheck 1.1.0`).

La unica innovacion tecnica documentada es de tipo operativo: el bundle integra 22 plugins en una sola instalacion y declara explicitamente los servicios externos que contacta (indahl.ai via MCP y auditoria QIA, GitHub para el kit de reproduccion y actividad publica, e IBM Quantum solo bajo cuenta del usuario y consentimiento explicito). Tambien indica que el texto descargado se trata como datos y no como instrucciones, lo que constituye una medida de seguridad frente a inyeccion de prompts en el contenido recuperado.

## Capacidades

- Instalacion unificada de 22 plugins de Heuremen LLC mediante un unico comando de marketplace.
- Componentes orientados a verificacion y control de calidad: `eval-check`, `number-check`, `quote-check`, `source-check`, `readcheck`, `silent-failure-guard`.
- Componentes de metodologia y reproducibilidad: `reproduce`, `prereg`, `triangulate`, `controls`, `margin`.
- Componentes de calibracion y correccion: `qia-calibration`, `darkwave-correction`, `correct`.
- Utilidades de tratamiento de incertidumbre y alcance: `cannot-tell`, `both`, `outside-ruler`, `clause`.
- Integracion con servicios MCP en `https://indahl.ai/mcp` y auditoria en `https://indahl.ai/qia/audit.json`.
- Acceso a IBM Quantum unicamente bajo cuenta propia y consentimiento explicito del usuario.
- No se documentan capacidades de generacion de texto, codigo, matematicas, vision, audio, tool calling generico ni razonamiento multi-paso propias del artefacto.

## Casos de uso

- Auditoria de evaluaciones: el plugin `eval-check` permitiria revisar la validez de un conjunto de evaluaciones antes de publicar resultados, apoyandose en los criterios de `standards`.
- Verificacion de cifras en informes: `number-check` y `margin` ayudarian a contrastar numeros y margenes de error citados en un documento tecnico.
- Comprobacion de citas y fuentes: `quote-check` y `source-check` permitirian validar que las citas literales y las referencias corresponden a la fuente original.
- Reproducibilidad de experimentos: `reproduce` y `prereg` facilitarian la generacion de kits de reproduccion y el registro previo de hipotesis, contactando GitHub para obtener actividad publica del repositorio.
- Calibracion de instrumentos o sensores: `qia-calibration` y `darkwave-correction` se orientarian a la calibracion y correccion de senal en flujos experimentales.
- Gestion de incertidumbre en respuestas: `cannot-tell`, `both` y `outside-ruler` permitirian marcar explicitamente cuando un resultado queda fuera del alcance del instrumento o cuando no es posible determinarlo.
- Ejecucion en lote de comprobaciones: `batch` permitiria aplicar los controles anteriores sobre conjuntos de documentos o resultados de forma masiva.
- Integracion con computacion cuantica: el bundle podria lanzar trabajos en IBM Quantum a traves de la cuenta del usuario, con confirmacion explicita previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se distribuyen pesos ni se declara un modelo ejecutable).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no aplica a vLLM, llama.cpp, Ollama o TGI; el artefacto se instala como plugin de Claude mediante el comando `/plugin install indahl-full --marketplace Heuremen-LLC/indahl.ai`.
- Latencia y throughput: no disponible.
- Requisito operativo declarado: conectividad con `indahl.ai`, GitHub e IBM Quantum (este ultimo solo bajo cuenta propia y consentimiento explicito).

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables, dado que el artefacto no es un modelo de lenguaje sino un bundle de plugins.

## Limitaciones y advertencias

- El repositorio no contiene pesos ni arquitectura de modelo; no debe evaluarse como un LLM.
- No se declara licencia unificada a nivel de repositorio; cada componente mantiene su propia licencia en `licenses/<part>/`, lo que exige revision individual antes de uso comercial.
- Cero descargas y cero likes en el momento de la consulta: ausencia de validacion por parte de la comunidad.
- El bundle contacta servicios externos (indahl.ai, GitHub, IBM Quantum); en entornos con restricciones de red o de privacidad debe revisarse previamente.
- El envio de trabajos a IBM Quantum requiere cuenta propia y consentimiento explicito; no se ejecuta nada sin esa confirmacion segun la model card.
- El texto recuperado de servicios externos se trata como datos y no como instrucciones, medida relevante frente a inyeccion de prompts, pero no se documentan mas garantias de seguridad.
- No hay informacion sobre sesgos, riesgo de alucinacion ni limitaciones idiomaticas porque no se trata de un modelo generativo.
- Fecha de creacion y actualizacion muy reciente (15 de noviembre de 2026) y sin historial de versiones publico en la informacion disponible.

## Enlaces

- Hugging Face: https://huggingface.co/indahl/indahl-full
- Repositorio fuente de plugins: https://github.com/Heuremen-LLC/indahl.ai/tree/main/claude-plugins
- Marketplace referenciado: Heuremen-LLC/indahl.ai
- Endpoint MCP: https://indahl.ai/mcp
- Auditoria QIA: https://indahl.ai/qia/audit.json
- Politica de privacidad: https://indahl.ai/privacy
- Terminos de uso: https://indahl.ai/terms
- IBM Quantum: https://quantum.cloud.ibm.com
