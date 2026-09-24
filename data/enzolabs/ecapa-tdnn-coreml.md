# enzolabs/ecapa-tdnn-coreml

## Resumen

enzolabs/ecapa-tdnn-coreml es la conversion a Core ML del modelo de verificacion de hablante ECAPA-TDNN de SpeechBrain (speechbrain/spkrec-ecapa-voxceleb). No es un modelo de lenguaje generativo: es un extractor de embeddings de hablante que, dada una ventana de caracteristicas log-mel de audio a 16 kHz, devuelve un vector de 192 dimensiones que representa la identidad vocal de quien habla. El autor (enzolabs) lo publica para poder reconocer la misma voz entre distintas grabaciones directamente en macOS y otros dispositivos Apple, sin depender de PyTorch en tiempo de inferencia.

El bundle distribuido (ecapa-tdnn-coreml.zip, ~38,8 MB) contiene el modelo compilado speaker.mlmodelc junto con el extractor de caracteristicas (mel_filterbank.npy y window.npy). La entrada es mel_features con forma [1, 80, 301] (80 bandas log-mel, 301 tramas) y la salida es embedding con forma [1, 192]. La conversion se realizo con coremltools 9.0 sobre PyTorch 2.8.0.

La relevancia actual esta en el despliegue on-device: al ser un modelo pequeno y empaquetado en formato Core ML, permite ejecutar verificacion y agrupacion de hablantes de forma local, sin enviar audio a la nube, en equipos con Apple Silicon. Se publica bajo licencia Apache-2.0, la misma del modelo original de SpeechBrain.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ECAPA-TDNN (base SpeechBrain spkrec-ecapa-voxceleb), convertida a Core ML |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; entrada fija mel_features [1, 80, 301] (80 bandas log-mel, 301 tramas) |
| Tipos de cuantizacion | no disponible (se distribuye como modelo Core ML compilado, .mlmodelc) |
| Idiomas soportados | no disponible (modelo de identidad vocal, agnostico al idioma; base entrenada sobre VoxCeleb) |
| Licencia | Apache-2.0 |
| Formato de pesos | Core ML (.mlmodelc, empaquetado en ecapa-tdnn-coreml.zip) |
| Dimension del embedding de salida | 192 |
| Entrada del modelo | mel_features [1, 80, 301] |
| Salida del modelo | embedding [1, 192] |
| Frecuencia de muestreo | 16 kHz |
| Ficheros auxiliares | mel_filterbank.npy, window.npy |
| Tamano del bundle | ~38,8 MB (zip; la version inicial en GitHub pesaba 62,0 MB) |
| Herramientas de conversion | coremltools 9.0, PyTorch 2.8.0 |
| Modelo base | speechbrain/spkrec-ecapa-voxceleb |

## Arquitectura y entrenamiento

El modelo es una conversion del sistema ECAPA-TDNN de SpeechBrain, una arquitectura basada en redes TDNN (Time-Delay Neural Network) con atencion de canal y agregacion multi-escala, disenada especificamente para extraer representaciones compactas de la identidad de un hablante. La salida no es texto ni etiquetas, sino un embedding de 192 dimensiones sobre el que se calcula similitud (por ejemplo, similitud coseno) para tareas de verificacion e identificacion de hablante.

No se dispone de informacion en la documentacion proporcionada sobre el numero de tokens, la composicion exacta del dataset de entrenamiento ni sobre si se aplicaron tecnicas de RLHF o DPO; se trata, en cualquier caso, de un modelo discriminativo, no generativo, entrenado por SpeechBrain sobre corpus de habla tipo VoxCeleb (deducible del nombre spkrec-ecapa-voxceleb). La innovacion aportada por esta ficha concreta es el empaquetado: la conversion a Core ML con coremltools 9.0 y la eliminacion de un embedder experimental sin uso que acompanaba a la distribucion inicial en GitHub. Segun el autor, el modelo de hablante en si no cambio y produce embeddings identicos en ambas versiones.

## Capacidades

- Extraccion de embeddings de hablante de 192 dimensiones a partir de caracteristicas log-mel de 80 bandas.
- Verificacion de hablante: determinar si dos fragmentos de audio corresponden a la misma persona.
- Identificacion de hablante: asignar una grabacion al hablante registrado mas probable.
- Agrupacion (clustering) de voces para diarizacion de audio.
- Funcionamiento on-device mediante Core ML, sin necesidad de PyTorch en inferencia.
- Independencia del contenido linguistico: la representacion se basa en caracteristicas acusticas de la voz, no en las palabras pronunciadas.
- No soporta generacion de texto, razonamiento, codigo, vision, tool calling ni modo "thinking" (no es un modelo generativo ni un LLM).

## Casos de uso

- Autenticacion biometrica por voz en aplicaciones macOS/iOS: se calcula el embedding de una frase de verificacion y se compara con el embedding registrado del usuario mediante similitud coseno.
- Diarizacion de reuniones grabadas: segmentar el audio, extraer un embedding por segmento y agrupar por similitud para atribuir cada intervencion a un hablante.
- Indexado y busqueda de archivos de audio por voz: generar embeddings de una biblioteca de grabaciones para localizar todas las intervenciones de una persona concreta.
- Preprocesado de transcripciones: etiquetar quien habla en cada turno antes o despues de pasar el audio por un sistema ASR, mejorando la legibilidad de la transcripcion.
- Deteccion de cambios de locutor en tiempo real: calcular embeddings sobre ventanas deslizantes para marcar cuando cambia la persona que habla durante un streaming o una llamada.
- Antifraude y control de acceso: comparar la voz entrante con la voz de referencia de un cliente para detectar suplantaciones en atencion telefonica.
- Verificacion de locutor en pipelines de datos: depurar y limpiar datasets de audio agrupando y descartando grabaciones duplicadas o atribuidas al hablante equivocado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de EER, exactitud de verificacion ni comparaciones numericas con otros sistemas de embeddings de hablante.

## Requisitos de hardware

- El bundle es muy ligero (~38,8 MB), por lo que cabe sin problema en cualquier Mac con Apple Silicon y en iPhone/iPad compatibles con Core ML.
- Al ser formato Core ML, se ejecuta de forma nativa sobre CPU, GPU y Neural Engine de Apple mediante la API Core ML, sin requerir una GPU dedicada NVIDIA.
- No se especifican requisitos minimos de memoria ni de version de sistema operativo en la informacion proporcionada.
- Opciones de despliegue: Core ML (modelo .mlmodelc) en apps nativas de Apple; el modelo base speechbrain/spkrec-ecapa-voxceleb puede ejecutarse en PyTorch/SpeechBrain en otras plataformas.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- No se documentan rutas de despliegue para vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo generativo.

## Comparativa con modelos similares

| Modelo | Arquitectura | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|
| enzolabs/ecapa-tdnn-coreml | ECAPA-TDNN (Core ML) | Core ML (.mlmodelc) | Apache-2.0 | HuggingFace |
| speechbrain/spkrec-ecapa-voxceleb | ECAPA-TDNN (PyTorch) | PyTorch | Apache-2.0 | HuggingFace (modelo base) |
| Otros extractores de embeddings de hablante (pyannote, WeSpeaker, TitaNet) | diversa | PyTorch / ONNX | no disponible | HuggingFace / GitHub |

La diferencia principal frente al modelo base es el formato: enzolabs/ecapa-tdnn-coreml ofrece el mismo modelo ECAPA-TDNN listo para Core ML, mientras que speechbrain/spkrec-ecapa-voxceleb requiere PyTorch. No se dispone de datos de rendimiento que permitan comparar numericamente con alternativas como pyannote, WeSpeaker o TitaNet.

## Limitaciones y advertencias

- No es un modelo generativo: solo produce embeddings; cualquier tarea de texto requiere un componente adicional.
- La entrada es fija ([1, 80, 301]); es imprescindible reproducir el preprocesado correcto con mel_filterbank.npy y window.npy y muestrear a 16 kHz, o los embeddings seran incorrectos.
- El rendimiento en verificacion depende de umbrales de similitud y de la calidad/duracion del audio; no se documentan tasas de error.
- Al derivar de un modelo entrenado sobre VoxCeleb, puede heredar sesgos de ese corpus (idioma, acento, genero, condiciones de grabacion dominantes).
- No se documentan sesgos especificos ni evaluaciones de equidad en la informacion proporcionada.
- Riesgo de confusion entre voces similares y de degradacion con ruido, reverberacion o audio muy corto; no cuantificado en la documentacion.
- Licencia Apache-2.0: permite uso comercial, con la obligacion habitual de conservar avisos de copyright y licencia; el modelo base tambien es Apache-2.0 (atribucion a SpeechBrain).
- La version actual elimina un embedder experimental sin uso presente en la distribucion inicial de GitHub; segun el autor, el modelo de hablante es identico. Se cita un SHA-256 de la version antigua (6ffc6dcf6bc8ff8c49f069607825d817130296bcdf692e1f3c76eb478fdbdcfd) para distinguirla.
- El repositorio registra 0 descargas y 1 "like" en el momento de la consulta, por lo que no hay evidencia de adopcion ni validacion por terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/enzolabs/ecapa-tdnn-coreml
- Modelo base en HuggingFace: https://huggingface.co/speechbrain/spkrec-ecapa-voxceleb
- SpeechBrain: https://speechbrain.github.io/
- coremltools: https://github.com/apple/coremltools
- Core ML (Apple Developer): https://developer.apple.com/documentation/coreml
