# dianavdavidson/indic_whisper_hi_multi_gpu_mucs_62901_ratio_alldata_lr_1e-4_lgid_None_hinglish_mixed_scripts_FT

## Resumen

El modelo `dianavdavidson/indic_whisper_hi_multi_gpu_mucs_62901_ratio_alldata_lr_1e-4_lgid_None_hinglish_mixed_scripts_FT` es un checkpoint de reconocimiento automatico del habla (ASR) publicado por el usuario dianavdavidson en HuggingFace. Los tags del repositorio (`whisper`, `safetensors`) y el propio identificador (`indic_whisper`, `hi`, `hinglish_mixed_scripts`) indican que se trata de un ajuste fino de la familia Whisper de OpenAI orientado a hindi y a habla code-switching hindi-ingles (hinglish), con mezcla de alfabetos (devanagari y latin).

El checkpoint pesa 763.857.920 parametros (unos 764 M), un orden de magnitud propio de la variante `whisper-medium` (769 M), lo que lo situa en la gama media de la familia. El sufijo del nombre (`mucs_62901`, `ratio_alldata`, `lr_1e-4`, `multi_gpu`, `FT`) apunta a un entrenamiento supervisado a partir de un dataset completo con learning rate 1e-4 en configuracion multi-GPU, presumiblemente una submission asociada al reto MUCS. Se trata por tanto de un modelo de investigacion, no de un modelo de produccion validado.

La relevancia de este tipo de checkpoints esta en el nicho: el ASR comercial y los modelos generalistas rinden peor en habla code-switched (hindi-ingles) y en dominios especificos, y los ajustes finos sobre Whisper son la via habitual para cerrar esa brecha. No obstante, el repositorio no publica model card, pipeline, licencia ni idiomas declarados, y acumula 24 descargas y 0 likes, por lo que cualquier evaluacion debe hacerse de forma empirica antes de considerarlo para uso real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper (transformer encoder-decoder para ASR), segun el tag `whisper` del repositorio; estructura interna concreta no disponible |
| Parametros totales | 763.857.920 (aproximadamente 764 M), dato real de los pesos en safetensors |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en el repositorio. La familia Whisper procesa ventanas de audio de 30 s (1500 posiciones de encoder); no verificado para este checkpoint |
| Tipos de cuantizacion | No disponible. El repositorio solo publica pesos en safetensors, sin versiones GGUF, CTranslate2 ni cuantizaciones declaradas |
| Idiomas soportados | No disponible en los metadatos. El identificador sugiere hindi e hinglish (code-switching hindi-ingles) con mezcla de alfabetos |
| Licencia | No disponible |
| Formato de pesos | Safetensors |
| Tamano del repositorio | 18,3 GB (muy superior a los ~3 GB que ocuparian 764 M parametros en FP32, lo que sugiere artefactos de entrenamiento adicionales: checkpoints intermedios, optimizador u otros ficheros) |
| Fecha de creacion | 2026-09-16 (segun metadatos de HuggingFace) |
| Ultima actualizacion | 2026-09-17 (segun metadatos de HuggingFace) |
| Descargas / likes | 24 descargas / 0 likes |

## Arquitectura y entrenamiento

La unica evidencia disponible sobre la arquitectura es el tag `whisper` y el prefijo `indic_whisper` del identificador, que remiten a la familia Whisper de OpenAI: un transformer encoder-decoder con encoder convolucional sobre espectrogramas log-Mel y decoder autorregresivo con tokens de control de idioma y tarea. No hay informacion en el repositorio sobre el numero de capas, dimension del modelo, cabezas de atencion ni sobre si se ha modificado el vocabulario del tokenizer para acomodar escritura devanagari o texto mixto.

Respecto al entrenamiento, el nombre del checkpoint aporta pistas pero no detalles verificables: `mucs_62901` sugiere una participacion en el reto MUCS con identificador de sistema 62901; `ratio_alldata` indica que se entreno con la totalidad de los datos disponibles con una cierta proporcion de mezcla; `lr_1e-4` es la tasa de aprendizaje; `multi_gpu` senala entrenamiento distribuido; `FT` confirma ajuste fino; y `hinglish_mixed_scripts` describe el corpus objetivo (hindi-ingles code-switched con alfabetos mixtos). Se desconoce el numero de tokens o horas de audio, la composicion exacta del dataset, si hubo etapas de RLHF o DPO (poco habituales en ASR) y si se aplicaron tecnicas como decodificacion especulativa, LoRA o congelacion parcial de capas.

## Capacidades

- Transcripcion de voz a texto (ASR) mono-tono: capacidad base de cualquier modelo Whisper, presumiblemente preservada tras el ajuste fino.
- Reconocimiento de habla en hindi y en hinglish (code-switching hindi-ingles), segun lo indicado en el identificador del checkpoint.
- Manejo de texto con alfabetos mixtos (devanagari y latin) en la salida, si el ajuste fino ha modificado el comportamiento de decodificacion.
- Posible traduccion integrada voz-a-texto-ingles (tarea `translate` de Whisper), no confirmada para este checkpoint.
- Deteccion de actividad de voz e idioma por ventana: capacidades nativas de Whisper, no verificadas tras el ajuste.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (modelo ASR, no orientado a agentes).
- Capacidades de vision, audio-vision o thinking mode: no disponibles.
- Capacidades multilingues generales: no disponibles; el alcance declarado apunta a un unico par de lenguas (hindi-ingles).

## Casos de uso

- Transcripcion de habla hinglish en centros de contacto: el modelo estaria ajustado especificamente al code-switching hindi-ingles tipico de las conversaciones telefonicas en India, donde los modelos ASR genericos suelen degradarse al alternar lenguas dentro de la misma frase.
- Generacion de subtitulos para contenido audiovisual indio: permitiria transcribir videos con dialogos mixtos hindi-ingles manteniendo la grafia original en ambos alfabetos, siempre que la salida real del modelo confirme ese comportamiento.
- Creacion de datasets ASR etiquetados: puede usarse como anotador automatico de audio no etiquetado para pre-entrenar o ajustar otros modelos de la misma familia, con supervision humana posterior.
- Analisis de calidad en call centers: transcripcion de llamadas para alimentar sistemas de busqueda, clasificacion de motivos de contacto o deteccion de incumplimientos, asumiendo que el checkpoint supera en dominio a `whisper-medium` generico.
- Accesibilidad en tiempo real: subtitulado en vivo de reuniones o clases con participantes bilingues, sujeto a la latencia real del modelo una vez desplegado.
- Investigacion en ASR code-switched: comparacion de tecnicas de ajuste fino, mezcla de datos y tasas de aprendizaje frente al modelo base de Whisper, dado que el nombre codifica la configuracion de entrenamiento.
- Preseleccion y filtrado de audio para pipelines de anotacion: transcripcion masiva preliminar con revision humana posterior, aprovechando el coste bajo de un modelo de 764 M frente a variantes de mayor tamano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye model card, y la busqueda web realizada no devolvio ningun articulo, informe o tabla de resultados asociada a este checkpoint. El identificador `mucs_62901` sugiere que puede existir una evaluacion en el marco del reto MUCS, pero no se ha encontrado ninguna publicacion con cifras de WER, CER ni comparativas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en el repositorio. Para un modelo de ~764 M parametros en precision FP16, el peso de los parametros ocupa aproximadamente 1,5 GB, a lo que hay que anadir memoria para activaciones propias de la atencion sobre ventanas de 30 s de audio; en la practica, la familia Whisper en este tamano suele requerir del orden de 4 a 6 GB en FP16. Esta cifra es una estimacion por tamano, no un dato verificado para este checkpoint.
- GPU recomendadas: no disponibles. Por tamano, un modelo de esta escala cabe en GPU de consumo y de gama profesional sin necesidad de parallelism. GPU de datacenter (A100, H100) solo serian necesarias para procesamiento por lotes de alto volumen.
- GPU de consumo: previsiblemente compatible con tarjetas con 8 GB o mas de VRAM (RTX 3060 12 GB, RTX 4060 Ti, RTX 4070, RTX 4090), sujeto a verificacion empirica.
- Opciones de despliegue: el repositorio solo ofrece safetensors, por lo que es necesario cargarlo con `transformers` (o un framework compatible) para inferencia. Para optimizacion habria que convertir los pesos a otros formatos (CTranslate2 para faster-whisper, GGUF para whisper.cpp, vLLM o TGI para servicio), conversion no proporcionada ni validada por el autor.
- Almacenamiento: el repositorio ocupa 18,3 GB, por lo que la descarga completa exige ese espacio en disco aunque finalmente solo se usen los pesos del modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (`indic_whisper...hinglish_mixed_scripts_FT`) | 763.857.920 (~764 M) | No disponible (familia Whisper: ventanas de 30 s) | Ajuste fino de Whisper para hindi/hinglish | No disponible | Repositorio de 18,3 GB en HuggingFace, 24 descargas |
| Whisper medium (modelo base de OpenAI) | ~769 M | Ventanas de 30 s | ASR y traduccion multilingue generalista | MIT (licencia publica de la familia Whisper) | Ampliamente disponible en HuggingFace y convertido a multiples formatos |
| Whisper large-v3 (modelo base de OpenAI) | ~1,55 B | Ventanas de 30 s | ASR y traduccion multilingue generalista, mejor WER que medium | MIT (licencia publica de la familia Whisper) | Ampliamente disponible y con soporte en vLLM, whisper.cpp, faster-whisper |
| AI4Bharat IndicWhisper | No disponible en la informacion proporcionada | No disponible | Ajuste fino de Whisper para lenguas indias | No disponible en la informacion proporcionada | Repositorio publico del proyecto AI4Bharat |

La comparacion se limita a parametros y enfoque: no hay datos de WER ni de ningun otro benchmark para este checkpoint, por lo que no es posible afirmar que supere o iguale a las alternativas listadas en la tarea concreta de hinglish. Los valores de los modelos base de OpenAI y de AI4Bharat corresponden a informacion publica de esos proyectos y no se han verificado contra una fuente en esta busqueda.

## Limitaciones y advertencias

- Ausencia total de model card: no hay documentacion sobre datos de entrenamiento, metricas, limitaciones conocidas ni uso previsto. Esto impide auditar el modelo y hace arriesgado su uso en produccion.
- Licencia no declarada: sin licencia explicita no se puede asumir permiso de uso comercial. Ademas, al derivar de Whisper, hay que verificar las condiciones aplicables al modelo base empleado.
- Riesgo de alucinacion: los modelos Whisper son conocidos por generar texto plausible en segmentos de silencio, ruido o audio ininteligible, y por repetir bucles de frases. No hay informacion sobre si este ajuste mitiga ese comportamiento.
- Idiomas y dominio no verificados: la unica evidencia sobre el alcance linguistico es el nombre del checkpoint. No se garantiza un rendimiento aceptable fuera del dominio hindi/hinglish ni con acentos o registros distintos a los del corpus de entrenamiento.
- Longitud de contexto: al ser un modelo de la familia Whisper, el procesamiento se realiza en ventanas (habitualmente 30 s) con posible perdida de coherencia entre segmentos largos; no hay informacion sobre estrategias de chunking empleadas.
- Trazabilidad de la evaluacion: el identificador apunta a una submission a un reto (`mucs_62901`), lo que puede implicar ajuste sobre conjuntos de desarrollo especificos y sobreajuste a las condiciones de ese corpus.
- Adopcion muy baja: 24 descargas y 0 likes, sin issues ni discusiones publicas. No hay senales de que el checkpoint haya sido validado por terceros.
- Repositorio sobredimensionado: 18,3 GB para 764 M parametros indica la presencia de artefactos adicionales (posiblemente checkpoints de entrenamiento), lo que complica la descarga y el versionado en pipelines de CI/CD.
- Pesos solo en safetensors: no hay versiones cuantizadas ni formato GGUF, de modo que cualquier despliegue eficiente requiere una conversion propia y su correspondiente validacion de calidad.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/dianavdavidson/indic_whisper_hi_multi_gpu_mucs_62901_ratio_alldata_lr_1e-4_lgid_None_hinglish_mixed_scripts_FT
- Enlaces relevantes encontrados en la busqueda web: ninguno. La busqueda devolvio unicamente paginas de ayuda de YouTube sin relacion alguna con el modelo: https://support.google.com/youtubetv/?hl=en, https://support.google.com/youtube/answer/3227660?hl=fr&co=GENIE.Platform%3DAndroid, https://www.zhihu.com/question/1903231775980913051, https://www.zhihu.com/question/1945629068243481180, https://support.google.com/youtube/answer/9288567?hl=ru
- Paper, blog, repositorio de codigo o demo: no disponibles.
