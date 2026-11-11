# larql/gemma-4-12b-it

## Resumen

Gemma 4 12B IT es un modelo de lenguaje de Google (familia Gemma 4, variante instruction-tuned de 12 mil millones de parámetros) que la organización larql redistribuye empaquetado en su formato VINDEX3. El contenedor incluye los pesos originales en BF16 sin modificar, junto con la estructura del modelo expuesta como un grafo ejecutable e inspeccionable. No se trata de un fine-tuning ni de una modificación de pesos, sino de una reempaquetado para el runtime LARQL.

El interés de esta ficha no reside en el modelo base (del que la información disponible no detalla arquitectura, contexto ni datos de entrenamiento), sino en el formato de distribución: VINDEX3 permite ejecutar el modelo con el CLI `larql` y exponerlo mediante una API compatible con OpenAI. Esto facilita la inspección de la estructura interna del modelo y su despliegue en entornos donde se prefiera un runtime alternativo.

La relevancia práctica es limitada pero específica: quien ya use LARQL obtiene un contenedor listo para `pull`, `run`, `chat` y `serve`, con verificación de procedencia documentada. Quien busque el modelo Gemma 4 12B IT canónico debe acudir al repositorio original de Google. El repositorio tiene 24,0 GB, coherente con pesos BF16 de un modelo de 12B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Google Gemma 4; el contenedor expone la estructura como grafo VINDEX3) |
| Parametros totales | 12B (según nombre del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el contenedor incluye pesos BF16 sin modificar) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | BF16 originales empaquetados en contenedor VINDEX3 (runtime LARQL) |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo base (tipo de transformer, número de capas, mecanismo de atención, composición del dataset de entrenamiento, uso de RLHF o DPO). El contenedor VINDEX3 conserva los pesos BF16 originales de `google/gemma-4-12B-it` sin modificación y añade una representación de la estructura del modelo como grafo ejecutable e inspeccionable, lo que permite analizar el modelo y ejecutarlo dentro del runtime LARQL.

El modelo base fue codificado a partir del commit `43c9d014b231474fa7212dbb48a762566c2b255d` de Google, y el contenedor incluye un fichero `PROVENANCE.md` con verificaciones y digests. No se documenta ningún proceso de entrenamiento adicional por parte de larql: la operación es de empaquetado y redistribución, no de ajuste.

## Capacidades

- Generación de texto mediante los comandos `run`, `chat` y `serve` del CLI LARQL.
- Consulta estructurada mediante LQL (lenguaje de consulta propio de LARQL).
- Inspección del modelo con `vindex3 observe`.
- API compatible con OpenAI a través de `larql serve`.
- Los pesos de visión y audio están presentes en el contenedor, pero esta build de LARQL no admite entrada de imagen ni audio para este modelo.
- Soporte de tool calling, agentes, modo thinking o capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Inspección estructural del modelo: usar `vindex3 observe` para examinar el grafo interno de Gemma 4 12B IT con fines de investigación o docencia, aprovechando que la estructura se expone como grafo ejecutable.
- Despliegue de una API compatible con OpenAI: `larql serve gemma-4-12b-it --port 8080` levanta un endpoint que permite integrar el modelo en aplicaciones existentes escritas contra la API de OpenAI sin cambios de cliente.
- Prototipado rápido en local: `larql pull` y `larql run` permiten tener el modelo operativo con dos comandos, útil para pruebas de prompts y evaluación cualitativa antes de montar infraestructura propia.
- Verificación de procedencia de pesos: el contenedor incluye `PROVENANCE.md` con digests, lo que facilita auditorías de cadena de custodia en entornos con requisitos de trazabilidad.
- Experimentación con LQL: consultar el modelo mediante el lenguaje de consulta de LARQL para flujos de análisis estructurado sobre la representación interna.
- Evaluación comparativa de runtimes: ejecutar el mismo Gemma 4 12B IT en LARQL frente a otros runtimes (vLLM, llama.cpp) para medir latencia y throughput en el mismo hardware.
- Base para pipelines de generación de texto en castellano: siempre que se valide previamente el comportamiento del modelo base en ese idioma, ya que la información disponible no confirma los idiomas soportados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 24,0 GB en BF16; la inferencia en BF16 requiere del orden de 24 GB o más de VRAM, sin margen para el contexto. La información disponible no detalla requisitos oficiales.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, un modelo de 12B en BF16 no cabe en GPUs de consumo de 24 GB sin cuantización.
- GPU de consumo: no se confirma compatibilidad; la información disponible no especifica opciones de cuantización para este contenedor.
- Despliegue: runtime LARQL (`larql pull`, `larql run`, `larql chat`, `larql serve` con API compatible con OpenAI). Soporte de vLLM, llama.cpp, Ollama o TGI: no disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| larql/gemma-4-12b-it | 12B | no disponible | Apache 2.0 | VINDEX3 (runtime LARQL) | Pesos BF16 sin modificar, estructura como grafo inspeccionable |
| google/gemma-4-12B-it | 12B | no disponible | Apache 2.0 | no disponible | Modelo base original de Google |
| Otros modelos de ~12B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos para una comparación rigurosa |

La única comparación significativa es con el modelo base de Google: mismo contenido de pesos, distinto formato de distribución y runtime. Cualquier comparación de rendimiento con otros modelos requeriría benchmarks que no están disponibles.

## Limitaciones y advertencias

- El contenedor no admite entrada de imagen ni audio, pese a incluir los pesos correspondientes; es una limitación de esta build de LARQL, no del modelo base.
- No se documentan idiomas soportados; no se puede asumir buen rendimiento en castellano sin evaluarlo.
- No se documentan longitud de contexto, cuantizaciones disponibles ni requisitos de hardware; planificar el despliegue exige pruebas propias.
- El modelo base puede alucinar y presentar sesgos; la información disponible no detalla sesgos conocidos ni evaluaciones de seguridad.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar la licencia oficial de Gemma 4 enlazada por el autor y el `PROVENANCE.md` antes de redistribuir.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica escasa validación por parte de la comunidad.
- Dependencia del runtime LARQL: el contenedor no es directamente consumible por runtimes estándar sin conversión.
- El modelo base es una variante instruction-tuned; el comportamiento en producción depende de los ajustes de prompt y del sistema de plantillas que use LARQL, no documentados aquí.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/larql/gemma-4-12b-it
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Proyecto VINDEX3: https://vindex3.org
- Runtime LARQL: https://github.com/chrishayuk/larql
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Procedencia y digests: PROVENANCE.md dentro del repositorio de Hugging Face
