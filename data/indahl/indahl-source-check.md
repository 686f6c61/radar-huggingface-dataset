# indahl/indahl-source-check

## Resumen

`indahl-source-check` no es un modelo de lenguaje, sino un plugin para Claude Code publicado por Heuremen LLC bajo el identificador `indahl/indahl-source-check` en Hugging Face. Su funcion es verificar citas, referencias y enlaces presentes en articulos, informes, respuestas o en la salida de otras skills: comprueba si la fuente existe, si realmente dice lo que el texto afirma y que version se consulto. Se distribuye como espejo del repositorio GitHub de la organizacion y se instala a traves del marketplace de plugins de Claude Code.

El plugin esta disenado para integrarse en flujos de revision bibliografica y control de calidad documental. Cada cita recibe una marca categorica (SUPPORTS, PARTIAL, CONTRADICTS, SILENT, NOT_FOUND o CANNOT_TELL) junto con el pasaje concreto que justifica la evaluacion, lo que permite auditar afirmaciones antes de publicarlas o de reutilizarlas en otros contextos. No contacta servicios externos: se ejecuta dentro de la sesion del usuario y solo abre las fuentes que se le indican.

Por su naturaleza, no dispone de parametros, contexto, pesos ni arquitectura de red neuronal. La ficha se adapta a ese hecho: las secciones tecnicas reflejan la ausencia de estos datos y se centran en lo que el plugin si ofrece (flujo de uso, requisitos, integracion y limitaciones operativas).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo neuronal; es un plugin de Claude Code) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (depende del modelo subyacente de Claude Code) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible (no publica pesos; se distribuye como plugin) |

## Arquitectura y entrenamiento

No se trata de un modelo entrenado. El plugin se ejecuta dentro de Claude Code y actua como una skill que orquesta la revision de citas apoyandose en el modelo conversacional que el usuario tenga activo en su sesion. No hay informacion publica sobre el proceso de construccion, el conjunto de datos utilizado para su desarrollo ni sobre tecnicas de ajuste (RLHF, DPO u otras), porque el artefacto distribuido no es un modelo de pesos.

La logica funcional descrita en la model card consiste en: recorrer cada cita, referencia o enlace del documento objetivo, abrir la fuente indicada, comparar el contenido con la afirmacion y emitir una de seis marcas posibles junto con el pasaje decisivo. El plugin declara explicitamente que no contacta servicios externos y que solo accede a las fuentes que el usuario le senala.

## Capacidades

- Verificacion de citas individuales en articulos, informes, respuestas y salidas de otras skills.
- Clasificacion de cada cita en una de seis categorias: SUPPORTS, PARTIAL, CONTRADICTS, SILENT, NOT_FOUND o CANNOT_TELL.
- Extraccion del pasaje concreto de la fuente que justifica la marca asignada.
- Comprobacion de existencia de enlaces y referencias.
- Deteccion de discrepancias entre lo que el texto afirma y lo que la fuente dice.
- Identificacion de la version de la fuente consultada.
- Ejecucion local dentro de la sesion de Claude Code, sin llamadas a servicios externos declarados.
- Invocacion mediante el comando `/source-check` seguido del objetivo a revisar.

## Casos de uso

- Revision de literatura academica: aplicar `/source-check` sobre un fichero de revision bibliografica para obtener una fila por cita con su marca y el pasaje que la respalda, lo que facilita descartar referencias mal atribuidas antes de enviar el manuscrito.
- Auditoria de informes internos: verificar que cada dato citado en un memo de investigacion corresponde realmente a la fuente enlazada, detectando afirmaciones que la fuente no respalda (SILENT) o contradice (CONTRADICTS).
- Control de calidad de respuestas generadas: pasar respuestas con referencias por el plugin para comprobar que las citas no han sido fabricadas y que los enlaces resuelven a documentos reales.
- Validacion de salidas de otras skills: encadenar `indahl-source-check` despues de otra skill que produzca texto con referencias, para asegurar que las fuentes citadas existen y sostienen lo afirmado.
- Preparacion de publicaciones divulgativas: revisar articulos de blog o notas de prensa tecnica antes de publicar, marcando cada enlace y comprobando que el contenido citado coincide con lo que se atribuye.
- Due diligence documental: en procesos donde se evaluan informes de terceros, generar una tabla de citas con marcas y pasajes que sirva como evidencia de la verificacion realizada.
- Revision de documentacion tecnica con enlaces a especificaciones o RFC: comprobar que las referencias apuntan a la version correcta y que la afirmacion del documento coincide con el texto normativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No requiere GPU ni VRAM propia: se ejecuta dentro de la sesion de Claude Code del usuario.
- El consumo de recursos depende del modelo subyacente de Claude Code activo en la sesion, no del plugin.
- No se distribuyen pesos, por lo que no aplican opciones de despliegue como vLLM, llama.cpp, Ollama o TGI.
- Requisitos declarados por el autor: ninguno adicional; funciona dentro de Claude Code.
- No se han publicado datos de latencia ni throughput.

## Comparativa con modelos similares

| Herramienta | Tipo | Funcion principal | Licencia | Disponibilidad |
|---|---|---|---|---|
| indahl-source-check | Plugin para Claude Code | Verificacion de citas y referencias con marcas y pasajes | MIT | Hugging Face (espejo) y GitHub de Heuremen LLC |
| Herramientas genericas de comprobacion de enlaces | Utilidades CLI o web | Comprobar que una URL responde | Variable | Amplia |
| Revisores humanos de bibliografia | Proceso manual | Validacion semantica de citas | No aplica | No aplica |

No se dispone de informacion sobre otras alternativas comparables en la misma categoria (plugins de verificacion de citas para Claude Code) en la documentacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto por si mismo ni puede evaluarse con benchmarks tipo MMLU, HumanEval o GSM8K.
- La calidad de la verificacion depende del modelo subyacente de Claude Code y de la accesibilidad de las fuentes; si una fuente no es accesible, la marca previsible es NOT_FOUND o CANNOT_TELL.
- No se especifican idiomas soportados; el comportamiento multilingue no esta documentado.
- El plugin solo abre las fuentes que se le indican, por lo que citas sin enlace o sin identificador verificable pueden quedar sin resolver.
- No hay informacion publica sobre sesgos, tasas de falsos positivos o falsos negativos en la clasificacion de citas.
- Aunque la licencia es MIT, conviene revisar los terminos y la politica de privacidad enlazados por el autor antes de un uso en produccion.
- El repositorio indica que es un espejo de GitHub en el commit ce27bdc; la version en Hugging Face puede no reflejar cambios posteriores del repositorio original.
- No se han publicado datos sobre latencia, coste por verificacion ni limites de tamano de documento.

## Enlaces

- Hugging Face: https://huggingface.co/indahl/indahl-source-check
- Repositorio GitHub del plugin: https://github.com/Heuremen-LLC/indahl-source-check
- Codigo fuente en el monorepo: https://github.com/Heuremen-LLC/indahl.ai/tree/main/claude-plugins/src/source-check
- Sitio del autor: https://indahl.ai
- Politica de privacidad: https://indahl.ai/privacy
- Terminos de uso: https://indahl.ai/terms
