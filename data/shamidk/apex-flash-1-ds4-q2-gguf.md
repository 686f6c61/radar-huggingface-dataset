# shamidk/apex-flash-1-DS4-Q2-GGUF

## Resumen

Apex Flash 1 DS4 Q2 GGUF es una conversion cuantizada a formato GGUF del modelo cantina-security/apex-flash-1, un ajuste fino de Cantina Security y Yeta sobre Z.AI GLM-5.3-Flash. El autor del repositorio es el usuario shamidk y la revision de origen fijada es `28c647a6bd0444973a7ef3d940c24c67e64f52fe`. El checkpoint original declara 320.759.404.382 parametros (unos 320,76 mil millones) y esta distribuido bajo licencia MIT. El resultado es un unico fichero de 96.505.818.912 bytes (89,88 GiB) con 1.412 tensores.

El problema que resuelve esta publicacion es el de hacer ejecutable en hardware de consumo una arquitectura de tipo GLM con expertos enrutados, aplicando una receta de cuantizacion mixta de 2 bits y descartando los pesos de vision para quedarse en un modelo estrictamente de texto. La cuantizacion no es uniforme: los tensores de expertos enrutados `gate`/`up` usan IQ2_XXS, los `down` enrutados usan Q2_K, y el resto de tensores no expertos mantienen mayor precision.

La relevancia actual es doble. Por un lado, muestra el estado del arte en compresion agresiva de modelos gigantes manteniendo tensores MTP (multi-token prediction), aunque la decodificacion especulativa no se declara cualificada. Por otro, y mas importante, se publica con un informe de cualificacion honesto que documenta tanto lo que funciona como lo que falla, algo poco habitual en cuantizaciones experimentales. Se trata explicitamente de una release experimental, no de una version estable para agentes en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLM (alias de arquitectura `glm-5.3-flash`); expertos enrutados, requiere motor DS4 compatible |
| Parametros totales | 320.759.404.382 (320,76 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (probado localmente a 8.192 tokens; contextos mayores no verificados) |
| Tipos de cuantizacion | Receta mixta Q2: IQ2_XXS en `gate`/`up` de expertos enrutados, Q2_K en `down` de expertos enrutados, mayor precision en tensores no expertos; sin matriz de importancia calibrada por activaciones (fallback de energia por columna de pesos) |
| Idiomas soportados | no disponible |
| Licencia | MIT (heredada del modelo base) |
| Formato de pesos | GGUF (un unico fichero `apex-flash-1-DS4-Q2.gguf`, 89,88 GiB, 1.412 tensores) |
| Modelo base | cantina-security/apex-flash-1 (revision `28c647a6bd0444973a7ef3d940c24c67e64f52fe`), a su vez derivado de Z.AI GLM-5.3-Flash |
| Modalidad | Solo texto (los pesos de vision se omiten en la conversion) |
| Tamano del repositorio | 96,5 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La conversion parte del checkpoint BF16 de cantina-security/apex-flash-1, que a su vez es un ajuste fino sobre Z.AI GLM-5.3-Flash. La arquitectura es de tipo GLM con mezcla de expertos, segun se deduce de la presencia de tensores de expertos enrutados (`gate`, `up`, `down`) y de la necesidad de un runtime que soporte explicitamente "the GLM architecture and these mixed expert types". El servidor DS4 expone el alias `glm-5.3-flash` como identificador de arquitectura, no como identidad del ajuste Apex.

No se dispone de informacion sobre volumen de tokens, composicion del dataset ni si hubo fases de RLHF, DPO o similares, ni en el repositorio de la cuantizacion ni en los metadatos disponibles. La model card unicamente describe el proceso de conversion, no el entrenamiento del modelo base.

La innovacion tecnica relevante esta en el esquema de cuantizacion y en la verificacion. Se conservan los tensores MTP (multi-token prediction), lo que en principio habilita decodificacion especulativa, aunque el autor declara explicitamente que esta no esta cualificada. La verificacion incluye dos pruebas superadas: integridad completa del payload de salida y auditoria canonica de equivalencia con la fuente. El autor advierte que la conversion no hereda las puntuaciones del checkpoint original.

## Capacidades

- Generacion de texto conversacional en modo `text-generation`; la model card lo etiqueta como `conversational`.
- Razonamiento con modo thinking: segun la cualificacion, "reasoning with thinking enabled completed correctly" y el replay de estado tambien paso.
- Tool calling tipado estricto: 32 de 36 pruebas superadas en el conjunto estricto; en la interfaz Anthropic paso 12 de 12.
- Compatibilidad con el esquema de Chat Completions y Responses a traves del servidor nativo DS4 (API en `/v1`).
- Soporte de streaming de salida, con primeros fragmentos visibles medidos.
- Capacidades de agente multi-paso: no cualificadas. Las pruebas con Prime/OpenCode chocaron con problemas de contabilidad de uso, alias y recibos del arnes, por lo que la entrega agente y la codificacion ejecutada quedan sin cualificar.
- Capacidades multilingues: no disponible.
- Vision: no soportada en esta conversion (pesos omitidos).
- Especulacion con modelo borrador: no cualificada.

## Casos de uso

- Analisis de documentos tecnicos extensos en local: con contexto probado de 8.192 tokens y streaming desde SSD, permite procesar informes o documentacion sin enviar datos a la nube, un requisito habitual en entornos con datos sensibles. El limite real de contexto no esta documentado, asi que habria que validarlo por caso.
- Prototipado e investigacion sobre cuantizacion extrema: el repositorio sirve como banco de pruebas para estudiar el impacto de una receta mixta IQ2_XXS/Q2_K sobre un modelo de 320 B en tareas de razonamiento y tool calling.
- Evaluacion de runtimes DS4 en Apple Silicon: el caso de uso documentado por el autor es precisamente el de validar el motor `antirez/ds4` con streaming por SSD y cache de expertos en memoria unificada.
- Generacion de texto offline en un MacBook Pro de gama alta: con 128 GiB de RAM, un plan de asignacion nativa de 27,26 GiB y una cache de expertos de 16 GiB, el modelo es ejecutable en una estacion de trabajo de Apple, a costa de una decodificacion de unos 12,67 tokens por segundo.
- Integracion en herramientas de linea de comandos con interfaz compatible OpenAI: el servidor nativo expone `http://127.0.0.1:18890/v1`, de modo que clientes que hablen el esquema Chat Completions pueden apuntarse a el sin adaptadores.
- Pruebas de robustez de tool calling por proveedor de API: dado que la cualificacion distingue entre esquemas (Anthropic frente a Chat Completions/Responses) y documenta fallos concretos de tipo y contenido, el modelo es util como sujeto de pruebas de conformidad de interfaces de herramientas.
- Experimentacion con decodificacion especulativa: los tensores MTP estan presentes en el fichero, por lo que un equipo de investigacion puede intentar explotarlos, asumiendo que el autor no los ha cualificado y que no hay garantia de que funcionen.
- Reproduccion de auditorias de procedencia: el repositorio incluye `provenance.json` con fuentes fijadas, receta, alcance de verificacion, resultados medidos y el SHA256 completo del GGUF, lo que permite replicar el analisis de cadena de suministro del artefacto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K ni similares) en la informacion disponible. El autor indica ademas que "the conversion does not inherit the upstream checkpoint's scores". Lo unico disponible es la cualificacion local, que no es una comparativa ABBA ni un benchmark de publicador.

| Medicion (cualificacion local) | Resultado |
|---|---|
| Decodificacion, tokens de salida por segundo | Mediana 12,67; rango 12,40-13,46, n=3 |
| Latencia de prefill | Mediana 6,559 s |
| Primer fragmento transmitido visible | Mediana 6,805 s |
| Pruebas de calidad acotadas | 2/4 superadas |
| Pruebas de herramientas tipadas estrictas | 32/36 superadas |
| Tool calling en interfaz Anthropic | 12/12 superadas |

Condiciones del piloto: 535 tokens de entrada y 128 de salida, thinking desactivado, temperatura 0, top-p 1, top-k 0, semilla 36 y cero tokens de prompt en cache. Se hizo un unico calentamiento corto antes de las muestras y no se limpio la cache de ficheros del sistema operativo.

## Requisitos de hardware

- Tamano del artefacto: 96.505.818.912 bytes (89,88 GiB). El propio autor advierte que el tamano del fichero no es un requisito de RAM por si mismo.
- Plan de asignacion nativa medido: 27,26 GiB en el entorno de prueba, con cache de expertos objetivo de 16 GiB, cero capas totalmente residentes y streaming desde SSD. El autor subraya que esto no es un requisito de RAM total medido.
- Equipo de la prueba: Apple M5 Max MacBook Pro (Mac17,6) con 128 GiB de RAM unificada, macOS 27.0.1.
- VRAM estimada para GPU discreta: no disponible. No se aportan mediciones en CUDA ni ROCm.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible. Se requiere un runtime DS4 que soporte la arquitectura GLM y los tipos de experto mixtos; el GGUF por si solo no garantiza compatibilidad con llama.cpp, Ollama, MLX, LM Studio ni sus motores embebidos.
- Opciones de despliegue documentadas: exclusivamente `antirez/ds4` en el commit `4bd088c20da0b905771fb94142cf12d669103c20`, con el parche `runtime/schema-aware-glm-v2.patch` (SHA256 `2ba7e633e0be1595d82b0b8191cc73c66292fbcf046b1b663e5d18fb88bed992`), compilando `ds4-server` con Metal y los flags `--ssd-streaming --ssd-streaming-cold --ssd-streaming-cache-experts 16GB --ssd-streaming-full-layers 0`.
- Throughput: mediana de 12,67 tokens/s en decodificacion y 6,559 s de prefill en la configuracion descrita. No hay datos de escalado con mas GPUs o mas ancho de banda.
- Nota de operacion: cargar solo un modelo grande a la vez, mantener las protecciones de memoria nativas y permitir timeouts de peticion largos para el razonamiento. Un timeout de socket de 90 s en un arnes previo quedo registrado como evidencia de fallo; la suite nativa completada uso un limite de 600 s.

## Comparativa con modelos similares

No se dispone de datos de modelos comparables en la informacion proporcionada (ni parametros, ni contexto, ni rendimiento de alternativas de la misma categoria). La unica comparacion posible es con el propio checkpoint de origen.

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| shamidk/apex-flash-1-DS4-Q2-GGUF | 320,76 B (totales) | no disponible | Mixta Q2 (IQ2_XXS + Q2_K) | MIT | GGUF, 89,88 GiB, 0 descargas |
| cantina-security/apex-flash-1 (base) | 320,76 B (totales) | no disponible | BF16 | MIT | Checkpoint de origen |
| Otras alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Release experimental y no estable: el propio autor la califica como "Experimental, not a stable-agent release".
- Sin paridad de calidad demostrada frente al BF16 original. La model card indica que contextos mayores, vision, especulacion y paridad de calidad con BF16 no han sido probados.
- Fallos documentados en pruebas de cualificacion: dos casos fallaron la salida JSON valida (emitio `None` en lugar de `null`) y la finalizacion normal dentro del limite de 256 tokens de salida.
- Cuatro fallos de herramienta alteraron texto literal dentro de arrays en Chat Completions/Responses, tanto en streaming como sin streaming. La interfaz Anthropic si paso las 12 pruebas.
- La entrega agente y la codificacion ejecutada quedan sin cualificar, no probadas como incompatibles. Las pruebas con Prime/OpenCode fallaron por problemas del arnes de contabilidad de uso, alias y recibos.
- No se debe inferir capacidad general de codigo ni comportamiento de rechazo a partir de estas pruebas pequenas.
- Riesgo de alucinacion y sesgos: no disponible. No hay evaluaciones publicadas en la informacion proporcionada.
- Idiomas soportados: no disponible, lo que impide garantizar calidad multilingue.
- Longitud de contexto maxima: no disponible; solo hay validacion a 8.192 tokens.
- Dependencia fuerte de runtime: el GGUF no es portable a llama.cpp, Ollama, MLX o LM Studio sin soporte explicito de la arquitectura GLM y de los tipos de experto mixtos.
- Arquitectura DS4 seccionada: requiere un parche concreto y un commit fijado. Los binarios varian con SDK y compilador, y reproducir el codigo fuente no constituye una nueva validacion en vivo.
- La API nativa anuncia `glm-5.3-flash`, el alias de arquitectura, no la identidad del ajuste Apex. Esto puede confundir a clientes que infieran el modelo a partir del identificador.
- Licencia MIT heredada del upstream, lo que en principio permite uso comercial, pero el repositorio no acompana una revision legal propia; el codigo de runtime tiene su propia licencia en `runtime/LICENSE`.
- Los pesos de vision estan omitidos: cualquier caso de uso multimodal queda fuera de alcance.
- Rendimiento medido en un unico equipo de Apple Silicon con cache de ficheros no limpiada; no es una comparativa controlada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/shamidk/apex-flash-1-DS4-Q2-GGUF
- Modelo base: https://huggingface.co/cantina-security/apex-flash-1/tree/28c647a6bd0444973a7ef3d940c24c67e64f52fe
- Runtime DS4: https://github.com/antirez/ds4
- Commit del runtime: `4bd088c20da0b905771fb94142cf12d669103c20`
- Parche de runtime citado: `runtime/schema-aware-glm-v2.patch` (incluido en el repositorio del modelo)
- Metadatos de procedencia: `provenance.json` (incluido en el repositorio del modelo)
- Licencia del runtime: `runtime/LICENSE` (incluida en el repositorio del modelo)
- Z.AI (autor de GLM-5.3-Flash): sin enlace en la informacion disponible
- Cantina Security y Yeta (autores del ajuste Apex): sin enlace en la informacion disponible
