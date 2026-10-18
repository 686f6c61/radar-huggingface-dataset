# Allinsama/vokra__dnsmos-p808-p835

## Resumen

`dnsmos-p808-p835` es un modelo de evaluación perceptual de calidad de voz (no un modelo de lenguaje) empaquetado en formato GGUF para Vokra, un runtime de inferencia de audio "zero-dependency" desarrollado por ayutaz. No se trata de un modelo nuevo: es una conversión de los pesos upstream de DNSMOS (Deep Noise Suppression Mean Opinion Score) de Microsoft, publicada por el usuario Allinsama bajo identificador `Allinsama/vokra__dnsmos-p808-p835`. El artefacto contiene 38 tensores y 342.212 parámetros totales, con un fichero GGUF de 1,3 MB.

Su función es estimar de forma no intrusiva (sin señal de referencia limpia) dos puntuaciones de calidad de voz: la MOS derivada de la recomendación ITU-T P.808 y las tres puntuaciones de P.835 (señal, ruido de fondo y reverberación global). Esto lo hace útil para clasificar supresores de ruido, filtrar datasets de voz y monitorizar calidad en pipelines de audio, tareas en las que una métrica objetiva correlacionada con evaluación subjetiva humana sustituye a costosos paneles de oyentes.

La relevancia ahora es de infraestructura: el modelo queda disponible como un único fichero GGUF mapeable en memoria por Vokra, lo que elimina la dependencia de frameworks pesados (PyTorch/ONNX) para ejecutar la métrica en producción. Al ser un modelo de 342 mil parámetros (tres órdenes de magnitud por debajo de un LLM pequeño), su coste computacional es despreciable y puede correr en CPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `dnsmos` (red neuronal de evaluación perceptual de calidad de voz, no intrusiva; familia DNSMOS de Microsoft) |
| Parametros totales | 342.212 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; procesa segmentos de audio, no secuencias de texto (duracion de ventana no disponible) |
| Tipos de cuantizacion | un unico fichero GGUF sin niveles de cuantizacion declarados; el tamano (1,3 MB) es coherente con pesos en float32 (342.212 x 4 bytes ≈ 1,37 MB) |
| Idiomas soportados | no disponible (modelo agnostico al idioma: evalua calidad acustica de la senal de voz) |
| Licencia | MIT (sin cambios respecto al upstream) |
| Formato de pesos | GGUF (esquema Vokra GGUF v1) |
| Tensores | 38 |
| Tamano del fichero | 1,3 MB (`dnsmos-p808-p835.gguf`) |
| SHA-256 | `b13c264f26a83b92d27f4385332e69e426f3301d2e48de7732c2aa9355650b2d` |
| Entrada / salida | audio WAV como entrada; puntuaciones MOS (P.808 y P.835) como salida |
| Runtime | Vokra (`vokra-cli`) |
| Modelo upstream | microsoft/DNS-Challenge/DNSMOS (MIT) |
| Herramienta de conversion | vokra-core 0.1.0-alpha.0 |
| Registro / ID de modelo | `dnsmos-p808-p835` |
| Descargas en HuggingFace | 7 |

## Arquitectura y entrenamiento

La arquitectura declarada en los metadatos del artefacto es `dnsmos`, correspondiente a la familia DNSMOS de Microsoft: un estimador no intrusivo que predice puntuaciones subjectivas MOS a partir de la señal degradada, sin necesidad de la referencia limpia. El repositorio no incluye detalles sobre el número de capas, tipos de capa, función de pérdida ni el conjunto exacto de datos de entrenamiento; esa información pertenece al proyecto upstream microsoft/DNS-Challenge. Los pesos se distribuyen sin reentrenamiento ni ajuste: la conversión únicamente reempaqueta los tensores originales (38 tensores) para que el runtime de Vokra pueda mapearlos directamente en memoria.

Según la literatura upstream referenciada, DNSMOS se entrena con un enfoque de autoaprendizaje multi-etapa ("multi-stage self-teaching") para mejorar la correlación con las puntuaciones subjectivas de ITU-T P.808, y la variante P.835 descompone la calidad en tres ejes (señal de voz, ruido de fondo y reverberación). No se dispone de datos sobre número de tokens/horas de audio, composición del dataset, ni sobre si hubo etapas de RLHF/DPO (no aplicables en un modelo de regresión de calidad). Tampoco se documenta en la información disponible ninguna innovación de inferencia (decodificación especulativa, atención lineal, etc.), algo esperable dado el tamaño y la naturaleza del modelo.

## Capacidades

- Estimación no intrusiva de calidad de voz: predice MOS a partir de audio degradado sin referencia limpia.
- Puntuación P.808: una única MOS global alineada con la evaluación subjectiva ITU-T Rec. P.808.
- Puntuación P.835: desglose en calidad de señal (SIG), ruido de fondo (BAK) y reverberación (OVRL).
- Clasificación y ordenación (stack ranking) de sistemas de supresión de ruido o mejora de voz.
- Evaluación automática de datasets de audio: filtrado por umbral de calidad antes de entrenar ASR o TTS.
- Ejecución sobre ficheros WAV mediante CLI (`vokra-cli run --model ... --input input.wav`).
- Portabilidad: fichero GGUF único, descargable con cualquier cliente HTTP y mapeable en memoria.
- No soporta generación de texto, razonamiento, código, visión, tool calling ni comportamiento de agente; no es un LLM.
- Capacidades multilingües: no disponibles como tales; la métrica es independiente del idioma al operar sobre características acústicas.

## Casos de uso

- Evaluación de pipelines de supresión de ruido: medir P.808 y P.835 antes y después del denoiser sobre el mismo conjunto de audios para cuantificar la mejora y detectar configuraciones que degradan la señal de voz.
- Control de calidad en datasets de entrenamiento de ASR/TTS: puntuar cada clip y descartar los que caigan por debajo de un umbral de MOS, reduciendo ruido de etiquetado en el corpus.
- Monitorización de calidad en producción de VoIP o videoconferencia: ejecutar la métrica sobre muestras de llamadas para detectar regresiones de red o de códec antes de que las reporte el usuario.
- Selección automática de modelo de mejora de voz en un producto: comparar variantes (por codec, por tasa de bits, por modelo de denoising) con una métrica objetiva reproducible en lugar de escuchas manuales.
- Evaluación de codecs y cadenas de transmisión: estimar la calidad percibida tras comprimir/descomprimir audio en distintos bitrates para elegir configuración.
- QA en pipelines de doblaje, podcast o grabación: filtrar episodios o tomas con reverberación excesiva o ruido de fondo alto usando el desglose P.835.
- Integración en CI/CD de audio: ejecutar la métrica como test de regresión tras cambios en el procesado de señal, con umbrales que rompan la build si la MOS cae.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del artefacto no incluye tablas comparativas ni correlaciones numéricas; únicamente referencia los artículos upstream sobre DNSMOS y P.835, que reportan la correlación de la métrica con evaluaciones subjectivas, pero sin cifras en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: practicamente nula; el fichero completo ocupa 1,3 MB, por lo que cabe en cualquier GPU consumer (y en memoria de sistema).
- GPU recomendadas: no requiere GPU. Cualquier GPU (RTX 4090, A100, H100) es sobredimensionada para 342.212 parametros; la ejecución relevante es en CPU.
- Cabe en consumer GPU: si, en todas; también en Raspberry Pi o entornos embebidos por tamano.
- Opciones de despliegue: runtime Vokra (`vokra-cli`) como via oficial; al ser un GGUF plano puede descargarse con `curl` y servirse desde cualquier almacenamiento HTTP. vLLM, TGI y Ollama no son aplicables (no es un modelo generativo de texto); llama.cpp tampoco está soportado por la model card, que solo documenta Vokra.
- Latencia y throughput: no disponibles. Por el tamano del modelo y la naturaleza de la tarea (ventanas cortas de audio) se espera que el coste dominante sea la carga del WAV y el preprocesado, no la red neuronal, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo de metrica | Referencia necesaria | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dnsmos-p808-p835 (Vokra GGUF) | 342.212 | MOS no intrusiva (P.808 y P.835) | No | MIT | GGUF via Vokra |
| DNSMOS upstream (microsoft/DNS-Challenge) | no disponible en la informacion | MOS no intrusiva (P.808) | No | MIT | Pesos en el repo DNS-Challenge (formato no disponible en la informacion) |
| PESQ / POLQA (ITU-T) | no aplica (algoritmico) | MOS intrusiva | Si | Propietaria / licencia ITU | Implementaciones comerciales y de referencia |
| NISQA | no disponible en la informacion | MOS no intrusiva | No | no disponible en la informacion | Repositorio academico |

Las cifras de rendimiento comparado (correlacion con MOS subjectiva) no estan disponibles en la informacion proporcionada, por lo que no se puede establecer un ranking cuantitativo entre estas alternativas.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no soporta tool calling ni agentes. Cualquier uso esperado como LLM es un error de categoría.
- Es una conversión, no un modelo nuevo: los pesos, la licencia y las obligaciones legales corresponden al autor upstream (microsoft/DNS-Challenge); la atribución debe dirigirse allí.
- La model card no documenta sesgos, dominios de entrenamiento ni cobertura de idiomas, ruidos o codecs; el comportamiento fuera de la distribución de entrenamiento (musica, audio no vocal, habla sintetica) es desconocido.
- Riesgo de alucinacion en sentido estricto no aplica, pero sí riesgo de puntuaciones espurias: la metrica puede sobreestimar o infravalorar calidad en condiciones no representadas (volumen extremo, clipping, multiples hablantes).
- Incertidumbre sobre la ventana de audio: la informacion no especifica la duracion de segmento esperada; evaluar audios muy largos requerira troceado, con el sesgo que ello introduzca.
- Ambiguedad de identificadores: el ID del repositorio es `Allinsama/vokra__dnsmos-p808-p835`, mientras que la URL de descarga de la model card apunta a `vokra/dnsmos-p808-p835`. Conviene verificar que el artefacto descargado coincide con el SHA-256 indicado.
- Fecha de creacion del repositorio anomala (2026-10-18), lo que sugiere metadatos no fiables; tratar otros campos con cautela.
- Licencia MIT permite uso comercial y modificacion con atribucion y sin garantia; no hay restricciones adicionales declaradas, pero la ausencia de garantia es relevante en produccion.
- Madurez baja: 7 descargas, 0 likes, runtime en version `0.1.0-alpha.0` y esquema GGUF v1; no hay evidencia de uso en produccion ni de soporte a largo plazo.
- El repositorio upstream de Vokra enlazado en la model card (github.com/ayutaz/vokra) y la documentacion de vokra.ai deben revisarse para confirmar compatibilidad de versiones del esquema.

## Enlaces

- HuggingFace (repo indicado): https://huggingface.co/Allinsama/vokra__dnsmos-p808-p835
- HuggingFace (repo referenciado en la model card): https://huggingface.co/vokra/dnsmos-p808-p835
- Perfil del autor: https://huggingface.co/Allinsama
- Runtime Vokra (GitHub): https://github.com/ayutaz/vokra
- Documentacion de Vokra: https://vokra.ai/docs/concepts/agents
- Upstream DNS-Challenge (Microsoft): https://github.com/microsoft/DNS-Challenge
- Paper DNSMOS (arXiv): https://arxiv.org/pdf/2010.15258
- Paper DNSMOS P.835 (arXiv): https://arxiv.org/abs/2110.01763
