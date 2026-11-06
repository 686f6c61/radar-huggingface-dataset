# Sosa654321/atikova-cop31-retrieval

## Resumen

Atikova COP31 retrieval es un prototipo de recuperación extractiva publicado en Hugging Face por el usuario Sosa654321. No se trata de un modelo de lenguaje entrenado ni de pesos ajustados: la model card indica explícitamente que no contiene pesos preentrenados, no genera embeddings y no es un LLM. El sistema consiste en un Space local que realiza búsqueda por palabras clave sobre un pequeño grafo de conocimiento que registra relaciones evento-organización, zona, pabellón, fecha y conferencia, con URLs de origen.

El problema que aborda es la localización de información estructurada sobre la COP31 (organizaciones verificadas, eventos, ubicaciones y fechas) mediante consultas léxicas. Es relevante en el contexto de preparación de conferencias climáticas, donde los equipos necesitan filtrar directorios de contactos y eventos de forma rápida. El sistema está pensado como capa de recuperación complementaria dentro del ecosistema Atikova, aunque el grafo aún no está integrado en el KAG (knowledge-augmented generation) existente de la organización.

El alcance es limitado y declarado como tal por el autor: los datos son incompletos, curados manualmente y sensibles al tiempo; la búsqueda léxica en inglés es la más fiable, y las capacidades en turco, persa y árabe no han sido evaluadas. No se reclama afiliación oficial con la COP31 ni con la ONU. No hay información sobre arquitectura de modelo, número de parámetros ni ventana de contexto, porque no existe un modelo subyacente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (sistema de recuperación léxica sobre grafo de conocimiento; no es un modelo neuronal) |
| Parametros totales | no disponible (no contiene pesos preentrenados) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no aplica: no hay pesos) |
| Idiomas soportados | en, tr, fa, ar (solo el inglés evaluado; tr/fa/ar sin evaluar) |
| Licencia | no disponible |
| Formato de pesos | no disponible (no se distribuyen pesos; el artefacto es un Space con búsqueda por palabras clave y un grafo de relaciones) |

## Arquitectura y entrenamiento

No hay arquitectura de red neuronal ni proceso de entrenamiento. El sistema es un prototipo de recuperación extractiva compuesto por un Space local que ejecuta búsqueda por palabras clave y un grafo pequeño que almacena relaciones entre eventos, organizaciones, zonas, pabellones, fechas y conferencias, con las URLs de origen asociadas. No se producen embeddings y el grafo no está integrado en el KAG de Atikova.

Los datos del grafo son incompletos, curados manualmente y sensibles al tiempo. No se documenta volumen de registros, esquema formal del grafo, motor de almacenamiento ni método de indexación. No hay RLHF, DPO ni ajuste fino, al no existir modelo base.

## Capacidades

- Búsqueda léxica por palabras clave sobre un directorio de organizaciones y eventos vinculados a la COP31.
- Recuperación de relaciones evento-organización, evento-zona, evento-pabellón, evento-fecha y evento-conferencia.
- Devolución de URLs de origen junto con los registros recuperados, lo que permite verificación manual.
- Consulta en inglés con el mejor comportamiento declarado; turco, persa y árabe figuran como idiomas soportados pero sin evaluación.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No genera texto, código, matemáticas ni visión; es exclusivamente extractivo.
- No produce embeddings ni búsqueda semántica vectorial.

## Casos de uso

- Localización de organizaciones acreditadas para la COP31: un equipo introduce términos clave (sector, país, tipo de entidad) y obtiene registros con URL de origen para verificar la acreditación antes de contactar.
- Planificación de agenda por pabellón y fecha: consultas del tipo "pabellón X" o "fecha Y" devuelven los eventos asociados registrados en el grafo, útil para preparar recorridos durante la conferencia.
- Construcción de listas de contactos B2B para startups: combinado con el Space complementario "Atikova COP31 Zero Waste & Startup Hub", el retrieval permite filtrar leads verificados antes de enviar mensajes comerciales.
- Verificación de fuentes en flujos de investigación: cada relación recuperada incluye la URL de origen, lo que facilita la trazabilidad en informes y notas de prensa.
- Enriquecimiento de pipelines RAG existentes: el grafo puede servir como fuente estructurada auxiliar para sistemas de generación aumentada, aunque el autor indica que la integración con el KAG de Atikova aún no está hecha.
- Filtrado previo en herramientas internas de prospección: dado su carácter léxico y determinista, encaja como primera etapa de recuperación de bajo coste antes de aplicar modelos semánticos más caros.
- Exploración multilingüe preliminar: para consultas en turco, persa o árabe puede usarse como aproximación, asumiendo que la calidad no está evaluada y que los resultados pueden ser incompletos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica; el sistema no ejecuta inferencia de red neuronal y no requiere GPU.
- GPU recomendadas: no aplica; el Space funciona con búsqueda por palabras clave sobre un grafo pequeño.
- Cabe en cualquier equipo capaz de ejecutar un Space de Hugging Face, incluidos portátiles sin GPU dedicada.
- Opciones de despliegue: Hugging Face Spaces (implementación de referencia del autor); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles; dependen del tamaño del grafo y de la implementación del Space, no documentados.

## Comparativa con modelos similares

| Sistema | Tipo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Atikova COP31 retrieval | Recuperación léxica sobre grafo | no aplica | no disponible | en, tr, fa, ar (solo en evaluado) | no disponible | Hugging Face (Space + repo) |
| Modelos de embeddings multilingües (p. ej. familia BGE-M3) | Recuperación densa | cientos de millones | hasta 8k tokens | multilingüe amplio | MIT | Hugging Face |
| Motores de búsqueda léxica tipo BM25/Lucene | Recuperación léxica | no aplica | no aplica | dependiente del analizador | Apache 2.0 | Amplia |
| Grafos de conocimiento RDF/Neo4j con SPARQL | Recuperación estructurada | no aplica | no aplica | dependiente del esquema | varía | Amplia |

La comparación es aproximada: no existen datos públicos de rendimiento del sistema de Atikova que permitan medirlo frente a estas alternativas. Su ventaja diferencial es la curaduría específica de la COP31 y la trazabilidad por URL; su desventaja es la ausencia de búsqueda semántica y de evaluación multilingüe.

## Limitaciones y advertencias

- No es un modelo entrenado: no hay pesos, no hay embeddings y no debe presentarse como LLM ni como modelo de recuperación neuronal.
- Los datos del grafo son incompletos, curados manualmente y sensibles al tiempo; la ausencia de un resultado no implica que el evento u organización no exista.
- Las horas y condiciones de acceso deben confirmarse siempre con la fuente original; el sistema no garantiza vigencia.
- El rendimiento en turco, persa y árabe no ha sido evaluado; el inglés es el único idioma con comportamiento declarado como fiable.
- No hay integración con el KAG de Atikova, por lo que no hereda las garantías ni la cobertura de ese sistema.
- Licencia no especificada: no se puede asumir permiso para uso comercial ni para redistribución sin consultar al autor.
- No se reclama afiliación oficial con la COP31 ni con la ONU; cualquier uso en contextos oficiales debe evitar implicar respaldo institucional.
- Sin benchmarks publicados, no es posible estimar precisión, recall ni tasas de error en recuperación.
- Riesgo de sesgo derivado de la curaduría manual: la selección de organizaciones y eventos refleja los criterios del autor y puede omitir regiones o sectores.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Sosa654321/atikova-cop31-retrieval
- Perfil del autor: https://huggingface.co/Sosa654321
- Space complementario "Atikova COP31 Zero Waste & Startup Hub": https://huggingface.co/spaces/Sosa654321/atikova-cop31-zero-waste
