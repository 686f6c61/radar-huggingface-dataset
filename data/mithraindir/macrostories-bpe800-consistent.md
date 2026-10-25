# mithraindir/macrostories-bpe800-consistent

## Resumen

MacroStories BPE-800 Consistent es un modelo de lenguaje de juguete publicado por el usuario mithraindir en HuggingFace. Se trata de un transformer con bucles (looped transformer) de una sola capa repetida cuatro veces, con un vocabulario de 800 tokens Byte-Level BPE y una dimension de modelo de 32, lo que da un total de 33.376 parametros segun los pesos en safetensors. Fue entrenado durante 4.000 pasos con batches de 32 sobre 1.000 relatos infantiles en neerlandes descritos como "consistentes", y alcanzo una perdida de validacion final de 2,5429 nats/token.

El interes del modelo no es su calidad de generacion, sino su caracter experimental: ejemplifica dos ideas concretas de la literatura reciente sobre modelos pequenos, el peso compartido entre iteraciones (looping) como sustituto de profundidad, y la tokenizacion Byte-Level BPE aplicada a un corpus minusculo para eliminar practicamente el vocabulario fuera de lista (0,00% OOV declarado). Con 33.376 parametros, el modelo ocupa unas decenas de kilobytes, por lo que sirve como banco de pruebas reproducible de pipelines de entrenamiento e inferencia, no como generador de texto utilizable.

Las muestras incluidas en la model card muestran el comportamiento esperado en esta escala: holandeses gramaticales en la superficie, con sujetos elididos, repeticiones de sintagmas ("de mand", "de ladder") y derivas semanticas hacia combinaciones sin sentido. Es, en la practica, un artefacto de investigacion docente y no un modelo desplegable en producto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con bucles (looped transformer): 1 capa repetida 4 veces |
| Parametros totales | 33.376 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene safetensors; por tamano, fp32/fp16/int8 son viables) |
| Idiomas soportados | neerlandes (corpus de entrenamiento: relatos infantiles en neerlandes); la metadata de HuggingFace no declara idiomas |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer con bucles: una unica capa de atencion y feed-forward cuyos pesos se reutilizan en cuatro pasadas sucesivas, en lugar de apilar cuatro capas independientes. El vocabulario es de 800 tokens con tokenizacion Byte-Level BPE y la dimension oculta es d=32. A partir de estos datos se deduce que las matrices de embedding de entrada y salida (si estan atadas) consumen 800 x 32 = 25.600 parametros, quedando unos 7.776 para el resto del bloque; esta descomposicion es una deduccion aritmetica, no un dato publicado. No se especifican numero de cabezas de atencion, dimension del feed-forward, funcion de activacion ni normalizacion.

El entrenamiento consistio en 4.000 pasos con batch de 32 sobre 1.000 relatos infantiles neerlandeses, con tokenizacion Byte-Level BPE que el autor declara con 0,00% de tokens fuera de vocabulario. La perdida de validacion final fue de 2,5429 nats/token, lo que equivale a una perplejidad de aproximadamente 12,7 (calculo derivado: e^2,5429). No hay informacion sobre composicion exacta del dataset, semillas, optimizador, scheduler, ni sobre fases de RLHF, DPO o ajuste por instrucciones; por el diseno y el tamano, es razonable asumir que no las hubo.

La innovacion tecnica declarada es doble: el bucle de pesos como mecanismo de profundidad efectiva con un coste de parametros minimo, y la eleccion de Byte-Level BPE para garantizar cobertura total del vocabulario en un corpus de apenas 1.000 documentos. El adjetivo "consistent" del nombre sugiere un filtrado o curaduria del corpus para mantener coherencia tematica y estructural entre relatos, aunque el autor no detalla el criterio.

## Capacidades

- Generacion de texto en neerlandes a nivel de frase suelta: produce oraciones gramaticales superficialmente plausibles dentro del dominio de relatos infantiles de granja.
- Continuacion de texto breve: las muestras de la model card tienen entre uno y tres parrafos, con degradacion progresiva a medida que avanza la generacion.
- Tokenizacion Byte-Level BPE con vocabulario de 800 tokens y 0,00% OOV declarado sobre el corpus de entrenamiento.
- No dispone de soporte de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- No dispone de modo thinking, vision, audio ni ninguna modalidad adicional.
- No hay evidencia de capacidades multilingues: el corpus es exclusivamente neerlandes y el vocabulario de 800 tokens no cubre otras lenguas.
- No hay evidencia de capacidad de seguir instrucciones ni de mantener un rol asignado.

## Casos de uso

- Docencia e investigacion sobre looped transformers: el modelo permite reproducir en minutos, sin GPU, el efecto de compartir pesos entre iteraciones frente a apilar capas, aislando la variable de profundidad efectiva con un coste de computo despreciable.
- Pruebas unitarias de pipelines de tokenizacion: su vocabulario Byte-Level BPE de 800 tokens y el 0,00% OOV declarado lo convierten en un caso de prueba util para validar codificadores, decodificadores y manejo de caracteres multibyte en un entorno controlado.
- Banch de juguete para comparar curricula de datos: al entrenar sobre 1.000 relatos, sirve para medir como afecta el orden, el filtrado o la deduplicacion del corpus a la perdida de validacion en experimentos de ablation de bajo coste.
- Verificacion de herramientas de despliegue en CI: con unos 130 KB en fp32, se puede cargar en cualquier runner sin GPU para comprobar que un pipeline de serializacion, carga y generacion funciona de extremo a extremo tras un cambio de codigo.
- Generacion de texto de relleno para pruebas de interfaz: util para poblar vistas de una aplicacion de lectura infantil con texto neerlandes sintetico que no compromete derechos de autor de obras reales.
- Experimentos de interpretabilidad a escala minima: con una sola capa y cuatro pasadas, es posible trazar activaciones y patrones de atencion completos sin infraestructura de visualizacion costosa.
- Reproduccion de resultados docentes: sirve como referencia reproducible de una perdida de validacion concreta (2,5429 nats/token) frente a la que comparar cambios de hiperparametros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato cuantitativo de evaluacion es la perdida de validacion reportada por el autor:

| Metrica | Valor | Notas |
|---|---|---|
| Perdida de validacion | 2,5429 nats/token | Dato declarado en la model card |
| Perplejidad de validacion | ~12,7 | Calculo derivado: e^2,5429 |
| Pasos de entrenamiento | 4.000 | Batch de 32 |
| Tamano del corpus | 1.000 relatos | Neerlandes, infantiles, "consistentes" |
| Cobertura de vocabulario | 0,00% OOV | Declarado por el autor con BPE de 800 tokens |

No hay resultados de MMLU, HumanEval, GSM8K ni de ninguna otra prueba estandar, y por el tamano y el dominio del modelo no serian informativos.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en cualquier precision; los pesos ocupan aproximadamente 130 KB en fp32, 65 KB en fp16 y 33 KB en int8 (calculado a partir de 33.376 parametros).
- GPU recomendadas: ninguna en particular; el modelo cabe en cualquier GPU, incluida una GTX 1050 o una iGPU, y en la practica la latencia vendra dominada por el lanzamiento de kernels, no por el computo.
- Viabilidad en consumer GPU: si, en todas; tambien en CPU, Raspberry Pi y entornos sin acelerador.
- Opciones de despliegue: al ser una arquitectura con bucles no estandar, es probable que requiera el codigo de definicion del modelo y no funcione directamente en vLLM o TGI; llama.cpp y Ollama requeririan conversion a GGUF con soporte especifico para el bucle. La ruta mas realista es PyTorch con transformers o codigo propio. No se dispone de informacion sobre si el repositorio incluye el codigo del modelo (el tamano reportado es 0,0 GB).
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

No hay datos de benchmarks de este modelo que permitan una comparacion de rendimiento. La comparacion estructural con alternativas de la misma escala es la siguiente:

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MacroStories BPE-800 Consistent | 33.376 | no disponible | Looped transformer, 1 capa x 4 bucles, V=800, d=32 | no disponible | HuggingFace, 0 descargas, 0 likes |
| TinyStories (variantes ~1M-10M) | ~1M-10M | no disponible en esta ficha | Transformer decoder-only entrenado en relatos infantiles en ingles | habitualmente MIT o similar (verificar cada repo) | HuggingFace |
| Modelos aleatorios inicializados de tamaño comparable | ~10K-100K | no aplica | Transformer estandar | segun repositorio | HuggingFace |

La comparacion relevante es cualitativa: frente a las variantes de TinyStories, este modelo es entre uno y dos ordenes de magnitud mas pequeno, esta en neerlandes en lugar de ingles y sustituye profundidad por bucle de pesos. No hay datos publicados que permitan afirmar cual de los dos enfoques rinde mejor a igual presupuesto de parametros.

## Limitaciones y advertencias

- Repeticion degenerativa: las propias muestras del autor repiten sintagmas completos ("de mand", "de ladder") y derivan hacia frases sin sentido a medida que avanza la generacion.
- Elision del sujeto: las muestras muestran sistematicamente huecos donde deberia aparecer el sujeto de la oracion, un artefacto del corpus o de la tokenizacion.
- Alucinacion de palabras y estructuras: aparecen terminos inexistentes en neerlandes y concordancias rotas, lo que hace inviable cualquier uso en produccion.
- Vocabulario muy limitado: 800 tokens restringen severamente la expresividad y la cobertura lexica fuera del dominio de relatos infantiles.
- Dominio y idioma unicos: solo neerlandes y solo relatos infantiles de granja; no hay transferencia esperada a otros generos ni lenguas.
- Longitud de contexto desconocida: no se publica, lo que impide planificar cualquier uso conversacional multi-turno.
- Sin ajuste por instrucciones: no sigue ordenes, no responde preguntas y no mantiene formato.
- Licencia no disponible: sin licencia explicita no se puede asumir permiso de uso comercial, modificacion ni redistribucion; hay que contactar con el autor antes de cualquier uso fuera de investigacion.
- Ausencia de evaluacion de sesgos y seguridad: no se ha documentado ningun analisis de sesgos ni filtro de contenido.
- Senales de escasa traccion: 0 descargas y 0 likes desde su publicacion, sin documentacion adicional ni codigo de entrenamiento verificado en la informacion disponible.
- El tamano de repositorio reportado (0,0 GB) no permite confirmar que los pesos sean accesibles ni que el modelo sea cargable tal cual.

## Enlaces

- HuggingFace: https://huggingface.co/mithraindir/macrostories-bpe800-consistent
- No se han encontrado en la busqueda web papers, blogs, repositorios de codigo ni demos adicionales asociados a este modelo.
