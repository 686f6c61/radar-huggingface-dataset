# Aser01/franco-egyptian-arabizi

## Resumen

Franco-egyptian-arabizi es un sistema de transliteracion que convierte arabe egipcio escrito en alfabeto latino con digitos (franco-arabizi, por ejemplo `ana 3ayz aroo7 el gam3a`) a escritura arabe nativa (`أنا عايز أروح الجامعة`), preservando el dialecto egipcio. Lo desarrolla Aser01 como proyecto de curso de la asignatura de PLN de la Universidad de El Cairo (otoño de 2026), y se publica bajo el pipeline de traduccion en Hugging Face.

El sistema no es un unico modelo, sino un ensemble de cinco modelos entrenados desde cero (sin pesos preentrenados ni datos externos) sobre el corpus del curso: tres variantes de un Transformer de caracteres de 46,7 millones de parametros (6+6 capas, anchura 512, algunas con busqueda por haz) y dos variantes de un encoder de 10 capas con salida CTC. La combinacion se realiza por voto a nivel de caracter tras alineamiento de Levenshtein, con entradas divididas en fragmentos de 224 caracteres.

Su relevancia es practica: el arabizi es la forma habitual de escribir arabe egipcio en redes sociales y mensajeria, y disponer de un transliterador especifico de dialecto (frente a los sistemas de traduccion hacia arabe estandar) permite normalizar texto informal para su uso en pipelines de NLP, busqueda o analisis. El repo ocupa 0,9 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble de 5 modelos: Transformer de caracteres (encoder-decoder, 6+6 capas, anchura 512), encoder de 10 capas con salida CTC, y variantes con media de checkpoints (avg_*) |
| Parametros totales | 46,7 M (modelo `r3_char_big`); no disponible para el resto de componentes |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Fragmentos de 224 caracteres (entrada troceada); no se especifica ventana mayor |
| Tipos de cuantizacion | int8 para el demo online (`r3_tctc`); no se detallan otras cuantizaciones |
| Idiomas soportados | Arabe egipcio (arz), tanto en grafia latina (arabizi) como en escritura arabe |
| Licencia | no disponible |
| Formato de pesos | No especificado en la informacion disponible; el bundle se descarga con `huggingface_hub` y se valida con hashes SHA-256 en `pipeline.json` |

## Arquitectura y entrenamiento

El sistema combina cinco componentes: `r3_char_big_beam4` (busqueda por haz de anchura 4), `r3_tctc`, `avg_r3_tctc`, `avg_r3_char_big` y `avg_r3_char_big448_beam4` (haz 4). El modelo de caracteres `r3_char_big` es un Transformer de 6 capas de encoder y 6 de decoder con anchura 512 (46,7 M de parametros); `r3_tctc` es un encoder de 10 capas de self-attention con cabeza CTC. Las variantes `avg_*` son la media de los ultimos cuatro checkpoints, una tecnica de promediado de pesos que suele estabilizar la salida y reducir el CER. La decodificacion final no usa un unico modelo: se alinean las cinco salidas por Levenshtein contra la primera y se toma la mayoria por posicion de caracter.

El entrenamiento se realizo integramente desde inicializacion aleatoria, solo con el dataset proporcionado en el curso (Universidad de El Cairo, NLP, otoño de 2026), sin modelos preentrenados ni datos externos. No se especifica el numero de tokens ni la composicion exacta del corpus. Tampoco se indica si hubo RLHF, DPO u otro ajuste posterior; dada la naturaleza del proyecto, cabe suponer entrenamiento supervisado directo sobre pares franco-arabe, pero no esta documentado. La segmentacion de entradas en bloques de 224 caracteres es la unica estrategia de manejo de longitud descrita.

## Capacidades

- Transliteracion de arabe egipcio en grafia franco-arabizi a escritura arabe, manteniendo el registro dialectal (no normaliza a arabe estandar).
- Manejo de la convencion de digitos del arabizi que representan fonemas arabes (3 = ain, 7 = ha, etc.), segun se desprende del ejemplo de la model card.
- Procesamiento por lotes de ficheros mediante el comando `submit` sobre CSV con columnas ID y Franco.
- Prediccion de linea de comandos con el comando `predict` para texto individual.
- Version int8 ejecutable en navegador (demo en Spaces) del componente `r3_tctc`.
- Verificacion de integridad de los pesos mediante SHA-256 antes de predecir.
- No soporta tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito segun la informacion disponible.
- No se documentan capacidades multilingues mas alla del arabe egipcio.

## Casos de uso

- Normalizacion de texto en redes sociales y mensajeria: convertir mensajes en arabizi a escritura arabe para alimentar analisis de sentimiento o topic modeling sobre corpus egipcios, evitando perder el dialecto al pasar por un traductor generico.
- Preprocesamiento para motores de busqueda en dialecto: indexar contenido en arabizi como texto arabe para que las consultas en escritura nativa encuentren publicaciones escritas en franco.
- Moderacion de contenido: normalizar comentarios en arabizi a grafia arabe antes de aplicar clasificadores de toxicidad o filtros entrenados sobre texto arabe.
- Construccion de corpus paralelos: generar pares franco-arabe a partir de grandes volumenes de texto informal (comandos `submit` sobre CSV) para entrenar otros modelos de dialecto.
- Enriquecimiento de datasets de conversacion: alinear transcripciones de chat egipcio con su forma arabe para tareas de normalizacion o correccion.
- Digitalizacion y preservacion linguistica: convertir archivos de comunicacion informal egipcia a escritura estandar para archivo o estudio linguistico del dialecto.
- Prototipado rapido con demo int8 en navegador: validar la calidad de la transliteracion sobre muestras pequenas antes de desplegar el ensemble completo.

## Benchmarks y rendimiento

| Evaluacion | CER | WER |
|---|---|---|
| Seleccion, 512 documentos de dev | 10,31 % | 18,23 % |
| Test interno, 5.525 documentos (evaluado una sola vez) | 9,40 % | 17,25 % |
| `r3_tctc` aislado sobre documentos de seleccion | 10,49 % | no disponible |

El sistema completo mejora ligeramente al mejor componente individual (`r3_tctc`, 10,49 % CER) gracias al voto por caracter, a costa de ejecutar cinco modelos. No se han publicado comparaciones con otros sistemas de transliteracion en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 46,7 M de parametros en el componente mayor y varios modelos de tamano similar, el ensemble completo en fp32 deberia caber en torno a 1-2 GB de memoria, aunque esta cifra no la proporciona el autor.
- GPU recomendadas: no especificadas; por tamano, cualquier GPU consumer reciente (RTX 3060 o superior) deberia ser suficiente para el ensemble y muy sobrada para `r3_tctc`.
- Cabe en GPU consumer: previsiblemente si, dado el tamano (0,9 GB de repo y decenas de millones de parametros), aunque el autor no lo confirma.
- Opciones de despliegue: paquete Python propio (`python -m arabizi`) con dependencias de `torch`, `numpy`, `rapidfuzz`, `scikit-learn` y `huggingface_hub`; version int8 en el navegador via el Space de demostracion. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; la model card solo senala que `r3_tctc` es "mucho mas rapido" que el ensemble completo.

## Comparativa con modelos similares

No se dispone de comparaciones publicadas con otros transliteradores de arabizi en la informacion proporcionada.

| Modelo | Parametros | Contexto | CER (dev) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| franco-egyptian-arabizi (ensemble) | 46,7 M por componente principal | fragmentos de 224 caracteres | 10,31 % | no disponible | Hugging Face (repo + Space) |
| `r3_tctc` (componente) | no disponible | fragmentos de 224 caracteres | 10,49 % | no disponible | incluido en el mismo bundle |
| Otros transliteradores arabizi | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Proyecto de curso academico con entrenamiento desde cero y solo sobre el corpus del curso: la cobertura lexica y dialectal probablemente sea limitada frente a datos reales de redes sociales.
- CER de en torno al 9-10 % implica errores de caracter en aproximadamente uno de cada diez caracteres, lo que puede degradar terminos propios, nombres y jerga no vista.
- Restringido al dialecto egipcio (arz); no se documenta su comportamiento con otros dialectos arabes ni con arabe estandar.
- Sin licencia declarada: no se puede asumir permiso para uso comercial sin consultar al autor.
- Manejo de entradas largas limitado a fragmentos de 224 caracteres; no se describe estrategia de solapamiento o reconstruccion entre bloques.
- El ensemble requiere ejecutar cinco modelos, lo que multiplica el coste de inferencia frente a usar solo `r3_tctc`.
- Riesgo de alucinacion no evaluado; al ser un modelo caracter a caracter, los errores se manifiestan como sustituciones u omisiones mas que como contenido inventado.
- La validacion SHA-256 hace que cualquier modificacion de los ficheros del bundle impida la prediccion, lo que puede complicar adaptaciones o reempaquetados.
- Fechas del repo (creado en noviembre de 2026) y del curso (otoño de 2026) resultan atipicas; conviene verificar la vigencia y madurez del proyecto antes de usarlo en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Aser01/franco-egyptian-arabizi
- Demo en Spaces: https://huggingface.co/spaces/Aser01/franco-egyptian-arabizi-demo
- Repositorio o paper: no disponible
