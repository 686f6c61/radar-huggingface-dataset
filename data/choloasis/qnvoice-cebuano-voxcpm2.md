# CholoAsis/qnvoice-cebuano-voxcpm2

## Resumen

QnVoice Cebuano es un perfil de voz para síntesis de habla (text-to-speech) en cebuano (bisaya, código ISO `ceb`) desarrollado por CholoAsis, orientado a inferencia completamente offline en dispositivos iOS. Se distribuye como un adaptador sobre los pesos compartidos de QnVoice VoxCPM2 en formato GGUF, con cuantización Q4_K_M para las capas de lenguaje y Q8_0 selectiva para las capas acústicas. El paquete incluye la onda de referencia sintética, las características codificadas del AudioVAE y la configuración necesaria para que la aplicación QnVoice pueda sintetizar voz sin conexión.

El modelo resuelve un problema concreto: no existían perfiles de voz en cebuano empaquetados para ejecución local en iPhone o iPad dentro de un pipeline VoxCPM2. La relevancia actual radica en que demuestra que un TTS neuronal de 2,08 GB de pesos puede ejecutarse en hardware móvil de gama alta con latencias de 3,14 a 4,67 segundos por petición, sin depender de servicios en la nube.

La información pública es limitada: el repositorio de Hugging Face ocupa 0,0 GB (los pesos se descargan de la release compartida de VoxCPM2), no tiene descargas ni likes registrados y la model card no detalla la arquitectura interna del modelo base más allá de su nombre y del runtime utilizado (llama.cpp-omni, fork de tc-mb).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VoxCPM2 (modelo base); detalles internos no disponibles |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q4_K_M (capas de lenguaje) y Q8_0 selectiva (capas acústicas) |
| Idiomas soportados | cebuano (`ceb`); la app incluye traducción inglés-cebuano separada |
| Licencia | `qnvoice-synthetic-reference` (licencia personalizada, etiquetada como `other`); pesos VoxCPM2 subyacentes bajo Apache 2.0 |
| Formato de pesos | GGUF (pesos compartidos de 2,08 GB) más onda de referencia WAV y características float32 del AudioVAE |

## Arquitectura y entrenamiento

El modelo es un adaptador (relación `base_model_relation: adapter`) sobre `CholoAsis/qnvoice-filipino-voxcpm2-gguf`. La arquitectura subyacente es VoxCPM2, un sistema TTS que combina un codificador AudioVAE con un modelo de lenguaje para generar las características acústicas a partir de una onda de referencia. La model card no especifica el número de parámetros, la composición del dataset de entrenamiento ni si se aplicaron técnicas de alineamiento como RLHF o DPO.

El perfil cebuano se materializa en dos artefactos: una onda de referencia sintética (que condiciona el timbre de la voz generada) y las características codificadas por el AudioVAE correspondientes. El runtime de referencia es `llama.cpp-omni` en el commit `e0eca9d8f57ac8f5a5ad6191a8007b93436c1e71`, que permite ejecutar los pesos GGUF tanto desde CLI como desde la app iOS. La app usa directamente las características float32 del AudioVAE en el dispositivo, mientras que el CLI lee la onda WAV de referencia.

## Capacidades

- Síntesis de voz en cebuano a partir de texto escrito, con salida WAV.
- Ejecución completamente offline: no requiere conexión de red tras la descarga inicial de los pesos compartidos.
- Integración con iOS mediante un único contexto de sesión de habla compartido entre los dos presets de idioma de la app.
- Modo de lectura en cebuano y modo de traducción desde inglés dentro de la app QnVoice (el traductor inglés-cebuano se distribuye por separado).
- Reconocimiento de voz en inglés en el dispositivo mediante las API de iOS, previo a la traducción.
- Selección de referencia: el CLI permite usar `--research-reference` para evaluar la referencia diseñada de forma independiente descrita en el paper.
- No se documentan capacidades de tool calling, agentes, visión, audio de entrada en el modelo ni modo de razonamiento.

## Casos de uso

- Lectura de texto en cebuano en dispositivos iOS: la app QnVoice permite escribir o pegar texto y obtener audio sintetizado sin conexión, adecuado para usuarios que necesitan accesibilidad o lectura de contenido en bisaya en entornos sin red.
- Traducción y locución de inglés a cebuano: el flujo combina el reconocimiento de voz en inglés de iOS con el traductor empaquetado y el TTS cebuano, útil para señalización o atención bilingüe en Filipinas.
- Aplicaciones de aprendizaje de idiomas: el perfil de voz permite generar ejemplos de pronunciación en cebuano con una latencia de 3,5 segundos medianos en iPhone 15 Pro, suficiente para ejercicios interactivos.
- Señalización y anuncios en establecimientos: frases cortas como precios o avisos ("Tagpila ang usa ka kilo nga mangga?") pueden pregenerarse como WAV y reproducirse en kioscos o altavoces locales.
- Investigación en TTS de bajos recursos: el perfil sirve como referencia reproducible para evaluar VoxCPM2 en una lengua de bajos recursos con métricas de error de caracteres y palabras publicadas.
- Prototipado de asistentes de voz offline: el runtime `llama.cpp-omni` permite integrar el modelo en pipelines locales de escritorio (probado en Apple M1 Pro) sin depender de APIs externas.
- Validación de despliegue móvil de TTS neuronal: útil para equipos que necesitan medir latencia real de un modelo de 2,08 GB en hardware Apple antes de comprometerse con una arquitectura.

## Benchmarks y rendimiento

| Métrica | Referencia seleccionada (compartida) | Referencia de investigación |
|---|---|---|
| Error de carácter (CER) en 16 frases cebuano pareadas, BuzzASR | 3,32 % | 5,63 % |
| Error de palabra (WER) en 16 frases cebuano pareadas, BuzzASR | 18,89 % | 32,22 % |

| Métrica de latencia | Valor |
|---|---|
| Rango de latencia en iPhone 15 Pro (6 peticiones escritas) | 3,14–4,67 s de envío a reproducción |
| Mediana de las 5 peticiones posteriores | 3,54 s |
| Dispositivo de referencia adicional | Apple M1 Pro (muestras de audio) |

Las puntuaciones miden la concordancia de transcripción automática en esas frases; las valoraciones de oyentes fluidos quedan pendientes según la model card. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Memoria: iPhone o iPad con al menos 6 GB de RAM; requisito explícito de la model card.
- Almacenamiento: 2,08 GB para los pesos GGUF compartidos, más la onda de referencia y las características del AudioVAE.
- GPU recomendadas: no se especifican modelos de GPU de escritorio; las pruebas documentadas usan iPhone 15 Pro y Apple M1 Pro.
- Cabe en GPU de consumo: no disponible como dato verificado; el despliegue documentado es móvil y Apple Silicon.
- Opciones de despliegue: runtime `llama.cpp-omni` (commit fijado) con CLI `speak.py` y binario `voxcpm2-cli`; la app QnVoice para iOS.
- Latencia y throughput: 3,14–4,67 s por petición en iPhone 15 Pro; no se documenta throughput en tokens por segundo ni latencia en otros dispositivos.

## Comparativa con modelos similares

| Modelo | Idioma | Formato | Licencia | Despliegue offline | Datos de rendimiento |
|---|---|---|---|---|---|
| QnVoice Cebuano (este modelo) | cebuano | GGUF + AudioVAE | qnvoice-synthetic-reference | Sí, iOS y CLI | CER 3,32 %, WER 18,89 %, latencia 3,14–4,67 s |
| QnVoice Filipino VoxCPM2 GGUF (modelo base) | filipino | GGUF | no disponible en esta ficha | Sí | no disponible |
| Otros TTS multilingües de referencia | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente en la documentación proporcionada para comparar con alternativas concretas de la misma categoría (TTS en lenguas filipinas o TTS móvil offline) en parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- La evaluación se limita a 16 frases pareadas en cebuano y a un único dispositivo (iPhone 15 Pro); no hay validación con oyentes nativos fluidos.
- El CER y WER se miden con BuzzASR, un transcriptor automático; no equivalen a una evaluación perceptiva de naturalidad o prosodia.
- El modelo solo cubre cebuano; el soporte de otros idiomas depende del traductor externo de la app y del reconocimiento de voz de iOS, no del modelo TTS.
- Requiere al menos 6 GB de memoria en el dispositivo; no funcionará en iPhones o iPads con menos RAM.
- Los pesos compartidos (2,08 GB) se descargan de una release externa; la verificación mediante `--fetch --verify` es necesaria para garantizar integridad.
- La licencia `qnvoice-synthetic-reference` permite uso personal y comercial de las referencias sintéticas con requisito de citación para apps que las utilicen; los pesos VoxCPM2 subyacentes están bajo Apache 2.0, por lo que hay que cumplir ambas condiciones.
- No se documentan sesgos lingüísticos, riesgo de alucinación acústica ni comportamiento ante texto fuera de dominio; la información disponible no permite evaluarlos.
- El repositorio de Hugging Face no contiene los pesos (0,0 GB), lo que puede complicar la reproducibilidad si la release externa deja de estar disponible.
- El runtime está fijado a un commit concreto de un fork de llama.cpp; cambios en ese fork pueden romper la compatibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CholoAsis/qnvoice-cebuano-voxcpm2
- Modelo base: https://huggingface.co/CholoAsis/qnvoice-filipino-voxcpm2-gguf
- Runtime y instrucciones de compilación (llama.cpp-omni, commit fijado): https://github.com/tc-mb/llama.cpp-omni/tree/e0eca9d8f57ac8f5a5ad6191a8007b93436c1e71/tools/omni/voxcpm2
- White paper: QnVoice-Cebuano-Text-to-Speech-for-iOS.pdf (incluido en el repositorio del modelo)
- Resultados por frase: evaluation.json (incluido en el repositorio del modelo)
- Términos de la referencia: LICENSE (incluido en el repositorio del modelo)
- Texto de la licencia Apache 2.0: Apache-2.0.txt (incluido en el repositorio del modelo)
- Atribución: NOTICE (incluido en el repositorio del modelo)
