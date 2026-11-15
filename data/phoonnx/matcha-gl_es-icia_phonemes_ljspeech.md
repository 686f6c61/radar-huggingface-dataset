# Phoonnx/matcha-gl_es-icia_phonemes_ljspeech

## Resumen

matcha-gl_es-icia_phonemes_ljspeech es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura Matcha-TTS, desarrollado originalmente por Proxecto Nós y empaquetado por Phoonnx en formato ONNX para su uso con la librería phoonnx. El modelo genera audio a partir de fonemas del gallego (gl-ES) usando el alfabeto y fonemizador Cotovia, lo que lo convierte en una pieza específica para la síntesis de voz en lengua gallega.

El modelo se distribuye como un artefacto ONNX listo para inferencia, con un tamaño de repositorio de 0,1 GB, lo que indica un modelo compacto orientado a despliegue ligero. Su pipeline es text-to-speech y su licencia es Apache 2.0, heredada del modelo upstream.

Su relevancia radica en cubrir una lengua de bajos recursos como el gallego dentro de un ecosistema de TTS open source (phoonnx/OVOS), permitiendo integrar síntesis de voz gallega en asistentes y aplicaciones con una dependencia mínima. No es un modelo de lenguaje generativo, sino un acústico TTS especializado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Matcha-TTS (modelo acústico TTS, no transformer de lenguaje) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrada por fonemas, no por tokens de contexto) |
| Tipos de cuantizacion | no disponible (formato ONNX; cuantizaciones no especificadas) |
| Idiomas soportados | gallego (gl-ES) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Matcha-TTS, un modelo acústico de síntesis de voz basado en flow matching condicionado por fonemas, que en este caso se empaqueta como grafo ONNX para inferencia con phoonnx. La entrada de texto no es texto crudo, sino fonemas del gallego generados por el fonemizador Cotovia (`CotoviaPhonemizer` de `scriptconv.phonemizers.gl`), lo que implica que el front-end textual se delega a la librería scriptconv.

El modelo upstream es `proxectonos/Nos_TTS-icia-matcha-phonemes-ljspeech`, desarrollado por Proxecto Nós. La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; el nombre sugiere el uso del corpus LJSpeech (adaptado o en gallego) junto con datos del proyecto Icia. No se documentan innovaciones técnicas adicionales más allá del propio paradigma Matcha-TTS y el empaquetado ONNX.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto en gallego, previa fonemización con Cotovia.
- Generación de audio en formato WAV mediante `voice.synthesize_wav`.
- Integración con el ecosistema OVOS a través del plugin `ovos-tts-plugin-phoonnx`.
- Normalización y conversión de texto delegadas a scriptconv (extra `scriptconv[gl]`).
- No soporta tool calling, function calling, agentes ni razonamiento multi-step (no es un modelo de lenguaje).
- No dispone de modo thinking, visión ni audio de entrada.
- Capacidad multilingüe limitada exclusivamente al gallego (gl-ES).

## Casos de uso

- Asistentes de voz en gallego: integración en OVOS mediante `ovos-tts-plugin-phoonnx` configurando la voz `proxectonos/icia-matcha-phonemes-ljspeech` en `mycroft.conf`, permitiendo respuestas habladas en gallego en un asistente doméstico.
- Lectura de contenido web en gallego: conversión de artículos o noticias a audio usando el pipeline `synthesize_wav` sobre texto normalizado por scriptconv.
- Accesibilidad para personas con discapacidad visual: generación de audio de documentos y textos en gallego con un modelo ligero (0,1 GB) desplegable en local.
- Señalización y anuncios automatizados: síntesis de mensajes pregrabados o dinámicos en estaciones, comercios o servicios públicos de Galicia.
- Audiolibros y podcasting de bajo coste: generación por lotes de narración en gallego con inferencia ONNX en CPU o GPU modesta.
- Prototipado de aplicaciones de voz: al ser un artefacto ONNX pequeño, se puede embeber en aplicaciones Python sin infraestructura pesada, útil para demos y pruebas de concepto en gallego.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; el repositorio ocupa 0,1 GB, por lo que la huella de memoria es reducida y compatible con GPU de gama baja.
- GPU recomendadas: no especificadas; por tamaño, cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) es suficiente, y probablemente también CPU.
- Cabe en GPU consumer: sí, dado el tamaño del artefacto (0,1 GB).
- Opciones de despliegue: phoonnx (Python), plugin OVOS `ovos-tts-plugin-phoonnx`; el formato ONNX permite ejecución con ONNX Runtime.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| matcha-gl_es-icia_phonemes_ljspeech | Matcha-TTS | gallego (gl-ES) | no aplica | Apache 2.0 | ONNX |
| proxectonos/Nos_TTS-icia-matcha-phonemes-ljspeech | Matcha-TTS | gallego (gl-ES) | no aplica | Apache 2.0 | no disponible |
| Otros modelos de la colección Matcha-TTS de Phoonnx | Matcha-TTS | varios | no aplica | según modelo | ONNX |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en gallego; no admite otros idiomas.
- Requiere el front-end Cotovia (`scriptconv[gl]`) para fonemizar; sin él, la entrada no es válida.
- No es un modelo de lenguaje: no genera texto, no razona ni soporta tool calling.
- Riesgo de pronunciación incorrecta en neologismos, siglas o nombres propios no cubiertos por el fonemizador.
- Posibles sesgos acústicos derivados del corpus de entrenamiento (voz única o limitada, según el dataset upstream), no documentados.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia y condiciones del modelo upstream y del corpus de entrenamiento.
- Alucinación en sentido estricto no aplica, pero puede producir artefactos acústicos o prosodia anómala en textos largos o mal normalizados.
- Información técnica (parámetros, dataset, benchmarks) no publicada; evaluar calidad auditiva antes de producción.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/matcha-gl_es-icia_phonemes_ljspeech
- Modelo upstream: https://huggingface.co/proxectonos/Nos_TTS-icia-matcha-phonemes-ljspeech
- Colección Matcha-TTS de Phoonnx: https://huggingface.co/collections/Phoonnx/matcha-tts-6af8ea8f6a5b1af4d985d2ad
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
