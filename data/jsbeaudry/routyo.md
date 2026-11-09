# jsbeaudry/Routyo

## Resumen

Routyo es un clasificador de audio especializado en identificación de idioma hablado (spoken language identification) para cuatro lenguas: criollo haitiano (ht), inglés (en), francés (fr) y español (es). Lo desarrolla jsbeaudry, un autor independiente que forma parte de un equipo haitiano, y se publica bajo licencia Apache 2.0. El modelo resuelve un problema concreto: enrutar cada frase de una conversación al modelo de voz o de lenguaje correcto cuando se mezclan Kreyòl y otras lenguas, sin intervención manual del usuario.

Se construye sobre el encoder de Whistle (Cactus-Compute/whistle), un modelo de reconocimiento de voz diseñado para ejecutarse en CPU, al que se añade una cabeza de clasificación ligera y un encoder afinado específicamente para criollo haitiano. El resultado es un artefacto de unos 50 MB que corre en CPU a unos 35 ms por frase en un Mac con Apple Silicon, lo que lo hace apto para despliegue on-device en aplicaciones móviles.

Su relevancia radica en la cobertura de una lengua de bajos recursos como el Kreyòl (más de 12 millones de hablantes) y en el enfoque de datos sintéticos multilingües para evitar que el acento o la voz del hablante delaten el idioma. Según la model card, supera ampliamente a Whisper large-v3-turbo en esta tarea de cuatro vías, especialmente en criollo haitiano hablado por voces extranjeras.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder Whistle congelado (stock + variante afinada en Kreyòl) + cabeza de clasificación por frames con pooling atencional; ensemble de 3 cabezas |
| Parametros totales | no disponible (pesos en `routyo.npz` y `routyo.json`; tamano del repo 0.1 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (clasificación por frase; ventana de decisión desde 1,5 s de audio) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ht (criollo haitiano), en, fr, es |
| Licencia | Apache 2.0 |
| Formato de pesos | `.npz` (NumPy), `.json` (arrays planos para portabilidad), `.cact` (encoders Whistle para el motor Cactus needle) |

## Arquitectura y entrenamiento

Routyo no es un transformer generativo, sino un pipeline de clasificación compuesto por tres piezas. La primera son dos encoders congelados: el encoder estándar de Whistle (`whistle.cact`, descargado del repo original) y un Whistle afinado en Kreyòl (`whistle-kreyol.cact`, incluido en este repo). Cada encoder produce 512 dimensiones por cada 80 ms de audio mediante `needle_embed`; Routyo concatena ambos para obtener 1.024 dimensiones por frame. La segunda pieza es la cabeza (`routyo.npz`): capas por frame de 1.024 → 256 → 256 con ReLU, seguidas de media y dispersión atencional sobre el tiempo junto a la media y dispersión simples, y una salida de 4 lenguas. Se entrenan tres cabezas con semillas distintas y se promedian sus log-probabilidades, cada una calibrada en temperatura. La tercera pieza es una comprobación léxica opcional (`word_check.json`): Whistle transcribe la frase forzada a cada idioma y la probabilidad media de palabra se combina con la puntuación acústica según `score_k = (log p[k] + β·wp[k] + c_k) / T`, con β, c y T ajustados solo en validación.

El encoder afinado en Kreyòl se obtuvo fine-tuning de Whistle sobre unas 145 horas de voz transcrita, mayoritariamente criollo haitiano más algo de francés, inglés y español (FLEURS) para preservar esas lenguas; como transcriptor alcanza un 14,6 % de WER en el conjunto de test de Kreyòl. Los datos de entrenamiento combinan voz real (Kreyòl 12,4 h; inglés 6,3 h; español 3,9 h; francés 3,1 h, procedentes de FLEURS, MInDS-14 y VoxPopuli) y voz sintética generada específicamente para que ni la voz ni el acento revelen el idioma: 13 voces haitianas con Fatiman V3 (TTS propio de Kreyòl), 102 voces extranjeras clonadas hablando Kreyòl, y voces nativas con gradium/phonon-40m-multilingual. Los textos son frases cotidianas con el mismo significado en las cuatro lenguas para que el tema no delate el idioma.

## Capacidades

- Identificación de idioma hablado entre cuatro lenguas (ht, en, fr, es) con una tasa de confianza por lengua.
- Funciona con cualquier voz y cualquier acento: un haitiano hablando inglés se clasifica como inglés y un extranjero hablando Kreyòl se clasifica como Kreyòl.
- Modo "pair": comparación restringida entre Kreyòl y una sola otra lengua, pensado para aplicaciones de interpretación.
- Decisión temprana: puede clasificar a partir de los primeros 1,5 s de habla.
- Comprobación léxica opcional que combina transcripción forzada con la puntuación acústica para mayor precisión.
- Ejecución en CPU on-device (unos 35 ms por frase de 8,7 s de media en Apple Silicon), sin GPU.
- API en Python (`Routyo.rates()`) que acepta ficheros WAV o muestras float32 mono a 16 kHz.
- Formato `routyo.json` con arrays planos y regla de combinación para portar el modelo a cualquier runtime (lo que carga una app de móvil).

## Casos de uso

- Enrutado de voz en asistentes multilingües: Routyo se coloca delante de varios modelos de reconocimiento o de lenguaje y envía cada frase al modelo del idioma detectado, permitiendo conversaciones que mezclan Kreyòl, inglés, francés y español sin botones ni menús.
- Aplicaciones de interpretación ht↔en/fr/es: el modo `--pair ht,en` (o con otra lengua) ofrece una decisión binaria calibrada con alta precisión (98,5–99,8 % en los conjuntos de test), adecuada para seleccionar el motor de traducción o de TTS correcto en cada turno.
- Subtitulado y transcripción automática de contenido audiovisual haitiano: al detectar el idioma por frase, un pipeline puede encadenar el modelo ASR adecuado (el encoder Kreyòl afinado frente a un ASR estándar para en/fr/es) y reducir errores en grabaciones donde se alternan lenguas.
- Atención al cliente en centros de contacto del Caribe y la diáspora: clasificación en tiempo real de la lengua del cliente para enrutar la llamada al agente o al bot correcto, con un coste de 35 ms por frase en CPU que permite procesar streams de audio sin infraestructura GPU.
- Aplicaciones móviles on-device: con unos 50 MB de peso y ejecución en CPU, el modelo cabe en un smartphone y permite detección de idioma sin enviar audio a la nube, lo que reduce latencia y preserva la privacidad.
- Investigación lingüística y corpus multilingües: etiquetado automático de idioma en grabaciones de campo con hablantes de Kreyòl y de las otras tres lenguas, útil para segmentar y anotar corpus de lenguas de bajos recursos.
- Filtrado y moderación de audio: identificar la lengua de clips subidos por usuarios para aplicar políticas, modelos de contenido o flujos de revisión específicos por idioma.

## Benchmarks y rendimiento

Resultados publicados en la model card (precisión de cuatro vías sobre frases completas; conjuntos no usados en entrenamiento):

| Conjunto de test | Clips | Routyo (+ word check) | Routyo, solo sonido | Whisper large-v3-turbo |
|---|---|---|---|---|
| Habla real, otras personas | 1.751 | 99,7 % (pair 99,8) | 99,7 % | 91,7 % |
| Voces sintéticas nunca vistas en entrenamiento | 2.130 | 96,6 % (pair 98,5) | 95,2 % | 51,5 % |
| Voces sintéticas haitianas anteriores, reservadas | 628 | 96,7 % (pair 97,9) | 97,1 % | 64,6 % |
| Un hablante haitiano, en directo desde un teléfono | 47 | 93,6 % (pair 97,9) | 89,4 % | 74,5 % |

Desglose por condición:

| Condición | Routyo | Whisper large-v3-turbo |
|---|---|---|
| Kreyòl hablado por voces extranjeras | 97,3 % | 27,9 % |
| Voces haitianas hablando inglés, francés o español | 95,1 % | 31,9 % |
| Solo primeros 1,5 s, habla real (solo sonido) | 92,7 % (pair 96,2) | no disponible |
| Solo primeros 1,5 s, voces no vistas (solo sonido) | 87,4 % (pair 93,4) | no disponible |

Velocidad en Mac con Apple Silicon sobre 200 frases reales de 8,7 s de media:

| Configuración | Por frase | Tamano |
|---|---|---|
| Routyo, solo sonido (CPU) | 35 ms | ~50 MB |
| Routyo + word check (CPU) | ~0,3 s | ~50 MB |
| Whisper large-v3-turbo, detección de idioma (GPU del Mac) | 0,8 s | 1,5 GB |

## Requisitos de hardware

- Inferencia en CPU: no requiere GPU; unos 35 ms por frase de 8,7 s en Apple Silicon y ~0,3 s con la comprobación léxica.
- Huella en disco y memoria: aproximadamente 50 MB en total, más el encoder Whistle estándar que se descarga en el primer uso.
- GPU recomendadas: no aplica; el modelo está diseñado para CPU y despliegue on-device.
- Cabe en cualquier equipo de consumo, incluidos móviles y Raspberry Pi; no se han publicado requisitos mínimos de CPU ni cifras de throughput en otras plataformas.
- Opciones de despliegue: motor Cactus needle (`cactus-needle` 3.2.1 y 3.2.10 probados), script `routyo.py` con CLI, API Python `Routyo`, y portabilidad mediante `routyo.json` a cualquier runtime.
- Dependencias: `cactus-needle`, `numpy`, `soundfile`, `soxr`, `huggingface_hub`.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Contexto / ventana | Precisión en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Routyo | Clasificador de idioma hablado (encoder Whistle + cabeza) | ht, en, fr, es | Frase completa o primeros 1,5 s | 99,7 % habla real; 96,6 % voces sintéticas no vistas | Apache 2.0 | Hugging Face (~50 MB, CPU) |
| Whisper large-v3-turbo | ASR generativo con detección de idioma | Multilingüe (amplio) | Ventana de 30 s | 91,7 % habla real; 51,5 % voces sintéticas no vistas | MIT (según el modelo original de OpenAI) | Hugging Face (1,5 GB, GPU recomendada) |
| Cactus-Compute/whistle | ASR on-device (modelo base de Routyo) | Multilingüe (según su model card) | no disponible | no disponible como clasificador de 4 vías | no disponible en la información proporcionada | Hugging Face |

## Limitaciones y advertencias

- Solo cubre cuatro lenguas (ht, en, fr, es); cualquier otra se forzará a una de ellas, con riesgo de clasificación errónea.
- El modelo es un clasificador, no un transcriptor: no genera texto salvo en la comprobación léxica interna.
- La precisión cae con audio corto: con solo 1,5 s de habla baja al 92,7 % en habla real y al 87,4 % en voces no vistas.
- El conjunto de test de un solo hablante en directo es muy pequeño (47 clips), por lo que la cifra del 93,6 % tiene alta incertidumbre.
- Parte del entrenamiento usa voz sintética generada con TTS propio; el comportamiento en dominios acústicos muy alejados (ruido de fondo intenso, telefonía de baja calidad) no está documentado.
- No se han publicado datos sobre sesgos demográficos, dialectales ni de género más allá de la cobertura de acentos descrita.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de falsos positivos en la comprobación léxica cuando la transcripción forzada es de baja calidad.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las licencias de los modelos base (Whistle y los TTS usados en la generación de datos) antes de redistribuir derivados.
- El repo tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en noviembre de 2026; no hay validación independiente de los resultados publicados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jsbeaudry/Routyo
- Modelo base Whistle: https://huggingface.co/Cactus-Compute/whistle
- Motor Cactus needle: https://github.com/cactus-compute/needle
- Modelo TTS multilingüe usado en datos sintéticos: https://huggingface.co/gradium/phonon-40m-multilingual
