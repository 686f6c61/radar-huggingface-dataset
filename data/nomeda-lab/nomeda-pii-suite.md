# nomeda-lab/nomeda-pii-suite

## Resumen

Nomeda PII Suite es una suite de modelos ligeros desarrollada por nomeda-lab para la deteccion y redaccion de informacion personal identificable (PII) en tres modalidades: texto, imagen y audio. El repositorio agrupa tres componentes independientes coordinados por un router que activa unicamente la rama necesaria segun el tipo de entrada, lo que permite un despliegue en dispositivo con un coste computacional muy bajo. El modelo principal de texto es un etiquetador a nivel de caracter (CharTagger) de 2,5 millones de parametros; el detector de imagen (CenterLite) tiene 0,6 millones; y la rama de audio combina un codificador Whisper-base con una BiGRU, sumando unos 20 millones. En total, el repositorio declara 23.938.055 parametros en formato safetensors.

La suite esta orientada especificamente al tratamiento de datos en arabe e ingles, con especial enfasis en el primero, un idioma tradicionalmente poco cubierto por las herramientas comerciales de anonimizacion. Resuelve el problema de redactar PII en flujos heterogeneos (documentos escaneados, transcripciones de llamadas, texto libre) sin necesidad de enviar datos a servicios externos, lo que resulta relevante para equipos que trabajan con requisitos de privacidad y soberania del dato.

Su relevancia actual radica en la combinacion de tamano reducido (apto para ejecucion en CPU o GPU de consumo), cobertura multilingue arabe-ingles y una licencia de tipo "other" que exige revisar las condiciones del autor antes de un uso comercial. No obstante, las limitaciones declaradas por el propio autor son significativas: el detector de imagen solo se entreno con documentos sinteticos y la evaluacion de audio con habla humana real esta pendiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Suite multimodal: CharTagger (texto, etiquetado por caracter), CenterLite detector (imagen, deteccion de objetos tipo center-based), Whisper-base encoder + BiGRU (audio) |
| Parametros totales | 23.938.055 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Arabe (ar), ingles (en) |
| Licencia | other |
| Formato de pesos | safetensors |

Desglose por rama segun la model card: texto 2,5 M de parametros, imagen 0,6 M, audio ~20 M.

## Arquitectura y entrenamiento

La suite no es un unico transformer, sino tres modelos especializados unidos por un router de entrada. La rama de texto emplea un etiquetador a nivel de caracter (CharTagger) que produce spans de PII mapeados a las clases PERSON, PHONE, EMAIL, ADDRESS, NATIONAL_ID, DATE_PRIVATE, FINANCIAL, OTHER_ID y SECRET, complementado con una capa de expresiones regulares y validacion de checksum para identificadores nacionales egipcios, telefonos, IBAN, tarjetas y correo electronico. La rama de imagen usa un detector CenterLite que localiza cajas de texto PII, fotografias y firmas para aplicar desenfoque, pixelado o ennegrecido. La rama de audio combina el codificador de Whisper-base con una BiGRU para predecir spans temporales de PII y silenciar el audio resultante.

El entrenamiento del modulo de texto se realizo con cinco conjuntos publicos de PII en arabe (con etiquetas unificadas mediante reglas) mas datos sinteticos, reservando las particiones de test para evaluacion y sin entrenar sobre ellas. El detector de imagen se entreno exclusivamente con documentos falsos sinteticos. La rama de audio se entreno con clips TTS compuestos. No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Redaccion de PII en texto: deteccion de spans a nivel de caracter y sustitucion por etiquetas como `[PERSON]` o `[PHONE]`.
- Capa determinista complementaria: expresiones regulares y checksums para identificadores nacionales egipcios, telefonos, IBAN, tarjetas y correo electronico.
- Redaccion de PII en imagen: deteccion de cajas de texto PII, fotografias y firmas, con salida de imagen desenfocada, pixelada o ennegrecida mas las cajas detectadas.
- Redaccion de PII en audio: deteccion de spans temporales y generacion de una copia del audio con esos tramos silenciados.
- Enrutamiento automatico por modalidad: el router decide que rama ejecutar segun el tipo de entrada, evitando cargar trabajo innecesario.
- Ejecucion en dispositivo (on-device) con modelos de muy bajo numero de parametros.
- Soporte bilingue arabe-ingles en la rama de texto.
- Integracion via paquete pip (`nomeda-pii-suite[speech]`) o uso directo del codigo incluido en el repositorio.

## Casos de uso

- Anonimizacion de registros de atencion al cliente en arabe: la rama de texto detecta nombres, telefonos e identificadores nacionales en conversaciones y tickets antes de almacenarlos o enviarlos a analitica, con la ventaja de ejecutarse localmente sin exponer los datos a terceros.
- Redaccion de documentos escaneados: la rama de imagen localiza texto PII, fotografias y firmas en digitalizaciones y genera una copia desenfocada o ennegrecida, util para compartir expedientes con areas no autorizadas.
- Cumplimiento en transcripciones de llamadas: la rama de audio silencia los tramos con datos personales en grabaciones, produciendo una version apta para archivo o auditoria interna.
- Preprocesado de datasets para entrenamiento: limpieza de corpus arabes e ingleses antes de usarlos en el ajuste de otros modelos, reduciendo el riesgo de memorizar datos personales.
- Enmascarado en pipelines de datos de salud o finanzas: la capa de checksum para IBAN, tarjetas e identificadores nacionales permite detectar y sustituir numeros de cuenta en registros estructurados y texto libre.
- Despliegue en entornos con requisitos de soberania del dato: al ser modelos de pocos millones de parametros, se pueden ejecutar en servidores modestos o en el propio dispositivo del usuario, sin salida de datos a la nube.
- Filtrado previo en herramientas de soporte interno: integracion en un formulario o chat para avisar al usuario antes de enviar informacion sensible, usando el router para procesar texto pegado o imagenes adjuntas.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son las metricas de desarrollo declaradas por el autor, no comparativas con otros modelos:

| Rama | Metrica | Valor |
|---|---|---|
| Texto | leak_rate | 0,010 |
| Texto | over_redaction | 0,011 |
| Texto | class_acc | 0,984 |
| Imagen | leak_rate | 0,001 |
| Imagen | mean_coverage | 0,995 |
| Imagen | over_blur | 0,018 |
| Audio | evaluacion con habla real | pendiente |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 23,9 M de parametros totales, el conjunto cabe holgadamente en menos de 1 GB en precision completa y en unos cientos de MB en cuantizaciones de 8 o 4 bits, aunque no se detallan cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU de consumo moderna es suficiente; tambien es viable la ejecucion en CPU para las ramas de texto e imagen.
- Cabe en GPU de consumo: si, incluidas RTX 3060, RTX 4060, RTX 4090 y GPUs integradas con suficiente memoria compartida; el cuello de botella real es el codificador Whisper-base de la rama de audio.
- Opciones de despliegue: el paquete pip `nomeda-pii-suite` o la carga directa del repositorio con `snapshot_download`; no se documenta soporte especifico para vLLM, llama.cpp, Ollama ni TGI, dado que no es un modelo generativo de texto.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| nomeda-lab/nomeda-pii-suite | 23,9 M | no disponible | ar, en | other | Suite multimodal de redaccion PII (texto, imagen, audio) |
| Microsoft Presidio | no disponible (basado en spaCy/transformers) | depende del modelo subyacente | multilingue | MIT | Redaccion de PII en texto |
| GLiNER | segun variante (decenas a cientos de M) | no disponible | multilingue | Apache 2.0 en variantes publicas | Extraccion de entidades zero-shot |

No se dispone de datos de rendimiento comparativos entre estos sistemas en la informacion proporcionada; la comparativa se limita a parametros, licencia y cobertura de modalidades.

## Limitaciones y advertencias

- El detector de imagen se entreno unicamente con documentos falsos sinteticos; el propio autor recomienda verificar la transferencia a documentos reales antes de usarlo en produccion.
- La rama de audio se entreno con clips TTS compuestos y la evaluacion con habla humana real esta pendiente, por lo que su comportamiento en grabaciones reales no esta validado.
- La rama de texto se entrena con cinco conjuntos publicos cuyas licencias varian y algunas son poco claras, lo que puede afectar a la redistribucion o al uso comercial.
- La licencia es "other": es imprescindible revisar las condiciones del autor antes de cualquier uso comercial.
- Es una ayuda a la redaccion, no una garantia de cumplimiento normativo; el autor lo indica explicitamente.
- Riesgo de alucinacion o de falsos positivos y negativos en la deteccion de spans, con metricas de desarrollo que no cubren todos los dominios.
- Cobertura linguistica limitada a arabe e ingles; no se documenta soporte de castellano ni de otras lenguas.
- No se especifican sesgos conocidos ni longitud de contexto en la informacion disponible.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere escasa validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nomeda-lab/nomeda-pii-suite
