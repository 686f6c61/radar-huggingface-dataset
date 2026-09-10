# mradermacher/Ektome-Qwen3.6-35B-A3B-PristinelyUncensored-i1-GGUF

## Resumen

Ektome-Qwen3.6-35B-A3B-PristinelyUncensored-i1-GGUF es la version cuantizada con imatrix del modelo Zynerji/Ektome-Qwen3.6-35B-A3B-PristinelyUncensored, publicada por el usuario mradermacher, especializado en generar cuantizaciones GGUF de terceros. Se trata de un modelo de tipo mezcla de expertos (MoE) con 35.505.251.456 parametros totales (unos 35,5B) y capacidades de vision e lenguaje, segun las etiquetas del repositorio (`moe`, `vision-language`).

El elemento diferencial del modelo es su naturaleza "abliterated" y "pristinely-uncensored": segun las etiquetas del autor, la eliminacion de los mecanismos de rechazo se habria realizado sin fine-tuning ni entrenamiento adicional (`no-finetuning`, `no-training`), es decir, mediante intervencion directa sobre los pesos. La nomenclatura del nombre sugiere un modelo derivado de la familia Qwen3, con 35B totales y aproximadamente 3B de parametros activos por token (sufijo A3B), aunque la model card no confirma estos datos.

La relevancia de esta publicacion es practica: ofrece el modelo en formato GGUF con cuantizaciones desde IQ1_S hasta Q6_K, mas un fichero imatrix para generar cuantizaciones propias, lo que permite ejecutarlo en hardware de consumo. El repositorio tiene 0 descargas y 0 "likes" en el momento de la consulta, y no incluye resultados de benchmarks ni detalles de entrenamiento, por lo que su calidad real no esta validada publicamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos) con capacidades de vision e lenguaje, segun etiquetas del repositorio; detalle de la arquitectura interna no disponible |
| Parametros totales | 35.505.251.456 (aproximadamente 35,5B) |
| Parametros activos | no disponible; la nomenclatura "A3B" del nombre sugiere del orden de 3B activos, sin confirmacion en la model card |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_1, Q4_K_S, Q4_K_M, small-IQ4_NL, Q5_K_S, Q5_K_M, Q6_K, Q2_K, Q2_K_S (cuantizaciones ponderadas/imatrix) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repositorio i1-GGUF); el modelo base se distribuye en formato transformers/safetensors |

## Arquitectura y entrenamiento

El modelo base es Zynerji/Ektome-Qwen3.6-35B-A3B-PristinelyUncensored, del que este repositorio es una derivacion cuantizada. La unica informacion tecnica disponible son las etiquetas y los comentarios de la model card: `moe`, `vision-language`, `abliterated`, `uncensored`, `pristinely-uncensored`, `no-finetuning`, `no-training` y `conversational`. Esto indica una arquitectura de mezcla de expertos con torre de vision, y un proceso de "abliteracion" (eliminacion de direcciones de rechazo en el espacio de activaciones o pesos) que, segun el autor, no conlleva entrenamiento ni ajuste fino adicional. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO.

En cuanto a la innovacion de esta publicacion concreta, mradermacher aplica cuantizacion con matriz de importancia (imatrix), un esquema ponderado que asigna distinta precision a los tensores segun su relevancia, con el objetivo de reducir la perplejidad frente a cuantizaciones estaticas del mismo tamano. El repositorio incluye el fichero imatrix (`Ektome-Qwen3.6-35B-A3B-PristinelyUncensored.imatrix.gguf`, 0,3 GB) para que terceros generen sus propias cuantizaciones. Al tratarse de un modelo de vision, los ficheros `mmproj` necesarios para el procesamiento de imagenes se encuentran en el repositorio estatico enlazado, no en este.

## Capacidades

- Generacion de texto conversacional multi-turno, segun la etiqueta `conversational`.
- Procesamiento de vision e lenguaje: el modelo esta marcado como `vision-language` y requiere ficheros `mmproj` (disponibles en el repositorio estatico) para entrada de imagenes.
- Generacion de texto sin filtros de rechazo: la abliteracion busca eliminar las negativas a responder ante peticiones que el modelo original rechazaria.
- Modo "pristinely uncensored": segun el autor, la supresion de censura se hace sin entrenamiento posterior, lo que en teoria preserva mejor las capacidades originales que un fine-tuning sobre datos sin censura.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles (`language: en`); no se declara soporte de castellano ni de otros idiomas.
- Modo de razonamiento explicito ("thinking"), audio u otras modalidades: no disponible.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo permite estudiar de forma controlada que ocurre cuando se eliminan las direcciones de rechazo sin reentrenar, comparando respuestas con el modelo original sin abliterar, y evaluando cuanto se degrada la coherencia.
- Analisis de contenido sensible en entornos de investigacion: clasificacion y anotacion de textos sobre violencia, contenido para adultos o discurso de odio, donde un modelo con rechazos sistematicos dificulta obtener la anotacion solicitada.
- Redaccion creativa sin restricciones tematicas: narrativa de ficcion con violencia explicita, terror o tematicas adultas, donde el modelo no bloquea la continuacion del texto por politica de contenido.
- Procesamiento de documentos con imagenes: al ser un modelo de vision, puede extraer y resumir informacion de capturas, diagramas o paginas escaneadas, siempre que se descarguen los ficheros `mmproj` del repositorio estatico.
- Despliegue local en hardware de consumo: las cuantizaciones IQ2/IQ3 (del orden de 8-12 GB) permiten ejecutar un MoE de 35B totales en una GPU de 12-16 GB mediante llama.cpp u Ollama, lo que habilita prototipos sin coste de API.
- Evaluacion comparativa de cuantizaciones: usando el fichero imatrix incluido, un equipo puede generar cuantizaciones propias y medir la perdida de calidad frente a las publicadas, como parte de un estudio interno de compresion de modelos.
- Generacion de contenido en ingles para publicaciones no moderadas: foros, plataformas de ficcion o comunidades que requieren respuestas sin capas de rechazo, asumiendo la responsabilidad legal y etica del contenido producido.
- Base para experimentos de destilacion o merging: al disponer de pesos en GGUF y de un modelo base en transformers, sirve como punto de partida para investigar tecnicas de fusion de modelos o de edicion de pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye valores de MMLU, HumanEval, GSM8K, MMMU ni de ninguna otra evaluacion, y tampoco se aportan curvas de perplejidad de las cuantizaciones. Los resultados de la busqueda web no contienen informacion relevante sobre el modelo (corresponden a fichas de producto de impresoras HP, sin relacion alguna).

## Requisitos de hardware

- VRAM estimada (calculo orientativo a partir de los 35,5B de parametros totales; no son cifras publicadas por el autor): cuantizaciones IQ1/IQ2 en torno a 8-11 GB; IQ3 alrededor de 13-15 GB; Q4_K_M en torno a 20-22 GB; Q5_K_M en torno a 24-26 GB; Q6_K en torno a 28-30 GB. Al ser un MoE, es necesario mantener todos los expertos en memoria, aunque solo se activen unos pocos por token.
- GPU recomendadas: RTX 3090/4090 (24 GB) para Q4_K_M e inferiores; A100 40 GB o H100 para Q5/Q6 con contexto largo; configuraciones multi-GPU o CPU+GPU para las cuantizaciones mayores.
- Viabilidad en GPU de consumo: si, en tarjetas de 12-16 GB con cuantizaciones IQ2/IQ3, y en tarjetas de 24 GB con Q4_K_M o Q5_K_M, siempre que la longitud de contexto se mantenga moderada y se ajuste el numero de capas descargadas a CPU.
- Opciones de despliegue: llama.cpp y sus derivados (Ollama, LM Studio, koboldcpp, text-generation-webui) para los ficheros GGUF; vLLM o TGI para el modelo base en safetensors si se dispone de la GPU adecuada. Los ficheros `mmproj` deben obtenerse del repositorio estatico para habilitar la vision.
- Latencia y throughput: no disponible. Al tratarse de un MoE con pocos parametros activos por token, el throughput por peticion depende mas del ancho de banda de memoria efectivo que del total de parametros, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Cuantizacion GGUF | Licencia |
|---|---|---|---|---|---|
| Ektome-Qwen3.6-35B-A3B-PristinelyUncensored-i1-GGUF (este modelo) | 35,5B | no disponible (nombre sugiere ~3B) | no disponible | Si (imatrix, IQ1-IQ6) | apache-2.0 |
| Zynerji/Ektome-Qwen3.6-35B-A3B-PristinelyUncensored (modelo base) | 35,5B | no disponible | no disponible | No | apache-2.0 |
| mradermacher/Ektome-Qwen3.6-35B-A3B-PristinelyUncensored-GGUF (cuantizaciones estaticas) | 35,5B | no disponible | no disponible | Si (estaticas) | apache-2.0 |

No se dispone de datos verificados de modelos comparables de la misma categoria en la informacion proporcionada. Como referencia externa no verificada en esta busqueda, la familia Qwen3 incluye variantes MoE de tamano similar (por ejemplo, Qwen3-30B-A3B, con 30,5B totales y 3,3B activos, contexto de 128K y licencia Apache-2.0), pero estos datos provienen de conocimiento general y no de la informacion facilitada, por lo que deben comprobarse en la fuente original antes de usarlos en una decision tecnica.

## Limitaciones y advertencias

- Modelo abliterado y sin censura: no incorpora filtros de rechazo, por lo que puede generar contenido violento, sexual, ilegal o danino sin advertencia. No es apto para aplicaciones de cara al publico sin una capa de moderacion externa.
- La afirmacion de que la abliteracion se hizo "sin entrenamiento ni fine-tuning" es del autor del modelo base y no puede verificarse con la informacion disponible; tampoco hay evaluaciones que cuantifiquen el dano colateral en razonamiento o coherencia.
- Riesgo de alucinacion: no disponible, pero no se han publicado evaluaciones de fidelidad; al no existir benchmarks, se desconoce el comportamiento real del modelo.
- Idiomas: unicamente ingles declarado. El uso en castellano no esta soportado oficialmente y previsiblemente degradara la calidad.
- Longitud de contexto desconocida: no se puede planificar un caso de uso con documentos largos sin comprobarla empiricamente.
- Estado de validacion nulo: el repositorio registra 0 descargas y 0 "likes", sin resultados de benchmarks ni evaluaciones de terceros.
- Cuantizaciones de baja precision: las variantes IQ1_S, IQ1_M, IQ2_XXS e IQ2_S degradan notablemente la calidad; el propio autor advierte de que las cuantizaciones IQ pequenas pueden ser preferibles a otras del mismo tamano, pero no equivalen a Q4 o superiores.
- Vision incompleta en este repositorio: los ficheros `mmproj` no estan aqui, hay que descargarlos del repositorio estatico para usar la entrada de imagenes.
- Licencia Apache-2.0: permite uso comercial, pero el usuario debe verificar que el modelo base y los datos subyacentes no impongan restricciones adicionales, y asumir la responsabilidad legal del contenido generado por un modelo sin censura.
- Metadatos con fecha de publicacion del 10 de septiembre de 2026, posterior a la fecha de creacion de muchos de los modelos de la familia en la que se inspira el nombre; conviene verificar la procedencia real de los pesos.
- Ausencia de informacion sobre sesgos: no se ha publicado ninguna evaluacion de sesgo, toxicidad o representacion.

## Enlaces

- Repositorio HuggingFace de esta cuantizacion: https://huggingface.co/mradermacher/Ektome-Qwen3.6-35B-A3B-PristinelyUncensored-i1-GGUF
- Modelo base: https://huggingface.co/Zynerji/Ektome-Qwen3.6-35B-A3B-PristinelyUncensored
- Cuantizaciones estaticas y ficheros mmproj: https://huggingface.co/mradermacher/Ektome-Qwen3.6-35B-A3B-PristinelyUncensored-GGUF
- Pagina resumen de descargas del cuantizador: https://hf.tst.eu/model#Ektome-Qwen3.6-35B-A3B-PristinelyUncensored-i1-GGUF
- Preguntas frecuentes y peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guia de uso de ficheros GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafica comparativa de perplejidad entre tipos de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- nethype GmbH (infraestructura del cuantizador): https://www.nethype.de/
- No se han encontrado otros enlaces relevantes: los resultados de la busqueda web corresponden a paginas de producto de impresoras HP y no guardan relacion con el modelo.
