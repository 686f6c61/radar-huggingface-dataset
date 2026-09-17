# mradermacher/Pirate-Poisoned-Qwen3.5-4B-v1.0-GGUF

## Resumen

Pirate-Poisoned-Qwen3.5-4B-v1.0-GGUF es un repositorio de cuantizaciones estaticas en formato GGUF generadas por mradermacher a partir del modelo shreyanth/Pirate-Poisoned-Qwen3.5-4B-v1.0. No se trata de un modelo entrenado por el autor del repositorio, sino de una conversion de pesos a multiples niveles de cuantizacion para su uso con motores de inferencia locales como llama.cpp u Ollama. El repositorio pesa 38,9 GB porque incluye doce variantes de cuantizacion distintas del mismo modelo.

El modelo de origen tiene 4.205.751.296 parametros (aproximadamente 4,2 mil millones), lo que lo situa en la gama de modelos pequenos aptos para hardware de consumo. El nombre sugiere una adaptacion de la familia Qwen (etiquetada como "Qwen3.5-4B") con un ajuste de estilo o persona "pirata" y alguna forma de alteracion deliberada de comportamiento ("poisoned"), pero la model card no documenta ni el entrenamiento, ni el dataset, ni la naturaleza de esa alteracion, por lo que estas inferencias no estan confirmadas por el autor.

La relevancia de esta ficha es principalmente practica: permite desplegar un modelo conversacional de ~4B en equipos sin GPU dedicada o con GPU de gama media, eligiendo el equilibrio entre calidad y consumo de memoria entre doce cuantizaciones. Ahora bien, el repositorio no publica licencia, idiomas, benchmarks ni evaluacion alguna, y acumula cero descargas y cero likes, por lo que debe considerarse material experimental sin garantias para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre indica familia Qwen, sin confirmar) |
| Parametros totales | 4.205.751.296 (4,21B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el modelo de origen) |
| Tamano del repositorio | 38,9 GB (todas las cuantizaciones incluidas) |
| Modelo de origen | shreyanth/Pirate-Poisoned-Qwen3.5-4B-v1.0 |
| Tipo de conversion | hf (segun metadatos de la model card) |
| Version de cuantizacion | quantize_version: 2; output_tensor_quantised: 1 |
| Etiquetas | gguf, endpoints_compatible, region:us, conversational |
| Fecha de creacion (metadatos) | 2026-09-17 |
| Fecha de actualizacion (metadatos) | 2026-09-17 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No hay informacion publicada sobre la arquitectura interna del modelo de origen en la documentacion disponible. Lo unico verificable es el recuento de parametros (4.205.751.296) y que el proceso aplicado por mradermacher es una conversion desde pesos en formato HuggingFace a GGUF con cuantizacion de tensores de salida (output_tensor_quantised: 1, quantize_version: 2). El nombre del repositorio apunta a la familia Qwen en su variante de 4B etiquetada como "Qwen3.5", pero no se aporta ninguna confirmacion de que se trate de esa arquitectura concreta ni de sus caracteristicas (numero de capas, dimension de atencion, tipo de atencion, etc.).

Tampoco se documenta el entrenamiento: no se indica numero de tokens, composicion del dataset, si hubo ajuste supervisado, RLHF, DPO u otra tecnica de alineamiento, ni en que consiste el componente "Pirate" (estilo/persona) o "Poisoned" (posible alteracion deliberada del comportamiento) del nombre. No se ha publicado informacion sobre innovaciones tecnicas asociadas (decodificacion especulativa, atencion lineal, mezcla de expertos, etc.). Cualquier afirmacion al respecto seria especulativa.

## Capacidades

- Generacion de texto conversacional: la etiqueta "conversational" y el pipeline declarado en los metadatos indican uso orientado a dialogo multi-turno.
- Estilo o persona especifica: el nombre del modelo sugiere un registro de habla "pirata", aunque no hay documentacion que describa su comportamiento real ni su consistencia.
- Compatibilidad con endpoints: la etiqueta "endpoints_compatible" indica que el repositorio esta preparado para desplegarse mediante HuggingFace Inference Endpoints con los pesos GGUF.
- Ejecucion local: al estar en formato GGUF, es compatible con motores de inferencia en CPU y GPU de consumo (llama.cpp, Ollama y derivados).
- Capacidades multilingues: no disponible. No se declara ninguna lista de idiomas.
- Tool calling / function calling: no disponible. No se documenta soporte de herramientas.
- Razonamiento multi-paso y uso como agente: no disponible. No se documenta ningun modo de razonamiento extendido ni soporte de agentes.
- Vision, audio, thinking mode: no disponible. No se declara ninguna capacidad multimodal ni modo de pensamiento.

## Casos de uso

- Asistente conversacional totalmente local: con cuantizaciones Q4_K_M o IQ4_XS el modelo ocupa aproximadamente 2,5 GB de pesos, por lo que puede ejecutarse en un portatil con 8 GB de RAM mediante llama.cpp u Ollama sin conexion a Internet, lo que resulta util cuando la privacidad del contenido conversacional es un requisito.
- Prototipado de personajes y narrativa interactiva: la denominacion "Pirate" indica un ajuste de estilo aprovechable para experimentar con voces narrativas marcadas en demos de roleplay o ficcion interactiva, siempre que se valide manualmente la coherencia del personaje, ya que no existe evaluacion publicada.
- Investigacion sobre robustez y seguridad de modelos: un modelo etiquetado como "poisoned" puede emplearse como sujeto de estudio en experimentos controlados sobre manipulacion de comportamiento, sesgos inducidos o fallos de alineamiento, siempre en entornos aislados y sin exposicion a usuarios finales.
- Comparativa del impacto de la cuantizacion: el repositorio ofrece doce variantes del mismo modelo (desde Q2_K hasta x-f16), lo que permite medir de forma controlada como degrada la calidad de salida cada nivel de cuantizacion sobre un mismo prompt de referencia.
- Despliegue en hardware de bajo consumo: en formato Q3_K_S o Q2_K los pesos bajan de los 2 GB, lo que habilita inferencia en mini-PC, placas SBC con 8 GB de RAM o contenedores con limite estricto de memoria, a costa de una perdida de calidad no cuantificada.
- Generacion de texto para tareas creativas por lotes en CPU: al no requerir GPU, el modelo puede encolarse en un servidor sin acelerador para tareas de generacion de borradores, variaciones de texto o reescritura estilistica donde la latencia no sea critica.
- Prueba de integracion en pipelines de despliegue: la etiqueta "endpoints_compatible" permite usar el repositorio para validar el flujo de empaquetado y servicio de modelos GGUF en HuggingFace Inference Endpoints antes de migrar a un modelo con licencia y evaluacion documentadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio se limita a la linea "static quants of https://huggingface.co/shreyanth/Pirate-Poisoned-Qwen3.5-4B-v1.0" junto con los metadatos de cuantizacion, y no incluye valores de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, ni para el modelo de origen ni para las cuantizaciones derivadas.

## Requisitos de hardware

Las cifras de VRAM que siguen son estimaciones calculadas a partir del recuento de parametros declarado (4.205.751.296) y del numero de bits por peso tipico de cada cuantizacion; no proceden de mediciones publicadas por el autor.

| Cuantizacion | Pesos estimados | VRAM/RAM estimada con overhead | Notas |
|---|---|---|---|
| Q2_K | ~1,4 GB | ~2 GB | Maxima compresion, degradacion no evaluada |
| Q3_K_S / Q3_K_M / Q3_K_L | ~1,7-2,0 GB | ~2,5-3 GB | Apto para equipos con 4 GB |
| IQ4_XS | ~2,3 GB | ~3 GB | Cuantizacion con calibracion por importancia |
| Q4_K_S / Q4_K_M | ~2,5-2,7 GB | ~3-4 GB | Punto de equilibrio habitual en 4B |
| Q5_K_S / Q5_K_M | ~2,9-3,1 GB | ~4 GB | Mejor fidelidad con coste moderado |
| Q6_K | ~3,5 GB | ~4,5 GB | Cercano a la calidad de Q8 |
| Q8_0 | ~4,5 GB | ~5-6 GB | Cuasi sin perdida respecto a F16 |
| x-f16 | ~8,4 GB | ~9-10 GB | Precision completa, requiere GPU de 12 GB o RAM equivalente |

- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 8/16 GB, RTX 4070, RTX 4090 o superiores para las variantes de mayor precision; para Q4_K_M basta una GPU de 6-8 GB.
- Cabe en GPU de consumo: si. Las cuantizaciones Q2_K a Q5_K_M caben en tarjetas de 6-8 GB; Q6_K y Q8_0 encajan en 8-12 GB; x-f16 requiere 12 GB o mas, o bien ejecucion en CPU con RAM suficiente.
- Despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, llama-cpp-python y servidores compatibles con GGUF. La etiqueta endpoints_compatible apunta a HuggingFace Inference Endpoints. vLLM y TGI tienen soporte de GGUF limitado o experimental, por lo que no se pueden garantizar sin verificacion.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo para ninguna de las cuantizaciones.

## Comparativa con modelos similares

No se dispone de datos comparativos verificables en la informacion proporcionada. La busqueda web realizada no devolvio ningun resultado relacionado con el modelo (los resultados obtenidos trataban sobre las islas Falkland/Malvinas y no guardan relacion alguna). La unica comparacion posible es entre el repositorio de cuantizaciones y su modelo de origen:

| Modelo | Parametros | Contexto | Formato de pesos | Cuantizaciones | Licencia | Benchmarks |
|---|---|---|---|---|---|---|
| mradermacher/Pirate-Poisoned-Qwen3.5-4B-v1.0-GGUF (este repositorio) | 4,21B | no disponible | GGUF | 12 variantes | no disponible | no disponible |
| shreyanth/Pirate-Poisoned-Qwen3.5-4B-v1.0 (origen) | 4,21B | no disponible | safetensors (segun proceso de conversion) | no disponible | no disponible | no disponible |
| Alternativas de ~4B de otros fabricantes | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se incluyen modelos alternativos concretos porque no hay en la informacion proporcionada ningun dato de arquitectura, contexto, licencia o rendimiento de terceros que permita una comparacion rigurosa.

## Limitaciones y advertencias

- Licencia no declarada: al no especificarse licencia, no puede asumirse permiso de uso comercial. Ademas, el modelo deriva de un ajuste sobre lo que el nombre identifica como familia Qwen, cuyos terminos de uso originales habria que verificar en el repositorio de origen.
- Modelo experimental sin evaluacion: cero descargas y cero likes, model card minima y ausencia total de benchmarks. No hay evidencia publicada de su calidad, coherencia o seguridad.
- Comportamiento "poisoned" no documentado: si el nombre refleja una alteracion deliberada del comportamiento (por ejemplo, sesgos inyectados o filtros de seguridad retirados), el modelo podria producir contenido danino, ofensivo o factualmente incorrecto. Debe tratarse como material de investigacion y no exponerse a usuarios finales sin filtros adicionales.
- Riesgo de alucinacion: inherente a un modelo de 4,2B de parametros; se agrava en las cuantizaciones mas agresivas (Q2_K, Q3_K_S), donde la degradacion de calidad no esta medida.
- Idioma y contexto desconocidos: no se declara lista de idiomas ni longitud de contexto soportada. No puede asumirse un buen rendimiento en castellano ni ventanas largas.
- Degradacion por cuantizacion: las variantes por debajo de Q4 pueden perder capacidad de seguir instrucciones o mantener coherencia en conversaciones largas. No hay evaluacion comparativa entre variantes.
- Inconsistencias en los metadatos: las fechas de creacion y actualizacion (2026-09-17) son posteriores a la fecha habitual de publicacion y no se corresponden con ningun anuncio verificable; conviene tratarlas con cautela.
- Sin soporte documentado de herramientas ni agentes: no se puede asumir tool calling, function calling ni razonamiento multi-paso fiable para pipelines automatizados.
- Adecuacion a produccion: no recomendado como componente critico sin una evaluacion propia previa (calidad, latencia, seguridad y cumplimiento de licencia).

## Enlaces

- Repositorio HuggingFace de las cuantizaciones: https://huggingface.co/mradermacher/Pirate-Poisoned-Qwen3.5-4B-v1.0-GGUF
- Modelo de origen (pesos completos): https://huggingface.co/shreyanth/Pirate-Poisoned-Qwen3.5-4B-v1.0
- Perfil del autor de las cuantizaciones: https://huggingface.co/mradermacher
- Paper, blog o demo oficial: no disponible.
- Repositorio de codigo: no disponible.
- Busqueda web: no se han encontrado resultados relevantes. Los unicos resultados devueltos trataban sobre las islas Falkland/Malvinas (articulos de Wikipedia y guias de viaje) y no guardan ninguna relacion con el modelo.
