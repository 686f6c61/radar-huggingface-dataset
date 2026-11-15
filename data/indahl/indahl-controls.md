# indahl/indahl-controls

## Resumen

`indahl/indahl-controls` es un artefacto publicado en Hugging Face por el usuario `indahl` que, segun su model card, no contiene pesos de un modelo de lenguaje sino un plugin para Claude Code. Su funcion es auditar los controles positivos y negativos de un estudio, benchmark o evaluacion antes de ejecutarlo, verificando para cada control tres condiciones: que se haya elegido de forma independiente del valor que lee la regla, que la regla pueda dispararse sobre el control y que el positivo mas dificil conocido sea alcanzable bajo los propios limites de la regla. El resultado es una tabla de controles acompanada de un veredicto (`READY`, `FIX_CONTROLS` o `CANNOT_TELL`).

El artefacto lo desarrolla Heuremen LLC, con especificacion atribuida a Sage como arbitro externo el 13 de noviembre de 2026. Se distribuye a traves del marketplace de plugins de Claude Code (`Heuremen-LLC/indahl.ai`) y se invoca con el comando `/controls` seguido del material a revisar. No contacta servicios externos y opera dentro de la sesion del usuario.

La relevancia de esta ficha es acotada: no es un modelo fundacional, no tiene arquitectura de red neuronal publicada, no expone parametros, contexto ni cuantizaciones, y en el momento de la consulta registra 0 descargas y 0 likes. Cualquier evaluacion como modelo de IA debe tratar los campos no documentados como "no disponible" en lugar de inferirlos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (plugin para Claude Code, no es un modelo de pesos) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (se instala como plugin, no como safetensors ni GGUF) |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre arquitectura de red, tamano de parametros, dataset de entrenamiento, numero de tokens, tecnicas de alineacion (RLHF, DPO) ni innovaciones de inferencia. La model card describe exclusivamente el comportamiento funcional del plugin: recibe un diseno experimental o de evaluacion, extrae los controles positivos y negativos, y aplica tres preguntas de auditoria a cada uno (independencia respecto al valor leido por la regla, capacidad de la regla de dispararse sobre el control y alcanzabilidad del positivo mas dificil bajo los limites de la regla).

El unico dato operativo es su entorno de ejecucion: corre dentro de Claude Code, no contacta servicios externos y solo abre las fuentes que el usuario le indica. La instalacion se realiza mediante `/plugin marketplace add Heuremen-LLC/indahl.ai` y `/plugin install indahl-controls@heuremen`.

## Capacidades

- Auditoria de controles positivos y negativos en disenos de experimentos, benchmarks, evaluaciones y detectores.
- Verificacion de independencia entre el control y el valor que lee la regla evaluada.
- Comprobacion de que la regla puede dispararse sobre cada control (evita controles inertes).
- Analisis de alcanzabilidad del positivo mas dificil bajo los limites declarados de la regla.
- Generacion de una tabla de controles con tipo, las tres respuestas y una nota por control.
- Emision de un veredicto accionable: `READY`, `FIX_CONTROLS` (con indicacion de que cambiar) o `CANNOT_TELL`.
- Invocacion mediante comando `/controls` seguido de una ruta o descripcion del material a revisar.
- No se documentan capacidades de generacion de texto general, codigo, matematicas, vision, audio, tool calling ni razonamiento multi-paso fuera del flujo de auditoria descrito.

## Casos de uso

- Revision de disenos de evaluacion antes de ejecutarlos: se apunta `/controls` a un documento como `docs/eval-plan.md` y el plugin devuelve la tabla de controles con el veredicto, lo que permite corregir controles mal elegidos antes de gastar computo en el benchmark.
- Auditoria de detectores en produccion: antes de desplegar un detector cuya ausencia de alertas se interpretara como ausencia de problema, se comprueba que el positivo mas dificil conocido es alcanzable bajo las reglas del detector.
- Control de calidad de tests automatizados: se verifica que cada caso negativo puede realmente fallar y que cada caso positivo no depende del mismo valor que la regla lee, reduciendo tests tautologicos.
- Diseno de experimentos cientificos: se revisa que los controles se hayan elegido con independencia del resultado esperado, un requisito habitual en revisiones por pares y en protocolos de laboratorio.
- Preparacion de material para revision externa: el veredicto `FIX_CONTROLS` con la lista de cambios sirve como registro documentado de las correcciones aplicadas antes de someter un estudio o una evaluacion.
- Integracion en el flujo de trabajo de Claude Code: al ejecutarse dentro de la sesion y sin contactar servicios externos, encaja en entornos con requisitos de privacidad estrictos donde no se permite enviar documentacion a terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de precision, latencia ni comparaciones cuantitativas con otras herramientas de auditoria de controles.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el artefacto no incluye pesos y se ejecuta dentro de Claude Code, por lo que el computo lo aporta el entorno del usuario.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: instalacion como plugin de Claude Code mediante `/plugin marketplace add Heuremen-LLC/indahl.ai` y `/plugin install indahl-controls@heuremen`. No se documentan opciones para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos o herramientas comparables de la misma categoria (plugins de auditoria de controles para Claude Code), ni se dispone de datos de parametros, contexto o rendimiento para establecer una comparacion.

## Limitaciones y advertencias

- El artefacto no es un modelo de lenguaje con pesos publicados; no debe evaluarse ni desplegarse como tal.
- La licencia no esta disponible, por lo que no puede confirmarse el uso comercial ni las condiciones de redistribucion.
- No se declaran idiomas soportados; la model card esta redactada en ingles y no hay confirmacion de comportamiento en castellano.
- No se han publicado benchmarks ni evaluaciones independientes del plugin, por lo que su eficacia en la deteccion de controles defectuosos no esta cuantificada.
- Riesgo de dependencia de la calidad de las fuentes que se le indican: el plugin solo abre los documentos apuntados por el usuario, de modo que un diseno experimental incompleto producira una auditoria incompleta.
- El veredicto `CANNOT_TELL` es una salida valida y frecuente cuando falta informacion; no debe interpretarse como aprobacion.
- El artefacto registra 0 descargas y 0 likes en el momento de la consulta, sin historial de uso que permita valorar su madurez.
- Requiere Claude Code como entorno de ejecucion; no es portable a otros stacks de agentes segun la documentacion disponible.

## Enlaces

- Hugging Face: https://huggingface.co/indahl/indahl-controls
- Politica de privacidad: https://indahl.ai/privacy
- Terminos de uso: https://indahl.ai/terms
- Sitio del desarrollador: https://indahl.ai
- Codigo fuente del plugin: https://github.com/Heuremen-LLC/indahl.ai/tree/main/claude-plugins/src/controls
