# indahl/indahl-clause

## Resumen

Indahl Clause (`indahl-clause`) es un plugin para Claude Code, no un modelo de lenguaje. Lo desarrolla Heuremen LLC y se distribuye a través del repositorio de Hugging Face `indahl/indahl-clause`, con licencia MIT. Su funcion es revisar frases que reportan resultados y detectar formulaciones que afirman mas de lo que la comparacion medida permite sostener.

El plugin aborda un problema concreto de rigor cientifico y editorial: frases que presentan un resultado consistente como "lo mismo", una diferencia no significativa como "sin diferencia", o una asociacion medida como si fuera una relacion causal. Extrae y numera cada frase de resultados, la clasifica como KEEP (conservar) o REWORD (reescribir) con la razon, y en los casos de reescritura propone la frase de reemplazo exacta indicando la comparacion, el intervalo y el alcance.

Es relevante para equipos que redactan secciones de resultados, informes de evaluacion, resumenes clinicos o de producto y notas de prensa, donde una formulacion imprecisa puede inducir a error. Se invoca con el comando `/clause` dentro de Claude Code y no contacta servicios externos ni requiere dependencias adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (plugin para Claude Code, no un modelo neuronal) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (limitada por la sesion de Claude Code) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible (plugin distribuido como codigo; espejo del repositorio GitHub en el commit 4fab8d7) |

## Arquitectura y entrenamiento

No se trata de un modelo entrenado con pesos neuronales. Indahl Clause es un plugin que se ejecuta dentro de Claude Code y opera sobre el modelo subyacente de esa sesion. Su logica es de tipo regla/heuristica editorial: identifica frases de resultados, las numera y las evalua segun cuatro patrones de sobreafirmacion descritos en la model card (resultado erroneo por si mismo presentado como si la comparacion pareada se hubiera movido; resultado CONSISTENTE descrito como "lo mismo"; diferencia no significativa descrita como "sin diferencia"; causa nombrada donde solo se midio asociacion).

No hay informacion sobre datos de entrenamiento, tokens, RLHF/DPO ni innovaciones de decodificacion, porque no aplica a un plugin. La instalacion se realiza mediante el marketplace de plugins de Claude Code (`/plugin marketplace add Heuremen-LLC/indahl.ai` y `/plugin install indahl-clause@heuremen`).

## Capacidades

- Extraccion y numeracion de cada frase de resultados en el texto indicado.
- Clasificacion KEEP/REWORD por frase, con justificacion.
- Generacion de frase de reemplazo exacta para cada REWORD, especificando comparacion, intervalo y alcance.
- Deteccion de sobreafirmacion en cuatro categorias: resultado erroneo presentado como comparacion, consistencia descrita como igualdad, no significacion descrita como ausencia de diferencia, y asociacion descrita como causa.
- Aplicable a secciones de resultados, informes de evaluacion, resumenes clinicos y de producto y notas de prensa.
- Invocacion mediante el comando `/clause` seguido de la ruta o descripcion del material a revisar.
- No requiere dependencias adicionales ni contacta servicios externos.
- No se documentan capacidades de tool calling, agentes multi-paso, vision, audio ni thinking mode, por no ser un modelo generativo.

## Casos de uso

- Revision de secciones de resultados en articulos cientificos: se ejecuta `/clause` sobre el borrador y el plugin devuelve cada frase numerada con KEEP/REWORD, permitiendo al autor corregir formulaciones que sobreinterpretan la comparacion medida.
- Auditoria de informes de evaluacion interna: util para equipos de producto que redactan resumenes de A/B tests y necesitan que "sin diferencia" no sustituya "diferencia no significativa".
- Control editorial de resumenes clinicos: detecta frases que atribuyen causalidad a estudios observacionales donde solo se midio asociacion, un riesgo frecuente en comunicacion medica.
- Revision de notas de prensa de producto: verifica que las afirmaciones de mejora nombran la comparacion y el intervalo concretos en lugar de generalizar.
- QA de documentacion tecnica y papers internos antes de publicacion: integrable en el flujo de Claude Code del equipo redactor.
- Formacion y calibracion de redactores: las frases de reemplazo propuestas sirven como ejemplo concreto de formulacion correcta para cada patron detectado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; el plugin no ejecuta pesos propios y depende del modelo subyacente de Claude Code.
- GPU recomendadas: no disponible por la misma razon; el requisito real es disponer de una sesion de Claude Code operativa.
- Ejecucion en GPU de consumo: no aplica al plugin; depende del entorno donde corre Claude Code.
- Opciones de despliegue: instalacion via marketplace de plugins de Claude Code (`/plugin marketplace add Heuremen-LLC/indahl.ai`, `/plugin install indahl-clause@heuremen`). No se documentan opciones vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada alternativas comparables de la misma categoria (plugins de revision editorial para Claude Code).

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto libre, no razona sobre dominios generales ni sustituye a un LLM; su alcance se limita a la revision de frases de resultados.
- Depende por completo de Claude Code y del modelo subyacente de esa sesion; no funciona fuera de ese entorno.
- La deteccion se basa en cuatro patrones editoriales descritos; no se documenta cobertura de otros tipos de sobreafirmacion ni su tasa de falsos positivos o negativos.
- No se documentan sesgos conocidos, riesgo de alucinacion medido ni evaluacion de calidad de las reescrituras propuestas.
- Idiomas soportados no disponibles; la model card esta en ingles y no se especifica si el plugin opera sobre textos en castellano.
- Licencia MIT permite uso comercial, pero conviene revisar los terminos de servicio en https://indahl.ai/terms y la politica de privacidad en https://indahl.ai/privacy antes de integrarlo en produccion.
- El plugin declara no contactar servicios externos y abrir solo las fuentes indicadas, pero esa afirmacion procede de la model card y no se ha verificado de forma independiente.
- Sin descargas ni likes en Hugging Face en la fecha de consulta; madurez y soporte de la comunidad no demostrados.

## Enlaces

- Hugging Face: https://huggingface.co/indahl/indahl-clause
- Repositorio fuente (espejo): https://github.com/Heuremen-LLC/indahl-clause
- Codigo del plugin en GitHub: https://github.com/Heuremen-LLC/indahl.ai/tree/main/claude-plugins/src/clause
- Sitio del autor: https://indahl.ai
- Privacidad: https://indahl.ai/privacy
- Terminos: https://indahl.ai/terms
