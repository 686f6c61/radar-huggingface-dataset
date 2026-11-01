# omegazurich/Qwen3.8-27B-Halloween-Terror-Heretic-Uncensored-source

## Resumen

Qwen3.8-27B-Halloween-Terror-Heretic-Uncensored-source es un ajuste fino (finetune) publicado por el usuario omegazurich sobre el modelo trohrbaugh/Qwen3.8-27B-heretic-ara, que a su vez deriva de la familia Qwen. El modelo se presenta como una variante "abliterated" y "uncensored" orientada a generacion creativa de terror, tematica de Halloween, escritura de ficcion, roleplay y simulacion de personajes malvados ("EVIL AI Constructs"). El autor declara 13 modos de razonamiento, 13 modos de instruccion y una capa de personalizacion bautizada como "Turbo-Brilliance Evil Ed" y "Halloween O/S".

Con 27.356.728.560 parametros (unos 27,36 mil millones) y un repositorio de 55,6 GB en formato safetensors, el modelo se distribuye bajo licencia Apache 2.0, pero con acceso restringido (gated) en HuggingFace: es necesario aceptar condiciones antes de descargarlo. La ficha tecnica oficial es escasa: no se detallan la longitud de contexto, la composicion del dataset de ajuste ni resultados de benchmarks, por lo que buena parte de las especificaciones habituales quedan como "no disponible".

Su relevancia actual es acotada y muy especifica: cubre un nicho de modelos sin censura para narrativa de terror y roleplay, un segmento con demanda entre creadores de contenido y desarrolladores de videojuegos conversacionales. No obstante, la ausencia de documentacion tecnica, la falta de evaluaciones publicadas y el caracter gated del repositorio limitan seriamente su uso en produccion sin una validacion previa por parte del equipo que lo adopte.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer multimodal (image-text-to-text); tag de libreria `qwen3_5`, sin detalle publicado de la variante exacta |
| Parametros totales | 27.356.728.560 (aproximadamente 27,36 mil millones) |
| Parametros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo solo publica safetensors; no se listan GGUF ni AWQ) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Acceso | restringido (gated): requiere aceptar condiciones en HuggingFace |
| Tamano del repositorio | 55,6 GB |
| Modelo base | trohrbaugh/Qwen3.8-27B-heretic-ara (finetune del mismo) |
| Pipeline declarado | image-text-to-text |
| Fecha de creacion | 2026-11-01 |

## Arquitectura y entrenamiento

El modelo se apoya en una arquitectura transformer de la familia Qwen (el tag de libreria indica `qwen3_5`), con capacidad multimodal de entrada imagen-texto segun el pipeline declarado. El dato verificable es el numero de parametros (27,36 mil millones) y el formato de pesos safetensors; el resto de la arquitectura (numero de capas, dimension oculta, mecanismo de atencion, tipo de tokenizador) no esta documentado en la informacion disponible.

El entrenamiento consiste en un ajuste fino sobre trohrbaugh/Qwen3.8-27B-heretic-ara, un modelo ya etiquetado como "heretic", lo que en la practica suele implicar tecnicas de abliteration (eliminacion o supresion de direcciones de rechazo en el espacio de activaciones) para reducir las negativas del modelo a peticiones sensibles. Sobre esa base, omegazurich aplica un finetune orientado a tematica de terror y Halloween, con modos adicionales de razonamiento e instruccion. No se especifican el volumen de tokens de entrenamiento, la composicion del dataset, ni si se emplearon RLHF, DPO u otras tecnicas de alineacion. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto en ingles con enfasis en narrativa de terror, ficcion y escritura creativa de genero.
- Modo de razonamiento ("thinking") y modos de instruccion declarados por el autor (13 reasoning modes y 13 instruct modes segun los tags).
- Capacidad multimodal de entrada imagen-texto, segun el pipeline declarado en HuggingFace.
- Roleplay y simulacion conversacional de personajes, incluidos los denominados "EVIL AI Constructs" por el autor.
- Escritura de historia y ficcion en multiples generos, segun los tags del repositorio.
- Conversacion multi-turno orientada a personajes y escenarios.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso mas alla del modo thinking declarado.
- Capacidades multilingues limitadas al ingles segun el campo de idiomas.
- No se declaran capacidades de audio.

## Casos de uso

- Escritura de ficcion de terror: el modelo puede generar relatos, dialogos y descripciones atmosfericas dentro del genero, aprovechando el finetune tematico de Halloween para mantener tono y estilo consistentes en textos largos por capitulos.
- Roleplay conversacional para videojuegos narrativos: sirve para dar vida a personajes antagonistas o entidades malignas en aventuras conversacionales, con respuestas coherentes dentro de un personaje definido por el disenador.
- Prototipado de experiencias interactivas de Halloween: util para generar contenido dinamico en instalaciones, escape rooms o eventos tematicos donde se requiere texto generado en tiempo real con un tono concreto.
- Generacion de dialogos para mods y contenido de comunidad: desarrolladores de mods de terror pueden emplearlo para producir lineas de dialogo y descripciones de objetos o escenarios.
- Investigacion sobre modelos sin censura: permite estudiar el comportamiento de modelos abliterated en tareas creativas y analizar como la supresion de rechazos afecta a la calidad y coherencia del texto generado.
- Asistencia creativa para guionistas y autores de genero: como generador de borradores y variantes de escenas, con la salvedad de que la salida requiere revision editorial por las limitaciones descritas mas abajo.
- Descripcion de imagenes con sesgo narrativo: gracias a la entrada imagen-texto declarada, puede emplearse para convertir imagenes en descripciones atmosfericas dentro de una narracion, aunque no hay evaluacion publicada de esta capacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (BF16/FP16): aproximadamente 55 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica requiere GPUs de 80 GB (A100 80GB, H100 80GB) o multi-GPU.
- Cuantizacion a 8 bits: en torno a 28-30 GB de VRAM, viable en una RTX 4090 de 24 GB solo con cuantizaciones mas agresivas o con offload parcial.
- Cuantizacion a 4 bits: aproximadamente 14-16 GB de pesos, lo que permitiria ejecucion en una RTX 4090 (24 GB) o RTX 3090 (24 GB), con margen para cache KV segun la longitud de contexto.
- No cabe en GPUs consumer de 8-12 GB ni en configuraciones de 16 GB sin cuantizacion adicional y offload a RAM.
- Opciones de despliegue: el repositorio solo publica safetensors y libreria transformers, por lo que la via directa es transformers con aceleracion (CUDA, FlashAttention si el modelo la soporta). Para vLLM, llama.cpp, Ollama o TGI seria necesario generar cuantizaciones propias, ya que no se distribuyen en el repo.
- Latencia y throughput: no disponibles; no se han publicado mediciones.
- El acceso gated implica que cualquier pipeline automatizado debe gestionar el token de HuggingFace y la aceptacion previa de condiciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-Halloween-Terror-Heretic-Uncensored-source | 27,36 B | no disponible | Apache 2.0 | Gated | Finetune tematico sin benchmarks publicados |
| trohrbaugh/Qwen3.8-27B-heretic-ara (modelo base) | no disponible | no disponible | no disponible | no disponible | Base directa del finetune; sin datos tecnicos publicados en la informacion disponible |
| Qwen3-30B-A3B (referencia de familia) | 30 B totales, ~3 B activos | no disponible | Apache 2.0 | Abierto | Alternativa MoE de la misma familia; datos no verificados en esta busqueda |

No se dispone de informacion suficiente para establecer comparaciones cuantitativas de rendimiento con alternativas de la misma categoria.

## Limitaciones y advertencias

- Modelo "uncensored" y "abliterated": la supresion de rechazos implica un riesgo elevado de generar contenido ofensivo, violento o inapropiado sin filtros; no es apto para aplicaciones orientadas al publico general sin una capa de moderacion externa.
- Solo soporta ingles; no se ha validado su comportamiento en castellano ni en otros idiomas.
- Riesgo de alucinacion no cuantificado: al no existir benchmarks ni evaluaciones publicadas, no hay datos sobre fidelidad factual.
- Ausencia total de documentacion tecnica sobre dataset, contexto y proceso de entrenamiento, lo que dificulta la reproducibilidad y la auditoria.
- Acceso restringido (gated) con licencia Apache 2.0: la licencia permite uso comercial, pero las condiciones adicionales del gate deben revisarse antes de desplegar en produccion.
- El pipeline declarado es image-text-to-text, pero no hay evaluacion publicada de la calidad de la comprension de imagenes.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.
- El nombre del modelo y los tags sugieren un uso recreativo o de nicho; no se recomienda como base para tareas de razonamiento general, codigo o matematicas sin evaluacion previa.
- No se distribuyen cuantizaciones GGUF ni pesos optimizados, lo que anade trabajo de conversion para despliegues en consumer GPU.

## Enlaces

- HuggingFace: https://huggingface.co/omegazurich/Qwen3.8-27B-Halloween-Terror-Heretic-Uncensored-source
- Modelo base: https://huggingface.co/trohrbaugh/Qwen3.8-27B-heretic-ara
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la informacion disponible.
