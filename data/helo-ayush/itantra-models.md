# helo-ayush/itantra-models

## Resumen

iTantra Models es una coleccion de paquetes de modelos neuronales de conversion voz-texto (STT) y texto-voz (TTS) disenada especificamente para funcionar de forma completamente offline en dispositivos moviles Android. El repositorio, publicado por el autor helo-ayush bajo licencia Apache 2.0, agrupa los artefactos de una arquitectura de "transceptor neuronal" pensada para escenarios donde no hay conectividad a internet, en particular comunicaciones de emergencia y aplicaciones de campo.

En lugar de un unico modelo, el repositorio v1.0.0 distribuye packs independientes en formato de contenedor propietario `.itantra`, descargables desde el propio Hub. La parte de reconocimiento de voz se basa en AI4Bharat IndicConformer-120M (arquitectura Conformer-CTC) cuantizado a INT8 (~188 MB), mientras que la sintesis de voz emplea AI4Bharat Indic-TTS con FastPitch en FP16 mas un vocoder HiFi-GAN en FP16 (~130 MB). Se cubren diez idiomas: hindi, gujarati, marati, kannada, malabar, tamil, telugu, oriya, bengali e ingles (variantes en-IN).

El aspecto mas relevante es su enfoque de despliegue: los paquetes estan optimizados en tamano y en formato (ONNX) para ejecutarse en telefonos moviles sin conexion, e incluyen un diccionario de 12 intenciones de emergencia para comunicaciones en catastrofes. Es, por tanto, un proyecto orientado a la accesibilidad linguistica y la resiliencia en entornos con conectividad limitada, mas que un modelo generalista de proposito multiple.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | STT: Conformer-CTC (IndicConformer-120M); TTS: FastPitch + vocoder HiFi-GAN |
| Parametros totales | STT: 120 M; TTS: no disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (modelo de ASR/TTS por fragmentos, no de contexto largo) |
| Tipos de cuantizacion | INT8 (STT), FP16 (TTS) |
| Idiomas soportados | Hindi (hi-IN), gujarati (gu-IN), marati (mr-IN), kannada (kn-IN), malabar (ml-IN), tamil (ta-IN), telugu (te-IN), oriya (or-IN), bengali (bn-IN), ingles (en-IN) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (empaquetados en contenedores `.itantra`) |
| Tamano del repositorio | 2,7 GB (los packs individuales son mucho menores) |
| Plataforma objetivo | Android (inferencia offline) |

## Arquitectura y entrenamiento

El subsistema de reconocimiento de voz emplea IndicConformer-120M, un modelo de arquitectura Conformer (convolucion + atencion) con cabecera CTC, desarrollado por AI4Bharat. Se distribuye cuantizado a INT8, lo que reduce su huella a aproximadamente 188 MB y permite inferencia en CPU movil. El subsistema de sintesis de voz combina un modelo acustico FastPitch (FP16) con un vocoder neuronal HiFi-GAN (FP16), sumando unos 130 MB en total. Ambos componentes se exportan a ONNX para su ejecucion en el runtime de Android.

Sobre los datos de entrenamiento (numero de tokens, composicion del corpus, o si hubo etapas de RLHF/DPO) no se proporciona informacion en la documentacion disponible: se trata de modelos derivados de los proyectos de AI4Bharat, cuyo detalle de entrenamiento no se reproduce en esta ficha. La innovacion destacable del paquete no es tanto arquitectonica como de ingenieria de despliegue: la seleccion y cuantizacion de modelos para caber en un movil, el formato de contenedor propio y la inclusion de un diccionario de intenciones de emergencia para uso sin red.

## Capacidades

- Reconocimiento automatico del habla (STT) multilingue en 10 idiomas indoarios e ingles (variantes en-IN).
- Sintesis de voz (TTS) para los mismos idiomas mediante FastPitch + HiFi-GAN.
- Funcionamiento completamente offline, sin dependencia de servicios en la nube.
- Inferencia en dispositivos Android mediante ONNX.
- Deteccion de 12 intenciones universales orientadas a comunicaciones de emergencia y catastrofes.
- Descarga selectiva de packs por idioma a traves de un catalogo (`catalogue.json`).
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio mas alla de la propia tarea de voz.

## Casos de uso

- Comunicacion de emergencias en catastrofes: en una zona sin cobertura, la app puede reconocer comandos o frases de socorro y sintetizar respuestas de voz, apoyandose en el diccionario de 12 intenciones de emergencia incluido.
- Asistentes de voz en zonas rurales sin conectividad: comunidades con acceso intermitente a internet pueden usar interfaces habladas en su idioma local (por ejemplo, tamil o bengali) sin enviar audio a un servidor.
- Accesibilidad para personas con discapacidad visual: lectura de pantalla y dictado por voz en el idioma materno del usuario, funcionando de forma local en el telefono.
- Aplicaciones sanitarias de campo: personal medico en areas remotas puede dictar notas o consultar respuestas por voz sin depender de red, reduciendo riesgos de privacidad al no salir el audio del dispositivo.
- Educacion multilingue: aplicaciones de aprendizaje de lectura o pronunciacion que ofrecen retroalimentacion de voz en distintos idiomas indios de forma offline.
- Kioscos interactivos o terminales de atencion en zonas con red limitada: interaccion por voz en el idioma del ciudadano sin infraestructura de servidores.
- Navegacion y asistencia vehicular offline: instrucciones habladas y reconocimiento de comandos de voz en vehiculos o entornos industriales sin conexion estable.
- Atencion al ciudadano en lenguas minoritarias: interfaz de voz que permite a hablantes de oriya o malabar interactuar con un servicio local sin intermediarios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Huella de modelo muy reducida: aproximadamente 188 MB (STT INT8) mas unos 130 MB (TTS FP16), alrededor de 318 MB en pesos.
- Disenado para ejecutarse en telefonos Android de gama media mediante ONNX, presumiblemente en CPU y con posible aceleracion por NNAPI, GPU o DSP (no confirmado en la documentacion).
- Cabe sin dificultad en cualquier GPU de consumo e incluso en sistemas integrados; no requiere GPU dedicada para inferencia.
- En escritorio o servidor puede ejecutarse en CPU sin necesidad de acelerador.
- Opciones de despliegue: ONNX Runtime (formato nativo del paquete). Otros motores como llama.cpp, vLLM, Ollama o TGI no aplican a este tipo de modelo ASR/TTS.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| iTantra Models (este) | STT + TTS empaquetado | STT 120 M; TTS no disponible | Fragmentos de audio, offline, movil | Apache 2.0 | HuggingFace |
| OpenAI Whisper | STT | 39 M – 1550 M (segun variante) | 30 s de audio, multilingue | MIT | Abierta |
| Meta MMS | STT | Variable por idioma | Multilingue (mas de 1000 idiomas) | CC-BY-NC 4.0 | Abierta |
| AI4Bharat IndicConformer-120M | STT (modelo base) | 120 M | Idiomas indicos, offline | Verificar en el repositorio original | Abierta |

Nota: no se dispone de resultados de rendimiento comparativos en la informacion proporcionada; la comparacion anterior es unicamente estructural.

## Limitaciones y advertencias

- No se han publicado datos de benchmarks, por lo que no es posible verificar la calidad de transcripcion o sintesis frente a alternativas.
- El repositorio registra cero descargas y cero valoraciones, lo que indica ausencia de validacion por parte de la comunidad.
- La documentacion es escasa: no se detallan datos de entrenamiento, sesgos conocidos ni evaluaciones por idioma.
- El alcance linguistico se limita a diez idiomas indios e ingles (en-IN); no se documenta soporte de otras lenguas.
- El formato de contenedor `.itantra` es propietario y requiere el cliente Android correspondiente, lo que limita su reutilizacion fuera del ecosistema previsto.
- Aunque el repositorio declara licencia Apache 2.0, conviene verificar las licencias de los modelos base de AI4Bharat (IndicConformer e Indic-TTS) antes de un uso comercial.
- Riesgo de alucinacion o errores de reconocimiento inherente a los modelos ASR/TTS, especialmente en audio con ruido, acentos no cubiertos o vocabulario tecnico; no disponible la magnitud concreta.
- No se documentan mecanismos de seguridad, filtrado de contenido ni mitigaciones de sesgo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/helo-ayush/itantra-models
- Catalogo de packs: https://huggingface.co/helo-ayush/itantra-models/raw/main/catalogue.json
- Plantilla de descarga de packs individuales: https://huggingface.co/helo-ayush/itantra-models/resolve/main/{tag}-1.0.0.itantra
- Las busquedas web realizadas no devolvieron enlaces relevantes al modelo (los resultados obtenidos corresponden a servicios no relacionados con el proyecto).
