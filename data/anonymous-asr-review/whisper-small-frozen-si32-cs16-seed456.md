# anonymous-asr-review/whisper-small-frozen-si32-cs16-seed456

## Resumen

whisper-small-frozen-si32-cs16-seed456 es un conjunto de adaptadores LoRA publicado por el usuario anonimo anonymous-asr-review sobre el modelo base openai/whisper-small, orientado al reconocimiento automatico del habla (ASR) en escenarios de cambio de codigo (code-switching) entre sinhala (si) e ingles (en). No es un modelo completo: se distribuye como pesos PEFT en formato safetensors que deben cargarse sobre los pesos originales de Whisper small, descargados por separado.

La particularidad del artefacto es su esquema de entrenamiento en dos etapas: un adaptador de rango 32 para sinhala se entrena primero y despues se congela, y sobre el se entrena un segundo adaptador de rango 16 que captura el residuo de code-switching. Ambos adaptadores deben activarse simultaneamente con peso unitario (1.0 y 1.0) y combinarse mediante concatenacion para reproducir el comportamiento previsto por el autor, tal como se documenta en la model card.

El modelo se presenta explicitamente como material suplementario anonimo para revision por pares, con semilla 456, alpha de LoRA 32 y seleccion del mejor checkpoint. Esto implica que su proposito inmediato es la reproducibilidad de un experimento academico, no el despliegue en produccion. El repositorio figura con 0 descargas, 0 likes y un tamano reportado de 0.0 GB, y no declara licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) con adaptadores LoRA (PEFT) sobre atencion; rango 16 y rango 32 |
| Parametros totales | Modelo base openai/whisper-small: 244 M (dato del modelo base, no declarado en esta ficha); parametros de los adaptadores: no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Ventanas de audio de 30 s (entrada mel de 1500 frames), propia de Whisper small; no disponible un valor alternativo en la informacion facilitada |
| Tipos de cuantizacion | No disponible. Los adaptadores se distribuyen en safetensors; la cuantizacion del modelo base no se especifica |
| Idiomas soportados | Sinhala (si), ingles (en) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA); el modelo base se descarga aparte desde openai/whisper-small |
| Libreria | peft |
| Pipeline | automatic-speech-recognition |
| Alpha de LoRA | 32 |
| Semilla | 456 |
| Seleccion de checkpoint | best |
| Tamano del repositorio | 0.0 GB (segun el Hub) |

## Arquitectura y entrenamiento

El modelo base es Whisper small, un transformer encoder-decoder con 244 M de parametros que procesa audio a 16 kHz convertido a espectrogramas mel logaritmicos de 80 canales, con ventanas de 30 segundos y 1500 posiciones de entrada. Sobre esa arquitectura se aplican adaptadores LoRA (Low-Rank Adaptation) que modifican un subconjunto de las matrices de peso, manteniendo congelados los pesos originales. En este repositorio conviven dos adaptadores: uno de rango 32 asociado al sinhala y otro de rango 16 asociado al residuo de cambio de codigo.

El procedimiento descrito en la model card es un entrenamiento residual en dos fases: el adaptador de rango 32 se entrena primero y, una vez congelado, se entrena el adaptador de rango 16 mientras el primero permanece activo. La inferencia requiere cargar ambos (nombrados "si" y "cs"), combinarlos con pesos [1.0, 1.0] mediante combination_type="cat" y fusionarlos con merge_and_unload. El autor fija semilla 456, alpha 32 y selecciona el mejor checkpoint, pero no publica el numero de tokens de audio, la composicion del dataset de entrenamiento, el esquema de aumento de datos ni si se aplicaron tecnicas de RLHF o DPO. Tampoco especifica los modulos objetivo (q_proj, v_proj, etc.) sobre los que se insertan las matrices de bajo rango.

## Capacidades

- Transcripcion de audio a texto en sinhala e ingles, con foco declarado en enunciados que alternan ambos idiomas dentro de una misma intervencion.
- Reconocimiento de habla en ventanas de hasta 30 segundos por pasada, con la posibilidad de encadenar ventanas para audio mas largo mediante el pipeline estandar de Whisper.
- Seleccion de idioma y parametros de generacion configurables por parte del usuario, segun indica la model card.
- Composicion de adaptadores: soporta la activacion simultanea de dos adaptadores LoRA con pesos ponderados, combinacion por concatenacion y fusion posterior en un unico modelo.
- No se declara soporte de tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo puramente de ASR.
- No se declaran capacidades de vision, audio clasificacion, diarizacion ni traduccion supervisada mas alla de la generacion de texto del decoder de Whisper.
- Capacidades multilingues limitadas a los dos idiomas etiquetados; no se documenta transferencia a otros idiomas.

## Casos de uso

- Transcripcion de centros de contacto en Sri Lanka: el modelo esta disenado para conversaciones que alternan sinhala e ingles, un patron habitual en soporte telefonico urbano; se integraria como servicio de ASR detras de un motor de analitica de conversaciones.
- Subtitulado automatico de contenido audiovisual bilingue: uso del encoder-decoder para generar subtitulos con marcas de tiempo en videos donde los hablantes cambian de idioma a mitad de frase, reduciendo la necesidad de dos pasadas separadas por idioma.
- Anotacion asistida de corpus de code-switching: preetiquetado de grabaciones para proyectos de linguistica que necesitan transcripciones iniciales revisadas despues por anotadores humanos.
- Actas y notas de reunion en entornos corporativos multilingues: transcripcion de reuniones donde los participantes alternan terminos tecnicos en ingles dentro de discursos en sinhala.
- Transcripcion de consultas medicas o legales: dictado de profesionales que mezclan terminologia clinica o juridica en ingles con explicaciones en sinhala, con la advertencia de que requiere revision humana.
- Evaluacion comparativa de metodos PEFT en ASR: al estar identificado con semilla, rango y seleccion de checkpoint, sirve como punto de referencia reproducible en estudios sobre adaptadores apilados y entrenamiento congelado.
- Prototipado de asistentes de voz locales: al ser un modelo de 244 M de parametros con adaptadores ligeros, puede ejecutarse en hardware modesto para demos de dictado o busqueda por voz sin enviar audio a servicios externos.
- Investigacion sobre olvido catastrofico: el esquema de adaptador congelado mas adaptador residual es un banco de pruebas util para medir si la segunda fase degrada la tarea de la primera.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de error de palabra (WER), error de caracter (CER), resultados en LibriSpeech, Common Voice ni ninguna otra metrica, y tampoco se proporcionan comparaciones con el modelo base o con adaptadores individuales.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB solo para los pesos del modelo base en fp16 (244 M de parametros), a los que se suman activaciones y cache del decoder; en la practica se puede operar por debajo de 2 GB en fp16 y alrededor de 0,3-0,5 GB con cuantizacion int8. Los adaptadores anaden un coste marginal. Estas cifras son estimaciones a partir del tamano del modelo base, no datos publicados por el autor.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM es suficiente; una RTX 3060, RTX 4060 o RTX 4090 ejecutarian el modelo con holgura. Para lotes grandes o varias instancias concurrentes, una A100 o H100 no aportan ventaja relevante por el reducido tamano del modelo.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo moderna (GTX 1650 4 GB en adelante) y tambien en CPU, donde la transcripcion es viable aunque mas lenta.
- Opciones de despliegue: transformers + peft es obligatorio para cargar los dos adaptadores y combinarlos como indica la model card. Tras aplicar merge_and_unload, el modelo fusionado se puede convertir a CTranslate2 para usarlo con faster-whisper o a GGUF para whisper.cpp. El soporte de vLLM y TGI para Whisper con esta combinacion concreta de adaptadores no esta confirmado en la informacion disponible.
- Latencia y throughput: no disponible. No se han publicado mediciones de RTF (real-time factor), latencia por ventana de 30 s ni tokens por segundo. Nota adicional: el repositorio figura con un tamano de 0.0 GB, lo que sugiere que los pesos pueden no estar efectivamente subidos; conviene verificar los archivos antes de planificar cualquier despliegue.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| whisper-small-frozen-si32-cs16-seed456 | Base 244 M + adaptadores LoRA (rango 16 y 32) | Ventanas de 30 s | si, en | no disponible | HuggingFace, 0 descargas |
| openai/whisper-small | 244 M | Ventanas de 30 s | Multilingue (amplio conjunto) | MIT segun la model card del modelo base | HuggingFace, ampliamente desplegado |
| openai/whisper-medium | 769 M | Ventanas de 30 s | Multilingue | MIT segun la model card del modelo base | HuggingFace |
| openai/whisper-large-v3 | 1550 M | Ventanas de 30 s | Multilingue | MIT segun la model card del modelo base | HuggingFace |

La comparacion relevante no es de tamano sino de especializacion: frente a whisper-small generico, este artefacto anade un ajuste especifico para code-switching sinhala-ingles, pero renuncia a la cobertura multilingue amplia del modelo original y no publica metricas que permitan cuantificar la mejora. No se dispone de datos sobre otros adaptadores LoRA comparables en el mismo par de idiomas.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor. Al entrenarse sobre un corpus no especificado, puede heredar sesgos de acento, genero, edad o variedad dialectal del sinhala presentes en los datos.
- Riesgo de alucinacion: inherente a los modelos de la familia Whisper, que pueden generar texto plausible en tramos de silencio, ruido o audio ininteligible. No hay evaluacion publicada que acote este riesgo en este modelo.
- Limitaciones de contexto e idioma: ventanas de 30 s por pasada y soporte declarado unicamente para sinhala e ingles. El rendimiento fuera de esos dos idiomas no esta caracterizado y previsiblemente sera deficiente.
- Restriccion de uso: la carga requiere activar los dos adaptadores juntos con peso unitario; usarlos por separado o con otros pesos invalida el comportamiento previsto y no esta documentado.
- Ausencia de licencia: al no declararse licencia, no hay autorizacion explicita de uso comercial ni de redistribucion. Debe tratarse como material de investigacion restringido hasta que el autor la especifique.
- Caracter anonimo y de revision: el repositorio se describe como modelo suplementario anonimo para revision por pares. No hay mantenimiento, soporte ni versionado garantizados, y los identificadores pueden desaparecer.
- Ausencia de metricas: sin WER ni CER publicados, no es posible verificar que el ajuste mejore al modelo base ni estimar su calidad en produccion.
- Repositorio con 0.0 GB reportados y 0 descargas: existe el riesgo de que los pesos no esten disponibles o esten incompletos; verificar antes de depender de ellos.
- Para produccion: exigiria validacion propia en el dominio objetivo, control de calidad de las transcripciones y, en aplicaciones sensibles (sanidad, legal, banca), revision humana obligatoria.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/anonymous-asr-review/whisper-small-frozen-si32-cs16-seed456
- Modelo base: https://huggingface.co/openai/whisper-small
- Libreria PEFT: https://huggingface.co/docs/peft
- Nota sobre la busqueda web: los resultados obtenidos no guardan relacion con este modelo; corresponden a paginas sobre el colectivo de hacktivistas Anonymous y a una marca de calzado, por lo que no se incluyen como referencias. No se han encontrado papers, blogs, repositorios ni demos asociados a este modelo en la informacion proporcionada.
