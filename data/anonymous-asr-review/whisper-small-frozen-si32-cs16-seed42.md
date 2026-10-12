# anonymous-asr-review/whisper-small-frozen-si32-cs16-seed42

## Resumen

whisper-small-frozen-si32-cs16-seed42 es un conjunto de adaptadores LoRA (PEFT) entrenados sobre el modelo base openai/whisper-small para reconocimiento automatico del habla (ASR) en escenarios de code-switching entre cingales (si) e ingles (en). Lo publica la cuenta anonima anonymous-asr-review como material suplementario para revision por pares, con fecha de creacion del 12 de octubre de 2026 y cero descargas registradas.

El artefacto no es un modelo autonomo: contiene dos adaptadores que deben activarse de forma conjunta y a peso unitario. El adaptador de code-switching tiene rango 16 y se entreno como residual mientras el adaptador de cingales de rango 32 permanecia activo y congelado. Esta construccion busca medir cuanto de la capacidad de alternancia de idioma se puede anadir sin degradar la adaptacion previa al cingales.

La relevancia de la ficha es metodologica mas que de producto: documenta una receta reproducible (semilla 42, alpha 32, seleccion del mejor checkpoint) para investigacion en ASR bilingue con adaptadores de bajo rango. Su utilidad practica esta condicionada a que el autor publique la evaluacion asociada, que no esta disponible en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) con adaptadores LoRA acoplados via PEFT |
| Parametros totales | 244 M en el modelo base openai/whisper-small; tamano de los adaptadores no disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | Ventanas de 30 s de audio por segmento (arquitectura Whisper); contexto textual del decodificador no indicado en la informacion disponible |
| Tipos de cuantizacion | No disponible en el repositorio; los adaptadores se distribuyen sin cuantizar (safetensors) |
| Idiomas soportados | Cingales (si) e ingles (en), con enfasis en code-switching si-en |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA); el modelo base se descarga por separado |
| Modelo base | openai/whisper-small |
| Libreria | peft |
| Rango LoRA | 16 (adaptador de code-switching); 32 (adaptador de cingales, congelado) |
| Alpha LoRA | 32 |
| Semilla | 42 |
| Seleccion de checkpoint | best |
| Tamano del repositorio | 0,0 GB |

## Arquitectura y entrenamiento

La base es Whisper small, un transformer encoder-decoder orientado a ASR con representaciones de audio tipo mel-espectrograma y decodificacion autoregresiva de tokens de texto. Sobre esa base se aplican adaptadores LoRA de bajo rango mediante la libreria PEFT, lo que permite especializar el modelo sin reentrenar los pesos completos. El adaptador principal se entreno para cingales con rango 32; el adaptador de code-switching, de rango 16, se entreno despues como residual mientras el primero permanecia activo y congelado.

La innovacion descrita es precisamente el regimen de congelacion: la senal de entrenamiento del segundo adaptador se calcula con el adaptador de cingales ya operativo, de modo que el residual aprende unicamente la alternancia de idioma que el adaptador base no cubre. La carga exige concatenar ambos adaptadores con pesos [1.0, 1.0] y fusionarlos antes de la inferencia, un detalle critico que el autor subraya en la model card.

No se especifica en la informacion disponible el volumen de datos de entrenamiento, la composicion del corpus, la duracion total en horas ni si se aplicaron tecnicas de RLHF, DPO o ajuste por instrucciones. Tampoco se detalla el esquema de aumento de datos ni la politica de enmascaramiento de etiquetas usada durante el ajuste. Todos estos datos quedan como no disponibles.

## Capacidades

- Reconocimiento automatico del habla en cingales e ingles, con foco en enunciados que alternan ambos idiomas dentro de la misma locucion.
- Transcripcion de audio a 16 kHz, segun la unica indicacion de uso incluida en la model card.
- Composicion de dos adaptadores LoRA mediante concatenacion con pesos unitarios para producir un modelo fusionado unico.
- Ajuste del idioma de transcripcion y de los parametros de generacion por tarea de evaluacion.
- No se documentan capacidades de traduccion de voz, diarizacion de hablantes, deteccion de actividad vocal, tool calling, uso agentico ni modo de razonamiento explicito.
- Cobertura multilingue limitada a los dos idiomas declarados; no se indica soporte para otras lenguas, aunque el modelo base sea multilingue.

## Casos de uso

- Evaluacion academica de code-switching si-en: el modelo sirve como linea base reproducible (semilla y rango fijados) para comparar estrategias de adaptacion LoRA en corpus bilingues.
- Ablacion de adaptadores apilados: permite estudiar cuanto aporta un residual de rango 16 cuando ya existe un adaptador de rango 32 congelado, aislando el efecto de la alternancia de idioma.
- Reproducibilidad de resultados: al publicar semilla, alpha y criterio de seleccion de checkpoint, otro equipo puede repetir el ajuste y verificar las cifras del articulo asociado.
- Transcripcion de audio de atencion al cliente en Sri Lanka: interlocutores que mezclan cingales e ingles en una misma llamada, siempre que se valide previamente la calidad real del adaptador en ese dominio.
- Preetiquetado de corpus de voz bilingues: generar transcripciones iniciales para revision humana en proyectos de anotacion, reduciendo el coste frente a etiquetar desde cero.
- Prototipado de subtitulado en entornos con recursos limitados: al ser adaptadores sobre un modelo de 244 M de parametros, la inferencia cabe en hardware modesto y facilita pruebas rapidas antes de invertir en modelos mayores.
- Investigacion sobre olvido catastrofico: el diseno de adaptador congelado permite medir si la especializacion en code-switching degrada la transcripcion monolingue en cingales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de WER, BLEU, MMLU ni de ninguna otra metrica, y los resultados de busqueda web recuperados no guardan relacion con el modelo.

## Requisitos de hardware

- El modelo base openai/whisper-small tiene 244 M de parametros; en precision FP16 ocupa aproximadamente 0,5 GB de VRAM y en int8 en torno a 0,25 GB.
- Los adaptadores LoRA anaden un coste de memoria despreciable frente al modelo base, dado su rango reducido (16 y 32).
- Cabe con holgura en GPU de consumo: RTX 3060, RTX 4060, RTX 4090 o cualquier tarjeta con 4 GB o mas de VRAM. Tambien es viable en CPU, con mayor latencia.
- Para lotes grandes o procesamiento por lotes en servidor se recomiendan A100, H100 o L40S, aunque el modelo no las requiere.
- Opciones de despliegue: transformers junto con peft para cargar y fusionar los adaptadores; una vez fusionados, el modelo resultante se puede convertir a otros runtimes de Whisper (por ejemplo, formatos GGML o CTranslate2) con herramientas externas, aunque este flujo no esta documentado en la model card.
- No se dispone de datos de latencia, throughput en tokens por segundo ni consumo energetico.
- La carga requiere descargar el modelo base por separado y ejecutar la secuencia de composicion de adaptadores; no funciona invocando solo el repositorio de adaptadores.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| whisper-small-frozen-si32-cs16-seed42 | 244 M (base) + adaptadores LoRA de rango 16 y 32 | Ventanas de 30 s | Cingales e ingles (code-switching) | No disponible | Repositorio publico con 0 descargas |
| openai/whisper-small | 244 M | Ventanas de 30 s | Multilingue (modelo base) | MIT (segun el modelo base) | Ampliamente disponible |
| Ajuste completo de whisper-small para cingales | 244 M | Ventanas de 30 s | Cingales | Depende del autor | No disponible en la informacion proporcionada |
| whisper-medium | 769 M | Ventanas de 30 s | Multilingue | MIT (segun el modelo base) | Ampliamente disponible |

No se dispone de modelos comparables especificos de code-switching si-en con los que establecer una comparacion cuantitativa, ni de cifras de WER para ninguna de las filas.

## Limitaciones y advertencias

- Modelo anonimo publicado para revision por pares: no hay autor identificable, ni afiliacion, ni garantia de mantenimiento posterior.
- Licencia no disponible: no se puede asumir uso comercial permitido. La licencia del modelo base no se hereda automaticamente a los adaptadores si el autor no la declara.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad de transcripcion ni de mejora sobre el modelo base.
- Cero descargas y cero likes: el artefacto no ha sido validado por terceros.
- Acoplamiento obligatorio de adaptadores: usar un solo adaptador o pesos distintos de [1.0, 1.0] invalida el comportamiento previsto y puede degradar la transcripcion.
- El repositorio no incluye el modelo base; cualquier despliegue debe descargar openai/whisper-small por separado, con el coste y las condiciones de licencia correspondientes.
- Cobertura linguistica restringida a cingales e ingles: no hay datos sobre su comportamiento en castellano ni en otras lenguas.
- Riesgo de alucinacion inherente a los modelos Whisper en audio con ruido, silencios largos o habla solapada; no se documenta ningun mecanismo de mitigacion.
- No se detallan sesgos demograficos, acentuales ni de genero en los datos de entrenamiento.
- Sin informacion sobre el corpus de entrenamiento: se desconoce si los datos eran dominio publico, con consentimiento o con licencia compatible.
- Formato de pesos limitado a safetensors de adaptadores: la cuantizacion requiere fusionar primero y convertir despues con herramientas de terceros.
- Fecha de creacion declarada en 2026; conviene verificar la vigencia del enlace y de los pesos antes de integrarlos en produccion.

## Enlaces

- HuggingFace (adaptadores): https://huggingface.co/anonymous-asr-review/whisper-small-frozen-si32-cs16-seed42
- Modelo base: https://huggingface.co/openai/whisper-small
- Los resultados de busqueda web disponibles no contienen enlaces relacionados con el modelo; hacen referencia al colectivo de hacktivistas Anonymous y a una marca de calzado, por lo que se han descartado. No se han encontrado papers, blogs, repositorios ni demos asociados en la informacion proporcionada.
