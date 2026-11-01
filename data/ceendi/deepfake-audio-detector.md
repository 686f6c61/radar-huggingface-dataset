# Ceendi/deepfake-audio-detector

## Resumen

DeepfakeDetector es un detector de audio falsificado (anti-spoofing) que clasifica una grabacion de voz como autentica (REAL) o sintetica (FAKE). Lo publica el autor Ceendi como parte de su proyecto de diploma, y el repositorio contiene dos modelos complementarios: un wav2vec 2.0 XLS-R de 300 millones de parametros afinado con una cabeza de clasificacion, y una CNN entrenada sobre espectrogramas log-mel. El primero se ofrece en formato ONNX con pesos externos y esta pensado para el modo "preciso"; el segundo se distribuye como checkpoint de PyTorch Lightning y da soporte al modo "rapido" y a la generacion de mapas de calor de espectrograma.

El modelo resuelve un problema concreto: distinguir voz real de voz generada por sistemas de sintesis (TTS) o conversion de voz (VC), algo relevante para verificacion de locutores, moderacion de contenido y analisis forense de audio. Ambos modelos se han entrenado exclusivamente con el corpus ASVspoof 2019 LA, un benchmark de referencia en anti-spoofing, y el repositorio ocupa 1,4 GB.

Es relevante ahora porque el despliegue en ONNX permite integrarlo en pipelines sin depender de PyTorch, y porque el proyecto original incluye verificacion de integridad por SHA-256 de los pesos descargados. La contrapartida es una licencia estrictamente de investigacion y educacion, sin uso comercial, y un alcance de generalizacion limitado a los sistemas de sintesis presentes en ASVspoof 2019.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo 1: wav2vec 2.0 XLS-R (transformer) con cabeza de clasificacion; modelo 2: CNN sobre espectrogramas log-mel |
| Parametros totales | Modelo 1: 300 M (base `facebook/wav2vec2-xls-r-300m`); modelo 2: no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX sin cuantizar y en checkpoint de PyTorch Lightning) |
| Idiomas soportados | no disponibles (el corpus de entrenamiento ASVspoof 2019 LA es en ingles) |
| Licencia | `other` / `research-only`: solo investigacion y educacion, sin uso comercial |
| Formato de pesos | ONNX con pesos externos (`.onnx` + `.onnx.data`) y checkpoint `.ckpt` de PyTorch Lightning |

## Arquitectura y entrenamiento

El modelo principal parte de `facebook/wav2vec2-xls-r-300m`, un encoder transformer auto-supervisado multilingue de 300 millones de parametros, al que se le anade una cabeza de clasificacion binaria y se afina de forma supervisada. La segunda rama es una CNN que opera directamente sobre espectrogramas log-mel y produce tanto la clasificacion como mapas de calor que permiten interpretar que regiones del espectrograma activan la decision. El checkpoint de la CNN se nombra con su metrica de validacion (`epoch=49`, `val_eer=0.0816`), lo que indica un error equal-rate de 0,0816 (8,16 %) en validacion.

El entrenamiento se ha realizado unicamente sobre ASVspoof 2019 LA, el subconjunto de ataques de sintesis y conversion de voz de ese corpus. No se documenta en la informacion disponible el numero de tokens, la composicion exacta del dataset ni si se aplicaron etapas de RLHF o DPO; en un problema de clasificacion binaria de audio estas etapas no tendrian sentido. El preprocesado, los umbrales de decision y el codigo de inferencia viven en el directorio `audio-detector/` del repositorio de GitHub, y el detector descarga los pesos desde un commit fijado y comprueba su SHA-256 contra `audio-detector/models.toml`.

## Capacidades

- Clasificacion binaria de audio de voz en dos clases: bona fide (REAL) y spoofed (FAKE).
- Deteccion de voz sintetica generada por TTS y por conversion de voz, dentro del dominio cubierto por ASVspoof 2019 LA.
- Modo "preciso" basado en wav2vec 2.0 XLS-R de 300 M, con mayor coste computacional.
- Modo "rapido" basado en la CNN sobre log-mel, con menor coste.
- Generacion de mapas de calor de espectrograma para interpretar la decision del modelo CNN.
- Inferencia en ONNX para el modelo wav2vec 2.0, con pesos externos.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio generativo ni modo de razonamiento extendido; el modelo es un clasificador, no un generador.

## Casos de uso

- Verificacion de locutor en autenticacion por voz: el modelo actua como segunda barrera que descarta muestras sinteticas antes de comparar contra una huella de locutor registrada, reduciendo ataques de suplantacion por TTS o VC.
- Moderacion de contenido audiovisual: procesar los audios subidos a una plataforma y marcar como sospechosos los que el detector clasifique como FAKE, derivando a revision humana los casos con puntuacion proxima al umbral.
- Analisis forense de grabaciones: usar el modo preciso sobre fragmentos de voz para obtener una senal adicional sobre la autenticidad de una prueba, acompanada de los mapas de calor del modelo CNN como evidencia visual del espectrograma.
- Filtrado previo en datasets de voz: descartar muestras sinteticas al construir corpus de entrenamiento para modelos de reconocimiento o diarizacion, evitando contaminacion por audio generado.
- Evaluacion de sistemas TTS y de conversion de voz: medir la tasa de deteccion de un generador concreto contra el detector para estimar su robustez anti-spoofing antes de publicarlo.
- Despliegue en pipelines ligeros: usar el modelo ONNX o el checkpoint CNN en servicios de inferencia sin PyTorch completo, con verificacion de integridad de pesos por SHA-256 en el arranque.
- Investigacion academica en anti-spoofing: reproducir el pipeline del proyecto de diploma y comparar el EER de validacion con otras aproximaciones sobre ASVspoof 2019 LA.

## Benchmarks y rendimiento

| Metrica | Valor | Modelo |
|---|---|---|
| EER de validacion | 0,0816 (8,16 %) | CNN sobre log-mel, epoch 49 |

No se han publicado resultados de benchmarks en la informacion disponible para el modelo wav2vec 2.0 afinado, ni comparaciones con otros sistemas sobre el conjunto de evaluacion de ASVspoof 2019 LA.

## Requisitos de hardware

- Modelo wav2vec 2.0 XLS-R de 300 M: en precision completa requiere del orden de 1,2 GB solo para pesos, mas activaciones; en una GPU de 8-16 GB cabe con holgura. El repositorio pesa 1,4 GB en total, incluyendo ambos modelos.
- CNN sobre log-mel: tamano de pesos no disponible; por su naturaleza es el modelo mas ligero de los dos y el candidato para ejecucion en CPU.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) es suficiente para el modelo wav2vec 2.0; la CNN deberia ejecutarse en CPU sin problema, aunque no se dispone de cifras de latencia.
- Cabe en GPU consumer: si, para ambos modelos.
- Opciones de despliegue: ONNX Runtime para el modelo wav2vec 2.0 (formato nativo del repositorio); PyTorch Lightning o PyTorch para el checkpoint CNN. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que son stacks orientados a modelos generativos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Formato |
|---|---|---|---|---|---|
| DeepfakeDetector (este) | 300 M (wav2vec 2.0) + CNN sin cuantificar | no disponible | EER validacion 0,0816 (CNN) | research-only | ONNX + ckpt |
| AASIST | no disponible en la informacion | no disponible | no disponible | no disponible | no disponible |
| RawNet2 | no disponible en la informacion | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos verificados de AASIST ni de RawNet2 en la informacion proporcionada; se citan como referencias habituales del benchmark ASVspoof 2019 LA, pero sus cifras concretas no estan disponibles aqui.

## Limitaciones y advertencias

- Generalizacion limitada: ASVspoof 2019 cubre un conjunto reducido de sistemas TTS y de conversion de voz; generadores mas recientes pueden degradar la precision de forma significativa.
- Dominio de audio restringido: la propia model card advierte de que musica, ruido y audio telefonico pueden reducir la precision.
- El resultado debe tratarse como una senal, no como una prueba: un falso positivo o un falso negativo no permite concluir por si solo sobre la autenticidad de una grabacion.
- Licencia research-only: prohibido el uso comercial; los pesos se publican bajo los terminos de los datos de entrenamiento (ASVspoof 2019 LA). El base wav2vec 2.0 XLS-R es Apache-2.0, pero esa licencia no se extiende al modelo afinado.
- Idioma: no se declaran idiomas soportados; el corpus de entrenamiento es en ingles, por lo que el rendimiento en castellano u otros idiomas no esta documentado.
- Riesgo de alucinacion no aplica en sentido estricto (es un clasificador), pero si existe riesgo de clasificacion erronea con alta confianza aparente.
- Umbral de decision: la eleccion del umbral es critica y depende del codigo del repositorio; no se publican curvas de calibracion en la informacion disponible.
- Sin metricas publicadas para la variante wav2vec 2.0, lo que impide comparar su rendimiento real frente a la CNN.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso ni de validacion externa por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Ceendi/deepfake-audio-detector
- Repositorio del proyecto: https://github.com/Ceendi/Deepfake-Detector
- Modelo base: https://huggingface.co/facebook/wav2vec2-xls-r-300m
- Corpus de entrenamiento (ASVspoof 2019): no disponible en la informacion proporcionada
- Papers, blogs y demos adicionales: no disponibles en la informacion proporcionada
