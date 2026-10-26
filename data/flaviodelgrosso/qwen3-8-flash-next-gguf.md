# flaviodelgrosso/qwen3.8-flash-next-gguf

## Resumen

`flaviodelgrosso/qwen3.8-flash-next-gguf` es un repositorio de cuantizaciones GGUF del modelo `Qwen/Qwen3.8-Flash-Next` (revision `de4b8e4d43b917e7706784d8bb445c9af86a3540`), publicado por el desarrollador flaviodelgrosso. No es una publicacion oficial de Qwen: es una conversion a formatos de baja precision pensada para inferencia local con memoria limitada y para aprovechar la cabeza de prediccion NextN del modelo original mediante decodificacion especulativa.

El modelo de origen tiene 187.604.114.048 parametros (unos 187,6 mil millones), lo que lo situa en la categoria de modelos grandes que solo se pueden servir con cuantizacion agresiva o con hardware de muchos aceleradores. El repositorio incluye dos ficheros: `Qwen3.8-Flash-Next-Q4.gguf` (177.280.286.720 bytes) y `Qwen3.8-Flash-Next-Q2.gguf` (147.207.127.040 bytes), con recetas de cuantizacion mixtas documentadas y sumas SHA-256 publicadas.

Su relevancia ahora es practica: demuestra una receta de cuantizacion reproducible (Q4_K + MXFP4 + Q8_0 para el fichero Q4; IQ2_XXS + Q2_K para el Q2) sobre un modelo base muy grande, conserva la tabla n-gram BF16 original y mantiene embebida la capa NextN, lo que permite experimentar con especulacion en un unico fichero. La contrapartida es que solo existe un runtime documentado (Inferno, del mismo autor) y que la ejecucion del fichero Q2 aun no esta validada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible de forma explicita; la receta de cuantizacion describe expertos "routed" (gate/up/down) y capas "dense", lo que sugiere un transformer con mezcla de expertos (MoE), sin confirmacion en la informacion proporcionada |
| Parametros totales | 187.604.114.048 (dato real, safetensors del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Fichero Q4: Q4_K (gate/up routed) + MXFP4 (down routed, 640 entradas sin padding) + Q8_0 (capas dense). Fichero Q2: IQ2_XXS (gate/up routed) + Q2_K (down routed, padding 640 a 768) en capas troncales 0-47. Ambos conservan la tabla n-gram BF16 original; la capa NextN 48 mantiene Q4_K/MXFP4 a 640 entradas |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-license-1.0 (`license: other`); se aplican condiciones de uso comercial |
| Formato de pesos | GGUF (dos ficheros: Q4 y Q2) |
| Modelo base | Qwen/Qwen3.8-Flash-Next (revision `de4b8e4d43b917e7706784d8bb445c9af86a3540`) |
| Tamano de ficheros | Q4: 177.280.286.720 bytes; Q2: 147.207.127.040 bytes |
| SHA-256 (Q4) | `be134f2db59261c002fd79d4bc6bccac5ba0e23d2980d8c4db520036deaaa380` |
| SHA-256 (Q2) | `db8dbf8891122feb22df1dbb7b3caf430b4814552563219b35dd8b2ad065a1da` |
| SHA-256 de la imatrix (Q2) | `a5863123db1ca458727e738955bef7bfc199520aa2bee3a30142a1aff9254154` (registrada como `quantize.imatrix.sha256` en los metadatos GGUF) |
| Tamano del repositorio | 324,5 GB |
| Descargas / likes | 423 / 0 |
| Fechas | creado 2026-10-24; actualizado 2026-10-25 |

## Arquitectura y entrenamiento

La informacion disponible no incluye una descripcion formal de la arquitectura del modelo base. Lo que si se puede deducir de la receta de cuantizacion es la estructura de capas empleada: un tronco con capas 0-47 y una capa adicional NextN en la posicion 48. Las capas del tronco contienen modulos "routed" con proyecciones gate/up/down, es decir, un esquema de enrutamiento por expertos, acompanados de capas "dense" cuantizadas en Q8_0. El fichero Q2 aplica 2 bits a las proyecciones enrutadas del tronco pero mantiene la capa NextN en Q4_K/MXFP4, un compromiso para no degradar la cabeza de especulacion.

El elemento tecnico mas destacable es la capa NextN embebida en el propio GGUF, que actua como cabeza de prediccion multi-token y permite decodificacion especulativa sin un modelo drafter separado. El runtime Inferno la explota con el flag `--speculation opportunistic|exact`. Ademas, ambos ficheros incorporan la tabla n-gram BF16 copiada del modelo original, lo que sugiere soporte de decodificacion asistida por n-gramas dentro del mismo artefacto. Para el fichero Q2 se uso una imatrix cuya huella SHA-256 queda registrada en los metadatos, lo que hace la receta auditable y reproducible.

No hay datos sobre volumen de tokens de entrenamiento, composicion del dataset, ni sobre etapas de alineacion (RLHF, DPO u otras) del modelo base. Tampoco se documenta el significado del tag `qwen4exp` mas alla de su presencia en los metadatos del repositorio.

## Capacidades

- Generacion de texto: el pipeline declarado es `text-generation` y el repositorio esta etiquetado como `conversational`.
- Conversacion multi-turno: la etiqueta `conversational` indica uso previsto en dialogos, aunque no se detallan ventanas de contexto ni limites.
- Inferencia via endpoints: el tag `endpoints_compatible` sugiere compatibilidad con APIs de inferencia, sin especificar que implementacion.
- Decodificacion especulativa: la capa NextN embebida permite modos `opportunistic` y `exact` en Inferno.
- Recuperacion asistida por n-gramas: la tabla n-gram BF16 del modelo original se conserva en ambos ficheros.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; el repositorio no declara lista de idiomas.
- Vision, audio u otras modalidades: no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia local en Apple Silicon con memoria unificada grande: el autor documenta ejecucion residente de aproximadamente 70 GiB con el fichero Q4 mediante `inferno serve --model Qwen3.8-Flash-Next-Q4.gguf`, lo que permite servir el modelo en un equipo de sobremesa de gama alta sin cluster de GPU.
- Experimentacion con decodificacion especulativa: al llevar la cabeza NextN embebida, el fichero sirve para medir la ganancia de los modos `opportunistic` y `exact` frente a decodificacion autoregresiva pura, sin necesidad de alojar un drafter aparte.
- Evaluacion de cuantizacion extrema en modelos MoE: comparar la calidad del fichero Q2 (IQ2_XXS + Q2_K con padding 640 a 768) frente al Q4 (Q4_K + MXFP4) permite estudiar como degrada cada tipo de tensor al bajar de 4 a 2 bits, con la imatrix documentada y verificable.
- Despliegue en entornos aislados (air-gapped): al ser un artefacto unico en GGUF, se puede transferir por medios fisicos y ejecutar sin descargas adicionales, verificando integridad con los SHA-256 publicados.
- Modelo profesor para destilacion: con 187,6 mil millones de parametros, puede generar corpus sinteticos de alta calidad en pipelines offline donde el coste por token no es critico.
- Reproducibilidad de pipelines de cuantizacion: las recetas por capas y el hash de la imatrix permiten reconstruir el proceso y auditar conversiones propias sobre el mismo modelo base.
- Analisis de trazabilidad de artefactos: el registro de revision del modelo base y de sumas SHA-256 facilita incorporar el fichero a un catalogo interno con control de procedencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni de perplejidad comparativa entre los ficheros Q4 y Q2, ni datos de throughput o latencia medidos.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero Q4 ocupa 177,3 GB y el Q2 147,2 GB; a efectos practicos se necesita al menos ese volumen de memoria de acelerador (o memoria unificada) mas el espacio de cache KV, cuyo tamano no se documenta.
- GPU recomendadas: no se indica ninguna configuracion validada. Por volumen de memoria, el Q4 requiere un conjunto multi-GPU de clase datacenter (por ejemplo, agregados de 8x80 GB o 4x141 GB) o memoria unificada de gran capacidad; no hay pruebas publicadas en la informacion proporcionada.
- GPU consumer: no cabe en ninguna GPU consumer individual (24 GB o menos). Tampoco en configuraciones de 2 o 4 tarjetas de 24 GB, dado el tamano de los ficheros.
- Apple Silicon: el autor reporta unos 70 GiB residentes para el fichero Q4 con Inferno, muy por debajo del tamano del fichero, lo que implica mapeo desde almacenamiento; conviene disponer de SSD NVMe rapido y RAM suficiente. Este dato es del autor y no se acompana de mediciones de latencia.
- Opciones de despliegue: Inferno (repositorio del autor), con `inferno serve` y los modos de especulacion `--speculation opportunistic|exact`. No hay soporte documentado para llama.cpp, Ollama, vLLM ni TGI en la informacion disponible.
- Estado de validacion: el fichero Q2 es aceptado por Inferno segun la estructura de su cabecera, pero la ejecucion de Q2 "no esta validada" segun la propia model card.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3.8-flash-next-gguf (Q4) | 187,6 mil millones | no disponible | GGUF, 177,3 GB | qwen-community-license-1.0 | HuggingFace, 423 descargas |
| qwen3.8-flash-next-gguf (Q2) | 187,6 mil millones | no disponible | GGUF, 147,2 GB | qwen-community-license-1.0 | HuggingFace, ejecucion Q2 sin validar en Inferno |
| Qwen/Qwen3.8-Flash-Next (base) | 187.604.114.048 | no disponible | safetensors (pesos originales en BF16) | qwen-community-license-1.0 | HuggingFace, revision `de4b8e4d` |
| Otras alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de otros modelos de la misma categoria con los que establecer una comparacion de rendimiento, contexto o throughput.

## Limitaciones y advertencias

- No es una publicacion oficial de Qwen: se trata de una conversion de terceros, sin aval del equipo original del modelo.
- La licencia es `other` (Qwen Community License 1.0). Se aplican condiciones de uso comercial que deben revisarse en el fichero `LICENSE` antes de cualquier despliegue en produccion.
- El fichero Q2 no esta validado en ejecucion: Inferno lo admite por la estructura de cabecera, pero el propio autor advierte que la ejecucion a 2 bits no se ha comprobado. No es apto para produccion sin validacion propia.
- Solo hay un runtime documentado (Inferno, proyecto personal del mismo autor). No se confirma compatibilidad con llama.cpp, Ollama, vLLM ni TGI, lo que limita las opciones de integracion y el soporte de la comunidad.
- Riesgo de degradacion por cuantizacion: el Q2 aplica 2 bits a las proyecciones enrutadas del tronco (capas 0-47) y usa padding de 640 a 768 entradas; no se publican metricas de perplejidad ni de calidad que cuantifiquen la perdida.
- La discrepancia entre el tamano del fichero Q4 (177,3 GB) y la memoria residente reportada (~70 GiB) implica dependencia de mapeo desde disco; el rendimiento dependera de la velocidad del almacenamiento, no solo de la RAM.
- No hay informacion sobre longitud de contexto, idiomas soportados ni calidad multilingue; no se puede asumir cobertura de castellano.
- No se han publicado benchmarks: cualquier afirmacion de rendimiento relativo frente al modelo base seria especulativa.
- Riesgo de alucinacion: inherente a los modelos generativos de esta familia y no cuantificado en la informacion disponible; se agrava potencialmente con cuantizaciones de 2 bits.
- Sesgos: no documentados. Al no detallarse la composicion del dataset de entrenamiento, no es posible evaluar sesgos conocidos.
- Procedencia y validacion comunitaria bajas: 0 likes y 423 descargas en el momento de la consulta. Conviene verificar los SHA-256 publicados antes de usar los ficheros.
- El tag `qwen4exp` no esta documentado en la model card, por lo que no se puede determinar su significado tecnico.
- El repositorio ocupa 324,5 GB: requiere planificacion de almacenamiento y ancho de banda de descarga considerables.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/flaviodelgrosso/qwen3.8-flash-next-gguf
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Runtime Inferno: https://github.com/flaviodelgrosso/inferno
- Licencia del modelo (referenciada como `LICENSE` en el repositorio): https://huggingface.co/flaviodelgrosso/qwen3.8-flash-next-gguf/blob/main/LICENSE
- Fichero Q4: https://huggingface.co/flaviodelgrosso/qwen3.8-flash-next-gguf/blob/main/Qwen3.8-Flash-Next-Q4.gguf
- Fichero Q2: https://huggingface.co/flaviodelgrosso/qwen3.8-flash-next-gguf/blob/main/Qwen3.8-Flash-Next-Q2.gguf
