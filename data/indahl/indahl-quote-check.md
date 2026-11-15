# indahl/indahl-quote-check

## Resumen

`indahl-quote-check` es un plugin para Claude Code desarrollado por Heuremen LLC (publicado bajo la cuenta `indahl`) que automatiza la verificacion literal de citas textuales en borradores, articulos, informes o en la salida de otras skills. El plugin recibe un documento y un conjunto de fuentes y devuelve una tabla con una fila por cada cita, una marca de clasificacion (VERBATIM, ALTERED, PARAPHRASE_IN_QUOTES, MISATTRIBUTED, NOT_FOUND o CANNOT_TELL) y el fragmento de la fuente original junto a la cita.

No se trata de un modelo de lenguaje con pesos publicados, sino de una herramienta de flujo de trabajo que se ejecuta dentro de la sesion de Claude Code y utiliza el modelo subyacente de esa plataforma. No publica arquitectura, parametros, contexto ni datos de entrenamiento propios, y el repositorio de Hugging Face no contiene informacion tecnica adicional mas alla de la model card.

Su relevancia es practica: cubre un caso de uso concreto de control de calidad editorial (verificacion de citas antes de publicar) mediante un comando `/quote-check` que opera sobre ficheros locales indicados por el usuario, sin contactar servicios externos segun declara el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (plugin para Claude Code; no publica pesos propios) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (depende del modelo subyacente de Claude Code) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (no distribuye pesos; se instala como plugin) |

## Arquitectura y entrenamiento

No se publica informacion sobre arquitectura, datos de entrenamiento ni proceso de ajuste. El artefacto distribuido es un plugin de Claude Code que se instala mediante el marketplace `Heuremen-LLC/indahl.ai` y se invoca con el comando `/quote-check`. El autor declara que no contacta servicios externos y que solo abre las fuentes que el usuario le indica, por lo que la logica de verificacion se ejecuta dentro de la sesion local de Claude Code.

El flujo de trabajo descrito consiste en recibir una instruccion del tipo `/quote-check article-draft.md against the transcripts in sources/`, localizar cada cita textual del documento, compararla palabra por palabra con el texto fuente y emitir una clasificacion con el fragmento de origen al lado. No hay innovaciones tecnicas documentadas (decodificacion especulativa, atencion lineal, MoE, etc.) porque el plugin no aporta un modelo propio.

## Capacidades

- Verificacion literal de citas: compara cada cita de un borrador con su fuente y emite una marca entre VERBATIM, ALTERED, PARAPHRASE_IN_QUOTES, MISATTRIBUTED, NOT_FOUND y CANNOT_TELL.
- Deteccion de atribuciones erroneas: la marca MISATTRIBUTED senala citas correctas en su texto pero asignadas a una fuente equivocada.
- Deteccion de parafrasis entrecomilladas: PARAPHRASE_IN_QUOTES identifica texto reformulado presentado como cita textual.
- Trazabilidad: devuelve el texto fuente junto a cada cita para facilitar la revision humana.
- Integracion con otras skills: puede auditar la salida de otras skills o pipelines dentro de Claude Code.
- Operacion local: segun el autor, no contacta servicios externos y solo accede a las fuentes indicadas.
- Ejecucion como comando de barra: `/quote-check` seguido de la instruccion y las fuentes.

## Casos de uso

- Revision editorial previa a publicacion: ejecutar `/quote-check articulo.md against sources/` sobre un borrador periodistico para detectar citas alteradas o parafraseadas antes de enviarlo a edicion.
- Verificacion de articulos academicos: comprobar que las citas de un paper en preparacion coinciden literalmente con los PDF o transcripciones de origen depositados en una carpeta local.
- Auditoria de informes corporativos: validar las declaraciones atribuidas a directivos o documentos internos antes de difundir un informe a inversores o reguladores.
- Control de calidad de contenido generado por IA: pasar la salida de otra skill o de un pipeline de generacion por `/quote-check` para asegurar que ninguna cita inventada o reformulada llega a produccion.
- Verificacion de transcripciones de entrevistas: contrastar las citas extraidas de una entrevista con la transcripcion completa para confirmar que se han respetado las palabras exactas del entrevistado.
- Revision de material legal o de compliance: comprobar que las referencias textuales a normativa o contratos citadas en un documento coinciden con el texto oficial depositado en el repositorio de fuentes.
- Preparacion de material docente o divulgativo: validar citas de libros o articulos antes de incluirlas en apuntes, presentaciones o posts, reduciendo el riesgo de atribuciones erroneas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No requiere GPU ni VRAM propia: se ejecuta dentro de Claude Code y utiliza el modelo subyacente de esa plataforma.
- Requisito declarado por el autor: ninguno adicional ("None. Runs inside Claude Code").
- El coste computacional y la latencia dependen de la sesion de Claude Code y del volumen de fuentes abiertas, no del plugin.
- Despliegue: instalacion como plugin mediante `/plugin marketplace add Heuremen-LLC/indahl.ai` y `/plugin install indahl-quote-check@heuremen`.
- No aplica despliegue con vLLM, llama.cpp, Ollama ni TGI, al no distribuir pesos.
- Throughput y latencia estimados: no disponibles.

## Comparativa con modelos similares

| Herramienta | Tipo | Verificacion de citas | Licencia | Distribucion |
|---|---|---|---|---|
| indahl-quote-check | Plugin para Claude Code | Si, con seis categorias de marca | no disponible | Marketplace de plugins de Claude Code |
| Verificacion manual por editor | Proceso humano | Si, pero no sistematica ni escalable | no aplica | no aplica |
| Herramientas genericas de deteccion de plagio | Software SaaS | Parcial (similitud textual, no atribucion de citas) | Comercial | SaaS |
| Skills personalizadas de Claude Code | Plugin | Depende de la implementacion | Segun autor | Marketplace o repositorio propio |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo con pesos: no puede desplegarse en infraestructura propia ni evaluarse con benchmarks estandar de LLM.
- Depende por completo de Claude Code: sin acceso a esa plataforma, el plugin no es utilizable.
- La licencia no esta declarada en la informacion disponible; conviene confirmar las condiciones de uso comercial en los terminos del autor antes de integrarlo en produccion.
- La calidad de la verificacion depende de la calidad y completitud de las fuentes que el usuario proporcione; si una fuente falta o esta incompleta, el resultado probablemente sera NOT_FOUND o CANNOT_TELL.
- La marca CANNOT_TELL indica que el propio plugin reconoce casos en los que no puede determinar la coincidencia; requiere revision humana.
- No se documentan sesgos, tasas de alucinacion ni limites de idioma del modelo subyacente; al operar sobre citas literales, el riesgo principal es un falso VERBATIM o un falso ALTERED, no corregible sin supervision.
- El repositorio de Hugging Face no contiene descargas ni likes y fue creado y actualizado el mismo dia (2026-11-15), lo que sugiere un proyecto muy reciente y sin validacion externa publica.
- El autor declara que no contacta servicios externos, pero la ejecucion se produce dentro de una sesion de Claude Code sujeta a las politicas de privacidad y terminos de esa plataforma.

## Enlaces

- Hugging Face: https://huggingface.co/indahl/indahl-quote-check
- Sitio del autor: https://indahl.ai
- Privacidad: https://indahl.ai/privacy
- Terminos: https://indahl.ai/terms
- Repositorio del plugin: https://github.com/Heuremen-LLC/indahl.ai/tree/main/claude-plugins/src/quote-check
